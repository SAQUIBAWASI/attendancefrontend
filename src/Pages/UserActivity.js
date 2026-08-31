import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaBuilding, 
  FaCalendarAlt, 
  FaSearch, 
  FaUserTag, 
  FaHistory, 
  FaChevronUp,
  FaChevronDown,
  FaExternalLinkAlt,
  FaLink,
  FaEdit,
  FaEye
} from "react-icons/fa";
import { FiFilter, FiCalendar, FiActivity, FiUsers, FiShield, FiTrash2 } from "react-icons/fi";
import { API_BASE_URL } from "../config";
import { isEmployeeHidden } from "../utils/employeeStatus";
import "../index.css";
import "./EmployeeDashboard.css";

const UserActivity = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeesMap, setEmployeesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  
  // Date filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // Department and Designation filter states
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showDesignationFilter, setShowDesignationFilter] = useState(false);
  
  // Unique departments and designations
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueDesignations, setUniqueDesignations] = useState([]);
  
  // Refs for click outside
  const departmentFilterRef = useRef(null);
  const designationFilterRef = useRef(null);
  
  // ─── PERSISTED PAGINATION ───
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: (() => {
      const saved = localStorage.getItem('userActivity_itemsPerPage');
      return saved ? parseInt(saved, 10) : 10;
    })(),
  });

  // Click outside handlers for filter dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentFilterRef.current && !departmentFilterRef.current.contains(event.target)) {
        setShowDepartmentFilter(false);
      }
      if (designationFilterRef.current && !designationFilterRef.current.contains(event.target)) {
        setShowDesignationFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch employees first
  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employees/get-employees`);
      const employeesData = response.data || [];
      const activeEmployees = employeesData.filter(emp => !isEmployeeHidden(emp));
      setEmployees(activeEmployees);
      
      const map = {};
      activeEmployees.forEach(emp => {
        if (emp.employeeId) {
          map[String(emp.employeeId).toLowerCase()] = emp;
        }
        if (emp._id) {
          map[String(emp._id).toLowerCase()] = emp;
        }
        if (emp.email) {
          map[String(emp.email).toLowerCase()] = emp;
        }
        if (emp.name) {
          map[String(emp.name).toLowerCase()] = emp;
        }
      });
      setEmployeesMap(map);
      
      const depts = new Set();
      const designations = new Set();
      activeEmployees.forEach(emp => {
        if (emp.department) depts.add(emp.department);
        if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
      });
      
      setUniqueDepartments(Array.from(depts).sort());
      setUniqueDesignations(Array.from(designations).sort());
      
      return activeEmployees;
    } catch (error) {
      console.error("Error fetching employees:", error);
      return [];
    }
  };

  // Get employee details by ID or email
  const getEmployeeDetails = (userId, userEmail) => {
    if (!userId && !userEmail) {
      return { department: "N/A", designation: "N/A", name: "N/A" };
    }
    
    if (userId) {
      const userIdStr = String(userId).toLowerCase();
      
      if (employeesMap[userIdStr]) {
        const emp = employeesMap[userIdStr];
        return {
          department: emp.department || emp.departmentName || "N/A",
          designation: emp.designation || emp.role || "N/A",
          name: emp.name || emp.fullName || "N/A"
        };
      }
      
      const emp = employees.find(e => {
        const empId = String(e.employeeId || '').toLowerCase();
        const empEmail = String(e.email || '').toLowerCase();
        return empId === userIdStr || empEmail === userIdStr || empId.includes(userIdStr);
      });
      
      if (emp) {
        return {
          department: emp.department || emp.departmentName || "N/A",
          designation: emp.designation || emp.role || "N/A",
          name: emp.name || emp.fullName || "N/A"
        };
      }
    }
    
    if (userEmail) {
      const emailStr = String(userEmail).toLowerCase();
      if (employeesMap[emailStr]) {
        const emp = employeesMap[emailStr];
        return {
          department: emp.department || emp.departmentName || "N/A",
          designation: emp.designation || emp.role || "N/A",
          name: emp.name || emp.fullName || "N/A"
        };
      }
      
      const emp = employees.find(e => {
        const empEmail = String(e.email || '').toLowerCase();
        return empEmail === emailStr || empEmail.includes(emailStr);
      });
      
      if (emp) {
        return {
          department: emp.department || emp.departmentName || "N/A",
          designation: emp.designation || emp.role || "N/A",
          name: emp.name || emp.fullName || "N/A"
        };
      }
    }
    
    return { department: "N/A", designation: "N/A", name: "N/A" };
  };

  // Fetch activities
  const fetchActivities = async () => {
    try {
      setLoading(true);
      
      await fetchEmployees();
      
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
      };

      if (searchTerm) params.search = searchTerm;
      if (actionFilter) params.action = actionFilter;
      if (userRoleFilter) params.userRole = userRoleFilter;
      
      if (fromDate && toDate) {
        params.startDate = fromDate;
        params.endDate = toDate;
      } else if (fromDate && !toDate) {
        params.startDate = fromDate;
        params.endDate = fromDate;
      } else if (selectedMonth) {
        const [year, month] = selectedMonth.split('-');
        params.startDate = `${year}-${month}-01`;
        const nextMonth = new Date(year, month, 1);
        nextMonth.setDate(nextMonth.getDate() - 1);
        params.endDate = nextMonth.toISOString().split('T')[0];
      }

      const response = await axios.get(
        `${API_BASE_URL}/user-activity/all`,
        { params }
      );

      if (response.data.success) {
        let activitiesData = response.data.data.activities || [];
        
        let enrichedActivities = activitiesData.map(activity => {
          const empDetails = getEmployeeDetails(activity.userId, activity.userEmail);
          
          let actionDetails = activity.actionDetails || activity.details || "";
          let pageUrl = activity.pageUrl || "";
          
          if (activity.action === 'page_visit' && !actionDetails && pageUrl) {
            actionDetails = pageUrl;
          }
          
          if (activity.action === 'page_visit' && actionDetails && !pageUrl) {
            const urlMatch = actionDetails.match(/(https?:\/\/[^\s]+)/);
            if (urlMatch) {
              pageUrl = urlMatch[0];
            }
          }
          
          return {
            ...activity,
            department: empDetails.department,
            designation: empDetails.designation,
            userName: activity.userName || empDetails.name || "Unknown User",
            actionDetails: actionDetails,
            pageUrl: pageUrl
          };
        });
        
        if (filterDepartment) {
          enrichedActivities = enrichedActivities.filter(a => a.department === filterDepartment);
        }
        
        if (filterDesignation) {
          enrichedActivities = enrichedActivities.filter(a => a.designation === filterDesignation);
        }
        
        setActivities(enrichedActivities);
        setFilteredActivities(enrichedActivities);
        
        setPagination({
          currentPage: response.data.data.pagination?.currentPage || 1,
          totalPages: response.data.data.pagination?.totalPages || 1,
          totalCount: response.data.data.pagination?.totalCount || enrichedActivities.length,
          limit: response.data.data.pagination?.limit || 10,
        });
      } else {
        setActivities([]);
        setFilteredActivities([]);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      setActivities([]);
      setFilteredActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchActivities();
  }, []);

  // Fetch activities whenever pagination or filters change
  useEffect(() => {
    fetchActivities();
  }, [pagination.currentPage, pagination.limit, searchTerm, actionFilter, userRoleFilter, fromDate, toDate, selectedMonth, filterDepartment, filterDesignation]);
  
  // Reset to page 1 when any filter changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [searchTerm, actionFilter, userRoleFilter, filterDepartment, filterDesignation, fromDate, toDate, selectedMonth]);

  // Handle stat card click
  const handleStatClick = (filterType, filterValue) => {
    if (filterType === 'all') {
      setUserRoleFilter('');
      setActionFilter('');
      setActiveFilter(null);
      return;
    }
    
    if (filterType === 'role') {
      setUserRoleFilter(filterValue);
      setActiveFilter(filterValue);
    } else if (filterType === 'action') {
      setActionFilter(filterValue);
      setActiveFilter(filterValue);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setActionFilter("");
    setUserRoleFilter("");
    setFromDate("");
    setToDate("");
    setSelectedMonth(new Date().toISOString().slice(0, 7));
    setFilterDepartment("");
    setFilterDesignation("");
    setActiveFilter(null);
    if (window.innerWidth < 640) {
      setShowMobileFilters(false);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Timestamp",
      "User Name",
      "User Email",
      "Department",
      "Designation",
      "Role",
      "Action",
      "Page Name",
      "Page URL",
      "Action Details"
    ];
    const csvData = filteredActivities.map((activity) => {
      const { pageName, pageUrl } = getPageInfo(activity);
      return [
        new Date(activity.createdAt).toLocaleString(),
        activity.userName || "",
        activity.userEmail || "",
        activity.department || "N/A",
        activity.designation || "N/A",
        activity.userRole || "",
        formatActionName(activity.action),
        pageName,
        pageUrl || "N/A",
        activity.actionDetails || "N/A"
      ];
    });

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `user_activity_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Format action name for display
  const formatActionName = (action) => {
    if (!action) return "N/A";
    const actionMap = {
      login: "Login",
      logout: "Logout",
      leave_apply: "Leave Applied",
      leave_approve: "Leave Approved",
      leave_reject: "Leave Rejected",
      payslip_download: "Payslip Downloaded",
      page_visit: "Page Visit",
      data_edit: "Data Modified",
      file_download: "File Downloaded",
    };
    if (actionMap[action]) return actionMap[action];
    return String(action).split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Get action badge color
  const getActionBadgeColor = (action) => {
    const colorMap = {
      login: "bg-emerald-50 text-emerald-700",
      logout: "bg-gray-100 text-gray-700",
      leave_apply: "bg-blue-50 text-blue-700",
      leave_approve: "bg-blue-100 text-emerald-800",
      leave_reject: "bg-red-50 text-red-700",
      payslip_download: "bg-purple-100 text-purple-800",
      page_visit: "bg-indigo-100 text-indigo-800",
      data_edit: "bg-orange-100 text-orange-800",
      file_download: "bg-teal-100 text-teal-800",
    };
    return colorMap[action] || "bg-amber-50 text-amber-700";
  };

  // ─── HANDLE ITEMS PER PAGE CHANGE WITH LOCALSTORAGE ───
  const handleItemsPerPageChange = (limit) => {
    setPagination(prev => ({
      ...prev,
      limit: limit,
      currentPage: 1
    }));
    localStorage.setItem('userActivity_itemsPerPage', String(limit));
  };

  const indexOfLastItem = pagination.currentPage * pagination.limit;
  const indexOfFirstItem = indexOfLastItem - pagination.limit;
  
  // Get page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      if (
        i === 1 ||
        i === pagination.totalPages ||
        (i >= pagination.currentPage - 1 && i <= pagination.currentPage + 1)
      ) {
        pageNumbers.push(i);
      } else if (i === pagination.currentPage - 2 || i === pagination.currentPage + 2) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  // Get stats
  const getStats = () => {
    const allActivities = activities;
    return {
      total: allActivities.length,
      employeeActions: allActivities.filter(a => a.userRole === 'employee').length,
      adminActions: allActivities.filter(a => a.userRole === 'admin').length,
      pageVisits: allActivities.filter(a => a.action === 'page_visit').length
    };
  };

  const stats = getStats();

  // Function to handle URL click
  const handleUrlClick = (url) => {
    if (url) {
      let fullUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        if (url.startsWith('/')) {
          fullUrl = `${window.location.origin}${url}`;
        } else {
          fullUrl = `https://${url}`;
        }
      }
      window.open(fullUrl, '_blank');
    }
  };

  // ✅ Get Page Name and URL - Enhanced with fallback
  const getPageInfo = (activity) => {
    let pageName = '';
    let pageUrl = '';
    let source = '';
    
    // Log raw data for debugging
    console.log('🔍 Activity Data:', {
      id: activity._id,
      action: activity.action,
      actionDetails: activity.actionDetails,
      pageUrl: activity.pageUrl,
      details: activity.details,
      userName: activity.userName
    });
    
    // For page_visit action
    if (activity.action === 'page_visit') {
      // 1. Try pageUrl field
      if (activity.pageUrl) {
        pageUrl = activity.pageUrl;
        source = 'pageUrl';
        try {
          const urlObj = new URL(pageUrl);
          const path = urlObj.pathname;
          const name = path.split('/').filter(p => p && p.length > 0).pop() || 'Home';
          pageName = name.charAt(0).toUpperCase() + name.slice(1);
        } catch {
          const parts = pageUrl.split('/');
          const name = parts.filter(p => p && p.length > 0).pop() || 'Home';
          pageName = name.charAt(0).toUpperCase() + name.slice(1);
        }
      }
      // 2. Try actionDetails field
      else if (activity.actionDetails) {
        const details = activity.actionDetails;
        source = 'actionDetails';
        const urlMatch = details.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
          pageUrl = urlMatch[0];
          const parts = pageUrl.split('/');
          const name = parts.filter(p => p && p.length > 0).pop() || 'Page';
          pageName = name.charAt(0).toUpperCase() + name.slice(1);
        } else {
          const pathMatch = details.match(/(\/[^\s]+)/);
          if (pathMatch) {
            pageUrl = pathMatch[0];
            const parts = pageUrl.split('/');
            const name = parts.filter(p => p && p.length > 0).pop() || 'Page';
            pageName = name.charAt(0).toUpperCase() + name.slice(1);
          } else {
            pageName = details;
          }
        }
      }
      // 3. Try details field
      else if (activity.details) {
        const details = activity.details;
        source = 'details';
        const urlMatch = details.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
          pageUrl = urlMatch[0];
          const parts = pageUrl.split('/');
          const name = parts.filter(p => p && p.length > 0).pop() || 'Page';
          pageName = name.charAt(0).toUpperCase() + name.slice(1);
        } else {
          pageName = details;
        }
      }
      // 4. Fallback - Use action name
      else {
        source = 'fallback';
        pageName = 'Page Visit';
      }
    }
    // For data_edit action
    else if (activity.action === 'data_edit') {
      // 1. Try pageUrl field
      if (activity.pageUrl) {
        pageUrl = activity.pageUrl;
        source = 'pageUrl';
        try {
          const urlObj = new URL(pageUrl);
          const path = urlObj.pathname;
          const name = path.split('/').filter(p => p && p.length > 0).pop() || 'Page';
          pageName = `Modified: ${name.charAt(0).toUpperCase() + name.slice(1)}`;
        } catch {
          const parts = pageUrl.split('/');
          const name = parts.filter(p => p && p.length > 0).pop() || 'Page';
          pageName = `Modified: ${name.charAt(0).toUpperCase() + name.slice(1)}`;
        }
      }
      // 2. Try actionDetails field
      else if (activity.actionDetails) {
        const details = activity.actionDetails;
        source = 'actionDetails';
        const urlMatch = details.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
          pageUrl = urlMatch[0];
          const parts = pageUrl.split('/');
          const name = parts.filter(p => p && p.length > 0).pop() || 'Page';
          pageName = `Modified: ${name.charAt(0).toUpperCase() + name.slice(1)}`;
        } else {
          const pathMatch = details.match(/(\/[^\s]+)/);
          if (pathMatch) {
            pageUrl = pathMatch[0];
            const parts = pageUrl.split('/');
            const name = parts.filter(p => p && p.length > 0).pop() || 'Page';
            pageName = `Modified: ${name.charAt(0).toUpperCase() + name.slice(1)}`;
          } else {
            // Try to extract what was modified
            const match = details.match(/(?:modified|updated|changed|edited)\s+([a-zA-Z\s]+)/i);
            if (match) {
              pageName = `Modified: ${match[1].trim()}`;
            } else {
              pageName = details;
            }
          }
        }
      }
      // 3. Fallback
      else {
        source = 'fallback';
        pageName = 'Data Modified';
      }
    }
    // For other actions
    else {
      pageName = formatActionName(activity.action);
      // Check if actionDetails contains URL
      if (activity.actionDetails) {
        const urlMatch = activity.actionDetails.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
          pageUrl = urlMatch[0];
        } else {
          const pathMatch = activity.actionDetails.match(/(\/[^\s]+)/);
          if (pathMatch) {
            pageUrl = pathMatch[0];
          }
        }
      }
    }
    
    // If still no page name, use a meaningful fallback
    if (!pageName) {
      pageName = activity.action === 'page_visit' ? 'Page Visit' : 
                 activity.action === 'data_edit' ? 'Data Modified' : 
                 formatActionName(activity.action);
    }
    
    // If no URL, but we have a meaningful page name, we can construct a URL
    if (!pageUrl && pageName && pageName !== 'Page Visit' && pageName !== 'Data Modified') {
      // Try to construct URL from page name
      const pageLower = pageName.toLowerCase();
      if (pageLower.includes('dashboard')) pageUrl = '/dashboard';
      else if (pageLower.includes('employee')) pageUrl = '/employees';
      else if (pageLower.includes('attendance')) pageUrl = '/attendance';
      else if (pageLower.includes('leave')) pageUrl = '/leaves';
      else if (pageLower.includes('expense')) pageUrl = '/expenses';
      else if (pageLower.includes('location')) pageUrl = '/locations';
    }
    
    return { pageName, pageUrl, source };
  };

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">
        {/* Dashboard Header - Title on Left, Date and Filters on Right */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap flex items-center gap-2">
              User <span>Activity Log</span>
            </h1>
          </div>

          {/* Right side: Date + All Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* <div className="emp-dash__date-pill">
              <FiCalendar />
              <span>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div> */}

            {/* Search */}
            <div className="relative min-w-[140px]">
              <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaSearch className="text-[10px]" />
              </span>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[140px] pl-7 pr-2 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Action Filter */}
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none min-w-[100px]"
            >
              <option value="">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="page_visit">Page Visit</option>
              <option value="leave_apply">Leave Applied</option>
              <option value="leave_approve">Leave Approved</option>
              <option value="leave_reject">Leave Rejected</option>
              <option value="payslip_download">Payslip Downloaded</option>
              <option value="data_edit">Data Modified</option>
              <option value="file_download">File Downloaded</option>
            </select>

            {/* Role Filter */}
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none min-w-[90px]"
            >
              <option value="">All Roles</option>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>

            {/* Department */}
            <div className="relative" ref={departmentFilterRef}>
              <button
                onClick={() => setShowDepartmentFilter(!showDepartmentFilter)}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white whitespace-nowrap ${
                  filterDepartment 
                    ? 'border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaBuilding className="text-gray-400 text-[10px]" />
                <span className="truncate max-w-[60px]">{filterDepartment || "Dept"}</span>
                <span className="text-gray-400 text-[10px]">▾</span>
              </button>
              {showDepartmentFilter && (
                <div 
                  className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl min-w-[180px] max-h-60 overflow-y-auto"
                  style={{
                    zIndex: 99999,
                    top: departmentFilterRef.current ? departmentFilterRef.current.getBoundingClientRect().bottom + 4 : 'auto',
                    left: departmentFilterRef.current ? departmentFilterRef.current.getBoundingClientRect().left : 'auto',
                  }}
                >
                  <div 
                    onClick={() => {
                      setFilterDepartment('');
                      setShowDepartmentFilter(false);
                    }}
                    className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                  >
                    All Departments
                  </div>
                  {uniqueDepartments.map(dept => (
                    <div 
                      key={dept}
                      onClick={() => {
                        setFilterDepartment(dept);
                        setShowDepartmentFilter(false);
                      }}
                      className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 ${
                        filterDepartment === dept ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      {dept}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Designation */}
            <div className="relative" ref={designationFilterRef}>
              <button
                onClick={() => setShowDesignationFilter(!showDesignationFilter)}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white whitespace-nowrap ${
                  filterDesignation 
                    ? 'border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaUserTag className="text-gray-400 text-[10px]" />
                <span className="truncate max-w-[60px]">{filterDesignation || "Design"}</span>
                <span className="text-gray-400 text-[10px]">▾</span>
              </button>
              {showDesignationFilter && (
                <div 
                  className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl min-w-[180px] max-h-60 overflow-y-auto"
                  style={{
                    zIndex: 99999,
                    top: designationFilterRef.current ? designationFilterRef.current.getBoundingClientRect().bottom + 4 : 'auto',
                    left: designationFilterRef.current ? designationFilterRef.current.getBoundingClientRect().left : 'auto',
                  }}
                >
                  <div 
                    onClick={() => {
                      setFilterDesignation('');
                      setShowDesignationFilter(false);
                    }}
                    className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                  >
                    All Designations
                  </div>
                  {uniqueDesignations.map(des => (
                    <div 
                      key={des}
                      onClick={() => {
                        setFilterDesignation(des);
                        setShowDesignationFilter(false);
                      }}
                      className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 ${
                        filterDesignation === des ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      {des}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date From */}
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
            />

            {/* Date To */}
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
            />

            {/* Month Picker */}
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
            />

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap"
            >
              Export CSV
            </button>

            {/* Clear Filters Button */}
            {(searchTerm || actionFilter || userRoleFilter || filterDepartment || filterDesignation || fromDate || toDate || selectedMonth !== new Date().toISOString().slice(0, 7) || activeFilter) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
              >
                <FiTrash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Mobile Header - Only Title and Date */}
        <div className="lg:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <h1 className="text-base font-bold whitespace-nowrap">
            User <span className="text-indigo-600">Activity Log</span>
          </h1>
          {/* <div className="emp-dash__date-pill text-[10px] px-2 py-1">
            <FiCalendar className="text-[10px]" />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div> */}
        </div>

        {/* Mobile Filters Toggle */}
        <div className="lg:hidden mb-3">
          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-200">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700"
            >
              <FiFilter className="text-blue-600 text-base" />
              <span>Filters &amp; Actions</span>
              {showMobileFilters ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
            </button>
            <span className="text-xs text-gray-500">
              <strong>{filteredActivities.length}</strong> activities
            </span>
          </div>

          {showMobileFilters && (
            <div className="mt-2 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FaSearch className="text-sm" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search name, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Action</label>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">All Actions</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="page_visit">Page Visit</option>
                  <option value="leave_apply">Leave Applied</option>
                  <option value="leave_approve">Leave Approved</option>
                  <option value="leave_reject">Leave Rejected</option>
                  <option value="payslip_download">Payslip Downloaded</option>
                  <option value="data_edit">Data Modified</option>
                  <option value="file_download">File Downloaded</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">All Roles</option>
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="relative" ref={departmentFilterRef}>
                <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
                <button
                  onClick={() => setShowDepartmentFilter(!showDepartmentFilter)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg border transition-all bg-white ${
                    filterDepartment 
                      ? 'border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50' 
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FaBuilding className="text-gray-400" />
                    {filterDepartment || "All Departments"}
                  </span>
                  <span className="text-gray-400">▾</span>
                </button>
                {showDepartmentFilter && (
                  <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div 
                      onClick={() => {
                        setFilterDepartment('');
                        setShowDepartmentFilter(false);
                      }}
                      className="px-3 py-2.5 text-sm font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                    >
                      All Departments
                    </div>
                    {uniqueDepartments.map(dept => (
                      <div 
                        key={dept}
                        onClick={() => {
                          setFilterDepartment(dept);
                          setShowDepartmentFilter(false);
                        }}
                        className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-blue-50 ${
                          filterDepartment === dept ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                        }`}
                      >
                        {dept}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative" ref={designationFilterRef}>
                <label className="block text-xs font-medium text-gray-600 mb-1">Designation</label>
                <button
                  onClick={() => setShowDesignationFilter(!showDesignationFilter)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg border transition-all bg-white ${
                    filterDesignation 
                      ? 'border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50' 
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FaUserTag className="text-gray-400" />
                    {filterDesignation || "All Designations"}
                  </span>
                  <span className="text-gray-400">▾</span>
                </button>
                {showDesignationFilter && (
                  <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div 
                      onClick={() => {
                        setFilterDesignation('');
                        setShowDesignationFilter(false);
                      }}
                      className="px-3 py-2.5 text-sm font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                    >
                      All Designations
                    </div>
                    {uniqueDesignations.map(des => (
                      <div 
                        key={des}
                        onClick={() => {
                          setFilterDesignation(des);
                          setShowDesignationFilter(false);
                        }}
                        className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-blue-50 ${
                          filterDesignation === des ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                        }`}
                      >
                        {des}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={exportToCSV}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                  >
                    Export CSV
                  </button>
                  {(searchTerm || actionFilter || userRoleFilter || filterDepartment || filterDesignation || fromDate || toDate || selectedMonth !== new Date().toISOString().slice(0, 7) || activeFilter) && (
                    <button
                      onClick={resetFilters}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top KPI Stats Grid */}
        {!loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div 
              onClick={() => handleStatClick('all', 'All')}
              className={`emp-dash__stat cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
                activeFilter === 'All' ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              }`}
            >
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Total Activities</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                  <FiActivity className="text-blue-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">{stats.total}</div>
              <div className="emp-dash__stat-meta">all time</div>
            </div>

            <div 
              onClick={() => handleStatClick('role', 'employee')}
              className={`emp-dash__stat cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
                activeFilter === 'employee' ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              }`}
            >
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Employee Actions</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                  <FiUsers className="text-green-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">{stats.employeeActions}</div>
              <div className="emp-dash__stat-meta">employee logs</div>
            </div>

            <div 
              onClick={() => handleStatClick('role', 'admin')}
              className={`emp-dash__stat cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
                activeFilter === 'admin' ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              }`}
            >
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Admin Actions</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                  <FiShield className="text-amber-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">{stats.adminActions}</div>
              <div className="emp-dash__stat-meta">admin logs</div>
            </div>

            <div 
              onClick={() => handleStatClick('action', 'page_visit')}
              className={`emp-dash__stat cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
                activeFilter === 'page_visit' ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              }`}
            >
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Page Visits</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                  <FaHistory className="text-rose-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">{stats.pageVisits}</div>
              <div className="emp-dash__stat-meta">page views</div>
            </div>
          </div>
        )}

        {/* TABLE - Single table view for both desktop and mobile */}
        <div className="emp-dash__card">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-10 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="emp-dash__spinner"></div>
                  <span className="text-sm font-medium text-gray-500">Loading activities...</span>
                </div>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="py-12 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <FaHistory className="text-4xl text-gray-300" />
                  <p className="text-gray-500 font-medium">No activities found</p>
                  <p className="text-gray-400 text-xs">Try adjusting your filters</p>
                </div>
              </div>
            ) : (
              <table className="emp-dash__table min-w-[850px]">
                <thead>
                  <tr>
                    <th className="text-left">Timestamp</th>
                    <th className="text-left">User</th>
                    <th className="text-center hidden sm:table-cell">Department</th>
                    <th className="text-center hidden md:table-cell">Designation</th>
                    <th className="text-center">Role</th>
                    <th className="text-center">Action</th>
                    <th className="text-center">Page / URL</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredActivities.map((activity, idx) => {
                      const { pageName, pageUrl, source } = getPageInfo(activity);
                      
                      return (
                        <motion.tr
                          key={activity._id || idx}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(idx * 0.03, 0.5) }}
                          className="hover:bg-gray-50/60 transition-all group"
                        >
                          <td className="text-left whitespace-nowrap">
                            <span className="text-xs text-gray-500 font-medium">
                              {new Date(activity.createdAt).toLocaleString("en-IN", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </span>
                          </td>
                          <td className="text-left">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-600 flex-shrink-0">
                                {(activity.userName || "N")[0].toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-xs">
                                  {activity.userName || "N/A"}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {activity.userEmail || activity.userId || "N/A"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="text-center hidden sm:table-cell">
                            <span className="text-xs text-gray-600">{activity.department || "N/A"}</span>
                          </td>
                          <td className="text-center hidden md:table-cell">
                            <span className="text-xs text-gray-600">{activity.designation || "N/A"}</span>
                          </td>
                          <td className="text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                                activity.userRole === "admin"
                                  ? "bg-purple-100 text-purple-700 border border-purple-200"
                                  : "bg-blue-50 text-blue-700 border border-blue-100"
                              }`}
                            >
                              {activity.userRole?.charAt(0).toUpperCase() + activity.userRole?.slice(1) || "N/A"}
                            </span>
                          </td>
                          <td className="text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${getActionBadgeColor(
                                activity.action
                              )}`}
                            >
                              {formatActionName(activity.action)}
                            </span>
                          </td>
                          <td className="text-center">
                            {pageUrl ? (
                              <button
                                onClick={() => handleUrlClick(pageUrl)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all border border-blue-200 hover:border-blue-300 whitespace-nowrap max-w-[220px]"
                                title={pageUrl}
                              >
                                <FaLink className="text-[9px]" />
                                <span className="truncate max-w-[140px]">
                                  {pageName}
                                </span>
                                <FaExternalLinkAlt className="text-[8px] opacity-60" />
                              </button>
                            ) : (
                              <span className="text-xs font-medium text-gray-700 max-w-[150px] block truncate" title={pageName}>
                                {pageName}
                              </span>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>

          {/* ─── PAGINATION SECTION ─── */}
          {!loading && filteredActivities.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span>Showing</span>
                <span className="font-semibold text-gray-900">
                  {filteredActivities.length > 0 ? indexOfFirstItem + 1 : 0}
                </span>
                <span>to</span>
                <span className="font-semibold text-gray-900">
                  {Math.min(indexOfLastItem, pagination.totalCount)}
                </span>
                <span>of</span>
                <span className="font-semibold text-gray-900">
                  {pagination.totalCount}
                </span>
                <span>results</span>

                <select
                  value={pagination.limit}
                  onChange={(e) => {
                    const newLimit = Number(e.target.value);
                    handleItemsPerPageChange(newLimit);
                  }}
                  className="px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      currentPage: prev.currentPage - 1,
                    }))
                  }
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => (
                    page === "..." ? (
                      <span key={index} className="px-2 text-gray-400 text-xs">...</span>
                    ) : (
                      <button
                        key={index}
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            currentPage: page,
                          }))
                        }
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          pagination.currentPage === page
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>

                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      currentPage: prev.currentPage + 1,
                    }))
                  }
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserActivity;