import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import images from "@/constants/images";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "slide1",
    component: <Slide1 />,
    buttonText: "응! 같이하자",
  },
  { id: "slide2", component: <Slide2 /> },
  { id: "slide3", component: <Slide3 /> },
  {
    id: "slide4",
    component: <Slide4 />,
    buttonText: "시작하기!",
  },
];

export default function Onboarding() {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex((prev) => prev + 1);
    } else {
      console.log("온보딩 완료");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="relative flex-1">
        <FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={{ width }}>
              {React.cloneElement(item.component, {
                isActive: index === currentIndex,
              })}
            </View>
          )}
        />

        <View className="absolute bottom-[40px] w-full items-center">
          <View className="flex-row justify-center">
            {slides.map((slide, index) => (
              <Dot key={slide.id} isActive={index === currentIndex} />
            ))}
          </View>

          <TouchableOpacity
            className="mx-[24px] mt-[32px] w-full max-w-[328px] items-center rounded-[10px] bg-primary py-[16px] text-white"
            onPress={handleNext}
          >
            <Text className="heading-2 text-white">
              {slides[currentIndex].buttonText ?? "다음"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

interface SlideProps {
  isActive?: boolean;
}

function Slide1({ isActive = false }: SlideProps) {
  const text1Offset = useSharedValue(30);
  const text2Offset = useSharedValue(30);
  const opacity1 = useSharedValue(0);
  const opacity2 = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      text1Offset.value = withTiming(0, {
        duration: 1000,
      });
      text2Offset.value = withTiming(0, {
        duration: 1800,
      });
      opacity1.value = withTiming(1, {
        duration: 1000,
      });
      opacity2.value = withTiming(1, {
        duration: 1800,
      });
    }
  }, [isActive, text1Offset, text2Offset, opacity1, opacity2]);

  const text1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: text1Offset.value }],
    opacity: opacity1.value,
  }));

  const text2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: text2Offset.value }],
    opacity: opacity2.value,
  }));

  return (
    <ImageBackground
      source={images.OnBoarding1}
      className="relative flex-1 items-center bg-yellow-100"
    >
      <Animated.Text
        style={text1Style}
        className="absolute top-[177px] font-pbold text-[40px] text-gray-90"
      >
        같이 운동하실래요?
      </Animated.Text>
      <Animated.Text
        style={text2Style}
        className="absolute bottom-[186px] font-psemibold text-[17px] text-gray-50"
      >
        콕콕의 사용법에 대해 알아봐요
      </Animated.Text>
    </ImageBackground>
  );
}

function Slide2({ isActive = false }: SlideProps) {
  const text1Offset = useSharedValue(30);
  const text2Offset = useSharedValue(30);
  const opacity1 = useSharedValue(0);
  const opacity2 = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      text1Offset.value = withTiming(0, { duration: 1000 });
      opacity1.value = withTiming(1, { duration: 1000 });
      text2Offset.value = withTiming(0, { duration: 1800 });
      opacity2.value = withTiming(1, { duration: 1800 });
    }
  }, [isActive, text1Offset, text2Offset, opacity1, opacity2]);

  const text1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: text1Offset.value }],
    opacity: opacity1.value,
  }));

  const text2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: text2Offset.value }],
    opacity: opacity2.value,
  }));

  return (
    <ImageBackground
      source={images.OnBoarding2}
      className="relative flex-1 items-center"
    >
      <View className="absolute top-[130px] items-center gap-[6px]">
        <Animated.Text
          style={text1Style}
          className="font-pbold text-[40px] text-gray-90"
        >
          운동이 끝나면
        </Animated.Text>
        <Animated.Text
          style={text2Style}
          className="font-pbold text-[40px] text-gray-90"
        >
          사진으로 인증해요
        </Animated.Text>
      </View>
    </ImageBackground>
  );
}

function Slide3({ isActive = false }: SlideProps) {
  const text1Offset = useSharedValue(30);
  const text2Offset = useSharedValue(30);
  const opacity1 = useSharedValue(0);
  const opacity2 = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      text1Offset.value = withTiming(0, { duration: 1000 });
      opacity1.value = withTiming(1, { duration: 1000 });
      text2Offset.value = withTiming(0, { duration: 1800 });
      opacity2.value = withTiming(1, { duration: 1800 });
    }
  }, [isActive, text1Offset, text2Offset, opacity1, opacity2]);

  const text1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: text1Offset.value }],
    opacity: opacity1.value,
  }));

  const text2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: text2Offset.value }],
    opacity: opacity2.value,
  }));

  return (
    <ImageBackground
      source={images.OnBoarding3}
      className="relative flex-1 items-center"
    >
      <Animated.View
        style={text1Style}
        className="absolute top-[89px] right-[59px] rotate-[8.5deg]"
      >
        <Text className="text-[110px] text-primary">콕!</Text>
      </Animated.View>
      <Animated.View
        style={text2Style}
        className="absolute bottom-[204px] items-center gap-[6px]"
      >
        <Text className="font-pbold text-[40px] text-gray-90">운동 안 한</Text>
        <Text className="font-pbold text-[40px] text-gray-90">
          친구를 찔러요
        </Text>
      </Animated.View>
    </ImageBackground>
  );
}

function Slide4({ isActive = false }: SlideProps) {
  const text1Offset = useSharedValue(30);
  const text2Offset = useSharedValue(30);
  const opacity1 = useSharedValue(0);
  const opacity2 = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      text1Offset.value = withTiming(0, { duration: 1000 });
      opacity1.value = withTiming(1, { duration: 1000 });
      text2Offset.value = withTiming(0, { duration: 1800 });
      opacity2.value = withTiming(1, { duration: 1800 });
    }
  }, [isActive, text1Offset, text2Offset, opacity1, opacity2]);

  const text1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: text1Offset.value }],
    opacity: opacity1.value,
  }));

  const text2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: text2Offset.value }],
    opacity: opacity2.value,
  }));

  return (
    <ImageBackground source={images.OnBoarding4} className="relative flex-1">
      <Animated.View
        style={text1Style}
        className="absolute top-[95px] left-[60px] gap-[6px]"
      >
        <Text className="font-pbold text-[40px] text-gray-90">
          귀여운 이모지로
        </Text>
        <Text className="ml-[30px] font-pbold text-[40px] text-gray-90">
          한눈에
        </Text>
      </Animated.View>
      <Animated.View
        style={text2Style}
        className="absolute right-[60px] bottom-[187px] items-end gap-[6px]"
      >
        <Text className="font-pbold text-[40px] text-gray-90 ">내 기록을</Text>
        <Text className="mr-[30px] font-pbold text-[40px] text-gray-90">
          확인해요
        </Text>
      </Animated.View>
    </ImageBackground>
  );
}

interface DotProps {
  isActive: boolean;
  activeWidth?: number;
  inactiveWidth?: number;
  height?: number;
  activeColor?: string;
  inactiveColor?: string;
}

const COLORS = {
  ACTIVE: "#8356F5",
  INACTIVE: "#BEBEBE",
};

const Dot = ({
  isActive,
  activeWidth = 24,
  inactiveWidth = 8,
  height = 8,
  activeColor = COLORS.ACTIVE,
  inactiveColor = COLORS.INACTIVE,
}: DotProps) => {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(isActive ? activeWidth : inactiveWidth, {
      duration: 400,
      easing: Easing.out(Easing.quad),
    }),
    height,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: isActive ? activeColor : inactiveColor,
  }));

  return <Animated.View style={animatedStyle} />;
};
