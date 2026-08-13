import { CheckCircle, Eye, Heart, Shield, Target, Users, ArrowRight, Star, Award, Sparkles } from 'lucide-react'
import TimelyNavbar from '../Components/TimelyNavbar'
import TimelyFooter from './TimelyFooter'
import img2 from "../Images/s2 copy.jpg"

const AboutPage = () => {
  const values = [
    {
      icon: <Users className="w-10 h-10 text-blue-600" />,
      title: "Community First",
      description: "We prioritize the health and wellbeing of entire communities, not just individuals.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      number: "01"
    },
    {
      icon: <Heart className="w-10 h-10 text-red-600" />,
      title: "Prevention > Cure",
      description: "We believe in preventing health issues before they become serious problems.",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      number: "02"
    },
    {
      icon: <Shield className="w-10 h-10 text-blue-700" />,
      title: "Verified Expertise",
      description: "All our healthcare providers are thoroughly verified and experienced professionals.",
      color: "from-blue-700 to-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      number: "03"
    },
    {
      icon: <CheckCircle className="w-10 h-10 text-purple-600" />,
      title: "Simplicity in Care",
      description: "Healthcare should be easy to access and understand for everyone.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      number: "04"
    },
    {
      icon: <Target className="w-10 h-10 text-indigo-600" />,
      title: "Human + Digital Integration",
      description: "We combine the best of technology with human touch for optimal care.",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      number: "05"
    }
  ]

  const handleWhatsApp = () => {
    window.open(
      'https://wa.me/919010481048?text=Hello! I would like to know more about Timely Health and your mission.',
      '_blank'
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <TimelyNavbar />
      
      {/* Hero Section - Added top padding for navbar */}
      <section className="relative px-6 py-12 overflow-hidden bg-white lg:px-20 lg:py-16 pt-20 md:pt-24 lg:pt-28">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-100 rounded-full opacity-20 translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative max-w-6xl mx-auto">
          <div className="relative max-w-4xl mx-auto mb-10">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl opacity-30 blur-xl"></div>
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={img2}
                alt="Healthcare Services"
                className="object-cover w-full h-[400px] md:h-[500px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 mb-6 bg-blue-100 rounded-full">
              <span className="text-sm font-medium text-blue-800">✦ About Timely Health</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl font-calibri text-gray-900">
              Our Vision for a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                Healthier, Closer Future
              </span>
            </h1>
            <p className="mb-4 text-xl text-gray-700 font-sans">
              We're not just a healthcare platform — we're your neighborhood's health partner.
            </p>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 font-sans leading-relaxed">
              We connect people to care that's personal, accessible, and built around community. 
              Our platform bridges the gap between traditional healthcare and modern convenience, 
              ensuring that quality medical care is always within reach.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story - Redesigned with better look */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center px-4 py-2 mb-4 bg-gradient-to-r from-blue-100 to-green-100 rounded-full">
              <span className="text-sm font-medium text-blue-800">✦ Our Journey</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 font-calibri">Our Story</h2>
            <div className="w-20 h-1 mx-auto mt-4 bg-gradient-to-r from-blue-600 to-green-600 rounded-full"></div>
          </div>
          
          <div className="relative overflow-hidden bg-white shadow-2xl rounded-2xl border border-gray-100">
            {/* Decorative gradient line at top */}
            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-green-500 to-blue-600"></div>
            
            <div className="relative p-10">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-green-600/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative space-y-6">
                {/* Quote icon */}
                <div className="text-6xl text-blue-200 font-serif leading-none">"</div>
                
                <p className="text-lg leading-relaxed text-gray-700 font-sans pl-6 border-l-4 border-blue-400">
                  Timely Health was born from a simple observation: healthcare in urban India is often 
                  fragmented, impersonal, and difficult to navigate. Families struggle to find trusted 
                  doctors nearby, communities lack access to preventive care, and medical emergencies 
                  often lead to panic rather than prompt, informed action.
                </p>
                
                <p className="text-lg leading-relaxed text-gray-700 font-sans">
                  We founded Timely Health with the belief that healthcare should be community-centered, 
                  prevention-focused, and easily accessible to everyone. By combining digital convenience 
                  with local expertise, we're building a healthcare ecosystem that truly serves the needs 
                  of modern urban families and communities.
                </p>
                
                <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                  </div>
                  <p className="text-lg leading-relaxed text-gray-700 font-sans">
                    Today, we're proud to serve thousands of families across Hyderabad, connecting them 
                    with trusted healthcare providers, organizing community health initiatives, and making 
                    preventive care a priority in every neighborhood we serve.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission and Vision - Premium Design */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-transparent to-green-50/30"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-200/10 to-green-200/10 rounded-full blur-3xl"></div>
        
        <div className="relative px-4 mx-auto max-w-6xl sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center px-4 py-2 mb-4 bg-gradient-to-r from-blue-100 to-green-100 rounded-full">
              <span className="text-sm font-medium text-blue-800">✦ Our Purpose</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 font-calibri">Mission &amp; Vision</h2>
            <div className="w-20 h-1 mx-auto mt-4 bg-gradient-to-r from-blue-600 to-green-600 rounded-full"></div>
            <p className="mt-4 text-lg text-gray-600 font-sans">
              Driving our commitment to better healthcare for everyone
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-3xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500"></div>
              <div className="relative h-full p-12 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-blue-100/50 group-hover:border-blue-200/80">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-600/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative">
                  <div className="flex items-center justify-center w-20 h-20 mb-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-3xl font-bold text-gray-900 font-calibri">Mission</h3>
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-600/30 to-transparent"></div>
                  </div>
                  <p className="text-lg leading-relaxed text-gray-700 font-sans">
                    To build a unified platform that connects individuals, communities, and organizations 
                    with verified healthcare providers — both digitally and offline — enabling smarter, 
                    safer health choices for everyone in our communities.
                  </p>
                  <div className="mt-6 flex items-center text-blue-600 font-semibold font-sans">
                    <span>Learn more</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-green-400 rounded-3xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500"></div>
              <div className="relative h-full p-12 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-green-100/50 group-hover:border-green-200/80">
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tl from-green-600/5 to-transparent rounded-full translate-y-1/2 -translate-x-1/2"></div>
                <div className="relative">
                  <div className="flex items-center justify-center w-20 h-20 mb-8 bg-gradient-to-br from-green-600 to-green-400 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Eye className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-3xl font-bold text-gray-900 font-calibri">Vision</h3>
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-green-600/30 to-transparent"></div>
                  </div>
                  <p className="text-lg leading-relaxed text-gray-700 font-sans">
                    To make healthcare easy, local, and preventive — enhancing quality of life for all. 
                    We envision a future where every person has access to trusted healthcare advice 
                    and services right in their neighborhood.
                  </p>
                  <div className="mt-6 flex items-center text-green-600 font-semibold font-sans">
                    <span>Learn more</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values - Single Row Design */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100/20 rounded-full translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">✦ Our Principles</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 font-calibri">Our Core Values</h2>
            <div className="w-24 h-1 mx-auto mt-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-full"></div>
            <p className="mt-4 text-lg text-gray-600 font-sans">
              These principles guide everything we do at Timely Health
            </p>
          </div>

          {/* Single Row - All 5 values in one row with scroll on small screens */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="group relative"
              >
                <div className={`absolute -inset-1 bg-gradient-to-r ${value.color} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`}></div>
                
                <div className={`relative h-full p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border ${value.borderColor} group-hover:border-transparent hover:scale-[1.05] flex flex-col items-center text-center`}>
                  <div className="absolute top-2 right-3">
                    <span className={`text-2xl font-bold bg-gradient-to-r ${value.color} bg-clip-text text-transparent opacity-30 font-calibri`}>
                      {value.number}
                    </span>
                  </div>

                  <div className={`relative inline-flex items-center justify-center w-14 h-14 mb-3 rounded-2xl ${value.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    {value.icon}
                  </div>

                  <h3 className="mb-2 text-base font-bold text-gray-900 font-calibri">
                    {value.title}
                  </h3>

                  <p className="text-sm text-gray-600 font-sans leading-relaxed">
                    {value.description}
                  </p>

                  <div className={`absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r ${value.color} group-hover:w-full transition-all duration-500 rounded-full`}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md border border-gray-100">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="text-gray-700 font-sans text-sm">
                <span className="font-semibold">5 Core Values</span> — Driving our commitment to better healthcare
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-r from-blue-600 to-green-600">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full opacity-10 translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        <div className="relative max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-4xl font-bold text-white font-calibri">
            Ready to Experience Healthcare That Cares?
          </h2>
          <p className="mb-8 text-xl text-white/90 font-sans">
            Join thousands of families who trust Timely Health for their healthcare needs.
          </p>
          <button
            onClick={handleWhatsApp}
            className="px-10 py-4 text-lg font-semibold text-blue-600 transition-all bg-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transform font-sans hover:bg-gray-50"
          >
            Start Your Health Journey With Us →
          </button>
        </div>
      </section>
      
      <TimelyFooter />
    </div>
  )
}

export default AboutPage