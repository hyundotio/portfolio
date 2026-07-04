import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function QuantumComputer({
  lineColor,
  baseColor,
}: {
  lineColor: string;
  baseColor: string;
}) {
  const innerRef = useRef<THREE.Group>(null);

  const wireframeMat = (
    <meshStandardMaterial
      wireframe={true}
      color={baseColor}
      emissive={lineColor}
      emissiveIntensity={1}
    />
  );

  useFrame((state) => {
    if (innerRef.current) {
      const t = state.clock.getElapsedTime();
      // Gentle float & rotate
      innerRef.current.rotation.y = Math.sin(t * 0.1) * 0.05;
      innerRef.current.position.y = Math.sin(t * 0.5) * 0.02;
    }
  });

  return (
    <group>
      <group ref={innerRef}>
        {/* --- MOUNTING INTERFACE --- */}
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.2, 32]} />
          {wireframeMat}
        </mesh>

        {/* Central Shaft (Straight) */}
        <mesh position={[0, -1.2, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 2.4, 8]} />
          {wireframeMat}
        </mesh>

        {/* --- TIER 1 (Top) --- */}
        <group position={[0, -0.6, 0]}>
          <mesh>
            <cylinderGeometry args={[0.8, 0.8, 0.05, 32]} />
            {wireframeMat}
          </mesh>
          {/* FIX: Removed rotation=[0,0,0.1]. Now they hang straight down. */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh
              key={i}
              position={[0.6 * Math.cos(i), -0.4, 0.6 * Math.sin(i)]}
            >
              <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
              {wireframeMat}
            </mesh>
          ))}
        </group>

        {/* --- TIER 2 (Middle) --- */}
        <group position={[0, -1.4, 0]}>
          <mesh>
            <cylinderGeometry args={[0.6, 0.6, 0.05, 32]} />
            {wireframeMat}
          </mesh>
          {/* Straight connecting rods */}
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[
                  0.45 * Math.cos(angle),
                  -0.35,
                  0.45 * Math.sin(angle),
                ]}
              >
                <cylinderGeometry args={[0.015, 0.015, 0.7, 8]} />
                {wireframeMat}
              </mesh>
            );
          })}
        </group>

        {/* --- TIER 3 (Bottom) --- */}
        <group position={[0, -2.1, 0]}>
          <mesh>
            <cylinderGeometry args={[0.35, 0.35, 0.05, 32]} />
            {wireframeMat}
          </mesh>
          {/* Core Shield */}
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.2, 0.1, 0.6, 16]} />
            {wireframeMat}
          </mesh>
          {/* Bottom Coils (Toruses remain rotated to form rings) */}
          {[...Array(6)].map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[0.2 * Math.cos(angle), -0.3, 0.2 * Math.sin(angle)]}
                rotation={[0, angle, 0]}
              >
                <torusGeometry args={[0.08, 0.01, 8, 16]} />
                {wireframeMat}
              </mesh>
            );
          })}
        </group>
      </group>
    </group>
  );
}
