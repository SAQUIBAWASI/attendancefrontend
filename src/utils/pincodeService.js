// utils/pincodeService.js
import axios from 'axios';

// Indian pin codes database (you can use an API or local data)
const PINCODE_DATA = {
  "110001": { city: "New Delhi", state: "Delhi" },
  "400001": { city: "Mumbai", state: "Maharashtra" },
  "700001": { city: "Kolkata", state: "West Bengal" },
  "600001": { city: "Chennai", state: "Tamil Nadu" },
  "560001": { city: "Bengaluru", state: "Karnataka" },
  "380001": { city: "Ahmedabad", state: "Gujarat" },
  "302001": { city: "Jaipur", state: "Rajasthan" },
  "411001": { city: "Pune", state: "Maharashtra" },
  "800001": { city: "Patna", state: "Bihar" },
  "500001": { city: "Hyderabad", state: "Telangana" },
  "110002": { city: "Delhi", state: "Delhi" },
  "110003": { city: "Delhi", state: "Delhi" },
  "110004": { city: "Delhi", state: "Delhi" },
  "110005": { city: "Delhi", state: "Delhi" },
  "110006": { city: "Delhi", state: "Delhi" },
  // Add more pin codes as needed
};

// Function to get city and state from pin code
export const getCityStateFromPincode = async (pincode) => {
  try {
    // First check local data
    if (PINCODE_DATA[pincode]) {
      return PINCODE_DATA[pincode];
    }
    
    // If not found in local data, use an external API
    try {
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
      
      if (response.data && response.data[0] && response.data[0].Status === "Success") {
        const postOffice = response.data[0].PostOffice[0];
        return {
          city: postOffice.District || postOffice.Name,
          state: postOffice.State,
          country: "India"
        };
      }
    } catch (apiError) {
      console.warn("External API failed, using local data");
    }
    
    // Return null if not found
    return null;
  } catch (error) {
    console.error("Error fetching pincode data:", error);
    return null;
  }
};

// Utility to format address
export const formatFullAddress = (addressData) => {
  const { addressLine1, addressLine2, city, state, pinCode, country } = addressData;
  let address = addressLine1 || '';
  if (addressLine2) address += `, ${addressLine2}`;
  if (city) address += `, ${city}`;
  if (state) address += `, ${state}`;
  if (pinCode) address += ` - ${pinCode}`;
  if (country) address += `, ${country}`;
  return address;
};