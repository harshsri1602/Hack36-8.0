"use client";
import React from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { MapOptions, Icon } from "leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

interface Location {
    title: string;
    latitude: number;
    longitude: number;
}

interface DashboardMapProps {
    locations: Location[];
}

const DashboardMap: React.FC<DashboardMapProps> = ({ locations }) => {
    console.log(locations);
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
                        locations.map((location) => (
                            <Marker
                                key={location.title}
                                position={[
                                    location.latitude,
                                    location.longitude,
                                ]}
                                icon={customIcon}
                            >
                                <Popup>{location.title}</Popup>
                            </Marker>
                        ))}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    );
};

export default DashboardMap;
