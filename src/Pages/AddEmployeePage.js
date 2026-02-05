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
//       const response = await fetch("https://api.timelyhealth.in/api/employees/add-employee", {
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
//           "https://api.timelyhealth.in/api/location/alllocation"
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
//         "https://api.timelyhealth.in/api/employees/add-employee",
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
//           `https://api.timelyhealth.in/api/employees/assign-location/${employeeId}`,
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
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black bg-opacity-40">
//           <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
//             <h3 className="mb-4 text-lg font-semibold">Select Location</h3>
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

//             <div className="flex justify-end gap-3 mt-4">
//               <button
//                 onClick={handleCloseLocationModal}
//                 className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleCloseLocationModal}
//                 className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
//               >
//                 Done
//               </button>
//             </div>

//             <button
//               onClick={handleCloseLocationModal}
//               className="absolute text-xl text-gray-500 top-2 right-3"
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
//           "https://api.timelyhealth.in/api/location/alllocation"
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
//           `https://api.timelyhealth.in/api/employees/assign-location/${employeeId}`,
//           { locationId }
//         );
//       }

//       // Step 3: Add Salary (WeekOff Included)
//       await axios.post(
//         "https://api.timelyhealth.in/api/salary/set-salary",
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
//         <div className="relative mb-4">
//           <label className="block text-sm">Password</label>
//           <input
//             type={showPassword ? "text" : "password"}
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full p-2 pr-10 border rounded"
//             required
//           />
//           <button
//             type="button"
//             onClick={() => setShowPassword(!showPassword)}
//             className="absolute text-gray-600 right-3 top-9"
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
//           className="px-6 py-2 text-white bg-blue-600 rounded"
//         >
//           {loading ? "Saving..." : "AddEmployee"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AddEmployeePage;


// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import { useLocation, useNavigate } from "react-router-dom";

// const AddEmployeePage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // ✅ edit se aaya hai ya nahi
//   const editingEmployee = location.state?.employee || null;

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

//   // Salary
//   const [salaryPerMonth, setSalaryPerMonth] = useState("");
//   const [shiftHours, setShiftHours] = useState("");
//   const [weekOffPerMonth, setWeekOffPerMonth] = useState("");

//   const [isAddingNewDept, setIsAddingNewDept] = useState(false);
//   const [customDepartment, setCustomDepartment] = useState("");
//   const [isAddingNewRole, setIsAddingNewRole] = useState(false);
//   const [customRole, setCustomRole] = useState("");

//   const [showPassword, setShowPassword] = useState(false);
//   const [locations, setLocations] = useState([]);

//   const [loading, setLoading] = useState(false);
//   const [successMessage, setSuccessMessage] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");

//   const departments = [
//     "Developer", "Sales", "Marketing", "Medical", "Finance",
//     "Nursing", "Digital Marketing", "Management", "Laboratory Medicine"
//   ];

//   const roles = [
//     "Administrator", "Manager", "Team Lead", "Employee", "HR Manager",
//     "Phlebotomist", "Staff Nurse", "Sales Executive",
//     "Consultant", "Graphic Designer", "UI/UX & GRAPHIC DESIGNER",
//     "SMM & SEO Executive", "Web Developer",
//   ];

//   // ✅ EDIT MODE AUTO-FILL (NO STRUCTURE CHANGE)
//   useEffect(() => {
//     if (editingEmployee) {
//       setName(editingEmployee.name || "");
//       setEmail(editingEmployee.email || "");
//       setDepartment(editingEmployee.department || "");
//       setRole(editingEmployee.role || "");
//       setJoinDate(editingEmployee.joinDate?.slice(0, 10) || "");
//       setPhone(editingEmployee.phone || "");
//       setAddress(editingEmployee.address || "");
//       setEmployeeId(editingEmployee.employeeId || "");

//       setLocationId(
//         editingEmployee.location?._id ||
//         editingEmployee.location ||
//         ""
//       );

//       setSalaryPerMonth(editingEmployee.salaryPerMonth || "");
//       setShiftHours(editingEmployee.shiftHours || "");
//       setWeekOffPerMonth(editingEmployee.weekOffPerMonth || "");

//       // edit mode me password blank
//       setPassword("");
//     }
//   }, [editingEmployee]);

//   // Fetch locations
//   useEffect(() => {
//     const fetchLocations = async () => {
//       try {
//         const res = await axios.get(
//           "https://api.timelyhealth.in/api/location/alllocation"
//         );
//         if (res.data?.locations) setLocations(res.data.locations);
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     fetchLocations();
//   }, []);

//   // ✅ ADD / UPDATE SAME FORM (LOGIC FIXED)
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrorMessage("");
//     setSuccessMessage("");

//     try {
//       const finalDept = isAddingNewDept ? customDepartment : department;
//       const finalRole = isAddingNewRole ? customRole : role;

//       if (editingEmployee) {
//         // ================= UPDATE EMPLOYEE =================
//         const profilePayload = {
//           name,
//           email,
//           department: finalDept,
//           role: finalRole,
//           joinDate,
//           phone,
//           address,
//           locationId, // Send as locationId
//           location: locationId, // Also send as location for compatibility
//         };

//         // password optional during edit
//         if (password) profilePayload.password = password;

//         await axios.put(
//           `https://api.timelyhealth.in/api/employees/update/${editingEmployee._id}`,
//           profilePayload
//         );

//         // ================= UPDATE SALARY (ONLY IF VALUES PROVIDED) =================
//         if (salaryPerMonth || shiftHours || weekOffPerMonth) {
//           try {
//             await axios.put(
//               `https://api.timelyhealth.in/api/salary/update-salary/${editingEmployee.employeeId}`,
//               {
//                 employeeId: editingEmployee.employeeId,
//                 salaryPerMonth: Number(salaryPerMonth) || 0,
//                 shiftHours: Number(shiftHours) || 8,
//                 weekOffPerMonth: Number(weekOffPerMonth) || 0,
//               }
//             );
//           } catch (salErr) {
//             console.warn("⚠️ Salary update failed, but profile updated:", salErr.message);
//           }
//         }

//         setSuccessMessage("✅ Employee details updated successfully!");
//       } else {
//         // ================= ADD EMPLOYEE =================
//         await axios.post(
//           "https://api.timelyhealth.in/api/employees/add-employee",
//           {
//             name,
//             email,
//             password,
//             department: finalDept,
//             role: finalRole,
//             joinDate,
//             phone,
//             address,
//             employeeId,
//             locationId,
//           }
//         );

//         // ================= ADD SALARY =================
//         await axios.post(
//           "https://api.timelyhealth.in/api/salary/set-salary",
//           {
//             employeeId,
//             name,
//             salaryPerMonth: Number(salaryPerMonth),
//             shiftHours: Number(shiftHours),
//             weekOffPerMonth: Number(weekOffPerMonth),
//           }
//         );

//         setSuccessMessage("✅ Employee added successfully!");
//       }

//       setTimeout(() => navigate("/employeelist"), 800);
//     } catch (err) {
//       setErrorMessage(err.response?.data?.message || "Something went wrong!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-4xl p-6 mx-auto bg-white rounded-lg shadow-lg">
//       <h2 className="mb-6 text-2xl font-bold text-blue-900">
//         Add New Employee Data
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

//       {/* ❌ FORM STRUCTURE SAME */}
//       <form onSubmit={handleSubmit}>

//         <div className="mb-4">
//           <label className="block text-sm">Full Name</label>
//           <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" required />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Email</label>
//           <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded" required />
//         </div>

//         <div className="relative mb-4">
//           <label className="block text-sm">Password</label>
//           <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 pr-10 border rounded" />
//           <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9">
//             {showPassword ? <FaEyeSlash /> : <FaEye />}
//           </button>
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Department</label>
//           <div className="flex gap-2">
//             <select
//               value={isAddingNewDept ? "ADD_NEW" : department}
//               onChange={(e) => {
//                 if (e.target.value === "ADD_NEW") {
//                   setIsAddingNewDept(true);
//                   setDepartment("");
//                 } else {
//                   setIsAddingNewDept(false);
//                   setDepartment(e.target.value);
//                 }
//               }}
//               className="w-full p-2 border rounded"
//               required={!isAddingNewDept}
//             >
//               <option value="">Select Department</option>
//               {departments.map((d) => <option key={d} value={d}>{d}</option>)}
//               <option value="ADD_NEW" className="font-bold text-blue-600">+ Add New Department</option>
//             </select>
//           </div>
//           {isAddingNewDept && (
//             <div className="flex items-center gap-2 mt-2">
//               <input
//                 type="text"
//                 placeholder="Enter new department name"
//                 value={customDepartment}
//                 onChange={(e) => setCustomDepartment(e.target.value)}
//                 className="flex-1 p-2 border border-blue-300 rounded outline-none focus:ring-1 focus:ring-blue-400"
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setIsAddingNewDept(false)}
//                 className="text-xs font-medium text-red-500 hover:text-red-700"
//               >
//                 Cancel
//               </button>
//             </div>
//           )}
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Role</label>
//           <div className="flex gap-2">
//             <select
//               value={isAddingNewRole ? "ADD_NEW" : role}
//               onChange={(e) => {
//                 if (e.target.value === "ADD_NEW") {
//                   setIsAddingNewRole(true);
//                   setRole("");
//                 } else {
//                   setIsAddingNewRole(false);
//                   setRole(e.target.value);
//                 }
//               }}
//               className="w-full p-2 border rounded"
//               required={!isAddingNewRole}
//             >
//               <option value="">Select Role</option>
//               {roles.map((r) => <option key={r} value={r}>{r}</option>)}
//               <option value="ADD_NEW" className="font-bold text-blue-600">+ Add New Role</option>
//             </select>
//           </div>
//           {isAddingNewRole && (
//             <div className="flex items-center gap-2 mt-2">
//               <input
//                 type="text"
//                 placeholder="Enter new role name"
//                 value={customRole}
//                 onChange={(e) => setCustomRole(e.target.value)}
//                 className="flex-1 p-2 border border-blue-300 rounded outline-none focus:ring-1 focus:ring-blue-400"
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setIsAddingNewRole(false)}
//                 className="text-xs font-medium text-red-500 hover:text-red-700"
//               >
//                 Cancel
//               </button>
//             </div>
//           )}
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Join Date</label>
//           <input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} className="w-full p-2 border rounded" required />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Phone</label>
//           <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2 border rounded" />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Address</label>
//           <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-2 border rounded" />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Employee ID</label>
//           <input
//             value={employeeId}
//             onChange={(e) => setEmployeeId(e.target.value)}
//             className={`w-full p-2 border rounded ${editingEmployee ? 'bg-gray-100 cursor-not-allowed' : ''}`}
//             required
//             readOnly={!!editingEmployee}
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Salary Per Month</label>
//           <input type="number" value={salaryPerMonth} onChange={(e) => setSalaryPerMonth(e.target.value)} className="w-full p-2 border rounded" required />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Shift Hours Per Day</label>
//           <input type="number" value={shiftHours} onChange={(e) => setShiftHours(e.target.value)} className="w-full p-2 border rounded" required />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Week Off Per Month</label>
//           <input type="number" value={weekOffPerMonth} onChange={(e) => setWeekOffPerMonth(e.target.value)} className="w-full p-2 border rounded" required />
//         </div>

//         {/* <div className="mb-4">
//           <label className="block text-sm">Location</label> <button>Add New Location</button>
//           <select value={locationId} onChange={(e) => setLocationId(e.target.value)} className="w-full p-2 border rounded">
//             <option value="">Select a Location</option>
//             {locations.map((loc) => (
//               <option key={loc._id} value={loc._id}>{loc.name}</option>
//             ))}
//           </select>
//         </div> */}

//         <div className="mb-4">
//   {/* Label + Button */}
//   <div className="flex items-center justify-between mb-1">
//     <label className="text-sm font-medium text-gray-700">
//       Location
//     </label>

//     <button onClick={()=>navigate("/addlocation")}
//       type="button"
//       className="px-3 py-1 text-xs font-semibold text-white transition bg-blue-600 rounded-md hover:bg-blue-700"
//     >
//       + Add Location
//     </button>
//   </div>

//   {/* Select */}
//   <select
//     value={locationId}
//     onChange={(e) => setLocationId(e.target.value)}
//     className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//   >
//     <option value="">Select a Location</option>
//     {locations.map((loc) => (
//       <option key={loc._id} value={loc._id}>
//         {loc.name}
//       </option>
//     ))}
//   </select>
// </div>


//         <button type="submit" disabled={loading} className="px-6 py-2 text-white bg-blue-600 rounded">
//           {loading ? "Saving..." : editingEmployee ? "Update Employee" : "Add Employee"}
//         </button>

//       </form>
//     </div>
//   );
// };

// export default AddEmployeePage;

// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import { useLocation, useNavigate } from "react-router-dom";

// const AddEmployeePage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const editingEmployee = location.state?.employee || null;

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [department, setDepartment] = useState("");
//   const [role, setRole] = useState("");
//   const [shiftType, setShiftType] = useState("A");
//   const [shiftStartTime, setShiftStartTime] = useState("09:00"); // ✅ Start time
//   const [shiftEndTime, setShiftEndTime] = useState("18:00"); // ✅ End time
//   const [joinDate, setJoinDate] = useState("");
//   const [phone, setPhone] = useState("");
//   const [address, setAddress] = useState("");
//   const [employeeId, setEmployeeId] = useState("");
//   const [locationId, setLocationId] = useState("");
//   const [salaryPerMonth, setSalaryPerMonth] = useState("");
//   const [shiftHours, setShiftHours] = useState("8");
//   const [weekOffPerMonth, setWeekOffPerMonth] = useState("0");

//   const [isAddingNewDept, setIsAddingNewDept] = useState(false);
//   const [customDepartment, setCustomDepartment] = useState("");
//   const [isAddingNewRole, setIsAddingNewRole] = useState(false);
//   const [customRole, setCustomRole] = useState("");
//   const [isAddingNewShift, setIsAddingNewShift] = useState(false);
//   const [customShiftType, setCustomShiftType] = useState("");
//   const [customShiftStartTime, setCustomShiftStartTime] = useState("09:00"); // ✅ New shift start time
//   const [customShiftEndTime, setCustomShiftEndTime] = useState("18:00"); // ✅ New shift end time

//   const [showPassword, setShowPassword] = useState(false);
//   const [locations, setLocations] = useState([]);
//   const [shiftList, setShiftList] = useState(["A", "B", "C", "D", "E", "F", "G", "H", "I"]);
//   const [allShiftsData, setAllShiftsData] = useState([]); // ✅ Store all shift data with times
//   const [loading, setLoading] = useState(false);
//   const [successMessage, setSuccessMessage] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");

//   const departments = [
//     "Developer", "Sales", "Marketing", "Medical", "Finance",
//     "Nursing", "Digital Marketing", "Management", "Laboratory Medicine"
//   ];

//   const roles = [
//     "Administrator", "Manager", "Team Lead", "Employee", "HR Manager",
//     "Phlebotomist", "Staff Nurse", "Sales Executive",
//     "Consultant", "Graphic Designer", "UI/UX & GRAPHIC DESIGNER",
//     "SMM & SEO Executive", "Web Developer",
//   ];

//   useEffect(() => {
//     if (editingEmployee) {
//       setName(editingEmployee.name || "");
//       setEmail(editingEmployee.email || "");
//       setDepartment(editingEmployee.department || "");
//       setRole(editingEmployee.role || "");
//       setJoinDate(editingEmployee.joinDate?.slice(0, 10) || "");
//       setPhone(editingEmployee.phone || "");
//       setAddress(editingEmployee.address || "");
//       setEmployeeId(editingEmployee.employeeId || "");
//       setLocationId(editingEmployee.location?._id || editingEmployee.location || "");
//       setSalaryPerMonth(editingEmployee.salaryPerMonth || "");
//       setShiftHours(editingEmployee.shiftHours || "");
//       setWeekOffPerMonth(editingEmployee.weekOffPerMonth || "");
//       setPassword("");

//       // Fetch employee's shift if editing
//       fetchEmployeeShift();
//     }
//   }, [editingEmployee]);

//   // Fetch employee's existing shift
//   const fetchEmployeeShift = async () => {
//     if (!editingEmployee?.employeeId) return;

//     try {
//       const res = await axios.get(`https://api.timelyhealth.in/api/shifts/employee/${editingEmployee.employeeId}`);
//       if (res.data && !res.data.message) {
//         setShiftType(res.data.shiftType);
//         setShiftStartTime(res.data.startTime || "09:00");
//         setShiftEndTime(res.data.endTime || "18:00");
//       }
//     } catch (err) {
//       console.log("No shift assigned yet");
//     }
//   };

//   // Fetch locations
//   useEffect(() => {
//     const fetchLocations = async () => {
//       try {
//         const res = await axios.get("https://api.timelyhealth.in/api/location/alllocation");
//         if (res.data?.locations) setLocations(res.data.locations);
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     fetchLocations();
//   }, []);

//   // ✅ Fetch all shifts data with times
//   useEffect(() => {
//     const fetchAllShifts = async () => {
//       try {
//         const res = await axios.get("https://api.timelyhealth.in/api/shifts/all");
//         console.log("All shifts data:", res.data);

//         if (res.data && Array.isArray(res.data)) {
//           setAllShiftsData(res.data);

//           // Get unique shift types
//           const uniqueShifts = [...new Set(res.data.map(shift => shift.shiftType))];
//           setShiftList(uniqueShifts);

//           // Set default times from first shift if available
//           if (res.data.length > 0) {
//             const firstShift = res.data[0];
//             if (!shiftStartTime) setShiftStartTime(firstShift.startTime || "09:00");
//             if (!shiftEndTime) setShiftEndTime(firstShift.endTime || "18:00");
//           }
//         }
//       } catch (err) {
//         console.log("Using default shifts:", err.message);
//       }
//     };
//     fetchAllShifts();
//   }, []);

//   // ✅ When shift type changes, update times if shift exists
//   useEffect(() => {
//     if (shiftType && !isAddingNewShift && allShiftsData.length > 0) {
//       const existingShift = allShiftsData.find(s => s.shiftType === shiftType);
//       if (existingShift) {
//         setShiftStartTime(existingShift.startTime || "09:00");
//         setShiftEndTime(existingShift.endTime || "18:00");
//       }
//     }
//   }, [shiftType, isAddingNewShift, allShiftsData]);

//   // ✅ Shift assign function with custom times
//   const assignShiftToEmployee = async (empId, empName, shift, startTime, endTime) => {
//     try {
//       const shiftData = {
//         employeeId: empId,
//         employeeName: empName,
//         shiftType: shift.toUpperCase(),
//         startTime: startTime,
//         endTime: endTime
//       };

//       const response = await axios.post(
//         "https://api.timelyhealth.in/api/shifts/assign",
//         shiftData
//       );

//       console.log("Shift assigned with times:", response.data);
//       return { success: true, data: response.data };

//     } catch (error) {
//       console.error("Shift assignment error:", error.response?.data || error.message);
//       return {
//         success: false,
//         message: error.response?.data?.message || error.message
//       };
//     }
//   };

//   // ✅ Main submit function
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrorMessage("");
//     setSuccessMessage("");

//     try {
//       const finalDept = isAddingNewDept ? customDepartment : department;
//       const finalRole = isAddingNewRole ? customRole : role;
//       let finalShift = isAddingNewShift ? customShiftType : shiftType;
//       let finalStartTime = isAddingNewShift ? customShiftStartTime : shiftStartTime;
//       let finalEndTime = isAddingNewShift ? customShiftEndTime : shiftEndTime;

//       // Shift validation
//       if (!finalShift) {
//         throw new Error("Please select a shift type");
//       }

//       finalShift = finalShift.toUpperCase().trim();

//       if (finalShift.length !== 1 || !/^[A-Z]$/.test(finalShift)) {
//         throw new Error("Shift type should be a single letter from A to Z");
//       }

//       // Time validation
//       if (!finalStartTime || !finalEndTime) {
//         throw new Error("Please select both start and end time");
//       }

//       if (finalStartTime >= finalEndTime) {
//         throw new Error("End time must be after start time");
//       }

//       if (editingEmployee) {
//         // ================= UPDATE EMPLOYEE =================
//         const profilePayload = {
//           name,
//           email,
//           department: finalDept,
//           role: finalRole,
//           joinDate,
//           phone,
//           address,
//           locationId,
//           location: locationId,
//         };

//         if (password) profilePayload.password = password;

//         // 1. Update employee
//         await axios.put(
//           `https://api.timelyhealth.in/api/employees/update/${editingEmployee._id}`,
//           profilePayload
//         );

//         // 2. Assign shift with custom times
//         const shiftResult = await assignShiftToEmployee(
//           editingEmployee.employeeId,
//           name,
//           finalShift,
//           finalStartTime,
//           finalEndTime
//         );

//         if (!shiftResult.success) {
//           console.warn("Shift assignment note:", shiftResult.message);
//         }

//         // 3. Update salary
//         if (salaryPerMonth || shiftHours || weekOffPerMonth) {
//           try {
//             await axios.put(
//               `https://api.timelyhealth.in/api/salary/update-salary/${editingEmployee.employeeId}`,
//               {
//                 employeeId: editingEmployee.employeeId,
//                 salaryPerMonth: Number(salaryPerMonth) || 0,
//                 shiftHours: Number(shiftHours) || 8,
//                 weekOffPerMonth: Number(weekOffPerMonth) || 0,
//               }
//             );
//           } catch (salErr) {
//             console.warn("Salary update:", salErr.message);
//           }
//         }

//         // 4. Add new shift to list if created
//         if (isAddingNewShift && !shiftList.includes(finalShift)) {
//           setShiftList(prev => [...prev, finalShift]);
//           setAllShiftsData(prev => [...prev, {
//             shiftType: finalShift,
//             startTime: finalStartTime,
//             endTime: finalEndTime
//           }]);
//         }

