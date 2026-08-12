import axios from "axios";
import { API_BASE_URL } from "../config";
import { isEmployeeHidden } from "./employeeStatus";
import { getAdminEmail } from "./adminSession";
import {
  computeLoginDelayMinutes,
  computeMissedLoginDelayMinutes,
  formatCheckInTimeDisplay,
  hasMissedLoginWindow,
  resolveShiftFromAssignment,
} from "./attendanceLoginAlert";

const isSameCalendarDay = (dateA, dateB) =>
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getDate() === dateB.getDate();

const getEmployeeId = (record) => {
  if (!record) return null;
  if (typeof record.employeeId === "object") {
    return record.employeeId?.employeeId || record.employeeId?._id || null;
  }
  return record.employeeId || record.empId || null;
};

const buildShiftMap = (assignments) => {
  const map = new Map();

  assignments.forEach((assignment) => {
    if (assignment.isActive === false) return;

    const empId = getEmployeeId(assignment.employeeAssignment) || getEmployeeId(assignment);
    if (!empId) return;

    const shift = resolveShiftFromAssignment(assignment);
    if (!shift) return;

    const employeeName =
      assignment.employeeAssignment?.employeeName ||
      assignment.employeeName ||
      "Employee";

    const entry = {
      employeeId: String(empId),
      employeeName,
      shiftStart: shift.display,
      shiftHours: shift.hours,
      shiftMinutes: shift.minutes,
      shiftType: assignment.shiftType || "—",
      timeRange:
        assignment.employeeAssignment?.selectedTimeRange ||
        assignment.timeSlots?.[0]?.timeRange ||
        shift.display,
    };

    const existing = map.get(entry.employeeId);
    if (!existing || entry.timeRange.includes("AM") || entry.timeRange.includes("PM")) {
      map.set(entry.employeeId, entry);
    }
  });

  return map;
};

const buildTodayCheckInMap = (attendanceRecords) => {
  const checkInMap = new Map();
  const today = new Date();

  attendanceRecords.forEach((record) => {
    const empId = getEmployeeId(record);
    if (!empId || !record.checkInTime) return;

    const checkInDate = new Date(record.checkInTime);
    if (!isSameCalendarDay(checkInDate, today)) return;

    const key = String(empId);
    const existing = checkInMap.get(key);
    if (!existing || new Date(record.checkInTime) < new Date(existing.checkInTime)) {
      checkInMap.set(key, record);
    }
  });

  return checkInMap;
};

