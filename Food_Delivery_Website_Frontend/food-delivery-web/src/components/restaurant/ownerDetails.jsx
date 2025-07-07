import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../core/roles/restaurant/header";

export default function OwnerDetails() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ownerName: "",
    phone1: "",
    phone2: "",
    ownerEmail: "",
  });

  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const token = localStorage.getItem("restaurantToken");

  useEffect(() => {
    const fetchOwnerDetails = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/restaurant/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setFormData({
            ownerName: data.ownerName || "",
            phone1: data.phone1 || "",
            phone2: data.phone2 || "",
            ownerEmail: data.ownerEmail || "",
          });
        } else {
          alert(data.message || "Failed to fetch data");
        }
      } catch (err) {
        alert("Server error while fetching owner details");
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerDetails();
  }, [token]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/restaurant/update-me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setSuccessMessage("Profile updated successfully!"); 
      // setTimeout(() => {
      //   setSuccessMessage(""); // hide after 3 seconds
      //   navigate(-1);
      // }, 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert(err.message || "Failed to update profile");
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-black">Loading...</div>;
  }

  return (
    <div className="min-h-screen text-black">
      <Header active="Profile" />

      <div className="max-w-3xl mx-auto px-6 py-12 bg-white rounded shadow mt-20">
        <h2 className="text-lg font-semibold mb-4 text-start">Owner Details</h2>

    
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-sm mb-6 flex justify-center items-center">
               <svg
            className="fill-current w-6 h-6 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" />
          </svg>{successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div>
            <label className="block mb-1 text-sm font-normal">Owner Name</label>
            <input
              type="text"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-4 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-normal">Phone Number</label>
            <input
              type="text"
              name="phone1"
              value={formData.phone1}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-4 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-normal">Phone Number 2</label>
            <input
              type="text"
              name="phone2"
              value={formData.phone2}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-4 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-normal">Owner Email</label>
            <input
              type="email"
              name="ownerEmail"
              value={formData.ownerEmail}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-4 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleCancel}
            className="bg-gray-200 text-black font-medium text-sm h-10 w-32 rounded hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
