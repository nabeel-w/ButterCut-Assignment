import axios from "axios";

// Android emulator: http://10.0.2.2:8000
// iOS simulator: http://localhost:8000
// Real device: http://<your-lan-ip>:8000
export const API_BASE_URL = "http://192.168.31.99:8000";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
});
