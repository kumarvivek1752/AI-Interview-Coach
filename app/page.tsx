"use client";

import { SettingsProvider } from "@/lib/settings-provider";
import { RealtimeAudio } from "@/components/Screenpipe/realtime-audio";
import Camera from "@/components/Camera/Camera";
import { MetricsProvider } from "@/context/MetricsContext";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function Page() {
  return (
    <SettingsProvider>
      <MetricsProvider>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>
            <RealtimeAudio />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>
            <Camera />
          </ResizablePanel>
        </ResizablePanelGroup>
      </MetricsProvider>
    </SettingsProvider>
  );
}
