/**
 * 날짜를 YYYY-MM-DD 형식의 문자열로 변환합니다
 * @param dateString - 변환할 날짜
 * @returns YYYY-MM-DD 형식의 날짜 문자열 (예: "2024-01-01")
 */
export const formatDate = (dateString: Date) => {
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

/**
 * 날짜를 한국어 형식으로 변환합니다
 * @param dateString - 변환할 날짜
 * @returns 한국어 형식의 날짜 문자열 (예: "2024년 1월 1일")
 */
export const formatKoreanDate = (dateString: Date) => {
	const date = new Date(dateString);
	return date.toLocaleDateString("ko-KR", {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "Asia/Seoul",
	});
};

/**
 * 현재 시간과 주어진 날짜 사이의 시간 차이를 계산합니다
 * @param dateString - 비교할 날짜
 * @returns 한국어로 표현된 시간 차이 문자열 (예: "3일 전", "2시간 전")
 *          7일 이상 차이나는 경우 한국어 날짜 형식으로 반환 (예: "2024년 1월 1일")
 */
export const diffDate = (dateString: Date) => {
	const date = new Date(dateString);
	const now = new Date();
	const diff = now.getTime() - date.getTime();

	const sec = Math.floor(diff / 1000);
	const min = Math.floor(sec / 60);
	const hour = Math.floor(min / 60);
	const day = Math.floor(hour / 24);
	const month = Math.floor(day / 30);
	const year = Math.floor(month / 12);

	if (year >= 1) {
		return `${year}년 전`;
	}
	if (month >= 1) {
		return `${month}달 전`;
	}
	if (day > 0) {
		return `${day}일 전`;
	}
	if (hour > 0) {
		return `${hour}시간 전`;
	}
	if (min > 0) {
		return `${min}분 전`;
	}
	return `${sec}초 전`;
};
