import { Canvas } from '@react-three/fiber'
import { AnimatePresence, motion } from 'framer-motion'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { seedActivityProgress, seedBadges } from '../../data/seed'
import { activityCompletion, allActivitiesComplete } from '../../lib/progression'
import { supportsWebGL } from '../../lib/webgl'
import { useKunuAudio } from '../../hooks/useKunuAudio'
import { useGeneratedCharacter } from '../../hooks/useGeneratedCharacter'
import { useKunuStore } from '../../store/useKunuStore'
import type { ActivityId } from '../../types/models'
import { Button } from '../shared/Button'
import { Icon } from '../shared/Icon'
import { CharacterArt } from '../shared/CharacterArt'
import { YosemiteScene, type MovementInput, type NearbyTarget } from './YosemiteScene'

const activityLabels: Record<ActivityId, string> = { waterfall: 'Find the Waterfall', souvenirs: 'Collect Three Souvenirs', memory: 'Recreate the Memory', question: 'Yosemite Question' }

export function YosemiteAdventure() {
  const movement = useRef<MovementInput>({ x: 0, y: 0 })
  const cameraYaw = useRef(0)
  const cameraZoom = useRef(1)
  const [nearby, setNearby] = useState<NearbyTarget | null>(null)
  const [dialog, setDialog] = useState<'waterfall' | 'memory' | 'question' | null>(null)
  const [pickup, setPickup] = useState('')
  const [questionWrong, setQuestionWrong] = useState(false)
  const [questionCorrect, setQuestionCorrect] = useState(false)
  const [captured, setCaptured] = useState('')
  const [celebrating, setCelebrating] = useState(false)
  const [visible, setVisible] = useState(!document.hidden)
  const [webglFailure, setWebglFailure] = useState<Error | null>(null)
  const progress = useKunuStore((state) => state.activityProgress.yosemite ?? seedActivityProgress.yosemite)
  const explorer = useKunuStore((state) => state.explorer)
  const allCollectibles = useKunuStore((state) => state.collectibles)
  const badges = useKunuStore((state) => state.badges)
  const collectibles = useMemo(() => allCollectibles.filter((item) => item.journeyId === 'yosemite'), [allCollectibles])
  const badge = badges.find((item) => item.id === 'yosemite-explorer') ?? seedBadges[0]
  const setMode = useKunuStore((state) => state.setExperienceMode)
  const setSection = useKunuStore((state) => state.setSection)
  const completeActivity = useKunuStore((state) => state.completeActivity)
  const collectSouvenir = useKunuStore((state) => state.collectSouvenir)
  const recordAttempt = useKunuStore((state) => state.recordActivityAttempt)
  const saveRecreation = useKunuStore((state) => state.saveRecreation)
  const addBadge = useKunuStore((state) => state.addBadgeToPassport)
  const restart = useKunuStore((state) => state.restartYosemite)
  const webgl = supportsWebGL()
  const { playCue } = useKunuAudio('adventure')
  const { spriteUrl } = useGeneratedCharacter()
  const completedIds = useMemo(() => Object.entries(progress.activities).filter(([,done]) => done).map(([id]) => id), [progress.activities])

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  useEffect(() => {
    if (badge.unlockedAt && !badge.addedToPassport && allActivitiesComplete(progress)) setCelebrating(true)
  }, [badge.addedToPassport, badge.unlockedAt, progress])

  useEffect(() => {
    const onAction = (event: KeyboardEvent) => { if (event.key.toLowerCase() === 'e') act() }
    window.addEventListener('keydown', onAction)
    return () => window.removeEventListener('keydown', onAction)
  })

  function act() {
    if (!nearby) return
    if (nearby.kind === 'souvenir') {
      const item = collectibles.find((collectible) => collectible.id === nearby.id)
      collectSouvenir(nearby.id); playCue('collect')
      setPickup(item?.name ?? 'Souvenir')
      window.setTimeout(() => setPickup(''), 1800)
      return
    }
    setDialog(nearby.kind)
  }

  function closeAdventure() { setMode('memory'); setSection('world') }
  function captureMemory() {
    const canvas = document.querySelector<HTMLCanvasElement>('.yosemite-canvas canvas')
    let image = ''
    try { image = canvas?.toDataURL('image/png') ?? '' } catch { image = '' }
    if (image) { setCaptured(image); saveRecreation(image) }
    completeActivity('memory'); playCue('discover')
  }

  if (!webgl || webglFailure) return <WebGLFallback error={webglFailure} onReturn={closeAdventure}/>

  return <main className="adventure-shell" onWheel={(event) => { cameraZoom.current = Math.max(.72, Math.min(1.22, cameraZoom.current + event.deltaY * .0006)) }}>
    <div className="rotate-message"><div className="rotate-device"><span/></div><p className="eyebrow">Adventure mode</p><h1>Turn sideways to explore.</h1><p>Memory Mode stays portrait-first. Yosemite opens up in landscape.</p><Button variant="glass" onClick={closeAdventure}>Return to World</Button></div>
    <div className="yosemite-canvas" data-testid="yosemite-canvas">
      <Canvas fallback={<CanvasWebGLFallback onReturn={closeAdventure}/>} shadows frameloop={visible ? 'always' : 'never'} camera={{ position: [7,7,13], fov: 43, near: .1, far: 80 }} dpr={[1,1.5]} gl={{ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true }} onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault()
          const error = new Error('The WebGL context was lost while Yosemite was running.')
          console.error('[Kunu] Yosemite WebGL context lost.', error)
          setWebglFailure(error)
        }, { once: true })
      }}>
        <Suspense fallback={null}><YosemiteScene movement={movement} cameraYaw={cameraYaw} cameraZoom={cameraZoom} collectedIds={progress.souvenirs} completedIds={completedIds} characterImageUrl={spriteUrl} onNearby={setNearby}/></Suspense>
      </Canvas>
    </div>
    <CameraDragZone cameraYaw={cameraYaw}/>
    <header className="adventure-topbar"><button className="adventure-exit" onClick={closeAdventure} aria-label="Exit Yosemite"><Icon name="arrow"/></button><div><p>Yosemite · July 2024</p><span>Clara, age 6 · Freedom</span></div><div className="xp-pill"><Icon name="sparkle"/><strong>{explorer.xp}</strong><span>XP</span></div></header>
    <aside className="objective-card"><div className="objective-card__head"><span>Valley quest</span><strong>{activityCompletion(progress)}%</strong></div><h2>Become a Yosemite Explorer</h2><ul>{(Object.keys(activityLabels) as ActivityId[]).map((id) => <li key={id} className={progress.activities[id] ? 'is-complete' : ''}><i>{progress.activities[id] ? '✓' : ''}</i><span>{activityLabels[id]}{id === 'souvenirs' && <small>{progress.souvenirs.length} / 3 found</small>}</span></li>)}</ul></aside>
    <div className="desktop-controls"><span><kbd>WASD</kbd> Move</span><span><kbd>Shift</kbd> Run</span><span><kbd>Drag</kbd> Camera</span><span><kbd>Wheel</kbd> Zoom</span><span><kbd>E</kbd> Action</span><span><kbd>P</kbd> Pose</span></div>
    <Joystick movement={movement}/>
    <AnimatePresence>{nearby && <motion.button className="context-action" aria-label={nearby.label} initial={{ opacity: 0, scale: .85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .85 }} onClick={act}><span>{nearby.label}</span><i>E</i></motion.button>}</AnimatePresence>
    <AnimatePresence>{pickup && <motion.div className="pickup-toast" role="status" aria-live="polite" initial={{ opacity: 0, y: 25, scale: .9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -15 }}><Icon name="sparkle"/><div><strong>{pickup} found</strong><span>+25 explorer XP</span></div></motion.div>}</AnimatePresence>
    {dialog === 'waterfall' && <DiscoveryDialog onClose={() => setDialog(null)} onComplete={() => { completeActivity('waterfall'); playCue('discover'); setDialog(null) }}/>} 
    {dialog === 'memory' && <MemoryActivity captured={captured || progress.screenshot || ''} onCapture={captureMemory} onClose={() => setDialog(null)}/>} 
    {dialog === 'question' && <QuestionActivity wrong={questionWrong} correct={questionCorrect} onAnswer={(answer) => { recordAttempt('question'); if(answer === 'Glaciers') { setQuestionCorrect(true); completeActivity('question'); playCue('discover') } else setQuestionWrong(true) }} onClose={() => { setDialog(null); setQuestionCorrect(false); setQuestionWrong(false) }}/>} 
    <AnimatePresence>{celebrating && <BadgeCelebration xp={explorer.xp} onPassport={() => { addBadge('yosemite-explorer'); setCelebrating(false); setMode('memory'); setSection('passport') }} onWorld={() => { setCelebrating(false); closeAdventure() }} onAgain={() => { restart(); setCelebrating(false) }}/>}</AnimatePresence>
  </main>
}

function WebGLFallback({ error, onReturn }: { error: Error | null; onReturn: () => void }) {
  useEffect(() => { if (error) console.error('[Kunu] Yosemite switched to its WebGL fallback.', error) }, [error])
  return <main className="adventure-fallback" data-testid="webgl-fallback"><img src="/assets/journeys/yosemite-cover.svg" alt="Stylized Yosemite valley"/><div><p className="eyebrow">Static memory mode</p><h1>Yosemite is still here.</h1><p>This device could not create a stable WebGL scene, so Kunu kept the journey available as an accessible memory card.</p><Button onClick={onReturn}>Return to world</Button></div></main>
}

function CanvasWebGLFallback({ onReturn }: { onReturn: () => void }) {
  return <div className="adventure-canvas-fallback" data-testid="webgl-fallback"><p>Yosemite is available in static memory mode on this device.</p><Button onClick={onReturn}>Return to world</Button></div>
}

function Joystick({ movement }: { movement: React.MutableRefObject<MovementInput> }) {
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  function move(event: React.PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    const box = event.currentTarget.getBoundingClientRect(); const x = event.clientX - (box.left + box.width/2); const y = event.clientY - (box.top + box.height/2); const length = Math.hypot(x,y); const scale = length > 38 ? 38/length : 1; const next = { x:x*scale, y:y*scale }; setKnob(next); movement.current = { x:next.x/38, y:next.y/38 }
  }
  function end() { setKnob({x:0,y:0}); movement.current = {x:0,y:0} }
  return <div className="mobile-joystick" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); move(event) }} onPointerMove={move} onPointerUp={end} onPointerCancel={end}><span style={{ transform:`translate(${knob.x}px,${knob.y}px)` }}/></div>
}

