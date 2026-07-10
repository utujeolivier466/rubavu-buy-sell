import { Link } from "react-router-dom";

export default function PrivacyPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-16">
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 sm:p-12">
        <article className="prose prose-slate max-w-none">
          <h1 className="text-slate-900">Privacy Policy</h1>
          <p className="text-sm text-slate-500">
            Effective Date: [DATE] — Rubavu Buy and Sell Ltd
          </p>

      <h2>1. Introduction</h2>
      <p>
        This Privacy Policy explains how Rubavu Buy and Sell Ltd
        ("Company," "we," "us," "our") collects, uses, stores, and shares
        your personal data. By using our Services or contacting us, you
        consent to this Policy.
      </p>

      <h2>2. Information We Collect</h2>
      <ul>
        <li><strong>Personal Data:</strong> full name, phone number, email address, national ID or passport details.</li>
        <li><strong>Financial Data:</strong> proof of funds or source-of-funds documentation, collected from buyers as part of our KYC process before a transaction is finalized.</li>
        <li><strong>Property Data:</strong> listing details, inquiries, valuation notes.</li>
        <li><strong>Media Content:</strong> photographs, videos, and floor plans submitted by property owners.</li>
        <li><strong>Documents:</strong> title deeds and contracts submitted for verification.</li>
        <li><strong>Communications:</strong> messages sent via WhatsApp, phone calls, SMS, and email.</li>
        <li><strong>Technical Data:</strong> IP address, browser/device type, and general location, collected automatically via our website.</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <ul>
        <li>Respond to your property inquiry and connect you with relevant listings</li>
        <li>Verify buyer identity and source of funds (KYC) before completing a transaction</li>
        <li>Detect and prevent fraud or money-laundering activity, and report suspicious activity to the relevant Rwandan authorities where required by law</li>
        <li>Maintain transaction records required under Rwandan brokerage and AML obligations</li>
        <li>Send follow-up communications about your inquiry or related properties</li>
      </ul>

      <h2>4. Legal Basis for Processing</h2>
      <ul>
        <li><strong>Consent</strong> — for marketing follow-up communications</li>
        <li><strong>Contractual necessity</strong> — for buyers, sellers, or tenants engaging our brokerage services</li>
        <li><strong>Legal obligation</strong> — for KYC, AML, and tax-related record-keeping</li>
      </ul>

      <h2>5. Third-Party Data Sharing</h2>
      <p>We share limited personal data with:</p>
      <ul>
        <li>
          <strong>WhatsApp / Meta Platforms, Inc.</strong> — messages you
          send us via WhatsApp are processed through Meta's WhatsApp
          Business infrastructure, subject to{" "}
          <a href="https://www.whatsapp.com/legal/business-policy" target="_blank" rel="noopener noreferrer">
            WhatsApp's Business Terms
          </a>.
        </li>
        <li>
          <strong>Internal CRM system</strong> — inquiry and contact data is
          stored in our customer relationship management system to track
          and respond to your request.
        </li>
        <li>
          <strong>Relevant transaction counterparties</strong> — where you
          are party to an active transaction, necessary contact and
          verification details may be shared with the other party or their
          legal representative, with your knowledge.
        </li>
        <li>
          <strong>Regulators and law enforcement</strong> — where required
          for AML compliance or by Rwandan law.
        </li>
      </ul>
      <p>We do not sell your personal data to third parties for marketing purposes.</p>

      <h2>6. Data Retention</h2>
      <p>
        We retain inquiry and transaction data for as long as reasonably
        necessary to fulfill the purpose it was collected for. KYC and
        proof-of-funds documentation is retained for the period required
        under applicable Rwandan AML record-keeping obligations.
      </p>

      <h2>7. Data Security</h2>
      <p>
        We take reasonable technical and organizational measures to protect
        identity documents and financial records against unauthorized
        access. No transmission over the internet or WhatsApp is completely
        secure, and we cannot guarantee absolute security.
      </p>

      <h2>8. Your Rights</h2>
      <p>
        You may request access to, correction of, or deletion of your
        personal data, subject to our legal retention obligations (in
        particular for KYC/AML records), by contacting
        info@rubavubuysell.com.
      </p>

      <h2>9. Children's Data</h2>
      <p>We do not knowingly collect data from individuals under 18.</p>

      <h2>10. Changes to This Policy</h2>
      <p>We may update this Policy from time to time. Material changes will be reflected by updating the effective date above.</p>

      <h2>11. Contact</h2>
      <p>info@rubavubuysell.com | +250 782 424 382<br />
      Habib Center, 1st Floor, Rubavu – Gisenyi, Rwanda</p>

      <p className="text-sm text-gray-500 mt-12 border-t pt-4">
        This document is a template and does not constitute legal advice. It
        should be reviewed by a licensed Rwandan attorney, particularly
        regarding obligations under Rwanda's Law No. 058/2021 on the
        Protection of Personal Data and Privacy, before being relied on in
        production.
      </p>

      <p className="text-sm">
        <Link to="/terms" className="text-teal-600 underline hover:text-teal-700">
          View our Terms and Conditions
        </Link>
      </p>
        </article>
      </div>
    </main>
  );
}