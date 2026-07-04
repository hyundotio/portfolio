"use client";

import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { SceneState } from "@/content/work";
import { sceneColorTokens } from "./themeTokens";
import { deterministicRandom } from "./deterministicRandom";

const SATELLITE_COUNT = 5000;

interface Props {
  sceneState: SceneState;
  color: string;
  theme: "dark" | "light";
  active?: boolean;
}

type OrbitData = {
  a: number;
  e: number;
  inclination: number;
  axis: THREE.Vector3;
  theta: number;
  speed: number;
  highlight: boolean;
};

function getOrbitPosition(
  angle: number,
  orbit: OrbitData,
  target: THREE.Vector3,
) {
  const r =
    (orbit.a * (1 - orbit.e * orbit.e)) / (1 + orbit.e * Math.cos(angle));
  const x = r * Math.cos(angle);
  const z = r * Math.sin(angle);
  target.set(x, 0, z);
  target.applyAxisAngle(orbit.axis, orbit.inclination);
}

export default function KeplerianSystem({
  sceneState,
  color,
  theme,
  active = true,
}: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const highlightMeshRef = useRef<THREE.InstancedMesh>(null);
  const dotMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const highlightMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const speedFactor = useRef(1);

  const { normalOrbits, highlightOrbits } = useMemo(() => {
    const normal: OrbitData[] = [];
    const highlight: OrbitData[] = [];

    for (let i = 0; i < SATELLITE_COUNT; i++) {
      const orbit: OrbitData = {
        a: 70 + deterministicRandom(i + 1) * 30,
        e: Math.pow(deterministicRandom(i + 2), 3) * 0.7,
        inclination: (deterministicRandom(i + 3) - 0.5) * Math.PI * 2,
        axis: new THREE.Vector3(
          deterministicRandom(i + 4) - 0.5,
          deterministicRandom(i + 5) - 0.5,
          deterministicRandom(i + 6) - 0.5,
        ).normalize(),
        theta: deterministicRandom(i + 7) * Math.PI * 2,
        speed: 0.02 + deterministicRandom(i + 8) * 0.05,
        highlight: deterministicRandom(i + 9) > 0.88,
      };

      if (orbit.highlight) {
        highlight.push(orbit);
      } else {
        normal.push(orbit);
      }
    }

    return { normalOrbits: normal, highlightOrbits: highlight };
  }, []);

  const defaultColor =
    sceneState === "kayhan-space" ? sceneColorTokens[theme].kayhanOrbit : color;
  const purpleColor = sceneColorTokens[theme].kayhanHighlight;

  useEffect(() => {
    if (
      !meshRef.current ||
      !highlightMeshRef.current ||
      !dotMaterialRef.current ||
      !highlightMaterialRef.current
    ) {
      return;
    }

    if (sceneState === "ibm" || sceneState === "hawkeye-360") {
      meshRef.current.visible = false;
      highlightMeshRef.current.visible = false;
      return;
    }

    if (sceneState === "kayhan-space") {
      meshRef.current.visible = true;
      highlightMeshRef.current.visible = true;
      speedFactor.current = 1.0;
      gsap.to(dotMaterialRef.current, { opacity: 0.55, duration: 1.5 });
      gsap.to(highlightMaterialRef.current, { opacity: 0.78, duration: 1.5 });
    }
  }, [sceneState]);

  useEffect(() => {
    if (sceneState !== "kayhan-space") {
      return;
    }

    if (meshRef.current) {
      meshRef.current.visible = active;
    }

    if (highlightMeshRef.current) {
      highlightMeshRef.current.visible = active;
    }
  }, [active, sceneState]);

  useFrame((state, delta) => {
    if (
      !active ||
      !meshRef.current ||
      !highlightMeshRef.current ||
      !meshRef.current.visible
    ) {
      return;
    }

    const dummy = new THREE.Object3D();
    const pos = new THREE.Vector3();

    normalOrbits.forEach((orbit, i) => {
      const cosTheta = Math.cos(orbit.theta);
      const r = (orbit.a * (1 - orbit.e * orbit.e)) / (1 + orbit.e * cosTheta);
      const v = orbit.speed * (orbit.a / r) * (orbit.a / r);

      orbit.theta += v * delta * speedFactor.current;
      getOrbitPosition(orbit.theta, orbit, pos);

      dummy.position.copy(pos);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    highlightOrbits.forEach((orbit, i) => {
      const cosTheta = Math.cos(orbit.theta);
      const r = (orbit.a * (1 - orbit.e * orbit.e)) / (1 + orbit.e * cosTheta);
      const v = orbit.speed * (orbit.a / r) * (orbit.a / r);

      orbit.theta += v * delta * speedFactor.current;
      getOrbitPosition(orbit.theta, orbit, pos);

      dummy.position.copy(pos);
      dummy.updateMatrix();
      highlightMeshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    highlightMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, normalOrbits.length]}
      >
        <boxGeometry args={[0.25, 0.25, 0.25]} />
        <meshBasicMaterial
          ref={dotMaterialRef}
          color={defaultColor}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </instancedMesh>
      <instancedMesh
        ref={highlightMeshRef}
        args={[undefined, undefined, highlightOrbits.length]}
      >
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshBasicMaterial
          ref={highlightMaterialRef}
          color={purpleColor}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </instancedMesh>
    </>
  );
}
