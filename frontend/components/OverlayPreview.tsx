import React, { useState } from "react";
import {
  View,
  Text,
  LayoutChangeEvent,
  PanResponder,
  PanResponderInstance,
  TouchableOpacity,
  Image,
} from "react-native";
import { ResizeMode, Video } from "expo-av";
import { Feather } from "@expo/vector-icons";
import { Overlay } from "../lib/types";
import { editorStyles } from "../styles/editorScreen";

interface Props {
  videoUri: string | null;
  overlays: Overlay[];
  selectedOverlayId: string | null;
  onSelectOverlay: (id: string) => void;
  onUpdateOverlayPosition: (id: string, x: number, y: number) => void;
  onPickVideo: () => void;
  onVideoDurationChange?: (durationSec: number) => void;
}

const OverlayPreview: React.FC<Props> = ({
  videoUri,
  overlays,
  selectedOverlayId,
  onSelectOverlay,
  onUpdateOverlayPosition,
  onPickVideo,
  onVideoDurationChange,
}) => {
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setPreviewSize({ width, height });
  };

  const makePanResponder = (overlay: Overlay): PanResponderInstance => {
    let startX = overlay.x;
    let startY = overlay.y;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        if (overlay.id) {
          onSelectOverlay(overlay.id);
        }
        // capture starting normalized positions
        startX = overlay.x;
        startY = overlay.y;
      },
      onPanResponderMove: (_, gesture) => {
        const { dx, dy } = gesture;
        const { width, height } = previewSize;
        if (!width || !height || !overlay.id) return;

        const newX = Math.min(1, Math.max(0, startX + dx / width));
        const newY = Math.min(1, Math.max(0, startY + dy / height));

        onUpdateOverlayPosition(overlay.id, newX, newY);
      },
    });
  };

  if (!videoUri) {
    // Empty state: big upload CTA in place of canvas
    return (
      <View style={editorStyles.previewContainer} onLayout={onLayout}>
        <TouchableOpacity
          style={editorStyles.emptyCanvasTouchable}
          onPress={onPickVideo}
        >
          <Feather name="upload" size={32} color="#9ca3af" />
          <Text style={editorStyles.emptyCanvasTitle}>Upload a video</Text>
          <Text style={editorStyles.emptyCanvasSubtitle}>
            Tap here to choose a video from your device and start editing.
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={editorStyles.previewContainer} onLayout={onLayout}>
      <Video
        source={{ uri: videoUri }}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
        }}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isLooping
        onPlaybackStatusUpdate={(status) => {
          if (!status.isLoaded) return;
          if (onVideoDurationChange && status.durationMillis != null) {
            onVideoDurationChange(status.durationMillis / 1000);
          }
        }}
      />

      {previewSize.width > 0 &&
        previewSize.height > 0 &&
        overlays.map((o) => {
          const left = o.x * previewSize.width;
          const top = o.y * previewSize.height;
          const responder = makePanResponder(o);
          const selected = o.id === selectedOverlayId;

          if (o.type === "text") {
            return (
              <View
                key={o.id}
                style={{
                  position: "absolute",
                  left,
                  top,
                }}
                {...responder.panHandlers}
              >
                <Text
                  style={{
                    color: o.color ?? "#ffffff",
                    fontSize: o.font_size ?? 24,
                    backgroundColor: o.box ? "rgba(0,0,0,0.5)" : "transparent",
                    paddingHorizontal: o.box_borderw ?? 4,
                    paddingVertical: 2,
                    borderWidth: selected ? 1 : 0,
                    borderColor: selected ? "#fbbf24" : "transparent",
                  }}
                  onPress={() => o.id && onSelectOverlay(o.id)}
                >
                  {o.content}
                </Text>
              </View>
            );
          }

          // For image/video overlays we still show a simple placeholder "block"
          return (
            <View
              key={o.id}
              style={{
                position: "absolute",
                left,
                top,
                // width: 70,
                // height: 44,
                borderRadius: 6,
                // backgroundColor: o.type === "image" ? "#0ea5e9" : "#4f46e5",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: selected ? 2 : 0,
                borderColor: selected ? "#fbbf24" : "transparent",
              }}
              {...responder.panHandlers}
            >
              {o.uri ? (
                o.type === "image" ? (
                  <Image
                    source={{ uri: o.uri }}
                    resizeMode="contain"
                    style={{ width: 100, height: 100 }}
                  />
                ) : (
                  <Video
                    source={{ uri: o.uri }}
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay={true}
                    style={{ width: 100, height: 100 }}
                  />
                )
              ) : (
                <Feather name={o.type === "image" ? "image" : "film"} size={64} color="#000" />
              )}
            </View>
          );
        })}
    </View>
  );
};

export default OverlayPreview;
