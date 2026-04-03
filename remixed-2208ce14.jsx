import { useMemo, useState } from "react";
import {
  Activity,
  Brain,
  Dumbbell,
  Heart,
  Leaf,
  Moon,
  Sparkles,
  Wind,
  Apple,
  Waves,
  ShieldPlus,
  ChevronRight,
  Timer,
  Watch,
  SlidersHorizontal,
} from "lucide-react";

const TOKENS = {
  bg: "#050814",
  panel: "#0C1227",
  panelSoft: "#111B36",
  line: "#1D2A4F",
  text: "#E5EDFF",
  sub: "#9FB0D6",
  indigo: "#5D63FF",
  teal: "#00B8B0",
  violet: "#8F67FF",
  gold: "#C9A55A",
  calm: "#78E7D5",
  strain: "#F08DA2",
};

const FILTERS = [
  "meditation",
  "yoga",
  "exercise",
  "nutrition",
  "sleep",
  "stress",
  "recovery",
  "breathwork",
];

const MAP_REGIONS = [
  {
    id: "brain",
    label: "Brain + Attention",
    icon: Brain,
    summary: "Attention regulation, emotional framing, and stress appraisal.",
    evidence: "Moderate human evidence",
    layer: "Nervous system",
  },
  {
    id: "vagus",
    label: "Vagus + Breath",
    icon: Wind,
    summary: "Breath-linked autonomic balance and calm-state readiness.",
    evidence: "Emerging evidence",
    layer: "Nervous system",
  },
  {
    id: "heart",
    label: "Heart + Circulation",
    icon: Heart,
    summary: "Heart rate rhythm, circulation, and exercise adaptation.",
    evidence: "Strong human evidence",
    layer: "Blood / energy",
  },
  {
    id: "gut",
    label: "Gut + Fuel Signaling",
    icon: Apple,
    summary: "Digestion, satiety signals, and energy steadiness.",
    evidence: "Moderate human evidence",
    layer: "Blood / energy",
  },
  {
    id: "muscle",
    label: "Muscle + Metabolic Engine",
    icon: Dumbbell,
    summary: "Glucose handling, movement adaptation, and recovery demand.",
    evidence: "Strong human evidence",
    layer: "Blood / energy",
  },
  {
    id: "immune",
    label: "Immune + Recovery Signaling",
    icon: ShieldPlus,
    summary: "Inflammatory load and lagged restoration trends over days.",
    evidence: "Mixed evidence",
    layer: "Immune / recovery",
  },
];

const DEEP_DIVES = [
  "Meditation deep dive",
  "Yoga deep dive",
  "Exercise deep dive",
  "Nutrition deep dive",
  "Sleep deep dive",
  "Stress deep dive",
  "Gut-brain deep dive",
];

const YOGA_LIBRARY = [
  ["Cat-Cow Flow", "Spine + breath rhythm", "Morning", "6 min", "Mobility + calm", "Moderate human evidence"],
  ["Legs-Up-the-Wall", "Parasympathetic support", "Evening", "8 min", "Stress relief + wind-down", "Emerging evidence"],
  ["Low Lunge + Twist", "Hips + thoracic mobility", "Afternoon", "10 min", "Stiffness reduction", "Moderate human evidence"],
];

const DATA_30D = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  meditation: 6 + (i % 5) * 2,
  sleep: 6.4 + ((i + 2) % 5) * 0.35,
  stress: 6 - (i % 4) * 0.7,
  hydration: 1.8 + (i % 3) * 0.4,
  training: i % 2 === 0 ? 1 : 0,
}));

function evidencePill(level) {
  const color =
    level === "Strong human evidence"
      ? TOKENS.calm
      : level === "Moderate human evidence"
      ? "#9AB7FF"
      : level === "Mixed evidence"
      ? "#F5C58A"
      : "#BDA8FF";
  return (
    <span
      style={{
        border: `1px solid ${color}55`,
        color,
        borderRadius: 999,
        padding: "4px 10px",
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {level}
    </span>
  );
}

export default function HumanPerformanceSuperApp() {
  const [activeFilter, setActiveFilter] = useState("meditation");
  const [activeRegion, setActiveRegion] = useState(MAP_REGIONS[0]);
  const [dayIndex, setDayIndex] = useState(12);

  const dayData = DATA_30D[dayIndex];

  const pathwayState = useMemo(() => {
    const nervous = Math.min(100, dayData.meditation * 6 + (7 - dayData.stress) * 7);
    const metabolic = Math.min(100, dayData.training * 26 + dayData.hydration * 22 + 28);
    const recovery = Math.min(100, dayData.sleep * 10 + (dayIndex > 2 ? DATA_30D[dayIndex - 2].sleep * 2 : 8));
    return { nervous, metabolic, recovery };
  }, [dayData, dayIndex]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `radial-gradient(circle at 18% 12%, #1A2455 0%, ${TOKENS.bg} 45%), ${TOKENS.bg}`,
        color: TOKENS.text,
        fontFamily: "Inter, system-ui, sans-serif",
        padding: 24,
      }}
    >
      <section style={{ marginBottom: 18, maxWidth: 980 }}>
        <div style={{ color: TOKENS.gold, letterSpacing: ".12em", fontSize: 12, marginBottom: 10 }}>HUMAN PERFORMANCE SUPER APP</div>
        <h1 style={{ fontSize: 38, fontWeight: 650, lineHeight: 1.12, marginBottom: 10 }}>
          A living body-intelligence dashboard for mind, movement, fuel, recovery, and resilience.
        </h1>
        <p style={{ color: TOKENS.sub, fontSize: 16, maxWidth: 860 }}>
          Explore the body as one connected system. Tap any region to zoom into mechanisms, scrub 30 days to reveal immediate and delayed effects,
          and personalize your path with wearable + behavior signals.
        </p>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: TOKENS.panel, border: `1px solid ${TOKENS.line}`, borderRadius: 18, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ fontSize: 20 }}>1) Full-Body Systems Map</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    textTransform: "capitalize",
                    borderRadius: 999,
                    border: `1px solid ${f === activeFilter ? TOKENS.teal : TOKENS.line}`,
                    background: f === activeFilter ? `${TOKENS.teal}1A` : "transparent",
                    color: f === activeFilter ? TOKENS.calm : TOKENS.sub,
                    padding: "6px 12px",
                    cursor: "pointer",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: ".8fr 1.2fr", gap: 14 }}>
            <div style={{ background: TOKENS.panelSoft, borderRadius: 14, padding: 14 }}>
              <div style={{ color: TOKENS.sub, marginBottom: 10, fontSize: 13 }}>Tap a body region</div>
              {MAP_REGIONS.map((region) => (
                <button
                  key={region.id}
                  onClick={() => setActiveRegion(region)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    marginBottom: 8,
                    borderRadius: 10,
                    border: `1px solid ${activeRegion.id === region.id ? TOKENS.violet : TOKENS.line}`,
                    background: activeRegion.id === region.id ? `${TOKENS.violet}1A` : "transparent",
                    color: TOKENS.text,
                    padding: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                  }}
                >
                  <region.icon size={16} color={TOKENS.teal} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{region.label}</div>
                    <div style={{ color: TOKENS.sub, fontSize: 11 }}>{region.layer}</div>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ background: "linear-gradient(155deg,#0E1634,#131F45)", borderRadius: 14, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: 18 }}>{activeRegion.label}</h3>
                {evidencePill(activeRegion.evidence)}
              </div>
              <p style={{ color: TOKENS.sub, margin: "10px 0 14px" }}>{activeRegion.summary}</p>
              <div style={{ display: "grid", gap: 10 }}>
                {["Fast neural pulses", "Moderate circulatory flow", "Lagged recovery & inflammation"].map((m, i) => (
                  <div key={m} style={{ border: `1px solid ${TOKENS.line}`, borderRadius: 10, padding: 10, background: "#0A1230" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span>{m}</span>
                      <span style={{ color: TOKENS.sub }}>{i === 0 ? "seconds" : i === 1 ? "minutes-hours" : "1–3 days"}</span>
                    </div>
                    <div style={{ marginTop: 8, height: 6, borderRadius: 999, background: "#121C40" }}>
                      <div style={{ width: `${[92, 64, 38][i]}%`, height: 6, borderRadius: 999, background: [TOKENS.teal, TOKENS.indigo, TOKENS.gold][i] }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside style={{ background: TOKENS.panel, border: `1px solid ${TOKENS.line}`, borderRadius: 18, padding: 16 }}>
          <h3 style={{ marginBottom: 10 }}>12) Smart Insights Panel</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {["Meditation + sleep consistency correlate with smoother stress transitions.", "Hydration and movement days correlate with steadier energy signals.", "Recovery trends appear with a 1–3 day lag in mood and resilience."].map((insight) => (
              <div key={insight} style={{ border: `1px solid ${TOKENS.line}`, borderRadius: 10, padding: 10, color: TOKENS.sub, fontSize: 13 }}>
                {insight}
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(220px, 1fr))", gap: 12, marginBottom: 16 }}>
        {[
          ["3) Meditation", Activity, "1 min reset · 3 min calm · 10 min focus · sleep wind-down · stress release", "Before / During / After: HR rhythm, breath rhythm, mood steadiness.", "Moderate human evidence"],
          ["4) Yoga", Leaf, "Asana library with mobility + breath coordination", "Each pose: name, targeted system, best time, duration, body-map effect.", "Moderate human evidence"],
          ["5) Exercise", Dumbbell, "Walking · strength · intervals · recovery movement · posture resets", "Circulation, metabolic demand, glucose handling, mood + sleep support.", "Strong human evidence"],
          ["6) Nutrition", Apple, "Protein · fiber · hydration · micronutrients · meal timing", "Digestion, satiety, glucose stability, gut-linked signaling.", "Moderate human evidence"],
          ["7) Sleep / Recovery", Moon, "Consistency · wind-down routine · rest days · circadian alignment", "Restoration waves + visible next-day and 1–3 day effects.", "Strong human evidence"],
          ["8) Stress / Mood + Breath", Waves, "Stress load · cognitive load · calm vs high-strain states", "Noisy fragmented signals become smooth with sustained recovery habits.", "Emerging evidence"],
        ].map(([title, Icon, summary, mechanism, evidence]) => (
          <article key={title} style={{ background: TOKENS.panel, border: `1px solid ${TOKENS.line}`, borderRadius: 14, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon size={16} color={TOKENS.teal} />
                <h4 style={{ fontSize: 15 }}>{title}</h4>
              </div>
              <ChevronRight size={14} color={TOKENS.sub} />
            </div>
            <p style={{ color: TOKENS.sub, fontSize: 13, marginBottom: 8 }}>{summary}</p>
            <p style={{ color: TOKENS.text, fontSize: 12, marginBottom: 8 }}>{mechanism}</p>
            {evidencePill(evidence)}
          </article>
        ))}
      </section>

      <section style={{ background: TOKENS.panel, border: `1px solid ${TOKENS.line}`, borderRadius: 18, padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h3>9) 30-Day Time-Lapse Scrubber</h3>
          <div style={{ color: TOKENS.sub, fontSize: 13 }}>Day {dayData.day}: immediate + lagged pathway behavior</div>
        </div>
        <input type="range" min={0} max={29} value={dayIndex} onChange={(e) => setDayIndex(Number(e.target.value))} style={{ width: "100%" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 12 }}>
          {[
            ["Nervous / vagal / attention", pathwayState.nervous, TOKENS.teal, "fast, dynamic, breath-responsive"],
            ["Blood / metabolic / energy", pathwayState.metabolic, TOKENS.indigo, "moderate-speed, steady flow"],
            ["Immune / inflammatory / recovery", pathwayState.recovery, TOKENS.gold, "slower, lagged, cumulative"],
          ].map(([name, score, color, detail]) => (
            <div key={name} style={{ border: `1px solid ${TOKENS.line}`, borderRadius: 10, padding: 10 }}>
              <div style={{ fontSize: 12, marginBottom: 5 }}>{name}</div>
              <div style={{ color: TOKENS.sub, fontSize: 11, marginBottom: 8 }}>{detail}</div>
              <div style={{ height: 7, borderRadius: 999, background: "#111B39" }}>
                <div style={{ width: `${score}%`, height: 7, borderRadius: 999, background: color }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div style={{ background: TOKENS.panel, border: `1px solid ${TOKENS.line}`, borderRadius: 14, padding: 14 }}>
          <h3 style={{ marginBottom: 8 }}>10) Personalization / Wearables / Logging</h3>
          <div style={{ display: "grid", gap: 8, color: TOKENS.sub, fontSize: 13 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Watch size={14} color={TOKENS.teal} /> Wearable import: HR, sleep stages, movement load.</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}><SlidersHorizontal size={14} color={TOKENS.teal} /> 30-second onboarding with sliders, taps, and check-ins.</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Timer size={14} color={TOKENS.teal} /> Habit tracking: meditation, yoga, workouts, meals, hydration, stress, mood.</div>
          </div>
        </div>
        <div style={{ background: TOKENS.panel, border: `1px solid ${TOKENS.line}`, borderRadius: 14, padding: 14 }}>
          <h3 style={{ marginBottom: 8 }}>11) Deep-Dive Animation Library</h3>
          <ul style={{ listStyle: "none", display: "grid", gap: 7, color: TOKENS.sub, fontSize: 13 }}>
            {DEEP_DIVES.map((d) => (
              <li key={d} style={{ border: `1px solid ${TOKENS.line}`, borderRadius: 9, padding: "8px 10px" }}>
                {d} · What it is · Where it acts · When it matters · Immediate vs delayed changes · Evidence confidence
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section style={{ background: "linear-gradient(130deg,#17154A,#142338)", border: `1px solid ${TOKENS.violet}`, borderRadius: 16, padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <div style={{ color: TOKENS.gold, marginBottom: 6, fontWeight: 600 }}>Make It Yours</div>
            <h3 style={{ fontSize: 24, marginBottom: 8 }}>A science-grounded system that adapts to your terrain over time.</h3>
            <p style={{ color: TOKENS.sub, maxWidth: 780 }}>
              This experience is educational and correlation-based. It does not diagnose, treat, or guarantee outcomes.
              Evidence labels stay visible, mixed evidence is clearly marked, and recommendations become more specific as your own patterns accumulate.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: TOKENS.calm, fontWeight: 600 }}>
            <Sparkles size={16} /> Science is the map. Your body is the terrain.
          </div>
        </div>
      </section>

      <section style={{ marginTop: 16, background: TOKENS.panel, border: `1px solid ${TOKENS.line}`, borderRadius: 14, padding: 14 }}>
        <h3 style={{ marginBottom: 10 }}>Yoga Sequence Cards (example)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(200px,1fr))", gap: 10 }}>
          {YOGA_LIBRARY.map(([name, target, best, duration, benefit, evidence]) => (
            <div key={name} style={{ border: `1px solid ${TOKENS.line}`, borderRadius: 10, padding: 10 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{name}</div>
              <div style={{ color: TOKENS.sub, fontSize: 12 }}>Targeted system: {target}</div>
              <div style={{ color: TOKENS.sub, fontSize: 12 }}>Best time: {best} · Duration: {duration}</div>
              <div style={{ color: TOKENS.sub, fontSize: 12, marginBottom: 7 }}>Themes: {benefit}</div>
              {evidencePill(evidence)}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
