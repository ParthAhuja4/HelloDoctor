import { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Doctors = () => {
  const { speciality } = useParams();
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();

  const formattedSpeciality = speciality
    ? speciality.replace(/-/g, " ").replace(/[A-Za-z]/, (c) => c.toUpperCase())
    : "";

  const { doctors } = useContext(AppContext);

  const filterDoc = formattedSpeciality
    ? doctors.filter((doc) => doc.speciality === formattedSpeciality)
    : doctors;

  return (
    <div>
      <p className="text-gray-600">Browse through the doctors specialist.</p>
      <div className="flex flex-col sm:flex-row items-start gap-5 mt-5">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`py-1 px-3 border rounded text-sm  transition-all sm:hidden ${
            showFilter ? "bg-primary text-white" : ""
          }`}
        >
          Filters
        </button>
        <div
          className={`flex-col gap-4 text-sm text-gray-600 ${
            showFilter ? "flex" : "hidden sm:flex"
          }`}
        >
          <p
            onClick={() =>
              formattedSpeciality === "General physician"
                ? navigate("/doctors")
                : navigate("/doctors/general-physician")
            }
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              formattedSpeciality === "General physician"
                ? "bg-[#E2E5FF] text-black "
                : ""
            }`}
          >
            General physician
          </p>
          <p
            onClick={() =>
              formattedSpeciality === "Gynecologist"
                ? navigate("/doctors")
                : navigate("/doctors/gynecologist")
            }
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              formattedSpeciality === "Gynecologist"
                ? "bg-[#E2E5FF] text-black "
                : ""
            }`}
          >
            Gynecologist
          </p>
          <p
            onClick={() =>
              formattedSpeciality === "Dermatologist"
                ? navigate("/doctors")
                : navigate("/doctors/dermatologist")
            }
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              formattedSpeciality === "Dermatologist"
                ? "bg-[#E2E5FF] text-black "
                : ""
            }`}
          >
            Dermatologist
          </p>
          <p
            onClick={() =>
              formattedSpeciality === "Pediatricians"
                ? navigate("/doctors")
                : navigate("/doctors/pediatricians")
            }
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              formattedSpeciality === "Pediatricians"
                ? "bg-[#E2E5FF] text-black "
                : ""
            }`}
          >
            Pediatricians
          </p>
          <p
            onClick={() =>
              formattedSpeciality === "Neurologist"
                ? navigate("/doctors")
                : navigate("/doctors/neurologist")
            }
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              formattedSpeciality === "Neurologist"
                ? "bg-[#E2E5FF] text-black "
                : ""
            }`}
          >
            Neurologist
          </p>
          <p
            onClick={() =>
              formattedSpeciality === "Gastroenterologist"
                ? navigate("/doctors")
                : navigate("/doctors/gastroenterologist")
            }
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              formattedSpeciality === "Gastroenterologist"
                ? "bg-[#E2E5FF] text-black "
                : ""
            }`}
          >
            Gastroenterologist
          </p>
        </div>
        <div className="w-full grid grid-cols-auto gap-4 gap-y-6">
          {filterDoc.map((item, index) => (
            <div
              onClick={() => {
                navigate(`/appointment/${item._id}`);
                scrollTo(0, 0);
              }}
              className="border border-[#C9D8FF] rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2.5 transition-all duration-500"
              key={index}
            >
              <img className="bg-[#EAEFFF]" src={item.image} alt="" />
              <div className="p-4">
                <div
                  className={`flex items-center gap-2 text-sm text-center ${
                    item.available ? "text-green-500" : "text-gray-500"
                  }`}
                >
                  <p
                    className={`w-2 h-2 rounded-full ${
                      item.available ? "bg-green-500" : "bg-gray-500"
                    }`}
                  ></p>
                  <p>{item.available ? "Available" : "Not Available"}</p>
                </div>
                <p className="text-[#262626] text-lg font-medium">
                  {item.name}
                </p>
                <p className="text-[#5C5C5C] text-sm">{item.speciality}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
