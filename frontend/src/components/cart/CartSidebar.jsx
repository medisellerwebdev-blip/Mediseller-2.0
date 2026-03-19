import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { formatCurrency } from '../../lib/utils';
import { ShoppingBag, Plus, Minus, Trash2, X, FileText } from 'lucide-react';

export const CartSidebar = ({ open, onOpenChange }) => {
  const { cart, updateQuantity, removeFromCart, loading } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onOpenChange(false);
    navigate('/checkout');
  };

  const hasRxItems = cart.items?.some(item => item.requires_prescription);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-heading">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Your Cart
            {cart.items?.length > 0 && (
              <span className="text-sm font-normal text-slate-500">
                ({cart.items.length} items)
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {cart.items?.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="font-heading font-semibold text-lg mb-2">Your cart is empty</h3>
            <p className="text-slate-500 mb-6">
              Browse our medications and add items to your cart
            </p>
            <Button
              onClick={() => {
                onOpenChange(false);
                navigate('/products');
              }}
              className="rounded-full"
              data-testid="browse-products-btn"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {cart.items.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex gap-4 p-3 bg-slate-50 rounded-lg"
                    data-testid={`cart-item-${item.product_id}`}
                  >
                    <div className="w-16 h-16 bg-white rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-slate-500">{item.dosage}</p>
                      {item.requires_prescription && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 mt-1">
                          <FileText className="w-3 h-3" />
                          Rx Required
                        </span>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            disabled={loading}
                            className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:border-primary transition-colors disabled:opacity-50"
                            data-testid={`decrease-qty-${item.product_id}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            disabled={loading}
                            className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:border-primary transition-colors disabled:opacity-50"
                            data-testid={`increase-qty-${item.product_id}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="font-semibold text-primary">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      disabled={loading}
                      className="text-slate-400 hover:text-red-500 transition-colors self-start"
                      data-testid={`remove-item-${item.product_id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="pt-4 border-t border-slate-200 space-y-4">
              {hasRxItems && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Prescription Required</p>
                      <p className="text-xs text-amber-600">
                        Some items require a valid prescription. You can upload during checkout.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium">{formatCurrency(cart.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Shipping</span>
                  <span className="font-medium">{formatCurrency(15)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary text-lg">
                    {formatCurrency(cart.total + 15)}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full rounded-full h-12"
                size="lg"
                data-testid="checkout-btn"
              >
                Proceed to Checkout
              </Button>
              <p className="text-xs text-center text-slate-500">
                Free shipping on orders over $100
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;
