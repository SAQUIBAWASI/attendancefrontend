import React, { useEffect, useState } from "react";

const PayRoll = () => {
  const [records, setRecords] = useState([]);

  const API_URL = "http://localhost:5000/api/attendancesummary/get";

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setRecords(data.summary || []);
      })
      .catch((err) => console.log("Error:", err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payroll Summary</h1>

      <table className="w-full border text-center">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Employee ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Present Days</th>
            <th className="border p-2">Late Days</th>
            <th className="border p-2">Onsite Days</th>
            <th className="border p-2">Half Day Leaves</th>
            <th className="border p-2">Full Day Leaves</th>
            <th className="border p-2">Total Working Days</th>
            <th className="border p-2">From Date</th>
            <th className="border p-2">To Date</th>
            <th className="border p-2">Month</th>
          
          </tr>
        </thead>

        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan="12" className="p-4 text-gray-500">
                No Records Found
              </td>
            </tr>
          ) : (
            records.map((item) => (
              <tr key={item._id}>
                <td className="border p-2">{item.employeeId}</td>
                <td className="border p-2">{item.name}</td>
                <td className="border p-2">{item.presentDays}</td>
                <td className="border p-2">{item.lateDays}</td>
                <td className="border p-2">{item.onsiteDays}</td>
                <td className="border p-2">{item.halfDayLeaves}</td>
                <td className="border p-2">{item.fullDayLeaves}</td>
                <td className="border p-2">{item.totalWorkingDays}</td>
                <td className="border p-2">
                  {item.fromDate ? item.fromDate.slice(0, 10) : "-"}
                </td>
                <td className="border p-2">
                  {item.toDate ? item.toDate.slice(0, 10) : "-"}
                </td>
                <td className="border p-2">{item.month || "-"}</td>
              
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PayRoll;





