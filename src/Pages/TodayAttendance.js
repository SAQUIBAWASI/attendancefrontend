// // src/pages/TodayAttendance.jsx
// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const TodayAttendance = () => {
//   const [todayRecords, setTodayRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchTodayAttendance();
//   }, []);

//   const fetchTodayAttendance = async () => {
//     try {
//       setLoading(true);
//       const resp = await axios.get(
//         "https://api.timelyhealth.in//api/attendance/today"
//       );

//       let records = resp.data.records || [];

//       const formattedRecords = records.map((rec) => ({
//         ...rec,
//         employeeName: rec.employeeName || rec.employee?.name || "-",
//         employeeEmail: rec.employeeEmail || rec.employee?.email || "-",
//       }));

//       setTodayRecords(formattedRecords);
//     } catch (err) {
//       setError("Failed to fetch today's attendance");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch ((status || "").toLowerCase()) {
//       case "checked-in":
//         return "bg-green-100 text-green-800";
//       case "checked-out":
//         return "bg-blue-100 text-blue-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   if (loading)
//     return <p className="mt-6 text-center text-gray-600">Loading today's attendance...</p>;

//   if (error)
//     return <p className="mt-6 text-center text-red-600">{error}</p>;

//   return (
//     <div className="max-w-6xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-2xl font-bold text-gray-800">Today's Attendance</h3>

//         <button
//           onClick={() => navigate("/attendance-records")}
//           className="px-4 py-2 text-sm text-white transition bg-blue-600 rounded hover:bg-blue-700"
//         >
//           View All Records
//         </button>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full text-sm text-left border border-gray-200">
//           <thead className="text-gray-700 bg-gray-100">
//             <tr>
//               <th className="px-4 py-2 border">Employee ID</th>
//               <th className="px-4 py-2 border">Name</th>
//               <th className="px-4 py-2 border">Check In</th>
//               <th className="px-4 py-2 border">Check Out</th>
//               <th className="px-4 py-2 border">Total Hours</th>
//               <th className="px-4 py-2 border">Distance (m)</th>
//               <th className="px-4 py-2 border">Onsite</th>
//               <th className="px-4 py-2 border">Status</th>
//             </tr>
//           </thead>

//           <tbody>
//             {todayRecords.length > 0 ? (
//               todayRecords.map((rec) => (
//                 <tr key={rec._id} className="border-t hover:bg-gray-50">
//                   <td className="px-4 py-2 font-medium">{rec.employeeId}</td>
//                   <td className="px-4 py-2">{rec.employeeName}</td>
//                   <td className="px-4 py-2">
//                     {rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : "-"}
//                   </td>
//                   <td className="px-4 py-2">
//                     {rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : "-"}
//                   </td>
//                   <td className="px-4 py-2">
//                     {rec.totalHours ? Number(rec.totalHours).toFixed(2) : "0.00"}
//                   </td>
//                   <td className="px-4 py-2">
//                     {rec.distance ? Number(rec.distance).toFixed(2) : "0.00"}
//                   </td>
//                   <td className="px-4 py-2">{rec.onsite ? "Yes" : "No"}</td>
//                   <td className="px-4 py-2">
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                         rec.status
//                       )}`}
//                     >
//                       {rec.status || "-"}
//                     </span>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={8} className="py-4 text-center text-gray-500">
//                   No attendance records for today.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default TodayAttendance;

// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// // const BASE_URL = "https://api.timelyhealth.in/"; // replace with your backend base URL

// const TodayAttendance = () => {
//   const [todayRecords, setTodayRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchTodayAttendance();
//   }, []);

//   const fetchTodayAttendance = async () => {
//     try {
//       setLoading(true);
//       const resp = await axios.get("https://api.timelyhealth.in//api/attendance/today");
//       if (resp.data && resp.data.records) {
//         setTodayRecords(resp.data.records);
//       }
//     } catch (err) {
//       console.error("Error fetching today's attendance:", err);
//       setError("Failed to fetch today's attendance");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch ((status || "").toLowerCase()) {
//       case "checked-in":
//         return "bg-green-100 text-green-800";
//       case "checked-out":
//         return "bg-blue-100 text-blue-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   if (loading)
//     return <p className="mt-6 text-center text-gray-600">Loading today's attendance...</p>;
//   if (error) return <p className="mt-6 text-center text-red-600">{error}</p>;

