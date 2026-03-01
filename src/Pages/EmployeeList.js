

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
//             <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
//             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
//           >
//             <FaFileCsv className="text-lg" />
//             <span>Export CSV</span>
//           </CSVLink>

//           {/* Import Button */}
//           <label
//             htmlFor="file-upload"
//             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-purple-600 rounded-lg shadow-sm cursor-pointer hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
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
//             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
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
//                 <tr key={emp._id} className="border-b hover:bg-gray-50">
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
//                       <button className="text-blue-500" onClick={() => handleView(emp)} title="View Detail">
//                         <FaEye />
//                       </button>
//                       <button className="text-yellow-500" onClick={() => handleEdit(emp)} title="Edit Employee">
//                         <FaEdit />
//                       </button>
//                       <button className="text-green-500" onClick={() => handleAssignLocation(emp)} title="Assign Location">
//                         <FaMapMarkerAlt />
//                       </button>

//                       {/* Status Toggle Button */}
//                       <button
//                         onClick={() => handleToggleStatus(emp)}
//                         className={`px-2 py-0.5 text-xs font-bold rounded ${isEmployeeHidden(emp) ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
//         <div className="fixed inset-0 flex items-center justify-center p-3 bg-black bg-opacity-50">
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
//         <div className="fixed inset-0 flex items-center justify-center p-3 bg-black bg-opacity-50">
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
//               className="w-full py-2 mt-4 text-white bg-blue-600 rounded"
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
//             <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex flex-wrap items-center gap-3">

//           {/* Excel Export Button */}
//           <button
//             onClick={exportToExcel}
//             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
//           >
//             <FaFileExcel className="text-lg" />
//             <span>Export Excel</span>
//           </button>

//           {/* Import Button */}
//           <label
//             htmlFor="file-upload"
//             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-purple-600 rounded-lg shadow-sm cursor-pointer hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
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
//             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
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
//                 <tr key={emp._id} className="border-b hover:bg-gray-50">
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
//                       <button className="text-blue-500" onClick={() => handleView(emp)} title="View Detail">
//                         <FaEye />
//                       </button>
//                       <button className="text-yellow-500" onClick={() => handleEdit(emp)} title="Edit Employee">
//                         <FaEdit />
//                       </button>
//                       <button className="text-green-500" onClick={() => handleAssignLocation(emp)} title="Assign Location">
//                         <FaMapMarkerAlt />
//                       </button>

//                       {/* Status Toggle Button */}
//                       <button
//                         onClick={() => handleToggleStatus(emp)}
//                         className={`px-2 py-0.5 text-xs font-bold rounded ${isEmployeeHidden(emp) ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
//         <div className="fixed inset-0 flex items-center justify-center p-3 bg-black bg-opacity-50">
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
//         <div className="fixed inset-0 flex items-center justify-center p-3 bg-black bg-opacity-50">
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
//               className="w-full py-2 mt-4 text-white bg-blue-600 rounded"
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
//             <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
//               className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${!showInactiveOnly ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
//             >
//               Active ({activeEmployees.length})
//             </button>
//             <button
//               onClick={() => {
//                 setShowInactiveOnly(true);
//                 setCurrentPage(1);
//               }}
//               className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${showInactiveOnly ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
//             >
//               Inactive ({inactiveEmployees.length})
//             </button>
//           </div>

//           {/* Export Buttons */}
//           <button
//             onClick={exportToExcel}
//             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg shadow-sm hover:bg-green-700"
//           >
//             <FaFileExcel className="text-lg" />
//             <span>Export Excel</span>
//           </button>

