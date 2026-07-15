import { useKunuStore } from '../../store/useKunuStore'

const levels = ['Curious Traveler', 'City Explorer', 'Country Adventurer', 'World Pathfinder', 'Master Explorer', 'Legend of the World']

export function Passport() {
  const child = useKunuStore((state) => state.child)
  const explorer = useKunuStore((state) => state.explorer)
  const badges = useKunuStore((state) => state.badges)
  const collectibles = useKunuStore((state) => state.collectibles)
  const level = Math.min(Math.floor(explorer.xp / 300), levels.length - 1)
  const next = (level + 1) * 300
  return <main className="content-page passport-page"><header className="passport-cover"><div className="passport-mark"><img src="/kunu-mark.svg" alt=""/></div><p>Private explorer passport</p><h1>{child.name}</h1><span>{levels[level]}</span></header><section className="xp-card"><div><small>Explorer energy</small><strong>{explorer.xp} XP</strong></div><div className="xp-track"><span style={{ width: `${Math.min(100, explorer.xp / next * 100)}%` }}/></div><p>{next - explorer.xp} XP until {levels[Math.min(level + 1, levels.length - 1)]}</p></section><section className="badge-section"><div><p className="eyebrow">Journey stamps</p><h2>Collected with curiosity</h2></div><div className="badge-grid">{badges.map((badge) => <article className={`badge-card ${badge.unlockedAt ? 'is-unlocked' : ''}`} key={badge.id}><img src={badge.asset} alt=""/><h3>{badge.name}</h3><p>{badge.unlockedAt ? badge.description : 'Complete every Yosemite activity to reveal this stamp.'}</p><span>{badge.unlockedAt ? 'In passport' : 'Waiting in Yosemite'}</span></article>)}</div></section><section className="keepsake-section"><div><p className="eyebrow">Trail keepsakes</p><h2>Little things, remembered</h2></div><div className="keepsake-grid">{collectibles.map((item)=><article key={item.id} className={item.collected?'is-collected':''}><img src={item.asset} alt=""/><div><h3>{item.name}</h3><span>{item.collected?'Found in Yosemite':'Waiting on the trail'}</span></div></article>)}</div></section></main>
}
