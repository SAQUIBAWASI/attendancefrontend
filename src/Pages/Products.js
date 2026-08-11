import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Zap,
  HeartPulse,
  Building2,
  Microscope,
  ChevronRight,
  Sparkles,
  Cpu,
  Radar,
  Award,
  Star,
  ArrowRight,
  Shield,
  TrendingUp,
  Users
} from 'lucide-react';
import TimelyFooter from './TimelyFooter';
import TimelyNavbar from '../Components/TimelyNavbar';

// All imports removed - using placeholder images instead

// Simple placeholder components
const CTASection = () => (
  <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-12 text-center text-white">
    <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
    <p className="text-lg opacity-90 mb-6">Join thousands of businesses using our platform</p>
    <Link to="/contact" className="inline-block bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all hover:scale-105">
      Contact Us Today
    </Link>
  </div>
);

const Footer = () => (
  <footer className="bg-gray-50 border-t border-gray-200 py-8 px-6">
    <div className="max-w-7xl mx-auto text-center text-gray-600 text-sm">
      <p>© {new Date().getFullYear()} Ingrain Systems. All rights reserved.</p>
    </div>
  </footer>
);

const WhyChooseUs = () => (
  <section className="py-16 px-6 bg-gray-50">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-calibri">
        Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Us</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Shield, title: "Enterprise Security", desc: "Bank-level encryption and compliance standards" },
          { icon: TrendingUp, title: "Scalable Solutions", desc: "Grow your business with our flexible platform" },
          { icon: Users, title: "Dedicated Support", desc: "24/7 expert support for all your needs" }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-4">
              <item.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Placeholder images - you can replace these with your actual images
const imgHero = `https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&q=80&w=2426`;
const imgHrms = `https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&q=80&w=2670`;
const imgRecruitment = `https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&q=80&w=2670`;
const imgBmi = `https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&q=80&w=2670`;
const imgCoworking = `https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&q=80&w=2670`;
const imgLab = `https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&q=80&w=2670`;
const imgTask = `https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&q=80&w=2670`;

