import { useState } from 'react';
import { supabase } from '../../../lib/libsupabaseClient';

const WHATSAPP_NUMBER = '250782424382';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<SubmitState>('idle');

  const isValid = name.trim().length > 0 && (phone.trim().length > 0 || email.trim().length > 0) && message.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    if (!supabase) {
      setStatus('error');
      return;
    }

    setStatus('submitting');

    const { error } = await supabase.from('inquiries').insert({
      property_id: null,
      name,
      phone: phone || null,
      email: email || null,
      message,
      source: 'contact_form',
    });

    if (error) {
      console.error('Contact form submission failed:', error);
      setStatus('error');
      return;
    }

    setStatus('success');
    setName('');
    setPhone('');
    setEmail('');
    setMessage('');
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 sm:py-16">
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
          Get in Touch
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Have a question about a property, or want personalized investment advice? Reach out and our team will respond promptly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Contact form */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-lg p-5 sm:p-8 shadow-sm">
          {status === 'success' ? (
            <div className="text-center py-10">
              <p className="text-xl font-semibold text-gray-900 mb-2">Message sent!</p>
              <p className="text-gray-600 mb-6">Thanks for reaching out — our team will get back to you shortly.</p>
              <button
                onClick={() => setStatus('idle')}
                className="text-yellow-600 hover:text-yellow-700 font-medium"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+250 7xx xxx xxx"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <p className="text-xs text-gray-400 mt-1">Provide either a phone number or an email so we can reach you.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you're looking for…"
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              {status === 'error' && (
                <p className="text-sm text-red-600">Something went wrong sending your message. Please try again, or message us directly on WhatsApp below.</p>
              )}

              <button
                type="submit"
                disabled={!isValid || status === 'submitting'}
                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors"
              >
                {status === 'submitting' ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        {/* Direct contact info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Contact Details</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <p>📍 Gisenyi, Rubavu District, Rwanda</p>
              <p>📞 <a href="tel:+250782424382" className="hover:text-yellow-600">+250 782 424 382</a></p>
              <p>✉️ <a href="mailto:info@rubavubuysell.com" className="hover:text-yellow-600">info@rubavubuysell.com</a></p>
              <p className="text-gray-500">Office hours: Monday – Saturday, 8:00 AM – 6:00 PM EAT</p>
            </div>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-green-600 hover:bg-green-700 text-white text-center px-4 py-3 rounded-lg font-semibold text-sm"
          >
            Chat with us on WhatsApp
          </a>

          <div className="rounded-lg overflow-hidden border border-gray-200">
            <iframe
              className="w-full h-48"
              src="https://maps.google.com/maps?q=Gisenyi,Rubavu,Rwanda&z=13&output=embed"
              title="Office location"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;