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
import { StoriesItemText } from "./stories.itemtext.ui";
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
  const textAlignUI = useSharedValue<"left" | "right" | "center">("center");

  const [lines, setLines] = useState<TextLayoutLine[]>([]);
  const linesUi = useSharedValue<TextLayoutLine[]>([]);

  const inputRef = useRef<TextInput>(null);

  const layout = useLayout({ inputRef });

  const transform = useTransform({
    layout: layout.layout,
    wrapperLayout: props.wrapperLayout,
  });

  const composed = useGesture({ transform, inputRef, lines: linesUi });

  const [text, setText] = useState("");

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
      textAlign: textAlignUI.value,
    };
  });

  const textRef = useRef<Text>(null);

  const { width } = useWindowDimensions();
  const wrapperWidth = width - 48;

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
              width: wrapperWidth,
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
              width: wrapperWidth,
            }}
          >
            <AnimatedTextInput
              maxFontSizeMultiplier={1.05}
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
                  maxWidth: wrapperWidth,
                },
                animatedTextFontStyle,
              ]}
              selectTextOnFocus={false}
            />
          </Animated.View>

          <Animated.Text
            ref={textRef}
            onTextLayout={(e) => {
              setLines(e.nativeEvent.lines);
              linesUi.value = e.nativeEvent.lines;
            }}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1.05}
            minimumFontScale={0.95}
            style={[
              {
                textAlignVertical: "center",
                ...resetStyles.reset,
                fontFamily:
                  storiesFontStyle.BitcountGridDoubleMedium.style.fontFamily,
                width: wrapperWidth,
                maxWidth: wrapperWidth,
                opacity: 0,
              },
              animatedTextStyle,
              animatedTextFontStyle,
            ]}
          >
            {text}
          </Animated.Text>
          <StoriesItemText lines={lines} layout={layout.layout} />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}
