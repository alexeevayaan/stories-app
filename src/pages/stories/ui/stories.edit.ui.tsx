import { RefObject } from "react";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
} from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IImperativeItemHandlers } from "./stories.item.ui";

interface IProps {
  focusedId: SharedValue<string>;
  refs: RefObject<Map<string, IImperativeItemHandlers>>;
}

export default function StoriesEdit(props: IProps) {
  const { focusedId, refs } = props;

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
          >
            <Pressable
              onPress={() => {
                "worklet";

                const itemRef = refs.current.get(focusedId.value);
                itemRef?.setColor("#424242");
              }}
            >
              <Text>red</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                "worklet";

                const itemRef = refs.current.get(focusedId.value);
                itemRef?.setColor("#848812");
              }}
            >
              <Text>blue</Text>
            </Pressable>
          </Animated.View>
        </KeyboardStickyView>
      </Pressable>
    </Animated.View>
  );
}
