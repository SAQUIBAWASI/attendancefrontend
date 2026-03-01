import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, API_DOMAIN } from '../config';
import { FaPlus, FaBriefcase, FaBuilding, FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillWave, FaFilePdf, FaTimes } from 'react-icons/fa';

function MyJobs() {
  const [experiences, setExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    role: '',
    location: '',
    salary: '',
    startDate: '',
    endDate: '',
    offerLetter: null,
    payslip: null
  });
  const [errorMsg, setErrorMsg] = useState('');

  const fetchExperiences = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('candidateToken');
      const response = await axios.get(`${API_BASE_URL}/candidate/experience`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setExperiences(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching experiences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    // Validation
    if (!formData.companyName || !formData.role || !formData.startDate || !formData.salary || !formData.location) {
      setErrorMsg("Please fill all required fields.");
      setIsSubmitting(false);
      return;
    }

    const submitData = new FormData();
    submitData.append('companyName', formData.companyName);
    submitData.append('role', formData.role);
    submitData.append('location', formData.location);
    submitData.append('salary', formData.salary);
    submitData.append('startDate', formData.startDate);
    if (formData.endDate) submitData.append('endDate', formData.endDate);

    if (formData.offerLetter) submitData.append('offerLetter', formData.offerLetter);
    if (formData.payslip) submitData.append('payslip', formData.payslip);

    try {
      const token = localStorage.getItem('candidateToken');
      const response = await axios.post(`${API_BASE_URL}/candidate/experience`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        // Refresh list and close modal
        fetchExperiences();
        setIsModalOpen(false);
        setFormData({
          companyName: '', role: '', location: '', salary: '', startDate: '', endDate: '', offerLetter: null, payslip: null
        });
      }
    } catch (error) {
      console.error("Error submitting experience:", error);
      setErrorMsg(error.response?.data?.message || "An error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const baseURL = API_DOMAIN;

  return (
    <div className="w-full min-h-screen bg-transparent p-4 md:p-6 lg:p-8 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <span className="bg-indigo-100 text-indigo-700 p-2.5 rounded-xl">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path><path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"></path></svg>
            </span>
            Employee Journey
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Record and manage your previous work experiences.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm shadow-indigo-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Add Experience
        </button>
      </div>

      {/* Content Area */}
      <div>
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-2 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : experiences.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="bg-gray-50 max-w-max mx-auto p-4 rounded-full mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Experience Added Yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">Build your professional profile by adding your previous roles, accomplishments, and documents.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-6 py-2 rounded-xl font-bold transition-colors"
            >
              Add Your First Role
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {experiences.map((exp, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-indigo-100 transition-colors group">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex gap-4">
                    <div className="hidden sm:flex bg-indigo-50 text-indigo-600 w-12 h-12 rounded-xl items-center justify-center flex-shrink-0">
                      <span className="font-bold text-lg">{exp.companyName.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900">{exp.role}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 text-sm font-medium text-gray-600">
                        <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>{exp.companyName}</span>
                        <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>{exp.location}</span>
                        <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>{formatDate(exp.startDate)} - {formatDate(exp.endDate)}</span>
                        <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"></path></svg>{exp.salary}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-gray-100 md:border-0">
                    {exp.offerLetter && (
                      <a href={`${baseURL}/${exp.offerLetter.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-bold uppercase transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Offer Letter
                      </a>
                    )}
                    {exp.payslip && (
                      <a href={`${baseURL}/${exp.payslip.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-bold uppercase transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Payslip
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-900">Add Working Experience</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6">
              {errorMsg && (
                <div className="mb-6 bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium border border-red-100 flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Company Name *</label>
                    <input required name="companyName" value={formData.companyName} onChange={handleInputChange} type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-sm font-medium" placeholder="E.g. TechCorp Inc." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Role / Job Title *</label>
                    <input required name="role" value={formData.role} onChange={handleInputChange} type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-sm font-medium" placeholder="E.g. Software Engineer" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Location *</label>
                    <input required name="location" value={formData.location} onChange={handleInputChange} type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-sm font-medium" placeholder="City, Country" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Salary (CTC) *</label>
                    <input required name="salary" value={formData.salary} onChange={handleInputChange} type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-sm font-medium" placeholder="E.g. $80,000 / Year" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Start Date *</label>
                    <input required name="startDate" value={formData.startDate} onChange={handleInputChange} type="date" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-sm font-medium text-gray-700" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex justify-between">
                      <span>End Date</span>
                      <span className="text-gray-400 font-normal lowercase tracking-normal">(Leave blank if current)</span>
                    </label>
                    <input name="endDate" value={formData.endDate} onChange={handleInputChange} type="date" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-sm font-medium text-gray-700" />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Upload Offer Letter</label>
                    <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 hover:border-indigo-300 transition-colors cursor-pointer group">
                      <input type="file" name="offerLetter" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.png,.jpg,.jpeg" />
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className={`p-2 rounded-full ${formData.offerLetter ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100'}`}>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        </div>
                        <span className="text-xs font-bold text-gray-700 truncate max-w-full px-2">
                          {formData.offerLetter ? formData.offerLetter.name : "Click or drag file here"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Upload Payslip</label>
                    <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 hover:border-indigo-300 transition-colors cursor-pointer group">
                      <input type="file" name="payslip" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.png,.jpg,.jpeg" />
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className={`p-2 rounded-full ${formData.payslip ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100'}`}>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <span className="text-xs font-bold text-gray-700 truncate max-w-full px-2">
                          {formData.payslip ? formData.payslip.name : "Click or drag file here"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors text-sm"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm shadow-indigo-200 text-sm flex items-center justify-center min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      "Save Experience"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyJobs;