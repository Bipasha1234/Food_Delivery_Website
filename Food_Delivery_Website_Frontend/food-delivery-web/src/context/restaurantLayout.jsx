import { Outlet, useParams } from "react-router-dom";
import Header from "../core/roles/restaurant/header";

export default function RestaurantLayout() {
  const { restaurantId } = useParams();

  return (
    <>
      <Header restaurantId={restaurantId} />
      <main>
        <Outlet />
      </main>
    </>
  );
}
