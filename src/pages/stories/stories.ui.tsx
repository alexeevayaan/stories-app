import { useRef } from "react";
import { View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { Item, StoriesEdit, StoriesLayout, StoriesPanel } from "./ui";
import { IImperativeItemHandlers } from "./ui/stories.item.ui";
import { ILayout, type IStory, useStories } from "./usecase";

export function StoriesScreen() {
  const wrapperLayout = useSharedValue<ILayout>({
    width: 0,
    height: 0,
  });

  const storiesServise = useStories();

  const focusedId = useSharedValue<string>("");

  const refs = useRef<Map<string, IImperativeItemHandlers>>(new Map());

  const renderItem = (i: IStory, index: number) => {
    return (
      <Item
        ref={
          ((ref: IImperativeItemHandlers) => {
            if (refs.current.get(i.id)) return;
            refs.current.set(i.id, ref);
          }) as any
        }
        key={i.id}
        id={i.id}
        focusedId={focusedId}
        wrapperLayout={wrapperLayout}
      />
    );
  };

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <StoriesLayout layout={wrapperLayout}>
        <StoriesPanel create={storiesServise.create} />
        {storiesServise.stories.map(renderItem)}
        <StoriesEdit focusedId={focusedId} refs={refs} />
      </StoriesLayout>
    </View>
  );
}
