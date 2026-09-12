import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import streamlit.components.v1 as components

from src.glucose_monitor import load_glucose_data
from src.vitals_ai import get_vitals_ai
from src.simulation import generate_sensor_signal, simulate_closed_loop


# ============================================================
# PAGE CONFIG
# ============================================================

st.set_page_config(
    page_title="VITALS | Intelligent Transdermal System",
    page_icon="💠",
    layout="wide",
    initial_sidebar_state="expanded"
)


# ============================================================
# GLOBAL CSS
# ============================================================

st.markdown("""
<style>

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

html, body, [class*="css"] {
    font-family: 'Inter', sans-serif;
}

.stApp {
    background:
        radial-gradient(
            circle at 75% 10%,
            rgba(23, 105, 153, 0.12),
            transparent 30%
        ),
        #06111f;
    color: #f5f9ff;
}

.main .block-container {
    max-width: 1450px;
    padding: 2.2rem 3rem 4rem 3rem;
}


/* =========================================================
   SIDEBAR
   ========================================================= */

section[data-testid="stSidebar"] {
    background:
        linear-gradient(
            180deg,
            #071626 0%,
            #081827 60%,
            #06121f 100%
        );

    border-right: 1px solid #17354d;
}

.sidebar-logo {
    font-size: 31px;
    font-weight: 800;
    color: #37c4ff;
    letter-spacing: -1px;
}

.sidebar-description {
    color: #668eaf;
    font-size: 11px;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    margin-top: 4px;
    margin-bottom: 28px;
}

.sidebar-heading {
    color: #5c91b7;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.8px;
    text-transform: uppercase;
    margin-top: 24px;
    margin-bottom: 10px;
}

.device-card {
    background: rgba(17, 48, 69, 0.65);
    border: 1px solid #1b4560;
    border-radius: 12px;
    padding: 13px 14px;
    margin-bottom: 9px;
}

.device-name {
    color: #e8f4fc;
    font-size: 13px;
    font-weight: 600;
}

.device-status {
    color: #4ee6ae;
    font-size: 11px;
    margin-top: 4px;
}


/* =========================================================
   HEADER
   ========================================================= */

.vitals-title {
    font-size: 48px;
    font-weight: 800;
    letter-spacing: -2px;
    margin: 0;
}

.vitals-title span {
    color: #36c2ff;
}

.vitals-subtitle {
    color: #6795b9;
    font-size: 15px;
    margin-top: 3px;
}

.active-pill {
    background: rgba(20, 101, 81, 0.32);
    border: 1px solid #1c765e;
    border-radius: 30px;
    color: #50e6b0;
    font-weight: 700;
    font-size: 12px;
    padding: 12px 22px;
    text-align: center;
}


/* =========================================================
   SECTION
   ========================================================= */

.section-title {
    font-size: 27px;
    font-weight: 750;
    margin-top: 28px;
    margin-bottom: 4px;
}

.section-description {
    color: #7195b3;
    font-size: 14px;
    margin-bottom: 20px;
}


/* =========================================================
   METRIC CARDS
   ========================================================= */

.metric-card {
    background:
        linear-gradient(
            145deg,
            rgba(15, 42, 63, 0.95),
            rgba(8, 25, 40, 0.95)
        );

    border: 1px solid #1a4865;
    border-radius: 18px;
    padding: 22px;
    min-height: 150px;

    box-shadow:
        0 12px 30px rgba(0,0,0,0.20);
}

.metric-label {
    color: #75a1c2;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.metric-value {
    color: #ffffff;
    font-size: 31px;
    font-weight: 750;
    margin-top: 13px;
}

.metric-small {
    color: #648ba8;
    font-size: 12px;
    margin-top: 7px;
}


/* =========================================================
   INFORMATION BOXES
   ========================================================= */

.info-panel {
    background: linear-gradient(
        135deg,
        #0c2944,
        #0a1d30
    );

    border: 1px solid #18547c;
    border-radius: 16px;
    padding: 20px;
}

.info-title {
    color: #7dcaff;
    font-weight: 700;
    font-size: 14px;
    margin-bottom: 8px;
}

.info-text {
    color: #a9c4d9;
    font-size: 13px;
    line-height: 1.7;
}


/* =========================================================
   SIMULATION CARDS
   ========================================================= */

.sim-card {
    background: #091b2b;
    border: 1px solid #173f59;
    border-radius: 18px;
    padding: 22px;
}

.sim-title {
    font-size: 20px;
    font-weight: 700;
}

.sim-subtitle {
    color: #7196b4;
    font-size: 13px;
    margin-top: 5px;
}


/* =========================================================
   FOOTER
   ========================================================= */

.footer {
    text-align: center;
    color: #4f7089;
    font-size: 11px;
    margin-top: 50px;
    padding-top: 20px;
    border-top: 1px solid #173047;
}

</style>
""", unsafe_allow_html=True)


# ============================================================
# LOAD VITALS DATA
# ============================================================

data = load_glucose_data()
ai = get_vitals_ai()

current_glucose = ai["current_glucose"]
predicted_glucose = ai["predicted_glucose"]
change = ai["change"]
trend = ai["trend"]
risk = ai["risk"]
risk_icon = ai["risk_icon"]
message = ai["message"]

sensor_signal = generate_sensor_signal(current_glucose)

closed_loop = simulate_closed_loop(
    current_glucose,
    predicted_glucose
)


# ============================================================
# SIDEBAR
# ============================================================

with st.sidebar:

    st.markdown(
        '<div class="sidebar-logo">💠 VITALS</div>',
        unsafe_allow_html=True
    )

    st.markdown(
        '<div class="sidebar-description">'
        'Intelligent Transdermal System'
        '</div>',
        unsafe_allow_html=True
    )

    st.divider()

    st.markdown(
        '<div class="sidebar-heading">Main Navigation</div>',
        unsafe_allow_html=True
    )

    page = st.radio(
        "Navigation",
        [
            "🏠 Overview",
            "🩹 Sensor Simulation",
            "🧠 AI Prediction",
            "🔄 Closed-Loop Simulation",
            "💠 Patch Status",
            "📊 Reports"
        ],
        label_visibility="collapsed"
    )

    st.divider()

    st.markdown(
        '<div class="sidebar-heading">System Status</div>',
        unsafe_allow_html=True
    )

    st.markdown("""
    <div class="device-card">
        <div class="device-name">💠 VITALS Patch</div>
        <div class="device-status">● CONNECTED</div>
    </div>

    <div class="device-card">
        <div class="device-name">💧 Glucose Sensor</div>
        <div class="device-status">● ACTIVE</div>
    </div>

    <div class="device-card">
        <div class="device-name">🧠 AI Engine</div>
        <div class="device-status">● ONLINE</div>
    </div>

    <div class="device-card">
        <div class="device-name">⌚ Wearable Interface</div>
        <div class="device-status">● READY</div>
    </div>
    """, unsafe_allow_html=True)

    st.divider()

    st.caption("VITALS Research Prototype")
    st.caption("Simulation Mode")


# ============================================================
# HEADER
# ============================================================

header1, header2 = st.columns([4, 1])

with header1:

    st.markdown(
        '<div class="vitals-title">💠 <span>VITALS</span></div>',
        unsafe_allow_html=True
    )

    st.markdown(
        '<div class="vitals-subtitle">'
        'Versatile Intelligent Transdermal Adaptive Layered System'
        '</div>',
        unsafe_allow_html=True
    )

with header2:

    st.markdown(
        '<div class="active-pill">● SYSTEM ACTIVE</div>',
        unsafe_allow_html=True
    )

st.divider()


# ============================================================
# OVERVIEW
# ============================================================