//         setSuccessMessage("✅ Employee updated successfully!");

//       } else {
//         // ================= ADD NEW EMPLOYEE =================
//         // 1. Add employee
//         await axios.post(
//           "https://api.timelyhealth.in/api/employees/add-employee",
//           {
//             name,
//             email,
//             password,
//             department: finalDept,
//             role: finalRole,
//             joinDate,
//             phone,
//             address,
//             employeeId,
//             locationId,
//           }
//         );

//         // 2. Assign shift with custom times
//         const shiftResult = await assignShiftToEmployee(
//           employeeId,
//           name,
//           finalShift,
//           finalStartTime,
//           finalEndTime
//         );

//         if (!shiftResult.success) {
//           console.warn("Shift assignment note:", shiftResult.message);
//         }

//         // 3. Add salary
//         await axios.post(
//           "https://api.timelyhealth.in/api/salary/set-salary",
//           {
//             employeeId,
//             name,
//             salaryPerMonth: Number(salaryPerMonth),
//             shiftHours: Number(shiftHours),
//             weekOffPerMonth: Number(weekOffPerMonth),
//           }
//         );

//         // 4. Add new shift to list if created
//         if (isAddingNewShift && !shiftList.includes(finalShift)) {
//           setShiftList(prev => [...prev, finalShift]);
//           setAllShiftsData(prev => [...prev, {
//             shiftType: finalShift,
//             startTime: finalStartTime,
//             endTime: finalEndTime
//           }]);
//         }

//         setSuccessMessage("✅ Employee added successfully!");
//       }

//       setTimeout(() => navigate("/employeelist"), 1000);
//     } catch (err) {
//       console.error("Submit error:", err);
//       setErrorMessage(err.message || "Something went wrong!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-4xl p-6 mx-auto bg-white rounded-lg shadow-lg">
//       <h2 className="mb-6 text-2xl font-bold text-blue-900">
//         {editingEmployee ? "Edit Employee" : "Add New Employee"}
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

//         {/* Name, Email, Password, Department, Role fields - SAME AS BEFORE */}

//         <div className="mb-4">
//           <label className="block text-sm">Full Name *</label>
//           <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" required />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Email *</label>
//           <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded" required />
//         </div>

//         <div className="relative mb-4">
//           <label className="block text-sm">Password {!editingEmployee && "*"}</label>
//           <input
//             type={showPassword ? "text" : "password"}
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full p-2 pr-10 border rounded"
//             required={!editingEmployee}
//           />
//           <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9">
//             {showPassword ? <FaEyeSlash /> : <FaEye />}
//           </button>
//           {editingEmployee && <p className="mt-1 text-xs text-gray-500">Leave blank to keep current password</p>}
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Department</label>
//           <div className="flex gap-2">
//             <select
//               value={isAddingNewDept ? "ADD_NEW" : department}
//               onChange={(e) => {
//                 if (e.target.value === "ADD_NEW") {
//                   setIsAddingNewDept(true);
//                   setDepartment("");
//                 } else {
//                   setIsAddingNewDept(false);
//                   setDepartment(e.target.value);
//                 }
//               }}
//               className="w-full p-2 border rounded"
//               required={!isAddingNewDept}
//             >
//               <option value="">Select Department</option>
//               {departments.map((d) => <option key={d} value={d}>{d}</option>)}
//               <option value="ADD_NEW" className="font-bold text-blue-600">+ Add New Department</option>
//             </select>
//           </div>
//           {isAddingNewDept && (
//             <div className="flex items-center gap-2 mt-2">
//               <input
//                 type="text"
//                 placeholder="Enter new department name"
//                 value={customDepartment}
//                 onChange={(e) => setCustomDepartment(e.target.value)}
//                 className="flex-1 p-2 border border-blue-300 rounded outline-none focus:ring-1 focus:ring-blue-400"
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setIsAddingNewDept(false)}
//                 className="text-xs font-medium text-red-500 hover:text-red-700"
//               >
//                 Cancel
//               </button>
//             </div>
//           )}
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Role</label>
//           <div className="flex gap-2">
//             <select
//               value={isAddingNewRole ? "ADD_NEW" : role}
//               onChange={(e) => {
//                 if (e.target.value === "ADD_NEW") {
//                   setIsAddingNewRole(true);
//                   setRole("");
//                 } else {
//                   setIsAddingNewRole(false);
//                   setRole(e.target.value);
//                 }
//               }}
//               className="w-full p-2 border rounded"
//               required={!isAddingNewRole}
//             >
//               <option value="">Select Role</option>
//               {roles.map((r) => <option key={r} value={r}>{r}</option>)}
//               <option value="ADD_NEW" className="font-bold text-blue-600">+ Add New Role</option>
//             </select>
//           </div>
//           {isAddingNewRole && (
//             <div className="flex items-center gap-2 mt-2">
//               <input
//                 type="text"
//                 placeholder="Enter new role name"
//                 value={customRole}
//                 onChange={(e) => setCustomRole(e.target.value)}
//                 className="flex-1 p-2 border border-blue-300 rounded outline-none focus:ring-1 focus:ring-blue-400"
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setIsAddingNewRole(false)}
//                 className="text-xs font-medium text-red-500 hover:text-red-700"
//               >
//                 Cancel
//               </button>
//             </div>
//           )}
//         </div>

//         {/* ✅ ENHANCED SHIFT SECTION WITH TIME PICKERS */}
//         <div className="p-4 mb-4 border rounded-lg bg-gray-50">
//           <label className="block mb-2 text-sm font-medium">Shift Details *</label>

//           <div className="flex gap-2 mb-3">
//             <select
//               value={isAddingNewShift ? "ADD_NEW" : shiftType}
//               onChange={(e) => {
//                 if (e.target.value === "ADD_NEW") {
//                   setIsAddingNewShift(true);
//                   setShiftType("");
//                 } else {
//                   setIsAddingNewShift(false);
//                   setShiftType(e.target.value);
//                 }
//               }}
//               className="w-full p-2 border rounded"
//               required={!isAddingNewShift}
//             >
//               <option value="">Select Shift Type</option>
//               {shiftList.map((shift) => (
//                 <option key={shift} value={shift}>Shift {shift}</option>
//               ))}
//               <option value="ADD_NEW" className="font-bold text-blue-600">+ Add New Shift Type</option>
//             </select>
//           </div>

//           {isAddingNewShift ? (
//             <div className="p-3 space-y-4 border border-blue-200 rounded bg-blue-50">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm font-medium text-blue-800">Create New Shift Type</span>
//                 <button
//                   type="button"
//                   onClick={() => setIsAddingNewShift(false)}
//                   className="text-xs font-medium text-red-500 hover:text-red-700"
//                 >
//                   Cancel
//                 </button>
//               </div>

//               <div>
//                 <label className="block mb-1 text-xs text-gray-600">Shift Type Code *</label>
//                 <input
//                   type="text"
//                   placeholder="Enter shift type (A, B, C, etc.)"
//                   value={customShiftType}
//                   onChange={(e) => {
//                     const value = e.target.value.toUpperCase();
//                     if (value.length <= 1) {
//                       setCustomShiftType(value);
//                     }
//                   }}
//                   className="w-full p-2 border border-blue-300 rounded outline-none focus:ring-1 focus:ring-blue-400"
//                   maxLength="1"
//                   required
//                 />
//                 <p className="mt-1 text-xs text-gray-500">Single letter from A to Z</p>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block mb-1 text-xs text-gray-600">Start Time *</label>
//                   <input
//                     type="time"
//                     value={customShiftStartTime}
//                     onChange={(e) => setCustomShiftStartTime(e.target.value)}
//                     className="w-full p-2 border border-blue-300 rounded outline-none focus:ring-1 focus:ring-blue-400"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block mb-1 text-xs text-gray-600">End Time *</label>
//                   <input
//                     type="time"
//                     value={customShiftEndTime}
//                     onChange={(e) => setCustomShiftEndTime(e.target.value)}
//                     className="w-full p-2 border border-blue-300 rounded outline-none focus:ring-1 focus:ring-blue-400"
//                     required
//                   />
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {/* Show shift details if existing shift is selected */}
//               {shiftType && (
//                 <div className="p-3 bg-white border border-gray-200 rounded">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-sm font-medium">
//                       Selected: <span className="text-blue-600">Shift {shiftType}</span>
//                     </span>
//                     {allShiftsData.find(s => s.shiftType === shiftType) && (
//                       <span className="text-xs text-green-600">✓ Existing Shift</span>
//                     )}
//                   </div>

//                   <div className="grid grid-cols-2 gap-3">
//                     <div>
//                       <label className="block mb-1 text-xs text-gray-600">Start Time *</label>
//                       <input
//                         type="time"
//                         value={shiftStartTime}
//                         onChange={(e) => setShiftStartTime(e.target.value)}
//                         className="w-full p-2 border rounded"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label className="block mb-1 text-xs text-gray-600">End Time *</label>
//                       <input
//                         type="time"
//                         value={shiftEndTime}
//                         onChange={(e) => setShiftEndTime(e.target.value)}
//                         className="w-full p-2 border rounded"
//                         required
//                       />
//                     </div>
//                   </div>

//                   {/* Show shift timing info if exists */}
//                   {(() => {
//                     const selectedShift = allShiftsData.find(s => s.shiftType === shiftType);
//                     if (selectedShift) {
//                       return (
//                         <div className="mt-2 text-xs text-gray-500">
//                           <p>Default timing for this shift: {selectedShift.startTime} - {selectedShift.endTime}</p>
//                           <p className="mt-1">You can modify the timing for this employee</p>
//                         </div>
//                       );
//                     }
//                   })()}
//                 </div>
//               )}
//             </div>
//           )}

//           <p className="mt-2 text-xs text-gray-500">
//             Available shifts: {shiftList.join(", ")}
//           </p>
//         </div>

//         {/* Rest of the form - SAME AS BEFORE */}
//         <div className="mb-4">
//           <label className="block text-sm">Join Date *</label>
//           <input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} className="w-full p-2 border rounded" required />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Phone</label>
//           <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2 border rounded" />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Address</label>
//           <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-2 border rounded" />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Employee ID *</label>
//           <input
//             value={employeeId}
//             onChange={(e) => setEmployeeId(e.target.value)}
//             className={`w-full p-2 border rounded ${editingEmployee ? 'bg-gray-100 cursor-not-allowed' : ''}`}
//             required
//             readOnly={!!editingEmployee}
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Salary Per Month *</label>
//           <input type="number" value={salaryPerMonth} onChange={(e) => setSalaryPerMonth(e.target.value)} className="w-full p-2 border rounded" required />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Shift Hours Per Day *</label>
//           <input type="number" value={shiftHours} onChange={(e) => setShiftHours(e.target.value)} className="w-full p-2 border rounded" required />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Week Off Per Month *</label>
//           <input type="number" value={weekOffPerMonth} onChange={(e) => setWeekOffPerMonth(e.target.value)} className="w-full p-2 border rounded" required />
//         </div>

//         {/* <div className="mb-4">
//           <div className="flex items-center justify-between mb-1">
//             <label className="text-sm font-medium text-gray-700">
//               Location
//             </label>
//             <button onClick={() => navigate("/addlocation")}
//               type="button"
//               className="px-3 py-1 text-xs font-semibold text-white transition bg-blue-600 rounded-md hover:bg-blue-700"
//             >
//               + Add Location
//             </button>
//           </div>
//           <select
//             value={locationId}
//             onChange={(e) => setLocationId(e.target.value)}
//             className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Select a Location</option>
//             {locations.map((loc) => (
//               <option key={loc._id} value={loc._id}>
//                 {loc.name}
//               </option>
//             ))}
//           </select>

//         </div> */}

//         <div className="mb-4">
//           {/* Label + Button */}
//           <div className="flex items-center justify-between mb-1">
//             <label className="text-sm font-medium text-gray-700">
//               Location
//             </label>

//             {/* <button onClick={() => navigate("/addlocation")}
//               type="button"
//               className="px-3 py-1 text-xs font-semibold text-white transition bg-blue-600 rounded-md hover:bg-blue-700"
//             >
//               + Add Location
//             </button> */}
//           </div>

//           {/* Select */}
//           {/* <select
//             value={locationId}
//             onChange={(e) => setLocationId(e.target.value)}
//             className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Select a Location</option>
//             {locations.map((loc) => (
//               <option key={loc._id} value={loc._id}>
//                 {loc.name}
//               </option>
//             ))}
//           </select> */}
//           <select
//             value={locationId}
//             onChange={(e) => {
//               const selectedValue = e.target.value;

//               if (selectedValue === "add-new") {
//                 navigate("/addlocation");
//                 return;
//               }

//               setLocationId(selectedValue);
//             }}
//             className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Select a Location</option>

//             {locations.map((loc) => (
//               <option key={loc._id} value={loc._id}>
//                 {loc.name}
//               </option>
//             ))}

//             <option value="add-new">➕ Add New Location</option>
//           </select>


//         </div>



//         <button type="submit" disabled={loading} className="px-6 py-2 text-white bg-blue-600 rounded">
//           {loading ? "Saving..." : editingEmployee ? "Update Employee" : "Add Employee"}
//         </button>

//       </form>
//     </div>
//   );
// };

// export default AddEmployeePage;

// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import { useLocation, useNavigate } from "react-router-dom";

// const AddEmployeePage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const editingEmployee = location.state?.employee || null;

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [department, setDepartment] = useState("");
//   const [role, setRole] = useState("");
//   const [shiftType, setShiftType] = useState("A");
//   const [shiftStartTime, setShiftStartTime] = useState("09:00");
//   const [shiftEndTime, setShiftEndTime] = useState("18:00");
//   const [joinDate, setJoinDate] = useState("");
//   const [phone, setPhone] = useState("");
//   const [address, setAddress] = useState("");
//   const [employeeId, setEmployeeId] = useState("");
//   const [locationId, setLocationId] = useState("");
//   const [salaryPerMonth, setSalaryPerMonth] = useState("");
//   const [shiftHours, setShiftHours] = useState("8");
//   const [weekOffPerMonth, setWeekOffPerMonth] = useState("0");

//   const [departments, setDepartments] = useState([]); // ✅ Changed to fetch from backend
//   const [roles, setRoles] = useState([]); // ✅ Changed to fetch from backend
//   const [isAddingNewDept, setIsAddingNewDept] = useState(false);
//   const [customDepartment, setCustomDepartment] = useState("");
//   const [isAddingNewRole, setIsAddingNewRole] = useState(false);
//   const [customRole, setCustomRole] = useState("");
//   const [isAddingNewShift, setIsAddingNewShift] = useState(false);
//   const [customShiftType, setCustomShiftType] = useState("");
//   const [customShiftStartTime, setCustomShiftStartTime] = useState("09:00");
//   const [customShiftEndTime, setCustomShiftEndTime] = useState("18:00");

//   const [showPassword, setShowPassword] = useState(false);
//   const [locations, setLocations] = useState([]);
//   const [shiftList, setShiftList] = useState(["A", "B", "C", "D", "E", "F", "G", "H", "I"]);
//   const [allShiftsData, setAllShiftsData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [successMessage, setSuccessMessage] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");

//   // ✅ Fetch departments from backend
//   useEffect(() => {
//     fetchDepartments();
//     fetchRoles();
//   }, []);

//   const fetchDepartments = async () => {
//     try {
//       const response = await axios.get('https://api.timelyhealth.in/api/department/all');
//       if (response.data.success) {
//         setDepartments(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching departments:', error);
//       // Fallback to hardcoded departments if API fails
//       setDepartments([
//         { name: "Developer", employeeCount: 0 },
//         { name: "Sales", employeeCount: 0 },
//         { name: "Marketing", employeeCount: 0 },
//         { name: "Medical", employeeCount: 0 },
//         { name: "Finance", employeeCount: 0 },
//         { name: "Nursing", employeeCount: 0 },
//         { name: "Digital Marketing", employeeCount: 0 },
//         { name: "Management", employeeCount: 0 },
//         { name: "Laboratory Medicine", employeeCount: 0 }
//       ]);
//     }
//   };

//   // ✅ Fetch roles from backend
//   const fetchRoles = async () => {
//     try {
//       const response = await axios.get('https://api.timelyhealth.in/api/roles/all');
//       if (response.data.success) {
//         setRoles(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching roles:', error);
//       // Fallback to hardcoded roles if API fails
//       setRoles([
//         { name: "Administrator", employeeCount: 0 },
//         { name: "Manager", employeeCount: 0 },
//         { name: "Team Lead", employeeCount: 0 },
//         { name: "Employee", employeeCount: 0 },
//         { name: "HR Manager", employeeCount: 0 },
//         { name: "Phlebotomist", employeeCount: 0 },
//         { name: "Staff Nurse", employeeCount: 0 },
//         { name: "Sales Executive", employeeCount: 0 },
//         { name: "Consultant", employeeCount: 0 },
//         { name: "Graphic Designer", employeeCount: 0 },
//         { name: "UI/UX & GRAPHIC DESIGNER", employeeCount: 0 },
//         { name: "SMM & SEO Executive", employeeCount: 0 },
//         { name: "Web Developer", employeeCount: 0 }
//       ]);
//     }
//   };

//   useEffect(() => {
//     if (editingEmployee) {
//       setName(editingEmployee.name || "");
//       setEmail(editingEmployee.email || "");
//       setDepartment(editingEmployee.department || "");
//       setRole(editingEmployee.role || "");
//       setJoinDate(editingEmployee.joinDate?.slice(0, 10) || "");
//       setPhone(editingEmployee.phone || "");
//       setAddress(editingEmployee.address || "");
//       setEmployeeId(editingEmployee.employeeId || "");
//       setLocationId(editingEmployee.location?._id || editingEmployee.location || "");
//       setSalaryPerMonth(editingEmployee.salaryPerMonth || "");
//       setShiftHours(editingEmployee.shiftHours || "");
//       setWeekOffPerMonth(editingEmployee.weekOffPerMonth || "");
//       setPassword("");

//       fetchEmployeeShift();
//     }
//   }, [editingEmployee]);

//   const fetchEmployeeShift = async () => {
//     if (!editingEmployee?.employeeId) return;

//     try {
//       const res = await axios.get(`https://api.timelyhealth.in/api/shifts/employee/${editingEmployee.employeeId}`);
//       if (res.data && !res.data.message) {
//         setShiftType(res.data.shiftType);
//         setShiftStartTime(res.data.startTime || "09:00");
//         setShiftEndTime(res.data.endTime || "18:00");
//       }
//     } catch (err) {
//       console.log("No shift assigned yet");
//     }
//   };

//   useEffect(() => {
//     const fetchLocations = async () => {
//       try {
//         const res = await axios.get("https://api.timelyhealth.in/api/location/alllocation");
//         if (res.data?.locations) setLocations(res.data.locations);
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     fetchLocations();
//   }, []);

//   useEffect(() => {
//     const fetchAllShifts = async () => {
//       try {
//         const res = await axios.get("https://api.timelyhealth.in/api/shifts/all");
//         console.log("All shifts data:", res.data);

//         if (res.data && Array.isArray(res.data)) {
//           setAllShiftsData(res.data);

//           const uniqueShifts = [...new Set(res.data.map(shift => shift.shiftType))];
//           setShiftList(uniqueShifts);

//           if (res.data.length > 0) {
//             const firstShift = res.data[0];
//             if (!shiftStartTime) setShiftStartTime(firstShift.startTime || "09:00");
//             if (!shiftEndTime) setShiftEndTime(firstShift.endTime || "18:00");
//           }
//         }
//       } catch (err) {
//         console.log("Using default shifts:", err.message);
//       }
//     };
//     fetchAllShifts();
//   }, []);

//   useEffect(() => {
//     if (shiftType && !isAddingNewShift && allShiftsData.length > 0) {
//       const existingShift = allShiftsData.find(s => s.shiftType === shiftType);
//       if (existingShift) {
//         setShiftStartTime(existingShift.startTime || "09:00");
//         setShiftEndTime(existingShift.endTime || "18:00");
//       }
//     }
//   }, [shiftType, isAddingNewShift, allShiftsData]);

//   const assignShiftToEmployee = async (empId, empName, shift, startTime, endTime) => {
//     try {
//       const shiftData = {
//         employeeId: empId,
//         employeeName: empName,
//         shiftType: shift.toUpperCase(),
//         startTime: startTime,
//         endTime: endTime
//       };

//       const response = await axios.post(
//         "https://api.timelyhealth.in/api/shifts/assign",
//         shiftData
//       );

//       console.log("Shift assigned with times:", response.data);
//       return { success: true, data: response.data };

//     } catch (error) {
//       console.error("Shift assignment error:", error.response?.data || error.message);
//       return {
//         success: false,
//         message: error.response?.data?.message || error.message
//       };
//     }
//   };

//   // ✅ Handle Add New Department click
//   const handleAddNewDepartment = () => {
//     // Navigate to DepartmentDashboard and open add modal
//     navigate('/departmentdashboard', { 
//       state: { openAddModal: true } 
//     });
//   };

//   // ✅ Handle Add New Role click
//   const handleAddNewRole = () => {
//     // Navigate to RoleDashboard and open add modal
//     navigate('/roledashboard', { 
//       state: { openAddModal: true } 
//     });
//   };

//   // ✅ Handle Add New Location click
//   const handleAddNewLocation = () => {
//     navigate('/addlocation');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrorMessage("");
//     setSuccessMessage("");

//     try {
//       const finalDept = isAddingNewDept ? customDepartment : department;
//       const finalRole = isAddingNewRole ? customRole : role;
//       let finalShift = isAddingNewShift ? customShiftType : shiftType;
//       let finalStartTime = isAddingNewShift ? customShiftStartTime : shiftStartTime;
//       let finalEndTime = isAddingNewShift ? customShiftEndTime : shiftEndTime;

//       // Shift validation
//       if (!finalShift) {
//         throw new Error("Please select a shift type");
//       }

