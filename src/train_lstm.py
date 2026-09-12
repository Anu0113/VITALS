import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense


# 1. Load prepared training data
X_train = np.load("data/X_train.npy")
X_test = np.load("data/X_test.npy")

y_train = np.load("data/y_train.npy")
y_test = np.load("data/y_test.npy")


print("Training data loaded!")
print("X_train shape:", X_train.shape)
print("y_train shape:", y_train.shape)


# 2. Create the LSTM model
model = Sequential()

model.add(
    LSTM(
        64,
        input_shape=(X_train.shape[1], X_train.shape[2])
    )
)

model.add(Dense(32, activation="relu"))

model.add(Dense(1))


# 3. Compile the model
model.compile(
    optimizer="adam",
    loss="mean_squared_error"
)


# 4. Display model structure
model.summary()


# 5. Train the model
print("\nStarting LSTM training...\n")

history = model.fit(
    X_train,
    y_train,
    epochs=50,
    batch_size=16,
    validation_data=(X_test, y_test),
    verbose=1
)


# 6. Evaluate the model
loss = model.evaluate(X_test, y_test)

print("\nModel evaluation complete!")
print("Test Loss:", loss)


# 7. Save the trained model
model.save("models/glucose_lstm.keras")

print("\nLSTM model saved successfully!")
print("Location: models/glucose_lstm.keras")