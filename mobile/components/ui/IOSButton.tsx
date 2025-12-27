import React from "react";
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    Platform,
} from "react-native";
import * as Haptics from "expo-haptics";

interface IOSButtonProps {
    title: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "outline";
    size?: "default" | "large";
    icon?: React.ReactNode;
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const IOSButton: React.FC<IOSButtonProps> = ({
    title,
    onPress,
    variant = "primary",
    size = "default",
    icon,
    loading = false,
    disabled = false,
    style,
    textStyle,
}) => {
    const handlePress = async () => {
        if (disabled || loading) return;

        // Haptic feedback on native
        if (Platform.OS !== "web") {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        onPress();
    };

    const getBackgroundColor = () => {
        if (disabled) return "#C7C7CC";
        switch (variant) {
            case "primary":
                return "#007AFF";
            case "secondary":
                return "#F2F2F7";
            case "outline":
                return "transparent";
            default:
                return "#007AFF";
        }
    };

    const getTextColor = () => {
        if (disabled) return "#8E8E93";
        switch (variant) {
            case "primary":
                return "#FFFFFF";
            case "secondary":
                return "#007AFF";
            case "outline":
                return "#007AFF";
            default:
                return "#FFFFFF";
        }
    };

    const getBorderStyle = (): ViewStyle => {
        if (variant === "outline") {
            return {
                borderWidth: 2,
                borderColor: disabled ? "#C7C7CC" : "#007AFF",
            };
        }
        return {};
    };

    const buttonStyle: ViewStyle = {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: getBackgroundColor(),
        paddingVertical: size === "large" ? 18 : 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 8,
        ...getBorderStyle(),
        ...style,
    };

    const textStyleCombined: TextStyle = {
        fontSize: size === "large" ? 18 : 16,
        fontWeight: "600",
        color: getTextColor(),
        ...textStyle,
    };

    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} size="small" />
            ) : (
                <>
                    {icon}
                    <Text style={textStyleCombined}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};
