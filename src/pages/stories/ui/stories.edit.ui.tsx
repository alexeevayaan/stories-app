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
const offset = { closed: 0, opened: -20 };
interface IProps {
  focusedId: SharedValue<string>;
}

export default function StoriesEdit(props: IProps) {
  const { focusedId } = props;
  const { width } = useWindowDimensions();

  const show = useDerivedValue(() => {
    return focusedId.value ? 1 : 0;
  }, [props.focusedId]);

  const style = useAnimatedStyle(() => ({
    opacity: withTiming(interpolate(show.value, [0, 1], [0, 0.4]), {
      duration: 150,
    }),
  }));

  return (
    <Animated.View
      style={[
        {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0, 0, 0, 0.70)",
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
