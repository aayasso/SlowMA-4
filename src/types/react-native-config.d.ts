declare module "react-native-config" {
	interface AppConfig {
		GOOGLE_VISION_KEY: string;
		[key: string]: string | undefined;
	}
	const Config: AppConfig;
	export default Config;
}


