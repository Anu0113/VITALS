from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.glucose_monitor import load_glucose_data
from src.vitals_ai import get_vitals_ai
from src.simulation import (
    generate_sensor_signal,
    simulate_closed_loop,
)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="VITALS Simulation API",
    description=(
        "Research prototype API for the "
        "VITALS simulation platform."
    ),
    version="1.0.0",
)


# ============================================================
# CORS CONFIGURATION
# ============================================================
#
# Local development:
#   http://localhost:5173
#   http://127.0.0.1:5173
#
# Production:
#   Replace the Vercel URL below with your real
#   deployed frontend URL after deployment.
#
# Example:
#   https://vitals-project.vercel.app
#
# ============================================================

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://vitals-mauve-mu.vercel.app"

   
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():
    return {
        "project": "VITALS",
        "status": "online",
        "mode": "research simulation",
        "message": "VITALS API is running successfully.",
    }


# ============================================================
# HEALTH CHECK ENDPOINT
# ============================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "VITALS Simulation API",
    }


# ============================================================
# MAIN VITALS ENDPOINT
# ============================================================

@app.get("/api/vitals")
def vitals_state():

    # --------------------------------------------------------
    # AI PREDICTION
    # --------------------------------------------------------

    ai = get_vitals_ai()

    current_glucose = float(
        ai["current_glucose"]
    )

    predicted_glucose = float(
        ai["predicted_glucose"]
    )


    # --------------------------------------------------------
    # SENSOR SIGNAL SIMULATION
    # --------------------------------------------------------

    sensor_signal = generate_sensor_signal(
        current_glucose
    )


    # --------------------------------------------------------
    # CLOSED-LOOP CONCEPT SIMULATION
    # --------------------------------------------------------

    loop = simulate_closed_loop(
        current_glucose,
        predicted_glucose,
    )


    # --------------------------------------------------------
    # LOAD RECENT GLUCOSE READINGS
    # --------------------------------------------------------

    data = load_glucose_data()

    recent = (
        data["glucose"]
        .tail(4)
        .astype(float)
        .round(2)
        .tolist()
    )


    # --------------------------------------------------------
    # API RESPONSE
    # --------------------------------------------------------

    return {
        "current_glucose": current_glucose,

        "predicted_glucose": predicted_glucose,

        "change": float(
            ai["change"]
        ),

        "trend": str(
            ai["trend"]
        ),

        "risk": str(
            ai["risk"]
        ),

        "risk_icon": str(
            ai["risk_icon"]
        ),

        "message": str(
            ai["message"]
        ),

        "sensor_signal": float(
            sensor_signal
        ),

        "recent_readings": recent,

        "closed_loop": loop,

        "disclaimer": (
            "Research simulation only. "
            "Not clinically validated. "
            "The simulated response does not "
            "calculate, recommend, or administer "
            "a real insulin dose."
        ),
    }