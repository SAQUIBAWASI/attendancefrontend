// import axios from "axios";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function ShiftAssignment() {
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     employeeId: "",
//     employeeName: "",
//     shiftType: "",
//     startTime: "",
//     endTime: "",
//   });

//   const shifts = {
//     A: { startTime: "06:00", endTime: "14:00" },
//     B: { startTime: "14:00", endTime: "22:00" },
//     C: { startTime: "22:00", endTime: "06:00" },
//   };

//   const handleShiftChange = (shift) => {
//     setFormData({
//       ...formData,
//       shiftType: shift,
//       startTime: shifts[shift].startTime,
//       endTime: shifts[shift].endTime,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.employeeId || !formData.employeeName || !formData.shiftType) {
//       alert("Please fill all fields");
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await axios.post(
//         "https://api.timelyhealth.in//api/shifts/assign",
//         formData
//       );

//       if (res.status === 200 || res.status === 201) {
//         alert("✅ Shift assigned successfully!");

//         // ✅ Store assigned shift in localStorage
//         localStorage.setItem("employeeShift", JSON.stringify({
//           employeeId: formData.employeeId,
//           employeeName: formData.employeeName,
//           shiftType: formData.shiftType,
//           startTime: formData.startTime,
//           endTime: formData.endTime,
//         }));

//         setFormData({
//           employeeId: "",
//           employeeName: "",
//           shiftType: "",
//           startTime: "",
//           endTime: "",
//         });

//         navigate("/shifts");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("❌ Failed to assign shift. Check your server connection.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
//       <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-2xl">
//         <h1 className="mb-4 text-xl font-bold text-center text-gray-800">
//           Assign Shift to Employee
//         </h1>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Employee ID */}
//           <div>
//             <label className="block mb-1 text-sm text-gray-700">
//               Employee ID *
//             </label>
//             <input
//               type="text"
//               value={formData.employeeId}
//               onChange={(e) =>
//                 setFormData({ ...formData, employeeId: e.target.value })
//               }
//               placeholder="Enter employee ID"
//               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>

//           {/* Employee Name */}
//           <div>
//             <label className="block mb-1 text-sm font-medium text-gray-700">
//               Employee Name *
//             </label>
//             <input
//               type="text"
//               value={formData.employeeName}
//               onChange={(e) =>
//                 setFormData({ ...formData, employeeName: e.target.value })
//               }
//               placeholder="Enter employee name"
//               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>

//           {/* Shift Type */}
//           <div>
//             <label className="block mb-2 text-sm font-medium text-gray-700">
//               Select Shift *
//             </label>
//             <div className="flex gap-3">
//               {["A", "B", "C"].map((shift) => (
//                 <button
//                   key={shift}
//                   type="button"
//                   onClick={() => handleShiftChange(shift)}
//                   className={`flex-1 py-2 rounded-lg border text-center font-semibold ${
//                     formData.shiftType === shift
//                       ? "bg-blue-600 text-white"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   }`}
//                 >
//                   Shift {shift}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Start & End Time */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 Start Time
//               </label>
//               <input
//                 type="time"
//                 value={formData.startTime}
//                 onChange={(e) =>
//                   setFormData({ ...formData, startTime: e.target.value })
//                 }
//                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 End Time
//               </label>
//               <input
//                 type="time"
//                 value={formData.endTime}
//                 onChange={(e) =>
//                   setFormData({ ...formData, endTime: e.target.value })
//                 }
//                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//           </div>

//           {/* Submit */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//           >
//             {loading ? "Assigning..." : "Assign Shift"}
//           </button>

//           {/* Cancel */}
//           <button
//             type="button"
//             onClick={() => navigate("/shifts")}
//             className="w-full py-2 mt-2 border rounded-lg hover:bg-gray-100"
//           >
//             Cancel
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// import axios from "axios";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function CreateShift() {
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     employeeId: "",
//     employeeName: "",
//     shiftType: "",
//     startTime: "",
//     endTime: "",
//   });

//   // ✅ Updated Shifts with New Timings
//   const shifts = {
//     A: { startTime: "10:00", endTime: "19:00" },
//     B: { startTime: "09:00", endTime: "19:00" },
//     C: { startTime: "07:00", endTime: "17:00" },
//     D: { startTime: "06:30", endTime: "16:00" },
//     E: { startTime: "14:00", endTime: "23:00" },
//     F: { startTime: "08:00", endTime: "18:00" },
//     G: { startTime: "10:30", endTime: "21:00" },
//     H: { startTime: "07:00", endTime: "13:00" },
//     I: { startTime: "11:00", endTime: "20:00" },
//   };

//   const handleShiftChange = (shift) => {
//     if (shift === "H") {
//       setFormData({
//         ...formData,
//         shiftType: shift,
//         startTime: "07:00 - 13:00",
//         endTime: "17:00 - 21:30",
//       });
//     } else {
//       setFormData({
//         ...formData,
//         shiftType: shift,
//         startTime: shifts[shift].startTime,
//         endTime: shifts[shift].endTime,
//       });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.employeeId || !formData.employeeName || !formData.shiftType) {
//       alert("Please fill all fields");
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await axios.post(
//         "https://api.timelyhealth.in/api/shifts/assign",
//         formData
//       );

//       if (res.status === 200 || res.status === 201) {
//         alert("✅ Shift created successfully!");

//         // ✅ Save shift locally
//         localStorage.setItem(
//           "employeeShift",
//           JSON.stringify({
//             employeeId: formData.employeeId,
//             employeeName: formData.employeeName,
//             shiftType: formData.shiftType,
//             startTime: formData.startTime,
//             endTime: formData.endTime,
//           })
//         );

//         // ✅ Clear form
//         setFormData({
//           employeeId: "",
//           employeeName: "",
//           shiftType: "",
//           startTime: "",
//           endTime: "",
//         });

//         // ✅ Navigate to shift list page
//         navigate("/shiftlist");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("❌ Failed to create shift. Check your server connection.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
//       <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-2xl">
//         <h1 className="mb-4 text-xl font-bold text-center text-gray-800">
//           Create Shift for Employee
//         </h1>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Employee ID */}
//           <div>
//             <label className="block mb-1 text-sm font-medium text-gray-700">
//               Employee ID *
//             </label>
//             <input
//               type="text"
//               value={formData.employeeId}
//               onChange={(e) =>
//                 setFormData({ ...formData, employeeId: e.target.value })
//               }
//               placeholder="Enter employee ID"
//               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>

//           {/* Employee Name */}
//           <div>
//             <label className="block mb-1 text-sm font-medium text-gray-700">
//               Employee Name *
//             </label>
//             <input
//               type="text"
//               value={formData.employeeName}
//               onChange={(e) =>
//                 setFormData({ ...formData, employeeName: e.target.value })
//               }
//               placeholder="Enter employee name"
//               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>

//           {/* Shift Type */}
//           <div>
//             <label className="block mb-2 text-sm font-medium text-gray-700">
//               Select Shift *
//             </label>
//             <div className="grid grid-cols-3 gap-3">
//               {Object.keys(shifts).map((shift) => (
//                 <button
//                   key={shift}
//                   type="button"
//                   onClick={() => handleShiftChange(shift)}
//                   className={`py-2 rounded-lg border text-center font-semibold ${
//                     formData.shiftType === shift
//                       ? "bg-blue-600 text-white"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   }`}
//                 >
//                   Shift {shift}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Start & End Time */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 Start Time
//               </label>
//               <input
//                 type="text"
//                 value={formData.startTime}
//                 readOnly
//                 className="w-full px-3 py-2 border rounded-lg bg-gray-50"
//               />
//             </div>
//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 End Time
//               </label>
//               <input
//                 type="text"
//                 value={formData.endTime}
//                 readOnly
//                 className="w-full px-3 py-2 border rounded-lg bg-gray-50"
//               />
//             </div>
//           </div>

//           {/* Submit */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//           >
//             {loading ? "Creating..." : "Create Shift"}
//           </button>

//           {/* Cancel */}
//           <button
//             type="button"
//             onClick={() => navigate("/shiftlist")}
//             className="w-full py-2 mt-2 border rounded-lg hover:bg-gray-100"
//           >
//             Cancel
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// src/Pages/ShiftDashboard.js
// src/Pages/ShiftDashboard.js
// src/Pages/ShiftDashboard.js
// src/Pages/ShiftManagement.js
// import axios from 'axios';
// import { useEffect, useState } from 'react';
// import { FaClock, FaEdit, FaEye, FaPlus, FaTimes, FaTrash, FaUser } from 'react-icons/fa';

// const ShiftManagement = () => {
//   const [masterShifts, setMasterShifts] = useState([]);
//   const [employeeAssignments, setEmployeeAssignments] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Modals
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showCustomCreateModal, setShowCustomCreateModal] = useState(false);
//   const [showAssignModal, setShowAssignModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(false);

//   // Data
//   const [editingAssignment, setEditingAssignment] = useState(null);
//   const [viewingShiftType, setViewingShiftType] = useState('');
//   const [viewEmployees, setViewEmployees] = useState([]);
//   const [viewShiftInfo, setViewShiftInfo] = useState({});

//   // Forms
//   const [createForm, setCreateForm] = useState({
//     shiftType: '',
//     shiftName: '',
//     timeSlots: [
//       { slotId: `${Date.now()}_1`, timeRange: '', description: '' },
//       { slotId: `${Date.now()}_2`, timeRange: '', description: '' },
//       { slotId: `${Date.now()}_3`, timeRange: '', description: '' },
//       { slotId: `${Date.now()}_4`, timeRange: '', description: '' }
//     ]
//   });

//   const [assignForm, setAssignForm] = useState({
//     employeeId: '',
//     employeeName: '',
//     shiftType: '',
//     selectedSlotId: ''
//   });

//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   // Fetch all data
//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       setError('');

//       console.log("🔄 Fetching data...");

//       // Fetch master shifts
//       const shiftsRes = await axios.get('https://api.timelyhealth.in/api/shifts/master');
//       console.log("Master shifts response:", shiftsRes.data);

//       if (shiftsRes.data.success) {
//         setMasterShifts(shiftsRes.data.data);
//       } else {
//         setError(shiftsRes.data.message);
//       }

//       // Fetch employee assignments
//       const assignedRes = await axios.get('https://api.timelyhealth.in/api/shifts/assignments');
//       console.log("Assignments response:", assignedRes.data);

//       if (assignedRes.data.success) {
//         setEmployeeAssignments(assignedRes.data.data);
//       }

//     } catch (error) {
//       console.error('❌ Fetch error:', error);
//       setError('Server connection failed. Check if backend is running.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // ✅ CREATE CUSTOM SHIFT (E, F, G, etc.)
//   const handleCreateCustomShift = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     try {
//       console.log("Creating custom shift:", createForm);

//       if (!createForm.shiftType || !createForm.shiftName) {
//         setError('Please enter shift type and name');
//         return;
//       }

//       // Validate time slots
//       const validSlots = createForm.timeSlots.filter(slot => 
//         slot.timeRange.trim() !== '' && slot.description.trim() !== ''
//       );

//       if (validSlots.length === 0) {
//         setError('Please add at least one time slot');
//         return;
//       }

//       const response = await axios.post('https://api.timelyhealth.in/api/shifts/create', {
//         shiftType: createForm.shiftType,
//         shiftName: createForm.shiftName,
//         timeSlots: validSlots
//       });

//       console.log("Create custom response:", response.data);

//       if (response.data.success) {
//         setSuccess(`✅ Custom Shift ${createForm.shiftType} created successfully!`);
//         fetchData();
//         setShowCustomCreateModal(false);
//         setCreateForm({
//           shiftType: '',
//           shiftName: '',
//           timeSlots: [
//             { slotId: `${Date.now()}_1`, timeRange: '', description: '' },
//             { slotId: `${Date.now()}_2`, timeRange: '', description: '' },
//             { slotId: `${Date.now()}_3`, timeRange: '', description: '' },
//             { slotId: `${Date.now()}_4`, timeRange: '', description: '' }
//           ]
//         });
//       } else {
//         setError(response.data.message);
//       }
//     } catch (error) {
//       console.error('Create custom error:', error);
//       setError(error.response?.data?.message || 'Failed to create custom shift');
//     }
//   };

//   // ✅ Add time slot
//   const addTimeSlot = () => {
//     setCreateForm(prev => ({
//       ...prev,
//       timeSlots: [
//         ...prev.timeSlots,
//         { slotId: `${Date.now()}_${prev.timeSlots.length + 1}`, timeRange: '', description: '' }
//       ]
//     }));
//   };

//   // ✅ Remove time slot
//   const removeTimeSlot = (index) => {
//     if (createForm.timeSlots.length > 1) {
//       const newSlots = [...createForm.timeSlots];
//       newSlots.splice(index, 1);
//       setCreateForm(prev => ({ ...prev, timeSlots: newSlots }));
//     }
//   };

//   // ✅ Update time slot
//   const updateTimeSlot = (index, field, value) => {
//     const newSlots = [...createForm.timeSlots];
//     newSlots[index] = { ...newSlots[index], [field]: value };
//     setCreateForm(prev => ({ ...prev, timeSlots: newSlots }));
//   };

//   // ✅ Get time slots for shift type
//   const getShiftTimeSlots = (shiftType) => {
//     const shift = masterShifts.find(s => s.shiftType === shiftType);
//     return shift?.timeSlots || [];
//   };

//   // ✅ Get employees count for shift type
//   const getEmployeesCount = (shiftType) => {
//     return employeeAssignments.filter(a => a.shiftType === shiftType).length;
//   };

//   // ✅ Get shift color
//   const getShiftColor = (type) => {
//     const colors = {
//       "A": "bg-blue-50 border-blue-200",
//       "B": "bg-green-50 border-green-200", 
//       "C": "bg-green-50 border-green-200",
//       "D": "bg-orange-50 border-orange-200",
//       "E": "bg-pink-50 border-pink-200",
//       "F": "bg-teal-50 border-teal-200",
//       "G": "bg-indigo-50 border-indigo-200",
//       "H": "bg-yellow-50 border-yellow-200",
//       "I": "bg-red-50 border-red-200",
//       "J": "bg-cyan-50 border-cyan-200"
//     };
//     return colors[type] || "bg-gray-50";
//   };

//   const getShiftTextColor = (type) => {
//     const colors = {
//       "A": "text-blue-800",
//       "B": "text-green-800",
//       "C": "text-green-800",
//       "D": "text-orange-800",
//       "E": "text-pink-800",
//       "F": "text-teal-800",
//       "G": "text-indigo-800",
//       "H": "text-yellow-800",
//       "I": "text-red-800",
//       "J": "text-cyan-800"
//     };
//     return colors[type] || "text-gray-800";
//   };

//   // ✅ Get time range from assignment (legacy or new)
//   const getEmployeeTimeRange = (assignment) => {
//     if (assignment.employeeAssignment?.selectedTimeRange) {
//       return assignment.employeeAssignment.selectedTimeRange;
//     } else if (assignment.startTime && assignment.endTime) {
//       return `${assignment.startTime} - ${assignment.endTime}`;
//     }
//     return "Not specified";
//   };

//   // ✅ ASSIGN SHIFT FUNCTION - FIXED VERSION
//   const handleAssignShift = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     try {
//       const { employeeId, employeeName, shiftType, selectedSlotId } = assignForm;

//       if (!employeeId || !employeeName || !shiftType) {
//         setError('Please fill all required fields');
//         return;
//       }

//       // Get time slot details
//       let selectedTimeRange = "10:00 - 19:00";
//       let selectedDescription = "Morning shift";

//       if (selectedSlotId) {
//         const timeSlots = getShiftTimeSlots(shiftType);
//         const selectedSlot = timeSlots.find(slot => slot.slotId === selectedSlotId);
//         if (selectedSlot) {
//           selectedTimeRange = selectedSlot.timeRange;
//           selectedDescription = selectedSlot.description;
//         }
//       }

//       console.log("📝 Assigning shift with data:", {
//         employeeId,
//         employeeName,
//         shiftType,
//         selectedSlotId,
//         selectedTimeRange,
//         selectedDescription
//       });

//       // ✅ API call
//       const response = await axios.post('https://api.timelyhealth.in/api/shifts/assign', {
//         employeeId,
//         employeeName,
//         shiftType,
//         selectedSlotId,
//         selectedTimeRange,
//         selectedDescription
//       });

//       console.log("📱 Assign API response:", response.data);

//       if (response.data.success) {
//         setSuccess(`✅ Shift assigned to ${employeeName} successfully!`);
//         fetchData();
//         setShowAssignModal(false);
//         setAssignForm({
//           employeeId: '',
//           employeeName: '',
//           shiftType: '',
//           selectedSlotId: ''
//         });
//       } else {
//         setError(response.data.message || 'Failed to assign shift');
//       }
//     } catch (error) {
//       console.error('❌ Assign error:', error);
//       setError(error.response?.data?.message || 'Failed to assign shift');
//     }
//   };

//   // ✅ UPDATE ASSIGNMENT FUNCTION
//   const handleUpdateAssignment = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     try {
//       const { employeeName, shiftType, selectedSlotId } = assignForm;

//       if (!employeeName || !shiftType) {
//         setError('Please fill all required fields');
//         return;
//       }

//       // Get time slot details
//       let selectedTimeRange = "10:00 - 19:00";
//       let selectedDescription = "Morning shift";

//       if (selectedSlotId) {
//         const timeSlots = getShiftTimeSlots(shiftType);
//         const selectedSlot = timeSlots.find(slot => slot.slotId === selectedSlotId);
//         if (selectedSlot) {
//           selectedTimeRange = selectedSlot.timeRange;
//           selectedDescription = selectedSlot.description;
//         }
//       }

//       console.log("📝 Updating assignment:", {
//         id: editingAssignment._id,
//         employeeName,
//         shiftType,
//         selectedSlotId,
//         selectedTimeRange,
//         selectedDescription
//       });

//       const response = await axios.put(
//         `https://api.timelyhealth.in/api/shifts/assignments/${editingAssignment._id}`,
//         {
//           employeeName,
//           shiftType,
//           selectedSlotId,
//           selectedTimeRange: selectedTimeRange,
//           selectedDescription: selectedDescription
//         }
//       );

//       console.log("📱 Update API response:", response.data);

//       if (response.data.success) {
//         setSuccess('✅ Assignment updated successfully!');
//         fetchData();
//         setShowAssignModal(false);
//         setEditingAssignment(null);
//         setAssignForm({
//           employeeId: '',
//           employeeName: '',
//           shiftType: '',
//           selectedSlotId: ''
//         });
//       } else {
//         setError(response.data.message || 'Failed to update assignment');
//       }
//     } catch (error) {
//       console.error('❌ Update error:', error);
//       setError(error.response?.data?.message || 'Failed to update assignment');
//     }
//   };

//   // ✅ DELETE ASSIGNMENT
//   const handleDeleteAssignment = async (id) => {
//     if (window.confirm('Are you sure you want to delete this assignment?')) {
//       try {
//         const response = await axios.delete(`https://api.timelyhealth.in/api/shifts/assignments/${id}`);
//         if (response.data.success) {
//           setSuccess('Shift assignment removed successfully');
//           fetchData();
//         }
//       } catch (error) {
//         setError('Failed to delete assignment');
//       }
//     }
//   };

//   // ✅ DELETE MASTER SHIFT
//   const handleDeleteMasterShift = async (id, shiftName) => {
//     if (window.confirm(`Delete ${shiftName}? This will remove all assignments.`)) {
//       try {
//         const response = await axios.delete(`https://api.timelyhealth.in/api/shifts/master/${id}`);
//         if (response.data.success) {
//           setSuccess(response.data.message);
//           fetchData();
//         }
//       } catch (error) {
//         setError('Failed to delete shift');
//       }
//     }
//   };

//   // ✅ VIEW EMPLOYEES BY SHIFT TYPE
//   const handleViewEmployees = async (shiftType, shiftName) => {
//     try {
//       const response = await axios.get(`https://api.timelyhealth.in/api/shifts/type/${shiftType}/employees`);
//       if (response.data.success) {
//         setViewShiftInfo({
//           shiftType,
//           shiftName
//         });
//         setViewEmployees(response.data.data.employees);
//         setViewingShiftType(shiftType);
//         setShowViewModal(true);
//       }
//     } catch (error) {
//       setError('Failed to fetch employees');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
//         <p className="ml-4">Loading shifts...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">Shifts</h1>
//           {/* <p className="text-gray-600">Supporting A-Z shift types with legacy data</p> */}
//         </div>
//         <div className="flex gap-3">
//           {/* <button
//             onClick={() => setShowCreateModal(true)}
//             className="flex items-center gap-2 px-6 py-3 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
//           >
//             <FaPlus /> Quick Create (A-D)
//           </button> */}
//           <button
//             onClick={() => setShowCustomCreateModal(true)}
//             className="flex items-center gap-2 px-6 py-3 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
//           >
//             <FaPlus /> Custom Create (E-Z)
//           </button>
//           <button
//             onClick={() => setShowAssignModal(true)}
//             className="flex items-center gap-2 px-6 py-3 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//           >
//             <FaClock /> Assign Shift
//           </button>
//         </div>
//       </div>

//       {/* Messages */}
//       {error && (
//         <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
//           ❌ {error}
//         </div>
//       )}
//       {success && (
//         <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
//           ✅ {success}
//         </div>
//       )}

//       {/* ✅ 1. AVAILABLE SHIFTS SECTION - FIRST */}
//       <div className="mb-8">
//         <h2 className="mb-4 text-xl font-bold text-gray-800">Available Shifts ({masterShifts.length})</h2>
//         {masterShifts.length === 0 ? (
//           <div className="py-12 text-center rounded-lg bg-gray-50">
//             <div className="mb-4 text-6xl text-gray-400">⏰</div>
//             <h3 className="mb-2 text-xl font-semibold text-gray-600">No shifts created yet</h3>
//             <p className="mb-4 text-gray-500">Create your first shift to get started</p>
//             <button
//               onClick={() => setShowCreateModal(true)}
//               className="px-6 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
//             >
//               Create First Shift
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
//             {masterShifts.map((shift) => (
//               <div
//                 key={shift._id}
//                 className={`bg-white rounded-lg border p-4 shadow-sm ${getShiftColor(shift.shiftType)}`}
//               >
//                 <div className="flex items-start justify-between mb-2">
//                   <div className="flex-1">
//                     <h3 className={`text-lg font-bold ${getShiftTextColor(shift.shiftType)}`}>
//                       {shift.shiftName}
//                     </h3>
//                     <div className="flex items-center gap-2 mt-1">
//                       <span className={`px-2 py-1 text-xs rounded ${getShiftTextColor(shift.shiftType)}`}>
//                         Shift {shift.shiftType}
//                       </span>
//                       <span className="text-xs text-gray-500">
//                         {shift.timeSlots?.length || 0} slots
//                       </span>
//                     </div>

//                     {/* Time Slots Preview */}
//                     <div className="mt-2">
//                       <div className="space-y-1 overflow-y-auto max-h-16">
//                         {shift.timeSlots?.slice(0, 2).map((slot) => (
//                           <div key={slot.slotId} className="flex items-center gap-1 text-xs text-gray-600">
//                             <span>• {slot.timeRange}</span>
//                           </div>
//                         ))}
//                         {shift.timeSlots?.length > 2 && (
//                           <div className="text-xs text-gray-400">
//                             +{shift.timeSlots.length - 2} more
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => handleDeleteMasterShift(shift._id, shift.shiftName)}
//                     className="p-1 text-sm text-red-600 hover:text-red-800"
//                     title="Delete Shift"
//                   >
//                     <FaTimes />
//                   </button>
//                 </div>

//                 {/* Employee Count */}
//                 <div className="flex items-center justify-between pt-3 mt-3 border-t">
//                   <div className="flex items-center gap-2">
//                     <FaUser className="text-xs text-gray-500" />
//                     <span className="text-xs font-medium">
//                       {getEmployeesCount(shift.shiftType)} employees
//                     </span>
//                   </div>
//                   <div className="flex gap-1">
//                     <button
//                       onClick={() => handleViewEmployees(shift.shiftType, shift.shiftName)}
//                       disabled={getEmployeesCount(shift.shiftType) === 0}
//                       className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
//                         getEmployeesCount(shift.shiftType) > 0
//                           ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
//                           : 'bg-gray-100 text-gray-500 cursor-not-allowed'
//                       }`}
//                     >
//                       <FaEye className="text-xs" /> View
//                     </button>
//                     <button
//                       onClick={() => {
//                         setAssignForm({
//                           employeeId: '',
//                           employeeName: '',
//                           shiftType: shift.shiftType,
//                           selectedSlotId: ''
//                         });
//                         setEditingAssignment(null);
//                         setShowAssignModal(true);
//                       }}
//                       className="px-2 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700"
//                     >
//                       <FaPlus className="text-xs" /> Assign
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* ✅ 2. ALL ASSIGNED EMPLOYEES SECTION - SECOND */}
//       {employeeAssignments.length > 0 && (
//         <div className="mt-8">
//           <h2 className="mb-4 text-xl font-bold text-gray-800">All Assigned Employees ({employeeAssignments.length})</h2>
//           <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//             {employeeAssignments.map((assignment) => (
//               <div key={assignment._id} className={`bg-white p-3 rounded-lg border shadow-sm ${getShiftColor(assignment.shiftType)}`}>
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className={`px-2 py-1 text-xs font-medium rounded ${getShiftTextColor(assignment.shiftType)}`}>
//                         Shift {assignment.shiftType}
//                       </span>
//                     </div>
//                     <h3 className="text-sm font-bold text-gray-800">
//                       {assignment.employeeAssignment?.employeeName || assignment.employeeName}
//                     </h3>
//                     <p className="text-xs text-gray-600">
//                       ID: {assignment.employeeAssignment?.employeeId || assignment.employeeId}
//                     </p>

//                     {/* Time Slot Display */}
//                     <div className="p-2 mt-2 text-xs rounded bg-gray-50">
//                       <p className="font-medium text-gray-700">
//                         ⏰ <span className="font-bold">{getEmployeeTimeRange(assignment)}</span>
//                       </p>
//                       <p className="mt-1 text-gray-500">
//                         {assignment.employeeAssignment?.selectedDescription || "Legacy shift"}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex gap-1">
//                     <button
//                       onClick={() => {
//                         setEditingAssignment(assignment);
//                         setAssignForm({
//                           employeeId: assignment.employeeAssignment?.employeeId || assignment.employeeId,
//                           employeeName: assignment.employeeAssignment?.employeeName || assignment.employeeName,
//                           shiftType: assignment.shiftType,
//                           selectedSlotId: assignment.employeeAssignment?.selectedSlotId || ''
//                         });
//                         setShowAssignModal(true);
//                       }}
//                       className="p-1 text-sm text-blue-600 hover:text-blue-800"
//                       title="Edit"
//                     >
//                       <FaEdit />
//                     </button>
//                     <button
//                       onClick={() => handleDeleteAssignment(assignment._id)}
//                       className="p-1 text-sm text-red-600 hover:text-red-800"
//                       title="Delete"
//                     >
//                       <FaTrash />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* QUICK CREATE MODAL (A-D) */}
//       {/* {showCreateModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
//             <div className="flex items-center justify-between p-6 border-b">
//               <h3 className="text-xl font-semibold text-gray-800">Quick Create Shift (A-D)</h3>
//               <button onClick={() => setShowCreateModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">
//                 &times;
//               </button>
//             </div>

