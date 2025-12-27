import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    useColorScheme,
    Platform,
    Dimensions,
    ActivityIndicator,
    TouchableOpacity,
    Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAppStore } from "../stores/appStore";

const MAX_WIDTH = 480;

export default function HomeScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const { width, height } = Dimensions.get("window");
    const isWeb = Platform.OS === "web";

    const {
        isAnalyzing,
        setSelectedImage,
        setAnalyzing,
        setAnalysisResults,
        setModelReady,
    } = useAppStore();

    const [initializing, setInitializing] = useState(true);
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        const initModel = async () => {
            await new Promise((resolve) => setTimeout(resolve, 800));
            setModelReady(true);
            setInitializing(false);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }).start();
        };
        initModel();
    }, []);

    const pickImage = async (source: "camera" | "gallery") => {
        try {
            let result: ImagePicker.ImagePickerResult;

            if (source === "camera") {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== "granted") {
                    alert("Camera permission is required to take photos.");
                    return;
                }
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: "images",
                    quality: 0.85,
                    allowsEditing: true,
                    aspect: [1, 1],
                });
            } else {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== "granted") {
                    alert("Photo library permission is required to select photos.");
                    return;
                }
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: "images",
                    quality: 0.85,
                    allowsEditing: true,
                    aspect: [1, 1],
                });
            }

            if (!result.canceled && result.assets[0]) {
                const imageUri = result.assets[0].uri;
                setSelectedImage(imageUri);
                setAnalyzing(true);
                await new Promise((resolve) => setTimeout(resolve, 2000));
                const mockResults = [
                    { label: "candidiasis", confidence: 0.78 },
                    { label: "tinea_corporis", confidence: 0.15 },
                    { label: "tinea_pedis", confidence: 0.05 },
                    { label: "tinea_versicolor", confidence: 0.02 },
                ];
                setAnalysisResults(mockResults);
                router.push("/result");
            }
        } catch (error) {
            console.error("Error picking image:", error);
            setAnalyzing(false);
        }
    };

    const textColor = isDark ? "#FFFFFF" : "#1C1C1E";
    const secondaryTextColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)";

    const contentWidth = isWeb ? Math.min(width, MAX_WIDTH) : width;

    // iOS 26 gradient colors
    const gradientColors: readonly [string, string, ...string[]] = isDark
        ? ["#0A1628", "#0F2847", "#162D50", "#0A1628"]
        : ["#F0F7FF", "#E0EFFF", "#D4E8FF", "#F0F7FF"];

    // Glass card style
    const glassStyle = {
        backgroundColor: isDark
            ? "rgba(255, 255, 255, 0.08)"
            : "rgba(255, 255, 255, 0.7)",
        borderWidth: 1.5,
        borderColor: isDark
            ? "rgba(255, 255, 255, 0.12)"
            : "rgba(255, 255, 255, 0.9)",
        shadowColor: isDark ? "#000" : "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDark ? 0.4 : 0.1,
        shadowRadius: 24,
    };

    if (initializing || isAnalyzing) {
        return (
            <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
                <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <View
                        style={[
                            glassStyle,
                            {
                                width: 120,
                                height: 120,
                                borderRadius: 30,
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 24,
                            },
                        ]}
                    >
                        <Text style={{ fontSize: 50 }}>🍄</Text>
                    </View>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={{ marginTop: 16, color: secondaryTextColor, fontSize: 16, fontWeight: "500" }}>
                        {initializing ? "Loading..." : "Analyzing..."}
                    </Text>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    // Modern Glass Action Button
    const GlassActionButton = ({
        icon,
        title,
        subtitle,
        onPress,
        primary = false,
    }: {
        icon: keyof typeof Ionicons.glyphMap;
        title: string;
        subtitle: string;
        onPress: () => void;
        primary?: boolean;
    }) => (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: primary
                    ? "rgba(0, 122, 255, 0.9)"
                    : (isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.75)"),
                padding: 20,
                borderRadius: 20,
                marginBottom: 12,
                borderWidth: 1.5,
                borderColor: primary
                    ? "rgba(255, 255, 255, 0.25)"
                    : (isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.9)"),
                shadowColor: primary ? "#007AFF" : "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: primary ? 0.35 : (isDark ? 0.3 : 0.08),
                shadowRadius: 16,
            }}
        >
            <View
                style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    backgroundColor: primary
                        ? "rgba(255, 255, 255, 0.2)"
                        : (isDark ? "rgba(0, 122, 255, 0.15)" : "rgba(0, 122, 255, 0.1)"),
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Ionicons
                    name={icon}
                    size={26}
                    color={primary ? "#FFFFFF" : "#007AFF"}
                />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
                <Text
                    style={{
                        fontSize: 17,
                        fontWeight: "600",
                        color: primary ? "#FFFFFF" : textColor,
                    }}
                >
                    {title}
                </Text>
                <Text
                    style={{
                        fontSize: 13,
                        color: primary ? "rgba(255, 255, 255, 0.7)" : secondaryTextColor,
                        marginTop: 3,
                    }}
                >
                    {subtitle}
                </Text>
            </View>
            <Ionicons
                name="chevron-forward"
                size={22}
                color={primary ? "rgba(255, 255, 255, 0.6)" : (isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)")}
            />
        </TouchableOpacity>
    );

    return (
        <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
            {/* Decorative glass orbs */}
            <View
                style={{
                    position: "absolute",
                    top: height * 0.05,
                    right: -50,
                    width: 180,
                    height: 180,
                    borderRadius: 90,
                    backgroundColor: isDark ? "rgba(0, 122, 255, 0.1)" : "rgba(0, 122, 255, 0.08)",
                }}
            />
            <View
                style={{
                    position: "absolute",
                    bottom: height * 0.15,
                    left: -40,
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    backgroundColor: isDark ? "rgba(88, 86, 214, 0.12)" : "rgba(88, 86, 214, 0.06)",
                }}
            />

            <SafeAreaView style={{ flex: 1, alignItems: "center" }}>
                <Animated.View
                    style={{
                        flex: 1,
                        width: contentWidth,
                        paddingHorizontal: 24,
                        opacity: fadeAnim,
                    }}
                >
                    {/* Header */}
                    <View style={{ marginTop: Platform.OS === "web" ? 16 : 32, marginBottom: 28 }}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <View
                                style={[
                                    glassStyle,
                                    {
                                        width: 56,
                                        height: 56,
                                        borderRadius: 16,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginRight: 14,
                                    },
                                ]}
                            >
                                <Text style={{ fontSize: 32 }}>🍄</Text>
                            </View>
                            <View>
                                <Text
                                    style={{
                                        fontSize: 28,
                                        fontWeight: "800",
                                        color: textColor,
                                        letterSpacing: -0.5,
                                    }}
                                >
                                    FungiGPT
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 14,
                                        color: secondaryTextColor,
                                        marginTop: 2,
                                    }}
                                >
                                    AI Skin Analyzer
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Hero Card - Liquid Glass */}
                    <View
                        style={[
                            glassStyle,
                            {
                                borderRadius: 28,
                                padding: 28,
                                marginBottom: 24,
                            },
                        ]}
                    >
                        <View style={{ alignItems: "center" }}>
                            <View
                                style={{
                                    width: 90,
                                    height: 90,
                                    borderRadius: 24,
                                    backgroundColor: isDark ? "rgba(0, 122, 255, 0.15)" : "rgba(0, 122, 255, 0.1)",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: 20,
                                }}
                            >
                                <Ionicons name="scan" size={44} color="#007AFF" />
                            </View>
                            <Text
                                style={{
                                    fontSize: 22,
                                    fontWeight: "700",
                                    color: textColor,
                                    textAlign: "center",
                                }}
                            >
                                Analyze Your Skin
                            </Text>
                            <Text
                                style={{
                                    fontSize: 15,
                                    color: secondaryTextColor,
                                    textAlign: "center",
                                    marginTop: 10,
                                    lineHeight: 22,
                                    paddingHorizontal: 12,
                                }}
                            >
                                Capture or select an image to identify fungal skin conditions instantly
                            </Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <GlassActionButton
                        icon="camera"
                        title="Take Photo"
                        subtitle="Use camera to capture"
                        onPress={() => pickImage("camera")}
                        primary
                    />
                    <GlassActionButton
                        icon="images"
                        title="Choose from Gallery"
                        subtitle="Select existing photo"
                        onPress={() => pickImage("gallery")}
                    />

                    {/* Spacer */}
                    <View style={{ flex: 1 }} />

                    {/* Admin Link */}
                    <TouchableOpacity
                        onPress={() => router.push("/admin")}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            paddingVertical: 14,
                            marginBottom: 10,
                        }}
                    >
                        <Ionicons name="settings-outline" size={18} color={secondaryTextColor} />
                        <Text style={{ color: secondaryTextColor, fontSize: 14, marginLeft: 8, fontWeight: "500" }}>
                            Admin Dashboard
                        </Text>
                    </TouchableOpacity>

                    {/* Disclaimer - Glass Style */}
                    <View
                        style={[
                            glassStyle,
                            {
                                flexDirection: "row",
                                alignItems: "center",
                                padding: 16,
                                borderRadius: 16,
                                marginBottom: 20,
                                backgroundColor: isDark ? "rgba(255, 214, 10, 0.08)" : "rgba(255, 204, 0, 0.12)",
                                borderColor: isDark ? "rgba(255, 214, 10, 0.2)" : "rgba(255, 204, 0, 0.3)",
                            },
                        ]}
                    >
                        <Ionicons
                            name="information-circle"
                            size={22}
                            color={isDark ? "#FFD60A" : "#946C00"}
                        />
                        <Text
                            style={{
                                flex: 1,
                                fontSize: 13,
                                color: isDark ? "rgba(255, 214, 10, 0.9)" : "#8B6914",
                                marginLeft: 12,
                                lineHeight: 18,
                            }}
                        >
                            For educational purposes only. Consult a healthcare professional.
                        </Text>
                    </View>
                </Animated.View>
            </SafeAreaView>
        </LinearGradient>
    );
}
