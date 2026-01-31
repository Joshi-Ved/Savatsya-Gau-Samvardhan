
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen">
      { }
      <section className="bg-sawatsya-cream dark:bg-dark-background py-16 md:py-24">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-sawatsya-wood dark:text-gray-100 mb-4">Our Story</h1>
            <p className="text-xl text-sawatsya-wood dark:text-gray-300">
              Preserving tradition, delivering purity in every product.
            </p>
          </div>
        </div>
      </section>

      { }
      <section className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="section-title dark:text-gray-100">Our Mission</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              At SAWATSYA, our mission is to preserve and promote traditional Indian methods of creating pure, natural products. We believe that the wisdom of our ancestors should not be lost in the rush of modern manufacturing processes.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Every product we offer is crafted with care, using time-honored techniques and the finest natural ingredients. Our incense sticks and A2 cow ghee are testament to our commitment to quality and authenticity.
            </p>
          </div>
          <div className="h-80 rounded-lg flex items-center justify-center relative overflow-hidden group">
            <div
              className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: "url('/images/products/ghee/ghee-1kg.jpeg')" }}
            />
            <div className="absolute inset-0 bg-black/50 z-10" />
            <div className="text-center relative z-20">
              <h3 className="text-3xl font-serif text-white mb-2">Quality & Tradition</h3>
              <p className="text-sawatsya-cream text-lg">Since 2010</p>
            </div>
          </div>
        </div>
      </section>

      { }
      <section className="bg-sawatsya-sand/30 dark:bg-dark-muted py-12 md:py-16">
        <div className="section-container">
          <h2 className="section-title text-center dark:text-gray-100">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-sm">
              <h3 className="font-serif text-xl mb-4 text-sawatsya-wood dark:text-gray-100">Authenticity</h3>
              <p className="text-gray-700 dark:text-gray-300">
                We stay true to traditional methods, never compromising on the authenticity of our production processes or the quality of our ingredients.
              </p>
            </div>

            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-sm">
              <h3 className="font-serif text-xl mb-4 text-sawatsya-wood dark:text-gray-100">Sustainability</h3>
              <p className="text-gray-700 dark:text-gray-300">
                We respect nature and work to ensure our practices are sustainable, minimizing our environmental footprint at every step.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
              <h3 className="font-serif text-xl mb-4 text-sawatsya-wood dark:text-gray-100">Community</h3>
              <p className="text-gray-700 dark:text-gray-300">
                We support local artisans and farmers, ensuring fair compensation and helping to preserve traditional skills within communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      { }
      <section className="section-container">
        <h2 className="section-title text-center dark:text-gray-100">Our Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
          <div>
            <h3 className="font-serif text-2xl mb-4 text-sawatsya-wood dark:text-gray-100">Incense Sticks</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Our incense sticks are hand-rolled using natural ingredients like bamboo sticks, wood powder, and essential oils. Each fragrance is carefully crafted to provide a unique aromatic experience.
            </p>
            <ol className="space-y-4">
              <li className="flex">
                <span className="font-medium mr-2">1.</span>
                <span>Selection of premium quality natural ingredients and essential oils</span>
              </li>
              <li className="flex">
                <span className="font-medium mr-2">2.</span>
                <span>Traditional hand-rolling technique to create the perfect consistency</span>
              </li>
              <li className="flex">
                <span className="font-medium mr-2">3.</span>
                <span>Natural drying process without artificial accelerants</span>
              </li>
              <li className="flex">
                <span className="font-medium mr-2">4.</span>
                <span>Quality check to ensure consistent fragrance and burning time</span>
              </li>
            </ol>
          </div>

          <div>
            <h3 className="font-serif text-2xl mb-4 text-sawatsya-wood dark:text-gray-100">A2 Cow Ghee</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Our ghee is made using the traditional bilona method, which involves slowly churning curd from A2 cow milk to extract butter, which is then clarified to produce pure ghee.
            </p>
            <ol className="space-y-4">
              <li className="flex">
                <span className="font-medium mr-2">1.</span>
                <span>Collection of milk from indigenous A2 cows raised with care</span>
              </li>
              <li className="flex">
                <span className="font-medium mr-2">2.</span>
                <span>Natural fermentation to create curd rich in probiotics</span>
              </li>
              <li className="flex">
                <span className="font-medium mr-2">3.</span>
                <span>Traditional hand churning using wooden churners (bilona method)</span>
              </li>
              <li className="flex">
                <span className="font-medium mr-2">4.</span>
                <span>Slow clarification process to retain all nutrients and flavors</span>
              </li>
            </ol>
          </div>
        </div>
      </section>

      { }
      <section className="bg-sawatsya-sand/30 dark:bg-gray-800 py-12 md:py-16">
        <div className="section-container">
          <h2 className="section-title text-center dark:text-gray-100">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm text-center">
              <div className="w-32 h-32 mx-auto bg-sawatsya-earth rounded-full mb-4"></div>
              <h3 className="font-medium text-lg text-sawatsya-wood dark:text-gray-100">AJINKYA VAZE</h3>
              <p className="text-sawatsya-terracotta dark:text-sawatsya-amber mb-2">Founder & CEO</p>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Visionary leader dedicated to preserving authentic Vedic traditions and bringing pure, natural products to the world.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm text-center">
              <div className="w-32 h-32 mx-auto bg-sawatsya-leaf rounded-full mb-4"></div>
              <h3 className="font-medium text-lg text-sawatsya-wood dark:text-gray-100">GAURI JOSHI</h3>
              <p className="text-sawatsya-terracotta dark:text-sawatsya-amber mb-2">Co-Founder & Director</p>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Passionate about sustainable practices and quality assurance, ensuring every product reflects our commitment to excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      { }
      <section className="section-container">
        <div className="bg-sawatsya-cream dark:bg-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-serif font-medium text-sawatsya-wood dark:text-gray-100 mb-4">Experience the Difference</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Discover the authentic quality of traditional products made with care and respect for ancient wisdom.
          </p>
          <Button asChild className="btn-primary">
            <Link to="/products">Shop Our Products</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default About;