//             <form onSubmit={(e) => {
//               e.preventDefault();
//               // Quick create A-D shifts
//               const shiftType = createForm.shiftType;
//               if (!shiftType) {
//                 setError('Please select a shift type');
//                 return;
//               }

//               const shiftNames = {
//                 "A": "Morning Shift",
//                 "B": "Evening Shift", 
//                 "C": "Night Shift",
//                 "D": "General Shift"
//               };

//               setCreateForm(prev => ({ 
//                 ...prev, 
//                 shiftName: shiftNames[shiftType] || shiftType 
//               }));

//               // Simulate form submission
//               setTimeout(() => {
//                 const quickCreate = async () => {
//                   try {
//                     const response = await axios.post('https://api.timelyhealth.in/api/shifts/create', {
//                       shiftType: shiftType,
//                       shiftName: shiftNames[shiftType] || shiftType
//                     });

//                     if (response.data.success) {
//                       setSuccess(`✅ Shift ${shiftType} created successfully!`);
//                       fetchData();
//                       setShowCreateModal(false);
//                     }
//                   } catch (error) {
//                     setError(error.response?.data?.message || 'Failed to create shift');
//                   }
//                 };
//                 quickCreate();
//               }, 100);
//             }} className="p-6">
//               <div className="space-y-6">
//                 <div>
//                   <label className="block mb-3 text-sm font-medium text-gray-700">
//                     Select Shift Type (A-D)
//                   </label>
//                   <div className="grid grid-cols-2 gap-3">
//                     {["A", "B", "C", "D"].map((type) => (
//                       <button
//                         key={type}
//                         type="button"
//                         onClick={() => setCreateForm(prev => ({ 
//                           ...prev, 
//                           shiftType: type,
//                           shiftName: type === "A" ? "Morning Shift" : 
//                                    type === "B" ? "Evening Shift" : 
//                                    type === "C" ? "Night Shift" : 
//                                    "General Shift"
//                         }))}
//                         className={`p-4 rounded-lg border text-center ${
//                           createForm.shiftType === type
//                             ? `${getShiftColor(type)} border-2 border-blue-500`
//                             : 'bg-gray-100 hover:bg-gray-200'
//                         }`}
//                       >
//                         <div className="text-lg font-bold">Shift {type}</div>
//                         <div className="mt-1 text-sm">
//                           {type === "A" ? "Morning" : 
//                            type === "B" ? "Evening" : 
//                            type === "C" ? "Night" : "General"}
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">
//                     Shift Name
//                   </label>
//                   <input
//                     type="text"
//                     value={createForm.shiftName}
//                     readOnly
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
//                 <button
//                   type="button"
//                   onClick={() => setShowCreateModal(false)}
//                   className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
//                 >
//                   Create Shift
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )} */}

//       {/* CUSTOM CREATE MODAL (E-Z) */}
//       {showCustomCreateModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between p-6 border-b">
//               <h3 className="text-xl font-semibold text-gray-800">Create Custom Shift (E-Z or any letter)</h3>
//               <button onClick={() => setShowCustomCreateModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">
//                 &times;
//               </button>
//             </div>

//             <form onSubmit={handleCreateCustomShift} className="p-6">
//               <div className="space-y-6">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">
//                       Shift Type (Single letter E-Z) *
//                     </label>
//                     <input
//                       type="text"
//                       maxLength="1"
//                       value={createForm.shiftType}
//                       onChange={(e) => setCreateForm(prev => ({ 
//                         ...prev, 
//                         shiftType: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')
//                       }))}
//                       className="w-full px-4 py-2 text-sm uppercase border border-gray-300 rounded-lg"
//                       placeholder="E"
//                       required
//                     />
//                     <p className="mt-1 text-xs text-gray-500">Enter a single letter (E, F, G, H, etc.)</p>
//                   </div>

//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">
//                       Shift Name *
//                     </label>
//                     <input
//                       type="text"
//                       value={createForm.shiftName}
//                       onChange={(e) => setCreateForm(prev => ({ ...prev, shiftName: e.target.value }))}
//                       className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
//                       placeholder="e.g., Extended Shift E"
//                       required
//                     />
//                   </div>
//                 </div>

//                 {/* Time Slots Configuration */}
//                 <div>
//                   <div className="flex items-center justify-between mb-3">
//                     <label className="block text-sm font-medium text-gray-700">
//                       Configure Time Slots (Minimum 1 required) *
//                     </label>
//                     <button
//                       type="button"
//                       onClick={addTimeSlot}
//                       className="px-3 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700"
//                     >
//                       + Add Slot
//                     </button>
//                   </div>

//                   <div className="space-y-3">
//                     {createForm.timeSlots.map((slot, index) => (
//                       <div key={slot.slotId} className="p-3 border rounded-lg bg-gray-50">
//                         <div className="flex items-center justify-between mb-2">
//                           <span className="text-sm font-medium">Slot {index + 1}</span>
//                           {createForm.timeSlots.length > 1 && (
//                             <button
//                               type="button"
//                               onClick={() => removeTimeSlot(index)}
//                               className="text-xs text-red-600 hover:text-red-800"
//                             >
//                               Remove
//                             </button>
//                           )}
//                         </div>

//                         <div className="grid grid-cols-2 gap-3">
//                           <div>
//                             <label className="block mb-1 text-xs text-gray-600">Time Range *</label>
//                             <input
//                               type="text"
//                               value={slot.timeRange}
//                               onChange={(e) => updateTimeSlot(index, 'timeRange', e.target.value)}
//                               className="w-full px-3 py-2 text-xs border border-gray-300 rounded"
//                               placeholder="e.g., 10:00 - 19:00"
//                               required
//                             />
//                           </div>

//                           <div>
//                             <label className="block mb-1 text-xs text-gray-600">Description *</label>
//                             <input
//                               type="text"
//                               value={slot.description}
//                               onChange={(e) => updateTimeSlot(index, 'description', e.target.value)}
//                               className="w-full px-3 py-2 text-xs border border-gray-300 rounded"
//                               placeholder="e.g., Morning 10 to 7"
//                               required
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Preview */}
//                 {createForm.shiftType && createForm.timeSlots.some(s => s.timeRange) && (
//                   <div className="p-3 border border-blue-200 rounded bg-blue-50">
//                     <h4 className="mb-2 text-sm font-medium text-blue-800">Preview:</h4>
//                     <p className="text-sm text-blue-700">
//                       Shift {createForm.shiftType}: {createForm.shiftName}
//                     </p>
//                     <p className="mt-1 text-xs text-blue-600">
//                       {createForm.timeSlots.filter(s => s.timeRange).length} time slot(s) will be created.
//                     </p>
//                   </div>
//                 )}
//               </div>

//               <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
//                 <button
//                   type="button"
//                   onClick={() => setShowCustomCreateModal(false)}
//                   className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
//                 >
//                   Create Custom Shift
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ASSIGN SHIFT MODAL */}
//       {showAssignModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
//             <div className="flex items-center justify-between p-6 border-b">
//               <h3 className="text-xl font-semibold text-gray-800">
//                 {editingAssignment ? 'Edit Assignment' : 'Assign Shift'}
//               </h3>
//               <button onClick={() => setShowAssignModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">
//                 &times;
//               </button>
//             </div>

//             <form onSubmit={editingAssignment ? handleUpdateAssignment : handleAssignShift} className="p-6">
//               <div className="space-y-4">
//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">
//                     Employee ID {editingAssignment && '(Cannot change)'}
//                   </label>
//                   <input
//                     type="text"
//                     value={assignForm.employeeId}
//                     onChange={(e) => setAssignForm(prev => ({ ...prev, employeeId: e.target.value }))}
//                     className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
//                     placeholder="EMP001"
//                     required
//                     readOnly={!!editingAssignment}
//                   />
//                 </div>

//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">
//                     Employee Name *
//                   </label>
//                   <input
//                     type="text"
//                     value={assignForm.employeeName}
//                     onChange={(e) => setAssignForm(prev => ({ ...prev, employeeName: e.target.value }))}
//                     className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
//                     placeholder="John Doe"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">
//                     Select Shift Type *
//                   </label>
//                   <select
//                     value={assignForm.shiftType}
//                     onChange={(e) => setAssignForm(prev => ({ 
//                       ...prev, 
//                       shiftType: e.target.value,
//                       selectedSlotId: ''
//                     }))}
//                     className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
//                     required
//                   >
//                     <option value="">Select Shift Type</option>
//                     {masterShifts.map(shift => (
//                       <option key={shift._id} value={shift.shiftType}>
//                         Shift {shift.shiftType}: {shift.shiftName}
//                       </option>
//                     ))}
//                     {/* Legacy shift types that might not have master shift */}
//                     {employeeAssignments
//                       .map(a => a.shiftType)
//                       .filter((type, index, self) => 
//                         self.indexOf(type) === index && 
//                         !masterShifts.find(s => s.shiftType === type)
//                       )
//                       .map(type => (
//                         <option key={type} value={type}>
//                           Shift {type} (Legacy)
//                         </option>
//                       ))
//                     }
//                   </select>
//                 </div>

//                 {/* Time Slot Selection (only if master shift exists) */}
//                 {assignForm.shiftType && masterShifts.find(s => s.shiftType === assignForm.shiftType) && (
//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">
//                       Select Time Slot *
//                     </label>
//                     <div className="space-y-2 overflow-y-auto max-h-48">
//                       {getShiftTimeSlots(assignForm.shiftType).map((slot) => (
//                         <button
//                           key={slot.slotId}
//                           type="button"
//                           onClick={() => setAssignForm(prev => ({ ...prev, selectedSlotId: slot.slotId }))}
//                           className={`w-full p-3 text-left rounded-lg border flex justify-between items-center text-sm ${
//                             assignForm.selectedSlotId === slot.slotId
//                               ? 'bg-blue-50 border-blue-300'
//                               : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
//                           }`}
//                         >
//                           <div>
//                             <div className="font-medium">{slot.timeRange}</div>
//                             <div className="text-xs text-gray-500">{slot.description}</div>
//                           </div>
//                           {assignForm.selectedSlotId === slot.slotId && (
//                             <div className="text-blue-600">✓</div>
//                           )}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowAssignModal(false);
//                     setEditingAssignment(null);
//                     setAssignForm({
//                       employeeId: '',
//                       employeeName: '',
//                       shiftType: '',
//                       selectedSlotId: ''
//                     });
//                   }}
//                   className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//                 >
//                   {editingAssignment ? 'Update' : 'Assign'} Shift
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* VIEW EMPLOYEES MODAL - WITH CLOSE BUTTON */}
//       {showViewModal && viewEmployees.length > 0 && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
//             {/* Modal Header */}
//             <div className="flex items-center justify-between p-4 border-b">
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-800">
//                   {viewShiftInfo.shiftName} Employees
//                 </h3>
//                 <p className="text-sm text-gray-600">
//                   Shift {viewShiftInfo.shiftType} • {viewEmployees.length} employees
//                 </p>
//               </div>
//               <button 
//                 onClick={() => setShowViewModal(false)} 
//                 className="text-2xl text-gray-400 hover:text-gray-600"
//               >
//                 &times;
//               </button>
//             </div>

//             {/* Modal Body - Scrollable */}
//             <div className="flex-1 overflow-y-auto">
//               <table className="w-full">
//                 <thead className="sticky top-0 bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Employee</th>
//                     <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Time Slot</th>
//                     <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {viewEmployees.map((emp) => (
//                     <tr key={emp._id} className="hover:bg-gray-50">
//                       <td className="px-4 py-3">
//                         <div>
//                           <div className="text-sm font-medium">{emp.employeeAssignment?.employeeName || emp.employeeName}</div>
//                           <div className="text-xs text-gray-500">ID: {emp.employeeAssignment?.employeeId || emp.employeeId}</div>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3">
//                         {getEmployeeTimeRange(emp) !== "Not specified" ? (
//                           <div>
//                             <div className="text-sm font-medium">{getEmployeeTimeRange(emp)}</div>
//                             <div className="text-xs text-gray-500">{emp.employeeAssignment?.selectedDescription || "Legacy shift"}</div>
//                           </div>
//                         ) : (
//                           <span className="text-sm text-gray-400">Not assigned</span>
//                         )}
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => {
//                               setShowViewModal(false);
//                               setEditingAssignment(emp);
//                               setAssignForm({
//                                 employeeId: emp.employeeAssignment?.employeeId || emp.employeeId,
//                                 employeeName: emp.employeeAssignment?.employeeName || emp.employeeName,
//                                 shiftType: emp.shiftType,
//                                 selectedSlotId: emp.employeeAssignment?.selectedSlotId || ''
//                               });
//                               setShowAssignModal(true);
//                             }}
//                             className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
//                           >
//                             <FaEdit className="text-xs" /> Edit
//                           </button>
//                           <button
//                             onClick={() => handleDeleteAssignment(emp._id)}
//                             className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
//                           >
//                             <FaTrash className="text-xs" /> Remove
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Modal Footer */}
//             <div className="p-4 border-t">
//               <button
//                 onClick={() => setShowViewModal(false)}
//                 className="w-full py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-medium"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ShiftManagement;

// import axios from 'axios';
// import { useEffect, useState } from 'react';
// import { FaClock, FaEdit, FaEye, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
// const ShiftManagement = () => {
//   const [masterShifts, setMasterShifts] = useState([]);
//   const [employeeAssignments, setEmployeeAssignments] = useState([]);
//   const [employeeCounts, setEmployeeCounts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Modals
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showCustomCreateModal, setShowCustomCreateModal] = useState(false);
//   const [showAssignModal, setShowAssignModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(false);

//   // Data
//   const [editingAssignment, setEditingAssignment] = useState(null);
//   const [viewingShiftType, setViewingShiftType] = useState('');
//   const [viewEmployees, setViewEmployees] = useState([]);
//   const [viewShiftInfo, setViewShiftInfo] = useState({});

//   // Forms
//   const [createForm, setCreateForm] = useState({
//     shiftType: '',
//     shiftName: '',
//     timeSlots: [{ slotId: `${Date.now()}_1`, timeRange: '', description: '' }]
//   });

//   const [assignForm, setAssignForm] = useState({
//     employeeId: '',
//     employeeName: '',
//     shiftType: ''
//   });

//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   // Fetch all data
//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       setError('');

//       console.log("🔄 Fetching data...");

//       // Fetch master shifts
//       const shiftsRes = await axios.get('https://api.timelyhealth.in/api/shifts/master');

//       if (shiftsRes.data.success) {
//         setMasterShifts(shiftsRes.data.data);
//       } else {
//         setError(shiftsRes.data.message);
//       }

//       // Fetch employee assignments
//       const assignedRes = await axios.get('https://api.timelyhealth.in/api/shifts/assignments');

//       if (assignedRes.data.success) {
//         setEmployeeAssignments(assignedRes.data.data);
//       }

//       // Fetch employee counts by shift
//       const countRes = await axios.get('https://api.timelyhealth.in/api/shifts/employee-count');

//       if (countRes.data.success) {
//         setEmployeeCounts(countRes.data.data);
//       }

//     } catch (error) {
//       console.error('❌ Fetch error:', error);
//       setError('Server connection failed. Check if backend is running.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // ✅ CREATE CUSTOM SHIFT
//   const handleCreateCustomShift = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     try {
//       if (!createForm.shiftType || !createForm.shiftName) {
//         setError('Please enter shift type and name');
//         return;
//       }

//       // Validate time slot
//       const slot = createForm.timeSlots[0];
//       if (!slot.timeRange.trim() || !slot.description.trim()) {
//         setError('Please fill time slot details');
//         return;
//       }

//       const response = await axios.post('https://api.timelyhealth.in/api/shifts/create', {
//         shiftType: createForm.shiftType,
//         shiftName: createForm.shiftName,
//         timeSlots: [slot]
//       });

//       if (response.data.success) {
//         setSuccess(`✅ Custom Shift ${createForm.shiftType} created successfully!`);
//         fetchData();
//         setShowCustomCreateModal(false);
//         setCreateForm({
//           shiftType: '',
//           shiftName: '',
//           timeSlots: [{ slotId: `${Date.now()}_1`, timeRange: '', description: '' }]
//         });
//       } else {
//         setError(response.data.message);
//       }
//     } catch (error) {
//       console.error('Create custom error:', error);
//       setError(error.response?.data?.message || 'Failed to create custom shift');
//     }
//   };

//   // ✅ Update time slot
//   const updateTimeSlot = (field, value) => {
//     setCreateForm(prev => ({ 
//       ...prev, 
//       timeSlots: [{ ...prev.timeSlots[0], [field]: value }] 
//     }));
//   };

//   // ✅ Get time slot for shift type
//   const getShiftTimeSlot = (shiftType) => {
//     const shift = masterShifts.find(s => s.shiftType === shiftType);
//     return shift?.timeSlots?.[0] || null;
//   };

//   // ✅ Get employees count for shift type
//   const getEmployeesCount = (shiftType) => {
//     return employeeAssignments.filter(a => a.shiftType === shiftType).length;
//   };

//   // ✅ Get shift color
//   const getShiftColor = (type) => {
//     const colors = {
//       "A": "bg-blue-50 border-blue-200",
//       "B": "bg-green-50 border-green-200", 
//       "C": "bg-green-50 border-green-200",
//       "D": "bg-orange-50 border-orange-200",
//       "E": "bg-pink-50 border-pink-200",
//       "F": "bg-teal-50 border-teal-200",
//       "G": "bg-indigo-50 border-indigo-200",
//       "H": "bg-yellow-50 border-yellow-200",
//       "I": "bg-red-50 border-red-200",
//       "J": "bg-cyan-50 border-cyan-200"
//     };
//     return colors[type] || "bg-gray-50 border-gray-200";
//   };

//   const getShiftTextColor = (type) => {
//     const colors = {
//       "A": "text-blue-800",
//       "B": "text-green-800",
//       "C": "text-green-800",
//       "D": "text-orange-800",
//       "E": "text-pink-800",
//       "F": "text-teal-800",
//       "G": "text-indigo-800",
//       "H": "text-yellow-800",
//       "I": "text-red-800",
//       "J": "text-cyan-800"
//     };
//     return colors[type] || "text-gray-800";
//   };

//   // ✅ Get row background color
//   const getRowBgColor = (type) => {
//     const colors = {
//       "A": "bg-blue-50 hover:bg-blue-100",
//       "B": "bg-green-50 hover:bg-green-100", 
//       "C": "bg-green-50 hover:bg-green-100",
//       "D": "bg-orange-50 hover:bg-orange-100",
//       "E": "bg-pink-50 hover:bg-pink-100",
//       "F": "bg-teal-50 hover:bg-teal-100",
//       "G": "bg-indigo-50 hover:bg-indigo-100",
//       "H": "bg-yellow-50 hover:bg-yellow-100",
//       "I": "bg-red-50 hover:bg-red-100",
//       "J": "bg-cyan-50 hover:bg-cyan-100"
//     };
//     return colors[type] || "bg-gray-50 hover:bg-gray-100";
//   };

//   // ✅ Get border color for shift card
//   const getShiftBorderColor = (type) => {
//     const colors = {
//       "A": "border-blue-200",
//       "B": "border-green-200",
//       "C": "border-green-200",
//       "D": "border-orange-200",
//       "E": "border-pink-200",
//       "F": "border-teal-200",
//       "G": "border-indigo-200",
//       "H": "border-yellow-200",
//       "I": "border-red-200",
//       "J": "border-cyan-200"
//     };
//     return colors[type] || "border-gray-200";
//   };

//   // ✅ Get badge color
//   const getBadgeColor = (type) => {
//     const colors = {
//       "A": "bg-blue-100 text-blue-800 border-blue-200",
//       "B": "bg-green-100 text-green-800 border-green-200",
//       "C": "bg-green-100 text-green-800 border-green-200",
//       "D": "bg-orange-100 text-orange-800 border-orange-200",
//       "E": "bg-pink-100 text-pink-800 border-pink-200",
//       "F": "bg-teal-100 text-teal-800 border-teal-200",
//       "G": "bg-indigo-100 text-indigo-800 border-indigo-200",
//       "H": "bg-yellow-100 text-yellow-800 border-yellow-200",
//       "I": "bg-red-100 text-red-800 border-red-200",
//       "J": "bg-cyan-100 text-cyan-800 border-cyan-200"
//     };
//     return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
//   };

//   // ✅ Get time range from assignment
//   const getEmployeeTimeRange = (assignment) => {
//     if (assignment.employeeAssignment?.selectedTimeRange) {
//       return assignment.employeeAssignment.selectedTimeRange;
//     } else if (assignment.startTime && assignment.endTime) {
//       return `${assignment.startTime} - ${assignment.endTime}`;
//     }
//     return "Not specified";
//   };

//   // ✅ ASSIGN SHIFT FUNCTION
//   const handleAssignShift = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     try {
//       const { employeeId, employeeName, shiftType } = assignForm;

//       if (!employeeId || !employeeName || !shiftType) {
//         setError('Please fill all required fields');
//         return;
//       }

//       const response = await axios.post('https://api.timelyhealth.in/api/shifts/assign', {
//         employeeId,
//         employeeName,
//         shiftType
//       });

//       if (response.data.success) {
//         setSuccess(`✅ Shift assigned to ${employeeName} successfully!`);
//         fetchData();
//         setShowAssignModal(false);
//         setAssignForm({
//           employeeId: '',
//           employeeName: '',
//           shiftType: ''
//         });
//       } else {
//         setError(response.data.message || 'Failed to assign shift');
//       }
//     } catch (error) {
//       console.error('❌ Assign error:', error);
//       setError(error.response?.data?.message || 'Failed to assign shift');
//     }
//   };

//   // ✅ UPDATE ASSIGNMENT FUNCTION
//   const handleUpdateAssignment = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     try {
//       const { employeeName, shiftType } = assignForm;

//       if (!employeeName || !shiftType) {
//         setError('Please fill all required fields');
//         return;
//       }

//       const response = await axios.put(
//         `https://api.timelyhealth.in/api/shifts/assignments/${editingAssignment._id}`,
//         {
//           employeeName,
//           shiftType
//         }
//       );

//       if (response.data.success) {
//         setSuccess('✅ Assignment updated successfully!');
//         fetchData();
//         setShowAssignModal(false);
//         setEditingAssignment(null);
//         setAssignForm({
//           employeeId: '',
//           employeeName: '',
//           shiftType: ''
//         });
//       } else {
//         setError(response.data.message || 'Failed to update assignment');
//       }
//     } catch (error) {
//       console.error('❌ Update error:', error);
//       setError(error.response?.data?.message || 'Failed to update assignment');
//     }
//   };

//   // ✅ DELETE ASSIGNMENT
//   const handleDeleteAssignment = async (id) => {
//     if (window.confirm('Are you sure you want to delete this assignment?')) {
//       try {
//         const response = await axios.delete(`https://api.timelyhealth.in/api/shifts/assignments/${id}`);
//         if (response.data.success) {
//           setSuccess('Shift assignment removed successfully');
//           fetchData();
//         }
//       } catch (error) {
//         setError('Failed to delete assignment');
//       }
//     }
//   };

//   // ✅ DELETE MASTER SHIFT
//   const handleDeleteMasterShift = async (id, shiftName) => {
//     if (window.confirm(`Delete ${shiftName}? This will remove all assignments.`)) {
//       try {
//         const response = await axios.delete(`https://api.timelyhealth.in/api/shifts/master/${id}`);
//         if (response.data.success) {
//           setSuccess(response.data.message);
//           fetchData();
//         }
//       } catch (error) {
//         setError('Failed to delete shift');
//       }
//     }
//   };

//   // ✅ VIEW EMPLOYEES BY SHIFT TYPE
//   const handleViewEmployees = async (shiftType, shiftName) => {
//     try {
//       const response = await axios.get(`https://api.timelyhealth.in/api/shifts/type/${shiftType}/employees`);
//       if (response.data.success) {
//         setViewShiftInfo({
//           shiftType,
//           shiftName
//         });
//         setViewEmployees(response.data.data.employees);
//         setViewingShiftType(shiftType);
//         setShowViewModal(true);
//       }
//     } catch (error) {
//       setError('Failed to fetch employees');
//     }
//   };

//   // ✅ CREATE DEFAULT SHIFTS A-D
//   const handleCreateDefaultShifts = async () => {
//     try {
//       const response = await axios.post('https://api.timelyhealth.in/api/shifts/create-defaults');
//       if (response.data.success) {
//         setSuccess(`✅ Created ${response.data.createdCount} default shifts (A-D)`);
//         fetchData();
//       }
//     } catch (error) {
//       setError('Failed to create default shifts');
//     }
//   };

//   // ✅ Get employee name from assignment
//   const getEmployeeName = (assignment) => {
//     return assignment.employeeAssignment?.employeeName || assignment.employeeName || "Unknown";
//   };

//   // ✅ Get employee ID from assignment
//   const getEmployeeId = (assignment) => {
//     return assignment.employeeAssignment?.employeeId || assignment.employeeId || "Unknown";
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
//         <p className="ml-4">Loading shifts...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4">
//       {/* Header */}
//       <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">Shift Management</h1>
//           <p className="text-gray-600">One time slot per shift</p>
//         </div>
//         <div className="flex flex-wrap gap-3">
//           {masterShifts.length === 0 && (
//             <button
//               onClick={handleCreateDefaultShifts}
//               className="flex items-center gap-2 px-6 py-3 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
//             >
//               <FaPlus /> Create Default Shifts (A-D)
//             </button>
//           )}
//           <button
//             onClick={() => setShowCustomCreateModal(true)}
//             className="flex items-center gap-2 px-6 py-3 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
//           >
//             <FaPlus /> Create New Shift
//           </button>
//           <button
//             onClick={() => setShowAssignModal(true)}
//             className="flex items-center gap-2 px-6 py-3 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//           >
//             <FaClock /> Assign Shift
//           </button>
//         </div>
//       </div>

//       {/* Messages */}
//       {error && (
//         <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
//           ❌ {error}
//         </div>
//       )}
//       {success && (
//         <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
//           ✅ {success}
//         </div>
//       )}

//       {/* ✅ 1. AVAILABLE SHIFTS SECTION - CARD GRID FORMAT */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-xl font-bold text-gray-800">Available Shifts ({masterShifts.length})</h2>
//           <p className="text-sm text-gray-500">Manage all created shifts</p>
//         </div>

//         {masterShifts.length === 0 ? (
//           <div className="py-12 text-center rounded-lg bg-gray-50">
//             <div className="mb-4 text-6xl text-gray-400">⏰</div>
//             <h3 className="mb-2 text-xl font-semibold text-gray-600">No shifts created yet</h3>
//             <p className="mb-4 text-gray-500">Create your first shift to get started</p>
//             <button
//               onClick={() => setShowCustomCreateModal(true)}
//               className="px-6 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
//             >
//               Create First Shift
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//             {masterShifts.map((shift) => {
//               const timeSlot = shift.timeSlots?.[0];
//               const employeeCount = getEmployeesCount(shift.shiftType);
//               const shiftColor = getShiftColor(shift.shiftType);
//               const textColor = getShiftTextColor(shift.shiftType);
//               const badgeColor = getBadgeColor(shift.shiftType);

//               return (
//                 <div 
//                   key={shift._id} 
//                   className={`p-5 border rounded-xl shadow-sm transition-all duration-200 hover:shadow-md ${shiftColor}`}
//                 >
//                   {/* Shift Header */}
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center gap-2">
//                       <div className={`p-2 rounded-lg ${badgeColor}`}>
//                         <FaClock className={textColor} />
//                       </div>
//                       <div>
//                         <span className={`text-sm font-semibold ${textColor}`}>
//                           Shift {shift.shiftType}
//                         </span>
//                         <div className="text-xs text-gray-500">{shift.shiftName}</div>
//                       </div>
//                     </div>

