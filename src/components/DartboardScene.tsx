import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text } from '@react-three/drei'
import * as THREE from 'three'
import { Player, LastThrow } from '../types'

interface DartboardSceneProps {
  onHit: (segment: string, multiplier: number, baseValue: number) => void
  lastThrow: LastThrow | null
  currentPlayer?: Player
}

// Standard dartboard number sequence
const DARTBOARD_NUMBERS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5]

export default function DartboardScene({ onHit, lastThrow, currentPlayer }: DartboardSceneProps) {
  const boardRef = useRef<THREE.Group>(null!)
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null)
  const [darts, setDarts] = useState<Array<{ position: THREE.Vector3; rotation: THREE.Euler }>>([])

  useFrame((state) => {
    if (boardRef.current) {
      boardRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.01
    }
  })

  const handleSegmentClick = (segment: string, multiplier: number, baseValue: number, point: THREE.Vector3) => {
    onHit(segment, multiplier, baseValue)

    // Add dart at hit position
    setDarts(prev => {
      const newDarts = [...prev, {
        position: new THREE.Vector3(point.x, point.y, 0.15),
        rotation: new THREE.Euler(Math.random() * 0.1 - 0.05, Math.random() * 0.1 - 0.05, Math.random() * Math.PI * 2)
      }]
      // Keep max 9 darts (3 rounds)
      if (newDarts.length > 9) return newDarts.slice(-9)
      return newDarts
    })
  }

  // Create segment geometries
  const segments = useMemo(() => {
    const result: JSX.Element[] = []
    const segmentAngle = (Math.PI * 2) / 20

    // Board dimensions
    const outerDouble = 1.7
    const innerDouble = 1.58
    const outerTriple = 1.07
    const innerTriple = 0.95
    const singleOuter = innerDouble
    const singleMiddle = outerTriple
    const singleInner = innerTriple
    const bullOuter = 0.16
    const bullInner = 0.07

    DARTBOARD_NUMBERS.forEach((num, i) => {
      const startAngle = segmentAngle * i - Math.PI / 2 - segmentAngle / 2
      const endAngle = startAngle + segmentAngle

      const isBlack = i % 2 === 0
      const singleColor = isBlack ? '#1a1a1a' : '#f5f0e1'
      const multiColor = isBlack ? '#1e3a1e' : '#8b2020'

      // Double ring
      result.push(
        <SegmentMesh
          key={`double-${num}`}
          innerRadius={innerDouble}
          outerRadius={outerDouble}
          startAngle={startAngle}
          endAngle={endAngle}
          color={multiColor}
          hoverColor="#fbbf24"
          segment={`D${num}`}
          multiplier={2}
          baseValue={num}
          onClick={handleSegmentClick}
          onHover={setHoveredSegment}
          isHovered={hoveredSegment === `D${num}`}
        />
      )

      // Outer single
      result.push(
        <SegmentMesh
          key={`outersingle-${num}`}
          innerRadius={singleMiddle}
          outerRadius={singleOuter}
          startAngle={startAngle}
          endAngle={endAngle}
          color={singleColor}
          hoverColor="#fcd34d"
          segment={`S${num}`}
          multiplier={1}
          baseValue={num}
          onClick={handleSegmentClick}
          onHover={setHoveredSegment}
          isHovered={hoveredSegment === `S${num}-outer`}
        />
      )

      // Triple ring
      result.push(
        <SegmentMesh
          key={`triple-${num}`}
          innerRadius={innerTriple}
          outerRadius={outerTriple}
          startAngle={startAngle}
          endAngle={endAngle}
          color={multiColor}
          hoverColor="#fbbf24"
          segment={`T${num}`}
          multiplier={3}
          baseValue={num}
          onClick={handleSegmentClick}
          onHover={setHoveredSegment}
          isHovered={hoveredSegment === `T${num}`}
        />
      )

      // Inner single
      result.push(
        <SegmentMesh
          key={`innersingle-${num}`}
          innerRadius={bullOuter}
          outerRadius={singleInner}
          startAngle={startAngle}
          endAngle={endAngle}
          color={singleColor}
          hoverColor="#fcd34d"
          segment={`S${num}`}
          multiplier={1}
          baseValue={num}
          onClick={handleSegmentClick}
          onHover={setHoveredSegment}
          isHovered={hoveredSegment === `S${num}-inner`}
        />
      )
    })

    return result
  }, [hoveredSegment])

  return (
    <group ref={boardRef}>
      {/* Wire frame / cabinet surround */}
      <mesh position={[0, 0, -0.15]}>
        <boxGeometry args={[4.2, 4.2, 0.3]} />
        <meshStandardMaterial color="#2d2217" roughness={0.9} />
      </mesh>

      {/* Main board base */}
      <mesh position={[0, 0, -0.05]}>
        <cylinderGeometry args={[1.85, 1.85, 0.1, 64]} />
        <meshStandardMaterial color="#0a0908" roughness={0.8} />
      </mesh>

      {/* Number segments */}
      {segments}

      {/* Outer bull (25) */}
      <mesh
        position={[0, 0, 0.01]}
        onClick={(e) => {
          e.stopPropagation()
          handleSegmentClick('25', 1, 25, e.point)
        }}
        onPointerOver={() => setHoveredSegment('25')}
        onPointerOut={() => setHoveredSegment(null)}
      >
        <circleGeometry args={[0.16, 32]} />
        <meshStandardMaterial
          color={hoveredSegment === '25' ? '#fbbf24' : '#1e5c1e'}
          roughness={0.4}
        />
      </mesh>

      {/* Inner bull (50) */}
      <mesh
        position={[0, 0, 0.02]}
        onClick={(e) => {
          e.stopPropagation()
          handleSegmentClick('BULL', 2, 25, e.point)
        }}
        onPointerOver={() => setHoveredSegment('BULL')}
        onPointerOut={() => setHoveredSegment(null)}
      >
        <circleGeometry args={[0.07, 32]} />
        <meshStandardMaterial
          color={hoveredSegment === 'BULL' ? '#fbbf24' : '#a91b1b'}
          roughness={0.4}
        />
      </mesh>

      {/* Wire ring overlay */}
      <WireRing radius={1.7} />
      <WireRing radius={1.58} />
      <WireRing radius={1.07} />
      <WireRing radius={0.95} />
      <WireRing radius={0.16} />
      <WireRing radius={0.07} />

      {/* Segment divider wires */}
      {DARTBOARD_NUMBERS.map((_, i) => {
        const angle = (Math.PI * 2 / 20) * i - Math.PI / 2 - (Math.PI / 20)
        return (
          <mesh key={`wire-${i}`} position={[0, 0, 0.03]} rotation={[0, 0, angle]}>
            <boxGeometry args={[0.015, 1.7, 0.02]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.3} />
          </mesh>
        )
      })}

      {/* Number labels */}
      {DARTBOARD_NUMBERS.map((num, i) => {
        const angle = (Math.PI * 2 / 20) * i - Math.PI / 2
        const radius = 1.92
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        return (
          <Text
            key={`label-${num}`}
            position={[x, y, 0.05]}
            fontSize={0.15}
            color="#f5f0e1"
            font="/fonts/Inter-Bold.woff"
            anchorX="center"
            anchorY="middle"
          >
            {num.toString()}
          </Text>
        )
      })}

      {/* Thrown darts */}
      {darts.map((dart, i) => (
        <Float key={i} speed={2} rotationIntensity={0.1} floatIntensity={0.1}>
          <group position={dart.position} rotation={dart.rotation}>
            {/* Dart tip */}
            <mesh position={[0, 0, -0.05]}>
              <coneGeometry args={[0.02, 0.08, 8]} />
              <meshStandardMaterial color="#808080" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Dart barrel */}
            <mesh position={[0, 0, 0.05]}>
              <cylinderGeometry args={[0.025, 0.02, 0.1, 8]} />
              <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Dart shaft */}
            <mesh position={[0, 0, 0.15]}>
              <cylinderGeometry args={[0.01, 0.01, 0.1, 8]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            {/* Flight */}
            <mesh position={[0, 0, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.08, 0.06]} />
              <meshStandardMaterial
                color={currentPlayer?.color || '#ff4444'}
                side={THREE.DoubleSide}
                transparent
                opacity={0.9}
              />
            </mesh>
            <mesh position={[0, 0, 0.22]} rotation={[Math.PI / 2, Math.PI / 2, 0]}>
              <planeGeometry args={[0.08, 0.06]} />
              <meshStandardMaterial
                color={currentPlayer?.color || '#ff4444'}
                side={THREE.DoubleSide}
                transparent
                opacity={0.9}
              />
            </mesh>
          </group>
        </Float>
      ))}

      {/* Last throw indicator */}
      {lastThrow && (
        <Float speed={5} floatIntensity={0.3}>
          <Text
            position={[0, -2.3, 0]}
            fontSize={0.25}
            color={lastThrow.bust ? '#ef4444' : '#22c55e'}
            anchorX="center"
            font="/fonts/Inter-Bold.woff"
          >
            {lastThrow.bust ? 'BUST!' : `${lastThrow.segment} = ${lastThrow.score}`}
          </Text>
        </Float>
      )}
    </group>
  )
}

