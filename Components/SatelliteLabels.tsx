"use client";

import { ComponentRef, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";
import { odCanvasColorFallbacks, odColorTokens } from "./themeTokens";
import { deterministicRandom } from "./deterministicRandom";

const WF_COLOR = odCanvasColorFallbacks.accent;

const LABELS = [
  "Orbit maintenance",
  "Collision avoidance",
  "Uplink",
  "Downlink",
  "RPO",
];

// Data structure for a single tracked satellite
type TrackedSat = {
  id: number;
  text: string;
  // Orbital parameters (same math as KeplerianSystem)
  radius: number;
  speed: number;
  inclination: number;
  theta: number;
  axis: THREE.Vector3;
  // Offset for the label relative to the sat
  labelOffset: THREE.Vector3;
};

export default function SatelliteLabels({ count = 12 }: { count?: number }) {
  // 1. Generate initial data for tracked satellites
  const trackedSats = useMemo(() => {
    const data: TrackedSat[] = [];
    for (let i = 0; i < count; i++) {
      // Similar orbital range to KeplerianSystem (70-85) to blend in
      const radius = 70 + deterministicRandom(i + 1) * 15;
      // Slightly slower speed for readability
      const speed = 0.01 + deterministicRandom(i + 2) * 0.03;
      const inclination = (deterministicRandom(i + 3) - 0.5) * Math.PI * 2;
      const theta = deterministicRandom(i + 4) * Math.PI * 2;
      const axis = new THREE.Vector3(
        deterministicRandom(i + 5) - 0.5,
        deterministicRandom(i + 6) - 0.5,
        deterministicRandom(i + 7) - 0.5,
      ).normalize();

      // Pick a random label text
      const text =
        LABELS[Math.floor(deterministicRandom(i + 8) * LABELS.length)];

      // Random offset for the label so they don't all look uniform
      // Place it generally "up and to the right/left" relative to camera view
      const xOff =
        (deterministicRandom(i + 9) > 0.5 ? 1 : -1) *
        (4 + deterministicRandom(i + 10) * 4);
      const yOff = 4 + deterministicRandom(i + 11) * 4;
      const labelOffset = new THREE.Vector3(xOff, yOff, 0);

      data.push({
        id: i,
        text,
        radius,
        speed,
        inclination,
        theta,
        axis,
        labelOffset,
      });
    }
    return data;
  }, [count]);

  return (
    <group>
      {trackedSats.map((sat) => (
        <LabelUnit key={sat.id} data={sat} />
      ))}
    </group>
  );
}

// --- SUB-COMPONENT Managing one Satellite/Label Pair ---
function LabelUnit({ data }: { data: TrackedSat }) {
  // Refs for direct manipulation in loop
  const groupRef = useRef<THREE.Group>(null); // Moves the HTML label
  const lineRef = useRef<ComponentRef<typeof Line>>(null); // Updates the connector line
  const dotRef = useRef<THREE.Mesh>(null);

  // Mutable state for orbital calculation
  const thetaRef = useRef(data.theta);
  const currentSatPos = useRef(new THREE.Vector3());
  const currentLabelPos = useRef(new THREE.Vector3());

  // Animation Loop
  useFrame((state, delta) => {
    if (!groupRef.current || !lineRef.current || !dotRef.current) return;

    // 1. Calculate new Satellite Position (Keplerian math)
    thetaRef.current += data.speed * delta;
    const x = Math.cos(thetaRef.current) * data.radius;
    const z = Math.sin(thetaRef.current) * data.radius;

    currentSatPos.current.set(x, 0, z);
    currentSatPos.current.applyAxisAngle(data.axis, data.inclination);

    // 2. Calculate Label position based on offset
    // We want the offset to be somewhat related to the camera view so labels don't clip inside the globe easily.
    // A simple approach is to just add the offset in world space.
    currentLabelPos.current.copy(currentSatPos.current).add(data.labelOffset);

    // 3. Update HTML container position
    groupRef.current.position.copy(currentLabelPos.current);
    dotRef.current.position.copy(currentSatPos.current);

    // 4. Update Connector Line Geometry
    // The Line component from drei accepts a flat array of coordinates via ref
    const positionAttribute = lineRef.current.geometry.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    const points = positionAttribute.array;
    // Point 0: Satellite
    points[0] = currentSatPos.current.x;
    points[1] = currentSatPos.current.y;
    points[2] = currentSatPos.current.z;
    // Point 1: Label
    points[3] = currentLabelPos.current.x;
    points[4] = currentLabelPos.current.y;
    points[5] = currentLabelPos.current.z;
    positionAttribute.needsUpdate = true;
  });

  return (
    <>
      {/* The HTML Label Container */}
      <group ref={groupRef}>
        <Html center distanceFactor={150}>
          <div
            className="type-label"
            style={{
              backgroundColor: odColorTokens.overlay,
              color: odColorTokens.text,
              padding: "4px 8px",
              borderRadius: "4px",
              border: `1px solid ${WF_COLOR}`,
              whiteSpace: "nowrap",
              boxShadow: `0 0 10px ${WF_COLOR}aa`,
            }}
          >
            {data.text}
          </div>
        </Html>
      </group>

      {/* The Connector Line */}
      <Line
        ref={lineRef}
        points={[
          [0, 0, 0],
          [0, 0, 0],
        ]} // Initial points, updated in useFrame
        color={WF_COLOR}
        lineWidth={1}
        transparent
        opacity={0.6}
      />

      {/* Optional: A small visual dot for the tracked satellite itself */}
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshBasicMaterial color={WF_COLOR} />
      </mesh>
    </>
  );
}
