// import axios from "axios";
// import { useCallback, useEffect, useState } from "react";
// import logo from "../Images/Timely-Health-Logo.png";
// import { isEmployeeHidden } from "../utils/employeeStatus";

// const PayRoll = () => {
//   const [records, setRecords] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [showQuickViewModal, setShowQuickViewModal] = useState(false);
//   const [showAttendanceModal, setShowAttendanceModal] = useState(false);
//   const [employeeAttendanceDetails, setEmployeeAttendanceDetails] = useState([]);
//   const [employeeLeaves, setEmployeeLeaves] = useState({});
//   const [employeesMasterData, setEmployeesMasterData] = useState({});
//   const [editFormData, setEditFormData] = useState({});
//   const [extraWorkData, setExtraWorkData] = useState({
//     extraDays: 0,
//     extraHours: 0,
//     overtimeRate: 0,
//     bonus: 0,
//     deductions: 0,
//     reason: ""
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");
//   const [isLoadingMonth, setIsLoadingMonth] = useState(false);
//   const [monthDays, setMonthDays] = useState(30);
//   const [weekOffConfig, setWeekOffConfig] = useState({
//     weekOffDay: "",
//     weekOffType: "0+4",
//     manualDays: ""
//   });

//   const recordsPerPage = 10;

//   // API endpoints
//   const ATTENDANCE_SUMMARY_API_URL = "https://api.timelyhealth.in/attendancesummary/get";
//   const ATTENDANCE_DETAILS_API_URL = "https://api.timelyhealth.in/attendance/allattendance";
//   const LEAVES_API_URL = "https://api.timelyhealth.in/leaves/leaves?status=approved";
//   const EMPLOYEES_API_URL = "https://api.timelyhealth.in/employees/get-employees";

//   // Dynamic Salary API URL with month parameter
//   const getSalaryApiUrl = (month) => {
//     return month
//       ? `https://api.timelyhealth.in/attendancesummary/getsalaries?month=${month}`
//       : "https://api.timelyhealth.in/attendancesummary/getsalaries";
//   };

//   // Check if selected month is current month
//   const isCurrentMonth = (month) => {
//     if (!month) return true; // If no month selected, assume current month

//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth() + 1; // 1-12

//     const [year, monthNum] = month.split('-').map(Number);

//     return year === currentYear && monthNum === currentMonth;
//   };

//   // Check if month is in the past (historical month)
//   const isHistoricalMonth = (month) => {
//     if (!month) return false;

//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth() + 1;

//     const [year, monthNum] = month.split('-').map(Number);

//     // Check if month is before current month
//     if (year < currentYear) return true;
//     if (year === currentYear && monthNum < currentMonth) return true;

//     return false;
//   };

//   // Function to check if week-off should be included in salary calculation
//   // Only for CURRENT month, historical months always include week-off
//   const shouldIncludeWeekOffInSalary = (month) => {
//     // If historical month, always include week-off
//     if (isHistoricalMonth(month)) return true;

//     // For current month, check date
//     if (isCurrentMonth(month)) {
//       const today = new Date();
//       const currentDay = today.getDate();
//       return currentDay >= 26; // Only include week-off in salary after 26th for current month
//     }

//     // For future months or if month not specified, return true
//     return true;
//   };

//   // Function to check if payslip download is allowed
//   // Only restrict for CURRENT month, historical months always allowed
//   const isPayslipDownloadAllowed = (month) => {
//     // If historical month, always allow download
//     if (isHistoricalMonth(month)) return true;

//     // For current month, check date
//     if (isCurrentMonth(month)) {
//       const today = new Date();
//       const currentDay = today.getDate();
//       return currentDay >= 30; // Only allow download on or after 30th for current month
//     }

//     // For future months or if month not specified, return true
//     return true;
//   };

//   // Process leaves data
//   const processLeavesData = useCallback((leavesData) => {
//     const leavesMap = {};

//     leavesData.forEach(leave => {
//       const employeeId = leave.employeeId;
//       if (!employeeId) return;

//       if (!leavesMap[employeeId]) {
//         leavesMap[employeeId] = {
//           CL: 0,
//           EL: 0,
//           COFF: 0,
//           LOP: 0,
//           Other: 0,
//           leaveDetails: []
//         };
//       }

//       const leaveType = leave.leaveType || 'Other';
//       const duration = calculateLeaveDuration(leave.startDate, leave.endDate);

//       if (leavesMap[employeeId][leaveType] !== undefined) {
//         leavesMap[employeeId][leaveType] += duration;
//       } else {
//         leavesMap[employeeId].Other += duration;
//       }

//       // Store leave details for display
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
//     console.log("🍃 Processed leaves data:", Object.keys(leavesMap).length, "employees");
//   }, []);

//   const calculateLeaveDuration = (fromDate, toDate) => {
//     if (!fromDate) return 0;
//     const start = new Date(fromDate);
//     const end = toDate ? new Date(toDate) : new Date(fromDate);
//     const diffTime = Math.abs(end - start);
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
//     return diffDays;
//   };

//   // Fetch data with cleanup
//   const fetchData = useCallback(async (month = "") => {
//     let isMounted = true;

//     try {
//       setLoading(true);
//       setError("");
//       console.log("📥 Fetching payroll data for month:", month || "Current Month");

//       // Check if week-off should be included in salary based on month type
//       const includeWeekOffInSalary = shouldIncludeWeekOffInSalary(month);
//       const isHistorical = isHistoricalMonth(month);
//       const isCurrent = isCurrentMonth(month);

//       console.log(`📅 Month analysis: ${month || "current"} | Historical: ${isHistorical} | Current: ${isCurrent} | Include week-off: ${includeWeekOffInSalary}`);

//       // STEP 0 → Fetch Attendance Summary Data First (with month filter)
//       let summaryData = [];
//       let summaryQuery = "";
//       if (month) {
//         summaryQuery = `?month=${month}`;
//       }

//       try {
//         const summaryRes = await fetch(`${ATTENDANCE_SUMMARY_API_URL}${summaryQuery}`);
//         if (summaryRes.ok && isMounted) {
//           const json = await summaryRes.json();
//           summaryData = json.summary || [];
//           console.log(`📘 Summary API for ${month || "current month"}:`, summaryData.length, "records");
//         }
//       } catch (e) {
//         console.warn("⚠️ Summary API Error:", e.message);
//       }

//       // STEP 1 → Salary API (with month filter)
//       let salaryData = { success: false, salaries: [], monthDays: 30 };
//       try {
//         const salaryUrl = getSalaryApiUrl(month);
//         console.log("💰 Fetching salary from:", salaryUrl);
//         const salaryRes = await fetch(salaryUrl);
//         if (salaryRes.ok && isMounted) {
//           salaryData = await salaryRes.json();
//           console.log(`💰 Salary API for ${month || "current month"}:`, salaryData.salaries?.length || 0, "salaries");

//           // Set month days from backend
//           if (salaryData.monthDays && isMounted) {
//             setMonthDays(salaryData.monthDays);
//           }
//         }
//       } catch (err) {
//         console.warn("⚠️ Salary API error:", err.message);
//       }

//       // STEP 2 → Fetch employees + APPROVED LEAVES
//       const [employeesRes, leavesRes] = await Promise.all([
//         fetch(EMPLOYEES_API_URL).catch(() => ({ ok: false })),
//         fetch(LEAVES_API_URL).catch(() => ({ ok: false }))
//       ]);

//       let employeesData = employeesRes.ok ? await employeesRes.json() : [];
//       let leavesData = leavesRes.ok ? await leavesRes.json() : [];

//       console.log("✅ Approved Leaves from API:", leavesData.length);

//       // EMPLOYEES MAP
//       const employeesMap = {};

//       // ✅ Filter out inactive employees
//       const activeEmployees = employeesData.filter(emp => !isEmployeeHidden(emp));

//       activeEmployees.forEach(emp => {
//         employeesMap[emp.employeeId] = {
//           salaryPerMonth: emp.salaryPerMonth || 0,
//           shiftHours: emp.shiftHours || 8,
//           weekOffPerMonth: emp.weekOffPerMonth || 0,
//           name: emp.name,
//           employeeId: emp.employeeId,
//           department: emp.department || '',
//           designation: emp.role || emp.designation || '',
//           joiningDate: emp.joinDate || emp.joiningDate || '',
//           bankAccount: emp.bankAccount || '',
//           panCard: emp.panCard || '',
//           weekOffDay: emp.weekOffDay || '',
//           weekOffType: emp.weekOffType || '0+4'
//         };
//       });

//       if (isMounted) {
//         setEmployeesMasterData(employeesMap);
//       }

//       // === MERGE SALARY + SUMMARY DATA ===
//       let processedSalaries = [];

//       if (salaryData.success && salaryData.salaries.length > 0) {
//         processedSalaries = salaryData.salaries.map(emp => {
//           const summary = summaryData.find(x => x.employeeId === emp.employeeId) || {};

//           // Get actual week-off days (for display)
//           const actualWeekOffDays = summary.weekOffPerMonth ?? emp.weekOffs ?? 0;

//           // Calculate salary based on month type
//           let calculatedSalary = emp.calculatedSalary || 0;

//           // If it's current month and before 26th, remove week-off amount
//           if (!includeWeekOffInSalary && calculatedSalary > 0) {
//             // Calculate daily rate
//             const employeeData = employeesMap[emp.employeeId];
//             const daysInMonth = salaryData.monthDays || 30;
//             const dailyRate = employeeData?.salaryPerMonth / daysInMonth || 0;

//             // Remove week-off amount from salary if before 26th (current month only)
//             const weekOffAmount = actualWeekOffDays * dailyRate;
//             calculatedSalary = Math.max(0, calculatedSalary - weekOffAmount);
//           }

//           return {
//             ...emp,
//             // Summary data override
//             presentDays: summary.presentDays ?? emp.presentDays ?? 0,
//             workingDays: emp.totalWorkingDays || 0,
//             totalWorkingDays: emp.totalWorkingDays || 0,
//             halfDayWorking: summary.halfDayWorking ?? emp.halfDayWorking ?? 0,
//             fullDayNotWorking: summary.fullDayNotWorking ?? emp.fullDayNotWorking ?? 0,
//             onsiteDays: summary.onsiteDays ?? 0,
//             lateDays: summary.lateDays ?? 0,
//             fullDayLeaves: summary.fullDayLeaves ?? 0,
//             halfDayLeaves: summary.halfDayLeaves ?? 0,
//             weekOffs: actualWeekOffDays, // Show actual week-off days
//             month: salaryData.month || month || emp.month || "Not specified",
//             salaryPerDay: emp.salaryPerDay || 0,
//             calculatedSalary: calculatedSalary, // Adjusted salary
//             monthDays: salaryData.monthDays || 30,
//             includeWeekOffInSalary: includeWeekOffInSalary,
//             isHistoricalMonth: isHistorical,
//             isCurrentMonth: isCurrent
//           };
//         });
//       } else {
//         // Salary API fail → fallback to employees only
//         processedSalaries = activeEmployees.map(emp => {
//           const employeeData = employeesMap[emp.employeeId];
//           const actualWeekOffDays = emp.weekOffPerMonth || 0;
//           const daysInMonth = salaryData.monthDays || 30;
//           const dailyRate = employeeData?.salaryPerMonth / daysInMonth || 0;

//           // Calculate salary based on month type
//           let calculatedSalary = 0;
//           if (employeeData?.salaryPerMonth) {
//             const paidDays = (emp.totalWorkingDays || 0) + (emp.halfDayWorking || 0) * 0.5;

//             // Add week-off based on month type
//             const totalPaidDays = includeWeekOffInSalary ? paidDays + actualWeekOffDays : paidDays;
//             calculatedSalary = (totalPaidDays * dailyRate);
//           }

