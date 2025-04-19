// components/Heatmap.tsx
'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import 'leaflet.heat'   // adds L.heatLayer

interface HeatmapProps {
  /** [lat, lng, intensity] */
  points: [number, number, number][]
  radius?: number
  blur?: number
  maxZoom?: number
}

export function Heatmap({
  points,
  radius = 25,
  blur = 15,
  maxZoom = 17,
}: HeatmapProps) {
  const map = useMap()

  useEffect(() => {
    // @ts-ignore
    const layer = (window as any).L.heatLayer(points, {
      radius,
      blur,
      maxZoom,
      // lighter “sunrise” gradient
      minOpacity: 0.2,
      max: 1.0,
      gradient: {
        0.0: 'rgba(0,0,0,0)',
        0.2: '#ADD8E6',  // light blue
        0.4: '#87CEFA',  // sky blue
        0.6: '#FFFF99',  // light yellow
        0.8: '#FFCC66',  // soft orange
        1.0: '#FF6666',  // light red
      },
    })
    layer.addTo(map)
    return () => {
      map.removeLayer(layer)
    }
  }, [map, points, radius, blur, maxZoom])

  return null
}
