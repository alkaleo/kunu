import { Float, Html, RoundedBox } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

export interface MovementInput { x: number; y: number }
export interface NearbyTarget { kind: 'waterfall' | 'souvenir' | 'memory' | 'question'; id: string; label: string }

const targetLocations: Array<NearbyTarget & { position: THREE.Vector3 }> = [
  { kind: 'waterfall', id: 'waterfall', label: 'Discover the waterfall', position: new THREE.Vector3(-1, 0, -9) },
  { kind: 'souvenir', id: 'pine-cone', label: 'Collect pine cone', position: new THREE.Vector3(-7, 0, -4) },
  { kind: 'souvenir', id: 'granite-stone', label: 'Collect smooth granite', position: new THREE.Vector3(6.5, 0, -3) },
  { kind: 'souvenir', id: 'trail-token', label: 'Collect trail token', position: new THREE.Vector3(8, 0, 5) },
  { kind: 'memory', id: 'memory', label: 'Frame the memory', position: new THREE.Vector3(-6.5, 0, 7.5) },
  { kind: 'question', id: 'question', label: 'Answer the valley question', position: new THREE.Vector3(5.5, 0, 8.5) },
]

interface YosemiteSceneProps {
  movement: React.MutableRefObject<MovementInput>
  cameraYaw: React.MutableRefObject<number>
  cameraZoom: React.MutableRefObject<number>
  collectedIds: string[]
  completedIds: string[]
  onNearby: (target: NearbyTarget | null) => void
}

export function YosemiteScene({ movement, cameraYaw, cameraZoom, collectedIds, completedIds, onNearby }: YosemiteSceneProps) {
  return <>
    <color attach="background" args={['#a7d9db']}/>
    <fog attach="fog" args={['#cfe5d9', 18, 40]}/>
    <ambientLight intensity={1.15}/><hemisphereLight args={['#fff0c9', '#315948', 1.2]}/>
    <directionalLight castShadow position={[8, 14, 7]} intensity={2.4} color="#ffd89c" shadow-mapSize={[1024, 1024]} shadow-camera-far={45} shadow-camera-left={-18} shadow-camera-right={18} shadow-camera-top={18} shadow-camera-bottom={-18}/>
    <DioramaGround/><Cliffs/><Waterfall/><River/><Trail/><Forest/><Wildlife/>
    {!completedIds.includes('waterfall') && <ObjectiveBeacon position={[-1, .2, -9]} color="#56e1df" label="Waterfall viewpoint"/>}
    {!completedIds.includes('memory') && <ObjectiveBeacon position={[-6.5, .2, 7.5]} color="#f5c7c9" label="Memory viewpoint"/>}
    {!completedIds.includes('question') && <ObjectiveBeacon position={[5.5, .2, 8.5]} color="#f7d580" label="Valley question"/>}
    <Collectible id="pine-cone" position={[-7, .35, -4]} hidden={collectedIds.includes('pine-cone')}/>
    <Collectible id="granite-stone" position={[6.5, .3, -3]} hidden={collectedIds.includes('granite-stone')}/>
    <Collectible id="trail-token" position={[8, .4, 5]} hidden={collectedIds.includes('trail-token')}/>
    <PlayerRig movement={movement} cameraYaw={cameraYaw} cameraZoom={cameraZoom} collectedIds={collectedIds} completedIds={completedIds} onNearby={onNearby}/>
  </>
}

function DioramaGround() {
  return <group>
    <RoundedBox args={[29, 1.2, 25]} radius={1.4} smoothness={6} position={[0, -.75, 0]} receiveShadow><meshStandardMaterial color="#668c59" roughness={.9}/></RoundedBox>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.1,0]} receiveShadow><planeGeometry args={[27,23,24,24]}/><meshStandardMaterial color="#7fa76c" roughness={1}/></mesh>
    <group position={[0,-1.2,0]}><RoundedBox args={[30,1.2,26]} radius={1.2} smoothness={4}><meshStandardMaterial color="#6f7165" roughness={1}/></RoundedBox></group>
  </group>
}

function Cliffs() {
  return <group>
    <group position={[-10,3,-10]} rotation={[0,.18,0]}><RoundedBox args={[7,9,4]} radius={.8} smoothness={4} castShadow receiveShadow><meshStandardMaterial color="#9ea39d" roughness={.95}/></RoundedBox><RoundedBox args={[4,6,2.8]} radius={.6} position={[3.5,-1,0]} castShadow><meshStandardMaterial color="#b7bab1" roughness={1}/></RoundedBox></group>
    <group position={[9.5,3.6,-10]} rotation={[0,-.14,0]}><RoundedBox args={[8,10,4]} radius={.9} smoothness={4} castShadow receiveShadow><meshStandardMaterial color="#969d98" roughness={.96}/></RoundedBox><RoundedBox args={[4,7,2.7]} radius={.6} position={[-4,-1,0]} castShadow><meshStandardMaterial color="#b9bcb3" roughness={1}/></RoundedBox></group>
    <group position={[-13,1.7,2]} rotation={[0,.08,0]}><RoundedBox args={[3.6,6,18]} radius={.9} castShadow><meshStandardMaterial color="#8e9791" roughness={1}/></RoundedBox></group>
    <group position={[13,1.7,2]} rotation={[0,-.08,0]}><RoundedBox args={[3.6,6,18]} radius={.9} castShadow><meshStandardMaterial color="#8f9890" roughness={1}/></RoundedBox></group>
  </group>
}

function Waterfall() {
  const water = useRef<THREE.Mesh>(null)
  useFrame((state) => { if (water.current) water.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2.4) * .018 })
  return <group position={[-1,1.9,-11.75]}>
    <mesh ref={water} position={[0,2.4,.14]}><planeGeometry args={[1.5,6.5,8,18]}/><meshStandardMaterial color="#d9ffff" emissive="#68d8dc" emissiveIntensity={.35} transparent opacity={.84} side={THREE.DoubleSide}/></mesh>
    <mesh position={[0,-.55,.5]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[2.1,36]}/><meshStandardMaterial color="#70d1d1" transparent opacity={.75}/></mesh>
  </group>
}

function River() {
  const riverShape = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(-1,-.01,-9),new THREE.Vector3(-2,-.01,-4),new THREE.Vector3(1,-.01,1),new THREE.Vector3(-1,-.01,6),new THREE.Vector3(2,-.01,11)]), [])
  return <mesh receiveShadow><tubeGeometry args={[riverShape,96,1.15,18,false]}/><meshStandardMaterial color="#49bdc2" roughness={.25} metalness={.05} transparent opacity={.88}/></mesh>
}

function Trail() {
  const curve = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(0,.05,6),new THREE.Vector3(-5,.05,5),new THREE.Vector3(-8,.05,1),new THREE.Vector3(-5,.05,-5),new THREE.Vector3(-1,.05,-8)]), [])
  return <mesh receiveShadow><tubeGeometry args={[curve,80,.22,10,false]}/><meshStandardMaterial color="#d4b786" roughness={1}/></mesh>
}

const treePositions: Array<[number, number, number, number]> = [[-10,0,-6,1.2],[-8,0,-8,1.4],[-6,0,-10,1],[-11,0,-1,1.1],[-9,0,3,1.3],[-11,0,8,1.5],[-7,0,10,1],[10,0,-6,1.3],[8,0,-8,1],[11,0,-2,1.5],[9,0,1,1.1],[11,0,7,1.3],[7,0,10,1],[3,0,-10,1.2],[-4,0,-10,1.1]]

function Forest() { return <group>{treePositions.map(([x,y,z,s],index)=><Pine key={index} position={[x,y,z]} scale={s}/>)}</group> }