//           return {
//             employeeId: emp.employeeId,
//             name: emp.name,
//             presentDays: 0,
//             workingDays: 0,
//             totalWorkingDays: 0,
//             halfDayWorking: 0,
//             fullDayNotWorking: 0,
//             calculatedSalary: calculatedSalary,
//             salaryPerMonth: emp.salaryPerMonth || 0,
//             salaryPerDay: dailyRate,
//             weekOffs: actualWeekOffDays, // Show actual week-off days
//             totalLeaves: 0,
//             leaveTypes: {},
//             month: month || "No Month",
//             monthDays: salaryData.monthDays || 30,
//             includeWeekOffInSalary: includeWeekOffInSalary,
//             isHistoricalMonth: isHistorical,
//             isCurrentMonth: isCurrent
//           };
//         });
//       }

//       if (isMounted) {
//         setRecords(processedSalaries);
//         setFilteredRecords(processedSalaries);
//       }

//       if (leavesData.length > 0 && isMounted) {
//         processLeavesData(leavesData);
//       }

//     } catch (err) {
//       console.error("❌ ERROR:", err);
//       if (isMounted) {
//         setError(err.message);
//       }
//     } finally {
//       if (isMounted) {
//         setLoading(false);
//         setIsLoadingMonth(false);
//       }
//     }

//     return () => {
//       isMounted = false;
//     };
//   }, [processLeavesData]);

//   useEffect(() => {
//     const cleanup = fetchData();
//     return () => {
//       if (typeof cleanup === 'function') cleanup();
//     };
//   }, [fetchData]);

//   // Calculate salary using backend data
//   const calculateSalary = (employee) => {
//     return employee.calculatedSalary || 0;
//   };

//   // Calculate daily rate BASED ON ACTUAL MONTH DAYS
//   const calculateDailyRate = (employee) => {
//     const employeeData = employeesMasterData[employee.employeeId];
//     if (!employeeData || !employeeData.salaryPerMonth || employeeData.salaryPerMonth === 0) return 0;

//     const daysInMonth = employee.monthDays || monthDays || 30;
//     return (employeeData.salaryPerMonth / daysInMonth).toFixed(2);
//   };

//   // Get employee master data
//   const getEmployeeData = (employee) => {
//     return employeesMasterData[employee.employeeId] || {
//       salaryPerMonth: employee.salaryPerMonth || 0,
//       shiftHours: 8,
//       weekOffPerMonth: employee.weekOffs || 0,
//       name: employee.name || '',
//       designation: '',
//       department: '',
//       joiningDate: '',
//       bankAccount: '',
//       employeeId: employee.employeeId,
//       weekOffDay: '',
//       weekOffType: '0+4'
//     };
//   };

//   // Get actual week-off days for display
//   const getWeekOffDaysForDisplay = (employee) => {
//     return employee.weekOffs || 0;
//   };

//   // Get week-off days for salary calculation (conditional based on month)
//   const getWeekOffDaysForSalary = (employee) => {
//     return shouldIncludeWeekOffInSalary(employee.month || selectedMonth) ? (employee.weekOffs || 0) : 0;
//   };

//   const calculateHolidays = (employee) => {
//     return 0;
//   };

//   // Handle week off configuration
//   const handleWeekOffChange = async (employeeId, weekOffDay, weekOffType, manualDays = "") => {
//     if (!weekOffDay || !weekOffType) return;

//     try {
//       const requestBody = {
//         employeeId,
//         weekOffDay,
//         weekOffType
//       };

//       // If manual type and manual days provided
//       if (weekOffType === 'manual' && manualDays) {
//         requestBody.weekOffPerMonth = parseInt(manualDays);
//       }

//       const response = await fetch("https://api.timelyhealth.in/attendancesummary/updateWeekOffConfig", {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(requestBody)
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`HTTP ${response.status}: ${errorText}`);
//       }

//       const result = await response.json();

//       if (result.success) {
//         // Update local state
//         const updatedEmpData = {
//           ...employeesMasterData[employeeId],
//           weekOffDay,
//           weekOffPerMonth: result.config.weekOffPerMonth,
//           weekOffType: result.config.weekOffType
//         };

//         setEmployeesMasterData(prev => ({
//           ...prev,
//           [employeeId]: updatedEmpData
//         }));

//         console.log(`✅ Week off updated for ${employeeId}: ${weekOffDay}, type: ${weekOffType}`);

//         // Refresh data after update
//         setTimeout(() => {
//           fetchData(selectedMonth);
//           console.log("🔄 Refreshing data after week-off update");
//         }, 1000);

//       } else {
//         alert(`Error: ${result.message}`);
//       }
//     } catch (error) {
//       console.error('Error updating week off:', error);
//       alert('Failed to update week off');
//     }
//   };

//   // Handle attendance row click
//   const handleAttendanceRowClick = async (employee) => {
//     setSelectedEmployee(employee);
//     setShowAttendanceModal(true);
//     await fetchAttendanceDetails(employee.employeeId);
//   };

//   const fetchAttendanceDetails = async (employeeId) => {
//     try {
//       let url = ATTENDANCE_DETAILS_API_URL;
//       if (selectedMonth) {
//         url += `?month=${selectedMonth}&employeeId=${employeeId}`;
//       } else {
//         url += `?employeeId=${employeeId}`;
//       }

//       const response = await fetch(url);
//       const data = await response.json();

//       if (data.records && data.records.length > 0) {
//         const sortedRecords = data.records.sort((a, b) =>
//           new Date(b.checkInTime) - new Date(a.checkInTime)
//         );

//         setEmployeeAttendanceDetails(sortedRecords);
//       } else {
//         setEmployeeAttendanceDetails([]);
//       }
//     } catch (error) {
//       console.error("Error fetching attendance details:", error);
//       setEmployeeAttendanceDetails([]);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "-";
//     const date = new Date(dateString);
//     return date.toLocaleString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric"
//     });
//   };

//   // Filter records based on search
//   useEffect(() => {
//     const filtered = records.filter(record =>
//       record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       record.employeeId?.toString().includes(searchTerm)
//     );
//     setFilteredRecords(filtered);
//     setCurrentPage(1);
//   }, [searchTerm, records]);

//   // Pagination calculations
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

//   // Handle edit
//   const handleEdit = (employee) => {
//     setSelectedEmployee(employee);
//     const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
//     const weekOffDaysForSalary = getWeekOffDaysForSalary(employee);
//     const holidays = calculateHolidays(employee);

//     setEditFormData({
//       presentDays: employee.presentDays || 0,
//       workingDays: employee.totalWorkingDays || 0,
//       halfDayWorking: employee.halfDayWorking || 0,
//       fullDayNotWorking: employee.fullDayNotWorking || 0,
//       calculatedSalary: employee.calculatedSalary || 0,
//       weekOffDays: weekOffDaysForSalary,
//       holidays: holidays,
//       CL: leaves.CL,
//       EL: leaves.EL,
//       COFF: leaves.COFF,
//       LOP: leaves.LOP,
//       dailyRate: calculateDailyRate(employee)
//     });

//     setExtraWorkData({
//       extraDays: employee.extraWork?.extraDays || 0,
//       extraHours: employee.extraWork?.extraHours || 0,
//       overtimeRate: 0,
//       bonus: employee.extraWork?.bonus || 0,
//       deductions: employee.extraWork?.deductions || 0,
//       reason: employee.extraWork?.reason || ""
//     });

//     setShowEditModal(true);
//   };

//   // Handle edit submit
//   // Handle edit submit
// ... (cleaned up redundant code)
//       ...editFormData,
//       calculatedSalary: Math.round(finalSalary),
//       extraWork: {
//         extraDays: extraWorkData.extraDays || 0,
//         extraHours: extraWorkData.extraHours || 0,
//         overtimeRate: 0,
//         overtimeAmount: 0,
//         bonus: bonus,
//         deductions: deductions,
//         totalExtraAmount: totalExtraAmount,
//         reason: extraWorkData.reason || ""
//       }
//     };

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

//   // Handle view
//   const handleView = (employee) => {
//     setSelectedEmployee(employee);
//     setShowViewModal(true);
//   };

//   // Download invoice with smart restrictions
//   const downloadInvoice = async (employee) => {
//     // Get employee's month or use selected month
//     const employeeMonth = employee.month || selectedMonth;

//     // Check if payslip download is allowed for this month
//     const allowed = isPayslipDownloadAllowed(employeeMonth);

//     if (!allowed) {
//       alert("Payslip download for current month is only allowed on or after 30th.");
//       return;
//     }

//     const invoiceContent = generateInvoiceHTML(employee);
//     const printWindow = window.open('', '_blank');
//     if (printWindow) {
//       printWindow.document.write(invoiceContent);
//       printWindow.document.close();
//       printWindow.print();

//       // ✅ Log payslip download activity
//       try {
//         const adminName = localStorage.getItem("adminName") || "Admin";
//         const adminId = localStorage.getItem("adminId") || "admin";
//         const adminEmail = localStorage.getItem("adminEmail") || localStorage.getItem("employeeEmail") || "admin@system.com";

//         console.log("Logging payslip download:", {
//           adminName,
//           adminId,
//           adminEmail,
//           employee: employee.name
//         });

//         const response = await axios.post("https://api.timelyhealth.in/user-activity/log", {
//           userId: adminId,
//           userName: adminName,
//           userEmail: adminEmail,
//           userRole: "admin",
//           action: "payslip_download",
//           actionDetails: `Downloaded payslip for ${employee.name} (${employee.employeeId}) - ${formatMonthDisplay(employee.month || selectedMonth)}`,
//           metadata: {
//             employeeId: employee.employeeId,
//             employeeName: employee.name,
//             month: employee.month || selectedMonth,
//             salary: employee.calculatedSalary
//           }
//         });

//         console.log("✅ Payslip download logged successfully:", response.data);
//       } catch (error) {
//         console.error("❌ Failed to log payslip download:", error.response?.data || error.message);
//         // Don't block the download if logging fails
//       }
//     }
//   };

//   // Generate invoice HTML with DEDUCTION BREAKDOWN
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
//     const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };

//     // Week-off calculations
//     const actualWeekOffDays = getWeekOffDaysForDisplay(employee);
//     const weekOffDaysForSalary = getWeekOffDaysForSalary(employee);
//     const includeWeekOffInSalary = shouldIncludeWeekOffInSalary(employee.month || selectedMonth);
//     const isHistorical = isHistoricalMonth(employee.month || selectedMonth);
//     const isCurrent = isCurrentMonth(employee.month || selectedMonth);

//     // Paid component calculations
//     const presentDays = employee.presentDays || 0;
//     const halfDays = employee.halfDayWorking || 0;
//     const paidLeaveDays = (leaves.CL || 0) + (leaves.EL || 0) + (leaves.COFF || 0);

//     // Total Paid Days (use conditional week-off for salary)
//     const totalPaidDays = presentDays + (halfDays * 0.5) + weekOffDaysForSalary + paidLeaveDays;

//     // Deduction Calculations
//     // 1. Half Day Deduction (0.5 per half day)
//     const halfDayDeductionDays = halfDays * 0.5;
//     const halfDayDeductionAmount = halfDayDeductionDays * dailyRate;

//     // 2. LOP / Absent Deduction (Unaccounted days)
//     const totalUnpaidDays = Math.max(0, totalMonthDays - totalPaidDays);
//     const lopDays = Math.max(0, totalUnpaidDays - halfDayDeductionDays);
//     const lopAmount = lopDays * dailyRate;

//     // Earnings
//     const grossSalary = employeeData.salaryPerMonth || 0;
//     const bonus = employee.extraWork?.bonus || 0;
//     const extraDaysPay = (employee.extraWork?.extraDays || 0) * dailyRate;