//   return (
//     <div className="max-w-6xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-2xl font-bold text-gray-800">Today's Attendance</h3>
//         <button
//           onClick={() => navigate("/attendance-records")}
//           className="px-4 py-2 text-sm text-white transition bg-blue-600 rounded hover:bg-blue-700"
//         >
//           View All Records
//         </button>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full text-sm text-left border border-gray-200">
//           <thead className="text-gray-700 bg-gray-100">
//             <tr>
//               <th className="px-4 py-2 border">Employee ID</th>
//               <th className="px-4 py-2 border">Email</th>
//               <th className="px-4 py-2 border">Check In</th>
//               <th className="px-4 py-2 border">Check Out</th>
//               <th className="px-4 py-2 border">Total Hours</th>
//               <th className="px-4 py-2 border">Distance (m)</th>
//               <th className="px-4 py-2 border">Onsite</th>
//               <th className="px-4 py-2 border">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {todayRecords.length > 0 ? (
//               todayRecords.map((rec) => (
//                 <tr
//                   key={rec._id}
//                   className="border-t cursor-pointer hover:bg-gray-50"
//                   onClick={() =>
//                     navigate(`/employee-details/${rec.employeeId}`)
//                   }
//                 >
//                   <td className="px-4 py-2 font-medium">{rec.employeeId}</td>
//                   <td className="px-4 py-2">{rec.employeeEmail}</td>
//                   <td className="px-4 py-2">
//                     {rec.checkInTime
//                       ? new Date(rec.checkInTime).toLocaleTimeString()
//                       : "-"}
//                   </td>
//                   <td className="px-4 py-2">
//                     {rec.checkOutTime
//                       ? new Date(rec.checkOutTime).toLocaleTimeString()
//                       : "-"}
//                   </td>
//                   <td className="px-4 py-2">{rec.totalHours?.toFixed(2) || "-"}</td>
//                   <td className="px-4 py-2">{rec.distance?.toFixed(2) || "-"}</td>
//                   <td className="px-4 py-2">{rec.onsite ? "Yes" : "No"}</td>
//                   <td className="px-4 py-2">
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                         rec.status
//                       )}`}
//                     >
//                       {rec.status || "-"}
//                     </span>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={8} className="py-4 text-center text-gray-500">
//                   No attendance records for today.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default TodayAttendance;

import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { isEmployeeHidden } from "../utils/employeeStatus";

