import { useState } from 'react'
import { formatJourneyDate, journeyAge } from '../../lib/journey'
import { useKunuStore } from '../../store/useKunuStore'
import type { Journey } from '../../types/models'
import { Button } from '../shared/Button'

export function Timeline() {
  const journeys = useKunuStore((state) => state.journeys)
  const child = useKunuStore((state) => state.child)
  const [portal, setPortal] = useState<Journey | null>(null)
  return <main className="content-page"><header className="content-heading"><p className="eyebrow">Growing through journeys</p><h1>A story measured in places.</h1><p>From six to seven, every journey becomes part of Clara’s timeline.</p></header><div className="timeline-list">{journeys.map((journey, index) => <article className="timeline-entry" key={journey.id}><div className="timeline-age"><span>{journeyAge(child, journey)}</span><small>years old</small></div><button className="timeline-cover" onClick={() => setPortal(journey)}><img src={journey.coverAsset} alt={`Open ${journey.location} memory portal`}/><span>Open memory</span></button><div className="timeline-copy"><p>{formatJourneyDate(journey.date)} · {journey.theme}</p><h2>{journey.location}, {journey.country}</h2><p>{journey.memoryText}</p><span className={`status-pill status-pill--${journey.status}`}>{journey.status === 'playable' ? 'Playable' : 'Preparing beautifully'}</span></div>{index < journeys.length - 1 && <i className="timeline-line"/>}</article>)}</div>{portal && <div className="memory-portal" role="dialog" aria-modal="true"><div className="portal-art"><img src={portal.photos[0]?.generatedAsset ?? portal.coverAsset} alt={portal.photos[0]?.alt}/><img className="portal-frame" src="/assets/ui/memory-portal-frame.svg" alt=""/></div><div className="memory-portal__glass"><p className="eyebrow">Memory portal</p><h2>{portal.location}</h2><p>{formatJourneyDate(portal.date)} · Age {journeyAge(child, portal)}</p><Button onClick={() => setPortal(null)} variant="glass">Close memory</Button></div></div>}</main>
}
