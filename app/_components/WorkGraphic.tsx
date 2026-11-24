/**
 * One poster-style graphic per case study. Flat geometry on the 12-column
 * page: black lines, one blue, nothing else. Drawn in a 1200×400 box and
 * cropped from the sides on small screens, so the important parts sit in
 * the middle third (x 300–900).
 */

const W = 1200;
const H = 400;

const d = (ms = 0) => ({ animationDelay: `${ms}ms` });

/* ---------- geometry helpers ---------- */

type Ellipse = { cx: number; cy: number; rx: number; ry: number; rot: number };

function onEllipse(e: Ellipse, tDeg: number) {
  const t = (tDeg * Math.PI) / 180;
  const r = (e.rot * Math.PI) / 180;
  const x = e.rx * Math.cos(t);
  const y = e.ry * Math.sin(t);
  return {
    x: e.cx + x * Math.cos(r) - y * Math.sin(r),
    y: e.cy + x * Math.sin(r) + y * Math.cos(r),
  };
}

function insideness(e: Ellipse, p: { x: number; y: number }) {
  const r = (-e.rot * Math.PI) / 180;
  const dx = p.x - e.cx;
  const dy = p.y - e.cy;
  const x = dx * Math.cos(r) - dy * Math.sin(r);
  const y = dx * Math.sin(r) + dy * Math.cos(r);
  return (x / e.rx) ** 2 + (y / e.ry) ** 2 - 1;
}

/**
 * Where orbit `a` crosses orbit `b`: the rightmost crossing that still sits
 * inside the band small screens keep (x < 840).
 */
function crossing(a: Ellipse, b: Ellipse) {
  let best = { x: -Infinity, y: 0 };
  let prev = insideness(b, onEllipse(a, 0));
  for (let t = 0.5; t <= 360; t += 0.5) {
    const p = onEllipse(a, t);
    const v = insideness(b, p);
    if (Math.sign(v) !== Math.sign(prev) && p.x < 840 && p.x > best.x) best = p;
    prev = v;
  }
  return best;
}

const ellipseAttrs = (e: Ellipse) => ({
  cx: e.cx,
  cy: e.cy,
  rx: e.rx,
  ry: e.ry,
  transform: `rotate(${e.rot} ${e.cx} ${e.cy})`,
});

/* ---------- Kayhan Space: orbits and a close approach ---------- */

const ORBIT_A: Ellipse = { cx: 600, cy: 200, rx: 310, ry: 72, rot: -14 };
const ORBIT_B: Ellipse = { cx: 600, cy: 200, rx: 236, ry: 112, rot: 24 };
const ORBIT_C: Ellipse = { cx: 600, cy: 200, rx: 480, ry: 48, rot: 5 };
const CONJUNCTION = crossing(ORBIT_A, ORBIT_B);

function Kayhan() {
  const satA = onEllipse(ORBIT_A, 152);
  const satB = onEllipse(ORBIT_B, 205);
  return (
    <>
      <circle className="g-accent g-pop" cx={600} cy={200} r={78} />
      <g className="g-sway">
        <ellipse
          className="g-faint g-draw"
          pathLength={1}
          style={d(100)}
          {...ellipseAttrs(ORBIT_C)}
        />
        <ellipse
          className="g-line g-draw"
          pathLength={1}
          style={d(200)}
          {...ellipseAttrs(ORBIT_A)}
        />
        <ellipse
          className="g-line g-draw"
          pathLength={1}
          style={d(350)}
          {...ellipseAttrs(ORBIT_B)}
        />
        <circle className="g-ink g-pop" style={d(900)} cx={satA.x} cy={satA.y} r={6} />
        <circle className="g-ink g-pop" style={d(950)} cx={satB.x} cy={satB.y} r={6} />
        <circle
          className="g-accent-line g-pop"
          style={d(1100)}
          cx={CONJUNCTION.x}
          cy={CONJUNCTION.y}
          r={17}
        />
        <circle
          className="g-ink g-pop"
          style={d(1100)}
          cx={CONJUNCTION.x}
          cy={CONJUNCTION.y}
          r={3.5}
        />
      </g>
    </>
  );
}

/* ---------- HawkEye 360: three satellites locate one emitter ---------- */

function HawkEye() {
  const emitter = { x: 600, y: 300 };
  const sats = [
    { x: 462, y: 72 },
    { x: 600, y: 46 },
    { x: 742, y: 80 },
  ];
  return (
    <>
      {[60, 120, 180, 240, 300, 360, 420].map((r, i) => (
        <circle
          key={r}
          className="g-faint g-draw"
          pathLength={1}
          style={d(i * 60)}
          cx={emitter.x}
          cy={emitter.y}
          r={r}
        />
      ))}
      <circle
        className="g-accent-line g-ripple"
        cx={emitter.x}
        cy={emitter.y}
        r={300}
      />
      <polyline
        className="g-line g-draw"
        pathLength={1}
        style={d(300)}
        points={sats.map((s) => `${s.x},${s.y}`).join(" ")}
      />
      {sats.map((s, i) => (
        <line
          key={i}
          className="g-dash g-fade"
          style={d(600 + i * 120)}
          x1={s.x}
          y1={s.y}
          x2={emitter.x}
          y2={emitter.y}
        />
      ))}
      {sats.map((s, i) => (
        <rect
          key={i}
          className="g-ink g-pop"
          style={d(400 + i * 100)}
          x={s.x - 8}
          y={s.y - 8}
          width={16}
          height={16}
        />
      ))}
      {/* Wrapped so the pop animation doesn't fight the rotate attribute. */}
      <g className="g-pop" style={d(1100)}>
        <ellipse
          className="g-accent"
          cx={emitter.x}
          cy={emitter.y}
          rx={52}
          ry={20}
          transform={`rotate(-18 ${emitter.x} ${emitter.y})`}
        />
      </g>
      <circle className="g-ink" cx={emitter.x} cy={emitter.y} r={5} />
    </>
  );
}

/* ---------- IBM: a small quantum circuit ---------- */

const WIRES = [80, 140, 200, 260, 320];
const GATES: { q: number; x: number; label: string }[] = [
  { q: 0, x: 390, label: "H" },
  { q: 1, x: 390, label: "H" },
  { q: 4, x: 390, label: "X" },
  { q: 2, x: 490, label: "X" },
  { q: 0, x: 590, label: "Z" },
  { q: 3, x: 590, label: "H" },
  { q: 4, x: 690, label: "H" },
  { q: 1, x: 690, label: "Z" },
];
const CNOTS = [
  { x: 490, control: 0, target: 1 },
  { x: 590, control: 2, target: 4 },
  { x: 690, control: 3, target: 2 },
];
const MEASURE_X = 800;

function Ibm() {
  return (
    <>
      {WIRES.map((y, i) => (
        <g key={y}>
          <line
            className="g-line g-draw"
            pathLength={1}
            style={d(i * 70)}
            x1={0}
            y1={y}
            x2={W}
            y2={y}
          />
          <text className="g-label g-fade" style={d(300)} x={312} y={y - 12}>
            q{i}
          </text>
        </g>
      ))}
      {CNOTS.map((c, i) => {
        const yc = WIRES[c.control];
        const yt = WIRES[c.target];
        return (
          <g key={i} className="g-fade" style={d(500 + (c.x - 390) * 3)}>
            <line className="g-line" x1={c.x} y1={yc} x2={c.x} y2={yt} />
            <circle className="g-ink" cx={c.x} cy={yc} r={7} />
            <circle className="g-paper-line" cx={c.x} cy={yt} r={17} />
            <line className="g-line" x1={c.x - 17} y1={yt} x2={c.x + 17} y2={yt} />
            <line className="g-line" x1={c.x} y1={yt - 17} x2={c.x} y2={yt + 17} />
          </g>
        );
      })}
      {GATES.map((g, i) => (
        <g key={i} className="g-pop" style={d(450 + (g.x - 390) * 3)}>
          <rect
            className="g-accent"
            x={g.x - 24}
            y={WIRES[g.q] - 24}
            width={48}
            height={48}
          />
          <text className="g-gate" x={g.x} y={WIRES[g.q] + 9}>
            {g.label}
          </text>
        </g>
      ))}
      {WIRES.map((y, i) => (
        <g key={y} className="g-pop" style={d(1400 + i * 60)}>
          <rect
            className="g-paper-line"
            x={MEASURE_X - 24}
            y={y - 24}
            width={48}
            height={48}
          />
          <path
            className="g-line"
            d={`M ${MEASURE_X - 14} ${y + 8} A 14 14 0 0 1 ${MEASURE_X + 14} ${y + 8}`}
          />
          <line
            className="g-line"
            x1={MEASURE_X}
            y1={y + 8}
            x2={MEASURE_X + 10}
            y2={y - 10}
          />
        </g>
      ))}
      <line className="g-playhead" x1={340} y1={40} x2={340} y2={360} />
    </>
  );
}

/* ---------- Frontline Zero: a slashed zero on an isometric map ---------- */

function FrontlineZero() {
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let c = -H * 2; c <= W + H * 2; c += 120) {
    lines.push({ x1: c, y1: 0, x2: c + H * 2, y2: H });
    lines.push({ x1: c, y1: 0, x2: c - H * 2, y2: H });
  }
  return (
    <>
      <g className="g-fade">
        {lines.map((l, i) => (
          <line key={i} className="g-faint" {...l} />
        ))}
      </g>
      <ellipse
        className="g-zero g-draw"
        pathLength={1}
        style={d(150)}
        cx={600}
        cy={236}
        rx={116}
        ry={176}
      />
      <line
        className="g-slash g-draw"
        pathLength={1}
        style={d(900)}
        x1={492}
        y1={400}
        x2={708}
        y2={60}
      />
    </>
  );
}

/* ---------- export ---------- */

const GRAPHICS: Record<string, () => React.ReactElement> = {
  "kayhan-space": Kayhan,
  "hawkeye-360": HawkEye,
  ibm: Ibm,
  "frontline-zero": FrontlineZero,
};

export default function WorkGraphic({ id }: { id: string }) {
  const Graphic = GRAPHICS[id];
  if (!Graphic) return null;
  return (
    <svg
      className="work-graphic"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <Graphic />
    </svg>
  );
}
