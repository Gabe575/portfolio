'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

// Glow bands sweep up through the name. With bands spaced waveHeight / bandCount apart and
// narrower than that spacing, at most one band touches a particle, so the per-band loop
// collapses to a single mod. The sweep phase is wrapped on the CPU to keep float precision.
const WAVE_HEIGHT = 11;
const WAVE_SPEED = 0.07;
const BAND_COUNT = 3;
const BAND_WIDTH = 3.5;
const GLOW_STRENGTH = 3;

const vertexShader = `
  uniform float time;
  uniform float progress;
  uniform float direction;
  uniform float width;
  uniform float height;
  uniform float glowPhase;

  attribute float size;
  attribute float baseAngle;
  attribute float radius;
  attribute float speed;
  // Click-blast displacement, simulated on the CPU
  attribute vec3 offset;

  varying vec3 vColor;

  void main() {
    // Glow is constant across a point, so it's computed here instead of per pixel
    float dist = mod(position.y + glowPhase, BAND_SPACING) / BAND_WIDTH;
    float fade = (dist - 0.05) / 0.95;
    float glow = dist <= 1.0 ? min((1.0 - fade) * (1.0 - fade), 1.0) : 0.0;
    vColor = color * (0.5 + glow * GLOW_STRENGTH);

    vec3 p = position + offset;

    // Scroll scatter; progress is a uniform so this branch is free when it's 0
    if (progress > 0.0) {
      float angle = baseAngle - speed * time * progress;
      float circleX = cos(angle) * radius * width * progress;
      float circleY = sin(angle) * radius * width * progress;

      const float tilt = 3.14159265359 / 2.1;
      p = vec3(
        p.x * (1.0 - progress) + circleX,
        p.y + direction * height * progress + circleY * cos(tilt),
        p.z * (1.0 - progress) + circleY * sin(tilt)
      );
    }

    // Slight wave effect
    p.z += sin(time + p.x * 3.0) * 0.1 * (1.0 - progress);

    gl_PointSize = size;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = `
  uniform float opacity;

  varying vec3 vColor;

  void main() {
    gl_FragColor = vec4(vColor, opacity);
  }
`;

// Uniforms both names share; each material spreads these in, so one write updates both
const createSharedUniforms = () => ({
  time: { value: 0 },
  progress: { value: 0 },
  opacity: { value: 0 },
  glowPhase: { value: 0 },
  width: { value: 0 },
  height: { value: window.innerHeight },
});
type SharedUniforms = ReturnType<typeof createSharedUniforms>;

interface ShaderPoints extends THREE.Points {
  material: THREE.ShaderMaterial;
  userData: {
    origPositions: Float32Array;
    velocities: Float32Array;
    // Indices of particles still moving, so settled ones cost nothing
    active: Int32Array;
    activeCount: number;
    isActive: Uint8Array;
  };
}

// Click blasts: each click adds a velocity kick to nearby particles, and an overdamped
// spring pulls them home. The spring is tuned so a single blast follows
// e^(-1.2t) - e^(-14t): out in ~0.2s, then a slow drift back.
const BLAST_RADIUS = 3;
const BLAST_STRENGTH = 16;
const SPRING = 1.2 * 14;
const DAMPING = 1.2 + 14;
const IMPULSE = 14 - 1.2;
const SIM_STEP = 1 / 120;
const REST = 1e-2;

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
  return t * t * (3 - 2 * t);
};

const blast = (sys: ShaderPoints, hx: number, hy: number) => {
  const { origPositions: orig, velocities: vel, active, isActive } = sys.userData;
  const offset = sys.geometry.getAttribute('offset').array as Float32Array;
  const radii = sys.geometry.getAttribute('radius').array as Float32Array;
  const speeds = sys.geometry.getAttribute('speed').array as Float32Array;
  // Lobed outline that changes with every click, so no blast is a clean circle
  const seed = Math.random() * 100;
  // Largest possible edge: max lobes (1.62) * max per-particle scale (1.3)
  const reach = BLAST_RADIUS * 2.1;

  for (let i = 0; i < radii.length; i++) {
    const dx = orig[i * 3] + offset[i * 3] - hx;
    const dy = orig[i * 3 + 1] + offset[i * 3 + 1] - hy;
    if (Math.abs(dx) > reach || Math.abs(dy) > reach) continue;

    const ang = Math.atan2(dy, dx);
    const lobes =
      1 +
      0.3 * Math.sin(ang * 3 + seed) +
      0.2 * Math.sin(ang * 5 - seed * 1.7) +
      0.12 * Math.sin(ang * 9 + seed * 2.3);
    const edge = BLAST_RADIUS * lobes * (0.7 + 0.6 * Math.random());
    const falloff = 1 - smoothstep(0, edge, Math.hypot(dx, dy));
    if (falloff <= 0) continue;

    const jx = dx + (Math.random() - 0.5) * 0.8;
    const jy = dy + (Math.random() - 0.5) * 0.8;
    const jz = (radii[i] - 0.65) * 2;
    const len = Math.hypot(jx, jy, jz) || 1;
    const kick =
      (falloff * BLAST_STRENGTH * speeds[i] * (0.4 + 1.2 * Math.random()) * IMPULSE) / len;
    vel[i * 3] += jx * kick;
    vel[i * 3 + 1] += jy * kick;
    vel[i * 3 + 2] += jz * kick;
    if (!isActive[i]) {
      isActive[i] = 1;
      active[sys.userData.activeCount++] = i;
    }
  }
};

// Advances the spring for moving particles only; no upload once everything has settled
const stepBlast = (sys: ShaderPoints, dt: number) => {
  const data = sys.userData;
  if (data.activeCount === 0) return;
  const { velocities: vel, active, isActive } = data;
  const attr = sys.geometry.getAttribute('offset') as THREE.BufferAttribute;
  const offset = attr.array as Float32Array;
  const steps = Math.ceil(dt / SIM_STEP);
  const h = dt / steps;

  for (let k = 0; k < data.activeCount; k++) {
    const i = active[k];
    let motion = 0;
    for (let c = i * 3; c < i * 3 + 3; c++) {
      let x = offset[c];
      let v = vel[c];
      for (let s = 0; s < steps; s++) {
        v += (-SPRING * x - DAMPING * v) * h;
        x += v * h;
      }
      offset[c] = x;
      vel[c] = v;
      motion = Math.max(motion, Math.abs(x), Math.abs(v));
    }
    if (motion < REST) {
      offset.fill(0, i * 3, i * 3 + 3);
      vel.fill(0, i * 3, i * 3 + 3);
      isActive[i] = 0;
      active[k--] = active[--data.activeCount];
    }
  }
  attr.needsUpdate = true;
};

const generateParticleText = (
  text: string,
  font: Font,
  palette: THREE.Color[],
  shared: SharedUniforms,
  particleCount = 4000,
  positionY = 0,
  centerOffset = 0,
) => {
  const textGeo = new TextGeometry(text, {
    font,
    size: 5,
    depth: 0.5,
    curveSegments: 12,
  });

  textGeo.computeBoundingBox();
  const center = new THREE.Vector3();
  textGeo.boundingBox?.getCenter(center);
  textGeo.translate(-center.x, -center.y, -center.z);
  textGeo.translate(centerOffset, positionY, 0);

  const sampler = new MeshSurfaceSampler(new THREE.Mesh(textGeo)).setWeightAttribute(null).build();
  const sampledPositions = new Float32Array(particleCount * 3);
  const _position = new THREE.Vector3();

  const baseAngles = new Float32Array(particleCount);
  const radii = new Float32Array(particleCount);
  const speeds = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    sampler.sample(_position);
    sampledPositions[i * 3] = _position.x;
    sampledPositions[i * 3 + 1] = _position.y;
    sampledPositions[i * 3 + 2] = _position.z;

    baseAngles[i] = (i / particleCount) * Math.PI * 2;
    radii[i] = 0.3 + Math.random() * 0.7;
    speeds[i] = 1 + Math.random() * 0.5;
  }
  textGeo.dispose();

  const colArr = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const t = i / (particleCount - 1);
    const colorIndex = t * (palette.length - 1);
    const c1 = palette[Math.floor(colorIndex)];
    const c2 = palette[Math.min(Math.ceil(colorIndex), palette.length - 1)];
    const mix = colorIndex % 1;
    const col = new THREE.Color().lerpColors(c1, c2, mix);
    col.multiplyScalar(1.3);
    colArr.set([col.r, col.g, col.b], i * 3);
    sizes[i] = 0.3 + Math.random() * 0.7;
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(sampledPositions, 3));
  geom.setAttribute('color', new THREE.Float32BufferAttribute(colArr, 3));
  geom.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

  geom.setAttribute('baseAngle', new THREE.Float32BufferAttribute(baseAngles, 1));
  geom.setAttribute('radius', new THREE.Float32BufferAttribute(radii, 1));
  geom.setAttribute('speed', new THREE.Float32BufferAttribute(speeds, 1));
  geom.setAttribute(
    'offset',
    new THREE.Float32BufferAttribute(new Float32Array(particleCount * 3), 3).setUsage(
      THREE.DynamicDrawUsage,
    ),
  );

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      ...shared,
      direction: { value: positionY > 0 ? 1 : -1 },
    },
    defines: {
      BAND_SPACING: (WAVE_HEIGHT / BAND_COUNT).toFixed(4),
      BAND_WIDTH: BAND_WIDTH.toFixed(4),
      GLOW_STRENGTH: GLOW_STRENGTH.toFixed(4),
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });

  const particleSystem = new THREE.Points(geom, mat);
  particleSystem.userData = {
    origPositions: sampledPositions.slice(),
    velocities: new Float32Array(particleCount * 3),
    active: new Int32Array(particleCount),
    activeCount: 0,
    isActive: new Uint8Array(particleCount),
  };
  return particleSystem as ShaderPoints;
};

function Particles({ onReady }: { onReady?: () => void }) {
  const { scene, camera, gl, advance } = useThree();
  const shared = useRef<SharedUniforms | null>(null);
  const firstNameRef = useRef<ShaderPoints | null>(null);
  const lastNameRef = useRef<ShaderPoints | null>(null);
  const scrollProgress = useRef(0);
  const loadProgress = useRef(0);
  const [particleSystem, setParticleSystem] = useState<ShaderPoints[] | null>();
  const targetZ = useRef<number>(30);
  const pointer = useRef({ x: 0, y: 0 });
  const time = useRef(0);
  // Seconds since the last rendered frame, measured by our own loop (see the tick below)
  const frameDelta = useRef(0);

  // Subtle camera parallax that follows the mouse
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  // Click the name to blast a hole in it. Listens on window because the page content
  // stacks above the sticky hero canvas, so the canvas itself never receives the click.
  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const hit = new THREE.Vector3();

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 || scrollProgress.current > 0.3) return;
      const target = e.target as Element | null;
      if (target?.closest('main, nav, a, button, input, textarea, select, label, [role="dialog"]'))
        return;
      const bounds = gl.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((e.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      if (Math.abs(ndc.x) > 1 || Math.abs(ndc.y) > 1) return;

      raycaster.setFromCamera(ndc, camera);
      if (!raycaster.ray.intersectPlane(plane, hit)) return;
      [firstNameRef.current, lastNameRef.current].forEach((sys) => sys && blast(sys, hit.x, hit.y));
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [camera, gl]);

  useEffect(() => {
    const loader = new FontLoader();
    loader.load('/fonts/jetbrains_mono_hero.json', function (font) {
      const paletteBlue = [
        new THREE.Color(0x0011ff),
        new THREE.Color(0x0044ff),
        new THREE.Color(0x0088ff),
        new THREE.Color(0x00ccff),
        new THREE.Color(0x00ffee),
        new THREE.Color(0x00ffaa),
      ];
      const paletteGreen = [
        new THREE.Color(0x00ff88),
        new THREE.Color(0x00ff55),
        new THREE.Color(0x00cc66),
        new THREE.Color(0x00ffaa),
        new THREE.Color(0x00ddaa),
        new THREE.Color(0x00bbcc),
      ];
      const count = window.innerWidth < 768 ? 2500 : 4000;
      shared.current = createSharedUniforms();
      firstNameRef.current = generateParticleText(
        'Gabriel',
        font,
        paletteBlue,
        shared.current,
        count,
        3,
      );
      lastNameRef.current = generateParticleText(
        'Santos',
        font,
        paletteGreen,
        shared.current,
        count,
        -3,
        -2,
      );
      setParticleSystem([firstNameRef.current, lastNameRef.current]);
    });

    return () => {
      if (firstNameRef.current) {
        firstNameRef.current.geometry.dispose();
        firstNameRef.current.material.dispose();
      }
      if (lastNameRef.current) {
        lastNameRef.current.geometry.dispose();
        lastNameRef.current.material.dispose();
      }
    };
  }, [scene]);

  useEffect(() => {
    if (!particleSystem) return;
    // The page content slides up over the hero; stop rendering once it fully covers it,
    // with margin for its rounded top corners
    const sheet = document.querySelector('main');
    let covered = false;
    const onScroll = () => {
      const triggerHeight = window.innerHeight / 2;
      scrollProgress.current = Math.min(Math.max(window.scrollY / triggerHeight, 0), 2);
      covered = !!sheet && sheet.getBoundingClientRect().top <= -64;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    let resizeTimeout: NodeJS.Timeout;
    const adjustCamera = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);

      resizeTimeout = setTimeout(() => {
        if (!firstNameRef.current || !shared.current) return;

        const cam = camera as THREE.PerspectiveCamera;
        const box = new THREE.Box3().setFromArray(firstNameRef.current.userData.origPositions);
        const size = new THREE.Vector3();
        box.getSize(size);

        const halfFov = (cam.fov * Math.PI) / 180 / 2;
        const requiredZ = Math.max(
          size.y / (2 * Math.tan(halfFov)),
          size.x / cam.aspect / (2 * Math.tan(halfFov)),
        );
        shared.current.width.value = Math.max(50 * cam.aspect, 100);
        shared.current.height.value = Math.max(20 / cam.aspect, 30);
        targetZ.current = Math.max(requiredZ + 5, 20);

        // The canvas fills 100vh, which on mobile runs behind the browser toolbars. Shift the
        // view so the name centers in the smallest viewport (toolbars shown) instead.
        const probe = document.createElement('div');
        probe.style.cssText = 'position:fixed;top:0;height:100svh;visibility:hidden';
        document.body.appendChild(probe);
        const visibleHeight = probe.offsetHeight;
        probe.remove();

        const { width, height } = gl.domElement.getBoundingClientRect();
        const shift = (height - visibleHeight) / 2;
        if (shift > 0.5) cam.setViewOffset(width, height, 0, shift, width, height);
        else cam.clearViewOffset();
      }, 200);
    };
    window.addEventListener('resize', adjustCamera);
    adjustCamera();

    // Drive rendering ourselves (frameloop="never") at the display's refresh rate, fully
    // idle once the hero is scrolled away.
    let raf = 0;
    let lastRender = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (covered) return;
      // R3F's own delta is unreliable with frameloop="never" (THREE.Clock auto-restarts)
      frameDelta.current = (now - lastRender) / 1000;
      lastRender = now;
      advance(now / 1000);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimeout);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', adjustCamera);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [particleSystem]);

  const readyCalled = useRef(false);

  useEffect(() => {
    if (!particleSystem || readyCalled.current) return;

    readyCalled.current = true;
    onReady?.();
  }, [particleSystem, onReady]);

  useFrame(() => {
    const u = shared.current;
    if (!u || !firstNameRef.current || !lastNameRef.current) return;

    // Clamp so a long pause (hidden tab) doesn't fire one giant step
    const dt = Math.min(frameDelta.current, 1 / 30);
    time.current += dt;
    loadProgress.current = Math.min(loadProgress.current + dt / 2, 1);

    const targetProgress = Math.min(Math.max(1 - loadProgress.current, scrollProgress.current), 1);
    const easedProgress =
      targetProgress < 0.5
        ? Math.pow(targetProgress * 2, 5) / 2
        : 1 - Math.pow((1 - targetProgress) * 2, 2) / 2;

    stepBlast(firstNameRef.current, dt);
    stepBlast(lastNameRef.current, dt);
    u.time.value = time.current;
    u.progress.value = easedProgress;
    u.opacity.value = loadProgress.current * loadProgress.current;
    u.glowPhase.value = (time.current * WAVE_SPEED * WAVE_HEIGHT) % WAVE_HEIGHT;

    // Frame-rate independent easing, tuned to feel like the old per-frame 0.1 / 0.04 at 120Hz
    const zEase = 1 - Math.pow(0.9, dt * 120);
    const xyEase = 1 - Math.pow(0.96, dt * 120);
    camera.position.set(
      camera.position.x + (pointer.current.x * 2.5 - camera.position.x) * xyEase,
      camera.position.y + (pointer.current.y * 1.5 - camera.position.y) * xyEase,
      camera.position.z + (targetZ.current - camera.position.z) * zEase,
    );
    camera.lookAt(0, 0, 0);
  });

  return <>{particleSystem?.map((obj, i) => obj && <primitive key={i} object={obj} />)}</>;
}

interface AnimatedHeroProps {
  onReady?: () => void;
}

export default function AnimatedHero({ onReady }: AnimatedHeroProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 0], fov: 90 }}
      frameloop="never"
      // The composer's full-screen pass is the only thing drawn to the canvas, so its own
      // antialiasing, depth and stencil buffers would go unused
      gl={{ antialias: false, depth: false, stencil: false }}
    >
      <Particles onReady={onReady} />

      {/* Additive points never read depth, so the composer doesn't need a depth buffer */}

      <EffectComposer depthBuffer={false} multisampling={2}>
        <Bloom
          intensity={0.3}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.9}
          radius={0.4}
          levels={6}
        />
      </EffectComposer>
    </Canvas>
  );
}
