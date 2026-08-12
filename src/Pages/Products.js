import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Zap,
  HeartPulse,
  Building2,
  ChevronRight,
  Sparkles,
  Cpu,
  Radar,
  Award,
  Star,
  ArrowRight,
  Shield,
  TrendingUp,
  Users,
  Package,
  ExternalLink,
  CheckCircle,
  Layers,
  Eye
} from 'lucide-react';
import TimelyFooter from './TimelyFooter';
import TimelyNavbar from '../Components/TimelyNavbar';

// SVG pattern for background
const patternSvg = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

// All products data
const productsData = [
  {
    id: "recruitment",
    title: "Recruitment",
    subtitle: "HIRE SMARTER",
    description: "Build your dream team with a precision-engineered recruitment ecosystem.",
    icon: Briefcase,
    gradient: "from-blue-500 to-cyan-500",
    viewMorePath: "https://iryax.com/recruitment",
    routePath: "https://iryax.com/recruitment",
    isLive: true
  },
  {
    id: "payroll",
    title: "Payroll",
    subtitle: "SYSTEMS",
    description: "Seamlessly manage payroll, compliance, and employee operations.",
    icon: Zap,
    gradient: "from-purple-500 to-indigo-500",
    viewMorePath: "https://iryax.com/attendance",
    routePath: "https://iryax.com/attendance",
    isLive: true
  },
  {
    id: "medical-camps",
    title: "Medical Camps",
    subtitle: "HEALTH",
    description: "Organize and manage medical camps efficiently.",
    icon: HeartPulse,
    gradient: "from-rose-500 to-orange-500",
    viewMorePath: "https://iryax.com/camp",
    routePath: "https://iryax.com/camp",
    isLive: true
  },
  {
    id: "coworking",
    title: "Coworking Space",
    subtitle: "SPACES",
    description: "Optimize your physical footprint with intuitive space management.",
    icon: Building2,
    gradient: "from-orange-500 to-amber-500",
    viewMorePath: "https://iryax.com/workspace",
    routePath: "https://iryax.com/workspace",
    isLive: true
  }
];

// Hero Section
const HeroSection = () => (
  <section className="min-h-[60vh] flex flex-col items-center justify-center px-6 pt-20 md:pt-28 text-center relative">
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
        className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full shadow-md border border-blue-200/50"
      >
        <Package className="w-4 h-4 text-blue-600" />
        <span className="text-xs font-medium text-blue-800">✦ All Products</span>
      </motion.div>
      
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-gray-900 mb-4 font-calibri">
        All Products.
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
          One Bundle.
        </span>
      </h1>
      
      <p className="text-lg md:text-xl text-gray-600 font-light mb-8 max-w-2xl">
        Explore our complete suite of enterprise solutions—all in one place.
      </p>

      <Link
        to="/contact"
        className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-8 py-3 rounded-full text-sm md:text-base font-semibold hover:shadow-xl transition-all hover:scale-[1.02] flex items-center gap-2 group shadow-lg shadow-blue-200"
      >
        Contact Sales
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>

      <div className="flex items-center justify-center gap-3 mt-8">
        <div className="w-24 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-full"></div>
        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
        <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-full"></div>
      </div>
    </motion.div>
  </section>
);

