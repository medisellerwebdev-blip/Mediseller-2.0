import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ArrowRight, DollarSign, TrendingDown, Check, AlertCircle } from 'lucide-react';

const priceComparisons = [
  {
    usName: 'Gleevec (Imatinib)',
    usPrice: 12000,
    indianName: 'Veenat (Imatinib)',
    indianPrice: 45,
    category: 'Cancer',
    dosage: '400mg, 30 tablets',
    savings: 99.6,
    monthlyUsage: '30 tablets/month',
  },
  {
    usName: 'Harvoni (Ledipasvir/Sofosbuvir)',
    usPrice: 31500,
    indianName: 'Ledifos (Ledipasvir/Sofosbuvir)',
    indianPrice: 38,
    category: 'Hepatitis C',
    dosage: '90/400mg, 28 tablets',
    savings: 99.9,
    monthlyUsage: '12-week treatment',
  },
  {
    usName: 'Truvada (PrEP)',
    usPrice: 2000,
    indianName: 'Tenvir-EM',
    indianPrice: 25,
    category: 'HIV Prevention',
    dosage: '300/200mg, 30 tablets',
    savings: 98.7,
    monthlyUsage: '30 tablets/month',
  },
  {
    usName: 'Wegovy (Semaglutide)',
    usPrice: 1350,
    indianName: 'Rybelsus (Semaglutide)',
    indianPrice: 125,
    category: 'Weight Loss',
    dosage: '2.4mg, 4 pens',
    savings: 90.7,
    monthlyUsage: '4 pens/month',
  },
  {
    usName: 'Viagra (Sildenafil)',
    usPrice: 70,
    indianName: 'Kamagra (Sildenafil)',
    indianPrice: 1.5,
    category: 'Erectile Dysfunction',
    dosage: '100mg, per tablet',
    savings: 97.8,
    monthlyUsage: 'As needed',
  },
  {
    usName: 'Lantus (Insulin Glargine)',
    usPrice: 350,
    indianName: 'Basalog (Insulin Glargine)',
    indianPrice: 38,
    category: 'Diabetes',
    dosage: '100U/ml, pen',
    savings: 89.1,
    monthlyUsage: '1-2 pens/month',
  },
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const PriceComparisonSection = () => {
  // Calculate total potential annual savings for a cancer patient
  const annualSavingsExample = (12000 - 45) * 12;

  return (
    <section className="py-16 md:py-24 bg-white" data-testid="price-comparison-section">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-green-100 text-green-700 border-green-200 mb-4">
            <TrendingDown className="w-3 h-3 mr-1" />
            Massive Savings
          </Badge>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            US Patented vs Indian Generic: The Truth
          </h2>
          <p className="text-slate-600 max-w-3xl mx-auto text-lg">
            Same active ingredients, same efficacy, same safety — but at a fraction of the cost. 
            See how much you can save by choosing quality Indian generics over expensive US brand-name drugs.
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12">
          <div className="flex flex-col md:flex-row items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-lg text-blue-900 mb-2">
                Why Such a Huge Price Difference?
              </h3>
              <p className="text-blue-800">
                US pharmaceutical companies hold patents that allow them to set monopoly prices. Indian law permits 
                licensed manufacturers to produce bioequivalent generics once patents expire or through compulsory licensing. 
                These generics contain the <strong>same active pharmaceutical ingredients (API)</strong>, undergo rigorous 
                quality testing, and are approved by <strong>WHO, FDA, and other global regulatory bodies</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Price Comparison Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {priceComparisons.map((item, index) => (
            <Card 
              key={index} 
              className="overflow-hidden border-slate-200 hover:shadow-xl transition-shadow"
              data-testid={`price-comparison-card-${index}`}
            >
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4">
                <Badge className="bg-white/20 text-white border-white/30 mb-2">
                  {item.category}
                </Badge>
                <p className="text-sm text-slate-300">{item.dosage}</p>
              </div>
              <CardContent className="p-6">
                {/* US Price */}
                <div className="mb-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      🇺🇸 US Brand Price
                    </span>
                  </div>
                  <p className="font-semibold text-lg text-slate-700">{item.usName}</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(item.usPrice)}</p>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center my-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-green-600" />
                  </div>
                </div>

                {/* Indian Price */}
                <div className="mb-4 pt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      🇮🇳 Indian Generic Price
                    </span>
                  </div>
                  <p className="font-semibold text-lg text-slate-700">{item.indianName}</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(item.indianPrice)}</p>
                </div>

                {/* Savings Badge */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-sm text-green-700 font-medium">You Save</p>
                  <p className="text-3xl font-bold text-green-600">{item.savings.toFixed(1)}%</p>
                  <p className="text-sm text-green-600">
                    {formatCurrency(item.usPrice - item.indianPrice)} per purchase
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Annual Savings Calculator */}
        <Card className="bg-gradient-to-br from-primary to-primary-600 text-white overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-heading text-2xl md:text-3xl font-bold mb-4">
                  Annual Savings Example
                </h3>
                <p className="text-primary-100 mb-6">
                  A cancer patient taking Gleevec (Imatinib) 400mg daily could save:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-300" />
                    <span>US yearly cost: <strong>{formatCurrency(12000 * 12)}</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-300" />
                    <span>India generic yearly cost: <strong>{formatCurrency(45 * 12)}</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-300" />
                    <span>Shipping included (approx. {formatCurrency(15 * 12)}/year)</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                  <p className="text-primary-100 mb-2">Total Annual Savings</p>
                  <p className="text-5xl md:text-6xl font-bold mb-2">
                    {formatCurrency(annualSavingsExample)}
                  </p>
                  <p className="text-primary-100">Per year on a single medication</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="mt-12 grid sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-semibold">FDA Approved Facilities</p>
              <p className="text-sm text-slate-500">WHO-GMP certified manufacturers</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold">Bioequivalent Formulas</p>
              <p className="text-sm text-slate-500">Same active ingredients & efficacy</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold">Quality Guaranteed</p>
              <p className="text-sm text-slate-500">Batch testing & verification</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PriceComparisonSection;
