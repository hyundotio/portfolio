"use client";

import { useEffect, useRef, useState } from "react";
import Image, { ImageProps } from "next/image";
import styles from "@/Components/PixelImage.module.scss";

// Extend Next Image props, remove onLoad as we control it internally
interface PixelImageProps extends Omit<ImageProps, "onLoad" | "className"> {
  className?: string;
  duration?: number;
}

const PixelImage = ({
  src,
  alt,
  className,
  duration = 1000,
  ...imageProps // Capture all other Next/Image props (width, height, priority, etc.)
}: PixelImageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnimating, setIsAnimating] = useState(true);

  // We keep a reference to the animation frame to cancel it on unmount
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);

  const animate = (
    timestamp: number,
    img: HTMLImageElement,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
  ) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);

    // --- Your Stage Logic ---
    let factor = 1;
    if (progress < 0.33) {
      factor = 0.03;
    } else if (progress < 0.66) {
      factor = 0.1;
    } else {
      factor = 1.0;
    }

    // 1. Clear & Config
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    // 2. Calculate dimensions
    const w = Math.floor(canvas.width * factor);
    const h = Math.floor(canvas.height * factor);

    // 3. Draw: Downsample (draw small) -> Upsample (draw back to full)
    // We use the 'img' element directly. This is the optimized image from Next.js
    ctx.drawImage(img, 0, 0, w, h);
    ctx.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);

    if (progress < 1) {
      requestRef.current = requestAnimationFrame((t) =>
        animate(t, img, ctx, canvas),
      );
    } else {
      // Animation Complete: Unmount canvas, show real image
      setIsAnimating(false);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set internal resolution to match the loaded image's natural resolution
    // This ensures 1:1 pixel mapping for sharpness
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Start the animation loop
    requestRef.current = requestAnimationFrame((t) =>
      animate(t, img, ctx, canvas),
    );
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className={`${className ?? ""}`}>
      <div className={`${styles.container}`}>
        {/* The Canvas sits on top. 
        We only render it while animating to save resources after load. 
      */}
        {isAnimating && (
          <canvas
            ref={canvasRef}
            height={imageProps.height}
            width={imageProps.width}
            className={styles.canvas}
          />
        )}

        {/* The Actual Next Image. 
        It drives the layout size. 
        It is invisible (opacity 0) until animation is done.
      */}
        <Image
          src={src}
          alt={alt}
          className={isAnimating ? styles["hidden-image"] : styles["visible-image"]}
          onLoad={handleImageLoad}
          {...imageProps}
        />
      </div>
    </div>
  );
};

PixelImage.displayName = "PixelImage";
export default PixelImage;
