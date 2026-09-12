import numpy as np
from tensorflow.keras.models import load_model


# Load trained LSTM model
model = load_model("models/glucose_lstm.keras")


# Load glucose data
data = np.load("data/X_test.npy")

# Load scaler information
scaler_min = np.load("data/scaler_min.npy")
scaler_max = np.load("data/scaler_max.npy")


# Get the latest 12 glucose readings
latest_sequence = data[-1]

# Reshape for LSTM
latest_sequence = latest_sequence.reshape(1, 12, 1)


# Predict next glucose value
prediction = model.predict(latest_sequence, verbose=0)

predicted_scaled = prediction[0][0]


# Convert normalized value back to mg/dL
predicted_glucose = (
    predicted_scaled * (scaler_max[0] - scaler_min[0])
    + scaler_min[0]
)


# Get current glucose
current_scaled = latest_sequence[0, -1, 0]

current_glucose = (
    current_scaled * (scaler_max[0] - scaler_min[0])
    + scaler_min[0]
)


# Calculate change
change = predicted_glucose - current_glucose


# Determine glucose trend
if change > 5:
    trend = "Rising"
elif change < -5:
    trend = "Falling"
else:
    trend = "Stable"


# Display results
print("\n===== VITALS AI GLUCOSE PREDICTION =====")

print(f"Current Glucose   : {current_glucose:.2f} mg/dL")
print(f"Predicted Glucose : {predicted_glucose:.2f} mg/dL")
print(f"Expected Change   : {change:+.2f} mg/dL")
print(f"Glucose Trend     : {trend}")

print("========================================")