//     // Other Deductions
//     const otherDeductions = employee.extraWork?.deductions || 0;

//     // Totals
//     const totalEarnings = grossSalary + bonus + extraDaysPay;
//     const totalDeductions = halfDayDeductionAmount + lopAmount + otherDeductions;
//     const netPay = totalEarnings - totalDeductions;

//     const hasExtraWork = employee.extraWork && (
//       (employee.extraWork.extraDays || 0) > 0 ||
//       (employee.extraWork.bonus || 0) > 0 ||
//       (employee.extraWork.deductions || 0) > 0
//     );

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

//           </table>

//           <div style="text-align: center; font-size: 10px; margin-top: 10px;">
//             This is a computer-generated document.
//           </div>

//         </div>
//       </body>
//       </html>
//     `;
//   };

//   // Get leave types for display
//   const getLeaveTypes = (employee) => {
//     if (employee.leaveTypes && Object.keys(employee.leaveTypes).length > 0) {
//       const leaveStrings = [];
//       Object.entries(employee.leaveTypes).forEach(([type, count]) => {
//         if (count > 0) {
//           leaveStrings.push(`${type.toUpperCase()}: ${count}`);
//         }
//       });
//       if (leaveStrings.length > 0) return leaveStrings.join(', ');
//     }

//     const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
//     const leaveStrings = [];

//     if (leaves.CL > 0) leaveStrings.push(`CL: ${leaves.CL}`);
//     if (leaves.EL > 0) leaveStrings.push(`EL: ${leaves.EL}`);
//     if (leaves.COFF > 0) leaveStrings.push(`COFF: ${leaves.COFF}`);
//     if (leaves.LOP > 0) leaveStrings.push(`LOP: ${leaves.LOP}`);
//     if (leaves.Other > 0) leaveStrings.push(`Other: ${leaves.Other}`);

//     return leaveStrings.length > 0 ? leaveStrings.join(', ') : 'No Leaves';
//   };

//   // Format month display
//   const formatMonthDisplay = (month) => {
//     if (!month) return "Current Month";
//     const [year, monthNum] = month.split('-');
//     const monthNames = [
//       'January', 'February', 'March', 'April', 'May', 'June',
//       'July', 'August', 'September', 'October', 'November', 'December'
//     ];
//     return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-lg font-semibold text-blue-600">Loading payroll data...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="p-4 text-red-600 bg-red-100 rounded-lg">
//           <p className="font-semibold">Error: {error}</p>
//           <button
//             onClick={() => fetchData(selectedMonth)}
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
//       <div className="mx-auto max-w-8xl">

//         {/* Search and Filter Section */}
//         <div className="px-4 py-2 mb-3 bg-white border rounded-lg shadow-sm">
//           <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

//             {/* Search */}
//             <div className="relative flex-1">
//               <input
//                 type="text"
//                 placeholder="Search by ID or Name"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full py-1.5 pl-8 pr-3 text-sm border rounded-md focus:ring-1 focus:ring-blue-400"
//               />
//               <svg
//                 className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-2 top-1/2"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//               </svg>
//             </div>

//             {/* Actions */}
//             <div className="flex items-center gap-2">
//               <input
//                 type="month"
//                 value={selectedMonth}
//                 onChange={(e) => {
//                   const monthValue = e.target.value;
//                   setSelectedMonth(monthValue);
//                   monthValue ? fetchData(monthValue) : fetchData();
//                 }}
//                 onFocus={(e) => e.target.click()}
//                 className="px-2 py-1.5 text-sm border rounded-md cursor-pointer"
//               />

//               <button
//                 onClick={() => {
//                   setSelectedMonth("");
//                   fetchData();
//                 }}
//                 className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 border rounded-md hover:bg-gray-200"
//               >
//                 Current
//               </button>



//               <button
//                 onClick={() => fetchData(selectedMonth)}
//                 disabled={isLoadingMonth}
//                 className="flex items-center px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
//               >
//                 {isLoadingMonth ? (
//                   <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9" />
//                   </svg>
//                 ) : (
//                   "Refresh"
//                 )}
//               </button>
//             </div>

//           </div>
//         </div>

//         {/* Stats Overview */}
//         <div className="grid grid-cols-2 gap-2 mb-3 md:grid-cols-4">

//           {/* Total Employees */}
//           <div className="px-3 py-2 bg-white border-l-2 border-blue-500 rounded-md shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-[10px] text-gray-500 leading-tight">
//                   Total Employees
//                 </p>
//                 <p className="text-sm font-semibold leading-tight text-gray-800">
//                   {filteredRecords.length}
//                 </p>
//               </div>
//               <div className="p-1.5 bg-blue-100 rounded-full">
//                 <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           {/* Total Salary */}
//           <div className="px-3 py-2 bg-white border-l-2 border-green-500 rounded-md shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-[10px] text-gray-500 leading-tight">
//                   Total Salary
//                 </p>
//                 <p className="text-sm font-semibold leading-tight text-gray-800">
//                   ₹{filteredRecords.reduce((s, e) => s + (e.calculatedSalary || 0), 0).toLocaleString()}
//                 </p>
//               </div>
//               <div className="p-1.5 bg-green-100 rounded-full">
//                 <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           {/* Active This Month */}
//           <div className="px-3 py-2 bg-white border-l-2 border-purple-500 rounded-md shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-[10px] text-gray-500 leading-tight">
//                   Active This Month
//                 </p>
//                 <p className="text-sm font-semibold leading-tight text-gray-800">
//                   {filteredRecords.filter(e => (e.totalWorkingDays || 0) > 0).length}
//                 </p>
//               </div>
//               <div className="p-1.5 bg-purple-100 rounded-full">
//                 <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           {/* On Leave */}
//           <div className="px-3 py-2 bg-white border-l-2 border-red-500 rounded-md shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-[10px] text-gray-500 leading-tight">
//                   On Leave
//                 </p>
//                 <p className="text-sm font-semibold leading-tight text-gray-800">
//                   {filteredRecords.filter(emp => {
//                     const leaves = employeeLeaves[emp.employeeId];
//                     return leaves && (leaves.CL + leaves.EL + leaves.COFF + leaves.LOP) > 0;
//                   }).length}
//                 </p>
//               </div>
//               <div className="p-1.5 bg-red-100 rounded-full">
//                 <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//         </div>