//       finalShift = finalShift.toUpperCase().trim();

//       if (finalShift.length !== 1 || !/^[A-Z]$/.test(finalShift)) {
//         throw new Error("Shift type should be a single letter from A to Z");
//       }

//       // Time validation
//       if (!finalStartTime || !finalEndTime) {
//         throw new Error("Please select both start and end time");
//       }

//       if (finalStartTime >= finalEndTime) {
//         throw new Error("End time must be after start time");
//       }

//       if (editingEmployee) {
//         // ================= UPDATE EMPLOYEE =================
//         const profilePayload = {
//           name,
//           email,
//           department: finalDept,
//           role: finalRole,
//           joinDate,
//           phone,
//           address,
//           locationId,
//           location: locationId,
//         };

//         if (password) profilePayload.password = password;

//         // 1. Update employee
//         await axios.put(
//           `https://api.timelyhealth.in/api/employees/update/${editingEmployee._id}`,
//           profilePayload
//         );

//         // 2. Assign shift with custom times
//         const shiftResult = await assignShiftToEmployee(
//           editingEmployee.employeeId,
//           name,
//           finalShift,
//           finalStartTime,
//           finalEndTime
//         );

//         if (!shiftResult.success) {
//           console.warn("Shift assignment note:", shiftResult.message);
//         }

//         // 3. Update salary
//         if (salaryPerMonth || shiftHours || weekOffPerMonth) {
//           try {
//             await axios.put(
//               `https://api.timelyhealth.in/api/salary/update-salary/${editingEmployee.employeeId}`,
//               {
//                 employeeId: editingEmployee.employeeId,
//                 salaryPerMonth: Number(salaryPerMonth) || 0,
//                 shiftHours: Number(shiftHours) || 8,
//                 weekOffPerMonth: Number(weekOffPerMonth) || 0,
//               }
//             );
//           } catch (salErr) {
//             console.warn("Salary update:", salErr.message);
//           }
//         }

//         // 4. Add new shift to list if created
//         if (isAddingNewShift && !shiftList.includes(finalShift)) {
//           setShiftList(prev => [...prev, finalShift]);
//           setAllShiftsData(prev => [...prev, {
//             shiftType: finalShift,
//             startTime: finalStartTime,
//             endTime: finalEndTime
//           }]);
//         }

//         setSuccessMessage("✅ Employee updated successfully!");

//       } else {
//         // ================= ADD NEW EMPLOYEE =================
//         // 1. Add employee
//         await axios.post(
//           "https://api.timelyhealth.in/api/employees/add-employee",
//           {
//             name,
//             email,
//             password,
//             department: finalDept,
//             role: finalRole,
//             joinDate,
//             phone,
//             address,
//             employeeId,
//             locationId,
//           }
//         );

//         // 2. Assign shift with custom times
//         const shiftResult = await assignShiftToEmployee(
//           employeeId,
//           name,
//           finalShift,
//           finalStartTime,
//           finalEndTime
//         );

//         if (!shiftResult.success) {
//           console.warn("Shift assignment note:", shiftResult.message);
//         }

//         // 3. Add salary
//         await axios.post(
//           "https://api.timelyhealth.in/api/salary/set-salary",
//           {
//             employeeId,
//             name,
//             salaryPerMonth: Number(salaryPerMonth),
//             shiftHours: Number(shiftHours),
//             weekOffPerMonth: Number(weekOffPerMonth),
//           }
//         );

//         // 4. Add new shift to list if created
//         if (isAddingNewShift && !shiftList.includes(finalShift)) {
//           setShiftList(prev => [...prev, finalShift]);
//           setAllShiftsData(prev => [...prev, {
//             shiftType: finalShift,
//             startTime: finalStartTime,
//             endTime: finalEndTime
//           }]);
//         }

//         setSuccessMessage("✅ Employee added successfully!");
//       }

//       setTimeout(() => navigate("/employeelist"), 1000);
//     } catch (err) {
//       console.error("Submit error:", err);
//       setErrorMessage(err.message || "Something went wrong!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-4xl p-6 mx-auto bg-white rounded-lg shadow-lg">
//       <h2 className="mb-6 text-2xl font-bold text-blue-900">
//         {editingEmployee ? "Edit Employee" : "Add New Employee"}
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

//         <div className="mb-4">
//           <label className="block text-sm">Full Name *</label>
//           <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" required />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Email *</label>
//           <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded" required />
//         </div>

//         <div className="relative mb-4">
//           <label className="block text-sm">Password {!editingEmployee && "*"}</label>
//           <input
//             type={showPassword ? "text" : "password"}
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full p-2 pr-10 border rounded"
//             required={!editingEmployee}
//           />
//           <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9">
//             {showPassword ? <FaEyeSlash /> : <FaEye />}
//           </button>
//           {editingEmployee && <p className="mt-1 text-xs text-gray-500">Leave blank to keep current password</p>}
//         </div>

//         {/* ✅ ENHANCED DEPARTMENT SELECTION */}
//         <div className="mb-4">
//           <label className="block mb-2 text-sm font-medium text-gray-700">
//             Department *
//           </label>
//           <div className="flex gap-2">
//             <select
//               value={isAddingNewDept ? "ADD_NEW" : department}
//               onChange={(e) => {
//                 if (e.target.value === "ADD_NEW") {
//                   // Navigate to DepartmentDashboard with modal open
//                   handleAddNewDepartment();
//                   return;
//                 } else {
//                   setIsAddingNewDept(false);
//                   setDepartment(e.target.value);
//                 }
//               }}
//               className="w-full p-2 border rounded"
//               required={!isAddingNewDept}
//             >
//               <option value="">Select Department</option>
//               {departments.map((dept) => (
//                 <option key={dept.name} value={dept.name}>
//                   {dept.name} {dept.employeeCount > 0 ? `(${dept.employeeCount})` : ''}
//                 </option>
//               ))}
//               <option value="ADD_NEW" className="font-bold text-blue-600">
//                 + Add New Department
//               </option>
//             </select>
//             {/* <button
//               type="button"
//               onClick={handleAddNewDepartment}
//               className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 whitespace-nowrap"
//               title="Manage Departments"
//             >
//               Manage
//             </button> */}
//           </div>
          
//           {/* Custom department input for immediate use (optional) */}
//           {isAddingNewDept && (
//             <div className="flex items-center gap-2 mt-2">
//               <input
//                 type="text"
//                 placeholder="Enter new department name"
//                 value={customDepartment}
//                 onChange={(e) => setCustomDepartment(e.target.value)}
//                 className="flex-1 p-2 border border-blue-300 rounded outline-none focus:ring-1 focus:ring-blue-400"
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setIsAddingNewDept(false)}
//                 className="text-xs font-medium text-red-500 hover:text-red-700"
//               >
//                 Cancel
//               </button>
//             </div>
//           )}
          
//           {department && !isAddingNewDept && (
//             <p className="mt-1 text-xs text-green-600">Selected: {department}</p>
//           )}
//         </div>

//         {/* ✅ ENHANCED ROLE SELECTION */}
//         <div className="mb-4">
//           <label className="block mb-2 text-sm font-medium text-gray-700">
//             Role *
//           </label>
//           <div className="flex gap-2">
//             <select
//               value={isAddingNewRole ? "ADD_NEW" : role}
//               onChange={(e) => {
//                 if (e.target.value === "ADD_NEW") {
//                   // Navigate to RoleDashboard with modal open
//                   handleAddNewRole();
//                   return;
//                 } else {
//                   setIsAddingNewRole(false);
//                   setRole(e.target.value);
//                 }
//               }}
//               className="w-full p-2 border rounded"
//               required={!isAddingNewRole}
//             >
//               <option value="">Select Role</option>
//               {roles.map((roleItem) => (
//                 <option key={roleItem.name} value={roleItem.name}>
//                   {roleItem.name} {roleItem.employeeCount > 0 ? `(${roleItem.employeeCount})` : ''}
//                 </option>
//               ))}
//               <option value="ADD_NEW" className="font-bold text-blue-600">
//                 + Add New Role
//               </option>
//             </select>
//             {/* <button
//               type="button"
//               onClick={handleAddNewRole}
//               className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 whitespace-nowrap"
//               title="Manage Roles"
//             >
//               Manage
//             </button> */}
//           </div>
          
//           {/* Custom role input for immediate use (optional) */}
//           {isAddingNewRole && (
//             <div className="flex items-center gap-2 mt-2">
//               <input
//                 type="text"
//                 placeholder="Enter new role name"
//                 value={customRole}
//                 onChange={(e) => setCustomRole(e.target.value)}
//                 className="flex-1 p-2 border border-blue-300 rounded outline-none focus:ring-1 focus:ring-blue-400"
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setIsAddingNewRole(false)}
//                 className="text-xs font-medium text-red-500 hover:text-red-700"
//               >
//                 Cancel
//               </button>
//             </div>
//           )}
          
//           {role && !isAddingNewRole && (
//             <p className="mt-1 text-xs text-green-600">Selected: {role}</p>
//           )}
//         </div>

//         {/* ✅ SHIFT SECTION */}
//         <div className="p-4 mb-4 border rounded-lg bg-gray-50">
//           <label className="block mb-2 text-sm font-medium">Shift Details *</label>

//           <div className="flex gap-2 mb-3">
//             <select
//               value={isAddingNewShift ? "ADD_NEW" : shiftType}
//               onChange={(e) => {
//                 if (e.target.value === "ADD_NEW") {
//                   setIsAddingNewShift(true);
//                   setShiftType("");
//                 } else {
//                   setIsAddingNewShift(false);
//                   setShiftType(e.target.value);
//                 }
//               }}
//               className="w-full p-2 border rounded"
//               required={!isAddingNewShift}
//             >
//               <option value="">Select Shift Type</option>
//               {shiftList.map((shift) => (
//                 <option key={shift} value={shift}>Shift {shift}</option>
//               ))}
//               <option value="ADD_NEW" className="font-bold text-blue-600">+ Add New Shift Type</option>
//             </select>
//           </div>

//           {isAddingNewShift ? (
//             <div className="p-3 space-y-4 border border-blue-200 rounded bg-blue-50">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm font-medium text-blue-800">Create New Shift Type</span>
//                 <button
//                   type="button"
//                   onClick={() => setIsAddingNewShift(false)}
//                   className="text-xs font-medium text-red-500 hover:text-red-700"
//                 >
//                   Cancel
//                 </button>
//               </div>

