

// import axios from "axios";
// import { useEffect, useState } from "react";
// import { CSVLink } from "react-csv";
// import { FaEdit, FaEye, FaFileCsv, FaMapMarkerAlt, FaTrash, FaUpload } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import * as XLSX from "xlsx";
// import Pagination from "./Pagination"; // ✅ ADD THIS

// import { isEmployeeHidden } from "../utils/employeeStatus";

// const EmployeeList = () => {
//   const [employees, setEmployees] = useState([]);
//   const [locations, setLocations] = useState([]);
//   const [search, setSearch] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [showLocationModal, setShowLocationModal] = useState(false);
//   const [selectedEmployeeForLocation, setSelectedEmployeeForLocation] = useState(null);
//   const [selectedLocationId, setSelectedLocationId] = useState("");
//   const [loading, setLoading] = useState(false);
//   const itemsPerPage = 10;
//   const navigate = useNavigate();


//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const response = await axios.get(
//           "https://api.timelyhealth.in/api/employees/get-employees"
//         );
//         // We now keep all employees so the user can see/toggle hidden ones
//         setEmployees(response.data);
//       } catch (error) {
//         console.error("❌ Error fetching employees:", error);
//       }
//     };

//     const fetchLocations = async () => {
//       try {
//         const response = await axios.get(
//           "https://api.timelyhealth.in/api/location/alllocation"
//         );
//         let locationsData = [];
//         if (response.data?.locations) {
//           locationsData = response.data.locations;
//         }
//         setLocations(locationsData);
//       } catch (error) {
//         console.error("❌ Error fetching locations:", error);
//         setLocations([]);
//       }
//     };

//     fetchEmployees();
//     fetchLocations();
//   }, []);

//   const filteredEmployees = employees.filter((emp) => {
//     const searchTerm = search.toLowerCase().trim();
//     return (
//       emp.name?.toLowerCase().includes(searchTerm) ||
//       emp.email?.toLowerCase().includes(searchTerm) ||
//       emp.phone?.toLowerCase().includes(searchTerm) ||
//       emp.employeeId?.toLowerCase().includes(searchTerm) ||
//       emp.department?.toLowerCase().includes(searchTerm) ||
//       emp.role?.toLowerCase().includes(searchTerm)
//     );
//   })
//     .sort((a, b) => isEmployeeHidden(a) - isEmployeeHidden(b));

//   const indexOfLast = currentPage * itemsPerPage;
//   const indexOfFirst = indexOfLast - itemsPerPage;
//   const currentEmployees = filteredEmployees.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

//   const handleView = (employee) => setSelectedEmployee(employee);
//   const handleCloseModal = () => setSelectedEmployee(null);
//   const handleEdit = (employee) => navigate(`/addemployee`, { state: { employee } });

//   const handleToggleStatus = async (emp) => {
//     const isCurrentlyHidden = isEmployeeHidden(emp);
//     const newStatus = isCurrentlyHidden ? 'active' : 'inactive';
//     const confirmMsg = isCurrentlyHidden
//       ? `Are you sure you want to make ${emp.name} ACTIVE?`
//       : `Are you sure you want to HIDE ${emp.name}? They will not appear in reports.`;

//     if (window.confirm(confirmMsg)) {
//       try {
//         setLoading(true);

//         const payload = {
//           status: newStatus
//         };

//         await axios.put(`https://api.timelyhealth.in/api/employees/update/${emp._id}`, payload);

