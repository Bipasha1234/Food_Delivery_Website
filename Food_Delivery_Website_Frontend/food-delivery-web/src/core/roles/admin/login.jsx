import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();

  const [adminData, setAdminData] = useState({
    email: '',
    password: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await axios.post('http://localhost:5000/api/admin/login', adminData);
      localStorage.setItem('adminToken', res.data.token);
      setSuccessMsg('Admin login successful!');
      setTimeout(() => {
        navigate('/admin');
      }, 1000); // Navigate after 1 second
    } catch (err) {
      setErrorMsg(err.response?.data?.message || '❌ Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-lg font-bold mb-6 text-center">Admin Login of Delivo-Eats</h2>

        {successMsg && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm mb-4 flex justify-center items-center">
            <svg
            className="fill-current w-6 h-6 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" />
          </svg>
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm mb-4 flex justify-center items-center">
            ⚠️{errorMsg}
          </div>
        )}

        <div className="mb-4">
          <label className="block font-normal mb-1 text-sm">Email</label>
          <input
            type="email"
            name="email"
            value={adminData.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block font-normal text-sm mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={adminData.password}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
            required
          />
        </div>

        <div className="flex items-center justify-center">
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded transition"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
}
