import { Link, useLocation, useNavigate } from 'react-router-dom';
import img1 from "../assets/images/logo.png";
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation(); 

  const isActive = (path) => location.pathname === path;
const handleProtectedClick = (path, state = {}) => {
  const token = localStorage.getItem('token');
  if (!token || token.trim() === '' || token === 'undefined') {
    // Pass intended path in state so login page knows where to redirect after login
    navigate('/login', { state: { from: path } });
  } else {
    navigate(path, { state });
  }
};


  return (
    <header className="fixed top-0 left-0 w-full z-50 h-20 flex items-center justify-between p-4 shadow-md bg-white">
        <div className="flex items-center space-x-2">
        <Link to="/">
          <img src={img1} className="h-20 mt-2 w-28 object-contain cursor-pointer" alt="DelivoEats Logo" />
        </Link>
      </div>

      <nav className="flex space-x-20 text-base">
        <Link
          to="/"
          className={`${isActive('/') ? 'underline underline-offset-4 text-black' : ''}`}
        >
          Home
        </Link>

        <Link
          to="/delivo-eats/all-restaurant"
          className={`${isActive('/delivo-eats/all-restaurant') ? 'underline underline-offset-4 text-black ' : ''}`}
        >
          Restaurants
        </Link>

       <button
  onClick={() => handleProtectedClick('/delivo-eats/track-order')}
  className={`${isActive('/delivo-eats/track-order') ? 'underline ' : ''} bg-transparent`}
>
  Track Order
</button>


        <Link
         to="/delivo-eats/mybag"
          className={`${isActive('/delivo-eats/mybag') ? 'underline ' : ''} bg-transparent`}
        >
          My Bag
        </Link>
      </nav>

      <div>
        <button
          onClick={() => navigate('/login')}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm h-10 w-32 rounded hover:bg-300 transition"
        >
          Login/Register
        </button>
      </div>
    </header>
  );
};

export default Header;