const productsData = [
  {
    id: "recruitment",
    title: "Recruitment",
    subtitle: "HIRE SMARTER",
    description: "Build your dream team with a precision-engineered recruitment ecosystem that automates the heavy lifting.",
    items: [
      "Admin & User Dashboards",
      "Job Posting & Management System",
      "Dynamic Candidate Pipelines",
      "Assessment Management",
      "Interview Scheduling & Status Updates",
      "Employee Journey Tracking"
    ],
    image: imgRecruitment,
    icon: Briefcase,
    color: "blue",
    bgColor: "from-blue-600/20 to-transparent",
    iconColor: "text-blue-400",
    dotColor: "bg-blue-500",
    shadow: "shadow-blue-500/10",
    viewMorePath: "https://ingrainhire.ingrainsystems.com/client-login",
    routePath: "https://iryax.com/recruitment",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: "payroll",
    title: "Payroll",
    subtitle: "SYSTEMS",
    description: "Seamlessly manage payroll, compliance, and employee operations in one unified command center.",
    items: [
      "Admin & Employee Attendance Dashboards",
      "Leave & Holiday Management System",
      "Shift Scheduling & Roster Management",
      "Attendance Regularization & Approval Workflow",
      "Geo-location & Remote Attendance Tracking",
      "Productivity Tracking & Payroll Processing",
    ],
    image: imgHrms,
    icon: Zap,
    color: "purple",
    bgColor: "from-purple-600/20 to-transparent",
    iconColor: "text-purple-400",
    dotColor: "bg-purple-500",
    shadow: "shadow-purple-500/10",
    viewMorePath: "https://www.timelyhealth.in/employee-login",
    routePath: "https://iryax.com/attendance",
    gradient: "from-purple-500 to-indigo-500"
  },
  {
    id: "task-management",
    title: "Task Management",
    subtitle: "PRODUCTIVITY",
    description: "Plan, assign, track, and manage tasks efficiently with a centralized task management platform that improves team collaboration and productivity.",
    items: [
      "Admin, Manager & Employee Dashboards",
      "Project & Task Creation",
      "Task Assignment & Priority Management",
      "Task Status Tracking (To Do, In Progress, Completed)",
      "Due Date & Deadline Reminders",
      "Employee Workload Management",
      "Team Collaboration & Comments",
      "File & Document Attachments",
      "Task Reports & Analytics",
      "Productivity Monitoring Dashboard"
    ],
    image: imgTask,
    icon: Zap,
    color: "emerald",
    bgColor: "from-emerald-600/20 to-transparent",
    iconColor: "text-emerald-400",
    dotColor: "bg-emerald-500",
    shadow: "shadow-emerald-500/10",
    viewMorePath: "https://taskmanagement.iryax.com/",
    routePath: "https://iryax.com/task-management",
    gradient: "from-emerald-500 to-teal-500"
  },
  {
    id: "Medical Camps",
    title: "Medical Camps",
    subtitle: "HEALTH",
    description: "Organize and manage medical camps efficiently with a centralized system for coordination, reporting, and patient care.",
    items: [
      "Admin & User Dashboards with real-time insights",
      "Create & Manage Medical Camps",
      "Partner & Doctor Invitation Management",
      "Patient Registration & Medical Reports Tracking",
      "Camp Scheduling & Resource Planning",
      "Real-time Camp Activity Monitoring",
    ],
    image: imgBmi,
    icon: HeartPulse,
    color: "rose",
    bgColor: "from-rose-600/20 to-transparent",
    iconColor: "text-rose-400",
    dotColor: "bg-rose-500",
    shadow: "shadow-rose-500/10",
    viewMorePath: "http://62.72.29.27:3041/",
    routePath: "https://iryax.com/camp",
    gradient: "from-rose-500 to-orange-500"
  },
  {
    id: "coworking",
    title: "Coworking Space",
    subtitle: "SPACES",
    description: "Optimize your physical footprint with intuitive space management and floor plan logistics.",
    items: [
      "Admin & User Dashboards with real-time insights",
      "Desk & Meeting cabin Booking Management",
      "Member & Visitor Access Control",
      "Space Utilization & Occupancy Tracking",
    ],
    image: imgCoworking,
    icon: Building2,
    color: "orange",
    bgColor: "from-orange-600/20 to-transparent",
    iconColor: "text-orange-400",
    dotColor: "bg-orange-500",
    shadow: "shadow-orange-500/10",
    routePath: "https://iryax.com/workspace",
    viewMorePath: "https://iryax.com/workspace",
    gradient: "from-orange-500 to-amber-500"
  },
  {
    id: "lab",
    title: "Lab Management",
    subtitle: "PRECISION",
    description: "Streamline laboratory operations with a smart system for sample tracking, reporting, and compliance, ensuring accuracy at every step",
    items: [
      "Admin & Phlebotomist Dashboards with real-time insights",
      "Home Sample Collection & Scheduling Management",
      "Sample Tracking & Processing Workflow",
      "Patient Reports Generation & Secure Access",
      "Inventory & Lab Asset Monitoring",
      "Test Booking & Appointment Management"
    ],
    image: imgLab,
    icon: Microscope,
    color: "emerald",
    bgColor: "from-emerald-600/20 to-transparent",
    iconColor: "text-emerald-400",
    dotColor: "bg-emerald-500",
    shadow: "shadow-emerald-500/10",
    isUpcoming: true,
    gradient: "from-emerald-500 to-teal-500"
  }
];

