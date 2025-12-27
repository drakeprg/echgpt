import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <View
                    style={{ flex: 1, backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7" }}
                >
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            animation: "slide_from_right",
                            contentStyle: {
                                backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7",
                            },
                        }}
                    />
                    <StatusBar style={isDark ? "light" : "dark"} />
                </View>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
