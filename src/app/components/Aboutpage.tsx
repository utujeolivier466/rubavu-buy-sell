import { useEffect, useState } from 'react';
import {
  ShieldCheck, Award, Eye, Heart, Star, Lightbulb, Handshake,
  TrendingUp, Users, CheckCircle2, MapPin, Phone, Facebook, Instagram, Youtube, MessageCircle,
} from 'lucide-react';
import { supabase } from '../../../lib/libsupabaseClient';
import type { Agent } from '../../../lib/types';
import SEOHead from './Seohead';
import TiltCard from './TiltCard';

const WHATSAPP_NUMBER = '250782424382';

const CORE_VALUES = [
  { label: 'Integrity', icon: ShieldCheck },
  { label: 'Professionalism', icon: Award },
  { label: 'Transparency', icon: Eye },
  { label: 'Customer Satisfaction', icon: Heart },
  { label: 'Excellence', icon: Star },
  { label: 'Innovation', icon: Lightbulb },
  { label: 'Trust', icon: Handshake },
];

const SERVICES = [
  'Property Buying Assistance',
  'Property Selling Services',
  'Property Marketing & Advertising',
  'Real Estate Investment Advice',
  'Property Valuation & Market Analysis',
  'Commercial Property Sales',
  'Residential Property Sales',
  'Business Advertising',
  'Real Estate Consultation',
];

const WHY_CHOOSE_US = [
  { label: 'Trusted and Professional Team', icon: Users },
  { label: 'Verified Property Listings', icon: ShieldCheck },
  { label: 'Transparent Transactions', icon: Eye },
  { label: 'Strong Local Market Knowledge', icon: TrendingUp },
  { label: 'Personalized Customer Support', icon: Heart },
  { label: 'Fast and Reliable Service', icon: CheckCircle2 },
];

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16.6 5.82c-1-.99-1.6-2.34-1.6-3.82h-3.13v14.02c0 1.55-1.26 2.8-2.8 2.8a2.8 2.8 0 1 1 0-5.6c.28 0 .55.04.8.12V9.99a6 6 0 1 0 5.13 5.94V9.4a8.2 8.2 0 0 0 4.6 1.4V7.68a4.85 4.85 0 0 1-3-1.86Z" />
    </svg>
  );
}

function AboutPage() {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    if (!supabase) return;
    supabase.from('agents').select('*').then(({ data }) => {
      if (data) setAgents(data as Agent[]);
    });
  }, []);

  return (
    <>
      <SEOHead
        title="About Us"
        description="Rubavu Buy and Sell Ltd — a professional real estate company in Rubavu District, Rwanda, helping clients buy, sell, and invest with integrity and transparency."
        url="/about"
      />

      {/* Hero */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-br from-[#0D4F2A] via-[#0D4F2A] to-[#0D4F2A] overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <p className="text-amber-400 font-semibold tracking-wide uppercase text-sm mb-3">
            Your Trusted Real Estate Partner
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            About Rubavu Buy and Sell Ltd
          </h1>
          <p className="text-gray-200 text-base sm:text-lg leading-relaxed">
            Rubavu Buy and Sell Ltd is a professional real estate company based in Rubavu District, Rwanda.
            We specialize in helping clients buy, sell, and invest in land, houses, apartments, commercial
            buildings, and other real estate properties — with transparent, reliable, and professional
            service at every step.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-14 sm:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <TiltCard className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-12 h-12 rounded-full bg-[#0D4F2A]/10 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-[#0D4F2A]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To provide trusted, professional, and transparent real estate services that connect people
              with the right property while creating long-term value for our clients and communities.
            </p>
          </TiltCard>

          <TiltCard className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
              <Eye className="w-6 h-6 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              To become the most trusted and leading real estate company in Rwanda by delivering
              innovative property solutions and exceptional customer service.
            </p>
          </TiltCard>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">Our Core Values</h2>
          <p className="text-gray-500 text-center mb-10">The principles that guide everything we do</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {CORE_VALUES.map(({ label, icon: Icon }) => (
              <TiltCard key={label} className="bg-white rounded-xl shadow-md p-6 text-center border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-[#0D1F3C]/5 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-[#0D1F3C]" />
                </div>
                <p className="font-semibold text-gray-900 text-sm">{label}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-14 sm:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">Our Services</h2>
          <p className="text-gray-500 text-center mb-10">Complete real estate support, start to finish</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SERVICES.map((service) => (
              <div key={service} className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-[#0D4F2A] shrink-0" />
                <span className="text-gray-700 text-sm font-medium">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">Why Choose Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_CHOOSE_US.map(({ label, icon: Icon }) => (
              <TiltCard key={label} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <Icon className="w-7 h-7 text-amber-500 mb-3" />
                <p className="font-semibold text-gray-900">{label}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Team */}
      <section id="team" className="py-14 sm:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">Meet Our Team</h2>
          <p className="text-gray-500 text-center mb-10">The people behind Rubavu Buy and Sell Ltd</p>

          <div className="flex flex-wrap justify-center gap-6">
            {/* CEO — featured card */}
            <TiltCard className="bg-white rounded-2xl shadow-xl p-8 text-center w-full sm:w-80">
              <img
                src="/ceo.jpeg"
                alt="Biziyaremye Emmanuel"
                className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
              />
              <h3 className="font-bold text-gray-900 text-lg">Biziyaremye Emmanuel</h3>
              <p className="text-amber-600 text-sm font-medium mb-3">Founder & Chief Executive Officer</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                With over 10 years of experience in the real estate industry, Emmanuel has built extensive
                expertise in property sales, investment advisory, and market analysis. He is passionate about
                helping individuals and businesses make informed real estate decisions through professionalism,
                transparency, and integrity.
              </p>
            </TiltCard>

            {/* Additional agents, pulled live from Supabase */}
            {agents.map((agent) => (
              <TiltCard key={agent.id} className="bg-white rounded-2xl shadow-xl p-8 text-center w-full sm:w-80">
                {agent.photo_url ? (
                  <img
                    src={agent.photo_url}
                    alt={agent.name}
                    loading="lazy"
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0D4F2A] to-[#D56000] flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                    {agent.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                )}
                <h3 className="font-bold text-gray-900 text-lg">{agent.name}</h3>
                <p className="text-amber-600 text-sm font-medium mb-1">{agent.position}</p>
                {agent.phone && (
                  <a
                    href={`tel:${agent.phone}`}
                    className="text-xs text-[#0D4F2A] hover:text-[#0A3B21] font-medium block mb-3"
                  >
                    {agent.phone}
                  </a>
                )}
                {agent.bio && (
                  <p className="text-gray-600 text-sm leading-relaxed">{agent.bio}</p>
                )}
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Social */}
      <section className="py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Get In Touch</h2>

          <div className="flex flex-col sm:flex-row justify-center gap-6 text-gray-700 mb-8">
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 hover:text-[#0D4F2A]">
              <Phone className="w-4 h-4" /> +250 782 424 382
            </a>
            <span className="flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4" /> Habib Center Building, 1st Floor, Rubavu District, Western Province, Rwanda
            </span>
          </div>

          <div className="flex justify-center gap-4">
            <a href="https://www.facebook.com/p/Rubavu-buy-and-sell-Ltd-100054451151237/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-11 h-11 rounded-full bg-[#0D1F3C] text-white flex items-center justify-center hover:bg-[#0A3B21] transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://www.instagram.com/rubavu_real_estate" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-11 h-11 rounded-full bg-[#0D1F3C] text-white flex items-center justify-center hover:bg-[#0A3B21] transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://www.tiktok.com/@rubavu_real_estate" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="w-11 h-11 rounded-full bg-[#0D1F3C] text-white flex items-center justify-center hover:bg-[#0A3B21] transition-colors">
              <TikTokIcon className="w-5 h-5" />
            </a>
            <a href="https://youtube.com/@Rubavurealestate" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-11 h-11 rounded-full bg-[#0D1F3C] text-white flex items-center justify-center hover:bg-[#0A3B21] transition-colors">
              <Youtube className="w-5 h-5" />
            </a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-11 h-11 rounded-full bg-[#D56000] text-white flex items-center justify-center hover:bg-[#A84A00] transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export default AboutPage;