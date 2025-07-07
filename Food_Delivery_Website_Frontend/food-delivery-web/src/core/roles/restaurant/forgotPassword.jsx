import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/images/logo.png";

export default function ForgotPassword() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [timeLeft, setTimeLeft] = useState(120);

  const navigate = useNavigate();

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  useEffect(() => {
    let timer;
    if (step === "otp" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const handleOtpChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const updated = [...otp];
      updated[index] = value;
      setOtp(updated);
      const next = document.getElementById(`otp-${index + 1}`);
      if (value && next) next.focus();
    }
  };

  const sendOtp = async () => {
    setLoading(true);
    setError("");
    setSuccessMsg("");

    if (!email.trim()) {
      setError("Please enter your email.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/restaurant/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerEmail1: email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");

      setStep("otp");
      setTimeLeft(120);
      setSuccessMsg("OTP sent. Check your email please.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const otpString = otp.join("");
      const res = await fetch("http://localhost:5000/api/restaurant/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerEmail1: email, otp: otpString }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP verification failed");

      setSuccessMsg("OTP verified successfully!");
      setTimeout(() => {
        navigate("/restaurant/change-password", { state: { email } });
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 ">
      <div className="bg-white shadow-xl rounded p-8 w-full max-w-sm ">
        <div className="text-center">
          <img src={logo} alt="Delivo Eats" className="mx-auto h-20" />
          <h2 className="font-bold text-lg mb-4">Forgot Password</h2>
        
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-[12px] flex items-center justify-center mb-4"
            role="alert"
          >
            <span className="text-base mr-2">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-[12px] flex items-center justify-center"
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

        {step === "email" && (
          <>
            <label className="block text-sm font-normal text-black mb-2">
              Enter your registered email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded"
            />
            <div className="flex justify-center mt-6">
              <button
                onClick={sendOtp}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          </>
        )}

        {step === "otp" && (
          <>
            <label className="block text-sm font-normal text-black mt-2 mb-3 ">Confirm OTP</label>
            <div className="flex justify-between  mt-1">
              {otp.map((val, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength="1"
                  value={val}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  className="w-12 h-12 border border-gray-300 text-center text-lg rounded"
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Enter the 4-digit OTP sent to your email.
            </p>
            <div className="flex justify-end font-semibold text-xs px-1 text-gray-500 mt-4 ">
              <span>Time Remaining: {formatTime(timeLeft)}</span>
            </div>
            <div className="flex justify-center mt-5">
              <button
                onClick={verifyOtp}
                disabled={loading }
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
