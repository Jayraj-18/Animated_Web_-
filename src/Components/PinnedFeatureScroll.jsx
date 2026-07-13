import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ---- content: edit freely -------------------------------------------------
const FEATURES = [
  {
    title: "Swap in 30 seconds",
    caption: "Pull the pack, slot a fresh one, ride. No tools, no wait.",
    accentBg: "radial-gradient(circle at 30% 30%, #2a2a10, #0b0b0c 70%)",
    image: "/Images/five.jpg", // replace with real asset
  },
  {
    title: "Power, instantly",
    caption: "Full torque the moment you twist the throttle.",
    accentBg: "radial-gradient(circle at 70% 30%, #241f05, #0b0b0c 70%)",
    image: "/Images/three.jpg",
  },
  {
    title: "Smart storage",
    caption: "Carry all you could need — tools, parts, charger, more.",
    accentBg: "radial-gradient(circle at 30% 70%, #1c1c05, #0b0b0c 70%)",
    image: "/Images/six.jpg",
  },
  {
    title: "Ride in silence",
    caption: "No combustion, no exhaust note, just tyre on trail.",
    accentBg: "radial-gradient(circle at 70% 70%, #0d1a12, #0b0b0c 70%)",
    image: "/Images/seven.jpg",
  },
  {
    title: "Less maintenance",
    caption: "Fewer moving parts means fewer things to service.",
    accentBg: "radial-gradient(circle at 50% 50%, #201a08, #0b0b0c 70%)",
    image: "/Images/eight.jpg",
  },
];
// ----------------------------------------------------------------------------

export default function PinnedFeatureScroll() {
  const wrapRef = useRef(null);
  const pinRef = useRef(null);
  const railFillRef = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: wrapRef.current,
      start: "top top",
      end: "bottom bottom",
      pin: pinRef.current,
      scrub: 1,
      onUpdate: (self) => {
        const idx = Math.min(
          FEATURES.length - 1,
          Math.floor(self.progress * FEATURES.length)
        );
        setActive((prev) => (prev !== idx ? idx : prev));
        if (railFillRef.current) {
          railFillRef.current.style.height = `${self.progress * 100}%`;
        }
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    // height = 100vh per feature -> controls scroll distance / pin duration
    <div ref={wrapRef} style={{ position: "relative", height: `${FEATURES.length * 100}vh` }}>
      <div
        ref={pinRef}
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "center",
          gap: 40,
          padding: "0 64px",
          background: "#0b0b0c",
          color: "#f5f5f2",
        }}
      >
        {/* ---- left: text rail ---- */}
        <div style={{ position: "relative", paddingLeft: 28 }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 2,
              background: "#2a2a2e",
            }}
          />
          <div
            ref={railFillRef}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 2,
              background: "#e8ff3c",
              height: "0%",
            }}
          />
          {FEATURES.map((f, i) => {
            const isActive = i === active;
            return (
              <div
                key={f.title}
                style={{
                  padding: "22px 0",
                  fontSize: "clamp(28px, 3.4vw, 46px)",
                  fontWeight: 700,
                  lineHeight: 1.05,
                  color: isActive ? "#f5f5f2" : "#48484c",
                  opacity: isActive ? 1 : 0.5,
                  transform: isActive ? "translateX(6px)" : "translateX(0)",
                  transition: "color .35s ease, transform .35s ease, opacity .35s ease",
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    marginBottom: 6,
                    color: isActive ? "#e8ff3c" : "#48484c",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {f.title}
              </div>
            );
          })}
        </div>

        {/* ---- right: visual panel ---- */}
        <div
          style={{
            position: "relative",
            height: "78vh",
            borderRadius: 18,
            overflow: "hidden",
            background: "#141416",
            boxShadow: "0 40px 80px -30px rgba(0,0,0,.7)",
          }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: ` url(${f.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: i === active ? 1 : 0,
                transition: "opacity .5s ease",
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              padding: "22px 26px",
              fontSize: 14,
              color: "#cfcfd2",
              background: "linear-gradient(to top, rgba(0,0,0,.55), transparent)",
            }}
          >
            {FEATURES[active].caption}
          </div>
        </div>
      </div>
    </div>
  );
}
