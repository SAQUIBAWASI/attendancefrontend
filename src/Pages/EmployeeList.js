

import axios from "axios";
import { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { FaEdit, FaEye, FaFileCsv, FaMapMarkerAlt, FaTrash, FaUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import Pagination from "./Pagination"; // ✅ ADD THIS

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedEmployeeForLocation, setSelectedEmployeeForLocation] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/employees/get-employees"
        );
        setEmployees(response.data);
      } catch (error) {
        console.error("❌ Error fetching employees:", error);
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/location/alllocation"
        );
        let locationsData = [];
        if (response.data?.locations) {
          locationsData = response.data.locations;
        }
        setLocations(locationsData);
      } catch (error) {
        console.error("❌ Error fetching locations:", error);
        setLocations([]);
      }
    };

    fetchEmployees();
    fetchLocations();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const searchTerm = search.toLowerCase().trim();
    return (
      emp.name?.toLowerCase().includes(searchTerm) ||
      emp.email?.toLowerCase().includes(searchTerm) ||
      emp.phone?.toLowerCase().includes(searchTerm) ||
      emp.employeeId?.toLowerCase().includes(searchTerm) ||
      emp.department?.toLowerCase().includes(searchTerm) ||
      emp.role?.toLowerCase().includes(searchTerm)
    );
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const handleView = (employee) => setSelectedEmployee(employee);
  const handleCloseModal = () => setSelectedEmployee(null);
  const handleEdit = (employee) => navigate(`/addemployee`, { state: { employee } });

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axios.delete(
          `http://localhost:5000/api/employees/delete-employee/${id}`
        );
        setEmployees(employees.filter((emp) => emp._id !== id));
        alert("✅ Employee deleted successfully!");
      } catch (error) {
        console.error("❌ Error deleting employee:", error);
        alert("Failed to delete employee.");
      }
    }
  };

  const handleAssignLocation = (employee) => {
    setSelectedEmployeeForLocation(employee);
    setSelectedLocationId(employee.location || "");
    setShowLocationModal(true);
  };

  const handleCloseLocationModal = () => {
    setShowLocationModal(false);
    setSelectedEmployeeForLocation(null);
    setSelectedLocationId("");
    setLoading(false);
  };

  const assignLocation = async () => {
    if (!selectedLocationId) {
      alert("Please select a location");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:5000/api/employees/assign-location/${selectedEmployeeForLocation.employeeId}`,
        { locationId: selectedLocationId }
      );

      setEmployees(
        employees.map((emp) =>
          emp._id === selectedEmployeeForLocation._id
            ? { ...emp, location: selectedLocationId }
            : emp
        )
      );

      alert("✅ " + response.data.message);
      handleCloseLocationModal();
    } catch (error) {
      console.error("❌ Error assigning location:", error);
      alert(error.response?.data?.message || "Failed to assign location");
    } finally {
      setLoading(false);
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

  const getLocationName = (locationId) => {
    if (!locationId || !Array.isArray(locations)) {
      return "Not assigned";
    }
    const location = locations.find((loc) => loc._id === locationId);
    return location ? location.name : "Not assigned";
  };

  return (
    <div className="p-3 mx-auto bg-white rounded-lg shadow-md max-w-9xl">
     {/* Search + Export */}
{/* <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
  <h2 className="text-xl font-semibold">Employee List</h2>
</div> */}

<div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center">
  {/* Search */}
  <input
    type="text"
    className="w-full px-3 py-2 text-sm border rounded sm:w-64"
    placeholder="Search by name..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

  {/* Buttons */}
  <div className="flex flex-wrap gap-2">
    <CSVLink
      data={filteredEmployees}
      filename="employees.csv"
      className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-green-500 rounded"
    >
      <FaFileCsv /> CSV
    </CSVLink>

    <label
      htmlFor="file-upload"
      className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-purple-600 rounded cursor-pointer"
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

    <button
      onClick={() => navigate("/addemployee")}
      className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
    >
      + Add Employee
    </button>
  </div>
</div>

      
      

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Name</th>
               <th className="p-2 border">Emp ID</th>
              {/* <th className="p-2 border">Email</th> */}
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Department</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Join Date</th>
              <th className="p-2 border">Salary</th>
              <th className="p-2 border">Shift</th>
              <th className="p-2 border">Week Off</th>
              <th className="p-2 border">Location</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentEmployees.length > 0 ? (
              currentEmployees.map((emp) => (
                <tr key={emp._id} className="border-b hover:bg-gray-50">
                  <td className="p-2 border">{emp.name}</td>
                   <td className="p-2 border">{emp.employeeId}</td>
                  {/* <td className="p-2 border">{emp.email}</td> */}
                  <td className="p-2 border">{emp.phone}</td>
                  <td className="p-2 border">{emp.department}</td>
                  <td className="p-2 border">{emp.role}</td>
                  <td className="p-2 border">
                    {emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : "-"}
                  </td>
                 
                  <td className="p-2 border">₹{emp.salaryPerMonth}</td>
                  <td className="p-2 border">{emp.shiftHours}</td>
                  <td className="p-2 border">{emp.weekOffPerMonth}</td>
                  <td className="p-2 border">{getLocationName(emp.location)}</td>

                  <td className="p-2 text-center border">
                    <div className="flex justify-center gap-2">
                      <button className="text-blue-500" onClick={() => handleView(emp)}>
                        <FaEye />
                      </button>
                      <button className="text-yellow-500" onClick={() => handleEdit(emp)}>
                        <FaEdit />
                      </button>
                      <button className="text-green-500" onClick={() => handleAssignLocation(emp)}>
                        <FaMapMarkerAlt />
                      </button>
                      <button className="text-red-500" onClick={() => handleDelete(emp._id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="12" className="p-4 text-center text-gray-500">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Added Here */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Modals remain unchanged */}
      {/* VIEW MODAL */}
      {selectedEmployee && (
        <div className="fixed inset-0 flex items-center justify-center p-3 bg-black bg-opacity-50">
          <div className="relative w-full max-w-md p-5 bg-white rounded-lg">
            <button className="absolute top-2 right-3" onClick={handleCloseModal}>X</button>
            <h3 className="mb-3 text-lg font-bold">Employee Details</h3>
            <p><b>Name:</b> {selectedEmployee.name}</p>
            <p><b>Email:</b> {selectedEmployee.email}</p>
            <p><b>Phone:</b> {selectedEmployee.phone}</p>
            <p><b>Department:</b> {selectedEmployee.department}</p>
            <p><b>Role:</b> {selectedEmployee.role}</p>
          </div>
        </div>
      )}

      {/* ASSIGN LOCATION MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 flex items-center justify-center p-3 bg-black bg-opacity-50">
          <div className="relative w-full max-w-md p-5 bg-white rounded-lg">
            <button className="absolute top-2 right-3" onClick={handleCloseLocationModal}>
              X
            </button>
            <h3 className="mb-4 text-lg font-bold">Assign Location</h3>

            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Location</option>
              {locations.map((loc) => (
                <option key={loc._id} value={loc._id}>
                  {loc.name}
                </option>
              ))}
            </select>

            <button
              onClick={assignLocation}
              className="w-full py-2 mt-4 text-white bg-blue-600 rounded"
            >
              Assign
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
