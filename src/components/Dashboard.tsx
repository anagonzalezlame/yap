/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Compass, 
  MapPin, 
  Search, 
  Filter, 
  Info, 
  Anchor, 
  Clock, 
  Navigation2, 
  History, 
  Activity, 
  RefreshCw, 
  Locate,
  Cpu
} from 'lucide-react';
import { Ship, ShipType, RecentTransit } from '../types';

// Coordinates
const CENTER_LAT = -34.920630;
const CENTER_LNG = -56.229045;
const RADIUS_M = 1000;

// Flag dictionary
const FLAGS: Record<string, { icon: string; name: string }> = {
  'UY': { icon: '🇺🇾', name: 'Uruguay' },
  'PA': { icon: '🇵🇦', name: 'Panamá' },
  'LR': { icon: '🇱🇷', name: 'Liberia' },
  'BS': { icon: '🇧🇸', name: 'Bahamas' },
  'AR': { icon: '🇦🇷', name: 'Argentina' },
  'BR': { icon: '🇧🇷', name: 'Brasil' },
  'UK': { icon: '🇬🇧', name: 'Reino Unido' }
};

// Initial base mock ships
const INITIAL_MOCK_SHIPS: Ship[] = [
  {
    id: 'B1',
    name: 'ROU 04 ARTIGAS',
    type: 'PESQUERO',
    flagCode: 'UY',
    flag: 'Uruguay',
    mmsi: '770123456',
    speed: 3.5,
    heading: 210,
    lastPosTime: 'hace 10s',
    nextPort: 'Montevideo, UY',
    coordinates: [-34.920100, -56.229300],
    length: 88, width: 14, draft: 5.2,
    callSign: 'CXP4',
    imageUrl: '⚓',
    trail: [
      [-34.919400, -56.228900],
      [-34.919800, -56.229100],
      [-34.920100, -56.229300]
    ],
    insideZone: true,
    closestDistance: 82
  },
  {
    id: 'B2',
    name: 'ATLANTIC ACORD',
    type: 'CARGO',
    flagCode: 'LR',
    flag: 'Liberia',
    mmsi: '636018341',
    speed: 5.2,
    heading: 45,
    lastPosTime: 'hace 25s',
    nextPort: 'Santos, BR',
    coordinates: [-34.921200, -56.228500],
    length: 220, width: 32, draft: 11.5,
    callSign: 'A8XI3',
    imageUrl: '🚢',
    trail: [
      [-34.922400, -56.229700],
      [-34.921800, -56.229100],
      [-34.921200, -56.228500]
    ],
    insideZone: true,
    closestDistance: 110
  },
  {
    id: 'B3',
    name: 'CELESTE III',
    type: 'YATE',
    flagCode: 'UY',
    flag: 'Uruguay',
    mmsi: '770987654',
    speed: 1.8,
    heading: 120,
    lastPosTime: 'hace 5s',
    nextPort: 'Punta del Este, UY',
    coordinates: [-34.920500, -56.229800],
    length: 24, width: 6, draft: 2.1,
    callSign: 'CX7254',
    imageUrl: '⛵',
    trail: [
      [-34.920300, -56.230400],
      [-34.920400, -56.230100],
      [-34.920500, -56.229800]
    ],
    insideZone: true,
    closestDistance: 68
  },
  {
    id: 'B4',
    name: 'PUNTA ANCONA',
    type: 'TANKER',
    flagCode: 'PA',
    flag: 'Panamá',
    mmsi: '354897000',
    speed: 10.4,
    heading: 315,
    lastPosTime: 'hace 45s',
    nextPort: 'Buenos Aires, AR',
    coordinates: [-34.922500, -56.227200],
    length: 183, width: 28, draft: 9.8,
    callSign: 'HP3948',
    imageUrl: '⛽',
    trail: [
      [-34.924200, -56.225500],
      [-34.923400, -56.226300],
      [-34.922500, -56.227200]
    ],
    insideZone: false,
    closestDistance: 270
  },
  {
    id: 'B5',
    name: 'KAPITAN REEFER',
    type: 'CARGO',
    flagCode: 'BS',
    flag: 'Bahamas',
    mmsi: '311000245',
    speed: 12.1,
    heading: 180,
    lastPosTime: 'hace 2m',
    nextPort: 'Recife, BR',
    coordinates: [-34.918200, -56.229500],
    length: 145, width: 22, draft: 7.5,
    callSign: 'C6UY8',
    imageUrl: '❄',
    trail: [
      [-34.915200, -56.229500],
      [-34.916700, -56.229500],
      [-34.918200, -56.229500]
    ],
    insideZone: false,
    closestDistance: 280
  },
  {
    id: 'B6',
    name: 'ISLA DE FLORES',
    type: 'PESQUERO',
    flagCode: 'UY',
    flag: 'Uruguay',
    mmsi: '770246810',
    speed: 4.8,
    heading: 85,
    lastPosTime: 'hace 1m',
    nextPort: 'Montevideo, UY',
    coordinates: [-34.922100, -56.231200],
    length: 42, width: 9, draft: 4.0,
    callSign: 'CXF20',
    imageUrl: '🐠',
    trail: [
      [-34.922200, -56.232400],
      [-34.922150, -56.231800],
      [-34.922100, -56.231200]
    ],
    insideZone: false,
    closestDistance: 260
  },
  {
    id: 'B7',
    name: 'ALDEBARAN',
    type: 'YATE',
    flagCode: 'AR',
    flag: 'Argentina',
    mmsi: '440112233',
    speed: 6.5,
    heading: 240,
    lastPosTime: 'hace 15s',
    nextPort: 'Colonia, UY',
    coordinates: [-34.919100, -56.226800],
    length: 18, width: 5, draft: 1.8,
    callSign: 'LW2940',
    imageUrl: '⛵',
    trail: [
      [-34.918100, -56.225100],
      [-34.918600, -56.226000],
      [-34.919100, -56.226800]
    ],
    insideZone: false,
    closestDistance: 270
  }
];

