import { Building, Calendar, Heart, Home, Phone, Shield, Stethoscope, Users } from 'lucide-react'
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
      icon: <Shield className="w-12 h-12 text-indigo-600" />,
      title: "Second Opinions",
      description: "Consult expert doctors before making major treatment decisions",
      link: "/second-opinions",
      details: [
        "Expert medical second opinions",
        "Review of treatment plans",
        "Consultation with specialists",
        "Detailed medical analysis",
        "Peace of mind for critical decisions"
      ]
    },
    {
      icon: <Home className="w-12 h-12 text-green-600" />,
      title: "Home Diagnostics",
      description: "Trusted lab services, sample collection from your doorstep",
      link: "/home-diagnostics",
      details: [
        "Home sample collection service",
        "Comprehensive health checkup packages",
        "Fast and accurate lab results",
        "Digital reports delivery",
        "Expert consultation on reports"
      ]
    },
    {
      icon: <Users className="w-12 h-12 text-purple-600" />,
      title: "Community Health Camps",
      description: "Full-service health drives for RWAs, apartments, or colonies",
      link: "/community-health-camps",
      details: [
        "Complete health screening camps",
        "Multi-specialty doctor panels",
        "On-site diagnostic facilities",
        "Health awareness sessions",
        "Customized camp packages"
      ]
    },
    {
      icon: <Heart className="w-12 h-12 text-red-600" />,
      title: "Wellness Workshops",
      description: "Yoga, nutrition, and mental health sessions for prevention & balance",
      link: "/wellness-sessions",
      details: [
        "Group yoga and meditation sessions",
        "Nutrition counseling workshops",
        "Mental health awareness programs",
        "Stress management techniques",
        "Lifestyle modification guidance"
      ]
    },
    {
      icon: <Stethoscope className="w-12 h-12 text-blue-600" />,
      title: "Doctor Consultations",
      description: "Verified general physicians & specialists — book online or locally",
      link: "/doctor-consultations",
      details: [
        "24/7 availability for urgent consultations",
        "Verified and experienced doctors",
        "Online and offline consultation options",
        "Specialist referrals when needed",
        "Follow-up care and monitoring"
      ]
    },
    {
      icon: <Building className="w-12 h-12 text-orange-600" />,
      title: "Corporate Health Programs",
      description: "Employee checkups, vaccination drives, stress management sessions",
      link: "/corporate-health-programs",
      details: [
        "Employee health checkup programs",
        "Workplace vaccination drives",
        "Corporate wellness workshops",
        "Health risk assessments",
        "Occupational health services"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
        <TimelyNavbar/>
      {/* Hero Section */}
      <section className="px-6 py-5 text-white bg-white lg:px-20 lg:py-5 bg-opacity-60">
        <div className="max-w-4xl mx-auto text-left">
          <h1 className="mb-6 text-3xl font-bold md:text-5xl font-calibri">
            Healthcare{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500 font-calibri">
              That Comes to You
            </span>
          </h1>
          <p className="mb-8 font-sans text-lg">
            Timely Health delivers personalized care through a mix of digital and on-ground services — 
            right at your home, clinic, or community.
          </p>
        </div>
      {/* Image Grid */}
<div className="grid max-w-4xl grid-cols-1 gap-6 mx-auto md:grid-cols-2">
  <img
    src={img1}
    alt="Healthcare Services 1"
    className="object-cover w-full rounded-lg shadow-lg h-60"
  />
  <img
    src={img2}
    alt="Healthcare Services 2"
    className="object-cover w-full rounded-lg shadow-lg h-60"
  />
  <img
    src={img3}
    alt="Healthcare Services 3"
    className="object-cover w-full rounded-lg shadow-lg h-60"
  />
  <img
    src={img4}
    alt="Healthcare Services 4"
    className="object-cover w-full rounded-lg shadow-lg h-60"
  />
</div>

      </section>

      {/* Services Grid */}
      <section className="py-5">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {services.map((service, index) => (
              <div
                key={index}
                onClick={() => navigate(service.link)}
                className="p-8 transition-shadow bg-white shadow-lg cursor-pointer rounded-xl hover:shadow-xl"
              >
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">{service.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-#007A52 mb-3 font-calibri text-[#007a52]">
                      {service.title}
                    </h3>
                    <p className="mb-4 font-sans leading-relaxed text-gray-700">
                      {service.description}
                    </p>
                    <ul className="space-y-2">
                      {service.details.map((detail, idx) => (
                        <li
                          key={idx}
                          className="flex items-center space-x-2 leading-relaxed text-gray-700"
                        >
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                    {/* 🔴 "Learn More" Button Remove */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service CTAs */}
      <section className="py-5 bg-white">
        <div className="max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold  mb-8 font-calibri text-[#007a52]">
            Ready to Get Started?
          </h2>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              onClick={handleBookDoctor}
              className="flex items-center justify-center px-6 py-3 space-x-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Phone size={20} />
              <span className='font-sans'>Book a Doctor</span>
            </button>
            <button
              onClick={handleOrganizeCamp}
              className="flex items-center justify-center px-6 py-3 space-x-2 font-semibold text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700"
            >
              <Calendar size={20} />
              <span className='font-sans'>Organize a Health Camp</span>
            </button>
            <button
              onClick={handleHealthPlan}
              className="flex items-center justify-center px-6 py-3 space-x-2 font-semibold text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WhatsApp"
                className="w-6 h-6"
              />
              <span className='font-sans'>Get a Free Preventive Health Plan</span>
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 text-center text-white bg-gradient-to-r from-blue-500 to-green-500">
        <div className="max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold font-calibri text-[#007a52]">
            Have Questions About Our Services?
          </h2>
          <p className="mb-8 font-sans text-lg leading-relaxed text-white">
            Our health advisors are ready to help you choose the right service for your needs.
          </p>
          <button
            onClick={handleWhatsApp}
            className="px-8 py-4 font-sans font-semibold text-blue-600 transition-colors bg-white rounded-lg hover:bg-green-500"
          >
            Chat with Our Health Advisor
          </button>
        </div>
      </section>
      <TimelyFooter/>
    </div>
  )
}

export default ServicesPage