function CameraDragZone({ cameraYaw }: { cameraYaw: React.MutableRefObject<number> }) {
  const start = useRef(0)
  return <div className="camera-drag-zone" aria-hidden="true" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); start.current = event.clientX }} onPointerMove={(event) => { if(!event.currentTarget.hasPointerCapture(event.pointerId)) return; const delta = event.clientX-start.current; cameraYaw.current += delta*.006; start.current=event.clientX }}/>
}

function DiscoveryDialog({ onClose, onComplete }: { onClose:()=>void; onComplete:()=>void }) {
  return <ActivityModal onClose={onClose}><div className="discovery-art"><div className="mini-waterfall"/><div className="buddy-point"/></div><p className="eyebrow">Discovery found</p><h2>Yosemite Falls</h2><p>Yosemite Falls drops 2,425 feet from the top of the upper fall to the base of the lower fall—one of North America’s tallest waterfall systems.</p><Button icon="sparkle" onClick={onComplete}>Remember this · +125 XP</Button></ActivityModal>
}

function MemoryActivity({ captured, onCapture, onClose }: { captured:string; onCapture:()=>void; onClose:()=>void }) {
  return <ActivityModal onClose={onClose} wide><p className="eyebrow">Recreate the memory</p><h2>Find the same feeling.</h2><p>Stand at the viewpoint, frame Clara and Buddy, then keep an in-game recreation beside the private memory’s stylized reference.</p><div className="memory-compare"><figure><img src="/assets/journeys/yosemite-memory.svg" alt="Stylized private memory reference"/><figcaption>Private memory · stylized reference</figcaption></figure><figure className={!captured ? 'is-empty' : ''}>{captured ? <img src={captured} alt="Captured in-game Yosemite recreation"/> : <div><Icon name="sparkle"/><span>Your recreation appears here</span></div>}<figcaption>Clara’s Kunu recreation</figcaption></figure></div>{captured ? <Button onClick={onClose} icon="sparkle">Keep this memory · +175 XP</Button> : <Button onClick={onCapture} icon="sparkle">Capture recreation</Button>}</ActivityModal>
}

