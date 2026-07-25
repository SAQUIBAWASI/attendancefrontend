// import { useCallback, useEffect, useRef, useState,useNavigate } from "react";
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
//   const [showOTModal, setShowOTModal] = useState(false);
//   const [selectedOTEmployees, setSelectedOTEmployees] = useState(() => {
//     const saved = localStorage.getItem("payrollSelectedOTEmployees");
//     return saved ? new Set(JSON.parse(saved)) : new Set();
//   });
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

//   // ✅ State for approved OT claims from API
//   const [approvedOTClaims, setApprovedOTClaims] = useState([]);
//   const [approvedOTMap, setApprovedOTMap] = useState({});

//   // ✅ Medical roles list
//   const medicalRoles = [
//     "Phlebotomist", "Staff Nurse", "Consultant", "Pharmacist",
//     "Nurse", "Doctor", "Lab Technician", "Medical Officer", 
//     "Physician", "Surgeon", "Radiologist", "Pathologist",
//     "Therapist", "Healthcare", "Medical", "Clinical"
//   ];

//   const isMedicalRole = (role) => {
//     if (!role) return false;
//     return medicalRoles.some(medRole => 
//       role.toLowerCase().includes(medRole.toLowerCase())
//     );
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

//   const getEmployeeShiftHours = (employeeId) => {
//     const employeeData = employeesMasterData[employeeId] || {};
//     return employeeData.shiftHours || 8;
//   };

//   const calculateOTForEmployee = (employeeId, hoursWorked) => {
//     const h = Number(hoursWorked) || 0;
//     const shiftHours = getEmployeeShiftHours(employeeId);
    
//     if (h > shiftHours) {
//       return Number((h - shiftHours).toFixed(2));
//     }
//     return 0;
//   };

//   // ✅ Fetch approved OT claims for the selected month
//   const fetchApprovedOTClaims = useCallback(async (month) => {
//     try {
//       const [year, monthNum] = month.split('-').map(Number);
//       const startDate = new Date(year, monthNum - 1, 1);
//       const endDate = new Date(year, monthNum, 0);
      
//       const response = await fetch(`${API_BASE_URL}/employees/allotclaimed?status=approved`);
//       const data = await response.json();
      
//       if (data.success) {
//         const monthClaims = data.claims.filter(claim => {
//           const claimDate = new Date(claim.date);
//           return claimDate >= startDate && claimDate <= endDate;
//         });
        
//         setApprovedOTClaims(monthClaims);
        
//         const otMap = {};
//         monthClaims.forEach(claim => {
//           const empId = claim.employeeId;
//           if (!otMap[empId]) {
//             otMap[empId] = {
//               totalOTHours: 0,
//               totalOTAmount: 0,
//               count: 0,
//               claims: []
//             };
//           }
//           otMap[empId].totalOTHours += claim.otHours || 0;
//           otMap[empId].totalOTAmount += claim.otAmount || 0;
//           otMap[empId].count += 1;
//           otMap[empId].claims.push(claim);
//         });
        
//         setApprovedOTMap(otMap);
//       }
//     } catch (error) {
//       console.error("Error fetching approved OT claims:", error);
//     }
//   }, [API_BASE_URL]);

//   useEffect(() => {
//     if (selectedMonth) {
//       fetchApprovedOTClaims(selectedMonth);
//     }
//   }, [selectedMonth, fetchApprovedOTClaims]);

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

//   const handleOTEmployeeSelection = (employeeId) => {
//     const updated = new Set(selectedOTEmployees);
//     if (updated.has(employeeId)) {
//       updated.delete(employeeId);
//     } else {
//       updated.add(employeeId);
//     }
//     setSelectedOTEmployees(updated);
//     localStorage.setItem("payrollSelectedOTEmployees", JSON.stringify(Array.from(updated)));
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
//     let earnedWeekOffs = 0;

//     for (let d = new Date(year, monthNum - 1, 1); d <= endDate; d.setDate(d.getDate() + 1)) {
//       if (d.getDay() === 0) {
//         let workDaysCount = 0;
//         const weekStart = new Date(d);
//         weekStart.setDate(d.getDate() - 6);
        
//         for (let i = 0; i < 6; i++) {
//           const checkDate = new Date(weekStart);
//           checkDate.setDate(weekStart.getDate() + i);
          
//           if (checkDate.getMonth() + 1 === monthNum && checkDate.getFullYear() === year) {
//             const dateKey = checkDate.toLocaleDateString('en-CA');
//             const hasAttendance = attendanceMap.has(dateKey);
//             const isLeave = isLeaveDayForDate(checkDate, employeeId, employeeLeavesData);
            
//             if (hasAttendance || isLeave) {
//               workDaysCount++;
//             }
//           }
//         }
        
//         if (workDaysCount >= 5) {
//           earnedWeekOffs++;
//         }
//       }
//     }
    
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
//       const targetMonth = month || selectedMonth;

//       const [employeesRes, leavesRes, holidaysRes, summaryRes] = await Promise.all([
//         fetch(EMPLOYEES_API_URL),
//         fetch(LEAVES_API_URL),
//         fetch(`${API_BASE_URL}/holidays/all`),
//         fetch(`${ATTENDANCE_SUMMARY_API_URL}${targetMonth ? `?month=${targetMonth}` : ''}`)
//       ]);

//       let employeesData = [];
//       if (employeesRes.ok) {
//         const employeesDataRaw = await employeesRes.json();
//         employeesData = Array.isArray(employeesDataRaw) ? employeesDataRaw : (employeesDataRaw.data || []);
//       }

//       let leavesData = leavesRes.ok ? await leavesRes.json() : [];
      
//       let holidaysData = holidaysRes.ok ? await holidaysRes.json() : [];
      
//       let summaryData = [];
//       if (summaryRes.ok) {
//         const json = await summaryRes.json();
//         summaryData = json.summary || [];
//       }

//       let allAttendanceRecords = [];
//       try {
//         const attendanceRes = await fetch(`${ATTENDANCE_DETAILS_API_URL}?month=${targetMonth}`);
//         if (attendanceRes.ok) {
//           const attData = await attendanceRes.json();
//           allAttendanceRecords = attData.records || [];
//         }
//       } catch (err) {
//         console.warn("Failed to fetch attendance records:", err);
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
//         console.warn("Failed to fetch shift data:", err);
//       }

//       const employeesForMonth = filterEmployeesByJoiningDate(employeesData, targetMonth);
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
//         const [sYear, sMonth] = targetMonth.split('-').map(Number);
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

//       const currentLeavesMap = processLeavesData(leavesData, targetMonth);
//       const currentCompOffsMap = await processCompOffData(targetMonth, leavesData);

//       const [year, monthNum] = targetMonth.split('-').map(Number);
//       const daysInMonthValue = getDaysInMonth(targetMonth);
//       const processedSalaries = [];
      
//       for (const emp of activeEmployees) {
//         const summary = summaryData.find(x => x.employeeId === emp.employeeId) || {};
        
//         let targetWeekOffCount = emp.weekOffPerMonth || 4;
        
//         const employeeRole = summary.role || emp.role || emp.designation || '';
//         const isMedicalStaff = isMedicalRole(employeeRole);
        
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
//         attendanceForEmployee.forEach(record => {
//           if (record.checkInTime) {
//             const dateKey = new Date(record.checkInTime).toLocaleDateString('en-CA');
//             attendanceMapForCalc.set(dateKey, record);
//           }
//         });
        
//         let finalWeekOffDays = targetWeekOffCount;
//         let isSpecialMay2026 = false;
        
//         if (targetMonth === "2026-05" && targetWeekOffCount === 4 && !isMedicalStaff) {
//           finalWeekOffDays = targetWeekOffCount + 1;
//           isSpecialMay2026 = true;
//         } else {
//           finalWeekOffDays = targetWeekOffCount;
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
        
//         const dailyRate = salaryForMonth > 0 ? salaryForMonth / daysInMonthValue : 0;
//         const presentDaysCount = summary.presentDays ?? 0;
//         const halfDaysCount = summary.halfDayWorking ?? 0;
//         const compOffData = currentCompOffsMap[emp.employeeId] || { balance: 0 };
        
//         let calculatedSalary = 0;
//         if (salaryForMonth > 0 && daysInMonthValue > 0) {
//           const effectivePaidDays = presentDaysCount + (halfDaysCount * 0.5) + (includeWeekOffInSalary ? finalWeekOffDays : 0) + holidayCount + compOffData.balance;
//           calculatedSalary = effectivePaidDays * dailyRate;
//         }

//         const parseTimeStr = (timeStr) => {
//           if (!timeStr) return null;
//           const match = timeStr.trim().match(/(\d{1,2})[:.](\d{2})\s*(AM|PM|am|pm)?/i);
//           if (!match) return null;
//           let hours = parseInt(match[1]);
//           const ampm = match[3] ? match[3].toUpperCase() : null;
//           if (ampm === "PM" && hours < 12) hours += 12;
//           if (ampm === "AM" && hours === 12) hours = 0;
//           return `${hours.toString().padStart(2, '0')}:${match[2]}`;
//         };

//         const parseShiftTimeRange = (timeRange) => {
//           if (!timeRange) return { start: null, end: null };
//           let parts = timeRange.split(/[-]| to /i).map(t => t.trim());
//           if (parts.length >= 2) return { start: parseTimeStr(parts[0]), end: parseTimeStr(parts[1]) };
//           return { start: null, end: null };
//         };

//         const getDefaultShiftTime = (shiftType) => {
//           const shiftTimes = {
//             "A": { start: "10:00", end: "19:00", grace: 5, isBrakeShift: false },
//             "B": { start: "14:00", end: "22:00", grace: 5, isBrakeShift: false },
//             "C": { start: "18:00", end: "21:00", grace: 5, isBrakeShift: false },
//             "D": { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false },
//             "E": { start: "10:00", end: "21:00", grace: 5, isBrakeShift: false },
//             "F": { start: "14:00", end: "23:00", grace: 5, isBrakeShift: false },
//             "G": { start: "09:00", end: "21:00", grace: 5, isBrakeShift: false },
//             "H": { start: "09:00", end: "21:00", grace: 5, isBrakeShift: false },
//             "I": { start: "07:00", end: "17:00", grace: 5, isBrakeShift: false },
//             "BR": { start: "07:00", end: "21:30", grace: 5, isBrakeShift: true },
//           };
//           return shiftTimes[shiftType] || { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false };
//         };

//         const getEmployeeShift = (employeeId) => {
//           const shiftAssignment = shiftsData.find(s => s.employeeAssignment?.employeeId === employeeId || s.employeeId === employeeId);
//           if (!shiftAssignment) return null;
//           const shiftType = shiftAssignment.shiftType;
//           const masterShift = masterShiftsData.find(shift => shift.shiftType === shiftType);
//           if (!masterShift) return getDefaultShiftTime(shiftType);
//           if (masterShift.isBrakeShift && masterShift.timeSlots?.length >= 2) {
//             const slot1 = parseShiftTimeRange(masterShift.timeSlots[0]?.timeRange);
//             const slot2 = parseShiftTimeRange(masterShift.timeSlots[1]?.timeRange);
//             return { start: slot1.start || "07:00", end: slot2.end || "21:30", grace: 5, isBrakeShift: true };
//           }
//           if (masterShift.timeSlots?.length > 0 && masterShift.timeSlots[0].timeRange) {
//             const parsed = parseShiftTimeRange(masterShift.timeSlots[0].timeRange);
//             return { start: parsed.start || "09:00", end: parsed.end || "18:00", grace: 5, isBrakeShift: false };
//           }
//           return getDefaultShiftTime(shiftType);
//         };

//         const getEmployeeShiftHoursActual = (employeeId) => {
//           const shift = getEmployeeShift(employeeId);
//           if (!shift) return 9;
//           const [startHour, startMinute] = shift.start.split(':').map(Number);
//           const [endHour, endMinute] = shift.end.split(':').map(Number);
//           let startMinutes = startHour * 60 + startMinute;
//           let endMinutes = endHour * 60 + endMinute;
//           if (endMinutes <= startMinutes) endMinutes += 24 * 60;
//           return (endMinutes - startMinutes) / 60;
//         };

//         const calculateOTActual = (employeeId, hoursWorked) => {
//           const h = Number(hoursWorked) || 0;
//           const shiftHours = getEmployeeShiftHoursActual(employeeId);
//           if (h > shiftHours) {
//             return Number((h - shiftHours).toFixed(2));
//           }
//           return 0;
//         };

//         let totalOTHours = 0;
//         allAttendanceRecords.forEach(record => {
//           if (record.employeeId !== emp.employeeId) return;
//           if (record.checkInTime) {
//             const recordMonth = new Date(record.checkInTime).toISOString().slice(0, 7);
//             if (recordMonth !== targetMonth) return;
//           }
//           let hoursWorked = 0;
//           if (record.hours) {
//             hoursWorked = parseFloat(record.hours);
//           } else if (record.totalHours) {
//             hoursWorked = parseFloat(record.totalHours);
//           } else if (record.checkInTime && record.checkOutTime) {
//             const checkIn = new Date(record.checkInTime);
//             const checkOut = new Date(record.checkOutTime);
//             hoursWorked = (checkOut - checkIn) / (1000 * 60 * 60);
//           }
//           totalOTHours += calculateOTActual(emp.employeeId, hoursWorked);
//         });

//         totalOTHours = Number(totalOTHours.toFixed(2));
//         const formattedOTHours = formatDecimalHours(totalOTHours);
        
//         // ✅ Get approved OT amount from API
//         const approvedOTData = approvedOTMap[emp.employeeId] || { totalOTAmount: 0, totalOTHours: 0 };
//         const approvedOTAmount = approvedOTData.totalOTAmount || 0;
//         const approvedOTHours = approvedOTData.totalOTHours || 0;
        
//         // ✅ Base calculated salary (WITHOUT OT)
//         const baseCalculatedSalary = Math.round(calculatedSalary);
        
//         // ✅ Final OT Amount and Final Pay
//         let finalOTAmount = 0;
//         let finalPay = baseCalculatedSalary;
        
//         // ✅ Check for approved OT from API
//         if (approvedOTAmount > 0) {
//           finalOTAmount = approvedOTAmount;
//           finalPay = Math.round(baseCalculatedSalary + approvedOTAmount);
//         } else {
//           // Check for manually selected OT
//           const savedOTEmpsString = localStorage.getItem("payrollSelectedOTEmployees");
//           const savedOTEmps = savedOTEmpsString ? new Set(JSON.parse(savedOTEmpsString)) : new Set();
//           const isApprovedInOTPage = localStorage.getItem(`otStatus_${emp.employeeId}_${targetMonth}`) === "approved";
          
//           if (totalOTHours > 0 && (savedOTEmps.has(emp.employeeId) || isApprovedInOTPage)) {
//             const multiplier = Number(localStorage.getItem(`otMultiplier_${emp.employeeId}_${targetMonth}`)) || 2;
//             const otRatePerHour = dailyRate / (emp.shiftHours || 8);
//             const otAmount = totalOTHours * otRatePerHour * multiplier;
//             finalOTAmount = otAmount;
//             finalPay = Math.round(baseCalculatedSalary + otAmount);
//           }
//         }
        
//         const salaryObj = {
//           employeeId: emp.employeeId,
//           name: emp.name,
//           presentDays: presentDaysCount,
//           workingDays: summary.totalWorkingDays ?? 0,
//           totalWorkingDays: summary.totalWorkingDays ?? 0,
//           halfDayWorking: halfDaysCount,
//           fullDayNotWorking: summary.fullDayNotWorking ?? 0,
//           calculatedSalary: baseCalculatedSalary, // ✅ Base salary WITHOUT OT (pehle jaisa)
//           baseCalculatedSalary: baseCalculatedSalary,
//           salaryPerMonth: salaryForMonth,
//           currentSalary: emp.salaryPerMonth,
//           originalSalary: originalSalary,
//           salaryPerDay: dailyRate,
//           weekOffs: finalWeekOffDays,
//           actualWeekOffCount: finalWeekOffDays,
//           targetWeekOffCount: targetWeekOffCount,
//           originalWeekOffPerMonth: targetWeekOffCount,
//           isSpecialMay2026: isSpecialMay2026,
//           weekOffDay: emp.weekOffDay || 'Sunday',
//           totalLeaves: 0,
//           month: targetMonth || "No Month",
//           monthDays: daysInMonthValue,
//           includeWeekOffInSalary: includeWeekOffInSalary,
//           isHistoricalMonth: isHistorical,
//           isCurrentMonth: isCurrent,
//           department: emp.department || 'N/A',
//           designation: employeeRole || emp.role || emp.designation || 'N/A',
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
//           overTimeHours: totalOTHours,
//           overTimeHoursFormatted: formattedOTHours,
//           shiftHours: emp.shiftHours || 8,
//           role: employeeRole,
//           isMedicalStaff: isMedicalStaff,
//           // ✅ OT fields
//           finalOTAmount: Math.round(finalOTAmount),
//           finalPay: finalPay,
//           otAmount: Math.round(finalOTAmount),
//           hasApprovedOT: approvedOTAmount > 0,
//           approvedOTAmount: approvedOTAmount,
//           approvedOTHours: approvedOTHours
//         };

//         processedSalaries.push(salaryObj);
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
//   }, [EMPLOYEES_API_URL, LEAVES_API_URL, API_BASE_URL, ATTENDANCE_SUMMARY_API_URL, ATTENDANCE_DETAILS_API_URL, processLeavesData, filterInactiveEmployees, filterEmployeesByJoiningDate, processCompOffData, selectedMonth, approvedOTMap]);

//   useEffect(() => {
//     if (records.length === 0) return;

//     const processRecordsWithAdditions = (prevRecords) => 
//       prevRecords.map(record => {
//         let baseSalary = record.baseCalculatedSalary || record.calculatedSalary || 0;
//         let otAmount = 0;
        
