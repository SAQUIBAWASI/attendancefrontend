// import { useState } from "react";
// import { useNavigate } from "react-router-dom"; // ✅ import for navigation

// const AddEmployeePage = () => {
//   const navigate = useNavigate(); // ✅ initialize navigate

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [department, setDepartment] = useState("");
//   const [role, setRole] = useState("");
//   const [joinDate, setJoinDate] = useState("");
//   const [phone, setPhone] = useState("");
//   const [address, setAddress] = useState("");
//   const [employeeId, setEmployeeId] = useState("");

//   const [successMessage, setSuccessMessage] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");

//   const departments = [
//     "Developer",
//     "Sales",
//     "Marketing",
//     "Medical",
//     "Finance",
//     "Nursing ",
//     "Digital Marketing",
//     "Management",
//     "Laboratory Medicine ",
//   ];

//   const roles = [
//     "Administrator",
//     "Manager",
//     "Team Lead",
//     "Employee",
//     "HR Manager",
//     "Phlebotomist",
//     "Staff Nurse",
//     "Consultant",
//     "Graphic Designer",
//     "UI/UX & GRAPHIC DESIGNER",
//     "SMM, & SEO executive ",
//     "Web Developer",
//   ];

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSuccessMessage("");
//     setErrorMessage("");

//     try {
//       const response = await fetch("https://attendancebackend-5cgn.onrender.com/api/employees/add-employee", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name,
//           email,
//           password,
//           department,
//           role,
//           joinDate,
//           phone,
//           address,
//           employeeId,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || "Something went wrong");
//       }

//       setSuccessMessage("✅ Employee added successfully!");
//       setName("");
//       setEmail("");
//       setPassword("");
//       setDepartment("");
//       setRole("");
//       setJoinDate("");
//       setPhone("");
//       setAddress("");
//       setEmployeeId("");

//       // ✅ Navigate to employee list after success
//       setTimeout(() => {
//         navigate("/employeelist");
//       }, 1000);

//     } catch (error) {
//       setErrorMessage(`❌ ${error.message}`);
//     }
//   };

//   return (
//     <div className="max-w-4xl p-6 mx-auto bg-white rounded-lg shadow-lg">
//       <h2 className="mb-6 text-2xl font-semibold text-blue-900">Add New Employee</h2>

//       {/* Success or Error Message */}
//       {successMessage && (
//         <div className="p-4 mb-4 text-green-700 bg-green-100 rounded">
//           {successMessage}
//         </div>
//       )}
//       {errorMessage && (
//         <div className="p-4 mb-4 text-red-700 bg-red-100 rounded">
//           {errorMessage}
//         </div>
//       )}

//       <form onSubmit={handleSubmit}>
//         {/* Name */}
//         <div className="mb-4">
//           <label htmlFor="name" className="block text-sm font-medium text-gray-700">
//             Full Name
//           </label>
//           <input
//             id="name"
//             type="text"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             className="w-full p-2 mt-1 border border-gray-300 rounded"
//             placeholder="Enter employee name"
//             required
//           />
//         </div>

//         {/* Email */}
//         <div className="mb-4">
//           <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//             Email Address
//           </label>
//           <input
//             id="email"
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full p-2 mt-1 border border-gray-300 rounded"
//             placeholder="Enter employee email"
//             required
//           />
//         </div>
//         {/* Password */}
//         <div className="mb-4">
//           <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//             Password
//           </label>
//           <input
//             id="password"
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full p-2 mt-1 border border-gray-300 rounded"
//             placeholder="Enter employee password"
//             required
//           />
//         </div>


//         {/* Department */}
//         <div className="mb-4">
//           <label htmlFor="department" className="block text-sm font-medium text-gray-700">
//             Department
//           </label>
//           <select
//             id="department"
//             value={department}
//             onChange={(e) => setDepartment(e.target.value)}
//             className="w-full p-2 mt-1 border border-gray-300 rounded"
//             required
//           >
//             <option value="">Select Department</option>
//             {departments.map((dept) => (
//               <option key={dept} value={dept}>
//                 {dept}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Role */}
//         <div className="mb-4">
//           <label htmlFor="role" className="block text-sm font-medium text-gray-700">
//             Role
//           </label>
//           <select
//             id="role"
//             value={role}
//             onChange={(e) => setRole(e.target.value)}
//             className="w-full p-2 mt-1 border border-gray-300 rounded"
//             required
//           >
//             <option value="">Select Role</option>
//             {roles.map((roleOption) => (
//               <option key={roleOption} value={roleOption}>
//                 {roleOption}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Join Date */}
//         <div className="mb-4">
//           <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700">
//             Join Date
//           </label>
//           <input
//             id="joinDate"
//             type="date"
//             value={joinDate}
//             onChange={(e) => setJoinDate(e.target.value)}
//             className="w-full p-2 mt-1 border border-gray-300 rounded"
//           />
//         </div>

//         {/* Phone */}
//         <div className="mb-4">
//           <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
//             Phone Number
//           </label>
//           <input
//             id="phone"
//             type="tel"
//             value={phone}
//             onChange={(e) => setPhone(e.target.value)}
//             className="w-full p-2 mt-1 border border-gray-300 rounded"
//             placeholder="e.g. +91 9876543210"
//           />
//         </div>

//         {/* Address */}
//         <div className="mb-4">
//           <label htmlFor="address" className="block text-sm font-medium text-gray-700">
//             Address
//           </label>
//           <textarea
//             id="address"
//             value={address}
//             onChange={(e) => setAddress(e.target.value)}
//             className="w-full p-2 mt-1 border border-gray-300 rounded"
//             placeholder="Enter full address"
//             rows="3"
//           ></textarea>
//         </div>

//         {/* Employee ID */}
//         <div className="mb-4">
//           <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
//             Employee ID
//           </label>
//           <input
//             id="employeeId"
//             type="text"
//             value={employeeId}
//             onChange={(e) => setEmployeeId(e.target.value)}
//             className="w-full p-2 mt-1 border border-gray-300 rounded"
//             placeholder="Enter unique employee ID"
//             required
//           />
//         </div>

//         {/* Submit Button */}
//         <div className="flex justify-end">
//           <button
//             type="submit"
//             className="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
//           >
//             Add Employee
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AddEmployeePage;

// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";


// const AddEmployeePage = () => {
//   const navigate = useNavigate();

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [department, setDepartment] = useState("");
//   const [role, setRole] = useState("");
//   const [joinDate, setJoinDate] = useState("");
//   const [phone, setPhone] = useState("");
//   const [address, setAddress] = useState("");
//   const [employeeId, setEmployeeId] = useState("");
//   const [locationId, setLocationId] = useState("");
//   const [shift, setShift] = useState("");

//   const [locations, setLocations] = useState([]);
//   const [showLocationModal, setShowLocationModal] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const [successMessage, setSuccessMessage] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");

//   // ✅ Department & Roles
//   const departments = [
//     "Developer",
//     "Sales",
//     "Marketing",
//     "Medical",
//     "Finance",
//     "Nursing",
//     "Digital Marketing",
//     "Management",
//     "Laboratory Medicine",
//   ];

//   const roles = [
//     "Administrator",
//     "Manager",
//     "Team Lead",
//     "Employee",
//     "HR Manager",
//     "Phlebotomist",
//     "Staff Nurse",
//     "Consultant",
//     "Graphic Designer",
//     "UI/UX & GRAPHIC DESIGNER",
//     "SMM & SEO Executive",
//     "Web Developer",
//   ];

//   // ✅ Updated Shift Assignments (with start-end time)
//   const shifts = {
//     A: "A (10:00 AM - 7:00 PM)",
//     B: "B (9:00 AM - 7:00 PM)",
//     C: "C (7:00 AM - 5:00 PM)",
//     D: "D (6:30 AM - 4:00 PM)",
//     E: "E (2:00 PM - 11:00 PM)",
//     F: "F (8:00 AM - 6:00 PM)",
//     G: "G (10:00 AM - 9:00 PM)",
//     H: "H (Split Shift 7:00–13:00 & 17:00–21:30)",
//     I: "I (11:00 AM - 8:00 PM)",
//   };

//   // ✅ Fetch all locations
//   useEffect(() => {
//     const fetchLocations = async () => {
//       try {
//         const res = await axios.get(
//           "https://attendancebackend-5cgn.onrender.com/api/location/alllocation"
//         );
//         if (res.data && res.data.locations) {
//           setLocations(res.data.locations);
//         }
//       } catch (err) {
//         console.error("❌ Error fetching locations:", err);
//       }
//     };
//     fetchLocations();
//   }, []);

//   // ✅ Add Employee with Shift & Location
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSuccessMessage("");
//     setErrorMessage("");
//     setLoading(true);

//     try {
//       // Step 1: Create Employee
//       const response = await fetch(
//         "https://attendancebackend-5cgn.onrender.com/api/employees/add-employee",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             name,
//             email,
//             password,
//             department,
//             role,
//             joinDate,
//             phone,
//             address,
//             employeeId,
//             shift,
//             locationId, // sent to backend
//           }),
//         }
//       );

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.message || "Failed to add employee");

//       // Step 2: Assign Location (only if locationId selected)
//       if (locationId) {
//         await axios.put(
//           `https://attendancebackend-5cgn.onrender.com/api/employees/assign-location/${employeeId}`,
//           { locationId }
//         );
//       }

//       setSuccessMessage("✅ Employee added successfully!");
//       // Reset Form
//       setName("");
//       setEmail("");
//       setPassword("");
//       setDepartment("");
//       setRole("");
//       setJoinDate("");
//       setPhone("");
//       setAddress("");
//       setEmployeeId("");
//       setLocationId("");
//       setShift("");

//       // Redirect
//       setTimeout(() => navigate("/employeelist"), 1000);
//     } catch (error) {
//       console.error("❌ Error adding employee:", error);
//       setErrorMessage(`❌ ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOpenLocationModal = () => setShowLocationModal(true);
//   const handleCloseLocationModal = () => setShowLocationModal(false);
//   const handleSelectLocation = (locId) => {
//     setLocationId(locId);
//     handleCloseLocationModal();
//   };

//   return (
//     <div className="max-w-4xl p-6 mx-auto bg-white rounded-lg shadow-lg">
//       <h2 className="mb-6 text-2xl font-semibold text-blue-900">
//         Add New Employee
//       </h2>

//       {successMessage && (
//         <div className="p-4 mb-4 text-green-700 bg-green-100 rounded">
//           {successMessage}
//         </div>
//       )}
//       {errorMessage && (
//         <div className="p-4 mb-4 text-red-700 bg-red-100 rounded">
//           {errorMessage}
//         </div>
//       )}

//       <form onSubmit={handleSubmit}>
//         {/* Name */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">
//             Full Name
//           </label>
//           <input
//             type="text"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             className="w-full p-2 mt-1 border border-gray-300 rounded"
//             required
//           />
//         </div>

//         {/* Email */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">
//             Email
//           </label>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full p-2 mt-1 border border-gray-300 rounded"
//             required
//           />
//         </div>

//         {/* Password */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">
//             Password
//           </label>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full p-2 mt-1 border border-gray-300 rounded"
//             required
//           />
//         </div>

//         {/* Department */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">
//             Department
//           </label>
//           <select
//             value={department}
//             onChange={(e) => setDepartment(e.target.value)}
//             className="w-full p-2 mt-1 border border-gray-300 rounded"
//             required
//           >
//             <option value="">Select Department</option>
//             {departments.map((dept) => (
//               <option key={dept} value={dept}>
//                 {dept}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Role */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">Role</label>
//           <select
//             value={role}
//             onChange={(e) => setRole(e.target.value)}
//             className="w-full p-2 mt-1 border border-gray-300 rounded"
//             required
//           >
//             <option value="">Select Role</option>
//             {roles.map((r) => (
//               <option key={r} value={r}>
//                 {r}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Join Date */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">
//             Join Date
//           </label>
//           <input
//             type="date"
//             value={joinDate}
//             onChange={(e) => setJoinDate(e.target.value)}
//             className="w-full p-2 mt-1 border border-gray-300 rounded"
//             required
//           />
//         </div>

//         {/* Phone */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">
//             Phone
//           </label>
//           <input
//             type="tel"
//             value={phone}
//             onChange={(e) => setPhone(e.target.value)}
//             className="w-full p-2 mt-1 border border-gray-300 rounded"
//           />
//         </div>

//         {/* Address */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">
//             Address
//           </label>
//           <textarea
//             value={address}
//             onChange={(e) => setAddress(e.target.value)}
//             className="w-full p-2 mt-1 border border-gray-300 rounded"
//           ></textarea>
//         </div>

//         {/* Employee ID */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">
//             Employee ID
//           </label>
//           <input
//             type="text"
//             value={employeeId}
//             onChange={(e) => setEmployeeId(e.target.value)}
//             className="w-full p-2 mt-1 border border-gray-300 rounded"
//             required
//           />
//         </div>

