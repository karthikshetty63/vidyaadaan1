import { useState } from "react";
import Container from "../layout/Container";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const contactInfo = [
  { icon: FaEnvelope, label: "Email", value: "support@vidyadaan.org" },
  { icon: FaPhone, label: "Phone", value: "+91 98765 43210" },
  { icon: FaMapMarkerAlt, label: "Address", value: "Bengaluru, Karnataka, India" },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-4">
            Contact Us
          </span>
          <h2 className="text-4xl font-bold text-slate-900">Get In Touch</h2>
          <p className="mt-4 text-slate-500 max-w-xl mx-auto">
            Have questions? We'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">

          {/* Info */}
          <div className="flex flex-col gap-6 justify-center">
            {contactInfo.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="text-blue-600 text-lg" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
                  <p className="text-slate-700 font-semibold">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Your Name"
              id="name"
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Email Address"
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Textarea
              label="Message"
              id="message"
              name="message"
              placeholder="Write your message..."
              value={form.message}
              onChange={handleChange}
              required
            />
            <Button type="submit" fullWidth>Send Message</Button>
          </form>

        </div>
      </Container>
    </section>
  );
};

export default Contact;
