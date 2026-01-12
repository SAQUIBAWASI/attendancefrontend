

import axios from "axios";
import { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { FaEdit, FaEye, FaFileCsv, FaMapMarkerAlt, FaTrash, FaUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import Pagination from "./Pagination"; // ✅ ADD THIS

import { isEmployeeHidden } from "../utils/employeeStatus";

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
          "https://api.timelyhealth.in/api/employees/get-employees"
        );
        // We now keep all employees so the user can see/toggle hidden ones
        setEmployees(response.data);
      } catch (error) {
        console.error("❌ Error fetching employees:", error);
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await axios.get(
          "https://api.timelyhealth.in/api/location/alllocation"
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
  })
    .sort((a, b) => isEmployeeHidden(a) - isEmployeeHidden(b));

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const handleView = (employee) => setSelectedEmployee(employee);
  const handleCloseModal = () => setSelectedEmployee(null);
  const handleEdit = (employee) => navigate(`/addemployee`, { state: { employee } });

  const handleToggleStatus = async (emp) => {
    const isCurrentlyHidden = isEmployeeHidden(emp);
    const newStatus = isCurrentlyHidden ? 'active' : 'inactive';
    const confirmMsg = isCurrentlyHidden
      ? `Are you sure you want to make ${emp.name} ACTIVE?`
      : `Are you sure you want to HIDE ${emp.name}? They will not appear in reports.`;

    if (window.confirm(confirmMsg)) {
      try {
        setLoading(true);

        const payload = {
          status: newStatus
        };

        await axios.put(`https://api.timelyhealth.in/api/employees/update/${emp._id}`, payload);

        // Update local state
        setEmployees(employees.map(e => e._id === emp._id ? { ...e, status: newStatus } : e));
        alert(`✅ Employee status updated to ${newStatus}`);
      } catch (error) {
        console.error("❌ Error updating employee status:", error);
        alert(`Failed to update status: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id) => {
    console.log("Attempting to delete employee with ID:", id); // 🔍 Debug log
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axios.delete(
          `https://api.timelyhealth.in/api/employees/delete-employee/${id}`
        );
        setEmployees(employees.filter((emp) => emp._id !== id));
        alert("✅ Employee deleted successfully!");
      } catch (error) {
        console.error("❌ Error deleting employee:", error);
        // Show specific error from backend if available
        const errMsg = error.response?.data?.message || error.message || "Unknown error";
        alert(`Failed to delete employee. Error: ${errMsg}`);
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

    const selectedLoc = locations.find(loc => loc._id === selectedLocationId);
    if (!selectedLoc) {
      alert("Selected location not found");
      return;
    }

    setLoading(true);
    try {
      // Backend assign-location endpoint expects coordinates (as seen in AssignLocation.js)
      const response = await axios.put(
        `https://api.timelyhealth.in/api/employees/assign-location/${selectedEmployeeForLocation.employeeId}`,
        {
          name: selectedLoc.name,
          latitude: selectedLoc.latitude,
          longitude: selectedLoc.longitude
        }
      );

      // Update local state. Store the location ID to keep getLocationName working.
      setEmployees(
        employees.map((emp) =>
          emp._id === selectedEmployeeForLocation._id
            ? { ...emp, location: selectedLocationId }
            : emp
        )
      );

      alert("✅ Location assigned successfully!");
      handleCloseLocationModal();
    } catch (error) {
      console.error("❌ Error assigning location:", error);
      alert(`Failed to assign location: ${error.response?.data?.message || error.message}`);
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

      {/* Header Section: Search & Actions */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">

          {/* CSV Export */}
          <CSVLink
            data={filteredEmployees}
            filename="employees.csv"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
          >
            <FaFileCsv className="text-lg" />
            <span>Export CSV</span>
          </CSVLink>

          {/* Import Button */}
          <label
            htmlFor="file-upload"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-purple-600 rounded-lg shadow-sm cursor-pointer hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
          >
            <FaUpload className="text-lg" />
            <span>Import</span>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleBulkImport}
              className="hidden"
            />
          </label>

          {/* Add Employee Button */}
          <button
            onClick={() => navigate("/addemployee")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Employee</span>
          </button>
        </div>
      </div>




      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Emp ID</th>
              <th className="p-2 border">Name</th>
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
                  <td className="p-2 border">{emp.employeeId}</td>
                  <td className="p-2 border">{emp.name}</td>
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
                      <button className="text-blue-500" onClick={() => handleView(emp)} title="View Detail">
                        <FaEye />
                      </button>
                      <button className="text-yellow-500" onClick={() => handleEdit(emp)} title="Edit Employee">
                        <FaEdit />
                      </button>
                      <button className="text-green-500" onClick={() => handleAssignLocation(emp)} title="Assign Location">
                        <FaMapMarkerAlt />
                      </button>

                      {/* Status Toggle Button */}
                      <button
                        onClick={() => handleToggleStatus(emp)}
                        className={`px-2 py-0.5 text-xs font-bold rounded ${isEmployeeHidden(emp) ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        title={isEmployeeHidden(emp) ? "Make Active" : "Hide Employee"}
                      >
                        {isEmployeeHidden(emp) ? 'INACTIVE' : 'ACTIVE'}
                      </button>

                      <button className="text-red-500" onClick={() => handleDelete(emp._id)} title="Delete Employee">
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
