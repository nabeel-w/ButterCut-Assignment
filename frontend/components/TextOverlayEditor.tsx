import React from "react";
import { View, Text, TextInput } from "react-native";
import { Overlay } from "../lib/types";
import { editorStyles } from "../styles/editorScreen";

interface Props {
  overlay: Overlay;
  onUpdate: (patch: Partial<Overlay>) => void;
}

const TextOverlayEditor: React.FC<Props> = ({ overlay, onUpdate }) => {
  return (
    <View>
      <Text style={editorStyles.editPanelTitle}>
        Editing overlay ({overlay.type})
      </Text>

      {overlay.type === "text" && (
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
      )}

      <View style={editorStyles.timingRow}>
        <TextInput
          style={editorStyles.timingInput}
          value={String(overlay.start_time)}
          onChangeText={(text) =>
            onUpdate({ start_time: Number(text) || 0 })
          }
          placeholder="Start (s)"
          keyboardType="numeric"
        />
        <TextInput
          style={editorStyles.timingInput}
          value={String(overlay.end_time)}
          onChangeText={(text) => onUpdate({ end_time: Number(text) || 0 })}
          placeholder="End (s)"
          keyboardType="numeric"
        />
      </View>
    </View>
  );
};

export default TextOverlayEditor;
