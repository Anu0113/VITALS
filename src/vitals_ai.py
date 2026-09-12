import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model

from src.risk_analyzer import analyze_risk


# --------------------------------------------------
# File paths
# --------------------------------------------------

MODEL_PATH = "models/glucose_lstm.keras"
DATA_PATH = "data/glucose_data.csv"
SCALER_MIN_PATH = "data/scaler_min.npy"
SCALER_MAX_PATH = "data/scaler_max.npy"


# --------------------------------------------------
# VITALS AI ENGINE
# --------------------------------------------------

def get_vitals_ai():

    # Load trained LSTM model
    model = load_model(MODEL_PATH)

    # Load glucose data
    data = pd.read_csv(DATA_PATH)

    data["timestamp"] = pd.to_datetime(data["timestamp"])

    # Load scaler values
    scaler_min = float(np.load(SCALER_MIN_PATH)[0])
    scaler_max = float(np.load(SCALER_MAX_PATH)[0])

    # Get latest 12 glucose readings
    latest_glucose = data["glucose"].values[-12:]

    # Normalize glucose readings
    scaled_glucose = (
        (latest_glucose - scaler_min)
        / (scaler_max - scaler_min)
    )

    # Prepare input for LSTM
    X = scaled_glucose.reshape(1, 12, 1)

    # Predict next glucose value
    prediction = model.predict(X, verbose=0)

    predicted_scaled = float(prediction[0][0])

    # Convert prediction back to mg/dL
    predicted_glucose = (
        predicted_scaled * (scaler_max - scaler_min)
        + scaler_min
    )

    # Current glucose
    current_glucose = float(latest_glucose[-1])

    # Calculate expected change
    change = predicted_glucose - current_glucose

    # Determine glucose trend
    if change > 5:
        trend = "Rising"

    elif change < -5:
        trend = "Falling"

    else:
        trend = "Stable"

    # Analyze risk
    risk_result = analyze_risk(
        current_glucose,
        predicted_glucose
    )

    # Return complete AI result
    result = {

        "current_glucose": round(
            current_glucose, 2
        ),

        "predicted_glucose": round(
            predicted_glucose, 2
        ),

        "change": round(
            change, 2
        ),

        "trend": trend,

        "risk": risk_result["risk"],

        "risk_icon": risk_result["level"],

        "message": risk_result["message"]
    }

    return result


# --------------------------------------------------
# Test the AI engine
# --------------------------------------------------

if __name__ == "__main__":

    result = get_vitals_ai()

    print("\n========================================")
    print("          VITALS AI ENGINE")
    print("========================================")

    print(
        f"Current Glucose   : "
        f"{result['current_glucose']} mg/dL"
    )

    print(
        f"Predicted Glucose : "
        f"{result['predicted_glucose']} mg/dL"
    )

    print(
        f"Expected Change   : "
        f"{result['change']:+.2f} mg/dL"
    )

    print(
        f"Glucose Trend     : "
        f"{result['trend']}"
    )

    print(
        f"Risk              : "
        f"{result['risk_icon']} "
        f"{result['risk']}"
    )

    print(
        f"AI Insight        : "
        f"{result['message']}"
    )

    print("========================================")