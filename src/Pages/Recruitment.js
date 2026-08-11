import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  CheckCircle2, 
  ChevronRight,
  Search,
  FileText,
  Mail,
  Zap,
  Target,
  ArrowRight,
  TrendingUp,
  Settings,
  Star,
  ChevronDown,
  Layers,
  Globe,
  FileUp,
  Award,
  Smartphone,
  Plus,
  Sparkles,
  Wifi,
  Power,
  X,
  Check,
  Activity,
  Shield,
  Fingerprint,
  MapPin,
  Copy,
  Share2,
  Eye,
  Trash2,
  Edit2
} from 'lucide-react';
import { Link } from 'react-router-dom';
// import Footer from '../components/Footer';
// import r1 from '../img/rr-1.png';
// import r2 from '../img/rr-2.png';
// import r3 from '../img/rr-4.png';
// import r4 from '../img/rr-3.png';
import TimelyFooter from './TimelyFooter';
import TimelyNavbar from '../Components/TimelyNavbar';
// Kanban Board mock data
const initialColumns = [
  { id: 'new', title: 'Initial Qualification', count: 12 },
  { id: 'first', title: 'First Interview', count: 5 },
  { id: 'second', title: 'Second Interview', count: 2 },
  { id: 'offer', title: 'Contract Proposal', count: 1 },
];

const mockCandidates = [
  { id: 1, name: 'Alex Johnson', role: 'Senior Developer', status: 'new', rating: 4, source: 'LinkedIn' },
  { id: 2, name: 'Sarah Williams', role: 'Product Manager', status: 'first', rating: 5, source: 'Website' },
  { id: 3, name: 'Michael Chen', role: 'UX Designer', status: 'second', rating: 4, source: 'Referral' },
  { id: 4, name: 'Emma Davis', role: 'Marketing Lead', status: 'offer', rating: 5, source: 'Agency' },
];

const features = [
  {
    // image: r1,
    title: "Don't waste time typing",
    description: "Automatic data importing means less typing. When applicants apply online, their info is indexed automatically. Resumes and cover letters are attached to their card instantly.",
    color: "from-indigo-100 to-purple-100",
    border: "border-indigo-200",
    iconBg: "bg-indigo-500",
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    // image: r2,
    title: "Spend less time managing posts, more time hiring",
    description: "Easily publish and manage job postings while letting candidates choose interview slots that work best for them. Our seamless calendar integration keeps everything in sync and prevents double bookings.",
    color: "from-blue-100 to-cyan-100",
    border: "border-blue-200",
    iconBg: "bg-blue-500",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    // image: r3,
    title: "Smart applicant pipelines",
    description: "Automatically capture and organize all incoming applications while posting jobs. Set up custom stages with automated actions—send emails, screen candidates, and move applicants through the pipeline seamlessly without manual effort.",
    color: "from-emerald-100 to-teal-100",
    border: "border-emerald-200",
    iconBg: "bg-emerald-500",
    gradient: "from-emerald-500 to-teal-500"
  },
  {
    // image: r4,
    title: "Less scheduling, more interviewing",
    description: "Let candidates pick a time that suits them best while our calendar integration avoids double bookings. Evaluate applicants with built-in scoring, manage interviews seamlessly, and generate offer letters—all in one streamlined hiring flow.",
    color: "from-fuchsia-100 to-pink-100",
    border: "border-fuchsia-200",
    iconBg: "bg-fuchsia-500",
    gradient: "from-fuchsia-500 to-pink-500"
  }
];

const faqs = [
  {
    question: "What recruitment features are included in this application?",
    answer: "The application includes candidate tracking, job posting management, resume parsing, automated workflows, candidate communication, and recruitment analytics from one unified dashboard."
  },
  {
    question: "Can we schedule interviews through this application?",
    answer: "Yes, recruiters can schedule interviews directly from the platform with calendar integration, automated reminders, and candidate time-slot selection."
  },
  {
    question: "Can candidates apply and upload resumes online?",
    answer: "Yes, candidates can apply online and upload resumes directly through the recruitment portal. The system automatically stores and organizes applicant information."
  },
  {
    question: "Does the system support automated candidate tracking?",
    answer: "Yes, the platform automatically tracks candidates across different recruitment stages such as screening, interviews, shortlisting, and hiring."
  },
  {
    question: "Can we manage multiple job postings from one dashboard?",
    answer: "Absolutely. You can create, publish, and manage multiple job postings across different platforms from a single dashboard."
  },
  {
    question: "Does the application send interview reminders and notifications?",
    answer: "Yes, automated email notifications and interview reminders can be sent to candidates and recruiters."
  },
  {
    question: "Can recruiters search and filter candidates easily?",
    answer: "Yes, recruiters can quickly search, filter, and organize candidates based on skills, experience, status, and other criteria."
  },
  {
    question: "Does the platform provide recruitment reports and analytics?",
    answer: "Yes, the application provides detailed recruitment reports, hiring analytics, candidate pipeline tracking, and performance insights."
  }
];

