import { StyleSheet } from "react-native";
import Animated, {
    Easing,
    interpolateColor,
    SharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";

const colors = [
  "rgba(180, 220, 255, 0.8)",
  "rgba(255, 200, 120, 0.8)",
  "rgba(255, 120, 180, 1)",
  "rgba(255, 240, 200, 0.8)",
];

interface IAnimatedBackgroundProps {
  offset: SharedValue<number>;
}
export default function OnboardingBackground(props: IAnimatedBackgroundProps) {
  const style = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(
        interpolateColor(props.offset.value, [0, 1, 2, 3], colors),
        {
          duration: 150,
          easing: Easing.linear,
        },
      ),
    };
  });

  return <Animated.View style={[StyleSheet.absoluteFillObject, style]} />;
}
