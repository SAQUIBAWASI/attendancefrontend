import React, { useEffect, useState } from "react";

const PayRoll = () => {
  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        const summaryData = data.summary || [];
        setRecords(summaryData);
        setFilteredRecords(summaryData);
      })
      .catch((err) => console.log("Error:", err));
  };

  // Filter records based on search term
  useEffect(() => {
    const filtered = records.filter(record =>
      record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeId?.toString().includes(searchTerm)
    );
    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchTerm, records]);

  // Calculate pagination
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

  // Edit functions
  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setEditFormData({
      presentDays: employee.presentDays,
      workingDays: employee.workingDays,
      halfDays: employee.halfDays,
      fullDayLeaves: employee.fullDayLeaves,
      calculatedSalary: employee.calculatedSalary
    });
    // Reset extra work data
    setExtraWorkData({
      extraDays: 0,
      extraHours: 0,
      overtimeRate: Math.round(employee.salaryPerMonth / (22 * employee.shiftHours) * 1.5), // 1.5x hourly rate
      bonus: 0,
      deductions: 0,
      reason: ""
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    
    // Calculate total salary with extra work
    const dailyRate = Math.round(selectedEmployee.salaryPerMonth / 22);
    const baseSalary = (editFormData.workingDays * dailyRate) + (editFormData.halfDays * dailyRate / 2);
    
    // Calculate overtime
    const hourlyRate = Math.round(selectedEmployee.salaryPerMonth / (22 * selectedEmployee.shiftHours));
    const overtimeAmount = extraWorkData.extraHours * extraWorkData.overtimeRate;
    const extraDaysAmount = extraWorkData.extraDays * dailyRate;
    
    const totalExtraAmount = overtimeAmount + extraDaysAmount + extraWorkData.bonus - extraWorkData.deductions;
    const finalSalary = baseSalary + totalExtraAmount;

    const updatedData = {
      ...editFormData,
      calculatedSalary: Math.round(finalSalary),
      extraWork: {
        extraDays: extraWorkData.extraDays,
        extraHours: extraWorkData.extraHours,
        overtimeRate: extraWorkData.overtimeRate,
        overtimeAmount: overtimeAmount,
        bonus: extraWorkData.bonus,
        deductions: extraWorkData.deductions,
        totalExtraAmount: totalExtraAmount,
        reason: extraWorkData.reason
      }
    };

    console.log("Updated data:", updatedData);
    
    // Update local state for demo
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

  // View details
  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  // Download Invoice as PDF
  const downloadInvoice = (employee) => {
    const invoiceContent = generateInvoiceHTML(employee);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
    printWindow.print();
  };

  const generateInvoiceHTML = (employee) => {
    const hasExtraWork = employee.extraWork && (
      employee.extraWork.extraDays > 0 || 
      employee.extraWork.extraHours > 0 || 
      employee.extraWork.bonus > 0 || 
      employee.extraWork.deductions > 0
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
                <tr>
                  <td>Basic Salary (${employee.workingDays} days)</td>
                  <td>${employee.workingDays}</td>
                  <td>₹${Math.round(employee.salaryPerMonth / 22)}/day</td>
                  <td>₹${Math.round(employee.workingDays * (employee.salaryPerMonth / 22))}</td>
                </tr>
                ${employee.halfDays > 0 ? `
                <tr>
                  <td>Half Days</td>
                  <td>${employee.halfDays}</td>
                  <td>₹${Math.round(employee.salaryPerMonth / 44)}/half-day</td>
                  <td>₹${Math.round(employee.halfDays * (employee.salaryPerMonth / 44))}</td>
                </tr>
                ` : ''}
                ${hasExtraWork ? `
                <tr class="extra-work-row">
                  <td colspan="4"><strong>Extra Work & Adjustments</strong></td>
                </tr>
                ${employee.extraWork.extraDays > 0 ? `
                <tr class="extra-work-row">
                  <td>Extra Working Days</td>
                  <td>${employee.extraWork.extraDays}</td>
                  <td>₹${Math.round(employee.salaryPerMonth / 22)}/day</td>
                  <td>₹${Math.round(employee.extraWork.extraDays * (employee.salaryPerMonth / 22))}</td>
                </tr>
                ` : ''}
                ${employee.extraWork.extraHours > 0 ? `
                <tr class="extra-work-row">
                  <td>Overtime Hours</td>
                  <td>${employee.extraWork.extraHours}</td>
                  <td>₹${employee.extraWork.overtimeRate}/hour</td>
                  <td>₹${employee.extraWork.overtimeAmount}</td>
                </tr>
                ` : ''}
                ${employee.extraWork.bonus > 0 ? `
                <tr class="extra-work-row">
                  <td>Performance Bonus</td>
                  <td>-</td>
                  <td>-</td>
                  <td>₹${employee.extraWork.bonus}</td>
                </tr>
                ` : ''}
                ${employee.extraWork.deductions > 0 ? `
                <tr class="extra-work-row">
                  <td>Deductions</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-₹${employee.extraWork.deductions}</td>
                </tr>
                ` : ''}
                ` : ''}
                <tr class="total-row">
                  <td colspan="3"><strong>Total Salary</strong></td>
                  <td><strong>₹${employee.calculatedSalary}</strong></td>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-blue-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Payroll Summary</h1>
              <p className="text-gray-600">Employee attendance and payroll overview</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition duration-200">
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Employees</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{filteredRecords.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm font-medium">Current Page</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{currentPage} / {totalPages}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm font-medium">Showing Records</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{currentRecords.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Records</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{filteredRecords.length}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <tr>
                  <th className="p-4 text-left font-semibold">Employee ID</th>
                  <th className="p-4 text-left font-semibold">Name</th>
                  <th className="p-4 text-center font-semibold">Present</th>
                  <th className="p-4 text-center font-semibold">Working Days</th>
                  <th className="p-4 text-center font-semibold">Half Days</th>
                  <th className="p-4 text-center font-semibold">Salary</th>
                  <th className="p-4 text-center font-semibold">Month</th>
                  <th className="p-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center">
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
                  currentRecords.map((item, index) => (
                    <tr 
                      key={item._id} 
                      className={`hover:bg-blue-50 transition duration-150 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="p-4 font-medium text-gray-900">{item.employeeId}</td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-semibold mr-3">
                            {item.name?.charAt(0) || 'U'}
                          </div>
                          <span className="font-medium text-gray-800">{item.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          {item.presentDays}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {item.workingDays}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                          {item.halfDays}
                        </span>
                      </td>
                      <td className="p-4 text-center font-semibold text-green-700">
                        ₹{item.calculatedSalary}
                      </td>
                      <td className="p-4 text-center text-gray-600">
                        {item.month || "-"}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleView(item)}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition duration-200"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition duration-200"
                            title="Edit Salary"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => downloadInvoice(item)}
                            className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg transition duration-200"
                            title="Download Invoice"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredRecords.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-semibold">{indexOfFirstRecord + 1}</span> to{" "}
                  <span className="font-semibold">
                    {Math.min(indexOfLastRecord, filteredRecords.length)}
                  </span>{" "}
                  of <span className="font-semibold">{filteredRecords.length}</span> results
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    Previous
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">Employee Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Basic Information</h4>
                  <p><span className="font-medium">Employee ID:</span> {selectedEmployee.employeeId}</p>
                  <p><span className="font-medium">Name:</span> {selectedEmployee.name}</p>
                  <p><span className="font-medium">Month:</span> {selectedEmployee.month}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Salary Information</h4>
                  <p><span className="font-medium">Monthly Salary:</span> ₹{selectedEmployee.salaryPerMonth}</p>
                  <p><span className="font-medium">Calculated Salary:</span> ₹{selectedEmployee.calculatedSalary}</p>
                  <p><span className="font-medium">Shift Hours:</span> {selectedEmployee.shiftHours} hrs/day</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Attendance Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Present Days:</span>
                      <span className="font-medium">{selectedEmployee.presentDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Working Days:</span>
                      <span className="font-medium text-green-600">{selectedEmployee.workingDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Half Days:</span>
                      <span className="font-medium text-yellow-600">{selectedEmployee.halfDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Full Day Leaves:</span>
                      <span className="font-medium text-red-600">{selectedEmployee.fullDayLeaves}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Late Days:</span>
                      <span className="font-medium text-orange-600">{selectedEmployee.lateDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Onsite Days:</span>
                      <span className="font-medium text-purple-600">{selectedEmployee.onsiteDays}</span>
                    </div>
                    {selectedEmployee.extraWork && selectedEmployee.extraWork.extraDays > 0 && (
                      <div className="flex justify-between">
                        <span>Extra Working Days:</span>
                        <span className="font-medium text-blue-600">{selectedEmployee.extraWork.extraDays}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Salary Calculation</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Daily Rate:</span>
                      <span>₹{Math.round(selectedEmployee.salaryPerMonth / 22)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Working Days Amount:</span>
                      <span>₹{Math.round(selectedEmployee.workingDays * (selectedEmployee.salaryPerMonth / 22))}</span>
                    </div>
                    {selectedEmployee.halfDays > 0 && (
                      <div className="flex justify-between">
                        <span>Half Days Amount:</span>
                        <span>₹{Math.round(selectedEmployee.halfDays * (selectedEmployee.salaryPerMonth / 44))}</span>
                      </div>
                    )}
                    {selectedEmployee.extraWork && (
                      <>
                        {selectedEmployee.extraWork.extraDays > 0 && (
                          <div className="flex justify-between">
                            <span>Extra Days Amount:</span>
                            <span>₹{Math.round(selectedEmployee.extraWork.extraDays * (selectedEmployee.salaryPerMonth / 22))}</span>
                          </div>
                        )}
                        {selectedEmployee.extraWork.overtimeAmount > 0 && (
                          <div className="flex justify-between">
                            <span>Overtime Amount:</span>
                            <span>₹{selectedEmployee.extraWork.overtimeAmount}</span>
                          </div>
                        )}
                        {selectedEmployee.extraWork.bonus > 0 && (
                          <div className="flex justify-between">
                            <span>Bonus:</span>
                            <span>₹{selectedEmployee.extraWork.bonus}</span>
                          </div>
                        )}
                        {selectedEmployee.extraWork.deductions > 0 && (
                          <div className="flex justify-between">
                            <span>Deductions:</span>
                            <span>-₹{selectedEmployee.extraWork.deductions}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex justify-between border-t border-gray-200 pt-2 font-bold">
                      <span>Total Salary:</span>
                      <span className="text-green-600">₹{selectedEmployee.calculatedSalary}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => downloadInvoice(selectedEmployee)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
                >
                  Download Invoice
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800">Edit Salary Details</h3>
              <p className="text-gray-600 mt-1">Update working days and salary for {selectedEmployee.name}</p>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="p-6">
                {/* Basic Attendance Section */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Basic Attendance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Present Days
                      </label>
                      <input
                        type="number"
                        name="presentDays"
                        value={editFormData.presentDays}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        max="31"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Working Days (Full Days)
                      </label>
                      <input
                        type="number"
                        name="workingDays"
                        value={editFormData.workingDays}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        max="31"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Half Days
                      </label>
                      <input
                        type="number"
                        name="halfDays"
                        value={editFormData.halfDays}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        max="31"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Day Leaves
                      </label>
                      <input
                        type="number"
                        name="fullDayLeaves"
                        value={editFormData.fullDayLeaves}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        max="31"
                      />
                    </div>
                  </div>
                </div>

                {/* Extra Work Section */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Extra Work & Adjustments</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Extra Working Days
                      </label>
                      <input
                        type="number"
                        name="extraDays"
                        value={extraWorkData.extraDays}
                        onChange={handleExtraWorkChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        min="0"
                        max="10"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Overtime Hours
                      </label>
                      <input
                        type="number"
                        name="extraHours"
                        value={extraWorkData.extraHours}
                        onChange={handleExtraWorkChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        min="0"
                        max="100"
                        step="0.5"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Overtime Rate (₹/hour)
                      </label>
                      <input
                        type="number"
                        name="overtimeRate"
                        value={extraWorkData.overtimeRate}
                        onChange={handleExtraWorkChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Performance Bonus (₹)
                      </label>
                      <input
                        type="number"
                        name="bonus"
                        value={extraWorkData.bonus}
                        onChange={handleExtraWorkChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deductions (₹)
                      </label>
                      <input
                        type="number"
                        name="deductions"
                        value={extraWorkData.deductions}
                        onChange={handleExtraWorkChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Extra Work/Adjustments
                    </label>
                    <textarea
                      name="reason"
                      value={extraWorkData.reason}
                      onChange={handleExtraWorkChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows="3"
                      placeholder="Enter reason for extra work, bonus, or deductions..."
                    />
                  </div>
                </div>

                {/* Salary Preview */}
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h4 className="text-lg font-semibold text-blue-800 mb-2">Salary Preview</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Base Salary:</span>
                      <span>₹{Math.round(editFormData.workingDays * (selectedEmployee.salaryPerMonth / 22) + (editFormData.halfDays * (selectedEmployee.salaryPerMonth / 44)))}</span>
                    </div>
                    {extraWorkData.extraDays > 0 && (
                      <div className="flex justify-between">
                        <span>Extra Days:</span>
                        <span>+ ₹{Math.round(extraWorkData.extraDays * (selectedEmployee.salaryPerMonth / 22))}</span>
                      </div>
                    )}
                    {extraWorkData.extraHours > 0 && (
                      <div className="flex justify-between">
                        <span>Overtime ({extraWorkData.extraHours} hrs):</span>
                        <span>+ ₹{Math.round(extraWorkData.extraHours * extraWorkData.overtimeRate)}</span>
                      </div>
                    )}
                    {extraWorkData.bonus > 0 && (
                      <div className="flex justify-between">
                        <span>Bonus:</span>
                        <span>+ ₹{extraWorkData.bonus}</span>
                      </div>
                    )}
                    {extraWorkData.deductions > 0 && (
                      <div className="flex justify-between">
                        <span>Deductions:</span>
                        <span>- ₹{extraWorkData.deductions}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-blue-200 pt-2 font-bold text-blue-800">
                      <span>Total Salary:</span>
                      <span>₹{Math.round(
                        (editFormData.workingDays * (selectedEmployee.salaryPerMonth / 22)) + 
                        (editFormData.halfDays * (selectedEmployee.salaryPerMonth / 44)) +
                        (extraWorkData.extraDays * (selectedEmployee.salaryPerMonth / 22)) +
                        (extraWorkData.extraHours * extraWorkData.overtimeRate) +
                        extraWorkData.bonus -
                        extraWorkData.deductions
                      )}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
                  >
                    Update Salary
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayRoll;