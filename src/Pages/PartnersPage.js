import { Users, Handshake, Heart, ArrowRight, CheckCircle, Sparkles, Award, Building, UserPlus, Mail, Phone, MapPin, MessageCircle, Calendar, Briefcase, FileText } from 'lucide-react'
import { useState } from 'react'
import TimelyNavbar from '../Components/TimelyNavbar'
import TimelyFooter from './TimelyFooter'
import partnersBg from "../Images/s2.jpg"

const PartnersPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    partnerType: '',
    city: '',
    message: ''
  })

  const handleWhatsApp = () => {
    window.open(
      'https://wa.me/919010481048?text=Hello! I would like to partner with Timely Health.',
      '_blank'
    )
  }

  const handleMemberJoin = () => {
    window.open(
      'https://wa.me/919010481048?text=Hello! I would like to join as a member of Timely Health.',
      '_blank'
    )
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const message = `Hello! I'm interested in partnering with Timely Health.

Full Name: ${formData.fullName}
Email: ${formData.email}
Phone: ${formData.phone}
Organization: ${formData.organization}
Partner Type: ${formData.partnerType}
City: ${formData.city}
Message: ${formData.message}

Please get back to me at the earliest.`

    window.open(`https://wa.me/919010481048?text=${encodeURIComponent(message)}`, '_blank')

    setFormData({
      fullName: '',
      email: '',
      phone: '',
      organization: '',
      partnerType: '',
      city: '',
      message: ''
    })
  }

  const partnerBenefits = [
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Reach New Communities",
      description: "Connect with thousands of families through our trusted healthcare network"
    },
    {
      icon: <Handshake className="w-8 h-8 text-emerald-600" />,
      title: "Trusted Collaboration",
      description: "Work with a verified and reputable healthcare platform"
    },
    {
      icon: <Sparkles className="w-8 h-8 text-purple-600" />,
      title: "Co-branded Initiatives",
      description: "Co-create health camps, workshops, and wellness programs"
    },
    {
      icon: <Award className="w-8 h-8 text-yellow-600" />,
      title: "Growth Opportunities",
      description: "Expand your reach and impact in the healthcare ecosystem"
    }
  ]

  const memberBenefits = [
    {
      icon: <Heart className="w-8 h-8 text-rose-600" />,
      title: "Free Health Checkups",
      description: "Get regular health screenings at no cost"
    },
    {
      icon: <UserPlus className="w-8 h-8 text-blue-600" />,
      title: "Doctor Consultations",
      description: "Access to verified doctors and specialists"
    },
    {
      icon: <Building className="w-8 h-8 text-indigo-600" />,
      title: "Community Events",
      description: "Join health camps, yoga sessions, and wellness workshops"
    },
    {
      icon: <Sparkles className="w-8 h-8 text-purple-600" />,
      title: "Exclusive Offers",
      description: "Special discounts on health services and products"
    }
  ]

  const partnerTypes = [
    'Healthcare Provider',
    'RWA / Community Leader',
    'Corporate / Business',
    'NGO / Non-Profit',
    'Wellness Coach / Trainer',
    'Other'
  ]

  const svgPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300a86b' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"

  return (
    <div className="min-h-screen bg-white">
      <TimelyNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[350px] flex items-center">
        <div className="absolute inset-0">
          <img 
            src={partnersBg} 
            alt="Partners & Members" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
        
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${svgPattern})` }}></div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/30 backdrop-blur-sm rounded-full border border-emerald-400/30 shadow-xl mb-4">
              <Users className="w-3.5 h-3.5 text-emerald-300" />
              <span className="text-xs font-semibold text-white">✦ Grow With Us</span>
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-blue-300">
                Partners & Members
              </span>
            </h1>
            <p className="mt-3 text-base text-white/80 max-w-2xl leading-relaxed">
              Join the Timely Health ecosystem — whether you're a healthcare provider, community leader, 
              or an individual looking for quality care. Let's build a healthier future together.
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Two Column Section: Partner With Us & Join as Member */}
      <section className="py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Partner With Us */}
            <div className="group relative p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-100/20 rounded-full blur-2xl"></div>
              
              <div className="relative">
                <div className="inline-flex p-2.5 bg-blue-100 rounded-xl mb-3">
                  <Handshake className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-calibri">Partner With Us</h2>
                <p className="mt-1.5 text-sm text-gray-600 font-sans">
                  Are you a healthcare provider, RWA leader, or business looking to collaborate? 
                  Let's create impactful health initiatives together.
                </p>

                <div className="mt-4 space-y-2.5">
                  {partnerBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2.5">
                      <div className="flex-shrink-0 mt-0.5">{benefit.icon}</div>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm">{benefit.title}</h4>
                        <p className="text-gray-600 text-xs">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleWhatsApp}
                  className="mt-5 group-btn inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full hover:from-blue-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg hover:scale-105 font-semibold text-sm"
                >
                  Partner With Us
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Join as Member */}
            <div className="group relative p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-100/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-100/20 rounded-full blur-2xl"></div>
              
              <div className="relative">
                <div className="inline-flex p-2.5 bg-rose-100 rounded-xl mb-3">
                  <Heart className="w-8 h-8 text-rose-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-calibri">Join as Member</h2>
                <p className="mt-1.5 text-sm text-gray-600 font-sans">
                  Become a part of the Timely Health community and get access to exclusive health 
                  benefits, checkups, and wellness programs.
                </p>

                <div className="mt-4 space-y-2.5">
                  {memberBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2.5">
                      <div className="flex-shrink-0 mt-0.5">{benefit.icon}</div>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm">{benefit.title}</h4>
                        <p className="text-gray-600 text-xs">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleMemberJoin}
                  className="mt-5 group-btn inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-full hover:from-rose-700 hover:to-rose-600 transition-all shadow-md hover:shadow-lg hover:scale-105 font-semibold text-sm"
                >
                  Join as Member
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Registration Form */}
      <section id="partner-form" className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${svgPattern})` }}></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100/20 rounded-full blur-3xl"></div>
        
        <div className="relative px-4 mx-auto max-w-3xl sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full shadow-md">
              <Handshake className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-800">✦ Partner Registration</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 font-calibri">
              Become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Partner</span>
            </h2>
            <div className="w-16 h-1 mx-auto mt-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
            <p className="mt-3 text-sm text-gray-600 font-sans max-w-2xl mx-auto">
              Fill out the form below and our team will reach out to you within 24 hours
            </p>
          </div>

          <div className="p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-sans flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm font-sans"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-sans flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                    Organization / Institution *
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm font-sans"
                    placeholder="Your organization name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-sans flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm font-sans"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-sans flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-500" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm font-sans"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-sans flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-500" />
                    Partner Type *
                  </label>
                  <select
                    name="partnerType"
                    value={formData.partnerType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm font-sans appearance-none"
                  >
                    <option value="">Select partner type...</option>
                    {partnerTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-sans flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm font-sans"
                    placeholder="Your city"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-sans flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  Message / Why do you want to partner with us? *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm text-sm font-sans resize-none"
                  placeholder="Tell us about your organization and how you'd like to collaborate..."
                />
              </div>

              <button
                type="submit"
                className="group w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:scale-[1.02] font-semibold text-sm"
              >
                <Handshake className="w-4 h-4" />
                Submit Partner Application
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <p className="mt-3 text-[10px] text-center text-gray-400 font-sans">
              * By submitting this form, your application will be sent via WhatsApp for faster processing.
              We'll get back to you within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Why Partner/Join Section */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-xs font-medium text-purple-800">✦ Why Join Us</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 font-calibri">
              Be Part of Something <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Bigger</span>
            </h2>
            <div className="w-16 h-1 mx-auto mt-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
            <p className="mt-3 text-sm text-gray-600 font-sans max-w-2xl mx-auto">
              Join a growing community that's making healthcare accessible, affordable, and local for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="p-5 text-center bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl shadow-md border border-blue-100">
              <div className="inline-flex p-2.5 bg-blue-500 rounded-xl mb-3 shadow-md">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-900 font-calibri">Growing Community</h3>
              <p className="text-xs text-gray-600 font-sans">Join 500+ members who trust Timely Health for their healthcare needs</p>
            </div>
            <div className="p-5 text-center bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl shadow-md border border-emerald-100">
              <div className="inline-flex p-2.5 bg-emerald-500 rounded-xl mb-3 shadow-md">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-900 font-calibri">Verified & Trusted</h3>
              <p className="text-xs text-gray-600 font-sans">All partners and services are thoroughly verified and trusted</p>
            </div>
            <div className="p-5 text-center bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl shadow-md border border-purple-100">
              <div className="inline-flex p-2.5 bg-purple-500 rounded-xl mb-3 shadow-md">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-900 font-calibri">Impactful Care</h3>
              <p className="text-xs text-gray-600 font-sans">Make a real difference in your community's health and wellbeing</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-emerald-600 to-green-600"></div>
        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse delay-300"></div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white rounded-full blur-3xl animate-pulse delay-700 -translate-x-1/2"></div>
        </div>
        
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `url(${svgPattern})` }}></div>

        <div className="relative max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 mb-5 bg-white/20 backdrop-blur-sm rounded-full shadow-xl border border-white/20">
            <Handshake className="w-3.5 h-3.5 text-yellow-300" />
            <span className="text-xs font-medium text-white">✦ Ready to Get Started?</span>
          </div>
          
          <h2 className="mb-4 text-3xl font-bold text-white font-calibri md:text-4xl">
            Let's Build a <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-200">Healthier Future</span> Together
          </h2>
          <p className="mb-8 text-base text-white/90 font-sans max-w-2xl mx-auto">
            Whether you want to partner with us or join as a member, we'd love to hear from you.
            Take the first step today.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="#partner-form"
              className="group flex items-center gap-2 px-6 py-2.5 bg-white text-blue-600 rounded-full hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 font-semibold text-sm"
            >
              <Handshake className="w-4 h-4" />
              Partner With Us
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
            <button
              onClick={handleMemberJoin}
              className="group flex items-center gap-2 px-6 py-2.5 bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 rounded-full hover:bg-white/30 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold text-sm"
            >
              <Heart className="w-4 h-4" />
              Join as Member
            </button>
          </div>
        </div>
      </section>

      <TimelyFooter />
    </div>
  )
}

export default PartnersPage