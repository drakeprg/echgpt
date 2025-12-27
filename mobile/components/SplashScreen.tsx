import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    useColorScheme,
    Platform,
    Dimensions,
    Animated,
    Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { IOSButton } from "./ui/IOSButton";

const MAX_WIDTH = 480;

interface SplashScreenProps {
    onContinue: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onContinue }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const { width } = Dimensions.get("window");
    const isWeb = Platform.OS === "web";

    // Animation values
    const [fadeAnim] = useState(new Animated.Value(1));
    const [scaleAnim] = useState(new Animated.Value(1));
    const [logoAnim] = useState(new Animated.Value(0));
    const [textAnim] = useState(new Animated.Value(0));
    const [buttonAnim] = useState(new Animated.Value(0));

    // Entrance animations
    useEffect(() => {
        Animated.sequence([
            // Logo bounce in
            Animated.spring(logoAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            // Text fade in
            Animated.timing(textAnim, {
                toValue: 1,
                duration: 400,
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
                duration: 300,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1.1,
                duration: 300,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start(() => {
            onContinue();
        });
    };

    const backgroundColor = "#007AFF";
    const textColor = "#FFFFFF";
    const contentWidth = isWeb ? Math.min(width, MAX_WIDTH) : width;

    return (
        <Animated.View
            style={{
                flex: 1,
                backgroundColor,
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
            }}
        >
            <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <View
                    style={{
                        flex: 1,
                        width: contentWidth,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 32,
                    }}
                >
                    {/* Animated Logo */}
                    <Animated.View
                        style={{
                            width: 140,
                            height: 140,
                            borderRadius: 35,
                            backgroundColor: "rgba(255, 255, 255, 0.15)",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 32,
                            opacity: logoAnim,
                            transform: [
                                {
                                    scale: logoAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.3, 1],
                                    }),
                                },
                            ],
                            // Glassmorphism effect
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 10 },
                            shadowOpacity: 0.15,
                            shadowRadius: 20,
                        }}
                    >
                        <Text style={{ fontSize: 72 }}>🍄</Text>
                    </Animated.View>

                    {/* Animated App Name */}
                    <Animated.View
                        style={{
                            opacity: textAnim,
                            transform: [
                                {
                                    translateY: textAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20, 0],
                                    }),
                                },
                            ],
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 48,
                                fontWeight: "800",
                                color: textColor,
                                textAlign: "center",
                                letterSpacing: -1.5,
                            }}
                        >
                            FungiGPT
                        </Text>

                        <Text
                            style={{
                                fontSize: 17,
                                color: "rgba(255, 255, 255, 0.85)",
                                textAlign: "center",
                                marginTop: 12,
                                fontWeight: "500",
                                letterSpacing: 0.3,
                            }}
                        >
                            AI-Powered Skin Analysis
                        </Text>
                    </Animated.View>

                    {/* Spacer */}
                    <View style={{ flex: 1 }} />

                    {/* Animated Continue Button */}
                    <Animated.View
                        style={{
                            width: "100%",
                            opacity: buttonAnim,
                            transform: [
                                {
                                    translateY: buttonAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [50, 0],
                                    }),
                                },
                            ],
                        }}
                    >
                        <IOSButton
                            title="Get Started"
                            onPress={handleContinue}
                            variant="secondary"
                            size="large"
                            style={{
                                backgroundColor: "#FFFFFF",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.15,
                                shadowRadius: 12,
                            }}
                            textStyle={{ color: "#007AFF", fontWeight: "700" }}
                            icon={<Ionicons name="arrow-forward" size={20} color="#007AFF" />}
                        />
                    </Animated.View>

                    {/* Copyright */}
                    <Animated.Text
                        style={{
                            fontSize: 12,
                            color: "rgba(255, 255, 255, 0.5)",
                            textAlign: "center",
                            marginTop: 32,
                            marginBottom: 16,
                            opacity: buttonAnim,
                        }}
                    >
                        © 2024 FungiGPT by Claudia Haova
                    </Animated.Text>
                </View>
            </SafeAreaView>
        </Animated.View>
    );
};
