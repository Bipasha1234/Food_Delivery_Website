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




//user flow banaune
//image in user persona and location adding
//response add garne-
//trello ko screenshot rakhni---
//nelsosns- ko ma figma ko ki real preoduct ko screenshot-
//design principle ma real product ko ??
//design pricnipal ma 1/2 ota add garxu ajha--
//development methodology aunu agadi user flow diagram(--decision/ui diagram)


// In order history, in customer side, the order should be clickable and it should show the order details.
// Offers in restaurant side, customer should be able to click it only once else it should be disabled.
// without login home page, design text of about us should be smaller.
// If menu is in unavailable state, in customer side that unavailable menu should not be clickable and in text-not available should also be seen.
// Track Order in customer side, it should be in real time according to the order status.
//in track order, if no order then it should show no order placed yet.
//in ind res, default image not showing, it should show.
// If notification or profile is clicked then it should be highlighted with color.
// In customer side, offers-image should be shown----
// Search the menus and restaurant in home page and individual restaurant.
// For footer, in customer side, it should be navigated--
// Online/Offline toggle in restaurant side funcionality should be implemented.
// Forgot Password in customer side and restaurant side
//FOOTER FIX-
//if restaurant rejects-order rejected then it should go to order history of restaurant side and in customer side---  if rejected then in notification it should be shown as rejected and in track order- delivered and rejected both should show no order yet placed.
//btn size same in all, color, used same, --
//in order history, only delivered order should be shown- not pending one.
//basket,bag text similarity huna parxaaa
//checkout page after confirm order- basket should be removed and text like special instuction should be rmeoved,
//location in home page after login-- should get
//various Ongoing orders for that customer- its details should be shown in track order section.
//button color change- of order history inside- one
//product realistic huna paryo, payment gateway halne
//in home page ma----image ma focus garne high quality wala jun chai scroll huna milne banaune
//offline online ko satto ma close open rakhne in customer page
//add note add garni--for each product,
//picture ma click garda pani add garna parxa

//image scrollable-, search btn chai location ko side ma..
//plus - huna paryo--
//color change garne--
//checkout garepaxi matra login wala garna paryoo-
//notification ma numbering halne--
//aja bhyauxu sab yeskoooo realistic product xa ki nai herxu.