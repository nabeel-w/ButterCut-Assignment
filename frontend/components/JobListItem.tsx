import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Alert,
  Linking,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Job } from "../lib/types";
import { jobsStyles } from "../styles/jobsScreen";
import { colors } from "../styles/common";
import { api, API_BASE_URL } from "@/lib/api";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import * as Sharing from "expo-sharing";
import CircularProgress from "./CircularProgress";

interface Props {
  job: Job;
}
// You can move this to lib/types.ts if you like
interface JobDetail extends Job {
  input_path: string;
  output_path: string | null;
  overlays: any[];
}

const JobListItem: React.FC<Props> = ({ job }) => {
  const [detail, setDetail] = useState<JobDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const progress = useMemo(
    () => detail?.progress ?? job.progress ?? 0,
    [detail?.progress, job.progress]
  );
  const status = useMemo(
    () => (detail?.status as Job["status"]) ?? job.status,
    [detail?.status, job.status]
  );
  const message = useMemo(
    () => detail?.message ?? job.message,
    [detail?.message, job.message]
  );

  const isDone = useMemo(
    () => status === "done" && progress >= 100,
    [status, progress]
  );
  const hasResult = useMemo(
    () => isDone && !!detail?.output_path,
    [isDone, detail?.output_path]
  );

  useEffect(() => {
    let cancelled = false;

    const fetchDetail = async () => {
      try {
        setLoadingDetail(true);
        const res = await api.get<JobDetail>(`/jobs/${job.id}/detail`);
        if (!cancelled) {
          setDetail(res.data);
        }
      } catch (e) {
        console.log("Failed to load job detail", e);
        // we can ignore error; card will still show base info
      } finally {
        if (!cancelled) {
          setLoadingDetail(false);
        }
      }
    };

    // fetch job details every 3 seconds only if job is not done
    if (status !== "done") {
      fetchDetail();
      const interval = setInterval(fetchDetail, 3000);
      return () => {
        cancelled = true;
        clearInterval(interval);
      };
    } else {
      // fetch once to get final detail
      fetchDetail();

      return () => {
        cancelled = true;
      };
    }
  }, [job.id]);

  const downloadJobResultToLocal = async (
    jobId: string
  ): Promise<string | null> => {
    try {
      const remoteUrl = `${API_BASE_URL}/api/v1/jobs/${jobId}/result`;
      const localUri = new FileSystem.Directory(
        FileSystem.Paths.document,
        "ButterCut"
      );

      // ensure subfolder exists (optional but cleaner)
      if (!localUri.exists) {
        localUri.create();
      }

      const result = await FileSystem.File.downloadFileAsync(
        remoteUrl,
        localUri,
        {
          idempotent: true,
        }
      );
      console.log("Download complete:", result);
      return result.uri; // this is a file:// URI
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Failed to download file");
      return null;
    }
  };

  const handleDownload = async () => {
    if (!hasResult || !detail?.output_path) return;

    try {

      const localUri = await downloadJobResultToLocal(job.id);
      if (!localUri) return;
      // Use Sharing API to share the file
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert("Error", "Sharing is not available on this platform");
        return;
      }
      await Sharing.shareAsync(localUri, {
        mimeType: "video/mp4",
        dialogTitle: "Share Rendered Video",
        UTI: `${detail.id}_output.mp4`,
      });
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Failed to download file");
    }
  };

  return (
    <View style={jobsStyles.jobCard}>
      {/* Thumbnail / progress circle */}
      <View style={jobsStyles.thumbnail}>
        {isDone ? (
          <Feather name="check" size={24} color={colors.success} />
        ) : (
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <CircularProgress
              size={48}
              strokeWidth={4}
              progress={progress}
              color={colors.primary}
              backgroundColor="#e5e7eb"
            />
          </View>
        )}
      </View>

      {/* Main text content */}
      <View style={{ flex: 1 }}>
        <Text style={jobsStyles.jobTitle} numberOfLines={1}>
          Job {job.id.slice(0, 8)}
        </Text>
        <Text style={jobsStyles.jobStatus}>Status: {status.toUpperCase()}</Text>
        {message ? (
          <Text style={jobsStyles.jobMessage} numberOfLines={1}>
            {message}
          </Text>
        ) : null}
      </View>

      {/* Download + detail loading indicator */}
      <View style={jobsStyles.actionsContainer}>
        {loadingDetail && (
          <ActivityIndicator
            size="small"
            color={colors.muted}
            style={{ marginRight: 8 }}
          />
        )}

        <TouchableOpacity
          style={[
            jobsStyles.downloadButton,
            !hasResult && jobsStyles.downloadButtonDisabled,
          ]}
          onPress={handleDownload}
          disabled={!hasResult}
        >
          <Feather
            name="share"
            size={16}
            color={hasResult ? "#ffffff" : "#9ca3af"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default JobListItem;
