"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

interface HeatmapProps {
    points: [number, number, number][];
    radius?: number;
    blur?: number;
    maxZoom?: number;
}

export function Heatmap({
    points,
    radius = 25,
    blur = 15,
    maxZoom = 17,
}: HeatmapProps) {
    const map = useMap();

    useEffect(() => {
        // Filter out invalid coordinates
        const validPoints = points.filter(
            ([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng)
        );

        if (!validPoints.length) return;

        let layer: L.HeatLayer;

        const addHeatLayer = () => {
            // Remove old layer if any
            if (layer) map.removeLayer(layer);

            layer = L.heatLayer(validPoints, {
                radius,
                blur,
                maxZoom,
                minOpacity: 0.2,
                gradient: {
                    0.0: "rgba(0,0,0,0)",
                    0.2: "#ADD8E6",
                    0.4: "#87CEFA",
                    0.6: "#FFFF99",
                    0.8: "#FFCC66",
                    1.0: "#FF6666",
                },
            });

            layer.addTo(map);
        };

        // If map is already loaded, add heatmap immediately
        if (map._loaded) {
            addHeatLayer();
        } else {
            map.once("load", addHeatLayer);
        }

        return () => {
            if (layer) map.removeLayer(layer);
            map.off("load", addHeatLayer);
        };
    }, [map, points, radius, blur, maxZoom]);

    return null;
}
