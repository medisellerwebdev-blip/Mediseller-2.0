from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Depends, Request, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import base64
import certifi
import ssl
import shutil
from fastapi.staticfiles import StaticFiles
# Load environment variables
load_dotenv()


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
ca = certifi.where()

# Mock MongoDB for local development
class MockCursor:
    def __init__(self, data):
        self._data = data
        self._skip = 0
        self._limit = len(data)

    def skip(self, n):
        self._skip = n
        return self

    def limit(self, n):
        self._limit = n
        return self

    def sort(self, *args, **kwargs):
        return self

    async def to_list(self, length):
        data = self._data[self._skip:]
        return data[:min(length, self._limit)]
    
    def __aiter__(self):
        self._idx = self._skip
        return self
    
    async def __anext__(self):
        if self._idx < len(self._data) and self._idx < self._skip + self._limit:
            val = self._data[self._idx]
            self._idx += 1
            return val
        raise StopAsyncIteration

class MockCollection:
    def __init__(self):
        self._data = []

    def find(self, query=None, projection=None):
        return MockCursor(self._data)

    async def find_one(self, query, projection=None):
        return self._data[0] if self._data else None

    async def count_documents(self, query):
        return len(self._data)

    async def insert_one(self, doc):
        if "_id" not in doc: doc["_id"] = str(uuid.uuid4())
        self._data.append(doc)
        return type('obj', (), {'inserted_id': doc["_id"]})

    async def insert_many(self, docs):
        for d in docs: await self.insert_one(d)
        return docs

    async def update_one(self, query, update, upsert=False):
        return type('obj', (), {'modified_count': 1})

    async def delete_one(self, query):
        return type('obj', (), {'deleted_count': 1})

    def aggregate(self, pipeline):
        # Basic mock for categories grouping
        if pipeline and any("$group" in step for step in pipeline):
            counts = {}
            for d in self._data:
                cat = d.get("category", "Unknown")
                counts[cat] = counts.get(cat, 0) + 1
            results = [{"_id": k, "count": v} for k, v in counts.items()]
            return MockCursor(results)
        return MockCursor(self._data)

class MockDB:
    def __init__(self):
        self.products = MockCollection()
        self.testimonials = MockCollection()
        self.status_checks = MockCollection()
        self.carts = MockCollection()
        self.orders = MockCollection()
        self.users = MockCollection()
        self.user_sessions = MockCollection()
        self.prescriptions = MockCollection()
        self.consultations = MockCollection()
        self.site_config = MockCollection()

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
USE_MOCK_DB = os.environ.get('USE_MOCK_DB', 'False').lower() == 'true'

if USE_MOCK_DB:
    logger.info("Using MockDB for local development")
    db = MockDB()
else:
    try:
        mongo_url = os.environ.get('MONGO_URL', '')
        mongo_client = AsyncIOMotorClient(
            mongo_url, 
            tlsAllowInvalidCertificates=True,
            tlsAllowInvalidHostnames=True,
            serverSelectionTimeoutMS=10000
        )
        db = mongo_client[os.environ.get('DB_NAME', 'mediseller_v2')]
    except Exception as e:
        logger.warning(f"Failed to connect to MongoDB, falling back to MockDB: {e}")
        db = MockDB()
# Admin Credentials (Initial/Default)
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@mediseller.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'MediSeller#Admin@2026')
ADMIN_SESSION_TOKEN = f"admin_{uuid.uuid4().hex[:16]}"

# Create the main app
app = FastAPI(title="MediSeller API", description="Online Pharmacy API")

@app.get("/api/test-db")
async def test_db_connection():
    try:
        url = os.environ.get('MONGO_URL', '')
        client = AsyncIOMotorClient(
            url, 
            tlsAllowInvalidCertificates=True,
            tlsAllowInvalidHostnames=True,
            serverSelectionTimeoutMS=5000
        )
        # Ping the server
        await client.admin.command('ping')
        return {"status": "success", "message": "Connected successfully to MongoDB Atlas!"}
    except Exception as e:
        query_string = url.split('?')[1] if '?' in url else "None"
        return {
            "status": "error", 
            "message": str(e), 
            "query_parameters": query_string,
            "url_preview": url[:20] + "..." + url[-10:] if url else "None"
        }

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://mediseller-2-website.web.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# =========================
# MODELS
# =========================

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Product Models
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    product_id: str = Field(default_factory=lambda: f"prod_{uuid.uuid4().hex[:12]}")
    name: str
    generic_name: str
    brand: str
    category: str
    subcategory: Optional[str] = None
    description: str
    dosage: str
    form: str  # tablet, capsule, injection, etc.
    quantity_per_pack: int
    price: float
    original_price: float
    discount_percentage: int
    manufacturer: str
    requires_prescription: bool = True
    in_stock: bool = True
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    generic_name: str
    brand: str
    category: str
    subcategory: Optional[str] = None
    description: str
    dosage: str
    form: str
    quantity_per_pack: int
    price: float
    original_price: float
    discount_percentage: int
    manufacturer: str
    requires_prescription: bool = True
    in_stock: bool = True
    image_url: Optional[str] = None

# User Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str = Field(default_factory=lambda: f"user_{uuid.uuid4().hex[:12]}")
    email: str
    name: str
    picture: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[dict] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    session_id: str = Field(default_factory=lambda: f"sess_{uuid.uuid4().hex[:16]}")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Cart Models
class CartItem(BaseModel):
    product_id: str
    quantity: int
    price: float

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    cart_id: str = Field(default_factory=lambda: f"cart_{uuid.uuid4().hex[:12]}")
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    items: List[CartItem] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AddToCartRequest(BaseModel):
    product_id: str
    quantity: int = 1
    session_id: Optional[str] = None

# Order Models
class OrderItem(BaseModel):
    product_id: str
    name: str
    quantity: int
    price: float
    dosage: str

