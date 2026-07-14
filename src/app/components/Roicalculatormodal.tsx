import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../../lib/libsupabaseClient';

interface ROICalculatorModalProps {
  onClose: () => void;
}

function ROICalculatorModal({ onClose }: ROICalculatorModalProps) {
  const [price, setPrice] = useState('50000000');
  const [growthRate, setGrowthRate] = useState('15');
  const [years, setYears] = useState('1');

  const [wantsFollowUp, setWantsFollowUp] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [leadStatus, setLeadStatus] = useState<'idle' | 'submitting' | 'sent'>('idle');

  const principal = Number(price) || 0;
  const rate = Number(growthRate) / 100 || 0;
  const term = Number(years) || 0;

  const projectedValue = principal * Math.pow(1 + rate, term);
  const gain = projectedValue - principal;

  function formatRWF(value: number) {
    return `RWF ${Math.round(value).toLocaleString()}`;
  }

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setLeadStatus('submitting');

    const { error } = await supabase!.from('inquiries').insert({
      property_id: null,
      name: name.trim(),
      phone: phone.trim(),
      source: 'roi_calculator',
      message: `ROI calculator lead. Estimated at ${formatRWF(principal)} purchase, ${growthRate}% annual growth over ${years} year(s), projected value ${formatRWF(projectedValue)} (potential gain ${formatRWF(gain)}).`,
    });

    if (error) {
      console.error('ROI calculator lead submission failed:', error);
      setLeadStatus('idle');
      return;
    }

    setLeadStatus('sent');
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-gray-900">Calculate Your Potential Gain</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price (RWF)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min={0}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D4F2A]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Annual Growth Rate (%)
            </label>
            <input
              type="number"
              value={growthRate}
              onChange={(e) => setGrowthRate(e.target.value)}
              min={0}
              max={100}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D4F2A]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Years</label>
            <select
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D4F2A]"
            >
              {[1, 2, 3, 5, 10].map((y) => (
                <option key={y} value={y}>{y} year{y > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          {/* Result */}
          <div className="bg-gradient-to-br from-teal-50 to-white border-2 border-teal-100 rounded-lg p-4">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-sm text-gray-600">Today's value</span>
              <span className="font-semibold text-gray-900">{formatRWF(principal)}</span>
            </div>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-sm text-gray-600">Projected value</span>
              <span className="font-bold text-lg text-[#0D4F2A]">{formatRWF(projectedValue)}</span>
            </div>
            <div className="border-t border-teal-200 my-2" />
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-gray-600">Potential gain</span>
              <span className="font-bold text-[#D56000]">{formatRWF(gain)}</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            This is an illustrative estimate only, based on the growth rate you enter. It is not a guarantee
            of future value or return. Actual property appreciation depends on market conditions and is not
            predictable with certainty.
          </p>

          {/* Optional lead capture */}
          {leadStatus === 'sent' ? (
            <p className="text-sm text-green-700 bg-green-50 rounded-lg p-3">
              Thanks! Our team will reach out with a personalized breakdown.
            </p>
          ) : wantsFollowUp ? (
            <form onSubmit={handleLeadSubmit} className="space-y-3 border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600">Want us to walk you through this in more detail?</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D4F2A]"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+250 7xx xxx xxx"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D4F2A]"
              />
              <button
                type="submit"
                disabled={leadStatus === 'submitting'}
                className="w-full bg-[#0D4F2A] hover:bg-[#0A3B21] disabled:bg-gray-300 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
              >
                {leadStatus === 'submitting' ? 'Sending…' : 'Request a Personalized Breakdown'}
              </button>
            </form>
          ) : (
            <button
              onClick={() => setWantsFollowUp(true)}
              className="w-full border-2 border-[#0D4F2A] text-[#0D4F2A] hover:bg-teal-50 py-2.5 rounded-lg font-semibold text-sm transition-colors"
            >
              Talk to Our Investment Team
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ROICalculatorModal;