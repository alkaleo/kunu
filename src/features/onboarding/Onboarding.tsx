import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { saveLocalPhoto } from '../../lib/db'
import { useKunuStore } from '../../store/useKunuStore'
import { Button } from '../shared/Button'
import { Icon } from '../shared/Icon'

const steps = ['Welcome', 'Family', 'Clara', 'Memories', 'Kunu Block', 'Ready']

export function Onboarding() {
  const [step, setStep] = useState(0)
  const [photoCount, setPhotoCount] = useState(0)
  const parent = useKunuStore((state) => state.parent)
  const child = useKunuStore((state) => state.child)
  const updateParent = useKunuStore((state) => state.updateParent)
  const updateChild = useKunuStore((state) => state.updateChild)
  const complete = useKunuStore((state) => state.completeOnboarding)
  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step])

  async function importPhotos(files: FileList | null) {
    if (!files) return
    const selected = Array.from(files).slice(0, 3)
    await Promise.all(selected.map((file, index) => saveLocalPhoto(`onboarding-${index}`, file)))
    setPhotoCount(selected.length)
  }

  const panels = [
    <div className="onboarding-hero" key="welcome">
      <div className="onboarding-orbit"><img src="/kunu-mark.svg" alt=""/><span/><span/><span/></div>
      <p className="eyebrow">Welcome to Kunu</p>
      <h1>Every journey becomes a world.</h1>
      <p>Turn the places your child has loved into private, magical adventures that grow with them.</p>
      <div className="onboarding-actions"><Button onClick={() => setStep(1)} icon="arrow">Create our Kunu</Button><Button variant="glass" onClick={complete}>View demo</Button></div>
      <p className="privacy-note">No account. No cloud. Family photos remain on this device.</p>
    </div>,
    <OnboardingForm key="family" eyebrow="For the grown-ups" title="Who is keeping the memories?" body="This stays private and helps Kunu make the experience feel like yours.">
      <label className="field"><span>Your family name</span><input value={parent.name} onChange={(event) => updateParent({ name: event.target.value })}/></label>
    </OnboardingForm>,
    <OnboardingForm key="clara" eyebrow="The explorer" title="Meet Clara" body="Her age is calculated for every journey, so the character grows alongside her story.">
      <label className="field"><span>Explorer name</span><input value={child.name} onChange={(event) => updateChild({ name: event.target.value })}/></label>
      <label className="field"><span>Date of birth</span><input type="date" value={child.dateOfBirth} onChange={(event) => updateChild({ dateOfBirth: event.target.value })}/></label>
    </OnboardingForm>,
    <OnboardingForm key="photos" eyebrow="Private memories" title="Add three favorite photos" body="Imported photos are stored in local IndexedDB. They are never bundled, committed, or uploaded.">
      <label className="photo-import"><Icon name="sparkle"/><span>{photoCount ? `${photoCount} photo${photoCount === 1 ? '' : 's'} stored locally` : 'Choose up to three photos'}</span><input type="file" accept="image/*" multiple onChange={(event) => void importPhotos(event.target.files)}/></label>
    </OnboardingForm>,
    <OnboardingForm key="style" eyebrow="A character, not a scan" title="This is Kunu Block" body="Rounded toy-like forms, warm materials, and expressive movement—stylized to feel like Clara without recreating a photograph.">
      <div className="character-preview-strip"><figure><img src="/assets/characters/clara-age-6.svg" alt="Clara age six Kunu Block reference"/><figcaption>Age 6 · curious</figcaption></figure><figure><img src="/assets/characters/clara-age-7.svg" alt="Clara age seven Kunu Block reference"/><figcaption>Age 7 · confident</figcaption></figure><figure><img src="/assets/characters/buddy.svg" alt="Buddy Kunu Block companion reference"/><figcaption>Buddy · always</figcaption></figure></div>
    </OnboardingForm>,
    <div className="onboarding-hero" key="ready">
      <div className="ready-art"><img src="/assets/launch/launch-art.svg" alt="Clara and Buddy facing three magical journey worlds"/></div>
      <p className="eyebrow">Your worlds are ready</p>
      <h1>Begin with Yosemite.</h1>
      <p>Clara was six. The valley was bright. Somewhere near the waterfall, a new explorer badge is waiting.</p>
      <Button onClick={complete} icon="sparkle">Enter Clara’s world</Button>
    </div>,
  ]

  return (
    <main className="onboarding-shell">
      <div className="onboarding-top"><span>Kunu</span><div className="onboarding-progress"><i style={{ width: `${progress}%` }}/></div><small>{steps[step]}</small></div>
      <AnimatePresence mode="wait"><motion.section key={step} className="onboarding-panel" initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -25 }} transition={{ duration: .35 }}>{panels[step]}</motion.section></AnimatePresence>
      {step > 0 && step < panels.length - 1 && <div className="onboarding-footer"><Button variant="quiet" onClick={() => setStep((value) => value - 1)}>Back</Button><Button onClick={() => setStep((value) => value + 1)} icon="arrow">Continue</Button></div>}
    </main>
  )
}

function OnboardingForm({ eyebrow, title, body, children }: { eyebrow: string; title: string; body: string; children: React.ReactNode }) {
  return <div className="onboarding-form"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{body}</p><div className="onboarding-fields">{children}</div></div>
}
