import React, { useRef, useState } from "react";
import { useCamera } from "../../hooks/useCamera";
import { useMediapipe } from "../../hooks/useMediaPipe"
import { Button } from "@/components/ui/button";

const Camera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [overlayEnabled, setOverlayEnabled] = useState(false);

  useCamera(videoRef);

  const {
    handPresence,
    facePresence,
    posePresence,
    handDetectionCounter,
    handDetectionDuration,
    notFacingDuration,
    badPostureDetectionCounter,
    badPostureDuration,
  } = useMediapipe(videoRef, canvasRef, overlayEnabled);

  return (
    <>
      <h1>
        Hand Detected: {handPresence ? "Yes" : "No"}<br />
        Hand Detection Counter: {handDetectionCounter}<br />
        Total Hand Detection Duration: {handDetectionDuration.toFixed(2)} seconds<br />
        Face Detected: {facePresence ? "Yes" : "No"}<br />
        Not Looking at Screen: {notFacingDuration.toFixed(2)} seconds<br />
        Pose Detected: {posePresence ? "Yes" : "No"}<br />
        Bad Posture Count: {badPostureDetectionCounter}<br />
        Bad Posture Duration: {badPostureDuration.toFixed(2)} sec
      </h1>
      <Button onClick={() => setOverlayEnabled((prev) => !prev)}>
        Toggle Overlay
      </Button>
      <div style={{ position: "relative", width: "600px", height: "480px" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "600px",
            height: "480px",
            zIndex: 1,
          }}
        />
        <canvas
          ref={canvasRef}
          width={600}
          height={480}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 2,
            backgroundColor: "transparent",
          }}
        />
      </div>
    </>
  );
};

export default Camera;
