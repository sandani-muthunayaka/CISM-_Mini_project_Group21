import { Outlet } from "react-router-dom";
import SideBar from "./functions/SideBar";

export default function App() {
  return (
    <div className="min-h-screen max-h-screen flex">
      <SideBar />
      <div className="md:w-full w-full max-h-screen overflow-y-auto mt-16">
        <div>
          <p className="text-2xl font-bold text-gray-900 bg-orange-500 py-3 px-6  w-fit">
            {/* <RxHamburgerMenu className="block md:hidden translate-y-[2px] text-white cursor-pointer" /> */}
            Tittle goes here
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
