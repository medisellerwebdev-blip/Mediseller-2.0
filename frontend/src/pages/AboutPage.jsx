import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  ChevronRight,
  Shield,
  Truck,
  Award,
  Users,
  Globe,
  Clock,
  CheckCircle,
  Building,
  FileText,
} from 'lucide-react';

const team = [
  { name: 'Quality Assurance Team', count: '15+ members', focus: 'Product Verification' },
  { name: 'Customer Support', count: '24/7 Available', focus: 'Multi-language Support' },
  { name: 'Logistics Team', count: '30+ countries', focus: 'Global Delivery' },
  { name: 'Pharmaceutical Experts', count: '20+ years exp.', focus: 'Medical Guidance' },
];

const milestones = [
  { year: '1981', event: 'Founded in Chandni Chowk, New Delhi' },
  { year: '1995', event: 'Started international distribution' },
  { year: '2005', event: 'Reached 50,000 patients served' },
  { year: '2015', event: 'Expanded to 20+ countries' },
  { year: '2020', event: 'Launched online platform' },
  { year: '2024', event: 'Serving 150,000+ patients in 30+ countries' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen" data-testid="about-page">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="container-custom py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-slate-500 hover:text-primary">Home</Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 font-medium">About Us</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <Badge className="bg-primary/20 text-primary-200 border-primary/30 mb-4">
              45+ Years of Excellence
            </Badge>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Trusted Pharmaceutical Partner Since 1981
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              MediSeller has been at the forefront of pharmaceutical distribution for over four decades. 
              We specialize in sourcing 100% authentic generic medications from India and delivering 
              them to patients worldwide at affordable prices.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="font-heading text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                To make life-saving medications accessible and affordable to patients worldwide. 
                We believe that no one should have to choose between their health and their financial 
                wellbeing. By connecting patients with quality generic medications from India, we help 
                families save thousands of dollars on their healthcare costs.
              </p>
            </div>
            <div>
              <h2 className="font-heading text-3xl font-bold mb-4">Our Vision</h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                To become the most trusted global online pharmacy, known for authenticity, 
                affordability, and excellent customer care. We envision a world where geographic 
                borders don't limit access to essential medications, and where patients can 
                confidently source their treatments at fair prices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-slate-50">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-primary">45+</p>
              <p className="text-slate-600 mt-2">Years Experience</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-primary">150K+</p>
              <p className="text-slate-600 mt-2">Patients Served</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-primary">30+</p>
              <p className="text-slate-600 mt-2">Countries</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-primary">99%</p>
              <p className="text-slate-600 mt-2">Delivery Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              The MediSeller Advantage
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              What sets us apart in the pharmaceutical distribution industry
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2">100% Authentic Products</h3>
                <p className="text-slate-600">
                  All medications are sourced directly from licensed manufacturers and undergo 
                  rigorous quality verification before shipment.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2">Global Delivery</h3>
                <p className="text-slate-600">
                  Insured express air shipping to over 30 countries with real-time tracking 
                  and discreet packaging for your privacy.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2">60%+ Savings</h3>
                <p className="text-slate-600">
                  Significant cost savings on brand-name equivalent medications through 
                  quality generic alternatives from India.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2">Expert Support</h3>
                <p className="text-slate-600">
                  Our team of pharmaceutical experts provides personalized guidance to help 
                  you find the right medications.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2">Global Network</h3>
                <p className="text-slate-600">
                  Partnerships with top 20 pharmaceutical manufacturers including Sun Pharma, 
                  Cipla, Dr. Reddy's, and more.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2">Fully Compliant</h3>
                <p className="text-slate-600">
                  Licensed pharmaceutical distributor operating in full compliance with 
                  Indian pharmaceutical regulations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Our Journey
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              45+ years of growth, trust, and commitment to patient care
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                      {milestone.year.slice(-2)}
                    </div>
                    {index < milestones.length - 1 && (
                      <div className="w-0.5 h-full bg-slate-300 mt-2" />
                    )}
                  </div>
                  <div className="pb-8">
                    <p className="font-semibold text-primary">{milestone.year}</p>
                    <p className="text-slate-600">{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-green-900 mb-2">
                    Licensed & Certified
                  </h3>
                  <p className="text-green-800 mb-4">
                    MediSeller (A Unit of Medicare) is a government-certified global exporter, 
                    all-India wholesaler, and retailer of authentic pharmaceutical products.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-white rounded-lg px-4 py-2 border border-green-200">
                      <p className="text-xs text-green-600">GST Number</p>
                      <p className="font-mono font-semibold text-green-900">07AAIPG2896A1ZV</p>
                    </div>
                    <div className="bg-white rounded-lg px-4 py-2 border border-green-200">
                      <p className="text-xs text-green-600">IEC Code</p>
                      <p className="font-mono font-semibold text-green-900">0514067152</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-slate-900 text-white">
        <div className="container-custom text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            Browse our catalog of authentic medications or speak with our expert team 
            to find the right solutions for your healthcare needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/products">
              <Button size="lg" className="rounded-full h-12 px-8 bg-white text-slate-900 hover:bg-slate-100">
                Browse Products
              </Button>
            </Link>
            <Link to="/consultation">
              <Button size="lg" variant="outline" className="rounded-full h-12 px-8 border-slate-600 text-white hover:bg-slate-800">
                Talk to Expert
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