//           <button
//             onClick={() => navigate("/addemployee")}
//             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
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
//           <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
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
//                     className={`border-b hover:bg-gray-50 ${isHidden ? 'bg-red-50 hover:bg-red-100' : ''}`}
//                   >
//                     <td className="px-2 py-2 text-sm text-center text-gray-700">
//                       <div className="px-2 py-2 text-center">
//                         <span>{emp.employeeId}</span>
//                         {isHidden && (
//                           <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
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
//                       <span className={`px-2 py-2 text-center text-xs font-medium rounded-full ${isHidden ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
//                         {isHidden ? 'INACTIVE' : 'ACTIVE'}
//                       </span>
//                     </td>
//                     <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
//                       <div className="flex justify-center gap-2">
//                         <button 
//                           className="text-blue-500 hover:text-blue-700" 
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
//                           className="text-green-500 hover:text-green-700" 
//                           onClick={() => handleAssignLocation(emp)} 
//                           title="Assign Location"
//                         >
//                           <FaMapMarkerAlt />
//                         </button>
                        
//                         {/* Status Toggle Button */}
//                         <button
//                           onClick={() => handleToggleStatus(emp)}
//                           disabled={loading}
//                           className={`px-2 py-0.5 text-xs font-bold rounded ${isHidden ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'} disabled:opacity-50`}
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
//         <span className="text-sm text-gray-600">entries</span>
//       </div>
//     </div>

//     {/* Pagination buttons */}
//     <div className="flex items-center gap-2">
//       <button
//         onClick={handlePrevPage}
//         disabled={currentPage === 1}
//         className={`px-4 py-1 text-sm border rounded-lg ${
//           currentPage === 1
//             ? "text-gray-400 bg-gray-100 cursor-not-allowed"
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
//                 ? "text-white bg-blue-600 border-blue-600"
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
//             ? "text-gray-400 bg-gray-100 cursor-not-allowed"
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
//         <div className="fixed inset-0 flex items-center justify-center p-3 bg-black bg-opacity-50">
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
//               <p><b>Status:</b> <span className={`px-2 py-1 text-xs font-medium rounded ${isEmployeeHidden(selectedEmployee) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
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
//         <div className="fixed inset-0 flex items-center justify-center p-3 bg-black bg-opacity-50">
//           <div className="relative w-full max-w-md p-5 bg-white rounded-lg">
//             <button className="absolute top-2 right-3" onClick={handleCloseLocationModal}>
//               ✕
//             </button>
//             <h3 className="mb-4 text-lg font-bold">Assign Location</h3>
//             <p className="mb-3 text-sm text-gray-600">Assigning location for: {selectedEmployeeForLocation.name}</p>

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
//                 className="flex-1 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
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
//               <FaSearch className="absolute text-sm text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
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
//                     : 'text-gray-600 hover:text-gray-800'
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
//                     : 'text-gray-600 hover:text-gray-800'
//                 }`}
//               >
//                 Inactive ({inactiveEmployees.length})
//               </button>
//             </div>

//             {/* Export Excel Button */}
//             <button
//               onClick={exportToExcel}
//               className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-white transition-colors bg-green-600 rounded-lg shadow-sm hover:bg-green-700 whitespace-nowrap"
//             >
//               <FaFileExcel className="text-sm" />
//               <span>Export</span>
//             </button>

