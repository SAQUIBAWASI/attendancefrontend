import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import logo from "../Images/company-stamp-1780465131172.png";
import New from "../Images/Timelyhealth logo.png";
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaFileAlt, FaSpinner, FaEye, FaDownload, FaPrint,
  FaCheckCircle, FaTimesCircle, FaClock, FaCalendarAlt,
  FaUser, FaBuilding, FaEnvelope, FaArrowLeft
} from 'react-icons/fa';
import { FiFileText, FiCalendar, FiSend, FiInbox } from 'react-icons/fi';
import { API_BASE_URL } from '../config';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import "../index.css";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

const RelievingLetters = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [letters, setLetters] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [employeeData, setEmployeeData]   = useState(null);
  const [employeeId, setEmployeeId]       = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [letterType, setLetterType] = useState('relieving');

  const letterRef = useRef(null);
  const navigate  = useNavigate();

  // ── Auth / load ──────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const storedEmployee = localStorage.getItem('employeeData');
      if (storedEmployee) {
        const empData = JSON.parse(storedEmployee);
        setEmployeeData(empData);
        const empId = empData.employeeId || empData._id || '';
        setEmployeeId(empId);
        if (empId) {
          setIsAuthenticated(true);
          fetchEmployeeLetters(empId, letterType);
        } else {
          setError('Employee ID not found. Please contact HR.');
          setLoading(false);
        }
      } else {
        const empId    = localStorage.getItem('employeeId');
        const empName  = localStorage.getItem('employeeName');
        const empEmail = localStorage.getItem('employeeEmail');
        if (empId) {
          setEmployeeId(empId);
          setEmployeeData({ employeeId: empId, name: empName, email: empEmail });
          setIsAuthenticated(true);
          fetchEmployeeLetters(empId, letterType);
        } else {
          setError('Please login to view your letters.');
          setLoading(false);
          setTimeout(() => navigate('/login'), 3000);
        }
      }
    } catch (err) {
      console.error('Error getting employee data:', err);
      setError('Failed to load employee data. Please login again.');
      setLoading(false);
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [navigate]);

  useEffect(() => {
    if (employeeId && isAuthenticated) fetchEmployeeLetters(employeeId, letterType);
  }, [letterType]);

  // ── API ───────────────────────────────────────────────────────────────────
  const fetchEmployeeLetters = async (empId, type) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/employees/admin-letters/${empId}`);
      if (response.data.success) {
        const filtered = response.data.data.filter(
          l => l.letterType === type && l.status === 'sent'
        );
        setLetters(filtered);
        if (filtered.length === 0) setError(`No ${type} letters found for your account.`);
      } else {
        setError('Failed to fetch your letters. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching letters:', err);
      setError(err.response?.status === 404
        ? `No ${type} letters found for your account.`
        : 'Failed to fetch your letters. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleViewLetter = (letter) => {
    setSelectedLetter(letter);
    setShowLetterModal(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setShowLetterModal(false);
    setSelectedLetter(null);
    document.body.style.overflow = 'auto';
  };

  const handleDownloadPDF = async () => {
    if (!letterRef.current) return;
    try {
      const canvas = await html2canvas(letterRef.current, {
        scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff'
      });
      const imgData  = canvas.toDataURL('image/png');
      const pdf      = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, (canvas.height * pdfWidth) / canvas.width);
      pdf.save(`${letterType}-letter-${selectedLetter?.employeeName?.replace(/\s/g, '-') || 'employee'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handlePrint = () => window.print();

  // ── Address helper ────────────────────────────────────────────────────────
  const getEmpAddress = (rawContent) => {
    if (rawContent?.employeeLocation?.trim()) return rawContent.employeeLocation.trim();
    if (employeeData?.address?.trim())        return employeeData.address.trim();
    const parts = [employeeData?.addressLine1, employeeData?.city, employeeData?.state, employeeData?.pinCode]
      .filter(p => p && String(p).trim());
    if (parts.length) return parts.join(', ');
    if (employeeData?.city?.trim())           return employeeData.city.trim();
    return 'Hyderabad';
  };

  // ── Company name cleaner ──────────────────────────────────────────────────
  const cleanCompanyName = (name) => {
    if (!name) return 'Timely Healthtech Private Limited';
    const t = name.trim();
    const aliases = ['Timely Health Tech Pvt Ltd.', 'Timely Health Tech Pvt. Ltd.', 'Timely Healthtech Private Limited.', 'Timely Health Tech Pvt Ltd', 'Timely Health Tech Pvt. Ltd'];
    return aliases.includes(t) ? 'Timely Healthtech Private Limited' : t;
  };

  const cleanBodyText = (text) => {
    if (!text) return '';
    return text
      .replace(/Timely Health Tech Pvt\.? Ltd\.?/g, 'Timely Healthtech Private Limited')
      .replace(/Timely Healthtech Private Limited\./g, 'Timely Healthtech Private Limited');
  };

  // ── Experience Letter Template ────────────────────────────────────────────
  const ExperienceLetterTemplate = ({ data }) => {
    const raw     = data?.content || data;
    const content = { ...raw, companyName: cleanCompanyName(raw.companyName), experienceBody: cleanBodyText(raw.experienceBody), relievingBody: cleanBodyText(raw.relievingBody), employeeLocation: getEmpAddress(raw) };
    const empId   = content.employeeId || data?.employeeId || '';
    const gender  = (content.gender || 'male').toLowerCase();
    const pronoun = gender === 'male' ? 'he' : 'she';
    const pronounCap  = gender === 'male' ? 'He' : 'She';
    const possessive  = gender === 'male' ? 'his' : 'her';
    const salutation  = gender === 'male' ? 'Mr.' : 'Ms.';
    return (
      <div ref={letterRef} className="relative bg-white p-10 rounded-lg shadow-lg max-w-4xl mx-auto overflow-hidden flex flex-col" style={{ fontFamily: 'Times New Roman, serif', lineHeight: '1.6', minHeight: '1056px' }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.1, zIndex: 0 }}>
          <img src={New} alt="Watermark" className="w-[300px] h-auto object-contain select-none" />
        </div>
        <div className="flex justify-end items-start border-b-2 border-gray-300 pb-4 mb-6">
          <img src={New} alt="Company Logo" className="h-12" />
        </div>
        <div className="mb-6">
          <p className="font-bold text-xl text-gray-800 tracking-wide text-center uppercase">Experience Letter</p>
        </div>
        <div className="text-right mb-6">
          <p className="text-sm text-gray-700">Date: <span className="font-semibold">{content.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span></p>
          <p className="text-sm text-gray-700">Place: <span className="font-semibold">Hyderabad</span></p>
        </div>
        <div className="mb-6">
          <p className="text-gray-700 mb-3">To,</p>
          <div className="ml-4">
            <p className="font-semibold text-gray-800">{salutation} {content.employeeName || data?.employeeName || 'Employee'}</p>
            <p className="text-gray-700">EMP ID: {empId}</p>
            <p className="text-gray-700">{content.designation || ''}</p>
            <p className="text-gray-700">{content.companyName}</p>
            <p className="text-gray-700">Address: {content.employeeLocation}</p>
          </div>
        </div>
        <div className="mb-6">
          <p className="font-bold text-xl text-gray-800 tracking-wide text-center">TO WHOM IT MAY CONCERN</p>
        </div>
        <div className="mb-6 text-justify">
          <p className="mb-4 text-gray-700">
            This is to certify that <span className="font-semibold">{salutation} {content.employeeName || 'Employee'}</span> (Employee ID: <span className="font-semibold">{empId}</span>) was employed with <span className="font-semibold">{content.companyName}</span> as a <span className="font-semibold">{content.designation || ''}</span> from <span className="font-semibold">{content.joiningDate || ''}</span> to <span className="font-semibold">{content.relievingDate || ''}</span>.
          </p>
          <p className="mb-4 text-gray-700 whitespace-pre-line">
            {content.experienceBody || `During ${possessive} tenure with us, ${salutation} ${content.employeeName || 'Employee'} was a valuable member of our ${content.department || 'Full Stack Development'} team.`}
          </p>
          <p className="mb-4 text-gray-700">
            <span className="font-semibold">{salutation} {content.employeeName || 'Employee'}</span> is a dedicated professional who maintains a positive attitude and works well in a team environment. {pronounCap} is leaving the company of {possessive} own accord to pursue other career opportunities.
          </p>
          <p className="mb-4 text-gray-700">
            We thank {pronoun} for {possessive} contributions to the organization and wish {pronoun} every success in {possessive} future professional and personal endeavors.
          </p>
        </div>
        <div className="mt-10">
          <div className="flex justify-between items-start gap-8">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">Employee Signature:</p>
              <div className="border-b border-gray-400 w-48 h-8"></div>
            </div>
            <div className="flex-1 text-right">
              <div className="relative inline-block">
                <p className="font-semibold text-lg text-gray-800">{content.managerName || 'Saidulu Reddy'}</p>
                <p className="text-gray-700 mt-1">{content.managerDesignation || 'General Manager'}</p>
                <div className="absolute -top-12 stamp_imp">
                  <img src={logo} alt="Company Stamp" className="w-20 h-17 opacity-80" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-auto pt-6 border-t border-gray-300">
          <div className="text-center text-sm text-gray-600">
            <h2 className="text-2xl font-bold text-gray-800 tracking-wide mb-1">{content.companyName}</h2>
            <p className="font-semibold text-gray-700 mb-2">Flat No: 301, 3rd Floor, Sri Sai Balaji Avenue, Arunodaya Colony, Madhapur, Hyderabad</p>
            <div className="flex justify-center items-center gap-4 text-xs font-medium text-gray-700">
              <span>Email: {content.companyEmail || 'hello@timelyhealth.com'}</span>
              <span>|</span>
              <span>Mobile: {content.companyPhone || '+91 9010481048'}</span>
              <span>|</span>
              <span>Website: {content.companyWebsite || 'www.timelyhealth.in'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Relieving Letter Template ─────────────────────────────────────────────
  const RelievingLetterTemplate = ({ data }) => {
    const raw     = data?.content || data;
    const content = { ...raw, companyName: cleanCompanyName(raw.companyName), experienceBody: cleanBodyText(raw.experienceBody), relievingBody: cleanBodyText(raw.relievingBody), employeeLocation: getEmpAddress(raw) };
    const empId   = content.employeeId || data?.employeeId || '';
    const gender  = (content.gender || 'male').toLowerCase();
    const salutation = gender === 'male' ? 'Mr.' : 'Ms.';
    return (
      <div ref={letterRef} className="relative bg-white p-10 rounded-lg shadow-lg max-w-4xl mx-auto overflow-hidden flex flex-col" style={{ fontFamily: 'Times New Roman, serif', lineHeight: '1.6', minHeight: '1056px' }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.1, zIndex: 0 }}>
          <img src={New} alt="Watermark" className="w-[300px] h-auto object-contain select-none" />
        </div>
        <div className="flex justify-end items-start border-b-2 border-gray-300 pb-4 mb-6">
          <img src={New} alt="Company Logo" className="h-12" />
        </div>
        <div className="mb-6">
          <p className="font-bold text-xl text-gray-800 tracking-wide text-center uppercase">Letter of Relieving</p>
        </div>
        <div className="text-right mb-6">
          <p className="text-sm text-gray-700">Date: <span className="font-semibold">{content.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span></p>
          <p className="text-sm text-gray-700">Place: <span className="font-semibold">Hyderabad</span></p>
        </div>
        <div className="mb-6">
          <p className="text-gray-700 mb-3">To,</p>
          <div className="ml-4">
            <p className="font-semibold text-gray-800">{salutation} {content.employeeName || data?.employeeName || 'Employee'}</p>
            <p className="text-gray-700">EMP ID: {empId}</p>
            <p className="text-gray-700">{content.designation || ''}</p>
            <p className="text-gray-700">{content.companyName}</p>
            <p className="text-gray-700">Address: {content.employeeLocation}</p>
          </div>
        </div>
        <div className="mb-6">
          <p className="text-gray-700">Dear <span className="font-semibold">{salutation} {content.employeeName || 'Employee'}</span>,</p>
        </div>
        <div className="mb-6 text-justify">
          <p className="mb-4 text-gray-700 whitespace-pre-line">
            {content.relievingBody || `With reference to your resignation letter, we hereby confirm that your resignation from the post of ${content.designation || ''} at ${content.companyName}. Your resignation has been accepted. Your last working day will be ${content.relievingDate || ''}.`}
          </p>
          <p className="mb-4 text-gray-700">We certify that your service record with the company is as follows:</p>
          <div className="mb-4 ml-6">
            <p className="text-gray-700">Joining Date: <span className="font-semibold">{content.joiningDate || ''}</span></p>
            <p className="text-gray-700">Leaving Date: <span className="font-semibold">{content.relievingDate || ''}</span></p>
          </div>
          <p className="mb-4 text-gray-700">We further certify that your full and final settlement has been cleared and there are no dues pending from your end.</p>
          <p className="mb-4 text-gray-700">We wish you all the best in your future endeavors.</p>
        </div>
        <div className="mt-10">
          <div className="flex justify-between items-start gap-8">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">Employee Signature:</p>
              <div className="border-b border-gray-400 w-48 h-8"></div>
            </div>
            <div className="flex-1 text-right">
              <div className="relative inline-block">
                <p className="font-semibold text-lg text-gray-800">{content.managerName || 'Saidulu Reddy'}</p>
                <p className="text-gray-700 mt-1">{content.managerDesignation || 'General Manager'}</p>
                <div className="absolute -top-12 stamp_imp">
                  <img src={logo} alt="Company Stamp" className="w-20 h-17 opacity-80" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-auto pt-6 border-t border-gray-300">
          <div className="text-center text-sm text-gray-600">
            <h2 className="text-2xl font-bold text-gray-800 tracking-wide mb-1">{content.companyName}</h2>
            <p className="font-semibold text-gray-700 mb-2">Flat No: 301, 3rd Floor, Sri Sai Balaji Avenue, Arunodaya Colony, Madhapur, Hyderabad</p>
            <div className="flex justify-center items-center gap-4 text-xs font-medium text-gray-700">
              <span>Email: {content.companyEmail || 'hello@timelyhealth.com'}</span>
              <span>|</span>
              <span>Mobile: {content.companyPhone || '+91 9010481048'}</span>
              <span>|</span>
              <span>Website: {content.companyWebsite || 'www.timelyhealth.in'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">

        {/* ── Page Header ── */}
        <div className="emp-dash__header">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              My <span>Letters</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Employee info pill */}
            {employeeData && (
              <div className="emp-dash__date-pill">
                <FaUser className="text-blue-600 text-[10px]" />
                <span>{employeeData.name || 'Employee'}</span>
                {employeeId && <span className="text-gray-400 text-[10px] font-medium">· {employeeId}</span>}
              </div>
            )}
            <div className="emp-dash__date-pill">
              <FiCalendar />
              <span>
                {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* ── KPI Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          {/* Total letters */}
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Letters</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiInbox className="text-blue-500" />
              </div>
            </div>
            <div className="emp-dash__stat-value">{loading ? '—' : letters.length}</div>
            <div className="emp-dash__stat-meta">in your inbox 📬</div>
          </div>

          {/* Experience tab card */}
          <div
            className={`emp-dash__stat cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] ${letterType === 'experience' ? 'ring-2 ring-blue-400 shadow-lg' : ''}`}
            onClick={() => setLetterType('experience')}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Experience</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiFileText className="text-green-500" />
              </div>
            </div>
            <div className="emp-dash__stat-value">
              <span className="text-2xl">{letterType === 'experience' ? '✓' : '—'}</span>
            </div>
            <div className="emp-dash__stat-meta">tap to switch 📄</div>
          </div>

          {/* Relieving tab card */}
          <div
            className={`emp-dash__stat cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] ${letterType === 'relieving' ? 'ring-2 ring-amber-400 shadow-lg' : ''}`}
            onClick={() => setLetterType('relieving')}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Relieving</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FaCalendarAlt className="text-amber-500" />
              </div>
            </div>
            <div className="emp-dash__stat-value">
              <span className="text-2xl">{letterType === 'relieving' ? '✓' : '—'}</span>
            </div>
            <div className="emp-dash__stat-meta">tap to switch 📋</div>
          </div>

          {/* Sent status */}
          <div className="emp-dash__stat col-span-2 lg:col-span-1">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Status</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiSend className="text-green-500" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-lg">Sent</div>
            <div className="emp-dash__stat-meta">official letters ✉️</div>
          </div>
        </div>

        {/* ── Letter Type Toggle + Filter Card ── */}
        <div className="emp-dash__card mb-6">
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title flex items-center gap-2">
                <FaFileAlt className="text-blue-600" />
                {letterType === 'experience' ? 'Experience Letters' : 'Relieving Letters'}
              </h3>
              <p className="emp-dash__card-desc">
                View and download your official company letters
              </p>
            </div>

            {/* Toggle pill group */}
            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
              {['experience', 'relieving'].map((type) => (
                <button
                  key={type}
                  onClick={() => setLetterType(type)}
                  className={`px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-semibold rounded-md transition-all ${
                    letterType === type
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {type === 'experience' ? '📄 Experience' : '📋 Relieving'}
                </button>
              ))}
            </div>
          </div>

          {/* ── Content ── */}
          <div className="emp-dash__card-body">

            {/* Loading */}
            {loading && (
              <div className="py-14 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="emp-dash__spinner"></div>
                  <span className="text-sm font-medium text-gray-500">Loading your letters...</span>
                </div>
              </div>
            )}

            {/* Error / Empty state */}
            {!loading && error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col items-center gap-3 py-14 text-center ${
                  error.includes('No') ? '' : ''
                }`}
              >
                {error.includes('No') ? (
                  <>
                    <FiInbox className="text-5xl text-gray-200" />
                    <p className="text-base font-semibold text-gray-500">
                      No {letterType === 'experience' ? 'Experience' : 'Relieving'} Letters Found
                    </p>
                    <p className="text-xs text-gray-400 max-w-sm">
                      {letterType === 'experience'
                        ? 'If you have completed your employment, please contact HR for your experience letter.'
                        : 'If you have recently left the company, please contact HR for your relieving letter.'
                      }
                    </p>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold mt-1">
                      <FaClock className="text-[10px]" /> Pending from HR
                    </span>
                  </>
                ) : (
                  <>
                    <FaTimesCircle className="text-4xl text-red-300" />
                    <p className="text-sm font-semibold text-red-500">{error}</p>
                  </>
                )}
              </motion.div>
            )}

            {/* ── Desktop Table ── */}
            {!loading && !error && letters.length > 0 && (
              <>
                <div className="emp-dash__table-wrap hidden sm:block border border-gray-100 rounded-xl overflow-hidden">
                  <table className="emp-dash__table">
                    <thead>
                      <tr>
                        <th className="text-center w-10">#</th>
                        <th>Letter Type</th>
                        <th>Employee</th>
                        <th>Designation</th>
                        <th className="text-center">
                          {letterType === 'experience' ? 'Employment Period' : 'Relieving Date'}
                        </th>
                        <th className="text-center">Status</th>
                        <th className="text-center">Sent On</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {letters.map((letter, index) => {
                          const content = letter.content || {};
                          return (
                            <motion.tr
                              key={letter._id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: Math.min(index * 0.04, 0.4) }}
                              className="hover:bg-gray-50/60 transition-all group"
                            >
                              <td className="text-center font-bold text-gray-400">{index + 1}</td>

                              {/* Type badge */}
                              <td className="whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm bg-blue-100 text-blue-600">
                                    {letterType === 'experience' ? '📄' : '📋'}
                                  </div>
                                  <span className="font-semibold text-gray-900 capitalize group-hover:text-blue-600 transition-colors">
                                    {letterType === 'experience' ? 'Experience' : 'Relieving'}
                                  </span>
                                </div>
                              </td>

                              {/* Employee */}
                              <td className="whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-indigo-100 text-indigo-600">
                                    {(content.employeeName || letter.employeeName || '?').charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-gray-900 text-xs">
                                      {content.employeeName || letter.employeeName || '—'}
                                    </span>
                                    <span className="text-[10px] text-gray-400">{letter.employeeId || '—'}</span>
                                  </div>
                                </div>
                              </td>

                              {/* Designation */}
                              <td className="whitespace-nowrap">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                                  {content.designation || '—'}
                                </span>
                              </td>

                              {/* Period / date */}
                              <td className="text-center whitespace-nowrap">
                                <div className="flex flex-col items-center">
                                  <span className="font-semibold text-gray-800 text-xs">
                                    {letterType === 'experience'
                                      ? `${content.joiningDate || '—'} → ${content.relievingDate || '—'}`
                                      : (content.relievingDate || '—')
                                    }
                                  </span>
                                </div>
                              </td>

                              {/* Status */}
                              <td className="text-center whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                  <span className="text-xs font-bold text-green-700 uppercase">Sent</span>
                                </div>
                              </td>

                              {/* Sent on */}
                              <td className="text-center whitespace-nowrap">
                                <div className="flex flex-col items-center">
                                  <span className="font-semibold text-gray-800 text-xs">
                                    {letter.sentAt
                                      ? new Date(letter.sentAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                      : '—'
                                    }
                                  </span>
                                  {letter.sentAt && (
                                    <span className="text-[10px] text-gray-400">
                                      {new Date(letter.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleViewLetter(letter)}
                                    className="p-2 rounded-lg transition-all transform hover:scale-110 shadow-sm border bg-blue-600 text-white hover:bg-blue-700 border-blue-500"
                                    title="View letter"
                                  >
                                    <FaEye className="text-xs" />
                                  </button>
                                  <button
                                    onClick={() => { setSelectedLetter(letter); setTimeout(handleDownloadPDF, 100); }}
                                    className="p-2 rounded-lg transition-all transform hover:scale-110 shadow-sm border bg-purple-600 text-white hover:bg-purple-700 border-purple-500"
                                    title="Download PDF"
                                  >
                                    <FaDownload className="text-xs" />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {/* ── Mobile Card List ── */}
                <div className="sm:hidden divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                  {letters.map((letter) => {
                    const content = letter.content || {};
                    return (
                      <div key={letter._id} className="p-4 hover:bg-gray-50/60 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold bg-indigo-100 text-indigo-600">
                              {(content.employeeName || letter.employeeName || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {content.employeeName || letter.employeeName || '—'}
                              </h4>
                              <span className="text-xs text-gray-400">{letter.employeeId || '—'} · {content.designation || '—'}</span>
                            </div>
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span className="text-[10px] font-bold text-green-700">SENT</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-600 mb-3">
                          <div>
                            <span className="text-gray-400">
                              {letterType === 'experience' ? 'From:' : 'Relieved:'}
                            </span>{' '}
                            <span className="font-medium">
                              {letterType === 'experience' ? (content.joiningDate || '—') : (content.relievingDate || '—')}
                            </span>
                          </div>
                          {letterType === 'experience' && (
                            <div>
                              <span className="text-gray-400">To:</span>{' '}
                              <span className="font-medium">{content.relievingDate || '—'}</span>
                            </div>
                          )}
                          {letter.sentAt && (
                            <div className="col-span-2 flex items-center gap-1 text-gray-400">
                              <FaCalendarAlt className="text-[9px]" />
                              Sent {new Date(letter.sentAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                          <button
                            onClick={() => handleViewLetter(letter)}
                            className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <FaEye className="text-[10px]" /> View
                          </button>
                          <button
                            onClick={() => { setSelectedLetter(letter); setTimeout(handleDownloadPDF, 100); }}
                            className="px-3 py-2 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1.5"
                          >
                            <FaDownload className="text-[10px]" /> PDF
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Table footer */}
                <div className="flex items-center justify-between gap-2 px-1 pt-3 text-xs text-gray-500 font-medium">
                  <span>
                    Showing <span className="text-gray-900 font-bold">{letters.length}</span>{' '}
                    {letterType} {letters.length === 1 ? 'letter' : 'letters'}
                  </span>
                  <span className="flex items-center gap-1 text-green-600 font-semibold">
                    <FaCheckCircle className="text-[10px]" /> All verified &amp; sent
                  </span>
                </div>
              </>
            )}

            {/* No letters (no error) */}
            {!loading && !error && letters.length === 0 && (
              <div className="py-14 text-center">
                <FiInbox className="text-5xl text-gray-200 mx-auto mb-3" />
                <p className="text-base font-semibold text-gray-500">
                  No {letterType === 'experience' ? 'Experience' : 'Relieving'} Letters Yet
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                  {letterType === 'experience'
                    ? 'Contact HR to issue your experience letter after completing employment.'
                    : 'Contact HR to issue your relieving letter after your last working day.'}
                </p>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* ── Letter View Modal ── */}
      <AnimatePresence>
        {showLetterModal && selectedLetter && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
            <div className="flex items-center justify-center min-h-screen p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 rounded-t-2xl flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <FaFileAlt className="text-blue-600" />
                      {letterType === 'experience' ? 'Experience Letter' : 'Relieving Letter'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedLetter.employeeName} — {selectedLetter.employeeId}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleDownloadPDF}
                      className="px-3 py-1.5 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1.5"
                    >
                      <FaDownload className="text-xs" /> PDF
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-3 py-1.5 text-sm font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1.5"
                    >
                      <FaPrint className="text-xs" /> Print
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Letter Content */}
                <div className="p-6">
                  {letterType === 'experience'
                    ? <ExperienceLetterTemplate data={selectedLetter} />
                    : <RelievingLetterTemplate data={selectedLetter} />
                  }
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-gray-50 px-6 py-3 border-t border-gray-200 rounded-b-2xl flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1.5">
                      <FaCheckCircle className="text-green-500" />
                      Status: <span className="font-semibold text-green-600">Sent</span>
                    </span>
                    {selectedLetter.sentAt && (
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="text-gray-400 text-xs" />
                        {new Date(selectedLetter.sentAt).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit', hour12: true
                        })}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-1.5 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                  >
                    <FaArrowLeft className="text-xs" /> Close
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @media print {
          .emp-dash__header, .emp-dash__card { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default RelievingLetters;