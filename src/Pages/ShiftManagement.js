// import axios from "axios";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function ShiftAssignment() {
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     employeeId: "",
//     employeeName: "",
//     shiftType: "",
//     startTime: "",
//     endTime: "",
//   });

//   const shifts = {
//     A: { startTime: "06:00", endTime: "14:00" },
//     B: { startTime: "14:00", endTime: "22:00" },
//     C: { startTime: "22:00", endTime: "06:00" },
//   };

//   const handleShiftChange = (shift) => {
//     setFormData({
//       ...formData,
//       shiftType: shift,
//       startTime: shifts[shift].startTime,
//       endTime: shifts[shift].endTime,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.employeeId || !formData.employeeName || !formData.shiftType) {
//       alert("Please fill all fields");
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await axios.post(
//         "https://api.timelyhealth.in//api/shifts/assign",
//         formData
//       );

//       if (res.status === 200 || res.status === 201) {
//         alert("✅ Shift assigned successfully!");

//         // ✅ Store assigned shift in localStorage
//         localStorage.setItem("employeeShift", JSON.stringify({
//           employeeId: formData.employeeId,
//           employeeName: formData.employeeName,
//           shiftType: formData.shiftType,
//           startTime: formData.startTime,
//           endTime: formData.endTime,
//         }));

//         setFormData({
//           employeeId: "",
//           employeeName: "",
//           shiftType: "",
//           startTime: "",
//           endTime: "",
//         });

//         navigate("/shifts");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("❌ Failed to assign shift. Check your server connection.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
//       <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-2xl">
//         <h1 className="mb-4 text-xl font-bold text-center text-gray-800">
//           Assign Shift to Employee
//         </h1>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Employee ID */}
//           <div>
//             <label className="block mb-1 text-sm font-medium text-gray-700">
//               Employee ID *
//             </label>
//             <input
//               type="text"
//               value={formData.employeeId}
//               onChange={(e) =>
//                 setFormData({ ...formData, employeeId: e.target.value })
//               }
//               placeholder="Enter employee ID"
//               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>

//           {/* Employee Name */}
//           <div>
//             <label className="block mb-1 text-sm font-medium text-gray-700">
//               Employee Name *
//             </label>
//             <input
//               type="text"
//               value={formData.employeeName}
//               onChange={(e) =>
//                 setFormData({ ...formData, employeeName: e.target.value })
//               }
//               placeholder="Enter employee name"
//               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>

//           {/* Shift Type */}
//           <div>
//             <label className="block mb-2 text-sm font-medium text-gray-700">
//               Select Shift *
//             </label>
//             <div className="flex gap-3">
//               {["A", "B", "C"].map((shift) => (
//                 <button
//                   key={shift}
//                   type="button"
//                   onClick={() => handleShiftChange(shift)}
//                   className={`flex-1 py-2 rounded-lg border text-center font-semibold ${
//                     formData.shiftType === shift
//                       ? "bg-blue-600 text-white"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   }`}
//                 >
//                   Shift {shift}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Start & End Time */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 Start Time
//               </label>
//               <input
//                 type="time"
//                 value={formData.startTime}
//                 onChange={(e) =>
//                   setFormData({ ...formData, startTime: e.target.value })
//                 }
//                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block mb-1 text-sm font-medium text-gray-700">
//                 End Time
//               </label>
//               <input
//                 type="time"
//                 value={formData.endTime}
//                 onChange={(e) =>
//                   setFormData({ ...formData, endTime: e.target.value })
//                 }
//                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//           </div>

//           {/* Submit */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//           >
//             {loading ? "Assigning..." : "Assign Shift"}
//           </button>

//           {/* Cancel */}
//           <button
//             type="button"
//             onClick={() => navigate("/shifts")}
//             className="w-full py-2 mt-2 border rounded-lg hover:bg-gray-100"
//           >
//             Cancel
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateShift() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    employeeName: "",
    shiftType: "",
    startTime: "",
    endTime: "",
  });

  // ✅ Updated Shifts with New Timings
  const shifts = {
    A: { startTime: "10:00", endTime: "19:00" },
    B: { startTime: "09:00", endTime: "19:00" },
    C: { startTime: "07:00", endTime: "17:00" },
    D: { startTime: "06:30", endTime: "16:00" },
    E: { startTime: "14:00", endTime: "23:00" },
    F: { startTime: "08:00", endTime: "18:00" },
    G: { startTime: "10:30", endTime: "21:00" },
    H: { startTime: "07:00", endTime: "13:00" },
    I: { startTime: "11:00", endTime: "20:00" },
  };

  const handleShiftChange = (shift) => {
    if (shift === "H") {
      setFormData({
        ...formData,
        shiftType: shift,
        startTime: "07:00 - 13:00",
        endTime: "17:00 - 21:30",
      });
    } else {
      setFormData({
        ...formData,
        shiftType: shift,
        startTime: shifts[shift].startTime,
        endTime: shifts[shift].endTime,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employeeId || !formData.employeeName || !formData.shiftType) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "https://api.timelyhealth.in//api/shifts/assign",
        formData
      );

      if (res.status === 200 || res.status === 201) {
        alert("✅ Shift created successfully!");

        // ✅ Save shift locally
        localStorage.setItem(
          "employeeShift",
          JSON.stringify({
            employeeId: formData.employeeId,
            employeeName: formData.employeeName,
            shiftType: formData.shiftType,
            startTime: formData.startTime,
            endTime: formData.endTime,
          })
        );

        // ✅ Clear form
        setFormData({
          employeeId: "",
          employeeName: "",
          shiftType: "",
          startTime: "",
          endTime: "",
        });

        // ✅ Navigate to shift list page
        navigate("/shiftlist");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Failed to create shift. Check your server connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-2xl">
        <h1 className="mb-4 text-xl font-bold text-center text-gray-800">
          Create Shift for Employee
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee ID */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Employee ID *
            </label>
            <input
              type="text"
              value={formData.employeeId}
              onChange={(e) =>
                setFormData({ ...formData, employeeId: e.target.value })
              }
              placeholder="Enter employee ID"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Employee Name */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Employee Name *
            </label>
            <input
              type="text"
              value={formData.employeeName}
              onChange={(e) =>
                setFormData({ ...formData, employeeName: e.target.value })
              }
              placeholder="Enter employee name"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Shift Type */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Select Shift *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Object.keys(shifts).map((shift) => (
                <button
                  key={shift}
                  type="button"
                  onClick={() => handleShiftChange(shift)}
                  className={`py-2 rounded-lg border text-center font-semibold ${
                    formData.shiftType === shift
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Shift {shift}
                </button>
              ))}
            </div>
          </div>

          {/* Start & End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="text"
                value={formData.startTime}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                End Time
              </label>
              <input
                type="text"
                value={formData.endTime}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Creating..." : "Create Shift"}
          </button>

          {/* Cancel */}
          <button
            type="button"
            onClick={() => navigate("/shiftlist")}
            className="w-full py-2 mt-2 border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

