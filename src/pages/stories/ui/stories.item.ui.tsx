import { useRef, useState } from "react";
import { StyleSheet, TextInput, TextLayoutLine, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { SharedValue } from "react-native-reanimated";
import { resetStyles } from "../config";
import { ILayout, useGesture, useLayout, useTransform } from "../usecase";
import { SkiaBackground } from "./stories.skia.background";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface IPropsItem {
  id: string;
  focusedId: SharedValue<string>;
  wrapperLayout: SharedValue<ILayout>;
}

export function Item(props: IPropsItem) {
  const { focusedId, id } = props;
  const inputRef = useRef<TextInput>(null);

  const layout = useLayout({ inputRef });

  const transform = useTransform({
    layout: layout.layout,
    wrapperLayout: props.wrapperLayout,
  });

  const composed = useGesture({ transform, inputRef });

  const [text, setText] = useState(" ");
  const [lines, setLines] = useState<TextLayoutLine[]>([]);

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={transform.animatedStyles}>
        <View>
          <SkiaBackground
            lines={lines}
            textIsEmpty={!text || text?.length === 0}
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
            // onContentSizeChange={layout.onContentSizeChange}
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
            style={{
              textAlign: "center",
              textAlignVertical: "center",
              fontSize: 32,
              color: "#000000",
              ...resetStyles.reset,
              ...StyleSheet.absoluteFillObject,
            }}
          >
            {text}
          </Animated.Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
