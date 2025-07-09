import img from "../../assets/images/logo.png";
import Header from "../../core/roles/restaurant/header";
export default function HelpCenter() {
  return (
    <div className="min-h-screen  text-black">
      <Header active="Profile" />

      <div className="max-w-xl mx-auto px-6 py-12 text-center bg-white rounded-xl shadow  mt-36">
        {/* Logo and Brand */}
        <div>
          <img
            src={img}
            alt="Delivo-Eats"
            className="w-32 mx-auto mb-2"
          />
     
        </div>

        {/* Contact Info */}
        <div className="">
          <p className="font-semibold text-left text-sm">Contact Us at below numbers if any problem arises with your order with Delivo-Eats:</p>
          <div className="text-left text-blue-600 space-y-1 mt-2 underline text-sm">
            <p><a href="tel:+9779841450951">+977-9841450951</a></p>
            <p><a href="tel:+9779843363248">+977-9843363248</a></p>
            <p><a href="tel:+9779851097241">+977-9851097241</a></p>
          </div>
        </div>

        <h1 className="text-sm text-start mt-5 font-semibold "> Email Us: </h1>
        <p className="text-sm text-start text-gray-600 ">delivoeats@gmail.com</p>
       
      </div>
    </div>
  );
}