//         {/* ✅ Shift */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">
//             Shift Assignment
//           </label>
//           <select
//             value={shift}
//             onChange={(e) => setShift(e.target.value)}
//             className="w-full p-2 mt-1 border border-gray-300 rounded"
//             required
//           >
//             <option value="">Select Shift</option>
//             {Object.entries(shifts).map(([key, value]) => (
//               <option key={key} value={value}>
//                 {value}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* ✅ Location Modal */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">
//             Location
//           </label>
//           <div
//             onClick={handleOpenLocationModal}
//             className="w-full p-2 mt-1 border border-gray-300 rounded cursor-pointer hover:border-blue-400 bg-gray-50"
//           >
//             {locationId
//               ? locations.find((loc) => loc._id === locationId)?.name ||
//                 "Change Location"
//               : "Select / Change Location"}
//           </div>
//         </div>

//         {/* Submit Button */}
//         <div className="flex justify-end">
//           <button
//             type="submit"
//             disabled={loading}
//             className="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
//           >
//             {loading ? "Saving..." : "Add Employee"}
//           </button>
//         </div>
//       </form>

//       {/* ✅ Location Modal */}
//       {showLocationModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-3">
//           <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-6">
//             <h3 className="text-lg font-semibold mb-4">Select Location</h3>
//             <select
//               value={locationId}
//               onChange={(e) => handleSelectLocation(e.target.value)}
//               className="w-full p-2 border border-gray-300 rounded"
//             >
//               <option value="">Select a Location</option>
//               {locations.map((loc) => (
//                 <option key={loc._id} value={loc._id}>
//                   {loc.name}
//                 </option>
//               ))}
//             </select>

//             <div className="flex justify-end mt-4 gap-3">
//               <button
//                 onClick={handleCloseLocationModal}
//                 className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleCloseLocationModal}
//                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//               >
//                 Done
//               </button>
//             </div>

//             <button
//               onClick={handleCloseLocationModal}
//               className="absolute top-2 right-3 text-gray-500 text-xl"
//             >
//               ✕
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AddEmployeePage;

// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";

// const AddEmployeePage = () => {
//   const navigate = useNavigate();

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [department, setDepartment] = useState("");
//   const [role, setRole] = useState("");
//   const [joinDate, setJoinDate] = useState("");
//   const [phone, setPhone] = useState("");
//   const [address, setAddress] = useState("");
//   const [employeeId, setEmployeeId] = useState("");
//   const [locationId, setLocationId] = useState("");

//   // Salary Fields
//   const [salaryPerMonth, setSalaryPerMonth] = useState("");
//   const [shiftHours, setShiftHours] = useState("");
//   const [weekOffPerMonth, setWeekOffPerMonth] = useState(""); // NEW FIELD

//   const [showPassword, setShowPassword] = useState(false);
//   const [locations, setLocations] = useState([]);

//   const [loading, setLoading] = useState(false);
//   const [successMessage, setSuccessMessage] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");

//   // Departments
//   const departments = [
//     "Developer", "Sales", "Marketing", "Medical", "Finance",
//     "Nursing", "Digital Marketing", "Management", "Laboratory Medicine"
//   ];

//   // Roles
//   const roles = [
//     "Administrator", "Manager", "Team Lead", "Employee", "HR Manager",
//     "Phlebotomist", "Staff Nurse", "Sales Executive",
//     "Consultant", "Graphic Designer", "UI/UX & GRAPHIC DESIGNER",
//     "SMM & SEO Executive", "Web Developer",
//   ];

//   // Fetch Locations
//   useEffect(() => {
//     const fetchLocations = async () => {
//       try {
//         const res = await axios.get(
//           "https://attendancebackend-5cgn.onrender.com/api/location/alllocation"
//         );
//         if (res.data?.locations) setLocations(res.data.locations);
//       } catch (err) {
//         console.error("❌ Error fetching locations:", err);
//       }
//     };
//     fetchLocations();
//   }, []);

//   // Submit Employee
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrorMessage("");
//     setSuccessMessage("");
//     setLoading(true);

//     try {
//       // Step 1: Add Employee
//       await axios.post(
//         "https://localhost:5000/api/employees/add-employee",
//         {
//           name,
//           email,
//           password,
//           department,
//           role,
//           joinDate,
//           phone,
//           address,
//           employeeId,
//           locationId,
//         }
//       );

//       // Step 2: Assign Location
//       if (locationId) {
//         await axios.put(
//           `https://attendancebackend-5cgn.onrender.com/api/employees/assign-location/${employeeId}`,
//           { locationId }
//         );
//       }

//       // Step 3: Add Salary (WeekOff Included)
//       await axios.post(
//         "https://attendancebackend-5cgn.onrender.com/api/salary/set-salary",
//         {
//           employeeId,
//           name,
//           salaryPerMonth: Number(salaryPerMonth),
//           shiftHours: Number(shiftHours),
//           weekOffPerMonth: Number(weekOffPerMonth), // NEW FIELD
//         }
//       );

//       setSuccessMessage("✅ Employee & Salary added successfully!");

//       // Reset all fields
//       setName("");
//       setEmail("");
//       setPassword("");
//       setDepartment("");
//       setRole("");
//       setJoinDate("");
//       setPhone("");
//       setAddress("");
//       setEmployeeId("");
//       setLocationId("");

//       setSalaryPerMonth("");
//       setShiftHours("");
//       setWeekOffPerMonth(""); // RESET NEW FIELD

//       setTimeout(() => navigate("/employeelist"), 800);
//     } catch (err) {
//       console.error("❌ Error:", err);
//       setErrorMessage(err.response?.data?.message || "Something went wrong!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-4xl p-6 mx-auto bg-white rounded-lg shadow-lg">
//       <h2 className="mb-6 text-2xl font-bold text-blue-900">Add New Employee Data</h2>

//       {successMessage && (
//         <div className="p-4 mb-4 text-green-700 bg-green-100 rounded">
//           {successMessage}
//         </div>
//       )}
//       {errorMessage && (
//         <div className="p-4 mb-4 text-red-700 bg-red-100 rounded">
//           {errorMessage}
//         </div>
//       )}

//       <form onSubmit={handleSubmit}>
        
//         {/* NAME */}
//         <div className="mb-4">
//           <label className="block text-sm">Full Name</label>
//           <input
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             className="w-full p-2 border rounded"
//             required
//           />
//         </div>

//         {/* EMAIL */}
//         <div className="mb-4">
//           <label className="block text-sm">Email</label>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full p-2 border rounded"
//             required
//           />
//         </div>

//         {/* PASSWORD */}
//         <div className="mb-4 relative">
//           <label className="block text-sm">Password</label>
//           <input
//             type={showPassword ? "text" : "password"}
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full p-2 border rounded pr-10"
//             required
//           />
//           <button
//             type="button"
//             onClick={() => setShowPassword(!showPassword)}
//             className="absolute right-3 top-9 text-gray-600"
//           >
//             {showPassword ? <FaEyeSlash /> : <FaEye />}
//           </button>
//         </div>

//         {/* DEPARTMENT */}
//         <div className="mb-4">
//           <label className="block text-sm">Department</label>
//           <select
//             value={department}
//             onChange={(e) => setDepartment(e.target.value)}
//             className="w-full p-2 border rounded"
//             required
//           >
//             <option value="">Select Department</option>
//             {departments.map((d) => (
//               <option key={d}>{d}</option>
//             ))}
//           </select>
//         </div>

//         {/* ROLE */}
//         <div className="mb-4">
//           <label className="block text-sm">Role</label>
//           <select
//             value={role}
//             onChange={(e) => setRole(e.target.value)}
//             className="w-full p-2 border rounded"
//             required
//           >
//             <option value="">Select Role</option>
//             {roles.map((r) => (
//               <option key={r}>{r}</option>
//             ))}
//           </select>
//         </div>

//         {/* JOIN DATE */}
//         <div className="mb-4">
//           <label className="block text-sm">Join Date</label>
//           <input
//             type="date"
//             value={joinDate}
//             onChange={(e) => setJoinDate(e.target.value)}
//             className="w-full p-2 border rounded"
//             required
//           />
//         </div>




//         {/* PHONE */}
//         <div className="mb-4">
//           <label className="block text-sm">Phone</label>
//           <input
//             value={phone}
//             onChange={(e) => setPhone(e.target.value)}
//             className="w-full p-2 border rounded"
//           />
//         </div>

//         {/* ADDRESS */}
//         <div className="mb-4">
//           <label className="block text-sm">Address</label>
//           <textarea
//             value={address}
//             onChange={(e) => setAddress(e.target.value)}
//             className="w-full p-2 border rounded"
//           />
//         </div>

