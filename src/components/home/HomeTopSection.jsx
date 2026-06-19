"use client";

import React, { useState } from "react";
import HomeHero from "./HomeHero";
import NearYouStats from "./NearYouStats";

export default function HomeTopSection() {
  const [userLocation, setUserLocation] = useState(null);

  return (
    <>
      <HomeHero userLocation={userLocation} setUserLocation={setUserLocation} />
      <NearYouStats userLocation={userLocation} />
    </>
  );
}
