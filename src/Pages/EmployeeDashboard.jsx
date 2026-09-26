
import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import {
  FiAlertCircle,
  FiCalendar,
  FiCamera,
  FiClock as FiHistory,
  FiList,
  FiUserX,
  FiX,
  FiCheckCircle,
  FiTrendingUp,
  FiLogIn,
  FiChevronRight,
  FiClock,
  FiMapPin,
  FiGift,
  FiAward,
  FiHeart,
  FiSend
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { subscribeToPushNotifications } from "../utils/pushNotification";
import CelebrationCard from "../Components/CelebrationCard";
import "./EmployeeDashboard.css";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || localStorage.getItem("employeeEmail");
  const [profile, setProfile] = useState(null);
  const [assignedLocation, setAssignedLocation] = useState("Not Assigned");
  const [shiftTiming, setShiftTiming] = useState("Not Assigned");

  const getCurrentMonth = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const [trendYear, setTrendYear] = useState(new Date().getFullYear());
  const [employeeLeaves, setEmployeeLeaves] = useState([]);

  const [employeeStats, setEmployeeStats] = useState({
    presentThisMonth: 0,
    absentThisMonth: 0,
    lateThisMonth: 0,
    totalWorkingDays: 0
  });
  const [allAttendance, setAllAttendance] = useState([]);
  const [userAttendance, setUserAttendance] = useState([]);
  const [birthdaysToday, setBirthdaysToday] = useState([]);
  const [anniversariesToday, setAnniversariesToday] = useState([]);
  const [leavesToday, setLeavesToday] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [upcomingShift, setUpcomingShift] = useState(null);
  const [currentShift, setCurrentShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");

  // ── state for the auto celebration popup ──
  const [showCelebrationPopup, setShowCelebrationPopup] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [isSinging, setIsSinging] = useState(false);
  
  // ── state for colleague birthday popup ──
  const [showColleagueBirthdayPopup, setShowColleagueBirthdayPopup] = useState(false);
  const [colleaguePopupVisible, setColleaguePopupVisible] = useState(false);
  const [colleagueBirthdayCount, setColleagueBirthdayCount] = useState(0);
  const [colleagueNames, setColleagueNames] = useState([]);

  // ── state for performance and top performer ──
  const [performanceData, setPerformanceData] = useState(null);
  const [topPerformer, setTopPerformer] = useState(null);
  const [showPerformancePopup, setShowPerformancePopup] = useState(false);
  const [perfPopupVisible, setPerfPopupVisible] = useState(false);

  // ── Calculate Approved Leaves This Month ──
  const leavesThisMonth = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-indexed
    const currentYear = today.getFullYear();
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    const monthLeaves = employeeLeaves.filter(leave => {
      const status = (leave.status || "").toLowerCase();
      if (status && status !== "approved") return false;
      const start = new Date(leave.startDate || leave.date);
      const end = new Date(leave.endDate || leave.startDate || leave.date);
      if (isNaN(start.getTime())) return false;
      start.setHours(0, 0, 0, 0);
      const validEnd = isNaN(end.getTime()) ? new Date(start) : end;
      validEnd.setHours(23, 59, 59, 999);
      return start <= monthEnd && validEnd >= monthStart;
    });

    return monthLeaves.reduce((sum, leave) => sum + (Number(leave.days) || 1), 0);
  }, [employeeLeaves]);

  // ── Calculate Upcoming Holidays ──
  const { upcomingHolidaysCount, nextHolidayName } = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = holidays.filter(h => (h.toDate || h.fromDate || "") >= todayStr);
    const nextH = upcoming[0];
    return {
      upcomingHolidaysCount: upcoming.length,
      nextHolidayName: nextH?.name || ""
    };
  }, [holidays]);

  useEffect(() => {
    if (!email) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const BASE_URL = API_BASE_URL.replace(/\/api$/, "/");
        const API_5000 = API_BASE_URL.replace(/\/api$/, "/");

        const profileRes = await axios.get(`${BASE_URL}api/employees/get-employee?email=${email}`);
        const profileData = profileRes.data.data || profileRes.data;
        setProfile(profileData);

        if (profileData) {
          if (profileData._id) {
            subscribeToPushNotifications(profileData._id);
          }

          const empId = profileData.employeeId;
          const localStorageId = JSON.parse(localStorage.getItem("employeeData"))?.employeeId;
          const targetId = empId || localStorageId;

          const allAttRes = await axios.get(`${BASE_URL}api/attendance/allattendance`);
          const allAttendanceData = Array.isArray(allAttRes.data) ? allAttRes.data :
            allAttRes.data.records || allAttRes.data.allAttendance || [];
          setAllAttendance(allAttendanceData);

          const filteredAttendance = allAttendanceData.filter(record => {
            const recordId = typeof record.employeeId === 'object' ?
              record.employeeId?.employeeId : record.employeeId;
            return recordId === targetId;
          });
          setUserAttendance(filteredAttendance);

          calculateEmployeeStats(filteredAttendance, profileData);

          const leaveRes = await axios.get(`${BASE_URL}api/leaves/employeeleaves/${targetId}`);
          const leaveRecords = leaveRes.data?.records || leaveRes.data?.data || (Array.isArray(leaveRes.data) ? leaveRes.data : []);
          setEmployeeLeaves(leaveRecords);
          const pendingLeavesCount = leaveRecords.filter(l => l.status === "pending").length || 0;
          setEmployeeStats(prev => ({ ...prev, pendingLeaves: pendingLeavesCount }));

          try {
            const permRes = await axios.get(`${API_5000}api/permissions/my-permissions/${targetId}`);
            const activePermsCount = permRes.data?.filter(p => p.status === "APPROVED").length || 0;
            setEmployeeStats(prev => ({ ...prev, permissions: activePermsCount }));
          } catch (e) {
            console.warn("Permissions fetch failed", e);
          }

          const fetchLocation = async (url) => {
            const res = await axios.get(`${url}api/employees/mylocation/${targetId}`);
            const data = res.data?.data || res.data;
            if (data?.location?.name) return data.location.name;
            return null;
          };

          try {
            let locName = await fetchLocation(API_5000);
            if (!locName && profileData.location?.name) locName = profileData.location.name;
            setAssignedLocation(locName || "Not Assigned");
          } catch (e) {
            setAssignedLocation("Not Assigned");
          }

          try {
            const shiftRes = await axios.get(`${API_5000}api/shifts/employee/${targetId}`);
            const shiftData = shiftRes.data?.data || shiftRes.data;

            if (shiftData?.startTime) {
              setShiftTiming(`${shiftData.startTime} - ${shiftData.endTime}`);
            } else if (shiftData?.employeeAssignment?.startTime) {
              setShiftTiming(`${shiftData.employeeAssignment.startTime} - ${shiftData.employeeAssignment.endTime}`);
            } else {
              setShiftTiming("No Shift Assigned");
            }

            setCurrentShift(shiftData || null);

            const scheduled = shiftData?.scheduledChange;
            if (scheduled?.shiftType) {
              setUpcomingShift({
                shiftType: scheduled.shiftType,
                shiftName: scheduled.shiftName || `Shift ${scheduled.shiftType}`,
                timeRange: scheduled.selectedTimeRange || "Not specified",
                description: scheduled.selectedDescription || "Shift timing",
                effectiveFrom: scheduled.effectiveFrom,
                shiftCategory: scheduled.shiftCategory || shiftData?.shiftCategory || "Regular",
              });
            } else {
              setUpcomingShift(null);
            }
          } catch (e) {
            setShiftTiming("Not Assigned");
            setUpcomingShift(null);
            setCurrentShift(null);
          }

          try {
            const bdayRes = await axios.get(`${BASE_URL}api/employees/birthdays-today?department=${encodeURIComponent(profileData.department || "")}`);
            setBirthdaysToday(bdayRes.data.data || []);
          } catch (e) {
            console.warn("Birthdays fetch failed", e);
          }

          try {
            const annivRes = await axios.get(`${BASE_URL}api/employees/anniversaries-today?department=${encodeURIComponent(profileData.department || "")}`);
            setAnniversariesToday(annivRes.data.data || []);
          } catch (e) {
            console.warn("Anniversaries fetch failed", e);
          }

          try {
            const leaveTodayRes = await axios.get(`${BASE_URL}api/leaves/on-leave-today?department=${encodeURIComponent(profileData.department || "")}`);
            setLeavesToday(leaveTodayRes.data.data || []);
          } catch (e) {
            console.warn("Leaves today fetch failed", e);
          }

          // ── Fetch Employee Performance ──
          try {
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();
            const perfRes = await axios.get(`${BASE_URL}api/dashboard/employee-performance/${targetId}?month=${currentMonth}&year=${currentYear}`);
            if (perfRes.data && perfRes.data.success) {
              setPerformanceData(perfRes.data);
            }
          } catch (e) {
            console.warn("Employee performance fetch failed", e);
          }

          // ── Fetch Top Performer ──
          try {
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();
            const topPerfRes = await axios.get(`${BASE_URL}api/dashboard/top-performers?month=${currentMonth}&year=${currentYear}`);
            if (topPerfRes.data && topPerfRes.data.success && topPerfRes.data.performers) {
              setTopPerformer(topPerfRes.data.performers[0] || null);
            }
          } catch (e) {
            console.warn("Top performers fetch failed", e);
          }

          // ── Fetch Holidays ──
          try {
            const holRes = await axios.get(`${BASE_URL}api/holidays/all`);
            const holidayList = Array.isArray(holRes.data) ? holRes.data : holRes.data?.data || [];
            setHolidays(holidayList);
          } catch (e) {
            console.warn("Holidays fetch failed", e);
          }

          setLoading(false);
        }
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [email]);

  // ── FEMALE SINGING: "Happy Birthday to You" with musical notes ──
  const playSingingBirthday = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      
      const createFemaleVoice = (freq, startTime, duration, volume = 0.3) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.value = freq;

        const vibrato = ctx.createOscillator();
        const vibratoGain = ctx.createGain();
        vibrato.frequency.value = 5.5;
        vibratoGain.gain.value = 5;
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = freq * 1.8;
        filter.Q.value = 8;

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.value = freq * 1.005;

        gain.gain.setValueAtTime(0.001, ctx.currentTime + startTime);
        gain.gain.linearRampToValueAtTime(volume * 0.7, ctx.currentTime + startTime + 0.08);
        gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startTime + 0.15);
        gain.gain.setValueAtTime(volume, ctx.currentTime + startTime + duration - 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

        gain2.gain.setValueAtTime(0.001, ctx.currentTime + startTime);
        gain2.gain.linearRampToValueAtTime(volume * 0.3, ctx.currentTime + startTime + 0.1);
        gain2.gain.setValueAtTime(volume * 0.3, ctx.currentTime + startTime + duration - 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration + 0.05);
        osc2.start(ctx.currentTime + startTime);
        osc2.stop(ctx.currentTime + startTime + duration + 0.05);
        vibrato.start(ctx.currentTime + startTime);
        vibrato.stop(ctx.currentTime + startTime + duration + 0.05);

        return { osc, gain, osc2, gain2, vibrato, vibratoGain };
      };

      const G4 = 392.0, A4 = 440.0, B4 = 493.88, C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99;

      const singingNotes = [
        [G4, 0.0, 0.3, 0.35],
        [G4, 0.3, 0.25, 0.35],
        [A4, 0.6, 0.4, 0.4],
        [G4, 1.0, 0.4, 0.4],
        [C5, 1.5, 0.35, 0.35],
        [B4, 1.9, 0.9, 0.4],
        [G4, 3.0, 0.3, 0.35],
        [G4, 3.3, 0.25, 0.35],
        [A4, 3.6, 0.4, 0.4],
        [G4, 4.0, 0.4, 0.4],
        [D5, 4.5, 0.35, 0.35],
        [C5, 4.9, 0.9, 0.4],
        [G4, 6.0, 0.3, 0.35],
        [G4, 6.3, 0.25, 0.35],
        [G5, 6.6, 0.4, 0.4],
        [E5, 7.0, 0.4, 0.4],
        [C5, 7.5, 0.35, 0.35],
        [B4, 7.9, 0.5, 0.35],
        [A4, 8.4, 0.7, 0.35],
        [F5, 9.3, 0.3, 0.4],
        [F5, 9.6, 0.25, 0.4],
        [E5, 9.9, 0.4, 0.4],
        [C5, 10.3, 0.4, 0.4],
        [D5, 10.8, 0.35, 0.4],
        [C5, 11.2, 1.4, 0.45],
      ];

      singingNotes.forEach(([freq, start, dur, vol]) => {
        createFemaleVoice(freq, start, dur, vol);
      });

      setIsSinging(true);

      setTimeout(() => {
        setIsSinging(false);
        ctx.close();
      }, 13500);

    } catch (e) {
      console.warn("Singing voice could not be played", e);
      setIsSinging(false);
    }
  };

  // ── trigger popups once birthdays are known ──
  useEffect(() => {
    if (!email) return;
    
    const isMyBirthday = birthdaysToday.some(b => b.email === email);
    const myAnniversary = anniversariesToday.find(a => a.email === email);
    
    // ── MY BIRTHDAY / ANNIVERSARY ──
    if (isMyBirthday || myAnniversary) {
      setShowCelebrationPopup(true);
      if (isMyBirthday) {
        setTimeout(() => {
          playSingingBirthday();
        }, 500);
      }
    }
    
    // ── COLLEAGUE BIRTHDAY (EXCLUDING SELF) ──
    const colleagueBirthdays = birthdaysToday.filter(b => b.email !== email);
    if (colleagueBirthdays.length > 0) {
      setColleagueBirthdayCount(colleagueBirthdays.length);
      setColleagueNames(colleagueBirthdays.map(b => b.name || b.employeeName || 'Colleague'));
      // Show colleague birthday popup after a delay (but not if personal birthday is showing)
      setTimeout(() => {
        if (!isMyBirthday && !myAnniversary) {
          setShowColleagueBirthdayPopup(true);
        }
      }, 1500);
    }
    
  }, [birthdaysToday, anniversariesToday, email]);

  // ── handle popup entrance + auto-hide after singing finishes ──
  useEffect(() => {
    if (showCelebrationPopup) {
      const t = setTimeout(() => setPopupVisible(true), 400);
      return () => clearTimeout(t);
    } else {
      setPopupVisible(false);
    }
  }, [showCelebrationPopup]);

  // ── Colleague popup entrance ──
  useEffect(() => {
    if (showColleagueBirthdayPopup) {
      const t = setTimeout(() => setColleaguePopupVisible(true), 400);
      return () => clearTimeout(t);
    } else {
      setColleaguePopupVisible(false);
    }
  }, [showColleagueBirthdayPopup]);

  const closeCelebrationPopup = () => {
    setPopupVisible(false);
    setTimeout(() => setShowCelebrationPopup(false), 300);
  };

  const closeColleaguePopup = () => {
    setColleaguePopupVisible(false);
    setTimeout(() => setShowColleagueBirthdayPopup(false), 300);
  };

  // ── Trigger performance modal once performance data is available ──
  useEffect(() => {
    if (!performanceData) return;

    const alreadyNotified = sessionStorage.getItem("performance_notified");
    if (!alreadyNotified) {
      // Delay showing it slightly to not clash with birthday popup
      const delay = birthdaysToday.length > 0 ? 5000 : 1500;
      const t = setTimeout(() => {
        setShowPerformancePopup(true);
      }, delay);
      return () => clearTimeout(t);
    }
  }, [performanceData, birthdaysToday]);

  // Handle performance popup transition
  useEffect(() => {
    if (showPerformancePopup) {
      const t = setTimeout(() => setPerfPopupVisible(true), 100);
      return () => clearTimeout(t);
    } else {
      setPerfPopupVisible(false);
    }
  }, [showPerformancePopup]);

  const closePerfPopup = () => {
    setPerfPopupVisible(false);
    setTimeout(() => {
      setShowPerformancePopup(false);
      sessionStorage.setItem("performance_notified", "true");
    }, 300);
  };

  // ── Close popup when singing finishes ──
  useEffect(() => {
    if (!popupVisible) return;
    
    if (!isSinging && showCelebrationPopup) {
      const t = setTimeout(() => {
        closeCelebrationPopup();
      }, 800);
      return () => clearTimeout(t);
    }
    
    const safetyTimer = setTimeout(() => {
      if (showCelebrationPopup) {
        closeCelebrationPopup();
      }
    }, 14500);
    
    return () => clearTimeout(safetyTimer);
  }, [isSinging, popupVisible, showCelebrationPopup]);

  // ── Auto close colleague popup after 6 seconds ──
  useEffect(() => {
    if (!colleaguePopupVisible) return;
    
    const t = setTimeout(() => {
      closeColleaguePopup();
    }, 6000);
    
    return () => clearTimeout(t);
  }, [colleaguePopupVisible]);

  const handleSendWish = async () => {
    try {
      const names = colleagueNames.join(', ');
      const message = `🎉 Happy Birthday dear ${names}! Wishing you a wonderful day filled with joy and happiness! 🎂🎈`;
      
      // Send wish via email or notification
      // For now, show a success message
      alert(`🎉 Birthday wishes sent to ${colleagueNames.length} colleague${colleagueNames.length > 1 ? 's' : ''}!`);
      
      // You can integrate with an API to send email notifications here
      // await axios.post(`${API_BASE_URL}/api/notifications/send-wish`, { 
      //   to: colleagueEmails, 
      //   message: message 
      // });
      
    } catch (error) {
      console.error("Error sending wish:", error);
      alert("Failed to send wish. Please try again.");
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !profile?._id) return;

    const formData = new FormData();
    formData.append("profileImage", file);
    formData.append("profile_image", file);
    formData.append("image", file);

    try {
      setLoading(true);
      const response = await axios.put(`${API_BASE_URL}/employees/update/${profile._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const updatedData = response.data?.data || response.data?.employee || response.data;
      
      if (updatedData) {
        const refreshed = await axios.get(`${API_BASE_URL}/employees/get-employee?email=${profile.email}`);
        const finalProfile = refreshed.data.data || refreshed.data;
        setProfile(finalProfile);
        
        const stored = localStorage.getItem("employeeData");
        if (stored) {
          const data = JSON.parse(stored);
          const newImg = finalProfile.profileImage || finalProfile.profile_image || finalProfile.image;
          if (newImg) data.profileImage = newImg;
          localStorage.setItem("employeeData", JSON.stringify(data));
        }
        
        alert("✅ Profile image updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile image:", error);
      alert("❌ Failed to update profile image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageDelete = async (e) => {
    e?.stopPropagation();
    if (!profile?._id || !window.confirm("Are you sure you want to remove your profile image?")) return;

    try {
      setLoading(true);
      await axios.put(`${API_BASE_URL}/employees/update/${profile._id}`, {
        profileImage: ""
      });

      setProfile(prev => ({ ...prev, profileImage: "" }));
      
      const stored = localStorage.getItem("employeeData");
      if (stored) {
        const data = JSON.parse(stored);
        data.profileImage = "";
        localStorage.setItem("employeeData", JSON.stringify(data));
      }
      
      alert("✅ Profile image removed successfully!");
    } catch (error) {
      console.error("Error deleting profile image:", error);
      alert("❌ Failed to remove profile image.");
    } finally {
      setLoading(false);
    }
  };

  const calculateEmployeeStats = (attendance, profileData) => {
    const statsMonth = getCurrentMonth();
    if (!statsMonth) return;
    const parts = statsMonth.split('-');
    if (parts.length < 2) return;
    const [year, month] = parts.map(Number);
    if (isNaN(year) || isNaN(month)) return;

    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    
    let maxDayToCheck = daysInMonth;
    if (year > currentYear || (year === currentYear && month > currentMonth)) {
      maxDayToCheck = 0;
    } else if (year === currentYear && month === currentMonth) {
      maxDayToCheck = today.getDate();
    }

    const workingDays = [];
    const workingDayMap = {};

    for (let day = 1; day <= maxDayToCheck; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 6) {
        workingDays.push(day);
        workingDayMap[day] = true;
      }
    }

    const presentDays = new Set();
    let lateDays = 0;

    attendance.forEach(record => {
      if (!record.checkInTime) return;

      const recordDate = new Date(record.checkInTime);
      if (recordDate.getMonth() + 1 !== month || recordDate.getFullYear() !== year) return;

      const day = recordDate.getDate();

      if (record.status === "present" || record.status === "checked-in") {
        if (workingDayMap[day]) {
          presentDays.add(day);
        }

        const shiftStart = getShiftStartTime(profileData?.shift || "D");
        const [hours, minutes] = shiftStart.split(':').map(Number);
        const shiftStartTime = new Date(recordDate);
        shiftStartTime.setHours(hours, minutes, 0, 0);

        const graceTime = new Date(shiftStartTime);
        graceTime.setMinutes(graceTime.getMinutes() + 5);

        if (recordDate > graceTime) {
          lateDays++;
        }
      }
    });

    let absentDays = 0;
    workingDays.forEach(day => {
      if (!presentDays.has(day)) {
        absentDays++;
      }
    });

    setEmployeeStats({
      presentThisMonth: presentDays.size,
      absentThisMonth: absentDays,
      lateThisMonth: lateDays,
      totalWorkingDays: workingDays.length
    });
  };

  useEffect(() => {
    if (!profile || !allAttendance.length) return;

    const targetId = profile.employeeId;
    const filteredAttendance = allAttendance.filter(record => {
      const recordId = typeof record.employeeId === 'object' ?
        record.employeeId?.employeeId : record.employeeId;
      return recordId === targetId;
    });

    calculateEmployeeStats(filteredAttendance, profile);
  }, [profile, allAttendance]);

  const getMonthlyTrend = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    const data = [];

    months.forEach((month, idx) => {
      const monthNum = idx + 1;
      if (trendYear > today.getFullYear() || (trendYear === today.getFullYear() && monthNum > today.getMonth() + 1)) {
        return;
      }

      const daysInMonth = new Date(trendYear, monthNum, 0).getDate();
      let maxDay = daysInMonth;
      if (trendYear === today.getFullYear() && monthNum === today.getMonth() + 1) {
        maxDay = today.getDate();
      }

      let workingDays = 0;
      const workingDayMap = {};
      for (let day = 1; day <= maxDay; day++) {
        const date = new Date(trendYear, idx, day);
        if (date.getDay() >= 1 && date.getDay() <= 6) {
          workingDays++;
          workingDayMap[day] = true;
        }
      }
      if (workingDays === 0) workingDays = 1;

      const presentDays = new Set();
      userAttendance.forEach(record => {
        if (!record.checkInTime) return;
        const recordDate = new Date(record.checkInTime);
        if (recordDate.getFullYear() !== trendYear || recordDate.getMonth() !== idx) return;
        if (record.status === "present" || record.status === "checked-in") {
          const day = recordDate.getDate();
          if (workingDayMap[day]) presentDays.add(day);
        }
      });

      const rate = Math.min(100, Math.round((presentDays.size / workingDays) * 100));

      const monthLeaves = employeeLeaves.filter(leave => {
        if (leave.status !== 'approved') return false;
        const start = new Date(leave.startDate || leave.date);
        const end = new Date(leave.endDate || leave.startDate || leave.date);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        const monthStart = new Date(trendYear, idx, 1);
        const monthEnd = new Date(trendYear, idx + 1, 0, 23, 59, 59, 999);
        return start <= monthEnd && end >= monthStart;
      });

      let leavesDays = 0;
      monthLeaves.forEach(leave => {
        leavesDays += leave.days || 1;
      });

      data.push({
        month,
        rate,
        leavesDays,
        leavesCount: monthLeaves.length,
        hasData: presentDays.size > 0 || monthLeaves.length > 0 || maxDay > 0
      });
    });

    const filteredData = data.filter(d => d.hasData);
    if (filteredData.length === 0) {
      const currentMonthIdx = trendYear === today.getFullYear() ? today.getMonth() : 11;
      return data.slice(Math.max(0, currentMonthIdx - 2), currentMonthIdx + 1);
    }
    return filteredData;
  };

  const monthlyTrendData = getMonthlyTrend();

  const getShiftStartTime = (shiftType) => {
    const shiftTimes = {
      "A": "10:00", "B": "14:00", "C": "18:00", "D": "09:00",
      "E": "10:00", "F": "14:00", "G": "09:00", "H": "09:00",
      "I": "07:00", "BR": "07:00"
    };
    return shiftTimes[shiftType] || "09:00";
  };

  const TrendTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2.5 border border-slate-200 rounded-lg shadow-lg max-w-[220px] text-[10px]">
          <p className="font-extrabold text-[#101828] border-b border-slate-100 pb-1 mb-1 text-center">
            {data.month} {trendYear}
          </p>
          <div className="space-y-0.5">
            <p className="flex items-center justify-between font-semibold">
              <span className="text-[#175cd3]">Attendance Rate:</span>
              <span className="text-[#101828] font-extrabold">{data.rate}%</span>
            </p>
            <p className="flex items-center justify-between font-semibold">
              <span className="text-[#ec4899]">Leaves Taken:</span>
              <span className="text-[#101828] font-extrabold">{data.leavesDays} {data.leavesDays === 1 ? 'day' : 'days'}</span>
            </p>
          </div>
          {data.leavesDays === 0 ? (
            <div className="mt-2 pt-1.5 border-t border-slate-100 text-[8px] text-[#667085] font-medium italic text-center">
              No leaves this month
            </div>
          ) : null}
        </div>
      );
    }
    return null;
  };

  if (loading || !profile) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
        <p className="text-sm font-medium text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 21) return "Good evening";
    return "Good evening";
  };

  const todayRecord = userAttendance.find((record) => {
    if (!record.checkInTime) return false;
    return new Date(record.checkInTime).toDateString() === new Date().toDateString();
  });

  const attendanceRate =
    employeeStats.totalWorkingDays > 0
      ? Math.round((employeeStats.presentThisMonth / employeeStats.totalWorkingDays) * 100)
      : 0;

  const formatTime = (value) =>
    value
      ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "—";

  const trendYearOptions = [new Date().getFullYear(), new Date().getFullYear() - 1];

  const popupIsMyBirthday = birthdaysToday.some(b => b.email === email);
  const popupMyAnniversary = anniversariesToday.find(a => a.email === email);
  const popupType = popupIsMyBirthday ? "birthday" : "anniversary";
  const popupFirstName = profile?.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20">
      <div className="p-3 sm:p-4 lg:p-6">
        
        {/* ─── HEADER ─── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              👋 {getGreeting()}, <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{profile?.name?.split(" ")[0] || 'User'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2 mt-0.5">
              <FiCalendar className="w-3 h-3" />
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-white/30 shadow-sm">
              <span className="text-xs font-medium text-gray-600">ID: {profile?.employeeId || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* ─── PROFILE CARD ─── */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-sm mb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-800">{profile?.name || 'Employee'}</h2>
              <p className="text-sm text-indigo-600 font-medium">{profile?.department || 'Team Member'}</p>
              <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1"><FiCheckCircle className="text-emerald-500 w-3 h-3" /> Active</span>
                <span className="flex items-center gap-1"><FiMapPin className="w-3 h-3" /> {assignedLocation}</span>
                <span className="flex items-center gap-1"><FiClock className="w-3 h-3" /> {shiftTiming}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate("/myattendance")} className="px-3 py-1.5 text-xs font-medium bg-white/80 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Attendance Report
              </button>
              <button onClick={() => navigate("/emp-profile")} className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                Full Profile
              </button>
            </div>
          </div>
        </div>

        {/* ─── TODAY'S ATTENDANCE BANNER ─── */}
        <div className="relative overflow-hidden rounded-xl mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 p-4 text-white shadow-lg shadow-indigo-500/20">
          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider opacity-80 flex items-center gap-2">
                <FiClock className="w-3 h-3" />
                Today's Attendance
              </div>
              <div className="text-lg font-bold mt-0.5">
                {todayRecord
                  ? todayRecord.checkOutTime
                    ? "✅ Day completed"
                    : "🟢 Currently checked in"
                  : "⭕ Not checked in yet"}
              </div>
              <div className="flex flex-wrap gap-3 mt-1 text-sm">
                <div><span className="text-xs opacity-70 block">Check In</span><span className="font-medium">{formatTime(todayRecord?.checkInTime)}</span></div>
                <div><span className="text-xs opacity-70 block">Check Out</span><span className="font-medium">{formatTime(todayRecord?.checkOutTime)}</span></div>
                <div><span className="text-xs opacity-70 block">Shift</span><span className="font-medium">{shiftTiming}</span></div>
              </div>
            </div>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all shadow-lg hover:scale-105"
              onClick={() => navigate("/attendance-capture")}
            >
              <FiLogIn className="w-4 h-4" />
              {todayRecord && !todayRecord.checkOutTime ? "Check Out" : "Mark Attendance"}
            </button>
          </div>
        </div>

        {/* ─── PERFORMANCE ADVISORY BANNER ─── */}
        {performanceData && (
          <div className={`rounded-xl p-4 mb-4 border flex items-start gap-3 shadow-sm ${
            (performanceData.performancePercentage || 0) >= 80 
              ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
              : (performanceData.performancePercentage || 0) >= 60 
                ? "bg-indigo-50 border-indigo-100 text-indigo-800" 
                : "bg-red-50 border-red-100 text-red-800"
          }`}>
            <div className="text-xl">
              {(performanceData.performancePercentage || 0) >= 80 ? "🏆" : (performanceData.performancePercentage || 0) >= 60 ? "✨" : "⚠️"}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold uppercase tracking-wider opacity-85">Performance Advisory</h4>
              <p className="text-sm font-semibold mt-1">
                {(performanceData.performancePercentage || 0) >= 80 && `Your performance is excellent this month! Good job, ${profile?.name?.split(" ")[0]}! Keep up the excellent work! 👍`}
                {(performanceData.performancePercentage || 0) >= 60 && (performanceData.performancePercentage || 0) < 80 && `Your performance is good, ${profile?.name?.split(" ")[0]}! You are doing well, but there is still room for improvement. Let's aim higher! 💪`}
                {(performanceData.performancePercentage || 0) < 60 && `Your performance is low this month. Need to improve your performance, ${profile?.name?.split(" ")[0]}. Please focus on improvement. ⚠️`}
              </p>
              
              {/* Warnings for late check-in or absents */}
              {((performanceData.lateComingDays || 0) > 3 || (performanceData.absentDays || 0) > 2) && (
                <div className="mt-2 text-xs border-t pt-2 border-current/10 space-y-1">
                  <span className="font-bold block uppercase tracking-wider text-[10px] opacity-90">Attention Needed:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {(performanceData.lateComingDays || 0) > 3 && (
                      <li>You checked in late {performanceData.lateComingDays} times this month. Please check-in on time to maintain discipline.</li>
                    )}
                    {(performanceData.absentDays || 0) > 2 && (
                      <li>You have been absent {performanceData.absentDays} days this month. Please try to maintain regular attendance.</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── STATS GRID ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
          <div 
            onClick={() => navigate("/myattendance")}
            className="emp-dash__stat cursor-pointer hover:shadow-md transition-all"
            title="View Attendance Records"
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Present</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiCheckCircle />
              </div>
            </div>
            <div className="emp-dash__stat-value">
              {performanceData ? performanceData.presentDays : employeeStats.presentThisMonth}
            </div>
            <div className="emp-dash__stat-meta">days this month</div>
          </div>

          <div 
            onClick={() => navigate("/myattendance")}
            className="emp-dash__stat cursor-pointer hover:shadow-md transition-all"
            title="View Attendance Records"
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Absent</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                <FiUserX />
              </div>
            </div>
            <div className="emp-dash__stat-value">
              {performanceData ? performanceData.absentDays : employeeStats.absentThisMonth}
            </div>
            <div className="emp-dash__stat-meta">days this month</div>
          </div>

          <div 
            onClick={() => navigate("/myattendance")}
            className="emp-dash__stat cursor-pointer hover:shadow-md transition-all"
            title="View Attendance Records"
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Late</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiClock />
              </div>
            </div>
            <div className="emp-dash__stat-value">
              {performanceData ? performanceData.lateComingDays : employeeStats.lateThisMonth}
            </div>
            <div className="emp-dash__stat-meta">instances</div>
          </div>

          <div 
            onClick={() => navigate("/myleaves")}
            className="emp-dash__stat cursor-pointer hover:shadow-md transition-all"
            title="View Leave Requests"
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Leaves</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--leave">
                <FiCalendar />
              </div>
            </div>
            <div className="emp-dash__stat-value">
              {performanceData?.leavesDays ?? performanceData?.leaveDays ?? performanceData?.leaves ?? leavesThisMonth}
            </div>
            <div className="emp-dash__stat-meta">days this month</div>
          </div>

          <div 
            onClick={() => navigate("/myattendance")}
            className="emp-dash__stat col-span-2 sm:col-span-1 cursor-pointer hover:shadow-md transition-all"
            title="View Attendance Records"
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Performance</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiTrendingUp />
              </div>
            </div>
            <div className="emp-dash__stat-value">
              {performanceData ? `${performanceData.performancePercentage}%` : `${attendanceRate}%`}
            </div>
            <div className="emp-dash__stat-meta">
              {performanceData ? "calculated score" : `of ${employeeStats.totalWorkingDays} days`}
            </div>
          </div>
        </div>

        {/* ─── QUICK ACTIONS & STATS ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
          <button 
            onClick={() => navigate("/attendance-capture")} 
            className="emp-dash__stat cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all text-left group flex flex-col justify-between"
            title="Mark Attendance"
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Mark Attendance</span>
              <div className="emp-dash__stat-icon bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                <FiCamera size={18} />
              </div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors flex items-center justify-between">
                <span>{todayRecord ? (todayRecord.status === 'checked-in' ? 'Checked In' : 'Completed') : 'Capture'}</span>
                <FiChevronRight className="text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" size={16} />
              </div>
              <div className="emp-dash__stat-meta">
                {todayRecord?.checkInTime ? `In: ${formatTime(todayRecord.checkInTime)}` : 'scan face to check in'}
              </div>
            </div>
          </button>

          <button 
            onClick={() => navigate("/myattendance")} 
            className="emp-dash__stat cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all text-left group flex flex-col justify-between"
            title="View Attendance History"
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">History</span>
              <div className="emp-dash__stat-icon bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                <FiClock size={18} />
              </div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors flex items-center justify-between">
                <span>{userAttendance.length} Logs</span>
                <FiChevronRight className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={16} />
              </div>
              <div className="emp-dash__stat-meta">attendance records</div>
            </div>
          </button>

          <button 
            onClick={() => navigate("/mypermissions")} 
            className="emp-dash__stat cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all text-left group flex flex-col justify-between"
            title="View Permissions"
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Permission</span>
              <div className="emp-dash__stat-icon bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
                <FiList size={18} />
              </div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-amber-600 transition-colors flex items-center justify-between">
                <span>{employeeStats.permissions || 0} Passes</span>
                <FiChevronRight className="text-gray-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" size={16} />
              </div>
              <div className="emp-dash__stat-meta">approved requests</div>
            </div>
          </button>

          <button 
            onClick={() => navigate("/myleaves")} 
            className="emp-dash__stat cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all text-left group flex flex-col justify-between"
            title="View Leaves"
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Leaves</span>
              <div className="emp-dash__stat-icon bg-pink-50 text-pink-600 group-hover:scale-110 transition-transform">
                <FiCalendar size={18} />
              </div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-pink-600 transition-colors flex items-center justify-between">
                <span>{employeeLeaves.length} Records</span>
                <FiChevronRight className="text-gray-300 group-hover:text-pink-600 group-hover:translate-x-1 transition-all" size={16} />
              </div>
              <div className="emp-dash__stat-meta">
                {employeeStats.pendingLeaves > 0 ? `${employeeStats.pendingLeaves} pending approval` : 'apply for leaves'}
              </div>
            </div>
          </button>

          <button 
            onClick={() => navigate("/HolidayList")} 
            className="emp-dash__stat col-span-2 sm:col-span-1 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all text-left group flex flex-col justify-between"
            title="View Holidays"
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Holiday</span>
              <div className="emp-dash__stat-icon bg-orange-50 text-orange-600 group-hover:scale-110 transition-transform">
                <FiGift size={18} />
              </div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors flex items-center justify-between">
                <span>{upcomingHolidaysCount > 0 ? `${upcomingHolidaysCount} Upcoming` : `${holidays.length} Annual`}</span>
                <FiChevronRight className="text-gray-300 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" size={16} />
              </div>
              <div className="emp-dash__stat-meta">
                {nextHolidayName ? `Next: ${nextHolidayName}` : 'annual holiday list'}
              </div>
            </div>
          </button>
        </div>

        {/* ─── MONTHLY ATTENDANCE TREND ─── */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/30 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <FiTrendingUp className="w-3.5 h-3.5 text-indigo-500" /> My Monthly Attendance Trend
            </h3>
            <select
              value={trendYear}
              onChange={(e) => setTrendYear(Number(e.target.value))}
              className="px-2 py-0.5 bg-[#f8fafc] border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600 focus:outline-none cursor-pointer"
            >
              {trendYearOptions.map((year) => (
                <option key={year} value={year}>{year === new Date().getFullYear() ? 'This Year' : year}</option>
              ))}
            </select>
          </div>

          <div className="h-[190px] w-full py-1">
            {monthlyTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyTrendData} margin={{ top: 5, right: -5, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="empTrendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#175cd3" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#175cd3" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: '700' }}
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: '700' }}
                    domain={[0, 100]}
                    ticks={[0, 20, 40, 60, 80, 100]}
                    unit="%"
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#ec4899', fontSize: 9, fontWeight: '700' }}
                    domain={[0, 'auto']}
                    allowDecimals={false}
                  />
                  <Tooltip content={<TrendTooltip />} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="rate"
                    stroke="#175cd3"
                    strokeWidth={2}
                    fill="url(#empTrendGradient)"
                    dot={{ fill: '#175cd3', stroke: '#fff', strokeWidth: 1.5, r: 3.5 }}
                    activeDot={{ r: 5, fill: '#175cd3', stroke: '#fff', strokeWidth: 1.5 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="leavesDays"
                    stroke="#ec4899"
                    strokeWidth={2}
                    dot={{ fill: '#ec4899', stroke: '#fff', strokeWidth: 1.5, r: 3.5 }}
                    activeDot={{ r: 5, fill: '#ec4899', stroke: '#fff', strokeWidth: 1.5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                <div className="text-center"><FiAlertCircle className="w-6 h-6 mx-auto mb-1 opacity-20" /><p>No attendance data yet</p></div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 text-[8px] font-bold text-[#667085] uppercase tracking-wide pt-1 border-t border-slate-100">
            <span className="flex items-center gap-0.5">
              <span className="w-3 h-1 rounded-full bg-[#175cd3] inline-block" /> Attendance Rate
            </span>
            <span className="flex items-center gap-0.5">
              <span className="w-3 h-1 rounded-full bg-[#ec4899] inline-block" /> Leaves Taken
            </span>
          </div>
        </div>

        {/* ─── RECENT ATTENDANCE ─── */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/30 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <FiList className="w-3.5 h-3.5 text-indigo-500" /> Recent Activity
            </h3>
            <button onClick={() => navigate("/myattendance")} className="text-[10px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5">
              View all <FiChevronRight size={12} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200/50">
                  <th className="px-2 py-1.5 text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-2 py-1.5 text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Check In</th>
                  <th className="px-2 py-1.5 text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Check Out</th>
                  <th className="px-2 py-1.5 text-[9px] font-semibold text-gray-400 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50">
                {userAttendance.slice(0, 5).map((record, index) => (
                  <tr key={index} className="hover:bg-white/30 transition-colors">
                    <td className="px-2 py-1.5 text-[11px] font-medium text-gray-700">{new Date(record.checkInTime).toLocaleDateString()}</td>
                    <td className="px-2 py-1.5 text-[11px] text-gray-500">{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td className="px-2 py-1.5 text-[11px] text-gray-500">{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td className="px-2 py-1.5 text-right">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${record.status === 'present' || record.status === 'checked-in' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {record.status === 'checked-in' ? '✅ In' : (record.status === 'present' ? '✅ Present' : '❌ ' + record.status)}
                      </span>
                    </td>
                  </tr>
                ))}
                {userAttendance.length === 0 && (
                  <tr><td colSpan="4" className="py-4 text-center text-xs text-gray-400 italic">No recent activity found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── CELEBRATIONS ─── */}
        {(() => {
          const isMyBirthday = birthdaysToday.some(b => b.email === email);
          const myAnniversary = anniversariesToday.find(a => a.email === email);
          const deptBirthdays = birthdaysToday.filter(b => b.email !== email);
          const deptAnniversaries = anniversariesToday.filter(a => a.email !== email);
          const deptLeaves = leavesToday.filter(l => l.email !== email);

          if (!isMyBirthday && !myAnniversary && !upcomingShift && deptBirthdays.length === 0 && deptAnniversaries.length === 0 && deptLeaves.length === 0) return null;

          return (
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/30 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200/50">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                  <h3 className="text-xs font-semibold text-gray-700">Updates & Celebrations</h3>
                </div>
              </div>
              <div className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {isMyBirthday && <CelebrationCard type="birthday" name={profile.name} isPersonal={true} onAction={() => alert("Happy Birthday! 🎂")} />}
                {myAnniversary && <CelebrationCard type="anniversary" name={profile.name} detail={`${myAnniversary.yearsOfService} Year${myAnniversary.yearsOfService > 1 ? 's' : ''}`} isPersonal={true} onAction={() => alert("Congratulations! 🏆")} />}
                {upcomingShift && <CelebrationCard type="shift" name={`Shift ${upcomingShift.shiftType}`} detail={new Date(upcomingShift.effectiveFrom).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} isPersonal={true} onAction={() => { setModalType("shift"); setShowModal(true); }} />}
                {deptBirthdays.length > 0 && <CelebrationCard type="birthday" name={`${deptBirthdays.length} Colleague${deptBirthdays.length > 1 ? 's' : ''}`} detail="Birthday" onAction={() => { setModalType("birthday"); setShowModal(true); }} />}
                {deptAnniversaries.length > 0 && <CelebrationCard type="anniversary" name={`${deptAnniversaries.length} Colleague${deptAnniversaries.length > 1 ? 's' : ''}`} detail="Anniversary" onAction={() => { setModalType("anniversary"); setShowModal(true); }} />}
                {deptLeaves.length > 0 && <CelebrationCard type="leave" name={`${deptLeaves.length} Colleague${deptLeaves.length > 1 ? 's' : ''}`} detail="Leave" onAction={() => { setModalType("leave"); setShowModal(true); }} />}
              </div>
            </div>
          );
        })()}

      </div>

      {/* ─── PERSONAL BIRTHDAY POPUP ─── */}
      {showCelebrationPopup && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
            popupVisible ? "bg-black/40 backdrop-blur-sm" : "bg-black/0 pointer-events-none"
          }`}
          onClick={closeCelebrationPopup}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-white/50 bg-white transition-all duration-500 ease-out ${
              popupVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          >
            {popupVisible && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
                {["🎉", "✨", "🎊", "🎈", "⭐", "🎉", "✨", "🎈"].map((emoji, i) => (
                  <span
                    key={i}
                    className="absolute text-lg opacity-90"
                    style={{
                      left: `${8 + i * 12}%`,
                      top: "-10%",
                      animation: `confetti-fall 2.6s ease-in ${i * 0.18}s infinite`,
                    }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            )}

            <style>{`
              @keyframes confetti-fall {
                0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
                10% { opacity: 1; }
                100% { transform: translateY(340px) rotate(360deg); opacity: 0; }
              }
              @keyframes shine-sweep {
                0% { transform: translateX(-150%) rotate(20deg); }
                100% { transform: translateX(150%) rotate(20deg); }
              }
            `}</style>

            <div
              className={`relative h-32 flex items-center justify-center overflow-hidden ${
                popupType === "birthday"
                  ? "bg-gradient-to-br from-pink-500 via-rose-400 to-fuchsia-500"
                  : "bg-gradient-to-br from-amber-500 via-yellow-400 to-orange-500"
              }`}
            >
              <div
                className="absolute inset-y-0 w-1/3 bg-white/20"
                style={{ animation: "shine-sweep 2.5s ease-in-out infinite" }}
              ></div>

              <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-white/15"></div>
              <div className="absolute -bottom-6 -right-2 w-20 h-20 rounded-full bg-white/10"></div>
              <div className="absolute top-3 right-8 w-3 h-3 rounded-full bg-white/40"></div>
              <div className="absolute bottom-4 left-10 w-2 h-2 rounded-full bg-white/40"></div>

              <button
                onClick={closeCelebrationPopup}
                className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-white/25 hover:bg-white/40 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
              >
                <FiX size={15} />
              </button>

              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl ring-4 ring-white/30 animate-bounce">
                {popupType === "birthday" ? (
                  <span className="text-4xl">🎂</span>
                ) : (
                  <span className="text-4xl">🏆</span>
                )}
              </div>

              {isSinging && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-white font-medium">🎤 Singing...</span>
                </div>
              )}
            </div>

            <div className="relative px-6 pt-5 pb-6 text-center">
              <h3 className="text-2xl font-extrabold bg-gradient-to-r from-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
                {popupType === "birthday" ? "🎉 Happy Birthday! 🎉" : "🎊 Work Anniversary! 🎊"}
              </h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                {popupType === "birthday"
                  ? `Wishing you a wonderful day, ${popupFirstName}! Have a fantastic one 🎈`
                  : `Congrats on completing ${popupMyAnniversary?.yearsOfService || ""} year${popupMyAnniversary?.yearsOfService > 1 ? "s" : ""} with us, ${popupFirstName}! 🚀`}
              </p>

              <button
                onClick={closeCelebrationPopup}
                className={`mt-5 w-full py-2.5 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all ${
                  popupType === "birthday"
                    ? "bg-gradient-to-r from-pink-500 to-rose-500"
                    : "bg-gradient-to-r from-amber-500 to-orange-500"
                }`}
              >
                {isSinging ? "🎵 Listening..." : "Thanks! 🙌"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── COLLEAGUE BIRTHDAY POPUP ─── */}
      {showColleagueBirthdayPopup && colleagueBirthdayCount > 0 && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
            colleaguePopupVisible ? "bg-black/40 backdrop-blur-sm" : "bg-black/0 pointer-events-none"
          }`}
          onClick={closeColleaguePopup}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-white/50 bg-white transition-all duration-500 ease-out ${
              colleaguePopupVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          >
            {/* floating confetti */}
            {colleaguePopupVisible && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
                {["🎉", "🎊", "🎈", "🎁", "✨", "🎉", "🎊", "🎈"].map((emoji, i) => (
                  <span
                    key={i}
                    className="absolute text-lg opacity-80"
                    style={{
                      left: `${5 + i * 13}%`,
                      top: "-10%",
                      animation: `confetti-fall 2.8s ease-in ${i * 0.2}s infinite`,
                    }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            )}

            <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 h-28 flex items-center justify-center">
              <div className="absolute inset-0 bg-white/10"></div>
              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl">🎉</span>
                  <span className="text-white font-bold text-xl">Birthday Celebration</span>
                  <span className="text-4xl">🎉</span>
                </div>
                <p className="text-white/90 text-sm mt-1">
                  {colleagueBirthdayCount} Colleague{colleagueBirthdayCount > 1 ? 's' : ''} is celebrating today
                </p>
              </div>
              <button
                onClick={closeColleaguePopup}
                className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
              >
                <FiX size={14} />
              </button>
            </div>

            <div className="px-6 pt-4 pb-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <FiHeart className="text-pink-500 text-xl" />
                <span className="text-sm text-gray-600">
                  {colleagueNames.length === 1 
                    ? `${colleagueNames[0]} is celebrating today!` 
                    : `${colleagueNames.join(', ')} are celebrating today!`}
                </span>
                <FiHeart className="text-pink-500 text-xl" />
              </div>
              
              <p className="text-xs text-gray-500 mb-4">
                Send your warm wishes to your colleague{colleagueBirthdayCount > 1 ? 's' : ''}! 🎂
              </p>

              <button
                onClick={handleSendWish}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                <FiSend className="text-base" />
                SEND WISH
              </button>
              
              <button
                onClick={closeColleaguePopup}
                className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── PERFORMANCE ADVISORY POPUP ─── */}
      {showPerformancePopup && performanceData && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
            perfPopupVisible ? "bg-black/50 backdrop-blur-sm" : "bg-black/0 pointer-events-none"
          }`}
          onClick={closePerfPopup}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/50 bg-white transition-all duration-500 ease-out ${
              perfPopupVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          >
            <div className={`relative h-32 flex flex-col items-center justify-center text-white p-4 text-center ${
              (performanceData.performancePercentage || 0) >= 80 
                ? "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500" 
                : (performanceData.performancePercentage || 0) >= 60 
                  ? "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" 
                  : "bg-gradient-to-br from-amber-500 via-orange-500 to-red-500"
            }`}>
              <button
                onClick={closePerfPopup}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
              >
                <FiX size={16} />
              </button>
              
              <div className="text-4xl mb-1">
                {(performanceData.performancePercentage || 0) >= 80 ? "🏆" : (performanceData.performancePercentage || 0) >= 60 ? "✨" : "⚠️"}
              </div>
              <h3 className="font-bold text-lg leading-tight">Monthly Performance Review</h3>
              <p className="text-xs opacity-90">For the month of {new Date().toLocaleString('default', { month: 'long' })}</p>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 font-medium">Your Performance Score</p>
                <h4 className={`text-4xl font-extrabold mt-1 ${
                  (performanceData.performancePercentage || 0) >= 80 ? "text-emerald-500" : (performanceData.performancePercentage || 0) >= 60 ? "text-indigo-600" : "text-red-500"
                }`}>
                  {performanceData.performancePercentage || 0}%
                </h4>
                
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 uppercase tracking-wide ${
                  (performanceData.performancePercentage || 0) >= 80 
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200" 
                    : (performanceData.performancePercentage || 0) >= 60 
                      ? "bg-indigo-50 text-indigo-600 border border-indigo-200" 
                      : "bg-red-50 text-red-600 border border-red-200"
                }`}>
                  {(performanceData.performancePercentage || 0) >= 80 ? "Excellent" : (performanceData.performancePercentage || 0) >= 60 ? "Good" : "Needs Improvement"}
                </span>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed text-center">
                    {(performanceData.performancePercentage || 0) >= 80 && `Your performance is excellent this month! Good job, ${profile?.name?.split(" ")[0]}! Keep up the excellent work! 👍`}
                    {(performanceData.performancePercentage || 0) >= 60 && (performanceData.performancePercentage || 0) < 80 && `Your performance is good, ${profile?.name?.split(" ")[0]}! You are doing well, but there is still room for improvement. Let's aim higher! 💪`}
                    {(performanceData.performancePercentage || 0) < 60 && `Your performance is low this month. Need to improve your performance, ${profile?.name?.split(" ")[0]}. Please focus on improvement. ⚠️`}
                  </p>
                </div>

                {((performanceData.lateComingDays || 0) > 3 || (performanceData.absentDays || 0) > 2) && (
                  <div className="border border-red-100 bg-red-50/50 rounded-2xl p-4 space-y-2">
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1">
                      <FiAlertCircle size={14} /> Attention Needed
                    </p>
                    <ul className="list-disc pl-4 text-xs text-red-700 space-y-1 font-medium">
                      {(performanceData.lateComingDays || 0) > 3 && (
                        <li>You have checked in late {performanceData.lateComingDays} times this month. Please check-in on time to maintain discipline.</li>
                      )}
                      {(performanceData.absentDays || 0) > 2 && (
                        <li>You have been absent {performanceData.absentDays} days this month. Please try to maintain regular attendance.</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <button
                onClick={closePerfPopup}
                className={`w-full py-3 rounded-xl text-sm font-semibold text-white mt-6 shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 ${
                  (performanceData.performancePercentage || 0) >= 80 
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-600" 
                    : (performanceData.performancePercentage || 0) >= 60 
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-indigo-500/20 hover:from-indigo-600 hover:to-purple-600" 
                      : "bg-gradient-to-r from-amber-500 to-red-500 shadow-red-500/20 hover:from-amber-600 hover:to-red-600"
                }`}
              >
                Okay, Understood!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeDashboard;