import { Easing, withTiming } from "react-native-reanimated";

export const withTimingAnimation = <T extends string | number>(
  value: T,
  duration: number = 150,
) => {
  "worklet";
  return withTiming(value, { duration, easing: Easing.linear });
};
