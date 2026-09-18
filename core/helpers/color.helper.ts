function clamp255(value: number): number {
    return Math.min(255, Math.max(0, Math.round(value)));
}

function hexToRgb(hex: string): [number, number, number] {
    const normalized = hex.replace("#", "");
    const full =
        normalized.length === 3
            ? normalized
                  .split("")
                  .map((c) => c + c)
                  .join("")
            : normalized;

    const int = parseInt(full, 16);

    return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b].map((c) => clamp255(c).toString(16).padStart(2, "0")).join("")}`;
}

// mix a color with white or black depending on the sign of percent.
// so we don't need to hardcode more hex values in the emails, everything
// comes from brand.ts
export function shade(hex: string, percent: number): string {
    const [r, g, b] = hexToRgb(hex);
    const target = percent < 0 ? 0 : 255;
    const ratio = Math.min(1, Math.abs(percent) / 100);

    return rgbToHex(r + (target - r) * ratio, g + (target - g) * ratio, b + (target - b) * ratio);
}

export function withAlpha(hex: string, alpha: number): string {
    const [r, g, b] = hexToRgb(hex);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
