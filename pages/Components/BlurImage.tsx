import React, { useState } from 'react';
import NextImage from 'next/image';
import styles from './BlurImage.module.scss';

interface Props {
    src: string;
    alt: string;
    height?: number;
    width?: number;
    fill?: boolean;
}

const NextImageBlurred = ({ src, alt, height, width, fill, ...props}: Props) => {
  const [isReady, setIsReady] = useState(false);

  const onLoadCallback = () => {
    setIsReady(true);
  };

  return (
    <NextImage
        alt={alt}
        src={src}
        width={width}
        height={height}
        fill={fill}
        {...props}
        className={`${styles['image']} ${
            isReady ? styles['ready'] : styles['not-ready']
        }`}
        onLoadingComplete={onLoadCallback}
    />
  );
};

export default NextImageBlurred;