//                     <div className={`text-right ${textColor}`}>
//                       <div className="text-2xl font-bold">{employeeCount}</div>
//                       <div className="text-xs">employees</div>
//                     </div>
//                   </div>

//                   {/* Time Slot */}
//                   <div className="mb-4">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className={`text-sm font-medium ${textColor}`}>
//                         {timeSlot?.timeRange || "Not set"}
//                       </span>
//                     </div>
//                     <p className="text-xs text-gray-600">
//                       {timeSlot?.description || "No description"}
//                     </p>
//                   </div>

//                   {/* Shift ID */}
//                   {/* <div className="mb-5">
//                     <div className="mb-1 text-xs text-gray-500">Shift ID</div>
//                     <div className="font-mono text-xs text-gray-700 truncate">
//                       {shift._id.substring(0, 12)}...
//                     </div>
//                   </div> */}

//                   {/* Actions */}
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => handleViewEmployees(shift.shiftType, shift.shiftName)}
//                       disabled={employeeCount === 0}
//                       className={`flex-1 px-3 py-2 text-xs rounded-lg flex items-center justify-center gap-1 ${
//                         employeeCount > 0
//                           ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
//                           : 'bg-gray-100 text-gray-500 cursor-not-allowed'
//                       }`}
//                     >
//                       <FaEye /> View
//                     </button>
//                     <button
//                       onClick={() => {
//                         setAssignForm({
//                           employeeId: '',
//                           employeeName: '',
//                           shiftType: shift.shiftType
//                         });
//                         setEditingAssignment(null);
//                         setShowAssignModal(true);
//                       }}
//                       className="flex items-center justify-center flex-1 gap-1 px-3 py-2 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//                       title="Assign employee to this shift"
//                     >
//                       <FaPlus /> Assign
//                     </button>
//                     <button
//                       onClick={() => handleDeleteMasterShift(shift._id, shift.shiftName)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 text-xs text-white bg-red-600 rounded-lg hover:bg-red-700"
//                       title="Delete this shift"
//                     >
//                       <FaTimes />
//                     </button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* ✅ 2. ALL ASSIGNED EMPLOYEES TABLE */}
//       {employeeAssignments.length > 0 && (
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-bold text-gray-800">All Assigned Employees ({employeeAssignments.length})</h2>
//             <p className="text-sm text-gray-500">Complete list of all shift assignments</p>
//           </div>
//           <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Employee ID</th>
//                   <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Employee Name</th>
//                   <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Shift</th>
//                   <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Time Slot</th>
//                   <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Description</th>
//                   <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {employeeAssignments.map((assignment) => {
//                   const timeSlot = getShiftTimeSlot(assignment.shiftType);
//                   const employeeName = getEmployeeName(assignment);
//                   const employeeId = getEmployeeId(assignment);
//                   const rowBgColor = getRowBgColor(assignment.shiftType);
//                   const textColor = getShiftTextColor(assignment.shiftType);

//                   return (
//                     <tr key={assignment._id} className={rowBgColor}>
//                       <td className="px-4 py-3">
//                         <div className={`font-medium ${textColor}`}>{employeeId}</div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className={`font-medium ${textColor}`}>{employeeName}</div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${getBadgeColor(assignment.shiftType)}`}>
//                           Shift {assignment.shiftType}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className={`font-medium ${textColor}`}>{getEmployeeTimeRange(assignment)}</div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="text-sm text-gray-600">
//                           {assignment.employeeAssignment?.selectedDescription || timeSlot?.description || "Shift timing"}
//                         </div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => {
//                               setEditingAssignment(assignment);
//                               setAssignForm({
//                                 employeeId: assignment.employeeAssignment?.employeeId || assignment.employeeId,
//                                 employeeName: assignment.employeeAssignment?.employeeName || assignment.employeeName,
//                                 shiftType: assignment.shiftType
//                               });
//                               setShowAssignModal(true);
//                             }}
//                             className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-blue-600 rounded hover:bg-blue-700"
//                             title="Edit Assignment"
//                           >
//                             <FaEdit /> Edit
//                           </button>
//                           <button
//                             onClick={() => handleDeleteAssignment(assignment._id)}
//                             className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-red-600 rounded hover:bg-red-700"
//                             title="Delete Assignment"
//                           >
//                             <FaTrash /> Remove
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* CUSTOM CREATE MODAL */}
//       {showCustomCreateModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
//             <div className="flex items-center justify-between p-6 border-b">
//               <h3 className="text-xl font-semibold text-gray-800">Create New Shift</h3>
//               <button onClick={() => setShowCustomCreateModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">
//                 &times;
//               </button>
//             </div>

//             <form onSubmit={handleCreateCustomShift} className="p-6">
//               <div className="space-y-6">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">
//                       Shift Type (Letter A-Z) *
//                     </label>
//                     <input
//                       type="text"
//                       maxLength="1"
//                       value={createForm.shiftType}
//                       onChange={(e) => setCreateForm(prev => ({ 
//                         ...prev, 
//                         shiftType: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')
//                       }))}
//                       className="w-full px-4 py-2 text-sm uppercase border border-gray-300 rounded-lg"
//                       placeholder="E"
//                       required
//                     />
//                     <p className="mt-1 text-xs text-gray-500">Enter a single letter (A-Z)</p>
//                   </div>

//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">
//                       Shift Name *
//                     </label>
//                     <input
//                       type="text"
//                       value={createForm.shiftName}
//                       onChange={(e) => setCreateForm(prev => ({ ...prev, shiftName: e.target.value }))}
//                       className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
//                       placeholder="e.g., Extended Shift E"
//                       required
//                     />
//                   </div>
//                 </div>

//                 {/* Single Time Slot Configuration */}
//                 <div>
//                   <label className="block mb-3 text-sm font-medium text-gray-700">
//                     Time Slot Configuration *
//                   </label>

//                   <div className="p-3 space-y-3 border rounded-lg bg-gray-50">
//                     <div>
//                       <label className="block mb-1 text-xs text-gray-600">Time Range *</label>
//                       <input
//                         type="text"
//                         value={createForm.timeSlots[0].timeRange}
//                         onChange={(e) => updateTimeSlot('timeRange', e.target.value)}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
//                         placeholder="e.g., 10:00 - 19:00"
//                         required
//                       />
//                     </div>

//                     <div>
//                       <label className="block mb-1 text-xs text-gray-600">Description *</label>
//                       <input
//                         type="text"
//                         value={createForm.timeSlots[0].description}
//                         onChange={(e) => updateTimeSlot('description', e.target.value)}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
//                         placeholder="e.g., Morning 10 to 7"
//                         required
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Preview */}
//                 {createForm.shiftType && createForm.timeSlots[0].timeRange && (
//                   <div className="p-3 border border-blue-200 rounded bg-blue-50">
//                     <h4 className="mb-2 text-sm font-medium text-blue-800">Preview:</h4>
//                     <p className="text-sm text-blue-700">
//                       Shift {createForm.shiftType}: {createForm.shiftName}
//                     </p>
//                     <p className="mt-1 text-sm text-blue-600">
//                       Time: {createForm.timeSlots[0].timeRange}
//                     </p>
//                   </div>
//                 )}
//               </div>

//               <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
//                 <button
//                   type="button"
//                   onClick={() => setShowCustomCreateModal(false)}
//                   className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
//                 >
//                   Create Shift
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ASSIGN SHIFT MODAL */}
//       {showAssignModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
//             <div className="flex items-center justify-between p-6 border-b">
//               <h3 className="text-xl font-semibold text-gray-800">
//                 {editingAssignment ? 'Edit Assignment' : 'Assign Shift'}
//               </h3>
//               <button onClick={() => setShowAssignModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">
//                 &times;
//               </button>
//             </div>

//             <form onSubmit={editingAssignment ? handleUpdateAssignment : handleAssignShift} className="p-6">
//               <div className="space-y-4">
//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">
//                     Employee ID {editingAssignment && '(Cannot change)'}
//                   </label>
//                   <input
//                     type="text"
//                     value={assignForm.employeeId}
//                     onChange={(e) => setAssignForm(prev => ({ ...prev, employeeId: e.target.value }))}
//                     className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
//                     placeholder="EMP001"
//                     required
//                     readOnly={!!editingAssignment}
//                   />
//                 </div>

//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">
//                     Employee Name *
//                   </label>
//                   <input
//                     type="text"
//                     value={assignForm.employeeName}
//                     onChange={(e) => setAssignForm(prev => ({ ...prev, employeeName: e.target.value }))}
//                     className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
//                     placeholder="John Doe"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">
//                     Select Shift Type *
//                   </label>
//                   <select
//                     value={assignForm.shiftType}
//                     onChange={(e) => setAssignForm(prev => ({ ...prev, shiftType: e.target.value }))}
//                     className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
//                     required
//                   >
//                     <option value="">Select Shift Type</option>
//                     {masterShifts.map(shift => (
//                       <option key={shift._id} value={shift.shiftType}>
//                         Shift {shift.shiftType}: {shift.shiftName} ({shift.timeSlots?.[0]?.timeRange})
//                       </option>
//                     ))}
//                     {/* Legacy shift types */}
//                     {employeeAssignments
//                       .map(a => a.shiftType)
//                       .filter((type, index, self) => 
//                         self.indexOf(type) === index && 
//                         !masterShifts.find(s => s.shiftType === type)
//                       )
//                       .map(type => (
//                         <option key={type} value={type}>
//                           Shift {type} (Legacy)
//                         </option>
//                       ))
//                     }
//                   </select>

//                   {/* Show selected shift timing */}
//                   {assignForm.shiftType && masterShifts.find(s => s.shiftType === assignForm.shiftType) && (
//                     <div className="p-2 mt-2 text-xs rounded bg-blue-50">
//                       <p className="text-blue-700">
//                         Time: {getShiftTimeSlot(assignForm.shiftType)?.timeRange || "Not specified"}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowAssignModal(false);
//                     setEditingAssignment(null);
//                     setAssignForm({
//                       employeeId: '',
//                       employeeName: '',
//                       shiftType: ''
//                     });
//                   }}
//                   className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//                 >
//                   {editingAssignment ? 'Update' : 'Assign'} Shift
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* VIEW EMPLOYEES MODAL */}
//       {showViewModal && viewEmployees.length > 0 && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
//             <div className="flex items-center justify-between p-4 border-b">
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-800">
//                   {viewShiftInfo.shiftName} Employees
//                 </h3>
//                 <p className="text-sm text-gray-600">
//                   Shift {viewShiftInfo.shiftType} • {viewEmployees.length} employees
//                 </p>
//               </div>
//               <button 
//                 onClick={() => setShowViewModal(false)} 
//                 className="text-2xl text-gray-400 hover:text-gray-600"
//               >
//                 &times;
//               </button>
//             </div>

//             <div className="flex-1 overflow-y-auto">
//               <table className="w-full">
//                 <thead className="sticky top-0 bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Employee ID</th>
//                     <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Employee Name</th>
//                     <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Time Slot</th>
//                     <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Description</th>
//                     <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {viewEmployees.map((emp) => {
//                     const rowBgColor = getRowBgColor(emp.shiftType);
//                     const textColor = getShiftTextColor(emp.shiftType);

//                     return (
//                       <tr key={emp._id} className={rowBgColor}>
//                         <td className="px-4 py-3">
//                           <div className={`font-medium ${textColor}`}>{emp.employeeAssignment?.employeeId || emp.employeeId}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className={`font-medium ${textColor}`}>{emp.employeeAssignment?.employeeName || emp.employeeName}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className={`font-medium ${textColor}`}>{getEmployeeTimeRange(emp)}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="text-sm text-gray-600">{emp.employeeAssignment?.selectedDescription || "Legacy shift"}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="flex gap-2">
//                             <button
//                               onClick={() => {
//                                 setShowViewModal(false);
//                                 setEditingAssignment(emp);
//                                 setAssignForm({
//                                   employeeId: emp.employeeAssignment?.employeeId || emp.employeeId,
//                                   employeeName: emp.employeeAssignment?.employeeName || emp.employeeName,
//                                   shiftType: emp.shiftType
//                                 });
//                                 setShowAssignModal(true);
//                               }}
//                               className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-blue-600 rounded hover:bg-blue-700"
//                             >
//                               <FaEdit /> Edit
//                             </button>
//                             <button
//                               onClick={() => {
//                                 handleDeleteAssignment(emp._id);
//                                 setShowViewModal(false);
//                               }}
//                               className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-red-600 rounded hover:bg-red-700"
//                             >
//                               <FaTrash /> Delete
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>

//             <div className="p-4 border-t">
//               <button
//                 onClick={() => setShowViewModal(false)}
//                 className="w-full py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-medium"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ShiftManagement;

// import axios from 'axios';
// import { useEffect, useState } from 'react';
// import { FaClock, FaEdit, FaEye, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
// import { isEmployeeHidden } from '../utils/employeeStatus'; // ✅ Add this import

// const ShiftManagement = () => {
//   const [masterShifts, setMasterShifts] = useState([]);
//   const [employeeAssignments, setEmployeeAssignments] = useState([]);
//   const [allEmployees, setAllEmployees] = useState([]); // ✅ Add this
//   const [employeeCounts, setEmployeeCounts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Modals
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showCustomCreateModal, setShowCustomCreateModal] = useState(false);
//   const [showAssignModal, setShowAssignModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(false);

//   // Data
//   const [editingAssignment, setEditingAssignment] = useState(null);
//   const [viewingShiftType, setViewingShiftType] = useState('');
//   const [viewEmployees, setViewEmployees] = useState([]);
//   const [viewShiftInfo, setViewShiftInfo] = useState({});

//   // Forms
//   const [createForm, setCreateForm] = useState({
//     shiftType: '',
//     shiftName: '',
//     timeSlots: [{ slotId: `${Date.now()}_1`, timeRange: '', description: '' }]
//   });

//   const [assignForm, setAssignForm] = useState({
//     employeeId: '',
//     employeeName: '',
//     shiftType: ''
//   });

//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   // ✅ Add this function to filter out inactive employees
//   const filterInactiveAssignments = (assignments) => {
//     if (!Array.isArray(assignments) || !allEmployees.length) return assignments;

//     return assignments.filter(assignment => {
//       // Get employee ID from assignment
//       const employeeId = assignment.employeeAssignment?.employeeId || assignment.employeeId;
//       if (!employeeId) return true;

//       // Find employee in allEmployees
//       const employee = allEmployees.find(emp => 
//         emp.employeeId === employeeId || emp._id === employeeId
//       );

//       // If employee not found, keep the assignment
//       if (!employee) return true;

//       // Check if employee is inactive
//       return !isEmployeeHidden(employee);
//     });
//   };

//   // Fetch all data
//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       setError('');

//       console.log("🔄 Fetching data...");

//       // ✅ Fetch all employees first
//       try {
//         const employeesRes = await axios.get('https://api.timelyhealth.in/api/employees/get-employees');
//         if (Array.isArray(employeesRes.data)) {
//           setAllEmployees(employeesRes.data);
//         }
//       } catch (e) {
//         console.error('❌ Error fetching employees:', e);
//       }

//       // Fetch master shifts
//       const shiftsRes = await axios.get('https://api.timelyhealth.in/api/shifts/master');

//       if (shiftsRes.data.success) {
//         setMasterShifts(shiftsRes.data.data);
//       } else {
//         setError(shiftsRes.data.message);
//       }

//       // Fetch employee assignments
//       const assignedRes = await axios.get('https://api.timelyhealth.in/api/shifts/assignments');

//       if (assignedRes.data.success) {
//         // ✅ Filter out inactive employees from assignments
//         const filteredAssignments = filterInactiveAssignments(assignedRes.data.data);
//         setEmployeeAssignments(filteredAssignments);
//       }

//       // Fetch employee counts by shift
//       const countRes = await axios.get('https://api.timelyhealth.in/api/shifts/employee-count');

//       if (countRes.data.success) {
//         setEmployeeCounts(countRes.data.data);
//       }

//     } catch (error) {
//       console.error('❌ Fetch error:', error);
//       setError('Server connection failed. Check if backend is running.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // ✅ CREATE CUSTOM SHIFT
//   const handleCreateCustomShift = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     try {
//       if (!createForm.shiftType || !createForm.shiftName) {
//         setError('Please enter shift type and name');
//         return;
//       }

//       const slot = createForm.timeSlots[0];
//       if (!slot.timeRange.trim() || !slot.description.trim()) {
//         setError('Please fill time slot details');
//         return;
//       }

//       const response = await axios.post('https://api.timelyhealth.in/api/shifts/create', {
//         shiftType: createForm.shiftType,
//         shiftName: createForm.shiftName,
//         timeSlots: [slot]
//       });

//       if (response.data.success) {
//         setSuccess(`✅ Custom Shift ${createForm.shiftType} created successfully!`);
//         fetchData();
//         setShowCustomCreateModal(false);
//         setCreateForm({
//           shiftType: '',
//           shiftName: '',
//           timeSlots: [{ slotId: `${Date.now()}_1`, timeRange: '', description: '' }]
//         });
//       } else {
//         setError(response.data.message);
//       }
//     } catch (error) {
//       console.error('Create custom error:', error);
//       setError(error.response?.data?.message || 'Failed to create custom shift');
//     }
//   };

//   // ✅ Update time slot
//   const updateTimeSlot = (field, value) => {
//     setCreateForm(prev => ({ 
//       ...prev, 
//       timeSlots: [{ ...prev.timeSlots[0], [field]: value }] 
//     }));
//   };

//   // ✅ Get time slot for shift type
//   const getShiftTimeSlot = (shiftType) => {
//     const shift = masterShifts.find(s => s.shiftType === shiftType);
//     return shift?.timeSlots?.[0] || null;
//   };

//   // ✅ Get employees count for shift type
//   const getEmployeesCount = (shiftType) => {
//     return employeeAssignments.filter(a => a.shiftType === shiftType).length;
//   };

//   // ✅ Get shift color
//   const getShiftColor = (type) => {
//     const colors = {
//       "A": "bg-blue-50 border-blue-200",
//       "B": "bg-green-50 border-green-200", 
//       "C": "bg-green-50 border-green-200",
//       "D": "bg-orange-50 border-orange-200",
//       "E": "bg-pink-50 border-pink-200",
//       "F": "bg-teal-50 border-teal-200",
//       "G": "bg-indigo-50 border-indigo-200",
//       "H": "bg-yellow-50 border-yellow-200",
//       "I": "bg-red-50 border-red-200",
//       "J": "bg-cyan-50 border-cyan-200"
//     };
//     return colors[type] || "bg-gray-50 border-gray-200";
//   };

//   const getShiftTextColor = (type) => {
//     const colors = {
//       "A": "text-blue-800",
//       "B": "text-green-800",
//       "C": "text-green-800",
//       "D": "text-orange-800",
//       "E": "text-pink-800",
//       "F": "text-teal-800",
//       "G": "text-indigo-800",
//       "H": "text-yellow-800",
//       "I": "text-red-800",
//       "J": "text-cyan-800"
//     };
//     return colors[type] || "text-gray-800";
//   };

//   // ✅ Get row background color
//   const getRowBgColor = (type) => {
//     const colors = {
//       "A": "bg-blue-50 hover:bg-blue-100",
//       "B": "bg-green-50 hover:bg-green-100", 
//       "C": "bg-green-50 hover:bg-green-100",
//       "D": "bg-orange-50 hover:bg-orange-100",
//       "E": "bg-pink-50 hover:bg-pink-100",
//       "F": "bg-teal-50 hover:bg-teal-100",
//       "G": "bg-indigo-50 hover:bg-indigo-100",
//       "H": "bg-yellow-50 hover:bg-yellow-100",
//       "I": "bg-red-50 hover:bg-red-100",
//       "J": "bg-cyan-50 hover:bg-cyan-100"
//     };
//     return colors[type] || "bg-gray-50 hover:bg-gray-100";
//   };

//   // ✅ Get border color for shift card
//   const getShiftBorderColor = (type) => {
//     const colors = {
//       "A": "border-blue-200",
//       "B": "border-green-200",
//       "C": "border-green-200",
//       "D": "border-orange-200",
//       "E": "border-pink-200",
//       "F": "border-teal-200",
//       "G": "border-indigo-200",
//       "H": "border-yellow-200",
//       "I": "border-red-200",
//       "J": "border-cyan-200"
//     };
//     return colors[type] || "border-gray-200";
//   };

//   // ✅ Get badge color
//   const getBadgeColor = (type) => {
//     const colors = {
//       "A": "bg-blue-100 text-blue-800 border-blue-200",
//       "B": "bg-green-100 text-green-800 border-green-200",
//       "C": "bg-green-100 text-green-800 border-green-200",
//       "D": "bg-orange-100 text-orange-800 border-orange-200",
//       "E": "bg-pink-100 text-pink-800 border-pink-200",
//       "F": "bg-teal-100 text-teal-800 border-teal-200",
//       "G": "bg-indigo-100 text-indigo-800 border-indigo-200",
//       "H": "bg-yellow-100 text-yellow-800 border-yellow-200",
//       "I": "bg-red-100 text-red-800 border-red-200",
//       "J": "bg-cyan-100 text-cyan-800 border-cyan-200"
//     };
//     return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
//   };

//   // ✅ Get time range from assignment
//   const getEmployeeTimeRange = (assignment) => {
//     if (assignment.employeeAssignment?.selectedTimeRange) {
//       return assignment.employeeAssignment.selectedTimeRange;
//     } else if (assignment.startTime && assignment.endTime) {
//       return `${assignment.startTime} - ${assignment.endTime}`;
//     }
//     return "Not specified";
//   };

//   // ✅ ASSIGN SHIFT FUNCTION
//   const handleAssignShift = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     try {
//       const { employeeId, employeeName, shiftType } = assignForm;

//       if (!employeeId || !employeeName || !shiftType) {
//         setError('Please fill all required fields');
//         return;
//       }

//       // ✅ Check if employee is active before assigning shift
//       const employee = allEmployees.find(emp => 
//         emp.employeeId === employeeId || emp._id === employeeId
//       );

//       if (employee && isEmployeeHidden(employee)) {
//         setError(`Cannot assign shift to inactive employee: ${employeeName}`);
//         return;
//       }

//       const response = await axios.post('https://api.timelyhealth.in/api/shifts/assign', {
//         employeeId,
//         employeeName,
//         shiftType
//       });

//       if (response.data.success) {
//         setSuccess(`✅ Shift assigned to ${employeeName} successfully!`);
//         fetchData();
//         setShowAssignModal(false);
//         setAssignForm({
//           employeeId: '',
//           employeeName: '',
//           shiftType: ''
//         });
//       } else {
//         setError(response.data.message || 'Failed to assign shift');
//       }
//     } catch (error) {
//       console.error('❌ Assign error:', error);
//       setError(error.response?.data?.message || 'Failed to assign shift');
//     }
//   };

//   // ✅ UPDATE ASSIGNMENT FUNCTION
//   const handleUpdateAssignment = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     try {
//       const { employeeName, shiftType } = assignForm;

//       if (!employeeName || !shiftType) {
//         setError('Please fill all required fields');
//         return;
//       }

//       const response = await axios.put(
//         `https://api.timelyhealth.in/api/shifts/assignments/${editingAssignment._id}`,
//         {
//           employeeName,
//           shiftType
//         }
//       );

//       if (response.data.success) {
//         setSuccess('✅ Assignment updated successfully!');
//         fetchData();
//         setShowAssignModal(false);
//         setEditingAssignment(null);
//         setAssignForm({
//           employeeId: '',
//           employeeName: '',
//           shiftType: ''
//         });
//       } else {
//         setError(response.data.message || 'Failed to update assignment');
//       }
//     } catch (error) {
//       console.error('❌ Update error:', error);
//       setError(error.response?.data?.message || 'Failed to update assignment');
//     }
//   };

//   // ✅ DELETE ASSIGNMENT
//   const handleDeleteAssignment = async (id) => {
//     if (window.confirm('Are you sure you want to delete this assignment?')) {
//       try {
//         const response = await axios.delete(`https://api.timelyhealth.in/api/shifts/assignments/${id}`);
//         if (response.data.success) {
//           setSuccess('Shift assignment removed successfully');
//           fetchData();
//         }
//       } catch (error) {
//         setError('Failed to delete assignment');
//       }
//     }
//   };

//   // ✅ DELETE MASTER SHIFT
//   const handleDeleteMasterShift = async (id, shiftName) => {
//     if (window.confirm(`Delete ${shiftName}? This will remove all assignments.`)) {
//       try {
//         const response = await axios.delete(`https://api.timelyhealth.in/api/shifts/master/${id}`);
//         if (response.data.success) {
//           setSuccess(response.data.message);
//           fetchData();
//         }
//       } catch (error) {
//         setError('Failed to delete shift');
//       }
//     }
//   };

//   // ✅ VIEW EMPLOYEES BY SHIFT TYPE
//   const handleViewEmployees = async (shiftType, shiftName) => {
//     try {
//       const response = await axios.get(`https://api.timelyhealth.in/api/shifts/type/${shiftType}/employees`);
//       if (response.data.success) {
//         // ✅ Filter out inactive employees
//         const employees = response.data.data.employees || [];
//         const filteredEmployees = filterInactiveAssignments(employees);

//         setViewShiftInfo({
//           shiftType,
//           shiftName
//         });
//         setViewEmployees(filteredEmployees);
//         setViewingShiftType(shiftType);
//         setShowViewModal(true);
//       }
//     } catch (error) {
//       setError('Failed to fetch employees');
//     }
//   };

//   // ✅ CREATE DEFAULT SHIFTS A-D
//   const handleCreateDefaultShifts = async () => {
//     try {
//       const response = await axios.post('https://api.timelyhealth.in/api/shifts/create-defaults');
//       if (response.data.success) {
//         setSuccess(`✅ Created ${response.data.createdCount} default shifts (A-D)`);
//         fetchData();
//       }
//     } catch (error) {
//       setError('Failed to create default shifts');
//     }
//   };

//   // ✅ Get employee name from assignment
//   const getEmployeeName = (assignment) => {
//     return assignment.employeeAssignment?.employeeName || assignment.employeeName || "Unknown";
//   };

//   // ✅ Get employee ID from assignment
//   const getEmployeeId = (assignment) => {
//     return assignment.employeeAssignment?.employeeId || assignment.employeeId || "Unknown";
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
//         <p className="ml-4">Loading shifts...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4">
//       {/* Header */}
//       <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">Shift Management</h1>
//           <p className="text-gray-600">Active employees only</p>
//         </div>
//         <div className="flex flex-wrap gap-3">
//           {masterShifts.length === 0 && (
//             <button
//               onClick={handleCreateDefaultShifts}
//               className="flex items-center gap-2 px-6 py-3 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
//             >
//               <FaPlus /> Create Default Shifts (A-D)
//             </button>
//           )}
//           <button
//             onClick={() => setShowCustomCreateModal(true)}
//             className="flex items-center gap-2 px-6 py-3 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
//           >
//             <FaPlus /> Create New Shift
//           </button>
//           <button
//             onClick={() => setShowAssignModal(true)}
//             className="flex items-center gap-2 px-6 py-3 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//           >
//             <FaClock /> Assign Shift
//           </button>
//         </div>
//       </div>

//       {/* Messages */}
//       {error && (
//         <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
//           ❌ {error}
//         </div>
//       )}
//       {success && (
//         <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
//           ✅ {success}
//         </div>
//       )}

