import pandas as pd
import plotly.graph_objects as go


def load_glucose_data():
    data = pd.read_csv("data/glucose_data.csv")
    data["timestamp"] = pd.to_datetime(data["timestamp"])
    return data


def create_glucose_chart(data):

    fig = go.Figure()

    fig.add_trace(
        go.Scatter(
            x=data["timestamp"],
            y=data["glucose"],
            mode="lines",
            name="Glucose"
        )
    )

    fig.update_layout(
        title="Glucose Levels Over Time",
        xaxis_title="Time",
        yaxis_title="Glucose (mg/dL)",
        hovermode="x unified",
        height=450
    )

    return fig