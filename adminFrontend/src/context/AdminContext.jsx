import { useState } from "react";
import { AdminContext } from "./allContexts";
import axios from "axios";
import { toast } from "react-toastify";
import { useCallback } from "react";

const AdminContextProvider = ({ children }) => {
  const [aToken, setAToken] = useState(localStorage.getItem("aToken") || "");
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState({});
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const getAllDoctors = useCallback(async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/v1/admin/all-doctors",
        {
          headers: { aToken },
        }
      );
      if (data.success) {
        setDoctors(data.data);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }, [aToken, backendUrl]);

  const getDashData = useCallback(async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/v1/admin/dashboard", {
        headers: { aToken },
      });
      if (data.success) {
        setDashData(data.data);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }, [aToken, backendUrl]);

  const getAllAppointments = useCallback(async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/v1/admin/appointments",
        {
          headers: { aToken },
        }
      );
      if (data.success) {
        setAppointments(data.data);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }, [aToken, backendUrl]);

  const changeAvailability = useCallback(
    async (docId) => {
      try {
        const { data } = await axios.post(
          backendUrl + "/api/v1/admin/change-availability",
          { docId },
          { headers: { aToken } }
        );
        if (data.success) {
          toast.success(data.message);
          await getAllDoctors();
        }
      } catch (error) {
        toast.error(error.response.data.message);
      }
    },
    [aToken, backendUrl, getAllDoctors]
  );

  const cancelAppointment = useCallback(
    async (appointmentId) => {
      try {
        const { data } = await axios.post(
          backendUrl + "/api/v1/admin/cancel-appointment",
          { appointmentId },
          { headers: { aToken } }
        );
        if (data.success) {
          toast.success(data.message);
          await getAllAppointments();
        }
      } catch (error) {
        toast.error(error.response.data.message);
      }
    },
    [aToken, backendUrl, getAllAppointments]
  );

  const value = {
    aToken,
    setAToken,
    backendUrl,
    doctors,
    getAllDoctors,
    changeAvailability,
    getAllAppointments,
    appointments,
    cancelAppointment,
    getDashData,
    setDashData,
    dashData,
  };
  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

export default AdminContextProvider;
