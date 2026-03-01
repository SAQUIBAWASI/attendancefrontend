// import axios from "axios";
// import { useEffect, useState } from "react";
// import { API_BASE_URL } from "../config";

// const BASE_URL = API_BASE_URL;

// export const Permissions = () => {
//   const [permissions, setPermissions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
  

//   const fetchAllPermissions = async () => {
//     try {
//       const res = await axios.get(`${BASE_URL}/permissions/all`);
//       setPermissions(res.data);
//     } catch (err) {
//       console.error("Error fetching permissions:", err);
//       setError("❌ Failed to fetch permissions.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAllPermissions();
//   }, []);

//   const handleApprove = async (id) => {
//     if (!window.confirm("Are you sure you want to APPROVE this permission?")) return;

//     try {
//       const res = await axios.put(`${BASE_URL}api/permissions/approve/${id}`);
//       if (res.status === 200) {
//         alert("✅ Permission Approved Successfully!");
//         fetchAllPermissions(); // Refresh list
//       }
//     } catch (err) {
//       alert("❌ Error: " + (err.response?.data?.message || err.message));
//     }
//   };

//   if (loading) return <div className="p-6">Loading permissions...</div>;
//   if (error) return <div className="p-6 text-red-600">{error}</div>;

//   return (
//     <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-8xl">
//         <div className="p-6 bg-white rounded-lg shadow-md">
//           <div className="flex items-center justify-between mb-6">
//             {/* <h2 className="pb-2 text-2xl font-bold text-blue-900 border-b-2 border-blue-100">
//               Employee Permission Requests
//             </h2> */}
//             <button
//               onClick={fetchAllPermissions}
//               className="px-4 py-2 text-sm font-semibold text-blue-600 transition-colors rounded bg-blue-50 hover:bg-blue-100"
//             >
//               Refresh Data
//             </button>
//           </div>

//           {permissions.length === 0 ? (
//             <div className="py-10 text-center text-gray-500">
//               No permission requests found.
//             </div>
//           ) : (
//             <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//               <table className="min-w-full">
//                 <thead className="text-sm text-left text-white bg-gradient-to-r from-purple-500 to-blue-600">
//                   <tr>
//                     <th className="px-4 py-2 border">Name</th>
//                     <th className="px-4 py-2 border">Date</th>
//                     <th className="px-4 py-2 border">Duration</th>
//                     <th className="px-4 py-2 border">Reason</th>
//                     <th className="px-4 py-2 border">Status</th>
//                     <th className="px-4 py-2 border">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {permissions.map((p) => (
//                     <tr key={p._id} className="transition-colors hover:bg-gray-50">
//                       <td className="p-4 px-4 py-2 text-sm font-medium text-gray-800 border">{p.employeeName}</td>
//                       <td className="px-4 py-2 text-gray-600 border">
//                         {new Date(p.createdAt).toLocaleDateString()}
//                         <br />
//                         <span className="text-xs">{new Date(p.createdAt).toLocaleTimeString()}</span>
//                       </td>
//                       <td className="px-4 py-2 border font-semibold text-[#1E40AF]">{p.duration} mins</td>
//                       <td className="max-w-xs px-4 py-2 overflow-hidden italic text-gray-700 border text-ellipsis">
//                         "{p.reason}"
//                       </td>
//                       <td className="px-4 py-2 border">
//                         <span
//                           className={`px-2 py-2 text-center rounded-full text-xs font-bold uppercase tracking-wider ${p.status === "APPROVED"
//                             ? "bg-green-100 text-green-700 border border-green-200"
//                             : p.status === "COMPLETED"
//                               ? "bg-blue-100 text-blue-700 border border-blue-200"
//                               : p.status === "PENDING"
//                                 ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
//                                 : "bg-red-100 text-red-700 border border-red-200"
//                             }`}
//                         >
//                           {p.status === "COMPLETED" ? "IN DUTY" : p.status}
//                         </span>
//                         {p.status === "COMPLETED" && p.returnLocation && (
//                           <div className="bg-gray-50 text-[10px] text-gray-400 font-mono mt-1">
//                             <p className="text-[#1E40AF] font-bold">
//                               Reported: {new Date(p.returnedAt).toLocaleTimeString()}
//                             </p>
//                           </div>
//                         )}
//                       </td>
//                       <td className="px-4 py-2 text-center border">
//                         {p.status === "PENDING" ? (
//                           <div className="flex justify-center gap-2">
//                             <button
//                               onClick={() => handleApprove(p._id)}
//                               className="px-4 py-2 font-bold text-white transition-all bg-green-600 rounded shadow-sm hover:bg-green-700"
//                             >
//                               Approve
//                             </button>
//                             {/* Rejection logic can be added later if needed */}
//                           </div>
//                         ) : p.status === "APPROVED" ? (
//                           <span className="italic font-bold text-green-600">Active</span>
//                         ) : (
//                           <span className="text-gray-400">Processed</span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };


// import axios from "axios";
// import { useEffect, useState } from "react";
// import { API_BASE_URL } from "../config";

// const BASE_URL = API_BASE_URL;

// export const Permissions = () => {
//   const [permissions, setPermissions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");

//   const fetchAllPermissions = async () => {
//     try {
//       const res = await axios.get(`${BASE_URL}/permissions/all`);
//       setPermissions(res.data);
//     } catch (err) {
//       console.error("Error fetching permissions:", err);
//       setError("❌ Failed to fetch permissions.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAllPermissions();
//   }, []);

//   const handleApprove = async (id) => {
//     if (!window.confirm("Are you sure you want to APPROVE this permission?")) return;

//     try {
//       const res = await axios.put(`${BASE_URL}/api/permissions/approve/${id}`);
//       if (res.status === 200) {
//         alert("✅ Permission Approved Successfully!");
//         fetchAllPermissions();
//       }
//     } catch (err) {
//       alert("❌ Error: " + (err.response?.data?.message || err.message));
//     }
//   };

//   // ✅ Search Filter Logic
//   const filteredPermissions = permissions.filter((item) => {
//     const term = searchTerm.toLowerCase();
//     return (
//       item.employeeName?.toLowerCase().includes(term) ||
//       item._id?.toLowerCase().includes(term)
//     );
//   });

//   if (loading) return <div className="p-6">Loading permissions...</div>;
//   if (error) return <div className="p-6 text-red-600">{error}</div>;

//   return (
//     <div className="min-h-screen p-0 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-8xl">
//         <div className="p-0 bg-white rounded-lg shadow-md">

//           {/* ✅ Search + Refresh Row */}
//           <div className="flex flex-col items-center justify-between gap-4 mb-6 md:flex-row">

//             {/* Search Input */}
//             <div className="relative w-full md:w-80">
//               <input
//                 type="text"
//                 placeholder="Search by Name or ID..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full py-2 pl-10 pr-4 text-sm transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
//               />
//               <svg
//                 className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
//                 width="16"
//                 height="16"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 viewBox="0 0 24 24"
//               >
//                 <circle cx="11" cy="11" r="8" />
//                 <line x1="21" y1="21" x2="16.65" y2="16.65" />
//               </svg>
//             </div>

//             {/* Refresh Button */}
//             <button
//               onClick={fetchAllPermissions}
//               className="px-4 py-2 text-sm font-semibold text-blue-600 transition-colors rounded bg-blue-50 hover:bg-blue-100"
//             >
//               Refresh Data
//             </button>

//           </div>

//           {filteredPermissions.length === 0 ? (
//             <div className="py-10 text-center text-gray-500">
//               No permission requests found.
//             </div>
//           ) : (
//             <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
//                       <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//                         <table className="min-w-full">
//                           <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
//                   <tr>
//                     <th className="py-2 text-center ">Name</th>
//                     <th className="py-2 text-center ">Date</th>
//                     <th className="py-2 text-center ">Duration</th>
//                     <th className="py-2 text-center ">Reason</th>
//                     <th className="py-2 text-center ">Status</th>
//                     <th className="py-2 text-center ">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {filteredPermissions.map((p) => (
//                     <tr key={p._id} className="transition-colors hover:bg-gray-50">
//                       <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">{p.employeeName}</td>
//                       <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
//                         {new Date(p.createdAt).toLocaleDateString()}
//                         <br />
//                         <span className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleTimeString()}</span>
//                       </td>
//                       <td className="px-2 py-2 text-center text-xs font-semibold rounded-full text-[#1E40AF]">{p.duration} mins</td>
//                       <td className="px-2 py-2 text-sm text-center text-gray-700">
//                         "{p.reason}"
//                       </td>
//                       <td className="px-2 py-2 text-center whitespace-nowrap ">
//                         <span
//                           className={`px-2 py-2 text-center text-xs font-semibold rounded-full uppercase tracking-wider ${
//                             p.status === "APPROVED"
//                               ? "bg-green-100 text-green-700 border border-green-200"
//                               : p.status === "COMPLETED"
//                               ? "bg-blue-100 text-blue-700 border border-blue-200"
//                               : p.status === "PENDING"
//                               ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
//                               : "bg-red-100 text-red-700 border border-red-200"
//                           }`}
//                         >
//                           {p.status === "COMPLETED" ? "IN DUTY" : p.status}
//                         </span>
//                       </td>
//                       <td className="px-2 py-2 text-center whitespace-nowrap">
//                         {p.status === "PENDING" ? (
//                           <div className="flex justify-center gap-2">
//                             <button
//                               onClick={() => handleApprove(p._id)}
//                               className="px-2 py-2 text-xs font-semibold font-bold text-center transition-all rounded-full shadow-sm hover:bg-red-500"
//                             >
//                               Approve
//                             </button>
//                           </div>
//                         ) : p.status === "APPROVED" ? (
//                           <span className="px-2 py-2 text-xs font-semibold font-bold text-center transition-all rounded-full shadow-sm hover:bg-green-500">Active</span>
//                         ) : (
//                           <span className="px-2 py-2 text-xs font-semibold font-bold text-center transition-all rounded-full shadow-sm hover:bg-blue-500">Processed</span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };


// import axios from "axios";
// import { useEffect, useState } from "react";
// import { API_BASE_URL } from "../config";

// const BASE_URL = API_BASE_URL;

// export const Permissions = () => {
//   const [permissions, setPermissions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");

//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);

//   const fetchAllPermissions = async () => {
//     try {
//       const res = await axios.get(`${BASE_URL}/permissions/all`);
//       setPermissions(res.data);
//       setCurrentPage(1); // Reset to first page on new data
//     } catch (err) {
//       console.error("Error fetching permissions:", err);
//       setError("❌ Failed to fetch permissions.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAllPermissions();
//   }, []);

//   const handleApprove = async (id) => {
//     if (!window.confirm("Are you sure you want to APPROVE this permission?")) return;

//     try {
//       const res = await axios.put(`${BASE_URL}/api/permissions/approve/${id}`);
//       if (res.status === 200) {
//         alert("✅ Permission Approved Successfully!");
//         fetchAllPermissions();
//       }
//     } catch (err) {
//       alert("❌ Error: " + (err.response?.data?.message || err.message));
//     }
//   };

//   // ✅ Search Filter Logic
//   const filteredPermissions = permissions.filter((item) => {
//     const term = searchTerm.toLowerCase();
//     return (
//       item.employeeName?.toLowerCase().includes(term) ||
//       item.employeeId?.toLowerCase().includes(term) ||
//       item._id?.toLowerCase().includes(term)
//     );
//   });

//   // ✅ Pagination Handlers
//   const handleItemsPerPageChange = (e) => {
//     setItemsPerPage(Number(e.target.value));
//     setCurrentPage(1); // Reset to first page
//   };

//   const handlePrevPage = () => {
//     if (currentPage > 1) setCurrentPage(currentPage - 1);
//   };

//   const handleNextPage = () => {
//     if (currentPage < totalPages) setCurrentPage(currentPage + 1);
//   };

//   const handlePageClick = (page) => {
//     setCurrentPage(page);
//   };

//   const getPageNumbers = () => {
//     const pageNumbers = [];
//     for (let i = 1; i <= totalPages; i++) {
//       if (
//         i === 1 ||
//         i === totalPages ||
//         (i >= currentPage - 2 && i <= currentPage + 2)
//       ) {
//         pageNumbers.push(i);
//       } else if (i === currentPage - 3 || i === currentPage + 3) {
//         pageNumbers.push("...");
//       }
//     }
//     return pageNumbers;
//   };

//   // Calculate pagination
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredPermissions.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredPermissions.length / itemsPerPage);

//   if (loading) return <div className="p-6">Loading permissions...</div>;
//   if (error) return <div className="p-6 text-red-600">{error}</div>;

//   return (
//     <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-9xl">
//         <div className="p-6 bg-white rounded-lg shadow-md">

//           {/* ✅ Search + Refresh Row */}
//           <div className="flex flex-col items-center justify-between gap-4 mb-6 md:flex-row">

//             {/* Search Input */}
//             <div className="relative w-full md:w-80">
//               <input
//                 type="text"
//                 placeholder="Search by Name, ID..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full py-2 pl-10 pr-4 text-sm transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
//               />
//               <svg
//                 className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
//                 width="16"
//                 height="16"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 viewBox="0 0 24 24"
//               >
//                 <circle cx="11" cy="11" r="8" />
//                 <line x1="21" y1="21" x2="16.65" y2="16.65" />
//               </svg>
//             </div>

//             {/* Refresh Button */}
//             {/* <button
//               onClick={fetchAllPermissions}
//               className="px-4 py-2 text-sm font-semibold text-blue-600 transition-colors rounded bg-blue-50 hover:bg-blue-100"
//             >
//               🔄 Refresh Data
//             </button> */}

//           </div>

//           {filteredPermissions.length === 0 ? (
//             <div className="py-10 text-center text-gray-500">
//               No permission requests found.
//             </div>
//           ) : (
//             <>
//               <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
//                 <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//                   <table className="min-w-full">
//                     <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
//                       <tr>
//                         <th className="px-2 py-2 text-center">Employee ID</th>
//                         <th className="px-2 py-2 text-center">Name</th>
//                         <th className="px-2 py-2 text-center">Date & Time</th>
//                         <th className="px-2 py-2 text-center">Duration</th>
//                         <th className="px-2 py-2 text-center">Reason</th>
//                         <th className="px-2 py-2 text-center">Status</th>
//                         <th className="px-2 py-2 text-center">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200">
//                       {currentItems.map((p) => (
//                         <tr key={p._id} className="transition-colors hover:bg-gray-50">
//                           <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
//                             {p.employeeId || "N/A"}
//                           </td>
//                           <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
//                             {p.employeeName}
//                           </td>
//                           <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
//                             {new Date(p.createdAt).toLocaleDateString()}
//                             <br />
//                             <span className="text-xs text-gray-500">
//                               {new Date(p.createdAt).toLocaleTimeString()}
//                             </span>
//                           </td>
//                           <td className="px-2 py-2 text-center whitespace-nowrap">
//                             <span className="px-2 py-2 text-xs font-semibold text-center text-blue-700 bg-blue-100 rounded-full">
//                               {p.duration} mins
//                             </span>
//                           </td>
//                           <td className="max-w-xs px-2 py-2 text-sm text-center text-gray-700 truncate">
//                             "{p.reason}"
//                           </td>
//                           <td className="px-2 py-2 text-center whitespace-nowrap">
//                             <span
//                               className={`px-2 py-2 text-center text-xs font-semibold rounded-full uppercase tracking-wider ${
//                                 p.status === "APPROVED"
//                                   ? "bg-green-100 text-green-700 border border-green-200"
//                                   : p.status === "COMPLETED"
//                                   ? "bg-blue-100 text-blue-700 border border-blue-200"
//                                   : p.status === "PENDING"
//                                   ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
//                                   : "bg-red-100 text-red-700 border border-red-200"
//                               }`}
//                             >
//                               {p.status === "COMPLETED" ? "IN DUTY" : p.status}
//                             </span>
//                           </td>
//                           <td className="px-2 py-2 text-center whitespace-nowrap">
//                             {p.status === "PENDING" ? (
//                               <button
//                                 onClick={() => handleApprove(p._id)}
//                                 className="px-2 py-2 text-xs font-semibold text-center text-white transition-all bg-green-600 rounded-md shadow-sm hover:bg-green-700"
//                               >
//                                 Approve
//                               </button>
//                             ) : p.status === "APPROVED" ? (
//                               <span className="px-2 py-2 text-xs font-semibold text-center text-green-700 bg-green-100 rounded-md">
//                                 Active
//                               </span>
//                             ) : (
//                               <span className="px-2 py-2 text-xs font-semibold text-center text-blue-700 bg-blue-100 rounded-md">
//                                 Processed
//                               </span>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//               {/* ✅ Pagination Section - Added exactly as requested */}
//               <div className="flex flex-col items-center justify-between gap-4 mt-6 sm:flex-row">
//                 {/* Show entries dropdown */}
//                 <div className="flex flex-wrap items-center gap-4">
//                   <div className="flex items-center gap-2">
//                     <label className="text-sm font-medium text-gray-700">
//                       Show:
//                     </label>
//                     <select
//                       value={itemsPerPage}
//                       onChange={handleItemsPerPageChange}
//                       className="p-2 text-sm border rounded-lg"
//                     >
//                       <option value={5}>5</option>
//                       <option value={10}>10</option>
//                       <option value={20}>20</option>
//                       <option value={50}>50</option>
//                     </select>
//                     <span className="text-sm text-gray-600">entries</span>
//                   </div>
//                 </div>

