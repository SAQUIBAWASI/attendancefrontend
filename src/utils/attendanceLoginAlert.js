import axios from "axios";
import { API_BASE_URL } from "../config";

/** Alert if employee has not logged in this many minutes after shift start (e.g. 10:00 → alert at 10:01). */
export const LOGIN_ALERT_GRACE_MINUTES = 1;

export const splitTimeRange = (timeRange) => {
  if (!timeRange) return { start: null, end: null };
  const parts = String(timeRange).split(/\s*-\s*/).map((part) => part.trim());
  return { start: parts[0] || null, end: parts[parts.length - 1] || null };
};

export const getFirstShiftStartFromTimeRange = (timeRange) => {
  if (!timeRange) return null;
  return String(timeRange).split(/\s*-\s*/)[0]?.trim() || null;
};

export const parseShiftTime = (timeStr, endTimeStr = null) => {
  if (!timeStr) return { hours: 10, minutes: 0 };

  const trimmed = String(timeStr).trim();
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    let hours = Number(ampmMatch[1]);
    const minutes = Number(ampmMatch[2]);
    const period = ampmMatch[3].toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return { hours, minutes };
  }

  const parts = trimmed.split(":");
  let hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10) || 0;

  if (Number.isNaN(hours)) hours = 10;

  // 24-hour values (e.g. 22:00) are already correct
  if (hours > 12) {
    return { hours, minutes };
  }

  // Bare "10:00" without AM/PM — infer PM when shift ends after midnight / before start
  if (endTimeStr) {
    const endParsed = parseShiftTime(endTimeStr);
    if (endParsed.hours < hours || (endParsed.hours <= 6 && hours >= 6)) {
      if (hours < 12) hours += 12;
    }
  }

  return { hours, minutes };
};