const ProductCard = ({ product }) => {
  const Icon = product.icon;

  return (
    <div id={product.id} className="w-full flex items-center justify-center px-4 py-6 md:py-10">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full max-w-[1000px] bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 border border-gray-200 overflow-hidden relative group`}
      >
        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient} opacity-0 group-hover:opacity-[0.04] transition-all duration-500`}></div>
        
        {/* Premium Glow Effect */}
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${product.gradient} opacity-0 group-hover:opacity-10 blur-2xl transition-all duration-700`}></div>
        
        <div className="relative p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-center">
          {/* Image Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-2/5 order-first lg:order-none"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-100 group bg-gray-50 p-1 md:p-1.5">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-auto rounded-xl group-hover:scale-[1.02] transition-transform duration-700"
              />
              {product.isUpcoming && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[8px] font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                  Coming Soon
                </div>
              )}
            </div>
          </motion.div>

          {/* Content Column */}
          <div className="flex-1 flex flex-col">
            {/* Header Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className={`p-2 rounded-xl bg-gradient-to-br ${product.gradient} shadow-lg`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-[8px] md:text-[9px] font-bold text-gray-400 tracking-[0.4em] uppercase">
                {product.subtitle}
              </h3>
              {product.isUpcoming && (
                <span className="bg-emerald-50 text-emerald-600 text-[7px] md:text-[8px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 tracking-widest uppercase animate-pulse">
                  Coming Soon
                </span>
              )}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className={`text-2xl md:text-3xl font-bold mb-2 tracking-tight font-calibri text-gray-900`}
            >
              {product.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-sm text-gray-600 font-light leading-relaxed mb-4"
            >
              {product.description}
            </motion.p>

            {/* Bullet Points */}
            <div className="relative z-10 w-full grid grid-cols-2 gap-x-4 md:gap-x-6 gap-y-2 mb-6 border-t border-gray-100 pt-4">
              {product.items.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + (idx * 0.1), duration: 0.5 }}
                  className="flex items-center gap-2 group/item justify-start"
                >
                  <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${product.gradient} shrink-0`} />
                  <span className="text-[10px] md:text-xs text-gray-600 font-light tracking-wide text-left line-clamp-1">{item}</span>
                </motion.div>
              ))}
            </div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="relative z-10 flex flex-wrap justify-start gap-3"
            >
              <Link
                to="/contact"
                className={`inline-flex ${
                  product.isUpcoming
                    ? "bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gradient-to-r hover:text-white hover:border-transparent"
                    : `bg-gradient-to-r ${product.gradient} text-white shadow-lg hover:shadow-xl`
                } px-6 py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all hover:scale-[1.02] items-center gap-2 group/btn`}
              >
                {product.isUpcoming ? "Notify Me" : "Book Demo"}
                <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>

              {product.routePath && (
                <Link
                  to={product.routePath}
                  className="inline-flex bg-white text-gray-700 border-2 border-gray-200 px-6 py-2.5 rounded-full text-xs md:text-sm font-semibold hover:bg-gray-50 transition-all hover:scale-[1.02] items-center gap-2 group/btn2"
                >
                  About
                  <ChevronRight className="w-3.5 h-3.5 group-hover/btn2:translate-x-1 transition-transform" />
                </Link>
              )}

              {product.viewMorePath && (
                <a
                  href={product.viewMorePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex bg-white text-gray-700 border-2 border-gray-200 px-6 py-2.5 rounded-full text-xs md:text-sm font-semibold hover:bg-gray-50 transition-all hover:scale-[1.02] items-center gap-2 group/btn2"
                >
                  View
                  <ChevronRight className="w-3.5 h-3.5 group-hover/btn2:translate-x-1 transition-transform" />
                </a>
              )}
            </motion.div>
          </div>
        </div>
        
        {/* Bottom accent line */}
        <div className={`h-0.5 w-full bg-gradient-to-r ${product.gradient} opacity-0 group-hover:opacity-100 transition-all duration-700`}></div>
      </motion.div>
    </div>
  );
};

