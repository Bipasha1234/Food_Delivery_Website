import { Link, useNavigate } from "react-router-dom";
import img from "../assets/images/logo.png";

const Footer = () => {
  const navigate = useNavigate();

  const handleProtectedRoute = (path) => {
    const token = localStorage.getItem("token");
    if (!token || token.trim() === "" || token === "undefined") {
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  return (
    <footer className="bg-orange-100 p-8 mt-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-52">

        <div className="flex-shrink-0">
          <img
            src={img}
            alt="Logo"
            className="h-20 w-32 object-contain"
          />
        </div>

        <div className="grid grid-cols-2 gap-x-52 gap-y-4 text-gray-700 text-sm flex-grow">
          <div className="flex flex-col space-y-4  ">
             <button
            onClick={() => {
              const token = localStorage.getItem("token");
              if (!token || token.trim() === "" || token === "undefined") {
                navigate("/");
              } else {
                navigate("/delivo-eats");
              }
            }}
            className="hover:text-orange-500 text-left"
          >
            About Us
          </button>
             <button
            onClick={() => {
              const token = localStorage.getItem("token");
              if (!token || token.trim() === "" || token === "undefined") {
                navigate("/all-restaurant");
              } else {
                navigate("/delivo-eats/all-restaurant");
              }
            }}
            className="hover:text-orange-500 text-left"
          >
            Restaurants
          </button>
            <button
              onClick={() => handleProtectedRoute("/delivo-eats/location")}
              className="hover:text-orange-500 text-left"
            >
              Set Location
            </button>
          </div>

          <div className="flex flex-col space-y-4 ">
           <button
            onClick={() => {
              const token = localStorage.getItem("token");
              if (!token || token.trim() === "" || token === "undefined") {
                navigate("/");
              } else {
                navigate("/delivo-eats");
              }
            }}
            className="hover:text-orange-500 text-left"
          >
            Home
          </button>


            <button
              onClick={() => handleProtectedRoute("/delivo-eats/track-order")}
              className="hover:text-orange-500 text-left"
            >
              Track Order
            </button>

            <Link
              to="/delivo-eats/mybag"
              className="hover:text-orange-500 text-left"
            >
              My Bag
            </Link>
          </div>
        </div>

        <div className="text-gray-600 text-xs whitespace-nowrap mt-6 md:mt-0 self-end md:self-center">
          © {new Date().getFullYear()} DelivoEats. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
