// app/(user)/map/page.tsx
'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer } from 'react-leaflet'
import { Heatmap } from '@/components/ui/user/Heatmap'

export default function MapPage() {
  // Dummy heatmap points around Delhi
  const HEAT_DATA: [number, number, number][] = [
    [28.6139, 77.2090, 0.8],
    [28.6200, 77.2300, 0.5],
    [28.6200, 77.1800, 0.6],
    [28.6300, 77.2100, 0.7],
    [28.6000, 77.2100, 0.4],
    [28.6500, 77.2500, 0.3],
    [28.5750, 77.1650, 0.2],
    [28.6700, 77.1900, 0.9],
    [28.5600, 77.2400, 0.6],
    [28.6400, 77.1600, 0.5],
  ]

  return (
    <div className="bg-black min-h-screen flex justify-center items-start py-8 px-4">
      <div className="w-full max-w-4xl h-96">
        <MapContainer
          center={[28.6139, 77.2090]}
          zoom={11}
          className="h-full w-full rounded-md shadow-lg"
        >
          <TileLayer
            // Stadia Alidade Smooth Dark raster tiles
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
            attribution={`
              &copy; <a href="https://stadiamaps.com/">Stadia Maps</a> 
              &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>
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
  )
}
