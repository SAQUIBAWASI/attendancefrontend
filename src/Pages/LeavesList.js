import React, { useEffect, useState } from "react";
import { FaFileCsv, FaEye, FaEdit } from "react-icons/fa";
import { CSVLink } from "react-csv";
import axios from "axios";

const LeavesList = () => {
    const [leaves, setLeaves] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [selectedRecord, setSelectedRecord] = useState(null);
    const [editingRecord, setEditingRecord] = useState(null);
    const [updatedStatus, setUpdatedStatus] = useState("");

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/leaves/leaves");
            if (res.data && Array.isArray(res.data)) {
                setLeaves(res.data);
            }
        } catch (err) {
            console.error("Error fetching leaves:", err);
        }
    };

    const filtered = leaves.filter((leave) =>
        leave.employeeName.toLowerCase().includes(search.toLowerCase())
    );

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentLeaves = filtered.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const goNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
    const goPrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleView = (rec) => setSelectedRecord(rec);
    const handleCloseModal = () => setSelectedRecord(null);

    const handleEdit = (rec) => {
        setEditingRecord(rec);
        setUpdatedStatus(rec.status || "pending");
    };

    const handleUpdateStatus = async () => {
        try {
            // Only allow approved/rejected
            if (!["approved", "rejected"].includes(updatedStatus)) {
                alert("❌ Status must be either 'approved' or 'rejected'");
                return;
            }

            const response = await axios.put(`http://localhost:5000/api/leaves/updateleaves/${editingRecord._id}`, {
                status: updatedStatus,
            });

            if (response.data && response.data.leave) {
                alert(`✅ Leave successfully ${updatedStatus}`);
                setEditingRecord(null);
                fetchLeaves(); // Refresh list
            } else {
                alert("❌ Update failed");
            }
        } catch (err) {
            console.error("❌ Error updating status:", err);
            alert("❌ Server error while updating status");
        }
    };


    const csvHeaders = [
        { label: "Employee ID", key: "employeeId" },
        { label: "Employee Name", key: "employeeName" },
        { label: "Leave Type", key: "leaveType" },
        { label: "Start Date", key: "startDate" },
        { label: "End Date", key: "endDate" },
        { label: "Days", key: "days" },
        { label: "Reason", key: "reason" },
        { label: "Status", key: "status" },
        { label: "Applied Date", key: "appliedDate" },
    ];

    return (
        <div className="p-4 bg-white rounded shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Leave Requests</h2>
            </div>

            <div className="mb-4 flex gap-2 flex-wrap">
                <input
                    type="text"
                    className="px-3 py-2 border rounded text-sm"
                    placeholder="Search by employee name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <CSVLink
                    data={filtered}
                    headers={csvHeaders}
                    filename="leave_requests.csv"
                    className="px-4 py-2 bg-green-500 text-white rounded text-sm flex items-center gap-2"
                >
                    <FaFileCsv /> Export CSV
                </CSVLink>
            </div>

            <div className="overflow-y-auto max-h-[450px]">
                <table className="w-full border text-sm rounded">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-2 border">Employee ID</th>
                            <th className="p-2 border">Name</th>
                            <th className="p-2 border">Leave Type</th>
                            <th className="p-2 border">Start</th>
                            <th className="p-2 border">End</th>
                            <th className="p-2 border">Days</th>
                            <th className="p-2 border">Reason</th>
                            <th className="p-2 border">Status</th>
                            <th className="p-2 border">Applied Date</th>
                            <th className="p-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentLeaves.map((rec) => (
                            <tr key={rec._id} className="hover:bg-gray-100 border-b">
                                <td className="p-2 border">{rec.employeeId}</td>
                                <td className="p-2 border">{rec.employeeName}</td>
                                <td className="p-2 border">{rec.leaveType}</td>
                                <td className="p-2 border">{rec.startDate}</td>
                                <td className="p-2 border">{rec.endDate}</td>
                                <td className="p-2 border">{rec.days}</td>
                                <td className="p-2 border">{rec.reason}</td>
                                <td className="p-2 border">{rec.status}</td>
                                <td className="p-2 border">{new Date(rec.appliedDate).toLocaleDateString()}</td>
                                <td className="p-2 border flex gap-2 justify-center">
                                    <button
                                        onClick={() => handleView(rec)}
                                        className="text-blue-600 hover:text-blue-800"
                                        title="View"
                                    >
                                        <FaEye />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(rec)}
                                        className="text-yellow-600 hover:text-yellow-800"
                                        title="Edit Status"
                                    >
                                        <FaEdit />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={goPrev}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                    Previous
                </button>
                <span className="font-semibold">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={goNext}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                    Next
                </button>
            </div>

            {/* View Modal */}
            {selectedRecord && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white max-w-md w-full p-6 rounded shadow-lg relative">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                        >
                            ✕
                        </button>
                        <h3 className="text-lg font-semibold mb-4">Leave Details</h3>
                        <ul className="text-sm space-y-2">
                            <li><strong>Employee ID:</strong> {selectedRecord.employeeId}</li>
                            <li><strong>Name:</strong> {selectedRecord.employeeName}</li>
                            <li><strong>Leave Type:</strong> {selectedRecord.leaveType}</li>
                            <li><strong>Start Date:</strong> {selectedRecord.startDate}</li>
                            <li><strong>End Date:</strong> {selectedRecord.endDate}</li>
                            <li><strong>Days:</strong> {selectedRecord.days}</li>
                            <li><strong>Reason:</strong> {selectedRecord.reason}</li>
                            <li><strong>Status:</strong> {selectedRecord.status}</li>
                            <li><strong>Applied Date:</strong> {new Date(selectedRecord.appliedDate).toLocaleString()}</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingRecord && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white max-w-md w-full p-6 rounded shadow-lg relative">
                        <button
                            onClick={() => setEditingRecord(null)}
                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                        >
                            ✕
                        </button>
                        <h3 className="text-lg font-semibold mb-4">Edit Leave Status</h3>
                        <div className="mb-4">
                            <label className="block text-sm mb-1 font-medium">Status</label>
                            <select
                                className="w-full border px-3 py-2 rounded"
                                value={updatedStatus}
                                onChange={(e) => setUpdatedStatus(e.target.value)}
                            >
                                <option value="">Select Status</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>

                        </div>
                        <button
                            onClick={handleUpdateStatus}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeavesList;
