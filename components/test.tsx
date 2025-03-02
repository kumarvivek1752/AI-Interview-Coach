import React, { useEffect, useRef, useState } from "react";
import {
  FaceDetector,
  HandLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

interface Landmark {
  x: number;
  y: number;
  z: number;
}

const Camera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [handPresence, setHandPresence] = useState<boolean | null>(null);

  // Local instances for detectors
  let handLandmarkerInstance: HandLandmarker | undefined;
  let faceDetectorInstance: FaceDetector | undefined;
  let animationFrameId: number | undefined;

  useEffect(() => {
    const initializeFaceDetection = async (): Promise<void> => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        faceDetectorInstance = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite",
          },
          runningMode: "VIDEO",
        });

        console.log(
          "Inside of initialize Face Detection: ",
          faceDetectorInstance
        );
      } catch (error) {
        console.error("Error initializing face detection:", error);
      }
    };

    const initializeHandDetection = async (): Promise<void> => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        handLandmarkerInstance = await HandLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            },
            numHands: 2,
            runningMode: "VIDEO",
          }
        );
      } catch (error) {
        console.error("Error initializing hand detection:", error);
      }
    };

    const drawHandLandmarks = (landmarksArray: Landmark[][]): void => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw hand landmarks (as white circles)
      landmarksArray.forEach((landmarks) => {
        landmarks.forEach((landmark) => {
          const x = landmark.x * canvas.width;
          const y = landmark.y * canvas.height;
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = "#FFFFFF";
          ctx.fill();
        });
      });
    };

    const drawFaceDetections = (detections: any): void => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      // Draw bounding boxes for each face detection in blue
      detections.detections?.forEach((detection: any) => {
        const { xCenter, yCenter, width, height } = detection.boundingBox;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        // Convert normalized center and dimensions to top-left coordinate and size
        const x = (xCenter - width / 2) * canvasWidth;
        const y = (yCenter - height / 2) * canvasHeight;
        const w = width * canvasWidth;
        const h = height * canvasHeight;
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
      });
    };

    const detectBoth = (): void => {
      if (
        videoRef.current &&
        videoRef.current.readyState >= 2 &&
        canvasRef.current
      ) {
        const currentTime = performance.now();

        // Clear the canvas once per frame
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
          ctx.drawImage(
            videoRef.current,
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
        }

        // Run hand detection if initialized
        if (handLandmarkerInstance) {
          const handDetections = handLandmarkerInstance.detectForVideo(
            videoRef.current,
            currentTime
          );
          setHandPresence(handDetections.handednesses.length > 0);
          if (handDetections.landmarks) {
            drawHandLandmarks(handDetections.landmarks);
          }
        }

        // Run face detection if initialized
        if (faceDetectorInstance) {
          const faceDetections = faceDetectorInstance.detectForVideo(
            videoRef.current,
            currentTime
          );
          console.log("Face detections: ", faceDetections);
          if (faceDetections) {
            drawFaceDetections(faceDetections);
          }
        }
      }
      animationFrameId = requestAnimationFrame(detectBoth);
    };

    const startWebcam = async (): Promise<void> => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await initializeFaceDetection();
          await initializeHandDetection();
          detectBoth();
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    startWebcam();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
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
      <h1>
        Hand Detected: {handPresence ? "Yes" : "No"} (Face boxes drawn in blue)
      </h1>
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
