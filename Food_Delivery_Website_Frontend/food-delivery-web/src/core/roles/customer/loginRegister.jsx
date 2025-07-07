import axios from 'axios';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BackgroundImage from '../../../../src/assets/images/loginImage.png';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const from = location.state?.from || "/delivo-eats"; 

  const [activeTab, setActiveTab] = useState('login');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');  

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });

  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const { email, password } = loginData;

    if (!email || !password) {
      setErrorMsg('Please fill out all the fields.');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/customer/login', loginData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem("userId", response.data.user._id);  
        // localStorage.removeItem('guestBasket');
  navigate(from, {
  replace: true,
  state: location.state, // preserve basket and other info
});


    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid email or password');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const { name, email, mobile, password, confirmPassword } = registerData;

    if (!name || !email || !mobile || !password || !confirmPassword) {
      setErrorMsg('Please fill out all the fields.');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/customer/register', {
        fullName: name,
        email,
        mobile,
        password,
        confirmPassword
      });

      setActiveTab('login');
      setSuccessMsg('Registration successful! Please login.');
      setRegisterData({ name: '', email: '', mobile: '', password: '', confirmPassword: '' }); // reset form
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex h-screen">
      <div
        className="hidden lg:flex w-96 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${BackgroundImage})` }}
      />

      <div className="flex flex-1 items-center justify-center p-8">
        <div>
          {errorMsg && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-[12px] flex items-center mb-6 justify-center"
              role="alert"
            >
              <span className="text-base mr-2">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-[12px] flex items-center justify-center mb-6"
              role="alert"
            >
                <svg
            className="fill-current w-6 h-6 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" />
          </svg>
              <span>{successMsg}</span>
            </div>
          )}

          <div className="bg-white text-black  border border-gray-200 shadow-md text-sm h-10 w-64 rounded hover:bg-orange-100 transition flex overflow-hidden mb-4">
            <button
              className={`flex-1 font-medium ${
                activeTab === 'login' ? 'bg-orange-500 underline text-white' : 'text-gray-700'
              }`}
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
            >
              Login
            </button>
            <div className="w-px bg-black h-12" />
            <button
              className={`flex-1 font-medium ${
                activeTab === 'register' ? 'bg-orange-500 underline text-white' : 'text-gray-700'
              }`}
              onClick={() => {
                setActiveTab('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
            >
              Register
            </button>
          </div>

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-6 mt-4" noValidate>
              <div>
                <label className="block font-normal text-sm mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block font-normal text-sm mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs text-gray-700 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <p className="text-center text-xs text-gray-800">
                Don’t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="underline"
                >
                  Register
                </button>
              </p>

              <div className="text-center">
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded transition"
                >
                  Login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-5 mt-4" noValidate>
              <div>
                <label className="block font-normal text-sm mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block font-normal text-sm mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block font-normal text-sm mb-1">Mobile Number</label>
                <input
                  type="tel"
                  name="mobile"
                  value={registerData.mobile}
                  onChange={handleRegisterChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block font-normal text-sm mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block font-normal text-sm mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <p className="text-center text-xs text-gray-800 ">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="underline"
                >
                  Login
                </button>
              </p>
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded transition"
                >
                  Register
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
