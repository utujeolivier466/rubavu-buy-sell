import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import SEOHead from './Seohead';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

const FAQS: FAQItem[] = [
  {
    question: 'What services do you offer?',
    answer: 'Buying, selling, property marketing, and real estate advisory.',
  },
  {
    question: 'Where do you operate?',
    answer: 'We are based in Rubavu and serve clients across Rwanda.',
  },
  {
    question: 'How can I list my property?',
    answer: (
      <>
        Contact us by phone, WhatsApp, or through our{' '}
        <Link to="/sell-property" className="text-[#D56000] underline hover:text-[#A84A00]">
          Sell Your Property
        </Link>{' '}
        page.
      </>
    ),
  },
  {
    question: 'Do you verify property documents?',
    answer: 'Yes, we help verify property documents before transactions.',
  },
  {
    question: 'Is my personal information kept private?',
    answer: (
      <>
        Yes. We only collect the information necessary to respond to your inquiry or process a transaction, and we never sell your data. See our{' '}
        <Link to="/privacy" className="text-[#D56000] underline hover:text-[#A84A00]">
          Privacy Policy
        </Link>{' '}
        for full details.
      </>
    ),
  },
  {
    question: 'How can I contact you?',
    answer: (
      <>
        The fastest way is WhatsApp — click the button anywhere on the site, or call/message us directly at{' '}
        <a href="tel:+250782424382" className="text-[#D56000] underline hover:text-[#A84A00]">
          +250 782 424 382
        </a>
        . Office hours are Monday–Saturday, 8:00 AM – 6:00 PM EAT.
      </>
    ),
  },
];

function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <SEOHead
        title="Frequently Asked Questions"
        description="Answers to common questions about buying, selling, and renting property with Rubavu Buy and Sell Ltd in Rubavu District, Rwanda."
        url="/faq"
      />
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0D4F2A] mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-[#000000] max-w-xl mx-auto">
            Answers to the questions we hear most often. Can't find what you're looking for? Reach out directly.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="bg-white border border-[#0D4F2A]/20 rounded-lg overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left"
                >
                  <span className="font-medium text-[#000000] text-sm sm:text-base">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#D56000] shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-[#000000] leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <p className="text-[#000000] text-sm mb-3">Still have questions?</p>
          <a
            href="https://wa.me/250782424382"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#0D4F2A] hover:bg-[#0A3B21] text-[#FFFFFF] px-5 py-2.5 rounded-lg font-medium"
          >
            Ask us on WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}

export default FAQPage;