if page == "🏠 Overview":

    st.markdown(
        '<div class="section-title">Patient Overview</div>',
        unsafe_allow_html=True
    )

    st.markdown(
        '<div class="section-description">'
        'Real-time simulated monitoring with AI-assisted prediction'
        '</div>',
        unsafe_allow_html=True
    )


    # --------------------------------------------------------
    # METRICS
    # --------------------------------------------------------

    c1, c2, c3, c4 = st.columns(4)

    with c1:

        st.markdown(
            f"""
            <div class="metric-card">
                <div class="metric-label">💧 Current Glucose</div>
                <div class="metric-value">{current_glucose:.2f}</div>
                <div class="metric-small">
                    mg/dL • Sensor reading
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

    with c2:

        st.markdown(
            f"""
            <div class="metric-card">
                <div class="metric-label">🧠 AI Prediction</div>
                <div class="metric-value">{predicted_glucose:.2f}</div>
                <div class="metric-small">
                    mg/dL • Next predicted value
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

    with c3:

        st.markdown(
            f"""
            <div class="metric-card">
                <div class="metric-label">📈 Glucose Trend</div>
                <div class="metric-value">{trend}</div>
                <div class="metric-small">
                    Expected change: {change:+.2f} mg/dL
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

    with c4:

        st.markdown(
            f"""
            <div class="metric-card">
                <div class="metric-label">⚠️ Risk Status</div>
                <div class="metric-value">
                    {risk_icon} {risk}
                </div>
                <div class="metric-small">
                    Prototype classification
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )


    # --------------------------------------------------------
    # GRAPH
    # --------------------------------------------------------

    st.markdown(
        '<div class="section-title">📊 Glucose Monitoring</div>',
        unsafe_allow_html=True
    )

    st.markdown(
        '<div class="section-description">'
        'Simulated continuous glucose readings from the VITALS sensor'
        '</div>',
        unsafe_allow_html=True
    )

    fig = go.Figure()

    fig.add_trace(
        go.Scatter(
            x=data["timestamp"],
            y=data["glucose"],
            mode="lines",
            line=dict(
                color="#39bfff",
                width=2.5
            ),
            hovertemplate=
            "<b>%{y:.1f} mg/dL</b><br>"
            "%{x}<extra></extra>"
        )
    )

    fig.update_layout(
        height=430,
        paper_bgcolor="#091b2b",
        plot_bgcolor="#091b2b",
        font=dict(
            color="#d9eaf7"
        ),
        margin=dict(
            l=20,
            r=20,
            t=20,
            b=20
        ),
        xaxis=dict(
            title="Time",
            gridcolor="#17354a"
        ),
        yaxis=dict(
            title="Glucose (mg/dL)",
            gridcolor="#17354a"
        ),
        hovermode="x unified"
    )

    st.plotly_chart(
        fig,
        use_container_width=True
    )


    # --------------------------------------------------------
    # AI + SYSTEM
    # --------------------------------------------------------

    left, right = st.columns(2)

    with left:

        st.markdown(
            '<div class="section-title">🧠 AI Interpretation</div>',
            unsafe_allow_html=True
        )

        st.markdown(
            f"""
            <div class="info-panel">
                <div class="info-title">
                    VITALS Intelligence
                </div>

                <div class="info-text">
                    {message}
                    <br><br>
                    <b>Predicted trend:</b> {trend}
                    <br>
                    <b>Expected change:</b> {change:+.2f} mg/dL
                    <br>
                    <b>Prototype risk:</b> {risk}
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

    with right:

        st.markdown(
            '<div class="section-title">💠 System Health</div>',
            unsafe_allow_html=True
        )

        st.markdown(
            """
            <div class="info-panel">

                <div class="info-title">
                    Device Network
                </div>

                <div class="info-text">
                    💠 Patch ................ <b>CONNECTED</b><br>
                    💧 Glucose Sensor ...... <b>ACTIVE</b><br>
                    🧠 AI Engine ........... <b>ONLINE</b><br>
                    ⌚ Wearable ............. <b>READY</b><br>
                    📡 Data Stream .......... <b>ACTIVE</b>
                </div>

            </div>
            """,
            unsafe_allow_html=True
        )


# ============================================================
# SENSOR SIMULATION
# ============================================================

elif page == "🩹 Sensor Simulation":

    st.markdown(
        '<div class="section-title">🩹 Microneedle Glucose-Sensing Simulation</div>',
        unsafe_allow_html=True
    )

    st.markdown(
        '<div class="section-description">'
        'Visual simulation of how VITALS converts interstitial-fluid information '
        'into a digital glucose reading'
        '</div>',
        unsafe_allow_html=True
    )


    # --------------------------------------------------------
    # ANIMATED SENSOR PIPELINE
    # --------------------------------------------------------

    sensor_html = f"""
    <!DOCTYPE html>

    <html>

    <head>

    <style>

    body {{
        margin: 0;
        background: #091b2b;
        font-family: Arial, sans-serif;
        color: white;
    }}

    .pipeline {{
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 35px 15px;
    }}

    .node {{
        width: 145px;
        min-height: 120px;
        border: 1px solid #1b506f;
        border-radius: 16px;
        background: linear-gradient(
            145deg,
            #102c43,
            #091b2b
        );
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        box-shadow: 0 8px 25px rgba(0,0,0,.25);
    }}

    .icon {{
        font-size: 32px;
        margin-bottom: 10px;
    }}

    .title {{
        font-size: 13px;
        font-weight: bold;
    }}

    .small {{
        color: #6e9bb9;
        font-size: 10px;
        margin-top: 5px;
    }}

    .arrow {{
        color: #38c3ff;
        font-size: 28px;
        animation: pulse 1.5s infinite;
    }}

    @keyframes pulse {{
        0% {{
            opacity: .25;
            transform: translateX(-4px);
        }}

        50% {{
            opacity: 1;
            transform: translateX(4px);
        }}

        100% {{
            opacity: .25;
            transform: translateX(-4px);
        }}
    }}

    .signal {{
        width: 8px;
        height: 8px;
        background: #48e6b0;
        border-radius: 50%;
        box-shadow: 0 0 14px #48e6b0;
        position: absolute;
        animation: travel 4s linear infinite;
    }}

    @keyframes travel {{
        0% {{
            left: 7%;
        }}

        25% {{
            left: 30%;
        }}

        50% {{
            left: 52%;
        }}

        75% {{
            left: 73%;
        }}

        100% {{
            left: 94%;
        }}
    }}

    .signal-track {{
        position: relative;
        height: 4px;
        background: #173e57;
        margin: 0 8%;
        border-radius: 5px;
    }}

    </style>

    </head>

    <body>

        <div class="pipeline">

            <div class="node">
                <div class="icon">💧</div>
                <div class="title">Interstitial Fluid</div>
                <div class="small">Glucose molecules</div>
            </div>

            <div class="arrow">→</div>

            <div class="node">
                <div class="icon">🩹</div>
                <div class="title">Microneedle Sensor</div>
                <div class="small">On-skin sensing</div>
            </div>

            <div class="arrow">→</div>

            <div class="node">
                <div class="icon">⚡</div>
                <div class="title">Electrical Signal</div>
                <div class="small">Sensor response</div>
            </div>

            <div class="arrow">→</div>

            <div class="node">
                <div class="icon">🧠</div>
                <div class="title">Signal Processing</div>
                <div class="small">Data conversion</div>
            </div>

            <div class="arrow">→</div>

            <div class="node">
                <div class="icon">⌚</div>
                <div class="title">Digital Reading</div>
                <div class="small">Glucose display</div>
            </div>

        </div>

        <div class="signal-track">
            <div class="signal"></div>
        </div>

    </body>

    </html>
    """

    components.html(
        sensor_html,
        height=245,
        scrolling=False
    )


    st.write("")

    # --------------------------------------------------------
    # LIVE SENSOR VALUES
    # --------------------------------------------------------

    c1, c2, c3 = st.columns(3)

    with c1:

        st.markdown(
            f"""
            <div class="metric-card">
                <div class="metric-label">
                    💧 Glucose Concentration
                </div>

                <div class="metric-value">
                    {current_glucose:.2f}
                </div>

                <div class="metric-small">
                    mg/dL • Simulated
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

    with c2:

        st.markdown(
            f"""
            <div class="metric-card">
                <div class="metric-label">
                    ⚡ Sensor Signal
                </div>

                <div class="metric-value">
                    {sensor_signal}
                </div>

                <div class="metric-small">
                    Arbitrary prototype signal units
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

    with c3:

        st.markdown(
            """
            <div class="metric-card">
                <div class="metric-label">
                    📡 Data Stream
                </div>

                <div class="metric-value">
                    ACTIVE
                </div>

                <div class="metric-small">
                    Continuous simulated acquisition
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )


    st.write("")

    st.markdown(
        """
        <div class="info-panel">

            <div class="info-title">
                How the simulation works
            </div>

            <div class="info-text">

                The VITALS concept assumes that microneedles access
                interstitial fluid beneath the skin. The simulated sensor
                converts glucose-related information into an electrical
                signal. The prototype then processes this signal and
                represents it as a digital glucose concentration that can
                be displayed on a wearable interface.

            </div>

        </div>
        """,
        unsafe_allow_html=True
    )


# ============================================================
# AI PREDICTION
# ============================================================

elif page == "🧠 AI Prediction":

    st.markdown(
        '<div class="section-title">🧠 VITALS AI Engine</div>',
        unsafe_allow_html=True
    )

    st.markdown(
        '<div class="section-description">'
        'LSTM-based prediction of the next glucose value from recent readings'
        '</div>',
        unsafe_allow_html=True
    )


    c1, c2, c3 = st.columns(3)

    with c1:
        st.metric(
            "Current Glucose",
            f"{current_glucose:.2f} mg/dL"
        )

    with c2:
        st.metric(
            "Predicted Glucose",
            f"{predicted_glucose:.2f} mg/dL"
        )

    with c3:
        st.metric(
            "Expected Change",
            f"{change:+.2f} mg/dL"
        )


    st.write("")


    # AI visualization

    ai_html = f"""
    <div style="
        background:linear-gradient(135deg,#0c2944,#081b2d);
        border:1px solid #18547c;
        border-radius:18px;
        padding:30px;
        font-family:Arial;
        color:white;
    ">

        <div style="
            color:#65caff;
            font-size:12px;
            font-weight:bold;
            letter-spacing:1.5px;
        ">
            LSTM PREDICTION PIPELINE
        </div>

        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-top:28px;
        ">

            <div style="text-align:center;">
                <div style="font-size:30px;">💧</div>
                <b>Recent Data</b>
                <br>
                <span style="color:#6f9bb8;font-size:11px;">
                    12 readings
                </span>
            </div>

            <div style="color:#35c2ff;font-size:25px;">→</div>

            <div style="text-align:center;">
                <div style="font-size:30px;">🧠</div>
                <b>LSTM Model</b>
                <br>
                <span style="color:#6f9bb8;font-size:11px;">
                    Time-series analysis
                </span>
            </div>

            <div style="color:#35c2ff;font-size:25px;">→</div>

            <div style="text-align:center;">
                <div style="font-size:30px;">📈</div>
                <b>Prediction</b>
                <br>
                <span style="color:#6f9bb8;font-size:11px;">
                    {predicted_glucose:.2f} mg/dL
                </span>
            </div>

        </div>

    </div>
    """

    components.html(
        ai_html,
        height=210,
        scrolling=False
    )


    st.write("")

    if risk == "NORMAL":

        st.success(
            f"🟢 {message}"
        )

    elif risk == "WARNING":

        st.warning(
            f"🟡 {message}"
        )

    else:

        st.error(
            f"🔴 {message}"
        )


    st.markdown(
        """
        <div class="info-panel">

            <div class="info-title">
                AI Interpretation
            </div>

            <div class="info-text">

                The LSTM model uses recent simulated glucose readings
                as a time-series input and estimates the next glucose
                value. The predicted trend is then passed to the VITALS
                prototype risk-analysis layer.

                <br><br>

                <b>Important:</b> this is a research simulation.
                The AI prediction is not clinically validated and
                does not independently prescribe insulin or medication.

            </div>

        </div>
        """,
        unsafe_allow_html=True
    )


# ============================================================
# CLOSED LOOP SIMULATION
# ============================================================

elif page == "🔄 Closed-Loop Simulation":

    st.markdown(
        '<div class="section-title">🔄 Closed-Loop VITALS Simulation</div>',
        unsafe_allow_html=True
    )

    st.markdown(
        '<div class="section-description">'
        'Animated demonstration of the complete VITALS sensing → prediction '
        '→ response → monitoring loop'
        '</div>',
        unsafe_allow_html=True
    )


    # --------------------------------------------------------
    # MAIN LOOP ANIMATION
    # --------------------------------------------------------

    loop_html = """
    <!DOCTYPE html>

    <html>

    <head>

    <style>

    body {
        margin:0;
        background:#091b2b;
        font-family:Arial,sans-serif;
        color:white;
    }

    .container {
        padding:28px;
    }

    .loop {
        display:flex;
        justify-content:center;
        align-items:center;
        gap:10px;
        flex-wrap:wrap;
    }

    .stage {
        width:125px;
        height:110px;

        background:
            linear-gradient(
                145deg,
                #112d43,
                #091b2b
            );

        border:1px solid #1a4d6b;
        border-radius:16px;

        display:flex;
        flex-direction:column;
        justify-content:center;
        align-items:center;

        text-align:center;

        position:relative;

        animation:
            glow 4.5s infinite;
    }

    .stage:nth-child(1) {
        animation-delay:0s;
    }

    .stage:nth-child(2) {
        animation-delay:.75s;
    }

    .stage:nth-child(3) {
        animation-delay:1.5s;
    }

    .stage:nth-child(4) {
        animation-delay:2.25s;
    }

    .stage:nth-child(5) {
        animation-delay:3s;
    }

    .stage:nth-child(6) {
        animation-delay:3.75s;
    }

    .icon {
        font-size:30px;
        margin-bottom:7px;
    }

    .name {
        font-size:12px;
        font-weight:bold;
    }

    .desc {
        color:#7197b5;
        font-size:9px;
        margin-top:5px;
    }

    .arrow {
        font-size:25px;
        color:#36c3ff;
        animation: arrowPulse 1.3s infinite;
    }

    @keyframes glow {

        0%,100% {
            transform:scale(1);
            box-shadow:
                0 0 0 rgba(40,190,255,0);
        }

        12% {
            transform:scale(1.05);
            box-shadow:
                0 0 25px rgba(40,190,255,.35);
            border-color:#38c4ff;
        }

        25% {
            transform:scale(1);
        }

    }

    @keyframes arrowPulse {

        0%,100% {
            opacity:.35;
        }

        50% {
            opacity:1;
            text-shadow:
                0 0 15px #36c3ff;
        }

    }

    .loop-label {
        text-align:center;
        color:#63c8f5;
        font-size:11px;
        letter-spacing:1.5px;
        font-weight:bold;
        margin-bottom:20px;
    }

    </style>

    </head>

    <body>

    <div class="container">

        <div class="loop-label">
            CONTINUOUS CLOSED-LOOP SIMULATION
        </div>

        <div class="loop">

            <div class="stage">
                <div class="icon">🩹</div>
                <div class="name">Sensor</div>
                <div class="desc">Glucose acquisition</div>
            </div>

            <div class="arrow">→</div>

            <div class="stage">
                <div class="icon">💧</div>
                <div class="name">Glucose Reading</div>
                <div class="desc">Sensor data</div>
            </div>

            <div class="arrow">→</div>

            <div class="stage">
                <div class="icon">🧠</div>
                <div class="name">AI Prediction</div>
                <div class="desc">LSTM analysis</div>
            </div>

            <div class="arrow">→</div>

            <div class="stage">
                <div class="icon">⚙️</div>
                <div class="name">Decision Engine</div>
                <div class="desc">Risk evaluation</div>
            </div>

            <div class="arrow">→</div>

            <div class="stage">
                <div class="icon">💠</div>
                <div class="name">Simulated Response</div>
                <div class="desc">Prototype only</div>
            </div>

            <div class="arrow">→</div>

            <div class="stage">
                <div class="icon">📉</div>
                <div class="name">Glucose Response</div>
                <div class="desc">Simulated change</div>
            </div>

        </div>

    </div>

    </body>

    </html>
    """

    components.html(
        loop_html,
        height=280,
        scrolling=False
    )


    # --------------------------------------------------------
    # CURRENT LOOP DATA
    # --------------------------------------------------------

    st.markdown(
        '<div class="section-title">Current Simulation Cycle</div>',
        unsafe_allow_html=True
    )

    c1, c2, c3 = st.columns(3)

    with c1:

        st.markdown(
            f"""
            <div class="metric-card">
                <div class="metric-label">
                    💧 SENSOR READING
                </div>

                <div class="metric-value">
                    {current_glucose:.2f}
                </div>

                <div class="metric-small">
                    mg/dL
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

    with c2:

        st.markdown(
            f"""
            <div class="metric-card">
                <div class="metric-label">
                    🧠 AI FORECAST
                </div>

                <div class="metric-value">
                    {predicted_glucose:.2f}
                </div>

                <div class="metric-small">
                    mg/dL • predicted
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

    with c3:

        st.markdown(
            f"""
            <div class="metric-card">
                <div class="metric-label">
                    ⚙️ DECISION
                </div>

                <div class="metric-value" style="font-size:22px;">
                    {closed_loop["decision"]}
                </div>

                <div class="metric-small">
                    Prototype decision logic
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )


    st.write("")


    # --------------------------------------------------------
    # SIMULATED RESPONSE
    # --------------------------------------------------------

    st.markdown(
        """
        <div class="info-panel">

            <div class="info-title">
                💠 Simulated System Response
            </div>

            <div class="info-text">

                <b>System decision:</b>
                %s

                <br><br>

                <b>Prototype response:</b>
                %s

                <br><br>

                The simulated response is then fed back into the
                conceptual monitoring loop, where the next sensor
                reading can be evaluated again.

            </div>

        </div>
        """
        % (
            closed_loop["decision"],
            closed_loop["response"]
        ),
        unsafe_allow_html=True
    )


    st.write("")

    st.warning(
        "⚠️ SIMULATION ONLY — The closed-loop delivery component "
        "does not deliver real medication, calculate clinical doses, "
        "or replace medical decision-making."
    )


# ============================================================
# PATCH STATUS
# ============================================================

elif page == "💠 Patch Status":

    st.markdown(
        '<div class="section-title">💠 VITALS Patch Status</div>',
        unsafe_allow_html=True
    )

    st.markdown(
        '<div class="section-description">'
        'Simulated hardware and software status'
        '</div>',
        unsafe_allow_html=True
    )


    left, right = st.columns(2)

    with left:

        st.markdown(
            """
            <div class="device-card">
                <div class="device-name">💠 Microneedle Patch</div>
                <div class="device-status">● CONNECTED</div>
            </div>

            <div class="device-card">
                <div class="device-name">💧 Glucose Sensor</div>
                <div class="device-status">● ACTIVE</div>
            </div>

            <div class="device-card">
                <div class="device-name">⚡ Signal Processing</div>
                <div class="device-status">● ACTIVE</div>
            </div>

            <div class="device-card">
                <div class="device-name">🧠 AI Engine</div>
                <div class="device-status">● ONLINE</div>
            </div>
            """,
            unsafe_allow_html=True
        )

    with right:

        st.markdown(
            """
            <div class="info-panel">

                <div class="info-title">
                    System Architecture
                </div>

                <div class="info-text">

                    🩹 Microneedle layer
                    <br>
                    ↓
                    <br>
                    💧 Glucose sensing
                    <br>
                    ↓
                    <br>
                    ⚡ Signal processing
                    <br>
                    ↓
                    <br>
                    🧠 AI prediction
                    <br>
                    ↓
                    <br>
                    ⌚ Wearable interface

                </div>

            </div>
            """,
            unsafe_allow_html=True
        )


# ============================================================
# REPORTS
# ============================================================

elif page == "📊 Reports":

    st.markdown(
        '<div class="section-title">📊 VITALS Report</div>',
        unsafe_allow_html=True
    )

    st.markdown(
        '<div class="section-description">'
        'Summary of the simulated glucose monitoring session'
        '</div>',
        unsafe_allow_html=True
    )


    c1, c2, c3, c4 = st.columns(4)

    with c1:
        st.metric(
            "Total Readings",
            len(data)
        )

    with c2:
        st.metric(
            "Average",
            f"{data['glucose'].mean():.1f} mg/dL"
        )

    with c3:
        st.metric(
            "Minimum",
            f"{data['glucose'].min():.1f} mg/dL"
        )

    with c4:
        st.metric(
            "Maximum",
            f"{data['glucose'].max():.1f} mg/dL"
        )


    st.write("")

    fig = go.Figure()

    fig.add_trace(
        go.Scatter(
            x=data["timestamp"],
            y=data["glucose"],
            mode="lines",
            line=dict(
                color="#39bfff",
                width=2
            ),
            name="Glucose"
        )
    )

    fig.update_layout(
        height=400,
        paper_bgcolor="#091b2b",
        plot_bgcolor="#091b2b",
        font=dict(color="#d9eaf7"),
        xaxis=dict(gridcolor="#17354a"),
        yaxis=dict(gridcolor="#17354a"),
        margin=dict(l=20, r=20, t=20, b=20)
    )

    st.plotly_chart(
        fig,
        use_container_width=True
    )


    st.dataframe(
        data.tail(25),
        use_container_width=True,
        hide_index=True
    )


# ============================================================
# FOOTER
# ============================================================

st.markdown(
    """
    <div class="footer">

        💠 VITALS • Versatile Intelligent Transdermal Adaptive Layered System

        <br><br>

        Research Prototype • Simulation Environment •
        AI predictions are not medical advice

    </div>
    """,
    unsafe_allow_html=True
)