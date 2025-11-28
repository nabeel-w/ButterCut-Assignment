import React from "react";
import { View, Text } from "react-native";
import { jobsStyles } from "../styles/jobsScreen";

interface JobsHeaderProps {
  count: number;
}

const JobsHeader: React.FC<JobsHeaderProps> = ({ count }) => {
  const subtitle =
    count === 0
      ? "Start a new project to see it appear here."
      : `${count} project${count === 1 ? "" : "s"} in your workspace`;

  return (
    <View style={jobsStyles.headerContainer}>
      <Text style={jobsStyles.headerTitle}>Your Projects</Text>
      <Text style={jobsStyles.headerSubtitle}>{subtitle}</Text>
    </View>
  );
};

export default JobsHeader;
