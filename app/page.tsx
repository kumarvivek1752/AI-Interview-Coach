"use client";

import { SettingsProvider } from "@/lib/settings-provider";
import { RealtimeAudio } from "@/components/screenpipe/realtime-audio";
import Camera from "@/components/camera";
import { useState } from "react";
export default function Page() {

  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  return (
    <SettingsProvider>
      <RealtimeAudio />
      <Camera/>
    </SettingsProvider>
  );
}