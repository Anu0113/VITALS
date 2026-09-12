import numpy as np
import matplotlib.pyplot as plt
from tensorflow.keras.models import load_model
from sklearn.metrics import mean_absolute_error, mean_squared_error


# 1. Load the trained model
model = load_model("models/glucose_lstm.keras")


# 2. Load test data
X_test = np.load("data/X_test.npy")
y_test = np.load("data/y_test.npy")


# 3. Make predictions
predictions = model.predict(X_test, verbose=0)


# 4. Load scaler values
scaler_min = np.load("data/scaler_min.npy")[0]
scaler_max = np.load("data/scaler_max.npy")[0]


# 5. Convert normalized values back to mg/dL
actual_glucose = (
    y_test.flatten() * (scaler_max - scaler_min)
    + scaler_min
)

predicted_glucose = (
    predictions.flatten() * (scaler_max - scaler_min)
    + scaler_min
)


# 6. Calculate MAE
mae = mean_absolute_error(
    actual_glucose,
    predicted_glucose
)


# 7. Calculate RMSE
rmse = np.sqrt(
    mean_squared_error(
        actual_glucose,
        predicted_glucose
    )
)


# 8. Display results
print("\n===== VITALS LSTM MODEL EVALUATION =====")

print(f"MAE  : {mae:.2f} mg/dL")
print(f"RMSE : {rmse:.2f} mg/dL")

print("========================================")


# 9. Show first 10 predictions
print("\nSample Predictions:")

for i in range(10):

    print(
        f"Actual: {actual_glucose[i]:.2f} mg/dL"
        f"   |   Predicted: {predicted_glucose[i]:.2f} mg/dL"
    )


# 10. Create comparison graph
plt.figure(figsize=(12, 5))

plt.plot(
    actual_glucose,
    label="Actual Glucose"
)

plt.plot(
    predicted_glucose,
    label="Predicted Glucose"
)

plt.title("VITALS - Actual vs Predicted Glucose")

plt.xlabel("Test Sample")

plt.ylabel("Glucose (mg/dL)")

plt.legend()

plt.tight_layout()

plt.show()