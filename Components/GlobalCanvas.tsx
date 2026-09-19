"use client";

import { Canvas } from "@react-three/fiber";
import { memo, Suspense, useEffect, useState } from "react";
import Experience from "@/Components/Experience";
import { Loader } from "@react-three/drei";
import { SceneState, WORK_DATA } from "@/content/work";
import { useTheme } from "@/Components/ThemeProvider";
import { useViewStore } from "@/stores/viewStore";

const DEFAULT_CAMERA = {
  position: [0, 2, 5] as [number, number, number],
  fov: 45,
};

const GL_OPTIONS = {
  antialias: true,
};

const MAX_RENDER_WIDTH = 1920;
const MAX_RENDER_HEIGHT = 1080;

function getCanvasDpr() {
  const viewportWidth = Math.max(window.innerWidth, 1);
  const viewportHeight = Math.max(window.innerHeight, 1);

  return Math.min(
    window.devicePixelRatio || 1,
    MAX_RENDER_WIDTH / viewportWidth,
    MAX_RENDER_HEIGHT / viewportHeight,
  );
}

function resolveSceneState(
  pathname: string,
  odModeEnabled: boolean,
): SceneState {
  if (pathname === "/work/kayhan-space" && odModeEnabled) {
    return "easter-egg";
  }

  if (pathname === "/" || pathname === "/contact" || pathname === "/resume") {
    return "home";
  }

  const detailMatch = pathname.match(/^\/work\/([^/]+)\/details$/);
  if (detailMatch) {
    const detailId = detailMatch[1];
    const isValidDetailWork = WORK_DATA.some((work) => work.id === detailId);
    return isValidDetailWork ? (detailId as SceneState) : "home";
  }

  const id = pathname.split("/").pop();
  const isValidWork = WORK_DATA.some((work) => work.id === id);
  return isValidWork ? (id as SceneState) : "home";
}

interface GlobalCanvasViewProps {
  sceneState: SceneState;
  theme: "dark" | "light";
  dpr: number;
}

const GlobalCanvasView = memo(function GlobalCanvasView({
  sceneState,
  theme,
  dpr,
}: GlobalCanvasViewProps) {
  return (
    <>
      <Canvas camera={DEFAULT_CAMERA} dpr={dpr} gl={GL_OPTIONS}>
        <Suspense fallback={null}>
          <Experience sceneState={sceneState} theme={theme} />
        </Suspense>
      </Canvas>
      <Loader />
    </>
  );
});

export default function GlobalCanvas() {
  const { theme } = useTheme();
  const [dpr, setDpr] = useState(1);
  const odModeEnabled = useViewStore((state) => state.odModeEnabled);
  const visualPathname = useViewStore((state) => state.visualPathname);
  const sceneState = resolveSceneState(
    visualPathname,
    odModeEnabled,
  );

  useEffect(() => {
    const updateDpr = () => setDpr(getCanvasDpr());

    updateDpr();
    window.addEventListener("resize", updateDpr);

    return () => window.removeEventListener("resize", updateDpr);
  }, []);

  return <GlobalCanvasView sceneState={sceneState} theme={theme} dpr={dpr} />;
}
