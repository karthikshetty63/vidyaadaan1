import React, { useState } from "react";
import Container from "../layout/Container";
import SectionTitle from "../ui/SectionTitle";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "donate",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-24 bg-white">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          {/* Left */}
          <div>
            <SectionTitle
              align="left"
              pill="Contact Us"
              title="Let's Build a"
              highlight="School Together"
              subtitle="Whether you want to donate, volunteer, partner, or simply learn more — we'd love to hear from you."
            />

            <div className="mt-10 flex flex-col gap-5">
              {[
                {
                  icon: "📧",
                  label: "Email",
                  value: "vidyadaan001@gmail.com",
                  href: "mailto:vidyadaan001@gmail.com",
                },
                {
                  icon: "📞",
                  label: "Phone",
                  value: "+91 6364480125",
                  href: "tel:+916364480125",
                },
                {
                  icon: "🏢",
                  label: "Office",
                  value: "k v g college of engineering, Sullia, Karnataka, India",
                  href: "#",
                },
                {
                  icon: "🕘",
                  label: "Working Hours",
                  value: "Mon–Sat, 9:00 AM – 6:00 PM IST",
                  href: null,
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-xl shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                      {item.label}
                    </p>
                    {item.href && item.href !== "#" ? (
                      <a
                        href={item.href}
                        className="text-sm font-medium text-slate-800 hover:text-sky-600 transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-slate-800">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-7 shadow-sm">
            {submitted ? (
              <div className="flex flex-col items-center text-center py-12 gap-4">
                <span className="text-5xl">✅</span>
                <h3 className="text-xl font-bold text-slate-900">Message Sent!</h3>
                <p className="text-slate-500 text-sm max-w-xs">
                  Thank you for reaching out. Our team will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-sm text-sky-600 font-bold hover:underline"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Send us a Message</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600" htmlFor="contact-name">
                      Full Name *
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Rahul Sharma"
                      className="px-4 py-2.5 border-2 border-slate-200 focus:border-sky-500 outline-none rounded-xl text-sm transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600" htmlFor="contact-email">
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="rahul@email.com"
                      className="px-4 py-2.5 border-2 border-slate-200 focus:border-sky-500 outline-none rounded-xl text-sm transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600" htmlFor="contact-subject">
                    I'm interested in
                  </label>
                  <select
                    id="contact-subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="px-4 py-2.5 border-2 border-slate-200 focus:border-sky-500 outline-none rounded-xl text-sm bg-white transition-colors"
                  >
                    <option value="donate">Making a Donation</option>
                    <option value="sponsor">Sponsoring a Child</option>
                    <option value="csr">Corporate CSR Partnership</option>
                    <option value="volunteer">Volunteering / Mentoring</option>
                    <option value="media">Media Inquiry</option>
                    <option value="other">Something Else</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600" htmlFor="contact-message">
                    Your Message *
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    required
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us how you'd like to help..."
                    className="px-4 py-2.5 border-2 border-slate-200 focus:border-sky-500 outline-none rounded-xl text-sm resize-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-sm rounded-xl transition-all duration-200 active:scale-[0.98] shadow-md shadow-sky-500/20"
                >
                  Send Message →
                </button>

                <p className="text-center text-xs text-slate-400">
                  We respond within 24 hours on weekdays.
                </p>
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Contact;
