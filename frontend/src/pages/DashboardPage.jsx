import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { formatCurrency } from '../lib/utils';
import {
  ChevronRight,
  Package,
  FileText,
  User,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  LogOut,
  ShoppingBag,
  Loader2,
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const statusColors = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  shipped: 'bg-purple-100 text-purple-700 border-purple-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;

      try {
        const [ordersRes, prescriptionsRes] = await Promise.all([
          fetch(`${API_URL}/api/orders`, { credentials: 'include' }),
          fetch(`${API_URL}/api/prescriptions`, { credentials: 'include' }),
        ]);

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
        }

        if (prescriptionsRes.ok) {
          const prescriptionsData = await prescriptionsRes.json();
          setPrescriptions(prescriptionsData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50" data-testid="dashboard-page">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="container-custom py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-slate-500 hover:text-primary">Home</Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 font-medium">Dashboard</span>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-20 h-20 rounded-full mx-auto mb-3"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="w-10 h-10 text-white" />
                    </div>
                  )}
                  <h2 className="font-heading font-semibold text-lg">{user?.name}</h2>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                </div>

                <Separator className="my-4" />

                <nav className="space-y-1">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium"
                  >
                    <Package className="w-4 h-4" />
                    My Orders
                  </Link>
                  <Link
                    to="/dashboard/prescriptions"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-600"
                  >
                    <FileText className="w-4 h-4" />
                    Prescriptions
                  </Link>
                </nav>

                <Separator className="my-4" />

                <Button
                  variant="outline"
                  onClick={logout}
                  className="w-full"
                  data-testid="logout-btn"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="orders">
              <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              </TabsList>

              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      My Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <ShoppingBag className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="font-heading font-semibold text-lg mb-2">No orders yet</h3>
                        <p className="text-slate-500 mb-4">Start shopping to see your orders here</p>
                        <Link to="/products">
                          <Button className="rounded-full">Browse Products</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div
                            key={order.order_id}
                            className="border border-slate-200 rounded-lg p-4"
                            data-testid={`order-${order.order_id}`}
                          >
                            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                              <div>
                                <p className="font-mono font-semibold">{order.order_id}</p>
                                <p className="text-sm text-slate-500">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge className={statusColors[order.status]}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </Badge>
                                <p className="font-semibold text-primary">
                                  {formatCurrency(order.total)}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {order.items.slice(0, 2).map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span className="text-slate-600">
                                    {item.name} x{item.quantity}
                                  </span>
                                  <span>{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                              ))}
                              {order.items.length > 2 && (
                                <p className="text-sm text-slate-500">
                                  +{order.items.length - 2} more items
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="prescriptions">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      My Prescriptions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {prescriptions.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="font-heading font-semibold text-lg mb-2">No prescriptions</h3>
                        <p className="text-slate-500 mb-4">
                          Upload prescriptions when ordering Rx medications
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {prescriptions.map((prescription) => (
                          <div
                            key={prescription.prescription_id}
                            className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                            data-testid={`prescription-${prescription.prescription_id}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-slate-500" />
                              </div>
                              <div>
                                <p className="font-medium">{prescription.file_name}</p>
                                <p className="text-sm text-slate-500">
                                  {new Date(prescription.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge className={statusColors[prescription.status]}>
                              {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
