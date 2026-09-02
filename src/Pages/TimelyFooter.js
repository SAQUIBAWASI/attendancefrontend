import { Facebook, FileText, Globe, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from "../Images/logo2.png"

const TimelyFooter = () => {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")

  const handleWhatsApp = () => {
    window.open('https://wa.me/919010481048?text=Hello! I would like to know more about Timely Health services.', '_blank')
  }

  const handleCall = () => {
    window.location.href = 'tel:+919014424455'
  }

  const handleEmail = () => {
    window.location.href = 'mailto:hello@timelyhealth.com'
  }

  return (
    <footer className="relative text-white bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-t border-white/10">
      <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center mb-4 space-x-3">
              <div className="flex items-center justify-center w-32 h-32">
                <img
                  src={logo}
                  alt="Timely Health Logo"
                  className="object-contain w-full h-full"
                />
              </div>
              {/* Company Name Below Logo */}
              <h2 className="text-2xl font-bold text-white tracking-wide">
                Timely Healthtech Pvt Ltd.
              </h2>
            </div>
            <p className="max-w-md mb-6 text-gray-300 leading-relaxed text-base">
              Care You Can Trust. Right Where You Are. We believe healthcare should be simple, local, and always within reach — for everyone.
            </p>
            <div className="flex space-x-4">
              {/* WhatsApp Button */}
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                aria-label="WhatsApp"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                  alt="WhatsApp"
                  className="w-8 h-8"
                />
              </button>

              {/* Call Button */}
              <button
                onClick={handleCall}
                className="flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                aria-label="Call"
              >
                <Phone size={24} className="text-blue-600" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 text-xl font-semibold tracking-wide">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors duration-200 no-underline text-base">Home</Link></li>
              <li><Link to="/service" className="text-gray-300 hover:text-white transition-colors duration-200 no-underline text-base">Services</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors duration-200 no-underline text-base">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors duration-200 no-underline text-base">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-5 text-xl font-semibold tracking-wide">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 group">
                <Phone size={18} className="text-blue-400 group-hover:text-blue-300 transition-colors" />
                <button onClick={handleCall} className="text-gray-300 hover:text-white transition-colors duration-200 no-underline text-base">
                  +91 9010481048
                </button>
              </div>
              <div className="flex items-center space-x-3 group">
                <Mail size={18} className="text-blue-400 group-hover:text-blue-300 transition-colors" />
                <button onClick={handleEmail} className="text-gray-300 hover:text-white transition-colors duration-200 no-underline text-base">
                  hello@timelyhealth.com
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <Globe size={18} className="text-blue-400" />
                <span className="text-gray-300 text-base">www.timelyhealth.in</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin size={18} className="text-blue-400" />
                <span className="text-gray-300 text-base">Hyderabad, India</span>
              </div>
              {/* Social Media Row */}
              <div className="flex items-center space-x-5 pt-2">
                <a href="https://www.facebook.com/share/1B2LaDiY5Q/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-400 transition-all duration-200 hover:scale-110 no-underline">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="https://www.instagram.com/timelyhealth1?igsh=MXY3ZWtsc2dwbjZ0cQ==" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-pink-400 transition-all duration-200 hover:scale-110 no-underline">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-500 transition-all duration-200 hover:scale-110 no-underline">
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-sky-400 transition-all duration-200 hover:scale-110 no-underline">
                  <Twitter className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 mt-10 text-center border-t border-gray-700/50">
          <p className="text-gray-400 text-base tracking-wide">
            © 2024 Timely Healthtech Pvt Ltd. All rights reserved. | Trusted Healthcare, Just Around the Corner.
          </p>
        </div>
      </div>

      {/* Floating Chat Widget - Attractive Glassmorphism */}
      <div className="fixed bottom-6 right-6 z-50">
        {isChatOpen ? (
          <div className="w-96 h-[500px] bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col border border-white/30 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-emerald-600 to-green-500 text-white">
              <span className="font-semibold text-base tracking-wide">💬 Live Chat Support</span>
              <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-sm bg-gray-50/50">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <p
                    className={`px-4 py-2.5 rounded-2xl shadow-sm max-w-[75%] ${
                      msg.from === "user"
                        ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-br-none"
                        : "bg-white text-gray-800 border border-gray-200/80 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-full focus:ring-2 focus:ring-emerald-400 focus:outline-none text-gray-800 bg-white/90"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const btn = document.getElementById('chat-send-btn')
                    if (btn) btn.click()
                  }
                }}
              />
              <button
                id="chat-send-btn"
                onClick={() => {
                  if (!input.trim()) return;
                  const newMessages = [...messages, { from: "user", text: input }];
                  setMessages(newMessages);
                  setInput("");

                  // Auto-replies
                  setTimeout(() => {
                    setMessages((prev) => [
                      ...prev,
                      { from: "bot", text: "👋 Welcome to Timely Health!" },
                    ]);
                  }, 600);

                  setTimeout(() => {
                    setMessages((prev) => [
                      ...prev,
                      { from: "bot", text: "💡 How can we assist you today?" },
                    ]);
                  }, 1400);

                  setTimeout(() => {
                    setMessages((prev) => [
                      ...prev,
                      { from: "bot", text: "📞 Our support team is available 24/7." },
                    ]);
                  }, 2200);

                  setTimeout(() => {
                    setMessages((prev) => [
                      ...prev,
                      { from: "bot", text: "✅ Thank you! Our team will contact you shortly." },
                    ]);
                  }, 3000);
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white text-sm font-medium rounded-full shadow-md hover:shadow-lg transition-all"
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full shadow-2xl hover:shadow-xl transition-all hover:scale-105"
          >
            <FileText size={28} className="text-white" />
          </button>
        )}
      </div>
    </footer>
  )
}

export default TimelyFooter