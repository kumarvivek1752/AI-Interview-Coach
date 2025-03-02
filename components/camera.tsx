import React, { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from "@mediapipe/tasks-vision";
// Remove the local import
// import hand_landmarker_task from "./models/hand_landmarker.task"

interface Landmark {
  x: number;
  y: number;
  z: number;
}

const Camera: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
    const [handPresence, setHandPresence] = useState<boolean | null>(null);

    useEffect(() => {
        let handLandmarkerInstance: HandLandmarker | undefined;
        let animationFrameId: number | undefined;

        const initializeHandDetection = async (): Promise<void> => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
                );
                handLandmarkerInstance = await HandLandmarker.createFromOptions(
                    vision, {
                        baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task" },
                        numHands: 2,
                        runningMode: "VIDEO"
                    }
                );
                setHandLandmarker(handLandmarkerInstance);
                detectHands();
            } catch (error) {
                console.error("Error initializing hand detection:", error);
            }
        };

        const drawLandmarks = (landmarksArray: Landmark[][]): void => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';

            landmarksArray.forEach(landmarks => {
                landmarks.forEach(landmark => {
                    const x = landmark.x * canvas.width;
                    const y = landmark.y * canvas.height;

                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, 2 * Math.PI);
                    ctx.fill();
                });
            });
        };

        const detectHands = (): void => {
            if (videoRef.current && videoRef.current.readyState >= 2 && handLandmarkerInstance) {
                const detections = handLandmarkerInstance.detectForVideo(videoRef.current, performance.now());
                setHandPresence(detections.handednesses.length > 0);

                if (detections.landmarks) {
                    drawLandmarks(detections.landmarks);
                }
            }
            animationFrameId = requestAnimationFrame(detectHands);
        };

        const startWebcam = async (): Promise<void> => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await initializeHandDetection();
                }
            } catch (error) {
                console.error("Error accessing webcam:", error);
            }
        };

        startWebcam();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
            if (handLandmarkerInstance) {
                handLandmarkerInstance.close();
            }
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, []);

    return (
        <>
          <h1>Is there a Hand? {handPresence ? "Yes" : "No"}</h1>
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
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "600px",
                height: "480px",
                zIndex: 2,
                backgroundColor: "transparent", // Set to transparent to see the video underneath
              }}
            />
          </div>
        </>
      );
      
};

export default Camera;