import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  User, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Loader2,
  ExternalLink,
  ChevronRight,
  Home
} from 'lucide-react';
import HomeEditor from '../components/admin/HomeEditor';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminDashboardPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, orderRes] = await Promise.all([
        fetch(`${API_URL}/api/products?limit=100`, { credentials: 'include' }),
        fetch(`${API_URL}/api/admin/orders`, { credentials: 'include' })
      ]);

      if (prodRes.ok) setProducts(await prodRes.json());
      if (orderRes.ok) setOrders(await orderRes.json());
      else if (orderRes.status === 403) {
        toast.error('Session expired. Please login again.');
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        toast.success('Product deleted');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white min-h-screen p-6 hidden md:block">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-bold text-xl">MediAdmin</span>
        </div>
        
        <nav className="space-y-4">
          <Link to="/admin/dashboard" className="flex items-center gap-3 text-primary font-medium">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <div className="pt-4 pb-2 text-xs uppercase tracking-wider text-slate-500 font-bold">Management</div>
          <button onClick={() => setActiveTab('products')} className={`flex items-center gap-3 w-full text-left transition-colors ${activeTab === 'products' ? 'text-primary font-medium' : 'text-slate-400 hover:text-white'}`}>
            <Package className="w-5 h-5" />
            Products
          </button>
          <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-3 w-full text-left transition-colors ${activeTab === 'orders' ? 'text-primary font-medium' : 'text-slate-400 hover:text-white'}`}>
            <ShoppingBag className="w-5 h-5" />
            Orders
          </button>
          <button onClick={() => setActiveTab('home')} className={`flex items-center gap-3 w-full text-left transition-colors ${activeTab === 'home' ? 'text-primary font-medium' : 'text-slate-400 hover:text-white'}`}>
            <Home className="w-5 h-5" />
            Home Page
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold font-heading text-slate-900">Dashboard Overview</h1>
            <p className="text-slate-500 text-sm">Welcome back, Administrator</p>
          </div>
          <div className="flex gap-4">
            <Link to="/" target="_blank">
              <Button variant="outline" className="rounded-full">
                View Site
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Total Products</p>
                  <h3 className="text-2xl font-bold mt-1">{products.length}</h3>
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Package className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Total Orders</p>
                  <h3 className="text-2xl font-bold mt-1">{orders.length}</h3>
                </div>
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Avg. Discount</p>
                  <h3 className="text-2xl font-bold mt-1">92%</h3>
                </div>
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                  <Plus className="w-5 h-5 rotate-45" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border p-1 rounded-xl shadow-sm">
            <TabsTrigger value="products" className="rounded-lg px-6">Products</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg px-6">Orders</TabsTrigger>
            <TabsTrigger value="home" className="rounded-lg px-6">Home Page</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Inventory Management</CardTitle>
                <Button className="rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </CardHeader>
              <CardContent>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search products by name or brand..." 
                    className="pl-10 rounded-full bg-slate-50 border-slate-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                      <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.slice(0, 10).map((product) => (
                        <tr key={product.product_id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <img src={product.image_url} alt="" className="w-10 h-10 rounded object-cover shadow-sm" />
                              <div>
                                <p className="font-semibold text-slate-900">{product.name}</p>
                                <p className="text-xs text-slate-500">{product.brand}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <Badge variant="outline" className="bg-slate-100 text-slate-600 border-0">{product.category}</Badge>
                          </td>
                          <td className="px-4 py-4 font-medium text-slate-700">${product.price}</td>
                          <td className="px-4 py-4">
                            <Badge className={product.in_stock ? "bg-green-100 text-green-700 border-0" : "bg-red-100 text-red-700 border-0"}>
                              {product.in_stock ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-500 hover:text-red-600"
                                onClick={() => deleteProduct(product.product_id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredProducts.length > 10 && (
                    <div className="p-4 text-center">
                      <p className="text-sm text-slate-500">Showing 10 of {filteredProducts.length} products</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    No orders found in the system.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.order_id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{order.order_id}</p>
                            <p className="text-sm text-slate-500">{order.shipping_address.full_name} • {new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right mr-4">
                            <p className="font-bold text-primary">${order.total}</p>
                            <p className="text-xs text-slate-500">{order.items.length} items</p>
                          </div>
                          <Badge className="bg-amber-100 text-amber-700 border-0">{order.status}</Badge>
                          <ChevronRight className="w-5 h-5 text-slate-300" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="home">
            <HomeEditor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
