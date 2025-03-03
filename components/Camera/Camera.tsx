import React, { useRef, useState } from "react";
import { useCamera } from "../../hooks/useCamera";
import { useMediapipe } from "../../hooks/useMediaPipe";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@radix-ui/react-label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Hand, User, Eye, Activity, AlertTriangle, ToggleLeft } from "lucide-react"

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
    notFacingCounter,
    notFacingDuration,
    badPostureDetectionCounter,
    badPostureDuration,
  } = useMediapipe(videoRef, canvasRef, overlayEnabled);

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold">Posture & Attention Monitoring</h1>
          <div className="flex items-center space-x-2 bg-muted p-2 rounded-lg">
            <Switch
              id="overlay-toggle"
              checked={overlayEnabled}
              onCheckedChange={() => setOverlayEnabled((prev) => !prev)}
            />
            <Label htmlFor="overlay-toggle" className="flex items-center gap-2">
              <span>{overlayEnabled ? "Overlay Enabled" : "Overlay Disabled"}</span>
            </Label>
          </div>
        </div>

        {/* Camera and Canvas Container */}
        <div className="flex justify-center w-full bg-muted rounded-xl p-4">
          <div className="relative w-full max-w-[600px] h-[480px]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="absolute top-0 left-0 w-full h-full object-cover rounded-lg z-10"
            />
            <canvas
              ref={canvasRef}
              width={600}
              height={480}
              className="absolute top-0 left-0 w-full h-full z-20 rounded-lg"
              style={{ backgroundColor: "transparent" }}
            />
          </div>
        </div>

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Hand Detection Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Hand className="h-5 w-5" />
                Hand Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    variant={handPresence ? "destructive" : "default"}
                    className={handPresence ? "bg-red-500" : "bg-green-500"}
                  >
                    {handPresence ? "Detected" : "Not Detected"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Detection Count:</span>
                  <span className="font-medium">{handDetectionCounter}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Duration:</span>
                  <span className="font-medium">{handDetectionDuration.toFixed(2)} seconds</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Face Detection Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Eye Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    variant={facePresence ? "default" : "destructive"}
                    className={facePresence ? "bg-green-500" : "bg-red-500"}
                  >
                    {facePresence ? "Detected" : "Not Detected"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Loss Eye Contact Count:</span>
                  <span className="font-medium">{notFacingCounter}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Looking Away:</span>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">{notFacingDuration.toFixed(2)} seconds</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posture Detection Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Posture Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    variant={posePresence ? "default" : "destructive"}
                    className={posePresence ? "bg-green-500" : "bg-red-500"}
                  >
                    {posePresence ? "Detected" : "Not Detected"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Bad Posture Count:</span>
                  <div className="flex items-center gap-1">
                    <AlertTriangle
                      className={`h-4 w-4 ${badPostureDetectionCounter > 3 ? "text-red-500" : "text-amber-500"}`}
                    />
                    <span className="font-medium">{badPostureDetectionCounter}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Bad Posture Duration:</span>
                  <span className="font-medium">{badPostureDuration.toFixed(2)} seconds</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Camera;
