// Minimalist SVG arrow icon. Pure black/white, thin stroke.
import type { Direction } from '@/lib/game/types';

interface Props {
  direction: Direction;
  size?: number;
  className?: string;
}

export function ArrowGlyph({ direction, size = 28, className }: Props) {
  // All arrows point "up" in their local coordinate system; we rotate via CSS.
  const rotation: Record<Direction, number> = {
    up: 0,
    right: 90,
    down: 180,
    left: 270,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ transform: `rotate(${rotation[direction]}deg)` }}
      aria-hidden
    >
      <path
        d="M12 3 L12 21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6 9 L12 3 L18 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
