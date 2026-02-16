// src/pages/MyAttendance.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


const BASE_URL = "https://api.timelyhealth.in";

export default function MyAttendance() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search and Filter States
  const [searchDate, setSearchDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [onsiteFilter, setOnsiteFilter] = useState("all");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const employeeData = JSON.parse(localStorage.getItem("employeeData"));
        const employeeId = employeeData?.employeeId;

        if (!employeeId) {
          setError("❌ Employee ID not found. Please log in again.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${BASE_URL}/api/attendance/myattendance/${employeeId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch attendance");

        // Sort records by checkInTime descending (newest first)
        const sortedRecords = (data.records || []).sort((a, b) =>
          new Date(b.checkInTime) - new Date(a.checkInTime)
        );

        setRecords(sortedRecords);
        setFilteredRecords(sortedRecords);
      } catch (err) {
        console.error("Attendance fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = records;

    // Date filter
    if (searchDate) {
      filtered = filtered.filter(rec => {
        const recordDate = new Date(rec.checkInTime || rec.createdAt).toLocaleDateString();
        const searchDateObj = new Date(searchDate).toLocaleDateString();
        return recordDate === searchDateObj;
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(rec => rec.status === statusFilter);
    }

    // Onsite filter
    if (onsiteFilter !== "all") {
      filtered = filtered.filter(rec =>
        onsiteFilter === "yes" ? rec.onsite : !rec.onsite
      );
    }

    setFilteredRecords(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchDate, statusFilter, onsiteFilter, records]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  // CSV Data
  const csvData = filteredRecords.map((rec) => ({
    Date: new Date(rec.checkInTime || rec.createdAt).toLocaleDateString(),
    "Check In": rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : "-",
    "Check Out": rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : "-",
    "Total Hours": rec.totalHours ? rec.totalHours.toFixed(2) : "0.00",
    "Distance (m)": rec.distance ? rec.distance.toFixed(2) : "0.00",
    Onsite: rec.onsite ? "Yes" : "No",
    Reason: rec.reason || "Not specified",
    Status: rec.status,
  }));

  // Clear all filters
  const clearFilters = () => {
    setSearchDate("");
    setStatusFilter("all");
    setOnsiteFilter("all");
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Main Section */}
      <div className="flex flex-col flex-1">


        <div className="flex items-start justify-center flex-1 p-4 sm:p-6 lg:p-8">
          <div className="w-full p-4 bg-white shadow-xl max-w-7xl rounded-2xl sm:p-6 lg:p-8">
            {/* Header Section */}
            {/* <div className="flex flex-col items-start justify-between gap-4 mb-6 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-2xl font-extrabold text-transparent sm:text-3xl bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">
                  📅 My Attendance Records
                </h2>
                <p className="mt-1 text-gray-600">View and manage your attendance history</p>
              </div>

              <div className="flex flex-col w-full gap-3 sm:flex-row lg:w-auto">
             

                <CSVLink
                  data={csvData}
                  filename={`my_attendance_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-center text-white transition bg-green-600 rounded-lg hover:bg-green-700"
                >
                  ⬇ Download CSV
                </CSVLink>
              </div>
            </div> */}

            {/* Search and Filter Section */}
            <div className="p-4 mb-6 border border-blue-200 bg-blue-50 rounded-xl">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Date Search */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-blue-800">
                    📅 Search by Date
                  </label>
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-blue-800">
                    📊 Status Filter
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="checked-in">Checked In</option>
                    <option value="checked-out">Checked Out</option>
                  </select>
                </div>

                {/* Onsite Filter */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-blue-800">
                    🏢 Onsite Filter
                  </label>
                  <select
                    value={onsiteFilter}
                    onChange={(e) => setOnsiteFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Locations</option>
                    <option value="yes">Onsite Only</option>
                    <option value="no">Remote Only</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 text-sm font-semibold text-white transition bg-gray-600 rounded-lg hover:bg-gray-700"
                  >
                    🗑️ Clear Filters
                  </button>
                </div>
              </div>

              {/* Results Count */}
              <div className="flex flex-col items-center justify-between mt-4 text-sm text-blue-700 sm:flex-row">
                <span>
                  Showing <strong>{filteredRecords.length}</strong> of <strong>{records.length}</strong> records
                </span>
                {filteredRecords.length !== records.length && (
                  <span className="font-semibold text-orange-600">
                    🔍 Filters applied
                  </span>
                )}
              </div>
            </div>

            {/* Loading / Error / No Data */}
            {loading ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 mx-auto border-b-2 border-green-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-lg text-gray-600">Loading your attendance records...</p>
              </div>
            ) : error ? (
              <div className="py-8 text-center border border-red-200 rounded-lg bg-red-50">
                <p className="text-lg font-semibold text-red-600">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 mt-4 text-white transition bg-red-600 rounded-lg hover:bg-red-700"
                >
                  🔄 Retry
                </button>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="py-12 text-center border border-yellow-200 rounded-lg bg-yellow-50">
                <p className="text-lg font-semibold text-yellow-700">
                  {records.length === 0 ? "No attendance records found." : "No records match your filters."}
                </p>
                {records.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2 mt-4 text-white transition bg-yellow-600 rounded-lg hover:bg-yellow-700"
                  >
                    🔄 Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Table */}
                <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                  <table className="min-w-full">
                    <thead className="text-sm text-left text-white bg-gradient-to-r from-purple-500 to-blue-600">
                      <tr>
                        <th className="px-4 py-2 font-semibold text-left">Date</th>
                        <th className="px-4 py-2 font-semibold text-left">Check-In Time</th>
                        <th className="px-4 py-2 font-semibold text-left">Check-Out Time</th>
                        <th className="px-4 py-2 font-semibold text-left">Total Hours</th>
                        <th className="px-4 py-2 font-semibold text-left">Distance (m)</th>
                        <th className="px-4 py-2 font-semibold text-left">Onsite</th>
                        <th className="px-4 py-2 font-semibold text-left">Reason</th>
                        <th className="px-4 py-2 font-semibold text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRecords.map((rec, idx) => (
                        <tr
                          key={rec._id || idx}
                          className={`border-t transition-all duration-200 ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                            } hover:bg-green-50 hover:shadow-sm`}
                        >
                          <td className="px-4 py-2 font-medium text-gray-900">
                            {formatDate(rec.checkInTime || rec.createdAt)}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-green-600">🟢</span>
                              {formatTime(rec.checkInTime)}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-red-600">🔴</span>
                              {formatTime(rec.checkOutTime)}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <span className={`font-semibold ${rec.totalHours >= 8 ? 'text-green-600' :
                              rec.totalHours >= 4 ? 'text-orange-600' : 'text-red-600'
                              }`}>
                              {rec.totalHours ? rec.totalHours.toFixed(2) : "0.00"}h
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className="font-mono text-gray-700">
                              {rec.distance?.toFixed(0) || "0"}m
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${rec.onsite
                                ? "bg-green-200 text-green-800 border border-green-300"
                                : "bg-red-200 text-red-800 border border-red-300"
                                }`}
                            >
                              {rec.onsite ? "🏢 Yes" : "🏠 No"}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 text-sm text-gray-700 bg-gray-100 rounded">
                              {rec.reason || "Not specified"}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${rec.status === "checked-in"
                                ? "bg-blue-200 text-blue-800 border border-blue-300"
                                : "bg-purple-200 text-purple-800 border border-purple-300"
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
                  <div className="flex flex-col items-center justify-between gap-2 mt-4 sm:flex-row">
                    <div className="text-sm text-gray-600">
                      Showing <strong>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRecords.length)}</strong> of{" "}
                      <strong>{filteredRecords.length}</strong> records
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-2 py-1 rounded-lg transition ${currentPage === 1
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
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
                              className={`px-2 py-2 rounded-lg transition ${currentPage === pageNum
                                ? "bg-green-600 text-white font-semibold"
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
                        className={`px-2 py-1 rounded-lg transition ${currentPage === totalPages
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6 text-center md:grid-cols-4">
                  <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="text-2xl font-bold text-blue-600">{records.length}</div>
                    <div className="text-sm text-blue-800">Total Records</div>
                  </div>
                  <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <div className="text-2xl font-bold text-green-600">
                      {records.filter(r => r.onsite).length}
                    </div>
                    <div className="text-sm text-green-800">Onsite Days</div>
                  </div>
                  <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                    <div className="text-2xl font-bold text-orange-600">
                      {records.filter(r => r.status === 'checked-in').length}
                    </div>
                    <div className="text-sm text-orange-800">Checked In</div>
                  </div>
                  <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                    <div className="text-2xl font-bold text-purple-600">
                      {records.filter(r => r.totalHours >= 8).length}
                    </div>
                    <div className="text-sm text-purple-800">Full Days</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}