function Pine({ position, scale=1 }: { position:[number,number,number]; scale?:number }) {
  const group = useRef<THREE.Group>(null)
  useFrame((state) => { if(group.current) group.current.rotation.z = Math.sin(state.clock.elapsedTime*.55 + position[0])*.008 })
  return <group ref={group} position={position} scale={scale}><mesh castShadow position={[0,.8,0]}><cylinderGeometry args={[.17,.25,1.6,8]}/><meshStandardMaterial color="#6e4e35"/></mesh><mesh castShadow position={[0,2.1,0]}><coneGeometry args={[1.15,2.6,10]}/><meshStandardMaterial color="#285c47" roughness={1}/></mesh><mesh castShadow position={[0,3.1,0]}><coneGeometry args={[.85,2.1,10]}/><meshStandardMaterial color="#356c51" roughness={1}/></mesh></group>
}

function Wildlife() {
  const birds = useRef<THREE.Group>(null)
  useFrame((state) => { if (birds.current) { birds.current.rotation.y = state.clock.elapsedTime*.18; birds.current.position.y = 7 + Math.sin(state.clock.elapsedTime)*.25 } })
  return <><group position={[7,.2,-6]} rotation={[0,-.7,0]}><mesh castShadow position={[0,1,0]}><RoundedBox args={[1.5,.85,.62]} radius={.28}/><meshStandardMaterial color="#a27b57"/></mesh><mesh castShadow position={[-.75,1.6,0]}><sphereGeometry args={[.45,16,12]}/><meshStandardMaterial color="#a27b57"/></mesh><group position={[-.92,1.94,0]}><mesh rotation={[0,0,.45]} position={[-.18,.2,0]}><cylinderGeometry args={[.025,.04,.5,6]}/><meshStandardMaterial color="#6b4c35"/></mesh><mesh rotation={[0,0,-.45]} position={[.18,.2,0]}><cylinderGeometry args={[.025,.04,.5,6]}/><meshStandardMaterial color="#6b4c35"/></mesh></group></group><group ref={birds}>{[-1,0,1].map((offset)=><mesh key={offset} position={[5+offset*1.2,0,-2+offset]} rotation={[0,0,.35]}><sphereGeometry args={[.09,8,6]}/><meshBasicMaterial color="#31484b"/></mesh>)}</group></>
}

function ObjectiveBeacon({ position, color, label }: { position:[number,number,number]; color:string; label:string }) {
  return <Float speed={1.6} floatIntensity={.25}><group position={position}><mesh rotation={[-Math.PI/2,0,0]}><torusGeometry args={[.65,.055,10,32]}/><meshBasicMaterial color={color} transparent opacity={.82}/></mesh><mesh position={[0,.4,0]}><octahedronGeometry args={[.18]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4}/></mesh><Html center position={[0,1,0]} distanceFactor={10}><span className="world-label">{label}</span></Html></group></Float>
}

function Collectible({ id, position, hidden }: { id:string; position:[number,number,number]; hidden:boolean }) {
  if (hidden) return null
  const color = id === 'pine-cone' ? '#805b3c' : id === 'granite-stone' ? '#c7ccc7' : '#f0bd54'
  return <Float speed={2.3} rotationIntensity={.6} floatIntensity={.45}><group position={position}><mesh castShadow>{id === 'trail-token' ? <cylinderGeometry args={[.34,.34,.11,18]}/> : id === 'granite-stone' ? <dodecahedronGeometry args={[.38,0]}/> : <coneGeometry args={[.32,.7,8]}/>}<meshStandardMaterial color={color} roughness={.7} metalness={id === 'trail-token' ? .35 : 0} emissive={color} emissiveIntensity={.16}/></mesh><pointLight color="#56e1df" intensity={.7} distance={3}/></group></Float>
}

