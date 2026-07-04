import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import {
  BrightnessContrastEffect,
  ChromaticAberrationEffect,
  PixelationEffect,
} from "postprocessing";
import gsap from "gsap";
import * as THREE from "three";
import { SceneState } from "@/content/work";
import WorkCursorDitherEffect from "@/Components/WorkCursorDitherEffect";

const pixelEffect = new PixelationEffect(0);
const chromaEffect = new ChromaticAberrationEffect({
  blendFunction: BlendFunction.NORMAL,
  modulationOffset: 0,
  offset: new THREE.Vector2(0, 0),
  radialModulation: false,
});
const brightEffect = new BrightnessContrastEffect({
  brightness: 0,
  contrast: 0,
});

interface Props {
  enabled?: boolean;
  sceneState: SceneState;
  theme: "dark" | "light";
}

export default function SceneTransition({
  enabled = true,
  sceneState,
  theme,
}: Props) {
  const pathname = usePathname();
  const isDetailRoute = /^\/work\/[^/]+\/details$/.test(pathname);

  // Track the previous state to know where we are coming from
  const lastState = useRef(sceneState);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // 1. Setup Proxies
    const pixelProxy = { val: 0 };
    const chromaProxy = { x: 0, y: 0 };
    const brightProxy = { val: 0 };

    // Get the previous state
    const prevState = lastState.current;

    // --- SCENARIO 1: ENTERING HOME MODE ---
    // UPDATED: Check for "home" string, not null
    const targetBrightness = theme === "light" ? 1 : -1;

    if (sceneState === "home") {
      // Ensure we start from clean if jumping quickly
      pixelEffect.granularity = 0;
      chromaEffect.offset = new THREE.Vector2(0, 0);

      const tl = gsap.timeline({
        onUpdate: () => {
          pixelEffect.granularity = pixelProxy.val;
          brightEffect.brightness = brightProxy.val;
        },
      });

      tl.set(pixelProxy, { val: 0 })
        .set(brightProxy, { val: 0 })
        // Animate to heavy blocks and pitch black over 1 second
        .to(pixelProxy, { val: 96, duration: 1, ease: "power2.in" })
        .to(
          brightProxy,
          { val: targetBrightness, duration: 1, ease: "power2.in" },
          "<",
        );
    }

    // --- SCENARIO 2: LEAVING HOME MODE (Home -> Work) ---
    // UPDATED: Check if we are coming FROM "home"
    else if (prevState === "home") {
      const tl = gsap.timeline({
        onUpdate: () => {
          pixelEffect.granularity = pixelProxy.val;
          brightEffect.brightness = brightProxy.val;
          // Ensure chroma stays zero
          chromaEffect.offset = new THREE.Vector2(0, 0);
        },
      });

      // Start from the "End state" (Black + Pixelated)
      tl.set(pixelProxy, { val: 96 })
        .set(brightProxy, { val: targetBrightness })
        // Animate back to normal visibility
        .to(pixelProxy, { val: 0, duration: 1.2, ease: "power2.out" })
        .to(brightProxy, { val: 0, duration: 1.2, ease: "power2.out" }, "<");
    }

    // --- SCENARIO 3: NORMAL NAVIGATION (Work -> Work) ---
    // Glitch effect between work slides
    else {
      // Reset brightness explicitly just in case
      brightEffect.brightness = 0;

      gsap.killTweensOf(pixelProxy);
      gsap.killTweensOf(chromaProxy);

      const tl = gsap.timeline({
        onUpdate: () => {
          pixelEffect.granularity = pixelProxy.val;
          chromaEffect.offset = new THREE.Vector2(chromaProxy.x, chromaProxy.y);
        },
      });

      // Glitch timing...
      tl.set(pixelProxy, { val: 30 })
        .set(chromaProxy, { x: 0.05, y: 0.05 })
        .to(pixelProxy, {
          val: 15,
          duration: 0.1,
          delay: 0.3,
          ease: "steps(1)",
        })
        .to(chromaProxy, { x: 0.02, y: 0.02, duration: 0.1 }, "<")
        .to(pixelProxy, { val: 8, duration: 0.1, delay: 0.3, ease: "steps(1)" })
        .to(chromaProxy, { x: 0.01, y: 0.01, duration: 0.1 }, "<")
        .to(pixelProxy, { val: 4, duration: 0.1, delay: 0.3, ease: "steps(1)" })
        .to(chromaProxy, { x: 0.005, y: 0.005, duration: 0.1 }, "<")
        .to(pixelProxy, { val: 0, duration: 0.1, ease: "steps(1)" })
        .to(chromaProxy, { x: 0, y: 0, duration: 0.5 }, "<");
    }

    // Update the ref for the next render
    lastState.current = sceneState;
  }, [enabled, sceneState, theme]);

  return enabled ? (
    <EffectComposer>
      <primitive object={pixelEffect} />
      <primitive object={brightEffect} />
      <primitive object={chromaEffect} />
      <WorkCursorDitherEffect
        active={sceneState !== "home" && !isDetailRoute}
        ditherMix={sceneState !== "home" && !isDetailRoute ? 1 : 0}
        effectMix={sceneState !== "home" && !isDetailRoute ? 1 : 0}
        theme={theme}
      />
    </EffectComposer>
  ) : null;
}
