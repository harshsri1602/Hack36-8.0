"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import React from "react";
import { toast } from "sonner";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { Icon, MapOptions } from "leaflet";
import { timeAgo } from "@/lib/utils";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { Post } from "@/types/post";

export default function MainMap() {
    const [posts, setPosts] = useState<Post[]>([]);
    useEffect(() => {
        const getPosts = async () => {
            try {
                const res = await fetch(
                    "http://localhost:8000/api/v1/user/viewAll",
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );
                const data = await res.json();
                if (!res.ok) {
                    throw new Error("Failed to fetch posts");
                }
                setPosts(data.posts);
                console.log(data);
            } catch (error) {
                if (error instanceof Error) {
                    toast.error("Network Error", {
                        description: error.message || "Something went Wrong",
                    });
                }
            }
        };
        getPosts();
    }, []);

    useEffect(() => {
        setTimeout(() => {
            window.dispatchEvent(new Event("resize"));
        }, 200);
    }, []);

    const customIcon = new Icon({
        iconUrl: "/marker.png",
        iconSize: [38, 38],
    });

    const mapOptions: MapOptions = {
        center: [28.609842646718608, 77.21054077148439],
        zoom: 13,
    };

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
            <MarkerClusterGroup>
                {posts.length > 0 &&
                    posts.map((location, index) => (
                        <Marker
                            key={index}
                            position={[
                                location.latitude || 0,
                                location.longitude || 0,
                            ]}
                            icon={customIcon}
                        >
                            <Popup>
                                <div className="flex flex-col">
                                    <div className="font-bold">
                                        {location.title} ({location.pincode})
                                    </div>
                                    {timeAgo(location.post_date)}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
            </MarkerClusterGroup>
        </MapContainer>
    );
}
