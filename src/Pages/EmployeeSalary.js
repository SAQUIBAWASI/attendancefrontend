
// import axios from "axios";
// import { Download, Eye, RefreshCw, Search, X } from "lucide-react";
// import { useCallback, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import logo from "../Images/Timely-Health-Logo.png";
// import CountUp from "react-countup";
// import { FiFileText, FiDollarSign, FiDownloadCloud, FiPieChart } from "react-icons/fi";

// export default function EmployeeDashboard() {
//   const [records, setRecords] = useState([]);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [selectedMonth, setSelectedMonth] = useState("");
//   const [isLoadingMonth, setIsLoadingMonth] = useState(false);
//   const [employeesMasterData, setEmployeesMasterData] = useState({});
//   const [employeeLeaves, setEmployeeLeaves] = useState({});
//   const [monthDays, setMonthDays] = useState(30);
//   const [monthInfo, setMonthInfo] = useState({
//     isHistorical: false,
//     isCurrent: false,
//     includeWeekOff: false,
//     canDownload: false
//   });

//   const recordsPerPage = 10;
//   const navigate = useNavigate();
//   const BASE_URL = "https://api.timelyhealth.in";

//   // ✅ Get current logged-in employee data
//   const getCurrentEmployee = () => {
//     const employeeData = JSON.parse(localStorage.getItem("employeeData"));
//     return employeeData || {};
//   };

//   // ✅ Check if month is historical
//   const isHistoricalMonth = (month) => {
//     if (!month) return false;

//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth() + 1;

//     const [year, monthNum] = month.split('-').map(Number);

//     if (year < currentYear) return true;
//     if (year === currentYear && monthNum < currentMonth) return true;

//     return false;
//   };

//   // ✅ Check if month is current month
//   const isCurrentMonth = (month) => {
//     if (!month) return true;

//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth() + 1;

//     const [year, monthNum] = month.split('-').map(Number);

//     return year === currentYear && monthNum === currentMonth;
//   };

//   // ✅ Check if week-off should be included in salary
//   const shouldIncludeWeekOffInSalary = (month) => {
//     if (isHistoricalMonth(month)) return true;

//     if (isCurrentMonth(month)) {
//       const today = new Date();
//       const currentDay = today.getDate();
//       return currentDay >= 26;
//     }

//     return true;
//   };

//   // ✅ Check if payslip download is allowed
//   const isPayslipDownloadAllowed = (month) => {
//     if (isHistoricalMonth(month)) return true;

//     if (isCurrentMonth(month)) {
//       const today = new Date();
//       const currentDay = today.getDate();
//       return currentDay >= 30;
//     }

//     return true;
//   };

//   // ✅ Process Leaves Data
//   const processLeavesData = useCallback((leavesData) => {
//     const leavesMap = {};

//     leavesData.forEach(leave => {
//       const employeeId = leave.employeeId;
//       if (!employeeId) return;

//       if (!leavesMap[employeeId]) {
//         leavesMap[employeeId] = {
//           CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0, leaveDetails: []
//         };
//       }

//       const leaveType = leave.leaveType || 'Other';
//       const duration = calculateLeaveDuration(leave.startDate, leave.endDate);

//       if (leavesMap[employeeId][leaveType] !== undefined) {
//         leavesMap[employeeId][leaveType] += duration;
//       } else {
//         leavesMap[employeeId].Other += duration;
//       }

//       leavesMap[employeeId].leaveDetails.push({
//         type: leaveType,
//         startDate: leave.startDate,
//         endDate: leave.endDate,
//         days: duration,
//         reason: leave.reason || '',
//         status: leave.status || 'pending'
//       });
//     });

//     setEmployeeLeaves(leavesMap);
//   }, []);

//   const calculateLeaveDuration = (fromDate, toDate) => {
//     if (!fromDate) return 0;
//     const start = new Date(fromDate);
//     const end = toDate ? new Date(toDate) : new Date(fromDate);
//     const diffTime = Math.abs(end - start);
//     return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
//   };

//   // ✅ Fetch Master Data (Employees & Leaves)
//   useEffect(() => {
//     const fetchMasterData = async () => {
//       try {
//         const [empRes, leavesRes] = await Promise.all([
//           fetch(`${BASE_URL}/api/employees/get-employees`).catch(() => ({ ok: false })),
//           fetch(`${BASE_URL}/api/leaves/leaves?status=approved`).catch(() => ({ ok: false }))
//         ]);

//         if (empRes.ok) {
//           const employees = await empRes.json();
//           const empMap = {};
//           employees.forEach(emp => {
//             empMap[emp.employeeId] = {
//               salaryPerMonth: emp.salaryPerMonth || 0,
//               shiftHours: emp.shiftHours || 8,
//               weekOffPerMonth: emp.weekOffPerMonth || 0,
//               name: emp.name,
//               employeeId: emp.employeeId,
//               department: emp.department || '',
//               designation: emp.role || emp.designation || '',
//               joiningDate: emp.joinDate || emp.joiningDate || '',
//               bankAccount: emp.bankAccount || '',
//               panCard: emp.panCard || '',
//               weekOffDay: emp.weekOffDay || '',
//               weekOffType: emp.weekOffType || '0+4'
//             };
//           });
//           setEmployeesMasterData(empMap);
//         }

//         if (leavesRes.ok) {
//           const leaves = await leavesRes.json();
//           processLeavesData(leaves);
//         }
//       } catch (error) {
//         console.error("Error fetching master data:", error);
//       }
//     };

//     fetchMasterData();
//   }, [processLeavesData]);

//   // ✅ Helper to get Employee Data
//   const getEmployeeData = (employee) => {
//     return employeesMasterData[employee.employeeId] || {
//       salaryPerMonth: employee.salaryPerMonth || 0,
//       shiftHours: 8,
//       weekOffPerMonth: employee.weekOffs || 0,
//       name: employee.name || '',
//       designation: '',
//       department: '',
//       joiningDate: '',
//       employeeId: employee.employeeId
//     };
//   };

//   // ✅ Calculate Daily Rate
//   const calculateDailyRate = (employee) => {
//     const empData = getEmployeeData(employee);
//     if (!empData || !empData.salaryPerMonth) return 0;
//     const daysInMonth = employee.monthDays || monthDays || 30;
//     return (empData.salaryPerMonth / daysInMonth).toFixed(2);
//   };

//   // ✅ Format month for display
//   const formatMonthDisplay = (monthStr) => {
//     if (!monthStr || monthStr === "Not specified") return "Current Month";
//     const [year, month] = monthStr.split("-");
//     const monthNames = [
//       'January', 'February', 'March', 'April', 'May', 'June',
//       'July', 'August', 'September', 'October', 'November', 'December'
//     ];
//     return `${monthNames[parseInt(month) - 1]} ${year}`;
//   };

//   // ✅ Format month for API (YYYY-MM)
//   const formatMonthForAPI = (date) => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     return `${year}-${month}`;
//   };

//   // ✅ Get current month in YYYY-MM format
//   const getCurrentMonth = () => {
//     const today = new Date();
//     return formatMonthForAPI(today);
//   };

//   // ✅ Fetch salary data for current employee
//   const fetchSalaryData = async (month = "") => {
//     try {
//       setLoading(true);
//       setIsLoadingMonth(true);
//       setError(null);

//       const employeeData = getCurrentEmployee();
//       const employeeId = employeeData?.employeeId;

//       if (!employeeId) {
//         setError("❌ Employee ID not found. Please log in again.");
//         setLoading(false);
//         return;
//       }

//       console.log("📥 Fetching salary data for employee:", employeeId, "Month:", month || "Current");

//       // Update month info
//       const isHistorical = isHistoricalMonth(month);
//       const isCurrent = isCurrentMonth(month);
//       const includeWeekOff = shouldIncludeWeekOffInSalary(month);
//       const canDownload = isPayslipDownloadAllowed(month);

//       setMonthInfo({
//         isHistorical,
//         isCurrent,
//         includeWeekOff,
//         canDownload
//       });

//       // Fetch salary data with or without month filter
//       const salaryUrl = month
//         ? `${BASE_URL}/api/attendancesummary/getsalaries?month=${month}`
//         : `${BASE_URL}/api/attendancesummary/getsalaries`;

//       const salaryRes = await fetch(salaryUrl);

//       if (!salaryRes.ok) {
//         throw new Error(`Failed to fetch salary data: ${salaryRes.status}`);
//       }

//       const salaryData = await salaryRes.json();
//       console.log("💰 Salary API Response:", salaryData);

//       let employeeSalaryRecords = [];

//       if (salaryData.success && salaryData.salaries && salaryData.salaries.length > 0) {
//         // Filter only current employee's records
//         employeeSalaryRecords = salaryData.salaries
//           .filter(salary => salary.employeeId === employeeId)
//           .map(salary => {
//             const actualWeekOffDays = salary.weekOffs || 0;
//             const weekOffDaysForSalary = includeWeekOff ? actualWeekOffDays : 0;

//             // Adjust calculated salary if week-off not included
//             let calculatedSalary = salary.calculatedSalary || 0;
//             if (!includeWeekOff && calculatedSalary > 0) {
//               const daysInMonth = salaryData.monthDays || 30;
//               const dailyRate = (salary.salaryPerMonth || 0) / daysInMonth;
//               const weekOffAmount = actualWeekOffDays * dailyRate;
//               calculatedSalary = Math.max(0, calculatedSalary - weekOffAmount);
//             }

//             return {
//               ...salary,
//               employeeId: salary.employeeId,
//               name: salary.name,
//               presentDays: salary.presentDays || 0,
//               workingDays: salary.totalWorkingDays || salary.workingDays || 0,
//               totalWorkingDays: salary.totalWorkingDays || salary.workingDays || 0,
//               halfDays: salary.halfDayWorking || 0,
//               calculatedSalary: calculatedSalary,
//               month: salary.month || month || "Not specified",
//               monthFormatted: formatMonthDisplay(salary.month || month),
//               weekOffs: actualWeekOffDays,
//               weekOffsForSalary: weekOffDaysForSalary,
//               totalLeaves: salary.totalLeaves || 0,
//               salaryPerMonth: salary.salaryPerMonth || 0,
//               extraWork: salary.extraWork || {},
//               monthDays: salaryData.monthDays || 30,
//               isHistoricalMonth: isHistorical,
//               isCurrentMonth: isCurrent,
//               includeWeekOffInSalary: includeWeekOff,
//               canDownload: canDownload
//             };
//           });

//         if (salaryData.monthDays) {
//           setMonthDays(salaryData.monthDays);
//         }
//       }

//       // Sort by latest month first
//       const sortedRecords = employeeSalaryRecords.sort((a, b) => {
//         const monthA = a.month || "";
//         const monthB = b.month || "";
//         return monthB.localeCompare(monthA);
//       });

//       console.log("✅ Employee Salary Records:", sortedRecords);

//       setRecords(sortedRecords);
//       setFilteredRecords(sortedRecords);

//     } catch (err) {
//       console.error("❌ Salary fetch error:", err);
//       setError(err.message || "Failed to load salary data");
//     } finally {
//       setLoading(false);
//       setIsLoadingMonth(false);
//     }
//   };

//   // ✅ Initial load - fetch all data
//   useEffect(() => {
//     fetchSalaryData();
//   }, [employeesMasterData]);

//   // ✅ Handle month selection
//   const handleMonthSelect = (e) => {
//     const monthValue = e.target.value;
//     if (monthValue) {
//       setSelectedMonth(monthValue);
//       fetchSalaryData(monthValue);
//     }
//   };

//   // ✅ Clear all filters
//   const handleClearFilter = () => {
//     setSearchTerm("");
//     setSelectedMonth("");
//     fetchSalaryData();
//   };

//   // ✅ Filter records based on search and filters
//   useEffect(() => {
//     let filtered = [...records];

//     // Apply search filter
//     if (searchTerm.trim() !== "") {
//       const searchLower = searchTerm.toLowerCase();
//       filtered = filtered.filter(record => {
//         return (
//           (record.monthFormatted && record.monthFormatted.toLowerCase().includes(searchLower)) ||
//           (record.month && record.month.toLowerCase().includes(searchLower)) ||
//           (record.calculatedSalary && record.calculatedSalary.toString().includes(searchTerm))
//         );
//       });
//     }

//     // Apply month filter if selected
//     if (selectedMonth) {
//       filtered = filtered.filter(record => record.month === selectedMonth);
//     }

//     setFilteredRecords(filtered);
//     setCurrentPage(1);
//   }, [searchTerm, selectedMonth, records]);

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

//   // ✅ Handle view details
//   const handleViewDetails = (employee) => {
//     setSelectedEmployee(employee);
//     setShowDetailsModal(true);
//   };

//   // ✅ Close modal
//   const handleCloseModal = () => {
//     setShowDetailsModal(false);
//     setSelectedEmployee(null);
//   };

//   // ✅ Generate Invoice HTML
//   const generateInvoiceHTML = (employee) => {
//     const employeeData = getEmployeeData(employee);

//     if (!employeeData.salaryPerMonth || employeeData.salaryPerMonth === 0) {
//       return `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <title>Payslip</title>
//           <style>
//             body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; text-align: center; }
//             .error { color: red; font-size: 18px; margin-top: 100px; border: 1px solid red; padding: 20px; display: inline-block; }
//           </style>
//         </head>
//         <body>
//           <div class="error">
//             <h2>Salary Data Not Available</h2>
//             <p>Salary information is not available for ${employee?.name || 'this employee'}.</p>
//             <p>Please contact HR department.</p>
//           </div>
//         </body>
//         </html>
//       `;
//     }

//     const totalMonthDays = employee.monthDays || monthDays || 30;
//     const dailyRate = calculateDailyRate(employee);
//     const dailyRateNumber = parseFloat(dailyRate) || 0;

//     const leavesData = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0, leaveDetails: [] };
    
//     // ✅ Filter leaves for the specific month
//     const recordMonth = employee.month || ""; // e.g. "2024-03"
//     const monthLeaves = { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    
//     if (leavesData.leaveDetails && recordMonth && recordMonth !== "Not specified") {
//       leavesData.leaveDetails.forEach(leave => {
//         const leaveDate = new Date(leave.startDate);
//         const leaveMonth = `${leaveDate.getFullYear()}-${String(leaveDate.getMonth() + 1).padStart(2, '0')}`;
        
//         if (leaveMonth === recordMonth) {
//           if (monthLeaves[leave.type] !== undefined) {
//             monthLeaves[leave.type] += leave.days;
//           } else {
//             monthLeaves.Other += leave.days;
//           }
//         }
//       });
//     } else if (!recordMonth || recordMonth === "Not specified") {
//       // Fallback to aggregated data if month is not available
//       Object.assign(monthLeaves, leavesData);
//     }

//     const actualWeekOffDays = employee.weekOffs || 0;
//     const weekOffDaysForSalary = employee.weekOffsForSalary || 0;
//     const includeWeekOffInSalary = employee.includeWeekOffInSalary || false;

//     const presentDays = employee.presentDays || 0;
//     const halfDays = employee.halfDays || 0;
//     const paidLeaveDays = (monthLeaves.CL || 0) + (monthLeaves.EL || 0) + (monthLeaves.COFF || 0);

//     const totalPaidDays = presentDays + (halfDays * 0.5) + weekOffDaysForSalary + paidLeaveDays;

