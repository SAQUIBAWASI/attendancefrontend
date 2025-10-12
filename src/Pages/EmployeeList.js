import React, { useEffect, useState } from "react";
import { FaFileCsv, FaUpload, FaEye, FaTrash, FaEdit } from "react-icons/fa";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/employees/get-employees");
        setEmployees(response.data);
      } catch (error) {
        console.error("❌ Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleView = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleCloseModal = () => {
    setSelectedEmployee(null);
  };

  const handleEdit = (id) => {
    navigate(`/employee/edit/${id}`); // Update route as needed
  };

  const handleDelete = async (id) => {
    try {
      // await axios.delete(`http://localhost:5000/api/employees/delete/${id}`);
      setEmployees(employees.filter((emp) => emp._id !== id));
      alert("✅ Employee deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting employee:", error);
      alert("Failed to delete employee.");
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
      const parsedData = XLSX.utils.sheet_to_json(sheet);
      console.log("Imported Employees:", parsedData);
      alert("Employee data imported successfully (log only).");
    };
    reader.readAsArrayBuffer(file);
  };

  const csvHeaders = [
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Department", key: "department" },
    { label: "Role", key: "role" },
    { label: "Join Date", key: "joinDate" },
    { label: "Employee ID", key: "employeeId" },
  ];

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Employee List</h2>
      </div>

      {/* Controls */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <input
          type="text"
          className="px-3 py-2 border rounded text-sm"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <CSVLink
          data={filteredEmployees}
          headers={csvHeaders}
          filename="employees.csv"
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

      {/* Table */}
      <div className="overflow-y-auto max-h-[400px]">
        <table className="w-full border rounded text-sm">
          <thead className="bg-gray-200">
            <tr>
              {csvHeaders.map((header, idx) => (
                <th key={idx} className="p-2 border text-left">{header.label}</th>
              ))}
              <th className="p-2 border text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.map((emp) => (
              <tr key={emp._id} className="hover:bg-gray-100 border-b">
                <td className="p-2 border">{emp.name}</td>
                <td className="p-2 border">{emp.email}</td>
                <td className="p-2 border">{emp.phone}</td>
                <td className="p-2 border">{emp.department}</td>
                <td className="p-2 border capitalize">{emp.role}</td>
                <td className="p-2 border">
                  {emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : "-"}
                </td>
                <td className="p-2 border">{emp.employeeId}</td>
                <td className="p-2 border flex gap-2 justify-center">
                  <button
                    onClick={() => handleView(emp)}
                    className="text-blue-500 hover:text-blue-700"
                    title="View"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => handleEdit(emp._id)}
                    className="text-yellow-500 hover:text-yellow-700"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(emp._id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          Previous
        </button>
        <span className="font-semibold">Page {currentPage} of {totalPages}</span>
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          Next
        </button>
      </div>

      {/* View Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded shadow-lg relative">
            <h3 className="text-lg font-bold mb-4">Employee Details</h3>
            <ul className="space-y-2 text-sm">
              <li><strong>Name:</strong> {selectedEmployee.name}</li>
              <li><strong>Email:</strong> {selectedEmployee.email}</li>
              <li><strong>Phone:</strong> {selectedEmployee.phone}</li>
              <li><strong>Department:</strong> {selectedEmployee.department}</li>
              <li><strong>Role:</strong> {selectedEmployee.role}</li>
              <li><strong>Join Date:</strong> {new Date(selectedEmployee.joinDate).toLocaleDateString()}</li>
              <li><strong>Employee ID:</strong> {selectedEmployee.employeeId}</li>
              <li><strong>Address:</strong> {selectedEmployee.address}</li>
            </ul>
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