//         {/* EMPLOYEE ID */}
//         <div className="mb-4">
//           <label className="block text-sm">Employee ID</label>
//           <input
//             value={employeeId}
//             onChange={(e) => setEmployeeId(e.target.value)}
//             className="w-full p-2 border rounded"
//             required
//           />
//         </div>

//         {/* SALARY PER MONTH */}
//         <div className="mb-4">
//           <label className="block text-sm">Salary Per Month</label>
//           <input
//             type="number"
//             value={salaryPerMonth}
//             onChange={(e) => setSalaryPerMonth(e.target.value)}
//             className="w-full p-2 border rounded"
//             required
//           />
//         </div>

//         {/* SHIFT HOURS */}
//         <div className="mb-4">
//           <label className="block text-sm">Shift Hours Per Day</label>
//           <input
//             type="number"
//             value={shiftHours}
//             onChange={(e) => setShiftHours(e.target.value)}
//             className="w-full p-2 border rounded"
//             required
//           />
//         </div>

//         {/* WEEK OFF PER MONTH */}
//         <div className="mb-4">
//           <label className="block text-sm">Week Off Per Month</label>
//           <input
//             type="number"
//             value={weekOffPerMonth}
//             onChange={(e) => setWeekOffPerMonth(e.target.value)}
//             className="w-full p-2 border rounded"
//             required
//           />
//         </div>

//         {/* LOCATION */}
//         <div className="mb-4">
//           <label className="block text-sm">Location</label>
//           <select
//             value={locationId}
//             onChange={(e) => setLocationId(e.target.value)}
//             className="w-full p-2 border rounded"
//           >
//             <option value="">Select a Location</option>
//             {locations.map((loc) => (
//               <option key={loc._id} value={loc._id}>{loc.name}</option>
//             ))}
//           </select>
//         </div>

//         {/* SUBMIT */}
//         <button
//           type="submit"
//           disabled={loading}
//           className="px-6 py-2 bg-blue-600 text-white rounded"
//         >
//           {loading ? "Saving..." : "AddEmployee"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AddEmployeePage;