//               <div>
//                 <label className="block mb-1 text-xs text-gray-600">Shift Type Code *</label>
//                 <input
//                   type="text"
//                   placeholder="Enter shift type (A, B, C, etc.)"
//                   value={customShiftType}
//                   onChange={(e) => {
//                     const value = e.target.value.toUpperCase();
//                     if (value.length <= 1) {
//                       setCustomShiftType(value);
//                     }
//                   }}
//                   className="w-full p-2 border border-blue-300 rounded outline-none focus:ring-1 focus:ring-blue-400"
//                   maxLength="1"
//                   required
//                 />
//                 <p className="mt-1 text-xs text-gray-500">Single letter from A to Z</p>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block mb-1 text-xs text-gray-600">Start Time *</label>
//                   <input
//                     type="time"
//                     value={customShiftStartTime}
//                     onChange={(e) => setCustomShiftStartTime(e.target.value)}
//                     className="w-full p-2 border border-blue-300 rounded outline-none focus:ring-1 focus:ring-blue-400"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block mb-1 text-xs text-gray-600">End Time *</label>
//                   <input
//                     type="time"
//                     value={customShiftEndTime}
//                     onChange={(e) => setCustomShiftEndTime(e.target.value)}
//                     className="w-full p-2 border border-blue-300 rounded outline-none focus:ring-1 focus:ring-blue-400"
//                     required
//                   />
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {shiftType && (
//                 <div className="p-3 bg-white border border-gray-200 rounded">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-sm font-medium">
//                       Selected: <span className="text-blue-600">Shift {shiftType}</span>
//                     </span>
//                     {allShiftsData.find(s => s.shiftType === shiftType) && (
//                       <span className="text-xs text-green-600">✓ Existing Shift</span>
//                     )}
//                   </div>

//                   <div className="grid grid-cols-2 gap-3">
//                     <div>
//                       <label className="block mb-1 text-xs text-gray-600">Start Time *</label>
//                       <input
//                         type="time"
//                         value={shiftStartTime}
//                         onChange={(e) => setShiftStartTime(e.target.value)}
//                         className="w-full p-2 border rounded"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label className="block mb-1 text-xs text-gray-600">End Time *</label>
//                       <input
//                         type="time"
//                         value={shiftEndTime}
//                         onChange={(e) => setShiftEndTime(e.target.value)}
//                         className="w-full p-2 border rounded"
//                         required
//                       />
//                     </div>
//                   </div>

//                   {(() => {
//                     const selectedShift = allShiftsData.find(s => s.shiftType === shiftType);
//                     if (selectedShift) {
//                       return (
//                         <div className="mt-2 text-xs text-gray-500">
//                           <p>Default timing for this shift: {selectedShift.startTime} - {selectedShift.endTime}</p>
//                           <p className="mt-1">You can modify the timing for this employee</p>
//                         </div>
//                       );
//                     }
//                   })()}
//                 </div>
//               )}
//             </div>
//           )}

//           <p className="mt-2 text-xs text-gray-500">
//             Available shifts: {shiftList.join(", ")}
//           </p>
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Join Date *</label>
//           <input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} className="w-full p-2 border rounded" required />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Phone</label>
//           <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2 border rounded" />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Address</label>
//           <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-2 border rounded" />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Employee ID *</label>
//           <input
//             value={employeeId}
//             onChange={(e) => setEmployeeId(e.target.value)}
//             className={`w-full p-2 border rounded ${editingEmployee ? 'bg-gray-100 cursor-not-allowed' : ''}`}
//             required
//             readOnly={!!editingEmployee}
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Salary Per Month *</label>
//           <input type="number" value={salaryPerMonth} onChange={(e) => setSalaryPerMonth(e.target.value)} className="w-full p-2 border rounded" required />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Shift Hours Per Day *</label>
//           <input type="number" value={shiftHours} onChange={(e) => setShiftHours(e.target.value)} className="w-full p-2 border rounded" required />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm">Week Off Per Month *</label>
//           <input type="number" value={weekOffPerMonth} onChange={(e) => setWeekOffPerMonth(e.target.value)} className="w-full p-2 border rounded" required />
//         </div>

//         {/* ✅ ENHANCED LOCATION SELECTION */}
//         {/* <div className="mb-4">
//           <div className="flex items-center justify-between mb-1">
//             <label className="text-sm font-medium text-gray-700">
//               Location
//             </label>
//             <button onClick={() => navigate("/addlocation")}
//               type="button"
//               className="px-3 py-1 text-xs font-semibold text-white transition bg-blue-600 rounded-md hover:bg-blue-700"
//             >
//               + Add Location
//             </button>
//           </div>
//           <select
//             value={locationId}
//             onChange={(e) => setLocationId(e.target.value)}
//             className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Select a Location</option>
//             {locations.map((loc) => (
//               <option key={loc._id} value={loc._id}>
//                 {loc.name}
//               </option>
//             ))}
//           </select>

//         </div> */}

//         <div className="mb-4">
//           {/* Label + Button */}
//           <div className="flex items-center justify-between mb-1">
//             <label className="text-sm font-medium text-gray-700">
//               Location
//             </label>

//             {/* <button onClick={() => navigate("/addlocation")}
//               type="button"
//               className="px-3 py-1 text-xs font-semibold text-white transition bg-blue-600 rounded-md hover:bg-blue-700"
//             >
//               + Add Location
//             </button> */}
//           </div>

//           {/* Select */}
//           {/* <select
//             value={locationId}
//             onChange={(e) => setLocationId(e.target.value)}
//             className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Select a Location</option>
//             {locations.map((loc) => (
//               <option key={loc._id} value={loc._id}>
//                 {loc.name}
//               </option>
//             ))}
//           </select> */}
//           <select
//             value={locationId}
//             onChange={(e) => {
//               const selectedValue = e.target.value;

//               if (selectedValue === "add-new") {
//                 navigate("/addlocation");
//                 return;
//               }

//               setLocationId(selectedValue);
//             }}
//             className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Select a Location</option>

//             {locations.map((loc) => (
//               <option key={loc._id} value={loc._id}>
//                 {loc.name}
//               </option>
//             ))}

//             <option value="add-new">➕ Add New Location</option>
//           </select>


//         </div>



//         <button type="submit" disabled={loading} className="px-6 py-2 text-white bg-blue-600 rounded">
//           {loading ? "Saving..." : editingEmployee ? "Update Employee" : "Add Employee"}
//         </button>

//       </form>
//     </div>
//   );
// };

// export default AddEmployeePage;

// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FaBriefcase, FaBuilding, FaCalendar, FaClock, FaDollarSign, FaEnvelope, FaEye, FaEyeSlash, FaHome, FaIdCard, FaLock, FaMapMarkerAlt, FaPhone, FaUserTie } from "react-icons/fa";
// import { useLocation, useNavigate } from "react-router-dom";

// const AddEmployeePage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const editingEmployee = location.state?.employee || null;

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [department, setDepartment] = useState("");
//   const [role, setRole] = useState("");
//   const [shiftType, setShiftType] = useState("");
//   const [shiftStartTime, setShiftStartTime] = useState("09:00");
//   const [shiftEndTime, setShiftEndTime] = useState("18:00");
//   const [joinDate, setJoinDate] = useState("");
//   const [phone, setPhone] = useState("");
//   const [address, setAddress] = useState("");
//   const [employeeId, setEmployeeId] = useState("");
//   const [locationId, setLocationId] = useState("");
//   const [salaryPerMonth, setSalaryPerMonth] = useState("");
//   const [shiftHours, setShiftHours] = useState("8");
//   const [weekOffPerMonth, setWeekOffPerMonth] = useState("0");

//   const [departments, setDepartments] = useState([]);
//   const [roles, setRoles] = useState([]);
//   const [locations, setLocations] = useState([]);
//   const [masterShifts, setMasterShifts] = useState([]);
//   const [shiftList, setShiftList] = useState([]);

//   const [loading, setLoading] = useState(false);
//   const [successMessage, setSuccessMessage] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   // Modal states
//   const [showShiftModal, setShowShiftModal] = useState(false);
//   const [showDeptModal, setShowDeptModal] = useState(false);
//   const [showRoleModal, setShowRoleModal] = useState(false);
//   const [showLocationModal, setShowLocationModal] = useState(false);

//   // Form data for modals
//   const [createShiftForm, setCreateShiftForm] = useState({
//     shiftType: '',
//     shiftName: '',
//     timeSlots: [
//       { slotId: `${Date.now()}_1`, timeRange: '', description: '' },
//       { slotId: `${Date.now()}_2`, timeRange: '', description: '' },
//       { slotId: `${Date.now()}_3`, timeRange: '', description: '' },
//       { slotId: `${Date.now()}_4`, timeRange: '', description: '' }
//     ]
//   });

//   const [deptForm, setDeptForm] = useState({ name: '', description: '' });
//   const [roleForm, setRoleForm] = useState({ name: '', description: '' });
//   const [locationForm, setLocationForm] = useState({
//     name: '',
//     latitude: '',
//     longitude: '',
//     fullAddress: ''
//   });

//   // ✅ Fetch all data
//   useEffect(() => {
//     fetchDepartments();
//     fetchRoles();
//     fetchAllShifts();
//     fetchLocations();
//   }, []);

//   // ✅ Set editing employee data
//   useEffect(() => {
//     if (editingEmployee) {
//       setName(editingEmployee.name || "");
//       setEmail(editingEmployee.email || "");
//       setDepartment(editingEmployee.department || "");
//       setRole(editingEmployee.role || "");
//       setJoinDate(editingEmployee.joinDate?.slice(0, 10) || "");
//       setPhone(editingEmployee.phone || "");
//       setAddress(editingEmployee.address || "");
//       setEmployeeId(editingEmployee.employeeId || "");
//       setLocationId(editingEmployee.location?._id || editingEmployee.location || "");
//       setSalaryPerMonth(editingEmployee.salaryPerMonth || "");
//       setShiftHours(editingEmployee.shiftHours || "");
//       setWeekOffPerMonth(editingEmployee.weekOffPerMonth || "");
//       setPassword("");
//     }
//   }, [editingEmployee]);

//   // ✅ Fetch departments
//   const fetchDepartments = async () => {
//     try {
//       const response = await axios.get('https://api.timelyhealth.in/api/department/all');
//       if (response.data.success) {
//         setDepartments(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching departments:', error);
//       setDepartments([]);
//     }
//   };

//   // ✅ Fetch roles
//   const fetchRoles = async () => {
//     try {
//       const response = await axios.get('https://api.timelyhealth.in/api/roles/all');
//       if (response.data.success) {
//         setRoles(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching roles:', error);
//       setRoles([]);
//     }
//   };

//   // ✅ Fetch locations
//   const fetchLocations = async () => {
//     try {
//       const res = await axios.get("https://api.timelyhealth.in/api/location/alllocation");
//       if (res.data?.locations) setLocations(res.data.locations);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // ✅ Fetch shifts
//   const fetchAllShifts = async () => {
//     try {
//       const res = await axios.get("https://api.timelyhealth.in/api/shifts/master");
//       if (res.data && res.data.success && Array.isArray(res.data.data)) {
//         const shifts = res.data.data;
//         setMasterShifts(shifts);
        
//         const shiftOptions = shifts.map(shift => ({
//           type: shift.shiftType,
//           name: shift.shiftName || `Shift ${shift.shiftType}`,
//           timeSlots: shift.timeSlots || []
//         }));
        
//         setShiftList(shiftOptions);
//       }
//     } catch (err) {
//       console.log("Error fetching shifts:", err.message);
//       setShiftList([]);
//     }
//   };

//   // ✅ Handle shift assignment
//   const assignShiftToEmployee = async (empId, empName, shift, startTime, endTime) => {
//     try {
//       const shiftData = {
//         employeeId: empId,
//         employeeName: empName,
//         shiftType: shift.toUpperCase(),
//         startTime: startTime,
//         endTime: endTime
//       };

//       const response = await axios.post(
//         "https://api.timelyhealth.in/api/shifts/assign",
//         shiftData
//       );
//       return { success: true, data: response.data };
//     } catch (error) {
//       console.error("Shift assignment error:", error.response?.data || error.message);
//       return {
//         success: false,
//         message: error.response?.data?.message || error.message
//       };
//     }
//   };

//   // ✅ Handle main form submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrorMessage("");
//     setSuccessMessage("");

//     try {
//       const finalShift = shiftType;
//       const finalStartTime = shiftStartTime;
//       const finalEndTime = shiftEndTime;

//       // Shift validation
//       if (!finalShift) throw new Error("Please select a shift type");
//       if (!finalStartTime || !finalEndTime) throw new Error("Please select both start and end time");
//       if (finalStartTime >= finalEndTime) throw new Error("End time must be after start time");

//       if (editingEmployee) {
//         // Update employee
//         const profilePayload = {
//           name,
//           email,
//           department,
//           role,
//           joinDate,
//           phone,
//           address,
//           locationId,
//           location: locationId,
//         };
//         if (password) profilePayload.password = password;

//         await axios.put(
//           `https://api.timelyhealth.in/api/employees/update/${editingEmployee._id}`,
//           profilePayload
//         );

//         // Assign shift
//         await assignShiftToEmployee(
//           editingEmployee.employeeId,
//           name,
//           finalShift,
//           finalStartTime,
//           finalEndTime
//         );

//         // Update salary
//         if (salaryPerMonth || shiftHours || weekOffPerMonth) {
//           try {
//             await axios.put(
//               `https://api.timelyhealth.in/api/salary/update-salary/${editingEmployee.employeeId}`,
//               {
//                 employeeId: editingEmployee.employeeId,
//                 salaryPerMonth: Number(salaryPerMonth) || 0,
//                 shiftHours: Number(shiftHours) || 8,
//                 weekOffPerMonth: Number(weekOffPerMonth) || 0,
//               }
//             );
//           } catch (salErr) {
//             console.warn("Salary update:", salErr.message);
//           }
//         }

//         setSuccessMessage("✅ Employee updated successfully!");
//       } else {
//         // Add new employee
//         await axios.post(
//           "https://api.timelyhealth.in/api/employees/add-employee",
//           {
//             name,
//             email,
//             password,
//             department,
//             role,
//             joinDate,
//             phone,
//             address,
//             employeeId,
//             locationId,
//           }
//         );

//         // Assign shift
//         await assignShiftToEmployee(
//           employeeId,
//           name,
//           finalShift,
//           finalStartTime,
//           finalEndTime
//         );

//         // Add salary
//         await axios.post(
//           "https://api.timelyhealth.in/api/salary/set-salary",
//           {
//             employeeId,
//             name,
//             salaryPerMonth: Number(salaryPerMonth),
//             shiftHours: Number(shiftHours),
//             weekOffPerMonth: Number(weekOffPerMonth),
//           }
//         );

//         setSuccessMessage("✅ Employee added successfully!");
//       }

//       setTimeout(() => navigate("/employeelist"), 1000);
//     } catch (err) {
//       console.error("Submit error:", err);
//       setErrorMessage(err.message || "Something went wrong!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ SHIFT MODAL FUNCTIONS
//   const handleCreateCustomShift = async (e) => {
//     e.preventDefault();
//     setErrorMessage("");
//     setSuccessMessage("");

//     try {
//       if (!createShiftForm.shiftType || !createShiftForm.shiftName) {
//         setErrorMessage('Please enter shift type and name');
//         return;
//       }

//       const validSlots = createShiftForm.timeSlots.filter(slot => 
//         slot.timeRange.trim() !== '' && slot.description.trim() !== ''
//       );
      
//       if (validSlots.length === 0) {
//         setErrorMessage('Please add at least one time slot');
//         return;
//       }

//       const response = await axios.post('https://api.timelyhealth.in/api/shifts/create', {
//         shiftType: createShiftForm.shiftType,
//         shiftName: createShiftForm.shiftName,
//         timeSlots: validSlots
//       });
      
//       if (response.data.success) {
//         setSuccessMessage(`✅ Custom Shift ${createShiftForm.shiftType} created successfully!`);
//         await fetchAllShifts();
//         setShiftType(createShiftForm.shiftType);
//         setShowShiftModal(false);
//         setCreateShiftForm({
//           shiftType: '',
//           shiftName: '',
//           timeSlots: [
//             { slotId: `${Date.now()}_1`, timeRange: '', description: '' },
//             { slotId: `${Date.now()}_2`, timeRange: '', description: '' },
//             { slotId: `${Date.now()}_3`, timeRange: '', description: '' },
//             { slotId: `${Date.now()}_4`, timeRange: '', description: '' }
//           ]
//         });
//       } else {
//         setErrorMessage(response.data.message);
//       }
//     } catch (error) {
//       console.error('Create custom error:', error);
//       setErrorMessage(error.response?.data?.message || 'Failed to create custom shift');
//     }
//   };

//   const addTimeSlot = () => {
//     setCreateShiftForm(prev => ({
//       ...prev,
//       timeSlots: [
//         ...prev.timeSlots,
//         { slotId: `${Date.now()}_${prev.timeSlots.length + 1}`, timeRange: '', description: '' }
//       ]
//     }));
//   };

//   const removeTimeSlot = (index) => {
//     if (createShiftForm.timeSlots.length > 1) {
//       const newSlots = [...createShiftForm.timeSlots];
//       newSlots.splice(index, 1);
//       setCreateShiftForm(prev => ({ ...prev, timeSlots: newSlots }));
//     }
//   };

//   const updateTimeSlot = (index, field, value) => {
//     const newSlots = [...createShiftForm.timeSlots];
//     newSlots[index] = { ...newSlots[index], [field]: value };
//     setCreateShiftForm(prev => ({ ...prev, timeSlots: newSlots }));
//   };

//   // ✅ DEPARTMENT MODAL FUNCTIONS
//   const handleCreateDepartment = async (e) => {
//     e.preventDefault();
//     setErrorMessage("");
//     setSuccessMessage("");

//     try {
//       if (!deptForm.name.trim()) {
//         setErrorMessage('Please enter department name');
//         return;
//       }

//       const response = await axios.post('https://api.timelyhealth.in/api/department/create', {
//         name: deptForm.name,
//         description: deptForm.description
//       });
      
//       if (response.data.success) {
//         setSuccessMessage(`✅ Department "${deptForm.name}" created successfully!`);
//         await fetchDepartments();
//         setDepartment(deptForm.name);
//         setShowDeptModal(false);
//         setDeptForm({ name: '', description: '' });
//       } else {
//         setErrorMessage(response.data.message);
//       }
//     } catch (error) {
//       console.error('Create department error:', error);
//       setErrorMessage(error.response?.data?.message || 'Failed to create department');
//     }
//   };

//   // ✅ ROLE MODAL FUNCTIONS
//   const handleCreateRole = async (e) => {
//     e.preventDefault();
//     setErrorMessage("");
//     setSuccessMessage("");

//     try {
//       if (!roleForm.name.trim()) {
//         setErrorMessage('Please enter role name');
//         return;
//       }

//       const response = await axios.post('https://api.timelyhealth.in/api/roles/create', {
//         name: roleForm.name,
//         description: roleForm.description
//       });
      
//       if (response.data.success) {
//         setSuccessMessage(`✅ Role "${roleForm.name}" created successfully!`);
//         await fetchRoles();
//         setRole(roleForm.name);
//         setShowRoleModal(false);
//         setRoleForm({ name: '', description: '' });
//       } else {
//         setErrorMessage(response.data.message);
//       }
//     } catch (error) {
//       console.error('Create role error:', error);
//       setErrorMessage(error.response?.data?.message || 'Failed to create role');
//     }
//   };

//   // ✅ LOCATION MODAL FUNCTIONS
//   const handleGetCurrentLocation = async () => {
//     if (!navigator.geolocation) {
//       setErrorMessage("❌ Geolocation is not supported by your browser.");
//       return;
//     }

//     setErrorMessage("");

//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const { latitude, longitude } = position.coords;
//         setLocationForm(prev => ({
//           ...prev,
//           latitude: latitude.toFixed(6),
//           longitude: longitude.toFixed(6)
//         }));

//         try {
//           const res = await fetch(
//             `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
//           );
//           const data = await res.json();
//           if (data.display_name) {
//             setLocationForm(prev => ({
//               ...prev,
//               fullAddress: data.display_name
//             }));
//           } else {
//             setErrorMessage("⚠️ Could not fetch full address.");
//           }
//         } catch {
//           setErrorMessage("⚠️ Failed to fetch address from coordinates.");
//         }
//       },
//       (err) => {
//         setErrorMessage("❌ Location access denied. Please enter manually.");
//       }
//     );
//   };

//   const handleCreateLocation = async (e) => {
//     e.preventDefault();
//     setErrorMessage("");
//     setSuccessMessage("");

//     try {
//       if (!locationForm.name.trim() || !locationForm.latitude || !locationForm.longitude) {
//         setErrorMessage('Please fill all required fields');
//         return;
//       }

//       const response = await axios.post("https://api.timelyhealth.in/api/location/add-location", {
//         name: locationForm.name,
//         latitude: locationForm.latitude,
//         longitude: locationForm.longitude,
//         fullAddress: locationForm.fullAddress
//       });

//       if (response.data.success || response.data.location) {
//         setSuccessMessage(`✅ Location "${locationForm.name}" added successfully!`);
//         await fetchLocations();
        
//         // Set the newly created location as selected
//         const newLocation = response.data.location || response.data.data;
//         if (newLocation && newLocation._id) {
//           setLocationId(newLocation._id);
//         }
        
//         setShowLocationModal(false);
//         setLocationForm({
//           name: '',
//           latitude: '',
//           longitude: '',
//           fullAddress: ''
//         });
//       } else {
//         setErrorMessage(response.data.message || 'Failed to add location');
//       }
//     } catch (error) {
//       console.error('Create location error:', error);
//       setErrorMessage(error.response?.data?.message || 'Failed to add location');
//     }
//   };

//   return (
//     <div className="max-w-6xl p-4 mx-auto">
//       <div className="p-6 bg-white shadow-lg rounded-xl">
//         <div className="mb-6">
//           <h2 className="text-2xl font-bold text-gray-800">
//             {editingEmployee ? "Edit Employee" : "Add New Employee"}
//           </h2>
//           <p className="mt-1 text-sm text-gray-600">Fill in the employee details below</p>
//         </div>

//         {successMessage && (
//           <div className="p-3 mb-4 text-sm text-green-700 border border-green-200 rounded-lg bg-green-50">
//             {successMessage}
//           </div>
//         )}
        
//         {errorMessage && (
//           <div className="p-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
//             {errorMessage}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Row 1: Name, Email, Password */}
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaIdCard className="inline mr-1 text-blue-500" /> Full Name *
//               </label>
//               <input 
//                 value={name} 
//                 onChange={(e) => setName(e.target.value)} 
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 placeholder="John Doe"
//                 required 
//               />
//             </div>

//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaEnvelope className="inline mr-1 text-blue-500" /> Email *
//               </label>
//               <input 
//                 type="email" 
//                 value={email} 
//                 onChange={(e) => setEmail(e.target.value)} 
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 placeholder="john@example.com"
//                 required 
//               />
//             </div>

//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaLock className="inline mr-1 text-blue-500" /> Password {!editingEmployee && "*"}
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full p-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                   placeholder={editingEmployee ? "Keep blank for no change" : "Enter password"}
//                   required={!editingEmployee}
//                 />
//                 <button 
//                   type="button" 
//                   onClick={() => setShowPassword(!showPassword)} 
//                   className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
//                 >
//                   {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Row 2: Department, Role, Employee ID */}
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaBuilding className="inline mr-1 text-blue-500" /> Department *
//               </label>
//               <select
//                 value={department}
//                 onChange={(e) => {
//                   if (e.target.value === "ADD_NEW_DEPT") {
//                     setShowDeptModal(true);
//                   } else {
//                     setDepartment(e.target.value);
//                   }
//                 }}
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 required
//               >
//                 <option value="">Select Department</option>
//                 {departments.map((dept) => (
//                   <option key={dept.name} value={dept.name}>
//                     {dept.name} {dept.employeeCount > 0 ? `(${dept.employeeCount})` : ''}
//                   </option>
//                 ))}
//                 <option value="ADD_NEW_DEPT" className="font-medium text-blue-600">
//                   + Add New
//                 </option>
//               </select>
//             </div>

//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaUserTie className="inline mr-1 text-blue-500" /> Role *
//               </label>
//               <select
//                 value={role}
//                 onChange={(e) => {
//                   if (e.target.value === "ADD_NEW_ROLE") {
//                     setShowRoleModal(true);
//                   } else {
//                     setRole(e.target.value);
//                   }
//                 }}
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 required
//               >
//                 <option value="">Select Role</option>
//                 {roles.map((roleItem) => (
//                   <option key={roleItem.name} value={roleItem.name}>
//                     {roleItem.name} {roleItem.employeeCount > 0 ? `(${roleItem.employeeCount})` : ''}
//                   </option>
//                 ))}
//                 <option value="ADD_NEW_ROLE" className="font-medium text-blue-600">
//                   + Add New
//                 </option>
//               </select>
//             </div>

//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaBriefcase className="inline mr-1 text-blue-500" /> Employee ID *
//               </label>
//               <input
//                 value={employeeId}
//                 onChange={(e) => setEmployeeId(e.target.value)}
//                 className={`w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${editingEmployee ? 'bg-gray-50' : ''}`}
//                 placeholder="EMP001"
//                 required
//                 readOnly={!!editingEmployee}
//               />
//             </div>
//           </div>

//           {/* Row 3: Join Date, Phone, Location */}
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaCalendar className="inline mr-1 text-blue-500" /> Join Date *
//               </label>
//               <input 
//                 type="date" 
//                 value={joinDate} 
//                 onChange={(e) => setJoinDate(e.target.value)} 
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 required 
//               />
//             </div>

//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaPhone className="inline mr-1 text-blue-500" /> Phone Number
//               </label>
//               <input 
//                 value={phone} 
//                 onChange={(e) => setPhone(e.target.value)} 
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 placeholder="+91 9876543210"
//               />
//             </div>

//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaMapMarkerAlt className="inline mr-1 text-blue-500" /> Location *
//               </label>
//               <select
//                 value={locationId}
//                 onChange={(e) => {
//                   const selectedValue = e.target.value;
//                   if (selectedValue === "ADD_NEW_LOCATION") {
//                     setShowLocationModal(true);
//                     return;
//                   }
//                   setLocationId(selectedValue);
//                 }}
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 required
//               >
//                 <option value="">Select Location</option>
//                 {locations.map((loc) => (
//                   <option key={loc._id} value={loc._id}>
//                     {loc.name}
//                   </option>
//                 ))}
//                 <option value="ADD_NEW_LOCATION" className="font-medium text-blue-600">
//                   + Add New
//                 </option>
//               </select>
//             </div>
//           </div>

//           {/* Row 4: Shift Details */}
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaClock className="inline mr-1 text-blue-500" /> Shift Type *
//               </label>
//               <select
//                 value={shiftType}
//                 onChange={(e) => {
//                   if (e.target.value === "ADD_NEW") {
//                     setShowShiftModal(true);
//                   } else {
//                     setShiftType(e.target.value);
//                   }
//                 }}
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 required
//               >
//                 <option value="">Select Shift</option>
//                 {shiftList.map((shift) => (
//                   <option key={shift.type} value={shift.type}>
//                     Shift {shift.type}: {shift.name}
//                   </option>
//                 ))}
//                 <option value="ADD_NEW" className="font-medium text-blue-600">
//                   + Add New
//                 </option>
//               </select>
//             </div>

//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 Start Time *
//               </label>
//               <input
//                 type="time"
//                 value={shiftStartTime}
//                 onChange={(e) => setShiftStartTime(e.target.value)}
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 End Time *
//               </label>
//               <input
//                 type="time"
//                 value={shiftEndTime}
//                 onChange={(e) => setShiftEndTime(e.target.value)}
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 Shift Hours/Day *
//               </label>
//               <input 
//                 type="number" 
//                 value={shiftHours} 
//                 onChange={(e) => setShiftHours(e.target.value)} 
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 min="1"
//                 max="24"
//                 required 
//               />
//             </div>
//           </div>

//           {/* Row 5: Salary Details */}
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaDollarSign className="inline mr-1 text-blue-500" /> Salary/Month *
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//                   <span className="text-sm text-gray-500">₹</span>
//                 </div>
//                 <input 
//                   type="number" 
//                   value={salaryPerMonth} 
//                   onChange={(e) => setSalaryPerMonth(e.target.value)} 
//                   className="pl-8 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                   placeholder="0.00"
//                   required 
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 Week Off/Month *
//               </label>
//               <input 
//                 type="number" 
//                 value={weekOffPerMonth} 
//                 onChange={(e) => setWeekOffPerMonth(e.target.value)} 
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 min="0"
//                 max="30"
//                 required 
//               />
//             </div>

//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaHome className="inline mr-1 text-blue-500" /> Address
//               </label>
//               <input
//                 value={address}
//                 onChange={(e) => setAddress(e.target.value)}
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 placeholder="Enter address"
//               />
//             </div>
//           </div>

//           {/* Submit Button */}
//           <div className="pt-4">
//             <button 
//               type="submit" 
//               disabled={loading} 
//               className={`w-full md:w-auto px-8 py-3 rounded-lg font-medium transition duration-200 ${
//                 loading 
//                   ? 'bg-gray-400 cursor-not-allowed' 
//                   : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
//               }`}
//             >
//               {loading ? (
//                 <div className="flex items-center justify-center">
//                   <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Processing...
//                 </div>
//               ) : editingEmployee ? (
//                 "Update Employee"
//               ) : (
//                 "Add Employee"
//               )}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* ✅ SHIFT MODAL */}
//       {showShiftModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between p-6 border-b">
//               <h3 className="text-xl font-semibold text-gray-800">Create Custom Shift</h3>
//               <button onClick={() => setShowShiftModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">
//                 &times;
//               </button>
//             </div>

//             <form onSubmit={handleCreateCustomShift} className="p-6">
//               <div className="space-y-6">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">
//                       Shift Type (Single letter E-Z) *
//                     </label>
//                     <input
//                       type="text"
//                       maxLength="1"
//                       value={createShiftForm.shiftType}
//                       onChange={(e) => setCreateShiftForm(prev => ({ 
//                         ...prev, 
//                         shiftType: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')
//                       }))}
//                       className="w-full px-4 py-2 uppercase border border-gray-300 rounded-lg"
//                       placeholder="E"
//                       required
//                     />
//                     <p className="mt-1 text-xs text-gray-500">Enter a single letter (E, F, G, H, etc.)</p>
//                   </div>
                  
//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">
//                       Shift Name *
//                     </label>
//                     <input
//                       type="text"
//                       value={createShiftForm.shiftName}
//                       onChange={(e) => setCreateShiftForm(prev => ({ ...prev, shiftName: e.target.value }))}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//                       placeholder="e.g., Extended Shift E"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <div className="flex items-center justify-between mb-3">
//                     <label className="block text-sm font-medium text-gray-700">
//                       Configure Time Slots (Minimum 1 required) *
//                     </label>
//                     <button
//                       type="button"
//                       onClick={addTimeSlot}
//                       className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
//                     >
//                       + Add Slot
//                     </button>
//                   </div>
                  
//                   <div className="space-y-3">
//                     {createShiftForm.timeSlots.map((slot, index) => (
//                       <div key={slot.slotId} className="p-4 border rounded-lg bg-gray-50">
//                         <div className="flex items-center justify-between mb-2">
//                           <span className="text-sm font-medium">Slot {index + 1}</span>
//                           {createShiftForm.timeSlots.length > 1 && (
//                             <button
//                               type="button"
//                               onClick={() => removeTimeSlot(index)}
//                               className="text-sm text-red-600 hover:text-red-800"
//                             >
//                               Remove
//                             </button>
//                           )}
//                         </div>
                        
//                         <div className="grid grid-cols-2 gap-3">
//                           <div>
//                             <label className="block mb-1 text-xs text-gray-600">Time Range *</label>
//                             <input
//                               type="text"
//                               value={slot.timeRange}
//                               onChange={(e) => updateTimeSlot(index, 'timeRange', e.target.value)}
//                               className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
//                               placeholder="e.g., 10:00 - 19:00"
//                               required
//                             />
//                           </div>
                          
//                           <div>
//                             <label className="block mb-1 text-xs text-gray-600">Description *</label>
//                             <input
//                               type="text"
//                               value={slot.description}
//                               onChange={(e) => updateTimeSlot(index, 'description', e.target.value)}
//                               className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
//                               placeholder="e.g., Morning 10 to 7"
//                               required
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Preview */}
//                 {createShiftForm.shiftType && createShiftForm.timeSlots.some(s => s.timeRange) && (
//                   <div className="p-4 border border-blue-200 rounded bg-blue-50">
//                     <h4 className="mb-2 font-medium text-blue-800">Preview:</h4>
//                     <p className="text-sm text-blue-700">
//                       Shift {createShiftForm.shiftType}: {createShiftForm.shiftName}
//                     </p>
//                     <p className="mt-1 text-sm text-blue-600">
//                       {createShiftForm.timeSlots.filter(s => s.timeRange).length} time slot(s) will be created.
//                     </p>
//                   </div>
//                 )}
//               </div>

//               <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
//                 <button
//                   type="button"
//                   onClick={() => setShowShiftModal(false)}
//                   className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700"
//                 >
//                   Create Custom Shift
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ✅ DEPARTMENT MODAL */}
//       {showDeptModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
//             <div className="flex items-center justify-between p-6 border-b">
//               <h3 className="text-xl font-semibold text-gray-800">Add New Department</h3>
//               <button onClick={() => setShowDeptModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">
//                 &times;
//               </button>
//             </div>

