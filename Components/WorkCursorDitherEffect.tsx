"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { BlendFunction, Effect } from "postprocessing";
import gsap from "gsap";
import * as THREE from "three";
import { ENABLE_MAIN_VIZ_ONE_BIT_DITHER } from "@/Components/workVizFlags";

const TRAIL_SLOTS = 16;

const fragmentShader = /* glsl */ `
  uniform vec2 uResolution;
  uniform vec2 uTrail[${TRAIL_SLOTS}];
  uniform vec2 uTrailFlow[${TRAIL_SLOTS}];
  uniform float uTrailStrength[${TRAIL_SLOTS}];
  uniform float uTrailRadius[${TRAIL_SLOTS}];
  uniform float uTime;
  uniform float uVelocity;
  uniform float uToneSteps;
  uniform float uToneGamma;
  uniform float uToneLift;
  uniform float uEffectMix;
  uniform float uDitherMix;

  float hashNoise(vec2 value) {
    return fract(sin(dot(value, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float bayer4(vec2 pixel) {
    vec2 cell = mod(pixel, 4.0);

    if (cell.y < 1.0) {
      if (cell.x < 1.0) return 0.0;
      if (cell.x < 2.0) return 8.0;
      if (cell.x < 3.0) return 2.0;
      return 10.0;
    }

    if (cell.y < 2.0) {
      if (cell.x < 1.0) return 12.0;
      if (cell.x < 2.0) return 4.0;
      if (cell.x < 3.0) return 14.0;
      return 6.0;
    }

    if (cell.y < 3.0) {
      if (cell.x < 1.0) return 3.0;
      if (cell.x < 2.0) return 11.0;
      if (cell.x < 3.0) return 1.0;
      return 9.0;
    }

    if (cell.x < 1.0) return 15.0;
    if (cell.x < 2.0) return 7.0;
    if (cell.x < 3.0) return 13.0;
    return 5.0;
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 pixel = uv * uResolution;
    vec2 warp = vec2(0.0);
    float distortionStrength = 0.0;
    float steppedTime = floor(uTime * 24.0) / 24.0;

    for (int i = 0; i < ${TRAIL_SLOTS}; i += 1) {
      float strength = uTrailStrength[i];
      if (strength <= 0.001) {
        continue;
      }

      vec2 point = uTrail[i] * uResolution;
      vec2 flow = uTrailFlow[i];
      float radius = uTrailRadius[i];
      vec2 delta = pixel - point;
      float distanceToPoint = length(delta);
      if (distanceToPoint > radius) {
        continue;
      }

      float falloff = 1.0 - distanceToPoint / radius;
      vec2 radial = distanceToPoint > 0.001 ? delta / distanceToPoint : vec2(0.0, 0.0);
      vec2 tangent = vec2(-radial.y, radial.x);
      vec2 cell = floor((pixel + float(i) * vec2(17.0, 23.0)) / vec2(18.0, 10.0));
      float blockNoise = hashNoise(cell + vec2(steppedTime * 9.0, float(i) * 7.31));
      float scanNoise = hashNoise(
        vec2(floor(pixel.y / 6.0) + float(i) * 5.13, steppedTime * 17.0)
      );
      float tearNoise = hashNoise(
        vec2(
          floor(pixel.x / 24.0) + float(i) * 3.7,
          floor(pixel.y / 28.0) - steppedTime * 9.0
        )
      );
      float flickerNoise = hashNoise(
        vec2(
          floor(pixel.x / 14.0) - steppedTime * 13.0,
          floor(pixel.y / 14.0) + float(i) * 2.4
        )
      );
      float blockGate = step(0.48, blockNoise);
      float lineGate = step(0.6, scanNoise);
      float flickerGate = step(0.7, flickerNoise);
      vec2 horizontalAxis = vec2(sign(flow.x + 0.0001), 0.0);
      vec2 verticalAxis = vec2(0.0, sign(flow.y + 0.0001));
      float weightedFalloff = falloff * falloff * (0.3 + falloff * 0.9);
      vec2 blockShift = flow * mix(6.0, 16.0, blockNoise) * blockGate;
      vec2 lineShift = horizontalAxis * ((scanNoise - 0.5) * 18.0) * lineGate;
      vec2 tearShift =
        (horizontalAxis * (tearNoise - 0.5) * 12.0 +
          verticalAxis * (tearNoise - 0.5) * 6.0) * blockGate;
      vec2 crossShift = tangent * (flickerGate * 6.0 - 3.0) * 0.45;
      vec2 localWarp =
        (blockShift + lineShift + tearShift + crossShift) *
        weightedFalloff *
        (0.32 + strength * 0.52);
      warp += floor(localWarp / 2.0 + 0.5) * 2.3;
      distortionStrength = max(
        distortionStrength,
        weightedFalloff * strength * max(blockGate, lineGate)
      );
    }

    vec2 warpUv = warp / uResolution;
    vec2 warpedUv = clamp(uv + warpUv, vec2(0.001), vec2(0.999));
    vec2 snappedUv = clamp(
      uv + floor(warpUv * uResolution / vec2(12.0, 8.0)) * vec2(12.0, 8.0) / uResolution,
      vec2(0.001),
      vec2(0.999)
    );
    vec4 warpedColor = texture2D(inputBuffer, warpedUv);
    vec4 snappedColor = texture2D(inputBuffer, snappedUv);
    float influence = clamp(distortionStrength * 0.72 + uVelocity * 0.06, 0.0, 0.68);
    vec4 glitchedColor = mix(warpedColor, snappedColor, 0.42);
    float activation = clamp(distortionStrength * 0.2 + uVelocity * 0.045, 0.0, 0.22);
    float luminance = dot(glitchedColor.rgb, vec3(0.2126, 0.7152, 0.0722));
    vec3 saturatedColor = mix(
      vec3(luminance),
      glitchedColor.rgb,
      1.0 + activation * 2.1
    );
    vec3 intensifiedColor = saturatedColor * (1.0 + activation * 0.85);
    vec3 liftedColor = mix(
      intensifiedColor,
      sqrt(clamp(intensifiedColor, 0.0, 1.0)),
      activation * 0.55
    );
    vec4 finalColor = mix(
      inputColor,
      vec4(clamp(liftedColor, 0.0, 1.0), glitchedColor.a),
      influence
    );

#ifdef WORK_ONE_BIT_DITHER
    float ditherThreshold = (bayer4(pixel) + 0.5) / 16.0;
    float luma = dot(finalColor.rgb, vec3(0.2126, 0.7152, 0.0722));
    luma = clamp(pow(max(luma, 0.0), uToneGamma) + uToneLift, 0.0, 1.0);
    float toneRange = max(uToneSteps - 1.0, 1.0);
    float scaledTone = luma * toneRange;
    float toneBand = floor(scaledTone);
    float toneMix = fract(scaledTone);
    float quantizedLuma = (toneBand + step(ditherThreshold, toneMix)) / toneRange;
    finalColor.rgb = mix(
      finalColor.rgb,
      vec3(quantizedLuma),
      clamp(uDitherMix, 0.0, 1.0)
    );
#endif

    outputColor = mix(inputColor, finalColor, clamp(uEffectMix, 0.0, 1.0));
  }
`;

class CursorDitherEffectImpl extends Effect {
  constructor() {
    const defines = ENABLE_MAIN_VIZ_ONE_BIT_DITHER
      ? new Map([["WORK_ONE_BIT_DITHER", "1"]])
      : undefined;
    const uniforms = new Map<string, THREE.Uniform>([
      ["uResolution", new THREE.Uniform(new THREE.Vector2(1, 1))],
      [
        "uTrail",
        new THREE.Uniform(
          Array.from(
            { length: TRAIL_SLOTS },
            () => new THREE.Vector2(-10, -10),
          ),
        ),
      ],
      [
        "uTrailFlow",
        new THREE.Uniform(
          Array.from({ length: TRAIL_SLOTS }, () => new THREE.Vector2(0, 0)),
        ),
      ],
      ["uTrailStrength", new THREE.Uniform(new Float32Array(TRAIL_SLOTS))],
      ["uTrailRadius", new THREE.Uniform(new Float32Array(TRAIL_SLOTS))],
      ["uTime", new THREE.Uniform(0)],
      ["uVelocity", new THREE.Uniform(0)],
      ["uToneSteps", new THREE.Uniform(4)],
      ["uToneGamma", new THREE.Uniform(1)],
      ["uToneLift", new THREE.Uniform(0)],
      ["uEffectMix", new THREE.Uniform(1)],
      ["uDitherMix", new THREE.Uniform(1)],
    ]);

    super("CursorDitherEffect", fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      defines,
      uniforms,
    });
  }
}

type TrailSample = {
  x: number;
  y: number;
  life: number;
  flowX: number;
  flowY: number;
};

export default function WorkCursorDitherEffect({
  active,
  ditherMix = 1,
  effectMix = 1,
  theme,
}: {
  active: boolean;
  ditherMix?: number;
  effectMix?: number;
  theme: "dark" | "light";
}) {
  const { gl, size } = useThree();
  const effect = useMemo(() => new CursorDitherEffectImpl(), []);
  const pointerRef = useRef({
    x: 0.5,
    y: 0.5,
    active: false,
    velocity: 0,
    lastMoveTime: 0,
    flowX: 0,
    flowY: 0,
  });
  const trailRef = useRef<TrailSample[]>([]);

  useEffect(() => {
    const uniforms = effect.uniforms;
    uniforms.get("uResolution")?.value.set(size.width, size.height);
  }, [effect, size.height, size.width]);

  useEffect(() => {
    const toneSteps = theme === "dark" ? 6 : 4;
    const toneGamma = theme === "dark" ? 0.9 : 1;
    const toneLift = theme === "dark" ? 0.035 : 0;
    const toneStepsUniform = effect.uniforms.get("uToneSteps");
    const toneGammaUniform = effect.uniforms.get("uToneGamma");
    const toneLiftUniform = effect.uniforms.get("uToneLift");

    if (toneStepsUniform) {
      toneStepsUniform.value = toneSteps;
    }

    if (toneGammaUniform) {
      toneGammaUniform.value = toneGamma;
    }

    if (toneLiftUniform) {
      toneLiftUniform.value = toneLift;
    }
  }, [effect, theme]);

  useEffect(() => {
    const mixUniform = effect.uniforms.get("uEffectMix");

    if (!mixUniform) {
      return;
    }

    const tween = gsap.to(mixUniform, {
      value: effectMix,
      duration: 0.42,
      ease: "power2.out",
      overwrite: "auto",
    });

    return () => {
      tween.kill();
    };
  }, [effect, effectMix]);

  useEffect(() => {
    const ditherUniform = effect.uniforms.get("uDitherMix");

    if (!ditherUniform) {
      return;
    }

    const tween = gsap.to(ditherUniform, {
      value: ditherMix,
      duration: 0.42,
      ease: "power2.out",
      overwrite: "auto",
    });

    return () => {
      tween.kill();
    };
  }, [ditherMix, effect]);

  useEffect(() => {
    if (!active) {
      pointerRef.current.active = false;
      trailRef.current = [];
    }
  }, [active]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!active) {
        return;
      }

      const rect = gl.domElement.getBoundingClientRect();
      const insideX = event.clientX >= rect.left && event.clientX <= rect.right;
      const insideY = event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!insideX || !insideY || rect.width <= 0 || rect.height <= 0) {
        pointerRef.current.active = false;
        return;
      }

      const normalizedX = (event.clientX - rect.left) / rect.width;
      const normalizedY = 1 - (event.clientY - rect.top) / rect.height;
      const now = performance.now();
      const dx = normalizedX - pointerRef.current.x;
      const dy = normalizedY - pointerRef.current.y;
      const dt = Math.max(16, now - pointerRef.current.lastMoveTime || 16);
      const flowLength = Math.hypot(dx, dy);
      const flowX = flowLength > 0 ? dx / flowLength : 0;
      const flowY = flowLength > 0 ? dy / flowLength : 0;

      pointerRef.current.velocity = Math.min(
        1,
        Math.hypot(dx * size.width, dy * size.height) / dt / 1.2,
      );
      pointerRef.current.x = normalizedX;
      pointerRef.current.y = normalizedY;
      pointerRef.current.active = true;
      pointerRef.current.lastMoveTime = now;
      pointerRef.current.flowX = flowX;
      pointerRef.current.flowY = flowY;

      trailRef.current.unshift({
        x: normalizedX,
        y: normalizedY,
        life: 1,
        flowX,
        flowY,
      });
      if (trailRef.current.length > TRAIL_SLOTS - 1) {
        trailRef.current.length = TRAIL_SLOTS - 1;
      }
    };

    const handlePointerLeave = () => {
      pointerRef.current.active = false;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [active, gl.domElement, size.height, size.width]);

  useFrame((_, delta) => {
    const trailUniform = effect.uniforms.get("uTrail");
    const flowUniform = effect.uniforms.get("uTrailFlow");
    const strengthUniform = effect.uniforms.get("uTrailStrength");
    const radiusUniform = effect.uniforms.get("uTrailRadius");
    const resolutionUniform = effect.uniforms.get("uResolution");
    const timeUniform = effect.uniforms.get("uTime");
    const velocityUniform = effect.uniforms.get("uVelocity");

    if (
      !trailUniform ||
      !flowUniform ||
      !strengthUniform ||
      !radiusUniform ||
      !resolutionUniform ||
      !timeUniform ||
      !velocityUniform
    ) {
      return;
    }

    if (
      !active &&
      trailRef.current.length === 0 &&
      pointerRef.current.velocity < 0.001
    ) {
      velocityUniform.value = 0;
      return;
    }

    const trail = trailRef.current.filter((sample) => sample.life > 0.01);
    trail.forEach((sample) => {
      sample.life = Math.max(0, sample.life - delta / 0.75);
    });
    trailRef.current = trail;

    const points = trailUniform.value as THREE.Vector2[];
    const flows = flowUniform.value as THREE.Vector2[];
    const strengths = strengthUniform.value as Float32Array;
    const radii = radiusUniform.value as Float32Array;
    const baseRadius = Math.sqrt((size.width * size.height * 0.495) / Math.PI);
    const trailRadius = baseRadius * 0.82;
    resolutionUniform.value.set(size.width, size.height);
    timeUniform.value += delta;

    for (let index = 0; index < TRAIL_SLOTS; index += 1) {
      points[index].set(-10, -10);
      flows[index].set(0, 0);
      strengths[index] = 0;
      radii[index] = 0;
    }

    let slot = 0;

    if (active && pointerRef.current.active) {
      points[slot].set(pointerRef.current.x, pointerRef.current.y);
      flows[slot].set(pointerRef.current.flowX, pointerRef.current.flowY);
      strengths[slot] = 1;
      radii[slot] = baseRadius;
      slot += 1;
    }

    for (
      let index = 0;
      index < trailRef.current.length && slot < TRAIL_SLOTS;
      index += 1
    ) {
      const sample = trailRef.current[index];
      const normalizedIndex = 1 - index / Math.max(1, trailRef.current.length);
      points[slot].set(sample.x, sample.y);
      flows[slot].set(sample.flowX, sample.flowY);
      strengths[slot] = sample.life * 0.85 * normalizedIndex;
      radii[slot] = trailRadius * sample.life;
      slot += 1;
    }

    pointerRef.current.velocity *= 0.92;
    pointerRef.current.flowX *= 0.92;
    pointerRef.current.flowY *= 0.92;
    velocityUniform.value = active ? pointerRef.current.velocity : 0;
  });

  return <primitive object={effect} dispose={null} />;
}