export const fetchAttendanceAlerts = async () => {
  const now = new Date();

  const [employeesRes, shiftsRes, attendanceRes] = await Promise.all([
    axios.get(`${API_BASE_URL}/employees/get-employees`),
    axios.get(`${API_BASE_URL}/shifts/assignments`),
    axios.get(`${API_BASE_URL}/attendance/today`),
  ]);

  const employees = (employeesRes.data || []).filter((emp) => !isEmployeeHidden(emp));
  const employeeMap = new Map(
    employees.map((emp) => [String(emp.employeeId || emp._id), emp])
  );

  const assignments = shiftsRes.data?.data || shiftsRes.data || [];
  const shiftMap = buildShiftMap(Array.isArray(assignments) ? assignments : []);

  const attendancePayload = attendanceRes.data || {};
  const attendanceRecords =
    attendancePayload.records ||
    attendancePayload.allAttendance ||
    (Array.isArray(attendancePayload) ? attendancePayload : []);

  const todayCheckIns = buildTodayCheckInMap(attendanceRecords);
  const missedEmployees = [];
  const lateEmployees = [];
  const todayRecords = [];
  const processedIds = new Set();

  shiftMap.forEach((shiftInfo) => {
    const employee = employeeMap.get(shiftInfo.employeeId);
    const employeeName =
      employee?.name || employee?.fullName || shiftInfo.employeeName;
    const department = employee?.department || employee?.departmentName || "—";
    const designation = employee?.designation || employee?.role || "—";
    const baseDetails = {
      employeeId: shiftInfo.employeeId,
      employeeName,
      department,
      designation,
      shiftStart: shiftInfo.shiftStart,
      shiftType: shiftInfo.shiftType,
      timeRange: shiftInfo.timeRange,
    };

    processedIds.add(shiftInfo.employeeId);
    const checkInRecord = todayCheckIns.get(shiftInfo.employeeId);

    if (checkInRecord) {
      const delayMinutes = computeLoginDelayMinutes(
        shiftInfo.shiftHours,
        shiftInfo.shiftMinutes,
        checkInRecord.checkInTime
      );
      const checkInDisplay = formatCheckInTimeDisplay(checkInRecord.checkInTime);
      const attendanceStatus = checkInRecord.status || "checked-in";

      todayRecords.push({
        ...baseDetails,
        checkInTime: checkInRecord.checkInTime,
        checkInDisplay,
        checkOutTime: checkInRecord.checkOutTime || null,
        checkOutDisplay: checkInRecord.checkOutTime
          ? formatCheckInTimeDisplay(checkInRecord.checkOutTime)
          : "—",
        delayMinutes,
        recordStatus:
          delayMinutes > 0 ? "late" : attendanceStatus === "checked-out" ? "checked-out" : "on-time",
        officeName: checkInRecord.officeName || checkInRecord.reason || "—",
      });

      if (delayMinutes <= 0) return;

      lateEmployees.push({
        ...baseDetails,
        alertType: "late",
        checkInTime: checkInRecord.checkInTime,
        checkInDisplay,
        delayMinutes,
        message: `${employeeName} (${shiftInfo.employeeId}): assigned check-in time is ${shiftInfo.shiftStart}, checked in at ${checkInDisplay}. ${delayMinutes} min late.`,
      });
      return;
    }

    const isMissed = hasMissedLoginWindow(shiftInfo.shiftHours, shiftInfo.shiftMinutes, now);
    const delayMinutes = isMissed
      ? computeMissedLoginDelayMinutes(shiftInfo.shiftHours, shiftInfo.shiftMinutes, now)
      : 0;

    todayRecords.push({
      ...baseDetails,
      checkInTime: null,
      checkInDisplay: "—",
      checkOutTime: null,
      checkOutDisplay: "—",
      delayMinutes,
      recordStatus: isMissed ? "missed" : "pending",
      officeName: "—",
    });

    if (!isMissed) return;

    missedEmployees.push({
      ...baseDetails,
      alertType: "missed",
      delayMinutes,
      message: `${employeeName} (${shiftInfo.employeeId}): check-in time is ${shiftInfo.shiftStart} but not checked in yet. ${delayMinutes} min late.`,
    });
  });

  todayCheckIns.forEach((record, empId) => {
    if (processedIds.has(empId)) return;

    const employee = employeeMap.get(empId);
    todayRecords.push({
      employeeId: empId,
      employeeName: record.name || employee?.name || employee?.fullName || "Employee",
      department: employee?.department || employee?.departmentName || "—",
      designation: employee?.designation || employee?.role || "—",
      shiftStart: "—",
      shiftType: "—",
      timeRange: "—",
      checkInTime: record.checkInTime,
      checkInDisplay: formatCheckInTimeDisplay(record.checkInTime),
      checkOutTime: record.checkOutTime || null,
      checkOutDisplay: record.checkOutTime
        ? formatCheckInTimeDisplay(record.checkOutTime)
        : "—",
      delayMinutes: 0,
      recordStatus: record.status === "checked-out" ? "checked-out" : "on-time",
      officeName: record.officeName || record.reason || "—",
    });
  });

  const recordStatusOrder = { missed: 0, late: 1, pending: 2, "on-time": 3, "checked-out": 4 };
  todayRecords.sort((a, b) => {
    const statusDiff =
      (recordStatusOrder[a.recordStatus] ?? 99) - (recordStatusOrder[b.recordStatus] ?? 99);
    if (statusDiff !== 0) return statusDiff;
    return (b.delayMinutes || 0) - (a.delayMinutes || 0);
  });

  missedEmployees.sort((a, b) => b.delayMinutes - a.delayMinutes);
  lateEmployees.sort((a, b) => b.delayMinutes - a.delayMinutes);

  return {
    missedEmployees,
    lateEmployees,
    attendanceAlerts: [...missedEmployees, ...lateEmployees].sort(
      (a, b) => b.delayMinutes - a.delayMinutes
    ),
    todayRecords,
    checkedAt: now.toISOString(),
    totalAssigned: shiftMap.size,
    totalPresent: todayCheckIns.size,
  };
};

