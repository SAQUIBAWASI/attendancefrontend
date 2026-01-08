
import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5000";

export default function AttendanceList() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchAllAttendance = async () => {
      try {
        // Fetch employees first to check their status
        const empRes = await fetch("http://localhost:5000/api/employees/get-employees");
        const employees = empRes.ok ? await empRes.json() : [];

        const res = await fetch(`${BASE_URL}/api/attendance/allattendance`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch attendance");

        // Sort by checkInTime descending (newest first)
        const sortedRecords = (data.records || []).sort((a, b) =>
          new Date(b.checkInTime) - new Date(a.checkInTime)
        );

        // List of inactive employee IDs to hide
        const INACTIVE_EMPLOYEE_IDS = ['EMP002', 'EMP003', 'EMP004', 'EMP008', 'EMP010', 'EMP018', 'EMP019'];

        // Filter out inactive employees
        const activeRecords = sortedRecords.filter(rec => {
          const empId = rec.employeeId;
          const employee = employees.find(e => e.employeeId === empId || e._id === empId);

          if (employee?.status === 'inactive') return false;
          if (employee?.status === 'active') return true;

          return !INACTIVE_EMPLOYEE_IDS.includes(empId);
        });

        setRecords(activeRecords);
        setFilteredRecords(activeRecords);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllAttendance();
  }, []);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  // ✅ Date filter
  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedMonth(""); // reset month filter when using date
    setCurrentPage(1); // Reset to first page

    if (!date) {
      setFilteredRecords(records);
      return;
    }

    const filtered = records.filter((rec) => {
      const checkInDate = new Date(rec.checkInTime).toISOString().split("T")[0];
      return checkInDate === date;
    });
    setFilteredRecords(filtered);
  };

  // ✅ Month filter (e.g. 2025-10)
  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setSelectedDate(""); // reset date filter when using month
    setCurrentPage(1); // Reset to first page

    if (!month) {
      setFilteredRecords(records);
      return;
    }

    const [year, monthNum] = month.split("-");
    const filtered = records.filter((rec) => {
      const d = new Date(rec.checkInTime);
      return (
        d.getFullYear() === parseInt(year) &&
        d.getMonth() + 1 === parseInt(monthNum)
      );
    });

    setFilteredRecords(filtered);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedDate("");
    setSelectedMonth("");
    setFilteredRecords(records);
    setCurrentPage(1);
  };

  // ✅ Download CSV function
  const downloadCSV = () => {
    if (filteredRecords.length === 0) {
      alert("No data available to download!");
      return;
    }

    const headers = [
      "Employee ID",
      "Email",
      "Check-In Time",
      "Check-Out Time",
      "Total Hours",
      "Distance (m)",
      "Onsite",
      "Reason",
      "Status"
    ];

    const csvRows = [
      headers.join(","), // Header row
      ...filteredRecords.map((rec) =>
        [
          `"${rec.employeeId}"`,
          `"${rec.employeeEmail}"`,
          `"${rec.checkInTime ? new Date(rec.checkInTime).toLocaleString() : "-"}"`,
          `"${rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleString() : "-"}"`,
          rec.totalHours?.toFixed(2) || "0.00",
          rec.distance?.toFixed(2) || "0.00",
          rec.onsite ? "Yes" : "No",
          `"${rec.reason || "Not specified"}"`,
          rec.status
        ].join(",")
      ),
    ];

    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_records_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-700">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md p-8 text-center bg-white border border-red-200 shadow-lg rounded-2xl">
          <div className="mb-4 text-4xl text-red-500">❌</div>
          <p className="mb-4 text-lg font-semibold text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 font-semibold text-white transition bg-red-600 rounded-lg hover:bg-red-700"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-9xl">

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-4">
          <div className="p-6 text-center bg-white border border-blue-200 shadow-lg rounded-2xl">
            <div className="text-3xl font-bold text-blue-600">{records.length}</div>
            <div className="font-semibold text-blue-800">Total Records</div>
          </div>
          <div className="p-6 text-center bg-white border border-green-200 shadow-lg rounded-2xl">
            <div className="text-3xl font-bold text-green-600">
              {records.filter(r => r.onsite).length}
            </div>
            <div className="font-semibold text-green-800">Onsite Entries</div>
          </div>
          <div className="p-6 text-center bg-white border border-orange-200 shadow-lg rounded-2xl">
            <div className="text-3xl font-bold text-orange-600">
              {records.filter(r => r.status === 'checked-in').length}
            </div>
            <div className="font-semibold text-orange-800">Checked In</div>
          </div>
          <div className="p-6 text-center bg-white border border-purple-200 shadow-lg rounded-2xl">
            <div className="text-3xl font-bold text-purple-600">
              {filteredRecords.length}
            </div>
            <div className="font-semibold text-purple-800">Filtered Records</div>
          </div>
        </div> */}
        <div className="grid grid-cols-2 gap-2 mb-4 md:grid-cols-4">
          <div className="p-3 text-center bg-white border rounded-lg shadow-sm">
            <div className="text-lg font-semibold text-blue-600">
              {records.length}
            </div>
            <div className="text-[11px] text-gray-500">
              Total
            </div>
          </div>

          <div className="p-3 text-center bg-white border rounded-lg shadow-sm">
            <div className="text-lg font-semibold text-green-600">
              {records.filter(r => r.onsite).length}
            </div>
            <div className="text-[11px] text-gray-500">
              Onsite
            </div>
          </div>

          <div className="p-3 text-center bg-white border rounded-lg shadow-sm">
            <div className="text-lg font-semibold text-orange-600">
              {records.filter(r => r.status === "checked-in").length}
            </div>
            <div className="text-[11px] text-gray-500">
              Checked In
            </div>
          </div>

          <div className="p-3 text-center bg-white border rounded-lg shadow-sm">
            <div className="text-lg font-semibold text-purple-600">
              {filteredRecords.length}
            </div>
            <div className="text-[11px] text-gray-500">
              Filtered
            </div>
          </div>
        </div>


        {/* Filters Section */}
        {/* <div className="p-6 mb-8 bg-white border border-gray-200 shadow-lg rounded-2xl">
          <div className="flex flex-col items-start justify-between gap-6 mb-4 lg:flex-row lg:items-center">
            <div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">🔍 Filter Records</h3>
              <p className="text-gray-600">Filter by specific date or month</p>
            </div>
            
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:from-green-600 hover:to-emerald-700"
              >
                📥 Download CSV
              </button>
              
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl hover:from-gray-600 hover:to-gray-700"
              >
                🗑️ Clear Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-2 text-sm font-semibold text-blue-700">
                📅 Filter by Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full p-3 transition border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-purple-700">
                📆 Filter by Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="w-full p-3 transition border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-end">
              <div className="w-full p-3 border-2 border-blue-100 bg-blue-50 rounded-xl">
                <p className="text-sm font-semibold text-blue-700">
                  Showing {filteredRecords.length} of {records.length} records
                </p>
                {(selectedDate || selectedMonth) && (
                  <p className="mt-1 text-xs text-orange-600">
                    🔍 Filters applied
                  </p>
                )}
              </div>
            </div>
          </div>
        </div> */}

        <div className="px-4 py-3 mb-4 bg-white border rounded-lg shadow-sm">
          <div className="grid items-end grid-cols-1 gap-3 sm:grid-cols-5">

            {/* Title */}
            <div className="sm:col-span-2">
              <h3 className="text-sm font-semibold text-gray-800">
                Filter Records
              </h3>
              <p className="text-xs text-gray-500">
                Filter by date or month
              </p>
            </div>

            {/* Date */}
            <div>
              <label className="block mb-1 text-[11px] text-gray-600">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full px-2 py-1.5 text-xs border rounded-md"
              />
            </div>

            {/* Month */}
            <div>
              <label className="block mb-1 text-[11px] text-gray-600">
                Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="w-full px-2 py-1.5 text-xs border rounded-md"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={downloadCSV}
                className="px-3 py-1.5 text-xs text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                CSV
              </button>

              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-xs text-white bg-gray-600 rounded-md hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-2 text-xs text-gray-600">
            Showing <span className="font-medium">{filteredRecords.length}</span> /{" "}
            <span className="font-medium">{records.length}</span>
            {(selectedDate || selectedMonth) && (
              <span className="ml-2 text-orange-600">• Filters applied</span>
            )}
          </div>
        </div>


        {/* Table Section */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl">
          {filteredRecords.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mb-4 text-6xl">📭</div>
              <p className="mb-4 text-lg font-semibold text-gray-600">
                {records.length === 0 ? "No attendance records found." : "No records match your filters."}
              </p>
              {records.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  🔄 Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-white bg-gradient-to-r from-blue-500 to-purple-600">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-left">Employee</th>
                      <th className="px-6 py-4 font-semibold text-left">Date</th>
                      <th className="px-6 py-4 font-semibold text-left">Check-In</th>
                      <th className="px-6 py-4 font-semibold text-left">Check-Out</th>
                      <th className="px-6 py-4 font-semibold text-left">Hours</th>
                      <th className="px-6 py-4 font-semibold text-left">Distance</th>
                      <th className="px-6 py-4 font-semibold text-left">Onsite</th>
                      <th className="px-6 py-4 font-semibold text-left">Reason</th>
                      <th className="px-6 py-4 font-semibold text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((rec, idx) => (
                      <tr
                        key={rec._id}
                        className={`border-t transition-all duration-200 ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } hover:bg-blue-50 hover:shadow-sm`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-gray-900">{rec.employeeId}</div>
                            <div className="text-xs text-gray-500 truncate max-w-[150px]">
                              {rec.employeeEmail}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {formatDate(rec.checkInTime)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg text-green-600">🟢</span>
                            <div>
                              <div className="font-semibold">{formatTime(rec.checkInTime)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg text-red-600">🔴</span>
                            <div>
                              <div className="font-semibold">
                                {rec.checkOutTime ? formatTime(rec.checkOutTime) : "-"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold text-lg ${rec.totalHours >= 8 ? 'text-green-600' :
                            rec.totalHours >= 4 ? 'text-orange-600' : 'text-red-600'
                            }`}>
                            {rec.totalHours ? rec.totalHours.toFixed(1) : "0.0"}h
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 font-mono text-gray-700 bg-gray-100 rounded">
                            {rec.distance?.toFixed(0) || "0"}m
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${rec.onsite
                              ? "bg-green-100 text-green-800 border border-green-300"
                              : "bg-red-100 text-red-800 border border-red-300"
                              }`}
                          >
                            {rec.onsite ? "🏢 Yes" : "🏠 No"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded max-w-[120px] truncate block">
                            {rec.reason || "Not specified"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${rec.status === "checked-in"
                              ? "bg-blue-100 text-blue-800 border border-blue-300"
                              : "bg-purple-100 text-purple-800 border border-purple-300"
                              }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center justify-between gap-4 p-6 border-t sm:flex-row bg-gray-50">
                  <div className="text-sm text-gray-600">
                    Showing <strong>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRecords.length)}</strong> of{" "}
                    <strong>{filteredRecords.length}</strong> records
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg transition font-semibold ${currentPage === 1
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                        }`}
                    >
                      ← Previous
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 rounded-lg transition font-semibold ${currentPage === pageNum
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg transition font-semibold ${currentPage === totalPages
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                        }`}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}