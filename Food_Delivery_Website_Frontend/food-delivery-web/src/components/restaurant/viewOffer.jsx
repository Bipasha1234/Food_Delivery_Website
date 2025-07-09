import axios from "axios";
import { useEffect, useState } from "react";
import { BiPlus } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import Header from "../../core/roles/restaurant/header";

export default function RestaurantViewOffers() {
  const [offers, setOffers] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [newOffer, setNewOffer] = useState({
    title: "",
    value: "",
    code: "",
    desc: "",
    offerImage: null,
  });

  const restaurantId = localStorage.getItem("restaurantId");
  const token = localStorage.getItem("token");

  const API_URL = `http://localhost:5000/api/offers/${restaurantId}`;

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOffers(res.data);
    } catch (err) {
      console.error("Error fetching offers:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "offerImage") {
      setNewOffer({ ...newOffer, offerImage: files[0] });
    } else {
      setNewOffer({ ...newOffer, [name]: value });
    }
  };

  const handleAdd = async () => {
    const { title, value, code, desc, offerImage } = newOffer;
    if (title && value && code && desc) {
      try {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("value", value);
        formData.append("code", code);
        formData.append("desc", desc);
        formData.append("restaurantId", restaurantId);
        if (offerImage) {
          formData.append("offerImage", offerImage);
        }

        const res = await axios.post(
          "http://localhost:5000/api/offers",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setOffers([res.data, ...offers]);
        setNewOffer({ title: "", value: "", code: "", desc: "", offerImage: null });
        setShowForm(false);
      } catch (err) {
        console.error("Error adding offer:", err);
      }
    }
  };

  const handleRemove = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/offers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOffers(offers.filter((offer) => offer._id !== id));
    } catch (err) {
      console.error("Error deleting offer:", err);
    }
  };

  return (
    <div className="min-h-screen text-black">
      <Header active="Home" />

      <div className="max-w-4xl mx-auto px-6 py-10 mt-20">
        <h2 className="text-base font-bold mb-5">Discount and Offers</h2>

        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Add Offers</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xl rounded px-4 py-1 shadow-md flex items-center"
            title={showForm ? "Close Form" : "Add Offer"}
          >
            {showForm ?  <IoMdArrowDropdown />: <BiPlus />}
          </button>
        </div>

        {showForm && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mt-3">
              <div>
                <label className="block text-sm font-normal mb-1">Offer Title</label>
                <input
                  type="text"
                  name="title"
                  value={newOffer.title}
                  onChange={handleChange}
                  placeholder="Enter title"
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-normal mb-1">Discount Value</label>
                <input
                  type="text"
                  name="value"
                  value={newOffer.value}
                  onChange={handleChange}
                  placeholder="e.g. 10"
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-noral mb-1">Discount Code</label>
                <input
                  type="text"
                  name="code"
                  value={newOffer.code}
                  onChange={handleChange}
                  placeholder="e.g. SAVE10"
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-normal mb-1">Short Description</label>
                <input
                  type="text"
                  name="desc"
                  value={newOffer.desc}
                  onChange={handleChange}
                  placeholder="Describe offer briefly"
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-normal mb-1">Offer Image</label>
                <input
                  type="file"
                  name="offerImage"
                  accept="image/*"
                  onChange={handleChange}
                  className="text-sm"
                />
              </div>
            </div>

            {newOffer.offerImage && (
              <div className="mt-4 text-center">
                <img
                  src={URL.createObjectURL(newOffer.offerImage)}
                  alt="Preview"
                  className="h-40 mx-auto rounded shadow"
                />
              </div>
            )}

            <div className="flex justify-center items-center mt-4">
              <button
                onClick={handleAdd}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition"
              >
                Add
              </button>
            </div>
          </>
        )}

        <h3 className="text-sm font-medium mt-10">Current Offers</h3>
        <div className="space-y-4 mt-5">
          {offers.map((offer) => (
            <div
              key={offer._id}
              className="relative bg-gradient-to-r from-orange-400 via-orange-200 to-orange-100 rounded p-6 shadow text-white"
            >
              <button
                onClick={() => handleRemove(offer._id)}
                className="absolute top-2 right-2 text-white hover:text-black"
                title="Delete Offer"
              >
                <FaTrash />
              </button>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <p className="text-sm">{offer.title}</p>
                  <h2 className="text-6xl font-bold">{offer.value} %</h2>
                  <p className="text-xl font-semibold ml-20">Off</p>
                  <p className="text-sm mt-4 text-black font-medium">{offer.desc}</p>
                </div>

                <div className="text-black font-bold text-sm text-center">
                  <p className="bg-white px-4 py-2 rounded shadow-md">
                    CODE : {offer.code}
                  </p>

                  {offer.offerImage && (
                    <img
                      src={`http://localhost:5000/uploads/menu_images/${offer.offerImage}`}
                      alt="Offer"
                      className="mt-2 h-32 w-32 object-cover rounded shadow"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
