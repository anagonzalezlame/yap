import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import WebSocket from 'ws';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Server-Sent Events (SSE) Proxy for AISStream
  app.get("/api/ais-stream", (req, res) => {
    const apiKey = req.query.apiKey as string;
    if (!apiKey) {
      res.status(400).json({ error: "Se requiere API Key" });
      return;
    }

    // Set headers for Server-Sent Events (SSE)
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    });

    console.log("Client connected to SSE for AIS Stream");

    let aisWs: WebSocket | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;
    let fallbackActive = false;

    const startFallbackSimulation = () => {
      if (fallbackActive) return;
      fallbackActive = true;
      console.log("Activating server-side fallback simulation for AIS stream.");
      
      const CENTER_LAT = -34.920630;
      const CENTER_LNG = -56.229045;
      const INITIAL_FALLBACK_VESSELS = [
        { mmsi: 228183000, name: "ATLANTIC ACORD", type: 70, lat: -34.925, lng: -56.230, speed: 8.5, heading: 120 },
        { mmsi: 351234000, name: "ROU 04 ARTIGAS", type: 30, lat: -34.918, lng: -56.225, speed: 4.2, heading: 45 },
        { mmsi: 538001234, name: "CELESTE III", type: 36, lat: -34.921, lng: -56.232, speed: 12.0, heading: 270 },
        { mmsi: 477123456, name: "MONTEVIDEO EXPRESS", type: 70, lat: -34.915, lng: -56.222, speed: 10.1, heading: 315 },
        { mmsi: 636012345, name: "REGINA MARIS", type: 37, lat: -34.926, lng: -56.228, speed: 6.8, heading: 180 },
      ];

      const sendSimulatedData = () => {
        INITIAL_FALLBACK_VESSELS.forEach(v => {
          const speedMps = v.speed * 0.514444;
          const dt = 3;
          const distanceMoved = speedMps * dt * 4; // amplified slightly for better map visualization
          const headingRad = (v.heading * Math.PI) / 180;
          
          const dy = distanceMoved * Math.cos(headingRad);
          const dx = distanceMoved * Math.sin(headingRad);
          
          v.lat += dy / 111000;
          v.lng += dx / (111000 * Math.cos(v.lat * Math.PI / 180));
          
          v.heading = (v.heading + (Math.random() * 10 - 5) + 360) % 360;

          const distFromCenter = Math.sqrt(Math.pow(v.lat - CENTER_LAT, 2) + Math.pow(v.lng - CENTER_LNG, 2));
          if (distFromCenter > 0.03) {
            const targetAngle = Math.atan2(CENTER_LAT - v.lat, CENTER_LNG - v.lng) * 180 / Math.PI;
            v.heading = (Math.round(targetAngle) + 360) % 360;
          }

          const aisMessage = {
            MetaData: {
              MMSI: v.mmsi,
              Latitude: v.lat,
              Longitude: v.lng,
              ShipName: v.name,
              ShipType: v.type
            },
            Message: {
              PositionReport: {
                Sog: v.speed,
                Cog: v.heading
              }
            },
            fallback: true
          };

          res.write(`data: ${JSON.stringify(aisMessage)}\n\n`);
        });
      };

      // Send initial batch immediately, then start interval
      sendSimulatedData();
      fallbackInterval = setInterval(sendSimulatedData, 3000);
    };

    try {
      aisWs = new WebSocket("wss://stream.aisstream.io/v1/websocket");

      aisWs.on("open", () => {
        console.log("AISStream WebSocket connected on server-side");
        res.write(`data: ${JSON.stringify({ clearError: true })}\n\n`);
        const CENTER_LAT = -34.920630;
        const CENTER_LNG = -56.229045;
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

        if (aisWs && aisWs.readyState === WebSocket.OPEN) {
          aisWs.send(JSON.stringify(subscriptionMessage));
        }
      });

      aisWs.on("message", (data) => {
        res.write(`data: ${data.toString()}\n\n`);
      });

      aisWs.on("error", (err: any) => {
        console.error("AISStream WebSocket error, starting fallback simulation:", err.message || err);
        const errMsg = err.message || String(err);
        try {
          res.write(`data: ${JSON.stringify({ error: `Conexión con aisstream.io falló: ${errMsg}. Iniciando simulación local.`, fallback: true })}\n\n`);
        } catch (writeErr) {
          console.error("Error writing SSE fallback error message:", writeErr);
        }
        startFallbackSimulation();
      });

      aisWs.on("close", () => {
        console.log("AISStream WebSocket closed, starting fallback simulation if not active");
        if (!fallbackActive) {
          try {
            res.write(`data: ${JSON.stringify({ error: "Conexión con aisstream.io cerrada. Iniciando simulación local.", fallback: true })}\n\n`);
          } catch (writeErr) {
            console.error("Error writing SSE close error message:", writeErr);
          }
        }
        startFallbackSimulation();
      });

    } catch (error: any) {
      console.error("Error setting up server-side AIS WS, starting fallback simulation:", error);
      startFallbackSimulation();
    }

    req.on("close", () => {
      console.log("Client disconnected from SSE, closing backend WebSocket and fallback intervals");
      if (aisWs && (aisWs.readyState === WebSocket.OPEN || aisWs.readyState === WebSocket.CONNECTING)) {
        aisWs.close();
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
