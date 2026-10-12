import React from 'react';
import { FaExternalLinkAlt, FaTable } from 'react-icons/fa';
import './EmployeeDashboard.css';

function Sheets() {
  const sheets = [
    {
      id: 1,
      name: 'Timely_Health_Sales_Field_Daily',
      description: 'Daily sales field tracking',
      url: 'https://docs.google.com/spreadsheets/d/1ue6OfP2yma2WOY2ya0VH763OIeqRVMu5/edit?usp=sharing&ouid=107715888521815339509&rtpof=true&sd=true',
    },
    {
      id: 2,
      name: 'TH DM Appointments',
      description: 'District manager appointments',
      url: 'https://docs.google.com/spreadsheets/d/1meJ0KCz9xxVqgRjIc3Qv-5kw_w4WZQE32BjUuViCW2c/edit?usp=sharing',
    },
    {
      id: 3,
      name: 'Sonali KPI Sheet',
      description: 'Sonali performance metrics',
      url: 'https://docs.google.com/spreadsheets/d/1YT-2NbLNtM0xv1OJ8_UNp8M1mfOQgSLynzGWSv9cgyM/edit?usp=sharing',
    },
    {
      id: 4,
      name: 'Madhukar KPI Sheet',
      description: 'Madhukar performance metrics',
      url: 'https://docs.google.com/spreadsheets/d/1rnu3nwU9q0g8iVMd6UIUVFdUJ6B6uITfIR4YK4GU0Tg/edit?usp=sharing',
    },
  ];

  const handleViewSheet = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Google <span>Sheets</span>
            </h1>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <h1 className="text-base font-bold whitespace-nowrap">
            Google <span className="text-indigo-600">Sheets</span>
          </h1>
        </div>

        {/* Sheets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {sheets.map((sheet) => (
            <div
              key={sheet.id}
              className="emp-dash__card hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
              onClick={() => handleViewSheet(sheet.url)}
            >
              <div className="emp-dash__card-body">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                      <FaTable />
                    </div>
                    <div>
                      <h3 className="emp-dash__card-title text-sm font-semibold mb-1">
                        {sheet.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {sheet.description}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewSheet(sheet.url);
                  }}
                >
                  <FaExternalLinkAlt className="w-4 h-4" />
                  Open Sheet
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Sheets;