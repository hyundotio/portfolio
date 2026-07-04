import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree, extend } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { shaderMaterial } from "@react-three/drei";
import { SceneState } from "@/content/work";
import { sceneColorTokens } from "./themeTokens";

// --- CUSTOM SHADER ---
const SensorConeMaterial = shaderMaterial(
  {
    uColor: new THREE.Color(sceneColorTokens.dark.line),
    uOpacity: 0.0,
  },
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying vec2 vUv;

    void main() {
      float gradient = pow(vUv.y, 1.5);
      gl_FragColor = vec4(uColor, uOpacity * gradient);
    }
  `,
);

extend({ SensorConeMaterial });

type SensorConeShaderMaterial = THREE.ShaderMaterial & {
  uColor: THREE.Color;
  uOpacity: number;
};

interface Props {
  sceneState: SceneState;
  lineColor: string;
  baseColor: string;
  theme: "dark" | "light";
  active?: boolean;
}

export default function HeroOrbit({
  sceneState,
  lineColor,
  baseColor,
  theme,
  active = true,
}: Props) {
  const { camera } = useThree();

  const satGroupRef = useRef<THREE.Group>(null);
  const camRigRef = useRef<THREE.Group>(null);

  const ORBIT_RADIUS = 65;

  const satAngleRef = useRef(0);
  const camAngleRef = useRef(0);
  const speedRef = useRef(0.05);

  const targetCameraPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const earthCenter = new THREE.Vector3(0, -60, 0);

  const clusters = useMemo(() => {
    const items = [];
    const count = 5;
    const separation = (Math.PI * 2) / count;

    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        angleOffset: i * separation,
        yOffset: Math.sin(i * separation * 3) * 10,
      });
    }
    return items;
  }, []);

  useEffect(() => {
    const speedProxy = { val: speedRef.current };

    if (sceneState === "hawkeye-360") {
      gsap.to(speedProxy, {
        val: 0.08,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => {
          speedRef.current = speedProxy.val;
        },
      });
    } else if (sceneState === "kayhan-space") {
      gsap.to(speedProxy, {
        val: 0.25,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => {
          speedRef.current = speedProxy.val;
        },
      });
    } else {
      speedRef.current = 0.05;
    }
  }, [sceneState]);

  useFrame((state, delta) => {
    if (!active || !satGroupRef.current) return;

    satAngleRef.current += speedRef.current * delta;
    satGroupRef.current.rotation.y = satAngleRef.current;

    camAngleRef.current += speedRef.current * 0.85 * delta;

    if (sceneState === "hawkeye-360") {
      const camX =
        Math.sin(camAngleRef.current + Math.PI / 2) * (ORBIT_RADIUS + 90);
      const camZ =
        Math.cos(camAngleRef.current + Math.PI / 2) * (ORBIT_RADIUS + 90);

      targetCameraPos.current.set(camX, -5, camZ);

      const lookX = Math.sin(camAngleRef.current) * ORBIT_RADIUS;
      const lookZ = Math.cos(camAngleRef.current) * ORBIT_RADIUS;
      const lookTarget = new THREE.Vector3(lookX, -15, lookZ).lerp(
        earthCenter,
        0.35,
      );

      camera.position.lerp(targetCameraPos.current, 0.03);
      targetLookAt.current.lerp(lookTarget, 0.03);
      camera.lookAt(targetLookAt.current);
    }
  });

  return (
    <>
      <group ref={satGroupRef}>
        {clusters.map((c) => (
          <SatelliteCluster
            key={c.id}
            radius={ORBIT_RADIUS}
            angle={c.angleOffset}
            y={c.yOffset}
            sceneState={sceneState}
            lineColor={lineColor}
            baseColor={baseColor}
            theme={theme}
            active={active}
          />
        ))}
      </group>
      <group ref={camRigRef} />
    </>
  );
}

function SatelliteCluster({
  radius,
  angle,
  y,
  sceneState,
  lineColor,
  baseColor,
  theme,
  active,
}: {
  radius: number;
  angle: number;
  y: number;
  sceneState: SceneState;
  lineColor: string;
  baseColor: string;
  theme: "dark" | "light";
  active: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;

  useFrame(() => {
    if (active && groupRef.current) {
      groupRef.current.lookAt(0, -60, 0);
    }
  });

  return (
    <group ref={groupRef} position={[x, y, z]}>
      <SatelliteUnit
        position={[-1.8, 0, 0]}
        sceneState={sceneState}
        lineColor={lineColor}
        baseColor={baseColor}
        theme={theme}
      />
      <SatelliteUnit
        position={[1.8, 0, 0]}
        sceneState={sceneState}
        lineColor={lineColor}
        baseColor={baseColor}
        theme={theme}
      />
      <SatelliteUnit
        position={[0, 1.8, -0.5]}
        sceneState={sceneState}
        lineColor={lineColor}
        baseColor={baseColor}
        theme={theme}
      />
    </group>
  );
}

function SatelliteUnit({
  position,
  sceneState,
  lineColor,
  baseColor,
  theme,
}: {
  position: [number, number, number];
  sceneState: SceneState;
  lineColor: string;
  baseColor: string;
  theme: "dark" | "light";
}) {
  const meshRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const resolvedLineColor =
    sceneState === "hawkeye-360"
      ? sceneColorTokens[theme].hawkeyeAccent
      : lineColor;
  const resolvedBaseColor =
    sceneState === "hawkeye-360" ? sceneColorTokens[theme].base : baseColor;
  const beamBlending =
    sceneState === "hawkeye-360" && theme === "light"
      ? THREE.NormalBlending
      : resolvedLineColor === sceneColorTokens.light.line
        ? THREE.NormalBlending
        : THREE.AdditiveBlending;

  useEffect(() => {
    if (!meshRef.current || !beamRef.current) return;
    const beamMat = beamRef.current.material as SensorConeShaderMaterial;
    beamMat.uColor = new THREE.Color(resolvedLineColor);

    if (sceneState === "ibm") {
      gsap.to(meshRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.5 });
      gsap.to(beamMat, { uOpacity: 0, duration: 0.5 });
    } else if (sceneState === "hawkeye-360") {
      gsap.to(meshRef.current.scale, {
        x: 0.6,
        y: 0.6,
        z: 0.6,
        duration: 2,
        ease: "power2.out",
      });
      gsap.to(beamMat, { uOpacity: 0.3, duration: 1 });
    } else if (sceneState === "kayhan-space") {
      gsap.to(meshRef.current.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.5,
        ease: "power2.inOut",
      });
      gsap.to(beamMat, { uOpacity: 0, duration: 0.5 });
    }
  }, [resolvedLineColor, sceneState]);

  const wfMaterial = (
    <meshStandardMaterial
      wireframe={true}
      color={resolvedBaseColor}
      emissive={resolvedLineColor}
      emissiveIntensity={1}
    />
  );

  return (
    <group ref={meshRef} position={position}>
      <group>
        <mesh>
          <boxGeometry args={[1.5, 1.5, 2]} />
          {wfMaterial}
        </mesh>
        <mesh position={[2, 0, 0]}>
          <boxGeometry args={[2.5, 0.1, 1.2]} />
          {wfMaterial}
        </mesh>
        <mesh position={[-2, 0, 0]}>
          <boxGeometry args={[2.5, 0.1, 1.2]} />
          {wfMaterial}
        </mesh>
      </group>

      <mesh ref={beamRef} position={[0, 0, 20]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0, 25, 40, 64, 1, true]} />
        {/* @ts-expect-error custom shader material registered with extend */}
        <sensorConeMaterial
          transparent
          side={THREE.FrontSide}
          depthWrite={false}
          blending={beamBlending}
        />
      </mesh>
    </group>
  );
}
