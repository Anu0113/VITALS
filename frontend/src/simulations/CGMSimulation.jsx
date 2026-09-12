import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  Footprints,
  Moon,
  Sun,
  Utensils,
} from "lucide-react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import SimulationControls
  from "../components/SimulationControls";

import {
  CGM_EVENTS,
  createCGMData,
  getEventAtMinute,
} from "../data/syntheticGlucoseData";


const SPEEDS = [1, 2, 5, 10];


export default function CGMSimulation() {
  const [scenario, setScenario] =
    useState("normal");

  const data = useMemo(
    () => createCGMData(scenario),
    [scenario]
  );

  const [index, setIndex] =
    useState(0);

  const [running, setRunning] =
    useState(false);

  const [paused, setPaused] =
    useState(false);

  const [speed, setSpeed] =
    useState(1);


  useEffect(() => {
    if (!running || paused) {
      return;
    }

    const delay = 800 / speed;

    const timer = setInterval(() => {
      setIndex((previous) => {
        if (
          previous >=
          data.length - 1
        ) {
          setRunning(false);
          return previous;
        }

        return previous + 1;
      });
    }, delay);

    return () =>
      clearInterval(timer);
  }, [
    running,
    paused,
    speed,
    data.length,
  ]);


  useEffect(() => {
    setIndex(0);
    setRunning(false);
    setPaused(false);
  }, [scenario]);


  const current = data[index];

  const previous =
    data[Math.max(0, index - 1)];

  const delta =
    current.glucose -
    previous.glucose;

  const trend =
    delta > 2
      ? "↑ Rising"
      : delta < -2
      ? "↓ Falling"
      : "→ Stable";

  const risk =
    current.glucose < 70
      ? "Low Glucose Warning"
      : current.glucose >= 180
      ? "High Glucose Warning"
      : current.glucose >= 140
      ? "Monitoring"
      : "Normal";

  const event = getEventAtMinute(
    current.minute
  );


  function start() {
    setIndex(0);
    setRunning(true);
    setPaused(false);
  }


  function restart() {
    setIndex(0);
    setRunning(false);
    setPaused(false);
  }


  return (
    <div className="cgm-page">

      <div className="cgm-heading">

        <div>
          <div className="eyebrow">
            PRIMARY SIMULATION 02
          </div>

          <h1>
            Continuous Glucose Monitoring
          </h1>

          <p>
            Animated virtual 24-hour
            glucose monitoring simulation
          </p>
        </div>

        <div className="synthetic-label">
          SYNTHETIC SIMULATION DATA

          <span>
            NOT REAL PATIENT DATA
          </span>
        </div>

      </div>


      <div className="cgm-options">

        <div>
          <span className="option-label">
            SCENARIO
          </span>

          {[
            ["normal", "Typical Day"],
            ["hypo", "Low Glucose"],
            ["hyper", "High Glucose"],
          ].map(
            ([value, label]) => (
              <button
                key={value}
                className={
                  scenario === value
                    ? "segment-button active"
                    : "segment-button"
                }
                onClick={() =>
                  setScenario(value)
                }
              >
                {label}
              </button>
            )
          )}
        </div>


        <div>
          <span className="option-label">
            SPEED
          </span>

          {SPEEDS.map((value) => (
            <button
              key={value}
              className={
                speed === value
                  ? "segment-button active"
                  : "segment-button"
              }
              onClick={() =>
                setSpeed(value)
              }
            >
              {value}×
            </button>
          ))}
        </div>

      </div>


      <SimulationControls
        running={running}
        paused={paused}
        currentStage={index}
        totalStages={data.length}
        onStart={start}
        onPause={() =>
          setPaused(true)
        }
        onResume={() => {
          setPaused(false);
          setRunning(true);
        }}
        onRestart={restart}
        onPrevious={() =>
          setIndex((value) =>
            Math.max(0, value - 1)
          )
        }
        onNext={() =>
          setIndex((value) =>
            Math.min(
              data.length - 1,
              value + 1
            )
          )
        }
      />


      <div className="cgm-layout">

        <section className="cgm-graph-card">

          <div className="graph-heading">

            <div>
              <div className="eyebrow">
                LIVE SENSOR STREAM
              </div>

              <h3>
                24-Hour Glucose Simulation
              </h3>
            </div>

            <div className="live-indicator">
              <span />
              MONITORING
            </div>

          </div>


          <div className="chart-wrapper">

            <ResponsiveContainer
              width="100%"
              height={420}
            >
              <LineChart
                data={data.slice(
                  0,
                  index + 1
                )}
              >

                <CartesianGrid
                  stroke="#18354b"
                  strokeDasharray="4 6"
                  vertical={false}
                />


                <XAxis
                  dataKey="time"
                  stroke="#7193ad"
                  minTickGap={40}
                />


                <YAxis
                  domain={[50, 230]}
                  stroke="#7193ad"
                  unit=" mg/dL"
                  width={82}
                />


                <Tooltip
                  contentStyle={{
                    background:
                      "#0c2031",
                    border:
                      "1px solid #24516c",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                />


                <ReferenceLine
                  y={70}
                  stroke="#eebd56"
                  strokeDasharray="4 5"
                />


                <ReferenceLine
                  y={180}
                  stroke="#e46666"
                  strokeDasharray="4 5"
                />


                <Line
                  type="monotone"
                  dataKey="glucose"
                  stroke="#39c4ff"
                  strokeWidth={4}
                  dot={false}
                  isAnimationActive
                  animationDuration={350}
                />

              </LineChart>
            </ResponsiveContainer>

          </div>


          <div className="timeline-events">

            {CGM_EVENTS.map(
              (timelineEvent) => (
                <EventMarker
                  key={
                    timelineEvent.minute
                  }
                  event={
                    timelineEvent
                  }
                  currentMinute={
                    current.minute
                  }
                />
              )
            )}

          </div>

        </section>


        <aside className="cgm-monitor-panel">

          <div className="eyebrow">
            LIVE MONITORING
          </div>


          <div className="hero-glucose">
            {current.glucose}

            <small>
              {" "}mg/dL
            </small>
          </div>


          <div
            className={`risk-state ${
              risk.includes("Warning")
                ? "warning"
                : risk === "Monitoring"
                ? "monitor"
                : ""
            }`}
          >
            {risk}
          </div>


          <MonitorRow
            label="Trend"
            value={trend}
          />

          <MonitorRow
            label="Current Time"
            value={current.time}
          />

          <MonitorRow
            label="Current Event"
            value={event.label}
          />

          <MonitorRow
            label="Last Sensor Reading"
            value={`${current.glucose} mg/dL`}
          />


          {event.type === "meal" && (
            <div className="event-explanation meal">
              <Utensils size={21} />

              <div>
                <strong>
                  Meal Event
                </strong>

                <span>
                  Food → Carbohydrates →
                  Glucose Rise
                </span>
              </div>
            </div>
          )}


          {event.type ===
            "activity" && (
            <div className="event-explanation activity">
              <Footprints size={21} />

              <div>
                <strong>
                  Physical Activity
                </strong>

                <span>
                  Conceptual activity-related
                  glucose response
                </span>
              </div>
            </div>
          )}


          {risk.includes("Warning") && (
            <div className="event-explanation danger">
              <AlertTriangle
                size={21}
              />

              <div>
                <strong>
                  {risk}
                </strong>

                <span>
                  Prototype simulation
                  warning
                </span>
              </div>
            </div>
          )}

        </aside>

      </div>

    </div>
  );
}


function MonitorRow({
  label,
  value,
}) {
  return (
    <div className="monitor-row">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}


function EventMarker({
  event,
  currentMinute,
}) {
  const active =
    currentMinute >= event.minute;

  const Icon =
    event.type === "meal"
      ? Utensils
      : event.type === "activity"
      ? Footprints
      : event.type === "sleep"
      ? Moon
      : Sun;

  return (
    <div
      className={
        active
          ? "timeline-event active"
          : "timeline-event"
      }
    >
      <Icon size={17} />

      <span>
        {event.label}
      </span>
    </div>
  );
}