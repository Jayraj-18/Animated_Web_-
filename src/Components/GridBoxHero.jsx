import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function GridBoxHero() {
  const boxARef = useRef(null);
  const boxCRef = useRef(null);
  const boxDRef = useRef(null);

  const marqueeWrapRef = useRef(null);
  const marqueeTrackRef = useRef(null);

 useEffect(() => {
  if (
    !boxARef.current ||
    !boxCRef.current ||
    !boxDRef.current ||
    !marqueeTrackRef.current
  ) {
    return;
  }

  if (!marqueeTrackRef.current.dataset.doubled) {
    marqueeTrackRef.current.innerHTML +=
      marqueeTrackRef.current.innerHTML;

    marqueeTrackRef.current.dataset.doubled = "true";
  }


  // force visible first
  gsap.set(
    [
      boxARef.current,
      boxCRef.current,
      boxDRef.current,
      marqueeWrapRef.current
    ],
    {
      opacity: 1,
      y: 0
    }
  );


  const tl = gsap.timeline();


  tl.from(
    [
      boxARef.current,
      boxCRef.current,
      boxDRef.current,
    ],
    {
      opacity:0,
      y:50,
      duration:1,
      stagger:0.2,
      ease:"power3.out"
    }
  );


  const marquee = gsap.to(
    marqueeTrackRef.current,
    {
      xPercent:-50,
      duration:10,
      ease:"none",
      repeat:-1
    }
  );


  return ()=>{
    tl.kill();
    marquee.kill();
  };

},[]);



  const CornerDots = () => (
    <>
      <span
        className="
          absolute
          w-[6px]
          h-[6px]
          bg-white
          -top-[3px]
          -left-[3px]
        "
      />

      <span
        className="
          absolute
          w-[6px]
          h-[6px]
          bg-white
          -bottom-[3px]
          -right-[3px]
        "
      />
    </>
  );



  const cell =
    `
    relative
    flex
    items-center
    justify-center
    overflow-hidden
    border
    border-white/40
    -mt-px
    -ml-px
    `;



  const bigText =
    `
    uppercase
    font-black
    leading-none
    tracking-tight
    whitespace-nowrap
    text-white
    text-[clamp(40px,6.4vw,110px)]
    `;



  return (

    <section
      className="
        w-full
        h-screen
        bg-black
        grid
        grid-cols-3
        grid-rows-2
        overflow-hidden
      "
    >


      {/* THE */}

      <div className={cell}>

        <CornerDots />

        <div
          ref={boxARef}
          className={bigText}
        >
          THE
        </div>

      </div>



      {/* SPEED MARQUEE */}

      <div
        className={`${cell} justify-start`}
      >

        <CornerDots />


        <div
          ref={marqueeWrapRef}
          className="
            overflow-hidden
            w-full
          "
        >

          <div
            ref={marqueeTrackRef}
            className="
              flex
              whitespace-nowrap
              will-change-transform
            "
          >

            {
              [
                "SPEED",
                "SPEED",
                "SPEED",
                "SPEED",
                "SPEED",
                "SPEED",
                "SPEED",
                "SPEED"
              ].map((word,index)=>(

                <span
                  key={index}
                  className={`
                    ${bigText}
                    pr-[0.6em]
                    ${
                      index % 2 === 0
                      ? "opacity-100"
                      : "opacity-40"
                    }
                  `}
                >

                  {word}
                  &nbsp;•&nbsp;

                </span>

              ))
            }

          </div>

        </div>

      </div>




      {/* OF */}

      <div className={cell}>

        <CornerDots />

        <div
          ref={boxCRef}
          className={bigText}
        >
          OF
        </div>

      </div>





      {/* LIGHTNESS */}

      <div
        className="
          relative
          col-span-3
          flex
          items-center
          justify-center
          overflow-hidden
          border
          border-white/40
          -mt-px
          -ml-px
        "
      >

        <CornerDots />


        <div
          ref={boxDRef}
          className="
            uppercase
            font-black
            leading-none
            tracking-tight
            whitespace-nowrap
            text-white
            text-[clamp(48px,9vw,150px)]
          "
        >

          LIGHTNESS

        </div>


      </div>


    </section>

  );
}