//             <form onSubmit={handleCreateDepartment} className="p-6">
//               <div className="space-y-4">
//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">
//                     Department Name *
//                   </label>
//                   <input
//                     type="text"
//                     value={deptForm.name}
//                     onChange={(e) => setDeptForm(prev => ({ ...prev, name: e.target.value }))}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//                     placeholder="e.g., Sales, Development"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">
//                     Description
//                   </label>
//                   <textarea
//                     value={deptForm.description}
//                     onChange={(e) => setDeptForm(prev => ({ ...prev, description: e.target.value }))}
//                     rows="3"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//                     placeholder="Describe the department..."
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-end pt-6 mt-6 space-x-3 border-t">
//                 <button
//                   type="button"
//                   onClick={() => setShowDeptModal(false)}
//                   className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//                 >
//                   Add Department
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ✅ ROLE MODAL */}
//       {showRoleModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
//             <div className="flex items-center justify-between p-6 border-b">
//               <h3 className="text-xl font-semibold text-gray-800">Add New Role</h3>
//               <button onClick={() => setShowRoleModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">
//                 &times;
//               </button>
//             </div>

//             <form onSubmit={handleCreateRole} className="p-6">
//               <div className="space-y-4">
//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">
//                     Role Name *
//                   </label>
//                   <input
//                     type="text"
//                     value={roleForm.name}
//                     onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//                     placeholder="e.g., Manager, Developer"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">
//                     Description
//                   </label>
//                   <textarea
//                     value={roleForm.description}
//                     onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
//                     rows="3"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//                     placeholder="Describe the role..."
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-end pt-6 mt-6 space-x-3 border-t">
//                 <button
//                   type="button"
//                   onClick={() => setShowRoleModal(false)}
//                   className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
//                 >
//                   Add Role
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ✅ LOCATION MODAL */}
//       {showLocationModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between p-6 border-b">
//               <h3 className="text-xl font-semibold text-gray-800">Add New Location</h3>
//               <button onClick={() => setShowLocationModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">
//                 &times;
//               </button>
//             </div>

//             <form onSubmit={handleCreateLocation} className="p-6">
//               <div className="space-y-6">
//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">
//                     Location Name *
//                   </label>
//                   <input
//                     type="text"
//                     value={locationForm.name}
//                     onChange={(e) => setLocationForm(prev => ({ ...prev, name: e.target.value }))}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//                     placeholder="e.g., Main Office, Branch Office"
//                     required
//                   />
//                 </div>

//                 <div className="flex items-center justify-between mb-3">
//                   <label className="block text-sm font-medium text-gray-700">
//                     Location Coordinates
//                   </label>
//                   <button
//                     type="button"
//                     onClick={handleGetCurrentLocation}
//                     className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
//                   >
//                     📍 Get Current Location
//                   </button>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">
//                       Latitude *
//                     </label>
//                     <input
//                       type="text"
//                       value={locationForm.latitude}
//                       onChange={(e) => setLocationForm(prev => ({ ...prev, latitude: e.target.value }))}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//                       placeholder="e.g., 28.6139"
//                       required
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">
//                       Longitude *
//                     </label>
//                     <input
//                       type="text"
//                       value={locationForm.longitude}
//                       onChange={(e) => setLocationForm(prev => ({ ...prev, longitude: e.target.value }))}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//                       placeholder="e.g., 77.2090"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">
//                     Full Address *
//                   </label>
//                   <textarea
//                     value={locationForm.fullAddress}
//                     onChange={(e) => setLocationForm(prev => ({ ...prev, fullAddress: e.target.value }))}
//                     rows="3"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//                     placeholder="Enter full address"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-end pt-6 mt-6 space-x-3 border-t">
//                 <button
//                   type="button"
//                   onClick={() => setShowLocationModal(false)}
//                   className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700"
//                 >
//                   Add Location
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AddEmployeePage;

// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FaBriefcase, FaBuilding, FaCalendar, FaCheck, FaCity, FaClock, FaDollarSign, FaEnvelope, FaEye, FaEyeSlash, FaGlobeAsia, FaIdCard, FaLock, FaMapMarkerAlt, FaMapPin, FaMinus, FaPhone, FaTimes, FaUserTie } from "react-icons/fa";
// import { useLocation, useNavigate } from "react-router-dom";

// // ✅ Pin Code Utility Functions
// const PINCODE_DATA = {
//   "110001": { city: "New Delhi", state: "Delhi" },
//   "400001": { city: "Mumbai", state: "Maharashtra" },
//   "700001": { city: "Kolkata", state: "West Bengal" },
//   "600001": { city: "Chennai", state: "Tamil Nadu" },
//   "560001": { city: "Bengaluru", state: "Karnataka" },
//   "380001": { city: "Ahmedabad", state: "Gujarat" },
//   "302001": { city: "Jaipur", state: "Rajasthan" },
//   "411001": { city: "Pune", state: "Maharashtra" },
//   "800001": { city: "Patna", state: "Bihar" },
//   "500001": { city: "Hyderabad", state: "Telangana" },
// };

// const getCityStateFromPincode = async (pincode) => {
//   try {
//     if (PINCODE_DATA[pincode]) {
//       return PINCODE_DATA[pincode];
//     }
    
//     try {
//       const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
//       if (response.data && response.data[0] && response.data[0].Status === "Success") {
//         const postOffice = response.data[0].PostOffice[0];
//         return {
//           city: postOffice.District || postOffice.Name,
//           state: postOffice.State,
//           country: "India"
//         };
//       }
//     } catch (apiError) {
//       console.warn("External API failed, using local data");
//     }
    
//     return null;
//   } catch (error) {
//     console.error("Error fetching pincode data:", error);
//     return null;
//   }
// };

// const formatFullAddress = (addressData) => {
//   const { addressLine1, addressLine2, city, state, pinCode, country } = addressData;
//   let address = addressLine1 || '';
//   if (addressLine2) address += `, ${addressLine2}`;
//   if (city) address += `, ${city}`;
//   if (state) address += `, ${state}`;
//   if (pinCode) address += ` - ${pinCode}`;
//   if (country) address += `, ${country}`;
//   return address;
// };

// const AddEmployeePage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const editingEmployee = location.state?.employee || null;

//   // ✅ BASIC INFO
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [phone, setPhone] = useState("");
//   const [dob, setDob] = useState("");
//   const [employeeId, setEmployeeId] = useState("");
//   const [joinDate, setJoinDate] = useState("");

//   // ✅ DEPARTMENT & ROLE
//   const [department, setDepartment] = useState("");
//   const [role, setRole] = useState("");

//   // ✅ ADDRESS
//   const [addressLine1, setAddressLine1] = useState("");
//   const [addressLine2, setAddressLine2] = useState("");
//   const [city, setCity] = useState("");
//   const [state, setState] = useState("");
//   const [pinCode, setPinCode] = useState("");
//   const [country, setCountry] = useState("India");

//   // ✅ LOCATION
//   const [locationId, setLocationId] = useState("");

//   // ✅ WEEK OFF - UPDATED FOR MULTIPLE SELECTION WITH COUNTS
//   const [weekOffType, setWeekOffType] = useState("");
//   const [selectedDays, setSelectedDays] = useState([]); // Array of objects: { day: "Monday", count: 1 }
//   const [weekOffCount, setWeekOffCount] = useState(0);
//   const [autoWeekOffPerMonth, setAutoWeekOffPerMonth] = useState("0"); // Auto-calculated
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false); // For dropdown visibility

//   // ✅ SHIFT
//   const [shiftType, setShiftType] = useState("");
//   const [shiftStartTime, setShiftStartTime] = useState("09:00");
//   const [shiftEndTime, setShiftEndTime] = useState("18:00");
//   const [shiftHours, setShiftHours] = useState("8");
//   const [showShiftDetails, setShowShiftDetails] = useState(false);

//   // ✅ SALARY
//   const [salaryPerMonth, setSalaryPerMonth] = useState("");
//   const [weekOffPerMonth, setWeekOffPerMonth] = useState("0");

//   // ✅ EXISTING STATES
//   const [departments, setDepartments] = useState([]);
//   const [roles, setRoles] = useState([]);
//   const [locations, setLocations] = useState([]);
//   const [shiftList, setShiftList] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [successMessage, setSuccessMessage] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [showShiftModal, setShowShiftModal] = useState(false);
//   const [showDeptModal, setShowDeptModal] = useState(false);
//   const [showRoleModal, setShowRoleModal] = useState(false);
//   const [showLocationModal, setShowLocationModal] = useState(false);
  
//   // ✅ Shift Creation Form
//   const [createShiftForm, setCreateShiftForm] = useState({
//     shiftType: '',
//     shiftName: '',
//     timeRange: '',
//     description: ''
//   });
  
//   const [deptForm, setDeptForm] = useState({ name: '', description: '' });
//   const [roleForm, setRoleForm] = useState({ name: '', description: '' });
//   const [locationForm, setLocationForm] = useState({
//     name: '',
//     latitude: '',
//     longitude: '',
//     fullAddress: ''
//   });

//   // ✅ Days of the week
//   const daysOfWeek = [
//     { id: 1, name: "Monday", short: "Mon" },
//     { id: 2, name: "Tuesday", short: "Tue" },
//     { id: 3, name: "Wednesday", short: "Wed" },
//     { id: 4, name: "Thursday", short: "Thu" },
//     { id: 5, name: "Friday", short: "Fri" },
//     { id: 6, name: "Saturday", short: "Sat" },
//     { id: 7, name: "Sunday", short: "Sun" }
//   ];

//   useEffect(() => {
//     fetchDepartments();
//     fetchRoles();
//     fetchAllShifts();
//     fetchLocations();
//   }, []);

//   useEffect(() => {
//     if (editingEmployee) {
//       setName(editingEmployee.name || "");
//       setEmail(editingEmployee.email || "");
//       setPhone(editingEmployee.phone || "");
//       setDob(editingEmployee.dob ? new Date(editingEmployee.dob).toISOString().split('T')[0] : "");
//       setEmployeeId(editingEmployee.employeeId || "");
//       setJoinDate(editingEmployee.joinDate?.slice(0, 10) || "");
//       setDepartment(editingEmployee.department || "");
//       setRole(editingEmployee.role || "");
      
//       setAddressLine1(editingEmployee.addressLine1 || "");
//       setAddressLine2(editingEmployee.addressLine2 || "");
//       setCity(editingEmployee.city || "");
//       setState(editingEmployee.state || "");
//       setPinCode(editingEmployee.pinCode || "");
//       setCountry(editingEmployee.country || "India");
      
//       setLocationId(editingEmployee.location?._id || editingEmployee.location || "");
      
//       // ✅ Load week off data
//       setWeekOffType(editingEmployee.weekOffType || "");
      
//       // Handle multiple days selection with counts
//       if (editingEmployee.weekOffDay) {
//         let daysArray = [];
//         if (typeof editingEmployee.weekOffDay === 'string') {
//           if (editingEmployee.weekOffDay.includes(',')) {
//             // Multiple days comma separated
//             const dayNames = editingEmployee.weekOffDay.split(',').map(d => d.trim());
//             daysArray = dayNames.map(day => ({ day, count: 1 }));
//           } else {
//             // Single day
//             daysArray = [{ day: editingEmployee.weekOffDay, count: 1 }];
//           }
//         } else if (Array.isArray(editingEmployee.weekOffDay)) {
//           // If it's already an array
//           daysArray = editingEmployee.weekOffDay.map(item => {
//             if (typeof item === 'string') {
//               return { day: item, count: 1 };
//             }
//             return item; // Assume it's already { day, count }
//           });
//         }
//         setSelectedDays(daysArray);
//       }
      
//       setWeekOffCount(editingEmployee.weekOffCount || 0);
//       setShiftType(editingEmployee.shiftType || "");
//       setShiftHours(editingEmployee.shiftHours || "");
//       setSalaryPerMonth(editingEmployee.salaryPerMonth || "");
//       setWeekOffPerMonth(editingEmployee.weekOffPerMonth || "0");
//       setPassword("");
      
//       // Auto-calculate week off per month based on existing data
//       calculateAutoWeekOffPerMonth();
      
//       if (editingEmployee.shiftType) {
//         setShowShiftDetails(true);
//         const shiftData = shiftList.find(s => s.type === editingEmployee.shiftType);
//         if (shiftData && shiftData.timeSlots && shiftData.timeSlots[0]) {
//           const timeRange = shiftData.timeSlots[0].timeRange;
//           const times = timeRange.split('-').map(t => t.trim());
//           if (times.length === 2) {
//             setShiftStartTime(times[0]);
//             setShiftEndTime(times[1]);
//           }
//         }
//       }
//     }
//   }, [editingEmployee, shiftList]);

//   // ✅ Calculate auto week off per month
//   const calculateAutoWeekOffPerMonth = () => {
//     if (weekOffType === 'day' && selectedDays.length > 0) {
//       // Sum of all counts
//       const totalCount = selectedDays.reduce((sum, dayObj) => sum + dayObj.count, 0);
//       setAutoWeekOffPerMonth(totalCount.toString());
//       setWeekOffPerMonth(totalCount.toString());
//     } else if (weekOffType === 'number') {
//       // Direct number input
//       setAutoWeekOffPerMonth(weekOffCount.toString());
//       setWeekOffPerMonth(weekOffCount.toString());
//     } else {
//       setAutoWeekOffPerMonth("0");
//       setWeekOffPerMonth("0");
//     }
//   };

//   // ✅ Handle week off type change
//   const handleWeekOffTypeChange = (type) => {
//     setWeekOffType(type);
//     if (type === 'day') {
//       setWeekOffCount(0);
//       if (selectedDays.length > 0) {
//         const totalCount = selectedDays.reduce((sum, dayObj) => sum + dayObj.count, 0);
//         setAutoWeekOffPerMonth(totalCount.toString());
//         setWeekOffPerMonth(totalCount.toString());
//       }
//     } else if (type === 'number') {
//       setSelectedDays([]);
//       setAutoWeekOffPerMonth(weekOffCount.toString());
//       setWeekOffPerMonth(weekOffCount.toString());
//     } else {
//       setSelectedDays([]);
//       setWeekOffCount(0);
//       setAutoWeekOffPerMonth("0");
//       setWeekOffPerMonth("0");
//     }
//   };

//   // ✅ Handle day selection (multiple with counts)
//   const handleDaySelection = (dayName) => {
//     // Check if day already exists
//     const existingDayIndex = selectedDays.findIndex(item => item.day === dayName);
    
//     if (existingDayIndex >= 0) {
//       // Increase count if already selected
//       const updatedDays = [...selectedDays];
//       updatedDays[existingDayIndex] = {
//         ...updatedDays[existingDayIndex],
//         count: updatedDays[existingDayIndex].count + 1
//       };
//       setSelectedDays(updatedDays);
//     } else {
//       // Add new day with count 1
//       const updatedDays = [...selectedDays, { day: dayName, count: 1 }];
//       setSelectedDays(updatedDays);
//     }
    
//     // Recalculate total
//     const totalCount = selectedDays.reduce((sum, dayObj) => {
//       if (dayObj.day === dayName) {
//         return sum + dayObj.count + 1;
//       }
//       return sum + dayObj.count;
//     }, existingDayIndex >= 0 ? 1 : 0);
    
//     setAutoWeekOffPerMonth(totalCount.toString());
//     setWeekOffPerMonth(totalCount.toString());
//   };

//   // ✅ Increase count for a specific day
//   const increaseDayCount = (dayName) => {
//     const updatedDays = selectedDays.map(item => {
//       if (item.day === dayName) {
//         return { ...item, count: item.count + 1 };
//       }
//       return item;
//     });
//     setSelectedDays(updatedDays);
    
//     const totalCount = updatedDays.reduce((sum, dayObj) => sum + dayObj.count, 0);
//     setAutoWeekOffPerMonth(totalCount.toString());
//     setWeekOffPerMonth(totalCount.toString());
//   };

//   // ✅ Decrease count for a specific day
//   const decreaseDayCount = (dayName) => {
//     const updatedDays = selectedDays.map(item => {
//       if (item.day === dayName && item.count > 1) {
//         return { ...item, count: item.count - 1 };
//       }
//       return item;
//     });
//     setSelectedDays(updatedDays);
    
//     const totalCount = updatedDays.reduce((sum, dayObj) => sum + dayObj.count, 0);
//     setAutoWeekOffPerMonth(totalCount.toString());
//     setWeekOffPerMonth(totalCount.toString());
//   };

//   // ✅ Remove a selected day completely
//   const removeSelectedDay = (dayName) => {
//     const updatedDays = selectedDays.filter(item => item.day !== dayName);
//     setSelectedDays(updatedDays);
    
//     const totalCount = updatedDays.reduce((sum, dayObj) => sum + dayObj.count, 0);
//     setAutoWeekOffPerMonth(totalCount.toString());
//     setWeekOffPerMonth(totalCount.toString());
//   };

//   // ✅ Handle week off count change
//   const handleWeekOffCountChange = (value) => {
//     const numValue = parseInt(value) || 0;
//     setWeekOffCount(numValue);
//     setAutoWeekOffPerMonth(numValue.toString());
//     setWeekOffPerMonth(numValue.toString());
//   };

//   // ✅ Toggle dropdown
//   const toggleDropdown = () => {
//     setIsDropdownOpen(!isDropdownOpen);
//   };

//   const fetchDepartments = async () => {
//     try {
//       const response = await axios.get('https://api.timelyhealth.in/api/department/all');
//       if (response.data.success) {
//         setDepartments(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching departments:', error);
//       setDepartments([]);
//     }
//   };

//   const fetchRoles = async () => {
//     try {
//       const response = await axios.get('https://api.timelyhealth.in/api/roles/all');
//       if (response.data.success) {
//         setRoles(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching roles:', error);
//       setRoles([]);
//     }
//   };

//   const fetchLocations = async () => {
//     try {
//       const res = await axios.get("https://api.timelyhealth.in/api/location/alllocation");
//       if (res.data?.locations) setLocations(res.data.locations);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const fetchAllShifts = async () => {
//     try {
//       const res = await axios.get("https://api.timelyhealth.in/api/shifts/master");
//       if (res.data && res.data.success && Array.isArray(res.data.data)) {
//         const shifts = res.data.data;
//         const shiftOptions = shifts.map(shift => ({
//           type: shift.shiftType,
//           name: shift.shiftName || `Shift ${shift.shiftType}`,
//           timeSlots: shift.timeSlots || []
//         }));
//         setShiftList(shiftOptions);
//       }
//     } catch (err) {
//       console.log("Error fetching shifts:", err.message);
//       setShiftList([]);
//     }
//   };

//   const handlePinCodeChange = async (e) => {
//     const value = e.target.value;
//     setPinCode(value);
    
//     if (value.length === 6) {
//       try {
//         const locationData = await getCityStateFromPincode(value);
//         if (locationData) {
//           setCity(locationData.city || "");
//           setState(locationData.state || "");
//           setCountry(locationData.country || "India");
//         } else {
//           setErrorMessage("Invalid pin code or not found. Please enter manually.");
//         }
//       } catch (error) {
//         console.error("Error fetching pin code data:", error);
//       }
//     } else if (value.length > 6) {
//       setPinCode(value.slice(0, 6));
//     }
//   };

//   const handleShiftChange = (selectedShift) => {
//     if (selectedShift === "ADD_NEW") {
//       setShowShiftModal(true);
//     } else {
//       setShiftType(selectedShift);
//       setShowShiftDetails(true);
      
//       if (selectedShift) {
//         const selectedShiftData = shiftList.find(shift => shift.type === selectedShift);
//         if (selectedShiftData && selectedShiftData.timeSlots && selectedShiftData.timeSlots.length > 0) {
//           const firstSlot = selectedShiftData.timeSlots[0];
//           const timeRange = firstSlot.timeRange;
//           const times = timeRange.split('-').map(t => t.trim());
//           if (times.length === 2) {
//             setShiftStartTime(times[0]);
//             setShiftEndTime(times[1]);
//           }
//         }
//       }
//     }
//   };

//   const getCurrentDate = () => {
//     return new Date().toISOString().split('T')[0];
//   };

//   const assignShiftToEmployee = async (empId, empName, shift, startTime, endTime) => {
//     try {
//       const shiftData = {
//         employeeId: empId,
//         employeeName: empName,
//         shiftType: shift.toUpperCase(),
//         startTime: startTime,
//         endTime: endTime
//       };
//       const response = await axios.post("https://api.timelyhealth.in/api/shifts/assign", shiftData);
//       return { success: true, data: response.data };
//     } catch (error) {
//       console.error("Shift assignment error:", error.response?.data || error.message);
//       return { success: false, message: error.response?.data?.message || error.message };
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrorMessage("");
//     setSuccessMessage("");

//     try {
//       if (dob) {
//         const dobDate = new Date(dob);
//         const today = new Date();
//         if (dobDate > today) {
//           throw new Error("Date of Birth cannot be in the future");
//         }
//       }

//       if (weekOffType === 'day' && selectedDays.length === 0) {
//         throw new Error("Please select at least one day for week off");
//       }
      
//       if (weekOffType === 'number' && weekOffCount < 0) {
//         throw new Error("Week off count cannot be negative");
//       }

//       if (pinCode && pinCode.length !== 6) {
//         throw new Error("Pin code must be 6 digits");
//       }

//       const fullAddress = formatFullAddress({ addressLine1, addressLine2, city, state, pinCode, country });

//       // ✅ Prepare week off data
//       let weekOffDayField = '';
//       if (weekOffType === 'day' && selectedDays.length > 0) {
//         // Create array with day names repeated based on count
//         const dayArray = selectedDays.flatMap(item => 
//           Array(item.count).fill(item.day)
//         );
//         weekOffDayField = dayArray.join(',');
//       }

//       const payload = {
//         name,
//         email,
//         phone,
//         dob: dob || null,
//         department,
//         role,
//         addressLine1,
//         addressLine2,
//         city,
//         state,
//         pinCode,
//         country,
//         employeeId,
//         joinDate,
//         locationId,
//         weekOffType,
//         weekOffDay: weekOffDayField,
//         weekOffCount: weekOffType === 'number' ? weekOffCount : 0,
//         shiftType: shiftType,
//         shiftHours,
//         salaryPerMonth: Number(salaryPerMonth) || 0,
//         weekOffPerMonth: Number(weekOffPerMonth) || 0,
//         address: fullAddress
//       };

//       if (password) payload.password = password;

//       if (editingEmployee) {
//         await axios.put(`https://api.timelyhealth.in/api/employees/update/${editingEmployee._id}`, payload);
        
//         if (showShiftDetails) {
//           await assignShiftToEmployee(editingEmployee.employeeId, name, shiftType, shiftStartTime, shiftEndTime);
//         }

//         await axios.put(`https://api.timelyhealth.in/api/salary/update-salary/${editingEmployee.employeeId}`, {
//           employeeId: editingEmployee.employeeId,
//           salaryPerMonth: Number(salaryPerMonth) || 0,
//           shiftHours: Number(shiftHours) || 8,
//           weekOffPerMonth: Number(weekOffPerMonth) || 0,
//         });

//         setSuccessMessage("✅ Employee updated successfully!");
//       } else {
//         await axios.post("https://api.timelyhealth.in/api/employees/add-employee", payload);
        
//         if (showShiftDetails) {
//           await assignShiftToEmployee(employeeId, name, shiftType, shiftStartTime, shiftEndTime);
//         }

//         await axios.post("https://api.timelyhealth.in/api/salary/set-salary", {
//           employeeId,
//           name,
//           salaryPerMonth: Number(salaryPerMonth),
//           shiftHours: Number(shiftHours),
//           weekOffPerMonth: Number(weekOffPerMonth),
//         });

//         setSuccessMessage("✅ Employee added successfully!");
//       }

//       setTimeout(() => navigate("/employeelist"), 1000);
//     } catch (err) {
//       console.error("Submit error:", err);
//       setErrorMessage(err.message || "Something went wrong!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ CREATE CUSTOM SHIFT FUNCTION
//   const handleCreateCustomShift = async (e) => {
//     e.preventDefault();
//     setErrorMessage("");
//     setSuccessMessage("");
//     try {
//       if (!createShiftForm.shiftType || !createShiftForm.shiftName || !createShiftForm.timeRange || !createShiftForm.description) {
//         setErrorMessage('Please fill all required fields');
//         return;
//       }

//       const response = await axios.post('https://api.timelyhealth.in/api/shifts/create', {
//         shiftType: createShiftForm.shiftType.toUpperCase(),
//         shiftName: createShiftForm.shiftName,
//         timeSlots: [{
//           timeRange: createShiftForm.timeRange,
//           description: createShiftForm.description
//         }]
//       });
      
//       if (response.data.success) {
//         setSuccessMessage(`✅ Shift ${createShiftForm.shiftType.toUpperCase()} created successfully!`);
//         await fetchAllShifts();
//         setShiftType(createShiftForm.shiftType.toUpperCase());
//         setShowShiftModal(false);
//         setCreateShiftForm({
//           shiftType: '',
//           shiftName: '',
//           timeRange: '',
//           description: ''
//         });
//       } else {
//         setErrorMessage(response.data.message);
//       }
//     } catch (error) {
//       console.error('Create custom error:', error);
//       setErrorMessage(error.response?.data?.message || 'Failed to create custom shift');
//     }
//   };

//   const handleCreateDepartment = async (e) => {
//     e.preventDefault();
//     setErrorMessage("");
//     setSuccessMessage("");
//     try {
//       if (!deptForm.name.trim()) {
//         setErrorMessage('Please enter department name');
//         return;
//       }
//       const response = await axios.post('https://api.timelyhealth.in/api/department/create', {
//         name: deptForm.name,
//         description: deptForm.description
//       });
//       if (response.data.success) {
//         setSuccessMessage(`✅ Department "${deptForm.name}" created successfully!`);
//         await fetchDepartments();
//         setDepartment(deptForm.name);
//         setShowDeptModal(false);
//         setDeptForm({ name: '', description: '' });
//       } else {
//         setErrorMessage(response.data.message);
//       }
//     } catch (error) {
//       console.error('Create department error:', error);
//       setErrorMessage(error.response?.data?.message || 'Failed to create department');
//     }
//   };

//   const handleCreateRole = async (e) => {
//     e.preventDefault();
//     setErrorMessage("");
//     setSuccessMessage("");
//     try {
//       if (!roleForm.name.trim()) {
//         setErrorMessage('Please enter role name');
//         return;
//       }
//       const response = await axios.post('https://api.timelyhealth.in/api/roles/create', {
//         name: roleForm.name,
//         description: roleForm.description
//       });
//       if (response.data.success) {
//         setSuccessMessage(`✅ Role "${roleForm.name}" created successfully!`);
//         await fetchRoles();
//         setRole(roleForm.name);
//         setShowRoleModal(false);
//         setRoleForm({ name: '', description: '' });
//       } else {
//         setErrorMessage(response.data.message);
//       }
//     } catch (error) {
//       console.error('Create role error:', error);
//       setErrorMessage(error.response?.data?.message || 'Failed to create role');
//     }
//   };

//   const handleGetCurrentLocation = async () => {
//     if (!navigator.geolocation) {
//       setErrorMessage("❌ Geolocation is not supported by your browser.");
//       return;
//     }

//     setErrorMessage("");

//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const { latitude, longitude } = position.coords;
//         setLocationForm(prev => ({
//           ...prev,
//           latitude: latitude.toFixed(6),
//           longitude: longitude.toFixed(6)
//         }));

//         try {
//           const res = await fetch(
//             `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
//           );
//           const data = await res.json();
//           if (data.display_name) {
//             setLocationForm(prev => ({
//               ...prev,
//               fullAddress: data.display_name
//             }));
//           } else {
//             setErrorMessage("⚠️ Could not fetch full address.");
//           }
//         } catch {
//           setErrorMessage("⚠️ Failed to fetch address from coordinates.");
//         }
//       },
//       (err) => {
//         setErrorMessage("❌ Location access denied. Please enter manually.");
//       }
//     );
//   };

//   const handleCreateLocation = async (e) => {
//     e.preventDefault();
//     setErrorMessage("");
//     setSuccessMessage("");
//     try {
//       if (!locationForm.name.trim() || !locationForm.latitude || !locationForm.longitude) {
//         setErrorMessage('Please fill all required fields');
//         return;
//       }
//       const response = await axios.post("https://api.timelyhealth.in/api/location/add-location", {
//         name: locationForm.name,
//         latitude: locationForm.latitude,
//         longitude: locationForm.longitude,
//         fullAddress: locationForm.fullAddress
//       });
//       if (response.data.success || response.data.location) {
//         setSuccessMessage(`✅ Location "${locationForm.name}" added successfully!`);
//         await fetchLocations();
//         const newLocation = response.data.location || response.data.data;
//         if (newLocation && newLocation._id) {
//           setLocationId(newLocation._id);
//         }
//         setShowLocationModal(false);
//         setLocationForm({ name: '', latitude: '', longitude: '', fullAddress: '' });
//       } else {
//         setErrorMessage(response.data.message || 'Failed to add location');
//       }
//     } catch (error) {
//       console.error('Create location error:', error);
//       setErrorMessage(error.response?.data?.message || 'Failed to add location');
//     }
//   };

//   return (
//     <div className="max-w-6xl p-4 mx-auto">
//       <div className="p-6 bg-white shadow-lg rounded-xl">
//         <div className="mb-6">
//           <h2 className="text-2xl font-bold text-gray-800">
//             {editingEmployee ? "Edit Employee" : "Add New Employee"}
//           </h2>
//           <p className="mt-1 text-sm text-gray-600">Fill in the employee details below</p>
//         </div>

//         {successMessage && (
//           <div className="p-3 mb-4 text-sm text-green-700 border border-green-200 rounded-lg bg-green-50">
//             {successMessage}
//           </div>
//         )}
        
//         {errorMessage && (
//           <div className="p-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
//             {errorMessage}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-6">
          
//           {/* ROW 1: Basic Personal Info */}
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaIdCard className="inline mr-1 text-blue-500" /> Full Name *
//               </label>
//               <input 
//                 value={name} 
//                 onChange={(e) => setName(e.target.value)} 
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 placeholder="John Doe"
//                 required 
//               />
//             </div>

//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaEnvelope className="inline mr-1 text-blue-500" /> Email *
//               </label>
//               <input 
//                 type="email" 
//                 value={email} 
//                 onChange={(e) => setEmail(e.target.value)} 
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 placeholder="john@example.com"
//                 required 
//               />
//             </div>

//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaLock className="inline mr-1 text-blue-500" /> Password {!editingEmployee && "*"}
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full p-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                   placeholder={editingEmployee ? "Keep blank for no change" : "Enter password"}
//                   required={!editingEmployee}
//                 />
//                 <button 
//                   type="button" 
//                   onClick={() => setShowPassword(!showPassword)} 
//                   className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
//                 >
//                   {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
//                 </button>
//               </div>
//             </div>

//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaPhone className="inline mr-1 text-blue-500" /> Phone
//               </label>
//               <input 
//                 value={phone} 
//                 onChange={(e) => setPhone(e.target.value)} 
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 placeholder="+91 9876543210"
//               />
//             </div>
//           </div>

//           {/* ROW 2: DOB, Employee ID, Join Date, Location */}
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaCalendar className="inline mr-1 text-blue-500" /> Date of Birth
//               </label>
//               <input 
//                 type="date" 
//                 value={dob} 
//                 onChange={(e) => setDob(e.target.value)} 
//                 max={getCurrentDate()}
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//               />
//               {dob && <p className="mt-1 text-xs text-gray-500">DD/MM/YYYY</p>}
//             </div>

//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaBriefcase className="inline mr-1 text-blue-500" /> Employee ID *
//               </label>
//               <input
//                 value={employeeId}
//                 onChange={(e) => setEmployeeId(e.target.value)}
//                 className={`w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${editingEmployee ? 'bg-gray-50' : ''}`}
//                 placeholder="EMP001"
//                 required
//                 readOnly={!!editingEmployee}
//               />
//             </div>

//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaCalendar className="inline mr-1 text-blue-500" /> Join Date *
//               </label>
//               <input 
//                 type="date" 
//                 value={joinDate} 
//                 onChange={(e) => setJoinDate(e.target.value)} 
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 required 
//               />
//             </div>

//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaMapMarkerAlt className="inline mr-1 text-blue-500" /> Location *
//               </label>
//               <select
//                 value={locationId}
//                 onChange={(e) => {
//                   const selectedValue = e.target.value;
//                   if (selectedValue === "ADD_NEW_LOCATION") {
//                     setShowLocationModal(true);
//                     return;
//                   }
//                   setLocationId(selectedValue);
//                 }}
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 required
//               >
//                 <option value="">Select Location</option>
//                 {locations.map((loc) => (
//                   <option key={loc._id} value={loc._id}>{loc.name}</option>
//                 ))}
//                 <option value="ADD_NEW_LOCATION" className="font-medium text-blue-600">+ Add New</option>
//               </select>
//             </div>
//           </div>

//           {/* ROW 3: Department & Role */}
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaBuilding className="inline mr-1 text-blue-500" /> Department *
//               </label>
//               <select
//                 value={department}
//                 onChange={(e) => {
//                   if (e.target.value === "ADD_NEW_DEPT") {
//                     setShowDeptModal(true);
//                   } else {
//                     setDepartment(e.target.value);
//                   }
//                 }}
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 required
//               >
//                 <option value="">Select Department</option>
//                 {departments.map((dept) => (
//                   <option key={dept.name} value={dept.name}>
//                     {dept.name} {dept.employeeCount > 0 ? `(${dept.employeeCount})` : ''}
//                   </option>
//                 ))}
//                 <option value="ADD_NEW_DEPT" className="font-medium text-blue-600">+ Add New</option>
//               </select>
//             </div>

//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaUserTie className="inline mr-1 text-blue-500" /> Role *
//               </label>
//               <select
//                 value={role}
//                 onChange={(e) => {
//                   if (e.target.value === "ADD_NEW_ROLE") {
//                     setShowRoleModal(true);
//                   } else {
//                     setRole(e.target.value);
//                   }
//                 }}
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 required
//               >
//                 <option value="">Select Role</option>
//                 {roles.map((roleItem) => (
//                   <option key={roleItem.name} value={roleItem.name}>
//                     {roleItem.name} {roleItem.employeeCount > 0 ? `(${roleItem.employeeCount})` : ''}
//                   </option>
//                 ))}
//                 <option value="ADD_NEW_ROLE" className="font-medium text-blue-600">+ Add New</option>
//               </select>
//             </div>
//           </div>

//           {/* ADDRESS SECTION */}
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaMapMarkerAlt className="inline mr-1 text-gray-400" /> Address Line 1 *
//               </label>
//               <input 
//                 value={addressLine1} 
//                 onChange={(e) => setAddressLine1(e.target.value)} 
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 placeholder="House no, Street, Area"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaMapMarkerAlt className="inline mr-1 text-gray-400" /> Address Line 2
//               </label>
//               <input 
//                 value={addressLine2} 
//                 onChange={(e) => setAddressLine2(e.target.value)} 
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 placeholder="Landmark, Building name"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaMapPin className="inline mr-1 text-gray-400" /> Pin Code *
//               </label>
//               <input 
//                 type="text" 
//                 value={pinCode} 
//                 onChange={handlePinCodeChange}
//                 maxLength="6"
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 placeholder="110001"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaCity className="inline mr-1 text-gray-400" /> City *
//               </label>
//               <input 
//                 value={city} 
//                 onChange={(e) => setCity(e.target.value)} 
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 placeholder="City"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaGlobeAsia className="inline mr-1 text-gray-400" /> State *
//               </label>
//               <input 
//                 value={state} 
//                 onChange={(e) => setState(e.target.value)} 
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 placeholder="State"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaGlobeAsia className="inline mr-1 text-gray-400" /> Country
//               </label>
//               <select
//                 value={country}
//                 onChange={(e) => setCountry(e.target.value)}
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//               >
//                 <option value="India">India</option>
//                 <option value="USA">USA</option>
//                 <option value="UK">UK</option>
//                 <option value="Other">Other</option>
//               </select>
//             </div>
//           </div>

//           {/* ✅ UPDATED WEEK OFF SECTION WITH SIMPLE MULTI-SELECT DROPDOWN */}
// {/* ✅ UPDATED WEEK OFF SECTION WITH PROPER MULTI-SELECT DROPDOWN */}
// <div className="pt-6 border-t">
//   <h3 className="mb-4 text-lg font-semibold text-gray-800">
//     <FaCalendar className="inline mr-2 text-blue-500" /> Week Off Selection
//   </h3>
  
//   <div className="space-y-6">
//     <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//       <div>
//         <label className="block mb-1 text-sm font-medium text-gray-700">
//           Week Off Type *
//         </label>
//         <select
//           value={weekOffType}
//           onChange={(e) => handleWeekOffTypeChange(e.target.value)}
//           className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//           required
//         >
//           <option value="">Select Type</option>
//           <option value="day">By Day(s)</option>
//           <option value="number">By Number</option>
//         </select>
//       </div>

//       {weekOffType === 'number' && (
//         <div>
//           <label className="block mb-1 text-sm font-medium text-gray-700">
//             Number of Week Offs/Month *
//           </label>
//           <input
//             type="number"
//             value={weekOffCount}
//             onChange={(e) => handleWeekOffCountChange(e.target.value)}
//             min="0"
//             max="30"
//             className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//             placeholder="Enter number"
//             required
//           />
//         </div>
//       )}

//       <div>
//         <label className="block mb-1 text-sm font-medium text-gray-700">
//           Week Offs per Month
//         </label>
//         <div className="relative">
//           <input 
//             type="number" 
//             value={autoWeekOffPerMonth} 
//             readOnly
//             className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50"
//           />
//           <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
//             <span className="text-green-600">
//               <FaCheck />
//             </span>
//           </div>
//         </div>
//         <p className="mt-1 text-xs text-gray-500">Auto-calculated: Total selected days count</p>
//       </div>
//     </div>

//     {/* Multi-select Dropdown with Multiple Selections */}
//     {weekOffType === 'day' && (
//       <div className="space-y-3">
//         <div className="relative">
//           <label className="block mb-1 text-sm font-medium text-gray-700">
//             Select Day(s) *
//           </label>
          
//           {/* Custom Dropdown Button */}
//           <div 
//             className="w-full p-2.5 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-blue-400 transition-colors flex items-center justify-between"
//             onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//           >
//             <div className="flex-1">
//               {selectedDays.length > 0 ? (
//                 <span className="text-gray-800">
//                   {selectedDays.length} day(s) selected
//                 </span>
//               ) : (
//                 <span className="text-gray-400">Click to select days...</span>
//               )}
//             </div>
//             <svg 
//               className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
//               fill="none" 
//               stroke="currentColor" 
//               viewBox="0 0 24 24" 
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
//             </svg>
//           </div>

//           {/* Dropdown Options */}
//           {isDropdownOpen && (
//             <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg max-h-60">
//               <div className="p-3 border-b bg-gray-50">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm font-medium text-gray-700">Select Multiple Days</span>
//                   <div className="flex gap-2">
//                     <button
//                       type="button"
//                       onClick={() => {
//                         const allDays = daysOfWeek.map(d => d.name);
//                         setSelectedDays(allDays);
//                         const totalWeekOffs = allDays.length;
//                         setAutoWeekOffPerMonth(totalWeekOffs.toString());
//                         setWeekOffPerMonth(totalWeekOffs.toString());
//                         setIsDropdownOpen(false);
//                       }}
//                       className="px-2 py-1 text-xs text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
//                     >
//                       Select All
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setSelectedDays([]);
//                         setAutoWeekOffPerMonth("0");
//                         setWeekOffPerMonth("0");
//                         setIsDropdownOpen(false);
//                       }}
//                       className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
//                     >
//                       Clear All
//                     </button>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="p-2 space-y-1">
//                 {daysOfWeek.map((day) => {
//                   const dayCount = selectedDays.filter(d => d === day.name).length;
//                   const isSelected = dayCount > 0;
                  
//                   return (
//                     <div 
//                       key={day.id}
//                       className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
//                         isSelected ? 'bg-blue-50 border border-blue-200' : ''
//                       }`}
//                       onClick={() => {
//                         // Add the day to selected days array (allow multiple same days)
//                         const newSelectedDays = [...selectedDays, day.name];
//                         setSelectedDays(newSelectedDays);
                        
//                         // Calculate total week offs
//                         const totalWeekOffs = newSelectedDays.length;
//                         setAutoWeekOffPerMonth(totalWeekOffs.toString());
//                         setWeekOffPerMonth(totalWeekOffs.toString());
//                       }}
//                     >
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center">
//                           <div className={`w-5 h-5 border rounded mr-3 flex items-center justify-center ${
//                             isSelected 
//                               ? 'bg-blue-500 border-blue-500' 
//                               : 'border-gray-300'
//                           }`}>
//                             {isSelected && (
//                               <FaCheck className="w-3 h-3 text-white" />
//                             )}
//                           </div>
//                           <div>
//                             <div className="font-medium text-gray-800">{day.name}</div>
//                             <div className="text-xs text-gray-500">{day.short}</div>
//                           </div>
//                         </div>
//                         {dayCount > 0 && (
//                           <div className="flex items-center space-x-2">
//                             <span className="text-sm font-medium text-blue-600">
//                               {dayCount} time{dayCount > 1 ? 's' : ''}
//                             </span>
//                             <button
//                               type="button"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 // Remove one instance of this day
//                                 const index = selectedDays.indexOf(day.name);
//                                 if (index > -1) {
//                                   const newSelectedDays = [...selectedDays];
//                                   newSelectedDays.splice(index, 1);
//                                   setSelectedDays(newSelectedDays);
                                  
//                                   const totalWeekOffs = newSelectedDays.length;
//                                   setAutoWeekOffPerMonth(totalWeekOffs.toString());
//                                   setWeekOffPerMonth(totalWeekOffs.toString());
//                                 }
//                               }}
//                               className="text-red-500 hover:text-red-700"
//                             >
//                               <FaMinus size={12} />
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
              
//               <div className="p-3 border-t bg-gray-50">
//                 <div className="flex items-center justify-between">
//                   <div className="text-sm text-gray-700">
//                     <span className="font-medium">Total Selected:</span> {selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''}
//                   </div>
//                   <div className="text-sm font-medium text-green-600">
//                     Week Offs/Month: {selectedDays.length}
//                   </div>
//                 </div>
//                 <p className="mt-2 text-xs text-gray-600">
//                   <strong>How to select:</strong> Click on any day to add it. Click multiple times on same day to add multiple times.
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Selected Summary (Only if there are selections) */}
//         {selectedDays.length > 0 && (
//           <div className="p-4 rounded-lg bg-gray-50">
//             <div className="flex items-center justify-between mb-3">
//               <h4 className="font-medium text-gray-700">Selected Days Summary</h4>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setSelectedDays([]);
//                   setAutoWeekOffPerMonth("0");
//                   setWeekOffPerMonth("0");
//                 }}
//                 className="text-sm text-red-600 hover:text-red-800"
//               >
//                 Clear All
//               </button>
//             </div>
            