//     const halfDayDeductionDays = halfDays * 0.5;
//     const halfDayDeductionAmount = halfDayDeductionDays * dailyRateNumber;

//     const totalUnpaidDays = Math.max(0, totalMonthDays - totalPaidDays);
//     const lopDays = Math.max(0, totalUnpaidDays - halfDayDeductionDays);

//     const grossSalary = employeeData.salaryPerMonth || 0;
//     const bonus = employee.extraWork?.bonus || 0;
//     const extraDaysPay = (employee.extraWork?.extraDays || 0) * dailyRateNumber;

//     const otherDeductions = employee.extraWork?.deductions || 0;

//     const totalEarnings = grossSalary + bonus + extraDaysPay;
//     const netPay = employee.calculatedSalary || (totalEarnings - (halfDayDeductionAmount + (lopDays * dailyRateNumber) + otherDeductions));
//     const lopAmount = Math.max(0, totalEarnings - netPay - halfDayDeductionAmount - otherDeductions);
//     const totalDeductions = halfDayDeductionAmount + lopAmount + otherDeductions;

//     const hasExtraWork = employee.extraWork && (
//       (employee.extraWork.extraDays || 0) > 0 ||
//       (employee.extraWork.bonus || 0) > 0 ||
//       (employee.extraWork.deductions || 0) > 0
//     );

//     const isHistorical = employee.isHistoricalMonth;
//     const isCurrent = employee.isCurrentMonth;

//     return `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="utf-8">
//         <title>Payslip - ${employee.name}</title>
//         <style>
//           @page { size: A4; margin: 0; }
//           body { 
//             font-family: Arial, sans-serif; 
//             margin: 0; 
//             padding: 20px;
//             color: #000;
//           }
//           .invoice-container { 
//             width: 100%; 
//             max-width: 210mm;
//             margin: 0 auto; 
//             border: 1px solid #000; 
//           }
//           table { width: 100%; border-collapse: collapse; }
//           th, td { 
//             padding: 4px 8px; 
//             border: 1px solid #000; 
//             font-size: 12px; 
//             vertical-align: middle;
//           }
//           .header-cell { border: none; padding: 2px 2px; text-align: center; border-bottom: 1px solid #000; }
          
//           .section-header { 
//             background-color: #f0f0f0; 
//             font-weight: bold; 
//             text-align: center; 
//             text-transform: uppercase;
//           }
//           .amount-col { text-align: right; width: 15%; }
//           .label-col { text-align: left; width: 35%; }
          
//           .notes-box { 
//             margin: 10px; 
//             padding: 5px; 
//             border: 1px dashed #666; 
//             font-size: 11px;
//             background-color: #fafafa;
//           }
          
//           .info-note {
//             background-color: #fffde7;
//             border-left: 4px solid #ffc107;
//             padding: 8px;
//             margin: 10px 0;
//             font-size: 11px;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="invoice-container">
          
//           <!-- MAIN LAYOUT TABLE -->
//           <table>
            
//             <!-- HEADER -->
//             <tr>
//               <td colspan="4" class="header-cell">
//                 <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0px;">
//                   <div style="width: 130px; text-align: left;">
//                     <img src="${logo}" alt="Logo" style="height: 110px; width: auto; max-width: 130px; object-fit: contain; display: block;">
//                   </div>
//                   <div style="flex: 1; text-align: center; margin-right: 130px;">
//                     <h1 style="margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase;">Timely Health Tech Pvt Ltd</h1>
//                     <p style="margin: 0px 0 0 0; font-size: 11px; line-height: 1.1;">
//                       H. No: 1-98/9/25/p, # 301, 3rd Floor, Sri Sai Balaji Avenue,<br> 
//                       Arunodaya Colony, Madhapur, Hyderabad, TG - 500081
//                     </p>
//                   </div>
//                 </div>
//                 <div style="text-align: center; margin-bottom: 2px;">
//                   <span style="font-size: 18px; font-weight: bold; text-decoration: underline; text-underline-offset: 3px; display: inline-block;">PAYSLIP ${formatMonthDisplay(employee.month || selectedMonth).toUpperCase()}</span>
//                   <br>
//                   <span style="font-size: 11px; color: #666;">
//                     ${isHistorical ? '' : isCurrent ? 'Current Month' : 'Future Month'}
//                   </span>
//                 </div>
//               </td>
//             </tr>

//             <!-- EMPLOYEE DETAILS -->
//             <tr style="background-color: #fafafa;">
//               <td width="20%"><strong>ID</strong></td>
//               <td width="30%">${employee.employeeId}</td>
//               <td width="20%"><strong>Joined</strong></td>
//               <td width="30%">${employeeData.joiningDate ? new Date(employeeData.joiningDate).toLocaleDateString() : '-'}</td>
//             </tr>
//             <tr>
//               <td><strong>Name</strong></td>
//               <td>${employee.name}</td>
//               <td><strong>Role</strong></td>
//               <td>${employeeData.designation || '-'}</td>
//             </tr>
//             <tr style="background-color: #fafafa;">
//               <td><strong>Dept</strong></td>
//               <td>${employeeData.department || '-'}</td>
//               <td><strong>Month</strong></td>
//               <td>${formatMonthDisplay(employee.month || selectedMonth)}</td>
//             </tr>
//             <tr>
//               <td><strong>Invoice Date</strong></td>
//               <td>${new Date().toLocaleDateString()}</td>
//               <td><strong>Total Days</strong></td>
//               <td>${totalMonthDays} Days</td>
//             </tr>

//             <!-- WEEKOFF NOTICE FOR CURRENT MONTH -->
//             ${!includeWeekOffInSalary ? `
//             <tr>
//               <td colspan="4" style="border: none; padding: 5px;">
//                 <div class="info-note">
//                   <strong>Note:</strong> Weekoff salary for this month will be added after 26th ${formatMonthDisplay(employee.month || selectedMonth).split(' ')[0]}.
//                 </div>
//               </td>
//             </tr>
//             ` : ''}

//             <!-- SALARY BREAKDOWN HEADER -->
//             <tr class="section-header">
//               <td colspan="2">EARNINGS</td>
//               <td colspan="2">DEDUCTIONS</td>
//             </tr>

//             <!-- SALARY CONTENT Row 1 -->
//             <tr>
//               <td class="label-col">Basic Salary</td>
//               <td class="amount-col">₹${Math.round(grossSalary).toFixed(2)}</td>
//               <td class="label-col">LOP / Absent (${lopDays} days)</td>
//               <td class="amount-col" style="color:red;">
//                 ${lopAmount > 0 ? '-' : ''}₹${Math.round(lopAmount).toFixed(2)}
//               </td>
//             </tr>
            
//             <!-- ROW 2: Days Info -->
//             <tr>
//               <td class="label-col">Working Days (Full: ${presentDays})</td>
//               <td class="amount-col">-</td>
//               <td class="label-col">Half Day Deductions (${halfDays} HD)</td>
//               <td class="amount-col" style="color:red;">
//                 ${halfDayDeductionAmount > 0 ? '-' : ''}₹${Math.round(halfDayDeductionAmount).toFixed(2)}
//               </td>
//             </tr>

//             <!-- ROW 3: Week Offs -->
//             <tr>
//               <td class="label-col">Week Off Days (${actualWeekOffDays})</td>
//               <td class="amount-col">-</td>
//               <td class="label-col">Other Deductions</td>
//               <td class="amount-col" style="color:red;">
//                 ${otherDeductions > 0 ? '-' : ''}₹${otherDeductions.toFixed(2)}
//               </td>
//             </tr>

//             <!-- ROW 4: Extra / Bonus -->
//             <tr>
//               <td class="label-col">Bonus / Extra</td>
//               <td class="amount-col">₹${Math.round(bonus + extraDaysPay).toFixed(2)}</td>
//               <td class="label-col"></td>
//               <td class="amount-col"></td>
//             </tr>

//             <!-- TOTALS ROW -->
//             <tr style="font-weight: bold; background-color: #f0f0f0;">
//               <td class="label-col">Gross Earnings</td>
//               <td class="amount-col">₹${Math.round(totalEarnings).toFixed(2)}</td>
//               <td class="label-col">Total Deductions</td>
//               <td class="amount-col" style="color:red;">₹${Math.round(totalDeductions).toFixed(2)}</td>
//             </tr>

//             <!-- NET PAY ROW -->
//              <tr style="font-weight: bold; background-color: #e0eee0; font-size: 14px;">
//               <td class="label-col" colspan="2" style="text-align: right; padding-right: 20px;">NET PAY</td>
//               <td class="amount-col" colspan="2" style="text-align: left; padding-left: 20px;">₹${Math.round(netPay).toFixed(2)}</td>
//             </tr>

//             <!-- NOTES SECTION IF EXISTS -->
//             ${hasExtraWork && employee.extraWork.reason ? `
//             <tr>
//               <td colspan="4" style="border: none; padding: 10px;">
//                 <div class="notes-box">
//                   <strong>Adjustments Note:</strong> ${employee.extraWork.reason}
//                 </div>
//               </td>
//             </tr>
//             ` : ''}

//             <!-- DOWNLOAD NOTE FOR CURRENT MONTH -->
//             ${!employee.canDownload ? `
//             <tr>
//               <td colspan="4" style="border: none; padding: 5px;">
//                 <div class="info-note">
//                   <strong>Note:</strong> Salary slip for current month will be available for download from 30th onwards.
//                 </div>
//               </td>
//             </tr>
//             ` : ''}

//           </table>
          
//           <div style="text-align: center; font-size: 10px; margin-top: 10px;">
//             This is a computer-generated document.<br>
//             Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
//           </div>

//         </div>
//       </body>
//       </html>
//     `;
//   };

//   // ✅ Download salary slip with validation
//   const downloadSalarySlip = async (employee) => {
//     if (!employee.canDownload) {
//       alert(`Salary slip for current month will be available for download from 30th ${formatMonthDisplay(employee.month).split(' ')[0]} onwards.`);
//       return;
//     }

//     const slipContent = generateInvoiceHTML(employee);
//     const printWindow = window.open('', '_blank');
//     if (printWindow) {
//       printWindow.document.write(slipContent);
//       printWindow.document.close();
//       printWindow.print();

//       // ✅ Log payslip download activity
//       try {
//         const employeeData = getCurrentEmployee();
//         const employeeId = employeeData?.employeeId || employee.employeeId;
//         const employeeName = employeeData?.name || employee.name;
//         const employeeEmail = employeeData?.email || `${employeeId}@system.com`;

//         console.log("Logging employee payslip download:", {
//           employeeId,
//           employeeName,
//           employeeEmail,
//           month: employee.month
//         });

//         await axios.post("https://api.timelyhealth.in/user-activity/log", {
//           userId: employeeId,
//           userName: employeeName,
//           userEmail: employeeEmail,
//           userRole: "employee",
//           action: "payslip_download",
//           actionDetails: `Downloaded own payslip for ${formatMonthDisplay(employee.month || selectedMonth)}`,
//           metadata: {
//             employeeId: employee.employeeId,
//             employeeName: employee.name,
//             month: employee.month || selectedMonth,
//             salary: employee.calculatedSalary
//           }
//         });

//         console.log("✅ Employee payslip download logged successfully");
//       } catch (logError) {
//         console.error("❌ Failed to log payslip download activity:", logError);
//       }
//     }
//   };

//   // ✅ Get leave types for display
//   const getLeaveTypes = (employee) => {
//     const leavesData = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0, leaveDetails: [] };
    
//     // ✅ Filter leaves for the specific month
//     const recordMonth = employee.month || ""; // e.g. "2024-03"
//     const monthLeaves = { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    
//     if (leavesData.leaveDetails && recordMonth && recordMonth !== "Not specified") {
//       leavesData.leaveDetails.forEach(leave => {
//         const leaveDate = new Date(leave.startDate);
//         const leaveMonth = `${leaveDate.getFullYear()}-${String(leaveDate.getMonth() + 1).padStart(2, '0')}`;
        
//         if (leaveMonth === recordMonth) {
//           if (monthLeaves[leave.type] !== undefined) {
//             monthLeaves[leave.type] += leave.days;
//           } else {
//             monthLeaves.Other += leave.days;
//           }
//         }
//       });
//     } else {
//       // Fallback
//       Object.assign(monthLeaves, leavesData);
//     }

//     const leaveStrings = [];
//     if (monthLeaves.CL > 0) leaveStrings.push(`CL: ${monthLeaves.CL}`);
//     if (monthLeaves.EL > 0) leaveStrings.push(`EL: ${monthLeaves.EL}`);
//     if (monthLeaves.COFF > 0) leaveStrings.push(`COFF: ${monthLeaves.COFF}`);
//     if (monthLeaves.LOP > 0) leaveStrings.push(`LOP: ${monthLeaves.LOP}`);
//     if (monthLeaves.Other > 0) leaveStrings.push(`Other: ${monthLeaves.Other}`);

//     return leaveStrings.length > 0 ? leaveStrings.join(', ') : 'No Leaves';
//   };

//   const currentEmployee = getCurrentEmployee();

//   // Stat Card component with Dashboard Style
//   const StatCard = ({ icon: Icon, label, value, color, prefix = "" }) => {
//     const themes = {
//       indigo: "border-indigo-500",
//       emerald: "border-emerald-500",
//       amber: "border-amber-500",
//       purple: "border-purple-500",
//       rose: "border-rose-500",
//       cyan: "border-cyan-500",
//     };

//     const currentTheme = themes[color] || themes.indigo;

//     return (
//       <div
//         className={`bg-white rounded-lg p-3 shadow-sm border-t-4 ${currentTheme} cursor-pointer hover:shadow-md transition-all duration-300 flex items-center justify-between`}
//       >
//         <div className="flex items-center gap-2">
//           {typeof Icon === 'string' ? (
//             <span className="text-lg">{Icon}</span>
//           ) : (
//             <Icon className="text-gray-400 text-base flex-shrink-0" />
//           )}
//           <div className="text-sm font-medium text-gray-700">{label}</div>
//         </div>
//         <div className="text-sm font-bold flex items-center">
//           {typeof value === 'number' ? (
//             <CountUp end={value} duration={2} separator="," prefix={prefix} />
//           ) : (
//             <span className="text-gray-800">{value}</span>
//           )}
//         </div>
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
//         <div className="text-center">
//           <div className="w-16 h-16 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
//           <p className="text-lg font-semibold text-gray-700">Loading your salary data...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
//         <div className="max-w-md p-8 text-center bg-white border border-red-200 shadow-lg rounded-2xl">
//           <div className="mb-4 text-4xl text-red-500">❌</div>
//           <p className="mb-4 text-lg font-semibold text-red-600">{error}</p>
//           <button
//             onClick={() => fetchSalaryData(selectedMonth)}
//             className="px-6 py-2 font-semibold text-white transition bg-red-600 rounded-lg hover:bg-red-700"
//           >
//             🔄 Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen px-2 py-2 bg-gray-100 font-sans sm:px-3 sm:py-3">
//       <div className="mx-auto max-w-9xl">

//         {/* Header */}
//         {/* <div className="mb-3">
//           <h1 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">💰 My Salary Records</h1>
//           <p className="text-xs text-gray-600 sm:text-sm">View and download your salary slips</p>
//         </div> */}

//         {/* Stats Overview - Dashboard Style */}
//         <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
//           <StatCard
//             label="Total Records"
//             value={filteredRecords.length}
//             color="indigo"
//             icon={FiFileText}
//           />
//           <StatCard
//             label="Total Salary"
//             value={filteredRecords.reduce((sum, emp) => sum + (emp.calculatedSalary || 0), 0)}
//             color="emerald"
//             icon={FiDollarSign}
//             prefix="₹"
//           />
//           <StatCard
//             label="Available Docs"
//             value={filteredRecords.filter(emp => emp.canDownload).length}
//             color="purple"
//             icon={FiDownloadCloud}
//           />
//           <StatCard
//             label="Average Salary"
//             value={filteredRecords.length > 0 ? Math.round(filteredRecords.reduce((sum, emp) => sum + (emp.calculatedSalary || 0), 0) / filteredRecords.length) : 0}
//             color="amber"
//             icon={FiPieChart}
//             prefix="₹"
//           />
//         </div>

//         {/* Filters Section - Synced with design system */}
//         <div className="p-2 mb-3 bg-white rounded-lg shadow-md border border-gray-100">
//           <div className="flex flex-wrap items-center gap-2">

//             {/* Search Bar */}
//             <div className="relative flex-1 min-w-[180px]">
//               <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
//               <input
//                 type="text"
//                 placeholder="Search by month..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Month Selector - ONLY THIS */}
//             <div className="relative w-[140px]">
//               <input
//                 type="month"
//                 value={selectedMonth}
//                 onChange={handleMonthSelect}
//                 onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                 placeholder="Select Month"
//                 className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                 max={getCurrentMonth()}
//               />
//             </div>

//             {/* Current Month Button */}
//             <button
//               onClick={() => {
//                 setSelectedMonth("");
//                 fetchSalaryData();
//               }}
//               className="h-8 px-3 text-xs font-medium text-gray-700 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
//             >
//               Current
//             </button>

//             {/* Refresh Button */}
//             <button
//               onClick={() => fetchSalaryData(selectedMonth)}
//               disabled={isLoadingMonth}
//               className="h-8 px-3 text-xs font-medium text-white transition bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
//             >
//               <RefreshCw size={12} className={isLoadingMonth ? "animate-spin" : ""} />
//               {isLoadingMonth ? "..." : "Refresh"}
//             </button>

//             {/* Clear Button */}
//             {(searchTerm || selectedMonth) && (
//               <button
//                 onClick={handleClearFilter}
//                 className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
//               >
//                 Clear
//               </button>
//             )}
//           </div>

//           {/* Active Filters Display */}
//           {(searchTerm || selectedMonth) && (
//             <div className="flex flex-wrap items-center gap-2 mt-2">
//               {selectedMonth && (
//                 <div className="flex items-center gap-1 px-2 py-0.5 text-xs text-blue-800 bg-blue-100 rounded-full">
//                   <span>Month: {formatMonthDisplay(selectedMonth)}</span>
//                   <button
//                     onClick={() => setSelectedMonth("")}
//                     className="text-blue-600 hover:text-blue-800"
//                   >
//                     <X size={10} />
//                   </button>
//                 </div>
//               )}
//               {searchTerm && (
//                 <div className="flex items-center gap-1 px-2 py-0.5 text-xs text-gray-800 bg-gray-100 rounded-full">
//                   <span>Search: "{searchTerm}"</span>
//                   <button
//                     onClick={() => setSearchTerm("")}
//                     className="text-gray-600 hover:text-gray-800"
//                   >
//                     <X size={10} />
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Month Type Notice */}
//         <div className={`px-3 py-2 mb-4 rounded-md shadow-sm ${monthInfo.isHistorical
//           ? 'bg-green-50 border-l-4 border-green-500'
//           : monthInfo.isCurrent
//             ? (monthInfo.includeWeekOff
//               ? 'bg-green-50 border-l-4 border-green-500'
//               : 'bg-yellow-50 border-l-4 border-yellow-500')
//             : 'bg-blue-50 border-l-4 border-blue-500'
//           }`}>
//           <div className="flex items-center">
//             <div className="mr-2">
//               {monthInfo.isHistorical ? (
//                 <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               ) : monthInfo.isCurrent ? (
//                 monthInfo.includeWeekOff ? (
//                   <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 ) : (
//                   <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.406 16.5c-.77.833.192 2.5 1.732 2.5z" />
//                   </svg>
//                 )
//               ) : (
//                 <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                 </svg>
//               )}
//             </div>
//             <div>
//               <p className="text-xs font-medium">
//                 {monthInfo.isHistorical
//                   ? "✓ Historical Month - Full salary with week-off included"
//                   : monthInfo.isCurrent
//                     ? (monthInfo.includeWeekOff
//                       ? `✓ Current Month (After 26th) - Week-off included`
//                       : `Current Month (Before 26th) - Week-off will be added after 26th`)
//                     : "Future Month - Preview only"}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Table Container */}
//         <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl">
//           {filteredRecords.length === 0 ? (
//             <div className="py-16 text-center">
//               <div className="mb-4 text-6xl">📭</div>
//               <p className="mb-4 text-lg font-semibold text-gray-600">
//                 {records.length === 0 ? "No salary records found." : "No records match your filters."}
//               </p>
//               {records.length > 0 && (
//                 <button
//                   onClick={handleClearFilter}
//                   className="px-6 py-2 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
//                 >
//                   🔄 Clear Filters
//                 </button>
//               )}
//             </div>
//           ) : (
//             <>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full">
//                   <thead className="text-sm text-center text-white bg-blue-600">
//                     <tr className="uppercase tracking-wider text-[11px] font-bold">
//                       <th className="py-2.5 px-2">MONTH</th>
//                       <th className="py-2.5 px-2">PRESENT</th>
//                       <th className="py-2.5 px-2">WORKING</th>
//                       <th className="py-2.5 px-2">HALF</th>
//                       <th className="py-2.5 px-2">WEEKOFF</th>
//                       <th className="py-2.5 px-2">LEAVES</th>
//                       <th className="py-2.5 px-2">SALARY</th>
//                       <th className="py-2.5 px-2">STATUS</th>
//                       <th className="py-2.5 px-2">ACTIONS</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {currentRecords.map((emp, index) => {
//                       const dailyRate = calculateDailyRate(emp);
//                       const isCurrentMonth = emp.isCurrentMonth;

//                       return (
//                         <tr
//                           key={index}
//                           className={`hover:bg-blue-50 transition duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
//                         >
//                           <td className="px-2 py-1.5 text-center">
//                             <div>
//                               <div className="text-xs font-semibold">{emp.monthFormatted || formatMonthDisplay(emp.month)}</div>
//                               <div className="text-[9px] text-gray-500">{emp.monthDays || 30} days</div>
//                               {isCurrentMonth && (
//                                 <div className="text-[8px] text-blue-600">Current</div>
//                               )}
//                             </div>
//                           </td>

//                           <td className="px-2 py-1.5 text-center">
//                             <span className="px-1.5 py-0.5 text-xs font-medium text-green-800 bg-green-100 rounded-full">
//                               {emp.presentDays || 0}
//                             </span>
//                           </td>

//                           <td className="px-2 py-1.5 text-center">
//                             <span className="px-1.5 py-0.5 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
//                               {emp.workingDays || 0}
//                             </span>
//                           </td>

//                           <td className="px-2 py-1.5 text-center">
//                             <span className="px-1.5 py-0.5 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
//                               {emp.halfDays || 0}
//                             </span>
//                           </td>

//                           <td className="px-2 py-1.5 text-center">
//                             <div className="flex flex-col items-center">
//                               <span className="px-1.5 py-0.5 text-xs font-medium text-purple-800 bg-purple-100 rounded-full">
//                                 {emp.weekOffs || 0}
//                               </span>
//                               {!emp.includeWeekOffInSalary && (
//                                 <div className="text-[8px] text-gray-500">After 26th</div>
//                               )}
//                             </div>
//                           </td>

//                           <td className="px-2 py-1.5 text-center">
//                             <span className="px-1.5 py-0.5 text-xs font-medium text-red-800 bg-red-100 rounded-full">
//                               {emp.totalLeaves || 0}
//                             </span>
//                           </td>

//                           <td className="px-2 py-1.5 text-center">
//                             <div>
//                               <div className="text-xs font-semibold text-green-700">₹{emp.calculatedSalary || 0}</div>
//                               <div className="text-[8px] text-gray-500">₹{dailyRate}/day</div>
//                             </div>
//                           </td>

//                           <td className="px-2 py-1.5 text-center">
//                             {emp.canDownload ? (
//                               <span className="px-1.5 py-0.5 text-xs font-medium text-green-800 bg-green-100 rounded-full">
//                                 Available
//                               </span>
//                             ) : (
//                               <span className="px-1.5 py-0.5 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
//                                 From 30th
//                               </span>
//                             )}
//                           </td>

//                           <td className="px-2 py-1.5 text-center">
//                             <div className="flex justify-center space-x-1">
//                               <button
//                                 onClick={() => handleViewDetails(emp)}
//                                 className="p-1 text-blue-600 transition duration-150 rounded-md hover:bg-blue-50"
//                                 title="View Details"
//                               >
//                                 <Eye size={14} />
//                               </button>

//                               <button
//                                 onClick={() => downloadSalarySlip(emp)}
//                                 disabled={!emp.canDownload}
//                                 className={`p-1 transition duration-150 rounded-md ${emp.canDownload
//                                   ? 'text-purple-600 hover:bg-purple-50'
//                                   : 'text-gray-400 cursor-not-allowed'
//                                   }`}
//                                 title={emp.canDownload ? "Download Salary Slip" : "Available from 30th"}
//                               >
//                                 <Download size={14} />
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination */}
//               {filteredRecords.length > 0 && (
//                 <div className="flex flex-col items-center justify-between gap-4 px-4 py-3 border-t border-gray-200 sm:flex-row">
//                   <div className="text-xs text-gray-600">
//                     Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredRecords.length)} of {filteredRecords.length} entries
//                   </div>

//                   <div className="flex items-center space-x-1">
//                     <button
//                       onClick={handlePrevious}
//                       disabled={currentPage === 1}
//                       className={`px-3 py-1 text-xs border rounded-lg ${currentPage === 1
//                         ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
//                         : 'text-blue-600 bg-white hover:bg-blue-50 border-blue-200'
//                         }`}
//                     >
//                       Previous
//                     </button>

//                     {getPageNumbers().map(pageNumber => (
//                       <button
//                         key={pageNumber}
//                         onClick={() => handlePageClick(pageNumber)}
//                         className={`px-3 py-1 text-xs border rounded-lg ${currentPage === pageNumber
//                           ? 'text-white bg-blue-600 border-blue-600'
//                           : 'text-blue-600 bg-white hover:bg-blue-50 border-blue-300'
//                           }`}
//                       >
//                         {pageNumber}
//                       </button>
//                     ))}

//                     <button
//                       onClick={handleNext}
//                       disabled={currentPage === totalPages}
//                       className={`px-3 py-1 text-xs border rounded-lg ${currentPage === totalPages
//                         ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
//                         : 'text-blue-600 bg-white hover:bg-blue-50 border-blue-300'
//                         }`}
//                     >
//                       Next
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {/* Details Modal */}
//       {showDetailsModal && selectedEmployee && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto">

//             {/* Header */}
//             <div className="sticky top-0 z-10 flex items-center justify-between mb-4 bg-white">
//               <h2 className="text-xl font-bold text-gray-800">
//                 Salary Details
//               </h2>
//               <button
//                 onClick={handleCloseModal}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>

//             {/* Employee Basic Info */}
//             <div className="flex items-start space-x-4 mb-6">

//               {/* Avatar */}
//               <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full shrink-0">
//                 <span className="text-lg font-semibold text-blue-800">
//                   {currentEmployee?.name?.charAt(0) || selectedEmployee.name?.charAt(0) || 'E'}
//                 </span>
//               </div>

//               {/* Info */}
//               <div className="flex flex-col flex-1 space-y-1">
//                 <h3 className="text-lg font-semibold text-gray-800">
//                   {currentEmployee?.name || selectedEmployee.name}
//                 </h3>

//                 <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
//                   <p>
//                     <span className="font-medium text-gray-700">ID:</span> {selectedEmployee.employeeId}
//                   </p>

//                   <p>
//                     <span className="font-medium text-gray-700">Month:</span>{" "}
//                     {selectedEmployee.monthFormatted || formatMonthDisplay(selectedEmployee.month)}
//                     ({selectedEmployee.monthDays || monthDays} days)
//                   </p>

//                   <p>
//                     <span className="font-medium text-gray-700">Department:</span> {selectedEmployee.department}
//                   </p>

//                   <p>
//                     <span className="font-medium text-gray-700">Designation:</span> {selectedEmployee.designation}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Salary Summary Grid - Same Style as First Modal */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3 mb-6 text-sm">

//               <div className="flex justify-between border-b pb-1">
//                 <span className="text-gray-600">Present Days</span>
//                 <span className="font-semibold text-green-600">
//                   {selectedEmployee.presentDays || 0}
//                 </span>
//               </div>

//               <div className="flex justify-between border-b pb-1">
//                 <span className="text-gray-600">Working Days</span>
//                 <span className="font-semibold text-blue-600">
//                   {selectedEmployee.workingDays || 0}
//                 </span>
//               </div>

//               <div className="flex justify-between border-b pb-1">
//                 <span className="text-gray-600">Half Days</span>
//                 <span className="font-semibold text-yellow-600">
//                   {selectedEmployee.halfDays || 0}
//                 </span>
//               </div>

//               <div className="flex justify-between border-b pb-1">
//                 <span className="text-gray-600">WeekOff Days</span>
//                 <span className="font-semibold text-purple-600">
//                   {selectedEmployee.weekOffs || 0}
//                 </span>
//               </div>

//               <div className="flex justify-between border-b pb-1">
//                 <span className="text-gray-600">Month Days</span>
//                 <span className="font-semibold text-gray-800">
//                   {selectedEmployee.monthDays || monthDays}
//                 </span>
//               </div>

//               <div className="flex justify-between border-b pb-1">
//                 <span className="text-gray-600">Monthly Salary</span>
//                 <span className="font-semibold text-blue-600">
//                   ₹{selectedEmployee.salaryPerMonth || 0}
//                 </span>
//               </div>

//               <div className="flex justify-between border-b pb-1">
//                 <span className="text-gray-600">Daily Rate</span>
//                 <span className="font-semibold text-gray-800">
//                   ₹{calculateDailyRate(selectedEmployee)}/day
//                 </span>
//               </div>

//               <div className="flex justify-between border-b pb-1">
//                 <span className="text-gray-600">Calculated Salary</span>
//                 <span className="font-semibold text-green-600">
//                   ₹{selectedEmployee.calculatedSalary || 0}
//                 </span>
//               </div>

//               <div className="sm:col-span-2 flex justify-between border-b pb-1">
//                 <span className="text-gray-600">Approved Leaves</span>
//                 <span className="font-semibold text-red-600">
//                   {getLeaveTypes(selectedEmployee) || "No Approved Leaves"}
//                 </span>
//               </div>

//             </div>

