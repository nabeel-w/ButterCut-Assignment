import React from "react";
import { View, Text } from "react-native";
import Slider from "@react-native-community/slider";
import { Overlay } from "../lib/types";
import { editorStyles } from "../styles/editorScreen";

interface Props {
  overlay: Overlay;
  onUpdate: (patch: Partial<Overlay>) => void;
  videoDurationSec: number | null;
}

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const OverlayTimingControls: React.FC<Props> = ({
  overlay,
  onUpdate,
  videoDurationSec,
}) => {
  const effectiveDuration = videoDurationSec && videoDurationSec > 0
    ? videoDurationSec
    : 30;

  const start = clamp(overlay.start_time, 0, effectiveDuration);
  const end = clamp(overlay.end_time, start + 0.1, effectiveDuration);

  const handleStartChange = (val: number) => {
    const newStart = clamp(val, 0, effectiveDuration);
    let newEnd = end;
    if (newEnd <= newStart) {
      newEnd = clamp(newStart + 0.5, 0, effectiveDuration);
    }
    onUpdate({ start_time: newStart, end_time: newEnd });
  };

  const handleEndChange = (val: number) => {
    const newEnd = clamp(val, 0, effectiveDuration);
    let newStart = start;
    if (newEnd <= newStart) {
      newStart = clamp(newEnd - 0.5, 0, effectiveDuration);
    }
    onUpdate({ start_time: newStart, end_time: newEnd });
  };

  return (
    <View>
      <Text style={editorStyles.editPanelTitle}>
        Timing for {overlay.type} overlay
      </Text>

      <Text style={editorStyles.timingLabel}>
        Start time: {start.toFixed(1)}s
      </Text>
      <View style={editorStyles.timingSliderRow}>
        <Slider
          value={start}
          minimumValue={0}
          maximumValue={effectiveDuration}
          onValueChange={handleStartChange}
        />
      </View>

      <Text style={editorStyles.timingLabel}>
        End time: {end.toFixed(1)}s
      </Text>
      <View style={editorStyles.timingSliderRow}>
        <Slider
          value={end}
          minimumValue={0}
          maximumValue={effectiveDuration}
          onValueChange={handleEndChange}
        />
      </View>
    </View>
  );
};

export default OverlayTimingControls;
