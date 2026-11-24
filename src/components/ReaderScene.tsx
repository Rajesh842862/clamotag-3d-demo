import { Suspense, useEffect, useMemo, useRef, type ComponentRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
  Preload,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import { MODEL_URL } from "../lib/data";
import type { Employee, LedState, ScanState, Theme } from "../lib/types";
import { ModelLoadBoundary } from "./ModelLoadBoundary";
import { RfidCard } from "./RfidCard";

export interface ViewerApi {
  reset: () => void;
  zoom: (amount: number) => void;
}

interface ReaderSceneProps {
  employee: Employee;
  leds: LedState;
  scan: ScanState;
  theme: Theme;
  rotationEnabled: boolean;
  reducedMotion: boolean;
  apiRef: RefObject<ViewerApi | null>;
  modelAttempt: number;
  onModelReady: () => void;
  onModelError: () => void;
}

const LED_MESH_NAMES: Record<keyof LedState, string> = {
  wifi: "LED_WiFi_Connected",
  ap: "LED_AP_Mode",
  sync: "LED_Data_Sync",
  card: "LED_Card_Accessed",
};

// The model still contains a physical "no Wi-Fi" lamp. It is no longer part of
// the simulation, so keep it permanently dark instead of driving it from state.
const RETIRED_LED_MESH = "LED_No_WiFi";

const DEFAULT_CAMERA = new THREE.Vector3(1.75, 0.75, 3.65);
const LIGHT_CAMERA = new THREE.Vector3(1.55, 0.62, 3.35);
const DEFAULT_TARGET = new THREE.Vector3(0, 0.1, 0);
const LIGHT_TARGET = new THREE.Vector3(0, 0.06, 0);

function RfidHardware({
  leds,
  scan,
  theme,
  reducedMotion,
}: Pick<ReaderSceneProps, "leds" | "scan" | "theme" | "reducedMotion">) {
  const dark = theme === "dark";
  const { scene } = useGLTF(MODEL_URL);
  const glowRef = useRef<THREE.PointLight>(null);
  const pulse = useRef(0);

  const { model, baseColors } = useMemo(() => {
    const source = scene.getObjectByName("CLAMOTAG_RFID_Root") ?? scene;
    const clone = source.clone(true);
    const bases = new Map<keyof LedState, THREE.Color>();
    const ledEntries = Object.entries(LED_MESH_NAMES) as [keyof LedState, string][];

    clone.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        const material = object.material;
        const cloned = Array.isArray(material)
          ? material.map((entry) => entry.clone())
          : material.clone();
        object.material = cloned;
        if (object.name === RETIRED_LED_MESH && cloned instanceof THREE.MeshStandardMaterial) {
          cloned.color.multiplyScalar(0.16);
          cloned.emissive.setHex(0x000000);
          cloned.emissiveIntensity = 0;
        }
        const key = ledEntries.find(([, name]) => name === object.name)?.[0];
        if (key && cloned instanceof THREE.MeshStandardMaterial) {
          bases.set(key, cloned.color.clone());
        }
      }
    });

    return { model: clone, baseColors: bases };
  }, [scene]);

  useEffect(() => {
    const apply = (key: keyof LedState, color: number, active: boolean) => {
      const found = model.getObjectByName(LED_MESH_NAMES[key]);
      const material = found instanceof THREE.Mesh ? found.material : null;
      if (!(material instanceof THREE.MeshStandardMaterial)) return;
      const base = baseColors.get(key);
      if (active) {
        material.color.set(color);
        material.emissive.set(color);
        material.emissiveIntensity = 1.5;
      } else if (base) {
        material.color.copy(base).multiplyScalar(0.16);
        material.emissive.setHex(0x000000);
        material.emissiveIntensity = 0;
      }
    };

    apply("wifi", 0x67e8f9, leds.wifi);
    apply("ap", 0xa78bfa, leds.ap);
    apply("sync", 0xffa53d, leds.sync);

    const cardColor =
      scan.result === "denied" ? 0xff4d5e : scan.result === "buffered" ? 0xffa53d : 0x4ade80;
    apply("card", cardColor, leds.card);
  }, [baseColors, leds, model, scan.result]);

  useFrame((state, delta) => {
    const target = scan.phase === "reading" ? 1 : leds.sync ? 0.38 : 0;
    pulse.current = THREE.MathUtils.damp(pulse.current, target, 6, delta);

    const found = model.getObjectByName(LED_MESH_NAMES.card);
    const cardMaterial = found instanceof THREE.Mesh ? found.material : null;
    if (cardMaterial instanceof THREE.MeshStandardMaterial && leds.card) {
      const wave = reducedMotion ? 1 : 0.72 + 0.28 * Math.sin(state.clock.elapsedTime * 9);
      cardMaterial.emissiveIntensity = 1.25 * wave + pulse.current * 1.4;
    }

    if (leds.ap && leds.wifi) {
      const wifiFound = model.getObjectByName(LED_MESH_NAMES.wifi);
      const wifiMaterial = wifiFound instanceof THREE.Mesh ? wifiFound.material : null;
      if (wifiMaterial instanceof THREE.MeshStandardMaterial) {
        // Smooth ON/OFF cycle driven by the render loop. It runs only while the
        // three-second blink window is active and stops with it.
        const blink = reducedMotion ? 1 : 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * Math.PI * 2);
        wifiMaterial.emissiveIntensity = 0.12 + blink * 1.9;
      }
    }

    if (glowRef.current) {
      const color =
        scan.result === "denied" ? 0xff4d5e : scan.result === "buffered" ? 0xffa53d : 0x5eead4;
      glowRef.current.color.setHex(color);
      const flicker = reducedMotion ? 1 : 0.85 + 0.15 * Math.sin(state.clock.elapsedTime * 8);
      glowRef.current.intensity = pulse.current * 1.9 * flicker;
    }
  });

  return (
    <group
      scale={dark ? 9.5 : 10.4}
      position={dark ? [0, 0.42, 0] : [0, 0.34, 0]}
      rotation={[0, -0.16, 0]}
    >
      <primitive object={model} />
      <pointLight ref={glowRef} position={[0, -0.025, 0.022]} distance={0.34} decay={2} intensity={0} />
    </group>
  );
}

function CameraRig({
  apiRef,
  rotationEnabled,
  theme,
}: Pick<ReaderSceneProps, "apiRef" | "rotationEnabled" | "theme">) {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  const camera = useThree((state) => state.camera);
  const homeCamera = theme === "dark" ? DEFAULT_CAMERA : LIGHT_CAMERA;
  const homeTarget = theme === "dark" ? DEFAULT_TARGET : LIGHT_TARGET;

  useEffect(() => {
    apiRef.current = {
      reset: () => {
        camera.position.copy(homeCamera);
        controlsRef.current?.target.copy(homeTarget);
        controlsRef.current?.update();
      },
      zoom: (amount: number) => {
        const target = controlsRef.current?.target ?? homeTarget;
        const offset = camera.position.clone().sub(target);
        const distance = THREE.MathUtils.clamp(offset.length() + amount, 2.4, 7.5);
        camera.position.copy(target).add(offset.normalize().multiplyScalar(distance));
        controlsRef.current?.update();
      },
    };
  }, [apiRef, camera, homeCamera, homeTarget]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enablePan={false}
      target={homeTarget}
      minDistance={2.4}
      maxDistance={7.5}
      minPolarAngle={0.35}
      maxPolarAngle={Math.PI / 2 - 0.04}
      autoRotate={rotationEnabled}
      autoRotateSpeed={0.5}
    />
  );
}

/** Suspends with the model, then reports the first frame where it can be drawn. */
function ModelReadySignal({ onReady }: { onReady: () => void }) {
  useGLTF(MODEL_URL);

  useEffect(() => {
    const frame = requestAnimationFrame(onReady);
    return () => cancelAnimationFrame(frame);
  }, [onReady]);

  return null;
}

export default function ReaderScene({
  employee,
  leds,
  scan,
  theme,
  rotationEnabled,
  reducedMotion,
  apiRef,
  modelAttempt,
  onModelReady,
  onModelError,
}: ReaderSceneProps) {
  const dark = theme === "dark";

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.75]}
      camera={{ position: dark ? [1.75, 0.75, 3.65] : [1.55, 0.62, 3.35], fov: 40, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={dark ? 0.55 : 1} />
      <directionalLight position={[3.5, 5, 4]} intensity={dark ? 2.2 : 2.4} />
      <directionalLight
        position={[-4, 1.5, 2.5]}
        intensity={dark ? 0.9 : 1.05}
        color={dark ? "#8fc8ff" : "#dceaff"}
      />
      <directionalLight position={[0, 2, -4]} intensity={1.15} />

      <Environment resolution={128}>
        {dark ? <color attach="background" args={["#0a1220"]} /> : null}
        <Lightformer
          form="rect"
          intensity={dark ? 2.6 : 1.8}
          position={[0, 3.5, 2]}
          scale={[7, 2.5, 1]}
          color="#ffffff"
        />
        <Lightformer
          form="rect"
          intensity={1.4}
          position={[-3, 1, 1]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[4, 2.5, 1]}
          color={dark ? "#7fc9ff" : "#cfe4ff"}
        />
        <Lightformer form="ring" intensity={1} position={[2.5, 1, -2]} scale={2.4} color="#ffffff" />
      </Environment>

      <ContactShadows
        position={[0, -1.03, 0]}
        opacity={dark ? 0.5 : 0.24}
        scale={5.5}
        blur={2.6}
        far={3.2}
        resolution={256}
        color={dark ? "#000814" : "#173a5e"}
      />

      <Suspense fallback={null}>
        <ModelLoadBoundary key={modelAttempt} onError={onModelError}>
          <RfidHardware leds={leds} scan={scan} theme={theme} reducedMotion={reducedMotion} />
          <ModelReadySignal onReady={onModelReady} />
        </ModelLoadBoundary>
        <RfidCard employee={employee} scan={scan} theme={theme} reducedMotion={reducedMotion} />
        <Preload all />
      </Suspense>

      <CameraRig apiRef={apiRef} rotationEnabled={rotationEnabled && !reducedMotion} theme={theme} />
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
