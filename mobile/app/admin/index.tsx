import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    ActivityIndicator,
    useColorScheme,
    Platform,
    Dimensions,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { IOSButton } from "../../components/ui/IOSButton";
import { IOSCard } from "../../components/ui/IOSCard";

const API_BASE = Platform.OS === "web" ? "http://localhost:8000" : "http://localhost:8000";
const MAX_WIDTH = 800;

type Tab = "upload" | "images" | "diseases" | "training";

interface TrainingImage {
    id: string;
    filename: string;
    disease_class: string;
    uploaded_at: string;
    file_path: string;
}

interface ModelInfo {
    name: string;
    size_mb: number;
    created_at: string;
    type: string;
}

interface TrainingStatus {
    status: string;
    message: string;
    started_at?: string;
    completed_at?: string;
}

const DISEASE_CLASSES = [
    { value: "candidiasis", label: "Candidiasis" },
    { value: "tinea_corporis", label: "Tinea Corporis (Ringworm)" },
    { value: "tinea_pedis", label: "Tinea Pedis (Athlete's Foot)" },
    { value: "tinea_versicolor", label: "Tinea Versicolor" },
];

export default function AdminDashboard() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const { width } = Dimensions.get("window");
    const isWeb = Platform.OS === "web";

    const [activeTab, setActiveTab] = useState<Tab>("upload");
    const [images, setImages] = useState<TrainingImage[]>([]);
    const [models, setModels] = useState<ModelInfo[]>([]);
    const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>({
        status: "idle",
        message: "No training in progress",
    });
    const [selectedClass, setSelectedClass] = useState("candidiasis");
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [backendError, setBackendError] = useState<string | null>(null);

    const textColor = isDark ? "#FFFFFF" : "#1C1C1E";
    const secondaryTextColor = isDark ? "#98989D" : "#8E8E93";
    const backgroundColor = isDark ? "#1C1C1E" : "#F2F2F7";
    const cardBg = isDark ? "#2C2C2E" : "#FFFFFF";

    useEffect(() => {
        loadData();
        const interval = setInterval(loadTrainingStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setBackendError(null);
            const [imagesRes, modelsRes, statusRes] = await Promise.all([
                fetch(`${API_BASE}/api/images`).then((r) => r.json()),
                fetch(`${API_BASE}/api/models`).then((r) => r.json()),
                fetch(`${API_BASE}/api/training/status`).then((r) => r.json()),
            ]);
            setImages(imagesRes);
            setModels(modelsRes);
            setTrainingStatus(statusRes);
        } catch (error) {
            console.error("Failed to load data:", error);
            setBackendError("Cannot connect to backend. Make sure it's running on port 8000.");
        } finally {
            setLoading(false);
        }
    };

    const loadTrainingStatus = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/training/status`);
            const data = await res.json();
            setTrainingStatus(data);
        } catch (error) {
            // Silent fail for status polling
        }
    };

    const pickAndUploadImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: "images",
                allowsMultipleSelection: true,
                quality: 0.85,
            });

            if (!result.canceled && result.assets.length > 0) {
                setUploading(true);
                for (const asset of result.assets) {
                    const formData = new FormData();

                    if (Platform.OS === "web") {
                        // For web, fetch the blob
                        const response = await fetch(asset.uri);
                        const blob = await response.blob();
                        formData.append("file", blob, "image.jpg");
                    } else {
                        formData.append("file", {
                            uri: asset.uri,
                            type: "image/jpeg",
                            name: "image.jpg",
                        } as any);
                    }
                    formData.append("disease_class", selectedClass);

                    await fetch(`${API_BASE}/api/images/upload`, {
                        method: "POST",
                        body: formData,
                    });
                }
                await loadData();
                if (Platform.OS === "web") {
                    alert(`Uploaded ${result.assets.length} image(s) successfully!`);
                } else {
                    Alert.alert("Success", `Uploaded ${result.assets.length} image(s)`);
                }
            }
        } catch (error) {
            console.error("Upload error:", error);
            if (Platform.OS === "web") {
                alert("Failed to upload image");
            } else {
                Alert.alert("Error", "Failed to upload image");
            }
        } finally {
            setUploading(false);
        }
    };

    const deleteImage = async (img: TrainingImage) => {
        const confirmDelete = Platform.OS === "web"
            ? confirm("Delete this image?")
            : await new Promise((resolve) => {
                Alert.alert("Delete", "Delete this image?", [
                    { text: "Cancel", onPress: () => resolve(false) },
                    { text: "Delete", onPress: () => resolve(true), style: "destructive" },
                ]);
            });

        if (confirmDelete) {
            await fetch(`${API_BASE}/api/images/${img.disease_class}/${img.filename}`, {
                method: "DELETE",
            });
            await loadData();
        }
    };

    const startTraining = async () => {
        try {
            await fetch(`${API_BASE}/api/training/start`, { method: "POST" });
            await loadTrainingStatus();
            if (Platform.OS === "web") {
                alert("Training started! This may take a few minutes.");
            } else {
                Alert.alert("Training Started", "This may take a few minutes.");
            }
        } catch (error) {
            console.error("Training error:", error);
        }
    };

    const TabButton = ({ tab, icon, label }: { tab: Tab; icon: string; label: string }) => (
        <TouchableOpacity
            onPress={() => setActiveTab(tab)}
            style={{
                flex: 1,
                paddingVertical: 12,
                alignItems: "center",
                borderBottomWidth: 2,
                borderBottomColor: activeTab === tab ? "#007AFF" : "transparent",
            }}
        >
            <Text style={{ color: activeTab === tab ? "#007AFF" : secondaryTextColor }}>
                {icon} {label}
            </Text>
        </TouchableOpacity>
    );

    const containerStyle = {
        flex: 1,
        backgroundColor,
        alignItems: "center" as const,
    };

    const contentWidth = isWeb ? Math.min(width, MAX_WIDTH) : width;

    if (loading) {
        return (
            <SafeAreaView style={containerStyle}>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={{ marginTop: 16, color: secondaryTextColor }}>
                        Loading admin dashboard...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (backendError) {
        return (
            <SafeAreaView style={containerStyle}>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32 }}>
                    <Ionicons name="warning" size={64} color="#FF9500" />
                    <Text style={{ marginTop: 16, fontSize: 18, fontWeight: "600", color: textColor, textAlign: "center" }}>
                        Backend Not Running
                    </Text>
                    <Text style={{ marginTop: 8, color: secondaryTextColor, textAlign: "center" }}>
                        {backendError}
                    </Text>
                    <Text style={{ marginTop: 16, color: secondaryTextColor, textAlign: "center", fontFamily: "monospace" }}>
                        cd echgpt && python src/admin/main.py
                    </Text>
                    <IOSButton title="Retry" onPress={loadData} variant="primary" style={{ marginTop: 24 }} />
                    <IOSButton title="← Back to App" onPress={() => router.replace("/home")} variant="secondary" style={{ marginTop: 12 }} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={containerStyle} edges={["top"]}>
            {/* Header */}
            <View
                style={{
                    width: contentWidth,
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: isDark ? "#38383A" : "#E5E5EA",
                }}
            >
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                <Text style={{ flex: 1, fontSize: 20, fontWeight: "600", color: textColor, marginLeft: 12 }}>
                    🍄 Admin Dashboard
                </Text>
            </View>

            {/* Stats Cards */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                <View style={{ flexDirection: "row", padding: 16, gap: 12, width: contentWidth }}>
                    <IOSCard style={{ flex: 1, padding: 16 }}>
                        <Text style={{ fontSize: 12, color: secondaryTextColor }}>Training Images</Text>
                        <Text style={{ fontSize: 24, fontWeight: "700", color: "#007AFF" }}>{images.length}</Text>
                    </IOSCard>
                    <IOSCard style={{ flex: 1, padding: 16 }}>
                        <Text style={{ fontSize: 12, color: secondaryTextColor }}>Models</Text>
                        <Text style={{ fontSize: 24, fontWeight: "700", color: "#34C759" }}>{models.length}</Text>
                    </IOSCard>
                    <IOSCard style={{ flex: 1, padding: 16 }}>
                        <Text style={{ fontSize: 12, color: secondaryTextColor }}>Status</Text>
                        <Text style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: trainingStatus.status === "running" ? "#FF9500" : trainingStatus.status === "completed" ? "#34C759" : secondaryTextColor
                        }}>
                            {trainingStatus.status}
                        </Text>
                    </IOSCard>
                </View>
            </ScrollView>

            {/* Tab Navigation */}
            <View style={{ width: contentWidth, flexDirection: "row", backgroundColor: cardBg }}>
                <TabButton tab="upload" icon="📤" label="Upload" />
                <TabButton tab="images" icon="🖼️" label="Images" />
                <TabButton tab="training" icon="🧠" label="Train" />
            </View>

            {/* Tab Content */}
            <ScrollView style={{ flex: 1, width: contentWidth }} contentContainerStyle={{ padding: 16 }}>
                {/* Upload Tab */}
                {activeTab === "upload" && (
                    <View>
                        <Text style={{ fontSize: 18, fontWeight: "600", color: textColor, marginBottom: 16 }}>
                            Upload Training Images
                        </Text>

                        <Text style={{ fontSize: 14, color: secondaryTextColor, marginBottom: 8 }}>
                            Disease Class
                        </Text>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                            {DISEASE_CLASSES.map((dc) => (
                                <TouchableOpacity
                                    key={dc.value}
                                    onPress={() => setSelectedClass(dc.value)}
                                    style={{
                                        paddingHorizontal: 16,
                                        paddingVertical: 10,
                                        borderRadius: 20,
                                        backgroundColor: selectedClass === dc.value ? "#007AFF" : (isDark ? "#3A3A3C" : "#E5E5EA"),
                                    }}
                                >
                                    <Text style={{ color: selectedClass === dc.value ? "#FFF" : textColor, fontSize: 14 }}>
                                        {dc.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <IOSButton
                            title={uploading ? "Uploading..." : "Select & Upload Images"}
                            onPress={pickAndUploadImage}
                            variant="primary"
                            size="large"
                            loading={uploading}
                            icon={<Ionicons name="cloud-upload" size={22} color="#FFF" />}
                        />
                    </View>
                )}

                {/* Images Tab */}
                {activeTab === "images" && (
                    <View>
                        <Text style={{ fontSize: 18, fontWeight: "600", color: textColor, marginBottom: 16 }}>
                            Training Images ({images.length})
                        </Text>

                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                            {images.map((img) => (
                                <View key={img.id} style={{ width: isWeb ? 120 : (width - 56) / 3, position: "relative" }}>
                                    <Image
                                        source={{ uri: `${API_BASE}/api/images/${img.disease_class}/${img.filename}` }}
                                        style={{ width: "100%", aspectRatio: 1, borderRadius: 8 }}
                                    />
                                    <View style={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        backgroundColor: "rgba(0,0,0,0.6)",
                                        padding: 4,
                                        borderBottomLeftRadius: 8,
                                        borderBottomRightRadius: 8,
                                    }}>
                                        <Text style={{ color: "#FFF", fontSize: 10 }} numberOfLines={1}>
                                            {img.disease_class}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => deleteImage(img)}
                                        style={{
                                            position: "absolute",
                                            top: 4,
                                            right: 4,
                                            width: 24,
                                            height: 24,
                                            borderRadius: 12,
                                            backgroundColor: "#FF3B30",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Text style={{ color: "#FFF", fontWeight: "bold" }}>×</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>

                        {images.length === 0 && (
                            <Text style={{ color: secondaryTextColor, textAlign: "center", marginTop: 32 }}>
                                No training images yet. Upload some to get started!
                            </Text>
                        )}
                    </View>
                )}

                {/* Training Tab */}
                {activeTab === "training" && (
                    <View>
                        <Text style={{ fontSize: 18, fontWeight: "600", color: textColor, marginBottom: 16 }}>
                            Model Training
                        </Text>

                        <IOSCard style={{ padding: 16, marginBottom: 16 }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <View>
                                    <Text style={{ fontWeight: "600", color: textColor }}>
                                        Status: {trainingStatus.status}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: secondaryTextColor, marginTop: 4 }}>
                                        {trainingStatus.message}
                                    </Text>
                                </View>
                                <IOSButton
                                    title="🚀 Train"
                                    onPress={startTraining}
                                    variant="primary"
                                    disabled={trainingStatus.status === "running"}
                                />
                            </View>
                        </IOSCard>

                        <Text style={{ fontSize: 16, fontWeight: "600", color: textColor, marginBottom: 12 }}>
                            Available Models
                        </Text>
                        {models.map((model) => (
                            <IOSCard key={model.name} style={{ padding: 16, marginBottom: 8 }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <Text style={{ color: textColor }}>{model.name}</Text>
                                    <Text style={{ color: secondaryTextColor }}>{model.size_mb.toFixed(2)} MB</Text>
                                </View>
                            </IOSCard>
                        ))}

                        {models.length === 0 && (
                            <Text style={{ color: secondaryTextColor, textAlign: "center" }}>
                                No models yet. Train one to get started!
                            </Text>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
