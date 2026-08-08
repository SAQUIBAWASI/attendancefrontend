import { Building, Calendar, Heart, Home, Phone, Shield, Stethoscope, Users, ArrowRight, Award, Sparkles, BadgeCheck, Star, Clock, MapPin, MessageCircle, CheckCircle, Zap, Target, ThumbsUp, Gift, Microscope } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import TimelyFooter from './TimelyFooter'
import TimelyNavbar from '../Components/TimelyNavbar'
import img1 from "../Images/WEB.jpg"
import img2 from "../Images/h2.jpg"
import img3 from "../Images/s3.jpg"
import img4 from "../Images/s1.jpg"

const ServicesPage = () => {
  const navigate = useNavigate()

  const handleWhatsApp = () => {
    window.open(
      'https://wa.me/919010481048?text=Hello! I would like to know more about Timely Health services.',
      '_blank'
    )
  }

  const handleBookDoctor = () => {
    window.open(
      'https://wa.me/919010481048?text=Hi! I would like to book a doctor consultation.',
      '_blank'
    )
  }

  const handleOrganizeCamp = () => {
    window.open(
      'https://wa.me/919010481048?text=Hi! I would like to organize a health camp for our community.',
      '_blank'
    )
  }

  const handleHealthPlan = () => {
    window.open(
      'https://wa.me/919010481048?text=Hello! I would like to get a free preventive health plan.',
      '_blank'
    )
  }

  const services = [
    {
      icon: <Shield className="w-8 h-8 text-indigo-600" />,
      title: "Second Opinions",
      description: "Consult expert doctors before making major treatment decisions",
      link: "/second-opinions",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      number: "01",
      details: [
        "Expert medical second opinions",
        "Review of treatment plans",
        "Consultation with specialists",
        "Detailed medical analysis"
      ]
    },
    {
      icon: <Home className="w-8 h-8 text-blue-700" />,
      title: "Home Diagnostics",
      description: "Trusted lab services, sample collection from your doorstep",
      link: "/home-diagnostics",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      number: "02",
      details: [
        "Home sample collection service",
        "Comprehensive health checkup packages",
        "Fast and accurate lab results",
        "Digital reports delivery"
      ]
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "Community Health Camps",
      description: "Full-service health drives for RWAs, apartments, or colonies",
      link: "/community-health-camps",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      number: "03",
      details: [
        "Complete health screening camps",
        "Multi-specialty doctor panels",
        "On-site diagnostic facilities",
        "Health awareness sessions"
      ]
    },
    {
      icon: <Heart className="w-8 h-8 text-red-600" />,
      title: "Wellness Workshops",
      description: "Yoga, nutrition, and mental health sessions for prevention & balance",
      link: "/wellness-sessions",
      color: "from-rose-500 to-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
      number: "04",
      details: [
        "Group yoga and meditation sessions",
        "Nutrition counseling workshops",
        "Mental health awareness programs",
        "Stress management techniques"
      ]
    },
    {
      icon: <Stethoscope className="w-8 h-8 text-cyan-600" />,
      title: "Doctor Consultations",
      description: "Verified general physicians & specialists — book online or locally",
      link: "/doctor-consultations",
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-200",
      number: "05",
      details: [
        "24/7 availability for urgent consultations",
        "Verified and experienced doctors",
        "Online and offline consultation options",
        "Specialist referrals when needed"
      ]
    },
    {
      icon: <Building className="w-8 h-8 text-orange-600" />,
      title: "Corporate Health Programs",
      description: "Employee checkups, vaccination drives, stress management sessions",
      link: "/corporate-health-programs",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      number: "06",
      details: [
        "Employee health checkup programs",
        "Workplace vaccination drives",
        "Corporate wellness workshops",
        "Health risk assessments"
      ]
    }
  ]

  const stats = [
    { number: "500+", label: "Families Served", icon: <Users className="w-3.5 h-3.5" />, color: "from-emerald-50 to-emerald-100" },
    { number: "50+", label: "Expert Doctors", icon: <Stethoscope className="w-3.5 h-3.5" />, color: "from-blue-50 to-blue-100" },
    { number: "100+", label: "Health Camps", icon: <Calendar className="w-3.5 h-3.5" />, color: "from-purple-50 to-purple-100" },
    { number: "4.9", label: "Average Rating", icon: <Star className="w-3.5 h-3.5" />, color: "from-yellow-50 to-yellow-100" }
  ]

  const svgPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300a86b' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"

  return (
    <div className="min-h-screen bg-white">
      <TimelyNavbar/>
      
      {/* Hero Section - Premium */}
      <section className="relative px-6 py-12 overflow-hidden bg-white lg:px-20 lg:py-16">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${svgPattern})` }}></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-100/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-100/10 rounded-full blur-3xl -translate-x-1/2"></div>
        
        <div className="relative max-w-6xl mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 bg-gradient-to-r from-blue-100 to-green-100 rounded-full shadow-md border border-blue-200/50">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-800">✦ Our Services</span>
            </div>
            <h1 className="mb-3 text-3xl font-bold leading-tight md:text-4xl lg:text-5xl font-calibri text-gray-900">
              Healthcare{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-emerald-500 to-green-600">
                That Comes to You
              </span>
            </h1>
            <p className="max-w-2xl mx-auto mb-6 text-base text-gray-600 font-sans leading-relaxed">
              Timely Health delivers personalized care through a mix of digital and on-ground services — 
              right at your home, clinic, or community.
            </p>
            
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={handleBookDoctor}
                className="group inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:scale-105 font-semibold text-sm"
              >
                <Phone className="w-4 h-4" />
                Book a Doctor
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleWhatsApp}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white text-gray-700 rounded-full border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all shadow-md hover:shadow-lg hover:scale-105 font-medium text-sm"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-4 h-4" />
                Chat with Us
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
                <div className="mt-0.5 h-0.5 w-8 mx-auto bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full"></div>
              </div>
            ))}
          </div>

          {/* Image Grid */}
          <div className="grid max-w-5xl grid-cols-2 gap-3 mx-auto mt-8 md:grid-cols-4">
            <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <img src={img1} alt="Healthcare Services" className="object-cover w-full h-40" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                <div className="flex items-center gap-1.5 text-white text-[9px] font-medium bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full w-fit">
                  <Clock className="w-2.5 h-2.5" /> 24/7 Support
                </div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <img src={img2} alt="Healthcare Services" className="object-cover w-full h-40" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                <div className="flex items-center gap-1.5 text-white text-[9px] font-medium bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full w-fit">
                  <BadgeCheck className="w-2.5 h-2.5" /> Verified Experts
                </div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <img src={img3} alt="Healthcare Services" className="object-cover w-full h-40" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                <div className="flex items-center gap-1.5 text-white text-[9px] font-medium bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full w-fit">
                  <Users className="w-2.5 h-2.5" /> Community Focus
                </div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <img src={img4} alt="Healthcare Services" className="object-cover w-full h-40" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                <div className="flex items-center gap-1.5 text-white text-[9px] font-medium bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full w-fit">
                  <Heart className="w-2.5 h-2.5" /> Wellness Focus
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid - 3 Columns Per Row */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100/10 rounded-full blur-3xl"></div>
        
        <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full shadow-md">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-xs font-medium text-purple-800">✦ What We Offer</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 font-calibri">
              Comprehensive <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">Healthcare Services</span>
            </h2>
            <div className="w-20 h-1 mx-auto mt-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-full"></div>
            <p className="mt-3 text-base text-gray-600 font-sans max-w-2xl mx-auto">
              From expert consultations to community wellness programs — we've got you covered
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <div
                key={index}
                onClick={() => navigate(service.link)}
                className="group relative p-5 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 hover:border-transparent cursor-pointer overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-all duration-500`}></div>
                <div className={`absolute -inset-1 bg-gradient-to-r ${service.color} rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`}></div>
                
                <div className="relative">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className={`p-2.5 rounded-xl ${service.bgColor} group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}>
                        {service.icon}
                      </div>
                      <div className="mt-1 text-center">
                        <span className={`text-[9px] font-bold bg-gradient-to-r ${service.color} bg-clip-text text-transparent`}>
                          {service.number}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <h3 className={`text-base font-bold font-calibri text-gray-900 group-hover:bg-gradient-to-r ${service.color} group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 leading-tight`}>
                          {service.title}
                        </h3>
                      </div>
                      
                      <p className="text-xs font-sans text-gray-600 leading-relaxed mb-2.5">
                        {service.description}
                      </p>
                    </div>
                  </div>
                  
                  <ul className="space-y-1 mb-3 pl-1">
                    {service.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px] text-gray-600 font-sans">
                        <CheckCircle className="w-3 h-3 mt-0.5 text-emerald-500 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className={`inline-flex items-center gap-1 text-[11px] font-semibold bg-gradient-to-r ${service.color} bg-clip-text text-transparent group-hover:gap-1.5 transition-all`}>
                    <span>Explore Service</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
                
                <div className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r ${service.color} group-hover:w-full transition-all duration-700 rounded-full`}></div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white rounded-full shadow-md border border-gray-100">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-xs text-gray-600 font-sans">
                <span className="font-semibold text-gray-800">6 Services</span> — All designed for your well-being
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Compact */}
      <section className="py-12 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="p-5 text-center bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-md border border-green-100 hover:scale-105 transition-all duration-300">
              <div className="inline-flex p-2.5 bg-emerald-500 rounded-xl mb-3 shadow-md">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-900 font-calibri">Fast & Reliable</h3>
              <p className="text-xs text-gray-600 font-sans">Quick appointments, fast results, and reliable healthcare services</p>
            </div>
            <div className="p-5 text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md border border-blue-100 hover:scale-105 transition-all duration-300">
              <div className="inline-flex p-2.5 bg-blue-500 rounded-xl mb-3 shadow-md">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-900 font-calibri">Verified & Trusted</h3>
              <p className="text-xs text-gray-600 font-sans">All our doctors and services are thoroughly verified and trusted</p>
            </div>
            <div className="p-5 text-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-md border border-purple-100 hover:scale-105 transition-all duration-300">
              <div className="inline-flex p-2.5 bg-purple-500 rounded-xl mb-3 shadow-md">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-900 font-calibri">Holistic Care</h3>
              <p className="text-xs text-gray-600 font-sans">Complete wellness approach covering physical and mental health</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Premium */}
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
            <Gift className="w-3.5 h-3.5 text-yellow-300 animate-bounce" />
            <span className="text-xs font-medium text-white">✦ Get Started Today</span>
          </div>
          
          <h2 className="mb-4 text-3xl font-bold text-white font-calibri md:text-4xl">
            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-200">Get Started?</span>
          </h2>
          <p className="mb-8 text-base text-white/90 font-sans max-w-2xl mx-auto">
            Choose the service that fits your needs and take the first step toward better health today.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={handleBookDoctor}
              className="group flex items-center gap-2 px-6 py-2.5 bg-white text-blue-600 rounded-full hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 font-semibold text-sm"
            >
              <Phone className="w-4 h-4" />
              Book a Doctor
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={handleOrganizeCamp}
              className="group flex items-center gap-2 px-6 py-2.5 bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 rounded-full hover:bg-white/30 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold text-sm"
            >
              <Calendar className="w-4 h-4" />
              Organize a Camp
            </button>
            
            <button
              onClick={handleHealthPlan}
              className="group flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 rounded-full hover:from-yellow-500 hover:to-orange-500 transition-all shadow-xl hover:shadow-2xl hover:scale-105 font-semibold text-sm"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WhatsApp"
                className="w-4 h-4"
              />
              Free Health Plan
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section - Premium */}
      <section className="relative py-12 overflow-hidden bg-white">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${svgPattern})` }}></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-100/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 bg-gradient-to-r from-blue-100 to-green-100 rounded-full shadow-md border border-blue-200/50">
            <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-medium text-blue-800">✦ Need Help?</span>
          </div>
          
          <h2 className="mb-4 text-3xl font-bold text-gray-900 font-calibri">
            Have Questions About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">Our Services?</span>
          </h2>
          <p className="mb-6 text-base text-gray-600 font-sans max-w-2xl mx-auto">
            Our health advisors are ready to help you choose the right service for your needs.
          </p>
          
          <button
            onClick={handleWhatsApp}
            className="group inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-full hover:from-emerald-700 hover:to-green-700 transition-all shadow-xl shadow-emerald-200 hover:shadow-emerald-300 hover:scale-105 font-semibold text-sm"
          >
            <MessageCircle className="w-4.5 h-4.5" />
            Chat with Our Health Advisor
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </section>

      <TimelyFooter/>
    </div>
  )
}

export default ServicesPage