'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useState, useRef } from 'react';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import fontJson from 'three/examples/fonts/droid/droid_sans_mono_regular.typeface.json';

function Scene({
  particleCount = 4000,
}: Readonly<{
  particleCount?: number;
}>) {
  const { scene, camera, viewport } = useThree();
  const firstNameRef = useRef<THREE.Points | null>(null);
  const lastNameRef = useRef<THREE.Points | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const targetZ = useRef<number>(30);

  useEffect(() => {
    const onScroll = () => {
      const triggerHeight = window.innerHeight / 2;
      const progress = Math.min(Math.max(window.scrollY / triggerHeight, 0), 1);
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', onScroll);

    const adjustCamera = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!firstNameRef.current || !lastNameRef.current) return;

          const cam = camera as THREE.PerspectiveCamera;
          const box = new THREE.Box3();
          const pos = firstNameRef.current.userData.origPositions as Float32Array;
          for (let i = 0; i < pos.length; i += 3) {
            box.expandByPoint(new THREE.Vector3(pos[i], pos[i + 1], pos[i + 2]));
          }

          const size = new THREE.Vector3();
          box.getSize(size);

          const halfFov = (cam.fov * Math.PI) / 180 / 2;
          const requiredZ = Math.max(
            size.y / (2 * Math.tan(halfFov)),
            size.x / cam.aspect / (2 * Math.tan(halfFov)),
          );

          targetZ.current = Math.max(requiredZ + 5, 20);
        });
      });
    };
    window.addEventListener('resize', adjustCamera);
    window.addEventListener('orientationchange', adjustCamera);
    adjustCamera();

    let start = performance.now();
    const duration = 2000;

    const animate = (time: number) => {
      const elapsed = time - start;
      const p = Math.min(elapsed / duration, 1);
      setLoadProgress(p);
      if (p < 1) {
        requestAnimationFrame(animate);
      } else {
        document.body.style.overflow = '';
      }
    };
    requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', adjustCamera);
      window.removeEventListener('orientationchange', adjustCamera);
    };
  }, []);

  useEffect(() => {
    const loader = new FontLoader();
    const font = loader.parse(fontJson);
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

    firstNameRef.current = generateParticleText(
      scene,
      'Gabriel',
      font,
      paletteBlue,
      3,
      particleCount,
    );
    lastNameRef.current = generateParticleText(
      scene,
      'Santos',
      font,
      paletteGreen,
      -3,
      particleCount,
      -2,
    );
    computeGlobalBounds(firstNameRef.current!, lastNameRef.current!);
    [firstNameRef.current, lastNameRef.current].forEach((sys, idx) => {
      if (!sys) return;
      const count = sys.geometry.attributes.position.count;
      const swirlData = [];
      const startY = idx === 0 ? viewport.height : -viewport.height;
      for (let i = 0; i < count; i++) {
        swirlData.push({
          baseAngle: (i / count) * Math.PI * 2,
          radius: 0.3 + Math.random() * 0.7,
          speed: 1 + Math.random() * 0.5,
          startY,
        });
        const positions = sys.geometry.attributes.position as THREE.BufferAttribute;
        positions.setY(i, startY);
      }
      sys.userData.swirlData = swirlData;
      (sys.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    });
  }, [scene]);

  const applyVerticalWave = (sys: THREE.Points, t: number) => {
    const colors = sys.geometry.attributes.color as THREE.BufferAttribute;
    const positions = sys.geometry.attributes.position as THREE.BufferAttribute;
    const { origCols, waveBounds } = sys.userData;
    if (!waveBounds) return;

    const { globalMinY, height } = waveBounds;
    const speed = 0.05;
    const bandCount = 3;
    const bandWidth = height * 0.4;

    for (let i = 0; i < colors.count; i++) {
      const y = positions.getY(i);
      const oc = origCols[i];
      let glow = 0;

      for (let b = 0; b < bandCount; b++) {
        const bandOffset = (b / bandCount) * height;
        const raw = y - globalMinY - bandOffset + t * speed * height;
        const wrapped = ((raw % height) + height) % height;
        const dist = wrapped / bandWidth;
        let bandGlow = 0;

        if (dist <= 1) {
          const fadeDist = (dist - 0.05) / (1 - 0.05);
          bandGlow = Math.pow(1 - fadeDist, 2);
        }
        glow += bandGlow;
      }
      glow = Math.min(glow, 1);
      const brightness = 0.1 + 2.5 * glow;
      colors.setXYZ(i, oc.r * brightness, oc.g * brightness, oc.b * brightness);
    }
    colors.needsUpdate = true;
  };

  const applyHorizontalSway = (sys: THREE.Points, t: number) => {
    const positions = sys.geometry.attributes.position as THREE.BufferAttribute;
    const swayAmplitude = 0.03;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      positions.setX(i, x + Math.sin(y * 2 + t * 3) * swayAmplitude);
    }

    positions.needsUpdate = true;
  };

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    const swirlTop = new THREE.Vector3(0, 10, 0);
    const swirlBottom = new THREE.Vector3(0, -10, 0);
    [firstNameRef.current, lastNameRef.current].forEach((sys, idx) => {
      if (!sys) return;
      const positions = sys.geometry.attributes.position as THREE.BufferAttribute;
      const origPositions = sys.userData.origPositions as Float32Array;
      const swirlData = sys.userData.swirlData;
      const count = positions.count;
      const center = idx === 0 ? swirlTop : swirlBottom;

      const targetProgress = Math.max(1 - loadProgress, scrollProgress);
      const easedProgress =
        targetProgress < 0.5
          ? Math.pow(targetProgress * 2, 5) / 2
          : 1 - Math.pow((1 - targetProgress) * 2, 2) / 2;

      for (let i = 0; i < count; i++) {
        const origX = origPositions[i * 3];
        const origY = origPositions[i * 3 + 1];
        const origZ = origPositions[i * 3 + 2];

        const { baseAngle, radius, speed, startY } = swirlData[i];

        const cx = THREE.MathUtils.lerp(origX, center.x, easedProgress);
        const cy = THREE.MathUtils.lerp(origY, center.y, easedProgress);
        const cz = THREE.MathUtils.lerp(origZ, center.z, easedProgress);

        const angle = baseAngle - speed * t * easedProgress;
        const zSign = idx === 0 ? 1 : -1;
        const tilt = Math.PI / 2.1;

        const circleX = Math.cos(angle) * radius * state.viewport.width * easedProgress;
        const circleY = Math.sin(angle) * radius * state.viewport.width * easedProgress;

        const rotatedY = circleY * Math.cos(tilt);
        const rotatedZ = circleY * Math.sin(tilt) * zSign;

        positions.setXYZ(i, cx + circleX, cy + rotatedY, cz + rotatedZ);
      }
      camera.position.z += (targetZ.current - camera.position.z) * 0.1;
      camera.updateProjectionMatrix();
      positions.needsUpdate = true;
      applyVerticalWave(sys, t);
      applyHorizontalSway(sys, t);
    });
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
      <EffectComposer>
        <Bloom intensity={1.5} luminanceThreshold={0.5} luminanceSmoothing={0.9} radius={0.4} />
      </EffectComposer>
    </>
  );
}

const generateParticleText = (
  scene: THREE.Scene,
  text: string,
  font: Font,
  palette: THREE.Color[],
  positionY = 0,
  particleCount = 5000,
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

  for (let i = 0; i < particleCount; i++) {
    sampler.sample(_position);
    sampledPositions[i * 3] = _position.x;
    sampledPositions[i * 3 + 1] = _position.y;
    sampledPositions[i * 3 + 2] = _position.z;
  }

  const colArr = new Float32Array(particleCount * 3);
  const origCols = [];
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
    origCols.push(col.clone());
    sizes[i] = 0.02 + Math.random() * 0.04;
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(sampledPositions, 3));
  geom.setAttribute('color', new THREE.Float32BufferAttribute(colArr, 3));
  geom.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    size: 0.03,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particleSystem = new THREE.Points(geom, mat);
  particleSystem.userData = { origCols, origPositions: sampledPositions.slice() };
  scene.add(particleSystem);
  return particleSystem;
};

const computeGlobalBounds = (a: THREE.Points, b: THREE.Points) => {
  const boxA = new THREE.Box3().setFromBufferAttribute(
    a.geometry.attributes.position as THREE.BufferAttribute,
  );

  const boxB = new THREE.Box3().setFromBufferAttribute(
    b.geometry.attributes.position as THREE.BufferAttribute,
  );

  const globalMinY = Math.min(boxA.min.y, boxB.min.y);
  const globalMaxY = Math.max(boxA.max.y, boxB.max.y);
  const height = globalMaxY - globalMinY;

  a.userData.waveBounds = { globalMinY, height };
  b.userData.waveBounds = { globalMinY, height };
};

export default function Hero() {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 0, 30], fov: 90 }}>
        <Scene />
      </Canvas>
    </div>
  );
}
