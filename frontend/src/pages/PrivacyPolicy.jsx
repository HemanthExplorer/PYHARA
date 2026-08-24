import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="page-container container section">
      <h1 className="font-serif">Privacy Policy</h1>
      <p className="lead-text">Your privacy is important to us. Here is how PYHARA collects, uses, and safeguards your data.</p>

      <div className="content-block">
        <h2>1. Information We Collect</h2>
        <p>We collect personal information necessary to fulfill orders, including name, email address, phone number, shipping address, and PIN code.</p>

        <h2>2. Data Security</h2>
        <p>Passwords are securely hashed using bcrypt encryption. Payment details (card numbers, UPI credentials) are handled directly by PCI-DSS compliant payment gateways (Razorpay) and are never stored on our servers.</p>

        <h2>3. Data Protection</h2>
        <p>We do not sell, rent, or trade your personal data to third parties.</p>
      </div>
    </div>
  );
}
