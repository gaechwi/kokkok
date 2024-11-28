import {
	View,
	Text,
	Image,
	TouchableOpacity,
	Dimensions,
	PixelRatio,
} from "react-native";
import Carousel from "./Carousel";
import { diffDate } from "./FormatDate";
import { useState } from "react";
import icons from "../constants/icons";
interface PostItemProps {
	author: {
		name: string;
		avatar: string;
	};
	images: string[];
	content?: string;
	liked: boolean;
	likedAuthorAvatar?: string[];
	createdAt: string;
	commentsCount?: number;
	comment?: {
		author: {
			name: string;
			avatar: string;
		};
		content: string;
	};
}

export default function PostItem({
	author,
	images,
	content,
	liked,
	likedAuthorAvatar,
	createdAt,
	commentsCount = 0,
	comment,
}: PostItemProps) {
	const diff = diffDate(new Date(createdAt));
	const [isLiked, setIsLiked] = useState(liked);
	const [isMore, setIsMore] = useState(false);

	const screenWidth = Dimensions.get("window").width;

	const calculateMaxChars = () => {
		const fontScale = PixelRatio.getFontScale();
		const baseCharsPerLine = Math.floor(screenWidth / (11 * fontScale));
		return baseCharsPerLine * 2;
	};

	const maxChars = calculateMaxChars();

	const truncateText = (text: string) => {
		if (!text || text.length <= maxChars) return text;

		let truncated = text.slice(0, maxChars);

		const lastSentence = truncated.match(/[^.!?]*[.!?]+/g);
		if (lastSentence && lastSentence.length > 0) {
			const lastIndex = truncated.lastIndexOf(
				lastSentence[lastSentence.length - 1],
			);
			truncated = truncated.slice(0, lastIndex + 1);
		} else {
			const lastSpace = truncated.lastIndexOf(" ");
			if (lastSpace > 0) {
				truncated = truncated.slice(0, lastSpace);
			} else {
				truncated = text.slice(0, maxChars);
			}
		}

		return truncated;
	};

	return (
		<View className="grow bg-gray-10 pb-[10px]">
			{/* header */}
			<View className="flex-row items-center justify-between bg-white px-4">
				<TouchableOpacity>
					<View className="h-14 flex-row items-center gap-4">
						<Image
							source={{ uri: author.avatar }}
							resizeMode="cover"
							className="size-8 rounded-full"
						/>
						<Text className="body-3 text-gray-80">{author.name}</Text>
					</View>
				</TouchableOpacity>

				<TouchableOpacity>
					<icons.MeatballIcon width={24} height={24} color="#5D5D5D" />
				</TouchableOpacity>
			</View>

			{/* carousel */}
			<View className="h-max w-full bg-white">
				<Carousel images={images} />
			</View>

			{/* relation */}
			<View className="flex-row items-center justify-between bg-white px-4 pb-4">
				<View className="flex-row items-center gap-2">
					<TouchableOpacity onPress={() => setIsLiked(!isLiked)}>
						<icons.HeartIcon
							width={24}
							height={24}
							color={isLiked ? "#FF5757" : "#333333"}
							fill={isLiked ? "#FF5757" : "transparent"}
						/>
					</TouchableOpacity>
					{likedAuthorAvatar && likedAuthorAvatar.length > 0 && (
						<TouchableOpacity className="flex-row items-center">
							{likedAuthorAvatar.slice(0, 2).map((avatar, index) => (
								<Image
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									key={`avatar-${index}`}
									source={{ uri: avatar }}
									resizeMode="cover"
									className="-ml-[5px] size-[18px] rounded-full"
									style={{
										zIndex: 5 - index,
										borderWidth: 1,
										borderColor: "white",
									}}
								/>
							))}
							{likedAuthorAvatar.length > 2 && (
								<Text className="caption-1 text-gray-90">외 여러명</Text>
							)}
						</TouchableOpacity>
					)}
					<TouchableOpacity className="flex-row items-center gap-[2px]">
						<icons.CommentIcon width={24} height={24} />
						{commentsCount > 0 && (
							<Text className="caption-1 text-gray-90">{commentsCount}</Text>
						)}
					</TouchableOpacity>
				</View>

				<Text className="caption-3 text-gray-50">{diff}</Text>
			</View>

			{/* content */}
			{content && (
				<View className="bg-white px-4 pb-4">
					<View className="flex-row flex-wrap">
						<Text className="body-2 text-gray-90">
							{isMore ? content : truncateText(content)}
							{content.length > maxChars && <Text>{!isMore && "..."}</Text>}
							{content.length > maxChars && (
								<TouchableOpacity
									onPress={() => setIsMore(!isMore)}
									className="flex-row items-start justify-center"
								>
									<Text className="h-[16px] text-gray-45 leading-[150%]">
										{isMore ? " 접기" : " 더보기"}
									</Text>
								</TouchableOpacity>
							)}
						</Text>
					</View>
				</View>
			)}

			{/* comments */}
			{comment && (
				<View className="bg-white px-4 pb-4">
					<View className="flex-row items-center gap-2">
						<Text className="text-nowrap font-pbold text-[15px] text-gray-70 leading-[150%]">
							{comment.author.name}
						</Text>
						<Text className="body-2 flex-1 text-gray-90" numberOfLines={1}>
							{comment.content}
						</Text>
					</View>
				</View>
			)}
		</View>
	);
}
