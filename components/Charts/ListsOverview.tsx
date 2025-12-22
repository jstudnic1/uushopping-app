import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from "react-native";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShoppingList } from "@/types/shopping-list";
import Colors from "@/constants/colors";

interface ListsOverviewProps {
  lists: ShoppingList[];
}

export default function ListsOverview({ lists }: ListsOverviewProps) {
  const { colors, theme } = useTheme();
  const { t } = useLanguage();
  const { width } = useWindowDimensions();

  // Only render on web
  if (Platform.OS !== "web") {
    return null;
  }

  if (!lists || lists.length === 0) {
    return null;
  }

  const data = lists.map((list) => ({
    name: list.title,
    count: list.items.length,
  }));

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
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={colors.border}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke={colors.text}
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: colors.border }}
            />
            <YAxis
              stroke={colors.text}
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: colors.border }}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{
                fill:
                  theme === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)",
              }}
              contentStyle={{
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderRadius: 8,
              }}
              itemStyle={{ color: colors.text }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={Colors.light.tint} />
              ))}
            </Bar>
          </BarChart>
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
  },
});
