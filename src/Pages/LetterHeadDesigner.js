import React, { useState, useRef } from 'react';
import {
  Printer,
  Download,
  Eye,
  Edit2,
  Check,
  Building2,
  Mail,
  Phone,
  Globe,
  Upload,
  Trash2,
  Calendar,
  FileText,
  FileDown
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const LetterHeadDesigner = () => {
  const [formData, setFormData] = useState({
    companyName: 'Timely Healthtech Private Limited',
    address:
      'Flat No: 301, H.No: 1-68/22, Plot No. 54 & 55, Sri Sai Balaji Avenue, Arunodaya Colony, Madhapur, Hyderabad, Telangana-500081',
    email: 'timelyglobal.in@gmail.com',
    mobile: '90 1048 1048',
    website: 'www.timelyhealth.in',
    logo: null,
    tagline: 'Connecting Communities...',

    showHeader: true,
    headerFontColor: '#17335c',
    headerFontSize: '20',

    companyNameColor: '#17335c',
    addressColor: '#1a2333',

    showFooter: true,
    footerBgColor: '#12a89d',
    footerFontColor: '#ffffff',

    showBorder: true,
    borderColor: '#1a1a1a',
    borderWidth: '1.5',
    shadow: true,

    showWatermark: true,
    watermarkOpacity: '0.12',

    letterDate: new Date().toISOString().split('T')[0],
    letterSubject: '',
    letterContent: '',
    showLetterMeta: false
  });

  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [activeTab, setActiveTab] = useState('design');
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPrintTip, setShowPrintTip] = useState(false);
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          logo: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData((prev) => ({ ...prev, logo: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowPreview(true);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowPreview(false);
  };

  // Download PDF - Perfect A4 with no extra space
  const handleDownloadPDF = async () => {
    if (!previewRef.current) {
      alert('Please preview the letter head first!');
      return;
    }

    setIsDownloading(true);

    try {
      const element = previewRef.current;

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
        onclone: (clonedDoc) => {
          const clonedEl = clonedDoc.getElementById('letterhead-preview');
          if (clonedEl) {
            clonedEl.style.width = '794px';
            clonedEl.style.maxWidth = '794px';
            clonedEl.style.minHeight = '1123px';
            clonedEl.style.margin = '0';
            clonedEl.style.padding = '0';
            clonedEl.style.boxSizing = 'border-box';
            clonedEl.style.overflow = 'hidden';
            clonedEl.style.transform = 'none';
          }
        }
      });

      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      let top = canvas.height;
      let bottom = 0;
      let left = canvas.width;
      let right = 0;

      const data = imageData.data;
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const index = (y * canvas.width + x) * 4;
          if (data[index] < 250 || data[index + 1] < 250 || data[index + 2] < 250) {
            if (y < top) top = y;
            if (y > bottom) bottom = y;
            if (x < left) left = x;
            if (x > right) right = x;
          }
        }
      }

      const padding = 10;
      top = Math.max(0, top - padding);
      bottom = Math.min(canvas.height, bottom + padding);
      left = Math.max(0, left - padding);
      right = Math.min(canvas.width, right + padding);

      const croppedCanvas = document.createElement('canvas');
      const cropWidth = right - left;
      const cropHeight = bottom - top;
      croppedCanvas.width = cropWidth;
      croppedCanvas.height = cropHeight;
      const cropCtx = croppedCanvas.getContext('2d');
      cropCtx.drawImage(canvas, left, top, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      const imgData = croppedCanvas.toDataURL('image/jpeg', 1.0);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = 210;
      const pdfHeight = 297;

      const imgWidth = croppedCanvas.width;
      const imgHeight = croppedCanvas.height;

      const scaleX = pdfWidth / imgWidth;
      const scaleY = pdfHeight / imgHeight;
      const scale = Math.min(scaleX, scaleY);

      const finalWidth = imgWidth * scale;
      const finalHeight = imgHeight * scale;

      const xOffset = (pdfWidth - finalWidth) / 2;
      const yOffset = (pdfHeight - finalHeight) / 2;

      pdf.addImage(imgData, 'JPEG', xOffset, yOffset, finalWidth, finalHeight);
      pdf.save(`LetterHead_${formData.companyName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Direct browser print — uses the same #letterhead-preview node
  // that's on screen, so print output = preview output.
  // Shows a one-time reminder about the browser's own Margins dropdown,
  // since that setting lives outside CSS and can add whitespace even
  // when @page { margin: 0 } is set correctly.
  const handlePrint = () => {
    setShowPrintTip(true);
    window.print();
  };

  // ---------- Preview Component - Perfect A4 ----------
  const LetterHeadPreview = () => {
    const pageStyles = {
      boxShadow: formData.shadow ? '0 4px 24px rgba(0,0,0,0.12)' : 'none',
      border: formData.showBorder
        ? `${formData.borderWidth}px solid ${formData.borderColor}`
        : 'none',
      background: '#ffffff',
      width: '794px',
      maxWidth: '794px',
      minHeight: '1123px',
      margin: '0',
      padding: '0',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Georgia", "Times New Roman", serif',
      boxSizing: 'border-box'
    };

    return (
      <div style={pageStyles} id="letterhead-preview" ref={previewRef}>
        {/* HEADER */}
        {formData.showHeader && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              padding: '28px 40px 10px 40px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            {formData.logo ? (
              <img
                src={formData.logo}
                alt="Logo"
                style={{ height: '46px', width: 'auto', objectFit: 'contain' }}
                crossOrigin="anonymous"
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke={formData.footerBgColor}
                    strokeWidth="2"
                    strokeDasharray="2 3"
                  />
                  <path
                    d="M7 12.5l3 3 7-7"
                    stroke={formData.footerBgColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <div
                    style={{
                      fontSize: `${formData.headerFontSize}px`,
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                      color: formData.headerFontColor,
                      fontFamily: '"Arial", sans-serif',
                      lineHeight: 1.1
                    }}
                  >
                    {formData.companyName.toUpperCase()}
                  </div>
                  {formData.tagline && (
                    <div
                      style={{
                        fontSize: '10px',
                        color: '#6b7280',
                        fontStyle: 'italic',
                        marginTop: '2px',
                        fontFamily: '"Georgia", serif'
                      }}
                    >
                      {formData.tagline}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* BODY */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            padding: '20px 55px',
            minHeight: '520px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {formData.showWatermark && (
            <svg
              width="220"
              height="220"
              viewBox="0 0 24 24"
              fill="none"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: parseFloat(formData.watermarkOpacity),
                pointerEvents: 'none'
              }}
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke={formData.footerBgColor}
                strokeWidth="1.2"
                strokeDasharray="1.6 2.4"
              />
              <path
                d="M7 12.5l3 3 7-7"
                stroke={formData.footerBgColor}
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}

          {formData.showLetterMeta && (
            <div style={{ position: 'relative', zIndex: 1 }}>
              {formData.letterDate && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: '16px'
                  }}
                >
                  <p style={{ fontSize: '13px', color: '#4a5568', margin: 0 }}>
                    <strong>Date:</strong>{' '}
                    {new Date(formData.letterDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}
              {formData.letterSubject && (
                <p
                  style={{
                    fontSize: '13px',
                    color: '#2d3748',
                    fontWeight: 'bold',
                    marginBottom: '12px'
                  }}
                >
                  Subject: {formData.letterSubject}
                </p>
              )}
              {formData.letterContent && (
                <div
                  style={{
                    fontSize: '13px',
                    color: '#2d3748',
                    lineHeight: '1.8',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {formData.letterContent}
                </div>
              )}
            </div>
          )}
        </div>

        {/* COMPANY BLOCK */}
        <div
          style={{
            textAlign: 'center',
            padding: '0 30px 14px 30px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              fontSize: '16px',
              fontWeight: 800,
              color: formData.companyNameColor,
              fontFamily: '"Arial", sans-serif',
              marginBottom: '4px'
            }}
          >
            {formData.companyName}
          </div>
          <div
            style={{
              fontSize: '10.5px',
              fontWeight: 700,
              color: formData.addressColor,
              fontFamily: '"Arial", sans-serif',
              lineHeight: 1.4
            }}
          >
            {formData.address}
          </div>
        </div>

        {/* FOOTER */}
        {formData.showFooter && (
          <div
            style={{
              background: formData.footerBgColor,
              color: formData.footerFontColor,
              padding: '9px 30px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              fontFamily: '"Arial", sans-serif',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700 }}>
              <Mail size={13} />
              <span>Mail: {formData.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700 }}>
              <Phone size={13} />
              <span>Mobile: {formData.mobile}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700 }}>
              <Globe size={13} />
              <span>{formData.website}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ---------- Form ----------
  const LetterHeadForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-2 border-b border-gray-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('design')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'design'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Design Settings
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'content'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Letter Content
        </button>
      </div>

      {activeTab === 'design' ? (
        <>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Company Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
              {formData.logo && (
                <button
                  type="button"
                  onClick={removeLogo}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            {formData.logo && (
              <div className="mt-2">
                <img
                  src={formData.logo}
                  alt="Logo Preview"
                  className="h-12 w-auto object-contain border rounded-lg p-1"
                />
              </div>
            )}
            {!formData.logo && (
              <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                <Upload size={12} /> No logo uploaded — a placeholder mark will be used
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter company name"
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
              Tagline
            </label>
            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              placeholder="Your company tagline"
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              placeholder="Enter complete address"
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="company@email.com"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                Mobile <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
              Website
            </label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="www.company.com"
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                Header Text Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="headerFontColor"
                  value={formData.headerFontColor}
                  onChange={handleChange}
                  className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  name="headerFontColor"
                  value={formData.headerFontColor}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                Footer Bar Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="footerBgColor"
                  value={formData.footerBgColor}
                  onChange={handleChange}
                  className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  name="footerBgColor"
                  value={formData.footerBgColor}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <input
                type="checkbox"
                name="showHeader"
                checked={formData.showHeader}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Show Header
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <input
                type="checkbox"
                name="showFooter"
                checked={formData.showFooter}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Show Footer Bar
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <input
                type="checkbox"
                name="showBorder"
                checked={formData.showBorder}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Show Page Border
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <input
                type="checkbox"
                name="showWatermark"
                checked={formData.showWatermark}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Show Watermark
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <input
                type="checkbox"
                name="shadow"
                checked={formData.shadow}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Show Shadow
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <input
                type="checkbox"
                name="showLetterMeta"
                checked={formData.showLetterMeta}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Show Date/Subject/Body
            </label>
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
              Letter Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="date"
                name="letterDate"
                value={formData.letterDate}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
              Subject
            </label>
            <input
              type="text"
              name="letterSubject"
              value={formData.letterSubject}
              onChange={handleChange}
              placeholder="Enter letter subject"
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
              Letter Content
            </label>
            <textarea
              name="letterContent"
              value={formData.letterContent}
              onChange={handleChange}
              rows="12"
              placeholder="Write your letter content here..."
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          <p className="text-[11px] text-gray-400">
            Tip: turn on "Show Date/Subject/Body" in Design Settings to render this text on the page.
          </p>
        </>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center gap-2"
        >
          <Eye size={16} />
          Preview Letter Head
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/*
        PRINT CSS — HARDENED

        Two independent sources of left/right whitespace on a printed
        letterhead, and how each is handled below:

        1. STICKY CONTAINING BLOCK BUG
           The right-side preview panel uses Tailwind's `sticky` class.
           `position: sticky` creates a containing block for any
           `position: fixed`/`absolute` descendant, so without
           neutralizing it, the letterhead anchors to that panel
           instead of the real page. Fixed by forcing `.sticky` to
           `position: static !important` during print.

        2. BROWSER "MARGINS" DROPDOWN (outside CSS's control)
           Chrome/Edge's print dialog has its own Margins selector
           (Default / None / Custom / Minimum). When it's on "Default",
           some browser versions add their own page margin on top of
           whatever @page specifies, regardless of `margin: 0 !important`
           in @page. This is a browser UI setting, not a CSS bug — CSS
           can't force it. The fix here is defense in depth: (a) set
           @page margin to 0 so browsers that do respect it print
           edge-to-edge automatically, and (b) surface a one-time
           on-screen tip after Print is clicked telling the user to pick
           "Margins: None" if they still see white borders.

        Additional hardening added below:
        - html/body hard-locked to exact A4 mm size during print so the
          browser can't auto-scale-to-fit and shrink the page inside
          a blank canvas.
        - Scrollbars/overflow suppressed so no extra reserved space
          sneaks in on the print render.
        - print-color-adjust: exact everywhere so the teal footer bar
          and watermark aren't silently stripped to white by the
          browser's print color optimizer.
      */}
      <style>{`
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            overflow: hidden !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Neutralize the sticky panel so it stops being a
             containing block for the fixed/absolute letterhead */
          .sticky {
            position: static !important;
          }

          .print-scale-wrapper {
            transform: none !important;
            width: 210mm !important;
            max-width: 210mm !important;
            position: static !important;
          }

          #letterhead-preview,
          #letterhead-preview * {
            visibility: visible !important;
          }

          #letterhead-preview {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 210mm !important;
            max-width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            box-shadow: none !important;
            transform: none !important;
          }

          /* Anything rendered by the print-tip banner should never print */
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }

          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>

      {/* One-time reminder, shown after the first Print click, about the
          browser's own Margins dropdown. Screen-only — hidden on print
          via .no-print above. */}
      {showPrintTip && (
        <div className="no-print fixed bottom-4 right-4 z-50 max-w-sm bg-amber-50 border border-amber-200 rounded-xl shadow-lg p-4">
          <p className="text-xs font-bold text-amber-800 mb-1">Still seeing white borders in print?</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            In the print dialog, open <strong>More settings → Margins</strong> and choose{' '}
            <strong>None</strong> (not "Default"). This is a browser setting our page CSS can't
            override on every browser.
          </p>
          <button
            onClick={() => setShowPrintTip(false)}
            className="mt-2 text-[11px] font-bold text-amber-700 underline"
          >
            Got it
          </button>
        </div>
      )}

      <main className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Letter Head Designer</h1>
                <p className="text-xs text-gray-500">Create and customize a professional letter head (A4 Size)</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all"
              >
                <Edit2 size={14} />
                Edit Design
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                {isEditing ? (
                  <LetterHeadForm />
                ) : (
                  <div className="text-center py-8">
                    <Check className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-gray-900">Letter Head Ready!</h3>
                    <p className="text-xs text-gray-500 mt-1">Preview is shown on the right side</p>
                    <button
                      onClick={handleEdit}
                      className="mt-4 px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all inline-flex items-center gap-2"
                    >
                      <Edit2 size={14} />
                      Edit Design
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Eye size={16} className="text-blue-600" />
                    Preview (A4 Size)
                  </h3>
                  {!isEditing && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrint}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Print"
                      >
                        <Printer size={18} />
                      </button>
                      <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className={`p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ${
                          isDownloading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title="Download PDF"
                      >
                        <FileDown size={18} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-gray-100 rounded-xl p-4 min-h-[600px] flex items-center justify-center overflow-auto">
                  {showPreview || !isEditing ? (
                    <div className="w-full flex justify-center">
                      <div
                        className="print-scale-wrapper"
                        style={{
                          transform: 'scale(0.85)',
                          transformOrigin: 'top center',
                          width: '794px',
                          maxWidth: '100%'
                        }}
                      >
                        <LetterHeadPreview />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <FileText className="w-16 h-16 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-medium">Fill in the details and click</p>
                      <p className="text-xs">"Preview Letter Head" to see your design</p>
                    </div>
                  )}
                </div>

                {!isEditing && (
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={handlePrint}
                      className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Printer size={16} />
                      Print
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      disabled={isDownloading}
                      className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                        isDownloading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <FileDown size={16} />
                      {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LetterHeadDesigner;