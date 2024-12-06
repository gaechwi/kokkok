import colors from "@/constants/colors";
import { allAlertAtom } from "@/contexts/alert";
import { useAtom } from "jotai";
import Toggle from "react-native-toggle-element";

interface AlertToggleProps {
  toggleValue?: boolean;
  setToggleValue?: (value: boolean) => void;
  useAllAlert?: boolean;
}

export default function AlertToggle({
  toggleValue,
  setToggleValue,
  useAllAlert = false,
}: AlertToggleProps) {
  const [allEnabled, setAllEnabled] = useAtom(allAlertAtom);

  const handleToggle = (value: boolean) => {
    if (useAllAlert) {
      setAllEnabled(value);
    } else if (setToggleValue) {
      setToggleValue(value);
    }
  };

  return (
    <Toggle
      value={useAllAlert ? allEnabled : toggleValue}
      onPress={handleToggle}
      trackBar={{
        inActiveBackgroundColor: "#d9d9d9",
        activeBackgroundColor: "#d9d9d9",
        borderWidth: 0,
        width: 45,
        height: 22,
      }}
      thumbButton={{
        width: 22,
        height: 22,
        inActiveBackgroundColor: colors.gray[45],
        activeBackgroundColor: colors.primary,
      }}
      containerStyle={{
        alignItems: "center",
        justifyContent: "center",
      }}
    />
  );
}
