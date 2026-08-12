import {
  Activity,
  Calendar,
  CheckCircle,
  ChevronDown,
  Heart,
  Home,
  Search,
  Shield,
  Star,
  Stethoscope,
  Users,
  ArrowRight,
  Phone,
  MapPin,
  Clock,
  Award,
  ShieldCheck,
  Sparkles,
  Quote,
  MessageCircle,
  Briefcase,
  Building,
  Hospital,
  Globe,
  Mail,
  Twitter,
  Linkedin,
  Youtube,
  Gift,
  BadgeCheck,
  Microscope,
  ChevronRight,
  Zap,
  Target,
  ThumbsUp,
  Ambulance,
  ShieldAlert,
  Droplets,
  Leaf,
  Sun,
  Moon,
  Cloud,
  Compass
} from 'lucide-react'
import { useEffect, useState } from 'react'
import img1 from "../Images/s2.jpg"
import campBg from "../Images/s3.jpg"
import promiseBg from "../Images/s1.jpg"
import TimelyNavbar from '../Components/TimelyNavbar'
import TimelyFooter from './TimelyFooter'

const HomePage = () => {
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [selectedAudience, setSelectedAudience] = useState('')
  const [selectedNeed, setSelectedNeed] = useState('')
  const [liveStats, setLiveStats] = useState({
    consultations: 128,
    camps: 47,
    events: 26
  })

  const [counters, setCounters] = useState({
    consultations: 0,
    camps: 0,
    events: 0
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        consultations: prev.consultations + Math.floor(Math.random() * 3),
        camps: prev.camps + (Math.random() > 0.7 ? 1 : 0),
        events: prev.events + (Math.random() > 0.8 ? 1 : 0)
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const stepTime = duration / steps

    const startCounting = (target, key) => {
      let current = 0
      const increment = target / steps

      const timer = setInterval(() => {
        current += increment
        if (current >= target) {
          current = target
          clearInterval(timer)
        }
        setCounters(prev => ({
          ...prev,
          [key]: Math.floor(current)
        }))
      }, stepTime)

      return timer
    }

    const timers = [
      startCounting(liveStats.consultations, 'consultations'),
      startCounting(liveStats.camps, 'camps'),
      startCounting(liveStats.events, 'events')
    ]

    return () => timers.forEach(timer => clearInterval(timer))
  }, [])

  useEffect(() => {
    const duration = 1000
    const steps = 30
    const stepTime = duration / steps

    const animateToTarget = (target, key) => {
      const start = counters[key]
      const diff = target - start
      if (diff === 0) return null

      const increment = diff / steps
      let current = start
      let count = 0

      const timer = setInterval(() => {
        count++
        current += increment
        if (count >= steps) {
          current = target
          clearInterval(timer)
        }
        setCounters(prev => ({
          ...prev,
          [key]: Math.floor(current)
        }))
      }, stepTime)

      return timer
    }

    const timers = [
      animateToTarget(liveStats.consultations, 'consultations'),
      animateToTarget(liveStats.camps, 'camps'),
      animateToTarget(liveStats.events, 'events')
    ].filter(t => t !== null)

    return () => timers.forEach(timer => clearInterval(timer))
  }, [liveStats])

  const handleWhatsApp = () => {
    window.open('https://wa.me/919010481048?text=Hello! I would like to know more about Timely Health services.', '_blank')
  }

  const handleBookCamp = () => {
    window.open('https://wa.me/919010481048?text=Hi! I would like to book a free health camp for our community.', '_blank')
  }

  const handleFindDoctor = () => {
    window.open('https://wa.me/919010481048?text=Hello! I need help finding a doctor near me.', '_blank')
  }

  const handleStartConsultation = () => {
    window.open('https://wa.me/919010481048?text=Hi! I would like to start a consultation with a health advisor.', '_blank')
  }

  const handleInteractiveCTA = () => {
    if (name && whatsapp && selectedAudience && selectedNeed) {
      const message = `Hi! My name is ${name}, my WhatsApp number is ${whatsapp}. I am a ${selectedAudience} looking for ${selectedNeed}. Please help me get started.`
      window.open(`https://wa.me/919010481048?text=${encodeURIComponent(message)}`, '_blank')
    }
  }

  const services = [
    { icon: <Shield className="w-6 h-6" />, title: "Second Opinions", description: "Trusted expert inputs", color: "from-blue-500 to-blue-600", gradient: "from-blue-50 to-blue-100" },
    { icon: <Home className="w-6 h-6" />, title: "Home Diagnostics", description: "Lab tests at home", color: "from-emerald-500 to-emerald-600", gradient: "from-emerald-50 to-emerald-100" },
    { icon: <Heart className="w-6 h-6" />, title: "Wellness Sessions", description: "Yoga, stress relief, immunity", color: "from-rose-500 to-rose-600", gradient: "from-rose-50 to-rose-100" },
    { icon: <Users className="w-6 h-6" />, title: "Health Camps", description: "For RWAs & companies", color: "from-purple-500 to-purple-600", gradient: "from-purple-50 to-purple-100" },
    { icon: <Stethoscope className="w-6 h-6" />, title: "Doctor Consults", description: "Verified specialists", color: "from-cyan-500 to-cyan-600", gradient: "from-cyan-50 to-cyan-100" },
    { icon: <Activity className="w-6 h-6" />, title: "Community Meetups", description: "Group care & awareness", color: "from-orange-500 to-orange-600", gradient: "from-orange-50 to-orange-100" },
  ]

  const whyChooseUs = [
    { icon: <ShieldCheck className="w-5 h-5" />, text: "Local-first Care" },
    { icon: <Award className="w-5 h-5" />, text: "Verified Experts Only" },
    { icon: <Sparkles className="w-5 h-5" />, text: "Digital + Offline Access" },
    { icon: <MessageCircle className="w-5 h-5" />, text: "Second Opinions Made Easy" },
    { icon: <Users className="w-5 h-5" />, text: "Family & Community Focused" },
    { icon: <Activity className="w-5 h-5" />, text: "Prevention-Based Programs" },
  ]

  const testimonials = [
    { 
      text: "Our RWA worked with Timely Health for a health camp. Smooth execution, excellent doctor panel.", 
      author: "Shalini V.", 
      role: "RWA Secretary", 
      rating: 5,
      location: "Mumbai, Maharashtra",
      avatar: "https://ui-avatars.com/api/?name=Shalini+V&background=emerald&color=fff&size=50"
    },
    { 
      text: "Timely Health helped my clinic reach 3x more patients — highly professional and dedicated team.", 
      author: "Dr. Anil M.", 
      role: "ENT Specialist", 
      rating: 5,
      location: "Delhi NCR",
      avatar: "https://ui-avatars.com/api/?name=Anil+M&background=blue&color=fff&size=50"
    },
    { 
      text: "The home diagnostic service is amazing! They came to my house and did all tests professionally.", 
      author: "Priya S.", 
      role: "Homemaker", 
      rating: 5,
      location: "Bangalore",
      avatar: "https://ui-avatars.com/api/?name=Priya+S&background=purple&color=fff&size=50"
    },
    { 
      text: "I found the best doctor for my mother through Timely Health. The second opinion service is a lifesaver!", 
      author: "Rahul K.", 
      role: "Software Engineer", 
      rating: 5,
      location: "Hyderabad",
      avatar: "https://ui-avatars.com/api/?name=Rahul+K&background=orange&color=fff&size=50"
    },
    { 
      text: "The wellness sessions and yoga classes have transformed my health completely. Highly recommended!", 
      author: "Dr. Meera Reddy", 
      role: "Yoga Instructor", 
      rating: 5,
      location: "Chennai",
      avatar: "https://ui-avatars.com/api/?name=Meera+R&background=rose&color=fff&size=50"
    },
    { 
      text: "Our company partnered with Timely Health for employee health checkups. Very professional and well-organized.", 
      author: "Vikram Singh", 
      role: "HR Manager, TechCorp", 
      rating: 5,
      location: "Pune",
      avatar: "https://ui-avatars.com/api/?name=Vikram+S&background=cyan&color=fff&size=50"
    },
    { 
      text: "The community meetups are fantastic! We learned so much about preventive healthcare.", 
      author: "Neha Gupta", 
      role: "Community Leader", 
      rating: 5,
      location: "Ahmedabad",
      avatar: "https://ui-avatars.com/api/?name=Neha+G&background=emerald&color=fff&size=50"
    },
    { 
      text: "I was able to get a second opinion from a top specialist within 24 hours. Incredible service!", 
      author: "Amit Patel", 
      role: "Business Owner", 
      rating: 5,
      location: "Surat",
      avatar: "https://ui-avatars.com/api/?name=Amit+P&background=blue&color=fff&size=50"
    },
  ]

  const svgPattern1 = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300a86b' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"
  
  const svgPattern2 = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <TimelyNavbar/>
      
      {/* Hero Section - Full Image Background */}
      <section className="relative overflow-hidden min-h-[500px] flex items-center">
        <div className="absolute inset-0">
          <img 
            src={img1} 
            alt="Healthcare Hero" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>
        
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${svgPattern1})` }}></div>
        
        <div className="absolute top-20 right-20 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-300"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-300/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
              Trusted Healthcare,{' '}
              <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-blue-300 bg-clip-text text-transparent">
                Just Around the Corner
              </span>
            </h1>
            
            <p className="mt-4 text-base text-white/80 max-w-lg leading-relaxed">
              Bringing doctors, diagnostics, and wellness programs closer to your home — online and offline.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleStartConsultation}
                className="group inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white rounded-full hover:from-emerald-600 hover:to-emerald-500 transition-all shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transform duration-300 font-semibold text-sm"
              >
                Start Consultation
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleWhatsApp}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/30 hover:bg-white/20 hover:border-white/50 transition-all shadow-lg hover:shadow-xl hover:scale-105 transform duration-300 font-medium text-sm"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-4 h-4" />
                Chat on WhatsApp
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-300 to-blue-300 border-2 border-white flex items-center justify-center text-[10px] font-semibold text-emerald-900 shadow-lg">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center text-[10px] font-semibold text-white shadow-lg">
                  +99
                </div>
              </div>
              <div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-xs text-white/80 font-medium">Trusted by 500+ families</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Live Stats Bar - Moved DOWN with margin-top */}
      <section className="px-4 py-6 bg-white/80 backdrop-blur-sm border-y border-slate-100 relative z-10 mt-4 md:mt-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-3 gap-3 md:gap-6">
            {[
              { label: "Consultations", value: counters.consultations, icon: <Stethoscope className="w-5 h-5 text-emerald-600" />, color: "from-emerald-50 to-emerald-100", border: "border-emerald-200" },
              { label: "Health Camps", value: counters.camps, icon: <Users className="w-5 h-5 text-blue-600" />, color: "from-blue-50 to-blue-100", border: "border-blue-200" },
              { label: "Events", value: counters.events, icon: <Calendar className="w-5 h-5 text-purple-600" />, color: "from-purple-50 to-purple-100", border: "border-purple-200" }
            ].map((stat, i) => (
              <div key={i} className={`text-center p-4 rounded-xl bg-gradient-to-br ${stat.color} shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border ${stat.border} hover:border-transparent group`}>
                <div className="flex items-center justify-center gap-2 mb-0.5">
                  <div className="p-1.5 bg-white/70 rounded-lg shadow-inner group-hover:bg-white transition-all">
                    {stat.icon}
                  </div>
                  <span className="text-2xl md:text-3xl font-bold text-slate-800">{stat.value}+</span>
                </div>
                <span className="text-xs text-slate-600 font-medium">{stat.label}</span>
                <div className="mt-1 h-1 w-12 mx-auto bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50/50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full mb-3 shadow-md tracking-wider">✦ OUR SERVICES</span>
            <h2 className="text-3xl font-bold text-slate-800 sm:text-4xl">Comprehensive Care, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">All in One Place</span></h2>
            <p className="mt-3 text-slate-500 max-w-2xl mx-auto text-base">From expert consultations to community wellness programs — we've got you covered.</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <div
                key={index}
                className="group relative p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-100 hover:border-transparent"
              >
                <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${service.color} text-white mb-3 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{service.title}</h3>
                <p className="text-slate-500 text-sm">{service.description}</p>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="p-1.5 bg-emerald-100 rounded-full">
                    <ArrowRight className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 rounded-xl transition-all duration-300`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="relative px-4 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-blue-800"></div>
        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-white rounded-full blur-3xl animate-pulse delay-300"></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-700 -translate-x-1/2"></div>
          <div className="absolute top-10 right-1/4 w-24 h-24 bg-yellow-400 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `url(${svgPattern2})` }}></div>

        <div className="absolute top-20 right-20 text-white/10 text-6xl animate-float">✦</div>
        <div className="absolute bottom-20 left-20 text-white/10 text-4xl animate-float-delay">✦</div>

        <div className="relative mx-auto max-w-7xl">
          <div className="text-center text-white mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full mb-4 shadow-xl border border-white/20">
              <Zap className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">WHY TIMELY HEALTH</span>
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              Built for Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-yellow-200">Wellness Journey</span>
            </h2>
            <p className="mt-3 text-emerald-100/80 max-w-2xl mx-auto text-base">
              We're committed to providing the best healthcare experience with trust, transparency, and technology.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {whyChooseUs.map((item, index) => (
              <div 
                key={index} 
                className="group flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg"
              >
                <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all shadow-md group-hover:scale-110 duration-300">
                  {item.icon}
                </div>
                <span className="text-white font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  {item.text}
                </span>
                <ChevronRight className="w-4 h-4 text-white/50 ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPACER */}
      <div className="relative bg-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent"></div>
            <div className="relative bg-white px-6 py-1">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg"></div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">✦ Trusted Healthcare ✦</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-300 shadow-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FREE HEALTH CAMP - With Image Background */}
      <section className="relative overflow-hidden min-h-[500px] flex items-center">
        <div className="absolute inset-0">
          <img 
            src={campBg} 
            alt="Free Health Camp" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
        
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${svgPattern2})` }}></div>
        
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-bounce delay-300"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-white/5 rounded-full blur-xl animate-pulse delay-500"></div>
        
        <div className="absolute top-16 right-16 opacity-20">
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: `${i * 0.2}s` }}></div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-16 left-16 opacity-20">
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: `${i * 0.3}s` }}></div>
            ))}
          </div>
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 backdrop-blur-sm rounded-full text-gray-900 font-bold mb-6 border border-white/30 shadow-2xl animate-pulse text-xs">
            <Gift className="w-4 h-4 animate-bounce" />
            <span>🎯 Limited Time - Free!</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight">
            🏥 Free Health Camp
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-teal-200">For Your Community</span>
          </h2>

          <p className="text-white/90 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Book a free health camp for your RWA, office, or community group. 
            Get <span className="text-white font-semibold">expert doctors</span>, 
            <span className="text-white font-semibold"> free checkups</span>, and 
            <span className="text-white font-semibold"> wellness sessions</span> 
            tailored to your needs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto mb-8">
            {[
              { icon: <Stethoscope className="w-4 h-4" />, text: "Expert Doctors", bg: "from-blue-400 to-blue-600" },
              { icon: <Microscope className="w-4 h-4" />, text: "Free Checkups", bg: "from-purple-400 to-purple-600" },
              { icon: <Heart className="w-4 h-4" />, text: "Wellness Sessions", bg: "from-pink-400 to-pink-600" }
            ].map((feature, index) => (
              <div key={index} className={`group flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r ${feature.bg} backdrop-blur-sm rounded-full border border-white/20 text-white text-xs font-medium hover:scale-105 transition-all duration-300 shadow-lg`}>
                <div className="p-1 bg-white/20 rounded-full group-hover:bg-white/30 transition-all shadow-md">
                  {feature.icon}
                </div>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-white/80 text-xs">
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg border border-white/10">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Trusted by 50+ RWAs</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg border border-white/10">
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-300" />
              <span>100+ Happy Communities</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg border border-white/10">
              <Target className="w-3.5 h-3.5 text-emerald-300" />
              <span>10+ Expert Doctors</span>
            </div>
          </div>

          <button
            onClick={handleBookCamp}
            className="group inline-flex items-center gap-2 px-8 py-3 bg-white text-emerald-700 rounded-full hover:bg-emerald-50 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 font-bold text-sm border-2 border-white/20"
          >
            <Calendar className="w-4 h-4" />
            Book Your Free Camp
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Interactive CTA */}
      <section className="px-4 py-16 bg-white">
        <div className="mx-auto max-w-4xl">
          <div className="p-8 bg-gradient-to-br from-emerald-50 via-white to-blue-50 rounded-2xl shadow-2xl border border-emerald-100/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-200/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-200/20 rounded-full blur-3xl"></div>
            
            <div className="relative text-center mb-6">
              <span className="inline-block px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full mb-3 shadow-md tracking-wider">✦ GET STARTED</span>
              <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl">What Do You Need Today?</h2>
              <p className="text-slate-500 mt-1 text-sm">Tell us a bit about yourself and we'll connect you with the right solution.</p>
            </div>

            <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-500" />
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-sm text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Enter WhatsApp number"
                  className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-sm text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                  Who are you?
                </label>
                <div className="relative">
                  <select
                    value={selectedAudience}
                    onChange={(e) => setSelectedAudience(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-lg appearance-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-sm text-sm"
                  >
                    <option value="">Select...</option>
                    <option value="Individual">Individual</option>
                    <option value="RWA Head">RWA Head</option>
                    <option value="Clinic Owner">Clinic Owner</option>
                    <option value="Corporate HR">Corporate HR</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-500" />
                  Looking for?
                </label>
                <div className="relative">
                  <select
                    value={selectedNeed}
                    onChange={(e) => setSelectedNeed(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-lg appearance-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-sm text-sm"
                  >
                    <option value="">Select...</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Camp">Camp</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Branding">Branding</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="relative mt-6 text-center">
              <button
                onClick={handleInteractiveCTA}
                disabled={!name || !whatsapp || !selectedAudience || !selectedNeed}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-full hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-xl shadow-emerald-200 hover:shadow-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Start Free Chat on WhatsApp
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-16 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full mb-3 shadow-md tracking-wider">✦ TESTIMONIALS</span>
            <h2 className="text-3xl font-bold text-slate-800 sm:text-4xl">What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">Community Says</span></h2>
            <p className="mt-1 text-slate-500 text-base">Real stories from real people who trust Timely Health</p>
          </div>

          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-50/80 to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-50/80 to-transparent z-10"></div>
            
            <div className="overflow-hidden">
              <div className="flex gap-4 animate-scroll">
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={`first-${index}`} 
                    className="flex-shrink-0 w-72 p-5 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-100 hover:border-emerald-200"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.author} 
                        className="w-10 h-10 rounded-full shadow-md border-2 border-emerald-100"
                      />
                      <div>
                        <div className="flex items-center gap-0.5">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="font-bold text-slate-800 text-xs">{testimonial.author}</p>
                        <p className="text-[10px] text-slate-500">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="mb-1">
                      <Quote className="w-4 h-4 text-emerald-300" />
                    </div>
                    <blockquote className="text-slate-600 text-xs leading-relaxed mb-2">"{testimonial.text}"</blockquote>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <MapPin className="w-2.5 h-2.5" />
                      <span>{testimonial.location}</span>
                    </div>
                  </div>
                ))}
                
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={`second-${index}`} 
                    className="flex-shrink-0 w-72 p-5 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-100 hover:border-emerald-200"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.author} 
                        className="w-10 h-10 rounded-full shadow-md border-2 border-emerald-100"
                      />
                      <div>
                        <div className="flex items-center gap-0.5">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="font-bold text-slate-800 text-xs">{testimonial.author}</p>
                        <p className="text-[10px] text-slate-500">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="mb-1">
                      <Quote className="w-4 h-4 text-emerald-300" />
                    </div>
                    <blockquote className="text-slate-600 text-xs leading-relaxed mb-2">"{testimonial.text}"</blockquote>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <MapPin className="w-2.5 h-2.5" />
                      <span>{testimonial.location}</span>
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
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
          width: max-content;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: float-delay 8s ease-in-out infinite;
        }
      `}</style>

      {/* Google Reviews CTA */}
      <div className="px-4 py-12 bg-white">
        <div className="mx-auto max-w-sm">
          <div className="p-8 text-center bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-2xl border-2 border-amber-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <h2 className="text-2xl font-bold mb-2">
              <span className="text-[#4285F4]">G</span>
              <span className="text-[#EA4335]">o</span>
              <span className="text-[#FBBC05]">o</span>
              <span className="text-[#4285F4]">g</span>
              <span className="text-[#34A853]">l</span>
              <span className="text-[#EA4335]">e</span>
              <span className="text-slate-800"> Reviews</span>
            </h2>
            <div className="flex justify-center gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-slate-600 mb-4 text-sm">Join 50+ happy families who rated us 5 stars!</p>
            <a
              href="https://search.google.com/local/writereview?placeid=ChIJ89efNxeRyzsR5LXCKSPORfQ"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-emerald-700 border-2 border-emerald-200 rounded-full hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-lg hover:shadow-xl font-semibold text-sm"
            >
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              Give us a rating
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Brand Promise - With Indian Image Background */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        <div className="absolute inset-0">
          <img 
            src={promiseBg} 
            alt="Indian Healthcare" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
        
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${svgPattern2})` }}></div>
        
        {/* Indian flag colors overlay */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-white to-green-500 opacity-60"></div>
        
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-pulse delay-300"></div>
        
        <div className="absolute top-1/3 right-20 opacity-10 text-6xl animate-float">✦</div>
        <div className="absolute bottom-1/3 left-20 opacity-10 text-4xl animate-float-delay">✦</div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-12 text-center text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full mb-4 shadow-lg">
            <Compass className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Our Promise</span>
          </div>
          <h2 className="text-4xl font-bold sm:text-5xl mb-4 leading-tight">
            "Care You Can Trust. <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-blue-200">Right Where You Are.</span>"
          </h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto text-base">We believe healthcare should be simple, local, and always within reach — for everyone.</p>
          <button
            onClick={handleWhatsApp}
            className="group inline-flex items-center gap-2 px-6 py-2.5 bg-white text-emerald-700 rounded-full hover:bg-emerald-50 transition-all shadow-2xl shadow-emerald-800/30 hover:shadow-3xl font-bold text-sm hover:scale-105 transform duration-300"
          >
            <Phone className="w-4 h-4" />
            Get Started Today
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <TimelyFooter/>
    </div>
  )
}

export default HomePage