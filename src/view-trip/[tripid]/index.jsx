import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { db } from "@/service/FirebaseConfig";
import InfoSection from "../components/InfoSection";
import Hotels from "../components/Hotels";
import Dailyplan from "../components/Dailyplan";
import GoogleMapWrapper from "@/components/GoogleMapWrapper";
import { GoogleGenerativeAI } from "@google/generative-ai";

function ViewTrip() {
  const [tripData, setTripData] = useState(null);
  const [cities, setCities] = useState([]); // <- Track extracted cities
  const { tripid } = useParams();

  const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY;
  const TRIP_API_KEY = import.meta.env.VITE_TRIP_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const generationConfig = {
    temperature: 0.5,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  };

  const extractCitiesWithGemini = async (itineraryObject) => {
    const chat = model.startChat({
      generationConfig,
      history: [],
    });

    const prompt = `
Given the following itinerary JSON object, extract and return ONLY the names of the places (field: "placeName") to visit in all days. 
Remove places including arrival, breakfast, departure.
Return the result as a JSON array of strings without any extra text.

Here is the itinerary JSON:

${JSON.stringify(itineraryObject, null, 2)}
`;

    const result = await chat.sendMessage(prompt);
    const response = await result.response.text();

    try {
      const json = JSON.parse(response);
      console.log("places", json);
      return json;
    } catch (err) {
      console.error("Failed to parse Gemini response:", response);
      return [];
    }
  };

  const getTrip = async () => {
    const docRef = doc(db, "ip-planner", tripid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      setTripData(data);

      // Extract cities after trip data is fetched
      if (data?.tripdata?.itinerary) {
        const cityList = await extractCitiesWithGemini(data.tripdata.itinerary);
        setCities(cityList);
      }
    } else {
      toast({
        title: "No such document found",
        description: "No document found with the trip id : " + tripid,
      });
    }
  };

  useEffect(() => {
    tripid && getTrip();
  }, [tripid]);

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <InfoSection tripInfo={tripData} />
      <Hotels tripInfo={tripData} />
      <Dailyplan tripInfo={tripData} />

      <GoogleMapWrapper places={cities} apiKey={TRIP_API_KEY} />
    </div>
  );
}

export default ViewTrip;
