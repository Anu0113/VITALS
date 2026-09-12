import {
  useEffect,
  useState,
} from "react";

import {
  Activity,
  Radio,
  Watch,
  Zap,
} from "lucide-react";

import { motion } from "framer-motion";

import SimulationControls
  from "../components/SimulationControls";


const STAGES = [
  {
    title: "Patch Placement",
    explanation:
      "The conceptual VITALS microneedle patch is positioned on the skin. The microneedle array approaches the shallow sensing region.",
  },
  {
    title: "Interstitial Fluid",
    explanation:
      "Glucose molecules are present within the simulated interstitial-fluid region beneath the skin surface.",
  },
  {
    title: "Glucose Detection",
    explanation:
      "Glucose molecules move toward the conceptual microneedle sensing surface where detection is visualized.",
  },
  {
    title: "Sensor Signal Generation",
    explanation:
      "The simulated glucose-sensor interaction is represented as an electrical sensor signal.",
  },
  {
    title: "Signal Processing",
    explanation:
      "The raw sensor signal travels from the patch into the VITALS processing layer where it is converted into a glucose concentration.",
  },
  {
    title: "Glucose Reading",
    explanation:
      "The processed signal is now represented as a digital glucose reading.",
  },
  {
    title: "Watch / App Transmission",
    explanation:
      "The processed glucose reading is transmitted to the conceptual VITALS watch and application interface.",
  },
];


const READING_SEQUENCE = [
  104,
  108,
  112,
  115,
  118,
];


export default function MicroneedleSimulation() {
  const [stage, setStage] =
    useState(0);

  const [running, setRunning] =
    useState(false);

  const [paused, setPaused] =
    useState(false);

  const [readingIndex, setReadingIndex] =
    useState(0);


  useEffect(() => {
    if (!running || paused) {
      return;
    }

    const timer = setInterval(() => {
      setStage((previous) => {
        if (previous >= STAGES.length - 1) {
          setRunning(false);
          return previous;
        }

        return previous + 1;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [running, paused]);


  useEffect(() => {
    if (stage !== 5) {
      setReadingIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setReadingIndex((previous) => {
        if (
          previous >=
          READING_SEQUENCE.length - 1
        ) {
          clearInterval(timer);
          return previous;
        }

        return previous + 1;
      });
    }, 420);

    return () => clearInterval(timer);
  }, [stage]);


  function startSimulation() {
    setStage(0);
    setReadingIndex(0);
    setPaused(false);
    setRunning(true);
  }


  function restartSimulation() {
    setRunning(false);
    setPaused(false);
    setStage(0);
    setReadingIndex(0);
  }


  function previousStage() {
    setStage((value) =>
      Math.max(0, value - 1)
    );
  }


  function nextStage() {
    setStage((value) =>
      Math.min(
        STAGES.length - 1,
        value + 1
      )
    );
  }


  return (
    <div className="microneedle-page">
      <div className="microneedle-heading">
        <div>
          <div className="eyebrow">
            PRIMARY SIMULATION 01
          </div>

          <h1>
            Microneedle Glucose Sensing
          </h1>

          <p>
            Interstitial Fluid → Microneedle
            Sensor → Electrical Signal →
            Glucose Reading → VITALS Watch
          </p>
        </div>

        <div className="concept-badge">
          CONCEPTUAL SENSOR SIMULATION
        </div>
      </div>

      <SimulationControls
        running={running}
        paused={paused}
        currentStage={stage}
        totalStages={STAGES.length}
        onStart={startSimulation}
        onPause={() => setPaused(true)}
        onResume={() => {
          setPaused(false);
          setRunning(true);
        }}
        onRestart={restartSimulation}
        onPrevious={previousStage}
        onNext={nextStage}
      />

      <div className="microneedle-layout">
        <section className="sensor-visual-card">
          <div className="skin-scene">

            <motion.div
              className="vitals-patch"
              animate={{
                y: stage >= 0 ? 28 : 0,
              }}
              transition={{
                duration: 1.2,
              }}
            >
              <div className="patch-status-light" />

              <strong>
                VITALS PATCH
              </strong>

              <span>
                sensing layer
              </span>

              <div className="needle-array">
                {Array.from({
                  length: 8,
                }).map((_, index) => (
                  <motion.div
                    key={index}
                    className="needle"
                    animate={{
                      height:
                        stage >= 0
                          ? 74
                          : 24,
                    }}
                    transition={{
                      duration: 1,
                      delay:
                        index * 0.05,
                    }}
                  />
                ))}
              </div>
            </motion.div>


            <div className="skin-surface">
              SKIN SURFACE
            </div>


            <div className="epidermis-layer">
              <span>EPIDERMIS</span>
            </div>


            <div className="dermis-layer">
              <span>DERMIS</span>

              {stage >= 1 &&
                Array.from({
                  length: 20,
                }).map((_, index) => (
                  <motion.div
                    key={index}
                    className="glucose-molecule"
                    initial={{
                      opacity: 0,
                      scale: 0.5,
                    }}
                    animate={{
                      opacity: 1,

                      x:
                        stage >= 2
                          ? [
                              0,
                              index % 2 === 0
                                ? 30
                                : -30,
                              0,
                            ]
                          : [
                              -7,
                              9,
                              -7,
                            ],

                      y: [
                        0,
                        -9,
                        7,
                        0,
                      ],

                      scale:
                        stage >= 2
                          ? [
                              1,
                              1.25,
                              1,
                            ]
                          : 1,
                    }}
                    transition={{
                      duration:
                        2 +
                        (index % 4) * 0.3,

                      repeat: Infinity,

                      ease: "easeInOut",
                    }}
                    style={{
                      left: `${
                        7 +
                        ((index * 11) %
                          86)
                      }%`,

                      top: `${
                        20 +
                        ((index * 17) %
                          65)
                      }%`,
                    }}
                  >
                    G
                  </motion.div>
                ))}

              {stage >= 1 && (
                <motion.div
                  className="interstitial-label"
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                >
                  Glucose present in
                  interstitial fluid
                </motion.div>
              )}
            </div>


            <div className="interstitial-layer">
              INTERSTITIAL REGION
            </div>


            {stage >= 2 && (
              <motion.div
                className="sensor-detection-pulse"
                animate={{
                  scale: [
                    0.8,
                    1.8,
                    0.8,
                  ],

                  opacity: [
                    0.25,
                    1,
                    0.25,
                  ],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                }}
              />
            )}


            {stage >= 3 && (
              <motion.div
                className="electrical-signal"
                initial={{
                  y: 250,
                }}
                animate={{
                  y: 65,

                  opacity: [
                    0,
                    1,
                    1,
                    0,
                  ],
                }}
                transition={{
                  duration: 1.3,
                  repeat: Infinity,
                }}
              >
                <Zap size={20} />
              </motion.div>
            )}

          </div>


          <div className="signal-flow">
            <FlowNode
              active={stage >= 2}
              icon={
                <Activity size={18} />
              }
              label="Sensor"
            />

            <FlowConnector
              active={stage >= 3}
            />

            <FlowNode
              active={stage >= 3}
              icon={<Zap size={18} />}
              label="Signal"
            />

            <FlowConnector
              active={stage >= 4}
            />

            <FlowNode
              active={stage >= 4}
              icon={<Radio size={18} />}
              label="Processing"
            />

            <FlowConnector
              active={stage >= 6}
            />

            <FlowNode
              active={stage >= 6}
              icon={<Watch size={18} />}
              label="Watch / App"
            />
          </div>
        </section>


        <aside className="explanation-panel">
          <div className="eyebrow">
            WHAT IS HAPPENING?
          </div>

          <h2>
            {STAGES[stage].title}
          </h2>

          <p>
            {
              STAGES[stage]
                .explanation
            }
          </p>


          {stage === 2 && (
            <motion.div
              className="stage-message"
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
            >
              Microneedle sensor
              detecting glucose…
            </motion.div>
          )}


          {stage === 3 && (
            <motion.div
              className="stage-message"
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
            >
              Glucose interaction converted
              into sensor signal
            </motion.div>
          )}


          {stage === 4 && (
            <div className="processing-flow">
              <div>
                Raw Sensor Signal
              </div>

              <span>↓</span>

              <div>
                Signal Processing
              </div>

              <span>↓</span>

              <div>
                Glucose Concentration
              </div>
            </div>
          )}


          {stage >= 5 && (
            <motion.div
              className="glucose-reading-card"
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
            >
              <span>
                CURRENT GLUCOSE
              </span>

              <strong>
                {
                  READING_SEQUENCE[
                    readingIndex
                  ]
                }

                <small>
                  {" "}
                  mg/dL
                </small>
              </strong>

              <div className="reading-status">
                <div>
                  <span>Status</span>
                  <strong>Normal</strong>
                </div>

                <div>
                  <span>Trend</span>
                  <strong>
                    Stable →
                  </strong>
                </div>
              </div>
            </motion.div>
          )}


          {stage === 6 && (
            <motion.div
              className="watch-card"
              initial={{
                opacity: 0,
                x: 15,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
            >
              <Watch size={35} />

              <div>
                <strong>
                  VITALS Watch
                </strong>

                <span>
                  118 mg/dL
                </span>
              </div>
            </motion.div>
          )}


          <div className="stage-selector">
            {STAGES.map(
              (item, index) => (
                <button
                  key={item.title}
                  onClick={() =>
                    setStage(index)
                  }
                  className={
                    index === stage
                      ? "active"
                      : ""
                  }
                  title={item.title}
                >
                  {index + 1}
                </button>
              )
            )}
          </div>


          <div className="simulation-note">
            Research visualization only.
            This is a conceptual
            microneedle-based sensing
            simulation and not a clinical
            sensor representation.
          </div>
        </aside>
      </div>
    </div>
  );
}


function FlowNode({
  active,
  icon,
  label,
}) {
  return (
    <motion.div
      className={
        active
          ? "flow-node active"
          : "flow-node"
      }
      animate={{
        scale:
          active
            ? [1, 1.04, 1]
            : 1,
      }}
      transition={{
        duration: 1.4,
        repeat:
          active
            ? Infinity
            : 0,
      }}
    >
      {icon}
      <span>{label}</span>
    </motion.div>
  );
}


function FlowConnector({
  active,
}) {
  return (
    <div
      className={
        active
          ? "flow-line active"
          : "flow-line"
      }
    >
      {active && (
        <motion.div
          className="flow-particle"
          animate={{
            x: [0, 48],
          }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}
    </div>
  );
}