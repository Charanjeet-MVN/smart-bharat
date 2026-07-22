"use client";

import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Calendar, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { createRoot } from "react-dom/client";

// Mock Data
export interface HeatmapComplaint {
  id: string;
  title: string;
  category: string;
  department: string;
  priority: "High" | "Medium" | "Low";
  status: string;
  dateSubmitted: Date;
  lat: number;
  lng: number;
}

const NEW_DELHI_CENTER: [number, number] = [28.6139, 77.2090];

// Custom icon creator function
const createCustomIcon = (priority: string) => {
  let color = "#10b981"; // Green (Low)
  if (priority === "High") color = "#ef4444"; // Red
  if (priority === "Medium") color = "#f59e0b"; // Amber

  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `
      <div style="
        background-color: ${color};
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
};

interface MapComponentProps {
  complaints: HeatmapComplaint[];
}

export default function MapComponent({ complaints }: MapComponentProps) {
  
  // Fix for default Leaflet icons in Next.js (though we use custom icons)
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  return (
    <MapContainer 
      center={NEW_DELHI_CENTER} 
      zoom={12} 
      className="w-full h-full z-0 rounded-b-2xl md:rounded-r-2xl md:rounded-bl-none"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Simulated Heatmap Layer (Clusters of low opacity circles) */}
      {complaints.map((c) => (
        <CircleMarker
          key={`heat-${c.id}`}
          center={[c.lat, c.lng]}
          radius={30}
          pathOptions={{
            color: c.priority === "High" ? "#ef4444" : c.priority === "Medium" ? "#f59e0b" : "#10b981",
            fillColor: c.priority === "High" ? "#ef4444" : c.priority === "Medium" ? "#f59e0b" : "#10b981",
            fillOpacity: 0.15,
            stroke: false,
          }}
        />
      ))}

      {/* Actual Markers */}
      {complaints.map((complaint) => (
        <Marker 
          key={complaint.id} 
          position={[complaint.lat, complaint.lng]}
          icon={createCustomIcon(complaint.priority)}
        >
          <Popup className="custom-popup">
            <div className="p-1 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  #{complaint.id}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  complaint.priority === 'High' ? 'bg-red-100 text-red-700' :
                  complaint.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {complaint.priority}
                </span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm leading-tight mb-2">
                {complaint.title}
              </h3>
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> {complaint.category} • {complaint.department}
              </p>
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3" /> Status: <span className="font-semibold text-slate-700">{complaint.status}</span>
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> {format(complaint.dateSubmitted, 'MMM d, yyyy')}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
