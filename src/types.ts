/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ShipType = 'CARGO' | 'TANKER' | 'PESQUERO' | 'YATE';

export interface Ship {
  id: string;
  name: string;
  type: ShipType;
  flag: string;
  flagCode: string;
  mmsi: string;
  speed: number; // knots
  heading: number; // degrees (0-360)
  lastPosTime: string; // e.g. "hace 12s"
  nextPort: string;
  coordinates: [number, number]; // [lat, lng]
  trail: [number, number][]; // coordinates history for blue trails
  imageUrl: string;
  insideZone: boolean;
  length: number; // meters
  width: number; // meters
  draft: number; // meters
  callSign: string;
  closestDistance: number; // closest distance to center in meters
}

export interface RecentTransit {
  id: string;
  name: string;
  type: ShipType;
  timeInZone: string;
  closestDistance: number; // in meters
}

export interface LiveStats {
  totalVesselsToday: number;
  mostFrequentType: ShipType;
  avgSpeedInZone: number; // in knots
}
