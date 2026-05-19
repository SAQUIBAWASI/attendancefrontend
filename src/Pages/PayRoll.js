// import axios from "axios";
// import { useCallback, useEffect, useRef, useState } from "react";
// import {
//   FaBuilding,
//   FaCalendarAlt,
//   FaSearch,
//   FaTimes,
//   FaUserTag
// } from "react-icons/fa";

// import { useNavigate } from "react-router-dom";
// import StatCard from "../Components/StatCard";
// import { API_BASE_URL } from "../config";
// import logo from "../Images/Timely-Health-Logo.png";
// import { isEmployeeHidden } from "../utils/employeeStatus";

// const PayRoll = () => {
//   const [records, setRecords] = useState([]);
//   const [allEmployees, setAllEmployees] = useState([]);
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
//   const navigate = useNavigate();

//   const [showAttendancePopup, setShowAttendancePopup] = useState(false);
//   const [selectedEmployeeAttendance, setSelectedEmployeeAttendance] = useState([]);
//   const [attendanceLoading, setAttendanceLoading] = useState(false);

//   const [employeeCompOffs, setEmployeeCompOffs] = useState({});
//   const [compOffDetails, setCompOffDetails] = useState({});

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

//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

//   const [filterDepartment, setFilterDepartment] = useState("");
//   const [filterDesignation, setFilterDesignation] = useState("");
//   const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
//   const [showDesignationFilter, setShowDesignationFilter] = useState(false);

//   const [uniqueDepartments, setUniqueDepartments] = useState([]);
//   const [uniqueDesignations, setUniqueDesignations] = useState([]);

//   const departmentFilterRef = useRef(null);
//   const designationFilterRef = useRef(null);

//   const [isLoadingMonth, setIsLoadingMonth] = useState(false);
//   const [monthDays, setMonthDays] = useState(30);
//   const [weekOffConfig, setWeekOffConfig] = useState({
//     weekOffDay: "",
//     weekOffType: "0+4",
//     manualDays: ""
//   });

//   const [itemsPerPage, setItemsPerPage] = useState(10);

//   const [showTemplateModal, setShowTemplateModal] = useState(false);
//   const [templateConfig, setTemplateConfig] = useState({
//     companyName: "Timely Health Tech Pvt Ltd",
//     address: "H. No: 1-98/9/25/p, # 301, 3rd Floor, Sri Sai Balaji Avenue,\nArunodaya Colony, Madhapur, Hyderabad, TG - 500081",
//     logo: logo
//   });

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

//   useEffect(() => {
//     const savedTemplate = localStorage.getItem("payrollTemplateConfig");
//     if (savedTemplate) {
//       setTemplateConfig(JSON.parse(savedTemplate));
//     }
//   }, []);

//   const handleTemplateSave = () => {
//     localStorage.setItem("payrollTemplateConfig", JSON.stringify(templateConfig));
//     setShowTemplateModal(false);
//     alert("✅ Template settings saved successfully!");
//   };

//   const handleLogoChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setTemplateConfig(prev => ({ ...prev, logo: reader.result }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const ATTENDANCE_SUMMARY_API_URL = `${API_BASE_URL}/attendancesummary/get`;
//   const ATTENDANCE_DETAILS_API_URL = `${API_BASE_URL}/attendance/allattendance`;
//   const LEAVES_API_URL = `${API_BASE_URL}/leaves/leaves?status=approved`;
//   const COMPOFF_API_URL = `${API_BASE_URL}/leaves/comp-offs`;
//   const EMPLOYEES_API_URL = `${API_BASE_URL}/employees/get-employees`;
//   const UPDATE_PAYROLL_API_URL = `${API_BASE_URL}/attendancesummary/updatePayroll`;

//   const getDaysInMonth = (monthStr) => {
//     if (!monthStr) return new Date().getDate();
//     const [year, month] = monthStr.split('-').map(Number);
//     return new Date(year, month, 0).getDate();
//   };

//   const wasEmployeeEmployedInMonth = (employee, monthStr) => {
//     if (!monthStr || !employee.joinDate) return true;
//     const [year, month] = monthStr.split('-').map(Number);
//     const joiningDate = new Date(employee.joinDate);
//     const joiningYear = joiningDate.getFullYear();
//     const joiningMonth = joiningDate.getMonth() + 1;
//     if (joiningYear > year || (joiningYear === year && joiningMonth > month)) return false;
//     return true;
//   };

//   const isCurrentMonth = (month) => {
//     if (!month) return true;
//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth() + 1;
//     const [year, monthNum] = month.split('-').map(Number);
//     return year === currentYear && monthNum === currentMonth;
//   };

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

//   const shouldIncludeWeekOffInSalary = (month) => {
//     if (!month) return false;
    
//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth() + 1;
//     const currentDay = today.getDate();
    
//     const [year, monthNum] = month.split('-').map(Number);
    
//     if (year < currentYear) return true;
//     if (year === currentYear && monthNum < currentMonth) return true;
    
//     if (year === currentYear && monthNum === currentMonth) {
//       return currentDay >= 26;
//     }
    
//     return false;
//   };

//   const isPayslipDownloadAllowed = (month) => {
//     if (!month) return false;
//     if (isHistoricalMonth(month)) return true;
//     if (isCurrentMonth(month)) {
//       const today = new Date();
//       const currentDay = today.getDate();
//       const daysInMonth = getDaysInMonth(month);
//       return currentDay >= daysInMonth;
//     }
//     return true;
//   };

//   const processLeavesData = useCallback((leavesData, selectedMonth) => {
//     const leavesMap = {};
//     const [year, monthNum] = (selectedMonth || new Date().toISOString().slice(0, 7)).split('-').map(Number);
//     const startOfMonth = new Date(year, monthNum - 1, 1);
//     const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);

//     leavesData.forEach(leave => {
//       const employeeId = leave.employeeId;
//       if (!employeeId) return;

//       const leaveStart = new Date(leave.startDate);
//       const leaveEnd = new Date(leave.endDate);

//       const overlapStart = new Date(Math.max(leaveStart, startOfMonth));
//       const overlapEnd = new Date(Math.min(leaveEnd, endOfMonth));
//       const currentMonthDays = overlapStart <= overlapEnd ? Math.ceil(Math.abs(overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1 : 0;

//       if (!leavesMap[employeeId]) {
//         leavesMap[employeeId] = {
//           CL: 0,
//           SL: 0,
//           EL: 0,
//           COFF: 0,
//           LOP: 0,
//           Other: 0,
//           leaveDetails: []
//         };
//       }

//       const leaveType = leave.leaveType || 'Other';

//       if (currentMonthDays > 0) {
//         if (leavesMap[employeeId][leaveType] !== undefined) {
//           leavesMap[employeeId][leaveType] += currentMonthDays;
//         } else if (["Casual Leave", "Casual", "casual", "Earned Leave", "Earned", "earned", "Sick Leave", "Sick", "sick", "Comp Off", "comp off"].includes(leaveType)) {
//           const typeMap = { 
//             "Casual Leave": "CL", "Casual": "CL", "casual": "CL", 
//             "Earned Leave": "EL", "Earned": "EL", "earned": "EL", 
//             "Sick Leave": "SL", "Sick": "SL", "sick": "SL", 
//             "Comp Off": "COFF", "comp off": "COFF" 
//           };
//           leavesMap[employeeId][typeMap[leaveType]] += currentMonthDays;
//         } else {
//           leavesMap[employeeId].Other += currentMonthDays;
//         }

//         leavesMap[employeeId].leaveDetails.push({
//           type: leaveType,
//           startDate: leave.startDate,
//           endDate: leave.endDate,
//           days: currentMonthDays,
//           reason: leave.reason || '',
//           status: leave.status || 'pending'
//         });
//       }
//     });

//     setEmployeeLeaves(leavesMap);
//     return leavesMap;
//   }, []);

//   const processCompOffData = useCallback(async (selectedMonth, leavesData) => {
//     try {
//       const [year, monthNum] = (selectedMonth || new Date().toISOString().slice(0, 7)).split('-').map(Number);
//       const startOfMonth = new Date(year, monthNum - 1, 1);
//       const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);

//       const response = await axios.get(COMPOFF_API_URL);
//       const compOffs = response.data || [];

//       const compOffMap = {};
//       const compOffDetailsMap = {};

//       for (const co of compOffs) {
//         if (co.status === "approved") {
//           const employeeId = co.employeeId;
//           const workDate = new Date(co.workDate);

//           if (workDate >= startOfMonth && workDate <= endOfMonth) {
//             if (!compOffMap[employeeId]) {
//               compOffMap[employeeId] = { earned: 0, used: 0, balance: 0 };
//               compOffDetailsMap[employeeId] = [];
//             }
//             compOffMap[employeeId].earned += 1;
//             compOffDetailsMap[employeeId].push({
//               type: 'earned',
//               date: co.workDate,
//               reason: co.reason || 'Comp-off earned'
//             });
//           }
//         }
//       }

//       setEmployeeCompOffs(compOffMap);
//       setCompOffDetails(compOffDetailsMap);
//       return compOffMap;

//     } catch (error) {
//       console.error("Error fetching comp-offs:", error);
//       return {};
//     }
//   }, [COMPOFF_API_URL]);

//   const filterInactiveEmployees = useCallback((payrollData, employeesMap) => {
//     if (!Array.isArray(payrollData)) return [];
//     return payrollData.filter(item => {
//       const employeeData = employeesMap[item.employeeId];
//       if (!employeeData) return false;
//       return !isEmployeeHidden(employeeData);
//     });
//   }, []);

//   const filterEmployeesByJoiningDate = useCallback((employees, monthStr) => {
//     if (!monthStr || !employees.length) return employees;
//     return employees.filter(emp => wasEmployeeEmployedInMonth(emp, monthStr));
//   }, []);

//   const extractUniqueValues = (employees) => {
//     const depts = new Set();
//     const designations = new Set();
//     employees.forEach(emp => {
//       if (emp.department) depts.add(emp.department);
//       if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
//     });
//     setUniqueDepartments(Array.from(depts).sort());
//     setUniqueDesignations(Array.from(designations).sort());
//   };

//   const fetchEmployeeAttendance = async (employeeId, month) => {
//     setAttendanceLoading(true);
//     try {
//       let url = `${ATTENDANCE_DETAILS_API_URL}?employeeId=${employeeId}`;
//       if (month) url += `&month=${month}`;
      
//       const response = await fetch(url);
//       const data = await response.json();
      
//       if (data.records && data.records.length > 0) {
//         let filteredByMonth = data.records;
//         if (month) {
//           const [year, monthNum] = month.split('-').map(Number);
//           filteredByMonth = data.records.filter(record => {
//             const recordDate = new Date(record.checkInTime);
//             return recordDate.getFullYear() === year && recordDate.getMonth() + 1 === monthNum;
//           });
//         }
//         const sortedRecords = filteredByMonth.sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime));
//         setSelectedEmployeeAttendance(sortedRecords);
//       } else {
//         setSelectedEmployeeAttendance([]);
//       }
//     } catch (error) {
//       console.error("Error fetching employee attendance:", error);
//       setSelectedEmployeeAttendance([]);
//     } finally {
//       setAttendanceLoading(false);
//     }
//   };

//   const handleRowClick = async (employee) => {
//     setSelectedEmployee(employee);
//     const monthToFetch = selectedMonth || new Date().toISOString().slice(0, 7);
//     await fetchEmployeeAttendance(employee.employeeId, monthToFetch);
//     setShowAttendancePopup(true);
//   };

//   const calculateWorkHours = (checkIn, checkOut) => {
//     if (!checkIn || !checkOut) return null;
//     const checkInTime = new Date(checkIn);
//     const checkOutTime = new Date(checkOut);
//     const diffHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
//     return diffHours.toFixed(1);
//   };

//   const fetchData = useCallback(async (month = "") => {
//     let isMounted = true;

//     try {
//       setLoading(true);
//       setError("");

//       const includeWeekOffInSalary = shouldIncludeWeekOffInSalary(month);
//       const isHistorical = isHistoricalMonth(month);
//       const isCurrent = isCurrentMonth(month);

//       const employeesRes = await fetch(EMPLOYEES_API_URL);
//       let employeesDataRaw = employeesRes.ok ? await employeesRes.json() : [];
//       let employeesData = [];
//       if (Array.isArray(employeesDataRaw)) {
//         employeesData = employeesDataRaw;
//       } else if (employeesDataRaw && Array.isArray(employeesDataRaw.data)) {
//         employeesData = employeesDataRaw.data;
//       }
      
//       const leavesRes = await fetch(LEAVES_API_URL);
//       let leavesData = leavesRes.ok ? await leavesRes.json() : [];
      
//       const holidaysRes = await fetch(`${API_BASE_URL}/holidays/all`);
//       let holidaysData = holidaysRes.ok ? await holidaysRes.json() : [];
      
//       let summaryData = [];
//       try {
//         const summaryRes = await fetch(`${ATTENDANCE_SUMMARY_API_URL}${month ? `?month=${month}` : ''}`);
//         if (summaryRes.ok) {
//           const json = await summaryRes.json();
//           summaryData = json.summary || [];
//         }
//       } catch (e) {
//         console.warn("Summary API Error:", e.message);
//       }

//       const employeesForMonth = filterEmployeesByJoiningDate(employeesData, month);
//       const activeEmployees = employeesForMonth.filter(emp => !isEmployeeHidden(emp));
      
//       const employeesMap = {};
//       activeEmployees.forEach(emp => {
//         employeesMap[emp.employeeId] = {
//           salaryPerMonth: emp.salaryPerMonth || 0,
//           shiftHours: emp.shiftHours || 8,
//           weekOffPerMonth: emp.weekOffPerMonth || 0,
//           weekOffDay: emp.weekOffDay || 'Sunday',
//           name: emp.name,
//           employeeId: emp.employeeId,
//           department: emp.department || '',
//           designation: emp.role || emp.designation || '',
//           joiningDate: emp.joinDate || emp.joiningDate || '',
//           bankAccount: emp.bankAccount || emp.bankAccountNo || '',
//           panCard: emp.panCard || emp.panNumber || '',
//           pfNo: emp.pfNumber || emp.pfNo || '',
//           uanNo: emp.uanNumber || emp.uanNo || '',
//           esicNo: emp.esicNumber || emp.esicNo || '',
//           branch: emp.branch || '',
//           weekOffType: emp.weekOffType || '0+4',
//           _id: emp._id,
//           originalSalary: emp.originalSalary || emp.salaryPerMonth,
//           salaryIncrements: emp.salaryIncrements || [],
//           basicPay: emp.basicPay || 0,
//           hra: emp.hra || 0,
//           conveyanceAllowance: emp.conveyanceAllowance || 0,
//           medicalAllowance: emp.medicalAllowance || 0,
//           performanceAllowance: emp.performanceAllowance || 0,
//           specialAllowance: emp.specialAllowance || 0,
//           gmc: emp.gmc || emp.gmcAmount || 0,
//           profTax: emp.ptax || emp.profTax || 0,
//           otherDeductions: emp.otherDeductions || 0
//         };
//       });
      
//       if (isMounted) {
//         setEmployeesMasterData(employeesMap);
//         setAllEmployees(employeesData);
//       }

//       extractUniqueValues(activeEmployees);

//       let holidayCount = 0;
//       if (Array.isArray(holidaysData)) {
//         const [sYear, sMonth] = (month || new Date().toISOString().slice(0, 7)).split('-').map(Number);
//         holidaysData.forEach(h => {
//           if (h.isActive !== false) {
//             const hStartStr = h.fromDate;
//             const hEndStr = h.toDate;
//             if (hStartStr && hStartStr.startsWith(`${sYear}-${String(sMonth).padStart(2, '0')}`) &&
//                 hEndStr && hEndStr.startsWith(`${sYear}-${String(sMonth).padStart(2, '0')}`)) {
//               holidayCount += h.totalDays || 1;
//             } else if (hStartStr && hEndStr) {
//               const hStart = new Date(hStartStr);
//               const hEnd = new Date(hEndStr);
//               const startOfMonth = new Date(sYear, sMonth - 1, 1);
//               const endOfMonth = new Date(sYear, sMonth, 0, 23, 59, 59);
//               const overlapStart = new Date(Math.max(hStart.getTime(), startOfMonth.getTime()));
//               const overlapEnd = new Date(Math.min(hEnd.getTime(), endOfMonth.getTime()));
//               if (overlapStart <= overlapEnd) {
//                 const days = Math.round((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24));
//                 holidayCount += Math.max(1, days);
//               }
//             }
//           }
//         });
//       }

//       const currentLeavesMap = processLeavesData(leavesData, month);
//       const currentCompOffsMap = await processCompOffData(month, leavesData);

//       const getActualWeekOffDaysInMonth = (employeeWeekOffDay, year, monthNum) => {
//         if (!employeeWeekOffDay) return 0;
        
//         const startDate = new Date(year, monthNum - 1, 1);
//         const endDate = new Date(year, monthNum, 0);
//         let weekOffCount = 0;
        
//         for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//           const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
//           if (dayName === employeeWeekOffDay) {
//             weekOffCount++;
//           }
//         }
        
//         return weekOffCount;
//       };

//       const [year, monthNum] = (month || new Date().toISOString().slice(0, 7)).split('-').map(Number);
//       const processedSalaries = [];
      
//       for (const emp of activeEmployees) {
//         const summary = summaryData.find(x => x.employeeId === emp.employeeId) || {};
        
//         const employeeWeekOffDay = emp.weekOffDay || 'Sunday';
//         const actualWeekOffCount = getActualWeekOffDaysInMonth(employeeWeekOffDay, year, monthNum);
        
//         const finalWeekOffDays = (summary.weekOffPerMonth !== undefined && summary.weekOffPerMonth !== null) 
//           ? summary.weekOffPerMonth 
//           : actualWeekOffCount;
        
//         let salaryForMonth = emp.salaryPerMonth || 0;
//         let historicalEffectiveFrom = emp.joinDate;
//         let originalSalary = emp.originalSalary || emp.salaryPerMonth;
//         let incrementDetails = null;
        
//         try {
//           const targetDate = new Date(year, monthNum - 1, 15);
//           const formattedDate = targetDate.toISOString().split('T')[0];
          
//           const salaryRes = await fetch(`${API_BASE_URL}/employees/${emp._id}/salary-for-date?date=${formattedDate}`);
//           if (salaryRes.ok) {
//             const salaryData = await salaryRes.json();
//             if (salaryData.success && salaryData.data) {
//               salaryForMonth = salaryData.data.salaryPerMonth;
//               historicalEffectiveFrom = salaryData.data.effectiveFrom || emp.joinDate;
//               originalSalary = salaryData.data.originalSalary || emp.originalSalary || emp.salaryPerMonth;
//               incrementDetails = salaryData.data.incrementDetails;
//             }
//           }
//         } catch (err) {
//           console.warn(`Failed to fetch salary for ${emp.name}:`, err.message);
//         }
        
//         const daysInMonthValue = getDaysInMonth(month || new Date().toISOString().slice(0, 7));
//         const dailyRate = salaryForMonth > 0 ? salaryForMonth / daysInMonthValue : 0;
        
//         const presentDaysCount = summary.presentDays ?? 0;
//         const halfDaysCount = summary.halfDayWorking ?? 0;
//         const compOffData = currentCompOffsMap[emp.employeeId] || { balance: 0 };
        
//         let calculatedSalary = 0;
//         if (salaryForMonth > 0 && daysInMonthValue > 0) {
//           const effectivePaidDays = presentDaysCount + (halfDaysCount * 0.5) + (includeWeekOffInSalary ? finalWeekOffDays : 0) + holidayCount + compOffData.balance;
//           calculatedSalary = effectivePaidDays * dailyRate;
//         }
        
//         processedSalaries.push({
//           employeeId: emp.employeeId,
//           name: emp.name,
//           presentDays: presentDaysCount,
//           workingDays: summary.totalWorkingDays ?? 0,
//           totalWorkingDays: summary.totalWorkingDays ?? 0,
//           halfDayWorking: halfDaysCount,
//           fullDayNotWorking: summary.fullDayNotWorking ?? 0,
//           calculatedSalary: Math.round(calculatedSalary),
//           baseCalculatedSalary: Math.round(calculatedSalary),
//           salaryPerMonth: salaryForMonth,
//           currentSalary: emp.salaryPerMonth,
//           originalSalary: originalSalary,
//           salaryPerDay: dailyRate,
//           weekOffs: finalWeekOffDays,
//           actualWeekOffCount: actualWeekOffCount,
//           weekOffDay: employeeWeekOffDay,
//           totalLeaves: 0,
//           month: month || "No Month",
//           monthDays: daysInMonthValue,
//           includeWeekOffInSalary: includeWeekOffInSalary,
//           isHistoricalMonth: isHistorical,
//           isCurrentMonth: isCurrent,
//           department: emp.department || 'N/A',
//           designation: emp.role || emp.designation || 'N/A',
//           compOffEarned: 0,
//           compOffUsed: 0,
//           compOffBalance: 0,
//           holidayCount: holidayCount,
//           historicalEffectiveFrom: historicalEffectiveFrom,
//           incrementDetails: incrementDetails,
//           _id: emp._id,
//           basicPay: emp.basicPay,
//           hra: emp.hra,
//           conveyanceAllowance: emp.conveyanceAllowance,
//           medicalAllowance: emp.medicalAllowance,
//           performanceAllowance: emp.performanceAllowance,
//           specialAllowance: emp.specialAllowance,
//           gmcAmount: emp.gmc,
//           ptax: emp.profTax,
//           otherDeductions: emp.otherDeductions
//         });
//       }

//       const activeProcessedSalaries = filterInactiveEmployees(processedSalaries, employeesMap);
      
//       if (isMounted) {
//         setRecords(activeProcessedSalaries);
//         setFilteredRecords(activeProcessedSalaries);
//       }

//     } catch (err) {
//       console.error("ERROR:", err);
//       if (isMounted) setError(err.message);
//     } finally {
//       if (isMounted) {
//         setLoading(false);
//         setIsLoadingMonth(false);
//       }
//     }
//   }, [EMPLOYEES_API_URL, LEAVES_API_URL, API_BASE_URL, ATTENDANCE_SUMMARY_API_URL, processLeavesData, filterInactiveEmployees, filterEmployeesByJoiningDate, processCompOffData]);

//   useEffect(() => {
//     if (records.length === 0) return;

//     const processRecordsWithAdditions = (prevRecords) => 
//       prevRecords.map(record => {
//         // Base salary already includes paid leaves and comp-offs now.
//         return {
//           ...record
//         };
//       });

//     setRecords(processRecordsWithAdditions);
//     setFilteredRecords(processRecordsWithAdditions);
//   }, [employeeCompOffs, employeeLeaves, employeesMasterData, monthDays, selectedMonth]);

//   useEffect(() => {
//     fetchData(selectedMonth);
//   }, [fetchData, selectedMonth]);

//   useEffect(() => {
//     let filtered = records.filter(record =>
//       record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       record.employeeId?.toString().includes(searchTerm)
//     );

//     if (filterDepartment) {
//       filtered = filtered.filter(record => record.department === filterDepartment);
//     }

//     if (filterDesignation) {
//       filtered = filtered.filter(record => record.designation === filterDesignation);
//     }

//     setFilteredRecords(filtered);
//     setCurrentPage(1);
//   }, [searchTerm, filterDepartment, filterDesignation, records]);

//   const handleMonthChange = (e) => {
//     const month = e.target.value;
//     setSelectedMonth(month);
//     setFromDate("");
//     setToDate("");
//   };

//   const handleDateRangeFilter = () => {
//     if (!fromDate || !toDate) {
//       alert("Please select both From and To dates");
//       return;
//     }

//     const fromMonth = fromDate.slice(0, 7);
//     const toMonth = toDate.slice(0, 7);

//     if (fromMonth !== toMonth) {
//       alert("Date range must be within the same month");
//       return;
//     }

//     setSelectedMonth(fromMonth);
//     fetchData(fromMonth);
//   };

//   const clearFilters = () => {
//     setSearchTerm("");
//     setFilterDepartment("");
//     setFilterDesignation("");
//     setFromDate("");
//     setToDate("");
//     const currentMonth = new Date().toISOString().slice(0, 7);
//     setSelectedMonth(currentMonth);
//     fetchData(currentMonth);
//   };

//   const handleItemsPerPageChange = (e) => {
//     setItemsPerPage(Number(e.target.value));
//     setCurrentPage(1);
//   };

//   const indexOfLastRecord = currentPage * itemsPerPage;
//   const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;
//   const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
//   const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

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
//     for (let i = 1; i <= totalPages; i++) {
//       if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
//         pageNumbers.push(i);
//       } else if (i === currentPage - 3 || i === currentPage + 3) {
//         pageNumbers.push("...");
//       }
//     }
//     return pageNumbers;
//   };

//   const calculateSalary = (employee) => employee.calculatedSalary || 0;

//   const calculateDailyRate = (employee) => {
//     const salary = employee.salaryPerMonth || 0;
//     if (!salary || salary === 0) return 0;
//     const daysInMonth = employee.monthDays || monthDays || getDaysInMonth(employee.month || selectedMonth);
//     return (salary / daysInMonth).toFixed(2);
//   };

//   const getEmployeeData = (employee) => {
//     const masterData = employeesMasterData[employee.employeeId] || {};
//     return {
//       ...masterData,
//       salaryPerMonth: employee.salaryPerMonth || masterData.salaryPerMonth || 0,
//       masterSalaryPerMonth: masterData.salaryPerMonth || 0,
//       shiftHours: masterData.shiftHours || 8,
//       weekOffPerMonth: employee.weekOffs || masterData.weekOffPerMonth || 0,
//       name: employee.name || masterData.name || '',
//       designation: employee.designation || masterData.designation || '',
//       department: employee.department || masterData.department || '',
//       joiningDate: masterData.joiningDate || '',
//       bankAccount: masterData.bankAccount || '',
//       panNo: masterData.panCard || '',
//       pfNo: masterData.pfNo || '',
//       uanNo: masterData.uanNo || '',
//       esicNo: masterData.esicNo || '',
//       branch: masterData.branch || '',
//       employeeId: employee.employeeId,
//       weekOffDay: masterData.weekOffDay || '',
//       weekOffType: masterData.weekOffType || '0+4',
//       status: employee.status || masterData.status || 'active',
//       basicPay: employee.basicPay || masterData.basicPay || 0,
//       hra: employee.hra || masterData.hra || 0,
//       conveyanceAllowance: employee.conveyanceAllowance || masterData.conveyanceAllowance || 0,
//       medicalAllowance: employee.medicalAllowance || masterData.medicalAllowance || 0,
//       performanceAllowance: employee.performanceAllowance || masterData.performanceAllowance || 0,
//       specialAllowance: employee.specialAllowance || masterData.specialAllowance || 0,
//       gmc: employee.gmcAmount || masterData.gmc || 0,
//       profTax: employee.ptax || masterData.profTax || 0,
//       otherDeductions: employee.otherDeductions || masterData.otherDeductions || 0
//     };
//   };

//   const getWeekOffDaysForDisplay = (employee) => employee.weekOffs || 0;

//   const handleEdit = (employee) => {
//     setSelectedEmployee(employee);
//     const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
//     const weekOffDaysForSalary = employee.weekOffs || 0;

//     setEditFormData({
//       presentDays: employee.presentDays || 0,
//       workingDays: employee.totalWorkingDays || 0,
//       halfDayWorking: employee.halfDayWorking || 0,
//       fullDayNotWorking: employee.fullDayNotWorking || 0,
//       calculatedSalary: employee.calculatedSalary || 0,
//       weekOffDays: weekOffDaysForSalary,
//       holidays: employee.holidayCount || 0,
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

//   const handleEditSubmit = async (e) => {
//     e.preventDefault();
//     if (!selectedEmployee) return;

//     const employeeData = getEmployeeData(selectedEmployee);
//     const leaves = employeeLeaves[selectedEmployee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
//     const weekOffDays = editFormData.weekOffDays || 0;
//     const daysInMonth = selectedEmployee.monthDays || monthDays || getDaysInMonth(selectedEmployee.month || selectedMonth);
//     const dailyRate = employeeData.salaryPerMonth / daysInMonth;

//     const workingDays = editFormData.presentDays || 0; 
//     const halfDays = editFormData.halfDayWorking || 0;
//     const holidays = editFormData.holidays || selectedEmployee.holidayCount || 0;
//     const effectiveWorkingDays = workingDays + (0.5 * halfDays);
//     const compOffData = employeeCompOffs[selectedEmployee.employeeId];
//     const compOffBalance = compOffData?.balance || 0;
    
//     const paidDays = Math.max(0, effectiveWorkingDays + weekOffDays + holidays + compOffBalance);
//     let baseSalary = paidDays * dailyRate;

//     const extraDaysAmount = (extraWorkData.extraDays || 0) * dailyRate;
//     const bonus = extraWorkData.bonus || 0;
//     const deductions = extraWorkData.deductions || 0;
//     const totalExtraAmount = extraDaysAmount + bonus - deductions;
//     const finalSalary = baseSalary + totalExtraAmount;

//     const updatedData = {
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

//     try {
//       const response = await fetch(UPDATE_PAYROLL_API_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           employeeId: selectedEmployee.employeeId,
//           month: selectedEmployee.month || selectedMonth,
//           calculatedSalary: Math.round(finalSalary),
//           extraWork: updatedData.extraWork,
//           presentDays: editFormData.presentDays,
//           workingDays: editFormData.workingDays,
//           halfDayWorking: editFormData.halfDayWorking,
//           fullDayNotWorking: editFormData.fullDayNotWorking,
//           weekOffDays: weekOffDays,
//           holidays: editFormData.holidays || selectedEmployee.holidayCount || 0
//         })
//       });

//       const result = await response.json();
      
//       if (!response.ok || !result.success) {
//         throw new Error(result.message || "Failed to save changes");
//       }

//       const updatedRecords = records.map(record => {
//         if (record.employeeId === selectedEmployee.employeeId) {
//           const serverSummary = result.summary || {};
//           return {
//             ...record,
//             ...updatedData,
//             extraWork: serverSummary.extraWork || updatedData.extraWork,
//             calculatedSalary: serverSummary.calculatedSalary !== undefined ? serverSummary.calculatedSalary : updatedData.calculatedSalary,
//             presentDays: serverSummary.presentDays !== undefined ? serverSummary.presentDays : record.presentDays,
//             totalWorkingDays: serverSummary.totalWorkingDays !== undefined ? serverSummary.totalWorkingDays : record.totalWorkingDays
//           };
//         }
//         return record;
//       });

//       setRecords(updatedRecords);
//       setFilteredRecords(prev => prev.map(r =>
//         r.employeeId === selectedEmployee.employeeId ? updatedRecords.find(ur => ur.employeeId === selectedEmployee.employeeId) : r
//       ));

//       setShowEditModal(false);
//       alert("Salary details saved successfully!");
//     } catch (error) {
//       console.error("Error saving payroll:", error);
//       alert("Failed to save payroll changes: " + error.message);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setEditFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
//   };

//   const handleExtraWorkChange = (e) => {
//     const { name, value } = e.target;
//     setExtraWorkData(prev => ({
//       ...prev,
//       [name]: name === 'reason' ? value : (parseFloat(value) || 0)
//     }));
//   };

//   const handleReset = () => {
//     if (!selectedEmployee) return;

//     const employeeData = getEmployeeData(selectedEmployee);
//     const leaves = employeeLeaves[selectedEmployee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
//     const weekOffDays = selectedEmployee.weekOffs || 0;

//     const daysInMonth = selectedEmployee.monthDays || monthDays || getDaysInMonth(selectedEmployee.month || selectedMonth);
//     const dailyRate = employeeData.salaryPerMonth / daysInMonth;

//     const workingDays = selectedEmployee.presentDays || 0; 
//     const holidays = selectedEmployee.holidayCount || 0;
//     const compOffData = employeeCompOffs[selectedEmployee.employeeId];
//     const compOffBalance = compOffData?.balance || 0;
    
//     let paidDays = Math.max(0, workingDays + (selectedEmployee.halfDayWorking || 0) * 0.5 + weekOffDays + holidays + compOffBalance);

//     const systemCalculatedSalary = Math.round(paidDays * dailyRate);

//     setEditFormData({
//       ...editFormData,
//       calculatedSalary: systemCalculatedSalary,
//       weekOffDays: weekOffDays,
//     });

//     setExtraWorkData({
//       extraDays: 0,
//       extraHours: 0,
//       overtimeRate: 0,
//       bonus: 0,
//       deductions: 0,
//       reason: "Reset to system calculation"
//     });

//     alert("Values reset to system calculation. Click 'Save Changes' to apply.");
//   };

//   const handleView = (employee) => {
//     setSelectedEmployee(employee);
//     setShowViewModal(true);
//   };

//   const downloadInvoice = async (employee) => {
//     const employeeMonth = employee.month || selectedMonth;
//     const allowed = isPayslipDownloadAllowed(employeeMonth);

//     if (!allowed) {
//       const daysInMonth = getDaysInMonth(employeeMonth);
//       alert(`Payslip download for current month is only allowed on or after the last day of the month (${daysInMonth}th).`);
//       return;
//     }

//     const invoiceContent = generateInvoiceHTML(employee);
//     const printWindow = window.open('', '_blank');
//     if (printWindow) {
//       printWindow.document.write(invoiceContent);
//       printWindow.document.close();
//       printWindow.print();

//       try {
//         const adminName = localStorage.getItem("adminName") || "Admin";
//         const adminId = localStorage.getItem("adminId") || "admin";
//         const adminEmail = localStorage.getItem("adminEmail") || localStorage.getItem("employeeEmail") || "admin@system.com";

//         await axios.post("https://api.timelyhealth.in/user-activity/log", {
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
//       } catch (error) {
//         console.error("Failed to log payslip download:", error);
//       }
//     }
//   };

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

//     const daysInMonth = employee.monthDays || monthDays || getDaysInMonth(employee.month || selectedMonth);
//     const dailyRate = parseFloat(calculateDailyRate(employee)) || 0;
//     const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
//     const compOffData = employeeCompOffs[employee.employeeId] || { earned: 0, used: 0, balance: 0 };

//     const actualWeekOffDays = getWeekOffDaysForDisplay(employee);
//     const presentDays = employee.presentDays ?? 0;
//     const halfDays = employee.halfDayWorking || 0;
//     const holidays = employee.holidayCount || 0;

//     let totalPaidDays = presentDays + (halfDays * 0.5) + actualWeekOffDays + holidays;
//     if (compOffData.balance > 0) totalPaidDays += compOffData.balance;

//     const halfDayDeductionAmount = (halfDays * 0.5) * dailyRate;
//     const totalMonthDays = daysInMonth;
    
//     let lopDays = Math.max(0, totalMonthDays - totalPaidDays);
//     let lopAmount = lopDays * dailyRate;
    
//     lopDays = Math.round(lopDays * 10) / 10;
//     lopAmount = Math.round(lopAmount * 100) / 100;

//     const grossSalary = employeeData.salaryPerMonth || 0;
//     const bonus = employee.extraWork?.bonus || 0;
//     const extraDaysPay = (employee.extraWork?.extraDays || 0) * dailyRate;
//     const compOffPay = compOffData.balance * dailyRate;
//     const totalEarnings = grossSalary + bonus + extraDaysPay + compOffPay;

//     const otherDeductions = employee.extraWork?.deductions || 0;
//     const totalDeductions = lopAmount + halfDayDeductionAmount + otherDeductions;
//     const netPay = totalEarnings - totalDeductions;

//     const grossTotal = employeeData.salaryPerMonth || 0;
//     const masterComponentsSum = (employeeData.basicPay || 0) + (employeeData.hra || 0) + (employeeData.conveyanceAllowance || 0) + 
//                                 (employeeData.medicalAllowance || 0) + (employeeData.performanceAllowance || 0) + (employeeData.specialAllowance || 0);
//     const masterGross = masterComponentsSum > 0 ? masterComponentsSum : 1;
//     const historicalRatio = grossTotal > 0 && masterGross > 0 ? (grossTotal / masterGross) : 1;
    
//     const earningsItems = [];
    
//     const basicAmt = (employeeData.basicPay || 0) * historicalRatio;
//     if (basicAmt > 0) earningsItems.push({ label: 'Basic Salary', amount: basicAmt });
    
//     const hraAmt = (employeeData.hra || 0) * historicalRatio;
//     if (hraAmt > 0) earningsItems.push({ label: 'HRA', amount: hraAmt });
    
//     const convAmt = (employeeData.conveyanceAllowance || 0) * historicalRatio;
//     if (convAmt > 0) earningsItems.push({ label: 'Conveyance Allowance', amount: convAmt });
    
//     const medicalAmt = (employeeData.medicalAllowance || 0) * historicalRatio;
//     if (medicalAmt > 0) earningsItems.push({ label: 'Medical Allowance', amount: medicalAmt });
    
//     const perfAmt = (employeeData.performanceAllowance || 0) * historicalRatio;
//     if (perfAmt > 0) earningsItems.push({ label: 'Performance Allowance', amount: perfAmt });
    
//     const specialAmt = (employeeData.specialAllowance || 0) * historicalRatio;
//     if (specialAmt > 0) earningsItems.push({ label: 'Special Allowance', amount: specialAmt });
    
//     const extraPay = bonus + extraDaysPay;
//     if (extraPay > 0) {
//       earningsItems.push({ label: 'Bonus / Extra Work', amount: extraPay });
//     }
    
//     if (compOffPay > 0) {
//       earningsItems.push({ label: 'Comp-off / Holiday Pay', amount: compOffPay });
//     }
    
//     if (holidays > 0) {
//       earningsItems.push({ label: `Public Holidays (${holidays})`, amount: holidays * dailyRate, isInfo: true });
//     }
    
//     earningsItems.push({ label: `Working Days (Full: ${presentDays})`, amount: 0, isInfo: true });
//     earningsItems.push({ label: `Week Off Days (${actualWeekOffDays})`, amount: 0, isInfo: true });
    
//     const deductionsItems = [];
    
//     if (lopDays > 0) {
//       deductionsItems.push({ label: `LOP / Absent (${lopDays} days)`, amount: lopAmount });
//     } else {
//       deductionsItems.push({ label: `LOP / Absent (0 days)`, amount: 0 });
//     }
    
//     if (halfDays > 0) {
//       deductionsItems.push({ label: `Half Day Deductions (${halfDays} HD)`, amount: halfDayDeductionAmount });
//     } else {
//       deductionsItems.push({ label: `Half Day Deductions (0 HD)`, amount: 0 });
//     }
    
//     const gmcAmt = employee.gmcAmount || employeeData.gmc || 0;
//     const ptaxAmt = employee.ptax || employeeData.profTax || 0;
//     const extraDeductions = otherDeductions + (employee.otherDeductions || 0);
//     let totalOtherDeductions = gmcAmt + ptaxAmt + extraDeductions;
    
//     deductionsItems.push({ label: `Other Deductions`, amount: totalOtherDeductions });
    
//     const totalEarningsAmt = earningsItems.filter(item => !item.isInfo).reduce((sum, item) => sum + item.amount, 0);
//     const totalDeductionsAmt = deductionsItems.reduce((sum, item) => sum + item.amount, 0);
//     const finalNetPay = totalEarningsAmt - totalDeductionsAmt;
    
//     let tableRowsHTML = '';
//     const maxRows = Math.max(earningsItems.length, deductionsItems.length);
//     for (let i = 0; i < maxRows; i++) {
//       const earn = earningsItems[i];
//       const ded = deductionsItems[i];
      
//       let earnAmountStr = '';
//       if (earn) {
//         if (earn.isInfo) {
//           earnAmountStr = '-';
//         } else {
//           earnAmountStr = `₹${earn.amount.toFixed(2)}`;
//         }
//       }
      
//       let dedAmountStr = '';
//       if (ded) {
//         dedAmountStr = `₹${ded.amount.toFixed(2)}`;
//       }
      
//       tableRowsHTML += `<tr>
//         <td style="border: 1px solid #000; padding: 8px 10px;">${earn ? earn.label : ''}</td>
//         <td style="border: 1px solid #000; padding: 8px 10px; text-align: right;">${earnAmountStr}</td>
//         <td style="border: 1px solid #000; padding: 8px 10px;">${ded ? ded.label : ''}</td>
//         <td style="border: 1px solid #000; padding: 8px 10px; text-align: right;">${dedAmountStr}</td>
//       </tr>`;
//     }
    
//     const numberToWords = (num) => {
//       const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
//       const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
//       if ((num = Math.abs(Math.round(num)).toString()).length > 9) return 'overflow';
//       const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
//       if (!n) return '';
//       let str = '';
//       str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
//       str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
//       str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
//       str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
//       str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Rupees Only' : 'Rupees Only';
//       return str.trim();
//     };

//     return `
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <meta charset="utf-8">
//           <title>Payslip - ${employee.name}</title>
//           <style>
//             @page { size: A4; margin: 0; }
//             body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: white; }
//             .invoice-container { max-width: 210mm; margin: 0 auto; border: 1px solid #000; border-radius: 4px; }
//             table { width: 100%; border-collapse: collapse; }
//             th, td { padding: 6px 8px; border: 1px solid #000; font-size: 12px; vertical-align: top; }
//             .header-cell { border: none; padding: 12px; border-bottom: 1px solid #000; }
//             .section-header { text-align: center; padding: 8px; font-weight: bold; background: #f5f5f5; }
//             .total-row { font-weight: bold; background: #f9f9f9; }
//             .gross-row { font-weight: bold; background: #f0f0f0; }
//             .note-text { font-size: 9px; color: #666; text-align: center; }
//           </style>
//         </head>
//         <body>
//           <div class="invoice-container">
//             <table>
//               <tr>
//                 <td colspan="6" class="header-cell">
//                   <div style="display: flex; align-items: center; justify-content: space-between;">
//                     <div style="width: 200px;">
//                       <img src="${templateConfig.logo}" alt="Logo" style="height: 40px; object-fit: contain;">
//                     </div>
//                     <div style="flex: 1; text-align: center;">
//                       <h2 style="margin: 0; font-size: 16px;">${templateConfig.companyName}</h2>
//                       <p style="margin: 2px 0 0; font-size: 8px;">${templateConfig.address}</p>
//                     </div>
//                     <div style="width: 200px;"></div>
//                   </div>
//                  </td>
//                </tr>
//                <tr><td colspan="6" class="section-header">PAYSLIP ${formatMonthDisplay(employee.month || selectedMonth)}</td></tr>
//                <tr>
//                  <td width="25%"><strong>ID</strong></td><td width="25%">${employee.employeeId || '-'}</td>
//                  <td width="25%"><strong>Joined</strong></td><td width="25%">${employeeData.joiningDate ? new Date(employeeData.joiningDate).toLocaleDateString('en-GB') : '-'}</td>
//                </tr>
//                <tr>
//                  <td><strong>Name</strong></td><td>${employee.name || '-'}</td>
//                  <td><strong>Department</strong></td><td>${employeeData.department || employee.department || '-'}</td>
//                </tr>
//                <tr>
//                  <td><strong>Designation</strong></td><td>${employeeData.designation || employee.designation || '-'}</td>
//                  <td><strong>Month</strong></td><td>${formatMonthDisplay(employee.month || selectedMonth)}</td>
//                </tr>
//                <tr>
//                  <td><strong>Invoice Date</strong></td><td>${new Date().toLocaleDateString('en-GB')}</td>
//                  <td><strong>Total Days</strong></td><td>${daysInMonth} Days</td>
//                </tr>
//                ${(employeeData.panNo) ? `<tr><td colspan="2"><strong>PAN No.:</strong> ${employeeData.panNo}</td><td colspan="2"></td></tr>` : ''}
//                ${(employeeData.pfNo) ? `<tr><td colspan="2"><strong>PF No.:</strong> ${employeeData.pfNo}</td><td colspan="2"></td></tr>` : ''}
//                ${(employeeData.uanNo) ? `<tr><td colspan="2"><strong>UAN No.:</strong> ${employeeData.uanNo}</td><td colspan="2"></td></tr>` : ''}
//                ${(employeeData.branch) ? `<tr><td colspan="2"><strong>Branch:</strong> ${employeeData.branch}</td><td colspan="2"></td></tr>` : ''}
//                ${(employeeData.esicNo) ? `<tr><td colspan="2"><strong>ESIC No.:</strong> ${employeeData.esicNo}</td><td colspan="2"></td></tr>` : ''}
//                ${(employeeData.bankAccount) ? `<tr><td colspan="4"><strong>Bank Account:</strong> ${employeeData.bankAccount}</td></tr>` : ''}
//              </table>
             
//              <table style="border-top: none;">
//                <tr style="background:#f0f0f0;">
//                  <td style="width:40%;"><strong>EARNINGS</strong></td>
//                  <td style="width:10%; text-align:center;"><strong>₹</strong></td>
//                  <td style="width:40%;"><strong>DEDUCTIONS</strong></td>
//                  <td style="width:10%; text-align:center;"><strong>₹</strong></td>
//                </tr>
//                ${tableRowsHTML}
//                <tr class="gross-row">
//                  <td><strong>Gross Earnings</strong></td>
//                  <td style="text-align: right;"><strong>₹${totalEarningsAmt.toFixed(2)}</strong></td>
//                  <td><strong>Total Deductions</strong></td>
//                  <td style="text-align: right;"><strong>₹${totalDeductionsAmt.toFixed(2)}</strong></td>
//                </tr>
//                <tr class="total-row">
//                  <td colspan="2"></td>
//                  <td><strong>NET PAY</strong></td>
//                  <td style="text-align: right;"><strong>₹${finalNetPay.toFixed(2)}</strong></td>
//                </tr>
//                <tr>
//                  <td colspan="4"><strong>Net Payable (In words):</strong> ${numberToWords(finalNetPay)}</td>
//                </tr>
//                <tr>
//                  <td colspan="4" class="note-text">Note: This is a System generated slip and does not require company sign and stamp.</td>
//                </tr>
//              </table>
//           </div>
//         </body>
//       </html>
//     `;
//   };

//   const getLeaveTypes = (employee) => {
//     if (employee.leaveTypes && Object.keys(employee.leaveTypes).length > 0) {
//       const leaveStrings = [];
//       Object.entries(employee.leaveTypes).forEach(([type, count]) => {
//         if (count > 0) leaveStrings.push(`${type.toUpperCase()}: ${count} `);
//       });
//       if (leaveStrings.length > 0) return leaveStrings.join(', ');
//     }

//     const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
//     const leaveStrings = [];

//     if (leaves.CL > 0) leaveStrings.push(`CL: ${leaves.CL} `);
//     if (leaves.SL > 0) leaveStrings.push(`SL: ${leaves.SL} `);
//     if (leaves.EL > 0) leaveStrings.push(`EL: ${leaves.EL} `);
//     if (leaves.COFF > 0) leaveStrings.push(`COFF: ${leaves.COFF} `);
//     if (leaves.LOP > 0) leaveStrings.push(`LOP: ${leaves.LOP} `);
//     if (leaves.Other > 0) leaveStrings.push(`Other: ${leaves.Other} `);

//     return leaveStrings.length > 0 ? leaveStrings.join(', ') : 'No Leaves';
//   };

//   const formatMonthDisplay = (month) => {
//     if (!month) return "Current Month";
//     const [year, monthNum] = month.split('-');
//     const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
//     return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
//   };

//   const AttendancePopupModal = () => {
//     if (!showAttendancePopup) return null;
    
//     const getEmployeeShiftHours = (employeeId) => employeesMasterData[employeeId]?.shiftHours || 8;
//     const getEmployeeWeekOffType = (employeeId) => employeesMasterData[employeeId]?.weekOffType || '0+4';

//     const getAllDatesOfMonth = (month, employeeId) => {
//       if (!month) return [];
//       const [year, monthNum] = month.split('-').map(Number);
//       const startDate = new Date(year, monthNum - 1, 1);
//       const endDate = new Date(year, monthNum, 0);
//       const dates = [];
//       for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//         dates.push(new Date(d));
//       }
//       return dates;
//     };

//     const monthDates = getAllDatesOfMonth(selectedMonth, selectedEmployee?.employeeId);

//     const isLeaveDay = (date, employeeId, employeeLeavesData) => {
//       if (!date || !employeeId) return false;
//       const leaves = employeeLeavesData[employeeId];
//       if (!leaves || !leaves.leaveDetails) return false;
//       const dateStr = date.toLocaleDateString('en-CA');
//       return leaves.leaveDetails.some(leave => {
//         const startDate = new Date(leave.startDate);
//         const endDate = new Date(leave.endDate);
//         const checkDate = new Date(dateStr);
//         return checkDate >= startDate && checkDate <= endDate;
//       });
//     };

//     const shiftHours = getEmployeeShiftHours(selectedEmployee?.employeeId);

//     const attendanceMap = new Map();
//     selectedEmployeeAttendance.forEach(record => {
//       if (record.checkInTime) {
//         const dateKey = new Date(record.checkInTime).toLocaleDateString('en-CA');
//         attendanceMap.set(dateKey, record);
//       }
//     });

//     const getWeekOffDatesForMonth = () => {
//       const datesSet = new Set();
//       if (!selectedEmployee || monthDates.length === 0) return datesSet;
//       const employeeId = selectedEmployee.employeeId;
//       const weekOffType = getEmployeeWeekOffType(employeeId);
      
//       if (weekOffType === 'manual') {
//         return datesSet;
//       }
      
//       const actualCount = selectedEmployee.weekOffs || 0;
//       if (actualCount === 4) {
//         monthDates.forEach(date => {
//           if (date.toLocaleDateString('en-US', { weekday: 'long' }) === 'Sunday') {
//             datesSet.add(date.toLocaleDateString('en-CA'));
//           }
//         });
//         return datesSet;
//       }

//       let countNeeded = actualCount;
//       for (const date of monthDates) {
//         if (countNeeded <= 0) break;
//         const dateKey = date.toLocaleDateString('en-CA');
//         const hasAttendance = attendanceMap.has(dateKey);
//         const isLeave = isLeaveDay(date, employeeId, employeeLeaves);
//         if (!hasAttendance && !isLeave) {
//           datesSet.add(dateKey);
//           countNeeded--;
//         }
//       }
//       return datesSet;
//     };
    
//     const precalculatedWeekOffDates = getWeekOffDatesForMonth();

//     const isWeekOffDay = (date, employeeId) => {
//       if (!date || !employeeId) return false;
//       return precalculatedWeekOffDates.has(date.toLocaleDateString('en-CA'));
//     };

//     let weekOffCount = 0, leaveCount = 0, absentCount = 0, presentCount = 0;

//     monthDates.forEach(date => {
//       const dateKey = date.toLocaleDateString('en-CA');
//       const record = attendanceMap.get(dateKey);
//       const isWO = isWeekOffDay(date, selectedEmployee?.employeeId);
//       const isLV = !isWO && isLeaveDay(date, selectedEmployee?.employeeId, employeeLeaves);
      
//       if (isWO) weekOffCount++;
//       else if (isLV) leaveCount++;
//       else if (!record) absentCount++;
//       else presentCount++;
//     });

//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-white ">
//         <div className="bg-white rounded-lg w-full max-w-7xl mx-4 max-h-[85vh] flex flex-col">
//           <div className="sticky top-0 flex items-center justify-between p-3 bg-white border-b rounded-t-lg">
//             <div>
//               <h2 className="text-lg font-bold text-gray-700">Attendance Records - {selectedEmployee?.name}</h2>
//               <p className="text-xs text-gray-500">ID: {selectedEmployee?.employeeId} | Shift: {shiftHours} hrs/day</p>
//             </div>
//             <button onClick={() => setShowAttendancePopup(false)} className="text-gray-500 hover:text-gray-700">
//               <FaTimes className="w-5 h-5" />
//             </button>
//           </div>
          
//           <div className="flex items-center justify-between px-4 py-2 bg-white border-b">
//             <div className="flex gap-4 text-xs">
//               <span className="font-medium">Total Days: <strong>{monthDates.length}</strong></span>
//               <span className="text-orange-600">Week Off: <strong>{weekOffCount}</strong></span>
//               <span className="text-red-600">Leaves: <strong>{leaveCount}</strong></span>
//               <span className="text-gray-500">Absent: <strong>{absentCount}</strong></span>
//               <span className="text-blue-700">Present: <strong>{presentCount}</strong></span>
//             </div>
//             <div className="flex gap-3 text-xs">
//               <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div><span>Week Off</span></div>
//               <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div><span>Leave</span></div>
//               <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div><span>Absent</span></div>
//               <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-100 border border-green-300 rounded"></div><span>Present</span></div>
//             </div>
//           </div>
          
//           <div className="flex-1 p-2 overflow-y-auto">
//             {attendanceLoading ? (
//               <div className="flex items-center justify-center py-8"><div className="text-center"><div className="w-8 h-8 mx-auto mb-2 border-b-2 border-blue-600 rounded-full animate-spin"></div><p className="text-sm text-gray-500">Loading...</p></div></div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="min-w-full text-sm">
//                   <thead className="sticky top-0 text-gray-900 bg-gradient-to-r from-green-500 to-blue-600">
//                     <tr>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Date</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Day</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">In</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Out</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Hrs</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Type</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {monthDates.map((date) => {
//                       const dateKey = date.toLocaleDateString('en-CA');
//                       const record = attendanceMap.get(dateKey);
//                       const hasAttendance = !!record;
                      
//                       const workHours = record ? calculateWorkHours(record.checkInTime, record.checkOutTime) : null;
                      
//                       const isWeekOff = isWeekOffDay(date, selectedEmployee?.employeeId);
//                       const isLeave = !isWeekOff && isLeaveDay(date, selectedEmployee?.employeeId, employeeLeaves);
                      
//                       const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                      
//                       let bgColor = '';
//                       let dayType = '';
//                       let statusText = '';
                      
//                       if (isWeekOff) {
//                         bgColor = 'bg-orange-50';
//                         dayType = 'Week Off';
//                         statusText = 'Week Off';
//                       } else if (isLeave) {
//                         bgColor = 'bg-red-50';
//                         dayType = 'Leave';
//                         statusText = 'On Leave';
//                       } else if (!hasAttendance) {
//                         bgColor = 'bg-white';
//                         dayType = 'Absent';
//                         statusText = 'Absent';
//                       } else {
//                         bgColor = 'bg-white';
//                         const hoursNum = parseFloat(workHours);
//                         if (hoursNum >= shiftHours * 0.9) dayType = 'Full Day';
//                         else if (hoursNum >= shiftHours * 0.5) dayType = 'Half Day';
//                         else dayType = 'Absent';
//                         statusText = record?.checkOutTime ? 'Completed' : (record?.status === "checked-in" ? 'Active' : 'Unknown');
//                       }
                      
//                       const formatTime = (dateString) => {
//                         if (!dateString) return '-';
//                         return new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
//                       };
                      
//                       return (
//                         <tr key={dateKey} className={`${bgColor} hover: transition-colors`}>
//                           <td className="px-2 py-1 text-xs text-center">{date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
//                           <td className="px-2 py-1 text-xs text-center">{dayName}</td>
//                           <td className="px-2 py-1 text-xs text-center">{!isWeekOff && !isLeave && hasAttendance ? formatTime(record?.checkInTime) : '-'}</td>
//                           <td className="px-2 py-1 text-xs text-center">{!isWeekOff && !isLeave && hasAttendance ? formatTime(record?.checkOutTime) : '-'}</td>
//                           <td className="px-2 py-1 text-xs text-center">{!isWeekOff && !isLeave && hasAttendance && workHours ? `${workHours}h` : '-'}</td>
//                           <td className="px-2 py-1 text-center">
//                             <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
//                               isWeekOff ? 'bg-orange-100 text-orange-700' :
//                               isLeave ? 'bg-red-100 text-red-700' :
//                               !hasAttendance ? 'bg-gray-100 text-gray-500' :
//                               dayType === 'Full Day' ? 'bg-blue-100 text-green-700' :
//                               dayType === 'Half Day' ? 'bg-yellow-100 text-yellow-700' :
//                               'bg-gray-100 text-gray-500'
//                             }`}>{dayType}</span>
//                           </td>
//                           <td className="px-2 py-1 text-xs text-center">{statusText}</td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
          
//           <div className="flex justify-end p-3 bg-white border-t rounded-b-lg">
//             <button onClick={() => setShowAttendancePopup(false)} className="px-4 py-1.5 text-sm text-gray-900 transition duration-200 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg hover:from-green-600 hover:to-blue-700">Close</button>
//           </div>
//         </div>
//       </div>
//     );
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
//           <button onClick={() => fetchData(selectedMonth)} className="px-4 py-2 mt-2 text-gray-900 bg-blue-600 rounded hover:bg-blue-700">Retry</button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-9xl">
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//           <StatCard title="Active Employees" value={filteredRecords.length} icon={FaUserTag} color="border-blue-500" />
//           <StatCard title="Total Salary" value={`₹${filteredRecords.reduce((sum, emp) => sum + (emp.calculatedSalary || 0), 0).toLocaleString()}`} icon={FaBuilding} color="border-green-500" />
//           <StatCard title="Active This Month" value={filteredRecords.filter(emp => !emp.isHistoricalMonth).length} icon={FaCalendarAlt} color="border-purple-500" />
//           <StatCard title="On Leave" value={filteredRecords.filter(emp => (employeeLeaves[emp.employeeId]?.CL > 0 || employeeLeaves[emp.employeeId]?.EL > 0)).length} icon={FaSearch} color="border-red-500" />
//         </div>

//         <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
//           <div className="flex flex-wrap items-center gap-2">
//             <div className="relative flex-1 min-w-[180px]">
//               <FaSearch className="absolute text-sm text-gray-500 transform -translate-y-1/2 left-2 top-1/2" />
//               <input type="text" placeholder="Search by ID or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent" />
//             </div>

//             <div className="relative" ref={departmentFilterRef}>
//               <button onClick={() => setShowDepartmentFilter(!showDepartmentFilter)} className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${filterDepartment ? 'bg-blue-600 text-gray-900 hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`}>
//                 <FaBuilding className="text-xs" /> Dept {filterDepartment && `: ${filterDepartment}`}
//               </button>
//               {showDepartmentFilter && (
//                 <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
//                   <div onClick={() => { setFilterDepartment(''); setShowDepartmentFilter(false); }} className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-blue-50">All Departments</div>
//                   {uniqueDepartments.map(dept => (
//                     <div key={dept} onClick={() => { setFilterDepartment(dept); setShowDepartmentFilter(false); }} className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${filterDepartment === dept ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}>{dept}</div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="relative" ref={designationFilterRef}>
//               <button onClick={() => setShowDesignationFilter(!showDesignationFilter)} className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${filterDesignation ? 'bg-blue-600 text-gray-900 hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`}>
//                 <FaUserTag className="text-xs" /> Desig {filterDesignation && `: ${filterDesignation}`}
//               </button>
//               {showDesignationFilter && (
//                 <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
//                   <div onClick={() => { setFilterDesignation(''); setShowDesignationFilter(false); }} className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-blue-50">All Designations</div>
//                   {uniqueDesignations.map(des => (
//                     <div key={des} onClick={() => { setFilterDesignation(des); setShowDesignationFilter(false); }} className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${filterDesignation === des ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}>{des}</div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="relative w-[130px]">
//               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">From:</span>
//               <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); if (e.target.value && toDate) handleDateRangeFilter(); }} className="w-full pl-12 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent" />
//             </div>

//             <div className="relative w-[130px]">
//               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">To:</span>
//               <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); if (fromDate && e.target.value) handleDateRangeFilter(); }} className="w-full pl-10 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent" />
//             </div>

//             <div className="relative w-[130px]">
//               <FaCalendarAlt className="absolute text-xs text-gray-900 transform -translate-y-1/2 left-2 top-1/2" />
//               <input type="month" value={selectedMonth} onChange={handleMonthChange} className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent" />
//             </div>

//             <button onClick={handleDateRangeFilter} disabled={!fromDate || !toDate} className="h-8 px-3 text-xs font-medium text-gray-900 transition bg-blue-600 rounded-md hover:bg-blue-800 disabled:opacity-50">Apply</button>
//             <button onClick={() => setShowTemplateModal(true)} className="h-8 px-3 text-xs font-medium text-gray-700 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">⚙️ Template</button>
//             <button onClick={() => { const currentMonth = new Date().toISOString().slice(0, 7); setSelectedMonth(currentMonth); fetchData(currentMonth); }} className="h-8 px-3 text-xs font-medium text-gray-700 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Current</button>
//             <button onClick={() => fetchData(selectedMonth)} disabled={isLoadingMonth} className="h-8 px-3 text-xs font-medium text-gray-900 transition bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">{isLoadingMonth ? "⟳" : "⟳ Refresh"}</button>
//             <button onClick={() => navigate("/bank-reports")} className="h-8 px-3 text-xs font-medium text-gray-900 transition bg-blue-600 rounded-md hover:bg-blue-700">Bank Reports</button>
//             {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate || selectedMonth !== new Date().toISOString().slice(0, 7)) && (
//               <button onClick={clearFilters} className="h-8 px-3 text-xs font-medium text-gray-500 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Clear</button>
//             )}
//           </div>
//         </div>

//         {/* Month Info Notice */}
//         {selectedMonth && isCurrentMonth(selectedMonth) && new Date().getDate() < 26 && (
//           <div className="px-3 py-2 mb-3 border-l-4 border-yellow-500 rounded-md shadow-sm bg-yellow-50">
//             <p className="text-xs font-medium text-yellow-700">
//               ⚠️ Current Month (Before 26th) - Week-off will be added after 26th for salary calculation
//             </p>
//           </div>
//         )}
//         {selectedMonth && isCurrentMonth(selectedMonth) && new Date().getDate() >= 26 && (
//           <div className="px-3 py-2 mb-3 border-l-4 border-green-500 rounded-md shadow-sm bg-green-50">
//             <p className="text-xs font-medium text-green-700">
//               ✓ Current Month (After 26th) - Week-off included in salary calculation
//             </p>
//           </div>
//         )}
//         {selectedMonth && isHistoricalMonth(selectedMonth) && (
//           <div className="px-3 py-2 mb-3 border-l-4 border-green-500 rounded-md shadow-sm bg-green-50">
//             <p className="text-xs font-medium text-green-700">
//               ✓ Historical Month - Full salary with week-off included
//             </p>
//           </div>
//         )}

//         <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead className="text-sm text-left text-gray-900 bg-gradient-to-r from-green-500 to-blue-600">
//                 <tr>
//                   <th className="py-2 text-xs text-center">Emp ID</th>
//                   <th className="py-2 text-xs text-center">Name</th>
//                   <th className="py-2 text-xs text-center">Dept</th>
//                   <th className="py-2 text-xs text-center">Desig</th>
//                   <th className="py-2 text-xs text-center">Working</th>
//                   <th className="py-2 text-xs text-center">Present</th>
//                   <th className="py-2 text-xs text-center">Half</th>
//                   <th className="py-2 text-xs text-center">Week Off</th>
//                   <th className="py-2 text-xs text-center">Monthly Salary</th>
//                   <th className="py-2 text-xs text-center">Calculated</th>
//                   <th className="py-2 text-xs text-center">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {currentRecords.map((item, index) => (
//                   <tr key={item.employeeId} onClick={() => handleRowClick(item)} className={`hover:bg-white cursor-pointer transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-white'}`}>
//                     <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">{item.employeeId}</td>
//                     <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">{item.name}</td>
//                     <td className="px-2 py-1.5 text-center text-xs">{item.department}</td>
//                     <td className="px-2 py-1.5 text-center text-xs">{item.designation}</td>
//                     <td className="px-2 py-1.5 text-center text-xs"><span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{item.totalWorkingDays || 0}</span></td>
//                     <td className="px-2 py-1.5 text-center text-xs"><span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs">{item.presentDays || 0}</span></td>
//                     <td className="px-2 py-1.5 text-center text-xs"><span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-xs">{item.halfDayWorking || 0}</span></td>
//                     <td className="px-2 py-1.5 text-center text-xs"><span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded text-xs">{getWeekOffDaysForDisplay(item)}</span></td>
//                     <td className="px-2 py-1.5 text-center text-xs">
//                       <div className="font-medium text-blue-600">₹{(item.salaryPerMonth || 0).toLocaleString()}</div>
//                       {item.currentSalary && item.currentSalary !== item.salaryPerMonth && (
//                         <div className="text-[9px] text-gray-500 line-through">₹{item.currentSalary.toLocaleString()}</div>
//                       )}
//                       {item.historicalEffectiveFrom && item.historicalEffectiveFrom !== item.joinDate && (
//                         <div className="text-[8px] text-blue-600">w.e.f {new Date(item.historicalEffectiveFrom).toLocaleDateString()}</div>
//                       )}
//                     </td>
//                     <td className="px-2 py-1.5 text-center text-xs"><span className="font-bold text-green-700">₹{calculateSalary(item).toLocaleString()}</span></td>
//                     <td className="px-2 py-1.5 text-center" onClick={(e) => e.stopPropagation()}>
//                       <div className="flex justify-center gap-1">
//                         <button onClick={(e) => { e.stopPropagation(); handleView(item); }} className="p-1 text-blue-600 rounded hover:bg-blue-50" title="View"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
//                         <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="p-1 text-blue-700 rounded hover:bg-blue-50" title="Edit"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
//                         <button onClick={(e) => { e.stopPropagation(); downloadInvoice(item); }} disabled={!isPayslipDownloadAllowed(item.month || selectedMonth)} className={`p-1 rounded ${isPayslipDownloadAllowed(item.month || selectedMonth) ? 'text-purple-600 hover:bg-purple-50' : 'text-gray-500 cursor-not-allowed'}`} title="Download"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {filteredRecords.length > 0 && (
//             <div className="flex flex-col items-center justify-between gap-2 px-3 py-2 border-t sm:flex-row">
//               <div className="flex items-center gap-2">
//                 <label className="text-xs text-gray-700">Show:</label>
//                 <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="p-1 text-xs border rounded">
//                   <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
//                 </select>
//               </div>
//               <div className="flex items-center gap-1">
//                 <button onClick={handlePrevious} disabled={currentPage === 1} className={`px-3 py-0.5 text-xs border rounded ${currentPage === 1 ? 'text-gray-500 bg-gray-100' : 'text-blue-600 bg-white hover:bg-blue-50'}`}>Prev</button>
//                 {getPageNumbers().map((page, idx) => (
//                   <button key={idx} onClick={() => typeof page === 'number' && handlePageClick(page)} disabled={page === "..."} className={`px-3 py-0.5 text-xs border rounded ${page === "..." ? 'text-gray-500 bg-white' : currentPage === page ? 'text-gray-900 bg-blue-600' : 'text-blue-600 bg-white hover:bg-blue-50'}`}>{page}</button>
//                 ))}
//                 <button onClick={handleNext} disabled={currentPage === totalPages} className={`px-3 py-0.5 text-xs border rounded ${currentPage === totalPages ? 'text-gray-500 bg-gray-100' : 'text-blue-600 bg-white hover:bg-blue-50'}`}>Next</button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {showViewModal && selectedEmployee && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-white ">
//           <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto">
//             <div className="sticky top-0 z-10 flex items-center justify-between mb-4 bg-white">
//               <h2 className="text-xl font-bold text-gray-700">Employee Details</h2>
//               <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700"><FaTimes size={20} /></button>
//             </div>
//             <div className="flex items-start space-x-4">
//               <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full shrink-0"><span className="text-lg font-semibold text-blue-800">{selectedEmployee.name?.charAt(0) || 'E'}</span></div>
//               <div className="flex flex-col flex-1 space-y-1">
//                 <h3 className="text-lg font-semibold text-gray-700">{selectedEmployee.name}</h3>
//                 <div className="grid grid-cols-2 text-sm text-gray-500 gap-x-6 gap-y-1">
//                   <p><span className="font-medium text-gray-700">ID:</span> {selectedEmployee.employeeId}</p>
//                   <p><span className="font-medium text-gray-700">Department:</span> {selectedEmployee.department || 'N/A'}</p>
//                   <p><span className="font-medium text-gray-700">Designation:</span> {selectedEmployee.designation || 'N/A'}</p>
//                   <p><span className="font-medium text-gray-700">Month:</span> {selectedEmployee.month || selectedMonth} ({selectedEmployee.monthDays || monthDays} days)</p>
//                 </div>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 mt-4 mb-4 text-sm sm:grid-cols-2 gap-x-10 gap-y-2">
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Present Days</span><span className="font-semibold text-blue-700">{selectedEmployee.presentDays || 0}</span></div>
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Working Days</span><span className="font-semibold text-blue-600">{selectedEmployee.totalWorkingDays || 0}</span></div>
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Half Days</span><span className="font-semibold text-yellow-600">{selectedEmployee.halfDayWorking || 0}</span></div>
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">WeekOff Days</span><span className="font-semibold text-purple-600">{getWeekOffDaysForDisplay(selectedEmployee)}</span></div>
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Month Days</span><span className="font-semibold text-gray-700">{selectedEmployee.monthDays || monthDays}</span></div>
//               <div className="flex justify-between pb-1 border-b">
//                 <span className="text-gray-500">Monthly Salary</span>
//                 <div className="text-right">
//                   <span className="font-semibold text-blue-600">₹{selectedEmployee.salaryPerMonth || 0}</span>
//                   {selectedEmployee.currentSalary && selectedEmployee.currentSalary !== selectedEmployee.salaryPerMonth && (
//                     <div className="text-[9px] text-gray-500 line-through">₹{selectedEmployee.currentSalary.toLocaleString()}</div>
//                   )}
//                 </div>
//               </div>
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Daily Rate</span><span className="font-semibold text-gray-700">₹{calculateDailyRate(selectedEmployee)}/day</span></div>
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Calculated Salary</span><span className="font-semibold text-blue-700">₹{Math.round(selectedEmployee.calculatedSalary || 0)}</span></div>
//               <div className="flex flex-col pb-2 border-b sm:col-span-2">
//                 <div className="flex justify-between mb-2"><span className="font-medium text-gray-500">Approved Leaves</span><span className="font-semibold text-red-600">{getLeaveTypes(selectedEmployee) || "0"}</span></div>
//               </div>
//             </div>
//             <div className="flex justify-end space-x-3">
//               <button onClick={() => downloadInvoice(selectedEmployee)} disabled={!isPayslipDownloadAllowed(selectedEmployee.month || selectedMonth)} className={`px-6 py-2 rounded-lg transition duration-200 ${isPayslipDownloadAllowed(selectedEmployee.month || selectedMonth) ? 'bg-purple-500 text-gray-900 hover:bg-purple-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Download Payslip</button>
//               <button onClick={() => setShowViewModal(false)} className="px-6 py-2 text-gray-900 transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-600">Close</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {showEditModal && selectedEmployee && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-white ">
//           <div className="bg-white rounded-lg p-4 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
//             <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-bold">Edit Salary - {selectedEmployee.name}</h2><button onClick={() => setShowEditModal(false)} className="text-gray-500"><FaTimes /></button></div>
//             <form onSubmit={handleEditSubmit} className="space-y-3">
//               <div><label className="block text-xs">Present Days</label><input type="number" name="presentDays" value={editFormData.presentDays || 0} onChange={handleInputChange} className="w-full p-2 text-sm border rounded" /></div>
//               <div><label className="block text-xs">Working Days</label><input type="number" name="workingDays" value={editFormData.workingDays || 0} onChange={handleInputChange} className="w-full p-2 text-sm border rounded" /></div>
//               <div><label className="block text-xs">Half Days</label><input type="number" name="halfDayWorking" value={editFormData.halfDayWorking || 0} onChange={handleInputChange} className="w-full p-2 text-sm border rounded" /></div>
//               <div><label className="block text-xs">Bonus (₹)</label><input type="number" name="bonus" value={extraWorkData.bonus || 0} onChange={handleExtraWorkChange} className="w-full p-2 text-sm border rounded" /></div>
//               <div><label className="block text-xs">Deductions (₹)</label><input type="number" name="deductions" value={extraWorkData.deductions || 0} onChange={handleExtraWorkChange} className="w-full p-2 text-sm border rounded" /></div>
//               <div><label className="block text-xs">Reason</label><input type="text" name="reason" value={extraWorkData.reason || ""} onChange={handleExtraWorkChange} className="w-full p-2 text-sm border rounded" /></div>
//               <div className="flex gap-2 pt-2"><button type="button" onClick={handleReset} className="px-3 py-1 text-sm text-gray-900 bg-yellow-500 rounded">Reset</button><button type="button" onClick={() => setShowEditModal(false)} className="px-3 py-1 text-sm bg-gray-300 rounded">Cancel</button><button type="submit" className="px-3 py-1 text-sm text-gray-900 bg-blue-600 rounded">Save</button></div>
//             </form>
//           </div>
//         </div>
//       )}

//       {showTemplateModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-white ">
//           <div className="w-full max-w-md p-4 bg-white rounded-lg">
//             <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-bold">Edit Template</h2><button onClick={() => setShowTemplateModal(false)}><FaTimes /></button></div>
//             <div className="space-y-3">
//               <div><label className="block text-xs">Company Name</label><input type="text" value={templateConfig.companyName} onChange={(e) => setTemplateConfig({...templateConfig, companyName: e.target.value})} className="w-full p-2 text-sm border rounded" /></div>
//               <div><label className="block text-xs">Address</label><textarea rows="2" value={templateConfig.address} onChange={(e) => setTemplateConfig({...templateConfig, address: e.target.value})} className="w-full p-2 text-sm border rounded"></textarea></div>
//               <div><label className="block text-xs">Logo</label><input type="file" accept="image/*" onChange={handleLogoChange} className="w-full text-sm" /></div>
//               <div className="flex gap-2"><button onClick={() => setShowTemplateModal(false)} className="px-3 py-1 text-sm bg-gray-300 rounded">Cancel</button><button onClick={handleTemplateSave} className="px-3 py-1 text-sm text-gray-900 bg-blue-600 rounded">Save</button></div>
//             </div>
//           </div>
//         </div>
//       )}

//       <AttendancePopupModal />
//     </div>
//   );
// };

// export default PayRoll;


// import axios from "axios";
// import { useCallback, useEffect, useRef, useState } from "react";
// import {
//   FaBuilding,
//   FaCalendarAlt,
//   FaSearch,
//   FaTimes,
//   FaUserTag
// } from "react-icons/fa";

// import { useNavigate } from "react-router-dom";
// import StatCard from "../Components/StatCard";
// import { API_BASE_URL } from "../config";
// import logo from "../Images/Timely-Health-Logo.png";
// import { isEmployeeHidden } from "../utils/employeeStatus";

// const PayRoll = () => {
//   const [records, setRecords] = useState([]);
//   const [allEmployees, setAllEmployees] = useState([]);
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
//   const navigate = useNavigate();

//   const [showAttendancePopup, setShowAttendancePopup] = useState(false);
//   const [selectedEmployeeAttendance, setSelectedEmployeeAttendance] = useState([]);
//   const [attendanceLoading, setAttendanceLoading] = useState(false);

//   const [employeeCompOffs, setEmployeeCompOffs] = useState({});
//   const [compOffDetails, setCompOffDetails] = useState({});

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

//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

//   const [filterDepartment, setFilterDepartment] = useState("");
//   const [filterDesignation, setFilterDesignation] = useState("");
//   const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
//   const [showDesignationFilter, setShowDesignationFilter] = useState(false);

//   const [uniqueDepartments, setUniqueDepartments] = useState([]);
//   const [uniqueDesignations, setUniqueDesignations] = useState([]);

//   const departmentFilterRef = useRef(null);
//   const designationFilterRef = useRef(null);

//   const [isLoadingMonth, setIsLoadingMonth] = useState(false);
//   const [monthDays, setMonthDays] = useState(30);
//   const [includeOTPayment, setIncludeOTPayment] = useState(false);
//   const [showOTModal, setShowOTModal] = useState(false);
//   const [selectedOTEmployees, setSelectedOTEmployees] = useState(new Set());
//   const [weekOffConfig, setWeekOffConfig] = useState({
//     weekOffDay: "",
//     weekOffType: "0+4",
//     manualDays: ""
//   });

//   const [itemsPerPage, setItemsPerPage] = useState(10);

//   const [showTemplateModal, setShowTemplateModal] = useState(false);
//   const [templateConfig, setTemplateConfig] = useState({
//     companyName: "Timely Health Tech Pvt Ltd",
//     address: "H. No: 1-98/9/25/p, # 301, 3rd Floor, Sri Sai Balaji Avenue,\nArunodaya Colony, Madhapur, Hyderabad, TG - 500081",
//     logo: logo
//   });

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

//   useEffect(() => {
//     const savedTemplate = localStorage.getItem("payrollTemplateConfig");
//     if (savedTemplate) {
//       setTemplateConfig(JSON.parse(savedTemplate));
//     }
//   }, []);

//   const handleTemplateSave = () => {
//     localStorage.setItem("payrollTemplateConfig", JSON.stringify(templateConfig));
//     setShowTemplateModal(false);
//     alert("✅ Template settings saved successfully!");
//   };

//   const handleOTPaymentToggle = (e) => {
//     const isChecked = e.target.checked;
//     setIncludeOTPayment(isChecked);
//     if (isChecked) {
//       const otEmps = new Set();
//       records.forEach(r => {
//         if (r.overTimeHours > 0) otEmps.add(r.employeeId);
//       });
//       setSelectedOTEmployees(otEmps);
//       setShowOTModal(true);
//     } else {
//       setSelectedOTEmployees(new Set());
//     }
//   };

//   const handleOTEmployeeSelection = (employeeId) => {
//     const updated = new Set(selectedOTEmployees);
//     if (updated.has(employeeId)) {
//       updated.delete(employeeId);
//     } else {
//       updated.add(employeeId);
//     }
//     setSelectedOTEmployees(updated);
//   };

//   const handleLogoChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setTemplateConfig(prev => ({ ...prev, logo: reader.result }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const ATTENDANCE_SUMMARY_API_URL = `${API_BASE_URL}/attendancesummary/get`;
//   const ATTENDANCE_DETAILS_API_URL = `${API_BASE_URL}/attendance/allattendance`;
//   const LEAVES_API_URL = `${API_BASE_URL}/leaves/leaves?status=approved`;
//   const COMPOFF_API_URL = `${API_BASE_URL}/leaves/comp-offs`;
//   const EMPLOYEES_API_URL = `${API_BASE_URL}/employees/get-employees`;
//   const UPDATE_PAYROLL_API_URL = `${API_BASE_URL}/attendancesummary/updatePayroll`;

//   const getDaysInMonth = (monthStr) => {
//     if (!monthStr) return new Date().getDate();
//     const [year, month] = monthStr.split('-').map(Number);
//     return new Date(year, month, 0).getDate();
//   };

//   const wasEmployeeEmployedInMonth = (employee, monthStr) => {
//     if (!monthStr || !employee.joinDate) return true;
//     const [year, month] = monthStr.split('-').map(Number);
//     const joiningDate = new Date(employee.joinDate);
//     const joiningYear = joiningDate.getFullYear();
//     const joiningMonth = joiningDate.getMonth() + 1;
//     if (joiningYear > year || (joiningYear === year && joiningMonth > month)) return false;
//     return true;
//   };

//   const isCurrentMonth = (month) => {
//     if (!month) return true;
//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth() + 1;
//     const [year, monthNum] = month.split('-').map(Number);
//     return year === currentYear && monthNum === currentMonth;
//   };

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

//   const shouldIncludeWeekOffInSalary = (month) => {
//     if (!month) return false;
    
//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth() + 1;
//     const currentDay = today.getDate();
    
//     const [year, monthNum] = month.split('-').map(Number);
    
//     if (year < currentYear) return true;
//     if (year === currentYear && monthNum < currentMonth) return true;
    
//     if (year === currentYear && monthNum === currentMonth) {
//       return currentDay >= 26;
//     }
    
//     return false;
//   };

//   const isPayslipDownloadAllowed = (month) => {
//     if (!month) return false;
//     if (isHistoricalMonth(month)) return true;
//     if (isCurrentMonth(month)) {
//       const today = new Date();
//       const currentDay = today.getDate();
//       const daysInMonth = getDaysInMonth(month);
//       return currentDay >= daysInMonth;
//     }
//     return true;
//   };

//   const processLeavesData = useCallback((leavesData, selectedMonth) => {
//     const leavesMap = {};
//     const [year, monthNum] = (selectedMonth || new Date().toISOString().slice(0, 7)).split('-').map(Number);
//     const startOfMonth = new Date(year, monthNum - 1, 1);
//     const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);

//     leavesData.forEach(leave => {
//       const employeeId = leave.employeeId;
//       if (!employeeId) return;

//       const leaveStart = new Date(leave.startDate);
//       const leaveEnd = new Date(leave.endDate);

//       const overlapStart = new Date(Math.max(leaveStart, startOfMonth));
//       const overlapEnd = new Date(Math.min(leaveEnd, endOfMonth));
//       const currentMonthDays = overlapStart <= overlapEnd ? Math.ceil(Math.abs(overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1 : 0;

//       const safeStartOfMonth = new Date(startOfMonth);
//       safeStartOfMonth.setDate(startOfMonth.getDate() - 6);
//       const overlapSafeStart = new Date(Math.max(leaveStart, safeStartOfMonth));
//       const inExtendedMonth = overlapSafeStart <= overlapEnd;

//       if (!leavesMap[employeeId]) {
//         leavesMap[employeeId] = {
//           CL: 0,
//           SL: 0,
//           EL: 0,
//           COFF: 0,
//           LOP: 0,
//           Other: 0,
//           leaveDetails: []
//         };
//       }

//       const leaveType = leave.leaveType || 'Other';

//       if (currentMonthDays > 0) {
//         if (leavesMap[employeeId][leaveType] !== undefined) {
//           leavesMap[employeeId][leaveType] += currentMonthDays;
//         } else if (["Casual Leave", "Casual", "casual", "Earned Leave", "Earned", "earned", "Sick Leave", "Sick", "sick", "Comp Off", "comp off"].includes(leaveType)) {
//           const typeMap = { 
//             "Casual Leave": "CL", "Casual": "CL", "casual": "CL", 
//             "Earned Leave": "EL", "Earned": "EL", "earned": "EL", 
//             "Sick Leave": "SL", "Sick": "SL", "sick": "SL", 
//             "Comp Off": "COFF", "comp off": "COFF" 
//           };
//           leavesMap[employeeId][typeMap[leaveType]] += currentMonthDays;
//         } else {
//           leavesMap[employeeId].Other += currentMonthDays;
//         }
//       }

//       if (inExtendedMonth) {
//         leavesMap[employeeId].leaveDetails.push({
//           type: leaveType,
//           startDate: leave.startDate,
//           endDate: leave.endDate,
//           days: Math.ceil(Math.abs(leaveEnd - leaveStart) / (1000 * 60 * 60 * 24)) + 1,
//           reason: leave.reason || '',
//           status: leave.status || 'pending'
//         });
//       }
//     });

//     setEmployeeLeaves(leavesMap);
//     return leavesMap;
//   }, []);

//   const processCompOffData = useCallback(async (selectedMonth, leavesData) => {
//     try {
//       const [year, monthNum] = (selectedMonth || new Date().toISOString().slice(0, 7)).split('-').map(Number);
//       const startOfMonth = new Date(year, monthNum - 1, 1);
//       const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);

//       const response = await axios.get(COMPOFF_API_URL);
//       const compOffs = response.data || [];

//       const compOffMap = {};
//       const compOffDetailsMap = {};

//       for (const co of compOffs) {
//         if (co.status === "approved") {
//           const employeeId = co.employeeId;
//           const workDate = new Date(co.workDate);

//           if (workDate >= startOfMonth && workDate <= endOfMonth) {
//             if (!compOffMap[employeeId]) {
//               compOffMap[employeeId] = { earned: 0, used: 0, balance: 0 };
//               compOffDetailsMap[employeeId] = [];
//             }
//             compOffMap[employeeId].earned += 1;
//             compOffDetailsMap[employeeId].push({
//               type: 'earned',
//               date: co.workDate,
//               reason: co.reason || 'Comp-off earned'
//             });
//           }
//         }
//       }

//       setEmployeeCompOffs(compOffMap);
//       setCompOffDetails(compOffDetailsMap);
//       return compOffMap;

//     } catch (error) {
//       console.error("Error fetching comp-offs:", error);
//       return {};
//     }
//   }, [COMPOFF_API_URL]);

//   const filterInactiveEmployees = useCallback((payrollData, employeesMap) => {
//     if (!Array.isArray(payrollData)) return [];
//     return payrollData.filter(item => {
//       const employeeData = employeesMap[item.employeeId];
//       if (!employeeData) return false;
//       return !isEmployeeHidden(employeeData);
//     });
//   }, []);

//   const filterEmployeesByJoiningDate = useCallback((employees, monthStr) => {
//     if (!monthStr || !employees.length) return employees;
//     return employees.filter(emp => wasEmployeeEmployedInMonth(emp, monthStr));
//   }, []);

//   const extractUniqueValues = (employees) => {
//     const depts = new Set();
//     const designations = new Set();
//     employees.forEach(emp => {
//       if (emp.department) depts.add(emp.department);
//       if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
//     });
//     setUniqueDepartments(Array.from(depts).sort());
//     setUniqueDesignations(Array.from(designations).sort());
//   };

//   const fetchEmployeeAttendance = async (employeeId, month) => {
//     setAttendanceLoading(true);
//     try {
//       let url = `${ATTENDANCE_DETAILS_API_URL}?employeeId=${employeeId}`;
//       if (month) url += `&month=${month}`;
      
//       const response = await fetch(url);
//       const data = await response.json();
      
//       if (data.records && data.records.length > 0) {
//         let filteredByMonth = data.records;
//         if (month) {
//           const [year, monthNum] = month.split('-').map(Number);
//           filteredByMonth = data.records.filter(record => {
//             const recordDate = new Date(record.checkInTime);
//             return recordDate.getFullYear() === year && recordDate.getMonth() + 1 === monthNum;
//           });
//         }
//         const sortedRecords = filteredByMonth.sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime));
//         setSelectedEmployeeAttendance(sortedRecords);
//       } else {
//         setSelectedEmployeeAttendance([]);
//       }
//     } catch (error) {
//       console.error("Error fetching employee attendance:", error);
//       setSelectedEmployeeAttendance([]);
//     } finally {
//       setAttendanceLoading(false);
//     }
//   };

//   const handleRowClick = async (employee) => {
//     setSelectedEmployee(employee);
//     const monthToFetch = selectedMonth || new Date().toISOString().slice(0, 7);
//     await fetchEmployeeAttendance(employee.employeeId, monthToFetch);
//     setShowAttendancePopup(true);
//   };

//   const calculateWorkHours = (checkIn, checkOut) => {
//     if (!checkIn || !checkOut) return null;
//     const checkInTime = new Date(checkIn);
//     const checkOutTime = new Date(checkOut);
//     const diffHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
//     return diffHours.toFixed(1);
//   };

//   // Function to calculate actual week-off days based on 5 present days per week rule
//   const calculateActualWeekOffDays = (employeeId, year, monthNum, attendanceMap, employeeLeavesData, targetWeekOffCount) => {
//     // Find all Sundays in the current month
//     const endDate = new Date(year, monthNum, 0);
//     const sundays = [];
//     for (let d = new Date(year, monthNum - 1, 1); d <= endDate; d.setDate(d.getDate() + 1)) {
//       if (d.getDay() === 0) {
//         sundays.push(new Date(d));
//       }
//     }

//     let earnedWeekOffs = 0;

//     sundays.forEach(sunday => {
//       // For each Sunday, get the 7-day period ending on that Sunday
//       let presentOrLeaveDays = 0;
      
//       for (let i = 6; i >= 0; i--) {
//         const currentDate = new Date(sunday);
//         currentDate.setDate(sunday.getDate() - i);
        
//         // If the date is in the future, assume they will be present so they don't lose weekoffs early in the month
//         const today = new Date();
//         today.setHours(23, 59, 59, 999);
//         if (currentDate > today) {
//            presentOrLeaveDays++;
//            continue;
//         }
        
//         const dateKey = currentDate.toLocaleDateString('en-CA');
//         const hasAttendance = attendanceMap.has(dateKey);
//         const isLeave = isLeaveDayForDate(currentDate, employeeId, employeeLeavesData);
        
//         if (hasAttendance || isLeave) {
//           presentOrLeaveDays++;
//         }
//       }
      
//       // If employee worked 5 or more days in this week, they get 1 week-off
//       if (presentOrLeaveDays >= 5) {
//         earnedWeekOffs++;
//       }
//     });
    
//     // Return earned week offs
//     return earnedWeekOffs;
//   };
  
//   const isLeaveDayForDate = (date, employeeId, employeeLeavesData) => {
//     if (!date || !employeeId) return false;
//     const leaves = employeeLeavesData[employeeId];
//     if (!leaves || !leaves.leaveDetails) return false;
//     const dateStr = date.toLocaleDateString('en-CA');
//     return leaves.leaveDetails.some(leave => {
//       const startDate = new Date(leave.startDate);
//       const endDate = new Date(leave.endDate);
//       const checkDate = new Date(dateStr);
//       return checkDate >= startDate && checkDate <= endDate;
//     });
//   };

//   const fetchData = useCallback(async (month = "") => {
//     let isMounted = true;

//     try {
//       setLoading(true);
//       setError("");

//       const includeWeekOffInSalary = shouldIncludeWeekOffInSalary(month);
//       const isHistorical = isHistoricalMonth(month);
//       const isCurrent = isCurrentMonth(month);

//       const employeesRes = await fetch(EMPLOYEES_API_URL);
//       let employeesDataRaw = employeesRes.ok ? await employeesRes.json() : [];
//       let employeesData = [];
//       if (Array.isArray(employeesDataRaw)) {
//         employeesData = employeesDataRaw;
//       } else if (employeesDataRaw && Array.isArray(employeesDataRaw.data)) {
//         employeesData = employeesDataRaw.data;
//       }
      
//       const leavesRes = await fetch(LEAVES_API_URL);
//       let leavesData = leavesRes.ok ? await leavesRes.json() : [];
      
//       const holidaysRes = await fetch(`${API_BASE_URL}/holidays/all`);
//       let holidaysData = holidaysRes.ok ? await holidaysRes.json() : [];
      
//       let summaryData = [];
//       try {
//         const summaryRes = await fetch(`${ATTENDANCE_SUMMARY_API_URL}${month ? `?month=${month}` : ''}`);
//         if (summaryRes.ok) {
//           const json = await summaryRes.json();
//           summaryData = json.summary || [];
//         }
//       } catch (e) {
//         console.warn("Summary API Error:", e.message);
//       }

//       const employeesForMonth = filterEmployeesByJoiningDate(employeesData, month);
//       const activeEmployees = employeesForMonth.filter(emp => !isEmployeeHidden(emp));
      
//       const employeesMap = {};
//       activeEmployees.forEach(emp => {
//         employeesMap[emp.employeeId] = {
//           salaryPerMonth: emp.salaryPerMonth || 0,
//           shiftHours: emp.shiftHours || 8,
//           weekOffPerMonth: emp.weekOffPerMonth || 0,
//           weekOffDay: emp.weekOffDay || 'Sunday',
//           name: emp.name,
//           employeeId: emp.employeeId,
//           department: emp.department || '',
//           designation: emp.role || emp.designation || '',
//           joiningDate: emp.joinDate || emp.joiningDate || '',
//           bankAccount: emp.bankAccount || emp.bankAccountNo || '',
//           panCard: emp.panCard || emp.panNumber || '',
//           pfNo: emp.pfNumber || emp.pfNo || '',
//           uanNo: emp.uanNumber || emp.uanNo || '',
//           esicNo: emp.esicNumber || emp.esicNo || '',
//           branch: emp.branch || '',
//           weekOffType: emp.weekOffType || '0+4',
//           _id: emp._id,
//           originalSalary: emp.originalSalary || emp.salaryPerMonth,
//           salaryIncrements: emp.salaryIncrements || [],
//           basicPay: emp.basicPay || 0,
//           hra: emp.hra || 0,
//           conveyanceAllowance: emp.conveyanceAllowance || 0,
//           medicalAllowance: emp.medicalAllowance || 0,
//           performanceAllowance: emp.performanceAllowance || 0,
//           specialAllowance: emp.specialAllowance || 0,
//           gmc: emp.gmc || emp.gmcAmount || 0,
//           profTax: emp.ptax || emp.profTax || 0,
//           otherDeductions: emp.otherDeductions || 0
//         };
//       });
      
//       if (isMounted) {
//         setEmployeesMasterData(employeesMap);
//         setAllEmployees(employeesData);
//       }

//       extractUniqueValues(activeEmployees);

//       let holidayCount = 0;
//       if (Array.isArray(holidaysData)) {
//         const [sYear, sMonth] = (month || new Date().toISOString().slice(0, 7)).split('-').map(Number);
//         holidaysData.forEach(h => {
//           if (h.isActive !== false) {
//             const hStartStr = h.fromDate;
//             const hEndStr = h.toDate;
//             if (hStartStr && hStartStr.startsWith(`${sYear}-${String(sMonth).padStart(2, '0')}`) &&
//                 hEndStr && hEndStr.startsWith(`${sYear}-${String(sMonth).padStart(2, '0')}`)) {
//               holidayCount += h.totalDays || 1;
//             } else if (hStartStr && hEndStr) {
//               const hStart = new Date(hStartStr);
//               const hEnd = new Date(hEndStr);
//               const startOfMonth = new Date(sYear, sMonth - 1, 1);
//               const endOfMonth = new Date(sYear, sMonth, 0, 23, 59, 59);
//               const overlapStart = new Date(Math.max(hStart.getTime(), startOfMonth.getTime()));
//               const overlapEnd = new Date(Math.min(hEnd.getTime(), endOfMonth.getTime()));
//               if (overlapStart <= overlapEnd) {
//                 const days = Math.round((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24));
//                 holidayCount += Math.max(1, days);
//               }
//             }
//           }
//         });
//       }

//       const currentLeavesMap = processLeavesData(leavesData, month);
//       const currentCompOffsMap = await processCompOffData(month, leavesData);

//       const [year, monthNum] = (month || new Date().toISOString().slice(0, 7)).split('-').map(Number);
//       const processedSalaries = [];
      
//       for (const emp of activeEmployees) {
//         const summary = summaryData.find(x => x.employeeId === emp.employeeId) || {};
        
//         // Get employee's week-off count from their data
//         let targetWeekOffCount = emp.weekOffPerMonth || 4;
        
//         // Fetch attendance for this employee to calculate actual week-offs
//         let attendanceForEmployee = [];
//         try {
//           const attendanceRes = await fetch(`${ATTENDANCE_DETAILS_API_URL}?employeeId=${emp.employeeId}`);
//           if (attendanceRes.ok) {
//             const attendanceData = await attendanceRes.json();
//             if (attendanceData.records) {
//               const firstDayOfMonth = new Date(year, monthNum - 1, 1);
//               const safeStartDate = new Date(firstDayOfMonth);
//               safeStartDate.setDate(firstDayOfMonth.getDate() - 6);
              
//               attendanceForEmployee = attendanceData.records.filter(record => {
//                 const recordDate = new Date(record.checkInTime);
//                 return recordDate >= safeStartDate && recordDate <= new Date(year, monthNum, 0, 23, 59, 59);
//               });
//             }
//           }
//         } catch (err) {
//           console.warn(`Failed to fetch attendance for ${emp.name}:`, err.message);
//         }
        
//         // Create attendance map
//         const attendanceMapForCalc = new Map();
//         attendanceForEmployee.forEach(record => {
//           if (record.checkInTime) {
//             const dateKey = new Date(record.checkInTime).toLocaleDateString('en-CA');
//             attendanceMapForCalc.set(dateKey, record);
//           }
//         });
        
//         const isMay2026OrLater = year > 2026 || (year === 2026 && monthNum >= 5);
//         let finalWeekOffDays = targetWeekOffCount;

//         if (isMay2026OrLater) {
//             targetWeekOffCount = 4; // Default to 4 from May 2026 onwards
//             // Calculate actual week-off days based on employee's week-off count
//             const actualWeekOffCount = calculateActualWeekOffDays(
//               emp.employeeId, 
//               year, 
//               monthNum, 
//               attendanceMapForCalc, 
//               currentLeavesMap, 
//               targetWeekOffCount
//             );
//             finalWeekOffDays = Math.min(targetWeekOffCount, actualWeekOffCount);
//         } else {
//             // For old months, strictly use the historical value
//             finalWeekOffDays = (summary.weekOffPerMonth !== undefined && summary.weekOffPerMonth !== null) 
//               ? summary.weekOffPerMonth 
//               : targetWeekOffCount;
//         }
        
//         let salaryForMonth = emp.salaryPerMonth || 0;
//         let historicalEffectiveFrom = emp.joinDate;
//         let originalSalary = emp.originalSalary || emp.salaryPerMonth;
//         let incrementDetails = null;
        
//         try {
//           const targetDate = new Date(year, monthNum - 1, 15);
//           const formattedDate = targetDate.toISOString().split('T')[0];
          
//           const salaryRes = await fetch(`${API_BASE_URL}/employees/${emp._id}/salary-for-date?date=${formattedDate}`);
//           if (salaryRes.ok) {
//             const salaryData = await salaryRes.json();
//             if (salaryData.success && salaryData.data) {
//               salaryForMonth = salaryData.data.salaryPerMonth;
//               historicalEffectiveFrom = salaryData.data.effectiveFrom || emp.joinDate;
//               originalSalary = salaryData.data.originalSalary || emp.originalSalary || emp.salaryPerMonth;
//               incrementDetails = salaryData.data.incrementDetails;
//             }
//           }
//         } catch (err) {
//           console.warn(`Failed to fetch salary for ${emp.name}:`, err.message);
//         }
        
//         const daysInMonthValue = getDaysInMonth(month || new Date().toISOString().slice(0, 7));
//         const dailyRate = salaryForMonth > 0 ? salaryForMonth / daysInMonthValue : 0;
        
//         const presentDaysCount = summary.presentDays ?? 0;
//         const halfDaysCount = summary.halfDayWorking ?? 0;
//         const compOffData = currentCompOffsMap[emp.employeeId] || { balance: 0 };
        
//         let calculatedSalary = 0;
//         if (salaryForMonth > 0 && daysInMonthValue > 0) {
//           const effectivePaidDays = presentDaysCount + (halfDaysCount * 0.5) + (includeWeekOffInSalary ? finalWeekOffDays : 0) + holidayCount + compOffData.balance;
//           calculatedSalary = effectivePaidDays * dailyRate;
//         }

//         // Use backend calculated OT directly without any extra frontend calculation
//         let overTimeHoursFromSummary = summary.overTimeHours || 0;
//         let finalOTHours = 0;
        
//         if (typeof overTimeHoursFromSummary === 'string' && overTimeHoursFromSummary.includes('h')) {
//             const parts = overTimeHoursFromSummary.split(' ');
//             let hrs = 0;
//             let mins = 0;
//             if (parts[0] && parts[0].includes('h')) hrs = parseInt(parts[0].replace('h', ''), 10) || 0;
//             if (parts[1] && parts[1].includes('m')) mins = parseInt(parts[1].replace('m', ''), 10) || 0;
//             else if (parts[0] && parts[0].includes('m') && !parts[0].includes('h')) mins = parseInt(parts[0].replace('m', ''), 10) || 0;
//             finalOTHours = hrs + (mins / 60);
//         } else {
//             finalOTHours = Number(overTimeHoursFromSummary) || 0;
//         }
        
//         // Round to 1 decimal place to display neatly (e.g., 63.8 instead of 63.78)
//         finalOTHours = Number(finalOTHours.toFixed(1));
        
//         processedSalaries.push({
//           employeeId: emp.employeeId,
//           name: emp.name,
//           presentDays: presentDaysCount,
//           workingDays: summary.totalWorkingDays ?? 0,
//           totalWorkingDays: summary.totalWorkingDays ?? 0,
//           halfDayWorking: halfDaysCount,
//           fullDayNotWorking: summary.fullDayNotWorking ?? 0,
//           calculatedSalary: Math.round(calculatedSalary),
//           baseCalculatedSalary: Math.round(calculatedSalary),
//           salaryPerMonth: salaryForMonth,
//           currentSalary: emp.salaryPerMonth,
//           originalSalary: originalSalary,
//           salaryPerDay: dailyRate,
//           weekOffs: finalWeekOffDays,
//           actualWeekOffCount: finalWeekOffDays,
//           targetWeekOffCount: targetWeekOffCount,
//           weekOffDay: emp.weekOffDay || 'Sunday',
//           totalLeaves: 0,
//           month: month || "No Month",
//           monthDays: daysInMonthValue,
//           includeWeekOffInSalary: includeWeekOffInSalary,
//           isHistoricalMonth: isHistorical,
//           isCurrentMonth: isCurrent,
//           department: emp.department || 'N/A',
//           designation: emp.role || emp.designation || 'N/A',
//           compOffEarned: 0,
//           compOffUsed: 0,
//           compOffBalance: 0,
//           holidayCount: holidayCount,
//           historicalEffectiveFrom: historicalEffectiveFrom,
//           incrementDetails: incrementDetails,
//           _id: emp._id,
//           basicPay: emp.basicPay,
//           hra: emp.hra,
//           conveyanceAllowance: emp.conveyanceAllowance,
//           medicalAllowance: emp.medicalAllowance,
//           performanceAllowance: emp.performanceAllowance,
//           specialAllowance: emp.specialAllowance,
//           gmcAmount: emp.gmc,
//           ptax: emp.profTax,
//           otherDeductions: emp.otherDeductions,
//           overTimeHours: finalOTHours,
//           shiftHours: emp.shiftHours || 8
//         });
//       }

//       const activeProcessedSalaries = filterInactiveEmployees(processedSalaries, employeesMap);
      
//       if (isMounted) {
//         setRecords(activeProcessedSalaries);
//         setFilteredRecords(activeProcessedSalaries);
//       }

//     } catch (err) {
//       console.error("ERROR:", err);
//       if (isMounted) setError(err.message);
//     } finally {
//       if (isMounted) {
//         setLoading(false);
//         setIsLoadingMonth(false);
//       }
//     }
//   }, [EMPLOYEES_API_URL, LEAVES_API_URL, API_BASE_URL, ATTENDANCE_SUMMARY_API_URL, ATTENDANCE_DETAILS_API_URL, processLeavesData, filterInactiveEmployees, filterEmployeesByJoiningDate, processCompOffData]);

//   useEffect(() => {
//     if (records.length === 0) return;

//     const processRecordsWithAdditions = (prevRecords) => 
//       prevRecords.map(record => {
//         let newCalculatedSalary = record.baseCalculatedSalary;
//         let otAmount = 0;
//         if (includeOTPayment && record.overTimeHours > 0 && selectedOTEmployees.has(record.employeeId)) {
//             const dailyRate = record.salaryPerDay || 0;
//             const shiftHours = record.shiftHours || 8;
//             const otRatePerHour = dailyRate / shiftHours;
//             otAmount = record.overTimeHours * otRatePerHour;
//             newCalculatedSalary += otAmount;
//         }
//         return {
//           ...record,
//           otAmount: Math.round(otAmount),
//           calculatedSalary: Math.round(newCalculatedSalary)
//         };
//       });

//     setRecords(processRecordsWithAdditions);
//     setFilteredRecords(processRecordsWithAdditions);
//   }, [employeeCompOffs, employeeLeaves, employeesMasterData, monthDays, selectedMonth, includeOTPayment, selectedOTEmployees]);

//   useEffect(() => {
//     fetchData(selectedMonth);
//   }, [fetchData, selectedMonth]);

//   useEffect(() => {
//     let filtered = records.filter(record =>
//       record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       record.employeeId?.toString().includes(searchTerm)
//     );

//     if (filterDepartment) {
//       filtered = filtered.filter(record => record.department === filterDepartment);
//     }

//     if (filterDesignation) {
//       filtered = filtered.filter(record => record.designation === filterDesignation);
//     }

//     setFilteredRecords(filtered);
//     setCurrentPage(1);
//   }, [searchTerm, filterDepartment, filterDesignation, records]);

//   const handleMonthChange = (e) => {
//     const month = e.target.value;
//     setSelectedMonth(month);
//     setFromDate("");
//     setToDate("");
//   };

//   const handleDateRangeFilter = () => {
//     if (!fromDate || !toDate) {
//       alert("Please select both From and To dates");
//       return;
//     }

//     const fromMonth = fromDate.slice(0, 7);
//     const toMonth = toDate.slice(0, 7);

//     if (fromMonth !== toMonth) {
//       alert("Date range must be within the same month");
//       return;
//     }

//     setSelectedMonth(fromMonth);
//     fetchData(fromMonth);
//   };

//   const clearFilters = () => {
//     setSearchTerm("");
//     setFilterDepartment("");
//     setFilterDesignation("");
//     setFromDate("");
//     setToDate("");
//     const currentMonth = new Date().toISOString().slice(0, 7);
//     setSelectedMonth(currentMonth);
//     fetchData(currentMonth);
//   };

//   const handleItemsPerPageChange = (e) => {
//     setItemsPerPage(Number(e.target.value));
//     setCurrentPage(1);
//   };

//   const indexOfLastRecord = currentPage * itemsPerPage;
//   const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;
//   const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
//   const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

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
//     for (let i = 1; i <= totalPages; i++) {
//       if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
//         pageNumbers.push(i);
//       } else if (i === currentPage - 3 || i === currentPage + 3) {
//         pageNumbers.push("...");
//       }
//     }
//     return pageNumbers;
//   };

//   const calculateSalary = (employee) => employee.calculatedSalary || 0;

//   const calculateDailyRate = (employee) => {
//     const salary = employee.salaryPerMonth || 0;
//     if (!salary || salary === 0) return 0;
//     const daysInMonth = employee.monthDays || monthDays || getDaysInMonth(employee.month || selectedMonth);
//     return (salary / daysInMonth).toFixed(2);
//   };

//   const getEmployeeData = (employee) => {
//     const masterData = employeesMasterData[employee.employeeId] || {};
//     return {
//       ...masterData,
//       salaryPerMonth: employee.salaryPerMonth || masterData.salaryPerMonth || 0,
//       masterSalaryPerMonth: masterData.salaryPerMonth || 0,
//       shiftHours: masterData.shiftHours || 8,
//       weekOffPerMonth: employee.weekOffs || masterData.weekOffPerMonth || 0,
//       name: employee.name || masterData.name || '',
//       designation: employee.designation || masterData.designation || '',
//       department: employee.department || masterData.department || '',
//       joiningDate: masterData.joiningDate || '',
//       bankAccount: masterData.bankAccount || '',
//       panNo: masterData.panCard || '',
//       pfNo: masterData.pfNo || '',
//       uanNo: masterData.uanNo || '',
//       esicNo: masterData.esicNo || '',
//       branch: masterData.branch || '',
//       employeeId: employee.employeeId,
//       weekOffDay: masterData.weekOffDay || '',
//       weekOffType: masterData.weekOffType || '0+4',
//       status: employee.status || masterData.status || 'active',
//       basicPay: employee.basicPay || masterData.basicPay || 0,
//       hra: employee.hra || masterData.hra || 0,
//       conveyanceAllowance: employee.conveyanceAllowance || masterData.conveyanceAllowance || 0,
//       medicalAllowance: employee.medicalAllowance || masterData.medicalAllowance || 0,
//       performanceAllowance: employee.performanceAllowance || masterData.performanceAllowance || 0,
//       specialAllowance: employee.specialAllowance || masterData.specialAllowance || 0,
//       gmc: employee.gmcAmount || masterData.gmc || 0,
//       profTax: employee.ptax || masterData.profTax || 0,
//       otherDeductions: employee.otherDeductions || masterData.otherDeductions || 0
//     };
//   };

//   const getWeekOffDaysForDisplay = (employee) => employee.weekOffs || 0;

//   const handleEdit = (employee) => {
//     setSelectedEmployee(employee);
//     const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
//     const weekOffDaysForSalary = employee.weekOffs || 0;

//     setEditFormData({
//       presentDays: employee.presentDays || 0,
//       workingDays: employee.totalWorkingDays || 0,
//       halfDayWorking: employee.halfDayWorking || 0,
//       fullDayNotWorking: employee.fullDayNotWorking || 0,
//       calculatedSalary: employee.calculatedSalary || 0,
//       weekOffDays: weekOffDaysForSalary,
//       holidays: employee.holidayCount || 0,
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

//   const handleEditSubmit = async (e) => {
//     e.preventDefault();
//     if (!selectedEmployee) return;

//     const employeeData = getEmployeeData(selectedEmployee);
//     const leaves = employeeLeaves[selectedEmployee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
//     const weekOffDays = editFormData.weekOffDays || 0;
//     const daysInMonth = selectedEmployee.monthDays || monthDays || getDaysInMonth(selectedEmployee.month || selectedMonth);
//     const dailyRate = employeeData.salaryPerMonth / daysInMonth;

//     const workingDays = editFormData.presentDays || 0; 
//     const halfDays = editFormData.halfDayWorking || 0;
//     const holidays = editFormData.holidays || selectedEmployee.holidayCount || 0;
//     const effectiveWorkingDays = workingDays + (0.5 * halfDays);
//     const compOffData = employeeCompOffs[selectedEmployee.employeeId];
//     const compOffBalance = compOffData?.balance || 0;
    
//     const paidDays = Math.max(0, effectiveWorkingDays + weekOffDays + holidays + compOffBalance);
//     let baseSalary = paidDays * dailyRate;

//     const extraDaysAmount = (extraWorkData.extraDays || 0) * dailyRate;
//     const bonus = extraWorkData.bonus || 0;
//     const deductions = extraWorkData.deductions || 0;
//     const totalExtraAmount = extraDaysAmount + bonus - deductions;
//     const finalSalary = baseSalary + totalExtraAmount;

//     const updatedData = {
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

//     try {
//       const response = await fetch(UPDATE_PAYROLL_API_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           employeeId: selectedEmployee.employeeId,
//           month: selectedEmployee.month || selectedMonth,
//           calculatedSalary: Math.round(finalSalary),
//           extraWork: updatedData.extraWork,
//           presentDays: editFormData.presentDays,
//           workingDays: editFormData.workingDays,
//           halfDayWorking: editFormData.halfDayWorking,
//           fullDayNotWorking: editFormData.fullDayNotWorking,
//           weekOffDays: weekOffDays,
//           holidays: editFormData.holidays || selectedEmployee.holidayCount || 0
//         })
//       });

//       const result = await response.json();
      
//       if (!response.ok || !result.success) {
//         throw new Error(result.message || "Failed to save changes");
//       }

//       const updatedRecords = records.map(record => {
//         if (record.employeeId === selectedEmployee.employeeId) {
//           const serverSummary = result.summary || {};
//           return {
//             ...record,
//             ...updatedData,
//             extraWork: serverSummary.extraWork || updatedData.extraWork,
//             calculatedSalary: serverSummary.calculatedSalary !== undefined ? serverSummary.calculatedSalary : updatedData.calculatedSalary,
//             presentDays: serverSummary.presentDays !== undefined ? serverSummary.presentDays : record.presentDays,
//             totalWorkingDays: serverSummary.totalWorkingDays !== undefined ? serverSummary.totalWorkingDays : record.totalWorkingDays
//           };
//         }
//         return record;
//       });

//       setRecords(updatedRecords);
//       setFilteredRecords(prev => prev.map(r =>
//         r.employeeId === selectedEmployee.employeeId ? updatedRecords.find(ur => ur.employeeId === selectedEmployee.employeeId) : r
//       ));

//       setShowEditModal(false);
//       alert("Salary details saved successfully!");
//     } catch (error) {
//       console.error("Error saving payroll:", error);
//       alert("Failed to save payroll changes: " + error.message);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setEditFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
//   };

//   const handleExtraWorkChange = (e) => {
//     const { name, value } = e.target;
//     setExtraWorkData(prev => ({
//       ...prev,
//       [name]: name === 'reason' ? value : (parseFloat(value) || 0)
//     }));
//   };

//   const handleReset = () => {
//     if (!selectedEmployee) return;

//     const employeeData = getEmployeeData(selectedEmployee);
//     const leaves = employeeLeaves[selectedEmployee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
//     const weekOffDays = selectedEmployee.weekOffs || 0;

//     const daysInMonth = selectedEmployee.monthDays || monthDays || getDaysInMonth(selectedEmployee.month || selectedMonth);
//     const dailyRate = employeeData.salaryPerMonth / daysInMonth;

//     const workingDays = selectedEmployee.presentDays || 0; 
//     const holidays = selectedEmployee.holidayCount || 0;
//     const compOffData = employeeCompOffs[selectedEmployee.employeeId];
//     const compOffBalance = compOffData?.balance || 0;
    
//     let paidDays = Math.max(0, workingDays + (selectedEmployee.halfDayWorking || 0) * 0.5 + weekOffDays + holidays + compOffBalance);

//     const systemCalculatedSalary = Math.round(paidDays * dailyRate);

//     setEditFormData({
//       ...editFormData,
//       calculatedSalary: systemCalculatedSalary,
//       weekOffDays: weekOffDays,
//     });

//     setExtraWorkData({
//       extraDays: 0,
//       extraHours: 0,
//       overtimeRate: 0,
//       bonus: 0,
//       deductions: 0,
//       reason: "Reset to system calculation"
//     });

//     alert("Values reset to system calculation. Click 'Save Changes' to apply.");
//   };

//   const handleView = (employee) => {
//     setSelectedEmployee(employee);
//     setShowViewModal(true);
//   };

//   const downloadInvoice = async (employee) => {
//     const employeeMonth = employee.month || selectedMonth;
//     const allowed = isPayslipDownloadAllowed(employeeMonth);

//     if (!allowed) {
//       const daysInMonth = getDaysInMonth(employeeMonth);
//       alert(`Payslip download for current month is only allowed on or after the last day of the month (${daysInMonth}th).`);
//       return;
//     }

//     const invoiceContent = generateInvoiceHTML(employee);
//     const printWindow = window.open('', '_blank');
//     if (printWindow) {
//       printWindow.document.write(invoiceContent);
//       printWindow.document.close();
//       printWindow.print();

//       try {
//         const adminName = localStorage.getItem("adminName") || "Admin";
//         const adminId = localStorage.getItem("adminId") || "admin";
//         const adminEmail = localStorage.getItem("adminEmail") || localStorage.getItem("employeeEmail") || "admin@system.com";

//         await axios.post("https://api.timelyhealth.in/user-activity/log", {
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
//       } catch (error) {
//         console.error("Failed to log payslip download:", error);
//       }
//     }
//   };

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

//     const daysInMonth = employee.monthDays || monthDays || getDaysInMonth(employee.month || selectedMonth);
//     const dailyRate = parseFloat(calculateDailyRate(employee)) || 0;
//     const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
//     const compOffData = employeeCompOffs[employee.employeeId] || { earned: 0, used: 0, balance: 0 };

//     const actualWeekOffDays = getWeekOffDaysForDisplay(employee);
//     const presentDays = employee.presentDays ?? 0;
//     const halfDays = employee.halfDayWorking || 0;
//     const holidays = employee.holidayCount || 0;

//     let totalPaidDays = presentDays + (halfDays * 0.5) + actualWeekOffDays + holidays;
//     if (compOffData.balance > 0) totalPaidDays += compOffData.balance;

//     const halfDayDeductionAmount = (halfDays * 0.5) * dailyRate;
//     const totalMonthDays = daysInMonth;
    
//     let lopDays = Math.max(0, totalMonthDays - totalPaidDays);
//     let lopAmount = lopDays * dailyRate;
    
//     lopDays = Math.round(lopDays * 10) / 10;
//     lopAmount = Math.round(lopAmount * 100) / 100;

//     const grossSalary = employeeData.salaryPerMonth || 0;
//     const bonus = employee.extraWork?.bonus || 0;
//     const extraDaysPay = (employee.extraWork?.extraDays || 0) * dailyRate;
//     const compOffPay = compOffData.balance * dailyRate;
//     const otAmount = employee.otAmount || 0;
//     const totalEarnings = grossSalary + bonus + extraDaysPay + compOffPay + otAmount;

//     const otherDeductions = employee.extraWork?.deductions || 0;
//     const totalDeductions = lopAmount + halfDayDeductionAmount + otherDeductions;
//     const netPay = totalEarnings - totalDeductions;

//     const grossTotal = employeeData.salaryPerMonth || 0;
//     const masterComponentsSum = (employeeData.basicPay || 0) + (employeeData.hra || 0) + (employeeData.conveyanceAllowance || 0) + 
//                                 (employeeData.medicalAllowance || 0) + (employeeData.performanceAllowance || 0) + (employeeData.specialAllowance || 0);
//     const masterGross = masterComponentsSum > 0 ? masterComponentsSum : 1;
//     const historicalRatio = grossTotal > 0 && masterGross > 0 ? (grossTotal / masterGross) : 1;
    
//     const earningsItems = [];
    
//     const basicAmt = (employeeData.basicPay || 0) * historicalRatio;
//     if (basicAmt > 0) earningsItems.push({ label: 'Basic Salary', amount: basicAmt });
    
//     const hraAmt = (employeeData.hra || 0) * historicalRatio;
//     if (hraAmt > 0) earningsItems.push({ label: 'HRA', amount: hraAmt });
    
//     const convAmt = (employeeData.conveyanceAllowance || 0) * historicalRatio;
//     if (convAmt > 0) earningsItems.push({ label: 'Conveyance Allowance', amount: convAmt });
    
//     const medicalAmt = (employeeData.medicalAllowance || 0) * historicalRatio;
//     if (medicalAmt > 0) earningsItems.push({ label: 'Medical Allowance', amount: medicalAmt });
    
//     const perfAmt = (employeeData.performanceAllowance || 0) * historicalRatio;
//     if (perfAmt > 0) earningsItems.push({ label: 'Performance Allowance', amount: perfAmt });
    
//     const specialAmt = (employeeData.specialAllowance || 0) * historicalRatio;
//     if (specialAmt > 0) earningsItems.push({ label: 'Special Allowance', amount: specialAmt });
    
//     const extraPay = bonus + extraDaysPay;
//     if (extraPay > 0) {
//       earningsItems.push({ label: 'Bonus / Extra Work', amount: extraPay });
//     }
    
//     if (otAmount > 0) {
//       earningsItems.push({ label: `Overtime (${employee.overTimeHours?.toFixed(1) || 0} hrs)`, amount: otAmount });
//     }
    
//     if (compOffPay > 0) {
//       earningsItems.push({ label: 'Comp-off / Holiday Pay', amount: compOffPay });
//     }
    
//     if (holidays > 0) {
//       earningsItems.push({ label: `Public Holidays (${holidays})`, amount: holidays * dailyRate, isInfo: true });
//     }
    
//     earningsItems.push({ label: `Working Days (Full: ${presentDays})`, amount: 0, isInfo: true });
//     earningsItems.push({ label: `Week Off Days (${actualWeekOffDays})`, amount: 0, isInfo: true });
    
//     const deductionsItems = [];
    
//     if (lopDays > 0) {
//       deductionsItems.push({ label: `LOP / Absent (${lopDays} days)`, amount: lopAmount });
//     } else {
//       deductionsItems.push({ label: `LOP / Absent (0 days)`, amount: 0 });
//     }
    
//     if (halfDays > 0) {
//       deductionsItems.push({ label: `Half Day Deductions (${halfDays} HD)`, amount: halfDayDeductionAmount });
//     } else {
//       deductionsItems.push({ label: `Half Day Deductions (0 HD)`, amount: 0 });
//     }
    
//     const gmcAmt = employee.gmcAmount || employeeData.gmc || 0;
//     const ptaxAmt = employee.ptax || employeeData.profTax || 0;
//     const extraDeductions = otherDeductions + (employee.otherDeductions || 0);
//     let totalOtherDeductions = gmcAmt + ptaxAmt + extraDeductions;
    
//     deductionsItems.push({ label: `Other Deductions`, amount: totalOtherDeductions });
    
//     const totalEarningsAmt = earningsItems.filter(item => !item.isInfo).reduce((sum, item) => sum + item.amount, 0);
//     const totalDeductionsAmt = deductionsItems.reduce((sum, item) => sum + item.amount, 0);
//     const finalNetPay = totalEarningsAmt - totalDeductionsAmt;
    
//     let tableRowsHTML = '';
//     const maxRows = Math.max(earningsItems.length, deductionsItems.length);
//     for (let i = 0; i < maxRows; i++) {
//       const earn = earningsItems[i];
//       const ded = deductionsItems[i];
      
//       let earnAmountStr = '';
//       if (earn) {
//         if (earn.isInfo) {
//           earnAmountStr = '-';
//         } else {
//           earnAmountStr = `₹${earn.amount.toFixed(2)}`;
//         }
//       }
      
//       let dedAmountStr = '';
//       if (ded) {
//         dedAmountStr = `₹${ded.amount.toFixed(2)}`;
//       }
      
//       tableRowsHTML += `<tr>
//         <td style="border: 1px solid #000; padding: 8px 10px;">${earn ? earn.label : ''}</td>
//         <td style="border: 1px solid #000; padding: 8px 10px; text-align: right;">${earnAmountStr}</td>
//         <td style="border: 1px solid #000; padding: 8px 10px;">${ded ? ded.label : ''}</td>
//         <td style="border: 1px solid #000; padding: 8px 10px; text-align: right;">${dedAmountStr}</td>
//       </tr>`;
//     }
    
//     const numberToWords = (num) => {
//       const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
//       const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
//       if ((num = Math.abs(Math.round(num)).toString()).length > 9) return 'overflow';
//       const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
//       if (!n) return '';
//       let str = '';
//       str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
//       str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
//       str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
//       str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
//       str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Rupees Only' : 'Rupees Only';
//       return str.trim();
//     };

//     return `
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <meta charset="utf-8">
//           <title>Payslip - ${employee.name}</title>
//           <style>
//             @page { size: A4; margin: 0; }
//             body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: white; }
//             .invoice-container { max-width: 210mm; margin: 0 auto; border: 1px solid #000; border-radius: 4px; }
//             table { width: 100%; border-collapse: collapse; }
//             th, td { padding: 6px 8px; border: 1px solid #000; font-size: 12px; vertical-align: top; }
//             .header-cell { border: none; padding: 12px; border-bottom: 1px solid #000; }
//             .section-header { text-align: center; padding: 8px; font-weight: bold; background: #f5f5f5; }
//             .total-row { font-weight: bold; background: #f9f9f9; }
//             .gross-row { font-weight: bold; background: #f0f0f0; }
//             .note-text { font-size: 9px; color: #666; text-align: center; }
//           </style>
//         </head>
//         <body>
//           <div class="invoice-container">
//             <table>
//               <tr>
//                 <td colspan="6" class="header-cell">
//                   <div style="display: flex; align-items: center; justify-content: space-between;">
//                     <div style="width: 200px;">
//                       <img src="${templateConfig.logo}" alt="Logo" style="height: 40px; object-fit: contain;">
//                     </div>
//                     <div style="flex: 1; text-align: center;">
//                       <h2 style="margin: 0; font-size: 16px;">${templateConfig.companyName}</h2>
//                       <p style="margin: 2px 0 0; font-size: 8px;">${templateConfig.address}</p>
//                     </div>
//                     <div style="width: 200px;"></div>
//                   </div>
//                 </td>
//                </tr>
//                <tr><td colspan="6" class="section-header">PAYSLIP ${formatMonthDisplay(employee.month || selectedMonth)}</td></tr>
//                <tr>
//                  <td width="25%"><strong>ID</strong></td><td width="25%">${employee.employeeId || '-'}</td>
//                  <td width="25%"><strong>Joined</strong></td><td width="25%">${employeeData.joiningDate ? new Date(employeeData.joiningDate).toLocaleDateString('en-GB') : '-'}</td>
//                </tr>
//                <tr>
//                  <td><strong>Name</strong></td><td>${employee.name || '-'}</td>
//                  <td><strong>Department</strong></td><td>${employeeData.department || employee.department || '-'}</td>
//                </tr>
//                <tr>
//                  <td><strong>Designation</strong></td><td>${employeeData.designation || employee.designation || '-'}</td>
//                  <td><strong>Month</strong></td><td>${formatMonthDisplay(employee.month || selectedMonth)}</td>
//                </tr>
//                <tr>
//                  <td><strong>Invoice Date</strong></td><td>${new Date().toLocaleDateString('en-GB')}</td>
//                  <td><strong>Total Days</strong></td><td>${daysInMonth} Days</td>
//                </tr>
//                ${(employeeData.panNo) ? `<tr><td colspan="2"><strong>PAN No.:</strong> ${employeeData.panNo}</td><td colspan="2"></td>` : ''}
//                ${(employeeData.pfNo) ? `<tr><td colspan="2"><strong>PF No.:</strong> ${employeeData.pfNo}</td><td colspan="2"></td>` : ''}
//                ${(employeeData.uanNo) ? `<tr><td colspan="2"><strong>UAN No.:</strong> ${employeeData.uanNo}</td><td colspan="2"></td>` : ''}
//                ${(employeeData.branch) ? `<tr><td colspan="2"><strong>Branch:</strong> ${employeeData.branch}</td><td colspan="2"></td>` : ''}
//                ${(employeeData.esicNo) ? `<tr><td colspan="2"><strong>ESIC No.:</strong> ${employeeData.esicNo}</td><td colspan="2"></td>` : ''}
//                ${(employeeData.bankAccount) ? `<tr><td colspan="4"><strong>Bank Account:</strong> ${employeeData.bankAccount}</td>` : ''}
//              </table>
             
//              <table style="border-top: none;">
//                <tr style="background:#f0f0f0;">
//                  <td style="width:40%;"><strong>EARNINGS</strong></td>
//                  <td style="width:10%; text-align:center;"><strong>₹</strong></td>
//                  <td style="width:40%;"><strong>DEDUCTIONS</strong></td>
//                  <td style="width:10%; text-align:center;"><strong>₹</strong></td>
//                </tr>
//                ${tableRowsHTML}
//                <tr class="gross-row">
//                  <td><strong>Gross Earnings</strong></td>
//                  <td style="text-align: right;"><strong>₹${totalEarningsAmt.toFixed(2)}</strong></td>
//                  <td><strong>Total Deductions</strong></td>
//                  <td style="text-align: right;"><strong>₹${totalDeductionsAmt.toFixed(2)}</strong></td>
//                </tr>
//                <tr class="total-row">
//                  <td colspan="2"></td>
//                  <td><strong>NET PAY</strong></td>
//                  <td style="text-align: right;"><strong>₹${finalNetPay.toFixed(2)}</strong></td>
//                </tr>
//                <tr>
//                  <td colspan="4"><strong>Net Payable (In words):</strong> ${numberToWords(finalNetPay)}</td>
//                </tr>
//                <tr>
//                  <td colspan="4" class="note-text">Note: This is a System generated slip and does not require company sign and stamp.</td>
//                </tr>
//               </table>
//           </div>
//         </body>
//       </html>
//     `;
//   };

//   const getLeaveTypes = (employee) => {
//     if (employee.leaveTypes && Object.keys(employee.leaveTypes).length > 0) {
//       const leaveStrings = [];
//       Object.entries(employee.leaveTypes).forEach(([type, count]) => {
//         if (count > 0) leaveStrings.push(`${type.toUpperCase()}: ${count} `);
//       });
//       if (leaveStrings.length > 0) return leaveStrings.join(', ');
//     }

//     const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
//     const leaveStrings = [];

//     if (leaves.CL > 0) leaveStrings.push(`CL: ${leaves.CL} `);
//     if (leaves.SL > 0) leaveStrings.push(`SL: ${leaves.SL} `);
//     if (leaves.EL > 0) leaveStrings.push(`EL: ${leaves.EL} `);
//     if (leaves.COFF > 0) leaveStrings.push(`COFF: ${leaves.COFF} `);
//     if (leaves.LOP > 0) leaveStrings.push(`LOP: ${leaves.LOP} `);
//     if (leaves.Other > 0) leaveStrings.push(`Other: ${leaves.Other} `);

//     return leaveStrings.length > 0 ? leaveStrings.join(', ') : 'No Leaves';
//   };

//   const formatMonthDisplay = (month) => {
//     if (!month) return "Current Month";
//     const [year, monthNum] = month.split('-');
//     const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
//     return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
//   };

//   // Updated AttendancePopupModal with correct week-off logic
//   const AttendancePopupModal = () => {
//     if (!showAttendancePopup) return null;
    
//     const getEmployeeShiftHours = (employeeId) => employeesMasterData[employeeId]?.shiftHours || 8;

//     const getAllDatesOfMonth = (month, employeeId) => {
//       if (!month) return [];
//       const [year, monthNum] = month.split('-').map(Number);
//       const startDate = new Date(year, monthNum - 1, 1);
//       const endDate = new Date(year, monthNum, 0);
//       const dates = [];
//       for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//         dates.push(new Date(d));
//       }
//       return dates;
//     };

//     const monthDates = getAllDatesOfMonth(selectedMonth, selectedEmployee?.employeeId);

//     const isLeaveDay = (date, employeeId, employeeLeavesData) => {
//       if (!date || !employeeId) return false;
//       const leaves = employeeLeavesData[employeeId];
//       if (!leaves || !leaves.leaveDetails) return false;
//       const dateStr = date.toLocaleDateString('en-CA');
//       return leaves.leaveDetails.some(leave => {
//         const startDate = new Date(leave.startDate);
//         const endDate = new Date(leave.endDate);
//         const checkDate = new Date(dateStr);
//         return checkDate >= startDate && checkDate <= endDate;
//       });
//     };

//     const shiftHours = getEmployeeShiftHours(selectedEmployee?.employeeId);

//     const attendanceMap = new Map();
//     selectedEmployeeAttendance.forEach(record => {
//       if (record.checkInTime) {
//         const dateKey = new Date(record.checkInTime).toLocaleDateString('en-CA');
//         attendanceMap.set(dateKey, record);
//       }
//     });

//     // Get the week-off count for this employee from their record
//     const targetWeekOffCount = selectedEmployee?.targetWeekOffCount || selectedEmployee?.weekOffs || 4;
    
//     // Calculate week-off dates based on employee's week-off count
//     const getWeekOffDatesForMonth = () => {
//       const weekOffDatesSet = new Set();
//       if (!selectedEmployee || monthDates.length === 0) return weekOffDatesSet;
      
//       const employeeId = selectedEmployee.employeeId;
      
//       // Case 1: Employee has 4 week-offs - all Sundays are week-offs
//       if (targetWeekOffCount === 4) {
//         monthDates.forEach(date => {
//           if (date.toLocaleDateString('en-US', { weekday: 'long' }) === 'Sunday') {
//             weekOffDatesSet.add(date.toLocaleDateString('en-CA'));
//           }
//         });
//         return weekOffDatesSet;
//       }
      
//       // Case 2: Employee has week-offs less than 4 (like 2)
//       // Find days where employee was absent (no attendance and not a leave)
//       const absentDays = [];
      
//       monthDates.forEach(date => {
//         const dateKey = date.toLocaleDateString('en-CA');
//         const hasAttendance = attendanceMap.has(dateKey);
//         const isLeave = isLeaveDay(date, employeeId, employeeLeaves);
//         // For employees with less than 4 week-offs, Sundays are NOT automatically week-offs
//         const isSunday = date.toLocaleDateString('en-US', { weekday: 'long' }) === 'Sunday';
        
//         if (!hasAttendance && !isLeave && !isSunday) {
//           absentDays.push(date);
//         }
//       });
      
//       // Sort absent days by date
//       absentDays.sort((a, b) => a - b);
      
//       // Take only the first N absent days as week-offs (where N = targetWeekOffCount)
//       const weekOffDaysCount = Math.min(targetWeekOffCount, absentDays.length);
//       for (let i = 0; i < weekOffDaysCount; i++) {
//         weekOffDatesSet.add(absentDays[i].toLocaleDateString('en-CA'));
//       }
      
//       return weekOffDatesSet;
//     };
    
//     const weekOffDatesSet = getWeekOffDatesForMonth();

//     const isWeekOffDay = (date, employeeId) => {
//       if (!date || !employeeId) return false;
//       return weekOffDatesSet.has(date.toLocaleDateString('en-CA'));
//     };

//     let weekOffCount = 0, leaveCount = 0, absentCount = 0, presentCount = 0;

//     monthDates.forEach(date => {
//       const dateKey = date.toLocaleDateString('en-CA');
//       const record = attendanceMap.get(dateKey);
//       const isWO = isWeekOffDay(date, selectedEmployee?.employeeId);
//       const isLV = !isWO && isLeaveDay(date, selectedEmployee?.employeeId, employeeLeaves);
      
//       if (isWO) weekOffCount++;
//       else if (isLV) leaveCount++;
//       else if (!record) absentCount++;
//       else presentCount++;
//     });

//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-white ">
//         <div className="bg-white rounded-lg w-full max-w-7xl mx-4 max-h-[85vh] flex flex-col">
//           <div className="sticky top-0 flex items-center justify-between p-3 bg-white border-b rounded-t-lg">
//             <div>
//               <h2 className="text-lg font-bold text-gray-700">Attendance Records - {selectedEmployee?.name}</h2>
//               <p className="text-xs text-gray-500">ID: {selectedEmployee?.employeeId} | Shift: {shiftHours} hrs/day | Week-offs: {targetWeekOffCount} days</p>
//             </div>
//             <button onClick={() => setShowAttendancePopup(false)} className="text-gray-500 hover:text-gray-700">
//               <FaTimes className="w-5 h-5" />
//             </button>
//           </div>
          
//           <div className="flex items-center justify-between px-4 py-2 bg-white border-b">
//             <div className="flex gap-4 text-xs">
//               <span className="font-medium">Total Days: <strong>{monthDates.length}</strong></span>
//               <span className="text-orange-600">Week Off: <strong>{weekOffCount}</strong></span>
//               <span className="text-red-600">Leaves: <strong>{leaveCount}</strong></span>
//               <span className="text-gray-500">Absent: <strong>{absentCount}</strong></span>
//               <span className="text-blue-700">Present: <strong>{presentCount}</strong></span>
//             </div>
//             <div className="flex gap-3 text-xs">
//               <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div><span>Week Off</span></div>
//               <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div><span>Leave</span></div>
//               <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div><span>Absent</span></div>
//               <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-100 border border-green-300 rounded"></div><span>Present</span></div>
//             </div>
//           </div>
          
//           <div className="flex-1 p-2 overflow-y-auto">
//             {attendanceLoading ? (
//               <div className="flex items-center justify-center py-8"><div className="text-center"><div className="w-8 h-8 mx-auto mb-2 border-b-2 border-blue-600 rounded-full animate-spin"></div><p className="text-sm text-gray-500">Loading...</p></div></div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="min-w-full text-sm">
//                   <thead className="sticky top-0 text-gray-900 bg-gradient-to-r from-green-500 to-blue-600">
//                     <tr>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Date</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Day</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">In</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Out</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Hrs</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Type</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {monthDates.map((date) => {
//                       const dateKey = date.toLocaleDateString('en-CA');
//                       const record = attendanceMap.get(dateKey);
//                       const hasAttendance = !!record;
                      
//                       const workHours = record ? calculateWorkHours(record.checkInTime, record.checkOutTime) : null;
                      
//                       const isWeekOff = isWeekOffDay(date, selectedEmployee?.employeeId);
//                       const isLeave = !isWeekOff && isLeaveDay(date, selectedEmployee?.employeeId, employeeLeaves);
                      
//                       const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                      
//                       let bgColor = '';
//                       let dayType = '';
//                       let statusText = '';
                      
//                       if (isWeekOff) {
//                         bgColor = 'bg-orange-50';
//                         dayType = 'Week Off';
//                         statusText = 'Week Off';
//                       } else if (isLeave) {
//                         bgColor = 'bg-red-50';
//                         dayType = 'Leave';
//                         statusText = 'On Leave';
//                       } else if (!hasAttendance) {
//                         bgColor = 'bg-white';
//                         dayType = 'Absent';
//                         statusText = 'Absent';
//                       } else {
//                         bgColor = 'bg-white';
//                         const hoursNum = parseFloat(workHours);
//                         if (hoursNum >= shiftHours * 0.9) dayType = 'Full Day';
//                         else if (hoursNum >= shiftHours * 0.5) dayType = 'Half Day';
//                         else dayType = 'Absent';
//                         statusText = record?.checkOutTime ? 'Completed' : (record?.status === "checked-in" ? 'Active' : 'Unknown');
//                       }
                      
//                       const formatTime = (dateString) => {
//                         if (!dateString) return '-';
//                         return new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
//                       };
                      
//                       return (
//                         <tr key={dateKey} className={`${bgColor} hover: transition-colors`}>
//                           <td className="px-2 py-1 text-xs text-center">{date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
//                           <td className="px-2 py-1 text-xs text-center">{dayName}</td>
//                           <td className="px-2 py-1 text-xs text-center">{!isWeekOff && !isLeave && hasAttendance ? formatTime(record?.checkInTime) : '-'}</td>
//                           <td className="px-2 py-1 text-xs text-center">{!isWeekOff && !isLeave && hasAttendance ? formatTime(record?.checkOutTime) : '-'}</td>
//                           <td className="px-2 py-1 text-xs text-center">{!isWeekOff && !isLeave && hasAttendance && workHours ? `${workHours}h` : '-'}</td>
//                           <td className="px-2 py-1 text-center">
//                             <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
//                               isWeekOff ? 'bg-orange-100 text-orange-700' :
//                               isLeave ? 'bg-red-100 text-red-700' :
//                               !hasAttendance ? 'bg-gray-100 text-gray-500' :
//                               dayType === 'Full Day' ? 'bg-blue-100 text-green-700' :
//                               dayType === 'Half Day' ? 'bg-yellow-100 text-yellow-700' :
//                               'bg-gray-100 text-gray-500'
//                             }`}>{dayType}</span>
//                           </td>
//                           <td className="px-2 py-1 text-xs text-center">{statusText}</td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
          
//           <div className="flex justify-end p-3 bg-white border-t rounded-b-lg">
//             <button onClick={() => setShowAttendancePopup(false)} className="px-4 py-1.5 text-sm text-gray-900 transition duration-200 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg hover:from-green-600 hover:to-blue-700">Close</button>
//           </div>
//         </div>
//       </div>
//     );
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
//           <button onClick={() => fetchData(selectedMonth)} className="px-4 py-2 mt-2 text-gray-900 bg-blue-600 rounded hover:bg-blue-700">Retry</button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-9xl">
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//           <StatCard title="Active Employees" value={filteredRecords.length} icon={FaUserTag} color="border-blue-500" />
//           <StatCard title="Total Salary" value={`₹${filteredRecords.reduce((sum, emp) => sum + (emp.calculatedSalary || 0), 0).toLocaleString()}`} icon={FaBuilding} color="border-green-500" />
//           <StatCard title="Active This Month" value={filteredRecords.filter(emp => !emp.isHistoricalMonth).length} icon={FaCalendarAlt} color="border-purple-500" />
//           <StatCard title="On Leave" value={filteredRecords.filter(emp => (employeeLeaves[emp.employeeId]?.CL > 0 || employeeLeaves[emp.employeeId]?.EL > 0)).length} icon={FaSearch} color="border-red-500" />
//         </div>

//         <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
//           <div className="flex flex-wrap items-center gap-2">
//             <div className="relative flex-1 min-w-[180px]">
//               <FaSearch className="absolute text-sm text-gray-500 transform -translate-y-1/2 left-2 top-1/2" />
//               <input type="text" placeholder="Search by ID or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent" />
//             </div>

//             <div className="relative" ref={departmentFilterRef}>
//               <button onClick={() => setShowDepartmentFilter(!showDepartmentFilter)} className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${filterDepartment ? 'bg-blue-600 text-gray-900 hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`}>
//                 <FaBuilding className="text-xs" /> Dept {filterDepartment && `: ${filterDepartment}`}
//               </button>
//               {showDepartmentFilter && (
//                 <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
//                   <div onClick={() => { setFilterDepartment(''); setShowDepartmentFilter(false); }} className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-blue-50">All Departments</div>
//                   {uniqueDepartments.map(dept => (
//                     <div key={dept} onClick={() => { setFilterDepartment(dept); setShowDepartmentFilter(false); }} className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${filterDepartment === dept ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}>{dept}</div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="relative" ref={designationFilterRef}>
//               <button onClick={() => setShowDesignationFilter(!showDesignationFilter)} className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${filterDesignation ? 'bg-blue-600 text-gray-900 hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`}>
//                 <FaUserTag className="text-xs" /> Desig {filterDesignation && `: ${filterDesignation}`}
//               </button>
//               {showDesignationFilter && (
//                 <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
//                   <div onClick={() => { setFilterDesignation(''); setShowDesignationFilter(false); }} className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-blue-50">All Designations</div>
//                   {uniqueDesignations.map(des => (
//                     <div key={des} onClick={() => { setFilterDesignation(des); setShowDesignationFilter(false); }} className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${filterDesignation === des ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}>{des}</div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="relative w-[130px]">
//               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">From:</span>
//               <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); if (e.target.value && toDate) handleDateRangeFilter(); }} className="w-full pl-12 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent" />
//             </div>

//             <div className="relative w-[130px]">
//               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">To:</span>
//               <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); if (fromDate && e.target.value) handleDateRangeFilter(); }} className="w-full pl-10 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent" />
//             </div>

//             <div className="relative w-[130px]">
//               <FaCalendarAlt className="absolute text-xs text-gray-900 transform -translate-y-1/2 left-2 top-1/2" />
//               <input type="month" value={selectedMonth} onChange={handleMonthChange} className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent" />
//             </div>

//             <button onClick={handleDateRangeFilter} disabled={!fromDate || !toDate} className="h-8 px-3 text-xs font-medium text-gray-900 transition bg-blue-600 rounded-md hover:bg-blue-800 disabled:opacity-50">Apply</button>
//             <button onClick={() => setShowTemplateModal(true)} className="h-8 px-3 text-xs font-medium text-gray-700 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">⚙️ Template</button>
//             <button onClick={() => { const currentMonth = new Date().toISOString().slice(0, 7); setSelectedMonth(currentMonth); fetchData(currentMonth); }} className="h-8 px-3 text-xs font-medium text-gray-700 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Current</button>
//             <button onClick={() => fetchData(selectedMonth)} disabled={isLoadingMonth} className="h-8 px-3 text-xs font-medium text-gray-900 transition bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">{isLoadingMonth ? "⟳" : "⟳ Refresh"}</button>
//             <button onClick={() => navigate("/bank-reports")} className="h-8 px-3 text-xs font-medium text-gray-900 transition bg-blue-600 rounded-md hover:bg-blue-700">Bank Reports</button>
//             {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate || selectedMonth !== new Date().toISOString().slice(0, 7)) && (
//               <button onClick={clearFilters} className="h-8 px-3 text-xs font-medium text-gray-500 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Clear</button>
//             )}
            
//             <div className="flex items-center ml-auto bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
//               <input 
//                 type="checkbox" 
//                 id="otPaymentToggle" 
//                 checked={includeOTPayment} 
//                 onChange={handleOTPaymentToggle} 
//                 className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
//               />
//               <label htmlFor="otPaymentToggle" className="ml-2 text-xs font-medium text-gray-700 cursor-pointer">
//                 Include OT Payment
//               </label>
//               {includeOTPayment && (
//                 <button onClick={() => setShowOTModal(true)} className="ml-2 text-xs text-blue-600 underline hover:text-blue-800">
//                   Select
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Month Info Notice */}
//         {selectedMonth && isCurrentMonth(selectedMonth) && new Date().getDate() < 26 && (
//           <div className="px-3 py-2 mb-3 border-l-4 border-yellow-500 rounded-md shadow-sm bg-yellow-50">
//             <p className="text-xs font-medium text-yellow-700">
//               ⚠️ Current Month (Before 26th) - Week-off will be added after 26th for salary calculation
//             </p>
//           </div>
//         )}
//         {selectedMonth && isCurrentMonth(selectedMonth) && new Date().getDate() >= 26 && (
//           <div className="px-3 py-2 mb-3 border-l-4 border-green-500 rounded-md shadow-sm bg-green-50">
//             <p className="text-xs font-medium text-green-700">
//               ✓ Current Month (After 26th) - Week-off included in salary calculation
//             </p>
//           </div>
//         )}
//         {selectedMonth && isHistoricalMonth(selectedMonth) && (
//           <div className="px-3 py-2 mb-3 border-l-4 border-green-500 rounded-md shadow-sm bg-green-50">
//             <p className="text-xs font-medium text-green-700">
//               ✓ Historical Month - Full salary with week-off included
//             </p>
//           </div>
//         )}

//         <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead className="text-sm text-left text-gray-900 bg-gradient-to-r from-green-500 to-blue-600">
//                 <tr>
//                   <th className="py-2 text-xs text-center">Emp ID</th>
//                   <th className="py-2 text-xs text-center">Name</th>
//                   <th className="py-2 text-xs text-center">Dept</th>
//                   <th className="py-2 text-xs text-center">Desig</th>
//                   <th className="py-2 text-xs text-center">Working</th>
//                   <th className="py-2 text-xs text-center">Present</th>
//                   <th className="py-2 text-xs text-center">Half</th>
//                   <th className="py-2 text-xs text-center">Week Off</th>
//                   <th className="py-2 text-xs text-center">Monthly Salary</th>
//                   <th className="py-2 text-xs text-center">Calculated</th>
//                   <th className="py-2 text-xs text-center">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {currentRecords.map((item, index) => (
//                   <tr key={item.employeeId} onClick={() => handleRowClick(item)} className={`hover:bg-white cursor-pointer transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-white'}`}>
//                     <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">{item.employeeId}</td>
//                     <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">{item.name}</td>
//                     <td className="px-2 py-1.5 text-center text-xs">{item.department}</td>
//                     <td className="px-2 py-1.5 text-center text-xs">{item.designation}</td>
//                     <td className="px-2 py-1.5 text-center text-xs"><span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{item.totalWorkingDays || 0}</span></td>
//                     <td className="px-2 py-1.5 text-center text-xs"><span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs">{item.presentDays || 0}</span></td>
//                     <td className="px-2 py-1.5 text-center text-xs"><span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-xs">{item.halfDayWorking || 0}</span></td>
//                     <td className="px-2 py-1.5 text-center text-xs"><span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded text-xs">{getWeekOffDaysForDisplay(item)}</span></td>
//                     <td className="px-2 py-1.5 text-center text-xs">
//                       <div className="font-medium text-blue-600">₹{(item.salaryPerMonth || 0).toLocaleString()}</div>
//                       {item.currentSalary && item.currentSalary !== item.salaryPerMonth && (
//                         <div className="text-[9px] text-gray-500 line-through">₹{item.currentSalary.toLocaleString()}</div>
//                       )}
//                       {item.historicalEffectiveFrom && item.historicalEffectiveFrom !== item.joinDate && (
//                         <div className="text-[8px] text-blue-600">w.e.f {new Date(item.historicalEffectiveFrom).toLocaleDateString()}</div>
//                       )}
//                     </td>
//                     <td className="px-2 py-1.5 text-center text-xs"><span className="font-bold text-green-700">₹{calculateSalary(item).toLocaleString()}</span></td>
//                     <td className="px-2 py-1.5 text-center" onClick={(e) => e.stopPropagation()}>
//                       <div className="flex justify-center gap-1">
//                         <button onClick={(e) => { e.stopPropagation(); handleView(item); }} className="p-1 text-blue-600 rounded hover:bg-blue-50" title="View"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
//                         <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="p-1 text-blue-700 rounded hover:bg-blue-50" title="Edit"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
//                         <button onClick={(e) => { e.stopPropagation(); downloadInvoice(item); }} disabled={!isPayslipDownloadAllowed(item.month || selectedMonth)} className={`p-1 rounded ${isPayslipDownloadAllowed(item.month || selectedMonth) ? 'text-purple-600 hover:bg-purple-50' : 'text-gray-500 cursor-not-allowed'}`} title="Download"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {filteredRecords.length > 0 && (
//             <div className="flex flex-col items-center justify-between gap-2 px-3 py-2 border-t sm:flex-row">
//               <div className="flex items-center gap-2">
//                 <label className="text-xs text-gray-700">Show:</label>
//                 <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="p-1 text-xs border rounded">
//                   <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
//                 </select>
//               </div>
//               <div className="flex items-center gap-1">
//                 <button onClick={handlePrevious} disabled={currentPage === 1} className={`px-3 py-0.5 text-xs border rounded ${currentPage === 1 ? 'text-gray-500 bg-gray-100' : 'text-blue-600 bg-white hover:bg-blue-50'}`}>Prev</button>
//                 {getPageNumbers().map((page, idx) => (
//                   <button key={idx} onClick={() => typeof page === 'number' && handlePageClick(page)} disabled={page === "..."} className={`px-3 py-0.5 text-xs border rounded ${page === "..." ? 'text-gray-500 bg-white' : currentPage === page ? 'text-gray-900 bg-blue-600' : 'text-blue-600 bg-white hover:bg-blue-50'}`}>{page}</button>
//                 ))}
//                 <button onClick={handleNext} disabled={currentPage === totalPages} className={`px-3 py-0.5 text-xs border rounded ${currentPage === totalPages ? 'text-gray-500 bg-gray-100' : 'text-blue-600 bg-white hover:bg-blue-50'}`}>Next</button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {showViewModal && selectedEmployee && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-white ">
//           <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto">
//             <div className="sticky top-0 z-10 flex items-center justify-between mb-4 bg-white">
//               <h2 className="text-xl font-bold text-gray-700">Employee Details</h2>
//               <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700"><FaTimes size={20} /></button>
//             </div>
//             <div className="flex items-start space-x-4">
//               <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full shrink-0"><span className="text-lg font-semibold text-blue-800">{selectedEmployee.name?.charAt(0) || 'E'}</span></div>
//               <div className="flex flex-col flex-1 space-y-1">
//                 <h3 className="text-lg font-semibold text-gray-700">{selectedEmployee.name}</h3>
//                 <div className="grid grid-cols-2 text-sm text-gray-500 gap-x-6 gap-y-1">
//                   <p><span className="font-medium text-gray-700">ID:</span> {selectedEmployee.employeeId}</p>
//                   <p><span className="font-medium text-gray-700">Department:</span> {selectedEmployee.department || 'N/A'}</p>
//                   <p><span className="font-medium text-gray-700">Designation:</span> {selectedEmployee.designation || 'N/A'}</p>
//                   <p><span className="font-medium text-gray-700">Month:</span> {selectedEmployee.month || selectedMonth} ({selectedEmployee.monthDays || monthDays} days)</p>
//                 </div>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 mt-4 mb-4 text-sm sm:grid-cols-2 gap-x-10 gap-y-2">
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Present Days</span><span className="font-semibold text-blue-700">{selectedEmployee.presentDays || 0}</span></div>
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Working Days</span><span className="font-semibold text-blue-600">{selectedEmployee.totalWorkingDays || 0}</span></div>
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Half Days</span><span className="font-semibold text-yellow-600">{selectedEmployee.halfDayWorking || 0}</span></div>
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">WeekOff Days</span><span className="font-semibold text-purple-600">{getWeekOffDaysForDisplay(selectedEmployee)}</span></div>
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Month Days</span><span className="font-semibold text-gray-700">{selectedEmployee.monthDays || monthDays}</span></div>
//               <div className="flex justify-between pb-1 border-b">
//                 <span className="text-gray-500">Monthly Salary</span>
//                 <div className="text-right">
//                   <span className="font-semibold text-blue-600">₹{selectedEmployee.salaryPerMonth || 0}</span>
//                   {selectedEmployee.currentSalary && selectedEmployee.currentSalary !== selectedEmployee.salaryPerMonth && (
//                     <div className="text-[9px] text-gray-500 line-through">₹{selectedEmployee.currentSalary.toLocaleString()}</div>
//                   )}
//                 </div>
//               </div>
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Daily Rate</span><span className="font-semibold text-gray-700">₹{calculateDailyRate(selectedEmployee)}/day</span></div>
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Calculated Salary</span><span className="font-semibold text-blue-700">₹{Math.round(selectedEmployee.calculatedSalary || 0)}</span></div>
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">OT Pay ({selectedEmployee.overTimeHours || 0} hrs)</span><span className="font-semibold text-blue-600">₹{selectedEmployee.otAmount || 0}</span></div>
//               <div className="flex flex-col pb-2 border-b sm:col-span-2">
//                 <div className="flex justify-between mb-2"><span className="font-medium text-gray-500">Approved Leaves</span><span className="font-semibold text-red-600">{getLeaveTypes(selectedEmployee) || "0"}</span></div>
//               </div>
//             </div>
//             <div className="flex justify-end space-x-3">
//               <button onClick={() => downloadInvoice(selectedEmployee)} disabled={!isPayslipDownloadAllowed(selectedEmployee.month || selectedMonth)} className={`px-6 py-2 rounded-lg transition duration-200 ${isPayslipDownloadAllowed(selectedEmployee.month || selectedMonth) ? 'bg-purple-500 text-gray-900 hover:bg-purple-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Download Payslip</button>
//               <button onClick={() => setShowViewModal(false)} className="px-6 py-2 text-gray-900 transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-600">Close</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {showEditModal && selectedEmployee && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-white ">
//           <div className="bg-white rounded-lg p-4 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
//             <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-bold">Edit Salary - {selectedEmployee.name}</h2><button onClick={() => setShowEditModal(false)} className="text-gray-500"><FaTimes /></button></div>
//             <form onSubmit={handleEditSubmit} className="space-y-3">
//               <div><label className="block text-xs">Present Days</label><input type="number" name="presentDays" value={editFormData.presentDays || 0} onChange={handleInputChange} className="w-full p-2 text-sm border rounded" /></div>
//               <div><label className="block text-xs">Working Days</label><input type="number" name="workingDays" value={editFormData.workingDays || 0} onChange={handleInputChange} className="w-full p-2 text-sm border rounded" /></div>
//               <div><label className="block text-xs">Half Days</label><input type="number" name="halfDayWorking" value={editFormData.halfDayWorking || 0} onChange={handleInputChange} className="w-full p-2 text-sm border rounded" /></div>
//               <div><label className="block text-xs">Bonus (₹)</label><input type="number" name="bonus" value={extraWorkData.bonus || 0} onChange={handleExtraWorkChange} className="w-full p-2 text-sm border rounded" /></div>
//               <div><label className="block text-xs">Deductions (₹)</label><input type="number" name="deductions" value={extraWorkData.deductions || 0} onChange={handleExtraWorkChange} className="w-full p-2 text-sm border rounded" /></div>
//               <div><label className="block text-xs">Reason</label><input type="text" name="reason" value={extraWorkData.reason || ""} onChange={handleExtraWorkChange} className="w-full p-2 text-sm border rounded" /></div>
//               <div className="flex gap-2 pt-2"><button type="button" onClick={handleReset} className="px-3 py-1 text-sm text-gray-900 bg-yellow-500 rounded">Reset</button><button type="button" onClick={() => setShowEditModal(false)} className="px-3 py-1 text-sm bg-gray-300 rounded">Cancel</button><button type="submit" className="px-3 py-1 text-sm text-gray-900 bg-blue-600 rounded">Save</button></div>
//             </form>
//           </div>
//         </div>
//       )}

//       {showTemplateModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="w-full max-w-md p-4 bg-white rounded-lg">
//             <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-bold">Edit Template</h2><button onClick={() => setShowTemplateModal(false)}><FaTimes /></button></div>
//             <div className="space-y-3">
//               <div><label className="block text-xs">Company Name</label><input type="text" value={templateConfig.companyName} onChange={(e) => setTemplateConfig({...templateConfig, companyName: e.target.value})} className="w-full p-2 text-sm border rounded" /></div>
//               <div><label className="block text-xs">Address</label><textarea rows="2" value={templateConfig.address} onChange={(e) => setTemplateConfig({...templateConfig, address: e.target.value})} className="w-full p-2 text-sm border rounded"></textarea></div>
//               <div><label className="block text-xs">Logo</label><input type="file" accept="image/*" onChange={handleLogoChange} className="w-full text-sm" /></div>
//               <div className="flex gap-2"><button onClick={() => setShowTemplateModal(false)} className="px-3 py-1 text-sm bg-gray-300 rounded">Cancel</button><button onClick={handleTemplateSave} className="px-3 py-1 text-sm text-gray-900 bg-blue-600 rounded">Save</button></div>
//             </div>
//           </div>
//         </div>
//       )}
//       {showOTModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg p-4 w-full max-w-lg max-h-[80vh] flex flex-col">
//             <div className="flex items-center justify-between mb-3">
//               <h2 className="text-lg font-bold">Select Employees for OT Payment</h2>
//               <button onClick={() => setShowOTModal(false)}><FaTimes /></button>
//             </div>
//             <div className="flex-1 pr-2 overflow-y-auto">
//               <table className="w-full text-sm">
//                 <thead className="text-sm text-left text-gray-900 bg-gradient-to-r from-green-500 to-blue-600">
//                   <tr>
//                     <th className="p-2 text-left">Select</th>
//                     <th className="p-2 text-left">Employee ID</th>
//                     <th className="p-2 text-left">Name</th>
//                     <th className="p-2 text-right">OT Hours</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {records.length === 0 ? (
//                     <tr><td colSpan="4" className="p-4 text-center text-gray-500">No employees found.</td></tr>
//                   ) : (
//                     records.map(r => (
//                       <tr key={r.employeeId} className="border-b">
//                         <td className="p-2">
//                           <input 
//                             type="checkbox" 
//                             checked={selectedOTEmployees.has(r.employeeId)}
//                             onChange={() => handleOTEmployeeSelection(r.employeeId)}
//                             className="w-4 h-4 text-blue-600 rounded"
//                           />
//                         </td>
//                         <td className="p-2">{r.employeeId}</td>
//                         <td className="p-2 font-medium">{r.name}</td>
//                         <td className="p-2 font-semibold text-right text-blue-600">{r.overTimeHours.toFixed(1)}</td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//             <div className="flex justify-end mt-4">
//               <button onClick={() => setShowOTModal(false)} className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">Done</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <AttendancePopupModal />
//     </div>
//   );
// };

// export default PayRoll;


// import axios from "axios";
// import { useCallback, useEffect, useRef, useState } from "react";
// import {
//   FaBuilding,
//   FaCalendarAlt,
//   FaSearch,
//   FaTimes,
//   FaUserTag
// } from "react-icons/fa";

// import { useNavigate } from "react-router-dom";
// import StatCard from "../Components/StatCard";
// import { API_BASE_URL } from "../config";
// import logo from "../Images/Timely-Health-Logo.png";
// import { isEmployeeHidden } from "../utils/employeeStatus";

// const PayRoll = () => {
//   const [records, setRecords] = useState([]);
//   const [allEmployees, setAllEmployees] = useState([]);
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
//   const navigate = useNavigate();

//   const [showAttendancePopup, setShowAttendancePopup] = useState(false);
//   const [selectedEmployeeAttendance, setSelectedEmployeeAttendance] = useState([]);
//   const [attendanceLoading, setAttendanceLoading] = useState(false);

//   const [employeeCompOffs, setEmployeeCompOffs] = useState({});
//   const [compOffDetails, setCompOffDetails] = useState({});

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

//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

//   const [filterDepartment, setFilterDepartment] = useState("");
//   const [filterDesignation, setFilterDesignation] = useState("");
//   const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
//   const [showDesignationFilter, setShowDesignationFilter] = useState(false);

//   const [uniqueDepartments, setUniqueDepartments] = useState([]);
//   const [uniqueDesignations, setUniqueDesignations] = useState([]);

//   const departmentFilterRef = useRef(null);
//   const designationFilterRef = useRef(null);

//   const [isLoadingMonth, setIsLoadingMonth] = useState(false);
//   const [monthDays, setMonthDays] = useState(30);
//   const [includeOTPayment, setIncludeOTPayment] = useState(false);
//   const [showOTModal, setShowOTModal] = useState(false);
//   const [selectedOTEmployees, setSelectedOTEmployees] = useState(new Set());
//   const [weekOffConfig, setWeekOffConfig] = useState({
//     weekOffDay: "",
//     weekOffType: "0+4",
//     manualDays: ""
//   });

//   const [itemsPerPage, setItemsPerPage] = useState(10);

//   const [showTemplateModal, setShowTemplateModal] = useState(false);
//   const [templateConfig, setTemplateConfig] = useState({
//     companyName: "Timely Health Tech Pvt Ltd",
//     address: "H. No: 1-98/9/25/p, # 301, 3rd Floor, Sri Sai Balaji Avenue,\nArunodaya Colony, Madhapur, Hyderabad, TG - 500081",
//     logo: logo
//   });

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

//   useEffect(() => {
//     const savedTemplate = localStorage.getItem("payrollTemplateConfig");
//     if (savedTemplate) {
//       setTemplateConfig(JSON.parse(savedTemplate));
//     }
//   }, []);

//   const handleTemplateSave = () => {
//     localStorage.setItem("payrollTemplateConfig", JSON.stringify(templateConfig));
//     setShowTemplateModal(false);
//     alert("✅ Template settings saved successfully!");
//   };

//   const handleOTPaymentToggle = (e) => {
//     const isChecked = e.target.checked;
//     setIncludeOTPayment(isChecked);
//     if (isChecked) {
//       const otEmps = new Set();
//       records.forEach(r => {
//         if (r.overTimeHoursDecimal > 0) otEmps.add(r.employeeId);
//       });
//       setSelectedOTEmployees(otEmps);
//       setShowOTModal(true);
//     } else {
//       setSelectedOTEmployees(new Set());
//     }
//   };

//   const handleOTEmployeeSelection = (employeeId) => {
//     const updated = new Set(selectedOTEmployees);
//     if (updated.has(employeeId)) {
//       updated.delete(employeeId);
//     } else {
//       updated.add(employeeId);
//     }
//     setSelectedOTEmployees(updated);
//   };

//   const handleLogoChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setTemplateConfig(prev => ({ ...prev, logo: reader.result }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const ATTENDANCE_SUMMARY_API_URL = `${API_BASE_URL}/attendancesummary/get`;
//   const ATTENDANCE_DETAILS_API_URL = `${API_BASE_URL}/attendance/allattendance`;
//   const LEAVES_API_URL = `${API_BASE_URL}/leaves/leaves?status=approved`;
//   const COMPOFF_API_URL = `${API_BASE_URL}/leaves/comp-offs`;
//   const EMPLOYEES_API_URL = `${API_BASE_URL}/employees/get-employees`;
//   const UPDATE_PAYROLL_API_URL = `${API_BASE_URL}/attendancesummary/updatePayroll`;

//   const getDaysInMonth = (monthStr) => {
//     if (!monthStr) return new Date().getDate();
//     const [year, month] = monthStr.split('-').map(Number);
//     return new Date(year, month, 0).getDate();
//   };

//   const wasEmployeeEmployedInMonth = (employee, monthStr) => {
//     if (!monthStr || !employee.joinDate) return true;
//     const [year, month] = monthStr.split('-').map(Number);
//     const joiningDate = new Date(employee.joinDate);
//     const joiningYear = joiningDate.getFullYear();
//     const joiningMonth = joiningDate.getMonth() + 1;
//     if (joiningYear > year || (joiningYear === year && joiningMonth > month)) return false;
//     return true;
//   };

//   const isCurrentMonth = (month) => {
//     if (!month) return true;
//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth() + 1;
//     const [year, monthNum] = month.split('-').map(Number);
//     return year === currentYear && monthNum === currentMonth;
//   };

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

//   const shouldIncludeWeekOffInSalary = (month) => {
//     if (!month) return false;
    
//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth() + 1;
//     const currentDay = today.getDate();
    
//     const [year, monthNum] = month.split('-').map(Number);
    
//     if (year < currentYear) return true;
//     if (year === currentYear && monthNum < currentMonth) return true;
    
//     if (year === currentYear && monthNum === currentMonth) {
//       return currentDay >= 26;
//     }
    
//     return false;
//   };

//   const isPayslipDownloadAllowed = (month) => {
//     if (!month) return false;
//     if (isHistoricalMonth(month)) return true;
//     if (isCurrentMonth(month)) {
//       const today = new Date();
//       const currentDay = today.getDate();
//       const daysInMonth = getDaysInMonth(month);
//       return currentDay >= daysInMonth;
//     }
//     return true;
//   };

//   const processLeavesData = useCallback((leavesData, selectedMonth) => {
//     const leavesMap = {};
//     const [year, monthNum] = (selectedMonth || new Date().toISOString().slice(0, 7)).split('-').map(Number);
//     const startOfMonth = new Date(year, monthNum - 1, 1);
//     const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);

//     leavesData.forEach(leave => {
//       const employeeId = leave.employeeId;
//       if (!employeeId) return;

//       const leaveStart = new Date(leave.startDate);
//       const leaveEnd = new Date(leave.endDate);

//       const overlapStart = new Date(Math.max(leaveStart, startOfMonth));
//       const overlapEnd = new Date(Math.min(leaveEnd, endOfMonth));
//       const currentMonthDays = overlapStart <= overlapEnd ? Math.ceil(Math.abs(overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1 : 0;

//       const safeStartOfMonth = new Date(startOfMonth);
//       safeStartOfMonth.setDate(startOfMonth.getDate() - 6);
//       const overlapSafeStart = new Date(Math.max(leaveStart, safeStartOfMonth));
//       const inExtendedMonth = overlapSafeStart <= overlapEnd;

//       if (!leavesMap[employeeId]) {
//         leavesMap[employeeId] = {
//           CL: 0,
//           SL: 0,
//           EL: 0,
//           COFF: 0,
//           LOP: 0,
//           Other: 0,
//           leaveDetails: []
//         };
//       }

//       const leaveType = leave.leaveType || 'Other';

//       if (currentMonthDays > 0) {
//         if (leavesMap[employeeId][leaveType] !== undefined) {
//           leavesMap[employeeId][leaveType] += currentMonthDays;
//         } else if (["Casual Leave", "Casual", "casual", "Earned Leave", "Earned", "earned", "Sick Leave", "Sick", "sick", "Comp Off", "comp off"].includes(leaveType)) {
//           const typeMap = { 
//             "Casual Leave": "CL", "Casual": "CL", "casual": "CL", 
//             "Earned Leave": "EL", "Earned": "EL", "earned": "EL", 
//             "Sick Leave": "SL", "Sick": "SL", "sick": "SL", 
//             "Comp Off": "COFF", "comp off": "COFF" 
//           };
//           leavesMap[employeeId][typeMap[leaveType]] += currentMonthDays;
//         } else {
//           leavesMap[employeeId].Other += currentMonthDays;
//         }
//       }

//       if (inExtendedMonth) {
//         leavesMap[employeeId].leaveDetails.push({
//           type: leaveType,
//           startDate: leave.startDate,
//           endDate: leave.endDate,
//           days: Math.ceil(Math.abs(leaveEnd - leaveStart) / (1000 * 60 * 60 * 24)) + 1,
//           reason: leave.reason || '',
//           status: leave.status || 'pending'
//         });
//       }
//     });

//     setEmployeeLeaves(leavesMap);
//     return leavesMap;
//   }, []);

//   const processCompOffData = useCallback(async (selectedMonth, leavesData) => {
//     try {
//       const [year, monthNum] = (selectedMonth || new Date().toISOString().slice(0, 7)).split('-').map(Number);
//       const startOfMonth = new Date(year, monthNum - 1, 1);
//       const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);

//       const response = await axios.get(COMPOFF_API_URL);
//       const compOffs = response.data || [];

//       const compOffMap = {};
//       const compOffDetailsMap = {};

//       for (const co of compOffs) {
//         if (co.status === "approved") {
//           const employeeId = co.employeeId;
//           const workDate = new Date(co.workDate);

//           if (workDate >= startOfMonth && workDate <= endOfMonth) {
//             if (!compOffMap[employeeId]) {
//               compOffMap[employeeId] = { earned: 0, used: 0, balance: 0 };
//               compOffDetailsMap[employeeId] = [];
//             }
//             compOffMap[employeeId].earned += 1;
//             compOffDetailsMap[employeeId].push({
//               type: 'earned',
//               date: co.workDate,
//               reason: co.reason || 'Comp-off earned'
//             });
//           }
//         }
//       }

//       setEmployeeCompOffs(compOffMap);
//       setCompOffDetails(compOffDetailsMap);
//       return compOffMap;

//     } catch (error) {
//       console.error("Error fetching comp-offs:", error);
//       return {};
//     }
//   }, [COMPOFF_API_URL]);

//   const filterInactiveEmployees = useCallback((payrollData, employeesMap) => {
//     if (!Array.isArray(payrollData)) return [];
//     return payrollData.filter(item => {
//       const employeeData = employeesMap[item.employeeId];
//       if (!employeeData) return false;
//       return !isEmployeeHidden(employeeData);
//     });
//   }, []);

//   const filterEmployeesByJoiningDate = useCallback((employees, monthStr) => {
//     if (!monthStr || !employees.length) return employees;
//     return employees.filter(emp => wasEmployeeEmployedInMonth(emp, monthStr));
//   }, []);

//   const extractUniqueValues = (employees) => {
//     const depts = new Set();
//     const designations = new Set();
//     employees.forEach(emp => {
//       if (emp.department) depts.add(emp.department);
//       if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
//     });
//     setUniqueDepartments(Array.from(depts).sort());
//     setUniqueDesignations(Array.from(designations).sort());
//   };

//   const fetchEmployeeAttendance = async (employeeId, month) => {
//     setAttendanceLoading(true);
//     try {
//       let url = `${ATTENDANCE_DETAILS_API_URL}?employeeId=${employeeId}`;
//       if (month) url += `&month=${month}`;
      
//       const response = await fetch(url);
//       const data = await response.json();
      
//       if (data.records && data.records.length > 0) {
//         let filteredByMonth = data.records;
//         if (month) {
//           const [year, monthNum] = month.split('-').map(Number);
//           filteredByMonth = data.records.filter(record => {
//             const recordDate = new Date(record.checkInTime);
//             return recordDate.getFullYear() === year && recordDate.getMonth() + 1 === monthNum;
//           });
//         }
//         const sortedRecords = filteredByMonth.sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime));
//         setSelectedEmployeeAttendance(sortedRecords);
//       } else {
//         setSelectedEmployeeAttendance([]);
//       }
//     } catch (error) {
//       console.error("Error fetching employee attendance:", error);
//       setSelectedEmployeeAttendance([]);
//     } finally {
//       setAttendanceLoading(false);
//     }
//   };

//   const handleRowClick = async (employee) => {
//     setSelectedEmployee(employee);
//     const monthToFetch = selectedMonth || new Date().toISOString().slice(0, 7);
//     await fetchEmployeeAttendance(employee.employeeId, monthToFetch);
//     setShowAttendancePopup(true);
//   };

//   const calculateWorkHours = (checkIn, checkOut) => {
//     if (!checkIn || !checkOut) return null;
//     const checkInTime = new Date(checkIn);
//     const checkOutTime = new Date(checkOut);
//     const diffHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
//     return diffHours.toFixed(1);
//   };

//   const calculateActualWeekOffDays = (employeeId, year, monthNum, attendanceMap, employeeLeavesData, targetWeekOffCount) => {
//     const endDate = new Date(year, monthNum, 0);
//     const sundays = [];
//     for (let d = new Date(year, monthNum - 1, 1); d <= endDate; d.setDate(d.getDate() + 1)) {
//       if (d.getDay() === 0) {
//         sundays.push(new Date(d));
//       }
//     }

//     let earnedWeekOffs = 0;

//     sundays.forEach(sunday => {
//       let presentOrLeaveDays = 0;
      
//       for (let i = 6; i >= 0; i--) {
//         const currentDate = new Date(sunday);
//         currentDate.setDate(sunday.getDate() - i);
        
//         const today = new Date();
//         today.setHours(23, 59, 59, 999);
//         if (currentDate > today) {
//            presentOrLeaveDays++;
//            continue;
//         }
        
//         const dateKey = currentDate.toLocaleDateString('en-CA');
//         const hasAttendance = attendanceMap.has(dateKey);
//         const isLeave = isLeaveDayForDate(currentDate, employeeId, employeeLeavesData);
        
//         if (hasAttendance || isLeave) {
//           presentOrLeaveDays++;
//         }
//       }
      
//       if (presentOrLeaveDays >= 5) {
//         earnedWeekOffs++;
//       }
//     });
    
//     return earnedWeekOffs;
//   };
  
//   const isLeaveDayForDate = (date, employeeId, employeeLeavesData) => {
//     if (!date || !employeeId) return false;
//     const leaves = employeeLeavesData[employeeId];
//     if (!leaves || !leaves.leaveDetails) return false;
//     const dateStr = date.toLocaleDateString('en-CA');
//     return leaves.leaveDetails.some(leave => {
//       const startDate = new Date(leave.startDate);
//       const endDate = new Date(leave.endDate);
//       const checkDate = new Date(dateStr);
//       return checkDate >= startDate && checkDate <= endDate;
//     });
//   };

//   const formatDecimalHours = (decimalHours) => {
//     if (!decimalHours && decimalHours !== 0) return "0h 0m";
//     const hours = Math.floor(decimalHours);
//     const minutes = Math.round((decimalHours - hours) * 60);
//     if (minutes === 60) {
//       return `${hours + 1}h 0m`;
//     }
//     return `${hours}h ${minutes}m`;
//   };

//   const fetchData = useCallback(async (month = "") => {
//     let isMounted = true;

//     try {
//       setLoading(true);
//       setError("");

//       const includeWeekOffInSalary = shouldIncludeWeekOffInSalary(month);
//       const isHistorical = isHistoricalMonth(month);
//       const isCurrent = isCurrentMonth(month);

//       const employeesRes = await fetch(EMPLOYEES_API_URL);
//       let employeesDataRaw = employeesRes.ok ? await employeesRes.json() : [];
//       let employeesData = [];
//       if (Array.isArray(employeesDataRaw)) {
//         employeesData = employeesDataRaw;
//       } else if (employeesDataRaw && Array.isArray(employeesDataRaw.data)) {
//         employeesData = employeesDataRaw.data;
//       }
      
//       const leavesRes = await fetch(LEAVES_API_URL);
//       let leavesData = leavesRes.ok ? await leavesRes.json() : [];
      
//       const holidaysRes = await fetch(`${API_BASE_URL}/holidays/all`);
//       let holidaysData = holidaysRes.ok ? await holidaysRes.json() : [];
      
//       let summaryData = [];
//       try {
//         const summaryRes = await fetch(`${ATTENDANCE_SUMMARY_API_URL}${month ? `?month=${month}` : ''}`);
//         if (summaryRes.ok) {
//           const json = await summaryRes.json();
//           summaryData = json.summary || [];
//         }
//       } catch (e) {
//         console.warn("Summary API Error:", e.message);
//       }

//       let allAttendanceRecords = [];
//       try {
//         const attResponse = await fetch(`${ATTENDANCE_DETAILS_API_URL}?month=${month || selectedMonth}`);
//         if (attResponse.ok) {
//           const attData = await attResponse.json();
//           allAttendanceRecords = attData.records || [];
//         }
//       } catch (err) {
//         console.warn("Failed to fetch attendance records:", err.message);
//       }

//       let masterShiftsData = [];
//       let shiftsData = [];
//       try {
//         const shiftsRes = await fetch(`${API_BASE_URL}/shifts/master`);
//         if (shiftsRes.ok) {
//           const shiftsResult = await shiftsRes.json();
//           masterShiftsData = shiftsResult.data || [];
//         }
//         const assignmentsRes = await fetch(`${API_BASE_URL}/shifts/assignments`);
//         if (assignmentsRes.ok) {
//           const assignmentsResult = await assignmentsRes.json();
//           shiftsData = assignmentsResult.data || [];
//         }
//       } catch (err) {
//         console.warn("Failed to fetch shifts data:", err.message);
//       }

//       const getEmployeeShiftHours = (employeeId) => {
//         const shiftAssignment = shiftsData.find(s =>
//           s.employeeAssignment?.employeeId === employeeId ||
//           s.employeeId === employeeId
//         );
//         if (!shiftAssignment) return 9;
        
//         const shiftType = shiftAssignment.shiftType;
//         const masterShift = masterShiftsData.find(shift => shift.shiftType === shiftType);
        
//         if (!masterShift) return 9;

//         const [startHour, startMinute] = (masterShift.shiftStartTime || "09:00").split(':').map(Number);
//         const [endHour, endMinute] = (masterShift.shiftEndTime || "18:00").split(':').map(Number);

//         const startMinutes = startHour * 60 + startMinute;
//         let endMinutes = endHour * 60 + endMinute;

//         if (endMinutes <= startMinutes) {
//           endMinutes += 24 * 60;
//         }

//         const totalMinutes = endMinutes - startMinutes;
//         return totalMinutes / 60;
//       };

//       const employeesForMonth = filterEmployeesByJoiningDate(employeesData, month);
//       const activeEmployees = employeesForMonth.filter(emp => !isEmployeeHidden(emp));
      
//       const employeesMap = {};
//       activeEmployees.forEach(emp => {
//         employeesMap[emp.employeeId] = {
//           salaryPerMonth: emp.salaryPerMonth || 0,
//           shiftHours: emp.shiftHours || 8,
//           weekOffPerMonth: emp.weekOffPerMonth || 0,
//           weekOffDay: emp.weekOffDay || 'Sunday',
//           name: emp.name,
//           employeeId: emp.employeeId,
//           department: emp.department || '',
//           designation: emp.role || emp.designation || '',
//           joiningDate: emp.joinDate || emp.joiningDate || '',
//           bankAccount: emp.bankAccount || emp.bankAccountNo || '',
//           panCard: emp.panCard || emp.panNumber || '',
//           pfNo: emp.pfNumber || emp.pfNo || '',
//           uanNo: emp.uanNumber || emp.uanNo || '',
//           esicNo: emp.esicNumber || emp.esicNo || '',
//           branch: emp.branch || '',
//           weekOffType: emp.weekOffType || '0+4',
//           _id: emp._id,
//           originalSalary: emp.originalSalary || emp.salaryPerMonth,
//           salaryIncrements: emp.salaryIncrements || [],
//           basicPay: emp.basicPay || 0,
//           hra: emp.hra || 0,
//           conveyanceAllowance: emp.conveyanceAllowance || 0,
//           medicalAllowance: emp.medicalAllowance || 0,
//           performanceAllowance: emp.performanceAllowance || 0,
//           specialAllowance: emp.specialAllowance || 0,
//           gmc: emp.gmc || emp.gmcAmount || 0,
//           profTax: emp.ptax || emp.profTax || 0,
//           otherDeductions: emp.otherDeductions || 0
//         };
//       });
      
//       if (isMounted) {
//         setEmployeesMasterData(employeesMap);
//         setAllEmployees(employeesData);
//       }

//       extractUniqueValues(activeEmployees);

//       let holidayCount = 0;
//       if (Array.isArray(holidaysData)) {
//         const [sYear, sMonth] = (month || new Date().toISOString().slice(0, 7)).split('-').map(Number);
//         holidaysData.forEach(h => {
//           if (h.isActive !== false) {
//             const hStartStr = h.fromDate;
//             const hEndStr = h.toDate;
//             if (hStartStr && hStartStr.startsWith(`${sYear}-${String(sMonth).padStart(2, '0')}`) &&
//                 hEndStr && hEndStr.startsWith(`${sYear}-${String(sMonth).padStart(2, '0')}`)) {
//               holidayCount += h.totalDays || 1;
//             } else if (hStartStr && hEndStr) {
//               const hStart = new Date(hStartStr);
//               const hEnd = new Date(hEndStr);
//               const startOfMonth = new Date(sYear, sMonth - 1, 1);
//               const endOfMonth = new Date(sYear, sMonth, 0, 23, 59, 59);
//               const overlapStart = new Date(Math.max(hStart.getTime(), startOfMonth.getTime()));
//               const overlapEnd = new Date(Math.min(hEnd.getTime(), endOfMonth.getTime()));
//               if (overlapStart <= overlapEnd) {
//                 const days = Math.round((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24));
//                 holidayCount += Math.max(1, days);
//               }
//             }
//           }
//         });
//       }

//       const currentLeavesMap = processLeavesData(leavesData, month);
//       const currentCompOffsMap = await processCompOffData(month, leavesData);

//       const [year, monthNum] = (month || new Date().toISOString().slice(0, 7)).split('-').map(Number);
//       const processedSalaries = [];
      
//       for (const emp of activeEmployees) {
//         const summary = summaryData.find(x => x.employeeId === emp.employeeId) || {};
        
//         let targetWeekOffCount = emp.weekOffPerMonth || 4;
//         const employeeShiftHours = emp.shiftHours || 8;
        
//         // OT HOURS - DIRECTLY FROM SUMMARY API (EXACT SAME AS SUMMARY PAGE)
//         let overTimeHoursDecimal = 0;
//         let overTimeHoursDisplay = summary.overTimeHours || "0h 0m";
        
//         // Convert to decimal only for OT payment calculation (not for display)
//         if (overTimeHoursDisplay && overTimeHoursDisplay !== "0h 0m") {
//           if (typeof overTimeHoursDisplay === 'string' && overTimeHoursDisplay.includes('h')) {
//             const hoursMatch = overTimeHoursDisplay.match(/(\d+(?:\.\d+)?)\s*h/);
//             const minutesMatch = overTimeHoursDisplay.match(/(\d+(?:\.\d+)?)\s*m/);
//             let hours = hoursMatch ? parseFloat(hoursMatch[1]) : 0;
//             let minutes = minutesMatch ? parseFloat(minutesMatch[1]) : 0;
//             overTimeHoursDecimal = hours + (minutes / 60);
//           } else if (typeof overTimeHoursDisplay === 'number') {
//             overTimeHoursDecimal = overTimeHoursDisplay;
//           } else if (typeof overTimeHoursDisplay === 'string') {
//             overTimeHoursDecimal = parseFloat(overTimeHoursDisplay) || 0;
//           }
//           overTimeHoursDecimal = Math.round(overTimeHoursDecimal * 100) / 100;
//         }
        
//         let attendanceForEmployee = [];
//         try {
//           const attendanceRes = await fetch(`${ATTENDANCE_DETAILS_API_URL}?employeeId=${emp.employeeId}`);
//           if (attendanceRes.ok) {
//             const attendanceData = await attendanceRes.json();
//             if (attendanceData.records) {
//               const firstDayOfMonth = new Date(year, monthNum - 1, 1);
//               const safeStartDate = new Date(firstDayOfMonth);
//               safeStartDate.setDate(firstDayOfMonth.getDate() - 6);
              
//               attendanceForEmployee = attendanceData.records.filter(record => {
//                 const recordDate = new Date(record.checkInTime);
//                 return recordDate >= safeStartDate && recordDate <= new Date(year, monthNum, 0, 23, 59, 59);
//               });
//             }
//           }
//         } catch (err) {
//           console.warn(`Failed to fetch attendance for ${emp.name}:`, err.message);
//         }
        
//         const attendanceMapForCalc = new Map();
//         let dynamicallyCalculatedOT = 0;
//         const shiftHoursForEmp = getEmployeeShiftHours(emp.employeeId);

//         attendanceForEmployee.forEach(record => {
//           if (record.checkInTime) {
//             const dateKey = new Date(record.checkInTime).toLocaleDateString('en-CA');
//             attendanceMapForCalc.set(dateKey, record);
            
//             const recDateStr = new Date(record.checkInTime).toISOString().slice(0, 7);
//             const targetMonthStr = `${year}-${String(monthNum).padStart(2, '0')}`;
//             if (recDateStr === targetMonthStr) {
//               const h = Number(record.hours || record.totalHours || 0);
//               if (h > shiftHoursForEmp) {
//                 dynamicallyCalculatedOT += Number((h - shiftHoursForEmp).toFixed(2));
//               }
//             }
//           }
//         });

//         if (dynamicallyCalculatedOT > 0) {
//           overTimeHoursDecimal = Number(dynamicallyCalculatedOT.toFixed(2));
//           const h = Math.floor(dynamicallyCalculatedOT);
//           const m = Math.round((dynamicallyCalculatedOT - h) * 60);
//           overTimeHoursDisplay = `${h}h ${m}m`;
//         } else {
//           overTimeHoursDecimal = 0;
//           overTimeHoursDisplay = "0h 0m";
//         }
        
//         const isMay2026OrLater = year > 2026 || (year === 2026 && monthNum >= 5);
//         let finalWeekOffDays = targetWeekOffCount;

//         if (isMay2026OrLater) {
//             targetWeekOffCount = 4;
//             const actualWeekOffCount = calculateActualWeekOffDays(
//               emp.employeeId, 
//               year, 
//               monthNum, 
//               attendanceMapForCalc, 
//               currentLeavesMap, 
//               targetWeekOffCount
//             );
//             finalWeekOffDays = Math.min(targetWeekOffCount, actualWeekOffCount);
//         } else {
//             finalWeekOffDays = (summary.weekOffPerMonth !== undefined && summary.weekOffPerMonth !== null) 
//               ? summary.weekOffPerMonth 
//               : targetWeekOffCount;
//         }
        
//         let salaryForMonth = emp.salaryPerMonth || 0;
//         let historicalEffectiveFrom = emp.joinDate;
//         let originalSalary = emp.originalSalary || emp.salaryPerMonth;
//         let incrementDetails = null;
        
//         try {
//           const targetDate = new Date(year, monthNum - 1, 15);
//           const formattedDate = targetDate.toISOString().split('T')[0];
          
//           const salaryRes = await fetch(`${API_BASE_URL}/employees/${emp._id}/salary-for-date?date=${formattedDate}`);
//           if (salaryRes.ok) {
//             const salaryData = await salaryRes.json();
//             if (salaryData.success && salaryData.data) {
//               salaryForMonth = salaryData.data.salaryPerMonth;
//               historicalEffectiveFrom = salaryData.data.effectiveFrom || emp.joinDate;
//               originalSalary = salaryData.data.originalSalary || emp.originalSalary || emp.salaryPerMonth;
//               incrementDetails = salaryData.data.incrementDetails;
//             }
//           }
//         } catch (err) {
//           console.warn(`Failed to fetch salary for ${emp.name}:`, err.message);
//         }
        
//         const daysInMonthValue = getDaysInMonth(month || new Date().toISOString().slice(0, 7));
//         const dailyRate = salaryForMonth > 0 ? salaryForMonth / daysInMonthValue : 0;
        
//         const presentDaysCount = summary.presentDays ?? 0;
//         const halfDaysCount = summary.halfDayWorking ?? 0;
//         const compOffData = currentCompOffsMap[emp.employeeId] || { balance: 0 };
        
//         let calculatedSalary = 0;
//         if (salaryForMonth > 0 && daysInMonthValue > 0) {
//           const effectivePaidDays = presentDaysCount + (halfDaysCount * 0.5) + (includeWeekOffInSalary ? finalWeekOffDays : 0) + holidayCount + compOffData.balance;
//           calculatedSalary = effectivePaidDays * dailyRate;
//         }
        
//         processedSalaries.push({
//           employeeId: emp.employeeId,
//           name: emp.name,
//           presentDays: presentDaysCount,
//           workingDays: summary.totalWorkingDays ?? 0,
//           totalWorkingDays: summary.totalWorkingDays ?? 0,
//           halfDayWorking: halfDaysCount,
//           fullDayNotWorking: summary.fullDayNotWorking ?? 0,
//           calculatedSalary: Math.round(calculatedSalary),
//           baseCalculatedSalary: Math.round(calculatedSalary),
//           salaryPerMonth: salaryForMonth,
//           currentSalary: emp.salaryPerMonth,
//           originalSalary: originalSalary,
//           salaryPerDay: dailyRate,
//           weekOffs: finalWeekOffDays,
//           actualWeekOffCount: finalWeekOffDays,
//           targetWeekOffCount: targetWeekOffCount,
//           weekOffDay: emp.weekOffDay || 'Sunday',
//           totalLeaves: 0,
//           month: month || "No Month",
//           monthDays: daysInMonthValue,
//           includeWeekOffInSalary: includeWeekOffInSalary,
//           isHistoricalMonth: isHistorical,
//           isCurrentMonth: isCurrent,
//           department: emp.department || 'N/A',
//           designation: emp.role || emp.designation || 'N/A',
//           compOffEarned: 0,
//           compOffUsed: 0,
//           compOffBalance: 0,
//           holidayCount: holidayCount,
//           historicalEffectiveFrom: historicalEffectiveFrom,
//           incrementDetails: incrementDetails,
//           _id: emp._id,
//           basicPay: emp.basicPay,
//           hra: emp.hra,
//           conveyanceAllowance: emp.conveyanceAllowance,
//           medicalAllowance: emp.medicalAllowance,
//           performanceAllowance: emp.performanceAllowance,
//           specialAllowance: emp.specialAllowance,
//           gmcAmount: emp.gmc,
//           ptax: emp.profTax,
//           otherDeductions: emp.otherDeductions,
//           overTimeHoursDecimal: overTimeHoursDecimal,
//           overTimeHoursDisplay: overTimeHoursDisplay,
//           shiftHours: emp.shiftHours || 8
//         });
//       }

//       const activeProcessedSalaries = filterInactiveEmployees(processedSalaries, employeesMap);
      
//       if (isMounted) {
//         setRecords(activeProcessedSalaries);
//         setFilteredRecords(activeProcessedSalaries);
//       }

//     } catch (err) {
//       console.error("ERROR:", err);
//       if (isMounted) setError(err.message);
//     } finally {
//       if (isMounted) {
//         setLoading(false);
//         setIsLoadingMonth(false);
//       }
//     }
//   }, [EMPLOYEES_API_URL, LEAVES_API_URL, API_BASE_URL, ATTENDANCE_SUMMARY_API_URL, ATTENDANCE_DETAILS_API_URL, processLeavesData, filterInactiveEmployees, filterEmployeesByJoiningDate, processCompOffData, selectedMonth]);

//   useEffect(() => {
//     if (records.length === 0) return;

//     const processRecordsWithAdditions = (prevRecords) => 
//       prevRecords.map(record => {
//         let newCalculatedSalary = record.baseCalculatedSalary;
//         let otAmount = 0;
//         if (includeOTPayment && record.overTimeHoursDecimal > 0 && selectedOTEmployees.has(record.employeeId)) {
//             const dailyRate = record.salaryPerDay || 0;
//             const shiftHours = record.shiftHours || 8;
//             const otRatePerHour = dailyRate / shiftHours;
//             otAmount = record.overTimeHoursDecimal * otRatePerHour;
//             newCalculatedSalary += otAmount;
//         }
//         return {
//           ...record,
//           otAmount: Math.round(otAmount),
//           calculatedSalary: Math.round(newCalculatedSalary)
//         };
//       });

//     setRecords(processRecordsWithAdditions);
//     setFilteredRecords(processRecordsWithAdditions);
//   }, [employeeCompOffs, employeeLeaves, employeesMasterData, monthDays, selectedMonth, includeOTPayment, selectedOTEmployees]);

//   useEffect(() => {
//     fetchData(selectedMonth);
//   }, [fetchData, selectedMonth]);

//   useEffect(() => {
//     let filtered = records.filter(record =>
//       record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       record.employeeId?.toString().includes(searchTerm)
//     );

//     if (filterDepartment) {
//       filtered = filtered.filter(record => record.department === filterDepartment);
//     }

//     if (filterDesignation) {
//       filtered = filtered.filter(record => record.designation === filterDesignation);
//     }

//     setFilteredRecords(filtered);
//     setCurrentPage(1);
//   }, [searchTerm, filterDepartment, filterDesignation, records]);

//   const handleMonthChange = (e) => {
//     const month = e.target.value;
//     setSelectedMonth(month);
//     setFromDate("");
//     setToDate("");
//   };

//   const handleDateRangeFilter = () => {
//     if (!fromDate || !toDate) {
//       alert("Please select both From and To dates");
//       return;
//     }

//     const fromMonth = fromDate.slice(0, 7);
//     const toMonth = toDate.slice(0, 7);

//     if (fromMonth !== toMonth) {
//       alert("Date range must be within the same month");
//       return;
//     }

//     setSelectedMonth(fromMonth);
//     fetchData(fromMonth);
//   };

//   const clearFilters = () => {
//     setSearchTerm("");
//     setFilterDepartment("");
//     setFilterDesignation("");
//     setFromDate("");
//     setToDate("");
//     const currentMonth = new Date().toISOString().slice(0, 7);
//     setSelectedMonth(currentMonth);
//     fetchData(currentMonth);
//   };

//   const handleItemsPerPageChange = (e) => {
//     setItemsPerPage(Number(e.target.value));
//     setCurrentPage(1);
//   };

//   const indexOfLastRecord = currentPage * itemsPerPage;
//   const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;
//   const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
//   const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

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
//     for (let i = 1; i <= totalPages; i++) {
//       if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
//         pageNumbers.push(i);
//       } else if (i === currentPage - 3 || i === currentPage + 3) {
//         pageNumbers.push("...");
//       }
//     }
//     return pageNumbers;
//   };

//   const calculateSalary = (employee) => employee.calculatedSalary || 0;

//   const calculateDailyRate = (employee) => {
//     const salary = employee.salaryPerMonth || 0;
//     if (!salary || salary === 0) return 0;
//     const daysInMonth = employee.monthDays || monthDays || getDaysInMonth(employee.month || selectedMonth);
//     return (salary / daysInMonth).toFixed(2);
//   };

//   const getEmployeeData = (employee) => {
//     const masterData = employeesMasterData[employee.employeeId] || {};
//     return {
//       ...masterData,
//       salaryPerMonth: employee.salaryPerMonth || masterData.salaryPerMonth || 0,
//       masterSalaryPerMonth: masterData.salaryPerMonth || 0,
//       shiftHours: masterData.shiftHours || 8,
//       weekOffPerMonth: employee.weekOffs || masterData.weekOffPerMonth || 0,
//       name: employee.name || masterData.name || '',
//       designation: employee.designation || masterData.designation || '',
//       department: employee.department || masterData.department || '',
//       joiningDate: masterData.joiningDate || '',
//       bankAccount: masterData.bankAccount || '',
//       panNo: masterData.panCard || '',
//       pfNo: masterData.pfNo || '',
//       uanNo: masterData.uanNo || '',
//       esicNo: masterData.esicNo || '',
//       branch: masterData.branch || '',
//       employeeId: employee.employeeId,
//       weekOffDay: masterData.weekOffDay || '',
//       weekOffType: masterData.weekOffType || '0+4',
//       status: employee.status || masterData.status || 'active',
//       basicPay: employee.basicPay || masterData.basicPay || 0,
//       hra: employee.hra || masterData.hra || 0,
//       conveyanceAllowance: employee.conveyanceAllowance || masterData.conveyanceAllowance || 0,
//       medicalAllowance: employee.medicalAllowance || masterData.medicalAllowance || 0,
//       performanceAllowance: employee.performanceAllowance || masterData.performanceAllowance || 0,
//       specialAllowance: employee.specialAllowance || masterData.specialAllowance || 0,
//       gmc: employee.gmcAmount || masterData.gmc || 0,
//       profTax: employee.ptax || masterData.profTax || 0,
//       otherDeductions: employee.otherDeductions || masterData.otherDeductions || 0
//     };
//   };

//   const getWeekOffDaysForDisplay = (employee) => employee.weekOffs || 0;

//   const handleEdit = (employee) => {
//     setSelectedEmployee(employee);
//     const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
//     const weekOffDaysForSalary = employee.weekOffs || 0;

//     setEditFormData({
//       presentDays: employee.presentDays || 0,
//       workingDays: employee.totalWorkingDays || 0,
//       halfDayWorking: employee.halfDayWorking || 0,
//       fullDayNotWorking: employee.fullDayNotWorking || 0,
//       calculatedSalary: employee.calculatedSalary || 0,
//       weekOffDays: weekOffDaysForSalary,
//       holidays: employee.holidayCount || 0,
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

//   const handleEditSubmit = async (e) => {
//     e.preventDefault();
//     if (!selectedEmployee) return;

//     const employeeData = getEmployeeData(selectedEmployee);
//     const leaves = employeeLeaves[selectedEmployee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
//     const weekOffDays = editFormData.weekOffDays || 0;
//     const daysInMonth = selectedEmployee.monthDays || monthDays || getDaysInMonth(selectedEmployee.month || selectedMonth);
//     const dailyRate = employeeData.salaryPerMonth / daysInMonth;

//     const workingDays = editFormData.presentDays || 0; 
//     const halfDays = editFormData.halfDayWorking || 0;
//     const holidays = editFormData.holidays || selectedEmployee.holidayCount || 0;
//     const effectiveWorkingDays = workingDays + (0.5 * halfDays);
//     const compOffData = employeeCompOffs[selectedEmployee.employeeId];
//     const compOffBalance = compOffData?.balance || 0;
    
//     const paidDays = Math.max(0, effectiveWorkingDays + weekOffDays + holidays + compOffBalance);
//     let baseSalary = paidDays * dailyRate;

//     const extraDaysAmount = (extraWorkData.extraDays || 0) * dailyRate;
//     const bonus = extraWorkData.bonus || 0;
//     const deductions = extraWorkData.deductions || 0;
//     const totalExtraAmount = extraDaysAmount + bonus - deductions;
//     const finalSalary = baseSalary + totalExtraAmount;

//     const updatedData = {
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

//     try {
//       const response = await fetch(UPDATE_PAYROLL_API_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           employeeId: selectedEmployee.employeeId,
//           month: selectedEmployee.month || selectedMonth,
//           calculatedSalary: Math.round(finalSalary),
//           extraWork: updatedData.extraWork,
//           presentDays: editFormData.presentDays,
//           workingDays: editFormData.workingDays,
//           halfDayWorking: editFormData.halfDayWorking,
//           fullDayNotWorking: editFormData.fullDayNotWorking,
//           weekOffDays: weekOffDays,
//           holidays: editFormData.holidays || selectedEmployee.holidayCount || 0
//         })
//       });

//       const result = await response.json();
      
//       if (!response.ok || !result.success) {
//         throw new Error(result.message || "Failed to save changes");
//       }

//       const updatedRecords = records.map(record => {
//         if (record.employeeId === selectedEmployee.employeeId) {
//           const serverSummary = result.summary || {};
//           return {
//             ...record,
//             ...updatedData,
//             extraWork: serverSummary.extraWork || updatedData.extraWork,
//             calculatedSalary: serverSummary.calculatedSalary !== undefined ? serverSummary.calculatedSalary : updatedData.calculatedSalary,
//             presentDays: serverSummary.presentDays !== undefined ? serverSummary.presentDays : record.presentDays,
//             totalWorkingDays: serverSummary.totalWorkingDays !== undefined ? serverSummary.totalWorkingDays : record.totalWorkingDays
//           };
//         }
//         return record;
//       });

//       setRecords(updatedRecords);
//       setFilteredRecords(prev => prev.map(r =>
//         r.employeeId === selectedEmployee.employeeId ? updatedRecords.find(ur => ur.employeeId === selectedEmployee.employeeId) : r
//       ));

//       setShowEditModal(false);
//       alert("Salary details saved successfully!");
//     } catch (error) {
//       console.error("Error saving payroll:", error);
//       alert("Failed to save payroll changes: " + error.message);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setEditFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
//   };

//   const handleExtraWorkChange = (e) => {
//     const { name, value } = e.target;
//     setExtraWorkData(prev => ({
//       ...prev,
//       [name]: name === 'reason' ? value : (parseFloat(value) || 0)
//     }));
//   };

//   const handleReset = () => {
//     if (!selectedEmployee) return;

//     const employeeData = getEmployeeData(selectedEmployee);
//     const leaves = employeeLeaves[selectedEmployee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
//     const weekOffDays = selectedEmployee.weekOffs || 0;

//     const daysInMonth = selectedEmployee.monthDays || monthDays || getDaysInMonth(selectedEmployee.month || selectedMonth);
//     const dailyRate = employeeData.salaryPerMonth / daysInMonth;

//     const workingDays = selectedEmployee.presentDays || 0; 
//     const holidays = selectedEmployee.holidayCount || 0;
//     const compOffData = employeeCompOffs[selectedEmployee.employeeId];
//     const compOffBalance = compOffData?.balance || 0;
    
//     let paidDays = Math.max(0, workingDays + (selectedEmployee.halfDayWorking || 0) * 0.5 + weekOffDays + holidays + compOffBalance);

//     const systemCalculatedSalary = Math.round(paidDays * dailyRate);

//     setEditFormData({
//       ...editFormData,
//       calculatedSalary: systemCalculatedSalary,
//       weekOffDays: weekOffDays,
//     });

//     setExtraWorkData({
//       extraDays: 0,
//       extraHours: 0,
//       overtimeRate: 0,
//       bonus: 0,
//       deductions: 0,
//       reason: "Reset to system calculation"
//     });

//     alert("Values reset to system calculation. Click 'Save Changes' to apply.");
//   };

//   const handleView = (employee) => {
//     setSelectedEmployee(employee);
//     setShowViewModal(true);
//   };

//   const downloadInvoice = async (employee) => {
//     const employeeMonth = employee.month || selectedMonth;
//     const allowed = isPayslipDownloadAllowed(employeeMonth);

//     if (!allowed) {
//       const daysInMonth = getDaysInMonth(employeeMonth);
//       alert(`Payslip download for current month is only allowed on or after the last day of the month (${daysInMonth}th).`);
//       return;
//     }

//     const invoiceContent = generateInvoiceHTML(employee);
//     const printWindow = window.open('', '_blank');
//     if (printWindow) {
//       printWindow.document.write(invoiceContent);
//       printWindow.document.close();
//       printWindow.print();

//       try {
//         const adminName = localStorage.getItem("adminName") || "Admin";
//         const adminId = localStorage.getItem("adminId") || "admin";
//         const adminEmail = localStorage.getItem("adminEmail") || localStorage.getItem("employeeEmail") || "admin@system.com";

//         await axios.post("https://api.timelyhealth.in/user-activity/log", {
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
//       } catch (error) {
//         console.error("Failed to log payslip download:", error);
//       }
//     }
//   };

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

//     const daysInMonth = employee.monthDays || monthDays || getDaysInMonth(employee.month || selectedMonth);
//     const dailyRate = parseFloat(calculateDailyRate(employee)) || 0;
//     const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
//     const compOffData = employeeCompOffs[employee.employeeId] || { earned: 0, used: 0, balance: 0 };

//     const actualWeekOffDays = getWeekOffDaysForDisplay(employee);
//     const presentDays = employee.presentDays ?? 0;
//     const halfDays = employee.halfDayWorking || 0;
//     const holidays = employee.holidayCount || 0;

//     let totalPaidDays = presentDays + (halfDays * 0.5) + actualWeekOffDays + holidays;
//     if (compOffData.balance > 0) totalPaidDays += compOffData.balance;

//     const halfDayDeductionAmount = (halfDays * 0.5) * dailyRate;
//     const totalMonthDays = daysInMonth;
    
//     let lopDays = Math.max(0, totalMonthDays - totalPaidDays);
//     let lopAmount = lopDays * dailyRate;
    
//     lopDays = Math.round(lopDays * 10) / 10;
//     lopAmount = Math.round(lopAmount * 100) / 100;

//     const grossSalary = employeeData.salaryPerMonth || 0;
//     const bonus = employee.extraWork?.bonus || 0;
//     const extraDaysPay = (employee.extraWork?.extraDays || 0) * dailyRate;
//     const compOffPay = compOffData.balance * dailyRate;
//     const otAmount = employee.otAmount || 0;
//     const totalEarnings = grossSalary + bonus + extraDaysPay + compOffPay + otAmount;

//     const otherDeductions = employee.extraWork?.deductions || 0;
//     const totalDeductions = lopAmount + halfDayDeductionAmount + otherDeductions;
//     const netPay = totalEarnings - totalDeductions;

//     const grossTotal = employeeData.salaryPerMonth || 0;
//     const masterComponentsSum = (employeeData.basicPay || 0) + (employeeData.hra || 0) + (employeeData.conveyanceAllowance || 0) + 
//                                 (employeeData.medicalAllowance || 0) + (employeeData.performanceAllowance || 0) + (employeeData.specialAllowance || 0);
//     const masterGross = masterComponentsSum > 0 ? masterComponentsSum : 1;
//     const historicalRatio = grossTotal > 0 && masterGross > 0 ? (grossTotal / masterGross) : 1;
    
//     const earningsItems = [];
    
//     const basicAmt = (employeeData.basicPay || 0) * historicalRatio;
//     if (basicAmt > 0) earningsItems.push({ label: 'Basic Salary', amount: basicAmt });
    
//     const hraAmt = (employeeData.hra || 0) * historicalRatio;
//     if (hraAmt > 0) earningsItems.push({ label: 'HRA', amount: hraAmt });
    
//     const convAmt = (employeeData.conveyanceAllowance || 0) * historicalRatio;
//     if (convAmt > 0) earningsItems.push({ label: 'Conveyance Allowance', amount: convAmt });
    
//     const medicalAmt = (employeeData.medicalAllowance || 0) * historicalRatio;
//     if (medicalAmt > 0) earningsItems.push({ label: 'Medical Allowance', amount: medicalAmt });
    
//     const perfAmt = (employeeData.performanceAllowance || 0) * historicalRatio;
//     if (perfAmt > 0) earningsItems.push({ label: 'Performance Allowance', amount: perfAmt });
    
//     const specialAmt = (employeeData.specialAllowance || 0) * historicalRatio;
//     if (specialAmt > 0) earningsItems.push({ label: 'Special Allowance', amount: specialAmt });
    
//     const extraPay = bonus + extraDaysPay;
//     if (extraPay > 0) {
//       earningsItems.push({ label: 'Bonus / Extra Work', amount: extraPay });
//     }
    
//     if (otAmount > 0) {
//       earningsItems.push({ label: `Overtime (${employee.overTimeHoursDisplay || '0h 0m'})`, amount: otAmount });
//     }
    
//     if (compOffPay > 0) {
//       earningsItems.push({ label: 'Comp-off / Holiday Pay', amount: compOffPay });
//     }
    
//     if (holidays > 0) {
//       earningsItems.push({ label: `Public Holidays (${holidays})`, amount: holidays * dailyRate, isInfo: true });
//     }
    
//     earningsItems.push({ label: `Working Days (Full: ${presentDays})`, amount: 0, isInfo: true });
//     earningsItems.push({ label: `Week Off Days (${actualWeekOffDays})`, amount: 0, isInfo: true });
    
//     const deductionsItems = [];
    
//     if (lopDays > 0) {
//       deductionsItems.push({ label: `LOP / Absent (${lopDays} days)`, amount: lopAmount });
//     } else {
//       deductionsItems.push({ label: `LOP / Absent (0 days)`, amount: 0 });
//     }
    
//     if (halfDays > 0) {
//       deductionsItems.push({ label: `Half Day Deductions (${halfDays} HD)`, amount: halfDayDeductionAmount });
//     } else {
//       deductionsItems.push({ label: `Half Day Deductions (0 HD)`, amount: 0 });
//     }
    
//     const gmcAmt = employee.gmcAmount || employeeData.gmc || 0;
//     const ptaxAmt = employee.ptax || employeeData.profTax || 0;
//     const extraDeductions = otherDeductions + (employee.otherDeductions || 0);
//     let totalOtherDeductions = gmcAmt + ptaxAmt + extraDeductions;
    
//     deductionsItems.push({ label: `Other Deductions`, amount: totalOtherDeductions });
    
//     const totalEarningsAmt = earningsItems.filter(item => !item.isInfo).reduce((sum, item) => sum + item.amount, 0);
//     const totalDeductionsAmt = deductionsItems.reduce((sum, item) => sum + item.amount, 0);
//     const finalNetPay = totalEarningsAmt - totalDeductionsAmt;
    
//     let tableRowsHTML = '';
//     const maxRows = Math.max(earningsItems.length, deductionsItems.length);
//     for (let i = 0; i < maxRows; i++) {
//       const earn = earningsItems[i];
//       const ded = deductionsItems[i];
      
//       let earnAmountStr = '';
//       if (earn) {
//         if (earn.isInfo) {
//           earnAmountStr = '-';
//         } else {
//           earnAmountStr = `₹${earn.amount.toFixed(2)}`;
//         }
//       }
      
//       let dedAmountStr = '';
//       if (ded) {
//         dedAmountStr = `₹${ded.amount.toFixed(2)}`;
//       }
      
//       tableRowsHTML += `
//         <tr>
//           <td style="border: 1px solid #000; padding: 8px 10px;">${earn ? earn.label : ''}</td>
//           <td style="border: 1px solid #000; padding: 8px 10px; text-align: right;">${earnAmountStr}</td>
//           <td style="border: 1px solid #000; padding: 8px 10px;">${ded ? ded.label : ''}</td>
//           <td style="border: 1px solid #000; padding: 8px 10px; text-align: right;">${dedAmountStr}</td>
//         </tr>
//       `;
//     }
    
//     const numberToWords = (num) => {
//       const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
//       const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
//       if ((num = Math.abs(Math.round(num)).toString()).length > 9) return 'overflow';
//       const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
//       if (!n) return '';
//       let str = '';
//       str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
//       str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
//       str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
//       str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
//       str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Rupees Only' : 'Rupees Only';
//       return str.trim();
//     };

//     return `
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <meta charset="utf-8">
//           <title>Payslip - ${employee.name}</title>
//           <style>
//             @page { size: A4; margin: 0; }
//             body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: white; }
//             .invoice-container { max-width: 210mm; margin: 0 auto; border: 1px solid #000; border-radius: 4px; }
//             table { width: 100%; border-collapse: collapse; }
//             th, td { padding: 6px 8px; border: 1px solid #000; font-size: 12px; vertical-align: top; }
//             .header-cell { border: none; padding: 12px; border-bottom: 1px solid #000; }
//             .section-header { text-align: center; padding: 8px; font-weight: bold; background: #f5f5f5; }
//             .total-row { font-weight: bold; background: #f9f9f9; }
//             .gross-row { font-weight: bold; background: #f0f0f0; }
//             .note-text { font-size: 9px; color: #666; text-align: center; }
//           </style>
//         </head>
//         <body>
//           <div class="invoice-container">
//             <table>
//               <tr>
//                 <td colspan="6" class="header-cell">
//                   <div style="display: flex; align-items: center; justify-content: space-between;">
//                     <div style="width: 200px;">
//                       <img src="${templateConfig.logo}" alt="Logo" style="height: 40px; object-fit: contain;">
//                     </div>
//                     <div style="flex: 1; text-align: center;">
//                       <h2 style="margin: 0; font-size: 16px;">${templateConfig.companyName}</h2>
//                       <p style="margin: 2px 0 0; font-size: 8px;">${templateConfig.address}</p>
//                     </div>
//                     <div style="width: 200px;"></div>
//                   </div>
//                 </td>
//                </td>
//               <tr><td colspan="6" class="section-header">PAYSLIP ${formatMonthDisplay(employee.month || selectedMonth)}</td></tr>
//               <tr>
//                 <td width="25%"><strong>ID</strong></td><td width="25%">${employee.employeeId || '-'}</td>
//                 <td width="25%"><strong>Joined</strong></td><td width="25%">${employeeData.joiningDate ? new Date(employeeData.joiningDate).toLocaleDateString('en-GB') : '-'}</td>
//               </tr>
//               <tr>
//                 <td><strong>Name</strong></td><td>${employee.name || '-'}</td>
//                 <td><strong>Department</strong></td><td>${employeeData.department || employee.department || '-'}</td>
//               </tr>
//               <tr>
//                 <td><strong>Designation</strong></td><td>${employeeData.designation || employee.designation || '-'}</td>
//                 <td><strong>Month</strong></td><td>${formatMonthDisplay(employee.month || selectedMonth)}</td>
//               </tr>
//               <tr>
//                 <td><strong>Invoice Date</strong></td><td>${new Date().toLocaleDateString('en-GB')}</td>
//                 <td><strong>Total Days</strong></td><td>${daysInMonth} Days</td>
//               </tr>
//               ${(employeeData.panNo) ? `<tr><td colspan="2"><strong>PAN No.:</strong> ${employeeData.panNo}</td><td colspan="2">ERC)` : ''}
//               ${(employeeData.pfNo) ? `<tr><td colspan="2"><strong>PF No.:</strong> ${employeeData.pfNo}</td><td colspan="2">ERC)` : ''}
//               ${(employeeData.uanNo) ? `<tr><td colspan="2"><strong>UAN No.:</strong> ${employeeData.uanNo}</td><td colspan="2">ERC)` : ''}
//               ${(employeeData.branch) ? `<tr><td colspan="2"><strong>Branch:</strong> ${employeeData.branch}</td><td colspan="2">ERC)` : ''}
//               ${(employeeData.esicNo) ? `<tr><td colspan="2"><strong>ESIC No.:</strong> ${employeeData.esicNo}</td><td colspan="2">ERC)` : ''}
//               ${(employeeData.bankAccount) ? `<tr><td colspan="4"><strong>Bank Account:</strong> ${employeeData.bankAccount}ERC)` : ''}
//             </table>
            
//             <table style="border-top: none;">
//               <tr style="background:#f0f0f0;">
//                 <td style="width:40%;"><strong>EARNINGS</strong></td>
//                 <td style="width:10%; text-align:center;"><strong>₹</strong></td>
//                 <td style="width:40%;"><strong>DEDUCTIONS</strong></td>
//                 <td style="width:10%; text-align:center;"><strong>₹</strong></td>
//               </tr>
//               ${tableRowsHTML}
//               <tr class="gross-row">
//                 <td><strong>Gross Earnings</strong></td>
//                 <td style="text-align: right;"><strong>₹${totalEarningsAmt.toFixed(2)}</strong></td>
//                 <td><strong>Total Deductions</strong></td>
//                 <td style="text-align: right;"><strong>₹${totalDeductionsAmt.toFixed(2)}</strong></td>
//               </tr>
//               <tr class="total-row">
//                 <td colspan="2"></td>
//                 <td><strong>NET PAY</strong></td>
//                 <td style="text-align: right;"><strong>₹${finalNetPay.toFixed(2)}</strong></td>
//               </tr>
//               <tr>
//                 <td colspan="4"><strong>Net Payable (In words):</strong> ${numberToWords(finalNetPay)}</td>
//               </tr>
//               <tr>
//                 <td colspan="4" class="note-text">Note: This is a System generated slip and does not require company sign and stamp.</td>
//               </tr>
//             </table>
//           </div>
//         </body>
//       </html>
//     `;
//   };

//   const getLeaveTypes = (employee) => {
//     if (employee.leaveTypes && Object.keys(employee.leaveTypes).length > 0) {
//       const leaveStrings = [];
//       Object.entries(employee.leaveTypes).forEach(([type, count]) => {
//         if (count > 0) leaveStrings.push(`${type.toUpperCase()}: ${count} `);
//       });
//       if (leaveStrings.length > 0) return leaveStrings.join(', ');
//     }

//     const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
//     const leaveStrings = [];

//     if (leaves.CL > 0) leaveStrings.push(`CL: ${leaves.CL} `);
//     if (leaves.SL > 0) leaveStrings.push(`SL: ${leaves.SL} `);
//     if (leaves.EL > 0) leaveStrings.push(`EL: ${leaves.EL} `);
//     if (leaves.COFF > 0) leaveStrings.push(`COFF: ${leaves.COFF} `);
//     if (leaves.LOP > 0) leaveStrings.push(`LOP: ${leaves.LOP} `);
//     if (leaves.Other > 0) leaveStrings.push(`Other: ${leaves.Other} `);

//     return leaveStrings.length > 0 ? leaveStrings.join(', ') : 'No Leaves';
//   };

//   const formatMonthDisplay = (month) => {
//     if (!month) return "Current Month";
//     const [year, monthNum] = month.split('-');
//     const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
//     return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
//   };

//   const AttendancePopupModal = () => {
//     if (!showAttendancePopup) return null;
    
//     const getEmployeeShiftHours = (employeeId) => employeesMasterData[employeeId]?.shiftHours || 8;

//     const getAllDatesOfMonth = (month, employeeId) => {
//       if (!month) return [];
//       const [year, monthNum] = month.split('-').map(Number);
//       const startDate = new Date(year, monthNum - 1, 1);
//       const endDate = new Date(year, monthNum, 0);
//       const dates = [];
//       for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//         dates.push(new Date(d));
//       }
//       return dates;
//     };

//     const monthDates = getAllDatesOfMonth(selectedMonth, selectedEmployee?.employeeId);

//     const isLeaveDay = (date, employeeId, employeeLeavesData) => {
//       if (!date || !employeeId) return false;
//       const leaves = employeeLeavesData[employeeId];
//       if (!leaves || !leaves.leaveDetails) return false;
//       const dateStr = date.toLocaleDateString('en-CA');
//       return leaves.leaveDetails.some(leave => {
//         const startDate = new Date(leave.startDate);
//         const endDate = new Date(leave.endDate);
//         const checkDate = new Date(dateStr);
//         return checkDate >= startDate && checkDate <= endDate;
//       });
//     };

//     const shiftHours = getEmployeeShiftHours(selectedEmployee?.employeeId);

//     const attendanceMap = new Map();
//     selectedEmployeeAttendance.forEach(record => {
//       if (record.checkInTime) {
//         const dateKey = new Date(record.checkInTime).toLocaleDateString('en-CA');
//         attendanceMap.set(dateKey, record);
//       }
//     });

//     const targetWeekOffCount = selectedEmployee?.targetWeekOffCount || selectedEmployee?.weekOffs || 4;
    
//     const getWeekOffDatesForMonth = () => {
//       const weekOffDatesSet = new Set();
//       if (!selectedEmployee || monthDates.length === 0) return weekOffDatesSet;
      
//       const employeeId = selectedEmployee.employeeId;
      
//       if (targetWeekOffCount === 4) {
//         monthDates.forEach(date => {
//           if (date.toLocaleDateString('en-US', { weekday: 'long' }) === 'Sunday') {
//             weekOffDatesSet.add(date.toLocaleDateString('en-CA'));
//           }
//         });
//         return weekOffDatesSet;
//       }
      
//       const absentDays = [];
      
//       monthDates.forEach(date => {
//         const dateKey = date.toLocaleDateString('en-CA');
//         const hasAttendance = attendanceMap.has(dateKey);
//         const isLeave = isLeaveDay(date, employeeId, employeeLeaves);
//         const isSunday = date.toLocaleDateString('en-US', { weekday: 'long' }) === 'Sunday';
        
//         if (!hasAttendance && !isLeave && !isSunday) {
//           absentDays.push(date);
//         }
//       });
      
//       absentDays.sort((a, b) => a - b);
      
//       const weekOffDaysCount = Math.min(targetWeekOffCount, absentDays.length);
//       for (let i = 0; i < weekOffDaysCount; i++) {
//         weekOffDatesSet.add(absentDays[i].toLocaleDateString('en-CA'));
//       }
      
//       return weekOffDatesSet;
//     };
    
//     const weekOffDatesSet = getWeekOffDatesForMonth();

//     const isWeekOffDay = (date, employeeId) => {
//       if (!date || !employeeId) return false;
//       return weekOffDatesSet.has(date.toLocaleDateString('en-CA'));
//     };

//     let weekOffCount = 0, leaveCount = 0, absentCount = 0, presentCount = 0;

//     monthDates.forEach(date => {
//       const dateKey = date.toLocaleDateString('en-CA');
//       const record = attendanceMap.get(dateKey);
//       const isWO = isWeekOffDay(date, selectedEmployee?.employeeId);
//       const isLV = !isWO && isLeaveDay(date, selectedEmployee?.employeeId, employeeLeaves);
      
//       if (isWO) weekOffCount++;
//       else if (isLV) leaveCount++;
//       else if (!record) absentCount++;
//       else presentCount++;
//     });

//     const formatTime = (dateString) => {
//       if (!dateString) return '-';
//       return new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
//     };

//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//         <div className="bg-white rounded-lg w-full max-w-7xl mx-4 max-h-[85vh] flex flex-col">
//           <div className="sticky top-0 flex items-center justify-between p-3 bg-white border-b rounded-t-lg">
//             <div>
//               <h2 className="text-lg font-bold text-gray-700">Attendance Records - {selectedEmployee?.name}</h2>
//               <p className="text-xs text-gray-500">ID: {selectedEmployee?.employeeId} | Shift: {shiftHours} hrs/day | Week-offs: {targetWeekOffCount} days</p>
//             </div>
//             <button onClick={() => setShowAttendancePopup(false)} className="text-gray-500 hover:text-gray-700">
//               <FaTimes className="w-5 h-5" />
//             </button>
//           </div>
          
//           <div className="flex items-center justify-between px-4 py-2 bg-white border-b">
//             <div className="flex gap-4 text-xs">
//               <span className="font-medium">Total Days: <strong>{monthDates.length}</strong></span>
//               <span className="text-orange-600">Week Off: <strong>{weekOffCount}</strong></span>
//               <span className="text-red-600">Leaves: <strong>{leaveCount}</strong></span>
//               <span className="text-gray-500">Absent: <strong>{absentCount}</strong></span>
//               <span className="text-blue-700">Present: <strong>{presentCount}</strong></span>
//             </div>
//             <div className="flex gap-3 text-xs">
//               <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div><span>Week Off</span></div>
//               <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div><span>Leave</span></div>
//               <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div><span>Absent</span></div>
//               <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-100 border border-green-300 rounded"></div><span>Present</span></div>
//             </div>
//           </div>
          
//           <div className="flex-1 p-2 overflow-y-auto">
//             {attendanceLoading ? (
//               <div className="flex items-center justify-center py-8">
//                 <div className="text-center">
//                   <div className="w-8 h-8 mx-auto mb-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
//                   <p className="text-sm text-gray-500">Loading...</p>
//                 </div>
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="min-w-full text-sm">
//                   <thead className="sticky top-0 text-white bg-gradient-to-r from-green-500 to-blue-600">
//                     <tr>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Date</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Day</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">In</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Out</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Hrs</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Type</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {monthDates.map((date) => {
//                       const dateKey = date.toLocaleDateString('en-CA');
//                       const record = attendanceMap.get(dateKey);
//                       const hasAttendance = !!record;
                      
//                       const workHours = record ? calculateWorkHours(record.checkInTime, record.checkOutTime) : null;
                      
//                       const isWeekOff = isWeekOffDay(date, selectedEmployee?.employeeId);
//                       const isLeave = !isWeekOff && isLeaveDay(date, selectedEmployee?.employeeId, employeeLeaves);
                      
//                       const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                      
//                       let bgColor = '';
//                       let dayType = '';
//                       let statusText = '';
                      
//                       if (isWeekOff) {
//                         bgColor = 'bg-orange-50';
//                         dayType = 'Week Off';
//                         statusText = 'Week Off';
//                       } else if (isLeave) {
//                         bgColor = 'bg-red-50';
//                         dayType = 'Leave';
//                         statusText = 'On Leave';
//                       } else if (!hasAttendance) {
//                         bgColor = 'bg-white';
//                         dayType = 'Absent';
//                         statusText = 'Absent';
//                       } else {
//                         bgColor = 'bg-white';
//                         const hoursNum = parseFloat(workHours);
//                         if (hoursNum >= shiftHours * 0.9) dayType = 'Full Day';
//                         else if (hoursNum >= shiftHours * 0.5) dayType = 'Half Day';
//                         else dayType = 'Absent';
//                         statusText = record?.checkOutTime ? 'Completed' : (record?.status === "checked-in" ? 'Active' : 'Unknown');
//                       }
                      
//                       return (
//                         <tr key={dateKey} className={`${bgColor} hover:bg-gray-50 transition-colors`}>
//                           <td className="px-2 py-1 text-xs text-center">{date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
//                           <td className="px-2 py-1 text-xs text-center">{dayName}</td>
//                           <td className="px-2 py-1 text-xs text-center">{!isWeekOff && !isLeave && hasAttendance ? formatTime(record?.checkInTime) : '-'}</td>
//                           <td className="px-2 py-1 text-xs text-center">{!isWeekOff && !isLeave && hasAttendance ? formatTime(record?.checkOutTime) : '-'}</td>
//                           <td className="px-2 py-1 text-xs text-center">{!isWeekOff && !isLeave && hasAttendance && workHours ? `${workHours}h` : '-'}</td>
//                           <td className="px-2 py-1 text-center">
//                             <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
//                               isWeekOff ? 'bg-orange-100 text-orange-700' :
//                               isLeave ? 'bg-red-100 text-red-700' :
//                               !hasAttendance ? 'bg-gray-100 text-gray-500' :
//                               dayType === 'Full Day' ? 'bg-blue-100 text-green-700' :
//                               dayType === 'Half Day' ? 'bg-yellow-100 text-yellow-700' :
//                               'bg-gray-100 text-gray-500'
//                             }`}>{dayType}</span>
//                           </td>
//                           <td className="px-2 py-1 text-xs text-center">{statusText}</td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
          
//           <div className="flex justify-end p-3 bg-white border-t rounded-b-lg">
//             <button onClick={() => setShowAttendancePopup(false)} className="px-4 py-1.5 text-sm text-white transition duration-200 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg hover:from-green-600 hover:to-blue-700">Close</button>
//           </div>
//         </div>
//       </div>
//     );
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
//           <button onClick={() => fetchData(selectedMonth)} className="px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700">Retry</button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-9xl">
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//           <StatCard title="Active Employees" value={filteredRecords.length} icon={FaUserTag} color="border-blue-500" />
//           <StatCard title="Total Salary" value={`₹${filteredRecords.reduce((sum, emp) => sum + (emp.calculatedSalary || 0), 0).toLocaleString()}`} icon={FaBuilding} color="border-green-500" />
//           <StatCard title="Active This Month" value={filteredRecords.filter(emp => !emp.isHistoricalMonth).length} icon={FaCalendarAlt} color="border-purple-500" />
//           <StatCard title="On Leave" value={filteredRecords.filter(emp => (employeeLeaves[emp.employeeId]?.CL > 0 || employeeLeaves[emp.employeeId]?.EL > 0)).length} icon={FaSearch} color="border-red-500" />
//         </div>

//         <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
//           <div className="flex flex-wrap items-center gap-2">
//             <div className="relative flex-1 min-w-[180px]">
//               <FaSearch className="absolute text-sm text-gray-500 transform -translate-y-1/2 left-2 top-1/2" />
//               <input type="text" placeholder="Search by ID or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent" />
//             </div>

//             <div className="relative" ref={departmentFilterRef}>
//               <button onClick={() => setShowDepartmentFilter(!showDepartmentFilter)} className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${filterDepartment ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`}>
//                 <FaBuilding className="text-xs" /> Dept {filterDepartment && `: ${filterDepartment}`}
//               </button>
//               {showDepartmentFilter && (
//                 <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
//                   <div onClick={() => { setFilterDepartment(''); setShowDepartmentFilter(false); }} className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-blue-50">All Departments</div>
//                   {uniqueDepartments.map(dept => (
//                     <div key={dept} onClick={() => { setFilterDepartment(dept); setShowDepartmentFilter(false); }} className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${filterDepartment === dept ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}>{dept}</div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="relative" ref={designationFilterRef}>
//               <button onClick={() => setShowDesignationFilter(!showDesignationFilter)} className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${filterDesignation ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`}>
//                 <FaUserTag className="text-xs" /> Desig {filterDesignation && `: ${filterDesignation}`}
//               </button>
//               {showDesignationFilter && (
//                 <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
//                   <div onClick={() => { setFilterDesignation(''); setShowDesignationFilter(false); }} className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-blue-50">All Designations</div>
//                   {uniqueDesignations.map(des => (
//                     <div key={des} onClick={() => { setFilterDesignation(des); setShowDesignationFilter(false); }} className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${filterDesignation === des ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}>{des}</div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="relative w-[130px]">
//               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">From:</span>
//               <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); if (e.target.value && toDate) handleDateRangeFilter(); }} className="w-full pl-12 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent" />
//             </div>

//             <div className="relative w-[130px]">
//               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">To:</span>
//               <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); if (fromDate && e.target.value) handleDateRangeFilter(); }} className="w-full pl-10 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent" />
//             </div>

//             <div className="relative w-[130px]">
//               <FaCalendarAlt className="absolute text-xs text-gray-500 transform -translate-y-1/2 left-2 top-1/2" />
//               <input type="month" value={selectedMonth} onChange={handleMonthChange} className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent" />
//             </div>

//             <button onClick={handleDateRangeFilter} disabled={!fromDate || !toDate} className="h-8 px-3 text-xs font-medium text-white transition bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">Apply</button>
//             <button onClick={() => setShowTemplateModal(true)} className="h-8 px-3 text-xs font-medium text-gray-700 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">⚙️ Template</button>
//             <button onClick={() => { const currentMonth = new Date().toISOString().slice(0, 7); setSelectedMonth(currentMonth); fetchData(currentMonth); }} className="h-8 px-3 text-xs font-medium text-gray-700 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Current</button>
//             <button onClick={() => fetchData(selectedMonth)} disabled={isLoadingMonth} className="h-8 px-3 text-xs font-medium text-white transition bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">{isLoadingMonth ? "⟳" : "⟳ Refresh"}</button>
//             <button onClick={() => navigate("/bank-reports")} className="h-8 px-3 text-xs font-medium text-white transition bg-blue-600 rounded-md hover:bg-blue-700">Bank Reports</button>
//             {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate || selectedMonth !== new Date().toISOString().slice(0, 7)) && (
//               <button onClick={clearFilters} className="h-8 px-3 text-xs font-medium text-gray-500 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Clear</button>
//             )}
            
//             <div className="flex items-center ml-auto bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
//               <input 
//                 type="checkbox" 
//                 id="otPaymentToggle" 
//                 checked={includeOTPayment} 
//                 onChange={handleOTPaymentToggle} 
//                 className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
//               />
//               <label htmlFor="otPaymentToggle" className="ml-2 text-xs font-medium text-gray-700 cursor-pointer">
//                 Include OT Payment
//               </label>
//               {includeOTPayment && (
//                 <button onClick={() => setShowOTModal(true)} className="ml-2 text-xs text-blue-600 underline hover:text-blue-800">
//                   Select
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {selectedMonth && isCurrentMonth(selectedMonth) && new Date().getDate() < 26 && (
//           <div className="px-3 py-2 mb-3 border-l-4 border-yellow-500 rounded-md shadow-sm bg-yellow-50">
//             <p className="text-xs font-medium text-yellow-700">
//               ⚠️ Current Month (Before 26th) - Week-off will be added after 26th for salary calculation
//             </p>
//           </div>
//         )}
//         {selectedMonth && isCurrentMonth(selectedMonth) && new Date().getDate() >= 26 && (
//           <div className="px-3 py-2 mb-3 border-l-4 border-green-500 rounded-md shadow-sm bg-green-50">
//             <p className="text-xs font-medium text-green-700">
//               ✓ Current Month (After 26th) - Week-off included in salary calculation
//             </p>
//           </div>
//         )}
//         {selectedMonth && isHistoricalMonth(selectedMonth) && (
//           <div className="px-3 py-2 mb-3 border-l-4 border-green-500 rounded-md shadow-sm bg-green-50">
//             <p className="text-xs font-medium text-green-700">
//               ✓ Historical Month - Full salary with week-off included
//             </p>
//           </div>
//         )}

//         <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
//                 <tr>
//                   <th className="py-2 text-xs text-center">Emp ID</th>
//                   <th className="py-2 text-xs text-center">Name</th>
//                   <th className="py-2 text-xs text-center">Dept</th>
//                   <th className="py-2 text-xs text-center">Desig</th>
//                   <th className="py-2 text-xs text-center">Working</th>
//                   <th className="py-2 text-xs text-center">Present</th>
//                   <th className="py-2 text-xs text-center">Half</th>
//                   <th className="py-2 text-xs text-center">Week Off</th>
//                   <th className="py-2 text-xs text-center">OT Hrs</th>
//                   <th className="py-2 text-xs text-center">Monthly Salary</th>
//                   <th className="py-2 text-xs text-center">Calculated</th>
//                   <th className="py-2 text-xs text-center">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {currentRecords.map((item, index) => (
//                   <tr key={item.employeeId} onClick={() => handleRowClick(item)} className={`hover:bg-gray-50 cursor-pointer transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
//                     <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">{item.employeeId}</td>
//                     <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">{item.name}</td>
//                     <td className="px-2 py-1.5 text-center text-xs">{item.department}</td>
//                     <td className="px-2 py-1.5 text-center text-xs">{item.designation}</td>
//                     <td className="px-2 py-1.5 text-center text-xs"><span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{item.totalWorkingDays || 0}</span></td>
//                     <td className="px-2 py-1.5 text-center text-xs"><span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs">{item.presentDays || 0}</span></td>
//                     <td className="px-2 py-1.5 text-center text-xs"><span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-xs">{item.halfDayWorking || 0}</span></td>
//                     <td className="px-2 py-1.5 text-center text-xs"><span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded text-xs">{getWeekOffDaysForDisplay(item)}</span></td>
//                     <td className="px-2 py-1.5 text-center text-xs">
//                       <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${item.overTimeHoursDisplay && item.overTimeHoursDisplay !== '0h 0m' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
//                         {item.overTimeHoursDisplay || '0h 0m'}
//                       </span>
//                     </td>
//                     <td className="px-2 py-1.5 text-center text-xs">
//                       <div className="font-medium text-blue-600">₹{(item.salaryPerMonth || 0).toLocaleString()}</div>
//                       {item.currentSalary && item.currentSalary !== item.salaryPerMonth && (
//                         <div className="text-[9px] text-gray-500 line-through">₹{item.currentSalary.toLocaleString()}</div>
//                       )}
//                       {item.historicalEffectiveFrom && item.historicalEffectiveFrom !== item.joinDate && (
//                         <div className="text-[8px] text-blue-600">w.e.f {new Date(item.historicalEffectiveFrom).toLocaleDateString()}</div>
//                       )}
//                     </td>
//                     <td className="px-2 py-1.5 text-center text-xs"><span className="font-bold text-green-700">₹{calculateSalary(item).toLocaleString()}</span></td>
//                     <td className="px-2 py-1.5 text-center" onClick={(e) => e.stopPropagation()}>
//                       <div className="flex justify-center gap-1">
//                         <button onClick={(e) => { e.stopPropagation(); handleView(item); }} className="p-1 text-blue-600 rounded hover:bg-blue-50" title="View">
//                           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                           </svg>
//                         </button>
//                         <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="p-1 text-blue-700 rounded hover:bg-blue-50" title="Edit">
//                           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                           </svg>
//                         </button>
//                         <button onClick={(e) => { e.stopPropagation(); downloadInvoice(item); }} disabled={!isPayslipDownloadAllowed(item.month || selectedMonth)} className={`p-1 rounded ${isPayslipDownloadAllowed(item.month || selectedMonth) ? 'text-purple-600 hover:bg-purple-50' : 'text-gray-300 cursor-not-allowed'}`} title="Download">
//                           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

//           {filteredRecords.length > 0 && (
//             <div className="flex flex-col items-center justify-between gap-2 px-3 py-2 border-t sm:flex-row">
//               <div className="flex items-center gap-2">
//                 <label className="text-xs text-gray-700">Show:</label>
//                 <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="p-1 text-xs border rounded">
//                   <option value={5}>5</option>
//                   <option value={10}>10</option>
//                   <option value={20}>20</option>
//                   <option value={50}>50</option>
//                 </select>
//               </div>
//               <div className="flex items-center gap-1">
//                 <button onClick={handlePrevious} disabled={currentPage === 1} className={`px-3 py-0.5 text-xs border rounded ${currentPage === 1 ? 'text-gray-500 bg-gray-100' : 'text-blue-600 bg-white hover:bg-blue-50'}`}>Prev</button>
//                 {getPageNumbers().map((page, idx) => (
//                   <button key={idx} onClick={() => typeof page === 'number' && handlePageClick(page)} disabled={page === "..."} className={`px-3 py-0.5 text-xs border rounded ${page === "..." ? 'text-gray-500 bg-white' : currentPage === page ? 'text-white bg-blue-600' : 'text-blue-600 bg-white hover:bg-blue-50'}`}>{page}</button>
//                 ))}
//                 <button onClick={handleNext} disabled={currentPage === totalPages} className={`px-3 py-0.5 text-xs border rounded ${currentPage === totalPages ? 'text-gray-500 bg-gray-100' : 'text-blue-600 bg-white hover:bg-blue-50'}`}>Next</button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {showViewModal && selectedEmployee && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto">
//             <div className="sticky top-0 z-10 flex items-center justify-between mb-4 bg-white">
//               <h2 className="text-xl font-bold text-gray-700">Employee Details</h2>
//               <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700"><FaTimes size={20} /></button>
//             </div>
//             <div className="flex items-start space-x-4">
//               <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full shrink-0"><span className="text-lg font-semibold text-blue-800">{selectedEmployee.name?.charAt(0) || 'E'}</span></div>
//               <div className="flex flex-col flex-1 space-y-1">
//                 <h3 className="text-lg font-semibold text-gray-700">{selectedEmployee.name}</h3>
//                 <div className="grid grid-cols-2 text-sm text-gray-500 gap-x-6 gap-y-1">
//                   <p><span className="font-medium text-gray-700">ID:</span> {selectedEmployee.employeeId}</p>
//                   <p><span className="font-medium text-gray-700">Department:</span> {selectedEmployee.department || 'N/A'}</p>
//                   <p><span className="font-medium text-gray-700">Designation:</span> {selectedEmployee.designation || 'N/A'}</p>
//                   <p><span className="font-medium text-gray-700">Month:</span> {selectedEmployee.month || selectedMonth} ({selectedEmployee.monthDays || monthDays} days)</p>
//                 </div>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 mt-4 mb-4 text-sm sm:grid-cols-2 gap-x-10 gap-y-2">
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Present Days</span><span className="font-semibold text-blue-700">{selectedEmployee.presentDays || 0}</span></div>
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Working Days</span><span className="font-semibold text-blue-600">{selectedEmployee.totalWorkingDays || 0}</span></div>
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Half Days</span><span className="font-semibold text-yellow-600">{selectedEmployee.halfDayWorking || 0}</span></div>
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">WeekOff Days</span><span className="font-semibold text-purple-600">{getWeekOffDaysForDisplay(selectedEmployee)}</span></div>
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">OT Hours</span><span className="font-semibold text-orange-600">{selectedEmployee.overTimeHoursDisplay || '0h 0m'}</span></div>
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Month Days</span><span className="font-semibold text-gray-700">{selectedEmployee.monthDays || monthDays}</span></div>
//               <div className="flex justify-between pb-1 border-b">
//                 <span className="text-gray-500">Monthly Salary</span>
//                 <div className="text-right">
//                   <span className="font-semibold text-blue-600">₹{selectedEmployee.salaryPerMonth || 0}</span>
//                   {selectedEmployee.currentSalary && selectedEmployee.currentSalary !== selectedEmployee.salaryPerMonth && (
//                     <div className="text-[9px] text-gray-500 line-through">₹{selectedEmployee.currentSalary.toLocaleString()}</div>
//                   )}
//                 </div>
//               </div>
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Daily Rate</span><span className="font-semibold text-gray-700">₹{calculateDailyRate(selectedEmployee)}/day</span></div>
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Calculated Salary</span><span className="font-semibold text-blue-700">₹{Math.round(selectedEmployee.calculatedSalary || 0)}</span></div>
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">OT Pay</span><span className="font-semibold text-blue-600">₹{selectedEmployee.otAmount || 0}</span></div>
//               <div className="flex flex-col pb-2 border-b sm:col-span-2">
//                 <div className="flex justify-between mb-2"><span className="font-medium text-gray-500">Approved Leaves</span><span className="font-semibold text-red-600">{getLeaveTypes(selectedEmployee) || "0"}</span></div>
//               </div>
//             </div>
//             <div className="flex justify-end space-x-3">
//               <button onClick={() => downloadInvoice(selectedEmployee)} disabled={!isPayslipDownloadAllowed(selectedEmployee.month || selectedMonth)} className={`px-6 py-2 rounded-lg transition duration-200 ${isPayslipDownloadAllowed(selectedEmployee.month || selectedMonth) ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Download Payslip</button>
//               <button onClick={() => setShowViewModal(false)} className="px-6 py-2 text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700">Close</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {showEditModal && selectedEmployee && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg p-4 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
//             <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-bold">Edit Salary - {selectedEmployee.name}</h2><button onClick={() => setShowEditModal(false)} className="text-gray-500"><FaTimes /></button></div>
//             <form onSubmit={handleEditSubmit} className="space-y-3">
//               <div><label className="block text-xs">Present Days</label><input type="number" name="presentDays" value={editFormData.presentDays || 0} onChange={handleInputChange} className="w-full p-2 text-sm border rounded" /></div>
//               <div><label className="block text-xs">Working Days</label><input type="number" name="workingDays" value={editFormData.workingDays || 0} onChange={handleInputChange} className="w-full p-2 text-sm border rounded" /></div>
//               <div><label className="block text-xs">Half Days</label><input type="number" name="halfDayWorking" value={editFormData.halfDayWorking || 0} onChange={handleInputChange} className="w-full p-2 text-sm border rounded" /></div>
//               <div><label className="block text-xs">Bonus (₹)</label><input type="number" name="bonus" value={extraWorkData.bonus || 0} onChange={handleExtraWorkChange} className="w-full p-2 text-sm border rounded" /></div>
//               <div><label className="block text-xs">Deductions (₹)</label><input type="number" name="deductions" value={extraWorkData.deductions || 0} onChange={handleExtraWorkChange} className="w-full p-2 text-sm border rounded" /></div>
//               <div><label className="block text-xs">Reason</label><input type="text" name="reason" value={extraWorkData.reason || ""} onChange={handleExtraWorkChange} className="w-full p-2 text-sm border rounded" /></div>
//               <div className="flex gap-2 pt-2"><button type="button" onClick={handleReset} className="px-3 py-1 text-sm text-white bg-yellow-500 rounded hover:bg-yellow-600">Reset</button><button type="button" onClick={() => setShowEditModal(false)} className="px-3 py-1 text-sm text-gray-700 bg-gray-300 rounded hover:bg-gray-400">Cancel</button><button type="submit" className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">Save</button></div>
//             </form>
//           </div>
//         </div>
//       )}

//       {showTemplateModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="w-full max-w-md p-4 bg-white rounded-lg">
//             <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-bold">Edit Template</h2><button onClick={() => setShowTemplateModal(false)}><FaTimes /></button></div>
//             <div className="space-y-3">
//               <div><label className="block text-xs">Company Name</label><input type="text" value={templateConfig.companyName} onChange={(e) => setTemplateConfig({...templateConfig, companyName: e.target.value})} className="w-full p-2 text-sm border rounded" /></div>
//               <div><label className="block text-xs">Address</label><textarea rows="2" value={templateConfig.address} onChange={(e) => setTemplateConfig({...templateConfig, address: e.target.value})} className="w-full p-2 text-sm border rounded"></textarea></div>
//               <div><label className="block text-xs">Logo</label><input type="file" accept="image/*" onChange={handleLogoChange} className="w-full text-sm" /></div>
//               <div className="flex gap-2"><button onClick={() => setShowTemplateModal(false)} className="px-3 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400">Cancel</button><button onClick={handleTemplateSave} className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">Save</button></div>
//             </div>
//           </div>
//         </div>
//       )}
      
//       {showOTModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg p-4 w-full max-w-lg max-h-[80vh] flex flex-col">
//             <div className="flex items-center justify-between mb-3">
//               <h2 className="text-lg font-bold">Select Employees for OT Payment</h2>
//               <button onClick={() => setShowOTModal(false)}><FaTimes /></button>
//             </div>
//             <div className="flex-1 pr-2 overflow-y-auto">
//               <table className="w-full text-sm">
//                 <thead className="text-white bg-gradient-to-r from-green-500 to-blue-600">
//                   <tr>
//                     <th className="p-2 text-left">Select</th>
//                     <th className="p-2 text-left">Employee ID</th>
//                     <th className="p-2 text-left">Name</th>
//                     <th className="p-2 text-right">OT Hours</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {records.length === 0 ? (
//                     <tr><td colSpan="4" className="p-4 text-center text-gray-500">No employees found.ERC)`快点</td></tr>
//                   ) : (
//                     records.map(r => (
//                       <tr key={r.employeeId} className="border-b">
//                         <td className="p-2">
//                           <input 
//                             type="checkbox" 
//                             checked={selectedOTEmployees.has(r.employeeId)}
//                             onChange={() => handleOTEmployeeSelection(r.employeeId)}
//                             className="w-4 h-4 text-blue-600 rounded"
//                           />
//                         </td>
//                         <td className="p-2">{r.employeeId}</td>
//                         <td className="p-2 font-medium">{r.name}</td>
//                         <td className="p-2 font-semibold text-right text-blue-600">{r.overTimeHoursDisplay || '0h 0m'}</td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//             <div className="flex justify-end mt-4">
//               <button onClick={() => setShowOTModal(false)} className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">Done</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <AttendancePopupModal />
//     </div>
//   );
// };

// export default PayRoll;

import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaBuilding,
  FaCalendarAlt,
  FaSearch,
  FaTimes,
  FaUserTag
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import StatCard from "../Components/StatCard";
import { API_BASE_URL } from "../config";
import logo from "../Images/Timely-Health-Logo.png";
import { isEmployeeHidden } from "../utils/employeeStatus";

const PayRoll = () => {
  const [records, setRecords] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
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
  const navigate = useNavigate();

  const [showAttendancePopup, setShowAttendancePopup] = useState(false);
  const [selectedEmployeeAttendance, setSelectedEmployeeAttendance] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const [employeeCompOffs, setEmployeeCompOffs] = useState({});
  const [compOffDetails, setCompOffDetails] = useState({});

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

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showDesignationFilter, setShowDesignationFilter] = useState(false);

  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueDesignations, setUniqueDesignations] = useState([]);

  const departmentFilterRef = useRef(null);
  const designationFilterRef = useRef(null);

  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const [monthDays, setMonthDays] = useState(30);
  const [showOTModal, setShowOTModal] = useState(false);
  const [selectedOTEmployees, setSelectedOTEmployees] = useState(() => {
    const saved = localStorage.getItem("payrollSelectedOTEmployees");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [weekOffConfig, setWeekOffConfig] = useState({
    weekOffDay: "",
    weekOffType: "0+4",
    manualDays: ""
  });

  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateConfig, setTemplateConfig] = useState({
    companyName: "Timely Health Tech Pvt Ltd",
    address: "H. No: 1-98/9/25/p, # 301, 3rd Floor, Sri Sai Balaji Avenue,\nArunodaya Colony, Madhapur, Hyderabad, TG - 500081",
    logo: logo
  });

  // Helper function to format decimal hours to HH:MM
  const formatDecimalHours = (decimalHours) => {
    if (!decimalHours && decimalHours !== 0) return "0h 0m";
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    if (minutes === 60) {
      return `${hours + 1}h 0m`;
    }
    return `${hours}h ${minutes}m`;
  };

  // ✅ EXACT SAME as AttendanceSummary's getEmployeeShiftHours function
  const getEmployeeShiftHours = (employeeId) => {
    const employeeData = employeesMasterData[employeeId] || {};
    return employeeData.shiftHours || 8;
  };

  // ✅ EXACT SAME as AttendanceSummary's calculateOT function
  const calculateOTForEmployee = (employeeId, hoursWorked) => {
    const h = Number(hoursWorked) || 0;
    const shiftHours = getEmployeeShiftHours(employeeId);
    
    if (h > shiftHours) {
      return Number((h - shiftHours).toFixed(2));
    }
    return 0;
  };

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

  const handleOTEmployeeSelection = (employeeId) => {
    const updated = new Set(selectedOTEmployees);
    if (updated.has(employeeId)) {
      updated.delete(employeeId);
    } else {
      updated.add(employeeId);
    }
    setSelectedOTEmployees(updated);
    localStorage.setItem("payrollSelectedOTEmployees", JSON.stringify(Array.from(updated)));
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

  const ATTENDANCE_SUMMARY_API_URL = `${API_BASE_URL}/attendancesummary/get`;
  const ATTENDANCE_DETAILS_API_URL = `${API_BASE_URL}/attendance/allattendance`;
  const LEAVES_API_URL = `${API_BASE_URL}/leaves/leaves?status=approved`;
  const COMPOFF_API_URL = `${API_BASE_URL}/leaves/comp-offs`;
  const EMPLOYEES_API_URL = `${API_BASE_URL}/employees/get-employees`;
  const UPDATE_PAYROLL_API_URL = `${API_BASE_URL}/attendancesummary/updatePayroll`;

  const getDaysInMonth = (monthStr) => {
    if (!monthStr) return new Date().getDate();
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  const wasEmployeeEmployedInMonth = (employee, monthStr) => {
    if (!monthStr || !employee.joinDate) return true;
    const [year, month] = monthStr.split('-').map(Number);
    const joiningDate = new Date(employee.joinDate);
    const joiningYear = joiningDate.getFullYear();
    const joiningMonth = joiningDate.getMonth() + 1;
    if (joiningYear > year || (joiningYear === year && joiningMonth > month)) return false;
    return true;
  };

  const isCurrentMonth = (month) => {
    if (!month) return true;
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const [year, monthNum] = month.split('-').map(Number);
    return year === currentYear && monthNum === currentMonth;
  };

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

  const shouldIncludeWeekOffInSalary = (month) => {
    if (!month) return false;
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    
    const [year, monthNum] = month.split('-').map(Number);
    
    if (year < currentYear) return true;
    if (year === currentYear && monthNum < currentMonth) return true;
    
    if (year === currentYear && monthNum === currentMonth) {
      return currentDay >= 26;
    }
    
    return false;
  };

  const isPayslipDownloadAllowed = (month) => {
    if (!month) return false;
    if (isHistoricalMonth(month)) return true;
    if (isCurrentMonth(month)) {
      const today = new Date();
      const currentDay = today.getDate();
      const daysInMonth = getDaysInMonth(month);
      return currentDay >= daysInMonth;
    }
    return true;
  };

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

      const overlapStart = new Date(Math.max(leaveStart, startOfMonth));
      const overlapEnd = new Date(Math.min(leaveEnd, endOfMonth));
      const currentMonthDays = overlapStart <= overlapEnd ? Math.ceil(Math.abs(overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1 : 0;

      const safeStartOfMonth = new Date(startOfMonth);
      safeStartOfMonth.setDate(startOfMonth.getDate() - 6);
      const overlapSafeStart = new Date(Math.max(leaveStart, safeStartOfMonth));
      const inExtendedMonth = overlapSafeStart <= overlapEnd;

      if (!leavesMap[employeeId]) {
        leavesMap[employeeId] = {
          CL: 0,
          SL: 0,
          EL: 0,
          COFF: 0,
          LOP: 0,
          Other: 0,
          leaveDetails: []
        };
      }

      const leaveType = leave.leaveType || 'Other';

      if (currentMonthDays > 0) {
        if (leavesMap[employeeId][leaveType] !== undefined) {
          leavesMap[employeeId][leaveType] += currentMonthDays;
        } else if (["Casual Leave", "Casual", "casual", "Earned Leave", "Earned", "earned", "Sick Leave", "Sick", "sick", "Comp Off", "comp off"].includes(leaveType)) {
          const typeMap = { 
            "Casual Leave": "CL", "Casual": "CL", "casual": "CL", 
            "Earned Leave": "EL", "Earned": "EL", "earned": "EL", 
            "Sick Leave": "SL", "Sick": "SL", "sick": "SL", 
            "Comp Off": "COFF", "comp off": "COFF" 
          };
          leavesMap[employeeId][typeMap[leaveType]] += currentMonthDays;
        } else {
          leavesMap[employeeId].Other += currentMonthDays;
        }
      }

      if (inExtendedMonth) {
        leavesMap[employeeId].leaveDetails.push({
          type: leaveType,
          startDate: leave.startDate,
          endDate: leave.endDate,
          days: Math.ceil(Math.abs(leaveEnd - leaveStart) / (1000 * 60 * 60 * 24)) + 1,
          reason: leave.reason || '',
          status: leave.status || 'pending'
        });
      }
    });

    setEmployeeLeaves(leavesMap);
    return leavesMap;
  }, []);

  const processCompOffData = useCallback(async (selectedMonth, leavesData) => {
    try {
      const [year, monthNum] = (selectedMonth || new Date().toISOString().slice(0, 7)).split('-').map(Number);
      const startOfMonth = new Date(year, monthNum - 1, 1);
      const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);

      const response = await axios.get(COMPOFF_API_URL);
      const compOffs = response.data || [];

      const compOffMap = {};
      const compOffDetailsMap = {};

      for (const co of compOffs) {
        if (co.status === "approved") {
          const employeeId = co.employeeId;
          const workDate = new Date(co.workDate);

          if (workDate >= startOfMonth && workDate <= endOfMonth) {
            if (!compOffMap[employeeId]) {
              compOffMap[employeeId] = { earned: 0, used: 0, balance: 0 };
              compOffDetailsMap[employeeId] = [];
            }
            compOffMap[employeeId].earned += 1;
            compOffDetailsMap[employeeId].push({
              type: 'earned',
              date: co.workDate,
              reason: co.reason || 'Comp-off earned'
            });
          }
        }
      }

      setEmployeeCompOffs(compOffMap);
      setCompOffDetails(compOffDetailsMap);
      return compOffMap;

    } catch (error) {
      console.error("Error fetching comp-offs:", error);
      return {};
    }
  }, [COMPOFF_API_URL]);

  const filterInactiveEmployees = useCallback((payrollData, employeesMap) => {
    if (!Array.isArray(payrollData)) return [];
    return payrollData.filter(item => {
      const employeeData = employeesMap[item.employeeId];
      if (!employeeData) return false;
      return !isEmployeeHidden(employeeData);
    });
  }, []);

  const filterEmployeesByJoiningDate = useCallback((employees, monthStr) => {
    if (!monthStr || !employees.length) return employees;
    return employees.filter(emp => wasEmployeeEmployedInMonth(emp, monthStr));
  }, []);

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

  const fetchEmployeeAttendance = async (employeeId, month) => {
    setAttendanceLoading(true);
    try {
      let url = `${ATTENDANCE_DETAILS_API_URL}?employeeId=${employeeId}`;
      if (month) url += `&month=${month}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.records && data.records.length > 0) {
        let filteredByMonth = data.records;
        if (month) {
          const [year, monthNum] = month.split('-').map(Number);
          filteredByMonth = data.records.filter(record => {
            const recordDate = new Date(record.checkInTime);
            return recordDate.getFullYear() === year && recordDate.getMonth() + 1 === monthNum;
          });
        }
        const sortedRecords = filteredByMonth.sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime));
        setSelectedEmployeeAttendance(sortedRecords);
      } else {
        setSelectedEmployeeAttendance([]);
      }
    } catch (error) {
      console.error("Error fetching employee attendance:", error);
      setSelectedEmployeeAttendance([]);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleRowClick = async (employee) => {
    setSelectedEmployee(employee);
    const monthToFetch = selectedMonth || new Date().toISOString().slice(0, 7);
    await fetchEmployeeAttendance(employee.employeeId, monthToFetch);
    setShowAttendancePopup(true);
  };

  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return null;
    const checkInTime = new Date(checkIn);
    const checkOutTime = new Date(checkOut);
    const diffHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
    return diffHours.toFixed(1);
  };

  const calculateActualWeekOffDays = (employeeId, year, monthNum, attendanceMap, employeeLeavesData, targetWeekOffCount) => {
    const endDate = new Date(year, monthNum, 0);
    const sundays = [];
    for (let d = new Date(year, monthNum - 1, 1); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === 0) {
        sundays.push(new Date(d));
      }
    }

    let earnedWeekOffs = 0;

    sundays.forEach(sunday => {
      let presentOrLeaveDays = 0;
      
      for (let i = 6; i >= 0; i--) {
        const currentDate = new Date(sunday);
        currentDate.setDate(sunday.getDate() - i);
        
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (currentDate > today) {
           presentOrLeaveDays++;
           continue;
        }
        
        const dateKey = currentDate.toLocaleDateString('en-CA');
        const hasAttendance = attendanceMap.has(dateKey);
        const isLeave = isLeaveDayForDate(currentDate, employeeId, employeeLeavesData);
        
        if (hasAttendance || isLeave) {
          presentOrLeaveDays++;
        }
      }
      
      if (presentOrLeaveDays >= 5) {
        earnedWeekOffs++;
      }
    });
    
    return earnedWeekOffs;
  };
  
  const isLeaveDayForDate = (date, employeeId, employeeLeavesData) => {
    if (!date || !employeeId) return false;
    const leaves = employeeLeavesData[employeeId];
    if (!leaves || !leaves.leaveDetails) return false;
    const dateStr = date.toLocaleDateString('en-CA');
    return leaves.leaveDetails.some(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      const checkDate = new Date(dateStr);
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  const fetchData = useCallback(async (month = "") => {
    let isMounted = true;

    try {
      setLoading(true);
      setError("");

      const includeWeekOffInSalary = shouldIncludeWeekOffInSalary(month);
      const isHistorical = isHistoricalMonth(month);
      const isCurrent = isCurrentMonth(month);
      const targetMonth = month || selectedMonth;

      const [employeesRes, leavesRes, holidaysRes, summaryRes] = await Promise.all([
        fetch(EMPLOYEES_API_URL),
        fetch(LEAVES_API_URL),
        fetch(`${API_BASE_URL}/holidays/all`),
        fetch(`${ATTENDANCE_SUMMARY_API_URL}${targetMonth ? `?month=${targetMonth}` : ''}`)
      ]);

      let employeesData = [];
      if (employeesRes.ok) {
        const employeesDataRaw = await employeesRes.json();
        employeesData = Array.isArray(employeesDataRaw) ? employeesDataRaw : (employeesDataRaw.data || []);
      }

      let leavesData = leavesRes.ok ? await leavesRes.json() : [];
      
      let holidaysData = holidaysRes.ok ? await holidaysRes.json() : [];
      
      let summaryData = [];
      if (summaryRes.ok) {
        const json = await summaryRes.json();
        summaryData = json.summary || [];
      }

      let allAttendanceRecords = [];
      try {
        const attendanceRes = await fetch(`${ATTENDANCE_DETAILS_API_URL}?month=${targetMonth}`);
        if (attendanceRes.ok) {
          const attData = await attendanceRes.json();
          allAttendanceRecords = attData.records || [];
        }
      } catch (err) {
        console.warn("Failed to fetch attendance records:", err);
      }

      let masterShiftsData = [];
      let shiftsData = [];
      try {
        const shiftsRes = await fetch(`${API_BASE_URL}/shifts/master`);
        if (shiftsRes.ok) {
          const shiftsResult = await shiftsRes.json();
          masterShiftsData = shiftsResult.data || [];
        }
        const assignmentsRes = await fetch(`${API_BASE_URL}/shifts/assignments`);
        if (assignmentsRes.ok) {
          const assignmentsResult = await assignmentsRes.json();
          shiftsData = assignmentsResult.data || [];
        }
      } catch (err) {
        console.warn("Failed to fetch shift data:", err);
      }

      const employeesForMonth = filterEmployeesByJoiningDate(employeesData, targetMonth);
      const activeEmployees = employeesForMonth.filter(emp => !isEmployeeHidden(emp));
      
      const employeesMap = {};
      activeEmployees.forEach(emp => {
        employeesMap[emp.employeeId] = {
          salaryPerMonth: emp.salaryPerMonth || 0,
          shiftHours: emp.shiftHours || 8,
          weekOffPerMonth: emp.weekOffPerMonth || 0,
          weekOffDay: emp.weekOffDay || 'Sunday',
          name: emp.name,
          employeeId: emp.employeeId,
          department: emp.department || '',
          designation: emp.role || emp.designation || '',
          joiningDate: emp.joinDate || emp.joiningDate || '',
          bankAccount: emp.bankAccount || emp.bankAccountNo || '',
          panCard: emp.panCard || emp.panNumber || '',
          pfNo: emp.pfNumber || emp.pfNo || '',
          uanNo: emp.uanNumber || emp.uanNo || '',
          esicNo: emp.esicNumber || emp.esicNo || '',
          branch: emp.branch || '',
          weekOffType: emp.weekOffType || '0+4',
          _id: emp._id,
          originalSalary: emp.originalSalary || emp.salaryPerMonth,
          salaryIncrements: emp.salaryIncrements || [],
          basicPay: emp.basicPay || 0,
          hra: emp.hra || 0,
          conveyanceAllowance: emp.conveyanceAllowance || 0,
          medicalAllowance: emp.medicalAllowance || 0,
          performanceAllowance: emp.performanceAllowance || 0,
          specialAllowance: emp.specialAllowance || 0,
          gmc: emp.gmc || emp.gmcAmount || 0,
          profTax: emp.ptax || emp.profTax || 0,
          otherDeductions: emp.otherDeductions || 0
        };
      });
      
      if (isMounted) {
        setEmployeesMasterData(employeesMap);
        setAllEmployees(employeesData);
      }

      extractUniqueValues(activeEmployees);

      let holidayCount = 0;
      if (Array.isArray(holidaysData)) {
        const [sYear, sMonth] = targetMonth.split('-').map(Number);
        holidaysData.forEach(h => {
          if (h.isActive !== false) {
            const hStartStr = h.fromDate;
            const hEndStr = h.toDate;
            if (hStartStr && hStartStr.startsWith(`${sYear}-${String(sMonth).padStart(2, '0')}`) &&
                hEndStr && hEndStr.startsWith(`${sYear}-${String(sMonth).padStart(2, '0')}`)) {
              holidayCount += h.totalDays || 1;
            } else if (hStartStr && hEndStr) {
              const hStart = new Date(hStartStr);
              const hEnd = new Date(hEndStr);
              const startOfMonth = new Date(sYear, sMonth - 1, 1);
              const endOfMonth = new Date(sYear, sMonth, 0, 23, 59, 59);
              const overlapStart = new Date(Math.max(hStart.getTime(), startOfMonth.getTime()));
              const overlapEnd = new Date(Math.min(hEnd.getTime(), endOfMonth.getTime()));
              if (overlapStart <= overlapEnd) {
                const days = Math.round((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24));
                holidayCount += Math.max(1, days);
              }
            }
          }
        });
      }

      const currentLeavesMap = processLeavesData(leavesData, targetMonth);
      const currentCompOffsMap = await processCompOffData(targetMonth, leavesData);

      const [year, monthNum] = targetMonth.split('-').map(Number);
      const daysInMonthValue = getDaysInMonth(targetMonth);
      const processedSalaries = [];
      
      for (const emp of activeEmployees) {
        const summary = summaryData.find(x => x.employeeId === emp.employeeId) || {};
        
        let targetWeekOffCount = emp.weekOffPerMonth || 4;
        
        let attendanceForEmployee = [];
        try {
          const attendanceRes = await fetch(`${ATTENDANCE_DETAILS_API_URL}?employeeId=${emp.employeeId}`);
          if (attendanceRes.ok) {
            const attendanceData = await attendanceRes.json();
            if (attendanceData.records) {
              const firstDayOfMonth = new Date(year, monthNum - 1, 1);
              const safeStartDate = new Date(firstDayOfMonth);
              safeStartDate.setDate(firstDayOfMonth.getDate() - 6);
              
              attendanceForEmployee = attendanceData.records.filter(record => {
                const recordDate = new Date(record.checkInTime);
                return recordDate >= safeStartDate && recordDate <= new Date(year, monthNum, 0, 23, 59, 59);
              });
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch attendance for ${emp.name}:`, err.message);
        }
        
        const attendanceMapForCalc = new Map();
        attendanceForEmployee.forEach(record => {
          if (record.checkInTime) {
            const dateKey = new Date(record.checkInTime).toLocaleDateString('en-CA');
            attendanceMapForCalc.set(dateKey, record);
          }
        });
        
        const isMay2026OrLater = year > 2026 || (year === 2026 && monthNum >= 5);
        let finalWeekOffDays = targetWeekOffCount;

        if (isMay2026OrLater) {
            targetWeekOffCount = 4;
            const actualWeekOffCount = calculateActualWeekOffDays(
              emp.employeeId, 
              year, 
              monthNum, 
              attendanceMapForCalc, 
              currentLeavesMap, 
              targetWeekOffCount
            );
            finalWeekOffDays = Math.min(targetWeekOffCount, actualWeekOffCount);
        } else {
            finalWeekOffDays = (summary.weekOffPerMonth !== undefined && summary.weekOffPerMonth !== null) 
              ? summary.weekOffPerMonth 
              : targetWeekOffCount;
        }
        
        let salaryForMonth = emp.salaryPerMonth || 0;
        let historicalEffectiveFrom = emp.joinDate;
        let originalSalary = emp.originalSalary || emp.salaryPerMonth;
        let incrementDetails = null;
        
        try {
          const targetDate = new Date(year, monthNum - 1, 15);
          const formattedDate = targetDate.toISOString().split('T')[0];
          
          const salaryRes = await fetch(`${API_BASE_URL}/employees/${emp._id}/salary-for-date?date=${formattedDate}`);
          if (salaryRes.ok) {
            const salaryData = await salaryRes.json();
            if (salaryData.success && salaryData.data) {
              salaryForMonth = salaryData.data.salaryPerMonth;
              historicalEffectiveFrom = salaryData.data.effectiveFrom || emp.joinDate;
              originalSalary = salaryData.data.originalSalary || emp.originalSalary || emp.salaryPerMonth;
              incrementDetails = salaryData.data.incrementDetails;
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch salary for ${emp.name}:`, err.message);
        }
        
        const dailyRate = salaryForMonth > 0 ? salaryForMonth / daysInMonthValue : 0;
        const presentDaysCount = summary.presentDays ?? 0;
        const halfDaysCount = summary.halfDayWorking ?? 0;
        const compOffData = currentCompOffsMap[emp.employeeId] || { balance: 0 };
        
        let calculatedSalary = 0;
        if (salaryForMonth > 0 && daysInMonthValue > 0) {
          const effectivePaidDays = presentDaysCount + (halfDaysCount * 0.5) + (includeWeekOffInSalary ? finalWeekOffDays : 0) + holidayCount + compOffData.balance;
          calculatedSalary = effectivePaidDays * dailyRate;
        }

        // ✅ Re-implement exact AttendanceSummary frontend logic for accurate OT calculation
        const parseTimeStr = (timeStr) => {
          if (!timeStr) return null;
          const match = timeStr.trim().match(/(\d{1,2})[:.](\d{2})\s*(AM|PM|am|pm)?/i);
          if (!match) return null;
          let hours = parseInt(match[1]);
          const ampm = match[3] ? match[3].toUpperCase() : null;
          if (ampm === "PM" && hours < 12) hours += 12;
          if (ampm === "AM" && hours === 12) hours = 0;
          return `${hours.toString().padStart(2, '0')}:${match[2]}`;
        };

        const parseShiftTimeRange = (timeRange) => {
          if (!timeRange) return { start: null, end: null };
          let parts = timeRange.split(/[-]| to /i).map(t => t.trim());
          if (parts.length >= 2) return { start: parseTimeStr(parts[0]), end: parseTimeStr(parts[1]) };
          return { start: null, end: null };
        };

        const getDefaultShiftTime = (shiftType) => {
          const shiftTimes = {
            "A": { start: "10:00", end: "19:00", grace: 5, isBrakeShift: false },
            "B": { start: "14:00", end: "22:00", grace: 5, isBrakeShift: false },
            "C": { start: "18:00", end: "21:00", grace: 5, isBrakeShift: false },
            "D": { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false },
            "E": { start: "10:00", end: "21:00", grace: 5, isBrakeShift: false },
            "F": { start: "14:00", end: "23:00", grace: 5, isBrakeShift: false },
            "G": { start: "09:00", end: "21:00", grace: 5, isBrakeShift: false },
            "H": { start: "09:00", end: "21:00", grace: 5, isBrakeShift: false },
            "I": { start: "07:00", end: "17:00", grace: 5, isBrakeShift: false },
            "BR": { start: "07:00", end: "21:30", grace: 5, isBrakeShift: true },
          };
          return shiftTimes[shiftType] || { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false };
        };

        const getEmployeeShift = (employeeId) => {
          const shiftAssignment = shiftsData.find(s => s.employeeAssignment?.employeeId === employeeId || s.employeeId === employeeId);
          if (!shiftAssignment) return null;
          const shiftType = shiftAssignment.shiftType;
          const masterShift = masterShiftsData.find(shift => shift.shiftType === shiftType);
          if (!masterShift) return getDefaultShiftTime(shiftType);
          if (masterShift.isBrakeShift && masterShift.timeSlots?.length >= 2) {
            const slot1 = parseShiftTimeRange(masterShift.timeSlots[0]?.timeRange);
            const slot2 = parseShiftTimeRange(masterShift.timeSlots[1]?.timeRange);
            return { start: slot1.start || "07:00", end: slot2.end || "21:30", grace: 5, isBrakeShift: true };
          }
          if (masterShift.timeSlots?.length > 0 && masterShift.timeSlots[0].timeRange) {
            const parsed = parseShiftTimeRange(masterShift.timeSlots[0].timeRange);
            return { start: parsed.start || "09:00", end: parsed.end || "18:00", grace: 5, isBrakeShift: false };
          }
          return getDefaultShiftTime(shiftType);
        };

        const getEmployeeShiftHoursActual = (employeeId) => {
          const shift = getEmployeeShift(employeeId);
          if (!shift) return 9;
          const [startHour, startMinute] = shift.start.split(':').map(Number);
          const [endHour, endMinute] = shift.end.split(':').map(Number);
          let startMinutes = startHour * 60 + startMinute;
          let endMinutes = endHour * 60 + endMinute;
          if (endMinutes <= startMinutes) endMinutes += 24 * 60;
          return (endMinutes - startMinutes) / 60;
        };

        const calculateOTActual = (employeeId, hoursWorked) => {
          const h = Number(hoursWorked) || 0;
          const shiftHours = getEmployeeShiftHoursActual(employeeId);
          if (h > shiftHours) {
            return Number((h - shiftHours).toFixed(2));
          }
          return 0;
        };

        let totalOTHours = 0;
        allAttendanceRecords.forEach(record => {
          if (record.employeeId !== emp.employeeId) return;
          if (record.checkInTime) {
              const recordMonth = new Date(record.checkInTime).toISOString().slice(0, 7);
              if (recordMonth !== targetMonth) return;
          }
          let hoursWorked = 0;
          if (record.hours) {
            hoursWorked = parseFloat(record.hours);
          } else if (record.totalHours) {
            hoursWorked = parseFloat(record.totalHours);
          } else if (record.checkInTime && record.checkOutTime) {
            const checkIn = new Date(record.checkInTime);
            const checkOut = new Date(record.checkOutTime);
            hoursWorked = (checkOut - checkIn) / (1000 * 60 * 60);
          }
          totalOTHours += calculateOTActual(emp.employeeId, hoursWorked);
        });

        totalOTHours = Number(totalOTHours.toFixed(2));
        const formattedOTHours = formatDecimalHours(totalOTHours);
        
        const salaryObj = {
          employeeId: emp.employeeId,
          name: emp.name,
          presentDays: presentDaysCount,
          workingDays: summary.totalWorkingDays ?? 0,
          totalWorkingDays: summary.totalWorkingDays ?? 0,
          halfDayWorking: halfDaysCount,
          fullDayNotWorking: summary.fullDayNotWorking ?? 0,
          calculatedSalary: Math.round(calculatedSalary),
          baseCalculatedSalary: Math.round(calculatedSalary),
          salaryPerMonth: salaryForMonth,
          currentSalary: emp.salaryPerMonth,
          originalSalary: originalSalary,
          salaryPerDay: dailyRate,
          weekOffs: finalWeekOffDays,
          actualWeekOffCount: finalWeekOffDays,
          targetWeekOffCount: targetWeekOffCount,
          weekOffDay: emp.weekOffDay || 'Sunday',
          totalLeaves: 0,
          month: targetMonth || "No Month",
          monthDays: daysInMonthValue,
          includeWeekOffInSalary: includeWeekOffInSalary,
          isHistoricalMonth: isHistorical,
          isCurrentMonth: isCurrent,
          department: emp.department || 'N/A',
          designation: emp.role || emp.designation || 'N/A',
          compOffEarned: 0,
          compOffUsed: 0,
          compOffBalance: 0,
          holidayCount: holidayCount,
          historicalEffectiveFrom: historicalEffectiveFrom,
          incrementDetails: incrementDetails,
          _id: emp._id,
          basicPay: emp.basicPay,
          hra: emp.hra,
          conveyanceAllowance: emp.conveyanceAllowance,
          medicalAllowance: emp.medicalAllowance,
          performanceAllowance: emp.performanceAllowance,
          specialAllowance: emp.specialAllowance,
          gmcAmount: emp.gmc,
          ptax: emp.profTax,
          otherDeductions: emp.otherDeductions,
          overTimeHours: totalOTHours,
          overTimeHoursFormatted: formattedOTHours,
          shiftHours: emp.shiftHours || 8
        };

        // ✅ Apply saved OT settings on initial load from localStorage
        const savedOTEmpsString = localStorage.getItem("payrollSelectedOTEmployees");
        const savedOTEmps = savedOTEmpsString ? new Set(JSON.parse(savedOTEmpsString)) : new Set();

        if (totalOTHours > 0 && savedOTEmps.has(emp.employeeId)) {
            const otRatePerHour = dailyRate / (emp.shiftHours || 8);
            const otAmount = totalOTHours * otRatePerHour;
            salaryObj.calculatedSalary = Math.round(salaryObj.calculatedSalary + otAmount);
            salaryObj.otAmount = Math.round(otAmount);
        }

        processedSalaries.push(salaryObj);
      }

      const activeProcessedSalaries = filterInactiveEmployees(processedSalaries, employeesMap);
      
      if (isMounted) {
        setRecords(activeProcessedSalaries);
        setFilteredRecords(activeProcessedSalaries);
      }

    } catch (err) {
      console.error("ERROR:", err);
      if (isMounted) setError(err.message);
    } finally {
      if (isMounted) {
        setLoading(false);
        setIsLoadingMonth(false);
      }
    }
  }, [EMPLOYEES_API_URL, LEAVES_API_URL, API_BASE_URL, ATTENDANCE_SUMMARY_API_URL, ATTENDANCE_DETAILS_API_URL, processLeavesData, filterInactiveEmployees, filterEmployeesByJoiningDate, processCompOffData, selectedMonth]);

  useEffect(() => {
    if (records.length === 0) return;

    const processRecordsWithAdditions = (prevRecords) => 
      prevRecords.map(record => {
        let newCalculatedSalary = record.baseCalculatedSalary;
        let otAmount = 0;
        if (record.overTimeHours > 0 && selectedOTEmployees.has(record.employeeId)) {
            const dailyRate = record.salaryPerDay || 0;
            const shiftHours = record.shiftHours || 8;
            const otRatePerHour = dailyRate / shiftHours;
            otAmount = record.overTimeHours * otRatePerHour;
            newCalculatedSalary += otAmount;
        }
        return {
          ...record,
          otAmount: Math.round(otAmount),
          calculatedSalary: Math.round(newCalculatedSalary)
        };
      });

    setRecords(processRecordsWithAdditions);
    setFilteredRecords(processRecordsWithAdditions);
  }, [employeeCompOffs, employeeLeaves, employeesMasterData, monthDays, selectedMonth, selectedOTEmployees]);

  useEffect(() => {
    fetchData(selectedMonth);
  }, [fetchData, selectedMonth]);

  useEffect(() => {
    let filtered = records.filter(record =>
      record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeId?.toString().includes(searchTerm)
    );

    if (filterDepartment) {
      filtered = filtered.filter(record => record.department === filterDepartment);
    }

    if (filterDesignation) {
      filtered = filtered.filter(record => record.designation === filterDesignation);
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterDepartment, filterDesignation, records]);

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setFromDate("");
    setToDate("");
  };

  const handleDateRangeFilter = () => {
    if (!fromDate || !toDate) {
      alert("Please select both From and To dates");
      return;
    }

    const fromMonth = fromDate.slice(0, 7);
    const toMonth = toDate.slice(0, 7);

    if (fromMonth !== toMonth) {
      alert("Date range must be within the same month");
      return;
    }

    setSelectedMonth(fromMonth);
    fetchData(fromMonth);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterDesignation("");
    setFromDate("");
    setToDate("");
    const currentMonth = new Date().toISOString().slice(0, 7);
    setSelectedMonth(currentMonth);
    fetchData(currentMonth);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const indexOfLastRecord = currentPage * itemsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

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
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        pageNumbers.push(i);
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  const calculateSalary = (employee) => employee.calculatedSalary || 0;

  const calculateDailyRate = (employee) => {
    const salary = employee.salaryPerMonth || 0;
    if (!salary || salary === 0) return 0;
    const daysInMonth = employee.monthDays || monthDays || getDaysInMonth(employee.month || selectedMonth);
    return (salary / daysInMonth).toFixed(2);
  };

  const getEmployeeData = (employee) => {
    const masterData = employeesMasterData[employee.employeeId] || {};
    return {
      ...masterData,
      salaryPerMonth: employee.salaryPerMonth || masterData.salaryPerMonth || 0,
      masterSalaryPerMonth: masterData.salaryPerMonth || 0,
      shiftHours: masterData.shiftHours || 8,
      weekOffPerMonth: employee.weekOffs || masterData.weekOffPerMonth || 0,
      name: employee.name || masterData.name || '',
      designation: employee.designation || masterData.designation || '',
      department: employee.department || masterData.department || '',
      joiningDate: masterData.joiningDate || '',
      bankAccount: masterData.bankAccount || '',
      panNo: masterData.panCard || '',
      pfNo: masterData.pfNo || '',
      uanNo: masterData.uanNo || '',
      esicNo: masterData.esicNo || '',
      branch: masterData.branch || '',
      employeeId: employee.employeeId,
      weekOffDay: masterData.weekOffDay || '',
      weekOffType: masterData.weekOffType || '0+4',
      status: employee.status || masterData.status || 'active',
      basicPay: employee.basicPay || masterData.basicPay || 0,
      hra: employee.hra || masterData.hra || 0,
      conveyanceAllowance: employee.conveyanceAllowance || masterData.conveyanceAllowance || 0,
      medicalAllowance: employee.medicalAllowance || masterData.medicalAllowance || 0,
      performanceAllowance: employee.performanceAllowance || masterData.performanceAllowance || 0,
      specialAllowance: employee.specialAllowance || masterData.specialAllowance || 0,
      gmc: employee.gmcAmount || masterData.gmc || 0,
      profTax: employee.ptax || masterData.profTax || 0,
      otherDeductions: employee.otherDeductions || masterData.otherDeductions || 0
    };
  };

  const getWeekOffDaysForDisplay = (employee) => employee.weekOffs || 0;

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const weekOffDaysForSalary = employee.weekOffs || 0;

    setEditFormData({
      presentDays: employee.presentDays || 0,
      workingDays: employee.totalWorkingDays || 0,
      halfDayWorking: employee.halfDayWorking || 0,
      fullDayNotWorking: employee.fullDayNotWorking || 0,
      calculatedSalary: employee.calculatedSalary || 0,
      weekOffDays: weekOffDaysForSalary,
      holidays: employee.holidayCount || 0,
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const employeeData = getEmployeeData(selectedEmployee);
    const leaves = employeeLeaves[selectedEmployee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const weekOffDays = editFormData.weekOffDays || 0;
    const daysInMonth = selectedEmployee.monthDays || monthDays || getDaysInMonth(selectedEmployee.month || selectedMonth);
    const dailyRate = employeeData.salaryPerMonth / daysInMonth;

    const workingDays = editFormData.presentDays || 0; 
    const halfDays = editFormData.halfDayWorking || 0;
    const holidays = editFormData.holidays || selectedEmployee.holidayCount || 0;
    const effectiveWorkingDays = workingDays + (0.5 * halfDays);
    const compOffData = employeeCompOffs[selectedEmployee.employeeId];
    const compOffBalance = compOffData?.balance || 0;
    
    const paidDays = Math.max(0, effectiveWorkingDays + weekOffDays + holidays + compOffBalance);
    let baseSalary = paidDays * dailyRate;

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
      const response = await fetch(UPDATE_PAYROLL_API_URL, {
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
          holidays: editFormData.holidays || selectedEmployee.holidayCount || 0
        })
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save changes");
      }

      const updatedRecords = records.map(record => {
        if (record.employeeId === selectedEmployee.employeeId) {
          const serverSummary = result.summary || {};
          return {
            ...record,
            ...updatedData,
            extraWork: serverSummary.extraWork || updatedData.extraWork,
            calculatedSalary: serverSummary.calculatedSalary !== undefined ? serverSummary.calculatedSalary : updatedData.calculatedSalary,
            presentDays: serverSummary.presentDays !== undefined ? serverSummary.presentDays : record.presentDays,
            totalWorkingDays: serverSummary.totalWorkingDays !== undefined ? serverSummary.totalWorkingDays : record.totalWorkingDays
          };
        }
        return record;
      });

      setRecords(updatedRecords);
      setFilteredRecords(prev => prev.map(r =>
        r.employeeId === selectedEmployee.employeeId ? updatedRecords.find(ur => ur.employeeId === selectedEmployee.employeeId) : r
      ));

      setShowEditModal(false);
      alert("Salary details saved successfully!");
    } catch (error) {
      console.error("Error saving payroll:", error);
      alert("Failed to save payroll changes: " + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleExtraWorkChange = (e) => {
    const { name, value } = e.target;
    setExtraWorkData(prev => ({
      ...prev,
      [name]: name === 'reason' ? value : (parseFloat(value) || 0)
    }));
  };

  const handleReset = () => {
    if (!selectedEmployee) return;

    const employeeData = getEmployeeData(selectedEmployee);
    const leaves = employeeLeaves[selectedEmployee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const weekOffDays = selectedEmployee.weekOffs || 0;

    const daysInMonth = selectedEmployee.monthDays || monthDays || getDaysInMonth(selectedEmployee.month || selectedMonth);
    const dailyRate = employeeData.salaryPerMonth / daysInMonth;

    const workingDays = selectedEmployee.presentDays || 0; 
    const holidays = selectedEmployee.holidayCount || 0;
    const compOffData = employeeCompOffs[selectedEmployee.employeeId];
    const compOffBalance = compOffData?.balance || 0;
    
    let paidDays = Math.max(0, workingDays + (selectedEmployee.halfDayWorking || 0) * 0.5 + weekOffDays + holidays + compOffBalance);

    const systemCalculatedSalary = Math.round(paidDays * dailyRate);

    setEditFormData({
      ...editFormData,
      calculatedSalary: systemCalculatedSalary,
      weekOffDays: weekOffDays,
    });

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

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const downloadInvoice = async (employee) => {
    const employeeMonth = employee.month || selectedMonth;
    const allowed = isPayslipDownloadAllowed(employeeMonth);

    if (!allowed) {
      const daysInMonth = getDaysInMonth(employeeMonth);
      alert(`Payslip download for current month is only allowed on or after the last day of the month (${daysInMonth}th).`);
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

        await axios.post("https://api.timelyhealth.in/user-activity/log", {
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
      } catch (error) {
        console.error("Failed to log payslip download:", error);
      }
    }
  };

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

    const daysInMonth = employee.monthDays || monthDays || getDaysInMonth(employee.month || selectedMonth);
    const dailyRate = parseFloat(calculateDailyRate(employee)) || 0;
    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const compOffData = employeeCompOffs[employee.employeeId] || { earned: 0, used: 0, balance: 0 };

    const actualWeekOffDays = getWeekOffDaysForDisplay(employee);
    const presentDays = employee.presentDays ?? 0;
    const halfDays = employee.halfDayWorking || 0;
    const holidays = employee.holidayCount || 0;

    let totalPaidDays = presentDays + (halfDays * 0.5) + actualWeekOffDays + holidays;
    if (compOffData.balance > 0) totalPaidDays += compOffData.balance;

    const halfDayDeductionAmount = (halfDays * 0.5) * dailyRate;
    const totalMonthDays = daysInMonth;
    
    let lopDays = Math.max(0, totalMonthDays - totalPaidDays);
    let lopAmount = lopDays * dailyRate;
    
    lopDays = Math.round(lopDays * 10) / 10;
    lopAmount = Math.round(lopAmount * 100) / 100;

    const grossSalary = employeeData.salaryPerMonth || 0;
    const bonus = employee.extraWork?.bonus || 0;
    const extraDaysPay = (employee.extraWork?.extraDays || 0) * dailyRate;
    const compOffPay = compOffData.balance * dailyRate;
    const otAmount = employee.otAmount || 0;
    const totalEarnings = grossSalary + bonus + extraDaysPay + compOffPay + otAmount;

    const otherDeductions = employee.extraWork?.deductions || 0;
    const totalDeductions = lopAmount + halfDayDeductionAmount + otherDeductions;
    const netPay = totalEarnings - totalDeductions;

    const grossTotal = employeeData.salaryPerMonth || 0;
    const masterComponentsSum = (employeeData.basicPay || 0) + (employeeData.hra || 0) + (employeeData.conveyanceAllowance || 0) + 
                                (employeeData.medicalAllowance || 0) + (employeeData.performanceAllowance || 0) + (employeeData.specialAllowance || 0);
    const masterGross = masterComponentsSum > 0 ? masterComponentsSum : 1;
    const historicalRatio = grossTotal > 0 && masterGross > 0 ? (grossTotal / masterGross) : 1;
    
    const earningsItems = [];
    
    const basicAmt = (employeeData.basicPay || 0) * historicalRatio;
    if (basicAmt > 0) earningsItems.push({ label: 'Basic Salary', amount: basicAmt });
    
    const hraAmt = (employeeData.hra || 0) * historicalRatio;
    if (hraAmt > 0) earningsItems.push({ label: 'HRA', amount: hraAmt });
    
    const convAmt = (employeeData.conveyanceAllowance || 0) * historicalRatio;
    if (convAmt > 0) earningsItems.push({ label: 'Conveyance Allowance', amount: convAmt });
    
    const medicalAmt = (employeeData.medicalAllowance || 0) * historicalRatio;
    if (medicalAmt > 0) earningsItems.push({ label: 'Medical Allowance', amount: medicalAmt });
    
    const perfAmt = (employeeData.performanceAllowance || 0) * historicalRatio;
    if (perfAmt > 0) earningsItems.push({ label: 'Performance Allowance', amount: perfAmt });
    
    const specialAmt = (employeeData.specialAllowance || 0) * historicalRatio;
    if (specialAmt > 0) earningsItems.push({ label: 'Special Allowance', amount: specialAmt });
    
    const extraPay = bonus + extraDaysPay;
    if (extraPay > 0) {
      earningsItems.push({ label: 'Bonus / Extra Work', amount: extraPay });
    }
    
    if (otAmount > 0) {
      earningsItems.push({ label: `Overtime (${employee.overTimeHoursFormatted || formatDecimalHours(employee.overTimeHours)})`, amount: otAmount });
    }
    
    if (compOffPay > 0) {
      earningsItems.push({ label: 'Comp-off / Holiday Pay', amount: compOffPay });
    }
    
    if (holidays > 0) {
      earningsItems.push({ label: `Public Holidays (${holidays})`, amount: holidays * dailyRate, isInfo: true });
    }
    
    earningsItems.push({ label: `Working Days (Full: ${presentDays})`, amount: 0, isInfo: true });
    earningsItems.push({ label: `Week Off Days (${actualWeekOffDays})`, amount: 0, isInfo: true });
    
    const deductionsItems = [];
    
    if (lopDays > 0) {
      deductionsItems.push({ label: `LOP / Absent (${lopDays} days)`, amount: lopAmount });
    } else {
      deductionsItems.push({ label: `LOP / Absent (0 days)`, amount: 0 });
    }
    
    if (halfDays > 0) {
      deductionsItems.push({ label: `Half Day Deductions (${halfDays} HD)`, amount: halfDayDeductionAmount });
    } else {
      deductionsItems.push({ label: `Half Day Deductions (0 HD)`, amount: 0 });
    }
    
    const gmcAmt = employee.gmcAmount || employeeData.gmc || 0;
    const ptaxAmt = employee.ptax || employeeData.profTax || 0;
    const extraDeductions = otherDeductions + (employee.otherDeductions || 0);
    let totalOtherDeductions = gmcAmt + ptaxAmt + extraDeductions;
    
    deductionsItems.push({ label: `Other Deductions`, amount: totalOtherDeductions });
    
    const totalEarningsAmt = earningsItems.filter(item => !item.isInfo).reduce((sum, item) => sum + item.amount, 0);
    const totalDeductionsAmt = deductionsItems.reduce((sum, item) => sum + item.amount, 0);
    const finalNetPay = totalEarningsAmt - totalDeductionsAmt;
    
    let tableRowsHTML = '';
    const maxRows = Math.max(earningsItems.length, deductionsItems.length);
    for (let i = 0; i < maxRows; i++) {
      const earn = earningsItems[i];
      const ded = deductionsItems[i];
      
      let earnAmountStr = '';
      if (earn) {
        if (earn.isInfo) {
          earnAmountStr = '-';
        } else {
          earnAmountStr = `₹${earn.amount.toFixed(2)}`;
        }
      }
      
      let dedAmountStr = '';
      if (ded) {
        dedAmountStr = `₹${ded.amount.toFixed(2)}`;
      }
      
      tableRowsHTML += `
        <tr>
          <td style="border: 1px solid #000; padding: 8px 10px;">${earn ? earn.label : ''}</td>
          <td style="border: 1px solid #000; padding: 8px 10px; text-align: right;">${earnAmountStr}</td>
          <td style="border: 1px solid #000; padding: 8px 10px;">${ded ? ded.label : ''}</td>
          <td style="border: 1px solid #000; padding: 8px 10px; text-align: right;">${dedAmountStr}</td>
        </tr>
      `;
    }
    
    const numberToWords = (num) => {
      const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
      const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
      if ((num = Math.abs(Math.round(num)).toString()).length > 9) return 'overflow';
      const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!n) return '';
      let str = '';
      str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
      str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
      str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
      str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
      str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Rupees Only' : 'Rupees Only';
      return str.trim();
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Payslip - ${employee.name}</title>
          <style>
            @page { size: A4; margin: 0; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: white; }
            .invoice-container { max-width: 210mm; margin: 0 auto; border: 1px solid #000; border-radius: 4px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 6px 8px; border: 1px solid #000; font-size: 12px; vertical-align: top; }
            .header-cell { border: none; padding: 12px; border-bottom: 1px solid #000; }
            .section-header { text-align: center; padding: 8px; font-weight: bold; background: #f5f5f5; }
            .total-row { font-weight: bold; background: #f9f9f9; }
            .gross-row { font-weight: bold; background: #f0f0f0; }
            .note-text { font-size: 9px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <table>
              <tr>
                <td colspan="6" class="header-cell">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="width: 200px;">
                      <img src="${templateConfig.logo}" alt="Logo" style="height: 40px; object-fit: contain;">
                    </div>
                    <div style="flex: 1; text-align: center;">
                      <h2 style="margin: 0; font-size: 16px;">${templateConfig.companyName}</h2>
                      <p style="margin: 2px 0 0; font-size: 8px;">${templateConfig.address}</p>
                    </div>
                    <div style="width: 200px;"></div>
                  </div>
                </td>
              </tr>
              <tr><td colspan="6" class="section-header">PAYSLIP ${formatMonthDisplay(employee.month || selectedMonth)}</td></tr>
              <tr>
                 <td width="25%"><strong>ID</strong></td><td width="25%">${employee.employeeId || '-'}</td>
                 <td width="25%"><strong>Joined</strong></td><td width="25%">${employeeData.joiningDate ? new Date(employeeData.joiningDate).toLocaleDateString('en-GB') : '-'}</td>
              </tr>
              <tr>
                  <td><strong>Name</strong></td><td>${employee.name || '-'}</td>
                  <td><strong>Department</strong></td><td>${employeeData.department || employee.department || '-'}</td>
              </tr>
              <tr>
                  <td><strong>Designation</strong></td><td>${employeeData.designation || employee.designation || '-'}</td>
                  <td><strong>Month</strong></td><td>${formatMonthDisplay(employee.month || selectedMonth)}</td>
                </tr>
                <tr>
                  <td><strong>Invoice Date</strong></td><td>${new Date().toLocaleDateString('en-GB')}</td>
                  <td><strong>Total Days</strong></td><td>${daysInMonth} Days</td>
                </tr>
                ${(employeeData.panNo) ? `<tr><td colspan="2"><strong>PAN No.:</strong> ${employeeData.panNo}</td><td colspan="2"></td></tr>` : ''}
                ${(employeeData.pfNo) ? `<tr><td colspan="2"><strong>PF No.:</strong> ${employeeData.pfNo}</td><td colspan="2"></td></tr>` : ''}
                ${(employeeData.uanNo) ? `<tr><td colspan="2"><strong>UAN No.:</strong> ${employeeData.uanNo}</td><td colspan="2"></td></tr>` : ''}
                ${(employeeData.branch) ? `<tr><td colspan="2"><strong>Branch:</strong> ${employeeData.branch}</td><td colspan="2"></td></tr>` : ''}
                ${(employeeData.esicNo) ? `<tr><td colspan="2"><strong>ESIC No.:</strong> ${employeeData.esicNo}</td><td colspan="2"></td></tr>` : ''}
                ${(employeeData.bankAccount) ? `<tr><td colspan="4"><strong>Bank Account:</strong> ${employeeData.bankAccount}</td></tr>` : ''}
              </table>
               
              <table style="border-top: none;">
                <tr style="background:#f0f0f0;">
                  <td style="width:40%;"><strong>EARNINGS</strong></td>
                  <td style="width:10%; text-align:center;"><strong>₹</strong></td>
                  <td style="width:40%;"><strong>DEDUCTIONS</strong></td>
                  <td style="width:10%; text-align:center;"><strong>₹</strong></td>
                </tr>
                ${tableRowsHTML}
                <tr class="gross-row">
                  <td><strong>Gross Earnings</strong></td>
                  <td style="text-align: right;"><strong>₹${totalEarningsAmt.toFixed(2)}</strong></td>
                  <td><strong>Total Deductions</strong></td>
                  <td style="text-align: right;"><strong>₹${totalDeductionsAmt.toFixed(2)}</strong></td>
                </tr>
                <tr class="total-row">
                  <td colspan="2"></td>
                  <td><strong>NET PAY</strong></td>
                  <td style="text-align: right;"><strong>₹${finalNetPay.toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td colspan="4"><strong>Net Payable (In words):</strong> ${numberToWords(finalNetPay)}</td>
                </tr>
                <tr>
                  <td colspan="4" class="note-text">Note: This is a System generated slip and does not require company sign and stamp.</td>
                </tr>
              </table>
            </div>
          </body>
        </html>
      `;
    };

  const getLeaveTypes = (employee) => {
    if (employee.leaveTypes && Object.keys(employee.leaveTypes).length > 0) {
      const leaveStrings = [];
      Object.entries(employee.leaveTypes).forEach(([type, count]) => {
        if (count > 0) leaveStrings.push(`${type.toUpperCase()}: ${count} `);
      });
      if (leaveStrings.length > 0) return leaveStrings.join(', ');
    }

    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const leaveStrings = [];

    if (leaves.CL > 0) leaveStrings.push(`CL: ${leaves.CL} `);
    if (leaves.SL > 0) leaveStrings.push(`SL: ${leaves.SL} `);
    if (leaves.EL > 0) leaveStrings.push(`EL: ${leaves.EL} `);
    if (leaves.COFF > 0) leaveStrings.push(`COFF: ${leaves.COFF} `);
    if (leaves.LOP > 0) leaveStrings.push(`LOP: ${leaves.LOP} `);
    if (leaves.Other > 0) leaveStrings.push(`Other: ${leaves.Other} `);

    return leaveStrings.length > 0 ? leaveStrings.join(', ') : 'No Leaves';
  };

  const formatMonthDisplay = (month) => {
    if (!month) return "Current Month";
    const [year, monthNum] = month.split('-');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
  };

  const AttendancePopupModal = () => {
    if (!showAttendancePopup) return null;
    
    const getEmployeeShiftHours = (employeeId) => employeesMasterData[employeeId]?.shiftHours || 8;

    const getAllDatesOfMonth = (month, employeeId) => {
      if (!month) return [];
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0);
      const dates = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
      return dates;
    };

    const monthDates = getAllDatesOfMonth(selectedMonth, selectedEmployee?.employeeId);

    const isLeaveDay = (date, employeeId, employeeLeavesData) => {
      if (!date || !employeeId) return false;
      const leaves = employeeLeavesData[employeeId];
      if (!leaves || !leaves.leaveDetails) return false;
      const dateStr = date.toLocaleDateString('en-CA');
      return leaves.leaveDetails.some(leave => {
        const startDate = new Date(leave.startDate);
        const endDate = new Date(leave.endDate);
        const checkDate = new Date(dateStr);
        return checkDate >= startDate && checkDate <= endDate;
      });
    };

    const shiftHours = getEmployeeShiftHours(selectedEmployee?.employeeId);

    const attendanceMap = new Map();
    selectedEmployeeAttendance.forEach(record => {
      if (record.checkInTime) {
        const dateKey = new Date(record.checkInTime).toLocaleDateString('en-CA');
        attendanceMap.set(dateKey, record);
      }
    });

    const targetWeekOffCount = selectedEmployee?.targetWeekOffCount || selectedEmployee?.weekOffs || 4;
    
    const getWeekOffDatesForMonth = () => {
      const weekOffDatesSet = new Set();
      if (!selectedEmployee || monthDates.length === 0) return weekOffDatesSet;
      
      const employeeId = selectedEmployee.employeeId;
      
      if (targetWeekOffCount === 4) {
        monthDates.forEach(date => {
          if (date.toLocaleDateString('en-US', { weekday: 'long' }) === 'Sunday') {
            weekOffDatesSet.add(date.toLocaleDateString('en-CA'));
          }
        });
        return weekOffDatesSet;
      }
      
      const absentDays = [];
      
      monthDates.forEach(date => {
        const dateKey = date.toLocaleDateString('en-CA');
        const hasAttendance = attendanceMap.has(dateKey);
        const isLeave = isLeaveDay(date, employeeId, employeeLeaves);
        const isSunday = date.toLocaleDateString('en-US', { weekday: 'long' }) === 'Sunday';
        
        if (!hasAttendance && !isLeave && !isSunday) {
          absentDays.push(date);
        }
      });
      
      absentDays.sort((a, b) => a - b);
      
      const weekOffDaysCount = Math.min(targetWeekOffCount, absentDays.length);
      for (let i = 0; i < weekOffDaysCount; i++) {
        weekOffDatesSet.add(absentDays[i].toLocaleDateString('en-CA'));
      }
      
      return weekOffDatesSet;
    };
    
    const weekOffDatesSet = getWeekOffDatesForMonth();

    const isWeekOffDay = (date, employeeId) => {
      if (!date || !employeeId) return false;
      return weekOffDatesSet.has(date.toLocaleDateString('en-CA'));
    };

    let weekOffCount = 0, leaveCount = 0, absentCount = 0, presentCount = 0;

    monthDates.forEach(date => {
      const dateKey = date.toLocaleDateString('en-CA');
      const record = attendanceMap.get(dateKey);
      const isWO = isWeekOffDay(date, selectedEmployee?.employeeId);
      const isLV = !isWO && isLeaveDay(date, selectedEmployee?.employeeId, employeeLeaves);
      
      if (isWO) weekOffCount++;
      else if (isLV) leaveCount++;
      else if (!record) absentCount++;
      else presentCount++;
    });

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg w-full max-w-7xl mx-4 max-h-[85vh] flex flex-col">
          <div className="sticky top-0 flex items-center justify-between p-3 bg-white border-b rounded-t-lg">
            <div>
              <h2 className="text-lg font-bold text-gray-700">Attendance Records - {selectedEmployee?.name}</h2>
              <p className="text-xs text-gray-500">ID: {selectedEmployee?.employeeId} | Shift: {shiftHours} hrs/day | Week-offs: {targetWeekOffCount} days</p>
            </div>
            <button onClick={() => setShowAttendancePopup(false)} className="text-gray-500 hover:text-gray-700">
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center justify-between px-4 py-2 bg-white border-b">
            <div className="flex gap-4 text-xs">
              <span className="font-medium">Total Days: <strong>{monthDates.length}</strong></span>
              <span className="text-orange-600">Week Off: <strong>{weekOffCount}</strong></span>
              <span className="text-red-600">Leaves: <strong>{leaveCount}</strong></span>
              <span className="text-gray-500">Absent: <strong>{absentCount}</strong></span>
              <span className="text-blue-700">Present: <strong>{presentCount}</strong></span>
            </div>
            <div className="flex gap-3 text-xs">
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div><span>Week Off</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div><span>Leave</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div><span>Absent</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-100 border border-green-300 rounded"></div><span>Present</span></div>
            </div>
          </div>
          
          <div className="flex-1 p-2 overflow-y-auto">
            {attendanceLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-500">Loading...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 text-white bg-gradient-to-r from-green-500 to-blue-600">
                    <tr>
                      <th className="px-2 py-1.5 text-center text-xs font-medium">Date</th>
                      <th className="px-2 py-1.5 text-center text-xs font-medium">Day</th>
                      <th className="px-2 py-1.5 text-center text-xs font-medium">In</th>
                      <th className="px-2 py-1.5 text-center text-xs font-medium">Out</th>
                      <th className="px-2 py-1.5 text-center text-xs font-medium">Hrs</th>
                      <th className="px-2 py-1.5 text-center text-xs font-medium">Type</th>
                      <th className="px-2 py-1.5 text-center text-xs font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {monthDates.map((date) => {
                      const dateKey = date.toLocaleDateString('en-CA');
                      const record = attendanceMap.get(dateKey);
                      const hasAttendance = !!record;
                      
                      const workHours = record ? calculateWorkHours(record.checkInTime, record.checkOutTime) : null;
                      
                      const isWeekOff = isWeekOffDay(date, selectedEmployee?.employeeId);
                      const isLeave = !isWeekOff && isLeaveDay(date, selectedEmployee?.employeeId, employeeLeaves);
                      
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                      
                      let bgColor = '';
                      let dayType = '';
                      let statusText = '';
                      
                      if (isWeekOff) {
                        bgColor = 'bg-orange-50';
                        dayType = 'Week Off';
                        statusText = 'Week Off';
                      } else if (isLeave) {
                        bgColor = 'bg-red-50';
                        dayType = 'Leave';
                        statusText = 'On Leave';
                      } else if (!hasAttendance) {
                        bgColor = 'bg-white';
                        dayType = 'Absent';
                        statusText = 'Absent';
                      } else {
                        bgColor = 'bg-white';
                        const hoursNum = parseFloat(workHours);
                        if (hoursNum >= shiftHours * 0.9) dayType = 'Full Day';
                        else if (hoursNum >= shiftHours * 0.5) dayType = 'Half Day';
                        else dayType = 'Absent';
                        statusText = record?.checkOutTime ? 'Completed' : (record?.status === "checked-in" ? 'Active' : 'Unknown');
                      }
                      
                      const formatTime = (dateString) => {
                        if (!dateString) return '-';
                        return new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                      };
                      
                      return (
                        <tr key={dateKey} className={`${bgColor} hover:bg-gray-50 transition-colors`}>
                          <td className="px-2 py-1 text-xs text-center">{date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                          <td className="px-2 py-1 text-xs text-center">{dayName}</td>
                          <td className="px-2 py-1 text-xs text-center">{!isWeekOff && !isLeave && hasAttendance ? formatTime(record?.checkInTime) : '-'}</td>
                          <td className="px-2 py-1 text-xs text-center">{!isWeekOff && !isLeave && hasAttendance ? formatTime(record?.checkOutTime) : '-'}</td>
                          <td className="px-2 py-1 text-xs text-center">{!isWeekOff && !isLeave && hasAttendance && workHours ? `${workHours}h` : '-'}</td>
                          <td className="px-2 py-1 text-center">
                            <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${isWeekOff ? 'bg-orange-100 text-orange-700' : isLeave ? 'bg-red-100 text-red-700' : !hasAttendance ? 'bg-gray-100 text-gray-500' : dayType === 'Full Day' ? 'bg-green-100 text-green-700' : dayType === 'Half Day' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{dayType}</span>
                            </td>
                          <td className="px-2 py-1 text-xs text-center">{statusText}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="flex justify-end p-3 bg-white border-t rounded-b-lg">
            <button onClick={() => setShowAttendancePopup(false)} className="px-4 py-1.5 text-sm text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700">Close</button>
          </div>
        </div>
      </div>
    );
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
          <button onClick={() => fetchData(selectedMonth)} className="px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-9xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Active Employees" value={filteredRecords.length} icon={FaUserTag} color="border-blue-500" />
          <StatCard title="Total Salary" value={`₹${filteredRecords.reduce((sum, emp) => sum + (emp.calculatedSalary || 0), 0).toLocaleString()}`} icon={FaBuilding} color="border-green-500" />
          <StatCard title="Active This Month" value={filteredRecords.filter(emp => !emp.isHistoricalMonth).length} icon={FaCalendarAlt} color="border-purple-500" />
          <StatCard title="On Leave" value={filteredRecords.filter(emp => (employeeLeaves[emp.employeeId]?.CL > 0 || employeeLeaves[emp.employeeId]?.EL > 0)).length} icon={FaSearch} color="border-red-500" />
        </div>

        <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <FaSearch className="absolute text-sm text-gray-500 transform -translate-y-1/2 left-2 top-1/2" />
              <input type="text" placeholder="Search by ID or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent" />
            </div>

            <div className="relative" ref={departmentFilterRef}>
              <button onClick={() => setShowDepartmentFilter(!showDepartmentFilter)} className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${filterDepartment ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`}>
                <FaBuilding className="text-xs" /> Dept {filterDepartment && `: ${filterDepartment}`}
              </button>
              {showDepartmentFilter && (
                <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                  <div onClick={() => { setFilterDepartment(''); setShowDepartmentFilter(false); }} className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-blue-50">All Departments</div>
                  {uniqueDepartments.map(dept => (
                    <div key={dept} onClick={() => { setFilterDepartment(dept); setShowDepartmentFilter(false); }} className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${filterDepartment === dept ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}>{dept}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" ref={designationFilterRef}>
              <button onClick={() => setShowDesignationFilter(!showDesignationFilter)} className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${filterDesignation ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`}>
                <FaUserTag className="text-xs" /> Desig {filterDesignation && `: ${filterDesignation}`}
              </button>
              {showDesignationFilter && (
                <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                  <div onClick={() => { setFilterDesignation(''); setShowDesignationFilter(false); }} className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-blue-50">All Designations</div>
                  {uniqueDesignations.map(des => (
                    <div key={des} onClick={() => { setFilterDesignation(des); setShowDesignationFilter(false); }} className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${filterDesignation === des ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}>{des}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative w-[130px]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">From:</span>
              <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); if (e.target.value && toDate) handleDateRangeFilter(); }} className="w-full pl-12 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent" />
            </div>

            <div className="relative w-[130px]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">To:</span>
              <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); if (fromDate && e.target.value) handleDateRangeFilter(); }} className="w-full pl-10 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent" />
            </div>

            <div className="relative w-[130px]">
              <FaCalendarAlt className="absolute text-xs text-gray-900 transform -translate-y-1/2 left-2 top-1/2" />
              <input type="month" value={selectedMonth} onChange={handleMonthChange} className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent" />
            </div>

            <button onClick={handleDateRangeFilter} disabled={!fromDate || !toDate} className="h-8 px-3 text-xs font-medium text-white transition bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">Apply</button>
            <button onClick={() => setShowTemplateModal(true)} className="h-8 px-3 text-xs font-medium text-gray-700 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">⚙️ Template</button>
            <button onClick={() => { const currentMonth = new Date().toISOString().slice(0, 7); setSelectedMonth(currentMonth); fetchData(currentMonth); }} className="h-8 px-3 text-xs font-medium text-gray-700 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Current</button>
            <button onClick={() => fetchData(selectedMonth)} disabled={isLoadingMonth} className="h-8 px-3 text-xs font-medium text-white transition bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">{isLoadingMonth ? "⟳" : "⟳ Refresh"}</button>
            <button onClick={() => navigate("/bank-reports")} className="h-8 px-3 text-xs font-medium text-white transition bg-blue-600 rounded-md hover:bg-blue-700">Bank Reports</button>
            {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate || selectedMonth !== new Date().toISOString().slice(0, 7)) && (
              <button onClick={clearFilters} className="h-8 px-3 text-xs font-medium text-gray-500 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Clear</button>
            )}
            
            <div className="flex items-center ml-auto bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              <button 
                onClick={() => setShowOTModal(true)} 
                className="flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Manage OT Payments <span className="ml-1 text-[10px]">({selectedOTEmployees.size} selected)</span>
              </button>
            </div>
          </div>
        </div>

        {selectedMonth && isCurrentMonth(selectedMonth) && new Date().getDate() < 26 && (
          <div className="px-3 py-2 mb-3 border-l-4 border-yellow-500 rounded-md shadow-sm bg-yellow-50">
            <p className="text-xs font-medium text-yellow-700">
              ⚠️ Current Month (Before 26th) - Week-off will be added after 26th for salary calculation
            </p>
          </div>
        )}
        {selectedMonth && isCurrentMonth(selectedMonth) && new Date().getDate() >= 26 && (
          <div className="px-3 py-2 mb-3 border-l-4 border-green-500 rounded-md shadow-sm bg-green-50">
            <p className="text-xs font-medium text-green-700">
              ✓ Current Month (After 26th) - Week-off included in salary calculation
            </p>
          </div>
        )}
        {selectedMonth && isHistoricalMonth(selectedMonth) && (
          <div className="px-3 py-2 mb-3 border-l-4 border-green-500 rounded-md shadow-sm bg-green-50">
            <p className="text-xs font-medium text-green-700">
              ✓ Historical Month - Full salary with week-off included
            </p>
          </div>
        )}

        <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                <tr>
                  <th className="py-2 text-xs text-center">Emp ID</th>
                  <th className="py-2 text-xs text-center">Name</th>
                  <th className="py-2 text-xs text-center">Dept</th>
                  <th className="py-2 text-xs text-center">Desig</th>
                  <th className="py-2 text-xs text-center">Working</th>
                  <th className="py-2 text-xs text-center">Present</th>
                  <th className="py-2 text-xs text-center">Half</th>
                  <th className="py-2 text-xs text-center">Week Off</th>
                  <th className="py-2 text-xs text-center">Monthly Salary</th>
                  <th className="py-2 text-xs text-center">Calculated</th>
                  <th className="py-2 text-xs text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentRecords.map((item, index) => (
                  <tr key={item.employeeId} onClick={() => handleRowClick(item)} className={`hover:bg-gray-50 cursor-pointer transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">{item.employeeId}</td>
                    <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">{item.name}</td>
                    <td className="px-2 py-1.5 text-center text-xs">{item.department}</td>
                    <td className="px-2 py-1.5 text-center text-xs">{item.designation}</td>
                    <td className="px-2 py-1.5 text-center text-xs"><span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{item.totalWorkingDays || 0}</span></td>
                    <td className="px-2 py-1.5 text-center text-xs"><span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs">{item.presentDays || 0}</span></td>
                    <td className="px-2 py-1.5 text-center text-xs"><span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-xs">{item.halfDayWorking || 0}</span></td>
                    <td className="px-2 py-1.5 text-center text-xs"><span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded text-xs">{getWeekOffDaysForDisplay(item)}</span></td>
                    <td className="px-2 py-1.5 text-center text-xs">
                      <div className="font-medium text-blue-600">₹{(item.salaryPerMonth || 0).toLocaleString()}</div>
                      {item.currentSalary && item.currentSalary !== item.salaryPerMonth && (
                        <div className="text-[9px] text-gray-500 line-through">₹{item.currentSalary.toLocaleString()}</div>
                      )}
                      {item.historicalEffectiveFrom && item.historicalEffectiveFrom !== item.joinDate && (
                        <div className="text-[8px] text-blue-600">w.e.f {new Date(item.historicalEffectiveFrom).toLocaleDateString()}</div>
                      )}
                    </td>
                    <td className="px-2 py-1.5 text-center text-xs"><span className="font-bold text-green-700">₹{calculateSalary(item).toLocaleString()}</span></td>
                    <td className="px-2 py-1.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); handleView(item); }} className="p-1 text-blue-600 rounded hover:bg-blue-50" title="View">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="p-1 text-blue-700 rounded hover:bg-blue-50" title="Edit">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); downloadInvoice(item); }} disabled={!isPayslipDownloadAllowed(item.month || selectedMonth)} className={`p-1 rounded ${isPayslipDownloadAllowed(item.month || selectedMonth) ? 'text-purple-600 hover:bg-purple-50' : 'text-gray-400 cursor-not-allowed'}`} title="Download">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          {filteredRecords.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-2 px-3 py-2 border-t sm:flex-row">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-700">Show:</label>
                <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="p-1 text-xs border rounded">
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={handlePrevious} disabled={currentPage === 1} className={`px-3 py-0.5 text-xs border rounded ${currentPage === 1 ? 'text-gray-500 bg-gray-100' : 'text-blue-600 bg-white hover:bg-blue-50'}`}>Prev</button>
                {getPageNumbers().map((page, idx) => (
                  <button key={idx} onClick={() => typeof page === 'number' && handlePageClick(page)} disabled={page === "..."} className={`px-3 py-0.5 text-xs border rounded ${page === "..." ? 'text-gray-500 bg-white' : currentPage === page ? 'text-white bg-blue-600' : 'text-blue-600 bg-white hover:bg-blue-50'}`}>{page}</button>
                ))}
                <button onClick={handleNext} disabled={currentPage === totalPages} className={`px-3 py-0.5 text-xs border rounded ${currentPage === totalPages ? 'text-gray-500 bg-gray-100' : 'text-blue-600 bg-white hover:bg-blue-50'}`}>Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between mb-4 bg-white">
              <h2 className="text-xl font-bold text-gray-700">Employee Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700"><FaTimes size={20} /></button>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full shrink-0"><span className="text-lg font-semibold text-blue-800">{selectedEmployee.name?.charAt(0) || 'E'}</span></div>
              <div className="flex flex-col flex-1 space-y-1">
                <h3 className="text-lg font-semibold text-gray-700">{selectedEmployee.name}</h3>
                <div className="grid grid-cols-2 text-sm text-gray-500 gap-x-6 gap-y-1">
                  <p><span className="font-medium text-gray-700">ID:</span> {selectedEmployee.employeeId}</p>
                  <p><span className="font-medium text-gray-700">Department:</span> {selectedEmployee.department || 'N/A'}</p>
                  <p><span className="font-medium text-gray-700">Designation:</span> {selectedEmployee.designation || 'N/A'}</p>
                  <p><span className="font-medium text-gray-700">Month:</span> {selectedEmployee.month || selectedMonth} ({selectedEmployee.monthDays || monthDays} days)</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 mt-4 mb-4 text-sm sm:grid-cols-2 gap-x-10 gap-y-2">
              <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Present Days</span><span className="font-semibold text-blue-700">{selectedEmployee.presentDays || 0}</span></div>
              <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Working Days</span><span className="font-semibold text-blue-600">{selectedEmployee.totalWorkingDays || 0}</span></div>
              <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Half Days</span><span className="font-semibold text-yellow-600">{selectedEmployee.halfDayWorking || 0}</span></div>
              <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">WeekOff Days</span><span className="font-semibold text-purple-600">{getWeekOffDaysForDisplay(selectedEmployee)}</span></div>
              <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Month Days</span><span className="font-semibold text-gray-700">{selectedEmployee.monthDays || monthDays}</span></div>
              <div className="flex justify-between pb-1 border-b">
                <span className="text-gray-500">Monthly Salary</span>
                <div className="text-right">
                  <span className="font-semibold text-blue-600">₹{selectedEmployee.salaryPerMonth || 0}</span>
                  {selectedEmployee.currentSalary && selectedEmployee.currentSalary !== selectedEmployee.salaryPerMonth && (
                    <div className="text-[9px] text-gray-500 line-through">₹{selectedEmployee.currentSalary.toLocaleString()}</div>
                  )}
                </div>
              </div>
              <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Daily Rate</span><span className="font-semibold text-gray-700">₹{calculateDailyRate(selectedEmployee)}/day</span></div>
              <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Calculated Salary</span><span className="font-semibold text-blue-700">₹{Math.round(selectedEmployee.calculatedSalary || 0)}</span></div>
              <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">OT Pay ({selectedEmployee.overTimeHoursFormatted || formatDecimalHours(selectedEmployee.overTimeHours)})</span><span className="font-semibold text-blue-600">₹{selectedEmployee.otAmount || 0}</span></div>
              <div className="flex flex-col pb-2 border-b sm:col-span-2">
                <div className="flex justify-between mb-2"><span className="font-medium text-gray-500">Approved Leaves</span><span className="font-semibold text-red-600">{getLeaveTypes(selectedEmployee) || "0"}</span></div>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => downloadInvoice(selectedEmployee)} disabled={!isPayslipDownloadAllowed(selectedEmployee.month || selectedMonth)} className={`px-6 py-2 rounded-lg transition duration-200 ${isPayslipDownloadAllowed(selectedEmployee.month || selectedMonth) ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Download Payslip</button>
              <button onClick={() => setShowViewModal(false)} className="px-6 py-2 text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700">Close</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-bold">Edit Salary - {selectedEmployee.name}</h2><button onClick={() => setShowEditModal(false)} className="text-gray-500"><FaTimes /></button></div>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div><label className="block text-xs">Present Days</label><input type="number" name="presentDays" value={editFormData.presentDays || 0} onChange={handleInputChange} className="w-full p-2 text-sm border rounded" /></div>
              <div><label className="block text-xs">Working Days</label><input type="number" name="workingDays" value={editFormData.workingDays || 0} onChange={handleInputChange} className="w-full p-2 text-sm border rounded" /></div>
              <div><label className="block text-xs">Half Days</label><input type="number" name="halfDayWorking" value={editFormData.halfDayWorking || 0} onChange={handleInputChange} className="w-full p-2 text-sm border rounded" /></div>
              <div><label className="block text-xs">Bonus (₹)</label><input type="number" name="bonus" value={extraWorkData.bonus || 0} onChange={handleExtraWorkChange} className="w-full p-2 text-sm border rounded" /></div>
              <div><label className="block text-xs">Deductions (₹)</label><input type="number" name="deductions" value={extraWorkData.deductions || 0} onChange={handleExtraWorkChange} className="w-full p-2 text-sm border rounded" /></div>
              <div><label className="block text-xs">Reason</label><input type="text" name="reason" value={extraWorkData.reason || ""} onChange={handleExtraWorkChange} className="w-full p-2 text-sm border rounded" /></div>
              <div className="flex gap-2 pt-2"><button type="button" onClick={handleReset} className="px-3 py-1 text-sm text-white bg-yellow-500 rounded hover:bg-yellow-600">Reset</button><button type="button" onClick={() => setShowEditModal(false)} className="px-3 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400">Cancel</button><button type="submit" className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">Save</button></div>
            </form>
          </div>
        </div>
      )}

      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-4 bg-white rounded-lg">
            <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-bold">Edit Template</h2><button onClick={() => setShowTemplateModal(false)}><FaTimes /></button></div>
            <div className="space-y-3">
              <div><label className="block text-xs">Company Name</label><input type="text" value={templateConfig.companyName} onChange={(e) => setTemplateConfig({...templateConfig, companyName: e.target.value})} className="w-full p-2 text-sm border rounded" /></div>
              <div><label className="block text-xs">Address</label><textarea rows="2" value={templateConfig.address} onChange={(e) => setTemplateConfig({...templateConfig, address: e.target.value})} className="w-full p-2 text-sm border rounded"></textarea></div>
              <div><label className="block text-xs">Logo</label><input type="file" accept="image/*" onChange={handleLogoChange} className="w-full text-sm" /></div>
              <div className="flex gap-2"><button onClick={() => setShowTemplateModal(false)} className="px-3 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400">Cancel</button><button onClick={handleTemplateSave} className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">Save</button></div>
            </div>
          </div>
        </div>
      )}
      
      {showOTModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">Select Employees for OT Payment</h2>
              <button onClick={() => setShowOTModal(false)}><FaTimes /></button>
            </div>
            <div className="flex-1 pr-2 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-green-500 to-blue-600">
                  <tr>
                    <th className="p-2 text-left text-white">Select</th>
                    <th className="p-2 text-left text-white">Employee ID</th>
                    <th className="p-2 text-left text-white">Name</th>
                    <th className="p-2 text-right text-white">OT Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan="4" className="p-4 text-center text-gray-500">No employees found. </td></tr>
                  ) : (
                    records.map(r => (
                      <tr key={r.employeeId} className="border-b">
                        <td className="p-2">
                          <input 
                            type="checkbox" 
                            checked={selectedOTEmployees.has(r.employeeId)}
                            onChange={() => handleOTEmployeeSelection(r.employeeId)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                        </td>
                        <td className="p-2">{r.employeeId}</td>
                        <td className="p-2 font-medium">{r.name}</td>
                        <td className="p-2 font-semibold text-right text-blue-600">
                          {r.overTimeHoursFormatted || formatDecimalHours(r.overTimeHours)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowOTModal(false)} className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">Done</button>
            </div>
          </div>
        </div>
      )}

      <AttendancePopupModal />
    </div>
  );
};

export default PayRoll;