//         // Update local state
//         setEmployees(employees.map(e => e._id === emp._id ? { ...e, status: newStatus } : e));
//         alert(`✅ Employee status updated to ${newStatus}`);
//       } catch (error) {
//         console.error("❌ Error updating employee status:", error);
//         alert(`Failed to update status: ${error.response?.data?.message || error.message}`);
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   const handleDelete = async (id) => {
//     console.log("Attempting to delete employee with ID:", id); // 🔍 Debug log
//     if (window.confirm("Are you sure you want to delete this employee?")) {
//       try {
//         await axios.delete(
//           `https://api.timelyhealth.in/api/employees/delete-employee/${id}`
//         );
//         setEmployees(employees.filter((emp) => emp._id !== id));
//         alert("✅ Employee deleted successfully!");
//       } catch (error) {
//         console.error("❌ Error deleting employee:", error);
//         // Show specific error from backend if available
//         const errMsg = error.response?.data?.message || error.message || "Unknown error";
//         alert(`Failed to delete employee. Error: ${errMsg}`);
//       }
//     }
//   };

//   const handleAssignLocation = (employee) => {
//     setSelectedEmployeeForLocation(employee);
//     setSelectedLocationId(employee.location || "");
//     setShowLocationModal(true);
//   };

//   const handleCloseLocationModal = () => {
//     setShowLocationModal(false);
//     setSelectedEmployeeForLocation(null);
//     setSelectedLocationId("");
//     setLoading(false);
//   };

//   const assignLocation = async () => {
//     if (!selectedLocationId) {
//       alert("Please select a location");
//       return;
//     }

//     const selectedLoc = locations.find(loc => loc._id === selectedLocationId);
//     if (!selectedLoc) {
//       alert("Selected location not found");
//       return;
//     }

//     setLoading(true);
//     try {
//       // Backend assign-location endpoint expects coordinates (as seen in AssignLocation.js)
//       const response = await axios.put(
//         `https://api.timelyhealth.in/api/employees/assign-location/${selectedEmployeeForLocation.employeeId}`,
//         {
//           name: selectedLoc.name,
//           latitude: selectedLoc.latitude,
//           longitude: selectedLoc.longitude
//         }
//       );

//       // Update local state. Store the location ID to keep getLocationName working.
//       setEmployees(
//         employees.map((emp) =>
//           emp._id === selectedEmployeeForLocation._id
//             ? { ...emp, location: selectedLocationId }
//             : emp
//         )
//       );

//       alert("✅ Location assigned successfully!");
//       handleCloseLocationModal();
//     } catch (error) {
//       console.error("❌ Error assigning location:", error);
//       alert(`Failed to assign location: ${error.response?.data?.message || error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBulkImport = (event) => {
//     const file = event.target.files[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const data = new Uint8Array(e.target.result);
//       const workbook = XLSX.read(data, { type: "array" });
//       const sheet = workbook.Sheets[workbook.SheetNames[0]];
//       const parsedData = XLSX.utils.sheet_to_json(sheet);
//       console.log("Imported Employees:", parsedData);
//       alert("Employee data imported successfully (log only).");
//     };
//     reader.readAsArrayBuffer(file);
//   };

//   const getLocationName = (locationId) => {
//     if (!locationId || !Array.isArray(locations)) {
//       return "Not assigned";
//     }
//     const location = locations.find((loc) => loc._id === locationId);
//     return location ? location.name : "Not assigned";
//   };

//   return (
//     <div className="p-3 mx-auto bg-white rounded-lg shadow-md max-w-9xl">
//       {/* Search + Export */}
//       {/* <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
//   <h2 className="text-xl font-semibold">Employee List</h2>
// </div> */}

//       {/* Header Section: Search & Actions */}
//       <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">

//         {/* Search Bar */}
//         <div className="relative w-full md:w-72">
//           <input
//             type="text"
//             className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             placeholder="Search employees..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//           <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//             <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex flex-wrap items-center gap-3">

//           {/* CSV Export */}
//           <CSVLink
//             data={filteredEmployees}
//             filename="employees.csv"
//             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-800 focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
//           >
//             <FaFileCsv className="text-lg" />
//             <span>Export CSV</span>
//           </CSVLink>

//           {/* Import Button */}
//           <label
//             htmlFor="file-upload"
//             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 transition-colors bg-purple-600 rounded-lg shadow-sm cursor-pointer hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
//           >
//             <FaUpload className="text-lg" />
//             <span>Import</span>
//             <input
//               id="file-upload"
//               type="file"
//               accept=".xlsx, .xls"
//               onChange={handleBulkImport}
//               className="hidden"
//             />
//           </label>

//           {/* Add Employee Button */}
//           <button
//             onClick={() => navigate("/addemployee")}
//             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
//           >
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
//             </svg>
//             <span>Add Employee</span>
//           </button>
//         </div>
//       </div>




//       {/* Table */}
//       <div className="overflow-x-auto border rounded-lg">
//         <table className="w-full text-sm min-w-[600px]">
//           <thead className="bg-gray-200">
//             <tr>
//               <th className="p-2 border">Emp ID</th>
//               <th className="p-2 border">Name</th>
//               {/* <th className="p-2 border">Email</th> */}
//               <th className="p-2 border">Phone</th>
//               <th className="p-2 border">Department</th>
//               <th className="p-2 border">Role</th>
//               <th className="p-2 border">Join Date</th>
//               <th className="p-2 border">Salary</th>
//               <th className="p-2 border">Shift</th>
//               <th className="p-2 border">Week Off</th>
//               <th className="p-2 border">Location</th>
//               <th className="p-2 border">Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {currentEmployees.length > 0 ? (
//               currentEmployees.map((emp) => (
//                 <tr key={emp._id} className="border-b hover:bg-white">
//                   <td className="p-2 border">{emp.employeeId}</td>
//                   <td className="p-2 border">{emp.name}</td>
//                   {/* <td className="p-2 border">{emp.email}</td> */}
//                   <td className="p-2 border">{emp.phone}</td>
//                   <td className="p-2 border">{emp.department}</td>
//                   <td className="p-2 border">{emp.role}</td>
//                   <td className="p-2 border">
//                     {emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : "-"}
//                   </td>

//                   <td className="p-2 border">₹{emp.salaryPerMonth}</td>
//                   <td className="p-2 border">{emp.shiftHours}</td>
//                   <td className="p-2 border">{emp.weekOffPerMonth}</td>
//                   <td className="p-2 border">{getLocationName(emp.location)}</td>

//                   <td className="p-2 text-center border">
//                     <div className="flex justify-center gap-2">
//                       <button className="text-blue-600" onClick={() => handleView(emp)} title="View Detail">
//                         <FaEye />
//                       </button>
//                       <button className="text-yellow-500" onClick={() => handleEdit(emp)} title="Edit Employee">
//                         <FaEdit />
//                       </button>
//                       <button className="text-blue-600" onClick={() => handleAssignLocation(emp)} title="Assign Location">
//                         <FaMapMarkerAlt />
//                       </button>

//                       {/* Status Toggle Button */}
//                       <button
//                         onClick={() => handleToggleStatus(emp)}
//                         className={`px-2 py-0.5 text-xs font-bold rounded ${isEmployeeHidden(emp) ? 'bg-blue-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
//                         title={isEmployeeHidden(emp) ? "Make Active" : "Hide Employee"}
//                       >
//                         {isEmployeeHidden(emp) ? 'INACTIVE' : 'ACTIVE'}
//                       </button>

//                       <button className="text-red-500" onClick={() => handleDelete(emp._id)} title="Delete Employee">
//                         <FaTrash />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="12" className="p-4 text-center text-gray-500">
//                   No employees found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination Added Here */}
//       <Pagination
//         currentPage={currentPage}
//         totalPages={totalPages}
//         onPageChange={(page) => setCurrentPage(page)}
//       />

//       {/* Modals remain unchanged */}
//       {/* VIEW MODAL */}
//       {selectedEmployee && (
//         <div className="fixed inset-0 flex items-center justify-center p-3 bg-white ">
//           <div className="relative w-full max-w-md p-5 bg-white rounded-lg">
//             <button className="absolute top-2 right-3" onClick={handleCloseModal}>X</button>
//             <h3 className="mb-3 text-lg font-bold">Employee Details</h3>
//             <p><b>Name:</b> {selectedEmployee.name}</p>
//             <p><b>Email:</b> {selectedEmployee.email}</p>
//             <p><b>Phone:</b> {selectedEmployee.phone}</p>
//             <p><b>Department:</b> {selectedEmployee.department}</p>
//             <p><b>Role:</b> {selectedEmployee.role}</p>
//           </div>
//         </div>
//       )}

//       {/* ASSIGN LOCATION MODAL */}
//       {showLocationModal && (
//         <div className="fixed inset-0 flex items-center justify-center p-3 bg-white ">
//           <div className="relative w-full max-w-md p-5 bg-white rounded-lg">
//             <button className="absolute top-2 right-3" onClick={handleCloseLocationModal}>
//               X
//             </button>
//             <h3 className="mb-4 text-lg font-bold">Assign Location</h3>

//             <select
//               value={selectedLocationId}
//               onChange={(e) => setSelectedLocationId(e.target.value)}
//               className="w-full p-2 border rounded"
//             >
//               <option value="">Select Location</option>
//               {locations.map((loc) => (
//                 <option key={loc._id} value={loc._id}>
//                   {loc.name}
//                 </option>
//               ))}
//             </select>

//             <button
//               onClick={assignLocation}
//               className="w-full py-2 mt-4 text-gray-900 bg-blue-600 rounded"
//             >
//               Assign
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmployeeList;

// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FaEdit, FaEye, FaFileExcel, FaMapMarkerAlt, FaTrash, FaUpload } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import * as XLSX from "xlsx";
// import Pagination from "./Pagination";

// import { isEmployeeHidden } from "../utils/employeeStatus";

// const EmployeeList = () => {
//   const [employees, setEmployees] = useState([]);
//   const [locations, setLocations] = useState([]);
//   const [search, setSearch] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [showLocationModal, setShowLocationModal] = useState(false);
//   const [selectedEmployeeForLocation, setSelectedEmployeeForLocation] = useState(null);
//   const [selectedLocationId, setSelectedLocationId] = useState("");
//   const [loading, setLoading] = useState(false);
//   const itemsPerPage = 10;
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const response = await axios.get(
//           "https://api.timelyhealth.in/api/employees/get-employees"
//         );
//         setEmployees(response.data);
//       } catch (error) {
//         console.error("❌ Error fetching employees:", error);
//       }
//     };

//     const fetchLocations = async () => {
//       try {
//         const response = await axios.get(
//           "https://api.timelyhealth.in/api/location/alllocation"
//         );
//         let locationsData = [];
//         if (response.data?.locations) {
//           locationsData = response.data.locations;
//         }
//         setLocations(locationsData);
//       } catch (error) {
//         console.error("❌ Error fetching locations:", error);
//         setLocations([]);
//       }
//     };

//     fetchEmployees();
//     fetchLocations();
//   }, []);

//   const filteredEmployees = employees.filter((emp) => {
//     const searchTerm = search.toLowerCase().trim();
//     return (
//       emp.name?.toLowerCase().includes(searchTerm) ||
//       emp.email?.toLowerCase().includes(searchTerm) ||
//       emp.phone?.toLowerCase().includes(searchTerm) ||
//       emp.employeeId?.toLowerCase().includes(searchTerm) ||
//       emp.department?.toLowerCase().includes(searchTerm) ||
//       emp.role?.toLowerCase().includes(searchTerm)
//     );
//   })
//     .sort((a, b) => isEmployeeHidden(a) - isEmployeeHidden(b));

//   const indexOfLast = currentPage * itemsPerPage;
//   const indexOfFirst = indexOfLast - itemsPerPage;
//   const currentEmployees = filteredEmployees.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

//   const handleView = (employee) => setSelectedEmployee(employee);
//   const handleCloseModal = () => setSelectedEmployee(null);
//   const handleEdit = (employee) => navigate(`/addemployee`, { state: { employee } });

//   const handleToggleStatus = async (emp) => {
//     const isCurrentlyHidden = isEmployeeHidden(emp);
//     const newStatus = isCurrentlyHidden ? 'active' : 'inactive';
//     const confirmMsg = isCurrentlyHidden
//       ? `Are you sure you want to make ${emp.name} ACTIVE?`
//       : `Are you sure you want to HIDE ${emp.name}? They will not appear in reports.`;

//     if (window.confirm(confirmMsg)) {
//       try {
//         setLoading(true);

//         const payload = {
//           status: newStatus
//         };

//         await axios.put(`https://api.timelyhealth.in/api/employees/update/${emp._id}`, payload);

//         setEmployees(employees.map(e => e._id === emp._id ? { ...e, status: newStatus } : e));
//         alert(`✅ Employee status updated to ${newStatus}`);
//       } catch (error) {
//         console.error("❌ Error updating employee status:", error);
//         alert(`Failed to update status: ${error.response?.data?.message || error.message}`);
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   const handleDelete = async (id) => {
//     console.log("Attempting to delete employee with ID:", id);
//     if (window.confirm("Are you sure you want to delete this employee?")) {
//       try {
//         await axios.delete(
//           `https://api.timelyhealth.in/api/employees/delete-employee/${id}`
//         );
//         setEmployees(employees.filter((emp) => emp._id !== id));
//         alert("✅ Employee deleted successfully!");
//       } catch (error) {
//         console.error("❌ Error deleting employee:", error);
//         const errMsg = error.response?.data?.message || error.message || "Unknown error";
//         alert(`Failed to delete employee. Error: ${errMsg}`);
//       }
//     }
//   };

//   const handleAssignLocation = (employee) => {
//     setSelectedEmployeeForLocation(employee);
//     setSelectedLocationId(employee.location || "");
//     setShowLocationModal(true);
//   };

//   const handleCloseLocationModal = () => {
//     setShowLocationModal(false);
//     setSelectedEmployeeForLocation(null);
//     setSelectedLocationId("");
//     setLoading(false);
//   };

//   const assignLocation = async () => {
//     if (!selectedLocationId) {
//       alert("Please select a location");
//       return;
//     }

//     const selectedLoc = locations.find(loc => loc._id === selectedLocationId);
//     if (!selectedLoc) {
//       alert("Selected location not found");
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.put(
//         `https://api.timelyhealth.in/api/employees/assign-location/${selectedEmployeeForLocation.employeeId}`,
//         {
//           name: selectedLoc.name,
//           latitude: selectedLoc.latitude,
//           longitude: selectedLoc.longitude
//         }
//       );

//       setEmployees(
//         employees.map((emp) =>
//           emp._id === selectedEmployeeForLocation._id
//             ? { ...emp, location: selectedLocationId }
//             : emp
//         )
//       );

//       alert("✅ Location assigned successfully!");
//       handleCloseLocationModal();
//     } catch (error) {
//       console.error("❌ Error assigning location:", error);
//       alert(`Failed to assign location: ${error.response?.data?.message || error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Excel Export Function with ALL fields
//   const exportToExcel = () => {
//     try {
//       // Prepare data for Excel with ALL fields
//       const excelData = filteredEmployees.map(emp => ({
//         'Emp ID': emp.employeeId || '',
//         'Name': emp.name || '',
//         'Email': emp.email || '',
//         'Password': emp.password || '', // Password field
//         'Department': emp.department || '',
//         'Role': emp.role || '',
//         'Join Date': emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : '',
//         'Phone': emp.phone || '',
//         'Address': emp.address || '',
//         'Location': getLocationName(emp.location),
//         'Salary Per Day': emp.salaryPerDay || '',
//         'Shift Hours': emp.shiftHours || '',
//         'Salary Per Month': `₹${emp.salaryPerMonth || ''}`,
//         'Week Off Per Month': emp.weekOffPerMonth || '',
//         'Shift Type': emp.shiftType || '',
//         'Status': isEmployeeHidden(emp) ? 'INACTIVE' : 'ACTIVE',
//         'Created At': emp.createdAt ? new Date(emp.createdAt).toLocaleString() : '',
//         'Updated At': emp.updatedAt ? new Date(emp.updatedAt).toLocaleString() : ''
//       }));

//       // Create worksheet
//       const ws = XLSX.utils.json_to_sheet(excelData);
      
//       // Set column widths
//       const wscols = [
//         {wch: 10}, // Emp ID
//         {wch: 20}, // Name
//         {wch: 25}, // Email
//         {wch: 15}, // Password
//         {wch: 20}, // Department
//         {wch: 20}, // Role
//         {wch: 15}, // Join Date
//         {wch: 15}, // Phone
//         {wch: 30}, // Address
//         {wch: 20}, // Location
//         {wch: 15}, // Salary Per Day
//         {wch: 12}, // Shift Hours
//         {wch: 18}, // Salary Per Month
//         {wch: 18}, // Week Off Per Month
//         {wch: 15}, // Shift Type
//         {wch: 10}, // Status
//         {wch: 20}, // Created At
//         {wch: 20}  // Updated At
//       ];
//       ws['!cols'] = wscols;
      
//       // Create workbook
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, "Employees");
      
//       // Generate Excel file with timestamp
//       const date = new Date();
//       const timestamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}-${String(date.getMinutes()).padStart(2, '0')}`;
//       XLSX.writeFile(wb, `employees_${timestamp}.xlsx`);
      
//       alert("✅ Excel file downloaded successfully with all data!");
//     } catch (error) {
//       console.error("❌ Error exporting to Excel:", error);
//       alert("Failed to export to Excel. Please try again.");
//     }
//   };

//   // Bulk Import
//   const handleBulkImport = (event) => {
//     const file = event.target.files[0];
//     if (!file) return;
    
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const data = new Uint8Array(e.target.result);
//       const workbook = XLSX.read(data, { type: "array" });
//       const sheet = workbook.Sheets[workbook.SheetNames[0]];
//       const parsedData = XLSX.utils.sheet_to_json(sheet);
//       console.log("Imported Employees:", parsedData);
//       alert("Employee data imported successfully (log only).");
//     };
//     reader.readAsArrayBuffer(file);
//   };

//   const getLocationName = (locationId) => {
//     if (!locationId || !Array.isArray(locations)) {
//       return "Not assigned";
//     }
//     const location = locations.find((loc) => loc._id === locationId);
//     return location ? location.name : "Not assigned";
//   };

//   return (
//     <div className="p-3 mx-auto bg-white rounded-lg shadow-md max-w-9xl">
//       {/* Header Section: Search & Actions */}
//       <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">

//         {/* Search Bar */}
//         <div className="relative w-full md:w-72">
//           <input
//             type="text"
//             className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             placeholder="Search employees..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//           <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//             <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex flex-wrap items-center gap-3">

//           {/* Excel Export Button */}
//           <button
//             onClick={exportToExcel}
//             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-800 focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
//           >
//             <FaFileExcel className="text-lg" />
//             <span>Export Excel</span>
//           </button>

//           {/* Import Button */}
//           <label
//             htmlFor="file-upload"
//             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 transition-colors bg-purple-600 rounded-lg shadow-sm cursor-pointer hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
//           >
//             <FaUpload className="text-lg" />
//             <span>Import</span>
//             <input
//               id="file-upload"
//               type="file"
//               accept=".xlsx, .xls"
//               onChange={handleBulkImport}
//               className="hidden"
//             />
//           </label>

//           {/* Add Employee Button */}
//           <button
//             onClick={() => navigate("/addemployee")}
//             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
//           >
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
//             </svg>
//             <span>Add Employee</span>
//           </button>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto border rounded-lg">
//         <table className="w-full text-sm min-w-[600px]">
//           <thead className="bg-gray-200">
//             <tr>
//               <th className="p-2 border">Emp ID</th>
//               <th className="p-2 border">Name</th>
//               <th className="p-2 border">Phone</th>
//               <th className="p-2 border">Department</th>
//               <th className="p-2 border">Role</th>
//               <th className="p-2 border">Join Date</th>
//               <th className="p-2 border">Salary</th>
//               <th className="p-2 border">Shift</th>
//               <th className="p-2 border">Week Off</th>
//               <th className="p-2 border">Location</th>
//               <th className="p-2 border">Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {currentEmployees.length > 0 ? (
//               currentEmployees.map((emp) => (
//                 <tr key={emp._id} className="border-b hover:bg-white">
//                   <td className="p-2 border">{emp.employeeId}</td>
//                   <td className="p-2 border">{emp.name}</td>
//                   <td className="p-2 border">{emp.phone}</td>
//                   <td className="p-2 border">{emp.department}</td>
//                   <td className="p-2 border">{emp.role}</td>
//                   <td className="p-2 border">
//                     {emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : "-"}
//                   </td>

//                   <td className="p-2 border">₹{emp.salaryPerMonth}</td>
//                   <td className="p-2 border">{emp.shiftHours}</td>
//                   <td className="p-2 border">{emp.weekOffPerMonth}</td>
//                   <td className="p-2 border">{getLocationName(emp.location)}</td>

//                   <td className="p-2 text-center border">
//                     <div className="flex justify-center gap-2">
//                       <button className="text-blue-600" onClick={() => handleView(emp)} title="View Detail">
//                         <FaEye />
//                       </button>
//                       <button className="text-yellow-500" onClick={() => handleEdit(emp)} title="Edit Employee">
//                         <FaEdit />
//                       </button>
//                       <button className="text-blue-600" onClick={() => handleAssignLocation(emp)} title="Assign Location">
//                         <FaMapMarkerAlt />
//                       </button>

//                       {/* Status Toggle Button */}
//                       <button
//                         onClick={() => handleToggleStatus(emp)}
//                         className={`px-2 py-0.5 text-xs font-bold rounded ${isEmployeeHidden(emp) ? 'bg-blue-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
//                         title={isEmployeeHidden(emp) ? "Make Active" : "Hide Employee"}
//                       >
//                         {isEmployeeHidden(emp) ? 'INACTIVE' : 'ACTIVE'}
//                       </button>

//                       <button className="text-red-500" onClick={() => handleDelete(emp._id)} title="Delete Employee">
//                         <FaTrash />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="11" className="p-4 text-center text-gray-500">
//                   No employees found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination Added Here */}
//       <Pagination
//         currentPage={currentPage}
//         totalPages={totalPages}
//         onPageChange={(page) => setCurrentPage(page)}
//       />

//       {/* VIEW MODAL */}
//       {selectedEmployee && (
//         <div className="fixed inset-0 flex items-center justify-center p-3 bg-white ">
//           <div className="relative w-full max-w-md p-5 bg-white rounded-lg">
//             <button className="absolute top-2 right-3" onClick={handleCloseModal}>X</button>
//             <h3 className="mb-3 text-lg font-bold">Employee Details</h3>
//             <p><b>Name:</b> {selectedEmployee.name}</p>
//             <p><b>Email:</b> {selectedEmployee.email}</p>
//             <p><b>Phone:</b> {selectedEmployee.phone}</p>
//             <p><b>Department:</b> {selectedEmployee.department}</p>
//             <p><b>Role:</b> {selectedEmployee.role}</p>
//             <p><b>Address:</b> {selectedEmployee.address || 'N/A'}</p>
//             <p><b>Salary Per Day:</b> {selectedEmployee.salaryPerDay || 'N/A'}</p>
//             <p><b>Shift Type:</b> {selectedEmployee.shiftType || 'N/A'}</p>
//           </div>
//         </div>
//       )}

//       {/* ASSIGN LOCATION MODAL */}
//       {showLocationModal && (
//         <div className="fixed inset-0 flex items-center justify-center p-3 bg-white ">
//           <div className="relative w-full max-w-md p-5 bg-white rounded-lg">
//             <button className="absolute top-2 right-3" onClick={handleCloseLocationModal}>
//               X
//             </button>
//             <h3 className="mb-4 text-lg font-bold">Assign Location</h3>

//             <select
//               value={selectedLocationId}
//               onChange={(e) => setSelectedLocationId(e.target.value)}
//               className="w-full p-2 border rounded"
//             >
//               <option value="">Select Location</option>
//               {locations.map((loc) => (
//                 <option key={loc._id} value={loc._id}>
//                   {loc.name}
//                 </option>
//               ))}
//             </select>

//             <button
//               onClick={assignLocation}
//               className="w-full py-2 mt-4 text-gray-900 bg-blue-600 rounded"
//             >
//               Assign
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmployeeList;


// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FaEdit, FaEye, FaFileExcel, FaMapMarkerAlt, FaTrash } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import * as XLSX from "xlsx";

// const EmployeeList = () => {
//   const [employees, setEmployees] = useState([]);
//   const [locations, setLocations] = useState([]);
//   const [search, setSearch] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [showLocationModal, setShowLocationModal] = useState(false);
//   const [selectedEmployeeForLocation, setSelectedEmployeeForLocation] = useState(null);
//   const [selectedLocationId, setSelectedLocationId] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showInactiveOnly, setShowInactiveOnly] = useState(false);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const navigate = useNavigate();

//   const API_BASE_URL = "https://api.timelyhealth.in/api";

//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const response = await axios.get(
//           `${API_BASE_URL}/employees/get-employees`
//         );
//         setEmployees(response.data);
//       } catch (error) {
//         console.error("Error fetching employees:", error);
//       }
//     };

//     const fetchLocations = async () => {
//       try {
//         const response = await axios.get(
//           `${API_BASE_URL}/location/alllocation`
//         );
//         let locationsData = [];
//         if (response.data?.locations) {
//           locationsData = response.data.locations;
//         } else if (Array.isArray(response.data)) {
//           locationsData = response.data;
//         }
//         setLocations(locationsData);
//       } catch (error) {
//         console.error("Error fetching locations:", error);
//         setLocations([]);
//       }
//     };

//     fetchEmployees();
//     fetchLocations();
//   }, []);

//   // ✅ SIMPLE FIX: Check if employee is active based on isActive field or status
//   const isEmployeeHidden = (emp) => {
//     // Check multiple possible fields
//     if (emp.isActive === false) return true;
//     if (emp.status === 'inactive') return true;
//     if (emp.status === false) return true;
//     return false;
//   };

//   const activeEmployees = employees.filter(emp => !isEmployeeHidden(emp));
//   const inactiveEmployees = employees.filter(emp => isEmployeeHidden(emp));

//   const filteredEmployees = employees.filter((emp) => {
//     if (showInactiveOnly && !isEmployeeHidden(emp)) return false;
//     if (!showInactiveOnly && isEmployeeHidden(emp)) return false;
    
//     const searchTerm = search.toLowerCase().trim();
//     return (
//       emp.name?.toLowerCase().includes(searchTerm) ||
//       emp.email?.toLowerCase().includes(searchTerm) ||
//       emp.phone?.toLowerCase().includes(searchTerm) ||
//       emp.employeeId?.toLowerCase().includes(searchTerm) ||
//       emp.department?.toLowerCase().includes(searchTerm) ||
//       emp.role?.toLowerCase().includes(searchTerm)
//     );
//   }).sort((a, b) => {
//     const aHidden = isEmployeeHidden(a);
//     const bHidden = isEmployeeHidden(b);
//     if (aHidden === bHidden) {
//       return a.name?.localeCompare(b.name);
//     }
//     return aHidden ? 1 : -1;
//   });

//   const indexOfLast = currentPage * itemsPerPage;
//   const indexOfFirst = indexOfLast - itemsPerPage;
//   const currentEmployees = filteredEmployees.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

//   const handleView = (employee) => setSelectedEmployee(employee);
//   const handleCloseModal = () => setSelectedEmployee(null);
//   const handleEdit = (employee) => navigate(`/addemployee`, { state: { employee } });

//   // ✅ FIXED: Status toggle - SIMPLE VERSION
//   const handleToggleStatus = async (emp) => {
//     const isCurrentlyHidden = isEmployeeHidden(emp);
//     const newStatus = isCurrentlyHidden ? 'active' : 'inactive';
//     const confirmMsg = isCurrentlyHidden
//       ? `Are you sure you want to make ${emp.name} ACTIVE?`
//       : `Are you sure you want to HIDE ${emp.name}? They will not appear in reports.`;

//     if (!window.confirm(confirmMsg)) return;

//     setLoading(true);
    
//     try {
//       // Try with minimal data
//       const updateData = {
//         status: newStatus
//       };

//       console.log("Updating status for:", emp._id, "Data:", updateData);

//       const response = await axios.put(
//         `${API_BASE_URL}/employees/update/${emp._id}`,
//         updateData
//       );

//       if (response.data.success) {
//         // Update local state
//         setEmployees(employees.map(e => 
//           e._id === emp._id 
//             ? { ...e, status: newStatus } 
//             : e
//         ));
//         alert(`✅ Employee status updated to ${newStatus}`);
//       } else {
//         throw new Error(response.data.message || "Failed to update status");
//       }
//     } catch (error) {
//       console.error("Error updating employee status:", error);
      
//       // If backend doesn't accept 'status' field, try 'isActive'
//       try {
//         const updateData2 = {
//           isActive: newStatus === 'active'
//         };
        
//         const retryResponse = await axios.put(
//           `${API_BASE_URL}/employees/update/${emp._id}`,
//           updateData2
//         );
        
//         if (retryResponse.data.success) {
//           setEmployees(employees.map(e => 
//             e._id === emp._id 
//               ? { ...e, isActive: newStatus === 'active' } 
//               : e
//           ));
//           alert(`✅ Employee status updated to ${newStatus}`);
//         }
//       } catch (retryError) {
//         console.error("Retry error:", retryError);
//         alert(`Failed to update status: ${retryError.response?.data?.message || retryError.message}`);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this employee?")) {
//       try {
//         await axios.delete(
//           `${API_BASE_URL}/employees/delete-employee/${id}`
//         );
//         setEmployees(employees.filter((emp) => emp._id !== id));
//         alert("✅ Employee deleted successfully!");
//       } catch (error) {
//         console.error("Error deleting employee:", error);
//         alert(`Failed to delete employee: ${error.response?.data?.message || error.message}`);
//       }
//     }
//   };

//   const handleAssignLocation = (employee) => {
//     setSelectedEmployeeForLocation(employee);
//     setSelectedLocationId(employee.location || "");
//     setShowLocationModal(true);
//   };

//   const handleCloseLocationModal = () => {
//     setShowLocationModal(false);
//     setSelectedEmployeeForLocation(null);
//     setSelectedLocationId("");
//     setLoading(false);
//   };

//   // const [itemsPerPage, setItemsPerPage] = useState(10);

// const handleItemsPerPageChange = (e) => {
//   setItemsPerPage(Number(e.target.value));
//   setCurrentPage(1);
// };

// const handlePrevPage = () => {
//   if (currentPage > 1) setCurrentPage(currentPage - 1);
// };

// const handleNextPage = () => {
//   if (currentPage < totalPages) setCurrentPage(currentPage + 1);
// };

// const handlePageClick = (page) => {
//   setCurrentPage(page);
// };

//   // ✅ FIXED: Assign location - Use correct endpoint
//   const assignLocation = async () => {
//     if (!selectedLocationId) {
//       alert("Please select a location");
//       return;
//     }

//     setLoading(true);
//     try {
//       console.log("Assigning location for employee:", selectedEmployeeForLocation.employeeId);
      
//       // Method 1: Use the dedicated assign-location endpoint
//       const response = await axios.put(
//         `${API_BASE_URL}/employees/assign-location/${selectedEmployeeForLocation.employeeId}`,
//         { locationId: selectedLocationId }
//       );

//       if (response.data.success) {
//         // Update local state
//         setEmployees(employees.map((emp) =>
//           emp._id === selectedEmployeeForLocation._id
//             ? { ...emp, location: selectedLocationId }
//             : emp
//         ));

//         alert("✅ Location assigned successfully!");
//         handleCloseLocationModal();
//       }
//     } catch (error) {
//       console.error("Error assigning location:", error);
      
//       // Method 2: Fallback to general update
//       try {
//         const fallbackResponse = await axios.put(
//           `${API_BASE_URL}/employees/update/${selectedEmployeeForLocation._id}`,
//           { location: selectedLocationId }
//         );

//         if (fallbackResponse.data.success) {
//           setEmployees(employees.map((emp) =>
//             emp._id === selectedEmployeeForLocation._id
//               ? { ...emp, location: selectedLocationId }
//               : emp
//           ));
//           alert("✅ Location assigned successfully!");
//           handleCloseLocationModal();
//         }
//       } catch (fallbackError) {
//         console.error("Fallback error:", fallbackError);
//         alert(`Failed to assign location: ${fallbackError.response?.data?.message || fallbackError.message}`);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Excel Export Function
//   const exportToExcel = () => {
//     try {
//       const excelData = filteredEmployees.map(emp => ({
//         'Emp ID': emp.employeeId || '',
//         'Name': emp.name || '',
//         'Email': emp.email || '',
//         'Department': emp.department || '',
//         'Role': emp.role || '',
//         'Join Date': emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : '',
//         'Phone': emp.phone || '',
//         'Location': getLocationName(emp.location),
//         'Salary Per Month': `₹${emp.salaryPerMonth || ''}`,
//         'Shift Hours': emp.shiftHours || '',
//         'Week Off Per Month': emp.weekOffPerMonth || '',
//         'Status': isEmployeeHidden(emp) ? 'INACTIVE' : 'ACTIVE'
//       }));

//       const ws = XLSX.utils.json_to_sheet(excelData);
      
//       const wscols = [
//         {wch: 10}, {wch: 20}, {wch: 25}, {wch: 15}, {wch: 20},
//         {wch: 15}, {wch: 15}, {wch: 20}, {wch: 18}, {wch: 12},
//         {wch: 18}, {wch: 10}
//       ];
//       ws['!cols'] = wscols;
      
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, "Employees");
      
//       const date = new Date();
//       const timestamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
//       XLSX.writeFile(wb, `employees_${timestamp}.xlsx`);
      
//       alert("✅ Excel file downloaded successfully!");
//     } catch (error) {
//       console.error("Error exporting to Excel:", error);
//       alert("Failed to export to Excel. Please try again.");
//     }
//   };

//   const getLocationName = (locationId) => {
//     if (!locationId || !Array.isArray(locations)) {
//       return "Not assigned";
//     }
//     const location = locations.find((loc) => loc._id === locationId);
//     return location ? location.name : "Not assigned";
//   };

//   return (
//     <div className="p-3 mx-auto bg-white rounded-lg shadow-md max-w-9xl">
//       {/* Header Section */}
//       <div className="flex flex-col gap-4 mb-2 md:flex-row md:items-center md:justify-between">
//         <div className="relative w-full md:w-72">
//           <input
//             type="text"
//             className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             placeholder="Search employees..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//           <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//             <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//           </div>
//         </div>

//         <div className="flex flex-wrap items-center gap-3">
//           {/* Status Filter */}
//           <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
//             <button
//               onClick={() => {
//                 setShowInactiveOnly(false);
//                 setCurrentPage(1);
//               }}
//               className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${!showInactiveOnly ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
//             >
//               Active ({activeEmployees.length})
//             </button>
//             <button
//               onClick={() => {
//                 setShowInactiveOnly(true);
//                 setCurrentPage(1);
//               }}
//               className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${showInactiveOnly ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
//             >
//               Inactive ({inactiveEmployees.length})
//             </button>
//           </div>

//           {/* Export Buttons */}
//           <button
//             onClick={exportToExcel}
//             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-800"
//           >
//             <FaFileExcel className="text-lg" />
//             <span>Export Excel</span>
//           </button>

//           <button
//             onClick={() => navigate("/addemployee")}
//             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
//           >
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
//             </svg>
//             <span>Add Employee</span>
//           </button>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//         <table className="min-w-full">
//           <thead className="text-sm text-left text-gray-900 bg-gradient-to-r from-green-500 to-blue-600">
//             <tr>
//               <th className="py-2 text-center ">Employee ID</th>
//               <th className="py-2 text-center "> Name</th>
//               <th className="py-2 text-center ">Phone</th>
//               <th className="py-2 text-center ">Department</th>
//               <th className="py-2 text-center ">Role</th>
//               <th className="py-2 text-center ">Join Date</th>
//               <th className="py-2 text-center ">Salary</th>
//               <th className="py-2 text-center ">Shift</th>
//               <th className="py-2 text-center ">Week Off</th>
//               <th className="py-2 text-center ">Location</th>
//               <th className="py-2 text-center ">Status</th>
//               <th className="py-2 text-center ">Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {currentEmployees.length > 0 ? (
//               currentEmployees.map((emp) => {
//                 const isHidden = isEmployeeHidden(emp);
//                 return (
//                   <tr 
//                     key={emp._id} 
//                     className={`border-b hover:bg-white ${isHidden ? 'bg-red-50 hover:bg-red-100' : ''}`}
//                   >
//                     <td className="px-2 py-2 text-sm text-center text-gray-700">
//                       <div className="px-2 py-2 text-center">
//                         <span>{emp.employeeId}</span>
//                         {isHidden && (
//                           <span className="px-1.5 py-0.5 text-xs font-medium bg-red-50 text-red-700 rounded">
//                             INACTIVE
//                           </span>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-2 py-2 text-sm text-center text-gray-700">
//                       <div className="px-2 py-2 text-center">
//                         {emp.name}
//                       </div>
//                     </td>
//                     <td className="px-2 py-2 text-sm text-center text-gray-700">{emp.phone}</td>
//                     <td className="px-2 py-2 text-sm text-center text-gray-700">{emp.department}</td>
//                     <td className="px-2 py-2 text-sm text-center text-gray-700">{emp.role}</td>
//                     <td className="px-2 py-2 text-sm text-center text-gray-700">
//                       {emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : "-"}
//                     </td>
//                     <td className="px-2 py-2 text-sm text-center text-gray-700">₹{emp.salaryPerMonth || 0}</td>
//                     <td className="px-2 py-2 text-sm text-center text-gray-700">{emp.shiftHours || 8}</td>
//                     <td className="px-2 py-2 text-sm text-center text-gray-700">{emp.weekOffPerMonth || 0}</td>
//                     <td className="px-2 py-2 text-sm text-center text-gray-700">{getLocationName(emp.location)}</td>
//                     <td className="px-2 py-2 text-sm text-center text-gray-700">
//                       <span className={`px-2 py-2 text-center text-xs font-medium rounded-full ${isHidden ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
//                         {isHidden ? 'INACTIVE' : 'ACTIVE'}
//                       </span>
//                     </td>
//                     <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
//                       <div className="flex justify-center gap-2">
//                         <button 
//                           className="text-blue-600 hover:text-blue-700" 
//                           onClick={() => handleView(emp)} 
//                           title="View Detail"
//                         >
//                           <FaEye />
//                         </button>
//                         <button 
//                           className="text-yellow-500 hover:text-yellow-700" 
//                           onClick={() => handleEdit(emp)} 
//                           title="Edit Employee"
//                         >
//                           <FaEdit />
//                         </button>
                        
//                         {/* Location Button */}
//                         <button 
//                           className="text-blue-600 hover:text-green-700" 
//                           onClick={() => handleAssignLocation(emp)} 
//                           title="Assign Location"
//                         >
//                           <FaMapMarkerAlt />
//                         </button>
                        
//                         {/* Status Toggle Button */}
//                         <button
//                           onClick={() => handleToggleStatus(emp)}
//                           disabled={loading}
//                           className={`px-2 py-0.5 text-xs font-bold rounded ${isHidden ? 'bg-blue-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'} disabled:opacity-50`}
//                           title={isHidden ? "Make Active" : "Make Inactive"}
//                         >
//                           {loading ? '...' : isHidden ? 'Activate' : 'Deactivate'}
//                         </button>

//                         <button 
//                           className="text-red-500 hover:text-red-700" 
//                           onClick={() => handleDelete(emp._id)} 
//                           title="Delete Employee"
//                         >
//                           <FaTrash />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })
//             ) : (
//               <tr>
//                 <td colSpan="12" className="p-4 text-center text-gray-500">
//                   {showInactiveOnly ? 'No inactive employees found.' : 'No active employees found.'}
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//      {/* ✅ Pagination Section */}
// {filteredEmployees.length > 0 && (
//   <div className="flex flex-col items-center justify-between gap-4 mt-6 sm:flex-row">
    
//     {/* Show entries dropdown */}
//     <div className="flex flex-wrap items-center gap-4">
//       <div className="flex items-center gap-2">
//         <label className="text-sm font-medium text-gray-700">
//           Show:
//         </label>
//         <select
//           value={itemsPerPage}
//           onChange={handleItemsPerPageChange}
//           className="p-2 text-sm border rounded-lg"
//         >
//           <option value={5}>5</option>
//           <option value={10}>10</option>
//           <option value={20}>20</option>
//           <option value={50}>50</option>
//         </select>
//         <span className="text-sm text-gray-500">entries</span>
//       </div>
//     </div>

//     {/* Pagination buttons */}
//     <div className="flex items-center gap-2">
//       <button
//         onClick={handlePrevPage}
//         disabled={currentPage === 1}
//         className={`px-4 py-1 text-sm border rounded-lg ${
//           currentPage === 1
//             ? "text-gray-500 bg-gray-100 cursor-not-allowed"
//             : "text-blue-600 bg-white hover:bg-blue-50 border-blue-200"
//         }`}
//       >
//         Previous
//       </button>

//       {Array.from({ length: totalPages }, (_, i) => i + 1).map(
//         (page) => (
//           <button
//             key={page}
//             onClick={() => handlePageClick(page)}
//             className={`px-4 py-1 text-sm border rounded-lg ${
//               currentPage === page
//                 ? "text-gray-900 bg-blue-600 border-blue-600"
//                 : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
//             }`}
//           >
//             {page}
//           </button>
//         )
//       )}

//       <button
//         onClick={handleNextPage}
//         disabled={currentPage === totalPages}
//         className={`px-4 py-1 text-sm border rounded-lg ${
//           currentPage === totalPages
//             ? "text-gray-500 bg-gray-100 cursor-not-allowed"
//             : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
//         }`}
//       >
//         Next
//       </button>
//     </div>
//   </div>
// )}

//       {/* View Modal */}
//       {selectedEmployee && (
//         <div className="fixed inset-0 flex items-center justify-center p-3 bg-white ">
//           <div className="relative w-full max-w-md p-5 bg-white rounded-lg">
//             <button className="absolute top-2 right-3" onClick={handleCloseModal}>✕</button>
//             <h3 className="mb-3 text-lg font-bold">Employee Details</h3>
//             {isEmployeeHidden(selectedEmployee) && (
//               <div className="p-2 mb-3 bg-red-100 border border-red-200 rounded">
//                 <p className="text-sm font-medium text-red-800">⚠️ This employee is INACTIVE</p>
//               </div>
//             )}
//             <div className="space-y-2">
//               <p><b>Employee ID:</b> {selectedEmployee.employeeId}</p>
//               <p><b>Name:</b> {selectedEmployee.name}</p>
//               <p><b>Email:</b> {selectedEmployee.email}</p>
//               <p><b>Phone:</b> {selectedEmployee.phone}</p>
//               <p><b>Department:</b> {selectedEmployee.department}</p>
//               <p><b>Role:</b> {selectedEmployee.role}</p>
//               <p><b>Join Date:</b> {selectedEmployee.joinDate ? new Date(selectedEmployee.joinDate).toLocaleDateString() : 'N/A'}</p>
//               <p><b>Status:</b> <span className={`px-2 py-1 text-xs font-medium rounded ${isEmployeeHidden(selectedEmployee) ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
//                 {isEmployeeHidden(selectedEmployee) ? 'INACTIVE' : 'ACTIVE'}
//               </span></p>
//               <p><b>Salary Per Month:</b> ₹{selectedEmployee.salaryPerMonth || 'N/A'}</p>
//               <p><b>Shift Hours:</b> {selectedEmployee.shiftHours || 'N/A'}</p>
//               <p><b>Week Off Per Month:</b> {selectedEmployee.weekOffPerMonth || 'N/A'}</p>
//               <p><b>Location:</b> {getLocationName(selectedEmployee.location)}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Location Modal */}
//       {showLocationModal && selectedEmployeeForLocation && (
//         <div className="fixed inset-0 flex items-center justify-center p-3 bg-white ">
//           <div className="relative w-full max-w-md p-5 bg-white rounded-lg">
//             <button className="absolute top-2 right-3" onClick={handleCloseLocationModal}>
//               ✕
//             </button>
//             <h3 className="mb-4 text-lg font-bold">Assign Location</h3>
//             <p className="mb-3 text-sm text-gray-500">Assigning location for: {selectedEmployeeForLocation.name}</p>

//             <select
//               value={selectedLocationId}
//               onChange={(e) => setSelectedLocationId(e.target.value)}
//               className="w-full p-2 text-sm font-medium rounded borderp-4"
//             >
//               <option value="">Select Location</option>
//               {locations.map((loc) => (
//                 <option key={loc._id} value={loc._id}>
//                   {loc.name}
//                 </option>
//               ))}
//             </select>

//             <div className="flex gap-2 mt-4">
//               <button
//                 onClick={handleCloseLocationModal}
//                 className="flex-1 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={assignLocation}
//                 disabled={!selectedLocationId || loading}
//                 className="flex-1 py-2 text-gray-900 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
//               >
//                 {loading ? 'Assigning...' : 'Assign Location'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmployeeList;



// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FaEdit, FaEye, FaFileExcel, FaMapMarkerAlt, FaSearch, FaTrash } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import * as XLSX from "xlsx";

// const EmployeeList = () => {
//   const [employees, setEmployees] = useState([]);
//   const [locations, setLocations] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [deptSearchTerm, setDeptSearchTerm] = useState("");
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [showLocationModal, setShowLocationModal] = useState(false);
//   const [selectedEmployeeForLocation, setSelectedEmployeeForLocation] = useState(null);
//   const [selectedLocationId, setSelectedLocationId] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  
//   // Pagination
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalCount: 0,
//     limit: 10,
//   });
  
//   const navigate = useNavigate();

//   const API_BASE_URL = "https://api.timelyhealth.in/api";

//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const response = await axios.get(
//           `${API_BASE_URL}/employees/get-employees`
//         );
//         setEmployees(response.data);
//       } catch (error) {
//         console.error("Error fetching employees:", error);
//       }
//     };

//     const fetchLocations = async () => {
//       try {
//         const response = await axios.get(
//           `${API_BASE_URL}/location/alllocation`
//         );
//         let locationsData = [];
//         if (response.data?.locations) {
//           locationsData = response.data.locations;
//         } else if (Array.isArray(response.data)) {
//           locationsData = response.data;
//         }
//         setLocations(locationsData);
//       } catch (error) {
//         console.error("Error fetching locations:", error);
//         setLocations([]);
//       }
//     };

//     fetchEmployees();
//     fetchLocations();
//   }, []);

//   // ✅ SIMPLE FIX: Check if employee is active based on isActive field or status
//   const isEmployeeHidden = (emp) => {
//     // Check multiple possible fields
//     if (emp.isActive === false) return true;
//     if (emp.status === 'inactive') return true;
//     if (emp.status === false) return true;
//     return false;
//   };

//   const activeEmployees = employees.filter(emp => !isEmployeeHidden(emp));
//   const inactiveEmployees = employees.filter(emp => isEmployeeHidden(emp));

//   // Filter employees based on search and department/designation
//   const filteredEmployees = employees.filter((emp) => {
//     if (showInactiveOnly && !isEmployeeHidden(emp)) return false;
//     if (!showInactiveOnly && isEmployeeHidden(emp)) return false;
    
//     const searchTermLower = searchTerm.toLowerCase().trim();
//     const deptTerm = deptSearchTerm.toLowerCase().trim();
    
//     // Search by multiple fields
//     const matchesSearch = searchTerm === "" || (
//       emp.name?.toLowerCase().includes(searchTermLower) ||
//       emp.email?.toLowerCase().includes(searchTermLower) ||
//       emp.phone?.toLowerCase().includes(searchTermLower) ||
//       emp.employeeId?.toLowerCase().includes(searchTermLower) ||
//       emp.department?.toLowerCase().includes(searchTermLower) ||
//       emp.role?.toLowerCase().includes(searchTermLower)
//     );
    
//     // Filter by Department or Designation
//     const matchesDept = deptSearchTerm === "" || (
//       emp.department?.toLowerCase().includes(deptTerm) ||
//       emp.role?.toLowerCase().includes(deptTerm) ||
//       emp.designation?.toLowerCase().includes(deptTerm)
//     );
    
//     return matchesSearch && matchesDept;
//   }).sort((a, b) => {
//     const aHidden = isEmployeeHidden(a);
//     const bHidden = isEmployeeHidden(b);
//     if (aHidden === bHidden) {
//       return a.name?.localeCompare(b.name);
//     }
//     return aHidden ? 1 : -1;
//   });

//   // Update pagination when filtered results change
//   useEffect(() => {
//     setPagination(prev => ({
//       ...prev,
//       totalCount: filteredEmployees.length,
//       totalPages: Math.ceil(filteredEmployees.length / prev.limit),
//       currentPage: 1
//     }));
//   }, [filteredEmployees.length, pagination.limit, showInactiveOnly, searchTerm, deptSearchTerm]);

//   const indexOfLast = pagination.currentPage * pagination.limit;
//   const indexOfFirst = indexOfLast - pagination.limit;
//   const currentEmployees = filteredEmployees.slice(indexOfFirst, indexOfLast);

//   const handleView = (employee) => setSelectedEmployee(employee);
//   const handleCloseModal = () => setSelectedEmployee(null);
//   const handleEdit = (employee) => navigate(`/addemployee`, { state: { employee } });

//   // ✅ FIXED: Status toggle - SIMPLE VERSION
//   const handleToggleStatus = async (emp) => {
//     const isCurrentlyHidden = isEmployeeHidden(emp);
//     const newStatus = isCurrentlyHidden ? 'active' : 'inactive';
//     const confirmMsg = isCurrentlyHidden
//       ? `Are you sure you want to make ${emp.name} ACTIVE?`
//       : `Are you sure you want to HIDE ${emp.name}? They will not appear in reports.`;

//     if (!window.confirm(confirmMsg)) return;

//     setLoading(true);
    
//     try {
//       // Try with minimal data
//       const updateData = {
//         status: newStatus
//       };

//       console.log("Updating status for:", emp._id, "Data:", updateData);

//       const response = await axios.put(
//         `${API_BASE_URL}/employees/update/${emp._id}`,
//         updateData
//       );

//       if (response.data.success) {
//         // Update local state
//         setEmployees(employees.map(e => 
//           e._id === emp._id 
//             ? { ...e, status: newStatus } 
//             : e
//         ));
//         alert(`✅ Employee status updated to ${newStatus}`);
//       } else {
//         throw new Error(response.data.message || "Failed to update status");
//       }
//     } catch (error) {
//       console.error("Error updating employee status:", error);
      
//       // If backend doesn't accept 'status' field, try 'isActive'
//       try {
//         const updateData2 = {
//           isActive: newStatus === 'active'
//         };
        
//         const retryResponse = await axios.put(
//           `${API_BASE_URL}/employees/update/${emp._id}`,
//           updateData2
//         );
        
//         if (retryResponse.data.success) {
//           setEmployees(employees.map(e => 
//             e._id === emp._id 
//               ? { ...e, isActive: newStatus === 'active' } 
//               : e
//           ));
//           alert(`✅ Employee status updated to ${newStatus}`);
//         }
//       } catch (retryError) {
//         console.error("Retry error:", retryError);
//         alert(`Failed to update status: ${retryError.response?.data?.message || retryError.message}`);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this employee?")) {
//       try {
//         await axios.delete(
//           `${API_BASE_URL}/employees/delete-employee/${id}`
//         );
//         setEmployees(employees.filter((emp) => emp._id !== id));
//         alert("✅ Employee deleted successfully!");
//       } catch (error) {
//         console.error("Error deleting employee:", error);
//         alert(`Failed to delete employee: ${error.response?.data?.message || error.message}`);
//       }
//     }
//   };

//   const handleAssignLocation = (employee) => {
//     setSelectedEmployeeForLocation(employee);
//     setSelectedLocationId(employee.location || "");
//     setShowLocationModal(true);
//   };

//   const handleCloseLocationModal = () => {
//     setShowLocationModal(false);
//     setSelectedEmployeeForLocation(null);
//     setSelectedLocationId("");
//     setLoading(false);
//   };

//   const handleItemsPerPageChange = (limit) => {
//     setPagination({
//       currentPage: 1,
//       limit: limit,
//       totalCount: filteredEmployees.length,
//       totalPages: Math.ceil(filteredEmployees.length / limit)
//     });
//   };

//   const handlePrevPage = () => {
//     if (pagination.currentPage > 1) {
//       setPagination(prev => ({
//         ...prev,
//         currentPage: prev.currentPage - 1
//       }));
//     }
//   };

//   const handleNextPage = () => {
//     if (pagination.currentPage < pagination.totalPages) {
//       setPagination(prev => ({
//         ...prev,
//         currentPage: prev.currentPage + 1
//       }));
//     }
//   };

//   const handlePageClick = (page) => {
//     setPagination(prev => ({
//       ...prev,
//       currentPage: page
//     }));
//   };

//   const getPageNumbers = () => {
//     const pageNumbers = [];
//     for (let i = 1; i <= pagination.totalPages; i++) {
//       if (
//         i === 1 ||
//         i === pagination.totalPages ||
//         (i >= pagination.currentPage - 2 && i <= pagination.currentPage + 2)
//       ) {
//         pageNumbers.push(i);
//       } else if (i === pagination.currentPage - 3 || i === pagination.currentPage + 3) {
//         pageNumbers.push("...");
//       }
//     }
//     return pageNumbers;
//   };

//   // ✅ FIXED: Assign location - Use correct endpoint
//   const assignLocation = async () => {
//     if (!selectedLocationId) {
//       alert("Please select a location");
//       return;
//     }

//     setLoading(true);
//     try {
//       console.log("Assigning location for employee:", selectedEmployeeForLocation.employeeId);
      
//       // Method 1: Use the dedicated assign-location endpoint
//       const response = await axios.put(
//         `${API_BASE_URL}/employees/assign-location/${selectedEmployeeForLocation.employeeId}`,
//         { locationId: selectedLocationId }
//       );

//       if (response.data.success) {
//         // Update local state
//         setEmployees(employees.map((emp) =>
//           emp._id === selectedEmployeeForLocation._id
//             ? { ...emp, location: selectedLocationId }
//             : emp
//         ));

//         alert("✅ Location assigned successfully!");
//         handleCloseLocationModal();
//       }
//     } catch (error) {
//       console.error("Error assigning location:", error);
      
//       // Method 2: Fallback to general update
//       try {
//         const fallbackResponse = await axios.put(
//           `${API_BASE_URL}/employees/update/${selectedEmployeeForLocation._id}`,
//           { location: selectedLocationId }
//         );

//         if (fallbackResponse.data.success) {
//           setEmployees(employees.map((emp) =>
//             emp._id === selectedEmployeeForLocation._id
//               ? { ...emp, location: selectedLocationId }
//               : emp
//           ));
//           alert("✅ Location assigned successfully!");
//           handleCloseLocationModal();
//         }
//       } catch (fallbackError) {
//         console.error("Fallback error:", fallbackError);
//         alert(`Failed to assign location: ${fallbackError.response?.data?.message || fallbackError.message}`);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Excel Export Function
//   const exportToExcel = () => {
//     try {
//       const excelData = filteredEmployees.map(emp => ({
//         'Emp ID': emp.employeeId || '',
//         'Name': emp.name || '',
//         'Email': emp.email || '',
//         'Department': emp.department || '',
//         'Designation': emp.role || emp.designation || '',
//         'Join Date': emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : '',
//         'Phone': emp.phone || '',
//         'Location': getLocationName(emp.location),
//         'Salary Per Month': `₹${emp.salaryPerMonth || ''}`,
//         'Shift Hours': emp.shiftHours || '',
//         'Week Off Per Month': emp.weekOffPerMonth || '',
//         'Status': isEmployeeHidden(emp) ? 'INACTIVE' : 'ACTIVE'
//       }));

//       const ws = XLSX.utils.json_to_sheet(excelData);
      
//       const wscols = [
//         {wch: 10}, {wch: 20}, {wch: 25}, {wch: 15}, {wch: 20},
//         {wch: 15}, {wch: 15}, {wch: 20}, {wch: 18}, {wch: 12},
//         {wch: 18}, {wch: 10}
//       ];
//       ws['!cols'] = wscols;
      
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, "Employees");
      
//       const date = new Date();
//       const timestamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
//       XLSX.writeFile(wb, `employees_${timestamp}.xlsx`);
      
//       alert("✅ Excel file downloaded successfully!");
//     } catch (error) {
//       console.error("Error exporting to Excel:", error);
//       alert("Failed to export to Excel. Please try again.");
//     }
//   };

//   const getLocationName = (locationId) => {
//     if (!locationId || !Array.isArray(locations)) {
//       return "Not assigned";
//     }
//     const location = locations.find((loc) => loc._id === locationId);
//     return location ? location.name : "Not assigned";
//   };

//   return (
//     <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-9xl">
//         {/* Filters - Single Row */}
//         <div className="p-2 mb-3 bg-white rounded-lg shadow-md">
//           <div className="flex flex-wrap items-center gap-2">
//             {/* ID/Name Search */}
//             <div className="relative flex-1 min-w-[200px]">
//               <FaSearch className="absolute text-sm text-gray-500 transform -translate-y-1/2 left-2 top-1/2" />
//               <input
//                 type="text"
//                 placeholder="Search by ID, Name, Email, Phone..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Department/Designation Dropdown */}
//             <div className="relative min-w-[150px]">
//               <select
//                 value={deptSearchTerm}
//                 onChange={(e) => setDeptSearchTerm(e.target.value)}
//                 className="w-full px-2 py-2 text-xs bg-white border border-gray-300 rounded-lg appearance-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">All Departments & Designations</option>
//                 <option value="Laboratory Medicine">Laboratory Medicine</option>
//                 <option value="Sales">Sales</option>
//                 <option value="Marketing">Marketing</option>
//                 <option value="Medical">Medical</option>
//                 <option value="Nursing">Nursing</option>
//                 <option value="Developer">Developer</option>
//                 <option value="Designer">Designer</option>
//                 <option value="Heath Department">Heath Department</option>
//                 <option value="Management">Management</option>
//               </select>
//             </div>

//             {/* Status Filter Tabs */}
//             <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
//               <button
//                 onClick={() => {
//                   setShowInactiveOnly(false);
//                   setPagination(prev => ({ ...prev, currentPage: 1 }));
//                 }}
//                 className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
//                   !showInactiveOnly 
//                     ? 'bg-white text-blue-600 shadow-sm' 
//                     : 'text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 Active ({activeEmployees.length})
//               </button>
//               <button
//                 onClick={() => {
//                   setShowInactiveOnly(true);
//                   setPagination(prev => ({ ...prev, currentPage: 1 }));
//                 }}
//                 className={`px-2 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
//                   showInactiveOnly 
//                     ? 'bg-white text-red-600 shadow-sm' 
//                     : 'text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 Inactive ({inactiveEmployees.length})
//               </button>
//             </div>

//             {/* Export Excel Button */}
//             <button
//               onClick={exportToExcel}
//               className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-900 transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-800 whitespace-nowrap"
//             >
//               <FaFileExcel className="text-sm" />
//               <span>Export</span>
//             </button>

//             {/* Add Employee Button */}
//             <button
//               onClick={() => navigate("/addemployee")}
//               className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-900 transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 whitespace-nowrap"
//             >
//               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
//               </svg>
//               <span>Add</span>
//             </button>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
//           <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//             <table className="min-w-full">
//               <thead className="text-xs text-left text-gray-900 bg-gradient-to-r from-green-500 to-blue-600">
//                 <tr>
//                   <th className="px-2 py-2 text-center">Employee ID</th>
//                   <th className="px-2 py-2 text-center">Name</th>
//                   <th className="px-2 py-2 text-center">Phone</th>
//                   <th className="px-2 py-2 text-center">Dept</th>
//                   <th className="px-2 py-2 text-center">Desig</th>
//                   <th className="px-2 py-2 text-center">Join Date</th>
//                   <th className="px-2 py-2 text-center">Salary</th>
//                   <th className="px-2 py-2 text-center">Shift</th>
//                   <th className="px-2 py-2 text-center">Week Off</th>
//                   <th className="px-2 py-2 text-center">Location</th>
//                   <th className="px-2 py-2 text-center">Status</th>
//                   <th className="px-2 py-2 text-center">Actions</th>
//                 </tr>
//               </thead>

//               <tbody className="bg-white divide-y divide-gray-200">
//                 {currentEmployees.length > 0 ? (
//                   currentEmployees.map((emp) => {
//                     const isHidden = isEmployeeHidden(emp);
//                     return (
//                       <tr 
//                         key={emp._id} 
//                         className={`hover:bg-white transition-colors text-xs ${isHidden ? 'bg-red-50 hover:bg-red-100' : ''}`}
//                       >
//                         <td className="px-2 py-2 font-semibold text-center text-gray-900 whitespace-nowrap">
//                           {emp.employeeId}
//                         </td>
//                         <td className="px-2 py-2 font-semibold text-center text-gray-900 whitespace-nowrap">
//                           {emp.name}
//                         </td>
//                         <td className="px-2 py-2 font-medium text-center text-gray-500 whitespace-nowrap">{emp.phone}</td>
//                         <td className="px-2 py-2 font-medium text-center text-gray-500 whitespace-nowrap">{emp.department || "N/A"}</td>
//                         <td className="px-2 py-2 font-medium text-center text-gray-500 whitespace-nowrap">{emp.role || emp.designation || "N/A"}</td>
//                         <td className="px-2 py-2 font-medium text-center text-gray-500 whitespace-nowrap">
//                           {emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : "-"}
//                         </td>
//                         <td className="px-2 py-2 font-medium text-center text-gray-500 whitespace-nowrap">₹{emp.salaryPerMonth || 0}</td>
//                         <td className="px-2 py-2 font-medium text-center text-gray-500 whitespace-nowrap">{emp.shiftHours || 8}h</td>
//                         <td className="px-2 py-2 font-medium text-center text-gray-500 whitespace-nowrap">{emp.weekOffPerMonth || 0}</td>
//                         <td className="px-2 py-2 font-medium text-center text-gray-500 whitespace-nowrap">{getLocationName(emp.location)}</td>
//                         <td className="px-2 py-2 font-medium text-center whitespace-nowrap ">
//                           <span className={`px-2 py-2 text-xs font-semibold rounded-full ${
//                             isHidden 
//                               ? 'bg-red-100 text-red-700' 
//                               : 'bg-blue-100 text-green-700'
//                           }`}>
//                             {isHidden ? 'INACTIVE' : 'ACTIVE'}
//                           </span>
//                         </td>
//                         <td className="px-2 py-2 text-center whitespace-nowrap">
//                           <div className="flex items-center justify-center gap-1">
//                             <button 
//                               className="p-1 text-blue-600 transition-colors hover:text-blue-700" 
//                               onClick={() => handleView(emp)} 
//                               title="View Detail"
//                             >
//                               <FaEye size={14} />
//                             </button>
//                             <button 
//                               className="p-1 text-yellow-500 transition-colors hover:text-yellow-700" 
//                               onClick={() => handleEdit(emp)} 
//                               title="Edit Employee"
//                             >
//                               <FaEdit size={14} />
//                             </button>
                            
//                             {/* Location Button */}
//                             <button 
//                               className="p-1 text-blue-600 transition-colors hover:text-green-700" 
//                               onClick={() => handleAssignLocation(emp)} 
//                               title="Assign Location"
//                             >
//                               <FaMapMarkerAlt size={14} />
//                             </button>
                            
//                             {/* Status Toggle Button */}
//                             <button
//                               onClick={() => handleToggleStatus(emp)}
//                               disabled={loading}
//                               className={`px-2 py-2 text-xs font-semibold rounded-md transition-colors ${
//                                 isHidden 
//                                   ? 'bg-blue-100 text-green-700 hover:bg-green-200' 
//                                   : 'bg-red-100 text-red-700 hover:bg-red-200'
//                               } disabled:opacity-50`}
//                               title={isHidden ? "Make Active" : "Make Inactive"}
//                             >
//                               {loading ? '...' : isHidden ? 'Activate' : 'Deactivate'}
//                             </button>

//                             <button 
//                               className="p-1 text-red-500 transition-colors hover:text-red-700" 
//                               onClick={() => handleDelete(emp._id)} 
//                               title="Delete Employee"
//                             >
//                               <FaTrash size={14} />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 ) : (
//                   <tr>
//                     <td colSpan="12" className="px-2 py-4 text-xs text-center text-gray-500">
//                       {showInactiveOnly ? 'No inactive employees found.' : 'No active employees found.'}
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {filteredEmployees.length > 0 && (
//             <div className="bg-white px-2 py-1.5 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200">
//               {/* Left Side - Showing Info + Select */}
//               <div className="flex flex-wrap items-center gap-1 text-xs text-gray-700">
//                 <span>Showing</span>
//                 <span className="font-medium">{indexOfFirst + 1}</span>
//                 <span>to</span>
//                 <span className="font-medium">{Math.min(indexOfLast, filteredEmployees.length)}</span>
//                 <span>of</span>
//                 <span className="font-medium">{filteredEmployees.length}</span>
//                 <span>results</span>

//                 {/* Select Dropdown */}
//                 <select
//                   value={pagination.limit}
//                   onChange={(e) => {
//                     const newLimit = Number(e.target.value);
//                     handleItemsPerPageChange(newLimit);
//                   }}
//                   className="p-0.5 text-xs border rounded-lg ml-1"
//                 >
//                   <option value={5}>5</option>
//                   <option value={10}>10</option>
//                   <option value={20}>20</option>
//                   <option value={50}>50</option>
//                 </select>
//               </div>

//               {/* Pagination buttons */}
//               <div className="flex items-center gap-1">
//                 <button
//                   onClick={handlePrevPage}
//                   disabled={pagination.currentPage === 1}
//                   className={`px-2 py-2 border rounded-lg text-xs font-medium transition-colors ${
//                     pagination.currentPage === 1
//                       ? "bg-gray-100 text-gray-500 cursor-not-allowed"
//                       : "bg-white text-gray-700 border-gray-300 hover:bg-white"
//                   }`}
//                 >
//                   Previous
//                 </button>

//                 <div className="flex items-center gap-0.5">
//                   {getPageNumbers().map((page, index) => (
//                     <button
//                       key={index}
//                       onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
//                       disabled={page === "..."}
//                       className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
//                         page === "..."
//                           ? "text-gray-500 cursor-default"
//                           : pagination.currentPage === page
//                           ? "bg-blue-600 text-gray-900"
//                           : "bg-white text-gray-700 border border-gray-300 hover:bg-white"
//                       }`}
//                     >
//                       {page}
//                     </button>
//                   ))}
//                 </div>

//                 <button
//                   onClick={handleNextPage}
//                   disabled={pagination.currentPage === pagination.totalPages}
//                   className={`px-2 py-2 border rounded-lg text-xs font-medium transition-colors ${
//                     pagination.currentPage === pagination.totalPages
//                       ? "bg-gray-100 text-gray-500 cursor-not-allowed"
//                       : "bg-white text-gray-700 border-gray-300 hover:bg-white"
//                   }`}
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* View Modal */}
//         {selectedEmployee && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-white ">
//             <div className="relative w-full max-w-md p-4 bg-white rounded-lg">
//               <button className="absolute text-sm text-gray-500 top-2 right-3 hover:text-gray-700" onClick={handleCloseModal}>✕</button>
//               <h3 className="mb-2 text-base font-bold">Employee Details</h3>
//               {isEmployeeHidden(selectedEmployee) && (
//                 <div className="p-1.5 mb-2 bg-red-100 border border-red-200 rounded">
//                   <p className="text-xs font-medium text-red-800">⚠️ This employee is INACTIVE</p>
//                 </div>
//               )}
//               <div className="space-y-1 text-sm">
//                 <p><b>Employee ID:</b> {selectedEmployee.employeeId}</p>
//                 <p><b>Name:</b> {selectedEmployee.name}</p>
//                 <p><b>Email:</b> {selectedEmployee.email}</p>
//                 <p><b>Phone:</b> {selectedEmployee.phone}</p>
//                 <p><b>Department:</b> {selectedEmployee.department || "N/A"}</p>
//                 <p><b>Designation:</b> {selectedEmployee.role || selectedEmployee.designation || "N/A"}</p>
//                 <p><b>Join Date:</b> {selectedEmployee.joinDate ? new Date(selectedEmployee.joinDate).toLocaleDateString() : 'N/A'}</p>
//                 <p><b>Status:</b> <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${isEmployeeHidden(selectedEmployee) ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
//                   {isEmployeeHidden(selectedEmployee) ? 'INACTIVE' : 'ACTIVE'}
//                 </span></p>
//                 <p><b>Salary Per Month:</b> ₹{selectedEmployee.salaryPerMonth || 'N/A'}</p>
//                 <p><b>Shift Hours:</b> {selectedEmployee.shiftHours || 'N/A'}</p>
//                 <p><b>Week Off Per Month:</b> {selectedEmployee.weekOffPerMonth || 'N/A'}</p>
//                 <p><b>Location:</b> {getLocationName(selectedEmployee.location)}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Location Modal */}
//         {showLocationModal && selectedEmployeeForLocation && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-white ">
//             <div className="relative w-full max-w-md p-4 bg-white rounded-lg">
//               <button className="absolute text-sm text-gray-500 top-2 right-3 hover:text-gray-700" onClick={handleCloseLocationModal}>
//                 ✕
//               </button>
//               <h3 className="mb-3 text-base font-bold">Assign Location</h3>
//               <p className="mb-2 text-xs text-gray-500">Assigning location for: {selectedEmployeeForLocation.name}</p>

//               <select
//                 value={selectedLocationId}
//                 onChange={(e) => setSelectedLocationId(e.target.value)}
//                 className="w-full p-2 text-xs border border-gray-300 rounded-lg"
//               >
//                 <option value="">Select Location</option>
//                 {locations.map((loc) => (
//                   <option key={loc._id} value={loc._id}>
//                     {loc.name}
//                   </option>
//                 ))}
//               </select>

//               <div className="flex gap-2 mt-3">
//                 <button
//                   onClick={handleCloseLocationModal}
//                   className="flex-1 py-2 text-xs font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={assignLocation}
//                   disabled={!selectedLocationId || loading}
//                   className="flex-1 py-2 text-xs font-medium text-gray-900 transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
//                 >
//                   {loading ? 'Assigning...' : 'Assign Location'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default EmployeeList;


import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaBuilding, FaEdit, FaEye, FaFileExcel, FaMapMarkerAlt, FaSearch, FaTrash, FaUserTag, FaChartLine } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "../index.css";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedEmployeeForLocation, setSelectedEmployeeForLocation] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  
  // Filter states
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

  // ============================================
  // HIKE MODULE STATES
  // ============================================
  const [showHikeModal, setShowHikeModal] = useState(false);
  const [selectedEmployeeForHike, setSelectedEmployeeForHike] = useState(null);
  const [hikeType, setHikeType] = useState("percentage");
  const [hikeValue, setHikeValue] = useState("");
  const [hikeReason, setHikeReason] = useState("");
  const [hikeEffectiveDate, setHikeEffectiveDate] = useState("");
  const [submittingHike, setSubmittingHike] = useState(false);
  
  const navigate = useNavigate();

  const API_BASE_URL = "https://api.timelyhealth.in/api";

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/employees/get-employees`
        );
        setEmployees(response.data);
        extractUniqueValues(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/location/alllocation`
        );
        let locationsData = [];
        if (response.data?.locations) {
          locationsData = response.data.locations;
        } else if (Array.isArray(response.data)) {
          locationsData = response.data;
        }
        setLocations(locationsData);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setLocations([]);
      }
    };

    fetchEmployees();
    fetchLocations();
  }, []);

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

  // Extract unique departments and designations
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

  // Check if employee is active
  const isEmployeeHidden = (emp) => {
    if (emp.isActive === false) return true;
    if (emp.status === 'inactive') return true;
    if (emp.status === false) return true;
    return false;
  };

  const activeEmployees = employees.filter(emp => !isEmployeeHidden(emp));
  const inactiveEmployees = employees.filter(emp => isEmployeeHidden(emp));

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    if (showInactiveOnly && !isEmployeeHidden(emp)) return false;
    if (!showInactiveOnly && isEmployeeHidden(emp)) return false;
    
    const searchTermLower = searchTerm.toLowerCase().trim();
    
    const matchesSearch = searchTerm === "" || (
      emp.name?.toLowerCase().includes(searchTermLower) ||
      emp.email?.toLowerCase().includes(searchTermLower) ||
      emp.phone?.toLowerCase().includes(searchTermLower) ||
      emp.employeeId?.toLowerCase().includes(searchTermLower) ||
      emp.department?.toLowerCase().includes(searchTermLower) ||
      emp.role?.toLowerCase().includes(searchTermLower)
    );
    
    const matchesDept = filterDepartment === "" || emp.department === filterDepartment;
    const matchesDesig = filterDesignation === "" || (emp.role || emp.designation) === filterDesignation;
    
    return matchesSearch && matchesDept && matchesDesig;
  }).sort((a, b) => {
    const aHidden = isEmployeeHidden(a);
    const bHidden = isEmployeeHidden(b);
    if (aHidden === bHidden) {
      return a.name?.localeCompare(b.name);
    }
    return aHidden ? 1 : -1;
  });

  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      totalCount: filteredEmployees.length,
      totalPages: Math.ceil(filteredEmployees.length / prev.limit),
      currentPage: 1
    }));
  }, [filteredEmployees.length, pagination.limit, showInactiveOnly, searchTerm, filterDepartment, filterDesignation]);

  const indexOfLast = pagination.currentPage * pagination.limit;
  const indexOfFirst = indexOfLast - pagination.limit;
  const currentEmployees = filteredEmployees.slice(indexOfFirst, indexOfLast);

  const handleView = (employee) => setSelectedEmployee(employee);
  const handleCloseModal = () => setSelectedEmployee(null);
  const handleEdit = (employee) => navigate(`/addemployee`, { state: { employee } });

  // ============================================
  // HIKE FUNCTIONS
  // ============================================
  const handleOpenHikeModal = (employee) => {
    setSelectedEmployeeForHike(employee);
    setHikeType("percentage");
    setHikeValue("");
    setHikeReason("");
    setHikeEffectiveDate(new Date().toISOString().split('T')[0]);
    setShowHikeModal(true);
  };

  const handleCloseHikeModal = () => {
    setShowHikeModal(false);
    setSelectedEmployeeForHike(null);
    setHikeType("percentage");
    setHikeValue("");
    setHikeReason("");
    setHikeEffectiveDate("");
    setSubmittingHike(false);
  };

  const calculateNewSalary = () => {
    if (!selectedEmployeeForHike) return null;
    const currentSalary = selectedEmployeeForHike.salaryPerMonth || 0;
    const value = parseFloat(hikeValue) || 0;
    
    if (hikeType === "percentage") {
      return Math.round(currentSalary * (1 + value / 100));
    } else {
      return Math.round(currentSalary + value);
    }
  };

  const handleSubmitHike = async () => {
    if (!selectedEmployeeForHike) return;
    if (!hikeValue || parseFloat(hikeValue) <= 0) {
      alert("Please enter a valid hike value");
      return;
    }
    if (!hikeEffectiveDate) {
      alert("Please select effective date");
      return;
    }

    setSubmittingHike(true);
    try {
      const payload = {
        incrementType: hikeType,
        incrementValue: parseFloat(hikeValue),
        effectiveDate: hikeEffectiveDate,
        reason: hikeReason || "Salary hike",
        newComponents: {
          basicPay: selectedEmployeeForHike.basicPay || 0,
          hra: selectedEmployeeForHike.hra || 0,
          conveyanceAllowance: selectedEmployeeForHike.conveyanceAllowance || 0,
          medicalAllowance: selectedEmployeeForHike.medicalAllowance || 0,
          performanceAllowance: selectedEmployeeForHike.performanceAllowance || 0,
          specialAllowance: selectedEmployeeForHike.specialAllowance || 0,
          ctc: selectedEmployeeForHike.ctc || 0,
          ptax: selectedEmployeeForHike.ptax || 0,
          gmcAmount: selectedEmployeeForHike.gmcAmount || 0,
          otherDeductions: selectedEmployeeForHike.otherDeductions || 0
        }
      };

      const response = await axios.put(
        `http://localhost:5001/api/employees/applysalary-increment/${selectedEmployeeForHike._id}`,
        payload
      );

      if (response.data && response.data.success) {
        alert(`✅ Salary hike applied successfully!\nNew Salary: ₹${response.data.employee?.salaryPerMonth?.toLocaleString() || 'Updated'}`);
        
        const refreshResponse = await axios.get(
          `${API_BASE_URL}/employees/get-employees`
        );
        setEmployees(refreshResponse.data);
        extractUniqueValues(refreshResponse.data);
        
        handleCloseHikeModal();
      } else {
        alert("Failed to apply hike");
      }
    } catch (error) {
      console.error("Error applying hike:", error);
      alert(error.response?.data?.message || "Failed to apply salary hike");
    } finally {
      setSubmittingHike(false);
    }
  };

  // Status toggle
  const handleToggleStatus = async (emp) => {
    const isCurrentlyHidden = isEmployeeHidden(emp);
    const newStatus = isCurrentlyHidden ? 'active' : 'inactive';
    const action = isCurrentlyHidden ? 'ACTIVATE' : 'DEACTIVATE';

    if (!window.confirm(`Are you sure you want to ${action} ${emp.name}?`)) return;

    setLoading(true);
    
    try {
      const updateData = { status: newStatus };
      const response = await axios.put(
        `${API_BASE_URL}/employees/update/${emp._id}`,
        updateData
      );

      if (response.data.success) {
        setEmployees(employees.map(e => 
          e._id === emp._id 
            ? { ...e, status: newStatus } 
            : e
        ));
        alert(`✅ Employee ${action}D successfully`);
      } else {
        throw new Error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating employee status:", error);
      try {
        const updateData2 = { isActive: !isCurrentlyHidden };
        const retryResponse = await axios.put(
          `${API_BASE_URL}/employees/update/${emp._id}`,
          updateData2
        );
        if (retryResponse.data.success) {
          setEmployees(employees.map(e => 
            e._id === emp._id 
              ? { ...e, isActive: !isCurrentlyHidden } 
              : e
          ));
          alert(`✅ Employee ${action}D successfully`);
        }
      } catch (retryError) {
        console.error("Retry error:", retryError);
        alert(`Failed to update status: ${retryError.response?.data?.message || retryError.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axios.delete(
          `${API_BASE_URL}/employees/delete-employee/${id}`
        );
        setEmployees(employees.filter((emp) => emp._id !== id));
        alert("✅ Employee deleted successfully!");
      } catch (error) {
        console.error("Error deleting employee:", error);
        alert(`Failed to delete employee: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleAssignLocation = (employee) => {
    setSelectedEmployeeForLocation(employee);
    setSelectedLocationId(employee.location || "");
    setShowLocationModal(true);
  };

  const handleCloseLocationModal = () => {
    setShowLocationModal(false);
    setSelectedEmployeeForLocation(null);
    setSelectedLocationId("");
    setLoading(false);
  };

  const handleItemsPerPageChange = (limit) => {
    setPagination({
      currentPage: 1,
      limit: limit,
      totalCount: filteredEmployees.length,
      totalPages: Math.ceil(filteredEmployees.length / limit)
    });
  };

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      setPagination(prev => ({
        ...prev,
        currentPage: prev.currentPage - 1
      }));
    }
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        currentPage: prev.currentPage + 1
      }));
    }
  };

  const handlePageClick = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      if (
        i === 1 ||
        i === pagination.totalPages ||
        (i >= pagination.currentPage - 2 && i <= pagination.currentPage + 2)
      ) {
        pageNumbers.push(i);
      } else if (i === pagination.currentPage - 3 || i === pagination.currentPage + 3) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  const assignLocation = async () => {
    if (!selectedLocationId) {
      alert("Please select a location");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/employees/assign-location/${selectedEmployeeForLocation.employeeId}`,
        { locationId: selectedLocationId }
      );

      if (response.data.success) {
        setEmployees(employees.map((emp) =>
          emp._id === selectedEmployeeForLocation._id
            ? { ...emp, location: selectedLocationId }
            : emp
        ));
        alert("✅ Location assigned successfully!");
        handleCloseLocationModal();
      }
    } catch (error) {
      console.error("Error assigning location:", error);
      try {
        const fallbackResponse = await axios.put(
          `${API_BASE_URL}/employees/update/${selectedEmployeeForLocation._id}`,
          { location: selectedLocationId }
        );
        if (fallbackResponse.data.success) {
          setEmployees(employees.map((emp) =>
            emp._id === selectedEmployeeForLocation._id
              ? { ...emp, location: selectedLocationId }
              : emp
          ));
          alert("✅ Location assigned successfully!");
          handleCloseLocationModal();
        }
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
        alert(`Failed to assign location: ${fallbackError.response?.data?.message || fallbackError.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Excel Export Function
  const exportToExcel = () => {
    try {
      const excelData = filteredEmployees.map(emp => ({
        'Emp ID': emp.employeeId || '',
        'Name': emp.name || '',
        'Email': emp.email || '',
        'Department': emp.department || '',
        'Designation': emp.role || emp.designation || '',
        'Join Date': emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : '',
        'Phone': emp.phone || '',
        'Location': getLocationName(emp.location),
        'Salary Per Month': `₹${emp.salaryPerMonth || ''}`,
        'Shift Hours': emp.shiftHours || '',
        'Week Off Per Month': emp.weekOffPerMonth || '',
        'Status': isEmployeeHidden(emp) ? 'INACTIVE' : 'ACTIVE'
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      
      const wscols = [
        {wch: 10}, {wch: 20}, {wch: 25}, {wch: 15}, {wch: 20},
        {wch: 15}, {wch: 15}, {wch: 20}, {wch: 18}, {wch: 12},
        {wch: 18}, {wch: 10}
      ];
      ws['!cols'] = wscols;
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Employees");
      
      const date = new Date();
      const timestamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      XLSX.writeFile(wb, `employees_${timestamp}.xlsx`);
      
      alert("✅ Excel file downloaded successfully!");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Failed to export to Excel. Please try again.");
    }
  };

  const getLocationName = (locationId) => {
    if (!locationId || !Array.isArray(locations)) {
      return "Not assigned";
    }
    const location = locations.find((loc) => loc._id === locationId);
    return location ? location.name : "Not assigned";
  };

  // Toggle Switch Component
  const ToggleSwitch = ({ isActive, onToggle, loading }) => {
    return (
      <button
        onClick={onToggle}
        disabled={loading}
        className={`relative inline-flex items-center h-5 w-9 rounded-full transition-colors focus:outline-none ${
          isActive ? 'bg-blue-600' : 'bg-red-500'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block w-3 h-3 transform rounded-full bg-white transition-transform ${
            isActive ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    );
  };

  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-9xl">
        {/* Filters - Single Row */}
        <div className="p-2 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <FaSearch className="absolute text-sm text-gray-500 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="text"
                placeholder="Search by ID, Name, Email, Phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative" ref={departmentFilterRef}>
              <button
                onClick={() => setShowDepartmentFilter(!showDepartmentFilter)}
                className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                  filterDepartment 
                    ? 'bg-blue-600 text-gray-900 hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <FaBuilding className="text-xs" /> Dept {filterDepartment && `: ${filterDepartment}`}
              </button>
              
              {showDepartmentFilter && (
                <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                  <div 
                    onClick={() => {
                      setFilterDepartment('');
                      setShowDepartmentFilter(false);
                    }}
                    className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-blue-50"
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

            <div className="relative" ref={designationFilterRef}>
              <button
                onClick={() => setShowDesignationFilter(!showDesignationFilter)}
                className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                  filterDesignation 
                    ? 'bg-blue-600 text-gray-900 hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <FaUserTag className="text-xs" /> Desig {filterDesignation && `: ${filterDesignation}`}
              </button>
              
              {showDesignationFilter && (
                <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                  <div 
                    onClick={() => {
                      setFilterDesignation('');
                      setShowDesignationFilter(false);
                    }}
                    className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-blue-50"
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

            <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
              <button
                onClick={() => {
                  setShowInactiveOnly(false);
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  !showInactiveOnly 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Active ({activeEmployees.length})
              </button>
              <button
                onClick={() => {
                  setShowInactiveOnly(true);
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  showInactiveOnly 
                    ? 'bg-white text-red-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Inactive ({inactiveEmployees.length})
              </button>
            </div>

            <button
              onClick={exportToExcel}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-900 transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-800 whitespace-nowrap"
            >
              <FaFileExcel className="text-sm" />
              <span>Export</span>
            </button>

            <button
              onClick={() => navigate("/addemployee")}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-900 transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add</span>
            </button>

            {(filterDepartment || filterDesignation || searchTerm) && (
              <button
                onClick={() => {
                  setFilterDepartment('');
                  setFilterDesignation('');
                  setSearchTerm('');
                }}
                className="h-8 px-3 text-xs font-medium text-gray-500 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
            <table className="min-w-full">
              <thead className="text-xs text-left text-gray-900 bg-gradient-to-r from-green-500 to-blue-600">
                <tr>
                  <th className="px-2 py-2 text-center">Employee ID</th>
                  <th className="px-2 py-2 text-center">Name</th>
                  <th className="px-2 py-2 text-center">Phone</th>
                  <th className="px-2 py-2 text-center">Dept</th>
                  <th className="px-2 py-2 text-center">Desig</th>
                  <th className="px-2 py-2 text-center">Join Date</th>
                  <th className="px-2 py-2 text-center">Salary</th>
                  <th className="px-2 py-2 text-center">Shift</th>
                  <th className="px-2 py-2 text-center">Week Off</th>
                  <th className="px-2 py-2 text-center">Location</th>
                  <th className="px-2 py-2 text-center">Status</th>
                  <th className="px-2 py-2 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {currentEmployees.length > 0 ? (
                  currentEmployees.map((emp) => {
                    const isHidden = isEmployeeHidden(emp);
                    return (
                      <tr 
                        key={emp._id} 
                        className={`hover:bg-white transition-colors text-xs ${isHidden ? 'bg-red-50 hover:bg-red-100' : ''}`}
                      >
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {emp.employeeId}
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {emp.name}
                        </td>
                        <td className="px-2 py-2 text-center text-gray-500">{emp.phone}</td>
                        <td className="px-2 py-2 text-center text-gray-500 ">{emp.department || "N/A"}</td>
                        <td className="px-2 py-2 text-center text-gray-500 ">{emp.role || emp.designation || "N/A"}</td>
                        <td className="px-2 py-2 text-center text-gray-500 ">
                          {emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-2 py-2 text-center text-gray-500 ">₹{emp.salaryPerMonth || 0}</td>
                        <td className="px-2 py-2 text-center text-gray-500 ">{emp.shiftHours || 8}h</td>
                        <td className="px-2 py-2 text-center text-gray-500 ">{emp.weekOffPerMonth || 0}</td>
                        <td className="px-2 py-2 text-center text-gray-500 ">{getLocationName(emp.location)}</td>
                        <td className="px-2 py-2 text-center ">
                          <span className={`px-2 py-2 text-xs font-medium rounded-full ${
                            isHidden 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-blue-100 text-green-700'
                          }`}>
                            {isHidden ? 'INACTIVE' : 'ACTIVE'}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              className="p-1 text-blue-600 transition-colors hover:text-blue-700" 
                              onClick={() => handleView(emp)} 
                              title="View Detail"
                            >
                              <FaEye size={14} />
                            </button>
                            <button 
                              className="p-1 text-yellow-500 transition-colors hover:text-yellow-700" 
                              onClick={() => handleEdit(emp)} 
                              title="Edit Employee"
                            >
                              <FaEdit size={14} />
                            </button>
                            
                            {/* Hike Button */}
                            <button 
                              className="p-1 text-purple-600 transition-colors hover:text-purple-700" 
                              onClick={() => handleOpenHikeModal(emp)} 
                              title="Add Salary Hike"
                            >
                              <FaChartLine size={14} />
                            </button>
                            
                            <button 
                              className="p-1 text-blue-600 transition-colors hover:text-green-700" 
                              onClick={() => handleAssignLocation(emp)} 
                              title="Assign Location"
                            >
                              <FaMapMarkerAlt size={14} />
                            </button>
                            
                            <div className="flex items-center gap-1">
                              <ToggleSwitch 
                                isActive={!isHidden} 
                                onToggle={() => handleToggleStatus(emp)} 
                                loading={loading}
                              />
                              <span className="text-[8px] font-medium text-gray-500">
                                {isHidden ? 'OFF' : 'ON'}
                              </span>
                            </div>

                            <button 
                              className="p-1 text-red-500 transition-colors hover:text-red-700" 
                              onClick={() => handleDelete(emp._id)} 
                              title="Delete Employee"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="12" className="px-2 py-4 text-xs text-center text-gray-500">
                      {showInactiveOnly ? 'No inactive employees found.' : 'No active employees found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredEmployees.length > 0 && (
            <div className="bg-white px-2 py-1.5 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-1 text-xs text-gray-700">
                <span>Showing</span>
                <span className="font-medium">{indexOfFirst + 1}</span>
                <span>to</span>
                <span className="font-medium">{Math.min(indexOfLast, filteredEmployees.length)}</span>
                <span>of</span>
                <span className="font-medium">{filteredEmployees.length}</span>
                <span>results</span>

                <select
                  value={pagination.limit}
                  onChange={(e) => {
                    const newLimit = Number(e.target.value);
                    handleItemsPerPageChange(newLimit);
                  }}
                  className="p-0.5 text-xs border rounded-lg ml-1"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevPage}
                  disabled={pagination.currentPage === 1}
                  className={`px-2 py-2 border rounded-lg text-xs font-medium transition-colors ${
                    pagination.currentPage === 1
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-white"
                  }`}
                >
                  Previous
                </button>

                <div className="flex items-center gap-0.5">
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
                      disabled={page === "..."}
                      className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                        page === "..."
                          ? "text-gray-500 cursor-default"
                          : pagination.currentPage === page
                          ? "bg-blue-600 text-gray-900"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-white"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`px-2 py-2 border rounded-lg text-xs font-medium transition-colors ${
                    pagination.currentPage === pagination.totalPages
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-white"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* VIEW MODAL - IMPROVED WITH FULL DETAILS */}
        {/* ============================================ */}
        {selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-auto bg-white rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 flex justify-between items-center p-5 border-b bg-white rounded-t-2xl z-10">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaEye className="text-blue-600" /> Employee Details
                </h3>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none transition-colors">×</button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Status Warning */}
                {isEmployeeHidden(selectedEmployee) && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm font-medium text-red-800">⚠️ This employee is INACTIVE</p>
                  </div>
                )}

                {/* Personal Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Personal Information</p>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-600">Employee ID:</span><span className="font-medium text-gray-900">{selectedEmployee.employeeId}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Name:</span><span className="font-medium text-gray-900">{selectedEmployee.name}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Email:</span><span className="font-medium text-gray-900">{selectedEmployee.email}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Phone:</span><span className="font-medium text-gray-900">{selectedEmployee.phone}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Alternate:</span><span className="font-medium text-gray-900">{selectedEmployee.alternateNumber || "N/A"}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Parents Name:</span><span className="font-medium text-gray-900">{selectedEmployee.parentsName || "N/A"}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">DOB:</span><span className="font-medium text-gray-900">{selectedEmployee.dob ? new Date(selectedEmployee.dob).toLocaleDateString() : "N/A"}</span></div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Office Details</p>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-600">Department:</span><span className="font-medium text-gray-900">{selectedEmployee.department || "N/A"}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Designation:</span><span className="font-medium text-gray-900">{selectedEmployee.role || selectedEmployee.designation || "N/A"}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Join Date:</span><span className="font-medium text-gray-900">{selectedEmployee.joinDate ? new Date(selectedEmployee.joinDate).toLocaleDateString() : "N/A"}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Shift Hours:</span><span className="font-medium text-gray-900">{selectedEmployee.shiftHours || 8}h</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Week Off/Month:</span><span className="font-medium text-gray-900">{selectedEmployee.weekOffPerMonth || 0}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Assigned Working Days:</span><span className="font-medium text-gray-900">{selectedEmployee.assignedWorkingDays || 26}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${isEmployeeHidden(selectedEmployee) ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {isEmployeeHidden(selectedEmployee) ? 'INACTIVE' : 'ACTIVE'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Address</p>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-600">Address Line 1:</span> <span className="font-medium text-gray-900">{selectedEmployee.addressLine1 || "N/A"}</span></div>
                    <div><span className="text-gray-600">Address Line 2:</span> <span className="font-medium text-gray-900">{selectedEmployee.addressLine2 || "N/A"}</span></div>
                    <div><span className="text-gray-600">City:</span> <span className="font-medium text-gray-900">{selectedEmployee.city || "N/A"}</span></div>
                    <div><span className="text-gray-600">State:</span> <span className="font-medium text-gray-900">{selectedEmployee.state || "N/A"}</span></div>
                    <div><span className="text-gray-600">Pin Code:</span> <span className="font-medium text-gray-900">{selectedEmployee.pinCode || "N/A"}</span></div>
                    <div><span className="text-gray-600">Country:</span> <span className="font-medium text-gray-900">{selectedEmployee.country || "N/A"}</span></div>
                    <div className="md:col-span-2"><span className="text-gray-600">Location:</span> <span className="font-medium text-gray-900">{getLocationName(selectedEmployee.location)}</span></div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Bank & Documents</p>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div><span className="text-gray-600">Bank Name:</span> <span className="font-medium text-gray-900">{selectedEmployee.bankName || "N/A"}</span></div>
                    <div><span className="text-gray-600">Account No:</span> <span className="font-medium text-gray-900">{selectedEmployee.bankAccountNo || "N/A"}</span></div>
                    <div><span className="text-gray-600">IFSC:</span> <span className="font-medium text-gray-900">{selectedEmployee.ifscCode || "N/A"}</span></div>
                    <div><span className="text-gray-600">PAN:</span> <span className="font-medium text-gray-900">{selectedEmployee.panNumber || "N/A"}</span></div>
                    <div><span className="text-gray-600">UAN:</span> <span className="font-medium text-gray-900">{selectedEmployee.uanNumber || "N/A"}</span></div>
                    <div><span className="text-gray-600">PF:</span> <span className="font-medium text-gray-900">{selectedEmployee.pfNumber || "N/A"}</span></div>
                  </div>
                </div>

                {/* Salary Details */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Salary Details</p>
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div><span className="text-gray-600">Basic Pay:</span> <span className="font-medium text-gray-900">₹{selectedEmployee.basicPay || 0}</span></div>
                    <div><span className="text-gray-600">HRA:</span> <span className="font-medium text-gray-900">₹{selectedEmployee.hra || 0}</span></div>
                    <div><span className="text-gray-600">Conveyance:</span> <span className="font-medium text-gray-900">₹{selectedEmployee.conveyanceAllowance || 0}</span></div>
                    <div><span className="text-gray-600">Medical:</span> <span className="font-medium text-gray-900">₹{selectedEmployee.medicalAllowance || 0}</span></div>
                    <div><span className="text-gray-600">Performance:</span> <span className="font-medium text-gray-900">₹{selectedEmployee.performanceAllowance || 0}</span></div>
                    <div><span className="text-gray-600">Special:</span> <span className="font-medium text-gray-900">₹{selectedEmployee.specialAllowance || 0}</span></div>
                    <div className="col-span-2"><span className="text-gray-600">Total Salary Per Month:</span> <span className="font-bold text-blue-700">₹{selectedEmployee.salaryPerMonth?.toLocaleString() || 0}</span></div>
                  </div>
                </div>

                {/* Salary Increments History */}
                {selectedEmployee.salaryIncrements && selectedEmployee.salaryIncrements.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Salary Increment History</p>
                    <div className="mt-3 overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead className="bg-purple-100">
                          <tr>
                            <th className="px-3 py-2 text-left text-purple-800">Type</th>
                            <th className="px-3 py-2 text-left text-purple-800">Value</th>
                            <th className="px-3 py-2 text-left text-purple-800">Old Salary</th>
                            <th className="px-3 py-2 text-left text-purple-800">New Salary</th>
                            <th className="px-3 py-2 text-left text-purple-800">Effective From</th>
                            <th className="px-3 py-2 text-left text-purple-800">Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedEmployee.salaryIncrements.map((inc, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium capitalize">{inc.incrementType}</td>
                              <td className="px-3 py-2">{inc.incrementType === 'percentage' ? `${inc.incrementValue}%` : `₹${inc.incrementValue}`}</td>
                              <td className="px-3 py-2">₹{inc.oldSalaryPerMonth}</td>
                              <td className="px-3 py-2 font-bold text-green-700">₹{inc.newSalaryPerMonth}</td>
                              <td className="px-3 py-2">{inc.effectiveFrom ? new Date(inc.effectiveFrom).toLocaleDateString() : "N/A"}</td>
                              <td className="px-3 py-2">{inc.reason || "N/A"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Permissions */}
                {selectedEmployee.permissions && selectedEmployee.permissions.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Permissions</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedEmployee.permissions.map((perm, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">{perm}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Leave Limits */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Leave Limits</p>
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div><span className="text-gray-600">Casual Leave (CL):</span> <span className="font-medium text-gray-900">{selectedEmployee.maxCL || 0}</span></div>
                    <div><span className="text-gray-600">Sick Leave (SL):</span> <span className="font-medium text-gray-900">{selectedEmployee.maxSL || 0}</span></div>
                    <div><span className="text-gray-600">Earned Leave (EL):</span> <span className="font-medium text-gray-900">{selectedEmployee.maxEL || 0}</span></div>
                    <div><span className="text-gray-600">Comp Off:</span> <span className="font-medium text-gray-900">{selectedEmployee.maxCompOff || 0}</span></div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 p-4 bg-white border-t rounded-b-2xl">
                <button onClick={handleCloseModal} className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Location Modal */}
        {showLocationModal && selectedEmployeeForLocation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-white ">
            <div className="relative w-full max-w-md p-4 bg-white rounded-lg">
              <button className="absolute text-sm text-gray-500 top-2 right-3 hover:text-gray-700" onClick={handleCloseLocationModal}>✕</button>
              <h3 className="mb-3 text-base font-bold">Assign Location</h3>
              <p className="mb-2 text-xs text-gray-500">Assigning location for: {selectedEmployeeForLocation.name}</p>

              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="w-full p-2 text-xs border border-gray-300 rounded-lg"
              >
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.name}
                  </option>
                ))}
              </select>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleCloseLocationModal}
                  className="flex-1 py-2 text-xs font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={assignLocation}
                  disabled={!selectedLocationId || loading}
                  className="flex-1 py-2 text-xs font-medium text-gray-900 transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Assigning...' : 'Assign Location'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* HIKE MODAL - NO OVERFLOW */}
        {/* ============================================ */}
        {showHikeModal && selectedEmployeeForHike && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
              {/* Header - Fixed */}
              <div className="flex justify-between items-center p-5 border-b bg-white rounded-t-2xl sticky top-0 z-10">
                <h3 className="text-xl font-bold text-purple-700 flex items-center gap-2">
                  <FaChartLine className="text-purple-600" /> Salary Hike
                </h3>
                <button 
                  onClick={handleCloseHikeModal} 
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Employee Info */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                  <p className="text-xs text-gray-500">Employee</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedEmployeeForHike.name}</p>
                  <p className="text-xs text-gray-500 mt-2">Current Salary</p>
                  <p className="text-xl font-bold text-blue-700">₹{selectedEmployeeForHike.salaryPerMonth?.toLocaleString() || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Employee ID: {selectedEmployeeForHike.employeeId}</p>
                </div>

                {/* Form Fields */}
                <div className="space-y-3">
                  {/* Hike Type */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Hike Type *</label>
                    <select
                      value={hikeType}
                      onChange={(e) => setHikeType(e.target.value)}
                      className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="amount">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  {/* Hike Value */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {hikeType === 'percentage' ? 'Percentage % *' : 'Amount (₹) *'}
                    </label>
                    <input
                      type="number"
                      value={hikeValue}
                      onChange={(e) => setHikeValue(e.target.value)}
                      className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder={hikeType === 'percentage' ? 'e.g., 10' : 'e.g., 5000'}
                      min="0"
                      step={hikeType === 'percentage' ? '0.1' : '1'}
                    />
                  </div>

                  {/* Effective Date */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Effective From *</label>
                    <input
                      type="date"
                      value={hikeEffectiveDate}
                      onChange={(e) => setHikeEffectiveDate(e.target.value)}
                      className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Reason</label>
                    <input
                      type="text"
                      value={hikeReason}
                      onChange={(e) => setHikeReason(e.target.value)}
                      className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="e.g., Performance bonus, Promotion"
                    />
                  </div>

                  {/* Preview */}
                  {hikeValue && parseFloat(hikeValue) > 0 && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                      <p className="text-xs font-semibold text-purple-700 mb-2">📊 Preview</p>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Salary:</span>
                          <span className="font-medium text-gray-900">₹{selectedEmployeeForHike.salaryPerMonth?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Increment:</span>
                          <span className="font-medium text-blue-700">
                            {hikeType === 'percentage' 
                              ? `${hikeValue}%` 
                              : `₹${parseFloat(hikeValue).toLocaleString()}`
                            }
                          </span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-purple-200">
                          <span className="text-gray-600 font-medium">New Salary:</span>
                          <span className="font-bold text-green-700 text-lg">₹{calculateNewSalary()?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer - Fixed */}
              <div className="flex gap-3 p-5 border-t bg-gray-50 rounded-b-2xl sticky bottom-0">
                <button
                  onClick={handleCloseHikeModal}
                  className="flex-1 py-2.5 text-sm font-semibold text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitHike}
                  disabled={submittingHike || !hikeValue || !hikeEffectiveDate}
                  className={`flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors ${
                    submittingHike || !hikeValue || !hikeEffectiveDate
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-purple-500 hover:bg-purple-600'
                  }`}
                >
                  {submittingHike ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Applying...
                    </span>
                  ) : 'Apply Hike'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;