import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ProductImage from '@/components/ui/ProductImage';
import { Heart, ShoppingCart, Trash2, TrendingDown, Package } from 'lucide-react';
import { toast } from 'sonner';

const Wishlist = () => {
    const { items, removeFromWishlist, clearWishlist, getPriceDropItems, getItemCount } = useWishlist();
    const { addToCart } = useCart();

    const priceDropItems = getPriceDropItems();
    const itemCount = getItemCount();

    const handleAddToCart = (item: typeof items[0]) => {
        addToCart(item.product, 1);
        toast.success(`${item.product.name} added to cart!`);
    };

    const handleRemove = (productId: string, productName: string) => {
        removeFromWishlist(productId);
        toast.success(`${productName} removed from wishlist`);
    };

    if (itemCount === 0) {
        return (
            <div className="text-center py-12">
                <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-500 mb-6">Start adding products you love!</p>
                <Button asChild className="bg-sawatsya-earth hover:bg-sawatsya-wood">
                    <Link to="/products">Browse Products</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with count and clear button */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium text-sawatsya-wood">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'} in your wishlist
                    </h3>
                    {priceDropItems.length > 0 && (
                        <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                            <TrendingDown className="h-4 w-4" />
                            {priceDropItems.length} {priceDropItems.length === 1 ? 'item has' : 'items have'} dropped in price!
                        </p>
                    )}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        clearWishlist();
                        toast.success('Wishlist cleared');
                    }}
                    className="text-red-500 border-red-500 hover:bg-red-50"
                >
                    Clear All
                </Button>
            </div>

            {/* Wishlist Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => {
                    const hasPriceDropped = item.product.price < item.priceAtAddition;
                    const priceDrop = item.priceAtAddition - item.product.price;

                    return (
                        <Card key={item.product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="relative">
                                <Link to={`/product/${item.product.id}`}>
                                    <div className="aspect-square">
                                        <ProductImage
                                            src={item.product.image}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </Link>

                                {/* Price Drop Badge */}
                                {hasPriceDropped && (
                                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                        <TrendingDown className="h-3 w-3" />
                                        ₹{priceDrop} OFF
                                    </div>
                                )}
                            </div>

                            <CardContent className="p-4">
                                <Link to={`/product/${item.product.id}`}>
                                    <h4 className="font-medium text-sawatsya-wood hover:text-sawatsya-earth transition-colors mb-1">
                                        {item.product.name}
                                    </h4>
                                </Link>

                                <div className="flex items-center gap-2 mb-3">
                                    <span className="font-bold text-sawatsya-earth">₹{item.product.price}</span>
                                    {hasPriceDropped && (
                                        <span className="text-sm text-gray-400 line-through">₹{item.priceAtAddition}</span>
                                    )}
                                </div>

                                <p className="text-xs text-gray-500 mb-3">
                                    Added {new Date(item.addedAt).toLocaleDateString()}
                                </p>

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="flex-1 bg-sawatsya-earth hover:bg-sawatsya-wood"
                                        onClick={() => handleAddToCart(item)}
                                    >
                                        <ShoppingCart className="h-4 w-4 mr-1" />
                                        Add to Cart
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-500 border-red-500 hover:bg-red-50"
                                        onClick={() => handleRemove(item.product.id, item.product.name)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default Wishlist;
