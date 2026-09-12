const EVENTS = [
  { minute: 420, label: "Wake Up", type: "wake" },
  { minute: 480, label: "Breakfast", type: "meal" },
  { minute: 600, label: "Normal Activity", type: "activity" },
  { minute: 780, label: "Lunch", type: "meal" },
  { minute: 990, label: "Snack", type: "meal" },
  { minute: 1080, label: "Walking", type: "activity" },
  { minute: 1200, label: "Dinner", type: "meal" },
  { minute: 1380, label: "Sleep", type: "sleep" },
];

function gaussian(x, center, width, amplitude) {
  const distance = x - center;

  return (
    amplitude *
    Math.exp(
      -(distance * distance) /
        (2 * width * width)
    )
  );
}

export function minuteToTime(minute) {
  const normalized = minute % 1440;

  let hour = Math.floor(normalized / 60);
  const minutes = normalized % 60;

  const suffix = hour >= 12 ? "PM" : "AM";

  const displayHour =
    hour === 0
      ? 12
      : hour > 12
      ? hour - 12
      : hour;

  return `${displayHour}:${String(minutes).padStart(
    2,
    "0"
  )} ${suffix}`;
}

export function getEventAtMinute(minute) {
  let current = {
    label: "Continuous Monitoring",
    type: "monitoring",
  };

  for (const event of EVENTS) {
    if (minute >= event.minute) {
      current = event;
    }
  }

  return current;
}

export function createCGMData(
  scenario = "normal"
) {
  const points = [];

  for (
    let minute = 420;
    minute <= 1380;
    minute += 15
  ) {
    let glucose = 96;

    glucose +=
      5 *
      Math.sin(
        ((minute - 420) / 1440) *
          Math.PI *
          2
      );

    glucose += gaussian(
      minute,
      525,
      55,
      50
    );

    glucose += gaussian(
      minute,
      855,
      60,
      58
    );

    glucose += gaussian(
      minute,
      1035,
      40,
      26
    );

    glucose += gaussian(
      minute,
      1275,
      65,
      52
    );

    glucose -= gaussian(
      minute,
      1110,
      60,
      18
    );

    const wave =
      Math.sin(minute * 0.11) * 2.5 +
      Math.sin(minute * 0.037) * 1.8;

    glucose += wave;

    if (scenario === "hypo") {
      glucose -= gaussian(
        minute,
        1095,
        70,
        38
      );
    }

    if (scenario === "hyper") {
      glucose += gaussian(
        minute,
        870,
        90,
        65
      );
    }

    glucose = Math.max(
      55,
      Math.min(230, glucose)
    );

    points.push({
      minute,
      time: minuteToTime(minute),
      glucose: Math.round(glucose),
    });
  }

  return points;
}

export const CGM_EVENTS = EVENTS;