//       {/* ✅ 1. AVAILABLE SHIFTS SECTION - CARD GRID FORMAT */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-xl font-bold text-gray-800">Available Shifts ({masterShifts.length})</h2>
//           <p className="text-sm text-gray-500">Active employees only</p>
//         </div>

//         {masterShifts.length === 0 ? (
//           <div className="py-12 text-center rounded-lg bg-gray-50">
//             <div className="mb-4 text-6xl text-gray-400">⏰</div>
//             <h3 className="mb-2 text-xl font-semibold text-gray-600">No shifts created yet</h3>
//             <p className="mb-4 text-gray-500">Create your first shift to get started</p>
//             <button
//               onClick={() => setShowCustomCreateModal(true)}
//               className="px-6 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
//             >
//               Create First Shift
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//             {masterShifts.map((shift) => {
//               const timeSlot = shift.timeSlots?.[0];
//               const employeeCount = getEmployeesCount(shift.shiftType);
//               const shiftColor = getShiftColor(shift.shiftType);
//               const textColor = getShiftTextColor(shift.shiftType);
//               const badgeColor = getBadgeColor(shift.shiftType);

//               return (
//                 <div 
//                   key={shift._id} 
//                   className={`p-5 border rounded-xl shadow-sm transition-all duration-200 hover:shadow-md ${shiftColor}`}
//                 >
//                   {/* Shift Header */}
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center gap-2">
//                       <div className={`p-2 rounded-lg ${badgeColor}`}>
//                         <FaClock className={textColor} />
//                       </div>
//                       <div>
//                         <span className={`text-sm font-semibold ${textColor}`}>
//                           Shift {shift.shiftType}
//                         </span>
//                         <div className="text-xs text-gray-500">{shift.shiftName}</div>
//                       </div>
//                     </div>

//                     <div className={`text-right ${textColor}`}>
//                       <div className="text-2xl font-bold">{employeeCount}</div>
//                       <div className="text-xs">active employees</div>
//                     </div>
//                   </div>

//                   {/* Time Slot */}
//                   <div className="mb-4">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className={`text-sm font-medium ${textColor}`}>
//                         {timeSlot?.timeRange || "Not set"}
//                       </span>
//                     </div>
//                     <p className="text-xs text-gray-600">
//                       {timeSlot?.description || "No description"}
//                     </p>
//                   </div>

//                   {/* Actions */}
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => handleViewEmployees(shift.shiftType, shift.shiftName)}
//                       disabled={employeeCount === 0}
//                       className={`flex-1 px-3 py-2 text-xs rounded-lg flex items-center justify-center gap-1 ${
//                         employeeCount > 0
//                           ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
//                           : 'bg-gray-100 text-gray-500 cursor-not-allowed'
//                       }`}
//                     >
//                       <FaEye /> View
//                     </button>
//                     <button
//                       onClick={() => {
//                         setAssignForm({
//                           employeeId: '',
//                           employeeName: '',
//                           shiftType: shift.shiftType
//                         });
//                         setEditingAssignment(null);
//                         setShowAssignModal(true);
//                       }}
//                       className="flex items-center justify-center flex-1 gap-1 px-3 py-2 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//                       title="Assign employee to this shift"
//                     >
//                       <FaPlus /> Assign
//                     </button>
//                     <button
//                       onClick={() => handleDeleteMasterShift(shift._id, shift.shiftName)}
//                       className="flex items-center justify-center gap-1 px-3 py-2 text-xs text-white bg-red-600 rounded-lg hover:bg-red-700"
//                       title="Delete this shift"
//                     >
//                       <FaTimes />
//                     </button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* ✅ 2. ALL ASSIGNED EMPLOYEES TABLE */}
//       {employeeAssignments.length > 0 && (
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-bold text-gray-800">Active Assigned Employees ({employeeAssignments.length})</h2>
//             <p className="text-sm text-gray-500">List of all shift assignments (inactive employees hidden)</p>
//           </div>
//           <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Employee ID</th>
//                   <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Employee Name</th>
//                   <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Shift</th>
//                   <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Time Slot</th>
//                   <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Description</th>
//                   <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {employeeAssignments.map((assignment) => {
//                   const timeSlot = getShiftTimeSlot(assignment.shiftType);
//                   const employeeName = getEmployeeName(assignment);
//                   const employeeId = getEmployeeId(assignment);
//                   const rowBgColor = getRowBgColor(assignment.shiftType);
//                   const textColor = getShiftTextColor(assignment.shiftType);

//                   return (
//                     <tr key={assignment._id} className={rowBgColor}>
//                       <td className="px-4 py-3">
//                         <div className={`font-medium ${textColor}`}>{employeeId}</div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className={`font-medium ${textColor}`}>{employeeName}</div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${getBadgeColor(assignment.shiftType)}`}>
//                           Shift {assignment.shiftType}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className={`font-medium ${textColor}`}>{getEmployeeTimeRange(assignment)}</div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="text-sm text-gray-600">
//                           {assignment.employeeAssignment?.selectedDescription || timeSlot?.description || "Shift timing"}
//                         </div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => {
//                               setEditingAssignment(assignment);
//                               setAssignForm({
//                                 employeeId: assignment.employeeAssignment?.employeeId || assignment.employeeId,
//                                 employeeName: assignment.employeeAssignment?.employeeName || assignment.employeeName,
//                                 shiftType: assignment.shiftType
//                               });
//                               setShowAssignModal(true);
//                             }}
//                             className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-blue-600 rounded hover:bg-blue-700"
//                             title="Edit Assignment"
//                           >
//                             <FaEdit /> Edit
//                           </button>
//                           <button
//                             onClick={() => handleDeleteAssignment(assignment._id)}
//                             className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-red-600 rounded hover:bg-red-700"
//                             title="Delete Assignment"
//                           >
//                             <FaTrash /> Remove
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* CUSTOM CREATE MODAL */}
//       {showCustomCreateModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
//             <div className="flex items-center justify-between p-6 border-b">
//               <h3 className="text-xl font-semibold text-gray-800">Create New Shift</h3>
//               <button onClick={() => setShowCustomCreateModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">
//                 &times;
//               </button>
//             </div>

//             <form onSubmit={handleCreateCustomShift} className="p-6">
//               <div className="space-y-6">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">
//                       Shift Type (Letter A-Z) *
//                     </label>
//                     <input
//                       type="text"
//                       maxLength="1"
//                       value={createForm.shiftType}
//                       onChange={(e) => setCreateForm(prev => ({ 
//                         ...prev, 
//                         shiftType: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')
//                       }))}
//                       className="w-full px-4 py-2 text-sm uppercase border border-gray-300 rounded-lg"
//                       placeholder="E"
//                       required
//                     />
//                     <p className="mt-1 text-xs text-gray-500">Enter a single letter (A-Z)</p>
//                   </div>

//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">
//                       Shift Name *
//                     </label>
//                     <input
//                       type="text"
//                       value={createForm.shiftName}
//                       onChange={(e) => setCreateForm(prev => ({ ...prev, shiftName: e.target.value }))}
//                       className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
//                       placeholder="e.g., Extended Shift E"
//                       required
//                     />
//                   </div>
//                 </div>

//                 {/* Single Time Slot Configuration */}
//                 <div>
//                   <label className="block mb-3 text-sm font-medium text-gray-700">
//                     Time Slot Configuration *
//                   </label>

//                   <div className="p-3 space-y-3 border rounded-lg bg-gray-50">
//                     <div>
//                       <label className="block mb-1 text-xs text-gray-600">Time Range *</label>
//                       <input
//                         type="text"
//                         value={createForm.timeSlots[0].timeRange}
//                         onChange={(e) => updateTimeSlot('timeRange', e.target.value)}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
//                         placeholder="e.g., 10:00 - 19:00"
//                         required
//                       />
//                     </div>

//                     <div>
//                       <label className="block mb-1 text-xs text-gray-600">Description *</label>
//                       <input
//                         type="text"
//                         value={createForm.timeSlots[0].description}
//                         onChange={(e) => updateTimeSlot('description', e.target.value)}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
//                         placeholder="e.g., Morning 10 to 7"
//                         required
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Preview */}
//                 {createForm.shiftType && createForm.timeSlots[0].timeRange && (
//                   <div className="p-3 border border-blue-200 rounded bg-blue-50">
//                     <h4 className="mb-2 text-sm font-medium text-blue-800">Preview:</h4>
//                     <p className="text-sm text-blue-700">
//                       Shift {createForm.shiftType}: {createForm.shiftName}
//                     </p>
//                     <p className="mt-1 text-sm text-blue-600">
//                       Time: {createForm.timeSlots[0].timeRange}
//                     </p>
//                   </div>
//                 )}
//               </div>

//               <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
//                 <button
//                   type="button"
//                   onClick={() => setShowCustomCreateModal(false)}
//                   className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
//                 >
//                   Create Shift
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ASSIGN SHIFT MODAL */}
//       {showAssignModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
//             <div className="flex items-center justify-between p-6 border-b">
//               <h3 className="text-xl font-semibold text-gray-800">
//                 {editingAssignment ? 'Edit Assignment' : 'Assign Shift'}
//               </h3>
//               <button onClick={() => setShowAssignModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">
//                 &times;
//               </button>
//             </div>

//             <form onSubmit={editingAssignment ? handleUpdateAssignment : handleAssignShift} className="p-6">
//               <div className="space-y-4">
//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">
//                     Employee ID {editingAssignment && '(Cannot change)'}
//                   </label>
//                   <input
//                     type="text"
//                     value={assignForm.employeeId}
//                     onChange={(e) => setAssignForm(prev => ({ ...prev, employeeId: e.target.value }))}
//                     className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
//                     placeholder="EMP001"
//                     required
//                     readOnly={!!editingAssignment}
//                   />
//                 </div>

//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">
//                     Employee Name *
//                   </label>
//                   <input
//                     type="text"
//                     value={assignForm.employeeName}
//                     onChange={(e) => setAssignForm(prev => ({ ...prev, employeeName: e.target.value }))}
//                     className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
//                     placeholder="John Doe"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">
//                     Select Shift Type *
//                   </label>
//                   <select
//                     value={assignForm.shiftType}
//                     onChange={(e) => setAssignForm(prev => ({ ...prev, shiftType: e.target.value }))}
//                     className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
//                     required
//                   >
//                     <option value="">Select Shift Type</option>
//                     {masterShifts.map(shift => (
//                       <option key={shift._id} value={shift.shiftType}>
//                         Shift {shift.shiftType}: {shift.shiftName} ({shift.timeSlots?.[0]?.timeRange})
//                       </option>
//                     ))}
//                     {/* Legacy shift types */}
//                     {employeeAssignments
//                       .map(a => a.shiftType)
//                       .filter((type, index, self) => 
//                         self.indexOf(type) === index && 
//                         !masterShifts.find(s => s.shiftType === type)
//                       )
//                       .map(type => (
//                         <option key={type} value={type}>
//                           Shift {type} (Legacy)
//                         </option>
//                       ))
//                     }
//                   </select>

//                   {/* Show selected shift timing */}
//                   {assignForm.shiftType && masterShifts.find(s => s.shiftType === assignForm.shiftType) && (
//                     <div className="p-2 mt-2 text-xs rounded bg-blue-50">
//                       <p className="text-blue-700">
//                         Time: {getShiftTimeSlot(assignForm.shiftType)?.timeRange || "Not specified"}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowAssignModal(false);
//                     setEditingAssignment(null);
//                     setAssignForm({
//                       employeeId: '',
//                       employeeName: '',
//                       shiftType: ''
//                     });
//                   }}
//                   className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//                 >
//                   {editingAssignment ? 'Update' : 'Assign'} Shift
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* VIEW EMPLOYEES MODAL */}
//       {showViewModal && viewEmployees.length > 0 && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
//             <div className="flex items-center justify-between p-4 border-b">
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-800">
//                   {viewShiftInfo.shiftName} Employees
//                 </h3>
//                 <p className="text-sm text-gray-600">
//                   Shift {viewShiftInfo.shiftType} • {viewEmployees.length} active employees
//                 </p>
//               </div>
//               <button 
//                 onClick={() => setShowViewModal(false)} 
//                 className="text-2xl text-gray-400 hover:text-gray-600"
//               >
//                 &times;
//               </button>
//             </div>

//             <div className="flex-1 overflow-y-auto">
//               <table className="w-full">
//                 <thead className="sticky top-0 bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Employee ID</th>
//                     <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Employee Name</th>
//                     <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Time Slot</th>
//                     <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Description</th>
//                     <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {viewEmployees.map((emp) => {
//                     const rowBgColor = getRowBgColor(emp.shiftType);
//                     const textColor = getShiftTextColor(emp.shiftType);

//                     return (
//                       <tr key={emp._id} className={rowBgColor}>
//                         <td className="px-4 py-3">
//                           <div className={`font-medium ${textColor}`}>{emp.employeeAssignment?.employeeId || emp.employeeId}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className={`font-medium ${textColor}`}>{emp.employeeAssignment?.employeeName || emp.employeeName}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className={`font-medium ${textColor}`}>{getEmployeeTimeRange(emp)}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="text-sm text-gray-600">{emp.employeeAssignment?.selectedDescription || "Legacy shift"}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="flex gap-2">
//                             <button
//                               onClick={() => {
//                                 setShowViewModal(false);
//                                 setEditingAssignment(emp);
//                                 setAssignForm({
//                                   employeeId: emp.employeeAssignment?.employeeId || emp.employeeId,
//                                   employeeName: emp.employeeAssignment?.employeeName || emp.employeeName,
//                                   shiftType: emp.shiftType
//                                 });
//                                 setShowAssignModal(true);
//                               }}
//                               className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-blue-600 rounded hover:bg-blue-700"
//                             >
//                               <FaEdit /> Edit
//                             </button>
//                             <button
//                               onClick={() => {
//                                 handleDeleteAssignment(emp._id);
//                                 setShowViewModal(false);
//                               }}
//                               className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-red-600 rounded hover:bg-red-700"
//                             >
//                               <FaTrash /> Delete
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>

//             <div className="p-4 border-t">
//               <button
//                 onClick={() => setShowViewModal(false)}
//                 className="w-full py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-medium"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ShiftManagement;


// import axios from 'axios';
// import { useEffect, useState } from 'react';
// import { FaClock, FaEdit, FaEye, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
// import { isEmployeeHidden } from '../utils/employeeStatus';
// import { API_BASE_URL } from '../config';

// const ShiftManagement = () => {
//   const [masterShifts, setMasterShifts] = useState([]);
//   const [employeeAssignments, setEmployeeAssignments] = useState([]);
//   const [allEmployees, setAllEmployees] = useState([]);
//   const [employeeCounts, setEmployeeCounts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Modals
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showCustomCreateModal, setShowCustomCreateModal] = useState(false);
//   const [showBrakeShiftModal, setShowBrakeShiftModal] = useState(false);
//   const [showAssignModal, setShowAssignModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(false);

//   // Data
//   const [editingAssignment, setEditingAssignment] = useState(null);
//   const [viewingShiftType, setViewingShiftType] = useState('');
//   const [viewEmployees, setViewEmployees] = useState([]);
//   const [viewShiftInfo, setViewShiftInfo] = useState({});

//   // Forms
//   const [createForm, setCreateForm] = useState({
//     shiftType: '',
//     shiftName: '',
//     timeSlots: [{ slotId: `${Date.now()}_1`, timeRange: '', description: '' }],
//     isBrakeShift: false
//   });

//   const [assignForm, setAssignForm] = useState({
//     employeeId: '',
//     employeeName: '',
//     shiftType: ''
//   });

//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const filterInactiveAssignments = (assignments) => {
//     if (!Array.isArray(assignments) || !allEmployees.length) return assignments;

//     return assignments.filter(assignment => {
//       const employeeId = assignment.employeeAssignment?.employeeId || assignment.employeeId;
//       if (!employeeId) return true;

//       const employee = allEmployees.find(emp =>
//         emp.employeeId === employeeId || emp._id === employeeId
//       );

//       if (!employee) return true;

//       return !isEmployeeHidden(employee);
//     });
//   };

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       setError('');

//       console.log("🔄 Fetching data...");

//       try {
//         const employeesRes = await axios.get(`${API_BASE_URL}/employees/get-employees`);
//         if (Array.isArray(employeesRes.data)) {
//           setAllEmployees(employeesRes.data);
//         }
//       } catch (e) {
//         console.error('❌ Error fetching employees:', e);
//       }

//       const shiftsRes = await axios.get(`${API_BASE_URL}/shifts/master`);

//       if (shiftsRes.data.success) {
//         setMasterShifts(shiftsRes.data.data);
//       } else {
//         setError(shiftsRes.data.message);
//       }

//       const assignedRes = await axios.get(`${API_BASE_URL}/shifts/assignments`);

//       if (assignedRes.data.success) {
//         const filteredAssignments = filterInactiveAssignments(assignedRes.data.data);
//         setEmployeeAssignments(filteredAssignments);
//       }

//       const countRes = await axios.get(`${API_BASE_URL}/shifts/employee-count`);

//       if (countRes.data.success) {
//         setEmployeeCounts(countRes.data.data);
//       }

//     } catch (error) {
//       console.error('❌ Fetch error:', error);
//       setError('Server connection failed. Check if backend is running.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleCreateCustomShift = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     try {
//       if (!createForm.shiftType || !createForm.shiftName) {
//         setError('Please enter shift type and name');
//         return;
//       }

//       const slot = createForm.timeSlots[0];
//       if (!slot.timeRange.trim() || !slot.description.trim()) {
//         setError('Please fill time slot details');
//         return;
//       }

//       const response = await axios.post(`${API_BASE_URL}/shifts/create`, {
//         shiftType: createForm.shiftType,
//         shiftName: createForm.shiftName,
//         timeSlots: [slot],
//         isBrakeShift: false
//       });

//       if (response.data.success) {
//         setSuccess(`✅ Custom Shift ${createForm.shiftType} created successfully!`);
//         fetchData();
//         setShowCustomCreateModal(false);
//         setCreateForm({
//           shiftType: '',
//           shiftName: '',
//           timeSlots: [{ slotId: `${Date.now()}_1`, timeRange: '', description: '' }],
//           isBrakeShift: false
//         });
//       } else {
//         setError(response.data.message);
//       }
//     } catch (error) {
//       console.error('Create custom error:', error);
//       setError(error.response?.data?.message || 'Failed to create custom shift');
//     }
//   };

//   const handleCreateBrakeShift = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     try {
//       if (!createForm.shiftType || !createForm.shiftName) {
//         setError('Please enter shift type and name');
//         return;
//       }

//       const response = await axios.post(`${API_BASE_URL}/shifts/create`, {
//         shiftType: createForm.shiftType,
//         shiftName: createForm.shiftName,
//         isBrakeShift: true
//       });

//       if (response.data.success) {
//         setSuccess(`✅ Brake Shift ${createForm.shiftType} created successfully!`);
//         fetchData();
//         setShowBrakeShiftModal(false);
//         setCreateForm({
//           shiftType: '',
//           shiftName: '',
//           timeSlots: [{ slotId: `${Date.now()}_1`, timeRange: '', description: '' }],
//           isBrakeShift: false
//         });
//       } else {
//         setError(response.data.message);
//       }
//     } catch (error) {
//       console.error('Create brake shift error:', error);
//       setError(error.response?.data?.message || 'Failed to create brake shift');
//     }
//   };

//   const updateTimeSlot = (field, value) => {
//     setCreateForm(prev => ({
//       ...prev,
//       timeSlots: [{ ...prev.timeSlots[0], [field]: value }]
//     }));
//   };

//   const getShiftTimeSlot = (shiftType) => {
//     const shift = masterShifts.find(s => s.shiftType === shiftType);
//     return shift?.timeSlots?.[0] || null;
//   };

//   const getBrakeShiftTimeDisplay = (shift) => {
//     if (shift.isBrakeShift && shift.timeSlots.length > 1) {
//       return `${shift.timeSlots[0].timeRange} - ${shift.timeSlots[1].timeRange}`;
//     }
//     return shift.timeSlots?.[0]?.timeRange || "Not set";
//   };

//   const getEmployeesCount = (shiftType) => {
//     return employeeAssignments.filter(a => a.shiftType === shiftType).length;
//   };

//   // ✅ FIXED: Professional standard color types
//   const getShiftColor = (type) => {
//     const colorMap = {
//       // Primary Professional Colors
//       "A": "bg-blue-600",      // Blue - Most common
//       "B": "bg-green-600",     // Green 
//       "C": "bg-green-600",    // Purple
//       "D": "bg-orange-600",    // Orange
//       "E": "bg-red-600",       // Red
//       "F": "bg-teal-600",      // Teal
//       "G": "bg-indigo-600",    // Indigo
//       "H": "bg-pink-600",      // Pink
//       "I": "bg-yellow-600",    // Yellow
//       "J": "bg-cyan-600",      // Cyan

//       // Extended Colors (if needed)
//       "K": "bg-lime-600",
//       "L": "bg-amber-600",
//       "M": "bg-emerald-600",
//       "N": "bg-violet-600",
//       "O": "bg-fuchsia-600",
//       "P": "bg-rose-600",
//       "Q": "bg-sky-600",
//       "R": "bg-gray-600",
//       "S": "bg-stone-600",
//       "T": "bg-zinc-600",
//       "U": "bg-neutral-600",
//       "V": "bg-slate-600",
//       "W": "bg-stone-600",
//       "X": "bg-red-500",
//       "Y": "bg-blue-500",
//       "Z": "bg-green-500",

//       // Special Shifts
//       "BR": "bg-gradient-to-r from-green-600 to-pink-600"  // Brake Shift
//     };

//     return colorMap[type] || "bg-gray-600";
//   };

//   // ✅ FIXED: Light background for table rows
//   const getShiftRowColor = (type) => {
//     const colorMap = {
//       "A": "bg-blue-50 hover:bg-blue-100",
//       "B": "bg-green-50 hover:bg-green-100",
//       "C": "bg-green-50 hover:bg-green-100",
//       "D": "bg-orange-50 hover:bg-orange-100",
//       "E": "bg-red-50 hover:bg-red-100",
//       "F": "bg-teal-50 hover:bg-teal-100",
//       "G": "bg-indigo-50 hover:bg-indigo-100",
//       "H": "bg-pink-50 hover:bg-pink-100",
//       "I": "bg-yellow-50 hover:bg-yellow-100",
//       "J": "bg-cyan-50 hover:bg-cyan-100",
//       "BR": "bg-gradient-to-r from-green-50 to-pink-50 hover:from-green-100 hover:to-pink-100"
//     };

//     return colorMap[type] || "bg-gray-50 hover:bg-gray-100";
//   };

//   const getShiftTextColor = () => {
//     return "text-white";
//   };

//   const getShiftBorderColor = (type) => {
//     const colorMap = {
//       "A": "border-blue-200",
//       "B": "border-green-200",
//       "C": "border-green-200",
//       "D": "border-orange-200",
//       "E": "border-red-200",
//       "F": "border-teal-200",
//       "G": "border-indigo-200",
//       "H": "border-pink-200",
//       "I": "border-yellow-200",
//       "J": "border-cyan-200",
//       "BR": "border-green-200"
//     };

//     return colorMap[type] || "border-gray-200";
//   };

//   // ✅ FIXED: Professional badge colors
//   const getBadgeColor = (type) => {
//     const colorMap = {
//       "A": "bg-blue-100 text-blue-800 border border-blue-200",
//       "B": "bg-green-100 text-green-800 border border-green-200",
//       "C": "bg-green-100 text-green-800 border border-green-200",
//       "D": "bg-orange-100 text-orange-800 border border-orange-200",
//       "E": "bg-red-100 text-red-800 border border-red-200",
//       "F": "bg-teal-100 text-teal-800 border border-teal-200",
//       "G": "bg-indigo-100 text-indigo-800 border border-indigo-200",
//       "H": "bg-pink-100 text-pink-800 border border-pink-200",
//       "I": "bg-yellow-100 text-yellow-800 border border-yellow-200",
//       "J": "bg-cyan-100 text-cyan-800 border border-cyan-200",
//       "BR": "bg-gradient-to-r from-green-100 to-pink-100 text-green-800 border border-green-200"
//     };

//     return colorMap[type] || "bg-gray-100 text-gray-800 border border-gray-200";
//   };

//   const getEmployeeTimeRange = (assignment) => {
//     if (assignment.employeeAssignment?.selectedTimeRange) {
//       return assignment.employeeAssignment.selectedTimeRange;
//     } else if (assignment.startTime && assignment.endTime) {
//       return `${assignment.startTime} - ${assignment.endTime}`;
//     }
//     return "Not specified";
//   };

//   const handleAssignShift = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     try {
//       const { employeeId, employeeName, shiftType } = assignForm;

//       if (!employeeId || !employeeName || !shiftType) {
//         setError('Please fill all required fields');
//         return;
//       }

//       const employee = allEmployees.find(emp =>
//         emp.employeeId === employeeId || emp._id === employeeId
//       );

//       if (employee && isEmployeeHidden(employee)) {
//         setError(`Cannot assign shift to inactive employee: ${employeeName}`);
//         return;
//       }

//       const response = await axios.post(`${API_BASE_URL}/shifts/assign`, {
//         employeeId,
//         employeeName,
//         shiftType
//       });

//       if (response.data.success) {
//         setSuccess(`✅ Shift assigned to ${employeeName} successfully!`);
//         fetchData();
//         setShowAssignModal(false);
//         setAssignForm({
//           employeeId: '',
//           employeeName: '',
//           shiftType: ''
//         });
//       } else {
//         setError(response.data.message || 'Failed to assign shift');
//       }
//     } catch (error) {
//       console.error('❌ Assign error:', error);
//       setError(error.response?.data?.message || 'Failed to assign shift');
//     }
//   };

//   const handleUpdateAssignment = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     try {
//       const { employeeName, shiftType } = assignForm;

//       if (!employeeName || !shiftType) {
//         setError('Please fill all required fields');
//         return;
//       }

//       const response = await axios.put(
//         `${API_BASE_URL}/shifts/assignments/${editingAssignment._id}`,
//         {
//           employeeName,
//           shiftType
//         }
//       );

//       if (response.data.success) {
//         setSuccess('✅ Assignment updated successfully!');
//         fetchData();
//         setShowAssignModal(false);
//         setEditingAssignment(null);
//         setAssignForm({
//           employeeId: '',
//           employeeName: '',
//           shiftType: ''
//         });
//       } else {
//         setError(response.data.message || 'Failed to update assignment');
//       }
//     } catch (error) {
//       console.error('❌ Update error:', error);
//       setError(error.response?.data?.message || 'Failed to update assignment');
//     }
//   };

//   const handleDeleteAssignment = async (id) => {
//     if (window.confirm('Are you sure you want to delete this assignment?')) {
//       try {
//         const response = await axios.delete(`${API_BASE_URL}/shifts/assignments/${id}`);
//         if (response.data.success) {
//           setSuccess('Shift assignment removed successfully');
//           fetchData();
//         }
//       } catch (error) {
//         setError('Failed to delete assignment');
//       }
//     }
//   };

//   const handleDeleteMasterShift = async (id, shiftName) => {
//     if (window.confirm(`Delete ${shiftName}? This will remove all assignments.`)) {
//       try {
//         const response = await axios.delete(`${API_BASE_URL}/shifts/master/${id}`);
//         if (response.data.success) {
//           setSuccess(response.data.message);
//           fetchData();
//         }
//       } catch (error) {
//         setError('Failed to delete shift');
//       }
//     }
//   };

