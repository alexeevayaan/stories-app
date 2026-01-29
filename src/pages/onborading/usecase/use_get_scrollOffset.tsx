import { useWindowDimensions, type FlatList } from "react-native";
import {
    clamp,
    useAnimatedRef,
    useDerivedValue,
    useScrollOffset,
} from "react-native-reanimated";

interface IUseGetScrollOffset {
  length: number;
}

export const useGetScrollOffset = (props: IUseGetScrollOffset) => {
  const { width } = useWindowDimensions();

  const scrollRef = useAnimatedRef<FlatList<any>>();

  const scrollOffset = useScrollOffset(scrollRef);

  const scrollOffsetValue = useDerivedValue(() => {
    return clamp(
      parseFloat((scrollOffset.value / width).toFixed(2)),
      0,
      props.length - 1,
    );
  });

  return {
    scrollOffsetValue,
    scrollRef,
  };
};
