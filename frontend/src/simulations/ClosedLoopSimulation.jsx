import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CircleGauge,
  Droplets,
  RefreshCcw,
  ShieldAlert,
  Syringe,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import SimulationControls from "../components/SimulationControls";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api/vitals";

const STAGES = [
  {
    id: 0,
    title: "Sense",
    short: "Microneedle sensing",
    description:
      "The conceptual VITALS microneedle patch detects glucose activity from the simulated interstitial-fluid region.",
  },
  {
    id: 1,
    title: "Read",
    short: "Current glucose reading",
    description:
      "The sensor interaction is converted into a current glucose reading that can be used for monitoring.",
  },
  {
    id: 2,
    title: "Analyze",
    short: "AI input analysis",
    description:
      "Recent glucose readings are passed to the AI model so it can analyze the current trend.",
  },
  {
    id: 3,
    title: "Predict",
    short: "Future glucose prediction",
    description:
      "The LSTM-based AI estimates how the glucose level may change in the near future.",
  },
  {
    id: 4,
    title: "Risk Analysis",
    short: "Risk evaluation",
    description:
      "The system evaluates the current and predicted glucose levels to identify normal, monitor, warning, or high-risk conditions.",
  },
  {
    id: 5,
    title: "Decision",
    short: "Decision algorithm",
    description:
      "The decision layer determines whether continued monitoring or a conceptual response should be demonstrated.",
  },
  {
    id: 6,
    title: "Simulated Response",
    short: "Conceptual response",
    description:
      "A conceptual insulin-response animation is shown for demonstration only. No real dose is calculated or recommended.",
  },
  {
    id: 7,
    title: "Glucose Response",
    short: "Hypothetical response curve",
    description:
      "The interface shows a conceptual change in glucose after the simulated response stage.",
  },
  {
    id: 8,
    title: "Monitor Again",
    short: "Closed-loop restart",
    description:
      "The workflow returns to sensing and begins the next monitoring cycle automatically.",
  },
];

function normalizeRecent(recent, currentGlucose) {
  if (Array.isArray(recent) && recent.length > 0) {
    return recent.map((item) =>
      Number(typeof item === "object" ? item.glucose : item)
    );
  }

  return [
    Number(currentGlucose) - 12,
    Number(currentGlucose) - 7,
    Number(currentGlucose) - 3,
    Number(currentGlucose),
  ];
}

function getRiskClass(risk) {
  const value = String(risk || "").toUpperCase();

  if (value.includes("HIGH")) return "high";
  if (value.includes("WARNING")) return "warning";
  if (value.includes("MONITOR")) return "monitor";
  return "normal";
}

function getDecisionText(current, predicted) {
  if (predicted >= 180) return "Potential intervention required";
  if (predicted > current + 12) return "Increase monitoring";
  if (predicted < 80) return "Low-glucose monitoring required";
  return "Continue monitoring";
}

export default function ClosedLoopSimulation() {
  const [stage, setStage] = useState(0);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState("");
  const [apiData, setApiData] = useState(null);

  async function loadVitalsData() {
    try {
      setLoading(true);
      setBackendError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Backend request failed.");
      }

      const data = await response.json();
      setApiData(data);
    } catch (error) {
      console.error(error);
      setBackendError(
        "Could not connect to the FastAPI backend. The page will show fallback demo values."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVitalsData();
  }, []);

  useEffect(() => {
    if (!running || paused) return;

    const interval = setInterval(() => {
      setStage((previous) => {
        if (previous >= STAGES.length - 1) {
          loadVitalsData();
          return 0;
        }
        return previous + 1;
      });
    }, 2600);

    return () => clearInterval(interval);
  }, [running, paused]);

  const currentGlucose = Number(
    apiData?.current_glucose ?? apiData?.current ?? 107.25
  );

  const predictedGlucose = Number(
    apiData?.predicted_glucose ?? apiData?.predicted ?? 112.49
  );

  const trend = apiData?.trend ?? "Rising";
  const risk = apiData?.risk ?? "NORMAL";
  const message =
    apiData?.message ??
    apiData?.insight ??
    "Glucose level is within the prototype normal range.";

  const recent = normalizeRecent(
    apiData?.recent_readings ?? apiData?.recent,
    currentGlucose
  );

  const closedLoop = apiData?.closed_loop ?? {};

  const decision =
    closedLoop?.decision ??
    getDecisionText(currentGlucose, predictedGlucose);

  const responseMessage =
    closedLoop?.response ??
    "Conceptual response visualization active for research demonstration.";

  const predictionChartData = useMemo(() => {
    const base = recent.map((value, index) => ({
      label: `R${index + 1}`,
      observed: Number(value),
      predicted: null,
    }));

    base.push({
      label: "Now",
      observed: currentGlucose,
      predicted: null,
    });

    base.push({
      label: "30 min",
      observed: null,
      predicted: predictedGlucose,
    });

    return base;
  }, [recent, currentGlucose, predictedGlucose]);

  const responseChartData = useMemo(() => {
    const current = Number(currentGlucose);
    const predicted = Number(predictedGlucose);

    let endValue = predicted;

    if (predicted > 160) {
      endValue = Math.max(predicted - 35, current - 5);
    } else if (predicted < 80) {
      endValue = predicted + 20;
    } else {
      endValue = Math.max(current - 4, predicted - 6);
    }

    return [
      { step: "0", glucose: predicted },
      { step: "1", glucose: predicted - (predicted - endValue) * 0.2 },
      { step: "2", glucose: predicted - (predicted - endValue) * 0.45 },
      { step: "3", glucose: predicted - (predicted - endValue) * 0.7 },
      { step: "4", glucose: endValue },
    ];
  }, [currentGlucose, predictedGlucose]);

  function handleStart() {
    setStage(0);
    setRunning(true);
    setPaused(false);
  }

  function handlePause() {
    setPaused(true);
  }

  function handleResume() {
    setRunning(true);
    setPaused(false);
  }

  function handleRestart() {
    setStage(0);
    setRunning(false);
    setPaused(false);
    loadVitalsData();
  }

  const activeStage = STAGES[stage];
  const riskClass = getRiskClass(risk);

  return (
    <div className="cl-page">
      <div className="cl-header">
        <div>
          <div className="cl-kicker">PRIMARY SIMULATION 03</div>
          <h1>Closed-Loop VITALS</h1>
          <p>
            Sense → Read → Analyze → Predict → Risk → Decide → Simulated
            Response → Monitor Again
          </p>
        </div>

        <div className="cl-badge">
          <strong>SIMULATION ONLY</strong>
          <span>Conceptual research prototype</span>
        </div>
      </div>

      {backendError && (
        <div className="cl-error-banner">
          <ShieldAlert size={18} />
          <div>
            <strong>Backend connection issue</strong>
            <span>{backendError}</span>
          </div>
        </div>
      )}

      <SimulationControls
        running={running}
        paused={paused}
        currentStage={stage}
        totalStages={STAGES.length}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onRestart={handleRestart}
        onPrevious={() => setStage((prev) => Math.max(0, prev - 1))}
        onNext={() =>
          setStage((prev) => Math.min(STAGES.length - 1, prev + 1))
        }
      />

      <div className="cl-summary-grid">
        <SummaryCard
          title="Current Glucose"
          value={`${currentGlucose.toFixed(2)} mg/dL`}
          icon={<Activity size={18} />}
          tone="blue"
        />
        <SummaryCard
          title="Predicted Glucose"
          value={`${predictedGlucose.toFixed(2)} mg/dL`}
          icon={<TrendingUp size={18} />}
          tone="purple"
        />
        <SummaryCard
          title="Trend"
          value={trend}
          icon={<Zap size={18} />}
          tone="cyan"
        />
        <SummaryCard
          title="Risk Status"
          value={risk}
          icon={<AlertTriangle size={18} />}
          tone={riskClass}
        />
      </div>

      <div className="cl-main-layout">
        <section className="cl-visual-panel">
          <div className="cl-panel-top">
            <div>
              <div className="cl-kicker">ACTIVE STAGE</div>
              <h2>{activeStage.title}</h2>
              <p>{activeStage.short}</p>
            </div>

            <button className="cl-refresh-btn" onClick={loadVitalsData}>
              <RefreshCcw size={15} />
              Refresh AI Data
            </button>
          </div>

          <div className="cl-scene-shell">
            <AnimatePresence mode="wait">
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 12, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.99 }}
                transition={{ duration: 0.35 }}
                className="cl-scene-inner"
              >
                <StageVisual
                  stage={stage}
                  currentGlucose={currentGlucose}
                  predictedGlucose={predictedGlucose}
                  recent={recent}
                  risk={risk}
                  decision={decision}
                  responseMessage={responseMessage}
                  predictionChartData={predictionChartData}
                  responseChartData={responseChartData}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="cl-stage-strip">
            {STAGES.map((item, index) => (
              <button
                key={item.id}
                className={`cl-stage-pill ${
                  stage === index ? "active" : ""
                } ${index < stage ? "complete" : ""}`}
                onClick={() => setStage(index)}
              >
                <span>{index + 1}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.short}</small>
                </div>
              </button>
            ))}
          </div>
        </section>

        <aside className="cl-info-panel">
          <div className="cl-info-card">
            <div className="cl-kicker">WHAT IS HAPPENING NOW?</div>
            <h3>{activeStage.title}</h3>
            <p>{activeStage.description}</p>
          </div>

          <div className="cl-info-card">
            <div className="cl-kicker">AI INSIGHT</div>
            <p>{message}</p>
          </div>

          <div className="cl-info-card">
            <div className="cl-kicker">RECENT READINGS</div>
            <div className="cl-reading-row">
              {recent.map((value, index) => (
                <div key={index} className="cl-reading-chip">
                  {Number(value).toFixed(0)}
                </div>
              ))}
            </div>
          </div>

          <div className="cl-info-card">
            <div className="cl-kicker">DECISION RESULT</div>
            <div className="cl-decision-box">{decision}</div>
          </div>

          <div className="cl-info-card">
            <div className="cl-kicker">SIMULATION NOTICE</div>
            <div className="cl-warning-box">
              <ShieldAlert size={18} />
              <div>
                <strong>Research prototype</strong>
                <span>
                  The response step is a conceptual animation only. It is not a
                  real dosing system and not medical advice.
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {loading && (
        <div className="cl-loading-text">Refreshing backend data...</div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon, tone = "blue" }) {
  return (
    <div className={`cl-summary-card ${tone}`}>
      <div className="cl-summary-icon">{icon}</div>
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StageVisual({
  stage,
  currentGlucose,
  predictedGlucose,
  recent,
  risk,
  decision,
  responseMessage,
  predictionChartData,
  responseChartData,
}) {
  if (stage === 0) {
    return (
      <div className="cl-sense-scene">
        <motion.div
          className="cl-patch"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        >
          <strong>VITALS PATCH</strong>
          <span>Microneedle glucose-sensing layer</span>

          <div className="cl-needle-row">
            {Array.from({ length: 9 }).map((_, index) => (
              <motion.i
                key={index}
                animate={{ height: [20, 34, 20] }}
                transition={{
                  duration: 1.3,
                  repeat: Infinity,
                  delay: index * 0.08,
                }}
              />
            ))}
          </div>
        </motion.div>

        <div className="cl-skin-box">
          <div className="cl-skin-layer surface">Skin Surface</div>
          <div className="cl-skin-layer epidermis">Epidermis</div>
          <div className="cl-skin-layer dermis">Dermis</div>
          <div className="cl-skin-layer fluid">Interstitial Fluid</div>

          {Array.from({ length: 16 }).map((_, index) => (
            <motion.span
              key={index}
              className="cl-molecule"
              style={{
                left: `${8 + (index % 8) * 11}%`,
                top: `${50 + (index % 4) * 10}%`,
              }}
              animate={{
                x: [0, index % 2 === 0 ? 10 : -10, 0],
                y: [0, -8, 0],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.6 + (index % 5) * 0.25,
                repeat: Infinity,
              }}
            />
          ))}

          <motion.div
            className="cl-detect-pulse"
            animate={{ scale: [0.8, 1.4, 1.8], opacity: [0.7, 0.3, 0] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
        </div>

        <div className="cl-scene-note">
          Microneedle sensor detecting glucose in interstitial fluid...
        </div>
      </div>
    );
  }

  if (stage === 1) {
    return (
      <div className="cl-read-scene">
        <motion.div
          className="cl-reading-display"
          animate={{
            boxShadow: [
              "0 0 0 rgba(59,197,255,0.0)",
              "0 0 28px rgba(59,197,255,0.25)",
              "0 0 0 rgba(59,197,255,0.0)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="cl-reading-label">CURRENT GLUCOSE</div>
          <div className="cl-reading-value">
            {currentGlucose.toFixed(2)}
            <small> mg/dL</small>
          </div>
          <div className="cl-reading-trend">Trend: {trendLabel(currentGlucose, predictedGlucose)}</div>
        </motion.div>

        <div className="cl-watch-card">
          <div className="cl-watch-face">
            <Activity size={28} />
          </div>
          <div>
            <strong>VITALS Watch / App</strong>
            <span>Sensor reading received and displayed digitally.</span>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 2) {
    return (
      <div className="cl-analyze-scene">
        <div className="cl-data-stream">
          {recent.map((value, index) => (
            <motion.div
              key={index}
              className="cl-data-chip"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              {Number(value).toFixed(0)}
            </motion.div>
          ))}
        </div>

        <div className="cl-flow-arrow">→</div>

        <motion.div
          className="cl-ai-core"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          <BrainCircuit size={40} />
          <strong>AI MODEL</strong>
          <span>LSTM trend analysis</span>
        </motion.div>
      </div>
    );
  }

  if (stage === 3) {
    return (
      <div className="cl-chart-scene">
        <div className="cl-mini-chart">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={predictionChartData}>
              <CartesianGrid stroke="#18384d" strokeDasharray="4 6" vertical={false} />
              <XAxis dataKey="label" stroke="#7393a8" />
              <YAxis stroke="#7393a8" />
              <Tooltip
                contentStyle={{
                  background: "#091d2b",
                  border: "1px solid #245069",
                  borderRadius: 10,
                }}
              />
              <Line
                type="monotone"
                dataKey="observed"
                stroke="#3bc5ff"
                strokeWidth={3}
                connectNulls
                dot
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#a98aff"
                strokeWidth={3}
                strokeDasharray="6 6"
                connectNulls
                dot
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="cl-predict-card">
          <span>AI PREDICTION</span>
          <strong>{predictedGlucose.toFixed(2)} mg/dL</strong>
          <small>Approximate next predicted reading</small>
        </div>
      </div>
    );
  }

  if (stage === 4) {
    const riskLevels = ["NORMAL", "MONITOR", "WARNING", "HIGH RISK"];

    return (
      <div className="cl-risk-scene">
        <div className="cl-risk-stack">
          {riskLevels.map((level) => (
            <div
              key={level}
              className={`cl-risk-level ${
                String(risk).toUpperCase() === level ? "active" : ""
              }`}
            >
              {level}
            </div>
          ))}
        </div>

        <div className={`cl-risk-result ${getRiskClass(risk)}`}>{risk}</div>
      </div>
    );
  }

  if (stage === 5) {
    return (
      <div className="cl-decision-scene">
        <div className="cl-tree-node">Current glucose high?</div>
        <div className="cl-tree-arrow">↓</div>
        <div className="cl-tree-node">Glucose increasing?</div>
        <div className="cl-tree-arrow">↓</div>
        <div className="cl-tree-node">AI predicts continued rise?</div>
        <div className="cl-tree-arrow">↓</div>
        <motion.div
          className="cl-tree-node final"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          {decision}
        </motion.div>
      </div>
    );
  }

  if (stage === 6) {
    return (
      <div className="cl-response-scene">
        <div className="cl-response-badge">SIMULATION ONLY</div>

        <div className="cl-reservoir">
          <strong>Conceptual Insulin Reservoir</strong>
          <span>Visual research demonstration</span>
        </div>

        <div className="cl-particle-column">
          {Array.from({ length: 8 }).map((_, index) => (
            <motion.i
              key={index}
              animate={{ y: [0, 115], opacity: [0, 1, 0] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                delay: index * 0.18,
              }}
            />
          ))}
        </div>

        <div className="cl-response-tissue" />

        <p>{responseMessage}</p>
      </div>
    );
  }

  if (stage === 7) {
    return (
      <div className="cl-chart-scene">
        <div className="cl-mini-chart">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={responseChartData}>
              <CartesianGrid stroke="#18384d" strokeDasharray="4 6" vertical={false} />
              <XAxis dataKey="step" stroke="#7393a8" />
              <YAxis stroke="#7393a8" />
              <Tooltip
                contentStyle={{
                  background: "#091d2b",
                  border: "1px solid #245069",
                  borderRadius: 10,
                }}
              />
              <Area
                type="monotone"
                dataKey="glucose"
                stroke="#57e0ad"
                fill="#57e0ad"
                fillOpacity={0.18}
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="cl-predict-card green">
          <span>SIMULATED GLUCOSE RESPONSE</span>
          <strong>
            {Number(responseChartData[responseChartData.length - 1]?.glucose).toFixed(2)} mg/dL
          </strong>
          <small>Conceptual post-response glucose behaviour</small>
        </div>
      </div>
    );
  }

  return (
    <div className="cl-repeat-scene">
      <motion.div
        className="cl-repeat-ring"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <span className="dot one" />
        <span className="dot two" />
        <span className="dot three" />
        <span className="dot four" />
      </motion.div>

      <div className="cl-repeat-center">
        <RefreshCcw size={42} />
        <strong>Monitoring Again</strong>
        <span>Closed-loop cycle restarting</span>
      </div>
    </div>
  );
}

function trendLabel(current, predicted) {
  if (predicted > current + 3) return "Rising ↑";
  if (predicted < current - 3) return "Falling ↓";
  return "Stable →";
}