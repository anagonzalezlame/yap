/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Server, 
  Cpu, 
  Wifi, 
  Compass, 
  Layers, 
  FileCode, 
  Map, 
  Copy, 
  Check, 
  Terminal,
  ExternalLink
} from 'lucide-react';

export default function IntegrationGuide() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const architectureSteps = [
    {
      title: "1. AIS Stream Connect",
      desc: "Establishes a secure, continuous WebSocket connection directly to aisstream.io with the developer's API key.",
      icon: <Wifi className="w-5 h-5 text-sand-warm" />
    },
    {
      title: "2. Backend Filter Engine",
      desc: "Filters messages server-side in real-time. Computes geospatial distances so only vessels near (-34.920630, -56.229045) are kept.",
      icon: <Cpu className="w-5 h-5 text-terracotta" />
    },
    {
      title: "3. Local WebSocket Server",
      desc: "Broadcasts the ultra-low-latency, filtered vessel data stream to the web client via simple JSON payloads.",
      icon: <Server className="w-5 h-5 text-marine-green" />
    },
    {
      title: "4. Frontend Dynamic Map",
      desc: "Renders the incoming live vessels, drawing trails and refreshing the dashboard stats as signals arrive.",
      icon: <Layers className="w-5 h-5 text-blue-400" />
    }
  ];

  const backendCode = `/**
 * PROXY SERVER - Node.js + ws
 * Escucha la API de aisstream.io y retransmite datos filtrados al frontend.
 * 
 * Requisitos: npm install ws
 */
import { WebSocket } from 'ws';
import express from 'express';
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const wssLocal = new WebSocket.Server({ noServer: true });

const AIS_STREAM_API_KEY = process.env.AISSTREAM_API_KEY || "TU_API_KEY_AQUÍ";
const CENTER_LAT = -34.920630;
const CENTER_LNG = -56.229045;
const RADIUS_M = 200; // Radio de búsqueda

// Calcular caja de contención (Bounding Box) aproximada para 200 metros
// 1 grado de latitud = 111,000 m. 1 grado de longitud = 111,000 * cos(lat) m.
const deltaLat = RADIUS_M / 111000;
const deltaLng = RADIUS_M / (111000 * Math.cos(CENTER_LAT * Math.PI / 180));

const boundingBox = [
  [CENTER_LAT - deltaLat, CENTER_LNG - deltaLng], // Esquina inferior izquierda
  [CENTER_LAT + deltaLat, CENTER_LNG + deltaLng]  // Esquina superior derecha
];

console.log("Caja Geoson-Filtro (200m):", boundingBox);

// Conectar a la API de AISStream
function connectToAISStream() {
  const aisws = new WebSocket("wss://stream.aisstream.io/ws");

  aisws.on('open', () => {
    console.log("✔ Conectado a aisstream.io");
    
    // Suscribirse a una caja de búsqueda geográfica (Montevideo Bay amplio para luego refinar)
    // Usamos una caja de 1km para recibir datos y refinar exactamente a 200m en el código.
    const subscriptionMessage = {
      APIKey: AIS_STREAM_API_KEY,
      BoundingBoxes: [[
        [CENTER_LAT - 0.01, CENTER_LNG - 0.01],
        [CENTER_LAT + 0.01, CENTER_LNG + 0.01]
      ]],
      FiltersShipDecoders: [1, 2, 3, 5, 18, 19, 21] // Códigos de barcos comunes
    };
    
    aisws.send(JSON.stringify(subscriptionMessage));
  });

  aisws.on('message', (data) => {
    try {
      const aisMessage = JSON.parse(data.toString());
      
      // Extraer datos útiles de AIS
      const messageType = aisMessage.MessageType;
      const metaData = aisMessage.MetaData;
      
      if (!metaData) return;
      
      const { Latitude, Longitude, ShipName, MMSI } = metaData;
      
      // Calcular la distancia exacta usando la fórmula Haversine
      const distance = haversineDistance(CENTER_LAT, CENTER_LNG, Latitude, Longitude);
      
      // Si está en el rango de 200m o inmediatamente fuera (ej. 400m para trail)
      if (distance <= 500) {
        const payload = {
          mmsi: MMSI,
          name: ShipName?.trim() || \`MMSI \${MMSI}\`,
          latitude: Latitude,
          longitude: Longitude,
          speed: aisMessage.Message?.PositionReport?.Sog || 0, // velocidad en nudos
          heading: aisMessage.Message?.PositionReport?.Cog || 0, // rumbo en grados
          distance: Math.round(distance),
          insideZone: distance <= RADIUS_M,
          timestamp: new Date().toISOString()
        };
        
        // Retransmitir a todos los clientes frontend conectados
        wssLocal.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(payload));
          }
        });
      }
    } catch (err) {
      console.error("Error procesando mensaje AIS:", err);
    }
  });

  aisws.on('close', () => {
    console.log("⚠ Conexión perdida con AISStream. Reintentando en 10s...");
    setTimeout(connectToAISStream, 10000);
  });

  aisws.on('error', (err) => {
    console.error("AISStream WebSocket Error:", err);
  });
}

// Fórmula de Haversine para distancia exacta
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radio de la Tierra en metros
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distancia en metros
}

// Configurar WebSocket servidor local para el frontend
server.on('upgrade', (request, socket, head) => {
  wssLocal.handleUpgrade(request, socket, head, (ws) => {
    wssLocal.emit('connection', ws, request);
  });
});

wssLocal.on('connection', (ws) => {
  console.log("🔌 Cliente frontend conectado al WebSocket local");
});

server.listen(4000, () => {
  console.log("🚀 Servidor Proxy AIS escuchando en el puerto 4000");
  connectToAISStream();
});`;

  const frontendCode = `/**
 * INTEGRACIÓN EN FRONTEND (React o JavaScript Vanilla)
 * Reemplaza la simulación por la escucha del WebSocket local del Proxy.
 */
function connectLiveDashboard() {
  // Conectar al WebSocket del backend local
  const socket = new WebSocket("ws://localhost:4000");
  
  // Guardar referencias a los marcadores de barcos en un diccionario
  const shipMarkers = {};

  socket.onopen = () => {
    console.log("✔ Conectado al flujo de datos AIS en vivo");
    updateUIConnectionStatus(true); // Cambiar indicador a VERDE pulsante
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    // data contiene: { mmsi, name, latitude, longitude, speed, heading, distance, insideZone, timestamp }
    const { mmsi, name, latitude, longitude, speed, heading, distance, insideZone } = data;
    
    // 1. Actualizar o crear marcador en Leaflet
    if (shipMarkers[mmsi]) {
      // Mover marcador existente con animación
      shipMarkers[mmsi].setLatLng([latitude, longitude]);
      
      // Actualizar rotación del icono vectorizado
      const iconElement = shipMarkers[mmsi].getElement();
      if (iconElement) {
        const img = iconElement.querySelector('img');
        if (img) img.style.transform = \`rotate(\${heading}deg)\`;
      }
    } else {
      // Crear nuevo marcador con el color adecuado según tipo
      const shipColor = getShipColorByMMSI(mmsi); // Lógica de color de acuerdo al tipo
      const customIcon = L.divIcon({
        className: 'custom-ship-marker',
        html: \`<div class="relative">
          <img src="ship_vector.svg" style="transform: rotate(\${heading}deg);" class="\${shipColor}" />
          <div class="glow-effect"></div>
        </div>\`,
        iconSize: [30, 30]
      });

      const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
      
      // Guardar en el diccionario
      shipMarkers[mmsi] = marker;
      
      // Vincular popup detallado
      marker.bindPopup(() => createVesselPopupHtml(data));
    }
    
    // 2. Agregar punto al trail del barco (Línea de estela)
    updateShipTrailOnMap(mmsi, [latitude, longitude]);
    
    // 3. Si está en la zona, activar alerta visual e incorporar a la lista de avistamientos recientes
    if (insideZone) {
      addRecentTransit({
        id: mmsi,
        name: name,
        timeInZone: "Ahora mismo",
        closestDistance: distance
      });
      
      // Disparar destello en radar
      triggerRadarPing(latitude, longitude);
    }
    
    // 4. Recalcular las estadísticas de forma reactiva
    updateLiveStats(data);
  };

  socket.onclose = () => {
    console.log("⚠ Conexión de datos en vivo cerrada. Reintentando...");
    updateUIConnectionStatus(false);
    setTimeout(connectLiveDashboard, 5000); // Auto-reconexión
  };
}`;

  return (
    <div id="guia-integracion" className="bg-ocean-dark text-cream-soft rounded-2xl border border-white/10 shadow-2xl overflow-hidden font-sans">
      
      {/* Banner Superior */}
      <div className="bg-gradient-to-r from-ocean-deep via-ocean-medium to-ocean-light p-8 border-b border-white/10 relative">
        <div className="absolute top-0 right-0 w-64 h-full bg-[radial-gradient(circle_at_right_top,rgba(223,178,93,0.1),transparent_70%)] pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sand-warm/15 text-sand-warm text-xs font-mono font-medium tracking-wide">PHASE 2 ARCHITECTURE</span>
              <span className="flex items-center gap-1 text-xs text-marine-green font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-marine-green animate-pulse"></span>
                PRONTO PARA DESARROLLO
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-white mb-2">
              Flujo de Datos AIS en Tiempo Real
            </h1>
            <p className="text-sm text-cream-medium/75 max-w-2xl leading-relaxed">
              Guía técnica y arquitectura completa para conectar el prototipo visual a transmisiones de radiobalizas satelitales marítimas en vivo desde <code className="text-sand-warm font-mono bg-black/30 px-1 py-0.5 rounded text-xs">aisstream.io</code>.
            </p>
          </div>
          
          <a 
            href="https://aisstream.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 self-start md:self-center px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition-all text-xs font-medium text-white border border-white/10"
          >
            Visitar AISStream.io
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-12">
        
        {/* Sección 1: Diagrama de Arquitectura */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Compass className="w-5 h-5 text-sand-warm" />
            <h2 className="text-lg font-display font-semibold text-white">1. Diagrama de Flujo e Infraestructura</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            {architectureSteps.map((step, idx) => (
              <div key={idx} className="bg-ocean-deep p-5 rounded-xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
                <div className="absolute top-3 right-3 text-white/5 text-4xl font-display font-black group-hover:text-white/10 transition-colors pointer-events-none">
                  {idx + 1}
                </div>
                <div className="mb-4 p-2.5 w-fit rounded-lg bg-white/5">
                  {step.icon}
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">{step.title}</h3>
                <p className="text-xs text-cream-medium/70 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-ocean-deep/50 rounded-xl p-5 border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-8 py-3 overflow-x-auto w-full justify-center min-w-[500px]">
              <div className="flex flex-col items-center gap-1.5 px-4">
                <span className="text-[10px] font-mono text-sand-warm">AIS SATELLITES</span>
                <div className="w-12 h-12 rounded-full bg-sand-warm/10 border border-sand-warm/35 flex items-center justify-center text-sand-warm font-bold font-display">🛰</div>
                <span className="text-[10px] text-cream-medium/60">Transponder VHF</span>
              </div>
              <div className="h-0.5 w-8 bg-dashed border-t border-white/20 animate-pulse"></div>
              <div className="flex flex-col items-center gap-1.5 px-4">
                <span className="text-[10px] font-mono text-cyan-400">AISSTREAM API</span>
                <div className="w-12 h-12 rounded-full bg-cyan-400/10 border border-cyan-400/35 flex items-center justify-center text-cyan-400 font-bold font-display">🌐</div>
                <span className="text-[10px] text-cream-medium/60">Secure WebSocket</span>
              </div>
              <div className="h-0.5 w-8 bg-dashed border-t border-white/20 animate-pulse"></div>
              <div className="flex flex-col items-center gap-1.5 px-4 bg-white/5 py-2.5 rounded-lg border border-white/10">
                <span className="text-[10px] font-mono text-terracotta">NODE.JS PROXY</span>
                <div className="w-12 h-12 rounded-full bg-terracotta/10 border border-terracotta/35 flex items-center justify-center text-terracotta font-bold font-display">⚙</div>
                <span className="text-[10px] text-cream-medium/60">Filtro Geográfico 200m</span>
              </div>
              <div className="h-0.5 w-8 bg-dashed border-t border-white/20 animate-pulse"></div>
              <div className="flex flex-col items-center gap-1.5 px-4">
                <span className="text-[10px] font-mono text-marine-green">DASHBOARD WEB</span>
                <div className="w-12 h-12 rounded-full bg-marine-green/10 border border-marine-green/35 flex items-center justify-center text-marine-green font-bold font-display">💻</div>
                <span className="text-[10px] text-cream-medium/60">Prototipo Interactiva</span>
              </div>
            </div>
            <p className="text-[11px] text-cream-medium/50 mt-4 max-w-lg leading-normal">
              <strong>¿Por qué un Proxy intermedio?</strong> Conectarse directamente a aisstream.io desde el navegador expone la clave API privada en el cliente y sobrecarga al navegador con miles de barcos mundiales antes de filtrarlos. El Proxy de Node.js centraliza la clave de forma segura y reduce el ancho de banda filtrando el tráfico global.
            </p>
          </div>
        </div>

        {/* Sección 2: Bounding Box Geográfico */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Map className="w-5 h-5 text-terracotta" />
              <h2 className="text-lg font-display font-semibold text-white">2. Bounding Box & Filtro 200m</h2>
            </div>
            <div className="space-y-4 text-sm text-cream-medium/80 leading-relaxed">
              <p>
                La API de <code className="text-sand-warm font-mono bg-black/30 px-1 py-0.5 rounded text-xs">aisstream.io</code> requiere una caja de coordenadas geográficas (Bounding Box) para delimitar la región mundial sobre la cual nos enviará datos.
              </p>
              <p>
                Para nuestra ventana en Montevideo (<strong className="text-white">-34.920630, -56.229045</strong>), definimos una caja de suscripción inicial ligeramente mayor en el servidor y luego, de forma matemática, calculamos la distancia exacta de cada transponder para filtrar solo los barcos que pasan a menos de 200 metros de nuestra ventana.
              </p>
              <div className="bg-ocean-deep p-4 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                  <span className="text-cream-medium/50">Coordenada Central:</span>
                  <span className="font-mono text-white">-34.920630, -56.229045</span>
                </div>
                <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                  <span className="text-cream-medium/50">Cálculo de 200m (Latitud):</span>
                  <span className="font-mono text-white">± 0.0018° (Delta Lat)</span>
                </div>
                <div className="flex justify-between text-xs pb-1">
                  <span className="text-cream-medium/50">Cálculo de 200m (Longitud):</span>
                  <span className="font-mono text-white">± 0.0022° (Delta Lng)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-ocean-deep rounded-xl p-5 border border-white/5 flex flex-col justify-between">
            <h4 className="text-xs font-mono text-sand-warm uppercase tracking-wider mb-3">Definición de Caja Límite (JSON)</h4>
            <div className="bg-black/30 p-3.5 rounded-lg border border-white/5 font-mono text-[11px] text-cream-soft overflow-x-auto whitespace-pre-wrap leading-relaxed">
{`// Bounding box en aisstream.io para Montevideo Bay
"BoundingBoxes": [[
  [-34.92243, -56.231245], // Esquina inferior izquierda (Sur-Oeste)
  [-34.91883, -56.226845]  // Esquina superior derecha (Norte-Este)
]]`}
            </div>
            <div className="flex items-start gap-2.5 mt-4 bg-white/5 p-3 rounded-lg border border-white/5">
              <span className="text-sm">💡</span>
              <p className="text-[11px] text-cream-medium/70 leading-normal">
                Para garantizar precisión extrema y mitigar efectos de deformación por latitud, el servidor aplica la <strong>Fórmula de Haversine</strong> sobre la distancia esférica de la Tierra, calculando la distancia lineal exacta en metros.
              </p>
            </div>
          </div>
        </div>

        {/* Sección 3: Código Backend Proxy */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-marine-green" />
              <h2 className="text-lg font-display font-semibold text-white">3. Implementación del Backend (Node.js Proxy)</h2>
            </div>
            <button 
              onClick={() => handleCopy(backendCode, 'backend')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-cream-soft border border-white/5 transition-all"
            >
              {copiedSection === 'backend' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-marine-green" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cream-medium" />
                  Copiar Código
                </>
              )}
            </button>
          </div>
          
          <div className="relative">
            <div className="absolute top-3 right-4 text-[10px] font-mono text-cream-medium/30">JS / NODE</div>
            <pre className="bg-black/45 p-5 rounded-xl border border-white/5 font-mono text-xs text-cream-medium overflow-x-auto max-h-[450px] leading-relaxed">
              <code>{backendCode}</code>
            </pre>
          </div>
        </div>

        {/* Sección 4: Código Frontend */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-display font-semibold text-white">4. Consumo en Frontend (WebSocket)</h2>
            </div>
            <button 
              onClick={() => handleCopy(frontendCode, 'frontend')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-cream-soft border border-white/5 transition-all"
            >
              {copiedSection === 'frontend' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-marine-green" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cream-medium" />
                  Copiar Código
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <div className="absolute top-3 right-4 text-[10px] font-mono text-cream-medium/30">REACT / VANILLA JS</div>
            <pre className="bg-black/45 p-5 rounded-xl border border-white/5 font-mono text-xs text-cream-medium overflow-x-auto max-h-[400px] leading-relaxed">
              <code>{frontendCode}</code>
            </pre>
          </div>
        </div>

      </div>

      {/* Footer del Panel */}
      <div className="bg-ocean-deep p-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-cream-medium/60">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sand-warm"></span>
          <span>Sincronización robusta con protocolos WebSocket RF 162.025 MHz</span>
        </div>
        <span>© 2026 Bahía de Montevideo Maritime Tracker</span>
      </div>

    </div>
  );
}
