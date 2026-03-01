{activeTab === "personal-documents" && (
                    <div className="w-full px-6 py-8">

                        {/* DOCUMENT UPLOAD TABLE */}
                        <div className="w-full bg-white rounded-xl border border-gray-200/70 shadow-sm overflow-hidden mb-8">
                            <table className="w-full text-left hidden md:table">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr className="text-xs font-medium">
                                        <th className="px-6 py-4 w-16 text-center">S.No</th>
                                        <th className="px-6 py-4">Document</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {[
                                        { key: "aadharCard", label: "Aadhar Card" },
                                        { key: "panCard", label: "PAN Card" },
                                        { key: "tenthCertificate", label: "10th Certificate" },
                                        { key: "twelfthCertificate", label: "12th Certificate" },
                                        { key: "graduationCertificate", label: "Graduation Certificate" },
                                        { key: "passportPhoto", label: "Passport Photo" },
                                    ].map((doc, idx) => {
                                        const documentData = personalDocs?.documents?.[doc.key];
                                        const uploaded = documentData?.filePath;
                                        return (
                                            <tr key={doc.key} className="hover:bg-gray-50 transition align-middle">
                                                <td className="px-6 py-4 text-center text-sm">{idx + 1}</td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">{doc.label}</p>
                                                        {documentData?.uploadedAt && (
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                Uploaded on {new Date(documentData.uploadedAt).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-md ${
                                                        uploaded ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"
                                                    }`}>
                                                        {uploaded ? "Uploaded" : "Pending"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <label className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition ${
                                                            uploadingPersonalDoc[doc.key] 
                                                                ? "bg-gray-100 text-gray-400" 
                                                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                        }`}>
                                                            <input type="file" className="hidden" onChange={(e) => handlePersonalDocUpload(doc.key, e.target.files[0])} disabled={uploadingPersonalDoc[doc.key]} />
                                                            {uploaded ? "Update" : "Upload"}
                                                        </label>
                                                        <button onClick={() => uploaded && window.open(`${API_BASE_URL.replace("/api", "")}/${documentData.filePath}`, "_blank")} disabled={!uploaded} className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition ${uploaded ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
                                                            View
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* BANK DETAILS SECTION */}
                        <div className="mt-10 pt-10 border-t border-gray-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Bank Details</h3>
                            </div>
                            
                            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                                    <div>
                                        <h4 className="text-base font-bold text-gray-900">Bank Account Information</h4>
                                        <p className="text-xs text-gray-500 mt-1">{editingBankDetails ? "Update your banking details" : "Your bank account information"}</p>
                                    </div>
                                    <button
                                        onClick={() => setEditingBankDetails(!editingBankDetails)}
                                        className={`text-xs font-bold px-4 py-2 rounded-lg transition duration-300 transform hover:scale-105 ${
                                            editingBankDetails 
                                                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                                                : "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                                        }`}
                                    >
                                        {editingBankDetails ? "✕ Cancel" : "✏ Edit"}
                                    </button>
                                </div>

                                {editingBankDetails ? (
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Bank Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., ICICI Bank, HDFC Bank"
                                                value={bankDetails.bankName}
                                                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Account Number</label>
                                            <input
                                                type="text"
                                                placeholder="Enter account number"
                                                value={bankDetails.accountNumber}
                                                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">IFSC Code</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., ICIC0000001"
                                                value={bankDetails.ifscCode}
                                                onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                                            />
                                        </div>
                                        <button
                                            onClick={handleSaveBankDetails}
                                            disabled={savingBankDetails}
                                            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg text-sm font-bold hover:from-green-600 hover:to-green-700 transition duration-300 transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:scale-100 shadow-lg"
                                        >
                                            {savingBankDetails ? "💾 Saving..." : "✓ Save Bank Details"}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200/50 hover:shadow-md transition-shadow">
                                            <p className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">Bank Name</p>
                                            <p className="text-lg font-bold text-gray-900">{bankDetails.bankName || "—"}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200/50 hover:shadow-md transition-shadow">
                                            <p className="text-xs font-bold text-purple-600 mb-2 uppercase tracking-wide">Account Number</p>
                                            <p className="text-lg font-bold text-gray-900 font-mono tracking-widest">{bankDetails.accountNumber ? "****" + bankDetails.accountNumber.slice(-4) : "—"}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-xl border border-amber-200/50 hover:shadow-md transition-shadow">
                                            <p className="text-xs font-bold text-amber-600 mb-2 uppercase tracking-wide">IFSC Code</p>
                                            <p className="text-lg font-bold text-gray-900 font-mono">{bankDetails.ifscCode || "—"}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* EMERGENCY CONTACTS SECTION */}
                        <div className="mt-10 pt-10 border-t border-gray-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Emergency Contacts</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Emergency Contact 1 */}
                                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                                        <div>
                                            <h4 className="text-base font-bold text-gray-900">Primary Contact</h4>
                                            <p className="text-xs text-gray-500 mt-1">{editingContact1 ? "Update contact information" : "Your primary emergency contact"}</p>
                                        </div>
                                        <button
                                            onClick={() => setEditingContact1(!editingContact1)}
                                            className={`text-xs font-bold px-4 py-2 rounded-lg transition duration-300 transform hover:scale-105 ${
                                                editingContact1 
                                                    ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                                                    : "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                                            }`}
                                        >
                                            {editingContact1 ? "✕ Cancel" : "✏ Edit"}
                                        </button>
                                    </div>

                                    {editingContact1 ? (
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Full Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter full name"
                                                    value={emergencyContact1.name}
                                                    onChange={(e) => setEmergencyContact1({ ...emergencyContact1, name: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    placeholder="Enter phone number"
                                                    value={emergencyContact1.phone}
                                                    onChange={(e) => setEmergencyContact1({ ...emergencyContact1, phone: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Relationship</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., Parent, Spouse, Friend"
                                                    value={emergencyContact1.relationship}
                                                    onChange={(e) => setEmergencyContact1({ ...emergencyContact1, relationship: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition shadow-sm"
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleSaveEmergencyContact(1)}
                                                disabled={savingContact1}
                                                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg text-sm font-bold hover:from-green-600 hover:to-green-700 transition duration-300 transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:scale-100 shadow-lg"
                                            >
                                                {savingContact1 ? "💾 Saving..." : "✓ Save Contact"}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-xl border border-red-200/50 hover:shadow-md transition-shadow">
                                                <p className="text-xs font-bold text-red-600 mb-2 uppercase tracking-wide">Name</p>
                                                <p className="text-lg font-bold text-gray-900">{emergencyContact1.name || "—"}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200/50 hover:shadow-md transition-shadow">
                                                <p className="text-xs font-bold text-orange-600 mb-2 uppercase tracking-wide">Phone</p>
                                                <p className="text-lg font-bold text-gray-900 font-mono">{emergencyContact1.phone || "—"}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-5 rounded-xl border border-pink-200/50 hover:shadow-md transition-shadow">
                                                <p className="text-xs font-bold text-pink-600 mb-2 uppercase tracking-wide">Relationship</p>
                                                <p className="text-lg font-bold text-gray-900">{emergencyContact1.relationship || "—"}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Emergency Contact 2 */}
                                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                                        <div>
                                            <h4 className="text-base font-bold text-gray-900">Secondary Contact</h4>
                                            <p className="text-xs text-gray-500 mt-1">{editingContact2 ? "Update contact information" : "Your secondary emergency contact"}</p>
                                        </div>
                                        <button
                                            onClick={() => setEditingContact2(!editingContact2)}
                                            className={`text-xs font-bold px-4 py-2 rounded-lg transition duration-300 transform hover:scale-105 ${
                                                editingContact2 
                                                    ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                                                    : "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                                            }`}
                                        >
                                            {editingContact2 ? "✕ Cancel" : "✏ Edit"}
                                        </button>
                                    </div>

                                    {editingContact2 ? (
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Full Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter full name"
                                                    value={emergencyContact2.name}
                                                    onChange={(e) => setEmergencyContact2({ ...emergencyContact2, name: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    placeholder="Enter phone number"
                                                    value={emergencyContact2.phone}
                                                    onChange={(e) => setEmergencyContact2({ ...emergencyContact2, phone: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Relationship</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., Parent, Spouse, Friend"
                                                    value={emergencyContact2.relationship}
                                                    onChange={(e) => setEmergencyContact2({ ...emergencyContact2, relationship: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition shadow-sm"
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleSaveEmergencyContact(2)}
                                                disabled={savingContact2}
                                                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg text-sm font-bold hover:from-green-600 hover:to-green-700 transition duration-300 transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:scale-100 shadow-lg"
                                            >
                                                {savingContact2 ? "💾 Saving..." : "✓ Save Contact"}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-xl border border-red-200/50 hover:shadow-md transition-shadow">
                                                <p className="text-xs font-bold text-red-600 mb-2 uppercase tracking-wide">Name</p>
                                                <p className="text-lg font-bold text-gray-900">{emergencyContact2.name || "—"}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200/50 hover:shadow-md transition-shadow">
                                                <p className="text-xs font-bold text-orange-600 mb-2 uppercase tracking-wide">Phone</p>
                                                <p className="text-lg font-bold text-gray-900 font-mono">{emergencyContact2.phone || "—"}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-5 rounded-xl border border-pink-200/50 hover:shadow-md transition-shadow">
                                                <p className="text-xs font-bold text-pink-600 mb-2 uppercase tracking-wide">Relationship</p>
                                                <p className="text-lg font-bold text-gray-900">{emergencyContact2.relationship || "—"}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
