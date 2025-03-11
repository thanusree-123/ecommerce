import { useEffect, useState } from "react";

const InfiniteImageScroll = () => {
  const [scrollSpeed, setScrollSpeed] = useState(20);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const slider = document.getElementById("slider");
    if (slider) {
      slider.style.animationDuration = `${scrollSpeed}s`;
      slider.style.animationPlayState = isPaused ? "paused" : "running";
    }
  }, [scrollSpeed, isPaused]);

  return (
    <div>
      <div className="slider-container">
        <div 
          className="slider" 
          id="slider" 
          onMouseEnter={() => setIsPaused(true)} 
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* 10 Original Images */}
          <div className="slide"><img src="/images/catbracelet.webp" alt="Image 1" /></div>
          <div className="slide"><img src="/images/catbangles.webp" alt="Image 2" /></div>
          <div className="slide"><img src="/images/catneckwear.webp" alt="Image 3" /></div>
          <div className="slide"><img src="/images/catchain.jpeg" alt="Image 4" /></div>
          <div className="slide"><img src="/images/catpendant.avif" alt="Image 5" /></div>
          <div className="slide"><img src="/images/catnosepin.webp" alt="Image 6" /></div>
          <div className="slide"><img src="/images/catearrings.jpg" alt="Image 7" /></div>
          <div className="slide"><img src="/images/catwatch.jpeg" alt="Image 8" /></div>
          <div className="slide"><img src="/images/catfingerring.jpg" alt="Image 9" /></div>
          <div className="slide"><img src="/images/catanklewear.jpg" alt="Image 10" /></div>
          
        </div>
      </div>

      <style jsx>{`
        .slider-container {
          width: 100%;
          overflow: hidden;
          position: relative;
          padding: 20px 0;
        }
        .slider {
          display: flex;
          width: fit-content;
          animation: scroll ${scrollSpeed}s linear infinite;
        }
        .slide {
          height: 400px; /* Increased size */
          margin: 0 15px;
          flex-shrink: 0;
        }
        .slide img {
          height: 100%;
          width: auto;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};

export default InfiniteImageScroll;