// Product Bundle Card
const ProductBundleCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.7 }}
      className="w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 md:p-8">
        <div 
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `url(${patternSvg})` }}
        ></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Layers className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white font-calibri">
                Complete Product Bundle
              </h2>
              <p className="text-blue-100 text-sm">4 integrated solutions • One platform</p>
            </div>
          </div>
          <Link
            to="/contact"
            className="bg-white text-gray-900 px-6 py-2.5 rounded-full text-sm font-semibold hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
          >
            Get Bundle
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {productsData.map((product, index) => {
            const Icon = product.icon;
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className="group relative bg-gray-50 rounded-2xl p-5 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-transparent"
              >
                {/* Badge */}
                <div className="absolute top-3 right-3">
                  {product.isLive && (
                    <span className="bg-green-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <CheckCircle className="w-2.5 h-2.5" />
                      Live
                    </span>
                  )}
                </div>

                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${product.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-sm font-bold text-gray-900 mb-0.5">
                  {product.title}
                </h3>
                <p className="text-[8px] font-bold text-gray-400 tracking-[0.3em] uppercase mb-2">
                  {product.subtitle}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* Links */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <Link
                    to={product.routePath || "/contact"}
                    className="text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-0.5"
                  >
                    Learn More
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                  {product.viewMorePath && (
                    <a
                      href={product.viewMorePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-0.5 ml-auto group/link"
                    >
                      <Eye className="w-3 h-3 group-hover/link:scale-110 transition-transform" />
                      View
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-2xl border border-blue-100/50">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-600">Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-xs text-gray-600">Scalable Solutions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <span className="text-xs text-gray-600">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-gray-600">Integrated Platform</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 md:px-8 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {productsData.slice(0, 4).map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.id} className={`w-8 h-8 rounded-full bg-gradient-to-r ${p.gradient} flex items-center justify-center border-2 border-white`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400">4 Products</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-400">1 Platform</span>
        </div>
      </div>
    </motion.div>
  );
};

// Why Choose Us
const WhyChooseUs = () => (
  <section className="py-16 px-6 bg-gray-50">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold font-calibri">
          Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Us</span>
        </h2>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Shield, title: "Enterprise Security", desc: "Bank-level encryption and compliance standards" },
          { icon: TrendingUp, title: "Scalable Solutions", desc: "Grow your business with our flexible platform" },
          { icon: Users, title: "Dedicated Support", desc: "24/7 expert support for all your needs" }
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-4">
              <item.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// Future Section
const FutureSection = () => (
  <section className="py-16 px-6 bg-white">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full shadow-md border border-pink-200/50">
          <Sparkles className="w-3.5 h-3.5 text-pink-600" />
          <span className="text-xs font-medium text-pink-800">✦ The Future</span>
        </div>
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold font-calibri">
          From Systems to <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-orange-600">
            Intelligence
          </span>
        </h2>
        <div className="w-20 h-1 mx-auto mt-4 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full"></div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "AI-driven insights", icon: Sparkles, desc: "Turn raw data into actionable intelligence instantly.", gradient: "from-pink-500 to-rose-500" },
          { title: "Automated workflows", icon: Cpu, desc: "Self-optimizing systems that run your business on autopilot.", gradient: "from-purple-500 to-indigo-500" },
          { title: "Predictive decisions", icon: Radar, desc: "Anticipate market trends and operations before they happen.", gradient: "from-rose-500 to-orange-500" }
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.15, duration: 0.6 }}
            className="bg-white border border-gray-200 rounded-3xl p-10 flex flex-col items-center text-center hover:shadow-xl transition-all hover:-translate-y-2"
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br ${item.gradient} p-[2px] mb-6 shadow-lg`}>
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                <item.icon className="w-8 h-8 text-gray-700" />
              </div>
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-3 font-calibri">{item.title}</h4>
            <p className="text-gray-600 leading-relaxed font-light">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// CTA
const CTASection = () => (
  <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-12 text-center text-white">
    <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
    <p className="text-lg opacity-90 mb-6">Join thousands of businesses using our platform</p>
    <Link to="/contact" className="inline-block bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all hover:scale-105">
      Contact Us Today
    </Link>
  </div>
);

// Footer
const Footer = () => (
  <footer className="bg-gray-50 border-t border-gray-200 py-8 px-6">
    <div className="max-w-7xl mx-auto text-center text-gray-600 text-sm">
      <p>© {new Date().getFullYear()} Ingrain Systems. All rights reserved.</p>
    </div>
  </footer>
);

// Main Products Component
const Products = () => {
  return (
    <>
      <TimelyNavbar />
      <main className="bg-white text-gray-900 font-sans md:pt-[64px] no-scrollbar selection:bg-blue-500/30 overflow-x-hidden">
        
        {/* Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 50%), 
                              radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.03) 0%, transparent 50%),
                              radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.02) 0%, transparent 50%)` 
          }}></div>
        </div>

        {/* Hero */}
        <HeroSection />

        {/* Single Bundle Card */}
        <section className="relative z-10 px-6 max-w-6xl mx-auto w-full pb-8 md:pb-12">
          <ProductBundleCard />
        </section>

        {/* Why Choose Us */}
        <WhyChooseUs />

        {/* Future Section */}
        <FutureSection />

        {/* CTA & Footer */}
        <section className="bg-gradient-to-b from-white to-gray-50 pt-12 md:pt-20 pb-0">
          <div className="max-w-7xl mx-auto px-6 mb-12 md:mb-16">
            <CTASection />
          </div>
          <Footer />
        </section>

      </main>
      <TimelyFooter />
    </>
  );
};

export default Products;