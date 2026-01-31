
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products, getProductsByCategory } from '@/data/products';
import ProductImage from '@/components/ui/ProductImage';
import { Button } from '@/components/ui/button';
import { useCart, Product } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';

const Products = () => {
  const { category } = useParams<{ category?: string }>();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [activeCategory, setActiveCategory] = useState<string>(category || 'all');


  const filteredProducts = activeCategory === 'all'
    ? products
    : getProductsByCategory(activeCategory as 'incense' | 'ghee');

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="section-container">
        <h1 className="page-title">Our Products</h1>

        { }
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 text-sm font-medium border ${activeCategory === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-foreground hover:bg-muted'
                } border-border rounded-l-md focus:outline-none`}
            >
              All Products
            </button>
            <button
              onClick={() => setActiveCategory('incense')}
              className={`px-4 py-2 text-sm font-medium border-t border-b border-r ${activeCategory === 'incense'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-foreground hover:bg-muted'
                } border-border focus:outline-none`}
            >
              Incense Sticks
            </button>
            <button
              onClick={() => setActiveCategory('ghee')}
              className={`px-4 py-2 text-sm font-medium border-t border-b border-r ${activeCategory === 'ghee'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-foreground hover:bg-muted'
                } border-border rounded-r-md focus:outline-none`}
            >
              A2 Cow Ghee
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card relative bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:border-sawatsya-terracotta dark:hover:border-dark-accent transition-all duration-300">
              {/* Wishlist Heart Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleWishlist(product);
                  toast.success(isInWishlist(product.id)
                    ? `${product.name} removed from wishlist`
                    : `${product.name} added to wishlist!`);
                }}
                className="absolute top-2 right-2 z-10 p-2 rounded-full bg-card/80 hover:bg-card shadow-md transition-all duration-200 hover:scale-110"
                aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${isInWishlist(product.id)
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-400 hover:text-red-400'
                    }`}
                />
              </button>

              <Link to={`/product/${product.id}`}>
                <div className="aspect-square mb-4">
                  <ProductImage src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-medium text-lg mb-1 text-foreground dark:text-[hsl(var(--product-title))]">{product.name}</h3>
              </Link>

              {product.category === 'incense' && (
                <p className="text-sm text-muted-foreground mb-2">Fragrance: {product.fragrance}</p>
              )}

              {product.category === 'ghee' && (
                <p className="text-sm text-muted-foreground mb-2">Weight: {product.weight}</p>
              )}

              <div className="flex justify-between items-center mt-4">
                <span className="text-lg font-semibold text-sawatsya-earth dark:text-dark-price">₹{product.price}</span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm border-primary text-primary hover:bg-muted dark:bg-[hsl(var(--product-details-btn))] dark:border-[hsl(var(--product-card-border))] dark:text-[hsl(var(--product-title))] dark:hover:border-[hsl(var(--product-card-hover-border))]"
                    asChild
                  >
                    <Link to={`/product/${product.id}`}>Details</Link>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    className="text-sm bg-sawatsya-earth hover:bg-sawatsya-wood dark:bg-[hsl(var(--product-cart-btn))] dark:hover:bg-[hsl(var(--accent-hover))]"
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center mt-12 mb-12">
            <p className="text-xl text-muted-foreground">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
