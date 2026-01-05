import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/allContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useCallback } from "react";

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);

  const months = [
    " ",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const slotDateFormat = (slotDate) => {
    const [day, month, year] = slotDate.split("_");
    return `${day} ${months[Number(month)]} ${year}`;
  };

  // Getting User Appointments Data Using API
  const getUserAppointments = useCallback(async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/v1/user/appointments",
        {
          headers: { token },
        }
      );
      setAppointments(data.data.appointments.reverse());
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }, [backendUrl, token]);

  // Function to cancel appointment Using API
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/v1/user/cancel-appointment",
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        await getUserAppointments();
        await getDoctorsData();
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    const loadAppointments = async () => {
      if (token) {
        await getUserAppointments();
      }
    };
    loadAppointments();
  }, [getUserAppointments, token]);

  return (
    <div>
      <p className="pb-3 mt-12 text-lg font-medium text-gray-600 border-b">
        My appointments
      </p>
      <div className="">
        {appointments.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b"
          >
            <div>
              <img
                className="w-36 bg-[#EAEFFF]"
                src={item.docData.image}
                alt=""
              />
            </div>
            <div className="flex-1 text-sm text-[#5E5E5E]">
              <p className="text-[#262626] text-base font-semibold">
                {item.docData.name}
              </p>
              <p>{item.docData.speciality}</p>
              <p className="text-[#464646] font-medium mt-1">Address:</p>
              <p className="">{item.docData.address.line1}</p>
              <p className="">{item.docData.address.line2}</p>
              <p className=" mt-1">
                <span className="text-sm text-[#3C3C3C] font-medium">
                  Date & Time:
                </span>{" "}
                {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>
            <div></div>
            <div className="flex flex-col gap-2 justify-end text-sm text-center">
              {item.status !== "cancelled" &&
                item.status !== "confirmed" &&
                !item.isCompleted && (
                  <button className="text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300">
                    Pay Online
                  </button>
                )}

              {item.status !== "cancelled" &&
                item.status === "confirmed" &&
                !item.isCompleted && (
                  <button className="sm:min-w-48 py-2 border rounded text-[#696969]  bg-[#EAEFFF]">
                    Paid
                  </button>
                )}

              {item.isCompleted && (
                <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500">
                  Completed
                </button>
              )}

              {item.status !== "cancelled" && !item.isCompleted && (
                <button
                  onClick={async () => await cancelAppointment(item._id)}
                  className="text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                >
                  Cancel appointment
                </button>
              )}
              {item.status === "cancelled" && !item.isCompleted && (
                <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500">
                  Appointment cancelled
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;
