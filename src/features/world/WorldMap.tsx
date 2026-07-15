import { useKunuStore } from '../../store/useKunuStore'
import type { Journey } from '../../types/models'

function project([lat, lng]: [number, number]): [number, number] {
  return [((lng + 180) / 360) * 1000, ((90 - lat) / 180) * 520]
}

export function WorldMap({ journeys, fallback = false }: { journeys: Journey[]; fallback?: boolean }) {
  const selected = useKunuStore((state) => state.selectedJourneyId)
  const select = useKunuStore((state) => state.selectJourney)
  return <div className="map-shell">
    <svg viewBox="0 0 1000 520" role="img" aria-label="Stylized world map showing Clara’s journeys">
      <defs><linearGradient id="map-sea" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#dff7f5"/><stop offset="1" stopColor="#b9e2e1"/></linearGradient><filter id="land-shadow"><feDropShadow dx="0" dy="7" stdDeviation="9" floodColor="#0c1b23" floodOpacity=".12"/></filter></defs>
      <rect width="1000" height="520" rx="34" fill="url(#map-sea)"/>
      <g fill="#f4eee1" stroke="#d4cbb8" strokeWidth="2" filter="url(#land-shadow)">
        <path d="M58 120 117 64l98-31 104 31 57 55-42 42-37-8-19 61-64 30-54-22-17-64-76 7Z"/>
        <path d="m271 246 50 18 38 78-19 108-47 50-32-89-29-73Z"/>
        <path d="m478 100 73-52 82 8 27 44 75 16 34 68-63 30-17 65-61-17-19-54-47-11-36-41-53-8Z"/>
        <path d="m516 213 88 13 57 69-25 141-66 33-50-93-34-105Z"/>
        <path d="m722 142 92-41 107 45 25 68-52 56-93-20-52-47Z"/>
        <path d="m819 352 73-24 59 35-12 69-82 12-47-42Z"/>
      </g>
      <g fill="none" stroke="#fff" opacity=".55"><path d="M0 175h1000M0 345h1000"/><path d="M250 0v520M500 0v520M750 0v520"/></g>
      {journeys.map((journey) => { const [x, y] = project(journey.coordinates); const active = selected === journey.id; return <g key={journey.id} transform={`translate(${x} ${y})`} className="map-pin" onClick={() => select(journey.id)} role="button" tabIndex={0} aria-label={`Select ${journey.location}`} onKeyDown={(event) => { if (event.key === 'Enter') select(journey.id) }}><circle r={active ? 18 : 13} fill="#18c7c9" opacity=".22"/><circle r={active ? 8 : 6} fill={active ? '#0c1b23' : '#0e9fa8'} stroke="white" strokeWidth="3"/><text y="-19" textAnchor="middle">{journey.location}</text></g> })}
    </svg>
    {fallback && <p className="webgl-fallback">3D isn’t available here, so Kunu is showing the accessible journey map.</p>}
  </div>
}
