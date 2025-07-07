import axios from 'axios';
import { useState } from 'react';
import BackgroundImage from '../../../../src/assets/images/loginImage.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/customer/forgot-password', { email });
      setMessage(response.data.message || 'Reset link sent successfully.');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    }
  };

  return (
    <div className="flex h-screen">
      <div
        className="hidden lg:flex w-96 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${BackgroundImage})` }}
      />

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-xs">
          <h2 className="text-3xl font-bold mb-4">Forgot Password</h2>
          <p className="mb-6 text-gray-700 text-xs">
            Please enter your email and click the Send Link.
          </p>

          {message && (
            <div className="col-span-2 bg-green-100 text-green-700 border border-green-300 text-center px-4 py-3 rounded text-[12px] mb-4 flex items-center">
              <svg
            className="fill-current w-6 h-6 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" />
          </svg>
           {message}
            </div>
          )}
          {error && (
            <div className="col-span-2 bg-red-100 text-red-700 border border-red-300 text-center p-3 rounded text-[12px] mb-4">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label className="block font-normal text-sm mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="you@example.com"
                
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded transition"
              >
                Send Link
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
