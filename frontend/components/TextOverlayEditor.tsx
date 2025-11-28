import React from "react";
import { View, Text, TextInput, TouchableOpacity, Switch } from "react-native";
import Slider from "@react-native-community/slider";
import { Overlay } from "../lib/types";
import { editorStyles } from "../styles/editorScreen";

interface Props {
  overlay: Overlay;
  onUpdate: (patch: Partial<Overlay>) => void;
  videoDurationSec: number | null;
}

const COLOR_OPTIONS = ["#ffffff", "#f97316", "#22c55e", "#3b82f6", "#e11d48"];

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const TextOverlayEditor: React.FC<Props> = ({
  overlay,
  onUpdate,
  videoDurationSec,
}) => {
  const effectiveDuration = videoDurationSec && videoDurationSec > 0
    ? videoDurationSec
    : 30; // fallback

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
        Editing text overlay
      </Text>

      {/* Text + color text input */}
      <View style={editorStyles.textInputRow}>
        <TextInput
          style={editorStyles.textInput}
          value={overlay.content}
          onChangeText={(text) => onUpdate({ content: text })}
          placeholder="Text"
        />
        <TextInput
          style={[editorStyles.textInput, editorStyles.smallInput]}
          value={overlay.color ?? ""}
          onChangeText={(text) => onUpdate({ color: text })}
          placeholder="Color"
        />
      </View>

      {/* Color palette */}
      <View style={editorStyles.colorPaletteRow}>
        {COLOR_OPTIONS.map((c) => {
          const selected = overlay.color === c;
          return (
            <TouchableOpacity
              key={c}
              onPress={() => onUpdate({ color: c })}
            >
              <View
                style={[
                  editorStyles.colorSwatch,
                  { backgroundColor: c },
                  selected && editorStyles.colorSwatchSelected,
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Box background toggle */}
      <View style={editorStyles.boxToggleRow}>
        <Text style={editorStyles.boxToggleLabel}>Box background</Text>
        <Switch
          value={overlay.box ?? true}
          onValueChange={(val) => onUpdate({ box: val })}
        />
      </View>

      {/* Timing sliders */}
      <View style={editorStyles.timingSection}>
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
    </View>
  );
};

export default TextOverlayEditor;