//         {/* Month Type Notice */}
//         <div className={`px-3 py-2 mb-3 rounded-md shadow-sm ${
//           isHistoricalMonth(selectedMonth) 
//             ? 'bg-green-50 border-l-2 border-green-500' 
//             : isCurrentMonth(selectedMonth)
//             ? (shouldIncludeWeekOffInSalary(selectedMonth) 
//                 ? 'bg-green-50 border-l-2 border-green-500' 
//                 : 'bg-yellow-50 border-l-2 border-yellow-500')
//             : 'bg-blue-50 border-l-2 border-blue-500'
//         }`}>
//           <div className="flex items-center">
//             <div className="mr-2">
//               {isHistoricalMonth(selectedMonth) ? (
//                 <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               ) : isCurrentMonth(selectedMonth) ? (
//                 shouldIncludeWeekOffInSalary(selectedMonth) ? (
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
//                 {isHistoricalMonth(selectedMonth) 
//                   ? "✓ Historical Month - Full salary with week-off included | Payslip download available" 
//                   : isCurrentMonth(selectedMonth)
//                   ? (shouldIncludeWeekOffInSalary(selectedMonth) 
//                       ? `✓ Current Month (After 26th) - Week-off included | ${isPayslipDownloadAllowed(selectedMonth) ? 'Payslip download available' : 'Payslip available after 30th'}`
//                       : `Current Month (Before 26th) - Week-off will be added after 26th | ${isPayslipDownloadAllowed(selectedMonth) ? 'Payslip download available' : 'Payslip available after 30th'}`)
//                   : "Future Month - Preview only"}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Payroll Table */}
//         <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="text-white bg-gradient-to-r from-blue-600 to-blue-800">
//                 <tr>
//                   <th className="p-3 text-xs font-semibold tracking-wider text-left uppercase">ID</th>
//                   <th className="p-3 text-xs font-semibold tracking-wider text-left uppercase">Name</th>
//                   <th className="p-3 text-xs font-semibold tracking-wider text-left uppercase">Working Days</th>
//                   <th className="p-3 text-xs font-semibold tracking-wider text-left uppercase">Present Days</th>
//                   <th className="p-3 text-xs font-semibold tracking-wider text-left uppercase">Half Days</th>
//                   <th className="p-3 text-xs font-semibold tracking-wider text-left uppercase">Week Offs</th>
//                   <th className="p-3 text-xs font-semibold tracking-wider text-left uppercase">Monthly Salary</th>
//                   <th className="p-3 text-xs font-semibold tracking-wider text-left uppercase">Calculated Salary</th>
//                   <th className="p-3 text-xs font-semibold tracking-wider text-left uppercase">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {currentRecords.map((item, index) => (
//                   <tr
//                     key={item.employeeId}
//                     className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
//                   >
//                     <td className="p-4 text-sm font-medium text-gray-900">{item.employeeId}</td>
//                     <td className="p-4">
//                       <div className="flex items-center">
//                         <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mr-3 bg-blue-100 rounded-full">
//                           <span className="text-sm font-medium text-blue-800">
//                             {item.name?.charAt(0) || 'E'}
//                           </span>
//                         </div>
//                         <div>
//                           <div className="font-medium text-gray-900">{item.name}</div>
//                           <div className="text-xs text-gray-500">{item.department || '-'}</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="p-4 text-center">
//                       <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded">
//                         {item.totalWorkingDays || 0}
//                       </span>
//                     </td>
//                     <td className="p-4 text-center">
//                       <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded">
//                         {item.presentDays || 0}
//                       </span>
//                     </td>
//                     <td className="p-4 text-center">
//                       <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded">
//                         {item.halfDayWorking || 0}
//                       </span>
//                     </td>
//                     <td className="p-4 text-center">
//                       <div className="flex flex-col items-center gap-1">
//                         {/* Week off display - SIMPLE SHOW */}
//                         <div className="flex items-center gap-2">
//                           <span className="px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded">
//                             {getWeekOffDaysForDisplay(item)} days
//                           </span>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="p-4 font-medium text-right text-gray-900">
//                       ₹{(item.salaryPerMonth || 0).toLocaleString()}
//                     </td>
//                     <td className="p-4 text-right">
//                       <div className="font-bold text-green-700">₹{calculateSalary(item).toLocaleString()}</div>
//                       <div className="text-xs text-gray-500">Daily: ₹{calculateDailyRate(item)}</div>
//                     </td>
//                     <td className="p-4">
//                       <div className="flex space-x-2">
//                         <button
//                           onClick={() => handleView(item)}
//                           className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition duration-150"
//                           title="View Details"
//                         >
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                           </svg>
//                         </button>
//                         <button
//                           onClick={() => handleEdit(item)}
//                           className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition duration-150"
//                           title="Edit Salary"
//                         >
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                           </svg>
//                         </button>
//                         <button
//                           onClick={() => downloadInvoice(item)}
//                           className={`p-1.5 rounded-md transition duration-150 ${isPayslipDownloadAllowed(item.month || selectedMonth) 
//                             ? 'text-purple-600 hover:bg-purple-50' 
//                             : 'text-gray-400 hover:bg-gray-100 cursor-not-allowed'}`}
//                           title={isPayslipDownloadAllowed(item.month || selectedMonth) 
//                             ? "Download Payslip" 
//                             : item.isHistoricalMonth 
//                             ? "Download Payslip (Historical Month)" 
//                             : "Payslip download available only on or after 30th for current month"}
//                           disabled={!isPayslipDownloadAllowed(item.month || selectedMonth)}
//                         >
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                           </svg>
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {filteredRecords.length > 0 && (
//             <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 sm:px-6">
//               <div className="flex justify-between flex-1 sm:hidden">
//                 <button
//                   onClick={handlePrevious}
//                   disabled={currentPage === 1}
//                   className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${currentPage === 1
//                     ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                     : 'bg-white text-gray-700 hover:bg-gray-50'
//                     }`}
//                 >
//                   Previous
//                 </button>
//                 <button
//                   onClick={handleNext}
//                   disabled={currentPage === totalPages}
//                   className={`ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${currentPage === totalPages
//                     ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                     : 'bg-white text-gray-700 hover:bg-gray-50'
//                     }`}
//                 >
//                   Next
//                 </button>
//               </div>
//               <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
//                 <div>
//                   <p className="text-sm text-gray-700">
//                     Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{' '}
//                     <span className="font-medium">
//                       {Math.min(indexOfLastRecord, filteredRecords.length)}
//                     </span>{' '}
//                     of <span className="font-medium">{filteredRecords.length}</span> employees
//                   </p>
//                 </div>
//                 <div>
//                   <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
//                     <button
//                       onClick={handlePrevious}
//                       disabled={currentPage === 1}
//                       className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${currentPage === 1
//                         ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                         : 'bg-white text-gray-500 hover:bg-gray-50'
//                         }`}
//                     >
//                       <span className="sr-only">Previous</span>
//                       <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
//                         <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
//                       </svg>
//                     </button>
//                     {getPageNumbers().map((pageNumber) => (
//                       <button
//                         key={pageNumber}
//                         onClick={() => handlePageClick(pageNumber)}
//                         className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNumber
//                           ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
//                           : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
//                           }`}
//                       >
//                         {pageNumber}
//                       </button>
//                     ))}
//                     <button
//                       onClick={handleNext}
//                       disabled={currentPage === totalPages}
//                       className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${currentPage === totalPages
//                         ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                         : 'bg-white text-gray-500 hover:bg-gray-50'
//                         }`}
//                     >
//                       <span className="sr-only">Next</span>
//                       <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
//                         <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
//                       </svg>
//                     </button>
//                   </nav>
//                 </div>
//               </div>
//             </div>
//           )}

//           {filteredRecords.length === 0 && !loading && (
//             <div className="py-12 text-center">
//               <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//               <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
//               <p className="mt-1 text-sm text-gray-500">
//                 {searchTerm ? 'Try a different search term' : 'No payroll data available for the selected month'}
//               </p>
//             </div>
//           )}
//         </div>

//       </div>

//       {/* View Modal */}
//       {showViewModal && selectedEmployee && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto">
//             <div className="sticky top-0 z-10 flex items-center justify-between mb-4 bg-white">
//               <h2 className="text-xl font-bold text-gray-800">Employee Details</h2>
//               <button
//                 onClick={() => setShowViewModal(false)}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>

//             <div className="p-4 mb-4 rounded-lg bg-gray-50">
//               <div className="flex items-center space-x-4">
//                 <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
//                   <span className="text-lg font-semibold text-blue-800">
//                     {selectedEmployee.name?.charAt(0) || 'E'}
//                   </span>
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-800">{selectedEmployee.name}</h3>
//                   <p className="text-sm text-gray-600">ID: {selectedEmployee.employeeId}</p>
//                   <p className="text-sm text-gray-600">Month: {selectedEmployee.month || selectedMonth || "Current"} ({selectedEmployee.monthDays || monthDays} days)</p>
//                   <p className={`text-sm ${selectedEmployee.isHistoricalMonth ? 'text-green-600' : selectedEmployee.isCurrentMonth ? 'text-blue-600' : 'text-gray-600'}`}>
//                     {selectedEmployee.isHistoricalMonth 
//                       ? 'Historical Month - Full salary with week-off' 
//                       : selectedEmployee.isCurrentMonth 
//                       ? `Current Month - ${shouldIncludeWeekOffInSalary(selectedEmployee.month || selectedMonth) ? 'Week-off included (After 26th)' : 'Week-off will be added after 26th'}` 
//                       : 'Future Month'}
//                   </p>
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
//                 <p className="text-lg font-semibold text-blue-600">{selectedEmployee.totalWorkingDays || 0}</p>
//               </div>
//               <div className="p-3 bg-white border rounded-lg">
//                 <p className="text-sm text-gray-600">Half Days</p>
//                 <p className="text-lg font-semibold text-yellow-600">{selectedEmployee.halfDayWorking || 0}</p>
//               </div>
//               <div className="p-3 bg-white border rounded-lg">
//                 <p className="text-sm text-gray-600">WeekOff Days</p>
//                 <p className="text-lg font-semibold text-purple-600">{getWeekOffDaysForDisplay(selectedEmployee)}</p>
//               </div>
//               <div className="p-3 bg-white border rounded-lg">
//                 <p className="text-sm text-gray-600">Month Days</p>
//                 <p className="text-lg font-semibold text-gray-800">{selectedEmployee.monthDays || monthDays}</p>
//               </div>
//               <div className="p-3 bg-white border rounded-lg">
//                 <p className="text-sm text-gray-600">Monthly Salary</p>
//                 <p className="text-lg font-semibold text-blue-600">₹{getEmployeeData(selectedEmployee).salaryPerMonth || 0}</p>
//               </div>
//               <div className="p-3 bg-white border rounded-lg">
//                 <p className="text-sm text-gray-600">Daily Rate</p>
//                 <p className="text-lg font-semibold text-gray-800">₹{calculateDailyRate(selectedEmployee)}/day</p>
//               </div>
//               <div className="p-3 bg-white border rounded-lg">
//                 <p className="text-sm text-gray-600">Calculated Salary</p>
//                 <p className="text-lg font-semibold text-green-600">₹{calculateSalary(selectedEmployee)}</p>
//               </div>
//               <div className="col-span-2 p-3 bg-white border rounded-lg">
//                 <p className="text-sm text-gray-600">Approved Leaves</p>
//                 <p className="font-semibold text-red-600 text">{getLeaveTypes(selectedEmployee)}</p>
//               </div>
//             </div>

//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={() => downloadInvoice(selectedEmployee)}
//                 disabled={!isPayslipDownloadAllowed(selectedEmployee.month || selectedMonth)}
//                 className={`px-6 py-2 rounded-lg transition duration-200 ${isPayslipDownloadAllowed(selectedEmployee.month || selectedMonth) 
//                   ? 'bg-purple-500 text-white hover:bg-purple-600' 
//                   : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
//               >
//                 Download Payslip
//               </button>
//               <button
//                 onClick={() => setShowViewModal(false)}
//                 className="px-6 py-2 text-white transition duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit Modal */}
//       {showEditModal && selectedEmployee && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold text-gray-800">Edit Salary Details - {selectedEmployee.name}</h2>
//               <button
//                 onClick={() => setShowEditModal(false)}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>

//             <div className="p-3 mb-4 rounded-lg bg-blue-50">
//               <p className="text-sm text-blue-700">
//                 <strong>Month:</strong> {selectedEmployee.month || selectedMonth || "Current Month"} |
//                 <strong> Days in Month:</strong> {selectedEmployee.monthDays || monthDays} |
//                 <strong> Monthly Salary:</strong> ₹{getEmployeeData(selectedEmployee).salaryPerMonth || 0} |
//                 <strong> Type:</strong> {selectedEmployee.isHistoricalMonth ? 'Historical Month' : selectedEmployee.isCurrentMonth ? 'Current Month' : 'Future Month'}
//               </p>
//             </div>

//             <form onSubmit={handleEditSubmit}>
//               <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
//                 <div>
//                   <label className="block mb-1 text-sm font-medium text-gray-700">Present Days</label>
//                   <input
//                     type="number"
//                     name="presentDays"
//                     value={editFormData.presentDays || 0}
//                     onChange={handleInputChange}
//                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     min="0"
//                     max={selectedEmployee.monthDays || monthDays}
//                   />
//                 </div>
//                 <div>
//                   <label className="block mb-1 text-sm font-medium text-gray-700">Working Days</label>
//                   <input
//                     type="number"
//                     name="workingDays"
//                     value={editFormData.workingDays || 0}
//                     onChange={handleInputChange}
//                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     min="0"
//                     max={selectedEmployee.monthDays || monthDays}
//                   />
//                 </div>
//                 <div>
//                   <label className="block mb-1 text-sm font-medium text-gray-700">Half Days</label>
//                   <input
//                     type="number"
//                     name="halfDayWorking"
//                     value={editFormData.halfDayWorking || 0}
//                     onChange={handleInputChange}
//                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     min="0"
//                   />
//                 </div>
//                 <div>
//                   <label className="block mb-1 text-sm font-medium text-gray-700">Full Day Leaves</label>
//                   <input
//                     type="number"
//                     name="fullDayNotWorking"
//                     value={editFormData.fullDayNotWorking || 0}
//                     onChange={handleInputChange}
//                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     min="0"
//                   />
//                 </div>
//                 <div>
//                   <label className="block mb-1 text-sm font-medium text-gray-700">Daily Rate (₹)</label>
//                   <input
//                     type="text"
//                     value={editFormData.dailyRate || calculateDailyRate(selectedEmployee)}
//                     className="w-full p-3 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg"
//                     readOnly
//                   />
//                 </div>
//                 <div>
//                   <label className="block mb-1 text-sm font-medium text-gray-700">Week-off Days</label>
//                   <input
//                     type="number"
//                     name="weekOffDays"
//                     value={getWeekOffDaysForDisplay(selectedEmployee)}
//                     className="w-full p-3 text-gray-600 border border-gray-300 rounded-lg bg-gray-50"
//                     readOnly
//                   />
//                 </div>
//                 <div>
//                   <label className="block mb-1 text-sm font-medium text-gray-700">Calculated Salary (₹)</label>
//                   <input
//                     type="number"
//                     name="calculatedSalary"
//                     value={editFormData.calculatedSalary || 0}
//                     onChange={handleInputChange}
//                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
//                     min="0"
//                     readOnly
//                   />
//                 </div>
//               </div>

//               <div className="mb-6">
//                 <h3 className="mb-3 text-lg font-semibold text-gray-800">Extra Work & Adjustments</h3>
//                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                   <div>
//                     <label className="block mb-1 text-sm font-medium text-gray-700">Extra Days</label>
//                     <input
//                       type="number"
//                       name="extraDays"
//                       value={extraWorkData.extraDays || 0}
//                       onChange={handleExtraWorkChange}
//                       className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       min="0"
//                     />
//                   </div>
//                   <div>
//                     <label className="block mb-1 text-sm font-medium text-gray-700">Bonus (₹)</label>
//                     <input
//                       type="number"
//                       name="bonus"
//                       value={extraWorkData.bonus || 0}
//                       onChange={handleExtraWorkChange}
//                       className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       min="0"
//                     />
//                   </div>
//                   <div>
//                     <label className="block mb-1 text-sm font-medium text-gray-700">Deductions (₹)</label>
//                     <input
//                       type="number"
//                       name="deductions"
//                       value={extraWorkData.deductions || 0}
//                       onChange={handleExtraWorkChange}
//                       className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       min="0"
//                     />
//                   </div>
//                   <div className="md:col-span-2">
//                     <label className="block mb-1 text-sm font-medium text-gray-700">Reason</label>
//                     <input
//                       type="text"
//                       name="reason"
//                       value={extraWorkData.reason || ""}
//                       onChange={handleExtraWorkChange}
//                       className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Enter reason for adjustments..."
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-end pt-4 space-x-3 border-t border-gray-200">
//                 <button
//                   type="button"
//                   onClick={() => setShowEditModal(false)}
//                   className="px-6 py-3 text-gray-700 transition duration-200 border border-gray-300 rounded-lg hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-6 py-3 text-white transition duration-200 bg-green-500 rounded-lg hover:bg-green-600"
//                 >
//                   Save Changes
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// };

// export default PayRoll;

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import logo from "../Images/Timely-Health-Logo.png";
import { isEmployeeHidden } from "../utils/employeeStatus";

const PayRoll = () => {
  const [records, setRecords] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]); // ✅ Add this
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const [monthDays, setMonthDays] = useState(30);
  const [weekOffConfig, setWeekOffConfig] = useState({
    weekOffDay: "",
    weekOffType: "0+4",
    manualDays: ""
  });

  // Template State
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateConfig, setTemplateConfig] = useState({
    companyName: "Timely Health Tech Pvt Ltd",
    address: "H. No: 1-98/9/25/p, # 301, 3rd Floor, Sri Sai Balaji Avenue,\nArunodaya Colony, Madhapur, Hyderabad, TG - 500081",
    logo: logo
  });

  useEffect(() => {
    const savedTemplate = localStorage.getItem("payrollTemplateConfig");
    if (savedTemplate) {
      setTemplateConfig(JSON.parse(savedTemplate));
    }
  }, []);

  const handleTemplateSave = () => {
    localStorage.setItem("payrollTemplateConfig", JSON.stringify(templateConfig));
    setShowTemplateModal(false);
    alert("✅ Template settings saved successfully!");
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTemplateConfig(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const recordsPerPage = 10;

  // API endpoints
  const ATTENDANCE_SUMMARY_API_URL = `${API_BASE_URL}/attendancesummary/get`;
  const ATTENDANCE_DETAILS_API_URL = `${API_BASE_URL}/attendance/allattendance`;
  const LEAVES_API_URL = `${API_BASE_URL}/leaves/leaves?status=approved`;
  const EMPLOYEES_API_URL = `${API_BASE_URL}/employees/get-employees`;

 const UPDATE_PAYROLL_API_URL = `${API_BASE_URL}/attendancesummary/updatePayroll`;


  // Dynamic Salary API URL with month parameter
  const getSalaryApiUrl = (month) => {
    return month
      ? `${API_BASE_URL}/attendancesummary/getsalaries?month=${month}`
      : `${API_BASE_URL}/attendancesummary/getsalaries`;
  };

  // Check if selected month is current month
  const isCurrentMonth = (month) => {
    if (!month) return true;

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    const [year, monthNum] = month.split('-').map(Number);

    return year === currentYear && monthNum === currentMonth;
  };

  // Check if month is in the past (historical month)
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

  // Function to check if week-off should be included in salary calculation
  const shouldIncludeWeekOffInSalary = (month) => {
    if (isHistoricalMonth(month)) return true;

    if (isCurrentMonth(month)) {
      const today = new Date();
      const currentDay = today.getDate();
      return currentDay >= 26;
    }

    return true;
  };

  // Function to check if payslip download is allowed
  const isPayslipDownloadAllowed = (month) => {
    if (isHistoricalMonth(month)) return true;

    if (isCurrentMonth(month)) {
      const today = new Date();
      const currentDay = today.getDate();
      return currentDay >= 30;
    }

    return true;
  };

  // Process leaves data - ONLY FOR SELECTED MONTH
  const processLeavesData = useCallback((leavesData, selectedMonth) => {
    const leavesMap = {};
    const [year, monthNum] = (selectedMonth || new Date().toISOString().slice(0, 7)).split('-').map(Number);
    const startOfMonth = new Date(year, monthNum - 1, 1);
    const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);

    leavesData.forEach(leave => {
      const employeeId = leave.employeeId;
      if (!employeeId) return;

      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);

      // Check if leave overlaps with selected month
      const overlapStart = new Date(Math.max(leaveStart, startOfMonth));
      const overlapEnd = new Date(Math.min(leaveEnd, endOfMonth));

      if (overlapStart <= overlapEnd) {
        if (!leavesMap[employeeId]) {
          leavesMap[employeeId] = {
            CL: 0,
            EL: 0,
            COFF: 0,
            LOP: 0,
            Other: 0,
            leaveDetails: []
          };
        }

        const leaveType = leave.leaveType || 'Other';
        const diffTime = Math.abs(overlapEnd - overlapStart);
        const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (leavesMap[employeeId][leaveType] !== undefined) {
          leavesMap[employeeId][leaveType] += duration;
        } else if (["Casual Leave", "Earned Leave", "Comp Off"].includes(leaveType)) {
          // Map long names to codes if necessary
          const typeMap = { "Casual Leave": "CL", "Earned Leave": "EL", "Comp Off": "COFF" };
          leavesMap[employeeId][typeMap[leaveType]] += duration;
        } else {
          leavesMap[employeeId].Other += duration;
        }

        leavesMap[employeeId].leaveDetails.push({
          type: leaveType,
          startDate: leave.startDate,
          endDate: leave.endDate,
          days: duration, // Days in THIS month
          reason: leave.reason || '',
          status: leave.status || 'pending'
        });
      }
    });

    setEmployeeLeaves(leavesMap);
    console.log("🍃 Processed leaves for month:", selectedMonth, Object.keys(leavesMap).length, "employees");
  }, []);

  const calculateLeaveDuration = (fromDate, toDate) => {
    if (!fromDate) return 0;
    const start = new Date(fromDate);
    const end = toDate ? new Date(toDate) : new Date(fromDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // ✅ HELPER: Get correct days in month
  const getDaysInMonth = (monthStr) => {
    if (!monthStr) return new Date().getDate(); // Default to today if no month
    const [year, month] = monthStr.split('-');
    return new Date(year, month, 0).getDate();
  };

  // ✅ Add this function to filter inactive employees from payroll data
  const filterInactiveEmployees = useCallback((payrollData, employeesMap) => {
    if (!Array.isArray(payrollData)) return [];

    return payrollData.filter(item => {
      // Get employee data from master map
      const employeeData = employeesMap[item.employeeId];
      if (!employeeData) return false;

      // Check if employee is active
      return !isEmployeeHidden(employeeData);
    });
  }, []);

  // Fetch data with cleanup
  const fetchData = useCallback(async (month = "") => {
    let isMounted = true;

    try {
      setLoading(true);
      setError("");
      console.log("📥 Fetching payroll data for month:", month || "Current Month");

      const includeWeekOffInSalary = shouldIncludeWeekOffInSalary(month);
      const isHistorical = isHistoricalMonth(month);
      const isCurrent = isCurrentMonth(month);

      console.log(`📅 Month analysis: ${month || "current"} | Historical: ${isHistorical} | Current: ${isCurrent} | Include week-off: ${includeWeekOffInSalary}`);

      // STEP 0 → Fetch Attendance Summary Data First (with month filter)
      let summaryData = [];
      let summaryQuery = "";
      if (month) {
        summaryQuery = `?month=${month}`;
      }

      try {
        const summaryRes = await fetch(`${ATTENDANCE_SUMMARY_API_URL}${summaryQuery}`);
        if (summaryRes.ok && isMounted) {
          const json = await summaryRes.json();
          summaryData = json.summary || [];
          console.log(`📘 Summary API for ${month || "current month"}:`, summaryData.length, "records");
        }
      } catch (e) {
        console.warn("⚠️ Summary API Error:", e.message);
      }

      // STEP 1 → Salary API (with month filter)
      let salaryData = { success: false, salaries: [], monthDays: 30 };
      try {
        const salaryUrl = getSalaryApiUrl(month);
        console.log("💰 Fetching salary from:", salaryUrl);
        const salaryRes = await fetch(salaryUrl);
        if (salaryRes.ok && isMounted) {
          salaryData = await salaryRes.json();
          console.log(`💰 Salary API for ${month || "current month"}:`, salaryData.salaries?.length || 0, "salaries");

          // ✅ SET MONTH DAYS FROM API OR CALCULATE
          const apiMonthDays = salaryData.monthDays || getDaysInMonth(month || "");
          if (isMounted) {
            setMonthDays(apiMonthDays);
            console.log(`📅 Month Days set to: ${apiMonthDays}`);
          }
        }
      } catch (err) {
        console.warn("⚠️ Salary API error:", err.message);
      }

      // STEP 2 → Fetch employees + APPROVED LEAVES
      const [employeesRes, leavesRes] = await Promise.all([
        fetch(EMPLOYEES_API_URL).catch(() => ({ ok: false })),
        fetch(LEAVES_API_URL).catch(() => ({ ok: false }))
      ]);

      let employeesData = employeesRes.ok ? await employeesRes.json() : [];
      let leavesData = leavesRes.ok ? await leavesRes.json() : [];

      console.log("✅ Approved Leaves from API:", leavesData.length);

      // EMPLOYEES MAP
      const employeesMap = {};

      // ✅ Store all employees
      if (isMounted) {
        setAllEmployees(employeesData);
      }

      // ✅ Filter out inactive employees for display
      const activeEmployees = employeesData.filter(emp => !isEmployeeHidden(emp));

      activeEmployees.forEach(emp => {
        employeesMap[emp.employeeId] = {
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
          weekOffType: emp.weekOffType || '0+4',
          status: emp.status || 'active' // ✅ Add status
        };
      });

      if (isMounted) {
        setEmployeesMasterData(employeesMap);
      }

      // === MERGE SALARY + SUMMARY DATA ===
      let processedSalaries = [];

      if (salaryData.success && salaryData.salaries.length > 0) {
        processedSalaries = salaryData.salaries.map(emp => {
          const summary = summaryData.find(x => x.employeeId === emp.employeeId) || {};

          const actualWeekOffDays = summary.weekOffPerMonth ?? emp.weekOffs ?? 0;

          let calculatedSalary = emp.calculatedSalary || 0;

          if (!includeWeekOffInSalary && calculatedSalary > 0) {
            const employeeData = employeesMap[emp.employeeId];
            const daysInMonth = salaryData.monthDays || 30;
            const dailyRate = employeeData?.salaryPerMonth / daysInMonth || 0;

            const weekOffAmount = actualWeekOffDays * dailyRate;
            calculatedSalary = Math.max(0, calculatedSalary - weekOffAmount);
          }

          return {
            ...emp,
            presentDays: summary.presentDays ?? emp.presentDays ?? 0,
            workingDays: emp.totalWorkingDays || 0,
            totalWorkingDays: emp.totalWorkingDays || 0,
            halfDayWorking: summary.halfDayWorking ?? emp.halfDayWorking ?? 0,
            fullDayNotWorking: summary.fullDayNotWorking ?? emp.fullDayNotWorking ?? 0,
            onsiteDays: summary.onsiteDays ?? 0,
            lateDays: summary.lateDays ?? 0,
            fullDayLeaves: summary.fullDayLeaves ?? 0,
            halfDayLeaves: summary.halfDayLeaves ?? 0,
            weekOffs: actualWeekOffDays,
            month: salaryData.month || month || emp.month || "Not specified",
            salaryPerDay: emp.salaryPerDay || 0,
            calculatedSalary: calculatedSalary,
            monthDays: salaryData.monthDays || getDaysInMonth(month || ""),
            includeWeekOffInSalary: includeWeekOffInSalary,
            isHistoricalMonth: isHistorical,
            isCurrentMonth: isCurrent
          };
        });
      } else {
        // Salary API fail → fallback to employees only
        processedSalaries = activeEmployees.map(emp => {
          const employeeData = employeesMap[emp.employeeId];
          const actualWeekOffDays = emp.weekOffPerMonth || 0;
          const daysInMonth = salaryData.monthDays || getDaysInMonth(month || "");
          const dailyRate = employeeData?.salaryPerMonth / daysInMonth || 0;

          let calculatedSalary = 0;
          if (employeeData?.salaryPerMonth) {
            const paidDays = (emp.totalWorkingDays || 0) + (emp.halfDayWorking || 0) * 0.5;

            const totalPaidDays = includeWeekOffInSalary ? paidDays + actualWeekOffDays : paidDays;
            calculatedSalary = (totalPaidDays * dailyRate);
          }

          return {
            employeeId: emp.employeeId,
            name: emp.name,
            presentDays: 0,
            workingDays: 0,
            totalWorkingDays: 0,
            halfDayWorking: 0,
            fullDayNotWorking: 0,
            calculatedSalary: calculatedSalary,
            salaryPerMonth: emp.salaryPerMonth || 0,
            salaryPerDay: dailyRate,
            weekOffs: actualWeekOffDays,
            totalLeaves: 0,
            leaveTypes: {},
            month: month || "No Month",
            monthDays: salaryData.monthDays || getDaysInMonth(month || ""),
            includeWeekOffInSalary: includeWeekOffInSalary,
            isHistoricalMonth: isHistorical,
            isCurrentMonth: isCurrent,
            status: emp.status || 'active' // ✅ Add status
          };
        });
      }

      // ✅ Filter out inactive employees from processed salaries
      const activeProcessedSalaries = filterInactiveEmployees(processedSalaries, employeesMap);

      if (isMounted) {
        setRecords(activeProcessedSalaries);
        setFilteredRecords(activeProcessedSalaries);
      }

      if (leavesData.length > 0 && isMounted) {
        processLeavesData(leavesData, month);
      }

    } catch (err) {
      console.error("❌ ERROR:", err);
      if (isMounted) {
        setError(err.message);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
        setIsLoadingMonth(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [processLeavesData, filterInactiveEmployees]);

  useEffect(() => {
    const cleanup = fetchData();
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [fetchData]);

  // Calculate salary using backend data
  const calculateSalary = (employee) => {
    return employee.calculatedSalary || 0;
  };

  // Calculate daily rate BASED ON ACTUAL MONTH DAYS
  const calculateDailyRate = (employee) => {
    const employeeData = employeesMasterData[employee.employeeId];
    if (!employeeData || !employeeData.salaryPerMonth || employeeData.salaryPerMonth === 0) return 0;

    // ✅ USE CORRECT MONTH DAYS
    const daysInMonth = employee.monthDays || monthDays || getDaysInMonth(employee.month || selectedMonth);
    return (employeeData.salaryPerMonth / daysInMonth).toFixed(2);
  };

  // Get employee master data
  const getEmployeeData = (employee) => {
    return employeesMasterData[employee.employeeId] || {
      salaryPerMonth: employee.salaryPerMonth || 0,
      shiftHours: 8,
      weekOffPerMonth: employee.weekOffs || 0,
      name: employee.name || '',
      designation: '',
      department: '',
      joiningDate: '',
      bankAccount: '',
      employeeId: employee.employeeId,
      weekOffDay: '',
      weekOffType: '0+4',
      status: employee.status || 'active'
    };
  };

  // Get actual week-off days for display
  const getWeekOffDaysForDisplay = (employee) => {
    return employee.weekOffs || 0;
  };

  // Get week-off days for salary calculation (conditional based on month)
  const getWeekOffDaysForSalary = (employee) => {
    return shouldIncludeWeekOffInSalary(employee.month || selectedMonth) ? (employee.weekOffs || 0) : 0;
  };

  const calculateHolidays = (employee) => {
    return 0;
  };

  // Handle week off configuration
  const handleWeekOffChange = async (employeeId, weekOffDay, weekOffType, manualDays = "") => {
    if (!weekOffDay || !weekOffType) return;

    try {
      const requestBody = {
        employeeId,
        weekOffDay,
        weekOffType
      };

      if (weekOffType === 'manual' && manualDays) {
        requestBody.weekOffPerMonth = parseInt(manualDays);
      }

<<<<<<< HEAD
      const response = await fetch("https://api.timelyhealth.in/api/attendancesummary/updateWeekOffConfig", {
=======
      const response = await fetch("https://api.timelyhealth.in/attendancesummary/updateWeekOffConfig", {
>>>>>>> e788108b888e65a50407f76a377ae5f784139482
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        const updatedEmpData = {
          ...employeesMasterData[employeeId],
          weekOffDay,
          weekOffPerMonth: result.config.weekOffPerMonth,
          weekOffType: result.config.weekOffType
        };

        setEmployeesMasterData(prev => ({
          ...prev,
          [employeeId]: updatedEmpData
        }));

        console.log(`✅ Week off updated for ${employeeId}: ${weekOffDay}, type: ${weekOffType}`);

        setTimeout(() => {
          fetchData(selectedMonth);
          console.log("🔄 Refreshing data after week-off update");
        }, 1000);

      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error updating week off:', error);
      alert('Failed to update week off');
    }
  };

  // Handle attendance row click
  const handleAttendanceRowClick = async (employee) => {
    setSelectedEmployee(employee);
    setShowAttendanceModal(true);
    await fetchAttendanceDetails(employee.employeeId);
  };

  const fetchAttendanceDetails = async (employeeId) => {
    try {
      let url = ATTENDANCE_DETAILS_API_URL;
      if (selectedMonth) {
        url += `?month=${selectedMonth}&employeeId=${employeeId}`;
      } else {
        url += `?employeeId=${employeeId}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.records && data.records.length > 0) {
        const sortedRecords = data.records.sort((a, b) =>
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

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // Filter records based on search
  useEffect(() => {
    const filtered = records.filter(record =>
      record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeId?.toString().includes(searchTerm)
    );
    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchTerm, records]);

  // ✅ Add this function to filter out inactive employees
  const filterInactiveFromList = (list) => {
    return list.filter(item => {
      const employeeData = employeesMasterData[item.employeeId];
      return !isEmployeeHidden(employeeData);
    });
  };

  // Pagination calculations
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

  // Handle edit
  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const weekOffDaysForSalary = getWeekOffDaysForSalary(employee);
    const holidays = calculateHolidays(employee);

    setEditFormData({
      presentDays: employee.presentDays || 0,
      workingDays: employee.totalWorkingDays || 0,
      halfDayWorking: employee.halfDayWorking || 0,
      fullDayNotWorking: employee.fullDayNotWorking || 0,
      calculatedSalary: employee.calculatedSalary || 0,
      weekOffDays: weekOffDaysForSalary,
      holidays: holidays,
      CL: leaves.CL,
      EL: leaves.EL,
      COFF: leaves.COFF,
      LOP: leaves.LOP,
      dailyRate: calculateDailyRate(employee)
    });

    setExtraWorkData({
      extraDays: employee.extraWork?.extraDays || 0,
      extraHours: employee.extraWork?.extraHours || 0,
      overtimeRate: 0,
      bonus: employee.extraWork?.bonus || 0,
      deductions: employee.extraWork?.deductions || 0,
      reason: employee.extraWork?.reason || ""
    });

    setShowEditModal(true);
  };

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!selectedEmployee) return;

    const employeeData = getEmployeeData(selectedEmployee);
    const leaves = employeeLeaves[selectedEmployee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const weekOffDays = editFormData.weekOffDays || getWeekOffDaysForSalary(selectedEmployee);
    const holidays = editFormData.holidays || calculateHolidays(selectedEmployee);
    const unpaidLeaves = leaves.LOP;

    // ✅ CORRECT DAY COUNT LOGIC
    const daysInMonth = selectedEmployee.monthDays || monthDays || getDaysInMonth(selectedEmployee.month || selectedMonth);
    const dailyRate = employeeData.salaryPerMonth / daysInMonth;

    const workingDays = editFormData.workingDays || 0;
    const halfDays = editFormData.halfDayWorking || 0;
    const effectiveWorkingDays = workingDays + (0.5 * halfDays);

    const paidLeaveDays = (leaves.CL || 0) + (leaves.EL || 0) + (leaves.COFF || 0);

    const paidDays = Math.max(0, effectiveWorkingDays + weekOffDays + paidLeaveDays);
    const baseSalary = paidDays * dailyRate;

    const extraDaysAmount = (extraWorkData.extraDays || 0) * dailyRate;
    const bonus = extraWorkData.bonus || 0;
    const deductions = extraWorkData.deductions || 0;
    const totalExtraAmount = extraDaysAmount + bonus - deductions;
    const finalSalary = baseSalary + totalExtraAmount;

    const updatedData = {
      ...editFormData,
      calculatedSalary: Math.round(finalSalary),
      extraWork: {
        extraDays: extraWorkData.extraDays || 0,
        extraHours: extraWorkData.extraHours || 0,
        overtimeRate: 0,
        overtimeAmount: 0,
        bonus: bonus,
        deductions: deductions,
        totalExtraAmount: totalExtraAmount,
        reason: extraWorkData.reason || ""
      }
    };

    try {
      // ✅ SAVE TO BACKEND (Use Localhost for testing)
      // const response = await fetch("https://api.timelyhealth.in/attendancesummary/updatePayroll", {
<<<<<<< HEAD
      const response = await fetch("https://api.timelyhealth.in/api/attendancesummary/updatePayroll", {
=======
      const response = await fetch("https://api.timelyhealth.in/attendancesummary/updatePayroll", {
>>>>>>> e788108b888e65a50407f76a377ae5f784139482
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: selectedEmployee.employeeId,
          month: selectedEmployee.month || selectedMonth,
          calculatedSalary: Math.round(finalSalary),
          extraWork: updatedData.extraWork,
          presentDays: editFormData.presentDays,
          workingDays: editFormData.workingDays,
          halfDayWorking: editFormData.halfDayWorking,
          fullDayNotWorking: editFormData.fullDayNotWorking,
          weekOffDays: weekOffDays,
          holidays: holidays
        })
      });

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }

      const result = await response.json(); // ✅ Parse correct response

      // Update local state with SERVER data (Single Source of Truth)
      const updatedRecords = records.map(record => {
        if (record.employeeId === selectedEmployee.employeeId) {
          const serverSummary = result.summary;
          return {
            ...record,
            ...updatedData, // Keep UI form data primarily
            extraWork: serverSummary.extraWork || updatedData.extraWork,
            calculatedSalary: serverSummary.calculatedSalary || updatedData.calculatedSalary,
            // Sync day counts if server returned them
            presentDays: serverSummary.presentDays ?? record.presentDays,
            totalWorkingDays: serverSummary.totalWorkingDays ?? record.totalWorkingDays
          };
        }
        return record;
      });

      setRecords(updatedRecords);
      setFilteredRecords(prev => prev.map(r =>
        r.employeeId === selectedEmployee.employeeId ? updatedRecords.find(ur => ur.employeeId === selectedEmployee.employeeId) : r
      ));

      setShowEditModal(false);
      alert("Salary details updated & synced successfully!");

    } catch (error) {
      console.error("Error saving payroll:", error);
      alert("Failed to save payroll changes: " + error.message);
    }
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



  // ✅ NEW: Reset to Actual (System Calculation)
  const handleReset = () => {
    if (!selectedEmployee) return;

    // Recalculate based on pure attendance data
    const employeeData = getEmployeeData(selectedEmployee);
    const leaves = employeeLeaves[selectedEmployee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const weekOffDays = getWeekOffDaysForSalary(selectedEmployee);

    // Use correct month days
    const daysInMonth = selectedEmployee.monthDays || monthDays || getDaysInMonth(selectedEmployee.month || selectedMonth);
    const dailyRate = employeeData.salaryPerMonth / daysInMonth;

    const workingDays = selectedEmployee.totalWorkingDays || 0;
    const halfDays = selectedEmployee.halfDayWorking || 0;
    const effectiveWorkingDays = workingDays; // totalWorkingDays already includes half-day logic usually? 
    // Let's re-derive to be safe if totalWorkingDays is raw count
    // But typically totalWorkingDays in summary = Full + (Half * 0.5)

    const paidLeaveDays = (leaves.CL || 0) + (leaves.EL || 0) + (leaves.COFF || 0);
    const paidDays = Math.max(0, workingDays + weekOffDays + paidLeaveDays);

    const systemCalculatedSalary = Math.round(paidDays * dailyRate);

    // Reset Form Data
    setEditFormData({
      ...editFormData,
      calculatedSalary: systemCalculatedSalary,
      weekOffDays: weekOffDays, // Reset manual weekoffs if any?
      // Keep other days from selectedEmployee as they are base attendance
    });

    // Reset Extra Work
    setExtraWorkData({
      extraDays: 0,
      extraHours: 0,
      overtimeRate: 0,
      bonus: 0,
      deductions: 0,
      reason: "Reset to system calculation"
    });

    alert("Values reset to system calculation. Click 'Save Changes' to apply.");
  };

  // Handle view
  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  // Download invoice with smart restrictions
  const downloadInvoice = async (employee) => {
    const employeeMonth = employee.month || selectedMonth;

    const allowed = isPayslipDownloadAllowed(employeeMonth);

    if (!allowed) {
      alert("Payslip download for current month is only allowed on or after 30th.");
      return;
    }

    const invoiceContent = generateInvoiceHTML(employee);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceContent);
      printWindow.document.close();
      printWindow.print();

      try {
        const adminName = localStorage.getItem("adminName") || "Admin";
        const adminId = localStorage.getItem("adminId") || "admin";
        const adminEmail = localStorage.getItem("adminEmail") || localStorage.getItem("employeeEmail") || "admin@system.com";

        console.log("Logging payslip download:", {
          adminName,
          adminId,
          adminEmail,
          employee: employee.name
        });

        const response = await axios.post("https://api.timelyhealth.in/user-activity/log", {
          userId: adminId,
          userName: adminName,
          userEmail: adminEmail,
          userRole: "admin",
          action: "payslip_download",
          actionDetails: `Downloaded payslip for ${employee.name} (${employee.employeeId}) - ${formatMonthDisplay(employee.month || selectedMonth)}`,
          metadata: {
            employeeId: employee.employeeId,
            employeeName: employee.name,
            month: employee.month || selectedMonth,
            salary: employee.calculatedSalary
          }
        });

        console.log("✅ Payslip download logged successfully:", response.data);
      } catch (error) {
        console.error("❌ Failed to log payslip download:", error.response?.data || error.message);
      }
    }
  };

  // Generate invoice HTML with DEDUCTION BREAKDOWN
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
    // ✅ CORRECT DAY COUNT LOGIC
    const daysInMonth = employee.monthDays || monthDays || getDaysInMonth(employee.month || selectedMonth);
    const totalMonthDays = daysInMonth;
    const dailyRate = calculateDailyRate(employee);
    const dailyRateNumber = parseFloat(dailyRate) || 0;
    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };

    const actualWeekOffDays = getWeekOffDaysForDisplay(employee);
    const weekOffDaysForSalary = getWeekOffDaysForSalary(employee);
    const includeWeekOffInSalary = shouldIncludeWeekOffInSalary(employee.month || selectedMonth);
    const isHistorical = isHistoricalMonth(employee.month || selectedMonth);
    const isCurrent = isCurrentMonth(employee.month || selectedMonth);

    // ✅ USE WORKING DAYS IF EDITED
    const presentDays = employee.workingDays ?? employee.presentDays ?? 0;
    const halfDays = employee.halfDayWorking || 0;
    const paidLeaveDays = (leaves.CL || 0) + (leaves.EL || 0) + (leaves.COFF || 0);

    const totalPaidDays = presentDays + (halfDays * 0.5) + weekOffDaysForSalary + paidLeaveDays;

    const halfDayDeductionDays = halfDays * 0.5;
    const halfDayDeductionAmount = halfDayDeductionDays * dailyRateNumber;

    const totalUnpaidDays = Math.max(0, totalMonthDays - totalPaidDays);
    const lopDays = Math.max(0, totalUnpaidDays - halfDayDeductionDays);

    // ✅ SOURCE OF TRUTH: Use the salary displayed in the table
    const grossSalary = employeeData.salaryPerMonth || 0;
    const bonus = employee.extraWork?.bonus || 0;
    const extraDaysPay = (employee.extraWork?.extraDays || 0) * dailyRateNumber;
    const totalEarnings = grossSalary + bonus + extraDaysPay;

    const otherDeductions = employee.extraWork?.deductions || 0;

    // If the salary was manually edited (employee.calculatedSalary exists), 
    // we use it as the Net Pay and adjust the LOP deduction so the math squares up on the invoice.
    const netPay = employee.calculatedSalary || (totalEarnings - (halfDayDeductionAmount + (lopDays * dailyRateNumber) + otherDeductions));

    // Reverse-calculate LOP amount to match the Net Pay exactly
    const lopAmount = Math.max(0, totalEarnings - netPay - halfDayDeductionAmount - otherDeductions);

    const totalDeductions = halfDayDeductionAmount + lopAmount + otherDeductions;

    const hasExtraWork = employee.extraWork && (
      (employee.extraWork.extraDays || 0) > 0 ||
      (employee.extraWork.bonus || 0) > 0 ||
      (employee.extraWork.deductions || 0) > 0
    );

    return `
        <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
                <title>Payslip - ${employee.name}</title>
                <style>
                  @page {size: A4; margin: 0; }
                  body {
                    font - family: Arial, sans-serif;
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
                  table {width: 100%; border-collapse: collapse; }
                  th, td {
                    padding: 4px 8px;
                  border: 1px solid #000;
                  font-size: 12px;
                  vertical-align: middle;
          }
                  .header-cell {border: none; padding: 2px 2px; text-align: center; border-bottom: 1px solid #000; }

                  .section-header {
                    background - color: #f0f0f0;
                  font-weight: bold;
                  text-align: center;
                  text-transform: uppercase;
          }
                  .amount-col {text - align: right; width: 15%; }
                  .label-col {text - align: left; width: 35%; }

                  .notes-box {
                    margin: 10px;
                  padding: 5px;
                  border: 1px dashed #666;
                  font-size: 11px;
                  background-color: #fafafa;
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
                          <img src="${templateConfig.logo}" alt="Logo" style="height: 110px; width: auto; max-width: 130px; object-fit: contain; display: block;">
                        </div>
                        <div style="flex: 1; text-align: center; margin-right: 130px;">
                          <h1 style="margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase;">${templateConfig.companyName}</h1>
                          <p style="margin: 0px 0 0 0; font-size: 11px; line-height: 1.1;">
                            ${templateConfig.address.replace(/\n/g, '<br>')}
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

                </table>

                <div style="text-align: center; font-size: 10px; margin-top: 10px;">
                  This is a computer-generated document.
                </div>

              </div>
            </body>
          </html>
      `;
  };

  // Get leave types for display
  const getLeaveTypes = (employee) => {
    if (employee.leaveTypes && Object.keys(employee.leaveTypes).length > 0) {
      const leaveStrings = [];
      Object.entries(employee.leaveTypes).forEach(([type, count]) => {
        if (count > 0) {
          leaveStrings.push(`${type.toUpperCase()}: ${count} `);
        }
      });
      if (leaveStrings.length > 0) return leaveStrings.join(', ');
    }

    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const leaveStrings = [];

    if (leaves.CL > 0) leaveStrings.push(`CL: ${leaves.CL} `);
    if (leaves.EL > 0) leaveStrings.push(`EL: ${leaves.EL} `);
    if (leaves.COFF > 0) leaveStrings.push(`COFF: ${leaves.COFF} `);
    if (leaves.LOP > 0) leaveStrings.push(`LOP: ${leaves.LOP} `);
    if (leaves.Other > 0) leaveStrings.push(`Other: ${leaves.Other} `);

    return leaveStrings.length > 0 ? leaveStrings.join(', ') : 'No Leaves';
  };

  // Format month display
  const formatMonthDisplay = (month) => {
    if (!month) return "Current Month";
    const [year, monthNum] = month.split('-');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[parseInt(monthNum) - 1]} ${year} `;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold text-blue-600">Loading payroll data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-4 text-red-600 bg-red-100 rounded-lg">
          <p className="font-semibold">Error: {error}</p>
          <button
            onClick={() => fetchData(selectedMonth)}
            className="px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-8xl">

        {/* Search and Filter Section */}
        <div className="px-4 py-2 mb-3 bg-white border rounded-lg shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by ID or Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-1 pl-6 pr-3 text-sm border rounded-md focus:ring-1 focus:ring-blue-400"
              />
              <svg
                className="absolute w-2 h-2 text-gray-400 -translate-y-1/2 left-2 top-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => {
                  const monthValue = e.target.value;
                  setSelectedMonth(monthValue);
                  monthValue ? fetchData(monthValue) : fetchData();
                }}
                onFocus={(e) => e.target.click()}
                className="px-2 py-1 text-sm border rounded-md cursor-pointer"
              />

              <button
                onClick={() => setShowTemplateModal(true)}
                className="px-2 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                ⚙️ Template
              </button>

              <button
                onClick={() => {
                  setSelectedMonth("");
                  fetchData();
                }}
                className="px-2 py-1 text-sm text-gray-700 bg-gray-100 border rounded-md hover:bg-gray-200"
              >
                Current
              </button>

              <button
                onClick={() => fetchData(selectedMonth)}
                disabled={isLoadingMonth}
                className="flex items-center px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoadingMonth ? (
                  <svg className="w-2 h-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9" />
                  </svg>
                ) : (
                  "Refresh"
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-2 mb-3 md:grid-cols-4">

          {/* Total Employees */}
          <div className="px-3 py-2 bg-white border-l-2 border-blue-500 rounded-md shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 leading-tight">
                  Active Employees
                </p>
                <p className="text-sm font-semibold leading-tight text-gray-800">
                  {filteredRecords.length}
                </p>
              </div>
              <div className="p-1.5 bg-blue-100 rounded-full">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Salary */}
          <div className="px-3 py-2 bg-white border-l-2 border-green-500 rounded-md shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 leading-tight">
                  Total Salary
                </p>
                <p className="text-sm font-semibold leading-tight text-gray-800">
                  ₹{filteredRecords.reduce((s, e) => s + (e.calculatedSalary || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="p-1.5 bg-green-100 rounded-full">
                <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8" />
                </svg>
              </div>
            </div>
          </div>

          {/* Active This Month */}
          <div className="px-3 py-2 bg-white border-l-2 border-purple-500 rounded-md shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 leading-tight">
                  Active This Month
                </p>
                <p className="text-sm font-semibold leading-tight text-gray-800">
                  {filteredRecords.filter(e => (e.totalWorkingDays || 0) > 0).length}
                </p>
              </div>
              <div className="p-1.5 bg-purple-100 rounded-full">
                <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
              </div>
            </div>
          </div>

          {/* On Leave */}
          <div className="px-3 py-2 bg-white border-l-2 border-red-500 rounded-md shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 leading-tight">
                  On Leave
                </p>
                <p className="text-sm font-semibold leading-tight text-gray-800">
                  {filteredRecords.filter(emp => {
                    const leaves = employeeLeaves[emp.employeeId];
                    return leaves && (leaves.CL + leaves.EL + leaves.COFF + leaves.LOP) > 0;
                  }).length}
                </p>
              </div>
              <div className="p-1.5 bg-red-100 rounded-full">
                <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                </svg>
              </div>
            </div>
          </div>

        </div>

        {/* Month Type Notice */}
        <div className={`px - 3 py - 2 mb - 3 rounded - md shadow - sm ${isHistoricalMonth(selectedMonth)
          ? 'bg-green-50 border-l-2 border-green-500'
          : isCurrentMonth(selectedMonth)
            ? (shouldIncludeWeekOffInSalary(selectedMonth)
              ? 'bg-green-50 border-l-2 border-green-500'
              : 'bg-yellow-50 border-l-2 border-yellow-500')
            : 'bg-blue-50 border-l-2 border-blue-500'
          } `}>
          <div className="flex items-center">
            <div className="mr-2">
              {isHistoricalMonth(selectedMonth) ? (
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : isCurrentMonth(selectedMonth) ? (
                shouldIncludeWeekOffInSalary(selectedMonth) ? (
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
                {isHistoricalMonth(selectedMonth)
                  ? "✓ Historical Month - Full salary with week-off included | Payslip download available"
                  : isCurrentMonth(selectedMonth)
                    ? (shouldIncludeWeekOffInSalary(selectedMonth)
                      ? `✓ Current Month(After 26th) - Week - off included | ${isPayslipDownloadAllowed(selectedMonth) ? 'Payslip download available' : 'Payslip available after 30th'} `
                      : `Current Month(Before 26th) - Week - off will be added after 26th | ${isPayslipDownloadAllowed(selectedMonth) ? 'Payslip download available' : 'Payslip available after 30th'} `)
                    : "Future Month - Preview only"}
              </p>
            </div>
          </div>
        </div>

        {/* Payroll Table */}
        <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
            <table className="min-w-full">
              <thead className="text-sm text-left text-white bg-gradient-to-r from-purple-500 to-blue-600">
                <tr>
                  <th className="py-2 text-center">Employee ID</th>
                  <th className="py-2 text-center">Name</th>
                  <th className="p-2 text-center">Working Days</th>
                  <th className="p-2 text-center">Present Days</th>
                  <th className="p-2 text-center">Half Days</th>
                  <th className="p-2 text-center">Week Offs</th>
                  <th className="p-2 text-center">Monthly Salary</th>
                  <th className="p-2 text-center">Calculated Salary</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentRecords.map((item, index) => (
                  <tr
                    key={item.employeeId}
                    className={`hover: bg - gray - 50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} `}
                  >
                    <td className="p-4 text-sm font-medium text-gray-900">{item.employeeId}</td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mr-3 bg-blue-100 rounded-full">
                          <span className="text-sm font-medium text-blue-800">
                            {item.name?.charAt(0) || 'E'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.department || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded">
                        {item.totalWorkingDays || 0}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded">
                        {item.presentDays || 0}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded">
                        {item.halfDayWorking || 0}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded">
                            {getWeekOffDaysForDisplay(item)} days
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-right text-gray-900">
                      ₹{(item.salaryPerMonth || 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-bold text-green-700">₹{calculateSalary(item).toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Daily: ₹{calculateDailyRate(item)}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition duration-150"
                          title="View Details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition duration-150"
                          title="Edit Salary"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => downloadInvoice(item)}
                          className={`p - 1.5 rounded - md transition duration - 150 ${isPayslipDownloadAllowed(item.month || selectedMonth)
                            ? 'text-purple-600 hover:bg-purple-50'
                            : 'text-gray-400 hover:bg-gray-100 cursor-not-allowed'
                            } `}
                          title={isPayslipDownloadAllowed(item.month || selectedMonth)
                            ? "Download Payslip"
                            : item.isHistoricalMonth
                              ? "Download Payslip (Historical Month)"
                              : "Payslip download available only on or after 30th for current month"}
                          disabled={!isPayslipDownloadAllowed(item.month || selectedMonth)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredRecords.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex justify-between flex-1 sm:hidden">
                <button
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className={`relative inline - flex items - center px - 4 py - 2 text - sm font - medium rounded - md ${currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                    } `}
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className={`ml - 3 relative inline - flex items - center px - 4 py - 2 text - sm font - medium rounded - md ${currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                    } `}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastRecord, filteredRecords.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredRecords.length}</span> active employees
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={handlePrevious}
                      disabled={currentPage === 1}
                      className={`relative inline - flex items - center px - 2 py - 2 rounded - l - md border border - gray - 300 text - sm font - medium ${currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                        } `}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {getPageNumbers().map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageClick(pageNumber)}
                        className={`relative inline - flex items - center px - 4 py - 2 border text - sm font - medium ${currentPage === pageNumber
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          } `}
                      >
                        {pageNumber}
                      </button>
                    ))}
                    <button
                      onClick={handleNext}
                      disabled={currentPage === totalPages}
                      className={`relative inline - flex items - center px - 2 py - 2 rounded - r - md border border - gray - 300 text - sm font - medium ${currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                        } `}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}

          {filteredRecords.length === 0 && !loading && (
            <div className="py-12 text-center">
              <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No active employees found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try a different search term' : 'No payroll data available for active employees'}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* View Modal */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between mb-4 bg-white">
              <h2 className="text-xl font-bold text-gray-800">Employee Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 mb-4 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                  <span className="text-lg font-semibold text-blue-800">
                    {selectedEmployee.name?.charAt(0) || 'E'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{selectedEmployee.name}</h3>
                  <p className="text-sm text-gray-600">ID: {selectedEmployee.employeeId}</p>
                  <p className="text-sm text-gray-600">Month: {selectedEmployee.month || selectedMonth || "Current"} ({selectedEmployee.monthDays || monthDays} days)</p>
                  <p className={`text - sm ${selectedEmployee.isHistoricalMonth ? 'text-green-600' : selectedEmployee.isCurrentMonth ? 'text-blue-600' : 'text-gray-600'} `}>
                    {selectedEmployee.isHistoricalMonth
                      ? 'Historical Month - Full salary with week-off'
                      : selectedEmployee.isCurrentMonth
                        ? `Current Month - ${shouldIncludeWeekOffInSalary(selectedEmployee.month || selectedMonth) ? 'Week-off included (After 26th)' : 'Week-off will be added after 26th'} `
                        : 'Future Month'}
                  </p>
                  <p className="text-sm text-green-600">
                    Status: {selectedEmployee.status === 'inactive' ? 'Inactive' : 'Active'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-sm text-gray-600">Present Days</p>
                <p className="text-lg font-semibold text-green-600">{selectedEmployee.presentDays || 0}</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-sm text-gray-600">Working Days</p>
                <p className="text-lg font-semibold text-blue-600">{selectedEmployee.totalWorkingDays || 0}</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-sm text-gray-600">Half Days</p>
                <p className="text-lg font-semibold text-yellow-600">{selectedEmployee.halfDayWorking || 0}</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-sm text-gray-600">WeekOff Days</p>
                <p className="text-lg font-semibold text-purple-600">{getWeekOffDaysForDisplay(selectedEmployee)}</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-sm text-gray-600">Month Days</p>
                <p className="text-lg font-semibold text-gray-800">{selectedEmployee.monthDays || monthDays}</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-sm text-gray-600">Monthly Salary</p>
                <p className="text-lg font-semibold text-blue-600">₹{getEmployeeData(selectedEmployee).salaryPerMonth || 0}</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-sm text-gray-600">Daily Rate</p>
                <p className="text-lg font-semibold text-gray-800">₹{calculateDailyRate(selectedEmployee)}/day</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-sm text-gray-600">Calculated Salary</p>
                <p className="text-lg font-semibold text-green-600">₹{calculateSalary(selectedEmployee)}</p>
              </div>
              <div className="col-span-2 p-3 bg-white border rounded-lg">
                <p className="text-sm text-gray-600">Approved Leaves</p>
                <p className="font-semibold text-red-600 text">{getLeaveTypes(selectedEmployee)}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => downloadInvoice(selectedEmployee)}
                disabled={!isPayslipDownloadAllowed(selectedEmployee.month || selectedMonth)}
                className={`px - 6 py - 2 rounded - lg transition duration - 200 ${isPayslipDownloadAllowed(selectedEmployee.month || selectedMonth)
                  ? 'bg-purple-500 text-white hover:bg-purple-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  } `}
              >
                Download Payslip
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2 text-white transition duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Edit Salary Details - {selectedEmployee.name}</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-3 mb-4 rounded-lg bg-blue-50">
              <p className="text-sm text-blue-700">
                <strong>Month:</strong> {selectedEmployee.month || selectedMonth || "Current Month"} |
                <strong> Days in Month:</strong> {selectedEmployee.monthDays || monthDays} |
                <strong> Monthly Salary:</strong> ₹{getEmployeeData(selectedEmployee).salaryPerMonth || 0} |
                <strong> Type:</strong> {selectedEmployee.isHistoricalMonth ? 'Historical Month' : selectedEmployee.isCurrentMonth ? 'Current Month' : 'Future Month'}
              </p>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Present Days</label>
                  <input
                    type="number"
                    name="presentDays"
                    value={editFormData.presentDays || 0}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max={selectedEmployee.monthDays || monthDays}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Working Days</label>
                  <input
                    type="number"
                    name="workingDays"
                    value={editFormData.workingDays || 0}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max={selectedEmployee.monthDays || monthDays}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Half Days</label>
                  <input
                    type="number"
                    name="halfDayWorking"
                    value={editFormData.halfDayWorking || 0}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Full Day Leaves</label>
                  <input
                    type="number"
                    name="fullDayNotWorking"
                    value={editFormData.fullDayNotWorking || 0}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Daily Rate (₹)</label>
                  <input
                    type="text"
                    value={editFormData.dailyRate || calculateDailyRate(selectedEmployee)}
                    className="w-full p-3 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Week-off Days</label>
                  <input
                    type="number"
                    name="weekOffDays"
                    value={getWeekOffDaysForDisplay(selectedEmployee)}
                    className="w-full p-3 text-gray-600 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Calculated Salary (₹)</label>
                  <input
                    type="number"
                    name="calculatedSalary"
                    value={editFormData.calculatedSalary || 0}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    min="0"
                    readOnly
                  />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">Extra Work & Adjustments</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Extra Days</label>
                    <input
                      type="number"
                      name="extraDays"
                      value={extraWorkData.extraDays || 0}
                      onChange={handleExtraWorkChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Bonus (₹)</label>
                    <input
                      type="number"
                      name="bonus"
                      value={extraWorkData.bonus || 0}
                      onChange={handleExtraWorkChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Deductions (₹)</label>
                    <input
                      type="number"
                      name="deductions"
                      value={extraWorkData.deductions || 0}
                      onChange={handleExtraWorkChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-1 text-sm font-medium text-gray-700">Reason</label>
                    <input
                      type="text"
                      name="reason"
                      value={extraWorkData.reason || ""}
                      onChange={handleExtraWorkChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter reason for adjustments..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 space-x-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 mr-auto text-white transition duration-200 bg-yellow-500 rounded-lg hover:bg-yellow-600"
                >
                  Reset to Actual
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 text-gray-700 transition duration-200 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-white transition duration-200 bg-green-500 rounded-lg hover:bg-green-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Settings Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Edit Payslip Template</h2>
              <button onClick={() => setShowTemplateModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Company Name</label>
                <input
                  type="text"
                  value={templateConfig.companyName}
                  onChange={(e) => setTemplateConfig({ ...templateConfig, companyName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Address</label>
                <textarea
                  rows="3"
                  value={templateConfig.address}
                  onChange={(e) => setTemplateConfig({ ...templateConfig, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Upload New Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">Recommended: PNG/JPEG, Max 130px width</p>
              </div>

              {templateConfig.logo && (
                <div className="p-2 mt-2 text-center border rounded bg-gray-50">
                  <p className="mb-1 text-xs text-gray-500">Current Logo Preview:</p>
                  <img src={templateConfig.logo} alt="Preview" className="object-contain h-16 mx-auto" />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTemplateSave}
                  className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayRoll;