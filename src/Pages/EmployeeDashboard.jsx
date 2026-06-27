// import axios from "axios";
// import { useEffect, useState } from "react";
// import {
//   FiAlertCircle,
//   FiCalendar,
//   FiCamera,
//   FiClock as FiHistory,
//   FiList,
//   FiUserX,
//   FiX,
//   FiCoffee,
//   FiCheckCircle,
//   FiTrendingUp,
//   FiChevronRight,
//   FiLogIn,
// } from "react-icons/fi";
// import { useLocation, useNavigate } from "react-router-dom";
// import { API_BASE_URL } from "../config";
// import { subscribeToPushNotifications } from "../utils/pushNotification";
// import CelebrationCard from "../Components/CelebrationCard";
// import "./EmployeeDashboard.css";

// // Recharts imports
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis
// } from 'recharts';

// // ✅ Helper function to format break minutes
// const formatBreakMinutes = (minutes) => {
//   if (!minutes || minutes === 0) return "-";
//   const hours = Math.floor(minutes / 60);
//   const mins = minutes % 60;
//   if (hours > 0) return `${hours}h ${mins}m`;
//   return `${mins}m`;
// };

// // ✅ Helper function to calculate total break minutes
// const calculateTotalBreakMinutes = (breaks) => {
//   if (!breaks || breaks.length === 0) return 0;
//   return breaks.reduce((total, b) => total + (b.breakMinutes || 0), 0);
// };

// const EmployeeDashboard = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const email = location.state?.email || localStorage.getItem("employeeEmail");
//   const [profile, setProfile] = useState(null);
//   const [assignedLocation, setAssignedLocation] = useState("Not Assigned");
//   const [shiftTiming, setShiftTiming] = useState("Not Assigned");

//   // Filter states
//   const getCurrentMonth = () => {
//     const d = new Date();
//     return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
//   };

//   const [lateDate, setLateDate] = useState("");
//   const [lateMonth, setLateMonth] = useState(getCurrentMonth());
//   const [absentDate, setAbsentDate] = useState("");
//   const [absentMonth, setAbsentMonth] = useState(getCurrentMonth());

//   // Employee specific stats
//   const [employeeStats, setEmployeeStats] = useState({
//     presentThisMonth: 0,
//     absentThisMonth: 0,
//     lateThisMonth: 0,
//     totalWorkingDays: 0
//   });

//   // Chart data states
//   const [lateChartData, setLateChartData] = useState([]);
//   const [absentChartData, setAbsentChartData] = useState([]);
//   const [allAttendance, setAllAttendance] = useState([]);
//   const [userAttendance, setUserAttendance] = useState([]);
//   const [birthdaysToday, setBirthdaysToday] = useState([]);
//   const [anniversariesToday, setAnniversariesToday] = useState([]);
//   const [leavesToday, setLeavesToday] = useState([]);
//   const [upcomingShift, setUpcomingShift] = useState(null);
//   const [currentShift, setCurrentShift] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [modalType, setModalType] = useState(""); // "birthday", "leave", or "shift"

//   useEffect(() => {
//     if (!email) return;

//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const BASE_URL = API_BASE_URL.replace(/\/api$/, "/");
//         const API_5000 = API_BASE_URL.replace(/\/api$/, "/");

//         // 1. Fetch Profile
//         const profileRes = await axios.get(`${BASE_URL}api/employees/get-employee?email=${email}`);
//         const profileData = profileRes.data.data || profileRes.data;
//         setProfile(profileData);

//         if (profileData) {
//           if (profileData._id) {
//             subscribeToPushNotifications(profileData._id);
//           }

//           const empId = profileData.employeeId;
//           const localStorageId = JSON.parse(localStorage.getItem("employeeData"))?.employeeId;
//           const targetId = empId || localStorageId;

//           // 2. Fetch All Attendance
//           const allAttRes = await axios.get(`${BASE_URL}api/attendance/allattendance`);
//           const allAttendanceData = Array.isArray(allAttRes.data) ? allAttRes.data :
//             allAttRes.data.records || allAttRes.data.allAttendance || [];
//           setAllAttendance(allAttendanceData);

//           // 3. Filter current user's attendance
//           const filteredAttendance = allAttendanceData.filter(record => {
//             const recordId = typeof record.employeeId === 'object' ?
//               record.employeeId?.employeeId : record.employeeId;
//             return recordId === targetId;
//           });
//           setUserAttendance(filteredAttendance);

//           // 4. Smart initialization: find the latest month THIS user has data for
//           let resolvedMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

//           if (filteredAttendance.length > 0) {
//             const validDates = filteredAttendance
//               .map(r => r.checkInTime ? new Date(r.checkInTime) : null)
//               .filter(d => d && !isNaN(d.getTime()));

//             if (validDates.length > 0) {
//               const latestDate = new Date(Math.max(...validDates));
//               resolvedMonth = `${latestDate.getFullYear()}-${String(latestDate.getMonth() + 1).padStart(2, '0')}`;
//             }
//           }

//           setLateMonth(resolvedMonth);
//           setAbsentMonth(resolvedMonth);
//           updateChartDataWithMonth(filteredAttendance, profileData, resolvedMonth);
//           calculateEmployeeStats(filteredAttendance, profileData);

//           // 5. Leaves Stats
//           const leaveRes = await axios.get(`${BASE_URL}api/leaves/employeeleaves/${targetId}`);
//           const pendingLeavesCount = leaveRes.data?.records?.filter(l => l.status === "pending").length || 0;
//           setEmployeeStats(prev => ({ ...prev, pendingLeaves: pendingLeavesCount }));

//           // 6. Permissions Stats
//           try {
//             const permRes = await axios.get(`${API_5000}api/permissions/my-permissions/${targetId}`);
//             const activePermsCount = permRes.data?.filter(p => p.status === "APPROVED").length || 0;
//             setEmployeeStats(prev => ({ ...prev, permissions: activePermsCount }));
//           } catch (e) {
//             console.warn("Permissions fetch failed", e);
//           }

//           // 7. Assigned Location
//           const fetchLocation = async (url) => {
//             const res = await axios.get(`${url}api/employees/mylocation/${targetId}`);
//             const data = res.data?.data || res.data;
//             if (data?.location?.name) return data.location.name;
//             return null;
//           };

//           try {
//             let locName = await fetchLocation(API_5000);
//             if (!locName && profileData.location?.name) locName = profileData.location.name;
//             setAssignedLocation(locName || "Not Assigned");
//           } catch (e) {
//             setAssignedLocation("Not Assigned");
//           }

//           // 8. Shift Timing & Upcoming Shift
//           try {
//             const shiftRes = await axios.get(`${API_5000}api/shifts/employee/${targetId}`);
//             const shiftData = shiftRes.data?.data || shiftRes.data;

//             if (shiftData?.startTime) {
//               setShiftTiming(`${shiftData.startTime} - ${shiftData.endTime}`);
//             } else if (shiftData?.employeeAssignment?.startTime) {
//               setShiftTiming(`${shiftData.employeeAssignment.startTime} - ${shiftData.employeeAssignment.endTime}`);
//             } else {
//               setShiftTiming("No Shift Assigned");
//             }

//             setCurrentShift(shiftData || null);

//             const scheduled = shiftData?.scheduledChange;
//             if (scheduled?.shiftType) {
//               setUpcomingShift({
//                 shiftType: scheduled.shiftType,
//                 shiftName: scheduled.shiftName || `Shift ${scheduled.shiftType}`,
//                 timeRange: scheduled.selectedTimeRange || "Not specified",
//                 description: scheduled.selectedDescription || "Shift timing",
//                 effectiveFrom: scheduled.effectiveFrom,
//                 shiftCategory: scheduled.shiftCategory || shiftData?.shiftCategory || "Regular",
//               });
//             } else {
//               setUpcomingShift(null);
//             }
//           } catch (e) {
//             setShiftTiming("Not Assigned");
//             setUpcomingShift(null);
//             setCurrentShift(null);
//           }

//           // 9. Fetch Birthdays
//           try {
//             const bdayRes = await axios.get(`${BASE_URL}api/employees/birthdays-today?department=${encodeURIComponent(profileData.department || "")}`);
//             setBirthdaysToday(bdayRes.data.data || []);
//           } catch (e) {
//             console.warn("Birthdays fetch failed", e);
//           }

//           // 10. Fetch Anniversaries
//           try {
//             const annivRes = await axios.get(`${BASE_URL}api/employees/anniversaries-today?department=${encodeURIComponent(profileData.department || "")}`);
//             setAnniversariesToday(annivRes.data.data || []);
//           } catch (e) {
//             console.warn("Anniversaries fetch failed", e);
//           }

//           // 11. Fetch Leaves Today
//           try {
//             const leaveTodayRes = await axios.get(`${BASE_URL}api/leaves/on-leave-today?department=${encodeURIComponent(profileData.department || "")}`);
//             setLeavesToday(leaveTodayRes.data.data || []);
//           } catch (e) {
//             console.warn("Leaves today fetch failed", e);
//           }

//           setLoading(false);
//         }
//       } catch (err) {
//         console.error("Dashboard data fetch error:", err);
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [email]);

//   const handleImageChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file || !profile?._id) return;

//     const formData = new FormData();
//     formData.append("profileImage", file);
//     formData.append("profile_image", file);
//     formData.append("image", file);

//     try {
//       setLoading(true);
//       const response = await axios.put(`${API_BASE_URL}/employees/update/${profile._id}`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });
      
//       const updatedData = response.data?.data || response.data?.employee || response.data;
      
//       if (updatedData) {
//         const refreshed = await axios.get(`${API_BASE_URL}/employees/get-employee?email=${profile.email}`);
//         const finalProfile = refreshed.data.data || refreshed.data;
//         setProfile(finalProfile);
        
//         const stored = localStorage.getItem("employeeData");
//         if (stored) {
//           const data = JSON.parse(stored);
//           const newImg = finalProfile.profileImage || finalProfile.profile_image || finalProfile.image;
//           if (newImg) data.profileImage = newImg;
//           localStorage.setItem("employeeData", JSON.stringify(data));
//         }
        
//         alert("✅ Profile image updated successfully!");
//       }
//     } catch (error) {
//       console.error("Error updating profile image:", error);
//       alert("❌ Failed to update profile image. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleImageDelete = async (e) => {
//     e?.stopPropagation();
//     if (!profile?._id || !window.confirm("Are you sure you want to remove your profile image?")) return;

//     try {
//       setLoading(true);
//       await axios.put(`${API_BASE_URL}/employees/update/${profile._id}`, {
//         profileImage: ""
//       });

//       setProfile(prev => ({ ...prev, profileImage: "" }));
      
//       const stored = localStorage.getItem("employeeData");
//       if (stored) {
//         const data = JSON.parse(stored);
//         data.profileImage = "";
//         localStorage.setItem("employeeData", JSON.stringify(data));
//       }
      
//       alert("✅ Profile image removed successfully!");
//     } catch (error) {
//       console.error("Error deleting profile image:", error);
//       alert("❌ Failed to remove profile image.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Calculate employee specific stats for selected month
//   const calculateEmployeeStats = (attendance, profileData) => {
//     if (!lateMonth) return;
//     const parts = lateMonth.split('-');
//     if (parts.length < 2) return;
//     const [year, month] = parts.map(Number);
//     if (isNaN(year) || isNaN(month)) return;

//     const daysInMonth = new Date(year, month, 0).getDate();
//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth() + 1;
    
//     let maxDayToCheck = daysInMonth;
//     if (year > currentYear || (year === currentYear && month > currentMonth)) {
//       maxDayToCheck = 0;
//     } else if (year === currentYear && month === currentMonth) {
//       maxDayToCheck = today.getDate();
//     }

//     const workingDays = [];
//     const workingDayMap = {};

//     for (let day = 1; day <= maxDayToCheck; day++) {
//       const date = new Date(year, month - 1, day);
//       const dayOfWeek = date.getDay();
//       if (dayOfWeek >= 1 && dayOfWeek <= 6) {
//         workingDays.push(day);
//         workingDayMap[day] = true;
//       }
//     }

//     const presentDays = new Set();
//     let lateDays = 0;

//     attendance.forEach(record => {
//       if (!record.checkInTime) return;

//       const recordDate = new Date(record.checkInTime);
//       if (recordDate.getMonth() + 1 !== month || recordDate.getFullYear() !== year) return;

//       const day = recordDate.getDate();

//       if (record.status === "present" || record.status === "checked-in") {
//         if (workingDayMap[day]) {
//           presentDays.add(day);
//         }

//         const shiftStart = getShiftStartTime(profileData?.shift || "D");
//         const [hours, minutes] = shiftStart.split(':').map(Number);
//         const shiftStartTime = new Date(recordDate);
//         shiftStartTime.setHours(hours, minutes, 0, 0);

//         const graceTime = new Date(shiftStartTime);
//         graceTime.setMinutes(graceTime.getMinutes() + 5);

//         if (recordDate > graceTime) {
//           lateDays++;
//         }
//       }
//     });

//     let absentDays = 0;
//     workingDays.forEach(day => {
//       if (!presentDays.has(day)) {
//         absentDays++;
//       }
//     });

//     setEmployeeStats({
//       presentThisMonth: presentDays.size,
//       absentThisMonth: absentDays,
//       lateThisMonth: lateDays,
//       totalWorkingDays: workingDays.length
//     });
//   };

//   // Update charts when filters change
//   useEffect(() => {
//     if (!profile || !allAttendance.length) return;

//     const targetId = profile.employeeId;
//     const userAttendance = allAttendance.filter(record => {
//       const recordId = typeof record.employeeId === 'object' ?
//         record.employeeId?.employeeId : record.employeeId;
//       return recordId === targetId;
//     });

//     updateChartData(userAttendance, profile);
//     calculateEmployeeStats(userAttendance, profile);
//   }, [lateMonth, absentMonth, lateDate, absentDate]);

//   const updateChartData = (userAttendance, profileData) => {
//     const lateAnalysis = analyzeLateDays(userAttendance, profileData);
//     const absentAnalysis = analyzeAbsentDays(userAttendance, profileData);
//     setLateChartData(lateAnalysis.chartData);
//     setAbsentChartData(absentAnalysis.chartData);
//   };

//   const updateChartDataWithMonth = (attendance, profileData, month) => {
//     const lateAnalysis = analyzeLateDaysForMonth(attendance, profileData, month, "");
//     const absentAnalysis = analyzeAbsentDaysForMonth(attendance, profileData, month, "");
//     setLateChartData(lateAnalysis.chartData);
//     setAbsentChartData(absentAnalysis.chartData);
//   };

//   const analyzeLateDays = (attendance, profileData) =>
//     analyzeLateDaysForMonth(attendance, profileData, lateMonth, lateDate);

//   const analyzeLateDaysForMonth = (attendance, profileData, theMonth, theDate) => {
//     if (!theMonth) return { chartData: [] };
//     const parts = theMonth.split('-');
//     if (parts.length < 2) return { chartData: [] };
//     const [year, month] = parts.map(Number);
//     if (isNaN(year) || isNaN(month)) return { chartData: [] };

//     const weeklyLate = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0, 'Week 5': 0 };

//     attendance.forEach(record => {
//       if (!record.checkInTime) return;
//       const recordDate = new Date(record.checkInTime);

//       if (theDate) {
//         if (recordDate.toISOString().split('T')[0] !== theDate) return;
//       } else {
//         if (recordDate.getFullYear() !== year || recordDate.getMonth() + 1 !== month) return;
//       }

//       const shiftStart = getShiftStartTime(profileData?.shift || "D");
//       const checkInTime = new Date(record.checkInTime);
//       const [hours, mins] = shiftStart.split(':').map(Number);
//       const shiftStartTime = new Date(checkInTime);
//       shiftStartTime.setHours(hours, mins, 0, 0);
//       const graceTime = new Date(shiftStartTime);
//       graceTime.setMinutes(graceTime.getMinutes() + 5);

//       if (checkInTime > graceTime) {
//         const lateMins = Math.floor((checkInTime - graceTime) / (1000 * 60));
//         const day = recordDate.getDate();
//         let weekNum = day <= 7 ? 1 : day <= 14 ? 2 : day <= 21 ? 3 : day <= 28 ? 4 : 5;
//         weeklyLate[`Week ${weekNum}`] += lateMins;
//       }
//     });

//     let chartData = Object.entries(weeklyLate).map(([week, minutes]) => ({ name: week, value: minutes, label: `${minutes} min` }));

//     if (theDate) {
//       chartData = chartData.filter(d => d.value > 0);
//       if (chartData.length === 0) chartData = [{ name: theDate, value: 0, label: '0 min' }];
//       else chartData[0].name = theDate;
//     }

//     return { chartData };
//   };

//   const analyzeAbsentDays = (attendance, profileData) =>
//     analyzeAbsentDaysForMonth(attendance, profileData, absentMonth, absentDate);

//   const analyzeAbsentDaysForMonth = (attendance, profileData, theMonth, theDate) => {
//     if (!theMonth) return { chartData: [] };
//     const parts = theMonth.split('-');
//     if (parts.length < 2) return { chartData: [] };
//     const [year, month] = parts.map(Number);
//     if (isNaN(year) || isNaN(month)) return { chartData: [] };

//     const daysInMonth = new Date(year, month, 0).getDate();
//     const today = new Date();
//     let maxDayToCheck = daysInMonth;
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth() + 1;
    
//     if (year > currentYear || (year === currentYear && month > currentMonth)) {
//       maxDayToCheck = 0;
//     } else if (year === currentYear && month === currentMonth) {
//       maxDayToCheck = today.getDate();
//     }

//     const workingDayMap = {};
//     const workingDays = [];
//     for (let day = 1; day <= maxDayToCheck; day++) {
//       const d = new Date(year, month - 1, day).getDay();
//       if (d >= 1 && d <= 6) { workingDayMap[day] = true; workingDays.push(day); }
//     }

//     const presentDays = new Set();
//     attendance.forEach(record => {
//       if (!record.checkInTime) return;
//       const recordDate = new Date(record.checkInTime);
//       if (theDate) {
//         if (recordDate.toISOString().split('T')[0] !== theDate) return;
//       } else {
//         if (recordDate.getFullYear() !== year || recordDate.getMonth() + 1 !== month) return;
//       }
//       if (record.status === "present" || record.status === "checked-in") {
//         const day = recordDate.getDate();
//         if (workingDayMap[day]) presentDays.add(day);
//       }
//     });

//     if (theDate) {
//       const selectedDate = new Date(theDate);
//       const dow = selectedDate.getDay();
//       if (dow >= 1 && dow <= 6) {
//         const day = selectedDate.getDate();
//         const isPresent = presentDays.has(day);
//         return { chartData: [{ name: theDate, value: isPresent ? 0 : 1, label: isPresent ? 'Present' : 'Absent' }] };
//       }
//       return { chartData: [] };
//     }

//     const weeklyAbsent = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0, 'Week 5': 0 };
//     workingDays.forEach(day => {
//       if (!presentDays.has(day)) {
//         const wk = day <= 7 ? 1 : day <= 14 ? 2 : day <= 21 ? 3 : day <= 28 ? 4 : 5;
//         weeklyAbsent[`Week ${wk}`]++;
//       }
//     });

//     const chartData = Object.entries(weeklyAbsent).map(([week, days]) => ({ name: week, value: days, label: `${days} day${days > 1 ? 's' : ''}` }));
//     return { chartData };
//   };

//   const getShiftStartTime = (shiftType) => {
//     const shiftTimes = {
//       "A": "10:00", "B": "14:00", "C": "18:00", "D": "09:00",
//       "E": "10:00", "F": "14:00", "G": "09:00", "H": "09:00",
//       "I": "07:00", "BR": "07:00"
//     };
//     return shiftTimes[shiftType] || "09:00";
//   };


//   const LateTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="px-3 py-2 text-xs bg-white border border-[#e4e7ec] rounded-lg shadow-md">
//           <p className="font-semibold text-[#101828]">{payload[0].payload.name}</p>
//           <p className="font-medium text-[#dc6803]">{payload[0].payload.label}</p>
//         </div>
//       );
//     }
//     return null;
//   };

//   const AbsentTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="px-3 py-2 text-xs bg-white border border-[#e4e7ec] rounded-lg shadow-md">
//           <p className="font-semibold text-[#101828]">{payload[0].payload.name}</p>
//           <p className="font-medium text-[#d92d20]">{payload[0].payload.label}</p>
//         </div>
//       );
//     }
//     return null;
//   };

//   const getGreeting = () => {
//     const hour = new Date().getHours();
//     if (hour >= 5 && hour < 12) return "Good morning";
//     if (hour >= 12 && hour < 17) return "Good afternoon";
//     if (hour >= 17 && hour < 21) return "Good evening";
//     return "Good evening";
//   };

//   const todayRecord = userAttendance.find((record) => {
//     if (!record.checkInTime) return false;
//     return new Date(record.checkInTime).toDateString() === new Date().toDateString();
//   });

//   const attendanceRate =
//     employeeStats.totalWorkingDays > 0
//       ? Math.round((employeeStats.presentThisMonth / employeeStats.totalWorkingDays) * 100)
//       : 0;

//   const formatTime = (value) =>
//     value
//       ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
//       : "—";

//   const monthLabel = new Date(`${lateMonth}-01`).toLocaleDateString("en-US", {
//     month: "long",
//     year: "numeric",
//   });

//   if (loading || !profile) {
//     return (
//       <div className="emp-dash">
//         <div className="emp-dash__loading">
//           <div className="emp-dash__spinner" />
//           <p className="emp-dash__loading-text">Loading your dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="emp-dash">
//       <main>
//         <div className="emp-dash__header">
//           <div>
//             <h1 className="emp-dash__greeting">
//               {getGreeting()}, <span>{profile.name.split(" ")[0]}</span>
//             </h1>
//             <p className="emp-dash__subtitle">
//               Track attendance, leaves, and your work schedule in one place.
//             </p>
//           </div>
//           <div className="emp-dash__date-pill">
//             <FiCalendar />
//             <span>
//               {new Date().toLocaleDateString("en-US", {
//                 weekday: "short",
//                 year: "numeric",
//                 month: "short",
//                 day: "numeric",
//               })}
//             </span>
//           </div>
//         </div>

//         <div className="emp-dash__stats">
//           <div className="emp-dash__stat">
//             <div className="emp-dash__stat-top">
//               <span className="emp-dash__stat-label">Present</span>
//               <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
//                 <FiCheckCircle />
//               </div>
//             </div>
//             <div className="emp-dash__stat-value">{employeeStats.presentThisMonth}</div>
//             <div className="emp-dash__stat-meta">days this month</div>
//           </div>
//           <div className="emp-dash__stat">
//             <div className="emp-dash__stat-top">
//               <span className="emp-dash__stat-label">Absent</span>
//               <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
//                 <FiUserX />
//               </div>
//             </div>
//             <div className="emp-dash__stat-value">{employeeStats.absentThisMonth}</div>
//             <div className="emp-dash__stat-meta">days this month</div>
//           </div>
//           <div className="emp-dash__stat">
//             <div className="emp-dash__stat-top">
//               <span className="emp-dash__stat-label">Late</span>
//               <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
//                 <FiHistory />
//               </div>
//             </div>
//             <div className="emp-dash__stat-value">{employeeStats.lateThisMonth}</div>
//             <div className="emp-dash__stat-meta">instances this month</div>
//           </div>
//           <div className="emp-dash__stat">
//             <div className="emp-dash__stat-top">
//               <span className="emp-dash__stat-label">Attendance</span>
//               <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
//                 <FiTrendingUp />
//               </div>
//             </div>
//             <div className="emp-dash__stat-value">{attendanceRate}%</div>
//             <div className="emp-dash__stat-meta">
//               of {employeeStats.totalWorkingDays} working days
//             </div>
//           </div>
//         </div>

//         <div className="emp-dash__today">
//           <div>
//             <div className="emp-dash__today-label">Today&apos;s Attendance</div>
//             <div className="emp-dash__today-status">
//               {todayRecord
//                 ? todayRecord.checkOutTime
//                   ? "Day completed"
//                   : "Currently checked in"
//                 : "Not checked in yet"}
//             </div>
//             <div className="emp-dash__today-times">
//               <div className="emp-dash__today-time-block">
//                 <span>Check In</span>
//                 <span>{formatTime(todayRecord?.checkInTime)}</span>
//               </div>
//               <div className="emp-dash__today-time-block">
//                 <span>Check Out</span>
//                 <span>{formatTime(todayRecord?.checkOutTime)}</span>
//               </div>
//               <div className="emp-dash__today-time-block">
//                 <span>Shift</span>
//                 <span>{shiftTiming}</span>
//               </div>
//             </div>
//           </div>
//           <button
//             type="button"
//             className="emp-dash__today-btn"
//             onClick={() => navigate("/attendance-capture")}
//           >
//             <FiLogIn />
//             {todayRecord && !todayRecord.checkOutTime ? "Check Out" : "Mark Attendance"}
//           </button>
//         </div>

//         {(() => {
//           const isMyBirthday = birthdaysToday.some(b => b.email === email);
//           const myAnniversary = anniversariesToday.find(a => a.email === email);
//           const deptBirthdays = birthdaysToday.filter(b => b.email !== email);
//           const deptAnniversaries = anniversariesToday.filter(a => a.email !== email);
//           const deptLeaves = leavesToday.filter(l => l.email !== email);

//           if (!isMyBirthday && !myAnniversary && !upcomingShift && deptBirthdays.length === 0 && deptAnniversaries.length === 0 && deptLeaves.length === 0) return null;

//           const totalEvents = (isMyBirthday ? 1 : 0) + (myAnniversary ? 1 : 0) + (upcomingShift ? 1 : 0) + (deptBirthdays.length > 0 ? 1 : 0) + (deptAnniversaries.length > 0 ? 1 : 0) + (deptLeaves.length > 0 ? 1 : 0);

//           const formatShiftDate = (dateValue) => {
//             if (!dateValue) return "soon";
//             return new Date(dateValue).toLocaleDateString("en-GB", {
//               day: "numeric",
//               month: "short",
//               year: "numeric",
//             });
//           };

//           return (
//             <div className="emp-dash__card emp-dash__celebrations">
//               <div className="emp-dash__celebrations-header emp-dash__card-header" style={{ borderBottom: "1px solid var(--ed-border-light)" }}>
//                 <h3 className="emp-dash__celebrations-title">
//                   <span className="emp-dash__celebrations-dot" />
//                   Updates &amp; Celebrations
//                 </h3>
//                 <span className="emp-dash__stat-meta">{totalEvents} update{totalEvents !== 1 ? "s" : ""}</span>
//               </div>
//               <div className="emp-dash__celebrations-grid emp-dash__card-body" style={{ paddingTop: "0.875rem" }}>
//                 {isMyBirthday && (
//                   <CelebrationCard 
//                     type="birthday"
//                     name={profile.name}
//                     isPersonal={true}
//                     onAction={() => alert("Happy Birthday! 🎂")}
//                   />
//                 )}
//                 {myAnniversary && (
//                   <CelebrationCard 
//                     type="anniversary"
//                     name={profile.name}
//                     detail={`${myAnniversary.yearsOfService} Year${myAnniversary.yearsOfService > 1 ? 's' : ''}`}
//                     isPersonal={true}
//                     onAction={() => alert("Congratulations! 🏆")}
//                   />
//                 )}
//                 {/* Upcoming Shift Change */}
//                 {upcomingShift && (
//                   <CelebrationCard
//                     type="shift"
//                     name={`Shift ${upcomingShift.shiftType}`}
//                     detail={formatShiftDate(upcomingShift.effectiveFrom)}
//                     isPersonal={true}
//                     onAction={() => { setModalType("shift"); setShowModal(true); }}
//                   />
//                 )}

//                 {/* Departmental Birthdays */}
//                 {deptBirthdays.length > 0 && (
//                   <CelebrationCard 
//                     type="birthday"
//                     name={`${deptBirthdays.length} Colleague${deptBirthdays.length > 1 ? 's' : ''}`}
//                     detail="Birthday"
//                     onAction={() => { setModalType("birthday"); setShowModal(true); }}
//                   />
//                 )}
//                 {deptAnniversaries.length > 0 && (
//                   <CelebrationCard 
//                     type="anniversary"
//                     name={`${deptAnniversaries.length} Colleague${deptAnniversaries.length > 1 ? 's' : ''}`}
//                     detail="Anniversary"
//                     onAction={() => { setModalType("anniversary"); setShowModal(true); }}
//                   />
//                 )}
//                 {deptLeaves.length > 0 && (
//                   <CelebrationCard 
//                     type="leave"
//                     name={`${deptLeaves.length} Colleague${deptLeaves.length > 1 ? 's' : ''}`}
//                     detail="Leave"
//                     onAction={() => { setModalType("leave"); setShowModal(true); }}
//                   />
//                 )}
//               </div>

//               {showModal && (
//                 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 emp-dash-modal animate-in fade-in duration-300">
//                   <div className={`emp-dash__modal-panel bg-white shadow-2xl animate-in zoom-in-95 duration-200 ${modalType === 'shift' ? 'max-w-sm rounded-xl' : 'max-w-md rounded-2xl'}`}>
//                     <div className={`flex items-center justify-between border-b flex-shrink-0 ${modalType === 'shift' ? 'px-3 py-2 border-slate-100' : 'p-4 border-gray-50'}`}>
//                       <h3 className={`font-semibold text-gray-800 ${modalType === 'shift' ? 'text-sm' : 'text-lg font-bold text-gray-700'}`}>
//                         {modalType === 'birthday' ? `Today's Birthdays` : 
//                          modalType === 'anniversary' ? `Work Anniversaries` :
//                          modalType === 'shift' ? `Upcoming Shift Change` :
//                          `Employees on Leave`}
//                       </h3>
//                       <button
//                         onClick={() => setShowModal(false)}
//                         className={`transition-all ${modalType === 'shift' ? 'p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg' : 'p-2 text-slate-500 hover:text-slate-500 hover:bg-white rounded-xl'}`}
//                       >
//                         <FiX className={modalType === 'shift' ? 'text-base' : 'text-xl'} />
//                       </button>
//                     </div>
//                     <div className={`emp-dash__modal-body ${modalType === 'shift' ? 'p-3' : 'p-2 max-h-[60vh]'}`}>
//                       {modalType === 'shift' && upcomingShift ? (
//                         <div className="space-y-2.5">
//                           <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-100">
//                             <span className="text-[10px] font-medium text-slate-500">Effective from</span>
//                             <span className="text-[11px] font-semibold text-slate-800">
//                               {formatShiftDate(upcomingShift.effectiveFrom)}
//                             </span>
//                           </div>

//                           <div className="overflow-hidden border rounded-lg border-slate-200">
//                             <div className="emp-dash__shift-compare">
//                               <div className="px-2.5 py-2">
//                                 <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Current</p>
//                                 <p className="text-[11px] font-semibold text-slate-800 leading-tight">
//                                   {currentShift?.shiftType ? `Shift ${currentShift.shiftType}` : "Not assigned"}
//                                 </p>
//                                 <p className="text-[10px] text-slate-500 truncate mt-0.5">
//                                   {currentShift?.shiftName || "—"}
//                                 </p>
//                                 <p className="text-[10px] font-medium text-emerald-600 mt-1 break-words">
//                                   {currentShift?.timeRange || shiftTiming}
//                                 </p>
//                               </div>

//                               <div className="emp-dash__shift-compare-arrow flex items-center justify-center px-1 border-x border-slate-100 bg-slate-50/80">
//                                 <span className="text-[10px] font-semibold text-slate-400">→</span>
//                               </div>

//                               <div className="px-2.5 py-2 bg-violet-50/40">
//                                 <p className="text-[9px] font-semibold uppercase tracking-wide text-violet-500 mb-1">Upcoming</p>
//                                 <p className="text-[11px] font-semibold text-slate-800 leading-tight">
//                                   Shift {upcomingShift.shiftType}
//                                 </p>
//                                 <p className="text-[10px] text-slate-500 truncate mt-0.5">
//                                   {upcomingShift.shiftName}
//                                 </p>
//                                 <p className="text-[10px] font-medium text-violet-600 mt-1 break-words">
//                                   {upcomingShift.timeRange}
//                                 </p>
//                               </div>
//                             </div>
//                           </div>

//                           {(upcomingShift.shiftCategory || upcomingShift.description) && (
//                             <p className="px-0.5 text-[10px] leading-snug text-slate-500">
//                               {[upcomingShift.shiftCategory, upcomingShift.description].filter(Boolean).join(" · ")}
//                             </p>
//                           )}
//                         </div>
//                       ) : (
//                       <div className="grid grid-cols-1 gap-2 p-2">
//                         {(modalType === 'birthday' ? deptBirthdays : modalType === 'anniversary' ? deptAnniversaries : deptLeaves).map((item, idx) => (
//                           <div key={idx} className="emp-dash__modal-item flex flex-col gap-3 p-4 bg-white/50 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm transition-all sm:flex-row sm:items-center sm:justify-between">
//                             <div className="flex items-center gap-4 min-w-0">
//                               <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm ${
//                                 modalType === 'birthday' ? 'bg-rose-100 text-rose-600' : 
//                                 modalType === 'anniversary' ? 'bg-blue-100 text-blue-700' :
//                                 'bg-amber-100 text-amber-600'
//                               }`}>
//                                 {(item.name || item.employeeName).split(' ').map(n => n[0]).join('')}
//                               </div>
//                               <div>
//                                 <h4 className="text-sm font-bold text-gray-900">{item.name || item.employeeName}</h4>
//                                 <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                                   {modalType === 'anniversary' ? `${item.yearsOfService} Year Celebration` : item.role || 'Team Member'}
//                                 </p>
//                               </div>
//                             </div>
//                             {(modalType === 'birthday' || modalType === 'anniversary') && (
//                               <button className={`w-full sm:w-auto px-3 py-1.5 bg-white border rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
//                                 modalType === 'birthday' ? 'text-rose-500 border-rose-100 hover:bg-rose-500 hover:text-gray-900' : 
//                                 'text-blue-700 border-emerald-100 hover:bg-blue-600 hover:text-gray-900'
//                               }`} onClick={() => alert(`Celebration wish sent to ${item.name}! 🎊`)}>
//                                 {modalType === 'birthday' ? 'Wish' : 'Celebrate'}
//                               </button>
//                             )}
//                             {modalType === 'leave' && (
//                               <div className="text-[9px] font-bold uppercase text-amber-600 bg-amber-100/50 px-2.5 py-1 rounded-lg">
//                                 {item.leaveType || 'On Leave'}
//                               </div>
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                       )}
//                     </div>
//                     <div className={`bg-white border-t border-gray-200 flex flex-shrink-0 ${modalType === 'shift' ? 'justify-between gap-2 px-3 py-2' : 'justify-end p-4'}`}>
//                       {modalType === 'shift' && (
//                         <button
//                           onClick={() => {
//                             setShowModal(false);
//                             navigate("/my-shift");
//                           }}
//                           className="px-3 py-1.5 text-[10px] font-semibold text-violet-700 border border-violet-200 rounded-md hover:bg-violet-50 transition-all"
//                         >
//                           View Schedule
//                         </button>
//                       )}
//                       <button
//                         onClick={() => setShowModal(false)}
//                         className={`bg-gray-100 text-xs font-bold transition-all shadow-md shadow-gray-200 ${modalType === 'shift' ? 'px-3 py-1.5 text-[10px] text-gray-700 font-semibold hover:bg-gray-200 rounded-md ml-auto' : 'px-5 py-2 text-gray-900 rounded-lg hover:bg-gray-100'}`}
//                       >
//                         Close
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         })()}

//         <div className="emp-dash__grid">
//           <aside className="emp-dash__sidebar">
//             <div className="emp-dash__card">
//               <div className="emp-dash__profile">
//                 <div className="emp-dash__avatar-wrap">
//                   {(() => {
//                     const imgPath = profile.profileImage || profile.profile_image || profile.image;
//                     const name = profile.name || "User";
//                     const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
//                     if (imgPath) {
//                       const fullUrl = imgPath.startsWith("http")
//                         ? imgPath
//                         : `${API_BASE_URL.replace(/\/api$/, "")}/${imgPath.replace(/^\/+/, "")}`;
//                       return (
//                         <img
//                           src={`${fullUrl}${fullUrl.includes("?") ? "&" : "?"}t=${new Date().getTime()}`}
//                           alt={name}
//                           className="emp-dash__avatar"
//                           onError={(e) => {
//                             e.target.onerror = null;
//                             e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=eff4ff&color=175cd3&bold=true&size=128`;
//                           }}
//                         />
//                       );
//                     }
//                     return <div className="emp-dash__avatar-fallback">{initials}</div>;
//                   })()}
//                   <label htmlFor="profileImageUpload" className="emp-dash__avatar-edit">
//                     <FiCamera />
//                   </label>
//                   <input id="profileImageUpload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
//                   {profile.profileImage && (
//                     <button
//                       type="button"
//                       onClick={handleImageDelete}
//                       className="absolute top-0 right-0 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center text-red-500 hover:bg-red-50"
//                     >
//                       <FiX size={12} />
//                     </button>
//                   )}
//                 </div>
//                 <h2 className="emp-dash__name">{profile.name}</h2>
//                 <span className="emp-dash__role">{profile.department || profile.role || "Team Member"}</span>
//                 <p className="emp-dash__emp-id">ID: {profile.employeeId}</p>
//               </div>
//               <div className="emp-dash__card-body" style={{ paddingTop: 0 }}>
//                 <div className="emp-dash__detail-row">
//                   <span className="emp-dash__detail-label">Status</span>
//                   <span className="emp-dash__status-badge">
//                     <span className="emp-dash__status-dot" />
//                     Active
//                   </span>
//                 </div>
//                 <div className="emp-dash__detail-row">
//                   <span className="emp-dash__detail-label">Location</span>
//                   <span className="emp-dash__detail-value">{assignedLocation}</span>
//                 </div>
//                 <div className="emp-dash__detail-row">
//                   <span className="emp-dash__detail-label">Work Shift</span>
//                   <span className="emp-dash__detail-value">{shiftTiming}</span>
//                 </div>
//                 <div className="emp-dash__detail-row">
//                   <span className="emp-dash__detail-label">Join Date</span>
//                   <span className="emp-dash__detail-value">
//                     {profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : "—"}
//                   </span>
//                 </div>
//                 <button type="button" className="emp-dash__btn-outline" onClick={() => navigate("/myattendance")}>
//                   View Attendance Report
//                 </button>
//                 <button type="button" className="emp-dash__btn-primary-sm" onClick={() => navigate("/emp-profile")}>
//                   View Full Profile
//                 </button>
//               </div>
//             </div>

//             <div className="emp-dash__card">
//               <div className="emp-dash__card-header">
//                 <div>
//                   <h3 className="emp-dash__card-title">Quick Actions</h3>
//                   <p className="emp-dash__card-desc">Common tasks at a glance</p>
//                 </div>
//               </div>
//               <div className="emp-dash__card-body">
//                 <div className="emp-dash__actions">
//                   <QuickAction
//                     icon={<FiCamera />}
//                     title="Mark Attendance"
//                     desc="Check in or out"
//                     primary
//                     onClick={() => navigate("/attendance-capture")}
//                   />
//                   <QuickAction
//                     icon={<FiHistory />}
//                     title="Attendance History"
//                     desc="View past records"
//                     onClick={() => navigate("/myattendance")}
//                   />
//                   <QuickAction
//                     icon={<FiList />}
//                     title="Permission Request"
//                     desc="Short leave / permission"
//                     onClick={() => navigate("/mypermissions")}
//                   />
//                   <QuickAction
//                     icon={<FiCalendar />}
//                     title="Leave Management"
//                     desc="Apply or track leaves"
//                     onClick={() => navigate("/myleaves")}
//                   />
//                 </div>
//               </div>
//             </div>
//           </aside>

//           <div className="emp-dash__main">
//             <div className="emp-dash__charts-grid">
//               <div className="emp-dash__card">
//                 <div className="emp-dash__card-header">
//                   <div>
//                     <h3 className="emp-dash__card-title">Late Minutes by Week</h3>
//                     <p className="emp-dash__card-desc">{monthLabel}</p>
//                   </div>
//                   <input
//                     type="month"
//                     value={lateMonth}
//                     onChange={(e) => {
//                       setLateMonth(e.target.value);
//                       setLateDate("");
//                     }}
//                     className="emp-dash__month-input"
//                   />
//                 </div>
//                 <div className="emp-dash__card-body">
//                   <div className="emp-dash__chart-wrap">
//                     {lateChartData.some(d => d.value > 0) || lateDate ? (
//                       <ResponsiveContainer width="100%" height="100%">
//                         <BarChart data={lateChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f1f3" />
//                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#667085", fontWeight: 500 }} />
//                           <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#667085" }} domain={[0, "dataMax + 10"]} />
//                           <Tooltip content={<LateTooltip />} cursor={{ fill: "#f9fafb" }} />
//                           <Bar dataKey="value" fill="#dc6803" radius={[6, 6, 0, 0]} barSize={36} />
//                         </BarChart>
//                       </ResponsiveContainer>
//                     ) : (
//                       <div className="emp-dash__empty-chart">
//                         <FiAlertCircle />
//                         <p>No late records for this period</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <div className="emp-dash__card">
//                 <div className="emp-dash__card-header">
//                   <div>
//                     <h3 className="emp-dash__card-title">Absent Days by Week</h3>
//                     <p className="emp-dash__card-desc">{monthLabel}</p>
//                   </div>
//                   <input
//                     type="month"
//                     value={absentMonth}
//                     onChange={(e) => {
//                       setAbsentMonth(e.target.value);
//                       setAbsentDate("");
//                     }}
//                     className="emp-dash__month-input"
//                   />
//                 </div>
//                 <div className="emp-dash__card-body">
//                   <div className="emp-dash__chart-wrap">
//                     {absentChartData.some(d => d.value > 0) || absentDate ? (
//                       <ResponsiveContainer width="100%" height="100%">
//                         <BarChart data={absentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f1f3" />
//                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#667085" }} />
//                           <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#667085" }} domain={[0, "dataMax + 1"]} allowDecimals={false} />
//                           <Tooltip content={<AbsentTooltip />} cursor={{ fill: "#f9fafb" }} />
//                           <Bar dataKey="value" fill="#d92d20" radius={[6, 6, 0, 0]} barSize={36} />
//                         </BarChart>
//                       </ResponsiveContainer>
//                     ) : (
//                       <div className="emp-dash__empty-chart">
//                         <FiUserX />
//                         <p>No absent records for this period</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="emp-dash__card">
//               <div className="emp-dash__card-header">
//                 <div>
//                   <h3 className="emp-dash__card-title">Recent Attendance</h3>
//                   <p className="emp-dash__card-desc">Your latest check-in activity</p>
//                 </div>
//                 <button type="button" className="emp-dash__card-link" onClick={() => navigate("/myattendance")}>
//                   View all <FiChevronRight />
//                 </button>
//               </div>
//               <div className="emp-dash__table-wrap">
//                 <table className="emp-dash__table">
//                   <thead>
//                     <tr>
//                       <th>Date</th>
//                       <th>Check In</th>
//                       <th>Check Out</th>
//                       <th>Break</th>
//                       <th>Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {userAttendance.slice(0, 5).map((record, index) => {
//                       const breakMinutes = record.totalBreakMinutes || calculateTotalBreakMinutes(record.breaks);
//                       const breakReason = record.breaks && record.breaks.length > 0 ? record.breaks[0].reason : null;
//                       const isPresent = record.status === "present" || record.status === "checked-in";
//                       return (
//                         <tr key={index}>
//                           <td>{new Date(record.checkInTime).toLocaleDateString()}</td>
//                           <td>{formatTime(record.checkInTime)}</td>
//                           <td>{formatTime(record.checkOutTime)}</td>
//                           <td>
//                             {breakMinutes > 0 ? (
//                               <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#dc6803" }}>
//                                 <FiCoffee />
//                                 {formatBreakMinutes(breakMinutes)}
//                                 {breakReason && <span style={{ color: "#98a2b3", fontSize: "0.6875rem" }}>({breakReason})</span>}
//                               </span>
//                             ) : (
//                               "—"
//                             )}
//                           </td>
//                           <td style={{ textAlign: "right" }}>
//                             <span className={`emp-dash__table-status ${isPresent ? "emp-dash__table-status--present" : "emp-dash__table-status--other"}`}>
//                               {record.status === "checked-in" ? "Checked In" : record.status === "present" ? "Present" : record.status}
//                             </span>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                     {userAttendance.length === 0 && (
//                       <tr>
//                         <td colSpan="5" style={{ textAlign: "center", padding: "2.5rem", color: "#98a2b3" }}>
//                           No recent attendance activity found.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>

//               <div className="emp-dash__mobile-list">
//                 {userAttendance.slice(0, 5).map((record, index) => {
//                   const breakMinutes = record.totalBreakMinutes || calculateTotalBreakMinutes(record.breaks);
//                   const breakReason = record.breaks && record.breaks.length > 0 ? record.breaks[0].reason : null;
//                   const isPresent = record.status === "present" || record.status === "checked-in";
//                   return (
//                     <div key={index} className="emp-dash__mobile-item">
//                       <div className="emp-dash__mobile-item-top">
//                         <span className="emp-dash__mobile-date">
//                           {new Date(record.checkInTime).toLocaleDateString()}
//                         </span>
//                         <span className={`emp-dash__table-status ${isPresent ? "emp-dash__table-status--present" : "emp-dash__table-status--other"}`}>
//                           {record.status === "checked-in" ? "Checked In" : record.status === "present" ? "Present" : record.status}
//                         </span>
//                       </div>
//                       <div className="emp-dash__mobile-grid">
//                         <div className="emp-dash__mobile-field">
//                           <span>Check In</span>
//                           <span>{formatTime(record.checkInTime)}</span>
//                         </div>
//                         <div className="emp-dash__mobile-field">
//                           <span>Check Out</span>
//                           <span>{formatTime(record.checkOutTime)}</span>
//                         </div>
//                         <div className="emp-dash__mobile-field">
//                           <span>Break</span>
//                           <span>
//                             {breakMinutes > 0 ? (
//                               <>
//                                 <FiCoffee style={{ display: "inline", marginRight: "0.25rem", verticalAlign: "middle" }} />
//                                 {formatBreakMinutes(breakMinutes)}
//                                 {breakReason ? ` (${breakReason})` : ""}
//                               </>
//                             ) : (
//                               "—"
//                             )}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//                 {userAttendance.length === 0 && (
//                   <div className="emp-dash__mobile-empty">No recent attendance activity found.</div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// const QuickAction = ({ icon, title, desc, primary, onClick }) => (
//   <button
//     type="button"
//     onClick={onClick}
//     className={`emp-dash__action ${primary ? "emp-dash__action--primary" : ""}`}
//   >
//     <div className="emp-dash__action-icon">{icon}</div>
//     <div>
//       <div className="emp-dash__action-title">{title}</div>
//       <div className="emp-dash__action-desc">{desc}</div>
//     </div>
//   </button>
// );

// export default EmployeeDashboard;



// import axios from "axios";
// import { useEffect, useState } from "react";
// import {
//   FiAlertCircle,
//   FiCalendar,
//   FiCamera,
//   FiClock as FiHistory,
//   FiList,
//   FiUserX,
//   FiX,
//   FiInfo,
//   FiTrash2,
//   FiPlus,
//   FiCheckCircle,
//   FiTrendingUp,
//   FiLogIn,
//   FiChevronRight

// } from "react-icons/fi";
// import { useLocation, useNavigate } from "react-router-dom";
// import { API_BASE_URL } from "../config";
// import { subscribeToPushNotifications } from "../utils/pushNotification";
// import { FaBirthdayCake, FaGift, FaSmile, FaAward } from "react-icons/fa";
// import CelebrationCard from "../Components/CelebrationCard";

// // Recharts imports
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   Cell,
//   Pie,
//   PieChart,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis
// } from 'recharts';

// const EmployeeDashboard = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const email = location.state?.email || localStorage.getItem("employeeEmail");
//   const [profile, setProfile] = useState(null);
//   const [assignedLocation, setAssignedLocation] = useState("Not Assigned");
//   const [shiftTiming, setShiftTiming] = useState("Not Assigned");

//   // Filter states
//   const getCurrentMonth = () => {
//     const d = new Date();
//     return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
//   };

//   const [lateDate, setLateDate] = useState("");
//   const [lateMonth, setLateMonth] = useState(getCurrentMonth());
//   const [absentDate, setAbsentDate] = useState("");
//   const [absentMonth, setAbsentMonth] = useState(getCurrentMonth());

//   // Employee specific stats
//   const [employeeStats, setEmployeeStats] = useState({
//     presentThisMonth: 0,
//     absentThisMonth: 0,
//     lateThisMonth: 0,
//     totalWorkingDays: 0
//   });

//   // Chart data states
//   const [lateChartData, setLateChartData] = useState([]);
//   const [absentChartData, setAbsentChartData] = useState([]);
//   const [allAttendance, setAllAttendance] = useState([]);
//   const [userAttendance, setUserAttendance] = useState([]);
//   const [birthdaysToday, setBirthdaysToday] = useState([]);
//   const [anniversariesToday, setAnniversariesToday] = useState([]);
//   const [leavesToday, setLeavesToday] = useState([]);
//   const [upcomingShift, setUpcomingShift] = useState(null);
//   const [currentShift, setCurrentShift] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [modalType, setModalType] = useState("");

//   useEffect(() => {
//     if (!email) return;

//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const BASE_URL = API_BASE_URL.replace(/\/api$/, "/");
//         const API_5000 = API_BASE_URL.replace(/\/api$/, "/");

//         // 1. Fetch Profile
//         const profileRes = await axios.get(`${BASE_URL}api/employees/get-employee?email=${email}`);
//         const profileData = profileRes.data.data || profileRes.data;
//         setProfile(profileData);

//         if (profileData) {
//           if (profileData._id) {
//             subscribeToPushNotifications(profileData._id);
//           }

//           const empId = profileData.employeeId;
//           const localStorageId = JSON.parse(localStorage.getItem("employeeData"))?.employeeId;
//           const targetId = empId || localStorageId;

//           // 2. Fetch All Attendance
//           const allAttRes = await axios.get(`${BASE_URL}api/attendance/allattendance`);
//           const allAttendanceData = Array.isArray(allAttRes.data) ? allAttRes.data :
//             allAttRes.data.records || allAttRes.data.allAttendance || [];
//           setAllAttendance(allAttendanceData);

//           // 3. Filter current user's attendance
//           const filteredAttendance = allAttendanceData.filter(record => {
//             const recordId = typeof record.employeeId === 'object' ?
//               record.employeeId?.employeeId : record.employeeId;
//             return recordId === targetId;
//           });
//           setUserAttendance(filteredAttendance);

//           // 4. Smart initialization: find the latest month THIS user has data for
//           let resolvedMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

//           if (filteredAttendance.length > 0) {
//             const validDates = filteredAttendance
//               .map(r => r.checkInTime ? new Date(r.checkInTime) : null)
//               .filter(d => d && !isNaN(d.getTime()));

//             if (validDates.length > 0) {
//               const latestDate = new Date(Math.max(...validDates));
//               resolvedMonth = `${latestDate.getFullYear()}-${String(latestDate.getMonth() + 1).padStart(2, '0')}`;
//             }
//           }

//           setLateMonth(resolvedMonth);
//           setAbsentMonth(resolvedMonth);
//           updateChartDataWithMonth(filteredAttendance, profileData, resolvedMonth);
//           calculateEmployeeStats(filteredAttendance, profileData);

//           // 5. Leaves Stats
//           const leaveRes = await axios.get(`${BASE_URL}api/leaves/employeeleaves/${targetId}`);
//           const pendingLeavesCount = leaveRes.data?.records?.filter(l => l.status === "pending").length || 0;
//           setEmployeeStats(prev => ({ ...prev, pendingLeaves: pendingLeavesCount }));

//           // 6. Permissions Stats
//           try {
//             const permRes = await axios.get(`${API_5000}api/permissions/my-permissions/${targetId}`);
//             const activePermsCount = permRes.data?.filter(p => p.status === "APPROVED").length || 0;
//             setEmployeeStats(prev => ({ ...prev, permissions: activePermsCount }));
//           } catch (e) {
//             console.warn("Permissions fetch failed", e);
//           }

//           // 7. Assigned Location
//           const fetchLocation = async (url) => {
//             const res = await axios.get(`${url}api/employees/mylocation/${targetId}`);
//             const data = res.data?.data || res.data;
//             if (data?.location?.name) return data.location.name;
//             return null;
//           };

//           try {
//             let locName = await fetchLocation(API_5000);
//             if (!locName && profileData.location?.name) locName = profileData.location.name;
//             setAssignedLocation(locName || "Not Assigned");
//           } catch (e) {
//             setAssignedLocation("Not Assigned");
//           }

//           // 8. Shift Timing & Upcoming Shift
//           try {
//             const shiftRes = await axios.get(`${API_5000}api/shifts/employee/${targetId}`);
//             const shiftData = shiftRes.data?.data || shiftRes.data;

//             if (shiftData?.startTime) {
//               setShiftTiming(`${shiftData.startTime} - ${shiftData.endTime}`);
//             } else if (shiftData?.employeeAssignment?.startTime) {
//               setShiftTiming(`${shiftData.employeeAssignment.startTime} - ${shiftData.employeeAssignment.endTime}`);
//             } else {
//               setShiftTiming("No Shift Assigned");
//             }

//             setCurrentShift(shiftData || null);

//             const scheduled = shiftData?.scheduledChange;
//             if (scheduled?.shiftType) {
//               setUpcomingShift({
//                 shiftType: scheduled.shiftType,
//                 shiftName: scheduled.shiftName || `Shift ${scheduled.shiftType}`,
//                 timeRange: scheduled.selectedTimeRange || "Not specified",
//                 description: scheduled.selectedDescription || "Shift timing",
//                 effectiveFrom: scheduled.effectiveFrom,
//                 shiftCategory: scheduled.shiftCategory || shiftData?.shiftCategory || "Regular",
//               });
//             } else {
//               setUpcomingShift(null);
//             }
//           } catch (e) {
//             setShiftTiming("Not Assigned");
//             setUpcomingShift(null);
//             setCurrentShift(null);
//           }

//           // 9. Fetch Birthdays
//           try {
//             const bdayRes = await axios.get(`${BASE_URL}api/employees/birthdays-today?department=${encodeURIComponent(profileData.department || "")}`);
//             setBirthdaysToday(bdayRes.data.data || []);
//           } catch (e) {
//             console.warn("Birthdays fetch failed", e);
//           }

//           // 10. Fetch Anniversaries
//           try {
//             const annivRes = await axios.get(`${BASE_URL}api/employees/anniversaries-today?department=${encodeURIComponent(profileData.department || "")}`);
//             setAnniversariesToday(annivRes.data.data || []);
//           } catch (e) {
//             console.warn("Anniversaries fetch failed", e);
//           }

//           // 11. Fetch Leaves Today
//           try {
//             const leaveTodayRes = await axios.get(`${BASE_URL}api/leaves/on-leave-today?department=${encodeURIComponent(profileData.department || "")}`);
//             setLeavesToday(leaveTodayRes.data.data || []);
//           } catch (e) {
//             console.warn("Leaves today fetch failed", e);
//           }

//           setLoading(false);
//         }
//       } catch (err) {
//         console.error("Dashboard data fetch error:", err);
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [email]);

//   const handleImageChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file || !profile?._id) return;

//     const formData = new FormData();
//     formData.append("profileImage", file);
//     formData.append("profile_image", file);
//     formData.append("image", file);

//     try {
//       setLoading(true);
//       const response = await axios.put(`${API_BASE_URL}/employees/update/${profile._id}`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });
      
//       const updatedData = response.data?.data || response.data?.employee || response.data;
      
//       if (updatedData) {
//         const refreshed = await axios.get(`${API_BASE_URL}/employees/get-employee?email=${profile.email}`);
//         const finalProfile = refreshed.data.data || refreshed.data;
//         setProfile(finalProfile);
        
//         const stored = localStorage.getItem("employeeData");
//         if (stored) {
//           const data = JSON.parse(stored);
//           const newImg = finalProfile.profileImage || finalProfile.profile_image || finalProfile.image;
//           if (newImg) data.profileImage = newImg;
//           localStorage.setItem("employeeData", JSON.stringify(data));
//         }
        
//         alert("✅ Profile image updated successfully!");
//       }
//     } catch (error) {
//       console.error("Error updating profile image:", error);
//       alert("❌ Failed to update profile image. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleImageDelete = async (e) => {
//     e?.stopPropagation();
//     if (!profile?._id || !window.confirm("Are you sure you want to remove your profile image?")) return;

//     try {
//       setLoading(true);
//       await axios.put(`${API_BASE_URL}/employees/update/${profile._id}`, {
//         profileImage: ""
//       });

//       setProfile(prev => ({ ...prev, profileImage: "" }));
      
//       const stored = localStorage.getItem("employeeData");
//       if (stored) {
//         const data = JSON.parse(stored);
//         data.profileImage = "";
//         localStorage.setItem("employeeData", JSON.stringify(data));
//       }
      
//       alert("✅ Profile image removed successfully!");
//     } catch (error) {
//       console.error("Error deleting profile image:", error);
//       alert("❌ Failed to remove profile image.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Calculate employee specific stats for selected month
//   const calculateEmployeeStats = (attendance, profileData) => {
//     if (!lateMonth) return;
//     const parts = lateMonth.split('-');
//     if (parts.length < 2) return;
//     const [year, month] = parts.map(Number);
//     if (isNaN(year) || isNaN(month)) return;

//     const daysInMonth = new Date(year, month, 0).getDate();
//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth() + 1;
    
//     let maxDayToCheck = daysInMonth;
//     if (year > currentYear || (year === currentYear && month > currentMonth)) {
//       maxDayToCheck = 0;
//     } else if (year === currentYear && month === currentMonth) {
//       maxDayToCheck = today.getDate();
//     }

//     const workingDays = [];
//     const workingDayMap = {};

//     for (let day = 1; day <= maxDayToCheck; day++) {
//       const date = new Date(year, month - 1, day);
//       const dayOfWeek = date.getDay();
//       if (dayOfWeek >= 1 && dayOfWeek <= 6) {
//         workingDays.push(day);
//         workingDayMap[day] = true;
//       }
//     }

//     const presentDays = new Set();
//     let lateDays = 0;

//     attendance.forEach(record => {
//       if (!record.checkInTime) return;

//       const recordDate = new Date(record.checkInTime);
//       if (recordDate.getMonth() + 1 !== month || recordDate.getFullYear() !== year) return;

//       const day = recordDate.getDate();

//       if (record.status === "present" || record.status === "checked-in") {
//         if (workingDayMap[day]) {
//           presentDays.add(day);
//         }

//         const shiftStart = getShiftStartTime(profileData?.shift || "D");
//         const [hours, minutes] = shiftStart.split(':').map(Number);
//         const shiftStartTime = new Date(recordDate);
//         shiftStartTime.setHours(hours, minutes, 0, 0);

//         const graceTime = new Date(shiftStartTime);
//         graceTime.setMinutes(graceTime.getMinutes() + 5);

//         if (recordDate > graceTime) {
//           lateDays++;
//         }
//       }
//     });

//     let absentDays = 0;
//     workingDays.forEach(day => {
//       if (!presentDays.has(day)) {
//         absentDays++;
//       }
//     });

//     setEmployeeStats({
//       presentThisMonth: presentDays.size,
//       absentThisMonth: absentDays,
//       lateThisMonth: lateDays,
//       totalWorkingDays: workingDays.length
//     });
//   };

//   // Update charts when filters change
//   useEffect(() => {
//     if (!profile || !allAttendance.length) return;

//     const targetId = profile.employeeId;
//     const userAttendance = allAttendance.filter(record => {
//       const recordId = typeof record.employeeId === 'object' ?
//         record.employeeId?.employeeId : record.employeeId;
//       return recordId === targetId;
//     });

//     updateChartData(userAttendance, profile);
//     calculateEmployeeStats(userAttendance, profile);
//   }, [lateMonth, absentMonth, lateDate, absentDate]);

//   const updateChartData = (userAttendance, profileData) => {
//     const lateAnalysis = analyzeLateDays(userAttendance, profileData);
//     const absentAnalysis = analyzeAbsentDays(userAttendance, profileData);
//     setLateChartData(lateAnalysis.chartData);
//     setAbsentChartData(absentAnalysis.chartData);
//   };

//   const updateChartDataWithMonth = (attendance, profileData, month) => {
//     const lateAnalysis = analyzeLateDaysForMonth(attendance, profileData, month, "");
//     const absentAnalysis = analyzeAbsentDaysForMonth(attendance, profileData, month, "");
//     setLateChartData(lateAnalysis.chartData);
//     setAbsentChartData(absentAnalysis.chartData);
//   };

//   const analyzeLateDays = (attendance, profileData) =>
//     analyzeLateDaysForMonth(attendance, profileData, lateMonth, lateDate);

//   const analyzeLateDaysForMonth = (attendance, profileData, theMonth, theDate) => {
//     if (!theMonth) return { chartData: [] };
//     const parts = theMonth.split('-');
//     if (parts.length < 2) return { chartData: [] };
//     const [year, month] = parts.map(Number);
//     if (isNaN(year) || isNaN(month)) return { chartData: [] };

//     const weeklyLate = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0, 'Week 5': 0 };

//     attendance.forEach(record => {
//       if (!record.checkInTime) return;
//       const recordDate = new Date(record.checkInTime);

//       if (theDate) {
//         if (recordDate.toISOString().split('T')[0] !== theDate) return;
//       } else {
//         if (recordDate.getFullYear() !== year || recordDate.getMonth() + 1 !== month) return;
//       }

//       const shiftStart = getShiftStartTime(profileData?.shift || "D");
//       const checkInTime = new Date(record.checkInTime);
//       const [hours, mins] = shiftStart.split(':').map(Number);
//       const shiftStartTime = new Date(checkInTime);
//       shiftStartTime.setHours(hours, mins, 0, 0);
//       const graceTime = new Date(shiftStartTime);
//       graceTime.setMinutes(graceTime.getMinutes() + 5);

//       if (checkInTime > graceTime) {
//         const lateMins = Math.floor((checkInTime - graceTime) / (1000 * 60));
//         const day = recordDate.getDate();
//         let weekNum = day <= 7 ? 1 : day <= 14 ? 2 : day <= 21 ? 3 : day <= 28 ? 4 : 5;
//         weeklyLate[`Week ${weekNum}`] += lateMins;
//       }
//     });

//     let chartData = Object.entries(weeklyLate).map(([week, minutes]) => ({ name: week, value: minutes, label: `${minutes} min` }));

//     if (theDate) {
//       chartData = chartData.filter(d => d.value > 0);
//       if (chartData.length === 0) chartData = [{ name: theDate, value: 0, label: '0 min' }];
//       else chartData[0].name = theDate;
//     }

//     return { chartData };
//   };

//   const analyzeAbsentDays = (attendance, profileData) =>
//     analyzeAbsentDaysForMonth(attendance, profileData, absentMonth, absentDate);

//   const analyzeAbsentDaysForMonth = (attendance, profileData, theMonth, theDate) => {
//     if (!theMonth) return { chartData: [] };
//     const parts = theMonth.split('-');
//     if (parts.length < 2) return { chartData: [] };
//     const [year, month] = parts.map(Number);
//     if (isNaN(year) || isNaN(month)) return { chartData: [] };

//     const daysInMonth = new Date(year, month, 0).getDate();
//     const today = new Date();
//     let maxDayToCheck = daysInMonth;
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth() + 1;
    
//     if (year > currentYear || (year === currentYear && month > currentMonth)) {
//       maxDayToCheck = 0;
//     } else if (year === currentYear && month === currentMonth) {
//       maxDayToCheck = today.getDate();
//     }

//     const workingDayMap = {};
//     const workingDays = [];
//     for (let day = 1; day <= maxDayToCheck; day++) {
//       const d = new Date(year, month - 1, day).getDay();
//       if (d >= 1 && d <= 6) { workingDayMap[day] = true; workingDays.push(day); }
//     }

//     const presentDays = new Set();
//     attendance.forEach(record => {
//       if (!record.checkInTime) return;
//       const recordDate = new Date(record.checkInTime);
//       if (theDate) {
//         if (recordDate.toISOString().split('T')[0] !== theDate) return;
//       } else {
//         if (recordDate.getFullYear() !== year || recordDate.getMonth() + 1 !== month) return;
//       }
//       if (record.status === "present" || record.status === "checked-in") {
//         const day = recordDate.getDate();
//         if (workingDayMap[day]) presentDays.add(day);
//       }
//     });

//     if (theDate) {
//       const selectedDate = new Date(theDate);
//       const dow = selectedDate.getDay();
//       if (dow >= 1 && dow <= 6) {
//         const day = selectedDate.getDate();
//         const isPresent = presentDays.has(day);
//         return { chartData: [{ name: theDate, value: isPresent ? 0 : 1, label: isPresent ? 'Present' : 'Absent' }] };
//       }
//       return { chartData: [] };
//     }

//     const weeklyAbsent = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0, 'Week 5': 0 };
//     workingDays.forEach(day => {
//       if (!presentDays.has(day)) {
//         const wk = day <= 7 ? 1 : day <= 14 ? 2 : day <= 21 ? 3 : day <= 28 ? 4 : 5;
//         weeklyAbsent[`Week ${wk}`]++;
//       }
//     });

//     const chartData = Object.entries(weeklyAbsent).map(([week, days]) => ({ name: week, value: days, label: `${days} day${days > 1 ? 's' : ''}` }));
//     return { chartData };
//   };

//   const getShiftStartTime = (shiftType) => {
//     const shiftTimes = {
//       "A": "10:00", "B": "14:00", "C": "18:00", "D": "09:00",
//       "E": "10:00", "F": "14:00", "G": "09:00", "H": "09:00",
//       "I": "07:00", "BR": "07:00"
//     };
//     return shiftTimes[shiftType] || "09:00";
//   };

//   const CHART_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

//   const LateTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg shadow-lg">
//           <p className="font-bold text-gray-700">{payload[0].payload.name}</p>
//           <p className="font-medium text-rose-600">{payload[0].payload.label}</p>
//         </div>
//       );
//     }
//     return null;
//   };

//   const AbsentTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg shadow-lg">
//           <p className="font-bold text-gray-700">{payload[0].payload.name}</p>
//           <p className="font-medium text-red-500">{payload[0].payload.label}</p>
//         </div>
//       );
//     }
//     return null;
//   };

//   if (loading || !profile) return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//       <div className="flex flex-col items-center gap-3">
//         <div className="w-10 h-10 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
//         <p className="text-sm font-medium text-gray-600">Loading your dashboard...</p>
//       </div>
//     </div>
//   );

//   const getGreeting = () => {
//     const hour = new Date().getHours();
//     if (hour >= 5 && hour < 12) return "Good morning";
//     if (hour >= 12 && hour < 17) return "Good afternoon";
//     if (hour >= 17 && hour < 21) return "Good evening";
//     return "Good evening";
//   };

//   const todayRecord = userAttendance.find((record) => {
//     if (!record.checkInTime) return false;
//     return new Date(record.checkInTime).toDateString() === new Date().toDateString();
//   });

//   const attendanceRate =
//     employeeStats.totalWorkingDays > 0
//       ? Math.round((employeeStats.presentThisMonth / employeeStats.totalWorkingDays) * 100)
//       : 0;

//   const formatTime = (value) =>
//     value
//       ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
//       : "—";

//   const monthLabel = new Date(`${lateMonth}-01`).toLocaleDateString("en-US", {
//     month: "long",
//     year: "numeric",
//   });

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="p-4 sm:p-6 lg:p-8">
//         {/* Dashboard Header */}
//         <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
//           <div>
//             <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
//               {getGreeting()}, <span className="text-blue-600">{profile.name.split(" ")[0]}</span>
//             </h1>
//             <p className="mt-1 text-sm text-gray-600">
//               Track attendance, leaves, and your work schedule in one place
//             </p>
//           </div>
//           <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm">
//             <FiCalendar className="text-blue-600" />
//             <span className="text-sm font-medium text-gray-600">
//               {new Date().toLocaleDateString("en-US", {
//                 weekday: "short",
//                 year: "numeric",
//                 month: "short",
//                 day: "numeric",
//               })}
//             </span>
//           </div>
//         </div>

//         {/* Top KPI Stats Grid */}
//         <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
//           <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Present</span>
//               <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
//                 <FiCheckCircle className="text-emerald-600" size={18} />
//               </div>
//             </div>
//             <div className="text-2xl font-bold text-gray-900">{employeeStats.presentThisMonth}</div>
//             <div className="text-xs text-gray-500 mt-1">days this month</div>
//           </div>
//           <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</span>
//               <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
//                 <FiUserX className="text-red-600" size={18} />
//               </div>
//             </div>
//             <div className="text-2xl font-bold text-gray-900">{employeeStats.absentThisMonth}</div>
//             <div className="text-xs text-gray-500 mt-1">days this month</div>
//           </div>
//           <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Late</span>
//               <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
//                 <FiHistory className="text-amber-600" size={18} />
//               </div>
//             </div>
//             <div className="text-2xl font-bold text-gray-900">{employeeStats.lateThisMonth}</div>
//             <div className="text-xs text-gray-500 mt-1">instances this month</div>
//           </div>
//           <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</span>
//               <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
//                 <FiTrendingUp className="text-blue-600" size={18} />
//               </div>
//             </div>
//             <div className="text-2xl font-bold text-gray-900">{attendanceRate}%</div>
//             <div className="text-xs text-gray-500 mt-1">of {employeeStats.totalWorkingDays} working days</div>
//           </div>
//         </div>

//         {/* Today's Attendance Banner */}
//         <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 mb-6 text-white flex flex-wrap items-center justify-between gap-4 shadow-lg">
//           <div>
//             <div className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">Today's Attendance</div>
//             <div className="text-lg font-semibold">
//               {todayRecord
//                 ? todayRecord.checkOutTime
//                   ? "Day completed"
//                   : "Currently checked in"
//                 : "Not checked in yet"}
//             </div>
//             <div className="flex flex-wrap gap-4 mt-2 text-sm">
//               <div>
//                 <span className="text-xs opacity-70 block">Check In</span>
//                 <span className="font-medium">{formatTime(todayRecord?.checkInTime)}</span>
//               </div>
//               <div>
//                 <span className="text-xs opacity-70 block">Check Out</span>
//                 <span className="font-medium">{formatTime(todayRecord?.checkOutTime)}</span>
//               </div>
//               <div>
//                 <span className="text-xs opacity-70 block">Shift</span>
//                 <span className="font-medium">{shiftTiming}</span>
//               </div>
//             </div>
//           </div>
//           <button
//             type="button"
//             className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm"
//             onClick={() => navigate("/attendance-capture")}
//           >
//             <FiLogIn />
//             {todayRecord && !todayRecord.checkOutTime ? "Check Out" : "Mark Attendance"}
//           </button>
//         </div>

//         {/* Celebrations & Announcements Row */}
//         {(() => {
//           const isMyBirthday = birthdaysToday.some(b => b.email === email);
//           const myAnniversary = anniversariesToday.find(a => a.email === email);
//           const deptBirthdays = birthdaysToday.filter(b => b.email !== email);
//           const deptAnniversaries = anniversariesToday.filter(a => a.email !== email);
//           const deptLeaves = leavesToday.filter(l => l.email !== email);

//           if (!isMyBirthday && !myAnniversary && !upcomingShift && deptBirthdays.length === 0 && deptAnniversaries.length === 0 && deptLeaves.length === 0) return null;

//           const totalEvents = (isMyBirthday ? 1 : 0) + (myAnniversary ? 1 : 0) + (upcomingShift ? 1 : 0) + (deptBirthdays.length > 0 ? 1 : 0) + (deptAnniversaries.length > 0 ? 1 : 0) + (deptLeaves.length > 0 ? 1 : 0);

//           const formatShiftDate = (dateValue) => {
//             if (!dateValue) return "soon";
//             return new Date(dateValue).toLocaleDateString("en-GB", {
//               day: "numeric",
//               month: "short",
//               year: "numeric",
//             });
//           };

//           return (
//             <div className="mb-6 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
//               <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
//                 <div className="flex items-center gap-2">
//                   <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
//                   <h3 className="text-sm font-semibold text-gray-900">Updates & Celebrations</h3>
//                 </div>
//                 <span className="text-xs font-medium text-gray-500">
//                   {totalEvents} update{totalEvents !== 1 ? 's' : ''}
//                 </span>
//               </div>
//               <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                 {isMyBirthday && (
//                   <CelebrationCard 
//                     type="birthday"
//                     name={profile.name}
//                     isPersonal={true}
//                     onAction={() => alert("Happy Birthday! 🎂")}
//                   />
//                 )}
//                 {myAnniversary && (
//                   <CelebrationCard 
//                     type="anniversary"
//                     name={profile.name}
//                     detail={`${myAnniversary.yearsOfService} Year${myAnniversary.yearsOfService > 1 ? 's' : ''}`}
//                     isPersonal={true}
//                     onAction={() => alert("Congratulations! 🏆")}
//                   />
//                 )}
//                 {/* Upcoming Shift Change */}
//                 {upcomingShift && (
//                   <CelebrationCard
//                     type="shift"
//                     name={`Shift ${upcomingShift.shiftType}`}
//                     detail={formatShiftDate(upcomingShift.effectiveFrom)}
//                     isPersonal={true}
//                     onAction={() => { setModalType("shift"); setShowModal(true); }}
//                   />
//                 )}

//                 {/* Departmental Birthdays */}
//                 {deptBirthdays.length > 0 && (
//                   <CelebrationCard 
//                     type="birthday"
//                     name={`${deptBirthdays.length} Colleague${deptBirthdays.length > 1 ? 's' : ''}`}
//                     detail="Birthday"
//                     onAction={() => { setModalType("birthday"); setShowModal(true); }}
//                   />
//                 )}
//                 {deptAnniversaries.length > 0 && (
//                   <CelebrationCard 
//                     type="anniversary"
//                     name={`${deptAnniversaries.length} Colleague${deptAnniversaries.length > 1 ? 's' : ''}`}
//                     detail="Anniversary"
//                     onAction={() => { setModalType("anniversary"); setShowModal(true); }}
//                   />
//                 )}
//                 {deptLeaves.length > 0 && (
//                   <CelebrationCard 
//                     type="leave"
//                     name={`${deptLeaves.length} Colleague${deptLeaves.length > 1 ? 's' : ''}`}
//                     detail="Leave"
//                     onAction={() => { setModalType("leave"); setShowModal(true); }}
//                   />
//                 )}
//               </div>

//               {showModal && (
//                 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
//                   <div className={`w-full overflow-hidden bg-white shadow-2xl animate-in zoom-in-95 duration-200 ${modalType === 'shift' ? 'max-w-sm rounded-xl' : 'max-w-md rounded-2xl'}`}>
//                     <div className={`flex items-center justify-between border-b ${modalType === 'shift' ? 'px-3 py-2 border-slate-100' : 'p-4 border-gray-50'}`}>
//                       <h3 className={`font-semibold text-gray-800 ${modalType === 'shift' ? 'text-sm' : 'text-lg font-bold text-gray-700'}`}>
//                         {modalType === 'birthday' ? `Today's Birthdays` : 
//                          modalType === 'anniversary' ? `Work Anniversaries` :
//                          modalType === 'shift' ? `Upcoming Shift Change` :
//                          `Employees on Leave`}
//                       </h3>
//                       <button
//                         onClick={() => setShowModal(false)}
//                         className={`transition-all ${modalType === 'shift' ? 'p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg' : 'p-2 text-slate-500 hover:text-slate-500 hover:bg-white rounded-xl'}`}
//                       >
//                         <FiX className={modalType === 'shift' ? 'text-base' : 'text-xl'} />
//                       </button>
//                     </div>
//                     <div className={`overflow-y-auto ${modalType === 'shift' ? 'p-3' : 'p-2 max-h-[60vh]'}`}>
//                       {modalType === 'shift' && upcomingShift ? (
//                         <div className="space-y-2.5">
//                           <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-100">
//                             <span className="text-[10px] font-medium text-slate-500">Effective from</span>
//                             <span className="text-[11px] font-semibold text-slate-800">
//                               {formatShiftDate(upcomingShift.effectiveFrom)}
//                             </span>
//                           </div>

//                           <div className="overflow-hidden border rounded-lg border-slate-200">
//                             <div className="grid grid-cols-[1fr_auto_1fr] items-stretch">
//                               <div className="px-2.5 py-2">
//                                 <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Current</p>
//                                 <p className="text-[11px] font-semibold text-slate-800 leading-tight">
//                                   {currentShift?.shiftType ? `Shift ${currentShift.shiftType}` : "Not assigned"}
//                                 </p>
//                                 <p className="text-[10px] text-slate-500 truncate mt-0.5">
//                                   {currentShift?.shiftName || "—"}
//                                 </p>
//                                 <p className="text-[10px] font-medium text-emerald-600 mt-1">
//                                   {currentShift?.timeRange || shiftTiming}
//                                 </p>
//                               </div>

//                               <div className="flex items-center justify-center px-1 border-x border-slate-100 bg-slate-50/80">
//                                 <span className="text-[10px] font-semibold text-slate-400">→</span>
//                               </div>

//                               <div className="px-2.5 py-2 bg-violet-50/40">
//                                 <p className="text-[9px] font-semibold uppercase tracking-wide text-violet-500 mb-1">Upcoming</p>
//                                 <p className="text-[11px] font-semibold text-slate-800 leading-tight">
//                                   Shift {upcomingShift.shiftType}
//                                 </p>
//                                 <p className="text-[10px] text-slate-500 truncate mt-0.5">
//                                   {upcomingShift.shiftName}
//                                 </p>
//                                 <p className="text-[10px] font-medium text-violet-600 mt-1">
//                                   {upcomingShift.timeRange}
//                                 </p>
//                               </div>
//                             </div>
//                           </div>

//                           {(upcomingShift.shiftCategory || upcomingShift.description) && (
//                             <p className="px-0.5 text-[10px] leading-snug text-slate-500">
//                               {[upcomingShift.shiftCategory, upcomingShift.description].filter(Boolean).join(" · ")}
//                             </p>
//                           )}
//                         </div>
//                       ) : (
//                       <div className="grid grid-cols-1 gap-2 p-2">
//                         {(modalType === 'birthday' ? deptBirthdays : modalType === 'anniversary' ? deptAnniversaries : deptLeaves).map((item, idx) => (
//                           <div key={idx} className="flex items-center justify-between p-4 bg-white/50 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm transition-all group">
//                             <div className="flex items-center gap-4">
//                               <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm ${
//                                 modalType === 'birthday' ? 'bg-rose-100 text-rose-600' : 
//                                 modalType === 'anniversary' ? 'bg-blue-100 text-blue-700' :
//                                 'bg-amber-100 text-amber-600'
//                               }`}>
//                                 {(item.name || item.employeeName).split(' ').map(n => n[0]).join('')}
//                               </div>
//                               <div>
//                                 <h4 className="text-sm font-bold text-gray-900">{item.name || item.employeeName}</h4>
//                                 <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                                   {modalType === 'anniversary' ? `${item.yearsOfService} Year Celebration` : item.role || 'Team Member'}
//                                 </p>
//                               </div>
//                             </div>
//                             {(modalType === 'birthday' || modalType === 'anniversary') && (
//                               <button className={`px-3 py-1.5 bg-white border rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
//                                 modalType === 'birthday' ? 'text-rose-500 border-rose-100 hover:bg-rose-500 hover:text-gray-900' : 
//                                 'text-blue-700 border-emerald-100 hover:bg-blue-600 hover:text-gray-900'
//                               }`} onClick={() => alert(`Celebration wish sent to ${item.name}! 🎊`)}>
//                                 {modalType === 'birthday' ? 'Wish' : 'Celebrate'}
//                               </button>
//                             )}
//                             {modalType === 'leave' && (
//                               <div className="text-[9px] font-bold uppercase text-amber-600 bg-amber-100/50 px-2.5 py-1 rounded-lg">
//                                 {item.leaveType || 'On Leave'}
//                               </div>
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                       )}
//                     </div>
//                     <div className={`bg-white border-t border-gray-200 flex ${modalType === 'shift' ? 'justify-between gap-2 px-3 py-2' : 'justify-end p-4'}`}>
//                       {modalType === 'shift' && (
//                         <button
//                           onClick={() => {
//                             setShowModal(false);
//                             navigate("/my-shift");
//                           }}
//                           className="px-3 py-1.5 text-[10px] font-semibold text-violet-700 border border-violet-200 rounded-md hover:bg-violet-50 transition-all"
//                         >
//                           View Schedule
//                         </button>
//                       )}
//                       <button
//                         onClick={() => setShowModal(false)}
//                         className={`bg-gray-100 text-xs font-bold transition-all shadow-md shadow-gray-200 ${modalType === 'shift' ? 'px-3 py-1.5 text-[10px] text-gray-700 font-semibold hover:bg-gray-200 rounded-md ml-auto' : 'px-5 py-2 text-gray-900 rounded-lg hover:bg-gray-100'}`}
//                       >
//                         Close
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         })()}

//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

//           {/* Left Column: Profile Card + Quick Actions */}
//           <div className="space-y-6 lg:col-span-3">
//             {/* Profile Card */}
//             <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
//               <div className="p-5 text-center border-b border-gray-100">
//                 <div className="relative w-20 h-20 mx-auto mb-3">
//                   {(() => {
//                     const imgPath = profile.profileImage || profile.profile_image || profile.image;
//                     const name = profile.name || "User";
//                     const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
//                     if (imgPath) {
//                       const fullUrl = imgPath.startsWith('http')
//                         ? imgPath
//                         : `${API_BASE_URL.replace(/\/api$/, '')}/${imgPath.replace(/^\/+/, '')}`;
//                       return (
//                         <img
//                           src={`${fullUrl}${fullUrl.includes('?') ? '&' : '?'}t=${new Date().getTime()}`}
//                           alt={name}
//                           className="w-20 h-20 rounded-full object-cover border-4 border-blue-50 shadow-sm"
//                           onError={(e) => {
//                             e.target.onerror = null;
//                             e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f0f7ff&color=2563eb&bold=true&size=128`;
//                           }}
//                         />
//                       );
//                     } else {
//                       return (
//                         <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-2xl">
//                           {initials}
//                         </div>
//                       );
//                     }
//                   })()}
//                   <label htmlFor="profileImageUpload" className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-md">
//                     <FiCamera className="text-white" size={14} />
//                   </label>
//                   <input id="profileImageUpload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
//                   {profile.profileImage && (
//                     <button onClick={handleImageDelete} className="absolute top-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100">
//                       <FiX className="text-red-500" size={12} />
//                     </button>
//                   )}
//                 </div>
//                 <h2 className="text-lg font-semibold text-gray-900">{profile.name}</h2>
//                 <p className="text-sm font-medium text-blue-600 mt-1">{profile.department || "Team Member"}</p>
//                 <p className="text-xs text-gray-500 mt-1">ID: {profile.employeeId}</p>
//               </div>

//               <div className="p-4 space-y-3">
//                 <div className="flex items-center justify-between py-2 border-b border-gray-100">
//                   <span className="text-xs font-medium text-gray-500">Status</span>
//                   <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50">
//                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
//                     <span className="text-xs font-semibold text-emerald-700">Active</span>
//                   </div>
//                 </div>
//                 <div className="flex items-center justify-between py-2 border-b border-gray-100">
//                   <span className="text-xs font-medium text-gray-500">Location</span>
//                   <span className="text-xs font-semibold text-gray-900">{assignedLocation}</span>
//                 </div>
//                 <div className="flex items-center justify-between py-2 border-b border-gray-100">
//                   <span className="text-xs font-medium text-gray-500">Work Shift</span>
//                   <span className="text-xs font-semibold text-gray-900">{shiftTiming}</span>
//                 </div>
//                 <div className="flex items-center justify-between py-2">
//                   <span className="text-xs font-medium text-gray-500">Join Date</span>
//                   <span className="text-xs font-semibold text-gray-900">
//                     {profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : "—"}
//                   </span>
//                 </div>
//               </div>
//               <div className="p-4 pt-0">
//                 <button
//                   onClick={() => navigate("/myattendance")}
//                   className="w-full py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-sm font-semibold transition-colors"
//                 >
//                   View Attendance Report
//                 </button>
//                 <button
//                   onClick={() => navigate("/emp-profile")}
//                   className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
//                 >
//                   View Full Profile
//                 </button>
//               </div>
//             </div>

//             {/* Quick Actions */}
//             <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
//               <div className="px-4 py-3 border-b border-gray-100">
//                 <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
//               </div>
//               <div className="p-4 grid grid-cols-1 gap-2">
//                 <button
//                   onClick={() => navigate("/attendance-capture")}
//                   className="flex items-center gap-3 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
//                 >
//                   <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
//                     <FiCamera size={18} />
//                   </div>
//                   <div className="text-left">
//                     <div className="text-sm font-semibold">Mark Attendance</div>
//                     <div className="text-xs opacity-80">Check in or out</div>
//                   </div>
//                 </button>
//                 <button
//                   onClick={() => navigate("/myattendance")}
//                   className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
//                 >
//                   <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
//                     <FiHistory size={18} />
//                   </div>
//                   <div className="text-left">
//                     <div className="text-sm font-semibold text-gray-900">Attendance History</div>
//                     <div className="text-xs text-gray-500">View past records</div>
//                   </div>
//                 </button>
//                 <button
//                   onClick={() => navigate("/mypermissions")}
//                   className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
//                 >
//                   <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
//                     <FiList size={18} />
//                   </div>
//                   <div className="text-left">
//                     <div className="text-sm font-semibold text-gray-900">Permission Request</div>
//                     <div className="text-xs text-gray-500">Short leave / permission</div>
//                   </div>
//                 </button>
//                 <button
//                   onClick={() => navigate("/myleaves")}
//                   className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
//                 >
//                   <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
//                     <FiCalendar size={18} />
//                   </div>
//                   <div className="text-left">
//                     <div className="text-sm font-semibold text-gray-900">Leave Management</div>
//                     <div className="text-xs text-gray-500">Apply or track leaves</div>
//                   </div>
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Right Column */}
//           <div className="space-y-6 lg:col-span-9">
            