//             {/* Add Employee Button */}
//             <button
//               onClick={() => navigate("/addemployee")}
//               className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 whitespace-nowrap"
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
//               <thead className="text-xs text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
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
//                         className={`hover:bg-gray-50 transition-colors text-xs ${isHidden ? 'bg-red-50 hover:bg-red-100' : ''}`}
//                       >
//                         <td className="px-2 py-2 font-semibold text-center text-gray-900 whitespace-nowrap">
//                           {emp.employeeId}
//                         </td>
//                         <td className="px-2 py-2 font-semibold text-center text-gray-900 whitespace-nowrap">
//                           {emp.name}
//                         </td>
//                         <td className="px-2 py-2 font-medium text-center text-gray-600 whitespace-nowrap">{emp.phone}</td>
//                         <td className="px-2 py-2 font-medium text-center text-gray-600 whitespace-nowrap">{emp.department || "N/A"}</td>
//                         <td className="px-2 py-2 font-medium text-center text-gray-600 whitespace-nowrap">{emp.role || emp.designation || "N/A"}</td>
//                         <td className="px-2 py-2 font-medium text-center text-gray-600 whitespace-nowrap">
//                           {emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : "-"}
//                         </td>
//                         <td className="px-2 py-2 font-medium text-center text-gray-600 whitespace-nowrap">₹{emp.salaryPerMonth || 0}</td>
//                         <td className="px-2 py-2 font-medium text-center text-gray-600 whitespace-nowrap">{emp.shiftHours || 8}h</td>
//                         <td className="px-2 py-2 font-medium text-center text-gray-600 whitespace-nowrap">{emp.weekOffPerMonth || 0}</td>
//                         <td className="px-2 py-2 font-medium text-center text-gray-600 whitespace-nowrap">{getLocationName(emp.location)}</td>
//                         <td className="px-2 py-2 font-medium text-center whitespace-nowrap ">
//                           <span className={`px-2 py-2 text-xs font-semibold rounded-full ${
//                             isHidden 
//                               ? 'bg-red-100 text-red-700' 
//                               : 'bg-green-100 text-green-700'
//                           }`}>
//                             {isHidden ? 'INACTIVE' : 'ACTIVE'}
//                           </span>
//                         </td>
//                         <td className="px-2 py-2 text-center whitespace-nowrap">
//                           <div className="flex items-center justify-center gap-1">
//                             <button 
//                               className="p-1 text-blue-500 transition-colors hover:text-blue-700" 
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
//                               className="p-1 text-green-500 transition-colors hover:text-green-700" 
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
//                                   ? 'bg-green-100 text-green-700 hover:bg-green-200' 
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
//             <div className="bg-gray-50 px-2 py-1.5 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200">
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
//                       ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                       : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
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
//                           ? "bg-blue-600 text-white"
//                           : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
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
//                       ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                       : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
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
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black bg-opacity-50">
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
//                 <p><b>Status:</b> <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${isEmployeeHidden(selectedEmployee) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
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
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black bg-opacity-50">
//             <div className="relative w-full max-w-md p-4 bg-white rounded-lg">
//               <button className="absolute text-sm text-gray-500 top-2 right-3 hover:text-gray-700" onClick={handleCloseLocationModal}>
//                 ✕
//               </button>
//               <h3 className="mb-3 text-base font-bold">Assign Location</h3>
//               <p className="mb-2 text-xs text-gray-600">Assigning location for: {selectedEmployeeForLocation.name}</p>

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
//                   className="flex-1 py-2 text-xs font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
import { FaBuilding, FaEdit, FaEye, FaFileExcel, FaMapMarkerAlt, FaSearch, FaTrash, FaUserTag } from "react-icons/fa";
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

  // ✅ SIMPLE FIX: Check if employee is active based on isActive field or status
  const isEmployeeHidden = (emp) => {
    // Check multiple possible fields
    if (emp.isActive === false) return true;
    if (emp.status === 'inactive') return true;
    if (emp.status === false) return true;
    return false;
  };

  const activeEmployees = employees.filter(emp => !isEmployeeHidden(emp));
  const inactiveEmployees = employees.filter(emp => isEmployeeHidden(emp));

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter((emp) => {
    if (showInactiveOnly && !isEmployeeHidden(emp)) return false;
    if (!showInactiveOnly && isEmployeeHidden(emp)) return false;
    
    const searchTermLower = searchTerm.toLowerCase().trim();
    
    // Search by multiple fields
    const matchesSearch = searchTerm === "" || (
      emp.name?.toLowerCase().includes(searchTermLower) ||
      emp.email?.toLowerCase().includes(searchTermLower) ||
      emp.phone?.toLowerCase().includes(searchTermLower) ||
      emp.employeeId?.toLowerCase().includes(searchTermLower) ||
      emp.department?.toLowerCase().includes(searchTermLower) ||
      emp.role?.toLowerCase().includes(searchTermLower)
    );
    
    // Filter by Department
    const matchesDept = filterDepartment === "" || emp.department === filterDepartment;
    
    // Filter by Designation
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

  // Update pagination when filtered results change
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

  // ✅ FIXED: Status toggle with switch
  const handleToggleStatus = async (emp) => {
    const isCurrentlyHidden = isEmployeeHidden(emp);
    const newStatus = isCurrentlyHidden ? 'active' : 'inactive';
    const action = isCurrentlyHidden ? 'ACTIVATE' : 'DEACTIVATE';

    if (!window.confirm(`Are you sure you want to ${action} ${emp.name}?`)) return;

    setLoading(true);
    
    try {
      // Try with status field
      const updateData = {
        status: newStatus
      };

      console.log("Updating status for:", emp._id, "Data:", updateData);

      const response = await axios.put(
        `${API_BASE_URL}/employees/update/${emp._id}`,
        updateData
      );

      if (response.data.success) {
        // Update local state
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
      
      // If backend doesn't accept 'status' field, try 'isActive'
      try {
        const updateData2 = {
          isActive: !isCurrentlyHidden
        };
        
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

  // ✅ FIXED: Assign location - Use correct endpoint
  const assignLocation = async () => {
    if (!selectedLocationId) {
      alert("Please select a location");
      return;
    }

    setLoading(true);
    try {
      console.log("Assigning location for employee:", selectedEmployeeForLocation.employeeId);
      
      // Method 1: Use the dedicated assign-location endpoint
      const response = await axios.put(
        `${API_BASE_URL}/employees/assign-location/${selectedEmployeeForLocation.employeeId}`,
        { locationId: selectedLocationId }
      );

      if (response.data.success) {
        // Update local state
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
      
      // Method 2: Fallback to general update
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
          isActive ? 'bg-green-500' : 'bg-red-500'
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
            {/* ID/Name Search */}
            <div className="relative flex-1 min-w-[200px]">
              <FaSearch className="absolute text-sm text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="text"
                placeholder="Search by ID, Name, Email, Phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
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

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
              <button
                onClick={() => {
                  setShowInactiveOnly(false);
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  !showInactiveOnly 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
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
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Inactive ({inactiveEmployees.length})
              </button>
            </div>

            {/* Export Excel Button */}
            <button
              onClick={exportToExcel}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-white transition-colors bg-green-600 rounded-lg shadow-sm hover:bg-green-700 whitespace-nowrap"
            >
              <FaFileExcel className="text-sm" />
              <span>Export</span>
            </button>

            {/* Add Employee Button */}
            <button
              onClick={() => navigate("/addemployee")}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add</span>
            </button>

            {/* Clear Filters Button */}
            {(filterDepartment || filterDesignation || searchTerm) && (
              <button
                onClick={() => {
                  setFilterDepartment('');
                  setFilterDesignation('');
                  setSearchTerm('');
                }}
                className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
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
              <thead className="text-xs text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
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
                        className={`hover:bg-gray-50 transition-colors text-xs ${isHidden ? 'bg-red-50 hover:bg-red-100' : ''}`}
                      >
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {emp.employeeId}
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {emp.name}
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600">{emp.phone}</td>
                        <td className="px-2 py-2 text-center text-gray-600 ">{emp.department || "N/A"}</td>
                        <td className="px-2 py-2 text-center text-gray-600 ">{emp.role || emp.designation || "N/A"}</td>
                        <td className="px-2 py-2 text-center text-gray-600 ">
                          {emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600 ">₹{emp.salaryPerMonth || 0}</td>
                        <td className="px-2 py-2 text-center text-gray-600 ">{emp.shiftHours || 8}h</td>
                        <td className="px-2 py-2 text-center text-gray-600 ">{emp.weekOffPerMonth || 0}</td>
                        <td className="px-2 py-2 text-center text-gray-600 ">{getLocationName(emp.location)}</td>
                        <td className="px-2 py-2 text-center ">
                          <span className={`px-2 py-2 text-xs font-medium rounded-full ${
                            isHidden 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {isHidden ? 'INACTIVE' : 'ACTIVE'}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              className="p-1 text-blue-500 transition-colors hover:text-blue-700" 
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
                            
                            {/* Location Button */}
                            <button 
                              className="p-1 text-green-500 transition-colors hover:text-green-700" 
                              onClick={() => handleAssignLocation(emp)} 
                              title="Assign Location"
                            >
                              <FaMapMarkerAlt size={14} />
                            </button>
                            
                            {/* Status Toggle Switch */}
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
            <div className="bg-gray-50 px-2 py-1.5 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200">
              {/* Left Side - Showing Info + Select */}
              <div className="flex flex-wrap items-center gap-1 text-xs text-gray-700">
                <span>Showing</span>
                <span className="font-medium">{indexOfFirst + 1}</span>
                <span>to</span>
                <span className="font-medium">{Math.min(indexOfLast, filteredEmployees.length)}</span>
                <span>of</span>
                <span className="font-medium">{filteredEmployees.length}</span>
                <span>results</span>

                {/* Select Dropdown */}
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

              {/* Pagination buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevPage}
                  disabled={pagination.currentPage === 1}
                  className={`px-2 py-2 border rounded-lg text-xs font-medium transition-colors ${
                    pagination.currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
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
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
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
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View Modal */}
        {selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black bg-opacity-50">
            <div className="relative w-full max-w-md p-4 bg-white rounded-lg">
              <button className="absolute text-sm text-gray-500 top-2 right-3 hover:text-gray-700" onClick={handleCloseModal}>✕</button>
              <h3 className="mb-2 text-base font-bold">Employee Details</h3>
              {isEmployeeHidden(selectedEmployee) && (
                <div className="p-1.5 mb-2 bg-red-100 border border-red-200 rounded">
                  <p className="text-xs font-medium text-red-800">⚠️ This employee is INACTIVE</p>
                </div>
              )}
              <div className="space-y-1 text-sm">
                <p><b>Employee ID:</b> {selectedEmployee.employeeId}</p>
                <p><b>Name:</b> {selectedEmployee.name}</p>
                <p><b>Email:</b> {selectedEmployee.email}</p>
                <p><b>Phone:</b> {selectedEmployee.phone}</p>
                <p><b>Department:</b> {selectedEmployee.department || "N/A"}</p>
                <p><b>Designation:</b> {selectedEmployee.role || selectedEmployee.designation || "N/A"}</p>
                <p><b>Join Date:</b> {selectedEmployee.joinDate ? new Date(selectedEmployee.joinDate).toLocaleDateString() : 'N/A'}</p>
                <p><b>Status:</b> <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${isEmployeeHidden(selectedEmployee) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {isEmployeeHidden(selectedEmployee) ? 'INACTIVE' : 'ACTIVE'}
                </span></p>
                <p><b>Salary Per Month:</b> ₹{selectedEmployee.salaryPerMonth || 'N/A'}</p>
                <p><b>Shift Hours:</b> {selectedEmployee.shiftHours || 'N/A'}</p>
                <p><b>Week Off Per Month:</b> {selectedEmployee.weekOffPerMonth || 'N/A'}</p>
                <p><b>Location:</b> {getLocationName(selectedEmployee.location)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Location Modal */}
        {showLocationModal && selectedEmployeeForLocation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black bg-opacity-50">
            <div className="relative w-full max-w-md p-4 bg-white rounded-lg">
              <button className="absolute text-sm text-gray-500 top-2 right-3 hover:text-gray-700" onClick={handleCloseLocationModal}>
                ✕
              </button>
              <h3 className="mb-3 text-base font-bold">Assign Location</h3>
              <p className="mb-2 text-xs text-gray-600">Assigning location for: {selectedEmployeeForLocation.name}</p>

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
                  className="flex-1 py-2 text-xs font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Assigning...' : 'Assign Location'}
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