const Products = () => {
  return (
    <>
      <TimelyNavbar />
    <main className="bg-white text-gray-900 font-sans  md:pt-[64px] no-scrollbar selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* Premium Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 50%), 
                            radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.03) 0%, transparent 50%),
                            radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.02) 0%, transparent 50%)` 
        }}></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
      </div>

      {/* Hero Section */}
      <section className="min-h-[calc(100vh-60px)] flex flex-col items-center justify-center px-6 pt-16 md:pt-20 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto flex flex-col items-center relative z-10"
        >
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full shadow-md border border-blue-200/50"
          >
            <Award className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-800">✦ Our Products</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-gray-900 mb-6 font-calibri">
            Connected Products.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
              One Platform.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 font-light mb-8 max-w-2xl">
            Precision-engineered tools designed to integrate and <br className="hidden md:inline" />
            elevate every aspect of your enterprise.
          </p>

          {/* Integrated Get Started CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-white shadow-xl border border-gray-200 p-4 md:p-6 rounded-3xl">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {[imgRecruitment, imgHrms, imgBmi, imgCoworking].map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-lg"
                    alt="product preview"
                  />
                ))}
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-gray-900 tracking-tight font-calibri">The Lineup</h4>
                <p className="text-xs text-gray-500 font-light">6 core modules designed for scale</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
              <Link
                to="/contact"
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-8 py-3 rounded-full text-sm md:text-base font-semibold hover:shadow-xl transition-all hover:scale-[1.02] flex items-center gap-2 group shadow-lg shadow-blue-200"
              >
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-full"></div>
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-full"></div>
          </div>
        </motion.div>
      </section>

      {/* Products List */}
      {productsData.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}

      {/* Why Choose Us Section */}
      <WhyChooseUs />

      {/* Future Section - Updated with new colors */}
      <section className="relative z-30 bg-white">
        <div className="px-6 max-w-[1200px] mx-auto w-full py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full shadow-md border border-pink-200/50">
              <Sparkles className="w-3.5 h-3.5 text-pink-600" />
              <span className="text-xs font-medium text-pink-800">✦ The Future</span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight font-calibri">
              From Systems to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-orange-600">
                Intelligence
              </span>
            </h2>
            <div className="w-20 h-1 mx-auto bg-gradient-to-r from-pink-600 to-rose-600 rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-gradient-to-r from-pink-600/10 via-purple-600/10 to-rose-600/10 blur-[100px] pointer-events-none z-0"></div>

            {[
              { title: "AI-driven insights", icon: Sparkles, desc: "Turn raw data into actionable intelligence instantly.", gradient: "from-pink-500 to-rose-500", bg: "bg-pink-50", border: "border-pink-200" },
              { title: "Automated workflows", icon: Cpu, desc: "Self-optimizing systems that run your business on autopilot.", gradient: "from-purple-500 to-indigo-500", bg: "bg-purple-50", border: "border-purple-200" },
              { title: "Predictive decisions", icon: Radar, desc: "Anticipate market trends and operations before they happen.", gradient: "from-rose-500 to-orange-500", bg: "bg-rose-50", border: "border-rose-200" }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.6 }}
                className={`relative z-10 bg-white border ${item.border} rounded-3xl p-10 flex flex-col items-center text-center overflow-hidden group transition-all duration-500 hover:-translate-y-2 shadow-lg hover:shadow-xl`}
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br ${item.gradient} p-[2px] mb-8 shadow-lg`}>
                  <div className="absolute inset-[2px] bg-white rounded-full"></div>
                  <item.icon className="relative z-10 w-8 h-8 text-gray-700 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4 font-calibri">{item.title}</h4>
                <p className="text-gray-600 leading-relaxed font-light">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA & Footer Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 pt-12 md:pt-20 pb-0">
        <div className="max-w-[1200px] mx-auto px-6 mb-12 md:mb-16">
          <CTASection />
        </div>
        <Footer />
      </section>

      {/* Navigation Dot Sidebar */}
      <div className="fixed right-10 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-6">
        {productsData.map((product) => (
          <a
            key={product.id}
            href={`#${product.id}`}
            className="group relative flex items-center justify-end"
            title={product.title}
          >
            <span className="absolute right-8 text-xs font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-300 tracking-widest uppercase pointer-events-none whitespace-nowrap bg-white px-2 py-1 rounded shadow-lg">
              {product.title}
            </span>
            <div className={`w-2 h-2 rounded-full bg-gray-300 group-hover:bg-gradient-to-r ${product.gradient} transition-all duration-300 group-hover:scale-150 border border-gray-200`} />
          </a>
        ))}
      </div>
    </main>
      <TimelyFooter />
    </>
  );
};

export default Products;