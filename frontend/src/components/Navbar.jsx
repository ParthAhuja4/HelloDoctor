import { NavLink, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets.js";
import { useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const [showMenu, setMenu] = useState(false);
  const [token, setToken] = useState(true);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400">
      <img
        onClick={() => {
          navigate("/");
          scrollTo(0, 0);
        }}
        src={assets.logo}
        alt="Logo"
        className="w-32 h-15 scale-200 object-cover object-bottom pl-7 cursor-pointer"
      />

      <ul className="hidden md:flex items-start gap-5 font-medium">
        <li className="flex flex-col items-center">
          <NavLink to="/">
            {({ isActive }) => (
              <>
                HOME
                <hr
                  className={`h-0.5 w-3/5 mt-1 bg-primary transition-all ${
                    isActive ? "block" : "hidden"
                  }`}
                />
              </>
            )}
          </NavLink>
        </li>
        <li className="flex flex-col items-center">
          <NavLink to="/doctors">
            {({ isActive }) => (
              <>
                ALL DOCTORS
                <hr
                  className={`h-0.5 w-3/5 mt-1 bg-primary transition-all ${
                    isActive ? "block" : "hidden"
                  }`}
                />
              </>
            )}
          </NavLink>
        </li>
        <li className="flex flex-col items-center">
          <NavLink to="/about">
            {({ isActive }) => (
              <>
                ABOUT
                <hr
                  className={`h-0.5 w-3/5 mt-1 bg-primary transition-all ${
                    isActive ? "block" : "hidden"
                  }`}
                />
              </>
            )}
          </NavLink>
        </li>
        <li className="flex flex-col items-center">
          <NavLink to="/contact">
            {({ isActive }) => (
              <>
                CONTACT
                <hr
                  className={`h-0.5 w-3/5 mt-1 bg-primary transition-all ${
                    isActive ? "block" : "hidden"
                  }`}
                />
              </>
            )}
          </NavLink>
        </li>
      </ul>
      <div className="flex items-center gap-4">
        {token ? (
          <div
            className="flex items-center gap-2 cursor-pointer relative"
            onClick={() => setOpen(!open)}
          >
            <img
              src={assets.profile_pic}
              alt="Profile Pic"
              className="w-12 rounded-full"
            />
            <img src={assets.dropdown_icon} alt="Dropdown" className="w-2.5" />

            <div
              className={`absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 ${
                open ? "block" : "hidden"
              }`}
            >
              <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
                <p
                  className="hover:text-black cursor-pointer"
                  onClick={() => navigate("/my-profile")}
                >
                  My Profile
                </p>
                <p
                  className="hover:text-black cursor-pointer"
                  onClick={() => navigate("/my-appointments")}
                >
                  My Appointments
                </p>
                <p
                  className="hover:text-black cursor-pointer"
                  onClick={() => setToken(false)}
                >
                  Logout
                </p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              navigate("/login");
            }}
            className="bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block cursor-pointer"
          >
            Create Account
          </button>
        )}
        <img
          src={assets.menu_icon}
          alt="menu"
          className="w-6 md:hidden"
          onClick={() => {
            setMenu(true);
          }}
        />
        <div
          className={`md:hidden ${
            showMenu ? "fixed w-full" : "h-0 w-0"
          } right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}
        >
          <div className="flex items-center justify-between px-5 py-6">
            <img src={assets.logo} className="w-36" alt="" />
            <img
              onClick={() => setMenu(false)}
              src={assets.cross_icon}
              className="w-7"
              alt=""
            />
          </div>
          <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
            <NavLink onClick={() => setMenu(false)} to="/">
              <p className="px-4 py-2 rounded full inline-block">HOME</p>
            </NavLink>
            <NavLink onClick={() => setMenu(false)} to="/doctors">
              <p className="px-4 py-2 rounded full inline-block">ALL DOCTORS</p>
            </NavLink>
            <NavLink onClick={() => setMenu(false)} to="/about">
              <p className="px-4 py-2 rounded full inline-block">ABOUT</p>
            </NavLink>
            <NavLink onClick={() => setMenu(false)} to="/contact">
              <p className="px-4 py-2 rounded full inline-block">CONTACT</p>
            </NavLink>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
