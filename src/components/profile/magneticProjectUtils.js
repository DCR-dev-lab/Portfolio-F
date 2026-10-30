const GAP = 12;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const smooth = (factor) => factor * factor * (3 - 2 * factor);

export const computeLayout = (width, count) => {
    const closedWidth = clamp((Math.min(width, 1120) - (count - 1) * GAP - 222) / count, 72, 220);
    const hoverWidth = closedWidth + Math.min(closedWidth * 0.9, 120);
    const openNeighborWidth = Math.max(56, Math.min(closedWidth, 84));
    const openWidth = clamp(width - (count - 1) * (openNeighborWidth + GAP), 340, 660);
    return {
        cw: closedWidth,
        hw: hoverWidth,
        cwOpen: openNeighborWidth,
        ow: openWidth,
        influence: closedWidth * 1.9,
    };
};

export const magneticTargets = (x, width, count, layout) => {
    const total = count * layout.cw + (count - 1) * GAP;
    const startX = (width - total) / 2;
    return Array.from({ length: count }, (_, index) => {
        const center = startX + index * (layout.cw + GAP) + layout.cw / 2;
        return smooth(Math.max(0, 1 - Math.abs(x - center) / layout.influence));
    });
};

export { GAP, clamp, smooth };
