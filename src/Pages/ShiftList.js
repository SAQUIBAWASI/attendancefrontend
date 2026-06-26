// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function ShiftList() {
//   const [shifts, setShifts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const fetchShifts = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get("https://api.timelyhealth.inapi/shifts/all");
//       setShifts(res.data);
//     } catch (err) {
//       alert("❌ Failed to load shifts");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchShifts();
//   }, []);

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this shift?")) return;

//     try {
//       await axios.delete(`https://api.timelyhealth.inapi/shifts/${id}`);
//       alert("✅ Shift deleted successfully");
//       fetchShifts();
//     } catch (err) {
//       alert("❌ Failed to delete shift");
//       console.error(err);
//     }
//   };

//   return (
//     <div className="min-h-screen p-6 bg-white">
//       <div className="max-w-5xl p-6 mx-auto bg-white shadow-lg rounded-2xl">
//         <div className="flex items-center justify-between mb-6">
//           <h1 className="text-2xl font-bold text-gray-700">Assigned Shifts</h1>
//           <button
//             onClick={() => navigate("/shift")}
//             className="px-4 py-2 text-gray-900 bg-blue-600 rounded-lg hover:bg-blue-700"
//           >
//             + Assign New Shift
//           </button>
//         </div>

//         {loading ? (
//           <div className="py-8 text-center text-gray-500">Loading shifts...</div>
//         ) : shifts.length === 0 ? (
//           <div className="py-10 text-center text-gray-500">
//             No shifts assigned yet.
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full border border-gray-200 rounded-lg">
//               <thead>
//                 <tr className="text-sm font-semibold text-left text-gray-700 bg-gray-100">
//                   <th className="px-4 py-3 border-b">Employee ID</th>
//                   <th className="px-4 py-3 border-b">Employee Name</th>
//                   <th className="px-4 py-3 border-b">Shift Type</th>
//                   <th className="px-4 py-3 border-b">Start Time</th>
//                   <th className="px-4 py-3 border-b">End Time</th>
//                   <th className="px-4 py-3 text-center border-b">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {shifts.map((shift) => (
//                   <tr
//                     key={shift._id}
//                     className="text-sm text-gray-700 border-b hover:bg-white"
//                   >
//                     <td className="px-4 py-3">{shift.employeeId}</td>
//                     <td className="px-4 py-3">{shift.employeeName}</td>
//                     <td className="px-4 py-3 font-semibold text-blue-700">
//                       Shift {shift.shiftType}
//                     </td>
//                     <td className="px-4 py-3">{shift.startTime}</td>
//                     <td className="px-4 py-3">{shift.endTime}</td>
//                     <td className="flex justify-center gap-2 px-4 py-3 text-center">
//                       <button
//                         onClick={() => navigate(`/edit-shift/${shift._id}`)}
//                         className="px-3 py-1 text-gray-900 bg-yellow-400 rounded-lg hover:bg-yellow-500"
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDelete(shift._id)}
//                         className="px-3 py-1 text-gray-900 bg-red-600 rounded-lg hover:bg-red-700"
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { FiClock, FiEdit, FiPlus, FiTrash2, FiUsers, FiFilter, FiCalendar, FiActivity } from "react-icons/fi";
import { FaSearch, FaBuilding } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import "../index.css";
import "./EmployeeDashboard.css";

