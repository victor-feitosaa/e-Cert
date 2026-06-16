import { useState } from "react";
import Sidebar from "./Sidebar";
import MyEvents from "./sections/MyEvents.jsx";
import Participating from "./sections/Participating.jsx";
import MyCertificates from "../components/sections/MyCertificates.jsx";
import ExploreEvents from "./sections/ExploreEvents.jsx";

export default function Dashboard({ userDataStr, eventsDataStr }) {
  const userData = JSON.parse(userDataStr);
  const eventsData = JSON.parse(eventsDataStr);

  const [activeTab, setActiveTab] = useState("meus-eventos");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const CONTENT_MAP = {
    "meus-eventos": (
      <MyEvents userData={userData} eventsData={eventsData} />
    ),
    "participando": <Participating />,
    "certificados": <MyCertificates />,
    "explorar": <ExploreEvents />,
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <main className="flex-1 lg:ml-64">
        {CONTENT_MAP[activeTab]}
      </main>
    </div>
  );
}