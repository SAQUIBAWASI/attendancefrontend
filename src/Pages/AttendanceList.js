import React, { useEffect, useState } from "react";
import { FaFileCsv, FaUpload, FaEye, FaEdit } from "react-icons/fa";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import axios from "axios";

const AttendanceList = () => {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState("");

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const resp = await axios.get("http://localhost:5000/api/attendance/allattendance");
      if (resp.data && resp.data.success) {
        setRecords(resp.data.data);
      } else {
        console.error("Unexpected API response:", resp.data);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  const filtered = records.filter((rec) =>
    rec.employeeName.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRecords = filtered.slice(indexOfFirst, indexOfLast);
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
    setUpdatedStatus(rec.status || "present");
  };

  const handleUpdateStatus = async () => {
    try {
      await axios.put(`http://localhost:5000/api/attendance/update/${editingRecord._id}`, {
        status: updatedStatus,
      });

      alert("✅ Attendance status updated!");
      setEditingRecord(null);
      setUpdatedStatus("");
      fetchAttendance(); // Refresh list
    } catch (err) {
      console.error("Error updating status:", err);
      alert("❌ Failed to update attendance status");
    }
  };

  const handleBulkImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      console.log("Imported attendance data:", json);
      alert("Imported attendance (check console).");
    };
    reader.readAsArrayBuffer(file);
  };

  const csvHeaders = [
    { label: "Employee ID", key: "employeeId" },
    { label: "Employee Name", key: "employeeName" },
    { label: "Date", key: "date" },
    { label: "Check In", key: "checkIn" },
    { label: "Check Out", key: "checkOut" },
    { label: "Status", key: "status" },
    { label: "Distance From Office", key: "distanceFromOffice" },
    { label: "Location Status", key: "locationStatus" },
    { label: "Latitude", key: "location.latitude" },
    { label: "Longitude", key: "location.longitude" },
  ];

  const transformForCsv = (rec) => ({
    ...rec,
    "location.latitude": rec.location?.latitude,
    "location.longitude": rec.location?.longitude,
  });

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Attendance List</h2>
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
          data={filtered.map(transformForCsv)}
          headers={csvHeaders}
          filename="attendance_records.csv"
          className="px-4 py-2 bg-green-500 text-white rounded text-sm flex items-center gap-2"
        >
          <FaFileCsv /> CSV
        </CSVLink>

        <label
          htmlFor="file-upload"
          className="px-4 py-2 bg-purple-600 text-white rounded text-sm flex items-center gap-2 cursor-pointer"
        >
          <FaUpload /> Bulk Import
          <input
            id="file-upload"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleBulkImport}
            className="hidden"
          />
        </label>
      </div>

      <div className="overflow-y-auto max-h-[450px]">
        <table className="w-full border rounded text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Employee ID</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Check In</th>
              <th className="p-2 border">Check Out</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Distance (km)</th>
              <th className="p-2 border">Location Status</th>
              <th className="p-2 border">Latitude</th>
              <th className="p-2 border">Longitude</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((rec) => (
              <tr key={rec._id} className="hover:bg-gray-100 border-b">
                <td className="p-2 border">{rec.employeeId}</td>
                <td className="p-2 border">{rec.employeeName}</td>
                <td className="p-2 border">{rec.date}</td>
                <td className="p-2 border">
                  {rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString() : "-"}
                </td>
                <td className="p-2 border">
                  {rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString() : "-"}
                </td>
                <td className="p-2 border">{rec.status}</td>
                <td className="p-2 border">{rec.distanceFromOffice ?? "-"}</td>
                <td className="p-2 border">{rec.locationStatus}</td>
                <td className="p-2 border">{rec.location?.latitude ?? "-"}</td>
                <td className="p-2 border">{rec.location?.longitude ?? "-"}</td>
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
          <div className="bg-white max-w-lg w-full p-6 rounded shadow-lg relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4">Attendance Detail</h3>
            <ul className="text-sm space-y-2">
              <li><strong>Employee ID:</strong> {selectedRecord.employeeId}</li>
              <li><strong>Name:</strong> {selectedRecord.employeeName}</li>
              <li><strong>Date:</strong> {selectedRecord.date}</li>
              <li><strong>Check In:</strong> {new Date(selectedRecord.checkIn).toLocaleString()}</li>
              <li><strong>Check Out:</strong> {selectedRecord.checkOut ? new Date(selectedRecord.checkOut).toLocaleString() : "-"}</li>
              <li><strong>Status:</strong> {selectedRecord.status}</li>
              <li><strong>Distance:</strong> {selectedRecord.distanceFromOffice}</li>
              <li><strong>Location Status:</strong> {selectedRecord.locationStatus}</li>
              <li><strong>Latitude:</strong> {selectedRecord.location?.latitude}</li>
              <li><strong>Longitude:</strong> {selectedRecord.location?.longitude}</li>
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
            <h3 className="text-lg font-semibold mb-4">Edit Attendance Status</h3>
            <div className="mb-4">
              <label className="block text-sm mb-1 font-medium">Status</label>
              <select
                className="w-full border px-3 py-2 rounded"
                value={updatedStatus}
                onChange={(e) => setUpdatedStatus(e.target.value)}
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="half-day">Half Day</option>
                <option value="remote">Remote</option>
                <option value="leave">Leave</option>
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

export default AttendanceList;
