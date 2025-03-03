import React, { useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  HandLandmarker,
  FaceDetector,
  PoseLandmarker,
  HandLandmarkerResult,
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
  const [facePresence, setFacePresence] = useState<boolean | null>(null);
  const [posePresence, setPosePresence] = useState<boolean | null>(null);

  const [handDetectionCounter, setHandDetectionCounter] = useState<number>(0);
  const [handDetectionDuration, setHandDetectionDuration] = useState<number>(0);
  const isHandOnScreenRef = useRef<boolean>(false);

  useEffect(() => {
    let handLandmarkerInstance: HandLandmarker | undefined;
    let faceLandmarkerInstance: FaceDetector | undefined;
    let poseLandmarkerInstance: PoseLandmarker | undefined;
    let animationFrameId: number | undefined;

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

    const initializeFaceDetection = async (): Promise<void> => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        faceLandmarkerInstance = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite",
          },
          runningMode: "VIDEO",
        });
      } catch (error) {
        console.error("Error initializing face detection:", error);
      }
    };

    const initializePoseDetection = async (): Promise<void> => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        poseLandmarkerInstance = await PoseLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
            },
            runningMode: "VIDEO",
          }
        );
      } catch (error) {
        console.error("Error initializing pose detection:", error);
      }
    };

    const drawHandLandmarks = (landmarksArray: Landmark[][]): void => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

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

    const drawFaceLandmarks = (faceDetections: any): void => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      faceDetections.detections.forEach((detection: any) => {
        if (detection.keypoints) {
          detection.keypoints.forEach((kp: any) => {
            const x = kp.x * canvas.width;
            const y = kp.y * canvas.height;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = "blue";
            ctx.fill();
          });
        }
      });
    };

    const drawPoseLandmarkeres = (poseLandmarks: Landmark[][]): void => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      poseLandmarks.forEach((landmarks) => {
        landmarks.forEach((landmark) => {
          const x = landmark.x * canvas.width;
          const y = landmark.y * canvas.height;
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = "green"; // green for pose landmarks
          ctx.fill();
        });
      });
    };

    // Combined detection and drawing function
    const detect = (): void => {
      if (
        videoRef.current &&
        videoRef.current.readyState >= 2 &&
        canvasRef.current
      ) {
        const currentTime = performance.now();
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        }

        if (handLandmarkerInstance) {
            const handDetections = handLandmarkerInstance.detectForVideo(
              videoRef.current,
              currentTime
            );
            setHandPresence(handDetections.handednesses.length > 0);
            
            // Check if hand is detected
            if (handDetections.landmarks.length > 0) {
              if (!isHandOnScreenRef.current) {
                // Increment counter only once when hand first appears.
                setHandDetectionCounter((prev) => prev + 1);
                isHandOnScreenRef.current = true;
                console.log("Hand appeared, counter incremented.");
              }
            } else {
              // Reset the ref when no hand is detected.
              if (isHandOnScreenRef.current) {
                isHandOnScreenRef.current = false;
                console.log("Hand disappeared, flag reset.");
              }
            }
            
            if (handDetections.landmarks) {
              drawHandLandmarks(handDetections.landmarks);
            }
          }
    

        if (faceLandmarkerInstance) {
          const faceDetections = faceLandmarkerInstance.detectForVideo(
            videoRef.current,
            currentTime
          );
          setFacePresence(
            faceDetections.detections && faceDetections.detections.length > 0
          );
          if (faceDetections.detections) {
            drawFaceLandmarks(faceDetections);
          }
        }

        if (poseLandmarkerInstance) {
          const poseDetection = poseLandmarkerInstance.detectForVideo(
            videoRef.current,
            currentTime
          );
          setPosePresence(
            poseDetection.landmarks && poseDetection.landmarks.length > 0
          );
          if (poseDetection.landmarks) {
            drawPoseLandmarkeres(poseDetection.landmarks);
          }
        }
      }
      animationFrameId = requestAnimationFrame(detect);
    };

    const startWebcam = async (): Promise<void> => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await initializeHandDetection();
          await initializeFaceDetection();
          await initializePoseDetection();
          detect();
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
        Hand Detected: {handPresence ? "Yes" : "No"}; Hand Detected Counter:{" "}
        {handDetectionCounter}; Face Detected: {facePresence ? "Yes" : "No"};
        Pose Detected: {posePresence ? "Yes" : "No"};
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
