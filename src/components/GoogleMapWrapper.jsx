import React, { useEffect, useRef } from "react";

function GoogleMapWrapper({ places = [], apiKey }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!apiKey || !window.google || !places.length) return;

    const map = new window.google.maps.Map(mapRef.current, {
      mapId: "1f737787d97f06a27291683a",
    });

    const geocoder = new window.google.maps.Geocoder();
    const bounds = new window.google.maps.LatLngBounds(); // bounding box to fit all markers

    let processed = 0;

    places.forEach((place) => {
      geocoder.geocode({ address: place }, (results, status) => {
        processed++;

        if (status === "OK" && results[0]) {
          const { location } = results[0].geometry;
          const { AdvancedMarkerElement } = window.google.maps.marker;

          new AdvancedMarkerElement({
            map,
            position: location,
            title: place,
          });

          bounds.extend(location);
        } else {
          console.error("Geocode failed for:", place, "Status:", status);
        }

        // Once all places are processed, fit bounds
        if (processed === places.length) {
          if (places.length === 1) {
            map.setCenter(bounds.getCenter());
            map.setZoom(12); // closer zoom for single location
          } else {
            map.fitBounds(bounds); // fits all markers
          }
        }
      });
    });
  }, [places, apiKey]);

  return <div ref={mapRef} style={{ height: "500px", width: "100%" }} />;
}

export default GoogleMapWrapper;