//             {/* Charts Section */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Late Analysis Card */}
//               <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-b border-gray-100">
//                   <div>
//                     <h3 className="text-sm font-semibold text-gray-900">Late Minutes by Week</h3>
//                     <p className="text-xs text-gray-500 mt-0.5">{monthLabel}</p>
//                   </div>
//                   <div className="shrink-0">
//                     <input
//                       type="month"
//                       value={lateMonth}
//                       onChange={(e) => {
//                         setLateMonth(e.target.value);
//                         setLateDate("");
//                       }}
//                       className="px-2 py-1 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white cursor-pointer"
//                     />
//                   </div>
//                 </div>
//                 <div className="p-4 h-64">
//                   {lateChartData.some(d => d.value > 0) || lateDate ? (
//                     <ResponsiveContainer width="100%" height="100%">
//                       <BarChart data={lateChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} />
//                         <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 'dataMax + 10']} />
//                         <Tooltip content={<LateTooltip />} cursor={{ fill: '#f8fafc' }} />
//                         <Bar dataKey="value" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={40} />
//                       </BarChart>
//                     </ResponsiveContainer>
//                   ) : (
//                     <div className="flex items-center justify-center h-full text-gray-500">
//                       <div className="text-center">
//                         <FiAlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
//                         <p className="text-sm">No late records for this period</p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Absent Analysis Card */}
//               <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-b border-gray-100">
//                   <div>
//                     <h3 className="text-sm font-semibold text-gray-900">Absent Days by Week</h3>
//                     <p className="text-xs text-gray-500 mt-0.5">{monthLabel}</p>
//                   </div>
//                   <div className="shrink-0">
//                     <input
//                       type="month"
//                       value={absentMonth}
//                       onChange={(e) => {
//                         setAbsentMonth(e.target.value);
//                         setAbsentDate("");
//                       }}
//                       className="px-2 py-1 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white cursor-pointer"
//                     />
//                   </div>
//                 </div>
//                 <div className="p-4 h-64">
//                   {absentChartData.some(d => d.value > 0) || absentDate ? (
//                     <ResponsiveContainer width="100%" height="100%">
//                       <BarChart data={absentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
//                         <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 'dataMax + 1']} allowDecimals={false} />
//                         <Tooltip content={<AbsentTooltip />} cursor={{ fill: '#f8fafc' }} />
//                         <Bar dataKey="value" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={40} />
//                       </BarChart>
//                     </ResponsiveContainer>
//                   ) : (
//                     <div className="flex items-center justify-center h-full text-gray-500">
//                       <div className="text-center">
//                         <FiUserX className="w-8 h-8 mx-auto mb-2 opacity-20" />
//                         <p className="text-sm">No absent records for this period</p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Recent Attendance Registry - WITHOUT Break Time */}
//             <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
//               <div className="flex items-center justify-between mb-3">
//                 <h3 className="text-sm font-bold text-gray-900">Recent Attendance Activity</h3>
//                 <button
//                   onClick={() => navigate("/myattendance")}
//                   className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
//                 >
//                   View all <FiChevronRight size={14} />
//                 </button>
//               </div>
//               <div className="overflow-x-auto">
//                 <table className="w-full min-w-[500px] text-left">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-4 py-2 text-[11px] font-bold text-white uppercase tracking-wider">DATE</th>
//                       <th className="px-4 py-2 text-[11px] font-bold text-white uppercase tracking-wider">CHECK IN</th>
//                       <th className="px-4 py-2 text-[11px] font-bold text-white uppercase tracking-wider">CHECK OUT</th>
//                       <th className="px-4 py-2 text-[11px] font-bold text-white uppercase tracking-wider text-right">STATUS</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-100">
//                     {userAttendance.slice(0, 5).map((record, index) => (
//                       <tr key={index} className="group hover:bg-gray-50 transition-colors">
//                         <td className="px-4 py-2.5 text-xs font-semibold text-gray-700">
//                           {new Date(record.checkInTime).toLocaleDateString()}
//                         </td>
//                         <td className="px-4 py-2.5 text-xs font-medium text-gray-500">
//                           {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
//                         </td>
//                         <td className="px-4 py-2.5 text-xs font-medium text-gray-500">
//                           {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
//                         </td>
//                         <td className="px-4 py-2.5 text-right">
//                           <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
//                             record.status === 'present' || record.status === 'checked-in' 
//                               ? 'bg-emerald-50 text-emerald-700' 
//                               : 'bg-red-50 text-red-700'
//                           }`}>
//                             {record.status === 'checked-in' ? 'In' : (record.status === 'present' ? 'Present' : record.status)}
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                     {userAttendance.length === 0 && (
//                       <tr>
//                         <td colSpan="4" className="py-8 text-center text-xs text-slate-500 italic">
//                           No recent activity found.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EmployeeDashboard;


import axios from "axios";
import { useEffect, useState } from "react";
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
  FiMapPin
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { subscribeToPushNotifications } from "../utils/pushNotification";
import CelebrationCard from "../Components/CelebrationCard";
import {
  Bar,
  BarChart,
  CartesianGrid,
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

  const [lateDate, setLateDate] = useState("");
  const [lateMonth, setLateMonth] = useState(getCurrentMonth());
  const [absentDate, setAbsentDate] = useState("");
  const [absentMonth, setAbsentMonth] = useState(getCurrentMonth());

  const [employeeStats, setEmployeeStats] = useState({
    presentThisMonth: 0,
    absentThisMonth: 0,
    lateThisMonth: 0,
    totalWorkingDays: 0
  });

  const [lateChartData, setLateChartData] = useState([]);
  const [absentChartData, setAbsentChartData] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [userAttendance, setUserAttendance] = useState([]);
  const [birthdaysToday, setBirthdaysToday] = useState([]);
  const [anniversariesToday, setAnniversariesToday] = useState([]);
  const [leavesToday, setLeavesToday] = useState([]);
  const [upcomingShift, setUpcomingShift] = useState(null);
  const [currentShift, setCurrentShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");

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

          let resolvedMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

          if (filteredAttendance.length > 0) {
            const validDates = filteredAttendance
              .map(r => r.checkInTime ? new Date(r.checkInTime) : null)
              .filter(d => d && !isNaN(d.getTime()));

            if (validDates.length > 0) {
              const latestDate = new Date(Math.max(...validDates));
              resolvedMonth = `${latestDate.getFullYear()}-${String(latestDate.getMonth() + 1).padStart(2, '0')}`;
            }
          }

          setLateMonth(resolvedMonth);
          setAbsentMonth(resolvedMonth);
          updateChartDataWithMonth(filteredAttendance, profileData, resolvedMonth);
          calculateEmployeeStats(filteredAttendance, profileData);

          const leaveRes = await axios.get(`${BASE_URL}api/leaves/employeeleaves/${targetId}`);
          const pendingLeavesCount = leaveRes.data?.records?.filter(l => l.status === "pending").length || 0;
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

          setLoading(false);
        }
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [email]);

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
    if (!lateMonth) return;
    const parts = lateMonth.split('-');
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
    const userAttendance = allAttendance.filter(record => {
      const recordId = typeof record.employeeId === 'object' ?
        record.employeeId?.employeeId : record.employeeId;
      return recordId === targetId;
    });

    updateChartData(userAttendance, profile);
    calculateEmployeeStats(userAttendance, profile);
  }, [lateMonth, absentMonth, lateDate, absentDate]);

  const updateChartData = (userAttendance, profileData) => {
    const lateAnalysis = analyzeLateDays(userAttendance, profileData);
    const absentAnalysis = analyzeAbsentDays(userAttendance, profileData);
    setLateChartData(lateAnalysis.chartData);
    setAbsentChartData(absentAnalysis.chartData);
  };

  const updateChartDataWithMonth = (attendance, profileData, month) => {
    const lateAnalysis = analyzeLateDaysForMonth(attendance, profileData, month, "");
    const absentAnalysis = analyzeAbsentDaysForMonth(attendance, profileData, month, "");
    setLateChartData(lateAnalysis.chartData);
    setAbsentChartData(absentAnalysis.chartData);
  };

  const analyzeLateDays = (attendance, profileData) =>
    analyzeLateDaysForMonth(attendance, profileData, lateMonth, lateDate);

  const analyzeLateDaysForMonth = (attendance, profileData, theMonth, theDate) => {
    if (!theMonth) return { chartData: [] };
    const parts = theMonth.split('-');
    if (parts.length < 2) return { chartData: [] };
    const [year, month] = parts.map(Number);
    if (isNaN(year) || isNaN(month)) return { chartData: [] };

    const weeklyLate = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0, 'Week 5': 0 };

    attendance.forEach(record => {
      if (!record.checkInTime) return;
      const recordDate = new Date(record.checkInTime);

      if (theDate) {
        if (recordDate.toISOString().split('T')[0] !== theDate) return;
      } else {
        if (recordDate.getFullYear() !== year || recordDate.getMonth() + 1 !== month) return;
      }

      const shiftStart = getShiftStartTime(profileData?.shift || "D");
      const checkInTime = new Date(record.checkInTime);
      const [hours, mins] = shiftStart.split(':').map(Number);
      const shiftStartTime = new Date(checkInTime);
      shiftStartTime.setHours(hours, mins, 0, 0);
      const graceTime = new Date(shiftStartTime);
      graceTime.setMinutes(graceTime.getMinutes() + 5);

      if (checkInTime > graceTime) {
        const lateMins = Math.floor((checkInTime - graceTime) / (1000 * 60));
        const day = recordDate.getDate();
        let weekNum = day <= 7 ? 1 : day <= 14 ? 2 : day <= 21 ? 3 : day <= 28 ? 4 : 5;
        weeklyLate[`Week ${weekNum}`] += lateMins;
      }
    });

    let chartData = Object.entries(weeklyLate).map(([week, minutes]) => ({ name: week, value: minutes, label: `${minutes} min` }));

    if (theDate) {
      chartData = chartData.filter(d => d.value > 0);
      if (chartData.length === 0) chartData = [{ name: theDate, value: 0, label: '0 min' }];
      else chartData[0].name = theDate;
    }

    return { chartData };
  };

  const analyzeAbsentDays = (attendance, profileData) =>
    analyzeAbsentDaysForMonth(attendance, profileData, absentMonth, absentDate);

  const analyzeAbsentDaysForMonth = (attendance, profileData, theMonth, theDate) => {
    if (!theMonth) return { chartData: [] };
    const parts = theMonth.split('-');
    if (parts.length < 2) return { chartData: [] };
    const [year, month] = parts.map(Number);
    if (isNaN(year) || isNaN(month)) return { chartData: [] };

    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    let maxDayToCheck = daysInMonth;
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    
    if (year > currentYear || (year === currentYear && month > currentMonth)) {
      maxDayToCheck = 0;
    } else if (year === currentYear && month === currentMonth) {
      maxDayToCheck = today.getDate();
    }

    const workingDayMap = {};
    const workingDays = [];
    for (let day = 1; day <= maxDayToCheck; day++) {
      const d = new Date(year, month - 1, day).getDay();
      if (d >= 1 && d <= 6) { workingDayMap[day] = true; workingDays.push(day); }
    }

    const presentDays = new Set();
    attendance.forEach(record => {
      if (!record.checkInTime) return;
      const recordDate = new Date(record.checkInTime);
      if (theDate) {
        if (recordDate.toISOString().split('T')[0] !== theDate) return;
      } else {
        if (recordDate.getFullYear() !== year || recordDate.getMonth() + 1 !== month) return;
      }
      if (record.status === "present" || record.status === "checked-in") {
        const day = recordDate.getDate();
        if (workingDayMap[day]) presentDays.add(day);
      }
    });

    if (theDate) {
      const selectedDate = new Date(theDate);
      const dow = selectedDate.getDay();
      if (dow >= 1 && dow <= 6) {
        const day = selectedDate.getDate();
        const isPresent = presentDays.has(day);
        return { chartData: [{ name: theDate, value: isPresent ? 0 : 1, label: isPresent ? 'Present' : 'Absent' }] };
      }
      return { chartData: [] };
    }

    const weeklyAbsent = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0, 'Week 5': 0 };
    workingDays.forEach(day => {
      if (!presentDays.has(day)) {
        const wk = day <= 7 ? 1 : day <= 14 ? 2 : day <= 21 ? 3 : day <= 28 ? 4 : 5;
        weeklyAbsent[`Week ${wk}`]++;
      }
    });

    const chartData = Object.entries(weeklyAbsent).map(([week, days]) => ({ name: week, value: days, label: `${days} day${days > 1 ? 's' : ''}` }));
    return { chartData };
  };

  const getShiftStartTime = (shiftType) => {
    const shiftTimes = {
      "A": "10:00", "B": "14:00", "C": "18:00", "D": "09:00",
      "E": "10:00", "F": "14:00", "G": "09:00", "H": "09:00",
      "I": "07:00", "BR": "07:00"
    };
    return shiftTimes[shiftType] || "09:00";
  };

  const LateTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-700">{payload[0].payload.name}</p>
          <p className="font-medium text-rose-600">{payload[0].payload.label}</p>
        </div>
      );
    }
    return null;
  };

  const AbsentTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-700">{payload[0].payload.name}</p>
          <p className="font-medium text-red-500">{payload[0].payload.label}</p>
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

  const monthLabel = new Date(`${lateMonth}-01`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

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

        {/* ─── STATS GRID ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/30 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Present</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center"><FiCheckCircle className="text-emerald-500" size={14} /></div>
            </div>
            <div className="text-xl font-bold text-gray-800 mt-1">{employeeStats.presentThisMonth}</div>
            <div className="text-[10px] text-gray-400">days this month</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/30 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Absent</span>
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center"><FiUserX className="text-red-500" size={14} /></div>
            </div>
            <div className="text-xl font-bold text-gray-800 mt-1">{employeeStats.absentThisMonth}</div>
            <div className="text-[10px] text-gray-400">days this month</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/30 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Late</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center"><FiHistory className="text-amber-500" size={14} /></div>
            </div>
            <div className="text-xl font-bold text-gray-800 mt-1">{employeeStats.lateThisMonth}</div>
            <div className="text-[10px] text-gray-400">instances</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/30 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Attendance</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center"><FiTrendingUp className="text-indigo-500" size={14} /></div>
            </div>
            <div className="text-xl font-bold text-gray-800 mt-1">{attendanceRate}%</div>
            <div className="text-[10px] text-gray-400">of {employeeStats.totalWorkingDays} days</div>
          </div>
        </div>

        {/* ─── QUICK ACTIONS ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <button onClick={() => navigate("/attendance-capture")} className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/30 shadow-sm hover:shadow-md transition-all text-center">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mx-auto mb-1"><FiCamera className="text-indigo-500" size={16} /></div>
            <span className="text-[10px] font-medium text-gray-700">Mark Attendance</span>
          </button>
          <button onClick={() => navigate("/myattendance")} className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/30 shadow-sm hover:shadow-md transition-all text-center">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-1"><FiHistory className="text-blue-500" size={16} /></div>
            <span className="text-[10px] font-medium text-gray-700">History</span>
          </button>
          <button onClick={() => navigate("/mypermissions")} className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/30 shadow-sm hover:shadow-md transition-all text-center">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mx-auto mb-1"><FiList className="text-amber-500" size={16} /></div>
            <span className="text-[10px] font-medium text-gray-700">Permission</span>
          </button>
          <button onClick={() => navigate("/myleaves")} className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/30 shadow-sm hover:shadow-md transition-all text-center">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center mx-auto mb-1"><FiCalendar className="text-purple-500" size={16} /></div>
            <span className="text-[10px] font-medium text-gray-700">Leaves</span>
          </button>
        </div>

        {/* ─── CHARTS ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/30 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <FiClock className="w-3.5 h-3.5 text-amber-500" /> Late Minutes
              </h3>
              <input type="month" value={lateMonth} onChange={(e) => { setLateMonth(e.target.value); setLateDate(""); }} className="px-2 py-0.5 text-[10px] font-medium text-gray-600 border border-gray-200 rounded-lg bg-white/50 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer" />
            </div>
            <div className="h-40">
              {lateChartData.some(d => d.value > 0) || lateDate ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lateChartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#6b7280' }} />
                    <Tooltip content={<LateTooltip />} cursor={{ fill: '#f3f4f6' }} />
                    <Bar dataKey="value" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                  <div className="text-center"><FiAlertCircle className="w-6 h-6 mx-auto mb-1 opacity-20" /><p>No late records</p></div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/30 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <FiUserX className="w-3.5 h-3.5 text-red-500" /> Absent Days
              </h3>
              <input type="month" value={absentMonth} onChange={(e) => { setAbsentMonth(e.target.value); setAbsentDate(""); }} className="px-2 py-0.5 text-[10px] font-medium text-gray-600 border border-gray-200 rounded-lg bg-white/50 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer" />
            </div>
            <div className="h-40">
              {absentChartData.some(d => d.value > 0) || absentDate ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={absentChartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#6b7280' }} allowDecimals={false} />
                    <Tooltip content={<AbsentTooltip />} cursor={{ fill: '#f3f4f6' }} />
                    <Bar dataKey="value" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                  <div className="text-center"><FiAlertCircle className="w-6 h-6 mx-auto mb-1 opacity-20" /><p>No absent records</p></div>
                </div>
              )}
            </div>
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
    </div>
  );
};

export default EmployeeDashboard;