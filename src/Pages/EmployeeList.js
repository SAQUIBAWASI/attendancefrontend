import axios from "axios";
import { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { FaEdit, FaEye, FaFileCsv, FaTrash, FaUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

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
        const response = await axios.get(
          "https://attendancebackend-5cgn.onrender.com/api/employees/get-employees"
        );
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

  const handleView = (employee) => setSelectedEmployee(employee);
  const handleCloseModal = () => setSelectedEmployee(null);
  const handleEdit = (id) => navigate(`/employee/edit/${id}`);

  const handleDelete = async (id) => {
    try {
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
    <div className="p-4 bg-white rounded-lg shadow-md max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h2 className="text-xl font-semibold text-center sm:text-left">
          Employee List
        </h2>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <input
          type="text"
          className="px-3 py-2 text-sm border rounded w-full sm:w-64"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex flex-wrap gap-2">
          <CSVLink
            data={filteredEmployees}
            headers={csvHeaders}
            filename="employees.csv"
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-green-500 rounded hover:bg-green-600 transition"
          >
            <FaFileCsv /> CSV
          </CSVLink>

          <label
            htmlFor="file-upload"
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-purple-600 rounded cursor-pointer hover:bg-purple-700 transition"
          >
            <FaUpload /> Import
            <input
              id="file-upload"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleBulkImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              {csvHeaders.map((header, idx) => (
                <th key={idx} className="p-2 text-left border">
                  {header.label}
                </th>
              ))}
              <th className="p-2 text-left border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.length > 0 ? (
              currentEmployees.map((emp) => (
                <tr
                  key={emp._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-2 border">{emp.name}</td>
                  <td className="p-2 border">{emp.email}</td>
                  <td className="p-2 border">{emp.phone}</td>
                  <td className="p-2 border">{emp.department}</td>
                  <td className="p-2 capitalize border">{emp.role}</td>
                  <td className="p-2 border">
                    {emp.joinDate
                      ? new Date(emp.joinDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-2 border">{emp.employeeId}</td>
                  <td className="p-2 border text-center">
                    <div className="flex justify-center gap-2">
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
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={csvHeaders.length + 1}
                  className="p-4 text-center text-gray-500"
                >
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
        <button
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 text-gray-700 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          Previous
        </button>
        <span className="font-semibold text-center">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-gray-700 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          Next
        </button>
      </div>

      {/* View Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3">
          <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
            <h3 className="mb-4 text-lg font-bold text-center sm:text-left">
              Employee Details
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <strong>Name:</strong> {selectedEmployee.name}
              </li>
              <li>
                <strong>Email:</strong> {selectedEmployee.email}
              </li>
              <li>
                <strong>Phone:</strong> {selectedEmployee.phone}
              </li>
              <li>
                <strong>Department:</strong> {selectedEmployee.department}
              </li>
              <li>
                <strong>Role:</strong> {selectedEmployee.role}
              </li>
              <li>
                <strong>Join Date:</strong>{" "}
                {new Date(selectedEmployee.joinDate).toLocaleDateString()}
              </li>
              <li>
                <strong>Employee ID:</strong> {selectedEmployee.employeeId}
              </li>
              <li>
                <strong>Address:</strong> {selectedEmployee.address}
              </li>
            </ul>
            <button
              onClick={handleCloseModal}
              className="absolute text-gray-600 top-2 right-3 hover:text-black text-lg"
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