//   const handleViewEmployees = async (shiftType, shiftName) => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/shifts/type/${shiftType}/employees`);
//       if (response.data.success) {
//         const employees = response.data.data.employees || [];
//         const filteredEmployees = filterInactiveAssignments(employees);

//         setViewShiftInfo({
//           shiftType,
//           shiftName,
//           isBrakeShift: response.data.data.isBrakeShift || false
//         });
//         setViewEmployees(filteredEmployees);
//         setViewingShiftType(shiftType);
//         setShowViewModal(true);
//       }
//     } catch (error) {
//       setError('Failed to fetch employees');
//     }
//   };

//   const handleCreateDefaultShifts = async () => {
//     try {
//       const response = await axios.post(`${API_BASE_URL}/shifts/create-defaults`);
//       if (response.data.success) {
//         setSuccess(`✅ Created ${response.data.createdCount} default shifts (A-D + Brake Shift)`);
//         fetchData();
//       }
//     } catch (error) {
//       setError('Failed to create default shifts');
//     }
//   };

//   const getEmployeeName = (assignment) => {
//     return assignment.employeeAssignment?.employeeName || assignment.employeeName || "Unknown";
//   };

//   const getEmployeeId = (assignment) => {
//     return assignment.employeeAssignment?.employeeId || assignment.employeeId || "Unknown";
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
//         <p className="ml-4">Loading shifts...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4">
//       {/* Header */}
//       <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">Shifts</h1>
//           {/* <p className="text-gray-600">Manage employee shifts and assignments</p> */}
//         </div>
//         <div className="flex flex-wrap gap-2">
//           {masterShifts.length === 0 && (
//             <button
//               onClick={handleCreateDefaultShifts}
//               className="flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
//             >
//               <FaPlus /> Create Default Shifts
//             </button>
//           )}
//           <button
//             onClick={() => setShowCustomCreateModal(true)}
//             className="flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
//           >
//             <FaPlus /> Create Regular Shift
//           </button>
//           <button
//             onClick={() => setShowBrakeShiftModal(true)}
//             className="flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-gradient-to-r from-green-600 to-pink-600 rounded-lg hover:from-green-700 hover:to-pink-700 transition-all"
//           >
//             <FaPlus /> Create Brake Shift
//           </button>
//           <button
//             onClick={() => setShowAssignModal(true)}
//             className="flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             <FaClock /> Assign Shift
//           </button>
//         </div>
//       </div>

//       {/* Messages */}
//       {error && (
//         <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
//           ❌ {error}
//         </div>
//       )}
//       {success && (
//         <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 border border-green-200 rounded-lg">
//           ✅ {success}
//         </div>
//       )}

//       {/* ✅ 1. AVAILABLE SHIFTS SECTION - CARD GRID FORMAT */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-xl font-bold text-gray-800">Available Shifts ({masterShifts.length})</h2>
//           {/* <p className="text-sm text-gray-500">Click to view or assign employees</p> */}
//         </div>

//         {masterShifts.length === 0 ? (
//           <div className="py-12 text-center border border-gray-200 rounded-lg bg-gray-50">
//             <div className="mb-4 text-6xl text-gray-400">⏰</div>
//             <h3 className="mb-2 text-xl font-semibold text-gray-600">No shifts created yet</h3>
//             <p className="mb-4 text-gray-500">Create your first shift to get started</p>
//             <div className="flex justify-center gap-2">
//               <button
//                 onClick={() => setShowCustomCreateModal(true)}
//                 className="px-4 py-2 text-sm text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
//               >
//                 Create Regular Shift
//               </button>
//               <button
//                 onClick={() => setShowBrakeShiftModal(true)}
//                 className="px-4 py-2 text-sm text-white transition-all rounded-lg bg-gradient-to-r from-green-600 to-pink-600 hover:from-green-700 hover:to-pink-700"
//               >
//                 Create Brake Shift
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//             {masterShifts.map((shift) => {
//               const timeSlot = shift.timeSlots?.[0];
//               const employeeCount = getEmployeesCount(shift.shiftType);
//               const shiftColor = getShiftColor(shift.shiftType);
//               const textColor = getShiftTextColor();
//               const borderColor = getShiftBorderColor(shift.shiftType);
//               const isBrakeShift = shift.isBrakeShift;

//               return (
//                 <div
//                   key={shift._id}
//                   className={`p-4 border rounded-lg shadow-sm transition-all duration-200 hover:shadow-md ${shiftColor} ${borderColor} ${textColor}`}
//                 >
//                   {/* Shift Header */}
//                   <div className="flex items-start justify-between mb-3">
//                     <div className="flex items-start gap-2">
//                       <div className="p-1.5 rounded-md bg-white/20 backdrop-blur-sm">
//                         <FaClock className="text-sm" />
//                       </div>
//                       <div>
//                         <span className="text-sm font-semibold">
//                           Shift {shift.shiftType} {isBrakeShift && '(Brake)'}
//                         </span>
//                         <div className="text-xs text-white/90">
//                           {shift.shiftName}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="text-right">
//                       <div className="text-xl font-bold">{employeeCount}</div>
//                       <div className="text-xs text-white/80">employees</div>
//                     </div>
//                   </div>

//                   {/* Time Slot */}
//                   <div className="mb-3">
//                     <div className="flex items-center gap-1 mb-0.5">
//                       <span className="text-sm font-medium">
//                         {isBrakeShift ? getBrakeShiftTimeDisplay(shift) : (timeSlot?.timeRange || "Not set")}
//                       </span>
//                       {isBrakeShift && (
//                         <span className="px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
//                           Brake
//                         </span>
//                       )}
//                     </div>
//                     <p className="text-xs text-white/80 line-clamp-1">
//                       {isBrakeShift ?
//                         "07:00-13:00 & 17:00-21:30 with break" :
//                         (timeSlot?.description || "No description")}
//                     </p>
//                   </div>

//                   {/* Actions */}
//                   <div className="flex gap-1.5">
//                     <button
//                       onClick={() => handleViewEmployees(shift.shiftType, shift.shiftName)}
//                       disabled={employeeCount === 0}
//                       className={`flex-1 px-2 py-1.5 text-xs rounded flex items-center justify-center gap-1 ${employeeCount > 0
//                         ? 'bg-white/20 text-white hover:bg-white/30 transition-colors'
//                         : 'bg-white/10 text-white/50 cursor-not-allowed'
//                         }`}
//                     >
//                       <FaEye className="text-xs" /> View
//                     </button>
//                     <button
//                       onClick={() => {
//                         setAssignForm({
//                           employeeId: '',
//                           employeeName: '',
//                           shiftType: shift.shiftType
//                         });
//                         setEditingAssignment(null);
//                         setShowAssignModal(true);
//                       }}
//                       className="flex-1 px-2 py-1.5 text-xs text-white bg-white/30 rounded hover:bg-white/40 transition-colors flex items-center justify-center gap-1"
//                       title="Assign employee to this shift"
//                     >
//                       <FaPlus className="text-xs" /> Assign
//                     </button>
//                     <button
//                       onClick={() => handleDeleteMasterShift(shift._id, shift.shiftName)}
//                       className="px-2 py-1.5 text-xs text-white bg-white/20 rounded hover:bg-white/30 transition-colors flex items-center justify-center"
//                       title="Delete this shift"
//                     >
//                       <FaTimes className="text-xs" />
//                     </button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* ✅ 2. ALL ASSIGNED EMPLOYEES TABLE - PROFESSIONAL DESIGN */}
//       {employeeAssignments.length > 0 && (
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-bold text-gray-800">Assigned Employees ({employeeAssignments.length})</h2>
//             {/* <p className="text-sm text-gray-500">List of all active shift assignments</p> */}
//           </div>
//           <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//             <table className="min-w-full">
//               <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
//                 <tr>
//                   <th className="py-3 text-center">Employee ID</th>
//                   <th className="py-3 text-center">Employee Name</th>
//                   <th className="py-3 text-center">Shift</th>
//                   <th className="py-3 text-center">Time Slot</th>
//                   <th className="py-3 text-center">Description</th>
//                   <th className="py-3 text-center">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {employeeAssignments.map((assignment) => {
//                   const timeSlot = getShiftTimeSlot(assignment.shiftType);
//                   const employeeName = getEmployeeName(assignment);
//                   const employeeId = getEmployeeId(assignment);
//                   const shift = masterShifts.find(s => s.shiftType === assignment.shiftType);
//                   const isBrakeShift = shift?.isBrakeShift || false;
//                   const rowColor = getShiftRowColor(assignment.shiftType);

//                   return (
//                     <tr key={assignment._id} className={`${rowColor} transition-colors duration-150`}>
//                       <td className="px-4 py-3">
//                         <div className="p-4 text-sm font-medium text-gray-900">{employeeId}</div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="p-4 text-sm font-medium text-gray-900">{employeeName}</div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className={`p-4 text-sm font-medium rounded-full ${getBadgeColor(assignment.shiftType)}`}>
//                           Shift {assignment.shiftType} {isBrakeShift && '(Brake)'}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="p-4 text-sm font-medium text-gray-900">
//                           {isBrakeShift ?
//                             "07:00-13:00 & 17:00-21:30" :
//                             getEmployeeTimeRange(assignment)}
//                         </div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="p-4 text-sm font-medium text-gray-900">
//                           {isBrakeShift ?
//                             "Brake shift with afternoon break" :
//                             (assignment.employeeAssignment?.selectedDescription || timeSlot?.description || "Shift timing")}
//                         </div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => {
//                               setEditingAssignment(assignment);
//                               setAssignForm({
//                                 employeeId: assignment.employeeAssignment?.employeeId || assignment.employeeId,
//                                 employeeName: assignment.employeeAssignment?.employeeName || assignment.employeeName,
//                                 shiftType: assignment.shiftType
//                               });
//                               setShowAssignModal(true);
//                             }}
//                             className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors"
//                             title="Edit Assignment"
//                           >
//                             <FaEdit /> Edit
//                           </button>
//                           <button
//                             onClick={() => handleDeleteAssignment(assignment._id)}
//                             className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 border border-red-200 transition-colors"
//                             title="Delete Assignment"
//                           >
//                             <FaTrash /> Remove
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* REGULAR SHIFT CREATE MODAL */}
//       {showCustomCreateModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
//             <div className="flex items-center justify-between p-4 border-b">
//               <h3 className="text-lg font-semibold text-gray-800">Create Regular Shift</h3>
//               <button onClick={() => setShowCustomCreateModal(false)} className="text-xl text-gray-400 transition-colors hover:text-gray-600">
//                 &times;
//               </button>
//             </div>

//             <form onSubmit={handleCreateCustomShift} className="p-4">
//               <div className="space-y-4">
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label className="block mb-1.5 text-sm text-sm text-gray-700">
//                       Shift Type (Letter A-Z) *
//                     </label>
//                     <input
//                       type="text"
//                       maxLength="1"
//                       value={createForm.shiftType}
//                       onChange={(e) => setCreateForm(prev => ({
//                         ...prev,
//                         shiftType: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')
//                       }))}
//                       className="w-full px-3 py-2 text-sm uppercase transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                       placeholder="E"
//                       required
//                     />
//                     <p className="mt-1 text-xs text-gray-500">Enter a single letter (A-Z)</p>
//                   </div>

//                   <div>
//                     <label className="block mb-1.5 text-sm text-sm text-gray-700">
//                       Shift Name *
//                     </label>
//                     <input
//                       type="text"
//                       value={createForm.shiftName}
//                       onChange={(e) => setCreateForm(prev => ({ ...prev, shiftName: e.target.value }))}
//                       className="w-full px-3 py-2 text-sm transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                       placeholder="e.g., Extended Shift E"
//                       required
//                     />
//                   </div>
//                 </div>

//                 {/* Single Time Slot Configuration */}
//                 <div>
//                   <label className="block mb-2 text-sm text-gray-700">
//                     Time Slot Configuration *
//                   </label>

//                   <div className="p-3 space-y-3 border border-gray-200 rounded-lg bg-gray-50">
//                     <div>
//                       <label className="block mb-1 text-xs text-gray-600">Time Range *</label>
//                       <input
//                         type="text"
//                         value={createForm.timeSlots[0].timeRange}
//                         onChange={(e) => updateTimeSlot('timeRange', e.target.value)}
//                         className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent transition-all"
//                         placeholder="e.g., 10:00 - 19:00"
//                         required
//                       />
//                     </div>

//                     <div>
//                       <label className="block mb-1 text-xs text-gray-600">Description *</label>
//                       <input
//                         type="text"
//                         value={createForm.timeSlots[0].description}
//                         onChange={(e) => updateTimeSlot('description', e.target.value)}
//                         className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent transition-all"
//                         placeholder="e.g., Morning 10 to 7"
//                         required
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Preview */}
//                 {createForm.shiftType && createForm.timeSlots[0].timeRange && (
//                   <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
//                     <h4 className="mb-1.5 text-sm text-sm text-gray-800">Preview:</h4>
//                     <p className="text-sm text-gray-700">
//                       Shift {createForm.shiftType}: {createForm.shiftName}
//                     </p>
//                     <p className="mt-0.5 text-sm text-gray-600">
//                       Time: {createForm.timeSlots[0].timeRange}
//                     </p>
//                   </div>
//                 )}
//               </div>

//               <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
//                 <button
//                   type="button"
//                   onClick={() => setShowCustomCreateModal(false)}
//                   className="px-4 py-2 text-sm text-gray-700 transition-colors bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 text-sm text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
//                 >
//                   Create Regular Shift
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ✅ BRAKE SHIFT CREATE MODAL */}
//       {showBrakeShiftModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
//             <div className="flex items-center justify-between p-4 border-b">
//               <h3 className="text-lg font-semibold text-gray-800">Create Brake Shift</h3>
//               <button onClick={() => setShowBrakeShiftModal(false)} className="text-xl text-gray-400 transition-colors hover:text-gray-600">
//                 &times;
//               </button>
//             </div>

//             <form onSubmit={handleCreateBrakeShift} className="p-4">
//               <div className="space-y-4">
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label className="block mb-1.5 text-sm text-sm text-gray-700">
//                       Shift Type (Letter A-Z) *
//                     </label>
//                     <input
//                       type="text"
//                       maxLength="2"
//                       value={createForm.shiftType}
//                       onChange={(e) => setCreateForm(prev => ({
//                         ...prev,
//                         shiftType: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')
//                       }))}
//                       className="w-full px-3 py-2 text-sm uppercase transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                       placeholder="BR"
//                       required
//                     />
//                     <p className="mt-1 text-xs text-gray-500">Enter letter(s) for brake shift</p>
//                   </div>

//                   <div>
//                     <label className="block mb-1.5 text-sm text-sm text-gray-700">
//                       Shift Name *
//                     </label>
//                     <input
//                       type="text"
//                       value={createForm.shiftName}
//                       onChange={(e) => setCreateForm(prev => ({ ...prev, shiftName: e.target.value }))}
//                       className="w-full px-3 py-2 text-sm transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                       placeholder="e.g., Brake Shift"
//                       required
//                     />
//                   </div>
//                 </div>

//                 {/* Brake Shift Information */}
//                 <div className="p-3 border border-green-200 rounded-lg bg-gradient-to-r from-green-50 to-pink-50">
//                   <h4 className="mb-2 text-sm text-green-800">Brake Shift Details</h4>
//                   <div className="space-y-2">
//                     <div className="flex items-center gap-2">
//                       <div className="flex items-center justify-center bg-green-100 rounded-full w-7 h-7">
//                         <FaClock className="text-xs text-green-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm text-gray-800">07:00 - 13:00</p>
//                         <p className="text-xs text-gray-600">First shift before break</p>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-2">
//                       <div className="flex items-center justify-center bg-pink-100 rounded-full w-7 h-7">
//                         <FaClock className="text-xs text-pink-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm text-gray-800">17:00 - 21:30</p>
//                         <p className="text-xs text-gray-600">Second shift after break</p>
//                       </div>
//                     </div>

//                     <div className="p-1.5 text-xs text-gray-600 bg-white/50 rounded">
//                       Total working hours: 10.5 hours with afternoon break
//                     </div>
//                   </div>
//                 </div>

//                 {/* Preview */}
//                 {createForm.shiftType && (
//                   <div className="p-3 border border-green-200 rounded-lg bg-green-50">
//                     <h4 className="mb-1.5 text-sm text-sm text-green-800">Preview:</h4>
//                     <p className="text-sm text-green-700">
//                       Shift {createForm.shiftType} (Brake): {createForm.shiftName}
//                     </p>
//                     <p className="mt-0.5 text-sm text-green-600">
//                       Time: 07:00-13:00 & 17:00-21:30
//                     </p>
//                   </div>
//                 )}
//               </div>

//               <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
//                 <button
//                   type="button"
//                   onClick={() => setShowBrakeShiftModal(false)}
//                   className="px-4 py-2 text-sm text-gray-700 transition-colors bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 text-sm text-white transition-all rounded-lg bg-gradient-to-r from-green-600 to-pink-600 hover:from-green-700 hover:to-pink-700"
//                 >
//                   Create Brake Shift
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ASSIGN SHIFT MODAL */}
//       {showAssignModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
//             <div className="flex items-center justify-between p-4 border-b">
//               <h3 className="text-lg font-semibold text-gray-800">
//                 {editingAssignment ? 'Edit Assignment' : 'Assign Shift'}
//               </h3>
//               <button onClick={() => setShowAssignModal(false)} className="text-xl text-gray-400 transition-colors hover:text-gray-600">
//                 &times;
//               </button>
//             </div>

//             <form onSubmit={editingAssignment ? handleUpdateAssignment : handleAssignShift} className="p-4">
//               <div className="space-y-3">
//                 <div>
//                   <label className="block mb-1.5 text-sm text-sm text-gray-700">
//                     Employee ID {editingAssignment && '(Cannot change)'}
//                   </label>
//                   <input
//                     type="text"
//                     value={assignForm.employeeId}
//                     onChange={(e) => setAssignForm(prev => ({ ...prev, employeeId: e.target.value }))}
//                     className="w-full px-3 py-2 text-sm transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="EMP001"
//                     required
//                     readOnly={!!editingAssignment}
//                   />
//                 </div>

//                 <div>
//                   <label className="block mb-1.5 text-sm text-sm text-gray-700">
//                     Employee Name *
//                   </label>
//                   <input
//                     type="text"
//                     value={assignForm.employeeName}
//                     onChange={(e) => setAssignForm(prev => ({ ...prev, employeeName: e.target.value }))}
//                     className="w-full px-3 py-2 text-sm transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="John Doe"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block mb-1.5 text-sm text-sm text-gray-700">
//                     Select Shift Type *
//                   </label>
//                   <select
//                     value={assignForm.shiftType}
//                     onChange={(e) => setAssignForm(prev => ({ ...prev, shiftType: e.target.value }))}
//                     className="w-full px-3 py-2 text-sm transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     required
//                   >
//                     <option value="">Select Shift Type</option>
//                     {masterShifts.map(shift => (
//                       <option key={shift._id} value={shift.shiftType}>
//                         Shift {shift.shiftType}: {shift.shiftName} {shift.isBrakeShift && '(Brake)'}
//                         ({shift.isBrakeShift ? '07:00-13:00 & 17:00-21:30' : shift.timeSlots?.[0]?.timeRange})
//                       </option>
//                     ))}
//                     {employeeAssignments
//                       .map(a => a.shiftType)
//                       .filter((type, index, self) =>
//                         self.indexOf(type) === index &&
//                         !masterShifts.find(s => s.shiftType === type)
//                       )
//                       .map(type => (
//                         <option key={type} value={type}>
//                           Shift {type} (Legacy)
//                         </option>
//                       ))
//                     }
//                   </select>

//                   {assignForm.shiftType && masterShifts.find(s => s.shiftType === assignForm.shiftType) && (
//                     <div className="p-2 mt-1.5 text-xs rounded bg-blue-50 border border-blue-100">
//                       <p className="text-blue-700">
//                         Time: {
//                           masterShifts.find(s => s.shiftType === assignForm.shiftType)?.isBrakeShift ?
//                             "07:00-13:00 & 17:00-21:30 (Brake Shift)" :
//                             getShiftTimeSlot(assignForm.shiftType)?.timeRange || "Not specified"
//                         }
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowAssignModal(false);
//                     setEditingAssignment(null);
//                     setAssignForm({
//                       employeeId: '',
//                       employeeName: '',
//                       shiftType: ''
//                     });
//                   }}
//                   className="px-4 py-2 text-sm text-gray-700 transition-colors bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 text-sm text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
//                 >
//                   {editingAssignment ? 'Update' : 'Assign'} Shift
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ✅ VIEW EMPLOYEES MODAL - PROFESSIONAL DESIGN */}
//       {showViewModal && viewEmployees.length > 0 && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
//             <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-800">
//                   {viewShiftInfo.shiftName} Employees
//                 </h3>
//                 <p className="text-sm text-gray-600">
//                   Shift {viewShiftInfo.shiftType} • {viewEmployees.length} active employees
//                 </p>
//               </div>
//               <button
//                 onClick={() => setShowViewModal(false)}
//                 className="text-xl text-gray-400 transition-colors hover:text-gray-600"
//               >
//                 &times;
//               </button>
//             </div>

//             <div className="flex-1 overflow-y-auto">
//               <table className="w-full">
//                 <thead className="sticky top-0 border-b border-gray-200 bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Employee ID</th>
//                     <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Employee Name</th>
//                     <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Time Slot</th>
//                     <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Description</th>
//                     <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {viewEmployees.map((emp) => {
//                     const rowColor = getShiftRowColor(emp.shiftType);
//                     const shift = masterShifts.find(s => s.shiftType === emp.shiftType);
//                     const isBrakeShift = shift?.isBrakeShift || false;

//                     return (
//                       <tr key={emp._id} className={`${rowColor} transition-colors duration-150`}>
//                         <td className="px-4 py-3">
//                           <div className="text-sm text-gray-900">{emp.employeeAssignment?.employeeId || emp.employeeId}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="text-sm text-gray-900">{emp.employeeAssignment?.employeeName || emp.employeeName}</div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="text-sm text-gray-900">
//                             {isBrakeShift ? "07:00-13:00 & 17:00-21:30" : getEmployeeTimeRange(emp)}
//                           </div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="text-sm text-gray-600">
//                             {isBrakeShift ? "Brake shift with afternoon break" : (emp.employeeAssignment?.selectedDescription || "Legacy shift")}
//                           </div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="flex gap-2">
//                             <button
//                               onClick={() => {
//                                 setShowViewModal(false);
//                                 setEditingAssignment(emp);
//                                 setAssignForm({
//                                   employeeId: emp.employeeAssignment?.employeeId || emp.employeeId,
//                                   employeeName: emp.employeeAssignment?.employeeName || emp.employeeName,
//                                   shiftType: emp.shiftType
//                                 });
//                                 setShowAssignModal(true);
//                               }}
//                               className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors"
//                             >
//                               <FaEdit /> Edit
//                             </button>
//                             <button
//                               onClick={() => {
//                                 handleDeleteAssignment(emp._id);
//                                 setShowViewModal(false);
//                               }}
//                               className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 border border-red-200 transition-colors"
//                             >
//                               <FaTrash /> Delete
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>

//             <div className="p-4 border-t border-gray-200 bg-gray-50">
//               <button
//                 onClick={() => setShowViewModal(false)}
//                 className="w-full py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm text-sm transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ShiftManagement;

// import axios from 'axios';
// import { useEffect, useState } from 'react';
// import { FaClock, FaEdit, FaEye, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
// import { API_BASE_URL } from '../config';
// import { isEmployeeHidden } from '../utils/employeeStatus';

// const ShiftManagement = () => {
//   const [masterShifts, setMasterShifts] = useState([]);
//   const [employeeAssignments, setEmployeeAssignments] = useState([]);
//   const [allEmployees, setAllEmployees] = useState([]);
//   const [employeeCounts, setEmployeeCounts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Modals
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showCustomCreateModal, setShowCustomCreateModal] = useState(false);
//   const [showBrakeShiftModal, setShowBrakeShiftModal] = useState(false);
//   const [showAssignModal, setShowAssignModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(false);

//   // Data
//   const [editingAssignment, setEditingAssignment] = useState(null);
//   const [viewingShiftType, setViewingShiftType] = useState('');
//   const [viewEmployees, setViewEmployees] = useState([]);
//   const [viewShiftInfo, setViewShiftInfo] = useState({});

//   // Forms
//   const [createForm, setCreateForm] = useState({
//     shiftType: '',
//     shiftName: '',
//     timeSlots: [{ slotId: `${Date.now()}_1`, timeRange: '', description: '' }],
//     isBrakeShift: false
//   });

//   const [assignForm, setAssignForm] = useState({
//     employeeId: '',
//     employeeName: '',
//     shiftType: ''
//   });

//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   // Pagination states for tables
//   const [currentPageAssignments, setCurrentPageAssignments] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);

//   const filterInactiveAssignments = (assignments) => {
//     if (!Array.isArray(assignments) || !allEmployees.length) return assignments;

//     return assignments.filter(assignment => {
//       const employeeId = assignment.employeeAssignment?.employeeId || assignment.employeeId;
//       if (!employeeId) return true;

//       const employee = allEmployees.find(emp =>
//         emp.employeeId === employeeId || emp._id === employeeId
//       );

//       if (!employee) return true;

//       return !isEmployeeHidden(employee);
//     });
//   };

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       setError('');

//       console.log("🔄 Fetching data...");

//       try {
//         const employeesRes = await axios.get(`${API_BASE_URL}/employees/get-employees`);
//         if (Array.isArray(employeesRes.data)) {
//           setAllEmployees(employeesRes.data);
//         }
//       } catch (e) {
//         console.error('❌ Error fetching employees:', e);
//       }

//       const shiftsRes = await axios.get(`${API_BASE_URL}/shifts/master`);

//       if (shiftsRes.data.success) {
//         setMasterShifts(shiftsRes.data.data);
//       } else {
//         setError(shiftsRes.data.message);
//       }

//       const assignedRes = await axios.get(`${API_BASE_URL}/shifts/assignments`);

//       if (assignedRes.data.success) {
//         const filteredAssignments = filterInactiveAssignments(assignedRes.data.data);
//         setEmployeeAssignments(filteredAssignments);
//       }

//       const countRes = await axios.get(`${API_BASE_URL}/shifts/employee-count`);

//       if (countRes.data.success) {
//         setEmployeeCounts(countRes.data.data);
//       }

//     } catch (error) {
//       console.error('❌ Fetch error:', error);
//       setError('Server connection failed. Check if backend is running.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleCreateCustomShift = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     try {
//       if (!createForm.shiftType || !createForm.shiftName) {
//         setError('Please enter shift type and name');
//         return;
//       }

//       const slot = createForm.timeSlots[0];
//       if (!slot.timeRange.trim() || !slot.description.trim()) {
//         setError('Please fill time slot details');
//         return;
//       }

//       const response = await axios.post(`${API_BASE_URL}/shifts/create`, {
//         shiftType: createForm.shiftType,
//         shiftName: createForm.shiftName,
//         timeSlots: [slot],
//         isBrakeShift: false
//       });