//             {/* Group by day name */}
//             {(() => {
//               const dayGroups = {};
//               selectedDays.forEach(day => {
//                 if (!dayGroups[day]) dayGroups[day] = 0;
//                 dayGroups[day]++;
//               });
              
//               return Object.entries(dayGroups).map(([dayName, count], index) => (
//                 <div key={index} className="flex items-center justify-between p-3 mb-2 bg-white border rounded">
//                   <div className="flex items-center">
//                     <span className="font-medium text-gray-800">{dayName}</span>
//                     <span className="ml-2 text-sm text-gray-500">
//                       ({daysOfWeek.find(d => d.name === dayName)?.short})
//                     </span>
//                   </div>
//                   <div className="flex items-center space-x-3">
//                     <div className="text-lg font-bold text-blue-600">{count}</div>
//                     <button
//                       type="button"
//                       onClick={() => {
//                         // Remove all instances of this day
//                         const newSelectedDays = selectedDays.filter(d => d !== dayName);
//                         setSelectedDays(newSelectedDays);
                        
//                         const totalWeekOffs = newSelectedDays.length;
//                         setAutoWeekOffPerMonth(totalWeekOffs.toString());
//                         setWeekOffPerMonth(totalWeekOffs.toString());
//                       }}
//                       className="text-red-500 hover:text-red-700"
//                     >
//                       <FaTimes />
//                     </button>
//                   </div>
//                 </div>
//               ));
//             })()}
            
//             <div className="pt-3 mt-3 border-t">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <span className="font-bold text-gray-800">Total Days Selected:</span>
//                   <span className="ml-2 text-lg font-bold text-blue-600">{selectedDays.length}</span>
//                 </div>
//                 <div>
//                   <span className="font-bold text-gray-800">Week Offs/Month:</span>
//                   <span className="ml-2 text-xl font-bold text-green-600">{selectedDays.length}</span>
//                 </div>
//               </div>
//               <p className="mt-2 text-xs text-gray-600">
//                 Each selected day (including multiple selections of same day) = 1 week off per month
//               </p>
//             </div>
//           </div>
//         )}
        
//         {/* Instructions */}
//         {/* <div className="p-3 text-sm text-gray-600 rounded-lg bg-blue-50">
//           <p className="mb-1 font-medium text-blue-800">💡 Instructions:</p>
//           <ul className="pl-5 space-y-1 list-disc">
//             <li>Click on the dropdown to open day selection</li>
//             <li>Click on any day to add it (can click same day multiple times)</li>
//             <li>Use "Select All" to select all days once</li>
//             <li>Use "Clear All" to remove all selections</li>
//             <li>Use <FaMinus className="inline text-red-500" /> button to remove one instance of a day</li>
//             <li>Each click on a day = 1 week off per month</li>
//           </ul>
//         </div> */}
//       </div>
//     )}
//   </div>
// </div>
//           {/* SHIFT SECTION */}
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaClock className="inline mr-1 text-blue-500" /> Shift Type *
//               </label>
//               <select
//                 value={shiftType}
//                 onChange={(e) => handleShiftChange(e.target.value)}
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                 required
//               >
//                 <option value="">Select Shift</option>
//                 {shiftList && shiftList.length > 0 ? (
//                   shiftList.map((shift) => (
//                     <option key={shift.type} value={shift.type}>
//                       Shift {shift.type}: {shift.name}
//                     </option>
//                   ))
//                 ) : (
//                   <option value="" disabled>Loading shifts...</option>
//                 )}
//                 <option value="ADD_NEW" className="font-medium text-blue-600">+ Add New</option>
//               </select>
//             </div>

//             {showShiftDetails && (
//               <>
//                 <div>
//                   <label className="block mb-1 text-sm font-medium text-gray-700">
//                     Start Time *
//                   </label>
//                   <input
//                     type="time"
//                     value={shiftStartTime}
//                     onChange={(e) => setShiftStartTime(e.target.value)}
//                     className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50"
//                     required
//                     readOnly
//                   />
//                 </div>

//                 <div>
//                   <label className="block mb-1 text-sm font-medium text-gray-700">
//                     End Time *
//                   </label>
//                   <input
//                     type="time"
//                     value={shiftEndTime}
//                     onChange={(e) => setShiftEndTime(e.target.value)}
//                     className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50"
//                     required
//                     readOnly
//                   />
//                 </div>

//                 <div>
//                   <label className="block mb-1 text-sm font-medium text-gray-700">
//                     Shift Hours/Day *
//                   </label>
//                   <input 
//                     type="number" 
//                     value={shiftHours} 
//                     onChange={(e) => setShiftHours(e.target.value)} 
//                     className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                     min="1"
//                     max="24"
//                     required 
//                   />
//                 </div>
//               </>
//             )}
//           </div>

//           {/* SALARY SECTION */}
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 <FaDollarSign className="inline mr-1 text-blue-500" /> Salary/Month *
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//                   <span className="text-sm text-gray-500">₹</span>
//                 </div>
//                 <input 
//                   type="number" 
//                   value={salaryPerMonth} 
//                   onChange={(e) => setSalaryPerMonth(e.target.value)} 
//                   className="pl-8 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                   placeholder="0.00"
//                   required 
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 Week Offs/Month *
//               </label>
//               <input 
//                 type="number" 
//                 value={weekOffPerMonth} 
//                 readOnly
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50"
//                 placeholder="0"
//                 required 
//               />
//               <p className="mt-1 text-xs text-gray-500">Auto-filled from week off selection</p>
//             </div>
//           </div>

//           {/* SUBMIT BUTTON */}
//           <div className="pt-4">
//             <button 
//               type="submit" 
//               disabled={loading} 
//               className={`w-full md:w-auto px-8 py-3 rounded-lg font-medium transition duration-200 ${
//                 loading 
//                   ? 'bg-gray-400 cursor-not-allowed' 
//                   : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
//               }`}
//             >
//               {loading ? (
//                 <div className="flex items-center justify-center">
//                   <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Processing...
//                 </div>
//               ) : editingEmployee ? (
//                 "Update Employee"
//               ) : (
//                 "Add Employee"
//               )}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* CREATE SHIFT MODAL */}
//       {showShiftModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
//             <div className="flex items-center justify-between p-6 border-b">
//               <h3 className="text-xl font-semibold text-gray-800">Create New Shift</h3>
//               <button onClick={() => setShowShiftModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">
//                 &times;
//               </button>
//             </div>

//             <form onSubmit={handleCreateCustomShift} className="p-6">
//               <div className="space-y-6">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">
//                       Shift Type (Letter A-Z) *
//                     </label>
//                     <input
//                       type="text"
//                       maxLength="1"
//                       value={createShiftForm.shiftType}
//                       onChange={(e) => setCreateShiftForm(prev => ({ 
//                         ...prev, 
//                         shiftType: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')
//                       }))}
//                       className="w-full px-4 py-2 text-sm uppercase border border-gray-300 rounded-lg"
//                       placeholder="E"
//                       required
//                     />
//                     <p className="mt-1 text-xs text-gray-500">Enter a single letter (A-Z)</p>
//                   </div>
                  
//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">
//                       Shift Name *
//                     </label>
//                     <input
//                       type="text"
//                       value={createShiftForm.shiftName}
//                       onChange={(e) => setCreateShiftForm(prev => ({ ...prev, shiftName: e.target.value }))}
//                       className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
//                       placeholder="e.g., Extended Shift E"
//                       required
//                     />
//                   </div>
//                 </div>

//                 {/* Single Time Slot Configuration */}
//                 <div>
//                   <label className="block mb-3 text-sm font-medium text-gray-700">
//                     Time Slot Configuration *
//                   </label>
                  
//                   <div className="p-3 space-y-3 border rounded-lg bg-gray-50">
//                     <div>
//                       <label className="block mb-1 text-xs text-gray-600">Time Range *</label>
//                       <input
//                         type="text"
//                         value={createShiftForm.timeRange}
//                         onChange={(e) => setCreateShiftForm(prev => ({ ...prev, timeRange: e.target.value }))}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
//                         placeholder="e.g., 10:00 - 19:00"
//                         required
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="block mb-1 text-xs text-gray-600">Description *</label>
//                       <input
//                         type="text"
//                         value={createShiftForm.description}
//                         onChange={(e) => setCreateShiftForm(prev => ({ ...prev, description: e.target.value }))}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
//                         placeholder="e.g., Morning 10 to 7"
//                         required
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Preview */}
//                 {createShiftForm.shiftType && createShiftForm.timeRange && (
//                   <div className="p-3 border border-blue-200 rounded bg-blue-50">
//                     <h4 className="mb-2 text-sm font-medium text-blue-800">Preview:</h4>
//                     <p className="text-sm text-blue-700">
//                       Shift {createShiftForm.shiftType}: {createShiftForm.shiftName}
//                     </p>
//                     <p className="mt-1 text-sm text-blue-600">
//                       Time: {createShiftForm.timeRange}
//                     </p>
//                   </div>
//                 )}
//               </div>

//               <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
//                 <button
//                   type="button"
//                   onClick={() => setShowShiftModal(false)}
//                   className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700"
//                 >
//                   Create Shift
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* DEPARTMENT MODAL */}
//       {showDeptModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
//             <div className="flex items-center justify-between p-6 border-b">
//               <h3 className="text-xl font-semibold text-gray-800">Add New Department</h3>
//               <button onClick={() => setShowDeptModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
//             </div>
//             <form onSubmit={handleCreateDepartment} className="p-6">
//               <div className="space-y-4">
//                 <div><label className="block mb-2 text-sm font-medium text-gray-700">Department Name *</label><input type="text" value={deptForm.name} onChange={(e) => setDeptForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Sales, Development" required /></div>
//                 <div><label className="block mb-2 text-sm font-medium text-gray-700">Description</label><textarea value={deptForm.description} onChange={(e) => setDeptForm(prev => ({ ...prev, description: e.target.value }))} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Describe the department..." /></div>
//               </div>
//               <div className="flex justify-end pt-6 mt-6 space-x-3 border-t">
//                 <button type="button" onClick={() => setShowDeptModal(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg">Cancel</button>
//                 <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">Add Department</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ROLE MODAL */}
//       {showRoleModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
//             <div className="flex items-center justify-between p-6 border-b">
//               <h3 className="text-xl font-semibold text-gray-800">Add New Role</h3>
//               <button onClick={() => setShowRoleModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
//             </div>
//             <form onSubmit={handleCreateRole} className="p-6">
//               <div className="space-y-4">
//                 <div><label className="block mb-2 text-sm font-medium text-gray-700">Role Name *</label><input type="text" value={roleForm.name} onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Manager, Developer" required /></div>
//                 <div><label className="block mb-2 text-sm font-medium text-gray-700">Description</label><textarea value={roleForm.description} onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Describe the role..." /></div>
//               </div>
//               <div className="flex justify-end pt-6 mt-6 space-x-3 border-t">
//                 <button type="button" onClick={() => setShowRoleModal(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg">Cancel</button>
//                 <button type="submit" className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700">Add Role</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* LOCATION MODAL */}
//       {showLocationModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between p-6 border-b">
//               <h3 className="text-xl font-semibold text-gray-800">Add New Location</h3>
//               <button onClick={() => setShowLocationModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
//             </div>
//             <form onSubmit={handleCreateLocation} className="p-6">
//               <div className="space-y-6">
//                 <div><label className="block mb-2 text-sm font-medium text-gray-700">Location Name *</label><input type="text" value={locationForm.name} onChange={(e) => setLocationForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Main Office, Branch Office" required /></div>
//                 <div className="flex items-center justify-between mb-3"><label className="block text-sm font-medium text-gray-700">Location Coordinates</label><button type="button" onClick={handleGetCurrentLocation} className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700">📍 Get Current Location</button></div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div><label className="block mb-2 text-sm font-medium text-gray-700">Latitude *</label><input type="text" value={locationForm.latitude} onChange={(e) => setLocationForm(prev => ({ ...prev, latitude: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g., 28.6139" required /></div>
//                   <div><label className="block mb-2 text-sm font-medium text-gray-700">Longitude *</label><input type="text" value={locationForm.longitude} onChange={(e) => setLocationForm(prev => ({ ...prev, longitude: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g., 77.2090" required /></div>
//                 </div>
//                 <div><label className="block mb-2 text-sm font-medium text-gray-700">Full Address *</label><textarea value={locationForm.fullAddress} onChange={(e) => setLocationForm(prev => ({ ...prev, fullAddress: e.target.value }))} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Enter full address" required /></div>
//               </div>
//               <div className="flex justify-end pt-6 mt-6 space-x-3 border-t">
//                 <button type="button" onClick={() => setShowLocationModal(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg">Cancel</button>
//                 <button type="submit" className="px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700">Add Location</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AddEmployeePage;


import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  FaBriefcase, FaBuilding, FaCalendar, FaCheck,
  FaCity, FaClock, FaDollarSign, FaEnvelope,
  FaEye, FaEyeSlash, FaGlobeAsia,
  FaLock, FaMapMarkerAlt, FaMapPin, FaPhone,
  FaSpinner,
  FaUser,
  FaUserTie
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE_URL = "https://api.timelyhealth.in/api";

// ✅ Pin Code Utility Functions
const PINCODE_DATA = {
  "110001": { city: "New Delhi", state: "Delhi" },
  "400001": { city: "Mumbai", state: "Maharashtra" },
  "700001": { city: "Kolkata", state: "West Bengal" },
  "600001": { city: "Chennai", state: "Tamil Nadu" },
  "560001": { city: "Bengaluru", state: "Karnataka" },
  "380001": { city: "Ahmedabad", state: "Gujarat" },
  "302001": { city: "Jaipur", state: "Rajasthan" },
  "411001": { city: "Pune", state: "Maharashtra" },
  "800001": { city: "Patna", state: "Bihar" },
  "500001": { city: "Hyderabad", state: "Telangana" },
  "847301": { city: "Samastipur", state: "Bihar" },
};

