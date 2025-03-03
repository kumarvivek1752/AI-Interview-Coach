"use client";

import { SettingsProvider } from "@/lib/settings-provider";
import { RealtimeAudio } from "@/components/Screenpipe/realtime-audio";
import Camera from "@/components/Camera/Camera";

export default function Page() {
  return (
    <SettingsProvider>
      <RealtimeAudio />
      <Camera/>
    </SettingsProvider>
  );
}