import React from "react";
import { View, Text, useColorScheme } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface ConfidenceRingProps {
    confidence: number; // 0 to 1
    size?: number;
    strokeWidth?: number;
    color?: string;
}

export const ConfidenceRing: React.FC<ConfidenceRingProps> = ({
    confidence,
    size = 56,
    strokeWidth = 6,
    color,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = confidence * circumference;

    // Color based on confidence level
    const getConfidenceColor = () => {
        if (color) return color;
        if (confidence >= 0.8) return "#34C759"; // Green - high
        if (confidence >= 0.6) return "#007AFF"; // Blue - medium
        if (confidence >= 0.4) return "#FF9500"; // Orange - low-medium
        return "#FF3B30"; // Red - low
    };

    const confidenceColor = getConfidenceColor();
    const backgroundColor = isDark ? "#38383A" : "#E5E5EA";
    const textColor = isDark ? "#FFFFFF" : "#1C1C1E";

    const percentage = Math.round(confidence * 100);

    return (
        <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
            <Svg width={size} height={size} style={{ position: "absolute" }}>
                {/* Background circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={backgroundColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Progress circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={confidenceColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={`${progress} ${circumference - progress}`}
                    strokeDashoffset={circumference / 4}
                    strokeLinecap="round"
                />
            </Svg>
            <Text
                style={{
                    fontSize: size * 0.22,
                    fontWeight: "700",
                    color: textColor,
                }}
            >
                {percentage}%
            </Text>
        </View>
    );
};