function SegmentMesh({
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  color,
  hoverColor,
  segment,
  multiplier,
  baseValue,
  onClick,
  onHover,
  isHovered,
}: {
  innerRadius: number
  outerRadius: number
  startAngle: number
  endAngle: number
  color: string
  hoverColor: string
  segment: string
  multiplier: number
  baseValue: number
  onClick: (segment: string, multiplier: number, baseValue: number, point: THREE.Vector3) => void
  onHover: (segment: string | null) => void
  isHovered: boolean
}) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    const segments = 16

    // Start at inner radius
    shape.moveTo(
      Math.cos(startAngle) * innerRadius,
      Math.sin(startAngle) * innerRadius
    )

    // Arc along inner edge
    for (let i = 0; i <= segments; i++) {
      const angle = startAngle + (endAngle - startAngle) * (i / segments)
      shape.lineTo(
        Math.cos(angle) * innerRadius,
        Math.sin(angle) * innerRadius
      )
    }

    // Line to outer radius
    shape.lineTo(
      Math.cos(endAngle) * outerRadius,
      Math.sin(endAngle) * outerRadius
    )

    // Arc back along outer edge
    for (let i = segments; i >= 0; i--) {
      const angle = startAngle + (endAngle - startAngle) * (i / segments)
      shape.lineTo(
        Math.cos(angle) * outerRadius,
        Math.sin(angle) * outerRadius
      )
    }

    shape.closePath()

    return new THREE.ShapeGeometry(shape)
  }, [innerRadius, outerRadius, startAngle, endAngle])

  return (
    <mesh
      geometry={geometry}
      position={[0, 0, 0.01]}
      onClick={(e) => {
        e.stopPropagation()
        onClick(segment, multiplier, baseValue, e.point)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        onHover(segment)
      }}
      onPointerOut={() => onHover(null)}
    >
      <meshStandardMaterial
        color={isHovered ? hoverColor : color}
        roughness={0.7}
      />
    </mesh>
  )
}

function WireRing({ radius }: { radius: number }) {
  return (
    <mesh position={[0, 0, 0.025]}>
      <torusGeometry args={[radius, 0.008, 8, 64]} />
      <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.3} />
    </mesh>
  )
}
