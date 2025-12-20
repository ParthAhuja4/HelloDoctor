import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="px-6 md:px-10 lg:px-20">
      <div
        className="
          grid gap-12 my-16 text-sm
          grid-cols-1
          lg:grid-cols-[2fr_1fr_1fr]
        "
      >
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <img
            className="w-32 sm:w-36 md:w-40 object-contain"
            src={assets.logo}
            alt="Logo"
          />

          <p className="text-gray-600 leading-6 sm:max-w-[85%]">
            <strong className="font-semibold">
              Hello Doctor - Effortless Healthcare Scheduling
            </strong>
            <br />
            Patients can instantly book appointments with trusted doctors—from
            routine check-ups to specialist care. Smart reminders keep schedules
            on track, while real-time updates ensure seamless coordination.
          </p>
        </div>

        <div>
          <p className="text-lg font-semibold mb-4 text-gray-900">COMPANY</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li
              className="hover:text-gray-900 cursor-pointer"
              onClick={() => {
                scrollTo(0, 0);
              }}
            >
              <Link to="/">Home</Link>
            </li>
            <li
              className="hover:text-gray-900 cursor-pointer"
              onClick={() => {
                scrollTo(0, 0);
              }}
            >
              <Link to="/about">About Us</Link>
            </li>
            <li
              className="hover:text-gray-900 cursor-pointer"
              onClick={() => {
                scrollTo(0, 0);
              }}
            >
              <Link to="/contact">Contact Us</Link>
            </li>
            <li
              className="hover:text-gray-900 cursor-pointer"
              onClick={() => {
                scrollTo(0, 0);
              }}
            >
              Privacy Policy
            </li>
          </ul>
        </div>

        <div>
          <p className="text-lg font-semibold mb-4 text-gray-900">
            GET IN TOUCH
          </p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li className="hover:text-gray-900 cursor-pointer">
              +91-90000-90000
            </li>
            <li className="hover:text-gray-900 cursor-pointer">
              customersupport@hellodr.in
            </li>
          </ul>
        </div>
      </div>

      <hr className="border-gray-300" />
      <p className="py-4 text-sm text-center text-gray-600">
        &copy; {new Date().getFullYear()} hellodr.in — All Rights Reserved.
      </p>
    </div>
  );
};

export default Footer;