function QuestionActivity({ wrong, correct, onAnswer, onClose }: { wrong:boolean; correct:boolean; onAnswer:(answer:string)=>void; onClose:()=>void }) {
  const answers = ['Rivers', 'Glaciers', 'Wind', 'Volcanoes']
  return <ActivityModal onClose={onClose}><p className="eyebrow">Yosemite question</p><h2>Which natural force shaped much of Yosemite Valley?</h2>{correct ? <div className="question-success"><Icon name="sparkle"/><strong>Glaciers</strong><p>Over many ice ages, huge glaciers widened and deepened the river-cut valley into its famous U shape.</p><Button onClick={onClose}>Continue exploring · +125 XP</Button></div> : <><div className="answer-grid">{answers.map((answer)=><button key={answer} onClick={()=>onAnswer(answer)}>{answer}</button>)}</div>{wrong && <p className="friendly-retry">Good thought. Look for the force that moves like a very slow river of ice—try once more.</p>}</>}</ActivityModal>
}

function ActivityModal({ children, onClose, wide=false }: { children:React.ReactNode; onClose:()=>void; wide?:boolean }) {
  return <div className="activity-overlay" role="dialog" aria-modal="true"><motion.section className={`activity-modal ${wide?'activity-modal--wide':''}`} initial={{opacity:0,y:28,scale:.96}} animate={{opacity:1,y:0,scale:1}}><button className="activity-close" onClick={onClose} aria-label="Close activity">×</button>{children}</motion.section></div>
}

function BadgeCelebration({ xp, onPassport, onWorld, onAgain }: { xp:number; onPassport:()=>void; onWorld:()=>void; onAgain:()=>void }) {
  return <motion.div className="badge-celebration" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><img className="celebration-backdrop" src="/assets/celebration/yosemite-celebration.svg" alt=""/><div className="celebration-rays"/><CharacterArt className="celebration-character" variant="full-body" fallback="/assets/characters/clara-yosemite.svg"/><motion.img src="/assets/badges/yosemite-explorer.svg" alt="Yosemite Explorer badge" initial={{scale:.4,rotate:-18}} animate={{scale:1,rotate:0}} transition={{type:'spring',stiffness:170,damping:14}}/><p className="eyebrow">Journey complete</p><h1>Yosemite Explorer</h1><p>Clara followed every clue. Buddy is doing his best victory dance.</p><div className="celebration-xp"><Icon name="sparkle"/><strong>{xp}</strong><span>total XP</span></div><div className="celebration-actions"><Button onClick={onPassport}>Add to Passport</Button><Button variant="glass" onClick={onWorld}>Return to World</Button><Button variant="quiet" onClick={onAgain}>Explore Again</Button></div></motion.div>
}
