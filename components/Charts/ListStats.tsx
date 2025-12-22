import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from "react-native";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface ListStatsProps {
  resolved: number;
  unresolved: number;
}

export default function ListStats({ resolved, unresolved }: ListStatsProps) {
  const { colors, theme } = useTheme();
  const { t } = useLanguage();
  const { width } = useWindowDimensions();

  // Only render on web
  if (Platform.OS !== "web") {
    return null;
  }

  const data = [
    { name: t("stats.resolved"), value: resolved, color: "#4CAF50" }, // Green
    { name: t("stats.unresolved"), value: unresolved, color: "#F44336" }, // Red
  ];

  // Don't render if no items
  if (resolved === 0 && unresolved === 0) {
    return null;
  }

  const isSmallScreen = width < 600;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBackground,
          shadowColor: theme === "light" ? "#000" : "transparent",
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {t("stats.itemsOverview")}
      </Text>
      <View
        style={[styles.chartContainer, { height: isSmallScreen ? 200 : 300 }]}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={isSmallScreen ? 40 : 60}
              outerRadius={isSmallScreen ? 60 : 80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={colors.cardBackground}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderRadius: 8,
              }}
              itemStyle={{ color: colors.text }}
            />
            <Legend wrapperStyle={{ paddingTop: 10 }} />
          </PieChart>
        </ResponsiveContainer>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    ...Platform.select({
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  chartContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
