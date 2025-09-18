from fastapi import FastAPI
import joblib
import pandas as pd
from . import schemas
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# Load your trained model
BASE_DIR = os.path.dirname(__file__)
model_path = os.path.join(BASE_DIR, 'house_price_rf_model.joblib')
model = joblib.load(model_path)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or specify your React URL
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def get_root():
    return {"data": "hello world"}

@app.post("/predict")
def predict_price(house: schemas.house):
    # Convert JSON input to DataFrame for sklearn
    input_data = pd.DataFrame([house.dict()])

    # Predict
    pred_price = model.predict(input_data)[0]
    print(pred_price)
    return {"predicted_price": pred_price}

