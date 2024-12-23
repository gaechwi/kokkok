import { FloatingText, FloatingView } from "@/components/Floating";
import PageIndicator from "@/components/PageIndicator";
import images from "@/constants/images";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "slide1",
    imageSource: images.OnBoarding1,
    component: <Slide1 />,
    buttonText: "응! 같이하자",
  },
  { id: "slide2", imageSource: images.OnBoarding2, component: <Slide2 /> },
  { id: "slide3", imageSource: images.OnBoarding3, component: <Slide3 /> },
  {
    id: "slide4",
    imageSource: images.OnBoarding4,
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
      router.replace("/home");
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
            <ImageBackground
              className="relative flex-1 items-center"
              style={{ width }}
              source={item.imageSource}
            >
              {React.cloneElement(item.component, {
                isActive: index === currentIndex,
              })}
            </ImageBackground>
          )}
        />

        <View className="absolute bottom-[40px] w-full items-center">
          <PageIndicator total={slides.length} current={currentIndex} />

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
  return (
    <>
      <FloatingText
        className="absolute top-[177px] font-pbold text-[40px] text-gray-90"
        duration={1000}
        isActive={isActive}
      >
        같이 운동하실래요?
      </FloatingText>
      <FloatingText
        className="absolute bottom-[186px] font-psemibold text-[17px] text-gray-50"
        duration={1800}
        isActive={isActive}
      >
        콕콕의 사용법에 대해 알아봐요
      </FloatingText>
    </>
  );
}

function Slide2({ isActive = false }: SlideProps) {
  return (
    <View className="absolute top-[130px] items-center gap-[6px]">
      <FloatingText
        className="font-pbold text-[40px] text-gray-90"
        duration={1000}
        isActive={isActive}
      >
        운동이 끝나면
      </FloatingText>
      <FloatingText
        className="font-pbold text-[40px] text-gray-90"
        duration={1800}
        isActive={isActive}
      >
        사진으로 인증해요
      </FloatingText>
    </View>
  );
}

function Slide3({ isActive = false }: SlideProps) {
  return (
    <>
      <View
        className="absolute top-[130px] right-[80px]"
        style={{ transform: [{ rotate: "8.5deg" }] }}
      >
        <FloatingText
          className="font-pjalnan text-[110px] text-primary"
          duration={1000}
          isActive={isActive}
        >
          콕!
        </FloatingText>
      </View>
      <FloatingView
        className="absolute bottom-[204px] items-center gap-[6px]"
        duration={1800}
        isActive={isActive}
      >
        <Text className="font-pbold text-[40px] text-gray-90">운동 안 한</Text>
        <Text className="font-pbold text-[40px] text-gray-90">
          친구를 찔러요
        </Text>
      </FloatingView>
    </>
  );
}

function Slide4({ isActive = false }: SlideProps) {
  return (
    <>
      <FloatingView
        className="absolute top-[95px] left-[60px] gap-[6px]"
        duration={1000}
        isActive={isActive}
      >
        <Text className="font-pbold text-[40px] text-gray-90">
          귀여운 이모지로
        </Text>
        <Text className="ml-[30px] font-pbold text-[40px] text-gray-90">
          한눈에
        </Text>
      </FloatingView>
      <FloatingView
        className="absolute right-[60px] bottom-[187px] items-end gap-[6px]"
        duration={1800}
        isActive={isActive}
      >
        <Text className="font-pbold text-[40px] text-gray-90 ">내 기록을</Text>
        <Text className="mr-[30px] font-pbold text-[40px] text-gray-90">
          확인해요
        </Text>
      </FloatingView>
    </>
  );
}
