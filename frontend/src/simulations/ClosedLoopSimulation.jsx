import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  RefreshCcw,
  ShieldAlert,
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
      "The LSTM-based AI estimates the next glucose reading approximately 15 minutes ahead.",
  },
  {
    id: 4,
    title: "Risk Analysis",
    short: "Risk evaluation",
    description:
      "The prototype evaluates current and predicted glucose values for demonstration-only risk states.",
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
      "The interface shows a conceptual glucose-response curve after the simulation-only response stage.",
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

function chartDomain(values, padding = 12) {
  const finite = values.filter((value) => Number.isFinite(Number(value))).map(Number);
  if (!finite.length) return [60, 160];

  const min = Math.min(...finite);
  const max = Math.max(...finite);

  if (min === max) {
    return [Math.max(0, min - padding), max + padding];
  }

  return [
    Math.max(0, Math.floor(min - padding)),
    Math.ceil(max + padding),
  ];
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
    }, 3200);

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
      predicted: currentGlucose,
    });

    base.push({
      label: "15 min",
      observed: null,
      predicted: predictedGlucose,
    });

    return base;
  }, [recent, currentGlucose, predictedGlucose]);

  const predictionDomain = useMemo(
    () =>
      chartDomain(
        [...recent, currentGlucose, predictedGlucose].map(Number),
        12
      ),
    [recent, currentGlucose, predictedGlucose]
  );

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
      { step: "Start", glucose: predicted },
      { step: "1", glucose: predicted - (predicted - endValue) * 0.2 },
      { step: "2", glucose: predicted - (predicted - endValue) * 0.45 },
      { step: "3", glucose: predicted - (predicted - endValue) * 0.7 },
      { step: "4", glucose: endValue },
    ];
  }, [currentGlucose, predictedGlucose]);

  const responseDomain = useMemo(
    () => chartDomain(responseChartData.map((item) => item.glucose), 10),
    [responseChartData]
  );

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
    <div className="cl-page cl-v2">
      <style>{`
        .cl-v2 {
          --cl-bg: #06131f;
          --cl-panel: #0a1d2b;
          --cl-panel-2: #0d2637;
          --cl-border: #173d55;
          --cl-text: #e8f7ff;
          --cl-muted: #7fa5ba;
          --cl-blue: #3bc5ff;
          --cl-purple: #a98aff;
          --cl-green: #57e0ad;
          --cl-orange: #f1b86a;
          color: var(--cl-text);
        }

        .cl-v2 * {
          box-sizing: border-box;
        }

        .cl-header,
        .cl-panel-top,
        .cl-main-layout,
        .cl-reading-row,
        .cl-warning-box,
        .cl-watch-card {
          display: flex;
        }

        .cl-header {
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 22px;
        }

        .cl-header h1 {
          margin: 4px 0 8px;
          font-size: clamp(28px, 4vw, 44px);
        }

        .cl-header p,
        .cl-info-card p {
          color: var(--cl-muted);
          line-height: 1.65;
        }

        .cl-kicker {
          color: #65cffa;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.35px;
        }

        .cl-badge {
          border: 1px solid #3a4f61;
          background: #0a1824;
          border-radius: 14px;
          padding: 12px 15px;
          min-width: 190px;
        }

        .cl-badge strong,
        .cl-badge span {
          display: block;
        }

        .cl-badge strong {
          color: #f2c67d;
          font-size: 11px;
        }

        .cl-badge span {
          margin-top: 4px;
          color: var(--cl-muted);
          font-size: 10px;
        }

        .cl-error-banner {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          margin-bottom: 18px;
          padding: 12px 14px;
          border: 1px solid #8d5f36;
          border-radius: 12px;
          background: #2d2116;
          color: #ffd08e;
        }

        .cl-error-banner strong,
        .cl-error-banner span {
          display: block;
        }

        .cl-error-banner span {
          margin-top: 4px;
          font-size: 12px;
          opacity: .85;
        }

        .cl-summary-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin: 20px 0;
        }

        .cl-summary-card {
          min-height: 112px;
          padding: 18px;
          border: 1px solid var(--cl-border);
          border-radius: 16px;
          background: linear-gradient(145deg, #0b2233, #081824);
        }

        .cl-summary-card span,
        .cl-summary-card strong {
          display: block;
        }

        .cl-summary-card span {
          margin-top: 10px;
          color: var(--cl-muted);
          font-size: 11px;
        }

        .cl-summary-card strong {
          margin-top: 6px;
          font-size: 18px;
        }

        .cl-summary-icon {
          color: var(--cl-blue);
        }

        .cl-summary-card.purple .cl-summary-icon {
          color: var(--cl-purple);
        }

        .cl-summary-card.normal .cl-summary-icon,
        .cl-summary-card.green .cl-summary-icon {
          color: var(--cl-green);
        }

        .cl-summary-card.warning .cl-summary-icon,
        .cl-summary-card.monitor .cl-summary-icon,
        .cl-summary-card.high .cl-summary-icon {
          color: var(--cl-orange);
        }

        .cl-main-layout {
          align-items: stretch;
          gap: 18px;
        }

        .cl-visual-panel {
          flex: 1 1 auto;
          min-width: 0;
          border: 1px solid var(--cl-border);
          border-radius: 20px;
          background: linear-gradient(145deg, #081b2a, #071522);
          overflow: hidden;
        }

        .cl-info-panel {
          width: 320px;
          flex: 0 0 320px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .cl-info-card {
          padding: 17px;
          border: 1px solid var(--cl-border);
          border-radius: 15px;
          background: linear-gradient(145deg, #0a1e2d, #081823);
        }

        .cl-info-card h3 {
          margin: 7px 0 5px;
        }

        .cl-panel-top {
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 20px 22px;
          border-bottom: 1px solid var(--cl-border);
        }

        .cl-panel-top h2 {
          margin: 5px 0 2px;
        }

        .cl-panel-top p {
          margin: 0;
          color: var(--cl-muted);
          font-size: 12px;
        }

        .cl-refresh-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #275776;
          border-radius: 10px;
          background: #0b293b;
          color: #a7e6ff;
          padding: 9px 12px;
          cursor: pointer;
        }

        .cl-scene-shell {
          position: relative;
          min-height: 600px;
          overflow: hidden;
        }

        .cl-scene-inner {
          width: 100%;
          height: 100%;
          min-height: 600px;
        }

        .cl-stage-strip {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          padding: 16px;
          border-top: 1px solid var(--cl-border);
        }

        .cl-stage-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          text-align: left;
          border: 1px solid #173b52;
          border-radius: 11px;
          background: #081924;
          color: #c7dce8;
          padding: 10px;
          cursor: pointer;
        }

        .cl-stage-pill > span {
          display: grid;
          place-items: center;
          width: 24px;
          height: 24px;
          flex: 0 0 24px;
          border-radius: 50%;
          background: #123148;
          color: #6edcff;
          font-size: 11px;
          font-weight: 800;
        }

        .cl-stage-pill strong,
        .cl-stage-pill small {
          display: block;
        }

        .cl-stage-pill strong {
          font-size: 11px;
        }

        .cl-stage-pill small {
          margin-top: 2px;
          color: #678ca1;
          font-size: 9px;
        }

        .cl-stage-pill.active {
          border-color: #2c91ba;
          background: #0c2a3c;
        }

        .cl-stage-pill.complete {
          opacity: .78;
        }

        .cl-reading-row {
          gap: 7px;
          flex-wrap: wrap;
          margin-top: 10px;
        }

        .cl-reading-chip {
          min-width: 42px;
          padding: 7px 9px;
          border: 1px solid #1d4b65;
          border-radius: 9px;
          background: #0b2535;
          text-align: center;
          color: #b7e7fb;
          font-size: 11px;
          font-weight: 700;
        }

        .cl-decision-box {
          margin-top: 9px;
          padding: 11px;
          border: 1px solid #24516d;
          border-radius: 10px;
          background: #0b2739;
          color: #a8e8ff;
          font-size: 12px;
          line-height: 1.45;
        }

        .cl-warning-box {
          align-items: flex-start;
          gap: 10px;
          margin-top: 9px;
          padding: 11px;
          border: 1px solid #6c5730;
          border-radius: 10px;
          background: #2a2114;
          color: #e9c16e;
        }

        .cl-warning-box strong,
        .cl-warning-box span {
          display: block;
        }

        .cl-warning-box span {
          margin-top: 4px;
          color: #b99d65;
          font-size: 10px;
          line-height: 1.5;
        }

        .cl-sense-scene {
          position: relative;
          width: 100%;
          min-height: 600px;
          overflow: hidden;
        }

        .cl-patch-assembly-v2 {
          position: absolute;
          top: 52px;
          left: 50%;
          width: min(500px, 72%);
          transform: translateX(-50%);
          z-index: 10;
          pointer-events: none;
        }

        .cl-patch-v2 {
          position: relative;
          z-index: 3;
          height: 112px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border: 1px solid #3e89ad;
          border-radius: 34px 34px 13px 13px;
          background: linear-gradient(180deg, #174c67, #0c2d42);
          box-shadow: 0 18px 45px rgba(0, 0, 0, .35), 0 0 30px rgba(59, 197, 255, .08);
          text-align: center;
        }

        .cl-patch-v2 strong {
          letter-spacing: 2px;
          font-size: 16px;
        }

        .cl-patch-v2 span {
          margin-top: 6px;
          color: #8cb2c6;
          font-size: 11px;
        }

        .cl-needle-row-v2 {
          position: relative;
          z-index: 5;
          height: 82px;
          width: calc(100% - 54px);
          margin: -1px auto 0;
          display: flex;
          justify-content: space-evenly;
          align-items: flex-start;
          overflow: visible;
        }

        .cl-needle-v2 {
          display: block;
          width: 11px;
          height: 78px;
          flex: 0 0 11px;
          clip-path: polygon(0 0, 100% 0, 50% 100%);
          background: linear-gradient(180deg, #b8f4ff 0%, #5bd5ff 44%, #1a89bd 100%);
          filter: drop-shadow(0 0 7px rgba(80, 210, 255, .8));
          transform-origin: top center;
        }

        .cl-skin-box-v2 {
          position: absolute;
          top: 250px;
          left: 50%;
          width: min(650px, 84%);
          height: 285px;
          transform: translateX(-50%);
          border: 1px solid #274a5b;
          border-radius: 23px;
          overflow: hidden;
          background: #17232b;
          box-shadow: 0 18px 50px rgba(0,0,0,.25);
        }

        .cl-skin-layer-v2 {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          padding-left: 18px;
          color: rgba(255,255,255,.72);
          font-size: 11px;
          letter-spacing: .7px;
        }

        .cl-skin-layer-v2.surface {
          height: 38px;
          background: #d59a81;
        }

        .cl-skin-layer-v2.epidermis {
          height: 72px;
          background: linear-gradient(#dfaa94, #cc866f);
        }

        .cl-skin-layer-v2.dermis {
          height: 105px;
          background: linear-gradient(#9e5d50, #7f423e);
        }

        .cl-skin-layer-v2.fluid {
          height: 70px;
          background: linear-gradient(#173447, #123145);
          color: #9ddcff;
        }

        .cl-molecule-v2 {
          position: absolute;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #65dbff;
          box-shadow: 0 0 12px rgba(101,219,255,.8);
        }

        .cl-detect-pulse-v2 {
          position: absolute;
          left: 50%;
          bottom: 30px;
          width: 38px;
          height: 38px;
          margin-left: -19px;
          border: 2px solid #5cdcff;
          border-radius: 50%;
        }

        .cl-scene-note-v2 {
          position: absolute;
          bottom: 18px;
          left: 50%;
          transform: translateX(-50%);
          width: min(650px, 84%);
          text-align: center;
          color: #88b8cb;
          font-size: 12px;
        }

        .cl-read-scene,
        .cl-analyze-scene,
        .cl-risk-scene,
        .cl-decision-scene,
        .cl-response-scene,
        .cl-repeat-scene {
          min-height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cl-read-scene {
          gap: 28px;
          padding: 30px;
          flex-wrap: wrap;
        }

        .cl-reading-display {
          min-width: min(390px, 90%);
          padding: 34px;
          border: 1px solid #255b77;
          border-radius: 20px;
          background: #0a2536;
          text-align: center;
        }

        .cl-reading-label {
          color: #77c9ed;
          font-size: 11px;
          letter-spacing: 1px;
        }

        .cl-reading-value {
          margin-top: 12px;
          font-size: clamp(34px, 6vw, 62px);
          font-weight: 800;
        }

        .cl-reading-value small {
          font-size: 15px;
          color: var(--cl-muted);
        }

        .cl-reading-trend {
          margin-top: 10px;
          color: #9edaff;
        }

        .cl-watch-card {
          align-items: center;
          gap: 14px;
          min-width: min(330px, 90%);
          padding: 18px;
          border: 1px solid #1d4a63;
          border-radius: 16px;
          background: #091f2e;
        }

        .cl-watch-card strong,
        .cl-watch-card span {
          display: block;
        }

        .cl-watch-card span {
          margin-top: 5px;
          color: var(--cl-muted);
          font-size: 11px;
        }

        .cl-watch-face {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          background: #0e344a;
          color: #6edcff;
        }

        .cl-analyze-scene {
          gap: 26px;
          padding: 30px;
          flex-wrap: wrap;
        }

        .cl-data-stream {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .cl-data-chip {
          min-width: 64px;
          padding: 13px;
          border: 1px solid #24526d;
          border-radius: 11px;
          background: #0b2a3d;
          color: #b4eaff;
          text-align: center;
          font-weight: 700;
        }

        .cl-flow-arrow {
          color: #65d5ff;
          font-size: 34px;
        }

        .cl-ai-core {
          width: 190px;
          height: 190px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid #495783;
          border-radius: 50%;
          background: radial-gradient(circle, #182f4b, #0a1c2d 70%);
          color: #b7a0ff;
          box-shadow: 0 0 46px rgba(169,138,255,.16);
        }

        .cl-ai-core strong,
        .cl-ai-core span {
          display: block;
        }

        .cl-ai-core strong {
          margin-top: 10px;
        }

        .cl-ai-core span {
          margin-top: 5px;
          color: #8f9eb8;
          font-size: 10px;
        }

        .cl-chart-scene {
          min-height: 600px;
          display: grid;
          grid-template-columns: minmax(0, 1.55fr) minmax(260px, .75fr);
          align-items: center;
          gap: 24px;
          padding: 28px;
        }

        .cl-mini-chart-v2 {
          min-width: 0;
          width: 100%;
          height: 390px;
          padding: 18px 12px 4px;
          border: 1px solid #173f58;
          border-radius: 16px;
          background: #071a27;
        }

        .cl-predict-card-v2 {
          min-height: 210px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border: 1px solid #4c4b74;
          border-radius: 18px;
          background: linear-gradient(145deg, #161d38, #0c182b);
          text-align: center;
        }

        .cl-predict-card-v2.green {
          border-color: #245b4c;
          background: linear-gradient(145deg, #102e2a, #091e24);
        }

        .cl-predict-card-v2 span {
          color: #9a9ed0;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.2px;
        }

        .cl-predict-card-v2 strong {
          margin-top: 15px;
          font-size: clamp(25px, 4vw, 42px);
        }

        .cl-predict-card-v2 small {
          margin-top: 10px;
          color: var(--cl-muted);
          line-height: 1.45;
        }

        .cl-risk-scene {
          gap: 28px;
          padding: 30px;
          flex-wrap: wrap;
        }

        .cl-risk-stack {
          width: min(430px, 90%);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .cl-risk-level {
          padding: 14px 18px;
          border: 1px solid #25465a;
          border-radius: 11px;
          background: #0a1d2a;
          color: #69899b;
        }

        .cl-risk-level.active {
          border-color: #55d8aa;
          background: #103228;
          color: #8ff2cb;
          box-shadow: 0 0 24px rgba(87,224,173,.12);
        }

        .cl-risk-result {
          min-width: 190px;
          padding: 26px;
          border: 1px solid #35627b;
          border-radius: 18px;
          text-align: center;
          font-size: 25px;
          font-weight: 800;
        }

        .cl-risk-result.normal {
          color: #70e3b5;
          background: #102d26;
          border-color: #285b4a;
        }

        .cl-risk-result.warning,
        .cl-risk-result.monitor,
        .cl-risk-result.high {
          color: #f4c77c;
          background: #312517;
          border-color: #765a31;
        }

        .cl-decision-scene {
          flex-direction: column;
          gap: 10px;
          padding: 30px;
        }

        .cl-tree-node {
          width: min(520px, 88%);
          padding: 15px;
          border: 1px solid #26516b;
          border-radius: 12px;
          background: #0a2434;
          text-align: center;
        }

        .cl-tree-node.final {
          border-color: #3c8970;
          background: #103127;
          color: #8ae9c1;
        }

        .cl-tree-arrow {
          color: #6ccff2;
          font-size: 22px;
        }

        .cl-response-scene {
          position: relative;
          flex-direction: column;
          gap: 18px;
          padding: 38px;
          text-align: center;
        }

        .cl-response-badge {
          padding: 7px 11px;
          border: 1px solid #7c653d;
          border-radius: 999px;
          background: #2e2517;
          color: #efc97d;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .cl-reservoir {
          width: min(420px, 90%);
          padding: 22px;
          border: 1px solid #3f5975;
          border-radius: 18px;
          background: #10263a;
        }

        .cl-reservoir strong,
        .cl-reservoir span {
          display: block;
        }

        .cl-reservoir span {
          margin-top: 6px;
          color: var(--cl-muted);
          font-size: 11px;
        }

        .cl-particle-column {
          position: relative;
          width: 110px;
          height: 135px;
        }

        .cl-particle-column i {
          position: absolute;
          left: 50%;
          top: 0;
          width: 9px;
          height: 9px;
          margin-left: -4px;
          border-radius: 50%;
          background: #7bd8ff;
          box-shadow: 0 0 12px #7bd8ff;
        }

        .cl-response-tissue {
          width: min(500px, 90%);
          height: 46px;
          border-radius: 14px;
          background: linear-gradient(180deg, #a65f56, #773b3b);
        }

        .cl-response-scene p {
          max-width: 560px;
          color: var(--cl-muted);
          line-height: 1.6;
        }

        .cl-repeat-scene {
          position: relative;
          overflow: hidden;
        }

        .cl-repeat-ring-v2 {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 330px;
          height: 330px;
          margin-left: -165px;
          margin-top: -165px;
          border: 1px solid #285876;
          border-radius: 50%;
          box-shadow: inset 0 0 30px rgba(59,197,255,.04);
        }

        .cl-repeat-ring-v2 .dot {
          position: absolute;
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: #58d7ff;
          box-shadow: 0 0 15px #58d7ff;
        }

        .cl-repeat-ring-v2 .dot.one {
          top: -5px;
          left: 50%;
        }

        .cl-repeat-ring-v2 .dot.two {
          right: -5px;
          top: 50%;
        }

        .cl-repeat-ring-v2 .dot.three {
          bottom: -5px;
          left: 50%;
        }

        .cl-repeat-ring-v2 .dot.four {
          left: -5px;
          top: 50%;
        }

        .cl-repeat-center-v2 {
          position: relative;
          z-index: 5;
          width: 260px;
          min-height: 170px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .cl-repeat-center-v2 strong {
          margin-top: 12px;
          font-size: 24px;
        }

        .cl-repeat-center-v2 span {
          margin-top: 6px;
          color: var(--cl-muted);
          font-size: 12px;
        }

        .cl-loading-text {
          margin-top: 12px;
          color: var(--cl-muted);
          font-size: 11px;
        }

        @media (max-width: 1100px) {
          .cl-main-layout {
            flex-direction: column;
          }

          .cl-info-panel {
            width: 100%;
            flex-basis: auto;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .cl-chart-scene {
            grid-template-columns: 1fr;
          }

          .cl-predict-card-v2 {
            min-height: 150px;
          }
        }

        @media (max-width: 760px) {
          .cl-header {
            flex-direction: column;
          }

          .cl-summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .cl-info-panel {
            grid-template-columns: 1fr;
          }

          .cl-stage-strip {
            grid-template-columns: 1fr;
          }

          .cl-scene-shell,
          .cl-scene-inner {
            min-height: 650px;
          }

          .cl-sense-scene {
            min-height: 650px;
          }

          .cl-patch-assembly-v2 {
            top: 60px;
            width: 82%;
          }

          .cl-patch-v2 {
            height: 96px;
          }

          .cl-needle-row-v2 {
            height: 72px;
          }

          .cl-needle-v2 {
            width: 8px;
            flex-basis: 8px;
            height: 68px;
          }

          .cl-skin-box-v2 {
            top: 238px;
            width: 92%;
          }

          .cl-chart-scene {
            padding: 18px 10px;
          }

          .cl-mini-chart-v2 {
            height: 350px;
          }

          .cl-repeat-ring-v2 {
            width: 280px;
            height: 280px;
            margin-left: -140px;
            margin-top: -140px;
          }
        }
      `}</style>

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
                  predictionDomain={predictionDomain}
                  responseChartData={responseChartData}
                  responseDomain={responseDomain}
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
                  SIMULATION ONLY — conceptual, not clinically validated dosing.
                  No real insulin dose is calculated, recommended, or administered.
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
  predictionDomain,
  responseChartData,
  responseDomain,
}) {
  if (stage === 0) {
    return (
      <div className="cl-sense-scene">
        <motion.div
          className="cl-patch-assembly-v2"
          animate={{ y: [0, 36, 36, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            times: [0, 0.34, 0.68, 1],
            ease: "easeInOut",
          }}
        >
          <div className="cl-patch-v2">
            <strong>VITALS PATCH</strong>
            <span>Microneedle glucose-sensing layer</span>
          </div>

          <div className="cl-needle-row-v2">
            {Array.from({ length: 9 }).map((_, index) => (
              <motion.i
                key={index}
                className="cl-needle-v2"
                animate={{
                  scaleY: [0.8, 1.13, 1.13, 0.8],
                  opacity: [0.82, 1, 1, 0.82],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  times: [0, 0.34, 0.68, 1],
                  delay: index * 0.035,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>

        <div className="cl-skin-box-v2">
          <div className="cl-skin-layer-v2 surface">Skin Surface</div>
          <div className="cl-skin-layer-v2 epidermis">Epidermis</div>
          <div className="cl-skin-layer-v2 dermis">Dermis</div>
          <div className="cl-skin-layer-v2 fluid">Interstitial Fluid</div>

          {Array.from({ length: 16 }).map((_, index) => (
            <motion.span
              key={index}
              className="cl-molecule-v2"
              style={{
                left: `${8 + (index % 8) * 11}%`,
                top: `${55 + (index % 4) * 9}%`,
              }}
              animate={{
                x: [0, index % 2 === 0 ? 10 : -10, 0],
                y: [0, -8, 0],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 1.6 + (index % 5) * 0.25,
                repeat: Infinity,
              }}
            />
          ))}

          <motion.div
            className="cl-detect-pulse-v2"
            animate={{
              scale: [0.8, 1.5, 2],
              opacity: [0.75, 0.3, 0],
            }}
            transition={{ duration: 1.45, repeat: Infinity }}
          />
        </div>

        <div className="cl-scene-note-v2">
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
              "0 0 0 rgba(59,197,255,0)",
              "0 0 32px rgba(59,197,255,.24)",
              "0 0 0 rgba(59,197,255,0)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="cl-reading-label">CURRENT GLUCOSE</div>
          <div className="cl-reading-value">
            {currentGlucose.toFixed(2)}
            <small> mg/dL</small>
          </div>
          <div className="cl-reading-trend">
            Trend: {trendLabel(currentGlucose, predictedGlucose)}
          </div>
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
        <div className="cl-mini-chart-v2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={predictionChartData}
              margin={{ top: 18, right: 24, left: 4, bottom: 18 }}
            >
              <CartesianGrid
                stroke="#18384d"
                strokeDasharray="4 6"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                stroke="#7393a8"
                interval={0}
                tick={{ fontSize: 11 }}
                tickMargin={10}
              />
              <YAxis
                stroke="#7393a8"
                domain={predictionDomain}
                width={48}
                tick={{ fontSize: 11 }}
                tickCount={5}
              />
              <Tooltip
                contentStyle={{
                  background: "#091d2b",
                  border: "1px solid #245069",
                  borderRadius: 10,
                }}
                labelStyle={{ color: "#d9f3ff" }}
              />
              <Line
                type="monotone"
                dataKey="observed"
                name="Observed"
                stroke="#3bc5ff"
                strokeWidth={3}
                connectNulls={false}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                name="Predicted"
                stroke="#a98aff"
                strokeWidth={3}
                strokeDasharray="7 6"
                connectNulls
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="cl-predict-card-v2">
          <span>AI PREDICTION</span>
          <strong>{predictedGlucose.toFixed(2)} mg/dL</strong>
          <small>Approximate 15-minute-ahead predicted reading</small>
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
        <div className="cl-response-badge">
          SIMULATION ONLY — NOT CLINICAL DOSING
        </div>

        <div className="cl-reservoir">
          <strong>Conceptual Insulin-Response Simulation</strong>
          <span>Visual research demonstration only</span>
        </div>

        <div className="cl-particle-column">
          {Array.from({ length: 8 }).map((_, index) => (
            <motion.i
              key={index}
              animate={{
                y: [0, 118],
                x: [0, index % 2 === 0 ? 10 : -10],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.65,
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
        <div className="cl-mini-chart-v2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={responseChartData}
              margin={{ top: 18, right: 24, left: 4, bottom: 18 }}
            >
              <CartesianGrid
                stroke="#18384d"
                strokeDasharray="4 6"
                vertical={false}
              />
              <XAxis
                dataKey="step"
                stroke="#7393a8"
                interval={0}
                tick={{ fontSize: 11 }}
                tickMargin={10}
              />
              <YAxis
                stroke="#7393a8"
                domain={responseDomain}
                width={48}
                tick={{ fontSize: 11 }}
                tickCount={5}
              />
              <Tooltip
                contentStyle={{
                  background: "#091d2b",
                  border: "1px solid #245069",
                  borderRadius: 10,
                }}
                labelStyle={{ color: "#d9f3ff" }}
              />
              <Area
                type="monotone"
                dataKey="glucose"
                name="Simulated glucose"
                stroke="#57e0ad"
                fill="#57e0ad"
                fillOpacity={0.18}
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="cl-predict-card-v2 green">
          <span>SIMULATED GLUCOSE RESPONSE</span>
          <strong>
            {Number(
              responseChartData[responseChartData.length - 1]?.glucose
            ).toFixed(2)}{" "}
            mg/dL
          </strong>
          <small>
            Conceptual post-response glucose behaviour — simulation only
          </small>
        </div>
      </div>
    );
  }

  return (
    <div className="cl-repeat-scene">
      <motion.div
        className="cl-repeat-ring-v2"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <span className="dot one" />
        <span className="dot two" />
        <span className="dot three" />
        <span className="dot four" />
      </motion.div>

      <div className="cl-repeat-center-v2">
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
