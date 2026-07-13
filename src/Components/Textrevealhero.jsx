import { useEffect, useRef } from "react";
import gsap from "gsap";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function scrambleReveal(el, original, { duration = 0.9 } = {}) {
  const chars = original.split("");

  let frame = 0;
  const totalFrames = Math.round(duration * 60);

  return gsap.to(
    {},
    {
      duration,
      ease: "none",

      onUpdate() {
        frame++;

        const progress = frame / totalFrames;
        const resolvedCount = Math.floor(progress * chars.length);

        let output = "";

        chars.forEach((char, index) => {
          if (index < resolvedCount || char === " ") {
            output += char;
          } else {
            output += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        });

        el.textContent = output;
      },

      onComplete() {
        el.textContent = original;
      },
    }
  );
}


const LINES = [
  {
    words: ["LET'S", "BUILD"],
  },
  {
    words: ["AN", "EXPERIENCE"],
  },
  {
    words: ["THAT", "MOVES"],
  },
  {
    words: ["PEOPLE"],
    withArrow: true,
  },
];


export default function TextRevealHero({ animate }) {
  const wordRefs = useRef([]);
  const arrowRef = useRef(null);

  wordRefs.current = [];

  const addWordRef = (el) => {
    if (el && !wordRefs.current.includes(el)) {
      wordRefs.current.push(el);
    }
  };


  useEffect(() => {
    const words = wordRefs.current;

    gsap.set(words, {
      yPercent: 120,
      opacity: 0,
      filter: "blur(6px)",
    });

    gsap.set(arrowRef.current, {
      opacity: 0,
      scaleX: 0.6,
      transformOrigin: "left center",
    });


    const tl = gsap.timeline({
      paused: true,
    });


    let scrambleAnimations = [];


    let wordIndex = 0;

    LINES.forEach((line) => {
      line.words.forEach((word) => {

        const element = words[wordIndex];

        tl.to(
          element,
          {
            yPercent: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "power3.out",

            onStart: () => {

              scrambleAnimations.push(
                scrambleReveal(
                  element,
                  word,
                  {
                    duration: 0.55,
                  }
                )
              );

            },
          },
          wordIndex * 0.12
        );


        wordIndex++;
      });
    });


    tl.to(
      arrowRef.current,
      {
        opacity: 1,
        scaleX: 1,
        duration: 0.6,
      },
      "-=0.5"
    );


    if (animate) {
      animate.current = {
        show() {
          tl.play();
        },

        hide() {
          tl.reverse();
        },
      };
    }


    return () => {
      tl.kill();

      scrambleAnimations.forEach((anim) => {
        anim.kill();
      });
    };

  }, [animate]);


  return (
    <div
      className="
        w-full
        flex
        items-center
        pl-[6vw]
        uppercase
        text-[#ece6d8]
        font-['Anton']
      "
    >
      <div>

        {LINES.map((line, index) => (
          <div
            key={index}
            className={`
              flex
              overflow-hidden
              leading-[1.02]
              tracking-[0.01em]
              text-[clamp(34px,6.6vw,96px)]
              ${
                line.withArrow
                  ? "items-center gap-[.35em]"
                  : "gap-[.28em]"
              }
            `}
          >

            {line.withArrow && (
              <svg
                ref={arrowRef}
                viewBox="0 0 100 40"
                className="w-[1.1em] h-[0.6em]"
              >
                <path
                  d="M2 20 H90 M68 4 L92 20 L68 36"
                  stroke="#ece6d8"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}

            {line.words.map((word, i) => (
              <span
                key={i}
                ref={addWordRef}
                className="inline-block"
              >
                {word}
              </span>
            ))}

          </div>
        ))}

      </div>
    </div>
  );
}