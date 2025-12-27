import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    useColorScheme,
    Platform,
    Dimensions,
    Animated,
    Easing,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const MAX_WIDTH = 480;

interface SplashScreenProps {
    onContinue: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onContinue }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const { width, height } = Dimensions.get("window");
    const isWeb = Platform.OS === "web";

    // Animation values
    const [fadeAnim] = useState(new Animated.Value(1));
    const [scaleAnim] = useState(new Animated.Value(1));
    const [logoAnim] = useState(new Animated.Value(0));
    const [textAnim] = useState(new Animated.Value(0));
    const [buttonAnim] = useState(new Animated.Value(0));
    const [glowAnim] = useState(new Animated.Value(0));

    // Entrance animations
    useEffect(() => {
        // Glow pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.sequence([
            // Logo bounce in
            Animated.spring(logoAnim, {
                toValue: 1,
                tension: 40,
                friction: 7,
                useNativeDriver: true,
            }),
            // Text fade in
            Animated.timing(textAnim, {
                toValue: 1,
                duration: 500,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            // Button slide up
            Animated.spring(buttonAnim, {
                toValue: 1,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleContinue = () => {
        // Exit animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 400,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1.15,
                duration: 400,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start(() => {
            onContinue();
        });
    };

    const contentWidth = isWeb ? Math.min(width, MAX_WIDTH) : width;

    // iOS 26 Liquid Glass gradient colors
    const gradientColors: readonly [string, string, ...string[]] = isDark
        ? ["#0A1628", "#0F2847", "#1A3A5C", "#0A1628"]
        : ["#E8F4FC", "#D6EEFF", "#C4E4FF", "#E8F4FC"];

    return (
        <Animated.View
            style={{
                flex: 1,
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
            }}
        >
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
            >
                {/* Animated gradient orbs for liquid glass effect */}
                <Animated.View
                    style={{
                        position: "absolute",
                        top: height * 0.1,
                        left: width * 0.1,
                        width: 200,
                        height: 200,
                        borderRadius: 100,
                        backgroundColor: isDark ? "rgba(0, 122, 255, 0.15)" : "rgba(0, 122, 255, 0.1)",
                        opacity: glowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 0.7],
                        }),
                        transform: [
                            {
                                scale: glowAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1, 1.2],
                                }),
                            },
                        ],
                    }}
                />
                <Animated.View
                    style={{
                        position: "absolute",
                        bottom: height * 0.2,
                        right: width * 0.05,
                        width: 150,
                        height: 150,
                        borderRadius: 75,
                        backgroundColor: isDark ? "rgba(88, 86, 214, 0.2)" : "rgba(88, 86, 214, 0.1)",
                        opacity: glowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.5, 0.3],
                        }),
                        transform: [
                            {
                                scale: glowAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1.2, 1],
                                }),
                            },
                        ],
                    }}
                />

                <SafeAreaView style={{ flex: 1, alignItems: "center" }}>
                    <View
                        style={{
                            flex: 1,
                            width: contentWidth,
                            alignItems: "center",
                            justifyContent: "flex-start",
                            paddingHorizontal: 32,
                            paddingTop: Platform.OS === "web" ? height * 0.12 : height * 0.15,
                        }}
                    >
                        {/* Animated Logo with Liquid Glass effect */}
                        <Animated.View
                            style={{
                                opacity: logoAnim,
                                transform: [
                                    {
                                        scale: logoAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.3, 1],
                                        }),
                                    },
                                ],
                            }}
                        >
                            {/* Outer glow ring */}
                            <Animated.View
                                style={{
                                    position: "absolute",
                                    top: -20,
                                    left: -20,
                                    right: -20,
                                    bottom: -20,
                                    borderRadius: 50,
                                    backgroundColor: "transparent",
                                    borderWidth: 2,
                                    borderColor: isDark ? "rgba(0, 122, 255, 0.3)" : "rgba(0, 122, 255, 0.2)",
                                    opacity: glowAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.3, 0.8],
                                    }),
                                }}
                            />
                            {/* Glass container for logo */}
                            <View
                                style={{
                                    width: 160,
                                    height: 160,
                                    borderRadius: 40,
                                    backgroundColor: isDark
                                        ? "rgba(255, 255, 255, 0.08)"
                                        : "rgba(255, 255, 255, 0.6)",
                                    borderWidth: 1.5,
                                    borderColor: isDark
                                        ? "rgba(255, 255, 255, 0.15)"
                                        : "rgba(255, 255, 255, 0.9)",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: 40,
                                    shadowColor: isDark ? "#007AFF" : "#000",
                                    shadowOffset: { width: 0, height: 12 },
                                    shadowOpacity: isDark ? 0.3 : 0.15,
                                    shadowRadius: 30,
                                }}
                            >
                                <Text style={{ fontSize: 80 }}>🍄</Text>
                            </View>
                        </Animated.View>

                        {/* Animated App Name */}
                        <Animated.View
                            style={{
                                opacity: textAnim,
                                transform: [
                                    {
                                        translateY: textAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [30, 0],
                                        }),
                                    },
                                ],
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 52,
                                    fontWeight: "800",
                                    color: isDark ? "#FFFFFF" : "#1C1C1E",
                                    textAlign: "center",
                                    letterSpacing: -2,
                                }}
                            >
                                FungiGPT
                            </Text>

                            <Text
                                style={{
                                    fontSize: 18,
                                    color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
                                    textAlign: "center",
                                    marginTop: 12,
                                    fontWeight: "500",
                                    letterSpacing: 0.5,
                                }}
                            >
                                AI-Powered Skin Analysis
                            </Text>
                        </Animated.View>

                        {/* Spacer */}
                        <View style={{ flex: 1 }} />

                        {/* Animated Continue Button - Liquid Glass Style */}
                        <Animated.View
                            style={{
                                width: "100%",
                                opacity: buttonAnim,
                                transform: [
                                    {
                                        translateY: buttonAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [60, 0],
                                        }),
                                    },
                                ],
                            }}
                        >
                            <TouchableOpacity
                                onPress={handleContinue}
                                activeOpacity={0.8}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    paddingVertical: 18,
                                    paddingHorizontal: 32,
                                    borderRadius: 20,
                                    backgroundColor: isDark
                                        ? "rgba(0, 122, 255, 0.9)"
                                        : "rgba(0, 122, 255, 0.95)",
                                    borderWidth: 1.5,
                                    borderColor: isDark
                                        ? "rgba(255, 255, 255, 0.2)"
                                        : "rgba(255, 255, 255, 0.4)",
                                    shadowColor: "#007AFF",
                                    shadowOffset: { width: 0, height: 8 },
                                    shadowOpacity: 0.4,
                                    shadowRadius: 20,
                                }}
                            >
                                <Text
                                    style={{
                                        color: "#FFFFFF",
                                        fontSize: 18,
                                        fontWeight: "700",
                                        marginRight: 10,
                                    }}
                                >
                                    Get Started
                                </Text>
                                <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Copyright */}
                        <Animated.Text
                            style={{
                                fontSize: 13,
                                color: isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)",
                                textAlign: "center",
                                marginTop: 40,
                                marginBottom: 20,
                                opacity: buttonAnim,
                            }}
                        >
                            © 2024 FungiGPT by Claudia Haova
                        </Animated.Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        </Animated.View>
    );
};
