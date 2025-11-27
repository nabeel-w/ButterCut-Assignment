import React, { useState } from "react";
import {
  View,
  Text,
  LayoutChangeEvent,
  PanResponder,
  PanResponderInstance,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from 'expo';
import { Overlay } from "../lib/types";
import { editorStyles } from "../styles/editorScreen";

interface Props {
  videoUri: string | null;
  overlays: Overlay[];
  selectedOverlayId: string | null;
  onSelectOverlay: (id: string) => void;
  onUpdateOverlayPosition: (id: string, x: number, y: number) => void;
}

const OverlayPreview: React.FC<Props> = ({
  videoUri,
  overlays,
  selectedOverlayId,
  onSelectOverlay,
  onUpdateOverlayPosition,
}) => {
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
  const player = useVideoPlayer(videoUri, (player) => {
    player.loop = true;
    player.play();
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setPreviewSize({ width, height });
  };

  const makePanResponder = (overlay: Overlay): PanResponderInstance =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        if (overlay.id) onSelectOverlay(overlay.id);
      },
      onPanResponderMove: (_, gesture) => {
        const { dx, dy } = gesture;
        if (!previewSize.width || !previewSize.height) return;

        const absX = overlay.x * previewSize.width + dx;
        const absY = overlay.y * previewSize.height + dy;

        const newX = Math.min(1, Math.max(0, absX / previewSize.width));
        const newY = Math.min(1, Math.max(0, absY / previewSize.height));

        if (overlay.id) onUpdateOverlayPosition(overlay.id, newX, newY);
      },
    });

  return (
    <View style={editorStyles.previewContainer} onLayout={onLayout}>
      {videoUri ? (
        <>
          <VideoView 
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
            }}
            player={player}
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
                        backgroundColor: o.box
                          ? "rgba(0,0,0,0.5)"
                          : "transparent",
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

              return (
                <View
                  key={o.id}
                  style={{
                    position: "absolute",
                    left,
                    top,
                    width: 60,
                    height: 40,
                    borderRadius: 6,
                    backgroundColor: "#8b5cf6",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: selected ? 2 : 0,
                    borderColor: selected ? "#fbbf24" : "transparent",
                  }}
                  {...responder.panHandlers}
                >
                  <Text
                    style={{ fontSize: 10, color: "#ffffff" }}
                    onPress={() => o.id && onSelectOverlay(o.id)}
                  >
                    {o.type.toUpperCase()}
                  </Text>
                </View>
              );
            })}
        </>
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#9ca3af", fontSize: 13 }}>
            Select a video to start editing
          </Text>
        </View>
      )}
    </View>
  );
};

export default OverlayPreview;
