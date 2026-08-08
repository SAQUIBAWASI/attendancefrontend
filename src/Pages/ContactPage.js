import { Globe, Mail, Phone, Send, MessageCircle, MapPin, Clock, Sparkles, ArrowRight, Award, BadgeCheck, Star, CheckCircle } from 'lucide-react'
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
      icon: <Phone className="w-6 h-6 text-blue-600" />,
      title: "Call Us",
      info: "+91 9010481048",
      action: handleCall,
      description: "Available 24/7 for urgent consultations",
      color: "from-blue-50 to-blue-100",
      border: "border-blue-200",
      hover: "hover:border-blue-300"
    },
    {
      icon: (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp"
          className="w-6 h-6"
        />
      ),
      title: "WhatsApp Us",
      info: "Chat Now",
      action: handleWhatsApp,
      description: "Quick responses, instant support",
      color: "from-green-50 to-emerald-100",
      border: "border-green-200",
      hover: "hover:border-green-300"
    },
    {
      icon: <Mail className="w-6 h-6 text-red-600" />,
      title: "Email Us",
      info: "hello@timelyhealth.com",
      action: handleEmail,
      description: "Detailed inquiries and partnerships",
      color: "from-red-50 to-rose-100",
      border: "border-red-200",
      hover: "hover:border-red-300"
    },
    {
      icon: <Globe className="w-6 h-6 text-purple-600" />,
      title: "Visit Website",
      info: "www.timelyhealth.in",
      action: () => window.open('https://www.timelyhealth.in', '_blank'),
      description: "Complete information and resources",
      color: "from-purple-50 to-indigo-100",
      border: "border-purple-200",
      hover: "hover:border-purple-300"
    }
  ]

  const features = [
    { icon: <Clock className="w-4 h-4" />, text: "24/7 Support" },
    { icon: <BadgeCheck className="w-4 h-4" />, text: "Verified Experts" },
    { icon: <MessageCircle className="w-4 h-4" />, text: "Instant Response" },
    { icon: <Sparkles className="w-4 h-4" />, text: "Free Consultation" }
  ]

  const svgPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300a86b' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"

  return (
    <div className="min-h-screen bg-white">
      <TimelyNavbar/>
      
      {/* Hero Banner Section - Premium */}
      <section className="relative w-full h-[400px] sm:h-[300px] lg:h-[600px] overflow-hidden">
        <img
          src={c}
          alt="Contact Timely Health"
          className="absolute inset-0 object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30"></div>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${svgPattern})` }}></div>
        
        <div className="absolute top-16 right-16 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-16 left-16 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-300"></div>
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white/5 rounded-full blur-xl animate-pulse delay-700"></div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-6 text-center lg:px-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 bg-white/20 backdrop-blur-sm rounded-full border border-white/20 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span className="text-xs font-medium text-white">✦ Get in Touch</span>
          </div>
          <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl lg:text-5xl font-calibri">
            Talk to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Timely Health</span>
          </h1>
          <p className="max-w-2xl mb-6 text-base text-white/90 md:text-lg font-sans leading-relaxed">
            Let's bring smarter healthcare to your home, workplace, or community.
          </p>
          
          <div className="flex flex-wrap justify-center gap-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 text-white text-[10px] font-medium">
                {feature.icon}
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Methods - Premium Grid */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full shadow-md">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-xs font-medium text-purple-800">✦ Reach Us</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 font-calibri md:text-3xl">
              Connect With <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Us Anytime</span>
            </h2>
            <div className="w-16 h-1 mx-auto mt-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
            <p className="mt-3 text-sm text-gray-600 font-sans max-w-2xl mx-auto">
              Choose your preferred way to reach out — we're here to help
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {contactMethods.map((method, index) => (
              <div key={index} className="group">
                <button
                  onClick={method.action}
                  className={`w-full h-full p-5 bg-gradient-to-br ${method.color} rounded-xl border-2 ${method.border} ${method.hover} transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-md`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-2.5 bg-white/70 rounded-xl shadow-md mb-3 group-hover:scale-110 transition-transform duration-300">
                      {method.icon}
                    </div>
                    <h3 className="mb-0.5 text-base font-bold text-gray-900 font-calibri">{method.title}</h3>
                    <p className="mb-1.5 text-xs font-semibold text-blue-600 group-hover:underline">
                      {method.info}
                    </p>
                    <p className="text-[10px] text-gray-500 font-sans">{method.description}</p>
                    <div className="mt-2 w-6 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full group-hover:w-10 transition-all"></div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info - Premium Split Layout */}
      <section id="contact-form" className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${svgPattern})` }}></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            {/* Left - Form */}
            <div>
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-3 bg-gradient-to-r from-blue-100 to-green-100 rounded-full shadow-md">
                  <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-medium text-blue-800">✦ Send Message</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-calibri">
                  We'd Love to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">Hear From You</span>
                </h2>
                <p className="mt-1.5 text-sm text-gray-600 font-sans">
                  Fill out the form and we'll get back to you within 24 hours
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 font-sans">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm font-sans"
                    placeholder="Your full name"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 font-sans">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm font-sans"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 font-sans">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm font-sans"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 font-sans">What are you interested in? *</label>
                  <select
                    name="interest"
                    value={formData.interest}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm font-sans appearance-none"
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1 font-sans">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm font-sans resize-none"
                    placeholder="Tell us more about your requirements..."
                  />
                </div>

                <button
                  type="submit"
                  className="group w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:scale-[1.02] font-semibold text-sm"
                >
                  <Send className="w-4 h-4" />
                  Submit & We'll Get Back Within 24 Hours
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <p className="mt-3 text-[10px] text-center text-gray-400 font-sans">
                * By submitting this form, your message will be sent via WhatsApp for faster response.
              </p>
            </div>

            {/* Right - Info Cards */}
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-lg border border-emerald-100">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="p-2 bg-emerald-500 rounded-lg shadow-md">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 font-calibri">Quick Response</h3>
                </div>
                <p className="text-sm text-gray-700 font-sans leading-relaxed">
                  We guarantee a response within <span className="font-semibold text-emerald-600">24 hours</span>. 
                  For urgent matters, reach us via phone or WhatsApp for immediate assistance.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Average response time: 2 hours</span>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg border border-purple-100">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="p-2 bg-purple-500 rounded-lg shadow-md">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 font-calibri">Our Location</h3>
                </div>
                <p className="text-sm text-gray-700 font-sans leading-relaxed">
                  <span className="font-semibold">Hyderabad, India</span><br />
                  Serving communities across the city with personalized healthcare solutions.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  <span>Available across all major localities</span>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-lg border border-amber-100">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="p-2 bg-amber-500 rounded-lg shadow-md">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 font-calibri">Why Contact Us?</h3>
                </div>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-1.5 text-sm text-gray-700 font-sans">
                    <CheckCircle className="w-3.5 h-3.5 mt-0.5 text-amber-500 flex-shrink-0" />
                    <span>Free consultation for all services</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-sm text-gray-700 font-sans">
                    <CheckCircle className="w-3.5 h-3.5 mt-0.5 text-amber-500 flex-shrink-0" />
                    <span>Customized healthcare solutions</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-sm text-gray-700 font-sans">
                    <CheckCircle className="w-3.5 h-3.5 mt-0.5 text-amber-500 flex-shrink-0" />
                    <span>Verified doctors and experts</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section - Premium */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full shadow-md">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-800">✦ Find Us</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 font-calibri md:text-3xl">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Location</span>
            </h2>
            <div className="w-16 h-1 mx-auto mt-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
            <p className="mt-3 text-sm text-gray-600 font-sans">
              Based in Hyderabad, serving communities across the city
            </p>
          </div>

          <div className="relative p-1.5 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-emerald-400/20 rounded-xl blur-lg"></div>
            <div className="relative rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.153949702676!2d78.3849383!3d17.4458661!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9117379fd7f3%3A0xf445ce2329c2b5e4!2sTimely%20Health!5e0!3m2!1sen!2sin!4v1695555555555!5m2!1sen!2sin"
                width="100%"
                height="350"
                style={{ border: 0, borderRadius: "8px" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Timely Health Location"
              ></iframe>
            </div>
            
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-600 rounded-lg">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-xs font-calibri">Timely Health</p>
                  <p className="text-[10px] text-gray-500 font-sans">Hyderabad, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TimelyFooter/>
    </div>
  )
}

export default ContactPage