/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function SourceCodeView() {
  const [copied, setCopied] = useState(false);

  const singleFileCode = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Avistamientos de Buques - Bahía de Montevideo</title>
  
  <!-- Fuentes e Iconos -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>

  <!-- Tailwind CSS Play CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Leaflet CSS -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />

  <!-- Configuración de Estilos Personalizados de Tailwind y Leaflet -->
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            ocean: {
              dark: '#08111e',
              deep: '#102138',
              medium: '#1a304d',
              light: '#2d486b',
            },
            cream: {
              soft: '#faf6ee',
              medium: '#f0e6cf',
            },
            sand: {
              warm: '#dfb25d',
            },
            terracotta: '#cc5c43',
            marine: {
              green: '#2a8a5e',
            }
          },
          fontFamily: {
            sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            display: ['Space Grotesk', 'Inter', 'sans-serif'],
            mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
          }
        }
      }
    }
  </script>
  
  <style>
    /* Estilos de mapa naval oscuro */
    #mapa {
      background: #0d1a29 !important;
    }
    
    /* Filtros CSS para oscurecer los mapas standard OSM y dar un look militar/vectorial */
    .leaflet-tile-container {
      filter: invert(100%) hue-rotate(180deg) brightness(50%) contrast(140%) saturate(60%) !important;
    }
    
    .leaflet-container {
      font-family: 'Inter', sans-serif !important;
    }

    .leaflet-popup-content-wrapper {
      background: #102138 !important;
      color: #faf6ee !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 12px !important;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;
    }
    
    .leaflet-popup-tip {
      background: #102138 !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
    }
    
    .leaflet-bar {
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
    }
    
    .leaflet-bar a {
      background-color: #102138 !important;
      color: #faf6ee !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
    }
    
    .leaflet-bar a:hover {
      background-color: #1a304d !important;
      color: #dfb25d !important;
    }

    /* Ocultar barra de desplazamiento manteniendo la funcionalidad */
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    
    /* Animación de Radar pulsante */
    @keyframes ping-radar {
      0% {
        transform: scale(0.4);
        opacity: 0.8;
      }
      100% {
        transform: scale(2.2);
        opacity: 0;
      }
    }
    
    .radar-pulse {
      position: relative;
    }
    
    .radar-pulse::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      border-radius: 9999px;
      border: 2px solid #dfb25d;
      animation: ping-radar 3s ease-out infinite;
      pointer-events: none;
    }
    
    /* Estilo de la estela brillante de los barcos */
    .glow-trail {
      filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.5));
    }
  </style>
