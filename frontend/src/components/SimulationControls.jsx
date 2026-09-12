import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";

export default function SimulationControls({
  running,
  paused,
  currentStage,
  totalStages,
  onStart,
  onPause,
  onResume,
  onRestart,
  onPrevious,
  onNext,
}) {
  const progress =
    ((currentStage + 1) / totalStages) * 100;

  return (
    <div className="simulation-controls">
      <div className="control-info">
        <div>
          <span className="control-label">
            CURRENT STAGE
          </span>

          <strong>
            {currentStage + 1} of {totalStages}
          </strong>
        </div>

        <div className="control-buttons">
          <button onClick={onPrevious}>
            <ChevronLeft size={16} />
            Previous
          </button>

          {!running && (
            <button
              className="primary-control"
              onClick={onStart}
            >
              <Play size={16} />
              Start
            </button>
          )}

          {running && !paused && (
            <button onClick={onPause}>
              <Pause size={16} />
              Pause
            </button>
          )}

          {running && paused && (
            <button
              className="primary-control"
              onClick={onResume}
            >
              <Play size={16} />
              Resume
            </button>
          )}

          <button onClick={onRestart}>
            <RotateCcw size={16} />
            Restart
          </button>

          <button onClick={onNext}>
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="simulation-progress">
        <div
          className="simulation-progress-fill"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
}