export const formatShiftTimeDisplay = (hours, minutes) => {
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${String(displayHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
};

const isSameCalendarDay = (dateA, dateB) =>
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getDate() === dateB.getDate();

export const isScheduledChangeActive = (scheduled) => {
  if (!scheduled?.effectiveFrom) return false;
  const effectiveDate = new Date(scheduled.effectiveFrom);
  if (Number.isNaN(effectiveDate.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  effectiveDate.setHours(0, 0, 0, 0);
  return effectiveDate <= today;
};

const buildShiftResult = (hours, minutes, raw) => ({
  hours,
  minutes,
  display: formatShiftTimeDisplay(hours, minutes),
  raw: raw || formatShiftTimeDisplay(hours, minutes),
});

export const resolveShiftFromFields = ({ timeRange, startTime, endTime }) => {
  if (timeRange) {
    const start = getFirstShiftStartFromTimeRange(timeRange);
    const { end } = splitTimeRange(timeRange);
    if (start) {
      const { hours, minutes } = parseShiftTime(start, end);
      return buildShiftResult(hours, minutes, start);
    }
  }

  if (startTime) {
    const { hours, minutes } = parseShiftTime(startTime, endTime);
    return buildShiftResult(hours, minutes, startTime);
  }

  return null;
};

export const resolveShiftFromAssignment = (assignment) => {
  if (!assignment) return null;

  const empAssign = assignment.employeeAssignment || {};
  let timeRange = empAssign.selectedTimeRange;
  let startTime = empAssign.startTime || assignment.startTime;
  let endTime = empAssign.endTime || assignment.endTime;

  const scheduled = empAssign.scheduledChange;
  if (scheduled && isScheduledChangeActive(scheduled) && scheduled.selectedTimeRange) {
    timeRange = scheduled.selectedTimeRange;
  }

  if (!timeRange && assignment.timeSlots?.[0]?.timeRange) {
    timeRange = assignment.timeSlots[0].timeRange;
  }

  return resolveShiftFromFields({ timeRange, startTime, endTime });
};

export const fetchEmployeeShiftStart = async (employeeId, attendanceData = null) => {
  try {
    const shiftRes = await axios.get(`${API_BASE_URL}/shifts/employee/${employeeId}`);
    const shiftData = shiftRes.data?.data || shiftRes.data;

    if (shiftData) {
      const scheduled = shiftData.scheduledChange;
      if (scheduled?.selectedTimeRange && isScheduledChangeActive(scheduled)) {
        const resolved = resolveShiftFromFields({
          timeRange: scheduled.selectedTimeRange,
        });
        if (resolved) return resolved;
      }

      const resolved = resolveShiftFromFields({
        timeRange: shiftData.timeRange,
        startTime: shiftData.startTime,
        endTime: shiftData.endTime,
      });
      if (resolved) return resolved;
    }
  } catch (error) {
    console.error("Failed to fetch employee shift:", error);
  }

  if (attendanceData?.shiftStart) {
    const { hours, minutes } = parseShiftTime(attendanceData.shiftStart);
    return buildShiftResult(hours, minutes, attendanceData.shiftStart);
  }

  const employeeData = JSON.parse(localStorage.getItem("employeeData") || "{}");
  const fallbackTime = employeeData.shiftStart || employeeData.shift || "10:00";
  const { hours, minutes } = parseShiftTime(fallbackTime);
  return buildShiftResult(hours, minutes, fallbackTime);
};

const getTodayCheckInRecord = (records) => {
  if (!Array.isArray(records)) return null;
  const today = new Date();

  return records.find((record) => {
    if (!record?.checkInTime) return false;
    const checkInDate = new Date(record.checkInTime);
    return isSameCalendarDay(checkInDate, today);
  });
};

export const fetchTodayAttendance = async (employeeId) => {
  if (!employeeId) return null;

  try {
    const response = await axios.get(`${API_BASE_URL}/attendance/today/${employeeId}`);
    const data = response.data;
    if (data && data.success !== false && !data.message?.includes("not found")) {
      return data;
    }
  } catch (error) {
    // Fall through to myattendance lookup
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/attendance/myattendance/${employeeId}`);
    const records = response.data?.records || (Array.isArray(response.data) ? response.data : []);
    const todayRecord = getTodayCheckInRecord(records);

    if (todayRecord) {
      return {
        hasLoggedIn: true,
        loginTime: todayRecord.checkInTime,
        checkInTime: todayRecord.checkInTime,
        status: todayRecord.status,
      };
    }

    return { hasLoggedIn: false };
  } catch (error) {
    console.error("Failed to fetch today's attendance:", error);
    return null;
  }
};

const getMinutesFromMidnight = (date) => date.getHours() * 60 + date.getMinutes();

export const computeLoginDelayMinutes = (shiftHours, shiftMinutes, checkInTime) => {
  if (!checkInTime) return 0;

  const checkIn = new Date(checkInTime);
  const shiftStart = new Date(checkIn);
  shiftStart.setHours(shiftHours, shiftMinutes, 0, 0);

  const alertTime = new Date(shiftStart);
  alertTime.setMinutes(alertTime.getMinutes() + LOGIN_ALERT_GRACE_MINUTES);

  if (checkIn <= alertTime) return 0;
  return Math.max(0, Math.floor((checkIn.getTime() - shiftStart.getTime()) / 60000));
};

export const hasMissedLoginWindow = (shiftHours, shiftMinutes, referenceDate = new Date()) => {
  const currentTimeInMinutes = getMinutesFromMidnight(referenceDate);
  const shiftStartInMinutes = shiftHours * 60 + shiftMinutes;
  return currentTimeInMinutes >= shiftStartInMinutes + LOGIN_ALERT_GRACE_MINUTES;
};

export const computeMissedLoginDelayMinutes = (shiftHours, shiftMinutes, referenceDate = new Date()) => {
  const currentTimeInMinutes = getMinutesFromMidnight(referenceDate);
  const shiftStartInMinutes = shiftHours * 60 + shiftMinutes;
  return Math.max(0, currentTimeInMinutes - shiftStartInMinutes);
};

const getMissedNotificationStorageKey = (employeeId) => `missed_login_notification_${employeeId}`;
const getLateNotificationStorageKey = (employeeId) => `late_login_notification_${employeeId}`;

export const formatCheckInTimeDisplay = (checkInTime) =>
  new Date(checkInTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

export const createLateLoginNotification = async ({
  employeeId,
  employeeName,
  shiftDisplay,
  checkInDisplay,
  delayMinutes,
}) => {
  const todayStr = new Date().toDateString();
  const storageKey = getLateNotificationStorageKey(employeeId);
  if (localStorage.getItem(storageKey) === todayStr) {
    return false;
  }

  localStorage.setItem(storageKey, todayStr);

  try {
    await axios.post(`${API_BASE_URL}/notifications/create`, {
      employeeId,
      type: "attendance",
      title: "Late Login Alert",
      message: `Your assigned check-in time is ${shiftDisplay}. You checked in at ${checkInDisplay}. You are ${delayMinutes} minutes late.`,
      isRead: false,
      priority: "high",
      createdAt: new Date().toISOString(),
    });
    window.dispatchEvent(new Event("notification-updated"));
    return true;
  } catch (error) {
    localStorage.removeItem(storageKey);
    console.error("Failed to create late login notification:", error);
    return false;
  }
};

export const createMissedLoginNotification = async ({
  employeeId,
  shiftDisplay,
}) => {
  const todayStr = new Date().toDateString();
  const storageKey = getMissedNotificationStorageKey(employeeId);
  if (localStorage.getItem(storageKey) === todayStr) {
    return false;
  }

  localStorage.setItem(storageKey, todayStr);

  try {
    await axios.post(`${API_BASE_URL}/notifications/create`, {
      employeeId,
      type: "attendance",
      title: "Login Reminder",
      message: `Your login time is ${shiftDisplay}. You have not yet logged in. Please login.`,
      isRead: false,
      priority: "high",
      createdAt: new Date().toISOString(),
    });
    window.dispatchEvent(new Event("notification-updated"));
    return true;
  } catch (error) {
    localStorage.removeItem(storageKey);
    console.error("Failed to create missed login notification:", error);
    return false;
  }
};

/**
 * Check whether the employee should see a missed/late login alert based on their assigned shift.
 */
export const checkMissedLoginAlert = async ({
  employeeId,
  employeeName = "Employee",
  createNotification = false,
}) => {
  if (!employeeId) {
    return { shouldAlert: false, details: null };
  }

  const attendanceData = await fetchTodayAttendance(employeeId);
  const shift = await fetchEmployeeShiftStart(employeeId, attendanceData);
  const now = new Date();
  const checkInTime = attendanceData?.loginTime || attendanceData?.checkInTime;

  if (attendanceData?.hasLoggedIn && checkInTime) {
    const delayMinutes =
      attendanceData.delayMinutes ??
      computeLoginDelayMinutes(shift.hours, shift.minutes, checkInTime);
    const checkInDisplay = formatCheckInTimeDisplay(checkInTime);

    if (delayMinutes > 0 || attendanceData.isLate) {
      if (createNotification) {
        await createLateLoginNotification({
          employeeId,
          employeeName,
          shiftDisplay: shift.display,
          checkInDisplay,
          delayMinutes,
        });
      }

      return {
        shouldAlert: true,
        details: {
          employeeName,
          shiftStart: shift.display,
          delayMinutes,
          loginTime: checkInDisplay,
          date: now.toDateString(),
          hasLoggedIn: true,
          isLate: true,
          alertType: "late",
        },
      };
    }

    return { shouldAlert: false, details: null };
  }

  if (!hasMissedLoginWindow(shift.hours, shift.minutes, now)) {
    return { shouldAlert: false, details: null };
  }

  const delayMinutes = computeMissedLoginDelayMinutes(shift.hours, shift.minutes, now);
  const details = {
    employeeName,
    shiftStart: shift.display,
    delayMinutes,
    loginTime: null,
    date: now.toDateString(),
    hasLoggedIn: false,
    isLate: true,
    alertType: "missed",
  };

  if (createNotification) {
    await createMissedLoginNotification({
      employeeId,
      shiftDisplay: shift.display,
    });
  }

  return { shouldAlert: true, details };
};