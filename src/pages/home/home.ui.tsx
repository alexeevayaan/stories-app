import { useRef, useState } from "react";
import { Button, StyleSheet, View } from "react-native";
import type {
  EnrichedTextInputInstance,
  OnChangeStateEvent,
} from "react-native-enriched";
import { EnrichedTextInput } from "react-native-enriched";

export function HomeScreen() {
  const ref = useRef<EnrichedTextInputInstance>(null);

  const [stylesState, setStylesState] = useState<OnChangeStateEvent | null>();

  return (
    <View style={styles.container}>
      <EnrichedTextInput
        ref={ref}
        onChangeState={(e) => setStylesState(e.nativeEvent)}
        style={styles.input}
      />
      <Button
        title={stylesState?.isBold ? "Unbold" : "Bold"}
        color={stylesState?.isBold ? "green" : "gray"}
        onPress={() => ref.current?.toggleBold()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: "100%",
    fontSize: 20,
    padding: 10,
    maxHeight: 200,
    backgroundColor: "lightgray",
  },
});
