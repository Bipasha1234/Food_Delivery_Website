import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BackgroundImage from '../../../../src/assets/images/loginImage.png';
export default function ChangePassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage('');
  setError('');

  if (!password || !confirmPassword) {
    setError('Please fill out all the fields.');
    return;
  }

  if (password !== confirmPassword) {
    setError('Passwords do not match.');
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/api/customer/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage(
        <>
          Password changed successfully!{' '}
          <Link to="/login" className="text-blue-600 underline hover:text-blue-800">
            Log in now.
          </Link>
        </>
      );
      setPassword('');
      setConfirmPassword('');
    } else {
      setError(data.message || 'Failed to reset password');
    }
  } catch (err) {
    setError('Something went wrong');
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
          <h2 className="text-3xl font-bold mb-6">Change Password</h2>

          {error && (
            <div
              className="flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-6 justify-center text-[12px]"
              role="alert"
            >
              ⚠️
              <p className="font-normal text-[12px] ml-2">{error}</p>
            </div>
          )}

          {message && (
        <div
          className="flex items-center bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 text-[12px]"
          role="alert"
        >
          <svg
            className="fill-current w-6 h-6 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" />
          </svg>
          <p className="font-normal">{message}</p>
        </div>
      )}


          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label className="block font-normal text-sm mb-1">Enter new Password</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                
              />
            </div>

            <div>
              <label className="block font-normal text-sm mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded transition"
              >
                Confirm
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
