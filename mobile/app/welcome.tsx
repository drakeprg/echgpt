import React from "react";
import { useRouter } from "expo-router";
import { SplashScreen } from "../components/SplashScreen";

export default function WelcomeScreen() {
    const router = useRouter();

    const handleContinue = () => {
        router.replace("/home");
    };

    return <SplashScreen onContinue={handleContinue} />;
}
