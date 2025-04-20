// components/ui/user/MapWidget.tsx
"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer } from "react-leaflet";
import { Heatmap } from "./Heatmap";

export interface ApiPost {
    _id: string;
    latitude: number;
    longitude: number;
    weightedSeverity?: number;
}

interface MapWidgetProps {
    posts: ApiPost[];
}

export default function MapWidget({ posts }: MapWidgetProps) {
    // build your heatmap data from the posts array
    const HEAT_DATA: [number, number, number][] = posts.map((p) => [
        p.latitude,
        p.longitude,
        // you can use weightedSeverity or fall back to e.g. 0.5
        p.weightedSeverity ?? 0.5,
    ]);
    // center on the first post (or fallback to your Delhi default)
    const center: [number, number] = posts.length
        ? [posts[0].latitude, posts[0].longitude]
        : [28.6139, 77.209];

    return (
        <div className="flex justify-center py-8 pt-0">
            <div className="w-full max-w-4xl h-96">
                <MapContainer
                    center={center}
                    zoom={11}
                    className="h-full w-full rounded-md shadow-lg"
                >
                    <TileLayer
                        url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                        attribution={`
              &copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, 
              &copy; <a href="https://www.openstreetmap.org/">OSM</a>
            `}
                    />
                    <Heatmap
                        points={HEAT_DATA}
                        radius={25}
                        blur={15}
                        maxZoom={15}
                    />
                </MapContainer>
            </div>
        </div>
    );
}
