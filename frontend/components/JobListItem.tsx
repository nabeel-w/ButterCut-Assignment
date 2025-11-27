import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Job } from "../lib/types";
import { jobsStyles } from "../styles/jobsScreen";
import { colors } from "../styles/common";

interface Props {
  job: Job;
}

const JobListItem: React.FC<Props> = ({ job }) => {
  const progress = job.progress ?? 0;
  const isDone = job.status === "done" && progress >= 100;

  return (
    <View style={jobsStyles.jobCard}>
      <View style={jobsStyles.thumbnail}>
        {isDone ? (
          <Feather name="check" size={24} color={colors.success} />
        ) : (
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 10, color: "#4b5563", marginBottom: 2 }}>
              Rendering
            </Text>
            <Text style={{ fontSize: 11, fontWeight: "600" }}>
              {Math.round(progress)}%
            </Text>
          </View>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={jobsStyles.jobTitle} numberOfLines={1}>
          Job {job.id.slice(0, 8)}
        </Text>
        <Text style={jobsStyles.jobStatus}>
          Status: {job.status.toUpperCase()}
        </Text>
        {job.message ? (
          <Text style={jobsStyles.jobMessage} numberOfLines={1}>
            {job.message}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export default JobListItem;
