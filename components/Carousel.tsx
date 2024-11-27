import { View, FlatList, Image, Dimensions } from "react-native";
import { useState, useCallback, useMemo } from "react";
import Animated, {
	useAnimatedStyle,
	withSpring,
} from "react-native-reanimated";

interface CarouselProps {
	images: string[]; // 캐러셀에 표시할 이미지 URL 배열
}

// 현재 보이는 아이템의 정보를 담는 타입
type ViewToken = {
	item: string;
	key: string;
	index: number | null;
	isViewable: boolean;
};

// 캐러셀 하단의 인디케이터 점을 표시하는 컴포넌트
const Dot = ({ isActive }: { isActive: boolean }) => {
	const animatedStyle = useAnimatedStyle(() => ({
		// 점의 너비가 부드럽게 변화하도록 애니메이션 적용
		width: withSpring(isActive ? 24 : 8),
		height: 8,
		borderRadius: 4,
		marginHorizontal: 4,
		backgroundColor: isActive ? "#8356F5" : "#BEBEBE",
	}));

	return <Animated.View style={animatedStyle} />;
};

export default function Carousel({ images }: CarouselProps) {
	// 현재 활성화된 이미지의 인덱스
	const [activeIndex, setActiveIndex] = useState(0);
	// 화면 너비에 맞춰 이미지 크기 계산
	const screenWidth = Dimensions.get("window").width;
	const imageHeight = screenWidth * (1 / 1); // 1:1 비율 유지

	// 현재 보이는 아이템이 변경될 때 호출되는 콜백
	const onViewableItemsChanged = useCallback(
		({ viewableItems }: { viewableItems: ViewToken[] }) => {
			if (viewableItems.length > 0 && viewableItems[0].index !== null) {
				setActiveIndex(viewableItems[0].index);
			}
		},
		[],
	);

	// 아이템이 얼마나 보여야 '보이는 상태'로 간주할지 설정
	const viewabilityConfig = useMemo(
		() => ({
			viewAreaCoveragePercentThreshold: 50, // 50% 이상 보일 때 viewable로 간주
		}),
		[],
	);

	return (
		<View>
			{/* 이미지를 가로로 스크롤 가능한 리스트로 표시 */}
			<FlatList
				data={images}
				renderItem={({ item }) => (
					<Image
						source={{ uri: item }}
						style={{
							width: screenWidth,
							height: imageHeight,
						}}
						resizeMode="cover"
					/>
				)}
				horizontal
				pagingEnabled // 한 페이지씩 스크롤되도록 설정
				showsHorizontalScrollIndicator={false}
				onViewableItemsChanged={onViewableItemsChanged}
				viewabilityConfig={viewabilityConfig}
			/>

			{/* 하단의 인디케이터 점들을 표시 */}
			<View className="flex-row justify-center py-[10px]">
				{images.map((image, index) => (
					<Dot key={`carousel-dot-${image}`} isActive={index === activeIndex} />
				))}
			</View>
		</View>
	);
}
