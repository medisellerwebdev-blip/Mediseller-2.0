import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getStoredSessionId } from '../lib/utils';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const sessionId = getStoredSessionId();
      const response = await fetch(`${API_URL}/api/cart?session_id=${sessionId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCart(data);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true);
    try {
      const sessionId = getStoredSessionId();
      const response = await fetch(`${API_URL}/api/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ product_id: productId, quantity, session_id: sessionId }),
      });
      
      if (response.ok) {
        await fetchCart();
        setIsOpen(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    setLoading(true);
    try {
      const sessionId = getStoredSessionId();
      const response = await fetch(
        `${API_URL}/api/cart/update?product_id=${productId}&quantity=${quantity}&session_id=${sessionId}`,
        {
          method: 'PUT',
          credentials: 'include',
        }
      );
      
      if (response.ok) {
        await fetchCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update cart:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    return updateQuantity(productId, 0);
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      const sessionId = getStoredSessionId();
      const response = await fetch(`${API_URL}/api/cart/clear?session_id=${sessionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        setCart({ items: [], total: 0 });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to clear cart:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const itemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const value = {
    cart,
    loading,
    isOpen,
    setIsOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