//         // ✅ Check for approved OT from API
//         if (record.hasApprovedOT) {
//           otAmount = record.approvedOTAmount || 0;
//         } else {
//           const isApprovedInOTPage = localStorage.getItem(`otStatus_${record.employeeId}_${selectedMonth}`) === "approved";
//           if (record.overTimeHours > 0 && (selectedOTEmployees.has(record.employeeId) || isApprovedInOTPage)) {
//             const dailyRate = record.salaryPerDay || 0;
//             const shiftHours = record.shiftHours || 8;
//             const multiplier = Number(localStorage.getItem(`otMultiplier_${record.employeeId}_${selectedMonth}`)) || 2;
//             const otRatePerHour = dailyRate / shiftHours;
//             otAmount = record.overTimeHours * otRatePerHour * multiplier;
//           }
//         }
        
//         return {
//           ...record,
//           calculatedSalary: Math.round(baseSalary), // ✅ Base salary WITHOUT OT
//           otAmount: Math.round(otAmount),
//           finalOTAmount: Math.round(otAmount),
//           finalPay: Math.round(baseSalary + otAmount) // ✅ Base + OT
//         };
//       });

//     const updatedRecords = processRecordsWithAdditions(records);
//     setRecords(updatedRecords);
//     setFilteredRecords(updatedRecords);
//   }, [employeeCompOffs, employeeLeaves, employeesMasterData, monthDays, selectedMonth, selectedOTEmployees, approvedOTMap]);

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

//   const getWeekOffDaysForDisplay = (employee) => {
//     if (employee.isSpecialMay2026) {
//       return `${employee.originalWeekOffPerMonth} + 1 (Special)`;
//     }
//     return employee.weekOffs || 0;
//   };

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

//     let actualWeekOffDaysNumeric = employee.weekOffs || 0;
//     let weekOffDisplayValue = actualWeekOffDaysNumeric;
    
//     if (employee.isSpecialMay2026) {
//       weekOffDisplayValue = `${employee.originalWeekOffPerMonth || 4} + 1 (Special)`;
//     }
    
//     const presentDays = employee.presentDays ?? 0;
//     const halfDays = employee.halfDayWorking || 0;
//     const holidays = employee.holidayCount || 0;

//     let totalPaidDays = presentDays + (halfDays * 0.5) + actualWeekOffDaysNumeric + holidays;
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
//       earningsItems.push({ label: `Overtime`, amount: otAmount });
//     }
    
//     if (compOffPay > 0) {
//       earningsItems.push({ label: 'Comp-off / Holiday Pay', amount: compOffPay });
//     }
    
//     if (holidays > 0) {
//       earningsItems.push({ label: `Public Holidays (${holidays})`, amount: holidays * dailyRate, isInfo: true });
//     }
    
//     earningsItems.push({ label: `Working Days (Full: ${presentDays})`, amount: 0, isInfo: true });
//     earningsItems.push({ label: `Week Off Days (${weekOffDisplayValue})`, amount: 0, isInfo: true });
    
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
//               </tr>
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
//               ${(employeeData.panNo) ? `<tr><td colspan="2"><strong>PAN No.:</strong> ${employeeData.panNo}</td><td colspan="2"></td></tr>` : ''}
//               ${(employeeData.pfNo) ? `<tr><td colspan="2"><strong>PF No.:</strong> ${employeeData.pfNo}</td><td colspan="2"></td></tr>` : ''}
//               ${(employeeData.uanNo) ? `<tr><td colspan="2"><strong>UAN No.:</strong> ${employeeData.uanNo}</td><td colspan="2"></td></tr>` : ''}
//               ${(employeeData.branch) ? `<tr><td colspan="2"><strong>Branch:</strong> ${employeeData.branch}</td><td colspan="2"></td></tr>` : ''}
//               ${(employeeData.esicNo) ? `<tr><td colspan="2"><strong>ESIC No.:</strong> ${employeeData.esicNo}</td><td colspan="2"></td></tr>` : ''}
//               ${(employeeData.bankAccount) ? `<tr><td colspan="4"><strong>Bank Account:</strong> ${employeeData.bankAccount}</td></tr>` : ''}
//             </table>
//             <tr>
//               <tr style="background:#f0f0f0;">
//                 <td style="width:40%;"><strong>EARNINGS</strong></td>
//                 <td style="width:10%; text-align:center;"><strong>₹</strong></td>
//                 <td style="width:40%;"><strong>DEDUCTIONS</strong></td>
//                 <td style="width:10%; text-align:center;"><strong>₹</strong></td
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

//     const getAllDatesOfMonth = (month) => {
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

//     const monthDates = getAllDatesOfMonth(selectedMonth);

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

//     const isWeekOffDay = (date) => {
//       if (!date || !selectedEmployee) return false;
//       return weekOffDatesSet.has(date.toLocaleDateString('en-CA'));
//     };

//     let weekOffCount = 0, leaveCount = 0, absentCount = 0, presentCount = 0;

//     monthDates.forEach(date => {
//       const dateKey = date.toLocaleDateString('en-CA');
//       const record = attendanceMap.get(dateKey);
//       const isWO = isWeekOffDay(date);
//       const hasAttendance = !!record;
//       const isLV = !isWO && isLeaveDay(date, selectedEmployee?.employeeId, employeeLeaves);
      
//       if (isWO && !hasAttendance) weekOffCount++;
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
//               <span className="text-green-600">Present: <strong>{presentCount}</strong></span>
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
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Check-In</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Check-Out</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Reason</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Hours</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Status</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Admin Comment</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {monthDates.map((date) => {
//                       const dateKey = date.toLocaleDateString('en-CA');
//                       const record = attendanceMap.get(dateKey);
//                       const hasAttendance = !!record;
                      
//                       const workHours = record ? calculateWorkHours(record.checkInTime, record.checkOutTime) : null;
                      
//                       const isWeekOff = isWeekOffDay(date);
//                       const isLeave = !isWeekOff && isLeaveDay(date, selectedEmployee?.employeeId, employeeLeaves);
                      
//                       const effectiveWeekOff = isWeekOff && !hasAttendance;
                      
//                       let bgColor = '';
//                       let dayType = '';
//                       let statusText = '';
                      
//                       if (effectiveWeekOff) {
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
//                           <td className="px-2 py-1 text-xs text-center">{!effectiveWeekOff && !isLeave && hasAttendance ? formatTime(record?.checkInTime) : '-'}</td>
//                           <td className="px-2 py-1 text-xs text-center">{!effectiveWeekOff && !isLeave && hasAttendance ? formatTime(record?.checkOutTime) : '-'}</td>
//                           <td className="px-2 py-1 text-xs text-center">{record?.status || '-'}</td>
//                           <td className="px-2 py-1 text-xs text-center">{!effectiveWeekOff && !isLeave && hasAttendance && workHours ? `${workHours}h` : '-'}</td>
//                           <td className="px-2 py-1 text-center">
//                             <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${effectiveWeekOff ? 'bg-orange-100 text-orange-700' : isLeave ? 'bg-red-100 text-red-700' : !hasAttendance ? 'bg-gray-100 text-gray-500' : dayType === 'Full Day' ? 'bg-green-100 text-green-700' : dayType === 'Half Day' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{dayType}</span>
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
//             <button onClick={() => setShowAttendancePopup(false)} className="px-4 py-1.5 text-sm text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700">Close</button>
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
//               <FaCalendarAlt className="absolute text-xs text-gray-900 transform -translate-y-1/2 left-2 top-1/2" />
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
//               <button 
//                 onClick={() => setShowOTModal(true)} 
//                 className="flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
//               >
//                 Manage OT Payments <span className="ml-1 text-[10px]">({selectedOTEmployees.size} selected)</span>
//               </button>
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

//         {selectedMonth === "2026-05" && (
//           <div className="px-3 py-2 mb-3 border-l-4 border-blue-500 rounded-md shadow-sm bg-blue-50">
//             <p className="text-xs font-medium text-blue-700">
//               🎉 May 2026 Special: Non-medical employees with 4 week-offs will get +1 extra week off (total 5 week offs)!
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
//                   <th className="py-2 text-xs text-center">Role</th>
//                   <th className="py-2 text-xs text-center">Dept</th>
//                   <th className="py-2 text-xs text-center">Working</th>
//                   <th className="py-2 text-xs text-center">Present</th>
//                   <th className="py-2 text-xs text-center">Half</th>
//                   <th className="py-2 text-xs text-center">Week Off</th>
//                   <th className="py-2 text-xs text-center">Monthly Salary</th>
//                   <th className="py-2 text-xs text-center">OT Amount</th>
//                   <th className="py-2 text-xs text-center">Calculated</th>
//                   <th className="py-2 text-xs text-center">Final Pay</th>
//                   <th className="py-2 text-xs text-center">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {currentRecords.map((item, index) => (
//                   <tr key={item.employeeId} onClick={() => handleRowClick(item)} className={`cursor-pointer hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
//                     <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">{item.employeeId}</td>
//                     <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">{item.name}</td>
//                     <td className="px-2 py-1.5 text-center text-xs">{item.designation || item.role || '-'}</td>
//                     <td className="px-2 py-1.5 text-center text-xs">{item.department}</td>
//                     <td className="px-2 py-1.5 text-center text-xs"><span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{item.totalWorkingDays || 0}</span></td>
//                     <td className="px-2 py-1.5 text-center text-xs"><span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs">{item.presentDays || 0}</span></td>
//                     <td className="px-2 py-1.5 text-center text-xs"><span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-xs">{item.halfDayWorking || 0}</span></td>
//                     <td className="px-2 py-1.5 text-center text-xs">
//                       <span className={`px-1.5 py-0.5 rounded text-xs ${item.isSpecialMay2026 ? 'bg-blue-100 text-blue-800 font-semibold' : 'bg-purple-100 text-purple-800'}`}>
//                         {getWeekOffDaysForDisplay(item)}
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
//                     <td className="px-2 py-1.5 text-center text-xs">
//                       {item.finalOTAmount > 0 ? (
//                         <span className="font-semibold text-green-600">₹{item.finalOTAmount.toFixed(0)}</span>
//                       ) : (
//                         <span className="text-gray-400">-</span>
//                       )}
//                     </td>
//                     <td className="px-2 py-1.5 text-center text-xs">
//                       <span className="font-semibold text-blue-700">₹{calculateSalary(item).toLocaleString()}</span>
//                     </td>
//                     <td className="px-2 py-1.5 text-center text-xs">
//                       <span className="font-bold text-green-700">₹{(item.finalPay || item.calculatedSalary || 0).toLocaleString()}</span>
//                     </td>
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
//                         <button onClick={(e) => { e.stopPropagation(); downloadInvoice(item); }} disabled={!isPayslipDownloadAllowed(item.month || selectedMonth)} className={`p-1 rounded ${isPayslipDownloadAllowed(item.month || selectedMonth) ? 'text-purple-600 hover:bg-purple-50' : 'text-gray-400 cursor-not-allowed'}`} title="Download">
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
//                   <p><span className="font-medium text-gray-700">Role:</span> {selectedEmployee.designation || selectedEmployee.role || 'N/A'}</p>
//                   <p><span className="font-medium text-gray-700">Department:</span> {selectedEmployee.department || 'N/A'}</p>
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
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">OT Amount</span><span className="font-semibold text-green-600">₹{(selectedEmployee.finalOTAmount || 0).toFixed(0)}</span></div>
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Calculated Salary</span><span className="font-semibold text-blue-700">₹{Math.round(selectedEmployee.calculatedSalary || 0)}</span></div>
//               <div className="flex justify-between pb-1 border-b"><span className="text-gray-500">Final Pay</span><span className="font-semibold text-green-700">₹{Math.round(selectedEmployee.finalPay || selectedEmployee.calculatedSalary || 0)}</span></div>
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
//               <div className="flex gap-2 pt-2"><button type="button" onClick={handleReset} className="px-3 py-1 text-sm text-white bg-yellow-500 rounded hover:bg-yellow-600">Reset</button><button type="button" onClick={() => setShowEditModal(false)} className="px-3 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400">Cancel</button><button type="submit" className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">Save</button></div>
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
//                 <thead className="bg-gradient-to-r from-green-500 to-blue-600">
//                   <tr>
//                     <th className="p-2 text-left text-white">Select</th>
//                     <th className="p-2 text-left text-white">Employee ID</th>
//                     <th className="p-2 text-left text-white">Name</th>
//                     <th className="p-2 text-right text-white">OT Hours</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {records.length === 0 ? (
//                     <tr><td colSpan="4" className="p-4 text-center text-gray-500">No employees found. </td></tr>
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
//                         <td className="p-2 font-semibold text-right text-blue-600">
//                           {r.overTimeHoursFormatted || formatDecimalHours(r.overTimeHours)}
//                         </td>
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
//   FaUserTag,
//   FaChevronUp,
//   FaChevronDown
// } from "react-icons/fa";
// import { 
//   FiFilter, 
//   FiMapPin, 
//   FiUserCheck, 
//   FiUsers, 
//   FiCoffee, 
//   FiTrendingUp,
//   FiChevronUp,
//   FiChevronDown
// } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";
// import StatCard from "../Components/StatCard";
// import { API_BASE_URL } from "../config";
// import logo from "../Images/Timely-Health-Logo.png";
// import { isEmployeeHidden } from "../utils/employeeStatus";
// import "../index.css";
// import "./EmployeeDashboard.css";
// import "./AttendanceSummary.css";
// const PayRoll = () => {
//   const [records, setRecords] = useState([]);
//   const [allEmployees, setAllEmployees] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [employeeAttendanceDetails, setEmployeeAttendanceDetails] = useState([]);
//   const [employeeLeaves, setEmployeeLeaves] = useState({});
//   const [employeesMasterData, setEmployeesMasterData] = useState({});
//   const navigate = useNavigate();

//   const [showAttendancePopup, setShowAttendancePopup] = useState(false);
//   const [selectedEmployeeAttendance, setSelectedEmployeeAttendance] = useState([]);
//   const [attendanceLoading, setAttendanceLoading] = useState(false);
//   const [showMobileFilters, setShowMobileFilters] = useState(false); // ✅ ADD THIS LINE

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
//   const [showOTModal, setShowOTModal] = useState(false);
//   const [selectedOTEmployees, setSelectedOTEmployees] = useState(() => {
//     const saved = localStorage.getItem("payrollSelectedOTEmployees");
//     return saved ? new Set(JSON.parse(saved)) : new Set();
//   });
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

//   // ✅ State for approved OT claims from API
//   const [approvedOTClaims, setApprovedOTClaims] = useState([]);
//   const [approvedOTMap, setApprovedOTMap] = useState({});

//   // ✅ Medical roles list
//   const medicalRoles = [
//     "Phlebotomist", "Staff Nurse", "Consultant", "Pharmacist",
//     "Nurse", "Doctor", "Lab Technician", "Medical Officer", 
//     "Physician", "Surgeon", "Radiologist", "Pathologist",
//     "Therapist", "Healthcare", "Medical", "Clinical"
//   ];

//   const isMedicalRole = (role) => {
//     if (!role) return false;
//     return medicalRoles.some(medRole => 
//       role.toLowerCase().includes(medRole.toLowerCase())
//     );
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

//   const getEmployeeShiftHours = (employeeId) => {
//     const employeeData = employeesMasterData[employeeId] || {};
//     return employeeData.shiftHours || 8;
//   };

//   const calculateOTForEmployee = (employeeId, hoursWorked) => {
//     const h = Number(hoursWorked) || 0;
//     const shiftHours = getEmployeeShiftHours(employeeId);
    
//     if (h > shiftHours) {
//       return Number((h - shiftHours).toFixed(2));
//     }
//     return 0;
//   };

//   // ✅ Fetch approved OT claims for the selected month
//   const fetchApprovedOTClaims = useCallback(async (month) => {
//     try {
//       const [year, monthNum] = month.split('-').map(Number);
//       const startDate = new Date(year, monthNum - 1, 1);
//       const endDate = new Date(year, monthNum, 0);
      
//       const response = await fetch(`${API_BASE_URL}/employees/allotclaimed?status=approved`);
//       const data = await response.json();
      
//       if (data.success) {
//         const monthClaims = data.claims.filter(claim => {
//           const claimDate = new Date(claim.date);
//           return claimDate >= startDate && claimDate <= endDate;
//         });
        
//         setApprovedOTClaims(monthClaims);
        
//         const otMap = {};
//         monthClaims.forEach(claim => {
//           const empId = claim.employeeId;
//           if (!otMap[empId]) {
//             otMap[empId] = {
//               totalOTHours: 0,
//               totalOTAmount: 0,
//               count: 0,
//               claims: []
//             };
//           }
//           otMap[empId].totalOTHours += claim.otHours || 0;
//           otMap[empId].totalOTAmount += claim.otAmount || 0;
//           otMap[empId].count += 1;
//           otMap[empId].claims.push(claim);
//         });
        
//         setApprovedOTMap(otMap);
//       }
//     } catch (error) {
//       console.error("Error fetching approved OT claims:", error);
//     }
//   }, [API_BASE_URL]);

//   useEffect(() => {
//     if (selectedMonth) {
//       fetchApprovedOTClaims(selectedMonth);
//     }
//   }, [selectedMonth, fetchApprovedOTClaims]);

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

//   const handleOTEmployeeSelection = (employeeId) => {
//     const updated = new Set(selectedOTEmployees);
//     if (updated.has(employeeId)) {
//       updated.delete(employeeId);
//     } else {
//       updated.add(employeeId);
//     }
//     setSelectedOTEmployees(updated);
//     localStorage.setItem("payrollSelectedOTEmployees", JSON.stringify(Array.from(updated)));
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
//     let earnedWeekOffs = 0;

//     for (let d = new Date(year, monthNum - 1, 1); d <= endDate; d.setDate(d.getDate() + 1)) {
//       if (d.getDay() === 0) {
//         let workDaysCount = 0;
//         const weekStart = new Date(d);
//         weekStart.setDate(d.getDate() - 6);
        
//         for (let i = 0; i < 6; i++) {
//           const checkDate = new Date(weekStart);
//           checkDate.setDate(weekStart.getDate() + i);
          
//           if (checkDate.getMonth() + 1 === monthNum && checkDate.getFullYear() === year) {
//             const dateKey = checkDate.toLocaleDateString('en-CA');
//             const hasAttendance = attendanceMap.has(dateKey);
//             const isLeave = isLeaveDayForDate(checkDate, employeeId, employeeLeavesData);
            
//             if (hasAttendance || isLeave) {
//               workDaysCount++;
//             }
//           }
//         }
        
//         if (workDaysCount >= 5) {
//           earnedWeekOffs++;
//         }
//       }
//     }
    
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
//       const targetMonth = month || selectedMonth;

//       const [employeesRes, leavesRes, holidaysRes, summaryRes] = await Promise.all([
//         fetch(EMPLOYEES_API_URL),
//         fetch(LEAVES_API_URL),
//         fetch(`${API_BASE_URL}/holidays/all`),
//         fetch(`${ATTENDANCE_SUMMARY_API_URL}${targetMonth ? `?month=${targetMonth}` : ''}`)
//       ]);

//       let employeesData = [];
//       if (employeesRes.ok) {
//         const employeesDataRaw = await employeesRes.json();
//         employeesData = Array.isArray(employeesDataRaw) ? employeesDataRaw : (employeesDataRaw.data || []);
//       }

//       let leavesData = leavesRes.ok ? await leavesRes.json() : [];
      
//       let holidaysData = holidaysRes.ok ? await holidaysRes.json() : [];
      
//       let summaryData = [];
//       if (summaryRes.ok) {
//         const json = await summaryRes.json();
//         summaryData = json.summary || [];
//       }

//       let allAttendanceRecords = [];
//       try {
//         const attendanceRes = await fetch(`${ATTENDANCE_DETAILS_API_URL}?month=${targetMonth}`);
//         if (attendanceRes.ok) {
//           const attData = await attendanceRes.json();
//           allAttendanceRecords = attData.records || [];
//         }
//       } catch (err) {
//         console.warn("Failed to fetch attendance records:", err);
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
//         console.warn("Failed to fetch shift data:", err);
//       }

//       const employeesForMonth = filterEmployeesByJoiningDate(employeesData, targetMonth);
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
//         const [sYear, sMonth] = targetMonth.split('-').map(Number);
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

//       const currentLeavesMap = processLeavesData(leavesData, targetMonth);
//       const currentCompOffsMap = await processCompOffData(targetMonth, leavesData);

//       const [year, monthNum] = targetMonth.split('-').map(Number);
//       const daysInMonthValue = getDaysInMonth(targetMonth);
//       const processedSalaries = [];
      
//       for (const emp of activeEmployees) {
//         const summary = summaryData.find(x => x.employeeId === emp.employeeId) || {};
        
//         let targetWeekOffCount = emp.weekOffPerMonth || 4;
        
//         const employeeRole = summary.role || emp.role || emp.designation || '';
//         const isMedicalStaff = isMedicalRole(employeeRole);
        
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
//         attendanceForEmployee.forEach(record => {
//           if (record.checkInTime) {
//             const dateKey = new Date(record.checkInTime).toLocaleDateString('en-CA');
//             attendanceMapForCalc.set(dateKey, record);
//           }
//         });
        
//         let finalWeekOffDays = targetWeekOffCount;
//         let isSpecialMay2026 = false;
        
//         if (targetMonth === "2026-05" && targetWeekOffCount === 4 && !isMedicalStaff) {
//           finalWeekOffDays = targetWeekOffCount + 1;
//           isSpecialMay2026 = true;
//         } else {
//           finalWeekOffDays = targetWeekOffCount;
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
        
//         const dailyRate = salaryForMonth > 0 ? salaryForMonth / daysInMonthValue : 0;
//         const presentDaysCount = summary.presentDays ?? 0;
//         const halfDaysCount = summary.halfDayWorking ?? 0;
//         const compOffData = currentCompOffsMap[emp.employeeId] || { balance: 0 };
        
//         let calculatedSalary = 0;
//         if (salaryForMonth > 0 && daysInMonthValue > 0) {
//           const effectivePaidDays = presentDaysCount + (halfDaysCount * 0.5) + (includeWeekOffInSalary ? finalWeekOffDays : 0) + holidayCount + compOffData.balance;
//           calculatedSalary = effectivePaidDays * dailyRate;
//         }

//         const parseTimeStr = (timeStr) => {
//           if (!timeStr) return null;
//           const match = timeStr.trim().match(/(\d{1,2})[:.](\d{2})\s*(AM|PM|am|pm)?/i);
//           if (!match) return null;
//           let hours = parseInt(match[1]);
//           const ampm = match[3] ? match[3].toUpperCase() : null;
//           if (ampm === "PM" && hours < 12) hours += 12;
//           if (ampm === "AM" && hours === 12) hours = 0;
//           return `${hours.toString().padStart(2, '0')}:${match[2]}`;
//         };

//         const parseShiftTimeRange = (timeRange) => {
//           if (!timeRange) return { start: null, end: null };
//           let parts = timeRange.split(/[-]| to /i).map(t => t.trim());
//           if (parts.length >= 2) return { start: parseTimeStr(parts[0]), end: parseTimeStr(parts[1]) };
//           return { start: null, end: null };
//         };

//         const getDefaultShiftTime = (shiftType) => {
//           const shiftTimes = {
//             "A": { start: "10:00", end: "19:00", grace: 5, isBrakeShift: false },
//             "B": { start: "14:00", end: "22:00", grace: 5, isBrakeShift: false },
//             "C": { start: "18:00", end: "21:00", grace: 5, isBrakeShift: false },
//             "D": { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false },
//             "E": { start: "10:00", end: "21:00", grace: 5, isBrakeShift: false },
//             "F": { start: "14:00", end: "23:00", grace: 5, isBrakeShift: false },
//             "G": { start: "09:00", end: "21:00", grace: 5, isBrakeShift: false },
//             "H": { start: "09:00", end: "21:00", grace: 5, isBrakeShift: false },
//             "I": { start: "07:00", end: "17:00", grace: 5, isBrakeShift: false },
//             "BR": { start: "07:00", end: "21:30", grace: 5, isBrakeShift: true },
//           };
//           return shiftTimes[shiftType] || { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false };
//         };

//         const getEmployeeShift = (employeeId) => {
//           const shiftAssignment = shiftsData.find(s => s.employeeAssignment?.employeeId === employeeId || s.employeeId === employeeId);
//           if (!shiftAssignment) return null;
//           const shiftType = shiftAssignment.shiftType;
//           const masterShift = masterShiftsData.find(shift => shift.shiftType === shiftType);
//           if (!masterShift) return getDefaultShiftTime(shiftType);
//           if (masterShift.isBrakeShift && masterShift.timeSlots?.length >= 2) {
//             const slot1 = parseShiftTimeRange(masterShift.timeSlots[0]?.timeRange);
//             const slot2 = parseShiftTimeRange(masterShift.timeSlots[1]?.timeRange);
//             return { start: slot1.start || "07:00", end: slot2.end || "21:30", grace: 5, isBrakeShift: true };
//           }
//           if (masterShift.timeSlots?.length > 0 && masterShift.timeSlots[0].timeRange) {
//             const parsed = parseShiftTimeRange(masterShift.timeSlots[0].timeRange);
//             return { start: parsed.start || "09:00", end: parsed.end || "18:00", grace: 5, isBrakeShift: false };
//           }
//           return getDefaultShiftTime(shiftType);
//         };

//         const getEmployeeShiftHoursActual = (employeeId) => {
//           const shift = getEmployeeShift(employeeId);
//           if (!shift) return 9;
//           const [startHour, startMinute] = shift.start.split(':').map(Number);
//           const [endHour, endMinute] = shift.end.split(':').map(Number);
//           let startMinutes = startHour * 60 + startMinute;
//           let endMinutes = endHour * 60 + endMinute;
//           if (endMinutes <= startMinutes) endMinutes += 24 * 60;
//           return (endMinutes - startMinutes) / 60;
//         };

//         const calculateOTActual = (employeeId, hoursWorked) => {
//           const h = Number(hoursWorked) || 0;
//           const shiftHours = getEmployeeShiftHoursActual(employeeId);
//           if (h > shiftHours) {
//             return Number((h - shiftHours).toFixed(2));
//           }
//           return 0;
//         };

//         let totalOTHours = 0;
//         allAttendanceRecords.forEach(record => {
//           if (record.employeeId !== emp.employeeId) return;
//           if (record.checkInTime) {
//             const recordMonth = new Date(record.checkInTime).toISOString().slice(0, 7);
//             if (recordMonth !== targetMonth) return;
//           }
//           let hoursWorked = 0;
//           if (record.hours) {
//             hoursWorked = parseFloat(record.hours);
//           } else if (record.totalHours) {
//             hoursWorked = parseFloat(record.totalHours);
//           } else if (record.checkInTime && record.checkOutTime) {
//             const checkIn = new Date(record.checkInTime);
//             const checkOut = new Date(record.checkOutTime);
//             hoursWorked = (checkOut - checkIn) / (1000 * 60 * 60);
//           }
//           totalOTHours += calculateOTActual(emp.employeeId, hoursWorked);
//         });

//         totalOTHours = Number(totalOTHours.toFixed(2));
//         const formattedOTHours = formatDecimalHours(totalOTHours);
        
//         // ✅ Get approved OT amount from API
//         const approvedOTData = approvedOTMap[emp.employeeId] || { totalOTAmount: 0, totalOTHours: 0 };
//         const approvedOTAmount = approvedOTData.totalOTAmount || 0;
//         const approvedOTHours = approvedOTData.totalOTHours || 0;
        
//         // ✅ Base calculated salary (WITHOUT OT)
//         const baseCalculatedSalary = Math.round(calculatedSalary);
        
//         // ✅ Final OT Amount and Final Pay
//         let finalOTAmount = 0;
//         let finalPay = baseCalculatedSalary;
        
//         // ✅ Check for approved OT from API
//         if (approvedOTAmount > 0) {
//           finalOTAmount = approvedOTAmount;
//           finalPay = Math.round(baseCalculatedSalary + approvedOTAmount);
//         } else {
//           // Check for manually selected OT
//           const savedOTEmpsString = localStorage.getItem("payrollSelectedOTEmployees");
//           const savedOTEmps = savedOTEmpsString ? new Set(JSON.parse(savedOTEmpsString)) : new Set();
//           const isApprovedInOTPage = localStorage.getItem(`otStatus_${emp.employeeId}_${targetMonth}`) === "approved";
          
//           if (totalOTHours > 0 && (savedOTEmps.has(emp.employeeId) || isApprovedInOTPage)) {
//             const multiplier = Number(localStorage.getItem(`otMultiplier_${emp.employeeId}_${targetMonth}`)) || 2;
//             const otRatePerHour = dailyRate / (emp.shiftHours || 8);
//             const otAmount = totalOTHours * otRatePerHour * multiplier;
//             finalOTAmount = otAmount;
//             finalPay = Math.round(baseCalculatedSalary + otAmount);
//           }
//         }
        
//         const salaryObj = {
//           employeeId: emp.employeeId,
//           name: emp.name,
//           presentDays: presentDaysCount,
//           workingDays: summary.totalWorkingDays ?? 0,
//           totalWorkingDays: summary.totalWorkingDays ?? 0,
//           halfDayWorking: halfDaysCount,
//           fullDayNotWorking: summary.fullDayNotWorking ?? 0,
//           calculatedSalary: baseCalculatedSalary, // ✅ Base salary WITHOUT OT (pehle jaisa)
//           baseCalculatedSalary: baseCalculatedSalary,
//           salaryPerMonth: salaryForMonth,
//           currentSalary: emp.salaryPerMonth,
//           originalSalary: originalSalary,
//           salaryPerDay: dailyRate,
//           weekOffs: finalWeekOffDays,
//           actualWeekOffCount: finalWeekOffDays,
//           targetWeekOffCount: targetWeekOffCount,
//           originalWeekOffPerMonth: targetWeekOffCount,
//           isSpecialMay2026: isSpecialMay2026,
//           weekOffDay: emp.weekOffDay || 'Sunday',
//           totalLeaves: 0,
//           month: targetMonth || "No Month",
//           monthDays: daysInMonthValue,
//           includeWeekOffInSalary: includeWeekOffInSalary,
//           isHistoricalMonth: isHistorical,
//           isCurrentMonth: isCurrent,
//           department: emp.department || 'N/A',
//           designation: employeeRole || emp.role || emp.designation || 'N/A',
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
//           overTimeHours: totalOTHours,
//           overTimeHoursFormatted: formattedOTHours,
//           shiftHours: emp.shiftHours || 8,
//           role: employeeRole,
//           isMedicalStaff: isMedicalStaff,
//           // ✅ OT fields
//           finalOTAmount: Math.round(finalOTAmount),
//           finalPay: finalPay,
//           otAmount: Math.round(finalOTAmount),
//           hasApprovedOT: approvedOTAmount > 0,
//           approvedOTAmount: approvedOTAmount,
//           approvedOTHours: approvedOTHours
//         };

//         processedSalaries.push(salaryObj);
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
//   }, [EMPLOYEES_API_URL, LEAVES_API_URL, API_BASE_URL, ATTENDANCE_SUMMARY_API_URL, ATTENDANCE_DETAILS_API_URL, processLeavesData, filterInactiveEmployees, filterEmployeesByJoiningDate, processCompOffData, selectedMonth, approvedOTMap]);

//   useEffect(() => {
//     if (records.length === 0) return;

//     const processRecordsWithAdditions = (prevRecords) => 
//       prevRecords.map(record => {
//         let baseSalary = record.baseCalculatedSalary || record.calculatedSalary || 0;
//         let otAmount = 0;
        
//         // ✅ Check for approved OT from API
//         if (record.hasApprovedOT) {
//           otAmount = record.approvedOTAmount || 0;
//         } else {
//           const isApprovedInOTPage = localStorage.getItem(`otStatus_${record.employeeId}_${selectedMonth}`) === "approved";
//           if (record.overTimeHours > 0 && (selectedOTEmployees.has(record.employeeId) || isApprovedInOTPage)) {
//             const dailyRate = record.salaryPerDay || 0;
//             const shiftHours = record.shiftHours || 8;
//             const multiplier = Number(localStorage.getItem(`otMultiplier_${record.employeeId}_${selectedMonth}`)) || 2;
//             const otRatePerHour = dailyRate / shiftHours;
//             otAmount = record.overTimeHours * otRatePerHour * multiplier;
//           }
//         }
        
//         return {
//           ...record,
//           calculatedSalary: Math.round(baseSalary), // ✅ Base salary WITHOUT OT
//           otAmount: Math.round(otAmount),
//           finalOTAmount: Math.round(otAmount),
//           finalPay: Math.round(baseSalary + otAmount) // ✅ Base + OT
//         };
//       });

//     const updatedRecords = processRecordsWithAdditions(records);
//     setRecords(updatedRecords);
//     setFilteredRecords(updatedRecords);
//   }, [employeeCompOffs, employeeLeaves, employeesMasterData, monthDays, selectedMonth, selectedOTEmployees, approvedOTMap]);

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

//   const getWeekOffDaysForDisplay = (employee) => {
//     if (employee.isSpecialMay2026) {
//       return `${employee.originalWeekOffPerMonth} + 1 (Special)`;
//     }
//     return employee.weekOffs || 0;
//   };

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

//     let actualWeekOffDaysNumeric = employee.weekOffs || 0;
//     let weekOffDisplayValue = actualWeekOffDaysNumeric;
    
//     if (employee.isSpecialMay2026) {
//       weekOffDisplayValue = `${employee.originalWeekOffPerMonth || 4} + 1 (Special)`;
//     }
    
//     const presentDays = employee.presentDays ?? 0;
//     const halfDays = employee.halfDayWorking || 0;
//     const holidays = employee.holidayCount || 0;

//     let totalPaidDays = presentDays + (halfDays * 0.5) + actualWeekOffDaysNumeric + holidays;
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
//       earningsItems.push({ label: `Overtime`, amount: otAmount });
//     }
    
//     if (compOffPay > 0) {
//       earningsItems.push({ label: 'Comp-off / Holiday Pay', amount: compOffPay });
//     }
    
//     if (holidays > 0) {
//       earningsItems.push({ label: `Public Holidays (${holidays})`, amount: holidays * dailyRate, isInfo: true });
//     }
    
//     earningsItems.push({ label: `Working Days (Full: ${presentDays})`, amount: 0, isInfo: true });
//     earningsItems.push({ label: `Week Off Days (${weekOffDisplayValue})`, amount: 0, isInfo: true });
    
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
//               </tr>
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
//               ${(employeeData.panNo) ? `<tr><td colspan="2"><strong>PAN No.:</strong> ${employeeData.panNo}</td><td colspan="2"></td></tr>` : ''}
//               ${(employeeData.pfNo) ? `<tr><td colspan="2"><strong>PF No.:</strong> ${employeeData.pfNo}</td><td colspan="2"></td></tr>` : ''}
//               ${(employeeData.uanNo) ? `<tr><td colspan="2"><strong>UAN No.:</strong> ${employeeData.uanNo}</td><td colspan="2"></td></tr>` : ''}
//               ${(employeeData.branch) ? `<tr><td colspan="2"><strong>Branch:</strong> ${employeeData.branch}</td><td colspan="2"></td></tr>` : ''}
//               ${(employeeData.esicNo) ? `<tr><td colspan="2"><strong>ESIC No.:</strong> ${employeeData.esicNo}</td><td colspan="2"></td></tr>` : ''}
//               ${(employeeData.bankAccount) ? `<tr><td colspan="4"><strong>Bank Account:</strong> ${employeeData.bankAccount}</td></tr>` : ''}
//             </table>
//             <tr>
//               <tr style="background:#f0f0f0;">
//                 <td style="width:40%;"><strong>EARNINGS</strong></td>
//                 <td style="width:10%; text-align:center;"><strong>₹</strong></td>
//                 <td style="width:40%;"><strong>DEDUCTIONS</strong></td>
//                 <td style="width:10%; text-align:center;"><strong>₹</strong></td
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

//     const getAllDatesOfMonth = (month) => {
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

//     const monthDates = getAllDatesOfMonth(selectedMonth);

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

//     const isWeekOffDay = (date) => {
//       if (!date || !selectedEmployee) return false;
//       return weekOffDatesSet.has(date.toLocaleDateString('en-CA'));
//     };

//     let weekOffCount = 0, leaveCount = 0, absentCount = 0, presentCount = 0;

//     monthDates.forEach(date => {
//       const dateKey = date.toLocaleDateString('en-CA');
//       const record = attendanceMap.get(dateKey);
//       const isWO = isWeekOffDay(date);
//       const hasAttendance = !!record;
//       const isLV = !isWO && isLeaveDay(date, selectedEmployee?.employeeId, employeeLeaves);
      
//       if (isWO && !hasAttendance) weekOffCount++;
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
//               <span className="text-green-600">Present: <strong>{presentCount}</strong></span>
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
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Check-In</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Check-Out</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Reason</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Hours</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Status</th>
//                       <th className="px-2 py-1.5 text-center text-xs font-medium">Admin Comment</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {monthDates.map((date) => {
//                       const dateKey = date.toLocaleDateString('en-CA');
//                       const record = attendanceMap.get(dateKey);
//                       const hasAttendance = !!record;
                      
//                       const workHours = record ? calculateWorkHours(record.checkInTime, record.checkOutTime) : null;
                      
//                       const isWeekOff = isWeekOffDay(date);
//                       const isLeave = !isWeekOff && isLeaveDay(date, selectedEmployee?.employeeId, employeeLeaves);
                      
//                       const effectiveWeekOff = isWeekOff && !hasAttendance;
                      
//                       let bgColor = '';
//                       let dayType = '';
//                       let statusText = '';
                      
//                       if (effectiveWeekOff) {
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
//                           <td className="px-2 py-1 text-xs text-center">{!effectiveWeekOff && !isLeave && hasAttendance ? formatTime(record?.checkInTime) : '-'}</td>
//                           <td className="px-2 py-1 text-xs text-center">{!effectiveWeekOff && !isLeave && hasAttendance ? formatTime(record?.checkOutTime) : '-'}</td>
//                           <td className="px-2 py-1 text-xs text-center">{record?.status || '-'}</td>
//                           <td className="px-2 py-1 text-xs text-center">{!effectiveWeekOff && !isLeave && hasAttendance && workHours ? `${workHours}h` : '-'}</td>
//                           <td className="px-2 py-1 text-center">
//                             <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${effectiveWeekOff ? 'bg-orange-100 text-orange-700' : isLeave ? 'bg-red-100 text-red-700' : !hasAttendance ? 'bg-gray-100 text-gray-500' : dayType === 'Full Day' ? 'bg-green-100 text-green-700' : dayType === 'Half Day' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{dayType}</span>
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
//             <button onClick={() => setShowAttendancePopup(false)} className="px-4 py-1.5 text-sm text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700">Close</button>
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
//     <div className="emp-dash">
//       <main className="p-2 sm:p-4 lg:p-6">
//         {/* Header */}
//         <div className="emp-dash__header">
//           <div className="flex items-baseline gap-3 flex-wrap">
//     <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
//               Employee <span>Payroll</span>
//             </h1>
//             <p className="emp-dash__subtitle text-xs sm:text-sm text-gray-500 font-medium">
//               Monthly payroll computation, overtime adjustments, and payslip generation.
//             </p>
//           </div>
//           <div className="emp-dash__date-pill">
//             <FaCalendarAlt />
//             <span>{formatMonthDisplay(selectedMonth)}</span>
//           </div>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
//           <div className="emp-dash__stat">
//             <div className="emp-dash__stat-top">
//               <span className="emp-dash__stat-label">Active Employees</span>
//               <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
//                 <FiUsers />
//               </div>
//             </div>
//             <div className="emp-dash__stat-value">{filteredRecords.length}</div>
//             <div className="emp-dash__stat-meta">registered & active</div>
//           </div>

//           <div className="emp-dash__stat">
//             <div className="emp-dash__stat-top">
//               <span className="emp-dash__stat-label">Total Net Pay</span>
//               <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
//                 <FiTrendingUp />
//               </div>
//             </div>
//             <div className="emp-dash__stat-value">
//               ₹{filteredRecords.reduce((sum, emp) => sum + (emp.finalPay || emp.calculatedSalary || 0), 0).toLocaleString()}
//             </div>
//             <div className="emp-dash__stat-meta">calculated payout</div>
//           </div>

//           <div className="emp-dash__stat">
//             <div className="emp-dash__stat-top">
//               <span className="emp-dash__stat-label">Active This Month</span>
//               <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
//                 <FiUserCheck />
//               </div>
//             </div>
//             <div className="emp-dash__stat-value">
//               {filteredRecords.filter(emp => !emp.isHistoricalMonth).length}
//             </div>
//             <div className="emp-dash__stat-meta">current cycle active</div>
//           </div>

//           <div className="emp-dash__stat">
//             <div className="emp-dash__stat-top">
//               <span className="emp-dash__stat-label">On Leave</span>
//               <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
//                 <FiCoffee />
//               </div>
//             </div>
//             <div className="emp-dash__stat-value">
//               {filteredRecords.filter(emp => (employeeLeaves[emp.employeeId]?.CL > 0 || employeeLeaves[emp.employeeId]?.EL > 0)).length}
//             </div>
//             <div className="emp-dash__stat-meta">approved leave status</div>
//           </div>
//         </div>

//       {/* Filters Card */}
// <div className="emp-dash__card mb-6">
//   {/* Desktop View */}
//   <div className="hidden sm:block">
//     <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-200">
//       {/* Left - Filters */}
//       <div className="flex items-center gap-2 flex-1 min-w-0">
//         {/* Search */}
//         <div className="relative min-w-[120px] flex-1 max-w-[160px]">
//           <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
//           <input
//             type="text"
//             placeholder="Search ID or Name..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
//           />
//         </div>

//         {/* Department */}
//         <div className="relative" ref={departmentFilterRef}>
//           <button
//             onClick={() => {
//               setShowDepartmentFilter(!showDepartmentFilter);
//               setShowDesignationFilter(false);
//             }}
//             className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white whitespace-nowrap ${
//               filterDepartment
//                 ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50"
//                 : "border-gray-300 text-gray-700 hover:bg-gray-50"
//             }`}
//           >
//             <FaBuilding className="text-gray-400 text-[10px]" />
//             <span className="truncate max-w-[80px]">{filterDepartment || "Dept"}</span>
//             <span className="text-gray-400 text-[10px]">▾</span>
//           </button>
//           {showDepartmentFilter && (
//             <div 
//               className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl min-w-[200px] max-h-60 overflow-y-auto"
//               style={{
//                 zIndex: 99999,
//                 top: departmentFilterRef.current ? departmentFilterRef.current.getBoundingClientRect().bottom + 4 : 'auto',
//                 left: departmentFilterRef.current ? departmentFilterRef.current.getBoundingClientRect().left : 'auto',
//               }}
//             >
//               <div
//                 onClick={() => {
//                   setFilterDepartment("");
//                   setShowDepartmentFilter(false);
//                 }}
//                 className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
//               >
//                 All Departments
//               </div>
//               {uniqueDepartments.map((dept) => (
//                 <div
//                   key={dept}
//                   onClick={() => {
//                     setFilterDepartment(dept);
//                     setShowDepartmentFilter(false);
//                   }}
//                   className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 ${
//                     filterDepartment === dept ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
//                   }`}
//                 >
//                   {dept}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Designation */}
//         <div className="relative" ref={designationFilterRef}>
//           <button
//             onClick={() => {
//               setShowDesignationFilter(!showDesignationFilter);
//               setShowDepartmentFilter(false);
//             }}
//             className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white whitespace-nowrap ${
//               filterDesignation
//                 ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50"
//                 : "border-gray-300 text-gray-700 hover:bg-gray-50"
//             }`}
//           >
//             <FaUserTag className="text-gray-400 text-[10px]" />
//             <span className="truncate max-w-[80px]">{filterDesignation || "Desig"}</span>
//             <span className="text-gray-400 text-[10px]">▾</span>
//           </button>
//           {showDesignationFilter && (
//             <div 
//               className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl min-w-[200px] max-h-60 overflow-y-auto"
//               style={{
//                 zIndex: 99999,
//                 top: designationFilterRef.current ? designationFilterRef.current.getBoundingClientRect().bottom + 4 : 'auto',
//                 left: designationFilterRef.current ? designationFilterRef.current.getBoundingClientRect().left : 'auto',
//               }}
//             >
//               <div
//                 onClick={() => {
//                   setFilterDesignation("");
//                   setShowDesignationFilter(false);
//                 }}
//                 className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
//               >
//                 All Designations
//               </div>
//               {uniqueDesignations.map((des) => (
//                 <div
//                   key={des}
//                   onClick={() => {
//                     setFilterDesignation(des);
//                     setShowDesignationFilter(false);
//                   }}
//                   className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 ${
//                     filterDesignation === des ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
//                   }`}
//                 >
//                   {des}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Date From - Compact */}
//         <div className="relative">
//           <input
//             type="date"
//             value={fromDate}
//             onChange={(e) => setFromDate(e.target.value)}
//             onClick={(e) => e.target.showPicker && e.target.showPicker()}
//             placeholder="From"
//             className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
//           />
//         </div>

//         {/* Date To - Compact */}
//         <div className="relative">
//           <input
//             type="date"
//             value={toDate}
//             onChange={(e) => setToDate(e.target.value)}
//             onClick={(e) => e.target.showPicker && e.target.showPicker()}
//             placeholder="To"
//             className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
//           />
//         </div>

//         {/* Month Picker - Compact */}
//         <div className="relative">
//           <input
//             type="month"
//             value={selectedMonth}
//             onChange={handleMonthChange}
//             onClick={(e) => e.target.showPicker && e.target.showPicker()}
//             className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-semibold"
//           />
//         </div>
//       </div>

//       {/* Right - Action Buttons */}
//       <div className="flex items-center gap-1.5 flex-shrink-0">
//         <button
//           onClick={handleDateRangeFilter}
//           disabled={!fromDate || !toDate}
//           className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap disabled:opacity-50"
//         >
//           <FaSearch className="w-3 h-3" />
//           Apply
//         </button>

//         <button
//           onClick={() => setShowTemplateModal(true)}
//           className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-all shadow-sm whitespace-nowrap"
//         >
//           ⚙️
//         </button>

//         <button
//           onClick={() => {
//             const currentMonth = new Date().toISOString().slice(0, 7);
//             setSelectedMonth(currentMonth);
//             fetchData(currentMonth);
//           }}
//           className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-all shadow-sm whitespace-nowrap"
//         >
//           Current
//         </button>

//         <button
//           onClick={() => fetchData(selectedMonth)}
//           className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-all shadow-sm whitespace-nowrap"
//         >
//           ⟳
//         </button>

//         <button
//           onClick={() => navigate("/bank-reports")}
//           className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap"
//         >
//           Bank Reports
//         </button>

//         <button
//           onClick={() => setShowOTModal(true)}
//           className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all shadow-sm whitespace-nowrap"
//         >
//           OT ({selectedOTEmployees.size})
//         </button>

//         {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate || selectedMonth !== new Date().toISOString().slice(0, 7)) && (
//           <button
//             onClick={clearFilters}
//             className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
//           >
//             ✕ Clear
//           </button>
//         )}
//       </div>
//     </div>
//   </div>

//   {/* Mobile View */}
//   <div className="sm:hidden">
//     {/* Mobile Header with Toggle */}
//     <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
//       <button
//         onClick={() => setShowMobileFilters(!showMobileFilters)}
//         className="flex items-center gap-2 text-sm font-semibold text-gray-700"
//       >
//         <FiFilter className="text-blue-600 text-base" />
//         <span>Filters</span>
//         {showMobileFilters ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
//       </button>
//       <span className="text-xs text-gray-500">
//         <strong>{filteredRecords.length}</strong> employees
//       </span>
//     </div>

//     {/* Mobile Filters */}
//     {showMobileFilters && (
//       <div className="mt-2 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
//         {/* Search */}
//         <div>
//           <label className="block text-xs font-medium text-gray-600 mb-1">Search Employee</label>
//           <div className="relative">
//             <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
//             <input
//               type="text"
//               placeholder="Search ID or Name..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
//             />
//           </div>
//         </div>

//         {/* Department */}
//         <div className="relative" ref={departmentFilterRef}>
//           <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
//           <button
//             onClick={() => {
//               setShowDepartmentFilter(!showDepartmentFilter);
//               setShowDesignationFilter(false);
//             }}
//             className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg border transition-all bg-white ${
//               filterDepartment ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50" : "border-gray-300 text-gray-700"
//             }`}
//           >
//             <span className="flex items-center gap-2"><FaBuilding className="text-gray-400" />{filterDepartment || "All Departments"}</span>
//             <span className="text-gray-400">▾</span>
//           </button>
//           {showDepartmentFilter && (
//             <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//               <div onClick={() => { setFilterDepartment(""); setShowDepartmentFilter(false); }} className="px-3 py-2.5 text-sm font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50">All Departments</div>
//               {uniqueDepartments.map((dept) => (
//                 <div key={dept} onClick={() => { setFilterDepartment(dept); setShowDepartmentFilter(false); }} className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-blue-50 ${filterDepartment === dept ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}>{dept}</div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Designation */}
//         <div className="relative" ref={designationFilterRef}>
//           <label className="block text-xs font-medium text-gray-600 mb-1">Designation</label>
//           <button
//             onClick={() => {
//               setShowDesignationFilter(!showDesignationFilter);
//               setShowDepartmentFilter(false);
//             }}
//             className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg border transition-all bg-white ${
//               filterDesignation ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50" : "border-gray-300 text-gray-700"
//             }`}
//           >
//             <span className="flex items-center gap-2"><FaUserTag className="text-gray-400" />{filterDesignation || "All Designations"}</span>
//             <span className="text-gray-400">▾</span>
//           </button>
//           {showDesignationFilter && (
//             <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//               <div onClick={() => { setFilterDesignation(""); setShowDesignationFilter(false); }} className="px-3 py-2.5 text-sm font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50">All Designations</div>
//               {uniqueDesignations.map((des) => (
//                 <div key={des} onClick={() => { setFilterDesignation(des); setShowDesignationFilter(false); }} className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-blue-50 ${filterDesignation === des ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}>{des}</div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Date From & To */}
//         <div className="grid grid-cols-2 gap-2">
//           <div>
//             <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
//             <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white" />
//           </div>
//           <div>
//             <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
//             <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white" />
//           </div>
//         </div>

//         {/* Month */}
//         <div>
//           <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
//           <input type="month" value={selectedMonth} onChange={handleMonthChange} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-semibold" />
//         </div>

//         {/* Mobile Action Buttons */}
//         <div className="pt-3 border-t border-gray-200 space-y-2">
//           <div className="grid grid-cols-2 gap-2">
//             <button onClick={handleDateRangeFilter} disabled={!fromDate || !toDate} className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50">
//               <FaSearch className="w-4 h-4" /> Apply
//             </button>
//             <button onClick={() => setShowTemplateModal(true)} className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-all shadow-sm">
//               ⚙️ Template
//             </button>
//           </div>
//           <div className="grid grid-cols-3 gap-2">
//             <button onClick={() => { const currentMonth = new Date().toISOString().slice(0, 7); setSelectedMonth(currentMonth); fetchData(currentMonth); }} className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-all shadow-sm">
//               Current
//             </button>
//             <button onClick={() => fetchData(selectedMonth)} className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-all shadow-sm">
//               ⟳ Refresh
//             </button>
//             <button onClick={() => setShowOTModal(true)} className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all shadow-sm">
//               OT ({selectedOTEmployees.size})
//             </button>
//           </div>
//           <div className="grid grid-cols-2 gap-2">
//             <button onClick={() => navigate("/bank-reports")} className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm">
//               Bank Reports
//             </button>
//             {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate || selectedMonth !== new Date().toISOString().slice(0, 7)) && (
//               <button onClick={clearFilters} className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
//                 ✕ Clear
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     )}
//   </div>
// </div>

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

//         {selectedMonth === "2026-05" && (
//           <div className="px-3 py-2 mb-3 border-l-4 border-blue-500 rounded-md shadow-sm bg-blue-50">
//             <p className="text-xs font-medium text-blue-700">
//               🎉 May 2026 Special: Non-medical employees with 4 week-offs will get +1 extra week off (total 5 week offs)!
//             </p>
//           </div>
//         )}

//         {/* Table Card */}
//         <div className="emp-dash__card mb-6">
//           {/* <div className="emp-dash__card-header">
//             <div>
//               <h3 className="emp-dash__card-title">Payroll Computation</h3>
//               <p className="emp-dash__card-desc">Monthly base salary calculations, overtime pay and final pay summary.</p>
//             </div>
//           </div> */}

//           <div className="overflow-x-auto">
//             <table className="emp-dash__table">
//               <thead>
//                 <tr>
//                   <th>Emp ID</th>
//                   <th>Name</th>
//                   <th style={{ textAlign: "center" }}>Role</th>
//                   <th style={{ textAlign: "center" }}>Dept</th>
//                   <th style={{ textAlign: "center" }}>Working</th>
//                   <th style={{ textAlign: "center" }}>Present</th>
//                   <th style={{ textAlign: "center" }}>Half</th>
//                   <th style={{ textAlign: "center" }}>Week Off</th>
//                   <th style={{ textAlign: "center" }}>Monthly Salary</th>
//                   <th style={{ textAlign: "center" }}>OT Amount</th>
//                   <th style={{ textAlign: "center" }}>Calculated</th>
//                   <th style={{ textAlign: "center" }}>Final Pay</th>
//                   <th style={{ textAlign: "right" }}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentRecords.map((item, index) => (
//                   <tr
//                     key={item.employeeId}
//                     onClick={() => handleRowClick(item)}
//                     className="transition-colors hover:bg-slate-50/50 cursor-pointer"
//                   >
//                     <td className="font-semibold text-slate-800 text-[11px]">
//                       {item.employeeId}
//                     </td>
//                     <td>
//                       <div className="flex items-center justify-start gap-2">
//                         <div className="flex items-center justify-center w-7 h-7 text-[10px] font-bold bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-full shadow-inner animate-pulse-subtle">
//                           {item.name ? item.name.charAt(0).toUpperCase() : "?"}
//                         </div>
//                         <span className="font-semibold text-slate-800 text-xs whitespace-nowrap">
//                           {item.name}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="text-center text-slate-600 text-[11px] font-medium whitespace-nowrap">
//                       {item.designation || item.role || '-'}
//                     </td>
//                     <td className="text-center text-slate-600 text-[11px] font-medium whitespace-nowrap">
//                       {item.department}
//                     </td>
//                     <td className="text-center whitespace-nowrap">
//                       <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
//                         {item.totalWorkingDays || 0}
//                       </span>
//                     </td>
//                     <td className="text-center whitespace-nowrap">
//                       <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
//                         {item.presentDays || 0}
//                       </span>
//                     </td>
//                     <td className="text-center whitespace-nowrap">
//                       <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
//                         {item.halfDayWorking || 0}
//                       </span>
//                     </td>
//                     <td className="text-center whitespace-nowrap">
//                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.isSpecialMay2026 ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
//                         {getWeekOffDaysForDisplay(item)}
//                       </span>
//                     </td>
//                     <td className="text-center whitespace-nowrap">
//                       <div className="font-semibold text-slate-700">₹{(item.salaryPerMonth || 0).toLocaleString()}</div>
//                       {item.currentSalary && item.currentSalary !== item.salaryPerMonth && (
//                         <div className="text-[9px] text-gray-400 line-through">₹{item.currentSalary.toLocaleString()}</div>
//                       )}
//                       {item.historicalEffectiveFrom && item.historicalEffectiveFrom !== item.joinDate && (
//                         <div className="text-[8px] text-blue-600 font-medium">w.e.f {new Date(item.historicalEffectiveFrom).toLocaleDateString()}</div>
//                       )}
//                     </td>
//                     <td className="text-center whitespace-nowrap">
//                       {item.finalOTAmount > 0 ? (
//                         <span className="font-bold text-green-600">₹{item.finalOTAmount.toFixed(0)}</span>
//                       ) : (
//                         <span className="text-gray-400">-</span>
//                       )}
//                     </td>
//                     <td className="text-center whitespace-nowrap">
//                       <span className="font-bold text-blue-700">₹{calculateSalary(item).toLocaleString()}</span>
//                     </td>
//                     <td className="text-center whitespace-nowrap">
//                       <span className="font-extrabold text-green-700">₹{(item.finalPay || item.calculatedSalary || 0).toLocaleString()}</span>
//                     </td>
//                     <td className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
//                       <div className="flex justify-end gap-1.5">
//                         <button
//                           onClick={(e) => { e.stopPropagation(); handleView(item); }}
//                           className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg transition-all shadow-sm"
//                           title="View Details"
//                         >
//                           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                           </svg>
//                         </button>
//                         <button
//                           onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
//                           className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-lg transition-all shadow-sm"
//                           title="Edit Adjustment"
//                         >
//                           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                           </svg>
//                         </button>
//                         <button
//                           onClick={(e) => { e.stopPropagation(); downloadInvoice(item); }}
//                           disabled={!isPayslipDownloadAllowed(item.month || selectedMonth)}
//                           className={`p-1.5 border rounded-lg transition-all shadow-sm ${
//                             isPayslipDownloadAllowed(item.month || selectedMonth)
//                               ? 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-100'
//                               : 'text-gray-300 bg-gray-50 border-gray-100 cursor-not-allowed'
//                           }`}
//                           title="Download Payslip"
//                         >
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

//           {/* Pagination */}
//           {filteredRecords.length > 0 && (
//             <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200/50 bg-gray-50/30">
//               <div className="flex items-center gap-2">
//                 <span className="text-xs text-gray-500 font-medium">Show</span>
//                 <select
//                   value={itemsPerPage}
//                   onChange={handleItemsPerPageChange}
//                   className="p-1 text-xs border border-gray-300 rounded bg-white text-gray-700 focus:outline-none"
//                 >
//                   <option value={5}>5</option>
//                   <option value={10}>10</option>
//                   <option value={20}>20</option>
//                   <option value={50}>50</option>
//                 </select>
//                 <span className="text-xs text-gray-500 font-medium">records per page</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <button
//                   onClick={handlePrevious}
//                   disabled={currentPage === 1}
//                   className="px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-55 transition disabled:opacity-50"
//                 >
//                   Prev
//                 </button>
//                 {getPageNumbers().map((page, idx) => (
//                   <button
//                     key={idx}
//                     onClick={() => typeof page === 'number' && handlePageClick(page)}
//                     disabled={page === "..."}
//                     className={`px-3 py-1.5 text-xs font-semibold border rounded-lg transition ${
//                       page === "..."
//                         ? "text-gray-400 bg-white border-transparent cursor-default"
//                         : currentPage === page
//                         ? "text-white bg-blue-600 border-blue-600"
//                         : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
//                     }`}
//                   >
//                     {page}
//                   </button>
//                 ))}
//                 <button
//                   onClick={handleNext}
//                   disabled={currentPage === totalPages}
//                   className="px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-55 transition disabled:opacity-50"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </main>

//       {/* View Modal */}
//       {showViewModal && selectedEmployee && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
//           <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto border border-gray-100">
//             <div className="sticky top-0 z-10 flex items-center justify-between mb-4 bg-white pb-3 border-b border-gray-100">
//               <h2 className="text-lg font-bold text-gray-800">Employee Payroll Details</h2>
//               <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600 transition">
//                 <FaTimes size={18} />
//               </button>
//             </div>
            
//             <div className="flex items-center space-x-4 mb-6 bg-slate-50 p-4 rounded-xl">
//               <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white text-lg font-bold rounded-full shadow-md shrink-0">
//                 {selectedEmployee.name?.charAt(0) || 'E'}
//               </div>
//               <div className="flex-1">
//                 <h3 className="text-base font-bold text-gray-800">{selectedEmployee.name}</h3>
//                 <div className="grid grid-cols-2 text-xs text-gray-500 gap-x-4 mt-0.5">
//                   <p><span className="font-semibold text-gray-700">ID:</span> {selectedEmployee.employeeId}</p>
//                   <p><span className="font-semibold text-gray-700">Role:</span> {selectedEmployee.designation || selectedEmployee.role || 'N/A'}</p>
//                   <p><span className="font-semibold text-gray-700">Department:</span> {selectedEmployee.department || 'N/A'}</p>
//                   <p><span className="font-semibold text-gray-700">Month:</span> {selectedEmployee.month || selectedMonth}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 text-xs sm:grid-cols-2 gap-x-8 gap-y-2 mb-6">
//               <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">Present Days</span><span className="font-bold text-emerald-700">{selectedEmployee.presentDays || 0}</span></div>
//               <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">Working Days</span><span className="font-bold text-blue-700">{selectedEmployee.totalWorkingDays || 0}</span></div>
//               <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">Half Days</span><span className="font-bold text-amber-700">{selectedEmployee.halfDayWorking || 0}</span></div>
//               <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">WeekOff Days</span><span className="font-bold text-purple-700">{getWeekOffDaysForDisplay(selectedEmployee)}</span></div>
//               <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">Month Days</span><span className="font-bold text-slate-700">{selectedEmployee.monthDays || monthDays}</span></div>
//               <div className="flex justify-between py-1.5 border-b border-gray-100">
//                 <span className="text-gray-500 font-medium">Monthly Salary</span>
//                 <div className="text-right">
//                   <span className="font-bold text-slate-800">₹{selectedEmployee.salaryPerMonth || 0}</span>
//                   {selectedEmployee.currentSalary && selectedEmployee.currentSalary !== selectedEmployee.salaryPerMonth && (
//                     <div className="text-[9px] text-gray-400 line-through">₹{selectedEmployee.currentSalary.toLocaleString()}</div>
//                   )}
//                 </div>
//               </div>
//               <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">Daily Rate</span><span className="font-bold text-slate-700">₹{calculateDailyRate(selectedEmployee)}/day</span></div>
//               <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">OT Amount</span><span className="font-bold text-emerald-600">₹{(selectedEmployee.finalOTAmount || 0).toFixed(0)}</span></div>
//               <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium text-blue-600">Calculated Base Salary</span><span className="font-bold text-blue-600">₹{Math.round(selectedEmployee.calculatedSalary || 0)}</span></div>
//               <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-700 font-bold">Final Pay</span><span className="font-bold text-emerald-700">₹{Math.round(selectedEmployee.finalPay || selectedEmployee.calculatedSalary || 0)}</span></div>
              
//               <div className="flex flex-col py-1.5 border-b border-gray-100 sm:col-span-2">
//                 <div className="flex justify-between"><span className="text-gray-500 font-medium">Approved Leaves</span><span className="font-bold text-rose-600">{getLeaveTypes(selectedEmployee) || "0"}</span></div>
//               </div>
//             </div>

//             <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
//               <button
//                 onClick={() => downloadInvoice(selectedEmployee)}
//                 disabled={!isPayslipDownloadAllowed(selectedEmployee.month || selectedMonth)}
//                 className={`px-4 py-2 text-xs font-semibold rounded-lg transition duration-200 ${
//                   isPayslipDownloadAllowed(selectedEmployee.month || selectedMonth)
//                     ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-200'
//                     : 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                 }`}
//               >
//                 Download Payslip
//               </button>
//               <button
//                 onClick={() => setShowViewModal(false)}
//                 className="px-4 py-2 text-xs font-semibold text-white bg-slate-700 rounded-lg hover:bg-slate-800 transition"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit Modal */}
//       {showEditModal && selectedEmployee && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
//           <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto border border-gray-100">
//             <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
//               <h2 className="text-base font-bold text-gray-800">Edit Salary - {selectedEmployee.name}</h2>
//               <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 transition">
//                 <FaTimes size={18} />
//               </button>
//             </div>
//             <form onSubmit={handleEditSubmit} className="space-y-4">
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Present Days</label>
//                   <input type="number" name="presentDays" value={editFormData.presentDays || 0} onChange={handleInputChange} className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold" />
//                 </div>
//                 <div>
//                   <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Working Days</label>
//                   <input type="number" name="workingDays" value={editFormData.workingDays || 0} onChange={handleInputChange} className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold" />
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Half Days</label>
//                   <input type="number" name="halfDayWorking" value={editFormData.halfDayWorking || 0} onChange={handleInputChange} className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold" />
//                 </div>
//                 <div>
//                   <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Bonus (₹)</label>
//                   <input type="number" name="bonus" value={extraWorkData.bonus || 0} onChange={handleExtraWorkChange} className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold" />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Deductions (₹)</label>
//                 <input type="number" name="deductions" value={extraWorkData.deductions || 0} onChange={handleExtraWorkChange} className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold" />
//               </div>
//               <div>
//                 <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Adjustment Reason</label>
//                 <input type="text" name="reason" value={extraWorkData.reason || ""} onChange={handleExtraWorkChange} placeholder="e.g. Performance bonus or Loss of Pay" className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold" />
//               </div>
              
//               <div className="flex gap-2 pt-4 border-t border-gray-100 justify-end">
//                 <button type="button" onClick={handleReset} className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition shadow-sm">
//                   Reset System
//                 </button>
//                 <button type="button" onClick={() => setShowEditModal(false)} className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
//                   Cancel
//                 </button>
//                 <button type="submit" className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-200">
//                   Save Changes
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Template Modal */}
//       {showTemplateModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
//           <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-2xl border border-gray-100">
//             <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
//               <h2 className="text-base font-bold text-gray-800">Edit Payslip Template</h2>
//               <button onClick={() => setShowTemplateModal(false)} className="text-gray-400 hover:text-gray-600 transition">
//                 <FaTimes size={18} />
//               </button>
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Company Name</label>
//                 <input type="text" value={templateConfig.companyName} onChange={(e) => setTemplateConfig({...templateConfig, companyName: e.target.value})} className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold" />
//               </div>
//               <div>
//                 <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Company Address</label>
//                 <textarea rows="3" value={templateConfig.address} onChange={(e) => setTemplateConfig({...templateConfig, address: e.target.value})} className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"></textarea>
//               </div>
//               <div>
//                 <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Company Logo</label>
//                 <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
//               </div>
//               <div className="flex gap-2 pt-4 border-t border-gray-100 justify-end">
//                 <button onClick={() => setShowTemplateModal(false)} className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
//                   Cancel
//                 </button>
//                 <button onClick={handleTemplateSave} className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-200">
//                   Save Template
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
      
//       {/* OT Selection Modal */}
//       {showOTModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
//           <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col border border-gray-100">
//             <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
//               <h2 className="text-base font-bold text-gray-800">Select Employees for OT Payment</h2>
//               <button onClick={() => setShowOTModal(false)} className="text-gray-400 hover:text-gray-600 transition">
//                 <FaTimes size={18} />
//               </button>
//             </div>
//             <div className="flex-1 pr-1 overflow-y-auto custom-scrollbar">
//               <table className="w-full text-xs text-left">
//                 <thead className="bg-slate-50 text-gray-600 font-bold uppercase text-[9px] tracking-wider sticky top-0 z-10">
//                   <tr>
//                     <th className="p-3">Select</th>
//                     <th className="p-3">ID</th>
//                     <th className="p-3">Employee Name</th>
//                     <th className="p-3 text-right">OT Hours</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {records.length === 0 ? (
//                     <tr><td colSpan="4" className="p-4 text-center text-gray-400 font-semibold">No employees found.</td></tr>
//                   ) : (
//                     records.map(r => (
//                       <tr key={r.employeeId} className="hover:bg-slate-50/50">
//                         <td className="p-3">
//                           <input 
//                             type="checkbox" 
//                             checked={selectedOTEmployees.has(r.employeeId)}
//                             onChange={() => handleOTEmployeeSelection(r.employeeId)}
//                             className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                           />
//                         </td>
//                         <td className="p-3 text-gray-500 font-semibold">{r.employeeId}</td>
//                         <td className="p-3 font-semibold text-slate-800">{r.name}</td>
//                         <td className="p-3 font-bold text-right text-blue-600">
//                           {r.overTimeHoursFormatted || formatDecimalHours(r.overTimeHours)}
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//             <div className="flex justify-end pt-4 border-t border-gray-100 mt-4">
//               <button onClick={() => setShowOTModal(false)} className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-200">Done</button>
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
  FaUserTag,
  FaChevronUp,
  FaChevronDown
} from "react-icons/fa";
import { 
  FiFilter, 
  FiMapPin, 
  FiUserCheck, 
  FiUsers, 
  FiCoffee, 
  FiTrendingUp,
  FiChevronUp,
  FiChevronDown
} from "react-icons/fi";
import companyStamp from "../Images/company-stamp-1780465131172.png";
import { useNavigate } from "react-router-dom";
import StatCard from "../Components/StatCard";
import { API_BASE_URL } from "../config";
import logo from "../Images/Timely-Health-Logo.png";
import { isEmployeeHidden } from "../utils/employeeStatus";
import "../index.css";
import "./EmployeeDashboard.css";
import "./AttendanceSummary.css";

// ============================================
// 📅 HELPER: Calculate earned weekoffs
// ============================================
const formatDateLocal = (date) => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const calculateEarnedWeekOffs = (employeeId, year, monthNum, dailyAttendance, employeeLeavesData, weekOffDay, shiftHours = 8, holidayDaysInMonth = 0) => {
  const weekOffDayNum = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(weekOffDay);
  const firstDay = new Date(year, monthNum - 1, 1);
  const lastDay = new Date(year, monthNum, 0);
  
  const attendanceMap = new Map();
  dailyAttendance.forEach(record => {
    if (record.date || record.checkInTime) {
      const dateKey = formatDateLocal(record.date || record.checkInTime);
      let hours = 0;
      if (record.totalHours) {
        hours = parseFloat(record.totalHours);
      } else if (record.workingHours) {
        hours = parseFloat(record.workingHours);
      } else if (record.checkOutTime) {
        const cin = new Date(record.checkInTime);
        const cout = new Date(record.checkOutTime);
        hours = (cout - cin) / (1000 * 60 * 60);
      }
      const existing = attendanceMap.get(dateKey) || 0;
      attendanceMap.set(dateKey, existing + hours);
    }
  });

  const isLeaveDay = (date) => {
    if (!date || !employeeId) return false;
    const leaves = employeeLeavesData[employeeId];
    if (!leaves || !leaves.leaveDetails) return false;
    const dateStr = formatDateLocal(date);
    return leaves.leaveDetails.some(leave => {
      const startStr = formatDateLocal(leave.startDate);
      const endStr = formatDateLocal(leave.endDate);
      return dateStr >= startStr && dateStr <= endStr;
    });
  };

  const weeklyBreakdown = [];
  let currentWeekStart = new Date(firstDay);
  while (currentWeekStart.getDay() !== 1) {
    currentWeekStart.setDate(currentWeekStart.getDate() - 1);
  }

  let weekNumber = 1;
  let eligibleWeeks = 0;
  let totalWorkingDays = 0;
  let totalLeaves = 0;

  while (currentWeekStart <= lastDay) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    let presentDays = 0;
    let halfDays = 0;
    let leavesCount = 0;
    let weekOffDays = 0;
    let totalDays = 0;
    let actualWorkingDaysInWeek = 0;

    for (let d = new Date(currentWeekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
      if (d < firstDay || d > lastDay) continue;
      
      const dateKey = formatDateLocal(d);
      const dayOfWeek = d.getDay();
      const isWeekOff = (dayOfWeek === weekOffDayNum);
      
      totalDays++;

      if (isWeekOff) {
        weekOffDays++;
        continue;
      }
      
      actualWorkingDaysInWeek++;

      if (isLeaveDay(d)) {
        leavesCount++;
        totalLeaves++;
        continue;
      }

      const hoursWorked = attendanceMap.get(dateKey);
      if (hoursWorked !== undefined) {
        if (hoursWorked >= shiftHours * 0.8) {
          presentDays++;
          totalWorkingDays += 1;
        } else {
          halfDays += 0.5;
          totalWorkingDays += 0.5;
        }
      }
    }

    const effectiveWorkingDays = presentDays + halfDays + leavesCount;
    
    let isEligibleForWeekoff = false;
    if (totalDays === 7) {
      isEligibleForWeekoff = effectiveWorkingDays >= 5;
    } else {
      const employeeAttendedDays = presentDays + halfDays;
      isEligibleForWeekoff = (employeeAttendedDays >= actualWorkingDaysInWeek) && (actualWorkingDaysInWeek >= 3);
    }

    weeklyBreakdown.push({
      weekNumber: weekNumber,
      daysInMonth: totalDays,
      presentDays: presentDays,
      halfDays: halfDays,
      leaves: leavesCount,
      weekOffDays: weekOffDays,
      effectiveWorkingDays: Math.round(effectiveWorkingDays * 10) / 10,
      isEligibleForWeekoff: isEligibleForWeekoff
    });

    if (isEligibleForWeekoff) {
      eligibleWeeks++;
    }

    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    weekNumber++;
  }

  let totalWeekOffDays = 0;
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === weekOffDayNum) {
      totalWeekOffDays++;
    }
  }

  const totalActiveDays = totalWorkingDays + totalLeaves + holidayDaysInMonth;
  let earnedWeekOffs = Math.max(eligibleWeeks, Math.floor(totalActiveDays / 5));
  earnedWeekOffs = Math.min(earnedWeekOffs, totalWeekOffDays);

  return {
    weeklyBreakdown: weeklyBreakdown,
    earnedWeekOffs: earnedWeekOffs,
    totalWeekOffDays: totalWeekOffDays
  };
};

