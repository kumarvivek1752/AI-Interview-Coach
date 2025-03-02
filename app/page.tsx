"use client";

import { SettingsProvider } from "@/lib/settings-provider";
import { LastOcrImage } from "@/components/ready-to-use-examples/last-ocr-image";
import { HealthStatus } from "@/components/ready-to-use-examples/health-status";
import { LastUiRecord } from "@/components/ready-to-use-examples/last-ui-record";
import { PlaygroundCard } from "@/components/playground-card";
import { ClientOnly } from "@/lib/client-only";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { RealtimeAudio } from "@/components/screenpipe/realtime-audio";
import { LastAudioTranscription } from "@/components/ready-to-use-examples/last-audio-transcription";
import Camera from "@/components/camera";
export default function Page() {
  return (
    <SettingsProvider>
      <RealtimeAudio />
      <LastAudioTranscription />
      <Camera/>
    </SettingsProvider>
  );
}