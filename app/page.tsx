"use client";
import { MeridianWrapper } from "@meridian-ui/meridian";
import { MeridianOverview } from "@meridian-ui/meridian";
import restuarntsData from "../data/restaurant-details.json";
import { restaurantODI } from "@/views/restaurantsODI";

import { database } from '../lib/firebase';
import { ref, get } from 'firebase/database';
import { useEffect, useState } from 'react';
import '@meridian-ui/meridian/dist/meridian.css';
import { restaurantConfig } from "@/views/restuarantsConfig";
import { Pagnation } from "./components/Pagnation";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Menu } from "./components/Menu";
import { Button } from "./components/Button";

// fetch and transform data from Firebase
async function fetchRestaurantData() {
  try {
    const dbRef = ref(database, '/'); // root path
    const snapshot = await get(dbRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      
      // Convert object with numeric keys to array
      const restaurantsArray = Object.keys(data)
        .sort((a, b) => Number(a) - Number(b)) // sort by numeric key
        .map(key => data[key]);
      
      return restaurantsArray;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching restaurant data:', error);
    return [];
  }
}

export default function Home() {
  const [restaurantsData, setRestaurantsData] = useState(restuarntsData); // fallback to JSON
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('JSON'); // track data source

  useEffect(() => {
    console.log("1. Initial data source: JSON file (fallback)");
    console.log("2. Initial data count:", restuarntsData.length);
    
    fetchRestaurantData()
      .then(data => {
        if (data.length > 0) {
          setRestaurantsData(data);
          setDataSource('Firebase');
          console.log("1. Successfully loaded from Firebase!");
          console.log("2. Firebase data count:", data.length);
          console.log("3. Firebase data sample:", data[0]);
        } else {
          console.log("⚠️ Firebase returned empty data, using JSON fallback");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('FAILED to load from Firebase, using JSON fallback:', err);
        setLoading(false);
      });
  }, []);

  // log current data source when it changes
  useEffect(() => {
    console.log(`!!! Current data source: ${dataSource}`);
  }, [dataSource]);

  return (
    <section id="homePage">
      <Navbar/>
      <Menu/>
      <div className='text-amber-950 font-["Trebuchet MS"] p-2'>
        <div className="ml-[1%]">
          <div className="flex justify-between">
            <p className="text-sm">Asia <i className="ri-arrow-right-s-line"></i> South Korea <i className="ri-arrow-right-s-line"></i> Busan <i className="ri-arrow-right-s-line"></i> Busan Restaurants</p>
            <p className="text-sm">Top Restaurants in Busan</p>
          </div>
          <h1 className="text-4xl font-bold mt-5">Restaurants in Busan</h1>
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold mt-5 mb-10">
              Top restaurants in Busan
              {loading && <span className="text-sm ml-2">(Loading...)</span>}
            </h2>
            <Button/>
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
          <Pagnation/>
        </div>
      </div>
      <Footer/>
    </section>
  );
}