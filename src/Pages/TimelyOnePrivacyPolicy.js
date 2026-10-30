// src/Pages/TimelyOnePrivacyPolicy.jsx
import React from "react";
import TimelyFooter from "./TimelyFooter"; // Apne folder structure ke hisaab se path adjust kar lena

export default function TimelyOnePrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white font-sans">
      
      {/* Main Content Area */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">Privacy Policy</h1>
            <p className="text-gray-500 text-sm">Last updated: 29 October 2026</p>
          </div>

          {/* Divider Line */}
          <hr className="border-gray-300 mb-8" />

          {/* Content Section */}
          <div className="space-y-8 text-[15px] text-gray-800 leading-relaxed">
            
            {/* Intro */}
            <p>
              At <strong>Timely Health Tech Pvt Ltd</strong>, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and protect your data when you use the <strong>Timely ONE App</strong> ("App").
            </p>
            <p>
              By using the App, you agree to the practices described in this Privacy Policy.
            </p>

            {/* 1. Collection of Personal Data */}
            <section>
              <h2 className="text-xl font-semibold text-blue-600 mb-4">1. Collection of Personal Data</h2>
              <p className="mb-3">We collect personal data that you provide to us, or that is generated when you use the App, including when you:</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Sign in to your employee account</li>
                <li>View or update your profile</li>
                <li>Mark attendance (check-in / check-out)</li>
                <li>Apply for leave or compensatory off</li>
                <li>Submit expense claims and upload receipts</li>
                <li>Record field visits</li>
                <li>Raise issues or contact support</li>
                <li>View payslips, letters, holidays, or events</li>
                <li>Enable notifications on your device</li>
              </ul>
              
              <p className="mb-3">The personal data we collect may include:</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Name, employee ID, email address, profile image, department, role, and joining date</li>
                <li>Attendance records and related timestamps</li>
                <li>Your current location (GPS) when you mark attendance or when location is required for a feature</li>
                <li>Photos or images you upload (e.g. attendance verification, expense receipts)</li>
                <li>Expense details, visit details (including client/center name and contact), leave requests, and issue reports</li>
                <li>Device information needed to deliver push notifications (e.g. device token)</li>
                <li>Technical / crash data to improve App stability</li>
                <li>Any other information you choose to provide</li>
              </ul>
              
              <p>
                We do not collect Aadhaar or Driving License through this App unless you are separately asked by your employer through another process.
              </p>
            </section>

            {/* 2. Use of Personal Data */}
            <section>
              <h2 className="text-xl font-semibold text-blue-600 mb-4">2. Use of Personal Data</h2>
              <p className="mb-3">We use your personal data to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide access to the App and its features</li>
                <li>Authenticate your account and keep your session secure</li>
                <li>Display your employee profile and workplace information</li>
                <li>Record and verify attendance using location (and photo, where enabled)</li>
                <li>Process leave, expense, visit, and issue requests</li>
                <li>Show payslips, official letters, holidays, events, and related workplace updates</li>
                <li>Send App notifications (attendance reminders, approvals, announcements, etc.)</li>
                <li>Respond to your support or HR-related requests</li>
                <li>Improve App functionality, performance, and reliability</li>
                <li>Comply with applicable laws and employer HR / audit requirements</li>
              </ul>
            </section>

            {/* 3. Protection of Personal Data */}
            <section>
              <h2 className="text-xl font-semibold text-blue-600 mb-4">3. Protection of Personal Data</h2>
              <p className="mb-3">We take reasonable measures to protect your personal data, including:</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Encryption during transmission (e.g. HTTPS)</li>
                <li>Secure server storage and access controls</li>
                <li>Restricted access to personal data on a need-to-know basis</li>
              </ul>
              <p className="text-sm text-gray-500 italic">
                Note: No method of transmission or storage is 100% secure. We work to protect your data but cannot guarantee absolute security.
              </p>
            </section>

            {/* 4. Sharing of Personal Data */}
            <section>
              <h2 className="text-xl font-semibold text-blue-600 mb-4">4. Sharing of Personal Data</h2>
              <p className="mb-3">We may share your data with:</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Your employer / authorized HR and managers, as needed to run HR processes</li>
                <li>
                  Third-party service providers who help us operate the App, such as:
                  <ul className="list-[circle] pl-5 mt-1 space-y-1 text-gray-600">
                    <li>Cloud hosting / storage providers</li>
                    <li>Push notification and analytics / crash-reporting services (e.g. Firebase)</li>
                    <li>Customer support or related platforms, if used</li>
                  </ul>
                </li>
              </ul>
              <p className="mb-3">We may also share data with law enforcement or government authorities if required by law.</p>
              <p className="font-semibold">We do not sell your personal data.</p>
            </section>

            {/* 5. Location, Camera & Notifications */}
            <section>
              <h2 className="text-xl font-semibold text-blue-600 mb-4">5. Location, Camera & Notifications</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Location:</strong> Used mainly for attendance verification and related workplace features. You can control location permission in your device settings; some features may not work without it.</li>
                <li><strong>Camera / Photos:</strong> Used when you capture or upload images for attendance, expenses, or other App features.</li>
                <li><strong>Notifications:</strong> Used to send work-related alerts. You can disable notifications in device settings.</li>
              </ul>
            </section>

            {/* 6. Your Rights */}
            <section>
              <h2 className="text-xl font-semibold text-blue-600 mb-4">6. Your Rights</h2>
              <p className="mb-3">Subject to applicable law and your employer’s policies, you may:</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Access your personal data available in the App</li>
                <li>Request correction of inaccurate profile information through HR / admin</li>
                <li>Request deletion of your account or related data (may be limited where retention is required for employment, payroll, or legal reasons)</li>
              </ul>
              
              <p>
                Contact us:<br />
                Email: <a href="mailto:info@timelyhealth.in" className="text-blue-600 hover:underline">info@timelyhealth.in</a>
              </p>
              <p className="mt-1">
                Or contact your company HR / admin for employment-related data requests.
              </p>
            </section>

            {/* 7. Data Retention */}
            <section>
              <h2 className="text-xl font-semibold text-blue-600 mb-4">7. Data Retention</h2>
              <p>
                We retain personal data only as long as needed for App operation, employment / HR purposes, legal obligations, and dispute resolution. After that, data may be deleted or anonymized as appropriate.
              </p>
            </section>

            {/* 8. Changes to Privacy Policy */}
            <section>
              <h2 className="text-xl font-semibold text-blue-600 mb-4">8. Changes to Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. For major changes, we will notify you via email or an in-App notice. Continued use of the App after an update means you accept the revised Policy.
              </p>
            </section>

            {/* 9. Company Details */}
            <section className="pt-6 mt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-blue-600 mb-4">9. Company Details</h2>
              <p className="font-semibold text-gray-900">Timely Health Tech Pvt Ltd</p>
              <p>App: Timely ONE</p>
            </section>

          </div>
        </div>
      </div>

      {/* Footer Rendered Here */}
      <TimelyFooter />

    </div>
  );
}