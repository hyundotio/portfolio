"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import { useFrame, useLoader, extend } from "@react-three/fiber";
import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import gsap from "gsap";
import { sceneColorTokens } from "./themeTokens";
import { deterministicRandom } from "./deterministicRandom";

// --- 1. ARC SHADER ---
const DataArcMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color(sceneColorTokens.dark.line),
    uLength: 0.3,
    uOpacity: 1.0,
  },
  `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  `uniform float uTime; uniform vec3 uColor; uniform float uLength; uniform float uOpacity; varying vec2 vUv;
   void main() {
      float head = uTime;
      float tail = head - uLength;
      float visibility = step(tail, vUv.x) * step(vUv.x, head);
      float alpha = smoothstep(tail, head, vUv.x);
      alpha *= visibility;
      gl_FragColor = vec4(uColor, alpha * uOpacity);
   }`,
);

// --- 2. HOLOGRAM POINT SHADER ---
const HologramPointMaterial = shaderMaterial(
  {
    uTime: 0,
    uScanY: 100.0,
    uColor: new THREE.Color(sceneColorTokens.dark.line),
    uOpacity: 1.0,
  },
  `
    uniform float uTime;
    uniform float uScanY;
    varying float vVisible;
    varying float vGlow;
    
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = 1.25 * (300.0 / -mvPosition.z);
      vVisible = step(uScanY, position.y);
      float dist = abs(position.y - uScanY);
      vGlow = smoothstep(5.0, 0.0, dist);
    }
  `,
  `
    uniform vec3 uColor;
    uniform float uTime;
    uniform float uOpacity;
    varying float vVisible;
    varying float vGlow;

    void main() {
      if (vVisible < 0.5) discard;
      vec2 coord = gl_PointCoord - vec2(0.5);
      if (length(coord) > 0.5) discard;

      float twinkle = 0.5 + 0.5 * sin(uTime * 5.0 + gl_FragCoord.x * 0.1 + gl_FragCoord.y * 0.1);
      vec3 finalColor = uColor + (vec3(1.0) * vGlow * 2.0);
      float alpha = (0.6 + (vGlow * 0.4));
      gl_FragColor = vec4(finalColor * twinkle, alpha * uOpacity);
    }
  `,
);

extend({ DataArcMaterial, HologramPointMaterial });

type ShaderUniformMaterial = THREE.ShaderMaterial & {
  uTime: number;
  uColor: THREE.Color;
  uLength: number;
  uOpacity: number;
  uScanY: number;
};

type GeoJsonGeometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
};

type GeoJsonFeature = {
  geometry?: GeoJsonGeometry | null;
};

function getPolygons(geometry: GeoJsonGeometry): number[][][][] {
  return geometry.type === "Polygon"
    ? [geometry.coordinates as number[][][]]
    : (geometry.coordinates as number[][][][]);
}

function getPos(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export default function CyberspaceEarth({
  radius = 1,
  opacity = 1,
  color = sceneColorTokens.dark.line,
  arcColor = sceneColorTokens.dark.ibmArc,
  arcAdditive = true,
}: {
  radius?: number;
  opacity?: number;
  color?: string;
  arcColor?: string;
  arcAdditive?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<ShaderUniformMaterial>(null);
  const blending =
    color === sceneColorTokens.light.line
      ? THREE.NormalBlending
      : THREE.AdditiveBlending;

  const data = useLoader(THREE.FileLoader, "/world-countries.geojson");

  const { cityPoints, particleGeo } = useMemo(() => {
    const parsed = JSON.parse(data as string) as { features: GeoJsonFeature[] };
    const tempPoints: { x: number; y: number; z: number }[] = [];
    const targets: THREE.Vector3[] = [];
    let pointIndex = 0;

    parsed.features.forEach((feature) => {
      const geometry = feature.geometry;
      if (!geometry) return;
      getPolygons(geometry).forEach((polygon) => {
        polygon.forEach((ring) => {
          ring.forEach((position) => {
            const [lon, lat] = position;
            const vec = getPos(lat, lon, radius);
            tempPoints.push({ x: vec.x, y: vec.y, z: vec.z });
            if (deterministicRandom(pointIndex + 1) > 0.9) targets.push(vec);
            pointIndex += 1;
          });
        });
      });
    });
    tempPoints.sort((a, b) => b.y - a.y);
    const sortedPositions: number[] = [];
    tempPoints.forEach((p) => sortedPositions.push(p.x, p.y, p.z));
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(sortedPositions, 3),
    );
    return { cityPoints: targets, particleGeo: geo };
  }, [data, radius]);

  useLayoutEffect(() => {
    const proxy = { scanY: radius + 10 };
    gsap.to(proxy, {
      scanY: -radius - 10,
      duration: 7.0,
      ease: "power1.inOut",
      onUpdate: () => {
        if (matRef.current) matRef.current.uScanY = proxy.scanY;
      },
    });
  }, [radius]);

  useFrame((state, delta) => {
    if (matRef.current) {
      matRef.current.uTime += delta;
      matRef.current.uColor = new THREE.Color(color);
      matRef.current.uOpacity = THREE.MathUtils.lerp(
        matRef.current.uOpacity,
        opacity,
        0.1,
      );
    }
  });

  return (
    <group ref={groupRef}>
      <points geometry={particleGeo}>
        {/* @ts-expect-error custom shader material registered with extend */}
        <hologramPointMaterial
          ref={matRef}
          transparent
          depthWrite={false}
          blending={blending}
        />
      </points>
      <DataTraffic
        cities={cityPoints}
        count={30}
        radius={radius}
        globalOpacity={opacity}
        color={arcColor}
        additive={arcAdditive}
      />
    </group>
  );
}

function DataTraffic({
  cities,
  count,
  radius,
  globalOpacity,
  color,
  additive,
}: {
  cities: THREE.Vector3[];
  count: number;
  radius: number;
  globalOpacity: number;
  color: string;
  additive: boolean;
}) {
  const arcs = useMemo(
    () => new Array(count).fill(0).map((_, i) => i),
    [count],
  );
  if (cities.length < 2) return null;
  return (
    <group>
      {arcs.map((i) => (
        <ArcRunner
          key={i}
          index={i}
          cities={cities}
          radius={radius}
          globalOpacity={globalOpacity}
          color={color}
          additive={additive}
        />
      ))}
    </group>
  );
}

function ArcRunner({
  index,
  cities,
  radius,
  globalOpacity,
  color,
  additive,
}: {
  index: number;
  cities: THREE.Vector3[];
  radius: number;
  globalOpacity: number;
  color: string;
  additive: boolean;
}) {
  const [curve, setCurve] = useState<THREE.QuadraticBezierCurve3 | null>(null);
  const materialRef = useRef<ShaderUniformMaterial>(null);
  const speed = useRef(0.05 + deterministicRandom(index + 1) * 0.15);
  const progress = useRef(0);
  const arcColorRef = useRef(new THREE.Color(color));
  const routeStep = useRef(0);
  const blending = additive ? THREE.AdditiveBlending : THREE.NormalBlending;

  const reroute = useCallback(() => {
    const step = routeStep.current;
    const idxA = Math.floor(
      deterministicRandom(index * 97 + step + 1) * cities.length,
    );
    let idxB = Math.floor(
      deterministicRandom(index * 193 + step + 2) * cities.length,
    );
    while (idxB === idxA) {
      idxB = (idxB + 1) % cities.length;
    }
    const start = cities[idxA];
    const end = cities[idxB];
    const dist = start.distanceTo(end);
    const mid = new THREE.Vector3()
      .addVectors(start, end)
      .multiplyScalar(0.5)
      .normalize();
    const height = radius + dist * 0.7;
    mid.multiplyScalar(height);
    setCurve(new THREE.QuadraticBezierCurve3(start, mid, end));
    progress.current = 0;
    routeStep.current += 1;
  }, [cities, index, radius]);

  useEffect(() => {
    reroute();
  }, [reroute]);

  useFrame((state, delta) => {
    if (!materialRef.current) return;
    progress.current += delta * speed.current;
    materialRef.current.uTime = progress.current;
    arcColorRef.current.set(color);
    materialRef.current.uColor = arcColorRef.current;
    materialRef.current.uOpacity = globalOpacity;

    if (progress.current > 1.3) reroute();
  });

  if (!curve) return null;
  return (
    <mesh>
      <tubeGeometry args={[curve, 40, 0.05, 8, false]} />
      {/* @ts-expect-error custom shader material registered with extend */}
      <dataArcMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={blending}
      />
    </mesh>
  );
}
