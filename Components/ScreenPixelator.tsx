"use client";

import { useThree, useFrame, createPortal, extend } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import gsap from "gsap";
import { SceneState } from "@/content/work";

const PixelMaterial = shaderMaterial(
  {
    tDiffuse: null,
    uResolution: new THREE.Vector2(0, 0),
    uPixelSize: 1.0,
    uOpacity: 1.0,
  },
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  `
    uniform sampler2D tDiffuse;
    uniform vec2 uResolution;
    uniform float uPixelSize;
    uniform float uOpacity;
    varying vec2 vUv;

    // Fixes "Green Tint" by applying correct Tone Mapping
    vec3 ACESFilmicToneMapping(vec3 color) {
        float a = 2.51;
        float b = 0.03;
        float c = 2.43;
        float d = 0.59;
        float e = 0.14;
        return clamp((color * (a * color + b)) / (color * (c * color + d) + e), 0.0, 1.0);
    }

    void main() {
      float size = uPixelSize;
      vec4 texel;

      if (size <= 1.0) {
          texel = texture2D(tDiffuse, vUv);
      } else {
          vec2 dxy = size / uResolution;
          vec2 coord = dxy * floor(vUv / dxy);
          texel = texture2D(tDiffuse, coord);
      }

      // Apply Tone Mapping & Gamma Correction
      vec3 toneMapped = ACESFilmicToneMapping(texel.rgb);
      vec3 color = pow(toneMapped, vec3(1.0 / 2.2));

      gl_FragColor = vec4(color * uOpacity, 1.0);
    }
  `,
);

extend({ PixelMaterial });

type PixelShaderMaterial = THREE.ShaderMaterial & {
  tDiffuse: THREE.Texture | null;
  uResolution: THREE.Vector2;
  uPixelSize: number;
  uOpacity: number;
};

export default function ScreenPixelator({
  sceneState,
}: {
  sceneState: SceneState;
}) {
  const { gl, scene, camera, size } = useThree();
  const materialRef = useRef<PixelShaderMaterial>(null);

  const hudScene = useMemo(() => new THREE.Scene(), []);
  const hudCamera = useMemo(
    () => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
    [],
  );

  const resolutionScale = 2.0;

  const target = useMemo(
    () =>
      new THREE.WebGLRenderTarget(
        size.width * resolutionScale,
        size.height * resolutionScale,
        {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          format: THREE.RGBAFormat,
          type: THREE.UnsignedByteType,
          stencilBuffer: false,
          depthBuffer: true,
          samples: 0,
        },
      ),
    [size],
  );

  useEffect(() => {
    target.setSize(size.width * resolutionScale, size.height * resolutionScale);
  }, [size, target]);

  // --- TRANSITION LOGIC (REVERTED) ---
  useEffect(() => {
    if (!materialRef.current) return;

    if (sceneState === "home") {
      // 1. Pixelate Down (Sharp -> Blocky)
      gsap.to(materialRef.current, {
        uPixelSize: 64.0,
        duration: 1.0,
        ease: "power2.in",
      });

      // 2. Fade to Black
      gsap.to(materialRef.current, {
        uOpacity: 0.0,
        duration: 0.5,
        delay: 0.8,
        ease: "power1.out",
      });
    } else {
      // RESET INSTANTLY (Or very fast fade in)
      gsap.killTweensOf(materialRef.current);
      materialRef.current.uPixelSize = 1.0;
      materialRef.current.uOpacity = 1.0;
    }
  }, [sceneState]);

  useFrame(() => {
    if (!materialRef.current) return;

    gl.setRenderTarget(target);
    gl.clear();
    gl.render(scene, camera);

    gl.setRenderTarget(null);
    materialRef.current.tDiffuse = target.texture;
    materialRef.current.uResolution.set(
      size.width * resolutionScale,
      size.height * resolutionScale,
    );

    gl.clear();
    gl.render(hudScene, hudCamera);
  }, 1);

  return createPortal(
    <mesh>
      <planeGeometry args={[2, 2]} />
      {/* @ts-expect-error custom shader material registered with extend */}
      <pixelMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </mesh>,
    hudScene,
  );
}
