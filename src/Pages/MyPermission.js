import axios from "axios";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaPlus, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, API_DOMAIN } from "../config";

const BASE_URL = API_DOMAIN;

const EmployeePermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [filteredPermissions, setFilteredPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [position, setPosition] = useState(null);
  const [submittingDuty, setSubmittingDuty] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [permissionForm, setPermissionForm] = useState({ reason: "", duration: "" });
  const [permissionLoading, setPermissionLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const navigate = useNavigate();

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error("Location error:", err),
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  useEffect(() => {
    const employeeDataRaw = localStorage.getItem("employeeData");
    if (!employeeDataRaw) {
      setError("❌ Employee data not found in localStorage.");
      setLoading(false);
      return;
    }

    let employeeId;
    try {
      employeeId = JSON.parse(employeeDataRaw).employeeId;
    } catch {
      setError("❌ Invalid employee data.");
      setLoading(false);
      return;
    }

    const fetchPermissions = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/permissions/my-permissions/${employeeId}`
        );
        if (Array.isArray(res.data)) {
          // Sort newest first
          const sorted = [...res.data].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setPermissions(sorted);
          setFilteredPermissions(sorted);
        } else {
          setError("❌ Unexpected API response format.");
        }
      } catch (err) {
        setError("❌ Failed to fetch permissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = permissions;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.reason?.toLowerCase().includes(term) ||
          p.status?.toLowerCase().includes(term)
      );
    }

    if (selectedDate) {
      filtered = filtered.filter((p) => {
        const d = new Date(p.createdAt).toISOString().split("T")[0];
        return d === selectedDate;
      });
    }

    if (selectedMonth) {
      const [year, monthNum] = selectedMonth.split("-").map(Number);
      filtered = filtered.filter((p) => {
        const d = new Date(p.createdAt);
        return d.getFullYear() === year && d.getMonth() + 1 === monthNum;
      });
    }

    setFilteredPermissions(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedDate, selectedMonth, permissions]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDate("");
    setSelectedMonth("");
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedMonth("");
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    setSelectedDate("");
  };

  const handleBackToDuty = async (permissionId) => {
    if (!position) {
      fetchLocation();
      return alert("Please allow location access and try again!");
    }
    try {
      setSubmittingDuty(true);
      const res = await axios.put(
        `${BASE_URL}api/permissions/back-to-duty/${permissionId}`,
        { lat: position.lat, lng: position.lng }
      );
      if (res.data) {
        alert(
          `✅ Back to Duty Successful! \nDistance check: ${res.data.locationCheck?.distance}`
        );
        window.location.reload();
      }
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingDuty(false);
    }
  };

  const handlePermissionSubmit = async (e) => {
    e.preventDefault();
    setPermissionLoading(true);

    const rawData = localStorage.getItem("employeeData");
    let employeeData = null;
    try {
      if (rawData) employeeData = JSON.parse(rawData);
    } catch (e) { }

    const id =
      employeeData?.employeeId || localStorage.getItem("employeeId");
    const name =
      employeeData?.name ||
      localStorage.getItem("employeeName") ||
      "Employee";
    const durationNum = parseInt(permissionForm.duration);

    if (!id) {
      alert("❌ Employee ID not found. Please log out and log in again.");
      setPermissionLoading(false);
      return;
    }
    if (!permissionForm.reason || isNaN(durationNum)) {
      alert("❌ Please provide a valid reason and duration.");
      setPermissionLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}api/permissions/request`, {
        employeeId: id,
        employeeName: name,
        reason: permissionForm.reason,
        duration: durationNum,
      });
      if (res.status === 201) {
        alert("✅ Permission Requested Successfully!");
        setIsPermissionModalOpen(false);
        setPermissionForm({ reason: "", duration: "" });
        window.location.reload();
      }
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || err.message));
    } finally {
      setPermissionLoading(false);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredPermissions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPermissions.length / itemsPerPage);

  const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const handlePageClick = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
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

  // Stat Card
  const StatCard = ({ label, color }) => (
    <div className="overflow-hidden bg-white shadow-sm rounded-xl">
      <div className={`h-1 ${color}`}></div>
      <div className="p-3 text-center sm:p-4">
        <div className="text-[10px] font-medium text-gray-700 sm:text-xs">{label}</div>
      </div>
    </div>
  );

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-700">Loading your permission records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
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
    <div className="min-h-screen px-2 py-2 bg-gradient-to-br from-purple-50 to-blue-100 sm:px-3 sm:py-3">
      <div className="mx-auto max-w-9xl">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-2 mb-3 sm:grid-cols-4">
          <StatCard label={`Total: ${permissions.length}`} color="bg-blue-500" />
          <StatCard
            label={`Approved: ${permissions.filter((p) => p.status === "APPROVED").length}`}
            color="bg-green-500"
          />
          <StatCard
            label={`Pending: ${permissions.filter((p) => p.status === "PENDING").length}`}
            color="bg-yellow-500"
          />
          <StatCard
            label={`Completed: ${permissions.filter((p) => p.status === "COMPLETED").length}`}
            color="bg-purple-500"
          />
        </div>

        {/* Filters Section */}
        <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">

            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <FaSearch className="absolute text-sm text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="text"
                placeholder="Search by reason or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date Filter */}
            <div className="relative w-[130px]">
              <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Month Filter */}
            <div className="relative w-[130px]">
              <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Request Permission Button */}
            <button
              onClick={() => setIsPermissionModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <FaPlus className="text-xs" /> Request Permission
            </button>

            {/* Clear Filters */}
            {(searchTerm || selectedDate || selectedMonth) && (
              <button
                onClick={clearFilters}
                className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
            <span>
              Showing <strong>{filteredPermissions.length}</strong> of{" "}
              <strong>{permissions.length}</strong> records
            </span>
            {filteredPermissions.length !== permissions.length && (
              <span className="font-semibold text-orange-600">🔍 Filters applied</span>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl">
          {filteredPermissions.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mb-4 text-6xl">📭</div>
              <p className="mb-4 text-lg font-semibold text-gray-600">
                {permissions.length === 0
                  ? "No permission records found."
                  : "No records match your filters."}
              </p>
              {permissions.length > 0 && (
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
                <table className="min-w-full">
                  <thead className="text-xs text-left text-white sm:text-sm bg-gradient-to-r from-green-500 to-blue-600">
                    <tr>
                      <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Date</th>
                      <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Duration (mins)</th>
                      <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Reason</th>
                      <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Status</th>
                      <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentRecords.map((p, index) => (
                      <tr
                        key={p._id || index}
                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-blue-50 transition duration-150`}
                      >
                        <td className="px-2 py-1.5 text-center text-xs sm:text-sm">
                          {formatDate(p.createdAt)}
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                            {p.duration} min
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-center max-w-[180px]">
                          <span className="text-xs text-gray-700 truncate block">
                            {p.reason}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${p.status === "APPROVED"
                              ? "bg-green-100 text-green-800 border border-green-300"
                              : p.status === "REJECTED"
                                ? "bg-red-100 text-red-800 border border-red-300"
                                : p.status === "COMPLETED"
                                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                                  : "bg-yellow-100 text-yellow-800 border border-yellow-300 animate-pulse"
                              }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          {p.status === "APPROVED" && (
                            <button
                              onClick={() => handleBackToDuty(p._id)}
                              disabled={submittingDuty}
                              className="px-3 py-1 text-xs font-bold text-white transition bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50"
                            >
                              {submittingDuty ? "..." : "Back To Duty"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredPermissions.length > 0 && (
                <div className="flex flex-col items-center justify-between gap-4 px-4 py-3 border-t border-gray-200 sm:flex-row">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-gray-700">Show:</label>
                      <select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="p-1 text-xs border rounded-lg"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-xs text-gray-600">entries</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Showing{" "}
                      <strong>
                        {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredPermissions.length)}
                      </strong>{" "}
                      of <strong>{filteredPermissions.length}</strong> records
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${currentPage === 1
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                        }`}
                    >
                      ← Prev
                    </button>

                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === "number" && handlePageClick(page)}
                        disabled={page === "..."}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition min-w-[28px] ${page === "..."
                          ? "bg-gray-200 text-gray-500 cursor-default"
                          : currentPage === page
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${currentPage === totalPages
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

      {/* Permission Request Modal */}
      {isPermissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-xl sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 sm:text-xl">Request Permission</h3>
              <button
                onClick={() => setIsPermissionModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handlePermissionSubmit} className="space-y-3">
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700">Reason</label>
                <textarea
                  required
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  value={permissionForm.reason}
                  onChange={(e) => setPermissionForm({ ...permissionForm, reason: e.target.value })}
                  placeholder="Why do you need permission?"
                ></textarea>
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700">Duration (minutes)</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={permissionForm.duration}
                  onChange={(e) => setPermissionForm({ ...permissionForm, duration: e.target.value })}
                  placeholder="e.g. 30"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPermissionModalOpen(false)}
                  className="flex-1 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={permissionLoading}
                  className="flex-1 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {permissionLoading ? "Submitting..." : "Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePermissions;
