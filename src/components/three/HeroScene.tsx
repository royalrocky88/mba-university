import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr, Float, Environment, Preload } from '@react-three/drei'
import * as THREE from 'three'

/**
 * The WebGL hero.
 *
 * Lazy-loaded and only mounted on pointer-capable screens wider than 768px with
 * reduced-motion off — see `Hero.tsx`, which renders `HeroFallback` otherwise.
 * That gate is why this file can afford an environment map and a particle field.
 */

const GOLD = '#c9a227'
const GOLD_LIGHT = '#e0bb4a'
const INK = '#142046'

/** Slowly rotating wireframe icosahedron — the "knowledge sphere" at the centre. */
function KnowledgeSphere() {
  const mesh = useRef<THREE.Mesh>(null)
  const inner = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.12
      mesh.current.rotation.x += delta * 0.04
    }
    if (inner.current) {
      inner.current.rotation.y -= delta * 0.2
      inner.current.rotation.z += delta * 0.06
    }
  })

  return (
    <group>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.65, 2]} />
        <meshBasicMaterial color={GOLD} wireframe transparent opacity={0.28} />
      </mesh>
      <mesh ref={inner}>
        <icosahedronGeometry args={[1.12, 1]} />
        <meshStandardMaterial
          color={INK}
          roughness={0.18}
          metalness={0.92}
          emissive={GOLD}
          emissiveIntensity={0.12}
          flatShading
        />
      </mesh>
    </group>
  )
}

/** A stylised mortarboard, built from primitives so no GLTF asset is required. */
function GraduationCap() {
  const group = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.35
  })

  return (
    <group ref={group} position={[0, 0.05, 0]} rotation={[0.18, 0, 0.08]} scale={0.92}>
      {/* Crown */}
      <mesh position={[0, -0.16, 0]}>
        <cylinderGeometry args={[0.3, 0.34, 0.26, 24]} />
        <meshStandardMaterial color={INK} roughness={0.42} metalness={0.55} />
      </mesh>
      {/* Board */}
      <mesh position={[0, 0.02, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[1.06, 0.05, 1.06]} />
        <meshStandardMaterial color={INK} roughness={0.35} metalness={0.7} />
      </mesh>
      {/* Button at the centre of the board */}
      <mesh position={[0, 0.07, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial
          color={GOLD_LIGHT}
          roughness={0.15}
          metalness={1}
          emissive={GOLD}
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Tassel cord and bob */}
      <mesh position={[0.3, -0.05, 0.3]} rotation={[0, 0, 0.22]}>
        <cylinderGeometry args={[0.012, 0.012, 0.42, 8]} />
        <meshStandardMaterial color={GOLD} roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[0.35, -0.29, 0.34]}>
        <sphereGeometry args={[0.07, 14, 14]} />
        <meshStandardMaterial
          color={GOLD_LIGHT}
          roughness={0.35}
          metalness={0.85}
          emissive={GOLD}
          emissiveIntensity={0.35}
        />
      </mesh>
    </group>
  )
}

/** Orbiting particle field. Positions are generated once and never reallocated. */
function ParticleField({ count = 900 }: { count?: number }) {
  const points = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const array = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Distribute on a spherical shell with jitter, so the field reads as a
      // volume rather than a flat ring from any camera angle.
      const radius = 2.6 + Math.random() * 2.4
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      array[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      array[i * 3 + 1] = radius * Math.cos(phi) * 0.62
      array[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    }
    return array
  }, [count])

  useFrame((_, delta) => {
    if (points.current) {
      points.current.rotation.y += delta * 0.045
      points.current.rotation.x += delta * 0.012
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color={GOLD_LIGHT}
        transparent
        opacity={0.72}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/**
 * Eases the camera toward the pointer. Kept subtle — a large parallax on a hero
 * this size reads as instability rather than depth.
 */
function CameraParallax() {
  const { camera, pointer } = useThree()
  const target = useRef(new THREE.Vector3(0, 0, 6.2))

  useFrame((_, delta) => {
    target.current.set(pointer.x * 0.85, pointer.y * 0.5, 6.2)
    // Frame-rate independent damping.
    camera.position.lerp(target.current, 1 - Math.pow(0.0015, delta))
    camera.lookAt(0, 0, 0)
  })

  return null
}

export default function HeroScene() {
  return (
    <Canvas
      // `aria-hidden` because the scene is decorative — the headline beside it
      // carries all the meaning.
      aria-hidden="true"
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6.2], fov: 42 }}
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
      style={{ touchAction: 'pan-y' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 5, 3]} intensity={1.6} color="#ffffff" />
        <pointLight position={[-4, -2, -3]} intensity={2.4} color={GOLD} />

        <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.7}>
          <GraduationCap />
        </Float>

        <KnowledgeSphere />
        <ParticleField />

        <Environment preset="city" />
        <CameraParallax />
        <AdaptiveDpr pixelated />
        <Preload all />
      </Suspense>
    </Canvas>
  )
}
