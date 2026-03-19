import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import PrescriptionUpload from '../components/prescription/PrescriptionUpload';
import { formatCurrency, getStoredSessionId } from '../lib/utils';
import { toast } from 'sonner';
import {
  ChevronRight,
  ShoppingBag,
  FileText,
  Loader2,
  CheckCircle,
  Shield,
  CreditCard,
  User,
  AlertCircle,
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Switzerland',
  'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Ireland',
  'Japan', 'Singapore', 'South Africa', 'New Zealand', 'India',
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user, isAuthenticated, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [prescriptionId, setPrescriptionId] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: 'United States',
    postal_code: '',
    notes: '',
  });

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        full_name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const hasRxItems = cart.items?.some((item) => item.requires_prescription);
  const subtotal = cart.total || 0;
  const shipping = 15.00;
  const total = subtotal + shipping;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const required = ['full_name', 'email', 'phone', 'address_line1', 'city', 'state', 'country', 'postal_code'];
    const missing = required.filter((field) => !formData[field]);
    if (missing.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check prescription requirement
    if (hasRxItems && !prescriptionId) {
      toast.error('Please upload a prescription for Rx items');
      return;
    }

    setLoading(true);

    try {
      const orderItems = cart.items.map((item) => ({
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        dosage: item.dosage,
      }));

      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items: orderItems,
          shipping_address: {
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            address_line1: formData.address_line1,
            address_line2: formData.address_line2,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            postal_code: formData.postal_code,
          },
          prescription_id: prescriptionId,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        const order = await response.json();
        setOrderId(order.order_id);
        setOrderPlaced(true);
        await clearCart();
        toast.success('Order placed successfully!');
      } else {
        throw new Error('Failed to place order');
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Order success screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-slate-50 py-12" data-testid="order-success">
        <div className="container-custom max-w-lg">
          <Card className="text-center">
            <CardContent className="py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="font-heading text-2xl font-bold mb-2">Order Placed Successfully!</h1>
              <p className="text-slate-600 mb-4">
                Thank you for your order. We'll send you a confirmation email shortly.
              </p>
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-slate-500">Order ID</p>
                <p className="font-mono font-semibold text-lg">{orderId}</p>
              </div>
              <div className="space-y-3">
                <Link to="/products">
                  <Button className="w-full rounded-full" data-testid="continue-shopping-btn">
                    Continue Shopping
                  </Button>
                </Link>
                {isAuthenticated && (
                  <Link to="/dashboard">
                    <Button variant="outline" className="w-full rounded-full">
                      View My Orders
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Empty cart
  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="container-custom max-w-lg text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-slate-300" />
          </div>
          <h1 className="font-heading text-2xl font-bold mb-2">Your Cart is Empty</h1>
          <p className="text-slate-600 mb-6">Add some items to checkout</p>
          <Link to="/products">
            <Button className="rounded-full">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" data-testid="checkout-page">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="container-custom py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-slate-500 hover:text-primary">Home</Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 font-medium">Checkout</span>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <h1 className="font-heading text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Guest checkout notice */}
              {!isAuthenticated && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-blue-900">Checking out as guest</p>
                        <p className="text-sm text-blue-700">
                          Create an account to track orders and save preferences
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={login}
                        className="text-blue-600 border-blue-300"
                      >
                        Sign In
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Shipping info */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        required
                        data-testid="checkout-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        data-testid="checkout-email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      data-testid="checkout-phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address_line1">Address Line 1 *</Label>
                    <Input
                      id="address_line1"
                      name="address_line1"
                      value={formData.address_line1}
                      onChange={handleInputChange}
                      required
                      data-testid="checkout-address1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address_line2">Address Line 2</Label>
                    <Input
                      id="address_line2"
                      name="address_line2"
                      value={formData.address_line2}
                      onChange={handleInputChange}
                      data-testid="checkout-address2"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        data-testid="checkout-city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        data-testid="checkout-state"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, country: value }))}
                      >
                        <SelectTrigger data-testid="checkout-country">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Postal Code *</Label>
                      <Input
                        id="postal_code"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleInputChange}
                        required
                        data-testid="checkout-postal"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Prescription upload */}
              {hasRxItems && (
                <Card className="border-amber-200">
                  <CardHeader>
                    <CardTitle className="font-heading flex items-center gap-2 text-amber-800">
                      <FileText className="w-5 h-5" />
                      Prescription Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-4">
                      Some items in your cart require a valid prescription. Please upload your prescription to continue.
                    </p>
                    {prescriptionId ? (
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        <span>Prescription uploaded successfully</span>
                      </div>
                    ) : (
                      <PrescriptionUpload
                        onUploadSuccess={(id) => setPrescriptionId(id)}
                        trigger={
                          <Button type="button" variant="outline" className="rounded-full" data-testid="checkout-upload-rx">
                            <FileText className="w-4 h-4 mr-2" />
                            Upload Prescription
                          </Button>
                        }
                      />
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any special instructions for your order..."
                    rows={3}
                    data-testid="checkout-notes"
                  />
                </CardContent>
              </Card>

              {/* Payment notice */}
              <Card className="border-slate-200 bg-slate-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-slate-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Payment Information</p>
                      <p className="text-sm text-slate-600">
                        Our team will contact you with payment options after reviewing your order. 
                        We accept major credit cards, bank transfers, and other payment methods.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit button - mobile */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-full text-lg lg:hidden"
                data-testid="place-order-btn-mobile"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Place Order - ${formatCurrency(total)}`
                )}
              </Button>
            </form>
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="font-heading">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.product_id} className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-slate-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Shipping</span>
                    <span>{formatCurrency(shipping)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Submit button - desktop */}
                <Button
                  type="submit"
                  form="checkout-form"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="w-full h-12 rounded-full hidden lg:flex"
                  data-testid="place-order-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 text-slate-400 text-xs">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CreditCard className="w-4 h-4" />
                    <span>Encrypted</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
