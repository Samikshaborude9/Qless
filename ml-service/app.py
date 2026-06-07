from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import os

app = FastAPI()

MODEL_FOLDER = "models"
models = {}

# Request schema
class PredictionRequest(BaseModel):
    food_item: str
    datetime_str: str


# Load models at startup
@app.on_event("startup")
def load_models():
    if not os.path.exists(MODEL_FOLDER):
        raise Exception("Models folder not found")

    for file in os.listdir(MODEL_FOLDER):
        if file.endswith(".pkl"):
            name = file.replace(".pkl", "")
            try:
                models[name] = joblib.load(os.path.join(MODEL_FOLDER, file))
            except Exception as e:
                print(f"Error loading {file}: {e}")

    print(f"Loaded {len(models)} models")


@app.get("/")
def home():
    return {"status": "ML service running"}


@app.post("/predict")
def predict(request: PredictionRequest):
    food_item = request.food_item
    datetime_str = request.datetime_str

    if food_item not in models:
        raise HTTPException(status_code=404, detail=f"No model for {food_item}")

    try:
        model = models[food_item]

        future = pd.DataFrame({
            "ds": pd.to_datetime([datetime_str])
        })

        forecast = model.predict(future)
        demand = int(forecast["yhat"].iloc[0])

        return {
            "food_item": food_item,
            "datetime": datetime_str,
            "predicted_demand": demand
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))