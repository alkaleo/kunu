import { Html, OrbitControls, Stars } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useKunuStore } from '../../store/useKunuStore'
import type { Journey } from '../../types/models'

function latLngToVector([lat, lng]: [number, number], radius = 1.53): [number, number, number] {
  const phi = (90 - lat) * Math.PI / 180
  const theta = (lng + 180) * Math.PI / 180
  return [-(radius * Math.sin(phi) * Math.cos(theta)), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta)]
}

function GlobeMesh({ journeys }: { journeys: Journey[] }) {
  const globe = useRef<THREE.Group>(null)
  const selectJourney = useKunuStore((state) => state.selectJourney)
  const selected = useKunuStore((state) => state.selectedJourneyId)
  const reducedMotion = useKunuStore((state) => state.settings.reducedMotion)

  useFrame((state, delta) => {
    if (!globe.current || reducedMotion) return
    globe.current.rotation.y += delta * .025
    globe.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * .7) * .003)
  })

  return <group ref={globe} rotation={[0, .28, 0]}>
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[1.5, 64, 64]}/>
      <meshStandardMaterial color="#78c9c7" roughness={.76} metalness={.03}/>
    </mesh>
    <mesh scale={1.006}>
      <sphereGeometry args={[1.5, 64, 64]}/>
      <meshStandardMaterial color="#d9bf83" wireframe transparent opacity={.17}/>
    </mesh>
    <mesh scale={1.075}>
      <sphereGeometry args={[1.5, 48, 48]}/>
      <meshPhongMaterial color="#56e1df" transparent opacity={.075} side={THREE.BackSide}/>
    </mesh>
    {journeys.map((journey) => {
      const position = latLngToVector(journey.coordinates)
      const active = selected === journey.id
      return <group key={journey.id} position={position}>
        <mesh scale={active ? 1.25 : 1}><sphereGeometry args={[.055, 20, 20]}/><meshStandardMaterial color={active ? '#f9fffe' : '#18c7c9'} emissive="#18c7c9" emissiveIntensity={active ? 2.5 : 1}/></mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.095, .012, 10, 28]}/><meshBasicMaterial color="#56e1df" transparent opacity={active ? .9 : .45}/></mesh>
        <Html center distanceFactor={7} zIndexRange={[20, 0]}><button className="globe-pin" aria-pressed={active} onClick={(event) => { event.stopPropagation(); selectJourney(journey.id) }}><span>{journey.location}</span></button></Html>
      </group>
    })}
  </group>
}

function CloudLayer() {
  const clouds = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => { if (clouds.current) clouds.current.rotation.y += delta * .018 })
  return <mesh ref={clouds} scale={1.027} rotation={[0, .5, .15]}><sphereGeometry args={[1.5, 36, 36]}/><meshBasicMaterial color="#f7ffff" wireframe transparent opacity={.08}/></mesh>
}

export function WorldGlobe({ journeys }: { journeys: Journey[] }) {
  return <div className="globe-canvas" aria-label="Interactive globe showing Yosemite, Lapland, and Corfu">
    <Canvas camera={{ position: [0, .15, 4.5], fov: 42 }} dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}>
      <ambientLight intensity={1.2}/><directionalLight position={[3, 4, 5]} intensity={2.4} color="#fff5dc"/><directionalLight position={[-4, -1, 2]} intensity={.55} color="#56e1df"/>
      <Stars radius={35} depth={10} count={260} factor={1.2} saturation={0} fade speed={.2}/>
      <GlobeMesh journeys={journeys}/><CloudLayer/>
      <OrbitControls enablePan={false} enableDamping dampingFactor={.06} rotateSpeed={.55} zoomSpeed={.6} minDistance={3.25} maxDistance={5.1}/>
    </Canvas>
  </div>
}
