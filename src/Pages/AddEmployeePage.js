import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  FaBuilding,
  FaCalendarAlt,
  FaChartLine,
  FaCheck,
  FaEye, FaEyeSlash,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaSave,
  FaSpinner,
  FaUniversity,
  FaUser,
  FaUsers,
  FaIdCard,
  FaFilePdf,
  FaFileImage,
  FaTimes as FaTimesIcon,
} from "react-icons/fa";
import { FiUploadCloud, FiX } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const PINCODE_DATA = {
  "110001": { city: "New Delhi", state: "Delhi" },
  "400001": { city: "Mumbai", state: "Maharashtra" },
  "700001": { city: "Kolkata", state: "West Bengal" },
  "600001": { city: "Chennai", state: "Tamil Nadu" },
  "560001": { city: "Bengaluru", state: "Karnataka" },
  "380001": { city: "Ahmedabad", state: "Gujarat" },
  "302001": { city: "Jaipur", state: "Rajasthan" },
  "411001": { city: "Pune", state: "Maharashtra" },
  "800001": { city: "Patna", state: "Bihar" },
  "500001": { city: "Hyderabad", state: "Telangana" },
  "847301": { city: "Samastipur", state: "Bihar" },
};

const getCityStateFromPincode = async (pincode) => {
  try {
    if (PINCODE_DATA[pincode]) return PINCODE_DATA[pincode];
    try {
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
      if (response.data && response.data[0] && response.data[0].Status === "Success") {
        const postOffice = response.data[0].PostOffice[0];
        return { city: postOffice.District || postOffice.Name, state: postOffice.State, country: "India" };
      }
    } catch (apiError) { console.warn("External API failed"); }
    return null;
  } catch (error) { return null; }
};

const formatFullAddress = (addressData) => {
  const { addressLine1, addressLine2, city, state, pinCode, country } = addressData;
  let address = addressLine1 || '';
  if (addressLine2) address += `, ${addressLine2}`;
  if (city) address += `, ${city}`;
  if (state) address += `, ${state}`;
  if (pinCode) address += ` - ${pinCode}`;
  if (country) address += `, ${country}`;
  return address;
};

const AddEmployeePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editingEmployee = location.state?.employee || null;
  const searchTimeoutRef = useRef(null);

  // SECTION 1: BASIC
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [parentsName, setParentsName] = useState("");
  const [alternateNumber, setAlternateNumber] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [country, setCountry] = useState("India");

  // SECTION 2: OFFICE
  const [employeeId, setEmployeeId] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [locationId, setLocationId] = useState("");
  const [reportingManager, setReportingManager] = useState("");
  const [employmentType, setEmploymentType] = useState("fulltime");

  // SECTION 3: BANK & DOCUMENTS
  const [bankName, setBankName] = useState("");
  const [bankAccountNo, setBankAccountNo] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [uanNumber, setUanNumber] = useState("");
  const [pfNumber, setPfNumber] = useState("");
  const [esicNumber, setEsicNumber] = useState("");

  // ✅ NEW: Document states
  const [panDocument, setPanDocument] = useState(null);
  const [panDocumentUrl, setPanDocumentUrl] = useState("");
  const [panDocumentFileName, setPanDocumentFileName] = useState("");
  const [panDocumentFileType, setPanDocumentFileType] = useState("");
  const [panDocumentFileSize, setPanDocumentFileSize] = useState(0);
  const [uploadingPanDoc, setUploadingPanDoc] = useState(false);

  const [aadharDocument, setAadharDocument] = useState(null);
  const [aadharDocumentUrl, setAadharDocumentUrl] = useState("");
  const [aadharDocumentFileName, setAadharDocumentFileName] = useState("");
  const [aadharDocumentFileType, setAadharDocumentFileType] = useState("");
  const [aadharDocumentFileSize, setAadharDocumentFileSize] = useState(0);
  const [uploadingAadharDoc, setUploadingAadharDoc] = useState(false);

  const panFileInputRef = useRef(null);
  const aadharFileInputRef = useRef(null);

  // SECTION 4: SALARY
  const [basicPay, setBasicPay] = useState("");
  const [hra, setHra] = useState("");
  const [conveyanceAllowance, setConveyanceAllowance] = useState("");
  const [medicalAllowance, setMedicalAllowance] = useState("");
  const [performanceAllowance, setPerformanceAllowance] = useState("");
  const [specialAllowance, setSpecialAllowance] = useState("");
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [ptax, setPtax] = useState("");
  const [gmc, setGmc] = useState("");
  const [gmcAmount, setGmcAmount] = useState("");
  const [otherDeductions, setOtherDeductions] = useState("");
  const [totalDeductions, setTotalDeductions] = useState(0);
  const [netSalary, setNetSalary] = useState(0);
  const [ctc, setCtc] = useState("");
  const [salaryEffectiveDate, setSalaryEffectiveDate] = useState(new Date().toISOString().split('T')[0]);

  // SECTION 5: HR
  const [shiftType, setShiftType] = useState("");
  const [shiftStartTime, setShiftStartTime] = useState("09:00");
  const [shiftEndTime, setShiftEndTime] = useState("18:00");
  const [shiftHours, setShiftHours] = useState("");
  const [shiftTimeSlots, setShiftTimeSlots] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [weekOffsPerMonth, setWeekOffsPerMonth] = useState("0");
  const [maxCL, setMaxCL] = useState("0");
  const [maxSL, setMaxSL] = useState("0");
  const [maxEL, setMaxEL] = useState("0");
  const [showShiftDetails, setShowShiftDetails] = useState(false);
  const [weekOffDay, setWeekOffDay] = useState("Sunday");
  const [maxCompOff, setMaxCompOff] = useState("0");

  // SECTION 6: INCREMENT
  const [incrementType, setIncrementType] = useState("");
  const [incrementValue, setIncrementValue] = useState("");
  const [incrementEffectiveDate, setIncrementEffectiveDate] = useState("");
  const [incrementReason, setIncrementReason] = useState("");
  const [showIncrementSuccess, setShowIncrementSuccess] = useState(false);

  // Dropdowns
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [shiftList, setShiftList] = useState([]);
  const [managers, setManagers] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [employeeFound, setEmployeeFound] = useState(false);
  const [searchedPhone, setSearchedPhone] = useState("");

  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [fetchingCandidates, setFetchingCandidates] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [phoneSuggestions, setPhoneSuggestions] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  
  const [createShiftForm, setCreateShiftForm] = useState({ shiftType: '', shiftName: '', timeRange: '', description: '' });
  const [deptForm, setDeptForm] = useState({ name: '', description: '' });
  const [roleForm, setRoleForm] = useState({ name: '', description: '' });
  const [locationForm, setLocationForm] = useState({ name: '', latitude: '', longitude: '', fullAddress: '' });

  // Auto-calc salary
  useEffect(() => {
    const earnings = (parseFloat(basicPay) || 0) + (parseFloat(hra) || 0) + 
                     (parseFloat(conveyanceAllowance) || 0) + (parseFloat(medicalAllowance) || 0) + 
                     (parseFloat(performanceAllowance) || 0) + (parseFloat(specialAllowance) || 0);
    setTotalEarnings(earnings);
  }, [basicPay, hra, conveyanceAllowance, medicalAllowance, performanceAllowance, specialAllowance]);

  useEffect(() => {
    const deductions = (parseFloat(ptax) || 0) + (parseFloat(gmcAmount) || 0) + (parseFloat(otherDeductions) || 0);
    setTotalDeductions(deductions);
    setNetSalary(totalEarnings - deductions);
  }, [ptax, gmcAmount, otherDeductions, totalEarnings]);

  const formatShiftTimeRangeLabel = (timeRange) => {
    if (!timeRange) return "";
    const parts = String(timeRange).split(/\s*-\s*/).map((part) => part.trim());
    if (parts.length >= 2) return `${parts[0]} TO ${parts[parts.length - 1]}`;
    return String(timeRange).replace(/\s*-\s*/g, " TO ");
  };

  const getShiftOptionLabel = (shift) => {
    const shiftName = shift.shiftName || `Shift ${shift.shiftType}`;
    const timeSlots = shift.timeSlots || [];
    const timeLabels = timeSlots.map((slot) => slot.timeRange).filter(Boolean).map((range) => `[ ${formatShiftTimeRangeLabel(range)} ]`);
    const timeText = timeLabels.length ? ` with time ${timeLabels.join(" & ")}` : "";
    const brakeText = shift.isBrakeShift ? " (Brake Shift)" : "";
    return `Shift ${shift.shiftType} : ${shiftName}${timeText}${brakeText}`;
  };

  const calculateTotalHours = (timeSlots) => {
    if (!timeSlots || timeSlots.length === 0) return 0;
    const parseTimeToMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (!match) return 0;
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const ampm = match[3]?.toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };
    let totalMinutes = 0;
    timeSlots.forEach(slot => {
      const parts = slot.timeRange.split(/[-]| to /i).map(t => t.trim());
      if (parts.length >= 2) {
        const startMinutes = parseTimeToMinutes(parts[0]);
        const endMinutes = parseTimeToMinutes(parts[1]);
        let minutes = endMinutes - startMinutes;
        if (minutes < 0) minutes += 24 * 60;
        totalMinutes += minutes;
      }
    });
    return (totalMinutes / 60).toFixed(1);
  };

  useEffect(() => {
    fetchDepartments();
    fetchRoles();
    fetchAllShifts();
    fetchLocations();
    fetchManagers();
    fetchSelectedCandidates();
  }, []);

  const fetchSelectedCandidates = async () => {
    try {
      setFetchingCandidates(true);
      const response = await axios.get("https://ingrainhirebackend.ingrainsystems.com/api/applications/selected");
      if (response.data.success) {
        setSelectedCandidates(response.data.applications || []);
      } else setSelectedCandidates([]);
    } catch (error) {
      setErrorMessage("Failed to fetch candidates");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setFetchingCandidates(false);
    }
  };

  const handleCandidateSelect = (candidateId) => {
    setSelectedCandidateId(candidateId);
    if (!candidateId) { resetFormForNewEntry(); return; }
    const candidate = selectedCandidates.find(c => c._id === candidateId);
    if (!candidate) { setErrorMessage("Candidate not found"); return; }

    const fullName = candidate.firstName && candidate.lastName 
      ? `${candidate.firstName} ${candidate.lastName}`.trim()
      : candidate.name || candidate.fullName || "";
    const nameParts = fullName.trim().split(' ');

    setFirstName(nameParts[0] || "");
    setLastName(nameParts.slice(1).join(' ') || "");
    setEmail(candidate.email || "");
    setPhone(candidate.mobile || candidate.phone || "");
    if (candidate.gender) setGender(candidate.gender);
    if (candidate.address) setAddressLine1(candidate.address);
    if (candidate.currentLocation && !candidate.address) setAddressLine1(candidate.currentLocation);
    if (candidate.dob) {
      try {
        const dobDate = new Date(candidate.dob);
        if (!isNaN(dobDate.getTime())) setDob(dobDate.toISOString().split('T')[0]);
      } catch (e) { }
    }
    if (candidate.jobId) {
      const jobRole = candidate.jobId.role || candidate.role || "";
      if (jobRole) {
        const deptMap = {
          'Marketing': ['Marketing', 'Business Development', 'Sales', 'Digital Marketing'],
          'Operations': ['Operations', 'Business Operations', 'Admin'],
          'Technology': ['Engineering', 'Development', 'IT', 'Technical'],
          'Finance': ['Finance', 'Accounting', 'Audit'],
          'HR': ['HR', 'Human Resources', 'Recruitment']
        };
        const matchedDept = Object.keys(deptMap).find(dept => 
          deptMap[dept].some(keyword => jobRole.toLowerCase().includes(keyword.toLowerCase()))
        );
        if (matchedDept) setDepartment(matchedDept);
        setRole(jobRole);
      }
    }
    setEmailSuggestions([]);
    setPhoneSuggestions([]);
    setSuccessMessage(`✅ Auto-filled with ${fullName}'s details!`);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  useEffect(() => {
    if (editingEmployee) loadEmployeeData(editingEmployee);
    else fetchNextEmployeeId();
  }, [editingEmployee, shiftList]);

  useEffect(() => {
    if (!editingEmployee && phone.length === 10 && phone !== searchedPhone) {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => searchEmployeeOrCandidateByPhone(), 500);
    }
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [phone, editingEmployee]);

  useEffect(() => {
    if (showIncrementSuccess) {
      const timer = setTimeout(() => setShowIncrementSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showIncrementSuccess]);

  const loadEmployeeData = (employee) => {
    const nameParts = employee.name ? employee.name.trim().split(' ') : ['', ''];
    setFirstName(nameParts[0] || "");
    setLastName(nameParts.slice(1).join(' ') || "");
    setEmail(employee.email || "");
    setPhone(employee.phone || "");
    setDob(employee.dob ? new Date(employee.dob).toISOString().split('T')[0] : "");
    setGender(employee.gender || "");
    setParentsName(employee.parentsName || "");
    setAlternateNumber(employee.alternateNumber || "");
    setAddressLine1(employee.addressLine1 || "");
    setAddressLine2(employee.addressLine2 || "");
    setCity(employee.city || "");
    setState(employee.state || "");
    setPinCode(employee.pinCode || "");
    setCountry(employee.country || "India");
    setEmployeeId(employee.employeeId || "");
    setJoinDate(employee.joinDate ? new Date(employee.joinDate).toISOString().split('T')[0] : "");
    setDepartment(employee.department || "");
    setRole(employee.role || "");
    setLocationId(employee.location?._id || employee.location || "");
    setReportingManager(employee.reportingManager || "");
    setEmploymentType(employee.employmentType || "fulltime");
    setBankName(employee.bankName || "");
    setBankAccountNo(employee.bankAccountNo || employee.bankAccount || "");
    setIfscCode(employee.ifscCode || "");
    setPanNumber(employee.panNumber || employee.panCard || "");
    setAadharNumber(employee.aadharNumber || employee.aadharCard || "");
    setUanNumber(employee.uanNumber || "");
    setPfNumber(employee.pfNumber || "");
    setEsicNumber(employee.esicNumber || "");

    // ✅ Load existing document info
    setPanDocumentUrl(employee.panDocumentUrl || "");
    setPanDocumentFileName(employee.panDocumentFileName || "");
    setPanDocumentFileType(employee.panDocumentFileType || "");
    setPanDocumentFileSize(employee.panDocumentFileSize || 0);
    setPanDocument(null);

    setAadharDocumentUrl(employee.aadharDocumentUrl || "");
    setAadharDocumentFileName(employee.aadharDocumentFileName || "");
    setAadharDocumentFileType(employee.aadharDocumentFileType || "");
    setAadharDocumentFileSize(employee.aadharDocumentFileSize || 0);
    setAadharDocument(null);

    setBasicPay(employee.basicPay?.toString() || employee.salaryPerMonth?.toString() || "");
    setHra(employee.hra?.toString() || "");
    setConveyanceAllowance(employee.conveyanceAllowance?.toString() || "");
    setMedicalAllowance(employee.medicalAllowance?.toString() || "");
    setPerformanceAllowance(employee.performanceAllowance?.toString() || "");
    setSpecialAllowance(employee.specialAllowance?.toString() || "");
    setPtax(employee.ptax?.toString() || "");
    setGmc(employee.gmc || "");
    setGmcAmount(employee.gmcAmount?.toString() || "");
    setOtherDeductions(employee.otherDeductions?.toString() || "");
    setShiftType(employee.shiftType || "");
    setShiftHours(employee.shiftHours?.toString() || "");
    setWeekOffsPerMonth(employee.weekOffPerMonth?.toString() || "0");
    setWeekOffDay(employee.weekOffDay || "Sunday");
    setMaxCL(employee.maxCL !== undefined ? employee.maxCL.toString() : "0");
    setMaxSL(employee.maxSL !== undefined ? employee.maxSL.toString() : "0");
    setMaxEL(employee.maxEL !== undefined ? employee.maxEL.toString() : "0");
    setMaxCompOff(employee.maxCompOff !== undefined ? employee.maxCompOff.toString() : "0");
    setCtc(employee.ctc?.toString() || "");
    setPassword("");
    setSalaryEffectiveDate(new Date().toISOString().split('T')[0]);
    
    if (employee.shiftType) {
      setShowShiftDetails(true);
      const shiftData = shiftList.find(s => s.shiftType === employee.shiftType);
      if (shiftData) {
        setSelectedShift(shiftData);
        setShiftTimeSlots(shiftData.timeSlots || []);
        setShiftHours(calculateTotalHours(shiftData.timeSlots));
        const firstSlot = shiftData.timeSlots?.[0];
        if (firstSlot?.timeRange) {
          const times = firstSlot.timeRange.split(/[-]| to /i).map(t => t.trim());
          if (times.length === 2) {
            setShiftStartTime(times[0]);
            setShiftEndTime(times[1]);
          }
        }
      } else {
        setShiftTimeSlots([]);
        setShiftHours("");
      }
    }
  };

  const searchEmployeeOrCandidateByPhone = async () => {
    if (!phone || phone.length !== 10 || phone === searchedPhone) return;
    if (editingEmployee) return;

    setSearching(true);
    setErrorMessage("");
    setSearchedPhone(phone);

    try {
      const candidate = selectedCandidates.find(c => (c.mobile || c.phone) === phone);
      if (candidate) {
        handleCandidateSelect(candidate._id);
        setEmployeeFound(true);
        setSearching(false);
        return;
      }
      const response = await axios.get(`${API_BASE_URL}/employees/get-employee-by-phone`, { params: { phone } });
      if (response.data.success) {
        loadEmployeeData(response.data.data);
        setEmployeeFound(true);
        setSuccessMessage(`✅ Employee found! Data loaded.`);
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        resetFormForNewEntry();
        setEmployeeFound(false);
        setSuccessMessage(`📝 New candidate - fill the form.`);
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      if (error.response?.status !== 404) setErrorMessage("Failed to search.");
      resetFormForNewEntry();
      setEmployeeFound(false);
    } finally {
      setSearching(false);
    }
  };

  const resetFormForNewEntry = () => {
    if (!editingEmployee) {
      setFirstName(""); setLastName(""); setEmail(""); setPassword(""); setDob("");
      setGender("");
      setParentsName(""); setAlternateNumber(""); setAddressLine1(""); setAddressLine2("");
      setCity(""); setState(""); setPinCode(""); setCountry("India");
      fetchNextEmployeeId(); setJoinDate(""); setDepartment(""); setRole("");
      setLocationId(""); setReportingManager(""); setEmploymentType("fulltime");
      setBankName(""); setBankAccountNo(""); setIfscCode("");
      setPanNumber(""); setAadharNumber("");
      setUanNumber(""); setPfNumber(""); setEsicNumber("");

      // ✅ Reset documents
      setPanDocument(null); setPanDocumentUrl(""); setPanDocumentFileName("");
      setPanDocumentFileType(""); setPanDocumentFileSize(0);
      setAadharDocument(null); setAadharDocumentUrl(""); setAadharDocumentFileName("");
      setAadharDocumentFileType(""); setAadharDocumentFileSize(0);
      if (panFileInputRef.current) panFileInputRef.current.value = "";
      if (aadharFileInputRef.current) aadharFileInputRef.current.value = "";

      setBasicPay(""); setHra(""); setConveyanceAllowance(""); setMedicalAllowance("");
      setPerformanceAllowance(""); setSpecialAllowance("");
      setPtax(""); setGmc(""); setGmcAmount(""); setOtherDeductions("");
      setShiftType(""); setShiftHours(""); setWeekOffsPerMonth("0");
      setWeekOffDay("Sunday"); setMaxCL("0"); setMaxSL("0"); setMaxEL("0"); setMaxCompOff("0"); setCtc("");
      setSalaryEffectiveDate(new Date().toISOString().split('T')[0]);
      setShiftTimeSlots([]); setSelectedShift(null);
      setIncrementType(""); setIncrementValue(""); setIncrementEffectiveDate(""); setIncrementReason("");
    }
  };

  const fetchNextEmployeeId = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employees/get-employees`);
      if (response.data.success || Array.isArray(response.data)) {
        const employees = Array.isArray(response.data) ? response.data : response.data.data || [];
        const ids = employees.map(emp => emp.employeeId)
          .filter(id => id && id.toUpperCase().startsWith('TH'))
          .map(id => parseInt(id.replace(/[^0-9]/g, ''))).filter(num => !isNaN(num));
        if (ids.length > 0) setEmployeeId(`TH${Math.max(...ids) + 1}`);
        else setEmployeeId('TH100');
      }
    } catch (error) {
      setEmployeeId(`TH${Math.floor(Math.random() * 900) + 100}`);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/department/all`);
      if (response.data.success) setDepartments(response.data.data);
    } catch (error) { }
  };
  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/roles/all`);
      if (response.data.success) setRoles(response.data.data);
    } catch (error) { }
  };
  const fetchLocations = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/location/alllocation`);
      if (res.data?.locations) setLocations(res.data.locations);
    } catch (err) { }
  };
  const fetchAllShifts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/shifts/master`);
      if (res.data?.success && Array.isArray(res.data.data)) setShiftList(res.data.data);
    } catch (err) { setShiftList([]); }
  };
  const fetchManagers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employees/get-employees`);
      if (response.data.success || Array.isArray(response.data)) {
        const employees = Array.isArray(response.data) ? response.data : response.data.data || [];
        setAllEmployees(employees);
        setManagers(employees.filter(emp => emp.role?.toLowerCase().includes('manager')));
      }
    } catch (error) { }
  };

  const handlePinCodeChange = async (e) => {
    const value = e.target.value;
    setPinCode(value);
    if (value.length === 6) {
      try {
        const locationData = await getCityStateFromPincode(value);
        if (locationData) {
          setCity(locationData.city || "");
          setState(locationData.state || "");
        }
      } catch (error) { }
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
    if (value.length > 2) {
      const candidateMatches = selectedCandidates.filter(c => (c.mobile || c.phone || "").includes(value)).map(c => ({ ...c, type: 'candidate' }));
      const employeeMatches = allEmployees.filter(emp => (emp.phone || "").includes(value)).map(emp => ({ ...emp, type: 'employee' }));
      setPhoneSuggestions([...candidateMatches, ...employeeMatches]);
    } else setPhoneSuggestions([]);
    if (value.length === 10) {
      const candidate = selectedCandidates.find(c => (c.mobile || c.phone) === value);
      if (candidate) { handleCandidateSelect(candidate._id); setPhoneSuggestions([]); }
    }
    if (value.length < 10) { setSearchedPhone(""); setEmployeeFound(false); }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value.length > 2) {
      const candidateMatches = selectedCandidates.filter(c => c.email?.toLowerCase().includes(value.toLowerCase())).map(c => ({ ...c, type: 'candidate' }));
      const employeeMatches = allEmployees.filter(emp => emp.email?.toLowerCase().includes(value.toLowerCase())).map(emp => ({ ...emp, type: 'employee' }));
      setEmailSuggestions([...candidateMatches, ...employeeMatches]);
    } else setEmailSuggestions([]);
    if (value && value.includes('@')) {
      const candidate = selectedCandidates.find(c => c.email?.toLowerCase() === value.toLowerCase());
      if (candidate) { handleCandidateSelect(candidate._id); setEmailSuggestions([]); return; }
      const employee = allEmployees.find(emp => emp.email?.toLowerCase() === value.toLowerCase());
      if (employee) { loadEmployeeData(employee); setEmployeeFound(true); setEmailSuggestions([]); }
    }
  };

  // ============================================
  // ✅ FILE UPLOAD HELPERS
  // ============================================
  const validateFile = (file) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) return "Only PDF, JPG, PNG, WEBP allowed";
    if (file.size > 5 * 1024 * 1024) return "File size must be less than 5MB";
    return null;
  };

  const handlePanFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) {
      setErrorMessage(err);
      setTimeout(() => setErrorMessage(""), 3000);
      if (panFileInputRef.current) panFileInputRef.current.value = "";
      return;
    }
    setPanDocument(file);
  };

  const handleAadharFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) {
      setErrorMessage(err);
      setTimeout(() => setErrorMessage(""), 3000);
      if (aadharFileInputRef.current) aadharFileInputRef.current.value = "";
      return;
    }
    setAadharDocument(file);
  };

  const uploadDocumentFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(`${API_BASE_URL}/employees/upload-document`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || "Upload failed");
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleShiftChange = (selectedShiftType) => {
    if (selectedShiftType === "ADD_NEW") setShowShiftModal(true);
    else {
      const selectedShiftData = shiftList.find(shift => shift.shiftType === selectedShiftType);
      if (selectedShiftData) {
        setShiftType(selectedShiftData.shiftType);
        setSelectedShift(selectedShiftData);
        setShowShiftDetails(true);
        setShiftTimeSlots(selectedShiftData.timeSlots || []);
        setShiftHours(calculateTotalHours(selectedShiftData.timeSlots));
        const firstSlot = selectedShiftData.timeSlots?.[0];
        if (firstSlot?.timeRange) {
          const times = firstSlot.timeRange.split(/[-]| to /i).map(t => t.trim());
          if (times.length === 2) { setShiftStartTime(times[0]); setShiftEndTime(times[1]); }
        }
      }
    }
  };

  const handleCreateCustomShift = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/shifts/create`, {
        shiftType: createShiftForm.shiftType.toUpperCase(),
        shiftName: createShiftForm.shiftName,
        timeSlots: [{ timeRange: createShiftForm.timeRange, description: createShiftForm.description }]
      });
      if (response.data.success) {
        await fetchAllShifts();
        setShiftType(createShiftForm.shiftType.toUpperCase());
        setShowShiftModal(false);
        setCreateShiftForm({ shiftType: '', shiftName: '', timeRange: '', description: '' });
        setSuccessMessage(`✅ Shift created!`);
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) { setErrorMessage(error.response?.data?.message || 'Failed'); }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/department/create`, { name: deptForm.name, description: deptForm.description });
      if (response.data.success) {
        await fetchDepartments();
        setDepartment(deptForm.name);
        setShowDeptModal(false);
        setDeptForm({ name: '', description: '' });
      }
    } catch (error) { setErrorMessage('Failed'); }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/roles/create`, { name: roleForm.name, description: roleForm.description });
      if (response.data.success) {
        await fetchRoles();
        setRole(roleForm.name);
        setShowRoleModal(false);
        setRoleForm({ name: '', description: '' });
      }
    } catch (error) { setErrorMessage('Failed'); }
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/location/add-location`, {
        name: locationForm.name, latitude: locationForm.latitude,
        longitude: locationForm.longitude, fullAddress: locationForm.fullAddress
      });
      if (response.data.success || response.data.location) {
        await fetchLocations();
        const newLocation = response.data.location || response.data.data;
        if (newLocation?._id) setLocationId(newLocation._id);
        setShowLocationModal(false);
        setLocationForm({ name: '', latitude: '', longitude: '', fullAddress: '' });
      }
    } catch (error) { setErrorMessage('Failed'); }
  };

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) { setErrorMessage("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      setLocationForm(prev => ({ ...prev, latitude: latitude.toFixed(6), longitude: longitude.toFixed(6) }));
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await res.json();
        if (data.display_name) setLocationForm(prev => ({ ...prev, fullAddress: data.display_name }));
      } catch { }
    }, () => setErrorMessage("Location denied"));
  };

  const assignShiftToEmployee = async (empId, empName, shift, startTime, endTime) => {
    try {
      if (!empId || empId.trim() === '') return { success: false, error: "Employee ID required" };
      const response = await axios.post(`${API_BASE_URL}/shifts/assign`, {
        employeeId: empId, employeeName: empName,
        shiftType: shift.toUpperCase(), startTime: startTime || "09:00", endTime: endTime || "18:00"
      });
      return response;
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const handleApplyIncrement = async () => {
    if (!editingEmployee || !incrementType || !incrementValue || !incrementEffectiveDate) {
      alert("Fill all increment fields"); return;
    }
    try {
      setLoading(true);
      const response = await axios.put(`${API_BASE_URL}/employees/${editingEmployee._id}/salary-increment`, {
        incrementType, incrementValue: parseFloat(incrementValue),
        effectiveDate: incrementEffectiveDate, reason: incrementReason,
        newComponents: {
          basicPay: parseFloat(basicPay) || 0, hra: parseFloat(hra) || 0,
          conveyanceAllowance: parseFloat(conveyanceAllowance) || 0,
          medicalAllowance: parseFloat(medicalAllowance) || 0,
          performanceAllowance: parseFloat(performanceAllowance) || 0,
          specialAllowance: parseFloat(specialAllowance) || 0,
          ctc: parseFloat(ctc) || 0, ptax: parseFloat(ptax) || 0,
          gmcAmount: parseFloat(gmcAmount) || 0, otherDeductions: parseFloat(otherDeductions) || 0
        }
      });
      if (response.data.success) {
        setShowIncrementSuccess(true);
        setSuccessMessage(`✅ Increment applied!`);
        setIncrementType(""); setIncrementValue(""); setIncrementEffectiveDate(""); setIncrementReason("");
        const updatedEmployee = await axios.get(`${API_BASE_URL}/employees/get-employee?employeeId=${editingEmployee.employeeId}`);
        if (updatedEmployee.data.success) loadEmployeeData(updatedEmployee.data.data);
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (!phone || phone.length !== 10) throw new Error("Valid 10-digit phone required");
      if (!pinCode || pinCode.length !== 6) throw new Error("Valid 6-digit pin required");

      const fullAddress = formatFullAddress({ addressLine1, addressLine2, city, state, pinCode, country });

      // ✅ Upload PAN document if new file selected
      let finalPanDocUrl = panDocumentUrl;
      let finalPanDocName = panDocumentFileName;
      let finalPanDocType = panDocumentFileType;
      let finalPanDocSize = panDocumentFileSize;
      if (panDocument) {
        setUploadingPanDoc(true);
        try {
          const result = await uploadDocumentFile(panDocument);
          finalPanDocUrl = result.fileUrl;
          finalPanDocName = result.fileName;
          finalPanDocType = result.fileType;
          finalPanDocSize = result.fileSize;
        } catch (err) {
          setErrorMessage("PAN doc upload failed: " + err.message);
          setUploadingPanDoc(false); setLoading(false); return;
        }
        setUploadingPanDoc(false);
      }

      // ✅ Upload Aadhaar document if new file selected
      let finalAadharDocUrl = aadharDocumentUrl;
      let finalAadharDocName = aadharDocumentFileName;
      let finalAadharDocType = aadharDocumentFileType;
      let finalAadharDocSize = aadharDocumentFileSize;
      if (aadharDocument) {
        setUploadingAadharDoc(true);
        try {
          const result = await uploadDocumentFile(aadharDocument);
          finalAadharDocUrl = result.fileUrl;
          finalAadharDocName = result.fileName;
          finalAadharDocType = result.fileType;
          finalAadharDocSize = result.fileSize;
        } catch (err) {
          setErrorMessage("Aadhaar doc upload failed: " + err.message);
          setUploadingAadharDoc(false); setLoading(false); return;
        }
        setUploadingAadharDoc(false);
      }

      const payload = {
        firstName, lastName, email, phone, dob: dob || null,
        gender: gender || "",
        department, role, addressLine1, addressLine2, city, state,
        pinCode, country, employeeId, joinDate, locationId,
        reportingManager, employmentType, weekOffDay,
        weekOffType: "number", weekOffCount: parseInt(weekOffsPerMonth) || 0,
        shiftType, shiftHours: parseFloat(shiftHours) || 0, salaryPerMonth: parseFloat(netSalary) || 0,
        weekOffPerMonth: parseInt(weekOffsPerMonth) || 0,
        maxCL: parseInt(maxCL) || 0, maxSL: parseInt(maxSL) || 0,
        maxEL: parseInt(maxEL) || 0, maxCompOff: parseInt(maxCompOff) || 0,
        ctc: parseFloat(ctc) || 0,
        parentsName, alternateNumber, address: fullAddress,
        bankName, bankAccountNo, ifscCode,
        panNumber: panNumber ? panNumber.toUpperCase() : "",
        aadharNumber: aadharNumber ? String(aadharNumber).replace(/\D/g, '').slice(0, 12) : "",
        uanNumber, pfNumber, esicNumber,

        // ✅ NEW: Documents
        panDocumentUrl: finalPanDocUrl || "",
        panDocumentFileName: finalPanDocName || "",
        panDocumentFileType: finalPanDocType || "",
        panDocumentFileSize: finalPanDocSize || 0,
        aadharDocumentUrl: finalAadharDocUrl || "",
        aadharDocumentFileName: finalAadharDocName || "",
        aadharDocumentFileType: finalAadharDocType || "",
        aadharDocumentFileSize: finalAadharDocSize || 0,

        basicPay: parseFloat(basicPay) || 0, hra: parseFloat(hra) || 0,
        conveyanceAllowance: parseFloat(conveyanceAllowance) || 0,
        medicalAllowance: parseFloat(medicalAllowance) || 0,
        performanceAllowance: parseFloat(performanceAllowance) || 0,
        specialAllowance: parseFloat(specialAllowance) || 0,
        ptax: parseFloat(ptax) || 0, gmc, gmcAmount: parseFloat(gmcAmount) || 0,
        otherDeductions: parseFloat(otherDeductions) || 0,
        totalEarnings, totalDeductions, netSalary: netSalary,
        salaryEffectiveDate: salaryEffectiveDate
      };

      if (password) payload.password = password;

      let finalEmployeeId = employeeId;

      if (editingEmployee || employeeFound) {
        let employeeIdToUpdate = editingEmployee?._id;
        if (!employeeIdToUpdate && employeeFound) {
          const response = await axios.get(`${API_BASE_URL}/employees/get-employee-by-phone`, { params: { phone } });
          if (response.data.success) employeeIdToUpdate = response.data.data._id;
        }
        await axios.put(`${API_BASE_URL}/employees/update/${employeeIdToUpdate}`, payload);
        const existingEmpId = editingEmployee?.employeeId || employeeFound?.employeeId || employeeId;
        finalEmployeeId = existingEmpId;

        if (showShiftDetails && shiftType) {
          const result = await assignShiftToEmployee(finalEmployeeId, `${firstName} ${lastName}`, shiftType, shiftStartTime, shiftEndTime);
          if (!result.success) setSuccessMessage(`⚠️ Shift assignment failed: ${result.error}`);
        }
        await axios.put(`${API_BASE_URL}/salary/update-salary/${finalEmployeeId}`, {
          employeeId: finalEmployeeId, salaryPerMonth: parseFloat(netSalary) || 0,
          shiftHours: parseFloat(shiftHours) || 0, weekOffPerMonth: parseInt(weekOffsPerMonth) || 0,
        });
        setSuccessMessage("✅ Employee updated!");
      } else {
        const addResponse = await axios.post(`${API_BASE_URL}/employees/add-employee`, payload);
        if (addResponse.data.success && addResponse.data.data) {
          finalEmployeeId = addResponse.data.data.employeeId || addResponse.data.data._id || employeeId;
        } else finalEmployeeId = employeeId;

        if (!finalEmployeeId || finalEmployeeId.trim() === '') throw new Error("Employee ID required");

        if (showShiftDetails && shiftType) {
          const result = await assignShiftToEmployee(finalEmployeeId, `${firstName} ${lastName}`, shiftType, shiftStartTime, shiftEndTime);
          if (!result.success) setSuccessMessage(`⚠️ Shift failed: ${result.error}`);
        }
        await axios.post(`${API_BASE_URL}/salary/set-salary`, {
          employeeId: finalEmployeeId, name: `${firstName} ${lastName}`,
          salaryPerMonth: parseFloat(netSalary), shiftHours: parseFloat(shiftHours),
          weekOffPerMonth: parseInt(weekOffsPerMonth) || 0,
        });
        setSuccessMessage("✅ Employee added!");
      }

      setTimeout(() => navigate("/employeelist"), 1500);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || "Something went wrong");
    } finally { setLoading(false); }
  };

  const getCurrentDate = () => new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl p-4 mx-auto">
      <div className="p-6 bg-white shadow-lg rounded-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingEmployee ? "Edit Employee" : "Add New Employee"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">Fill all employee details below</p>
        </div>

        {successMessage && <div className="p-3 mb-4 text-sm text-green-700 border border-green-200 rounded-lg bg-green-50">{successMessage}</div>}
        {errorMessage && <div className="p-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">{errorMessage}</div>}
        {showIncrementSuccess && <div className="p-3 mb-4 text-sm text-green-700 border border-green-200 rounded-lg bg-green-50 animate-pulse">✅ Salary increment applied!</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* AUTOFILL */}
          <div className="p-4 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/50">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <label className="block mb-1 text-sm font-semibold text-blue-800">
                  <FaUsers className="inline mr-1" /> Autofill from Selected Candidates
                </label>
                <select value={selectedCandidateId} onChange={(e) => handleCandidateSelect(e.target.value)}
                  className="w-full p-2.5 border border-blue-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                  disabled={fetchingCandidates}>
                  <option value="">-- Select a Candidate --</option>
                  {selectedCandidates.map(can => (
                    <option key={can._id} value={can._id}>
                      {can.firstName || can.name} {can.lastName || ''} ({can.email})
                    </option>
                  ))}
                </select>
              </div>
              <button type="button" onClick={fetchSelectedCandidates}
                className="px-4 py-2.5 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50"
                disabled={fetchingCandidates}>
                {fetchingCandidates ? <FaSpinner className="animate-spin inline mr-1" /> : "🔄 Refresh"}
              </button>
            </div>
          </div>

          {/* SECTION 1: BASIC */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-blue-50 px-4 py-3 border-b">
              <h3 className="text-lg font-semibold text-blue-800"><FaUser className="inline mr-2" /> 1. Basic Details</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Phone Number *</label>
                  <div className="relative">
                    <input value={phone} onChange={handlePhoneChange} className="w-full p-2.5 border rounded-lg text-gray-900" placeholder="10-digit phone" required />
                    {searching && <FaSpinner className="absolute right-3 top-3 animate-spin text-blue-600" />}
                    {employeeFound && !searching && <FaCheck className="absolute right-3 top-3 text-blue-600" />}
                    {phoneSuggestions.length > 0 && (
                      <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                        {phoneSuggestions.map((item) => (
                          <li key={item._id} onClick={() => {
                            if (item.type === 'employee') { loadEmployeeData(item); setEmployeeFound(true); setPhoneSuggestions([]); }
                            else { handleCandidateSelect(item._id); setPhoneSuggestions([]); }
                          }} className="px-4 py-3 cursor-pointer hover:bg-blue-50 border-b last:border-b-0">
                            <div className="font-bold text-blue-900 text-sm">{item.firstName || item.name} {item.lastName || ''}</div>
                            <div className="text-xs text-gray-600">{item.mobile || item.phone} | {item.email || 'No email'}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div><label className="block mb-1 text-sm font-medium text-gray-700">Alternate Number</label><input value={alternateNumber} onChange={(e) => setAlternateNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} className="w-full p-2.5 border rounded-lg text-gray-900" /></div>
                <div><label className="block mb-1 text-sm font-medium text-gray-700">Parents Name</label><input value={parentsName} onChange={(e) => setParentsName(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" /></div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div><label className="block mb-1 text-sm font-medium text-gray-700">First Name *</label><input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" required /></div>
                <div><label className="block mb-1 text-sm font-medium text-gray-700">Last Name</label><input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" /></div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Email *</label>
                  <div className="relative">
                    <input type="email" value={email} onChange={handleEmailChange} className="w-full p-2.5 border rounded-lg text-gray-900" required />
                    {emailSuggestions.length > 0 && (
                      <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                        {emailSuggestions.map((item) => (
                          <li key={item._id} onClick={() => {
                            if (item.type === 'employee') { loadEmployeeData(item); setEmployeeFound(true); setEmailSuggestions([]); }
                            else { handleCandidateSelect(item._id); setEmailSuggestions([]); }
                          }} className="px-4 py-3 cursor-pointer hover:bg-blue-50 border-b last:border-b-0">
                            <div className="font-bold text-blue-900 text-sm">{item.firstName || item.name} {item.lastName || ''}</div>
                            <div className="text-xs text-gray-600">{item.email} | {item.mobile || item.phone}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Password {!editingEmployee && !employeeFound && "*"}</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2.5 pr-10 border rounded-lg text-gray-900" placeholder={editingEmployee || employeeFound ? "Keep blank for no change" : "Enter password"} required={!editingEmployee && !employeeFound} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500">{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
                  </div>
                </div>
                <div><label className="block mb-1 text-sm font-medium text-gray-700">Date of Birth</label><input type="date" value={dob} onChange={(e) => setDob(e.target.value)} max={getCurrentDate()} className="w-full p-2.5 border rounded-lg text-gray-900" /></div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-gray-900"><FaMapMarkerAlt className="inline mr-1" /> Address</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-3">
                  <div><label className="block mb-1 text-sm text-gray-700">Address Line 1 *</label><input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" required /></div>
                  <div><label className="block mb-1 text-sm text-gray-700">Address Line 2</label><input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" /></div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div><label className="block mb-1 text-sm text-gray-700">Pin Code *</label><input type="text" value={pinCode} onChange={handlePinCodeChange} maxLength="6" className="w-full p-2.5 border rounded-lg text-gray-900" required /></div>
                  <div><label className="block mb-1 text-sm text-gray-700">City *</label><input value={city} onChange={(e) => setCity(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" required /></div>
                  <div><label className="block mb-1 text-sm text-gray-700">State *</label><input value={state} onChange={(e) => setState(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" required /></div>
                  <div><label className="block mb-1 text-sm text-gray-700">Country</label><select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900"><option>India</option><option>USA</option><option>UK</option></select></div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: OFFICE */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-green-50 px-4 py-3 border-b">
              <h3 className="text-lg font-semibold text-green-800"><FaBuilding className="inline mr-2" /> 2. Office Details</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div><label className="block mb-1 text-sm text-gray-700">Employee ID *</label><input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" /></div>
                <div><label className="block mb-1 text-sm text-gray-700">Join Date *</label><input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" required /></div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm text-gray-700">Department *</label>
                  <select value={department} onChange={(e) => e.target.value === "ADD_NEW_DEPT" ? setShowDeptModal(true) : setDepartment(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" required>
                    <option value="">Select Department</option>
                    {departments.map(dept => <option key={dept.name} value={dept.name}>{dept.name}</option>)}
                    <option value="ADD_NEW_DEPT" className="text-blue-600">+ Add New</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm text-gray-700">Role *</label>
                  <select value={role} onChange={(e) => e.target.value === "ADD_NEW_ROLE" ? setShowRoleModal(true) : setRole(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" required>
                    <option value="">Select Role</option>
                    {roles.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                    <option value="ADD_NEW_ROLE" className="text-blue-600">+ Add New</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div><label className="block mb-1 text-sm text-gray-700">Work Location *</label><select value={locationId} onChange={(e) => e.target.value === "ADD_NEW_LOCATION" ? setShowLocationModal(true) : setLocationId(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" required><option value="">Select Location</option>{locations.map(loc => <option key={loc._id} value={loc._id}>{loc.name}</option>)}<option value="ADD_NEW_LOCATION" className="text-blue-600">+ Add New</option></select></div>
                <div><label className="block mb-1 text-sm text-gray-700">Employment Type</label><select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900"><option value="fulltime">Full Time</option><option value="parttime">Part Time</option><option value="contract">Contract</option><option value="internship">Internship</option></select></div>
              </div>
            </div>
          </div>

          {/* SECTION 3: BANK & DOCUMENTS — with file uploads */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-purple-50 px-4 py-3 border-b">
              <h3 className="text-lg font-semibold text-purple-800"><FaUniversity className="inline mr-2" /> 3. Bank & Documents</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div><label className="block mb-1 text-sm text-gray-700">Bank Name</label><input value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" /></div>
                <div><label className="block mb-1 text-sm text-gray-700">Bank Account Number</label><input value={bankAccountNo} onChange={(e) => setBankAccountNo(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" /></div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div><label className="block mb-1 text-sm text-gray-700">IFSC Code</label><input value={ifscCode} onChange={(e) => setIfscCode(e.target.value.toUpperCase())} className="w-full p-2.5 border rounded-lg text-gray-900" /></div>
                <div>
                  <label className="block mb-1 text-sm text-gray-700"><FaIdCard className="inline mr-1 text-purple-600" /> PAN Card Number</label>
                  <input value={panNumber} onChange={(e) => setPanNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))} className="w-full p-2.5 border rounded-lg text-gray-900" placeholder="ABCDE1234F" maxLength="10" />
                  <p className="mt-1 text-xs text-gray-500">Format: ABCDE1234F</p>
                </div>
              </div>

              {/* ✅ PAN Document Upload */}
              <div className="bg-purple-50/40 border border-purple-200 rounded-lg p-3">
                <label className="block mb-2 text-xs font-semibold text-purple-800 uppercase tracking-wide">
                  Upload PAN Card Document (PDF / Image)
                </label>
                <input ref={panFileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handlePanFileChange} className="hidden" />

                {!panDocument && !panDocumentUrl && (
                  <button type="button" onClick={() => panFileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-1 py-4 border-2 border-dashed border-purple-300 rounded-lg hover:bg-purple-50">
                    <FiUploadCloud className="text-2xl text-purple-500" />
                    <span className="text-sm font-semibold text-purple-700">Click to upload PAN document</span>
                    <span className="text-[10px] text-gray-500">PDF, JPG, PNG, WEBP • Max 5MB</span>
                  </button>
                )}

                {panDocument && (
                  <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-purple-200">
                    {panDocument.type === "application/pdf" ? <FaFilePdf className="text-red-500 text-xl" /> : <FaFileImage className="text-blue-500 text-xl" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{panDocument.name}</p>
                      <p className="text-[10px] text-gray-500">{formatFileSize(panDocument.size)}</p>
                    </div>
                    <button type="button" onClick={() => { setPanDocument(null); if (panFileInputRef.current) panFileInputRef.current.value = ""; }}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"><FiX size={14} /></button>
                  </div>
                )}

                {!panDocument && panDocumentUrl && (
                  <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-green-200">
                    <FaCheck className="text-green-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{panDocumentFileName || "PAN document uploaded"}</p>
                      <a href={panDocumentUrl.startsWith("http") ? panDocumentUrl : `https://api.timelyhealth.in${panDocumentUrl}`}
                        target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 underline">
                        View uploaded file
                      </a>
                    </div>
                    <button type="button" onClick={() => panFileInputRef.current?.click()}
                      className="text-[10px] px-2 py-1 text-purple-700 bg-purple-100 rounded hover:bg-purple-200">Change</button>
                  </div>
                )}
              </div>

              {/* ✅ Aadhaar Number */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm text-gray-700"><FaIdCard className="inline mr-1 text-purple-600" /> Aadhaar Card Number</label>
                  <input value={aadharNumber} onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, '').slice(0, 12))} className="w-full p-2.5 border rounded-lg text-gray-900" placeholder="12-digit Aadhaar number" maxLength="12" />
                  <p className="mt-1 text-xs text-gray-500">12 digits without spaces</p>
                </div>
              </div>

              {/* ✅ Aadhaar Document Upload */}
              <div className="bg-purple-50/40 border border-purple-200 rounded-lg p-3">
                <label className="block mb-2 text-xs font-semibold text-purple-800 uppercase tracking-wide">
                  Upload Aadhaar Card Document (PDF / Image)
                </label>
                <input ref={aadharFileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleAadharFileChange} className="hidden" />

                {!aadharDocument && !aadharDocumentUrl && (
                  <button type="button" onClick={() => aadharFileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-1 py-4 border-2 border-dashed border-purple-300 rounded-lg hover:bg-purple-50">
                    <FiUploadCloud className="text-2xl text-purple-500" />
                    <span className="text-sm font-semibold text-purple-700">Click to upload Aadhaar document</span>
                    <span className="text-[10px] text-gray-500">PDF, JPG, PNG, WEBP • Max 5MB</span>
                  </button>
                )}

                {aadharDocument && (
                  <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-purple-200">
                    {aadharDocument.type === "application/pdf" ? <FaFilePdf className="text-red-500 text-xl" /> : <FaFileImage className="text-blue-500 text-xl" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{aadharDocument.name}</p>
                      <p className="text-[10px] text-gray-500">{formatFileSize(aadharDocument.size)}</p>
                    </div>
                    <button type="button" onClick={() => { setAadharDocument(null); if (aadharFileInputRef.current) aadharFileInputRef.current.value = ""; }}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"><FiX size={14} /></button>
                  </div>
                )}

                {!aadharDocument && aadharDocumentUrl && (
                  <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-green-200">
                    <FaCheck className="text-green-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{aadharDocumentFileName || "Aadhaar document uploaded"}</p>
                      <a href={aadharDocumentUrl.startsWith("http") ? aadharDocumentUrl : `https://api.timelyhealth.in${aadharDocumentUrl}`}
                        target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 underline">
                        View uploaded file
                      </a>
                    </div>
                    <button type="button" onClick={() => aadharFileInputRef.current?.click()}
                      className="text-[10px] px-2 py-1 text-purple-700 bg-purple-100 rounded hover:bg-purple-200">Change</button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div><label className="block mb-1 text-sm text-gray-700">UAN Number</label><input value={uanNumber} onChange={(e) => setUanNumber(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" /></div>
                <div><label className="block mb-1 text-sm text-gray-700">PF Number</label><input value={pfNumber} onChange={(e) => setPfNumber(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" /></div>
                <div><label className="block mb-1 text-sm text-gray-700">ESIC Number</label><input value={esicNumber} onChange={(e) => setEsicNumber(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" /></div>
              </div>
            </div>
          </div>

          {/* SECTION 4: SALARY */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-orange-50 px-4 py-3 border-b">
              <h3 className="text-lg font-semibold text-orange-800"><FaMoneyBillWave className="inline mr-2" /> 4. Salary Breakup</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold text-blue-600 mb-2">Earnings</h4>
                  <div className="space-y-2">
                    <div><label className="block text-sm text-gray-700">Basic Pay *</label><input type="number" value={basicPay} onChange={(e) => setBasicPay(e.target.value)} className="w-full p-2 border rounded text-gray-900" /></div>
                    <div><label className="block text-sm text-gray-700">HRA</label><input type="number" value={hra} onChange={(e) => setHra(e.target.value)} className="w-full p-2 border rounded text-gray-900" /></div>
                    <div><label className="block text-sm text-gray-700">Conveyance Allowance</label><input type="number" value={conveyanceAllowance} onChange={(e) => setConveyanceAllowance(e.target.value)} className="w-full p-2 border rounded text-gray-900" /></div>
                    <div><label className="block text-sm text-gray-700">Medical Allowance</label><input type="number" value={medicalAllowance} onChange={(e) => setMedicalAllowance(e.target.value)} className="w-full p-2 border rounded text-gray-900" /></div>
                    <div><label className="block text-sm text-gray-700">Performance Allowance</label><input type="number" value={performanceAllowance} onChange={(e) => setPerformanceAllowance(e.target.value)} className="w-full p-2 border rounded text-gray-900" /></div>
                    <div><label className="block text-sm text-gray-700">Special Allowance</label><input type="number" value={specialAllowance} onChange={(e) => setSpecialAllowance(e.target.value)} className="w-full p-2 border rounded text-gray-900" /></div>
                    <div className="pt-2 border-t"><label className="font-semibold text-gray-900">Total Earnings</label><div className="text-xl font-bold text-blue-700">₹{totalEarnings.toLocaleString()}</div></div>
                  </div>
                </div>
                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold text-red-600 mb-2">Deductions</h4>
                  <div className="space-y-2">
                    <div><label className="block text-sm text-gray-700">Professional Tax</label><input type="number" value={ptax} onChange={(e) => setPtax(e.target.value)} className="w-full p-2 border rounded text-gray-900" /></div>
                    <div><label className="block text-sm text-gray-700">GMC Type</label><select value={gmc} onChange={(e) => setGmc(e.target.value)} className="w-full p-2 border rounded text-gray-900"><option value="">None</option><option value="enrolled">Enrolled</option><option value="waived">Waived</option></select></div>
                    <div><label className="block text-sm text-gray-700">GMC Amount</label><input type="number" value={gmcAmount} onChange={(e) => setGmcAmount(e.target.value)} className="w-full p-2 border rounded text-gray-900" /></div>
                    <div><label className="block text-sm text-gray-700">Other Deductions</label><input type="number" value={otherDeductions} onChange={(e) => setOtherDeductions(e.target.value)} className="w-full p-2 border rounded text-gray-900" /></div>
                    <div className="pt-2 border-t"><label className="font-semibold text-gray-900">Total Deductions</label><div className="text-xl font-bold text-red-600">₹{totalDeductions.toLocaleString()}</div></div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border mt-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div><label className="font-semibold text-gray-900">Total Earnings</label><div className="text-lg text-gray-900">₹{totalEarnings.toLocaleString()}</div></div>
                  <div><label className="font-semibold text-gray-900">Total Deductions</label><div className="text-lg text-red-600">₹{totalDeductions.toLocaleString()}</div></div>
                  <div><label className="font-semibold text-blue-700">Net Salary</label><div className="text-2xl font-bold text-blue-700">₹{netSalary.toLocaleString()}</div></div>
                </div>
                {editingEmployee && (
                  <div className="mt-2 pt-2 border-t">
                    <label className="block mb-1 text-sm font-medium text-indigo-700">Salary Effective From *</label>
                    <input type="date" value={salaryEffectiveDate} onChange={(e) => setSalaryEffectiveDate(e.target.value)} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 border-indigo-300 text-gray-900" required />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 5: HR */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-red-50 px-4 py-3 border-b">
              <h3 className="text-lg font-semibold text-red-800"><FaCalendarAlt className="inline mr-2 text-gray-500" /> 5. HR & Leave Policy</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Select Shift *</label>
                <select value={shiftType} onChange={(e) => handleShiftChange(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" required>
                  <option value="">-- Select a Shift --</option>
                  {shiftList.map(shift => (
                    <option key={shift._id} value={shift.shiftType}>
                      {shift.isBrakeShift ? "🔴" : "🟢"} {getShiftOptionLabel(shift)}
                    </option>
                  ))}
                  <option value="ADD_NEW" className="text-blue-600 font-bold">+ Create New Shift</option>
                </select>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div><label className="block mb-1 text-sm text-gray-700">Week Off Day</label><select value={weekOffDay} onChange={(e) => setWeekOffDay(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900"><option>Sunday</option><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option></select></div>
                <div><label className="block mb-1 text-sm text-gray-700">Week Offs per Month *</label><input type="number" value={weekOffsPerMonth} onChange={(e) => setWeekOffsPerMonth(e.target.value)} min="0" max="30" className="w-full p-2.5 border rounded-lg text-gray-900" required /></div>
                <div><label className="block mb-1 text-sm text-gray-700">Monthly Salary (Net)</label><input type="number" value={netSalary} readOnly className="w-full p-2.5 border rounded-lg bg-gray-100 text-gray-900" /></div>
                <div><label className="block mb-1 text-sm text-gray-700">Annual CTC</label><input type="number" value={ctc} onChange={(e) => setCtc(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" placeholder="e.g. 500000" /></div>
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-gray-900">Leave Limits</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div><label className="block mb-1 text-sm text-gray-700">Casual Leave (CL)</label><input type="number" min="0" value={maxCL} onChange={(e) => setMaxCL(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" required /></div>
                  <div><label className="block mb-1 text-sm text-gray-700">Sick Leave (SL)</label><input type="number" min="0" value={maxSL} onChange={(e) => setMaxSL(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" required /></div>
                  <div><label className="block mb-1 text-sm text-gray-700">Earned Leave (EL)</label><input type="number" min="0" value={maxEL} onChange={(e) => setMaxEL(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" required /></div>
                  <div><label className="block mb-1 text-sm text-gray-700">Comp Off</label><input type="number" min="0" value={maxCompOff} onChange={(e) => setMaxCompOff(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" required /></div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: INCREMENT */}
          {editingEmployee && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-indigo-50 px-4 py-3 border-b">
                <h3 className="text-lg font-semibold text-indigo-800"><FaChartLine className="inline mr-2" /> 6. Salary Increment</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Increment Type</label>
                    <select value={incrementType} onChange={(e) => setIncrementType(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900">
                      <option value="">Select Type</option>
                      <option value="percentage">Percentage (%)</option>
                      <option value="amount">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">{incrementType === 'percentage' ? 'Percentage %' : 'Amount (₹)'}</label>
                    <input type="number" value={incrementValue} onChange={(e) => setIncrementValue(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Effective From *</label>
                    <input type="date" value={incrementEffectiveDate} onChange={(e) => setIncrementEffectiveDate(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" min={joinDate || new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Reason</label>
                    <input type="text" value={incrementReason} onChange={(e) => setIncrementReason(e.target.value)} className="w-full p-2.5 border rounded-lg text-gray-900" placeholder="Performance bonus, promotion, etc." />
                  </div>
                </div>
                <button type="button" onClick={handleApplyIncrement}
                  disabled={!incrementType || !incrementValue || !incrementEffectiveDate || loading}
                  className="w-full md:w-auto px-6 py-2.5 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <FaSpinner className="animate-spin" /> : <FaChartLine />}
                  Apply Increment
                </button>
              </div>
            </div>
          )}

          {/* SUBMIT */}
          <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading} className={`px-8 py-3 rounded-lg font-medium text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'}`}>
              {loading ? <><FaSpinner className="inline mr-2 animate-spin" /> Processing...</> : <><FaSave className="inline mr-2" /> {editingEmployee || employeeFound ? "Update Employee" : "Add Employee"}</>}
            </button>
          </div>
        </form>
      </div>

      {/* MODALS */}
      {showShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="flex justify-between p-4 border-b"><h3 className="text-lg font-semibold text-gray-900">Create New Shift</h3><button onClick={() => setShowShiftModal(false)} className="text-2xl text-gray-500">&times;</button></div>
            <form onSubmit={handleCreateCustomShift} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Shift Type (A-Z)" value={createShiftForm.shiftType} onChange={(e) => setCreateShiftForm(prev => ({ ...prev, shiftType: e.target.value.toUpperCase() }))} className="p-2 border rounded text-gray-900" required />
                <input type="text" placeholder="Shift Name" value={createShiftForm.shiftName} onChange={(e) => setCreateShiftForm(prev => ({ ...prev, shiftName: e.target.value }))} className="p-2 border rounded text-gray-900" required />
              </div>
              <input type="text" placeholder="Time Range (e.g., 09:00 - 18:00)" value={createShiftForm.timeRange} onChange={(e) => setCreateShiftForm(prev => ({ ...prev, timeRange: e.target.value }))} className="w-full p-2 border rounded text-gray-900" required />
              <input type="text" placeholder="Description" value={createShiftForm.description} onChange={(e) => setCreateShiftForm(prev => ({ ...prev, description: e.target.value }))} className="w-full p-2 border rounded text-gray-900" required />
              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShowShiftModal(false)} className="px-4 py-2 border rounded text-gray-700">Cancel</button><button type="submit" className="px-4 py-2 text-white bg-purple-600 rounded">Create</button></div>
            </form>
          </div>
        </div>
      )}

      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="flex justify-between p-4 border-b"><h3 className="text-lg font-semibold text-gray-900">Add Department</h3><button onClick={() => setShowDeptModal(false)} className="text-2xl text-gray-500">&times;</button></div>
            <form onSubmit={handleCreateDepartment} className="p-4 space-y-4">
              <input type="text" placeholder="Department Name" value={deptForm.name} onChange={(e) => setDeptForm(prev => ({ ...prev, name: e.target.value }))} className="w-full p-2 border rounded text-gray-900" required />
              <textarea placeholder="Description" value={deptForm.description} onChange={(e) => setDeptForm(prev => ({ ...prev, description: e.target.value }))} rows="2" className="w-full p-2 border rounded text-gray-900"></textarea>
              <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowDeptModal(false)} className="px-4 py-2 border rounded text-gray-700">Cancel</button><button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded">Add</button></div>
            </form>
          </div>
        </div>
      )}

      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="flex justify-between p-4 border-b"><h3 className="text-lg font-semibold text-gray-900">Add Role</h3><button onClick={() => setShowRoleModal(false)} className="text-2xl text-gray-500">&times;</button></div>
            <form onSubmit={handleCreateRole} className="p-4 space-y-4">
              <input type="text" placeholder="Role Name" value={roleForm.name} onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))} className="w-full p-2 border rounded text-gray-900" required />
              <textarea placeholder="Description" value={roleForm.description} onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))} rows="2" className="w-full p-2 border rounded text-gray-900"></textarea>
              <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowRoleModal(false)} className="px-4 py-2 border rounded text-gray-700">Cancel</button><button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded">Add</button></div>
            </form>
          </div>
        </div>
      )}

      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between p-4 border-b"><h3 className="text-lg font-semibold text-gray-900">Add Location</h3><button onClick={() => setShowLocationModal(false)} className="text-2xl text-gray-500">&times;</button></div>
            <form onSubmit={handleCreateLocation} className="p-4 space-y-4">
              <input type="text" placeholder="Location Name" value={locationForm.name} onChange={(e) => setLocationForm(prev => ({ ...prev, name: e.target.value }))} className="w-full p-2 border rounded text-gray-900" required />
              <div className="flex justify-between items-center"><label className="text-sm text-gray-700">Coordinates</label><button type="button" onClick={handleGetCurrentLocation} className="px-3 py-1 text-sm bg-blue-600 text-white rounded">📍 Get Current Location</button></div>
              <div className="grid grid-cols-2 gap-3"><input type="text" placeholder="Latitude" value={locationForm.latitude} onChange={(e) => setLocationForm(prev => ({ ...prev, latitude: e.target.value }))} className="p-2 border rounded text-gray-900" required /><input type="text" placeholder="Longitude" value={locationForm.longitude} onChange={(e) => setLocationForm(prev => ({ ...prev, longitude: e.target.value }))} className="p-2 border rounded text-gray-900" required /></div>
              <textarea placeholder="Full Address" value={locationForm.fullAddress} onChange={(e) => setLocationForm(prev => ({ ...prev, fullAddress: e.target.value }))} rows="3" className="w-full p-2 border rounded text-gray-900" required></textarea>
              <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowLocationModal(false)} className="px-4 py-2 border rounded text-gray-700">Cancel</button><button type="submit" className="px-4 py-2 text-white bg-purple-600 rounded">Add Location</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEmployeePage;