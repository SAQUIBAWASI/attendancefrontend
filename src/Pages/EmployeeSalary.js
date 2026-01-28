// import { ArrowLeft, Eye, FileText } from "lucide-react";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function EmployeeDashboard() {
//   const [records, setRecords] = useState([]);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const navigate = useNavigate();

//   const BASE_URL = "https://api.timelyhealth.in";

//   // ✅ Correct useEffect (Attendance Summary Fetch)
//   useEffect(() => {
//     const fetchAttendanceSummary = async () => {
//       try {
//         const employeeData = JSON.parse(localStorage.getItem("employeeData"));
//         const employeeId = employeeData?.employeeId;

//         if (!employeeId) {
//           setError("❌ Employee ID not found. Please log in again.");
//           setLoading(false);
//           return;
//         }

//         const res = await fetch(
//           `${BASE_URL}/api/attendanceSummary/getattendancesummary?employeeId=${employeeId}`
//         );
//         const data = await res.json();

//         if (!res.ok) throw new Error(data.message || "Failed to fetch summary");

//         const summary = data.summary || [];

//         // Sort by latest month first
//         const sortedSummary = summary.sort(
//           (a, b) => new Date(b.date) - new Date(a.date)
//         );

//         setRecords(sortedSummary);
//       } catch (err) {
//         console.error("Summary fetch error:", err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAttendanceSummary();
//   }, []);

//   return (
//     <div className="min-h-screen p-6 bg-gray-100">

//       {/* Back Button */}
//       <button
//         onClick={() => navigate("/employeedashboard")}
//         className="flex items-center gap-2 px-4 py-2 mb-4 text-white transition bg-gray-700 rounded-lg hover:bg-gray-800"
//       >
//         <ArrowLeft size={18} /> Back
//       </button>

//       <div className="p-6 bg-white shadow-lg rounded-xl">
//         <h2 className="mb-6 text-xl font-bold">My Salary Details</h2>

//         {loading && <p className="text-center text-gray-500">Loading...</p>}
//         {error && <p className="text-center text-red-500">{error}</p>}

//         <table className="w-full text-left border-collapse">
//           <thead>
//             <tr className="text-white bg-blue-600">
//               <th className="p-3">ID</th>
//               <th className="p-3">Name</th>
//               <th className="p-3">Present</th>
//               <th className="p-3">Late Days</th>
//               <th className="p-3">Half Days</th>
//               <th className="p-3">Salary</th>
//               <th className="p-3">Month</th>
//               <th className="p-3">Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {records.map((emp, index) => (
//               <tr
//                 key={index}
//                 className="text-gray-700 transition border-b hover:bg-gray-50"
//               >
//                 <td className="p-3">{emp.employeeId}</td>

//                 <td className="flex items-center gap-3 p-3">
//                   <div className="flex items-center justify-center w-10 h-10 font-bold text-blue-700 bg-blue-100 rounded-full">
//                     {emp.name?.charAt(0)}
//                   </div>
//                   {emp.name}
//                 </td>

//                 <td className="p-3">
//                   <div className="px-4 py-1 font-semibold text-green-700 bg-green-100 rounded-full w-fit">
//                     {emp.presentDays}
//                   </div>
//                 </td>

//                 <td className="p-3">
//                   <div className="px-4 py-1 font-semibold text-blue-700 bg-blue-100 rounded-full w-fit">
//                     {emp.lateDays}
//                   </div>
//                 </td>

//                 <td className="p-3">
//                   <div className="px-4 py-1 font-semibold text-yellow-600 bg-yellow-100 rounded-full w-fit">
//                     {emp.halfDays}
//                   </div>
//                 </td>

//                 <td className="p-3 font-bold text-green-700">
//                   ₹{emp.calculatedSalary}
//                 </td>

//                 <td className="p-3">{emp.month}</td>

//                 <td className="flex gap-3 p-3">
//                   <button
//                     onClick={() =>
//                       navigate(`/employee-details/${emp.employeeId}`, {
//                         state: emp,
//                       })
//                     }
//                     className="p-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
//                   >
//                     <Eye size={18} />
//                   </button>

//                   <button
//                     onClick={() =>
//                       navigate(`/employee-slip/${emp.employeeId}`, {
//                         state: emp,
//                       })
//                     }
//                     className="p-2 text-white bg-purple-500 rounded-lg hover:bg-purple-600"
//                   >
//                     <FileText size={18} />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {!loading && records.length === 0 && (
//           <p className="p-6 text-center text-gray-500">No records found.</p>
//         )}
//       </div>
//     </div>
//   );
// }


// import { ArrowLeft, Eye, FileText, X } from "lucide-react";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function EmployeeDashboard() {
//   const [records, setRecords] = useState([]);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const recordsPerPage = 10;

//   const navigate = useNavigate();
//   const BASE_URL = "https://api.timelyhealth.in";

//   // ✅ Get current logged-in employee data
//   const getCurrentEmployee = () => {
//     const employeeData = JSON.parse(localStorage.getItem("employeeData"));
//     return employeeData;
//   };

//   // ✅ Fetch salary data for current employee only
//   useEffect(() => {
//     const fetchSalaryData = async () => {
//       try {
//         const employeeData = getCurrentEmployee();
//         const employeeId = employeeData?.employeeId;

//         if (!employeeId) {
//           setError("❌ Employee ID not found. Please log in again.");
//           setLoading(false);
//           return;
//         }

//         console.log("📥 Fetching salary data for employee:", employeeId);

//         // Fetch ALL salaries first
//         const salaryRes = await fetch(`${BASE_URL}/api/attendancesummary/getsalaries`);

//         if (!salaryRes.ok) {
//           throw new Error(`Failed to fetch salary data: ${salaryRes.status}`);
//         }

//         const salaryData = await salaryRes.json();
//         console.log("💰 All Salaries API Response:", salaryData);

//         let employeeSalaryRecords = [];

//         if (salaryData.success && salaryData.salaries && salaryData.salaries.length > 0) {
//           // Filter only current employee's records
//           employeeSalaryRecords = salaryData.salaries
//             .filter(salary => salary.employeeId === employeeId)
//             .map(salary => ({
//               employeeId: salary.employeeId,
//               name: salary.name,
//               presentDays: salary.presentDays || 0,
//               lateDays: salary._debug?.lateDays || 0,
//               halfDays: salary.halfDayWorking || 0,
//               calculatedSalary: salary.calculatedSalary || 0,
//               month: salary.month || "Not specified",
//               workingDays: salary.workingDays || 0,
//               weekOffs: salary.weekOffs || 0,
//               totalLeaves: salary.totalLeaves || 0,
//               salaryPerMonth: salary.salaryPerMonth || 0,
//               salaryPerDay: salary.salaryPerDay || 0
//             }));
//         }

//         // If no data from salary API, try fallback
//         if (employeeSalaryRecords.length === 0) {
//           console.log("🔄 Trying fallback API for employee:", employeeId);
//           const summaryRes = await fetch(
//             `${BASE_URL}/api/attendancesummary/get?employeeId=${employeeId}`
//           );

//           if (summaryRes.ok) {
//             const summaryData = await summaryRes.json();
//             const summary = summaryData.summary || [];

//             employeeSalaryRecords = summary
//               .filter(item => item.employeeId === employeeId)
//               .map(item => ({
//                 employeeId: item.employeeId,
//                 name: item.name,
//                 presentDays: item.presentDays || 0,
//                 lateDays: item.lateDays || 0,
//                 halfDays: item.halfDayWorking || 0,
//                 calculatedSalary: item.calculatedSalary || 0,
//                 month: item.month || "Not specified",
//                 workingDays: item.workingDays || 0,
//                 weekOffs: item.weekOffs || 0
//               }));
//           }
//         }

//         // Sort by latest month first
//         const sortedRecords = employeeSalaryRecords.sort((a, b) => {
//           const monthA = a.month || "";
//           const monthB = b.month || "";
//           return monthB.localeCompare(monthA);
//         });

//         console.log("✅ Current Employee Salary Records:", sortedRecords);
//         setRecords(sortedRecords);
//         setFilteredRecords(sortedRecords);

//       } catch (err) {
//         console.error("❌ Salary fetch error:", err);
//         setError(err.message || "Failed to load salary data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSalaryData();
//   }, []);

//   // ✅ Filter records based on search (only for current employee)
//   useEffect(() => {
//     const filtered = records.filter(record =>
//       record.month?.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     setFilteredRecords(filtered);
//     setCurrentPage(1);
//   }, [searchTerm, records]);

//   // ✅ Pagination calculations
//   const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
//   const indexOfLastRecord = currentPage * recordsPerPage;
//   const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
//   const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);

//   const handlePrevious = () => {
//     if (currentPage > 1) setCurrentPage(currentPage - 1);
//   };

//   const handleNext = () => {
//     if (currentPage < totalPages) setCurrentPage(currentPage + 1);
//   };

//   const handlePageClick = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   const getPageNumbers = () => {
//     const pageNumbers = [];
//     const maxVisiblePages = 5;

//     if (totalPages <= maxVisiblePages) {
//       for (let i = 1; i <= totalPages; i++) {
//         pageNumbers.push(i);
//       }
//     } else {
//       const startPage = Math.max(1, currentPage - 2);
//       const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

//       for (let i = startPage; i <= endPage; i++) {
//         pageNumbers.push(i);
//       }
//     }

//     return pageNumbers;
//   };

//   // ✅ Handle view details - OPEN MODAL (no navigation)
//   const handleViewDetails = (employee) => {
//     setSelectedEmployee(employee);
//     setShowDetailsModal(true);
//   };

//   // ✅ Close modal
//   const handleCloseModal = () => {
//     setShowDetailsModal(false);
//     setSelectedEmployee(null);
//   };

//   // ✅ Generate salary slip HTML
//   const generateSalarySlipHTML = (employee) => {
//     const currentEmployee = getCurrentEmployee();

//     return `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <title>Salary Slip - ${currentEmployee?.name || employee.name}</title>
//         <style>
//           body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
//           .slip-container { max-width: 800px; margin: 0 auto; border: 2px solid #3b82f6; border-radius: 10px; padding: 30px; }
//           .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
//           .company-name { font-size: 28px; font-weight: bold; color: #3b82f6; margin-bottom: 5px; }
//           .slip-title { font-size: 24px; font-weight: bold; margin: 20px 0; }
//           .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
//           .detail-item { margin-bottom: 10px; }
//           .detail-label { font-weight: bold; color: #666; }
//           .salary-breakdown { margin: 30px 0; }
//           .breakdown-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
//           .breakdown-table th, .breakdown-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
//           .breakdown-table th { background-color: #3b82f6; color: white; }
//           .total-row { font-weight: bold; background-color: #f8fafc; }
//           .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #3b82f6; color: #666; }
//           .signature { margin-top: 50px; display: flex; justify-content: space-between; }
//           .signature-box { width: 200px; border-top: 1px solid #333; padding-top: 10px; text-align: center; }
//         </style>
//       </head>
//       <body>
//         <div class="slip-container">
//           <div class="header">
//             <div class="company-name">TECH SOLUTIONS LTD</div>
//             <div>123 Tech Park, Innovation City, IC 12345</div>
//             <div>Phone: (123) 456-7890 | Email: hr@techsolutions.com</div>
//           </div>

//           <div class="slip-title">SALARY SLIP</div>

//           <div class="details-grid">
//             <div>
//               <div class="detail-item">
//                 <span class="detail-label">Employee ID:</span> ${currentEmployee?.employeeId || employee.employeeId}
//               </div>
//               <div class="detail-item">
//                 <span class="detail-label">Employee Name:</span> ${currentEmployee?.name || employee.name}
//               </div>
//               <div class="detail-item">
//                 <span class="detail-label">Month:</span> ${employee.month}
//               </div>
//             </div>
//             <div>
//               <div class="detail-item">
//                 <span class="detail-label">Issue Date:</span> ${new Date().toLocaleDateString()}
//               </div>
//               <div class="detail-item">
//                 <span class="detail-label">Slip No:</span> SLIP-${currentEmployee?.employeeId || employee.employeeId}-${new Date().getTime()}
//               </div>
//             </div>
//           </div>

//           <div class="salary-breakdown">
//             <h3>Salary Breakdown - ${employee.month}</h3>
//             <table class="breakdown-table">
//               <thead>
//                 <tr>
//                   <th>Particulars</th>
//                   <th>Details</th>
//                   <th>Amount</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr>
//                   <td>Present Days</td>
//                   <td>${employee.presentDays || 0} days</td>
//                   <td>-</td>
//                 </tr>
//                 <tr>
//                   <td>Working Days</td>
//                   <td>${employee.workingDays || 0} days</td>
//                   <td>-</td>
//                 </tr>
//                 <tr>
//                   <td>Half Days</td>
//                   <td>${employee.halfDays || 0} days</td>
//                   <td>-</td>
//                 </tr>
//                 <tr>
//                   <td>WeekOff Days</td>
//                   <td>${employee.weekOffs || 0} days</td>
//                   <td>-</td>
//                 </tr>
//                 <tr>
//                   <td>Late Days</td>
//                   <td>${employee.lateDays || 0} days</td>
//                   <td>-</td>
//                 </tr>
//                 <tr>
//                   <td>Total Leaves</td>
//                   <td>${employee.totalLeaves || 0} days</td>
//                   <td>-</td>
//                 </tr>
//                 ${employee.salaryPerMonth ? `
//                 <tr>
//                   <td>Monthly Salary</td>
//                   <td>-</td>
//                   <td>₹${employee.salaryPerMonth}</td>
//                 </tr>
//                 ` : ''}
//                 ${employee.salaryPerDay ? `
//                 <tr>
//                   <td>Daily Rate</td>
//                   <td>-</td>
//                   <td>₹${employee.salaryPerDay}/day</td>
//                 </tr>
//                 ` : ''}
//                 <tr class="total-row">
//                   <td colspan="2"><strong>Final Salary</strong></td>
//                   <td><strong>₹${employee.calculatedSalary || 0}</strong></td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>

//           <div class="signature">
//             <div class="signature-box">
//               Employee Signature
//             </div>
//             <div class="signature-box">
//               Authorized Signature
//             </div>
//           </div>

//           <div class="footer">
//             This is a computer generated slip and does not require signature.
//           </div>
//         </div>
//       </body>
//       </html>
//     `;
//   };

//   // ✅ Download salary slip
//   const downloadSalarySlip = (employee) => {
//     const slipContent = generateSalarySlipHTML(employee);
//     const printWindow = window.open('', '_blank');
//     printWindow.document.write(slipContent);
//     printWindow.document.close();
//     printWindow.print();
//   };

//   const currentEmployee = getCurrentEmployee();

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-lg font-semibold text-blue-600">Loading your salary data...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="p-4 text-red-600 bg-red-100 rounded-lg">
//           <p className="font-semibold">Error: {error}</p>
//           <button 
//             onClick={() => window.location.reload()}
//             className="px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-7xl">

//         {/* Header Section */}
//         <div className="mb-8">
//           <button
//             onClick={() => navigate("/employeedashboard")}
//             className="flex items-center gap-2 px-4 py-2 mb-4 text-white transition bg-gray-700 rounded-lg hover:bg-gray-800"
//           >
//             <ArrowLeft size={18} /> Back to Dashboard
//           </button>
//           <h1 className="mb-2 text-3xl font-bold text-gray-800">
//             My Salary History - {currentEmployee?.name || 'Employee'}
//           </h1>
//           <p className="text-gray-600">View your salary details and download salary slips</p>
//         </div>

//         {/* Search Section */}
//         <div className="p-6 mb-6 bg-white border border-blue-200 shadow-lg rounded-2xl">
//           <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
//             <div className="flex-1 w-full">
//               <div className="relative">
//                 <input
//                   type="text"
//                   placeholder="Search by Month..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//                 <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//                   <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                   </svg>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Stats Overview - Only for current employee */}
//         <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
//           <div className="p-6 bg-white border-l-4 border-blue-500 shadow-lg rounded-2xl">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Total Salary Records</p>
//                 <p className="text-2xl font-bold text-gray-800">{filteredRecords.length}</p>
//               </div>
//               <div className="p-3 bg-blue-100 rounded-full">
//                 <FileText className="w-6 h-6 text-blue-600" />
//               </div>
//             </div>
//           </div>

//           <div className="p-6 bg-white border-l-4 border-green-500 shadow-lg rounded-2xl">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Latest Salary</p>
//                 <p className="text-2xl font-bold text-gray-800">
//                   ₹{records[0]?.calculatedSalary || 0}
//                 </p>
//               </div>
//               <div className="p-3 bg-green-100 rounded-full">
//                 <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           <div className="p-6 bg-white border-l-4 border-purple-500 shadow-lg rounded-2xl">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Active Months</p>
//                 <p className="text-2xl font-bold text-gray-800">
//                   {filteredRecords.filter(emp => (emp.presentDays || 0) > 0).length}
//                 </p>
//               </div>
//               <div className="p-3 bg-purple-100 rounded-full">
//                 <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Table Container - Only current employee data */}
//         <div className="overflow-hidden bg-white border border-blue-200 shadow-xl rounded-2xl">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="text-white bg-gradient-to-r from-blue-600 to-indigo-700">
//                 <tr>
//                   <th className="p-4 font-semibold text-left">Employee ID</th>
//                   <th className="p-4 font-semibold text-left">Name</th>
//                   <th className="p-4 font-semibold text-center">Present Days</th>
//                   <th className="p-4 font-semibold text-center">Late Days</th>
//                   <th className="p-4 font-semibold text-center">Half Days</th>
//                   <th className="p-4 font-semibold text-center">Salary</th>
//                   <th className="p-4 font-semibold text-center">Month</th>
//                   <th className="p-4 font-semibold text-center">Actions</th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-gray-200">
//                 {currentRecords.length === 0 ? (
//                   <tr>
//                     <td colSpan="8" className="p-8 text-center">
//                       <div className="flex flex-col items-center justify-center text-gray-500">
//                         <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                         <p className="text-lg font-medium">No salary records found for you</p>
//                         <p className="text-sm">Contact HR if you believe this is an error</p>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   currentRecords.map((emp, index) => (
//                     <tr 
//                       key={index} 
//                       className={`hover:bg-blue-50 transition duration-150 ${
//                         index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
//                       }`}
//                     >
//                       <td className="p-4 font-medium text-gray-900">
//                         {emp.employeeId}
//                       </td>

//                       <td className="p-4">
//                         <div className="flex items-center">
//                           <div className="flex items-center justify-center w-8 h-8 mr-3 font-semibold text-blue-800 bg-blue-100 rounded-full">
//                             {currentEmployee?.name?.charAt(0) || emp.name?.charAt(0) || 'E'}
//                           </div>
//                           <span className="font-medium text-gray-800">{currentEmployee?.name || emp.name}</span>
//                         </div>
//                       </td>

//                       <td className="p-4 text-center">
//                         <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
//                           {emp.presentDays || 0}
//                         </span>
//                       </td>

//                       <td className="p-4 text-center">
//                         <span className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
//                           {emp.lateDays || 0}
//                         </span>
//                       </td>

//                       <td className="p-4 text-center">
//                         <span className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
//                           {emp.halfDays || 0}
//                         </span>
//                       </td>

//                       <td className="p-4 font-semibold text-center text-green-700">
//                         ₹{emp.calculatedSalary || 0}
//                       </td>

//                       <td className="p-4 text-center text-gray-600">
//                         {emp.month || "-"}
//                       </td>

//                       <td className="p-4 text-center">
//                         <div className="flex justify-center space-x-2">
//                           <button
//                             onClick={() => handleViewDetails(emp)}
//                             className="p-2 text-white transition duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
//                             title="View Details"
//                           >
//                             <Eye size={16} />
//                           </button>

//                           <button
//                             onClick={() => downloadSalarySlip(emp)}
//                             className="p-2 text-white transition duration-200 bg-purple-500 rounded-lg hover:bg-purple-600"
//                             title="Download Salary Slip"
//                           >
//                             <FileText size={16} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {filteredRecords.length > 0 && (
//             <div className="px-6 py-4 bg-white border-t border-gray-200">
//               <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
//                 <div className="text-sm text-gray-600">
//                   Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredRecords.length)} of {filteredRecords.length} entries
//                 </div>

//                 <div className="flex items-center space-x-2">
//                   <button
//                     onClick={handlePrevious}
//                     disabled={currentPage === 1}
//                     className={`px-4 py-2 rounded-lg border ${
//                       currentPage === 1 
//                         ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
//                         : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
//                     }`}
//                   >
//                     Previous
//                   </button>

//                   <div className="flex space-x-1">
//                     {getPageNumbers().map(pageNumber => (
//                       <button
//                         key={pageNumber}
//                         onClick={() => handlePageClick(pageNumber)}
//                         className={`px-4 py-2 rounded-lg border ${
//                           currentPage === pageNumber
//                             ? 'bg-blue-600 text-white border-blue-600'
//                             : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
//                         }`}
//                       >
//                         {pageNumber}
//                       </button>
//                     ))}
//                   </div>

//                   <button
//                     onClick={handleNext}
//                     disabled={currentPage === totalPages}
//                     className={`px-4 py-2 rounded-lg border ${
//                       currentPage === totalPages
//                         ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                         : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
//                     }`}
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ✅ Details Modal - Same Page Par Hi Show Hoga */}
//       {showDetailsModal && selectedEmployee && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold text-gray-800">
//                 Salary Details - {selectedEmployee.month}
//               </h2>
//               <button 
//                 onClick={handleCloseModal}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X size={24} />
//               </button>
//             </div>

//             <div className="p-4 mb-4 rounded-lg bg-gray-50">
//               <div className="flex items-center space-x-4">
//                 <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
//                   <span className="text-lg font-semibold text-blue-800">
//                     {currentEmployee?.name?.charAt(0) || selectedEmployee.name?.charAt(0) || 'E'}
//                   </span>
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-800">
//                     {currentEmployee?.name || selectedEmployee.name}
//                   </h3>
//                   <p className="text-sm text-gray-600">ID: {selectedEmployee.employeeId}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4 mb-6">
//               <div className="p-3 bg-white border rounded-lg">
//                 <p className="text-sm text-gray-600">Present Days</p>
//                 <p className="text-lg font-semibold text-green-600">{selectedEmployee.presentDays || 0}</p>
//               </div>
//               <div className="p-3 bg-white border rounded-lg">
//                 <p className="text-sm text-gray-600">Working Days</p>
//                 <p className="text-lg font-semibold text-blue-600">{selectedEmployee.workingDays || 0}</p>
//               </div>
//               <div className="p-3 bg-white border rounded-lg">
//                 <p className="text-sm text-gray-600">Half Days</p>
//                 <p className="text-lg font-semibold text-yellow-600">{selectedEmployee.halfDays || 0}</p>
//               </div>
//               <div className="p-3 bg-white border rounded-lg">
//                 <p className="text-sm text-gray-600">WeekOff Days</p>
//                 <p className="text-lg font-semibold text-purple-600">{selectedEmployee.weekOffs || 0}</p>
//               </div>
//               <div className="p-3 bg-white border rounded-lg">
//                 <p className="text-sm text-gray-600">Late Days</p>
//                 <p className="text-lg font-semibold text-red-600">{selectedEmployee.lateDays || 0}</p>
//               </div>
//               <div className="p-3 bg-white border rounded-lg">
//                 <p className="text-sm text-gray-600">Total Leaves</p>
//                 <p className="text-lg font-semibold text-orange-600">{selectedEmployee.totalLeaves || 0}</p>
//               </div>
//               <div className="p-3 bg-white border rounded-lg">
//                 <p className="text-sm text-gray-600">Month</p>
//                 <p className="text-lg font-semibold text-gray-800">{selectedEmployee.month || 'Not specified'}</p>
//               </div>
//               <div className="p-3 bg-white border rounded-lg">
//                 <p className="text-sm text-gray-600">Calculated Salary</p>
//                 <p className="text-lg font-semibold text-green-600">₹{selectedEmployee.calculatedSalary || 0}</p>
//               </div>
//             </div>

//             {selectedEmployee.salaryPerMonth && (
//               <div className="p-4 mb-4 rounded-lg bg-blue-50">
//                 <h3 className="mb-2 text-lg font-semibold text-blue-800">Salary Information</h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-gray-600">Monthly Salary</p>
//                     <p className="text-lg font-semibold text-blue-700">₹{selectedEmployee.salaryPerMonth}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Daily Rate</p>
//                     <p className="text-lg font-semibold text-blue-700">₹{selectedEmployee.salaryPerDay}/day</p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="flex justify-end pt-4 border-t border-gray-200">
//               <button 
//                 onClick={handleCloseModal}
//                 className="px-6 py-2 text-white transition duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import axios from "axios";
import { Calendar, Download, Eye, FileText, RefreshCw, Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../Images/Timely-Health-Logo.png";

export default function EmployeeDashboard() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const [employeesMasterData, setEmployeesMasterData] = useState({});
  const [employeeLeaves, setEmployeeLeaves] = useState({});
  const [monthDays, setMonthDays] = useState(30);
  const [monthInfo, setMonthInfo] = useState({
    isHistorical: false,
    isCurrent: false,
    includeWeekOff: false,
    canDownload: false
  });

  const recordsPerPage = 10;
  const navigate = useNavigate();
  const BASE_URL = "https://api.timelyhealth.in";

  // ✅ Get current logged-in employee data
  const getCurrentEmployee = () => {
    const employeeData = JSON.parse(localStorage.getItem("employeeData"));
    return employeeData || {};
  };

  // ✅ Check if month is historical
  const isHistoricalMonth = (month) => {
    if (!month) return false;
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    
    const [year, monthNum] = month.split('-').map(Number);
    
    if (year < currentYear) return true;
    if (year === currentYear && monthNum < currentMonth) return true;
    
    return false;
  };

  // ✅ Check if month is current month
  const isCurrentMonth = (month) => {
    if (!month) return true;
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    
    const [year, monthNum] = month.split('-').map(Number);
    
    return year === currentYear && monthNum === currentMonth;
  };

  // ✅ Check if week-off should be included in salary
  const shouldIncludeWeekOffInSalary = (month) => {
    if (isHistoricalMonth(month)) return true;
    
    if (isCurrentMonth(month)) {
      const today = new Date();
      const currentDay = today.getDate();
      return currentDay >= 26;
    }
    
    return true;
  };

  // ✅ Check if payslip download is allowed
  const isPayslipDownloadAllowed = (month) => {
    if (isHistoricalMonth(month)) return true;
    
    if (isCurrentMonth(month)) {
      const today = new Date();
      const currentDay = today.getDate();
      return currentDay >= 30;
    }
    
    return true;
  };

  // ✅ Process Leaves Data
  const processLeavesData = useCallback((leavesData) => {
    const leavesMap = {};

    leavesData.forEach(leave => {
      const employeeId = leave.employeeId;
      if (!employeeId) return;

      if (!leavesMap[employeeId]) {
        leavesMap[employeeId] = {
          CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0, leaveDetails: []
        };
      }

      const leaveType = leave.leaveType || 'Other';
      const duration = calculateLeaveDuration(leave.startDate, leave.endDate);

      if (leavesMap[employeeId][leaveType] !== undefined) {
        leavesMap[employeeId][leaveType] += duration;
      } else {
        leavesMap[employeeId].Other += duration;
      }

      leavesMap[employeeId].leaveDetails.push({
        type: leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        days: duration,
        reason: leave.reason || '',
        status: leave.status || 'pending'
      });
    });

    setEmployeeLeaves(leavesMap);
  }, []);

  const calculateLeaveDuration = (fromDate, toDate) => {
    if (!fromDate) return 0;
    const start = new Date(fromDate);
    const end = toDate ? new Date(toDate) : new Date(fromDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // ✅ Fetch Master Data (Employees & Leaves)
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [empRes, leavesRes] = await Promise.all([
          fetch(`${BASE_URL}/api/employees/get-employees`).catch(() => ({ ok: false })),
          fetch(`${BASE_URL}/api/leaves/leaves?status=approved`).catch(() => ({ ok: false }))
        ]);

        if (empRes.ok) {
          const employees = await empRes.json();
          const empMap = {};
          employees.forEach(emp => {
            empMap[emp.employeeId] = {
              salaryPerMonth: emp.salaryPerMonth || 0,
              shiftHours: emp.shiftHours || 8,
              weekOffPerMonth: emp.weekOffPerMonth || 0,
              name: emp.name,
              employeeId: emp.employeeId,
              department: emp.department || '',
              designation: emp.role || emp.designation || '',
              joiningDate: emp.joinDate || emp.joiningDate || '',
              bankAccount: emp.bankAccount || '',
              panCard: emp.panCard || '',
              weekOffDay: emp.weekOffDay || '',
              weekOffType: emp.weekOffType || '0+4'
            };
          });
          setEmployeesMasterData(empMap);
        }

        if (leavesRes.ok) {
          const leaves = await leavesRes.json();
          processLeavesData(leaves);
        }
      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    };

    fetchMasterData();
  }, [processLeavesData]);

  // ✅ Helper to get Employee Data
  const getEmployeeData = (employee) => {
    return employeesMasterData[employee.employeeId] || {
      salaryPerMonth: employee.salaryPerMonth || 0,
      shiftHours: 8,
      weekOffPerMonth: employee.weekOffs || 0,
      name: employee.name || '',
      designation: '',
      department: '',
      joiningDate: '',
      employeeId: employee.employeeId
    };
  };

  // ✅ Calculate Daily Rate
  const calculateDailyRate = (employee) => {
    const empData = getEmployeeData(employee);
    if (!empData || !empData.salaryPerMonth) return 0;
    const daysInMonth = employee.monthDays || monthDays || 30;
    return (empData.salaryPerMonth / daysInMonth).toFixed(2);
  };

  // ✅ Format month for display
  const formatMonthDisplay = (monthStr) => {
    if (!monthStr || monthStr === "Not specified") return "Current Month";
    const [year, month] = monthStr.split("-");
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // ✅ Format month for API (YYYY-MM)
  const formatMonthForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  // ✅ Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    const today = new Date();
    return formatMonthForAPI(today);
  };

  // ✅ Generate list of last 12 months
  const generateLast12Months = () => {
    const months = [];
    const today = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = formatMonthForAPI(date);
      const displayStr = formatMonthDisplay(monthStr);
      months.push({ value: monthStr, display: displayStr });
    }

    return months;
  };

  // ✅ Fetch salary data for current employee
  const fetchSalaryData = async (month = "") => {
    try {
      setLoading(true);
      setIsLoadingMonth(true);
      setError(null);

      const employeeData = getCurrentEmployee();
      const employeeId = employeeData?.employeeId;

      if (!employeeId) {
        setError("❌ Employee ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      console.log("📥 Fetching salary data for employee:", employeeId, "Month:", month || "Current");

      // Update month info
      const isHistorical = isHistoricalMonth(month);
      const isCurrent = isCurrentMonth(month);
      const includeWeekOff = shouldIncludeWeekOffInSalary(month);
      const canDownload = isPayslipDownloadAllowed(month);

      setMonthInfo({
        isHistorical,
        isCurrent,
        includeWeekOff,
        canDownload
      });

      // Fetch salary data with or without month filter
      const salaryUrl = month 
        ? `${BASE_URL}/api/attendancesummary/getsalaries?month=${month}`
        : `${BASE_URL}/api/attendancesummary/getsalaries`;

      const salaryRes = await fetch(salaryUrl);
      
      if (!salaryRes.ok) {
        throw new Error(`Failed to fetch salary data: ${salaryRes.status}`);
      }

      const salaryData = await salaryRes.json();
      console.log("💰 Salary API Response:", salaryData);

      let employeeSalaryRecords = [];

      if (salaryData.success && salaryData.salaries && salaryData.salaries.length > 0) {
        // Filter only current employee's records
        employeeSalaryRecords = salaryData.salaries
          .filter(salary => salary.employeeId === employeeId)
          .map(salary => {
            const actualWeekOffDays = salary.weekOffs || 0;
            const weekOffDaysForSalary = includeWeekOff ? actualWeekOffDays : 0;
            
            // Adjust calculated salary if week-off not included
            let calculatedSalary = salary.calculatedSalary || 0;
            if (!includeWeekOff && calculatedSalary > 0) {
              const daysInMonth = salaryData.monthDays || 30;
              const dailyRate = (salary.salaryPerMonth || 0) / daysInMonth;
              const weekOffAmount = actualWeekOffDays * dailyRate;
              calculatedSalary = Math.max(0, calculatedSalary - weekOffAmount);
            }

            return {
              ...salary,
              employeeId: salary.employeeId,
              name: salary.name,
              presentDays: salary.presentDays || 0,
              workingDays: salary.totalWorkingDays || salary.workingDays || 0,
              totalWorkingDays: salary.totalWorkingDays || salary.workingDays || 0,
              halfDays: salary.halfDayWorking || 0,
              calculatedSalary: calculatedSalary,
              month: salary.month || month || "Not specified",
              monthFormatted: formatMonthDisplay(salary.month || month),
              weekOffs: actualWeekOffDays,
              weekOffsForSalary: weekOffDaysForSalary,
              totalLeaves: salary.totalLeaves || 0,
              salaryPerMonth: salary.salaryPerMonth || 0,
              extraWork: salary.extraWork || {},
              monthDays: salaryData.monthDays || 30,
              isHistoricalMonth: isHistorical,
              isCurrentMonth: isCurrent,
              includeWeekOffInSalary: includeWeekOff,
              canDownload: canDownload
            };
          });

        if (salaryData.monthDays) {
          setMonthDays(salaryData.monthDays);
        }
      }

      // Sort by latest month first
      const sortedRecords = employeeSalaryRecords.sort((a, b) => {
        const monthA = a.month || "";
        const monthB = b.month || "";
        return monthB.localeCompare(monthA);
      });

      console.log("✅ Employee Salary Records:", sortedRecords);

      setRecords(sortedRecords);
      setFilteredRecords(sortedRecords);

    } catch (err) {
      console.error("❌ Salary fetch error:", err);
      setError(err.message || "Failed to load salary data");
    } finally {
      setLoading(false);
      setIsLoadingMonth(false);
    }
  };

  // ✅ Initial load - fetch all data
  useEffect(() => {
    fetchSalaryData();
  }, []);

  // ✅ Handle month selection
  const handleMonthSelect = (e) => {
    const monthValue = e.target.value;
    if (monthValue) {
      setSelectedMonth(monthValue);
      fetchSalaryData(monthValue);
    }
  };

  // ✅ Handle quick month selection
  const handleQuickMonthSelect = (month) => {
    setSelectedMonth(month);
    fetchSalaryData(month);
  };

  // ✅ Handle clear filter
  const handleClearFilter = () => {
    setSelectedMonth("");
    setSearchTerm("");
    fetchSalaryData();
  };

  // ✅ Filter records based on search
  useEffect(() => {
    let filtered = [...records];

    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(record => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (record.monthFormatted && record.monthFormatted.toLowerCase().includes(searchLower)) ||
          (record.month && record.month.toLowerCase().includes(searchLower)) ||
          (record.calculatedSalary && record.calculatedSalary.toString().includes(searchTerm)) ||
          (record.presentDays && record.presentDays.toString().includes(searchTerm))
        );
      });
    }

    // Apply month filter if selected
    if (selectedMonth) {
      filtered = filtered.filter(record => record.month === selectedMonth);
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedMonth, records]);

  // ✅ Pagination calculations
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

  // ✅ Handle view details
  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  // ✅ Close modal
  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedEmployee(null);
  };

  // ✅ Generate Invoice HTML with updated structure
  const generateInvoiceHTML = (employee) => {
    const employeeData = getEmployeeData(employee);

    if (!employeeData.salaryPerMonth || employeeData.salaryPerMonth === 0) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payslip</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; text-align: center; }
            .error { color: red; font-size: 18px; margin-top: 100px; border: 1px solid red; padding: 20px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="error">
            <h2>Salary Data Not Available</h2>
            <p>Salary information is not available for ${employee?.name || 'this employee'}.</p>
            <p>Please contact HR department.</p>
          </div>
        </body>
        </html>
      `;
    }

    const totalMonthDays = employee.monthDays || monthDays || 30;
    const dailyRate = calculateDailyRate(employee);
    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    
    const actualWeekOffDays = employee.weekOffs || 0;
    const weekOffDaysForSalary = employee.weekOffsForSalary || 0;
    const includeWeekOffInSalary = employee.includeWeekOffInSalary || false;

    const presentDays = employee.presentDays || 0;
    const halfDays = employee.halfDays || 0;
    const paidLeaveDays = (leaves.CL || 0) + (leaves.EL || 0) + (leaves.COFF || 0);

    const totalPaidDays = presentDays + (halfDays * 0.5) + weekOffDaysForSalary + paidLeaveDays;

    const halfDayDeductionDays = halfDays * 0.5;
    const halfDayDeductionAmount = halfDayDeductionDays * dailyRate;

    const totalUnpaidDays = Math.max(0, totalMonthDays - totalPaidDays);
    const lopDays = Math.max(0, totalUnpaidDays - halfDayDeductionDays);
    const lopAmount = lopDays * dailyRate;

    const grossSalary = employeeData.salaryPerMonth || 0;
    const bonus = employee.extraWork?.bonus || 0;
    const extraDaysPay = (employee.extraWork?.extraDays || 0) * dailyRate;

    const otherDeductions = employee.extraWork?.deductions || 0;

    const totalEarnings = grossSalary + bonus + extraDaysPay;
    const totalDeductions = halfDayDeductionAmount + lopAmount + otherDeductions;
    const netPay = totalEarnings - totalDeductions;

    const hasExtraWork = employee.extraWork && (
      (employee.extraWork.extraDays || 0) > 0 ||
      (employee.extraWork.bonus || 0) > 0 ||
      (employee.extraWork.deductions || 0) > 0
    );

    const isHistorical = employee.isHistoricalMonth;
    const isCurrent = employee.isCurrentMonth;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payslip - ${employee.name}</title>
        <style>
          @page { size: A4; margin: 0; }
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px;
            color: #000;
          }
          .invoice-container { 
            width: 100%; 
            max-width: 210mm;
            margin: 0 auto; 
            border: 1px solid #000; 
          }
          table { width: 100%; border-collapse: collapse; }
          th, td { 
            padding: 4px 8px; 
            border: 1px solid #000; 
            font-size: 12px; 
            vertical-align: middle;
          }
          .header-cell { border: none; padding: 2px 2px; text-align: center; border-bottom: 1px solid #000; }
          
          .section-header { 
            background-color: #f0f0f0; 
            font-weight: bold; 
            text-align: center; 
            text-transform: uppercase;
          }
          .amount-col { text-align: right; width: 15%; }
          .label-col { text-align: left; width: 35%; }
          
          .notes-box { 
            margin: 10px; 
            padding: 5px; 
            border: 1px dashed #666; 
            font-size: 11px;
            background-color: #fafafa;
          }
          
          .info-note {
            background-color: #fffde7;
            border-left: 4px solid #ffc107;
            padding: 8px;
            margin: 10px 0;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          
          <!-- MAIN LAYOUT TABLE -->
          <table>
            
            <!-- HEADER -->
            <tr>
              <td colspan="4" class="header-cell">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0px;">
                  <div style="width: 130px; text-align: left;">
                    <img src="${logo}" alt="Logo" style="height: 110px; width: auto; max-width: 130px; object-fit: contain; display: block;">
                  </div>
                  <div style="flex: 1; text-align: center; margin-right: 130px;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase;">Timely Health Tech Pvt Ltd</h1>
                    <p style="margin: 0px 0 0 0; font-size: 11px; line-height: 1.1;">
                      H. No: 1-98/9/25/p, # 301, 3rd Floor, Sri Sai Balaji Avenue,<br> 
                      Arunodaya Colony, Madhapur, Hyderabad, TG - 500081
                    </p>
                  </div>
                </div>
                <div style="text-align: center; margin-bottom: 2px;">
                  <span style="font-size: 18px; font-weight: bold; text-decoration: underline; text-underline-offset: 3px; display: inline-block;">PAYSLIP ${formatMonthDisplay(employee.month || selectedMonth).toUpperCase()}</span>
                  <br>
                  <span style="font-size: 11px; color: #666;">
                    ${isHistorical ? 'Historical Month - Full Salary' : isCurrent ? 'Current Month' : 'Future Month'}
                  </span>
                </div>
              </td>
            </tr>

            <!-- EMPLOYEE DETAILS -->
            <tr style="background-color: #fafafa;">
              <td width="20%"><strong>ID</strong></td>
              <td width="30%">${employee.employeeId}</td>
              <td width="20%"><strong>Joined</strong></td>
              <td width="30%">${employeeData.joiningDate ? new Date(employeeData.joiningDate).toLocaleDateString() : '-'}</td>
            </tr>
            <tr>
              <td><strong>Name</strong></td>
              <td>${employee.name}</td>
              <td><strong>Role</strong></td>
              <td>${employeeData.designation || '-'}</td>
            </tr>
            <tr style="background-color: #fafafa;">
              <td><strong>Dept</strong></td>
              <td>${employeeData.department || '-'}</td>
              <td><strong>Month</strong></td>
              <td>${formatMonthDisplay(employee.month || selectedMonth)}</td>
            </tr>
            <tr>
              <td><strong>Invoice Date</strong></td>
              <td>${new Date().toLocaleDateString()}</td>
              <td><strong>Total Days</strong></td>
              <td>${totalMonthDays} Days</td>
            </tr>

            <!-- WEEKOFF NOTICE FOR CURRENT MONTH -->
            ${!includeWeekOffInSalary ? `
            <tr>
              <td colspan="4" style="border: none; padding: 5px;">
                <div class="info-note">
                  <strong>Note:</strong> Weekoff salary for this month will be added after 26th ${formatMonthDisplay(employee.month || selectedMonth).split(' ')[0]}.
                </div>
              </td>
            </tr>
            ` : ''}

            <!-- SALARY BREAKDOWN HEADER -->
            <tr class="section-header">
              <td colspan="2">EARNINGS</td>
              <td colspan="2">DEDUCTIONS</td>
            </tr>

            <!-- SALARY CONTENT Row 1 -->
            <tr>
              <td class="label-col">Basic Salary</td>
              <td class="amount-col">₹${Math.round(grossSalary).toFixed(2)}</td>
              <td class="label-col">LOP / Absent (${lopDays} days)</td>
              <td class="amount-col" style="color:red;">
                ${lopAmount > 0 ? '-' : ''}₹${Math.round(lopAmount).toFixed(2)}
              </td>
            </tr>
            
            <!-- ROW 2: Days Info -->
            <tr>
              <td class="label-col">Working Days (Full: ${presentDays})</td>
              <td class="amount-col">-</td>
              <td class="label-col">Half Day Deductions (${halfDays} HD)</td>
              <td class="amount-col" style="color:red;">
                ${halfDayDeductionAmount > 0 ? '-' : ''}₹${Math.round(halfDayDeductionAmount).toFixed(2)}
              </td>
            </tr>

            <!-- ROW 3: Week Offs -->
            <tr>
              <td class="label-col">Week Off Days (${actualWeekOffDays})</td>
              <td class="amount-col">-</td>
              <td class="label-col">Other Deductions</td>
              <td class="amount-col" style="color:red;">
                ${otherDeductions > 0 ? '-' : ''}₹${otherDeductions.toFixed(2)}
              </td>
            </tr>

            <!-- ROW 4: Extra / Bonus -->
            <tr>
              <td class="label-col">Bonus / Extra</td>
              <td class="amount-col">₹${Math.round(bonus + extraDaysPay).toFixed(2)}</td>
              <td class="label-col"></td>
              <td class="amount-col"></td>
            </tr>

            <!-- TOTALS ROW -->
            <tr style="font-weight: bold; background-color: #f0f0f0;">
              <td class="label-col">Gross Earnings</td>
              <td class="amount-col">₹${Math.round(totalEarnings).toFixed(2)}</td>
              <td class="label-col">Total Deductions</td>
              <td class="amount-col" style="color:red;">₹${Math.round(totalDeductions).toFixed(2)}</td>
            </tr>

            <!-- NET PAY ROW -->
             <tr style="font-weight: bold; background-color: #e0eee0; font-size: 14px;">
              <td class="label-col" colspan="2" style="text-align: right; padding-right: 20px;">NET PAY</td>
              <td class="amount-col" colspan="2" style="text-align: left; padding-left: 20px;">₹${Math.round(netPay).toFixed(2)}</td>
            </tr>

            <!-- NOTES SECTION IF EXISTS -->
            ${hasExtraWork && employee.extraWork.reason ? `
            <tr>
              <td colspan="4" style="border: none; padding: 10px;">
                <div class="notes-box">
                  <strong>Adjustments Note:</strong> ${employee.extraWork.reason}
                </div>
              </td>
            </tr>
            ` : ''}

            <!-- DOWNLOAD NOTE FOR CURRENT MONTH -->
            ${!employee.canDownload ? `
            <tr>
              <td colspan="4" style="border: none; padding: 5px;">
                <div class="info-note">
                  <strong>Note:</strong> Salary slip for current month will be available for download from 30th onwards.
                </div>
              </td>
            </tr>
            ` : ''}

          </table>
          
          <div style="text-align: center; font-size: 10px; margin-top: 10px;">
            This is a computer-generated document.<br>
            Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
          </div>

        </div>
      </body>
      </html>
    `;
  };

  // ✅ Download salary slip with validation
  const downloadSalarySlip = async (employee) => {
    if (!employee.canDownload) {
      alert(`Salary slip for current month will be available for download from 30th ${formatMonthDisplay(employee.month).split(' ')[0]} onwards.`);
      return;
    }
    
    const slipContent = generateInvoiceHTML(employee);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(slipContent);
      printWindow.document.close();
      printWindow.print();

      // ✅ Log payslip download activity
      try {
        const employeeData = getCurrentEmployee();
        const employeeId = employeeData?.employeeId || employee.employeeId;
        const employeeName = employeeData?.name || employee.name;
        const employeeEmail = employeeData?.email || `${employeeId}@system.com`;

        console.log("Logging employee payslip download:", {
          employeeId,
          employeeName,
          employeeEmail,
          month: employee.month
        });

        await axios.post("https://api.timelyhealth.in/api/user-activity/log", {
          userId: employeeId,
          userName: employeeName,
          userEmail: employeeEmail,
          userRole: "employee",
          action: "payslip_download",
          actionDetails: `Downloaded own payslip for ${formatMonthDisplay(employee.month || selectedMonth)}`,
          metadata: {
            employeeId: employee.employeeId,
            employeeName: employee.name,
            month: employee.month || selectedMonth,
            salary: employee.calculatedSalary
          }
        });

        console.log("✅ Employee payslip download logged successfully");
      } catch (logError) {
        console.error("❌ Failed to log payslip download activity:", logError);
      }
    }
  };

  // ✅ Get leave types for display
  const getLeaveTypes = (employee) => {
    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const leaveStrings = [];

    if (leaves.CL > 0) leaveStrings.push(`CL: ${leaves.CL}`);
    if (leaves.EL > 0) leaveStrings.push(`EL: ${leaves.EL}`);
    if (leaves.COFF > 0) leaveStrings.push(`COFF: ${leaves.COFF}`);
    if (leaves.LOP > 0) leaveStrings.push(`LOP: ${leaves.LOP}`);
    if (leaves.Other > 0) leaveStrings.push(`Other: ${leaves.Other}`);

    return leaveStrings.length > 0 ? leaveStrings.join(', ') : 'No Leaves';
  };

  const currentEmployee = getCurrentEmployee();
  const last12Months = generateLast12Months();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold text-blue-600">Loading your salary data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-4 text-red-600 bg-red-100 rounded-lg">
          <p className="font-semibold">Error: {error}</p>
          <button
            onClick={() => fetchSalaryData(selectedMonth)}
            className="px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-7xl">

        {/* Header Info Card */}
        {/* <div className="p-4 mb-4 text-white shadow-lg md:p-6 md:mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl md:rounded-2xl"> */}
          {/* <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-bold md:text-2xl">My Salary History</h1>
              <p className="mt-1 text-sm text-blue-100 md:text-base">
                {currentEmployee?.name || 'Employee'} • ID: {currentEmployee?.employeeId || 'N/A'}
              </p>
              <div className="flex flex-wrap items-center mt-2 space-x-2 md:space-x-4">
                <div className="px-3 py-1 text-xs bg-white rounded-full md:text-sm bg-opacity-20">
                  {selectedMonth ? formatMonthDisplay(selectedMonth) : 'Current Month'}
                </div>
                <div className="text-xs text-blue-100 md:text-sm">
                  {filteredRecords.length} salary records
                </div>
              </div>
            </div> */}
            
            {/* Important Notes */}
            {/* <div className="mt-3 md:mt-0">
              <div className="p-2 text-xs bg-white rounded-lg md:p-3 md:text-sm bg-opacity-10">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Important:</span>
                </div>
                <ul className="mt-1 ml-1 space-y-1 text-xs">
                  <li>• Weekoff salary added after 26th of each month</li>
                  <li>• Current month slip available from 30th onwards</li>
                  <li>• Previous months slips always available</li>
                </ul>
              </div>
            </div>
          </div>
        </div> */}

        {/* Search and Filter Section */}
        <div className="p-4 mb-4 bg-white border border-blue-200 shadow-lg md:p-6 md:mb-6 rounded-xl md:rounded-2xl">
          <div className="flex flex-col gap-3 md:gap-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by month name, year, or salary amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg md:py-3 md:pl-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent md:text-base"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none md:pl-4">
                <Search size={18} className="text-gray-400" />
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Month Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleClearFilter}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg border text-sm ${!selectedMonth
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                    }`}
                >
                  Current Month
                </button>

                {/* Last 3 months quick buttons */}
                {last12Months.slice(0, 3).map((month, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickMonthSelect(month.value)}
                    className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg border text-sm ${selectedMonth === month.value
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                      }`}
                  >
                    {month.display.split(' ')[0]}
                  </button>
                ))}

                {/* Calendar Month Picker */}
                <div className="relative">
                  <button
                    onClick={() => document.getElementById('monthPicker').click()}
                    className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 text-white bg-purple-600 border border-purple-600 rounded-lg hover:bg-purple-700 text-sm"
                  >
                    <Calendar size={16} />
                    <span className="hidden md:inline">Select Month</span>
                    <span className="md:hidden">Month</span>
                  </button>
                  <input
                    id="monthPicker"
                    type="month"
                    onChange={handleMonthSelect}
                    className="absolute w-1 h-1 opacity-0"
                    max={getCurrentMonth()}
                  />
                </div>
              </div>

              {/* Active Filters Display */}
              <div className="flex items-center gap-2">
                {selectedMonth && (
                  <div className="flex items-center gap-2 px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded-full md:px-3 md:text-sm">
                    <span>{formatMonthDisplay(selectedMonth)}</span>
                    <button
                      onClick={handleClearFilter}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {/* Refresh Button */}
                <button
                  onClick={() => fetchSalaryData(selectedMonth)}
                  disabled={isLoadingMonth}
                  className="flex items-center px-3 md:px-4 py-1.5 md:py-2 font-medium text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isLoadingMonth ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-2 md:w-4 md:h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 mr-2 md:w-4 md:h-4" />
                      <span className="hidden md:inline">Refresh</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Month Type Notice */}
        <div className={`px-3 py-2 mb-4 md:mb-6 rounded-md shadow-sm ${
          monthInfo.isHistorical 
            ? 'bg-green-50 border-l-2 border-green-500' 
            : monthInfo.isCurrent
            ? (monthInfo.includeWeekOff 
                ? 'bg-green-50 border-l-2 border-green-500' 
                : 'bg-yellow-50 border-l-2 border-yellow-500')
            : 'bg-blue-50 border-l-2 border-blue-500'
        }`}>
          <div className="flex items-center">
            <div className="mr-2">
              {monthInfo.isHistorical ? (
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : monthInfo.isCurrent ? (
                monthInfo.includeWeekOff ? (
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.406 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )
              ) : (
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-xs font-medium">
                {monthInfo.isHistorical 
                  ? "✓ Historical Month - Full salary with week-off included | Payslip download available" 
                  : monthInfo.isCurrent
                  ? (monthInfo.includeWeekOff 
                      ? `✓ Current Month (After 26th) - Week-off included | ${monthInfo.canDownload ? 'Payslip download available' : 'Payslip available after 30th'}`
                      : `Current Month (Before 26th) - Week-off will be added after 26th | ${monthInfo.canDownload ? 'Payslip download available' : 'Payslip available after 30th'}`)
                  : "Future Month - Preview only"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview - Only for current employee */}
        <div className="grid grid-cols-1 gap-3 mb-4 md:gap-4 md:mb-6 md:grid-cols-3">
          <div className="p-3 bg-white border-l-2 border-blue-500 shadow md:p-4 md:border-l-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 md:text-sm">Total Salary Records</p>
                <p className="text-lg font-bold text-gray-800 md:text-xl">{filteredRecords.length}</p>
                <p className="text-xs text-gray-500">{selectedMonth ? 'For selected month' : 'All months'}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full md:p-3">
                <FileText className="w-5 h-5 text-blue-600 md:w-6 md:h-6" />
              </div>
            </div>
          </div>

          <div className="p-3 bg-white border-l-2 border-green-500 shadow md:p-4 md:border-l-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 md:text-sm">Total Salary Earned</p>
                <p className="text-lg font-bold text-gray-800 md:text-xl">
                  ₹{filteredRecords.reduce((sum, emp) => sum + (emp.calculatedSalary || 0), 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedMonth ? 'This month' : 'All months total'}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full md:p-3">
                <svg className="w-5 h-5 text-green-600 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white border-l-2 border-purple-500 shadow md:p-4 md:border-l-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 md:text-sm">Available for Download</p>
                <p className="text-lg font-bold text-gray-800 md:text-xl">
                  {filteredRecords.filter(emp => emp.canDownload).length}
                </p>
                <p className="text-xs text-gray-500">
                  {filteredRecords.filter(emp => !emp.canDownload).length > 0 
                    ? `${filteredRecords.filter(emp => !emp.canDownload).length} pending` 
                    : 'All available'}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full md:p-3">
                <Download className="w-5 h-5 text-purple-600 md:w-6 md:h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Table Container - Only current employee data */}
        <div className="overflow-hidden bg-white border border-blue-200 shadow-lg rounded-xl md:rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="text-white bg-gradient-to-r from-blue-600 to-indigo-700">
                <tr>
                  <th className="p-3 text-xs font-semibold text-left md:text-sm">Month</th>
                  <th className="p-3 text-xs font-semibold text-center md:text-sm">Present Days</th>
                  <th className="p-3 text-xs font-semibold text-center md:text-sm">Working Days</th>
                  <th className="p-3 text-xs font-semibold text-center md:text-sm">Half Days</th>
                  <th className="p-3 text-xs font-semibold text-center md:text-sm">WeekOff Days</th>
                  <th className="p-3 text-xs font-semibold text-center md:text-sm">Leaves</th>
                  <th className="p-3 text-xs font-semibold text-center md:text-sm">Salary</th>
                  <th className="p-3 text-xs font-semibold text-center md:text-sm">Status</th>
                  <th className="p-3 text-xs font-semibold text-center md:text-sm">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-6 text-center md:p-8">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <svg className="w-12 h-12 mb-3 text-gray-400 md:w-16 md:h-16 md:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-base font-medium md:text-lg">
                          {selectedMonth
                            ? `No salary record found for ${formatMonthDisplay(selectedMonth)}`
                            : searchTerm
                              ? 'No records match your search'
                              : 'No salary records found for you'
                          }
                        </p>
                        <p className="text-xs md:text-sm">Contact HR if you believe this is an error</p>
                        {(selectedMonth || searchTerm) && (
                          <button
                            onClick={handleClearFilter}
                            className="px-3 md:px-4 py-1.5 md:py-2 mt-3 md:mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 text-sm"
                          >
                            Clear Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((emp, index) => {
                    const dailyRate = calculateDailyRate(emp);
                    const isCurrentMonth = emp.isCurrentMonth;

                    return (
                      <tr
                        key={index}
                        className={`hover:bg-blue-50 transition duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                      >
                        <td className="p-3 font-medium text-gray-900 md:p-4">
                          <div>
                            <div className="text-sm font-semibold md:text-base">{emp.monthFormatted || formatMonthDisplay(emp.month)}</div>
                            <div className="text-xs text-gray-500">{emp.monthDays || 30} days in month</div>
                            {isCurrentMonth && (
                              <div className="text-xs text-blue-600">Current Month</div>
                            )}
                          </div>
                        </td>

                        <td className="p-3 text-center md:p-4">
                          <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full md:px-3">
                            {emp.presentDays || 0}
                          </span>
                        </td>

                        <td className="p-3 text-center md:p-4">
                          <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full md:px-3">
                            {emp.workingDays || 0}
                          </span>
                        </td>

                        <td className="p-3 text-center md:p-4">
                          <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full md:px-3">
                            {emp.halfDays || 0}
                          </span>
                        </td>

                        <td className="p-3 text-center md:p-4">
                          <span className="px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full md:px-3">
                            {emp.weekOffs || 0}
                          </span>
                          {!emp.includeWeekOffInSalary && (
                            <div className="mt-1 text-xs text-gray-500">After 26th</div>
                          )}
                        </td>

                        <td className="p-3 text-center md:p-4">
                          <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full md:px-3">
                            {emp.totalLeaves || 0}
                          </span>
                        </td>

                        <td className="p-3 text-center md:p-4">
                          <div>
                            <div className="text-sm font-semibold text-green-700 md:text-base">₹{emp.calculatedSalary || 0}</div>
                            <div className="text-xs text-gray-500">₹{dailyRate}/day</div>
                          </div>
                        </td>

                        <td className="p-3 text-center md:p-4">
                          {emp.canDownload ? (
                            <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full md:px-3">
                              Available
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full md:px-3">
                              From 30th
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-center md:p-4">
                          <div className="flex justify-center space-x-1 md:space-x-2">
                            <button
                              onClick={() => handleViewDetails(emp)}
                              className="p-1.5 md:p-2 text-white transition duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
                              title="View Details"
                            >
                              <Eye size={14} className="md:w-4 md:h-4" />
                            </button>

                            <button
                              onClick={() => downloadSalarySlip(emp)}
                              disabled={!emp.canDownload}
                              className={`p-1.5 md:p-2 transition duration-200 rounded-lg ${emp.canDownload
                                  ? 'text-white bg-purple-500 hover:bg-purple-600'
                                  : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                                }`}
                              title={emp.canDownload ? "Download Salary Slip" : "Available from 30th"}
                            >
                              <FileText size={14} className="md:w-4 md:h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredRecords.length > 0 && (
            <div className="px-4 py-3 bg-white border-t border-gray-200">
              <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
                <div className="text-xs text-gray-600 md:text-sm">
                  Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredRecords.length)} of {filteredRecords.length} entries
                  {selectedMonth && ` for ${formatMonthDisplay(selectedMonth)}`}
                </div>

                <div className="flex items-center space-x-1 md:space-x-2">
                  <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg border text-sm ${currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                      }`}
                  >
                    Previous
                  </button>

                  <div className="flex space-x-1">
                    {getPageNumbers().map(pageNumber => (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageClick(pageNumber)}
                        className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg border text-sm ${currentPage === pageNumber
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                          }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg border text-sm ${currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                      }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Details Modal */}
      {showDetailsModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 md:text-xl">
                Salary Details - {selectedEmployee.monthFormatted || formatMonthDisplay(selectedEmployee.month)}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} className="md:w-6 md:h-6" />
              </button>
            </div>

            {/* Important Info Banner */}
            {!selectedEmployee.canDownload && (
              <div className="p-3 mb-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-yellow-600 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium text-yellow-800 md:text-sm">
                    This month's salary slip will be available for download from 30th onwards.
                  </span>
                </div>
              </div>
            )}

            {!selectedEmployee.includeWeekOffInSalary && (
              <div className="p-3 mb-4 bg-blue-100 border border-blue-300 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium text-blue-800 md:text-sm">
                    Weekoff salary for this month will be added after 26th.
                  </span>
                </div>
              </div>
            )}

            <div className="p-3 mb-4 rounded-lg md:p-4 bg-gray-50">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full md:w-12 md:h-12">
                  <span className="text-base font-semibold text-blue-800 md:text-lg">
                    {currentEmployee?.name?.charAt(0) || selectedEmployee.name?.charAt(0) || 'E'}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-800 md:text-lg">
                    {currentEmployee?.name || selectedEmployee.name}
                  </h3>
                  <p className="text-xs text-gray-600 md:text-sm">ID: {selectedEmployee.employeeId}</p>
                  <p className="text-xs text-gray-600 md:text-sm">Month: {selectedEmployee.monthFormatted || formatMonthDisplay(selectedEmployee.month)}</p>
                  <p className="text-xs text-gray-600 md:text-sm">Days in Month: {selectedEmployee.monthDays || 30}</p>
                  <p className={`text-xs md:text-sm ${selectedEmployee.isHistoricalMonth ? 'text-green-600' : selectedEmployee.isCurrentMonth ? 'text-blue-600' : 'text-gray-600'}`}>
                    {selectedEmployee.isHistoricalMonth 
                      ? 'Historical Month - Full salary' 
                      : selectedEmployee.isCurrentMonth 
                      ? `Current Month - ${selectedEmployee.includeWeekOffInSalary ? 'Week-off included' : 'Week-off after 26th'}` 
                      : 'Future Month'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 md:gap-4 md:mb-6">
              <div className="p-2 bg-white border rounded-lg md:p-3">
                <p className="text-xs text-gray-600 md:text-sm">Present Days</p>
                <p className="text-base font-semibold text-green-600 md:text-lg">{selectedEmployee.presentDays || 0}</p>
              </div>
              <div className="p-2 bg-white border rounded-lg md:p-3">
                <p className="text-xs text-gray-600 md:text-sm">Working Days</p>
                <p className="text-base font-semibold text-blue-600 md:text-lg">{selectedEmployee.workingDays || 0}</p>
              </div>
              <div className="p-2 bg-white border rounded-lg md:p-3">
                <p className="text-xs text-gray-600 md:text-sm">Half Days</p>
                <p className="text-base font-semibold text-yellow-600 md:text-lg">{selectedEmployee.halfDays || 0}</p>
              </div>
              <div className="p-2 bg-white border rounded-lg md:p-3">
                <p className="text-xs text-gray-600 md:text-sm">WeekOff Days</p>
                <p className="text-base font-semibold text-purple-600 md:text-lg">{selectedEmployee.weekOffs || 0}</p>
                {!selectedEmployee.includeWeekOffInSalary && (
                  <p className="text-xs text-gray-500">(After 26th)</p>
                )}
              </div>
              <div className="p-2 bg-white border rounded-lg md:p-3">
                <p className="text-xs text-gray-600 md:text-sm">Total Leaves</p>
                <p className="text-base font-semibold text-orange-600 md:text-lg">{selectedEmployee.totalLeaves || 0}</p>
              </div>
              <div className="p-2 bg-white border rounded-lg md:p-3">
                <p className="text-xs text-gray-600 md:text-sm">Month Days</p>
                <p className="text-base font-semibold text-gray-800 md:text-lg">{selectedEmployee.monthDays || 30}</p>
              </div>
              <div className="p-2 bg-white border rounded-lg md:p-3">
                <p className="text-xs text-gray-600 md:text-sm">Daily Rate</p>
                <p className="text-base font-semibold text-blue-700 md:text-lg">₹{calculateDailyRate(selectedEmployee)}/day</p>
              </div>
              <div className="col-span-2 p-2 bg-white border rounded-lg md:p-3">
                <p className="text-xs text-gray-600 md:text-sm">Approved Leaves</p>
                <p className="text-sm font-semibold text-red-600 md:text-base">{getLeaveTypes(selectedEmployee)}</p>
              </div>
            </div>

            <div className="p-3 mb-4 rounded-lg md:p-4 bg-blue-50">
              <h3 className="mb-2 text-base font-semibold text-blue-800 md:text-lg">Salary Information</h3>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="p-2 bg-white border rounded-lg md:p-3">
                  <p className="text-xs text-gray-600 md:text-sm">Monthly Salary</p>
                  <p className="text-base font-semibold text-blue-700 md:text-lg">₹{selectedEmployee.salaryPerMonth || 0}</p>
                </div>
                <div className="p-2 bg-white border rounded-lg md:p-3">
                  <p className="text-xs text-gray-600 md:text-sm">Calculated Salary</p>
                  <p className="text-base font-semibold text-green-600 md:text-lg">₹{selectedEmployee.calculatedSalary || 0}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-end pt-4 space-y-2 border-t border-gray-200 md:flex-row md:space-y-0 md:space-x-2">
              <button
                onClick={() => downloadSalarySlip(selectedEmployee)}
                disabled={!selectedEmployee.canDownload}
                className={`px-4 py-2 transition duration-200 rounded-lg text-sm ${selectedEmployee.canDownload
                    ? 'text-white bg-purple-500 hover:bg-purple-600'
                    : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                  }`}
              >
                {selectedEmployee.canDownload ? 'Download Slip' : 'Available from 30th'}
              </button>
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm text-white transition duration-200 bg-blue-500 rounded-lg md:px-6 hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}