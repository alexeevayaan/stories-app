import {
  Keyboard,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface IProps {
  focusedId: SharedValue<string>;
}

export default function StoriesEdit(props: IProps) {
  const { focusedId } = props;

  const { width, height } = useWindowDimensions();

  const insets = useSafeAreaInsets();

  const offset = {
    closed: 0,
    opened: height - width * (16 / 9) - insets.top - 20,
  };

  const show = useDerivedValue(() => {
    return focusedId.value ? 1 : 0;
  }, [props.focusedId]);

  const style = useAnimatedStyle(() => ({
    opacity: withTiming(interpolate(show.value, [0, 1], [0, 1]), {
      duration: 150,
    }),
  }));

  return (
    <Animated.View
      style={[
        {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0, 0, 0, 0.40)",
        },
        style,
      ]}
    >
      <Pressable
        style={[
          StyleSheet.absoluteFillObject,
          {
            justifyContent: "flex-end",
            alignItems: "center",
          },
        ]}
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <KeyboardStickyView offset={offset}>
          <Animated.View
            style={{
              width: width - 44,
              height: 44,
              backgroundColor: "orange",
              borderRadius: 12,
            }}
          ></Animated.View>
        </KeyboardStickyView>
      </Pressable>
    </Animated.View>
  );
}