import axios from "axios";
import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const AddEmployeePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ edit se aaya hai ya nahi
  const editingEmployee = location.state?.employee || null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [locationId, setLocationId] = useState("");

  // Salary
  const [salaryPerMonth, setSalaryPerMonth] = useState("");
  const [shiftHours, setShiftHours] = useState("");
  const [weekOffPerMonth, setWeekOffPerMonth] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [locations, setLocations] = useState([]);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const departments = [
    "Developer","Sales","Marketing","Medical","Finance",
    "Nursing","Digital Marketing","Management","Laboratory Medicine"
  ];

  const roles = [
    "Administrator","Manager","Team Lead","Employee","HR Manager",
    "Phlebotomist","Staff Nurse","Sales Executive",
    "Consultant","Graphic Designer","UI/UX & GRAPHIC DESIGNER",
    "SMM & SEO Executive","Web Developer",
  ];

  // ✅ EDIT MODE AUTO-FILL (NO STRUCTURE CHANGE)
  useEffect(() => {
    if (editingEmployee) {
      setName(editingEmployee.name || "");
      setEmail(editingEmployee.email || "");
      setDepartment(editingEmployee.department || "");
      setRole(editingEmployee.role || "");
      setJoinDate(editingEmployee.joinDate?.slice(0, 10) || "");
      setPhone(editingEmployee.phone || "");
      setAddress(editingEmployee.address || "");
      setEmployeeId(editingEmployee.employeeId || "");

      setLocationId(
        editingEmployee.location?._id ||
        editingEmployee.location ||
        ""
      );

      setSalaryPerMonth(editingEmployee.salaryPerMonth || "");
      setShiftHours(editingEmployee.shiftHours || "");
      setWeekOffPerMonth(editingEmployee.weekOffPerMonth || "");

      // edit mode me password blank
      setPassword("");
    }
  }, [editingEmployee]);

  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get(
          "https://attendancebackend-5cgn.onrender.com/api/location/alllocation"
        );
        if (res.data?.locations) setLocations(res.data.locations);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLocations();
  }, []);

  // ✅ ADD / UPDATE SAME FORM (LOGIC FIXED)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (editingEmployee) {
        // ================= UPDATE EMPLOYEE =================
        const payload = {
          name,
          email,
          department,
          role,
          joinDate,
          phone,
          address,
          locationId,
        };

        if (password) payload.password = password;

        // ✅ correct employee update API
        await axios.put(
          `https://attendancebackend-5cgn.onrender.com/api/employees/update/${editingEmployee._id}`,
          payload
        );

        // ================= UPDATE SALARY =================
        await axios.put(
          `https://attendancebackend-5cgn.onrender.com/api/salary/update-salary/${editingEmployee.employeeId}`,
          {
            salaryPerMonth: Number(salaryPerMonth),
            shiftHours: Number(shiftHours),
            weekOffPerMonth: Number(weekOffPerMonth),
          }
        );

        setSuccessMessage("✅ Employee updated successfully!");
      } else {
        // ================= ADD EMPLOYEE =================
        await axios.post(
          "https://attendancebackend-5cgn.onrender.com/api/employees/add-employee",
          {
            name,
            email,
            password,
            department,
            role,
            joinDate,
            phone,
            address,
            employeeId,
            locationId,
          }
        );

        // ================= ADD SALARY =================
        await axios.post(
          "https://attendancebackend-5cgn.onrender.com/api/salary/set-salary",
          {
            employeeId,
            name,
            salaryPerMonth: Number(salaryPerMonth),
            shiftHours: Number(shiftHours),
            weekOffPerMonth: Number(weekOffPerMonth),
          }
        );

        setSuccessMessage("✅ Employee added successfully!");
      }

      setTimeout(() => navigate("/employeelist"), 800);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl p-6 mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="mb-6 text-2xl font-bold text-blue-900">
        Add New Employee Data
      </h2>

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

      {/* ❌ FORM STRUCTURE SAME */}
      <form onSubmit={handleSubmit}>

        <div className="mb-4">
          <label className="block text-sm">Full Name</label>
          <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full p-2 border rounded" required />
        </div>

        <div className="mb-4">
          <label className="block text-sm">Email</label>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full p-2 border rounded" required />
        </div>

        <div className="mb-4 relative">
          <label className="block text-sm">Password</label>
          <input type={showPassword?"text":"password"} value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full p-2 border rounded pr-10" />
          <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-9">
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm">Department</label>
          <select value={department} onChange={(e)=>setDepartment(e.target.value)} className="w-full p-2 border rounded" required>
            <option value="">Select Department</option>
            {departments.map((d)=><option key={d}>{d}</option>)}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm">Role</label>
          <select value={role} onChange={(e)=>setRole(e.target.value)} className="w-full p-2 border rounded" required>
            <option value="">Select Role</option>
            {roles.map((r)=><option key={r}>{r}</option>)}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm">Join Date</label>
          <input type="date" value={joinDate} onChange={(e)=>setJoinDate(e.target.value)} className="w-full p-2 border rounded" required />
        </div>

        <div className="mb-4">
          <label className="block text-sm">Phone</label>
          <input value={phone} onChange={(e)=>setPhone(e.target.value)} className="w-full p-2 border rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-sm">Address</label>
          <textarea value={address} onChange={(e)=>setAddress(e.target.value)} className="w-full p-2 border rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-sm">Employee ID</label>
          <input value={employeeId} onChange={(e)=>setEmployeeId(e.target.value)} className="w-full p-2 border rounded" required />
        </div>

        <div className="mb-4">
          <label className="block text-sm">Salary Per Month</label>
          <input type="number" value={salaryPerMonth} onChange={(e)=>setSalaryPerMonth(e.target.value)} className="w-full p-2 border rounded" required />
        </div>

        <div className="mb-4">
          <label className="block text-sm">Shift Hours Per Day</label>
          <input type="number" value={shiftHours} onChange={(e)=>setShiftHours(e.target.value)} className="w-full p-2 border rounded" required />
        </div>

        <div className="mb-4">
          <label className="block text-sm">Week Off Per Month</label>
          <input type="number" value={weekOffPerMonth} onChange={(e)=>setWeekOffPerMonth(e.target.value)} className="w-full p-2 border rounded" required />
        </div>

        <div className="mb-4">
          <label className="block text-sm">Location</label>
          <select value={locationId} onChange={(e)=>setLocationId(e.target.value)} className="w-full p-2 border rounded">
            <option value="">Select a Location</option>
            {locations.map((loc)=>(
              <option key={loc._id} value={loc._id}>{loc.name}</option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded">
          {loading ? "Saving..." : editingEmployee ? "Update Employee" : "Add Employee"}
        </button>

      </form>
    </div>
  );
};

export default AddEmployeePage;
