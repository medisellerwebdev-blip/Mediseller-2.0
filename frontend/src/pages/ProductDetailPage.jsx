import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/products/ProductCard';
import PrescriptionUpload from '../components/prescription/PrescriptionUpload';
import { formatCurrency } from '../lib/utils';
import { toast } from 'sonner';
import {
  ShoppingCart,
  ChevronRight,
  FileText,
  Shield,
  Truck,
  Clock,
  Check,
  Minus,
  Plus,
  AlertCircle,
  Loader2,
  Package,
  Star,
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart, loading: cartLoading } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);

          // Fetch related products
          const relatedRes = await fetch(
            `${API_URL}/api/products?category=${encodeURIComponent(data.category)}&limit=4`
          );
          if (relatedRes.ok) {
            const relatedData = await relatedRes.json();
            setRelatedProducts(relatedData.filter((p) => p.product_id !== productId).slice(0, 4));
          }
        } else {
          navigate('/products');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, navigate]);

  const handleAddToCart = async () => {
    for (let i = 0; i < quantity; i++) {
      await addToCart(product.product_id);
    }
    toast.success(`${quantity} x ${product.name} added to cart`);
  };

  const savings = product ? product.original_price - product.price : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white" data-testid="product-detail-page">
      {/* Breadcrumb */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="container-custom py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-slate-500 hover:text-primary">Home</Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <Link to="/products" className="text-slate-500 hover:text-primary">Products</Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <Link
              to={`/products?category=${encodeURIComponent(product.category)}`}
              className="text-slate-500 hover:text-primary"
            >
              {product.category}
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 font-medium truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="container-custom py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div>
            <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden mb-4">
              <img
                src={product.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm">Authentic</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <Truck className="w-5 h-5 text-blue-600" />
                <span className="text-sm">Insured</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <Package className="w-5 h-5 text-purple-600" />
                <span className="text-sm">Discreet</span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{product.category}</Badge>
                {product.requires_prescription && (
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                    <FileText className="w-3 h-3 mr-1" />
                    Prescription Required
                  </Badge>
                )}
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                {product.name}
              </h1>
              <p className="text-lg text-slate-600">{product.generic_name}</p>
              <p className="text-slate-500">by {product.brand}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-slate-500">(4.8) • 150+ orders</span>
            </div>

            {/* Price */}
            <div className="bg-slate-50 rounded-xl p-6 mb-6">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-bold text-primary">
                  {formatCurrency(product.price)}
                </span>
                {product.original_price > product.price && (
                  <span className="text-xl text-slate-400 line-through">
                    {formatCurrency(product.original_price)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  Save {product.discount_percentage}%
                </Badge>
                <span className="text-green-600 font-medium">
                  You save {formatCurrency(savings)} per pack
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Price per {product.form.toLowerCase()} • {product.quantity_per_pack} {product.form}s per pack
              </p>
            </div>

            {/* Product specs */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Dosage</p>
                <p className="font-semibold">{product.dosage}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Form</p>
                <p className="font-semibold">{product.form}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Pack Size</p>
                <p className="font-semibold">{product.quantity_per_pack} {product.form}s</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Manufacturer</p>
                <p className="font-semibold">{product.manufacturer}</p>
              </div>
            </div>

            {/* Quantity selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-slate-600">Quantity:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  data-testid="decrease-quantity-btn"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  data-testid="increase-quantity-btn"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={!product.in_stock || cartLoading}
                className="w-full h-14 rounded-full text-lg"
                data-testid="add-to-cart-detail-btn"
              >
                {cartLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <ShoppingCart className="w-5 h-5 mr-2" />
                )}
                Add to Cart - {formatCurrency(product.price * quantity)}
              </Button>

              {product.requires_prescription && (
                <PrescriptionUpload
                  trigger={
                    <Button variant="outline" className="w-full h-12 rounded-full" data-testid="upload-rx-product-btn">
                      <FileText className="w-4 h-4 mr-2" />
                      Upload Prescription
                    </Button>
                  }
                />
              )}
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2 mt-4">
              {product.in_stock ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-medium">In Stock</span>
                  <span className="text-slate-500">• Ready to ship</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-500 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Delivery info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Express Global Delivery</p>
                  <p className="text-sm text-blue-700">
                    Estimated delivery: 7-14 business days • Insured shipping to 30+ countries
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-heading font-semibold text-lg mb-4">Product Description</h3>
                  <p className="text-slate-600 leading-relaxed">{product.description}</p>
                  <Separator className="my-6" />
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Active Ingredient</h4>
                      <p className="text-slate-600">{product.generic_name}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Manufacturer</h4>
                      <p className="text-slate-600">{product.manufacturer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="usage" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-heading font-semibold text-lg mb-4">Usage Information</h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <p className="text-sm text-amber-800">
                        <strong>Important:</strong> Always consult your healthcare provider before starting, 
                        stopping, or changing any medication. This information is for reference only.
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-3 text-slate-600">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-1" />
                      Take as directed by your healthcare provider
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-1" />
                      Store at room temperature away from moisture and heat
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-1" />
                      Keep out of reach of children
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="shipping" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-heading font-semibold text-lg mb-4">Shipping Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Truck className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Express Air Shipping</p>
                        <p className="text-slate-600 text-sm">7-14 business days delivery</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Fully Insured</p>
                        <p className="text-slate-600 text-sm">All shipments are insured against loss or damage</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Package className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Discreet Packaging</p>
                        <p className="text-slate-600 text-sm">No indication of contents on outer packaging</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Order Tracking</p>
                        <p className="text-slate-600 text-sm">Real-time tracking provided for all orders</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-heading text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.product_id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
