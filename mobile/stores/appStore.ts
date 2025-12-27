import { create } from "zustand";

export interface ClassificationResult {
    label: string;
    confidence: number;
}

interface AppState {
    // Model state
    isModelLoading: boolean;
    isModelReady: boolean;
    modelError: string | null;

    // Analysis state
    isAnalyzing: boolean;
    selectedImageUri: string | null;
    analysisResults: ClassificationResult[] | null;
    analysisError: string | null;

    // Actions
    setModelLoading: (loading: boolean) => void;
    setModelReady: (ready: boolean) => void;
    setModelError: (error: string | null) => void;
    setAnalyzing: (analyzing: boolean) => void;
    setSelectedImage: (uri: string | null) => void;
    setAnalysisResults: (results: ClassificationResult[] | null) => void;
    setAnalysisError: (error: string | null) => void;
    resetAnalysis: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    // Initial state
    isModelLoading: false,
    isModelReady: false,
    modelError: null,
    isAnalyzing: false,
    selectedImageUri: null,
    analysisResults: null,
    analysisError: null,

    // Actions
    setModelLoading: (loading) => set({ isModelLoading: loading }),
    setModelReady: (ready) => set({ isModelReady: ready, isModelLoading: false }),
    setModelError: (error) => set({ modelError: error, isModelLoading: false }),
    setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
    setSelectedImage: (uri) => set({ selectedImageUri: uri }),
    setAnalysisResults: (results) =>
        set({ analysisResults: results, isAnalyzing: false, analysisError: null }),
    setAnalysisError: (error) =>
        set({ analysisError: error, isAnalyzing: false }),
    resetAnalysis: () =>
        set({
            selectedImageUri: null,
            analysisResults: null,
            analysisError: null,
            isAnalyzing: false,
        }),
}));
