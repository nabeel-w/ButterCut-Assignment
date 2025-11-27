import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { editorStyles } from "../styles/editorScreen";
import { Overlay, OverlayType } from "../lib/types";
import OverlayPreview from "../components/OverlayPreview";
import TextOverlayEditor from "../components/TextOverlayEditor";
import { api } from "../lib/api";

type SelectedVideo = {
  uri: string;
  name: string;
  mimeType?: string | null;
};

const MOCK_IMAGE_ASSETS = ["logo.png", "sticker1.png"];
const MOCK_VIDEO_ASSETS = ["clip1.mp4", "clip2.mp4"];

const EditorScreen: React.FC = () => {
  const router = useRouter();

  const [video, setVideo] = useState<SelectedVideo | null>(null);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const genId = () => Math.random().toString(36).slice(2, 10);

  const pickVideo = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "video/*",
      copyToCacheDirectory: true,
    });

    if (result.canceled === false) {
      const file = result.assets[0];
      setVideo({
        uri: file.uri,
        name: file.name,
        mimeType: file.mimeType,
      });
    }
  };

  const addOverlay = (type: OverlayType) => {
    if (!video) return;

    const base: Overlay = {
      id: genId(),
      type,
      content:
        type === "text"
          ? "New Text"
          : type === "image"
          ? MOCK_IMAGE_ASSETS[0]
          : MOCK_VIDEO_ASSETS[0],
      x: 0.5,
      y: 0.5,
      start_time: 0,
      end_time: 3,
    };

    if (type === "text") {
      base.color = "white";
      base.font_size = 32;
      base.box = true;
      base.box_color = "black@0.5";
      base.box_borderw = 8;
    }

    setOverlays((prev) => [...prev, base]);
    setSelectedOverlayId(base.id!);
  };

  const updateOverlay = (id: string, patch: Partial<Overlay>) => {
    setOverlays((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...patch } : o))
    );
  };

  const submitJob = async () => {
    if (!video) return;
    if (overlays.length === 0) {
      alert("Add at least one overlay.");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();

      formData.append("file", {
        uri: video.uri,
        name: video.name,
        type: video.mimeType ?? "video/mp4",
      } as any);

      const payload = overlays.map(({ id, ...rest }) => rest);
      formData.append("overlays", JSON.stringify(payload));

      const res = await fetch(`${api.defaults.baseURL}/jobs`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        console.log("Upload failed", text);
        alert("Upload failed");
        return;
      }

      const data = await res.json();
      alert(`Job created: ${data.id}`);
      router.back();
    } catch (e) {
      console.log("Submit error", e);
      alert("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedOverlay =
    overlays.find((o) => o.id === selectedOverlayId) ?? null;

  return (
    <View style={editorStyles.screen}>
      {/* Top: video picker */}
      <View style={editorStyles.pickerContainer}>
        <TouchableOpacity onPress={pickVideo} style={editorStyles.pickerButton}>
          <Feather name="video" size={18} color="#ffffff" />
          <Text style={editorStyles.pickerButtonText}>
            {video ? "Change Video" : "Select Video"}
          </Text>
        </TouchableOpacity>
        {video && (
          <Text style={editorStyles.pickerFileName}>
            Selected: {video.name}
          </Text>
        )}
      </View>

      {/* Middle: preview */}
      <View style={editorStyles.previewWrapper}>
        <OverlayPreview
          videoUri={video?.uri ?? null}
          overlays={overlays}
          selectedOverlayId={selectedOverlayId}
          onSelectOverlay={(id) => setSelectedOverlayId(id)}
          onUpdateOverlayPosition={(id, x, y) => updateOverlay(id, { x, y })}
        />
      </View>

      {/* Bottom: controls */}
      <View style={editorStyles.bottomPanel}>
        <View style={editorStyles.controlsRow}>
          <View style={editorStyles.overlayButtonRow}>
            <TouchableOpacity
              style={[
                editorStyles.overlayButton,
                editorStyles.overlayButtonText,
              ]}
              disabled={!video}
              onPress={() => addOverlay("text")}
            >
              <Feather name="type" size={16} color="#ffffff" />
              <Text style={editorStyles.overlayButtonLabel}>Text</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                editorStyles.overlayButton,
                editorStyles.overlayButtonImage,
              ]}
              disabled={!video}
              onPress={() => addOverlay("image")}
            >
              <Feather name="image" size={16} color="#ffffff" />
              <Text style={editorStyles.overlayButtonLabel}>Image</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                editorStyles.overlayButton,
                editorStyles.overlayButtonVideo,
              ]}
              disabled={!video}
              onPress={() => addOverlay("video")}
            >
              <Feather name="film" size={16} color="#ffffff" />
              <Text style={editorStyles.overlayButtonLabel}>Clip</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              editorStyles.renderButton,
              isSubmitting || !video || overlays.length === 0
                ? editorStyles.renderButtonDisabled
                : editorStyles.renderButtonEnabled,
            ]}
            disabled={isSubmitting || !video || overlays.length === 0}
            onPress={submitJob}
          >
            <Feather
              name={isSubmitting ? "loader" : "send"}
              size={16}
              color="#ffffff"
            />
            <Text style={editorStyles.renderButtonText}>
              {isSubmitting ? "Submitting..." : "Render"}
            </Text>
          </TouchableOpacity>
        </View>

        {selectedOverlay && (
          <TextOverlayEditor
            overlay={selectedOverlay}
            onUpdate={(patch) =>
              selectedOverlay.id && updateOverlay(selectedOverlay.id, patch)
            }
          />
        )}
      </View>
    </View>
  );
};

export default EditorScreen;
