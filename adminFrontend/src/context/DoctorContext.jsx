import { DoctorContext } from "./allContexts";
import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [dToken, setDToken] = useState(localStorage.getItem("dToken") || "");
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);
  const [profileData, setProfileData] = useState(false);

  const getDashData = useCallback(async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/v1/doctor/dashboard",
        {
          headers: { dToken },
        }
      );

      if (data.success) {
        setDashData(data.data.dashData);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }, [backendUrl, dToken]);

  const getAppointments = useCallback(async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/v1/doctor/appointments",
        {
          headers: { dToken },
        }
      );
      if (data.success) {
        setAppointments(data.data.appointments);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }, [backendUrl, dToken]);

  const completeAppointment = useCallback(
    async (appointmentId) => {
      try {
        const { data } = await axios.post(
          backendUrl + "/api/v1/doctor/complete-appointment",
          { appointmentId },
          {
            headers: { dToken },
          }
        );

        if (data.success) {
          toast.success(data.message);
          await getAppointments();
          await getDashData();
        }
      } catch (error) {
        toast.error(error.response.data.message);
      }
    },
    [backendUrl, dToken, getAppointments, getDashData]
  );

  const cancelAppointment = useCallback(
    async (appointmentId) => {
      try {
        const { data } = await axios.post(
          backendUrl + "/api/v1/doctor/cancel-appointment",
          { appointmentId },
          { headers: { dToken } }
        );
        if (data.success) {
          toast.success(data.message);
          await getAppointments();
        }
      } catch (error) {
        toast.error(error.response.data.message);
      }
    },
    [backendUrl, dToken, getAppointments]
  );

  const getProfileData = useCallback(async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/v1/doctor/profile", {
        headers: { dToken },
      });

      if (data.success) {
        setProfileData(data.data.profileData);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }, [backendUrl, dToken]);

  const value = {
    dToken,
    setDToken,
    backendUrl,
    getAppointments,
    appointments,
    setAppointments,
    completeAppointment,
    cancelAppointment,
    getDashData,
    dashData,
    setDashData,
    getProfileData,
    setProfileData,
    profileData,
  };

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
