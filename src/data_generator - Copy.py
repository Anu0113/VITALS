import numpy as np
import pandas as pd


def generate_glucose_data(days=7):
    """
    Generate simulated glucose data for a VITALS prototype.
    """

    readings_per_day = 96       # One reading every 15 minutes
    total_readings = days * readings_per_day

    time = pd.date_range(
        start="2026-01-01 00:00",
        periods=total_readings,
        freq="15min"
    )

    # Start with a normal baseline
    glucose = np.full(total_readings, 110.0)

    for i in range(total_readings):

        hour = time[i].hour + time[i].minute / 60

        # Natural day-to-day glucose variation
        daily_variation = 10 * np.sin((hour / 24) * 2 * np.pi)

        # Random sensor variation
        random_variation = np.random.normal(0, 5)

        glucose[i] += daily_variation + random_variation

        # Breakfast response
        if 8 <= hour < 9.5:
            glucose[i] += 35

        # Lunch response
        elif 13 <= hour < 14.5:
            glucose[i] += 45

        # Dinner response
        elif 19 <= hour < 20.5:
            glucose[i] += 40

    # Keep glucose values within a reasonable simulation range
    glucose = np.clip(glucose, 70, 220)

    data = pd.DataFrame({
        "timestamp": time,
        "glucose": np.round(glucose, 2)
    })

    return data


if __name__ == "__main__":

    data = generate_glucose_data(days=7)

    print(data.head(20))

    print("\nTotal readings:", len(data))

    print("\nGlucose statistics:")
    print(data["glucose"].describe())

    # Save the simulated sensor data
    data.to_csv("data/glucose_data.csv", index=False)

    print("\nGlucose data saved successfully!")