// services/api.js

import axios from "axios";

// Replace with your actual API endpoints
const BASE_ECZANE_API_URL = "https://aliyapici.dev/eczane/v1.php";
const BASE_CITY_API_URL =
  "https://aliyapici.dev/nobetci-eczane/cityDistrict.php";

// Fetch pharmacies by city and optionally by district
export const fetchPharmacies = async (city, district = "") => {
  try {
    const params = { il: city };
    if (district) {
      params.ilce = district;
    }
    const response = await axios.get(BASE_ECZANE_API_URL, { params });

    if (response.data.status === "success") {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch data");
    }
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Fetch all cities and their districts
export const fetchCitiesAndDistricts = async () => {
  try {
    const response = await axios.get(BASE_CITY_API_URL);

    if (response.data.status === true) {
      return response.data.result;
    } else {
      throw new Error("Failed to fetch cities");
    }
  } catch (error) {
    console.error("City API Error:", error);
    throw error;
  }
};
