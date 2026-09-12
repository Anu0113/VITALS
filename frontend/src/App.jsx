import { useState } from "react";
import { motion } from "framer-motion";

import {
  Activity,
  BrainCircuit,
  ChevronRight,
  CircleGauge,
  HeartPulse,
  Home as HomeIcon,
  Layers3,
  Play,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import MicroneedleSimulation
  from "./simulations/MicroneedleSimulation";

import CGMSimulation
  from "./simulations/CGMSimulation";

import ClosedLoopSimulation
  from "./simulations/ClosedLoopSimulation";


const NAVIGATION = [
  {
    id: "home",
    label: "Overview",
    icon: HomeIcon,
  },
  {
    id: "microneedle",
    label: "Microneedle Sensor",
    icon: Layers3,
  },
  {
    id: "cgm",
    label: "CGM Simulation",
    icon: Activity,
  },
  {
    id: "closed-loop",
    label: "Closed-Loop VITALS",
    icon: BrainCircuit,
  },
];


export default function App() {
  const [page, setPage] = useState("home");

  return (
    <div className="app-shell">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">

        <div className="brand">
          <div className="brand-mark">
            V
          </div>

          <div>
            <strong>
              VITALS
            </strong>

            <span>
              Intelligent Transdermal System
            </span>
          </div>
        </div>


        <div className="nav-label">
          SIMULATION PLATFORM
        </div>


        <nav>
          {NAVIGATION.map(
            ({
              id,
              label,
              icon: Icon,
            }) => (
              <button
                key={id}
                className={
                  page === id
                    ? "nav-item active"
                    : "nav-item"
                }
                onClick={() =>
                  setPage(id)
                }
              >
                <Icon size={18} />

                <span>
                  {label}
                </span>
              </button>
            )
          )}
        </nav>


        <div className="sidebar-spacer" />


        <div className="system-card">

          <div className="status-line">
            <span className="status-dot" />

            SYSTEM ONLINE
          </div>


          <SystemItem
            label="Patch Interface"
            value="Ready"
          />

          <SystemItem
            label="Glucose Sensor"
            value="Simulation"
          />

          <SystemItem
            label="AI Engine"
            value="Available"
          />

        </div>


        <div className="research-tag">
          Research Prototype

          <span>
            Not a medical device
          </span>
        </div>

      </aside>


      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <main className="main-area">

        <header className="topbar">

          <div>
            <strong>
              VITALS Simulation Platform
            </strong>

            <span>
              Versatile Intelligent
              Transdermal Adaptive Layered
              System
            </span>
          </div>


          <div className="top-status">
            <ShieldCheck size={17} />

            SIMULATION MODE
          </div>

        </header>


        {/* =================================================
            PAGE ROUTING
        ================================================= */}


        {page === "home" && (
          <Home
            navigate={setPage}
          />
        )}


        {page === "microneedle" && (
          <MicroneedleSimulation />
        )}


        {page === "cgm" && (
          <CGMSimulation />
        )}


        {page === "closed-loop" && (
          <ClosedLoopSimulation />
        )}

      </main>

    </div>
  );
}


/* =========================================================
   HOME PAGE
========================================================= */

function Home({
  navigate,
}) {
  return (
    <div className="home-page">

      {/* HERO SECTION */}

      <section className="hero-section">

        <motion.div
          className="hero-copy"

          initial={{
            opacity: 0,
            y: 20,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}

          transition={{
            duration: 0.6,
          }}
        >

          <div className="eyebrow">
            INTERACTIVE HEALTHCARE
            TECHNOLOGY DEMONSTRATOR
          </div>


          <h1>
            Understand VITALS

            <br />

            <span>
              from sensing to response.
            </span>
          </h1>


          <p>
            An interactive research
            simulation demonstrating
            conceptual microneedle glucose
            sensing, continuous glucose
            monitoring and an AI-assisted
            closed-loop workflow.
          </p>


          <div className="hero-flow">

            <span>
              Sense
            </span>

            <ChevronRight size={17} />

            <span>
              Monitor
            </span>

            <ChevronRight size={17} />

            <span>
              Predict
            </span>

            <ChevronRight size={17} />

            <span>
              Respond
            </span>

          </div>


          <button
            className="hero-button"

            onClick={() =>
              navigate("closed-loop")
            }
          >
            <Play size={18} />

            Run Full VITALS Simulation
          </button>

        </motion.div>


        {/* HERO VISUAL */}

        <div className="hero-visual">

          <div
            className="hero-orbit orbit-one"
          />

          <div
            className="hero-orbit orbit-two"
          />


          <motion.div
            className="hero-core"

            animate={{
              boxShadow: [
                "0 0 25px rgba(53,195,255,.15)",
                "0 0 70px rgba(53,195,255,.38)",
                "0 0 25px rgba(53,195,255,.15)",
              ],
            }}

            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >

            <HeartPulse
              size={51}
            />

            <strong>
              VITALS
            </strong>

            <span>
              Intelligent Monitoring
            </span>

          </motion.div>


          <OrbitLabel
            className="orbit-label sensor"

            icon={
              <Layers3
                size={17}
              />
            }

            text="Microneedle"
          />


          <OrbitLabel
            className="orbit-label monitor"

            icon={
              <Activity
                size={17}
              />
            }

            text="CGM"
          />


          <OrbitLabel
            className="orbit-label ai"

            icon={
              <BrainCircuit
                size={17}
              />
            }

            text="AI"
          />


          <OrbitLabel
            className="orbit-label decision"

            icon={
              <CircleGauge
                size={17}
              />
            }

            text="Response"
          />

        </div>

      </section>


      {/* =================================================
          CORE SIMULATIONS
      ================================================= */}

      <section className="simulation-section">

        <div className="section-heading">

          <div>

            <div className="eyebrow">
              CORE DEMONSTRATIONS
            </div>


            <h2>
              Three simulations.
              One VITALS system.
            </h2>

          </div>


          <p>
            Each demonstration explains
            a specific layer of the
            proposed VITALS workflow.
          </p>

        </div>


        <div className="simulation-grid">


          {/* CARD 1 */}

          <SimulationCard
            number="01"

            icon={
              <Layers3 />
            }

            title="Microneedle Glucose Sensing"

            description="
            Explore how the conceptual
            VITALS microneedle patch
            detects glucose from
            interstitial fluid and
            converts the sensing
            interaction into a digital
            glucose reading.
            "

            button="Explore Sensor"

            onClick={() =>
              navigate("microneedle")
            }
          />


          {/* CARD 2 */}

          <SimulationCard
            number="02"

            icon={
              <Activity />
            }

            title="Continuous Glucose Monitoring"

            description="
            Watch synthetic glucose
            behaviour evolve across a
            virtual day containing meals,
            activity and changing glucose
            conditions.
            "

            button="Start CGM Simulation"

            onClick={() =>
              navigate("cgm")
            }
          />


          {/* CARD 3 */}

          <SimulationCard
            main

            number="03"

            icon={
              <BrainCircuit />
            }

            title="Closed-Loop VITALS"

            description="
            Experience the complete
            VITALS workflow from sensing
            and AI prediction through
            prototype risk analysis,
            conceptual response and
            continuous monitoring.
            "

            button="Run Full Simulation"

            onClick={() =>
              navigate("closed-loop")
            }
          />

        </div>

      </section>


      {/* =================================================
          DISCLAIMER
      ================================================= */}

      <div className="home-disclaimer">

        <Sparkles
          size={19}
        />


        <div>

          <strong>
            Research simulation
          </strong>


          <span>
            VITALS is a conceptual
            prototype. Simulated
            predictions and response
            demonstrations are not
            medical advice or clinical
            dosing instructions.
          </span>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   SIMULATION CARD
========================================================= */

function SimulationCard({
  number,
  icon,
  title,
  description,
  button,
  onClick,
  main = false,
}) {
  return (
    <motion.article

      className={
        main
          ? "simulation-card main-demo"
          : "simulation-card"
      }

      whileHover={{
        y: -5,
      }}

      transition={{
        duration: 0.2,
      }}
    >

      {main && (
        <div className="main-demo-label">
          MAIN DEMO
        </div>
      )}


      <div className="card-top">

        <div className="card-icon">
          {icon}
        </div>


        <span>
          {number}
        </span>

      </div>


      <h3>
        {title}
      </h3>


      <p>
        {description}
      </p>


      <button
        onClick={onClick}
      >
        {button}

        <ChevronRight
          size={17}
        />
      </button>

    </motion.article>
  );
}


/* =========================================================
   ORBIT LABEL
========================================================= */

function OrbitLabel({
  className,
  icon,
  text,
}) {
  return (
    <motion.div

      className={className}

      animate={{
        scale: [
          1,
          1.06,
          1,
        ],
      }}

      transition={{
        duration: 2.2,
        repeat: Infinity,
      }}
    >

      {icon}

      {text}

    </motion.div>
  );
}


/* =========================================================
   SIDEBAR STATUS ITEM
========================================================= */

function SystemItem({
  label,
  value,
}) {
  return (
    <div className="system-item">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}