function PlayerRig({ movement, cameraYaw, cameraZoom, collectedIds, completedIds, onNearby }: YosemiteSceneProps) {
  const player = useRef<THREE.Group>(null)
  const buddy = useRef<THREE.Group>(null)
  const leftLeg = useRef<THREE.Group>(null)
  const rightLeg = useRef<THREE.Group>(null)
  const leftArm = useRef<THREE.Group>(null)
  const rightArm = useRef<THREE.Group>(null)
  const keys = useRef(new Set<string>())
  const previousNearby = useRef('')
  const { camera } = useThree()
  const temp = useMemo(() => ({ movement: new THREE.Vector3(), cameraOffset: new THREE.Vector3(), buddyTarget: new THREE.Vector3() }), [])

  useEffect(() => {
    const down = (event: KeyboardEvent) => keys.current.add(event.key.toLowerCase())
    const up = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase())
    window.addEventListener('keydown', down); window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  useFrame((state, delta) => {
    if (!player.current || !buddy.current) return
    const k = keys.current
    let x = (k.has('d') || k.has('arrowright') ? 1 : 0) - (k.has('a') || k.has('arrowleft') ? 1 : 0) + movement.current.x
    let z = (k.has('s') || k.has('arrowdown') ? 1 : 0) - (k.has('w') || k.has('arrowup') ? 1 : 0) + movement.current.y
    const length = Math.hypot(x,z)
    const moving = length > .08
    if (moving) {
      x /= Math.max(1,length); z /= Math.max(1,length)
      const speed = k.has('shift') ? 5.4 : 3.55
      temp.movement.set(x,0,z).applyAxisAngle(new THREE.Vector3(0,1,0),cameraYaw.current)
      player.current.position.addScaledVector(temp.movement, speed*delta)
      player.current.position.x = THREE.MathUtils.clamp(player.current.position.x,-10.5,10.5)
      player.current.position.z = THREE.MathUtils.clamp(player.current.position.z,-10.2,10.2)
      player.current.rotation.y = THREE.MathUtils.lerp(player.current.rotation.y,Math.atan2(temp.movement.x,temp.movement.z),.17)
    }
    const stride = moving ? Math.sin(state.clock.elapsedTime*(k.has('shift')?13:9))*.55 : 0
    if(leftLeg.current) leftLeg.current.rotation.x = THREE.MathUtils.lerp(leftLeg.current.rotation.x,stride,.2)
    if(rightLeg.current) rightLeg.current.rotation.x = THREE.MathUtils.lerp(rightLeg.current.rotation.x,-stride,.2)
    if(leftArm.current) leftArm.current.rotation.x = THREE.MathUtils.lerp(leftArm.current.rotation.x,-stride*.7,.2)
    if(rightArm.current) rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x,stride*.7,.2)
    const celebrating = completedIds.length === 4
    const posing = k.has('p')
    if (leftArm.current) leftArm.current.rotation.z = THREE.MathUtils.lerp(leftArm.current.rotation.z, celebrating ? 2.3 : posing ? 1.25 : 0, .13)
    if (rightArm.current) rightArm.current.rotation.z = THREE.MathUtils.lerp(rightArm.current.rotation.z, celebrating ? -2.3 : posing ? -1.25 : 0, .13)
    player.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime*(moving?9:2)))*(moving?.035:.015)

    temp.buddyTarget.copy(player.current.position).add(new THREE.Vector3(-1.05,0,.75).applyAxisAngle(new THREE.Vector3(0,1,0),player.current.rotation.y))
    buddy.current.position.lerp(temp.buddyTarget,1-Math.pow(.001,delta))
    buddy.current.position.y = .08 + Math.abs(Math.sin(state.clock.elapsedTime*(celebrating ? 13 : 6)))*(celebrating ? .22 : .08)
    buddy.current.rotation.y = player.current.rotation.y

    temp.cameraOffset.set(7.2,7.2,9.2).multiplyScalar(cameraZoom.current).applyAxisAngle(new THREE.Vector3(0,1,0),cameraYaw.current)
    const cameraTarget = player.current.position.clone().add(temp.cameraOffset)
    camera.position.lerp(cameraTarget,1-Math.pow(.0008,delta))
    camera.lookAt(player.current.position.x,player.current.position.y+1.25,player.current.position.z)

    let nearest: NearbyTarget | null = null; let nearestDistance = 2.05
    for (const target of targetLocations) {
      if (target.kind === 'souvenir' && collectedIds.includes(target.id)) continue
      if (target.kind !== 'souvenir' && completedIds.includes(target.id)) continue
      const distance = player.current.position.distanceTo(target.position)
      if (distance < nearestDistance) { nearestDistance = distance; nearest = target }
    }
    const key = nearest ? `${nearest.kind}:${nearest.id}` : ''
    if (key !== previousNearby.current) { previousNearby.current = key; onNearby(nearest) }
  })

  return <>
    <group ref={player} position={[0,0,5]}>
      <group position={[0,1.65,0]}><RoundedBox args={[.68,.66,.58]} radius={.24} castShadow><meshStandardMaterial color="#e8aa92"/></RoundedBox><mesh position={[0,.22,-.08]} scale={[1.04,.52,1.02]}><sphereGeometry args={[.38,18,14]}/><meshStandardMaterial color="#765342"/></mesh><mesh position={[-.15,.03,.31]}><sphereGeometry args={[.035,8,8]}/><meshBasicMaterial color="#2c2927"/></mesh><mesh position={[.15,.03,.31]}><sphereGeometry args={[.035,8,8]}/><meshBasicMaterial color="#2c2927"/></mesh></group>
      <RoundedBox args={[.75,.82,.5]} radius={.22} position={[0,1.02,0]} castShadow><meshStandardMaterial color="#efb9c3"/></RoundedBox>
      <RoundedBox args={[.76,.35,.52]} radius={.12} position={[0,.54,0]} castShadow><meshStandardMaterial color="#a6ced6"/></RoundedBox>
      <group ref={leftArm} position={[-.5,1.25,0]}><mesh position={[0,-.35,0]} castShadow><capsuleGeometry args={[.11,.52,6,10]}/><meshStandardMaterial color="#e8aa92"/></mesh></group><group ref={rightArm} position={[(.5),1.25,0]}><mesh position={[0,-.35,0]} castShadow><capsuleGeometry args={[.11,.52,6,10]}/><meshStandardMaterial color="#e8aa92"/></mesh></group>
      <group ref={leftLeg} position={[-.23,.42,0]}><mesh position={[0,-.38,0]} castShadow><capsuleGeometry args={[.12,.58,6,10]}/><meshStandardMaterial color="#d89b80"/></mesh><RoundedBox args={[.32,.17,.55]} radius={.07} position={[0,-.75,.11]} castShadow><meshStandardMaterial color="#f2f4ee"/></RoundedBox></group><group ref={rightLeg} position={[(.23),.42,0]}><mesh position={[0,-.38,0]} castShadow><capsuleGeometry args={[.12,.58,6,10]}/><meshStandardMaterial color="#d89b80"/></mesh><RoundedBox args={[.32,.17,.55]} radius={.07} position={[0,-.75,.11]} castShadow><meshStandardMaterial color="#f2f4ee"/></RoundedBox></group>
    </group>
    <group ref={buddy} position={[-1,0,5.7]} scale={.72}><RoundedBox args={[.75,.72,.58]} radius={.25} position={[0,.62,0]} castShadow><meshStandardMaterial color="#8d5d3d"/></RoundedBox><mesh position={[0,1.18,0]} castShadow><sphereGeometry args={[.43,16,14]}/><meshStandardMaterial color="#9c6b45"/></mesh><mesh position={[-.3,1.47,0]}><sphereGeometry args={[.17,12,10]}/><meshStandardMaterial color="#73472f"/></mesh><mesh position={[.3,1.47,0]}><sphereGeometry args={[.17,12,10]}/><meshStandardMaterial color="#73472f"/></mesh><mesh position={[0,1.1,.37]} scale={[.7,.55,.5]}><sphereGeometry args={[.28,12,10]}/><meshStandardMaterial color="#d1a176"/></mesh><mesh position={[0,1.13,.51]}><sphereGeometry args={[.05,8,8]}/><meshBasicMaterial color="#231a16"/></mesh></group>
  </>
}
