import React, { useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  HandLandmarker,
  FaceLandmarker,
  PoseLandmarker,
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
  const handDetectionStartTimeRef = useRef<number>(0);

  const [notFacingDuration, setNotFacingDuration] = useState<number>(0);
  const notFacingStartTimeRef = useRef<number | null>(null);
  const notFacingRef = useRef<boolean>(false);

  useEffect(() => {
    let handLandmarkerInstance: HandLandmarker | undefined;
    let faceLandmarkerInstance: FaceLandmarker | undefined; // Using FaceLandmarker now
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

    const initializeFaceMesh = async (): Promise<void> => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        faceLandmarkerInstance = await FaceLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            },
            runningMode: "VIDEO",
          }
        );
      } catch (error) {
        console.error("Error initializing face mesh:", error);
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

    const drawFaceMeshLandmarks = (faceDetections: any): void => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Get the landmarks for the first detected face.
      const landmarks = faceDetections.faceLandmarks[0];
      if (!landmarks || landmarks.length === 0) return;

      // Draw all landmarks.
      landmarks.forEach((landmark: Landmark, index: number) => {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        ctx.beginPath();
        // Use blue for iris landmarks (assumed to be indices 468-472 for the right iris)
        ctx.fillStyle = index >= 468 && index < 468 + 5 ? "blue" : "white";
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fill();
      });

      // --- Gaze Estimation for the Right Eye ---
      // Define eye corner indices (commonly used values for the right eye).
      const rightEyeOuter = landmarks[33]; // outer corner
      const rightEyeInner = landmarks[133]; // inner corner

      // Extract the right iris landmarks (indices 468 to 472).
      const rightIrisLandmarks = landmarks.slice(468, 468 + 5);

      // Compute the iris center by averaging the iris landmark coordinates.
      const rightIrisCenter = {
        x:
          rightIrisLandmarks.reduce(
            (sum: number, pt: Landmark) => sum + pt.x,
            0
          ) / rightIrisLandmarks.length,
        y:
          rightIrisLandmarks.reduce(
            (sum: number, pt: Landmark) => sum + pt.y,
            0
          ) / rightIrisLandmarks.length,
        z:
          rightIrisLandmarks.reduce(
            (sum: number, pt: Landmark) => sum + pt.z,
            0
          ) / rightIrisLandmarks.length,
      };

      // Compute the projection of the iris center onto the line between the eye corners.
      const A = rightEyeOuter;
      const B = rightEyeInner;
      const I = rightIrisCenter;

      // Vector from A to B.
      const AB = { x: B.x - A.x, y: B.y - A.y };
      // Vector from A to I.
      const AI = { x: I.x - A.x, y: I.y - A.y };

      // Calculate the dot product and the squared length of AB.
      const dot = AI.x * AB.x + AI.y * AB.y;
      const norm2 = AB.x * AB.x + AB.y * AB.y;
      // Normalized position along the eye (t = 0 means at the outer corner, t = 1 means at the inner corner).
      const t = dot / norm2;

      // Determine if the iris is roughly centered.
      // Adjust these thresholds based on your calibration.
      const isLookingForward = t >= 0.4 && t <= 0.6;
      notFacingRef.current = !isLookingForward;

      // Draw the gaze status near the iris.
      const irisX = rightIrisCenter.x * canvas.width;
      const irisY = rightIrisCenter.y * canvas.height;
      ctx.font = "18px Arial";
      ctx.fillStyle = "yellow";
      ctx.fillText(
        isLookingForward ? "Looking Forward" : "Looking Away",
        irisX,
        irisY - 10
      );
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
              // When a hand first appears:
              setHandDetectionCounter((prev) => prev + 1);
              // Record the start time
              handDetectionStartTimeRef.current = currentTime;
              isHandOnScreenRef.current = true;
              console.log("Hand appeared, counter incremented.");
            }
          } else {
            // When no hand is detected
            if (
              isHandOnScreenRef.current &&
              handDetectionStartTimeRef.current
            ) {
              // Calculate the elapsed time in seconds
              const durationSec =
                (currentTime - handDetectionStartTimeRef.current) / 1000;
              setHandDetectionDuration((prev) => prev + durationSec);
              // Reset the start time
              handDetectionStartTimeRef.current = 0;
              console.log(
                `Hand disappeared, duration added: ${durationSec} seconds.`
              );
            }
            if (isHandOnScreenRef.current) {
              isHandOnScreenRef.current = false;
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

        //   console.log("Face land marker instance: ", currentTime);
          setFacePresence(
            faceDetections.faceLandmarks &&
              faceDetections.faceLandmarks.length > 0
          );
          if (
            faceDetections.faceLandmarks &&
            faceDetections.faceLandmarks.length > 0
          ) {
            drawFaceMeshLandmarks(faceDetections);
          }

          if (faceDetections.faceLandmarks.length > 0) {
            console.log("Inside face is present")
            if (notFacingRef.current) {
              // If not facing forward, start timer if not already started
              if (notFacingStartTimeRef.current === null) {
                console.log("start facing away timer")
                notFacingStartTimeRef.current = currentTime;
              }
            } else {
              // If facing forward and the timer was running, compute elapsed time
              if (notFacingStartTimeRef.current !== null) {
                const elapsedSec = (currentTime - notFacingStartTimeRef.current) / 1000;
                setNotFacingDuration((prev) => prev + elapsedSec);
                notFacingStartTimeRef.current = null;
                console.log("Update TIMER: ", notFacingDuration);
              }
            }
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
          await initializeFaceMesh();
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
        {handDetectionCounter}; Total Hand Detection Duration:{" "}
        {handDetectionDuration.toFixed(2)} seconds; Face Detected:{" "}
        {facePresence ? "Yes" : "No"}; Pose Detected:{" "}
        {posePresence ? "Yes" : "No"}
        {notFacingDuration.toFixed(2)} seconds;

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