//       if (response.data.success) {
//         setSuccess(`✅ Custom Shift ${createForm.shiftType} created successfully!`);
//         fetchData();
//         setShowCustomCreateModal(false);
//         setCreateForm({
//           shiftType: '',
//           shiftName: '',
//           timeSlots: [{ slotId: `${Date.now()}_1`, timeRange: '', description: '' }],
//           isBrakeShift: false
//         });
//       } else {
//         setError(response.data.message);
//       }
//     } catch (error) {
//       console.error('Create custom error:', error);
//       setError(error.response?.data?.message || 'Failed to create custom shift');
//     }
//   };

//   const handleCreateBrakeShift = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     try {
//       if (!createForm.shiftType || !createForm.shiftName) {
//         setError('Please enter shift type and name');
//         return;
//       }

//       const response = await axios.post(`${API_BASE_URL}/shifts/create`, {
//         shiftType: createForm.shiftType,
//         shiftName: createForm.shiftName,
//         isBrakeShift: true
//       });

//       if (response.data.success) {
//         setSuccess(`✅ Brake Shift ${createForm.shiftType} created successfully!`);
//         fetchData();
//         setShowBrakeShiftModal(false);
//         setCreateForm({
//           shiftType: '',
//           shiftName: '',
//           timeSlots: [{ slotId: `${Date.now()}_1`, timeRange: '', description: '' }],
//           isBrakeShift: false
//         });
//       } else {
//         setError(response.data.message);
//       }
//     } catch (error) {
//       console.error('Create brake shift error:', error);
//       setError(error.response?.data?.message || 'Failed to create brake shift');
//     }
//   };

//   const updateTimeSlot = (field, value) => {
//     setCreateForm(prev => ({
//       ...prev,
//       timeSlots: [{ ...prev.timeSlots[0], [field]: value }]
//     }));
//   };

//   const getShiftTimeSlot = (shiftType) => {
//     const shift = masterShifts.find(s => s.shiftType === shiftType);
//     return shift?.timeSlots?.[0] || null;
//   };

//   const getBrakeShiftTimeDisplay = (shift) => {
//     if (shift.isBrakeShift && shift.timeSlots.length > 1) {
//       return `${shift.timeSlots[0].timeRange} - ${shift.timeSlots[1].timeRange}`;
//     }
//     return shift.timeSlots?.[0]?.timeRange || "Not set";
//   };

//   const getEmployeesCount = (shiftType) => {
//     return employeeAssignments.filter(a => a.shiftType === shiftType).length;
//   };

//   // Professional color mapping
//   const getShiftColor = (type) => {
//     const colorMap = {
//       "A": "bg-blue-600",
//       "B": "bg-green-600",
//       "C": "bg-green-600",
//       "D": "bg-orange-600",
//       "E": "bg-red-600",
//       "F": "bg-teal-600",
//       "G": "bg-indigo-600",
//       "H": "bg-pink-600",
//       "I": "bg-yellow-600",
//       "J": "bg-cyan-600",
//       "K": "bg-lime-600",
//       "L": "bg-amber-600",
//       "M": "bg-emerald-600",
//       "N": "bg-violet-600",
//       "O": "bg-fuchsia-600",
//       "P": "bg-rose-600",
//       "Q": "bg-sky-600",
//       "R": "bg-gray-600",
//       "S": "bg-stone-600",
//       "T": "bg-zinc-600",
//       "U": "bg-neutral-600",
//       "V": "bg-slate-600",
//       "W": "bg-stone-600",
//       "X": "bg-red-500",
//       "Y": "bg-blue-500",
//       "Z": "bg-green-500",
//       "BR": "bg-gradient-to-r from-green-600 to-pink-600"
//     };

//     return colorMap[type] || "bg-gray-600";
//   };

//   const getShiftRowColor = (type) => {
//     const colorMap = {
//       "A": "bg-blue-50 hover:bg-blue-100",
//       "B": "bg-green-50 hover:bg-green-100",
//       "C": "bg-green-50 hover:bg-green-100",
//       "D": "bg-orange-50 hover:bg-orange-100",
//       "E": "bg-red-50 hover:bg-red-100",
//       "F": "bg-teal-50 hover:bg-teal-100",
//       "G": "bg-indigo-50 hover:bg-indigo-100",
//       "H": "bg-pink-50 hover:bg-pink-100",
//       "I": "bg-yellow-50 hover:bg-yellow-100",
//       "J": "bg-cyan-50 hover:bg-cyan-100",
//       "BR": "bg-gradient-to-r from-green-50 to-pink-50 hover:from-green-100 hover:to-pink-100"
//     };

//     return colorMap[type] || "bg-gray-50 hover:bg-gray-100";
//   };

//   const getShiftTextColor = () => {
//     return "text-white";
//   };

//   const getShiftBorderColor = (type) => {
//     const colorMap = {
//       "A": "border-blue-200",
//       "B": "border-green-200",
//       "C": "border-purple-200",
//       "D": "border-orange-200",
//       "E": "border-red-200",
//       "F": "border-teal-200",
//       "G": "border-indigo-200",
//       "H": "border-pink-200",
//       "I": "border-yellow-200",
//       "J": "border-cyan-200",
//       "BR": "border-green-200"
//     };

//     return colorMap[type] || "border-gray-200";
//   };

//   const getBadgeColor = (type) => {
//     const colorMap = {
//       "A": "bg-blue-100 text-blue-800 border border-blue-200",
//       "B": "bg-green-100 text-green-800 border border-green-200",
//       "C": "bg-green-100 text-purple-800 border border-green-200",
//       "D": "bg-orange-100 text-orange-800 border border-orange-200",
//       "E": "bg-red-100 text-red-800 border border-red-200",
//       "F": "bg-teal-100 text-teal-800 border border-teal-200",
//       "G": "bg-indigo-100 text-indigo-800 border border-indigo-200",
//       "H": "bg-pink-100 text-pink-800 border border-pink-200",
//       "I": "bg-yellow-100 text-yellow-800 border border-yellow-200",
//       "J": "bg-cyan-100 text-cyan-800 border border-cyan-200",
//       "BR": "bg-gradient-to-r from-green-100 to-pink-100 text-green-800 border border-green-200"
//     };

//     return colorMap[type] || "bg-gray-100 text-gray-800 border border-gray-200";
//   };

//   const getEmployeeTimeRange = (assignment) => {
//     if (assignment.employeeAssignment?.selectedTimeRange) {
//       return assignment.employeeAssignment.selectedTimeRange;
//     } else if (assignment.startTime && assignment.endTime) {
//       return `${assignment.startTime} - ${assignment.endTime}`;
//     }
//     return "Not specified";
//   };

//   const handleAssignShift = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     try {
//       const { employeeId, employeeName, shiftType } = assignForm;

//       if (!employeeId || !employeeName || !shiftType) {
//         setError('Please fill all required fields');
//         return;
//       }

//       const employee = allEmployees.find(emp =>
//         emp.employeeId === employeeId || emp._id === employeeId
//       );

//       if (employee && isEmployeeHidden(employee)) {
//         setError(`Cannot assign shift to inactive employee: ${employeeName}`);
//         return;
//       }

//       const response = await axios.post(`${API_BASE_URL}/shifts/assign`, {
//         employeeId,
//         employeeName,
//         shiftType
//       });

//       if (response.data.success) {
//         setSuccess(`✅ Shift assigned to ${employeeName} successfully!`);
//         fetchData();
//         setShowAssignModal(false);
//         setAssignForm({
//           employeeId: '',
//           employeeName: '',
//           shiftType: ''
//         });
//       } else {
//         setError(response.data.message || 'Failed to assign shift');
//       }
//     } catch (error) {
//       console.error('❌ Assign error:', error);
//       setError(error.response?.data?.message || 'Failed to assign shift');
//     }
//   };

//   const handleUpdateAssignment = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     try {
//       const { employeeName, shiftType } = assignForm;

//       if (!employeeName || !shiftType) {
//         setError('Please fill all required fields');
//         return;
//       }

//       const response = await axios.put(
//         `${API_BASE_URL}/shifts/assignments/${editingAssignment._id}`,
//         {
//           employeeName,
//           shiftType
//         }
//       );

//       if (response.data.success) {
//         setSuccess('✅ Assignment updated successfully!');
//         fetchData();
//         setShowAssignModal(false);
//         setEditingAssignment(null);
//         setAssignForm({
//           employeeId: '',
//           employeeName: '',
//           shiftType: ''
//         });
//       } else {
//         setError(response.data.message || 'Failed to update assignment');
//       }
//     } catch (error) {
//       console.error('❌ Update error:', error);
//       setError(error.response?.data?.message || 'Failed to update assignment');
//     }
//   };

//   const handleDeleteAssignment = async (id) => {
//     if (window.confirm('Are you sure you want to delete this assignment?')) {
//       try {
//         const response = await axios.delete(`${API_BASE_URL}/shifts/assignments/${id}`);
//         if (response.data.success) {
//           setSuccess('Shift assignment removed successfully');
//           fetchData();
//         }
//       } catch (error) {
//         setError('Failed to delete assignment');
//       }
//     }
//   };

//   const handleDeleteMasterShift = async (id, shiftName) => {
//     if (window.confirm(`Delete ${shiftName}? This will remove all assignments.`)) {
//       try {
//         const response = await axios.delete(`${API_BASE_URL}/shifts/master/${id}`);
//         if (response.data.success) {
//           setSuccess(response.data.message);
//           fetchData();
//         }
//       } catch (error) {
//         setError('Failed to delete shift');
//       }
//     }
//   };

//   const handleViewEmployees = async (shiftType, shiftName) => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/shifts/type/${shiftType}/employees`);
//       if (response.data.success) {
//         const employees = response.data.data.employees || [];
//         const filteredEmployees = filterInactiveAssignments(employees);

//         setViewShiftInfo({
//           shiftType,
//           shiftName,
//           isBrakeShift: response.data.data.isBrakeShift || false
//         });
//         setViewEmployees(filteredEmployees);
//         setViewingShiftType(shiftType);
//         setShowViewModal(true);
//       }
//     } catch (error) {
//       setError('Failed to fetch employees');
//     }
//   };

//   const handleCreateDefaultShifts = async () => {
//     try {
//       const response = await axios.post(`${API_BASE_URL}/shifts/create-defaults`);
//       if (response.data.success) {
//         setSuccess(`✅ Created ${response.data.createdCount} default shifts (A-D + Brake Shift)`);
//         fetchData();
//       }
//     } catch (error) {
//       setError('Failed to create default shifts');
//     }
//   };

//   const getEmployeeName = (assignment) => {
//     return assignment.employeeAssignment?.employeeName || assignment.employeeName || "Unknown";
//   };

//   const getEmployeeId = (assignment) => {
//     return assignment.employeeAssignment?.employeeId || assignment.employeeId || "Unknown";
//   };

//   // ✅ Stat Box component matching LeavesList
//   const StatCard = ({ label, value, color }) => (
//     <div
//       className={`bg-white rounded-lg p-3 shadow-sm border-t-4 ${color} text-center`}
//     >
//       <div className="text-lg font-bold">{value}</div>
//       <div className="text-xs font-medium text-gray-700">{label}</div>
//     </div>
//   );

//   // Pagination handlers
//   const handleItemsPerPageChange = (e) => {
//     setItemsPerPage(Number(e.target.value));
//     setCurrentPageAssignments(1);
//   };

//   const handlePrevPage = () => {
//     if (currentPageAssignments > 1) setCurrentPageAssignments(currentPageAssignments - 1);
//   };

//   const handleNextPage = () => {
//     if (currentPageAssignments < totalPages) setCurrentPageAssignments(currentPageAssignments + 1);
//   };

//   const handlePageClick = (page) => {
//     setCurrentPageAssignments(page);
//   };

//   const getPageNumbers = () => {
//     const pageNumbers = [];
//     for (let i = 1; i <= totalPages; i++) {
//       if (
//         i === 1 ||
//         i === totalPages ||
//         (i >= currentPageAssignments - 2 && i <= currentPageAssignments + 2)
//       ) {
//         pageNumbers.push(i);
//       } else if (i === currentPageAssignments - 3 || i === currentPageAssignments + 3) {
//         pageNumbers.push("...");
//       }
//     }
//     return pageNumbers;
//   };

//   // Calculate pagination for assignments table
//   const indexOfLastItem = currentPageAssignments * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentAssignments = employeeAssignments.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(employeeAssignments.length / itemsPerPage);

//   // Loading screen matching LeavesList
//   if (loading)
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
//         <div className="text-center">
//           <div className="w-12 h-12 mx-auto mb-3 border-b-2 border-green-600 rounded-full animate-spin"></div>
//           <p className="font-semibold text-gray-600">
//             Loading shift management...
//           </p>
//         </div>
//       </div>
//     );

//   return (
//     <div className="min-h-screen px-2 py-2 bg-gradient-to-br from-green-50 to-blue-100">
//       <div className="mx-auto max-w-9xl">
//         {/* ✅ Stats Section - Matching LeavesList */}
//         <div className="grid grid-cols-2 gap-2 mb-2 sm:grid-cols-4">
//           <StatCard
//             label={`Total Shifts: ${masterShifts.length}`}
//             // value={masterShifts.length}
//             color="border-green-500"
//           />
//           <StatCard
//             label={`Assigned: ${employeeAssignments.length}`}
//             // value={employeeAssignments.length}
//             color="border-blue-500"
//           />
//           <StatCard
//             label={`Regular: ${masterShifts.filter(s => !s.isBrakeShift).length}`}
//             // value={masterShifts.filter(s => !s.isBrakeShift).length}
//             color="border-green-500"
//           />
//           <StatCard
//             label={`Brake: ${masterShifts.filter(s => s.isBrakeShift).length}`}
//             // value={masterShifts.filter(s => s.isBrakeShift).length}
//             color="border-yellow-500"
//           />
//         </div>

//         {/* ✅ Header with Actions - Matching LeavesList style */}
//         <div className="p-2 mb-2 bg-white border border-gray-200 shadow-md rounded-xl">
//           <div className="flex items-end justify-between gap-4">
//             <h1 className="text-xl font-bold text-gray-800">Shifts</h1>
//             <div className="flex items-end gap-2">
//               {masterShifts.length === 0 && (
//                 <button
//                   onClick={handleCreateDefaultShifts}
//                   className="h-9 px-4 mb-[2px] text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition flex items-center gap-1"
//                 >
//                   <FaPlus className="text-xs" /> Create Defaults
//                 </button>
//               )}
//               <button
//                 onClick={() => setShowCustomCreateModal(true)}
//                 className="h-9 px-4 mb-[2px] text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition flex items-center gap-1"
//               >
//                 <FaPlus className="text-xs" /> Regular Shift
//               </button>
//               <button
//                 onClick={() => setShowBrakeShiftModal(true)}
//                 className="h-9 px-4 mb-[2px] text-sm font-medium text-white bg-gradient-to-r from-green-600 to-pink-600 rounded-md hover:from-green-700 hover:to-pink-700 transition flex items-center gap-1"
//               >
//                 <FaPlus className="text-xs" /> Brake Shift
//               </button>
//               <button
//                 onClick={() => setShowAssignModal(true)}
//                 className="h-9 px-4 mb-[2px] text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition flex items-center gap-1"
//               >
//                 <FaClock className="text-xs" /> Assign
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Messages */}
//         {error && (
//           <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
//             ❌ {error}
//           </div>
//         )}
//         {success && (
//           <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 border border-green-200 rounded-lg">
//             ✅ {success}
//           </div>
//         )}

//         {/* ✅ 1. AVAILABLE SHIFTS SECTION */}
//         <div className="mb-6">
//           {/* <h2 className="mb-3 text-lg font-semibold text-gray-800">Available Shifts ({masterShifts.length})</h2> */}

//           {masterShifts.length === 0 ? (
//             <div className="py-8 text-center bg-white border border-gray-200 rounded-lg">
//               <div className="mb-3 text-4xl text-gray-400">⏰</div>
//               <h3 className="mb-1 text-base font-semibold text-gray-600">No shifts created yet</h3>
//               <p className="mb-3 text-sm text-gray-500">Create your first shift to get started</p>
//               <div className="flex justify-center gap-2">
//                 <button
//                   onClick={() => setShowCustomCreateModal(true)}
//                   className="px-3 py-1.5 text-xs text-white bg-green-600 rounded-md hover:bg-green-700"
//                 >
//                   Create Regular Shift
//                 </button>
//                 <button
//                   onClick={() => setShowBrakeShiftModal(true)}
//                   className="px-3 py-1.5 text-xs text-white bg-gradient-to-r from-green-600 to-pink-600 rounded-md hover:from-green-700 hover:to-pink-700"
//                 >
//                   Create Brake Shift
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//               {masterShifts.map((shift) => {
//                 const timeSlot = shift.timeSlots?.[0];
//                 const employeeCount = getEmployeesCount(shift.shiftType);
//                 const shiftColor = getShiftColor(shift.shiftType);
//                 const textColor = getShiftTextColor();
//                 const borderColor = getShiftBorderColor(shift.shiftType);
//                 const isBrakeShift = shift.isBrakeShift;

//                 return (
//                   <div
//                     key={shift._id}
//                     className={`p-3 border rounded-lg shadow-sm transition-all duration-200 hover:shadow-md ${shiftColor} ${borderColor} ${textColor}`}
//                   >
//                     {/* Shift Header */}
//                     <div className="flex items-start justify-between mb-2">
//                       <div className="flex items-start gap-1.5">
//                         <div className="p-1 rounded-md bg-white/20 backdrop-blur-sm">
//                           <FaClock className="text-xs" />
//                         </div>
//                         <div>
//                           <span className="text-xs font-semibold">
//                             Shift {shift.shiftType} {isBrakeShift && '(Brake)'}
//                           </span>
//                           <div className="text-xs text-white/90">
//                             {shift.shiftName}
//                           </div>
//                         </div>
//                       </div>

//                       <div className="text-right">
//                         <div className="text-base font-bold">{employeeCount}</div>
//                         <div className="text-[10px] text-white/80">employees</div>
//                       </div>
//                     </div>

//                     {/* Time Slot */}
//                     <div className="mb-2">
//                       <div className="flex items-center gap-1 mb-0.5">
//                         <span className="text-xs font-medium">
//                           {isBrakeShift ? getBrakeShiftTimeDisplay(shift) : (timeSlot?.timeRange || "Not set")}
//                         </span>
//                         {isBrakeShift && (
//                           <span className="px-1 py-0.5 text-[10px] bg-white/20 rounded-full">
//                             Brake
//                           </span>
//                         )}
//                       </div>
//                       <p className="text-[10px] text-white/80 line-clamp-1">
//                         {isBrakeShift ?
//                           "07:00-13:00 & 17:00-21:30" :
//                           (timeSlot?.description || "No description")}
//                       </p>
//                     </div>

//                     {/* Actions */}
//                     <div className="flex gap-1">
//                       <button
//                         onClick={() => handleViewEmployees(shift.shiftType, shift.shiftName)}
//                         disabled={employeeCount === 0}
//                         className={`flex-1 px-1.5 py-1 text-[10px] rounded flex items-center justify-center gap-0.5 ${
//                           employeeCount > 0
//                             ? 'bg-white/20 text-white hover:bg-white/30 transition-colors'
//                             : 'bg-white/10 text-white/50 cursor-not-allowed'
//                         }`}
//                       >
//                         <FaEye className="text-[8px]" /> View
//                       </button>
//                       <button
//                         onClick={() => {
//                           setAssignForm({
//                             employeeId: '',
//                             employeeName: '',
//                             shiftType: shift.shiftType
//                           });
//                           setEditingAssignment(null);
//                           setShowAssignModal(true);
//                         }}
//                         className="flex-1 px-1.5 py-1 text-[10px] text-white bg-white/30 rounded hover:bg-white/40 transition-colors flex items-center justify-center gap-0.5"
//                       >
//                         <FaPlus className="text-[8px]" /> Assign
//                       </button>
//                       <button
//                         onClick={() => handleDeleteMasterShift(shift._id, shift.shiftName)}
//                         className="px-1.5 py-1 text-[10px] text-white bg-white/20 rounded hover:bg-white/30 transition-colors"
//                       >
//                         <FaTimes className="text-[8px]" />
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         {/* ✅ 2. ALL ASSIGNED EMPLOYEES TABLE - Matching LeavesList design */}
//         {employeeAssignments.length > 0 && (
//           <div className="mb-6">
//             {/* <h2 className="mb-3 text-lg font-semibold text-gray-800">Assigned Employees ({employeeAssignments.length})</h2> */}
            
//             <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
//               <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//                 <table className="min-w-full">
//                   <thead className="text-xs text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
//                     <tr>
//                       <th className="px-2 py-2 text-center">Employee ID</th>
//                       <th className="px-2 py-2 text-center">Employee Name</th>
//                       <th className="px-2 py-2 text-center">Shift</th>
//                       <th className="px-2 py-2 text-center">Time Slot</th>
//                       <th className="px-2 py-2 text-center">Description</th>
//                       <th className="px-2 py-2 text-center rounded-tr-lg">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {currentAssignments.length > 0 ? (
//                       currentAssignments.map((assignment) => {
//                         const timeSlot = getShiftTimeSlot(assignment.shiftType);
//                         const employeeName = getEmployeeName(assignment);
//                         const employeeId = getEmployeeId(assignment);
//                         const shift = masterShifts.find(s => s.shiftType === assignment.shiftType);
//                         const isBrakeShift = shift?.isBrakeShift || false;
//                         const rowColor = getShiftRowColor(assignment.shiftType);

//                         return (
//                           <tr key={assignment._id} className={`${rowColor} transition border-b hover:bg-gray-50`}>
//                             <td className="px-2 py-2 text-xs font-medium text-center text-gray-900 whitespace-nowrap">
//                               {employeeId}
//                             </td>
//                             <td className="px-2 py-2 text-xs font-medium text-center text-gray-900 whitespace-nowrap">
//                               <div className="font-semibold">{employeeName}</div>
//                             </td>
//                             <td className="px-2 py-2 text-xs font-medium text-center text-gray-900 whitespace-nowrap">
//                               <span className={`px-2 py-1 text-[10px] font-medium rounded-full ${getBadgeColor(assignment.shiftType)}`}>
//                                 Shift {assignment.shiftType} {isBrakeShift && '(Brake)'}
//                               </span>
//                             </td>
//                             <td className="px-2 py-2 text-xs font-medium text-center text-gray-900 whitespace-nowrap">
//                               {isBrakeShift ? "07:00-13:00 & 17:00-21:30" : getEmployeeTimeRange(assignment)}
//                             </td>
//                             <td className="max-w-xs px-2 py-2 text-xs font-medium text-center text-gray-500 truncate whitespace-nowrap">
//                               {isBrakeShift ? "Brake shift with afternoon break" : (assignment.employeeAssignment?.selectedDescription || timeSlot?.description || "Shift timing")}
//                             </td>
//                             <td className="px-2 py-2 text-xs font-medium text-center text-gray-900 whitespace-nowrap">
//                               <div className="flex justify-center gap-1">
//                                 <button
//                                   onClick={() => {
//                                     setEditingAssignment(assignment);
//                                     setAssignForm({
//                                       employeeId: assignment.employeeAssignment?.employeeId || assignment.employeeId,
//                                       employeeName: assignment.employeeAssignment?.employeeName || assignment.employeeName,
//                                       shiftType: assignment.shiftType
//                                     });
//                                     setShowAssignModal(true);
//                                   }}
//                                   className="px-2 py-1 text-[10px] bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-0.5"
//                                 >
//                                   <FaEdit className="text-[8px]" /> Edit
//                                 </button>
//                                 <button
//                                   onClick={() => handleDeleteAssignment(assignment._id)}
//                                   className="px-2 py-1 text-[10px] bg-red-50 text-red-700 rounded-md hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-0.5"
//                                 >
//                                   <FaTrash className="text-[8px]" /> Remove
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         );
//                       })
//                     ) : (
//                       <tr>
//                         <td colSpan="6" className="py-4 text-xs text-center text-gray-500">
//                           No assignments found.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* ✅ Pagination Section - Matching LeavesList exactly */}
//             {employeeAssignments.length > 0 && (
//               <div className="flex flex-col items-center justify-between gap-4 mt-4 sm:flex-row">
//                 {/* Show entries dropdown */}
//                 <div className="flex flex-wrap items-center gap-4">
//                   <div className="flex items-center gap-2">
//                     <label className="text-xs font-medium text-gray-700">
//                       Show:
//                     </label>
//                     <select
//                       value={itemsPerPage}
//                       onChange={handleItemsPerPageChange}
//                       className="p-1 text-xs border rounded-lg"
//                     >
//                       <option value={5}>5</option>
//                       <option value={10}>10</option>
//                       <option value={20}>20</option>
//                       <option value={50}>50</option>
//                     </select>
//                     <span className="text-xs text-gray-600">entries</span>
//                   </div>
//                 </div>

//                 {/* Pagination buttons */}
//                 <div className="flex items-center gap-1">
//                   <button
//                     onClick={handlePrevPage}
//                     disabled={currentPageAssignments === 1}
//                     className={`px-3 py-1 text-xs border rounded-lg ${
//                       currentPageAssignments === 1
//                         ? "text-gray-400 bg-gray-100 cursor-not-allowed"
//                         : "text-blue-600 bg-white hover:bg-blue-50 border-blue-200"
//                     }`}
//                   >
//                     Previous
//                   </button>

//                   {getPageNumbers().map((page, index) => (
//                     <button
//                       key={index}
//                       onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
//                       disabled={page === "..."}
//                       className={`px-3 py-1 text-xs border rounded-lg ${
//                         page === "..."
//                           ? "text-gray-500 bg-gray-50 cursor-default"
//                           : currentPageAssignments === page
//                           ? "text-white bg-blue-600 border-blue-600"
//                           : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
//                       }`}
//                     >
//                       {page}
//                     </button>
//                   ))}

//                   <button
//                     onClick={handleNextPage}
//                     disabled={currentPageAssignments === totalPages}
//                     className={`px-3 py-1 text-xs border rounded-lg ${
//                       currentPageAssignments === totalPages
//                         ? "text-gray-400 bg-gray-100 cursor-not-allowed"
//                         : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
//                     }`}
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* No assignments message */}
//         {employeeAssignments.length === 0 && (
//           <div className="py-6 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
//             <p className="text-xs">No shift assignments yet</p>
//           </div>
//         )}

//         {/* REGULAR SHIFT CREATE MODAL - Styled like LeavesList */}
//         {showCustomCreateModal && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//             <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
//               <div className="flex items-center justify-between p-3 border-b">
//                 <h3 className="text-sm font-semibold text-gray-800">Create Regular Shift</h3>
//                 <button onClick={() => setShowCustomCreateModal(false)} className="text-lg text-gray-400 hover:text-gray-600">
//                   &times;
//                 </button>
//               </div>

//               <form onSubmit={handleCreateCustomShift} className="p-3">
//                 <div className="space-y-3">
//                   <div className="grid grid-cols-2 gap-2">
//                     <div>
//                       <label className="block mb-1 text-xs text-gray-700">
//                         Shift Type *
//                       </label>
//                       <input
//                         type="text"
//                         maxLength="1"
//                         value={createForm.shiftType}
//                         onChange={(e) => setCreateForm(prev => ({
//                           ...prev,
//                           shiftType: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')
//                         }))}
//                         className="w-full px-2 py-1.5 text-xs uppercase border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-transparent"
//                         placeholder="E"
//                         required
//                       />
//                       <p className="mt-1 text-[10px] text-gray-500">Single letter (A-Z)</p>
//                     </div>

