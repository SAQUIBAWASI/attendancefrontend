import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import {
  FaMoneyBillWave,
  FaCalendarAlt,
  FaRoute,
  FaClipboardList,
  FaShoppingCart,
  FaChartLine,
  FaCommentDots,
  FaPlus,
  FaHistory,
  FaCog,
  FaSync,
  FaTimes,
  FaEye,
  FaInfoCircle,
  FaTrash
} from 'react-icons/fa';

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kmRate, setKmRate] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  //   const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const [formData, setFormData] = useState({
    purpose: '',
    date: new Date().toISOString().split('T')[0],
    km: '',
    remark: ''
  });

  const [stops, setStops] = useState([
    { locationName: '', outcome: '', orderValue: '', upsellValue: '', km: '' }
  ]);

  const employeeId = localStorage.getItem('employeeId');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [expensesRes, rateRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/expense/my?employeeId=${employeeId}`),
        axios.get(`${API_BASE_URL}/expense/rate`)
      ]);

      if (expensesRes.data.success) setExpenses(expensesRes.data.data);
      if (rateRes.data.success) {
        setKmRate(rateRes.data.rate);
      }
    } catch (error) {
      console.error("Error fetching expense data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // We calculate totalKm before submit so we can use it
    const parsedKm = formData.km ? parseFloat(formData.km) : 0;
    const stopsKm = stops.reduce((sum, stop) => sum + (parseFloat(stop.km) || 0), 0);
    const totalKm = stopsKm > 0 ? stopsKm : parsedKm;

    if (!formData.purpose || totalKm <= 0 || !formData.date) {
      alert("Please fill in purpose, distance, and date.");
      return;
    }

    // Validation for stops
    for (let i = 0; i < stops.length; i++) {
        if (!stops[i].locationName.trim()) {
            alert(`Please provide a Location/Sample Name for Stop ${i + 1}.`);
            return;
        }
    }

    setSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/expense/add`, {
        ...formData,
        km: totalKm,
        stops,
        employeeId
      });

      if (res.data.success) {
        setExpenses([res.data.expense, ...expenses]);
        setFormData({
          purpose: '',
          date: new Date().toISOString().split('T')[0],
          km: '',
          remark: ''
        });
        setStops([{ locationName: '', outcome: '', orderValue: '', upsellValue: '', km: '' }]);
        setIsModalOpen(false);
        alert("Expense recorded successfully!");
      }
    } catch (error) {
      console.error("Error submitting expense:", error);
      alert("Failed to record expense. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };


  const parsedKm = formData.km ? parseFloat(formData.km) : 0;
  const stopsKm = stops.reduce((sum, stop) => sum + (parseFloat(stop.km) || 0), 0);
  const totalKm = stopsKm > 0 ? stopsKm : parsedKm;
  const calculatedCost = (totalKm * kmRate).toFixed(2);

  const handleStopChange = (index, field, value) => {
    const newStops = [...stops];
    newStops[index][field] = value;
    setStops(newStops);
  };

  const addStop = () => {
    setStops([...stops, { locationName: '', outcome: '', orderValue: '', upsellValue: '', km: '' }]);
  };

  const removeStop = (index) => {
    if (stops.length > 1) {
      const newStops = stops.filter((_, i) => i !== index);
      setStops(newStops);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      {/* Page content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="w-full p-6 bg-white rounded-lg shadow-md">
          <div className="flex flex-col gap-4 mb-6 md:flex-row md:justify-between md:items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-blue-900">
                My Expense Records
              </h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 text-sm font-bold text-white transition-all bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
              >
                + Record Expense
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="px-3 py-1.5 bg-gray-50 border rounded-lg flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Rate:</span>
                <span className="text-sm font-bold text-blue-600">₹{kmRate}/KM</span>
              </div>
            </div>
          </div>


          {expenses.length === 0 && !loading ? (
            <p className="text-gray-500">No expense records found.</p>
          ) : (
            <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
              <table className="min-w-full">
                <thead className="text-sm text-left text-white bg-gradient-to-r from-purple-500 to-blue-600">
                  <tr>
                    <th className="px-4 py-3">Purpose & Date</th>
                    <th className="px-4 py-3 text-center">Distance</th>
                    <th className="px-4 py-3 text-center">Outcome</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">{expense.purpose}</span>
                          <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <FaCalendarAlt className="text-[10px]" /> {new Date(expense.date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center font-medium text-gray-600">
                        {expense.km} KM
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mb-1">
                            {expense.stops && expense.stops.length > 0 ? `${expense.stops.length} Stops` : 'Single Stop'}
                          </span>
                          <span className="text-xs font-semibold text-gray-700 max-w-[120px] truncate" title={expense.outcome || (expense.stops?.length ? expense.stops[0]?.outcome : '-')}>
                            {expense.outcome || (expense.stops?.length ? expense.stops[0]?.outcome : '-')}
                          </span>
                          <div className="flex flex-col gap-1 mt-1">
                            {expense.orderValue > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[8px] font-bold rounded uppercase tabular-nums">Order: ₹{expense.orderValue}</span>
                              </div>
                            )}
                            {expense.upsellValue > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[8px] font-bold rounded uppercase tabular-nums">Upsell: ₹{expense.upsellValue}</span>
                              </div>
                            )}
                            {expense.stops && expense.stops.some(s => s.km > 0) && (
                              <div className="flex items-center gap-1">
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[8px] font-bold rounded uppercase tabular-nums">From Stops</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-gray-900">₹{expense.totalAmount}</span>
                          <span className="text-[9px] text-gray-300">@{expense.rateApplied}/km</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center font-medium">
                        <button
                          onClick={() => setSelectedExpense(expense)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {loading && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Record Expense Modal - EXACT Match with Leave Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="w-full max-w-3xl p-6 bg-white rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 text-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Record Expense</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 text-left">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Purpose of Travel</label>
                  <input
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="e.g., Client meeting"
                    required
                  />
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="text-left">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Total KM Traveled</label>
                  <div className="w-full p-2 bg-gray-50 border rounded-lg text-gray-600 font-medium tabular-nums flex items-center justify-between">
                    <span>{totalKm} KM</span>
                    {stopsKm > 0 && <span className="text-[10px] text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded">Calculated from stops</span>}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 border rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Estimated Cost:</span>
                <span className="text-lg font-bold text-blue-600 tabular-nums">₹{calculatedCost}</span>
              </div>

              {/* Dynamic Stops Section */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <FaRoute className="text-blue-500" /> Stops / Samples
                    </h4>
                    <button
                        type="button"
                        onClick={addStop}
                        className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors uppercase"
                    >
                        <FaPlus /> Add Stop
                    </button>
                </div>

                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
                    {stops.map((stop, index) => (
                        <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-xl relative group">
                            {stops.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeStop(index)}
                                    className="absolute -top-2 -right-2 w-7 h-7 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-all shadow-md z-10 border-2 border-white"
                                    title="Remove Stop"
                                >
                                    <FaTimes size={14} />
                                </button>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="text-left">
                                    <label className="block mb-1 text-[11px] font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                                        <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-[9px] mr-1">{index + 1}</span>
                                        Location / Sample Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={stop.locationName}
                                        onChange={(e) => handleStopChange(index, 'locationName', e.target.value)}
                                        className="w-full px-2 py-1.5 text-xs text-gray-800 border rounded-lg focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400 font-medium"
                                        placeholder="e.g., KPHB Branch"
                                        required
                                    />
                                </div>

                                <div className="text-left">
                                    <label className="block mb-1 text-[11px] font-semibold text-gray-500">Meeting Outcome</label>
                                    <input
                                        type="text"
                                        value={stop.outcome}
                                        onChange={(e) => handleStopChange(index, 'outcome', e.target.value)}
                                        className="w-full px-2 py-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
                                        placeholder="Discussed requirements"
                                    />
                                </div>

                                <div className="md:col-span-2 grid grid-cols-3 gap-4 text-left">
                                    <div>
                                        <label className="block mb-1 text-[11px] font-semibold text-gray-500 uppercase tracking-tight">Distance (KM)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={stop.km}
                                            onChange={(e) => handleStopChange(index, 'km', e.target.value)}
                                            className="w-full px-2 py-1.5 text-xs border border-blue-200 bg-blue-50 text-blue-700 font-bold rounded-lg focus:ring-1 focus:ring-blue-500 tabular-nums"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-[11px] font-semibold text-gray-500 uppercase tracking-tight">Order Value (₹)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={stop.orderValue}
                                            onChange={(e) => handleStopChange(index, 'orderValue', e.target.value)}
                                            className="w-full px-2 py-1.5 text-xs border border-green-200 bg-green-50 text-green-700 font-bold rounded-lg focus:ring-1 focus:ring-green-500 tabular-nums"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-[11px] font-semibold text-gray-500 uppercase tracking-tight">Upsell Value (₹)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={stop.upsellValue}
                                            onChange={(e) => handleStopChange(index, 'upsellValue', e.target.value)}
                                            className="w-full px-2 py-1.5 text-xs border border-purple-200 bg-purple-50 text-purple-700 font-bold rounded-lg focus:ring-1 focus:ring-purple-500 tabular-nums"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 text-left">Remark</label>
                <textarea
                  name="remark"
                  value={formData.remark}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Additional notes"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-bold"
                >
                  {submitting ? "Submitting..." : "Submit Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Details Modal - Match Sleek Record Modal UI */}
      {selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="w-full max-w-3xl p-6 bg-white rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 text-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Expense Details</h3>
              <button onClick={() => setSelectedExpense(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 text-left">
                <label className="block mb-1 text-sm font-medium text-gray-500">Purpose of Travel</label>
                <div className="w-full p-2 bg-gray-50 border rounded-lg text-gray-800 font-bold">
                  {selectedExpense.purpose}
                </div>
              </div>

              <div className="text-left">
                <label className="block mb-1 text-sm font-medium text-gray-500">Date</label>
                <div className="w-full p-2 bg-gray-50 border rounded-lg text-gray-800 font-medium">
                  {new Date(selectedExpense.date).toLocaleDateString()}
                </div>
              </div>
              <div className="text-left">
                <label className="block mb-1 text-sm font-medium text-gray-500">KM Traveled</label>
                <div className="w-full p-2 bg-gray-50 border rounded-lg text-gray-800 font-medium tabular-nums">
                  {selectedExpense.km} KM
                </div>
              </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Total Amount:</span>
                <div className="text-right">
                  <span className="text-xl font-black text-blue-700 tabular-nums block">₹{selectedExpense.totalAmount}</span>
                  <span className="text-[10px] text-blue-300 uppercase font-bold tracking-wider">@{selectedExpense.rateApplied}/km</span>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-500 text-left border-b pb-1">Stops / Samples Visited</label>
                <div className="space-y-3 max-h-[25vh] overflow-y-auto pr-1">
                    {selectedExpense.stops && selectedExpense.stops.length > 0 ? (
                        selectedExpense.stops.map((stop, index) => (
                            <div key={index} className="bg-white border hover:border-blue-300 rounded-xl p-3 shadow-sm transition-all relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                <div className="flex items-start justify-between mb-2 pl-2">
                                    <div className="flex-1">
                                        <h5 className="text-[13px] font-bold text-gray-800 flex items-center gap-1.5">
                                            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-black">{index + 1}</span>
                                            {stop.locationName}
                                        </h5>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mb-2 pl-2 tabular-nums">Outcome: <span className="font-medium text-gray-700">{stop.outcome || '-'}</span></p>
                                <div className="grid grid-cols-3 gap-2 pl-2">
                                    <div className="bg-blue-50 rounded px-2 py-1 border border-blue-100 flex justify-between items-center">
                                        <span className="text-[9px] font-bold text-blue-600 uppercase">Distance</span>
                                        <span className="text-xs font-black text-blue-700">{stop.km || 0} KM</span>
                                    </div>
                                    <div className="bg-emerald-50 rounded px-2 py-1 border border-emerald-100 flex justify-between items-center">
                                        <span className="text-[9px] font-bold text-emerald-600 uppercase">Order</span>
                                        <span className="text-xs font-black text-emerald-700">₹{stop.orderValue || 0}</span>
                                    </div>
                                    <div className="bg-purple-50 rounded px-2 py-1 border border-purple-100 flex justify-between items-center">
                                        <span className="text-[9px] font-bold text-purple-600 uppercase">Upsell</span>
                                        <span className="text-xs font-black text-purple-700">₹{stop.upsellValue || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center p-4 border border-dashed rounded-lg bg-gray-50">
                            <p className="text-xs text-gray-500">No detailed stops recorded for this expense.</p>
                            
                            {/* Fallback to old data format if no stops array exist */}
                            {(selectedExpense.outcome || selectedExpense.orderValue > 0 || selectedExpense.upsellValue > 0) && (
                                <div className="mt-4 text-left text-[11px] space-y-2 max-w-xs mx-auto">
                                    <div className="flex justify-between border-b pb-1">
                                        <span className="text-gray-500">Outcome:</span>
                                        <span className="font-semibold text-gray-700">{selectedExpense.outcome || '-'}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-1 text-emerald-700">
                                        <span className="font-semibold opacity-80">Order:</span>
                                        <span className="font-black tabular-nums">₹{selectedExpense.orderValue || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-purple-700">
                                        <span className="font-semibold opacity-80">Upsell:</span>
                                        <span className="font-black tabular-nums">₹{selectedExpense.upsellValue || 0}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-500 text-left">Remark</label>
                <div className="w-full p-2 bg-gray-50 border rounded-lg text-gray-700 text-xs min-h-[60px] text-left">
                  {selectedExpense.remark || '-'}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedExpense(null)}
                  className="w-full py-2 bg-gray-900 text-white rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-all active:scale-[0.98]"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        // </div>
      )}
    </div>
  );
};

export default ExpenseManagement;
