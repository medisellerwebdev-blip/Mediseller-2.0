import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MessageCircle, Users, Gift, Bell, Pill, Heart, Activity, Zap } from 'lucide-react';

const communities = [
  {
    id: 'cancer',
    name: 'Cancer Support Community',
    description: 'Get updates on cancer medications, new treatments, and exclusive discounts',
    icon: Heart,
    color: 'bg-rose-500',
    members: '5,000+',
    link: 'https://chat.whatsapp.com/cancer-community',
  },
  {
    id: 'hiv',
    name: 'HIV/AIDS Support',
    description: 'Connect with others, get medication updates and special pricing alerts',
    icon: Pill,
    color: 'bg-purple-500',
    members: '3,500+',
    link: 'https://chat.whatsapp.com/hiv-community',
  },
  {
    id: 'hepatitis',
    name: 'Hepatitis Cure Community',
    description: 'Updates on HCV treatments, success stories, and member-only offers',
    icon: Activity,
    color: 'bg-emerald-500',
    members: '4,200+',
    link: 'https://chat.whatsapp.com/hepatitis-community',
  },
  {
    id: 'diabetes',
    name: 'Diabetes & Insulin Group',
    description: 'Insulin deals, diabetes management tips, and new product launches',
    icon: Zap,
    color: 'bg-amber-500',
    members: '8,000+',
    link: 'https://chat.whatsapp.com/diabetes-community',
  },
  {
    id: 'weightloss',
    name: 'Weight Loss Journey',
    description: 'Wegovy, Ozempic updates, transformation stories, and exclusive offers',
    icon: Activity,
    color: 'bg-green-500',
    members: '6,500+',
    link: 'https://chat.whatsapp.com/weightloss-community',
  },
  {
    id: 'general',
    name: 'MediSeller Deals & Offers',
    description: 'Flash sales, new arrivals, and exclusive discount codes for all medications',
    icon: Gift,
    color: 'bg-primary',
    members: '12,000+',
    link: 'https://chat.whatsapp.com/mediseller-deals',
  },
];

export const WhatsAppCommunities = () => {
  const handleJoin = (link) => {
    window.open(link, '_blank');
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-green-50 to-emerald-50" data-testid="whatsapp-communities-section">
      <div className="container-custom">
        <div className="text-center mb-12">
          <Badge className="bg-green-100 text-green-700 border-green-200 mb-4">
            <MessageCircle className="w-3 h-3 mr-1" />
            WhatsApp Communities
          </Badge>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Join Our WhatsApp Communities
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Connect with thousands of patients worldwide. Get exclusive offers, new product alerts, 
            and be the first to know about flash sales and discounts.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => {
            const Icon = community.icon;
            return (
              <Card 
                key={community.id} 
                className="group border-slate-200 hover:border-green-300 hover:shadow-lg transition-all duration-300"
                data-testid={`community-card-${community.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${community.color} rounded-xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold text-lg mb-1">{community.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-500">{community.members} members</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-3 mb-4">{community.description}</p>
                  <Button 
                    onClick={() => handleJoin(community.link)}
                    className="w-full bg-green-500 hover:bg-green-600 rounded-full"
                    data-testid={`join-community-${community.id}`}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Join Community
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-slate-500">
            <Bell className="w-4 h-4 inline mr-1" />
            Turn on notifications to never miss a deal!
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhatsAppCommunities;
