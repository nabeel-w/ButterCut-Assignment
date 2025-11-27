import React from "react";
import { TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { jobsStyles } from "../styles/jobsScreen";

interface Props {
  onPress: () => void;
}

const FloatingActionButton: React.FC<Props> = ({ onPress }) => {
  return (
    <TouchableOpacity style={jobsStyles.fab} onPress={onPress}>
      <Feather name="plus" size={26} color="#ffffff" />
    </TouchableOpacity>
  );
};

export default FloatingActionButton;
