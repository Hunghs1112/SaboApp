import axios from "axios";
import CryptoJS from "crypto-js";
import { API_BASE_URL, USER_ID, ACCESS_KEY, ACCESS_SECRET } from "@env"; // Variables from .env

// Generate nonce string
function generateNonceStr(length = 32) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let nonceStr = "";
  for (let i = 0; i < length; i++) {
    nonceStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonceStr;
}

// Generate timestamp
function generateTimestamp() {
  return Math.floor(Date.now() / 1000).toString();
}

// Generate signature
function generateSignature(accessKey, accessSecret, timestamp, nonceStr) {
  const strToSign = accessKey + timestamp + nonceStr + accessSecret;
  return CryptoJS.MD5(strToSign).toString(CryptoJS.enc.Hex).toUpperCase();
}

// Create dynamic headers
function createHeaders() {
  const timestamp = generateTimestamp();
  const nonceStr = generateNonceStr();
  const signature = generateSignature(ACCESS_KEY, ACCESS_SECRET, timestamp, nonceStr);

  return {
    "user-id": USER_ID,
    "access-key": ACCESS_KEY,
    "timestamp": timestamp,
    "nonce-str": nonceStr,
    signature: signature,
    "Content-Type": "application/json",
  };
}

// API: Decrypt OpenUID
export async function decryptOpenUID(offerId, openUid) {
  if (!offerId || !openUid) {
    throw new Error("offerId and openUid are required.");
  }

  try {
    const headers = createHeaders();
    const body = { offerId, openUid };

    // console.log("Headers:", headers);
    // console.log("Payload:", body);

    const response = await axios.post(
      `${API_BASE_URL}/alibaba/product/openuid/decrypt`,
      body,
      { headers }
    );

    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error;
  }
}

// API: Query Products by Image
export async function queryProductsByImage(payload) {
  try {
    const headers = createHeaders();
    // console.log("Headers:", headers);
    // console.log("Payload:", payload);

    const response = await axios.post(
      `${API_BASE_URL}/alibaba/product/image/query`,
      payload,
      { headers }
    );

    // console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error;
  }
}

// API: Get Product Details
export async function getProductDetail(offerId, country = "vi") {
  if (!offerId) {
    throw new Error("offerId is required.");
  }

  try {
    const headers = createHeaders();
    const body = { offerId, country, outMemberId: "" };

    // console.log("Headers:", headers);
    // console.log("Payload:", body);

    const response = await axios.post(
      `${API_BASE_URL}/alibaba/product/detail/get`,
      body,
      { headers }
    );

    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error;
  }
}

export async function searchProducts(
  keyword = "",
  page = 0,
  pageSize = 20,
  sort = '{"price":"desc"}',
  priceStart = "",
  priceEnd = "",
  categoryId = ""
) {
  if (!keyword && !categoryId) {
    throw new Error("Keyword or Category ID is required.");
  }

  try {
    const headers = createHeaders();
    const body = {
      keyword,
      beginPage: page,
      pageSize: pageSize,
      country: "vi",
      filter: "",
      sort,
      outMemberId: "",
      priceStart,
      priceEnd,
      categoryId,
    };

    const response = await axios.post(
      `${API_BASE_URL}/alibaba/product/keywords/query`,
      body,
      { headers }
    );

    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error;
  }
}


// API: Query Seller Offers
export async function querySellerOffers(payload) {
  try {
    const headers = createHeaders();
    // console.log("Headers:", headers);
    // console.log("Payload:", payload);

    const response = await axios.post(
      `${API_BASE_URL}/alibaba/product/query/selleroffer`,
      payload,
      { headers }
    );

    // console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error;
  }
}
