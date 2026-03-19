import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { WhatsAppContactButton } from '../components/whatsapp/WhatsAppButton';
import { toast } from 'sonner';
import {
  ChevronRight,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  CheckCircle,
  Loader2,
  Shield,
  Users,
  Globe,
  FileText,
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ConsultationPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    medication_query: '',
    preferred_contact: 'whatsapp',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.medication_query) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        toast.success('Consultation request submitted!');
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error('Consultation error:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 py-12" data-testid="consultation-success">
        <div className="container-custom max-w-lg">
          <Card className="text-center">
            <CardContent className="py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="font-heading text-2xl font-bold mb-2">Request Submitted!</h1>
              <p className="text-slate-600 mb-6">
                Our expert team will contact you within 24 hours via your preferred method.
              </p>
              <Link to="/products">
                <Button className="rounded-full" data-testid="browse-products-after-consultation">
                  Browse Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" data-testid="consultation-page">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="container-custom py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-slate-500 hover:text-primary">Home</Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 font-medium">Expert Consultation</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16">
        <div className="container-custom">
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Expert Consultation
            </h1>
            <p className="text-xl text-slate-300">
              Get personalized guidance from our team of pharmaceutical experts. 
              We help you find the right medications at the best prices.
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-2xl">Request a Consultation</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        data-testid="consultation-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        data-testid="consultation-email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (with country code) *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 234 567 8900"
                      required
                      data-testid="consultation-phone"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medication_query">What medication are you looking for? *</Label>
                    <Textarea
                      id="medication_query"
                      name="medication_query"
                      value={formData.medication_query}
                      onChange={handleChange}
                      placeholder="Please describe the medication you need, your condition, and any specific requirements..."
                      rows={4}
                      required
                      data-testid="consultation-query"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Preferred Contact Method *</Label>
                    <RadioGroup
                      value={formData.preferred_contact}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, preferred_contact: value }))
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="whatsapp" id="whatsapp" />
                        <Label htmlFor="whatsapp" className="font-normal cursor-pointer flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-green-600" />
                          WhatsApp
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="phone" id="phone-call" />
                        <Label htmlFor="phone-call" className="font-normal cursor-pointer flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-600" />
                          Phone Call
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="email-contact" />
                        <Label htmlFor="email-contact" className="font-normal cursor-pointer flex items-center gap-2">
                          <Mail className="w-4 h-4 text-purple-600" />
                          Email
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-full"
                    data-testid="submit-consultation-btn"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Request Consultation'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-heading font-semibold text-lg mb-4">Why Consult With Us?</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Expert Team</p>
                      <p className="text-sm text-slate-500">
                        Licensed pharmacists with decades of experience
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Sourcing Help</p>
                      <p className="text-sm text-slate-500">
                        We find hard-to-get medications from verified suppliers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Global Network</p>
                      <p className="text-sm text-slate-500">
                        Access to manufacturers across India
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">100% Authentic</p>
                      <p className="text-sm text-slate-500">
                        All products verified for authenticity
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 text-white">
              <CardContent className="p-6">
                <Clock className="w-8 h-8 mb-4" />
                <h3 className="font-heading font-semibold text-lg mb-2">Response Time</h3>
                <p className="text-slate-300">
                  Our team typically responds within <strong>24 hours</strong>. For urgent inquiries, 
                  please mention "URGENT" in your message.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-heading font-semibold text-lg mb-4">Direct Contact</h3>
                <div className="space-y-3">
                  <a href="tel:+1234567890" className="flex items-center gap-3 text-slate-600 hover:text-primary transition-colors">
                    <Phone className="w-5 h-5" />
                    +1 (234) 567-890
                  </a>
                  <a href="mailto:expert@mediseller.com" className="flex items-center gap-3 text-slate-600 hover:text-primary transition-colors">
                    <Mail className="w-5 h-5" />
                    expert@mediseller.com
                  </a>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <WhatsAppContactButton 
                    message="Hi MediSeller! I need expert consultation about my medication."
                    className="w-full justify-center"
                  >
                    Chat on WhatsApp
                  </WhatsAppContactButton>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
