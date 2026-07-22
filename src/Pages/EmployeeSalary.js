



import axios from "axios";
import { Download, Eye, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import CountUp from "react-countup";
import { FaCalendarAlt } from "react-icons/fa";
import { FiDollarSign, FiDownloadCloud, FiFileText, FiPieChart } from "react-icons/fi";
import logo from "../Images/Timely-Health-Logo.png";
import companyStamp from "../Images/company-stamp-1780465131172.png";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

export default function EmployeeSalary() {
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
  
  const [employeeCompOffs, setEmployeeCompOffs] = useState({});
  const [compOffDetails, setCompOffDetails] = useState({});
  
  const [attendanceData, setAttendanceData] = useState({});
  
  const [monthInfo, setMonthInfo] = useState({
    isHistorical: false,
    isCurrent: false,
    includeWeekOff: false,
    canDownload: false
  });

  const [templateConfig, setTemplateConfig] = useState({
    companyName: "Timely Health Tech Pvt Ltd",
    address: "H. No: 1-98/9/25/p, # 301, 3rd Floor, Sri Sai Balaji Avenue,\nArunodaya Colony, Madhapur, Hyderabad, TG - 500081",
    logo: logo
  });

  const recordsPerPage = 10;
  const BASE_URL = "https://api.timelyhealth.in";

  useEffect(() => {
    const savedTemplate = localStorage.getItem("payrollTemplateConfig");
    if (savedTemplate) {
      setTemplateConfig(JSON.parse(savedTemplate));
    }
  }, []);

  const getCurrentEmployee = () => {
    const employeeData = JSON.parse(localStorage.getItem("employeeData"));
    return employeeData || {};
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

  const isCurrentMonth = (month) => {
    if (!month) return true;
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const [year, monthNum] = month.split('-').map(Number);
    return year === currentYear && monthNum === currentMonth;
  };

  const shouldIncludeWeekOffInSalary = (month) => {
    if (isHistoricalMonth(month)) return true;
    if (isCurrentMonth(month)) {
      const today = new Date();
      const currentDay = today.getDate();
      return currentDay >= 26;
    }
    return true;
  };

  const isPayslipDownloadAllowed = (month) => {
    if (isHistoricalMonth(month)) return true;
    if (isCurrentMonth(month)) {
      const today = new Date();
      const currentDay = today.getDate();
      const daysInMonth = getDaysInMonth(month);
      return currentDay >= daysInMonth;
    }
    return true;
  };

  const getDaysInMonth = (monthStr) => {
    if (!monthStr) return new Date().getDate();
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  const getEmployeeWeekOffCount = (employeeId) => {
    const masterData = employeesMasterData[employeeId];
    return masterData?.weekOffPerMonth || 4;
  };

  const calculateActualWeekOffDays = (employeeId, year, monthNum, attendanceMap, leavesData, targetWeekOffCount, monthStr) => {
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);
    const dates = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    
    if (targetWeekOffCount === 4) {
      let sundayCount = 0;
      dates.forEach(date => {
        if (date.toLocaleDateString('en-US', { weekday: 'long' }) === 'Sunday') {
          sundayCount++;
        }
      });
      return sundayCount;
    }
    
    const absentDays = [];
    
    dates.forEach(date => {
      const dateKey = date.toLocaleDateString('en-CA');
      const hasAttendance = attendanceMap.has(dateKey);
      const isLeave = isLeaveDayForDate(date, employeeId, leavesData, monthStr);
      const isSunday = date.toLocaleDateString('en-US', { weekday: 'long' }) === 'Sunday';
      
      if (!hasAttendance && !isLeave && !isSunday) {
        absentDays.push(date);
      }
    });
    
    return Math.min(targetWeekOffCount, absentDays.length);
  };
  
  const isLeaveDayForDate = (date, employeeId, leavesData, monthStr) => {
    if (!date || !employeeId) return false;
    const leaves = leavesData[employeeId];
    if (!leaves || !leaves.leaveDetails) return false;
    const dateStr = date.toLocaleDateString('en-CA');
    
    const [year, monthNum] = monthStr.split('-').map(Number);
    
    return leaves.leaveDetails.some(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      const checkDate = new Date(dateStr);
      
      if (checkDate >= startDate && checkDate <= endDate) {
        const leaveYear = startDate.getFullYear();
        const leaveMonth = startDate.getMonth() + 1;
        return leaveYear === year && leaveMonth === monthNum;
      }
      return false;
    });
  };

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
    return leavesMap;
  }, []);

  const processCompOffData = useCallback(async (selectedMonthStr, leavesData) => {
    try {
      const currentEmployee = getCurrentEmployee();
      const currentEmployeeId = currentEmployee?.employeeId;
      
      if (!currentEmployeeId) {
        console.log("No current employee found");
        return {};
      }

      const [year, monthNum] = (selectedMonthStr || new Date().toISOString().slice(0, 7)).split('-').map(Number);
      const startOfMonth = new Date(year, monthNum - 1, 1);
      const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);

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

      const leaves = leavesData?.[currentEmployeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
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
      return compOffMap;
      
    } catch (error) {
      console.error("Error fetching comp-offs:", error);
      return {};
    }
  }, []);

  const fetchEmployeeAttendance = async (employeeId, monthStr) => {
    try {
      const url = `${BASE_URL}/api/attendance/allattendance?employeeId=${employeeId}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.records && data.records.length > 0) {
        const [year, monthNum] = monthStr.split('-').map(Number);
        const filteredByMonth = data.records.filter(record => {
          const recordDate = new Date(record.checkInTime);
          return recordDate.getFullYear() === year && recordDate.getMonth() + 1 === monthNum;
        });
        
        const attendanceMap = new Map();
        filteredByMonth.forEach(record => {
          if (record.checkInTime) {
            const dateKey = new Date(record.checkInTime).toLocaleDateString('en-CA');
            attendanceMap.set(dateKey, record);
          }
        });
        return attendanceMap;
      }
      return new Map();
    } catch (error) {
      console.error("Error fetching attendance:", error);
      return new Map();
    }
  };

  const getEmployeeData = (employee) => {
    const masterData = employeesMasterData[employee.employeeId] || {};
    return {
      ...masterData,
      salaryPerMonth: employee.salaryPerMonth || masterData.salaryPerMonth || 0,
      shiftHours: 8,
      weekOffPerMonth: employee.weekOffs || masterData.weekOffPerMonth || 0,
      name: employee.name || masterData.name || '',
      designation: employee.designation || masterData.designation || '',
      department: employee.department || masterData.department || '',
      joiningDate: masterData.joiningDate || '',
      bankAccount: masterData.bankAccount || '',
      bankName: masterData.bankName || '',
      panNo: masterData.panCard || '',
      pfNo: masterData.pfNo || '',
      uanNo: masterData.uanNo || '',
      esicNo: masterData.esicNo || '',
      branch: masterData.branch || '',
      employeeId: employee.employeeId
    };
  };

  const calculateDailyRate = (employee) => {
    const empData = getEmployeeData(employee);
    if (!empData || !empData.salaryPerMonth) return 0;
    const daysInMonth = employee.monthDays || monthDays || 30;
    return (empData.salaryPerMonth / daysInMonth).toFixed(2);
  };

  const formatMonthDisplay = (monthStr) => {
    if (!monthStr || monthStr === "Not specified") return "Current Month";
    const [year, month] = monthStr.split("-");
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const formatMonthForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const getCurrentMonth = () => {
    const today = new Date();
    return formatMonthForAPI(today);
  };

  const fetchSalaryData = useCallback(async (month = "") => {
    try {
      setLoading(true);
      setError(null);

      const employeeData = getCurrentEmployee();
      const employeeId = employeeData?.employeeId;

      if (!employeeId) {
        setError("❌ Employee ID not found. Please log in again.");
        setLoading(false);
        return;
      }

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
      
      const leavesRes = await fetch(`${BASE_URL}/api/leaves/leaves?status=approved`);
      let leavesData = leavesRes.ok ? await leavesRes.json() : [];
      
      const processedLeaves = processLeavesData(leavesData, month);
      const compOffs = await processCompOffData(month, processedLeaves);
      
      const attendanceMap = await fetchEmployeeAttendance(employeeId, month || getCurrentMonth());
      
      const [year, monthNum] = (month || getCurrentMonth()).split('-').map(Number);
      const targetWeekOffCount = getEmployeeWeekOffCount(employeeId);
      
      const actualWeekOffDays = calculateActualWeekOffDays(
        employeeId,
        year,
        monthNum,
        attendanceMap,
        processedLeaves,
        targetWeekOffCount,
        month || getCurrentMonth()
      );

      let employeeSalaryRecords = [];

      if (salaryData.success && salaryData.salaries && salaryData.salaries.length > 0) {
        employeeSalaryRecords = salaryData.salaries
          .filter(salary => salary.employeeId === employeeId)
          .map(salary => {
            const daysInMonth = salaryData.monthDays || 30;
            const dailyRateValue = (salary.salaryPerMonth || 0) / daysInMonth;
            
            const presentDaysCount = salary.presentDays || 0;
            const halfDaysCount = salary.halfDayWorking || 0;
            const holidayCount = 0;
            const compOffBalance = compOffs[employeeId]?.balance || 0;
            
            const effectivePaidDays = presentDaysCount + (halfDaysCount * 0.5) + (includeWeekOff ? actualWeekOffDays : 0) + holidayCount + compOffBalance;
            const recalculatedSalary = effectivePaidDays * dailyRateValue;
            
            const compOffData = compOffs[employeeId] || { earned: 0, used: 0, balance: 0 };
            let finalCalculatedSalary = recalculatedSalary;
            
            if (compOffData.balance > 0) {
              const compOffAmount = compOffData.balance * dailyRateValue;
              finalCalculatedSalary += compOffAmount;
            }

            return {
              ...salary,
              calculatedSalary: Math.round(finalCalculatedSalary),
              weekOffs: actualWeekOffDays,
              targetWeekOffCount: targetWeekOffCount,
              compOffEarned: compOffData.earned || 0,
              compOffUsed: compOffData.used || 0,
              compOffBalance: compOffData.balance || 0,
              monthDays: salaryData.monthDays || 30,
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
      } else {
        const daysInMonthValue = getDaysInMonth(month || getCurrentMonth());
        const dailyRateValue = (employeeData.salaryPerMonth || 0) / daysInMonthValue;
        
        const presentDaysCount = 0;
        const halfDaysCount = 0;
        const holidayCount = 0;
        const compOffBalance = compOffs[employeeId]?.balance || 0;
        
        const effectivePaidDays = presentDaysCount + (halfDaysCount * 0.5) + (includeWeekOff ? actualWeekOffDays : 0) + holidayCount + compOffBalance;
        const recalculatedSalary = effectivePaidDays * dailyRateValue;
        
        employeeSalaryRecords = [{
          employeeId: employeeId,
          name: employeeData.name,
          month: month || getCurrentMonth(),
          monthFormatted: formatMonthDisplay(month || getCurrentMonth()),
          presentDays: 0,
          workingDays: 0,
          halfDays: 0,
          weekOffs: actualWeekOffDays,
          targetWeekOffCount: targetWeekOffCount,
          totalLeaves: 0,
          calculatedSalary: Math.round(recalculatedSalary),
          salaryPerMonth: employeeData.salaryPerMonth || 0,
          monthDays: daysInMonthValue,
          includeWeekOffInSalary: includeWeekOff,
          canDownload: canDownload,
          isHistoricalMonth: isHistorical,
          isCurrentMonth: isCurrent,
          compOffEarned: 0,
          compOffUsed: 0,
          compOffBalance: compOffBalance
        }];
      }

      if (salaryData.monthDays) {
        setMonthDays(salaryData.monthDays);
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
  }, [processLeavesData, processCompOffData, employeesMasterData]);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const empRes = await fetch(`${BASE_URL}/api/employees/get-employees`).catch(() => ({ ok: false }));
        
        if (empRes.ok) {
          const employees = await empRes.json();
          const empMap = {};
          employees.forEach(emp => {
            empMap[emp.employeeId] = {
              salaryPerMonth: emp.salaryPerMonth || 0,
              name: emp.name,
              employeeId: emp.employeeId,
              department: emp.department || '',
              designation: emp.role || emp.designation || '',
              joiningDate: emp.joinDate || emp.joiningDate || '',
              bankAccount: emp.bankAccount || emp.bankAccountNo || '',
              bankName: emp.bankName || '',
              panCard: emp.panCard || emp.panNumber || '',
              pfNo: emp.pfNumber || emp.pfNo || '',
              uanNo: emp.uanNumber || emp.uanNo || '',
              esicNo: emp.esicNumber || emp.esicNo || '',
              branch: emp.branch || '',
              weekOffDay: emp.weekOffDay || '',
              weekOffType: emp.weekOffType || '0+4',
              weekOffPerMonth: emp.weekOffPerMonth || 4
            };
          });
          setEmployeesMasterData(empMap);
        }
      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    };

    fetchMasterData();
  }, []);

  useEffect(() => {
    fetchSalaryData();
  }, [fetchSalaryData]);

  const handleMonthSelect = async (e) => {
    const monthValue = e.target.value;
    setSelectedMonth(monthValue);
    setIsLoadingMonth(true);
    await fetchSalaryData(monthValue);
    setIsLoadingMonth(false);
  };

  const handleClearFilter = async () => {
    setSearchTerm("");
    setSelectedMonth("");
    await fetchSalaryData();
  };

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

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedEmployee(null);
  };

  // 🔥 UPDATED: generateInvoiceHTML with proper logo and stamp
 const generateInvoiceHTML = (employee) => {
  const employeeData = getEmployeeData(employee);
  const daysInMonth = employee.monthDays || monthDays || getDaysInMonth(employee.month || selectedMonth);
  const dailyRate = parseFloat(calculateDailyRate(employee)) || 0;
  const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
  const compOffData = employeeCompOffs[employee.employeeId] || { earned: 0, used: 0, balance: 0 };

  const actualWeekOffDays = employee.weekOffs || 0;
  const presentDays = employee.presentDays ?? 0;
  const halfDays = employee.halfDays || employee.halfDayWorking || 0;
  const holidays = 0;

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
  const totalEarnings = grossSalary + bonus + extraDaysPay + compOffPay;

  const otherDeductions = employee.extraWork?.deductions || 0;
  const totalDeductions = lopAmount + halfDayDeductionAmount + otherDeductions;
  const netPay = totalEarnings - totalDeductions;

  // Earnings Items
  const earningsItems = [];
  
  const basicAmt = employeeData.basicPay || grossSalary;
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
  
  if (compOffPay > 0) {
    earningsItems.push({ label: 'Comp-off / Holiday Pay', amount: compOffPay });
  }
  
  if (holidays > 0) {
    earningsItems.push({ label: `Public Holidays (${holidays})`, amount: holidays * dailyRate, isInfo: true });
  }
  
  earningsItems.push({ label: `Working Days (Full: ${presentDays})`, amount: 0, isInfo: true });
  earningsItems.push({ label: `Week Off Days (${actualWeekOffDays})`, amount: 0, isInfo: true });
  
  // Deductions Items
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

  // Get logo and stamp data
  const logoData = templateConfig.logo || logo;
  const stampData = companyStamp;

  // 🔥 UPDATED: New company name and address
  const companyName = "Timely Healthtech Private Limited";
  const companyAddress = "Reg. Address: Flat No:301, H.No:1-68/22, Plot No. 54 & 55, Sri Sai Balaji Avenue, Arunodaya Colony, Madhapur, Hyderabad, Telangana-500081";

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
            .logo-image { 
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .stamp-image {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
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
                    <img src="${logoData}" alt="Logo" class="logo-image" style="height: 80px; width: auto; max-width: 200px; object-fit: contain;">
                  </div>
                  <div style="flex: 1; text-align: center; padding: 0 10px;">
                    <h2 style="margin: 0; font-size: 16px; font-weight: bold;">${companyName}</h2>
                    <p style="margin: 2px 0 0; font-size: 7px; line-height: 1.4; color: #555;">
                      ${companyAddress}
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
          
          <!-- STAMP SECTION -->
          <div style="display: flex; justify-content: flex-end; align-items: center; padding: 10px 20px; border-top: 1px solid #000; margin-top: 5px;">
            <div class="stamp-container">
              <img src="${stampData}" alt="Company Stamp" class="stamp-image" style="width: 90px; height: auto; opacity: 0.8;">
              <div style="text-align: right; line-height: 1.2;">
                <strong style="font-size: 7px; color: #333; display: block;">Authorized Signatory</strong>
                <span style="font-size: 6px; color: #555; display: block;">${companyName}</span>
              </div>
            </div>
          </div>
          
        </div>
      </body>
    </html>
  `;
};

  const downloadSalarySlip = async (employee) => {
    if (!employee.canDownload) {
      alert(`Salary slip for current month will be available for download from last day of the month onwards.`);
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

  const getLeaveTypes = (employee) => {
    const leavesData = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0, leaveDetails: [] };
    
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

  if (loading) {
    return (
      <div className="emp-dash">
        <div className="emp-dash__loading">
          <div className="emp-dash__spinner" />
          <p className="emp-dash__loading-text">Loading your salary data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="emp-dash">
        <main style={{ display: "grid", placeItems: "center", minHeight: "60vh", padding: "1rem" }}>
          <div className="emp-dash__card" style={{ maxWidth: 520, width: "100%" }}>
            <div className="emp-dash__card-header">
              <div>
                <h3 className="emp-dash__card-title">Couldn't load salary</h3>
                <p className="emp-dash__card-desc">{error}</p>
              </div>
              <button type="button" className="emp-dash__card-link" onClick={() => fetchSalaryData(selectedMonth)}>
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const totalSalary = filteredRecords.reduce((sum, emp) => sum + (emp.calculatedSalary || 0), 0);
  const avgSalary = filteredRecords.length > 0 ? Math.round(totalSalary / filteredRecords.length) : 0;
  const availableDocs = filteredRecords.filter((emp) => emp.canDownload).length;

  return (
    <div className="emp-dash">
      <main>
        <div className="emp-dash__header">
          <div>
            <h1 className="emp-dash__greeting">
              My <span>Salary</span>
            </h1>
            <p className="emp-dash__subtitle">View monthly salary summary and download payslips.</p>
          </div>
          <div className="emp-dash__date-pill">
            <FaCalendarAlt />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="emp-dash__stats">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Records</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiFileText />
              </div>
            </div>
            <div className="emp-dash__stat-value">{filteredRecords.length}</div>
            <div className="emp-dash__stat-meta">months</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Salary</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiDollarSign />
              </div>
            </div>
            <div className="emp-dash__stat-value">
              ₹<CountUp end={Math.round(totalSalary)} duration={1.2} separator="," />
            </div>
            <div className="emp-dash__stat-meta">sum</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Payslips</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiDownloadCloud />
              </div>
            </div>
            <div className="emp-dash__stat-value">{availableDocs}</div>
            <div className="emp-dash__stat-meta">available</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Avg Salary</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiPieChart />
              </div>
            </div>
            <div className="emp-dash__stat-value">
              ₹<CountUp end={avgSalary} duration={1.2} separator="," />
            </div>
            <div className="emp-dash__stat-meta">per month</div>
          </div>
        </div>

        <div className="emp-dash__card" style={{ marginBottom: "1.5rem" }}>
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title">Filters</h3>
            </div>
            <button type="button" className="emp-dash__card-link" onClick={() => fetchSalaryData(selectedMonth)} disabled={isLoadingMonth}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                <RefreshCw size={12} className={isLoadingMonth ? "animate-spin" : ""} />
                {isLoadingMonth ? "Refreshing" : "Refresh"}
              </span>
            </button>
          </div>

          <div className="emp-dash__card-body">
            <div className="emp-leaves__filters">
              <div className="emp-leaves__field" style={{ minWidth: 220 }}>
                <label>Search</label>
                <div style={{ position: "relative" }}>
                  <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#98a2b3" }} />
                  <input
                    type="text"
                    placeholder="Search by month..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="emp-leaves__input"
                    style={{ paddingLeft: "2rem" }}
                  />
                </div>
              </div>

              <div className="emp-leaves__field">
                <label>Month</label>
                <input type="month" value={selectedMonth} onChange={handleMonthSelect} className="emp-leaves__input" max={getCurrentMonth()} />
              </div>

              <button type="button" className="emp-leaves__btn emp-leaves__btn--primary" onClick={() => { setSelectedMonth(""); fetchSalaryData(); }}>
                Current
              </button>

              {(searchTerm || selectedMonth) && (
                <button type="button" className="emp-leaves__btn emp-leaves__btn--ghost" onClick={handleClearFilter}>
                  Clear
                </button>
              )}
            </div>

            <div style={{ marginTop: "0.75rem", fontSize: "0.8125rem", color: "var(--ed-text-secondary)" }}>
              Showing <strong>{filteredRecords.length}</strong> of <strong>{records.length}</strong> records
            </div>
          </div>
        </div>

        {selectedMonth && isCurrentMonth(selectedMonth) && new Date().getDate() < 26 && (
          <div className="mb-3 px-3 py-2 rounded-md shadow-sm bg-yellow-50 border-l-4 border-yellow-500">
            <p className="text-xs font-medium text-yellow-700">
              ⚠️ Current Month (Before 26th) - Week-off will be added after 26th for salary calculation
            </p>
          </div>
        )}
        {selectedMonth && isCurrentMonth(selectedMonth) && new Date().getDate() >= 26 && (
          <div className="mb-3 px-3 py-2 rounded-md shadow-sm bg-green-50 border-l-4 border-green-500">
            <p className="text-xs font-medium text-green-700">
              ✓ Current Month (After 26th) - Week-off included in salary calculation
            </p>
          </div>
        )}
        {selectedMonth && isHistoricalMonth(selectedMonth) && (
          <div className="mb-3 px-3 py-2 rounded-md shadow-sm bg-green-50 border-l-4 border-green-500">
            <p className="text-xs font-medium text-green-700">
              ✓ Historical Month - Full salary with week-off included
            </p>
          </div>
        )}

        <div className="emp-dash__card">
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title">Salary Records</h3>
              <p className="emp-dash__card-desc">Month-wise salary and payslip availability</p>
            </div>
          </div>
          {filteredRecords.length === 0 ? (
            <div className="emp-dash__card-body" style={{ textAlign: "center" }}>
              <p style={{ color: "var(--ed-text-muted)", margin: 0 }}>No salary records found.</p>
            </div>
          ) : (
            <>
              <div className="emp-dash__table-wrap">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Present</th>
                      <th>Working</th>
                      <th>Half</th>
                      <th>Weekoff</th>
                      <th>Leaves</th>
                      <th>Comp-off</th>
                      <th>Salary</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((emp, idx) => {
                      const dailyRate = calculateDailyRate(emp);
                      const statusText = emp.canDownload ? "Available" : "From Last Day";
                      return (
                        <tr key={idx}>
                          <td>
                            <div style={{ fontWeight: 700 }}>{emp.monthFormatted || formatMonthDisplay(emp.month)}</div>
                            <div style={{ fontSize: "0.6875rem", color: "var(--ed-text-muted)" }}>
                              {emp.monthDays} days | WO: {emp.targetWeekOffCount || 4}
                            </div>
                          </td>
                          <td>{emp.presentDays || 0}</td>
                          <td>{emp.workingDays || 0}</td>
                          <td>{emp.halfDays || 0}</td>
                          <td>{emp.weekOffs || 0}</td>
                          <td>{emp.totalLeaves || 0}</td>
                          <td>
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
                              <span className="text-xs text-gray-500">0</span>
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: "var(--ed-success)" }}>₹{Math.round(emp.calculatedSalary)}</div>
                            <div style={{ fontSize: "0.6875rem", color: "var(--ed-text-muted)" }}>₹{dailyRate}/day</div>
                          </td>
                          <td>
                            <span className={`emp-dash__table-status ${emp.canDownload ? "emp-dash__table-status--present" : "emp-dash__table-status--other"}`}>
                              {statusText}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div className="flex justify-end space-x-1">
                              <button onClick={() => handleViewDetails(emp)} className="p-1 text-blue-600 rounded-md hover:bg-blue-50">
                                <Eye size={14} />
                              </button>
                              <button 
                                onClick={() => downloadSalarySlip(emp)} 
                                disabled={!emp.canDownload} 
                                className={`p-1 rounded-md ${emp.canDownload ? 'text-purple-600 hover:bg-purple-50' : 'text-gray-500 cursor-not-allowed'}`}
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="emp-dash__mobile-list">
                {currentRecords.map((emp, idx) => {
                  const dailyRate = calculateDailyRate(emp);
                  const statusText = emp.canDownload ? "Available" : "From Last Day";
                  return (
                    <div key={idx} className="emp-dash__mobile-item">
                      <div className="emp-dash__mobile-item-top">
                        <div className="emp-dash__mobile-date">{emp.monthFormatted || formatMonthDisplay(emp.month)}</div>
                        <span className={`emp-dash__table-status ${emp.canDownload ? "emp-dash__table-status--present" : "emp-dash__table-status--other"}`}>
                          {statusText}
                        </span>
                      </div>
                      <div className="emp-dash__mobile-grid">
                        <div className="emp-dash__mobile-field">
                          <span>Salary</span>
                          <span style={{ fontWeight: 700, color: "var(--ed-success)" }}>₹{Math.round(emp.calculatedSalary)}</span>
                        </div>
                        <div className="emp-dash__mobile-field">
                          <span>Daily Rate</span>
                          <span>₹{dailyRate}/day</span>
                        </div>
                        <div className="emp-dash__mobile-field">
                          <span>Days (P/W/H/WO)</span>
                          <span>{emp.presentDays || 0}/{emp.workingDays || 0}/{emp.halfDays || 0}/{emp.weekOffs || 0}</span>
                        </div>
                        <div className="emp-dash__mobile-field">
                          <span>Leaves / C-Off</span>
                          <span>{emp.totalLeaves || 0} / {emp.compOffBalance || 0}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.75rem", borderTop: "1px solid var(--ed-border-light)", paddingTop: "0.5rem" }}>
                        <button 
                          onClick={() => handleViewDetails(emp)} 
                          className="emp-leaves__btn emp-leaves__btn--ghost"
                          style={{ height: "2rem", padding: "0 0.75rem", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                        >
                          <Eye size={12} /> View
                        </button>
                        <button 
                          onClick={() => downloadSalarySlip(emp)} 
                          disabled={!emp.canDownload} 
                          className={`emp-leaves__btn ${emp.canDownload ? 'emp-leaves__btn--primary' : 'emp-leaves__btn--ghost'}`}
                          style={{ height: "2rem", padding: "0 0.75rem", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.25rem", opacity: emp.canDownload ? 1 : 0.5 }}
                        >
                          <Download size={12} /> Slip
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredRecords.length > 0 && (
                <div className="emp-dash__card-body" style={{ borderTop: "1px solid var(--ed-border-light)" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "0.8125rem", color: "var(--ed-text-secondary)" }}>
                      Showing <strong>{indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, filteredRecords.length)}</strong> of{" "}
                      <strong>{filteredRecords.length}</strong>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", flexWrap: "wrap" }}>
                      <button type="button" onClick={handlePrevious} disabled={currentPage === 1} className="emp-leaves__btn emp-leaves__btn--ghost" style={{ height: "2rem" }}>
                        Prev
                      </button>
                      {getPageNumbers().map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handlePageClick(p)}
                          className="emp-leaves__btn emp-leaves__btn--ghost"
                          style={{
                            height: "2rem",
                            minWidth: "2.25rem",
                            borderColor: currentPage === p ? "var(--ed-primary)" : "var(--ed-border)",
                            color: currentPage === p ? "var(--ed-primary)" : "var(--ed-text-secondary)",
                            background: currentPage === p ? "var(--ed-primary-soft)" : "#fff",
                          }}
                        >
                          {p}
                        </button>
                      ))}
                      <button type="button" onClick={handleNext} disabled={currentPage === totalPages} className="emp-leaves__btn emp-leaves__btn--ghost" style={{ height: "2rem" }}>
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {showDetailsModal && selectedEmployee && (
        <div className="emp-dash-modal fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="emp-dash__modal-panel bg-white shadow-2xl rounded-2xl" style={{ maxWidth: 880 }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--ed-border-light)" }}>
              <div>
                <h3 className="text-lg font-bold" style={{ color: "var(--ed-text)" }}>Salary Details</h3>
                <p className="text-xs" style={{ color: "var(--ed-text-secondary)" }}>
                  {selectedEmployee.monthFormatted || formatMonthDisplay(selectedEmployee.month || selectedMonth)}
                </p>
              </div>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
            </div>

            <div className="emp-dash__modal-body p-4">
              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full shrink-0">
                  <span className="text-lg font-semibold text-blue-800">{selectedEmployee.name?.charAt(0) || 'E'}</span>
                </div>
                <div className="flex flex-col flex-1 space-y-1">
                  <h3 className="text-lg font-semibold text-gray-700">{selectedEmployee.name}</h3>
                  <div className="grid grid-cols-2 text-sm text-gray-500 gap-x-6 gap-y-1">
                    <p><span className="font-medium text-gray-700">ID:</span> {selectedEmployee.employeeId}</p>
                    <p><span className="font-medium text-gray-700">Department:</span> {selectedEmployee.department || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Designation:</span> {selectedEmployee.designation || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Month:</span> {selectedEmployee.month || selectedMonth || "Current"} ({selectedEmployee.monthDays || monthDays} days) | Week-offs: {selectedEmployee.targetWeekOffCount || 4}</p>
                  </div>
                </div>
              </div>

              {(selectedEmployee.compOffBalance > 0 || selectedEmployee.compOffEarned > 0) && (
                <div className="p-3 mt-4 rounded-lg bg-purple-50">
                  <p className="text-sm font-medium text-purple-800">Comp-off Summary - {formatMonthDisplay(selectedEmployee.month || selectedMonth)}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="text-center">
                      <span className="text-xs text-gray-500">Leave Taken</span>
                      <p className="text-2xl font-bold text-blue-600">
                        {(() => {
                          const leaves = employeeLeaves[selectedEmployee.employeeId];
                          return (leaves?.CL || 0) + (leaves?.EL || 0) + (leaves?.COFF || 0) + (leaves?.Other || 0);
                        })()}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-gray-500">-</span>
                    <div className="text-center">
                      <span className="text-xs text-gray-500">Comp-off Used</span>
                      <p className="text-2xl font-bold text-purple-600">
                        {(() => {
                          const leaves = employeeLeaves[selectedEmployee.employeeId];
                          const totalLeaves = (leaves?.CL || 0) + (leaves?.EL || 0) + (leaves?.COFF || 0) + (leaves?.Other || 0);
                          const earned = selectedEmployee.compOffEarned || 0;
                          return Math.min(earned, totalLeaves);
                        })()}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-gray-500">=</span>
                    <div className="text-center">
                      <span className="text-xs text-gray-500">Balance</span>
                      <p className="text-2xl font-bold text-blue-700">
                        {(() => {
                          const leaves = employeeLeaves[selectedEmployee.employeeId];
                          const totalLeaves = (leaves?.CL || 0) + (leaves?.EL || 0) + (leaves?.COFF || 0) + (leaves?.Other || 0);
                          const earned = selectedEmployee.compOffEarned || 0;
                          const used = Math.min(earned, totalLeaves);
                          return earned - used;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 mt-4 mb-4 text-sm sm:grid-cols-2 gap-x-10 gap-y-2">
                <div className="flex justify-between pb-1 border-b">
                  <span className="text-gray-500">Present Days</span>
                  <span className="font-semibold text-blue-700">{selectedEmployee.presentDays || 0}</span>
                </div>
                <div className="flex justify-between pb-1 border-b">
                  <span className="text-gray-500">Working Days</span>
                  <span className="font-semibold text-blue-600">{selectedEmployee.workingDays || 0}</span>
                </div>
                <div className="flex justify-between pb-1 border-b">
                  <span className="text-gray-500">Half Days</span>
                  <span className="font-semibold text-yellow-600">{selectedEmployee.halfDays || 0}</span>
                </div>
                <div className="flex justify-between pb-1 border-b">
                  <span className="text-gray-500">WeekOff Days</span>
                  <span className="font-semibold text-purple-600">{selectedEmployee.weekOffs || 0}</span>
                </div>
                <div className="flex justify-between pb-1 border-b">
                  <span className="text-gray-500">Month Days</span>
                  <span className="font-semibold text-gray-700">{selectedEmployee.monthDays || monthDays}</span>
                </div>
                <div className="flex justify-between pb-1 border-b">
                  <span className="text-gray-500">Monthly Salary</span>
                  <span className="font-semibold text-blue-600">₹{selectedEmployee.salaryPerMonth || 0}</span>
                </div>
                <div className="flex justify-between pb-1 border-b">
                  <span className="text-gray-500">Daily Rate</span>
                  <span className="font-semibold text-gray-700">₹{calculateDailyRate(selectedEmployee)}/day</span>
                </div>
                <div className="flex justify-between pb-1 border-b">
                  <span className="text-gray-500">Calculated Salary</span>
                  <span className="font-semibold text-blue-700">₹{Math.round(selectedEmployee.calculatedSalary || 0)}</span>
                </div>
                <div className="flex flex-col pb-2 border-b sm:col-span-2">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-500">Approved Leaves</span>
                    <span className="font-semibold text-red-600">{getLeaveTypes(selectedEmployee) || "0"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-500">Comp-off Collection</span>
                    <span className="px-3 py-1 text-sm font-semibold text-purple-700 bg-purple-100 rounded-full">
                      {(() => {
                        const leaves = employeeLeaves[selectedEmployee.employeeId];
                        const totalLeaves = (leaves?.CL || 0) + (leaves?.EL || 0) + (leaves?.COFF || 0) + (leaves?.Other || 0);
                        const earned = selectedEmployee.compOffEarned || 0;
                        const used = Math.min(earned, totalLeaves);
                        const balance = earned - used;
                        return `${totalLeaves} - ${used} = ${balance}`;
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => downloadSalarySlip(selectedEmployee)} 
                  disabled={!selectedEmployee.canDownload} 
                  className={`px-6 py-2 rounded-lg transition duration-200 ${selectedEmployee.canDownload ? 'bg-purple-500 text-gray-900 hover:bg-purple-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  Download Payslip
                </button>
                <button onClick={handleCloseModal} className="px-6 py-2 text-gray-900 transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-600">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
