"use client";
import React from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { MapOptions, Icon } from "leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { timeAgo } from "@/lib/utils";
import { Post } from "@/types/post";

interface DashboardMapProps {
    locations: Post[];
}

const DashboardMap: React.FC<DashboardMapProps> = ({ locations }) => {
    const mapOptions: MapOptions = {
        center: [28.609842646718608, 77.21054077148439],
        zoom: 13,
    };
    const customIcon = new Icon({
        iconUrl: "/marker.png",
        iconSize: [38, 38],
    });
    return (
        <div className="h-[250px] w-full">
            <MapContainer {...mapOptions} className="h-full w-full">
                <TileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png" />
                <MarkerClusterGroup>
                    {locations.length > 0 &&
                        locations.map((location, index) => (
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
                                            {location.title}
                                        </div>
                                        {timeAgo(location.post_date)}
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    );
};

export default DashboardMap;
