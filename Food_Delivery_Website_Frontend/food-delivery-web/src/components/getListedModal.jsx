import axios from 'axios';
import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

export default function GetListedModal({ onClose }) {
  const [formData, setFormData] = useState({
    ownerName: '',
    restaurantName: '',
    ownerEmail: '',
    phone1: '',
    details: ''
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loginWarning, setLoginWarning] = useState(false);

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErrorMessage('');
    setSuccessMessage('');
  };
const handleSubmit = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('token');
  if (!token || token.trim() === '' || token === 'undefined') {
    setLoginWarning(true);
    return;
  }

  setLoginWarning(false);
  setErrorMessage('');
  setSuccessMessage('');
  
  const { ownerName, restaurantName, ownerEmail, phone1, details } = formData;
  if (!ownerName || !restaurantName || !ownerEmail || !phone1 || !details) {
    setErrorMessage('Please enter all the fields.');
    return;
  }

 try {
  const res = await axios.post('http://localhost:5000/api/get-listed', formData, {
    headers: { Authorization: `Bearer ${token}` },
  });

  setSuccessMessage('Submitted successfully!');
  setFormData({
    ownerName: '',
    restaurantName: '',
    ownerEmail: '',
    phone1: '',
    details: ''
  });
} catch (error) {
  console.error(error);

  if (
    error.response &&
    error.response.status === 400 &&
    typeof error.response.data.message === 'string'
  ) {
    // ✅ Set backend error message
    setErrorMessage(`${error.response.data.message}`);
  } else {
    setErrorMessage('Something went wrong. Please try again.');
  }
}
};


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-800"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-base font-semibold text-center mb-2">Get Listed</h2>
        <p className="text-center text-gray-700 mb-6 text-sm">
          List Your Restaurants to DelivoEats
        </p>
        <p className="text-start text-xs text-gray-600 mb-6">
          Please fill up the details below:
        </p>

        {successMessage && (
          <div className="col-span-2 bg-green-100 text-green-700 border border-green-300 text-center px-4 py-2 rounded text-sm mb-4 flex items-center justify-center">
            <svg
              className="fill-current w-6 h-6 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" />
            </svg>
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="col-span-2 bg-red-100 text-red-700 border border-red-300 text-center px-4 py-2 rounded text-sm mb-4 flex items-center justify-center ">
          
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Login Warning */}
        {loginWarning && (
          <div className="col-span-2 bg-red-100 text-red-700 border border-red-300 text-center px-4 py-3 rounded text-sm mb-4 flex items-center justify-center">
            <span className="mr-2">⚠️</span>
            Please login first to access the listing form.
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4" noValidate>
          <div>
            <label className="block font-normal mb-1 text-sm">Name</label>
            <input
              type="text"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block font-normal mb-1 text-sm">Restaurant Name</label>
            <input
              type="text"
              name="restaurantName"
              value={formData.restaurantName}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block font-normal mb-1 text-sm">Email Address</label>
            <input
              type="email"
              name="ownerEmail"
              value={formData.ownerEmail}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block font-normal mb-1 text-sm">Contact Number</label>
            <input
              type="tel"
              name="phone1"
              value={formData.phone1}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="col-span-2">
            <label className="block font-normal mb-1 text-sm">Details</label>
            <textarea
              name="details"
              value={formData.details}
              onChange={handleChange}
              rows={5}
              placeholder='Please write restaurant license number.'
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="col-span-2 text-center mt-2">
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
