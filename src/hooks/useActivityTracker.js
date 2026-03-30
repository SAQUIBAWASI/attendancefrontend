import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import axios from 'axios';

export const useActivityTracker = () => {
    const location = useLocation();

    useEffect(() => {
        const trackPageVisit = async () => {
            const userRole = localStorage.getItem('userRole');
            
            // Do not track if user is not logged in / role is missing
            if (!userRole) return;

            // Extract user details based on role
            let userId = "";
            let userName = "";
            let userEmail = "";

            if (userRole === "admin") {
                userId = localStorage.getItem("adminId");
                userName = localStorage.getItem("adminName");
                userEmail = localStorage.getItem("adminEmail");
            } else if (userRole === "employee") {
                userId = localStorage.getItem("employeeId");
                userName = localStorage.getItem("employeeName");
                userEmail = localStorage.getItem("employeeEmail");
                
                // Fallback to employeeData JSON if simple items are missing
                if (!userId || !userName) {
                    try {
                        const empData = JSON.parse(localStorage.getItem("employeeData") || "{}");
                        userId = userId || empData.employeeId || empData._id;
                        userName = userName || empData.name || empData.fullName;
                        userEmail = userEmail || empData.email;
                    } catch(e) {}
                }
            } else if (userRole === "client") {
                userId = localStorage.getItem("clientId");
                userName = localStorage.getItem("clientName");
                userEmail = localStorage.getItem("clientEmail");
            }

            if (!userId || !userName || !userEmail) return;

            // Define friendly names for known routes
            const pathName = location.pathname;
            const actionDetails = `Navigated to ${pathName}`;

            try {
                // Log activity
                await axios.post(`${API_BASE_URL}/user-activity/log`, {
                    userId,
                    userName,
                    userEmail,
                    userRole,
                    action: "page_visit",
                    actionDetails,
                    ipAddress: "N/A" // Optional formatting
                });
            } catch (error) {
                // Silently fail if activity tracking fails so it doesn't break UI
                console.error("Failed to log activity", error);
            }
        };

        // Call the tracking function
        trackPageVisit();

    }, [location.pathname]); // Re-run when route pathname changes
};
