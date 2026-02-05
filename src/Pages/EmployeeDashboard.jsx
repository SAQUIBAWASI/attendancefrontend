import axios from "axios";
import { useEffect, useState } from "react";
import {
  FiCalendar,
  FiCamera,
  FiCheckCircle,
  FiClock as FiHistory,
  FiList
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { subscribeToPushNotifications } from "../utils/pushNotification";


const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || localStorage.getItem("employeeEmail");
  const [profile, setProfile] = useState(null);
  const [assignedLocation, setAssignedLocation] = useState("Not Assigned");
  const [shiftTiming, setShiftTiming] = useState("Not Assigned");
  const [stats, setStats] = useState({
    presentDays: 0,
    pendingLeaves: 0,
    activePermissions: 0,
  });

  useEffect(() => {
    if (!email) return;

    const fetchData = async () => {
      try {
        const BASE_URL = "https://api.timelyhealth.in/";
        const API_5000 = "https://api.timelyhealth.in/";

        // 1. Fetch Profile
        const profileRes = await axios.get(`${BASE_URL}api/employees/get-employee?email=${email}`);
        const profileData = profileRes.data.data || profileRes.data;
        setProfile(profileData);

        if (profileData) {
          // Subscribe to Push Notifications using the unique _id
          if (profileData._id) {
            subscribeToPushNotifications(profileData._id);
          }

          // Also support using employeeId if _id is missing (fallback)
          const empId = profileData.employeeId;
          const localStorageId = JSON.parse(localStorage.getItem("employeeData"))?.employeeId;
          const targetId = empId || localStorageId;

          // 2. Attendance Stats
          const attRes = await axios.get(`${BASE_URL}api/attendance/myattendance/${targetId}`);
          const presentCount = attRes.data?.records?.filter(r => r.status === "checked-in" || r.status === "present").length || 0;

          // 3. Leaves Stats
          const leaveRes = await axios.get(`${BASE_URL}api/leaves/employeeleaves/${targetId}`);
          const pendingLeavesCount = leaveRes.data?.records?.filter(l => l.status === "pending").length || 0;

          // 4. Permissions Stats
          try {
            const permRes = await axios.get(`${API_5000}api/permissions/my-permissions/${targetId}`);
            const activePermsCount = permRes.data?.filter(p => p.status === "APPROVED").length || 0;
            setStats(prev => ({ ...prev, activePermissions: activePermsCount }));
          } catch (e) {
            console.warn("Permissions fetch failed", e);
          }

          // 5. Assigned Location
          const fetchLocation = async (url) => {
            const res = await axios.get(`${url}api/employees/mylocation/${targetId}`);
            const data = res.data?.data || res.data;
            if (data?.location?.name) return data.location.name;
            return null;
          };

          try {
            let locName = await fetchLocation(API_5000);
            if (!locName) locName = await fetchLocation(API_5000);
            if (!locName && profileData.location?.name) locName = profileData.location.name;
            setAssignedLocation(locName || "Not Assigned");
          } catch (e) {
            setAssignedLocation("Not Assigned");
          }

          // 6. Shift Timing
          const fetchShift = async (url) => {
            const res = await axios.get(`${url}api/shifts/employee/${targetId}`);
            const data = res.data?.data || res.data;
            if (data?.startTime) return `${data.startTime} - ${data.endTime}`;
            if (data?.employeeAssignment?.startTime) return `${data.employeeAssignment.startTime} - ${data.employeeAssignment.endTime}`;
            return null;
          };

          try {
            let shiftTime = await fetchShift(API_5000);
            if (!shiftTime) shiftTime = await fetchShift(API_5000);
            setShiftTiming(shiftTime || "No Shift Assigned");
          } catch (e) {
            setShiftTiming("Not Assigned");
          }



          setStats(prev => ({
            ...prev,
            presentDays: presentCount,
            pendingLeaves: pendingLeavesCount
          }));
        }
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      }
    };

    fetchData();
  }, [email]);



  if (!profile) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 uppercase tracking-widest text-xs font-bold text-blue-600">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        Processing Dashboard...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#334155]">


      <main className="max-w-6xl mx-auto p-6 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Compact Profile & Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-50">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl font-bold">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 leading-none mb-1">{profile.name}</h2>
                  <p className="text-xs text-blue-600 font-medium">{profile.department}</p>
                </div>
              </div>

              <div className="space-y-4">
                <MiniDetail label="Employee ID" value={profile.employeeId} />
                <MiniDetail label="Status" value="Active" isStatus />
                <MiniDetail label="Location" value={assignedLocation} />
                <MiniDetail label="Shift" value={shiftTiming} />
                <MiniDetail label="Joined" value={new Date(profile.joinDate).toLocaleDateString()} />
              </div>

              <button
                onClick={() => navigate("/myattendance")}
                className="w-full mt-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-100"
              >
                View My Attendance
              </button>
            </div>
          </div>

          {/* Right Column: Stats & Sleek Actions */}
          <div className="lg:col-span-8 space-y-8">

            {/* Compact Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <CompactStat label="Attendance" value={stats.presentDays} icon={<FiCheckCircle />} color="emerald" />
              <CompactStat label="Leaves" value={stats.pendingLeaves} icon={<FiCalendar />} color="amber" />
              <CompactStat label="Permissions" value={stats.activePermissions} icon={<FiList />} color="blue" />
            </div>

            {/* Action Center - Now horizontal and sleek */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">

                <SleekAction
                  icon={<FiCamera />}
                  title="Attendance"
                  desc="Check-In/Out"
                  color="emerald"
                  onClick={() => navigate("/attendance-capture")}
                />
                <SleekAction
                  icon={<FiHistory />}
                  title="History"
                  desc="View logs"
                  color="blue"
                  onClick={() => navigate("/myattendance")}
                />
                <SleekAction
                  icon={<FiList />}
                  title="Permissions"
                  desc="Short leaves"
                  color="purple"
                  onClick={() => navigate("/mypermissions")}
                />
                <SleekAction
                  icon={<FiCalendar />}
                  title="Leave Request"
                  desc="Apply now"
                  color="orange"
                  onClick={() => navigate("/myleaves")}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// ✅ Minimalist Helper Components
const MiniDetail = ({ label, value, isStatus }) => (
  <div className="flex justify-between items-center">
    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
    {isStatus ? (
      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase">Active</span>
    ) : (
      <span className="text-xs font-bold text-gray-700">{value}</span>
    )}
  </div>
);

const CompactStat = ({ label, value, icon, color }) => {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100"
  };

  return (
    <div className={`p-3 rounded-xl border ${colors[color]} flex flex-col items-center justify-center text-center shadow-sm`}>
      <div className="mb-1 text-base opacity-70">{icon}</div>
      <div className="text-xl font-black">{value}</div>
      <p className="text-[8px] font-bold uppercase tracking-widest opacity-60 leading-none mt-0.5">{label}</p>
    </div>
  );
};

const SleekAction = ({ icon, title, desc, color, onClick, badge }) => { // ✅ Added badge prop
  const themes = {
    rose: "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border-rose-100",
    emerald: "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border-emerald-100",
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border-blue-100",
    purple: "bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white border-purple-100",
    orange: "bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white border-orange-100"
  };

  return (
    <div
      onClick={onClick}
      className={`relative group p-3 rounded-xl border cursor-pointer transition-all duration-300 flex items-center gap-3 ${themes[color]} hover:shadow-lg hover:translate-y-[-2px]`}
    >
      {/* ✅ Badge Indicator */}
      {badge > 0 && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm z-10">
          {badge > 99 ? '99+' : badge}
        </div>
      )}

      <div className="text-xl">{icon}</div>
      <div>
        <h4 className="text-[13px] font-bold tracking-tight leading-none mb-0.5">{title}</h4>
        <p className="text-[9px] opacity-60 font-medium uppercase tracking-wider">{desc}</p>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
