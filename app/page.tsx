"use client";

import { SettingsProvider } from "@/lib/settings-provider";
import { RealtimeAudio } from "@/components/screenpipe/realtime-audio";
import Camera from "@/components/camera";
export default function Page() {

  return (
    <SettingsProvider>
      <RealtimeAudio />
      <Camera/>
    </SettingsProvider>
  );
}