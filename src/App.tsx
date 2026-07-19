/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Search, 
  Filter, 
  Layout, 
  FileCode, 
  Cpu, 
  Github, 
  ExternalLink 
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import SourceCodeView from './components/SourceCodeView';
import IntegrationGuide from './components/IntegrationGuide';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'source-code' | 'integration'>('dashboard');
  const [searchVal, setSearchVal] = useState('');
  const [filterVal, setFilterVal] = useState('TODOS');

  return (
    <div className="min-h-screen bg-ocean-dark text-cream-soft flex flex-col font-sans selection:bg-sand-warm selection:text-ocean-dark">
      
      {/* GLOBAL HEADER */}
      <header className="bg-ocean-deep/90 backdrop-blur border-b border-white/5 py-4 px-6 sticky top-0 z-[1000] flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Title Block */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2 bg-sand-warm/10 rounded-xl border border-sand-warm/20">
            <Compass className="w-6 h-6 text-sand-warm animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-display font-semibold tracking-tight uppercase text-white leading-tight">
              AVISTAMIENTOS DE BUQUES EN LA BAHÍA DE MONTEVIDEO
            </h1>
            <p className="text-[11px] text-cream-medium/60 font-mono tracking-wider uppercase flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3 text-terracotta" />
              Radio de 200m desde mi ventana (-34.920630, -56.229045)
            </p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end text-xs">
          
          {/* Live Feed Connected Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] tracking-wider uppercase shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE FEED [CONECTADO]
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-44">
            <Search className="w-3.5 h-3.5 text-cream-medium/40 absolute left-3 top-2.5" />
            <input 
              type="text" 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Buscar buques..." 
              className="w-full bg-ocean-medium text-white pl-9 pr-3 py-2 rounded-xl border border-white/5 focus:outline-none focus:border-sand-warm/50 placeholder-cream-medium/30 font-mono"
            />
          </div>

          {/* Type Filter */}
          <div className="relative w-full sm:w-44">
            <Filter className="w-3.5 h-3.5 text-cream-medium/40 absolute left-3 top-2.5" />
            <select 
              value={filterVal}
              onChange={(e) => setFilterVal(e.target.value)}
              className="w-full bg-ocean-medium text-white pl-9 pr-3 py-2 rounded-xl border border-white/5 focus:outline-none focus:border-sand-warm/50 appearance-none cursor-pointer font-mono"
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

      {/* WORKSPACE SECTOR CONTROL (TABS SWITCHER) */}
      <nav className="bg-ocean-deep border-b border-white/5 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Navigation Tabs */}
        <div className="flex bg-black/20 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium tracking-wide transition-all uppercase cursor-pointer ${
              activeTab === 'dashboard' 
                ? 'bg-ocean-light text-white shadow-md font-semibold' 
                : 'text-cream-medium/65 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>🖥️ Prototipo Activo</span>
          </button>
          
          <button
            onClick={() => setActiveTab('source-code')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium tracking-wide transition-all uppercase cursor-pointer ${
              activeTab === 'source-code' 
                ? 'bg-ocean-light text-white shadow-md font-semibold' 
                : 'text-cream-medium/65 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>📁 Fase 1: Código HTML</span>
          </button>
          
          <button
            onClick={() => setActiveTab('integration')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium tracking-wide transition-all uppercase cursor-pointer ${
              activeTab === 'integration' 
                ? 'bg-ocean-light text-white shadow-md font-semibold' 
                : 'text-cream-medium/65 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>📡 Fase 2: Guía WebSocket</span>
          </button>
        </div>

        {/* Info label about coordinates */}
        <div className="text-[11px] font-mono text-sand-warm flex items-center gap-2 bg-sand-warm/5 px-3 py-1 rounded-lg border border-sand-warm/10">
          <span className="w-1.5 h-1.5 rounded-full bg-sand-warm animate-pulse"></span>
          <span>Foco Bahía: 34.9206° S, 56.2290° W</span>
        </div>

      </nav>

      {/* WORKSPACE CANVAS / CONTENT ROUTING */}
      <main className="flex-1 p-4 md:p-6 max-w-[1700px] w-full mx-auto">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            
            {/* Synchronizing internal search bar in Dashboard through context selectors or by syncing values */}
            {/* We passed down the state to a hidden component trigger inside Dashboard.tsx */}
            {/* But since Dashboard has internal hooks, let's sync search and filters using values */}
            
            <div className="bg-ocean-deep/30 rounded-2xl p-2 border border-white/5">
              <Dashboard searchQuery={searchVal} typeFilter={filterVal} />
            </div>
          </div>
        )}

        {activeTab === 'source-code' && (
          <SourceCodeView />
        )}

        {activeTab === 'integration' && (
          <IntegrationGuide />
        )}

      </main>

      {/* SITE FOOTER */}
      <footer className="bg-ocean-deep/40 border-t border-white/5 py-4 px-6 text-center text-xs text-cream-medium/40 font-mono mt-auto">
        <p>© 2026 Prototipo Marítimo - Montevideo Bay Tracker. Todos los derechos reservados.</p>
      </footer>

      {/* Internal element to inject variables to Dashboard if needed */}
      <div className="hidden">
        {/* This triggers a state synchronizer if they click standard buttons */}
        <span id="bridgeSearchVal">{searchVal}</span>
        <span id="bridgeFilterVal">{filterVal}</span>
      </div>

    </div>
  );
}