export default function Dashboard({ 
  searchQuery = '', 
  typeFilter = 'TODOS' 
}: { 
  searchQuery?: string; 
  typeFilter?: string; 
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const polylinesRef = useRef<Record<string, L.Polyline>>({});
  
  // State variables
  const [ships, setShips] = useState<Ship[]>(INITIAL_MOCK_SHIPS);
  const [selectedShipId, setSelectedShipId] = useState<string | null>(null);
  const [totalToday, setTotalToday] = useState(138);
  const [recentTransits, setRecentTransits] = useState<RecentTransit[]>([
    { id: 'TR1', name: 'ROU 04 ARTIGAS', type: 'PESQUERO', timeInZone: 'Hace 2m', closestDistance: 82 },
    { id: 'TR2', name: 'CELESTE III', type: 'YATE', timeInZone: 'Hace 12m', closestDistance: 68 },
    { id: 'TR3', name: 'ATLANTIC ACORD', type: 'CARGO', timeInZone: 'Hace 38m', closestDistance: 110 },
    { id: 'TR4', name: 'MONTEVIDEO EXPRESS', type: 'CARGO', timeInZone: 'Hace 1.5h', closestDistance: 145 },
    { id: 'TR5', name: 'REGINA MARIS', type: 'YATE', timeInZone: 'Hace 3h', closestDistance: 12 }
  ]);

  // Real-Time AIS WebSocket states
  const [useRealTime, setUseRealTime] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('aisstream_api_key') || (import.meta as any).env?.VITE_AISSTREAM_API_KEY || '';
  });
  const [wsStatus, setWsStatus] = useState<'offline' | 'connecting' | 'online' | 'error'>('offline');
  const [wsError, setWsError] = useState<string | null>(null);

  // Helper to map raw AIS ship types to our application types
  const mapAisShipType = (typeNum: number): ShipType => {
    if (typeNum === 30 || (typeNum >= 31 && typeNum <= 35) || typeNum === 55) return 'PESQUERO';
    if (typeNum === 36 || typeNum === 37) return 'YATE';
    if (typeNum >= 80 && typeNum <= 89) return 'TANKER';
    return 'CARGO';
  };

  useEffect(() => {
    if (!useRealTime || !apiKey) {
      setWsStatus('offline');
      return;
    }

    setWsStatus('connecting');
    setWsError(null);

    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;
    let active = true;

    const connect = () => {
      try {
        ws = new WebSocket("wss://stream.aisstream.io/ws");

        ws.onopen = () => {
          if (!active) return;
          setWsStatus('online');
          
          // Bounding box for 1 km around CENTER_LAT, CENTER_LNG
          const deltaLat = 1000 / 111000;
          const deltaLng = 1000 / (111000 * Math.cos(CENTER_LAT * Math.PI / 180));
          
          const subscriptionMessage = {
            APIKey: apiKey,
            BoundingBoxes: [[
              [CENTER_LAT - deltaLat * 1.5, CENTER_LNG - deltaLng * 1.5],
              [CENTER_LAT + deltaLat * 1.5, CENTER_LNG + deltaLng * 1.5]
            ]],
            FiltersShipDecoders: [1, 2, 3, 5, 18, 19, 21]
          };
          
          ws.send(JSON.stringify(subscriptionMessage));
        };

        ws.onmessage = (event) => {
          if (!active) return;
          try {
            const aisMessage = JSON.parse(event.data);
            const metaData = aisMessage.MetaData;
            if (!metaData) return;

            const mmsiStr = String(metaData.MMSI);
            const { Latitude, Longitude, ShipName, ShipType: rawShipType } = metaData;
            
            const distance = getHaversineDistance(CENTER_LAT, CENTER_LNG, Latitude, Longitude);
            const isInside = distance <= RADIUS_M;
            const mappedType = mapAisShipType(rawShipType || 70);
            
            let speed = 5.0;
            let heading = 0;
            const posReport = aisMessage.Message?.PositionReport;
            if (posReport) {
              speed = posReport.Sog || 5.0;
              heading = posReport.Cog || 0;
            }

            setShips(prevShips => {
              const existingIndex = prevShips.findIndex(s => s.mmsi === mmsiStr);
              const nextCoords: [number, number] = [Latitude, Longitude];
              
              let updatedShips = [...prevShips];
              
              if (existingIndex >= 0) {
                const oldShip = prevShips[existingIndex];
                const nextTrail = [...oldShip.trail, nextCoords].slice(-8);
                
                if (!oldShip.insideZone && isInside) {
                  setTotalToday(t => t + 1);
                  setRecentTransits(prevList => {
                    const newList: RecentTransit[] = [
                      {
                        id: 'TR_' + Date.now() + '_' + oldShip.id + '_' + Math.random().toString(36).substring(2, 7),
                        name: oldShip.name,
                        type: oldShip.type,
                        timeInZone: 'Hace 0s',
                        closestDistance: Math.round(distance)
                      },
                      ...prevList
                    ];
                    return newList.slice(0, 5);
                  });
                }

                updatedShips[existingIndex] = {
                  ...oldShip,
                  coordinates: nextCoords,
                  trail: nextTrail,
                  speed: speed || oldShip.speed,
                  heading: heading || oldShip.heading,
                  insideZone: isInside,
                  closestDistance: distance,
                  lastPosTime: 'hace unos instantes'
                };
              } else {
                const newShipId = 'LIVE_' + mmsiStr;
                
                if (isInside) {
                  setTotalToday(t => t + 1);
                  setRecentTransits(prevList => {
                    const newList: RecentTransit[] = [
                      {
                        id: 'TR_' + Date.now() + '_' + newShipId + '_' + Math.random().toString(36).substring(2, 7),
                        name: ShipName?.trim() || `MMSI ${mmsiStr}`,
                        type: mappedType,
                        timeInZone: 'Hace 0s',
                        closestDistance: Math.round(distance)
                      },
                      ...prevList
                    ];
                    return newList.slice(0, 5);
                  });
                }

                const newShip: Ship = {
                  id: newShipId,
                  name: ShipName?.trim() || `MMSI ${mmsiStr}`,
                  type: mappedType,
                  flag: 'Internacional',
                  flagCode: 'UN',
                  mmsi: mmsiStr,
                  speed: speed,
                  heading: heading,
                  lastPosTime: 'hace unos instantes',
                  nextPort: 'Montevideo, UY',
                  coordinates: nextCoords,
                  trail: [[Latitude - 0.001, Longitude - 0.001], nextCoords],
                  imageUrl: mappedType === 'PESQUERO' ? '🐠' : mappedType === 'YATE' ? '⛵' : '🚢',
                  insideZone: isInside,
                  length: 120,
                  width: 18,
                  draft: 5.0,
                  callSign: 'LIVE' + mmsiStr.substring(0, 4),
                  closestDistance: distance
                };
                
                updatedShips.push(newShip);
              }
              
              return updatedShips;
            });
            
          } catch (e) {
            console.error("Error parsing AISStream message:", e);
          }
        };

        ws.onerror = (err) => {
          if (!active) return;
          console.error("AISStream WebSocket error:", err);
          setWsStatus('error');
          setWsError("Error de conexión. Verifique su API Key.");
        };

        ws.onclose = () => {
          if (!active) return;
          setWsStatus('connecting');
          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch (err: any) {
        if (!active) return;
        setWsStatus('error');
        setWsError(err.message || "Error al conectar.");
      }
    };

    connect();

    return () => {
      active = false;
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [useRealTime, apiKey]);

  // Haversine formula
  const getHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Map
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true
    }).setView([CENTER_LAT, CENTER_LNG], 15);

    mapRef.current = map;

    // Dark vector chart styling filter applied to standard OSM
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Apply CSS filters to OSM layer for that stunning dark marine radar map aesthetic
    tileLayer.on('tileload', (e) => {
      const img = e.tile;
      img.style.filter = 'invert(100%) hue-rotate(180deg) brightness(50%) contrast(140%) saturate(60%)';
    });

    // Add 1 km zone circle
    const zoneCircle = L.circle([CENTER_LAT, CENTER_LNG], {
      radius: RADIUS_M,
      color: '#e2e8f0',
      weight: 1.5,
      fillColor: '#334155',
      fillOpacity: 0.25,
      dashArray: '5, 8'
    }).addTo(map);

    const circleElement = zoneCircle.getElement();
    if (circleElement) {
      circleElement.classList.add('detection-zone-pulse');
    }

    // Add Antenna / Observer window marker
    const antennaIcon = L.divIcon({
      className: 'antenna-marker-container',
      html: `
        <div class="relative flex items-center justify-center radar-pulse">
          <div class="w-4 h-4 rounded-full bg-[#e2e8f0] border border-[#0f172a] z-10"></div>
          <div class="absolute w-8 h-8 rounded-full bg-[#e2e8f0]/30 animate-ping"></div>
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    L.marker([CENTER_LAT, CENTER_LNG], { icon: antennaIcon })
      .addTo(map)
      .bindPopup(`
        <div class="p-1 font-mono text-xs text-cream-soft">
          <strong class="text-sand-warm block uppercase tracking-wider font-display text-sm">Mi Ventana Receptor</strong>
          <span class="opacity-60">Lat: ${CENTER_LAT.toFixed(6)}</span><br/>
          <span class="opacity-60">Lng: ${CENTER_LNG.toFixed(6)}</span><br/>
          <span class="text-terracotta font-bold">ZONA ACTIVA: 1 km</span>
        </div>
      `);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers and trails when ships list changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Filter active ships visually based on search and dropdown filters
    ships.forEach(ship => {
      const matchesSearch = ship.name.toUpperCase().includes(searchQuery.toUpperCase()) || ship.mmsi.includes(searchQuery);
      const matchesType = typeFilter === 'TODOS' || ship.type === typeFilter;
      const isVisible = matchesSearch && matchesType;

      // 1. Draw/Update Trail
      if (ship.trail && ship.trail.length > 1) {
        const trailColor = ship.insideZone ? '#e2e8f0' : '#38bdf8';
        const trailWeight = ship.insideZone ? 2.5 : 1.5;
        const trailOpacity = ship.insideZone ? 0.75 : 0.45;

        if (polylinesRef.current[ship.id]) {
          const polyline = polylinesRef.current[ship.id];
          polyline.setLatLngs(ship.trail as L.LatLngExpression[]);
          polyline.setStyle({ color: trailColor, weight: trailWeight, opacity: trailOpacity });
          
          if (isVisible) {
            polyline.addTo(map);
          } else {
            polyline.remove();
          }
        } else {
          const polyline = L.polyline(ship.trail as L.LatLngExpression[], {
            color: trailColor,
            weight: trailWeight,
            opacity: trailOpacity,
            dashArray: '3, 4',
            className: 'glow-trail'
          });
          
          if (isVisible) {
            polyline.addTo(map);
          }
          polylinesRef.current[ship.id] = polyline;
        }
      }

      // 2. Icon Properties
      let colorClass = 'text-cyan-400';
      let bgClass = 'bg-[#1e293b]';
      let symbol = 'C';

      if (ship.type === 'CARGO') {
        colorClass = 'text-blue-500';
        bgClass = 'bg-blue-950/40';
        symbol = 'C';
      } else if (ship.type === 'TANKER') {
        colorClass = 'text-red-500';
        bgClass = 'bg-red-950/40';
        symbol = 'T';
      } else if (ship.type === 'PESQUERO') {
        colorClass = 'text-green-500';
        bgClass = 'bg-green-950/40';
        symbol = 'P';
      } else if (ship.type === 'YATE') {
        colorClass = 'text-yellow-500';
        bgClass = 'bg-yellow-950/40';
        symbol = 'Y';
      }

      const borderClass = ship.insideZone 
        ? 'border-2 border-sand-warm shadow-[0_0_12px_rgba(226,232,240,0.6)] animate-pulse' 
        : 'border border-white/25';

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer">
          <div class="w-8 h-8 rounded-full ${bgClass} ${borderClass} flex items-center justify-center flex-shrink-0">
            <svg style="transform: rotate(${ship.heading}deg);" class="w-6 h-6 ${colorClass} transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polygon points="12,2 19,21 12,17 5,21" fill="currentColor" fill-opacity="0.2"/>
            </svg>
          </div>
          <span class="absolute -bottom-1 -right-1 bg-black text-[7px] border border-white/10 px-0.5 rounded font-mono font-bold text-white">${symbol}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'marcador-barco-contenedor',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      // 3. Draw/Update Marker
      if (markersRef.current[ship.id]) {
        const marker = markersRef.current[ship.id];
        marker.setLatLng(ship.coordinates as L.LatLngExpression);
        marker.setIcon(customIcon);
        
        if (isVisible) {
          marker.addTo(map);
        } else {
          marker.remove();
        }
      } else {
        const marker = L.marker(ship.coordinates as L.LatLngExpression, { icon: customIcon })
          .on('click', () => {
            setSelectedShipId(ship.id);
            // Center camera with tiny offset
            map.panTo([ship.coordinates[0] - 0.0003, ship.coordinates[1]], { animate: true });
          });
        
        if (isVisible) {
          marker.addTo(map);
        }
        markersRef.current[ship.id] = marker;
      }
    });

  }, [ships, searchQuery, typeFilter]);

  // Simulation Engine (Runs every 1s)
  useEffect(() => {
    const timer = setInterval(() => {
      setShips(prevShips => {
        return prevShips.map(ship => {
          if (ship.id.startsWith('LIVE_')) {
            return ship;
          }

          // Increment movement based on speed
          const speedStep = ship.speed * 0.000001; 
          const rad = (ship.heading * Math.PI) / 180;
          
          const deltaLat = speedStep * Math.cos(rad);
          const deltaLng = speedStep * Math.sin(rad);
          
          const nextLat = ship.coordinates[0] + deltaLat;
          const nextLng = ship.coordinates[1] + deltaLng;
          
          const nextCoords: [number, number] = [nextLat, nextLng];
          const nextTrail = [...ship.trail, nextCoords].slice(-5); // Keep last 5 coordinates

          // Randomize telemetry slightly
          let nextSpeed = ship.speed;
          let nextHeading = ship.heading;
          if (Math.random() > 0.8) {
            nextSpeed = Math.max(1, Math.min(15, ship.speed + (Math.random() - 0.5)));
            nextHeading = (ship.heading + Math.round((Math.random() - 0.5) * 5)) % 360;
            if (nextHeading < 0) nextHeading += 360;
          }

          // Calculate current distance to receptor
          const distance = getHaversineDistance(CENTER_LAT, CENTER_LNG, nextLat, nextLng);
          const isInside = distance <= RADIUS_M;

          // If the ship travels too far out (>4500m), loop it back on the opposite boundary
          if (distance > 4500) {
            const resetLat = CENTER_LAT - (deltaLat * 2200);
            const resetLng = CENTER_LNG - (deltaLng * 2200);
            return {
              ...ship,
              coordinates: [resetLat, resetLng],
              trail: [
                [resetLat - (deltaLat * 2), resetLng - (deltaLng * 2)],
                [resetLat - deltaLat, resetLng - deltaLng],
                [resetLat, resetLng]
              ],
              speed: nextSpeed,
              heading: nextHeading,
              insideZone: false,
              closestDistance: 4500
            };
          }

          // Trigger alerting if vessel enters 1 km zone
          if (!ship.insideZone && isInside) {
            setTotalToday(t => t + 1);
            setRecentTransits(prevList => {
              const newList: RecentTransit[] = [
                {
                  id: 'TR_' + Date.now() + '_' + ship.id + '_' + Math.random().toString(36).substring(2, 7),
                  name: ship.name,
                  type: ship.type,
                  timeInZone: 'Hace 0s',
                  closestDistance: Math.round(distance)
                },
                ...prevList
              ];
              return newList.slice(0, 5); // Max 5 items
            });
          }

          return {
            ...ship,
            coordinates: nextCoords,
            trail: nextTrail,
            speed: nextSpeed,
            heading: nextHeading,
            insideZone: isInside,
            closestDistance: distance
          };
        });
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const forceRegenerateMock = () => {
    // Re-initialize state to default but with some random offsets
    const randomized = INITIAL_MOCK_SHIPS.map(b => {
      const latOffset = (Math.random() - 0.5) * 0.001;
      const lngOffset = (Math.random() - 0.5) * 0.001;
      const speed = Math.max(1.5, b.speed + (Math.random() - 0.5) * 3);
      const heading = (b.heading + Math.round((Math.random() - 0.5) * 45)) % 360;
      const coords: [number, number] = [b.coordinates[0] + latOffset, b.coordinates[1] + lngOffset];

      return {
        ...b,
        coordinates: coords,
        speed,
        heading: heading < 0 ? heading + 360 : heading,
        trail: [
          [coords[0] - 0.0003, coords[1] - 0.0003],
          [coords[0] - 0.0001, coords[1] - 0.0001],
          coords
        ]
      };
    });

    setShips(randomized);
    setSelectedShipId(null);
    recenterMap();
  };

  const recenterMap = () => {
    if (mapRef.current) {
      mapRef.current.setView([CENTER_LAT, CENTER_LNG], 16, { animate: true });
    }
  };

  // Compute live summary calculations
  const activeSelectedShip = ships.find(b => b.id === selectedShipId);
  const typeCounts = ships.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {} as Record<ShipType, number>);

  let mostFrequentType = 'YATE';
  let maxCount = -1;
  Object.entries(typeCounts).forEach(([type, count]) => {
    const countNum = count as number;
    if (countNum > maxCount) {
      maxCount = countNum;
      mostFrequentType = type;
    }
  });

  const avgSpeed = ships.filter(b => b.insideZone).reduce((sum, b) => sum + b.speed, 0) / 
    Math.max(1, ships.filter(b => b.insideZone).length);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full mx-auto">
      
      {/* LEFT COLUMN: Panels (4 Columns) */}
      <section className="lg:col-span-4 flex flex-col gap-5 order-2 lg:order-1">
        
        {/* AISStream Real-Time Control Card */}
        <article className="bg-ocean-deep/85 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h2 className="font-display font-semibold text-xs tracking-wider uppercase text-white font-sans">Sincronización AIS Real</h2>
            </div>
            
            {/* Status indicator badge */}
            {wsStatus === 'online' ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-mono tracking-wider font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ONLINE
              </span>
            ) : wsStatus === 'connecting' ? (
              <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[9px] font-mono tracking-wider font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                CONECTANDO
              </span>
            ) : wsStatus === 'error' ? (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[9px] font-mono tracking-wider font-semibold">
                ERROR API
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-white/5 text-cream-medium/40 text-[9px] font-mono tracking-wider">
                SIMULADO (OFFLINE)
              </span>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-xs text-cream-medium/70 leading-relaxed font-sans">
              Reciba telemetría real de buques en el puerto de Montevideo conectándose directamente a la API de <strong className="text-white font-semibold">aisstream.io</strong>.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-cream-medium/50 font-sans">API Key de AISStream.io</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    const val = e.target.value;
                    setApiKey(val);
                    localStorage.setItem('aisstream_api_key', val);
                  }}
                  placeholder="Pegue su API Key aquí..."
                  className="flex-1 bg-black/25 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-cream-medium/30 focus:outline-none focus:border-cyan-400/50 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-cream-medium/60 font-medium font-sans">Modo Tiempo Real (Live AIS)</span>
              <button
                onClick={() => {
                  if (!apiKey && !useRealTime) {
                    setWsStatus('error');
                    setWsError('Por favor ingrese su API Key primero.');
                    return;
                  }
                  setUseRealTime(!useRealTime);
                }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                  useRealTime ? 'bg-cyan-500' : 'bg-white/10 border border-white/15'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    useRealTime ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {wsError && (
              <div className="text-[10px] text-rose-400 bg-rose-500/5 border border-rose-500/10 rounded-xl p-2 font-mono leading-normal">
                {wsError}
              </div>
            )}
          </div>
        </article>

        {/* Vessel Detail (SHIP DETAIL CARD) */}
        <article className="bg-ocean-deep/85 border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden min-h-[260px] flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-full bg-[radial-gradient(circle_at_right_top,rgba(226,232,240,0.05),transparent_70%)] pointer-events-none"></div>
          
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-sand-warm" />
              <h2 className="font-display font-semibold text-xs tracking-wider uppercase text-white font-sans">Detalle del Buque</h2>
            </div>
            {activeSelectedShip ? (
              activeSelectedShip.insideZone ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono tracking-wider font-semibold animate-pulse">
                  EN RANGO (1 KM)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-cream-medium/60 text-[10px] font-mono tracking-wider font-semibold">
                  {Math.round(activeSelectedShip.closestDistance)}m DE DIST.
                </span>
              )
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-white/5 text-cream-medium/40 text-[10px] font-mono tracking-wider">
                SIN SELECCIONAR
              </span>
            )}
          </div>

          {!activeSelectedShip ? (
            <div className="py-12 text-center my-auto flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                <Anchor className="w-5 h-5 text-cream-medium/30" />
              </div>
              <p className="text-xs text-cream-medium/50 max-w-[200px] leading-relaxed">
                Haga clic en un barco sobre el mapa para expandir su telemetría e historial.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {/* Visual Image Placeholder */}
                <div className={`w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center text-4xl overflow-hidden border ${
                  activeSelectedShip.type === 'CARGO' ? 'bg-blue-900/30 border-blue-500/20' :
                  activeSelectedShip.type === 'TANKER' ? 'bg-rose-900/30 border-rose-500/20' :
                  activeSelectedShip.type === 'PESQUERO' ? 'bg-emerald-900/30 border-emerald-500/20' :
                  'bg-amber-900/30 border-amber-500/20'
                }`}>
                  {activeSelectedShip.type === 'CARGO' ? '🚢' :
                   activeSelectedShip.type === 'TANKER' ? '⛽' :
                   activeSelectedShip.type === 'PESQUERO' ? '🐠' :
                   '⛵'}
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-base font-display font-bold text-white uppercase truncate max-w-[170px]">{activeSelectedShip.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg leading-none" title={FLAGS[activeSelectedShip.flagCode]?.name}>
                      {FLAGS[activeSelectedShip.flagCode]?.icon || '🏳'}
                    </span>
                    <span className={`text-[10px] font-mono tracking-wider px-2 py-0.5 rounded font-semibold uppercase ${
                      activeSelectedShip.type === 'CARGO' ? 'bg-blue-500/10 text-blue-400' :
                      activeSelectedShip.type === 'TANKER' ? 'bg-rose-500/10 text-rose-400' :
                      activeSelectedShip.type === 'PESQUERO' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {activeSelectedShip.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-cream-medium/40 font-mono">MMSI: <span className="text-cream-medium/70">{activeSelectedShip.mmsi}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10 font-mono text-[11px]">
                <div className="bg-ocean-medium/30 p-2 border border-white/10 rounded-xl">
                  <span className="text-cream-medium/40 block text-[9px] uppercase tracking-wider">Velocidad</span>
                  <strong className="text-white text-xs">{activeSelectedShip.speed.toFixed(1)} nudos</strong>
                </div>
                <div className="bg-ocean-medium/30 p-2 border border-white/10 rounded-xl">
                  <span className="text-cream-medium/40 block text-[9px] uppercase tracking-wider">Rumbo</span>
                  <strong className="text-white text-xs">{activeSelectedShip.heading}°</strong>
                </div>
                <div className="bg-ocean-medium/30 p-2 border border-white/10 rounded-xl">
                  <span className="text-cream-medium/40 block text-[9px] uppercase tracking-wider">Dimensiones</span>
                  <strong className="text-white text-[10px]">{activeSelectedShip.length}m × {activeSelectedShip.width}m</strong>
                </div>
                <div className="bg-ocean-medium/30 p-2 border border-white/10 rounded-xl">
                  <span className="text-cream-medium/40 block text-[9px] uppercase tracking-wider">Calado</span>
                  <strong className="text-white text-xs">{activeSelectedShip.draft.toFixed(1)} m</strong>
                </div>
                
                <div className="bg-ocean-medium/30 p-2 border border-white/10 rounded-xl col-span-2 flex justify-between items-center">
                  <div>
                    <span className="text-cream-medium/40 block text-[9px] uppercase tracking-wider">Último Reporte</span>
                    <strong className="text-white text-xs">{activeSelectedShip.lastPosTime}</strong>
                  </div>
                  <Clock className="w-4 h-4 text-cream-medium/20" />
                </div>
                
                <div className="bg-ocean-medium/30 p-2 border border-white/10 rounded-xl col-span-2 flex justify-between items-center">
                  <div>
                    <span className="text-cream-medium/40 block text-[9px] uppercase tracking-wider">Próximo Puerto</span>
                    <strong className="text-white text-xs">{activeSelectedShip.nextPort}</strong>
                  </div>
                  <Navigation2 className="w-4 h-4 text-cream-medium/20" />
                </div>
              </div>
            </div>
          )}
        </article>

        {/* Side Panel 1: AVISTAMIENTOS RECIENTES */}
        <article className="bg-ocean-deep/85 border border-white/10 rounded-2xl p-5 shadow-xl flex-1 flex flex-col min-h-[280px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-terracotta" />
              <h2 className="font-display font-semibold text-xs tracking-wider uppercase text-white">Avistamientos Recientes</h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white/5 text-cream-medium/60 text-[9px] font-mono uppercase font-semibold">
              Historial
            </span>
          </div>

          <div className="space-y-2.5 overflow-y-auto no-scrollbar flex-1 max-h-[220px]">
            {recentTransits.map((sight) => {
              let tagColor = 'bg-blue-500/10 text-blue-400';
              let letter = 'C';
              if (sight.type === 'TANKER') { tagColor = 'bg-rose-500/10 text-rose-400'; letter = 'T'; }
              else if (sight.type === 'PESQUERO') { tagColor = 'bg-emerald-500/10 text-emerald-400'; letter = 'P'; }
              else if (sight.type === 'YATE') { tagColor = 'bg-amber-500/10 text-amber-400'; letter = 'Y'; }

              return (
                <div 
                  key={sight.id}
                  onClick={() => {
                    const linked = ships.find(s => s.name === sight.name);
                    if (linked) {
                      setSelectedShipId(linked.id);
                      if (mapRef.current) {
                        mapRef.current.panTo([linked.coordinates[0] - 0.0003, linked.coordinates[1]], { animate: true });
                      }
                    }
                  }}
                  className="p-3 rounded-xl bg-ocean-medium/30 hover:bg-ocean-medium/65 border border-white/10 transition-all flex items-center justify-between text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg ${tagColor} flex items-center justify-center font-mono font-bold text-xs flex-shrink-0`}>
                      {letter}
                    </span>
                    <div>
                      <h4 className="font-display font-semibold text-white tracking-wide uppercase truncate max-w-[125px]">
                        {sight.name}
                      </h4>
                      <span className="text-[9px] text-cream-medium/40 font-mono block uppercase">{sight.type}</span>
                    </div>
                  </div>
                  
                  <div className="text-right font-mono text-[10px]">
                    <span className="text-sand-warm block font-semibold">{sight.closestDistance} metros</span>
                    <span className="text-cream-medium/40 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {sight.timeInZone}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        {/* Side Panel 2: RESUMEN EN VIVO */}
        <article className="bg-ocean-deep/85 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h2 className="font-display font-semibold text-xs tracking-wider uppercase text-white">Resumen en Vivo</h2>
            </div>
            <span className="text-cream-medium/40 text-[9px] font-mono tracking-widest">REALTIME METRICS</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-ocean-medium/40 p-2.5 rounded-xl border border-white/10 text-center flex flex-col justify-between h-20">
              <span className="text-[9px] text-cream-medium/40 block leading-tight mb-1 uppercase">Total Hoy</span>
              <strong className="text-white text-lg font-display block leading-none font-bold">{totalToday}</strong>
              <span className="text-[8px] text-cream-medium/20 font-mono block mt-1">Vessels</span>
            </div>
            
            <div className="bg-ocean-medium/40 p-2.5 rounded-xl border border-white/10 text-center flex flex-col justify-between h-20">
              <span className="text-[9px] text-cream-medium/40 block leading-tight mb-1 uppercase">Top Tipo</span>
              <strong className="text-sand-warm text-xs font-display block leading-none font-bold mt-1 uppercase">
                {mostFrequentType === 'CARGO' ? 'Cargo' : mostFrequentType === 'TANKER' ? 'Tanker' : mostFrequentType === 'PESQUERO' ? 'Pesquero' : 'Yate'}
              </strong>
              <span className="text-[8px] text-cream-medium/20 font-mono block mt-1">Frecuente</span>
            </div>

            <div className="bg-ocean-medium/40 p-2.5 rounded-xl border border-white/10 text-center flex flex-col justify-between h-20">
              <span className="text-[9px] text-cream-medium/40 block leading-tight mb-1 uppercase">Vel. Prom.</span>
              <strong className="text-white text-sm font-display block leading-none font-bold mt-1">
                {avgSpeed.toFixed(1)} <span className="text-[9px] font-normal text-cream-medium/55">kn</span>
              </strong>
              <span className="text-[8px] text-cream-medium/20 font-mono block mt-1">En Zona</span>
            </div>
          </div>

          {/* SVG Traffic Chart */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-cream-medium/50 uppercase tracking-wide">Tráfico en el Tiempo (Últimas 6 Horas)</span>
              <span className="text-[9px] font-mono text-sand-warm/70">Capacidad: 100%</span>
            </div>
            <div className="w-full h-24 bg-ocean-dark/80 rounded-xl border border-white/10 overflow-hidden p-2 relative">
              <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.02)" strokeDasharray="3,3" />
                <line x1="0" y1="40" x2="300" y2="40" stroke="rgba(255,255,255,0.02)" strokeDasharray="3,3" />
                <line x1="0" y1="60" x2="300" y2="60" stroke="rgba(255,255,255,0.02)" strokeDasharray="3,3" />
                
                <line x1="50" y1="0" x2="50" y2="80" stroke="rgba(255,255,255,0.02)" strokeDasharray="3,3" />
                <line x1="100" y1="0" x2="100" y2="80" stroke="rgba(255,255,255,0.02)" strokeDasharray="3,3" />
                <line x1="150" y1="0" x2="150" y2="80" stroke="rgba(255,255,255,0.02)" strokeDasharray="3,3" />
                <line x1="200" y1="0" x2="200" y2="80" stroke="rgba(255,255,255,0.02)" strokeDasharray="3,3" />
                <line x1="250" y1="0" x2="250" y2="80" stroke="rgba(255,255,255,0.02)" strokeDasharray="3,3" />
                
                <path d="M 0 65 L 50 45 L 100 55 L 150 25 L 200 40 L 250 15 L 300 30 L 300 80 L 0 80 Z" fill="url(#chartGrad)" />
                <path d="M 0 65 L 50 45 L 100 55 L 150 25 L 200 40 L 250 15 L 300 30" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                
                <circle cx="50" cy="45" r="3" fill="#e2e8f0" />
                <circle cx="100" cy="55" r="3" fill="#e2e8f0" />
                <circle cx="150" cy="25" r="3" fill="#c2410c" />
                <circle cx="200" cy="40" r="3" fill="#e2e8f0" />
                <circle cx="250" cy="15" r="3" fill="#e2e8f0" />
                <circle cx="300" cy="30" r="3" fill="#e2e8f0" />
              </svg>
              <div className="flex justify-between text-[8px] font-mono text-cream-medium/30 absolute bottom-1 left-2 right-2">
                <span>01:00</span>
                <span>02:00</span>
                <span>03:00</span>
                <span>04:00 (Pico)</span>
                <span>05:00</span>
                <span>Ahora (06:41)</span>
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* RIGHT COLUMN: Live Interactive Map (8 Columns) */}
      <section className="lg:col-span-8 flex flex-col gap-5 order-1 lg:order-2">
        
        {/* Map Container Block */}
        <article className="bg-ocean-deep/50 border border-white/10 rounded-3xl p-2.5 shadow-2xl relative flex-1 min-h-[500px] flex flex-col overflow-hidden">
          
          {/* Radar Scanning Overlay */}
          <div className="absolute top-6 right-6 z-[400] bg-ocean-deep/95 backdrop-blur border border-white/10 rounded-2xl px-3 py-2 text-[10px] font-mono text-cyan-400 flex items-center gap-2 shadow-lg">
            <div className="relative w-3.5 h-3.5">
              <div className="absolute inset-0 rounded-full border border-cyan-400/30"></div>
              <div className="absolute inset-0 rounded-full border border-cyan-400 border-t-transparent animate-spin"></div>
            </div>
            <span>BÚSQUEDA GEOSENSORIAL DIRECTA ACTIVA</span>
          </div>

          {/* Scale indicator */}
          <div className="absolute top-6 left-6 z-[400] bg-ocean-deep/95 backdrop-blur border border-white/10 rounded-2xl p-3 shadow-lg space-y-1 pointer-events-none">
            <div className="text-[10px] font-display uppercase tracking-wider font-semibold text-cream-medium">Radar de la Ventana</div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-white">
              <span className="w-2 h-2 rounded-full bg-[#e2e8f0]"></span>
              <span>R = 1 km</span>
            </div>
            <div className="text-[9px] text-cream-medium/40">Montevideo, UY</div>
          </div>

          {/* Map canvas */}
          <div ref={mapContainerRef} id="mapa" className="w-full flex-1 rounded-2xl"></div>
          
          {/* Legend + Search controls bottom row */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-3 z-[400]">
            
            {/* Color Legend */}
            <div className="md:col-span-7 bg-ocean-deep/85 border border-white/10 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="font-display font-medium text-[11px] uppercase text-cream-medium/50">RUMBOS DE COLOR:</div>
              <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-cream-soft">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-950/80 border border-blue-400 flex items-center justify-center text-[7px] text-white">C</span>
                  <span>CARGO</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-950/80 border border-red-400 flex items-center justify-center text-[7px] text-white">T</span>
                  <span>TANKER</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-green-950/80 border border-green-400 flex items-center justify-center text-[7px] text-white">P</span>
                  <span>PESQUERO</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-yellow-950/80 border border-yellow-400 flex items-center justify-center text-[7px] text-white">Y</span>
                  <span>YATE</span>
                </span>
              </div>
            </div>

            {/* Manual Controls */}
            <div className="md:col-span-5 flex gap-2">
              <button 
                onClick={forceRegenerateMock}
                className="flex-1 bg-ocean-medium hover:bg-ocean-medium/80 border border-white/10 py-2 px-3 rounded-2xl text-[11px] font-mono font-medium tracking-wide text-white uppercase flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                REGENERAR MOCK
              </button>
              
              <button 
                onClick={recenterMap}
                className="p-2.5 bg-ocean-deep/80 hover:bg-ocean-medium border border-white/10 rounded-2xl text-white shadow-lg transition-all active:scale-95 cursor-pointer"
                title="Centrar en -34.920630, -56.229045"
              >
                <Locate className="w-4 h-4" />
              </button>
            </div>

          </div>
        </article>

        {/* Bottom Panel Grid (Panorama & Station Details) */}
        <article className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Card: Receiver Specs */}
          <div className="bg-ocean-deep/80 border border-white/10 rounded-2xl p-5 shadow-xl flex gap-4 items-center">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-ocean-deep to-ocean-medium border border-white/10 flex-shrink-0 flex items-center justify-center text-3xl">
              🇺🇾
            </div>
            <div className="space-y-1">
              <h4 className="font-display font-semibold text-xs tracking-wider uppercase text-white">Ubicación del Receptor AIS</h4>
              <p className="text-xs text-cream-medium/70 leading-normal">
                Antena dipolo omnidireccional ubicada en la escollera de Montevideo. Recibe y transmite radiobalizas AIS VHF en 161.975 MHz y 162.025 MHz.
              </p>
              <div className="text-[10px] font-mono text-sand-warm uppercase tracking-wider flex items-center gap-1.5 pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sand-warm animate-pulse"></span>
                Frecuencia de Muestreo: 2.4 GHz SDR
              </div>
            </div>
          </div>

          {/* Card: Panorama (Vista desde la ventana) */}
          <div className="bg-ocean-deep/80 border border-white/10 rounded-2xl p-5 shadow-xl flex gap-4 items-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516937941344-00b4e0337589?q=80&w=600')" }}></div>
            
            {/* SVG Illustrative Window drawing */}
            <div className="w-16 h-16 rounded-xl bg-ocean-dark border border-white/15 flex-shrink-0 flex items-center justify-center text-2xl relative overflow-hidden z-10">
              <svg className="w-full h-full p-2" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="15" y="15" width="70" height="70" rx="6" stroke="#cbd5e1" strokeWidth="4" />
                <line x1="50" y1="15" x2="50" y2="85" stroke="#cbd5e1" strokeWidth="4" />
                <line x1="15" y1="50" x2="85" y2="50" stroke="#cbd5e1" strokeWidth="4" />
                <path d="M 30 72 L 70 72 L 65 65 L 35 65 Z" fill="#c2410c" />
                <rect x="42" y="58" width="12" height="7" fill="#f8fafc" />
                <circle cx="70" cy="35" r="8" fill="#e2e8f0" opacity="0.8" />
              </svg>
            </div>
            
            <div className="space-y-1 relative z-10">
              <h4 className="font-display font-semibold text-xs tracking-wider uppercase text-white flex items-center gap-1.5">
                <span>Mi Vista Desde la Ventana</span>
                <span className="px-1.5 py-0.5 rounded bg-sand-warm/10 text-sand-warm text-[8px] font-mono">PANORAMA</span>
              </h4>
              <p className="text-xs text-cream-medium/70 leading-normal">
                Establece una línea de visión directa a la dársena de Montevideo. Mira hacia el Noroeste (315°), lo que permite visualizar los transbordadores y cargueros maniobrando.
              </p>
              <span className="text-[9px] font-mono text-cyan-400">Azimut de Cobertura: 290° - 340°</span>
            </div>
          </div>

        </article>

      </section>

    </div>
  );
}