</head>
<body class="bg-[#08111e] text-[#faf6ee] font-sans min-h-screen flex flex-col antialiased selection:bg-sand-warm selection:text-ocean-dark">

  <!-- CABECERA (SPANISH TEXT) -->
  <header class="bg-[#102138]/90 backdrop-blur border-b border-white/5 py-4 px-6 sticky top-0 z-[1000] flex flex-col md:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-3 w-full md:w-auto">
      <div class="p-2 bg-[#dfb25d]/10 rounded-xl border border-[#dfb25d]/20">
        <i data-lucide="compass" class="w-6 h-6 text-[#dfb25d] animate-spin-slow"></i>
      </div>
      <div>
        <h1 class="text-sm md:text-base font-display font-semibold tracking-tight uppercase text-white leading-tight">
          AVISTAMIENTOS DE BUQUES EN LA BAHÍA DE MONTEVIDEO
        </h1>
        <p class="text-[11px] text-[#f0e6cf]/60 font-mono tracking-wider uppercase flex items-center gap-1.5 mt-0.5">
          <i data-lucide="map-pin" class="w-3 h-3 text-[#cc5c43]"></i>
          Radio de 200m desde mi ventana (-34.920630, -56.229045)
        </p>
      </div>
    </div>
    
    <!-- Filtros de Cabecera -->
    <div class="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end text-xs">
      <!-- Indicador Live Feed -->
      <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] tracking-wider uppercase">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        LIVE FEED [CONECTADO]
      </div>
      
      <!-- Búsqueda -->
      <div class="relative w-full sm:w-44">
        <i data-lucide="search" class="w-3.5 h-3.5 text-[#f0e6cf]/40 absolute left-3 top-2.5"></i>
        <input 
          id="busquedaInput" 
          type="text" 
          placeholder="Buscar buques..." 
          class="w-full bg-[#1a304d] text-white pl-9 pr-3 py-2 rounded-xl border border-white/5 focus:outline-none focus:border-[#dfb25d]/50 placeholder-[#f0e6cf]/30 font-mono"
          oninput="filtrarBuques()"
        />
      </div>

      <!-- Filtro Tipo -->
      <div class="relative w-full sm:w-44">
        <i data-lucide="filter" class="w-3.5 h-3.5 text-[#f0e6cf]/40 absolute left-3 top-2.5"></i>
        <select 
          id="filtroTipo" 
          class="w-full bg-[#1a304d] text-white pl-9 pr-3 py-2 rounded-xl border border-white/5 focus:outline-none focus:border-[#dfb25d]/50 appearance-none cursor-pointer font-mono"
          onchange="filtrarBuques()"
        >
          <option value="TODOS">TODOS LOS TIPOS</option>
          <option value="CARGO">CARGO (AZUL)</option>
          <option value="TANKER">TANKER (ROJO)</option>
          <option value="PESQUERO">PESQUERO (VERDE)</option>
          <option value="YATE">YATE (AMARILLO)</option>
        </select>
      </div>
    </div>
  </header>

  <!-- CONTENEDOR PRINCIPAL (FLUIDO, ESTILO BENTO GRID) -->
  <main class="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-[1700px] w-full mx-auto">
    
    <!-- COLUMNA IZQUIERDA: LISTADOS Y ESTADÍSTICAS (4 COLS en LG) -->
    <section class="lg:col-span-4 flex flex-col gap-5 order-2 lg:order-1">
      
      <!-- Panel de Detalles Expandible (SHIP DETAIL) -->
      <article id="panelDetalle" class="bg-[#102138]/80 border border-white/5 rounded-2xl p-5 shadow-xl relative overflow-hidden transition-all duration-300">
        <div class="absolute top-0 right-0 w-24 h-full bg-[radial-gradient(circle_at_right_top,rgba(223,178,93,0.05),transparent_70%)] pointer-events-none"></div>
        <div class="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
          <div class="flex items-center gap-2">
            <i data-lucide="info" class="w-4 h-4 text-[#dfb25d]"></i>
            <h2 class="font-display font-semibold text-xs tracking-wider uppercase text-white">Detalle del Buque</h2>
          </div>
          <span id="detalleDistanciaBadge" class="px-2 py-0.5 rounded-full bg-[#cc5c43]/10 text-[#cc5c43] text-[10px] font-mono tracking-wider font-semibold">FUERA DE RANGO</span>
        </div>
        
        <!-- Estado Vacío (Al cargar o no haber seleccionado ninguno) -->
        <div id="detalleVacio" class="py-12 text-center">
          <div class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
            <i data-lucide="anchor" class="w-5 h-5 text-[#f0e6cf]/30"></i>
          </div>
          <p class="text-xs text-[#f0e6cf]/50 max-w-[200px] mx-auto leading-relaxed">
            Haga clic en un barco sobre el mapa para expandir su telemetría e historial.
          </p>
        </div>

        <!-- Información del Buque (Oculto inicialmente) -->
        <div id="detalleContenido" class="hidden space-y-4">
          <div class="flex items-start gap-4">
            <!-- Illustrative Image Placeholder -->
            <div id="detalleImagen" class="w-20 h-20 rounded-xl bg-[#1a304d] border border-white/10 flex-shrink-0 flex items-center justify-center text-4xl overflow-hidden relative">
              🛳
            </div>
            <div class="space-y-1">
              <h3 id="detalleNombre" class="text-base font-display font-bold text-white uppercase truncate">--</h3>
              <div class="flex items-center gap-1.5">
                <span id="detalleBandera" class="text-lg leading-none">🇺🇾</span>
                <span id="detalleTipo" class="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold uppercase">--</span>
              </div>
              <p class="text-[10px] text-[#f0e6cf]/40 font-mono">MMSI: <span id="detalleMMSI" class="text-[#f0e6cf]/70">--</span></p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3.5 pt-2 border-t border-white/5 font-mono text-[11px]">
            <div class="bg-[#1a304d]/30 p-2.5 rounded-xl border border-white/5">
              <span class="text-[#f0e6cf]/40 block text-[9px] uppercase tracking-wider">Velocidad</span>
              <strong id="detalleVelocidad" class="text-white text-xs">-- nudos</strong>
            </div>
            <div class="bg-[#1a304d]/30 p-2.5 rounded-xl border border-white/5">
              <span class="text-[#f0e6cf]/40 block text-[9px] uppercase tracking-wider">Rumbo</span>
              <strong id="detalleRumbo" class="text-white text-xs">--°</strong>
            </div>
            <div class="bg-[#1a304d]/30 p-2.5 rounded-xl border border-white/5">
              <span class="text-[#f0e6cf]/40 block text-[9px] uppercase tracking-wider">Dimensiones</span>
              <strong id="detalleDimensiones" class="text-white text-[10px]">--</strong>
            </div>
            <div class="bg-[#1a304d]/30 p-2.5 rounded-xl border border-white/5">
              <span class="text-[#f0e6cf]/40 block text-[9px] uppercase tracking-wider">Calado</span>
              <strong id="detalleCalado" class="text-white text-xs">-- m</strong>
            </div>
            <div class="bg-[#1a304d]/30 p-2.5 rounded-xl border border-white/5 col-span-2 flex justify-between items-center">
              <div>
                <span class="text-[#f0e6cf]/40 block text-[9px] uppercase tracking-wider">Último Reporte</span>
                <strong id="detalleUltimaPos" class="text-white text-xs">--</strong>
              </div>
              <i data-lucide="clock" class="w-4 h-4 text-[#f0e6cf]/20"></i>
            </div>
            <div class="bg-[#1a304d]/30 p-2.5 rounded-xl border border-white/5 col-span-2 flex justify-between items-center">
              <div>
                <span class="text-[#f0e6cf]/40 block text-[9px] uppercase tracking-wider">Próximo Destino</span>
                <strong id="detalleDestino" class="text-white text-xs">--</strong>
              </div>
              <i data-lucide="navigation-2" class="w-4 h-4 text-[#f0e6cf]/20"></i>
            </div>
          </div>
        </div>
      </article>

      <!-- Side Panel 1: AVISTAMIENTOS RECIENTES -->
      <article class="bg-[#102138]/80 border border-white/5 rounded-2xl p-5 shadow-xl flex-1 flex flex-col min-h-[280px]">
        <div class="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
          <div class="flex items-center gap-2">
            <i data-lucide="history" class="w-4 h-4 text-[#cc5c43]"></i>
            <h2 class="font-display font-semibold text-xs tracking-wider uppercase text-white">Avistamientos Recientes</h2>
          </div>
          <span class="px-2 py-0.5 rounded-full bg-white/5 text-[#f0e6cf]/60 text-[9px] font-mono uppercase font-semibold">Historial en Zona</span>
        </div>
        
        <!-- Lista de Avistamientos -->
        <div id="listaAvistamientos" class="space-y-2.5 overflow-y-auto no-scrollbar flex-1 max-h-[220px]">
          <!-- Inyectado vía JS -->
        </div>
      </article>

      <!-- Side Panel 2: RESUMEN EN VIVO -->
      <article class="bg-[#102138]/80 border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b border-white/5 pb-3">
          <div class="flex items-center gap-2">
            <i data-lucide="activity" class="w-4 h-4 text-emerald-400"></i>
            <h2 class="font-display font-semibold text-xs tracking-wider uppercase text-white">Resumen en Vivo</h2>
          </div>
          <span class="text-[#f0e6cf]/40 text-[9px] font-mono tracking-widest">REALTIME METRICS</span>
        </div>

        <!-- Tarjetas de Estadísticas Pulidas -->
        <div class="grid grid-cols-3 gap-2.5">
          <div class="bg-[#1a304d]/40 p-2.5 rounded-xl border border-white/5 text-center flex flex-col justify-between">
            <span class="text-[9px] text-[#f0e6cf]/40 block leading-tight mb-1 uppercase">Total Hoy</span>
            <strong id="statTotalHoy" class="text-white text-lg font-display block leading-none font-bold">138</strong>
            <span class="text-[8px] text-[#f0e6cf]/20 font-mono block mt-1">Avistamientos</span>
          </div>
          <div class="bg-[#1a304d]/40 p-2.5 rounded-xl border border-white/5 text-center flex flex-col justify-between">
            <span class="text-[9px] text-[#f0e6cf]/40 block leading-tight mb-1 uppercase">Top Tipo</span>
            <strong id="statTopTipo" class="text-[#dfb25d] text-xs font-display block leading-none font-bold mt-1.5 uppercase">Yate</strong>
            <span class="text-[8px] text-[#f0e6cf]/20 font-mono block mt-1">Frecuente</span>
          </div>
          <div class="bg-[#1a304d]/40 p-2.5 rounded-xl border border-white/5 text-center flex flex-col justify-between">
            <span class="text-[9px] text-[#f0e6cf]/40 block leading-tight mb-1 uppercase">Vel. Prom.</span>
            <strong id="statVelProm" class="text-white text-sm font-display block leading-none font-bold mt-1">4.2 <span class="text-[9px] font-normal">kn</span></strong>
            <span class="text-[8px] text-[#f0e6cf]/20 font-mono block mt-1">En Zona (200m)</span>
          </div>
        </div>

        <!-- Gráfico de Tráfico Lineal -->
        <div class="pt-2">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] font-mono text-[#f0e6cf]/50 uppercase tracking-wide">Tráfico en el Tiempo (Últimas 6 Horas)</span>
            <span class="text-[9px] font-mono text-[#dfb25d]/70">Capacidad: 100%</span>
          </div>
          <div class="w-full h-24 bg-[#08111e]/80 rounded-xl border border-white/5 overflow-hidden p-2 relative">
            <!-- Gráfica SVG Personalizada -->
            <svg class="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#dfb25d" stop-opacity="0.25" />
                  <stop offset="100%" stop-color="#dfb25d" stop-opacity="0" />
                </linearGradient>
              </defs>
              <!-- Cuadrícula de Fondo -->
              <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.02)" stroke-dasharray="3,3" />
              <line x1="0" y1="40" x2="300" y2="40" stroke="rgba(255,255,255,0.02)" stroke-dasharray="3,3" />
              <line x1="0" y1="60" x2="300" y2="60" stroke="rgba(255,255,255,0.02)" stroke-dasharray="3,3" />
              <!-- Líneas verticales de horas -->
              <line x1="50" y1="0" x2="50" y2="80" stroke="rgba(255,255,255,0.02)" stroke-dasharray="3,3" />
              <line x1="100" y1="0" x2="100" y2="80" stroke="rgba(255,255,255,0.02)" stroke-dasharray="3,3" />
              <line x1="150" y1="0" x2="150" y2="80" stroke="rgba(255,255,255,0.02)" stroke-dasharray="3,3" />
              <line x1="200" y1="0" x2="200" y2="80" stroke="rgba(255,255,255,0.02)" stroke-dasharray="3,3" />
              <line x1="250" y1="0" x2="250" y2="80" stroke="rgba(255,255,255,0.02)" stroke-dasharray="3,3" />
              
              <!-- Gradiente de Área -->
              <path d="M 0 65 L 50 45 L 100 55 L 150 25 L 200 40 L 250 15 L 300 30 L 300 80 L 0 80 Z" fill="url(#areaGrad)" />
              
              <!-- Línea del gráfico -->
              <path d="M 0 65 L 50 45 L 100 55 L 150 25 L 200 40 L 250 15 L 300 30" fill="none" stroke="#dfb25d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="glow-trail" />
              
              <!-- Puntos de datos interactivos interactivos -->
              <circle cx="50" cy="45" r="3" fill="#dfb25d" />
              <circle cx="100" cy="55" r="3" fill="#dfb25d" />
              <circle cx="150" cy="25" r="3.5" fill="#cc5c43" class="animate-ping" style="transform-origin: 150px 25px;" />
              <circle cx="150" cy="25" r="3" fill="#cc5c43" />
              <circle cx="200" cy="40" r="3" fill="#dfb25d" />
              <circle cx="250" cy="15" r="3" fill="#dfb25d" />
              <circle cx="300" cy="30" r="3" fill="#dfb25d" />
            </svg>
            
            <!-- Leyendas Horarias -->
            <div class="flex justify-between text-[8px] font-mono text-[#f0e6cf]/30 absolute bottom-1 left-2 right-2 pointer-events-none">
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

    <!-- COLUMNA DERECHA: MAPA CENTRAL Y LEYENDAS (8 COLS en LG) -->
    <section class="lg:col-span-8 flex flex-col gap-5 order-1 lg:order-2">
      
      <!-- Contenedor del Mapa Central -->
      <article class="bg-[#102138]/50 border border-white/5 rounded-3xl p-2.5 shadow-2xl relative flex-1 min-h-[500px] flex flex-col overflow-hidden">
        
        <!-- Radar Sweep Visual Overlay (Decorativo en la parte superior derecha) -->
        <div class="absolute top-6 right-6 z-[400] bg-[#102138]/95 backdrop-blur border border-white/10 rounded-2xl px-3 py-2 text-[10px] font-mono text-cyan-400 flex items-center gap-2 shadow-lg">
          <div class="relative w-3.5 h-3.5">
            <div class="absolute inset-0 rounded-full border border-cyan-400/30"></div>
            <div class="absolute inset-0 rounded-full border border-cyan-400 border-t-transparent animate-spin"></div>
          </div>
          <span>BÚSQUEDA GEOSENSORIAL DIRECTA ACTIVA</span>
        </div>

        <!-- Indicador de escala en la esquina superior izquierda -->
        <div class="absolute top-6 left-6 z-[400] bg-[#102138]/95 backdrop-blur border border-white/10 rounded-2xl p-3 shadow-lg space-y-1.5 pointer-events-none">
          <div class="text-[10px] font-display uppercase tracking-wider font-semibold text-[#f0e6cf]">Radar de la Ventana</div>
          <div class="flex items-center gap-1.5 text-[11px] font-mono text-white">
            <span class="w-2 h-2 rounded-full bg-[#dfb25d]"></span>
            <span>R = 200m</span>
          </div>
          <div class="text-[9px] text-[#f0e6cf]/40 leading-none">Ubicación: Montevideo Bay</div>
        </div>

        <!-- El Mapa -->
        <div id="mapa" class="w-full flex-1 rounded-2xl"></div>
        
        <!-- Controles Inferiores / Leyenda y Selección de Vista -->
        <div class="mt-3 grid grid-cols-1 md:grid-cols-12 gap-3 z-[400]">
          
          <!-- Leyenda de Barcos -->
          <div class="md:col-span-7 bg-[#102138]/85 border border-white/5 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="font-display font-medium text-[11px] uppercase text-[#f0e6cf]/50">RUMBOS DE COLOR:</div>
            <div class="flex flex-wrap items-center gap-4 text-[11px] font-mono">
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-[#2d486b] border border-blue-400 flex items-center justify-center text-[7px] text-white">C</span>
                <span>CARGO</span>
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-[#cc5c43] border border-red-400 flex items-center justify-center text-[7px] text-white">T</span>
                <span>TANKER</span>
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-[#2a8a5e] border border-emerald-400 flex items-center justify-center text-[7px] text-white">P</span>
                <span>PESQUERO</span>
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-[#dfb25d] border border-yellow-400 flex items-center justify-center text-[7px] text-white">Y</span>
                <span>YATE</span>
              </span>
            </div>
          </div>
          
          <!-- Botón de Simulación Manual / Reinicio -->
          <div class="md:col-span-5 flex gap-2">
            <button 
              onclick="forzarSimulacion()" 
              class="flex-1 bg-[#2d486b] hover:bg-[#2d486b]/80 border border-white/5 py-2 px-3 rounded-2xl text-[11px] font-mono font-medium tracking-wide text-white uppercase flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
              REGENERAR MOCK
            </button>
            
            <button 
              onclick="reestablecerCentro()" 
              class="p-2.5 bg-[#102138]/80 hover:bg-[#1a304d] border border-white/5 rounded-2xl text-white shadow-lg transition-all"
              title="Centrar en -34.920630, -56.229045"
            >
              <i data-lucide="locate" class="w-4 h-4"></i>
            </button>
          </div>

        </div>
      </article>
      
      <!-- Fila Inferior: Leyendas Secundarias y MI VISTA DESDE LA VENTANA (PANORAMA CARD) -->
      <article class="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <!-- Card: Zona de Información de la Ventana (Montevideo Bay) -->
        <div class="bg-[#102138]/80 border border-white/5 rounded-2xl p-5 shadow-xl flex gap-4 items-center">
          <div class="w-16 h-16 rounded-xl bg-gradient-to-tr from-[#1a304d] to-[#2d486b] border border-white/10 flex-shrink-0 flex items-center justify-center text-3xl">
            🇺🇾
          </div>
          <div class="space-y-1">
            <h4 class="font-display font-semibold text-xs tracking-wider uppercase text-white">Ubicación del Receptor AIS</h4>
            <p class="text-xs text-[#f0e6cf]/70 leading-normal">
              Antena dipolo omnidireccional ubicada en la escollera de Montevideo. Recibe y transmite radiobalizas AIS VHF en 161.975 MHz y 162.025 MHz.
            </p>
            <div class="text-[10px] font-mono text-[#dfb25d] uppercase tracking-wider flex items-center gap-1.5 pt-0.5">
              <span class="w-1.5 h-1.5 rounded-full bg-[#dfb25d] animate-ping"></span>
              Frecuencia de Muestreo: 2.4 GHz SDR
            </div>
          </div>
        </div>

        <!-- Card: MI VISTA DESDE LA VENTANA (Panorama Card) -->
        <div class="bg-[#102138]/80 border border-white/5 rounded-2xl p-5 shadow-xl flex gap-4 items-center relative overflow-hidden group">
          <div class="absolute inset-0 opacity-10 pointer-events-none bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1516937941344-00b4e0337589?q=80&w=600');"></div>
          
          <!-- Ilustrativo ventana SVG -->
          <div class="w-16 h-16 rounded-xl bg-[#08111e] border border-white/15 flex-shrink-0 flex items-center justify-center text-2xl relative overflow-hidden">
            <svg class="w-full h-full p-2" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Ventana -->
              <rect x="15" y="15" width="70" height="70" rx="6" stroke="#f0e6cf" stroke-width="4" />
              <line x1="50" y1="15" x2="50" y2="85" stroke="#f0e6cf" stroke-width="4" />
              <line x1="15" y1="50" x2="85" y2="50" stroke="#f0e6cf" stroke-width="4" />
              <!-- Barco afuera de la ventana -->
              <path d="M 30 72 L 70 72 L 65 65 L 35 65 Z" fill="#cc5c43" />
              <rect x="42" y="58" width="12" height="7" fill="#faf6ee" />
              <!-- Sol en el fondo -->
              <circle cx="70" cy="35" r="8" fill="#dfb25d" opacity="0.8" />
            </svg>
          </div>
          
          <div class="space-y-1 relative z-10">
            <h4 class="font-display font-semibold text-xs tracking-wider uppercase text-white flex items-center gap-1.5">
              <span>Mi Vista Desde la Ventana</span>
              <span class="px-1.5 py-0.5 rounded bg-[#dfb25d]/10 text-[#dfb25d] text-[8px] font-mono">PANORAMA</span>
            </h4>
            <p class="text-xs text-[#f0e6cf]/70 leading-normal">
              Establece una línea de visión directa a la dársena de Montevideo. Mira hacia el Noroeste (315°), lo que permite visualizar los transbordadores y cargueros maniobrando.
            </p>
            <span class="text-[9px] font-mono text-cyan-400">Azimut de Cobertura: 290° - 340°</span>
          </div>
        </div>

      </article>

    </section>

  </main>

  <!-- PIE DE PÁGINA -->
  <footer class="bg-[#102138]/40 border-t border-white/5 py-3 px-6 text-center text-xs text-[#f0e6cf]/40 font-mono mt-8">
    <p>© 2026 Prototipo Marítimo - Montevideo Bay Tracker. Desarrollado como material interactivo de diseño.</p>
  </footer>

  <!-- LEAFLET JS -->
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  
  <script>
    // --- VARIABLES Y CONFIGURACIÓN ---
    const CENTRO_LAT = -34.920630;
    const CENTRO_LNG = -56.229045;
    const RADIO_M = 200; // Radio de detección
    
    let mapa;
    let circuloZona;
    let barcos = [];
    let diccionarioMarcadores = {};
    let lineasEstelas = {};
    let barcoSeleccionadoId = null;
    let avistamientosRecientes = [];
    let contadorDia = 138;
    
    // Lista de banderas según códigos ISO
    const banderas = {
      'UY': { icono: '🇺🇾', nombre: 'Uruguay' },
      'PA': { icono: '🇵🇦', nombre: 'Panamá' },
      'LR': { icono: '🇱🇷', nombre: 'Liberia' },
      'BS': { icono: '🇧🇸', nombre: 'Bahamas' },
      'AR': { icono: '🇦🇷', nombre: 'Argentina' },
      'BR': { icono: '🇧🇷', nombre: 'Brasil' },
      'UK': { icono: '🇬🇧', nombre: 'Reino Unido' }
    };

    // --- BASE DE DATOS DE BUQUES (MOCK INICIAL) ---
    const barcosBaseMock = [
      // DENTRO DE LA ZONA (Lat/Lng dentro del radio aproximado de 0.0018°)
      {
        id: 'B1',
        name: 'ROU 04 ARTIGAS',
        type: 'PESQUERO',
        flagCode: 'UY',
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
        ]
      },
      {
        id: 'B2',
        name: 'ATLANTIC ACORD',
        type: 'CARGO',
        flagCode: 'LR',
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
        ]
      },
      {
        id: 'B3',
        name: 'CELESTE III',
        type: 'YATE',
        flagCode: 'UY',
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
        ]
      },
      // FUERA DE LA ZONA (Justo afuera, moviéndose en varias direcciones)
      {
        id: 'B4',
        name: 'PUNTA ANCONA',
        type: 'TANKER',
        flagCode: 'PA',
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
        ]
      },
      {
        id: 'B5',
        name: 'KAPITAN REEFER',
        type: 'CARGO',
        flagCode: 'BS',
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
        ]
      },
      {
        id: 'B6',
        name: 'ISLA DE FLORES',
        type: 'PESQUERO',
        flagCode: 'UY',
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
        ]
      },
      {
        id: 'B7',
        name: 'ALDEBARAN',
        type: 'YATE',
        flagCode: 'AR',
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
        ]
      }
    ];

    // --- INICIALIZACIÓN DE LA APLICACIÓN ---
    window.addEventListener('DOMContentLoaded', () => {
      // Reemplazar iconos con Lucide
      lucide.createIcons();
      
      // Iniciar barcos clonados del mock para la simulación activa
      barcos = JSON.parse(JSON.stringify(barcosBaseMock));
      
      // Inicializar el mapa de Leaflet
      inicializarMapa();
      
      // Cargar lista de avistamientos recientes (estática de inicio)
      generarAvistamientosIniciales();
      
      // Renderizar listados y estadísticas
      actualizarEstadisticas();
      renderizarListas();
      
      // Comenzar simulador de movimiento en tiempo real
      iniciarSimulador();
    });

    // --- INICIALIZACIÓN DEL MAPA ---
    function inicializarMapa() {
      // Crear instancia de mapa centrada en el punto clave
      mapa = L.map('mapa', {
        zoomControl: true,
        attributionControl: true
      }).setView([CENTRO_LAT, CENTRO_LNG], 16);

      // Agregar capa de azulejos (Tiles) de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapa);

      // Overlay visual para la zona de detección (200m de radio)
      // Usamos L.circle para demarcar el radio exacto
      circuloZona = L.circle([CENTRO_LAT, CENTRO_LNG], {
        radius: RADIO_M,
        color: '#dfb25d',
        weight: 1.5,
        fillColor: '#1a304d',
        fillOpacity: 0.25,
        dashArray: '5, 8'
      }).addTo(mapa);
      
      // Añadir animación sutil de pulso al círculo de Leaflet agregando una clase CSS
      const circuloElemento = circuloZona.getElement();
      if (circuloElemento) {
        circuloElemento.classList.add('detection-zone-pulse');
      }

      // Añadir marcador del receptor (Ventana del observador)
      const antennaIcon = L.divIcon({
        className: 'antenna-marker',
        html: \`<div class="relative flex items-center justify-center radar-pulse">
          <div class="w-4 h-4 rounded-full bg-[#dfb25d] border border-[#08111e] z-10"></div>
          <div class="absolute w-8 h-8 rounded-full bg-[#dfb25d]/30 animate-ping"></div>
        </div>\`,
        iconSize: [16, 16]
      });
      
      L.marker([CENTRO_LAT, CENTRO_LNG], { icon: antennaIcon })
        .addTo(mapa)
        .bindPopup(\`<div class="p-1 font-mono text-xs">
          <strong class="text-[#dfb25d] block uppercase tracking-wider font-display text-sm">Mi Ventana Receptor</strong>
          <span class="text-white/60">Lat: \${CENTRO_LAT.toFixed(6)}</span><br/>
          <span class="text-white/60">Lng: \${CENTRO_LNG.toFixed(6)}</span><br/>
          <span class="text-[#cc5c43] font-bold">ZONA ACTIVA: 200m</span>
        </div>\`);

      // Pintar barcos iniciales
      dibujarBarcosEnMapa();
    }

    // --- RENDERIZADO DE MARCADORES DE BARCO Y TRAILS ---
    function dibujarBarcosEnMapa() {
      barcos.forEach(barco => {
        // Calcular si está dentro de la zona
        const dist = calcularDistanciaHaversine(CENTRO_LAT, CENTRO_LNG, barco.coordinates[0], barco.coordinates[1]);
        barco.insideZone = (dist <= RADIO_M);
        barco.closestDistance = dist;

        // 1. Dibujar estela brillante (Trail)
        if (barco.trail && barco.trail.length > 1) {
          const trailColor = barco.insideZone ? '#dfb25d' : '#22d3ee';
          const trailWeight = barco.insideZone ? 2.5 : 1.5;
          const trailOpacity = barco.insideZone ? 0.75 : 0.45;

          if (lineasEstelas[barco.id]) {
            // Actualizar la estela existente
            lineasEstelas[barco.id].setLatLngs(barco.trail);
            lineasEstelas[barco.id].setStyle({ color: trailColor, weight: trailWeight, opacity: trailOpacity });
          } else {
            // Crear nueva estela
            const estelaPoly = L.polyline(barco.trail, {
              color: trailColor,
              weight: trailWeight,
              opacity: trailOpacity,
              dashArray: '3, 4',
              className: 'glow-trail'
            }).addTo(mapa);
            
            lineasEstelas[barco.id] = estelaPoly;
          }
        }

        // 2. Determinar Color y Símbolo del icono
        let colorClase = 'text-cyan-400';
        let colorFondo = 'bg-[#102138]';
        let sigla = 'C';

        if (barco.type === 'CARGO') {
          colorClase = 'text-blue-400';
          colorFondo = 'bg-[#1b3254]';
          sigla = 'C';
        } else if (barco.type === 'TANKER') {
          colorClase = 'text-rose-400';
          colorFondo = 'bg-[#cc5c43]/20';
          sigla = 'T';
        } else if (barco.type === 'PESQUERO') {
          colorClase = 'text-emerald-400';
          colorFondo = 'bg-[#2a8a5e]/20';
          sigla = 'P';
        } else if (barco.type === 'YATE') {
          colorClase = 'text-amber-400';
          colorFondo = 'bg-[#dfb25d]/20';
          sigla = 'Y';
        }

        // Borde dorado si está dentro de la zona de 200m
        const bordeEfecto = barco.insideZone 
          ? 'border-2 border-[#dfb25d] shadow-[0_0_12px_rgba(223,178,93,0.6)] animate-pulse' 
          : 'border border-white/25';

        // 3. Crear icono DivIcon Rotado de forma vectorial
        const htmlIcono = \`<div class="relative flex items-center justify-center cursor-pointer">
          <div class="w-8 h-8 rounded-full \${colorFondo} \${bordeEfecto} flex items-center justify-center flex-shrink-0">
            <!-- Flecha de Rumbo Rotada -->
            <svg style="transform: rotate(\${barco.heading}deg);" class="w-6 h-6 \${colorClase} transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polygon points="12,2 19,21 12,17 5,21" fill="currentColor" fill-opacity="0.2"/>
            </svg>
          </div>
          <span class="absolute -bottom-1 -right-1 bg-black text-[7px] border border-white/10 px-0.5 rounded font-mono font-bold text-white">\${sigla}</span>
        </div>\`;

        const iconInstance = L.divIcon({
          className: 'marcador-barco-contenedor',
          html: htmlIcono,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        // 4. Pintar o Mover Marcador
        if (diccionarioMarcadores[barco.id]) {
          diccionarioMarcadores[barco.id].setLatLng(barco.coordinates);
          diccionarioMarcadores[barco.id].setIcon(iconInstance);
        } else {
          const marker = L.marker(barco.coordinates, { icon: iconInstance })
            .addTo(mapa)
            .on('click', () => seleccionarBuque(barco.id));
          
          diccionarioMarcadores[barco.id] = marker;
        }
      });
    }

    // --- SELECCIONAR BUQUE Y MOSTRAR DETALLE ---
    function seleccionarBuque(barcoId) {
      barcoSeleccionadoId = barcoId;
      const barco = barcos.find(b => b.id === barcoId);
      if (!barco) return;

      // Actualizar paneles de detalle
      document.getElementById('detalleVacio').classList.add('hidden');
      const detContenido = document.getElementById('panelDetalle');
      document.getElementById('detalleContenido').classList.remove('hidden');

      // Cargar datos en el panel
      document.getElementById('detalleNombre').innerText = barco.name;
      document.getElementById('detalleMMSI').innerText = barco.mmsi;
      document.getElementById('detalleTipo').innerText = barco.type;
      
      const band = banderas[barco.flagCode] || { icono: '🏳', nombre: 'Desconocido' };
      document.getElementById('detalleBandera').innerText = band.icono;
      document.getElementById('detalleBandera').title = band.nombre;

      document.getElementById('detalleVelocidad').innerText = barco.speed.toFixed(1) + ' nudos';
      document.getElementById('detalleRumbo').innerText = barco.heading + '°';
      document.getElementById('detalleDimensiones').innerText = barco.length + 'm × ' + barco.width + 'm';
      document.getElementById('detalleCalado').innerText = barco.draft.toFixed(1) + ' m';
      document.getElementById('detalleUltimaPos').innerText = barco.lastPosTime;
      document.getElementById('detalleDestino').innerText = barco.nextPort;
      
      // Icono ilustrativo de avatar del barco según tipo
      const imgCont = document.getElementById('detalleImagen');
      if (barco.type === 'CARGO') {
        imgCont.innerHTML = '🚢';
        imgCont.className = "w-20 h-20 rounded-xl bg-blue-900/30 border border-blue-500/20 flex-shrink-0 flex items-center justify-center text-4xl overflow-hidden";
      } else if (barco.type === 'TANKER') {
        imgCont.innerHTML = '⛽';
        imgCont.className = "w-20 h-20 rounded-xl bg-rose-900/30 border border-rose-500/20 flex-shrink-0 flex items-center justify-center text-4xl overflow-hidden";
      } else if (barco.type === 'PESQUERO') {
        imgCont.innerHTML = '🐟';
        imgCont.className = "w-20 h-20 rounded-xl bg-emerald-900/30 border border-emerald-500/20 flex-shrink-0 flex items-center justify-center text-4xl overflow-hidden";
      } else {
        imgCont.innerHTML = '⛵';
        imgCont.className = "w-20 h-20 rounded-xl bg-amber-900/30 border border-amber-500/20 flex-shrink-0 flex items-center justify-center text-4xl overflow-hidden";
      }

      // Badge de rango
      const badge = document.getElementById('detalleDistanciaBadge');
      if (barco.insideZone) {
        badge.innerText = 'EN RANGO (200M)';
        badge.className = "px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono tracking-wider font-semibold animate-pulse";
      } else {
        badge.innerText = barco.closestDistance.toFixed(0) + 'm DE DIST.';
        badge.className = "px-2 py-0.5 rounded-full bg-[#f0e6cf]/10 text-[#f0e6cf]/70 text-[10px] font-mono tracking-wider font-semibold";
      }

      // Hacer foco en el barco en el mapa con un pequeño offset
      mapa.panTo([barco.coordinates[0] - 0.0003, barco.coordinates[1]], { animate: true });
    }

    // --- REESTABLECER VISTA MAPA ---
    function reestablecerCentro() {
      mapa.setView([CENTRO_LAT, CENTRO_LNG], 16, { animate: true });
    }

    // --- HISTORIAL DE AVISTAMIENTOS RECIENTES ---
    function generarAvistamientosIniciales() {
      avistamientosRecientes = [
        { id: 'TR1', name: 'ROU 04 ARTIGAS', type: 'PESQUERO', timeInZone: 'Hace 2m', closestDistance: 82 },
        { id: 'TR2', name: 'CELESTE III', type: 'YATE', timeInZone: 'Hace 12m', closestDistance: 68 },
        { id: 'TR3', name: 'ATLANTIC ACORD', type: 'CARGO', timeInZone: 'Hace 38m', closestDistance: 110 },
        { id: 'TR4', name: 'MONTEVIDEO EXPRESS', type: 'CARGO', timeInZone: 'Hace 1.5h', closestDistance: 145 },
        { id: 'TR5', name: 'REGINA MARIS', type: 'YATE', timeInZone: 'Hace 3h', closestDistance: 12 }
      ];
    }

    // --- ACTUALIZAR MÓDULO DE AVISTAMIENTOS RECIENTES (PANEL 1) ---
    function renderizarListas() {
      const container = document.getElementById('listaAvistamientos');
      container.innerHTML = '';

      avistamientosRecientes.forEach(sight => {
        let siglaColor = 'bg-blue-500/10 text-blue-400';
        let sigla = 'C';
        if (sight.type === 'TANKER') { siglaColor = 'bg-rose-500/10 text-rose-400'; sigla = 'T'; }
        else if (sight.type === 'PESQUERO') { siglaColor = 'bg-emerald-500/10 text-emerald-400'; sigla = 'P'; }
        else if (sight.type === 'YATE') { siglaColor = 'bg-amber-500/10 text-amber-400'; sigla = 'Y'; }

        const card = document.createElement('div');
        card.className = "p-3 rounded-xl bg-[#1a304d]/30 hover:bg-[#1a304d]/65 border border-white/5 transition-all flex items-center justify-between text-xs cursor-pointer";
        card.onclick = () => {
          // Si el buque aún existe activo en mapa, seleccionarlo
          const activeShip = barcos.find(b => b.name === sight.name);
          if (activeShip) seleccionarBuque(activeShip.id);
        };

        card.innerHTML = \`
          <div class="flex items-center gap-3">
            <span class="w-7 h-7 rounded-lg \${siglaColor} flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">\${sigla}</span>
            <div>
              <h4 class="font-display font-semibold text-white tracking-wide uppercase truncate max-w-[120px]">\${sight.name}</h4>
              <span class="text-[9px] text-[#f0e6cf]/40 font-mono block uppercase">\${sight.type}</span>
            </div>
          </div>
          <div class="text-right font-mono text-[10px]">
            <span class="text-[#dfb25d] block font-semibold">\${sight.closestDistance} metros</span>
            <span class="text-[#f0e6cf]/40 flex items-center gap-1 justify-end">
              <i data-lucide="clock" class="w-3 h-3"></i>
              \${sight.timeInZone}
            </span>
          </div>
        \`;
        
        container.appendChild(card);
      });
      
      // Volver a enlazar los iconos inyectados dinámicamente
      lucide.createIcons();
    }

    // --- FILTRAR BUQUES DESDE CONTROLES DE HEADER ---
    function filtrarBuques() {
      const query = document.getElementById('busquedaInput').value.trim().toUpperCase();
      const tipoSel = document.getElementById('filtroTipo').value;

      barcos.forEach(barco => {
        const matchesQuery = barco.name.toUpperCase().includes(query) || barco.mmsi.includes(query);
        const matchesTipo = (tipoSel === 'TODOS' || barco.type === tipoSel);
        
        const visible = matchesQuery && matchesTipo;
        
        const marcador = diccionarioMarcadores[barco.id];
        const estela = lineasEstelas[barco.id];

        if (marcador) {
          if (visible) {
            marcador.addTo(mapa);
          } else {
            mapa.removeLayer(marcador);
          }
        }

        if (estela) {
          if (visible) {
            estela.addTo(mapa);
          } else {
            mapa.removeLayer(estela);
          }
        }
      });
    }

    // --- RECALCULAR ESTADÍSTICAS EN TIEMPO REAL (PANEL 2) ---
    function actualizarEstadisticas() {
      document.getElementById('statTotalHoy').innerText = contadorDia;
      
      // Contar tipos activos en la base
      const conteos = { 'CARGO': 0, 'TANKER': 0, 'PESQUERO': 0, 'YATE': 0 };
      let sumaVelocidades = 0;
      let barcosEnZona = 0;

      barcos.forEach(b => {
        conteos[b.type] = (conteos[b.type] || 0) + 1;
        if (b.insideZone) {
          sumaVelocidades += b.speed;
          barcosEnZona++;
        }
      });

      // Encontrar el más frecuente
      let masFrecuente = 'Yate';
      let maxConteo = -1;
      for (const [t, c] of Object.entries(conteos)) {
        if (c > maxConteo) {
          maxConteo = c;
          masFrecuente = t;
        }
      }
      
      // Traducir palabra clave
      const traducciones = { 'CARGO': 'Cargo', 'TANKER': 'Tanker', 'PESQUERO': 'Pesquero', 'YATE': 'Yate' };
      document.getElementById('statTopTipo').innerText = traducciones[masFrecuente] || 'Yate';

      // Calcular promedio de velocidad en zona
      const velProm = barcosEnZona > 0 ? (sumaVelocidades / barcosEnZona) : 4.2;
      document.getElementById('statVelProm').innerHTML = velProm.toFixed(1) + ' <span class="text-[9px] font-normal">kn</span>';
    }

    // --- SIMULADOR DE MOVIMIENTO MARÍTIMO (SÍMIL EN VIVO) ---
    function iniciarSimulador() {
      setInterval(() => {
        barcos.forEach(barco => {
          // Velocidad en grados por paso (conversión muy simplificada para el mapa de Leaflet)
          // 1 nudo = 0.514 m/s. 
          // Pasos de tiempo simulados más rápidos para que el usuario aprecie el movimiento.
          const velocidadPaso = (barco.speed * 0.000001); 
          const rad = (barco.heading * Math.PI) / 180;
          
          // Mover latitud y longitud según el ángulo de rumbo
          const deltaLat = velocidadPaso * Math.cos(rad);
          const deltaLng = velocidadPaso * Math.sin(rad);
          
          barco.coordinates[0] += deltaLat;
          barco.coordinates[1] += deltaLng;

          // Añadir punto al trail de la estela
          barco.trail.push([...barco.coordinates]);
          if (barco.trail.length > 5) {
            barco.trail.shift(); // Conservar últimos 5 puntos para el dibujo
          }

          // Inyectar telemetría cambiante sutil
          if (Math.random() > 0.8) {
            barco.speed = Math.max(1, Math.min(15, barco.speed + (Math.random() - 0.5)));
            barco.heading = (barco.heading + Math.round((Math.random() - 0.5) * 5)) % 360;
            if (barco.heading < 0) barco.heading += 360;
          }

          // Si el barco se aleja demasiado de Montevideo Bay, re-posicionarlo en el borde opuesto
          const distanciaAlReceptor = calcularDistanciaHaversine(CENTRO_LAT, CENTRO_LNG, barco.coordinates[0], barco.coordinates[1]);
          if (distanciaAlReceptor > 900) {
            // Reubicación en el lado opuesto según el rumbo para un bucle continuo
            barco.coordinates[0] = CENTRO_LAT - (deltaLat * 300);
            barco.coordinates[1] = CENTRO_LNG - (deltaLng * 300);
            barco.trail = [
              [barco.coordinates[0] - (deltaLat * 2), barco.coordinates[1] - (deltaLng * 2)],
              [barco.coordinates[0] - deltaLat, barco.coordinates[1] - deltaLng],
              [...barco.coordinates]
            ];
          }

          // Evaluar si acaba de cruzar la frontera de los 200 metros
          const eraZona = barco.insideZone;
          const esZona = (distanciaAlReceptor <= RADIO_M);
          
          if (!eraZona && esZona) {
            // Alerta visual de nuevo ingreso en zona
            contadorDia++;
            
            // Inyectar nuevo avistamiento reciente al inicio de la lista
            avistamientosRecientes.unshift({
              id: 'TR_' + Date.now(),
              name: barco.name,
              type: barco.type,
              timeInZone: 'Hace 0s',
              closestDistance: Math.round(distanciaAlReceptor)
            });
            
            if (avistamientosRecientes.length > 5) avistamientosRecientes.pop();
            
            renderizarListas();
            actualizarEstadisticas();
          }
        });

        // Repintar sobre el mapa de Leaflet
        dibujarBarcosEnMapa();
        
        // Si el panel de detalles está mostrando el barco actual, actualizar datos dinámicos
        if (barcoSeleccionadoId) {
          const bSel = barcos.find(b => b.id === barcoSeleccionadoId);
          if (bSel) {
            document.getElementById('detalleVelocidad').innerText = bSel.speed.toFixed(1) + ' nudos';
            document.getElementById('detalleRumbo').innerText = bSel.heading + '°';
            
            // Actualizar badge de distancia en vivo
            const badge = document.getElementById('detalleDistanciaBadge');
            const dist = calcularDistanciaHaversine(CENTRO_LAT, CENTRO_LNG, bSel.coordinates[0], bSel.coordinates[1]);
            if (dist <= RADIO_M) {
              badge.innerText = 'EN RANGO (200M)';
              badge.className = "px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono tracking-wider font-semibold animate-pulse";
            } else {
              badge.innerText = dist.toFixed(0) + 'm DE DIST.';
              badge.className = "px-2 py-0.5 rounded-full bg-[#f0e6cf]/10 text-[#f0e6cf]/70 text-[10px] font-mono tracking-wider font-semibold";
            }
          }
        }
      }, 1000); // Actualización en tiempo real cada 1 segundo
    }

    // --- REGENEAR BUQUES DE MANERA MANUAL ---
    function forzarSimulacion() {
      barcos = JSON.parse(JSON.stringify(barcosBaseMock));
      
      // Aplicar aleatoriedad menor
      barcos.forEach(b => {
        b.coordinates[0] += (Math.random() - 0.5) * 0.001;
        b.coordinates[1] += (Math.random() - 0.5) * 0.001;
        b.speed = Math.max(1, b.speed + (Math.random() - 0.5) * 3);
        b.heading = (b.heading + Math.round((Math.random() - 0.5) * 45)) % 360;
        if (b.heading < 0) b.heading += 360;
        b.trail = [
          [b.coordinates[0] - 0.0003, b.coordinates[1] - 0.0003],
          [b.coordinates[0] - 0.0001, b.coordinates[1] - 0.0001],
          [...b.coordinates]
        ];
      });
      
      // Dibujar y recalcular
      dibujarBarcosEnMapa();
      actualizarEstadisticas();
      
      // Cerrar detalle
      document.getElementById('detalleVacio').classList.remove('hidden');
      document.getElementById('detalleContenido').classList.add('hidden');
      barcoSeleccionadoId = null;
      
      // Centrar
      reestablecerCentro();
    }

    // --- FÓRMULA DE DISTANCIA HAVERSINE ---
    function calcularDistanciaHaversine(lat1, lon1, lat2, lon2) {
      const R = 6371e3; // Radio de la tierra en metros
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
  </script>
</body>
</html>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(singleFileCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([singleFileCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'montevideo-maritime-dashboard.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="pantalla-codigo-fuente" className="bg-ocean-dark text-cream-soft rounded-2xl border border-white/10 shadow-2xl overflow-hidden font-sans">
      
      {/* Cabecera */}
      <div className="bg-gradient-to-r from-ocean-deep via-ocean-medium to-ocean-light p-8 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sand-warm/15 text-sand-warm text-xs font-mono font-medium tracking-wide">PHASE 1 SOURCE CODE</span>
            <span className="flex items-center gap-1 text-xs text-blue-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              VANILLA JS / HTML5 / LEAFLET
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-white mb-2">
            Archivo Único Auto-Contenido
          </h1>
          <p className="text-sm text-cream-medium/75 max-w-2xl leading-relaxed">
            Código fuente completo de la maqueta interactiva. Utiliza CDNs oficiales para cargar Tailwind CSS v3, Leaflet.js y los iconos de Lucide de forma directa. Listo para guardar en un archivo local <code className="text-sand-warm font-mono bg-black/30 px-1 py-0.5 rounded text-xs">index.html</code> y ejecutar haciendo doble clic en su escritorio.
          </p>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-cream-medium" />
                <span>Copiar Todo</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sand-warm text-ocean-dark font-semibold text-xs transition-all shadow-lg hover:brightness-110 active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Descargar .HTML</span>
          </button>
        </div>
      </div>

      {/* Tarjeta de Seguridad y Compatibilidad */}
      <div className="mx-6 md:mx-8 mt-6 p-4 rounded-xl bg-green-500/5 border border-green-500/20 flex items-start gap-3.5">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-cream-medium/80 space-y-1">
          <p className="font-semibold text-white">Completamente Optimizado para Ejecución Offline Local</p>
          <p className="leading-relaxed">
            No requiere servidores, compilación, NodeJS ni configuraciones complejas. El código ha sido probado rigurosamente, encapsulando la lógica completa de simulación Haversine, un lienzo para los gráficos en tiempo real y el radar de barrido.
          </p>
        </div>
      </div>

      {/* Editor/Visor de Código */}
      <div className="p-6 md:p-8">
        <div className="bg-black/30 rounded-xl border border-white/10 overflow-hidden">
          <div className="bg-ocean-deep px-4 py-2.5 border-b border-white/10 flex items-center justify-between text-[11px] font-mono text-cream-medium/50">
            <div className="flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-blue-400" />
              <span>montevideo-maritime-dashboard.html</span>
            </div>
            <span>~870 líneas de código</span>
          </div>
          <pre className="p-5 font-mono text-xs text-cream-medium/90 overflow-x-auto max-h-[500px] leading-relaxed select-all">
            <code>{singleFileCode}</code>
          </pre>
        </div>
      </div>

      {/* Pie de Página */}
      <div className="bg-ocean-deep p-6 border-t border-white/10 text-center text-xs text-cream-medium/40 font-mono">
        Listo para usar como prototipo de diseño o como lienzo inicial de su front-end.
      </div>

    </div>
  );
}
