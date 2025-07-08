import {
  Route,
  BrowserRouter as Router,
  Routes
} from 'react-router-dom';

import AllRestaurants from './components/allRestaurant';
import IndividualRestaurantPage from './components/individualRestaurant';
import HelpCenter from './components/restaurant/helpCenter';
import IndividualMenu from './components/restaurant/individualMenu';
import OrderDetails from './components/restaurant/orderDetails';
import OrderHistory from './components/restaurant/orderHistory';
import OwnerDetails from './components/restaurant/ownerDetails';
import RestaurantDetails from './components/restaurant/restaurantDetails';
import RestaurantViewOffers from './components/restaurant/viewOffer';
import SetLocation from './components/setLocationCustomer';
import Dashboard from './core/roles/admin/dashboard';
import AdminLogin from './core/roles/admin/login';
import Notifications from './core/roles/admin/notification';
import Request from './core/roles/admin/requests';
import AccountSettings from './core/roles/customer/AccountSettings';
import AfterLoginHomePage from './core/roles/customer/afterLoginHome';
import AfterLoginRestaurant from './core/roles/customer/afterLoginRestaurant';
import ChangePassword from './core/roles/customer/changePassword';
import CheckoutPage from './core/roles/customer/checkoutPage';
import ForgotPassword from './core/roles/customer/forgotPassword';
import Home from './core/roles/customer/home';
import AuthPage from './core/roles/customer/loginRegister';
import MyBag from './core/roles/customer/myBag';
import NotificationPanel from './core/roles/customer/Notification';
import ProfilePanel from './core/roles/customer/Profile';
import TrackOrder from './core/roles/customer/trackOrder';
import ResChangePassword from './core/roles/restaurant/changePassword';
import RestaurantForgotPassword from './core/roles/restaurant/forgotPassword';
import RestaurantHome from './core/roles/restaurant/home';
import RestaurantLogin from './core/roles/restaurant/login';
import Menu from './core/roles/restaurant/menu';
import Profile from './core/roles/restaurant/profile';
import RestaurantRegister from './core/roles/restaurant/register';
import ViewOrder from './core/roles/restaurant/viewOrder';
export default function App() {
  return (
    <Router>

      {/* // CUSTOMER SIDE ROUTES----- */}
       <NotificationPanel />
         <ProfilePanel />
        <Routes>
        <Route path="/"                 element={<Home />} />
        <Route path="/login"            element={<AuthPage />} />
        <Route path="/forgot-password"  element={<ForgotPassword />} />
        <Route path="/change-password/:token" element={<ChangePassword />} />
        <Route path="/delivo-eats"      element={<AfterLoginHomePage />} />
        <Route path="/delivo-eats/all-restaurant"      element={<AfterLoginRestaurant/>} />
        <Route path="/certain-restaurant/:id"       element={<IndividualRestaurantPage />} />
         <Route path="/delivo-eats/mybag"       element={<MyBag />} />
        <Route path="/all-restaurant"       element={<AllRestaurants/>} />
        <Route path="/delivo-eats/checkout/:restaurantId"       element={<CheckoutPage />} />
        <Route path="/delivo-eats/track-order"       element={<TrackOrder />} />
        <Route path="/delivo-eats/account"       element={<AccountSettings />} />
        <Route path="/delivo-eats/location"       element={<SetLocation />} />



        {/* // Restaurant Routes----- */}
        <Route path="/restaurant/login"            element={<RestaurantLogin />} />
        <Route path="/restaurant/register"         element={<RestaurantRegister />} />
        <Route path="/restaurant/forgot-password"         element={<RestaurantForgotPassword/>} />
        <Route path="/restaurant/change-password"         element={<ResChangePassword/>} />
        <Route path="/restaurant/home/:restaurantId"         element={<RestaurantHome/>} />
        <Route path="/view-offers"         element={<RestaurantViewOffers/>} />
        <Route path="/restaurant/view-order/:restaurantId"         element={<ViewOrder/>} />
        <Route path="/restaurant/order/:orderId"         element={<OrderDetails/>} />
        <Route path="/restaurant/orders/history" element={<OrderHistory />} />
        <Route path="/restaurant/menu" element={<Menu />} />
        <Route path="/restaurant/menu/:id" element={<IndividualMenu />} />
        <Route path="/restaurant/profile" element={<Profile />} />
        <Route path="/restaurant/profile/owner-details" element={<OwnerDetails />} />
        <Route path="/restaurant/profile/restaurant-details" element={<RestaurantDetails />} />
        <Route path="/restaurant/profile/help" element={<HelpCenter />} />



      {/* //ROUTE FOR ADMIN SIDE------ */}
      <Route path="/admin" element={<Dashboard />} />
      <Route path="/admin/requests" element={<Request />} />
      <Route path="/admin/notifications" element={<Notifications />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="*"                 element={<div>404: Page Not Found</div>} />
      </Routes>
    </Router>
  );
}










