
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-sawatsya-wood dark:bg-dark-footer mt-16 border-t border-sawatsya-earth/50 dark:border-dark-border text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-serif mb-4 dark:text-[hsl(var(--footer-heading))]">SAWATSYA</h3>
            <span className="text-sawatsya-sand dark:text-dark-foreground font-serif text-xl font-semibold">
              Pure, authentic incense sticks and A2 cow ghee made with traditional methods and love.
            </span>
          </div>

          <div>
            <h4 className="font-medium mb-4 dark:text-[hsl(var(--footer-heading))]">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sawatsya-sand dark:text-[hsl(var(--footer-link))] hover:text-white dark:hover:text-[hsl(var(--footer-link-hover))] transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sawatsya-sand dark:text-[hsl(var(--footer-link))] hover:text-white dark:hover:text-[hsl(var(--footer-link-hover))] transition-colors text-sm">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="flex items-center space-x-2 text-sawatsya-sand dark:text-[hsl(var(--footer-link))] hover:text-white dark:hover:text-[hsl(var(--footer-link-hover))] transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sawatsya-sand dark:text-[hsl(var(--footer-link))] hover:text-white dark:hover:text-[hsl(var(--footer-link-hover))] transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4 dark:text-[hsl(var(--footer-heading))]">Products</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products/incense" className="text-sawatsya-sand dark:text-[hsl(var(--footer-link))] hover:text-white dark:hover:text-[hsl(var(--footer-link-hover))] transition-colors text-sm">
                  Incense Sticks
                </Link>
              </li>
              <li>
                <Link to="/products/ghee" className="text-sawatsya-sand dark:text-[hsl(var(--footer-link))] hover:text-white dark:hover:text-[hsl(var(--footer-link-hover))] transition-colors text-sm">
                  A2 Cow Ghee
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4 dark:text-[hsl(var(--footer-heading))]">Contact Us</h4>
            <address className="text-sawatsya-sand dark:text-[hsl(var(--footer-link))] text-sm not-italic">
              Email: <a href="mailto:info@sawatsya.com" className="hover:text-white dark:hover:text-[hsl(var(--footer-link-hover))] transition-colors">info@sawatsya.com</a><br />
              Phone: +91 9876543210<br />
              Address: New Delhi, India
            </address>
          </div>
        </div>

        <div className="border-t border-sawatsya-cream/20 dark:border-[hsl(var(--footer-border))] mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-sawatsya-sand dark:text-[hsl(var(--footer-copyright))]">&copy; {currentYear} SAWATSYA. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <ul className="flex space-x-6">
              <li>
                <a href="#" className="text-sawatsya-sand dark:text-[hsl(var(--footer-link))] hover:text-white dark:hover:text-[hsl(var(--footer-link-hover))] transition-colors text-sm">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="text-sawatsya-sand dark:text-[hsl(var(--footer-link))] hover:text-white dark:hover:text-[hsl(var(--footer-link-hover))] transition-colors text-sm">
                  Privacy
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
