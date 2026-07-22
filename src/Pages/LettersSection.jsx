import React, { useState, useEffect, useRef } from 'react';
import logo from "../Images/company-stamp-1780465131172.png";
import New from "../Images/Timelyhealth logo.png";
import { motion, AnimatePresence } from 'framer-motion';

import axios from 'axios';
import {
    FaUser, FaBuilding, FaCalendarAlt, FaDownload, FaEdit, FaSave,
    FaTimes, FaSpinner, FaPrint, FaSearch, FaFileAlt, FaPaperPlane,
    FaEye, FaArrowLeft, FaPhone, FaEnvelope, FaGlobe, FaFilter,
    FaCheckCircle, FaClock
} from 'react-icons/fa';
import { FiFileText, FiCalendar, FiUsers, FiSend } from 'react-icons/fi';
import { API_BASE_URL } from '../config';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import "../index.css";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

const LettersSection = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [letterType, setLetterType] = useState('experience');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [sending, setSending] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [currentLetterMeta, setCurrentLetterMeta] = useState(null);
    const [employeeLetters, setEmployeeLetters] = useState([]);
    const [viewingLetter, setViewingLetter] = useState(null);
    const [showSentLetterView, setShowSentLetterView] = useState(false);

    // Letter content state
    const [letterData, setLetterData] = useState({
        employeeName: '',
        employeeId: '',
        designation: '',
        department: '',
        employeeLocation: 'Hyderabad',
        gender: 'male',
        companyName: 'Timely Healthtech Private Limited',
        joiningDate: '',
        relievingDate: '',
        reasonForLeaving: 'to pursue other career opportunities',
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        managerName: 'Saidulu Reddy',
        managerDesignation: 'General Manager',
        companyAddress: 'Madhapur, Hyderabad, India',
        companyPhone: '+91 9010481048',
        companyEmail: 'hello@timelyhealth.com',
        companyWebsite: 'www.timelyhealth.in',
        signature: '',
        employeeSignature: '',
        experienceBody: '',
        relievingBody: '',
    });

    const letterRef = useRef(null);
    const viewLetterRef = useRef(null);

    useEffect(() => { fetchEmployees(); }, []);

    useEffect(() => {
        if (!selectedEmployee) return;
        loadLetterForEmployee(selectedEmployee, letterType);
    }, [selectedEmployee, letterType]);

    useEffect(() => {
        if (!selectedEmployee) { setEmployeeLetters([]); return; }
        loadEmployeeLetters(selectedEmployee);
    }, [selectedEmployee]);

    const fetchEmployees = async () => {
        setLoading(true);
        setError('');
        try {
            let response;
            try { response = await axios.get(`${API_BASE_URL}/employees/get-employees`); }
            catch (err) { response = await axios.get(`${API_BASE_URL}/employees/all`); }
            if (response.data.success || Array.isArray(response.data)) {
                const employeesList = Array.isArray(response.data) ? response.data : response.data.data || [];
                setEmployees(employeesList);
            } else { setError('Failed to fetch employees'); }
        } catch (err) {
            console.error('Error fetching employees:', err);
            setError('Failed to load employees. Please try again.');
        } finally { setLoading(false); }
    };

    const getLocationString = (emp) => {
        if (!emp) return 'Hyderabad';
        if (typeof emp.address === 'string' && emp.address.trim()) return emp.address.trim();
        const parts = [emp.addressLine1, emp.city, emp.state, emp.pinCode].filter(p => p && p.trim());
        if (parts.length > 0) return parts.join(', ');
        if (typeof emp.employeeLocation === 'string' && emp.employeeLocation.trim()) return emp.employeeLocation.trim();
        if (emp.city && emp.city.trim()) return emp.city.trim();
        return 'Hyderabad';
    };

    const buildDefaultLetterData = (employee) => {
        const joinDate = employee.joinDate ? new Date(employee.joinDate).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        }) : '';

        let relievingDate = '';
        if (employee.joinDate) {
            const relDate = new Date(employee.joinDate);
            relDate.setFullYear(relDate.getFullYear() + 1);
            if (employee.relievingDate) {
                relievingDate = new Date(employee.relievingDate).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric'
                });
            } else {
                relievingDate = relDate.toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric'
                });
            }
        }

        const gender = (employee.gender || 'male').toLowerCase();
        const salutation = gender === 'male' ? 'Mr.' : 'Ms.';
        const possessive = gender === 'male' ? 'his' : 'her';

        const defaultExperienceBody = `During ${possessive} tenure with us, ${salutation} ${employee.name || ''} was a valuable member of our ${employee.department || 'Full Stack Development'} team, responsible for developing web applications, managing frontend and backend integration, and delivering efficient technical solutions with strong problem-solving skills.`;
        const defaultRelievingBody = `With reference to your resignation letter, we hereby confirm that your resignation from the post of ${employee.role || employee.designation || ''} at Timely Healthtech Private Limited. Your resignation has been accepted. Your last working day will be ${relievingDate}.`;

        return {
            employeeName: employee.name || '',
            employeeId: employee.employeeId || '',
            designation: employee.role || employee.designation || '',
            employeeLocation: getLocationString(employee),
            gender: employee.gender || 'male',
            department: employee.department || '',
            companyName: 'Timely Healthtech Private Limited',
            joiningDate: joinDate,
            relievingDate: relievingDate,
            reasonForLeaving: 'to pursue other career opportunities',
            date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            managerName: 'Saidulu Reddy',
            managerDesignation: 'General Manager',
            companyAddress: 'Madhapur, Hyderabad, India',
            companyPhone: '+91 9010481048',
            companyEmail: 'hello@timelyhealth.com',
            companyWebsite: 'www.timelyhealth.in',
            signature: '',
            employeeSignature: '',
            experienceBody: defaultExperienceBody,
            relievingBody: defaultRelievingBody,
        };
    };

    const loadLetterForEmployee = async (employee, currentLetterType) => {
        const fallbackData = buildDefaultLetterData(employee);
        setLetterData(fallbackData);
        setError('');
        setCurrentLetterMeta(null);
        try {
            const employeeIdentifier = employee?._id || employee?.employeeId;
            const response = await axios.get(`${API_BASE_URL}/employees/admin-letters/${employeeIdentifier}`, {
                params: { letterType: currentLetterType }
            });
            if (response.data?.success && response.data?.data?.content) {
                setCurrentLetterMeta(response.data.data);
                setLetterData(prev => ({
                    ...prev,
                    ...response.data.data.content,
                    employeeLocation: response.data.data.content.employeeLocation || response.data.data.content.location || prev.employeeLocation || fallbackData.employeeLocation,
                    experienceBody: response.data.data.content.experienceBody || prev.experienceBody || fallbackData.experienceBody,
                    relievingBody: response.data.data.content.relievingBody || prev.relievingBody || fallbackData.relievingBody,
                }));
            }
        } catch (err) { console.error('Error loading saved letter:', err); }
    };

    const loadEmployeeLetters = async (employee) => {
        try {
            const employeeIdentifier = employee?._id || employee?.employeeId;
            const response = await axios.get(`${API_BASE_URL}/employees/admin-letters/${employeeIdentifier}`);
            if (response.data?.success) setEmployeeLetters(response.data.data || []);
        } catch (err) { console.error('Error loading employee letters:', err); }
    };

    const handleEmployeeSelect = (employee) => {
        setSelectedEmployee(employee);
        setIsEditing(false);
        setShowSentLetterView(false);
        setViewingLetter(null);
    };

    const handleViewExistingLetter = async (letter) => {
        if (!letter) return;
        try {
            if (letter.content) { setViewingLetter(letter); setShowSentLetterView(true); return; }
            const employeeIdentifier = selectedEmployee?._id || selectedEmployee?.employeeId;
            const response = await axios.get(`${API_BASE_URL}/employees/admin-letters/${employeeIdentifier}/${letter._id}`);
            if (response.data?.success && response.data?.data) {
                setViewingLetter(response.data.data);
                setShowSentLetterView(true);
            } else {
                setError('Failed to load letter details');
                setTimeout(() => setError(''), 3000);
            }
        } catch (err) {
            console.error('Error fetching letter:', err);
            setError(err.response?.data?.message || 'Failed to load letter');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleCloseSentLetterView = () => { setShowSentLetterView(false); setViewingLetter(null); };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLetterData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveLetter = async () => {
        if (!selectedEmployee) return;
        setSaving(true);
        setError('');
        try {
            const response = await axios.post(`${API_BASE_URL}/employees/admin-letters`, {
                employeeId: selectedEmployee?._id || selectedEmployee?.employeeId,
                employeeName: letterData.employeeName,
                letterType,
                content: letterData,
            });
            if (response.data?.data) setCurrentLetterMeta(response.data.data);
            await loadEmployeeLetters(selectedEmployee);
            setSuccessMessage('✅ Letter draft saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error saving letter:', err);
            setError(err.response?.data?.message || 'Failed to save letter');
            setTimeout(() => setError(''), 3000);
        } finally { setSaving(false); }
    };

    const handleSendLetter = async () => {
        if (!selectedEmployee) return;
        setSending(true);
        setError('');
        try {
            const response = await axios.post(`${API_BASE_URL}/employees/admin-letters/send`, {
                employeeId: selectedEmployee?._id || selectedEmployee?.employeeId,
                employeeName: letterData.employeeName,
                letterType,
                content: letterData,
            });
            if (response.data?.data) setCurrentLetterMeta(response.data.data);
            await loadEmployeeLetters(selectedEmployee);
            setSuccessMessage('✅ Letter sent successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error sending letter:', err);
            setError(err.response?.data?.message || 'Failed to send letter');
            setTimeout(() => setError(''), 3000);
        } finally { setSending(false); }
    };

    const handleDownloadPDF = async (ref, filename) => {
        const targetRef = ref || letterRef;
        if (!targetRef.current) return;
        try {
            const element = targetRef.current;
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${filename || 'letter'}.pdf`);
        } catch (err) {
            console.error('Error generating PDF:', err);
            setError('Failed to generate PDF');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handlePrint = () => window.print();

    const filteredEmployees = employees.filter(emp => {
        const searchLower = searchTerm.toLowerCase();
        return (
            emp.name?.toLowerCase().includes(searchLower) ||
            emp.employeeId?.toLowerCase().includes(searchLower) ||
            emp.email?.toLowerCase().includes(searchLower) ||
            emp.role?.toLowerCase().includes(searchLower) ||
            emp.department?.toLowerCase().includes(searchLower)
        );
    });

    const sentLetters = employeeLetters.filter(letter => letter.status === 'sent');
    const totalLettersGenerated = employeeLetters.length;

    // ─── Letter Templates ────────────────────────────────────────────────────
    const ExperienceLetter = ({ data: rawData, ref: elRef }) => {
        const cleanCompanyName = (name) => {
            if (!name) return 'Timely Healthtech Private Limited';
            const trimmed = name.trim();
            if (['Timely Health Tech Pvt Ltd.', 'Timely Health Tech Pvt. Ltd.', 'Timely Healthtech Private Limited.', 'Timely Health Tech Pvt Ltd', 'Timely Health Tech Pvt. Ltd'].includes(trimmed)) {
                return 'Timely Healthtech Private Limited';
            }
            return trimmed;
        };
        const cleanBodyText = (text) => {
            if (!text) return '';
            return text
                .replace(/Timely Health Tech Pvt\.? Ltd\.?/g, 'Timely Healthtech Private Limited')
                .replace(/Timely Healthtech Private Limited\./g, 'Timely Healthtech Private Limited');
        };
        const data = { ...rawData, companyName: cleanCompanyName(rawData.companyName), experienceBody: cleanBodyText(rawData.experienceBody), relievingBody: cleanBodyText(rawData.relievingBody) };
        const gender = (data.gender || 'male').toLowerCase();
        const pronoun = gender === 'male' ? 'he' : 'she';
        const pronounCap = gender === 'male' ? 'He' : 'She';
        const possessive = gender === 'male' ? 'his' : 'her';
        const salutation = gender === 'male' ? 'Mr.' : 'Ms.';
        return (
            <div ref={elRef} className="relative bg-white p-10 rounded-lg shadow-lg max-w-4xl mx-auto overflow-hidden flex flex-col" style={{ fontFamily: 'Times New Roman, serif', lineHeight: '1.6', minHeight: '1056px' }}>
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
                    <p className="text-sm text-gray-700">Date: <span className="font-semibold">{data.date}</span></p>
                    <p className="text-sm text-gray-700">Place: <span className="font-semibold">Hyderabad</span></p>
                </div>
                <div className="mb-6">
                    <p className="text-gray-700 mb-3">To,</p>
                    <div className="ml-4">
                        <p className="font-semibold text-gray-800">{salutation} {data.employeeName}</p>
                        <p className="text-gray-700">EMP ID: {data.employeeId}</p>
                        <p className="text-gray-700">{data.designation}</p>
                        <p className="text-gray-700">{data.companyName}</p>
                        <p className="text-gray-700">Address: {data.employeeLocation || data.location || 'Hyderabad'}</p>
                    </div>
                </div>
                <div className="mb-6">
                    <p className="font-bold text-xl text-gray-800 tracking-wide text-center">TO WHOM IT MAY CONCERN</p>
                </div>
                <div className="mb-6 text-justify">
                    <p className="mb-4 text-gray-700">
                        This is to certify that <span className="font-semibold">{salutation} {data.employeeName}</span> (Employee ID: <span className="font-semibold">{data.employeeId}</span>) was employed with <span className="font-semibold">{data.companyName}</span> as a <span className="font-semibold">{data.designation}</span> from <span className="font-semibold">{data.joiningDate}</span> to <span className="font-semibold">{data.relievingDate}</span>.
                    </p>
                    <p className="mb-4 text-gray-700 whitespace-pre-line">
                        {data.experienceBody || `During ${possessive} tenure with us, ${salutation} ${data.employeeName} was a valuable member of our ${data.department || 'Full Stack Development'} team, responsible for developing web applications, managing frontend and backend integration, and delivering efficient technical solutions with strong problem-solving skills.`}
                    </p>
                    <p className="mb-4 text-gray-700">
                        <span className="font-semibold">{salutation} {data.employeeName}</span> is a dedicated professional who maintains a positive attitude and works well in a team environment. {pronounCap} is leaving the company of {possessive} own accord to pursue other career opportunities.
                    </p>
                    <p className="mb-4 text-gray-700">
                        We thank {pronoun} for {possessive} contributions to the organization and wish {pronoun} every success in {possessive} future professional and personal endeavors.
                    </p>
                </div>
                <div className="mt-10">
                    <div className="flex justify-between items-start gap-8">
                        <div className="flex-1">
                            <p className="text-sm text-gray-600 mb-2">Employee Signature:</p>
                            <div className="flex items-center gap-4">
                                <div className="border-b border-gray-400 w-48 h-8"></div>
                            </div>
                        </div>
                        <div className="flex-1 text-right">
                            <div className="relative inline-block">
                                <p className="font-semibold text-lg text-gray-800">{data.managerName}</p>
                                <p className="text-gray-700 mt-1">{data.managerDesignation}</p>
                                <div className="absolute -top-12 stamp_imp">
                                    <img src={logo} alt="Company Stamp" className="w-20 h-17 opacity-80" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-auto pt-6 border-t border-gray-300">
                    <div className="text-center text-sm text-gray-600">
                        <h2 className="text-2xl font-bold text-gray-800 tracking-wide mb-1">{data.companyName || 'Timely Healthtech Private Limited'}</h2>
                        <p className="font-semibold text-gray-700 mb-2">Flat No: 301, 3rd Floor, Sri Sai Balaji Avenue, Arunodaya Colony, Madhapur, Hyderabad</p>
                        <div className="flex justify-center items-center gap-4 text-xs font-medium text-gray-700">
                            <span>Email: {data.companyEmail || 'hello@timelyhealth.com'}</span>
                            <span>|</span>
                            <span>Mobile: {data.companyPhone || '+91 9010481048'}</span>
                            <span>|</span>
                            <span>Website: {data.companyWebsite || 'www.timelyhealth.in'}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const RelievingLetter = ({ data: rawData, ref: elRef }) => {
        const cleanCompanyName = (name) => {
            if (!name) return 'Timely Healthtech Private Limited';
            const trimmed = name.trim();
            if (['Timely Health Tech Pvt Ltd.', 'Timely Health Tech Pvt. Ltd.', 'Timely Healthtech Private Limited.', 'Timely Health Tech Pvt Ltd', 'Timely Health Tech Pvt. Ltd'].includes(trimmed)) {
                return 'Timely Healthtech Private Limited';
            }
            return trimmed;
        };
        const cleanBodyText = (text) => {
            if (!text) return '';
            return text
                .replace(/Timely Health Tech Pvt\.? Ltd\.?/g, 'Timely Healthtech Private Limited')
                .replace(/Timely Healthtech Private Limited\./g, 'Timely Healthtech Private Limited');
        };
        const data = { ...rawData, companyName: cleanCompanyName(rawData.companyName), experienceBody: cleanBodyText(rawData.experienceBody), relievingBody: cleanBodyText(rawData.relievingBody) };
        const gender = (data.gender || 'male').toLowerCase();
        const salutation = gender === 'male' ? 'Mr.' : 'Ms.';
        return (
            <div ref={elRef} className="relative bg-white p-10 rounded-lg shadow-lg max-w-4xl mx-auto overflow-hidden flex flex-col" style={{ fontFamily: 'Times New Roman, serif', lineHeight: '1.6', minHeight: '1056px' }}>
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
                    <p className="text-sm text-gray-700">Date: <span className="font-semibold">{data.date}</span></p>
                    <p className="text-sm text-gray-700">Place: <span className="font-semibold">Hyderabad</span></p>
                </div>
                <div className="mb-6">
                    <p className="text-gray-700 mb-3">To,</p>
                    <div className="ml-4">
                        <p className="font-semibold text-gray-800">{salutation} {data.employeeName}</p>
                        <p className="text-gray-700">EMP ID: {data.employeeId}</p>
                        <p className="text-gray-700">{data.designation}</p>
                        <p className="text-gray-700">{data.companyName}</p>
                        <p className="text-gray-700">Address: {data.employeeLocation || data.location || 'Hyderabad'}</p>
                    </div>
                </div>
                <div className="mb-6">
                    <p className="text-gray-700">Dear <span className="font-semibold">{salutation} {data.employeeName}</span>,</p>
                </div>
                <div className="mb-6 text-justify">
                    <p className="mb-4 text-gray-700 whitespace-pre-line">
                        {data.relievingBody || `With reference to your resignation letter, we hereby confirm that your resignation from the post of ${data.designation} at ${data.companyName} Your resignation has been accepted. Your last working day will be ${data.relievingDate}.`}
                    </p>
                    <p className="mb-4 text-gray-700">We certify that your service record with the company is as follows:</p>
                    <div className="mb-4 ml-6">
                        <p className="text-gray-700">Joining Date: <span className="font-semibold">{data.joiningDate}</span></p>
                        <p className="text-gray-700">Leaving Date: <span className="font-semibold">{data.relievingDate}</span></p>
                    </div>
                    <p className="mb-4 text-gray-700">We further certify that your full and final settlement has been cleared and there are no dues pending from your end.</p>
                    <p className="mb-4 text-gray-700">We wish you all the best in your future endeavors.</p>
                </div>
                <div className="mt-10">
                    <div className="flex justify-between items-start gap-8">
                        <div className="flex-1">
                            <p className="text-sm text-gray-600 mb-2">Employee Signature:</p>
                            <div className="flex items-center gap-4">
                                <div className="border-b border-gray-400 w-48 h-8"></div>
                            </div>
                        </div>
                        <div className="flex-1 text-right">
                            <div className="relative inline-block">
                                <p className="font-semibold text-lg text-gray-800">{data.managerName}</p>
                                <p className="text-gray-700 mt-1">{data.managerDesignation}</p>
                                <div className="absolute -top-12 stamp_imp">
                                    <img src={logo} alt="Company Stamp" className="w-20 h-17 opacity-80" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-auto pt-6 border-t border-gray-300">
                    <div className="text-center text-sm text-gray-600">
                        <h2 className="text-2xl font-bold text-gray-800 tracking-wide mb-1">{data.companyName || 'Timely Healthtech Private Limited'}</h2>
                        <p className="font-semibold text-gray-700 mb-2">Flat No: 301, 3rd Floor, Sri Sai Balaji Avenue, Arunodaya Colony, Madhapur, Hyderabad</p>
                        <div className="flex justify-center items-center gap-4 text-xs font-medium text-gray-700">
                            <span>Email: {data.companyEmail || 'hello@timelyhealth.com'}</span>
                            <span>|</span>
                            <span>Mobile: {data.companyPhone || '+91 9010481048'}</span>
                            <span>|</span>
                            <span>Website: {data.companyWebsite || 'www.timelyhealth.in'}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ─── Sent Letter Modal ────────────────────────────────────────────────────
    const SentLetterView = () => {
        if (!viewingLetter) return null;
        const letterDataForView = viewingLetter.content || viewingLetter;
        const isExperience = viewingLetter.letterType === 'experience';
        return (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
                <div className="flex items-center justify-center min-h-screen p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 16 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 rounded-t-2xl flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <FaFileAlt className="text-blue-600" />
                                    {viewingLetter.letterType === 'experience' ? 'Experience' : 'Relieving'} Letter
                                </h3>
                                <p className="text-sm text-gray-500">{viewingLetter.employeeName} — {viewingLetter.employeeId}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleDownloadPDF(viewLetterRef, `${viewingLetter.letterType}-letter-${viewingLetter.employeeName?.replace(/\s/g, '-')}`)}
                                    className="px-3 py-1.5 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1.5"
                                >
                                    <FaDownload className="text-xs" /> PDF
                                </button>
                                <button onClick={handleCloseSentLetterView} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <FaTimes className="text-gray-500" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            {isExperience
                                ? <ExperienceLetter data={letterDataForView} ref={viewLetterRef} />
                                : <RelievingLetter data={letterDataForView} ref={viewLetterRef} />
                            }
                        </div>
                        <div className="sticky bottom-0 bg-gray-50 px-6 py-3 border-t border-gray-200 rounded-b-2xl flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>Status: <span className="font-semibold text-green-600">Sent</span></span>
                                {viewingLetter.sentAt && (
                                    <span>Sent on: {new Date(viewingLetter.sentAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                )}
                            </div>
                            <button
                                onClick={handleCloseSentLetterView}
                                className="px-4 py-1.5 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                            >
                                <FaArrowLeft className="text-xs" /> Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    };

    // ─── Main Render ──────────────────────────────────────────────────────────
    return (
        <div className="emp-dash">
            <main className="p-2 sm:p-4 lg:p-6">

                {/* ── Page Header ── */}
                <div className="emp-dash__header">
                    <div className="flex items-baseline gap-3 flex-wrap">
                        <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
                            Letters <span>Section</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchEmployees}
                            disabled={loading}
                            className="emp-dash__date-pill cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all"
                        >
                            <FaSpinner className={loading ? 'animate-spin text-blue-600' : 'text-blue-600'} />
                            <span>Refresh</span>
                        </button>
                        <div className="emp-dash__date-pill">
                            <FiCalendar />
                            <span>
                                {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── KPI Stat Cards ── */}
                {!loading && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                        {/* Total Employees */}
                        <div className="emp-dash__stat">
                            <div className="emp-dash__stat-top">
                                <span className="emp-dash__stat-label">Employees</span>
                                <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                                    <FiUsers className="text-blue-500" />
                                </div>
                            </div>
                            <div className="emp-dash__stat-value">{employees.length}</div>
                            <div className="emp-dash__stat-meta">Total staff 👥</div>
                        </div>

                        {/* Experience Letter */}
                        <div
                            className={`emp-dash__stat cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] ${letterType === 'experience' && selectedEmployee ? 'ring-2 ring-blue-400 shadow-lg' : ''}`}
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
                            <div className="emp-dash__stat-meta">tap to select 📄</div>
                        </div>

                        {/* Relieving Letter */}
                        <div
                            className={`emp-dash__stat cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] ${letterType === 'relieving' && selectedEmployee ? 'ring-2 ring-amber-400 shadow-lg' : ''}`}
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
                            <div className="emp-dash__stat-meta">tap to select 📋</div>
                        </div>

                        {/* Sent Letters */}
                        <div className="emp-dash__stat col-span-2 lg:col-span-1">
                            <div className="emp-dash__stat-top">
                                <span className="emp-dash__stat-label">Sent Letters</span>
                                <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                                    <FiSend className="text-rose-500" />
                                </div>
                            </div>
                            <div className="emp-dash__stat-value">{sentLetters.length}</div>
                            <div className="emp-dash__stat-meta">for this employee ✉️</div>
                        </div>
                    </div>
                )}

                {/* ── Alert messages ── */}
                <AnimatePresence>
                    {successMessage && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm font-medium"
                        >
                            <FaCheckCircle className="text-green-500 shrink-0" />
                            {successMessage}
                        </motion.div>
                    )}
                    {error && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm font-medium"
                        >
                            <FaTimes className="text-red-500 shrink-0" />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Employee Search & Selection Card ── */}
                <div className="emp-dash__card mb-6">
                    {/* Card Header */}
                    <div className="emp-dash__card-header">
                        <div>
                            <h3 className="emp-dash__card-title flex items-center gap-2">
                                <FiUsers className="text-blue-600" />
                                Select Employee
                            </h3>
                            <p className="emp-dash__card-desc">Search and pick an employee to generate letters</p>
                        </div>
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

                    {/* Search */}
                    <div className="emp-dash__card-body bg-gray-50/50">
                        <div className="relative mb-4">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <FaSearch className="text-xs" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search by name, ID, email, role, or department..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        {/* Employee Table */}
                        <div className="emp-dash__table-wrap hidden sm:block border border-gray-100 rounded-xl overflow-hidden">
                            <table className="emp-dash__table">
                                <thead>
                                    <tr>
                                        <th className="text-center w-10">#</th>
                                        <th>Employee</th>
                                        <th>Department</th>
                                        <th>Role</th>
                                        <th className="text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="py-10 text-center">
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <div className="emp-dash__spinner"></div>
                                                    <span className="text-sm font-medium text-gray-500">Loading employees...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredEmployees.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-10 text-center text-gray-500 text-sm">
                                                {searchTerm ? 'No employees match your search.' : 'No employees available.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        <AnimatePresence>
                                            {filteredEmployees.map((emp, index) => (
                                                <motion.tr
                                                    key={emp._id || emp.employeeId}
                                                    initial={{ opacity: 0, y: 6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: Math.min(index * 0.02, 0.4) }}
                                                    className={`hover:bg-gray-50/60 transition-all group cursor-pointer ${selectedEmployee?._id === emp._id ? 'bg-blue-50/40' : ''}`}
                                                    onClick={() => handleEmployeeSelect(emp)}
                                                >
                                                    <td className="text-center font-bold text-gray-400">{index + 1}</td>
                                                    <td className="whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-600">
                                                                {(emp.name || '?').charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                                    {emp.name}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400 font-medium">{emp.employeeId || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5 text-gray-600">
                                                            <FaBuilding className="text-[10px]" />
                                                            <span className="font-medium">{emp.department || '—'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap">
                                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                                                            {emp.role || emp.designation || '—'}
                                                        </span>
                                                    </td>
                                                    <td className="text-right whitespace-nowrap">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleEmployeeSelect(emp); }}
                                                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all transform hover:scale-105 shadow-sm border ${
                                                                selectedEmployee?._id === emp._id
                                                                    ? 'bg-green-500 text-white border-green-400 hover:bg-green-600'
                                                                    : 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700'
                                                            }`}
                                                        >
                                                            {selectedEmployee?._id === emp._id ? '✓ Selected' : 'Select'}
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card List */}
                        <div className="sm:hidden divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                            {loading ? (
                                <div className="py-10 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="emp-dash__spinner"></div>
                                        <span className="text-sm text-gray-500">Loading...</span>
                                    </div>
                                </div>
                            ) : filteredEmployees.length === 0 ? (
                                <div className="py-10 text-center text-gray-500 text-sm font-medium">No employees found</div>
                            ) : (
                                filteredEmployees.map((emp) => (
                                    <div
                                        key={emp._id || emp.employeeId}
                                        className={`p-4 hover:bg-gray-50/60 transition-all cursor-pointer ${selectedEmployee?._id === emp._id ? 'bg-blue-50/40' : ''}`}
                                        onClick={() => handleEmployeeSelect(emp)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-600">
                                                    {(emp.name || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 text-sm">{emp.name}</h4>
                                                    <span className="text-xs text-gray-400">{emp.employeeId || 'N/A'} · {emp.department || '—'}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEmployeeSelect(emp); }}
                                                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors border ${
                                                    selectedEmployee?._id === emp._id
                                                        ? 'bg-green-500 text-white border-green-400'
                                                        : 'bg-blue-600 text-white border-blue-500'
                                                }`}
                                            >
                                                {selectedEmployee?._id === emp._id ? '✓' : 'Select'}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer count */}
                        {!loading && filteredEmployees.length > 0 && (
                            <div className="flex items-center justify-between gap-2 px-2 pt-3 text-xs text-gray-500 font-medium">
                                <span>Showing <span className="text-gray-900 font-bold">{filteredEmployees.length}</span> employees</span>
                                {selectedEmployee && (
                                    <span className="flex items-center gap-1 text-blue-600 font-semibold">
                                        <FaCheckCircle className="text-xs" />
                                        {selectedEmployee.name} selected
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Letter Editor & Preview ── */}
                {selectedEmployee && !showSentLetterView && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="emp-dash__card mb-6"
                    >
                        {/* Letter Header */}
                        <div className="emp-dash__card-header">
                            <div>
                                <h2 className="emp-dash__card-title flex items-center gap-2">
                                    <FaFileAlt className="text-blue-600" />
                                    {letterType === 'experience' ? 'Experience Letter' : 'Relieving Letter'}
                                </h2>
                                <p className="emp-dash__card-desc">
                                    {selectedEmployee.name} — {selectedEmployee.employeeId}
                                </p>
                                {currentLetterMeta && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                                            currentLetterMeta.status === 'sent'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {currentLetterMeta.status === 'sent' ? '✉️ Sent' : '📝 Draft'}
                                        </span>
                                        {currentLetterMeta.sentAt && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
                                                Sent {new Date(currentLetterMeta.sentAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                                >
                                    {isEditing ? <FaTimes className="text-[10px]" /> : <FaEdit className="text-[10px]" />}
                                    {isEditing ? 'Cancel' : 'Edit'}
                                </button>
                                <button
                                    onClick={handleSaveLetter}
                                    disabled={saving || sending}
                                    className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 border border-green-500 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {saving ? <FaSpinner className="animate-spin text-[10px]" /> : <FaSave className="text-[10px]" />}
                                    Save
                                </button>
                                <button
                                    onClick={handleSendLetter}
                                    disabled={saving || sending}
                                    className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 border border-blue-500 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {sending ? <FaSpinner className="animate-spin text-[10px]" /> : <FaPaperPlane className="text-[10px]" />}
                                    Send
                                </button>
                                <button
                                    onClick={() => handleDownloadPDF(letterRef, `${letterType}-letter-${letterData.employeeName?.replace(/\s/g, '-')}`)}
                                    className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 border border-purple-500 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1.5"
                                >
                                    <FaDownload className="text-[10px]" /> PDF
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="px-3 py-1.5 text-xs font-semibold text-white bg-gray-600 border border-gray-500 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1.5"
                                >
                                    <FaPrint className="text-[10px]" /> Print
                                </button>
                            </div>
                        </div>

                        {/* Edit Form */}
                        <AnimatePresence>
                            {isEditing && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="emp-dash__card-body bg-gray-50/50 border-b border-gray-100">
                                        <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                                            <FaEdit className="text-blue-500" /> Edit Letter Details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {[
                                                { label: 'Employee Name', name: 'employeeName', type: 'text' },
                                                { label: 'Employee ID', name: 'employeeId', type: 'text' },
                                                { label: 'Designation', name: 'designation', type: 'text' },
                                                { label: 'Department', name: 'department', type: 'text' },
                                                { label: 'Employee Location', name: 'employeeLocation', type: 'text', placeholder: 'e.g., Hyderabad' },
                                                { label: 'Joining Date', name: 'joiningDate', type: 'text', placeholder: 'e.g., 3 Mar 2025' },
                                                { label: 'Relieving Date', name: 'relievingDate', type: 'text', placeholder: 'e.g., 14 May 2026' },
                                                { label: 'Date', name: 'date', type: 'text' },
                                                { label: 'Manager Name', name: 'managerName', type: 'text' },
                                                { label: 'Manager Designation', name: 'managerDesignation', type: 'text' },
                                            ].map(({ label, name, type, placeholder }) => (
                                                <div key={name}>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                                                    <input
                                                        type={type}
                                                        name={name}
                                                        value={letterData[name] || ''}
                                                        onChange={handleInputChange}
                                                        placeholder={placeholder}
                                                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                                    />
                                                </div>
                                            ))}

                                            {/* Gender */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
                                                <select
                                                    name="gender"
                                                    value={letterData.gender || 'male'}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                                >
                                                    <option value="male">Male (Mr.)</option>
                                                    <option value="female">Female (Ms.)</option>
                                                </select>
                                            </div>

                                            {/* Reason for Leaving */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Reason for Leaving</label>
                                                <input
                                                    type="text"
                                                    name="reasonForLeaving"
                                                    value={letterData.reasonForLeaving}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., to pursue other career opportunities"
                                                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                                />
                                            </div>

                                            {/* Experience body */}
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Experience Letter Body / Duties</label>
                                                <textarea
                                                    name="experienceBody"
                                                    value={letterData.experienceBody || ''}
                                                    onChange={handleInputChange}
                                                    rows={4}
                                                    placeholder="Enter responsibilities or custom body for the experience letter..."
                                                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white resize-none"
                                                />
                                            </div>

                                            {/* Relieving body */}
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Relieving Letter Body</label>
                                                <textarea
                                                    name="relievingBody"
                                                    value={letterData.relievingBody || ''}
                                                    onChange={handleInputChange}
                                                    rows={4}
                                                    placeholder="Enter custom body for the relieving letter..."
                                                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Letter Preview */}
                        <div className="emp-dash__card-body print-only">
                            {letterType === 'experience'
                                ? <ExperienceLetter data={letterData} ref={letterRef} />
                                : <RelievingLetter data={letterData} ref={letterRef} />
                            }
                        </div>

                        {/* ── Sent Letters Section ── */}
                        <div className="border-t border-gray-100">
                            <div className="emp-dash__card-header">
                                <div>
                                    <h3 className="emp-dash__card-title flex items-center gap-2">
                                        <FiSend className="text-blue-600" />
                                        Sent Letters
                                    </h3>
                                    <p className="emp-dash__card-desc">Letters already dispatched for this employee</p>
                                </div>
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                                    {sentLetters.length} sent
                                </span>
                            </div>

                            <div className="emp-dash__card-body">
                                {sentLetters.length === 0 ? (
                                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 text-center">
                                        <FiSend className="text-3xl text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500 font-medium">No letters sent yet</p>
                                        <p className="text-xs text-gray-400 mt-1">Save a draft and click Send when ready</p>
                                    </div>
                                ) : (
                                    <div className="emp-dash__table-wrap hidden sm:block border border-gray-100 rounded-xl overflow-hidden">
                                        <table className="emp-dash__table">
                                            <thead>
                                                <tr>
                                                    <th>Type</th>
                                                    <th>Status</th>
                                                    <th>Sent On</th>
                                                    <th className="text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <AnimatePresence>
                                                    {sentLetters.map((letter, index) => (
                                                        <motion.tr
                                                            key={letter._id}
                                                            initial={{ opacity: 0, y: 6 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: index * 0.05 }}
                                                            className="hover:bg-gray-50/60 transition-all group"
                                                        >
                                                            <td className="whitespace-nowrap">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] bg-blue-100 text-blue-600 font-bold">
                                                                        {letter.letterType === 'experience' ? '📄' : '📋'}
                                                                    </div>
                                                                    <span className="font-semibold text-gray-900 capitalize group-hover:text-blue-600 transition-colors">
                                                                        {letter.letterType}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-100">
                                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                                    {letter.status}
                                                                </span>
                                                            </td>
                                                            <td className="whitespace-nowrap">
                                                                <div className="flex flex-col">
                                                                    <span className="font-semibold text-gray-800">
                                                                        {letter.sentAt
                                                                            ? new Date(letter.sentAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                                                            : '—'}
                                                                    </span>
                                                                    {letter.sentAt && (
                                                                        <span className="text-[10px] text-gray-400">
                                                                            {new Date(letter.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="text-right whitespace-nowrap">
                                                                <button
                                                                    onClick={() => handleViewExistingLetter(letter)}
                                                                    className="p-2 rounded-lg transition-all transform hover:scale-110 shadow-sm border bg-blue-600 text-white hover:bg-blue-700 border-blue-500"
                                                                    title="View letter"
                                                                >
                                                                    <FaEye className="text-xs" />
                                                                </button>
                                                            </td>
                                                        </motion.tr>
                                                    ))}
                                                </AnimatePresence>
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Mobile Sent Letters */}
                                {sentLetters.length > 0 && (
                                    <div className="sm:hidden divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden mt-3">
                                        {sentLetters.map((letter) => (
                                            <div key={letter._id} className="p-4 hover:bg-gray-50/60 transition-all">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 text-sm capitalize">{letter.letterType} Letter</h4>
                                                        <span className="text-xs text-gray-400">
                                                            {letter.sentAt
                                                                ? new Date(letter.sentAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                                                : '—'}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleViewExistingLetter(letter)}
                                                        className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                                                    >
                                                        <FaEye className="text-[10px]" /> View
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── Sent Letter View Modal ── */}
                <AnimatePresence>
                    {showSentLetterView && <SentLetterView />}
                </AnimatePresence>

            </main>
        </div>
    );
};

export default LettersSection;