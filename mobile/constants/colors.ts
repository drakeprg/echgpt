// iOS-inspired color palette
export const colors = {
    // Primary colors
    primary: {
        DEFAULT: "#007AFF",
        light: "#3395FF",
        dark: "#0055CC",
    },
    // App accent
    secondary: {
        DEFAULT: "#4ECDC4",
        light: "#7EDED7",
        dark: "#2EB5AB",
    },
    // System colors
    success: "#34C759",
    warning: "#FF9500",
    error: "#FF3B30",
    // Background colors
    background: {
        light: "#F2F2F7",
        dark: "#1C1C1E",
        card: {
            light: "#FFFFFF",
            dark: "#2C2C2E",
        },
    },
    // Text colors
    text: {
        primary: {
            light: "#1C1C1E",
            dark: "#FFFFFF",
        },
        secondary: {
            light: "#8E8E93",
            dark: "#98989D",
        },
        tertiary: {
            light: "#AEAEB2",
            dark: "#636366",
        },
    },
    // Disease-specific colors
    disease: {
        candidiasis: "#FF6B6B",
        tinea_corporis: "#4ECDC4",
        tinea_pedis: "#45B7D1",
        tinea_versicolor: "#96CEB4",
    },
} as const;

// Get color based on color scheme
export const getColor = (
    colorPath: string,
    isDark: boolean
): string => {
    const parts = colorPath.split(".");
    let result: any = colors;

    for (const part of parts) {
        if (result[part] === undefined) {
            // Try to get default
            if (typeof result === "object" && result.DEFAULT) {
                return result.DEFAULT;
            }
            return "#000000";
        }
        result = result[part];
    }

    if (typeof result === "object") {
        if (isDark && result.dark) return result.dark;
        if (!isDark && result.light) return result.light;
        if (result.DEFAULT) return result.DEFAULT;
    }

    return result;
};
