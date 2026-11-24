import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { LOGO_DARK } from "../lib/data";
import {
  CARD_ENTRY,
  CARD_GEOMETRY,
  RIPPLE_ORIGIN,
  RIPPLE_ROTATION,
  cardArtSize,
  cardTransformForPhase,
  rippleColorForResult,
} from "../lib/rfidCard";
import { drawCardBack, drawCardFront } from "../lib/rfidCardArt";
import type { Employee, ScanState, Theme } from "../lib/types";

interface RfidCardProps {
  employee: Employee;
  scan: ScanState;
  theme: Theme;
  reducedMotion: boolean;
}

const RIPPLE_SIZE = 1;
const HIDE_DELAY = 0.62;

const RIPPLE_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RIPPLE_FRAGMENT = `
  uniform float uTime;
  uniform float uStrength;
  uniform vec3 uColor;
  uniform vec3 uResultColor;
  uniform float uResultMix;
  varying vec2 vUv;

  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float radius = length(p);
    float rings = 0.0;

    for (int index = 0; index < 4; index++) {
      float staggered = float(index) * 0.25;
      float phase = fract(uTime * 0.95 + staggered);
      float ringRadius = 0.10 + phase * 0.88;
      float ringWidth = 0.038 + phase * 0.045;
      float ring = smoothstep(ringWidth, 0.0, abs(radius - ringRadius));
      rings += ring * pow(1.0 - phase, 2.1);
    }

    float pulse = 0.5 + 0.5 * sin(uTime * 10.0);
    float core = smoothstep(0.22, 0.0, radius) * (0.16 + 0.16 * pulse);
    float edgeFade = 1.0 - smoothstep(0.9, 1.2, radius);
    vec3 color = mix(uColor, uResultColor, uResultMix);
    float alpha = (rings * 0.95 + core * 0.38) * uStrength * edgeFade;
    gl_FragColor = vec4(color, alpha);
  }
`;

function createCardGeometry() {
  const { width, height, depth, radius } = CARD_GEOMETRY;
  const bevel = Math.min(depth * 0.22, 0.0028);
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;

  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(depth - bevel * 2, 0.001),
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: bevel,
    bevelThickness: bevel,
    curveSegments: 14,
    steps: 1,
  });
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

function createCanvasTexture(canvas: HTMLCanvasElement, anisotropy: number) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function RfidRipple({
  scan,
  theme,
  reducedMotion,
}: Pick<RfidCardProps, "scan" | "theme" | "reducedMotion">) {
  const meshRef = useRef<THREE.Mesh>(null);
  const strength = useRef(0);
  const resultMix = useRef(0);
  const time = useRef(0);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uStrength: { value: 0 },
        uColor: { value: new THREE.Color(rippleColorForResult(null, theme)) },
        uResultColor: { value: new THREE.Color(rippleColorForResult(null, theme)) },
        uResultMix: { value: 0 },
      },
      vertexShader: RIPPLE_VERTEX,
      fragmentShader: RIPPLE_FRAGMENT,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: theme === "dark" ? THREE.AdditiveBlending : THREE.NormalBlending,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
  }, [theme]);

  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, delta) => {
    const active = scan.phase !== "idle";
    const targetStrength = reducedMotion
      ? active
        ? 0.55
        : 0
      : scan.phase === "approaching"
        ? 0.34
        : scan.phase === "reading"
          ? 1
          : scan.phase === "result"
            ? 0.72
            : 0;

    strength.current = THREE.MathUtils.damp(strength.current, targetStrength, active ? 5.5 : 7, delta);
    resultMix.current = THREE.MathUtils.damp(resultMix.current, scan.result ? 1 : 0, 9, delta);
    if (!reducedMotion && active) time.current += delta;

    material.uniforms.uTime.value = time.current;
    material.uniforms.uStrength.value = strength.current;
    material.uniforms.uColor.value.set(rippleColorForResult(null, theme));
    material.uniforms.uResultColor.value.set(rippleColorForResult(scan.result, theme));
    material.uniforms.uResultMix.value = resultMix.current;

    if (meshRef.current) meshRef.current.visible = strength.current > 0.004;
  });

  return (
    <mesh
      ref={meshRef}
      position={RIPPLE_ORIGIN[theme]}
      rotation={RIPPLE_ROTATION}
      material={material}
    >
      <planeGeometry args={[RIPPLE_SIZE, RIPPLE_SIZE]} />
    </mesh>
  );
}

export function RfidCard({ employee, scan, theme, reducedMotion }: RfidCardProps) {
  const logoTexture = useLoader(THREE.TextureLoader, LOGO_DARK);
  const gl = useThree((state) => state.gl);
  const groupRef = useRef<THREE.Group>(null);
  const idleSince = useRef<number | null>(null);
  const initialTheme = useRef(theme);
  const [fontEpoch, setFontEpoch] = useState(0);

  const geometry = useMemo(() => createCardGeometry(), []);
  const start = useMemo(() => CARD_ENTRY[initialTheme.current], []);

  useEffect(() => {
    let alive = true;
    const fonts = document.fonts;
    if (!fonts) return;
    Promise.all([
      fonts.load('600 72px "Space Grotesk"'),
      fonts.load('500 17px "Inter"'),
    ])
      .then(() => {
        if (alive) setFontEpoch(1);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const textures = useMemo(() => {
    const { width, height } = cardArtSize();
    const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    const logo = logoTexture.image as HTMLImageElement;

    const frontCanvas = document.createElement("canvas");
    frontCanvas.width = width;
    frontCanvas.height = height;
    const frontContext = frontCanvas.getContext("2d");
    if (frontContext) drawCardFront(frontContext, width, height, employee, logo);

    const backCanvas = document.createElement("canvas");
    backCanvas.width = width;
    backCanvas.height = height;
    const backContext = backCanvas.getContext("2d");
    if (backContext) drawCardBack(backContext, width, height, employee, logo);

    return {
      front: createCanvasTexture(frontCanvas, anisotropy),
      back: createCanvasTexture(backCanvas, anisotropy),
    };
  }, [employee, gl, logoTexture, fontEpoch]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(
    () => () => {
      textures.front.dispose();
      textures.back.dispose();
    },
    [textures],
  );

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.position.fromArray(start.position);
    group.rotation.fromArray(start.rotation);
    group.visible = false;
  }, [start]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const active = scan.phase !== "idle";
    const now = state.clock.elapsedTime;

    if (active) {
      if (!group.visible) {
        group.position.fromArray(start.position);
        group.rotation.fromArray(start.rotation);
        group.visible = true;
      }
      idleSince.current = null;
    } else {
      if (!group.visible) return;
      if (idleSince.current === null) idleSince.current = now;
      if (now - idleSince.current > (reducedMotion ? 0 : HIDE_DELAY)) {
        group.visible = false;
        return;
      }
    }

    const target = cardTransformForPhase(reducedMotion ? "reading" : scan.phase, theme);
    const lambda = reducedMotion
      ? 50
      : scan.phase === "approaching"
        ? 9
        : scan.phase === "reading"
          ? 7
          : scan.phase === "result"
            ? 5.5
            : 5;
    const wobbleY = !reducedMotion && scan.phase === "approaching" ? Math.sin(now * 8.5) * 0.004 : 0;
    const wobbleZ = !reducedMotion && scan.phase === "reading" ? Math.sin(now * 6.2) * 0.006 : 0;

    group.position.x = THREE.MathUtils.damp(group.position.x, target.position[0], lambda, delta);
    group.position.y = THREE.MathUtils.damp(group.position.y, target.position[1] + wobbleY, lambda, delta);
    group.position.z = THREE.MathUtils.damp(group.position.z, target.position[2], lambda, delta);
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, target.rotation[0], lambda, delta);
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, target.rotation[1], lambda, delta);
    group.rotation.z = THREE.MathUtils.damp(group.rotation.z, target.rotation[2] + wobbleZ, lambda, delta);
  });

  const artOffset = CARD_GEOMETRY.depth / 2 + 0.0008;

  return (
    <>
      <group ref={groupRef}>
        <mesh geometry={geometry} castShadow receiveShadow>
          <meshPhysicalMaterial
            attach="material-0"
            color="#f7fafc"
            roughness={0.3}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.1}
            envMapIntensity={1.25}
          />
          <meshPhysicalMaterial
            attach="material-1"
            color="#e2ebf2"
            roughness={0.44}
            metalness={0}
            clearcoat={0.55}
            clearcoatRoughness={0.24}
            envMapIntensity={0.9}
          />
        </mesh>

        <mesh position={[0, 0, artOffset]}>
          <planeGeometry args={[CARD_GEOMETRY.width, CARD_GEOMETRY.height]} />
          <meshBasicMaterial map={textures.front} alphaTest={0.35} toneMapped={false} />
        </mesh>

        <mesh position={[0, 0, -artOffset]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[CARD_GEOMETRY.width, CARD_GEOMETRY.height]} />
          <meshBasicMaterial map={textures.back} alphaTest={0.35} toneMapped={false} />
        </mesh>
      </group>

      <RfidRipple theme={theme} scan={scan} reducedMotion={reducedMotion} />
    </>
  );
}
