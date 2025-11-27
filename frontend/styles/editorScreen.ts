import { StyleSheet } from "react-native";
import { colors } from "./common";

export const editorStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  pickerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 12,
  },
  pickerButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 14,
  },
  pickerFileName: {
    marginTop: 6,
    fontSize: 11,
    color: colors.muted,
  },
  previewWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 16,
    overflow: "hidden",
  },
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
  overlayButtonLabel: {
    color: "#ffffff",
    fontSize: 12,
    marginLeft: 4,
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
  editPanelTitle: {
    fontSize: 11,
    color: colors.muted,
    marginBottom: 4,
  },
  textInputRow: {
    flexDirection: "row",
    marginBottom: 4,
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
  },
  timingRow: {
    flexDirection: "row",
  },
  timingInput: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 11,
    marginRight: 8,
  },
});
