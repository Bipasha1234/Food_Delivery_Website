import axios from "axios";
import { useEffect, useState } from "react";
import { CiDiscount1 } from "react-icons/ci";
import { FaTimes } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../core/roles/restaurant/header";

export default function IndividualMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [menuData, setMenuData] = useState({
    name: "",
    type: "",
    shortDescription: "",
    longDescription: "",
    price: "",
    offer: "",
    preparationTime: "",
    image: "",
    status: "Available",
  });

  const [originalMenuData, setOriginalMenuData] = useState(null); 

  const fetchMenu = async () => {
    try {
      const token = localStorage.getItem("restaurantToken");
      const res = await axios.get(`http://localhost:5000/api/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuData(res.data);
      setOriginalMenuData(res.data); 
    } catch (err) {
      console.error("Failed to fetch menu", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMenuData((prev) => ({ ...prev, [name]: value }));
  };

  const saveChanges = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`http://localhost:5000/api/menu/${id}`, menuData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditMode(false);
      fetchMenu();
    } catch (err) {
      console.error("Failed to save changes", err);
    }
  };

  const toggleStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = menuData.status === "Available" ? "Not Available" : "Available";
      await axios.patch(
        `http://localhost:5000/api/menu/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMenuData((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowConfirm(false);
      navigate("/restaurant/menu");
    } catch (err) {
      console.error("Failed to delete menu", err);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  return (
    <div className="min-h-screen text-black relative">
      <Header active="Menu" />

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6 mt-20">
        <img
          src={
            menuData.image?.startsWith("http")
              ? menuData.image
              : `http://localhost:5000/uploads/menu_images/${menuData.image}`
          }
          alt={menuData.name}
          className="w-full h-64 object-cover rounded shadow"
        />

        <div className="flex justify-between items-center">
          <div className="space-y-2">
            {editMode ? (
              <>
                <input
                  type="text"
                  name="name"
                  value={menuData.name}
                  onChange={handleChange}
                  className="text-xl font-bold border px-3 py-2 rounded w-full"
                />
                <input
                  type="text"
                  name="type"
                  value={menuData.type}
                  onChange={handleChange}
                  className="text-sm text-gray-600 border px-3 py-1 rounded"
                />
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold">{menuData.name}</h2>
                <p className="text-xs text-gray-500">
                  {menuData.type} <span className="mx-2">|</span>
                  <span
                    className={`font-medium text-xs ${
                      menuData.status === "Available" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {menuData.status}
                  </span>
                </p>
              </>
            )}
          
          </div>

          <div
            onClick={toggleStatus}
            className={`w-12 h-6 flex items-center rounded p-1 cursor-pointer transition ${
              menuData.status === "Available"
                ? "bg-green-300 justify-end"
                : "bg-red-300 justify-start"
            }`}
          >
            <div className="w-4 h-4 bg-white rounded-full shadow" />
          </div>
        </div>

        {editMode ? (
          <input
            name="shortDescription"
            value={menuData.shortDescription}
            onChange={handleChange}
            className="text-sm border px-4 py-2 rounded w-full resize-none"
            placeholder="Short Description"
          />
        ) : (
          <p className="text-sm text-gray-700">{menuData.shortDescription}</p>
        )}

        {editMode ? (
          <textarea
            rows={4}
            name="longDescription"
            value={menuData.longDescription}
            onChange={handleChange}
            className="text-sm border px-4 py-2 rounded w-full resize-none"
            placeholder="Long Description"
          />
        ) : (
          <p className="text-sm text-gray-700">{menuData.longDescription}</p>
        )}
        <div className="relative grid grid-cols-1 gap-4">
          {!editMode && (
            <div className="absolute top-0 right-0 mt-2 mr-2">
              <div className="flex gap-1 bg-orange-500 px-3 py-2 rounded text-sm font-semibold text-white w-max shadow">
                <CiDiscount1 size={18} className="text-white" />
                {menuData.offer || "0"} <span className="text-white font-bold">% OFF</span>
              </div>
            </div>
          )}

          {["price", "preparationTime"].map((field) =>
            editMode ? (
              <input
                key={field}
                type="text"
                name={field}
                value={menuData[field]}
                onChange={handleChange}
                className="border px-4 py-2 rounded text-sm"
                placeholder={field}
              />
            ) : (
              <p key={field} className="text-sm font-medium text-gray-800">
                <strong>{field === "price" ? "Price" : "Preparation Time"}:</strong>{" "}
                {field === "price" ? "Rs. " : ""}
                {menuData[field]}
              </p>
            )
          )}

          {editMode && (
            <input
              type="text"
              name="offer"
              value={menuData.offer}
              onChange={handleChange}
              className="border px-4 py-2 rounded text-sm"
              placeholder="Offer"
            />
          )}
        </div>

        <div className="flex justify-center gap-6 mt-6">
          {editMode ? (
            <>
              <button
                onClick={() => {
                  setMenuData(originalMenuData); 
                  setEditMode(false);
                }}
                className="bg-gray-200 hover:bg-gray-300  text-black font-medium text-sm h-10 w-32 rounded  transition"
              >
                Cancel
              </button>
              <button
                onClick={saveChanges}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition"
              >
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setMenuData(originalMenuData); 
                  setEditMode(true);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition"
              >
                Edit Menu
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                className="bg-red-500 hover:bg-red-600 text-white font-medium text-sm h-10 w-32 rounded transition"
              >
                Delete Menu
              </button>
            </>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-[#da4668] text-white rounded px-10 py-8 text-center relative shadow-lg">
            <button
              onClick={() => setShowConfirm(false)}
              className="absolute top-3 right-4 text-white text-2xl font-bold"
            >
              <FaTimes size={16} />
            </button>
            <p className="text-sm font-medium">
              Are you sure, you want to delete this menu?
            </p>
            <div className="mt-6 flex justify-center gap-6">
              
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-white text-black hover:bg-gray-100 font-medium text-sm h-10 w-32 rounded transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-gray-900 hover:bg-black text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
