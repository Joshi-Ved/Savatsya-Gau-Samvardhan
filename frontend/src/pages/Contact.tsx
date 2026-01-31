
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    toast.success('Your message has been sent successfully!');
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="min-h-screen">
      <section className="bg-sawatsya-cream dark:bg-dark-background py-16 md:py-24">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-sawatsya-wood dark:text-gray-100 mb-4">Contact Us</h1>
            <p className="text-xl text-sawatsya-wood dark:text-gray-300">
              We'd love to hear from you. Get in touch with us.
            </p>
          </div>
        </div>
      </section>

      <section className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-serif font-medium text-sawatsya-wood dark:text-gray-100 mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Your Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-sawatsya-sand dark:border-dark-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-sawatsya-earth bg-white dark:bg-dark-input text-gray-900 dark:text-dark-foreground"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-sawatsya-sand dark:border-dark-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-sawatsya-earth bg-white dark:bg-dark-input text-gray-900 dark:text-dark-foreground"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-sawatsya-sand dark:border-dark-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-sawatsya-earth bg-white dark:bg-dark-input text-gray-900 dark:text-dark-foreground"
                >
                  <option value="">Select a subject</option>
                  <option value="product-inquiry">Product Inquiry</option>
                  <option value="order-status">Order Status</option>
                  <option value="feedback">Feedback</option>
                  <option value="wholesale">Wholesale Inquiry</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-sawatsya-sand dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sawatsya-earth bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                ></textarea>
              </div>

              <Button type="submit" className="btn-primary">
                Send Message
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-serif font-medium text-sawatsya-wood dark:text-gray-100 mb-6">Contact Information</h2>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
              <h3 className="font-medium text-lg text-sawatsya-wood dark:text-gray-100 mb-4">Reach Us</h3>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-sawatsya-cream rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                    <span className="text-sawatsya-earth text-lg">📍</span>
                  </div>
                  <div>
                    <p className="font-medium">Address</p>
                    <address className="not-italic text-gray-600">
                      Varade Gaon,<br />
                      Badlapur, Maharashtra<br />
                      India
                    </address>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-sawatsya-cream dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                    <span className="text-sawatsya-earth text-lg">📧</span>
                  </div>
                  <div>
                    <p className="font-medium dark:text-gray-100">Email</p>
                    <a href="mailto:vedjoshi0304@gmail.com" className="text-gray-600 dark:text-gray-400 hover:text-sawatsya-terracotta">
                      vedjoshi0304@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-sawatsya-cream dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                    <span className="text-sawatsya-earth text-lg">📞</span>
                  </div>
                  <div>
                    <p className="font-medium dark:text-gray-100">Phone</p>
                    <a href="tel:+91 9588958811" className="text-gray-600 dark:text-gray-400 hover:text-sawatsya-terracotta">
                      +91 9588958811
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="font-medium text-lg text-sawatsya-wood dark:text-gray-100 mb-4">Business Hours</h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Monday - Friday</span>
                  <span className="dark:text-gray-200">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Saturday</span>
                  <span className="dark:text-gray-200">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sunday</span>
                  <span className="dark:text-gray-200">Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="mt-12">
        <div className="h-80 rounded-lg overflow-hidden shadow-lg">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.5827392832823!2d73.23140907516897!3d19.128664882053658!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7ed005b6d2dd1%3A0xc4ef2742f5d9bfad!2sSavatsa%20Gau%20Savardhan!5e0!3m2!1sen!2sin!4v1698234567890!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Savatsya Gau Samvardhan Location - Varade Gaon, Badlapur, Maharashtra"
          ></iframe>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sawatsya-wood dark:text-gray-300 mb-2">
            <strong>Savatsya Gau Samvardhan</strong> - Varade Gaon, Badlapur, Maharashtra, India
          </p>
          <Button
            onClick={() => window.open("https://www.google.com/maps/place/Savatsa+Gau+Savardhan/@19.1286699,73.2314941,17z/data=!3m1!4b1!4m6!3m5!1s0x3be7ed005b6d2dd1:0xc4ef2742f5d9bfad!8m2!3d19.1286648!4d73.234069!16s%2Fg%2F11x5lg19np?entry=ttu&g_ep=EgoyMDI1MDUyOC4wIKXMDSoASAFQAw%3D%3D", '_blank')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <span>📍</span>
            Open in Google Maps
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Contact;
