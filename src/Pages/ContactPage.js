import { Globe, Mail, Phone, Send } from 'lucide-react'
import { useState } from 'react'
import c from "../Images/C2.jpg"
import TimelyFooter from './TimelyFooter'
import TimelyNavbar from '../Components/TimelyNavbar'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: '',
    message: ''
  })

  const handleWhatsApp = () => {
    window.open(
      'https://wa.me/919010481048?text=Hello! I would like to talk to Timely Health about your services.',
      '_blank'
    )
  }

  const handleCall = () => {
    window.location.href = 'tel:+919010481048'
  }

  const handleEmail = () => {
    window.location.href = 'mailto:hello@timelyhealth.com'
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const message = `Hello! I'm reaching out through your website contact form.

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Interest: ${formData.interest}
Message: ${formData.message}

Please get back to me within 24 hours as mentioned on your website.`

    window.open(`https://wa.me/919010481048?text=${encodeURIComponent(message)}`, '_blank')

    setFormData({
      name: '',
      email: '',
      phone: '',
      interest: '',
      message: ''
    })
  }

  const contactMethods = [
    {
      icon: <Phone className="w-8 h-8 text-blue-600" />,
      title: "Call Us",
      info: "+91 9010481048",
      action: handleCall,
      description: "Available 24/7 for urgent consultations"
    },
    {
      icon: (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp"
          className="w-8 h-8"
        />
      ),
      title: "WhatsApp Us",
      info: "Chat Now",
      action: handleWhatsApp,
      description: "Quick responses, instant support"
    },
    {
      icon: <Mail className="w-8 h-8 text-red-600" />,
      title: "Email Us",
      info: "hello@timelyhealth.com",
      action: handleEmail,
      description: "Detailed inquiries and partnerships"
    },
    {
      icon: <Globe className="w-8 h-8 text-purple-600" />,
      title: "Visit Website",
      info: "www.timelyhealth.in",
      action: () => window.open('https://www.timelyhealth.in', '_blank'),
      description: "Complete information and resources"
    }
  ]

  return (
    <div className="min-h-screen">
        <TimelyNavbar/>
      {/* Hero Banner Section */}
      <section className="relative w-full h-[400px] sm:h-[300px] lg:h-[850px]">
        {/* Background Image */}
        <img
          src={c}
          alt="Contact Timely Health"
          className="absolute inset-0 object-cover w-full h-full"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        {/* Text Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-6 text-center lg:px-20">
          <h1 className="mb-4 text-3xl font-bold text-white md:text-5xl font-calibri">
            Talk to Timely Health
          </h1>
          <p className="max-w-2xl mb-6 font-sans text-lg text-white md:text-xl">
            Let's bring smarter healthcare to your home, workplace, or community.
          </p>
          <a
            href="#contact-form"
            className="px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Contact Us
          </a>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {contactMethods.map((method, index) => (
              <div key={index} className="text-center">
                <button
                  onClick={method.action}
                  className="w-full p-6 transition-colors bg-gray-50 hover:bg-gray-100 rounded-xl group"
                >
                  <div className="flex justify-center mb-4">
                    {method.icon}
                  </div>
                  <h3 className="mb-2 font-calibri text-[#007a52]">{method.title}</h3>
                  <p className="mb-2 font-medium text-blue-600 group-hover:underline">
                    {method.info}
                  </p>
                  <p className="font-sans text-sm text-gray-600">{method.description}</p>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section id="contact-form" className="flex items-center justify-center py-16 bg-gray-50">
        <div className="w-full max-w-xl px-4">
          <div className="p-8 bg-white shadow-lg rounded-xl">
            <h2 className="mb-6 text-center font-calibri text-[#007a52]">Send Us a Message</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 font-sans">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 font-sans border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block mb-2 font-calibri">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 font-sans border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block mb-2 font-calibri">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 font-sans border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label className="block mb-2 font-calibri">What are you interested in? *</label>
                <select
                  name="interest"
                  value={formData.interest}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 font-sans border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select an option...</option>
                  <option value="Doctor Consultation">Doctor Consultation</option>
                  <option value="Health Camp">Health Camp</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Corporate Wellness">Corporate Wellness</option>
                  <option value="RWA Partnership">RWA Partnership</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-calibri">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 font-sans border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us more about your requirements..."
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center w-full px-6 py-3 space-x-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Send size={20} />
                <span>Submit & We'll Get Back Within 24 Hours</span>
              </button>
            </form>

            <p className="mt-4 text-sm text-center text-gray-600">
              * By submitting this form, your message will be sent via WhatsApp for faster response.
            </p>
          </div>
        </div>
      </section>

     {/* Map Section */}
<section className="py-16 bg-white">
  <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
    <div className="mb-8 text-center">
      <h2 className="mb-4">Our Location</h2>
      <p>Based in Hyderabad, serving communities across the city</p>
    </div>

    <div className="p-4 text-center bg-gray-100 rounded-xl">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.153949702676!2d78.3849383!3d17.4458661!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9117379fd7f3%3A0xf445ce2329c2b5e4!2sTimely%20Health!5e0!3m2!1sen!2sin!4v1695555555555!5m2!1sen!2sin"
        width="100%"
        height="400"
        style={{ border: 0, borderRadius: "12px" }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  </div>
</section>
<TimelyFooter/>
    </div>
  )
}

export default ContactPage