import { useEffect, useRef } from "react";
import { DeviceEventEmitter, type FlatList } from "react-native";

type UseScrollToTopProps = {
  event: string;
  onRefetch?: () => void;
};

export const useScrollToTop = <T>({
  event,
  onRefetch,
}: UseScrollToTopProps) => {
  const flatListRef = useRef<FlatList<T>>(null);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(event, () => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      console.log(event);
      onRefetch?.();
    });

    return () => subscription.remove();
  }, [event, onRefetch]);

  return flatListRef;
};
