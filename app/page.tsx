"use client";
import { MeridianWrapper, MeridianOverview } from "@meridian-ui/meridian";
import restaurantsData from "../data/restaurant-details.json";
import { restaurantODI } from "@/views/restaurantsODI";
import '@meridian-ui/meridian/dist/meridian.css';
import { restaurantConfig } from "@/views/restuarantsConfig";
import { Pagnation } from "./components/Pagnation";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Menu } from "./components/Menu";
import { Button } from "./components/Button";

export default function Home() {
  return (
    <section id="homePage">
      <Navbar />
      <Menu />
      <div className='text-amber-950 font-["Trebuchet MS"] p-2'>
        <div className="ml-[1%] mt-[-10px]">
          <div className="flex justify-between">
            <p className="text-sm">Asia <i className="ri-arrow-right-s-line"></i> South Korea <i className="ri-arrow-right-s-line"></i> Busan <i className="ri-arrow-right-s-line"></i> Busan Restaurants</p>
            <p className="text-sm">Top Restaurants in Busan</p>
          </div>
          <h1 className="text-4xl font-bold mt-4">Restaurants in Busan</h1>
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold mt-3 mb-5">
              Top restaurants in Busan
            </h2>
            <Button />
          </div>
        </div>

        <MeridianWrapper
          data={restaurantsData}
          odi={{ ...restaurantODI }}
          {...restaurantConfig}
        >
          <MeridianOverview />
        </MeridianWrapper>
        <div className="relative mt-10 mb-10 flex items-center justify-center">
          <Pagnation />
        </div>
      </div>
      <Footer />
    </section>
  );
}
