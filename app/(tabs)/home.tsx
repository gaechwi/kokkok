import { SafeAreaView, ScrollView } from "react-native";
import PostItem from "../../components/PostItem";

const AVATAR_URL =
	"https://zrkselfyyqkkqcmxhjlt.supabase.co/storage/v1/object/public/images/1730962073092-thumbnail.webp";

const IMAGE_URL = [
	"https://zrkselfyyqkkqcmxhjlt.supabase.co/storage/v1/object/public/images/1731427831515-thumbnail.webp",
	"https://zrkselfyyqkkqcmxhjlt.supabase.co/storage/v1/object/public/images/1731430113912-image.webp",
	"https://zrkselfyyqkkqcmxhjlt.supabase.co/storage/v1/object/public/images/1731865249691-thumbnail.webp",
	"https://zrkselfyyqkkqcmxhjlt.supabase.co/storage/v1/object/public/images/1731221973228-thumbnail.webp",
	"https://zrkselfyyqkkqcmxhjlt.supabase.co/storage/v1/object/public/images/1731217925741-image.webp",
];

export default function Home() {
	return (
		<SafeAreaView className="flex-1 items-center justify-center bg-white">
			<ScrollView className="w-full grow">
				<PostItem
					author={{
						name: "John Doe",
						avatar: AVATAR_URL,
					}}
					images={IMAGE_URL}
					content="이건 테스트 내용입니다. 이건 테스트 내용입니다. 이건 테스트 내용입니다. 이건 테스트 내용입니다. 이건 테스트 내용입니다. 이건 테스트 내용입니다. 이건 테스트 내용입니다. 이건"
					likes={10}
					createdAt="2024-11-26"
					commentsCount={10}
					comment={{
						author: {
							name: "John Doe",
							avatar: AVATAR_URL,
						},
						content: "이건 테스트 내용입니다.",
					}}
				/>
				<PostItem
					author={{
						name: "John Doe",
						avatar: AVATAR_URL,
					}}
					images={IMAGE_URL}
					likes={10}
					createdAt="2021-01-01"
					commentsCount={10}
				/>
				<PostItem
					author={{
						name: "John Doe",
						avatar: AVATAR_URL,
					}}
					images={IMAGE_URL}
					content="이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건이건"
					likes={10}
					createdAt="2024-01-01"
					commentsCount={10}
				/>
			</ScrollView>
		</SafeAreaView>
	);
}
