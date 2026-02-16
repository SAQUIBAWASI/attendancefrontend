// src/config.js

const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

export const API_BASE_URL = isLocalhost
    ? "http://localhost:5001/api"
    : "https://api.timelyhealth.in/api";

export const API_DOMAIN = isLocalhost
    ? "http://localhost:5001"
    : "https://api.timelyhealth.in";
