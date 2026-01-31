import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable } from "react-native";
import Animated from "react-native-reanimated";
import { useStories } from "../usecase";

interface IProps {
  create: ReturnType<typeof useStories>["create"];
}

export default function StoriesPanel(props: IProps) {
  return (
    <Animated.View className={"absolute mt-4 right-4 z-50"}>
      <Pressable
        className="p-1 bg-[#383636] rounded-4xl"
        onPress={() => {
          props.create("text");
        }}
      >
        <Ionicons name={"add"} size={32} color={"white"} />
      </Pressable>
    </Animated.View>
  );
}
