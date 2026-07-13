import { useEffect, useRef } from "react";
import gsap from "gsap";

const images = [
 
  "/Images/one.webp",
  "/Images/two.jpg",
  "/Images/three.jpg",
  "/Images/four.jpg",
    "/Images/one.webp",
  "/Images/two.jpg",
  "/Images/three.jpg",
  "/Images/four.jpg",

];

function ImageMarquee() {
  const marqueeRef = useRef(null);

  useEffect(() => {
    const track = marqueeRef.current;

    const items = track.children;

    // Duplicate images for infinite loop
    const clone = Array.from(items).map((item) =>
      item.cloneNode(true)
    );

    clone.forEach((item) => track.appendChild(item));


    const totalWidth = track.scrollWidth / 2;


    gsap.to(track, {
      x: -totalWidth,
      duration: 25,
      ease: "none",
      repeat: -1,
    });


    return () => {
      gsap.killTweensOf(track);
    };

  }, []);


  return (
    <section className="relative w-full h-screen flex justify-center items-center overflow-hidden bg-[#101512] py-20">
       <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-10 text-center">
        <h1 className="text-4xl font-bold text-white font-[TheBystand]">Ready For Racing</h1>
       </div>
      <div
        ref={marqueeRef}
        className="flex gap-5 w-max"
      >

        {images.map((img, index) => (
          <div
            key={index}
            className="
              w-[680px]
              h-[400px]
              rounded-xl
              overflow-hidden
              flex-shrink-0
            "
          >

            <img
              src={img}
              alt=""
              className="
                w-full
                h-full
                object-cover
              "
            />

          </div>
        ))}

      </div>

    </section>
  );
}

export default ImageMarquee;