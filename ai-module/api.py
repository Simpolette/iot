from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI()

origins = [
    "http://localhost:8800",
    "http://localhost:5500",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load('weather_model.pkl')

class WeatherRequest(BaseModel):
    temperature: float
    humidity: float

@app.post("/predict")
def predict_weather(data: WeatherRequest):
    # Extract data from the request
    features = [[data.temperature, data.humidity]]
    
    # Make the prediction
    prediction = model.predict(features)
    probability = model.predict_proba(features).max()
    
    result = "Rain" if prediction[0] == 1 else "No Rain"
    
    return {
        "prediction": result,
        "confidence": f"{probability * 100:.2f}%",
        "input_received": data
    }

@app.get("/")
def home():
    return {"message": "Weather API is running!"}