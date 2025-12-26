"use client";
import React, { useState } from "react";
import { Phone, Mail, MapPin } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message sent successfully ✅");
    setFormData({ name: "", phone: "", email: "", message: "" });
  };

  return (
    <section className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-[#FFF8F5] px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Left Side - Contact Info */}
        <div className="bg-[#FFF8F5] p-8 md:p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-semibold text-red-800 mb-2">
            Contact <span className="text-yellow-500">Us</span>
          </h2>
          <p className="text-gray-600 mb-8">
            Our team at Barber Syndicate will be happy to help you.
          </p>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <MapPin className="w-6 h-6 text-red-800 mt-1" />
              <p className="text-gray-700 leading-relaxed">
                123 Business District,
                <br />
                3846 Main Market, Mori Gate, Delhi
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Phone className="w-6 h-6 text-red-800" />
              <p className="text-gray-700">+91 98765 43210</p>
            </div>
            <div className="flex items-center space-x-4">
              <Mail className="w-6 h-6 text-red-800" />
              <p className="text-gray-700">info@barbersyndicate.com</p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 md:p-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            We’d love to hear from you.
          </h3>
          <p className="text-gray-600 mb-6">Let’s get in touch.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter your phone number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message here..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-red-600 focus:outline-none resize-none"
              ></textarea>
            </div>

            {/* Send Button */}
            <button
              type="submit"
              className="w-full bg-red-700 text-white py-2 px-4 rounded-md hover:bg-red-800 transition-colors font-medium"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
