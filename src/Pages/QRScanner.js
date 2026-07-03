// src/components/QRScanner.jsx
import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  FaQrcode, 
  FaDownload, 
  FaShare, 
  FaSpinner,
  FaPrint,
  FaBuilding,
  FaTrash,
  FaEdit,
  FaPlus,
  FaTimes,
  FaMapMarkerAlt,
  FaSpinner as FaSpinnerIcon,
  FaEye,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaCamera,
  FaCopy,
  FaExternalLinkAlt
} from 'react-icons/fa';

const QRScanner = () => {
  // ─── FORM STATES ───
  const [formData, setFormData] = useState({
    companyName: '',
    locationName: '',
    address: '',
    latitude: '',
    longitude: '',
    adminName: '',
    expiryTime: 30,
    qrSize: 200
  });

  const [savedLocations, setSavedLocations] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [loading, setLoading] = useState(false);

  // ─── API LOCATIONS STATES ───
  const [apiLocations, setApiLocations] = useState([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [apiLocationError, setApiLocationError] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApiLocation, setSelectedApiLocation] = useState(null);

  // Popup states
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // View QR state
  const [viewingQR, setViewingQR] = useState(null);

  // ─── QR SCANNER STATES ───
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const scannerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const dropdownRef = useRef(null);

  // ─── API BASE URL ───
  const API_URL = 'https://api.timelyhealth.in/api/admin';
  const ATTENDANCE_URL = 'https://www.timelyhealth.in/attendance-by-id';

  // ─── FILTERED LOCATIONS ───
  const filteredLocations = apiLocations.filter(location =>
    location.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.fullAddress?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─── FETCH ALL QRS FROM API ───
  const fetchAllQRs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/getallqrs`);
      const data = await response.json();
      
      if (data.success) {
        const qrs = data.data.map(qr => ({
          id: qr._id,
          companyName: qr.companyName,
          locationName: qr.locationName,
          address: qr.address || '',
          latitude: qr.latitude || '',
          longitude: qr.longitude || '',
          adminName: qr.adminName || '',
          token: qr.token,
          qrData: qr.qrData,
          createdAt: qr.createdAt
        }));
        setSavedLocations(qrs);
        localStorage.setItem('qrLocations', JSON.stringify(qrs));
      } else {
        console.error('Failed to fetch QR codes:', data.message);
      }
    } catch (error) {
      console.error('Error fetching QRs:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─── CREATE QR ───
  const createQR = async (qrData) => {
    try {
      const response = await fetch(`${API_URL}/createqr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(qrData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        const newQR = {
          id: data.data._id,
          companyName: data.data.companyName,
          locationName: data.data.locationName,
          address: data.data.address || '',
          latitude: data.data.latitude || '',
          longitude: data.data.longitude || '',
          adminName: data.data.adminName || '',
          token: data.data.token,
          qrData: data.data.qrData,
          createdAt: data.data.createdAt
        };
        setSavedLocations([newQR, ...savedLocations]);
        localStorage.setItem('qrLocations', JSON.stringify([newQR, ...savedLocations]));
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message || 'Failed to create QR' };
      }
    } catch (error) {
      console.error('Error creating QR:', error);
      return { success: false, message: error.message };
    }
  };

  // ─── UPDATE QR ───
  const updateQR = async (id, qrData) => {
    try {
      const response = await fetch(`${API_URL}/updateqr/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(qrData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        const updated = savedLocations.map(qr => 
          qr.id === id ? {
            id: data.data._id,
            companyName: data.data.companyName,
            locationName: data.data.locationName,
            address: data.data.address || '',
            latitude: data.data.latitude || '',
            longitude: data.data.longitude || '',
            adminName: data.data.adminName || '',
            token: data.data.token,
            qrData: data.data.qrData,
            createdAt: data.data.createdAt
          } : qr
        );
        setSavedLocations(updated);
        localStorage.setItem('qrLocations', JSON.stringify(updated));
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message || 'Failed to update QR' };
      }
    } catch (error) {
      console.error('Error updating QR:', error);
      return { success: false, message: error.message };
    }
  };

  // ─── DELETE QR ───
  const deleteQR = async (id) => {
    try {
      const response = await fetch(`${API_URL}/deleteqr/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        const updated = savedLocations.filter(qr => qr.id !== id);
        setSavedLocations(updated);
        localStorage.setItem('qrLocations', JSON.stringify(updated));
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Failed to delete QR' };
      }
    } catch (error) {
      console.error('Error deleting QR:', error);
      return { success: false, message: error.message };
    }
  };

  // ─── FETCH API LOCATIONS ───
  const fetchApiLocations = async () => {
    setIsLoadingLocations(true);
    setApiLocationError('');
    
    try {
      const response = await fetch('https://api.timelyhealth.in/api/location/alllocation');
      const data = await response.json();

      if (data.locations && Array.isArray(data.locations)) {
        setApiLocations(data.locations);
      } else {
        setApiLocationError('Invalid data format');
        setApiLocations([]);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setApiLocationError('Failed to fetch locations');
      setApiLocations([]);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  // ─── HANDLE API LOCATION SELECT ───
  const handleApiLocationSelect = (location) => {
    setSelectedApiLocation(location);
    
    let companyName = location.name || '';
    let locationName = location.name || '';
    
    if (companyName.includes(',')) {
      const parts = companyName.split(',');
      companyName = parts[0].trim();
      locationName = parts.slice(1).join(',').trim();
    } else if (companyName.includes('.')) {
      const parts = companyName.split('.');
      companyName = parts[0].trim();
      locationName = parts.slice(1).join('.').trim();
    }
    
    if (companyName === locationName) {
      companyName = location.name;
      locationName = 'Main Office';
    }

    setFormData(prev => ({
      ...prev,
      companyName: companyName,
      locationName: locationName || 'Main Office',
      address: location.fullAddress || '',
      latitude: location.latitude ? location.latitude.toString() : '',
      longitude: location.longitude ? location.longitude.toString() : '',
    }));

    setSearchTerm(location.name);
    setShowLocationDropdown(false);
  };

  // ─── GET CURRENT LOCATION ───
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported');
      return;
    }

    setIsGettingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }));

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          if (data && data.display_name) {
            setFormData(prev => ({
              ...prev,
              address: data.display_name
            }));
          }
        } catch (error) {
          console.error('Error fetching address:', error);
        }

        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Location error:', error);
        setLocationError(error.message || 'Failed to get location');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // ─── FORM HANDLERS ───
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowLocationDropdown(true);
    
    if (selectedApiLocation) {
      setSelectedApiLocation(null);
    }
  };

  // ─── HANDLE GENERATE/UPDATE QR ───
  const handleGenerateQR = async () => {
    if (!formData.companyName || !formData.locationName) {
      alert('Please fill in Company Name and Location Name');
      return;
    }

    setIsGenerating(true);
    
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const token = `${formData.companyName.substring(0, 3).toUpperCase()}-${timestamp}-${random}`;

    const qrUrl = `${ATTENDANCE_URL}?token=${token}&company=${encodeURIComponent(formData.companyName)}&location=${encodeURIComponent(formData.locationName)}&lat=${formData.latitude || ''}&lng=${formData.longitude || ''}`;

    const qrData = {
      companyName: formData.companyName,
      locationName: formData.locationName,
      address: formData.address || '',
      latitude: formData.latitude || '',
      longitude: formData.longitude || '',
      adminName: formData.adminName || '',
      expiryTime: formData.expiryTime || 30,
      token: token,
      qrData: qrUrl
    };

    let result;
    if (editingId) {
      result = await updateQR(editingId, qrData);
    } else {
      result = await createQR(qrData);
    }

    setIsGenerating(false);

    if (result.success) {
      alert(editingId ? 'QR updated successfully!' : 'QR generated successfully!');
      resetForm();
      setIsPopupOpen(false);
      setEditingId(null);
      setSelectedApiLocation(null);
      await fetchAllQRs();
    } else {
      alert(result.message || 'Failed to save QR');
    }
  };

  // ─── HANDLE DELETE ───
  const handleDeleteLocation = async (id) => {
    if (window.confirm('Delete this QR code?')) {
      const result = await deleteQR(id);
      if (result.success) {
        alert('QR deleted successfully!');
        await fetchAllQRs();
      } else {
        alert(result.message || 'Failed to delete QR');
      }
    }
  };

  // ─── RESET FORM ───
  const resetForm = () => {
    setFormData({
      companyName: '',
      locationName: '',
      address: '',
      latitude: '',
      longitude: '',
      adminName: '',
      expiryTime: 30,
      qrSize: 200
    });
    setLocationError('');
    setSearchTerm('');
    setSelectedApiLocation(null);
    setShowLocationDropdown(false);
  };

  // ─── HANDLE EDIT ───
  const handleEditLocation = (location) => {
    setFormData({
      companyName: location.companyName || '',
      locationName: location.locationName || '',
      address: location.address || '',
      latitude: location.latitude || '',
      longitude: location.longitude || '',
      adminName: location.adminName || '',
      expiryTime: 30,
      qrSize: 200
    });
    setEditingId(location.id);
    setIsPopupOpen(true);
    fetchApiLocations();
  };

  // ─── HANDLE VIEW QR ───
  const handleViewQR = (location) => {
    setViewingQR(location);
  };

  const closeViewQR = () => {
    setViewingQR(null);
  };

  // ─── OPEN POPUP ───
  const openPopup = () => {
    resetForm();
    setEditingId(null);
    setIsPopupOpen(true);
    fetchApiLocations();
  };

  // ─── CLOSE POPUP ───
  const closePopup = () => {
    setIsPopupOpen(false);
    setEditingId(null);
    resetForm();
    setApiLocations([]);
  };

  // ─── CLOSE DROPDOWN ───
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── LOAD QRS ON MOUNT ───
  useEffect(() => {
    const saved = localStorage.getItem('qrLocations');
    if (saved) {
      try {
        setSavedLocations(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading from localStorage:', e);
      }
    }
    fetchAllQRs();
  }, []);

  // ─── QR SCANNER FUNCTIONS ───
  const openScanner = () => {
    setIsScannerOpen(true);
    setScannedData('');
    setScanError('');
    startScanner();
  };

  const closeScanner = () => {
    setIsScannerOpen(false);
    setIsScanning(false);
    setScannedData('');
    setScanError('');
    if (scannerRef.current) {
      scannerRef.current = null;
    }
  };

  const startScanner = async () => {
    try {
      setIsScanning(true);
      setScanError('');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        scannerRef.current = stream;
        scanQRCode();
      }
    } catch (error) {
      console.error('Camera error:', error);
      setScanError('Unable to access camera. Please allow camera permissions.');
      setIsScanning(false);
    }
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth || 300;
    canvas.height = video.videoHeight || 300;
    
    const scanInterval = setInterval(() => {
      if (!isScannerOpen) {
        clearInterval(scanInterval);
        return;
      }
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Use jsQR library for QR decoding
      if (window.jsQR) {
        const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        
        if (code && code.data) {
          clearInterval(scanInterval);
          setScannedData(code.data);
          setIsScanning(false);
          
          // Stop camera stream
          if (scannerRef.current) {
            scannerRef.current.getTracks().forEach(track => track.stop());
            scannerRef.current = null;
          }
          
          // If scanned data is a URL, open it
          if (code.data.startsWith('http')) {
            setTimeout(() => {
              window.open(code.data, '_blank');
            }, 500);
          }
        }
      }
    }, 200);
  };

  // ─── COPY SCANNED DATA ───
  const copyToClipboard = () => {
    if (scannedData) {
      navigator.clipboard.writeText(scannedData);
      alert('✅ Copied to clipboard!');
    }
  };

  // ─── OPEN SCANNED URL ───
  const openScannedURL = () => {
    if (scannedData && scannedData.startsWith('http')) {
      window.open(scannedData, '_blank');
    }
  };

  // ─── QR DOWNLOAD/PRINT/SHARE FUNCTIONS ───
  const svgToCanvas = (svgElement) => {
    return new Promise((resolve, reject) => {
      try {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const width = svgElement.getAttribute('width') || 300;
        const height = svgElement.getAttribute('height') || 300;
        canvas.width = parseInt(width);
        canvas.height = parseInt(height);
        
        const img = new Image();
        img.onload = function() {
          ctx.drawImage(img, 0, 0);
          resolve(canvas);
        };
        img.onerror = function() {
          reject(new Error('Failed to load SVG'));
        };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
      } catch (error) {
        reject(error);
      }
    });
  };

  const getQRCanvas = async (qrId) => {
    try {
      const svgElement = document.querySelector(`#${qrId}`);
      if (svgElement) {
        return await svgToCanvas(svgElement);
      }
      return null;
    } catch (error) {
      console.error('Error getting QR canvas:', error);
      return null;
    }
  };

  const createQRImage = (companyName, qrCanvas) => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const qrSize = 300;
        const padding = 30;
        const textHeight = 70;
        
        canvas.width = qrSize + padding * 2;
        canvas.height = qrSize + padding * 2 + textHeight;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(companyName, canvas.width / 2, textHeight / 2 + 4);
        
        if (qrCanvas) {
          ctx.drawImage(qrCanvas, padding, textHeight, qrSize, qrSize);
        }
        
        resolve(canvas);
      } catch (error) {
        reject(error);
      }
    });
  };

  const downloadQR = async (companyName, qrId) => {
    try {
      const qrCanvas = await getQRCanvas(qrId);
      if (!qrCanvas) {
        alert('QR code not found.');
        return;
      }

      const finalCanvas = await createQRImage(companyName, qrCanvas);
      const link = document.createElement('a');
      link.download = `qr-${companyName.replace(/\s+/g, '-')}-${Date.now()}.png`;
      link.href = finalCanvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading QR.');
    }
  };

  const printQR = async (companyName, qrId) => {
    try {
      const qrCanvas = await getQRCanvas(qrId);
      if (!qrCanvas) {
        alert('QR code not found.');
        return;
      }

      const finalCanvas = await createQRImage(companyName, qrCanvas);
      const printWindow = window.open('', '_blank', 'width=500,height=600');
      if (!printWindow) {
        alert('Please allow popups');
        return;
      }

      const imageData = finalCanvas.toDataURL('image/png', 1.0);
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR - ${companyName}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: white;
                font-family: Arial, sans-serif;
              }
              .qr-container {
                text-align: center;
                padding: 20px;
              }
              img {
                max-width: 100%;
                height: auto;
                display: block;
                margin: 0 auto;
              }
              @media print {
                body { margin: 0; padding: 20px; }
                img { max-width: 100%; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <img src="${imageData}" alt="QR Code" />
              <button class="no-print" onclick="window.print()" style="margin-top:20px;padding:10px 30px;font-size:16px;cursor:pointer;background:#4f46e5;color:white;border:none;border-radius:8px;">
                🖨️ Print
              </button>
              <button class="no-print" onclick="window.close()" style="margin-top:20px;padding:10px 30px;font-size:16px;cursor:pointer;background:#e2e8f0;color:#333;border:none;border-radius:8px;margin-left:10px;">
                Close
              </button>
            </div>
            <script>
              setTimeout(() => {
                window.print();
              }, 1000);
            <\/script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error('Print error:', error);
      alert('Error printing QR.');
    }
  };

  const shareQR = async (companyName, qrId) => {
    try {
      const qrCanvas = await getQRCanvas(qrId);
      if (!qrCanvas) {
        alert('QR code not found.');
        return;
      }

      const finalCanvas = await createQRImage(companyName, qrCanvas);
      const blob = await new Promise(resolve => finalCanvas.toBlob(resolve, 'image/png'));
      
      if (navigator.share) {
        await navigator.share({
          title: `QR - ${companyName}`,
          files: [new File([blob], `qr-${companyName}.png`, { type: 'image/png' })]
        });
      } else {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob
            })
          ]);
          alert('✅ QR copied to clipboard!');
        } catch (clipboardError) {
          const link = document.createElement('a');
          link.download = `qr-${companyName.replace(/\s+/g, '-')}.png`;
          link.href = finalCanvas.toDataURL('image/png');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          alert('QR downloaded.');
        }
      }
    } catch (error) {
      console.error('Share failed:', error);
      alert('Error sharing QR.');
    }
  };

  // ─── RENDER ───
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/80 to-purple-50/60 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-xl shadow-indigo-500/5 border border-white/60 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                  <FaQrcode className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">QR Code Manager</h3>
                  <p className="text-xs text-gray-500">
                    {loading ? 'Loading...' : `${savedLocations.length} QR codes`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={openScanner}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg shadow-green-500/25 transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-95"
                >
                  <FaCamera className="w-4 h-4" />
                  Scan QR
                </button>
                <button
                  onClick={openPopup}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-95"
                >
                  <FaPlus className="w-4 h-4" />
                  Add QR
                </button>
              </div>
            </div>

            {/* ─── QR CODES LIST ─── */}
            {loading ? (
              <div className="text-center py-16">
                <FaSpinnerIcon className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
                <p className="text-gray-500 mt-4">Loading QR codes...</p>
              </div>
            ) : savedLocations.length === 0 ? (
              <div className="text-center py-16 bg-gray-50/80 rounded-2xl border-2 border-dashed border-gray-200">
                <FaQrcode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No QR Codes Generated Yet</p>
                <p className="text-sm text-gray-400 mt-1">Click "Add QR" to create one</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedLocations.map((loc) => (
                  <div key={loc.id} className="bg-white/90 rounded-2xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex flex-col items-center">
                      <div className="text-center mb-2">
                        <p className="text-sm font-bold text-gray-800 truncate w-full">{loc.companyName}</p>
                        <p className="text-[10px] text-gray-500">{loc.locationName}</p>
                      </div>
                      <div className="relative bg-white rounded-xl p-2 border border-gray-100">
                        <QRCodeSVG 
                          id={`qr-${loc.id}`}
                          value={loc.qrData || JSON.stringify({ company: loc.companyName, location: loc.locationName })}
                          size={120}
                          level="H"
                          includeMargin={false}
                          bgColor="white"
                          fgColor="#1e293b"
                        />
                      </div>
                      {loc.qrData?.startsWith('http') && (
                        <div className="mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[8px] rounded-full">
                          ✅ QR Link
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
                        <button
                          onClick={() => handleViewQR(loc)}
                          className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-500 transition-colors"
                          title="View"
                        >
                          <FaEye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => downloadQR(loc.companyName, `qr-${loc.id}`)}
                          className="p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-500 transition-colors"
                          title="Download"
                        >
                          <FaDownload className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => printQR(loc.companyName, `qr-${loc.id}`)}
                          className="p-1.5 rounded-lg hover:bg-green-100 text-green-500 transition-colors"
                          title="Print"
                        >
                          <FaPrint className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => shareQR(loc.companyName, `qr-${loc.id}`)}
                          className="p-1.5 rounded-lg hover:bg-cyan-100 text-cyan-500 transition-colors"
                          title="Share"
                        >
                          <FaShare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEditLocation(loc)}
                          className="p-1.5 rounded-lg hover:bg-yellow-100 text-yellow-500 transition-colors"
                          title="Edit"
                        >
                          <FaEdit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLocation(loc.id)}
                          className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                          title="Delete"
                        >
                          <FaTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="mt-2 text-[8px] text-gray-400">
                        {loc.createdAt ? new Date(loc.createdAt).toLocaleDateString() : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── ADD/EDIT QR POPUP ─── */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaPlus className="text-indigo-500" />
                {editingId ? 'Edit QR Code' : 'Add New QR Code'}
              </h3>
              <button
                onClick={closePopup}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {/* API Location Search */}
              <div className="mb-4" ref={dropdownRef}>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">
                  🔍 Search Location from Database
                </label>
                <div className="relative">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      onFocus={() => {
                        setShowLocationDropdown(true);
                        if (apiLocations.length === 0) {
                          fetchApiLocations();
                        }
                      }}
                      placeholder="Type to search locations..."
                      className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                    />
                    {isLoadingLocations && (
                      <FaSpinnerIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-500 w-4 h-4 animate-spin" />
                    )}
                    {!isLoadingLocations && apiLocations.length > 0 && (
                      <button
                        onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showLocationDropdown ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  {showLocationDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {isLoadingLocations ? (
                        <div className="p-4 text-center text-gray-500">
                          <FaSpinnerIcon className="w-5 h-5 animate-spin mx-auto mb-2" />
                          Loading locations...
                        </div>
                      ) : apiLocationError ? (
                        <div className="p-4 text-center">
                          <p className="text-red-500 text-sm">{apiLocationError}</p>
                          <button
                            onClick={fetchApiLocations}
                            className="mt-2 text-indigo-500 text-sm font-medium hover:text-indigo-600"
                          >
                            Retry
                          </button>
                        </div>
                      ) : filteredLocations.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          {searchTerm ? 'No locations found' : 'No locations available'}
                        </div>
                      ) : (
                        filteredLocations.map((location) => (
                          <div
                            key={location._id}
                            onClick={() => handleApiLocationSelect(location)}
                            className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-start gap-2">
                              <FaBuilding className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-800">{location.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{location.fullAddress}</p>
                                {location.isActive !== undefined && (
                                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full mt-1 ${location.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {location.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {selectedApiLocation && (
                  <p className="text-[10px] text-green-600 mt-1.5">
                    ✅ Selected: {selectedApiLocation.name}
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 my-4"></div>

              {/* Get Location Button */}
              <div className="mb-4">
                <button
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="w-full py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25 transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGettingLocation ? (
                    <>
                      <FaSpinnerIcon className="w-4 h-4 animate-spin" />
                      Fetching Location...
                    </>
                  ) : (
                    <>
                      <FaMapMarkerAlt className="w-4 h-4" />
                      📍 Get Current Location
                    </>
                  )}
                </button>
                {locationError && (
                  <p className="text-xs text-red-500 mt-1.5 text-center">{locationError}</p>
                )}
                {(formData.latitude || formData.longitude) && (
                  <p className="text-[10px] text-green-600 mt-1 text-center">
                    ✅ Location fetched: {formData.latitude}, {formData.longitude}
                  </p>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1">Company Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="e.g., Timely Health"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Location Name *</label>
                  <input
                    type="text"
                    name="locationName"
                    value={formData.locationName}
                    onChange={handleInputChange}
                    placeholder="e.g., Head Office"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Admin Name</label>
                  <input
                    type="text"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Full address"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Latitude</label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="e.g., 28.6139"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Longitude</label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    placeholder="e.g., 77.2090"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Expiry Time</label>
                  <select
                    name="expiryTime"
                    value={formData.expiryTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="15">15 seconds</option>
                    <option value="30">30 seconds</option>
                    <option value="45">45 seconds</option>
                    <option value="60">60 seconds</option>
                    <option value="120">120 seconds</option>
                    <option value="300">5 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">QR Size</label>
                  <select
                    name="qrSize"
                    value={formData.qrSize}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="150">Small (150px)</option>
                    <option value="200">Medium (200px)</option>
                    <option value="250">Large (250px)</option>
                    <option value="300">XL (300px)</option>
                  </select>
                </div>
              </div>

              {/* QR URL Preview */}
              <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                <p className="text-xs text-indigo-700 font-medium mb-1">🔗 QR Code will open:</p>
                <p className="text-xs text-indigo-600 break-all font-mono">
                  {ATTENDANCE_URL}?token={formData.companyName ? formData.companyName.substring(0, 3).toUpperCase() : 'ABC'}-{Date.now()}-xxxx&company={formData.companyName || 'COMPANY'}&location={formData.locationName || 'LOCATION'}
                </p>
                <p className="text-[10px] text-green-600 mt-2">
                  ✅ Scan karte hi attendance page khulega!
                </p>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={closePopup}
                  className="flex-1 py-3 rounded-xl text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateQR}
                  disabled={isGenerating}
                  className="flex-1 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      {editingId ? 'Updating...' : 'Generating...'}
                    </>
                  ) : (
                    <>
                      <FaQrcode className="w-4 h-4" />
                      {editingId ? 'Update QR Code' : 'Generate QR Code'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── VIEW QR POPUP ─── */}
      {viewingQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{viewingQR.companyName}</h3>
              <button
                onClick={closeViewQR}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-center mb-2">
                <p className="text-sm text-gray-500">{viewingQR.locationName}</p>
              </div>
              <div className="relative bg-white rounded-2xl p-4 border-2 border-gray-100">
                <QRCodeSVG 
                  id={`view-qr-${viewingQR.id}`}
                  value={viewingQR.qrData || JSON.stringify({ company: viewingQR.companyName })}
                  size={220}
                  level="H"
                  includeMargin={false}
                  bgColor="white"
                  fgColor="#1e293b"
                />
              </div>
              {viewingQR.address && (
                <p className="text-xs text-gray-400 mt-3 text-center">{viewingQR.address}</p>
              )}
              {viewingQR.qrData?.startsWith('http') && (
                <div className="mt-3 w-full p-2 bg-indigo-50 rounded-lg border border-indigo-200">
                  <p className="text-[10px] font-medium text-indigo-700 text-center">Opens:</p>
                  <p className="text-[9px] text-indigo-600 break-all text-center font-mono">
                    {viewingQR.qrData}
                  </p>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => downloadQR(viewingQR.companyName, `view-qr-${viewingQR.id}`)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-500 text-white hover:bg-indigo-600 transition-colors flex items-center gap-1.5"
                >
                  <FaDownload className="w-3 h-3" /> Download
                </button>
                <button
                  onClick={() => printQR(viewingQR.companyName, `view-qr-${viewingQR.id}`)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center gap-1.5"
                >
                  <FaPrint className="w-3 h-3" /> Print
                </button>
                <button
                  onClick={() => shareQR(viewingQR.companyName, `view-qr-${viewingQR.id}`)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-white hover:bg-cyan-600 transition-colors flex items-center gap-1.5"
                >
                  <FaShare className="w-3 h-3" /> Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── QR SCANNER MODAL ─── */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaCamera className="text-indigo-500" />
                QR Scanner
              </h3>
              <button
                onClick={closeScanner}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              {/* Camera View */}
              <div className="relative bg-black rounded-xl overflow-hidden aspect-square">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-indigo-500 rounded-lg animate-pulse">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </div>
                  </div>
                )}
                {scanError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <p className="text-white text-sm text-center px-4">{scanError}</p>
                  </div>
                )}
              </div>

              {/* Scanned Data */}
              {scannedData && (
                <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-xs font-medium text-green-700 mb-1">✅ QR Scanned!</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-700 break-all flex-1">{scannedData}</p>
                    <button
                      onClick={copyToClipboard}
                      className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Copy"
                    >
                      <FaCopy className="w-4 h-4" />
                    </button>
                  </div>
                  {scannedData.startsWith('http') && (
                    <button
                      onClick={openScannedURL}
                      className="mt-2 w-full py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <FaExternalLinkAlt className="w-3 h-3" />
                      Open URL
                    </button>
                  )}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={closeScanner}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                >
                  Close
                </button>
                {scannedData && (
                  <button
                    onClick={() => {
                      closeScanner();
                      if (scannedData.startsWith('http')) {
                        window.open(scannedData, '_blank');
                      }
                    }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg shadow-green-500/25 transition-all duration-200"
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default QRScanner;