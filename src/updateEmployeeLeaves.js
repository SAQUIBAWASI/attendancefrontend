const fs = require('fs');

const p = 'c:/Users/DELL/Desktop/Saquiba/TM/attendancefrontend/attendancefrontend/src/pages/EmployeeLeaves.js';
let c = fs.readFileSync(p, 'utf8');

c = c.replace('<th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Status</th>',
'<th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Status</th>\n                      <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Approved By</th>');

c = c.replace(/<td className="px-2 py-1.5 text-center">\s*\{leave\.status === "approved" \? \(/,
`<td className="px-2 py-1.5 text-center">
                            {leave.approvedBy ? (
                              <div className="text-xs">
                                <span className="font-semibold">{leave.approvedBy}</span>
                                <span className="block text-gray-500 text-[10px]">({leave.approvedByRole || 'Admin'})</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            {leave.status === "approved" ? (`);

fs.writeFileSync(p, c);
console.log('Successfully updated EmployeeLeaves.js');
