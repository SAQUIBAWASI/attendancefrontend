import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import {
  FaBuilding, FaCalendar, FaClock, FaEdit, FaEye, FaPlus,
  FaSave,
  FaSearch,
  FaClock as FaShift, FaTimes, FaTrash, FaUsers, FaUserTag,
  FaChevronUp,
  FaChevronDown
} from 'react-icons/fa';
import { FiActivity, FiAlertCircle, FiCheckCircle, FiClock as FiClockIcon, FiFilter, FiList, FiUsers, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import StatCard from '../Components/StatCard';
import { API_BASE_URL } from '../config';
import { isEmployeeHidden } from '../utils/employeeStatus';
import "../index.css";
import "./EmployeeDashboard.css";

const ShiftManagement = () => {
  const [masterShifts, setMasterShifts] = useState([]);
  const [employeeAssignments, setEmployeeAssignments] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [employeeCounts, setEmployeeCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCustomCreateModal, setShowCustomCreateModal] = useState(false);
  const [showBrakeShiftModal, setShowBrakeShiftModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showDesignationFilter, setShowDesignationFilter] = useState(false);
  const [showShiftTypeFilter, setShowShiftTypeFilter] = useState(false);
  const [showEditShiftModal, setShowEditShiftModal] = useState(false);

  // Data
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [editingShift, setEditingShift] = useState(null);
  const [viewingShiftType, setViewingShiftType] = useState('');
  const [viewEmployees, setViewEmployees] = useState([]);
  const [viewShiftInfo, setViewShiftInfo] = useState({});

  // Forms
  const [createForm, setCreateForm] = useState({
    shiftType: '',
    shiftName: '',
    shiftCategory: 'Regular',
    timeSlots: [{ slotId: `${Date.now()}_1`, startTime: '', endTime: '', timeRange: '', description: '' }],
    isBrakeShift: false
  });

  const [assignForm, setAssignForm] = useState({
    employeeId: '',
    employeeName: '',
    shiftType: '',
    effectiveFromMonth: '',
    effectiveFromDate: ''
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');
  const [filterShiftType, setFilterShiftType] = useState('');
  const [filteredAssignments, setFilteredAssignments] = useState([]);

  // Unique departments and designations for filter dropdowns
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueDesignations, setUniqueDesignations] = useState([]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pagination states for tables
  const [currentPageAssignments, setCurrentPageAssignments] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Refs for click outside
  const departmentFilterRef = useRef(null);
  const designationFilterRef = useRef(null);
  const shiftTypeFilterRef = useRef(null);

  // Shift categories options
  const shiftCategories = ['Regular', 'Brake', 'Part Time', 'Consultant'];

  // Generate A-Z array for shift names
  const shiftLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // ✅ Convert 24-hour to 12-hour format (AM/PM)
  const convertTo12Hour = (time24) => {
    if (!time24) return '';
    let [hours, minutes] = time24.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return time24;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  // ✅ Convert 12-hour to 24-hour format
  const convertTo24Hour = (time12) => {
    if (!time12) return '';
    const match = time12.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
    if (!match) return time12;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // ✅ Format time for display in 12-hour format
  const formatTimeDisplay = (time) => {
    if (!time) return 'Not set';
    // If already in 12-hour format with AM/PM, return as is
    if (/[AP]M/i.test(time)) return time;
    // Otherwise convert from 24-hour
    return convertTo12Hour(time);
  };

  // ✅ Format time range for display
  const formatTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return 'Not set';
    const start12 = formatTimeDisplay(startTime);
    const end12 = formatTimeDisplay(endTime);
    return `${start12} - ${end12}`;
  };

  const filterInactiveAssignments = (assignments) => {
    if (!Array.isArray(assignments) || !allEmployees.length) return assignments;

    return assignments.filter(assignment => {
      const employeeId = assignment.employeeAssignment?.employeeId || assignment.employeeId;
      if (!employeeId) return true;

      const employee = allEmployees.find(emp =>
        emp.employeeId === employeeId || emp._id === employeeId
      );

      if (!employee) return true;

      return !isEmployeeHidden(employee);
    });
  };

  // Apply filters to assignments
  const applyFilters = () => {
    let filtered = [...employeeAssignments];

    if (searchTerm) {
      filtered = filtered.filter(assignment => {
        const employeeId = getEmployeeId(assignment).toLowerCase();
        const employeeName = getEmployeeName(assignment).toLowerCase();
        const term = searchTerm.toLowerCase();
        return employeeId.includes(term) || employeeName.includes(term);
      });
    }

    if (filterDepartment) {
      filtered = filtered.filter(assignment => {
        const employee = allEmployees.find(emp => 
          emp.employeeId === getEmployeeId(assignment) || emp._id === getEmployeeId(assignment)
        );
        return employee?.department === filterDepartment;
      });
    }

    if (filterDesignation) {
      filtered = filtered.filter(assignment => {
        const employee = allEmployees.find(emp => 
          emp.employeeId === getEmployeeId(assignment) || emp._id === getEmployeeId(assignment)
        );
        return (employee?.role || employee?.designation) === filterDesignation;
      });
    }

    if (filterShiftType) {
      filtered = filtered.filter(assignment => assignment.shiftType === filterShiftType);
    }

    setFilteredAssignments(filtered);
    setCurrentPageAssignments(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDepartment('');
    setFilterDesignation('');
    setFilterShiftType('');
    setFilteredAssignments(employeeAssignments);
    setCurrentPageAssignments(1);
    if (window.innerWidth < 640) {
      setShowMobileFilters(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentFilterRef.current && !departmentFilterRef.current.contains(event.target)) {
        setShowDepartmentFilter(false);
      }
      if (designationFilterRef.current && !designationFilterRef.current.contains(event.target)) {
        setShowDesignationFilter(false);
      }
      if (shiftTypeFilterRef.current && !shiftTypeFilterRef.current.contains(event.target)) {
        setShowShiftTypeFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const extractUniqueValues = (employees) => {
    const depts = new Set();
    const designations = new Set();
    
    employees.forEach(emp => {
      if (emp.department) depts.add(emp.department);
      if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
    });
    
    setUniqueDepartments(Array.from(depts).sort());
    setUniqueDesignations(Array.from(designations).sort());
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      console.log("🔄 Fetching data...");

      try {
        const employeesRes = await axios.get(`${API_BASE_URL}/employees/get-employees`);
        if (Array.isArray(employeesRes.data)) {
          setAllEmployees(employeesRes.data);
          extractUniqueValues(employeesRes.data);
        }
      } catch (e) {
        console.error('❌ Error fetching employees:', e);
      }

      const shiftsRes = await axios.get(`${API_BASE_URL}/shifts/master`);

      if (shiftsRes.data.success) {
        setMasterShifts(shiftsRes.data.data);
      } else {
        setError(shiftsRes.data.message);
      }

      const assignedRes = await axios.get(`${API_BASE_URL}/shifts/assignments`);

      if (assignedRes.data.success) {
        const filteredAssignments = filterInactiveAssignments(assignedRes.data.data);
        setEmployeeAssignments(filteredAssignments);
        setFilteredAssignments(filteredAssignments);
      }

      const countRes = await axios.get(`${API_BASE_URL}/shifts/employee-count`);

      if (countRes.data.success) {
        setEmployeeCounts(countRes.data.data);
      }

    } catch (error) {
      console.error('❌ Fetch error:', error);
      setError('Server connection failed. Check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterDepartment, filterDesignation, filterShiftType, employeeAssignments]);

  const handleEditShift = (shift) => {
    setEditingShift(shift);
    setCreateForm({
      shiftType: shift.shiftType,
      shiftName: shift.shiftName,
      shiftCategory: shift.shiftCategory || 'Regular',
      timeSlots: shift.timeSlots.map((slot, idx) => ({
        ...slot,
        slotId: `${Date.now()}_${idx}`,
        // Convert to 24-hour for form inputs
        startTime: slot.startTime ? convertTo24Hour(slot.startTime) : '',
        endTime: slot.endTime ? convertTo24Hour(slot.endTime) : '',
        timeRange: slot.timeRange || ''
      })),
      isBrakeShift: shift.isBrakeShift || false
    });
    setShowEditShiftModal(true);
  };

  const handleUpdateShift = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!createForm.shiftType || !createForm.shiftName) {
        setError('Please enter shift type and name');
        return;
      }

      // Format time slots with 12-hour display
      const formattedTimeSlots = createForm.timeSlots.map(slot => {
        const formattedSlot = { ...slot };
        if (slot.startTime && slot.endTime) {
          formattedSlot.timeRange = formatTimeRange(slot.startTime, slot.endTime);
        }
        return formattedSlot;
      });

      const response = await axios.put(`${API_BASE_URL}/shifts/master/${editingShift._id}`, {
        shiftType: createForm.shiftType,
        shiftName: createForm.shiftName,
        shiftCategory: createForm.shiftCategory,
        timeSlots: formattedTimeSlots,
        isBrakeShift: createForm.isBrakeShift
      });

      if (response.data.success) {
        setSuccess(`✅ Shift ${createForm.shiftType} updated successfully!`);
        fetchData();
        setShowEditShiftModal(false);
        setEditingShift(null);
        setCreateForm({
          shiftType: '',
          shiftName: '',
          shiftCategory: 'Regular',
          timeSlots: [{ slotId: `${Date.now()}_1`, startTime: '', endTime: '', timeRange: '', description: '' }],
          isBrakeShift: false
        });
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Update shift error:', error);
      setError(error.response?.data?.message || 'Failed to update shift');
    }
  };

  const handleCreateCustomShift = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!createForm.shiftType || !createForm.shiftName) {
        setError('Please enter shift type and name');
        return;
      }

      const slot = { ...createForm.timeSlots[0] };
      if (!slot.startTime || !slot.endTime || !slot.description.trim()) {
        setError('Please fill time slot details');
        return;
      }
      // Format with 12-hour display
      slot.timeRange = formatTimeRange(slot.startTime, slot.endTime);

      const response = await axios.post(`${API_BASE_URL}/shifts/create`, {
        shiftType: createForm.shiftType,
        shiftName: createForm.shiftName,
        shiftCategory: createForm.shiftCategory,
        timeSlots: [slot],
        isBrakeShift: false
      });

      if (response.data.success) {
        setSuccess(`✅ Custom Shift ${createForm.shiftType} created successfully!`);
        fetchData();
        setShowCustomCreateModal(false);
        setCreateForm({
          shiftType: '',
          shiftName: '',
          shiftCategory: 'Regular',
          timeSlots: [{ slotId: `${Date.now()}_1`, startTime: '', endTime: '', timeRange: '', description: '' }],
          isBrakeShift: false
        });
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Create custom error:', error);
      setError(error.response?.data?.message || 'Failed to create custom shift');
    }
  };

  const handleCreateBrakeShift = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!createForm.shiftType || !createForm.shiftName) {
        setError('Please enter shift type and name');
        return;
      }
      
      const slot1 = { ...createForm.timeSlots[0] };
      const slot2 = { ...createForm.timeSlots[1] };
      
      if (!slot1.startTime || !slot1.endTime || !slot2.startTime || !slot2.endTime) {
        setError('Please fill all time slots for Brake Shift');
        return;
      }

      // Format with 12-hour display
      slot1.timeRange = formatTimeRange(slot1.startTime, slot1.endTime);
      slot1.description = "Morning Slot";
      slot2.timeRange = formatTimeRange(slot2.startTime, slot2.endTime);
      slot2.description = "Evening Slot";

      const response = await axios.post(`${API_BASE_URL}/shifts/create`, {
        shiftType: createForm.shiftType,
        shiftName: createForm.shiftName,
        shiftCategory: createForm.shiftCategory,
        timeSlots: [slot1, slot2],
        isBrakeShift: true
      });

      if (response.data.success) {
        setSuccess(`✅ Brake Shift ${createForm.shiftType} created successfully!`);
        fetchData();
        setShowBrakeShiftModal(false);
        setCreateForm({
          shiftType: '',
          shiftName: '',
          shiftCategory: 'Regular',
          timeSlots: [{ slotId: `${Date.now()}_1`, startTime: '', endTime: '', timeRange: '', description: '' }],
          isBrakeShift: false
        });
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Create brake shift error:', error);
      setError(error.response?.data?.message || 'Failed to create brake shift');
    }
  };

  const updateTimeSlot = (field, value) => {
    setCreateForm(prev => ({
      ...prev,
      timeSlots: [{ ...prev.timeSlots[0], [field]: value }]
    }));
  };
  
  const updateBrakeTimeSlot = (index, field, value) => {
    setCreateForm(prev => {
      const newSlots = [...prev.timeSlots];
      if (!newSlots[index]) {
        newSlots[index] = { slotId: `${Date.now()}_${index}`, startTime: '', endTime: '', description: '' };
      }
      newSlots[index] = { ...newSlots[index], [field]: value };
      return { ...prev, timeSlots: newSlots };
    });
  };

  const getShiftTimeSlot = (shiftType) => {
    const shift = masterShifts.find(s => s.shiftType === shiftType);
    return shift?.timeSlots?.[0] || null;
  };

  const getBrakeShiftTimeDisplay = (shift) => {
    if (shift?.isBrakeShift && shift?.timeSlots?.length > 1) {
      return `${shift.timeSlots[0].timeRange || 'Not set'} | ${shift.timeSlots[1].timeRange || 'Not set'}`;
    }
    return shift?.timeSlots?.[0]?.timeRange || "Not set";
  };

  const getEmployeesCount = (shiftType) => {
    return employeeAssignments.filter(a => a.shiftType === shiftType).length;
  };

  const getShiftColor = (type) => {
    const colorMap = {
      "A": "bg-[#EF4444]",
      "B": "bg-[#3B82F6]",
      "C": "bg-[#10B981]",
      "D": "bg-[#F59E0B]",
      "E": "bg-white",
      "F": "bg-[#6B7280]",
      "G": "bg-[#F97316]",
      "H": "bg-[#EC4899]",
      "I": "bg-[#8B5CF6]",
      "J": "bg-[#14B8A6]",
      "K": "bg-[#64748B]"
    };
    return colorMap[type] || "bg-[#3B82F6]";
  };

  const getShiftRowColor = (type) => {
    const colorMap = {
      "A": "bg-red-50/50 hover:bg-red-50",
      "B": "bg-blue-50/50 hover:bg-blue-50",
      "C": "bg-emerald-50/50 hover:bg-emerald-50",
      "D": "bg-amber-50/50 hover:bg-amber-50",
      "E": "bg-gray-50/50 hover:bg-gray-50",
      "F": "bg-slate-50/50 hover:bg-slate-50",
      "G": "bg-orange-50/50 hover:bg-orange-50",
      "H": "bg-pink-50/50 hover:bg-pink-50",
      "I": "bg-purple-50/50 hover:bg-purple-50",
      "J": "bg-teal-50/50 hover:bg-teal-50",
      "K": "bg-slate-100/50 hover:bg-slate-100"
    };
    return colorMap[type] || "bg-white hover:bg-slate-50";
  };

  const getShiftTextColor = (type) => {
    return "text-gray-900";
  };

  const getShiftBorderColor = (type) => {
    return type === "E" ? "border-gray-200" : "border-transparent";
  };

  const getBadgeColor = (type) => {
    const colorMap = {
      "A": "bg-red-100 text-red-700 font-semibold",
      "B": "bg-blue-100 text-blue-700 font-semibold",
      "C": "bg-emerald-100 text-emerald-700 font-semibold",
      "D": "bg-amber-100 text-amber-700 font-semibold",
      "E": "bg-gray-200 text-gray-800 font-semibold",
      "F": "bg-slate-100 text-slate-700 font-semibold",
      "G": "bg-orange-100 text-orange-700 font-semibold",
      "H": "bg-rose-100 text-rose-700 font-semibold",
      "I": "bg-pink-100 text-pink-700 font-semibold",
      "J": "bg-purple-100 text-purple-700 font-semibold",
      "K": "bg-gray-100 text-gray-600 font-semibold"
    };
    return colorMap[type] || "bg-blue-100 text-blue-700 font-semibold";
  };

  const getEmployeeTimeRange = (assignment) => {
    if (assignment.employeeAssignment?.selectedTimeRange) {
      return assignment.employeeAssignment.selectedTimeRange;
    } else if (assignment.startTime && assignment.endTime) {
      // Format in 12-hour
      return formatTimeRange(assignment.startTime, assignment.endTime);
    }
    return "Not specified";
  };

  const getEmployeeDepartment = (employeeId) => {
    const employee = allEmployees.find(emp => 
      emp.employeeId === employeeId || emp._id === employeeId
    );
    return employee?.department || '-';
  };

  const formatMonthInputValue = (dateValue) => {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${date.getFullYear()}-${month}`;
  };

  const formatDateInputValue = (dateValue) => {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  };

  const formatScheduledDate = (dateValue) => {
    if (!dateValue) return '';
    return new Date(dateValue).toLocaleDateString('en-GB');
  };

  const getDefaultFutureMonth = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1, 1);
    return formatMonthInputValue(date);
  };

  const getDefaultFutureDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1, 1);
    return formatDateInputValue(date);
  };

  const openEditAssignment = (assignment) => {
    const scheduled = assignment.employeeAssignment?.scheduledChange;
    const effectiveDate = scheduled?.effectiveFrom
      ? formatDateInputValue(scheduled.effectiveFrom)
      : getDefaultFutureDate();

    setEditingAssignment(assignment);
    setAssignForm({
      employeeId: assignment.employeeAssignment?.employeeId || assignment.employeeId,
      employeeName: assignment.employeeAssignment?.employeeName || assignment.employeeName,
      shiftType: scheduled?.shiftType || assignment.shiftType,
      effectiveFromMonth: effectiveDate ? effectiveDate.slice(0, 7) : getDefaultFutureMonth(),
      effectiveFromDate: effectiveDate
    });
    setShowAssignModal(true);
  };

  const getEmployeeDesignation = (employeeId) => {
    const employee = allEmployees.find(emp => 
      emp.employeeId === employeeId || emp._id === employeeId
    );
    return employee?.role || employee?.designation || '-';
  };

  const handleAssignShift = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const { employeeId, employeeName, shiftType } = assignForm;

      if (!employeeId || !employeeName || !shiftType) {
        setError('Please fill all required fields');
        return;
      }

      const employee = allEmployees.find(emp =>
        emp.employeeId === employeeId || emp._id === employeeId
      );

      if (employee && isEmployeeHidden(employee)) {
        setError(`Cannot assign shift to inactive employee: ${employeeName}`);
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/shifts/assign`, {
        employeeId,
        employeeName,
        shiftType
      });

      if (response.data.success) {
        setSuccess(`✅ Shift assigned to ${employeeName} successfully!`);
        fetchData();
        setShowAssignModal(false);
        setAssignForm({
          employeeId: '',
          employeeName: '',
          shiftType: '',
          effectiveFromMonth: '',
          effectiveFromDate: ''
        });
      } else {
        setError(response.data.message || 'Failed to assign shift');
      }
    } catch (error) {
      console.error('❌ Assign error:', error);
      setError(error.response?.data?.message || 'Failed to assign shift');
    }
  };

  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const { employeeName, shiftType, effectiveFromMonth, effectiveFromDate } = assignForm;

      if (!employeeName || !shiftType) {
        setError('Please fill all required fields');
        return;
      }

      if (!effectiveFromDate && !effectiveFromMonth) {
        setError('Please select an effective from date');
        return;
      }

      const payload = { employeeName, shiftType };
      if (effectiveFromDate) {
        payload.effectiveFrom = effectiveFromDate;
      } else if (effectiveFromMonth) {
        payload.effectiveFrom = `${effectiveFromMonth}-01`;
      }

      const response = await axios.put(
        `${API_BASE_URL}/shifts/assignments/${editingAssignment._id}`,
        payload
      );

      if (response.data.success) {
        setSuccess(response.data.message || '✅ Assignment updated successfully!');
        fetchData();
        setShowAssignModal(false);
        setEditingAssignment(null);
        setAssignForm({
          employeeId: '',
          employeeName: '',
          shiftType: '',
          effectiveFromMonth: '',
          effectiveFromDate: ''
        });
      } else {
        setError(response.data.message || 'Failed to update assignment');
      }
    } catch (error) {
      console.error('❌ Update error:', error);
      setError(error.response?.data?.message || 'Failed to update assignment');
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/shifts/assignments/${id}`);
        if (response.data.success) {
          setSuccess('Shift assignment removed successfully');
          fetchData();
        }
      } catch (error) {
        setError('Failed to delete assignment');
      }
    }
  };

  const handleDeleteMasterShift = async (id, shiftName) => {
    if (window.confirm(`Delete ${shiftName}? This will remove all assignments.`)) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/shifts/master/${id}`);
        if (response.data.success) {
          setSuccess(response.data.message);
          fetchData();
        }
      } catch (error) {
        setError('Failed to delete shift');
      }
    }
  };

  const handleViewEmployees = async (shiftType, shiftName) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/shifts/type/${shiftType}/employees`);
      if (response.data.success) {
        const employees = response.data.data.employees || [];
        const filteredEmployees = filterInactiveAssignments(employees);

        setViewShiftInfo({
          shiftType,
          shiftName,
          isBrakeShift: response.data.data.isBrakeShift || false
        });
        setViewEmployees(filteredEmployees);
        setViewingShiftType(shiftType);
        setShowViewModal(true);
      }
    } catch (error) {
      setError('Failed to fetch employees');
    }
  };

  const handleCreateDefaultShifts = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/shifts/create-defaults`);
      if (response.data.success) {
        setSuccess(`✅ Created ${response.data.createdCount} default shifts (A-D + Brake Shift)`);
        fetchData();
      }
    } catch (error) {
      setError('Failed to create default shifts');
    }
  };

  const getEmployeeName = (assignment) => {
    return assignment.employeeAssignment?.employeeName || assignment.employeeName || "Unknown";
  };

  const getEmployeeId = (assignment) => {
    return assignment.employeeAssignment?.employeeId || assignment.employeeId || "Unknown";
  };

  // Function to format shift display text with time in 12-hour format
  const getShiftDisplayText = (shift) => {
    const timeSlot = shift.timeSlots?.[0];
    const timeStr = timeSlot?.timeRange || 'No time set';
    const descStr = timeSlot?.description ? ` (${timeSlot.description})` : '';
    
    if (shift.isBrakeShift) {
      const morningSlot = shift.timeSlots?.[0];
      const eveningSlot = shift.timeSlots?.[1];
      const brakeTimeStr = morningSlot?.timeRange && eveningSlot?.timeRange 
        ? `${morningSlot.timeRange} & ${eveningSlot.timeRange}` 
        : 'No time set';
      return `Shift ${shift.shiftType}: ${shift.shiftName} (${shift.shiftCategory || 'Regular'}) - ${brakeTimeStr}${shift.isBrakeShift ? ' [Brake]' : ''}`;
    }
    
    return `Shift ${shift.shiftType}: ${shift.shiftName} (${shift.shiftCategory || 'Regular'}) - ${timeStr}${descStr}`;
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPageAssignments(1);
  };

  const handlePrevPage = () => {
    if (currentPageAssignments > 1) setCurrentPageAssignments(currentPageAssignments - 1);
  };

  const handleNextPage = () => {
    if (currentPageAssignments < totalPages) setCurrentPageAssignments(currentPageAssignments + 1);
  };

  const handlePageClick = (page) => {
    setCurrentPageAssignments(page);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPageAssignments - 2 && i <= currentPageAssignments + 2)
      ) {
        pageNumbers.push(i);
      } else if (i === currentPageAssignments - 3 || i === currentPageAssignments + 3) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  const indexOfLastItem = currentPageAssignments * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAssignments = filteredAssignments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 border-b-2 border-blue-700 rounded-full animate-spin"></div>
          <p className="font-semibold text-gray-500">
            Loading shift management...
          </p>
        </div>
      </div>
    );

  return (
    <div className="emp-dash">
      <div className="p-2 sm:p-4 lg:p-6">
        {/* Dashboard Header - Title on Left, Date and Filters on Right */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Shift <span>Management</span>
            </h1>
          </div>

          {/* Right side: Date + All Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative min-w-[150px]">
              <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaSearch className="text-[10px]" />
              </span>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[150px] pl-7 pr-2 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

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
                <span className="truncate max-w-[80px]">{filterDepartment || "Dept"}</span>
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
                <span className="truncate max-w-[80px]">{filterDesignation || "Design"}</span>
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

            {/* Shift Type */}
            <div className="relative" ref={shiftTypeFilterRef}>
              <button
                onClick={() => setShowShiftTypeFilter(!showShiftTypeFilter)}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white whitespace-nowrap ${
                  filterShiftType 
                    ? 'border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaClock className="text-gray-400 text-[10px]" />
                <span className="truncate max-w-[80px]">{filterShiftType ? `Shift ${filterShiftType}` : "Shift"}</span>
                <span className="text-gray-400 text-[10px]">▾</span>
              </button>
              {showShiftTypeFilter && (
                <div 
                  className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl min-w-[180px] max-h-60 overflow-y-auto"
                  style={{
                    zIndex: 99999,
                    top: shiftTypeFilterRef.current ? shiftTypeFilterRef.current.getBoundingClientRect().bottom + 4 : 'auto',
                    left: shiftTypeFilterRef.current ? shiftTypeFilterRef.current.getBoundingClientRect().left : 'auto',
                  }}
                >
                  <div
                    onClick={() => {
                      setFilterShiftType('');
                      setShowShiftTypeFilter(false);
                    }}
                    className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                  >
                    All Shifts
                  </div>
                  {masterShifts.map(shift => (
                    <div
                      key={shift._id}
                      onClick={() => {
                        setFilterShiftType(shift.shiftType);
                        setShowShiftTypeFilter(false);
                      }}
                      className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 ${
                        filterShiftType === shift.shiftType ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      {getShiftDisplayText(shift)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Create Defaults Button */}
            {masterShifts.length === 0 && (
              <button
                onClick={handleCreateDefaultShifts}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap"
              >
                <FaPlus className="w-3 h-3" />
                Defaults
              </button>
            )}

            {/* Regular Button */}
            <button
              onClick={() => setShowCustomCreateModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap"
            >
              <FaPlus className="w-3 h-3" />
              Regular
            </button>

            {/* Brake Button */}
            <button
              onClick={() => setShowBrakeShiftModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-green-600 to-pink-600 rounded-lg hover:from-green-700 hover:to-pink-700 transition-all shadow-sm whitespace-nowrap"
            >
              <FaPlus className="w-3 h-3" />
              Brake
            </button>

            {/* Assign Button */}
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap"
            >
              <FaClock className="w-3 h-3" />
              Assign
            </button>

            {/* Clear Filters Button */}
            {(searchTerm || filterDepartment || filterDesignation || filterShiftType) && (
              <button
                onClick={clearFilters}
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
            Shift <span className="text-indigo-600">Management</span>
          </h1>
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
              <strong>{filteredAssignments.length}</strong> assignments
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
                    placeholder="Search by ID or Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
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

              <div className="relative" ref={shiftTypeFilterRef}>
                <label className="block text-xs font-medium text-gray-600 mb-1">Shift Type</label>
                <button
                  onClick={() => setShowShiftTypeFilter(!showShiftTypeFilter)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg border transition-all bg-white ${
                    filterShiftType 
                      ? 'border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50' 
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FaClock className="text-gray-400" />
                    {filterShiftType ? `Shift ${filterShiftType}` : "All Shifts"}
                  </span>
                  <span className="text-gray-400">▾</span>
                </button>
                {showShiftTypeFilter && (
                  <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div
                      onClick={() => {
                        setFilterShiftType('');
                        setShowShiftTypeFilter(false);
                      }}
                      className="px-3 py-2.5 text-sm font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                    >
                      All Shifts
                    </div>
                    {masterShifts.map(shift => (
                      <div
                        key={shift._id}
                        onClick={() => {
                          setFilterShiftType(shift.shiftType);
                          setShowShiftTypeFilter(false);
                        }}
                        className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-blue-50 ${
                          filterShiftType === shift.shiftType ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                        }`}
                      >
                        {getShiftDisplayText(shift)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-200 space-y-2">
                {masterShifts.length === 0 && (
                  <button
                    onClick={handleCreateDefaultShifts}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                  >
                    <FaPlus className="w-4 h-4" />
                    Create Defaults
                  </button>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowCustomCreateModal(true)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                  >
                    <FaPlus className="w-4 h-4" />
                    Regular
                  </button>
                  <button
                    onClick={() => setShowBrakeShiftModal(true)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-pink-600 rounded-lg hover:from-green-700 hover:to-pink-700 transition-all shadow-sm"
                  >
                    <FaPlus className="w-4 h-4" />
                    Brake
                  </button>
                </div>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                >
                  <FaClock className="w-4 h-4" />
                  Assign
                </button>
                {(filterDepartment || filterDesignation || filterShiftType || searchTerm) && (
                  <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Top KPI Stats Grid - 2 per row on mobile, 3 per row on desktop */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
            <div className="emp-dash__stat">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Total Shifts</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                  <FiList />
                </div>
              </div>
              <div className="emp-dash__stat-value">{masterShifts.length}</div>
              <div className="emp-dash__stat-meta">available shifts</div>
            </div>

            <div className="emp-dash__stat">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Assigned</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                  <FiCheckCircle />
                </div>
              </div>
              <div className="emp-dash__stat-value">{employeeAssignments.length}</div>
              <div className="emp-dash__stat-meta">employee assignments</div>
            </div>

            <div className="emp-dash__stat col-span-2 md:col-span-1">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Active Employees</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                  <FiUsers />
                </div>
              </div>
              <div className="emp-dash__stat-value">{allEmployees.length}</div>
              <div className="emp-dash__stat-meta">total employees</div>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="p-3 mb-4 text-sm text-green-700 bg-blue-100 border border-green-200 rounded-lg">
            ✅ {success}
          </div>
        )}

        {/* TWO COLUMN LAYOUT: Available Shifts LEFT | Assigned Employees RIGHT */}
        <div className="flex flex-col gap-5 lg:flex-row">
          
          {/* LEFT COLUMN - Available Shifts */}
          <div className="lg:w-2/5">
            <div className="emp-dash__card">
              <div className="emp-dash__card-header">
                <div>
                  <h3 className="emp-dash__card-title flex items-center gap-2">
                    <FaClock className="text-blue-600" /> Available Shifts
                  </h3>
                  <p className="emp-dash__card-desc">
                    {masterShifts.length} shift{masterShifts.length !== 1 ? 's' : ''} configured · Click actions to manage
                  </p>
                </div>
              </div>

              <div className="emp-dash__card-body">
                {masterShifts.length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="mb-3 text-4xl">⏰</div>
                    <h3 className="mb-1 text-sm font-semibold text-gray-600">No shifts created yet</h3>
                    <p className="mb-4 text-xs text-gray-500">Create your first shift to get started</p>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => setShowCustomCreateModal(true)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        + Regular Shift
                      </button>
                      <button
                        onClick={() => setShowBrakeShiftModal(true)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors shadow-sm"
                      >
                        + Brake Shift
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[65vh] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                    {masterShifts.map((shift) => {
                      const timeSlot = shift.timeSlots?.[0];
                      const employeeCount = getEmployeesCount(shift.shiftType);
                      const shiftColor = getShiftColor(shift.shiftType);
                      const textColor = getShiftTextColor();
                      const borderColor = getShiftBorderColor(shift.shiftType);
                      const isBrakeShift = shift.isBrakeShift;

                      // Get display times in 12-hour format
                      let timeDisplay = 'Not set';
                      if (isBrakeShift) {
                        timeDisplay = getBrakeShiftTimeDisplay(shift);
                      } else if (timeSlot?.timeRange) {
                        timeDisplay = timeSlot.timeRange;
                      } else if (timeSlot?.startTime && timeSlot?.endTime) {
                        timeDisplay = formatTimeRange(timeSlot.startTime, timeSlot.endTime);
                      }

                      return (
                        <div
                          key={shift._id}
                          className={`p-3 border rounded-xl shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${shiftColor} ${borderColor} ${textColor}`}
                        >
                          <div className="flex items-start justify-between mb-1.5">
                            <div className="flex items-start gap-2">
                              <div className="p-1.5 rounded-lg bg-white/50 text-gray-900 shadow-sm">
                                <FaClock className="text-sm" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-bold text-gray-900">
                                    Shift {shift.shiftType}
                                  </span>
                                  {isBrakeShift && (
                                    <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-white/60 text-gray-800 uppercase tracking-wider">Brake</span>
                                  )}
                                </div>
                                <div className="text-xs font-semibold text-gray-900 mt-0.5">
                                  {shift.shiftName}
                                </div>
                                <div className="text-[10px] font-medium text-gray-700 mt-0.5">
                                  {shift.shiftCategory || 'Regular'}
                                </div>
                              </div>
                            </div>

                            <div className="text-right bg-white/40 rounded-lg px-2.5 py-1.5 shadow-sm">
                              <div className="text-base font-bold text-gray-900">{employeeCount}</div>
                              <div className="text-[8px] text-gray-700 font-medium uppercase tracking-wider">employees</div>
                            </div>
                          </div>

                          <div className="my-2 px-2 py-1.5 border-l-3 border-gray-900/25 bg-white/20 rounded-r-lg">
                            <div className="text-xs font-semibold text-gray-900">
                              {timeDisplay}
                            </div>
                            <p className="text-[10px] truncate text-gray-800 mt-0.5">
                              {isBrakeShift ?
                                (shift.timeSlots?.[0]?.description ? `${shift.timeSlots[0].description}` : "Brake shift") :
                                (timeSlot?.description || "No description")}
                            </p>
                          </div>

                          <div className="flex gap-1.5 mt-2.5 pt-2 border-t border-gray-900/10">
                            <button
                              onClick={() => handleViewEmployees(shift.shiftType, shift.shiftName)}
                              disabled={employeeCount === 0}
                              className={`flex-1 px-2 py-1.5 text-[10px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                                employeeCount > 0
                                  ? 'bg-white/50 text-gray-900 hover:bg-white/70 shadow-sm'
                                  : 'bg-black/10 text-gray-900/40 cursor-not-allowed'
                              }`}
                            >
                              <FaEye className="text-[9px]" /> View
                            </button>
                            <button
                              onClick={() => handleEditShift(shift)}
                              className="flex-1 px-2 py-1.5 text-[10px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-all bg-white/50 text-gray-900 hover:bg-white/70 shadow-sm"
                            >
                              <FaEdit className="text-[9px]" /> Edit
                            </button>
                            <button
                              onClick={() => {
                                setAssignForm({
                                  employeeId: '',
                                  employeeName: '',
                                  shiftType: shift.shiftType
                                });
                                setEditingAssignment(null);
                                setShowAssignModal(true);
                              }}
                              className="flex-1 px-2 py-1.5 text-[10px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-all bg-white/50 text-gray-900 hover:bg-white/70 shadow-sm"
                            >
                              <FaPlus className="text-[9px]" /> Add
                            </button>
                            <button
                              onClick={() => handleDeleteMasterShift(shift._id, shift.shiftName)}
                              className="px-2 py-1.5 text-[10px] font-semibold rounded-lg transition-all bg-white/50 text-gray-900 hover:bg-red-500 hover:text-white shadow-sm"
                            >
                              <FaTimes className="text-[9px]" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Assigned Employees Table */}
          <div className="lg:w-3/5">
            <div className="emp-dash__card">
              <div className="emp-dash__card-header">
                <div>
                  <h3 className="emp-dash__card-title flex items-center gap-2">
                    <FaUsers className="text-green-600" /> Assigned Employees
                  </h3>
                  <p className="emp-dash__card-desc">
                    {employeeAssignments.length > 0
                      ? `Showing ${filteredAssignments.length} of ${employeeAssignments.length} assignments`
                      : 'No shift assignments yet'}
                    {(filterDepartment || filterDesignation || filterShiftType || searchTerm) && ' · Filters active'}
                  </p>
                </div>
              </div>

              {employeeAssignments.length === 0 ? (
                <div className="emp-dash__card-body py-12 text-center text-gray-500">
                  <div className="text-4xl mb-3">👥</div>
                  <p className="text-sm font-medium text-gray-600">No shift assignments yet</p>
                  <p className="text-xs text-gray-400 mt-1">Assign employees to shifts using the Available Shifts panel</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="emp-dash__table min-w-[900px]">
                      <thead>
                        <tr>
                          <th className="whitespace-nowrap">Emp ID</th>
                          <th className="whitespace-nowrap">Name</th>
                          <th className="whitespace-nowrap hidden sm:table-cell">Department</th>
                          <th className="whitespace-nowrap hidden md:table-cell">Designation</th>
                          <th className="whitespace-nowrap text-center">Shift</th>
                          <th className="whitespace-nowrap text-center hidden lg:table-cell">Time</th>
                          <th className="whitespace-nowrap text-center">Upcoming</th>
                          <th className="whitespace-nowrap text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentAssignments.length > 0 ? (
                          currentAssignments.map((assignment) => {
                            const timeSlot = getShiftTimeSlot(assignment.shiftType);
                            const employeeName = getEmployeeName(assignment);
                            const employeeId = getEmployeeId(assignment);
                            const department = getEmployeeDepartment(employeeId);
                            const designation = getEmployeeDesignation(employeeId);
                            const shift = masterShifts.find(s => s.shiftType === assignment.shiftType);
                            const isBrakeShift = shift?.isBrakeShift || false;
                            const scheduled = assignment.employeeAssignment?.scheduledChange;

                            // Get time display in 12-hour format
                            let timeDisplay = 'Not set';
                            if (isBrakeShift && shift) {
                              timeDisplay = getBrakeShiftTimeDisplay(shift);
                            } else if (timeSlot?.timeRange) {
                              timeDisplay = timeSlot.timeRange;
                            } else if (assignment.startTime && assignment.endTime) {
                              timeDisplay = formatTimeRange(assignment.startTime, assignment.endTime);
                            } else if (timeSlot?.startTime && timeSlot?.endTime) {
                              timeDisplay = formatTimeRange(timeSlot.startTime, timeSlot.endTime);
                            }

                            return (
                              <tr key={assignment._id} className="hover:bg-gray-50/60 transition-all">
                                <td className="font-semibold text-gray-900 whitespace-nowrap text-xs">{employeeId}</td>
                                <td className="font-semibold text-gray-900 whitespace-nowrap text-xs">{employeeName}</td>
                                <td className="text-gray-600 truncate max-w-[120px] hidden sm:table-cell text-xs" title={department}>{department}</td>
                                <td className="text-gray-600 truncate max-w-[120px] hidden md:table-cell text-xs" title={designation}>{designation}</td>
                                <td className="text-center">
                                  <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full ${getBadgeColor(assignment.shiftType)}`}>
                                    {assignment.shiftType}{isBrakeShift ? ' (B)' : ''}
                                  </span>
                                </td>
                                <td className="text-center text-gray-600 font-medium whitespace-nowrap hidden lg:table-cell text-xs">
                                  {timeDisplay}
                                </td>
                                <td className="text-center">
                                  {scheduled?.shiftType ? (
                                    <span className="px-2 py-1 text-[10px] font-medium text-purple-700 bg-purple-100 rounded-full whitespace-nowrap">
                                      Shift {scheduled.shiftType} from {formatScheduledDate(scheduled.effectiveFrom)}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">—</span>
                                  )}
                                </td>
                                <td className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <button
                                      onClick={() => openEditAssignment(assignment)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      title="Edit Assignment"
                                    >
                                      <FaEdit className="text-xs" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAssignment(assignment._id)}
                                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Remove Assignment"
                                    >
                                      <FaTrash className="text-xs" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="8" className="py-8 text-center text-gray-400">
                              <div className="text-2xl mb-2">🔍</div>
                              No assignments match current filters
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {filteredAssignments.length > 0 && (
                    <div className="emp-dash__card-body" style={{ borderTop: '1px solid var(--ed-border-light)', padding: '0.75rem 1rem' }}>
                      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-gray-500">Rows per page:</label>
                          <select
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="px-2 py-1 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                          </select>
                          <span className="text-xs text-gray-400">
                            Page {currentPageAssignments} of {totalPages}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={handlePrevPage}
                            disabled={currentPageAssignments === 1}
                            className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-all ${
                              currentPageAssignments === 1
                                ? "text-gray-300 bg-gray-50 border-gray-200 cursor-not-allowed"
                                : "text-blue-600 bg-white border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                            }`}
                          >
                            ← Prev
                          </button>

                          {getPageNumbers().map((page, index) => (
                            <button
                              key={index}
                              onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
                              disabled={page === "..."}
                              className={`px-2.5 py-1.5 text-xs font-medium border rounded-lg transition-all ${
                                page === "..."
                                  ? "text-gray-400 cursor-default border-transparent"
                                  : currentPageAssignments === page
                                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                  : "text-gray-600 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                              }`}
                            >
                              {page}
                            </button>
                          ))}

                          <button
                            onClick={handleNextPage}
                            disabled={currentPageAssignments === totalPages}
                            className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-all ${
                              currentPageAssignments === totalPages
                                ? "text-gray-300 bg-gray-50 border-gray-200 cursor-not-allowed"
                                : "text-blue-600 bg-white border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                            }`}
                          >
                            Next →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ==================== MODALS ==================== */}

        {/* ✅ Custom Create Modal */}
        {showCustomCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Create Custom Shift</h3>
                <button onClick={() => setShowCustomCreateModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <FaTimes className="text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={handleCreateCustomShift}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type (A-Z)</label>
                    <input
                      type="text"
                      maxLength="1"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={createForm.shiftType}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, shiftType: e.target.value.toUpperCase() }))}
                      placeholder="e.g. A"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shift Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={createForm.shiftName}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, shiftName: e.target.value }))}
                      placeholder="e.g. Morning Shift"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={createForm.shiftCategory}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, shiftCategory: e.target.value }))}
                    >
                      {shiftCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={createForm.timeSlots[0].startTime}
                      onChange={(e) => updateTimeSlot('startTime', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={createForm.timeSlots[0].endTime}
                      onChange={(e) => updateTimeSlot('endTime', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={createForm.timeSlots[0].description}
                      onChange={(e) => updateTimeSlot('description', e.target.value)}
                      placeholder="e.g. Full day shift"
                    />
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}
                  {success && <p className="text-sm text-green-600">{success}</p>}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCustomCreateModal(false)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Create Shift
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ✅ Brake Shift Modal */}
        {showBrakeShiftModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Create Brake Shift</h3>
                <button onClick={() => setShowBrakeShiftModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <FaTimes className="text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={handleCreateBrakeShift}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type (A-Z)</label>
                    <input
                      type="text"
                      maxLength="1"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={createForm.shiftType}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, shiftType: e.target.value.toUpperCase() }))}
                      placeholder="e.g. A"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shift Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={createForm.shiftName}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, shiftName: e.target.value }))}
                      placeholder="e.g. Brake Shift A"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={createForm.shiftCategory}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, shiftCategory: e.target.value }))}
                    >
                      {shiftCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-3">
                    <p className="text-sm font-semibold text-blue-700 mb-2">Morning Slot</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                        <input
                          type="time"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          value={createForm.timeSlots[0]?.startTime || ''}
                          onChange={(e) => updateBrakeTimeSlot(0, 'startTime', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
                        <input
                          type="time"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          value={createForm.timeSlots[0]?.endTime || ''}
                          onChange={(e) => updateBrakeTimeSlot(0, 'endTime', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-pink-500 pl-3">
                    <p className="text-sm font-semibold text-pink-700 mb-2">Evening Slot</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                        <input
                          type="time"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          value={createForm.timeSlots[1]?.startTime || ''}
                          onChange={(e) => updateBrakeTimeSlot(1, 'startTime', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
                        <input
                          type="time"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          value={createForm.timeSlots[1]?.endTime || ''}
                          onChange={(e) => updateBrakeTimeSlot(1, 'endTime', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}
                  {success && <p className="text-sm text-green-600">{success}</p>}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowBrakeShiftModal(false)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-pink-600 rounded-lg hover:from-green-700 hover:to-pink-700 transition-colors shadow-sm"
                    >
                      Create Brake Shift
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ✅ Edit Shift Modal */}
        {showEditShiftModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Edit Shift</h3>
                <button onClick={() => setShowEditShiftModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <FaTimes className="text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={handleUpdateShift}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type (A-Z)</label>
                    <input
                      type="text"
                      maxLength="1"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={createForm.shiftType}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, shiftType: e.target.value.toUpperCase() }))}
                      placeholder="e.g. A"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shift Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={createForm.shiftName}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, shiftName: e.target.value }))}
                      placeholder="e.g. Morning Shift"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={createForm.shiftCategory}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, shiftCategory: e.target.value }))}
                    >
                      {shiftCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {createForm.timeSlots.map((slot, index) => (
                    <div key={slot.slotId || index} className="border-t border-gray-200 pt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Time Slot {index + 1}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                          <input
                            type="time"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={slot.startTime || ''}
                            onChange={(e) => {
                              const newSlots = [...createForm.timeSlots];
                              newSlots[index].startTime = e.target.value;
                              setCreateForm(prev => ({ ...prev, timeSlots: newSlots }));
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
                          <input
                            type="time"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={slot.endTime || ''}
                            onChange={(e) => {
                              const newSlots = [...createForm.timeSlots];
                              newSlots[index].endTime = e.target.value;
                              setCreateForm(prev => ({ ...prev, timeSlots: newSlots }));
                            }}
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          value={slot.description || ''}
                          onChange={(e) => {
                            const newSlots = [...createForm.timeSlots];
                            newSlots[index].description = e.target.value;
                            setCreateForm(prev => ({ ...prev, timeSlots: newSlots }));
                          }}
                          placeholder="Slot description"
                        />
                      </div>
                    </div>
                  ))}

                  {error && <p className="text-sm text-red-600">{error}</p>}
                  {success && <p className="text-sm text-green-600">{success}</p>}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEditShiftModal(false)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Update Shift
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ✅ Assign Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingAssignment ? 'Edit Assignment' : 'Assign Shift to Employee'}
                </h3>
                <button 
                  onClick={() => {
                    setShowAssignModal(false);
                    setEditingAssignment(null);
                  }} 
                  className="p-1.5 hover:bg-gray-100 rounded-lg"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={editingAssignment ? handleUpdateAssignment : handleAssignShift}>
                <div className="space-y-4">
                  {!editingAssignment && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          value={assignForm.employeeId}
                          onChange={(e) => setAssignForm(prev => ({ ...prev, employeeId: e.target.value }))}
                          placeholder="Enter Employee ID"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          value={assignForm.employeeName}
                          onChange={(e) => setAssignForm(prev => ({ ...prev, employeeName: e.target.value }))}
                          placeholder="Enter Employee Name"
                          required
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type</label>
                    <select
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={assignForm.shiftType}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, shiftType: e.target.value }))}
                      required
                    >
                      <option value="">Select Shift</option>
                      {masterShifts.map(shift => (
                        <option key={shift._id} value={shift.shiftType}>
                          Shift {shift.shiftType} - {shift.shiftName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {editingAssignment && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Effective From Date</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          value={assignForm.effectiveFromDate}
                          onChange={(e) => {
                            const newDate = e.target.value;
                            setAssignForm(prev => ({
                              ...prev,
                              effectiveFromDate: newDate,
                              effectiveFromMonth: newDate ? newDate.slice(0, 7) : ''
                            }));
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Effective From Month</label>
                        <input
                          type="month"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          value={assignForm.effectiveFromMonth}
                          onChange={(e) => {
                            const newMonth = e.target.value;
                            setAssignForm(prev => ({
                              ...prev,
                              effectiveFromMonth: newMonth,
                              effectiveFromDate: newMonth ? `${newMonth}-01` : ''
                            }));
                          }}
                        />
                      </div>
                    </>
                  )}

                  {error && <p className="text-sm text-red-600">{error}</p>}
                  {success && <p className="text-sm text-green-600">{success}</p>}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAssignModal(false);
                        setEditingAssignment(null);
                      }}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      {editingAssignment ? 'Update Assignment' : 'Assign Shift'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ✅ View Modal */}
        {showViewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Employees in Shift {viewShiftInfo.shiftType}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {viewShiftInfo.shiftName} {viewShiftInfo.isBrakeShift ? '· Brake Shift' : ''}
                  </p>
                </div>
                <button onClick={() => setShowViewModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <FaTimes className="text-gray-500" />
                </button>
              </div>

              {viewEmployees.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <div className="text-4xl mb-2">👤</div>
                  <p>No employees assigned to this shift</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Emp ID</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 hidden sm:table-cell">Department</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 hidden md:table-cell">Designation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewEmployees.map((emp, idx) => (
                        <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-2 text-xs font-medium text-gray-900">
                            {emp.employeeId || emp._id}
                          </td>
                          <td className="px-4 py-2 text-xs text-gray-700">
                            {emp.employeeName || emp.name || 'Unknown'}
                          </td>
                          <td className="px-4 py-2 text-xs text-gray-600 hidden sm:table-cell">
                            {emp.department || '-'}
                          </td>
                          <td className="px-4 py-2 text-xs text-gray-600 hidden md:table-cell">
                            {emp.role || emp.designation || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Total: {viewEmployees.length} employee{viewEmployees.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftManagement;