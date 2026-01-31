import { PropsWithChildren, useLayoutEffect, useRef } from "react";
import { View } from "react-native";
import { SharedValue } from "react-native-reanimated";

const StoriesLayout = (
  props: PropsWithChildren<{
    layout: SharedValue<{ width: number; height: number }>;
  }>,
) => {
  const { children, layout } = props;

  const ref = useRef<View>(null);

  useLayoutEffect(() => {
    ref.current?.measure((_, __, w, h) => {
      layout.value = {
        width: w,
        height: h,
      };
    });
  }, []);

  return (
    <View className={"pt-safe flex-1 bg-black"}>
      <View
        ref={ref}
        className={
          "aspect-9/16 w-full rounded-2xl overflow-hidden bg-[#323239]"
        }
      >
        {children}
      </View>
    </View>
  );
};

export default StoriesLayout;
