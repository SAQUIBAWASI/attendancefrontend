import React, { useState, useRef, useEffect } from 'react';
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
  FileDown,
  RefreshCw,
  Save,
  Plus,
  X,
  Maximize2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from 'axios';
import { API_BASE_URL } from '../config';

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
  const [letterheads, setLetterheads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLetterhead, setSelectedLetterhead] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewLetterhead, setViewLetterhead] = useState(null);

  const fileInputRef = useRef(null);
  const previewRef = useRef(null);
  const previewContainerRef = useRef(null);

  // Show Toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch all letterheads
  const fetchLetterheads = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/letterheads/getallheaders`);
      if (res.data.success) {
        setLetterheads(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching letterheads:', error);
      showToast('Failed to fetch letterheads', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetterheads();
  }, []);

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

  // Preview Letterhead
  const handlePreview = (e) => {
    e.preventDefault();
    if (!formData.logo) {
      showToast('Please upload a logo image first!', 'error');
      return;
    }
    setShowPreview(true);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowPreview(false);
  };

  // Wait for images to load
  const waitForImagesAndFonts = async (container) => {
    const imgs = Array.from(container.querySelectorAll('img'));
    await Promise.all(
      imgs.map((img) => {
        if (img.complete && img.naturalWidth !== 0) {
          return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
        }
        return new Promise((resolve) => {
          img.onload = () => {
            if (img.decode) {
              img.decode().then(resolve).catch(resolve);
            } else {
              resolve();
            }
          };
          img.onerror = resolve;
        });
      })
    );

    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {}
    }

    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );
  };

  // ===== CAPTURE LETTERHEAD AS PNG =====
  const captureLetterheadAsPNG = async () => {
    if (!previewRef.current) {
      showToast('Please preview first!', 'error');
      return null;
    }

    const element = previewRef.current;
    
    // Wait for images and fonts
    await waitForImagesAndFonts(element);

    // Create a clone of the element to capture
    const clone = element.cloneNode(true);
    clone.id = 'capture-clone';
    clone.style.position = 'fixed';
    clone.style.top = '-9999px';
    clone.style.left = '0';
    clone.style.width = '794px';
    clone.style.height = '1123px';
    clone.style.transform = 'none';
    clone.style.margin = '0';
    clone.style.padding = '0';
    clone.style.boxShadow = 'none';
    clone.style.border = 'none';
    clone.style.zIndex = '-9999';
    clone.style.visibility = 'visible';
    clone.style.opacity = '1';
    clone.style.pointerEvents = 'none';
    clone.style.backgroundColor = '#ffffff';
    
    // Append clone to body
    document.body.appendChild(clone);

    // Wait for clone to render
    await new Promise(resolve => setTimeout(resolve, 200));

    let canvas = null;
    try {
      canvas = await html2canvas(clone, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000,
        width: 794,
        height: 1123,
        onclone: (clonedDoc) => {
          const clonedEl = clonedDoc.getElementById('capture-clone');
          if (clonedEl) {
            clonedEl.style.position = 'static';
            clonedEl.style.top = '0';
            clonedEl.style.left = '0';
            clonedEl.style.width = '794px';
            clonedEl.style.height = '1123px';
            clonedEl.style.transform = 'none';
            clonedEl.style.margin = '0';
            clonedEl.style.padding = '0';
            clonedEl.style.backgroundColor = '#ffffff';
          }
          
          clonedDoc.body.style.margin = '0';
          clonedDoc.body.style.padding = '0';
          clonedDoc.body.style.width = '794px';
          clonedDoc.body.style.height = '1123px';
          clonedDoc.body.style.background = '#ffffff';
          clonedDoc.body.style.overflow = 'hidden';
        }
      });
    } catch (error) {
      console.error('html2canvas error:', error);
      showToast('Error capturing letterhead. Please try again.', 'error');
      throw error;
    } finally {
      // Remove the clone
      if (document.body.contains(clone)) {
        document.body.removeChild(clone);
      }
    }

    return canvas;
  };

  // Convert canvas to PNG Blob
  const canvasToPNGBlob = (canvas) => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png', 1.0);
    });
  };

  // ===== BUILD LETTERHEAD PNG BLOB =====
  const buildLetterheadPNGBlob = async () => {
    const canvas = await captureLetterheadAsPNG();
    if (!canvas) return null;

    return await canvasToPNGBlob(canvas);
  };

  // ===== BUILD LETTERHEAD PDF FOR DOWNLOAD (only for download, not storage) =====
  const buildLetterheadPdfForDownload = async () => {
    const canvas = await captureLetterheadAsPNG();
    if (!canvas) return null;

    const imgData = canvas.toDataURL('image/png', 1.0);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = 210;
    const pdfHeight = 297;

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const scaleX = pdfWidth / imgWidth;
    const scaleY = pdfHeight / imgHeight;
    const scale = Math.min(scaleX, scaleY);

    const finalWidth = imgWidth * scale;
    const finalHeight = imgHeight * scale;

    const xOffset = (pdfWidth - finalWidth) / 2;
    const yOffset = (pdfHeight - finalHeight) / 2;

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);

    return pdf;
  };

  // Save Letterhead as PNG
  const handleSaveLetterhead = async () => {
    if (!previewRef.current) {
      showToast('Please preview the letter head first!', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const pngBlob = await buildLetterheadPNGBlob();
      if (!pngBlob) {
        setIsSaving(false);
        return;
      }

      const file = new File([pngBlob], `letterhead-${Date.now()}.png`, { type: 'image/png' });

      const formDataToSend = new FormData();
      formDataToSend.append('letterhead', file);
      formDataToSend.append('name', formData.companyName);

      const isDefault = letterheads.length === 0 ? 'true' : 'false';
      formDataToSend.append('isDefault', isDefault);

      const res = await axios.post(
        `${API_BASE_URL}/letterheads/addheaders`,
        formDataToSend,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (res.data.success) {
        showToast('Letterhead saved successfully!', 'success');
        fetchLetterheads();
        setSelectedLetterhead(res.data.data);
        setShowPreview(true);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving letterhead:', error);
      showToast(error.response?.data?.message || 'Failed to save letterhead', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Update Letterhead as PNG
  const handleUpdateLetterhead = async () => {
    if (!selectedLetterhead) {
      showToast('No letterhead selected to update', 'error');
      return;
    }

    if (!previewRef.current) {
      showToast('Please preview the letter head first!', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const pngBlob = await buildLetterheadPNGBlob();
      if (!pngBlob) {
        setIsSaving(false);
        return;
      }

      const file = new File([pngBlob], `letterhead-${Date.now()}.png`, { type: 'image/png' });

      const formDataToSend = new FormData();
      formDataToSend.append('letterhead', file);
      formDataToSend.append('name', formData.companyName);
      formDataToSend.append('isDefault', selectedLetterhead.isDefault ? 'true' : 'false');

      const res = await axios.put(
        `${API_BASE_URL}/letterheads/updateheader/${selectedLetterhead._id}`,
        formDataToSend,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (res.data.success) {
        showToast('Letterhead updated successfully!', 'success');
        fetchLetterheads();
        setSelectedLetterhead(res.data.data);
        setShowPreview(true);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating letterhead:', error);
      showToast(error.response?.data?.message || 'Failed to update letterhead', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Letterhead
  const handleDeleteLetterhead = async () => {
    if (!deleteId) return;

    setIsSaving(true);
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/letterheads/deleteheader/${deleteId}`
      );

      if (res.data.success) {
        showToast('Letterhead deleted successfully!', 'success');
        fetchLetterheads();
        setShowDeleteModal(false);
        setDeleteId(null);
        if (selectedLetterhead?._id === deleteId) {
          setSelectedLetterhead(null);
          setShowPreview(false);
          setIsEditing(true);
        }
      }
    } catch (error) {
      console.error('Error deleting letterhead:', error);
      showToast(error.response?.data?.message || 'Failed to delete letterhead', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Load Letterhead for editing
  const loadLetterheadForEdit = (letterhead) => {
    setSelectedLetterhead(letterhead);
    setFormData((prev) => ({
      ...prev,
      companyName: letterhead.name || prev.companyName
    }));
    setShowPreview(true);
    setIsEditing(false);
    showToast(
      'Note: only the final PNG is stored, not the original logo/colors — re-upload the logo if needed.',
      'info'
    );
  };

  // View Letterhead in Popup
  const handleViewLetterhead = (letterhead) => {
    setViewLetterhead(letterhead);
    setShowViewModal(true);
  };

  // Download PDF (for user download only, not storage)
  const handleDownloadPDF = async () => {
    if (!previewRef.current) {
      showToast('Please preview the letter head first!', 'error');
      return;
    }

    setIsDownloading(true);

    try {
      const pdf = await buildLetterheadPdfForDownload();
      if (!pdf) {
        setIsDownloading(false);
        return;
      }

      pdf.save(`LetterHead_${formData.companyName.replace(/\s+/g, '_')}.pdf`);
      showToast('PDF downloaded successfully!', 'success');
    } catch (error) {
      console.error('PDF download error:', error);
      showToast('Error generating PDF. Please try again.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    setShowPrintTip(true);
    window.print();
  };

  // Preview Component - With Logo Watermark
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
      margin: '0 auto',
      padding: '0',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Georgia", "Times New Roman", serif',
      boxSizing: 'border-box'
    };

    // Unicode symbols for icons
    const mailIcon = '✉';
    const phoneIcon = '✆';
    const globeIcon = '🌐';

    const footerItemStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '11px',
      fontWeight: 700,
      lineHeight: '20px',
      verticalAlign: 'middle'
    };

    const iconStyle = {
      fontSize: '13px',
      lineHeight: 1,
      display: 'inline-block',
      verticalAlign: 'middle'
    };

    // Watermark style - using logo image
    const watermarkStyle = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      opacity: parseFloat(formData.watermarkOpacity),
      pointerEvents: 'none',
      maxWidth: '300px',
      maxHeight: '300px',
      width: 'auto',
      height: 'auto',
      objectFit: 'contain'
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

        {/* BODY - with Logo Watermark */}
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
          {/* LOGO WATERMARK - Using uploaded logo */}
          {formData.showWatermark && formData.logo && (
            <img
              src={formData.logo}
              alt="Watermark"
              style={watermarkStyle}
              crossOrigin="anonymous"
            />
          )}

          {/* Fallback SVG watermark if no logo */}
          {formData.showWatermark && !formData.logo && (
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
              flexWrap: 'nowrap',
              gap: '10px',
              fontFamily: '"Arial", sans-serif',
              width: '100%',
              boxSizing: 'border-box',
              minHeight: '38px'
            }}
          >
            <div style={footerItemStyle}>
              <span style={iconStyle}>{mailIcon}</span>
              <span>Mail: {formData.email}</span>
            </div>
            <div style={footerItemStyle}>
              <span style={iconStyle}>{phoneIcon}</span>
              <span>Mobile: {formData.mobile}</span>
            </div>
            <div style={footerItemStyle}>
              <span style={iconStyle}>{globeIcon}</span>
              <span>{formData.website}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Form Component
  const LetterHeadForm = () => (
    <form onSubmit={handlePreview} className="space-y-6">
      <div className="flex gap-2 border-b border-gray-200 pb-3 flex-wrap">
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
        <button
          type="button"
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'saved'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Saved Letterheads
        </button>
      </div>

      {activeTab === 'design' && (
        <>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Company Logo <span className="text-red-500">*</span>
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

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
              Watermark Opacity
            </label>
            <input
              type="range"
              name="watermarkOpacity"
              min="0.05"
              max="0.5"
              step="0.01"
              value={formData.watermarkOpacity}
              onChange={handleChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Light</span>
              <span>{parseFloat(formData.watermarkOpacity) * 100}%</span>
              <span>Dark</span>
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
      )}

      {activeTab === 'content' && (
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

      {activeTab === 'saved' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Saved Letterheads ({letterheads.length})
            </h4>
            <button
              type="button"
              onClick={fetchLetterheads}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              <p className="text-xs text-gray-400 mt-2">Loading...</p>
            </div>
          ) : letterheads.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No saved letterheads</p>
              <p className="text-xs text-gray-400">Create and save your first letterhead!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {letterheads.map((item) => (
                <div
                  key={item._id}
                  className={`flex items-center justify-between p-3 border rounded-lg transition-all ${
                    selectedLetterhead?._id === item._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      {item.isDefault && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleViewLetterhead(item)}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => loadLetterheadForEdit(item)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteId(item._id);
                        setShowDeleteModal(true);
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 flex-wrap">
        {selectedLetterhead ? (
          <button
            type="button"
            onClick={handleUpdateLetterhead}
            disabled={isSaving || !showPreview}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? 'Updating...' : 'Update Letterhead'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSaveLetterhead}
            disabled={isSaving || !showPreview}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? 'Saving...' : 'Save Letterhead'}
          </button>
        )}
        <button
          type="submit"
          onClick={handlePreview}
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

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white transition-all transform animate-bounce ${
            toast.type === 'error'
              ? 'bg-red-600'
              : toast.type === 'info'
              ? 'bg-cyan-600'
              : 'bg-emerald-600'
          }`}
        >
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Delete Letterhead</h3>
                <p className="text-xs text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <div className="my-5">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this letterhead? All associated data will be permanently removed.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLetterhead}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {isSaving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewLetterhead && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Maximize2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Letterhead Preview</h3>
                  <p className="text-xs text-gray-500">{viewLetterhead.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewLetterhead(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 flex items-center justify-center bg-gray-50 min-h-[400px]">
              {viewLetterhead.letterheadUrl && (
                <div className="w-full flex justify-center">
                  {viewLetterhead.letterheadUrl.endsWith('.pdf') ? (
                    <iframe
                      src={viewLetterhead.letterheadUrl}
                      className="w-full max-w-3xl h-[600px] rounded-lg border border-gray-200"
                      title="Letterhead PDF"
                    />
                  ) : (
                    <img
                      src={viewLetterhead.letterheadUrl}
                      alt="Letterhead"
                      className="max-w-full max-h-[600px] rounded-lg border border-gray-200 shadow-lg"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Created: {new Date(viewLetterhead.createdAt).toLocaleDateString()}</span>
                {viewLetterhead.isDefault && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">
                    Default
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    window.open(viewLetterhead.letterheadUrl, '_blank');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center gap-2"
                >
                  <Download size={14} />
                  Open
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewLetterhead(null);
                    loadLetterheadForEdit(viewLetterhead);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center gap-2"
                >
                  <Edit2 size={14} />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewLetterhead(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Tip */}
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
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
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
                <LetterHeadForm />
              </div>
            </div>

            <div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Eye size={16} className="text-blue-600" />
                    Preview (A4 Size)
                  </h3>
                  {showPreview && (
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

                <div 
                  className="bg-gray-100 rounded-xl p-4 min-h-[600px] flex items-center justify-center overflow-auto"
                  ref={previewContainerRef}
                >
                  {showPreview ? (
                    <div className="w-full flex justify-center">
                      <div
                        id="print-scale-wrapper"
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
                      <p className="text-sm font-medium">Design your letterhead</p>
                      <p className="text-xs">Fill in the details and click "Preview Letter Head"</p>
                    </div>
                  )}
                </div>

                {showPreview && (
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