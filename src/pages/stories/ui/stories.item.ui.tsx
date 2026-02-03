import { RefObject, useImperativeHandle, useRef, useState } from "react";
import { StyleSheet, TextInput, TextLayoutLine } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { resetStyles } from "../config";
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
  const inputRef = useRef<TextInput>(null);

  const layout = useLayout({ inputRef });

  const transform = useTransform({
    layout: layout.layout,
    wrapperLayout: props.wrapperLayout,
  });

  const composed = useGesture({ transform, inputRef });

  const [text, setText] = useState(" ");
  const [lines, setLines] = useState<TextLayoutLine[]>([]);

  const colorUi = useSharedValue<string>("#FFFFFF");
  const backgroundColorUi = useSharedValue<string>("rgba(1,1,1,0)");

  useImperativeHandle(ref, () => {
    return {
      setColor(c) {
        "worklet";
        colorUi.value = withTimingAnimation<string>(c);
      },
      setBackgroundColor(c) {
        "worklet";
        backgroundColorUi.value = withTimingAnimation<string>(c);
      },
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      color: colorUi.value,
    };
  });

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={transform.animatedStyles}>
        <Animated.View>
          <SkiaBackground
            lines={lines}
            textIsEmpty={!text || text?.length === 0}
            backgroundColor={backgroundColorUi}
          />
          <AnimatedTextInput
            cursorColor={"white"}
            selectionColor={"white"}
            autoFocus
            pointerEvents={"none"}
            value={text}
            onChangeText={(text) => {
              setText(text.trimStart());
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
            style={{
              textAlign: "center",
              textAlignVertical: "center",
              fontSize: 32,
              color: "rgba(1,1,1,0)",
              opacity: 1,

              ...resetStyles.reset,
            }}
            selectTextOnFocus={false}
          />
          <Animated.Text
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
            pointerEvents="none"
            onTextLayout={(e) => {
              setLines(e.nativeEvent.lines);
            }}
            style={[
              {
                textAlign: "center",
                textAlignVertical: "center",
                fontSize: 32,
                ...resetStyles.reset,
                ...StyleSheet.absoluteFillObject,
              },
              animatedTextStyle,
            ]}
          >
            {text}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}
