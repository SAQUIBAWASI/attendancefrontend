import { Heart, UserPlus, Shield, CheckCircle, Sparkles, Award, Calendar, Phone, Mail, MapPin, ArrowRight, Users, Clock, Star, BadgeCheck, MessageCircle, Gift, ThumbsUp, Target, Stethoscope, Quote } from 'lucide-react'
import { useState } from 'react'
import TimelyNavbar from '../Components/TimelyNavbar'
import TimelyFooter from './TimelyFooter'
import membershipBg from "../Images/s3.jpg"

const MembershipPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    city: '',
    familyMembers: '',
    healthConcerns: '',
    message: ''
  })

  const handleWhatsApp = () => {
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

    const message = `Hello! I'm interested in joining as a Timely Health member.

Full Name: ${formData.fullName}
Email: ${formData.email}
Phone: ${formData.phone}
Age: ${formData.age}
City: ${formData.city}
Family Members: ${formData.familyMembers}
Health Concerns: ${formData.healthConcerns}
Message: ${formData.message}

Please get back to me at the earliest.`

    window.open(`https://wa.me/919010481048?text=${encodeURIComponent(message)}`, '_blank')

    setFormData({
      fullName: '',
      email: '',
      phone: '',
      age: '',
      city: '',
      familyMembers: '',
      healthConcerns: '',
      message: ''
    })
  }

  const membershipPlans = [
    {
      name: "Basic",
      price: "Free",
      icon: <Heart className="w-8 h-8 text-rose-600" />,
      features: [
        "Free health checkups (2/year)",
        "Access to community health camps",
        "Newsletter with health tips",
        "Basic wellness resources",
        "Community support group"
      ],
      color: "from-rose-50 to-pink-50",
      border: "border-rose-200",
      badge: "Popular",
      badgeColor: "bg-rose-500"
    },
    {
      name: "Premium",
      price: "₹499/mo",
      icon: <Award className="w-8 h-8 text-purple-600" />,
      features: [
        "Free health checkups (6/year)",
        "Priority doctor consultations",
        "Home diagnostic services (2/year)",
        "Personalized health plans",
        "Access to all wellness workshops",
        "24/7 health helpline",
        "Family coverage (up to 4 members)"
      ],
      color: "from-purple-50 to-indigo-50",
      border: "border-purple-200",
      badge: "Best Value",
      badgeColor: "bg-purple-500"
    },
    {
      name: "Family",
      price: "₹799/mo",
      icon: <Users className="w-8 h-8 text-blue-600" />,
      features: [
        "Free health checkups (12/year)",
        "Unlimited doctor consultations",
        "Home diagnostic services (4/year)",
        "Comprehensive health plans",
        "All wellness workshops & events",
        "24/7 priority health helpline",
        "Family coverage (up to 8 members)",
        "Emergency medical support",
        "Special discounts on medicines"
      ],
      color: "from-blue-50 to-cyan-50",
      border: "border-blue-200",
      badge: "Premium",
      badgeColor: "bg-blue-500"
    }
  ]

  const memberBenefits = [
    {
      icon: <Heart className="w-6 h-6 text-rose-500" />,
      title: "Free Health Checkups",
      description: "Regular health screenings and preventive checkups at no cost"
    },
    {
      icon: <Stethoscope className="w-6 h-6 text-blue-500" />,
      title: "Doctor Consultations",
      description: "Access to verified doctors and specialists for consultations"
    },
    {
      icon: <Calendar className="w-6 h-6 text-purple-500" />,
      title: "Community Events",
      description: "Join health camps, yoga sessions, and wellness workshops"
    },
    {
      icon: <Sparkles className="w-6 h-6 text-amber-500" />,
      title: "Exclusive Offers",
      description: "Special discounts on health services, medicines, and products"
    }
  ]

  // Extended testimonials for infinite scroll
  const testimonials = [
    {
      text: "Timely Health membership has been a game-changer for my family. The free checkups and doctor consultations are amazing!",
      author: "Priya Kumar",
      role: "Member since 2024",
      initials: "PK",
      color: "from-rose-50 to-pink-50",
      border: "border-rose-100",
      iconColor: "bg-rose-200",
      textColor: "text-rose-700"
    },
    {
      text: "The wellness workshops and community events have helped me stay healthy and connected. Best decision I made!",
      author: "Amit Sharma",
      role: "Premium Member",
      initials: "AS",
      color: "from-purple-50 to-indigo-50",
      border: "border-purple-100",
      iconColor: "bg-purple-200",
      textColor: "text-purple-700"
    },
    {
      text: "Family plan is perfect for us! My kids love the health camps and we've saved so much on medical expenses.",
      author: "Sneha Reddy",
      role: "Family Member",
      initials: "SR",
      color: "from-blue-50 to-cyan-50",
      border: "border-blue-100",
      iconColor: "bg-blue-200",
      textColor: "text-blue-700"
    },
    {
      text: "I joined Timely Health last year and my health has improved dramatically. The regular checkups keep me on track!",
      author: "Dr. Rajesh Kumar",
      role: "Basic Member",
      initials: "RK",
      color: "from-emerald-50 to-green-50",
      border: "border-emerald-100",
      iconColor: "bg-emerald-200",
      textColor: "text-emerald-700"
    },
    {
      text: "The 24/7 helpline is a lifesaver! I got instant medical advice at 2 AM when my child had a fever.",
      author: "Meera Iyer",
      role: "Premium Member",
      initials: "MI",
      color: "from-amber-50 to-orange-50",
      border: "border-amber-100",
      iconColor: "bg-amber-200",
      textColor: "text-amber-700"
    },
    {
      text: "Home diagnostic services are so convenient. They came to my house and did all tests professionally.",
      author: "Vikram Singh",
      role: "Family Member",
      initials: "VS",
      color: "from-cyan-50 to-blue-50",
      border: "border-cyan-100",
      iconColor: "bg-cyan-200",
      textColor: "text-cyan-700"
    },
    {
      text: "I've attended 5 wellness workshops so far and each one has been incredibly informative and practical.",
      author: "Ananya Patel",
      role: "Basic Member",
      initials: "AP",
      color: "from-pink-50 to-rose-50",
      border: "border-pink-100",
      iconColor: "bg-pink-200",
      textColor: "text-pink-700"
    },
    {
      text: "The community support group helped me connect with others facing similar health challenges. Truly grateful!",
      author: "Suresh Reddy",
      role: "Premium Member",
      initials: "SR",
      color: "from-indigo-50 to-purple-50",
      border: "border-indigo-100",
      iconColor: "bg-indigo-200",
      textColor: "text-indigo-700"
    },
    {
      text: "My entire family is now healthier thanks to Timely Health's preventive care approach. Highly recommend!",
      author: "Deepa Nair",
      role: "Family Member",
      initials: "DN",
      color: "from-teal-50 to-emerald-50",
      border: "border-teal-100",
      iconColor: "bg-teal-200",
      textColor: "text-teal-700"
    },
    {
      text: "The doctors are very knowledgeable and take time to explain everything. I feel confident about my health decisions.",
      author: "Arjun Mehta",
      role: "Premium Member",
      initials: "AM",
      color: "from-orange-50 to-amber-50",
      border: "border-orange-100",
      iconColor: "bg-orange-200",
      textColor: "text-orange-700"
    }
  ]

  const svgPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300a86b' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"

  return (
    <div className="min-h-screen bg-white">
      <TimelyNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[350px] flex items-center">
        <div className="absolute inset-0">
          <img 
            src={membershipBg} 
            alt="Membership" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
        
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${svgPattern})` }}></div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-500/30 backdrop-blur-sm rounded-full border border-rose-400/30 shadow-xl mb-4">
              <Heart className="w-3.5 h-3.5 text-rose-300" />
              <span className="text-xs font-semibold text-white">✦ Join Our Community</span>
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-300">
                Timely Health Membership
              </span>
            </h1>
            <p className="mt-3 text-base text-white/80 max-w-2xl leading-relaxed">
              Join the Timely Health community and get access to exclusive health benefits, 
              expert consultations, wellness programs, and a healthier lifestyle.
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Membership Benefits */}
      <section className="py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-3 bg-gradient-to-r from-rose-100 to-pink-100 rounded-full shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span className="text-xs font-medium text-rose-800">✦ Why Join</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 font-calibri">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">Health Journey</span> Starts Here
            </h2>
            <div className="w-16 h-1 mx-auto mt-3 bg-gradient-to-r from-rose-600 to-pink-600 rounded-full"></div>
            <p className="mt-3 text-sm text-gray-600 font-sans max-w-2xl mx-auto">
              Exclusive benefits designed to keep you and your family healthy and happy
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {memberBenefits.map((benefit, index) => (
              <div key={index} className="p-5 text-center bg-white rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 border border-gray-100">
                <div className="inline-flex p-2.5 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl mb-3">
                  {benefit.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 font-calibri">{benefit.title}</h3>
                <p className="text-xs text-gray-600 font-sans">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Plans */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${svgPattern})` }}></div>
        
        <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full shadow-md">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-xs font-medium text-purple-800">✦ Choose Your Plan</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 font-calibri">
              Flexible <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Membership Plans</span>
            </h2>
            <div className="w-16 h-1 mx-auto mt-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"></div>
            <p className="mt-3 text-sm text-gray-600 font-sans max-w-2xl mx-auto">
              Choose the plan that fits your needs and start your health journey today
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {membershipPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`group relative p-6 bg-gradient-to-br ${plan.color} rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 ${plan.border}`}
              >
                <div className="absolute top-0 right-0">
                  <span className={`inline-block px-3 py-1 text-[10px] font-bold text-white ${plan.badgeColor} rounded-bl-lg rounded-tr-lg`}>
                    {plan.badge}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/70 rounded-xl shadow-sm">
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 font-calibri">{plan.name}</h3>
                    <p className="text-lg font-bold text-blue-600">{plan.price}</p>
                  </div>
                </div>
                
                <ul className="space-y-2 mb-5">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-gray-700 font-sans">
                      <CheckCircle className="w-3.5 h-3.5 mt-0.5 text-emerald-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={handleWhatsApp}
                  className={`w-full inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-white rounded-full font-semibold text-sm transition-all hover:scale-105 shadow-md hover:shadow-lg ${
                    index === 0 ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700' :
                    index === 1 ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700' :
                    'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  Join Now
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Registration Form */}
      <section id="member-form" className="py-16 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${svgPattern})` }}></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100/20 rounded-full blur-3xl"></div>
        
        <div className="relative px-4 mx-auto max-w-3xl sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-3 bg-gradient-to-r from-rose-100 to-pink-100 rounded-full shadow-md">
              <UserPlus className="w-3.5 h-3.5 text-rose-600" />
              <span className="text-xs font-medium text-rose-800">✦ Member Registration</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 font-calibri">
              Become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">Member</span>
            </h2>
            <div className="w-16 h-1 mx-auto mt-3 bg-gradient-to-r from-rose-600 to-pink-600 rounded-full"></div>
            <p className="mt-3 text-sm text-gray-600 font-sans max-w-2xl mx-auto">
              Fill out the form below and our team will reach out to you within 24 hours
            </p>
          </div>

          <div className="p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-sans flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-rose-500" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition shadow-sm text-sm font-sans"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-sans flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-rose-500" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition shadow-sm text-sm font-sans"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-sans flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-rose-500" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition shadow-sm text-sm font-sans"
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-sans flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition shadow-sm text-sm font-sans"
                    placeholder="Your age"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-sans flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition shadow-sm text-sm font-sans"
                    placeholder="Your city"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-sans flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-rose-500" />
                    Family Members
                  </label>
                  <input
                    type="number"
                    name="familyMembers"
                    value={formData.familyMembers}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition shadow-sm text-sm font-sans"
                    placeholder="Number of family members"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-sans flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-rose-500" />
                  Health Concerns (if any)
                </label>
                <input
                  type="text"
                  name="healthConcerns"
                  value={formData.healthConcerns}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition shadow-sm text-sm font-sans"
                  placeholder="Any specific health concerns..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-sans flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-rose-500" />
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition shadow-sm text-sm font-sans resize-none"
                  placeholder="Any additional information..."
                />
              </div>

              <button
                type="submit"
                className="group w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-500 text-white rounded-full hover:from-rose-700 hover:to-pink-600 transition-all shadow-lg shadow-rose-200 hover:shadow-rose-300 hover:scale-[1.02] font-semibold text-sm"
              >
                <Heart className="w-4 h-4" />
                Submit Membership Application
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

      {/* Testimonials - Infinite Scroll with Extended Data */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full shadow-md">
              <Star className="w-3.5 h-3.5 text-yellow-600" />
              <span className="text-xs font-medium text-yellow-800">✦ Member Stories</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 font-calibri">
              What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">Members Say</span>
            </h2>
            <div className="w-16 h-1 mx-auto mt-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full"></div>
            <p className="mt-3 text-sm text-gray-600 font-sans max-w-2xl mx-auto">
              Real stories from real people who transformed their health with Timely Health
            </p>
          </div>

          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10"></div>
            
            <div className="overflow-hidden">
              <div className="flex gap-5 animate-scroll">
                {/* First set of testimonials */}
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={`first-${index}`} 
                    className={`flex-shrink-0 w-80 p-6 bg-gradient-to-br ${testimonial.color} rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-2 border ${testimonial.border}`}
                  >
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <Quote className="w-5 h-5 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-700 font-sans leading-relaxed">"{testimonial.text}"</p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${testimonial.iconColor} flex items-center justify-center ${testimonial.textColor} font-bold text-sm shadow-md`}>
                        {testimonial.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{testimonial.author}</p>
                        <p className="text-xs text-gray-500">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Duplicate set for seamless scrolling */}
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={`second-${index}`} 
                    className={`flex-shrink-0 w-80 p-6 bg-gradient-to-br ${testimonial.color} rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-2 border ${testimonial.border}`}
                  >
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <Quote className="w-5 h-5 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-700 font-sans leading-relaxed">"{testimonial.text}"</p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${testimonial.iconColor} flex items-center justify-center ${testimonial.textColor} font-bold text-sm shadow-md`}>
                        {testimonial.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{testimonial.author}</p>
                        <p className="text-xs text-gray-500">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
          width: max-content;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* CTA Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-pink-600 to-purple-600"></div>
        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse delay-300"></div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white rounded-full blur-3xl animate-pulse delay-700 -translate-x-1/2"></div>
        </div>
        
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `url(${svgPattern})` }}></div>

        <div className="relative max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 mb-5 bg-white/20 backdrop-blur-sm rounded-full shadow-xl border border-white/20">
            <Heart className="w-3.5 h-3.5 text-yellow-300" />
            <span className="text-xs font-medium text-white">✦ Join Today</span>
          </div>
          
          <h2 className="mb-4 text-3xl font-bold text-white font-calibri md:text-4xl">
            Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">Health Journey</span> Today
          </h2>
          <p className="mb-8 text-base text-white/90 font-sans max-w-2xl mx-auto">
            Join thousands of happy members who are living healthier lives with Timely Health.
            Choose your plan and get started today!
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="#member-form"
              className="group flex items-center gap-2 px-6 py-2.5 bg-white text-rose-600 rounded-full hover:bg-rose-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 font-semibold text-sm"
            >
              <Heart className="w-4 h-4" />
              Join as Member
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
            <button
              onClick={handleWhatsApp}
              className="group flex items-center gap-2 px-6 py-2.5 bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 rounded-full hover:bg-white/30 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Chat with Us
            </button>
          </div>
        </div>
      </section>

      <TimelyFooter />
    </div>
  )
}

export default MembershipPage