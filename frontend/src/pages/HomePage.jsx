import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import ProductCard from '../components/products/ProductCard';
import PrescriptionUpload from '../components/prescription/PrescriptionUpload';
import WhatsAppCommunities from '../components/whatsapp/WhatsAppCommunities';
import PriceComparisonSection from '../components/sections/PriceComparisonSection';
import PrescriptionCTASection from '../components/sections/PrescriptionCTASection';
import { 
  ArrowRight, 
  Shield, 
  Truck, 
  Award, 
  Users,
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  CheckCircle,
  Globe,
  FileText,
  Clock
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const categories = [
  { 
    name: 'Cancer Medications', 
    slug: 'Cancer', 
    description: 'Life-saving oncology treatments',
    icon: '🎗️',
    color: 'from-rose-500 to-pink-600'
  },
  { 
    name: 'HIV/AIDS Treatment', 
    slug: 'HIV/AIDS', 
    description: 'Antiretroviral therapies',
    icon: '💊',
    color: 'from-purple-500 to-indigo-600'
  },
  { 
    name: 'Hepatitis', 
    slug: 'Hepatitis', 
    description: 'Cure hepatitis C in 12 weeks',
    icon: '🏥',
    color: 'from-emerald-500 to-teal-600'
  },
  { 
    name: 'Erectile Dysfunction', 
    slug: 'Erectile Dysfunction', 
    description: 'Trusted ED medications',
    icon: '💪',
    color: 'from-blue-500 to-cyan-600'
  },
  { 
    name: 'Diabetes & Insulin', 
    slug: 'Diabetes & Insulin', 
    description: 'Insulin and oral medications',
    icon: '🩺',
    color: 'from-amber-500 to-orange-600'
  },
  { 
    name: 'Weight Loss', 
    slug: 'Weight Loss', 
    description: 'FDA-approved solutions',
    icon: '⚖️',
    color: 'from-green-500 to-emerald-600'
  },
];

const stats = [
  { value: '45+', label: 'Years of Excellence' },
  { value: '30+', label: 'Countries Served' },
  { value: '150K+', label: 'Happy Customers' },
  { value: '99%', label: 'Delivery Rate' },
];

const howItWorks = [
  {
    step: '01',
    title: 'Submit Your Requirements',
    description: 'Browse our catalog or fill out the inquiry form with your medication needs',
    icon: FileText,
  },
  {
    step: '02',
    title: 'Expert Consultation',
    description: 'Our pharmacists verify requirements and suggest the best options for you',
    icon: Users,
  },
  {
    step: '03',
    title: 'Secure Checkout',
    description: 'Upload prescription (if needed) and complete payment securely',
    icon: Shield,
  },
  {
    step: '04',
    title: 'Express Delivery',
    description: 'Receive authentic medications at your doorstep via insured shipping',
    icon: Truck,
  },
];

const manufacturers = [
  'Sun Pharma', 'Cipla', 'Dr. Reddy\'s', 'Lupin', 'Aurobindo', 
  'Zydus', 'Torrent', 'Biocon', 'Glenmark', 'Hetero',
  'Pfizer', 'Novartis', 'Roche', 'Gilead', 'Merck'
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [loading, setLoading] = useState(true);
  const [siteConfig, setSiteConfig] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!API_URL) {
        console.warn('Backend URL not defined');
        setLoading(false);
        return;
      }
      try {
        // Seed database first (ignore failure if already seeded)
        await fetch(`${API_URL}/api/seed`, { method: 'POST' }).catch(() => {});
        
        // Fetch site config
        const configRes = await fetch(`${API_URL}/api/site-config`);
        if (configRes.ok) {
          const config = await configRes.json();
          setSiteConfig(config);
        }

        // Fetch featured products
        const productsRes = await fetch(`${API_URL}/api/featured-products?limit=8`);
        if (productsRes.ok) {
          const products = await productsRes.json();
          setFeaturedProducts(products);
        }

        // Fetch testimonials
        const testimonialsRes = await fetch(`${API_URL}/api/testimonials`);
        if (testimonialsRes.ok) {
          const testimonialsData = await testimonialsRes.json();
          setTestimonials(testimonialsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (testimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [testimonials.length]);

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <section 
        className="hero-gradient py-16 md:py-24 relative overflow-hidden"
        style={siteConfig?.hero?.background_image_url ? {
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${siteConfig.hero.background_image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 opacity-0 animate-fade-in">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1">
                {siteConfig?.hero?.badge || '45+ Years of Heritage'}
              </Badge>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight">
                {siteConfig?.hero?.title?.includes(' ') ? (
                  <>
                    {siteConfig.hero.title.split(' ').slice(0, -2).join(' ')} {' '}
                    <span className="text-primary">{siteConfig.hero.title.split(' ').slice(-2).join(' ')}</span>
                  </>
                ) : (
                  siteConfig?.hero?.title || 'Global Access to Authentic Medicine'
                )}
              </h1>
              <p className="text-lg text-slate-600 max-w-xl">
                {siteConfig?.hero?.subtitle || 'Secure 100% original generic medications from India. Save over 60% with insured delivery to 30+ countries. Trusted by patients worldwide for nearly half a century.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={siteConfig?.hero?.primary_cta?.path || "/products"}>
                  <Button size="lg" className="rounded-full h-12 px-8" data-testid="view-products-btn">
                    {siteConfig?.hero?.primary_cta?.text || 'View All Products'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to={siteConfig?.hero?.secondary_cta?.path || "/consultation"}>
                  <Button size="lg" variant="outline" className="rounded-full h-12 px-8" data-testid="consultation-btn">
                    <Phone className="w-5 h-5 mr-2" />
                    {siteConfig?.hero?.secondary_cta?.text || 'Talk to Expert'}
                  </Button>
                </Link>
              </div>
              {/* Trust indicators */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {(siteConfig?.hero?.trust_avatars && siteConfig.hero.trust_avatars.length > 0 
                    ? siteConfig.hero.trust_avatars 
                    : [1, 2, 3, 4]
                  ).map((avatar, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white"
                      style={{
                        backgroundImage: `url(${typeof avatar === 'string' ? avatar : `https://i.pravatar.cc/100?img=${i + 14}`})`,
                        backgroundSize: 'cover',
                      }}
                    />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Serving {siteConfig?.hero?.patients_count || '150K+'} patients</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(siteConfig?.hero?.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    ))}
                    <span className="text-sm text-slate-500 ml-1">{siteConfig?.hero?.rating || '4.9'}/5</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative opacity-0 animate-fade-in animation-delay-200">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={siteConfig?.hero?.image_url || "https://images.unsplash.com/photo-1576091358783-a212ec293ff3?w=800"}
                  alt="Hero Content"
                  className="w-full h-auto"
                />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 z-20 opacity-0 animate-fade-in animation-delay-400">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    {(() => {
                      const IconComponent = require('lucide-react')[siteConfig?.hero?.floating_card_icon || 'CheckCircle'] || CheckCircle;
                      return <IconComponent className="w-6 h-6 text-green-600" />;
                    })()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{siteConfig?.hero?.floating_card_title || '100% Authentic'}</p>
                    <p className="text-sm text-slate-500">{siteConfig?.hero?.floating_card_subtitle || 'Verified Products'}</p>
                  </div>
                </div>
              </div>
              {/* Stats card */}
              <div className="absolute -top-6 -right-6 bg-primary text-white rounded-xl shadow-xl p-4 z-20 opacity-0 animate-fade-in animation-delay-300">
                <p className="text-3xl font-bold">{siteConfig?.hero?.savings_badge_percentage || '60%'}</p>
                <p className="text-sm text-primary-100">{siteConfig?.hero?.savings_badge_text || 'Average Savings'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      {/* Stats Section */}
      <section className="bg-slate-900 py-8">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {(siteConfig?.stats?.items || [
              {value: "45+", label: "Years of Excellence"},
              {value: "30+", label: "Countries Served"},
              {value: "150K+", label: "Happy Customers"},
              {value: "99%", label: "Delivery Rate"}
            ]).map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              {siteConfig?.categories_section?.badge || "Browse by Category"}
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {siteConfig?.categories_section?.title || "Life-Saving & Lifestyle Medications"}
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              {siteConfig?.categories_section?.subtitle || "We specialize in affordable generic medications for serious health conditions. All products are sourced from licensed manufacturers."}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(siteConfig?.categories_section?.cards || []).map((category, idx) => {
              const IconComponent = require('lucide-react')[category.icon_name || 'Package'] || Package;
              return (
                <Link
                  key={idx}
                  to={category.path || `/products?category=${encodeURIComponent(category.title)}`}
                  data-testid={`category-card-${idx}`}
                >
                  <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 h-full">
                    <CardContent className="p-6">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color_class || 'from-primary/10 to-primary/5'} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="font-heading font-semibold text-xl text-slate-900 mb-2 group-hover:text-primary transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-slate-500">{category.subtitle}</p>
                      <div className="flex items-center gap-2 mt-4 text-primary font-medium">
                        View Products
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                Best Sellers
              </Badge>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900">
                Most Popular Products
              </h2>
            </div>
            <Link to="/products">
              <Button variant="outline" className="rounded-full" data-testid="view-all-products-btn">
                View All Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-slate-200" />
                  <CardContent className="p-4 space-y-3">
                    <div className="h-4 bg-slate-200 rounded" />
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-8 bg-slate-200 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              How It Works
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Simple 4-Step Process
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Getting your medications delivered is easy. Follow these simple steps to start saving.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative text-center">
                <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                  {item.step}
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-slate-200" />
                )}
                <h3 className="font-heading font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <PrescriptionUpload 
              trigger={
                <Button size="lg" className="rounded-full h-12 px-8" data-testid="upload-rx-hero-btn">
                  <FileText className="w-5 h-5 mr-2" />
                  Upload Prescription Now
                </Button>
              }
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="text-center mb-12">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              Customer Stories
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Trusted by thousands of patients worldwide. Here's what they have to say about us.
            </p>
          </div>

          {testimonials.length > 0 && (
            <div className="max-w-4xl mx-auto">
              <Card className="border-0 shadow-xl">
                <CardContent className="p-8 md:p-12">
                  <Quote className="w-12 h-12 text-primary/20 mb-6" />
                  <p className="text-xl md:text-2xl text-slate-700 mb-8 leading-relaxed">
                    "{testimonials[currentTestimonial]?.comment}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={testimonials[currentTestimonial]?.avatar_url || 'https://i.pravatar.cc/100'}
                        alt={testimonials[currentTestimonial]?.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">
                          {testimonials[currentTestimonial]?.name}
                        </p>
                        <p className="text-slate-500 flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          {testimonials[currentTestimonial]?.country}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(testimonials[currentTestimonial]?.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonial navigation */}
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                  className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  data-testid="prev-testimonial-btn"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentTestimonial ? 'bg-primary' : 'bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                  className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  data-testid="next-testimonial-btn"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Manufacturers */}
      <section className="py-12 bg-slate-50 border-y border-slate-200">
        <div className="container-custom">
          <p className="text-center text-slate-500 mb-8">
            Trusted products from top pharmaceutical manufacturers
          </p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {manufacturers.map((name, index) => (
              <span
                key={index}
                className="text-slate-400 font-medium text-sm md:text-base hover:text-slate-600 transition-colors"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Price Comparison Section */}
      <PriceComparisonSection />

      {/* Prescription Upload CTA Section */}
      <PrescriptionCTASection />

      {/* WhatsApp Communities Section */}
      <WhatsAppCommunities />

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-slate-900">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              Need Help Finding Your Medication?
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Our expert pharmacists are available 24/7 to help you find the right medications 
              at the best prices. Connect with us today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/consultation">
                <Button size="lg" className="rounded-full h-12 px-8 bg-white text-slate-900 hover:bg-slate-100" data-testid="cta-consultation-btn">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Request Consultation
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="rounded-full h-12 px-8 border-slate-600 text-white hover:bg-slate-800" data-testid="cta-contact-btn">
                  <Phone className="w-5 h-5 mr-2" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Notice */}
      <section className="py-8 bg-green-50 border-t border-green-200">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Licensed & Compliant</p>
                <p className="text-sm text-green-600">
                  GST: 07AAIPG2896A1ZV | IEC: 0514067152
                </p>
              </div>
            </div>
            <p className="text-sm text-green-700 text-center md:text-right max-w-xl">
              MediSeller operates in compliance with Indian pharmaceutical regulations and 
              international trade laws. All products are verified for authenticity.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
