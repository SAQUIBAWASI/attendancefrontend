import { Building, Calendar, Home, Users, ArrowRight, Award, Sparkles, BadgeCheck, Star, Clock, MapPin, MessageCircle, CheckCircle, Zap, Target, ThumbsUp, Gift, Heart, Shield, Stethoscope, Quote } from 'lucide-react'
import img from "../Images/WEB.jpg"
import img1 from "../Images/we2.jpg"
import TimelyFooter from './TimelyFooter'
import TimelyNavbar from '../Components/TimelyNavbar'

const WhoWeServePage = () => {
  const handleStrategyCall = () => {
    window.open(
      'https://wa.me/919010481048?text=Hi! I am a community leader/corporate wellness head and would like to schedule a strategy call to create a health engagement plan.',
      '_blank'
    )
  }

  const handleWhatsApp = () => {
    window.open(
      'https://wa.me/919010481048?text=Hello! I would like to know more about how Timely Health can serve our specific needs.',
      '_blank'
    )
  }

  const audiences = [
    {
      icon: <Home className="w-10 h-10 text-purple-600" />,
      title: "Resident Welfare Associations (RWAs)",
      description: "Comprehensive health solutions for your community",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      number: "01",
      services: [
        "Organized health camps with multi-specialty doctors",
        "Regular yoga and wellness sessions for residents",
        "Expert health talks and awareness programs",
        "Preventive health drives and screenings",
        "Emergency medical consultation network"
      ],
      cta: "Organize Community Health Program"
    },
    {
      icon: <Users className="w-10 h-10 text-blue-600" />,
      title: "Urban Families",
      description: "Personalized healthcare for every family member",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      number: "02",
      services: [
        "Fast doctor bookings for family members",
        "Home diagnostic and lab testing services",
        "Ongoing wellness and preventive care support",
        "Specialist consultations and referrals",
        "Family health monitoring and follow-ups"
      ],
      cta: "Get Family Health Plan"
    },
    {
      icon: <Building className="w-10 h-10 text-orange-600" />,
      title: "Corporates & HR Teams",
      description: "Employee wellness programs that make a difference",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      number: "03",
      services: [
        "Comprehensive employee wellness drives",
        "On-site health checkups and screenings",
        "Corporate vaccination programs",
        "Stress management and mental health workshops",
        "Lifestyle and nutrition counseling sessions"
      ],
      cta: "Plan Employee Wellness Program"
    },
  ]

  const stats = [
    { number: "50+", label: "RWAs Served", icon: <Home className="w-3.5 h-3.5" />, color: "from-purple-50 to-purple-100" },
    { number: "500+", label: "Families Served", icon: <Users className="w-3.5 h-3.5" />, color: "from-blue-50 to-blue-100" },
    { number: "30+", label: "Corporate Partners", icon: <Building className="w-3.5 h-3.5" />, color: "from-orange-50 to-orange-100" },
    { number: "100+", label: "Health Camps", icon: <Calendar className="w-3.5 h-3.5" />, color: "from-emerald-50 to-emerald-100" }
  ]

  const testimonials = [
    {
      text: "We organized a health camp for 200+ residents in our society. Timely Health provided 5 specialist doctors, diagnostic equipment, and handled all logistics seamlessly. The response was overwhelming!",
      author: "Priya Sharma",
      role: "RWA Secretary, Gachibowli",
      initials: "PS",
      color: "from-purple-50 to-blue-50",
      border: "border-purple-100",
      iconColor: "bg-purple-500"
    },
    {
      text: "Our employee wellness program with Timely Health saw 85% participation. The on-site health checkups and stress management workshops significantly improved our team's overall wellbeing and productivity.",
      author: "Rajesh Kumar",
      role: "HR Director, Tech Company",
      initials: "RK",
      color: "from-emerald-50 to-blue-50",
      border: "border-emerald-100",
      iconColor: "bg-emerald-500"
    },
    {
      text: "The home diagnostic service is a game changer! They came to my house, did all tests professionally, and delivered results within 24 hours. My whole family now uses Timely Health.",
      author: "Sneha Reddy",
      role: "Homemaker, Hyderabad",
      initials: "SR",
      color: "from-pink-50 to-rose-50",
      border: "border-pink-100",
      iconColor: "bg-pink-500"
    },
    {
      text: "As a working professional, I appreciate how easy it is to book appointments and get consultations online. The doctors are verified and actually listen to your concerns.",
      author: "Amit Shah",
      role: "Software Engineer, Bangalore",
      initials: "AS",
      color: "from-cyan-50 to-blue-50",
      border: "border-cyan-100",
      iconColor: "bg-cyan-500"
    },
    {
      text: "The wellness workshops have transformed our office culture. Employees are more mindful about their health, and we've seen a 40% reduction in sick leaves.",
      author: "Meera Iyer",
      role: "HR Manager, FinTech Corp",
      initials: "MI",
      color: "from-indigo-50 to-purple-50",
      border: "border-indigo-100",
      iconColor: "bg-indigo-500"
    },
    {
      text: "I was able to get a second opinion from a top specialist within 24 hours. This service gave me peace of mind before a major surgery. Highly recommended!",
      author: "Dr. Vikram Singh",
      role: "Business Owner, Delhi",
      initials: "VS",
      color: "from-amber-50 to-orange-50",
      border: "border-amber-100",
      iconColor: "bg-amber-500"
    }
  ]

  const handleServiceRequest = (audienceType) => {
    const message = `Hi! I represent a ${audienceType} and would like to know more about your services for us.`
    window.open(`https://wa.me/919010481048?text=${encodeURIComponent(message)}`, '_blank')
  }

  const svgPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300a86b' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"

  return (
    <div className="min-h-screen bg-white">
      <TimelyNavbar/>
      
      {/* Hero Section - with top padding */}
      <section className="relative px-6 py-12 overflow-hidden bg-white lg:px-20 lg:py-16 pt-20 md:pt-24 lg:pt-28">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${svgPattern})` }}></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-100/10 rounded-full blur-3xl -translate-x-1/2"></div>
        
        <div className="relative max-w-6xl mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full shadow-md border border-blue-200/50">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-800">✦ Who We Serve</span>
            </div>
            <h1 className="mb-4 text-3xl font-bold leading-tight md:text-4xl lg:text-5xl font-calibri text-gray-900">
              Personalized{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-green-600">
                Care for Every Community
              </span>
            </h1>
            <p className="max-w-2xl mx-auto mb-6 text-base text-gray-600 font-sans leading-relaxed">
              Whether you're a family, a working professional, an RWA leader, or a corporate team — 
              Timely Health brings the right healthcare to your doorstep.
            </p>
            
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={handleWhatsApp}
                className="group inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-full hover:from-emerald-700 hover:to-green-600 transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:scale-105 font-semibold text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Chat with Our Team
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleStrategyCall}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white text-gray-700 rounded-full border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all shadow-md hover:shadow-lg hover:scale-105 font-medium text-sm"
              >
                <Calendar className="w-4 h-4" />
                Schedule a Consultation
              </button>
            </div>
          </div>

          {/* Stats Row - Compact */}
          <div className="grid grid-cols-2 gap-2 max-w-2xl mx-auto mt-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className={`text-center p-2.5 rounded-lg bg-gradient-to-br ${stat.color} shadow-sm hover:shadow-md transition-all hover:scale-105 border border-white/50`}>
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <div className="p-1 bg-white/60 rounded-lg shadow-inner">
                    {stat.icon}
                  </div>
                  <span className="text-base font-bold text-gray-800">{stat.number}</span>
                </div>
                <span className="text-[9px] text-gray-600 font-medium">{stat.label}</span>
                <div className="mt-0.5 h-0.5 w-8 mx-auto bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
              </div>
            ))}
          </div>

          {/* Image Grid */}
          <div className="grid max-w-4xl grid-cols-1 gap-3 mx-auto mt-8 md:grid-cols-2">
            <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
              <img src={img} alt="Healthcare Services" className="object-cover w-full h-56" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="flex items-center gap-1.5 text-white text-[10px] font-medium bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full w-fit">
                  <Users className="w-3 h-3" /> Community Care
                </div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
              <img src={img1} alt="Healthcare Services" className="object-cover w-full h-56" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="flex items-center gap-1.5 text-white text-[10px] font-medium bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full w-fit">
                  <Heart className="w-3 h-3" /> Personalized Care
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audience Grid - Premium */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100/10 rounded-full blur-3xl"></div>
        
        <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full shadow-md">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-xs font-medium text-purple-800">✦ Our Audiences</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 font-calibri">
              Tailored Solutions for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">Every Group</span>
            </h2>
            <div className="w-20 h-1 mx-auto mt-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-full"></div>
            <p className="mt-3 text-base text-gray-600 font-sans max-w-2xl mx-auto">
              We understand that different groups have different healthcare needs — we've designed specialized programs for each
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {audiences.map((audience, index) => (
              <div
                key={index}
                className="group relative p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 hover:border-transparent cursor-pointer overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${audience.color} opacity-0 group-hover:opacity-5 transition-all duration-500`}></div>
                <div className={`absolute -inset-1 bg-gradient-to-r ${audience.color} rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`}></div>
                
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2.5 rounded-xl ${audience.bgColor} group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}>
                      {audience.icon}
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold bg-gradient-to-r ${audience.color} bg-clip-text text-transparent`}>
                        {audience.number}
                      </span>
                      <h3 className={`text-base font-bold font-calibri text-gray-900 group-hover:bg-gradient-to-r ${audience.color} group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300`}>
                        {audience.title.split('(')[0].trim()}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="text-xs font-sans text-gray-600 leading-relaxed mb-3">
                    {audience.description}
                  </p>
                  
                  <ul className="space-y-1.5 mb-4">
                    {audience.services.map((service, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-600 font-sans">
                        <CheckCircle className="w-3 h-3 mt-0.5 text-emerald-500 flex-shrink-0" />
                        <span>{service}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => handleServiceRequest(audience.title.split(' ')[1] || 'Community')}
                    className={`group-btn inline-flex items-center gap-1.5 px-5 py-2 text-white rounded-full font-semibold text-xs bg-gradient-to-r ${audience.color} hover:shadow-md transition-all hover:scale-105`}
                  >
                    {audience.cta}
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
                
                <div className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r ${audience.color} group-hover:w-full transition-all duration-700 rounded-full`}></div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white rounded-full shadow-md border border-gray-100">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-xs text-gray-600 font-sans">
                <span className="font-semibold text-gray-800">3 Audiences</span> — Tailored healthcare for everyone
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories - Infinite Scroll Testimonials */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${svgPattern})` }}></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-100/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-100/10 rounded-full blur-3xl"></div>
        
        <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full shadow-md">
              <Star className="w-3.5 h-3.5 text-yellow-600" />
              <span className="text-xs font-medium text-yellow-800">✦ Testimonials</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 font-calibri">
              What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">Community Says</span>
            </h2>
            <div className="w-20 h-1 mx-auto mt-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full"></div>
            <p className="mt-3 text-base text-gray-600 font-sans max-w-2xl mx-auto">
              See how we've made a difference for our diverse community of users
            </p>
          </div>

          {/* Infinite Scrolling Testimonials */}
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10"></div>
            
            <div className="overflow-hidden">
              <div className="flex gap-4 animate-scroll">
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={`first-${index}`} 
                    className={`flex-shrink-0 w-72 p-5 bg-gradient-to-br ${testimonial.color} rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 border ${testimonial.border}`}
                  >
                    <Quote className="w-5 h-5 text-gray-300 mb-2" />
                    <p className="text-xs text-gray-700 font-sans leading-relaxed mb-3 line-clamp-4">
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-full ${testimonial.iconColor} flex items-center justify-center text-white font-bold text-xs shadow-md`}>
                        {testimonial.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-xs">{testimonial.author}</p>
                        <p className="text-[10px] text-gray-500">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={`second-${index}`} 
                    className={`flex-shrink-0 w-72 p-5 bg-gradient-to-br ${testimonial.color} rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 border ${testimonial.border}`}
                  >
                    <Quote className="w-5 h-5 text-gray-300 mb-2" />
                    <p className="text-xs text-gray-700 font-sans leading-relaxed mb-3 line-clamp-4">
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-full ${testimonial.iconColor} flex items-center justify-center text-white font-bold text-xs shadow-md`}>
                        {testimonial.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-xs">{testimonial.author}</p>
                        <p className="text-[10px] text-gray-500">{testimonial.role}</p>
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
          animation: scroll 30s linear infinite;
          width: max-content;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Partner Invitation - Premium */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600"></div>
        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse delay-300"></div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white rounded-full blur-3xl animate-pulse delay-700 -translate-x-1/2"></div>
        </div>
        
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `url(${svgPattern})` }}></div>

        <div className="relative max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 mb-5 bg-white/20 backdrop-blur-sm rounded-full shadow-xl border border-white/20">
            <Target className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span className="text-xs font-medium text-white">✦ Partner With Us</span>
          </div>
          
          <h2 className="mb-4 text-3xl font-bold text-white font-calibri md:text-4xl">
            Are you a <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-200">Community Leader</span> or <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-200">Corporate Wellness Head?</span>
          </h2>
          <p className="mb-8 text-base text-white/90 font-sans max-w-2xl mx-auto">
            Let's create a customized health engagement plan for your people.
            We'll work with you to design programs that meet your specific needs and goals.
          </p>
          
          <button
            onClick={handleStrategyCall}
            className="group inline-flex items-center gap-2 px-8 py-3.5 bg-white text-purple-600 rounded-full hover:bg-purple-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 font-semibold text-sm"
          >
            <Calendar className="w-4.5 h-4.5" />
            Schedule a Strategy Call
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Contact Section - Premium */}
      <section className="relative py-12 overflow-hidden bg-white">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${svgPattern})` }}></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full shadow-md border border-blue-200/50">
            <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-medium text-blue-800">✦ Get Started</span>
          </div>
          
          <h2 className="mb-4 text-3xl font-bold text-gray-900 font-calibri">
            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Get Started?</span>
          </h2>
          <p className="mb-6 text-base text-gray-600 font-sans max-w-2xl mx-auto">
            No matter which group you represent, we're here to create a healthcare solution
            that works perfectly for your unique needs.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={handleWhatsApp}
              className="group inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-full hover:from-emerald-700 hover:to-green-600 transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:scale-105 font-semibold text-sm"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WhatsApp"
                className="w-4 h-4"
              />
              Chat with Our Team
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={handleStrategyCall}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-purple-600 rounded-full border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all shadow-md hover:shadow-lg hover:scale-105 font-semibold text-sm"
            >
              <Calendar className="w-4 h-4" />
              Schedule a Consultation
            </button>
          </div>
        </div>
      </section>

      <TimelyFooter/>
    </div>
  )
}

export default WhoWeServePage