const TodayAttendance = () => {
  const [todayRecords, setTodayRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  // Employees data for department/designation
  const [employees, setEmployees] = useState([]);
  
  // Date filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // Search filters
  const [searchTerm, setSearchTerm] = useState("");
  
  // Department and Designation filter states
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showDesignationFilter, setShowDesignationFilter] = useState(false);
  
  // Unique departments and designations
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueDesignations, setUniqueDesignations] = useState([]);
  
  // Refs for click outside
  const departmentFilterRef = useRef(null);
  const designationFilterRef = useRef(null);
  
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

  // Click outside handlers for filter dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentFilterRef.current && !departmentFilterRef.current.contains(event.target)) {
        setShowDepartmentFilter(false);
      }
      if (designationFilterRef.current && !designationFilterRef.current.contains(event.target)) {
        setShowDesignationFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  useEffect(() => {
    // Apply filters whenever data or filters change
    filterRecords();
  }, [todayRecords, searchTerm, filterDepartment, filterDesignation, fromDate, toDate, selectedMonth]);

  useEffect(() => {
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [searchTerm, filterDepartment, filterDesignation, fromDate, toDate, selectedMonth]);

  const fetchTodayAttendance = async () => {
    try {
      setLoading(true);

      // 1️⃣ Fetch attendance
      const attendanceResp = await axios.get(
        `${API_BASE_URL}/attendance/today`
      );

      const attendance = attendanceResp.data.records || [];

      // 2️⃣ Fetch employee list
      const empResp = await axios.get(
        `${API_BASE_URL}/employees/get-employees`
      );
      const employeesData = empResp.data || [];
      
      // Filter active employees
      const activeEmployees = employeesData.filter(emp => !isEmployeeHidden(emp));
      setEmployees(activeEmployees);
      
      // Extract unique departments and designations
      const depts = new Set();
      const designations = new Set();
      activeEmployees.forEach(emp => {
        if (emp.department) depts.add(emp.department);
        if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
      });
      setUniqueDepartments(Array.from(depts).sort());
      setUniqueDesignations(Array.from(designations).sort());

      // 3️⃣ Map employee details into attendance records
      const merged = attendance
        .map((rec) => {
          const empId =
            rec.employeeId?._id ||
            rec.employeeId?.employeeId ||
            rec.employeeId ||
            rec.empId ||
            "";

          const employee = employeesData.find(
            (e) =>
              e.employeeId === empId ||
              e._id === empId ||
              e.empId === empId
          );

          // Skip if employee is hidden
          if (isEmployeeHidden(employee)) return null;

          return {
            ...rec,
            name: employee?.name || employee?.fullName || "N/A",
            employeeId: empId,
            department: employee?.department || employee?.departmentName || "N/A",
            designation: employee?.designation || employee?.role || "N/A",
            joinDate: employee?.joinDate
          };
        })
        .filter(rec => rec !== null); // Remove hidden employees

      setTodayRecords(merged);
    } catch (err) {
      console.error("Error fetching today's attendance:", err);
      setError("Failed to fetch today's attendance");
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = [...todayRecords];
    
    // Filter by Employee ID or Name
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(rec => 
        rec.employeeId?.toString().toLowerCase().includes(term) ||
        rec.name?.toLowerCase().includes(term)
      );
    }
    
    // Filter by Department
    if (filterDepartment) {
      filtered = filtered.filter(rec => rec.department === filterDepartment);
    }
    
    // Filter by Designation
    if (filterDesignation) {
      filtered = filtered.filter(rec => rec.designation === filterDesignation);
    }
    
    // Filter by Date Range
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(rec => {
        const recDate = new Date(rec.checkInTime);
        return recDate >= from && recDate <= to;
      });
    } else if (fromDate && !toDate) {
      // Single date
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(fromDate);
      to.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(rec => {
        const recDate = new Date(rec.checkInTime);
        return recDate >= from && recDate <= to;
      });
    } else if (selectedMonth) {
      // Month filter
      const [year, month] = selectedMonth.split('-').map(Number);
      filtered = filtered.filter(rec => {
        const recDate = new Date(rec.checkInTime);
        return recDate.getFullYear() === year && recDate.getMonth() + 1 === month;
      });
    }
    
    setFilteredRecords(filtered);
    setPagination(prev => ({
      ...prev,
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.limit)
    }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterDesignation("");
    setFromDate("");
    setToDate("");
    setSelectedMonth(new Date().toISOString().slice(0, 7));
  };

  // Pagination calculations
  const indexOfLastRow = pagination.currentPage * pagination.limit;
  const indexOfFirstRow = indexOfLastRow - pagination.limit;
  const currentRows = filteredRecords.slice(indexOfFirstRow, indexOfLastRow);

  const handleItemsPerPageChange = (limit) => {
    setPagination({
      currentPage: 1,
      limit: limit,
      totalCount: filteredRecords.length,
      totalPages: Math.ceil(filteredRecords.length / limit)
    });
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "checked-in":
        return "bg-green-100 text-green-800";
      case "checked-out":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getHoursColor = (hours) => {
    if (hours >= 8) return 'bg-green-100 text-green-700';
    if (hours >= 4) return 'bg-yellow-100 text-yellow-700';
    return 'bg-orange-100 text-orange-700';
  };

  if (loading)
    return (
      <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="mx-auto max-w-9xl">
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Loading today's attendance...</span>
            </div>
          </div>
        </div>
      </div>
    );
    
  if (error)
    return (
      <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="mx-auto max-w-9xl">
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-9xl">
        {/* Filters */}
        <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* ID/Name Search */}
            <div className="relative flex-1 min-w-[180px]">
              <FaSearch className="absolute text-sm text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="text"
                placeholder="Search by ID or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Department Filter Button */}
            <div className="relative" ref={departmentFilterRef}>
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
                <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
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

            {/* Designation Filter Button */}
            <div className="relative" ref={designationFilterRef}>
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
                <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
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

            {/* From Date */}
            <div className="relative w-[130px]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
                From:
              </span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-12 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* To Date */}
            <div className="relative w-[130px]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
                To:
              </span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-10 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Month Selector */}
            <div className="relative w-[130px]">
              <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate) && (
              <button
                onClick={clearFilters}
                className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <p className="text-lg text-gray-500">No attendance records found</p>
            <p className="mt-2 text-sm text-gray-400">
              {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate) && "Try clearing filters"}
            </p>
          </div>
        ) : (
          <>
            {/* Attendance Table */}
            <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
              <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                <table className="min-w-full">
                  <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                    <tr>
                      <th className="py-2 text-center">Employee ID</th>
                      <th className="py-2 text-center">Name</th>
                      <th className="py-2 text-center">Department</th>
                      <th className="py-2 text-center">Designation</th>
                      <th className="py-2 text-center">Check In</th>
                      <th className="py-2 text-center">Check Out</th>
                      <th className="py-2 text-center">Total Hours</th>
                      <th className="py-2 text-center">Distance (m)</th>
                      <th className="py-2 text-center">Onsite</th>
                      <th className="py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((rec) => (
                      <tr
                        key={rec._id}
                        className="transition-colors border-t cursor-pointer hover:bg-gray-50"
                        onClick={() =>
                          navigate(`/employee-details/${rec.employeeId}`)
                        }
                      >
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {rec.employeeId || "-"}
                        </td>

                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {rec.name}
                        </td>

                        <td className="px-2 py-2 text-center text-gray-600">
                          {rec.department}
                        </td>

                        <td className="px-2 py-2 text-center text-gray-600">
                          {rec.designation}
                        </td>

                        <td className="px-2 py-2 text-center text-gray-600">
                          {rec.checkInTime
                            ? new Date(rec.checkInTime).toLocaleTimeString()
                            : "-"}
                        </td>

                        <td className="px-2 py-2 text-center text-gray-600">
                          {rec.checkOutTime
                            ? new Date(rec.checkOutTime).toLocaleTimeString()
                            : "-"}
                        </td>

                        <td className="px-2 py-2 text-center whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getHoursColor(rec.totalHours)}`}>
                            {rec.totalHours?.toFixed(2) || "0.00"}h
                          </span>
                        </td>

                        <td className="px-2 py-2 text-sm font-medium text-center text-gray-800 whitespace-nowrap">
                          {rec.distance?.toFixed(2) || "-"}
                        </td>

                        <td className="px-2 py-2 text-sm font-medium text-center text-gray-500 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${rec.onsite ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {rec.onsite ? "Yes" : "No"}
                          </span>
                        </td>

                        <td className="px-2 py-2 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              rec.status
                            )}`}
                          >
                            {rec.status || "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredRecords.length > 0 && (
                <div className="flex items-center justify-between px-2 py-2 border-t border-gray-200 bg-gray-50">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-700">
                    <span>Showing</span>
                    <span className="font-medium">
                      {indexOfFirstRow + 1}
                    </span>
                    <span>to</span>
                    <span className="font-medium">
                      {Math.min(indexOfLastRow, filteredRecords.length)}
                    </span>
                    <span>of</span>
                    <span className="font-medium">
                      {filteredRecords.length}
                    </span>
                    <span>results</span>

                    {/* Select Dropdown */}
                    <select
                      value={pagination.limit}
                      onChange={(e) => {
                        const newLimit = Number(e.target.value);
                        handleItemsPerPageChange(newLimit);
                      }}
                      className="p-1 ml-1 text-xs border rounded-lg"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: prev.currentPage - 1,
                        }))
                      }
                      disabled={pagination.currentPage === 1}
                      className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-0.5">
                      {[...Array(pagination.totalPages)].map((_, index) => {
                        const page = index + 1;
                        if (
                          page === 1 ||
                          page === pagination.totalPages ||
                          (page >= pagination.currentPage - 1 &&
                            page <= pagination.currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() =>
                                setPagination((prev) => ({
                                  ...prev,
                                  currentPage: page,
                                }))
                              }
                              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                                pagination.currentPage === page
                                  ? "bg-blue-600 text-white"
                                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === pagination.currentPage - 2 ||
                          page === pagination.currentPage + 2
                        ) {
                          return (
                            <span key={page} className="px-1 text-xs text-gray-500">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: prev.currentPage + 1,
                        }))
                      }
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TodayAttendance;