class ShippingAddress(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    country: str
    postal_code: str

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    order_id: str = Field(default_factory=lambda: f"ORD{uuid.uuid4().hex[:8].upper()}")
    user_id: Optional[str] = None
    guest_email: Optional[str] = None
    items: List[OrderItem]
    shipping_address: ShippingAddress
    subtotal: float
    shipping_cost: float = 15.00
    total: float
    status: str = "pending"
    prescription_id: Optional[str] = None
    payment_status: str = "pending"
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    items: List[OrderItem]
    shipping_address: ShippingAddress
    prescription_id: Optional[str] = None
    notes: Optional[str] = None

# Prescription Models
class Prescription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    prescription_id: str = Field(default_factory=lambda: f"rx_{uuid.uuid4().hex[:12]}")
    user_id: Optional[str] = None
    guest_email: Optional[str] = None
    file_name: str
    file_data: str  # base64 encoded
    file_type: str
    status: str = "pending"  # pending, approved, rejected
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PrescriptionUploadRequest(BaseModel):
    file_name: str
    file_data: str
    file_type: str
    guest_email: Optional[str] = None

# Testimonial Models
class Testimonial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    testimonial_id: str = Field(default_factory=lambda: f"test_{uuid.uuid4().hex[:8]}")
    name: str
    country: str
    rating: int
    comment: str
    avatar_url: Optional[str] = None
    verified: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Site Config Models
class NavItem(BaseModel):
    label: str
    path: str

class HeaderConfig(BaseModel):
    logo_text: str = "MediSeller"
    logo_url: Optional[str] = None
    nav_items: List[NavItem] = []

class ButtonConfig(BaseModel):
    text: str
    path: str

class HeroConfig(BaseModel):
    badge: str = "45+ Years of Heritage"
    title: str = "Global Access to Authentic Medicine"
    subtitle: str = "Secure 100% original generic medications from India. Save over 60% with insured delivery to 30+ countries. Trusted by patients worldwide for nearly half a century."
    primary_cta: ButtonConfig
    secondary_cta: ButtonConfig
    image_url: str = "https://images.unsplash.com/photo-1576091358783-a212ec293ff3?w=800"
    background_image_url: Optional[str] = None
    patients_count: str = "150K+"
    rating: float = 4.9
    trust_avatars: List[str] = []
    floating_card_title: str = "100% Authentic"
    floating_card_subtitle: str = "Verified Products"
    floating_card_icon: str = "CheckCircle"
    savings_badge_percentage: str = "60%"
    savings_badge_text: str = "Average Savings"

class StatItem(BaseModel):
    value: str
    label: str

class StatsConfig(BaseModel):
    items: List[StatItem]

class CategoryCard(BaseModel):
    id: str = Field(default_factory=lambda: f"cat_{uuid.uuid4().hex[:6]}")
    title: str
    subtitle: str
    icon_name: str
    color_class: str = "from-primary/10 to-primary/5"
    path: str

class CategoriesConfig(BaseModel):
    badge: str = "Browse by Category"
    title: str = "Life-Saving & Lifestyle Medications"
    subtitle: str = "We specialize in affordable generic medications for serious health conditions. All products are sourced from licensed manufacturers."
    cards: List[CategoryCard] = []

class SiteConfig(BaseModel):
    model_config = ConfigDict(extra="ignore")
    active: bool = True
    header: HeaderConfig
    hero: HeroConfig
    stats: StatsConfig
    categories_section: CategoriesConfig
    favicon_url: Optional[str] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Contact/Inquiry Models
class Inquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    inquiry_id: str = Field(default_factory=lambda: f"inq_{uuid.uuid4().hex[:8]}")
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str
    status: str = "new"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InquiryCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str

# Expert Consultation Models
class ConsultationRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    consultation_id: str = Field(default_factory=lambda: f"cons_{uuid.uuid4().hex[:8]}")
    name: str
    email: EmailStr
    phone: str
    medication_query: str
    preferred_contact: str = "whatsapp"
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ConsultationCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    medication_query: str
    preferred_contact: str = "whatsapp"

# =========================
# AUTH HELPERS
# =========================

async def get_current_user(request: Request) -> Optional[User]:
    """Get current user from session token cookie or auth header"""
    session_token = request.cookies.get("session_token")
    
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        return None
    
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        return None
    
    expires_at = session_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        return None
    
    return User(**user_doc)

async def get_optional_user(request: Request) -> Optional[User]:
    """Get user if authenticated, None otherwise (for optional auth)"""
    try:
        return await get_current_user(request)
    except Exception:
        return None

# =========================
# ROUTES - Status
# =========================

@api_router.get("/")
async def root():
    return {"message": "MediSeller API - Online Pharmacy Platform"}

# Site Configuration Routes
@api_router.get("/site-config")
async def get_site_config():
    config = await db.site_config.find_one({"active": True})
    if not config:
        # Fallback to an empty but valid config if seeding hasn't happened
        return {
            "header": {"logo_text": "MediSeller", "nav_items": []}, 
            "hero": {
                "badge": "", "title": "Welcome", "subtitle": "", 
                "primary_cta": {"label": "Browse", "path": "/products"},
                "secondary_cta": {"label": "Consult", "path": "/consultation"},
                "image_url": "", "patients_count": "", "rating": 0,
                "floating_card_title": "", "floating_card_subtitle": "",
                "savings_badge_percentage": "", "savings_badge_text": ""
            }
        }
    # Convert _id if present
    if "_id" in config: config["_id"] = str(config["_id"])
    return config



@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

@api_router.get("/test-db")
async def test_db_connection():
    try:
        await client.admin.command('ping')
        return {"status": "success", "message": "Connected to MongoDB Atlas"}
    except Exception as e:
        logger.error(f"MongoDB Connection Error: {e}")
        return {"status": "error", "message": str(e)}

# =========================
# ROUTES - Auth (Emergent Google OAuth)
# =========================
# REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

@api_router.post("/auth/session")
async def exchange_session(request: Request, response: Response):
    """Exchange session_id for session_token and user data"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
    
    # Call Emergent Auth to get session data
    async with httpx.AsyncClient() as client_http:
        auth_response = await client_http.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        
        if auth_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        session_data = auth_response.json()
    
    email = session_data.get("email")
    name = session_data.get("name")
    picture = session_data.get("picture")
    session_token = session_data.get("session_token")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user data if needed
        await db.users.update_one(
            {"email": email},
            {"$set": {"name": name, "picture": picture}}
        )
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    # Store session
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user_doc

@api_router.get("/auth/me")
async def get_me(request: Request):
    """Get current authenticated user"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user.model_dump()

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user and clear session"""
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

# =========================
# ROUTES - Products
# =========================

@api_router.get("/products", response_model=List[dict])
async def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    in_stock: Optional[bool] = None,
    limit: int = 100,
    skip: int = 0
):
    """Get products with optional filters"""
    query = {}
    
    if category:
        query["category"] = category
    if in_stock is not None:
        query["in_stock"] = in_stock
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"generic_name": {"$regex": search, "$options": "i"}},
            {"brand": {"$regex": search, "$options": "i"}}
        ]
    
    products = await db.products.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    return products

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    """Get single product by ID"""
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.get("/categories")
async def get_categories():
    """Get all product categories with counts"""
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    categories = await db.products.aggregate(pipeline).to_list(100)
    return [{"name": cat["_id"], "count": cat["count"]} for cat in categories]

@api_router.get("/featured-products", response_model=List[dict])
async def get_featured_products(limit: int = 8):
    """Get featured products (highest discount)"""
    products = await db.products.find(
        {"in_stock": True},
        {"_id": 0}
    ).sort("discount_percentage", -1).limit(limit).to_list(limit)
    return products

# =========================
# ROUTES - Cart
# =========================

@api_router.post("/cart/add")
async def add_to_cart(item: AddToCartRequest, request: Request):
    """Add item to cart"""
    user = await get_optional_user(request)
    user_id = user.user_id if user else None
    session_id = item.session_id
    
    # Find existing cart
    query = {}
    if user_id:
        query["user_id"] = user_id
    elif session_id:
        query["session_id"] = session_id
    else:
        # Create new session for guest
        session_id = f"guest_{uuid.uuid4().hex[:16]}"
    
    if query:
        cart_doc = await db.carts.find_one(query, {"_id": 0})
    else:
        cart_doc = None
    
    # Get product info
    product = await db.products.find_one({"product_id": item.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if cart_doc:
        # Update existing cart
        items = cart_doc.get("items", [])
        found = False
        for cart_item in items:
            if cart_item["product_id"] == item.product_id:
                cart_item["quantity"] += item.quantity
                found = True
                break
        
        if not found:
            items.append({
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price": product["price"]
            })
        
        await db.carts.update_one(
            query,
            {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        cart_doc["items"] = items
    else:
        # Create new cart
        cart_id = f"cart_{uuid.uuid4().hex[:12]}"
        cart_doc = {
            "cart_id": cart_id,
            "user_id": user_id,
            "session_id": session_id,
            "items": [{
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price": product["price"]
            }],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.carts.insert_one(cart_doc)
        if "_id" in cart_doc:
            del cart_doc["_id"]
    
    return {"cart": cart_doc, "session_id": session_id or cart_doc.get("session_id")}

# =========================
# ROUTES - Admin
# =========================

class AdminLoginRequest(BaseModel):
    email: str
    password: str

@api_router.post("/admin/login")
async def admin_login(data: AdminLoginRequest, response: Response):
    """Admin login with email/password"""
    if data.email == ADMIN_EMAIL and data.password == ADMIN_PASSWORD:
        # For simplicity in local dev, we use a fixed token or session
        response.set_cookie(
            key="admin_session",
            value=ADMIN_SESSION_TOKEN,
            httponly=True,
            samesite="none",  # Required for cross-port local dev
            secure=True,      # Required when samesite="none"
            path="/",
            max_age=24 * 60 * 60
        )
        return {"success": True, "message": "Admin logged in successfully"}
    
    raise HTTPException(status_code=401, detail="Invalid admin credentials")

async def verify_admin(request: Request):
    """Dependency to verify admin session"""
    admin_session = request.cookies.get("admin_session")
    if admin_session != ADMIN_SESSION_TOKEN:
        raise HTTPException(status_code=403, detail="Admin access denied")
    return True

@api_router.get("/admin/verify")
async def verify_admin_token(is_admin: bool = Depends(verify_admin)):
    return {"is_admin": is_admin}

# Admin Product Management
@api_router.post("/admin/products", response_model=Product)
async def create_product(product: ProductCreate, is_admin: bool = Depends(verify_admin)):
    product_dict = product.model_dump()
    new_product = Product(**product_dict)
    doc = new_product.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.products.insert_one(doc)
    return new_product

@api_router.put("/admin/products/{product_id}")
async def update_product(product_id: str, product_data: dict, is_admin: bool = Depends(verify_admin)):
    if "_id" in product_data: del product_data["_id"]
    result = await db.products.update_one({"product_id": product_id}, {"$set": product_data})
    return {"success": True, "modified_count": 1}

@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, is_admin: bool = Depends(verify_admin)):
    await db.products.delete_one({"product_id": product_id})
    return {"success": True}

# Admin Order Management
@api_router.get("/admin/orders")
async def get_all_orders(is_admin: bool = Depends(verify_admin)):
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, data: dict, is_admin: bool = Depends(verify_admin)):
    status = data.get("status")
    if not status: raise HTTPException(status_code=400, detail="Status required")
    await db.orders.update_one({"order_id": order_id}, {"$set": {"status": status}})
    return {"success": True}

@api_router.get("/cart")
async def get_cart(session_id: Optional[str] = None, request: Request = None):
    """Get cart contents"""
    user = await get_optional_user(request) if request else None
    
    query = {}
    if user:
        query["user_id"] = user.user_id
    elif session_id:
        query["session_id"] = session_id
    else:
        return {"items": [], "total": 0}
    
    cart_doc = await db.carts.find_one(query, {"_id": 0})
    
    if not cart_doc:
        return {"items": [], "total": 0}
    
    # Enrich with product details
    enriched_items = []
    total = 0
    
    for item in cart_doc.get("items", []):
        product = await db.products.find_one({"product_id": item["product_id"]}, {"_id": 0})
        if product:
            enriched_items.append({
                **item,
                "name": product["name"],
                "brand": product["brand"],
                "dosage": product["dosage"],
                "image_url": product.get("image_url"),
                "requires_prescription": product.get("requires_prescription", True)
            })
            total += item["price"] * item["quantity"]
    
    return {
        "cart_id": cart_doc.get("cart_id"),
        "items": enriched_items,
        "total": round(total, 2),
        "session_id": cart_doc.get("session_id")
    }

@api_router.put("/cart/update")
async def update_cart_item(
    product_id: str,
    quantity: int,
    session_id: Optional[str] = None,
    request: Request = None
):
    """Update cart item quantity"""
    user = await get_optional_user(request) if request else None
    
    query = {}
    if user:
        query["user_id"] = user.user_id
    elif session_id:
        query["session_id"] = session_id
    else:
        raise HTTPException(status_code=400, detail="Session ID required")
    
    cart_doc = await db.carts.find_one(query, {"_id": 0})
    if not cart_doc:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = cart_doc.get("items", [])
    
    if quantity <= 0:
        items = [i for i in items if i["product_id"] != product_id]
    else:
        for item in items:
            if item["product_id"] == product_id:
                item["quantity"] = quantity
                break
    
    await db.carts.update_one(
        query,
        {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Cart updated"}

@api_router.delete("/cart/clear")
async def clear_cart(session_id: Optional[str] = None, request: Request = None):
    """Clear cart"""
    user = await get_optional_user(request) if request else None
    
    query = {}
    if user:
        query["user_id"] = user.user_id
    elif session_id:
        query["session_id"] = session_id
    else:
        return {"message": "No cart to clear"}
    
    await db.carts.delete_one(query)
    return {"message": "Cart cleared"}

# =========================
# ROUTES - Orders
# =========================

@api_router.post("/orders")
async def create_order(order_data: OrderCreate, request: Request):
    """Create new order (guest or authenticated)"""
    user = await get_optional_user(request)
    
    # Calculate totals
    subtotal = sum(item.price * item.quantity for item in order_data.items)
    shipping_cost = 15.00
    total = subtotal + shipping_cost
    
    order = Order(
        user_id=user.user_id if user else None,
        guest_email=order_data.shipping_address.email if not user else None,
        items=[item.model_dump() for item in order_data.items],
        shipping_address=order_data.shipping_address.model_dump(),
        subtotal=round(subtotal, 2),
        shipping_cost=shipping_cost,
        total=round(total, 2),
        prescription_id=order_data.prescription_id,
        notes=order_data.notes
    )
    
    order_doc = order.model_dump()
    order_doc["created_at"] = order_doc["created_at"].isoformat()
    
    await db.orders.insert_one(order_doc)
    if "_id" in order_doc:
        del order_doc["_id"]
    
    return order_doc

@api_router.get("/orders")
async def get_orders(request: Request):
    """Get user's orders"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    orders = await db.orders.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, email: Optional[str] = None, request: Request = None):
    """Get order by ID (authenticated user or guest with email)"""
    user = await get_optional_user(request) if request else None
    
    query = {"order_id": order_id}
    if user:
        query["user_id"] = user.user_id
    elif email:
        query["guest_email"] = email
    
    order = await db.orders.find_one(query, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order

# =========================
# ROUTES - Prescriptions
# =========================

@api_router.post("/prescriptions/upload")
async def upload_prescription(data: PrescriptionUploadRequest, request: Request):
    """Upload prescription"""
    user = await get_optional_user(request)
    
    prescription = Prescription(
        user_id=user.user_id if user else None,
        guest_email=data.guest_email if not user else None,
        file_name=data.file_name,
        file_data=data.file_data,
        file_type=data.file_type
    )
    
    prescription_doc = prescription.model_dump()
    prescription_doc["created_at"] = prescription_doc["created_at"].isoformat()
    
    await db.prescriptions.insert_one(prescription_doc)
    
    return {
        "prescription_id": prescription.prescription_id,
        "status": prescription.status,
        "message": "Prescription uploaded successfully"
    }

@api_router.get("/prescriptions")
async def get_prescriptions(request: Request):
    """Get user's prescriptions"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    prescriptions = await db.prescriptions.find(
        {"user_id": user.user_id},
        {"_id": 0, "file_data": 0}  # Exclude file data for listing
    ).sort("created_at", -1).to_list(100)
    
    return prescriptions

# =========================
# ROUTES - Testimonials
# =========================

@api_router.get("/testimonials", response_model=List[dict])
async def get_testimonials(limit: int = 10):
    """Get customer testimonials"""
    testimonials = await db.testimonials.find(
        {"verified": True},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    return testimonials

# =========================
# ROUTES - Contact/Inquiry
# =========================

@api_router.post("/inquiries")
async def create_inquiry(inquiry: InquiryCreate):
    """Submit contact inquiry"""
    inquiry_obj = Inquiry(**inquiry.model_dump())
    inquiry_doc = inquiry_obj.model_dump()
    inquiry_doc["created_at"] = inquiry_doc["created_at"].isoformat()
    
    await db.inquiries.insert_one(inquiry_doc)
    
    return {
        "inquiry_id": inquiry_obj.inquiry_id,
        "message": "Your inquiry has been submitted. We'll get back to you shortly."
    }

# =========================
# ROUTES - Expert Consultation
# =========================

@api_router.post("/consultations")
async def request_consultation(consultation: ConsultationCreate):
    """Request expert consultation"""
    consultation_obj = ConsultationRequest(**consultation.model_dump())
    consultation_doc = consultation_obj.model_dump()
    consultation_doc["created_at"] = consultation_doc["created_at"].isoformat()
    
    await db.consultations.insert_one(consultation_doc)
    
    return {
        "consultation_id": consultation_obj.consultation_id,
        "message": "Consultation request submitted. Our expert will contact you soon."
    }

# =========================
# ROUTES - Site Config
# =========================

@api_router.get("/site-config")
async def get_site_config():
    """Get public site configuration"""
    config = await db.site_config.find_one({"active": True}, {"_id": 0})
    if not config:
        return None
    return config

@api_router.post("/admin/site-config")
async def update_site_config(config: SiteConfig, is_admin: bool = Depends(verify_admin)):
    """Update site configuration (Admin only)"""
    config_dict = config.model_dump()
    config_dict["active"] = True
    config_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.site_config.update_one(
        {"active": True}, 
        {"$set": config_dict},
        upsert=True
    )
    return {"message": "Site configuration updated successfully", "config": config_dict}

# =========================
# SEED DATA
# =========================

@api_router.post("/seed")
async def seed_database():
    """Seed database with initial data"""
    
    # Check if already seeded
    existing_products = await db.products.count_documents({})
    if existing_products > 0:
        return {"message": "Database already seeded", "products": existing_products}
    
    # Categories and their products
    products_data = []
    
    # CANCER MEDICATIONS (20)
    cancer_meds = [
        {"name": "Gleevec", "generic_name": "Imatinib Mesylate", "brand": "Novartis", "dosage": "400mg", "price": 45.00, "original_price": 2850.00, "discount": 98, "desc": "Treatment for chronic myeloid leukemia (CML) and gastrointestinal stromal tumors (GIST)"},
        {"name": "Revlimid", "generic_name": "Lenalidomide", "brand": "Celgene", "dosage": "25mg", "price": 85.00, "original_price": 890.00, "discount": 90, "desc": "Treatment for multiple myeloma and myelodysplastic syndromes"},
        {"name": "Ibrutinib", "generic_name": "Imbruvica", "brand": "Pharmacyclics", "dosage": "140mg", "price": 120.00, "original_price": 1200.00, "discount": 90, "desc": "Treatment for chronic lymphocytic leukemia and mantle cell lymphoma"},
        {"name": "Tarceva", "generic_name": "Erlotinib", "brand": "Roche", "dosage": "150mg", "price": 55.00, "original_price": 450.00, "discount": 88, "desc": "Treatment for non-small cell lung cancer and pancreatic cancer"},
        {"name": "Xeloda", "generic_name": "Capecitabine", "brand": "Roche", "dosage": "500mg", "price": 25.00, "original_price": 180.00, "discount": 86, "desc": "Treatment for breast cancer and colorectal cancer"},
        {"name": "Nexavar", "generic_name": "Sorafenib", "brand": "Bayer", "dosage": "200mg", "price": 95.00, "original_price": 750.00, "discount": 87, "desc": "Treatment for liver, kidney, and thyroid cancer"},
        {"name": "Afinitor", "generic_name": "Everolimus", "brand": "Novartis", "dosage": "10mg", "price": 75.00, "original_price": 620.00, "discount": 88, "desc": "Treatment for advanced kidney cancer and neuroendocrine tumors"},
        {"name": "Sprycel", "generic_name": "Dasatinib", "brand": "Bristol-Myers", "dosage": "100mg", "price": 88.00, "original_price": 890.00, "discount": 90, "desc": "Treatment for chronic myeloid leukemia (CML)"},
        {"name": "Votrient", "generic_name": "Pazopanib", "brand": "GSK", "dosage": "400mg", "price": 65.00, "original_price": 520.00, "discount": 87, "desc": "Treatment for advanced renal cell carcinoma and soft tissue sarcoma"},
        {"name": "Sutent", "generic_name": "Sunitinib", "brand": "Pfizer", "dosage": "50mg", "price": 110.00, "original_price": 950.00, "discount": 88, "desc": "Treatment for kidney cancer and GIST"},
        {"name": "Xtandi", "generic_name": "Enzalutamide", "brand": "Astellas", "dosage": "40mg", "price": 95.00, "original_price": 850.00, "discount": 89, "desc": "Treatment for metastatic prostate cancer"},
        {"name": "Zytiga", "generic_name": "Abiraterone Acetate", "brand": "J&J", "dosage": "250mg", "price": 35.00, "original_price": 280.00, "discount": 87, "desc": "Treatment for metastatic castration-resistant prostate cancer"},
        {"name": "Tagrisso", "generic_name": "Osimertinib", "brand": "AstraZeneca", "dosage": "80mg", "price": 145.00, "original_price": 1500.00, "discount": 90, "desc": "Treatment for EGFR-mutated non-small cell lung cancer"},
        {"name": "Keytruda", "generic_name": "Pembrolizumab", "brand": "Merck", "dosage": "100mg", "price": 450.00, "original_price": 5200.00, "discount": 91, "desc": "Immunotherapy for various cancer types"},
        {"name": "Opdivo", "generic_name": "Nivolumab", "brand": "BMS", "dosage": "100mg", "price": 420.00, "original_price": 4800.00, "discount": 91, "desc": "Immunotherapy for melanoma, lung, and kidney cancer"},
        {"name": "Herceptin", "generic_name": "Trastuzumab", "brand": "Roche", "dosage": "440mg", "price": 380.00, "original_price": 3500.00, "discount": 89, "desc": "Treatment for HER2-positive breast and gastric cancer"},
        {"name": "Alecensa", "generic_name": "Alectinib", "brand": "Roche", "dosage": "150mg", "price": 125.00, "original_price": 1100.00, "discount": 89, "desc": "Treatment for ALK-positive non-small cell lung cancer"},
        {"name": "Lynparza", "generic_name": "Olaparib", "brand": "AstraZeneca", "dosage": "150mg", "price": 135.00, "original_price": 1250.00, "discount": 89, "desc": "Treatment for BRCA-mutated ovarian and breast cancer"},
        {"name": "Venclexta", "generic_name": "Venetoclax", "brand": "AbbVie", "dosage": "100mg", "price": 95.00, "original_price": 820.00, "discount": 88, "desc": "Treatment for chronic lymphocytic leukemia"},
        {"name": "Pomalyst", "generic_name": "Pomalidomide", "brand": "Celgene", "dosage": "4mg", "price": 110.00, "original_price": 980.00, "discount": 89, "desc": "Treatment for multiple myeloma"},
    ]
    
    for med in cancer_meds:
        products_data.append({
            "product_id": f"prod_{uuid.uuid4().hex[:12]}",
            "name": med["name"],
            "generic_name": med["generic_name"],
            "brand": med["brand"],
            "category": "Cancer",
            "description": med["desc"],
            "dosage": med["dosage"],
            "form": "Tablet",
            "quantity_per_pack": 30,
            "price": med["price"],
            "original_price": med["original_price"],
            "discount_percentage": med["discount"],
            "manufacturer": med["brand"],
            "requires_prescription": True,
            "in_stock": True,
            "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    # HIV MEDICATIONS (20)
    hiv_meds = [
        {"name": "Tenvir-EM", "generic_name": "Tenofovir + Emtricitabine", "brand": "Cipla", "dosage": "300mg/200mg", "price": 25.00, "original_price": 1800.00, "discount": 99, "desc": "Combination HIV prevention and treatment medication (PrEP)"},
        {"name": "Atripla", "generic_name": "Efavirenz/Emtricitabine/Tenofovir", "brand": "Gilead", "dosage": "600/200/300mg", "price": 35.00, "original_price": 2500.00, "discount": 99, "desc": "Complete single-tablet HIV treatment regimen"},
        {"name": "Truvada", "generic_name": "Emtricitabine/Tenofovir", "brand": "Gilead", "dosage": "200/300mg", "price": 28.00, "original_price": 1900.00, "discount": 99, "desc": "HIV prevention (PrEP) and treatment backbone"},
        {"name": "Biktarvy", "generic_name": "Bictegravir/Emtricitabine/TAF", "brand": "Gilead", "dosage": "50/200/25mg", "price": 55.00, "original_price": 3200.00, "discount": 98, "desc": "Complete single-tablet HIV-1 treatment"},
        {"name": "Descovy", "generic_name": "Emtricitabine/TAF", "brand": "Gilead", "dosage": "200/25mg", "price": 32.00, "original_price": 2100.00, "discount": 98, "desc": "HIV prevention and treatment with improved renal safety"},
        {"name": "Genvoya", "generic_name": "Elvitegravir/Cobicistat/FTC/TAF", "brand": "Gilead", "dosage": "150/150/200/10mg", "price": 48.00, "original_price": 3000.00, "discount": 98, "desc": "Complete single-tablet HIV treatment"},
        {"name": "Triumeq", "generic_name": "Dolutegravir/Abacavir/Lamivudine", "brand": "ViiV", "dosage": "50/600/300mg", "price": 45.00, "original_price": 2800.00, "discount": 98, "desc": "Once-daily complete HIV treatment"},
        {"name": "Dovato", "generic_name": "Dolutegravir/Lamivudine", "brand": "ViiV", "dosage": "50/300mg", "price": 38.00, "original_price": 2400.00, "discount": 98, "desc": "Two-drug complete HIV treatment regimen"},
        {"name": "Tivicay", "generic_name": "Dolutegravir", "brand": "ViiV", "dosage": "50mg", "price": 22.00, "original_price": 1500.00, "discount": 99, "desc": "Integrase inhibitor for HIV treatment"},
        {"name": "Isentress", "generic_name": "Raltegravir", "brand": "Merck", "dosage": "400mg", "price": 28.00, "original_price": 1200.00, "discount": 98, "desc": "First-in-class integrase inhibitor"},
        {"name": "Prezista", "generic_name": "Darunavir", "brand": "J&J", "dosage": "800mg", "price": 18.00, "original_price": 980.00, "discount": 98, "desc": "Protease inhibitor for HIV treatment"},
        {"name": "Kaletra", "generic_name": "Lopinavir/Ritonavir", "brand": "AbbVie", "dosage": "200/50mg", "price": 15.00, "original_price": 650.00, "discount": 98, "desc": "Boosted protease inhibitor combination"},
        {"name": "Epivir", "generic_name": "Lamivudine", "brand": "GSK", "dosage": "150mg", "price": 8.00, "original_price": 450.00, "discount": 98, "desc": "NRTI for HIV and hepatitis B treatment"},
        {"name": "Viread", "generic_name": "Tenofovir", "brand": "Gilead", "dosage": "300mg", "price": 12.00, "original_price": 980.00, "discount": 99, "desc": "NRTI backbone for HIV treatment"},
        {"name": "Sustiva", "generic_name": "Efavirenz", "brand": "BMS", "dosage": "600mg", "price": 10.00, "original_price": 720.00, "discount": 99, "desc": "NNRTI for HIV treatment"},
        {"name": "Edurant", "generic_name": "Rilpivirine", "brand": "J&J", "dosage": "25mg", "price": 15.00, "original_price": 850.00, "discount": 98, "desc": "NNRTI with improved tolerability"},
        {"name": "Selzentry", "generic_name": "Maraviroc", "brand": "Pfizer", "dosage": "300mg", "price": 35.00, "original_price": 1400.00, "discount": 97, "desc": "CCR5 antagonist for HIV treatment"},
        {"name": "Fuzeon", "generic_name": "Enfuvirtide", "brand": "Roche", "dosage": "90mg", "price": 180.00, "original_price": 2800.00, "discount": 94, "desc": "Fusion inhibitor for treatment-experienced patients"},
        {"name": "Cabenuva", "generic_name": "Cabotegravir/Rilpivirine", "brand": "ViiV", "dosage": "400/600mg", "price": 250.00, "original_price": 3500.00, "discount": 93, "desc": "Long-acting injectable HIV treatment"},
        {"name": "Rukobia", "generic_name": "Fostemsavir", "brand": "ViiV", "dosage": "600mg", "price": 85.00, "original_price": 1800.00, "discount": 95, "desc": "Attachment inhibitor for heavily treated patients"},
    ]
    
    for med in hiv_meds:
        products_data.append({
            "product_id": f"prod_{uuid.uuid4().hex[:12]}",
            "name": med["name"],
            "generic_name": med["generic_name"],
            "brand": med["brand"],
            "category": "HIV/AIDS",
            "description": med["desc"],
            "dosage": med["dosage"],
            "form": "Tablet",
            "quantity_per_pack": 30,
            "price": med["price"],
            "original_price": med["original_price"],
            "discount_percentage": med["discount"],
            "manufacturer": med["brand"],
            "requires_prescription": True,
            "in_stock": True,
            "image_url": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    # HEPATITIS MEDICATIONS (20)
    hepatitis_meds = [
        {"name": "Epclusa", "generic_name": "Sofosbuvir/Velpatasvir", "brand": "Gilead", "dosage": "400/100mg", "price": 65.00, "original_price": 26000.00, "discount": 99, "desc": "Pan-genotypic Hepatitis C treatment"},
        {"name": "Harvoni", "generic_name": "Ledipasvir/Sofosbuvir", "brand": "Gilead", "dosage": "90/400mg", "price": 75.00, "original_price": 31500.00, "discount": 99, "desc": "Complete Hepatitis C genotype 1 treatment"},
        {"name": "Sovaldi", "generic_name": "Sofosbuvir", "brand": "Gilead", "dosage": "400mg", "price": 45.00, "original_price": 28000.00, "discount": 99, "desc": "NS5B polymerase inhibitor for HCV"},
        {"name": "Mavyret", "generic_name": "Glecaprevir/Pibrentasvir", "brand": "AbbVie", "dosage": "100/40mg", "price": 85.00, "original_price": 13200.00, "discount": 99, "desc": "8-week pan-genotypic HCV treatment"},
        {"name": "Zepatier", "generic_name": "Elbasvir/Grazoprevir", "brand": "Merck", "dosage": "50/100mg", "price": 55.00, "original_price": 18200.00, "discount": 99, "desc": "Once-daily HCV genotype 1 and 4 treatment"},
        {"name": "Vosevi", "generic_name": "Sofosbuvir/Velpatasvir/Voxilaprevir", "brand": "Gilead", "dosage": "400/100/100mg", "price": 95.00, "original_price": 24920.00, "discount": 99, "desc": "Salvage therapy for treatment-experienced HCV"},
        {"name": "Daklinza", "generic_name": "Daclatasvir", "brand": "BMS", "dosage": "60mg", "price": 35.00, "original_price": 15000.00, "discount": 99, "desc": "NS5A inhibitor for HCV treatment"},
        {"name": "Hepcinat Plus", "generic_name": "Sofosbuvir/Daclatasvir", "brand": "Natco", "dosage": "400/60mg", "price": 28.00, "original_price": 850.00, "discount": 97, "desc": "Generic combination for HCV treatment"},
        {"name": "MyHep All", "generic_name": "Sofosbuvir/Velpatasvir", "brand": "Mylan", "dosage": "400/100mg", "price": 32.00, "original_price": 920.00, "discount": 97, "desc": "Affordable pan-genotypic HCV treatment"},
        {"name": "Velpanat", "generic_name": "Sofosbuvir/Velpatasvir", "brand": "Natco", "dosage": "400/100mg", "price": 30.00, "original_price": 890.00, "discount": 97, "desc": "Cost-effective HCV cure"},
        {"name": "Baraclude", "generic_name": "Entecavir", "brand": "BMS", "dosage": "0.5mg", "price": 8.00, "original_price": 380.00, "discount": 98, "desc": "First-line Hepatitis B treatment"},
        {"name": "Viread HBV", "generic_name": "Tenofovir", "brand": "Gilead", "dosage": "300mg", "price": 10.00, "original_price": 650.00, "discount": 98, "desc": "Hepatitis B treatment and prevention"},
        {"name": "Vemlidy", "generic_name": "Tenofovir Alafenamide", "brand": "Gilead", "dosage": "25mg", "price": 18.00, "original_price": 1200.00, "discount": 98, "desc": "Improved HBV treatment with bone/renal safety"},
        {"name": "Pegasys", "generic_name": "Peginterferon alfa-2a", "brand": "Roche", "dosage": "180mcg", "price": 85.00, "original_price": 420.00, "discount": 80, "desc": "Interferon therapy for hepatitis B and C"},
        {"name": "Hepsera", "generic_name": "Adefovir", "brand": "Gilead", "dosage": "10mg", "price": 12.00, "original_price": 580.00, "discount": 98, "desc": "Hepatitis B antiviral treatment"},
        {"name": "Resof Total", "generic_name": "Sofosbuvir/Velpatasvir", "brand": "Dr. Reddy's", "dosage": "400/100mg", "price": 35.00, "original_price": 950.00, "discount": 96, "desc": "Complete HCV treatment course"},
        {"name": "Sofovir", "generic_name": "Sofosbuvir", "brand": "Hetero", "dosage": "400mg", "price": 22.00, "original_price": 750.00, "discount": 97, "desc": "Generic sofosbuvir for HCV"},
        {"name": "Hepcvir", "generic_name": "Sofosbuvir", "brand": "Cipla", "dosage": "400mg", "price": 20.00, "original_price": 720.00, "discount": 97, "desc": "Quality generic HCV treatment"},
        {"name": "Myhep LVIR", "generic_name": "Ledipasvir/Sofosbuvir", "brand": "Mylan", "dosage": "90/400mg", "price": 42.00, "original_price": 1100.00, "discount": 96, "desc": "Generic Harvoni alternative"},
        {"name": "Ledifos", "generic_name": "Ledipasvir/Sofosbuvir", "brand": "Hetero", "dosage": "90/400mg", "price": 38.00, "original_price": 980.00, "discount": 96, "desc": "Affordable HCV genotype 1 treatment"},
    ]
    
    for med in hepatitis_meds:
        products_data.append({
            "product_id": f"prod_{uuid.uuid4().hex[:12]}",
            "name": med["name"],
            "generic_name": med["generic_name"],
            "brand": med["brand"],
            "category": "Hepatitis",
            "description": med["desc"],
            "dosage": med["dosage"],
            "form": "Tablet",
            "quantity_per_pack": 28,
            "price": med["price"],
            "original_price": med["original_price"],
            "discount_percentage": med["discount"],
            "manufacturer": med["brand"],
            "requires_prescription": True,
            "in_stock": True,
            "image_url": "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    # ERECTILE DYSFUNCTION MEDICATIONS (20)
    ed_meds = [
        {"name": "Viagra", "generic_name": "Sildenafil Citrate", "brand": "Pfizer", "dosage": "100mg", "price": 2.50, "original_price": 70.00, "discount": 96, "desc": "Most prescribed ED medication worldwide"},
        {"name": "Cialis", "generic_name": "Tadalafil", "brand": "Lilly", "dosage": "20mg", "price": 3.00, "original_price": 75.00, "discount": 96, "desc": "Long-lasting ED treatment up to 36 hours"},
        {"name": "Levitra", "generic_name": "Vardenafil", "brand": "Bayer", "dosage": "20mg", "price": 3.50, "original_price": 65.00, "discount": 95, "desc": "Fast-acting ED medication"},
        {"name": "Stendra", "generic_name": "Avanafil", "brand": "Vivus", "dosage": "200mg", "price": 8.00, "original_price": 55.00, "discount": 85, "desc": "Fastest-acting ED medication (15 minutes)"},
        {"name": "Kamagra", "generic_name": "Sildenafil Citrate", "brand": "Ajanta", "dosage": "100mg", "price": 1.50, "original_price": 45.00, "discount": 97, "desc": "Popular generic Viagra alternative"},
        {"name": "Cenforce", "generic_name": "Sildenafil Citrate", "brand": "Centurion", "dosage": "100mg", "price": 1.20, "original_price": 42.00, "discount": 97, "desc": "Affordable sildenafil option"},
        {"name": "Fildena", "generic_name": "Sildenafil Citrate", "brand": "Fortune", "dosage": "100mg", "price": 1.30, "original_price": 40.00, "discount": 97, "desc": "Quality generic ED medication"},
        {"name": "Tadacip", "generic_name": "Tadalafil", "brand": "Cipla", "dosage": "20mg", "price": 2.00, "original_price": 55.00, "discount": 96, "desc": "Trusted generic Cialis"},
        {"name": "Tadarise", "generic_name": "Tadalafil", "brand": "Sunrise", "dosage": "20mg", "price": 1.80, "original_price": 50.00, "discount": 96, "desc": "Weekend pill alternative"},
        {"name": "Vidalista", "generic_name": "Tadalafil", "brand": "Centurion", "dosage": "20mg", "price": 1.50, "original_price": 48.00, "discount": 97, "desc": "Long-lasting generic tadalafil"},
        {"name": "Vilitra", "generic_name": "Vardenafil", "brand": "Centurion", "dosage": "20mg", "price": 2.20, "original_price": 52.00, "discount": 96, "desc": "Generic Levitra option"},
        {"name": "Suhagra", "generic_name": "Sildenafil Citrate", "brand": "Cipla", "dosage": "100mg", "price": 1.40, "original_price": 38.00, "discount": 96, "desc": "Reliable generic sildenafil"},
        {"name": "Penegra", "generic_name": "Sildenafil Citrate", "brand": "Zydus", "dosage": "100mg", "price": 1.60, "original_price": 42.00, "discount": 96, "desc": "Quality ED treatment option"},
        {"name": "Caverta", "generic_name": "Sildenafil Citrate", "brand": "Ranbaxy", "dosage": "100mg", "price": 1.55, "original_price": 40.00, "discount": 96, "desc": "Established generic Viagra"},
        {"name": "Silagra", "generic_name": "Sildenafil Citrate", "brand": "Cipla", "dosage": "100mg", "price": 1.45, "original_price": 39.00, "discount": 96, "desc": "Trusted sildenafil brand"},
        {"name": "Aurogra", "generic_name": "Sildenafil Citrate", "brand": "Aurochem", "dosage": "100mg", "price": 1.25, "original_price": 35.00, "discount": 96, "desc": "Affordable ED solution"},
        {"name": "Megalis", "generic_name": "Tadalafil", "brand": "Macleods", "dosage": "20mg", "price": 2.10, "original_price": 58.00, "discount": 96, "desc": "Weekend treatment option"},
        {"name": "Erectafil", "generic_name": "Tadalafil", "brand": "Combitic", "dosage": "20mg", "price": 1.90, "original_price": 52.00, "discount": 96, "desc": "Long-duration ED treatment"},
        {"name": "Super P-Force", "generic_name": "Sildenafil/Dapoxetine", "brand": "Sunrise", "dosage": "100/60mg", "price": 3.50, "original_price": 65.00, "discount": 95, "desc": "Dual-action for ED and PE"},
        {"name": "Extra Super Tadarise", "generic_name": "Tadalafil/Dapoxetine", "brand": "Sunrise", "dosage": "40/60mg", "price": 4.00, "original_price": 72.00, "discount": 94, "desc": "Enhanced dual-action formula"},
    ]
    
    for med in ed_meds:
        products_data.append({
            "product_id": f"prod_{uuid.uuid4().hex[:12]}",
            "name": med["name"],
            "generic_name": med["generic_name"],
            "brand": med["brand"],
            "category": "Erectile Dysfunction",
            "description": med["desc"],
            "dosage": med["dosage"],
            "form": "Tablet",
            "quantity_per_pack": 10,
            "price": med["price"],
            "original_price": med["original_price"],
            "discount_percentage": med["discount"],
            "manufacturer": med["brand"],
            "requires_prescription": True,
            "in_stock": True,
            "image_url": "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    # DIABETES/INSULIN MEDICATIONS (20)
    diabetes_meds = [
        {"name": "Lantus", "generic_name": "Insulin Glargine", "brand": "Sanofi", "dosage": "100U/ml", "price": 45.00, "original_price": 350.00, "discount": 87, "desc": "Long-acting basal insulin for diabetes"},
        {"name": "Humalog", "generic_name": "Insulin Lispro", "brand": "Lilly", "dosage": "100U/ml", "price": 42.00, "original_price": 320.00, "discount": 87, "desc": "Rapid-acting mealtime insulin"},
        {"name": "NovoRapid", "generic_name": "Insulin Aspart", "brand": "Novo Nordisk", "dosage": "100U/ml", "price": 40.00, "original_price": 310.00, "discount": 87, "desc": "Fast-acting insulin for meals"},
        {"name": "Levemir", "generic_name": "Insulin Detemir", "brand": "Novo Nordisk", "dosage": "100U/ml", "price": 48.00, "original_price": 380.00, "discount": 87, "desc": "Long-acting insulin with predictable action"},
        {"name": "Tresiba", "generic_name": "Insulin Degludec", "brand": "Novo Nordisk", "dosage": "100U/ml", "price": 55.00, "original_price": 420.00, "discount": 87, "desc": "Ultra-long-acting basal insulin"},
        {"name": "Jardiance", "generic_name": "Empagliflozin", "brand": "Boehringer", "dosage": "25mg", "price": 8.00, "original_price": 480.00, "discount": 98, "desc": "SGLT2 inhibitor with cardiovascular benefits"},
        {"name": "Ozempic", "generic_name": "Semaglutide", "brand": "Novo Nordisk", "dosage": "1mg", "price": 85.00, "original_price": 950.00, "discount": 91, "desc": "Once-weekly GLP-1 for diabetes and weight"},
        {"name": "Trulicity", "generic_name": "Dulaglutide", "brand": "Lilly", "dosage": "1.5mg", "price": 75.00, "original_price": 820.00, "discount": 91, "desc": "Weekly GLP-1 receptor agonist"},
        {"name": "Victoza", "generic_name": "Liraglutide", "brand": "Novo Nordisk", "dosage": "1.8mg", "price": 65.00, "original_price": 680.00, "discount": 90, "desc": "Daily GLP-1 for blood sugar control"},
        {"name": "Metformin", "generic_name": "Metformin HCl", "brand": "Generic", "dosage": "500mg", "price": 0.80, "original_price": 25.00, "discount": 97, "desc": "First-line oral diabetes medication"},
        {"name": "Januvia", "generic_name": "Sitagliptin", "brand": "Merck", "dosage": "100mg", "price": 5.00, "original_price": 380.00, "discount": 99, "desc": "DPP-4 inhibitor for type 2 diabetes"},
        {"name": "Invokana", "generic_name": "Canagliflozin", "brand": "J&J", "dosage": "300mg", "price": 7.50, "original_price": 460.00, "discount": 98, "desc": "SGLT2 inhibitor for diabetes control"},
        {"name": "Farxiga", "generic_name": "Dapagliflozin", "brand": "AstraZeneca", "dosage": "10mg", "price": 6.50, "original_price": 420.00, "discount": 98, "desc": "SGLT2 inhibitor with heart/kidney benefits"},
        {"name": "Glucophage", "generic_name": "Metformin", "brand": "Merck", "dosage": "850mg", "price": 1.20, "original_price": 35.00, "discount": 97, "desc": "Extended-release metformin"},
        {"name": "Amaryl", "generic_name": "Glimepiride", "brand": "Sanofi", "dosage": "4mg", "price": 1.50, "original_price": 45.00, "discount": 97, "desc": "Sulfonylurea for type 2 diabetes"},
        {"name": "Trajenta", "generic_name": "Linagliptin", "brand": "Boehringer", "dosage": "5mg", "price": 4.50, "original_price": 350.00, "discount": 99, "desc": "DPP-4 inhibitor safe for kidney disease"},
        {"name": "Rybelsus", "generic_name": "Oral Semaglutide", "brand": "Novo Nordisk", "dosage": "14mg", "price": 95.00, "original_price": 980.00, "discount": 90, "desc": "First oral GLP-1 medication"},
        {"name": "Synjardy", "generic_name": "Empagliflozin/Metformin", "brand": "Boehringer", "dosage": "12.5/1000mg", "price": 12.00, "original_price": 520.00, "discount": 98, "desc": "Combination SGLT2 + metformin"},
        {"name": "Basaglar", "generic_name": "Insulin Glargine", "brand": "Lilly", "dosage": "100U/ml", "price": 38.00, "original_price": 280.00, "discount": 86, "desc": "Biosimilar long-acting insulin"},
        {"name": "Toujeo", "generic_name": "Insulin Glargine U-300", "brand": "Sanofi", "dosage": "300U/ml", "price": 52.00, "original_price": 400.00, "discount": 87, "desc": "Concentrated long-acting insulin"},
    ]
    
    for med in diabetes_meds:
        form = "Injection" if "Insulin" in med["generic_name"] or "glutide" in med["generic_name"] else "Tablet"
        products_data.append({
            "product_id": f"prod_{uuid.uuid4().hex[:12]}",
            "name": med["name"],
            "generic_name": med["generic_name"],
            "brand": med["brand"],
            "category": "Diabetes & Insulin",
            "description": med["desc"],
            "dosage": med["dosage"],
            "form": form,
            "quantity_per_pack": 30 if form == "Tablet" else 1,
            "price": med["price"],
            "original_price": med["original_price"],
            "discount_percentage": med["discount"],
            "manufacturer": med["brand"],
            "requires_prescription": True,
            "in_stock": True,
            "image_url": "https://images.unsplash.com/photo-1593491034932-844ab981ed7c?w=400",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    # WEIGHT LOSS MEDICATIONS (20)
    weightloss_meds = [
        {"name": "Wegovy", "generic_name": "Semaglutide", "brand": "Novo Nordisk", "dosage": "2.4mg", "price": 125.00, "original_price": 1350.00, "discount": 91, "desc": "FDA-approved for chronic weight management"},
        {"name": "Saxenda", "generic_name": "Liraglutide", "brand": "Novo Nordisk", "dosage": "3mg", "price": 95.00, "original_price": 980.00, "discount": 90, "desc": "Daily injectable for weight loss"},
        {"name": "Mounjaro", "generic_name": "Tirzepatide", "brand": "Lilly", "dosage": "15mg", "price": 145.00, "original_price": 1200.00, "discount": 88, "desc": "Dual GIP/GLP-1 for diabetes and weight loss"},
        {"name": "Zepbound", "generic_name": "Tirzepatide", "brand": "Lilly", "dosage": "15mg", "price": 140.00, "original_price": 1150.00, "discount": 88, "desc": "FDA-approved tirzepatide for obesity"},
        {"name": "Qsymia", "generic_name": "Phentermine/Topiramate", "brand": "Vivus", "dosage": "15/92mg", "price": 45.00, "original_price": 280.00, "discount": 84, "desc": "Combination appetite suppressant"},
        {"name": "Contrave", "generic_name": "Naltrexone/Bupropion", "brand": "Nalpropion", "dosage": "8/90mg", "price": 35.00, "original_price": 250.00, "discount": 86, "desc": "Reduces cravings and appetite"},
        {"name": "Xenical", "generic_name": "Orlistat", "brand": "Roche", "dosage": "120mg", "price": 2.50, "original_price": 85.00, "discount": 97, "desc": "Fat absorption blocker"},
        {"name": "Alli", "generic_name": "Orlistat", "brand": "GSK", "dosage": "60mg", "price": 1.80, "original_price": 55.00, "discount": 97, "desc": "Over-the-counter weight loss aid"},
        {"name": "Phentermine", "generic_name": "Phentermine HCl", "brand": "Generic", "dosage": "37.5mg", "price": 1.50, "original_price": 45.00, "discount": 97, "desc": "Short-term appetite suppressant"},
        {"name": "Belviq", "generic_name": "Lorcaserin", "brand": "Eisai", "dosage": "10mg", "price": 8.00, "original_price": 220.00, "discount": 96, "desc": "Serotonin receptor agonist for weight"},
        {"name": "Rybelsus WL", "generic_name": "Oral Semaglutide", "brand": "Novo Nordisk", "dosage": "14mg", "price": 98.00, "original_price": 950.00, "discount": 90, "desc": "Oral GLP-1 for weight management"},
        {"name": "Adipex-P", "generic_name": "Phentermine", "brand": "Teva", "dosage": "37.5mg", "price": 2.00, "original_price": 52.00, "discount": 96, "desc": "Brand-name appetite suppressant"},
        {"name": "Lomaira", "generic_name": "Phentermine", "brand": "KVK Tech", "dosage": "8mg", "price": 1.20, "original_price": 38.00, "discount": 97, "desc": "Low-dose phentermine option"},
        {"name": "Didrex", "generic_name": "Benzphetamine", "brand": "Pfizer", "dosage": "50mg", "price": 3.50, "original_price": 85.00, "discount": 96, "desc": "Anorectic agent for weight loss"},
        {"name": "Tenuate", "generic_name": "Diethylpropion", "brand": "Generic", "dosage": "75mg", "price": 2.80, "original_price": 72.00, "discount": 96, "desc": "Appetite suppressant stimulant"},
        {"name": "Bontril", "generic_name": "Phendimetrazine", "brand": "Valeant", "dosage": "105mg", "price": 3.20, "original_price": 78.00, "discount": 96, "desc": "Extended-release appetite suppressant"},
        {"name": "Plenity", "generic_name": "Cellulose/Citric Acid", "brand": "Gelesis", "dosage": "2.25g", "price": 4.00, "original_price": 98.00, "discount": 96, "desc": "Hydrogel that promotes fullness"},
        {"name": "Imcivree", "generic_name": "Setmelanotide", "brand": "Rhythm", "dosage": "10mg/ml", "price": 350.00, "original_price": 4500.00, "discount": 92, "desc": "For genetic obesity disorders"},
        {"name": "Zonisamide", "generic_name": "Zonisamide", "brand": "Generic", "dosage": "100mg", "price": 1.50, "original_price": 42.00, "discount": 96, "desc": "Off-label use for weight loss"},
        {"name": "Topiramate", "generic_name": "Topiramate", "brand": "Generic", "dosage": "100mg", "price": 0.90, "original_price": 35.00, "discount": 97, "desc": "Off-label appetite suppressant"},
    ]
    
    for med in weightloss_meds:
        form = "Injection" if "glutide" in med["generic_name"].lower() or "Tirzepatide" in med["generic_name"] else "Tablet"
        products_data.append({
            "product_id": f"prod_{uuid.uuid4().hex[:12]}",
            "name": med["name"],
            "generic_name": med["generic_name"],
            "brand": med["brand"],
            "category": "Weight Loss",
            "description": med["desc"],
            "dosage": med["dosage"],
            "form": form,
            "quantity_per_pack": 30 if form == "Tablet" else 4,
            "price": med["price"],
            "original_price": med["original_price"],
            "discount_percentage": med["discount"],
            "manufacturer": med["brand"],
            "requires_prescription": True,
            "in_stock": True,
            "image_url": "https://images.unsplash.com/photo-1573883431205-98b5f10aaedb?w=400",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    # Insert all products
    await db.products.insert_many(products_data)
    
    # Seed testimonials
    testimonials_data = [
        {
            "testimonial_id": f"test_{uuid.uuid4().hex[:8]}",
            "name": "Robert Mitchell",
            "country": "United States",
            "rating": 5,
            "comment": "I've been ordering my cancer medication from MediSeller for over 2 years. The savings are incredible - over $2,000 per month! The quality is exactly the same as what I was getting at my local pharmacy. Fast shipping and excellent customer support.",
            "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
            "verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "testimonial_id": f"test_{uuid.uuid4().hex[:8]}",
            "name": "Sarah Thompson",
            "country": "United Kingdom",
            "rating": 5,
            "comment": "Finding affordable Hepatitis C treatment seemed impossible until I found MediSeller. They helped me get the same medications at 99% less cost. Their expert team guided me through the entire process. Forever grateful!",
            "avatar_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
            "verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "testimonial_id": f"test_{uuid.uuid4().hex[:8]}",
            "name": "Michael Chen",
            "country": "Canada",
            "rating": 5,
            "comment": "The diabetes medications I need cost a fortune in Canada. MediSeller delivers authentic products at a fraction of the price. Delivery took 10 days and everything was perfectly packaged. Highly recommend!",
            "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
            "verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "testimonial_id": f"test_{uuid.uuid4().hex[:8]}",
            "name": "Emma Wilson",
            "country": "Australia",
            "rating": 5,
            "comment": "As someone on HIV medication for life, the cost savings from MediSeller are life-changing. Same Gilead medications, authentic and effective, at prices I can actually afford. Their discreet packaging is also much appreciated.",
            "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
            "verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "testimonial_id": f"test_{uuid.uuid4().hex[:8]}",
            "name": "James Rodriguez",
            "country": "Germany",
            "rating": 5,
            "comment": "Excellent service from start to finish. The consultation team helped me find the right weight loss medication and explained everything clearly. The medication arrived quickly and has been very effective.",
            "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
            "verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "testimonial_id": f"test_{uuid.uuid4().hex[:8]}",
            "name": "Linda Martinez",
            "country": "Spain",
            "rating": 5,
            "comment": "45 years of experience really shows. MediSeller's team is professional, knowledgeable, and genuinely caring. They made getting my husband's cancer medication stress-free during an already difficult time.",
            "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
            "verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
    ]
    
    await db.testimonials.insert_many(testimonials_data)
    
    # Seed site configuration
    existing_config = await db.site_config.count_documents({"active": True})
    if existing_config == 0:
        default_config = {
            "active": True,
            "header": {
                "logo_text": "MediSeller",
                "nav_items": [
                    {"label": "Categories", "path": "/products#categories"},
                    {"label": "All Products", "path": "/products"},
                    {"label": "Expert Consultation", "path": "/consultation"},
                    {"label": "About Us", "path": "/about"}
                ]
            },
            "hero": {
                "badge": "45+ Years of Heritage",
                "title": "Global Access to Authentic Medicine",
                "subtitle": "Secure 100% original generic medications from India. Save over 60% with insured delivery to 30+ countries. Trusted by patients worldwide for nearly half a century.",
                "primary_cta": {"text": "View All Products", "path": "/products"},
                "secondary_cta": {"text": "Talk to Expert", "path": "/consultation"},
                "image_url": "https://images.unsplash.com/photo-1576091358783-a212ec293ff3?w=800",
                "background_image_url": None,
                "patients_count": "150K+",
                "rating": 4.9,
                "trust_avatars": [
                    "https://i.pravatar.cc/100?img=11",
                    "https://i.pravatar.cc/100?img=12",
                    "https://i.pravatar.cc/100?img=13",
                    "https://i.pravatar.cc/100?img=14"
                ],
                "floating_card_title": "100% Authentic",
                "floating_card_subtitle": "Verified Products",
                "floating_card_icon": "CheckCircle",
                "savings_badge_percentage": "60%",
                "savings_badge_text": "Average Savings"
            },
            "stats": {
                "items": [
                    {"value": "45+", "label": "Years of Excellence"},
                    {"value": "30+", "label": "Countries Served"},
                    {"value": "150K+", "label": "Happy Customers"},
                    {"value": "99%", "label": "Delivery Rate"}
                ]
            },
            "categories_section": {
                "badge": "Browse by Category",
                "title": "Life-Saving & Lifestyle Medications",
                "subtitle": "We specialize in affordable generic medications for serious health conditions. All products are sourced from licensed manufacturers.",
                "cards": [
                    {"title": "Cancer Medications", "subtitle": "Life-saving oncology treatments", "icon_name": "Ribbon", "color_class": "from-pink-500/10 to-pink-500/5", "path": "/products?category=Cancer"},
                    {"title": "HIV/AIDS Treatment", "subtitle": "Antiretroviral therapies", "icon_name": "Activity", "color_class": "from-purple-500/10 to-purple-500/5", "path": "/products?category=HIV"},
                    {"title": "Hepatitis", "subtitle": "Cure hepatitis C in 12 weeks", "icon_name": "ShieldAlert", "color_class": "from-teal-500/10 to-teal-500/5", "path": "/products?category=Hepatitis"},
                    {"title": "Erectile Dysfunction", "subtitle": "Trusted ED medications", "icon_name": "Zap", "color_class": "from-blue-500/10 to-blue-500/5", "path": "/products?category=ED"},
                    {"title": "Diabetes & Insulin", "subtitle": "Insulin and oral medications", "icon_name": "Stethoscope", "color_class": "from-orange-500/10 to-orange-500/5", "path": "/products?category=Diabetes"},
                    {"title": "Weight Loss", "subtitle": "FDA-approved solutions", "icon_name": "Scale", "color_class": "from-green-500/10 to-green-500/5", "path": "/products?category=WeightLoss"}
                ]
            },
            "favicon_url": "https://mediseller.com/favicon.ico",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.site_config.insert_one(default_config)
    
    return {
        "message": "Database seeded successfully",
        "products": len(products_data),
        "testimonials": len(testimonials_data)
    }

@api_router.post("/seed-config")
async def seed_config_only():
    """Seed only the site configuration to resolve data wipe issues"""
    await db.site_config.delete_one({"active": True})
    
    default_config = {
        "active": True,
        "header": {
            "logo_text": "MediSeller",
            "nav_items": [
                {"label": "Categories", "path": "/products#categories"},
                {"label": "All Products", "path": "/products"},
                {"label": "Expert Consultation", "path": "/consultation"},
                {"label": "About Us", "path": "/about"}
            ]
        },
        "hero": {
            "badge": "45+ Years of Heritage",
            "title": "Global Access to Authentic Medicine",
            "subtitle": "Secure 100% original generic medications from India. Save over 60% with insured delivery to 30+ countries. Trusted by patients worldwide for nearly half a century.",
            "primary_cta": {"text": "View All Products", "path": "/products"},
            "secondary_cta": {"text": "Talk to Expert", "path": "/consultation"},
            "image_url": "https://images.unsplash.com/photo-1576091358783-a212ec293ff3?w=800",
            "background_image_url": None,
            "patients_count": "150K+",
            "rating": 4.9,
            "trust_avatars": [
                "https://i.pravatar.cc/100?img=11",
                "https://i.pravatar.cc/100?img=12",
                "https://i.pravatar.cc/100?img=13",
                "https://i.pravatar.cc/100?img=14"
            ],
            "floating_card_title": "100% Authentic",
            "floating_card_subtitle": "Verified Products",
            "floating_card_icon": "CheckCircle",
            "savings_badge_percentage": "60%",
            "savings_badge_text": "Average Savings"
        },
        "stats": {
            "items": [
                {"value": "45+", "label": "Years of Excellence"},
                {"value": "30+", "label": "Countries Served"},
                {"value": "150K+", "label": "Happy Customers"},
                {"value": "99%", "label": "Delivery Rate"}
            ]
        },
        "categories_section": {
            "badge": "Browse by Category",
            "title": "Life-Saving & Lifestyle Medications",
            "subtitle": "We specialize in affordable generic medications for serious health conditions. All products are sourced from licensed manufacturers.",
            "cards": [
                {"title": "Cancer Medications", "subtitle": "Life-saving oncology treatments", "icon_name": "Ribbon", "color_class": "from-pink-500/10 to-pink-500/5", "path": "/products?category=Cancer"},
                {"title": "HIV/AIDS Treatment", "subtitle": "Antiretroviral therapies", "icon_name": "Activity", "color_class": "from-purple-500/10 to-purple-500/5", "path": "/products?category=HIV"},
                {"title": "Hepatitis", "subtitle": "Cure hepatitis C in 12 weeks", "icon_name": "ShieldAlert", "color_class": "from-teal-500/10 to-teal-500/5", "path": "/products?category=Hepatitis"},
                {"title": "Erectile Dysfunction", "subtitle": "Trusted ED medications", "icon_name": "Zap", "color_class": "from-blue-500/10 to-blue-500/5", "path": "/products?category=ED"},
                {"title": "Diabetes & Insulin", "subtitle": "Insulin and oral medications", "icon_name": "Stethoscope", "color_class": "from-orange-500/10 to-orange-500/5", "path": "/products?category=Diabetes"},
                {"title": "Weight Loss", "subtitle": "FDA-approved solutions", "icon_name": "Scale", "color_class": "from-green-500/10 to-green-500/5", "path": "/products?category=WeightLoss"}
            ]
        },
        "favicon_url": "https://mediseller.com/favicon.ico",
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.site_config.insert_one(default_config)
    return {"message": "Config seeded successfully"}

# Image Upload Endpoint
@api_router.post("/admin/upload-image")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Create a unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4().hex}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Return the public URL
        # For local dev, we assume it's running on port 8001
        base_url = "http://localhost:8001"
        return {"url": f"{base_url}/uploads/{unique_filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
