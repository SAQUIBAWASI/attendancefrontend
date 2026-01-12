// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function ShiftList() {
//   const [shifts, setShifts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const fetchShifts = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get("https://api.timelyhealth.inapi/shifts/all");
//       setShifts(res.data);
//     } catch (err) {
//       alert("❌ Failed to load shifts");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchShifts();
//   }, []);

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this shift?")) return;

//     try {
//       await axios.delete(`https://api.timelyhealth.inapi/shifts/${id}`);
//       alert("✅ Shift deleted successfully");
//       fetchShifts();
//     } catch (err) {
//       alert("❌ Failed to delete shift");
//       console.error(err);
//     }
//   };

//   return (
//     <div className="min-h-screen p-6 bg-gray-50">
//       <div className="max-w-5xl p-6 mx-auto bg-white shadow-lg rounded-2xl">
//         <div className="flex items-center justify-between mb-6">
//           <h1 className="text-2xl font-bold text-gray-800">Assigned Shifts</h1>
//           <button
//             onClick={() => navigate("/shift")}
//             className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//           >
//             + Assign New Shift
//           </button>
//         </div>

//         {loading ? (
//           <div className="py-8 text-center text-gray-600">Loading shifts...</div>
//         ) : shifts.length === 0 ? (
//           <div className="py-10 text-center text-gray-500">
//             No shifts assigned yet.
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full border border-gray-200 rounded-lg">
//               <thead>
//                 <tr className="text-sm font-semibold text-left text-gray-700 bg-gray-100">
//                   <th className="px-4 py-3 border-b">Employee ID</th>
//                   <th className="px-4 py-3 border-b">Employee Name</th>
//                   <th className="px-4 py-3 border-b">Shift Type</th>
//                   <th className="px-4 py-3 border-b">Start Time</th>
//                   <th className="px-4 py-3 border-b">End Time</th>
//                   <th className="px-4 py-3 text-center border-b">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {shifts.map((shift) => (
//                   <tr
//                     key={shift._id}
//                     className="text-sm text-gray-800 border-b hover:bg-gray-50"
//                   >
//                     <td className="px-4 py-3">{shift.employeeId}</td>
//                     <td className="px-4 py-3">{shift.employeeName}</td>
//                     <td className="px-4 py-3 font-semibold text-blue-700">
//                       Shift {shift.shiftType}
//                     </td>
//                     <td className="px-4 py-3">{shift.startTime}</td>
//                     <td className="px-4 py-3">{shift.endTime}</td>
//                     <td className="flex justify-center gap-2 px-4 py-3 text-center">
//                       <button
//                         onClick={() => navigate(`/edit-shift/${shift._id}`)}
//                         className="px-3 py-1 text-white bg-yellow-400 rounded-lg hover:bg-yellow-500"
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDelete(shift._id)}
//                         className="px-3 py-1 text-white bg-red-600 rounded-lg hover:bg-red-700"
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ShiftList() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://api.timelyhealth.in/api/shifts/all");

      console.log("Shifts API Response:", res.data);

      // ✅ Safely extract array even if wrapped inside an object
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.data || res.data.shifts || [];

      setShifts(data);
    } catch (err) {
      alert("❌ Failed to load shifts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shift?")) return;

    try {
      await axios.delete(`https://api.timelyhealth.in/api/shifts/${id}`);
      alert("✅ Shift deleted successfully");
      fetchShifts(); // Refresh list after deletion
    } catch (err) {
      alert("❌ Failed to delete shift");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl p-6 mx-auto bg-white shadow-lg rounded-2xl">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Assigned Shifts</h1>
          <button
            onClick={() => navigate("/shift")}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            + Assign New Shift
          </button>
        </div>

        {/* Loading / Empty / Table */}
        {loading ? (
          <div className="py-8 text-center text-gray-600">Loading shifts...</div>
        ) : !Array.isArray(shifts) || shifts.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            No shifts assigned yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead>
                <tr className="text-sm font-semibold text-left text-gray-700 bg-gray-100">
                  <th className="px-4 py-3 border-b">Employee ID</th>
                  <th className="px-4 py-3 border-b">Employee Name</th>
                  <th className="px-4 py-3 border-b">Shift Type</th>
                  <th className="px-4 py-3 border-b">Start Time</th>
                  <th className="px-4 py-3 border-b">End Time</th>
                  <th className="px-4 py-3 text-center border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift) => (
                  <tr
                    key={shift._id}
                    className="text-sm text-gray-800 border-b hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{shift.employeeId}</td>
                    <td className="px-4 py-3">{shift.employeeName}</td>
                    <td className="px-4 py-3 font-semibold text-blue-700">
                      Shift {shift.shiftType}
                    </td>
                    <td className="px-4 py-3">{shift.startTime}</td>
                    <td className="px-4 py-3">{shift.endTime}</td>
                    <td className="flex justify-center gap-2 px-4 py-3 text-center">
                      <button
                        onClick={() => navigate(`/edit-shift/${shift._id}`)}
                        className="px-3 py-1 text-white bg-yellow-400 rounded-lg hover:bg-yellow-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(shift._id)}
                        className="px-3 py-1 text-white bg-red-600 rounded-lg hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
