import { useState } from "react";
import Sidebar from "./Sidebar";
import MyEvents from "./sections/MyEvents.jsx";
import Participating from "./sections/Participating.jsx";
import MyCertificates from "../components/sections/MyCertificates.jsx";
import ExploreEvents from "./sections/ExploreEvents.jsx";


export default function Dashboard({ userDataStr, eventsDataStr}) {
  const userData = JSON.parse(userDataStr);
  const eventsData = JSON.parse(eventsDataStr);

  const [activeTab, setActiveTab] = useState("meus-eventos");
  
  const CONTENT_MAP = {
    "meus-eventos":   <MyEvents userData={userData} eventsData={eventsData} />,
    "participando":   <Participating />,
    "certificados":   <MyCertificates />,
    "explorar":       <ExploreEvents />,
  };
  
  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="ml-[16.666%] flex-1">
        {CONTENT_MAP[activeTab]}
      </main>
    </div>
  );
}