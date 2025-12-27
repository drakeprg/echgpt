import React from "react";
import { View, ViewStyle, useColorScheme, Platform, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

interface LiquidGlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: "default" | "elevated" | "primary" | "warning";
    intensity?: number;
    borderRadius?: number;
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
    children,
    style,
    variant = "default",
    intensity = 40,
    borderRadius = 24,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const isWeb = Platform.OS === "web";

    const getGlassStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            borderRadius,
            overflow: "hidden",
        };

        switch (variant) {
            case "primary":
                return {
                    ...baseStyle,
                    backgroundColor: "rgba(0, 122, 255, 0.9)",
                    borderWidth: 1.5,
                    borderColor: "rgba(255, 255, 255, 0.25)",
                    shadowColor: "#007AFF",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.4,
                    shadowRadius: 20,
                };
            case "warning":
                return {
                    ...baseStyle,
                    backgroundColor: isDark
                        ? "rgba(255, 214, 10, 0.1)"
                        : "rgba(255, 204, 0, 0.15)",
                    borderWidth: 1.5,
                    borderColor: isDark
                        ? "rgba(255, 214, 10, 0.25)"
                        : "rgba(255, 204, 0, 0.4)",
                    shadowColor: "#FFD60A",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 12,
                };
            case "elevated":
                return {
                    ...baseStyle,
                    backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(255, 255, 255, 0.7)",
                    borderWidth: 1.5,
                    borderColor: isDark
                        ? "rgba(255, 255, 255, 0.12)"
                        : "rgba(255, 255, 255, 0.9)",
                    shadowColor: isDark ? "#000" : "#000",
                    shadowOffset: { width: 0, height: 12 },
                    shadowOpacity: isDark ? 0.5 : 0.12,
                    shadowRadius: 32,
                };
            default:
                return {
                    ...baseStyle,
                    backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.06)"
                        : "rgba(255, 255, 255, 0.65)",
                    borderWidth: 1.5,
                    borderColor: isDark
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(255, 255, 255, 0.8)",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: isDark ? 0.4 : 0.1,
                    shadowRadius: 24,
                };
        }
    };

    const glassStyle = getGlassStyle();

    // On web, we use CSS backdrop-filter for true glass effect
    if (isWeb) {
        const webStyle: ViewStyle = {
            ...glassStyle,
            ...style,
        };

        // Access web-specific styles
        const webSpecificStyles = {
            backdropFilter: `blur(${intensity}px) saturate(180%) brightness(1.1)`,
            WebkitBackdropFilter: `blur(${intensity}px) saturate(180%) brightness(1.1)`,
        };

        return (
            <View style={[webStyle, webSpecificStyles as any]}>
                {children}
            </View>
        );
    }

    // On native iOS/Android, use BlurView for blur effect
    if (variant === "default" || variant === "elevated") {
        return (
            <BlurView
                intensity={intensity}
                tint={isDark ? "dark" : "light"}
                style={[glassStyle, style]}
            >
                {children}
            </BlurView>
        );
    }

    // For primary and warning variants, just use a regular View
    return (
        <View style={[glassStyle, style]}>
            {children}
        </View>
    );
};

// Pre-defined glass styles for inline use
export const getGlassStyle = (isDark: boolean, variant: "default" | "elevated" = "default") => ({
    backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(255, 255, 255, 0.7)",
    borderWidth: 1.5,
    borderColor: isDark
        ? "rgba(255, 255, 255, 0.12)"
        : "rgba(255, 255, 255, 0.9)",
    shadowColor: isDark ? "#000" : "#000",
    shadowOffset: { width: 0, height: variant === "elevated" ? 12 : 8 },
    shadowOpacity: isDark ? (variant === "elevated" ? 0.5 : 0.4) : (variant === "elevated" ? 0.12 : 0.1),
    shadowRadius: variant === "elevated" ? 32 : 24,
});
