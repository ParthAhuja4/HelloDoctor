import { useState, useCallback, useEffect } from "react";
import { AppContext } from "./allContext";
import axios from "axios";
import { toast } from "react-toastify";

const AppContextProvider = ({ children }) => {
  const currencySymbol = "₹";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [userData, setUserData] = useState(false);

  const getDoctorsData = useCallback(async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/v1/doctor/list", {
        headers: { token },
      });
      if (data.success) {
        setDoctors(data.data);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }, [backendUrl, token]);

  const loadUserProfileData = useCallback(async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/v1/user/get-profile",
        {
          headers: { token },
        }
      );

      if (data.success) {
        const safeUserData = {
          ...data.data,
          address: data.data.address || { line1: "", line2: "" },
          gender: data.data.gender || "",
          dob: data.data.dob || "",
        };
        setUserData(safeUserData);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }, [backendUrl, token]);

  useEffect(() => {
    const loadDr = async () => {
      await getDoctorsData();
    };
    loadDr();
  }, [getDoctorsData]);

  useEffect(() => {
    const loadProfile = async () => {
      if (token) {
        await loadUserProfileData();
      }
    };
    loadProfile();
  }, [loadUserProfileData, token]);

  const value = {
    doctors,
    currencySymbol,
    getDoctorsData,
    token,
    setToken,
    backendUrl,
    loadUserProfileData,
    userData,
    setUserData,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
