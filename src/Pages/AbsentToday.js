import axios from "axios";
import { useEffect, useState } from "react";

const AbsentToday = () => {
  const [records, setRecords] = useState([]);
  const today = new Date().toISOString().split("T")[0]; // e.g. "2025-10-14"

  useEffect(() => {
    fetchAbsent();
  }, []);

  const fetchAbsent = async () => {
    try {
      const resp = await axios.get("https://attendancebackend-5cgn.onrender.com/api/attendance/allattendance");
      if (resp.data && resp.data.success) {
        const filtered = resp.data.data.filter(
          (rec) => rec.status?.toLowerCase() === "absent" && rec.date === today
        );
        setRecords(filtered);
      } else {
        console.error("Unexpected API response:", resp.data);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="mb-4 text-xl font-semibold">Absent Today - {today}</h2>

      <table className="w-full text-sm border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Employee ID</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {records.length > 0 ? (
            records.map((rec) => (
              <tr key={rec._id} className="hover:bg-gray-100">
                <td className="p-2 border">{rec.employeeId}</td>
                <td className="p-2 border">{rec.employeeName}</td>
                <td className="p-2 border">{rec.date}</td>
                <td className="p-2 font-semibold text-red-600 border">Absent</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="p-4 text-center text-gray-500">
                No absent records for today.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AbsentToday;
