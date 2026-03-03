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
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-9xl mx-auto animate-in fade-in duration-700">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
              <span className="bg-white p-2.5 rounded-2xl shadow-sm border border-indigo-50 text-indigo-600">
                <FaBriefcase className="w-6 h-6" />
              </span>
              Employee Journey
            </h1>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mt-2">Record and manage your previous work experiences.</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-indigo-100 active:scale-95"
          >
            <FaPlus className="text-sm" /> Add Experience
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-hidden bg-white shadow-xl rounded-3xl border border-gray-100">
          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : experiences.length === 0 ? (
            <div className="p-20 text-center">
              <div className="bg-gray-50 max-w-max mx-auto p-6 rounded-[2rem] mb-6 border-2 border-dashed border-gray-200">
                <FaBuilding className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 uppercase tracking-widest">No Experience Added Yet</h3>
              <p className="text-xs font-medium text-gray-400 mt-3 uppercase tracking-widest leading-loose max-w-xs mx-auto">
                Build your professional profile by adding your previous roles, accomplishments, and documents.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-8 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-6 py-2.5 rounded-xl font-bold transition-colors uppercase text-xs tracking-widest"
              >
                Add Your First Role
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-green-500 to-blue-600 text-white text-center uppercase tracking-wider text-xs font-semibold">
                    <th className="py-2.5 px-8">Designation & Company</th>
                    <th className="py-2.5 px-6">Location</th>
                    <th className="py-2.5 px-6">Duration</th>
                    <th className="py-2.5 px-6">Salary (CTC)</th>
                    <th className="py-2.5 px-8">Documents</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-center">
                  {experiences.map((exp, idx) => (
                    <tr key={idx} className="group hover:bg-indigo-50/20 transition-all duration-300">
                      <td className="py-2 px-8">
                        <div className="flex items-center justify-center gap-3">
                          <div className="hidden sm:flex bg-indigo-50 text-indigo-600 w-8 h-8 rounded-lg items-center justify-center flex-shrink-0 font-bold text-xs">
                            {exp.companyName.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-sm text-gray-800 uppercase tracking-tight">{exp.role}</div>
                            <div className="text-[10px] text-blue-500 uppercase tracking-widest mt-0.5 font-semibold flex items-center gap-1">
                              <FaBuilding size={8} /> {exp.companyName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-6">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <FaMapMarkerAlt className="text-orange-400" size={10} />
                          {exp.location}
                        </div>
                      </td>
                      <td className="py-2 px-6">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-tight">
                            <FaCalendarAlt className="text-blue-400" size={10} />
                            {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-6">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-100 uppercase tracking-wider">
                          <FaMoneyBillWave size={10} /> {exp.salary}
                        </div>
                      </td>
                      <td className="py-2 px-8">
                        <div className="flex items-center justify-center gap-2">
                          {exp.offerLetter && (
                            <a
                              href={`${baseURL}/${exp.offerLetter.replace(/\\/g, '/')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-all shadow-sm group/btn"
                              title="Offer Letter"
                            >
                              <FaFilePdf size={14} />
                            </a>
                          )}
                          {exp.payslip && (
                            <a
                              href={`${baseURL}/${exp.payslip.replace(/\\/g, '/')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-all shadow-sm group/btn"
                              title="Payslip"
                            >
                              <FaFilePdf size={14} />
                            </a>
                          )}
                          {!exp.offerLetter && !exp.payslip && (
                            <span className="text-[10px] font-medium text-gray-400 uppercase italic">No docs</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
              <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 text-indigo-700 p-2 rounded-xl">
                    <FaPlus size={16} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Add Working Experience</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-rose-500 hover:bg-rose-50 w-8 h-8 rounded-full flex items-center justify-center transition-all">
                  <FaTimes size={16} />
                </button>
              </div>

              <div className="p-8">
                {errorMsg && (
                  <div className="mb-6 bg-rose-50 text-rose-700 p-4 rounded-xl text-xs font-bold border border-rose-100 flex items-start gap-3 uppercase tracking-wider animate-in shake duration-300">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Company Name *</label>
                      <input required name="companyName" value={formData.companyName} onChange={handleInputChange} type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-semibold text-gray-700 placeholder:text-gray-300 shadow-sm" placeholder="E.g. TechCorp Inc." />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Role / Job Title *</label>
                      <input required name="role" value={formData.role} onChange={handleInputChange} type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-semibold text-gray-700 placeholder:text-gray-300 shadow-sm" placeholder="E.g. Software Engineer" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Location *</label>
                      <input required name="location" value={formData.location} onChange={handleInputChange} type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-semibold text-gray-700 placeholder:text-gray-300 shadow-sm" placeholder="City, Country" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Salary (CTC) *</label>
                      <input required name="salary" value={formData.salary} onChange={handleInputChange} type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-semibold text-gray-700 placeholder:text-gray-300 shadow-sm" placeholder="E.g. $80,000 / Year" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Start Date *</label>
                      <input required name="startDate" value={formData.startDate} onChange={handleInputChange} type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-semibold text-gray-700 shadow-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1 flex justify-between">
                        <span>End Date</span>
                        <span className="text-gray-400 font-normal lowercase tracking-normal">(Blank = Current)</span>
                      </label>
                      <input name="endDate" value={formData.endDate} onChange={handleInputChange} type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-semibold text-gray-700 shadow-sm" />
                    </div>
                  </div>

                  <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Offer Letter</label>
                      <div className="relative border-2 border-dashed border-gray-100 rounded-2xl p-4 text-center hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer group shadow-sm bg-gray-50/30">
                        <input type="file" name="offerLetter" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.png,.jpg,.jpeg" />
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className={`p-2 rounded-xl transition-all ${formData.offerLetter ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-gray-400 group-hover:text-blue-500 shadow-sm'}`}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                          </div>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate max-w-full px-2">
                            {formData.offerLetter ? formData.offerLetter.name : "Select Offer Letter"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Payslip</label>
                      <div className="relative border-2 border-dashed border-gray-100 rounded-2xl p-4 text-center hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer group shadow-sm bg-gray-50/30">
                        <input type="file" name="payslip" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.png,.jpg,.jpeg" />
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className={`p-2 rounded-xl transition-all ${formData.payslip ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-gray-400 group-hover:text-blue-500 shadow-sm'}`}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </div>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate max-w-full px-2">
                            {formData.payslip ? formData.payslip.name : "Select Payslip"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 flex justify-end gap-3 border-t border-gray-50">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-all text-xs uppercase tracking-widest"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 text-xs uppercase tracking-widest flex items-center justify-center min-w-[160px] active:scale-95"
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
    </div>
  );
}

export default MyJobs;