const fs = require('fs');

const p = 'c:/Users/DELL/Desktop/Saquiba/TM/attendancefrontend/attendancefrontend/src/pages/LeavesList.js';
let c = fs.readFileSync(p, 'utf8');

// Replace updateLeaveStatus logic
c = c.replace(/const adminName = localStorage\.getItem\("adminName"\) \|\| "Admin";\s*const adminEmail = localStorage\.getItem\("adminEmail"\) \|\| "";\s*const res = await axios\.put\(`\$\{API_BASE_URL\}\/leaves\/updateleaves\/\$\{id\}`,\s*\{\s*status,\s*adminName,\s*adminEmail\s*\}\);/,
`      const userRoleStr = localStorage.getItem("userRole");
      let approverName = "Admin";
      let approverRole = "Admin";
      let approverEmail = "";

      if (userRoleStr === "employee") {
        const empData = JSON.parse(localStorage.getItem("employeeData") || "{}");
        approverName = localStorage.getItem("employeeName") || empData.name;
        approverRole = empData.designation || empData.role || "Manager";
        approverEmail = localStorage.getItem("employeeEmail") || empData.email || "";
      } else {
        approverName = localStorage.getItem("adminName") || "Admin";
        approverRole = "Admin";
        approverEmail = localStorage.getItem("adminEmail") || "";
      }

      const res = await axios.put(\`\${API_BASE_URL}/leaves/updateleaves/\${id}\`, { 
        status, 
        adminName: approverName, 
        adminEmail: approverEmail, 
        adminRole: approverRole 
      });`);

// Add filtering logic
c = c.replace('if (searchTerm) filtered = filtered.filter(l => l.employeeName?.toLowerCase().includes',
`    const userRoleStr = localStorage.getItem("userRole");
    if (userRoleStr === "employee") {
      const empData = JSON.parse(localStorage.getItem("employeeData") || "{}");
      const empRole = (empData.role || empData.designation || "").toLowerCase();
      
      const isHR = empRole.includes("hr");
      const isDepartmentHead = (!isHR) && (empRole.includes("manager") || empRole.includes("lead") || empRole.includes("head"));

      if (!isHR) {
        if (isDepartmentHead) {
          filtered = filtered.filter(l => getEmployeeDetails(l.employeeId).department === (empData.department || empData.departmentName));
        } else {
          filtered = filtered.filter(l => l.employeeId === (empData.employeeId || empData._id));
        }
      }
    }

    if (searchTerm) filtered = filtered.filter(l => l.employeeName?.toLowerCase().includes`);

// Update table header
c = c.replace('<th className="py-2 text-center">Status</th><th className="py-2 text-center">Actions</th>',
'<th className="py-2 text-center">Status</th><th className="py-2 text-center">Approved By</th><th className="py-2 text-center">Actions</th>');

// Update table cell
c = c.replace(/<td className="px-2 py-2 text-center">\{l\.status === "pending" \? \/\*\s*(<div className="flex justify-center gap-2">)/,
`<td className="px-2 py-2 text-center">{l.approvedBy ? (<div className="text-xs"><span className="font-semibold">{l.approvedBy}</span><span className="block text-gray-500 text-[10px]">({l.approvedByRole || 'Admin'})</span></div>) : (<span className="text-gray-400">-</span>)}</td><td className="px-2 py-2 text-center">{l.status === "pending" ? $1`);

// There's a problem, regex might not match if formatted in one line. Let's just do text replace using substring matching on exact content:
c = c.replace('<td className="px-2 py-2 text-center">{l.status === "pending" ? (<div className="flex justify-center gap-2">',
'<td className="px-2 py-2 text-center">{l.approvedBy ? (<div className="text-xs"><span className="font-semibold">{l.approvedBy}</span><span className="block text-gray-500 text-[10px]">({l.approvedByRole || \\\'Admin\\\'})</span></div>) : (<span className="text-gray-400">-</span>)}</td><td className="px-2 py-2 text-center">{l.status === "pending" ? (<div className="flex justify-center gap-2">');

fs.writeFileSync(p, c);
console.log('Successfully updated LeavesList.js');
