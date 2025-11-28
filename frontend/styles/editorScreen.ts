import { StyleSheet } from "react-native";
import { colors } from "./common";

export const editorStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  // canvas area
  previewWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 16,
    overflow: "hidden",
  },
  emptyCanvasTouchable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyCanvasTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  emptyCanvasSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
  },

  // bottom panel
  bottomPanel: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  overlayButtonRow: {
    flexDirection: "row",
  },
  overlayButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  overlayButtonText: {
    backgroundColor: "#111827",
  },
  overlayButtonImage: {
    backgroundColor: "#1f2937",
  },
  overlayButtonVideo: {
    backgroundColor: "#374151",
  },
  overlayButtonLabel: {
    color: "#ffffff",
    fontSize: 12,
    marginLeft: 4,
  },
  renderButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  renderButtonEnabled: {
    backgroundColor: colors.primary,
  },
  renderButtonDisabled: {
    backgroundColor: "#d1d5db",
  },
  renderButtonText: {
    color: "#ffffff",
    fontSize: 12,
    marginLeft: 4,
  },

  // editor / inputs
  editPanelTitle: {
    fontSize: 11,
    color: colors.muted,
    marginBottom: 6,
  },
  textInputRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 11,
    marginRight: 8,
  },
  smallInput: {
    width: 80,
    marginRight: 0,
  },
  colorPaletteRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  colorSwatch: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  colorSwatchSelected: {
    borderWidth: 2,
    borderColor: "#f59e0b",
  },
  boxToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  boxToggleLabel: {
    fontSize: 11,
    color: colors.muted,
    marginRight: 8,
  },
  timingSection: {
    marginTop: 4,
  },
  timingLabel: {
    fontSize: 11,
    color: colors.muted,
    marginBottom: 2,
  },
  timingSliderRow: {
    marginBottom: 4,
  },
});
