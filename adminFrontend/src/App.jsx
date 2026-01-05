import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import { useContext } from "react";
import { AdminContext, DoctorContext } from "./context/allContexts";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Slidebar";
import Dashboard from "./pages/Admin/Dashboard";
import AllAppointments from "./pages/Admin/AllAppointments";
import AddDoctor from "./pages/Admin/AddDoctor";
import DoctorsList from "./pages/Admin/DoctorsList";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import DoctorAppointments from "./pages/Doctor/DoctorAppointments";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import DoctorProfile from "./pages/Doctor/DoctorProfile";

function App() {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);
  const location = useLocation();

  if (location.pathname === "/") {
    if (aToken) return <Navigate to="/admin-dashboard" replace />;
    if (dToken) return <Navigate to="/doctor-dashboard" replace />;
  }

  if (aToken) {
    return (
      <div className="bg-[#F8F9FD]">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover={false}
          draggable
          limit={2}
        />
        <Navbar />
        <div className="flex items-start">
          <Sidebar />
          <Routes>
            <Route path="/admin-dashboard" element={<Dashboard />} />
            <Route path="/all-appointments" element={<AllAppointments />} />
            <Route path="/add-doctor" element={<AddDoctor />} />
            <Route path="/doctor-list" element={<DoctorsList />} />
            <Route path="*" element={<Navigate to="/admin-dashboard" />} />
          </Routes>
        </div>
      </div>
    );
  } else if (dToken) {
    return (
      <div className="bg-[#F8F9FD]">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover={false}
          draggable
          limit={2}
        />
        <Navbar />
        <div className="flex items-start">
          <Sidebar />
          <Routes>
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route
              path="/doctor-appointments"
              element={<DoctorAppointments />}
            />
            <Route path="/doctor-profile" element={<DoctorProfile />} />
            <Route path="*" element={<Navigate to="/doctor-dashboard" />} />
          </Routes>
        </div>
      </div>
    );
  } else {
    return (
      <>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover={false}
          draggable
          limit={2}
        />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </>
    );
  }
}

export default App;
