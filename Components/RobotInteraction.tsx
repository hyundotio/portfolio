import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function RobotInteraction({
  lineColor,
  baseColor,
}: {
  lineColor: string;
  baseColor: string;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const wireframeMat = (
    <meshStandardMaterial
      wireframe={true}
      color={baseColor}
      emissive={lineColor}
      emissiveIntensity={1}
    />
  );

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      // Gentle floating animation applied to the whole lifted group
      // We add the base elevation (0.8) to the sine wave
      groupRef.current.position.y = 0.8 + Math.sin(t * 0.5) * 0.02;
    }
  });

  return (
    // Lift the entire scene up by 0.8 units so it floats above the main floor grid
    <group ref={groupRef} position={[0, 0.8, 0]}>
      {/* ==========================
          1. CEILING & ROBOT ARM (Boxes Only)
         ========================== */}
      <group position={[0, 0, 0]}>
        {/* CEILING RAIL */}
        <mesh position={[0, 4.5, 0]}>
          <boxGeometry args={[1, 0.2, 5]} />
          {wireframeMat}
        </mesh>

        {/* ROBOT BASE */}
        <mesh position={[0, 4.2, 0]}>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          {wireframeMat}
        </mesh>

        {/* LINK 1: UPPER ARM */}
        {/* Pivoting from where shoulder used to be relative to base */}
        <group position={[0, 3.9, 0]} rotation={[0.3, 0, 0]}>
          {/* Arm Segment */}
          <mesh position={[0, -0.7, 0]}>
            <boxGeometry args={[0.3, 1.4, 0.3]} />
            {wireframeMat}
          </mesh>

          {/* LINK 2: FOREARM */}
          {/* Pivoting from relative elbow position (Y=-1.4 from upper arm origin) */}
          <group position={[0, -1.4, 0]} rotation={[-1.2, 0, 0]}>
            <mesh position={[0, -0.6, 0]}>
              <boxGeometry args={[0.25, 1.2, 0.25]} />
              {wireframeMat}
            </mesh>

            {/* ==========================
                  2. THE TV SCREEN
                 ========================== */}
            {/* Attached to end of forearm (Y=-1.2 relative) */}
            <group position={[0, -1.2, 0]} rotation={[0.9, 0, 0]}>
              {/* MOUNT PLATE */}
              <mesh position={[0, 0.1, -0.1]}>
                <boxGeometry args={[0.2, 0.2, 0.2]} />
                {wireframeMat}
              </mesh>

              {/* TV SCREEN PANEL */}
              <group position={[0, -0.2, 0.1]}>
                <mesh>
                  <boxGeometry args={[1.6, 0.9, 0.05]} />
                  {wireframeMat}
                </mesh>
                {/* Screen Glow Panel */}
                <mesh position={[0, 0, 0.04]}>
                  <planeGeometry args={[1.5, 0.8]} />
                  <meshBasicMaterial
                    color={lineColor}
                    transparent
                    opacity={0.1}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* ==========================
          3. THE PERSON (Boxes Only)
         ========================== */}
      {/* Facing the TV (Rotated 180), positioned behind it at Z=2.2 */}
      <group position={[0, 0, 2.2]} rotation={[0, Math.PI, 0]}>
        {/* HIPS */}
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[0.35, 0.15, 0.2]} />
          {wireframeMat}
        </mesh>

        {/* TORSO */}
        <group position={[0, 1.0, 0]} rotation={[0.1, 0, 0]}>
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[0.25, 0.7, 0.15]} />
            {wireframeMat}
          </mesh>

          {/* SHOULDERS */}
          <mesh position={[0, 0.7, 0]}>
            <boxGeometry args={[0.5, 0.15, 0.2]} />
            {wireframeMat}
          </mesh>

          {/* HEAD (Changed from Sphere to Box) */}
          <mesh position={[0, 0.95, 0]}>
            <boxGeometry args={[0.22, 0.25, 0.22]} />
            {wireframeMat}
          </mesh>

          {/* ARMS (Just segments, no sphere joints) */}
          {/* Left Arm */}
          <group position={[-0.25, 0.7, 0]}>
            {/* Upper Arm */}
            <mesh position={[0, -0.2, 0.15]} rotation={[-0.5, 0, -0.2]}>
              <boxGeometry args={[0.1, 0.5, 0.1]} />
              {wireframeMat}
            </mesh>

            {/* Forearm (Positioned relative to end of upper arm) */}
            <mesh position={[-0.1, -0.4, 0.55]} rotation={[1.4, 0.1, 0]}>
              <boxGeometry args={[0.08, 0.5, 0.08]} />
              {wireframeMat}
            </mesh>
          </group>

          {/* Right Arm */}
          <group position={[0.25, 0.7, 0]}>
            {/* Upper Arm */}
            <mesh position={[0, -0.2, 0.15]} rotation={[-0.5, 0, 0.2]}>
              <boxGeometry args={[0.1, 0.5, 0.1]} />
              {wireframeMat}
            </mesh>
            {/* Forearm */}
            <mesh position={[0.1, -0.4, 0.55]} rotation={[1.4, -0.1, 0]}>
              <boxGeometry args={[0.08, 0.5, 0.08]} />
              {wireframeMat}
            </mesh>
          </group>
        </group>

        {/* LEGS (Just segments, no sphere joints) */}

        {/* Left Leg */}
        <group position={[-0.15, 0.925, 0]} rotation={[0, 0, 0.05]}>
          {/* Thigh */}
          <mesh position={[0, -0.25, 0]}>
            <boxGeometry args={[0.14, 0.5, 0.14]} />
            {wireframeMat}
          </mesh>

          {/* Shin & Foot Group (Positioned at end of thigh) */}
          <group position={[0, -0.5, 0]} rotation={[-0.1, 0, 0]}>
            <mesh position={[0, -0.25, 0]}>
              <boxGeometry args={[0.12, 0.5, 0.12]} />
              {wireframeMat}
            </mesh>

            {/* Foot */}
            <mesh position={[0, -0.5, 0.1]}>
              <boxGeometry args={[0.12, 0.1, 0.25]} />
              {wireframeMat}
            </mesh>
          </group>
        </group>

        {/* Right Leg */}
        <group position={[0.15, 0.925, 0]} rotation={[0, 0, -0.05]}>
          <mesh position={[0, -0.25, 0]}>
            <boxGeometry args={[0.14, 0.5, 0.14]} />
            {wireframeMat}
          </mesh>
          <group position={[0, -0.5, 0]} rotation={[-0.1, 0, 0]}>
            <mesh position={[0, -0.25, 0]}>
              <boxGeometry args={[0.12, 0.5, 0.12]} />
              {wireframeMat}
            </mesh>
            <mesh position={[0, -0.5, 0.1]}>
              <boxGeometry args={[0.12, 0.1, 0.25]} />
              {wireframeMat}
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
