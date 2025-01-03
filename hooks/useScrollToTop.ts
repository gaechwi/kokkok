import { useEffect } from "react";
import { DeviceEventEmitter, type FlatList } from "react-native";

const useScrollToTop = ({
  flatListRef,
  refetch,
  eventName,
}: {
  flatListRef: React.RefObject<FlatList>;
  refetch: () => void;
  eventName: string;
}) => {
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(eventName, () => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      refetch();
    });

    return () => subscription.remove();
  }, [flatListRef, refetch, eventName]);
};

export default useScrollToTop;
