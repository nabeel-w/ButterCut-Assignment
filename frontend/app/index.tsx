import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { api } from "../lib/api";
import { Job } from "../lib/types";
import { jobsStyles } from "../styles/jobsScreen";
import JobListItem from "../components/JobListItem";
import FloatingActionButton from "../components/FloatingActionButton";
import JobsHeader from "@/components/JobsHeader";

const JobsScreen: React.FC = () => {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<Job[]>("/jobs");
      setJobs(res.data);
    } catch (e) {
      console.log("Error fetching jobs", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // set time interval to fetch jobs every 10 seconds
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={jobsStyles.container}>
      {jobs.length === 0 && !loading ? (
        <View style={jobsStyles.emptyContainer}>
          <Text style={jobsStyles.emptyTitle}>Start a new project</Text>
          <Text style={jobsStyles.emptySubtitle}>
            You don&apos;t have any rendered videos yet. Tap the + button to
            create your first project.
          </Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={jobsStyles.listContent}
          data={jobs}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => <JobsHeader count={jobs.length} />}
          renderItem={({ item }) => <JobListItem job={item} />}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchJobs} />
          }
        />
      )}

      <FloatingActionButton onPress={() => router.push("/editor")} />
    </View>
  );
};

export default JobsScreen;
