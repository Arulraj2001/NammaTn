"use client";

import React, { useState } from "react";
import HomeHero from "./HomeHero";
import NearYouStats from "./NearYouStats";

export default function HomeTopSection({ initialData }) {
  const [userLocation, setUserLocation] = useState(null);

  return (
    <>
      <HomeHero userLocation={userLocation} setUserLocation={setUserLocation} initialData={initialData} />
      <NearYouStats userLocation={userLocation} initialData={initialData} />
    </>
  );
}
