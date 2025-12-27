import React from "react";
import { View, ViewStyle, useColorScheme } from "react-native";

interface IOSCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: "default" | "elevated" | "outlined";
}

export const IOSCard: React.FC<IOSCardProps> = ({
    children,
    style,
    variant = "default",
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    const getBackgroundColor = () => {
        return isDark ? "#2C2C2E" : "#FFFFFF";
    };

    const getVariantStyle = (): ViewStyle => {
        switch (variant) {
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

    return <View style={cardStyle}>{children}</View>;
};
