import { View, FlatList, Image, Dimensions } from "react-native";
import { useState, useCallback, useMemo } from "react";
import Animated, {
	useAnimatedStyle,
	withSpring,
} from "react-native-reanimated";

interface CarouselProps {
	images: string[];
}

type ViewToken = {
	item: string;
	key: string;
	index: number | null;
	isViewable: boolean;
};

const COLORS = {
	ACTIVE: "#8356F5",
	INACTIVE: "#BEBEBE",
};

interface DotProps {
	isActive: boolean;
	activeWidth?: number;
	inactiveWidth?: number;
	height?: number;
	activeColor?: string;
	inactiveColor?: string;
}

const Dot = ({
	isActive,
	activeWidth = 24,
	inactiveWidth = 8,
	height = 8,
	activeColor = COLORS.ACTIVE,
	inactiveColor = COLORS.INACTIVE,
}: DotProps) => {
	const animatedStyle = useAnimatedStyle(() => ({
		width: withSpring(isActive ? activeWidth : inactiveWidth),
		height,
		borderRadius: 4,
		marginHorizontal: 4,
		backgroundColor: isActive ? activeColor : inactiveColor,
	}));

	return <Animated.View style={animatedStyle} />;
};

export default function Carousel({ images }: CarouselProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const screenWidth = Dimensions.get("window").width;
	const imageHeight = screenWidth * (1 / 1); // n:n 비율 유지

	const onViewableItemsChanged = useCallback(
		({ viewableItems }: { viewableItems: ViewToken[] }) => {
			if (viewableItems.length > 0 && viewableItems[0].index !== null) {
				setActiveIndex(viewableItems[0].index);
			}
		},
		[],
	);

	const viewabilityConfig = useMemo(
		() => ({
			viewAreaCoveragePercentThreshold: 50,
		}),
		[],
	);

	return (
		<View>
			<FlatList
				data={images}
				keyExtractor={(index) => `carousel-image-${index}`}
				renderItem={({ item }) => (
					<View style={{ width: screenWidth, height: imageHeight }}>
						<Image
							source={{ uri: item }}
							style={{ width: "100%", height: "100%" }}
							resizeMode="cover"
							onError={(e) =>
								console.error("Image loading error:", e.nativeEvent.error)
							}
						/>
					</View>
				)}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				onViewableItemsChanged={onViewableItemsChanged}
				viewabilityConfig={viewabilityConfig}
				removeClippedSubviews={true}
				initialNumToRender={1}
				maxToRenderPerBatch={2}
				windowSize={3}
			/>

			<View className="flex-row justify-center py-[10px]">
				{images.map((image, index) => (
					<Dot key={`carousel-dot-${image}`} isActive={index === activeIndex} />
				))}
			</View>
		</View>
	);
}