//                 {/* Pagination buttons */}
//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={handlePrevPage}
//                     disabled={currentPage === 1}
//                     className={`px-4 py-1 text-sm border rounded-lg ${
//                       currentPage === 1
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
//                       className={`px-4 py-1 text-sm border rounded-lg ${
//                         page === "..."
//                           ? "text-gray-500 bg-gray-50 cursor-default"
//                           : currentPage === page
//                           ? "text-white bg-blue-600 border-blue-600"
//                           : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
//                       }`}
//                     >
//                       {page}
//                     </button>
//                   ))}

//                   <button
//                     onClick={handleNextPage}
//                     disabled={currentPage === totalPages}
//                     className={`px-4 py-1 text-sm border rounded-lg ${
//                       currentPage === totalPages
//                         ? "text-gray-400 bg-gray-100 cursor-not-allowed"
//                         : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
//                     }`}
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FaSearch } from "react-icons/fa";
// import { API_BASE_URL } from "../config";
// import { isEmployeeHidden } from "../utils/employeeStatus";

// const BASE_URL = API_BASE_URL;

// export const Permissions = () => {
//   const [permissions, setPermissions] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [deptSearchTerm, setDeptSearchTerm] = useState("");

//   // Pagination states
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalCount: 0,
//     limit: 10,
//   });

//   const fetchAllData = async () => {
//     try {
//       setLoading(true);
      
//       // Fetch both permissions and employees data
//       const [permissionsRes, employeesRes] = await Promise.all([
//         axios.get(`${BASE_URL}/permissions/all`),
//         axios.get(`${BASE_URL}/employees/get-employees`)
//       ]);

//       const permissionsData = permissionsRes.data || [];
//       const employeesData = employeesRes.data || [];
      
//       // Filter active employees
//       const activeEmployees = employeesData.filter(emp => !isEmployeeHidden(emp));
      
//       setEmployees(activeEmployees);
//       setPermissions(permissionsData);
      
//       setPagination(prev => ({
//         ...prev,
//         totalCount: permissionsData.length,
//         totalPages: Math.ceil(permissionsData.length / prev.limit),
//         currentPage: 1
//       }));
//     } catch (err) {
//       console.error("Error fetching data:", err);
//       setError("❌ Failed to fetch data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   const handleApprove = async (id) => {
//     if (!window.confirm("Are you sure you want to APPROVE this permission?")) return;

//     try {
//       const res = await axios.put(`${BASE_URL}/api/permissions/approve/${id}`);
//       if (res.status === 200) {
//         alert("✅ Permission Approved Successfully!");
//         fetchAllData();
//       }
//     } catch (err) {
//       alert("❌ Error: " + (err.response?.data?.message || err.message));
//     }
//   };

//   // Get employee details by ID
//   const getEmployeeDetails = (employeeId) => {
//     const employee = employees.find(emp => 
//       emp.employeeId === employeeId || emp._id === employeeId
//     );
    
//     return {
//       department: employee?.department || employee?.departmentName || "N/A",
//       designation: employee?.designation || employee?.role || "N/A"
//     };
//   };

//   // ✅ Search Filter Logic
//   const filteredPermissions = permissions
//     .map(permission => {
//       // Enrich permission with employee details
//       const empDetails = getEmployeeDetails(permission.employeeId);
//       return {
//         ...permission,
//         department: empDetails.department,
//         designation: empDetails.designation
//       };
//     })
//     .filter((item) => {
//       const term = searchTerm.toLowerCase();
//       const deptTerm = deptSearchTerm.toLowerCase();
      
//       // Search by ID or Name
//       const matchesSearch = searchTerm.trim() === "" || (
//         item.employeeName?.toLowerCase().includes(term) ||
//         item.employeeId?.toLowerCase().includes(term) ||
//         item._id?.toLowerCase().includes(term)
//       );
      
//       // Filter by Department or Designation
//       const matchesDept = deptSearchTerm.trim() === "" || (
//         item.department?.toLowerCase().includes(deptTerm) ||
//         item.designation?.toLowerCase().includes(deptTerm)
//       );
      
//       return matchesSearch && matchesDept;
//     });

//   // Update pagination when filtered results change
//   useEffect(() => {
//     setPagination(prev => ({
//       ...prev,
//       totalCount: filteredPermissions.length,
//       totalPages: Math.ceil(filteredPermissions.length / prev.limit),
//       currentPage: 1
//     }));
//   }, [filteredPermissions.length, pagination.limit]);

//   // ✅ Pagination Handlers
//   const handleItemsPerPageChange = (limit) => {
//     setPagination({
//       currentPage: 1,
//       limit: limit,
//       totalCount: filteredPermissions.length,
//       totalPages: Math.ceil(filteredPermissions.length / limit)
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

//   // Calculate pagination
//   const indexOfLastItem = pagination.currentPage * pagination.limit;
//   const indexOfFirstItem = indexOfLastItem - pagination.limit;
//   const currentItems = filteredPermissions.slice(indexOfFirstItem, indexOfLastItem);

//   if (loading) {
//     return (
//       <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="mx-auto max-w-9xl">
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <div className="flex items-center justify-center">
//               <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
//               <span className="ml-2 text-gray-600">Loading permissions...</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }
  
//   if (error) {
//     return (
//       <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="mx-auto max-w-9xl">
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <p className="text-red-600">{error}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//      <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-9xl">
//         {/* Filters */}
//         <div className="p-2 mb-2 bg-white rounded-lg shadow-md">
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
//             {/* ID/Name Search */}
//             <div className="relative">
//               <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
//               <input
//                 type="text"
//                 placeholder="Search by ID or Name..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Department/Designation Dropdown */}
//             <div className="relative">
//               <select
//                 value={deptSearchTerm}
//                 onChange={(e) => setDeptSearchTerm(e.target.value)}
//                 className="w-full px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

//             {/* Placeholder for alignment */}
//             <div></div>
//             <div></div>
//           </div>
//         </div>

//         {filteredPermissions.length === 0 ? (
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <p className="text-lg text-gray-500">No permission requests found</p>
//             <p className="mt-2 text-sm text-gray-400">
//               {(searchTerm || deptSearchTerm) && "Try clearing search filters"}
//             </p>
//           </div>
//         ) : (
//           <>
//             {/* Permissions Table */}
//             <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
//               <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//                 <table className="min-w-full">
//                   <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
//                     <tr>
//                       <th className="px-3 py-2 text-center">Employee ID</th>
//                       <th className="px-3 py-2 text-center">Name</th>
//                       <th className="px-3 py-2 text-center">Department</th>
//                       <th className="px-3 py-2 text-center">Designation</th>
//                       <th className="px-3 py-2 text-center">Date & Time</th>
//                       <th className="px-3 py-2 text-center">Duration</th>
//                       <th className="px-3 py-2 text-center">Reason</th>
//                       <th className="px-3 py-2 text-center">Status</th>
//                       <th className="px-3 py-2 text-center">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {currentItems.map((p) => (
//                       <tr key={p._id} className="transition-colors hover:bg-gray-50">
//                         <td className="px-3 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
//                           {p.employeeId || "N/A"}
//                         </td>
//                         <td className="px-3 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
//                           {p.employeeName}
//                         </td>
//                         <td className="px-3 py-2 text-sm text-center text-gray-600 whitespace-nowrap">
//                           {p.department}
//                         </td>
//                         <td className="px-3 py-2 text-sm text-center text-gray-600 whitespace-nowrap">
//                           {p.designation}
//                         </td>
//                         <td className="px-3 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
//                           {new Date(p.createdAt).toLocaleDateString()}
//                           <br />
//                           <span className="text-xs text-gray-500">
//                             {new Date(p.createdAt).toLocaleTimeString()}
//                           </span>
//                         </td>
//                         <td className="px-3 py-2 text-center whitespace-nowrap">
//                           <span className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
//                             {p.duration} mins
//                           </span>
//                         </td>
//                         <td className="max-w-xs px-3 py-2 text-sm text-center text-gray-700 truncate">
//                           "{p.reason}"
//                         </td>
//                         <td className="px-3 py-2 text-center whitespace-nowrap">
//                           <span
//                             className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
//                               p.status === "APPROVED"
//                                 ? "bg-green-100 text-green-700"
//                                 : p.status === "COMPLETED"
//                                 ? "bg-blue-100 text-blue-700"
//                                 : p.status === "PENDING"
//                                 ? "bg-yellow-100 text-yellow-700"
//                                 : "bg-red-100 text-red-700"
//                             }`}
//                           >
//                             {p.status === "COMPLETED" ? "IN DUTY" : p.status}
//                           </span>
//                         </td>
//                         <td className="px-3 py-2 text-center whitespace-nowrap">
//                           {p.status === "PENDING" ? (
//                             <button
//                               onClick={() => handleApprove(p._id)}
//                               className="px-3 py-1 text-xs font-semibold text-white transition-all bg-green-600 rounded-md shadow-sm hover:bg-green-700"
//                             >
//                               Approve
//                             </button>
//                           ) : p.status === "APPROVED" ? (
//                             <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-md">
//                               Active
//                             </span>
//                           ) : (
//                             <span className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-md">
//                               Processed
//                             </span>
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination */}
//               {filteredPermissions.length > 0 && (
//                 <div className="flex flex-col items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 sm:flex-row">
//                   {/* Left Side - Showing Info + Select */}
//                   <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
//                     <span>Showing</span>
//                     <span className="font-medium">
//                       {indexOfFirstItem + 1}
//                     </span>
//                     <span>to</span>
//                     <span className="font-medium">
//                       {Math.min(indexOfLastItem, filteredPermissions.length)}
//                     </span>
//                     <span>of</span>
//                     <span className="font-medium">
//                       {filteredPermissions.length}
//                     </span>
//                     <span>results</span>

