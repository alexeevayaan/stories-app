import {
  Canvas,
  interpolateColors,
  Rect,
  TwoPointConicalGradient,
  vec,
} from "@shopify/react-native-skia";
import { useEffect } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  FadeIn,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const startColors = [
  "rgba(20, 20, 40, 0.8)",
  "rgba(20, 20, 40, 0.8)",
  "rgba(60, 60, 120, 1)",
  "rgba(120, 20, 60, 0.8)",
];

const endColors = [
  "rgba(180, 220, 255, 0.8)",
  "rgba(255, 200, 120, 0.8)",
  "rgba(255, 120, 180, 1)",
  "rgba(255, 240, 200, 0.8)",
];

export const WelcomeBackground = () => {
  const { width, height } = useWindowDimensions();

  const colorsIndex = useSharedValue(0);

  useEffect(() => {
    colorsIndex.value = withRepeat(
      withTiming(startColors.length - 1, {
        duration: 14000,
      }),
      -1,
      true,
    );
  }, []);

  const gradientColors = useDerivedValue(() => {
    return [
      interpolateColors(colorsIndex.value, [0, 1, 2, 3], startColors),
      interpolateColors(colorsIndex.value, [0, 1, 2, 3], endColors),
    ];
  });

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject]}
      entering={FadeIn.duration(1250)}
    >
      <Canvas style={{ flex: 1 }}>
        <Rect x={0} y={0} width={width} height={height}>
          <TwoPointConicalGradient
            start={vec(128, 128)}
            startR={height / 1.5}
            end={vec(width / 2, 50)}
            endR={height / 8}
            colors={gradientColors}
          />
        </Rect>
      </Canvas>
    </Animated.View>
  );
};
