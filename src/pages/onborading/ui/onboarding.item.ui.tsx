import { BlurView } from "expo-blur";
import { StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IOnboardingDomain } from "../onboarding.domain";

interface IOnboardingItem {
  item: IOnboardingDomain;
  index: number;
  offset: SharedValue<number>;
}

const colors = [
  "rgba(180, 220, 255, 0.8)",
  "rgba(255, 200, 120, 0.8)",
  "rgba(255, 120, 180, 1)",
  "rgba(255, 240, 200, 0.8)",
];

export default function OnboardingItem(props: IOnboardingItem) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { item, index, offset } = props;

  const scaleContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            offset.value,
            [index - 1, index, index + 1],
            [1.1, 1, 1.1],
          ),
        },
      ],
    };
  });

  const scaleImageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            offset.value,
            [index - 1, index, index + 1],
            [1, 1.4, 1],
          ),
        },
      ],
    };
  });

  return (
    <Animated.View
      style={{
        width,
        height,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: insets.bottom,
        paddingTop: insets.top,
      }}
    >
      <Animated.View
        className={"shadow-md shadow-black overflow-hidden rounded-2xl"}
      >
        <Animated.View
          style={[
            {
              overflow: "hidden",
              borderRadius: 12,
              width: width - 64,
              height: (height - insets.top - insets.bottom) / 1.5,
              justifyContent: "flex-end",
            },
            scaleContainerStyle,
          ]}
        >
          <Animated.Image
            style={[StyleSheet.absoluteFillObject, scaleImageStyle]}
            source={{
              uri: item.image_url,
            }}
          />

          <BlurView
            experimentalBlurMethod="dimezisBlurView"
            intensity={40}
            style={{
              padding: 24,
              flexDirection: "column",
              gap: 24,
            }}
          >
            <Animated.Text
              numberOfLines={1}
              style={{
                fontSize: 32,
                fontWeight: "500",
                color: colors[index],
              }}
            >
              {item.title}
            </Animated.Text>
            <Animated.Text
              numberOfLines={2}
              style={{
                fontSize: 24,
                fontWeight: "400",
                color: colors[index],
              }}
            >
              {item.description}
            </Animated.Text>
          </BlurView>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}
