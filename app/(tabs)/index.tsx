import React from "react";
import { StyleSheet, View, Platform, StatusBar } from "react-native";
import { WebView } from "react-native-webview";

export default function Index() {
  const webPortalUrl = "https://robomind-beta.vercel.app";

  if (Platform.OS === "web") {
    return (
      <View style={styles.webContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <iframe
          src={webPortalUrl}
          style={styles.iframe as any}
          title="RoboMind Web Portal"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <WebView
        source={{ uri: webPortalUrl }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  webview: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  webContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#0f172a",
  },
  iframe: {
    width: "100%",
    height: "100%",
    borderWidth: 0,
    backgroundColor: "#0f172a",
  },
});
