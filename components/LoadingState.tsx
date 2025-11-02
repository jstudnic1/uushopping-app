import { View, ActivityIndicator, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

export default function LoadingState() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.light.tint} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
