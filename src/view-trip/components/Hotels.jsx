import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Hotels({ tripInfo }) {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading (replace with real fetch if needed)
    if (tripInfo?.tripdata?.hotelOptions?.length) {
      setHotels(tripInfo.tripdata.hotelOptions);
    } else {
      setHotels([]);
    }
    setLoading(false);
  }, [tripInfo]);

  return (
    <div className="w-full">
      <h2 className="font-bold text-xl mt-5">Hotel Recommendation</h2>

      {loading ? (
        <p className="text-sm text-gray-500 mt-3">Loading hotels...</p>
      ) : hotels.length === 0 ? (
        <p className="text-sm text-gray-500 mt-3">
          No hotels available for this trip.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 mt-2">
          {hotels.map((hotel, index) => (
            <Link
              key={index}
              to={`https://www.google.com/maps/search/?api=1&query=${
                hotel.hotelName + " " + hotel.hotelAddress
              }`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="cursor-pointer hover:shadow-xl hover:scale-105 transition-all rounded-xl p-3 bg-slate-50 border">
                <img
                  className="rounded-xl aspect-video object-cover w-full"
                  src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aG90ZWx8ZW58MHx8MHx8fDA%3D"
                  alt={`Image of ${hotel.hotelName}`}
                />
                <div className="my-3">
                  <h2 className="font-medium">{hotel.hotelName}</h2>
                  <h2 className="font-normal text-sm text-black">
                    {hotel.description}
                  </h2>
                  <h2 className="text-xs text-gray-500 mt-1">
                    📍 {hotel.hotelAddress}
                  </h2>
                  <h2 className="text-xs text-gray-600 mt-1 font-bold">
                    💵 {hotel.currentPriceINR_2Bedroom}
                  </h2>
                  <h2 className="text-xs text-gray-600 mt-1">
                    ⭐ {hotel.rating} stars
                  </h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Hotels;
