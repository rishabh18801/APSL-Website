/**
 * Interactive hero scene: a LiDAR-style point-cloud terrain being swept by a
 * scan line, a GNSS rover on a survey pole sending pulses, and satellites in
 * orbit linked to the rover. Loaded lazily; see components/Hero.tsx.
 */
import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdaptiveDpr, Float, PerformanceMonitor, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const SIGNAL = new THREE.Color('#f5660a'); // brand orange

function height(x: number, z: number) {
  return (
    Math.sin(x * 0.35) * 0.55 +
    Math.cos(z * 0.3 + x * 0.12) * 0.45 +
    Math.sin((x + z) * 0.8) * 0.12 +
    Math.cos(Math.hypot(x - 3, z + 2) * 0.6) * 0.35
  );
}

// ---------- Point-cloud terrain with animated scan sweep (custom shader) ----------
function Terrain({ density }: { density: number }) {
  const material = useRef<THREE.ShaderMaterial>(null!);
  const geometry = useMemo(() => {
    const size = 26;
    const n = density;
    const pos = new Float32Array(n * n * 3);
    const h = new Float32Array(n * n);
    let i = 0;
    for (let ix = 0; ix < n; ix++) {
      for (let iz = 0; iz < n; iz++) {
        const x = (ix / (n - 1) - 0.5) * size + (Math.random() - 0.5) * 0.08;
        const z = (iz / (n - 1) - 0.5) * size + (Math.random() - 0.5) * 0.08;
        const y = height(x, z);
        pos.set([x, y, z], i * 3);
        h[i++] = y;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aHeight', new THREE.BufferAttribute(h, 1));
    return g;
  }, [density]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLow: { value: new THREE.Color('#1d5a9e') },
      uHigh: { value: SIGNAL.clone() },
      uBeam: { value: new THREE.Color('#0a2d48') },
      uPixel: { value: Math.min(window.devicePixelRatio, 2) },
    }),
    [],
  );

  useFrame((_, dt) => {
    material.current.uniforms.uTime.value += dt;
  });

  return (
    <points geometry={geometry} position={[0, -1.6, 0]}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        vertexShader={/* glsl */ `
          uniform float uTime; uniform float uPixel;
          attribute float aHeight;
          varying float vH; varying float vScan; varying float vFade;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mv;
            float scanZ = mod(uTime * 4.0, 34.0) - 17.0;
            vScan = smoothstep(1.4, 0.0, abs(position.z - scanZ));
            vH = clamp((aHeight + 1.2) / 2.4, 0.0, 1.0);
            vFade = smoothstep(14.0, 7.0, length(position.xz));
            gl_PointSize = (3.2 + vScan * 3.5) * uPixel * (14.0 / -mv.z);
          }`}
        fragmentShader={/* glsl */ `
          uniform vec3 uLow; uniform vec3 uHigh; uniform vec3 uBeam;
          varying float vH; varying float vScan; varying float vFade;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            float d = length(c);
            if (d > 0.5) discard;
            vec3 col = mix(uLow, uHigh, vH);
            col = mix(col, uBeam, vScan);
            float a = (0.55 + vScan * 0.45) * smoothstep(0.5, 0.1, d) * vFade;
            gl_FragColor = vec4(col, a);
          }`}
      />
    </points>
  );
}

// ---------- GNSS rover on survey pole with pulse rings ----------
function Rover() {
  const rings = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    rings.current.children.forEach((child, i) => {
      const t = (clock.elapsedTime * 0.6 + i / 3) % 1;
      child.scale.setScalar(0.3 + t * 2.6);
      ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.7;
    });
  });
  const groundY = height(0, 0) - 1.6;
  return (
    <group position={[0, groundY, 0]}>
      {/* pole */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 2.2, 12]} />
        <meshStandardMaterial color="#51637a" metalness={0.8} roughness={0.25} />
      </mesh>
      {/* bands on pole */}
      {[0.4, 0.9, 1.4].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.034, 0.034, 0.12, 12]} />
          <meshStandardMaterial color="#f5660a" emissive="#f5660a" emissiveIntensity={0.4} />
        </mesh>
      ))}
      {/* receiver head */}
      <group position={[0, 2.32, 0]}>
        <mesh>
          <cylinderGeometry args={[0.32, 0.36, 0.16, 40]} />
          <meshStandardMaterial color="#9fb0c4" metalness={0.3} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.1, 0]} scale={[1, 0.38, 1]}>
          <sphereGeometry args={[0.3, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#10192b" metalness={0.5} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.02, 0]}>
          <torusGeometry args={[0.36, 0.012, 8, 64]} />
          <meshBasicMaterial color={SIGNAL} />
        </mesh>
        <pointLight color={SIGNAL} intensity={3} distance={4} />
      </group>
      {/* pulse rings on ground */}
      <group ref={rings} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i}>
            <ringGeometry args={[0.95, 1, 64]} />
            <meshBasicMaterial color={SIGNAL} transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ---------- Satellites on tilted orbits with signal links to the rover ----------
const ROVER_TOP = new THREE.Vector3(0, height(0, 0) - 1.6 + 2.4, 0);

function Satellite({ radius, speed, tilt, phase, y }: { radius: number; speed: number; tilt: number; phase: number; y: number }) {
  const sat = useRef<THREE.Group>(null!);
  const line = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), ROVER_TOP]);
    const m = new THREE.LineDashedMaterial({ color: SIGNAL, dashSize: 0.25, gapSize: 0.18, transparent: true, opacity: 0.55 });
    const l = new THREE.Line(g, m);
    return l;
  }, []);
  const world = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const a = clock.elapsedTime * speed + phase;
    sat.current.position.set(Math.cos(a) * radius, y + Math.sin(a) * radius * Math.sin(tilt), Math.sin(a) * radius * Math.cos(tilt) - 4);
    sat.current.rotation.y = -a;
    sat.current.getWorldPosition(world);
    const p = line.geometry.attributes.position as THREE.BufferAttribute;
    p.setXYZ(0, world.x, world.y, world.z);
    p.needsUpdate = true;
    line.computeLineDistances();
    (line.material as THREE.LineDashedMaterial).opacity = 0.35 + Math.sin(clock.elapsedTime * 3 + phase) * 0.2;
  });

  return (
    <>
      <group ref={sat} scale={0.55}>
        <mesh>
          <boxGeometry args={[0.35, 0.35, 0.5]} />
          <meshStandardMaterial color="#67788d" metalness={0.9} roughness={0.3} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.62, 0, 0]}>
            <boxGeometry args={[0.8, 0.02, 0.32]} />
            <meshStandardMaterial color="#1e3a8a" emissive="#1d4ed8" emissiveIntensity={0.35} metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.3]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshBasicMaterial color={SIGNAL} />
        </mesh>
      </group>
      <primitive object={line} />
    </>
  );
}

// ---------- Camera rig: gentle pointer parallax ----------
function Rig() {
  const { camera, pointer, size } = useThree();
  const target = useMemo(() => new THREE.Vector3(0, 0.4, 0), []);
  useFrame((_, dt) => {
    // On wide screens push the scene to the right so it sits beside the headline.
    const offset = size.width >= 1024 ? -3.2 : size.width >= 640 ? -1.6 : 0;
    const k = 1 - Math.pow(0.02, dt);
    target.x += (offset - target.x) * k;
    camera.position.x += (pointer.x * 1.6 + offset - camera.position.x) * k;
    camera.position.y += (3.2 + pointer.y * 0.8 - camera.position.y) * k;
    camera.lookAt(target);
  });
  return null;
}

export default function HeroScene() {
  const [density, setDensity] = useState(() => (window.innerWidth < 768 ? 110 : 170));
  return (
    <Canvas
      camera={{ position: [0, 3.2, 9.5], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden
    >
      <PerformanceMonitor onDecline={() => setDensity(90)} />
      <AdaptiveDpr pixelated />
      <fog attach="fog" args={['#fff1e8', 9, 22]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 8, 5]} intensity={1.1} />
      <directionalLight position={[-6, 3, -4]} intensity={0.6} color="#5b86b3" />
      <Terrain density={density} />
      <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.15}>
        <Rover />
      </Float>
      <Satellite radius={5.5} speed={0.18} tilt={0.5} phase={0} y={3.0} />
      <Satellite radius={6.5} speed={0.13} tilt={-0.4} phase={2.2} y={3.6} />
      <Satellite radius={4.8} speed={0.22} tilt={0.9} phase={4.1} y={2.6} />
      <Sparkles count={60} scale={[16, 6, 10]} position={[0, 3, -2]} size={1.6} speed={0.25} color="#6f8bab" opacity={0.45} />
      <Rig />
    </Canvas>
  );
}
