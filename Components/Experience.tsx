"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Stars, Grid, Circle, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import KeplerianSystem from "./KeplerianSystem";
import HeroOrbit from "./HeroOrbit";
import RobotInteraction from "./RobotInteraction";
import QuantumComputer from "./QuantumComputer";
import SceneTransition from "./SceneTransition";
import CyberspaceEarth from "./CyberspaceEarth";
import KalmanSatellite from "./KalmanSatellite";
import { SceneState } from "@/content/work";
import { useViewStore } from "@/stores/viewStore";
import { sceneColorTokens } from "./themeTokens";

interface ExperienceProps {
  sceneState: SceneState;
  theme: "dark" | "light";
}

function updatePerspectiveCameraFov(camera: THREE.Camera, fov: number) {
  if (camera instanceof THREE.PerspectiveCamera) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
}

function getSceneBaseFov(sceneState: SceneState) {
  if (sceneState === "hawkeye-360" || sceneState === "easter-egg") {
    return 30;
  }

  return 45;
}

function getSceneDetailFov(sceneState: SceneState) {
  if (sceneState === "hawkeye-360") {
    return 38;
  }

  if (sceneState === "easter-egg" || sceneState === "home") {
    return getSceneBaseFov(sceneState);
  }

  return 56;
}

function getWireframeColor(sceneState: SceneState, theme: "dark" | "light") {
  const sceneKey = sceneState === "easter-egg" ? "kayhan-space" : sceneState;

  const palette = {
    ibm: {
      dark: sceneColorTokens.dark.ibmWire,
      light: sceneColorTokens.light.ibmWire,
    },
    "kayhan-space": {
      dark: sceneColorTokens.dark.kayhanWire,
      light: sceneColorTokens.light.kayhanWire,
    },
    "hawkeye-360": {
      dark: sceneColorTokens.dark.hawkeyeWire,
      light: sceneColorTokens.light.hawkeyeWire,
    },
  } as const;

  if (sceneKey in palette) {
    return palette[sceneKey as keyof typeof palette][theme];
  }

  return sceneColorTokens[theme].gridFallback;
}

