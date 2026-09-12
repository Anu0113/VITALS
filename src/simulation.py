import random


def generate_sensor_signal(glucose):
    """
    Simulates conversion of glucose concentration
    into an electrical sensor signal.
    """

    base_signal = glucose * 0.82
    noise = random.uniform(-2.5, 2.5)

    return round(base_signal + noise, 2)


def simulate_closed_loop(current_glucose, predicted_glucose):

    difference = predicted_glucose - current_glucose

    if difference > 5:
        decision = "MONITOR / RESPONSE REQUIRED"
        response = "Simulated corrective response"
    elif difference < -5:
        decision = "MONITOR / AVOID CORRECTION"
        response = "No simulated delivery"
    else:
        decision = "GLUCOSE STABLE"
        response = "No simulated delivery"

    return {
        "sensor_glucose": round(current_glucose, 2),
        "predicted_glucose": round(predicted_glucose, 2),
        "difference": round(difference, 2),
        "decision": decision,
        "response": response
    }