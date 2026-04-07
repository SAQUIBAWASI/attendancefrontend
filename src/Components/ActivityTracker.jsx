import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

const ActivityTracker = () => {
  const location = useLocation();
  const interceptorsSetup = useRef(false);

  const getUserDetails = () => {
    let userRole = "employee";
    let userId = localStorage.getItem("employeeId");
    let userName = localStorage.getItem("employeeName") || localStorage.getItem("name");
    let userEmail = localStorage.getItem("employeeEmail") || localStorage.getItem("email");

    if (localStorage.getItem("adminId") || localStorage.getItem("adminToken")) {
      userRole = "admin";
      userId = localStorage.getItem("adminId") || "admin";
      userName = localStorage.getItem("adminName") || "Admin";
      userEmail = localStorage.getItem("adminEmail") || "admin@system.com";
    }

    // Adjust fallback
    if (!userId) return null;

    return { userId, userName, userEmail, userRole };
  };

  const logActivity = async (action, actionDetails) => {
    const user = getUserDetails();
    if (!user) return; // Not logged in

    try {
      await fetch(`${API_BASE_URL || 'https://api.timelyhealth.in'}/user-activity/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...user,
          action,
          actionDetails
        })
      });
    } catch (error) {
      console.warn("Failed to log activity:", error);
    }
  };

  // Track page visits
  useEffect(() => {
    if (location.pathname !== "/login" && location.pathname !== "/admin-login" && location.pathname !== "/") {
      logActivity("page_visit", `Visited ${location.pathname}`);
    }
  }, [location.pathname]);

  // Global listeners for edits and downloads
  useEffect(() => {
    if (interceptorsSetup.current) return;
    interceptorsSetup.current = true;

    // 1. Intercept Fetch for Data Edits
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
      const options = args[1] || {};
      
      if (options && options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase())) {
        const urlStr = url || "";
        if (!urlStr.includes('/user-activity/log') && !urlStr.includes('/login') && !urlStr.includes('/logout')) {
          logActivity("data_edit", `Modified data via ${options.method.toUpperCase()} request to ${urlStr.split('?')[0].split('/').slice(-2).join('/')}`);
        }
      }
      return originalFetch.apply(this, args);
    };

    // 2. Intercept Axios for Data Edits
    axios.interceptors.request.use((config) => {
      if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
        const urlStr = config.url || "";
        if (!urlStr.includes('/user-activity/log') && !urlStr.includes('/login') && !urlStr.includes('/logout')) {
          logActivity("data_edit", `Modified data via ${config.method.toUpperCase()} request to ${urlStr.split('?')[0].split('/').slice(-2).join('/')}`);
        }
      }
      return config;
    }, (error) => Promise.reject(error));

    // 3. Track Downloads via Clicks
    const handleGlobalClick = (e) => {
      const target = e.target.closest('button, a');
      if (target) {
        const text = (target.innerText || target.getAttribute('aria-label') || '').toLowerCase();
        const className = (target.className || '').toString().toLowerCase();
        const isDownload = target.hasAttribute('download') || text.includes('download') || text.includes('export') || className.includes('download') || className.includes('export');
        
        if (isDownload) {
          logActivity("file_download", `Downloaded/Exported file - ${text.substring(0, 30) || 'Document'}`);
        }
      }
    };

    document.addEventListener("click", handleGlobalClick);

    return () => {
      document.removeEventListener("click", handleGlobalClick);
      // We don't restore fetch to avoid conflicts if remounted, but in React root it generally runs once
    };
  }, []);

  return null;
};

export default ActivityTracker;
