import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../lib/utils';
import { ShoppingCart, FileText, Check } from 'lucide-react';
import { toast } from 'sonner';

export const ProductCard = ({ product }) => {
  const { addToCart, loading } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await addToCart(product.product_id);
    if (success) {
      toast.success(`${product.name} added to cart`);
    } else {
      toast.error('Failed to add item to cart');
    }
  };

  const savings = product.original_price - product.price;

  return (
    <Link to={`/products/${product.product_id}`} data-testid={`product-card-${product.product_id}`}>
      <Card className="group overflow-hidden border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 h-full">
        <div className="relative aspect-square bg-slate-50 overflow-hidden">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.discount_percentage > 0 && (
            <Badge className="absolute top-3 left-3 bg-primary text-white border-0">
              {product.discount_percentage}% OFF
            </Badge>
          )}
          {product.requires_prescription && (
            <Badge variant="outline" className="absolute top-3 right-3 bg-white/90 text-amber-700 border-amber-200">
              <FileText className="w-3 h-3 mr-1" />
              Rx
            </Badge>
          )}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="mb-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider">{product.category}</p>
            <h3 className="font-heading font-semibold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
            <p className="text-sm text-slate-500">{product.generic_name}</p>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-primary">
              {formatCurrency(product.price)}
            </span>
            {product.original_price > product.price && (
              <span className="text-sm text-slate-400 line-through">
                {formatCurrency(product.original_price)}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 mb-3">
            {product.dosage} • {product.quantity_per_pack} {product.form}s
          </p>

          {savings > 0 && (
            <div className="flex items-center gap-1 text-xs text-green-600 mb-3">
              <Check className="w-3 h-3" />
              Save {formatCurrency(savings)} per pack
            </div>
          )}

          <Button
            onClick={handleAddToCart}
            disabled={loading || !product.in_stock}
            className="w-full rounded-full"
            size="sm"
            data-testid={`add-to-cart-${product.product_id}`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
