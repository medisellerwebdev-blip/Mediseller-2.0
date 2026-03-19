import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  Shield,
  Truck,
  CreditCard,
  HeadphonesIcon
} from 'lucide-react';

const categories = [
  { name: 'Cancer Medications', slug: 'Cancer' },
  { name: 'HIV/AIDS Treatment', slug: 'HIV/AIDS' },
  { name: 'Hepatitis Medications', slug: 'Hepatitis' },
  { name: 'Erectile Dysfunction', slug: 'Erectile Dysfunction' },
  { name: 'Diabetes & Insulin', slug: 'Diabetes & Insulin' },
  { name: 'Weight Loss', slug: 'Weight Loss' },
];

export const Footer = () => {
  return (
    <footer className="footer-pattern text-white">
      {/* Trust badges */}
      <div className="border-b border-slate-700">
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">100% Authentic</p>
                <p className="text-sm text-slate-400">Verified Products</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Global Delivery</p>
                <p className="text-sm text-slate-400">30+ Countries</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Secure Payment</p>
                <p className="text-sm text-slate-400">SSL Encrypted</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <HeadphonesIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Expert Support</p>
                <p className="text-sm text-slate-400">24/7 Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="font-heading font-bold text-xl">MediSeller</span>
            </div>
            <p className="text-slate-400 mb-4">
              Your trusted global online pharmacy with 45+ years of excellence. 
              We provide authentic generic medications at affordable prices to patients worldwide.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Categories</h4>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link 
                    to={`/products?category=${encodeURIComponent(cat.slug)}`}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-slate-400 hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/consultation" className="text-slate-400 hover:text-white transition-colors">
                  Expert Consultation
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-slate-400 hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <span className="text-slate-400">
                  Chandni Chowk, New Delhi<br />
                  Delhi 110006, India
                </span>
              </li>
              <li>
                <a href="tel:+1234567890" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                  <Phone className="w-5 h-5 text-primary" />
                  +1 (234) 567-890
                </a>
              </li>
              <li>
                <a href="mailto:support@mediseller.com" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                  <Mail className="w-5 h-5 text-primary" />
                  support@mediseller.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Compliance notice */}
      <div className="border-t border-slate-700">
        <div className="container-custom py-6">
          <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-400 text-center">
              <strong className="text-white">Important Notice:</strong> MediSeller is a licensed pharmaceutical distributor. 
              All medications require a valid prescription. We comply with international pharmaceutical regulations and 
              Indian pharmacy laws. Products are sourced from licensed manufacturers and undergo quality verification. 
              Please consult your healthcare provider before starting any medication.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} MediSeller. All rights reserved. | GST No. 07AAIPG2896A1ZV | IEC: 0514067152
            </p>
            <div className="flex gap-4 text-sm text-slate-500">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/refund" className="hover:text-white transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
