export const HARDCODED_INACTIVE_IDS = ['EMP002', 'EMP003', 'EMP004', 'EMP008', 'EMP010', 'EMP018', 'EMP019'];

export const isEmployeeInactive = (emp, empId) => {
    if (!emp && !empId) return false;

    const idToCheck = empId || emp?.employeeId || emp?.empId || emp?._id;
    const statusToCheck = emp?.status;

    return statusToCheck === 'inactive' || HARDCODED_INACTIVE_IDS.includes(idToCheck);
};
