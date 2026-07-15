import { useKunuStore } from '../../store/useKunuStore'
import { CharacterArt } from '../shared/CharacterArt'

export function Profile() {
  const child = useKunuStore((state) => state.child)
  const parent = useKunuStore((state) => state.parent)
  const settings = useKunuStore((state) => state.settings)
  const update = useKunuStore((state) => state.updateSettings)
  const reset = useKunuStore((state) => state.resetDemo)
  return <main className="content-page"><header className="content-heading"><p className="eyebrow">Family space</p><h1>Made for {child.name}.</h1><p>{parent.name} · Memories and progress remain private on this device.</p></header><div className="profile-layout">
    <section className="profile-card"><CharacterArt className="profile-character-art" variant="portrait"/><div><small>Explorer</small><h2>{child.name}</h2><p>Born {new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${child.dateOfBirth}T12:00:00Z`))}</p></div></section>
    <section className="settings-card"><h2>Sound & comfort</h2><SettingToggle label="Master audio" description="Enable all Kunu sounds" checked={settings.masterAudio} onChange={(value) => update({ masterAudio: value })}/><SettingToggle label="Music" description="Calm home and light adventure music" checked={settings.music} onChange={(value) => update({ music: value })}/><SettingToggle label="Ambience" description="Birds, wind, water, and footsteps" checked={settings.ambience} onChange={(value) => update({ ambience: value })}/><label className="volume-field"><span><strong>Volume</strong><small>{Math.round(settings.volume * 100)}%</small></span><input type="range" min="0" max="1" step=".05" value={settings.volume} onChange={(event) => update({ volume: Number(event.target.value) })}/></label><SettingToggle label="Reduced motion" description="Minimize transitions and camera movement" checked={settings.reducedMotion} onChange={(value) => update({ reducedMotion: value })}/><SettingToggle label="Reduced sensory" description="Soften flashes, particles, and layered sound" checked={settings.reducedSensory} onChange={(value) => update({ reducedSensory: value })}/></section>
    <section className="privacy-card"><h2>Your family’s privacy</h2><p>Reference photos are sent to OpenAI only after explicit consent and are not persisted by Kunu’s server. Only the approved generated character is stored in IndexedDB on this device.</p><details><summary>Install Kunu</summary><p>On iPhone, open Share and choose Add to Home Screen. In desktop browsers, use the install icon in the address bar.</p></details><button className="danger-button" onClick={() => { if (window.confirm('Reset all local Kunu progress, settings, and approved character?')) void reset() }}>Reset demo data</button></section>
    <section className="character-library"><div><p className="eyebrow">Approved Kunu character</p><h2>One character, every world</h2><p>The generated sheet is stored only on this device. Original procedural art remains the offline fallback.</p></div><CharacterArt className="reference-sheet" variant="sheet" fallback="/assets/characters/clara-reference-sheet.svg"/></section>
  </div></main>
}

function SettingToggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="setting-toggle"><span><strong>{label}</strong><small>{description}</small></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)}/><i/></label>
}
