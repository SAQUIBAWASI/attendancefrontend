import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import logo from "../Images/company-stamp-1780465131172.png";
import New from "../Images/Timelyhealth logo.png";
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaFileAlt, FaSpinner, FaEye, FaDownload, FaPrint,
  FaCheckCircle, FaTimesCircle, FaClock, FaCalendarAlt,
  FaUser, FaBuilding, FaEnvelope, FaArrowLeft,
  FaPaperPlane, FaTimes, FaExclamationTriangle, FaUndo
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

  // ── RESIGNATION STATE ──
  const [resignations, setResignations] = useState([]);
  const [resignationLoading, setResignationLoading] = useState(false);
  const [resignationSubmitting, setResignationSubmitting] = useState(false);
  const [showResignationForm, setShowResignationForm] = useState(false);
  const [selectedResignation, setSelectedResignation] = useState(null);
  const [showResignationDetail, setShowResignationDetail] = useState(false);
  const [resignationError, setResignationError] = useState('');
  const [resignationSuccess, setResignationSuccess] = useState('');

  const [resignationForm, setResignationForm] = useState({
    resignationDate: new Date().toISOString().split('T')[0],
    lastWorkingDate: '',
    noticePeriodDays: 30,
    reasonCategory: 'Better Opportunity',
    reason: '',
    comments: '',
  });

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

  // ── RESIGNATION: load when tab selected ──
  useEffect(() => {
    if (letterType === 'resignation' && employeeId && isAuthenticated) {
      fetchMyResignations();
    }
  }, [letterType, employeeId, isAuthenticated]);

  // Auto-calc Last Working Date
  useEffect(() => {
    if (resignationForm.resignationDate && resignationForm.noticePeriodDays) {
      const rd = new Date(resignationForm.resignationDate);
      rd.setDate(rd.getDate() + Number(resignationForm.noticePeriodDays));
      setResignationForm((prev) => ({
        ...prev,
        lastWorkingDate: rd.toISOString().split('T')[0],
      }));
    }
  }, [resignationForm.resignationDate, resignationForm.noticePeriodDays]);

  // ── API ───────────────────────────────────────────────────────────────────
  const fetchEmployeeLetters = async (empId, type) => {
    if (type === 'resignation') return;
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

  // ── RESIGNATION API ───────────────────────────────────────────────────────
  const fetchMyResignations = async () => {
    setResignationLoading(true);
    setResignationError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/employees/my-resignations/${employeeId}`);
      if (res.data?.success) setResignations(res.data.data || []);
    } catch (err) {
      console.error(err);
      setResignationError('Failed to fetch your resignations.');
    } finally {
      setResignationLoading(false);
    }
  };

  const handleResignationInputChange = (e) => {
    const { name, value } = e.target;
    setResignationForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleResignationSubmit = async (e) => {
    e.preventDefault();
    setResignationError('');
    setResignationSuccess('');

    if (!resignationForm.reason.trim()) {
      setResignationError('Please provide a reason.');
      return;
    }
    if (!resignationForm.lastWorkingDate) {
      setResignationError('Last working date is required.');
      return;
    }

    setResignationSubmitting(true);
    try {
      const payload = {
        employeeName: employeeData?.name || '',
        email: employeeData?.email || '',
        department: employeeData?.department || '',
        designation: employeeData?.role || employeeData?.designation || '',
        joiningDate: employeeData?.joinDate || null,
        ...resignationForm,
      };

      const res = await axios.post(
        `${API_BASE_URL}/employees/submit-resignation/${employeeId}`,
        payload
      );

      if (res.data?.success) {
        setResignationSuccess('✅ Resignation submitted successfully!');
        setShowResignationForm(false);
        setResignationForm({
          resignationDate: new Date().toISOString().split('T')[0],
          lastWorkingDate: '',
          noticePeriodDays: 30,
          reasonCategory: 'Better Opportunity',
          reason: '',
          comments: '',
        });
        fetchMyResignations();
        setTimeout(() => setResignationSuccess(''), 4000);
      }
    } catch (err) {
      console.error(err);
      setResignationError(err.response?.data?.message || 'Failed to submit.');
      setTimeout(() => setResignationError(''), 4000);
    } finally {
      setResignationSubmitting(false);
    }
  };

  const handleResignationWithdraw = async (id) => {
    if (!window.confirm('Withdraw this resignation?')) return;
    try {
      const res = await axios.put(`${API_BASE_URL}/employees/withdraw-resignation/${id}`);
      if (res.data?.success) {
        setResignationSuccess('Resignation withdrawn.');
        fetchMyResignations();
        setTimeout(() => setResignationSuccess(''), 4000);
      }
    } catch (err) {
      setResignationError(err.response?.data?.message || 'Failed to withdraw.');
      setTimeout(() => setResignationError(''), 4000);
    }
  };

  const resignationStatusStyle = (status) => {
    switch (status) {
      case 'pending': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: <FaClock className="text-amber-500" /> };
      case 'approved': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: <FaCheckCircle className="text-green-500" /> };
      case 'rejected': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: <FaTimesCircle className="text-red-500" /> };
      case 'withdrawn': return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', icon: <FaUndo className="text-gray-500" /> };
      default: return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', icon: <FaFileAlt /> };
    }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

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
            {employeeData && (
              <div className="emp-dash__date-pill">
                <FaUser className="text-blue-600 text-[10px]" />
                <span>{employeeData.name || 'Employee'}</span>
                {employeeId && <span className="text-gray-400 text-[10px] font-medium">· {employeeId}</span>}
              </div>
            )}
            <div className="emp-dash__date-pill">
              <FiCalendar />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* ── KPI Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">{letterType === 'resignation' ? 'Total' : 'Total Letters'}</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiInbox className="text-blue-500" />
              </div>
            </div>
            <div className="emp-dash__stat-value">
              {letterType === 'resignation'
                ? (resignationLoading ? '—' : resignations.length)
                : (loading ? '—' : letters.length)
              }
            </div>
            <div className="emp-dash__stat-meta">{letterType === 'resignation' ? 'requests 📬' : 'in your inbox 📬'}</div>
          </div>

          <div className={`emp-dash__stat cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] ${letterType === 'experience' ? 'ring-2 ring-blue-400 shadow-lg' : ''}`}
            onClick={() => setLetterType('experience')}>
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

          <div className={`emp-dash__stat cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] ${letterType === 'relieving' ? 'ring-2 ring-amber-400 shadow-lg' : ''}`}
            onClick={() => setLetterType('relieving')}>
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

          <div className={`emp-dash__stat cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] ${letterType === 'resignation' ? 'ring-2 ring-purple-400 shadow-lg' : ''}`}
            onClick={() => setLetterType('resignation')}>
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Resignation</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                <FiSend className="text-purple-500" />
              </div>
            </div>
            <div className="emp-dash__stat-value">
              <span className="text-2xl">{letterType === 'resignation' ? '✓' : '—'}</span>
            </div>
            <div className="emp-dash__stat-meta">tap to switch 📝</div>
          </div>
        </div>

        {/* ── Letter Type Toggle + Filter Card ── */}
        <div className="emp-dash__card mb-6">
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title flex items-center gap-2">
                <FaFileAlt className="text-blue-600" />
                {letterType === 'experience' ? 'Experience Letters' : letterType === 'relieving' ? 'Relieving Letters' : 'My Resignations'}
              </h3>
              <p className="emp-dash__card-desc">
                {letterType === 'resignation' ? 'Submit and track your resignation requests' : 'View and download your official company letters'}
              </p>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
              {['experience', 'relieving', 'resignation'].map((type) => (
                <button key={type} onClick={() => setLetterType(type)}
                  className={`px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-semibold rounded-md transition-all ${
                    letterType === type ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}>
                  {type === 'experience' ? '📄 Experience' : type === 'relieving' ? '📋 Relieving' : '📝 Resignation'}
                </button>
              ))}
            </div>
          </div>

          <div className="emp-dash__card-body">
            {/* ═══════════════════════════════════════════════════════ */}
            {/* RESIGNATION TAB */}
            {/* ═══════════════════════════════════════════════════════ */}
            {letterType === 'resignation' ? (
              <>
                {/* Alerts */}
                <AnimatePresence>
                  {resignationSuccess && (
                    <motion.div key="rs" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm font-medium">
                      <FaCheckCircle className="text-green-500 shrink-0" />{resignationSuccess}
                    </motion.div>
                  )}
                  {resignationError && (
                    <motion.div key="re" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm font-medium">
                      <FaTimes className="text-red-500 shrink-0" />{resignationError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action buttons */}
                <div className="flex justify-end gap-2 mb-4 flex-wrap">
                  <button onClick={fetchMyResignations} disabled={resignationLoading}
                    className="emp-dash__date-pill cursor-pointer hover:bg-blue-50 transition-all">
                    <FaSpinner className={resignationLoading ? 'animate-spin text-blue-600' : 'text-blue-600'} />
                    <span>Refresh</span>
                  </button>
                  <button onClick={() => setShowResignationForm(!showResignationForm)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    {showResignationForm ? <FaTimes className="text-[10px]" /> : <FaPaperPlane className="text-[10px]" />}
                    {showResignationForm ? 'Close Form' : 'Submit Resignation'}
                  </button>
                </div>

                {/* Form */}
                <AnimatePresence>
                  {showResignationForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mb-6">
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <form onSubmit={handleResignationSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Resignation Date *</label>
                            <input type="date" name="resignationDate" value={resignationForm.resignationDate}
                              onChange={handleResignationInputChange} required
                              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Notice Period</label>
                            <select name="noticePeriodDays" value={resignationForm.noticePeriodDays} onChange={handleResignationInputChange}
                              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                              <option value={15}>15 Days</option>
                              <option value={30}>30 Days</option>
                              <option value={45}>45 Days</option>
                              <option value={60}>60 Days</option>
                              <option value={90}>90 Days</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Last Working Date *</label>
                            <input type="date" name="lastWorkingDate" value={resignationForm.lastWorkingDate}
                              onChange={handleResignationInputChange} required
                              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Reason Category</label>
                            <select name="reasonCategory" value={resignationForm.reasonCategory} onChange={handleResignationInputChange}
                              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                              <option>Better Opportunity</option>
                              <option>Personal Reasons</option>
                              <option>Higher Studies</option>
                              <option>Health Issues</option>
                              <option>Relocation</option>
                              <option>Work Environment</option>
                              <option>Compensation</option>
                              <option>Other</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Reason *</label>
                            <textarea name="reason" value={resignationForm.reason} onChange={handleResignationInputChange}
                              rows={3} required placeholder="Explain why you are resigning..."
                              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Additional Comments</label>
                            <textarea name="comments" value={resignationForm.comments} onChange={handleResignationInputChange}
                              rows={2} placeholder="Optional..."
                              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
                          </div>
                          <div className="md:col-span-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <FaExclamationTriangle className="text-amber-500 text-sm mt-0.5 shrink-0" />
                            <p className="text-[11px] text-amber-700 leading-relaxed">
                              Once submitted, HR/Admin will review. You can withdraw while it is <b>pending</b>.
                            </p>
                          </div>
                          <div className="md:col-span-2 flex justify-end gap-2">
                            <button type="button" onClick={() => setShowResignationForm(false)}
                              className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                              Cancel
                            </button>
                            <button type="submit" disabled={resignationSubmitting}
                              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50">
                              {resignationSubmitting ? <FaSpinner className="animate-spin text-[10px]" /> : <FaPaperPlane className="text-[10px]" />}
                              {resignationSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* History */}
                {resignationLoading ? (
                  <div className="py-14 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="emp-dash__spinner"></div>
                      <span className="text-sm font-medium text-gray-500">Loading your resignations...</span>
                    </div>
                  </div>
                ) : resignations.length === 0 ? (
                  <div className="py-14 text-center">
                    <FiInbox className="text-5xl text-gray-200 mx-auto mb-3" />
                    <p className="text-base font-semibold text-gray-500">No Resignation Submitted</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      When you submit a resignation, it will appear here.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="emp-dash__table-wrap hidden sm:block border border-gray-100 rounded-xl overflow-hidden">
                      <table className="emp-dash__table">
                        <thead>
                          <tr>
                            <th className="text-center w-10">#</th>
                            <th>Resignation Date</th>
                            <th>Last Working Date</th>
                            <th>Reason</th>
                            <th className="text-center">Status</th>
                            <th className="text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <AnimatePresence>
                            {resignations.map((r, i) => {
                              const s = resignationStatusStyle(r.status);
                              return (
                                <motion.tr key={r._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                                  className="hover:bg-gray-50/60 transition-all group">
                                  <td className="text-center font-bold text-gray-400">{i + 1}</td>
                                  <td className="whitespace-nowrap">
                                    <span className="font-semibold text-gray-800 text-xs">{fmtDate(r.resignationDate)}</span>
                                  </td>
                                  <td className="whitespace-nowrap">
                                    <span className="font-semibold text-gray-800 text-xs">{fmtDate(r.lastWorkingDate)}</span>
                                    {r.isShortNotice && <span className="ml-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-700">SHORT</span>}
                                  </td>
                                  <td className="max-w-[220px]">
                                    <p className="text-xs text-gray-600 truncate" title={r.reason}>{r.reason}</p>
                                    <span className="text-[10px] text-gray-400">{r.reasonCategory}</span>
                                  </td>
                                  <td className="text-center whitespace-nowrap">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 ${s.bg} border ${s.border} rounded-full`}>
                                      {s.icon}<span className={`text-xs font-bold uppercase ${s.text}`}>{r.status}</span>
                                    </div>
                                  </td>
                                  <td className="text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button onClick={() => { setSelectedResignation(r); setShowResignationDetail(true); }}
                                        className="p-2 rounded-lg transition-all transform hover:scale-110 shadow-sm border bg-blue-600 text-white hover:bg-blue-700 border-blue-500" title="View">
                                        <FaEye className="text-xs" />
                                      </button>
                                      {r.status === 'pending' && (
                                        <button onClick={() => handleResignationWithdraw(r._id)}
                                          className="p-2 rounded-lg transition-all transform hover:scale-110 shadow-sm border bg-rose-600 text-white hover:bg-rose-700 border-rose-500" title="Withdraw">
                                          <FaUndo className="text-xs" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </motion.tr>
                              );
                            })}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="sm:hidden divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                      {resignations.map((r) => {
                        const s = resignationStatusStyle(r.status);
                        return (
                          <div key={r._id} className="p-4 hover:bg-gray-50/60 transition-all">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-900 text-sm">Resignation</h4>
                                <span className="text-xs text-gray-400">Submitted: {fmtDate(r.createdAt)}</span>
                              </div>
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${s.bg} border ${s.border} rounded-full`}>
                                {s.icon}<span className={`text-[10px] font-bold uppercase ${s.text}`}>{r.status}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-600 mb-3">
                              <div><span className="text-gray-400">LWD:</span> <span className="font-medium">{fmtDate(r.lastWorkingDate)}</span></div>
                              <div><span className="text-gray-400">Category:</span> <span className="font-medium">{r.reasonCategory}</span></div>
                            </div>
                            <div className="flex gap-2 pt-2 border-t border-gray-100">
                              <button onClick={() => { setSelectedResignation(r); setShowResignationDetail(true); }}
                                className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg flex items-center justify-center gap-1.5">
                                <FaEye className="text-[10px]" /> View
                              </button>
                              {r.status === 'pending' && (
                                <button onClick={() => handleResignationWithdraw(r._id)}
                                  className="px-3 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg flex items-center gap-1.5">
                                  <FaUndo className="text-[10px]" /> Withdraw
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {/* ═══ EXISTING LETTERS CONTENT (experience/relieving) ═══ */}

                {loading && (
                  <div className="py-14 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="emp-dash__spinner"></div>
                      <span className="text-sm font-medium text-gray-500">Loading your letters...</span>
                    </div>
                  </div>
                )}

                {!loading && error && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-3 py-14 text-center">
                    {error.includes('No') ? (
                      <>
                        <FiInbox className="text-5xl text-gray-200" />
                        <p className="text-base font-semibold text-gray-500">
                          No {letterType === 'experience' ? 'Experience' : 'Relieving'} Letters Found
                        </p>
                        <p className="text-xs text-gray-400 max-w-sm">
                          {letterType === 'experience'
                            ? 'If you have completed your employment, please contact HR for your experience letter.'
                            : 'If you have recently left the company, please contact HR for your relieving letter.'}
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

                {!loading && !error && letters.length > 0 && (
                  <>
                    {/* Desktop Table */}
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
                                <motion.tr key={letter._id}
                                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: Math.min(index * 0.04, 0.4) }}
                                  className="hover:bg-gray-50/60 transition-all group">
                                  <td className="text-center font-bold text-gray-400">{index + 1}</td>
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
                                  <td className="whitespace-nowrap">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                                      {content.designation || '—'}
                                    </span>
                                  </td>
                                  <td className="text-center whitespace-nowrap">
                                    <div className="flex flex-col items-center">
                                      <span className="font-semibold text-gray-800 text-xs">
                                        {letterType === 'experience'
                                          ? `${content.joiningDate || '—'} → ${content.relievingDate || '—'}`
                                          : (content.relievingDate || '—')}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="text-center whitespace-nowrap">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                      <span className="text-xs font-bold text-green-700 uppercase">Sent</span>
                                    </div>
                                  </td>
                                  <td className="text-center whitespace-nowrap">
                                    <div className="flex flex-col items-center">
                                      <span className="font-semibold text-gray-800 text-xs">
                                        {letter.sentAt ? new Date(letter.sentAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                      </span>
                                      {letter.sentAt && (
                                        <span className="text-[10px] text-gray-400">
                                          {new Date(letter.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button onClick={() => handleViewLetter(letter)}
                                        className="p-2 rounded-lg transition-all transform hover:scale-110 shadow-sm border bg-blue-600 text-white hover:bg-blue-700 border-blue-500" title="View letter">
                                        <FaEye className="text-xs" />
                                      </button>
                                      <button onClick={() => { setSelectedLetter(letter); setTimeout(handleDownloadPDF, 100); }}
                                        className="p-2 rounded-lg transition-all transform hover:scale-110 shadow-sm border bg-purple-600 text-white hover:bg-purple-700 border-purple-500" title="Download PDF">
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

                    {/* Mobile Cards */}
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
                                <span className="text-gray-400">{letterType === 'experience' ? 'From:' : 'Relieved:'}</span>{' '}
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
                              <button onClick={() => handleViewLetter(letter)}
                                className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5">
                                <FaEye className="text-[10px]" /> View
                              </button>
                              <button onClick={() => { setSelectedLetter(letter); setTimeout(handleDownloadPDF, 100); }}
                                className="px-3 py-2 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1.5">
                                <FaDownload className="text-[10px]" /> PDF
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer */}
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
              </>
            )}
          </div>
        </div>
      </main>

      {/* ── Letter View Modal ── */}
      <AnimatePresence>
        {showLetterModal && selectedLetter && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
            <div className="flex items-center justify-center min-h-screen p-4">
              <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 rounded-t-2xl flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <FaFileAlt className="text-blue-600" />
                      {letterType === 'experience' ? 'Experience Letter' : 'Relieving Letter'}
                    </h3>
                    <p className="text-sm text-gray-500">{selectedLetter.employeeName} — {selectedLetter.employeeId}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={handleDownloadPDF}
                      className="px-3 py-1.5 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1.5">
                      <FaDownload className="text-xs" /> PDF
                    </button>
                    <button onClick={handlePrint}
                      className="px-3 py-1.5 text-sm font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1.5">
                      <FaPrint className="text-xs" /> Print
                    </button>
                    <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {letterType === 'experience'
                    ? <ExperienceLetterTemplate data={selectedLetter} />
                    : <RelievingLetterTemplate data={selectedLetter} />}
                </div>

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
                  <button onClick={handleCloseModal}
                    className="px-4 py-1.5 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                    <FaArrowLeft className="text-xs" /> Close
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Resignation Detail Modal ── */}
      <AnimatePresence>
        {showResignationDetail && selectedResignation && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
            <div className="flex items-center justify-center min-h-screen p-4">
              <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 rounded-t-2xl flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <FaFileAlt className="text-blue-600" />Resignation Details
                    </h3>
                    <p className="text-sm text-gray-500">{selectedResignation.employeeName} — {selectedResignation.employeeId}</p>
                  </div>
                  <button onClick={() => setShowResignationDetail(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <FaTimes className="text-gray-500" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-gray-500 mb-1">Resignation Date</p><p className="text-sm font-semibold text-gray-800">{fmtDate(selectedResignation.resignationDate)}</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">Last Working Date</p><p className="text-sm font-semibold text-gray-800">{fmtDate(selectedResignation.lastWorkingDate)}</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">Notice Period</p><p className="text-sm font-semibold text-gray-800">{selectedResignation.noticePeriodDays} days</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">Category</p><p className="text-sm font-semibold text-gray-800">{selectedResignation.reasonCategory}</p></div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Reason</p>
                    <p className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded-lg border border-gray-100">{selectedResignation.reason}</p>
                  </div>
                  {selectedResignation.comments && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Comments</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded-lg border border-gray-100">{selectedResignation.comments}</p>
                    </div>
                  )}
                  {selectedResignation.isShortNotice && (
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                      <p className="text-xs font-bold text-rose-700">⚠️ Short Notice by {selectedResignation.shortNoticeDays} days</p>
                    </div>
                  )}
                  {selectedResignation.status === 'rejected' && selectedResignation.rejectedReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-xs text-red-600 font-semibold mb-1">Rejected Reason:</p>
                      <p className="text-sm text-red-700">{selectedResignation.rejectedReason}</p>
                    </div>
                  )}
                  {selectedResignation.adminRemark && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-600 font-semibold mb-1">Admin Remark:</p>
                      <p className="text-sm text-blue-700">{selectedResignation.adminRemark}</p>
                    </div>
                  )}
                </div>
                <div className="sticky bottom-0 bg-gray-50 px-6 py-3 border-t border-gray-200 rounded-b-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {resignationStatusStyle(selectedResignation.status).icon}
                    <span className={`text-sm font-semibold uppercase ${resignationStatusStyle(selectedResignation.status).text}`}>
                      {selectedResignation.status}
                    </span>
                  </div>
                  <button onClick={() => setShowResignationDetail(false)}
                    className="px-4 py-1.5 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1.5">
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