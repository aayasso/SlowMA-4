declare module "react-native-config" {
	interface AppConfig {
		GOOGLE_VISION_KEY: string;
		MICROSOFT_VISION_KEY: string;
		MICROSOFT_VISION_ENDPOINT: string;
		OPENAI_API_KEY: string;
		HARVARD_ART_MUSEUMS_API_KEY: string;
		[key: string]: string | undefined;
	}
	const Config: AppConfig;
	export default Config;
}


