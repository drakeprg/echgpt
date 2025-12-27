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
import { useAppStore } from "../stores/appStore";

const MAX_WIDTH = 480;

export default function HomeScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const { width } = Dimensions.get("window");
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
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setModelReady(true);
            setInitializing(false);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
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
    const secondaryTextColor = isDark ? "#98989D" : "#6C6C70";
    const backgroundColor = isDark ? "#000000" : "#F2F2F7";
    const cardBg = isDark ? "rgba(44, 44, 46, 0.8)" : "rgba(255, 255, 255, 0.9)";

    const containerStyle = {
        flex: 1,
        backgroundColor,
        alignItems: "center" as const,
    };

    const contentWidth = isWeb ? Math.min(width, MAX_WIDTH) : width;

    if (initializing || isAnalyzing) {
        return (
            <SafeAreaView style={containerStyle}>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <View
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 20,
                            backgroundColor: "#007AFF",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 20,
                        }}
                    >
                        <Text style={{ fontSize: 40 }}>🍄</Text>
                    </View>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={{ marginTop: 16, color: secondaryTextColor, fontSize: 15 }}>
                        {initializing ? "Loading..." : "Analyzing..."}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Modern Action Button Component
    const ActionButton = ({
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
            activeOpacity={0.8}
            style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: primary ? "#007AFF" : cardBg,
                padding: 20,
                borderRadius: 16,
                marginBottom: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.3 : 0.08,
                shadowRadius: 8,
                elevation: 3,
            }}
        >
            <View
                style={{
                    width: 50,
                    height: 50,
                    borderRadius: 14,
                    backgroundColor: primary ? "rgba(255,255,255,0.2)" : (isDark ? "#3A3A3C" : "#F2F2F7"),
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
                        color: primary ? "rgba(255,255,255,0.7)" : secondaryTextColor,
                        marginTop: 2,
                    }}
                >
                    {subtitle}
                </Text>
            </View>
            <Ionicons
                name="chevron-forward"
                size={20}
                color={primary ? "rgba(255,255,255,0.6)" : (isDark ? "#48484A" : "#C7C7CC")}
            />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={containerStyle}>
            <Animated.View
                style={{
                    flex: 1,
                    width: contentWidth,
                    paddingHorizontal: 20,
                    opacity: fadeAnim,
                }}
            >
                {/* Header */}
                <View style={{ marginTop: 20, marginBottom: 32 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                        <Text style={{ fontSize: 40, marginRight: 12 }}>🍄</Text>
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
                                AI Skin Condition Analyzer
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Hero Card */}
                <View
                    style={{
                        backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
                        borderRadius: 20,
                        padding: 24,
                        marginBottom: 24,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: isDark ? 0.3 : 0.1,
                        shadowRadius: 12,
                    }}
                >
                    <View style={{ alignItems: "center" }}>
                        <View
                            style={{
                                width: 100,
                                height: 100,
                                borderRadius: 25,
                                backgroundColor: isDark ? "#2C2C2E" : "#E8F4F8",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 16,
                            }}
                        >
                            <Ionicons name="scan" size={48} color="#007AFF" />
                        </View>
                        <Text
                            style={{
                                fontSize: 20,
                                fontWeight: "700",
                                color: textColor,
                                textAlign: "center",
                            }}
                        >
                            Analyze Your Skin
                        </Text>
                        <Text
                            style={{
                                fontSize: 14,
                                color: secondaryTextColor,
                                textAlign: "center",
                                marginTop: 8,
                                lineHeight: 20,
                                paddingHorizontal: 16,
                            }}
                        >
                            Take a photo or choose from gallery to identify fungal skin conditions instantly
                        </Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <ActionButton
                    icon="camera"
                    title="Take Photo"
                    subtitle="Use camera to capture"
                    onPress={() => pickImage("camera")}
                    primary
                />
                <ActionButton
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
                        paddingVertical: 12,
                        marginBottom: 8,
                    }}
                >
                    <Ionicons name="settings-outline" size={18} color={secondaryTextColor} />
                    <Text style={{ color: secondaryTextColor, fontSize: 14, marginLeft: 6 }}>
                        Admin Dashboard
                    </Text>
                </TouchableOpacity>

                {/* Disclaimer */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 14,
                        backgroundColor: isDark ? "#2C2C2E" : "#FEF7E6",
                        borderRadius: 12,
                        marginBottom: 16,
                    }}
                >
                    <Ionicons
                        name="information-circle"
                        size={20}
                        color={isDark ? "#FFD60A" : "#B8860B"}
                    />
                    <Text
                        style={{
                            flex: 1,
                            fontSize: 12,
                            color: isDark ? "#FFD60A" : "#8B6914",
                            marginLeft: 10,
                            lineHeight: 16,
                        }}
                    >
                        For educational purposes only. Always consult a healthcare professional.
                    </Text>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
}
