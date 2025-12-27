import React from "react";
import { View, ViewStyle, useColorScheme, Platform } from "react-native";
import { BlurView } from "expo-blur";

interface IOSCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: "default" | "elevated" | "outlined" | "glass";
}

export const IOSCard: React.FC<IOSCardProps> = ({
    children,
    style,
    variant = "default",
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const isWeb = Platform.OS === "web";

    const getBackgroundColor = () => {
        if (variant === "glass") {
            return isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.65)";
        }
        return isDark ? "#2C2C2E" : "#FFFFFF";
    };

    const getVariantStyle = (): ViewStyle => {
        switch (variant) {
            case "glass":
                return {
                    borderWidth: 1.5,
                    borderColor: isDark
                        ? "rgba(255, 255, 255, 0.12)"
                        : "rgba(255, 255, 255, 0.9)",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: isDark ? 0.4 : 0.1,
                    shadowRadius: 24,
                };
            case "elevated":
                return {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.3 : 0.12,
                    shadowRadius: 12,
                    elevation: 5,
                };
            case "outlined":
                return {
                    borderWidth: 1,
                    borderColor: isDark ? "#38383A" : "#E5E5EA",
                };
            default:
                return {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0.2 : 0.08,
                    shadowRadius: 8,
                    elevation: 2,
                };
        }
    };

    const cardStyle: ViewStyle = {
        backgroundColor: getBackgroundColor(),
        borderRadius: 16,
        overflow: "hidden",
        ...getVariantStyle(),
        ...style,
    };

    // For glass variant on web, add backdrop-filter
    if (variant === "glass" && isWeb) {
        const webGlassStyle = {
            ...cardStyle,
            backdropFilter: "blur(40px) saturate(180%) brightness(1.1)",
            WebkitBackdropFilter: "blur(40px) saturate(180%) brightness(1.1)",
        };
        return <View style={webGlassStyle as any}>{children}</View>;
    }

    // For glass variant on native iOS/Android, use BlurView
    if (variant === "glass") {
        return (
            <BlurView
                intensity={40}
                tint={isDark ? "dark" : "light"}
                style={cardStyle}
            >
                {children}
            </BlurView>
        );
    }

    return <View style={cardStyle}>{children}</View>;
};
