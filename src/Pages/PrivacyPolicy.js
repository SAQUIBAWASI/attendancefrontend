import React from "react";
import {
  FaGavel,
  FaTrashAlt,
  FaClock,
  FaFileAlt,
} from "react-icons/fa";
import {
  FiShield,
  FiUser,
  FiHeart,
  FiLock,
  FiDatabase,
  FiUserX,
  FiSettings,
  FiLink,
  FiGlobe,
  FiRefreshCw,
  FiMail,
  FiCheckCircle,
  FiInfo,
  FiAlertTriangle,
  FiFileText,
  FiList,
  FiUsers,
  FiActivity,
  FiServer,
  FiEye,
} from "react-icons/fi";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

const PrivacyPolicy = () => {
  // ============================
  // BULLET LIST
  // ============================
  const Bullets = ({ items }) => (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );

  // ============================
  // SUB-SECTION BOX
  // ============================
  const SubSection = ({ title, children }) => (
    <div className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-100">
      <h3 className="font-bold text-slate-800 text-xs md:text-sm mb-2 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        {title}
      </h3>
      <div className="text-slate-600 text-xs md:text-sm space-y-1.5">{children}</div>
    </div>
  );

  // ============================
  // CHIP GRID
  // ============================
  const ChipGrid = ({ items, color = "blue" }) => {
    const colorMap = {
      blue: "bg-blue-50 border-blue-100 text-blue-800",
      emerald: "bg-emerald-50 border-emerald-100 text-emerald-800",
      indigo: "bg-indigo-50 border-indigo-100 text-indigo-800",
      purple: "bg-purple-50 border-purple-100 text-purple-800",
      gray: "bg-gray-50 border-gray-100 text-slate-700",
    };
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${colorMap[color]}`}
          >
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            <span className="text-[11px] md:text-xs font-medium">
              {item.label || item}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // ============================
  // SECTION BLOCK (always open)
  // ============================
  const Section = ({ id, num, title, icon, subCount, children }) => (
    <div id={id} className="emp-dash__card mb-3 scroll-mt-20">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
          {icon}
        </div>
        <div className="min-w-0">
          <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Section {num}
            {subCount ? ` · ${subCount} sub-parts` : ""}
          </span>
          <h2 className="font-bold text-slate-800 text-sm md:text-base mt-0.5">
            {title}
          </h2>
        </div>
      </div>

      {/* Body — always visible */}
      <div className="p-4 md:p-5 text-slate-600 text-xs md:text-sm leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  );

  // ============================
  // KPI STAT CARD
  // ============================
  const Stat = ({ label, value, meta, icon, variant }) => (
    <div className="emp-dash__stat">
      <div className="emp-dash__stat-top">
        <span className="emp-dash__stat-label">{label}</span>
        <div className={`emp-dash__stat-icon emp-dash__stat-icon--${variant}`}>
          {icon}
        </div>
      </div>
      <div className="emp-dash__stat-value">{value}</div>
      <div className="emp-dash__stat-meta">{meta}</div>
    </div>
  );

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">

        {/* ===================== HEADER (Desktop) ===================== */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Privacy <span>Policy</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="emp-dash__date-pill flex-shrink-0">
              <FiShield />
              <span>Timely Health Tech Pvt. Ltd.</span>
            </div>
            <div className="emp-dash__date-pill flex-shrink-0">
              <FaClock />
              <span>Last Updated: 08 Oct 2026</span>
            </div>
            <div className="emp-dash__date-pill flex-shrink-0">
              <FaFileAlt />
              <span>16 Sections</span>
            </div>
          </div>
        </div>

        {/* ===================== HEADER (Mobile) ===================== */}
        <div className="lg:hidden flex flex-col gap-2 mb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h1 className="text-base font-bold whitespace-nowrap">
              Privacy <span className="text-indigo-600">Policy</span>
            </h1>
            <div className="emp-dash__date-pill text-[10px] px-2 py-1">
              <FiShield className="text-[10px]" />
              <span>Timely Health</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="emp-dash__date-pill text-[10px] px-2 py-1">
              <FaClock className="text-[10px]" />
              <span>08 Oct 2026</span>
            </div>
            <div className="emp-dash__date-pill text-[10px] px-2 py-1">
              <FaFileAlt className="text-[10px]" />
              <span>16 Sections</span>
            </div>
          </div>
        </div>

        {/* ===================== INTRO ===================== */}
        <div className="emp-dash__card p-4 md:p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <FiShield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm md:text-base">
                Our Commitment to Your Privacy
              </h2>
              <p className="text-slate-600 text-xs md:text-sm mt-2 leading-relaxed">
                Timely Health Tech Pvt. Ltd. ("Timely Health", "we", "us", or "our") operates a connected
                healthcare technology platform designed to make healthcare more accessible, local, preventive,
                and convenient. Our platform may connect individuals and communities with healthcare services
                and verified healthcare providers — including doctors, clinics, hospitals, diagnostic
                laboratories, preventive healthcare programs, health camps, appointments, consultations,
                and other healthcare-related services.
              </p>
              <p className="text-slate-600 text-xs md:text-sm mt-2 leading-relaxed">
                This Privacy Policy explains how we collect, use, store, disclose, and protect information
                when you use the <strong>Timely Health User Application ("App")</strong>, our website, and
                related services.
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <FiAlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-amber-700 text-[11px] md:text-xs leading-relaxed">
              By using the App, you acknowledge that you have read and understood this Privacy Policy.
              Where applicable law requires specific consent, we will obtain such consent separately.
            </p>
          </div>
        </div>

        {/* ===================== KPI STATS ===================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Stat
            label="Total Sections"
            value="16"
            meta="policy sections"
            icon={<FiFileText />}
            variant="rate"
          />
          <Stat
            label="Last Updated"
            value="08 Oct"
            meta="2026"
            icon={<FaClock />}
            variant="present"
          />
          <Stat
            label="Data Protection"
            value="Active"
            meta="encryption enabled"
            icon={<FiLock />}
            variant="present"
          />
          <Stat
            label="Compliance"
            value="GDPR"
            meta="DPDP aware"
            icon={<FiShield />}
            variant="late"
          />
        </div>

        {/* ===================== TABLE OF CONTENTS ===================== */}
        <div className="emp-dash__card p-4 md:p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <FiList className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="font-bold text-slate-800 text-sm md:text-base">
              Table of Contents
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              { id: "s1", num: 1, label: "About Timely Health" },
              { id: "s2", num: 2, label: "Information We Collect" },
              { id: "s3", num: 3, label: "How We Use Your Information" },
              { id: "s4", num: 4, label: "How We Share Your Information" },
              { id: "s5", num: 5, label: "Healthcare Provider Responsibility" },
              { id: "s6", num: 6, label: "Health Information" },
              { id: "s7", num: 7, label: "Data Security" },
              { id: "s8", num: 8, label: "Data Retention" },
              { id: "s9", num: 9, label: "Account & Data Deletion" },
              { id: "s10", num: 10, label: "Your Privacy Rights" },
              { id: "s11", num: 11, label: "Children's Privacy" },
              { id: "s12", num: 12, label: "Third-Party Services" },
              { id: "s13", num: 13, label: "International Data Processing" },
              { id: "s14", num: 14, label: "Changes to This Policy" },
              { id: "s15", num: 15, label: "Contact Us" },
              { id: "s16", num: 16, label: "Acknowledgement" },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all text-left border border-transparent hover:border-blue-100"
              >
                <span className="text-blue-500 flex-shrink-0">
                  <FiFileText className="w-3.5 h-3.5" />
                </span>
                <span className="truncate">
                  {item.num}. {item.label}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* ===================== ALL SECTIONS ===================== */}
        <div className="space-y-3">

          {/* ============ SECTION 1 ============ */}
          <Section id="s1" num={1} title="About Timely Health" icon={<FiInfo className="w-5 h-5" />}>
            <p>
              Timely Health aims to bridge the gap between traditional healthcare and modern digital
              convenience by connecting individuals with healthcare providers and healthcare services.
            </p>
            <p>
              Depending on your location, healthcare provider, partner organization, and the features
              available in the App, Timely Health may allow you to:
            </p>
            <Bullets
              items={[
                "Discover doctors, clinics, hospitals, laboratories, and other healthcare providers.",
                "Search for healthcare providers and healthcare services.",
                "View healthcare provider and service information.",
                "Book appointments.",
                "Request consultations.",
                "Book diagnostic and laboratory services.",
                "Request home sample collection.",
                "Participate in preventive healthcare programs and health camps.",
                "Submit healthcare enquiries.",
                "Receive healthcare-related service updates.",
                "Manage appointments and healthcare requests.",
                "Access reports or other information made available through participating providers.",
                "Connect with healthcare providers and service partners.",
                "Access other healthcare and wellness services made available through the platform.",
              ]}
            />
            <p className="text-slate-500 italic text-xs">
              The services available through the App may vary depending on your location and the healthcare
              providers or organizations participating in the Timely Health platform.
            </p>
          </Section>

          {/* ============ SECTION 2 ============ */}
          <Section id="s2" num={2} title="Information We Collect" icon={<FiList className="w-5 h-5" />} subCount={8}>
            <p>
              The information we collect depends on how you use the App and which services you request.
            </p>

            <div className="space-y-3 mt-3">
              <SubSection title="2.1 Personal and Account Information">
                <p>When you create an account or use our services, we may collect:</p>
                <Bullets
                  items={[
                    "Full name",
                    "Mobile phone number",
                    "Email address",
                    "Date of birth or age, where required",
                    "Gender, where required",
                    "Profile information",
                    "Account credentials or authentication information",
                    "Information you provide when contacting customer support",
                  ]}
                />
              </SubSection>

              <SubSection title="2.2 Healthcare and Medical Information">
                <p>Depending on the services you use, we may process healthcare-related information, including:</p>
                <Bullets
                  items={[
                    "Appointment information",
                    "Doctor or healthcare provider information",
                    "Healthcare service requests",
                    "Diagnostic test bookings",
                    "Laboratory reports and test results",
                    "Consultation-related information",
                    "Prescriptions or referral information, where provided",
                    "Health information voluntarily provided by you",
                    "Information submitted during health camps or preventive healthcare programs",
                    "Information necessary to provide a healthcare service requested by you",
                  ]}
                />
                <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-blue-700 text-[11px]">
                    <strong>Note:</strong> Healthcare information is treated as sensitive information and
                    is processed only for legitimate purposes related to the services you request,
                    applicable legal requirements, and the operation and security of the platform.
                  </p>
                </div>
              </SubSection>

              <SubSection title="2.3 Address and Location Information">
                <p>Depending on the features you use, we may collect or process:</p>
                <Bullets
                  items={[
                    "Address",
                    "City or locality",
                    "Service location",
                    "GPS/location information, where you grant permission",
                    "Location information manually entered by you",
                  ]}
                />
                <p className="mt-2 font-semibold text-slate-700">Location information may be used to:</p>
                <Bullets
                  items={[
                    "Show healthcare providers and services available near you.",
                    "Identify relevant clinics, hospitals, laboratories, or healthcare programs.",
                    "Facilitate appointments or service requests.",
                    "Facilitate home healthcare or sample collection.",
                    "Help service providers reach the requested service location.",
                    "Improve service availability and coordination.",
                  ]}
                />
                <p className="mt-2 text-[11px] text-slate-500">
                  We only request location permissions where they are required for an available feature.
                </p>
              </SubSection>

              <SubSection title="2.4 Booking and Service Information">
                <p>When you book or request a healthcare service, we may collect:</p>
                <Bullets
                  items={[
                    "Selected healthcare provider",
                    "Selected service",
                    "Appointment date and time",
                    "Booking information",
                    "Service location",
                    "Enquiry details",
                    "Booking status",
                    "Cancellation or rescheduling information",
                    "Communication related to the service",
                  ]}
                />
              </SubSection>

              <SubSection title="2.5 Payment and Transaction Information">
                <p>Where payment functionality is available, we may process:</p>
                <Bullets
                  items={[
                    "Transaction information",
                    "Payment status",
                    "Order or booking amount",
                    "Refund information",
                    "Transaction/reference identifiers",
                  ]}
                />
                <p className="mt-2 text-[11px] text-slate-500">
                  Payments may be processed by third-party payment service providers. Where a third-party
                  payment provider processes your payment, your complete card, banking, or payment
                  credentials may be handled directly by that provider in accordance with its privacy
                  policy and security practices.
                </p>
              </SubSection>

              <SubSection title="2.6 Device and Technical Information">
                <p>When you use the App, certain technical information may be collected automatically:</p>
                <Bullets
                  items={[
                    "Device model",
                    "Operating system and version",
                    "App version",
                    "IP address",
                    "Network information",
                    "Device identifiers, where applicable",
                    "Crash information",
                    "Diagnostic information",
                    "Application logs",
                    "Performance information",
                  ]}
                />
                <p className="mt-2 text-[11px] text-slate-500">
                  This information may be used to maintain security, troubleshoot technical problems,
                  improve performance, and maintain the App.
                </p>
              </SubSection>

              <SubSection title="2.7 Camera, Photos, Files and Documents">
                <p>If a feature requires you to upload or capture information, the App may request access to your:</p>
                <Bullets items={["Camera", "Photos", "Media", "Files or documents"]} />
                <p className="mt-2">
                  For example, these permissions may be used to upload prescriptions, reports, referral
                  documents, identification documents, or other information that you choose to provide.
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  We do not access your camera, photos, or files unless the relevant functionality requires
                  the permission and you provide access through your device.
                </p>
              </SubSection>

              <SubSection title="2.8 Notifications">
                <p>If you enable notifications, we may send:</p>
                <Bullets
                  items={[
                    "Appointment confirmations",
                    "Appointment reminders",
                    "Booking updates",
                    "Sample collection updates",
                    "Report availability notifications",
                    "Payment or transaction updates",
                    "Account and security notifications",
                    "Other service-related communications",
                  ]}
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  You can manage notification permissions through your device settings.
                </p>
              </SubSection>
            </div>
          </Section>

          {/* ============ SECTION 3 ============ */}
          <Section id="s3" num={3} title="How We Use Your Information" icon={<FiActivity className="w-5 h-5" />} subCount={5}>
            <p>We may use your information for the following purposes:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <h4 className="font-bold text-blue-800 text-xs mb-2 flex items-center gap-2">
                  <FiHeart className="w-3.5 h-3.5" /> Providing Healthcare Services
                </h4>
                <Bullets
                  items={[
                    "To provide healthcare-related services requested by you.",
                    "To connect you with doctors, clinics, hospitals, laboratories, and other healthcare providers.",
                    "To process appointments and bookings.",
                    "To coordinate consultations.",
                    "To coordinate home healthcare and sample collection.",
                    "To support preventive healthcare programs and health camps.",
                  ]}
                />
              </div>

              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <h4 className="font-bold text-emerald-800 text-xs mb-2 flex items-center gap-2">
                  <FiUser className="w-3.5 h-3.5" /> Account Management
                </h4>
                <Bullets
                  items={[
                    "To create and manage your account.",
                    "To authenticate your identity.",
                    "To maintain your profile.",
                    "To communicate with you regarding your account.",
                  ]}
                />
              </div>

              <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                <h4 className="font-bold text-indigo-800 text-xs mb-2 flex items-center gap-2">
                  <FiActivity className="w-3.5 h-3.5" /> Communication
                </h4>
                <Bullets
                  items={[
                    "To send appointment and booking confirmations.",
                    "To provide service updates.",
                    "To respond to enquiries.",
                    "To provide customer support.",
                    "To send important account and security communications.",
                  ]}
                />
              </div>

              <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                <h4 className="font-bold text-purple-800 text-xs mb-2 flex items-center gap-2">
                  <FiServer className="w-3.5 h-3.5" /> Platform Operations
                </h4>
                <Bullets
                  items={[
                    "To operate and maintain the Timely Health platform.",
                    "To troubleshoot technical issues.",
                    "To monitor application performance.",
                    "To improve features and user experience.",
                    "To detect and prevent unauthorized use, fraud, abuse, or security incidents.",
                  ]}
                />
              </div>
            </div>

            <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
              <h4 className="font-bold text-slate-800 text-xs mb-2 flex items-center gap-2">
                <FaGavel className="w-3.5 h-3.5" /> Legal and Regulatory Requirements
              </h4>
              <Bullets
                items={[
                  "To comply with applicable laws and regulations.",
                  "To respond to lawful requests from government or regulatory authorities.",
                  "To protect our legal rights and interests.",
                  "To investigate security incidents, fraud, or misuse.",
                ]}
              />
            </div>
          </Section>

          {/* ============ SECTION 4 ============ */}
          <Section id="s4" num={4} title="How We Share Your Information" icon={<FiUsers className="w-5 h-5" />} subCount={4}>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <FiAlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-xs font-bold">
                We do not sell your personal information for advertising purposes.
              </p>
            </div>

            <p className="mt-3">
              We may share information where necessary to provide services, operate the platform, comply
              with legal obligations, or protect users and our services.
            </p>

            <div className="space-y-3 mt-3">
              <SubSection title="4.1 Healthcare Providers">
                <p>When you request a service, relevant information may be shared with the healthcare provider selected by you, including:</p>
                <Bullets
                  items={[
                    "Doctors",
                    "Clinics",
                    "Hospitals",
                    "Diagnostic laboratories",
                    "Healthcare professionals",
                    "Other healthcare organizations",
                  ]}
                />
                <p className="mt-2 text-[11px] text-slate-500">
                  For example, information required to process an appointment may be shared with the
                  selected doctor or clinic.
                </p>
              </SubSection>

              <SubSection title="4.2 Phlebotomists and Home-Service Professionals">
                <p>If you request home sample collection or another home healthcare service, relevant information may be shared with the assigned service professional.</p>
                <p className="mt-2 font-semibold text-slate-700">This may include:</p>
                <Bullets
                  items={[
                    "Name",
                    "Contact information",
                    "Collection/service address",
                    "Appointment details",
                    "Booking information",
                    "Information necessary to complete the requested service",
                  ]}
                />
                <p className="mt-2 text-[11px] text-slate-500">
                  Only information necessary for the relevant service should be made available to the
                  assigned professional.
                </p>
              </SubSection>

              <SubSection title="4.3 Technology and Service Providers">
                <p>We may use third-party service providers to support the operation of our platform, including providers for:</p>
                <ChipGrid
                  color="gray"
                  items={[
                    "Cloud hosting",
                    "Data storage",
                    "Authentication",
                    "SMS or OTP services",
                    "Push notifications",
                    "Payment processing",
                    "Maps and location services",
                    "Analytics",
                    "Crash reporting",
                    "Customer communication",
                    "Technical infrastructure",
                  ]}
                />
                <p className="mt-2 text-[11px] text-slate-500">
                  These providers may process information on our behalf as necessary to provide their services.
                </p>
              </SubSection>

              <SubSection title="4.4 Legal and Regulatory Authorities">
                <p>We may disclose information where reasonably necessary to:</p>
                <Bullets
                  items={[
                    "Comply with applicable law.",
                    "Respond to legal processes.",
                    "Respond to government or regulatory requests.",
                    "Prevent fraud or illegal activity.",
                    "Protect the safety, rights, and security of users or other persons.",
                    "Protect Timely Health's legal rights and property.",
                  ]}
                />
              </SubSection>
            </div>
          </Section>

          {/* ============ SECTION 5 ============ */}
          <Section id="s5" num={5} title="Healthcare Provider Responsibility" icon={<FiHeart className="w-5 h-5" />}>
            <p>
              Timely Health may connect you with independent healthcare providers and organizations.
              Healthcare providers may have their own privacy practices and policies.
            </p>
            <p>
              When you use a service provided by a doctor, clinic, hospital, laboratory, or other healthcare
              organization, that provider may independently process your information for purposes related
              to providing healthcare services.
            </p>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <p className="text-blue-700 text-[11px]">
                We encourage you to review the privacy practices of the relevant healthcare provider where
                applicable.
              </p>
            </div>
          </Section>

          {/* ============ SECTION 6 ============ */}
          <Section id="s6" num={6} title="Health Information" icon={<FiHeart className="w-5 h-5" />}>
            <p>
              Some services available through Timely Health may involve sensitive health or medical
              information. Examples include:
            </p>
            <ChipGrid
              color="emerald"
              items={[
                "Diagnostic reports",
                "Test results",
                "Consultation information",
                "Prescription information",
                "Referral information",
                "Healthcare service information",
                "Health information provided during health programs or health camps",
              ].map((label) => ({ label, icon: <FiCheckCircle className="w-3.5 h-3.5" /> }))}
            />
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <p className="text-xs text-slate-600">
                We use health information only for legitimate purposes related to providing requested
                services, operating and securing the platform, providing support, and complying with
                applicable legal requirements.
              </p>
              <p className="text-xs text-slate-800 font-bold mt-2">
                We do not sell your health information for advertising purposes.
              </p>
            </div>
          </Section>

          {/* ============ SECTION 7 ============ */}
          <Section id="s7" num={7} title="Data Security" icon={<FiLock className="w-5 h-5" />}>
            <p>
              Timely Health takes reasonable technical and organizational measures designed to protect
              information against unauthorized access, alteration, disclosure, loss, misuse, or destruction.
            </p>
            <p className="font-semibold text-slate-700">Security measures may include:</p>
            <ChipGrid
              color="blue"
              items={[
                { label: "Encryption during transmission", icon: <FiLock /> },
                { label: "Authentication mechanisms", icon: <FiUser /> },
                { label: "Access controls", icon: <FiEye /> },
                { label: "Role-based access where applicable", icon: <FiUsers /> },
                { label: "Secure server infrastructure", icon: <FiServer /> },
                { label: "Monitoring and logging", icon: <FiActivity /> },
                { label: "Security procedures and access restrictions", icon: <FiShield /> },
              ]}
            />
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-amber-700 text-[11px]">
                <strong>Important:</strong> No internet-based service or electronic storage system can
                guarantee absolute security. You are also responsible for maintaining the confidentiality
                of your account credentials and for using a secure device.
              </p>
            </div>
          </Section>

          {/* ============ SECTION 8 ============ */}
          <Section id="s8" num={8} title="Data Retention" icon={<FiDatabase className="w-5 h-5" />}>
            <p>
              We retain personal information only for as long as reasonably necessary for the purposes
              described in this Privacy Policy, including:
            </p>
            <Bullets
              items={[
                "Providing requested services.",
                "Maintaining your account.",
                "Maintaining healthcare and service records.",
                "Maintaining transaction records.",
                "Customer support.",
                "Security and fraud prevention.",
                "Legal, regulatory, accounting, or reporting requirements.",
                "Resolving disputes.",
                "Enforcing agreements.",
              ]}
            />
            <p className="text-[11px] text-slate-500">
              When information is no longer required, we may securely delete, anonymize, or otherwise
              dispose of it in accordance with applicable law and our data retention practices. Certain
              healthcare, transaction, or legal records may need to be retained for a longer period where
              required by applicable law or legitimate regulatory requirements.
            </p>
          </Section>

          {/* ============ SECTION 9 ============ */}
          <Section id="s9" num={9} title="Account Deletion and Data Deletion" icon={<FiUserX className="w-5 h-5" />}>
            <p>
              You may request deletion of your Timely Health account and associated personal information.
            </p>
            <p>
              You may submit a deletion request through the account deletion facility provided within the
              App, where available, or by contacting us using the contact details provided in this Privacy
              Policy.
            </p>
            <p>
              When we receive a valid deletion request, we will process it in accordance with applicable
              law and our data retention requirements.
            </p>

            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <h4 className="font-bold text-slate-800 text-xs mb-2">
                Some information may need to be retained where required by law or reasonably necessary for:
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Legal compliance",
                  "Healthcare record requirements",
                  "Financial or transaction records",
                  "Fraud prevention",
                  "Security",
                  "Dispute resolution",
                  "Regulatory requirements",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                    <span className="text-[11px] text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Deletion of your account may also result in the loss of access to certain services, bookings,
              reports, or other account-related information.
            </p>
          </Section>

          {/* ============ SECTION 10 ============ */}
          <Section id="s10" num={10} title="Your Privacy Rights and Choices" icon={<FiSettings className="w-5 h-5" />}>
            <p>Depending on applicable law, you may have rights to:</p>
            <ChipGrid
              color="indigo"
              items={[
                { label: "Request access to your personal information", icon: <FiEye /> },
                { label: "Request correction of inaccurate information", icon: <FiRefreshCw /> },
                { label: "Request deletion of information", icon: <FaTrashAlt /> },
                { label: "Request information about how your information is processed", icon: <FiInfo /> },
                { label: "Withdraw consent where consent is the applicable legal basis", icon: <FiUserX /> },
                { label: "Manage certain device permissions", icon: <FiSettings /> },
                { label: "Raise a privacy-related complaint or concern", icon: <FiAlertTriangle /> },
              ]}
            />
            <p className="text-[11px] text-slate-500">
              Some requests may be subject to applicable legal, regulatory, security, or record-retention
              requirements. You can contact us using the details provided below to exercise applicable
              privacy rights.
            </p>
          </Section>

          {/* ============ SECTION 11 ============ */}
          <Section id="s11" num={11} title="Children's Privacy" icon={<FiUser className="w-5 h-5" />}>
            <p>
              The Timely Health App is not intended to knowingly collect personal information from children
              in circumstances where such collection is prohibited by applicable law.
            </p>
            <p>
              Where healthcare services are provided to minors through a parent, guardian, or authorized
              adult, information may be processed as necessary to provide the requested service and comply
              with applicable law.
            </p>
            <p className="text-[11px] text-slate-500">
              If you believe that information belonging to a child has been collected improperly, please
              contact us so that we can review and take appropriate action.
            </p>
          </Section>

          {/* ============ SECTION 12 ============ */}
          <Section id="s12" num={12} title="Third-Party Services and Links" icon={<FiLink className="w-5 h-5" />}>
            <p>
              The App may integrate with or use third-party services, APIs, SDKs, websites, or platforms.
              These may include services relating to:
            </p>
            <ChipGrid
              color="gray"
              items={[
                "Payments",
                "Maps",
                "Authentication",
                "Notifications",
                "SMS/OTP",
                "Analytics",
                "Crash reporting",
                "Cloud infrastructure",
                "Healthcare service providers",
              ]}
            />
            <p>
              Third-party services may have their own privacy policies and terms. Timely Health is not
              responsible for the independent privacy practices of third-party services that operate
              outside our control.
            </p>
            <p className="text-[11px] text-slate-500">
              We encourage you to review the applicable privacy policies before using third-party services.
            </p>
          </Section>

          {/* ============ SECTION 13 ============ */}
          <Section id="s13" num={13} title="International Data Processing" icon={<FiGlobe className="w-5 h-5" />}>
            <p>
              Depending on the technology and service providers used by Timely Health, information may be
              processed or stored on servers located in India or other jurisdictions.
            </p>
            <p>
              Where information is transferred or processed outside your location, we will take reasonable
              steps to ensure that such processing is conducted in accordance with applicable legal
              requirements and appropriate security measures.
            </p>
          </Section>

          {/* ============ SECTION 14 ============ */}
          <Section id="s14" num={14} title="Changes to This Privacy Policy" icon={<FiRefreshCw className="w-5 h-5" />}>
            <p>We may update this Privacy Policy from time to time to reflect:</p>
            <Bullets
              items={[
                "Changes to our services.",
                "Changes to the App.",
                "Changes to technology.",
                "Changes to our data practices.",
                "Changes in applicable laws or regulations.",
              ]}
            />
            <p>
              When we make material changes, we may provide notice through the App, website, or other
              appropriate means. The <strong>Last Updated</strong> date at the beginning of this Privacy
              Policy indicates when the policy was most recently updated.
            </p>
          </Section>

          {/* ============ SECTION 15 ============ */}
          <Section id="s15" num={15} title="Contact Us" icon={<FiMail className="w-5 h-5" />}>
            <p>
              If you have questions, requests, concerns, or complaints regarding this Privacy Policy or the
              handling of your personal information, please contact us.
            </p>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <h4 className="font-bold text-blue-800 text-sm mb-3">
                Timely Health Tech Pvt. Ltd.
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                    <FiGlobe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Website</div>
                    <a
                      href="https://timelyhealth.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      https://timelyhealth.in
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                    <FiMail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Email</div>
                    <span className="text-xs text-slate-700">hello@timelyhealth.com</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
                    <FiGlobe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Registered Office</div>
                    <span className="text-xs text-slate-700">Falt No: 301, 3rd Floor, Sri Sai Balaji Avenue, H. No: 1-98/9/25/p, Opp Style on Studio, VIP Hills, near Bank of Baroda, Arunodaya Colony, Sri Sai Nagar, Madhapur, Hyderabad, Telangana 500081</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center flex-shrink-0">
                    <FiUser className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">
                      Privacy / Grievance Contact
                    </div>
                    <span className="text-xs text-slate-700">+91 9010481048</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-slate-600">
                For account deletion or privacy-related requests, please mention{" "}
                <strong>"Privacy Request"</strong> or{" "}
                <strong>"Account/Data Deletion Request"</strong> in the subject of your communication.
              </p>
            </div>
          </Section>

          {/* ============ SECTION 16 ============ */}
          <Section id="s16" num={16} title="Acknowledgement" icon={<FiCheckCircle className="w-5 h-5" />}>
            <p>
              By using the Timely Health App, you acknowledge that you have read and understood this
              Privacy Policy.
            </p>
            <p>
              Where applicable law requires consent for specific processing activities, Timely Health will
              obtain the required consent through appropriate notices, permissions, or consent mechanisms.
            </p>
          </Section>
        </div>

        {/* ===================== FOOTER ===================== */}
        <div className="emp-dash__card mt-6 p-4 md:p-5 text-center">
          <p className="text-xs text-slate-500">
            © 2026 Timely Health Tech Pvt. Ltd. All rights reserved.
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            This Privacy Policy was last updated on 08 October 2026.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;