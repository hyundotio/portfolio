import type { ThemeMode } from "@/stores/themeStore";

type IconName = "arrow-up" | "arrow-down" | ThemeMode;

interface IconProps {
  name: IconName;
  className?: string;
}

export default function Icon({ name, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <IconPath name={name} />
      <rect fill="none" width="32" height="32" />
    </svg>
  );
}

function IconPath({ name }: { name: IconName }) {
  switch (name) {
    case "arrow-up":
      return (
        <polygon
          fill="var(--icon-fill, currentColor)"
          points="16 4 6 14 7.41 15.41 15 7.83 15 28 17 28 17 7.83 24.59 15.41 26 14 16 4"
        />
      );
    case "arrow-down":
      return (
        <polygon
          fill="var(--icon-fill, currentColor)"
          points="24.59 16.59 17 24.17 17 4 15 4 15 24.17 7.41 16.59 6 18 16 28 26 18 24.59 16.59"
        />
      );
    case "auto":
      return (
        <>
          <rect
            fill="var(--icon-fill, currentColor)"
            x="15"
            y="2"
            width="2"
            height="3"
          />
          <rect
            fill="var(--icon-fill, currentColor)"
            x="27"
            y="15"
            width="3"
            height="2"
          />
          <rect
            fill="var(--icon-fill, currentColor)"
            x="15"
            y="27"
            width="2"
            height="3"
          />
          <rect
            fill="var(--icon-fill, currentColor)"
            x="2"
            y="15"
            width="3"
            height="2"
          />
          <rect
            fill="var(--icon-fill, currentColor)"
            x="6.22"
            y="5.73"
            width="2"
            height="3"
            transform="translate(-3 7.23) rotate(-45)"
          />
          <rect
            fill="var(--icon-fill, currentColor)"
            x="23.27"
            y="6.23"
            width="3"
            height="2"
            transform="translate(2.14 19.63) rotate(-45)"
          />
          <rect
            fill="var(--icon-fill, currentColor)"
            x="23.77"
            y="23.27"
            width="2"
            height="3"
            transform="translate(-10.26 24.77) rotate(-45)"
          />
          <polygon
            fill="var(--icon-fill, currentColor)"
            points="5.47 25.13 7.59 23 9 24.42 6.88 26.54 5.47 25.13"
          />
          <path
            fill="var(--icon-fill, currentColor)"
            d="M16,8a8,8,0,1,0,8,8A8,8,0,0,0,16,8Zm0,14a6,6,0,0,1,0-12Z"
          />
        </>
      );
    case "dark":
      return (
        <path
          fill="var(--icon-fill, currentColor)"
          d="M13.5025,5.4136A15.0755,15.0755,0,0,0,25.096,23.6082a11.1134,11.1134,0,0,1-7.9749,3.3893c-.1385,0-.2782.0051-.4178,0A11.0944,11.0944,0,0,1,13.5025,5.4136M14.98,3a1.0024,1.0024,0,0,0-.1746.0156A13.0959,13.0959,0,0,0,16.63,28.9973c.1641.006.3282,0,.4909,0a13.0724,13.0724,0,0,0,10.702-5.5556,1.0094,1.0094,0,0,0-.7833-1.5644A13.08,13.08,0,0,1,15.8892,4.38,1.0149,1.0149,0,0,0,14.98,3Z"
        />
      );
    case "light":
      return (
        <>
          <rect
            fill="var(--icon-fill, currentColor)"
            x="15"
            y="2"
            width="2"
            height="4.96"
          />
          <rect
            fill="var(--icon-fill, currentColor)"
            x="21.67"
            y="6.85"
            width="4.96"
            height="2"
            transform="translate(1.52 19.37) rotate(-45)"
          />
          <rect
            fill="var(--icon-fill, currentColor)"
            x="25.04"
            y="15"
            width="4.96"
            height="2"
          />
          <rect
            fill="var(--icon-fill, currentColor)"
            x="23.15"
            y="21.67"
            width="2"
            height="4.96"
            transform="translate(-10 24.15) rotate(-45)"
          />
          <rect
            fill="var(--icon-fill, currentColor)"
            x="15"
            y="25.04"
            width="2"
            height="4.96"
          />
          <rect
            fill="var(--icon-fill, currentColor)"
            x="5.37"
            y="23.15"
            width="4.96"
            height="2"
            transform="translate(-14.77 12.63) rotate(-45)"
          />
          <rect
            fill="var(--icon-fill, currentColor)"
            x="2"
            y="15"
            width="4.96"
            height="2"
          />
          <rect
            fill="var(--icon-fill, currentColor)"
            x="6.85"
            y="5.37"
            width="2"
            height="4.96"
            transform="translate(-3.25 7.85) rotate(-45)"
          />
          <path
            fill="var(--icon-fill, currentColor)"
            d="M16,12a4,4,0,1,1-4,4,4,4,0,0,1,4-4m0-2a6,6,0,1,0,6,6,6,6,0,0,0-6-6Z"
          />
        </>
      );
  }
}
