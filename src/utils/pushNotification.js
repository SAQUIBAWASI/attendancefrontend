import axios from "axios";

const PUBLIC_VAPID_KEY = "BOFQxoNLt_G7fyVy9hcbd9NAHowswnwky_6B-wVgRm-j8JF0oZRkE4yezPUdMAN3BpMrZ1HGldgH7lTw34W5yBQ";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * 🔔 Subscribe User to Push Notifications
 * @param {string} userId - The user's ID
 * @param {boolean} isManual - If true, show alerts for feedback (Debugging)
 */
export async function subscribeToPushNotifications(userId, isManual = false) {
  if (!("serviceWorker" in navigator)) {
    console.error("No Service Worker support!");
    if (isManual) alert("Error: This browser does not support Service Workers.");
    return;
  }

  if (!("PushManager" in window)) {
    console.error("No Push API Support!");
    if (isManual) alert("Error: This browser does not support Push Notifications.");
    return;
  }

  if (!userId) {
      console.error("User ID is missing!");
      if (isManual) alert("Error: User ID is missing! Cannot subscribe.");
      return;
  }

  if (Notification.permission === 'denied') {
      console.warn("Notifications blocked.");
      if (isManual) alert("Notifications are BLOCKED! Please click the lock icon in the URL bar and 'Reset Permissions' or Allow Notifications.");
      return;
  }

  try {
    if (isManual) alert("Requesting Notification Permission...");

    // 1. Register Service Worker
    const register = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
    });
    console.log("Service Worker Registered...");

    // 2. Wait for Service Worker to be ready
    await navigator.serviceWorker.ready;

    // 3. Subscribe
    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
    });

    console.log("Push Registered...");
    if (isManual) alert("Permission Granted! Subscribing to server...");

    // 4. Send Subscription to Backend
    await axios.post("https://api.timelyhealth.in/api/notifications/subscribe", {
      userId,
      subscription,
    });

    console.log("Push Notification Subscribed Successfully!");
    if (isManual) alert("Success! You are now subscribed to Push Notifications.");

  } catch (err) {
    console.error("Error subscribing to push notifications:", err);
    if (isManual) alert("Error: " + err.message);
  }
}
