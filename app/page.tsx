"use client";

import { SettingsProvider } from "@/lib/settings-provider";
import { RealtimeAudio } from "@/components/Screenpipe/realtime-audio";
import Camera from "@/components/Camera/Camera";
import { MetricsProvider } from "@/context/MetricsContext";

export default function Page() {
  return (
    <SettingsProvider>
      <MetricsProvider>
        <RealtimeAudio />
        <Camera />
      </MetricsProvider>
    </SettingsProvider>
  );
}