//                     <div>
//                       <label className="block mb-1 text-xs text-gray-700">
//                         Shift Name *
//                       </label>
//                       <input
//                         type="text"
//                         value={createForm.shiftName}
//                         onChange={(e) => setCreateForm(prev => ({ ...prev, shiftName: e.target.value }))}
//                         className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-transparent"
//                         placeholder="Extended Shift E"
//                         required
//                       />
//                     </div>
//                   </div>

//                   {/* Time Slot Configuration */}
//                   <div>
//                     <label className="block mb-1 text-xs text-gray-700">
//                       Time Slot *
//                     </label>
//                     <div className="p-2 space-y-2 border border-gray-200 rounded-md bg-gray-50">
//                       <div>
//                         <label className="block mb-0.5 text-[10px] text-gray-600">Time Range</label>
//                         <input
//                           type="text"
//                           value={createForm.timeSlots[0].timeRange}
//                           onChange={(e) => updateTimeSlot('timeRange', e.target.value)}
//                           className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
//                           placeholder="10:00 - 19:00"
//                           required
//                         />
//                       </div>
//                       <div>
//                         <label className="block mb-0.5 text-[10px] text-gray-600">Description</label>
//                         <input
//                           type="text"
//                           value={createForm.timeSlots[0].description}
//                           onChange={(e) => updateTimeSlot('description', e.target.value)}
//                           className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
//                           placeholder="Morning 10 to 7"
//                           required
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Preview */}
//                   {createForm.shiftType && createForm.timeSlots[0].timeRange && (
//                     <div className="p-2 border border-gray-200 rounded-md bg-gray-50">
//                       <h4 className="mb-0.5 text-xs text-gray-800">Preview:</h4>
//                       <p className="text-[10px] text-gray-700">
//                         Shift {createForm.shiftType}: {createForm.shiftName}
//                       </p>
//                       <p className="text-[10px] text-gray-600">
//                         Time: {createForm.timeSlots[0].timeRange}
//                       </p>
//                     </div>
//                   )}
//                 </div>

//                 <div className="flex justify-end gap-2 pt-3 mt-3 border-t">
//                   <button
//                     type="button"
//                     onClick={() => setShowCustomCreateModal(false)}
//                     className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="px-3 py-1.5 text-xs text-white bg-green-600 rounded-md hover:bg-green-700"
//                   >
//                     Create Shift
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* BRAKE SHIFT CREATE MODAL */}
//         {showBrakeShiftModal && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//             <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
//               <div className="flex items-center justify-between p-3 border-b">
//                 <h3 className="text-sm font-semibold text-gray-800">Create Brake Shift</h3>
//                 <button onClick={() => setShowBrakeShiftModal(false)} className="text-lg text-gray-400 hover:text-gray-600">
//                   &times;
//                 </button>
//               </div>

//               <form onSubmit={handleCreateBrakeShift} className="p-3">
//                 <div className="space-y-3">
//                   <div className="grid grid-cols-2 gap-2">
//                     <div>
//                       <label className="block mb-1 text-xs text-gray-700">
//                         Shift Type *
//                       </label>
//                       <input
//                         type="text"
//                         maxLength="2"
//                         value={createForm.shiftType}
//                         onChange={(e) => setCreateForm(prev => ({
//                           ...prev,
//                           shiftType: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')
//                         }))}
//                         className="w-full px-2 py-1.5 text-xs uppercase border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500"
//                         placeholder="BR"
//                         required
//                       />
//                     </div>

//                     <div>
//                       <label className="block mb-1 text-xs text-gray-700">
//                         Shift Name *
//                       </label>
//                       <input
//                         type="text"
//                         value={createForm.shiftName}
//                         onChange={(e) => setCreateForm(prev => ({ ...prev, shiftName: e.target.value }))}
//                         className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500"
//                         placeholder="Brake Shift"
//                         required
//                       />
//                     </div>
//                   </div>

//                   {/* Brake Shift Info */}
//                   <div className="p-2 border border-green-200 rounded-md bg-gradient-to-r from-green-50 to-pink-50">
//                     <h4 className="mb-1 text-xs text-green-800">Brake Shift Details</h4>
//                     <div className="space-y-1">
//                       <div className="flex items-center gap-1">
//                         <div className="flex items-center justify-center w-5 h-5 bg-green-100 rounded-full">
//                           <FaClock className="text-[8px] text-green-600" />
//                         </div>
//                         <span className="text-[10px] text-gray-800">07:00 - 13:00</span>
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <div className="flex items-center justify-center w-5 h-5 bg-pink-100 rounded-full">
//                           <FaClock className="text-[8px] text-pink-600" />
//                         </div>
//                         <span className="text-[10px] text-gray-800">17:00 - 21:30</span>
//                       </div>
//                       <p className="text-[9px] text-gray-600">Total: 10.5 hours with break</p>
//                     </div>
//                   </div>

//                   {/* Preview */}
//                   {createForm.shiftType && (
//                     <div className="p-2 border border-green-200 rounded-md bg-green-50">
//                       <p className="text-xs text-green-700">
//                         Shift {createForm.shiftType} (Brake): {createForm.shiftName}
//                       </p>
//                       <p className="text-[10px] text-green-600">
//                         07:00-13:00 & 17:00-21:30
//                       </p>
//                     </div>
//                   )}
//                 </div>

//                 <div className="flex justify-end gap-2 pt-3 mt-3 border-t">
//                   <button
//                     type="button"
//                     onClick={() => setShowBrakeShiftModal(false)}
//                     className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="px-3 py-1.5 text-xs text-white bg-gradient-to-r from-green-600 to-pink-600 rounded-md hover:from-green-700 hover:to-pink-700"
//                   >
//                     Create Brake Shift
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* ASSIGN SHIFT MODAL */}
//         {showAssignModal && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//             <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
//               <div className="flex items-center justify-between p-3 border-b">
//                 <h3 className="text-sm font-semibold text-gray-800">
//                   {editingAssignment ? 'Edit Assignment' : 'Assign Shift'}
//                 </h3>
//                 <button onClick={() => {
//                   setShowAssignModal(false);
//                   setEditingAssignment(null);
//                   setAssignForm({
//                     employeeId: '',
//                     employeeName: '',
//                     shiftType: ''
//                   });
//                 }} className="text-lg text-gray-400 hover:text-gray-600">
//                   &times;
//                 </button>
//               </div>

//               <form onSubmit={editingAssignment ? handleUpdateAssignment : handleAssignShift} className="p-3">
//                 <div className="space-y-2">
//                   <div>
//                     <label className="block mb-1 text-xs text-gray-700">
//                       Employee ID {editingAssignment && '(Cannot change)'}
//                     </label>
//                     <input
//                       type="text"
//                       value={assignForm.employeeId}
//                       onChange={(e) => setAssignForm(prev => ({ ...prev, employeeId: e.target.value }))}
//                       className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
//                       placeholder="EMP001"
//                       required
//                       readOnly={!!editingAssignment}
//                     />
//                   </div>

//                   <div>
//                     <label className="block mb-1 text-xs text-gray-700">
//                       Employee Name *
//                     </label>
//                     <input
//                       type="text"
//                       value={assignForm.employeeName}
//                       onChange={(e) => setAssignForm(prev => ({ ...prev, employeeName: e.target.value }))}
//                       className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
//                       placeholder="John Doe"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block mb-1 text-xs text-gray-700">
//                       Select Shift Type *
//                     </label>
//                     <select
//                       value={assignForm.shiftType}
//                       onChange={(e) => setAssignForm(prev => ({ ...prev, shiftType: e.target.value }))}
//                       className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
//                       required
//                     >
//                       <option value="">Select Shift Type</option>
//                       {masterShifts.map(shift => (
//                         <option key={shift._id} value={shift.shiftType}>
//                           Shift {shift.shiftType}: {shift.shiftName} {shift.isBrakeShift && '(Brake)'}
//                         </option>
//                       ))}
//                     </select>

//                     {assignForm.shiftType && masterShifts.find(s => s.shiftType === assignForm.shiftType) && (
//                       <div className="p-1.5 mt-1 text-[10px] rounded bg-blue-50 border border-blue-100">
//                         <p className="text-blue-700">
//                           Time: {
//                             masterShifts.find(s => s.shiftType === assignForm.shiftType)?.isBrakeShift ?
//                               "07:00-13:00 & 17:00-21:30" :
//                               getShiftTimeSlot(assignForm.shiftType)?.timeRange || "Not specified"
//                           }
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex justify-end gap-2 pt-3 mt-3 border-t">
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowAssignModal(false);
//                       setEditingAssignment(null);
//                       setAssignForm({
//                         employeeId: '',
//                         employeeName: '',
//                         shiftType: ''
//                       });
//                     }}
//                     className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="px-3 py-1.5 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700"
//                   >
//                     {editingAssignment ? 'Update' : 'Assign'}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* VIEW EMPLOYEES MODAL */}
//         {showViewModal && viewEmployees.length > 0 && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//             <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
//               <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200">
//                 <div>
//                   <h3 className="text-sm font-semibold text-gray-800">
//                     {viewShiftInfo.shiftName} Employees
//                   </h3>
//                   <p className="text-[10px] text-gray-600">
//                     Shift {viewShiftInfo.shiftType} • {viewEmployees.length} active employees
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => setShowViewModal(false)}
//                   className="text-lg text-gray-400 hover:text-gray-600"
//                 >
//                   &times;
//                 </button>
//               </div>

//               <div className="flex-1 overflow-y-auto">
//                 <table className="w-full">
//                   <thead className="sticky top-0 border-b border-gray-200 bg-gray-50">
//                     <tr>
//                       <th className="px-2 py-2 text-[10px] font-semibold tracking-wider text-left text-gray-600 uppercase">Employee ID</th>
//                       <th className="px-2 py-2 text-[10px] font-semibold tracking-wider text-left text-gray-600 uppercase">Employee Name</th>
//                       <th className="px-2 py-2 text-[10px] font-semibold tracking-wider text-left text-gray-600 uppercase">Time Slot</th>
//                       <th className="px-2 py-2 text-[10px] font-semibold tracking-wider text-left text-gray-600 uppercase">Description</th>
//                       <th className="px-2 py-2 text-[10px] font-semibold tracking-wider text-left text-gray-600 uppercase">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-100">
//                     {viewEmployees.map((emp) => {
//                       const rowColor = getShiftRowColor(emp.shiftType);
//                       const shift = masterShifts.find(s => s.shiftType === emp.shiftType);
//                       const isBrakeShift = shift?.isBrakeShift || false;

//                       return (
//                         <tr key={emp._id} className={`${rowColor} transition-colors`}>
//                           <td className="px-2 py-2 text-[10px] text-gray-900">{emp.employeeAssignment?.employeeId || emp.employeeId}</td>
//                           <td className="px-2 py-2 text-[10px] text-gray-900">{emp.employeeAssignment?.employeeName || emp.employeeName}</td>
//                           <td className="px-2 py-2 text-[10px] text-gray-900">
//                             {isBrakeShift ? "07:00-13:00 & 17:00-21:30" : getEmployeeTimeRange(emp)}
//                           </td>
//                           <td className="px-2 py-2 text-[10px] text-gray-600">
//                             {isBrakeShift ? "Brake shift" : (emp.employeeAssignment?.selectedDescription || "Legacy shift")}
//                           </td>
//                           <td className="px-2 py-2">
//                             <div className="flex gap-1">
//                               <button
//                                 onClick={() => {
//                                   setShowViewModal(false);
//                                   setEditingAssignment(emp);
//                                   setAssignForm({
//                                     employeeId: emp.employeeAssignment?.employeeId || emp.employeeId,
//                                     employeeName: emp.employeeAssignment?.employeeName || emp.employeeName,
//                                     shiftType: emp.shiftType
//                                   });
//                                   setShowAssignModal(true);
//                                 }}
//                                 className="px-2 py-1 text-[8px] bg-blue-50 text-blue-700 rounded hover:bg-blue-100 border border-blue-200"
//                               >
//                                 <FaEdit className="text-[6px]" /> Edit
//                               </button>
//                               <button
//                                 onClick={() => {
//                                   handleDeleteAssignment(emp._id);
//                                   setShowViewModal(false);
//                                 }}
//                                 className="px-2 py-1 text-[8px] bg-red-50 text-red-700 rounded hover:bg-red-100 border border-red-200"
//                               >
//                                 <FaTrash className="text-[6px]" /> Delete
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>

//               <div className="p-3 border-t border-gray-200 bg-gray-50">
//                 <button
//                   onClick={() => setShowViewModal(false)}
//                   className="w-full py-2 text-[10px] bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ShiftManagement;


import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { FaBuilding, FaClock, FaEdit, FaEye, FaPlus, FaSearch, FaClock as FaShift, FaTimes, FaTrash, FaUserTag } from 'react-icons/fa';
import { API_BASE_URL } from '../config';
import { isEmployeeHidden } from '../utils/employeeStatus';

