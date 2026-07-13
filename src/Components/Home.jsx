import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextRevealHero from "./Textrevealhero";

gsap.registerPlugin(ScrollTrigger);

// ---------------- CONFIG ----------------
const FRAME_COUNT = 500; // total number of frames you actually have
const FRAME_START = 1; // files named frame_0001.png ... frame_0500.png
const FRAME_PATH = (index) =>
  `/bike2/frame_${String(index + FRAME_START).padStart(4, "0")}.png`;

const SCROLL_HEIGHT_VH = 400;

// TODO: replace with your real video link and thumbnail image
const RELEASE_VIDEO_URL = "/video/vid.mp4";
const RELEASE_VIDEO_THUMBNAIL = "/bike2/frame_0001.png"; // reuse first frame as poster
const RELEASE_VIDEO_DURATION = "02:56";

// single source of truth: everything below (canvas shrink, text reveal,
// video-thumb fade) keys off THIS one number
const VIDEO_MOVE_START = 0.75;
// ----------------------------------------

function Home() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imagesRef = useRef([]);
  const videoTagRef = useRef(null);
  const previewVideoRef = useRef(null);
  const currentFrameRef = useRef({ frame: 0 });
  const heroTextRef = useRef(null);
  const scrollHintRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const textRevealRef = useRef(null);
  const textRevealShownRef = useRef(false); // guards repeated show()/hide() calls

  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0); // image preload %
  const [videoOpen, setVideoOpen] = useState(false);
  const [showVideoTag, setShowVideoTag] = useState(true);

  const VIDEO_MOVE_START = 0.75;
  const TEXT_HIDE_START = 0.9;
  // ---------------- Preload Images ----------------
  useEffect(() => {
    let mounted = true;
    let loadedCount = 0;
    const images = new Array(FRAME_COUNT);

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);

      img.onload = () => {
        loadedCount++;
        if (mounted) {
          setProgress(Math.round((loadedCount / FRAME_COUNT) * 100));
        }
        if (loadedCount === FRAME_COUNT && mounted) {
          imagesRef.current = images;
          setLoaded(true);
        }
      };

      img.onerror = () => {
        loadedCount++;
        console.warn(`Frame failed to load: ${img.src}`);
        if (loadedCount === FRAME_COUNT && mounted) {
          imagesRef.current = images;
          setLoaded(true);
        }
      };

      images[i] = img;
    }

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const video = previewVideoRef.current;
    if (video) {
      video.play().catch(() => {
        // Browser may block autoplay until muted
      });
    }
  }, []);

  // ---------------- Draw Frame ----------------
  const drawFrame = (index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let img = imagesRef.current[index];
    if (!img || !img.complete || img.naturalWidth === 0) {
      let found = null;
      for (let offset = 1; offset < FRAME_COUNT; offset++) {
        const forward = imagesRef.current[index + offset];
        const backward = imagesRef.current[index - offset];
        if (forward && forward.complete && forward.naturalWidth > 0) {
          found = forward;
          break;
        }
        if (backward && backward.complete && backward.naturalWidth > 0) {
          found = backward;
          break;
        }
      }
      if (!found) return;
      img = found;
    }

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    if (cssWidth === 0 || cssHeight === 0) return;

    if (
      canvas.width !== Math.round(cssWidth * dpr) ||
      canvas.height !== Math.round(cssHeight * dpr)
    ) {
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const scale = Math.max(
      cssWidth / img.naturalWidth,
      cssHeight / img.naturalHeight,
    );

    const drawWidth = img.naturalWidth * scale;
    const drawHeight = img.naturalHeight * scale;
    const x = (cssWidth - drawWidth) / 2;
    const y = (cssHeight - drawHeight) / 2;

    ctx.drawImage(img, x, y, drawWidth, drawHeight);
  };

  // ---------------- Initial draw + Scroll Animation ----------------
  useEffect(() => {
    if (!loaded) return;

    const canvasAnimation = gsap.to(canvasWrapperRef.current, {
      width: "220px",
      height: "140px",
      backgroundColor: "red",
      x: () => window.innerWidth - 280,
      y: () => window.innerHeight - 210,
      borderRadius: "16px",
      duration: 1,
      ease: "power3.inOut",
      paused: true,
    });

    let rafId = requestAnimationFrame(() => {
      rafId = requestAnimationFrame(() => {
        drawFrame(0);
      });
    });

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.3,
      onUpdate: (self) => {
        // ---- canvas shrink-to-corner, driven across the FULL remaining
        // range (VIDEO_MOVE_START -> 1), not squeezed into the last 5%
        if (self.progress >= VIDEO_MOVE_START) {
          const moveProgress =
            (self.progress - VIDEO_MOVE_START) / (1 - VIDEO_MOVE_START);

          canvasAnimation.progress(moveProgress);

          gsap.to(videoTagRef.current, {
            opacity: 0,
            scale: 0.8,
            duration: 0.3,
            ease: "power2.out",
            pointerEvents: "none",
          });

          // Show text when video starts moving
          if (
            self.progress >= VIDEO_MOVE_START &&
            !textRevealShownRef.current
          ) {
            textRevealShownRef.current = true;
            textRevealRef.current?.show();
          }

          // Hide text immediately when scrolling back
          if (self.progress < TEXT_HIDE_START && textRevealShownRef.current) {
            textRevealShownRef.current = false;
            textRevealRef.current?.hide();
          }
        } else {
          canvasAnimation.progress(0);

          gsap.to(videoTagRef.current, {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
            pointerEvents: "auto",
          });

          if (textRevealRef.current && textRevealShownRef.current) {
            textRevealShownRef.current = false;
            textRevealRef.current.hide();
          }
        }

        const frame = Math.min(
          FRAME_COUNT - 1,
          Math.round(self.progress * (FRAME_COUNT - 1)),
        );

        if (frame !== currentFrameRef.current.frame) {
          currentFrameRef.current.frame = frame;
          drawFrame(frame);
        }

        // ---- Hero text (bottom-left copy) appears after 20% scroll,
        // fades out again before the canvas starts shrinking
        const appearStart = 0.2;
        const appearEnd = 0.3;
        const hideStart = 0.55;
        const hideEnd = 0.7;

        let opacity = 0;
        let y = 40;

        if (self.progress >= appearStart && self.progress <= appearEnd) {
          opacity = (self.progress - appearStart) / (appearEnd - appearStart);
          y = 40 - opacity * 40;
        } else if (self.progress > appearEnd && self.progress < hideStart) {
          opacity = 1;
          y = 0;
        } else if (self.progress >= hideStart && self.progress <= hideEnd) {
          opacity = 1 - (self.progress - hideStart) / (hideEnd - hideStart);
          y = -40 * ((self.progress - hideStart) / (hideEnd - hideStart));
        } else {
          opacity = 0;
          y = -40;
        }

        if (heroTextRef.current) {
          gsap.set(heroTextRef.current, {
            opacity,
            y,
            pointerEvents: opacity < 0.1 ? "none" : "auto",
          });
        }

        if (scrollHintRef.current) {
          gsap.set(scrollHintRef.current, {
            opacity: 1 - self.progress / 0.2,
          });
        }
      },
    });

    const resize = () => drawFrame(currentFrameRef.current.frame);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafId);
      st.kill();
      window.removeEventListener("resize", resize);
    };
  }, [loaded]);

  return (
    <div
      ref={containerRef}
      className="relative w-screen bg-black"
      style={{ height: `${SCROLL_HEIGHT_VH}vh` }}
    >
      <div className="sticky top-0 w-screen h-screen overflow-hidden bg-[#111]">
        {/* Canvas */}
        <div
          ref={canvasWrapperRef}
          className="absolute top-0 left-0 w-screen h-screen overflow-hidden"
        >
          <canvas ref={canvasRef} className="block w-full h-full" />
        </div>

        {/* Loading */}
        {!loaded && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black text-white text-4xl font-bold font-anton">
            {progress}%
          </div>
        )}

        {/* Main Content */}
        {loaded && (
          <>
            {/* Navbar */}
            <div className="fixed top-0 left-0 right-0 z-99999 w-full flex items-center justify-between px-12 py-7 text-white font-sans">
              <div className="text-[30px] tracking-wide cursor-pointer font-[TheBystand]">
               Explore Beyond
              </div>

              <div className="flex items-center gap-7 font-[TheBystand]">
                <span className="text-xl cursor-pointer opacity-90">
                  Our story
                </span>
                <span className="text-xl cursor-pointer opacity-90">
                  About Us
                </span>
                <button className="flex items-center gap-2 bg-[#e8e93a] text-black rounded-full px-5 py-2.5 text-xl font-semibold">
                  Order Now +
                </button>
              </div>
            </div>

            {/* Text reveal overlay — shown/hidden imperatively via
                textRevealRef, gated on the same VIDEO_MOVE_START threshold
                that drives the canvas shrink */}
            <div className="absolute top-20 left-0 w-full h-full flex items-center justify-center z-10">
              <TextRevealHero animate={textRevealRef} />
            </div>

            {/* Hero Text */}
            <div
              ref={heroTextRef}
              className="absolute left-12 bottom-[72px] text-white z-10 font-sans opacity-0"
            >
              <div className="text-3xl tracking-[4px] mb-5 opacity-80 font-[TheBystand] text-left">
             BUILT FOR THE UNKNOWN
              </div>

              <div className="text-4xl opacity-85 mb-7 font-[superlete] text-left">
                 Experience the next generation of electric adventure <br />
    with unmatched power, control, and freedom.
              </div>

              <p className="text-xl opacity-85 mb-7 font-[superlete] text-left">
                   Designed to push boundaries and redefine every trail.
              </p>

              <div className="flex gap-4 flex-wrap mt-5">
                <button className="bg-white/90 text-black rounded-full px-6 py-3.5 text-sm font-semibold">
                 Discover more →
                </button>
                <button className="bg-[#e8e93a] text-black rounded-full px-6 py-3.5 text-sm font-semibold">
                   Reserve yours →
                </button>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div
              ref={scrollHintRef}
              className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center text-white text-sm opacity-85 z-10"
            >
              <span>Scroll</span>
              <span className="text-xl">⌄</span>
            </div>

            {/* Video Thumbnail */}
            {showVideoTag && (
              <div
                ref={videoTagRef}
                className="absolute right-12 bottom-[72px] flex flex-col gap-2.5 z-10 text-white font-sans"
              >
                <div
                  onClick={() => setVideoOpen(true)}
                  className="relative w-[220px] h-[140px] rounded-xl overflow-hidden cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
                >
                  <img
                    src={RELEASE_VIDEO_THUMBNAIL}
                    alt="Release video"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 text-black flex items-center justify-center">
                    ▶
                  </div>
                </div>

                <div className="flex gap-2 text-sm">
                  <span>Play release video</span>
                  <span className="opacity-70">{RELEASE_VIDEO_DURATION}</span>
                </div>
              </div>
            )}

            {/* Video Modal */}
            {videoOpen && (
              <div
                onClick={() => setVideoOpen(false)}
                className="fixed inset-0 bg-black/85 flex items-center justify-center z-[100]"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-[90vw] max-w-[960px] aspect-video"
                >
                  <button
                    onClick={() => setVideoOpen(false)}
                    className="absolute -top-10 right-0 text-white text-xl"
                  >
                    ✕
                  </button>

                  <video
                    ref={previewVideoRef}
                    src={RELEASE_VIDEO_URL}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