const FAQItem = ({ faq, isOpen, onClick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border border-gray-200 bg-white rounded-2xl overflow-hidden mb-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <button 
        className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none group"
        onClick={onClick}
      >
        <span className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{faq.question}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-6 text-gray-600 font-light leading-relaxed">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const WorkforceShowcase = () => {
  const [activeTab, setActiveTab] = useState('applicants');

  const tabs = [
    { id: 'applicants', label: 'Job Applicants', gradient: 'from-indigo-500 to-purple-500' },
    { id: 'jobpost', label: 'Job Postings', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'parser', label: 'Resume Parser', gradient: 'from-emerald-500 to-teal-500' },
    { id: 'interviews', label: 'Interviews', gradient: 'from-rose-500 to-pink-500' },
    { id: 'scorecards', label: 'Scorecards', gradient: 'from-amber-500 to-orange-500' },
    { id: 'assessment', label: 'Assessment', gradient: 'from-fuchsia-500 to-purple-500' }
  ];

  const getLaptopContent = () => {
    switch (activeTab) {
      case 'applicants':
        return (
          <div className="h-full flex flex-col text-[10px] text-gray-600 font-sans p-1">
            <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 mb-2.5">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span className="font-semibold text-gray-900">Active Job Applicants</span>
              </div>
              <span className="bg-indigo-50 text-indigo-600 text-[8px] px-1.5 py-0.5 rounded-full border border-indigo-200 font-bold">5 ACTIVE APPLICANTS</span>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 flex-grow overflow-hidden flex flex-col justify-between">
              <div className="overflow-y-auto no-scrollbar max-h-[120px] w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 text-[7.5px] uppercase tracking-wider font-bold">
                      <th className="pb-1.5 pl-1">Name</th>
                      <th className="pb-1.5">Applied Role</th>
                      <th className="pb-1.5">Assessment Score</th>
                      <th className="pb-1.5">Status</th>
                      <th className="pb-1.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { name: "kardam nithin", role: "Senior Developer", score: "83 / 100", status: "Shortlisted", statusColor: "bg-amber-50 text-amber-600 border-amber-200" },
                      { name: "Saquiba Wasi", role: "React Dev", score: "94 / 100", status: "Screening", statusColor: "bg-blue-50 text-blue-600 border-blue-200" },
                      { name: "Mark Smith", role: "UI Architect", score: "92 / 100", status: "Interviewed", statusColor: "bg-rose-50 text-rose-600 border-rose-200" },
                      { name: "Jane Doe", role: "Lead PM", score: "89 / 100", status: "Pending", statusColor: "bg-gray-50 text-gray-500 border-gray-200" },
                      { name: "Alex Kumar", role: "Lead PM", score: "97 / 100", status: "Hired", statusColor: "bg-emerald-50 text-emerald-600 border-emerald-200" }
                    ].map((cand, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors text-[8px]">
                        <td className="py-2 pl-1 font-medium text-gray-900">{cand.name}</td>
                        <td className="py-2 text-gray-600">{cand.role}</td>
                        <td className="py-2 font-mono font-bold text-indigo-600">{cand.score}</td>
                        <td className="py-2">
                          <span className={`px-1 py-0.5 rounded text-[6.5px] font-bold border ${cand.statusColor}`}>{cand.status}</span>
                        </td>
                        <td className="py-2">
                          <div className="flex items-center justify-center gap-2">
                            <Eye className="w-3 h-3 text-gray-400 hover:text-gray-700 cursor-pointer transition-colors" />
                            <FileText className="w-3 h-3 text-gray-400 hover:text-blue-500 cursor-pointer transition-colors" />
                            <Award className="w-3 h-3 text-gray-400 hover:text-indigo-500 cursor-pointer transition-colors" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'jobpost':
        return (
          <div className="h-full flex flex-col text-[10px] text-gray-600 font-sans p-1">
            <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 mb-2.5">
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-semibold text-gray-900">Multi-Channel Job Postings</span>
              </div>
              <span className="bg-blue-50 text-blue-600 text-[8px] px-1.5 py-0.5 rounded-full border border-blue-200 font-bold">12 ACTIVE JOBS</span>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 flex-grow overflow-hidden flex flex-col justify-between">
              <div className="space-y-1.5 overflow-y-auto no-scrollbar max-h-[120px]">
                {[
                  { title: "Senior React Architect", type: "Full-Time", boards: "LinkedIn, Glassdoor, Indeed", status: "Active" },
                  { title: "UX/UI Lead Designer", type: "Full-Time", boards: "LinkedIn, Dribbble", status: "Active" },
                  { title: "HR Operations Manager", type: "Full-Time", boards: "Indeed", status: "Draft" }
                ].map((row, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-lg p-2 flex items-center justify-between text-[8px] hover:border-blue-300 transition-all">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-[9px]">{row.title}</h4>
                      <p className="text-gray-500 text-[7px]">{row.type} • Syndicated to: {row.boards}</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-2 border-r border-gray-200 pr-2 mr-0.5">
                        <Copy className="w-3 h-3 text-gray-400 hover:text-blue-500 cursor-pointer transition-colors" />
                        <Share2 className="w-3 h-3 text-gray-400 hover:text-indigo-500 cursor-pointer transition-colors" />
                        <Eye className="w-3 h-3 text-gray-400 hover:text-emerald-500 cursor-pointer transition-colors" />
                        <Edit2 className="w-3 h-3 text-gray-400 hover:text-amber-500 cursor-pointer transition-colors" />
                        <Trash2 className="w-3 h-3 text-gray-400 hover:text-rose-500 cursor-pointer transition-colors" />
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[7px] font-bold border ${
                        row.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                          : 'bg-gray-50 text-gray-500 border-gray-200'
                      }`}>{row.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-1.5 flex justify-end">
                <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-[8px] px-2.5 py-1 rounded transition-colors">Create New Post</button>
              </div>
            </div>
          </div>
        );
      case 'parser':
        return (
          <div className="h-full flex flex-col text-[10px] text-gray-600 font-sans p-1">
            <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 mb-2.5">
              <div className="flex items-center gap-1.5">
                <FileUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-semibold text-gray-900">AI Profile & Resume Parser</span>
              </div>
              <span className="bg-emerald-50 text-emerald-600 text-[8px] px-1.5 py-0.5 rounded-full border border-emerald-200 font-bold">96% FIT INDEX</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 flex-grow">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <h4 className="font-bold text-gray-900 text-[10px]">Saquiba Wasi</h4>
                      <p className="text-[7px] text-gray-500">Senior React Engineer • 5.4 Yrs Exp</p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-600 text-[8px] px-1.5 py-0.5 rounded font-bold border border-emerald-200">Gold Match</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[7px]">
                      <span>Extracted Core Skills:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {["React", "TailwindCSS", "Node.js", "System Design", "Webpack"].map((sk) => (
                        <span key={sk} className="bg-white border border-gray-200 rounded px-1 py-0.5 text-[6px] text-gray-600">{sk}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-1 flex items-center justify-between text-[7px] text-gray-400 font-mono">
                  <span>📄 PDF Document Ingested</span>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 flex flex-col justify-between overflow-hidden">
                <h4 className="font-semibold text-gray-900 mb-1 text-[8px] uppercase tracking-wider">Scanned Document Text Preview</h4>
                <div className="bg-white border border-gray-200 rounded p-1.5 flex-grow overflow-y-auto no-scrollbar font-mono text-[6px] text-gray-500 italic leading-relaxed">
                  "Senior Frontend Architect with extensive experience designing and deploying high-performance enterprise dashboards with React, Redux, and Framer Motion. Expert in modular web applications..."
                </div>
              </div>
            </div>
          </div>
        );
       case 'interviews':
        return (
          <div className="h-full flex flex-col text-[10px] text-gray-600 font-sans p-1">
            <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 mb-2.5">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span className="font-semibold text-gray-900">Interactive Interview Calendar</span>
              </div>
              <span className="bg-rose-50 text-rose-600 text-[8px] px-1.5 py-0.5 rounded-full border border-rose-200 font-bold">2 TODAY</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 flex-grow overflow-hidden">
              <div className="bg-gray-50 border border-rose-200 rounded-xl p-2.5 flex flex-col justify-between overflow-y-auto no-scrollbar max-h-[140px]">
                <div>
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <h4 className="font-bold text-gray-900 text-[9px]">kardam nithin</h4>
                      <p className="text-[7px] text-gray-500">Interview Invitation - Timely Health</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-[7px] text-gray-500">
                    <p className="font-mono text-[7px] text-rose-600">📅 30-05-2026 10:00 (Scheduled)</p>
                    <p className="leading-tight mt-1 text-[6.5px]">📍 TH, Corporate. - Falt No: 301, 3rd Floor, Sri Sai Balaji A</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-1.5 mt-1.5">
                  <div className="flex justify-between items-center text-[7px] text-gray-500">
                    <span>Interview Stage:</span>
                    <span className="bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded font-bold border border-rose-200">Technical Round</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 space-y-1.5 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 text-[8px] uppercase tracking-wider mb-1">Interview Assessment</h4>
                  <div className="space-y-1 text-[7px]">
                    <div className="flex justify-between border-b border-gray-200 pb-0.5">
                      <span>Appearance (10)</span>
                      <span className="text-rose-600 font-bold">9 / 10</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-0.5">
                      <span>Knowledge (10)</span>
                      <span className="text-rose-600 font-bold">9 / 10</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-0.5">
                      <span>Score (100)</span>
                      <span className="text-rose-600 font-bold">92 / 100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rating (10)</span>
                      <span className="text-rose-600 font-bold">9.2 / 10</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[7px] border-t border-gray-200 pt-1.5">
                  <span>Status:</span>
                  <span className="bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded font-bold border border-rose-200">Scheduled</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'scorecards':
        return (
          <div className="h-full flex flex-col text-[10px] text-gray-600 font-sans p-1">
            <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 mb-2.5">
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold text-gray-900">Unified Candidate Scorecards</span>
              </div>
              <span className="bg-amber-50 text-amber-600 text-[8px] px-1.5 py-0.5 rounded-full border border-amber-200 font-bold">9.2 RATING</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 flex-grow">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 space-y-1.5 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 text-[8px] uppercase tracking-wider mb-1">Mark Smith Evaluation</h4>
                  <div className="space-y-1 text-[7px]">
                    <div className="flex justify-between border-b border-gray-200 pb-0.5">
                      <span>Appearance (10)</span>
                      <span className="text-amber-600 font-bold">9 / 10</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-0.5">
                      <span>Knowledge (10)</span>
                      <span className="text-amber-600 font-bold">9 / 10</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-0.5">
                      <span>Score (100)</span>
                      <span className="text-amber-600 font-bold">92 / 100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rating (10)</span>
                      <span className="text-amber-600 font-bold">9.2 / 10</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[7px] border-t border-gray-200 pt-1.5">
                  <span>Status:</span>
                  <span className="bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold border border-amber-200">Shortlisted</span>
                </div>
              </div>

              <div className="bg-gray-50 border border-amber-200 rounded-xl p-2.5 flex flex-col justify-between overflow-hidden">
                <h4 className="font-semibold text-gray-900 mb-1 text-[8px] uppercase tracking-wider">Recruiter Feedback</h4>
                <p className="text-[7px] text-gray-600 italic leading-relaxed">"Extremely solid knowledge of system design. Recommending immediate offer proposal."</p>
                <div className="border-t border-gray-200 pt-1 mt-1 text-[6px] text-amber-600 text-right">
                  - Saidulu R. (Admin)
                </div>
              </div>
            </div>
          </div>
        );
      case 'assessment':
        return (
          <div className="h-full flex flex-col bg-white text-gray-800 rounded-xl p-2.5 font-sans border border-gray-200 select-none overflow-y-auto no-scrollbar">
            {/* Header Panel */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
              <div className="flex items-center">
                <span className="bg-rose-50 border border-rose-200 text-rose-600 rounded px-1.5 py-0.5 font-bold text-[7px] leading-none">Q3</span>
                <span className="text-gray-900 text-[8.5px] font-semibold ml-1.5">A patient is scared of needle pricks. How do you handle this?</span>
              </div>
              <span className="text-rose-600 text-[7px] font-bold tracking-wider shrink-0">✗ INCORRECT</span>
            </div>

            {/* Multiple Choice Cards list */}
            <div className="space-y-1.5">
              {/* Option A (Correct, not selected) */}
              <div className="bg-white border border-emerald-500 rounded-lg p-1.5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="bg-gray-50 border border-gray-200 text-gray-500 rounded px-1.5 py-0.5 text-[6.5px] font-bold">A</span>
                  <div className="w-3 h-3 rounded-full border border-emerald-500 flex items-center justify-center bg-white">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  </div>
                  <span className="text-emerald-700 font-bold text-[7px]">Calmly explain & reassure</span>
                </div>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-1.5 py-0.5 text-[5.5px] font-bold uppercase tracking-wider">✓ CORRECT ANSWER</span>
              </div>

              {/* Option B (Unselected) */}
              <div className="bg-white border border-gray-200 rounded-lg p-1.5 flex items-center shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="bg-gray-50 border border-gray-200 text-gray-500 rounded px-1.5 py-0.5 text-[6.5px] font-bold">B</span>
                  <div className="w-3 h-3 rounded-full border border-gray-300 bg-white"></div>
                  <span className="text-gray-600 font-medium text-[7px]">Ask them to relax</span>
                </div>
              </div>

              {/* Option C (Selected Incorrectly) */}
              <div className="bg-rose-50 border border-rose-300 rounded-lg p-1.5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="bg-gray-50 border border-gray-200 text-gray-500 rounded px-1.5 py-0.5 text-[6.5px] font-bold">C</span>
                  <div className="w-3 h-3 rounded-full border border-rose-500 flex items-center justify-center bg-white">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                  </div>
                  <span className="text-rose-700 font-bold text-[7px]">Proceed quickly</span>
                </div>
                <span className="bg-rose-50 text-rose-700 border border-rose-200 rounded px-1.5 py-0.5 text-[5.5px] font-bold uppercase tracking-wider">✗ SELECTED INCORRECTLY</span>
              </div>

              {/* Option D (Unselected) */}
              <div className="bg-white border border-gray-200 rounded-lg p-1.5 flex items-center shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="bg-gray-50 border border-gray-200 text-gray-500 rounded px-1.5 py-0.5 text-[6.5px] font-bold">D</span>
                  <div className="w-3 h-3 rounded-full border border-gray-300 bg-white"></div>
                  <span className="text-gray-600 font-medium text-[7px]">Joke about it</span>
                </div>
              </div>

              {/* Option E (Unselected) */}
              <div className="bg-white border border-gray-200 rounded-lg p-1.5 flex items-center shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="bg-gray-50 border border-gray-200 text-gray-500 rounded px-1.5 py-0.5 text-[6.5px] font-bold">E</span>
                  <div className="w-3 h-3 rounded-full border border-gray-300 bg-white"></div>
                  <span className="text-gray-600 font-medium text-[7px]">Ignore fear</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getPhoneContent = () => {
    switch (activeTab) {
      case 'applicants':
        return (
          <div className="h-full flex flex-col justify-between font-sans text-[9px] text-gray-600 p-0.5">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-gray-900 text-[10px]">Job Applicants</span>
                <Users className="w-3 h-3 text-indigo-500 cursor-pointer" />
              </div>
              
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-2 text-center mb-2">
                <p className="text-[6.5px] text-indigo-600 uppercase tracking-widest font-bold">TOTAL APPLICANTS</p>
                <p className="text-base font-bold text-indigo-600 mt-0.5">5 Active</p>
              </div>

              <div className="space-y-1.5 max-h-[90px] overflow-y-auto no-scrollbar">
                {[
                  { name: "kardam nithin", score: "83/100" },
                  { name: "Saquiba Wasi", score: "94/100" },
                  { name: "Mark Smith", score: "92/100" }
                ].map((cand, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 rounded-lg p-1.5 border border-gray-200 text-[7.5px]">
                    <span className="text-gray-900 font-medium truncate max-w-[65px]">{cand.name}</span>
                    <span className="text-indigo-600 font-bold font-mono">{cand.score}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-1.5 rounded-xl text-[8.5px] mt-1 transition-colors leading-none shadow-lg shadow-indigo-200">
              View All Registry
            </button>
          </div>
        );
      case 'jobpost':
        return (
          <div className="h-full flex flex-col justify-between font-sans text-[9px] text-gray-600 p-0.5">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-gray-900 text-[10px]">Job Postings</span>
                <Globe className="w-3 h-3 text-blue-500" />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-2 text-center mb-2">
                <p className="text-[7px] text-blue-600 uppercase tracking-wider font-bold">ACTIVE LISTINGS</p>
                <p className="text-[10px] font-bold text-gray-900 mt-0.5">12 Live Jobs</p>
                <p className="text-[7px] text-gray-500 mt-0.5">3 Drafts</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-1.5 text-center text-[7px]">
                <p className="text-gray-500">All feeds active. Syndicated to LinkedIn, Glassdoor, and Indeed.</p>
              </div>
            </div>
            
            <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-1.5 rounded-xl text-[9px] mt-1 transition-colors shadow-lg shadow-blue-200">
              Publish New Job
            </button>
          </div>
        );
      case 'parser':
        return (
          <div className="h-full flex flex-col justify-between font-sans text-[9px] text-gray-600 p-0.5">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-gray-900 text-[10px]">Parser Live</span>
                <Smartphone className="w-3 h-3 text-emerald-500" />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 text-center mb-2">
                <p className="text-[7px] text-emerald-600 uppercase tracking-widest">INGEST STATUS</p>
                <p className="text-lg font-bold text-emerald-600 mt-0.5">SUCCESS</p>
                <p className="text-[6px] text-emerald-600 font-semibold mt-0.5">SAQUIBA WASI</p>
              </div>

              <div className="space-y-1 text-[8px] font-mono bg-gray-50 rounded-xl p-1.5 border border-gray-200">
                <div className="flex justify-between">
                  <span>Match index</span>
                  <span className="text-emerald-600">96%</span>
                </div>
                <div className="flex justify-between">
                  <span>Extract Skills</span>
                  <span className="text-gray-900">Yes</span>
                </div>
              </div>
            </div>
            
            <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-1.5 rounded-xl text-[9px] mt-1 transition-colors shadow-lg shadow-emerald-200">
              Approve Profile
            </button>
          </div>
        );
      case 'interviews':
        return (
          <div className="h-full flex flex-col justify-between font-sans text-[9px] text-gray-600 p-0.5">
            <div>
              <div className="flex justify-between items-center mb-1.5 border-b border-gray-200 pb-1">
                <span className="font-bold text-gray-900 text-[10px]">Interviews</span>
                <Calendar className="w-3 h-3 text-rose-500" />
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-xl p-1.5 text-center mb-1.5">
                <p className="text-[6px] text-rose-600 uppercase tracking-widest">NEXT SESSION</p>
                <p className="text-[9px] font-bold text-gray-900 mt-0.5">kardam nithin</p>
                <p className="text-[6px] text-rose-600 mt-0.5 flex items-center justify-center gap-0.5 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span> 10:00 AM Start
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-1.5 text-center text-[6px] mb-1.5">
                <p className="text-gray-600 truncate">📍 TH, Corporate. - Falt No: 301, 3rd Floor, Sri Sai Balaji A</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-1.5 space-y-0.5 text-[6.5px]">
                <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-0.5">
                  <span>Appearance (10)</span>
                  <span className="text-rose-600 font-bold">9</span>
                </div>
                <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-0.5">
                  <span>Knowledge (10)</span>
                  <span className="text-rose-600 font-bold">9</span>
                </div>
                <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-0.5">
                  <span>Score (100)</span>
                  <span className="text-rose-600 font-bold">92</span>
                </div>
                <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-0.5">
                  <span>Rating (10)</span>
                  <span className="text-rose-600 font-bold">9.2</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Status:</span>
                  <span className="text-rose-600 font-bold">Scheduled</span>
                </div>
              </div>
            </div>
            
            <button className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-1.5 rounded-xl text-[9px] mt-1 transition-colors flex items-center justify-center gap-0.5 shadow-lg shadow-rose-200">
              <Power className="w-2.5 h-2.5" /> Available For Interview
            </button>
          </div>
        );
      case 'scorecards':
        return (
          <div className="h-full flex flex-col justify-between font-sans text-[9px] text-gray-600 p-0.5">
            <div>
              <div className="flex justify-between items-center mb-1.5 border-b border-gray-200 pb-1">
                <span className="font-bold text-gray-900 text-[10px]">Evaluation</span>
                <Award className="w-3 h-3 text-amber-500" />
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-1.5 text-center mb-1.5 border border-amber-200">
                <p className="text-[8px] font-bold text-gray-900 leading-none">Mark Smith</p>
                <div className="flex gap-0.5 mt-1 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-2 h-2 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-1.5 space-y-0.5 text-[6.5px]">
                <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-0.5">
                  <span>Appearance (10)</span>
                  <span className="text-amber-600 font-bold">9</span>
                </div>
                <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-0.5">
                  <span>Knowledge (10)</span>
                  <span className="text-amber-600 font-bold">9</span>
                </div>
                <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-0.5">
                  <span>Score (100)</span>
                  <span className="text-amber-600 font-bold">92</span>
                </div>
                <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-0.5">
                  <span>Rating (10)</span>
                  <span className="text-amber-600 font-bold">9.2</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Status:</span>
                  <span className="text-amber-600 font-bold">Shortlisted</span>
                </div>
              </div>
            </div>
            
            <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-1.5 rounded-xl text-[9px] mt-1 transition-colors shadow-lg shadow-amber-200">
              Submit Review
            </button>
          </div>
        );
      case 'assessment':
        return (
          <div className="h-full flex flex-col justify-between bg-white text-gray-800 rounded-2xl p-2 font-sans border border-gray-200 select-none overflow-y-auto no-scrollbar">
            <div>
              {/* Header Panel */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 mb-1.5">
                <div className="flex items-center">
                  <span className="bg-rose-50 border border-rose-200 text-rose-600 rounded px-1 py-0.5 font-bold text-[6.5px] leading-none">Q3</span>
                  <span className="text-gray-900 text-[7.5px] font-semibold ml-1">patient needle scared...</span>
                </div>
                <span className="text-rose-600 text-[6.5px] font-bold shrink-0">✗ INCORRECT</span>
              </div>

              {/* Option A (Correct, not selected) */}
              <div className="bg-white border border-emerald-500 rounded-lg p-1 mb-1 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="bg-gray-50 border border-gray-200 text-gray-500 rounded px-1.5 py-0.5 text-[6px] font-bold">A</span>
                  <div className="w-2.5 h-2.5 rounded-full border border-emerald-500 flex items-center justify-center bg-white">
                    <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                  </div>
                  <span className="text-emerald-700 font-bold text-[6.5px]">Calmly explain & reassure</span>
                </div>
              </div>

              {/* Option C (Selected Incorrectly) */}
              <div className="bg-rose-50 border border-rose-300 rounded-lg p-1 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="bg-gray-50 border border-gray-200 text-gray-500 rounded px-1.5 py-0.5 text-[6px] font-bold">C</span>
                  <div className="w-2.5 h-2.5 rounded-full border border-rose-500 flex items-center justify-center bg-white">
                    <div className="w-1 h-1 rounded-full bg-rose-500"></div>
                  </div>
                  <span className="text-rose-700 font-bold text-[6.5px]">Proceed quickly</span>
                </div>
              </div>
            </div>
            
            <button className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-1 rounded-xl text-[7.5px] mt-1 transition-colors leading-none shadow-lg shadow-rose-200">
              Next Question
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="px-6 max-w-[1200px] mx-auto mb-32 z-20 relative pt-20 border-t border-gray-200">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-2 mb-6 border border-blue-200"
        >
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-700 font-medium">Modular Recruitment Command</span>
        </motion.div>
        
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">
          Everything, Integrated.
        </h2>
        <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
          Manage job listings, parsed applicant profiles, calendar invite timeslots, feedback scorecards, and clinical assessment evaluations in one unified screen.
        </p>
      </div>

      <div className="relative w-full max-w-[720px] mx-auto mb-16 px-6 pt-10">
        <div className="absolute inset-10 bg-gradient-to-tr from-blue-100 via-indigo-100 to-purple-100 rounded-full blur-[80px] opacity-60 pointer-events-none -z-10"></div>
        
        <motion.div 
          key={`laptop-${activeTab}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto w-full max-w-[580px] aspect-[16/10] bg-white rounded-t-[1.25rem] border-[8px] border-gray-200 shadow-2xl flex flex-col overflow-hidden z-10"
        >
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gray-400 z-30"></div>
          
          <div className="flex-grow bg-white p-4 text-left select-none overflow-y-auto no-scrollbar pt-5 border border-gray-100 flex flex-col justify-between">
            {getLaptopContent()}
          </div>
          
          <div className="relative w-[110%] left-[-5%] h-[10px] bg-gray-300 rounded-b-xl border-t border-gray-300 shadow-xl z-20"></div>
        </motion.div>

        <motion.div 
          key={`phone-${activeTab}`}
          initial={{ opacity: 0, scale: 0.95, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="absolute right-[-10px] md:right-[-25px] bottom-[-25px] w-[130px] md:w-[165px] aspect-[9/19] bg-white rounded-[1.8rem] border-[5px] border-gray-300 shadow-2xl overflow-hidden flex flex-col z-20"
        >
          <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-12 h-3 bg-gray-200 rounded-full z-40 flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-gray-400"></span>
          </div>
          
          <div className="flex-grow bg-white p-3 text-left overflow-y-auto no-scrollbar pt-6 select-none border border-gray-100">
            {getPhoneContent()}
          </div>
        </motion.div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-4xl mx-auto pt-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 shadow-md ${
                isActive
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                  : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </section>
  );
};

const Recruitment = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  return (
    <>
      <TimelyNavbar />
      <div className="bg-white min-h-screen font-sans text-gray-900 pt-[52px] relative overflow-hidden">
     
      {/* Background Effects - Light */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 50%), 
                            radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.03) 0%, transparent 50%)` 
        }}></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
      </div>

      <div className="relative z-10">
        <main className="pb-32">
          
          {/* HERO SECTION */}
          <section className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center relative py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-5xl mx-auto"
            >
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200/50 mb-8"
              >
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">Applicant Tracking System</span>
              </motion.div>
              
              <h1 className="text-[2.5rem] md:text-[4.2rem] lg:text-[5.2rem] font-bold tracking-tight leading-[1.1] text-gray-900 mb-6">
                Recruitment.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">Reimagined.</span>
              </h1>

              <p className="text-lg md:text-2xl text-gray-600 font-light max-w-3xl mx-auto mb-10 leading-relaxed">
                Source and hire the best talents with an agile, AI-powered pipeline. Streamline everything from job postings to contract signatures on one unified platform.
              </p>

              <div className="flex items-center justify-center gap-3">
                <div className="w-24 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-full"></div>
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-full"></div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full px-4 sm:px-0 mt-8">
                <Link to="/contact" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2 group shadow-lg shadow-blue-200">
                  Book Demo
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/price" className="w-full sm:w-auto bg-white text-gray-700 border-2 border-gray-200 px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-lg hover:scale-105 text-center">
                  Start for Free
                </Link>
              </div>
            </motion.div>
          </section>

          {/* KANBAN VISUALIZATION SECTION */}
          <section className="px-6 max-w-[1400px] mx-auto mb-20 relative z-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-gray-900">Visualize the Pipeline</h2>
              <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">Keep applicants organized. Drag and drop candidates across stages, or let automated actions move them for you.</p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border border-gray-200 shadow-2xl shadow-indigo-100 overflow-hidden"
            >
              <div className="flex overflow-x-auto gap-6 pb-6 snap-x no-scrollbar">
                {initialColumns.map((col, index) => (
                  <div key={col.id} className="min-w-[300px] md:min-w-[320px] flex-shrink-0 snap-start">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h3 className="font-semibold text-lg text-gray-900">{col.title}</h3>
                      <span className="bg-gray-100 text-xs px-2.5 py-1 rounded-full text-gray-600 font-medium">{col.count}</span>
                    </div>
                    
                    <div className="space-y-4">
                      {mockCandidates.filter(c => c.status === col.id).map((candidate, idx) => (
                        <motion.div 
                          key={candidate.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: (index * 0.1) + (idx * 0.1) }}
                          whileHover={{ y: -4, scale: 1.02 }}
                          className="bg-white border border-gray-200 rounded-2xl p-5 cursor-pointer hover:border-indigo-300 hover:shadow-lg transition-all shadow-md"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-medium text-gray-900">{candidate.name}</h4>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < candidate.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{candidate.role}</p>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {candidate.source}</span>
                            <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">2 days ago</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* ALTERNATING FEATURES SECTION */}
          <section className="px-6 max-w-[1200px] mx-auto mb-40 relative z-20">
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter text-gray-900 mb-24 w-full text-center">
              All the features done right.
            </h2>
            
            <div className="flex flex-col gap-32">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                  className={`flex flex-col md:flex-row items-center gap-16 ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* IMAGE SIDE */}
                  <div className="flex-1 w-full relative group">
                    <div className={`absolute -inset-4 bg-gradient-to-r ${feature.color} rounded-[3rem] blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-700`}></div>
                    <div className="relative rounded-3xl overflow-hidden border border-gray-200 shadow-2xl bg-white p-4">
                      <img 
                        src={feature.image} 
                        alt={feature.title} 
                        className="w-full h-auto object-cover rounded-xl"
                      />
                    </div>
                  </div>

                  {/* TEXT SIDE */}
                  <div className="flex-1 w-full text-center md:text-left">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${feature.color} border ${feature.border} mb-6`}>
                      <span className="text-sm text-gray-700 font-medium">Feature {idx + 1}</span>
                    </div>
                    <h3 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-lg md:text-xl leading-relaxed font-light">
                      {feature.description}
                    </p>
                    <div className="mt-8">
                      <div className={`h-1 w-16 bg-gradient-to-r ${feature.gradient} rounded-full mx-auto md:mx-0`}></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* WORKFORCE SHOWCASE SECTION */}
          <WorkforceShowcase />

          {/* FAQ SECTION */}
          <section className="px-6 max-w-[900px] mx-auto mb-32 z-20 relative">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-gray-900">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">Everything you need to know about the recruitment ecosystem.</p>
            </div>
            
            <div className="flex flex-col">
              {faqs.map((faq, idx) => (
                <FAQItem 
                  key={idx} 
                  faq={faq} 
                  isOpen={activeFaq === idx} 
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)} 
                />
              ))}
            </div>
          </section>

          {/* INTEGRATION SHOWCASE */}
          <section className="px-6 max-w-[1200px] mx-auto mb-32 z-20 relative">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full bg-white rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row items-center gap-16 border border-gray-200 relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-100 via-purple-100 to-indigo-100 rounded-full blur-[120px] pointer-events-none group-hover:opacity-80 transition-all duration-1000"></div>
              
              <div className="flex-1 relative z-10 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200/50 mb-6">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700 font-medium">Reporting & Onboarding</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                  You're hired! <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">Now what?</span>
                </h2>
                <p className="text-xl text-gray-600 font-light leading-relaxed mb-8">
                  Turn a candidate into an employee with a single click. Launch their onboarding process, assign equipment, and set up payroll instantly because everything is connected.
                </p>
                <ul className="space-y-4 text-left inline-block">
                  <li className="flex items-center gap-3 text-gray-700"><CheckCircle2 className="w-5 h-5 text-indigo-500" /> Seamless transition to HR module</li>
                  <li className="flex items-center gap-3 text-gray-700"><CheckCircle2 className="w-5 h-5 text-indigo-500" /> Deep reporting & analytics</li>
                  <li className="flex items-center gap-3 text-gray-700"><CheckCircle2 className="w-5 h-5 text-indigo-500" /> Fleet and asset assignment</li>
                </ul>
              </div>
              
              <div className="flex-1 relative z-10 w-full">
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-[2rem] p-6 md:p-8 shadow-2xl relative">
                   <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">SD</div>
                          <div>
                            <p className="text-gray-900 font-medium">Sarah Davis</p>
                            <p className="text-xs text-gray-500">Offer Accepted</p>
                          </div>
                        </div>
                        <span className="bg-emerald-50 text-emerald-600 text-xs px-3 py-1 rounded-full border border-emerald-200">Hired</span>
                      </div>
                      <div className="space-y-3 mt-2">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all">
                          <Users className="w-5 h-5 text-blue-500" />
                          <div className="flex-1">
                            <div className="h-2 w-3/4 bg-gray-200 rounded-full mb-2"></div>
                            <div className="h-2 w-1/2 bg-gray-200 rounded-full"></div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-purple-300 transition-all">
                          <Settings className="w-5 h-5 text-purple-500" />
                          <div className="flex-1">
                            <div className="h-2 w-2/3 bg-gray-200 rounded-full mb-2"></div>
                            <div className="h-2 w-1/3 bg-gray-200 rounded-full"></div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* FINAL CTA SECTION */}
          <section className="px-6 max-w-[1200px] mx-auto z-20 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-[3rem] p-12 md:p-24 text-center border border-gray-200 relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-r from-blue-200/30 via-purple-200/30 to-indigo-200/30 rounded-full blur-[120px] pointer-events-none group-hover:opacity-80 transition-all duration-1000"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-8 leading-tight">
                  Ready to build your <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">dream team?</span>
                </h2>
                
                <p className="text-xl text-gray-600 font-light mb-10 max-w-2xl">
                  Join millions of users who are already streamlining their recruitment processes.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 mt-2 justify-center items-center w-full">
                  <Link to="/contact" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-10 py-5 rounded-full text-xl font-semibold hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2 group/btn shadow-lg shadow-blue-200">
                    Start Hiring Now
                    <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/price" className="w-full sm:w-auto bg-white text-gray-700 border-2 border-gray-200 px-10 py-5 rounded-full text-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-lg hover:scale-105 flex items-center justify-center">
                    Meet an Advisor
                  </Link>
                </div>
              </div>
            </motion.div>
          </section>

        </main>
      </div>
          <TimelyFooter />
    </div>
    </>
  );
};

export default Recruitment;