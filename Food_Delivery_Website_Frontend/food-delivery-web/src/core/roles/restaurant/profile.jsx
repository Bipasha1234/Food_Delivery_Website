import { useEffect, useRef, useState } from "react";
import { FaCamera, FaLock, FaRegCommentDots, FaSignOutAlt, FaStore, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import img from "../../../assets/images/main.png";
import Header from "../../../core/roles/restaurant/header";

export default function Profile() {
  const navigate = useNavigate();

  const [logoImage, setLogoImage] = useState("https://cdn-icons-png.flaticon.com/512/3135/3135715.png");
  const [coverImage, setCoverImage] = useState(img);
  const [restaurantInfo, setRestaurantInfo] = useState(null);

  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const token = localStorage.getItem("restaurantToken");

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:5000/api/restaurant/profile", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.restaurantName) {
          setRestaurantInfo(data);
          if (data.logoImage) setLogoImage(data.logoImage);
          if (data.coverImage) setCoverImage(data.coverImage);
        }
      })
      .catch(err => {
        console.error("Failed to fetch profile:", err);
      });
  }, [token]);

  const handleLogoChange = async (e) => {
  const file = e.target.files[0];
  if (file) {
    const formData = new FormData();
    formData.append('logoImage', file);

    try {
      const res = await fetch('http://localhost:5000/api/restaurant/update-images', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update logo');
      setLogoImage(data.restaurant.logoImage);
    } catch (err) {
      console.error('Error updating logo:', err);
      alert('Failed to update logo');
    }
  }
};


  const handleCoverChange = async (e) => {
  const file = e.target.files[0];
  if (file) {
    const formData = new FormData();
    formData.append('coverImage', file);

    try {
      const res = await fetch('http://localhost:5000/api/restaurant/update-images', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update cover image');
      setCoverImage(data.restaurant.coverImage);
    } catch (err) {
      console.error('Error updating cover image:', err);
      alert('Failed to update cover image');
    }
  }
};

  const updateImages = async (images) => {
    try {
      const res = await fetch("http://localhost:5000/api/restaurant/update-images", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(images)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to update images");

      console.log("Images updated successfully!");
    } catch (err) {
      console.error("Error updating images:", err);
      alert("Failed to update images");
    }
  };

  return (
    <div className="min-h-screen  text-black">
      <Header active="Profile" />

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <div className="relative">
          <img src={coverImage} alt="Cover" className="w-full h-48 object-cover rounded" />
          <FaCamera
            onClick={() => coverInputRef.current.click()}
            className="absolute bottom-3 right-3 text-black bg-white p-1 rounded-full text-2xl cursor-pointer"
          />
          <input
            type="file"
            accept="image/*"
            ref={coverInputRef}
            onChange={handleCoverChange}
            className="hidden"
          />
          <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-10">
            <div className="relative w-26 h-26">
              <img
                src={logoImage}
                alt="Logo"
                className="w-24 h-24 rounded-full border-4 border-white shadow cursor-pointer"
                onClick={() => logoInputRef.current.click()}
              />
              <FaCamera
                onClick={() => logoInputRef.current.click()}
                className="absolute bottom-1 right-1 text-black bg-white p-1 rounded-full text-2xl cursor-pointer"
              />
              <input
                type="file"
                accept="image/*"
                ref={logoInputRef}
                onChange={handleLogoChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="pt-5 text-center">
          <h2 className="text-sm font-medium">{restaurantInfo?.restaurantName || "Restaurant Name"}</h2>
          <p className="text-xs text-gray-500">{restaurantInfo?.city || "City name"}</p>
        </div>

        <div className="bg-white rounded shadow divide-y">
          <Option icon={<FaUser />} label="Owner Details" onClick={() => navigate("/restaurant/profile/owner-details")} />
          <Option icon={<FaStore />} label="Restaurant Details" onClick={() => navigate("/restaurant/profile/restaurant-details")} />
          <Option icon={<FaLock />} label="Reset Password" onClick={() => navigate("/restaurant/forgot-password")} />
          <Option icon={<FaRegCommentDots />} label="Help Center" onClick={() => navigate("/restaurant/profile/help")} />
        </div>

        <div className="text-center flex items-center justify-center ">
          <button
            onClick={() => {
              localStorage.removeItem("restaurantToken");
              navigate("/restaurant/login");
            }}
            className="bg-red-500 hover:bg-red-600 text-white  font-medium text-sm h-10 w-32 rounded transition flex items-center justify-center gap-1 "
          >
           <FaSignOutAlt />
                     <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Option({ icon, label, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between px-5 py-4 hover:bg-gray-100 cursor-pointer"
    >
      <div className="flex items-center gap-3 text-sm font-normal">
        <span className="text-gray-600">{icon}</span>
        {label}
      </div>
      <span className="text-xl text-gray-400">{">"}</span>
    </div>
  );
}
