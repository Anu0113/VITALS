import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler


# 1. Load the glucose data
data = pd.read_csv("data/glucose_data.csv")

data["timestamp"] = pd.to_datetime(data["timestamp"])

glucose = data["glucose"].values.reshape(-1, 1)


# 2. Normalize glucose values
scaler = MinMaxScaler(feature_range=(0, 1))

scaled_glucose = scaler.fit_transform(glucose)


# 3. Create sequences for LSTM
sequence_length = 12

X = []
y = []

for i in range(sequence_length, len(scaled_glucose)):

    sequence = scaled_glucose[i - sequence_length:i]
    target = scaled_glucose[i]

    X.append(sequence)
    y.append(target)


X = np.array(X)
y = np.array(y)


# 4. Split into training and testing data
split_index = int(len(X) * 0.8)

X_train = X[:split_index]
X_test = X[split_index:]

y_train = y[:split_index]
y_test = y[split_index:]


# 5. Print information
print("Data preparation complete!")

print("\nOriginal data:")
print("Total glucose readings:", len(glucose))

print("\nLSTM data:")
print("X shape:", X.shape)
print("y shape:", y.shape)

print("\nTraining data:")
print("X_train:", X_train.shape)
print("y_train:", y_train.shape)

print("\nTesting data:")
print("X_test:", X_test.shape)
print("y_test:", y_test.shape)


# 6. Save the prepared data
np.save("data/X_train.npy", X_train)
np.save("data/X_test.npy", X_test)
np.save("data/y_train.npy", y_train)
np.save("data/y_test.npy", y_test)

# Save scaler values
np.save("data/scaler_min.npy", scaler.data_min_)
np.save("data/scaler_max.npy", scaler.data_max_)

print("\nPrepared LSTM data saved successfully!")