const getCityStateFromPincode = async (pincode) => {
  try {
    if (PINCODE_DATA[pincode]) {
      return PINCODE_DATA[pincode];
    }
    
    try {
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
      if (response.data && response.data[0] && response.data[0].Status === "Success") {
        const postOffice = response.data[0].PostOffice[0];
        return {
          city: postOffice.District || postOffice.Name,
          state: postOffice.State,
          country: "India"
        };
      }
    } catch (apiError) {
      console.warn("External API failed, using local data");
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching pincode data:", error);
    return null;
  }
};

const formatFullAddress = (addressData) => {
  const { addressLine1, addressLine2, city, state, pinCode, country } = addressData;
  let address = addressLine1 || '';
  if (addressLine2) address += `, ${addressLine2}`;
  if (city) address += `, ${city}`;
  if (state) address += `, ${state}`;
  if (pinCode) address += ` - ${pinCode}`;
  if (country) address += `, ${country}`;
  return address;
};

const AddEmployeePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editingEmployee = location.state?.employee || null;
  const searchTimeoutRef = useRef(null);

  // ✅ PERSONAL INFO
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [parentsName, setParentsName] = useState("");
  const [alternateNumber, setAlternateNumber] = useState("");

  // ✅ DEPARTMENT & ROLE
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");

  // ✅ ADDRESS
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [country, setCountry] = useState("India");

  // ✅ LOCATION
  const [locationId, setLocationId] = useState("");

  // ✅ WEEK OFF (SIMPLIFIED - SINGLE FIELD)
  const [weekOffsPerMonth, setWeekOffsPerMonth] = useState("0");

  // ✅ SHIFT
  const [shiftType, setShiftType] = useState("");
  const [shiftStartTime, setShiftStartTime] = useState("09:00");
  const [shiftEndTime, setShiftEndTime] = useState("18:00");
  const [shiftHours, setShiftHours] = useState("8");
  const [showShiftDetails, setShowShiftDetails] = useState(false);

  // ✅ SALARY
  const [salaryPerMonth, setSalaryPerMonth] = useState("");

  // ✅ EXISTING STATES
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [shiftList, setShiftList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  // ✅ Employee found status
  const [employeeFound, setEmployeeFound] = useState(false);
  const [searchedPhone, setSearchedPhone] = useState("");
  
  // ✅ Shift Creation Form
  const [createShiftForm, setCreateShiftForm] = useState({
    shiftType: '',
    shiftName: '',
    timeRange: '',
    description: ''
  });
  
  const [deptForm, setDeptForm] = useState({ name: '', description: '' });
  const [roleForm, setRoleForm] = useState({ name: '', description: '' });
  const [locationForm, setLocationForm] = useState({
    name: '',
    latitude: '',
    longitude: '',
    fullAddress: ''
  });

  useEffect(() => {
    fetchDepartments();
    fetchRoles();
    fetchAllShifts();
    fetchLocations();
  }, []);

  useEffect(() => {
    if (editingEmployee) {
      loadEmployeeData(editingEmployee);
    }
  }, [editingEmployee, shiftList]);

  // ✅ Auto-search when phone number is entered
  useEffect(() => {
    if (!editingEmployee && phone.length === 10 && phone !== searchedPhone) {
      // Clear any existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Set new timeout to search after 500ms
      searchTimeoutRef.current = setTimeout(() => {
        searchEmployeeByPhone();
      }, 500);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [phone, editingEmployee]);

  // ✅ Load employee data
  const loadEmployeeData = (employee) => {
    // Split name into first and last name
    const nameParts = employee.name ? employee.name.trim().split(' ') : ['', ''];
    setFirstName(nameParts[0] || "");
    setLastName(nameParts.slice(1).join(' ') || "");
    
    setEmail(employee.email || "");
    setPhone(employee.phone || "");
    setDob(employee.dob ? new Date(employee.dob).toISOString().split('T')[0] : "");
    setEmployeeId(employee.employeeId || "");
    setJoinDate(employee.joinDate ? new Date(employee.joinDate).toISOString().split('T')[0] : "");
    setDepartment(employee.department || "");
    setRole(employee.role || "");
    
    setAddressLine1(employee.addressLine1 || "");
    setAddressLine2(employee.addressLine2 || "");
    setCity(employee.city || "");
    setState(employee.state || "");
    setPinCode(employee.pinCode || "");
    setCountry(employee.country || "India");
    
    setLocationId(employee.location?._id || employee.location || "");
    
    // Week Off (Simplified)
    setWeekOffsPerMonth(employee.weekOffPerMonth?.toString() || "0");
    
    // New fields
    setParentsName(employee.parentsName || "");
    setAlternateNumber(employee.alternateNumber || "");
    
    // Shift
    setShiftType(employee.shiftType || "");
    setShiftHours(employee.shiftHours?.toString() || "8");
    setSalaryPerMonth(employee.salaryPerMonth?.toString() || "");
    setPassword("");
    
    if (employee.shiftType) {
      setShowShiftDetails(true);
      const shiftData = shiftList.find(s => s.type === employee.shiftType);
      if (shiftData && shiftData.timeSlots && shiftData.timeSlots[0]) {
        const timeRange = shiftData.timeSlots[0].timeRange;
        const times = timeRange.split('-').map(t => t.trim());
        if (times.length === 2) {
          setShiftStartTime(times[0]);
          setShiftEndTime(times[1]);
        }
      }
    }
  };

  // ✅ Search employee by phone number (Auto-trigger)
  const searchEmployeeByPhone = async () => {
    if (!phone || phone.length !== 10 || phone === searchedPhone) {
      return;
    }

    // Don't search if we're already in edit mode
    if (editingEmployee) {
      return;
    }

    setSearching(true);
    setErrorMessage("");
    setSuccessMessage("");
    setEmployeeFound(false);
    setSearchedPhone(phone);

    try {
      const response = await axios.get(`${API_BASE_URL}/employees/get-employee-by-phone`, {
        params: { phone }
      });

      if (response.data.success) {
        const employee = response.data.data;
        loadEmployeeData(employee);
        setEmployeeFound(true);
        setSuccessMessage(`Employee "${employee.name}" found! Data loaded successfully.`);
      } else {
        // Employee not found - clear form for new entry
        resetFormForNewEntry();
        setEmployeeFound(false);
      }
    } catch (error) {
      console.error("Search error:", error);
      if (error.response?.status === 404) {
        // Employee not found - clear form for new entry
        resetFormForNewEntry();
        setEmployeeFound(false);
      } else {
        setErrorMessage("Failed to search employee. Please try again.");
        setEmployeeFound(false);
      }
    } finally {
      setSearching(false);
    }
  };

  // ✅ Reset form for new entry
  const resetFormForNewEntry = () => {
    // Only reset if we're not editing and phone has changed
    if (!editingEmployee) {
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setDob("");
      setEmployeeId("");
      setJoinDate("");
      setDepartment("");
      setRole("");
      setAddressLine1("");
      setAddressLine2("");
      setCity("");
      setState("");
      setPinCode("");
      setCountry("India");
      setLocationId("");
      setWeekOffsPerMonth("0");
      setParentsName("");
      setAlternateNumber("");
      setShiftType("");
      setShiftHours("8");
      setSalaryPerMonth("");
      setEmployeeId(generateEmployeeId());
    }
  };

  // ✅ Generate new employee ID
  const generateEmployeeId = () => {
    const randomNum = Math.floor(Math.random() * 900) + 100;
    return `EMP${randomNum}`;
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/department/all`);
      if (response.data.success) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/roles/all`);
      if (response.data.success) {
        setRoles(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles([]);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/location/alllocation`);
      if (res.data?.locations) setLocations(res.data.locations);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllShifts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/shifts/master`);
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        const shifts = res.data.data;
        const shiftOptions = shifts.map(shift => ({
          type: shift.shiftType,
          name: shift.shiftName || `Shift ${shift.shiftType}`,
          timeSlots: shift.timeSlots || []
        }));
        setShiftList(shiftOptions);
      }
    } catch (err) {
      console.log("Error fetching shifts:", err.message);
      setShiftList([]);
    }
  };

  const handlePinCodeChange = async (e) => {
    const value = e.target.value;
    setPinCode(value);
    
    if (value.length === 6) {
      try {
        const locationData = await getCityStateFromPincode(value);
        if (locationData) {
          setCity(locationData.city || "");
          setState(locationData.state || "");
          setCountry(locationData.country || "India");
        } else {
          setErrorMessage("Invalid pin code or not found. Please enter manually.");
        }
      } catch (error) {
        console.error("Error fetching pin code data:", error);
      }
    } else if (value.length > 6) {
      setPinCode(value.slice(0, 6));
    }
  };

  const handleShiftChange = (selectedShift) => {
    if (selectedShift === "ADD_NEW") {
      setShowShiftModal(true);
    } else {
      setShiftType(selectedShift);
      setShowShiftDetails(true);
      
      if (selectedShift) {
        const selectedShiftData = shiftList.find(shift => shift.type === selectedShift);
        if (selectedShiftData && selectedShiftData.timeSlots && selectedShiftData.timeSlots.length > 0) {
          const firstSlot = selectedShiftData.timeSlots[0];
          const timeRange = firstSlot.timeRange;
          const times = timeRange.split('-').map(t => t.trim());
          if (times.length === 2) {
            setShiftStartTime(times[0]);
            setShiftEndTime(times[1]);
          }
        }
      }
    }
  };

  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const assignShiftToEmployee = async (empId, empName, shift, startTime, endTime) => {
    try {
      const shiftData = {
        employeeId: empId,
        employeeName: empName,
        shiftType: shift.toUpperCase(),
        startTime: startTime,
        endTime: endTime
      };
      const response = await axios.post(`${API_BASE_URL}/shifts/assign`, shiftData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Shift assignment error:", error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Validation
      if (!phone || phone.length !== 10) {
        throw new Error("Please enter a valid 10-digit phone number");
      }

      if (dob) {
        const dobDate = new Date(dob);
        const today = new Date();
        if (dobDate > today) {
          throw new Error("Date of Birth cannot be in the future");
        }
      }

      if (pinCode && pinCode.length !== 6) {
        throw new Error("Pin code must be 6 digits");
      }

      if (!employeeId) {
        setEmployeeId(generateEmployeeId());
      }

      const fullAddress = formatFullAddress({ addressLine1, addressLine2, city, state, pinCode, country });

      const payload = {
        firstName,
        lastName,
        email,
        phone,
        dob: dob || null,
        department,
        role,
        addressLine1,
        addressLine2,
        city,
        state,
        pinCode,
        country,
        employeeId,
        joinDate,
        locationId,
        weekOffType: "number",
        weekOffCount: parseInt(weekOffsPerMonth) || 0,
        shiftType,
        shiftHours,
        salaryPerMonth: Number(salaryPerMonth) || 0,
        weekOffPerMonth: Number(weekOffsPerMonth) || 0,
        parentsName,
        alternateNumber,
        address: fullAddress
      };

      if (password) payload.password = password;

      if (editingEmployee || employeeFound) {
        // Update existing employee
        const employeeIdToUpdate = editingEmployee ? editingEmployee._id : null;
        if (!employeeIdToUpdate && employeeFound) {
          // If we found employee by phone but don't have _id, we need to fetch it first
          const response = await axios.get(`${API_BASE_URL}/employees/get-employee-by-phone`, {
            params: { phone }
          });
          if (response.data.success) {
            const employee = response.data.data;
            await axios.put(`${API_BASE_URL}/employees/update/${employee._id}`, payload);
          }
        } else {
          await axios.put(`${API_BASE_URL}/employees/update/${employeeIdToUpdate}`, payload);
        }
        
        if (showShiftDetails) {
          const empId = editingEmployee ? editingEmployee.employeeId : employeeId;
          const empName = `${firstName} ${lastName}`;
          await assignShiftToEmployee(empId, empName, shiftType, shiftStartTime, shiftEndTime);
        }

        // Update salary
        const salaryEmpId = editingEmployee ? editingEmployee.employeeId : employeeId;
        await axios.put(`${API_BASE_URL}/salary/update-salary/${salaryEmpId}`, {
          employeeId: salaryEmpId,
          salaryPerMonth: Number(salaryPerMonth) || 0,
          shiftHours: Number(shiftHours) || 8,
          weekOffPerMonth: Number(weekOffsPerMonth) || 0,
        });

        setSuccessMessage("Employee updated successfully!");
      } else {
        // Add new employee
        await axios.post(`${API_BASE_URL}/employees/add-employee`, payload);
        
        if (showShiftDetails) {
          await assignShiftToEmployee(employeeId, `${firstName} ${lastName}`, shiftType, shiftStartTime, shiftEndTime);
        }

        // Set salary
        await axios.post(`${API_BASE_URL}/salary/set-salary`, {
          employeeId,
          name: `${firstName} ${lastName}`,
          salaryPerMonth: Number(salaryPerMonth),
          shiftHours: Number(shiftHours),
          weekOffPerMonth: Number(weekOffsPerMonth),
        });

        setSuccessMessage("Employee added successfully!");
      }

      setTimeout(() => navigate("/employeelist"), 1000);
    } catch (err) {
      console.error("Submit error:", err);
      setErrorMessage(err.response?.data?.message || err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // Handle phone input change
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
    
    // If phone is cleared, reset searched phone
    if (value.length < 10) {
      setSearchedPhone("");
      setEmployeeFound(false);
    }
  };

  // ✅ CREATE CUSTOM SHIFT FUNCTION
  const handleCreateCustomShift = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (!createShiftForm.shiftType || !createShiftForm.shiftName || !createShiftForm.timeRange || !createShiftForm.description) {
        setErrorMessage('Please fill all required fields');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/shifts/create`, {
        shiftType: createShiftForm.shiftType.toUpperCase(),
        shiftName: createShiftForm.shiftName,
        timeSlots: [{
          timeRange: createShiftForm.timeRange,
          description: createShiftForm.description
        }]
      });
      
      if (response.data.success) {
        setSuccessMessage(`Shift ${createShiftForm.shiftType.toUpperCase()} created successfully!`);
        await fetchAllShifts();
        setShiftType(createShiftForm.shiftType.toUpperCase());
        setShowShiftModal(false);
        setCreateShiftForm({
          shiftType: '',
          shiftName: '',
          timeRange: '',
          description: ''
        });
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      console.error('Create custom error:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to create custom shift');
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (!deptForm.name.trim()) {
        setErrorMessage('Please enter department name');
        return;
      }
      const response = await axios.post(`${API_BASE_URL}/department/create`, {
        name: deptForm.name,
        description: deptForm.description
      });
      if (response.data.success) {
        setSuccessMessage(`Department "${deptForm.name}" created successfully!`);
        await fetchDepartments();
        setDepartment(deptForm.name);
        setShowDeptModal(false);
        setDeptForm({ name: '', description: '' });
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      console.error('Create department error:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to create department');
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (!roleForm.name.trim()) {
        setErrorMessage('Please enter role name');
        return;
      }
      const response = await axios.post(`${API_BASE_URL}/roles/create`, {
        name: roleForm.name,
        description: roleForm.description
      });
      if (response.data.success) {
        setSuccessMessage(`Role "${roleForm.name}" created successfully!`);
        await fetchRoles();
        setRole(roleForm.name);
        setShowRoleModal(false);
        setRoleForm({ name: '', description: '' });
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      console.error('Create role error:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to create role');
    }
  };

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by your browser.");
      return;
    }

    setErrorMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationForm(prev => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6)
        }));

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          if (data.display_name) {
            setLocationForm(prev => ({
              ...prev,
              fullAddress: data.display_name
            }));
          } else {
            setErrorMessage("Could not fetch full address.");
          }
        } catch {
          setErrorMessage("Failed to fetch address from coordinates.");
        }
      },
      (err) => {
        setErrorMessage("Location access denied. Please enter manually.");
      }
    );
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (!locationForm.name.trim() || !locationForm.latitude || !locationForm.longitude) {
        setErrorMessage('Please fill all required fields');
        return;
      }
      const response = await axios.post(`${API_BASE_URL}/location/add-location`, {
        name: locationForm.name,
        latitude: locationForm.latitude,
        longitude: locationForm.longitude,
        fullAddress: locationForm.fullAddress
      });
      if (response.data.success || response.data.location) {
        setSuccessMessage(`Location "${locationForm.name}" added successfully!`);
        await fetchLocations();
        const newLocation = response.data.location || response.data.data;
        if (newLocation && newLocation._id) {
          setLocationId(newLocation._id);
        }
        setShowLocationModal(false);
        setLocationForm({ name: '', latitude: '', longitude: '', fullAddress: '' });
      } else {
        setErrorMessage(response.data.message || 'Failed to add location');
      }
    } catch (error) {
      console.error('Create location error:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to add location');
    }
  };

  return (
    <div className="max-w-6xl p-4 mx-auto">
      <div className="p-6 bg-white shadow-lg rounded-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingEmployee ? "Edit Employee" : "Add New Employee"}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {editingEmployee 
              ? "Update employee details" 
              : "Search existing employee by phone number or add new"}
          </p>
        </div>

        {/* Single Message Display */}
        {successMessage && (
          <div className="p-3 mb-4 text-sm text-green-700 border border-green-200 rounded-lg bg-green-50">
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="p-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* ROW 1: Phone Search - Compact Layout */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaPhone className="inline mr-1 text-blue-500" /> Phone Number *
              </label>
              <div className="relative">
                <input 
                  value={phone} 
                  onChange={handlePhoneChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="10-digit phone"
                  required 
                />
                {searching && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <FaSpinner className="text-blue-500 animate-spin" />
                  </div>
                )}
                {employeeFound && !searching && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <FaCheck className="text-green-500" />
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {employeeFound 
                  ? "Employee found - data loaded" 
                  : "Enter 10 digits to search"}
              </p>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Alternate Number
              </label>
              <input 
                value={alternateNumber} 
                onChange={(e) => setAlternateNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Alternate phone"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Parents Name
              </label>
              <input 
                value={parentsName} 
                onChange={(e) => setParentsName(e.target.value)} 
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Parents' full name"
              />
            </div>
          </div>

          {/* ROW 2: Email & Password */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaEnvelope className="inline mr-1 text-blue-500" /> Email *
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="john@example.com"
                required 
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaLock className="inline mr-1 text-blue-500" /> Password {!editingEmployee && !employeeFound && "*"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder={editingEmployee || employeeFound ? "Keep blank for no change" : "Enter password"}
                  required={!editingEmployee && !employeeFound}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaCalendar className="inline mr-1 text-blue-500" /> Date of Birth
              </label>
              <input 
                type="date" 
                value={dob} 
                onChange={(e) => setDob(e.target.value)} 
                max={getCurrentDate()}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {dob && <p className="mt-1 text-xs text-gray-500">DD/MM/YYYY</p>}
            </div>
          </div>

          {/* ROW 3: First Name, Last Name, Employee ID */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaUser className="inline mr-1 text-blue-500" /> First Name *
              </label>
              <input 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="John"
                required 
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaUser className="inline mr-1 text-blue-500" /> Last Name
              </label>
              <input 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Doe"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaBriefcase className="inline mr-1 text-blue-500" /> Employee ID *
              </label>
              <input
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className={`w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                  editingEmployee || employeeFound ? 'bg-gray-50' : ''
                }`}
                placeholder="EMP001"
                required
                readOnly={!!editingEmployee || employeeFound}
              />
            </div>
          </div>

          {/* ROW 4: Join Date, Location, Department */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaCalendar className="inline mr-1 text-blue-500" /> Join Date *
              </label>
              <input 
                type="date" 
                value={joinDate} 
                onChange={(e) => setJoinDate(e.target.value)} 
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required 
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaMapMarkerAlt className="inline mr-1 text-blue-500" /> Location *
              </label>
              <select
                value={locationId}
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  if (selectedValue === "ADD_NEW_LOCATION") {
                    setShowLocationModal(true);
                    return;
                  }
                  setLocationId(selectedValue);
                }}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              >
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc._id} value={loc._id}>{loc.name}</option>
                ))}
                <option value="ADD_NEW_LOCATION" className="font-medium text-blue-600">+ Add New</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaBuilding className="inline mr-1 text-blue-500" /> Department *
              </label>
              <select
                value={department}
                onChange={(e) => {
                  if (e.target.value === "ADD_NEW_DEPT") {
                    setShowDeptModal(true);
                  } else {
                    setDepartment(e.target.value);
                  }
                }}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.name} value={dept.name}>
                    {dept.name} {dept.employeeCount > 0 ? `(${dept.employeeCount})` : ''}
                  </option>
                ))}
                <option value="ADD_NEW_DEPT" className="font-medium text-blue-600">+ Add New</option>
              </select>
            </div>
          </div>

          {/* ROW 5: Role & Week Offs */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaUserTie className="inline mr-1 text-blue-500" /> Role *
              </label>
              <select
                value={role}
                onChange={(e) => {
                  if (e.target.value === "ADD_NEW_ROLE") {
                    setShowRoleModal(true);
                  } else {
                    setRole(e.target.value);
                  }
                }}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              >
                <option value="">Select Role</option>
                {roles.map((roleItem) => (
                  <option key={roleItem.name} value={roleItem.name}>
                    {roleItem.name} {roleItem.employeeCount > 0 ? `(${roleItem.employeeCount})` : ''}
                  </option>
                ))}
                <option value="ADD_NEW_ROLE" className="font-medium text-blue-600">+ Add New</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaCalendar className="inline mr-1 text-blue-500" /> Week Offs per Month *
              </label>
              <input
                type="number"
                value={weekOffsPerMonth}
                onChange={(e) => setWeekOffsPerMonth(e.target.value)}
                min="0"
                max="30"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Enter number of week offs"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Total number of week offs per month</p>
            </div>
          </div>

          {/* ADDRESS SECTION */}
          <div className="pt-6 border-t">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              <FaMapMarkerAlt className="inline mr-2 text-blue-500" /> Address Details
            </h3>
            
            <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Address Line 1 *
                </label>
                <input 
                  value={addressLine1} 
                  onChange={(e) => setAddressLine1(e.target.value)} 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="House no, Street, Area"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Address Line 2
                </label>
                <input 
                  value={addressLine2} 
                  onChange={(e) => setAddressLine2(e.target.value)} 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Landmark, Building name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  <FaMapPin className="inline mr-1 text-gray-400" /> Pin Code *
                </label>
                <input 
                  type="text" 
                  value={pinCode} 
                  onChange={handlePinCodeChange}
                  maxLength="6"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="110001"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  <FaCity className="inline mr-1 text-gray-400" /> City *
                </label>
                <input 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="City"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  <FaGlobeAsia className="inline mr-1 text-gray-400" /> State *
                </label>
                <input 
                  value={state} 
                  onChange={(e) => setState(e.target.value)} 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="State"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  <FaGlobeAsia className="inline mr-1 text-gray-400" /> Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* SHIFT SECTION */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaClock className="inline mr-1 text-blue-500" /> Shift Type *
              </label>
              <select
                value={shiftType}
                onChange={(e) => handleShiftChange(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              >
                <option value="">Select Shift</option>
                {shiftList && shiftList.length > 0 ? (
                  shiftList.map((shift) => (
                    <option key={shift.type} value={shift.type}>
                      Shift {shift.type}: {shift.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Loading shifts...</option>
                )}
                <option value="ADD_NEW" className="font-medium text-blue-600">+ Add New</option>
              </select>
            </div>

            {showShiftDetails && (
              <>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={shiftStartTime}
                    onChange={(e) => setShiftStartTime(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50"
                    required
                    readOnly
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={shiftEndTime}
                    onChange={(e) => setShiftEndTime(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50"
                    required
                    readOnly
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Shift Hours/Day *
                  </label>
                  <input 
                    type="number" 
                    value={shiftHours} 
                    onChange={(e) => setShiftHours(e.target.value)} 
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    min="1"
                    max="24"
                    required 
                  />
                </div>
              </>
            )}
          </div>

          {/* SALARY SECTION */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaDollarSign className="inline mr-1 text-blue-500" /> Salary/Month *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-sm text-gray-500">₹</span>
                </div>
                <input 
                  type="number" 
                  value={salaryPerMonth} 
                  onChange={(e) => setSalaryPerMonth(e.target.value)} 
                  className="pl-8 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="0.00"
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Week Offs/Month *
              </label>
              <input 
                type="number" 
                value={weekOffsPerMonth} 
                readOnly
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50"
                placeholder="0"
                required 
              />
              <p className="mt-1 text-xs text-gray-500">From week off selection</p>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full md:w-auto px-8 py-3 rounded-lg font-medium transition duration-200 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : editingEmployee || employeeFound ? (
                "Update Employee"
              ) : (
                "Add New Employee"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* CREATE SHIFT MODAL */}
      {showShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Create New Shift</h3>
              <button onClick={() => setShowShiftModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateCustomShift} className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Shift Type (Letter A-Z) *
                    </label>
                    <input
                      type="text"
                      maxLength="1"
                      value={createShiftForm.shiftType}
                      onChange={(e) => setCreateShiftForm(prev => ({ 
                        ...prev, 
                        shiftType: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')
                      }))}
                      className="w-full px-4 py-2 text-sm uppercase border border-gray-300 rounded-lg"
                      placeholder="E"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Enter a single letter (A-Z)</p>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Shift Name *
                    </label>
                    <input
                      type="text"
                      value={createShiftForm.shiftName}
                      onChange={(e) => setCreateShiftForm(prev => ({ ...prev, shiftName: e.target.value }))}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
                      placeholder="e.g., Extended Shift E"
                      required
                    />
                  </div>
                </div>

                {/* Single Time Slot Configuration */}
                <div>
                  <label className="block mb-3 text-sm font-medium text-gray-700">
                    Time Slot Configuration *
                  </label>
                  
                  <div className="p-3 space-y-3 border rounded-lg bg-gray-50">
                    <div>
                      <label className="block mb-1 text-xs text-gray-600">Time Range *</label>
                      <input
                        type="text"
                        value={createShiftForm.timeRange}
                        onChange={(e) => setCreateShiftForm(prev => ({ ...prev, timeRange: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                        placeholder="e.g., 10:00 - 19:00"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block mb-1 text-xs text-gray-600">Description *</label>
                      <input
                        type="text"
                        value={createShiftForm.description}
                        onChange={(e) => setCreateShiftForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                        placeholder="e.g., Morning 10 to 7"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                {createShiftForm.shiftType && createShiftForm.timeRange && (
                  <div className="p-3 border border-blue-200 rounded bg-blue-50">
                    <h4 className="mb-2 text-sm font-medium text-blue-800">Preview:</h4>
                    <p className="text-sm text-blue-700">
                      Shift {createShiftForm.shiftType}: {createShiftForm.shiftName}
                    </p>
                    <p className="mt-1 text-sm text-blue-600">
                      Time: {createShiftForm.timeRange}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowShiftModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                >
                  Create Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEPARTMENT MODAL */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Add New Department</h3>
              <button onClick={() => setShowDeptModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleCreateDepartment} className="p-6">
              <div className="space-y-4">
                <div><label className="block mb-2 text-sm font-medium text-gray-700">Department Name *</label><input type="text" value={deptForm.name} onChange={(e) => setDeptForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Sales, Development" required /></div>
                <div><label className="block mb-2 text-sm font-medium text-gray-700">Description</label><textarea value={deptForm.description} onChange={(e) => setDeptForm(prev => ({ ...prev, description: e.target.value }))} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Describe the department..." /></div>
              </div>
              <div className="flex justify-end pt-6 mt-6 space-x-3 border-t">
                <button type="button" onClick={() => setShowDeptModal(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">Add Department</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROLE MODAL */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Add New Role</h3>
              <button onClick={() => setShowRoleModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleCreateRole} className="p-6">
              <div className="space-y-4">
                <div><label className="block mb-2 text-sm font-medium text-gray-700">Role Name *</label><input type="text" value={roleForm.name} onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Manager, Developer" required /></div>
                <div><label className="block mb-2 text-sm font-medium text-gray-700">Description</label><textarea value={roleForm.description} onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Describe the role..." /></div>
              </div>
              <div className="flex justify-end pt-6 mt-6 space-x-3 border-t">
                <button type="button" onClick={() => setShowRoleModal(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700">Add Role</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOCATION MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Add New Location</h3>
              <button onClick={() => setShowLocationModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleCreateLocation} className="p-6">
              <div className="space-y-6">
                <div><label className="block mb-2 text-sm font-medium text-gray-700">Location Name *</label><input type="text" value={locationForm.name} onChange={(e) => setLocationForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Main Office, Branch Office" required /></div>
                <div className="flex items-center justify-between mb-3"><label className="block text-sm font-medium text-gray-700">Location Coordinates</label><button type="button" onClick={handleGetCurrentLocation} className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700">📍 Get Current Location</button></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block mb-2 text-sm font-medium text-gray-700">Latitude *</label><input type="text" value={locationForm.latitude} onChange={(e) => setLocationForm(prev => ({ ...prev, latitude: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g., 28.6139" required /></div>
                  <div><label className="block mb-2 text-sm font-medium text-gray-700">Longitude *</label><input type="text" value={locationForm.longitude} onChange={(e) => setLocationForm(prev => ({ ...prev, longitude: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g., 77.2090" required /></div>
                </div>
                <div><label className="block mb-2 text-sm font-medium text-gray-700">Full Address *</label><textarea value={locationForm.fullAddress} onChange={(e) => setLocationForm(prev => ({ ...prev, fullAddress: e.target.value }))} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Enter full address" required /></div>
              </div>
              <div className="flex justify-end pt-6 mt-6 space-x-3 border-t">
                <button type="button" onClick={() => setShowLocationModal(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700">Add Location</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEmployeePage;