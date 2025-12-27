import React from "react";
import {
    View,
    Text,
    ScrollView,
    Image,
    useColorScheme,
    Platform,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { IOSButton } from "../components/ui/IOSButton";
import { IOSCard } from "../components/ui/IOSCard";
import { DiseaseInfoCard } from "../components/DiseaseInfoCard";
import { useAppStore } from "../stores/appStore";
import { getDiseaseInfo } from "../constants/diseaseInfo";

const MAX_WIDTH = 480;

export default function ResultScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const { width } = Dimensions.get("window");
    const isWeb = Platform.OS === "web";

    const { selectedImageUri, analysisResults, resetAnalysis } = useAppStore();

    const topResult = analysisResults?.[0];
    const otherResults = analysisResults?.slice(1) || [];
    const highConfidence = topResult && topResult.confidence >= 0.7;

    const handleAnalyzeAnother = () => {
        resetAnalysis();
        router.replace("/home");
    };

    const textColor = isDark ? "#FFFFFF" : "#1C1C1E";
    const secondaryTextColor = isDark ? "#98989D" : "#8E8E93";
    const backgroundColor = isDark ? "#1C1C1E" : "#F2F2F7";
    const cardBg = isDark ? "#2C2C2E" : "#FFFFFF";

    const containerStyle = {
        flex: 1,
        backgroundColor,
        alignItems: "center" as const,
    };

    const contentStyle = {
        width: isWeb ? Math.min(width, MAX_WIDTH) : width,
    };

    return (
        <SafeAreaView style={containerStyle} edges={["top"]}>
            <ScrollView
                style={contentStyle}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                    }}
                >
                    <IOSButton
                        title=""
                        onPress={() => router.back()}
                        variant="secondary"
                        icon={<Ionicons name="chevron-back" size={24} color="#007AFF" />}
                        style={{ paddingHorizontal: 12, paddingVertical: 8 }}
                    />
                    <Text
                        style={{
                            flex: 1,
                            fontSize: 17,
                            fontWeight: "600",
                            color: textColor,
                            textAlign: "center",
                            marginRight: 40,
                        }}
                    >
                        Analysis Results
                    </Text>
                </View>

                {/* Image Preview */}
                {selectedImageUri && (
                    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                        <IOSCard variant="elevated">
                            <Image
                                source={{ uri: selectedImageUri }}
                                style={{
                                    width: "100%",
                                    height: 250,
                                    borderRadius: 16,
                                }}
                                resizeMode="cover"
                            />
                        </IOSCard>
                    </View>
                )}

                {/* Confidence Indicator */}
                {topResult && (
                    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                        <View
                            style={{
                                flexDirection: "row",
                                padding: 16,
                                backgroundColor: highConfidence
                                    ? (isDark ? "#0A3622" : "#D1FAE5")
                                    : (isDark ? "#3B1818" : "#FEE2E2"),
                                borderRadius: 12,
                                alignItems: "center",
                            }}
                        >
                            <Ionicons
                                name={highConfidence ? "checkmark-circle" : "warning"}
                                size={24}
                                color={highConfidence ? "#34C759" : "#FF3B30"}
                            />
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <Text
                                    style={{
                                        fontWeight: "600",
                                        color: highConfidence
                                            ? (isDark ? "#34C759" : "#065F46")
                                            : (isDark ? "#FF6B6B" : "#991B1B"),
                                    }}
                                >
                                    {highConfidence
                                        ? "High Confidence Result"
                                        : "Low Confidence Result"}
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 12,
                                        color: highConfidence
                                            ? (isDark ? "#6EE7B7" : "#047857")
                                            : (isDark ? "#FCA5A5" : "#DC2626"),
                                        marginTop: 2,
                                    }}
                                >
                                    {highConfidence
                                        ? "The AI is fairly confident about this prediction."
                                        : "Consider retaking the photo with better lighting."}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Top Prediction */}
                {topResult && (
                    <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
                        <Text
                            style={{
                                fontSize: 15,
                                fontWeight: "600",
                                color: textColor,
                                marginBottom: 12,
                            }}
                        >
                            Top Prediction
                        </Text>
                        <DiseaseInfoCard
                            diseaseId={topResult.label}
                            confidence={topResult.confidence}
                            isExpanded={true}
                        />
                    </View>
                )}

                {/* Other Possibilities */}
                {otherResults.length > 0 && (
                    <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
                        <Text
                            style={{
                                fontSize: 15,
                                fontWeight: "600",
                                color: textColor,
                                marginBottom: 12,
                            }}
                        >
                            Other Possibilities
                        </Text>
                        {otherResults.map((result, index) => {
                            const info = getDiseaseInfo(result.label);
                            return (
                                <View
                                    key={result.label}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        padding: 14,
                                        backgroundColor: cardBg,
                                        borderRadius: 12,
                                        marginBottom: 8,
                                    }}
                                >
                                    <Text style={{ flex: 1, color: textColor, fontWeight: "500" }}>
                                        {info?.name || result.label}
                                    </Text>
                                    <View
                                        style={{
                                            paddingHorizontal: 12,
                                            paddingVertical: 6,
                                            backgroundColor: isDark ? "#3A3A3C" : "#F2F2F7",
                                            borderRadius: 20,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 12,
                                                fontWeight: "600",
                                                color: secondaryTextColor,
                                            }}
                                        >
                                            {(result.confidence * 100).toFixed(1)}%
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Disclaimer */}
                <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
                    <View
                        style={{
                            flexDirection: "row",
                            padding: 16,
                            backgroundColor: isDark ? "#2C2C2E" : "#F8F8F8",
                            borderRadius: 12,
                        }}
                    >
                        <Ionicons
                            name="information-circle-outline"
                            size={20}
                            color={secondaryTextColor}
                        />
                        <Text
                            style={{
                                flex: 1,
                                marginLeft: 12,
                                fontSize: 12,
                                color: secondaryTextColor,
                                lineHeight: 18,
                            }}
                        >
                            This analysis is for educational purposes only and should not replace
                            professional medical advice. Please consult a dermatologist for proper
                            diagnosis and treatment.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action */}
            <View
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: 16,
                    paddingBottom: Platform.OS === "ios" ? 32 : 16,
                    backgroundColor,
                    alignItems: "center",
                }}
            >
                <View style={{ width: isWeb ? Math.min(width - 32, MAX_WIDTH - 32) : "100%" }}>
                    <IOSButton
                        title="Analyze Another Image"
                        onPress={handleAnalyzeAnother}
                        variant="primary"
                        size="large"
                        icon={<Ionicons name="camera" size={22} color="#FFFFFF" />}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}
