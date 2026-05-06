const fs = require('fs');
const filePath = 'c:/Users/DELL/Desktop/Saquiba/TM/attendancefrontend/attendancefrontend/src/Pages/PayRoll.js';
let content = fs.readFileSync(filePath, 'utf8');

// The file might have been partially modified. Let's start fresh if possible or just use indexOf.
const oldDeductionsStart = `<tr style="background-color: #f0f0f0;">
                    <td class="label-col"><strong>Earnings</strong></td>
                    <td class="amount-col" style="text-align: center;"><strong>Actual Amt</strong></td>
                    <td class="label-col"><strong>Deductions & Recoveries</strong></td>`;
const oldDeductionsEnd = `<td><strong>Total Deductions</strong></td>`;

const startIdx = content.indexOf(oldDeductionsStart);
let endIdx = content.indexOf('</tr>', content.indexOf(oldDeductionsEnd));

if (startIdx !== -1 && endIdx !== -1) {
  const newDeductionsHTML = \`<tr style="background-color: #f0f0f0;">
                    <td class="label-col"><strong>Earnings</strong></td>
                    <td class="amount-col" style="text-align: center;"><strong>Actual Amt</strong></td>
                    <td class="label-col"><strong>Deductions & Recoveries</strong></td>
                    <td class="amount-col" style="text-align: center;"><strong>Actual Amt</strong></td>
                  </tr>
                  <tr>
                    <td>Basic Pay</td>
                    <td style="text-align: center;">\${(employee.basicPay > 0 ? employee.basicPay : actualEarnings).toFixed(2)}</td>
                    <td>LOP / Absent (\${lopDays} days)</td>
                    <td style="text-align: center;">₹\${lopAmount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>HRA</td>
                    <td style="text-align: center;">\${(employee.hra || 0).toFixed(2)}</td>
                    <td>Half Day Deductions (\${halfDays} HD)</td>
                    <td style="text-align: center;">₹\${halfDayDeductionAmount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Conveyance Allowance</td>
                    <td style="text-align: center;">\${(employee.conveyanceAllowance || 0).toFixed(2)}</td>
                    <td>Other Deductions</td>
                    <td style="text-align: center;">₹\${(otherDeductions + (employee.otherDeductions || 0)).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Medical Allowance</td>
                    <td style="text-align: center;">\${(employee.medicalAllowance || 0).toFixed(2)}</td>
                    <td></td>
                    <td style="text-align: center;"></td>
                  </tr>
                  <tr>
                    <td>Performance Allowance</td>
                    <td style="text-align: center;">\${(employee.performanceAllowance || 0).toFixed(2)}</td>
                    <td></td>
                    <td style="text-align: center;"></td>
                  </tr>
                  <tr>
                    <td>Special Allowance</td>
                    <td style="text-align: center;">\${(employee.specialAllowance || 0).toFixed(2)}</td>
                    <td></td>
                    <td style="text-align: center;"></td>
                  </tr>
                  <tr>
                    <td><strong>Total Earnings</strong></td>
                    <td style="text-align: center;"><strong>(₹) &nbsp;&nbsp;&nbsp; \${(employee.basicPay > 0 ? (employee.basicPay + (employee.hra || 0) + (employee.conveyanceAllowance || 0) + (employee.medicalAllowance || 0) + (employee.performanceAllowance || 0) + (employee.specialAllowance || 0)) : Math.round(actualEarnings)).toFixed(2)}</strong></td>
                    <td><strong>Total Deductions</strong></td>
                    <td style="text-align: center;"><strong>(₹) &nbsp;&nbsp;&nbsp; \${Math.round(lopAmount + halfDayDeductionAmount + otherDeductions + (employee.otherDeductions || 0)).toFixed(2)}</strong></td>
                  </tr>\`;
  content = content.substring(0, startIdx) + newDeductionsHTML + content.substring(endIdx + 5);
} else {
  console.log("Failed deductions HTML replacement");
}

const p2Start = `processedSalaries = activeEmployees.map(emp => {`;
const p2EndSnippet = `calculatedSalary = (totalPaidDays * dailyRate);
          }`;

const start2 = content.indexOf(p2Start);
let end2 = content.indexOf(p2EndSnippet, start2);

if (start2 !== -1 && end2 !== -1) {
  const newProcessed2 = \`processedSalaries = activeEmployees.map(emp => {
          const employeeData = employeesMap[emp.employeeId] || {};
          const actualWeekOffDays = emp.weekOffPerMonth || 0;
          const daysInMonthLocal = salaryData.monthDays || daysInMonth;
          const snapshotSalary = emp.salaryPerMonth || employeeData?.salaryPerMonth || 0;
          const dailyRateSnapshot = snapshotSalary / daysInMonthLocal || 0;

          let calculatedSalary = 0;
          if (snapshotSalary) {
            const present = emp.presentDays || 0;
            const half = emp.halfDayWorking || 0;
            const paidDays = present + (half * 0.5);
            const basePaidDays = paidDays + holidayCount;
            const totalPaidDays = includeWeekOffInSalary ? basePaidDays + actualWeekOffDays : basePaidDays;
            calculatedSalary = (totalPaidDays * dailyRateSnapshot);
          }\`;
  content = content.substring(0, start2) + newProcessed2 + content.substring(end2 + p2EndSnippet.length);
} else {
  console.log("Failed processed 2 replacement");
}

fs.writeFileSync(filePath, content);
console.log("Done 2");