export default function ShiftList() {
  const [shifts, setShifts] = useState([]);
  const [filteredShifts, setFilteredShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/shifts/all`);

      console.log("Shifts API Response:", res.data);

      // ✅ Safely extract array even if wrapped inside an object
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.data || res.data.shifts || [];

      setShifts(data);
    } catch (err) {
      alert("❌ Failed to load shifts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  useEffect(() => {
    let result = [...shifts];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(s =>
        s.employeeName?.toLowerCase().includes(q) ||
        (s.employeeId && String(s.employeeId).toLowerCase().includes(q))
      );
    }
    setFilteredShifts(result);
  }, [searchTerm, shifts]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shift?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/shifts/${id}`);
      alert("✅ Shift deleted successfully");
      fetchShifts(); // Refresh list after deletion
    } catch (err) {
      alert("❌ Failed to delete shift");
      console.error(err);
    }
  };

  return (
    <div className="emp-dash">
      <main className="p-4 sm:p-6 lg:p-8">
        {/* Dashboard Header */}
        <div className="emp-dash__header">
          <div>
            <h1 className="emp-dash__greeting">
              Shift <span>Management</span>
            </h1>
            <p className="emp-dash__subtitle">
              View and manage employee shift assignments
            </p>
          </div>
          <div className="emp-dash__date-pill">
            <FiCalendar />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Top KPI Stats Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
            <div className="emp-dash__stat">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Total Shifts</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                  <FiClock className="text-blue-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">{shifts.length}</div>
              <div className="emp-dash__stat-meta">assigned shifts</div>
            </div>

            <div className="emp-dash__stat">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Active Employees</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                  <FiUsers className="text-amber-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">{shifts.length}</div>
              <div className="emp-dash__stat-meta">employees with shifts</div>
            </div>

            <div className="emp-dash__stat">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Shift Types</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                  <FiActivity className="text-rose-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">{[...new Set(shifts.map(s => s.shiftType))].length}</div>
              <div className="emp-dash__stat-meta">different shift types</div>
            </div>
          </div>
        )}

        {/* Filters Card */}
        <div className="emp-dash__card mb-6">
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title flex items-center gap-2">
                <FiFilter className="text-blue-600" /> Filter Shifts
              </h3>
              <p className="emp-dash__card-desc">Search by employee name or ID</p>
            </div>
            <button
              onClick={() => navigate("/shift")}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
            >
              <FiPlus className="w-4 h-4" />
              Assign New Shift
            </button>
          </div>
          <div className="emp-dash__card-body bg-gray-50/50">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[240px]">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FaSearch className="text-xs" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name or employee ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shifts Table / Card Container */}
        <div className="emp-dash__card mb-6">
          
          {/* Desktop Table View */}
          <div className="emp-dash__table-wrap">
            <table className="emp-dash__table">
              <thead>
                <tr>
                  <th className="text-center w-12">#</th>
                  <th>Employee</th>
                  <th>Shift Type</th>
                  <th className="text-center">Start Time</th>
                  <th className="text-center">End Time</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="emp-dash__spinner"></div>
                        <span className="text-sm font-medium text-gray-500">Loading shifts...</span>
                      </div>
                    </td>
                  </tr>
                ) : !Array.isArray(shifts) || shifts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FiUsers className="text-4xl text-gray-300" />
                        <p className="text-gray-500 font-medium">No shifts assigned yet</p>
                        <p className="text-gray-400 text-xs">Click "Assign New Shift" to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {filteredShifts.map((shift, index) => (
                      <motion.tr
                        key={shift._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.03, 0.5) }}
                        className="hover:bg-gray-55/60 transition-all group"
                      >
                        {/* Row Number */}
                        <td className="text-center font-bold text-gray-400 whitespace-nowrap">
                          {index + 1}
                        </td>

                        {/* Employee */}
                        <td className="whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-600">
                              {shift.employeeName?.charAt(0).toUpperCase() || 'E'}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {shift.employeeName}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">
                                {shift.employeeId || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Shift Type */}
                        <td className="whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 rounded-full border border-blue-200">
                            <FiClock className="w-3 h-3 mr-1.5" />
                            Shift {shift.shiftType}
                          </span>
                        </td>

                        {/* Start Time */}
                        <td className="text-center whitespace-nowrap">
                          <span className="font-bold text-gray-800">{shift.startTime}</span>
                        </td>

                        {/* End Time */}
                        <td className="text-center whitespace-nowrap">
                          <span className="font-bold text-gray-800">{shift.endTime}</span>
                        </td>

                        {/* Actions */}
                        <td className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => navigate(`/edit-shift/${shift._id}`)}
                              className="p-2 rounded-lg transition-all transform hover:scale-110 shadow-sm border bg-amber-500 text-white hover:bg-amber-600 border-amber-400"
                              title="Edit"
                            >
                              <FiEdit className="text-sm" />
                            </button>
                            <button
                              onClick={() => handleDelete(shift._id)}
                              className="p-2 rounded-lg transition-all transform hover:scale-110 shadow-sm border bg-red-500 text-white hover:bg-red-600 border-red-400"
                              title="Delete"
                            >
                              <FiTrash2 className="text-sm" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="emp-dash__mobile-list divide-y divide-gray-100">
            {loading ? (
              <div className="py-10 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="emp-dash__spinner"></div>
                  <span className="text-sm font-medium text-gray-500">Loading shifts...</span>
                </div>
              </div>
            ) : !Array.isArray(shifts) || shifts.length === 0 ? (
              <div className="py-12 text-center text-gray-500 font-medium">
                No shifts assigned yet
              </div>
            ) : (
              filteredShifts.map((shift) => (
                <div
                  key={shift._id}
                  className="p-4 hover:bg-gray-55/60 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-600">
                        {shift.employeeName?.charAt(0).toUpperCase() || 'E'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{shift.employeeName}</h4>
                        <span className="text-xs text-gray-500">{shift.employeeId || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => navigate(`/edit-shift/${shift._id}`)}
                        className="p-2 rounded-lg transition-all shadow-sm border bg-amber-500 text-white hover:bg-amber-600 border-amber-400"
                        title="Edit"
                      >
                        <FiEdit className="text-xs" />
                      </button>
                      <button
                        onClick={() => handleDelete(shift._id)}
                        className="p-2 rounded-lg transition-all shadow-sm border bg-red-500 text-white hover:bg-red-600 border-red-400"
                        title="Delete"
                      >
                        <FiTrash2 className="text-xs" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3 text-gray-600">
                    <div><span className="text-gray-400">Shift Type:</span> Shift {shift.shiftType}</div>
                    <div><span className="text-gray-400">Start:</span> {shift.startTime}</div>
                    <div><span className="text-gray-400">End:</span> {shift.endTime}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {!loading && Array.isArray(shifts) && shifts.length > 0 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs font-semibold text-gray-500">
                Showing <span className="text-gray-900 font-bold">{filteredShifts.length}</span> assigned shifts
              </p>
              <div className="flex items-center gap-3 text-[10px] font-semibold text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-400 rounded-full"></span> Active Shifts</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
