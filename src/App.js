import { Route, Routes } from "react-router-dom";

// Import your components
import Login from "../src/Pages/Login.js";
import CompanySidebar from "./Components/CompanySidebar.js";
import DepartmentList from "./Components/department";
import Recruitment from "./Components/recruitment.js";
import SubDepartmentList from "./Components/subdepartment.js";
import EmployeeLogin from "./EmployeeLogin.js";
import AdminLayout from "./Layout/AdminLayout.jsx";
import AboutUsFormPage from "./Pages/AboutUsFormPage.js";
import AbsentToday from "./Pages/AbsentToday.js";
import AcceptedAppointmentsList from "./Pages/AcceptedAppointmentsList.js";
import AddEmployeePage from "./Pages/AddEmployeePage.js";
import AdminNotifications from "./Pages/AdminNotifications.js";
import AllFunFactsTable from "./Pages/AllFunFactsTable.js";
import AllPayments from "./Pages/AllPayments.js";
import AllQuizzesTable from "./Pages/AllQuizzesTable.js";
import AppointmentBookingForm from "./Pages/AppointmentBookingForm.js";
import AttendanceCapture from "./Pages/AttendanceCapture.jsx";
import AttendanceForm from "./Pages/AttendanceForm.js";
import AttendanceList from "./Pages/AttendanceList.js";
import DiagnosticList from "./Pages/Awardlist.js";
import BackupReset from "./Pages/BackupReset.js";
import BookingList from "./Pages/BookingList.js";
import BulkFunFactUploader from "./Pages/BulkFunFactUploader.js";
import BulkQuizUploader from "./Pages/BulkQuizUploader.js";
import CancelledBookingList from "./Pages/CancelledBookingList .js";
import CandidateSelection from "./Pages/CandidateSelection.js";
import CandidateShortlist from "./Pages/CandidateShortlist.js";
import CategoryForm from "./Pages/CategoryForm.js";
import CategoryList from "./Pages/CategoryList.js";
import ClientsTable from "./Pages/ClientsTable.js";
import CompanyDetailsForm from "./Pages/CompanyDetailsForm.js";
import CompanyList from "./Pages/CompanyList.js";
import CompletedBookingList from "./Pages/CompletedBookingList .js";
import ContactUsPage from "./Pages/ContactUsPage.js";
import CouponHistoryTable from "./Pages/CouponHistoryTable.js";
import CouponsPage from "./Pages/CouponPage.js";
import CreateBusinessCard from "./Pages/CreateBusinessCard.js";
import CreateCategory from "./Pages/CreateCategory.js";
import CreateCoupon from "./Pages/CreateCoupon.js";
import CreateLogo from "./Pages/CreateLogo.js";
import CreatePlan from "./Pages/CreatePlan.js";
import CreatePoster from "./Pages/CreatePoster.js";
import CreateProductForm from "./Pages/CreateProduct.js";
import CreateVendor from "./Pages/CreateVendor.js";
import Dashboard from "./Pages/Dashboard.jsx";
import DiagnosticBookingForm from "./Pages/DiagnosticBookingForm.js";
import DiagnosticDetail from "./Pages/DiagnosticDetail.js";
import DiagnosticsAcceptedBooking from "./Pages/DiagnosticsAcceptedBooking.js";
import DiagnosticsBookingList from "./Pages/DiagnosticsBookingList.js";
import DiagnosticsPendingBooking from "./Pages/DiagnosticsPendingBooking.js";
import DiagnosticsRejectedBooking from "./Pages/DiagnosticsRejectedBooking.js";
import DoctorAppointmentList from "./Pages/DoctorAppointmentList.js";
import DoctorAppointmentListPending from "./Pages/DoctorAppointmentListPending.js";
import DoctorDetailsForm from "./Pages/DoctorDetailsForm.js";
import DoctorList from "./Pages/DoctorList.js";
import DocumentTable from "./Pages/DocumentTable.js";
import EmployeeDashboard from "./Pages/EmployeeDashboard.jsx";
import EmployeeLeaves from "./Pages/EmployeeLeaves.js";
import EmployeeList from "./Pages/EmployeeList.js";
import GetAboutUsPage from "./Pages/GetAboutUsPage.js";
import GetContactUsPage from "./Pages/GetContactUsPage.js";
import Holiday from "./Pages/Holiday.js";
import InterviewList from "./Pages/InterviewList.js";
import LandingPage from "./Pages/LandingPage.js";
import LanguageSetup from "./Pages/LanguageSetup.js";
import LateToday from "./Pages/LateToday.js";
import { default as DiagnostiCreate, default as LeaveApplication } from "./Pages/LeaveApplication.js";
import LeaveApproval from "./Pages/LeaveApproval";
import Leaves from "./Pages/Leaves.js";
import LeavesList from "./Pages/LeavesList.js";
import LogoList from "./Pages/LogoList.js";
import ManageProjects from "./Pages/ManageProject.js";
import MessagesTable from "./Pages/Message.js";
import MissingAttendance from "./Pages/MissingAttendance.js";
import MonthlyAttendance from "./Pages/MonthlyAttendance.js";
import MyAttendance from "./Pages/MyAttendance.js";
import NoticeList from "./Pages/Noticelist.js";
import OrdersList from "./Pages/OrdersList.js";
import PendingAttendance from "./Pages/PendingAttendance.js";
import PendingBookingList from "./Pages/PendingBookingList.js";
import PlanList from "./Pages/PlanList.js";
import PosterList from "./Pages/PosterList.js";
import PrivacyPolicyForm from "./Pages/PrivacyPolicyForm.js";
import PrivacyPolicyPage from "./Pages/PrivacyPolicyPage.js";
import ProductList from "./Pages/ProductList.js";
import ProjectsTable from "./Pages/ProjectsTable.js";
import ProjectTasksTable from "./Pages/ProjectTasksTable.js";
import ReceivedPayments from "./Pages/ReceivedPayments.js";
import RedeemedCouponsList from "./Pages/RedeemedCouponsList.js";
import RejectedAppointmentsList from "./Pages/RejectedAppointmentsList.js";
import SentMessagesTable from "./Pages/Sent.js";
import Settings from "./Pages/Setting";
import SetupRulesTable from "./Pages/Setup.js";
import StaffDetailsForm from "./Pages/StaffDetailsForm.js";
import StaffHistory from "./Pages/StaffHistory.js";
import StaffList from "./Pages/StaffList.js";
import TodayAttendance from "./Pages/TodayAttendance.js";
import UploadDocuments from "./Pages/UploadDocuments.js";
import AllUserCoupons from "./Pages/userCoupons.js";
import UserList from "./Pages/UserList.js";
import UserDetail from "./Pages/UserProfile.js";
import UsersPlansList from "./Pages/UsersPlansList.js";
import VendorDocumentList from "./Pages/VendorDocumentList.js";
import VendorInvoiceList from "./Pages/VendorInvoiceList.js";
import VendorList from "./Pages/VendorList.js";
import VendorDetail from "./Pages/VendorProfile.js";
import WeeklyHoliday from "./Pages/WeeklyHoliday.js";
// import LandingPage from "./Pages/LandingPage.js";
import AdminEmployeeLocations from "./Pages/AdminEmployeeLocations.js";
import AssignLocation from "./Pages/AssignLocation.js";
import LeavesReport from "./Pages/LeavesReport.js";
import MyShift from "./Pages/MyShift.js";
import ShiftList from "./Pages/ShiftList.js";
import ShiftManagement from "./Pages/ShiftManagement.js";
function App() {
  return (
    <Routes>
      {/* Login page rendered outside AdminLayout */}
      <Route path="/" element={<LandingPage />} />
      {/* <Route path="/" element={<LoginPage />} /> */}
      <Route path="/admin-login" element={<Login/>}/>
      <Route path="/employee-login" element={<EmployeeLogin/>}/>
      <Route path="/employeedashboard" element={<EmployeeDashboard />} />
      <Route path="/leave-application" element={<LeaveApplication />} />
        <Route path="/myleaves" element={<EmployeeLeaves />} />
         <Route path="/attendance-capture" element={<AttendanceCapture />} />
          <Route path="/myattendance" element={<MyAttendance />} />
          <Route path="/my-shift" element={<MyShift />} />
      {/* All other routes inside AdminLayout */}
      <Route
        path="/*"
        element={
          <AdminLayout>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/department" element={<DepartmentList />} />
              <Route path="/subdepartment" element={<SubDepartmentList />} />
              <Route path="/attendanceform" element={<AttendanceForm />} />
              <Route path="/monthlyattendance" element={<MonthlyAttendance />} />
              <Route path="/missingattendance" element={<MissingAttendance />} />
              <Route path="/weeklyholiday" element={<WeeklyHoliday />} />
              <Route path="/holiday" element={<Holiday />} />
              <Route path="/create-diagnostic" element={<DiagnostiCreate />} />
              <Route path="/leaves" element={<Leaves />} />
              <Route path="/leaveapproval" element={<LeaveApproval />} />
              <Route path="/recruitment" element={<Recruitment />} />
              <Route path="/setting" element={<Settings />} />
              <Route path="/languagesetup" element={<LanguageSetup />} />
              <Route path="/backupreset" element={<BackupReset />} />
              <Route path="/diagnosticlist" element={<DiagnosticList />} />
              <Route path="/message" element={<MessagesTable />} />
              <Route path="/noticelist" element={<NoticeList />} />
              <Route path="/sentlist" element={<SentMessagesTable />} />
              <Route path="/setuplist" element={<SetupRulesTable />} />
              <Route path="/candidate-shortlist" element={<CandidateShortlist />} />
              <Route path="/interviewlist" element={<InterviewList />} />
              <Route path="/selectedcandidates" element={<CandidateSelection />} />
              <Route path="/clients" element={<ClientsTable />} />
              <Route path="/projects" element={<ProjectsTable />} />
              <Route path="/task" element={<ProjectTasksTable />} />
              <Route path="/manage-project" element={<ManageProjects />} />
              <Route path="/company-register" element={<CompanyDetailsForm />} />
              <Route path="/companylist" element={<CompanyList />} />
              <Route path="/create-doctor" element={<DoctorDetailsForm />} />
              <Route path="/doctorlist" element={<DoctorList />} />
              <Route path="/staff-register" element={<StaffDetailsForm />} />
              <Route path="/stafflist" element={<StaffList />} />
              <Route path="/diagnosticslist" element={<DiagnosticsBookingList />} />
              <Route path="/diagnosticsacceptedlist" element={<DiagnosticsAcceptedBooking />} />
              <Route path="/diagnosticsrejectedlist" element={<DiagnosticsRejectedBooking />} />
              <Route path="/doctoracceptedlist" element={<AcceptedAppointmentsList />} />
              <Route path="/doctorrejectedlist" element={<RejectedAppointmentsList />} />
              <Route path="/appintmentlist" element={<DoctorAppointmentList />} />
              <Route path="/appintmentbooking" element={<AppointmentBookingForm />} />
              <Route path="/diagnostic-center/:id" element={<DiagnosticDetail />} />
              <Route path="/diagnosticpending" element={<DiagnosticsPendingBooking />} />
              <Route path="/doctorpendingbookings" element={<DoctorAppointmentListPending />} />
              <Route path="/categoryform" element={<CategoryForm />} />
              <Route path="/categorylist" element={<CategoryList />} />
              <Route path="/add-product" element={<CreateProductForm />} />
              <Route path="/productlist" element={<ProductList />} />
              <Route path="/allorders" element={<BookingList />} />
              <Route path="/pendingorders" element={<PendingBookingList />} />
              <Route path="/completedorders" element={<CompletedBookingList />} />
              <Route path="/cancelledorders" element={<CancelledBookingList />} />
              <Route path="/companysidebar" element={<CompanySidebar />} />
              <Route path="/staff-history/:staffId" element={<StaffHistory />} /> {/* Route for StaffHistory */}
              <Route path="/book-diagnostic" element={<DiagnosticBookingForm />} />
              <Route path="/coupons" element={<CouponsPage />} />
              <Route path="/couponshistory" element={<CouponHistoryTable />} />
              <Route path="/create-coupon" element={<CreateCoupon />} />
              <Route path="/upload-docs" element={<UploadDocuments />} />
              <Route path="/docs" element={<DocumentTable />} />
              <Route path="/user-coupons" element={<AllUserCoupons />} />

              <Route path="/create-category" element={<CreateCategory />} />
              <Route path="/categorylist" element={<CategoryList />} />
              <Route path="/create-poster" element={<CreatePoster />} />
              <Route path="/posterlist" element={<PosterList />} />
              <Route path="/create-logo" element={<CreateLogo />} />
              <Route path="/logolist" element={<LogoList />} />
              <Route path="/create-businesscard" element={<CreateBusinessCard />} />
              <Route path="/create-plan" element={<CreatePlan />} />
              <Route path="/planlist" element={<PlanList />} />
              <Route path="/userplanlist" element={<UsersPlansList />} />
              <Route path="/orderlist" element={<OrdersList />} />
              <Route path="/create-privacy" element={<PrivacyPolicyForm />} />
              <Route path="/get-policy" element={<PrivacyPolicyPage />} />
              <Route path="/aboutus" element={<AboutUsFormPage />} />
              <Route path="/getaboutus" element={<GetAboutUsPage />} />
              <Route path="/contactus" element={<ContactUsPage />} />
              <Route path="/getcontactus" element={<GetContactUsPage />} />
              <Route path="/create-vendor" element={<CreateVendor />} />
              <Route path="/vendorlist" element={<VendorList />} />
              <Route path="/vendordocumentlist" element={<VendorDocumentList />} />
              <Route path="/redeemed-coupons" element={<RedeemedCouponsList />} />
              <Route path="/payment" element={<VendorInvoiceList />} />
              <Route path="/rcvdpayment" element={< ReceivedPayments />} />
              <Route path="/allpayments" element={< AllPayments />} />
              <Route path="/vendor/:id" element={<VendorDetail />} />
              <Route path="/users" element={<UserList />} />
              <Route path="/users/:userId" element={<UserDetail />} />
              <Route path="/add-bulk-quiz" element={<BulkQuizUploader />} />
              <Route path="/quizzes" element={<AllQuizzesTable />} />
              <Route path="/add-bulk-funfacts" element={<BulkFunFactUploader />} />
              <Route path="/allfanfacts" element={<AllFunFactsTable />} />
               <Route path="/notifications" element={<AdminNotifications />} />


             <Route path="/addemployee" element={<AddEmployeePage />} />
              <Route path="/employeelist" element={<EmployeeList />} />
              <Route path="/attendancelist" element={<AttendanceList />} />
              <Route path="/leavelist" element={<LeavesList />} />
              
              <Route path="/today-attendance" element={<TodayAttendance />} />
              <Route path="/pendings-attendance" element={<PendingAttendance />} />
              <Route path="/absent-today" element={<AbsentToday />} />
              <Route path="/late-today" element={<LateToday />} />
              <Route path="/attendance-capture" element={<AttendanceCapture />} />
              <Route path="/myattendance" element={<MyAttendance />} />
              <Route path="/leaves-report" element={<LeavesReport/>}/>
              <Route path="/shift" element={<ShiftManagement />}/>
              <Route path="/shiftlist" element={<ShiftList />}/>
              <Route path="/assignlocation" element={<AssignLocation />}/>
              <Route path="/admin-employee-locations" element={<AdminEmployeeLocations />}/>

            </Routes>
          </AdminLayout>
        }
      />
    </Routes>
  );
}

export default App;
