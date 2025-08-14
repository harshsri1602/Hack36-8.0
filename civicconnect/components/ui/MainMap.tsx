"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import React from "react";

export default function MainMap() {
    useEffect(() => {
        setTimeout(() => {
            window.dispatchEvent(new Event("resize"));
        }, 200);
    }, []);

    return (
        <MapContainer
            center={[28.609842646718608, 77.21054077148439]}
            zoom={13}
            className="w-full h-full"
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
        </MapContainer>
    );
}
