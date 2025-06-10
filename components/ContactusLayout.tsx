"use client";

import type React from "react";

import { useState } from "react";

// ContactusLayout component
const ContactusLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="flex flex-col md:flex-row items-center justify-center gap-8 py-12 px-4 md:px-8">
      {/* Google Maps on the left side */}
      <div className="w-full md:w-1/2 h-80 md:h-auto bg-gray-200 rounded-xl">
        <iframe
          allowFullScreen
          height="100%"
          loading="lazy"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4353.838475396577!2d121.05725761116753!3d14.591050585835323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c819abf9fa0f%3A0xd6de5ad44fb87ee1!2sRobinsons%20Galleria%20Ortigas!5e1!3m2!1sen!2sph!4v1742526696179!5m2!1sen!2sph"
          style={{ border: "0" }}
          width="100%"
        />
      </div>

      {/* Form or Children on the right side */}
      <div className="w-full md:w-1/2 bg-white shadow-xl rounded-xl p-8 md:p-12 text-center">
        {children}
      </div>
    </section>
  );
};

interface ContactFormProps {
  onSubmit: (formData: any) => void;
}

const ContactusForm: React.FC<ContactFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    country: "",
    property: "",
    inquiryType: "",
    awarenessSource: "",
    message: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (Object.values(formData).includes("")) {
      setErrorMessage("Please fill out all fields.");

      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contact-us`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      const contentType = response.headers.get("Content-Type");

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        if (response.ok) {
          alert("Form submitted successfully!");
        } else {
          alert("Error submitting form: " + data.message);
        }
      } else {
        const errorText = await response.text();

        console.error("Received non-JSON response:", errorText);
        alert("Error submitting the form.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting the form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          required
          className="w-full p-2 border border-gray-300 rounded"
          name="firstName"
          placeholder="First Name"
          type="text"
          value={formData.firstName}
          onChange={handleChange}
        />
        <input
          required
          className="w-full p-2 border border-gray-300 rounded"
          name="lastName"
          placeholder="Last Name"
          type="text"
          value={formData.lastName}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          required
          className="w-full p-2 border border-gray-300 rounded"
          name="email"
          placeholder="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          required
          className="w-full p-2 border border-gray-300 rounded"
          name="mobileNumber"
          placeholder="Mobile Number"
          type="text"
          value={formData.mobileNumber}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          required
          className="w-full p-2 border border-gray-300 rounded"
          name="country"
          placeholder="Country"
          type="text"
          value={formData.country}
          onChange={handleChange}
        />
        <input
          required
          className="w-full p-2 border border-gray-300 rounded"
          name="property"
          placeholder="Property"
          type="text"
          value={formData.property}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <select
          required
          className="w-full p-2 border border-gray-300 rounded"
          name="inquiryType"
          value={formData.inquiryType}
          onChange={handleChange}
        >
          <option value="">Select Inquiry Type</option>
          <option value="general">General Inquiry</option>
          <option value="product">Product Inquiry</option>
          <option value="service">Service Inquiry</option>
        </select>
        <input
          required
          className="w-full p-2 border border-gray-300 rounded"
          name="awarenessSource"
          placeholder="How did you hear about us?"
          type="text"
          value={formData.awarenessSource}
          onChange={handleChange}
        />
      </div>

      <textarea
        required
        className="w-full p-2 border border-gray-300 rounded"
        name="message"
        placeholder="Message"
        value={formData.message}
        onChange={handleChange}
      />

      <button
        className="w-full bg-blue-500 text-white p-2 rounded"
        disabled={loading} // Disable the button while loading
        type="submit"
      >
        {loading ? <span>Loading...</span> : "Send Message"}
      </button>
    </form>
  );
};

export { ContactusForm };
export default ContactusLayout;
