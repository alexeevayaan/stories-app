import { RefObject, useLayoutEffect } from "react";
import { type TextInput, TextInputContentSizeChangeEvent } from "react-native";
import { useSharedValue } from "react-native-reanimated";

export interface ILayout {
  width: number;
  height: number;
}

type TPropsUseLayout = {
  inputRef: RefObject<TextInput | null>;
};

export const useLayout = (props: TPropsUseLayout) => {
  const layout = useSharedValue<ILayout>({
    width: 0,
    height: 0,
  });
  const { inputRef } = props;

  useLayoutEffect(() => {
    inputRef.current?.measure((_, __, w, h) => {
      layout.value.width = w;
      layout.value.height = h;
    });
  }, []);

  const onContentSizeChange = (e: TextInputContentSizeChangeEvent) => {
    layout.value = {
      width: e.nativeEvent.contentSize.width,
      height: e.nativeEvent.contentSize.height,
    };
  };

  return { layout, onContentSizeChange };
};
