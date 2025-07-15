import React, { useEffect } from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { chatSession } from "@/service/AIModal";
import { Button } from "@/components/ui/button";
import {
  SelectBudgetOptions,
  SelectTravelsList,
  PROMPT,
} from "@/constants/options";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/service/FirebaseConfig";

import { useNavigate } from "react-router-dom";

import { ring2 } from "ldrs";
import TripVisualizerCanvas from "../components/TripVisualizerCanvas.jsx";

function CreateTrip() {
  const [place, setPlace] = React.useState("");

  const [days, setDays] = React.useState("");

  const [formData, setFormData] = React.useState({});

  const { toast } = useToast();

  const [loading, setLoading] = useState(false);

  const router = useNavigate();

  const [openDialog, setOpenDialog] = React.useState(false);
  useEffect(() => {
    ring2.register();

    const getLocation = () => {
      if (!navigator.geolocation) {
        toast({
          variant: "destructive",
          title: "Geolocation not supported",
          description: "Your browser doesn't support Geolocation.",
        });
        return;
      }

      toast({
        title: "Fetching location...",
        description: "Please allow location access.",
      });

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const apiKey = import.meta.env.VITE_OPENCAGE_KEY;
            const res = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`
            );

            const data = await res.json();

            const location =
              data?.results[0]?.components?.city ||
              data?.results[0]?.components?.town ||
              data?.results[0]?.components?.state ||
              data?.results[0]?.formatted ||
              "";

            if (location) {
              setPlace(location);
              handleInputChange("location", location);

              toast({
                title: "Location detected!",
                description: `We filled "${location}" as your location.`,
              });
            } else {
              toast({
                variant: "destructive",
                title: "Location detection failed",
                description: "Could not determine your location name.",
              });
            }
          } catch (err) {
            console.error("Reverse geocoding error:", err);
            toast({
              variant: "destructive",
              title: "Reverse geocoding failed",
              description: "Check your API key or internet connection.",
            });
          }
        },
        (err) => {
          console.error("Geolocation permission error:", err);
          toast({
            variant: "destructive",
            title: "Permission Denied",
            description: "We couldn't access your location.",
          });
        }
      );
    };

    getLocation();
  }, []);

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  let docid;

  const saveTripData = async (tripdata) => {
    try {
      docid = Date.now().toString();
      setLoading(true);
      await setDoc(doc(db, "ip-planner", docid), {
        userSelection: formData,
        tripdata: JSON.parse(tripdata),
        id: docid,
      });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Failed to save trip data:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save trip data. Check the console.",
      });
    }
  };

  const handleFormSubmit = async () => {
    if (
      formData.location &&
      formData.duration_of_trip &&
      formData.budget &&
      formData.travel_with
    ) {
      toast({
        title: "Success",
        description: "Form Submitted Successfully",
      });

      setLoading(true);
      const finalPrompt = PROMPT.replace("{location}", formData?.location)
        .replace("{duration_of_trip}", formData?.duration_of_trip)
        .replace("{budget}", formData?.budget)
        .replace("{travel_with}", formData?.travel_with)
        .replace("{duration_of_trip}", formData?.duration_of_trip);
      const result = await chatSession.sendMessage(finalPrompt);
      console.log(result?.response?.text());
      setLoading(false);
      await saveTripData(result?.response?.text());
      router(`/view-trip/${docid}`);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill all the fields",
      });
    }
  };
  //Rendering the form
  return (
    <div className="sm:px-10 md:px-32 lg:px-56 xl:px-10 mt-10 max-w-4xl mx-auto">
      {/* {loading && <TripVisualizerCanvas destination={formData.location} />} */}
      <h2 className="font-bold text-3xl">
        # Tell us your travel preferences 🏖️
      </h2>
      <p className="mt-3 text-gray-500 text-xl">
        Fill out a quick survey to help us understand your travel preferences
        and requirements. This will help us create a personalized itinerary for
        you.
      </p>
      <div className="mt-10">
        <div>
          <h2 className="text-xl my-3 font-medium">
            What is your Destination of choice
          </h2>
          <Input
            type="text"
            placeholder="Your Destination"
            value={place}
            onChange={(e) => {
              setPlace(e.target.value);
              handleInputChange("location", e.target.value);
            }}
          />
        </div>
      </div>
      <div>
        <h2 className="text-xl my-3 font-medium">Durration of stay: </h2>
        <Input
          type="number"
          placeholder={days ? days : "Eg: 2"}
          onChange={(e) => {
            e.target.value;
            handleInputChange("duration_of_trip", e.target.value);
          }}
        />
      </div>
      <div>
        <h2 className="text-xl my-3 font-medium">What is your budget ?</h2>
        <div className="grid grid-cols-3 gap-5 mt-5">
          {SelectBudgetOptions.map((item, index) => (
            <div
              key={index}
              onClick={() => handleInputChange("budget", item.title)}
              className={`p-4 cursor-pointer border rounded-lg shadow-sm hover:shadow-lg ${
                formData?.budget == item.title && "shadow-lg border-black"
              }`}
            >
              <h2 className="text-4xl ">{item.icon}</h2>
              <h2 className="font-bold text-lg">{item.title}</h2>
              <h2 className="text-sm text-gray-500">{item.desc}</h2>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-xl my-3 font-medium">
          Whome do you plan to travel with
        </h2>
        <div className="grid grid-cols-3 gap-5 mt-5">
          {SelectTravelsList.map((item, index) => (
            <div
              key={index}
              onClick={() => handleInputChange("travel_with", item.title)}
              className={`p-4 cursor-pointer border rounded-lg shadow-sm hover:shadow-lg ${
                formData?.travel_with == item.title && "shadow-lg border-black"
              }`}
            >
              <h2 className="text-4xl ">{item.icon}</h2>
              <h2 className="font-bold text-lg">{item.title}</h2>
              <h2 className="text-sm text-gray-500">{item.desc}</h2>
              <h2 className="text-lg font-bold">{item.people}</h2>
            </div>
          ))}
        </div>
      </div>
      <div className="my-10 flex flex-col items-center">
        <Button
          disabled={loading}
          className="w-full"
          onClick={handleFormSubmit}
        >
          {loading ? (
            <div>
              <l-ring-2
                size="25"
                stroke="3"
                stroke-length="0.25"
                bg-opacity="0.1"
                speed="0.8"
                color="white"
              ></l-ring-2>{" "}
            </div>
          ) : (
            "Generate Trip"
          )}
        </Button>
      </div>
    </div>
  );
}

export default CreateTrip;
