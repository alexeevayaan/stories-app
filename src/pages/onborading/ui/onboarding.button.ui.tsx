import { router } from "expo-router";
import { Pressable, useWindowDimensions } from "react-native";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

interface IProps {
  offset: SharedValue<number>;
  length: number;
}

export default function OnboardingButton(props: IProps) {
  const { width } = useWindowDimensions();
  const { offset, length } = props;
  const target = length - 1;

  const style = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            offset.value,
            [target - 1, target - 1, target - 1.5, target, target + 1],
            [width, width, width / 4, 0, 0],
          ),
        },
      ],
      opacity: interpolate(
        offset.value,
        [target - 1, target - 1, target - 1.5, target, target + 1],
        [0, 0, 0.5, 1, 0],
      ),
    };
  });

  const animatedWrapperStyle = useAnimatedStyle(() => ({
    width: interpolate(
      offset.value,
      [target - 1, target - 1, target, target - 1],
      [40, 40, width / 2, 40],
    ),

    borderRadius: interpolate(
      offset.value,
      [target - 1, target - 1, target - 1.5, target, target - 1],
      [100, 100, 100, 12, 100],
    ),
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      offset.value,
      [target - 0.3, target, target + 0.3],
      [0, 1, 0],
    ),
  }));

  return (
    <Animated.View
      className={
        "absolute bottom-safe right-6 h-10 mb-6 rounded-xl shadow-md shadow-black"
      }
      style={[
        style,
        animatedWrapperStyle,
        {
          backgroundColor: "#313131",
        },
      ]}
    >
      <Pressable
        className={"flex-1 justify-center items-center"}
        onPress={() => {
          router.replace("/stories");
        }}
      >
        <Animated.Text
          style={[
            animatedTextStyle,
            {
              fontSize: 16,
              fontWeight: "500",
              color: "white",
              letterSpacing: 4,
            },
          ]}
        >
          Create
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
}
