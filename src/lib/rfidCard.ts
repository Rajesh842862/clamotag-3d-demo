import type { EventType, ScanPhase, Theme } from "./types.ts";

/** Standard CR80 card, expressed with the long and short edges independent of orientation. */
export const CR80_MM = {
  long: 85.6,
  short: 54,
  thickness: 0.76,
} as const;

/**
 * Scene-space dimensions for a portrait CR80 card.
 *
 * The reader model is 100 mm wide (0.95 scene units at its display scale), so a
 * true 54 mm card is 0.513 units wide. The card keeps the real CR80 ratio so it
 * reads as a physical badge rather than a graphic floating over the device.
 */
export const CARD_GEOMETRY = {
  width: 0.512,
  height: (0.512 * CR80_MM.long) / CR80_MM.short,
  depth: (0.512 * CR80_MM.thickness) / CR80_MM.short,
  radius: (0.512 * 3) / CR80_MM.short,
} as const;

export interface CardTransform {
  position: [number, number, number];
  rotation: [number, number, number];
}

const DARK_STAGES: Record<ScanPhase, CardTransform> = {
  // A visible glide from the right edge into a hover just off the reader.
  approaching: {
    position: [0.62, 0.385, 0.34],
    rotation: [0.012, -0.4, -0.08],
  },
  // Contact point: just in front of the reader label, parallel to its face.
  reading: {
    position: [0.082, 0.355, 0.168],
    rotation: [0.01, -0.16, 0.012],
  },
  // A restrained recoil so the result ripple reads between card and reader.
  result: {
    position: [0.15, 0.365, 0.2],
    rotation: [0.015, -0.21, -0.045],
  },
  // Exit path, then the group is hidden by the component.
  idle: {
    position: [1.52, 0.37, 0.82],
    rotation: [0.03, -0.7, -0.2],
  },
};

const LIGHT_STAGES: Record<ScanPhase, CardTransform> = {
  approaching: {
    position: [0.62, 0.305, 0.35],
    rotation: [0.012, -0.4, -0.08],
  },
  reading: {
    position: [0.082, 0.275, 0.179],
    rotation: [0.01, -0.16, 0.012],
  },
  result: {
    position: [0.15, 0.285, 0.21],
    rotation: [0.015, -0.21, -0.045],
  },
  idle: {
    position: [1.52, 0.29, 0.82],
    rotation: [0.03, -0.7, -0.2],
  },
};

/** Off-stage starting point. The card begins fully outside the frame. */
export const CARD_ENTRY: Record<Theme, CardTransform> = {
  dark: {
    position: [1.72, 0.39, 0.72],
    rotation: [0.03, -0.62, -0.16],
  },
  light: {
    position: [1.72, 0.31, 0.72],
    rotation: [0.03, -0.62, -0.16],
  },
};

const STAGES: Record<Theme, Record<ScanPhase, CardTransform>> = {
  dark: DARK_STAGES,
  light: LIGHT_STAGES,
};

export function cardTransformForPhase(phase: ScanPhase, theme: Theme = "dark"): CardTransform {
  return STAGES[theme][phase];
}

/**
 * Origin of the visual NFC field. The reader label front sits at z = 0.0122
 * model units, which is 0.116 (dark) / 0.127 (light) in scene space after the
 * display scale. The origin sits a few millimetres in front of that label,
 * just below the centre of the presented card.
 */
export const RIPPLE_ORIGIN: Record<Theme, [number, number, number]> = {
  dark: [0.082, 0.315, 0.146],
  light: [0.082, 0.235, 0.157],
};

export const RIPPLE_ROTATION: [number, number, number] = [0, -0.16, 0];

const RIPPLE_DARK = {
  idle: "#67e8f9",
  recorded: "#4ade80",
  denied: "#fb7185",
  buffered: "#fbbf24",
} as const;

const RIPPLE_LIGHT = {
  idle: "#0e7490",
  recorded: "#047857",
  denied: "#b91c1c",
  buffered: "#b45309",
} as const;

export function rippleColorForResult(result: EventType | null, theme: Theme): string {
  const palette = theme === "dark" ? RIPPLE_DARK : RIPPLE_LIGHT;
  return result ? palette[result] : palette.idle;
}

export function cardArtSize(): { width: number; height: number } {
  return {
    width: 1024,
    height: Math.round((1024 * CR80_MM.long) / CR80_MM.short),
  };
}
