import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * Extend this function when going to production by
 * setting the baseUrl to your production API URL.
 */
export const getBaseUrl = () => {
  /**
   * Gets the IP address of your host-machine. If it cannot automatically find it,
   * you'll have to manually set it. NOTE: Port 3000 should work for most but confirm
   * you don't have anything else running on it, or you'd have to change it.
   *
   * **NOTE**: This is only for development. In production, you'll want to set the
   * baseUrl to your production API URL.
   */
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(":")[0];

  if (!localhost) {
    // return "https://turbo.t3.gg";
    throw new Error(
      "Failed to get localhost. Please point to your production server.",
    );
  }

  // Androidエミュレーターでは127.0.0.1/localhostがエミュレーター自身を指すため、
  // ホストPCを指す10.0.2.2に置き換える（Metroの8081はadb reverseで届くがAPIの3000は届かない）
  if (
    Platform.OS === "android" &&
    (localhost === "127.0.0.1" || localhost === "localhost")
  ) {
    return "http://10.0.2.2:3000";
  }

  return `http://${localhost}:3000`;
};
