import React from "react";
import "./App.css";
import Hero from "./components/custom/Hero";
import CreateTrip from "./create-trip";
import ViewTrip from "./view-trip/[tripid]";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LoadScript } from "@react-google-maps/api";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Hero />,
  },
  {
    path: "/create-trip",
    element: <CreateTrip />,
  },
  {
    path: "/view-trip/:tripid",
    element: <ViewTrip />,
  },
]);

function App() {
  return (
    <>
      <LoadScript
        googleMapsApiKey={import.meta.env.VITE_TRIP_API_KEY}
        libraries={["marker"]}
      >
        <RouterProvider router={router} />
      </LoadScript>
    </>
  );
}

export default App;
