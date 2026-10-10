'use client';

import InteractiveMap from './InteractiveMap';
import type { Incident, Bus } from '@/lib/schemas/database';

interface MapContainerProps {
  incidents?: Incident[];
  buses?: Bus[];
  onIncidentClick?: (incident: Incident) => void;
  onBusClick?: (bus: Bus) => void;
}

export default function MapContainer(props: MapContainerProps) {
  return <InteractiveMap {...props} />;
}
