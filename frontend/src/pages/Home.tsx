
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import ProductImage from '@/components/ui/ProductImage';
import { products } from '@/data/products';
import { useWishlist } from '@/contexts/WishlistContext';
import AnimatedPage from '@/components/ui/AnimatedPage';
import { AnimatedCard, AnimatedText, AnimatedButton, FloatingElement } from '@/components/ui/AnimatedComponents';
import { API_ENDPOINTS } from '@/config/api';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const featuredProducts = products.slice(0, 3);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [submittingNewsletter, setSubmittingNewsletter] = useState(false);

  const handleSubmitNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubscribe();
  };

  const handleSubscribe = async () => {
    const email = newsletterEmail.trim().toLowerCase();
    if (!email) return toast.error('Please enter your email');
    try {
      setSubmittingNewsletter(true);
      const res = await fetch(API_ENDPOINTS.NEWSLETTER.SUBSCRIBE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Subscription failed');
      toast.success('Subscribed! You will receive updates on new products.');
      setNewsletterEmail('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Subscription failed');
    } finally {
      setSubmittingNewsletter(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen">
        { }
        <section className="hero-section flex items-center bg-white dark:bg-dark-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
            <div className="max-w-lg">
              <AnimatedText variant="h1" className="text-5xl md:text-6xl font-serif font-bold text-sawatsya-wood dark:text-gray-100 mb-4">
                Pure & Natural Products
              </AnimatedText>
              <AnimatedText delay={0.2} className="text-xl text-sawatsya-wood dark:text-gray-300 mb-6">
                Handcrafted incense sticks and authentic A2 cow ghee made with traditional methods by Savatsya Gau Samvardhan.
              </AnimatedText>
              <div className="flex flex-col sm:flex-row gap-4">
                <AnimatedButton delay={0.4} className="btn-primary" onClick={() => navigate('/products')}>
                  Shop Now
                </AnimatedButton>
                <AnimatedButton delay={0.5} variant="secondary" className="border-sawatsya-earth text-sawatsya-earth hover:bg-sawatsya-cream" onClick={() => navigate('/about')}>
                  Learn More
                </AnimatedButton>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 h-full w-1/2 bg-sawatsya-sand opacity-30 hidden md:block"></div>
        </section>

        { }
        <section className="section-container">
          <h2 className="section-title text-center dark:text-gray-100">Our Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-sawatsya-cream dark:bg-dark-card rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="font-serif text-2xl mb-2 text-sawatsya-wood dark:text-gray-100">Incense Sticks (Dhoop)</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Handcrafted with natural ingredients, our incense sticks create a serene atmosphere with their delicate fragrances. Made using traditional methods for the purest experience.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sawatsya-earth font-medium">₹40 per pack</span>
                <Button asChild variant="outline" className="border-sawatsya-earth text-sawatsya-earth hover:bg-sawatsya-cream">
                  <Link to="/products/incense">View Products</Link>
                </Button>
              </div>
            </div>

            <div className="bg-sawatsya-cream dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="font-serif text-2xl mb-2 text-sawatsya-wood dark:text-gray-100">A2 Cow Ghee</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Pure, authentic ghee made from A2 cow milk using traditional bilona method for maximum nutrients and flavor. Sourced from our own gau samvardhan (cow protection) center.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sawatsya-earth font-medium">₹2200 per kg</span>
                <Button asChild variant="outline" className="border-sawatsya-earth text-sawatsya-earth hover:bg-sawatsya-cream">
                  <Link to="/products/ghee">View Products</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        { }
        <section className="bg-sawatsya-sand/30 dark:bg-gray-800 py-12 md:py-16">
          <div className="section-container">
            <AnimatedText variant="h2" className="section-title text-center dark:text-gray-100">
              Featured Products
            </AnimatedText>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
              {featuredProducts.map((product, index) => (
                <FloatingElement key={product.id} duration={3 + index * 0.5} yOffset={8}>
                  <AnimatedCard delay={0.2 + index * 0.1} className="product-card relative">
                    {/* Wishlist Heart Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product);
                        toast.success(isInWishlist(product.id)
                          ? `${product.name} removed from wishlist`
                          : `${product.name} added to wishlist!`);
                      }}
                      className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all duration-200 hover:scale-110"
                      aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart
                        className={`h-5 w-5 transition-colors ${isInWishlist(product.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-400 hover:text-red-400'
                          }`}
                      />
                    </button>

                    <div className="aspect-square mb-4">
                      <ProductImage src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-medium text-lg mb-2 text-sawatsya-wood dark:text-gray-100">{product.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sawatsya-earth">₹{product.price}</span>
                      <AnimatedButton className="btn-primary" onClick={() => navigate(`/product/${product.id}`)}>
                        View Details
                      </AnimatedButton>
                    </div>
                  </AnimatedCard>
                </FloatingElement>
              ))}
            </div>
            <div className="text-center mt-10">
              <Button asChild className="btn-primary">
                <Link to="/products">View All Products</Link>
              </Button>
            </div>
          </div>
        </section>

        { }
        <section className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="section-title dark:text-gray-100">About Savatsya Gau Samvardhan</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                At Savatsya Gau Samvardhan, we believe in preserving traditional methods to create pure and natural products. Our incense sticks and A2 cow ghee are made with carefully selected ingredients to ensure the highest quality.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Our gau samvardhan (cow protection) initiative ensures that our cows are treated with love and care, following ancient Vedic principles. Every product is crafted with devotion, bringing the goodness of nature to your home.
              </p>
              <Button asChild className="btn-primary">
                <Link to="/about">Read Our Story</Link>
              </Button>
            </div>
            <div className="bg-sawatsya-cream dark:bg-gray-800 rounded-lg h-80 flex items-center justify-center">
              <span className="text-2xl font-serif text-sawatsya-earth dark:text-gray-100">Our Sacred Mission</span>
            </div>
          </div>
        </section>

        { }
        <section className="bg-sawatsya-sand/30 dark:bg-dark-muted py-12 md:py-16">
          <div className="section-container">
            <h2 className="section-title text-center dark:text-gray-100">What Our Customers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-sm">
                <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                  "The fragrance of these incense sticks is incredible. So pure and long-lasting. I've been using them for meditation and they create the perfect spiritual atmosphere."
                </p>
                <p className="font-medium text-sawatsya-wood dark:text-gray-100">- Priya S.</p>
              </div>
              <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-sm">
                <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                  "This A2 ghee is exceptional! The aroma and taste are simply divine. It reminds me of the ghee my grandmother used to make from our village cows."
                </p>
                <p className="font-medium text-sawatsya-wood dark:text-gray-100">- Rahul M.</p>
              </div>
              <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-sm">
                <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                  "I love the dedication to cow protection and natural products. You can really feel the purity and positive energy in everything they create."
                </p>
                <p className="font-medium text-sawatsya-wood dark:text-gray-100">- Anjali P.</p>
              </div>
            </div>
          </div>
        </section>

        { }
        <section className="section-container">
          <div className="bg-sawatsya-cream dark:bg-dark-card rounded-lg p-8 text-center">
            <h2 className="text-2xl font-serif font-medium text-sawatsya-wood dark:text-gray-100 mb-4">Join Our Newsletter</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-md mx-auto">
              Stay updated with our latest products, special offers, and traditional recipes from Savatsya Gau Samvardhan.
            </p>
            <form onSubmit={handleSubmitNewsletter} className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-2 border border-sawatsya-sand dark:border-dark-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-sawatsya-earth bg-white dark:bg-dark-input text-gray-900 dark:text-dark-foreground"
              />
              <Button type="submit" className="btn-primary whitespace-nowrap" disabled={submittingNewsletter}>
                {submittingNewsletter ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </AnimatedPage>
  );
};

export default Home;
