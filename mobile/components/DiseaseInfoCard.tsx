import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    useColorScheme,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { IOSCard } from "./ui/IOSCard";
import { ConfidenceRing } from "./ui/ConfidenceRing";
import { getDiseaseInfo, DiseaseInfo } from "../constants/diseaseInfo";

interface DiseaseInfoCardProps {
    diseaseId: string;
    confidence: number;
    isExpanded?: boolean;
    onPress?: () => void;
}

export const DiseaseInfoCard: React.FC<DiseaseInfoCardProps> = ({
    diseaseId,
    confidence,
    isExpanded = false,
    onPress,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const info = getDiseaseInfo(diseaseId);

    if (!info) {
        return (
            <IOSCard style={{ padding: 16 }}>
                <Text style={{ color: isDark ? "#FFFFFF" : "#1C1C1E" }}>
                    Unknown condition: {diseaseId}
                </Text>
            </IOSCard>
        );
    }

    const diseaseColor = info.color;
    const textColor = isDark ? "#FFFFFF" : "#1C1C1E";
    const secondaryTextColor = isDark ? "#98989D" : "#8E8E93";

    const Section = ({
        icon,
        title,
        items,
        color,
    }: {
        icon: keyof typeof Ionicons.glyphMap;
        title: string;
        items: string[];
        color: string;
    }) => (
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <Ionicons name={icon} size={20} color={color} />
                <Text
                    style={{
                        marginLeft: 8,
                        fontSize: 15,
                        fontWeight: "600",
                        color: textColor,
                    }}
                >
                    {title}
                </Text>
            </View>
            {items.map((item, index) => (
                <View
                    key={index}
                    style={{ flexDirection: "row", marginBottom: 8, paddingLeft: 4 }}
                >
                    <View
                        style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: color,
                            marginTop: 7,
                            marginRight: 12,
                            opacity: 0.6,
                        }}
                    />
                    <Text
                        style={{
                            flex: 1,
                            fontSize: 15,
                            color: textColor,
                            lineHeight: 20,
                        }}
                    >
                        {item}
                    </Text>
                </View>
            ))}
        </View>
    );

    return (
        <TouchableOpacity
            activeOpacity={onPress ? 0.7 : 1}
            onPress={onPress}
            disabled={!onPress}
        >
            <IOSCard
                variant="elevated"
                style={{
                    borderWidth: 2,
                    borderColor: diseaseColor + "4D",
                }}
            >
                {/* Header */}
                <View
                    style={{
                        flexDirection: "row",
                        padding: 16,
                        backgroundColor: diseaseColor + "1A",
                        alignItems: "center",
                    }}
                >
                    <View
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            backgroundColor: diseaseColor + "33",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Ionicons
                            name="medical"
                            size={28}
                            color={diseaseColor}
                        />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text
                            style={{
                                fontSize: 17,
                                fontWeight: "600",
                                color: textColor,
                            }}
                        >
                            {info.name}
                        </Text>
                        <Text style={{ fontSize: 13, color: secondaryTextColor }}>
                            Confidence: {(confidence * 100).toFixed(1)}%
                        </Text>
                    </View>
                    <ConfidenceRing confidence={confidence} size={56} color={diseaseColor} />
                </View>

                {/* Description */}
                <View style={{ padding: 16 }}>
                    <Text
                        style={{
                            fontSize: 15,
                            lineHeight: 22,
                            color: secondaryTextColor,
                        }}
                    >
                        {info.description}
                    </Text>
                </View>

                {isExpanded && (
                    <>
                        <View
                            style={{
                                height: 1,
                                backgroundColor: isDark ? "#38383A" : "#E5E5EA",
                            }}
                        />
                        <Section
                            icon="warning-outline"
                            title="Common Symptoms"
                            items={info.symptoms}
                            color={diseaseColor}
                        />
                        <View
                            style={{
                                height: 1,
                                backgroundColor: isDark ? "#38383A" : "#E5E5EA",
                            }}
                        />
                        <Section
                            icon="medkit-outline"
                            title="Treatment"
                            items={info.treatment}
                            color={diseaseColor}
                        />
                        <View
                            style={{
                                height: 1,
                                backgroundColor: isDark ? "#38383A" : "#E5E5EA",
                            }}
                        />
                        <Section
                            icon="alert-circle-outline"
                            title="When to See a Doctor"
                            items={info.whenToSeeDoctor}
                            color="#FF3B30"
                        />
                    </>
                )}
            </IOSCard>
        </TouchableOpacity>
    );
};
