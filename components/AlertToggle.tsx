import colors from "@/constants/colors";
import Toggle from "react-native-toggle-element";

interface AlertToggleProps {
  toggleValue: boolean;
  setToggleValue?: (value: boolean) => void;
  isAll?: boolean;
  setAllValues?: (value: boolean) => void;
}

export default function AlertToggle({
  toggleValue,
  setToggleValue,
  isAll = false,
  setAllValues,
}: AlertToggleProps) {
  const handleToggle = (value: boolean) => {
    if (isAll && setAllValues) {
      setAllValues(value);
    } else {
      setToggleValue(value);
    }
  };

  return (
    <Toggle
      value={toggleValue}
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
      leftTitle={toggleValue ? "on" : ""}
      rightTitle={toggleValue ? "" : "off"}
      containerStyle={{
        alignItems: "center",
        justifyContent: "center",
      }}
    />
  );
}
