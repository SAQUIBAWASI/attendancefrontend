import {
  Activity,
  CheckCircle,
  ChevronDown,
  Heart,
  Home,
  Shield,
  Star,
  Stethoscope,
  Users
} from 'lucide-react'
import { useEffect, useState } from 'react'
import img1 from "../Images/s2.jpg"
import Navbar from '../Components/Navbar'
import TimelyNavbar from '../Components/TimelyNavbar'
import TimelyFooter from './TimelyFooter'

const HomePage = () => {
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [selectedAudience, setSelectedAudience] = useState('')
  const [selectedNeed, setSelectedNeed] = useState('')
  const [liveStats, setLiveStats] = useState({
    consultations: 3,
    camps: 1,
    events: 1
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        consultations: prev.consultations + Math.floor(Math.random() * 2),
        camps: prev.camps,
        events: prev.events
      }))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

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
      const message = `Hi! My name is ${name}, my WhatsApp number is ${whatsapp}. 
I am a ${selectedAudience} looking for ${selectedNeed}. Please help me get started.`
      window.open(`https://wa.me/919010481048?text=${encodeURIComponent(message)}`, '_blank')
    }
  }

  const services = [
    {
      icon: <Shield className="w-8 h-8 text-indigo-600" />,
      title: "Second Opinions",
      description: <p className="font-sans">Trusted expert inputs</p>
    },
    {
      icon: <Home className="w-8 h-8 text-green-600" />,
      title: "Home Diagnostics",
      description: <p className="font-sans">Lab tests at home</p>
    },
    {
      icon: <Heart className="w-8 h-8 text-red-600" />,
      title: "Wellness Sessions",
      description: <p className="font-sans">Yoga, stress relief, immunity</p>
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "Health Camps",
      description: <p className="font-sans">For RWAs & companies</p>
    },
    {
      icon: <Stethoscope className="w-8 h-8 text-blue-600" />,
      title: "Doctor Consults",
      description: <p className="font-sans">Verified specialists</p>
    },
    {
      icon: <Activity className="w-8 h-8 text-orange-600" />,
      title: "Community Meetups",
      description: <p className="font-sans">Group care & awareness</p>
    },
  ];


  const whyChooseUs = [
    "✔️ Local-first Care",
    "✔️ Verified Experts Only",
    "✔️ Digital + Offline Access",
    "✔️ Second Opinions Made Easy",
    "✔️ Family & Community Focused",
    "✔️ Prevention-Based Programs"
  ]

  const testimonials = [
    { text: "Our RWA worked with Timely Health for a health camp. Smooth execution, excellent doctor panel.", author: "Shalini V.", role: "RWA Secretary" },
    { text: "Timely Health helped my clinic reach 3x more patients — highly professional.", author: "Dr. Anil M.", role: "ENT Specialist" }
  ]

    return (
    <div>
      {/* Hero Section */}
      <TimelyNavbar/>
      <section className="py-5 bg-white">
        <div className="grid items-stretch grid-cols-1 gap-12 px-6 mx-auto max-w-7xl lg:px-8 lg:grid-cols-2">
          {/* Left Side Text */}
          <div className="flex flex-col justify-center">
            <h1 className="mb-6 text-3xl font-bold font-calibri animate-fade-in md:text-5xl">
              Trusted Healthcare,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500">
                Just Around the Corner
              </span>
            </h1>
            <p className="mb-6 text-lg font-calibri">
              Bringing doctors, diagnostics, and wellness programs closer to
              your home — online and offline.
            </p>

            {/* <div className="flex gap-4 mb-8">
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center transition bg-gray-100 rounded-full shadow w-14 h-14 hover:shadow-md"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                  alt="WhatsApp"
                  className="w-6 h-6"
                />
              </button>
              <button
                onClick={handleBookCamp}
                className="flex items-center justify-center text-white transition-colors bg-blue-600 rounded-full w-14 h-14 hover:bg-blue-700"
              >
                <Calendar size={22} />
              </button>
              <button
                onClick={handleFindDoctor}
                className="flex items-center justify-center text-white transition-colors bg-purple-600 rounded-full w-14 h-14 hover:bg-purple-700"
              >
                <Search size={22} />
              </button>
            </div> */}

            <div className="p-6 shadow-md bg-gradient-to-r from-blue-50 to-green-50 rounded-xl">
              <blockquote className="mb-4 font-sans italic text-gray-700">
                "When Meena's mother experienced chest pain late one evening, she
                needed urgent advice. Through Timely Health, she connected with
                a verified local cardiologist — within 30 minutes. Today, she
                says: 'Timely Health gave us peace of mind when we needed it
                most.'"
              </blockquote>
              <p className="mb-4 font-semibold text-gray-800">
                You deserve that peace of mind too.
              </p>
              <button
                onClick={handleStartConsultation}
                className="px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                → Start a Consultation
              </button>
            </div>
          </div>

          {/* Right Side Image */}
          <div className="flex">
            <img
              src={img1}
              alt="Healthcare Support"
              className="object-cover w-full h-full shadow-lg rounded-2xl"
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center font-calibri text-[#007a52]">Our Services Snapshot</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <div key={index} className="p-6 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
                <div className="flex items-center mb-4 space-x-4">
                  {service.icon}
                  <h3 style={{color:'#007a52'}}>{service.title}</h3>
                </div>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Why Choose Timely Health */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold sm:text-3xl text-[#007a52]">
            Why Choose Timely Health
          </h2>
          <div  className="grid grid-cols-1 gap-4 sm:grid-cols-2 justify-items-center">
            {whyChooseUs.map((item, index) => (
              <div
                key={index}
                className="flex items-center w-full max-w-sm px-4 py-2 space-x-3 rounded-lg shadow-sm bg-gray-50"
              >
                <CheckCircle className="flex-shrink-0 w-5 h-5 text-green-600" />
                <span className="font-sans text-gray-700">{item}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Interactive CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
          <div className="p-8 bg-white shadow-lg rounded-xl">
            <h2 className="mb-8 text-center font-calibri text-[#007a52]">What Do You Need?</h2>
            <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">

              {/* Name Input */}
              <div className="md:col-span-1">
                <label className="block mb-2 font-sans text-sm font-medium">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* WhatsApp Number Input */}
              <div className="md:col-span-1">
                <label className="block mb-2 font-sans text-sm font-medium">WhatsApp Number</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Enter WhatsApp number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Who are you? */}
              <div>
                <label className="block mb-2 font-sans text-sm font-medium">Who are you?</label>
                <div className="relative">
                  <select
                    value={selectedAudience}
                    onChange={(e) => setSelectedAudience(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="Individual">Individual</option>
                    <option value="RWA Head">RWA Head</option>
                    <option value="Clinic Owner">Clinic Owner</option>
                    <option value="Corporate HR">Corporate HR</option>
                  </select>
                  <ChevronDown className="absolute w-5 h-5 text-gray-400 pointer-events-none right-3 top-3" />
                </div>
              </div>

              {/* What are you looking for? */}
              <div>
                <label className="block mb-2 font-sans text-sm font-medium">What are you looking for?</label>
                <div className="relative">
                  <select
                    value={selectedNeed}
                    onChange={(e) => setSelectedNeed(e.target.value)}
                    className="w-full px-4 py-3 font-sans border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Camp">Camp</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Branding">Branding</option>
                  </select>
                  <ChevronDown className="absolute w-5 h-5 text-gray-400 pointer-events-none right-3 top-3" />
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleInteractiveCTA}
                disabled={!name || !whatsapp || !selectedAudience || !selectedNeed}
                className="px-8 py-3 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Start a Free Chat on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
  <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
    {/* Testimonials Heading */}
    <h2 className="mb-12 font-sans text-3xl font-bold text-center text-gray-800">
      Real Testimonials
    </h2>

    {/* Testimonials Grid */}
    <div className="grid grid-cols-1 gap-8 font-sans md:grid-cols-2">
      {testimonials.map((testimonial, index) => (
        <div
          key={index}
          className="p-6 transition shadow bg-gray-50 rounded-xl hover:shadow-md"
        >
          {/* Star Rating */}
          <div className="flex items-center mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-5 h-5 text-yellow-400 fill-current"
              />
            ))}
          </div>

          {/* Testimonial Text */}
          <blockquote className="mb-4 italic text-gray-700">
            “{testimonial.text}”
          </blockquote>

          {/* Author */}
          <cite className="text-sm font-semibold text-gray-900">
            — {testimonial.author}, {testimonial.role}
          </cite>
        </div>
      ))}
    </div>
  </div>
</section>

{/* Google Reviews CTA */}
<div className="flex justify-center py-5 bg-gray-50">
  <div className="w-full max-w-sm p-6 text-center bg-[#fff2ec] rounded-xl shadow-md">
    {/* Google Styled Heading */}
    <h2 className="mb-3 text-2xl font-bold">
      <span className="text-[#4285F4]">G</span>
      <span className="text-[#EA4335]">o</span>
      <span className="text-[#FBBC05]">o</span>
      <span className="text-[#4285F4]">g</span>
      <span className="text-[#34A853]">l</span>
      <span className="text-[#EA4335]">e</span>
      <span className="text-gray-700"> Reviews</span>
    </h2>

    {/* Stars */}
    <div className="mb-4 text-2xl text-yellow-400">★★★★★</div>

    {/* CTA Button */}
    <a
      href="https://search.google.com/local/writereview?placeid=ChIJ89efNxeRyzsR5LXCKSPORfQ"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block px-5 py-2 text-lg font-medium text-[#0c7a56] border-2 border-[#0c7a56] rounded-lg hover:bg-[#0c7a56] hover:text-white transition"
    >
      👉 Give us a rating
    </a>
  </div>
</div>



      {/* Brand Promise */}
      <section className="py-20 pb-10 text-center text-white bg-gradient-to-r from-blue-500 to-green-500">
        <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
          <h2 className="mb-6 text-white font-calibri">"Care You Can Trust. Right Where You Are."</h2>
          <p className="mb-8 font-sans text-white">We believe healthcare should be simple, local, and always within reach — for everyone.</p>
          <button
            onClick={handleWhatsApp}
            className="px-8 py-4 font-semibold text-blue-600 transition-colors bg-white rounded-lg hover:bg-green-500 font-calibri"
          >
            Get Started Today
          </button>
        </div>
      </section>
      <TimelyFooter/>
    </div>
  )
}

export default HomePage