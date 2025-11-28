import React, { useState } from "react";
import { View, TouchableOpacity, Text, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { editorStyles } from "../styles/editorScreen";
import { Overlay, OverlayType } from "../lib/types";
import OverlayPreview from "../components/OverlayPreview";
import TextOverlayEditor from "../components/TextOverlayEditor";
import OverlayTimingControls from "../components/OverlayTimingControls";
import { api } from "../lib/api";

type SelectedVideo = {
  uri: string;
  name: string;
  mimeType?: string | null;
};

const EditorScreen: React.FC = () => {
  const router = useRouter();

  const [video, setVideo] = useState<SelectedVideo | null>(null);
  const [videoDurationSec, setVideoDurationSec] = useState<number | null>(null);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAsset, setIsUploadingAsset] = useState(false)
  
  const genId = () => {
    return Math.random().toString(36).substr(2, 9);
  }

  const pickMainVideo = async () => {
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
      setVideoDurationSec(null);
      setOverlays([]);
      setSelectedOverlayId(null);
    }
  };

  const addOverlay = (type: OverlayType) => {
    if (!video) {
      Alert.alert("Select a video first");
      return;
    }

    const id = genId();

    const base: Overlay = {
      id,
      type,
      content:
        type === "text"
          ? "New Text"
          : "", // image/video content becomes filename after upload
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
    setSelectedOverlayId(id);
  };

  const updateOverlay = (id: string, patch: Partial<Overlay>) => {
    setOverlays((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...patch } : o))
    );
  };

  const handleUpdatePosition = (id: string, x: number, y: number) => {
    updateOverlay(id, { x, y });
  };

  const uploadOverlayAsset = async (overlay: Overlay) => {
    if (!video) {
      Alert.alert("Select a video first");
      return;
    }
    if (!overlay.id) return;

    try {
      const docType =
        overlay.type === "image" ? ["image/*"] : ["video/*"];

      const result = await DocumentPicker.getDocumentAsync({
        type: docType,
        copyToCacheDirectory: true,
      });

      if (result.canceled === true) return;

      setIsUploadingAsset(true);

      const formData = new FormData();
      formData.append("file", {
        uri: result.assets[0].uri,
        name: result.assets[0].name,
        type: result.assets[0].mimeType ?? "application/octet-stream",
      } as any);

      const res = await fetch(`${api.defaults.baseURL}/overlays/assets`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        console.log("Asset upload failed", text);
        Alert.alert("Asset upload failed");
        return;
      }

      const data = await res.json();
      // expects { filename: "stored_name.ext" }
      if (!data.filename) {
        Alert.alert("Invalid asset upload response");
        return;
      }

      updateOverlay(overlay.id, { content: data.filename, uri: result.assets[0].uri });
    } catch (e) {
      console.log("Asset upload error", e);
      Alert.alert("Asset upload error");
    } finally {
      setIsUploadingAsset(false);
    }
  };

  const submitJob = async () => {
    if (!video) {
      Alert.alert("Select a video first");
      return;
    }
    if (overlays.length === 0) {
      Alert.alert("Add at least one overlay");
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

      const payload = overlays.map(({ id, uri, ...rest }) => rest);
      formData.append("overlays", JSON.stringify(payload));

      const res = await fetch(`${api.defaults.baseURL}/jobs`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        console.log("Upload failed", text);
        Alert.alert("Upload failed");
        return;
      }

      const data = await res.json();
      Alert.alert("Job created", `ID: ${data.id}`);
      router.back();
    } catch (e) {
      console.log("Submit error", e);
      Alert.alert("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedOverlay =
    overlays.find((o) => o.id === selectedOverlayId) ?? null;

  return (
    <View style={editorStyles.screen}>
      {/* Canvas area */}
      <View style={editorStyles.previewWrapper}>
        <OverlayPreview
          videoUri={video?.uri ?? null}
          overlays={overlays}
          selectedOverlayId={selectedOverlayId}
          onSelectOverlay={(id) => setSelectedOverlayId(id)}
          onUpdateOverlayPosition={handleUpdatePosition}
          onPickVideo={pickMainVideo}
          onVideoDurationChange={(sec) => setVideoDurationSec(sec)}
        />
      </View>

      {/* Bottom controls */}
      <View style={editorStyles.bottomPanel}>
        <View style={editorStyles.controlsRow}>
          {/* Overlay type buttons */}
          <View style={editorStyles.overlayButtonRow}>
            <TouchableOpacity
              style={[
                editorStyles.overlayButton,
                editorStyles.overlayButtonText,
              ]}
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
              onPress={() => addOverlay("video")}
            >
              <Feather name="film" size={16} color="#ffffff" />
              <Text style={editorStyles.overlayButtonLabel}>Clip</Text>
            </TouchableOpacity>
          </View>

          {/* Render button */}
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

        {/* Selected overlay controls */}
        {selectedOverlay && (
          <>
            {selectedOverlay.type === "text" ? (
              <TextOverlayEditor
                overlay={selectedOverlay}
                onUpdate={(patch) =>
                  selectedOverlay.id &&
                  updateOverlay(selectedOverlay.id, patch)
                }
                videoDurationSec={videoDurationSec}
              />
            ) : (
              <>
                {/* Upload asset button */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => uploadOverlayAsset(selectedOverlay)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 8,
                      backgroundColor: "#111827",
                      marginRight: 8,
                    }}
                  >
                    <Feather name="upload" size={14} color="#ffffff" />
                    <Text
                      style={{ color: "#ffffff", fontSize: 12, marginLeft: 4 }}
                    >
                      {selectedOverlay.content
                        ? "Change file"
                        : "Upload file"}
                    </Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 11, color: "#6b7280" }}>
                    {isUploadingAsset
                      ? "Uploading..."
                      : selectedOverlay.content || "No file selected"}
                  </Text>
                </View>

                <OverlayTimingControls
                  overlay={selectedOverlay}
                  onUpdate={(patch) =>
                    selectedOverlay.id &&
                    updateOverlay(selectedOverlay.id, patch)
                  }
                  videoDurationSec={videoDurationSec}
                />
              </>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default EditorScreen;
