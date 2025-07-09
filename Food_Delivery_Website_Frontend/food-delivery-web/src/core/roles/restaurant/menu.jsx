import axios from "axios";
import { useEffect, useState } from "react";
import { BiPlus } from "react-icons/bi";
import { CgMenuBoxed } from "react-icons/cg";
import { CiDiscount1 } from "react-icons/ci";
import { IoMdArrowDropdown } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../core/roles/restaurant/header";

export default function RestaurantMenu() {
  const [displayTab, setDisplayTab] = useState("Available");
  const [showAddForm, setShowAddForm] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const navigate = useNavigate();
const { restaurantId } = useParams();
  const goToMenuDetail = (id) => {
    navigate(`/restaurant/menu/${id}`);
  };

  const [form, setForm] = useState({
    name: "",
    price: "",
    shortDescription: "",
    longDescription: "",
    type: "",
    offer: "",
    preparationTime: "",
    status: "Available",
    image: null,
  });

  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem("restaurantToken");
      const res = await axios.get("http://localhost:5000/api/menu/add", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems(res.data);
    } catch (err) {
      console.error("Failed to fetch menu:", err);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm((prev) => ({ ...prev, image: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddMenu = async () => {
    const formData = new FormData();
    for (let key in form) {
      formData.append(key, form[key]);
    }

    try {
      const token = localStorage.getItem("restaurantToken");
      await axios.post("http://localhost:5000/api/menu/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setShowAddForm(false);
      setForm({
        name: "",
        price: "",
        shortDescription: "",
        longDescription: "",
        type: "",
        offer: "",
        preparationTime: "",
        status: "Available",
        image: null,
      });
      fetchMenuItems();
    } catch (err) {
      console.error("Failed to add menu item", err);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("restaurantToken");
      const newStatus = currentStatus === "Available" ? "Not Available" : "Available";
      await axios.patch(
        `http://localhost:5000/api/menu/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMenuItems();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <div className="min-h-screen text-black ">
      <Header active="Menu"  />

      <div className="max-w-5xl mx-auto px-6 py-10 mt-20 ">
        <div className="flex justify-between items-center mb-6 bg-white shadow px-6 py-3 rounded">
          <div className="flex items-center gap-3">
            <span className="text-xl"><CgMenuBoxed/></span>
            <span className="text-sm font-medium text-gray-700">Add Menu</span>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xl rounded px-4 py-1 shadow-md flex items-center"
          >
            {showAddForm ? <IoMdArrowDropdown /> : <BiPlus/>}
          </button>
        </div>

        {!showAddForm ? (
          <>
            <div className="flex gap-4 mb-8 justify-center">
              <button
                onClick={() => setDisplayTab("Available")}
                className={` ${
                  displayTab === "Available" ? "bg-orange-500 text-white font-medium text-sm h-10 w-32 rounded hover:bg-orange-600 transition" : "text-gray-500 text-sm  rounded border transition h-10 w-32"
                }`}
              >
                Available
              </button>
              <button
                onClick={() => setDisplayTab("Not Available")}
                className={` ${
                  displayTab === "Not Available" ? "bg-orange-500 text-white font-medium text-sm h-10 w-32 rounded hover:bg-orange-600 transition" : "text-gray-500 text-sm  rounded border transition h-10 w-32"
                }`}
              >
                Not Available
              </button>
            </div>

            <div className="space-y-6">
              {menuItems
                .filter((item) => item.status === displayTab)
                .map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between items-center bg-white shadow rounded overflow-hidden p-4"
                    onClick={() => goToMenuDetail(item._id)}
                  >
                    <div className="flex gap-4 items-center">
                      <img
                        src={`http://localhost:5000/uploads/menu_images/${item.image}`}
                        alt={item.name}
                        className="w-32 h-24 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-bold text-base">{item.name}</h4>
                        <div className="text-xs text-gray-500 flex gap-7">
                          <span>{item.shortDescription}</span>
                          <span className={`font-medium ${item.status === "Available" ? "text-green-600" : "text-red-500"}`}>
                            {item.status}
                          </span>
                        </div>
                        <p className="text-sm mt-1">Rs. {item.price}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(item._id, item.status);
                        }}
                        className={`w-12 h-6 flex items-center rounded p-1 cursor-pointer ${
                          item.status === "Available" ? "bg-green-300 justify-end" : "bg-red-300 justify-start"
                        }`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full shadow" />
                      </div>
                      <button className="bg-orange-500 text-white text-xs px-3 py-1 rounded mt-10 flex items-center gap-1">
                        <CiDiscount1 size={16} /> {item.offer || "0"}% OFF
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </>
        ) : (
          <div className="bg-white shadow rounded-xl p-6 space-y-6">
            <h2 className="text-base font-medium">Add Menu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ["name", "Menu Name"],
                ["price", "Price"],
                ["shortDescription", "Menu Short Description"],
                ["type", "Category"],
                ["offer", "Special Offers"],
                ["preparationTime", "Expected Preparation Time"],
              ].map(([name, label]) => (
                <div key={name}>
                  <label className="block text-sm font-normal mb-1">{label}</label>
                  <input
                    type="text"
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    className="border px-4 py-2 rounded w-full text-sm"
                  />
                </div>
              ))}

                <div className="md:col-span-2">
                <label className="block text-sm font-normal mb-1">
                  Long Description
                </label>
                <textarea
                  name="longDescription"
                  value={form.longDescription}
                  onChange={handleChange}
                  rows={4}
                  className="border px-4 py-2 rounded w-full resize-none text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-normal mb-1">
                  Menu Image
                </label>
                <input
                  type="file"
                  name="image"
                  onChange={handleChange}
                  className="border px-4 py-2 rounded w-full text-sm"
                />
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-200 text-black  hover:bg-gray-300 font-medium text-sm h-10 w-32 rounded transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMenu}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