const ShiftManagement = () => {
  const [masterShifts, setMasterShifts] = useState([]);
  const [employeeAssignments, setEmployeeAssignments] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [employeeCounts, setEmployeeCounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCustomCreateModal, setShowCustomCreateModal] = useState(false);
  const [showBrakeShiftModal, setShowBrakeShiftModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showDesignationFilter, setShowDesignationFilter] = useState(false);
  const [showShiftTypeFilter, setShowShiftTypeFilter] = useState(false);

  // Data
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [viewingShiftType, setViewingShiftType] = useState('');
  const [viewEmployees, setViewEmployees] = useState([]);
  const [viewShiftInfo, setViewShiftInfo] = useState({});

  // Forms
  const [createForm, setCreateForm] = useState({
    shiftType: '',
    shiftName: '',
    timeSlots: [{ slotId: `${Date.now()}_1`, timeRange: '', description: '' }],
    isBrakeShift: false
  });

  const [assignForm, setAssignForm] = useState({
    employeeId: '',
    employeeName: '',
    shiftType: ''
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');
  const [filterShiftType, setFilterShiftType] = useState('');
  const [filteredAssignments, setFilteredAssignments] = useState([]);

  // Unique departments and designations for filter dropdowns
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueDesignations, setUniqueDesignations] = useState([]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pagination states for tables
  const [currentPageAssignments, setCurrentPageAssignments] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Refs for click outside
  const departmentFilterRef = useRef(null);
  const designationFilterRef = useRef(null);
  const shiftTypeFilterRef = useRef(null);

  const filterInactiveAssignments = (assignments) => {
    if (!Array.isArray(assignments) || !allEmployees.length) return assignments;

    return assignments.filter(assignment => {
      const employeeId = assignment.employeeAssignment?.employeeId || assignment.employeeId;
      if (!employeeId) return true;

      const employee = allEmployees.find(emp =>
        emp.employeeId === employeeId || emp._id === employeeId
      );

      if (!employee) return true;

      return !isEmployeeHidden(employee);
    });
  };

  // Apply filters to assignments
  const applyFilters = () => {
    let filtered = [...employeeAssignments];

    // Filter by search term (ID or Name)
    if (searchTerm) {
      filtered = filtered.filter(assignment => {
        const employeeId = getEmployeeId(assignment).toLowerCase();
        const employeeName = getEmployeeName(assignment).toLowerCase();
        const term = searchTerm.toLowerCase();
        return employeeId.includes(term) || employeeName.includes(term);
      });
    }

    // Filter by department
    if (filterDepartment) {
      filtered = filtered.filter(assignment => {
        const employee = allEmployees.find(emp => 
          emp.employeeId === getEmployeeId(assignment) || emp._id === getEmployeeId(assignment)
        );
        return employee?.department === filterDepartment;
      });
    }

    // Filter by designation
    if (filterDesignation) {
      filtered = filtered.filter(assignment => {
        const employee = allEmployees.find(emp => 
          emp.employeeId === getEmployeeId(assignment) || emp._id === getEmployeeId(assignment)
        );
        return (employee?.role || employee?.designation) === filterDesignation;
      });
    }

    // Filter by shift type
    if (filterShiftType) {
      filtered = filtered.filter(assignment => assignment.shiftType === filterShiftType);
    }

    setFilteredAssignments(filtered);
    setCurrentPageAssignments(1); // Reset to first page
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterDepartment('');
    setFilterDesignation('');
    setFilterShiftType('');
    setFilteredAssignments(employeeAssignments);
    setCurrentPageAssignments(1);
  };

  // Click outside handlers for filter dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentFilterRef.current && !departmentFilterRef.current.contains(event.target)) {
        setShowDepartmentFilter(false);
      }
      if (designationFilterRef.current && !designationFilterRef.current.contains(event.target)) {
        setShowDesignationFilter(false);
      }
      if (shiftTypeFilterRef.current && !shiftTypeFilterRef.current.contains(event.target)) {
        setShowShiftTypeFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Extract unique departments and designations from employees
  const extractUniqueValues = (employees) => {
    const depts = new Set();
    const designations = new Set();
    
    employees.forEach(emp => {
      if (emp.department) depts.add(emp.department);
      if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
    });
    
    setUniqueDepartments(Array.from(depts).sort());
    setUniqueDesignations(Array.from(designations).sort());
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      console.log("🔄 Fetching data...");

      try {
        const employeesRes = await axios.get(`${API_BASE_URL}/employees/get-employees`);
        if (Array.isArray(employeesRes.data)) {
          setAllEmployees(employeesRes.data);
          extractUniqueValues(employeesRes.data);
        }
      } catch (e) {
        console.error('❌ Error fetching employees:', e);
      }

      const shiftsRes = await axios.get(`${API_BASE_URL}/shifts/master`);

      if (shiftsRes.data.success) {
        setMasterShifts(shiftsRes.data.data);
      } else {
        setError(shiftsRes.data.message);
      }

      const assignedRes = await axios.get(`${API_BASE_URL}/shifts/assignments`);

      if (assignedRes.data.success) {
        const filteredAssignments = filterInactiveAssignments(assignedRes.data.data);
        setEmployeeAssignments(filteredAssignments);
        setFilteredAssignments(filteredAssignments);
      }

      const countRes = await axios.get(`${API_BASE_URL}/shifts/employee-count`);

      if (countRes.data.success) {
        setEmployeeCounts(countRes.data.data);
      }

    } catch (error) {
      console.error('❌ Fetch error:', error);
      setError('Server connection failed. Check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Apply filters whenever any filter changes
  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterDepartment, filterDesignation, filterShiftType, employeeAssignments]);

  const handleCreateCustomShift = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!createForm.shiftType || !createForm.shiftName) {
        setError('Please enter shift type and name');
        return;
      }

      const slot = createForm.timeSlots[0];
      if (!slot.timeRange.trim() || !slot.description.trim()) {
        setError('Please fill time slot details');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/shifts/create`, {
        shiftType: createForm.shiftType,
        shiftName: createForm.shiftName,
        timeSlots: [slot],
        isBrakeShift: false
      });

      if (response.data.success) {
        setSuccess(`✅ Custom Shift ${createForm.shiftType} created successfully!`);
        fetchData();
        setShowCustomCreateModal(false);
        setCreateForm({
          shiftType: '',
          shiftName: '',
          timeSlots: [{ slotId: `${Date.now()}_1`, timeRange: '', description: '' }],
          isBrakeShift: false
        });
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Create custom error:', error);
      setError(error.response?.data?.message || 'Failed to create custom shift');
    }
  };

  const handleCreateBrakeShift = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!createForm.shiftType || !createForm.shiftName) {
        setError('Please enter shift type and name');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/shifts/create`, {
        shiftType: createForm.shiftType,
        shiftName: createForm.shiftName,
        isBrakeShift: true
      });

      if (response.data.success) {
        setSuccess(`✅ Brake Shift ${createForm.shiftType} created successfully!`);
        fetchData();
        setShowBrakeShiftModal(false);
        setCreateForm({
          shiftType: '',
          shiftName: '',
          timeSlots: [{ slotId: `${Date.now()}_1`, timeRange: '', description: '' }],
          isBrakeShift: false
        });
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Create brake shift error:', error);
      setError(error.response?.data?.message || 'Failed to create brake shift');
    }
  };

  const updateTimeSlot = (field, value) => {
    setCreateForm(prev => ({
      ...prev,
      timeSlots: [{ ...prev.timeSlots[0], [field]: value }]
    }));
  };

  const getShiftTimeSlot = (shiftType) => {
    const shift = masterShifts.find(s => s.shiftType === shiftType);
    return shift?.timeSlots?.[0] || null;
  };

  const getBrakeShiftTimeDisplay = (shift) => {
    if (shift.isBrakeShift && shift.timeSlots.length > 1) {
      return `${shift.timeSlots[0].timeRange} - ${shift.timeSlots[1].timeRange}`;
    }
    return shift.timeSlots?.[0]?.timeRange || "Not set";
  };

  const getEmployeesCount = (shiftType) => {
    return employeeAssignments.filter(a => a.shiftType === shiftType).length;
  };

  // Professional color mappingconst getShiftColor = (type) => {
// ===============================
// MAIN SHIFT BACKGROUND (600)
// ===============================
const getShiftColor = (type) => {
  const colorMap = {

    "A": "bg-[#DC2626]", // Red 600
    "B": "bg-[#2563EB]", // Blue 600
    "C": "bg-[#16A34A]", // Green 600
    "D": "bg-[#CA8A04]", // Yellow 600
    "E": "bg-[#000000]", // Black
    "F": "bg-[#4B5563]", // Grey 600
    "G": "bg-[#A16207]", // Brown 600
    "H": "bg-[#EA580C]", // Orange 600
    "I": "bg-[#DB2777]", // Pink 600
    "J": "bg-[#9333EA]", // Purple 600
    "K": "bg-[#FFFFFF]"  // White

  };

  return colorMap[type] || "bg-[#2563EB]";
};



// ===============================
// ROW BACKGROUND (Soft Professional)
// ===============================
const getShiftRowColor = (type) => {
  const colorMap = {

    "A": "bg-[#DC2626]/10 hover:bg-[#DC2626]/20",
    "B": "bg-[#2563EB]/10 hover:bg-[#2563EB]/20",
    "C": "bg-[#16A34A]/10 hover:bg-[#16A34A]/20",
    "D": "bg-[#CA8A04]/10 hover:bg-[#CA8A04]/20",
    "E": "bg-black/10 hover:bg-black/20",
    "F": "bg-[#4B5563]/10 hover:bg-[#4B5563]/20",
    "G": "bg-[#A16207]/10 hover:bg-[#A16207]/20",
    "H": "bg-[#EA580C]/10 hover:bg-[#EA580C]/20",
    "I": "bg-[#DB2777]/10 hover:bg-[#DB2777]/20",
    "J": "bg-[#9333EA]/10 hover:bg-[#9333EA]/20",
    "K": "bg-gray-100 hover:bg-gray-200"

  };

  return colorMap[type] || "bg-[#2563EB]/10";
};



// ===============================
// TEXT COLOR (Auto Contrast)
// ===============================
const getShiftTextColor = (type) => {

  // Dark background → white text
  const whiteText = ["A","B","C","E","F","H","I","J"];

  return whiteText.includes(type) ? "text-white" : "text-gray-900";
};



// ===============================
// BORDER COLOR (600)
// ===============================
const getShiftBorderColor = (type) => {
  const colorMap = {

    "A": "border-[#DC2626]",
    "B": "border-[#2563EB]",
    "C": "border-[#16A34A]",
    "D": "border-[#CA8A04]",
    "E": "border-black",
    "F": "border-[#4B5563]",
    "G": "border-[#A16207]",
    "H": "border-[#EA580C]",
    "I": "border-[#DB2777]",
    "J": "border-[#9333EA]",
    "K": "border-gray-300"

  };

  return colorMap[type] || "border-[#2563EB]";
};



// ===============================
// BADGE COLOR (Soft 20% + 700 Text)
// ===============================
const getBadgeColor = (type) => {
  const colorMap = {

    "A": "bg-[#DC2626]/20 text-[#B91C1C] border border-[#DC2626]",
    "B": "bg-[#2563EB]/20 text-[#1D4ED8] border border-[#2563EB]",
    "C": "bg-[#16A34A]/20 text-[#15803D] border border-[#16A34A]",
    "D": "bg-[#CA8A04]/20 text-[#A16207] border border-[#CA8A04]",
    "E": "bg-black/20 text-black border border-black",
    "F": "bg-[#4B5563]/20 text-[#374151] border border-[#4B5563]",
    "G": "bg-[#A16207]/20 text-[#78350F] border border-[#A16207]",
    "H": "bg-[#EA580C]/20 text-[#C2410C] border border-[#EA580C]",
    "I": "bg-[#DB2777]/20 text-[#BE185D] border border-[#DB2777]",
    "J": "bg-[#9333EA]/20 text-[#7E22CE] border border-[#9333EA]",
    "K": "bg-gray-200 text-gray-800 border border-gray-300"

  };

  return colorMap[type] || "bg-[#2563EB]/20 text-[#1D4ED8] border border-[#2563EB]";
};
  const getEmployeeTimeRange = (assignment) => {
    if (assignment.employeeAssignment?.selectedTimeRange) {
      return assignment.employeeAssignment.selectedTimeRange;
    } else if (assignment.startTime && assignment.endTime) {
      return `${assignment.startTime} - ${assignment.endTime}`;
    }
    return "Not specified";
  };

  const getEmployeeDepartment = (employeeId) => {
    const employee = allEmployees.find(emp => 
      emp.employeeId === employeeId || emp._id === employeeId
    );
    return employee?.department || '-';
  };

  const getEmployeeDesignation = (employeeId) => {
    const employee = allEmployees.find(emp => 
      emp.employeeId === employeeId || emp._id === employeeId
    );
    return employee?.role || employee?.designation || '-';
  };

  const handleAssignShift = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const { employeeId, employeeName, shiftType } = assignForm;

      if (!employeeId || !employeeName || !shiftType) {
        setError('Please fill all required fields');
        return;
      }

      const employee = allEmployees.find(emp =>
        emp.employeeId === employeeId || emp._id === employeeId
      );

      if (employee && isEmployeeHidden(employee)) {
        setError(`Cannot assign shift to inactive employee: ${employeeName}`);
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/shifts/assign`, {
        employeeId,
        employeeName,
        shiftType
      });

      if (response.data.success) {
        setSuccess(`✅ Shift assigned to ${employeeName} successfully!`);
        fetchData();
        setShowAssignModal(false);
        setAssignForm({
          employeeId: '',
          employeeName: '',
          shiftType: ''
        });
      } else {
        setError(response.data.message || 'Failed to assign shift');
      }
    } catch (error) {
      console.error('❌ Assign error:', error);
      setError(error.response?.data?.message || 'Failed to assign shift');
    }
  };

  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const { employeeName, shiftType } = assignForm;

      if (!employeeName || !shiftType) {
        setError('Please fill all required fields');
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/shifts/assignments/${editingAssignment._id}`,
        {
          employeeName,
          shiftType
        }
      );

      if (response.data.success) {
        setSuccess('✅ Assignment updated successfully!');
        fetchData();
        setShowAssignModal(false);
        setEditingAssignment(null);
        setAssignForm({
          employeeId: '',
          employeeName: '',
          shiftType: ''
        });
      } else {
        setError(response.data.message || 'Failed to update assignment');
      }
    } catch (error) {
      console.error('❌ Update error:', error);
      setError(error.response?.data?.message || 'Failed to update assignment');
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/shifts/assignments/${id}`);
        if (response.data.success) {
          setSuccess('Shift assignment removed successfully');
          fetchData();
        }
      } catch (error) {
        setError('Failed to delete assignment');
      }
    }
  };

  const handleDeleteMasterShift = async (id, shiftName) => {
    if (window.confirm(`Delete ${shiftName}? This will remove all assignments.`)) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/shifts/master/${id}`);
        if (response.data.success) {
          setSuccess(response.data.message);
          fetchData();
        }
      } catch (error) {
        setError('Failed to delete shift');
      }
    }
  };

  const handleViewEmployees = async (shiftType, shiftName) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/shifts/type/${shiftType}/employees`);
      if (response.data.success) {
        const employees = response.data.data.employees || [];
        const filteredEmployees = filterInactiveAssignments(employees);

        setViewShiftInfo({
          shiftType,
          shiftName,
          isBrakeShift: response.data.data.isBrakeShift || false
        });
        setViewEmployees(filteredEmployees);
        setViewingShiftType(shiftType);
        setShowViewModal(true);
      }
    } catch (error) {
      setError('Failed to fetch employees');
    }
  };

  const handleCreateDefaultShifts = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/shifts/create-defaults`);
      if (response.data.success) {
        setSuccess(`✅ Created ${response.data.createdCount} default shifts (A-D + Brake Shift)`);
        fetchData();
      }
    } catch (error) {
      setError('Failed to create default shifts');
    }
  };

  const getEmployeeName = (assignment) => {
    return assignment.employeeAssignment?.employeeName || assignment.employeeName || "Unknown";
  };

  const getEmployeeId = (assignment) => {
    return assignment.employeeAssignment?.employeeId || assignment.employeeId || "Unknown";
  };

  // ✅ Stat Box component matching LeavesList
  const StatCard = ({ label, value, color }) => (
    <div
      className={`bg-white rounded-lg p-3 shadow-sm border-t-4 ${color} text-center`}
    >
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs font-medium text-gray-700">{label}</div>
    </div>
  );

  // Pagination handlers
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPageAssignments(1);
  };

  const handlePrevPage = () => {
    if (currentPageAssignments > 1) setCurrentPageAssignments(currentPageAssignments - 1);
  };

  const handleNextPage = () => {
    if (currentPageAssignments < totalPages) setCurrentPageAssignments(currentPageAssignments + 1);
  };

  const handlePageClick = (page) => {
    setCurrentPageAssignments(page);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPageAssignments - 2 && i <= currentPageAssignments + 2)
      ) {
        pageNumbers.push(i);
      } else if (i === currentPageAssignments - 3 || i === currentPageAssignments + 3) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  // Calculate pagination for filtered assignments
  const indexOfLastItem = currentPageAssignments * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAssignments = filteredAssignments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);

  // Loading screen matching LeavesList
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 border-b-2 border-green-600 rounded-full animate-spin"></div>
          <p className="font-semibold text-gray-600">
            Loading shift management...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen px-2 py-2 bg-gradient-to-br from-green-50 to-blue-100">
      <div className="mx-auto max-w-9xl">
        {/* ✅ Stats Section */}
        <div className="grid grid-cols-2 gap-2 mb-2 sm:grid-cols-4">
          <StatCard
            label={`Total Shifts: ${masterShifts.length}`}
            // value={masterShifts.length}
            color="border-green-500"
          />
          <StatCard
            label={`Assigned: ${employeeAssignments.length}`}
            // value={employeeAssignments.length}
            color="border-blue-500"
          />
          <StatCard
            label={`Regular: ${masterShifts.filter(s => !s.isBrakeShift).length}`}
            // value={masterShifts.filter(s => !s.isBrakeShift).length}
            color="border-green-500"
          />
          <StatCard
            label={`Brake: ${masterShifts.filter(s => s.isBrakeShift).length}`}
            // value={masterShifts.filter(s => s.isBrakeShift).length}
            color="border-yellow-500"
          />
        </div>

        {/* ✅ All Buttons in One Row */}
        <div className="p-2 mb-3 bg-white border border-gray-200 shadow-md rounded-xl">
          <div className="flex flex-wrap items-center gap-2">
           
           {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search by ID or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            </div>
            {/* Divider */}
            <div className="w-px h-6 mx-1 bg-gray-300"></div>

            {/* Filter Buttons */}
            <div className="relative">
              <button
                onClick={() => setShowDepartmentFilter(!showDepartmentFilter)}
                className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                  filterDepartment 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <FaBuilding className="text-xs" /> Dept {filterDepartment && `: ${filterDepartment}`}
              </button>
              
              {/* Department Filter Dropdown */}
              {showDepartmentFilter && (
                <div ref={departmentFilterRef} className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                  <div 
                    onClick={() => {
                      setFilterDepartment('');
                      setShowDepartmentFilter(false);
                    }}
                    className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                  >
                    All Departments
                  </div>
                  {uniqueDepartments.map(dept => (
                    <div 
                      key={dept}
                      onClick={() => {
                        setFilterDepartment(dept);
                        setShowDepartmentFilter(false);
                      }}
                      className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
                        filterDepartment === dept ? 'bg-blue-50 text-blue-700 font-medium' : ''
                      }`}
                    >
                      {dept}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDesignationFilter(!showDesignationFilter)}
                className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                  filterDesignation 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <FaUserTag className="text-xs" /> Desig {filterDesignation && `: ${filterDesignation}`}
              </button>
              
              {/* Designation Filter Dropdown */}
              {showDesignationFilter && (
                <div ref={designationFilterRef} className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                  <div 
                    onClick={() => {
                      setFilterDesignation('');
                      setShowDesignationFilter(false);
                    }}
                    className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                  >
                    All Designations
                  </div>
                  {uniqueDesignations.map(des => (
                    <div 
                      key={des}
                      onClick={() => {
                        setFilterDesignation(des);
                        setShowDesignationFilter(false);
                      }}
                      className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
                        filterDesignation === des ? 'bg-blue-50 text-blue-700 font-medium' : ''
                      }`}
                    >
                      {des}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowShiftTypeFilter(!showShiftTypeFilter)}
                className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                  filterShiftType 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <FaShift className="text-xs" /> Shift {filterShiftType && `: ${filterShiftType}`}
              </button>
              
              {/* Shift Type Filter Dropdown */}
              {showShiftTypeFilter && (
                <div ref={shiftTypeFilterRef} className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                  <div 
                    onClick={() => {
                      setFilterShiftType('');
                      setShowShiftTypeFilter(false);
                    }}
                    className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                  >
                    All Shifts
                  </div>
                  {masterShifts.map(shift => (
                    <div 
                      key={shift._id}
                      onClick={() => {
                        setFilterShiftType(shift.shiftType);
                        setShowShiftTypeFilter(false);
                      }}
                      className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
                        filterShiftType === shift.shiftType ? 'bg-blue-50 text-blue-700 font-medium' : ''
                      }`}
                    >
                      Shift {shift.shiftType} {shift.isBrakeShift && '(Brake)'}
                    </div>
                  ))}
                </div>
              )}
            </div>

           

             {/* Create Buttons */}
            {masterShifts.length === 0 && (
              <button
                onClick={handleCreateDefaultShifts}
                className="flex items-center h-8 gap-1 px-3 text-xs font-medium text-white transition bg-green-600 rounded-md hover:bg-green-700"
              >
                <FaPlus className="text-xs" /> Create Defaults
              </button>
            )}
            <button
              onClick={() => setShowCustomCreateModal(true)}
              className="flex items-center h-8 gap-1 px-3 text-xs font-medium text-white transition bg-green-600 rounded-md hover:bg-green-700"
            >
              <FaPlus className="text-xs" /> Regular Shift
            </button>
            <button
              onClick={() => setShowBrakeShiftModal(true)}
              className="flex items-center h-8 gap-1 px-3 text-xs font-medium text-white transition rounded-md bg-gradient-to-r from-green-600 to-pink-600 hover:from-green-700 hover:to-pink-700"
            >
              <FaPlus className="text-xs" /> Brake Shift
            </button>
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center h-8 gap-1 px-3 text-xs font-medium text-white transition bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <FaClock className="text-xs" /> Assign
            </button>

            {/* Clear Filters Button */}
            {(filterDepartment || filterDesignation || filterShiftType || searchTerm) && (
              <button
                onClick={clearFilters}
                className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 border border-green-200 rounded-lg">
            ✅ {success}
          </div>
        )}

        {/* ✅ 1. AVAILABLE SHIFTS SECTION */}
        <div className="mb-6">
          {masterShifts.length === 0 ? (
            <div className="py-8 text-center bg-white border border-gray-200 rounded-lg">
              <div className="mb-3 text-4xl text-gray-400">⏰</div>
              <h3 className="mb-1 text-base font-semibold text-gray-600">No shifts created yet</h3>
              <p className="mb-3 text-sm text-gray-500">Create your first shift to get started</p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setShowCustomCreateModal(true)}
                  className="px-3 py-1.5 text-xs text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Create Regular Shift
                </button>
                <button
                  onClick={() => setShowBrakeShiftModal(true)}
                  className="px-3 py-1.5 text-xs text-white bg-gradient-to-r from-green-600 to-pink-600 rounded-md hover:from-green-700 hover:to-pink-700"
                >
                  Create Brake Shift
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {masterShifts.map((shift) => {
                const timeSlot = shift.timeSlots?.[0];
                const employeeCount = getEmployeesCount(shift.shiftType);
                const shiftColor = getShiftColor(shift.shiftType);
                const textColor = getShiftTextColor();
                const borderColor = getShiftBorderColor(shift.shiftType);
                const isBrakeShift = shift.isBrakeShift;

                return (
                  <div
                    key={shift._id}
                    className={`p-3 border rounded-lg shadow-sm transition-all duration-200 hover:shadow-md ${shiftColor} ${borderColor} ${textColor}`}
                  >
                    {/* Shift Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-1.5">
                        <div className="p-1 rounded-md bg-white/20 backdrop-blur-sm">
                          <FaClock className="text-xs" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold">
                            Shift {shift.shiftType} {isBrakeShift && '(Brake)'}
                          </span>
                          <div className="text-xs text-white/90">
                            {shift.shiftName}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-bold">{employeeCount}</div>
                        <div className="text-[10px] text-white/80">employees</div>
                      </div>
                    </div>

                    {/* Time Slot */}
                    <div className="mb-2">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-xs font-medium">
                          {isBrakeShift ? getBrakeShiftTimeDisplay(shift) : (timeSlot?.timeRange || "Not set")}
                        </span>
                        {isBrakeShift && (
                          <span className="px-1 py-0.5 text-[10px] bg-white/20 rounded-full">
                            Brake
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-white/80 line-clamp-1">
                        {isBrakeShift ?
                          "07:00-13:00 & 17:00-21:30" :
                          (timeSlot?.description || "No description")}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleViewEmployees(shift.shiftType, shift.shiftName)}
                        disabled={employeeCount === 0}
                        className={`flex-1 px-1.5 py-1 text-[10px] rounded flex items-center justify-center gap-0.5 ${
                          employeeCount > 0
                            ? 'bg-white/20 text-white hover:bg-white/30 transition-colors'
                            : 'bg-white/10 text-white/50 cursor-not-allowed'
                        }`}
                      >
                        <FaEye className="text-[8px]" /> View
                      </button>
                      <button
                        onClick={() => {
                          setAssignForm({
                            employeeId: '',
                            employeeName: '',
                            shiftType: shift.shiftType
                          });
                          setEditingAssignment(null);
                          setShowAssignModal(true);
                        }}
                        className="flex-1 px-1.5 py-1 text-[10px] text-white bg-white/30 rounded hover:bg-white/40 transition-colors flex items-center justify-center gap-0.5"
                      >
                        <FaPlus className="text-[8px]" /> Assign
                      </button>
                      <button
                        onClick={() => handleDeleteMasterShift(shift._id, shift.shiftName)}
                        className="px-1.5 py-1 text-[10px] text-white bg-white/20 rounded hover:bg-white/30 transition-colors"
                      >
                        <FaTimes className="text-[8px]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ✅ 2. ALL ASSIGNED EMPLOYEES TABLE */}
        {employeeAssignments.length > 0 && (
          <div className="mb-6">
            {/* Results count */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-600">
                Showing {filteredAssignments.length} of {employeeAssignments.length} assignments
              </div>
              {(filterDepartment || filterDesignation || filterShiftType || searchTerm) && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Active filters:</span>
                  {searchTerm && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[8px]">Search</span>}
                  {filterDepartment && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[8px]">Dept</span>}
                  {filterDesignation && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[8px]">Desig</span>}
                  {filterShiftType && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[8px]">Shift</span>}
                </div>
              )}
            </div>
            
            <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
              <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                <table className="min-w-full">
                  <thead className="text-xs text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                    <tr>
                      <th className="px-2 py-2 text-center">Employee ID</th>
                      <th className="px-2 py-2 text-center">Employee Name</th>
                      <th className="px-2 py-2 text-center">Department</th>
                      <th className="px-2 py-2 text-center">Designation</th>
                      <th className="px-2 py-2 text-center">Shift</th>
                      <th className="px-2 py-2 text-center">Time Slot</th>
                      <th className="px-2 py-2 text-center">Description</th>
                      <th className="px-2 py-2 text-center rounded-tr-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAssignments.length > 0 ? (
                      currentAssignments.map((assignment) => {
                        const timeSlot = getShiftTimeSlot(assignment.shiftType);
                        const employeeName = getEmployeeName(assignment);
                        const employeeId = getEmployeeId(assignment);
                        const department = getEmployeeDepartment(employeeId);
                        const designation = getEmployeeDesignation(employeeId);
                        const shift = masterShifts.find(s => s.shiftType === assignment.shiftType);
                        const isBrakeShift = shift?.isBrakeShift || false;
                        const rowColor = getShiftRowColor(assignment.shiftType);

                        return (
                          <tr key={assignment._id} className={`${rowColor} transition border-b hover:bg-gray-50`}>
                            <td className="px-2 py-2 text-xs font-medium text-center text-gray-900 whitespace-nowrap">
                              {employeeId}
                            </td>
                            <td className="px-2 py-2 text-xs font-medium text-center text-gray-900 whitespace-nowrap">
                              <div className="font-semibold">{employeeName}</div>
                            </td>
                            <td className="px-2 py-2 text-xs font-medium text-center text-gray-900 whitespace-nowrap">
                              {department}
                            </td>
                            <td className="px-2 py-2 text-xs font-medium text-center text-gray-900 whitespace-nowrap">
                              {designation}
                            </td>
                            <td className="px-2 py-2 text-xs font-medium text-center text-gray-900 whitespace-nowrap">
                              <span className={`px-2 py-1 text-[10px] font-medium rounded-full ${getBadgeColor(assignment.shiftType)}`}>
                                Shift {assignment.shiftType} {isBrakeShift && '(Brake)'}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-xs font-medium text-center text-gray-900 whitespace-nowrap">
                              {isBrakeShift ? "07:00-13:00 & 17:00-21:30" : getEmployeeTimeRange(assignment)}
                            </td>
                            <td className="max-w-xs px-2 py-2 text-xs font-medium text-center text-gray-500 truncate whitespace-nowrap">
                              {isBrakeShift ? "Brake shift with afternoon break" : (assignment.employeeAssignment?.selectedDescription || timeSlot?.description || "Shift timing")}
                            </td>
                            <td className="px-2 py-2 text-xs font-medium text-center text-gray-900 whitespace-nowrap">
                              <div className="flex justify-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingAssignment(assignment);
                                    setAssignForm({
                                      employeeId: assignment.employeeAssignment?.employeeId || assignment.employeeId,
                                      employeeName: assignment.employeeAssignment?.employeeName || assignment.employeeName,
                                      shiftType: assignment.shiftType
                                    });
                                    setShowAssignModal(true);
                                  }}
                                  className="px-2 py-1 text-[10px] bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-0.5"
                                >
                                  <FaEdit className="text-[8px]" /> Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteAssignment(assignment._id)}
                                  className="px-2 py-1 text-[10px] bg-red-50 text-red-700 rounded-md hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-0.5"
                                >
                                  <FaTrash className="text-[8px]" /> Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="py-4 text-xs text-center text-gray-500">
                          No assignments found matching filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ✅ Pagination Section */}
            {filteredAssignments.length > 0 && (
              <div className="flex flex-col items-center justify-between gap-4 mt-4 sm:flex-row">
                {/* Show entries dropdown */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-700">
                      Show:
                    </label>
                    <select
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className="p-1 text-xs border rounded-lg"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-xs text-gray-600">entries</span>
                  </div>
                </div>

                {/* Pagination buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPageAssignments === 1}
                    className={`px-3 py-1 text-xs border rounded-lg ${
                      currentPageAssignments === 1
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                        : "text-blue-600 bg-white hover:bg-blue-50 border-blue-200"
                    }`}
                  >
                    Previous
                  </button>

                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
                      disabled={page === "..."}
                      className={`px-3 py-1 text-xs border rounded-lg ${
                        page === "..."
                          ? "text-gray-500 bg-gray-50 cursor-default"
                          : currentPageAssignments === page
                          ? "text-white bg-blue-600 border-blue-600"
                          : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={handleNextPage}
                    disabled={currentPageAssignments === totalPages}
                    className={`px-3 py-1 text-xs border rounded-lg ${
                      currentPageAssignments === totalPages
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                        : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* No assignments message */}
        {employeeAssignments.length === 0 && (
          <div className="py-6 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
            <p className="text-xs">No shift assignments yet</p>
          </div>
        )}

        {/* REGULAR SHIFT CREATE MODAL */}
        {showCustomCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="text-sm font-semibold text-gray-800">Create Regular Shift</h3>
                <button onClick={() => setShowCustomCreateModal(false)} className="text-lg text-gray-400 hover:text-gray-600">
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateCustomShift} className="p-3">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block mb-1 text-xs text-gray-700">
                        Shift Type *
                      </label>
                      <input
                        type="text"
                        maxLength="1"
                        value={createForm.shiftType}
                        onChange={(e) => setCreateForm(prev => ({
                          ...prev,
                          shiftType: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')
                        }))}
                        className="w-full px-2 py-1.5 text-xs uppercase border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        placeholder="E"
                        required
                      />
                      <p className="mt-1 text-[10px] text-gray-500">Single letter (A-Z)</p>
                    </div>

                    <div>
                      <label className="block mb-1 text-xs text-gray-700">
                        Shift Name *
                      </label>
                      <input
                        type="text"
                        value={createForm.shiftName}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, shiftName: e.target.value }))}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        placeholder="Extended Shift E"
                        required
                      />
                    </div>
                  </div>

                  {/* Time Slot Configuration */}
                  <div>
                    <label className="block mb-1 text-xs text-gray-700">
                      Time Slot *
                    </label>
                    <div className="p-2 space-y-2 border border-gray-200 rounded-md bg-gray-50">
                      <div>
                        <label className="block mb-0.5 text-[10px] text-gray-600">Time Range</label>
                        <input
                          type="text"
                          value={createForm.timeSlots[0].timeRange}
                          onChange={(e) => updateTimeSlot('timeRange', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                          placeholder="10:00 - 19:00"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-0.5 text-[10px] text-gray-600">Description</label>
                        <input
                          type="text"
                          value={createForm.timeSlots[0].description}
                          onChange={(e) => updateTimeSlot('description', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                          placeholder="Morning 10 to 7"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  {createForm.shiftType && createForm.timeSlots[0].timeRange && (
                    <div className="p-2 border border-gray-200 rounded-md bg-gray-50">
                      <h4 className="mb-0.5 text-xs text-gray-800">Preview:</h4>
                      <p className="text-[10px] text-gray-700">
                        Shift {createForm.shiftType}: {createForm.shiftName}
                      </p>
                      <p className="text-[10px] text-gray-600">
                        Time: {createForm.timeSlots[0].timeRange}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-3 mt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCustomCreateModal(false)}
                    className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Create Shift
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* BRAKE SHIFT CREATE MODAL */}
        {showBrakeShiftModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="text-sm font-semibold text-gray-800">Create Brake Shift</h3>
                <button onClick={() => setShowBrakeShiftModal(false)} className="text-lg text-gray-400 hover:text-gray-600">
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateBrakeShift} className="p-3">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block mb-1 text-xs text-gray-700">
                        Shift Type *
                      </label>
                      <input
                        type="text"
                        maxLength="2"
                        value={createForm.shiftType}
                        onChange={(e) => setCreateForm(prev => ({
                          ...prev,
                          shiftType: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')
                        }))}
                        className="w-full px-2 py-1.5 text-xs uppercase border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500"
                        placeholder="BR"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-xs text-gray-700">
                        Shift Name *
                      </label>
                      <input
                        type="text"
                        value={createForm.shiftName}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, shiftName: e.target.value }))}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500"
                        placeholder="Brake Shift"
                        required
                      />
                    </div>
                  </div>

                  {/* Brake Shift Info */}
                  <div className="p-2 border border-green-200 rounded-md bg-gradient-to-r from-green-50 to-pink-50">
                    <h4 className="mb-1 text-xs text-green-800">Brake Shift Details</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <div className="flex items-center justify-center w-5 h-5 bg-green-100 rounded-full">
                          <FaClock className="text-[8px] text-green-600" />
                        </div>
                        <span className="text-[10px] text-gray-800">07:00 - 13:00</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex items-center justify-center w-5 h-5 bg-pink-100 rounded-full">
                          <FaClock className="text-[8px] text-pink-600" />
                        </div>
                        <span className="text-[10px] text-gray-800">17:00 - 21:30</span>
                      </div>
                      <p className="text-[9px] text-gray-600">Total: 10.5 hours with break</p>
                    </div>
                  </div>

                  {/* Preview */}
                  {createForm.shiftType && (
                    <div className="p-2 border border-green-200 rounded-md bg-green-50">
                      <p className="text-xs text-green-700">
                        Shift {createForm.shiftType} (Brake): {createForm.shiftName}
                      </p>
                      <p className="text-[10px] text-green-600">
                        07:00-13:00 & 17:00-21:30
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-3 mt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowBrakeShiftModal(false)}
                    className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs text-white bg-gradient-to-r from-green-600 to-pink-600 rounded-md hover:from-green-700 hover:to-pink-700"
                  >
                    Create Brake Shift
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ASSIGN SHIFT MODAL */}
        {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="text-sm font-semibold text-gray-800">
                  {editingAssignment ? 'Edit Assignment' : 'Assign Shift'}
                </h3>
                <button onClick={() => {
                  setShowAssignModal(false);
                  setEditingAssignment(null);
                  setAssignForm({
                    employeeId: '',
                    employeeName: '',
                    shiftType: ''
                  });
                }} className="text-lg text-gray-400 hover:text-gray-600">
                  &times;
                </button>
              </div>

              <form onSubmit={editingAssignment ? handleUpdateAssignment : handleAssignShift} className="p-3">
                <div className="space-y-2">
                  <div>
                    <label className="block mb-1 text-xs text-gray-700">
                      Employee ID {editingAssignment && '(Cannot change)'}
                    </label>
                    <input
                      type="text"
                      value={assignForm.employeeId}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, employeeId: e.target.value }))}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                      placeholder="EMP001"
                      required
                      readOnly={!!editingAssignment}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-xs text-gray-700">
                      Employee Name *
                    </label>
                    <input
                      type="text"
                      value={assignForm.employeeName}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, employeeName: e.target.value }))}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-xs text-gray-700">
                      Select Shift Type *
                    </label>
                    <select
                      value={assignForm.shiftType}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, shiftType: e.target.value }))}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Shift Type</option>
                      {masterShifts.map(shift => (
                        <option key={shift._id} value={shift.shiftType}>
                          Shift {shift.shiftType}: {shift.shiftName} {shift.isBrakeShift && '(Brake)'}
                        </option>
                      ))}
                    </select>

                    {assignForm.shiftType && masterShifts.find(s => s.shiftType === assignForm.shiftType) && (
                      <div className="p-1.5 mt-1 text-[10px] rounded bg-blue-50 border border-blue-100">
                        <p className="text-blue-700">
                          Time: {
                            masterShifts.find(s => s.shiftType === assignForm.shiftType)?.isBrakeShift ?
                              "07:00-13:00 & 17:00-21:30" :
                              getShiftTimeSlot(assignForm.shiftType)?.timeRange || "Not specified"
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 mt-3 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignModal(false);
                      setEditingAssignment(null);
                      setAssignForm({
                        employeeId: '',
                        employeeName: '',
                        shiftType: ''
                      });
                    }}
                    className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    {editingAssignment ? 'Update' : 'Assign'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW EMPLOYEES MODAL */}
        {showViewModal && viewEmployees.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    {viewShiftInfo.shiftName} Employees
                  </h3>
                  <p className="text-[10px] text-gray-600">
                    Shift {viewShiftInfo.shiftType} • {viewEmployees.length} active employees
                  </p>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-lg text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-2 py-2 text-[10px] font-semibold tracking-wider text-left text-gray-600 uppercase">Employee ID</th>
                      <th className="px-2 py-2 text-[10px] font-semibold tracking-wider text-left text-gray-600 uppercase">Employee Name</th>
                      <th className="px-2 py-2 text-[10px] font-semibold tracking-wider text-left text-gray-600 uppercase">Department</th>
                      <th className="px-2 py-2 text-[10px] font-semibold tracking-wider text-left text-gray-600 uppercase">Designation</th>
                      <th className="px-2 py-2 text-[10px] font-semibold tracking-wider text-left text-gray-600 uppercase">Time Slot</th>
                      <th className="px-2 py-2 text-[10px] font-semibold tracking-wider text-left text-gray-600 uppercase">Description</th>
                      <th className="px-2 py-2 text-[10px] font-semibold tracking-wider text-left text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {viewEmployees.map((emp) => {
                      const rowColor = getShiftRowColor(emp.shiftType);
                      const shift = masterShifts.find(s => s.shiftType === emp.shiftType);
                      const isBrakeShift = shift?.isBrakeShift || false;
                      const employeeId = emp.employeeAssignment?.employeeId || emp.employeeId;
                      const department = getEmployeeDepartment(employeeId);
                      const designation = getEmployeeDesignation(employeeId);

                      return (
                        <tr key={emp._id} className={`${rowColor} transition-colors`}>
                          <td className="px-2 py-2 text-[10px] text-gray-900">{employeeId}</td>
                          <td className="px-2 py-2 text-[10px] text-gray-900">{emp.employeeAssignment?.employeeName || emp.employeeName}</td>
                          <td className="px-2 py-2 text-[10px] text-gray-900">{department}</td>
                          <td className="px-2 py-2 text-[10px] text-gray-900">{designation}</td>
                          <td className="px-2 py-2 text-[10px] text-gray-900">
                            {isBrakeShift ? "07:00-13:00 & 17:00-21:30" : getEmployeeTimeRange(emp)}
                          </td>
                          <td className="px-2 py-2 text-[10px] text-gray-600">
                            {isBrakeShift ? "Brake shift" : (emp.employeeAssignment?.selectedDescription || "Legacy shift")}
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setShowViewModal(false);
                                  setEditingAssignment(emp);
                                  setAssignForm({
                                    employeeId: emp.employeeAssignment?.employeeId || emp.employeeId,
                                    employeeName: emp.employeeAssignment?.employeeName || emp.employeeName,
                                    shiftType: emp.shiftType
                                  });
                                  setShowAssignModal(true);
                                }}
                                className="px-2 py-1 text-[8px] bg-blue-50 text-blue-700 rounded hover:bg-blue-100 border border-blue-200"
                              >
                                <FaEdit className="text-[6px]" /> Edit
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteAssignment(emp._id);
                                  setShowViewModal(false);
                                }}
                                className="px-2 py-1 text-[8px] bg-red-50 text-red-700 rounded hover:bg-red-100 border border-red-200"
                              >
                                <FaTrash className="text-[6px]" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="w-full py-2 text-[10px] bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftManagement;