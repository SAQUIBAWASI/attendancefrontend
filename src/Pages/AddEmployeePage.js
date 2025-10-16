import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ import for navigation

const AddEmployeePage = () => {
  const navigate = useNavigate(); // ✅ initialize navigate

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const departments = [
    "Developer",
    "Sales",
    "Marketing",
    "Medical",
    "Finance",
    "Nursing ",
    "Digital Marketing",
    "Management",
    "Laboratory Medicine ",
  ];

  const roles = [
    "Administrator",
    "Manager",
    "Team Lead",
    "Employee",
    "HR Manager",
    "Phlebotomist",
    "Staff Nurse",
    "Consultant",
    "Graphic Designer",
    "UI/UX & GRAPHIC DESIGNER",
    "SMM, & SEO executive ",
    "Web Developer",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("https://attendancebackend-5cgn.onrender.com/api/employees/add-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          department,
          role,
          joinDate,
          phone,
          address,
          employeeId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setSuccessMessage("✅ Employee added successfully!");
      setName("");
      setEmail("");
      setPassword("");
      setDepartment("");
      setRole("");
      setJoinDate("");
      setPhone("");
      setAddress("");
      setEmployeeId("");

      // ✅ Navigate to employee list after success
      setTimeout(() => {
        navigate("/employeelist");
      }, 1000);

    } catch (error) {
      setErrorMessage(`❌ ${error.message}`);
    }
  };

  return (
    <div className="max-w-4xl p-6 mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="mb-6 text-2xl font-semibold text-blue-900">Add New Employee</h2>

      {/* Success or Error Message */}
      {successMessage && (
        <div className="p-4 mb-4 text-green-700 bg-green-100 rounded">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            placeholder="Enter employee name"
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            placeholder="Enter employee email"
            required
          />
        </div>
        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            placeholder="Enter employee password"
            required
          />
        </div>


        {/* Department */}
        <div className="mb-4">
          <label htmlFor="department" className="block text-sm font-medium text-gray-700">
            Department
          </label>
          <select
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            required
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Role */}
        <div className="mb-4">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            required
          >
            <option value="">Select Role</option>
            {roles.map((roleOption) => (
              <option key={roleOption} value={roleOption}>
                {roleOption}
              </option>
            ))}
          </select>
        </div>

        {/* Join Date */}
        <div className="mb-4">
          <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700">
            Join Date
          </label>
          <input
            id="joinDate"
            type="date"
            value={joinDate}
            onChange={(e) => setJoinDate(e.target.value)}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
          />
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            placeholder="e.g. +91 9876543210"
          />
        </div>

        {/* Address */}
        <div className="mb-4">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            placeholder="Enter full address"
            rows="3"
          ></textarea>
        </div>

        {/* Employee ID */}
        <div className="mb-4">
          <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
            Employee ID
          </label>
          <input
            id="employeeId"
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="w-full p-2 mt-1 border border-gray-300 rounded"
            placeholder="Enter unique employee ID"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Add Employee
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployeePage;
