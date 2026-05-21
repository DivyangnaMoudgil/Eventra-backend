import axios from "axios";

const API = axios.create({
  baseURL: "https://eventra-backend-pr6v.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

export default API;