/** @deprecated Use fetchAttendanceAlerts */
export const fetchMissedLoginEmployees = async () => {
  const result = await fetchAttendanceAlerts();
  return {
    missedEmployees: result.attendanceAlerts,
    checkedAt: result.checkedAt,
    totalAssigned: result.totalAssigned,
    totalPresent: result.totalPresent,
  };
};

const getAdminMissedNotificationStorageKey = (adminEmail, employeeId) =>
  `admin_missed_login_${adminEmail}_${employeeId}`;

const getAdminLateNotificationStorageKey = (adminEmail, employeeId) =>
  `admin_late_login_${adminEmail}_${employeeId}`;

export const createAdminAttendanceNotifications = async (
  adminEmail,
  { missedEmployees = [], lateEmployees = [] }
) => {
  if (!adminEmail) return 0;

  const todayStr = new Date().toDateString();
  let createdCount = 0;

  for (const employee of missedEmployees) {
    const storageKey = getAdminMissedNotificationStorageKey(adminEmail, employee.employeeId);
    if (localStorage.getItem(storageKey) === todayStr) continue;

    localStorage.setItem(storageKey, todayStr);

    try {
      await axios.post(`${API_BASE_URL}/notifications/create`, {
        employeeId: adminEmail,
        type: "attendance",
        title: `Missed Login — ${employee.employeeName}`,
        message: employee.message,
        isRead: false,
        priority: "high",
        createdAt: new Date().toISOString(),
      });
      createdCount += 1;
    } catch (error) {
      localStorage.removeItem(storageKey);
      console.error("Failed to create admin missed login notification:", error);
    }
  }

  for (const employee of lateEmployees) {
    const storageKey = getAdminLateNotificationStorageKey(adminEmail, employee.employeeId);
    if (localStorage.getItem(storageKey) === todayStr) continue;

    localStorage.setItem(storageKey, todayStr);

    try {
      await axios.post(`${API_BASE_URL}/notifications/create`, {
        employeeId: adminEmail,
        type: "attendance",
        title: `Late Check-In — ${employee.employeeName}`,
        message: employee.message,
        isRead: false,
        priority: "high",
        createdAt: new Date().toISOString(),
      });
      createdCount += 1;
    } catch (error) {
      localStorage.removeItem(storageKey);
      console.error("Failed to create admin late login notification:", error);
    }
  }

  if (createdCount > 0) {
    window.dispatchEvent(new Event("notification-updated"));
  }

  return createdCount;
};

/** @deprecated Use createAdminAttendanceNotifications */
export const createAdminMissedLoginNotifications = async (adminEmail, missedEmployees) =>
  createAdminAttendanceNotifications(adminEmail, { missedEmployees, lateEmployees: [] });

export const runAdminMissedLoginCheck = async (createNotifications = false) => {
  const result = await fetchAttendanceAlerts();

  if (createNotifications) {
    const adminEmail = getAdminEmail();
    if (adminEmail) {
      await createAdminAttendanceNotifications(adminEmail, {
        missedEmployees: result.missedEmployees,
        lateEmployees: result.lateEmployees,
      });
    }
  }

  return result;
};