//             {/* Footer Buttons */}
//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={() => downloadSalarySlip(selectedEmployee)}
//                 disabled={!selectedEmployee.canDownload}
//                 className={`px-6 py-2 rounded-lg transition duration-200 ${selectedEmployee.canDownload
//                   ? "bg-purple-500 text-white hover:bg-purple-600"
//                   : "bg-gray-300 text-gray-500 cursor-not-allowed"
//                   }`}
//               >
//                 Download Payslip
//               </button>

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
import { Download, Eye, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import CountUp from "react-countup";
import { FiDollarSign, FiDownloadCloud, FiFileText, FiPieChart } from "react-icons/fi";
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
  
  // ✅ Comp-off state - EXACTLY LIKE PAYROLL
  const [employeeCompOffs, setEmployeeCompOffs] = useState({});
  const [compOffDetails, setCompOffDetails] = useState({});
  
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

  // ✅ Process Leaves Data - EXACTLY LIKE PAYROLL
  const processLeavesData = useCallback((leavesData, selectedMonthStr) => {
    const leavesMap = {};
    const [year, monthNum] = (selectedMonthStr || new Date().toISOString().slice(0, 7)).split('-').map(Number);
    const startOfMonth = new Date(year, monthNum - 1, 1);
    const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);

    leavesData.forEach(leave => {
      const employeeId = leave.employeeId;
      if (!employeeId) return;

      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);
      const overlapStart = new Date(Math.max(leaveStart, startOfMonth));
      const overlapEnd = new Date(Math.min(leaveEnd, endOfMonth));

      if (overlapStart <= overlapEnd) {
        if (!leavesMap[employeeId]) {
          leavesMap[employeeId] = {
            CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0, leaveDetails: []
          };
        }

        const leaveType = leave.leaveType || 'Other';
        const diffTime = Math.abs(overlapEnd - overlapStart);
        const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (leavesMap[employeeId][leaveType] !== undefined) {
          leavesMap[employeeId][leaveType] += duration;
        } else if (["Casual Leave", "Earned Leave", "Comp Off"].includes(leaveType)) {
          const typeMap = { "Casual Leave": "CL", "Earned Leave": "EL", "Comp Off": "COFF" };
          leavesMap[employeeId][typeMap[leaveType]] += duration;
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
      }
    });

    setEmployeeLeaves(leavesMap);
  }, []);

  // ✅ Process comp-off data - EXACTLY LIKE PAYROLL
  const processCompOffData = useCallback(async (selectedMonthStr, leavesData) => {
    try {
      const currentEmployee = getCurrentEmployee();
      const currentEmployeeId = currentEmployee?.employeeId;
      
      if (!currentEmployeeId) {
        console.log("No current employee found");
        return;
      }

      const [year, monthNum] = (selectedMonthStr || new Date().toISOString().slice(0, 7)).split('-').map(Number);
      const startOfMonth = new Date(year, monthNum - 1, 1);
      const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);

      console.log("Processing comp-offs for employee:", currentEmployeeId, "Month:", selectedMonthStr);
      
      const response = await axios.get(`${BASE_URL}/api/leaves/comp-offs`);
      const compOffs = response.data || [];

      const compOffMap = {};
      const compOffDetailsMap = {};

      for (const co of compOffs) {
        if (co.status === "approved" && co.employeeId === currentEmployeeId) {
          const workDate = new Date(co.workDate);

          if (workDate >= startOfMonth && workDate <= endOfMonth) {
            if (!compOffMap[currentEmployeeId]) {
              compOffMap[currentEmployeeId] = { earned: 0, used: 0, balance: 0 };
              compOffDetailsMap[currentEmployeeId] = [];
            }
            compOffMap[currentEmployeeId].earned += 1;
            compOffDetailsMap[currentEmployeeId].push({
              type: 'earned',
              date: co.workDate,
              reason: co.reason || 'Comp-off earned'
            });
          }
        }
      }

      // Calculate used based on leaves
      const leaves = leavesData[currentEmployeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
      const totalLeaves = (leaves.CL || 0) + (leaves.EL || 0) + (leaves.COFF || 0) + (leaves.Other || 0);
      const earned = compOffMap[currentEmployeeId]?.earned || 0;
      const used = Math.min(earned, totalLeaves);
      const balance = earned - used;
      
      if (compOffMap[currentEmployeeId]) {
        compOffMap[currentEmployeeId].used = used;
        compOffMap[currentEmployeeId].balance = balance;
      }

      setEmployeeCompOffs(compOffMap);
      setCompOffDetails(compOffDetailsMap);
      
      console.log("Comp-off data set:", compOffMap);
      
    } catch (error) {
      console.error("Error fetching comp-offs:", error);
    }
  }, []);

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
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // ✅ Format month for API
  const formatMonthForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  // ✅ Get current month
  const getCurrentMonth = () => {
    const today = new Date();
    return formatMonthForAPI(today);
  };

  // ✅ Fetch salary data for current employee
  const fetchSalaryData = useCallback(async (month = "") => {
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

      const isHistorical = isHistoricalMonth(month);
      const isCurrent = isCurrentMonth(month);
      const includeWeekOff = shouldIncludeWeekOffInSalary(month);
      const canDownload = isPayslipDownloadAllowed(month);

      setMonthInfo({ isHistorical, isCurrent, includeWeekOff, canDownload });

      const salaryUrl = month ? `${BASE_URL}/api/attendancesummary/getsalaries?month=${month}` : `${BASE_URL}/api/attendancesummary/getsalaries`;
      const salaryRes = await fetch(salaryUrl);

      if (!salaryRes.ok) {
        throw new Error(`Failed to fetch salary data: ${salaryRes.status}`);
      }

      const salaryData = await salaryRes.json();
      
      // Fetch leaves and comp-offs
      const leavesRes = await fetch(`${BASE_URL}/api/leaves/leaves?status=approved`);
      let leavesData = leavesRes.ok ? await leavesRes.json() : [];
      
      processLeavesData(leavesData, month);
      await processCompOffData(month, employeeLeaves);

      let employeeSalaryRecords = [];

      if (salaryData.success && salaryData.salaries && salaryData.salaries.length > 0) {
        employeeSalaryRecords = salaryData.salaries
          .filter(salary => salary.employeeId === employeeId)
          .map(salary => {
            const actualWeekOffDays = salary.weekOffs || 0;
            let calculatedSalary = salary.calculatedSalary || 0;
            
            if (!includeWeekOff && calculatedSalary > 0) {
              const daysInMonth = salaryData.monthDays || 30;
              const dailyRate = (salary.salaryPerMonth || 0) / daysInMonth;
              const weekOffAmount = actualWeekOffDays * dailyRate;
              calculatedSalary = Math.max(0, calculatedSalary - weekOffAmount);
            }

            // ✅ Add comp-off
            const compOffData = employeeCompOffs[employeeId] || { earned: 0, used: 0, balance: 0 };
            let finalCalculatedSalary = calculatedSalary;
            
            if (compOffData.balance > 0) {
              const daysInMonth = salaryData.monthDays || 30;
              const dailyRate = (salary.salaryPerMonth || 0) / daysInMonth;
              const compOffAmount = compOffData.balance * dailyRate;
              finalCalculatedSalary += compOffAmount;
            }

            return {
              ...salary,
              calculatedSalary: finalCalculatedSalary,
              compOffEarned: compOffData.earned || 0,
              compOffUsed: compOffData.used || 0,
              compOffBalance: compOffData.balance || 0,
              monthDays: salaryData.monthDays || 30,
              weekOffs: actualWeekOffDays,
              includeWeekOffInSalary: includeWeekOff,
              canDownload: canDownload,
              isHistoricalMonth: isHistorical,
              isCurrentMonth: isCurrent,
              monthFormatted: formatMonthDisplay(salary.month || month),
              halfDays: salary.halfDayWorking || 0,
              workingDays: salary.totalWorkingDays || salary.workingDays || 0,
              presentDays: salary.presentDays || 0,
              totalLeaves: salary.totalLeaves || 0,
              salaryPerMonth: salary.salaryPerMonth || 0
            };
          });

        if (salaryData.monthDays) {
          setMonthDays(salaryData.monthDays);
        }
      }

      const sortedRecords = employeeSalaryRecords.sort((a, b) => {
        const monthA = a.month || "";
        const monthB = b.month || "";
        return monthB.localeCompare(monthA);
      });

      setRecords(sortedRecords);
      setFilteredRecords(sortedRecords);

    } catch (err) {
      console.error("❌ Salary fetch error:", err);
      setError(err.message || "Failed to load salary data");
    } finally {
      setLoading(false);
      setIsLoadingMonth(false);
    }
  }, [processLeavesData, processCompOffData, employeeCompOffs]);

  // ✅ Fetch Master Data
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
          processLeavesData(leaves, selectedMonth);
          await processCompOffData(selectedMonth, employeeLeaves);
        }
      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    };

    fetchMasterData();
  }, [processLeavesData, processCompOffData, selectedMonth]);

  // ✅ Initial load
  useEffect(() => {
    fetchSalaryData();
  }, [fetchSalaryData]);

  // ✅ Handle month selection
  const handleMonthSelect = async (e) => {
    const monthValue = e.target.value;
    setSelectedMonth(monthValue);
    await fetchSalaryData(monthValue);
  };

  // ✅ Clear all filters
  const handleClearFilter = async () => {
    setSearchTerm("");
    setSelectedMonth("");
    await fetchSalaryData();
  };

  // ✅ Filter records based on search
  useEffect(() => {
    let filtered = [...records];
    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(record => 
        (record.monthFormatted && record.monthFormatted.toLowerCase().includes(searchLower)) ||
        (record.month && record.month.toLowerCase().includes(searchLower))
      );
    }
    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchTerm, records]);

  // ✅ Pagination
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  const handlePrevious = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePageClick = (pageNumber) => { setCurrentPage(pageNumber); };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    }
    return pageNumbers;
  };

  // ✅ Handle view details
  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedEmployee(null);
  };

  // ✅ Get leave types for display
  const getLeaveTypes = (employee) => {
    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const leaveStrings = [];
    if (leaves.CL > 0) leaveStrings.push(`CL: ${leaves.CL}`);
    if (leaves.SL > 0) leaveStrings.push(`SL: ${leaves.SL}`);
    if (leaves.EL > 0) leaveStrings.push(`EL: ${leaves.EL}`);
    if (leaves.COFF > 0) leaveStrings.push(`COFF: ${leaves.COFF}`);
    if (leaves.LOP > 0) leaveStrings.push(`LOP: ${leaves.LOP}`);
    return leaveStrings.length > 0 ? leaveStrings.join(', ') : 'No Leaves';
  };

  // ✅ Generate Invoice HTML
  const generateInvoiceHTML = (employee) => {
    const employeeData = getEmployeeData(employee);
    const totalMonthDays = employee.monthDays || monthDays || 30;
    const dailyRate = calculateDailyRate(employee);
    const dailyRateNumber = parseFloat(dailyRate) || 0;
    

    // ✅ Filter leaves for the specific month
    const targetMonth = employee.month && employee.month !== "Not specified" ? employee.month : getCurrentMonth();
    const monthLeaves = { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    
    if (leavesData.leaveDetails && targetMonth) {
      leavesData.leaveDetails.forEach(leave => {
        const leaveDate = new Date(leave.startDate);
        const leaveMonth = `${leaveDate.getFullYear()}-${String(leaveDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (leaveMonth === targetMonth) {
          if (monthLeaves[leave.type] !== undefined) {
            monthLeaves[leave.type] += leave.days;
          } else {
            monthLeaves.Other += leave.days;
          }
        }
      });
    }


    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };

    const actualWeekOffDays = employee.weekOffs || 0;
    const presentDays = employee.presentDays || 0;
    const halfDays = employee.halfDays || 0;
    const paidLeaveDays = (leaves.CL || 0) + (leaves.SL || 0) + (leaves.EL || 0) + (leaves.COFF || 0);
    
    const compOffBalance = employee.compOffBalance || 0;
    const compOffPay = compOffBalance * dailyRateNumber;
    
    const totalPaidDays = presentDays + (halfDays * 0.5) + actualWeekOffDays + paidLeaveDays + compOffBalance;
    const halfDayDeductionAmount = (halfDays * 0.5) * dailyRateNumber;
    const totalUnpaidDays = Math.max(0, totalMonthDays - totalPaidDays);
    const lopAmount = totalUnpaidDays * dailyRateNumber;
    
    const grossSalary = employeeData.salaryPerMonth || 0;
    const totalEarnings = grossSalary + compOffPay;
    const netPay = employee.calculatedSalary || (totalEarnings - (halfDayDeductionAmount + lopAmount));

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payslip - ${employee.name}</title>
        <style>
          @page { size: A4; margin: 0; }
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #000; }
          .invoice-container { width: 100%; max-width: 210mm; margin: 0 auto; border: 1px solid #000; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 4px 8px; border: 1px solid #000; font-size: 12px; vertical-align: middle; }
          .header-cell { border: none; padding: 2px 2px; text-align: center; border-bottom: 1px solid #000; }
          .section-header { background-color: #f0f0f0; font-weight: bold; text-align: center; text-transform: uppercase; }
          .amount-col { text-align: right; width: 15%; }
          .label-col { text-align: left; width: 35%; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <table>
            <tr>
              <td colspan="4" class="header-cell">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div style="width: 130px;"><img src="${logo}" alt="Logo" style="height: 110px; width: auto;"></div>
                  <div style="flex: 1; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">Timely Health Tech Pvt Ltd</h1>
                    <p style="margin: 0; font-size: 11px;">H. No: 1-98/9/25/p, # 301, 3rd Floor, Sri Sai Balaji Avenue,<br>Arunodaya Colony, Madhapur, Hyderabad, TG - 500081</p>
                  </div>
                </div>
                <div style="text-align: center; margin-top: 10px;">
                  <span style="font-size: 18px; font-weight: bold;">PAYSLIP ${formatMonthDisplay(employee.month).toUpperCase()}</span>
                </div>
              </td>
            </tr>
            <tr><td><strong>ID</strong></td><td>${employee.employeeId}</td><td><strong>Name</strong></td><td>${employee.name}</td></tr>
            <tr><td><strong>Month</strong></td><td>${formatMonthDisplay(employee.month)}</td><td><strong>Total Days</strong></td><td>${totalMonthDays} Days</td></tr>
            ${compOffBalance > 0 ? `<tr style="background-color: #f3e8ff;"><td colspan="4"><strong>✅ Comp-off Summary:</strong> Earned: ${employee.compOffEarned} | Used: ${employee.compOffUsed} | Balance: ${compOffBalance} days (₹${Math.round(compOffPay)})</td></tr>` : ''}
            <tr class="section-header"><td colspan="2">EARNINGS</td><td colspan="2">DEDUCTIONS</td></tr>
            <tr><td class="label-col">Basic Salary</td><td class="amount-col">₹${Math.round(grossSalary)}</td><td class="label-col">LOP / Absent</td><td class="amount-col" style="color:red;">-₹${Math.round(lopAmount)}</td></tr>
            <tr><td class="label-col">Working Days (${presentDays})</td><td class="amount-col">-</td><td class="label-col">Half Day Deductions (${halfDays} HD)</td><td class="amount-col" style="color:red;">-₹${Math.round(halfDayDeductionAmount)}</td></tr>
            <tr><td class="label-col">Week Off Days (${actualWeekOffDays})</td><td class="amount-col">-</td><td class="label-col"></td><td class="amount-col"></td></tr>
            ${compOffBalance > 0 ? `<tr style="background-color: #f3e8ff;"><td class="label-col"><strong>Comp-off Payment (${compOffBalance} days)</strong></td><td class="amount-col"><strong>₹${Math.round(compOffPay)}</strong></td><td class="label-col"></td><td class="amount-col"></td></tr>` : ''}
            <tr style="font-weight: bold; background-color: #f0f0f0;"><td class="label-col">Gross Earnings</td><td class="amount-col">₹${Math.round(totalEarnings)}</td><td class="label-col">Total Deductions</td><td class="amount-col" style="color:red;">₹${Math.round(halfDayDeductionAmount + lopAmount)}</td></tr>
            <tr style="font-weight: bold; background-color: #e0eee0;"><td colspan="2" style="text-align: right;">NET PAY</td><td colspan="2" style="text-align: left;">₹${Math.round(netPay)}</td></tr>
          </table>
          <div style="text-align: center; font-size: 10px; margin-top: 10px;">This is a computer-generated document.</div>
        </div>
      </body>
      </html>
    `;
  };

  // ✅ Download salary slip
  const downloadSalarySlip = async (employee) => {
    if (!employee.canDownload) {
      alert(`Salary slip for current month will be available for download from 30th onwards.`);
      return;
    }
    const slipContent = generateInvoiceHTML(employee);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(slipContent);
      printWindow.document.close();
      printWindow.print();
    }
  };


  // ✅ Get leave types for display
  const getLeaveTypes = (employee) => {
    const leavesData = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0, leaveDetails: [] };
    
    // ✅ Filter leaves for the specific month
    const targetMonth = employee.month && employee.month !== "Not specified" ? employee.month : getCurrentMonth();
    const monthLeaves = { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    
    if (leavesData.leaveDetails && targetMonth) {
      leavesData.leaveDetails.forEach(leave => {
        const leaveDate = new Date(leave.startDate);
        const leaveMonth = `${leaveDate.getFullYear()}-${String(leaveDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (leaveMonth === targetMonth) {
          if (monthLeaves[leave.type] !== undefined) {
            monthLeaves[leave.type] += leave.days;
          } else {
            monthLeaves.Other += leave.days;
          }
        }
      });
    }

    const leaveStrings = [];
    if (monthLeaves.CL > 0) leaveStrings.push(`CL: ${monthLeaves.CL}`);
    if (monthLeaves.EL > 0) leaveStrings.push(`EL: ${monthLeaves.EL}`);
    if (monthLeaves.COFF > 0) leaveStrings.push(`COFF: ${monthLeaves.COFF}`);
    if (monthLeaves.LOP > 0) leaveStrings.push(`LOP: ${monthLeaves.LOP}`);
    if (monthLeaves.Other > 0) leaveStrings.push(`Other: ${monthLeaves.Other}`);

    return leaveStrings.length > 0 ? leaveStrings.join(', ') : 'No Leaves';
  };


  const currentEmployee = getCurrentEmployee();

  const StatCard = ({ icon: Icon, label, value, color, prefix = "" }) => (
    <div className={`bg-white rounded-lg p-3 shadow-sm border-t-4 border-${color}-500 flex items-center justify-between`}>
      <div className="flex items-center gap-2">
        <Icon className="text-gray-400 text-base" />
        <div className="text-sm font-medium text-gray-700">{label}</div>
      </div>
      <div className="text-sm font-bold">
        {typeof value === 'number' ? <CountUp end={value} duration={2} separator="," prefix={prefix} /> : value}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-700">Loading your salary data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md p-8 text-center bg-white rounded-2xl shadow-lg">
          <div className="mb-4 text-4xl text-red-500">❌</div>
          <p className="mb-4 text-lg font-semibold text-red-600">{error}</p>
          <button onClick={() => fetchSalaryData(selectedMonth)} className="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-2 py-2 bg-gray-100 font-sans sm:px-3 sm:py-3">
      <div className="mx-auto max-w-9xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
          <StatCard label="Total Records" value={filteredRecords.length} color="indigo" icon={FiFileText} />
          <StatCard label="Total Salary" value={filteredRecords.reduce((sum, emp) => sum + (emp.calculatedSalary || 0), 0)} color="emerald" icon={FiDollarSign} prefix="₹" />
          <StatCard label="Available Docs" value={filteredRecords.filter(emp => emp.canDownload).length} color="purple" icon={FiDownloadCloud} />
          <StatCard label="Avg Salary" value={filteredRecords.length > 0 ? Math.round(filteredRecords.reduce((sum, emp) => sum + (emp.calculatedSalary || 0), 0) / filteredRecords.length) : 0} color="amber" icon={FiPieChart} prefix="₹" />
        </div>

        {/* Filters */}
        <div className="p-2 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
              <input type="text" placeholder="Search by month..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-lg" />
            </div>
            <div className="relative w-[140px]">
              <input type="month" value={selectedMonth} onChange={handleMonthSelect} className="w-full px-2 py-1.5 text-xs border rounded-lg" max={getCurrentMonth()} />
            </div>
            <button onClick={() => { setSelectedMonth(""); fetchSalaryData(); }} className="h-8 px-3 text-xs font-medium text-gray-700 bg-gray-100 border rounded-md hover:bg-gray-200">Current</button>
            <button onClick={() => fetchSalaryData(selectedMonth)} disabled={isLoadingMonth} className="h-8 px-3 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1">
              <RefreshCw size={12} className={isLoadingMonth ? "animate-spin" : ""} /> {isLoadingMonth ? "..." : "Refresh"}
            </button>
            {(searchTerm || selectedMonth) && <button onClick={handleClearFilter} className="h-8 px-3 text-xs font-medium text-gray-600 bg-gray-100 border rounded-md hover:bg-gray-200">Clear</button>}
          </div>
        </div>

        {/* Month Info Notice */}
        <div className={`px-3 py-2 mb-4 rounded-md shadow-sm ${monthInfo.isHistorical ? 'bg-green-50 border-l-4 border-green-500' : monthInfo.isCurrent ? (monthInfo.includeWeekOff ? 'bg-green-50 border-l-4 border-green-500' : 'bg-yellow-50 border-l-4 border-yellow-500') : 'bg-blue-50 border-l-4 border-blue-500'}`}>
          <p className="text-xs font-medium">
            {monthInfo.isHistorical ? "✓ Historical Month - Full salary with week-off included" : monthInfo.isCurrent ? (monthInfo.includeWeekOff ? "✓ Current Month (After 26th) - Week-off included" : "⚠️ Current Month (Before 26th) - Week-off will be added after 26th") : "ℹ️ Future Month - Preview only"}
          </p>
        </div>

        {/* Table */}
        <div className="overflow-hidden bg-white rounded-2xl shadow-lg">
          {filteredRecords.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mb-4 text-6xl">📭</div>
              <p className="mb-4 text-lg font-semibold text-gray-600">No salary records found.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-blue-600">
                    <tr className="text-xs text-white uppercase">
                      <th className="py-2.5 px-2">MONTH</th>
                      <th className="py-2.5 px-2">PRESENT</th>
                      <th className="py-2.5 px-2">WORKING</th>
                      <th className="py-2.5 px-2">HALF</th>
                      <th className="py-2.5 px-2">WEEKOFF</th>
                      <th className="py-2.5 px-2">LEAVES</th>
                      <th className="py-2.5 px-2">COMP-OFF</th>
                      <th className="py-2.5 px-2">SALARY</th>
                      <th className="py-2.5 px-2">STATUS</th>
                      <th className="py-2.5 px-2">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentRecords.map((emp, idx) => {
                      const dailyRate = calculateDailyRate(emp);
                      return (
                        <tr key={idx} className={`hover:bg-blue-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="px-2 py-1.5 text-center text-xs font-semibold">
                            {emp.monthFormatted || formatMonthDisplay(emp.month)}
                            <div className="text-[9px] text-gray-500">{emp.monthDays} days</div>
                          </td>
                          <td className="px-2 py-1.5 text-center"><span className="px-1.5 py-0.5 text-xs font-medium text-green-800 bg-green-100 rounded-full">{emp.presentDays || 0}</span></td>
                          <td className="px-2 py-1.5 text-center"><span className="px-1.5 py-0.5 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">{emp.workingDays || 0}</span></td>
                          <td className="px-2 py-1.5 text-center"><span className="px-1.5 py-0.5 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">{emp.halfDays || 0}</span></td>
                          <td className="px-2 py-1.5 text-center"><span className="px-1.5 py-0.5 text-xs font-medium text-purple-800 bg-purple-100 rounded-full">{emp.weekOffs || 0}</span></td>
                          <td className="px-2 py-1.5 text-center"><span className="px-1.5 py-0.5 text-xs font-medium text-red-800 bg-red-100 rounded-full">{emp.totalLeaves || 0}</span></td>
                          
                          {/* ✅ COMP-OFF COLUMN - EXACTLY LIKE PAYROLL */}
                          <td className="px-2 py-1.5 text-center">
                            {emp.compOffBalance > 0 ? (
                              <div className="flex flex-col items-center">
                                <span className="px-1.5 py-0.5 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
                                  +{emp.compOffEarned} / -{emp.compOffUsed} = {emp.compOffBalance}
                                </span>
                                <div className="text-[8px] text-gray-500">₹{((emp.compOffBalance || 0) * parseFloat(dailyRate)).toFixed(0)}</div>
                              </div>
                            ) : emp.compOffEarned > 0 ? (
                              <span className="px-1.5 py-0.5 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
                                +{emp.compOffEarned} / -{emp.compOffUsed} = 0
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">0</span>
                            )}
                          </td>
                          
                          <td className="px-2 py-1.5 text-center">
                            <div className="text-xs font-semibold text-green-700">₹{Math.round(emp.calculatedSalary)}</div>
                            <div className="text-[8px] text-gray-500">₹{dailyRate}/day</div>
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            {emp.canDownload ? 
                              <span className="px-1.5 py-0.5 text-xs font-medium text-green-800 bg-green-100 rounded-full">Available</span> : 
                              <span className="px-1.5 py-0.5 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">From 30th</span>
                            }
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <div className="flex justify-center space-x-1">
                              <button onClick={() => handleViewDetails(emp)} className="p-1 text-blue-600 rounded-md hover:bg-blue-50"><Eye size={14} /></button>
                              <button onClick={() => downloadSalarySlip(emp)} disabled={!emp.canDownload} className={`p-1 rounded-md ${emp.canDownload ? 'text-purple-600 hover:bg-purple-50' : 'text-gray-400 cursor-not-allowed'}`}><Download size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredRecords.length > 0 && (
                <div className="flex flex-col items-center justify-between gap-4 px-4 py-3 border-t sm:flex-row">
                  <div className="text-xs text-gray-600">Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredRecords.length)} of {filteredRecords.length} entries</div>
                  <div className="flex space-x-1">
                    <button onClick={handlePrevious} disabled={currentPage === 1} className={`px-3 py-1 text-xs border rounded-lg ${currentPage === 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-blue-600 bg-white hover:bg-blue-50'}`}>Previous</button>
                    {getPageNumbers().map(p => <button key={p} onClick={() => handlePageClick(p)} className={`px-3 py-1 text-xs border rounded-lg ${currentPage === p ? 'text-white bg-blue-600' : 'text-blue-600 bg-white hover:bg-blue-50'}`}>{p}</button>)}
                    <button onClick={handleNext} disabled={currentPage === totalPages} className={`px-3 py-1 text-xs border rounded-lg ${currentPage === totalPages ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-blue-600 bg-white hover:bg-blue-50'}`}>Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ✅ DETAILS MODAL - EXACTLY LIKE PAYROLL */}
      {showDetailsModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between mb-4 bg-white">
              <h2 className="text-xl font-bold text-gray-800">Employee Details</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full shrink-0">
                <span className="text-lg font-semibold text-blue-800">{selectedEmployee.name?.charAt(0) || 'E'}</span>
              </div>
              <div className="flex flex-col flex-1 space-y-1">
                <h3 className="text-lg font-semibold text-gray-800">{selectedEmployee.name}</h3>
                <div className="grid grid-cols-2 text-sm text-gray-600 gap-x-6 gap-y-1">
                  <p><span className="font-medium text-gray-700">ID:</span> {selectedEmployee.employeeId}</p>
                  <p><span className="font-medium text-gray-700">Department:</span> {selectedEmployee.department || 'N/A'}</p>
                  <p><span className="font-medium text-gray-700">Designation:</span> {selectedEmployee.designation || 'N/A'}</p>
                  <p><span className="font-medium text-gray-700">Month:</span> {selectedEmployee.month || selectedMonth || "Current"} ({selectedEmployee.monthDays || monthDays} days)</p>
                </div>
              </div>
            </div>

            {/* ✅ COMP-OFF SUMMARY - EXACTLY LIKE PAYROLL */}
            {(selectedEmployee.compOffBalance > 0 || selectedEmployee.compOffEarned > 0) && (
              <div className="p-3 mt-4 rounded-lg bg-purple-50">
                <p className="text-sm font-medium text-purple-800">Comp-off Summary - {formatMonthDisplay(selectedEmployee.month || selectedMonth)}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="text-center">
                    <span className="text-xs text-gray-600">Leave Taken</span>
                    <p className="text-2xl font-bold text-blue-600">
                      {(() => {
                        const leaves = employeeLeaves[selectedEmployee.employeeId];
                        return (leaves?.CL || 0) + (leaves?.EL || 0) + (leaves?.COFF || 0) + (leaves?.Other || 0);
                      })()}
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-gray-400">-</span>
                  <div className="text-center">
                    <span className="text-xs text-gray-600">Comp-off Used</span>
                    <p className="text-2xl font-bold text-purple-600">
                      {(() => {
                        const leaves = employeeLeaves[selectedEmployee.employeeId];
                        const totalLeaves = (leaves?.CL || 0) + (leaves?.EL || 0) + (leaves?.COFF || 0) + (leaves?.Other || 0);
                        const earned = selectedEmployee.compOffEarned || 0;
                        return Math.min(earned, totalLeaves);
                      })()}
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-gray-400">=</span>
                  <div className="text-center">
                    <span className="text-xs text-gray-600">Balance</span>
                    <p className="text-2xl font-bold text-green-600">
                      {(() => {
                        const leaves = employeeLeaves[selectedEmployee.employeeId];
                        const totalLeaves = (leaves?.CL || 0) + (leaves?.EL || 0) + (leaves?.COFF || 0) + (leaves?.Other || 0);
                        const earned = selectedEmployee.compOffEarned || 0;
                        const used = Math.min(earned, totalLeaves);
                        return totalLeaves - used;
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 mt-4 mb-4 text-sm sm:grid-cols-2 gap-x-10 gap-y-2">
              <div className="flex justify-between pb-1 border-b"><span className="text-gray-600">Present Days</span><span className="font-semibold text-green-600">{selectedEmployee.presentDays || 0}</span></div>
              <div className="flex justify-between pb-1 border-b"><span className="text-gray-600">Working Days</span><span className="font-semibold text-blue-600">{selectedEmployee.workingDays || 0}</span></div>
              <div className="flex justify-between pb-1 border-b"><span className="text-gray-600">Half Days</span><span className="font-semibold text-yellow-600">{selectedEmployee.halfDays || 0}</span></div>
              <div className="flex justify-between pb-1 border-b"><span className="text-gray-600">WeekOff Days</span><span className="font-semibold text-purple-600">{selectedEmployee.weekOffs || 0}</span></div>
              <div className="flex justify-between pb-1 border-b"><span className="text-gray-600">Month Days</span><span className="font-semibold text-gray-800">{selectedEmployee.monthDays || monthDays}</span></div>
              <div className="flex justify-between pb-1 border-b"><span className="text-gray-600">Monthly Salary</span><span className="font-semibold text-blue-600">₹{selectedEmployee.salaryPerMonth || 0}</span></div>
              <div className="flex justify-between pb-1 border-b"><span className="text-gray-600">Daily Rate</span><span className="font-semibold text-gray-800">₹{calculateDailyRate(selectedEmployee)}/day</span></div>
              <div className="flex justify-between pb-1 border-b"><span className="text-gray-600">Calculated Salary</span><span className="font-semibold text-green-600">₹{Math.round(selectedEmployee.calculatedSalary || 0)}</span></div>
              <div className="flex flex-col pb-2 border-b sm:col-span-2">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-600">Approved Leaves</span>
                  <span className="font-semibold text-red-600">{getLeaveTypes(selectedEmployee) || "0"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-600">Comp-off Collection</span>
                  <span className="px-3 py-1 text-sm font-semibold text-purple-700 bg-purple-100 rounded-full">
                    {(() => {
                      const leaves = employeeLeaves[selectedEmployee.employeeId];
                      const totalLeaves = (leaves?.CL || 0) + (leaves?.EL || 0) + (leaves?.COFF || 0) + (leaves?.Other || 0);
                      const earned = selectedEmployee.compOffEarned || 0;
                      const used = Math.min(earned, totalLeaves);
                      const balance = totalLeaves - used;
                      return `${totalLeaves} - ${used} = ${balance}`;
                    })()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button onClick={() => downloadSalarySlip(selectedEmployee)} disabled={!selectedEmployee.canDownload} className={`px-6 py-2 rounded-lg transition duration-200 ${selectedEmployee.canDownload ? 'bg-purple-500 text-white hover:bg-purple-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Download Payslip</button>
              <button onClick={handleCloseModal} className="px-6 py-2 text-white transition duration-200 bg-blue-500 rounded-lg hover:bg-blue-600">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







// import axios from "axios";
// import { Download, Eye, RefreshCw, Search, X } from "lucide-react";
// import { useCallback, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import logo from "../Images/Timely-Health-Logo.png";

// export default function EmployeeDashboard() {
//   const [records, setRecords] = useState([]);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [selectedMonth, setSelectedMonth] = useState("");
//   const [isLoadingMonth, setIsLoadingMonth] = useState(false);
//   const [employeesMasterData, setEmployeesMasterData] = useState({});
//   const [employeeLeaves, setEmployeeLeaves] = useState({});
//   const [monthDays, setMonthDays] = useState(30);
//   const [monthInfo, setMonthInfo] = useState({
//     isHistorical: false,
//     isCurrent: false,
//     includeWeekOff: false,
//     canDownload: false
//   });

//   const recordsPerPage = 10;
//   const navigate = useNavigate();
//   const BASE_URL = "https://api.timelyhealth.in";

//   // ✅ Get current logged-in employee data
//   const getCurrentEmployee = () => {
//     const employeeData = JSON.parse(localStorage.getItem("employeeData"));
//     return employeeData || {};
//   };

//   // ✅ Check if month is historical
//   const isHistoricalMonth = (month) => {
//     if (!month) return false;

//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth() + 1;

//     const [year, monthNum] = month.split('-').map(Number);

//     if (year < currentYear) return true;
//     if (year === currentYear && monthNum < currentMonth) return true;

//     return false;
//   };

//   // ✅ Check if month is current month
//   const isCurrentMonth = (month) => {
//     if (!month) return true;

//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth() + 1;

//     const [year, monthNum] = month.split('-').map(Number);

//     return year === currentYear && monthNum === currentMonth;
//   };

//   // ✅ Check if week-off should be included in salary
//   const shouldIncludeWeekOffInSalary = (month) => {
//     if (isHistoricalMonth(month)) return true;

//     if (isCurrentMonth(month)) {
//       const today = new Date();
//       const currentDay = today.getDate();
//       return currentDay >= 26;
//     }

//     return true;
//   };

//   // ✅ Check if payslip download is allowed
//   const isPayslipDownloadAllowed = (month) => {
//     if (isHistoricalMonth(month)) return true;

//     if (isCurrentMonth(month)) {
//       const today = new Date();
//       const currentDay = today.getDate();
//       return currentDay >= 30;
//     }

//     return true;
//   };

//   // ✅ Process Leaves Data
//   const processLeavesData = useCallback((leavesData) => {
//     const leavesMap = {};

//     leavesData.forEach(leave => {
//       const employeeId = leave.employeeId;
//       if (!employeeId) return;

//       if (!leavesMap[employeeId]) {
//         leavesMap[employeeId] = {
//           CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0, leaveDetails: []
//         };
//       }

//       const leaveType = leave.leaveType || 'Other';
//       const duration = calculateLeaveDuration(leave.startDate, leave.endDate);

//       if (leavesMap[employeeId][leaveType] !== undefined) {
//         leavesMap[employeeId][leaveType] += duration;
//       } else {
//         leavesMap[employeeId].Other += duration;
//       }

//       leavesMap[employeeId].leaveDetails.push({
//         type: leaveType,
//         startDate: leave.startDate,
//         endDate: leave.endDate,
//         days: duration,
//         reason: leave.reason || '',
//         status: leave.status || 'pending'
//       });
//     });

//     setEmployeeLeaves(leavesMap);
//   }, []);

//   const calculateLeaveDuration = (fromDate, toDate) => {
//     if (!fromDate) return 0;
//     const start = new Date(fromDate);
//     const end = toDate ? new Date(toDate) : new Date(fromDate);
//     const diffTime = Math.abs(end - start);
//     return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
//   };

//   // ✅ Fetch Master Data (Employees & Leaves)
//   useEffect(() => {
//     const fetchMasterData = async () => {
//       try {
//         const [empRes, leavesRes] = await Promise.all([
//           fetch(`${BASE_URL}/api/employees/get-employees`).catch(() => ({ ok: false })),
//           fetch(`${BASE_URL}/api/leaves/leaves?status=approved`).catch(() => ({ ok: false }))
//         ]);

//         if (empRes.ok) {
//           const employees = await empRes.json();
//           const empMap = {};
//           employees.forEach(emp => {
//             empMap[emp.employeeId] = {
//               salaryPerMonth: emp.salaryPerMonth || 0,
//               shiftHours: emp.shiftHours || 8,
//               weekOffPerMonth: emp.weekOffPerMonth || 0,
//               name: emp.name,
//               employeeId: emp.employeeId,
//               department: emp.department || '',
//               designation: emp.role || emp.designation || '',
//               joiningDate: emp.joinDate || emp.joiningDate || '',
//               bankAccount: emp.bankAccount || '',
//               panCard: emp.panCard || '',
//               weekOffDay: emp.weekOffDay || '',
//               weekOffType: emp.weekOffType || '0+4'
//             };
//           });
//           setEmployeesMasterData(empMap);
//         }

//         if (leavesRes.ok) {
//           const leaves = await leavesRes.json();
//           processLeavesData(leaves);
//         }
//       } catch (error) {
//         console.error("Error fetching master data:", error);
//       }
//     };

//     fetchMasterData();
//   }, [processLeavesData]);

//   // ✅ Helper to get Employee Data
//   const getEmployeeData = (employee) => {
//     return employeesMasterData[employee.employeeId] || {
//       salaryPerMonth: employee.salaryPerMonth || 0,
//       shiftHours: 8,
//       weekOffPerMonth: employee.weekOffs || 0,
//       name: employee.name || '',
//       designation: '',
//       department: '',
//       joiningDate: '',
//       employeeId: employee.employeeId
//     };
//   };

//   // ✅ Calculate Daily Rate
//   const calculateDailyRate = (employee) => {
//     const empData = getEmployeeData(employee);
//     if (!empData || !empData.salaryPerMonth) return 0;
//     const daysInMonth = employee.monthDays || monthDays || 30;
//     return (empData.salaryPerMonth / daysInMonth).toFixed(2);
//   };

//   // ✅ Format month for display
//   const formatMonthDisplay = (monthStr) => {
//     if (!monthStr || monthStr === "Not specified") return "Current Month";
//     const [year, month] = monthStr.split("-");
//     const monthNames = [
//       'January', 'February', 'March', 'April', 'May', 'June',
//       'July', 'August', 'September', 'October', 'November', 'December'
//     ];
//     return `${monthNames[parseInt(month) - 1]} ${year}`;
//   };

//   // ✅ Format month for API (YYYY-MM)
//   const formatMonthForAPI = (date) => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     return `${year}-${month}`;
//   };

//   // ✅ Get current month in YYYY-MM format
//   const getCurrentMonth = () => {
//     const today = new Date();
//     return formatMonthForAPI(today);
//   };

//   // ✅ Fetch salary data for current employee
//   const fetchSalaryData = async (month = "") => {
//     try {
//       setLoading(true);
//       setIsLoadingMonth(true);
//       setError(null);

//       const employeeData = getCurrentEmployee();
//       const employeeId = employeeData?.employeeId;

//       if (!employeeId) {
//         setError("❌ Employee ID not found. Please log in again.");
//         setLoading(false);
//         return;
//       }

//       console.log("📥 Fetching salary data for employee:", employeeId, "Month:", month || "Current");

//       // Update month info
//       const isHistorical = isHistoricalMonth(month);
//       const isCurrent = isCurrentMonth(month);
//       const includeWeekOff = shouldIncludeWeekOffInSalary(month);
//       const canDownload = isPayslipDownloadAllowed(month);

//       setMonthInfo({
//         isHistorical,
//         isCurrent,
//         includeWeekOff,
//         canDownload
//       });

//       // Fetch salary data with or without month filter
//       const salaryUrl = month
//         ? `${BASE_URL}/api/attendancesummary/getsalaries?month=${month}`
//         : `${BASE_URL}/api/attendancesummary/getsalaries`;

//       const salaryRes = await fetch(salaryUrl);

//       if (!salaryRes.ok) {
//         throw new Error(`Failed to fetch salary data: ${salaryRes.status}`);
//       }

//       const salaryData = await salaryRes.json();
//       console.log("💰 Salary API Response:", salaryData);

//       let employeeSalaryRecords = [];

//       if (salaryData.success && salaryData.salaries && salaryData.salaries.length > 0) {
//         // Filter only current employee's records
//         employeeSalaryRecords = salaryData.salaries
//           .filter(salary => salary.employeeId === employeeId)
//           .map(salary => {
//             const actualWeekOffDays = salary.weekOffs || 0;
//             const weekOffDaysForSalary = includeWeekOff ? actualWeekOffDays : 0;

//             // Adjust calculated salary if week-off not included
//             let calculatedSalary = salary.calculatedSalary || 0;
//             if (!includeWeekOff && calculatedSalary > 0) {
//               const daysInMonth = salaryData.monthDays || 30;
//               const dailyRate = (salary.salaryPerMonth || 0) / daysInMonth;
//               const weekOffAmount = actualWeekOffDays * dailyRate;
//               calculatedSalary = Math.max(0, calculatedSalary - weekOffAmount);
//             }

//             return {
//               ...salary,
//               employeeId: salary.employeeId,
//               name: salary.name,
//               presentDays: salary.presentDays || 0,
//               workingDays: salary.totalWorkingDays || salary.workingDays || 0,
//               totalWorkingDays: salary.totalWorkingDays || salary.workingDays || 0,
//               halfDays: salary.halfDayWorking || 0,
//               calculatedSalary: calculatedSalary,
//               month: salary.month || month || "Not specified",
//               monthFormatted: formatMonthDisplay(salary.month || month),
//               weekOffs: actualWeekOffDays,
//               weekOffsForSalary: weekOffDaysForSalary,
//               totalLeaves: salary.totalLeaves || 0,
//               salaryPerMonth: salary.salaryPerMonth || 0,
//               extraWork: salary.extraWork || {},
//               monthDays: salaryData.monthDays || 30,
//               isHistoricalMonth: isHistorical,
//               isCurrentMonth: isCurrent,
//               includeWeekOffInSalary: includeWeekOff,
//               canDownload: canDownload
//             };
//           });

//         if (salaryData.monthDays) {
//           setMonthDays(salaryData.monthDays);
//         }
//       }

//       // Sort by latest month first
//       const sortedRecords = employeeSalaryRecords.sort((a, b) => {
//         const monthA = a.month || "";
//         const monthB = b.month || "";
//         return monthB.localeCompare(monthA);
//       });

//       console.log("✅ Employee Salary Records:", sortedRecords);

//       setRecords(sortedRecords);
//       setFilteredRecords(sortedRecords);

//     } catch (err) {
//       console.error("❌ Salary fetch error:", err);
//       setError(err.message || "Failed to load salary data");
//     } finally {
//       setLoading(false);
//       setIsLoadingMonth(false);
//     }
//   };

//   // ✅ Initial load - fetch all data
//   useEffect(() => {
//     fetchSalaryData();
//   }, [employeesMasterData]);

//   // ✅ Handle month selection
//   const handleMonthSelect = (e) => {
//     const monthValue = e.target.value;
//     if (monthValue) {
//       setSelectedMonth(monthValue);
//       fetchSalaryData(monthValue);
//     }
//   };

//   // ✅ Clear all filters
//   const handleClearFilter = () => {
//     setSearchTerm("");
//     setSelectedMonth("");
//     fetchSalaryData();
//   };

//   // ✅ Filter records based on search and filters
//   useEffect(() => {
//     let filtered = [...records];

//     // Apply search filter
//     if (searchTerm.trim() !== "") {
//       const searchLower = searchTerm.toLowerCase();
//       filtered = filtered.filter(record => {
//         return (
//           (record.monthFormatted && record.monthFormatted.toLowerCase().includes(searchLower)) ||
//           (record.month && record.month.toLowerCase().includes(searchLower)) ||
//           (record.calculatedSalary && record.calculatedSalary.toString().includes(searchTerm))
//         );
//       });
//     }

//     // Apply month filter if selected
//     if (selectedMonth) {
//       filtered = filtered.filter(record => record.month === selectedMonth);
//     }

//     setFilteredRecords(filtered);
//     setCurrentPage(1);
//   }, [searchTerm, selectedMonth, records]);

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

//   // ✅ Handle view details
//   const handleViewDetails = (employee) => {
//     setSelectedEmployee(employee);
//     setShowDetailsModal(true);
//   };

//   // ✅ Close modal
//   const handleCloseModal = () => {
//     setShowDetailsModal(false);
//     setSelectedEmployee(null);
//   };

//   // ✅ Generate Invoice HTML
//   const generateInvoiceHTML = (employee) => {
//     const employeeData = getEmployeeData(employee);

//     if (!employeeData.salaryPerMonth || employeeData.salaryPerMonth === 0) {
//       return `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <title>Payslip</title>
//           <style>
//             body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; text-align: center; }
//             .error { color: red; font-size: 18px; margin-top: 100px; border: 1px solid red; padding: 20px; display: inline-block; }
//           </style>
//         </head>
//         <body>
//           <div class="error">
//             <h2>Salary Data Not Available</h2>
//             <p>Salary information is not available for ${employee?.name || 'this employee'}.</p>
//             <p>Please contact HR department.</p>
//           </div>
//         </body>
//         </html>
//       `;
//     }

//     const totalMonthDays = employee.monthDays || monthDays || 30;
//     const dailyRate = calculateDailyRate(employee);
//     const dailyRateNumber = parseFloat(dailyRate) || 0;

//     const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };

//     const actualWeekOffDays = employee.weekOffs || 0;
//     const weekOffDaysForSalary = employee.weekOffsForSalary || 0;
//     const includeWeekOffInSalary = employee.includeWeekOffInSalary || false;

//     const presentDays = employee.presentDays || 0;
//     const halfDays = employee.halfDays || 0;
//     const paidLeaveDays = (leaves.CL || 0) + (leaves.EL || 0) + (leaves.COFF || 0);

//     const totalPaidDays = presentDays + (halfDays * 0.5) + weekOffDaysForSalary + paidLeaveDays;

//     const halfDayDeductionDays = halfDays * 0.5;
//     const halfDayDeductionAmount = halfDayDeductionDays * dailyRateNumber;

//     const totalUnpaidDays = Math.max(0, totalMonthDays - totalPaidDays);
//     const lopDays = Math.max(0, totalUnpaidDays - halfDayDeductionDays);

//     const grossSalary = employeeData.salaryPerMonth || 0;
//     const bonus = employee.extraWork?.bonus || 0;
//     const extraDaysPay = (employee.extraWork?.extraDays || 0) * dailyRateNumber;

//     const otherDeductions = employee.extraWork?.deductions || 0;

//     const totalEarnings = grossSalary + bonus + extraDaysPay;
//     const netPay = employee.calculatedSalary || (totalEarnings - (halfDayDeductionAmount + (lopDays * dailyRateNumber) + otherDeductions));
//     const lopAmount = Math.max(0, totalEarnings - netPay - halfDayDeductionAmount - otherDeductions);
//     const totalDeductions = halfDayDeductionAmount + lopAmount + otherDeductions;

//     const hasExtraWork = employee.extraWork && (
//       (employee.extraWork.extraDays || 0) > 0 ||
//       (employee.extraWork.bonus || 0) > 0 ||
//       (employee.extraWork.deductions || 0) > 0
//     );

//     const isHistorical = employee.isHistoricalMonth;
//     const isCurrent = employee.isCurrentMonth;

//     return `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="utf-8">
//         <title>Payslip - ${employee.name}</title>
//         <style>
//           @page { size: A4; margin: 0; }
//           body { 
//             font-family: Arial, sans-serif; 
//             margin: 0; 
//             padding: 20px;
//             color: #000;
//           }
//           .invoice-container { 
//             width: 100%; 
//             max-width: 210mm;
//             margin: 0 auto; 
//             border: 1px solid #000; 
//           }
//           table { width: 100%; border-collapse: collapse; }
//           th, td { 
//             padding: 4px 8px; 
//             border: 1px solid #000; 
//             font-size: 12px; 
//             vertical-align: middle;
//           }
//           .header-cell { border: none; padding: 2px 2px; text-align: center; border-bottom: 1px solid #000; }
          
//           .section-header { 
//             background-color: #f0f0f0; 
//             font-weight: bold; 
//             text-align: center; 
//             text-transform: uppercase;
//           }
//           .amount-col { text-align: right; width: 15%; }
//           .label-col { text-align: left; width: 35%; }
          
//           .notes-box { 
//             margin: 10px; 
//             padding: 5px; 
//             border: 1px dashed #666; 
//             font-size: 11px;
//             background-color: #fafafa;
//           }
          
//           .info-note {
//             background-color: #fffde7;
//             border-left: 4px solid #ffc107;
//             padding: 8px;
//             margin: 10px 0;
//             font-size: 11px;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="invoice-container">
          
//           <!-- MAIN LAYOUT TABLE -->
//           <table>
            
//             <!-- HEADER -->
//             <tr>
//               <td colspan="4" class="header-cell">
//                 <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0px;">
//                   <div style="width: 130px; text-align: left;">
//                     <img src="${logo}" alt="Logo" style="height: 110px; width: auto; max-width: 130px; object-fit: contain; display: block;">
//                   </div>
//                   <div style="flex: 1; text-align: center; margin-right: 130px;">
//                     <h1 style="margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase;">Timely Health Tech Pvt Ltd</h1>
//                     <p style="margin: 0px 0 0 0; font-size: 11px; line-height: 1.1;">
//                       H. No: 1-98/9/25/p, # 301, 3rd Floor, Sri Sai Balaji Avenue,<br> 
//                       Arunodaya Colony, Madhapur, Hyderabad, TG - 500081
//                     </p>
//                   </div>
//                 </div>
//                 <div style="text-align: center; margin-bottom: 2px;">
//                   <span style="font-size: 18px; font-weight: bold; text-decoration: underline; text-underline-offset: 3px; display: inline-block;">PAYSLIP ${formatMonthDisplay(employee.month || selectedMonth).toUpperCase()}</span>
//                   <br>
//                   <span style="font-size: 11px; color: #666;">
//                     ${isHistorical ? 'Historical Month - Full Salary' : isCurrent ? 'Current Month' : 'Future Month'}
//                   </span>
//                 </div>
//               </td>
//             </tr>

//             <!-- EMPLOYEE DETAILS -->
//             <tr style="background-color: #fafafa;">
//               <td width="20%"><strong>ID</strong></td>
//               <td width="30%">${employee.employeeId}</td>
//               <td width="20%"><strong>Joined</strong></td>
//               <td width="30%">${employeeData.joiningDate ? new Date(employeeData.joiningDate).toLocaleDateString() : '-'}</td>
//             </tr>
//             <tr>
//               <td><strong>Name</strong></td>
//               <td>${employee.name}</td>
//               <td><strong>Role</strong></td>
//               <td>${employeeData.designation || '-'}</td>
//             </tr>
//             <tr style="background-color: #fafafa;">
//               <td><strong>Dept</strong></td>
//               <td>${employeeData.department || '-'}</td>
//               <td><strong>Month</strong></td>
//               <td>${formatMonthDisplay(employee.month || selectedMonth)}</td>
//             </tr>
//             <tr>
//               <td><strong>Invoice Date</strong></td>
//               <td>${new Date().toLocaleDateString()}</td>
//               <td><strong>Total Days</strong></td>
//               <td>${totalMonthDays} Days</td>
//             </tr>

//             <!-- WEEKOFF NOTICE FOR CURRENT MONTH -->
//             ${!includeWeekOffInSalary ? `
//             <tr>
//               <td colspan="4" style="border: none; padding: 5px;">
//                 <div class="info-note">
//                   <strong>Note:</strong> Weekoff salary for this month will be added after 26th ${formatMonthDisplay(employee.month || selectedMonth).split(' ')[0]}.
//                 </div>
//               </td>
//             </tr>
//             ` : ''}

//             <!-- SALARY BREAKDOWN HEADER -->
//             <tr class="section-header">
//               <td colspan="2">EARNINGS</td>
//               <td colspan="2">DEDUCTIONS</td>
//             </tr>

//             <!-- SALARY CONTENT Row 1 -->
//             <tr>
//               <td class="label-col">Basic Salary</td>
//               <td class="amount-col">₹${Math.round(grossSalary).toFixed(2)}</td>
//               <td class="label-col">LOP / Absent (${lopDays} days)</td>
//               <td class="amount-col" style="color:red;">
//                 ${lopAmount > 0 ? '-' : ''}₹${Math.round(lopAmount).toFixed(2)}
//               </td>
//             </tr>
            
//             <!-- ROW 2: Days Info -->
//             <tr>
//               <td class="label-col">Working Days (Full: ${presentDays})</td>
//               <td class="amount-col">-</td>
//               <td class="label-col">Half Day Deductions (${halfDays} HD)</td>
//               <td class="amount-col" style="color:red;">
//                 ${halfDayDeductionAmount > 0 ? '-' : ''}₹${Math.round(halfDayDeductionAmount).toFixed(2)}
//               </td>
//             </tr>

//             <!-- ROW 3: Week Offs -->
//             <tr>
//               <td class="label-col">Week Off Days (${actualWeekOffDays})</td>
//               <td class="amount-col">-</td>
//               <td class="label-col">Other Deductions</td>
//               <td class="amount-col" style="color:red;">
//                 ${otherDeductions > 0 ? '-' : ''}₹${otherDeductions.toFixed(2)}
//               </td>
//             </tr>

//             <!-- ROW 4: Extra / Bonus -->
//             <tr>
//               <td class="label-col">Bonus / Extra</td>
//               <td class="amount-col">₹${Math.round(bonus + extraDaysPay).toFixed(2)}</td>
//               <td class="label-col"></td>
//               <td class="amount-col"></td>
//             </tr>

//             <!-- TOTALS ROW -->
//             <tr style="font-weight: bold; background-color: #f0f0f0;">
//               <td class="label-col">Gross Earnings</td>
//               <td class="amount-col">₹${Math.round(totalEarnings).toFixed(2)}</td>
//               <td class="label-col">Total Deductions</td>
//               <td class="amount-col" style="color:red;">₹${Math.round(totalDeductions).toFixed(2)}</td>
//             </tr>

//             <!-- NET PAY ROW -->
//              <tr style="font-weight: bold; background-color: #e0eee0; font-size: 14px;">
//               <td class="label-col" colspan="2" style="text-align: right; padding-right: 20px;">NET PAY</td>
//               <td class="amount-col" colspan="2" style="text-align: left; padding-left: 20px;">₹${Math.round(netPay).toFixed(2)}</td>
//             </tr>

//             <!-- NOTES SECTION IF EXISTS -->
//             ${hasExtraWork && employee.extraWork.reason ? `
//             <tr>
//               <td colspan="4" style="border: none; padding: 10px;">
//                 <div class="notes-box">
//                   <strong>Adjustments Note:</strong> ${employee.extraWork.reason}
//                 </div>
//               </td>
//             </tr>
//             ` : ''}

//             <!-- DOWNLOAD NOTE FOR CURRENT MONTH -->
//             ${!employee.canDownload ? `
//             <tr>
//               <td colspan="4" style="border: none; padding: 5px;">
//                 <div class="info-note">
//                   <strong>Note:</strong> Salary slip for current month will be available for download from 30th onwards.
//                 </div>
//               </td>
//             </tr>
//             ` : ''}

//           </table>
          
//           <div style="text-align: center; font-size: 10px; margin-top: 10px;">
//             This is a computer-generated document.<br>
//             Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
//           </div>

//         </div>
//       </body>
//       </html>
//     `;
//   };

//   // ✅ Download salary slip with validation
//   const downloadSalarySlip = async (employee) => {
//     if (!employee.canDownload) {
//       alert(`Salary slip for current month will be available for download from 30th ${formatMonthDisplay(employee.month).split(' ')[0]} onwards.`);
//       return;
//     }

//     const slipContent = generateInvoiceHTML(employee);
//     const printWindow = window.open('', '_blank');
//     if (printWindow) {
//       printWindow.document.write(slipContent);
//       printWindow.document.close();
//       printWindow.print();

//       // ✅ Log payslip download activity
//       try {
//         const employeeData = getCurrentEmployee();
//         const employeeId = employeeData?.employeeId || employee.employeeId;
//         const employeeName = employeeData?.name || employee.name;
//         const employeeEmail = employeeData?.email || `${employeeId}@system.com`;

//         console.log("Logging employee payslip download:", {
//           employeeId,
//           employeeName,
//           employeeEmail,
//           month: employee.month
//         });

//         await axios.post("https://api.timelyhealth.in/user-activity/log", {
//           userId: employeeId,
//           userName: employeeName,
//           userEmail: employeeEmail,
//           userRole: "employee",
//           action: "payslip_download",
//           actionDetails: `Downloaded own payslip for ${formatMonthDisplay(employee.month || selectedMonth)}`,
//           metadata: {
//             employeeId: employee.employeeId,
//             employeeName: employee.name,
//             month: employee.month || selectedMonth,
//             salary: employee.calculatedSalary
//           }
//         });

//         console.log("✅ Employee payslip download logged successfully");
//       } catch (logError) {
//         console.error("❌ Failed to log payslip download activity:", logError);
//       }
//     }
//   };

//   // ✅ Get leave types for display
//   const getLeaveTypes = (employee) => {
//     const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
//     const leaveStrings = [];

//     if (leaves.CL > 0) leaveStrings.push(`CL: ${leaves.CL}`);
//     if (leaves.EL > 0) leaveStrings.push(`EL: ${leaves.EL}`);
//     if (leaves.COFF > 0) leaveStrings.push(`COFF: ${leaves.COFF}`);
//     if (leaves.LOP > 0) leaveStrings.push(`LOP: ${leaves.LOP}`);
//     if (leaves.Other > 0) leaveStrings.push(`Other: ${leaves.Other}`);

//     return leaveStrings.length > 0 ? leaveStrings.join(', ') : 'No Leaves';
//   };

//   const currentEmployee = getCurrentEmployee();

//   // Stat Card component
//   const StatCard = ({ label, value, color }) => {
//     return (
//       <div className={`px-2 py-2 bg-white border-t-4 ${color} rounded-md shadow-sm`}>
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-center text-xs font-medium text-gray-700">{label}</p>
//             <p className="text-center text-sm font-bold text-gray-800">{value}</p>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="text-center">
//           <div className="w-16 h-16 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
//           <p className="text-lg font-semibold text-gray-700">Loading your salary data...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="max-w-md p-8 text-center bg-white border border-red-200 shadow-lg rounded-2xl">
//           <div className="mb-4 text-4xl text-red-500">❌</div>
//           <p className="mb-4 text-lg font-semibold text-red-600">{error}</p>
//           <button
//             onClick={() => fetchSalaryData(selectedMonth)}
//             className="px-6 py-2 font-semibold text-white transition bg-red-600 rounded-lg hover:bg-red-700"
//           >
//             🔄 Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen px-2 py-2 bg-gradient-to-br from-purple-50 to-blue-100 sm:px-3 sm:py-3">
//       <div className="mx-auto max-w-9xl">

//         {/* Header */}
//         {/* <div className="mb-3">
//           <h1 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">💰 My Salary Records</h1>
//           <p className="text-xs text-gray-600 sm:text-sm">View and download your salary slips</p>
//         </div> */}

//         {/* Stats Overview */}
//         <div className="grid grid-cols-2 gap-2 mb-3 sm:grid-cols-4">
//           <StatCard
//             label={`Total Records: ${filteredRecords.length}`}
//             // value={filteredRecords.length}
//             color="border-blue-500"
//           />
//           <StatCard
//             label={`Total Salary: ₹${filteredRecords.reduce((sum, emp) => sum + (emp.calculatedSalary || 0), 0).toLocaleString()}`}
//             // value={`₹${filteredRecords.reduce((sum, emp) => sum + (emp.calculatedSalary || 0), 0).toLocaleString()}`}
//             color="border-green-500"
//           />
//           <StatCard
//             label={`Available: ${filteredRecords.filter(emp => emp.canDownload).length}`}
//             // value={filteredRecords.filter(emp => emp.canDownload).length}
//             color="border-purple-500"
//           />
//           <StatCard
//             label={`Average: ₹${filteredRecords.length > 0 
//               ? Math.round(filteredRecords.reduce((sum, emp) => sum + (emp.calculatedSalary || 0), 0) / filteredRecords.length).toLocaleString()
//               : '0'}`}
//             // value={`₹${filteredRecords.length > 0 
//             //   ? Math.round(filteredRecords.reduce((sum, emp) => sum + (emp.calculatedSalary || 0), 0) / filteredRecords.length).toLocaleString()
//             //   : '0'}`}
//             color="border-orange-500"
//           />
//         </div>

//         {/* Filters Section - Only Month Filter */}
//         <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
//           <div className="flex flex-wrap items-center gap-2">
            
//             {/* Search Bar */}
//             <div className="relative flex-1 min-w-[180px]">
//               <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
//               <input
//                 type="text"
//                 placeholder="Search by month..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Month Selector - ONLY THIS */}
//             <div className="relative w-[140px]">
//               <input
//                 type="month"
//                 value={selectedMonth}
//                 onChange={handleMonthSelect}
//                 onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                 placeholder="Select Month"
//                 className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                 max={getCurrentMonth()}
//               />
//             </div>

//             {/* Current Month Button */}
//             <button
//               onClick={() => {
//                 setSelectedMonth("");
//                 fetchSalaryData();
//               }}
//               className="h-8 px-3 text-xs font-medium text-gray-700 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
//             >
//               Current
//             </button>

//             {/* Refresh Button */}
//             <button
//               onClick={() => fetchSalaryData(selectedMonth)}
//               disabled={isLoadingMonth}
//               className="h-8 px-3 text-xs font-medium text-white transition bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
//             >
//               <RefreshCw size={12} className={isLoadingMonth ? "animate-spin" : ""} />
//               {isLoadingMonth ? "..." : "Refresh"}
//             </button>

//             {/* Clear Button */}
//             {(searchTerm || selectedMonth) && (
//               <button
//                 onClick={handleClearFilter}
//                 className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
//               >
//                 Clear
//               </button>
//             )}
//           </div>

//           {/* Active Filters Display */}
//           {(searchTerm || selectedMonth) && (
//             <div className="flex flex-wrap items-center gap-2 mt-2">
//               {selectedMonth && (
//                 <div className="flex items-center gap-1 px-2 py-0.5 text-xs text-blue-800 bg-blue-100 rounded-full">
//                   <span>Month: {formatMonthDisplay(selectedMonth)}</span>
//                   <button
//                     onClick={() => setSelectedMonth("")}
//                     className="text-blue-600 hover:text-blue-800"
//                   >
//                     <X size={10} />
//                   </button>
//                 </div>
//               )}
//               {searchTerm && (
//                 <div className="flex items-center gap-1 px-2 py-0.5 text-xs text-gray-800 bg-gray-100 rounded-full">
//                   <span>Search: "{searchTerm}"</span>
//                   <button
//                     onClick={() => setSearchTerm("")}
//                     className="text-gray-600 hover:text-gray-800"
//                   >
//                     <X size={10} />
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Month Type Notice */}
//         <div className={`px-3 py-2 mb-4 rounded-md shadow-sm ${
//             monthInfo.isHistorical
//               ? 'bg-green-50 border-l-4 border-green-500'
//               : monthInfo.isCurrent
//                 ? (monthInfo.includeWeekOff
//                   ? 'bg-green-50 border-l-4 border-green-500'
//                   : 'bg-yellow-50 border-l-4 border-yellow-500')
//                 : 'bg-blue-50 border-l-4 border-blue-500'
//           }`}>
//           <div className="flex items-center">
//             <div className="mr-2">
//               {monthInfo.isHistorical ? (
//                 <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               ) : monthInfo.isCurrent ? (
//                 monthInfo.includeWeekOff ? (
//                   <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 ) : (
//                   <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.406 16.5c-.77.833.192 2.5 1.732 2.5z" />
//                   </svg>
//                 )
//               ) : (
//                 <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                 </svg>
//               )}
//             </div>
//             <div>
//               <p className="text-xs font-medium">
//                 {monthInfo.isHistorical
//                   ? "✓ Historical Month - Full salary with week-off included"
//                   : monthInfo.isCurrent
//                     ? (monthInfo.includeWeekOff
//                       ? `✓ Current Month (After 26th) - Week-off included`
//                       : `Current Month (Before 26th) - Week-off will be added after 26th`)
//                     : "Future Month - Preview only"}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Table Container */}
//         <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl">
//           {filteredRecords.length === 0 ? (
//             <div className="py-16 text-center">
//               <div className="mb-4 text-6xl">📭</div>
//               <p className="mb-4 text-lg font-semibold text-gray-600">
//                 {records.length === 0 ? "No salary records found." : "No records match your filters."}
//               </p>
//               {records.length > 0 && (
//                 <button
//                   onClick={handleClearFilter}
//                   className="px-6 py-2 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
//                 >
//                   🔄 Clear Filters
//                 </button>
//               )}
//             </div>
//           ) : (
//             <>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full">
//                   <thead className="text-xs text-left text-white sm:text-sm bg-gradient-to-r from-green-500 to-blue-600">
//                     <tr>
//                       <th className="px-2 py-1.5 text-center">Month</th>
//                       <th className="px-2 py-1.5 text-center">Present</th>
//                       <th className="px-2 py-1.5 text-center">Working</th>
//                       <th className="px-2 py-1.5 text-center">Half</th>
//                       <th className="px-2 py-1.5 text-center">WeekOff</th>
//                       <th className="px-2 py-1.5 text-center">Leaves</th>
//                       <th className="px-2 py-1.5 text-center">Salary</th>
//                       <th className="px-2 py-1.5 text-center">Status</th>
//                       <th className="px-2 py-1.5 text-center">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {currentRecords.map((emp, index) => {
//                       const dailyRate = calculateDailyRate(emp);
//                       const isCurrentMonth = emp.isCurrentMonth;

//                       return (
//                         <tr
//                           key={index}
//                           className={`hover:bg-blue-50 transition duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
//                         >
//                           <td className="px-2 py-1.5 text-center">
//                             <div>
//                               <div className="text-xs font-semibold">{emp.monthFormatted || formatMonthDisplay(emp.month)}</div>
//                               <div className="text-[9px] text-gray-500">{emp.monthDays || 30} days</div>
//                               {isCurrentMonth && (
//                                 <div className="text-[8px] text-blue-600">Current</div>
//                               )}
//                             </div>
//                           </td>

//                           <td className="px-2 py-1.5 text-center">
//                             <span className="px-1.5 py-0.5 text-xs font-medium text-green-800 bg-green-100 rounded-full">
//                               {emp.presentDays || 0}
//                             </span>
//                           </td>

//                           <td className="px-2 py-1.5 text-center">
//                             <span className="px-1.5 py-0.5 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
//                               {emp.workingDays || 0}
//                             </span>
//                           </td>

//                           <td className="px-2 py-1.5 text-center">
//                             <span className="px-1.5 py-0.5 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
//                               {emp.halfDays || 0}
//                             </span>
//                           </td>

//                           <td className="px-2 py-1.5 text-center">
//                             <div className="flex flex-col items-center">
//                               <span className="px-1.5 py-0.5 text-xs font-medium text-purple-800 bg-purple-100 rounded-full">
//                                 {emp.weekOffs || 0}
//                               </span>
//                               {!emp.includeWeekOffInSalary && (
//                                 <div className="text-[8px] text-gray-500">After 26th</div>
//                               )}
//                             </div>
//                           </td>

//                           <td className="px-2 py-1.5 text-center">
//                             <span className="px-1.5 py-0.5 text-xs font-medium text-red-800 bg-red-100 rounded-full">
//                               {emp.totalLeaves || 0}
//                             </span>
//                           </td>

//                           <td className="px-2 py-1.5 text-center">
//                             <div>
//                               <div className="text-xs font-semibold text-green-700">₹{emp.calculatedSalary || 0}</div>
//                               <div className="text-[8px] text-gray-500">₹{dailyRate}/day</div>
//                             </div>
//                           </td>

//                           <td className="px-2 py-1.5 text-center">
//                             {emp.canDownload ? (
//                               <span className="px-1.5 py-0.5 text-xs font-medium text-green-800 bg-green-100 rounded-full">
//                                 Available
//                               </span>
//                             ) : (
//                               <span className="px-1.5 py-0.5 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
//                                 From 30th
//                               </span>
//                             )}
//                           </td>

//                           <td className="px-2 py-1.5 text-center">
//                             <div className="flex justify-center space-x-1">
//                               <button
//                                 onClick={() => handleViewDetails(emp)}
//                                 className="p-1 text-blue-600 transition duration-150 rounded-md hover:bg-blue-50"
//                                 title="View Details"
//                               >
//                                 <Eye size={14} />
//                               </button>

//                               <button
//                                 onClick={() => downloadSalarySlip(emp)}
//                                 disabled={!emp.canDownload}
//                                 className={`p-1 transition duration-150 rounded-md ${
//                                   emp.canDownload
//                                     ? 'text-purple-600 hover:bg-purple-50'
//                                     : 'text-gray-400 cursor-not-allowed'
//                                 }`}
//                                 title={emp.canDownload ? "Download Salary Slip" : "Available from 30th"}
//                               >
//                                 <Download size={14} />
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination */}
//               {filteredRecords.length > 0 && (
//                 <div className="flex flex-col items-center justify-between gap-4 px-4 py-3 border-t border-gray-200 sm:flex-row">
//                   <div className="text-xs text-gray-600">
//                     Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredRecords.length)} of {filteredRecords.length} entries
//                   </div>

//                   <div className="flex items-center space-x-1">
//                     <button
//                       onClick={handlePrevious}
//                       disabled={currentPage === 1}
//                       className={`px-3 py-1 text-xs border rounded-lg ${
//                         currentPage === 1
//                           ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
//                           : 'text-blue-600 bg-white hover:bg-blue-50 border-blue-200'
//                       }`}
//                     >
//                       Previous
//                     </button>

//                     {getPageNumbers().map(pageNumber => (
//                       <button
//                         key={pageNumber}
//                         onClick={() => handlePageClick(pageNumber)}
//                         className={`px-3 py-1 text-xs border rounded-lg ${
//                           currentPage === pageNumber
//                             ? 'text-white bg-blue-600 border-blue-600'
//                             : 'text-blue-600 bg-white hover:bg-blue-50 border-blue-300'
//                         }`}
//                       >
//                         {pageNumber}
//                       </button>
//                     ))}

//                     <button
//                       onClick={handleNext}
//                       disabled={currentPage === totalPages}
//                       className={`px-3 py-1 text-xs border rounded-lg ${
//                         currentPage === totalPages
//                           ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
//                           : 'text-blue-600 bg-white hover:bg-blue-50 border-blue-300'
//                       }`}
//                     >
//                       Next
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {/* Details Modal */}
//       {showDetailsModal && selectedEmployee && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg p-4 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-lg font-bold text-gray-800">
//                 Salary Details - {selectedEmployee.monthFormatted || formatMonthDisplay(selectedEmployee.month)}
//               </h2>
//               <button
//                 onClick={handleCloseModal}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             {/* Important Info Banner */}
//             {!selectedEmployee.canDownload && (
//               <div className="p-3 mb-4 bg-yellow-100 border border-yellow-300 rounded-lg">
//                 <div className="flex items-center">
//                   <svg className="w-4 h-4 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                   </svg>
//                   <span className="text-xs font-medium text-yellow-800">
//                     Salary slip available for download from 30th onwards.
//                   </span>
//                 </div>
//               </div>
//             )}

//             {!selectedEmployee.includeWeekOffInSalary && (
//               <div className="p-3 mb-4 bg-blue-100 border border-blue-300 rounded-lg">
//                 <div className="flex items-center">
//                   <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
//                   </svg>
//                   <span className="text-xs font-medium text-blue-800">
//                     Week-off salary will be added after 26th.
//                   </span>
//                 </div>
//               </div>
//             )}

//             <div className="p-3 mb-4 rounded-lg bg-gray-50">
//               <div className="flex items-center space-x-3">
//                 <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
//                   <span className="text-base font-semibold text-blue-800">
//                     {currentEmployee?.name?.charAt(0) || selectedEmployee.name?.charAt(0) || 'E'}
//                   </span>
//                 </div>
//                 <div>
//                   <h3 className="text-base font-semibold text-gray-800">
//                     {currentEmployee?.name || selectedEmployee.name}
//                   </h3>
//                   <p className="text-xs text-gray-600">ID: {selectedEmployee.employeeId}</p>
//                   <p className="text-xs text-gray-600">Month: {selectedEmployee.monthFormatted || formatMonthDisplay(selectedEmployee.month)}</p>
//                   <p className="text-xs text-gray-600">Days in Month: {selectedEmployee.monthDays || 30}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-3 mb-4">
//               <div className="p-2 bg-white border rounded-lg">
//                 <p className="text-xs text-gray-600">Present Days</p>
//                 <p className="text-base font-semibold text-green-600">{selectedEmployee.presentDays || 0}</p>
//               </div>
//               <div className="p-2 bg-white border rounded-lg">
//                 <p className="text-xs text-gray-600">Working Days</p>
//                 <p className="text-base font-semibold text-blue-600">{selectedEmployee.workingDays || 0}</p>
//               </div>
//               <div className="p-2 bg-white border rounded-lg">
//                 <p className="text-xs text-gray-600">Half Days</p>
//                 <p className="text-base font-semibold text-yellow-600">{selectedEmployee.halfDays || 0}</p>
//               </div>
//               <div className="p-2 bg-white border rounded-lg">
//                 <p className="text-xs text-gray-600">WeekOff Days</p>
//                 <p className="text-base font-semibold text-purple-600">{selectedEmployee.weekOffs || 0}</p>
//               </div>
//               <div className="p-2 bg-white border rounded-lg">
//                 <p className="text-xs text-gray-600">Total Leaves</p>
//                 <p className="text-base font-semibold text-orange-600">{selectedEmployee.totalLeaves || 0}</p>
//               </div>
//               <div className="p-2 bg-white border rounded-lg">
//                 <p className="text-xs text-gray-600">Daily Rate</p>
//                 <p className="text-base font-semibold text-blue-700">₹{calculateDailyRate(selectedEmployee)}/day</p>
//               </div>
//             </div>

//             <div className="p-3 mb-4 rounded-lg bg-blue-50">
//               <h3 className="mb-2 text-base font-semibold text-blue-800">Salary Information</h3>
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="p-2 bg-white border rounded-lg">
//                   <p className="text-xs text-gray-600">Monthly Salary</p>
//                   <p className="text-base font-semibold text-blue-700">₹{selectedEmployee.salaryPerMonth || 0}</p>
//                 </div>
//                 <div className="p-2 bg-white border rounded-lg">
//                   <p className="text-xs text-gray-600">Calculated Salary</p>
//                   <p className="text-base font-semibold text-green-600">₹{selectedEmployee.calculatedSalary || 0}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="p-3 mb-4 rounded-lg bg-gray-50">
//               <p className="text-xs text-gray-600">Approved Leaves</p>
//               <p className="text-sm font-semibold text-red-600">{getLeaveTypes(selectedEmployee)}</p>
//             </div>

//             <div className="flex justify-end pt-4 space-x-2 border-t border-gray-200">
//               <button
//                 onClick={() => downloadSalarySlip(selectedEmployee)}
//                 disabled={!selectedEmployee.canDownload}
//                 className={`px-4 py-2 text-sm transition duration-200 rounded-lg ${
//                   selectedEmployee.canDownload
//                     ? 'text-white bg-purple-500 hover:bg-purple-600'
//                     : 'text-gray-400 bg-gray-200 cursor-not-allowed'
//                 }`}
//               >
//                 {selectedEmployee.canDownload ? 'Download Slip' : 'Available from 30th'}
//               </button>
//               <button
//                 onClick={handleCloseModal}
//                 className="px-4 py-2 text-sm text-white transition duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
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