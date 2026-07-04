"use client";

import { useMemo, useRef, useLayoutEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { odCanvasColorFallbacks } from "./themeTokens";
import { deterministicRandom } from "./deterministicRandom";

const SATELLITE_COUNT = 5000;
const SEGMENTS = 64; // Smoothness of each circle (64 is standard high quality)

// REUSABLE MATH HELPER
// Gets a point on an elliptical orbit at a specific angle (true anomaly)
function getOrbitPoint(
  a: number,
  e: number,
  angle: number,
  target: THREE.Vector3,
) {
  // Polar equation: r = a(1-e^2) / (1 + e*cos(angle))
  const r = (a * (1 - e * e)) / (1 + e * Math.cos(angle));
  target.set(r * Math.cos(angle), 0, r * Math.sin(angle));
}

export default function MassiveOrbitTracks({ visible }: { visible: boolean }) {
  const materialRef = useRef<THREE.LineBasicMaterial>(null);

  const geometry = useMemo(() => {
    // 1. CALCULATE BUFFER SIZE
    // Each orbit has 64 segments. Each segment has 2 points (Start -> End).
    // Each point has 3 coordinates (x, y, z).
    const totalVertices = SATELLITE_COUNT * SEGMENTS * 2;
    const positions = new Float32Array(totalVertices * 3);

    const point1 = new THREE.Vector3();
    const point2 = new THREE.Vector3();
    const axis = new THREE.Vector3();

    let posIndex = 0;

    for (let i = 0; i < SATELLITE_COUNT; i++) {
      // 2. ORBIT PARAMETERS (Must match KeplerianSystem logic exactly)
      const a = 70 + deterministicRandom(i + 1) * 30; // Semi-major axis
      const e = Math.pow(deterministicRandom(i + 2), 3) * 0.7; // Eccentricity
      const inclination = (deterministicRandom(i + 3) - 0.5) * Math.PI * 2;

      // Random Axis Rotation
      axis
        .set(
          deterministicRandom(i + 4) - 0.5,
          deterministicRandom(i + 5) - 0.5,
          deterministicRandom(i + 6) - 0.5,
        )
        .normalize();

      const rotationMatrix = new THREE.Matrix4().makeRotationAxis(
        axis,
        inclination,
      );

      // 3. GENERATE POINTS FOR ONE ORBIT
      for (let s = 0; s < SEGMENTS; s++) {
        // Calculate angle for Start and End of this tiny segment
        const angle1 = (s / SEGMENTS) * Math.PI * 2;
        const angle2 = ((s + 1) / SEGMENTS) * Math.PI * 2;

        // Get Local positions (Flat on XZ plane)
        getOrbitPoint(a, e, angle1, point1);
        getOrbitPoint(a, e, angle2, point2);

        // Rotate them to 3D space
        point1.applyMatrix4(rotationMatrix);
        point2.applyMatrix4(rotationMatrix);

        // Push to Big Array
        // Point 1
        positions[posIndex++] = point1.x;
        positions[posIndex++] = point1.y;
        positions[posIndex++] = point1.z;

        // Point 2
        positions[posIndex++] = point2.x;
        positions[posIndex++] = point2.y;
        positions[posIndex++] = point2.z;
      }
    }

    // 4. CREATE GEOMETRY
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  // FADE IN / OUT LOGIC
  useLayoutEffect(() => {
    if (!materialRef.current) return;

    if (visible) {
      // Fade In
      gsap.to(materialRef.current, {
        opacity: 0.08,
        duration: 2,
        ease: "power2.inOut",
      });
    } else {
      // Fade Out
      gsap.to(materialRef.current, { opacity: 0, duration: 1 });
    }
  }, [visible]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        ref={materialRef}
        color={odCanvasColorFallbacks.accent}
        transparent
        opacity={0} // Start hidden
        depthWrite={false} // Important: lets lines overlap nicely without glitching
        blending={THREE.AdditiveBlending} // Makes dense areas glow brighter
      />
    </lineSegments>
  );
}
