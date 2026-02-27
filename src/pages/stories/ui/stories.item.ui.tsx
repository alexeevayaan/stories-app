import { RefObject, useImperativeHandle, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextLayoutLine,
  useWindowDimensions,
} from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { resetStyles } from "../config";
import { storiesFontStyle } from "../config/font.style";
import { withTimingAnimation } from "../lib";
import { ILayout, useGesture, useLayout, useTransform } from "../usecase";
import { SkiaBackground } from "./stories.skia.background";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export interface IImperativeItemHandlers {
  setColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
}

interface IPropsItem {
  id: string;
  focusedId: SharedValue<string>;
  wrapperLayout: SharedValue<ILayout>;
  ref: RefObject<IImperativeItemHandlers>;
}

export function Item(props: IPropsItem) {
  const { focusedId, id, ref } = props;

  const [textAlign, setTextAlign] = useState<"left" | "right" | "center">(
    "center",
  );

  const inputRef = useRef<TextInput>(null);

  const layout = useLayout({ inputRef });

  const transform = useTransform({
    layout: layout.layout,
    wrapperLayout: props.wrapperLayout,
    textAlign: textAlign,
  });

  const composed = useGesture({ transform, inputRef });

  const [text, setText] = useState("hellotuf I wilhhh");
  const [lines, setLines] = useState<TextLayoutLine[]>([]);

  const colorUI = useSharedValue<string>("#FFFFFF");
  const backgroundColorUI = useSharedValue<string>("rgba(122,42,1,1)");
  const fontSize = useSharedValue<number>(32);

  useImperativeHandle(ref, () => {
    return {
      setColor(c) {
        "worklet";
        colorUI.value = withTimingAnimation<string>(c);
      },
      setBackgroundColor(c) {
        "worklet";
        backgroundColorUI.value = withTimingAnimation<string>(c);
      },
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      color: colorUI.value,
    };
  });

  const animatedTextFontStyle = useAnimatedStyle(() => {
    return {
      fontSize: fontSize.value,
      lineHeight: fontSize.value + 8,
    };
  });

  const textRef = useRef<Text>(null);

  const { width } = useWindowDimensions();
  const wrapperWidth = width - 48;

  const inputStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX:
            textAlign === "center"
              ? -(wrapperWidth - layout.layout.value.width) / 2
              : 0,
        },
      ],
    };
  }, [textAlign, wrapperWidth]);

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[transform.animatedStyles]}>
        <Animated.View
          pointerEvents={"none"}
          onLayout={(e) => {
            layout.onContentSizeChange({
              nativeEvent: {
                contentSize: {
                  width: e.nativeEvent.layout.width,
                  height: e.nativeEvent.layout.height,
                },
              },
            } as any);
          }}
          style={[
            {
              overflow: "visible",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              maxWidth: wrapperWidth,
            },
          ]}
        >
          <SkiaBackground
            lines={lines}
            textIsEmpty={!text || text?.length === 0}
            backgroundColor={backgroundColorUI}
          />
          <Animated.View
            style={{
              ...StyleSheet.absoluteFillObject,
              overflow: "hidden",
            }}
          >
            <AnimatedTextInput
              maxFontSizeMultiplier={1.1}
              cursorColor={"white"}
              selectionColor={"white"}
              autoFocus
              pointerEvents={"none"}
              value={text}
              onChangeText={(text) => {
                setText(text);
              }}
              ref={inputRef}
              multiline
              scrollEnabled={false}
              onFocus={() => {
                focusedId.value = id;
                transform.onFocus();
              }}
              onBlur={() => {
                focusedId.value = "";
                transform.onBlur();
              }}
              style={[
                {
                  textAlign: textAlign,
                  textAlignVertical: "center",
                  color: "rgba(1,1,1,0)",
                  ...resetStyles.reset,
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  fontFamily:
                    storiesFontStyle.BitcountGridDoubleMedium.style.fontFamily,
                  width: wrapperWidth,
                },
                animatedTextFontStyle,
                inputStyle,
              ]}
              selectTextOnFocus={false}
            />
          </Animated.View>

          <Animated.Text
            ref={textRef}
            onTextLayout={(e) => {
              setLines(e.nativeEvent.lines);
            }}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1.1}
            minimumFontScale={0.9}
            style={[
              {
                textAlign: textAlign,
                textAlignVertical: "center",
                ...resetStyles.reset,
                fontFamily:
                  storiesFontStyle.BitcountGridDoubleMedium.style.fontFamily,
              },
              animatedTextStyle,
              animatedTextFontStyle,
            ]}
          >
            {text}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}
