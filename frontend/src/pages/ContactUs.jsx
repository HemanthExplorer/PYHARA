import React, { useState } from 'react';

export default function ContactUs() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="page-container container section">
      <h1 className="font-serif">Contact Us</h1>
      <p className="lead-text">Have a question about an order or our eco-friendly products? We're here to help.</p>

      <div className="contact-grid">
        <div className="contact-info">
          <h3>Customer Care</h3>
          <p><strong>Email:</strong> support@pyhara.com</p>
          <p><strong>Phone:</strong> +91 98765 43210</p>
          <p><strong>Hours:</strong> Mon – Sat, 9:00 AM – 7:00 PM IST</p>
          <p><strong>Headquarters:</strong> Bengaluru, Karnataka, India</p>
        </div>

        <div className="contact-form-box">
          {submitted ? (
            <div className="success-banner">
              <h3>Thank You!</h3>
              <p>Your message has been received. Our team will get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                ></textarea>
              </div>

              <button type="submit" className="btn-primary">Send Message</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
