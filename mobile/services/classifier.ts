import { Platform } from "react-native";
import { ClassificationResult } from "../stores/appStore";

// Labels for the model
const LABELS = [
    "candidiasis",
    "tinea_corporis",
    "tinea_pedis",
    "tinea_versicolor",
];

// Abstract classifier interface
interface Classifier {
    initialize(): Promise<void>;
    classify(imageUri: string): Promise<ClassificationResult[]>;
    isReady(): boolean;
}

// Mock classifier for development
class MockClassifier implements Classifier {
    private ready = false;

    async initialize(): Promise<void> {
        // Simulate loading time
        await new Promise((resolve) => setTimeout(resolve, 1000));
        this.ready = true;
    }

    async classify(imageUri: string): Promise<ClassificationResult[]> {
        if (!this.ready) {
            throw new Error("Classifier not initialized");
        }

        // Simulate inference time
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Generate mock results with random distribution
        const rand = Math.random();
        let results: ClassificationResult[];

        if (rand < 0.25) {
            results = [
                { label: "candidiasis", confidence: 0.75 + Math.random() * 0.2 },
                { label: "tinea_corporis", confidence: 0.1 + Math.random() * 0.1 },
                { label: "tinea_versicolor", confidence: 0.05 + Math.random() * 0.05 },
                { label: "tinea_pedis", confidence: 0.02 + Math.random() * 0.03 },
            ];
        } else if (rand < 0.5) {
            results = [
                { label: "tinea_corporis", confidence: 0.8 + Math.random() * 0.15 },
                { label: "candidiasis", confidence: 0.08 + Math.random() * 0.07 },
                { label: "tinea_pedis", confidence: 0.03 + Math.random() * 0.04 },
                { label: "tinea_versicolor", confidence: 0.02 + Math.random() * 0.03 },
            ];
        } else if (rand < 0.75) {
            results = [
                { label: "tinea_pedis", confidence: 0.7 + Math.random() * 0.2 },
                { label: "tinea_corporis", confidence: 0.12 + Math.random() * 0.08 },
                { label: "candidiasis", confidence: 0.05 + Math.random() * 0.05 },
                { label: "tinea_versicolor", confidence: 0.03 + Math.random() * 0.02 },
            ];
        } else {
            results = [
                { label: "tinea_versicolor", confidence: 0.65 + Math.random() * 0.25 },
                { label: "candidiasis", confidence: 0.15 + Math.random() * 0.1 },
                { label: "tinea_corporis", confidence: 0.08 + Math.random() * 0.07 },
                { label: "tinea_pedis", confidence: 0.04 + Math.random() * 0.03 },
            ];
        }

        // Normalize to sum to 1
        const total = results.reduce((sum, r) => sum + r.confidence, 0);
        results = results.map((r) => ({
            ...r,
            confidence: r.confidence / total,
        }));

        // Sort by confidence
        return results.sort((a, b) => b.confidence - a.confidence);
    }

    isReady(): boolean {
        return this.ready;
    }
}

// TensorFlow.js classifier for web
class TFJSClassifier implements Classifier {
    private ready = false;
    private model: any = null;

    async initialize(): Promise<void> {
        try {
            // Dynamic import to avoid loading TF.js on native
            const tf = await import("@tensorflow/tfjs");

            console.log("TensorFlow.js loaded, backend:", tf.getBackend());

            // For now, use mock since we need to convert the model
            // In production: this.model = await tf.loadLayersModel('path/to/model.json');
            this.ready = true;
        } catch (error) {
            console.error("Failed to initialize TensorFlow.js:", error);
            // Fall back to mock
            this.ready = true;
        }
    }

    async classify(imageUri: string): Promise<ClassificationResult[]> {
        // TODO: Implement real TF.js inference
        // For now, delegate to mock
        const mock = new MockClassifier();
        await mock.initialize();
        return mock.classify(imageUri);
    }

    isReady(): boolean {
        return this.ready;
    }
}

// Get platform-appropriate classifier
export const createClassifier = (): Classifier => {
    if (Platform.OS === "web") {
        return new TFJSClassifier();
    }
    // For native, use mock for now (TFLite integration requires native modules)
    return new MockClassifier();
};

// Singleton instance
let classifierInstance: Classifier | null = null;

export const getClassifier = (): Classifier => {
    if (!classifierInstance) {
        classifierInstance = createClassifier();
    }
    return classifierInstance;
};

export { LABELS, Classifier };
