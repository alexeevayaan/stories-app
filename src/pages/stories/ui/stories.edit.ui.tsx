import { Keyboard, Pressable, StyleSheet } from "react-native";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";

interface IProps {
  focusedId: SharedValue<string>;
}

export default function StoriesEdit(props: IProps) {
  const { focusedId } = props;

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
          backgroundColor: "green",
        },
        style,
      ]}
    >
      <Pressable
        style={StyleSheet.absoluteFillObject}
        onPress={() => {
          Keyboard.dismiss();
        }}
      />
    </Animated.View>
  );
}
