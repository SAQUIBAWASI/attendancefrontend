const fs = require('fs');
const filePath = 'c:/Users/DELL/Desktop/Saquiba/TM/attendancefrontend/attendancefrontend/src/Pages/PayRoll.js';
let content = fs.readFileSync(filePath, 'utf8');

// Find the first 'export default PayRoll;' and cut there
const endIndex = content.indexOf('export default PayRoll;');
if (endIndex !== -1) {
  content = content.substring(0, endIndex + 'export default PayRoll;'.length);
}

// Uncomment
content = content.replace(/^\/\/\s?/gm, '');

// Fix generateInvoiceHTML
const oldDeductionsHTML = /<tr style=\"background-color: #f0f0f0;\">\s*<td class=\"label-col\"><strong>Earnings<\/strong><\/td>[\s\S]*?<td><strong>Total Deductions<\/strong><\/td>\s*<td style=\"text-align: center;\"><strong>\(₹\) &nbsp;&nbsp;&nbsp; \$\{[^}]+\}<\/strong><\/td>\s*<\/tr>/;

const newDeductionsHTML = `<tr style="background-color: #f0f0f0;">
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
                  </tr>`;

if (!oldDeductionsHTML.test(content)) {
  console.log('Failed to match deductions HTML!');
} else {
  content = content.replace(oldDeductionsHTML, newDeductionsHTML);
}

// Fix processedSalaries if 1
const oldProcessed1 = /if \(salaryData\.success && salaryData\.salaries\.length > 0\) \{[\s\S]*?let calculatedSalary = emp\.calculatedSalary \|\| 0;[\s\S]*?if \(!includeWeekOffInSalary && calculatedSalary > 0\) \{[\s\S]*?calculatedSalary = Math\.max\(0, calculatedSalary - weekOffAmount\);\s*\}/;

const newProcessed1 = `if (salaryData.success && salaryData.salaries.length > 0) {
        processedSalaries = salaryData.salaries.map(emp => {
          const summary = summaryData.find(x => x.employeeId === emp.employeeId) || {};
          const actualWeekOffDays = summary.weekOffPerMonth ?? emp.weekOffs ?? 0;
          
          const employeeData = employeesMap[emp.employeeId] || {};
          const daysInMonthLocal = salaryData.monthDays || daysInMonth;
          const snapshotSalary = summary.salaryPerMonthSnapshot || emp.salaryPerMonth || employeeData?.salaryPerMonth || 0;
          const dailyRateSnapshot = snapshotSalary / daysInMonthLocal || 0;
          
          const present = summary.presentDays ?? emp.presentDays ?? 0;
          const half = summary.halfDayWorking ?? emp.halfDayWorking ?? 0;
          const paidDays = present + (half * 0.5);
          
          const basePaidDays = paidDays + holidayCount;
          const totalPaidDays = includeWeekOffInSalary ? basePaidDays + actualWeekOffDays : basePaidDays;
          
          let calculatedSalary = totalPaidDays * dailyRateSnapshot;`;

if (!oldProcessed1.test(content)) {
  console.log('Failed to match processedSalaries 1!');
} else {
  content = content.replace(oldProcessed1, newProcessed1);
}

// Fix processedSalaries else 2
const oldProcessed2 = /processedSalaries = activeEmployees\.map\(emp => \{[\s\S]*?let calculatedSalary = 0;\s*if \(employeeData\?\.salaryPerMonth\) \{\s*const paidDays = \(emp\.totalWorkingDays \|\| 0\) \+ \(emp\.halfDayWorking \|\| 0\) \* 0\.5;\s*const totalPaidDays = includeWeekOffInSalary \? paidDays \+ actualWeekOffDays : paidDays;\s*calculatedSalary = \(totalPaidDays \* dailyRate\);\s*\}/;

const newProcessed2 = `processedSalaries = activeEmployees.map(emp => {
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
          }`;

if (!oldProcessed2.test(content)) {
  console.log('Failed to match processedSalaries 2!');
} else {
  content = content.replace(oldProcessed2, newProcessed2);
}

fs.writeFileSync(filePath, content);
console.log('Done!');
