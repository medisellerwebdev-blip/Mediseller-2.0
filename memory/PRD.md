# MediSeller - Online Pharmacy Platform PRD

## Project Overview
MediSeller is a modern online pharmacy platform serving as a cross-border delivery platform for life-saving and lifestyle medicines. Built with React frontend, FastAPI backend, and MongoDB database.

## Original Problem Statement
Build a modern website for MediSeller, an online pharmacy operating in multiple countries as a cross-border delivery platform for life-saving and lifestyle medicines with:
- All essential e-commerce pharmacy features
- Categories for different diseases (Cancer, HIV, Hepatitis, Erectile Dysfunction, Insulin/Diabetes, Weight Loss)
- 20 medications per category
- Customer testimonials section
- Prescription approval and uploading system
- Compliance with Indian online pharmacy regulations
- Optional login system (guest checkout + Google social login)
- White and red brand colors
- WhatsApp chat integration
- WhatsApp communities for specific use cases
- Price comparison: US patented vs Indian generic medications

## User Personas
1. **International Patient**: Seeking affordable generic medications for chronic conditions (cancer, HIV, hepatitis)
2. **Healthcare Cost Optimizer**: Looking for significant savings on prescribed medications
3. **Lifestyle Medicine Seeker**: Looking for ED, weight loss, diabetes medications
4. **Caregiver**: Ordering medications on behalf of family members

## Core Requirements
- Product catalog with 120 medications across 6 categories
- Guest checkout capability (no account required)
- Google OAuth for optional account creation
- Prescription upload system
- Shopping cart with session persistence
- Expert consultation request system
- Contact inquiry system
- Compliance badges and notices
- WhatsApp integration for customer support and communities

## Technical Architecture
- **Frontend**: React 18, Tailwind CSS, Shadcn/UI components
- **Backend**: FastAPI (Python 3.11)
- **Database**: MongoDB
- **Authentication**: Emergent Google OAuth (optional)
- **Payment**: MOCKED (placeholder for future integration)

## What's Been Implemented (March 1, 2026)

### Backend (FastAPI)
- ✅ Product CRUD endpoints with category filtering
- ✅ Cart management (add/update/remove/clear)
- ✅ Order creation (guest + authenticated)
- ✅ Prescription upload endpoint
- ✅ Testimonials endpoint
- ✅ Contact inquiry endpoint
- ✅ Expert consultation endpoint
- ✅ Google OAuth session exchange
- ✅ Database seeding with 120 products + testimonials

### Frontend (React)
- ✅ Homepage with hero, stats, categories, featured products, testimonials, how it works
- ✅ Products listing page with filters, search, sorting
- ✅ Product detail page with full information
- ✅ Cart sidebar with quantity management
- ✅ Checkout page with guest checkout support
- ✅ Prescription upload dialog
- ✅ Expert consultation page
- ✅ Contact page
- ✅ About page
- ✅ User dashboard (for authenticated users)
- ✅ Google OAuth integration

### NEW: WhatsApp Integration (March 1, 2026)
- ✅ Global floating WhatsApp chat button (bottom-right on all pages)
- ✅ WhatsApp Contact buttons throughout the site
- ✅ WhatsApp Communities section with 6 community cards:
  - Cancer Support Community
  - HIV/AIDS Support
  - Hepatitis Cure Community
  - Diabetes & Insulin Group
  - Weight Loss Journey
  - MediSeller Deals & Offers

### NEW: Price Comparison Section (March 1, 2026)
- ✅ US Patented vs Indian Generic comparison cards
- ✅ 6 medication comparisons showing massive savings:
  - Gleevec (Imatinib) $12,000 vs $45 (99.6% savings)
  - Harvoni (HCV) $31,500 vs $38 (99.9% savings)
  - Truvada (PrEP) $2,000 vs $25 (98.7% savings)
  - Wegovy (Semaglutide) $1,350 vs $125 (90.7% savings)
  - Viagra (Sildenafil) $70 vs $1.50 (97.8% savings)
  - Lantus (Insulin) $350 vs $38 (89.1% savings)
- ✅ Annual savings calculator showing $143,000+ potential savings
- ✅ Trust indicators (FDA approved, bioequivalent, quality guaranteed)

### NEW: Prescription CTA Section (March 1, 2026)
- ✅ Upload prescription with step-by-step guide
- ✅ WhatsApp contact buttons for expert help
- ✅ Expert consultation card with multiple contact options

### Design System
- Primary color: Red (#E11D48)
- Font: Plus Jakarta Sans (headings), Inter (body)
- Modern, professional medical aesthetic
- Responsive design for all screen sizes

## Product Categories
1. **Cancer** - 20 medications (Gleevec, Revlimid, Ibrutinib, etc.)
2. **HIV/AIDS** - 20 medications (Truvada, Biktarvy, Tenvir-EM, etc.)
3. **Hepatitis** - 20 medications (Epclusa, Harvoni, Sovaldi, etc.)
4. **Erectile Dysfunction** - 20 medications (Viagra, Cialis, Levitra, etc.)
5. **Diabetes & Insulin** - 20 medications (Lantus, Ozempic, Jardiance, etc.)
6. **Weight Loss** - 20 medications (Wegovy, Saxenda, Mounjaro, etc.)

## Compliance Features
- GST Number displayed: 07AAIPG2896A1ZV
- IEC Code displayed: 0514067152
- Prescription required badges on products
- Medical disclaimer notices
- Terms & conditions, privacy policy pages (placeholder)

## Prioritized Backlog

### P0 (Critical - Complete)
- [x] Product catalog and browsing
- [x] Cart functionality
- [x] Checkout flow
- [x] Basic pages (home, products, about, contact)
- [x] WhatsApp integration (floating button, communities, CTAs)
- [x] Price comparison section

### P1 (High Priority - Future)
- [ ] Stripe/Razorpay payment integration
- [ ] Order tracking system
- [ ] Email notifications (SendGrid/Resend)
- [ ] Admin dashboard for order management
- [ ] Real WhatsApp community group links

### P2 (Medium Priority - Future)
- [ ] Multi-language support
- [ ] Currency conversion
- [ ] Live chat support
- [ ] Advanced search with auto-complete
- [ ] Product reviews and ratings

### P3 (Nice to Have)
- [ ] Wishlist functionality
- [ ] Product recommendations
- [ ] Blog/health articles section
- [ ] Referral program
- [ ] Subscription for recurring orders

## Next Action Items
1. Integrate real payment gateway (Stripe or Razorpay)
2. Create actual WhatsApp community groups and update links
3. Add email notifications for order confirmations
4. Build admin panel for order management
5. Implement order tracking with status updates

## Technical Notes
- Payment is currently MOCKED - creates order without payment processing
- Google OAuth uses Emergent-managed authentication
- Cart persists via session_id in localStorage
- Database seeded with realistic medication data and pricing
- WhatsApp number is placeholder: 911234567890
- WhatsApp community links are placeholder URLs
