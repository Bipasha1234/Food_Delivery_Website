import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../../assets/images/logo.png";

export default function RestaurantLogin() {
  const [activeTab, setActiveTab] = useState("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState("input");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(120);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    setErrorMsg("");
  }, [email, password, phone, otp]);

  useEffect(() => {
    if (step === "otp" && timer > 0) {
      const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(countdown);
    }
  }, [step, timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeTab === "email") {
      if (!email.trim() || !password.trim()) {
        setErrorMsg("Please fill all the fields.");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/restaurant/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ownerEmail1: email, password }),
        });

        const data = await response.json();
        if (response.ok) {
          localStorage.setItem("restaurantToken", data.token);
          const restaurantId = data.user?._id || data.user?.id;
          localStorage.setItem("restaurantId", restaurantId);
          navigate(`/restaurant/home/${restaurantId}`);
        } else {
          setErrorMsg(data.message || "Login failed");
        }
      } catch (err) {
        setErrorMsg("Server error. Try again.");
      }
    } else if (activeTab === "phone" && step === "input") {
      if (!phone.trim()) {
        setErrorMsg("Please enter phone number.");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/restaurant/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone1: phone }),
        });

        const data = await response.json();
        if (response.ok) {
          setStep("otp");
          setTimer(120);
        } else {
          setErrorMsg(data.message || "Failed to send OTP");
        }
      } catch (err) {
        setErrorMsg("Server error while sending OTP");
      }
    } else if (step === "otp") {
      try {
        const response = await fetch("http://localhost:5000/api/restaurant/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone1: phone, otp: otp.join("") }),
        });

        const data = await response.json();
        if (response.ok) {
          localStorage.setItem("restaurantToken", data.token);
          const restaurantId = data.user?._id || data.user?.id;
          localStorage.setItem("restaurantId", restaurantId);
          navigate(`/restaurant/home/${restaurantId}`);
        } else {
          setErrorMsg(data.message || "Invalid OTP");
        }
      } catch (err) {
        setErrorMsg("Server error while verifying OTP");
      }
    }
  };

  const handleOtpChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const updatedOtp = [...otp];
      updatedOtp[index] = value;
      setOtp(updatedOtp);
      const next = document.getElementById(`otp-${index + 1}`);
      if (value && next) next.focus();
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="bg-white shadow-xl rounded p-8 w-full max-w-xs space-y-6">
        <div className="text-center">
          <img src={logo} alt="Delivo Eats" className="mx-auto h-20" />
        </div>

        {errorMsg && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-[12px] flex items-center justify-center"
            role="alert"
          >
            <span className="text-xs mr-2">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="bg-white text-black  justify-center items-center border border-gray-200 shadow-md text-sm h-10 w-64 rounded hover:bg-orange-100 transition flex overflow-hidden mb-4">
          <button
            onClick={() => {
              setActiveTab("email");
              setStep("input");
              setErrorMsg("");
            }}
            className={`w-1/2 py-3 transition font-medium ${
              activeTab === "email"
                ? "bg-orange-500 underline text-white"
                : "text-gray-700 opacity-70"
            }`}
          >
            Email
          </button>
          <div className="w-[2px] bg-black" />
          <button
            onClick={() => {
              setActiveTab("phone");
              setStep("input");
              setErrorMsg("");
            }}
            className={`w-1/2 py-3 transition ${
              activeTab === "phone"
                ? "bg-orange-500 underline text-white"
                : "text-gray-800 opacity-70"
            }`}
          >
            Phone Number
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {activeTab === "email" && (
            <div className="space-y-4 text-left text-sm font-normal">
              <div>
                <label className="block mb-1 text-black" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  required
                  aria-invalid={errorMsg ? "true" : "false"}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded text-sm"
            
                />
              </div>
              <div>
                <label className="block mb-1 text-black" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  required
                  aria-invalid={errorMsg ? "true" : "false"}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded text-sm"
           
                />
              </div>
            </div>
          )}

          {activeTab === "phone" && step === "input" && (
            <div className="space-y-2 text-left text-sm font-normal">
              <div>
                <label className="block mb-1 text-black" htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  required
                  aria-invalid={errorMsg ? "true" : "false"}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded mb-3 text-sm"
             
                />
                <p className="text-[10px] text-gray-500 text-center">
                  You will get a 4-digit code for phone number verification.
                </p>
              </div>
            </div>
          )}

          {activeTab === "phone" && step === "otp" && (
            <div className="space-y-2 text-center text-sm font-medium mt-3">
              <label className="text-left block text-black">Confirm OTP</label>
              <div className="flex justify-between gap-2">
                {otp.map((val, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength="1"
                    value={val}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="w-12 h-12 border border-gray-300 rounded text-center text-lg"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    aria-label={`OTP digit ${i + 1}`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-gray-500">Enter OTP sent to your number.</p>
              <div className="flex justify-end font-normal text-xs px-1 text-gray-600">
                <span>Time Remaining: {formatTime(timer)}</span>
              </div>
            </div>
          )}

          {(activeTab === "email" || (activeTab === "phone" && step === "input")) && (
            <div className="text-right text-xs mt-2">
              <Link to="/restaurant/forgot-password" className="text-gray-500 hover:text-black">
                Forgot Password?
              </Link>
            </div>
          )}

          <div className="text-center text-xs text-gray-600 mt-4">
            Don’t have an account?{" "}
            <Link to="/restaurant/register" className="text-black underline underline-offset-2">
              Register
            </Link>
          </div>

          <div className="flex justify-center mt-4">
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition"
            >
              {activeTab === "email" ? "Login" : step === "input" ? "Proceed" : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