//                     {/* Select Dropdown */}
//                     <select
//                       value={pagination.limit}
//                       onChange={(e) => {
//                         const newLimit = Number(e.target.value);
//                         handleItemsPerPageChange(newLimit);
//                       }}
//                       className="p-1 ml-2 text-sm border rounded-lg"
//                     >
//                       <option value={5}>5</option>
//                       <option value={10}>10</option>
//                       <option value={20}>20</option>
//                       <option value={50}>50</option>
//                     </select>
//                   </div>

//                   {/* Pagination buttons */}
//                   <div className="flex items-center gap-2 mt-2 sm:mt-0">
//                     <button
//                       onClick={handlePrevPage}
//                       disabled={pagination.currentPage === 1}
//                       className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
//                         pagination.currentPage === 1
//                           ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                           : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//                       }`}
//                     >
//                       Previous
//                     </button>

//                     <div className="flex items-center gap-1">
//                       {getPageNumbers().map((page, index) => (
//                         <button
//                           key={index}
//                           onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
//                           disabled={page === "..."}
//                           className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//                             page === "..."
//                               ? "text-gray-500 cursor-default"
//                               : pagination.currentPage === page
//                               ? "bg-blue-600 text-white"
//                               : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
//                           }`}
//                         >
//                           {page}
//                         </button>
//                       ))}
//                     </div>

//                     <button
//                       onClick={handleNextPage}
//                       disabled={pagination.currentPage === pagination.totalPages}
//                       className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
//                         pagination.currentPage === pagination.totalPages
//                           ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                           : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//                       }`}
//                     >
//                       Next
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };


// import axios from "axios";
// import { useEffect, useRef, useState } from "react";
// import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag } from "react-icons/fa";
// import { API_BASE_URL } from "../config";
// import { isEmployeeHidden } from "../utils/employeeStatus";

// const BASE_URL = API_BASE_URL;

// export const Permissions = () => {
//   const [permissions, setPermissions] = useState([]);
//   const [filteredPermissions, setFilteredPermissions] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
  
//   // Date filters
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
//   // Search filters
//   const [searchTerm, setSearchTerm] = useState("");
  
//   // Department and Designation filter states
//   const [filterDepartment, setFilterDepartment] = useState("");
//   const [filterDesignation, setFilterDesignation] = useState("");
//   const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
//   const [showDesignationFilter, setShowDesignationFilter] = useState(false);
  
//   // Unique departments and designations
//   const [uniqueDepartments, setUniqueDepartments] = useState([]);
//   const [uniqueDesignations, setUniqueDesignations] = useState([]);
  
//   // Refs for click outside
//   const departmentFilterRef = useRef(null);
//   const designationFilterRef = useRef(null);

//   // Pagination states
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalCount: 0,
//     limit: 10,
//   });

//   // Click outside handlers for filter dropdowns
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (departmentFilterRef.current && !departmentFilterRef.current.contains(event.target)) {
//         setShowDepartmentFilter(false);
//       }
//       if (designationFilterRef.current && !designationFilterRef.current.contains(event.target)) {
//         setShowDesignationFilter(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const fetchAllData = async () => {
//     try {
//       setLoading(true);
      
//       // Fetch both permissions and employees data
//       const [permissionsRes, employeesRes] = await Promise.all([
//         axios.get(`${BASE_URL}/permissions/all`),
//         axios.get(`${BASE_URL}/employees/get-employees`)
//       ]);

//       const permissionsData = permissionsRes.data || [];
//       const employeesData = employeesRes.data || [];
      
//       // Filter active employees
//       const activeEmployees = employeesData.filter(emp => !isEmployeeHidden(emp));
//       setEmployees(activeEmployees);
      
//       // Extract unique departments and designations
//       const depts = new Set();
//       const designations = new Set();
//       activeEmployees.forEach(emp => {
//         if (emp.department) depts.add(emp.department);
//         if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
//       });
//       setUniqueDepartments(Array.from(depts).sort());
//       setUniqueDesignations(Array.from(designations).sort());
      
//       // Enrich permissions with employee details
//       const enrichedPermissions = permissionsData
//         .map(permission => {
//           // Find employee by matching ID
//           const employee = activeEmployees.find(emp => 
//             emp.employeeId === permission.employeeId || 
//             emp._id === permission.employeeId ||
//             emp.empId === permission.employeeId
//           );
          
//           // Skip if employee is hidden or not found
//           if (!employee) return null;
          
//           return {
//             ...permission,
//             employeeName: permission.employeeName || employee.name || employee.fullName || "N/A",
//             department: employee?.department || employee?.departmentName || "N/A",
//             designation: employee?.designation || employee?.role || "N/A",
//             employeeId: permission.employeeId || employee.employeeId || employee._id
//           };
//         })
//         .filter(p => p !== null);
      
//       setPermissions(enrichedPermissions);
//       setFilteredPermissions(enrichedPermissions);
      
//       setPagination(prev => ({
//         ...prev,
//         totalCount: enrichedPermissions.length,
//         totalPages: Math.ceil(enrichedPermissions.length / prev.limit),
//         currentPage: 1
//       }));
//     } catch (err) {
//       console.error("Error fetching data:", err);
//       setError("❌ Failed to fetch data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   useEffect(() => {
//     // Apply filters whenever data or filters change
//     filterPermissions();
//   }, [permissions, searchTerm, filterDepartment, filterDesignation, fromDate, toDate, selectedMonth]);

//   useEffect(() => {
//     // Reset to first page when filters change
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   }, [searchTerm, filterDepartment, filterDesignation, fromDate, toDate, selectedMonth]);

//   const filterPermissions = () => {
//     let filtered = [...permissions];
    
//     // Filter by Employee ID or Name
//     if (searchTerm.trim()) {
//       const term = searchTerm.toLowerCase().trim();
//       filtered = filtered.filter(item => 
//         item.employeeId?.toString().toLowerCase().includes(term) ||
//         item.employeeName?.toLowerCase().includes(term)
//       );
//     }
    
//     // Filter by Department
//     if (filterDepartment) {
//       filtered = filtered.filter(item => item.department === filterDepartment);
//     }
    
//     // Filter by Designation
//     if (filterDesignation) {
//       filtered = filtered.filter(item => item.designation === filterDesignation);
//     }
    
//     // Filter by Date Range
//     if (fromDate && toDate) {
//       const from = new Date(fromDate);
//       from.setHours(0, 0, 0, 0);
//       const to = new Date(toDate);
//       to.setHours(23, 59, 59, 999);
      
//       filtered = filtered.filter(item => {
//         const itemDate = new Date(item.createdAt);
//         return itemDate >= from && itemDate <= to;
//       });
//     } else if (fromDate && !toDate) {
//       // Single date
//       const from = new Date(fromDate);
//       from.setHours(0, 0, 0, 0);
//       const to = new Date(fromDate);
//       to.setHours(23, 59, 59, 999);
      
//       filtered = filtered.filter(item => {
//         const itemDate = new Date(item.createdAt);
//         return itemDate >= from && itemDate <= to;
//       });
//     } else if (selectedMonth) {
//       // Month filter
//       const [year, month] = selectedMonth.split('-').map(Number);
//       filtered = filtered.filter(item => {
//         const itemDate = new Date(item.createdAt);
//         return itemDate.getFullYear() === year && itemDate.getMonth() + 1 === month;
//       });
//     }
    
//     setFilteredPermissions(filtered);
//     setPagination(prev => ({
//       ...prev,
//       totalCount: filtered.length,
//       totalPages: Math.ceil(filtered.length / prev.limit)
//     }));
//   };

//   const handleApprove = async (id) => {
//     if (!window.confirm("Are you sure you want to APPROVE this permission?")) return;

//     try {
//       const res = await axios.put(`${BASE_URL}/permissions/approve/${id}`);
//       if (res.status === 200) {
//         alert("✅ Permission Approved Successfully!");
//         fetchAllData();
//       }
//     } catch (err) {
//       alert("❌ Error: " + (err.response?.data?.message || err.message));
//     }
//   };

//   // Clear all filters
//   const clearFilters = () => {
//     setSearchTerm("");
//     setFilterDepartment("");
//     setFilterDesignation("");
//     setFromDate("");
//     setToDate("");
//     setSelectedMonth(new Date().toISOString().slice(0, 7));
//   };

//   // Pagination Handlers
//   const handleItemsPerPageChange = (limit) => {
//     setPagination({
//       currentPage: 1,
//       limit: limit,
//       totalCount: filteredPermissions.length,
//       totalPages: Math.ceil(filteredPermissions.length / limit)
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

//   // Calculate pagination
//   const indexOfLastItem = pagination.currentPage * pagination.limit;
//   const indexOfFirstItem = indexOfLastItem - pagination.limit;
//   const currentItems = filteredPermissions.slice(indexOfFirstItem, indexOfLastItem);

//   if (loading) {
//     return (
//       <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="mx-auto max-w-9xl">
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <div className="flex items-center justify-center">
//               <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
//               <span className="ml-2 text-gray-600">Loading permissions...</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }
  
//   if (error) {
//     return (
//       <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="mx-auto max-w-9xl">
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <p className="text-red-600">{error}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-9xl">
//         {/* Filters */}
//         <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
//           <div className="flex flex-wrap items-center gap-2">
            
//             {/* ID/Name Search */}
//             <div className="relative flex-1 min-w-[180px]">
//               <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
//               <input
//                 type="text"
//                 placeholder="Search by ID or Name..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Department Filter Button */}
//             <div className="relative" ref={departmentFilterRef}>
//               <button
//                 onClick={() => setShowDepartmentFilter(!showDepartmentFilter)}
//                 className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
//                   filterDepartment 
//                     ? 'bg-blue-600 text-white hover:bg-blue-700' 
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
//                 }`}
//               >
//                 <FaBuilding className="text-xs" /> Dept {filterDepartment && `: ${filterDepartment}`}
//               </button>
              
//               {/* Department Filter Dropdown */}
//               {showDepartmentFilter && (
//                 <div className="absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
//                   <div 
//                     onClick={() => {
//                       setFilterDepartment('');
//                       setShowDepartmentFilter(false);
//                     }}
//                     className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer border-b border-gray-100 font-medium text-gray-700"
//                   >
//                     All Departments
//                   </div>
//                   {uniqueDepartments.map(dept => (
//                     <div 
//                       key={dept}
//                       onClick={() => {
//                         setFilterDepartment(dept);
//                         setShowDepartmentFilter(false);
//                       }}
//                       className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
//                         filterDepartment === dept ? 'bg-blue-50 text-blue-700 font-medium' : ''
//                       }`}
//                     >
//                       {dept}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Designation Filter Button */}
//             <div className="relative" ref={designationFilterRef}>
//               <button
//                 onClick={() => setShowDesignationFilter(!showDesignationFilter)}
//                 className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
//                   filterDesignation 
//                     ? 'bg-blue-600 text-white hover:bg-blue-700' 
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
//                 }`}
//               >
//                 <FaUserTag className="text-xs" /> Desig {filterDesignation && `: ${filterDesignation}`}
//               </button>
              
//               {/* Designation Filter Dropdown */}
//               {showDesignationFilter && (
//                 <div className="absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
//                   <div 
//                     onClick={() => {
//                       setFilterDesignation('');
//                       setShowDesignationFilter(false);
//                     }}
//                     className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer border-b border-gray-100 font-medium text-gray-700"
//                   >
//                     All Designations
//                   </div>
//                   {uniqueDesignations.map(des => (
//                     <div 
//                       key={des}
//                       onClick={() => {
//                         setFilterDesignation(des);
//                         setShowDesignationFilter(false);
//                       }}
//                       className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
//                         filterDesignation === des ? 'bg-blue-50 text-blue-700 font-medium' : ''
//                       }`}
//                     >
//                       {des}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* From Date */}
//             <div className="relative w-[130px]">
//               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
//                 From:
//               </span>
//               <input
//                 type="date"
//                 value={fromDate}
//                 onChange={(e) => setFromDate(e.target.value)}
//                 onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                 className="w-full pl-12 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* To Date */}
//             <div className="relative w-[130px]">
//               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
//                 To:
//               </span>
//               <input
//                 type="date"
//                 value={toDate}
//                 onChange={(e) => setToDate(e.target.value)}
//                 onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                 className="w-full pl-10 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Month Selector */}
//             <div className="relative w-[130px]">
//               <FaCalendarAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
//               <input
//                 type="month"
//                 value={selectedMonth}
//                 onChange={(e) => setSelectedMonth(e.target.value)}
//                 onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                 className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Clear Filters Button */}
//             {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate || selectedMonth !== new Date().toISOString().slice(0, 7)) && (
//               <button
//                 onClick={clearFilters}
//                 className="h-8 px-3 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition"
//               >
//                 Clear
//               </button>
//             )}
//           </div>
//         </div>

//         {filteredPermissions.length === 0 ? (
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <p className="text-lg text-gray-500">No permission requests found</p>
//             <p className="mt-2 text-sm text-gray-400">
//               {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate) && "Try clearing filters"}
//             </p>
//           </div>
//         ) : (
//           <>
//             {/* Permissions Table */}
//             <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
//               <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//                 <table className="min-w-full">
//                   <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
//                     <tr>
//                       <th className="px-3 py-2 text-center">Employee ID</th>
//                       <th className="px-3 py-2 text-center">Name</th>
//                       <th className="px-3 py-2 text-center">Department</th>
//                       <th className="px-3 py-2 text-center">Designation</th>
//                       <th className="px-3 py-2 text-center">Date & Time</th>
//                       <th className="px-3 py-2 text-center">Duration</th>
//                       <th className="px-3 py-2 text-center">Reason</th>
//                       <th className="px-3 py-2 text-center">Status</th>
//                       <th className="px-3 py-2 text-center">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {currentItems.map((p) => (
//                       <tr key={p._id} className="transition-colors hover:bg-gray-50">
//                         <td className="px-3 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
//                           {p.employeeId || "N/A"}
//                         </td>
//                         <td className="px-3 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
//                           {p.employeeName}
//                         </td>
//                         <td className="px-3 py-2 text-sm text-center text-gray-600 whitespace-nowrap">
//                           {p.department}
//                         </td>
//                         <td className="px-3 py-2 text-sm text-center text-gray-600 whitespace-nowrap">
//                           {p.designation}
//                         </td>
//                         <td className="px-3 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
//                           {new Date(p.createdAt).toLocaleDateString()}
//                           <br />
//                           <span className="text-xs text-gray-500">
//                             {new Date(p.createdAt).toLocaleTimeString()}
//                           </span>
//                         </td>
//                         <td className="px-3 py-2 text-center whitespace-nowrap">
//                           <span className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
//                             {p.duration} mins
//                           </span>
//                         </td>
//                         <td className="max-w-xs px-3 py-2 text-sm text-center text-gray-700 truncate">
//                           "{p.reason}"
//                         </td>
//                         <td className="px-3 py-2 text-center whitespace-nowrap">
//                           <span
//                             className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
//                               p.status === "APPROVED"
//                                 ? "bg-green-100 text-green-700"
//                                 : p.status === "COMPLETED"
//                                 ? "bg-blue-100 text-blue-700"
//                                 : p.status === "PENDING"
//                                 ? "bg-yellow-100 text-yellow-700"
//                                 : "bg-red-100 text-red-700"
//                             }`}
//                           >
//                             {p.status === "COMPLETED" ? "IN DUTY" : p.status}
//                           </span>
//                         </td>
//                         <td className="px-3 py-2 text-center whitespace-nowrap">
//                           {p.status === "PENDING" ? (
//                             <button
//                               onClick={() => handleApprove(p._id)}
//                               className="px-3 py-1 text-xs font-semibold text-white transition-all bg-green-600 rounded-md shadow-sm hover:bg-green-700"
//                             >
//                               Approve
//                             </button>
//                           ) : p.status === "APPROVED" ? (
//                             <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-md">
//                               Active
//                             </span>
//                           ) : (
//                             <span className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-md">
//                               Processed
//                             </span>
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination */}
//               {filteredPermissions.length > 0 && (
//                 <div className="flex flex-col items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 sm:flex-row">
//                   <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
//                     <span>Showing</span>
//                     <span className="font-medium">
//                       {indexOfFirstItem + 1}
//                     </span>
//                     <span>to</span>
//                     <span className="font-medium">
//                       {Math.min(indexOfLastItem, filteredPermissions.length)}
//                     </span>
//                     <span>of</span>
//                     <span className="font-medium">
//                       {filteredPermissions.length}
//                     </span>
//                     <span>results</span>

//                     <select
//                       value={pagination.limit}
//                       onChange={(e) => {
//                         const newLimit = Number(e.target.value);
//                         handleItemsPerPageChange(newLimit);
//                       }}
//                       className="p-1 ml-2 text-sm border rounded-lg"
//                     >
//                       <option value={5}>5</option>
//                       <option value={10}>10</option>
//                       <option value={20}>20</option>
//                       <option value={50}>50</option>
//                     </select>
//                   </div>

//                   <div className="flex items-center gap-2 mt-2 sm:mt-0">
//                     <button
//                       onClick={handlePrevPage}
//                       disabled={pagination.currentPage === 1}
//                       className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
//                         pagination.currentPage === 1
//                           ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                           : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//                       }`}
//                     >
//                       Previous
//                     </button>

//                     <div className="flex items-center gap-1">
//                       {getPageNumbers().map((page, index) => (
//                         <button
//                           key={index}
//                           onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
//                           disabled={page === "..."}
//                           className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//                             page === "..."
//                               ? "text-gray-500 cursor-default"
//                               : pagination.currentPage === page
//                               ? "bg-blue-600 text-white"
//                               : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
//                           }`}
//                         >
//                           {page}
//                         </button>
//                       ))}
//                     </div>

//                     <button
//                       onClick={handleNextPage}
//                       disabled={pagination.currentPage === pagination.totalPages}
//                       className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
//                         pagination.currentPage === pagination.totalPages
//                           ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                           : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//                       }`}
//                     >
//                       Next
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };


// import axios from "axios";
// import { useEffect, useRef, useState } from "react";
// import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag } from "react-icons/fa";
// import { API_BASE_URL } from "../config";
// import { isEmployeeHidden } from "../utils/employeeStatus";

// const BASE_URL = API_BASE_URL;

// export const Permissions = () => {
//   const [permissions, setPermissions] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
  
//   //  Date filters
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

//   // Department and Designation filter states
//   const [filterDepartment, setFilterDepartment] = useState("");
//   const [filterDesignation, setFilterDesignation] = useState("");
//   const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
//   const [showDesignationFilter, setShowDesignationFilter] = useState(false);
  
//   // Unique departments and designations
//   const [uniqueDepartments, setUniqueDepartments] = useState([]);
//   const [uniqueDesignations, setUniqueDesignations] = useState([]);
  
//   // Refs for click outside
//   const departmentFilterRef = useRef(null);
//   const designationFilterRef = useRef(null);

//   // Pagination states
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalCount: 0,
//     limit: 10,
//   });

//   // Click outside handlers for filter dropdowns
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (departmentFilterRef.current && !departmentFilterRef.current.contains(event.target)) {
//         setShowDepartmentFilter(false);
//       }
//       if (designationFilterRef.current && !designationFilterRef.current.contains(event.target)) {
//         setShowDesignationFilter(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const fetchAllData = async () => {
//     try {
//       setLoading(true);
      
//       // Fetch both permissions and employees data
//       const [permissionsRes, employeesRes] = await Promise.all([
//         axios.get(`${BASE_URL}/permissions/all`),
//         axios.get(`${BASE_URL}/employees/get-employees`)
//       ]);

//       const permissionsData = permissionsRes.data || [];
//       const employeesData = employeesRes.data || [];
      
//       // Filter active employees
//       const activeEmployees = employeesData.filter(emp => !isEmployeeHidden(emp));
      
//       setEmployees(activeEmployees);
      
//       // Extract unique departments and designations
//       const depts = new Set();
//       const designations = new Set();
//       activeEmployees.forEach(emp => {
//         if (emp.department) depts.add(emp.department);
//         if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
//       });
//       setUniqueDepartments(Array.from(depts).sort());
//       setUniqueDesignations(Array.from(designations).sort());
      
//       setPermissions(permissionsData);
      
//       setPagination(prev => ({
//         ...prev,
//         totalCount: permissionsData.length,
//         totalPages: Math.ceil(permissionsData.length / prev.limit),
//         currentPage: 1
//       }));
//     } catch (err) {
//       console.error("Error fetching data:", err);
//       setError("❌ Failed to fetch data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   const handleApprove = async (id) => {
//     if (!window.confirm("Are you sure you want to APPROVE this permission?")) return;

//     try {
//       const res = await axios.put(`${BASE_URL}/api/permissions/approve/${id}`);
//       if (res.status === 200) {
//         alert("✅ Permission Approved Successfully!");
//         fetchAllData();
//       }
//     } catch (err) {
//       alert("❌ Error: " + (err.response?.data?.message || err.message));
//     }
//   };

//   // Get employee details by ID
//   const getEmployeeDetails = (employeeId) => {
//     const employee = employees.find(emp => 
//       emp.employeeId === employeeId || emp._id === employeeId
//     );
    
//     return {
//       department: employee?.department || employee?.departmentName || "N/A",
//       designation: employee?.designation || employee?.role || "N/A"
//     };
//   };

//   // ✅ Search Filter Logic
//   const filteredPermissions = permissions
//     .map(permission => {
//       // Enrich permission with employee details
//       const empDetails = getEmployeeDetails(permission.employeeId);
//       return {
//         ...permission,
//         department: empDetails.department,
//         designation: empDetails.designation
//       };
//     })
//     .filter((item) => {
//       const term = searchTerm.toLowerCase();
      
//       // Search by ID or Name
//       const matchesSearch = searchTerm.trim() === "" || (
//         item.employeeName?.toLowerCase().includes(term) ||
//         item.employeeId?.toLowerCase().includes(term) ||
//         item._id?.toLowerCase().includes(term)
//       );
      
//       // Filter by Department
//       const matchesDepartment = filterDepartment === "" || 
//         item.department === filterDepartment;
      
//       // Filter by Designation
//       const matchesDesignation = filterDesignation === "" || 
//         item.designation === filterDesignation;
      
//       return matchesSearch && matchesDepartment && matchesDesignation;
//     });

//   // Update pagination when filtered results change
//   useEffect(() => {
//     setPagination(prev => ({
//       ...prev,
//       totalCount: filteredPermissions.length,
//       totalPages: Math.ceil(filteredPermissions.length / prev.limit),
//       currentPage: 1
//     }));
//   }, [filteredPermissions.length, filterDepartment, filterDesignation, searchTerm]);

//   // ✅ Pagination Handlers
//   const handleItemsPerPageChange = (limit) => {
//     setPagination({
//       currentPage: 1,
//       limit: limit,
//       totalCount: filteredPermissions.length,
//       totalPages: Math.ceil(filteredPermissions.length / limit)
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

//   // Calculate pagination
//   const indexOfLastItem = pagination.currentPage * pagination.limit;
//   const indexOfFirstItem = indexOfLastItem - pagination.limit;
//   const currentItems = filteredPermissions.slice(indexOfFirstItem, indexOfLastItem);

//   // Clear all filters
//   const clearFilters = () => {
//     setSearchTerm("");
//     setFilterDepartment("");
//     setFilterDesignation("");
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="mx-auto max-w-9xl">
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <div className="flex items-center justify-center">
//               <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
//               <span className="ml-2 text-gray-600">Loading permissions...</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }
  
//   if (error) {
//     return (
//       <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="mx-auto max-w-9xl">
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <p className="text-red-600">{error}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-9xl">
//         {/* Filters */}
//         <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
//           <div className="flex flex-wrap items-center gap-2">
            
//             {/* ID/Name Search */}
//             <div className="relative flex-1 min-w-[180px]">
//               <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
//               <input
//                 type="text"
//                 placeholder="Search by ID or Name..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Department Filter Button */}
//             <div className="relative" ref={departmentFilterRef}>
//               <button
//                 onClick={() => setShowDepartmentFilter(!showDepartmentFilter)}
//                 className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
//                   filterDepartment 
//                     ? 'bg-blue-600 text-white hover:bg-blue-700' 
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
//                 }`}
//               >
//                 <FaBuilding className="text-xs" /> Dept {filterDepartment && `: ${filterDepartment}`}
//               </button>
              
//               {/* Department Filter Dropdown */}
//               {showDepartmentFilter && (
//                 <div className="absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
//                   <div 
//                     onClick={() => {
//                       setFilterDepartment('');
//                       setShowDepartmentFilter(false);
//                     }}
//                     className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer border-b border-gray-100 font-medium text-gray-700"
//                   >
//                     All Departments
//                   </div>
//                   {uniqueDepartments.map(dept => (
//                     <div 
//                       key={dept}
//                       onClick={() => {
//                         setFilterDepartment(dept);
//                         setShowDepartmentFilter(false);
//                       }}
//                       className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
//                         filterDepartment === dept ? 'bg-blue-50 text-blue-700 font-medium' : ''
//                       }`}
//                     >
//                       {dept}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Designation Filter Button */}
//             <div className="relative" ref={designationFilterRef}>
//               <button
//                 onClick={() => setShowDesignationFilter(!showDesignationFilter)}
//                 className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
//                   filterDesignation 
//                     ? 'bg-blue-600 text-white hover:bg-blue-700' 
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
//                 }`}
//               >
//                 <FaUserTag className="text-xs" /> Desig {filterDesignation && `: ${filterDesignation}`}
//               </button>
              
//               {/* Designation Filter Dropdown */}
//               {showDesignationFilter && (
//                 <div className="absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
//                   <div 
//                     onClick={() => {
//                       setFilterDesignation('');
//                       setShowDesignationFilter(false);
//                     }}
//                     className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer border-b border-gray-100 font-medium text-gray-700"
//                   >
//                     All Designations
//                   </div>
//                   {uniqueDesignations.map(des => (
//                     <div 
//                       key={des}
//                       onClick={() => {
//                         setFilterDesignation(des);
//                         setShowDesignationFilter(false);
//                       }}
//                       className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
//                         filterDesignation === des ? 'bg-blue-50 text-blue-700 font-medium' : ''
//                       }`}
//                     >
//                       {des}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* From Date */}
//             <div className="relative w-[130px]">
//               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
//                 From:
//               </span>
//               <input
//                 type="date"
//                 value={fromDate}
//                 onChange={(e) => setFromDate(e.target.value)}
//                 onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                 className="w-full pl-12 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//           {/* To Date */}
//             <div className="relative w-[130px]">
//               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
//                 To:
//               </span>
//               <input
//                 type="date"
//                 value={toDate}
//                 onChange={(e) => setToDate(e.target.value)}
//                 onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                 className="w-full pl-10 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//           {/* Month Selector */}
//             <div className="relative w-[130px]">
//               <FaCalendarAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
//               <input
//                 type="month"
//                 value={selectedMonth}
//                 onChange={(e) => setSelectedMonth(e.target.value)}
//                 onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                 className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Clear Filters Button */}
//             {(searchTerm || filterDepartment || filterDesignation) && (
//               <button
//                 onClick={clearFilters}
//                 className="h-8 px-3 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition"
//               >
//                 Clear
//               </button>
//             )}
//           </div>
//         </div>

//         {filteredPermissions.length === 0 ? (
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <p className="text-lg text-gray-500">No permission requests found</p>
//             <p className="mt-2 text-sm text-gray-400">
//               {(searchTerm || filterDepartment || filterDesignation) && "Try clearing search filters"}
//             </p>
//           </div>
//         ) : (
//           <>
//             {/* Permissions Table */}
//             <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
//               <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//                 <table className="min-w-full">
//                   <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
//                     <tr>
//                       <th className=" py-2 text-center">Employee ID</th>
//                       <th className=" py-2 text-center">Name</th>
//                       <th className=" py-2 text-center">Department</th>
//                       <th className=" py-2 text-center">Designation</th>
//                       <th className=" py-2 text-center">Date & Time</th>
//                       <th className=" py-2 text-center">Duration</th>
//                       <th className=" py-2 text-center">Reason</th>
//                       <th className=" py-2 text-center">Status</th>
//                       <th className=" py-2 text-center">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {currentItems.map((p) => (
//                       <tr key={p._id} className="transition-colors hover:bg-gray-50">
//                         <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
//                           {p.employeeId || "N/A"}
//                         </td>
//                         <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
//                           {p.employeeName}
//                         </td>
//                         <td className="px-2 py-2  text-center text-gray-600 ">
//                           {p.department}
//                         </td>
//                         <td className="px-2 py-2  text-center text-gray-600 ">
//                           {p.designation}
//                         </td>
//                         <td className="px-3 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
//                           {new Date(p.createdAt).toLocaleDateString()}
//                           <br />
//                           <span className="text-xs text-gray-500">
//                             {new Date(p.createdAt).toLocaleTimeString()}
//                           </span>
//                         </td>
//                         <td className="px-2 py-2 text-center ">
//                           <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
//                             {p.duration} mins
//                           </span>
//                         </td>
//                         <td className="max-w-xs px-2 py-2 text-sm text-center text-gray-700 truncate">
//                           "{p.reason}"
//                         </td>
//                         <td className="px-2 py-2 text-center ">
//                           <span
//                             className={`px-2 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
//                               p.status === "APPROVED"
//                                 ? "bg-green-100 text-green-700"
//                                 : p.status === "COMPLETED"
//                                 ? "bg-blue-100 text-blue-700"
//                                 : p.status === "PENDING"
//                                 ? "bg-yellow-100 text-yellow-700"
//                                 : "bg-red-100 text-red-700"
//                             }`}
//                           >
//                             {p.status === "COMPLETED" ? "IN DUTY" : p.status}
//                           </span>
//                         </td>
//                         <td className="px-2 py-2 text-center ">
//                           {p.status === "PENDING" ? (
//                             <button
//                               onClick={() => handleApprove(p._id)}
//                               className="px-3 py-1 text-xs font-semibold text-white transition-all bg-green-600 rounded-md shadow-sm hover:bg-green-700"
//                             >
//                               Approve
//                             </button>
//                           ) : p.status === "APPROVED" ? (
//                             <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-md">
//                               Active
//                             </span>
//                           ) : (
//                             <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-md">
//                               Processed
//                             </span>
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination */}
//               {filteredPermissions.length > 0 && (
//                 <div className="flex flex-col items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 sm:flex-row">
//                   {/* Left Side - Showing Info + Select */}
//                   <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
//                     <span>Showing</span>
//                     <span className="font-medium">
//                       {indexOfFirstItem + 1}
//                     </span>
//                     <span>to</span>
//                     <span className="font-medium">
//                       {Math.min(indexOfLastItem, filteredPermissions.length)}
//                     </span>
//                     <span>of</span>
//                     <span className="font-medium">
//                       {filteredPermissions.length}
//                     </span>
//                     <span>results</span>

//                     {/* Select Dropdown */}
//                     <select
//                       value={pagination.limit}
//                       onChange={(e) => {
//                         const newLimit = Number(e.target.value);
//                         handleItemsPerPageChange(newLimit);
//                       }}
//                       className="p-1 ml-2 text-sm border rounded-lg"
//                     >
//                       <option value={5}>5</option>
//                       <option value={10}>10</option>
//                       <option value={20}>20</option>
//                       <option value={50}>50</option>
//                     </select>
//                   </div>

//                   {/* Pagination buttons */}
//                   <div className="flex items-center gap-2 mt-2 sm:mt-0">
//                     <button
//                       onClick={handlePrevPage}
//                       disabled={pagination.currentPage === 1}
//                       className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
//                         pagination.currentPage === 1
//                           ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                           : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//                       }`}
//                     >
//                       Previous
//                     </button>

//                     <div className="flex items-center gap-1">
//                       {getPageNumbers().map((page, index) => (
//                         <button
//                           key={index}
//                           onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
//                           disabled={page === "..."}
//                           className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//                             page === "..."
//                               ? "text-gray-500 cursor-default"
//                               : pagination.currentPage === page
//                               ? "bg-blue-600 text-white"
//                               : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
//                           }`}
//                         >
//                           {page}
//                         </button>
//                       ))}
//                     </div>

//                     <button
//                       onClick={handleNextPage}
//                       disabled={pagination.currentPage === pagination.totalPages}
//                       className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
//                         pagination.currentPage === pagination.totalPages
//                           ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                           : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//                       }`}
//                     >
//                       Next
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };


import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag } from "react-icons/fa";
import { API_BASE_URL } from "../config";
import { isEmployeeHidden } from "../utils/employeeStatus";

const BASE_URL = API_BASE_URL;

export const Permissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Date filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

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

  // Pagination states
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

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch both permissions and employees data
      const [permissionsRes, employeesRes] = await Promise.all([
        axios.get(`${BASE_URL}/permissions/all`),
        axios.get(`${BASE_URL}/employees/get-employees`)
      ]);

      const permissionsData = permissionsRes.data || [];
      const employeesData = employeesRes.data || [];
      
      console.log("Permissions data:", permissionsData);
      console.log("Employees data:", employeesData);
      
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
      
      setPermissions(permissionsData);
      
      setPagination(prev => ({
        ...prev,
        totalCount: permissionsData.length,
        totalPages: Math.ceil(permissionsData.length / prev.limit),
        currentPage: 1
      }));
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("❌ Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to APPROVE this permission?")) return;

    try {
      const res = await axios.put(`${BASE_URL}/api/permissions/approve/${id}`);
      if (res.status === 200) {
        alert("✅ Permission Approved Successfully!");
        fetchAllData();
      }
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.message || err.message));
    }
  };

  // Get employee details by ID
  const getEmployeeDetails = (employeeId) => {
    const employee = employees.find(emp => 
      emp.employeeId === employeeId || emp._id === employeeId
    );
    
    return {
      department: employee?.department || employee?.departmentName || "N/A",
      designation: employee?.designation || employee?.role || "N/A"
    };
  };

  // Handle date range filter
  const handleDateRangeFilter = () => {
    if (!fromDate || !toDate) {
      alert("Please select both From and To dates");
      return;
    }
    
    // Apply date filter
    filterPermissions();
  };

  // Handle month change
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    setFromDate(""); // Reset date filters when month changes
    setToDate("");
  };

  // Apply all filters
  const filterPermissions = () => {
    let filtered = [...permissions];
    
    // Apply date range filter
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate >= from && itemDate <= to;
      });
    } else if (selectedMonth) {
      // Apply month filter
      const [year, month] = selectedMonth.split('-').map(Number);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate.getFullYear() === year && itemDate.getMonth() + 1 === month;
      });
    }
    
    setPagination(prev => ({
      ...prev,
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.limit),
      currentPage: 1
    }));
  };

  // ✅ Search Filter Logic
  const filteredPermissions = permissions
    .map(permission => {
      // Enrich permission with employee details
      const empDetails = getEmployeeDetails(permission.employeeId);
      return {
        ...permission,
        department: empDetails.department,
        designation: empDetails.designation
      };
    })
    .filter((item) => {
      const term = searchTerm.toLowerCase();
      
      // Search by ID or Name
      const matchesSearch = searchTerm.trim() === "" || (
        item.employeeName?.toLowerCase().includes(term) ||
        item.employeeId?.toLowerCase().includes(term) ||
        item._id?.toLowerCase().includes(term)
      );
      
      // Filter by Department
      const matchesDepartment = filterDepartment === "" || 
        item.department === filterDepartment;
      
      // Filter by Designation
      const matchesDesignation = filterDesignation === "" || 
        item.designation === filterDesignation;
      
      // Apply date filters
      let matchesDate = true;
      if (fromDate && toDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        const itemDate = new Date(item.createdAt);
        matchesDate = itemDate >= from && itemDate <= to;
      } else if (selectedMonth) {
        const [year, month] = selectedMonth.split('-').map(Number);
        const itemDate = new Date(item.createdAt);
        matchesDate = itemDate.getFullYear() === year && itemDate.getMonth() + 1 === month;
      }
      
      return matchesSearch && matchesDepartment && matchesDesignation && matchesDate;
    });

  // Update pagination when filtered results change
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      totalCount: filteredPermissions.length,
      totalPages: Math.ceil(filteredPermissions.length / prev.limit),
      currentPage: 1
    }));
  }, [filteredPermissions.length, filterDepartment, filterDesignation, searchTerm, fromDate, toDate, selectedMonth]);

  // ✅ Pagination Handlers
  const handleItemsPerPageChange = (limit) => {
    setPagination({
      currentPage: 1,
      limit: limit,
      totalCount: filteredPermissions.length,
      totalPages: Math.ceil(filteredPermissions.length / limit)
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

  // Calculate pagination
  const indexOfLastItem = pagination.currentPage * pagination.limit;
  const indexOfFirstItem = indexOfLastItem - pagination.limit;
  const currentItems = filteredPermissions.slice(indexOfFirstItem, indexOfLastItem);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterDesignation("");
    setFromDate("");
    setToDate("");
    setSelectedMonth(new Date().toISOString().slice(0, 7));
  };

  if (loading) {
    return (
      <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="mx-auto max-w-9xl">
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Loading permissions...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="mx-auto max-w-9xl">
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-9xl">
        {/* Filters */}
        <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* ID/Name Search */}
            <div className="relative flex-1 min-w-[180px]">
              <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
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
                <div className="absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div 
                    onClick={() => {
                      setFilterDepartment('');
                      setShowDepartmentFilter(false);
                    }}
                    className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer border-b border-gray-100 font-medium text-gray-700"
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
                <div className="absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div 
                    onClick={() => {
                      setFilterDesignation('');
                      setShowDesignationFilter(false);
                    }}
                    className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer border-b border-gray-100 font-medium text-gray-700"
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
                onChange={(e) => {
                  setFromDate(e.target.value);
                  if (e.target.value && toDate) {
                    handleDateRangeFilter();
                  }
                }}
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
                onChange={(e) => {
                  setToDate(e.target.value);
                  if (fromDate && e.target.value) {
                    handleDateRangeFilter();
                  }
                }}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-10 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Month Selector */}
            <div className="relative w-[130px]">
              <FaCalendarAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Apply Date Range Button */}
            <button
              onClick={handleDateRangeFilter}
              disabled={!fromDate || !toDate}
              className="h-8 px-3 text-xs font-medium text-white transition bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Date Range
            </button>

            {/* Clear Filters Button */}
            {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate || selectedMonth !== new Date().toISOString().slice(0, 7)) && (
              <button
                onClick={clearFilters}
                className="h-8 px-3 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {filteredPermissions.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <p className="text-lg text-gray-500">No permission requests found</p>
            <p className="mt-2 text-sm text-gray-400">
              {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate) && "Try clearing search filters"}
            </p>
          </div>
        ) : (
          <>
            {/* Permissions Table */}
            <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
              <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                <table className="min-w-full">
                  <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                    <tr>
                      <th className="py-2 text-center">Employee ID</th>
                      <th className="py-2 text-center">Name</th>
                      <th className="py-2 text-center">Department</th>
                      <th className="py-2 text-center">Designation</th>
                      <th className="py-2 text-center">Date & Time</th>
                      <th className="py-2 text-center">Duration</th>
                      <th className="py-2 text-center">Reason</th>
                      <th className="py-2 text-center">Status</th>
                      <th className="py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((p) => (
                      <tr key={p._id} className="transition-colors hover:bg-gray-50">
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {p.employeeId || "N/A"}
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {p.employeeName}
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600">
                          {p.department}
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600">
                          {p.designation}
                        </td>
                        <td className="px-3 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {new Date(p.createdAt).toLocaleDateString()}
                          <br />
                          <span className="text-xs text-gray-500">
                            {new Date(p.createdAt).toLocaleTimeString()}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                            {p.duration} mins
                          </span>
                        </td>
                        <td className="max-w-xs px-2 py-2 text-sm text-center text-gray-700 truncate">
                          "{p.reason}"
                        </td>
                        <td className="px-2 py-2 text-center">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
                              p.status === "APPROVED"
                                ? "bg-green-100 text-green-700"
                                : p.status === "COMPLETED"
                                ? "bg-blue-100 text-blue-700"
                                : p.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {p.status === "COMPLETED" ? "IN DUTY" : p.status}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center">
                          {p.status === "PENDING" ? (
                            <button
                              onClick={() => handleApprove(p._id)}
                              className="px-3 py-1 text-xs font-semibold text-white transition-all bg-green-600 rounded-md shadow-sm hover:bg-green-700"
                            >
                              Approve
                            </button>
                          ) : p.status === "APPROVED" ? (
                            <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-md">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-md">
                              Processed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredPermissions.length > 0 && (
                <div className="flex flex-col items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 sm:flex-row">
                  {/* Left Side - Showing Info + Select */}
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                    <span>Showing</span>
                    <span className="font-medium">
                      {indexOfFirstItem + 1}
                    </span>
                    <span>to</span>
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredPermissions.length)}
                    </span>
                    <span>of</span>
                    <span className="font-medium">
                      {filteredPermissions.length}
                    </span>
                    <span>results</span>

                    {/* Select Dropdown */}
                    <select
                      value={pagination.limit}
                      onChange={(e) => {
                        const newLimit = Number(e.target.value);
                        handleItemsPerPageChange(newLimit);
                      }}
                      className="p-1 ml-2 text-sm border rounded-lg"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  {/* Pagination buttons */}
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={handlePrevPage}
                      disabled={pagination.currentPage === 1}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        pagination.currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((page, index) => (
                        <button
                          key={index}
                          onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
                          disabled={page === "..."}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
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
          </>
        )}
      </div>
    </div>
  );
};