def analyze_risk(current_glucose, predicted_glucose):
    
    # Use the higher of current and predicted glucose
    glucose = max(current_glucose, predicted_glucose)

    # Prototype risk classification
    if glucose < 70:
        risk = "HIGH RISK"
        level = "🔴"
        message = "Glucose is below the prototype safety range."

    elif glucose < 140:
        risk = "NORMAL"
        level = "🟢"
        message = "Glucose level is within the prototype normal range."

    elif glucose < 180:
        risk = "WARNING"
        level = "🟡"
        message = "Glucose is elevated. Continue monitoring the trend."

    else:
        risk = "HIGH RISK"
        level = "🔴"
        message = "Glucose is significantly elevated. Monitoring is recommended."

    return {
        "risk": risk,
        "level": level,
        "message": message
    }


# Test the risk analyzer
if __name__ == "__main__":

    current = 150
    predicted = 175

    result = analyze_risk(current, predicted)

    print("\n===== VITALS RISK ANALYSIS =====")

    print("Current Glucose  :", current, "mg/dL")
    print("Predicted Glucose:", predicted, "mg/dL")
    print("Risk             :", result["level"], result["risk"])
    print("Message          :", result["message"])

    print("================================")