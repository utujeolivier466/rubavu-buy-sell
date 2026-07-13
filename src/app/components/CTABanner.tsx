import { MessageCircle, Video } from 'lucide-react';

export function CTABanner() {
  const whatsappUrl = `https://wa.me/250782424382?text=${encodeURIComponent("Hello, I'm interested in properties in Gisenyi, Rugerero, Buhaza, or Kanembwe.")}`;

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1580835018727-6a6971c2223d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwbGFrZSUyMHNjZW5pYyUyMHZpZXclMjBtb3VudGFpbnN8ZW58MXx8fHwxNzc3NDU3NjY0fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Lake Kivu"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D4F2A]/90 to-[#D56000]/90"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
          Have Questions About a Property? Let's Talk.
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-200 mb-6 sm:mb-8">
          Talk to our team today and get personalized investment advice tailored to your goals
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-[#D56000] hover:bg-[#D56000] text-white text-base sm:text-lg rounded-lg transition-colors shadow-lg"
          >
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Chat via WhatsApp Now</span>
          </a>
          <button className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white hover:bg-gray-100 text-gray-900 text-base sm:text-lg rounded-lg transition-colors shadow-lg">
            <Video className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Book a Site Visit</span>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 sm:mt-8 text-gray-200">
          <p className="text-xs sm:text-sm">
            📞 Call us directly: <span className="font-bold">+250 782 424 382</span>
          </p>
          <p className="text-xs sm:text-sm mt-2">
            Office hours: Monday - Saturday, 8:00 AM - 6:00 PM EAT
          </p>
        </div>
      </div>
    </section>
  );
}
