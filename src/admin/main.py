"""
Admin Backend for FungiGPT
FastAPI-based admin interface for managing training data, disease info, and model training.
"""
import os
import json
import shutil
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Optional
from enum import Enum

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Configuration
BASE_DIR = Path(__file__).parent.parent.parent
DATA_DIR = BASE_DIR / "data"
TRAINING_DATA_DIR = DATA_DIR / "training_images"
MODELS_DIR = BASE_DIR / "models"
DISEASE_INFO_PATH = DATA_DIR / "disease_info.json"

# Ensure directories exist
TRAINING_DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="FungiGPT Admin",
    description="Admin backend for managing training data and disease information",
    version="1.0.0"
)

# CORS for admin dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============== Schemas ==============

class DiseaseClass(str, Enum):
    CANDIDIASIS = "candidiasis"
    TINEA_CORPORIS = "tinea_corporis"
    TINEA_PEDIS = "tinea_pedis"
    TINEA_VERSICOLOR = "tinea_versicolor"


class DiseaseInfoUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    symptoms: Optional[List[str]] = None
    causes: Optional[List[str]] = None
    treatment: Optional[List[str]] = None
    whenToSeeDoctor: Optional[List[str]] = None
    severity: Optional[str] = None
    color: Optional[str] = None


class TrainingImage(BaseModel):
    id: str
    filename: str
    disease_class: str
    uploaded_at: str
    file_path: str


class TrainingStatus(BaseModel):
    status: str
    message: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    accuracy: Optional[float] = None
    val_accuracy: Optional[float] = None


class ModelInfo(BaseModel):
    name: str
    size_mb: float
    created_at: str
    type: str


# ============== Training State ==============

training_state = {
    "status": "idle",
    "message": "No training in progress",
    "started_at": None,
    "completed_at": None,
    "accuracy": None,
    "val_accuracy": None
}


# ============== Helper Functions ==============

def load_disease_info() -> dict:
    """Load disease info from JSON file."""
    if DISEASE_INFO_PATH.exists():
        with open(DISEASE_INFO_PATH, 'r') as f:
            return json.load(f)
    return {}


def save_disease_info(data: dict):
    """Save disease info to JSON file."""
    with open(DISEASE_INFO_PATH, 'w') as f:
        json.dump(data, f, indent=2)


def get_training_images() -> List[TrainingImage]:
    """Get list of all training images."""
    images = []
    for disease_dir in TRAINING_DATA_DIR.iterdir():
        if disease_dir.is_dir():
            for img_path in disease_dir.iterdir():
                if img_path.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp']:
                    stat = img_path.stat()
                    images.append(TrainingImage(
                        id=img_path.stem,
                        filename=img_path.name,
                        disease_class=disease_dir.name,
                        uploaded_at=datetime.fromtimestamp(stat.st_mtime).isoformat(),
                        file_path=str(img_path)
                    ))
    return images


def run_training():
    """Background task to run model training."""
    global training_state
    import subprocess
    import sys
    
    training_state["status"] = "running"
    training_state["message"] = "Training in progress..."
    training_state["started_at"] = datetime.now().isoformat()
    
    try:
        # Run training script
        result = subprocess.run(
            [sys.executable, str(BASE_DIR / "src" / "model" / "train.py"),
             "--data_dir", str(TRAINING_DATA_DIR),
             "--output_dir", str(MODELS_DIR)],
            capture_output=True,
            text=True,
            timeout=3600  # 1 hour timeout
        )
        
        if result.returncode == 0:
            training_state["status"] = "completed"
            training_state["message"] = "Training completed successfully"
            
            # Run TFLite export
            subprocess.run(
                [sys.executable, str(BASE_DIR / "src" / "model" / "export_tflite.py"),
                 "--model", str(MODELS_DIR / "fungal_classifier.keras"),
                 "--output_dir", str(MODELS_DIR)],
                capture_output=True,
                text=True
            )
        else:
            training_state["status"] = "failed"
            training_state["message"] = f"Training failed: {result.stderr[:500]}"
            
    except Exception as e:
        training_state["status"] = "failed"
        training_state["message"] = f"Training error: {str(e)}"
    
    training_state["completed_at"] = datetime.now().isoformat()


# ============== API Routes ==============

@app.get("/", response_class=HTMLResponse)
async def admin_dashboard():
    """Serve admin dashboard HTML."""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>FungiGPT Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    </head>
    <body class="bg-gray-100 min-h-screen">
        <div class="container mx-auto px-4 py-8" x-data="adminApp()">
            <header class="mb-8">
                <h1 class="text-3xl font-bold text-gray-800">🍄 FungiGPT Admin</h1>
                <p class="text-gray-600">Manage training data and disease information</p>
            </header>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-sm font-medium text-gray-500">Training Images</h3>
                    <p class="text-2xl font-bold text-blue-600" x-text="stats.totalImages"></p>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-sm font-medium text-gray-500">Disease Classes</h3>
                    <p class="text-2xl font-bold text-green-600" x-text="stats.classes"></p>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-sm font-medium text-gray-500">Models</h3>
                    <p class="text-2xl font-bold text-purple-600" x-text="stats.models"></p>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-sm font-medium text-gray-500">Training Status</h3>
                    <p class="text-lg font-bold" :class="trainingStatus.status === 'running' ? 'text-yellow-600' : 'text-gray-600'" x-text="trainingStatus.status"></p>
                </div>
            </div>

            <!-- Tab Navigation -->
            <div class="bg-white rounded-lg shadow mb-8">
                <div class="border-b border-gray-200">
                    <nav class="flex -mb-px">
                        <button @click="activeTab = 'upload'" :class="activeTab === 'upload' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'" class="py-4 px-6 border-b-2 font-medium">
                            📤 Upload Images
                        </button>
                        <button @click="activeTab = 'images'" :class="activeTab === 'images' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'" class="py-4 px-6 border-b-2 font-medium">
                            🖼️ Training Images
                        </button>
                        <button @click="activeTab = 'diseases'" :class="activeTab === 'diseases' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'" class="py-4 px-6 border-b-2 font-medium">
                            📋 Disease Info
                        </button>
                        <button @click="activeTab = 'training'" :class="activeTab === 'training' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'" class="py-4 px-6 border-b-2 font-medium">
                            🧠 Train Model
                        </button>
                    </nav>
                </div>

                <div class="p-6">
                    <!-- Upload Tab -->
                    <div x-show="activeTab === 'upload'">
                        <h2 class="text-xl font-semibold mb-4">Upload Training Images</h2>
                        <form @submit.prevent="uploadImages" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Disease Class</label>
                                <select x-model="uploadClass" class="w-full border rounded-lg px-4 py-2">
                                    <option value="candidiasis">Candidiasis</option>
                                    <option value="tinea_corporis">Tinea Corporis (Ringworm)</option>
                                    <option value="tinea_pedis">Tinea Pedis (Athlete's Foot)</option>
                                    <option value="tinea_versicolor">Tinea Versicolor</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Images</label>
                                <input type="file" multiple accept="image/*" @change="handleFileSelect" class="w-full border rounded-lg px-4 py-2">
                            </div>
                            <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700" :disabled="uploading">
                                <span x-show="!uploading">Upload Images</span>
                                <span x-show="uploading">Uploading...</span>
                            </button>
                        </form>
                    </div>

                    <!-- Images Tab -->
                    <div x-show="activeTab === 'images'">
                        <h2 class="text-xl font-semibold mb-4">Training Images</h2>
                        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            <template x-for="img in images" :key="img.id">
                                <div class="relative group">
                                    <img :src="'/api/images/' + img.disease_class + '/' + img.filename" class="w-full h-32 object-cover rounded-lg">
                                    <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg" x-text="img.disease_class"></div>
                                    <button @click="deleteImage(img)" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 opacity-0 group-hover:opacity-100">×</button>
                                </div>
                            </template>
                        </div>
                    </div>

                    <!-- Disease Info Tab -->
                    <div x-show="activeTab === 'diseases'">
                        <h2 class="text-xl font-semibold mb-4">Disease Information</h2>
                        <div class="space-y-4">
                            <template x-for="(info, key) in diseases" :key="key">
                                <div class="border rounded-lg p-4">
                                    <h3 class="font-semibold text-lg" x-text="info.name"></h3>
                                    <p class="text-gray-600 text-sm" x-text="info.description"></p>
                                    <button @click="editDisease(key)" class="mt-2 text-blue-600 text-sm">Edit</button>
                                </div>
                            </template>
                        </div>
                    </div>

                    <!-- Training Tab -->
                    <div x-show="activeTab === 'training'">
                        <h2 class="text-xl font-semibold mb-4">Model Training</h2>
                        <div class="bg-gray-50 rounded-lg p-6">
                            <div class="flex items-center justify-between mb-4">
                                <div>
                                    <p class="font-medium">Status: <span :class="trainingStatus.status === 'running' ? 'text-yellow-600' : trainingStatus.status === 'completed' ? 'text-green-600' : 'text-gray-600'" x-text="trainingStatus.status"></span></p>
                                    <p class="text-sm text-gray-500" x-text="trainingStatus.message"></p>
                                </div>
                                <button @click="startTraining" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700" :disabled="trainingStatus.status === 'running'">
                                    🚀 Start Training
                                </button>
                            </div>
                            <div class="mt-4">
                                <h3 class="font-medium mb-2">Available Models</h3>
                                <template x-for="model in models" :key="model.name">
                                    <div class="flex items-center justify-between bg-white p-3 rounded border mb-2">
                                        <span x-text="model.name"></span>
                                        <span class="text-gray-500 text-sm" x-text="model.size_mb.toFixed(2) + ' MB'"></span>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            function adminApp() {
                return {
                    activeTab: 'upload',
                    uploadClass: 'candidiasis',
                    selectedFiles: [],
                    uploading: false,
                    images: [],
                    diseases: {},
                    models: [],
                    trainingStatus: { status: 'idle', message: '' },
                    stats: { totalImages: 0, classes: 4, models: 0 },

                    init() {
                        this.loadData();
                        setInterval(() => this.loadTrainingStatus(), 5000);
                    },

                    async loadData() {
                        const [imagesRes, diseasesRes, modelsRes, statusRes] = await Promise.all([
                            fetch('/api/images').then(r => r.json()),
                            fetch('/api/diseases').then(r => r.json()),
                            fetch('/api/models').then(r => r.json()),
                            fetch('/api/training/status').then(r => r.json())
                        ]);
                        this.images = imagesRes;
                        this.diseases = diseasesRes;
                        this.models = modelsRes;
                        this.trainingStatus = statusRes;
                        this.stats.totalImages = imagesRes.length;
                        this.stats.models = modelsRes.length;
                    },

                    async loadTrainingStatus() {
                        const res = await fetch('/api/training/status');
                        this.trainingStatus = await res.json();
                    },

                    handleFileSelect(e) {
                        this.selectedFiles = Array.from(e.target.files);
                    },

                    async uploadImages() {
                        if (!this.selectedFiles.length) return;
                        this.uploading = true;
                        for (const file of this.selectedFiles) {
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('disease_class', this.uploadClass);
                            await fetch('/api/images/upload', { method: 'POST', body: formData });
                        }
                        this.uploading = false;
                        this.selectedFiles = [];
                        this.loadData();
                    },

                    async deleteImage(img) {
                        if (confirm('Delete this image?')) {
                            await fetch(`/api/images/${img.disease_class}/${img.filename}`, { method: 'DELETE' });
                            this.loadData();
                        }
                    },

                    async startTraining() {
                        await fetch('/api/training/start', { method: 'POST' });
                        this.loadTrainingStatus();
                    },

                    editDisease(key) {
                        alert('Edit functionality - coming soon!');
                    }
                }
            }
        </script>
    </body>
    </html>
    """


# ------------ Stats & Health ------------

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.get("/api/stats")
async def get_stats():
    """Get dashboard statistics."""
    images = get_training_images()
    models = list(MODELS_DIR.glob("*.tflite")) + list(MODELS_DIR.glob("*.keras"))
    
    return {
        "total_images": len(images),
        "classes": 4,
        "models": len(models),
        "images_by_class": {
            d.name: len(list(d.glob("*"))) 
            for d in TRAINING_DATA_DIR.iterdir() if d.is_dir()
        }
    }


# ------------ Training Images ------------

@app.get("/api/images", response_model=List[TrainingImage])
async def list_images():
    """List all training images."""
    return get_training_images()


@app.post("/api/images/upload")
async def upload_image(
    file: UploadFile = File(...),
    disease_class: DiseaseClass = Form(...)
):
    """Upload a training image."""
    # Create class directory
    class_dir = TRAINING_DATA_DIR / disease_class.value
    class_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    ext = Path(file.filename).suffix
    new_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = class_dir / new_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {
        "message": "Image uploaded successfully",
        "filename": new_filename,
        "disease_class": disease_class.value
    }


@app.get("/api/images/{disease_class}/{filename}")
async def get_image(disease_class: str, filename: str):
    """Serve a training image."""
    file_path = TRAINING_DATA_DIR / disease_class / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)


@app.delete("/api/images/{disease_class}/{filename}")
async def delete_image(disease_class: str, filename: str):
    """Delete a training image."""
    file_path = TRAINING_DATA_DIR / disease_class / filename
    if file_path.exists():
        file_path.unlink()
        return {"message": "Image deleted"}
    raise HTTPException(status_code=404, detail="Image not found")


# ------------ Disease Info ------------

@app.get("/api/diseases")
async def list_diseases():
    """Get all disease information."""
    return load_disease_info()


@app.get("/api/diseases/{disease_id}")
async def get_disease(disease_id: str):
    """Get specific disease information."""
    diseases = load_disease_info()
    if disease_id not in diseases:
        raise HTTPException(status_code=404, detail="Disease not found")
    return diseases[disease_id]


@app.put("/api/diseases/{disease_id}")
async def update_disease(disease_id: str, data: DiseaseInfoUpdate):
    """Update disease information."""
    diseases = load_disease_info()
    if disease_id not in diseases:
        raise HTTPException(status_code=404, detail="Disease not found")
    
    # Update only provided fields
    for field, value in data.dict(exclude_none=True).items():
        diseases[disease_id][field] = value
    
    save_disease_info(diseases)
    return diseases[disease_id]


# ------------ Model Training ------------

@app.get("/api/training/status", response_model=TrainingStatus)
async def get_training_status():
    """Get current training status."""
    return training_state


@app.post("/api/training/start")
async def start_training(background_tasks: BackgroundTasks):
    """Start model training in background."""
    if training_state["status"] == "running":
        raise HTTPException(status_code=400, detail="Training already in progress")
    
    background_tasks.add_task(run_training)
    training_state["status"] = "starting"
    training_state["message"] = "Training starting..."
    
    return {"message": "Training started"}


# ------------ Models ------------

@app.get("/api/models", response_model=List[ModelInfo])
async def list_models():
    """List available models."""
    models = []
    for model_path in MODELS_DIR.iterdir():
        if model_path.suffix in ['.tflite', '.keras', '.h5']:
            stat = model_path.stat()
            models.append(ModelInfo(
                name=model_path.name,
                size_mb=stat.st_size / (1024 * 1024),
                created_at=datetime.fromtimestamp(stat.st_mtime).isoformat(),
                type="tflite" if model_path.suffix == ".tflite" else "keras"
            ))
    return models


@app.get("/api/models/{model_name}/download")
async def download_model(model_name: str):
    """Download a model file."""
    model_path = MODELS_DIR / model_name
    if not model_path.exists():
        raise HTTPException(status_code=404, detail="Model not found")
    return FileResponse(model_path, filename=model_name)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
