import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Platform, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { WebView } from "react-native-webview";

export default function Index() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") {
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === "NAVIGATE" && event.data.route) {
          router.push(event.data.route as any);
        }
      };

      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }
  }, [router]);

  if (Platform.OS !== "web") {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#050a16" />
        <WebView
          source={{ uri: "file:///android_asset/index.html" }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={["*"]}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data && data.type === "NAVIGATE" && data.route) {
                router.push(data.route);
              }
            } catch (e) {}
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.webContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#050a16" />
      <iframe
        ref={iframeRef}
        src="/app-home.html"
        style={styles.iframe as any}
        title="RoboMind Dashboard"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050a16",
  },
  webview: {
    flex: 1,
    backgroundColor: "#050a16",
  },
  webContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#050a16",
    overflow: "hidden",
  },
  iframe: {
    width: "100%",
    height: "100%",
    borderWidth: 0,
    backgroundColor: "#050a16",
  },
});
