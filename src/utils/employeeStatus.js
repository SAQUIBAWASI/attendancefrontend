
/**
 * Centralized list of inactive employee IDs for backward compatibility.
 */
export const HARDCODED_INACTIVE_IDS = ['EMP002', 'EMP003', 'EMP004', 'EMP008', 'EMP010', 'EMP018', 'EMP019'];

/**
 * Utility function to determine if an employee should be hidden from reports/lists.
 * @param {Object} employee - The employee object from API.
 * @returns {Boolean} - True if the employee should be hidden.
 */
export const isEmployeeHidden = (employee) => {
    if (!employee) return false;

    // Database status preference
    if (employee.status === 'inactive') return true;
    if (employee.status === 'active') return false;

    // Fallback to hardcoded list (for old records with no status set)
    const idValue = employee.employeeId || employee._id;
    return HARDCODED_INACTIVE_IDS.includes(idValue);
};

/**
 * Filter a list of records based on employee status.
 * @param {Array} records - List of records containing employee info.
 * @param {Array} employees - Master list of employees (optional).
 * @returns {Array} - Filtered records.
 */
export const filterActiveRecords = (records, employees = []) => {
    if (!Array.isArray(records)) return [];

    return records.filter(rec => {
        // If we have a master employee list, check there first
        if (employees.length > 0) {
            const empId = rec.employeeId || rec._id;
            const employee = employees.find(e => e.employeeId === empId || e._id === empId);
            if (employee) return !isEmployeeHidden(employee);
        }

        // Direct check if record itself has employee status info
        return !isEmployeeHidden(rec);
    });
};
