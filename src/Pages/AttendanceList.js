
import { useEffect, useState } from "react";

const BASE_URL = "https://attendancebackend-5cgn.onrender.com";

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
        const res = await fetch(`${BASE_URL}/api/attendance/allattendance`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch attendance");

        // Sort by checkInTime descending (newest first)
        const sortedRecords = (data.records || []).sort((a, b) => 
          new Date(b.checkInTime) - new Date(a.checkInTime)
        );
        
        setRecords(sortedRecords);
        setFilteredRecords(sortedRecords);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-semibold">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-red-200 max-w-md">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <p className="text-red-600 text-lg font-semibold mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
            📊 All Employee Attendance
          </h1>
          <p className="text-gray-600 text-lg">
            Monitor and manage employee attendance records
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-200 text-center">
            <div className="text-3xl font-bold text-blue-600">{records.length}</div>
            <div className="text-blue-800 font-semibold">Total Records</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200 text-center">
            <div className="text-3xl font-bold text-green-600">
              {records.filter(r => r.onsite).length}
            </div>
            <div className="text-green-800 font-semibold">Onsite Entries</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-200 text-center">
            <div className="text-3xl font-bold text-orange-600">
              {records.filter(r => r.status === 'checked-in').length}
            </div>
            <div className="text-orange-800 font-semibold">Checked In</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-200 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {filteredRecords.length}
            </div>
            <div className="text-purple-800 font-semibold">Filtered Records</div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">🔍 Filter Records</h3>
              <p className="text-gray-600">Filter by specific date or month</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={downloadCSV}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition font-semibold flex items-center gap-2 shadow-lg"
              >
                📥 Download CSV
              </button>
              
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition font-semibold flex items-center gap-2"
              >
                🗑️ Clear Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 text-sm font-semibold text-blue-700">
                📅 Filter by Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full p-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
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
                className="w-full p-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            <div className="flex items-end">
              <div className="w-full bg-blue-50 p-3 rounded-xl border-2 border-blue-100">
                <p className="text-sm text-blue-700 font-semibold">
                  Showing {filteredRecords.length} of {records.length} records
                </p>
                {(selectedDate || selectedMonth) && (
                  <p className="text-xs text-orange-600 mt-1">
                    🔍 Filters applied
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600 text-lg font-semibold mb-4">
                {records.length === 0 ? "No attendance records found." : "No records match your filters."}
              </p>
              {records.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  🔄 Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Employee</th>
                      <th className="px-6 py-4 text-left font-semibold">Date</th>
                      <th className="px-6 py-4 text-left font-semibold">Check-In</th>
                      <th className="px-6 py-4 text-left font-semibold">Check-Out</th>
                      <th className="px-6 py-4 text-left font-semibold">Hours</th>
                      <th className="px-6 py-4 text-left font-semibold">Distance</th>
                      <th className="px-6 py-4 text-left font-semibold">Onsite</th>
                      <th className="px-6 py-4 text-left font-semibold">Reason</th>
                      <th className="px-6 py-4 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((rec, idx) => (
                      <tr
                        key={rec._id}
                        className={`border-t transition-all duration-200 ${
                          idx % 2 === 0 ? "bg-gray-50" : "bg-white"
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
                            <span className="text-green-600 text-lg">🟢</span>
                            <div>
                              <div className="font-semibold">{formatTime(rec.checkInTime)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-red-600 text-lg">🔴</span>
                            <div>
                              <div className="font-semibold">
                                {rec.checkOutTime ? formatTime(rec.checkOutTime) : "-"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold text-lg ${
                            rec.totalHours >= 8 ? 'text-green-600' : 
                            rec.totalHours >= 4 ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {rec.totalHours ? rec.totalHours.toFixed(1) : "0.0"}h
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                            {rec.distance?.toFixed(0) || "0"}m
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              rec.onsite
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
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              rec.status === "checked-in"
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
                <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-t bg-gray-50 gap-4">
                  <div className="text-sm text-gray-600">
                    Showing <strong>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRecords.length)}</strong> of{" "}
                    <strong>{filteredRecords.length}</strong> records
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg transition font-semibold ${
                        currentPage === 1
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
                            className={`px-3 py-2 rounded-lg transition font-semibold ${
                              currentPage === pageNum
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
                      className={`px-4 py-2 rounded-lg transition font-semibold ${
                        currentPage === totalPages
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