const PayRoll = () => {
  const [records, setRecords] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [employeeAttendanceDetails, setEmployeeAttendanceDetails] = useState([]);
  const [employeeLeaves, setEmployeeLeaves] = useState({});
  const [employeesMasterData, setEmployeesMasterData] = useState({});
  const navigate = useNavigate();

  const [showAttendancePopup, setShowAttendancePopup] = useState(false);
  const [selectedEmployeeAttendance, setSelectedEmployeeAttendance] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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

  // ─── 🔥 FIX: PERSISTED ITEMS PER PAGE ───
  const getSavedItemsPerPage = () => {
    try {
      const saved = localStorage.getItem('payroll_itemsPerPage');
      console.log('🔍 PayRoll - Loading from localStorage:', saved);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && [5, 10, 20, 50].includes(parsed)) {
          return parsed;
        }
      }
      return 10;
    } catch (e) {
      console.error('Error reading localStorage:', e);
      return 10;
    }
  };

  const [itemsPerPage, setItemsPerPage] = useState(getSavedItemsPerPage);

  // ─── FORCE RELOAD ON MOUNT ───
  useEffect(() => {
    const saved = getSavedItemsPerPage();
    console.log('🔄 PayRoll - Mount - Setting itemsPerPage to:', saved);
    setItemsPerPage(saved);
  }, []);

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateConfig, setTemplateConfig] = useState({
    companyName: "Timely Health Tech Pvt Ltd",
    address: "H. No: 1-98/9/25/p, # 301, 3rd Floor, Sri Sai Balaji Avenue,\nArunodaya Colony, Madhapur, Hyderabad, TG - 500081",
    logo: logo
  });

  const [approvedOTClaims, setApprovedOTClaims] = useState([]);
  const [approvedOTMap, setApprovedOTMap] = useState({});

  const medicalRoles = [
    "Phlebotomist", "Staff Nurse", "Consultant", "Pharmacist",
    "Nurse", "Doctor", "Lab Technician", "Medical Officer", 
    "Physician", "Surgeon", "Radiologist", "Pathologist",
    "Therapist", "Healthcare", "Medical", "Clinical"
  ];

  const isMedicalRole = (role) => {
    if (!role) return false;
    return medicalRoles.some(medRole => 
      role.toLowerCase().includes(medRole.toLowerCase())
    );
  };

  const formatDecimalHours = (decimalHours) => {
    if (!decimalHours && decimalHours !== 0) return "0h 0m";
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    if (minutes === 60) {
      return `${hours + 1}h 0m`;
    }
    return `${hours}h ${minutes}m`;
  };

  const getEmployeeShiftHours = (employeeId) => {
    const employeeData = employeesMasterData[employeeId] || {};
    return employeeData.shiftHours || 8;
  };

  const calculateOTForEmployee = (employeeId, hoursWorked) => {
    const h = Number(hoursWorked) || 0;
    const shiftHours = getEmployeeShiftHours(employeeId);
    
    if (h > shiftHours) {
      return Number((h - shiftHours).toFixed(2));
    }
    return 0;
  };

  const fetchApprovedOTClaims = useCallback(async (month) => {
    try {
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0);
      
      const response = await fetch(`${API_BASE_URL}/employees/allotclaimed?status=approved`);
      const data = await response.json();
      
      if (data.success) {
        const monthClaims = data.claims.filter(claim => {
          const claimDate = new Date(claim.date);
          return claimDate >= startDate && claimDate <= endDate;
        });
        
        setApprovedOTClaims(monthClaims);
        
        const otMap = {};
        monthClaims.forEach(claim => {
          const empId = claim.employeeId;
          if (!otMap[empId]) {
            otMap[empId] = {
              totalOTHours: 0,
              totalOTAmount: 0,
              count: 0,
              claims: []
            };
          }
          otMap[empId].totalOTHours += claim.otHours || 0;
          otMap[empId].totalOTAmount += claim.otAmount || 0;
          otMap[empId].count += 1;
          otMap[empId].claims.push(claim);
        });
        
        setApprovedOTMap(otMap);
      }
    } catch (error) {
      console.error("Error fetching approved OT claims:", error);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    if (selectedMonth) {
      fetchApprovedOTClaims(selectedMonth);
    }
  }, [selectedMonth, fetchApprovedOTClaims]);

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

  // ============================================
  // 📅 fetchEmployeeAttendance Function - FIXED to fetch fresh data
  // ============================================
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

  // ============================================
  // 📅 calculateWorkHours Function
  // ============================================
  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return null;
    const checkInTime = new Date(checkIn);
    const checkOutTime = new Date(checkOut);
    const diffHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
    return diffHours.toFixed(1);
  };

  // ============================================
  // 📅 handleRowClick Function - REFRESHES data on each open
  // ============================================
  const handleRowClick = async (employee) => {
    setSelectedEmployee(employee);
    const monthToFetch = selectedMonth || new Date().toISOString().slice(0, 7);
    await fetchEmployeeAttendance(employee.employeeId, monthToFetch);
    setShowAttendancePopup(true);
  };

  // ============================================
  // 🎯 MAIN fetchData FUNCTION
  // ============================================
  const fetchData = useCallback(async (month = "") => {
    let isMounted = true;

    try {
      setLoading(true);
      setError("");

      const includeWeekOffInSalary = shouldIncludeWeekOffInSalary(month);
      const isHistorical = isHistoricalMonth(month);
      const isCurrent = isCurrentMonth(month);
      const targetMonth = month || selectedMonth;

      console.log(`📅 Fetching data for month: ${targetMonth}`);

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
        
        const employeeRole = summary.role || emp.role || emp.designation || '';
        const isMedicalStaff = isMedicalRole(employeeRole);
        
        let attendanceForEmployee = allAttendanceRecords.filter(r => r.employeeId === emp.employeeId);
        
        const weekOffDay = emp.weekOffDay || 'Sunday';
        const weekOffData = calculateEarnedWeekOffs(
          emp.employeeId,
          year,
          monthNum,
          attendanceForEmployee,
          currentLeavesMap,
          weekOffDay,
          emp.shiftHours || 8,
          holidayCount
        );

        const earnedWeekOffs = weekOffData.earnedWeekOffs;
        const defaultWeekOffs = emp.weekOffPerMonth || 4;
        const finalWeekOffs = Math.min(earnedWeekOffs, defaultWeekOffs);

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
        const totalWorkingDays = summary.totalWorkingDays ?? 0;
        const fullDayNotWorking = summary.fullDayNotWorking ?? 0;
        const overTimeHours = summary.overTimeHours ?? 0;
        
        const compOffData = currentCompOffsMap[emp.employeeId] || { balance: 0 };
        
        let calculatedSalary = 0;
        if (salaryForMonth > 0 && daysInMonthValue > 0) {
          const effectivePaidDays = presentDaysCount + (halfDaysCount * 0.5) + (includeWeekOffInSalary ? finalWeekOffs : 0) + holidayCount + compOffData.balance;
          calculatedSalary = effectivePaidDays * dailyRate;
        }

        let totalOTHours = overTimeHours || 0;
        
        let calculatedOTHours = 0;
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
          const shiftHrs = emp.shiftHours || 8;
          if (hoursWorked > shiftHrs) {
            calculatedOTHours += (hoursWorked - shiftHrs);
          }
        });
        
        if (totalOTHours === 0 && calculatedOTHours > 0) {
          totalOTHours = calculatedOTHours;
        }
        
        totalOTHours = Number(totalOTHours.toFixed(2));
        const formattedOTHours = formatDecimalHours(totalOTHours);
        
        const approvedOTData = approvedOTMap[emp.employeeId] || { totalOTAmount: 0, totalOTHours: 0 };
        const approvedOTAmount = approvedOTData.totalOTAmount || 0;
        const approvedOTHours = approvedOTData.totalOTHours || 0;
        
        const baseCalculatedSalary = Math.round(calculatedSalary);
        
        let finalOTAmount = 0;
        let finalPay = baseCalculatedSalary;
        
        if (approvedOTAmount > 0) {
          finalOTAmount = approvedOTAmount;
          finalPay = Math.round(baseCalculatedSalary + approvedOTAmount);
        } else {
          const savedOTEmpsString = localStorage.getItem("payrollSelectedOTEmployees");
          const savedOTEmps = savedOTEmpsString ? new Set(JSON.parse(savedOTEmpsString)) : new Set();
          const isApprovedInOTPage = localStorage.getItem(`otStatus_${emp.employeeId}_${targetMonth}`) === "approved";
          
          if (totalOTHours > 0 && (savedOTEmps.has(emp.employeeId) || isApprovedInOTPage)) {
            const multiplier = Number(localStorage.getItem(`otMultiplier_${emp.employeeId}_${targetMonth}`)) || 2;
            const otRatePerHour = dailyRate / (emp.shiftHours || 8);
            const otAmount = totalOTHours * otRatePerHour * multiplier;
            finalOTAmount = otAmount;
            finalPay = Math.round(baseCalculatedSalary + otAmount);
          }
        }

        const salaryObj = {
          employeeId: emp.employeeId,
          name: emp.name,
          department: emp.department || 'N/A',
          month: targetMonth,
          
          presentDays: presentDaysCount,
          halfDayWorking: halfDaysCount,
          totalWorkingDays: totalWorkingDays,
          fullDayNotWorking: fullDayNotWorking,
          overTimeHours: totalOTHours,
          overTimeHoursFormatted: formattedOTHours,
          
          weekOffs: finalWeekOffs,
          earnedWeekOffs: earnedWeekOffs,
          defaultWeekOffs: defaultWeekOffs,
          weekOffDay: weekOffDay,
          weeklyBreakdown: weekOffData.weeklyBreakdown,
          
          salaryPerMonth: salaryForMonth,
          currentSalary: emp.salaryPerMonth,
          originalSalary: originalSalary,
          salaryPerDay: dailyRate,
          calculatedSalary: baseCalculatedSalary,
          baseCalculatedSalary: baseCalculatedSalary,
          
          shiftHours: emp.shiftHours || 8,
          finalOTAmount: Math.round(finalOTAmount),
          finalPay: finalPay,
          otAmount: Math.round(finalOTAmount),
          hasApprovedOT: approvedOTAmount > 0,
          approvedOTAmount: approvedOTAmount,
          approvedOTHours: approvedOTHours,
          
          holidayCount: holidayCount,
          monthDays: daysInMonthValue,
          includeWeekOffInSalary: includeWeekOffInSalary,
          isHistoricalMonth: isHistorical,
          isCurrentMonth: isCurrent,
          role: employeeRole,
          isMedicalStaff: isMedicalStaff,
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
          otherDeductions: emp.otherDeductions
        };

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
  }, [EMPLOYEES_API_URL, LEAVES_API_URL, API_BASE_URL, ATTENDANCE_SUMMARY_API_URL, ATTENDANCE_DETAILS_API_URL, processLeavesData, filterInactiveEmployees, filterEmployeesByJoiningDate, processCompOffData, selectedMonth, approvedOTMap]);

  useEffect(() => {
    if (records.length === 0) return;

    const processRecordsWithAdditions = (prevRecords) => 
      prevRecords.map(record => {
        let baseSalary = record.baseCalculatedSalary || record.calculatedSalary || 0;
        let otAmount = 0;
        
        if (record.hasApprovedOT) {
          otAmount = record.approvedOTAmount || 0;
        } else {
          const isApprovedInOTPage = localStorage.getItem(`otStatus_${record.employeeId}_${selectedMonth}`) === "approved";
          if (record.overTimeHours > 0 && (selectedOTEmployees.has(record.employeeId) || isApprovedInOTPage)) {
            const dailyRate = record.salaryPerDay || 0;
            const shiftHours = record.shiftHours || 8;
            const multiplier = Number(localStorage.getItem(`otMultiplier_${record.employeeId}_${selectedMonth}`)) || 2;
            const otRatePerHour = dailyRate / shiftHours;
            otAmount = record.overTimeHours * otRatePerHour * multiplier;
          }
        }
        
        return {
          ...record,
          calculatedSalary: Math.round(baseSalary),
          otAmount: Math.round(otAmount),
          finalOTAmount: Math.round(otAmount),
          finalPay: Math.round(baseSalary + otAmount)
        };
      });

    const updatedRecords = processRecordsWithAdditions(records);
    setRecords(updatedRecords);
    setFilteredRecords(updatedRecords);
  }, [employeeCompOffs, employeeLeaves, employeesMasterData, monthDays, selectedMonth, selectedOTEmployees, approvedOTMap]);

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

  // ─── 🔥 HANDLE ITEMS PER PAGE CHANGE WITH LOCALSTORAGE ───
  const handleItemsPerPageChange = (e) => {
    const newValue = Number(e.target.value);
    console.log('💾 PayRoll - Saving itemsPerPage:', newValue);
    
    try {
      localStorage.setItem('payroll_itemsPerPage', String(newValue));
      console.log('✅ PayRoll - Verified saved:', localStorage.getItem('payroll_itemsPerPage'));
    } catch (error) {
      console.error('❌ Save error:', error);
    }
    
    setItemsPerPage(newValue);
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
    const employeeFromList = allEmployees.find(emp => emp.employeeId === employee.employeeId);
    
    return {
      ...masterData,
      salaryPerMonth: employee.salaryPerMonth || masterData.salaryPerMonth || 0,
      masterSalaryPerMonth: masterData.salaryPerMonth || 0,
      shiftHours: masterData.shiftHours || 8,
      weekOffPerMonth: employee.weekOffs || masterData.weekOffPerMonth || 0,
      name: employee.name || masterData.name || '',
      designation: employee.designation || masterData.designation || '',
      department: employee.department || masterData.department || '',
      joiningDate: masterData.joiningDate || employee.joinDate || '',
      bankName: employeeFromList?.bankName || employeeFromList?.bankName || masterData.bankName || employee.bankName || '',
      bankAccount: masterData.bankAccount || employeeFromList?.bankAccount || employee.bankAccount || '',
      panNo: masterData.panCard || employeeFromList?.panNumber || employee.panCard || '',
      pfNo: masterData.pfNo || employeeFromList?.pfNumber || '',
      uanNo: masterData.uanNo || employeeFromList?.uanNumber || '',
      esicNo: masterData.esicNo || employeeFromList?.esicNumber || '',
      branch: masterData.branch || employeeFromList?.branch || '',
      employeeId: employee.employeeId,
      weekOffDay: masterData.weekOffDay || '',
      weekOffType: masterData.weekOffType || '0+4',
      status: employee.status || masterData.status || 'active',
      basicPay: employee.basicPay || masterData.basicPay || employeeFromList?.basicPay || 0,
      hra: employee.hra || masterData.hra || employeeFromList?.hra || 0,
      conveyanceAllowance: employee.conveyanceAllowance || masterData.conveyanceAllowance || employeeFromList?.conveyanceAllowance || 0,
      medicalAllowance: employee.medicalAllowance || masterData.medicalAllowance || employeeFromList?.medicalAllowance || 0,
      performanceAllowance: employee.performanceAllowance || masterData.performanceAllowance || employeeFromList?.performanceAllowance || 0,
      specialAllowance: employee.specialAllowance || masterData.specialAllowance || employeeFromList?.specialAllowance || 0,
      gmc: employee.gmcAmount || masterData.gmc || employeeFromList?.gmcAmount || 0,
      profTax: employee.ptax || masterData.profTax || employeeFromList?.ptax || 0,
      otherDeductions: employee.otherDeductions || masterData.otherDeductions || employeeFromList?.otherDeductions || 0
    };
  };

  const getWeekOffDaysForDisplay = (employee) => {
    if (employee.isSpecialMay2026) {
      return `${employee.originalWeekOffPerMonth} + 1 (Special)`;
    }
    return employee.weekOffs || 0;
  };

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

  let actualWeekOffDaysNumeric = employee.weekOffs || 0;
  let weekOffDisplayValue = actualWeekOffDaysNumeric;
  
  if (employee.isSpecialMay2026) {
    weekOffDisplayValue = `${employee.originalWeekOffPerMonth || 4} + 1 (Special)`;
  }
  
  const presentDays = employee.presentDays ?? 0;
  const halfDays = employee.halfDayWorking || 0;
  const holidays = employee.holidayCount || 0;

  let totalPaidDays = presentDays + (halfDays * 0.5) + actualWeekOffDaysNumeric + holidays;
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

  const earningsItems = [];
  
  const basicAmt = employeeData.basicPay || 0;
  if (basicAmt > 0) earningsItems.push({ label: 'Basic DA', amount: basicAmt });
  
  const hraAmt = employeeData.hra || 0;
  if (hraAmt > 0) earningsItems.push({ label: 'HRA', amount: hraAmt });
  
  const convAmt = employeeData.conveyanceAllowance || 0;
  if (convAmt > 0) earningsItems.push({ label: 'Conveyance', amount: convAmt });
  
  const specialAmt = employeeData.specialAllowance || 0;
  if (specialAmt > 0) earningsItems.push({ label: 'Special Allowance', amount: specialAmt });
  
  const extraPay = bonus + extraDaysPay;
  if (extraPay > 0) {
    earningsItems.push({ label: 'Bonus / Extra Work', amount: extraPay });
  }
  
  if (otAmount > 0) {
    earningsItems.push({ label: 'Overtime', amount: otAmount });
  }
  
  if (compOffPay > 0) {
    earningsItems.push({ label: 'Comp-off / Holiday Pay', amount: compOffPay });
  }
  
  if (holidays > 0) {
    earningsItems.push({ label: `Public Holidays (${holidays})`, amount: holidays * dailyRate, isInfo: true });
  }
  
  earningsItems.push({ label: `Working Days (Full: ${presentDays})`, amount: 0, isInfo: true });
  earningsItems.push({ label: `Week Off Days (${weekOffDisplayValue})`, amount: 0, isInfo: true });
  
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

  // 🔥 FIX: Yeh do lines change karo - bas itna kaam hai!
  const logoData = templateConfig.logo || logo || '';
  const stampData = companyStamp || '';

  const companyAddress = `Timely Healthtech Private Limited<br>Reg. Address: Flat No:301, H.No:1-68/22, Plot No. 54 & 55, Sri Sai Balaji Avenue, Arunodaya Colony, Madhapur, Hyderabad, Telangana-500081`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Payslip - ${employee.name}</title>
        <style>
          @page { 
            size: A4; 
            margin: 0;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: white; 
          }
          .invoice-container { 
            max-width: 210mm; 
            margin: 0 auto; 
            border: 1px solid #000; 
            border-radius: 4px;
            padding: 0;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
          }
          th, td { 
            padding: 6px 8px; 
            border: 1px solid #000; 
            font-size: 12px; 
            vertical-align: top; 
          }
          .header-cell { 
            border: none; 
            padding: 12px; 
            border-bottom: 1px solid #000; 
          }
          .section-header { 
            text-align: center; 
            padding: 8px; 
            font-weight: bold; 
            background: #f5f5f5; 
          }
          .total-row { 
            font-weight: bold; 
            background: #f9f9f9; 
          }
          .gross-row { 
            font-weight: bold; 
            background: #f0f0f0; 
          }
          .logo-image {
            height: 80px;
            width: auto;
            max-width: 200px;
            object-fit: contain;
            display: block;
          }
          .stamp-image {
            width: 90px;
            height: auto;
            opacity: 0.8;
            display: block;
          }
          .stamp-container {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 4px;
          }
          .company-address {
            font-size: 7px;
            color: #555;
            line-height: 1.4;
            margin-top: 2px;
          }
          @media print {
            body { padding: 10px; }
            .invoice-container { border: 1px solid #000; }
            /* 🔥 Yeh line add karo - images print mein dikhengi */
            .logo-image, .stamp-image { 
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <table>
            <tr>
              <td colspan="6" class="header-cell">
                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                  <div style="width: 200px; flex-shrink: 0;">
                    ${logoData ? `<img src="${logoData}" alt="Logo" class="logo-image" style="height: 80px; width: auto; max-width: 200px; object-fit: contain;">` : ''}
                  </div>
                  <div style="flex: 1; text-align: center; padding: 0 10px;">
                    <h2 style="margin: 0; font-size: 16px; font-weight: bold;">Timely Healthtech Private Limited</h2>
                    <p style="margin: 2px 0 0; font-size: 7px; line-height: 1.4; color: #555;">
                      Reg. Address: Flat No:301, H.No:1-68/22, Plot No. 54 & 55, Sri Sai Balaji Avenue, Arunodaya Colony, Madhapur, Hyderabad, Telangana-500081
                    </p>
                  </div>
                  <div style="width: 200px; flex-shrink: 0;"></div>
                </div>
              </td>
            </tr>
            <tr><td colspan="6" class="section-header">PAYSLIP FOR ${formatMonthDisplay(employee.month || selectedMonth).toUpperCase()}</td></tr>
            <tr>
              <td width="15%"><strong>Name:</strong></td>
              <td width="35%">${employee.name || '-'}</td>
              <td width="15%"><strong>Employee No:</strong></td>
              <td width="35%">${employee.employeeId || '-'}</td>
            </tr>
            <tr>
              <td><strong>Joining Date:</strong></td>
              <td>${employeeData.joiningDate ? new Date(employeeData.joiningDate).toLocaleDateString('en-GB') : '-'}</td>
              <td><strong>Bank Name:</strong></td>
              <td>${employeeData.bankName || '-'}</td>
            </tr>
            <tr>
              <td><strong>Designation:</strong></td>
              <td>${employeeData.designation || employee.designation || '-'}</td>
              <td><strong>Bank Account No:</strong></td>
              <td>${employeeData.bankAccount || '-'}</td>
            </tr>
            <tr>
              <td><strong>Department:</strong></td>
              <td>${employeeData.department || employee.department || '-'}</td>
              <td><strong>PAN Number:</strong></td>
              <td>${employeeData.panNo || '-'}</td>
            </tr>
            <tr>
              <td><strong>Location:</strong></td>
              <td>${employeeData.location || 'HYDERABAD'}</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td><strong>EMP EFFECTIVE</strong></td>
              <td>:30</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td><strong>LOP:</strong></td>
              <td>${lopDays > 0 ? lopDays : '0'}</td>
              <td></td>
              <td></td>
            </tr>
          </table>
          
          <table>
            <tr style="background:#f0f0f0;">
              <td style="width:30%;"><strong>Earnings</strong></td>
              <td style="width:20%; text-align:center;"><strong>Actual</strong></td>
              <td style="width:30%;"><strong>Deductions</strong></td>
              <td style="width:20%; text-align:center;"><strong>Actual</strong></td>
            </tr>
            ${tableRowsHTML}
            <tr class="gross-row">
              <td><strong>Total Earnings: INR.</strong></td>
              <td style="text-align: right;"><strong>₹${totalEarningsAmt.toFixed(2)}</strong></td>
              <td><strong>Total Deductions.</strong></td>
              <td style="text-align: right;"><strong>₹${totalDeductionsAmt.toFixed(2)}</strong></td>
            </tr>
            <tr class="total-row">
              <td colspan="2"></td>
              <td><strong>Net Pay for the month</strong></td>
              <td style="text-align: right;"><strong>₹${finalNetPay.toFixed(2)}</strong></td>
            </tr>
            <tr>
              <td colspan="4"><strong>(${numberToWords(finalNetPay)})</strong></td>
            </tr>
          </table>
          
          <div style="display: flex; justify-content: flex-end; align-items: center; padding: 10px 20px; border-top: 1px solid #000; margin-top: 5px;">
            <div class="stamp-container">
              ${stampData ? `<img src="${stampData}" alt="Company Stamp" class="stamp-image" style="width: 90px; height: auto; opacity: 0.8;">` : ''}
              <div style="text-align: right; line-height: 1.2;">
                <strong style="font-size: 7px; color: #333; display: block;">Authorized Signatory</strong>
                <span style="font-size: 6px; color: #555; display: block;">Timely Healthtech Private Limited</span>
              </div>
            </div>
          </div>
          
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

  // ============================================
  // 📅 AttendancePopupModal - FIXED to show updated data
  // ============================================
  const AttendancePopupModal = () => {
    if (!showAttendancePopup) return null;
    
    const getEmployeeShiftHours = (employeeId) => employeesMasterData[employeeId]?.shiftHours || 8;

    const getAllDatesOfMonth = (month) => {
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

    const monthDates = getAllDatesOfMonth(selectedMonth);

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

    const isWeekOffDay = (date) => {
      if (!date || !selectedEmployee) return false;
      return weekOffDatesSet.has(date.toLocaleDateString('en-CA'));
    };

    let weekOffCount = 0, leaveCount = 0, absentCount = 0, presentCount = 0;

    monthDates.forEach(date => {
      const dateKey = date.toLocaleDateString('en-CA');
      const record = attendanceMap.get(dateKey);
      const isWO = isWeekOffDay(date);
      const hasAttendance = !!record;
      const isLV = !isWO && isLeaveDay(date, selectedEmployee?.employeeId, employeeLeaves);
      
      if (isWO && !hasAttendance) weekOffCount++;
      else if (isLV) leaveCount++;
      else if (!record) absentCount++;
      else presentCount++;
    });

    const formatTime = (dateString) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const getRecordForDate = (dateKey) => {
      return attendanceMap.get(dateKey) || null;
    };

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
              <span className="text-green-600">Present: <strong>{presentCount}</strong></span>
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
                      <th className="px-2 py-1.5 text-center text-xs font-medium">Check-In</th>
                      <th className="px-2 py-1.5 text-center text-xs font-medium">Check-Out</th>
                      <th className="px-2 py-1.5 text-center text-xs font-medium">Reason</th>
                      <th className="px-2 py-1.5 text-center text-xs font-medium">Hours</th>
                      <th className="px-2 py-1.5 text-center text-xs font-medium">Status</th>
                      <th className="px-2 py-1.5 text-center text-xs font-medium">Admin Comment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {monthDates.map((date) => {
                      const dateKey = date.toLocaleDateString('en-CA');
                      const record = getRecordForDate(dateKey);
                      const hasAttendance = !!record;
                      
                      const workHours = record ? calculateWorkHours(record.checkInTime, record.checkOutTime) : null;
                      
                      const isWeekOff = isWeekOffDay(date);
                      const isLeave = !isWeekOff && isLeaveDay(date, selectedEmployee?.employeeId, employeeLeaves);
                      
                      const effectiveWeekOff = isWeekOff && !hasAttendance;
                      
                      let bgColor = '';
                      let dayType = '';
                      let statusText = '';
                      
                      if (effectiveWeekOff) {
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
                      
                      return (
                        <tr key={dateKey} className={`${bgColor} hover:bg-gray-50 transition-colors`}>
                          <td className="px-2 py-1 text-xs text-center">{date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                          <td className="px-2 py-1 text-xs text-center">{!effectiveWeekOff && !isLeave && hasAttendance ? formatTime(record?.checkInTime) : '-'}</td>
                          <td className="px-2 py-1 text-xs text-center">{!effectiveWeekOff && !isLeave && hasAttendance ? formatTime(record?.checkOutTime) : '-'}</td>
                          <td className="px-2 py-1 text-xs text-center">{record?.reason || '-'}</td>
                          <td className="px-2 py-1 text-xs text-center">{!effectiveWeekOff && !isLeave && hasAttendance && workHours ? `${workHours}h` : '-'}</td>
                          <td className="px-2 py-1 text-center">
                            <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${effectiveWeekOff ? 'bg-orange-100 text-orange-700' : isLeave ? 'bg-red-100 text-red-700' : !hasAttendance ? 'bg-gray-100 text-gray-500' : dayType === 'Full Day' ? 'bg-green-100 text-green-700' : dayType === 'Half Day' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{dayType}</span>
                          </td>
                          <td className="px-2 py-1 text-xs text-center">{record?.comment || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center p-3 bg-white border-t rounded-b-lg">
            <button 
              onClick={async () => {
                if (selectedEmployee) {
                  await fetchEmployeeAttendance(selectedEmployee.employeeId, selectedMonth);
                }
              }}
              className="px-3 py-1.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button onClick={() => setShowAttendancePopup(false)} className="px-4 py-1.5 text-sm text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700">
              Close
            </button>
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
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="emp-dash__header">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Employee <span>Payroll</span>
            </h1>
          </div>
          <div className="emp-dash__date-pill">
            <FaCalendarAlt />
            <span>{formatMonthDisplay(selectedMonth)}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Active Employees</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiUsers />
              </div>
            </div>
            <div className="emp-dash__stat-value">{filteredRecords.length}</div>
            <div className="emp-dash__stat-meta">registered & active</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Net Pay</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiTrendingUp />
              </div>
            </div>
            <div className="emp-dash__stat-value">
              ₹{filteredRecords.reduce((sum, emp) => sum + (emp.finalPay || emp.calculatedSalary || 0), 0).toLocaleString()}
            </div>
            <div className="emp-dash__stat-meta">calculated payout</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Active This Month</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiUserCheck />
              </div>
            </div>
            <div className="emp-dash__stat-value">
              {filteredRecords.filter(emp => !emp.isHistoricalMonth).length}
            </div>
            <div className="emp-dash__stat-meta">current cycle active</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Earned Weekoffs</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                <FaCalendarAlt />
              </div>
            </div>
            <div className="emp-dash__stat-value">
              {filteredRecords.reduce((sum, emp) => sum + (emp.earnedWeekOffs || 0), 0).toFixed(1)}
            </div>
            <div className="emp-dash__stat-meta">total earned this month</div>
          </div>
        </div>

        {/* Filters Card - Desktop View */}
        <div className="emp-dash__card mb-6">
          <div className="hidden sm:block">
            <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="relative min-w-[120px] flex-1 max-w-[160px]">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search ID or Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="relative" ref={departmentFilterRef}>
                  <button
                    onClick={() => {
                      setShowDepartmentFilter(!showDepartmentFilter);
                      setShowDesignationFilter(false);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white whitespace-nowrap ${
                      filterDepartment
                        ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <FaBuilding className="text-gray-400 text-[10px]" />
                    <span className="truncate max-w-[80px]">{filterDepartment || "Dept"}</span>
                    <span className="text-gray-400 text-[10px]">▾</span>
                  </button>
                  {showDepartmentFilter && (
                    <div 
                      className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl min-w-[200px] max-h-60 overflow-y-auto"
                      style={{
                        zIndex: 99999,
                        top: departmentFilterRef.current ? departmentFilterRef.current.getBoundingClientRect().bottom + 4 : 'auto',
                        left: departmentFilterRef.current ? departmentFilterRef.current.getBoundingClientRect().left : 'auto',
                      }}
                    >
                      <div
                        onClick={() => {
                          setFilterDepartment("");
                          setShowDepartmentFilter(false);
                        }}
                        className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                      >
                        All Departments
                      </div>
                      {uniqueDepartments.map((dept) => (
                        <div
                          key={dept}
                          onClick={() => {
                            setFilterDepartment(dept);
                            setShowDepartmentFilter(false);
                          }}
                          className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 ${
                            filterDepartment === dept ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
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
                    onClick={() => {
                      setShowDesignationFilter(!showDesignationFilter);
                      setShowDepartmentFilter(false);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white whitespace-nowrap ${
                      filterDesignation
                        ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <FaUserTag className="text-gray-400 text-[10px]" />
                    <span className="truncate max-w-[80px]">{filterDesignation || "Desig"}</span>
                    <span className="text-gray-400 text-[10px]">▾</span>
                  </button>
                  {showDesignationFilter && (
                    <div 
                      className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl min-w-[200px] max-h-60 overflow-y-auto"
                      style={{
                        zIndex: 99999,
                        top: designationFilterRef.current ? designationFilterRef.current.getBoundingClientRect().bottom + 4 : 'auto',
                        left: designationFilterRef.current ? designationFilterRef.current.getBoundingClientRect().left : 'auto',
                      }}
                    >
                      <div
                        onClick={() => {
                          setFilterDesignation("");
                          setShowDesignationFilter(false);
                        }}
                        className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                      >
                        All Designations
                      </div>
                      {uniqueDesignations.map((des) => (
                        <div
                          key={des}
                          onClick={() => {
                            setFilterDesignation(des);
                            setShowDesignationFilter(false);
                          }}
                          className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 ${
                            filterDesignation === des ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
                          }`}
                        >
                          {des}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    placeholder="From"
                    className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="relative">
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    placeholder="To"
                    className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="relative">
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={handleDateRangeFilter}
                  disabled={!fromDate || !toDate}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap disabled:opacity-50"
                >
                  <FaSearch className="w-3 h-3" />
                  Apply
                </button>

                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-all shadow-sm whitespace-nowrap"
                >
                  ⚙️
                </button>

                <button
                  onClick={() => {
                    const currentMonth = new Date().toISOString().slice(0, 7);
                    setSelectedMonth(currentMonth);
                    fetchData(currentMonth);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-all shadow-sm whitespace-nowrap"
                >
                  Current
                </button>

                <button
                  onClick={() => fetchData(selectedMonth)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-all shadow-sm whitespace-nowrap"
                >
                  ⟳
                </button>

                <button
                  onClick={() => navigate("/bank-reports")}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap"
                >
                  Bank Reports
                </button>

                <button
                  onClick={() => setShowOTModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all shadow-sm whitespace-nowrap"
                >
                  OT ({selectedOTEmployees.size})
                </button>

                {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate || selectedMonth !== new Date().toISOString().slice(0, 7)) && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
                  >
                    ✕ Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile View */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700"
              >
                <FiFilter className="text-blue-600 text-base" />
                <span>Filters</span>
                {showMobileFilters ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
              </button>
              <span className="text-xs text-gray-500">
                <strong>{filteredRecords.length}</strong> employees
              </span>
            </div>

            {showMobileFilters && (
              <div className="mt-2 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Search Employee</label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      placeholder="Search ID or Name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>

                <div className="relative" ref={departmentFilterRef}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
                  <button
                    onClick={() => {
                      setShowDepartmentFilter(!showDepartmentFilter);
                      setShowDesignationFilter(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg border transition-all bg-white ${
                      filterDepartment ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50" : "border-gray-300 text-gray-700"
                    }`}
                  >
                    <span className="flex items-center gap-2"><FaBuilding className="text-gray-400" />{filterDepartment || "All Departments"}</span>
                    <span className="text-gray-400">▾</span>
                  </button>
                  {showDepartmentFilter && (
                    <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div onClick={() => { setFilterDepartment(""); setShowDepartmentFilter(false); }} className="px-3 py-2.5 text-sm font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50">All Departments</div>
                      {uniqueDepartments.map((dept) => (
                        <div key={dept} onClick={() => { setFilterDepartment(dept); setShowDepartmentFilter(false); }} className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-blue-50 ${filterDepartment === dept ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}>{dept}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative" ref={designationFilterRef}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Designation</label>
                  <button
                    onClick={() => {
                      setShowDesignationFilter(!showDesignationFilter);
                      setShowDepartmentFilter(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg border transition-all bg-white ${
                      filterDesignation ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50" : "border-gray-300 text-gray-700"
                    }`}
                  >
                    <span className="flex items-center gap-2"><FaUserTag className="text-gray-400" />{filterDesignation || "All Designations"}</span>
                    <span className="text-gray-400">▾</span>
                  </button>
                  {showDesignationFilter && (
                    <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div onClick={() => { setFilterDesignation(""); setShowDesignationFilter(false); }} className="px-3 py-2.5 text-sm font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50">All Designations</div>
                      {uniqueDesignations.map((des) => (
                        <div key={des} onClick={() => { setFilterDesignation(des); setShowDesignationFilter(false); }} className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-blue-50 ${filterDesignation === des ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}>{des}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                  <input type="month" value={selectedMonth} onChange={handleMonthChange} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-semibold" />
                </div>

                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={handleDateRangeFilter} disabled={!fromDate || !toDate} className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50">
                      <FaSearch className="w-4 h-4" /> Apply
                    </button>
                    <button onClick={() => setShowTemplateModal(true)} className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-all shadow-sm">
                      ⚙️ Template
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => { const currentMonth = new Date().toISOString().slice(0, 7); setSelectedMonth(currentMonth); fetchData(currentMonth); }} className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-all shadow-sm">
                      Current
                    </button>
                    <button onClick={() => fetchData(selectedMonth)} className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-all shadow-sm">
                      ⟳ Refresh
                    </button>
                    <button onClick={() => setShowOTModal(true)} className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all shadow-sm">
                      OT ({selectedOTEmployees.size})
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => navigate("/bank-reports")} className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm">
                      Bank Reports
                    </button>
                    {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate || selectedMonth !== new Date().toISOString().slice(0, 7)) && (
                      <button onClick={clearFilters} className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
                        ✕ Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
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

        {selectedMonth === "2026-05" && (
          <div className="px-3 py-2 mb-3 border-l-4 border-blue-500 rounded-md shadow-sm bg-blue-50">
            <p className="text-xs font-medium text-blue-700">
              🎉 May 2026 Special: Non-medical employees with 4 week-offs will get +1 extra week off (total 5 week offs)!
            </p>
          </div>
        )}

        {/* Table Card */}
        <div className="emp-dash__card mb-6">
          <div className="overflow-x-auto">
            <table className="emp-dash__table">
              <thead>
                <tr>
                  <th>Emp ID</th>
                  <th>Name</th>
                  <th style={{ textAlign: "center" }}>Role</th>
                  <th style={{ textAlign: "center" }}>Dept</th>
                  <th style={{ textAlign: "center" }}>Working</th>
                  <th style={{ textAlign: "center" }}>Present</th>
                  <th style={{ textAlign: "center" }}>Half</th>
                  <th style={{ textAlign: "center" }}>
                    <span className="flex items-center justify-center gap-1">
                      Earned WO
                      <span className="text-[8px] text-gray-400 cursor-help" title="Weekoffs earned based on weekly attendance (5+ days/week)">
                        ⓘ
                      </span>
                    </span>
                  </th>
                  <th style={{ textAlign: "center" }}>
                    <span className="flex items-center justify-center gap-1">
                      Default WO
                      <span className="text-[8px] text-gray-400 cursor-help" title="Configured weekoffs per month">
                        ⓘ
                      </span>
                    </span>
                  </th>
                  <th style={{ textAlign: "center" }}>Monthly Salary</th>
                  <th style={{ textAlign: "center" }}>OT Amount</th>
                  <th style={{ textAlign: "center" }}>Calculated</th>
                  <th style={{ textAlign: "center" }}>Final Pay</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((item, index) => (
                  <tr
                    key={item.employeeId}
                    onClick={() => handleRowClick(item)}
                    className="transition-colors hover:bg-slate-50/50 cursor-pointer"
                  >
                    <td className="font-semibold text-slate-800 text-[11px]">
                      {item.employeeId}
                    </td>
                    <td>
                      <div className="flex items-center justify-start gap-2">
                        <div className="flex items-center justify-center w-7 h-7 text-[10px] font-bold bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-full shadow-inner">
                          {item.name ? item.name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <span className="font-semibold text-slate-800 text-xs whitespace-nowrap">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="text-center text-slate-600 text-[11px] font-medium whitespace-nowrap">
                      {item.designation || item.role || '-'}
                    </td>
                    <td className="text-center text-slate-600 text-[11px] font-medium whitespace-nowrap">
                      {item.department}
                    </td>
                    <td className="text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {item.totalWorkingDays || 0}
                      </span>
                    </td>
                    <td className="text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {item.presentDays || 0}
                      </span>
                    </td>
                    <td className="text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                        {item.halfDayWorking || 0}
                      </span>
                    </td>
                    <td className="text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                        {item.earnedWeekOffs || 0}
                      </span>
                    </td>
                    <td className="text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-200">
                        {item.defaultWeekOffs || 0}
                      </span>
                    </td>
                    <td className="text-center whitespace-nowrap">
                      <div className="font-semibold text-slate-700">₹{(item.salaryPerMonth || 0).toLocaleString()}</div>
                      {item.currentSalary && item.currentSalary !== item.salaryPerMonth && (
                        <div className="text-[9px] text-gray-400 line-through">₹{item.currentSalary.toLocaleString()}</div>
                      )}
                      {item.historicalEffectiveFrom && item.historicalEffectiveFrom !== item.joinDate && (
                        <div className="text-[8px] text-blue-600 font-medium">w.e.f {new Date(item.historicalEffectiveFrom).toLocaleDateString()}</div>
                      )}
                    </td>
                    <td className="text-center whitespace-nowrap">
                      {item.finalOTAmount > 0 ? (
                        <span className="font-bold text-green-600">₹{item.finalOTAmount.toFixed(0)}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="text-center whitespace-nowrap">
                      <span className="font-bold text-blue-700">₹{calculateSalary(item).toLocaleString()}</span>
                    </td>
                    <td className="text-center whitespace-nowrap">
                      <span className="font-extrabold text-green-700">₹{(item.finalPay || item.calculatedSalary || 0).toLocaleString()}</span>
                    </td>
                    <td className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleView(item); }}
                          className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg transition-all shadow-sm"
                          title="View Details"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                          className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-lg transition-all shadow-sm"
                          title="Edit Adjustment"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); downloadInvoice(item); }}
                          disabled={!isPayslipDownloadAllowed(item.month || selectedMonth)}
                          className={`p-1.5 border rounded-lg transition-all shadow-sm ${
                            isPayslipDownloadAllowed(item.month || selectedMonth)
                              ? 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-100'
                              : 'text-gray-300 bg-gray-50 border-gray-100 cursor-not-allowed'
                          }`}
                          title="Download Payslip"
                        >
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

          {/* ─── 🔥 FIXED PAGINATION SECTION ─── */}
          {filteredRecords.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200/50 bg-gray-50/30">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="p-1 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>entries</span>
                </div>
                <div className="text-xs text-gray-500">
                  Showing <strong>{indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, filteredRecords.length)}</strong> of{" "}
                  <strong>{filteredRecords.length}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-all ${
                    currentPage === 1
                      ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
                      : "text-gray-700 bg-white hover:bg-gray-55 border-gray-300 shadow-sm"
                  }`}
                >
                  Previous
                </button>

                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
                    disabled={page === "..."}
                    className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-all ${
                      page === "..."
                        ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
                        : currentPage === page
                        ? "text-white bg-blue-600 border-blue-600"
                        : "text-gray-700 bg-white hover:bg-gray-55 border-gray-300 shadow-sm"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-all ${
                    currentPage === totalPages
                      ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
                      : "text-gray-700 bg-white hover:bg-gray-55 border-gray-300 shadow-sm"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* View Modal */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto border border-gray-100">
            <div className="sticky top-0 z-10 flex items-center justify-between mb-4 bg-white pb-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Employee Payroll Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <FaTimes size={18} />
              </button>
            </div>
            
            <div className="flex items-center space-x-4 mb-6 bg-slate-50 p-4 rounded-xl">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white text-lg font-bold rounded-full shadow-md shrink-0">
                {selectedEmployee.name?.charAt(0) || 'E'}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-800">{selectedEmployee.name}</h3>
                <div className="grid grid-cols-2 text-xs text-gray-500 gap-x-4 mt-0.5">
                  <p><span className="font-semibold text-gray-700">ID:</span> {selectedEmployee.employeeId}</p>
                  <p><span className="font-semibold text-gray-700">Role:</span> {selectedEmployee.designation || selectedEmployee.role || 'N/A'}</p>
                  <p><span className="font-semibold text-gray-700">Department:</span> {selectedEmployee.department || 'N/A'}</p>
                  <p><span className="font-semibold text-gray-700">Month:</span> {selectedEmployee.month || selectedMonth}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 text-xs sm:grid-cols-2 gap-x-8 gap-y-2 mb-6">
              <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">Present Days</span><span className="font-bold text-emerald-700">{selectedEmployee.presentDays || 0}</span></div>
              <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">Working Days</span><span className="font-bold text-blue-700">{selectedEmployee.totalWorkingDays || 0}</span></div>
              <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">Half Days</span><span className="font-bold text-amber-700">{selectedEmployee.halfDayWorking || 0}</span></div>
              <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">Earned Weekoffs</span><span className="font-bold text-green-700">{selectedEmployee.earnedWeekOffs || 0}</span></div>
              <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">Default Weekoffs</span><span className="font-bold text-gray-600">{selectedEmployee.defaultWeekOffs || 0}</span></div>
              <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">WeekOff Days</span><span className="font-bold text-purple-700">{getWeekOffDaysForDisplay(selectedEmployee)}</span></div>
              <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">Month Days</span><span className="font-bold text-slate-700">{selectedEmployee.monthDays || monthDays}</span></div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Monthly Salary</span>
                <div className="text-right">
                  <span className="font-bold text-slate-800">₹{selectedEmployee.salaryPerMonth || 0}</span>
                  {selectedEmployee.currentSalary && selectedEmployee.currentSalary !== selectedEmployee.salaryPerMonth && (
                    <div className="text-[9px] text-gray-400 line-through">₹{selectedEmployee.currentSalary.toLocaleString()}</div>
                  )}
                </div>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">Daily Rate</span><span className="font-bold text-slate-700">₹{calculateDailyRate(selectedEmployee)}/day</span></div>
              <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">OT Amount</span><span className="font-bold text-emerald-600">₹{(selectedEmployee.finalOTAmount || 0).toFixed(0)}</span></div>
              <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium text-blue-600">Calculated Base Salary</span><span className="font-bold text-blue-600">₹{Math.round(selectedEmployee.calculatedSalary || 0)}</span></div>
              <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-700 font-bold">Final Pay</span><span className="font-bold text-emerald-700">₹{Math.round(selectedEmployee.finalPay || selectedEmployee.calculatedSalary || 0)}</span></div>
              
              <div className="flex flex-col py-1.5 border-b border-gray-100 sm:col-span-2">
                <div className="flex justify-between"><span className="text-gray-500 font-medium">Approved Leaves</span><span className="font-bold text-rose-600">{getLeaveTypes(selectedEmployee) || "0"}</span></div>
              </div>
            </div>

            {/* Weekly Breakdown in View Modal */}
            {selectedEmployee.weeklyBreakdown && selectedEmployee.weeklyBreakdown.length > 0 && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <h4 className="text-xs font-bold text-gray-600 mb-2">📊 Weekly Attendance Breakdown</h4>
                <div className="grid grid-cols-1 gap-1.5 max-h-[150px] overflow-y-auto">
                  {selectedEmployee.weeklyBreakdown.map((week, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[10px] bg-white p-1.5 rounded border border-gray-100">
                      <span className="font-medium text-gray-500">Week {week.weekNumber}{!week.isCompleteWeek && ' (Partial)'}</span>
                      <span className="text-gray-600">P:{week.presentDays || 0} H:{week.halfDays || 0} L:{week.leaves || 0}</span>
                      <span className="text-gray-600">Total: {week.effectiveWorkingDays || 0} days</span>
                      <span className={`font-bold ${week.isEligibleForWeekoff ? 'text-green-600' : 'text-red-500'}`}>
                        {week.isEligibleForWeekoff ? '✅ Weekoff Earned' : '❌ No Weekoff'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-[9px] text-gray-400 font-medium">
                  * Weekoff earned when employee works 5+ days in a week
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => downloadInvoice(selectedEmployee)}
                disabled={!isPayslipDownloadAllowed(selectedEmployee.month || selectedMonth)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition duration-200 ${
                  isPayslipDownloadAllowed(selectedEmployee.month || selectedMonth)
                    ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Download Payslip
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-700 rounded-lg hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto border border-gray-100">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">Edit Salary - {selectedEmployee.name}</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <FaTimes size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Present Days</label>
                  <input type="number" name="presentDays" value={editFormData.presentDays || 0} onChange={handleInputChange} className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Working Days</label>
                  <input type="number" name="workingDays" value={editFormData.workingDays || 0} onChange={handleInputChange} className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Half Days</label>
                  <input type="number" name="halfDayWorking" value={editFormData.halfDayWorking || 0} onChange={handleInputChange} className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Bonus (₹)</label>
                  <input type="number" name="bonus" value={extraWorkData.bonus || 0} onChange={handleExtraWorkChange} className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Deductions (₹)</label>
                <input type="number" name="deductions" value={extraWorkData.deductions || 0} onChange={handleExtraWorkChange} className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Adjustment Reason</label>
                <input type="text" name="reason" value={extraWorkData.reason || ""} onChange={handleExtraWorkChange} placeholder="e.g. Performance bonus or Loss of Pay" className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold" />
              </div>
              
              <div className="flex gap-2 pt-4 border-t border-gray-100 justify-end">
                <button type="button" onClick={handleReset} className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition shadow-sm">
                  Reset System
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-200">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">Edit Payslip Template</h2>
              <button onClick={() => setShowTemplateModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <FaTimes size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Company Name</label>
                <input type="text" value={templateConfig.companyName} onChange={(e) => setTemplateConfig({...templateConfig, companyName: e.target.value})} className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Company Address</label>
                <textarea rows="3" value={templateConfig.address} onChange={(e) => setTemplateConfig({...templateConfig, address: e.target.value})} className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"></textarea>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Company Logo</label>
                <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
              <div className="flex gap-2 pt-4 border-t border-gray-100 justify-end">
                <button onClick={() => setShowTemplateModal(false)} className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
                  Cancel
                </button>
                <button onClick={handleTemplateSave} className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-200">
                  Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* OT Selection Modal */}
      {showOTModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col border border-gray-100">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">Select Employees for OT Payment</h2>
              <button onClick={() => setShowOTModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <FaTimes size={18} />
              </button>
            </div>
            <div className="flex-1 pr-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-gray-600 font-bold uppercase text-[9px] tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="p-3">Select</th>
                    <th className="p-3">ID</th>
                    <th className="p-3">Employee Name</th>
                    <th className="p-3 text-right">OT Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.length === 0 ? (
                    <tr><td colSpan="4" className="p-4 text-center text-gray-400 font-semibold">No employees found.</td></tr>
                  ) : (
                    records.map(r => (
                      <tr key={r.employeeId} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <input 
                            type="checkbox" 
                            checked={selectedOTEmployees.has(r.employeeId)}
                            onChange={() => handleOTEmployeeSelection(r.employeeId)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="p-3 text-gray-500 font-semibold">{r.employeeId}</td>
                        <td className="p-3 font-semibold text-slate-800">{r.name}</td>
                        <td className="p-3 font-bold text-right text-blue-600">
                          {r.overTimeHoursFormatted || formatDecimalHours(r.overTimeHours)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-100 mt-4">
              <button onClick={() => setShowOTModal(false)} className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-200">Done</button>
            </div>
          </div>
        </div>
      )}

      <AttendancePopupModal />
    </div>
  );
};

export default PayRoll;