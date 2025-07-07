import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import logo from "../../../assets/images/logo.png";

export default function RestaurantRegister() {
  const [step, setStep] = useState("restaurant");

  const [restaurantName, setRestaurantName] = useState("");
  const [city, setCity] = useState("");
  const [fssai, setfssai] = useState("");
  const [category, setCategory] = useState("Fast Food");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setphone] = useState("");
  const [phone2, setPhone2] = useState("");
  const [ownerEmail1, setownerEmail1] = useState("");
  const [password, setPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    setErrorMsg("");
    setSuccessMsg("");
  }, [
    restaurantName,
    city,
    fssai,
    category,
    ownerName,
    phone,
    phone2,
    ownerEmail1,
    password,
  ]);

  const validateRestaurantStep = () => {
    if (!restaurantName || !city || !fssai || !category) {
      setErrorMsg("Please fill out all restaurant details");
      return false;
    }
    return true;
  };

  const validateOwnerStep = () => {
    if (!ownerName || !phone || !ownerEmail1 || !password) {
      setErrorMsg("Please fill out all owner details");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateOwnerStep()) return;

    const payload = {
      restaurantName,
      city,
      fssai,
      category,
      ownerName,
      phone,
      phone2,
      ownerEmail1,
      password,
    };

    try {
      const response = await fetch("http://localhost:5000/api/restaurant/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
    if (response.ok) {
  setSuccessMsg("Registered successfully!");
  setErrorMsg("");

  // Delay form reset and going back to restaurant step
  setTimeout(() => {
    setStep("restaurant");
    setSuccessMsg(""); // Optional: hide after 3s
    setRestaurantName("");
    setCity("");
    setfssai("");
    setCategory("Fast Food");
    setOwnerName("");
    setphone("");
    setPhone2("");
    setownerEmail1("");
    setPassword("");
  }, 3000); // show success message for 3 seconds

      } else {
        setErrorMsg(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMsg("Something went wrong. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="bg-white shadow-xl rounded p-8 w-full max-w-sm space-y-6">
        <div className="text-center">
          <img src={logo} alt="Delivo Eats" className="mx-auto h-20" />
          <h2 className="font-semibold text-lg">Register</h2>

  
          {errorMsg && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-2 text-[12px] flex items-center justify-center"
              role="alert"
            >
              <span className="text-base mr-2">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-2 text-[12px] flex items-center justify-center"
              role="alert"
            >
                  <svg
            className="fill-current w-6 h-6 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" />
          </svg>
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {step === "restaurant" && (
          <div className="space-y-4 text-sm font-normal">
            <p className="font-medium text-sm underline underline-offset-2">Restaurant Details</p>
            <div>
              <label className="block mb-1 text-black">Restaurant Name</label>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full border text-sm px-4 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1 text-black">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border px-4 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1 text-black">License Number</label>
              <input
                type="text"
                value={fssai}
                onChange={(e) => setfssai(e.target.value)}
                className="w-full border px-4 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1 text-black">Choose Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded"
              >
                <option>Fast Food</option>
                <option>Bakery</option>
                <option>Western Cuisine</option>
                <option>Chinese Cuisine</option>
                <option>Korean Cuisine</option>
              </select>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  if (validateRestaurantStep()) setStep("owner");
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition"
              >
                Proceed
              </button>
            </div>
          </div>
        )}

        {step === "owner" && (
          <div className="space-y-4 text-sm font-normal">

              <button
                onClick={() => setStep("restaurant")}
                className="flex items-center text-sm text-gray-700 hover:text-black"
              >
                <FaArrowLeft className="mr-2" /> Back to Restaurant Details
              </button>
            <p className="font-medium underline underline-offset-2">Owner Details</p>
            <div>
              <label className="block mb-1 text-black">Owner Name</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full border px-4 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1 text-black">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setphone(e.target.value)}
                className="w-full border px-4 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1 text-black">Phone Number 2</label>
              <input
                type="text"
                value={phone2}
                onChange={(e) => setPhone2(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1 text-black">Owner Email</label>
              <input
                type="email"
                value={ownerEmail1}
                onChange={(e) => setownerEmail1(e.target.value)}
                className="w-full border px-4 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1 text-black">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border px-4 py-2 rounded"
              />
            </div>

            <div className="flex flex-col items-center space-y-6">
              <p className="text-xs text-gray-600">
                Already have an account?{" "}
                <a href="/restaurant/login" className="text-black underline underline-offset-2">
                  Login Now
                </a>
              </p>
              <button
                onClick={handleRegister}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition"
              >
                Register
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
