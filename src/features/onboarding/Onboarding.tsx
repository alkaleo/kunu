import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { APPROVED_CHARACTER_IMAGE_ID, dataUrlToBlob, prepareReferencePhoto } from '../../lib/character'
import { saveLocalPhoto } from '../../lib/db'
import { useKunuStore } from '../../store/useKunuStore'
import { Button } from '../shared/Button'
import { Icon } from '../shared/Icon'

const steps = ['Welcome', 'Family', 'Explorer', 'Character Studio', 'Avatar Reveal', 'Ready']
const referenceSlots = [
  { view: 'front' as const, title: 'Clear front view', hint: 'Face visible, even light' },
  { view: 'three-quarter' as const, title: 'Three-quarter view', hint: 'Turned slightly to one side' },
  { view: 'full-body' as const, title: 'Full-body view', hint: 'Head-to-toe outfit visible' },
]
const generationStages = ['Uploading photos', 'Understanding the character', 'Creating the Kunu version', 'Preparing the reveal']

interface GenerateResponse { image?: string; code?: string; message?: string }

export function Onboarding() {
  const [step, setStep] = useState(0)
  const [files, setFiles] = useState<Array<File | null>>([null, null, null])
  const [previews, setPreviews] = useState<string[]>([])
  const [consent, setConsent] = useState(false)
  const [generatedImage, setGeneratedImage] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generationStage, setGenerationStage] = useState(0)
  const [generationError, setGenerationError] = useState('')
  const [adjusting, setAdjusting] = useState(false)
  const [adjustment, setAdjustment] = useState('')
  const abortRef = useRef<AbortController | null>(null)
  const parent = useKunuStore((state) => state.parent)
  const child = useKunuStore((state) => state.child)
  const updateParent = useKunuStore((state) => state.updateParent)
  const updateChild = useKunuStore((state) => state.updateChild)
  const complete = useKunuStore((state) => state.completeOnboarding)
  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step])

  useEffect(() => {
    const next = files.map((file) => file ? URL.createObjectURL(file) : '')
    setPreviews(next)
    return () => next.forEach((url) => { if (url) URL.revokeObjectURL(url) })
  }, [files])

  useEffect(() => () => abortRef.current?.abort(), [])

  function choosePhoto(index: number, file?: File) {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setGenerationError('Choose a JPEG, PNG, or WebP photo.')
      return
    }
    setGenerationError('')
    setFiles((current) => current.map((item, itemIndex) => itemIndex === index ? file : item))
  }

  async function generateCharacter() {
    if (files.some((file) => !file)) { setGenerationError('Add all three requested views first.'); return }
    if (!consent) { setGenerationError('Parent consent is required before the photos can be sent to OpenAI.'); return }
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setGenerating(true)
    setGenerationStage(0)
    setGenerationError('')
    const stageTimer = window.setInterval(() => setGenerationStage((current) => Math.min(2, current + 1)), 1600)
    const timeout = window.setTimeout(() => controller.abort(), 220_000)
    try {
      const images = await Promise.all(files.map((file, index) => prepareReferencePhoto(file!, referenceSlots[index].view)))
      const response = await fetch('/api/generate-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        signal: controller.signal,
        body: JSON.stringify({ consent: true, images, adjustment }),
      })
      const result = await response.json() as GenerateResponse
      if (!response.ok || !result.image) throw new Error(result.message || 'Kunu could not create the character.')
      setGenerationStage(3)
      setGeneratedImage(result.image)
      await new Promise((resolve) => window.setTimeout(resolve, 650))
      setStep(4)
    } catch (error) {
      const message = error instanceof DOMException && error.name === 'AbortError'
        ? 'Generation was cancelled or timed out. Your photos were not saved; retry when ready.'
        : error instanceof Error ? error.message : 'Kunu could not create the character.'
      console.error('[Kunu] Character generation did not complete.', error)
      setGenerationError(message)
    } finally {
      window.clearInterval(stageTimer)
      window.clearTimeout(timeout)
      setGenerating(false)
      abortRef.current = null
    }
  }

  async function approveCharacter() {
    try {
      const approved = await dataUrlToBlob(generatedImage)
      await saveLocalPhoto(APPROVED_CHARACTER_IMAGE_ID, approved)
      updateChild({ characterImageId: APPROVED_CHARACTER_IMAGE_ID })
      setFiles([null, null, null])
      setConsent(false)
      setStep(5)
    } catch (error) {
      console.error('[Kunu] Approved character could not be saved locally.', error)
      setGenerationError('The character could not be saved on this device. Please retry approval.')
    }
  }

  function cancelAndDelete() {
    abortRef.current?.abort()
    setFiles([null, null, null])
    setConsent(false)
    setGeneratedImage('')
    setAdjustment('')
    setAdjusting(false)
    setGenerationError('References and the unapproved result were removed from this session.')
    setStep(3)
  }

  const panels = [
    <div className="onboarding-hero" key="welcome">
      <div className="onboarding-orbit"><img src="/kunu-mark.svg" alt=""/><span/><span/><span/></div>
      <p className="eyebrow">Welcome to Kunu</p>
      <h1>Every journey becomes a world.</h1>
      <p>Create a private, stylized Kunu character from three family references, then explore the places your child has loved.</p>
      <div className="onboarding-actions"><Button onClick={() => setStep(1)} icon="arrow">Create our Kunu</Button><Button variant="glass" onClick={complete}>Explore fallback demo</Button></div>
      <p className="privacy-note">No account. Original photos are sent only after consent and are never stored by Kunu.</p>
    </div>,
    <OnboardingForm key="family" eyebrow="For the grown-ups" title="Who is keeping the memories?" body="This stays on this device and helps Kunu make the experience feel like yours.">
      <label className="field"><span>Your family name</span><input value={parent.name} onChange={(event) => updateParent({ name: event.target.value })}/></label>
    </OnboardingForm>,
    <OnboardingForm key="child" eyebrow="The explorer" title={`Meet ${child.name}`} body="Their age is calculated for every journey, so the character grows alongside the story.">
      <label className="field"><span>Explorer name</span><input value={child.name} onChange={(event) => updateChild({ name: event.target.value })}/></label>
      <label className="field"><span>Date of birth</span><input type="date" value={child.dateOfBirth} onChange={(event) => updateChild({ dateOfBirth: event.target.value })}/></label>
    </OnboardingForm>,
    <div className="character-studio" key="studio">
      <p className="eyebrow">Private character studio</p><h1>Three views. One Kunu.</h1>
      <p className="studio-intro">Clear references help OpenAI create one cohesive, non-photorealistic Kunu Block character.</p>
      <div className="reference-upload-grid">{referenceSlots.map((slot, index) => <label className={`reference-upload ${previews[index] ? 'has-image' : ''}`} key={slot.view}>{previews[index] ? <img src={previews[index]} alt="Private reference preview"/> : <Icon name="sparkle"/>}<span><strong>{slot.title}</strong><small>{files[index]?.name ?? slot.hint}</small></span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => choosePhoto(index, event.target.files?.[0])}/></label>)}</div>
      <label className="consent-card"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)}/><span><strong>I am the parent or guardian and I consent.</strong><small>These three images will be sent temporarily to OpenAI to create a stylized Kunu character. Kunu does not save the originals on its server or in this browser. Only an approved generated character is stored locally in IndexedDB.</small></span></label>
      {generating && <GenerationProgress active={generationStage}/>}
      {generationError && <p className="generation-error" role="alert">{generationError}</p>}
      <div className="studio-actions"><Button variant="quiet" disabled={generating} onClick={() => setStep(2)}>Back</Button><Button disabled={generating || files.some((file) => !file) || !consent} onClick={() => void generateCharacter()} icon="sparkle">{generating ? generationStages[generationStage] : 'Create Kunu character'}</Button>{generating && <Button variant="glass" onClick={() => abortRef.current?.abort()}>Cancel</Button>}</div>
    </div>,
    <div className="avatar-reveal" key="reveal">
      <div className="reveal-stage"><div className="reveal-halo"/><img src={generatedImage} alt={`${child.name}'s generated Kunu Block character sheet`}/></div>
      <div className="reveal-copy"><p className="eyebrow">Avatar reveal</p><h1>Meet the Kunu version.</h1><p>Stylized from the three private references, with a full-body gameplay view and a consistent expression sheet.</p>{adjusting && <label className="field"><span>What should change?</span><textarea value={adjustment} onChange={(event) => setAdjustment(event.target.value)} placeholder="For example: make the hairstyle a little curlier or use the light blue shorts." maxLength={600}/></label>}{generating && <GenerationProgress active={generationStage}/>} {generationError && <p className="generation-error" role="alert">{generationError}</p>}<div className="reveal-actions"><Button disabled={generating} onClick={() => void approveCharacter()} icon="sparkle">Approve</Button><Button disabled={generating} variant="glass" onClick={() => void generateCharacter()}>Regenerate</Button><Button disabled={generating} variant="quiet" onClick={() => setAdjusting((value) => !value)}>Adjust appearance</Button><button className="delete-photos" onClick={cancelAndDelete}>Cancel and delete photos</button></div></div>
    </div>,
    <div className="onboarding-hero" key="ready">
      <div className="ready-art generated-ready"><img src={generatedImage || '/assets/launch/launch-art.svg'} alt={`${child.name}'s approved Kunu character`}/></div>
      <p className="eyebrow">Your worlds are ready</p><h1>Begin with Yosemite.</h1><p>The approved character now lives only on this device and will join every journey surface and the 2.5D Yosemite adventure.</p><Button onClick={complete} icon="sparkle">Enter {child.name}’s world</Button>
    </div>,
  ]

  return <main className="onboarding-shell"><div className="onboarding-top"><span>Kunu</span><div className="onboarding-progress"><i style={{ width: `${progress}%` }}/></div><small>{steps[step]}</small></div><AnimatePresence mode="wait"><motion.section key={step} className="onboarding-panel" initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -25 }} transition={{ duration: .35 }}>{panels[step]}</motion.section></AnimatePresence>{step > 0 && step < 3 && <div className="onboarding-footer"><Button variant="quiet" onClick={() => setStep((value) => value - 1)}>Back</Button><Button onClick={() => setStep((value) => value + 1)} icon="arrow">Continue</Button></div>}</main>
}

function GenerationProgress({ active }: { active: number }) {
  return <div className="generation-progress" role="status" aria-live="polite">{generationStages.map((label, index) => <div className={index < active ? 'is-complete' : index === active ? 'is-active' : ''} key={label}><i>{index < active ? '✓' : index + 1}</i><span>{label}</span></div>)}</div>
}

function OnboardingForm({ eyebrow, title, body, children }: { eyebrow: string; title: string; body: string; children: React.ReactNode }) {
  return <div className="onboarding-form"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{body}</p><div className="onboarding-fields">{children}</div></div>
}
