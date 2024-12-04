import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";

// 네트워크 상태변화 감지
export function useAppState() {
  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected);
    });
  });
}
