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
//         "http://localhost:5000//api/shifts/assign",
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
//         "http://localhost:5000/api/shifts/assign",
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
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaClock, FaEdit, FaEye, FaPlus, FaTimes, FaTrash, FaUser } from 'react-icons/fa';

const ShiftManagement = () => {
  const [masterShifts, setMasterShifts] = useState([]);
  const [employeeAssignments, setEmployeeAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCustomCreateModal, setShowCustomCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // Data
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [viewingShiftType, setViewingShiftType] = useState('');
  const [viewEmployees, setViewEmployees] = useState([]);
  const [viewShiftInfo, setViewShiftInfo] = useState({});
  
  // Forms
  const [createForm, setCreateForm] = useState({
    shiftType: '',
    shiftName: '',
    timeSlots: [
      { slotId: `${Date.now()}_1`, timeRange: '', description: '' },
      { slotId: `${Date.now()}_2`, timeRange: '', description: '' },
      { slotId: `${Date.now()}_3`, timeRange: '', description: '' },
      { slotId: `${Date.now()}_4`, timeRange: '', description: '' }
    ]
  });
  
  const [assignForm, setAssignForm] = useState({
    employeeId: '',
    employeeName: '',
    shiftType: '',
    selectedSlotId: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log("🔄 Fetching data...");
      
      // Fetch master shifts
      const shiftsRes = await axios.get('http://localhost:5000/api/shifts/master');
      console.log("Master shifts response:", shiftsRes.data);
      
      if (shiftsRes.data.success) {
        setMasterShifts(shiftsRes.data.data);
      } else {
        setError(shiftsRes.data.message);
      }
      
      // Fetch employee assignments
      const assignedRes = await axios.get('http://localhost:5000/api/shifts/assignments');
      console.log("Assignments response:", assignedRes.data);
      
      if (assignedRes.data.success) {
        setEmployeeAssignments(assignedRes.data.data);
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

  // ✅ CREATE CUSTOM SHIFT (E, F, G, etc.)
  const handleCreateCustomShift = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      console.log("Creating custom shift:", createForm);
      
      if (!createForm.shiftType || !createForm.shiftName) {
        setError('Please enter shift type and name');
        return;
      }

      // Validate time slots
      const validSlots = createForm.timeSlots.filter(slot => 
        slot.timeRange.trim() !== '' && slot.description.trim() !== ''
      );
      
      if (validSlots.length === 0) {
        setError('Please add at least one time slot');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/shifts/create', {
        shiftType: createForm.shiftType,
        shiftName: createForm.shiftName,
        timeSlots: validSlots
      });
      
      console.log("Create custom response:", response.data);
      
      if (response.data.success) {
        setSuccess(`✅ Custom Shift ${createForm.shiftType} created successfully!`);
        fetchData();
        setShowCustomCreateModal(false);
        setCreateForm({
          shiftType: '',
          shiftName: '',
          timeSlots: [
            { slotId: `${Date.now()}_1`, timeRange: '', description: '' },
            { slotId: `${Date.now()}_2`, timeRange: '', description: '' },
            { slotId: `${Date.now()}_3`, timeRange: '', description: '' },
            { slotId: `${Date.now()}_4`, timeRange: '', description: '' }
          ]
        });
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Create custom error:', error);
      setError(error.response?.data?.message || 'Failed to create custom shift');
    }
  };

  // ✅ Add time slot
  const addTimeSlot = () => {
    setCreateForm(prev => ({
      ...prev,
      timeSlots: [
        ...prev.timeSlots,
        { slotId: `${Date.now()}_${prev.timeSlots.length + 1}`, timeRange: '', description: '' }
      ]
    }));
  };

  // ✅ Remove time slot
  const removeTimeSlot = (index) => {
    if (createForm.timeSlots.length > 1) {
      const newSlots = [...createForm.timeSlots];
      newSlots.splice(index, 1);
      setCreateForm(prev => ({ ...prev, timeSlots: newSlots }));
    }
  };

  // ✅ Update time slot
  const updateTimeSlot = (index, field, value) => {
    const newSlots = [...createForm.timeSlots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setCreateForm(prev => ({ ...prev, timeSlots: newSlots }));
  };

  // ✅ Get time slots for shift type
  const getShiftTimeSlots = (shiftType) => {
    const shift = masterShifts.find(s => s.shiftType === shiftType);
    return shift?.timeSlots || [];
  };

  // ✅ Get employees count for shift type
  const getEmployeesCount = (shiftType) => {
    return employeeAssignments.filter(a => a.shiftType === shiftType).length;
  };

  // ✅ Get shift color
  const getShiftColor = (type) => {
    const colors = {
      "A": "bg-blue-50 border-blue-200",
      "B": "bg-green-50 border-green-200", 
      "C": "bg-purple-50 border-purple-200",
      "D": "bg-orange-50 border-orange-200",
      "E": "bg-pink-50 border-pink-200",
      "F": "bg-teal-50 border-teal-200",
      "G": "bg-indigo-50 border-indigo-200",
      "H": "bg-yellow-50 border-yellow-200",
      "I": "bg-red-50 border-red-200",
      "J": "bg-cyan-50 border-cyan-200"
    };
    return colors[type] || "bg-gray-50";
  };

  const getShiftTextColor = (type) => {
    const colors = {
      "A": "text-blue-800",
      "B": "text-green-800",
      "C": "text-purple-800",
      "D": "text-orange-800",
      "E": "text-pink-800",
      "F": "text-teal-800",
      "G": "text-indigo-800",
      "H": "text-yellow-800",
      "I": "text-red-800",
      "J": "text-cyan-800"
    };
    return colors[type] || "text-gray-800";
  };

  // ✅ Get time range from assignment (legacy or new)
  const getEmployeeTimeRange = (assignment) => {
    if (assignment.employeeAssignment?.selectedTimeRange) {
      return assignment.employeeAssignment.selectedTimeRange;
    } else if (assignment.startTime && assignment.endTime) {
      return `${assignment.startTime} - ${assignment.endTime}`;
    }
    return "Not specified";
  };

  // ✅ ASSIGN SHIFT FUNCTION - FIXED VERSION
  const handleAssignShift = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const { employeeId, employeeName, shiftType, selectedSlotId } = assignForm;
      
      if (!employeeId || !employeeName || !shiftType) {
        setError('Please fill all required fields');
        return;
      }

      // Get time slot details
      let selectedTimeRange = "10:00 - 19:00";
      let selectedDescription = "Morning shift";
      
      if (selectedSlotId) {
        const timeSlots = getShiftTimeSlots(shiftType);
        const selectedSlot = timeSlots.find(slot => slot.slotId === selectedSlotId);
        if (selectedSlot) {
          selectedTimeRange = selectedSlot.timeRange;
          selectedDescription = selectedSlot.description;
        }
      }

      console.log("📝 Assigning shift with data:", {
        employeeId,
        employeeName,
        shiftType,
        selectedSlotId,
        selectedTimeRange,
        selectedDescription
      });

      // ✅ API call
      const response = await axios.post('http://localhost:5000/api/shifts/assign', {
        employeeId,
        employeeName,
        shiftType,
        selectedSlotId,
        selectedTimeRange,
        selectedDescription
      });

      console.log("📱 Assign API response:", response.data);

      if (response.data.success) {
        setSuccess(`✅ Shift assigned to ${employeeName} successfully!`);
        fetchData();
        setShowAssignModal(false);
        setAssignForm({
          employeeId: '',
          employeeName: '',
          shiftType: '',
          selectedSlotId: ''
        });
      } else {
        setError(response.data.message || 'Failed to assign shift');
      }
    } catch (error) {
      console.error('❌ Assign error:', error);
      setError(error.response?.data?.message || 'Failed to assign shift');
    }
  };

  // ✅ UPDATE ASSIGNMENT FUNCTION
  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const { employeeName, shiftType, selectedSlotId } = assignForm;
      
      if (!employeeName || !shiftType) {
        setError('Please fill all required fields');
        return;
      }

      // Get time slot details
      let selectedTimeRange = "10:00 - 19:00";
      let selectedDescription = "Morning shift";
      
      if (selectedSlotId) {
        const timeSlots = getShiftTimeSlots(shiftType);
        const selectedSlot = timeSlots.find(slot => slot.slotId === selectedSlotId);
        if (selectedSlot) {
          selectedTimeRange = selectedSlot.timeRange;
          selectedDescription = selectedSlot.description;
        }
      }

      console.log("📝 Updating assignment:", {
        id: editingAssignment._id,
        employeeName,
        shiftType,
        selectedSlotId,
        selectedTimeRange,
        selectedDescription
      });

      const response = await axios.put(
        `http://localhost:5000/api/shifts/assignments/${editingAssignment._id}`,
        {
          employeeName,
          shiftType,
          selectedSlotId,
          selectedTimeRange: selectedTimeRange,
          selectedDescription: selectedDescription
        }
      );

      console.log("📱 Update API response:", response.data);

      if (response.data.success) {
        setSuccess('✅ Assignment updated successfully!');
        fetchData();
        setShowAssignModal(false);
        setEditingAssignment(null);
        setAssignForm({
          employeeId: '',
          employeeName: '',
          shiftType: '',
          selectedSlotId: ''
        });
      } else {
        setError(response.data.message || 'Failed to update assignment');
      }
    } catch (error) {
      console.error('❌ Update error:', error);
      setError(error.response?.data?.message || 'Failed to update assignment');
    }
  };

  // ✅ DELETE ASSIGNMENT
  const handleDeleteAssignment = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/shifts/assignments/${id}`);
        if (response.data.success) {
          setSuccess('Shift assignment removed successfully');
          fetchData();
        }
      } catch (error) {
        setError('Failed to delete assignment');
      }
    }
  };

  // ✅ DELETE MASTER SHIFT
  const handleDeleteMasterShift = async (id, shiftName) => {
    if (window.confirm(`Delete ${shiftName}? This will remove all assignments.`)) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/shifts/master/${id}`);
        if (response.data.success) {
          setSuccess(response.data.message);
          fetchData();
        }
      } catch (error) {
        setError('Failed to delete shift');
      }
    }
  };

  // ✅ VIEW EMPLOYEES BY SHIFT TYPE
  const handleViewEmployees = async (shiftType, shiftName) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/shifts/type/${shiftType}/employees`);
      if (response.data.success) {
        setViewShiftInfo({
          shiftType,
          shiftName
        });
        setViewEmployees(response.data.data.employees);
        setViewingShiftType(shiftType);
        setShowViewModal(true);
      }
    } catch (error) {
      setError('Failed to fetch employees');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4">Loading shifts...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Shifts</h1>
          {/* <p className="text-gray-600">Supporting A-Z shift types with legacy data</p> */}
        </div>
        <div className="flex gap-3">
          {/* <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
          >
            <FaPlus /> Quick Create (A-D)
          </button> */}
          <button
            onClick={() => setShowCustomCreateModal(true)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm"
          >
            <FaPlus /> Custom Create (E-Z)
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
          >
            <FaClock /> Assign Shift
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm">
          ❌ {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg text-sm">
          ✅ {success}
        </div>
      )}

      {/* ✅ 1. AVAILABLE SHIFTS SECTION - FIRST */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Available Shifts ({masterShifts.length})</h2>
        {masterShifts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-gray-400 mb-4 text-6xl">⏰</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No shifts created yet</h3>
            <p className="text-gray-500 mb-4">Create your first shift to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              Create First Shift
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {masterShifts.map((shift) => (
              <div
                key={shift._id}
                className={`bg-white rounded-lg border p-4 shadow-sm ${getShiftColor(shift.shiftType)}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${getShiftTextColor(shift.shiftType)}`}>
                      {shift.shiftName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded ${getShiftTextColor(shift.shiftType)}`}>
                        Shift {shift.shiftType}
                      </span>
                      <span className="text-xs text-gray-500">
                        {shift.timeSlots?.length || 0} slots
                      </span>
                    </div>
                    
                    {/* Time Slots Preview */}
                    <div className="mt-2">
                      <div className="space-y-1 max-h-16 overflow-y-auto">
                        {shift.timeSlots?.slice(0, 2).map((slot) => (
                          <div key={slot.slotId} className="text-xs text-gray-600 flex items-center gap-1">
                            <span>• {slot.timeRange}</span>
                          </div>
                        ))}
                        {shift.timeSlots?.length > 2 && (
                          <div className="text-xs text-gray-400">
                            +{shift.timeSlots.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteMasterShift(shift._id, shift.shiftName)}
                    className="text-red-600 hover:text-red-800 p-1 text-sm"
                    title="Delete Shift"
                  >
                    <FaTimes />
                  </button>
                </div>

                {/* Employee Count */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-gray-500 text-xs" />
                    <span className="text-xs font-medium">
                      {getEmployeesCount(shift.shiftType)} employees
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleViewEmployees(shift.shiftType, shift.shiftName)}
                      disabled={getEmployeesCount(shift.shiftType) === 0}
                      className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                        getEmployeesCount(shift.shiftType) > 0
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <FaEye className="text-xs" /> View
                    </button>
                    <button
                      onClick={() => {
                        setAssignForm({
                          employeeId: '',
                          employeeName: '',
                          shiftType: shift.shiftType,
                          selectedSlotId: ''
                        });
                        setEditingAssignment(null);
                        setShowAssignModal(true);
                      }}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <FaPlus className="text-xs" /> Assign
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ 2. ALL ASSIGNED EMPLOYEES SECTION - SECOND */}
      {employeeAssignments.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">All Assigned Employees ({employeeAssignments.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {employeeAssignments.map((assignment) => (
              <div key={assignment._id} className={`bg-white p-3 rounded-lg border shadow-sm ${getShiftColor(assignment.shiftType)}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getShiftTextColor(assignment.shiftType)}`}>
                        Shift {assignment.shiftType}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm">
                      {assignment.employeeAssignment?.employeeName || assignment.employeeName}
                    </h3>
                    <p className="text-xs text-gray-600">
                      ID: {assignment.employeeAssignment?.employeeId || assignment.employeeId}
                    </p>
                    
                    {/* Time Slot Display */}
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <p className="font-medium text-gray-700">
                        ⏰ <span className="font-bold">{getEmployeeTimeRange(assignment)}</span>
                      </p>
                      <p className="text-gray-500 mt-1">
                        {assignment.employeeAssignment?.selectedDescription || "Legacy shift"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingAssignment(assignment);
                        setAssignForm({
                          employeeId: assignment.employeeAssignment?.employeeId || assignment.employeeId,
                          employeeName: assignment.employeeAssignment?.employeeName || assignment.employeeName,
                          shiftType: assignment.shiftType,
                          selectedSlotId: assignment.employeeAssignment?.selectedSlotId || ''
                        });
                        setShowAssignModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 p-1 text-sm"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(assignment._id)}
                      className="text-red-600 hover:text-red-800 p-1 text-sm"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUICK CREATE MODAL (A-D) */}
      {/* {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Quick Create Shift (A-D)</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                &times;
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              // Quick create A-D shifts
              const shiftType = createForm.shiftType;
              if (!shiftType) {
                setError('Please select a shift type');
                return;
              }
              
              const shiftNames = {
                "A": "Morning Shift",
                "B": "Evening Shift", 
                "C": "Night Shift",
                "D": "General Shift"
              };
              
              setCreateForm(prev => ({ 
                ...prev, 
                shiftName: shiftNames[shiftType] || shiftType 
              }));
              
              // Simulate form submission
              setTimeout(() => {
                const quickCreate = async () => {
                  try {
                    const response = await axios.post('http://localhost:5000/api/shifts/create', {
                      shiftType: shiftType,
                      shiftName: shiftNames[shiftType] || shiftType
                    });
                    
                    if (response.data.success) {
                      setSuccess(`✅ Shift ${shiftType} created successfully!`);
                      fetchData();
                      setShowCreateModal(false);
                    }
                  } catch (error) {
                    setError(error.response?.data?.message || 'Failed to create shift');
                  }
                };
                quickCreate();
              }, 100);
            }} className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Shift Type (A-D)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {["A", "B", "C", "D"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setCreateForm(prev => ({ 
                          ...prev, 
                          shiftType: type,
                          shiftName: type === "A" ? "Morning Shift" : 
                                   type === "B" ? "Evening Shift" : 
                                   type === "C" ? "Night Shift" : 
                                   "General Shift"
                        }))}
                        className={`p-4 rounded-lg border text-center ${
                          createForm.shiftType === type
                            ? `${getShiftColor(type)} border-2 border-blue-500`
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <div className="font-bold text-lg">Shift {type}</div>
                        <div className="text-sm mt-1">
                          {type === "A" ? "Morning" : 
                           type === "B" ? "Evening" : 
                           type === "C" ? "Night" : "General"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shift Name
                  </label>
                  <input
                    type="text"
                    value={createForm.shiftName}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Create Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )} */}

      {/* CUSTOM CREATE MODAL (E-Z) */}
      {showCustomCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Create Custom Shift (E-Z or any letter)</h3>
              <button onClick={() => setShowCustomCreateModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateCustomShift} className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shift Type (Single letter E-Z) *
                    </label>
                    <input
                      type="text"
                      maxLength="1"
                      value={createForm.shiftType}
                      onChange={(e) => setCreateForm(prev => ({ 
                        ...prev, 
                        shiftType: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg uppercase text-sm"
                      placeholder="E"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter a single letter (E, F, G, H, etc.)</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shift Name *
                    </label>
                    <input
                      type="text"
                      value={createForm.shiftName}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, shiftName: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="e.g., Extended Shift E"
                      required
                    />
                  </div>
                </div>

                {/* Time Slots Configuration */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Configure Time Slots (Minimum 1 required) *
                    </label>
                    <button
                      type="button"
                      onClick={addTimeSlot}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      + Add Slot
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {createForm.timeSlots.map((slot, index) => (
                      <div key={slot.slotId} className="p-3 border rounded-lg bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Slot {index + 1}</span>
                          {createForm.timeSlots.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTimeSlot(index)}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Time Range *</label>
                            <input
                              type="text"
                              value={slot.timeRange}
                              onChange={(e) => updateTimeSlot(index, 'timeRange', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                              placeholder="e.g., 10:00 - 19:00"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Description *</label>
                            <input
                              type="text"
                              value={slot.description}
                              onChange={(e) => updateTimeSlot(index, 'description', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                              placeholder="e.g., Morning 10 to 7"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                {createForm.shiftType && createForm.timeSlots.some(s => s.timeRange) && (
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2 text-sm">Preview:</h4>
                    <p className="text-sm text-blue-700">
                      Shift {createForm.shiftType}: {createForm.shiftName}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {createForm.timeSlots.filter(s => s.timeRange).length} time slot(s) will be created.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowCustomCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                >
                  Create Custom Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN SHIFT MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingAssignment ? 'Edit Assignment' : 'Assign Shift'}
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                &times;
              </button>
            </div>

            <form onSubmit={editingAssignment ? handleUpdateAssignment : handleAssignShift} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee ID {editingAssignment && '(Cannot change)'}
                  </label>
                  <input
                    type="text"
                    value={assignForm.employeeId}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, employeeId: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="EMP001"
                    required
                    readOnly={!!editingAssignment}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee Name *
                  </label>
                  <input
                    type="text"
                    value={assignForm.employeeName}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, employeeName: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Shift Type *
                  </label>
                  <select
                    value={assignForm.shiftType}
                    onChange={(e) => setAssignForm(prev => ({ 
                      ...prev, 
                      shiftType: e.target.value,
                      selectedSlotId: ''
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    required
                  >
                    <option value="">Select Shift Type</option>
                    {masterShifts.map(shift => (
                      <option key={shift._id} value={shift.shiftType}>
                        Shift {shift.shiftType}: {shift.shiftName}
                      </option>
                    ))}
                    {/* Legacy shift types that might not have master shift */}
                    {employeeAssignments
                      .map(a => a.shiftType)
                      .filter((type, index, self) => 
                        self.indexOf(type) === index && 
                        !masterShifts.find(s => s.shiftType === type)
                      )
                      .map(type => (
                        <option key={type} value={type}>
                          Shift {type} (Legacy)
                        </option>
                      ))
                    }
                  </select>
                </div>

                {/* Time Slot Selection (only if master shift exists) */}
                {assignForm.shiftType && masterShifts.find(s => s.shiftType === assignForm.shiftType) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Time Slot *
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {getShiftTimeSlots(assignForm.shiftType).map((slot) => (
                        <button
                          key={slot.slotId}
                          type="button"
                          onClick={() => setAssignForm(prev => ({ ...prev, selectedSlotId: slot.slotId }))}
                          className={`w-full p-3 text-left rounded-lg border flex justify-between items-center text-sm ${
                            assignForm.selectedSlotId === slot.slotId
                              ? 'bg-blue-50 border-blue-300'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div>
                            <div className="font-medium">{slot.timeRange}</div>
                            <div className="text-xs text-gray-500">{slot.description}</div>
                          </div>
                          {assignForm.selectedSlotId === slot.slotId && (
                            <div className="text-blue-600">✓</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setEditingAssignment(null);
                    setAssignForm({
                      employeeId: '',
                      employeeName: '',
                      shiftType: '',
                      selectedSlotId: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  {editingAssignment ? 'Update' : 'Assign'} Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW EMPLOYEES MODAL - WITH CLOSE BUTTON */}
      {showViewModal && viewEmployees.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {viewShiftInfo.shiftName} Employees
                </h3>
                <p className="text-sm text-gray-600">
                  Shift {viewShiftInfo.shiftType} • {viewEmployees.length} employees
                </p>
              </div>
              <button 
                onClick={() => setShowViewModal(false)} 
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>
            
            {/* Modal Body - Scrollable */}
            <div className="overflow-y-auto flex-1">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Slot</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {viewEmployees.map((emp) => (
                    <tr key={emp._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-sm">{emp.employeeAssignment?.employeeName || emp.employeeName}</div>
                          <div className="text-xs text-gray-500">ID: {emp.employeeAssignment?.employeeId || emp.employeeId}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getEmployeeTimeRange(emp) !== "Not specified" ? (
                          <div>
                            <div className="font-medium text-sm">{getEmployeeTimeRange(emp)}</div>
                            <div className="text-xs text-gray-500">{emp.employeeAssignment?.selectedDescription || "Legacy shift"}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Not assigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setShowViewModal(false);
                              setEditingAssignment(emp);
                              setAssignForm({
                                employeeId: emp.employeeAssignment?.employeeId || emp.employeeId,
                                employeeName: emp.employeeAssignment?.employeeName || emp.employeeName,
                                shiftType: emp.shiftType,
                                selectedSlotId: emp.employeeAssignment?.selectedSlotId || ''
                              });
                              setShowAssignModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                          >
                            <FaEdit className="text-xs" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAssignment(emp._id)}
                            className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                          >
                            <FaTrash className="text-xs" /> Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t">
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftManagement;