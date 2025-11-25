// import React, { useEffect, useState } from "react";

// const PayRoll = () => {
//   const [records, setRecords] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [editFormData, setEditFormData] = useState({});
//   const [extraWorkData, setExtraWorkData] = useState({
//     extraDays: 0,
//     extraHours: 0,
//     overtimeRate: 0,
//     bonus: 0,
//     deductions: 0,
//     reason: ""
//   });
//   const recordsPerPage = 10;

//   const API_URL = "http://localhost:5000/api/attendancesummary/getattendancesummary";

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = () => {
//     fetch(API_URL)
//       .then((res) => res.json())
//       .then((data) => {
//         const summaryData = data.summary || [];
//         setRecords(summaryData);
//         setFilteredRecords(summaryData);
//       })
//       .catch((err) => console.log("Error:", err));
//   };

//   // Filter records based on search term
//   useEffect(() => {
//     const filtered = records.filter(record =>
//       record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       record.employeeId?.toString().includes(searchTerm)
//     );
//     setFilteredRecords(filtered);
//     setCurrentPage(1);
//   }, [searchTerm, records]);

//   // Calculate pagination
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

//   // Edit functions
//   const handleEdit = (employee) => {
//     setSelectedEmployee(employee);
//     setEditFormData({
//       presentDays: employee.presentDays,
//       workingDays: employee.workingDays,
//       halfDays: employee.halfDays,
//       fullDayLeaves: employee.fullDayLeaves,
//       calculatedSalary: employee.calculatedSalary
//     });
//     // Reset extra work data
//     setExtraWorkData({
//       extraDays: 0,
//       extraHours: 0,
//       overtimeRate: Math.round(employee.salaryPerMonth / (22 * employee.shiftHours) * 1.5), // 1.5x hourly rate
//       bonus: 0,
//       deductions: 0,
//       reason: ""
//     });
//     setShowEditModal(true);
//   };

//   const handleEditSubmit = (e) => {
//     e.preventDefault();
    
//     // Calculate total salary with extra work
//     const dailyRate = Math.round(selectedEmployee.salaryPerMonth / 22);
//     const baseSalary = (editFormData.workingDays * dailyRate) + (editFormData.halfDays * dailyRate / 2);
    
//     // Calculate overtime
//     const hourlyRate = Math.round(selectedEmployee.salaryPerMonth / (22 * selectedEmployee.shiftHours));
//     const overtimeAmount = extraWorkData.extraHours * extraWorkData.overtimeRate;
//     const extraDaysAmount = extraWorkData.extraDays * dailyRate;
    
//     const totalExtraAmount = overtimeAmount + extraDaysAmount + extraWorkData.bonus - extraWorkData.deductions;
//     const finalSalary = baseSalary + totalExtraAmount;

//     const updatedData = {
//       ...editFormData,
//       calculatedSalary: Math.round(finalSalary),
//       extraWork: {
//         extraDays: extraWorkData.extraDays,
//         extraHours: extraWorkData.extraHours,
//         overtimeRate: extraWorkData.overtimeRate,
//         overtimeAmount: overtimeAmount,
//         bonus: extraWorkData.bonus,
//         deductions: extraWorkData.deductions,
//         totalExtraAmount: totalExtraAmount,
//         reason: extraWorkData.reason
//       }
//     };

//     console.log("Updated data:", updatedData);
    
//     // Update local state for demo
//     const updatedRecords = records.map(record => 
//       record.employeeId === selectedEmployee.employeeId 
//         ? { ...record, ...updatedData }
//         : record
//     );
    
//     setRecords(updatedRecords);
//     setShowEditModal(false);
//     alert("Salary details updated successfully!");
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setEditFormData(prev => ({
//       ...prev,
//       [name]: parseInt(value) || 0
//     }));
//   };

//   const handleExtraWorkChange = (e) => {
//     const { name, value } = e.target;
//     setExtraWorkData(prev => ({
//       ...prev,
//       [name]: name === 'reason' ? value : (parseFloat(value) || 0)
//     }));
//   };

//   // View details
//   const handleView = (employee) => {
//     setSelectedEmployee(employee);
//     setShowViewModal(true);
//   };

//   // Download Invoice as PDF
//   const downloadInvoice = (employee) => {
//     const invoiceContent = generateInvoiceHTML(employee);
//     const printWindow = window.open('', '_blank');
//     printWindow.document.write(invoiceContent);
//     printWindow.document.close();
//     printWindow.print();
//   };

//   const generateInvoiceHTML = (employee) => {
//     const hasExtraWork = employee.extraWork && (
//       employee.extraWork.extraDays > 0 || 
//       employee.extraWork.extraHours > 0 || 
//       employee.extraWork.bonus > 0 || 
//       employee.extraWork.deductions > 0
//     );

//     return `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <title>Salary Invoice - ${employee.name}</title>
//         <style>
//           body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
//           .invoice-container { max-width: 800px; margin: 0 auto; border: 2px solid #3b82f6; border-radius: 10px; padding: 30px; }
//           .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
//           .company-name { font-size: 28px; font-weight: bold; color: #3b82f6; margin-bottom: 5px; }
//           .invoice-title { font-size: 24px; font-weight: bold; margin: 20px 0; }
//           .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
//           .detail-item { margin-bottom: 10px; }
//           .detail-label { font-weight: bold; color: #666; }
//           .salary-breakdown { margin: 30px 0; }
//           .breakdown-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
//           .breakdown-table th, .breakdown-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
//           .breakdown-table th { background-color: #3b82f6; color: white; }
//           .total-row { font-weight: bold; background-color: #f8fafc; }
//           .extra-work-row { background-color: #f0f9ff; }
//           .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #3b82f6; color: #666; }
//           .signature { margin-top: 50px; display: flex; justify-content: space-between; }
//           .signature-box { width: 200px; border-top: 1px solid #333; padding-top: 10px; text-align: center; }
//           .notes { margin-top: 20px; padding: 15px; background-color: #f8fafc; border-radius: 5px; }
//         </style>
//       </head>
//       <body>
//         <div class="invoice-container">
//           <div class="header">
//             <div class="company-name">TECH SOLUTIONS LTD</div>
//             <div>123 Tech Park, Innovation City, IC 12345</div>
//             <div>Phone: (123) 456-7890 | Email: hr@techsolutions.com</div>
//           </div>

//           <div class="invoice-title">SALARY INVOICE</div>

//           <div class="details-grid">
//             <div>
//               <div class="detail-item">
//                 <span class="detail-label">Employee ID:</span> ${employee.employeeId}
//               </div>
//               <div class="detail-item">
//                 <span class="detail-label">Employee Name:</span> ${employee.name}
//               </div>
//               <div class="detail-item">
//                 <span class="detail-label">Month:</span> ${employee.month}
//               </div>
//             </div>
//             <div>
//               <div class="detail-item">
//                 <span class="detail-label">Invoice Date:</span> ${new Date().toLocaleDateString()}
//               </div>
//               <div class="detail-item">
//                 <span class="detail-label">Invoice No:</span> INV-${employee.employeeId}-${new Date().getTime()}
//               </div>
//             </div>
//           </div>

//           <div class="salary-breakdown">
//             <h3>Salary Breakdown</h3>
//             <table class="breakdown-table">
//               <thead>
//                 <tr>
//                   <th>Description</th>
//                   <th>Days/Hours</th>
//                   <th>Rate</th>
//                   <th>Amount</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr>
//                   <td>Basic Salary (${employee.workingDays} days)</td>
//                   <td>${employee.workingDays}</td>
//                   <td>₹${Math.round(employee.salaryPerMonth / 22)}/day</td>
//                   <td>₹${Math.round(employee.workingDays * (employee.salaryPerMonth / 22))}</td>
//                 </tr>
//                 ${employee.halfDays > 0 ? `
//                 <tr>
//                   <td>Half Days</td>
//                   <td>${employee.halfDays}</td>
//                   <td>₹${Math.round(employee.salaryPerMonth / 44)}/half-day</td>
//                   <td>₹${Math.round(employee.halfDays * (employee.salaryPerMonth / 44))}</td>
//                 </tr>
//                 ` : ''}
//                 ${hasExtraWork ? `
//                 <tr class="extra-work-row">
//                   <td colspan="4"><strong>Extra Work & Adjustments</strong></td>
//                 </tr>
//                 ${employee.extraWork.extraDays > 0 ? `
//                 <tr class="extra-work-row">
//                   <td>Extra Working Days</td>
//                   <td>${employee.extraWork.extraDays}</td>
//                   <td>₹${Math.round(employee.salaryPerMonth / 22)}/day</td>
//                   <td>₹${Math.round(employee.extraWork.extraDays * (employee.salaryPerMonth / 22))}</td>
//                 </tr>
//                 ` : ''}
//                 ${employee.extraWork.extraHours > 0 ? `
//                 <tr class="extra-work-row">
//                   <td>Overtime Hours</td>
//                   <td>${employee.extraWork.extraHours}</td>
//                   <td>₹${employee.extraWork.overtimeRate}/hour</td>
//                   <td>₹${employee.extraWork.overtimeAmount}</td>
//                 </tr>
//                 ` : ''}
//                 ${employee.extraWork.bonus > 0 ? `
//                 <tr class="extra-work-row">
//                   <td>Performance Bonus</td>
//                   <td>-</td>
//                   <td>-</td>
//                   <td>₹${employee.extraWork.bonus}</td>
//                 </tr>
//                 ` : ''}
//                 ${employee.extraWork.deductions > 0 ? `
//                 <tr class="extra-work-row">
//                   <td>Deductions</td>
//                   <td>-</td>
//                   <td>-</td>
//                   <td>-₹${employee.extraWork.deductions}</td>
//                 </tr>
//                 ` : ''}
//                 ` : ''}
//                 <tr class="total-row">
//                   <td colspan="3"><strong>Total Salary</strong></td>
//                   <td><strong>₹${employee.calculatedSalary}</strong></td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>

//           <div class="salary-breakdown">
//             <h3>Attendance Summary</h3>
//             <table class="breakdown-table">
//               <thead>
//                 <tr>
//                   <th>Particulars</th>
//                   <th>Days</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr>
//                   <td>Total Present Days</td>
//                   <td>${employee.presentDays}</td>
//                 </tr>
//                 <tr>
//                   <td>Working Days</td>
//                   <td>${employee.workingDays}</td>
//                 </tr>
//                 <tr>
//                   <td>Half Days</td>
//                   <td>${employee.halfDays}</td>
//                 </tr>
//                 <tr>
//                   <td>Full Day Leaves</td>
//                   <td>${employee.fullDayLeaves}</td>
//                 </tr>
//                 <tr>
//                   <td>Late Days</td>
//                   <td>${employee.lateDays}</td>
//                 </tr>
//                 <tr>
//                   <td>Onsite Days</td>
//                   <td>${employee.onsiteDays}</td>
//                 </tr>
//                 ${hasExtraWork && employee.extraWork.extraDays > 0 ? `
//                 <tr>
//                   <td>Extra Working Days</td>
//                   <td>${employee.extraWork.extraDays}</td>
//                 </tr>
//                 ` : ''}
//               </tbody>
//             </table>
//           </div>

//           ${hasExtraWork && employee.extraWork.reason ? `
//           <div class="notes">
//             <strong>Notes:</strong> ${employee.extraWork.reason}
//           </div>
//           ` : ''}

//           <div class="signature">
//             <div class="signature-box">
//               Employee Signature
//             </div>
//             <div class="signature-box">
//               Authorized Signature
//             </div>
//           </div>

//           <div class="footer">
//             Thank you for your hard work and dedication!
//           </div>
//         </div>
//       </body>
//       </html>
//     `;
//   };

//   return (
//     <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-7xl">
        
//         {/* Header */}
//         <div className="p-6 mb-6 bg-white border border-blue-200 shadow-xl rounded-2xl">
//           <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
//             <div>
//               <h1 className="mb-2 text-3xl font-bold text-gray-800">Payroll Summary</h1>
//               <p className="text-gray-600">Employee attendance and payroll overview</p>
//             </div>
//             <div className="flex items-center gap-4">
//               <div className="relative">
//                 <input
//                   type="text"
//                   placeholder="Search by name or ID..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-64 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//                 <div className="absolute left-3 top-2.5 text-gray-400">
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                   </svg>
//                 </div>
//               </div>
//               <button className="px-4 py-2 font-semibold text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700">
//                 Export
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
//           <div className="p-6 bg-white border-l-4 border-green-500 shadow-lg rounded-xl">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Total Employees</p>
//                 <p className="mt-1 text-2xl font-bold text-gray-800">{filteredRecords.length}</p>
//               </div>
//               <div className="p-3 bg-green-100 rounded-full">
//                 <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           <div className="p-6 bg-white border-l-4 border-blue-500 shadow-lg rounded-xl">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Current Page</p>
//                 <p className="mt-1 text-2xl font-bold text-gray-800">{currentPage} / {totalPages}</p>
//               </div>
//               <div className="p-3 bg-blue-100 rounded-full">
//                 <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           <div className="p-6 bg-white border-l-4 border-purple-500 shadow-lg rounded-xl">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Showing Records</p>
//                 <p className="mt-1 text-2xl font-bold text-gray-800">{currentRecords.length}</p>
//               </div>
//               <div className="p-3 bg-purple-100 rounded-full">
//                 <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           <div className="p-6 bg-white border-l-4 border-orange-500 shadow-lg rounded-xl">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Total Records</p>
//                 <p className="mt-1 text-2xl font-bold text-gray-800">{filteredRecords.length}</p>
//               </div>
//               <div className="p-3 bg-orange-100 rounded-full">
//                 <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                 </svg>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Table Container */}
//         <div className="overflow-hidden bg-white border border-blue-200 shadow-xl rounded-2xl">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="text-white bg-gradient-to-r from-blue-600 to-indigo-700">
//                 <tr>
//                   <th className="p-4 font-semibold text-left">Employee ID</th>
//                   <th className="p-4 font-semibold text-left">Name</th>
//                   <th className="p-4 font-semibold text-center">Present</th>
//                   <th className="p-4 font-semibold text-center">Working Days</th>
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
//                         <p className="text-lg font-medium">No records found</p>
//                         <p className="text-sm">Try adjusting your search criteria</p>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   currentRecords.map((item, index) => (
//                     <tr 
//                       key={item._id} 
//                       className={`hover:bg-blue-50 transition duration-150 ${
//                         index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
//                       }`}
//                     >
//                       <td className="p-4 font-medium text-gray-900">{item.employeeId}</td>
//                       <td className="p-4">
//                         <div className="flex items-center">
//                           <div className="flex items-center justify-center w-8 h-8 mr-3 font-semibold text-blue-800 bg-blue-100 rounded-full">
//                             {item.name?.charAt(0) || 'U'}
//                           </div>
//                           <span className="font-medium text-gray-800">{item.name}</span>
//                         </div>
//                       </td>
//                       <td className="p-4 text-center">
//                         <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
//                           {item.presentDays}
//                         </span>
//                       </td>
//                       <td className="p-4 text-center">
//                         <span className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
//                           {item.workingDays}
//                         </span>
//                       </td>
//                       <td className="p-4 text-center">
//                         <span className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
//                           {item.halfDays}
//                         </span>
//                       </td>
//                       <td className="p-4 font-semibold text-center text-green-700">
//                         ₹{item.calculatedSalary}
//                       </td>
//                       <td className="p-4 text-center text-gray-600">
//                         {item.month || "-"}
//                       </td>
//                       <td className="p-4 text-center">
//                         <div className="flex justify-center space-x-2">
//                           <button
//                             onClick={() => handleView(item)}
//                             className="p-2 text-white transition duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
//                             title="View Details"
//                           >
//                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                             </svg>
//                           </button>
//                           <button
//                             onClick={() => handleEdit(item)}
//                             className="p-2 text-white transition duration-200 bg-green-500 rounded-lg hover:bg-green-600"
//                             title="Edit Salary"
//                           >
//                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                             </svg>
//                           </button>
//                           <button
//                             onClick={() => downloadInvoice(item)}
//                             className="p-2 text-white transition duration-200 bg-purple-500 rounded-lg hover:bg-purple-600"
//                             title="Download Invoice"
//                           >
//                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                             </svg>
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
//             <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
//               <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//                 <div className="text-sm text-gray-700">
//                   Showing <span className="font-semibold">{indexOfFirstRecord + 1}</span> to{" "}
//                   <span className="font-semibold">
//                     {Math.min(indexOfLastRecord, filteredRecords.length)}
//                   </span>{" "}
//                   of <span className="font-semibold">{filteredRecords.length}</span> results
//                 </div>
                
//                 <div className="flex items-center space-x-2">
//                   <button
//                     onClick={handlePrevious}
//                     disabled={currentPage === 1}
//                     className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
//                       currentPage === 1
//                         ? "bg-gray-200 text-gray-500 cursor-not-allowed"
//                         : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
//                     }`}
//                   >
//                     Previous
//                   </button>

//                   <button
//                     onClick={handleNext}
//                     disabled={currentPage === totalPages}
//                     className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
//                       currentPage === totalPages
//                         ? "bg-gray-200 text-gray-500 cursor-not-allowed"
//                         : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
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

//       {/* View Modal */}
//       {showViewModal && selectedEmployee && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6 border-b border-gray-200">
//               <div className="flex items-center justify-between">
//                 <h3 className="text-2xl font-bold text-gray-800">Employee Details</h3>
//                 <button
//                   onClick={() => setShowViewModal(false)}
//                   className="text-2xl font-bold text-gray-500 hover:text-gray-700"
//                 >
//                   ×
//                 </button>
//               </div>
//             </div>
            
//             <div className="p-6">
//               <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
//                 <div className="p-4 rounded-lg bg-blue-50">
//                   <h4 className="mb-2 font-semibold text-blue-800">Basic Information</h4>
//                   <p><span className="font-medium">Employee ID:</span> {selectedEmployee.employeeId}</p>
//                   <p><span className="font-medium">Name:</span> {selectedEmployee.name}</p>
//                   <p><span className="font-medium">Month:</span> {selectedEmployee.month}</p>
//                 </div>
                
//                 <div className="p-4 rounded-lg bg-green-50">
//                   <h4 className="mb-2 font-semibold text-green-800">Salary Information</h4>
//                   <p><span className="font-medium">Monthly Salary:</span> ₹{selectedEmployee.salaryPerMonth}</p>
//                   <p><span className="font-medium">Calculated Salary:</span> ₹{selectedEmployee.calculatedSalary}</p>
//                   <p><span className="font-medium">Shift Hours:</span> {selectedEmployee.shiftHours} hrs/day</p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                 <div className="p-4 bg-white border border-gray-200 rounded-lg">
//                   <h4 className="mb-3 font-semibold text-gray-800">Attendance Summary</h4>
//                   <div className="space-y-2">
//                     <div className="flex justify-between">
//                       <span>Present Days:</span>
//                       <span className="font-medium">{selectedEmployee.presentDays}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>Working Days:</span>
//                       <span className="font-medium text-green-600">{selectedEmployee.workingDays}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>Half Days:</span>
//                       <span className="font-medium text-yellow-600">{selectedEmployee.halfDays}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>Full Day Leaves:</span>
//                       <span className="font-medium text-red-600">{selectedEmployee.fullDayLeaves}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>Late Days:</span>
//                       <span className="font-medium text-orange-600">{selectedEmployee.lateDays}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>Onsite Days:</span>
//                       <span className="font-medium text-purple-600">{selectedEmployee.onsiteDays}</span>
//                     </div>
//                     {selectedEmployee.extraWork && selectedEmployee.extraWork.extraDays > 0 && (
//                       <div className="flex justify-between">
//                         <span>Extra Working Days:</span>
//                         <span className="font-medium text-blue-600">{selectedEmployee.extraWork.extraDays}</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="p-4 bg-white border border-gray-200 rounded-lg">
//                   <h4 className="mb-3 font-semibold text-gray-800">Salary Calculation</h4>
//                   <div className="space-y-2">
//                     <div className="flex justify-between">
//                       <span>Daily Rate:</span>
//                       <span>₹{Math.round(selectedEmployee.salaryPerMonth / 22)}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>Working Days Amount:</span>
//                       <span>₹{Math.round(selectedEmployee.workingDays * (selectedEmployee.salaryPerMonth / 22))}</span>
//                     </div>
//                     {selectedEmployee.halfDays > 0 && (
//                       <div className="flex justify-between">
//                         <span>Half Days Amount:</span>
//                         <span>₹{Math.round(selectedEmployee.halfDays * (selectedEmployee.salaryPerMonth / 44))}</span>
//                       </div>
//                     )}
//                     {selectedEmployee.extraWork && (
//                       <>
//                         {selectedEmployee.extraWork.extraDays > 0 && (
//                           <div className="flex justify-between">
//                             <span>Extra Days Amount:</span>
//                             <span>₹{Math.round(selectedEmployee.extraWork.extraDays * (selectedEmployee.salaryPerMonth / 22))}</span>
//                           </div>
//                         )}
//                         {selectedEmployee.extraWork.overtimeAmount > 0 && (
//                           <div className="flex justify-between">
//                             <span>Overtime Amount:</span>
//                             <span>₹{selectedEmployee.extraWork.overtimeAmount}</span>
//                           </div>
//                         )}
//                         {selectedEmployee.extraWork.bonus > 0 && (
//                           <div className="flex justify-between">
//                             <span>Bonus:</span>
//                             <span>₹{selectedEmployee.extraWork.bonus}</span>
//                           </div>
//                         )}
//                         {selectedEmployee.extraWork.deductions > 0 && (
//                           <div className="flex justify-between">
//                             <span>Deductions:</span>
//                             <span>-₹{selectedEmployee.extraWork.deductions}</span>
//                           </div>
//                         )}
//                       </>
//                     )}
//                     <div className="flex justify-between pt-2 font-bold border-t border-gray-200">
//                       <span>Total Salary:</span>
//                       <span className="text-green-600">₹{selectedEmployee.calculatedSalary}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
//               <div className="flex justify-end space-x-3">
//                 <button
//                   onClick={() => downloadInvoice(selectedEmployee)}
//                   className="px-6 py-2 font-semibold text-white transition duration-200 bg-purple-600 rounded-lg hover:bg-purple-700"
//                 >
//                   Download Invoice
//                 </button>
//                 <button
//                   onClick={() => setShowViewModal(false)}
//                   className="px-6 py-2 font-semibold text-white transition duration-200 bg-gray-500 rounded-lg hover:bg-gray-600"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit Modal */}
//       {showEditModal && selectedEmployee && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6 border-b border-gray-200">
//               <h3 className="text-2xl font-bold text-gray-800">Edit Salary Details</h3>
//               <p className="mt-1 text-gray-600">Update working days and salary for {selectedEmployee.name}</p>
//             </div>
            
//             <form onSubmit={handleEditSubmit}>
//               <div className="p-6">
//                 {/* Basic Attendance Section */}
//                 <div className="mb-6">
//                   <h4 className="pb-2 mb-4 text-lg font-semibold text-gray-800 border-b">Basic Attendance</h4>
//                   <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                     <div>
//                       <label className="block mb-1 text-sm font-medium text-gray-700">
//                         Present Days
//                       </label>
//                       <input
//                         type="number"
//                         name="presentDays"
//                         value={editFormData.presentDays}
//                         onChange={handleInputChange}
//                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         min="0"
//                         max="31"
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="block mb-1 text-sm font-medium text-gray-700">
//                         Working Days (Full Days)
//                       </label>
//                       <input
//                         type="number"
//                         name="workingDays"
//                         value={editFormData.workingDays}
//                         onChange={handleInputChange}
//                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         min="0"
//                         max="31"
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="block mb-1 text-sm font-medium text-gray-700">
//                         Half Days
//                       </label>
//                       <input
//                         type="number"
//                         name="halfDays"
//                         value={editFormData.halfDays}
//                         onChange={handleInputChange}
//                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         min="0"
//                         max="31"
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="block mb-1 text-sm font-medium text-gray-700">
//                         Full Day Leaves
//                       </label>
//                       <input
//                         type="number"
//                         name="fullDayLeaves"
//                         value={editFormData.fullDayLeaves}
//                         onChange={handleInputChange}
//                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         min="0"
//                         max="31"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Extra Work Section */}
//                 <div className="mb-6">
//                   <h4 className="pb-2 mb-4 text-lg font-semibold text-gray-800 border-b">Extra Work & Adjustments</h4>
//                   <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                     <div>
//                       <label className="block mb-1 text-sm font-medium text-gray-700">
//                         Extra Working Days
//                       </label>
//                       <input
//                         type="number"
//                         name="extraDays"
//                         value={extraWorkData.extraDays}
//                         onChange={handleExtraWorkChange}
//                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                         min="0"
//                         max="10"
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="block mb-1 text-sm font-medium text-gray-700">
//                         Overtime Hours
//                       </label>
//                       <input
//                         type="number"
//                         name="extraHours"
//                         value={extraWorkData.extraHours}
//                         onChange={handleExtraWorkChange}
//                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                         min="0"
//                         max="100"
//                         step="0.5"
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="block mb-1 text-sm font-medium text-gray-700">
//                         Overtime Rate (₹/hour)
//                       </label>
//                       <input
//                         type="number"
//                         name="overtimeRate"
//                         value={extraWorkData.overtimeRate}
//                         onChange={handleExtraWorkChange}
//                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                         min="0"
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="block mb-1 text-sm font-medium text-gray-700">
//                         Performance Bonus (₹)
//                       </label>
//                       <input
//                         type="number"
//                         name="bonus"
//                         value={extraWorkData.bonus}
//                         onChange={handleExtraWorkChange}
//                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                         min="0"
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="block mb-1 text-sm font-medium text-gray-700">
//                         Deductions (₹)
//                       </label>
//                       <input
//                         type="number"
//                         name="deductions"
//                         value={extraWorkData.deductions}
//                         onChange={handleExtraWorkChange}
//                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
//                         min="0"
//                       />
//                     </div>
//                   </div>
                  
//                   <div className="mt-4">
//                     <label className="block mb-1 text-sm font-medium text-gray-700">
//                       Reason for Extra Work/Adjustments
//                     </label>
//                     <textarea
//                       name="reason"
//                       value={extraWorkData.reason}
//                       onChange={handleExtraWorkChange}
//                       className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                       rows="3"
//                       placeholder="Enter reason for extra work, bonus, or deductions..."
//                     />
//                   </div>
//                 </div>

//                 {/* Salary Preview */}
//                 <div className="p-4 mb-6 rounded-lg bg-blue-50">
//                   <h4 className="mb-2 text-lg font-semibold text-blue-800">Salary Preview</h4>
//                   <div className="space-y-1 text-sm">
//                     <div className="flex justify-between">
//                       <span>Base Salary:</span>
//                       <span>₹{Math.round(editFormData.workingDays * (selectedEmployee.salaryPerMonth / 22) + (editFormData.halfDays * (selectedEmployee.salaryPerMonth / 44)))}</span>
//                     </div>
//                     {extraWorkData.extraDays > 0 && (
//                       <div className="flex justify-between">
//                         <span>Extra Days:</span>
//                         <span>+ ₹{Math.round(extraWorkData.extraDays * (selectedEmployee.salaryPerMonth / 22))}</span>
//                       </div>
//                     )}
//                     {extraWorkData.extraHours > 0 && (
//                       <div className="flex justify-between">
//                         <span>Overtime ({extraWorkData.extraHours} hrs):</span>
//                         <span>+ ₹{Math.round(extraWorkData.extraHours * extraWorkData.overtimeRate)}</span>
//                       </div>
//                     )}
//                     {extraWorkData.bonus > 0 && (
//                       <div className="flex justify-between">
//                         <span>Bonus:</span>
//                         <span>+ ₹{extraWorkData.bonus}</span>
//                       </div>
//                     )}
//                     {extraWorkData.deductions > 0 && (
//                       <div className="flex justify-between">
//                         <span>Deductions:</span>
//                         <span>- ₹{extraWorkData.deductions}</span>
//                       </div>
//                     )}
//                     <div className="flex justify-between pt-2 font-bold text-blue-800 border-t border-blue-200">
//                       <span>Total Salary:</span>
//                       <span>₹{Math.round(
//                         (editFormData.workingDays * (selectedEmployee.salaryPerMonth / 22)) + 
//                         (editFormData.halfDays * (selectedEmployee.salaryPerMonth / 44)) +
//                         (extraWorkData.extraDays * (selectedEmployee.salaryPerMonth / 22)) +
//                         (extraWorkData.extraHours * extraWorkData.overtimeRate) +
//                         extraWorkData.bonus -
//                         extraWorkData.deductions
//                       )}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
//                 <div className="flex justify-end space-x-3">
//                   <button
//                     type="button"
//                     onClick={() => setShowEditModal(false)}
//                     className="px-6 py-2 font-semibold text-white transition duration-200 bg-gray-500 rounded-lg hover:bg-gray-600"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="px-6 py-2 font-semibold text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
//                   >
//                     Update Salary
//                   </button>
//                 </div>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PayRoll;


import { useEffect, useState } from "react";

const PayRoll = () => {
  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showQuickViewModal, setShowQuickViewModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [employeeAttendanceDetails, setEmployeeAttendanceDetails] = useState([]);
  const [employeeLeaves, setEmployeeLeaves] = useState({});
  const [employeesMasterData, setEmployeesMasterData] = useState({});
  const [editFormData, setEditFormData] = useState({});
  const [extraWorkData, setExtraWorkData] = useState({
    extraDays: 0,
    extraHours: 0,
    overtimeRate: 0,
    bonus: 0,
    deductions: 0,
    reason: ""
  });
  const recordsPerPage = 10;

  const API_URL = "http://localhost:5000/api/attendancesummary/getattendancesummary";
  const ATTENDANCE_API_URL = "http://localhost:5000/api/attendance/allattendance";
  const LEAVES_API_URL = "http://localhost:5000/api/leaves/leaves";
  const EMPLOYEES_API_URL = "http://localhost:5000/api/employees/get-employees";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, employeesRes, leavesRes] = await Promise.all([
        fetch(API_URL),
        fetch(EMPLOYEES_API_URL),
        fetch(LEAVES_API_URL)
      ]);

      const summaryData = await summaryRes.json();
      const employeesData = await employeesRes.json();
      const leavesData = await leavesRes.json();

      const employeesMap = {};
      if (employeesData && employeesData.length > 0) {
        employeesData.forEach(emp => {
          employeesMap[emp.employeeId] = {
            salaryPerMonth: emp.salaryPerMonth || 0,
            shiftHours: emp.shiftHours || 8,
            weekOffPerMonth: emp.weekOffPerMonth || 4,
            name: emp.name || '',
            designation: emp.designation || ''
          };
        });
      }
      setEmployeesMasterData(employeesMap);

      const summaryRecords = summaryData.summary || [];
      setRecords(summaryRecords);
      setFilteredRecords(summaryRecords);
      
      if (leavesData && leavesData.length > 0) {
        processLeavesData(leavesData, summaryRecords);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const processLeavesData = (leavesData, employees) => {
    const leavesMap = {};
    
    employees.forEach(employee => {
      const employeeLeaves = leavesData.filter(leave => 
        leave.employeeId === employee.employeeId
      );
      
      const currentMonth = employee.month;
      const monthlyLeaves = employeeLeaves.filter(leave => {
        if (!leave.startDate) return false;
        const leaveMonth = leave.startDate.substring(0, 7); // YYYY-MM format
        return leaveMonth === currentMonth;
      });
      
      const leaveCounts = {
        CL: 0,
        EL: 0,
        COFF: 0,
        LOP: 0,
        Other: 0,
        // Store individual leave records for display
        leaveDetails: []
      };
      
      monthlyLeaves.forEach(leave => {
        const leaveType = leave.leaveType || 'Other';
        const duration = calculateLeaveDuration(leave.startDate, leave.endDate);
        
        if (leaveCounts[leaveType] !== undefined) {
          leaveCounts[leaveType] += duration;
        } else {
          leaveCounts.Other += duration;
        }
        
        // Store leave details for display
        leaveCounts.leaveDetails.push({
          type: leaveType,
          startDate: leave.startDate,
          endDate: leave.endDate,
          days: duration,
          reason: leave.reason || '',
          status: leave.status || 'pending'
        });
      });
      
      leavesMap[employee.employeeId] = leaveCounts;
    });
    
    setEmployeeLeaves(leavesMap);
  };

  const calculateLeaveDuration = (fromDate, toDate) => {
    if (!fromDate) return 0;
    
    const start = new Date(fromDate);
    const end = toDate ? new Date(toDate) : new Date(fromDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return diffDays;
  };

  // UPDATED: Calculate daily rate based on monthly salary divided by 30
  const calculateDailyRate = (salaryPerMonth) => {
    if (!salaryPerMonth || salaryPerMonth === 0) return 0;
    
    // Calculate daily rate based on 30 days per month
    return (salaryPerMonth / 30).toFixed(2);
  };

  const calculateWeekOffDays = (employee) => {
    const employeeData = employeesMasterData[employee.employeeId];
    return employeeData?.weekOffPerMonth || 4;
  };

  const calculateHolidays = (employee) => {
    return 2;
  };

  // UPDATED: Calculate salary with proper daily rate (Monthly/30)
  const calculateSalary = (employee) => {
    const employeeData = employeesMasterData[employee.employeeId];
    
    if (!employeeData || !employeeData.salaryPerMonth || employeeData.salaryPerMonth === 0) {
      return 0;
    }

    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const weekOffDays = calculateWeekOffDays(employee);
    const holidays = calculateHolidays(employee);
    const dailyRate = calculateDailyRate(employeeData.salaryPerMonth);
    
    const unpaidLeaves = leaves.CL + leaves.EL + leaves.COFF + leaves.LOP;
    
    const paidDays = (employee.workingDays || 0) + weekOffDays + holidays + (0.5 * (employee.halfDays || 0)) - unpaidLeaves;
    
    const effectivePaidDays = Math.max(0, paidDays);
    
    // Base salary from paid days
    let baseSalary = effectivePaidDays * dailyRate;
    
    // Add extra work if any (extra hours have 0 charge as per requirement)
    if (employee.extraWork) {
      baseSalary += ((employee.extraWork.extraDays || 0) * dailyRate) +
                   (employee.extraWork.bonus || 0) -
                   (employee.extraWork.deductions || 0);
      // Note: Extra hours have 0 charge, so no amount added for extraHours
    }
    
    return Math.round(baseSalary);
  };

  // NEW: Calculate salary breakdown for attendance modal
  const calculateSalaryBreakdown = (employee) => {
    const employeeData = employeesMasterData[employee.employeeId];
    
    if (!employeeData || !employeeData.salaryPerMonth || employeeData.salaryPerMonth === 0) {
      return {
        dailyRate: 0,
        workingDaysAmount: 0,
        weekOffAmount: 0,
        holidaysAmount: 0,
        halfDaysAmount: 0,
        unpaidLeavesDeduction: 0,
        extraWorkAmount: 0,
        totalSalary: 0
      };
    }

    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const weekOffDays = calculateWeekOffDays(employee);
    const holidays = calculateHolidays(employee);
    const dailyRate = calculateDailyRate(employeeData.salaryPerMonth);
    
    const unpaidLeaves = leaves.CL + leaves.EL + leaves.COFF + leaves.LOP;
    
    const workingDaysAmount = (employee.workingDays || 0) * dailyRate;
    const weekOffAmount = weekOffDays * dailyRate;
    const holidaysAmount = holidays * dailyRate;
    const halfDaysAmount = (employee.halfDays || 0) * (dailyRate / 2);
    const unpaidLeavesDeduction = unpaidLeaves * dailyRate;
    
    // Extra work calculation (extra hours have 0 charge)
    let extraWorkAmount = 0;
    if (employee.extraWork) {
      extraWorkAmount = ((employee.extraWork.extraDays || 0) * dailyRate) +
                       (employee.extraWork.bonus || 0) -
                       (employee.extraWork.deductions || 0);
    }
    
    const totalSalary = workingDaysAmount + weekOffAmount + holidaysAmount + halfDaysAmount - unpaidLeavesDeduction + extraWorkAmount;
    
    return {
      dailyRate,
      workingDaysAmount: Math.round(workingDaysAmount),
      weekOffAmount: Math.round(weekOffAmount),
      holidaysAmount: Math.round(holidaysAmount),
      halfDaysAmount: Math.round(halfDaysAmount),
      unpaidLeavesDeduction: Math.round(unpaidLeavesDeduction),
      extraWorkAmount: Math.round(extraWorkAmount),
      totalSalary: Math.round(totalSalary)
    };
  };

  const getEmployeeData = (employee) => {
    return employeesMasterData[employee.employeeId] || {
      salaryPerMonth: 0,
      shiftHours: 8,
      weekOffPerMonth: 4,
      name: '',
      designation: ''
    };
  };

  const fetchAttendanceDetails = async (employeeId) => {
    try {
      const response = await fetch(ATTENDANCE_API_URL);
      const data = await response.json();
      
      if (data.records && data.records.length > 0) {
        const employeeRecords = data.records.filter(record => 
          record.employeeId === employeeId
        );
        
        const sortedRecords = employeeRecords.sort((a, b) => 
          new Date(b.checkInTime) - new Date(a.checkInTime)
        );
        
        setEmployeeAttendanceDetails(sortedRecords);
      } else {
        setEmployeeAttendanceDetails([]);
      }
    } catch (error) {
      console.error("Error fetching attendance details:", error);
      setEmployeeAttendanceDetails([]);
    }
  };

  const handleAttendanceRowClick = async (employee) => {
    setSelectedEmployee(employee);
    setShowAttendanceModal(true);
    await fetchAttendanceDetails(employee.employeeId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSaveAttendance = async (attendanceRecord, hours, region, index) => {
    try {
      console.log("Saving attendance:", { attendanceRecord, hours, region });
      
      const updatedDetails = [...employeeAttendanceDetails];
      updatedDetails[index] = {
        ...updatedDetails[index],
        totalHours: parseFloat(hours) || 0,
        region: region
      };
      setEmployeeAttendanceDetails(updatedDetails);
      
      alert("Attendance updated successfully!");
    } catch (error) {
      console.error("Error updating attendance:", error);
      alert("Error updating attendance");
    }
  };

  useEffect(() => {
    const filtered = records.filter(record =>
      record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeId?.toString().includes(searchTerm)
    );
    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchTerm, records]);

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

  const handleRowClick = (employee) => {
    setSelectedEmployee(employee);
    setShowQuickViewModal(true);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const weekOffDays = calculateWeekOffDays(employee);
    const holidays = calculateHolidays(employee);
    const employeeData = getEmployeeData(employee);
    
    setEditFormData({
      presentDays: employee.presentDays || 0,
      workingDays: employee.workingDays || 0,
      halfDays: employee.halfDays || 0,
      fullDayLeaves: employee.fullDayLeaves || 0,
      calculatedSalary: employee.calculatedSalary || calculateSalary(employee),
      weekOffDays: weekOffDays,
      holidays: holidays,
      CL: leaves.CL,
      EL: leaves.EL,
      COFF: leaves.COFF,
      LOP: leaves.LOP,
      // Display daily rate in edit form
      dailyRate: calculateDailyRate(employeeData.salaryPerMonth)
    });
    
    setExtraWorkData({
      extraDays: employee.extraWork?.extraDays || 0,
      extraHours: employee.extraWork?.extraHours || 0,
      overtimeRate: 0, // Extra hours have 0 charge
      bonus: employee.extraWork?.bonus || 0,
      deductions: employee.extraWork?.deductions || 0,
      reason: employee.extraWork?.reason || ""
    });
    
    setShowEditModal(true);
    setShowQuickViewModal(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedEmployee) return;
    
    const employeeData = getEmployeeData(selectedEmployee);
    const leaves = employeeLeaves[selectedEmployee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const weekOffDays = editFormData.weekOffDays || calculateWeekOffDays(selectedEmployee);
    const holidays = editFormData.holidays || calculateHolidays(selectedEmployee);
    const unpaidLeaves = leaves.CL + leaves.EL + leaves.COFF + leaves.LOP;
    const dailyRate = calculateDailyRate(employeeData.salaryPerMonth);
    
    const paidDays = (editFormData.workingDays || 0) + weekOffDays + holidays + (0.5 * (editFormData.halfDays || 0)) - unpaidLeaves;
    const effectivePaidDays = Math.max(0, paidDays);
    const baseSalary = effectivePaidDays * dailyRate;
    
    // Extra work calculation (extra hours have 0 charge)
    const extraDaysAmount = (extraWorkData.extraDays || 0) * dailyRate;
    const totalExtraAmount = extraDaysAmount + (extraWorkData.bonus || 0) - (extraWorkData.deductions || 0);
    const finalSalary = baseSalary + totalExtraAmount;

    const updatedData = {
      ...editFormData,
      calculatedSalary: Math.round(finalSalary),
      extraWork: {
        extraDays: extraWorkData.extraDays || 0,
        extraHours: extraWorkData.extraHours || 0,
        overtimeRate: 0, // Extra hours have 0 charge
        overtimeAmount: 0, // Extra hours have 0 charge
        bonus: extraWorkData.bonus || 0,
        deductions: extraWorkData.deductions || 0,
        totalExtraAmount: totalExtraAmount,
        reason: extraWorkData.reason || ""
      }
    };

    const updatedRecords = records.map(record => 
      record.employeeId === selectedEmployee.employeeId 
        ? { ...record, ...updatedData }
        : record
    );
    
    setRecords(updatedRecords);
    setShowEditModal(false);
    setShowQuickViewModal(false);
    alert("Salary details updated successfully!");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const handleExtraWorkChange = (e) => {
    const { name, value } = e.target;
    setExtraWorkData(prev => ({
      ...prev,
      [name]: name === 'reason' ? value : (parseFloat(value) || 0)
    }));
  };

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
    setShowQuickViewModal(false);
  };

  const downloadInvoice = (employee) => {
    const invoiceContent = generateInvoiceHTML(employee);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
    printWindow.print();
  };

  const generateInvoiceHTML = (employee) => {
    const employeeData = getEmployeeData(employee);
    
    if (!employeeData.salaryPerMonth || employeeData.salaryPerMonth === 0) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Salary Invoice - ${employee?.name || 'Unknown'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; text-align: center; }
            .error { color: red; font-size: 18px; margin-top: 100px; }
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

    const salaryBreakdown = calculateSalaryBreakdown(employee);
    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const weekOffDays = calculateWeekOffDays(employee);
    const holidays = calculateHolidays(employee);
    const unpaidLeaves = leaves.CL + leaves.EL + leaves.COFF + leaves.LOP;

    const hasExtraWork = employee.extraWork && (
      (employee.extraWork.extraDays || 0) > 0 || 
      (employee.extraWork.bonus || 0) > 0 || 
      (employee.extraWork.deductions || 0) > 0
    );

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Salary Invoice - ${employee.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
          .invoice-container { max-width: 800px; margin: 0 auto; border: 2px solid #3b82f6; border-radius: 10px; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
          .company-name { font-size: 28px; font-weight: bold; color: #3b82f6; margin-bottom: 5px; }
          .invoice-title { font-size: 24px; font-weight: bold; margin: 20px 0; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
          .detail-item { margin-bottom: 10px; }
          .detail-label { font-weight: bold; color: #666; }
          .salary-breakdown { margin: 30px 0; }
          .breakdown-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .breakdown-table th, .breakdown-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .breakdown-table th { background-color: #3b82f6; color: white; }
          .total-row { font-weight: bold; background-color: #f8fafc; }
          .extra-work-row { background-color: #f0f9ff; }
          .paid-leave-row { background-color: #f0fff4; }
          .leave-deduction-row { background-color: #fef2f2; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #3b82f6; color: #666; }
          .signature { margin-top: 50px; display: flex; justify-content: space-between; }
          .signature-box { width: 200px; border-top: 1px solid #333; padding-top: 10px; text-align: center; }
          .notes { margin-top: 20px; padding: 15px; background-color: #f8fafc; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-name">TECH SOLUTIONS LTD</div>
            <div>123 Tech Park, Innovation City, IC 12345</div>
            <div>Phone: (123) 456-7890 | Email: hr@techsolutions.com</div>
          </div>

          <div class="invoice-title">SALARY INVOICE</div>

          <div class="details-grid">
            <div>
              <div class="detail-item">
                <span class="detail-label">Employee ID:</span> ${employee.employeeId}
              </div>
              <div class="detail-item">
                <span class="detail-label">Employee Name:</span> ${employee.name}
              </div>
              <div class="detail-item">
                <span class="detail-label">Month:</span> ${employee.month}
              </div>
            </div>
            <div>
              <div class="detail-item">
                <span class="detail-label">Invoice Date:</span> ${new Date().toLocaleDateString()}
              </div>
              <div class="detail-item">
                <span class="detail-label">Invoice No:</span> INV-${employee.employeeId}-${new Date().getTime()}
              </div>
            </div>
          </div>

          <div class="salary-breakdown">
            <h3>Salary Breakdown</h3>
            <table class="breakdown-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Days/Hours</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr class="paid-leave-row">
                  <td colspan="4"><strong>Paid Components</strong></td>
                </tr>
                <tr>
                  <td>Working Days</td>
                  <td>${employee.workingDays || 0}</td>
                  <td>₹${salaryBreakdown.dailyRate}/day</td>
                  <td>₹${salaryBreakdown.workingDaysAmount}</td>
                </tr>
                <tr>
                  <td>WeekOff Days (Paid)</td>
                  <td>${weekOffDays}</td>
                  <td>₹${salaryBreakdown.dailyRate}/day</td>
                  <td>₹${salaryBreakdown.weekOffAmount}</td>
                </tr>
                <tr>
                  <td>Holidays (Paid)</td>
                  <td>${holidays}</td>
                  <td>₹${salaryBreakdown.dailyRate}/day</td>
                  <td>₹${salaryBreakdown.holidaysAmount}</td>
                </tr>
                ${(employee.halfDays || 0) > 0 ? `
                <tr>
                  <td>Half Days (0.5 day each)</td>
                  <td>${employee.halfDays}</td>
                  <td>₹${Math.round(salaryBreakdown.dailyRate / 2)}/half-day</td>
                  <td>₹${salaryBreakdown.halfDaysAmount}</td>
                </tr>
                ` : ''}
                
                ${unpaidLeaves > 0 ? `
                <tr class="leave-deduction-row">
                  <td colspan="4"><strong>Leave Deductions (Unpaid)</strong></td>
                </tr>
                <tr class="leave-deduction-row">
                  <td>Unpaid Leaves (CL+EL+COFF+LOP)</td>
                  <td>${unpaidLeaves}</td>
                  <td>₹${salaryBreakdown.dailyRate}/day</td>
                  <td>-₹${salaryBreakdown.unpaidLeavesDeduction}</td>
                </tr>
                ` : ''}
                
                ${hasExtraWork ? `
                <tr class="extra-work-row">
                  <td colspan="4"><strong>Extra Work & Adjustments</strong></td>
                </tr>
                ${(employee.extraWork.extraDays || 0) > 0 ? `
                <tr class="extra-work-row">
                  <td>Extra Working Days</td>
                  <td>${employee.extraWork.extraDays}</td>
                  <td>₹${salaryBreakdown.dailyRate}/day</td>
                  <td>₹${Math.round((employee.extraWork.extraDays || 0) * salaryBreakdown.dailyRate)}</td>
                </tr>
                ` : ''}
                ${(employee.extraWork.extraHours || 0) > 0 ? `
                <tr class="extra-work-row">
                  <td>Extra Hours (No Charge)</td>
                  <td>${employee.extraWork.extraHours}</td>
                  <td>₹0/hour</td>
                  <td>₹0</td>
                </tr>
                ` : ''}
                ${(employee.extraWork.bonus || 0) > 0 ? `
                <tr class="extra-work-row">
                  <td>Performance Bonus</td>
                  <td>-</td>
                  <td>-</td>
                  <td>₹${employee.extraWork.bonus}</td>
                </tr>
                ` : ''}
                ${(employee.extraWork.deductions || 0) > 0 ? `
                <tr class="extra-work-row">
                  <td>Other Deductions</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-₹${employee.extraWork.deductions}</td>
                </tr>
                ` : ''}
                ` : ''}
                
                <tr class="total-row">
                  <td colspan="3"><strong>Total Salary</strong></td>
                  <td><strong>₹${employee.calculatedSalary || salaryBreakdown.totalSalary}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="salary-breakdown">
            <h3>Salary Summary</h3>
            <table class="breakdown-table">
              <thead>
                <tr>
                  <th>Particulars</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Monthly Salary</td>
                  <td>₹${employeeData.salaryPerMonth}</td>
                </tr>
                <tr>
                  <td>Daily Rate (Monthly/30)</td>
                  <td>₹${salaryBreakdown.dailyRate}/day</td>
                </tr>
                <tr>
                  <td>Effective Paid Days</td>
                  <td>${(employee.workingDays || 0) + weekOffDays + holidays + (0.5 * (employee.halfDays || 0)) - unpaidLeaves}</td>
                </tr>
                <tr class="total-row">
                  <td><strong>Final Salary</strong></td>
                  <td><strong>₹${employee.calculatedSalary || salaryBreakdown.totalSalary}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          ${hasExtraWork && employee.extraWork.reason ? `
          <div class="notes">
            <strong>Notes:</strong> ${employee.extraWork.reason}
          </div>
          ` : ''}

          <div class="signature">
            <div class="signature-box">
              Employee Signature
            </div>
            <div class="signature-box">
              Authorized Signature
            </div>
          </div>

          <div class="footer">
            Thank you for your hard work and dedication!
          </div>
        </div>
      </body>
      </html>
    `;
  };

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

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-7xl">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">Payroll Management</h1>
          <p className="text-gray-600">Manage employee salaries, attendance, and leaves</p>
        </div>

        {/* Search and Filter Section */}
        <div className="p-6 mb-6 bg-white border border-blue-200 shadow-lg rounded-2xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex-1 w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Employee ID or Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchData}
                className="flex items-center px-6 py-3 font-semibold text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-4">
          <div className="p-6 bg-white border-l-4 border-blue-500 shadow-lg rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-800">{filteredRecords.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border-l-4 border-green-500 shadow-lg rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Salary</p>
                <p className="text-2xl font-bold text-gray-800">
                  ₹{filteredRecords.reduce((sum, emp) => sum + calculateSalary(emp), 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border-l-4 border-purple-500 shadow-lg rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active This Month</p>
                <p className="text-2xl font-bold text-gray-800">
                  {filteredRecords.filter(emp => (emp.workingDays || 0) > 0).length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border-l-4 border-red-500 shadow-lg rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On Leave</p>
                <p className="text-2xl font-bold text-gray-800">
                  {filteredRecords.filter(emp => {
                    const leaves = employeeLeaves[emp.employeeId];
                    return leaves && (leaves.CL + leaves.EL + leaves.COFF + leaves.LOP) > 0;
                  }).length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden bg-white border border-blue-200 shadow-xl rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-white bg-gradient-to-r from-blue-600 to-indigo-700">
                <tr>
                  <th className="p-4 font-semibold text-left">Employee ID</th>
                  <th className="p-4 font-semibold text-left">Name</th>
                  <th className="p-4 font-semibold text-center">Present</th>
                  <th className="p-4 font-semibold text-center">Working Days</th>
                  <th className="p-4 font-semibold text-center">Half Days</th>
                  <th className="p-4 font-semibold text-center">Leave Types</th>
                  <th className="p-4 font-semibold text-center">Salary</th>
                  <th className="p-4 font-semibold text-center">Month</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg font-medium">No records found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((item, index) => {
                    const calculatedSalary = calculateSalary(item);
                    const employeeData = getEmployeeData(item);
                    const hasSalaryData = employeeData.salaryPerMonth && employeeData.salaryPerMonth > 0;
                    const dailyRate = calculateDailyRate(employeeData.salaryPerMonth);
                    
                    return (
                      <tr 
                        key={item._id} 
                        className={`hover:bg-blue-50 transition duration-150 cursor-pointer ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td 
                          className="p-4 font-medium text-gray-900 hover:text-blue-600 hover:underline"
                          onClick={() => handleAttendanceRowClick(item)}
                        >
                          {item.employeeId}
                        </td>
                        
                        <td 
                          className="p-4 hover:text-blue-600 hover:underline"
                          onClick={() => handleAttendanceRowClick(item)}
                        >
                          <div className="flex items-center">
                            <div className="flex items-center justify-center w-8 h-8 mr-3 font-semibold text-blue-800 bg-blue-100 rounded-full">
                              {item.name?.charAt(0) || 'U'}
                            </div>
                            <span className="font-medium text-gray-800">{item.name}</span>
                            {!hasSalaryData && (
                              <span className="px-2 py-1 ml-2 text-xs text-red-800 bg-red-100 rounded-full">
                                No Salary Data
                              </span>
                            )}
                          </div>
                        </td>
                        
                        <td 
                          className="p-4 text-center hover:text-blue-600 hover:underline"
                          onClick={() => handleAttendanceRowClick(item)}
                        >
                          <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                            {item.presentDays || 0}
                          </span>
                        </td>
                        
                        <td 
                          className="p-4 text-center hover:text-blue-600 hover:underline"
                          onClick={() => handleAttendanceRowClick(item)}
                        >
                          <span className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                            {item.workingDays || 0}
                          </span>
                        </td>
                        
                        <td 
                          className="p-4 text-center hover:text-blue-600 hover:underline"
                          onClick={() => handleAttendanceRowClick(item)}
                        >
                          <span className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
                            {item.halfDays || 0}
                          </span>
                        </td>
                        
                        <td 
                          className="p-4 text-center hover:text-blue-600 hover:underline"
                          onClick={() => handleAttendanceRowClick(item)}
                        >
                          <span className="px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">
                            {getLeaveTypes(item)}
                          </span>
                        </td>
                        
                        <td 
                          className="p-4 font-semibold text-center hover:text-blue-600 hover:underline"
                          onClick={() => handleAttendanceRowClick(item)}
                        >
                          {hasSalaryData ? (
                            <div>
                              <div className="text-green-700">₹{calculatedSalary}</div>
                              <div className="text-xs text-gray-500">₹{dailyRate}/day</div>
                            </div>
                          ) : (
                            <span className="text-red-600">₹0</span>
                          )}
                        </td>
                        
                        <td 
                          className="p-4 text-center text-gray-600 hover:text-blue-600 hover:underline"
                          onClick={() => handleAttendanceRowClick(item)}
                        >
                          {item.month || "-"}
                        </td>
                        
                        <td className="p-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(item);
                              }}
                              className="p-2 text-white transition duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
                              title="View Details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(item);
                              }}
                              className="p-2 text-white transition duration-200 bg-green-500 rounded-lg hover:bg-green-600"
                              title="Edit Salary"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadInvoice(item);
                              }}
                              className="p-2 text-white transition duration-200 bg-purple-500 rounded-lg hover:bg-purple-600"
                              title="Download Invoice"
                              disabled={!hasSalaryData}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
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
            <div className="px-6 py-4 bg-white border-t border-gray-200">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredRecords.length)} of {filteredRecords.length} entries
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg border ${
                      currentPage === 1 
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
                        className={`px-4 py-2 rounded-lg border ${
                          currentPage === pageNumber
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
                    className={`px-4 py-2 rounded-lg border ${
                      currentPage === totalPages
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

      {/* UPDATED: Attendance Details Modal with Enhanced Salary Calculation (Monthly/30) */}
      {showAttendanceModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-blue-700">
                🧾 Attendance Details — {selectedEmployee.name} (ID: {selectedEmployee.employeeId})
              </h3>
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="text-lg font-bold text-red-600 hover:text-red-700"
              >
                ✖
              </button>
            </div>

            {/* Employee Summary with Salary Calculation */}
            <div className="grid grid-cols-2 gap-4 p-4 mb-6 rounded-lg md:grid-cols-4 bg-blue-50">
              <div>
                <p className="text-sm text-gray-600">Working Days</p>
                <p className="text-lg font-bold text-blue-600">{selectedEmployee.workingDays || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">WeekOff Days</p>
                <p className="text-lg font-bold text-purple-600">{calculateWeekOffDays(selectedEmployee)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Holidays</p>
                <p className="text-lg font-bold text-green-600">{calculateHolidays(selectedEmployee)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Unpaid Leaves</p>
                <p className="text-lg font-bold text-red-600">
                  {employeeLeaves[selectedEmployee.employeeId] ? 
                    (employeeLeaves[selectedEmployee.employeeId].CL + 
                     employeeLeaves[selectedEmployee.employeeId].EL + 
                     employeeLeaves[selectedEmployee.employeeId].COFF + 
                     employeeLeaves[selectedEmployee.employeeId].LOP) : 0}
                </p>
              </div>
            </div>

            {/* NEW: Employee Leaves Breakdown */}
            <div className="p-4 mb-6 rounded-lg bg-yellow-50">
              <h4 className="mb-3 text-lg font-semibold text-yellow-800">
                📋 Leave Details — {selectedEmployee.name}
              </h4>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Casual Leave (CL)</p>
                  <p className="text-lg font-bold text-orange-600">
                    {employeeLeaves[selectedEmployee.employeeId]?.CL || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Earned Leave (EL)</p>
                  <p className="text-lg font-bold text-blue-600">
                    {employeeLeaves[selectedEmployee.employeeId]?.EL || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Comp Off (COFF)</p>
                  <p className="text-lg font-bold text-purple-600">
                    {employeeLeaves[selectedEmployee.employeeId]?.COFF || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Loss of Pay (LOP)</p>
                  <p className="text-lg font-bold text-red-600">
                    {employeeLeaves[selectedEmployee.employeeId]?.LOP || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Other Leaves</p>
                  <p className="text-lg font-bold text-gray-600">
                    {employeeLeaves[selectedEmployee.employeeId]?.Other || 0}
                  </p>
                </div>
              </div>
              
              {/* Detailed Leave Records */}
              {employeeLeaves[selectedEmployee.employeeId]?.leaveDetails?.length > 0 && (
                <div className="mt-4">
                  <h5 className="mb-2 font-semibold text-gray-700">Individual Leave Records:</h5>
                  <div className="space-y-2 overflow-y-auto max-h-40">
                    {employeeLeaves[selectedEmployee.employeeId].leaveDetails.map((leave, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white border rounded">
                        <span className="text-sm">
                          <strong>{leave.type}</strong>: {leave.startDate} to {leave.endDate}
                        </span>
                        <span className="text-sm text-gray-600">{leave.days} days</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          leave.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          leave.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {leave.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* UPDATED: Salary Calculation Section with Daily Rate (Monthly/30) */}
            <div className="p-4 mb-6 rounded-lg bg-green-50">
              <h4 className="mb-3 text-lg font-semibold text-green-800">💰 Salary Calculation (Monthly/30)</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Monthly Salary:</span>
                    <span className="font-semibold">₹{getEmployeeData(selectedEmployee).salaryPerMonth || 0}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Daily Rate (Monthly/30):</span>
                    <span className="font-semibold">₹{calculateDailyRate(getEmployeeData(selectedEmployee).salaryPerMonth)}/day</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Working Days Amount:</span>
                    <span className="font-semibold">
                      ₹{Math.round((selectedEmployee.workingDays || 0) * calculateDailyRate(getEmployeeData(selectedEmployee).salaryPerMonth))}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">WeekOff Amount:</span>
                    <span className="font-semibold">
                      ₹{Math.round(calculateWeekOffDays(selectedEmployee) * calculateDailyRate(getEmployeeData(selectedEmployee).salaryPerMonth))}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Holidays Amount:</span>
                    <span className="font-semibold">
                      ₹{Math.round(calculateHolidays(selectedEmployee) * calculateDailyRate(getEmployeeData(selectedEmployee).salaryPerMonth))}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Half Days Amount:</span>
                    <span className="font-semibold">
                      ₹{Math.round((selectedEmployee.halfDays || 0) * (calculateDailyRate(getEmployeeData(selectedEmployee).salaryPerMonth) / 2))}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Unpaid Leaves Deduction:</span>
                    <span className="font-semibold text-red-600">
                      -₹{Math.round((employeeLeaves[selectedEmployee.employeeId] ? 
                        (employeeLeaves[selectedEmployee.employeeId].CL + 
                         employeeLeaves[selectedEmployee.employeeId].EL + 
                         employeeLeaves[selectedEmployee.employeeId].COFF + 
                         employeeLeaves[selectedEmployee.employeeId].LOP) : 0) * calculateDailyRate(getEmployeeData(selectedEmployee).salaryPerMonth))}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-green-200">
                    <span className="text-lg font-bold text-gray-800">Total Salary:</span>
                    <span className="text-lg font-bold text-green-700">₹{calculateSalary(selectedEmployee)}</span>
                  </div>
                </div>
              </div>
            </div>

            <table className="w-full text-sm border">
              <thead className="text-white bg-blue-600">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Month</th>
                  <th className="px-4 py-2">Check-In</th>
                  <th className="px-4 py-2">Check-Out</th>
                  <th className="px-4 py-2">Region</th>
                  <th className="px-4 py-2">Hours</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>

              <tbody>
                {employeeAttendanceDetails.length > 0 ? (
                  employeeAttendanceDetails.map((rec, i) => {
                    const checkIn = new Date(rec.checkInTime);
                    const checkOut = rec.checkOutTime ? new Date(rec.checkOutTime) : null;

                    const diffHrs = checkOut
                      ? ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2)
                      : "-";

                    const monthYear = checkIn.toLocaleString("en-IN", {
                      month: "long",
                      year: "numeric",
                    });

                    return (
                      <tr key={i} className="border-t hover:bg-blue-50">
                        <td className="px-4 py-2">
                          {checkIn.toLocaleDateString("en-IN")}
                        </td>

                        <td className="px-4 py-2 font-medium">{monthYear}</td>

                        <td className="px-4 py-2">{formatDate(rec.checkInTime)}</td>

                        <td className="px-4 py-2">
                          {rec.checkOutTime ? formatDate(rec.checkOutTime) : "-"}
                        </td>

                        <td className="px-4 py-2">
                          <select
                            className="w-full px-2 py-1 border rounded"
                            value={rec.region || ""}
                            onChange={(e) => {
                              const updated = [...employeeAttendanceDetails];
                              updated[i].region = e.target.value;
                              setEmployeeAttendanceDetails(updated);
                            }}
                          >
                            <option value="">Select</option>
                            <option value="Onsite">Onsite</option>
                            <option value="Remote">Remote</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="Office">Office</option>
                          </select>
                        </td>

                        <td className="px-4 py-2">
                          <input
                            type="number"
                            step="0.1"
                            className="w-20 px-2 py-1 border rounded"
                            value={rec.hours || rec.totalHours || diffHrs}
                            onChange={(e) => {
                              const updated = [...employeeAttendanceDetails];
                              updated[i].hours = e.target.value;
                              setEmployeeAttendanceDetails(updated);
                            }}
                          />
                        </td>

                        <td className="px-4 py-2">
                          <button
                            className="px-3 py-1 text-white bg-green-600 rounded hover:bg-green-700"
                            onClick={() => handleSaveAttendance(rec, rec.hours || rec.totalHours, rec.region, i)}
                          >
                            Save
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      No attendance records found for this employee
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600"
              >
                Close
              </button>
              <button
                onClick={() => handleEdit(selectedEmployee)}
                className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
              >
                Edit Salary
              </button>
              <button
                onClick={() => downloadInvoice(selectedEmployee)}
                className="px-4 py-2 text-white bg-purple-600 rounded hover:bg-purple-700"
                disabled={!getEmployeeData(selectedEmployee).salaryPerMonth}
              >
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Salary Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-blue-700">
                ✏️ Edit Salary — {selectedEmployee.name} (ID: {selectedEmployee.employeeId})
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-lg font-bold text-red-600 hover:text-red-700"
              >
                ✖
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700">Attendance Details</h4>
                  
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">
                      Working Days
                    </label>
                    <input
                      type="number"
                      name="workingDays"
                      value={editFormData.workingDays}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">
                      Half Days
                    </label>
                    <input
                      type="number"
                      name="halfDays"
                      value={editFormData.halfDays}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">
                      Daily Rate (Monthly/30)
                    </label>
                    <input
                      type="text"
                      value={`₹${editFormData.dailyRate || 0}`}
                      disabled
                      className="w-full px-3 py-2 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700">Extra Work & Adjustments</h4>
                  
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">
                      Extra Days
                    </label>
                    <input
                      type="number"
                      name="extraDays"
                      value={extraWorkData.extraDays}
                      onChange={handleExtraWorkChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">
                      Bonus
                    </label>
                    <input
                      type="number"
                      name="bonus"
                      value={extraWorkData.bonus}
                      onChange={handleExtraWorkChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">
                      Deductions
                    </label>
                    <input
                      type="number"
                      name="deductions"
                      value={extraWorkData.deductions}
                      onChange={handleExtraWorkChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block mb-1 text-sm font-medium text-gray-600">
                  Reason for Adjustments
                </label>
                <textarea
                  name="reason"
                  value={extraWorkData.reason}
                  onChange={handleExtraWorkChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter reason for bonus or deductions..."
                />
              </div>

              <div className="p-4 mb-6 rounded-lg bg-yellow-50">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-800">Calculated Salary:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{editFormData.calculatedSalary}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 text-gray-700 transition duration-200 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-white transition duration-200 bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Update Salary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 bg-white shadow-xl rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-blue-700">
                👤 Employee Details — {selectedEmployee.name}
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-lg font-bold text-red-600 hover:text-red-700"
              >
                ✖
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Employee ID</p>
                  <p className="font-semibold">{selectedEmployee.employeeId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold">{selectedEmployee.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Working Days</p>
                  <p className="font-semibold text-blue-600">{selectedEmployee.workingDays || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Half Days</p>
                  <p className="font-semibold text-yellow-600">{selectedEmployee.halfDays || 0}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Month</p>
                <p className="font-semibold">{selectedEmployee.month || "-"}</p>
              </div>

              <div className="p-4 rounded-lg bg-green-50">
                <p className="text-sm text-gray-600">Calculated Salary</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{calculateSalary(selectedEmployee)}
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2 text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {showQuickViewModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-700">Quick View</h3>
              <button
                onClick={() => setShowQuickViewModal(false)}
                className="text-lg font-bold text-red-600 hover:text-red-700"
              >
                ✖
              </button>
            </div>
            <div className="space-y-2">
              <p><strong>ID:</strong> {selectedEmployee.employeeId}</p>
              <p><strong>Name:</strong> {selectedEmployee.name}</p>
              <p><strong>Working Days:</strong> {selectedEmployee.workingDays || 0}</p>
              <p><strong>Salary:</strong> ₹{calculateSalary(selectedEmployee)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayRoll;