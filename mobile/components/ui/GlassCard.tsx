import React from "react";
import {
    View,
    StyleSheet,
    Platform,
    ViewStyle,
    useColorScheme,
} from "react-native";
import { BlurView } from "expo-blur";

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    intensity?: number;
    tint?: "light" | "dark" | "default";
    borderRadius?: number;
}

/**
 * iOS 26 "Liquid Glass" style card component
 * Features translucent background with blur, subtle borders, and depth
 */
export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    style,
    intensity = 80,
    tint,
    borderRadius = 24,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const effectiveTint = tint || (isDark ? "dark" : "light");

    const glassStyle: ViewStyle = {
        borderRadius,
        overflow: "hidden",
        // Liquid glass border effect
        borderWidth: 1,
        borderColor: isDark
            ? "rgba(255, 255, 255, 0.15)"
            : "rgba(255, 255, 255, 0.6)",
        // Shadow for depth
        shadowColor: isDark ? "#000" : "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDark ? 0.4 : 0.15,
        shadowRadius: 24,
        elevation: 8,
    };

    // For web, use CSS backdrop-filter
    if (Platform.OS === "web") {
        return (
            <View
                style={[
                    glassStyle,
                    {
                        backgroundColor: isDark
                            ? "rgba(30, 30, 30, 0.7)"
                            : "rgba(255, 255, 255, 0.7)",
                        // @ts-ignore - web-specific style
                        backdropFilter: `blur(${intensity}px) saturate(180%)`,
                        WebkitBackdropFilter: `blur(${intensity}px) saturate(180%)`,
                    },
                    style,
                ]}
            >
                {children}
            </View>
        );
    }

    // For native, use BlurView
    return (
        <View style={[glassStyle, style]}>
            <BlurView
                intensity={intensity}
                tint={effectiveTint}
                style={StyleSheet.absoluteFill}
            />
            <View style={{ zIndex: 1 }}>{children}</View>
        </View>
    );
};

interface GlassButtonProps {
    children: React.ReactNode;
    onPress: () => void;
    style?: ViewStyle;
    variant?: "primary" | "secondary" | "subtle";
}

/**
 * iOS 26 Liquid Glass button with translucent background
 */
export const GlassButton: React.FC<GlassButtonProps> = ({
    children,
    onPress,
    style,
    variant = "secondary",
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    const getBackgroundColor = () => {
        switch (variant) {
            case "primary":
                return "rgba(0, 122, 255, 0.85)";
            case "secondary":
                return isDark
                    ? "rgba(255, 255, 255, 0.12)"
                    : "rgba(255, 255, 255, 0.8)";
            case "subtle":
                return isDark
                    ? "rgba(255, 255, 255, 0.06)"
                    : "rgba(0, 0, 0, 0.04)";
        }
    };

    const getBorderColor = () => {
        switch (variant) {
            case "primary":
                return "rgba(255, 255, 255, 0.3)";
            case "secondary":
                return isDark
                    ? "rgba(255, 255, 255, 0.15)"
                    : "rgba(255, 255, 255, 0.9)";
            case "subtle":
                return isDark
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(0, 0, 0, 0.05)";
        }
    };

    if (Platform.OS === "web") {
        return (
            <View
                // @ts-ignore
                onClick={onPress}
                style={[
                    {
                        borderRadius: 16,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: getBorderColor(),
                        backgroundColor: getBackgroundColor(),
                        // @ts-ignore
                        backdropFilter: "blur(20px) saturate(180%)",
                        WebkitBackdropFilter: "blur(20px) saturate(180%)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                    },
                    style,
                ]}
            >
                {children}
            </View>
        );
    }

    return (
        <View
            style={[
                {
                    borderRadius: 16,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: getBorderColor(),
                },
                style,
            ]}
            onTouchEnd={onPress}
        >
            <BlurView
                intensity={40}
                tint={isDark ? "dark" : "light"}
                style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: getBackgroundColor() },
                ]}
            />
            <View style={{ zIndex: 1 }}>{children}</View>
        </View>
    );
};
