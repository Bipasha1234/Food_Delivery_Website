import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaSearch, FaTimes } from "react-icons/fa";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import Header from "../components/afterLoginHomePageHeader";
import GuestHeader from "../components/header";
import Footer from "./footer";
const customIcon = L.divIcon({
  className: "custom-marker-icon",
  html: `<div class="text-red-600 text-4xl select-none">📍</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function SetLocation() {
  const navigate = useNavigate();
const [errorMessage, setErrorMessage] = useState("");

  const [markerPosition, setMarkerPosition] = useState(null);
  const [address, setAddress] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingSavedLocation, setLoadingSavedLocation] = useState(true);

  useEffect(() => {
    const fetchSavedLocation = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoadingSavedLocation(false);
          return;
        }
        const response = await fetch("http://localhost:5000/api/location", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          console.warn("No saved location found");
          setLoadingSavedLocation(false);
          return;
        }
        const data = await response.json();
        if (data && data.lat && data.lon && data.address) { 
          setMarkerPosition([data.lat, data.lon]);
          setAddress(data.address);
        }
      } catch (error) {
        console.error("Error fetching saved location:", error);
      } finally {
        setLoadingSavedLocation(false);
      }
    };

    fetchSavedLocation();
  }, []);

  useEffect(() => {
    if (!loadingSavedLocation && markerPosition === null) {
      setMarkerPosition([27.7172, 85.3240]);
      setAddress("No Location set yet!");
    }
  }, [loadingSavedLocation, markerPosition]);
  const handleSearch = async () => {
    try {
      const viewbox = "85.244,27.784,85.398,27.601"; // Kathmandu bbox
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchInput
        )}&viewbox=${viewbox}&bounded=1`
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newPosition = [parseFloat(lat), parseFloat(lon)];
        setMarkerPosition(newPosition);
        setAddress(display_name);
      } else {
      setErrorMessage("Location not found inside Kathmandu. Please try a different place.");

      }
    } catch (error) {
      console.error("Error searching location:", error);
    }
  };

  const chooseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMarkerPosition([latitude, longitude]);
        fetchAddress(latitude, longitude);
        setLoadingLocation(false);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert("Permission denied. Please allow location access.");
            break;
          case error.POSITION_UNAVAILABLE:
            alert("Position unavailable.");
            break;
          case error.TIMEOUT:
            alert("Location request timed out.");
            break;
          default:
            // alert("Unable to retrieve your location.");
        }
        setLoadingLocation(false);
      }
    );
  };

  // Reverse geocode lat/lng to address
  const fetchAddress = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress("Unknown Location");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddress("Unknown Location");
    }
  };

  function MapClickHandler() {
    const map = useMapEvents({
      click(e) {
        setMarkerPosition([e.latlng.lat, e.latlng.lng]);
        fetchAddress(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  function ChangeMapCenter({ center }) {
    const map = useMap();
    useEffect(() => {
      map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
  }

  const saveLocationToBackend = async () => {
    if (!markerPosition) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address,
          lat: markerPosition[0],
          lon: markerPosition[1], 
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        alert("Failed to save location: " + (err.error || "Unknown error"));
        setSaving(false);
        return;
      }

        navigate("/delivo-eats", {
          state: { confirmedAddress: address, markerPosition },
          replace: true, 
        });

    } catch (error) {
      console.error("Error saving location:", error);
      alert("Error saving location. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingSavedLocation || markerPosition === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 mt-24">
        <p>Loading saved location...</p>
      </div>
    );
  }
const token = localStorage.getItem("token");
const isLoggedIn = token && token.trim() !== "" && token !== "undefined";

  return (
    <>
{isLoggedIn ? <Header /> : <GuestHeader />}
      <div className="min-h-screen flex items-center justify-center p-6  mt-24">
        <div className="bg-white max-w-3xl w-full rounded-lg shadow-lg p-6 space-y-6">
          <div className="flex gap-2 justify-center items-center">
             <h2 className="text-center text-base font-semibold text-gray-800">
            Set Your Delivery Location
          </h2>
          <h2 className="text-center text-xs font-normal text-gray-600">
            (inside kathmandu valley only!)
          </h2>
          </div>
         
          {errorMessage && (
  <div className="text-red-600 text-sm bg-red-100 border border-red-300 px-4 py-2 rounded mt-2 shadow-sm flex items-center justify-center">
   ⚠️  {errorMessage}
  </div>
)}


          <div className="flex items-center space-x-2 text-gray-700 text-xs font-medium">
            <FaMapMarkerAlt className="text-black text-xl" />
            <span className="truncate text-gray-500">{address}</span>
          </div>

         <div className={`flex items-center bg-white/95 backdrop-blur-md border-2 ${searchInput ? 'border-orange-300 shadow-2xl' : 'border-white/30 shadow-xl'} rounded-full overflow-hidden transition-all duration-500 transform h-12 w-full`}>
  <div className="flex-1 relative">
    <input
      type="text"
      placeholder="Search Location"
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
      className="w-full px-6 py-4 text-sm text-gray-800 bg-transparent focus:outline-none placeholder-gray-500"
    />
    {searchInput && (
      <button
        type="button"
        onClick={() => setSearchInput("")}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500"
        aria-label="Clear"
      >
        <FaTimes />
      </button>
    )}
  </div>

  <button
    onClick={handleSearch}
    className="px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
    title="Search"
  >
    <span className="relative z-10 flex items-center gap-2">
      <FaSearch />
      <span className="hidden sm:inline">Search</span>
    </span>
    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
  </button>
</div>


          <div className="flex justify-start gap-3">
            <FaMapMarkerAlt className="text-red-600" />
            <button
              onClick={chooseCurrentLocation}
              disabled={loadingLocation}
              className="text-red-600 text-sm flex font-semibold h-10 w-48 rounded transition"
            >
              {loadingLocation ? "Locating..." : "Choose Current Location"}
            </button>
          </div>

          <MapContainer
            center={markerPosition}
            zoom={15}
            scrollWheelZoom={true}
            style={{ height: "300px", width: "100%" }}
            className="rounded shadow"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={markerPosition} icon={customIcon} />
            <MapClickHandler />
            <ChangeMapCenter center={markerPosition} />
          </MapContainer>

          <div className="flex justify-center space-x-6">
            <button
              onClick={() => navigate("/delivo-eats")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700  font-medium text-sm h-10 w-32 rounded  transition"
            >
              Cancel
            </button>
            <button
              onClick={saveLocationToBackend}
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition"
            >
              {saving ? "Saving..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .custom-marker-icon {
          display: flex;
          justify-content: center;
          align-items: center;
          user-select: none;
          pointer-events: none;
        }
      `}</style>
      <Footer/>
    </>
  );
}
