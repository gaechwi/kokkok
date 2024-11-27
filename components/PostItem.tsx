import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import Carousel from "./Carousel";
import { diffDate } from "./FormatDate";
import HeartIcon from "../assets/icons/heart.svg";
import CommentIcon from "../assets/icons/comment.svg";
import { useState } from "react";

interface PostItemProps {
	author: {
		name: string;
		avatar: string;
	};
	images: string[];
	content?: string;
	likes: number;
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
	likes = 0,
	createdAt,
	commentsCount = 0,
	comment,
}: PostItemProps) {
	const diff = diffDate(new Date(createdAt));
	const [isLiked, setIsLiked] = useState(true);
	const [isMore, setIsMore] = useState(false);

	const screenWidth = Dimensions.get("window").width;

	// 화면 너비에 따라 대략적인 글자 수 계산 (한 줄당 약 35-40자 기준)
	const charsPerLine = Math.floor(screenWidth / 11);
	const maxChars = charsPerLine * 2; // 2줄

	const truncateText = (text: string) => {
		if (!text || text.length <= maxChars) return text;

		// maxChars 위치까지의 텍스트를 자름
		let truncated = text.slice(0, maxChars);

		// 마지막 문장이 끝나는 위치 찾기 (마침표, 느낌표, 물음표 등 연속된 경우 포함)
		const lastSentence = truncated.match(/[^.!?]*[.!?]+/g);
		if (lastSentence && lastSentence.length > 0) {
			// 마지막 문장의 끝부분을 찾아서 자르기
			const lastIndex = truncated.lastIndexOf(
				lastSentence[lastSentence.length - 1],
			);
			truncated = truncated.slice(0, lastIndex + 1);
		} else {
			// 문장 끝을 찾지 못한 경우, 마지막 공백에서 자르기
			const lastSpace = truncated.lastIndexOf(" ");
			if (lastSpace > 0) {
				truncated = truncated.slice(0, lastSpace);
			}
			// 공백이 없는 경우 maxChars 위치에서 자르기
			else {
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
						<Text className="font-medium text-gray-900 text-sm">
							{author.name}
						</Text>
					</View>
				</TouchableOpacity>

				<TouchableOpacity>
					<Text className="font-black text-base text-gray-500">···</Text>
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
						<HeartIcon
							width={24}
							height={24}
							color={isLiked ? "#FF5757" : "#828282"}
							fill={isLiked ? "#FF5757" : "transparent"}
						/>
					</TouchableOpacity>
					<TouchableOpacity className="flex-row items-center gap-[2px]">
						<CommentIcon width={24} height={24} />
						{commentsCount > 0 && (
							<Text className="text-gray-500 text-sm">{commentsCount}</Text>
						)}
					</TouchableOpacity>
				</View>

				<Text className="text-gray-500 text-sm">{diff}</Text>
			</View>

			{/* content */}
			{content && (
				<View className="bg-white px-4 pb-4">
					<View className="flex-row flex-wrap">
						<Text className="flex-row items-center justify-center font-normal text-[15px] text-gray-90 leading-[24px] ">
							{isMore ? content : truncateText(content)}
							{content.length > maxChars && <Text>{!isMore && "..."}</Text>}
							{content.length > maxChars && (
								<TouchableOpacity
									onPress={() => setIsMore(!isMore)}
									className="flex-row items-end"
								>
									<Text className="text-gray-45 leading-[15px]">
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
						<Text className="font-bold text-base text-gray-70">
							{comment.author.name}
						</Text>
						<Text className="text-base text-gray-90">{comment.content}</Text>
					</View>
				</View>
			)}
		</View>
	);
}