export default function Experience({ sceneState, theme }: ExperienceProps) {
  const { camera } = useThree();
  const isOdScene = sceneState === "easter-egg";
  const visualPathname = useViewStore((state) => state.visualPathname);
  const activeTransition = useViewStore((state) => state.activeTransition);
  const detailCanvasInView = useViewStore((state) => state.detailCanvasInView);
  const isDetailRoute = /^\/work\/[^/]+\/details$/.test(visualPathname);
  const isDetailTransition =
    activeTransition?.mode === "to-detail" ||
    activeTransition?.mode === "to-overview";
  const isDetailSceneActive =
    !isDetailRoute || detailCanvasInView || isDetailTransition;
  const shouldRenderSceneEffects = !isDetailRoute || isDetailTransition;
  const shouldUseDetailZoom =
    isDetailRoute && activeTransition?.mode !== "to-overview";

  const roomRef = useRef<THREE.Group>(null);
  const floorRef = useRef<THREE.Mesh>(null);
  const earthRef = useRef<THREE.Mesh>(null);
  const earthMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const [cyberOpacity, setCyberOpacity] = useState(0);
  const lookAtTarget = useRef(new THREE.Vector3(0, 0.5, 0));

  useEffect(() => {
    if (isOdScene) {
      camera.position.set(0, -24, 170);
      camera.lookAt(0, -60, 0);
      updatePerspectiveCameraFov(camera, 30);
      return;
    }

    camera.position.set(2, 1.5, 4);
    camera.lookAt(lookAtTarget.current);
    updatePerspectiveCameraFov(camera, 45);
  }, [camera, isOdScene]);

  const wireframeColor = getWireframeColor(sceneState, theme);
  const baseColor = sceneColorTokens[theme].base;
  const ibmArcColor = sceneColorTokens[theme].ibmArc;
  const ibmArcAdditive = theme === "dark";

  useEffect(() => {
    const params = { cyberOp: 0 };

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onUpdate: () => {
        if (sceneState !== "hawkeye-360" && sceneState !== "easter-egg") {
          camera.lookAt(lookAtTarget.current);
        }
        setCyberOpacity(params.cyberOp);
      },
    });

    if (sceneState === "ibm") {
      tl.to(camera.position, { x: 0, y: -35, z: 180, duration: 2.5 });
      tl.to(lookAtTarget.current, { x: 0, y: -60, z: 0, duration: 2.5 }, "<");
      tl.to(
        camera,
        {
          fov: getSceneBaseFov(sceneState),
          duration: 2,
          onUpdate: () => camera.updateProjectionMatrix(),
        },
        "<",
      );

      tl.to(params, { cyberOp: 1, duration: 1.5 }, "<");

      if (earthMatRef.current)
        tl.to(earthMatRef.current, { opacity: 0.8, duration: 2 }, "<");
      if (roomRef.current)
        tl.to(roomRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.5 }, "<");
    } else if (sceneState === "hawkeye-360") {
      tl.to(
        camera,
        {
          fov: getSceneBaseFov(sceneState),
          duration: 2.5,
          onUpdate: () => camera.updateProjectionMatrix(),
        },
        "<",
      );

      tl.to(params, { cyberOp: 0, duration: 1.0 }, "<");

      if (earthMatRef.current)
        tl.to(earthMatRef.current, { opacity: 0.8, duration: 2 }, "<");
      if (roomRef.current)
        tl.to(roomRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.5 }, "<");
    } else if (sceneState === "kayhan-space") {
      tl.to(camera.position, { x: 0, y: 60, z: 140, duration: 3.5 });
      tl.to(lookAtTarget.current, { x: 0, y: -60, z: 0, duration: 3.5 }, "<");
      tl.to(
        camera,
        {
          fov: getSceneBaseFov(sceneState),
          duration: 3,
          onUpdate: () => camera.updateProjectionMatrix(),
        },
        "<",
      );

      tl.to(params, { cyberOp: 0, duration: 1.0 }, "<");

      if (earthMatRef.current)
        tl.to(earthMatRef.current, { opacity: 0.8, duration: 2 }, "<");
      if (roomRef.current)
        tl.to(roomRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.5 }, "<");
    } else if (sceneState === "easter-egg") {
      tl.to(camera.position, { x: 0, y: -24, z: 170, duration: 2.2 });
      tl.to(lookAtTarget.current, { x: 0, y: -60, z: 0, duration: 2.2 }, "<");
      tl.to(
        camera,
        {
          fov: getSceneBaseFov(sceneState),
          duration: 2,
          onUpdate: () => camera.updateProjectionMatrix(),
        },
        "<",
      );
      tl.to(params, { cyberOp: 0, duration: 0.4 }, "<");

      if (earthMatRef.current)
        tl.to(earthMatRef.current, { opacity: 0.1, duration: 1.6 }, "<");
      if (roomRef.current)
        tl.to(roomRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.45 }, "<");
    }
  }, [sceneState, camera]);

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera) || isOdScene) {
      return;
    }

    const targetFov = shouldUseDetailZoom
      ? getSceneDetailFov(sceneState)
      : getSceneBaseFov(sceneState);

    const transitionDelay = activeTransition?.mode === "to-detail" ? 0.72 : 0;
    const transitionDuration =
      activeTransition?.mode === "to-detail" ? 0.42 : 0.32;

    const detailZoomTween = gsap.to(camera, {
      fov: targetFov,
      delay: transitionDelay,
      duration: transitionDuration,
      ease: "power2.out",
      overwrite: "auto",
      onUpdate: () => camera.updateProjectionMatrix(),
    });

    return () => {
      detailZoomTween.kill();
    };
  }, [
    activeTransition?.mode,
    camera,
    isOdScene,
    sceneState,
    shouldUseDetailZoom,
  ]);

  return (
    <>
      <color
        attach="background"
        args={[sceneColorTokens[theme].background]}
      />
      <SceneTransition
        enabled={shouldRenderSceneEffects}
        sceneState={sceneState}
        theme={theme}
      />
      <ambientLight intensity={0.1} />
      <directionalLight
        position={[50, 20, 30]}
        intensity={theme === "light" ? 0.6 : 1}
      />
      <directionalLight position={[-40, 10, 20]} intensity={0.5} />
      <Stars
        radius={300}
        depth={50}
        count={isOdScene ? 3000 : 8000}
        factor={4}
        fade
      />

      {!isOdScene ? (
        <group ref={roomRef} scale={[0, 0, 0]}>
          <RobotInteraction lineColor={wireframeColor} baseColor={baseColor} />
          <group position={[-3.5, 4.5, 1]}>
            <QuantumComputer lineColor={wireframeColor} baseColor={baseColor} />
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.5, 0.2, 1.5]} />
              <meshStandardMaterial
                wireframe={true}
                color={baseColor}
                emissive={wireframeColor}
                emissiveIntensity={1}
              />
            </mesh>
          </group>
          <Grid
            args={[16, 12]}
            cellColor={wireframeColor}
            sectionColor={wireframeColor}
            fadeDistance={20}
          />
          <Circle
            ref={floorRef}
            args={[20, 32]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.02, 0]}
          >
            <meshBasicMaterial color={baseColor} transparent opacity={0.9} />
          </Circle>
        </group>
      ) : null}

      <group
        position={[0, -60, 0]}
        rotation={isOdScene ? [0, 0, 0] : [0.5, 3.8, 0]}
      >
        <mesh ref={earthRef} scale={[60, 60, 60]}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial
            ref={earthMatRef}
            color={baseColor}
            wireframe={true}
            emissive={wireframeColor}
            emissiveIntensity={1}
            transparent
            opacity={0.8}
          />
        </mesh>

        {!isOdScene && cyberOpacity > 0.001 ? (
          <CyberspaceEarth
            radius={60.5}
            opacity={cyberOpacity}
            color={wireframeColor}
            arcColor={ibmArcColor}
            arcAdditive={ibmArcAdditive}
          />
        ) : null}
        {isOdScene ? <KalmanSatellite /> : null}
      </group>

      {isOdScene ? (
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          enablePan={false}
          minDistance={8}
          maxDistance={600}
          rotateSpeed={0.55}
          zoomSpeed={0.8}
          target={[0, -60, 0]}
        />
      ) : (
        <>
          <KeplerianSystem
            sceneState={sceneState}
            color={wireframeColor}
            theme={theme}
            active={isDetailSceneActive}
          />
          <HeroOrbit
            sceneState={sceneState}
            lineColor={wireframeColor}
            baseColor={baseColor}
            theme={theme}
            active={isDetailSceneActive}
          />
        </>
      )}
    </>
  );
}
