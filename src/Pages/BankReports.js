import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { FaDownload, FaSearch } from "react-icons/fa";
import CountUp from "react-countup";
import { API_BASE_URL } from "../config";

const BankReports = () => {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");

  // Dropdown options
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

  const handleItemsPerPageChange = (limit) => {
    setPagination((prev) => ({ ...prev, limit: Number(limit), currentPage: 1 }));
  };

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/candidate/all-documents`);
      const docs = res.data?.data || res.data || [];

      // Keep only records with bank details
      const withBank = docs.filter(
        (row) => row.documents?.bankDetails?.bankName
      );

      const enriched = withBank.map((row) => {
        const candidateObj =
          row.candidateId && typeof row.candidateId === "object"
            ? row.candidateId
            : null;
        return {
          _id: row._id,
          name: candidateObj?.name || row.candidateName || row.name || "Unknown",
          email: candidateObj?.email || row.email || "",
          phone: candidateObj?.phone || row.phone || "",
          department: candidateObj?.department || row.department || "",
          role: candidateObj?.role || row.role || "",
          bankName: row.documents.bankDetails.bankName,
          accountNumber: row.documents.bankDetails.accountNumber || "—",
          ifscCode: row.documents.bankDetails.ifscCode || "—",
          verified: row.documents.bankDetails.verified || false,
          uploadedAt: row.documents.bankDetails.uploadedAt,
        };
      });

      setAllData(enriched);

      // Build dropdown options
      const depts = [...new Set(enriched.map((r) => r.department).filter(Boolean))].sort();
      const rls = [...new Set(enriched.map((r) => r.role).filter(Boolean))].sort();
      setDepartments(depts);
      setRoles(rls);
    } catch (err) {
      console.error("BankReports fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Apply filters
  useEffect(() => {
    let result = [...allData];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.bankName.toLowerCase().includes(q) ||
          r.ifscCode.toLowerCase().includes(q)
      );
    }

    if (deptFilter) {
      result = result.filter((r) => r.department === deptFilter);
    }

    if (roleFilter) {
      result = result.filter((r) => r.role === roleFilter);
    }

    if (verifiedFilter) {
      result = result.filter((r) =>
        verifiedFilter === "verified" ? r.verified : !r.verified
      );
    }

    setFilteredData(result);
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
      totalCount: result.length,
      totalPages: Math.ceil(result.length / prev.limit),
    }));
  }, [searchTerm, deptFilter, roleFilter, verifiedFilter, allData]);

  // Recalculate totalPages when limit changes
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      totalPages: Math.ceil(filteredData.length / prev.limit),
    }));
  }, [pagination.limit, filteredData.length]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setDeptFilter("");
    setRoleFilter("");
    setVerifiedFilter("");
  };

  // Export CSV
  const exportToCSV = () => {
    if (filteredData.length === 0) {
      alert("No data to export!");
      return;
    }
    const headers = [
      "Name", "Email", "Phone", "Department", "Role",
      "Bank Name", "Account Number", "IFSC Code", "Verified", "Uploaded At",
    ];
    const rows = filteredData.map((r) => [
      `"${r.name}"`, `"${r.email}"`, `"${r.phone}"`,
      `"${r.department}"`, `"${r.role}"`, `"${r.bankName}"`,
      `"${r.accountNumber}"`, `"${r.ifscCode}"`,
      r.verified ? "Yes" : "No",
      r.uploadedAt ? `"${new Date(r.uploadedAt).toLocaleDateString()}"` : "N/A",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bank_reports_${new Date().toLocaleDateString().replace(/\//g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Pagination slice
  const indexOfLastItem = pagination.currentPage * pagination.limit;
  const indexOfFirstItem = indexOfLastItem - pagination.limit;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Stats
  const verifiedCount = allData.filter((r) => r.verified).length;
  const pendingCount = allData.length - verifiedCount;

  const hasActiveFilters = searchTerm || deptFilter || roleFilter || verifiedFilter;

  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-9xl">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-2 mb-2 sm:grid-cols-3">
          <div className="p-3 bg-white border-l-4 border-blue-500 rounded-lg shadow-md flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">Total Bank Records</div>
            <div className="text-sm font-bold text-gray-800">
              <CountUp end={allData.length} duration={2} separator="," />
            </div>
          </div>
          <div className="p-3 bg-white border-l-4 border-green-500 rounded-lg shadow-md flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">Verified</div>
            <div className="text-sm font-bold text-gray-800">
              <CountUp end={verifiedCount} duration={2} separator="," />
            </div>
          </div>
          <div className="p-3 bg-white border-l-4 border-yellow-500 rounded-lg shadow-md flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">Pending</div>
            <div className="text-sm font-bold text-gray-800">
              <CountUp end={pendingCount} duration={2} separator="," />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">

            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <FaSearch className="absolute text-sm text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, bank or IFSC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="h-8 px-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 min-w-[130px] outline-none"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-8 px-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 min-w-[120px] outline-none"
            >
              <option value="">All Roles</option>
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {/* Verified Filter */}
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="h-8 px-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 min-w-[110px] outline-none"
            >
              <option value="">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>

            {/* CSV Export */}
            <button
              onClick={exportToCSV}
              className="h-8 px-3 text-xs font-medium text-white transition bg-green-600 rounded-md hover:bg-green-700 flex items-center gap-1"
            >
              <FaDownload className="text-[10px]" /> CSV
            </button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
            <table className="min-w-full">
              <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                <tr>
                  <th className="px-2 py-2 text-center">#</th>
                  <th className="px-2 py-2 text-center">Name</th>
                  <th className="px-2 py-2 text-center">Bank Name</th>
                  <th className="px-2 py-2 text-center">Account Number</th>
                  <th className="px-2 py-2 text-center">IFSC Code</th>
                  <th className="px-2 py-2 text-center">Uploaded</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-2 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin" />
                        <span className="ml-2 text-gray-600 text-sm">
                          Loading bank records...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-2 py-8 text-center">
                      <p className="text-gray-500 text-sm">
                        {hasActiveFilters
                          ? "No records match your filters."
                          : "No bank details found."}
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={resetFilters}
                          className="mt-1 text-xs text-blue-500 underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  currentItems.map((row, idx) => (
                    <tr
                      key={row._id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      {/* # */}
                      <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
                        {indexOfFirstItem + idx + 1}
                      </td>

                      {/* Name */}
                      <td className="px-2 py-2 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {row.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {row.email}
                          </span>
                        </div>
                      </td>

                      {/* Bank Name */}
                      <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
                        {row.bankName}
                      </td>

                      {/* Account Number */}
                      <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap font-mono">
                        {row.accountNumber}
                      </td>

                      {/* IFSC */}
                      <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap font-mono">
                        {row.ifscCode}
                      </td>

                      {/* Uploaded At */}
                      <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
                        {row.uploadedAt
                          ? new Date(row.uploadedAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filteredData.length > 0 && (
            <div className="flex items-center justify-between px-2 py-2 border-t border-gray-200 bg-gray-50">
              {/* Left: showing info + per page */}
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                <span>Showing</span>
                <span className="font-medium">{indexOfFirstItem + 1}</span>
                <span>to</span>
                <span className="font-medium">
                  {Math.min(indexOfLastItem, filteredData.length)}
                </span>
                <span>of</span>
                <span className="font-medium">{filteredData.length}</span>
                <span>results</span>
                <select
                  value={pagination.limit}
                  onChange={(e) => handleItemsPerPageChange(e.target.value)}
                  className="p-1 ml-2 text-sm border rounded-lg outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Right: page buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      currentPage: prev.currentPage - 1,
                    }))
                  }
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= pagination.currentPage - 1 &&
                        page <= pagination.currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              currentPage: page,
                            }))
                          }
                          className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                            pagination.currentPage === page
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === pagination.currentPage - 2 ||
                      page === pagination.currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      currentPage: prev.currentPage + 1,
                    }))
                  }
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankReports;