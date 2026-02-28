import { fonts } from "@/src/shared/assets/fonts/fonts";
import { FC, RefObject, useState } from "react";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
} from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import Animated, {
  Easing,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IImperativeItemHandlers } from "./stories.item.ui";

type TSelectedItem = "font" | "color" | "textAlign";

interface IProps {
  focusedId: SharedValue<string>;
  refs: RefObject<Map<string, IImperativeItemHandlers>>;
}

export default function StoriesEdit(props: IProps) {
  const { focusedId, refs } = props;

  const [selected, setSelected] = useState<TSelectedItem>("font");

  const { width, height } = useWindowDimensions();

  const wrapperWidth = width - 44;

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
        onPress={() => {}}
      >
        <KeyboardStickyView offset={offset}>
          <Animated.View
            style={{
              width: wrapperWidth,
              height: 44,
              backgroundColor: "#313131",
              borderRadius: 12,
              flexDirection: "row",
              gap: 8,
              overflow: "hidden",
            }}
          >
            <BackgroundSoup type={selected} width={wrapperWidth / 3} />
            <Animated.View style={styles.btnWrapper}>
              <Pressable
                style={styles.btn}
                onPress={() => {
                  setSelected("font");
                  Keyboard.dismiss();
                }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    color: "white",
                    fontFamily: fonts.PacificoRegular,
                  }}
                >
                  Aa
                </Text>
              </Pressable>
            </Animated.View>
            <Animated.View style={styles.btnWrapper}>
              <Pressable
                style={styles.btn}
                onPress={() => {
                  setSelected("color");
                }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    color: "white",
                    fontFamily: fonts.PacificoRegular,
                  }}
                >
                  Aa
                </Text>
              </Pressable>
            </Animated.View>
            <Animated.View style={styles.btnWrapper}>
              <Pressable
                style={styles.btn}
                onPress={() => {
                  setSelected("textAlign");
                }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    color: "white",
                    fontFamily: fonts.PacificoRegular,
                  }}
                >
                  Aa
                </Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
        </KeyboardStickyView>
      </Pressable>
    </Animated.View>
  );
}

interface IBackgroundSoup {
  width: number;
  type: TSelectedItem;
}
const BackgroundSoup: FC<IBackgroundSoup> = ({ width, type }) => {
  const translateX = useDerivedValue(() => {
    switch (type) {
      case "font":
        return 0;
      case "color":
        return width;
      default:
        return width * 2;
    }
  }, [type, width]);

  const style = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withTiming(translateX.value, {
            duration: 250,
            easing: Easing.linear,
          }),
        },
      ],
    };
  }, []);

  return (
    <Animated.View
      style={[
        {
          ...backgroundSoupStyles.wrapper,
          width: width,
        },
        style,
      ]}
    >
      <Animated.View style={backgroundSoupStyles.item} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  btnWrapper: {
    flex: 1,
  },
  btn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

const backgroundSoupStyles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    padding: 4,
  },
  item: {
    flex: 1,
    backgroundColor: "#414141",
    borderRadius: 8,
  },
});
