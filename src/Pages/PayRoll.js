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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const [monthDays, setMonthDays] = useState(30); // Default days in month
  const recordsPerPage = 10;

  // API endpoints
  const ATTENDANCE_SUMMARY_API_URL = "http://localhost:5000/api/attendancesummary/get";
  const ATTENDANCE_DETAILS_API_URL = "http://localhost:5000/api/attendance/allattendance";
  const LEAVES_API_URL = "http://localhost:5000/api/leaves/leaves?status=approved";
  const EMPLOYEES_API_URL = "http://localhost:5000/api/employees/get-employees";

  // Dynamic Salary API URL with month parameter
  const getSalaryApiUrl = (month) => {
    return month
      ? `http://localhost:5000/api/attendancesummary/getsalaries?month=${month}`
      : "http://localhost:5000/api/attendancesummary/getsalaries";
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (month = "") => {
    try {
      setLoading(true);
      setError("");
      console.log("📥 Fetching payroll data for month:", month || "Current Month");

      // STEP 0 → Fetch Attendance Summary Data First (with month filter)
      let summaryData = [];
      let summaryQuery = "";
      if (month) {
        summaryQuery = `?month=${month}`;
      }

      try {
        const summaryRes = await fetch(`${ATTENDANCE_SUMMARY_API_URL}${summaryQuery}`);
        if (summaryRes.ok) {
          const json = await summaryRes.json();
          summaryData = json.summary || [];
          console.log(`📘 Summary API for ${month || "current month"}:`, summaryData.length, "records");
        }
      } catch (e) {
        console.warn("⚠️ Summary API Error:", e.message);
      }

      // STEP 1 → Salary API (with month filter) - YEH IMPORTANT HAI
      let salaryData = { success: false, salaries: [], monthDays: 30 };
      try {
        const salaryUrl = getSalaryApiUrl(month);
        console.log("💰 Fetching salary from:", salaryUrl);
        const salaryRes = await fetch(salaryUrl);
        if (salaryRes.ok) {
          salaryData = await salaryRes.json();
          console.log(`💰 Salary API for ${month || "current month"}:`, salaryData.salaries?.length || 0, "salaries");
          console.log("💰 Salary month in response:", salaryData.month);
          console.log("💰 Month days:", salaryData.monthDays);

          // Set month days from backend
          if (salaryData.monthDays) {
            setMonthDays(salaryData.monthDays);
          }
        }
      } catch (err) {
        console.warn("⚠️ Salary API error:", err.message);
      }

      // STEP 2 → Fetch employees + APPROVED LEAVES
      const [employeesRes, leavesRes] = await Promise.all([
        fetch(EMPLOYEES_API_URL).catch(() => ({ ok: false })),
        fetch("http://localhost:5000/api/leaves/leaves?status=approved").catch(() => ({ ok: false }))
      ]);

      let employeesData = employeesRes.ok ? await employeesRes.json() : [];
      let leavesData = leavesRes.ok ? await leavesRes.json() : [];

      console.log("✅ Approved Leaves from API:", leavesData.length);

      // EMPLOYEES MAP
      const employeesMap = {};
      employeesData.forEach(emp => {
        employeesMap[emp.employeeId] = {
          salaryPerMonth: emp.salaryPerMonth || 0,
          shiftHours: emp.shiftHours || 8,
          weekOffPerMonth: emp.weekOffPerMonth || 0,
          name: emp.name,
          employeeId: emp.employeeId
        };
      });

      setEmployeesMasterData(employeesMap);

      // === MERGE SALARY + SUMMARY DATA ===
      let processedSalaries = [];

      if (salaryData.success && salaryData.salaries.length > 0) {
        processedSalaries = salaryData.salaries.map(emp => {
          const summary = summaryData.find(x => x.employeeId === emp.employeeId) || {};

          return {
            ...emp,
            // Summary data override
            presentDays: summary.presentDays ?? emp.presentDays ?? 0,
            workingDays: emp.totalWorkingDays || 0, // Use from salary API
            totalWorkingDays: emp.totalWorkingDays || 0,
            halfDayWorking: summary.halfDayWorking ?? emp.halfDayWorking ?? 0,
            fullDayNotWorking: summary.fullDayNotWorking ?? emp.fullDayNotWorking ?? 0,
            onsiteDays: summary.onsiteDays ?? 0,
            lateDays: summary.lateDays ?? 0,
            fullDayLeaves: summary.fullDayLeaves ?? 0,
            halfDayLeaves: summary.halfDayLeaves ?? 0,
            weekOffs: summary.weekOffPerMonth ?? emp.weekOffs ?? 0,
            month: salaryData.month || month || emp.month || "Not specified",
            salaryPerDay: emp.salaryPerDay || 0,
            calculatedSalary: emp.calculatedSalary || 0,
            monthDays: salaryData.monthDays || 30
          };
        });
      } else {
        // Salary API fail → fallback to employees only
        processedSalaries = employeesData.map(emp => ({
          employeeId: emp.employeeId,
          name: emp.name,
          presentDays: 0,
          workingDays: 0,
          totalWorkingDays: 0,
          halfDayWorking: 0,
          fullDayNotWorking: 0,
          calculatedSalary: 0,
          salaryPerMonth: emp.salaryPerMonth || 0,
          salaryPerDay: 0,
          weekOffs: emp.weekOffPerMonth || 0,
          totalLeaves: 0,
          leaveTypes: {},
          month: month || "No Month",
          monthDays: salaryData.monthDays || 30
        }));
      }

      // set state
      setRecords(processedSalaries);
      setFilteredRecords(processedSalaries);

      if (leavesData.length > 0) {
        processLeavesData(leavesData);
      }

    } catch (err) {
      console.error("❌ ERROR:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setIsLoadingMonth(false);
    }
  };

  // ✅ Process leaves data
  const processLeavesData = (leavesData) => {
    const leavesMap = {};

    leavesData.forEach(leave => {
      const employeeId = leave.employeeId;
      if (!employeeId) return;

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
      const duration = calculateLeaveDuration(leave.startDate, leave.endDate);

      if (leavesMap[employeeId][leaveType] !== undefined) {
        leavesMap[employeeId][leaveType] += duration;
      } else {
        leavesMap[employeeId].Other += duration;
      }

      // Store leave details for display
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
    console.log("🍃 Processed leaves data:", Object.keys(leavesMap).length, "employees");
  };

  const calculateLeaveDuration = (fromDate, toDate) => {
    if (!fromDate) return 0;

    const start = new Date(fromDate);
    const end = toDate ? new Date(toDate) : new Date(fromDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return diffDays;
  };

  // ✅ Calculate salary using backend data - AB BACKEND SE HI AAYEGA
  const calculateSalary = (employee) => {
    // Directly use backend calculated salary - YAHIN SE AAYEGA
    return employee.calculatedSalary || 0;
  };

  // ✅ Calculate daily rate BASED ON ACTUAL MONTH DAYS
  const calculateDailyRate = (employee) => {
    const employeeData = employeesMasterData[employee.employeeId];
    if (!employeeData || !employeeData.salaryPerMonth || employeeData.salaryPerMonth === 0) return 0;

    // Use actual month days from backend
    const daysInMonth = employee.monthDays || monthDays || 30;
    return (employeeData.salaryPerMonth / daysInMonth).toFixed(2);
  };

  // ✅ Get employee master data
  const getEmployeeData = (employee) => {
    return employeesMasterData[employee.employeeId] || {
      salaryPerMonth: employee.salaryPerMonth || 0,
      shiftHours: 8,
      weekOffPerMonth: employee.weekOffs || 0,
      name: employee.name || '',
      designation: '',
      employeeId: employee.employeeId
    };
  };

  const calculateWeekOffDays = (employee) => {
    return employee.weekOffs || 0;
  };

  const calculateHolidays = (employee) => {
    return 0; // No paid holidays, only week offs are paid
  };

  // ✅ Handle attendance row click
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
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ Filter records based on search
  useEffect(() => {
    const filtered = records.filter(record =>
      record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeId?.toString().includes(searchTerm)
    );
    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchTerm, records]);

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

  // ✅ Handle edit
  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const weekOffDays = calculateWeekOffDays(employee);
    const holidays = calculateHolidays(employee);

    setEditFormData({
      presentDays: employee.presentDays || 0,
      workingDays: employee.totalWorkingDays || 0,
      halfDayWorking: employee.halfDayWorking || 0,
      fullDayNotWorking: employee.fullDayNotWorking || 0,
      calculatedSalary: employee.calculatedSalary || 0,
      weekOffDays: weekOffDays,
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

  // ✅ Handle edit submit - FIXED FOR ACTUAL MONTH DAYS
  const handleEditSubmit = (e) => {
    e.preventDefault();

    if (!selectedEmployee) return;

    const employeeData = getEmployeeData(selectedEmployee);
    const leaves = employeeLeaves[selectedEmployee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const weekOffDays = editFormData.weekOffDays || calculateWeekOffDays(selectedEmployee);
    const holidays = editFormData.holidays || calculateHolidays(selectedEmployee);
    const unpaidLeaves = leaves.LOP; // Only LOP is unpaid

    // ✅ Use actual month days for daily rate
    const daysInMonth = selectedEmployee.monthDays || monthDays || 30;
    const dailyRate = employeeData.salaryPerMonth / daysInMonth;

    // Calculate effective working days
    const effectiveWorkingDays = (editFormData.workingDays || 0) + (0.5 * (editFormData.halfDayWorking || 0));

    const paidLeaveDays = (leaves.CL || 0) + (leaves.EL || 0) + (leaves.COFF || 0);

    // ✅ CORRECT CALCULATION: (Working days + WeekOffs + Paid Leaves)
    // Note: LOP is properly handled because it reduces 'effectiveWorkingDays' (attendance), so we don't subtract it again.
    const paidDays = Math.max(0, effectiveWorkingDays + weekOffDays + paidLeaveDays);
    const baseSalary = paidDays * dailyRate;

    // Extra work calculation
    const extraDaysAmount = (extraWorkData.extraDays || 0) * dailyRate;
    const totalExtraAmount = extraDaysAmount + (extraWorkData.bonus || 0) - (extraWorkData.deductions || 0);
    const finalSalary = baseSalary + totalExtraAmount;

    const updatedData = {
      ...editFormData,
      calculatedSalary: Math.round(finalSalary),
      extraWork: {
        extraDays: extraWorkData.extraDays || 0,
        extraHours: extraWorkData.extraHours || 0,
        overtimeRate: 0,
        overtimeAmount: 0,
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

  // ✅ Handle view
  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  // ✅ Download invoice
  const downloadInvoice = (employee) => {
    const invoiceContent = generateInvoiceHTML(employee);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
    printWindow.print();
  };

  // ✅ Generate invoice HTML with CORRECT CALCULATION
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

    const daysInMonth = employee.monthDays || monthDays || 30;
    const dailyRate = calculateDailyRate(employee);
    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const weekOffDays = calculateWeekOffDays(employee);
    const holidays = calculateHolidays(employee);
    const unpaidLeaves = leaves.LOP; // Only LOP is unpaid
    const paidLeaveDays = (leaves.CL || 0) + (leaves.EL || 0) + (leaves.COFF || 0);

    const paidLeaveAmount = paidLeaveDays * dailyRate;

    // ✅ CORRECT CALCULATION
    const workingDaysAmount = (employee.totalWorkingDays || 0) * dailyRate;
    const weekOffAmount = weekOffDays * dailyRate;

    let extraWorkAmount = 0;
    if (employee.extraWork) {
      extraWorkAmount = ((employee.extraWork.extraDays || 0) * dailyRate) +
        (employee.extraWork.bonus || 0) -
        (employee.extraWork.deductions || 0);
    }

    // Total salary = (Working days + WeekOffs + Paid Leaves) * Daily rate + Extra work
    const totalSalary = workingDaysAmount + weekOffAmount + paidLeaveAmount + extraWorkAmount;

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
          .month-info { background-color: #f0f9ff; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-name">Timely Health Tech Pvt Ltd</div>
            <div>123 Tech Park, Innovation City, IC 12345</div>
            <div>Phone: (123) 456-7890 | Email: hr@techsolutions.com</div>
          </div>

          <div class="invoice-title">SALARY INVOICE</div>
          
          <div class="month-info">
            <p><strong>Month:</strong> ${employee.month || selectedMonth || "Current Month"} | <strong>Days in Month:</strong> ${daysInMonth}</p>
          </div>

          <div class="details-grid">
            <div>
              <div class="detail-item">
                <span class="detail-label">Employee ID:</span> ${employee.employeeId}
              </div>
              <div class="detail-item">
                <span class="detail-label">Employee Name:</span> ${employee.name}
              </div>
              <div class="detail-item">
                <span class="detail-label">Month:</span> ${employee.month || selectedMonth || "Current"}
              </div>
            </div>
            <div>
              <div class="detail-item">
                <span class="detail-label">Invoice Date:</span> ${new Date().toLocaleDateString()}
              </div>
              <div class="detail-item">
                <span class="detail-label">Invoice No:</span> INV-${employee.employeeId}-${new Date().getTime()}
              </div>
              <div class="detail-item">
                <span class="detail-label">Days in Month:</span> ${daysInMonth}
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
                  <td colspan="4"><strong>Salary Components</strong></td>
                </tr>
                <tr>
                  <td>Monthly Salary</td>
                  <td>-</td>
                  <td>₹${employeeData.salaryPerMonth}/month</td>
                  <td>₹${employeeData.salaryPerMonth}</td>
                </tr>
                <tr>
                  <td>Daily Rate (${daysInMonth} days)</td>
                  <td>-</td>
                  <td>₹${dailyRate}/day</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>Working Days (Includes Half Days)</td>
                  <td>${employee.totalWorkingDays || 0}</td>
                  <td>₹${dailyRate}/day</td>
                  <td>₹${Math.round(workingDaysAmount)}</td>
                </tr>
                <tr>
                  <td>Half Days Included</td>
                  <td>${employee.halfDayWorking || 0}</td>
                  <td>-</td>
                  <td>(Included in Working Days)</td>
                </tr>
                <tr>
                  <td>WeekOff Days (Paid)</td>
                  <td>${weekOffDays}</td>
                  <td>₹${dailyRate}/day</td>
                  <td>₹${Math.round(weekOffAmount)}</td>
                </tr>

                <tr>
                  <td>Paid Leaves (CL/EL/COFF)</td>
                  <td>${paidLeaveDays}</td>
                  <td>₹${dailyRate}/day</td>
                  <td>₹${Math.round(paidLeaveAmount)}</td>
                </tr>
                <tr>
                  <td>Leave Types</td>
                  <td colspan="3">${getLeaveTypes(employee)}</td>
                </tr>
                
                
                
                ${hasExtraWork ? `
                <tr class="extra-work-row">
                  <td colspan="4"><strong>Extra Work & Adjustments</strong></td>
                </tr>
                ${(employee.extraWork.extraDays || 0) > 0 ? `
                <tr class="extra-work-row">
                  <td>Extra Working Days</td>
                  <td>${employee.extraWork.extraDays}</td>
                  <td>₹${dailyRate}/day</td>
                  <td>₹${Math.round((employee.extraWork.extraDays || 0) * dailyRate)}</td>
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
                  <td colspan="3"><strong>Total Salary Payable</strong></td>
                  <td><strong>₹${Math.round(totalSalary)}</strong></td>
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
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Month</td>
                  <td>${employee.month || selectedMonth || "Current"}</td>
                </tr>
                <tr>
                  <td>Days in Month</td>
                  <td>${daysInMonth}</td>
                </tr>
                <tr>
                  <td>Monthly Salary</td>
                  <td>₹${employeeData.salaryPerMonth}</td>
                </tr>
                <tr>
                  <td>Daily Rate</td>
                  <td>₹${dailyRate}/day</td>
                </tr>
                <tr>
                  <td>Effective Working Days</td>
                  <td>${employee.totalWorkingDays || 0}</td>
                </tr>
                <tr>
                  <td>WeekOff Days</td>
                  <td>${weekOffDays}</td>
                </tr>

                <tr>
                  <td>Unpaid Leaves</td>
                  <td>${unpaidLeaves}</td>
                </tr>
                <tr class="total-row">
                  <td><strong>Final Salary</strong></td>
                  <td><strong>₹${Math.round(totalSalary)}</strong></td>
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
            Thank you for your hard work and dedication!<br>
            <small>Calculated based on ${daysInMonth} days in ${employee.month || selectedMonth || "current month"}</small>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // ✅ Get leave types for display
  const getLeaveTypes = (employee) => {
    if (employee.leaveTypes && Object.keys(employee.leaveTypes).length > 0) {
      const leaveStrings = [];
      Object.entries(employee.leaveTypes).forEach(([type, count]) => {
        if (count > 0) {
          leaveStrings.push(`${type.toUpperCase()}: ${count}`);
        }
      });
      if (leaveStrings.length > 0) return leaveStrings.join(', ');
    }

    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const leaveStrings = [];

    if (leaves.CL > 0) leaveStrings.push(`CL: ${leaves.CL}`);
    if (leaves.EL > 0) leaveStrings.push(`EL: ${leaves.EL}`);
    if (leaves.COFF > 0) leaveStrings.push(`COFF: ${leaves.COFF}`);
    if (leaves.LOP > 0) leaveStrings.push(`LOP: ${leaves.LOP}`);
    if (leaves.Other > 0) leaveStrings.push(`Other: ${leaves.Other}`);

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
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
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
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-8xl">

        {/* Header Section */}
        {/* <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">Payroll Management</h1>
          <p className="text-gray-600">Manage employee salaries, attendance, and leaves</p>
          <div className="flex items-center mt-2">
            <span className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-full">
              Month: {formatMonthDisplay(selectedMonth)}
            </span>
            {selectedMonth && (
              <span className="ml-2 text-sm text-gray-600">
                Showing data for {selectedMonth} ({monthDays} days)
              </span>
            )}
          </div>
        </div> */}

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
        className="w-full py-1.5 pl-8 pr-3 text-sm border rounded-md focus:ring-1 focus:ring-blue-400"
      />
      <svg
        className="absolute w-4 h-4 text-gray-400 left-2 top-1/2 -translate-y-1/2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>

    {/* Actions */}
    <div className="flex gap-2">
      <input
        type="month"
        value={selectedMonth}
        onChange={(e) => {
          const monthValue = e.target.value;
          setSelectedMonth(monthValue);
          monthValue ? fetchData(monthValue) : fetchData();
        }}
        className="px-2 py-1.5 text-sm border rounded-md"
      />

      <button
        onClick={() => {
          setSelectedMonth("");
          fetchData();
        }}
        className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 border rounded-md hover:bg-gray-200"
      >
        Current
      </button>

      <button
        onClick={() => fetchData(selectedMonth)}
        disabled={isLoadingMonth}
        className="flex items-center px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoadingMonth ? (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        {/* <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-4">
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
                  ₹{filteredRecords.reduce((sum, emp) => sum + (emp.calculatedSalary || 0), 0).toLocaleString()}
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
                  {filteredRecords.filter(emp => (emp.totalWorkingDays || 0) > 0).length}
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
        </div> */}


        <div className="grid grid-cols-2 gap-2 mb-3 md:grid-cols-4">

  {/* Total Employees */}
  <div className="px-3 py-2 bg-white border-l-2 border-blue-500 rounded-md shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] text-gray-500 leading-tight">
          Total Employees
        </p>
        <p className="text-sm font-semibold text-gray-800 leading-tight">
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
        <p className="text-sm font-semibold text-gray-800 leading-tight">
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
        <p className="text-sm font-semibold text-gray-800 leading-tight">
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
        <p className="text-sm font-semibold text-gray-800 leading-tight">
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


        

        

        {/* Table Container */}
        <div className="overflow-hidden bg-white border border-blue-200 shadow-xl rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-white bg-gradient-to-r from-blue-600 to-indigo-700 text-sm">
                <tr>
                  {/* <th className="p-4 font-semibold text-left">Emp ID</th> */}
                  <th className="p-4 font-semibold text-left">Name</th>
                  <th className="p-4 font-semibold text-center">Present</th>
                  <th className="p-4 font-semibold text-center">Working</th>
                  <th className="p-4 font-semibold text-center">Half Days</th>
                  <th className="p-4 font-semibold text-center">WeekOff</th>
                  <th className="p-4 font-semibold text-center">Leaves</th>
                  <th className="p-4 font-semibold text-center">Salary</th>
                  <th className="p-4 font-semibold text-center">Month</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="p-8 text-center">
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
                    const dailyRate = calculateDailyRate(item);
                    const weekOffDays = item.weekOffs || 0;

                    return (
                      <tr
                        key={item._id || index}
                        className={`hover:bg-blue-50 transition duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        {/* Data cells with click handlers */}
                        {/* <td className="p-4 text-sm text-gray-900 cursor-pointer" onClick={() => handleAttendanceRowClick(item)}>
                          {item.employeeId}
                        </td> */}

                        <td className="p-4 cursor-pointer" onClick={() => handleAttendanceRowClick(item)}>
                          <div className="flex items-center">
                            <div className="flex items-center justify-center w-8 h-8 mr-3 font-semibold text-blue-800 bg-blue-100 rounded-full">
                              {item.name?.charAt(0) || 'U'}
                            </div>
                            <span className="text-sm text-gray-800">{item.name}</span>
                            {!hasSalaryData && (
                              <span className="px-2 py-1 ml-2 text-sm text-red-800 bg-red-100 rounded-full">No Salary Data</span>
                            )}
                          </div>
                        </td>

                        <td className="p-4 text-center cursor-pointer" onClick={() => handleAttendanceRowClick(item)}>
                          <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                            {item.presentDays || 0}
                          </span>
                        </td>

                        <td className="p-4 text-center cursor-pointer" onClick={() => handleAttendanceRowClick(item)}>
                          <span className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                            {item.totalWorkingDays || 0}
                          </span>
                        </td>

                        <td className="p-4 text-center cursor-pointer" onClick={() => handleAttendanceRowClick(item)}>
                          <span className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
                            {item.halfDayWorking || 0}
                          </span>
                        </td>

                        <td className="p-4 text-center cursor-pointer" onClick={() => handleAttendanceRowClick(item)}>
                          <span className="px-3 py-1 text-sm font-medium text-purple-800 bg-purple-100 rounded-full">
                            {weekOffDays}
                          </span>
                        </td>

                        <td className="p-4 text-center cursor-pointer" onClick={() => handleAttendanceRowClick(item)}>
                          <span className="px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">
                            {getLeaveTypes(item)}
                          </span>
                        </td>

                        <td className="p-4 font-semibold text-center cursor-pointer" onClick={() => handleAttendanceRowClick(item)}>
                          {hasSalaryData ? (
                            <div>
                              <div className="text-green-700">₹{calculatedSalary}</div>
                              <div className="text-xs text-gray-500">₹{dailyRate}/day</div>
                            </div>
                          ) : (
                            <span className="text-red-600">₹0</span>
                          )}
                        </td>

                        {/* <td className="p-4 text-center text-gray-600 cursor-pointer" onClick={() => handleAttendanceRowClick(item)}>
                          <div>
                            <div>{item.month || "-"}</div>
                            <div className="text-xs text-gray-500">{item.monthDays || monthDays} days</div>
                          </div>
                        </td> */}

                        <td
  className="p-4 text-center text-gray-600 cursor-pointer"
  onClick={() => handleAttendanceRowClick(item)}
>
  <div>
    <div className="font-medium">
      {item.month
        ? `${item.month.slice(2, 4)}-${item.month.slice(5, 7)}`
        : "-"}
    </div>
    <div className="text-xs text-gray-500">
      {item.monthDays || monthDays} days
    </div>
  </div>
</td>


                        
                        

                        {/* Actions cell */}
                        <td className="p-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleView(item)}
                              className="p-2 text-white transition duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
                              title="View Details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>

                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 text-white transition duration-200 bg-green-500 rounded-lg hover:bg-green-600"
                              title="Edit Salary"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>

                            <button
                              onClick={() => downloadInvoice(item)}
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
                    className={`px-4 py-2 rounded-lg border ${currentPage === 1
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
                        className={`px-4 py-2 rounded-lg border ${currentPage === pageNumber
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
                    className={`px-4 py-2 rounded-lg border ${currentPage === totalPages
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

      {/* View Modal */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10">
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

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
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
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-sm text-gray-600">Present Days</p>
                <p className="text-lg font-semibold text-green-600">{selectedEmployee.presentDays || 0}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-sm text-gray-600">Working Days</p>
                <p className="text-lg font-semibold text-blue-600">{selectedEmployee.totalWorkingDays || 0}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-sm text-gray-600">Half Days</p>
                <p className="text-lg font-semibold text-yellow-600">{selectedEmployee.halfDayWorking || 0}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-sm text-gray-600">WeekOff Days</p>
                <p className="text-lg font-semibold text-purple-600">{selectedEmployee.weekOffs || 0}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-sm text-gray-600">Month Days</p>
                <p className="text-lg font-semibold text-gray-800">{selectedEmployee.monthDays || monthDays}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-sm text-gray-600">Monthly Salary</p>
                <p className="text-lg font-semibold text-blue-600">₹{getEmployeeData(selectedEmployee).salaryPerMonth || 0}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-sm text-gray-600">Daily Rate</p>
                <p className="text-lg font-semibold text-gray-800">₹{calculateDailyRate(selectedEmployee)}/day</p>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-sm text-gray-600">Calculated Salary</p>
                <p className="text-lg font-semibold text-green-600">₹{calculateSalary(selectedEmployee)}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border col-span-2">
                <p className="text-sm text-gray-600">Approved Leaves</p>
                <p className="text font-semibold text-red-600">{getLeaveTypes(selectedEmployee)}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
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
            <div className="flex justify-between items-center mb-4">
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

            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Month:</strong> {selectedEmployee.month || selectedMonth || "Current Month"} |
                <strong> Days in Month:</strong> {selectedEmployee.monthDays || monthDays} |
                <strong> Monthly Salary:</strong> ₹{getEmployeeData(selectedEmployee).salaryPerMonth || 0}
              </p>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Present Days</label>
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
                  <label className="block text-sm font-medium mb-1 text-gray-700">Working Days</label>
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
                  <label className="block text-sm font-medium mb-1 text-gray-700">Half Days</label>
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
                  <label className="block text-sm font-medium mb-1 text-gray-700">Full Day Leaves</label>
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
                  <label className="block text-sm font-medium mb-1 text-gray-700">Daily Rate (₹)</label>
                  <input
                    type="text"
                    value={editFormData.dailyRate || calculateDailyRate(selectedEmployee)}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Calculated Salary (₹)</label>
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
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Extra Work & Adjustments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Extra Days</label>
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
                    <label className="block text-sm font-medium mb-1 text-gray-700">Bonus (₹)</label>
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
                    <label className="block text-sm font-medium mb-1 text-gray-700">Deductions (₹)</label>
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
                    <label className="block text-sm font-medium mb-1 text-gray-700">Reason</label>
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

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PayRoll;
