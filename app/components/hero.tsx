'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { useUI } from '@components/ui-provider';

const vertexShader = `
  uniform float time;
  uniform float progress;
  uniform float direction;
  uniform float width;
  uniform float height;

  attribute float size;
  attribute float baseAngle;
  attribute float radius;
  attribute float speed;

  varying vec3 vColor;
  varying float vParticleY;

  void main() {
    // Pass values to fragment shader
    vColor = color;
    vParticleY = position.y;
    
    // Update position based on animation progress
    float cx = position.x * (1.0 - progress); 
    float cy = position.y + direction * height * progress;
    float cz = position.z * (1.0 - progress); 

    float angle = baseAngle - speed * time * progress;
    float circleX = cos(angle) * radius * width * progress;
    float circleY = sin(angle) * radius * width * progress;

    float tilt = 3.14159265359 / 2.1;
    float rotatedY = cy + circleY * cos(tilt);
    float rotatedZ = cz + circleY * sin(tilt);
    vec3 finalPosition = vec3(cx + circleX, rotatedY, rotatedZ);

    // Slight wave effect
    finalPosition.z += sin(time + finalPosition.x * 3.0) * 0.1 * (1.0 - progress);
    
    gl_PointSize = size;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPosition, 1.0);
  }
`;

const fragmentShader = `
  uniform float time;
  uniform float waveHeight;
  uniform float waveSpeed;
  uniform float bandWidth;
  uniform float bandCount;
  uniform float glowStrength;
  uniform float loadProgress;

  varying vec3 vColor;
  varying float vParticleY;
  
  void main() {
    vec4 color = vec4(vColor, 1.0);
    color.a = loadProgress * loadProgress;

    float glow = 0.0;
    float bandOffset, dist, bandGlow;

    for (int b = 0; b < int(bandCount); b++) {
      bandOffset = (float(b) / bandCount) * waveHeight;
      float raw = vParticleY - bandOffset + time * waveSpeed * waveHeight;
      float wrapped = mod(raw, waveHeight);
      if (wrapped < 0.0) {
        wrapped += waveHeight;
      }
      dist = wrapped / bandWidth;

      if (dist <= 1.0) {
        float fadeDist = (dist - 0.05) / (1.0 - 0.05);
        bandGlow = (1.0 - fadeDist) * (1.0 - fadeDist);
      } else {
        bandGlow = 0.0;
      }
      glow += bandGlow;
    }
    glow = min(glow, 1.0);

    color.rgb *= (0.5 + glow * glowStrength);
    gl_FragColor = color;
  }
`;

interface ShaderPoints extends THREE.Points {
  material: THREE.ShaderMaterial & {
    uniforms?: {
      time: { value: number };
      progress: { value: number };
      loadProgress: { value: number };
      direction: { value: number };
      width: { value: number };
      height: { value: number };
      waveHeight: { value: number };
      waveSpeed: { value: number };
      bandCount: { value: number };
      bandWidth: { value: number };
      glowStrength: { value: number };
    };
  };
}

const generateParticleText = (
  text: string,
  font: Font,
  palette: THREE.Color[],
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

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      progress: { value: 0 },
      loadProgress: { value: 0 },
      direction: { value: positionY > 0 ? 1 : -1 },
      width: { value: 0 },
      height: { value: window.innerHeight },
      waveHeight: { value: 11 },
      waveSpeed: { value: 0.07 },
      bandCount: { value: 3 },
      bandWidth: { value: 3.5 },
      glowStrength: { value: 3 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particleSystem = new THREE.Points(geom, mat);
  particleSystem.userData = { origPositions: sampledPositions.slice() };
  return particleSystem as ShaderPoints;
};

function Particles() {
  const { scene, camera, invalidate } = useThree();
  const firstNameRef = useRef<ShaderPoints | null>(null);
  const lastNameRef = useRef<ShaderPoints | null>(null);
  const scrollProgress = useRef(0);
  const loadProgress = useRef(0);
  const [particleSystem, setParticleSystem] = useState<ShaderPoints[] | null>();
  const targetZ = useRef<number>(30);

  useEffect(() => {
    const loader = new FontLoader();
    loader.load('/fonts/jetbrains_mono_medium_regular.json', function (font) {
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
      firstNameRef.current = generateParticleText('Gabriel', font, paletteBlue, count, 3);
      lastNameRef.current = generateParticleText('Santos', font, paletteGreen, count, -3, -2);
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
    const onScroll = () => {
      const triggerHeight = window.innerHeight / 2;
      const progress = Math.min(Math.max(window.scrollY / triggerHeight, 0), 2);

      if (scrollProgress.current === 2 && progress < 2) invalidate();
      scrollProgress.current = progress;
    };
    window.addEventListener('scroll', onScroll);

    let resizeTimeout: NodeJS.Timeout;
    const adjustCamera = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);

      resizeTimeout = setTimeout(() => {
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
        if (firstNameRef.current && lastNameRef.current) {
          [firstNameRef.current, lastNameRef.current].forEach((sys) => {
            sys.material.uniforms.width.value = Math.max(50 * cam.aspect, 100);
            sys.material.uniforms.height.value = Math.max(20 / cam.aspect, 30);
          });
        }
        targetZ.current = Math.max(requiredZ + 5, 20);
      }, 200);
    };
    window.addEventListener('resize', adjustCamera);
    adjustCamera();

    const start = performance.now();
    const duration = 2000;

    const animate = (time: number) => {
      const elapsed = time - start;
      const p = Math.min(elapsed / duration, 1);
      loadProgress.current = p;
      if (p < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', adjustCamera);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [particleSystem]);

  useFrame((state) => {
    if (
      !particleSystem ||
      scrollProgress.current >= 2 ||
      !firstNameRef.current ||
      !lastNameRef.current
    )
      return;

    const t = state.clock.getElapsedTime();
    const targetProgress = Math.min(Math.max(1 - loadProgress.current, scrollProgress.current), 1);
    const easedProgress =
      targetProgress < 0.5
        ? Math.pow(targetProgress * 2, 5) / 2
        : 1 - Math.pow((1 - targetProgress) * 2, 2) / 2;

    [firstNameRef.current, lastNameRef.current].forEach((sys) => {
      sys.material.uniforms.time.value = t;
      sys.material.uniforms.progress.value = easedProgress;
      sys.material.uniforms.loadProgress.value = loadProgress.current;
    });

    const newZ = camera.position.z + (targetZ.current - camera.position.z) * 0.1;
    camera.position.set(camera.position.x, camera.position.y, newZ);
    invalidate();
  });

  return <>{particleSystem?.map((obj, i) => obj && <primitive key={i} object={obj} />)}</>;
}

export default function Hero() {
  const { animationsEnabled } = useUI();

  if (!animationsEnabled) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center z-1">
        <h1
          className="text-7xl md:text-9xl text-white font-bold"
          style={{
            textShadow: '0 0 24px darkturquoise',
          }}
        >
          Gabriel
        </h1>
        <h1
          className="text-7xl md:text-9xl text-white font-bold"
          style={{
            textShadow: '0 0 24px mediumseagreen',
          }}
        >
          Santos
        </h1>
      </div>
    );
  }

  return (
    <Canvas camera={{ position: [0, 0, 0], fov: 90 }} frameloop="demand">
      <ambientLight />
      <Particles />
      <EffectComposer>
        <Bloom intensity={0.5} luminanceThreshold={0.5} luminanceSmoothing={0.9} radius={0.4} />
      </EffectComposer>
    </Canvas>
  );
}
