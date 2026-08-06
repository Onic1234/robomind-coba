import React, { Suspense } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Rect } from 'react-native-svg';

// Load model from public/ folder (served statically, not bundled by Metro)
const MODEL_URL = '/models/robomind.glb';

// 3D Robot Model Component
function RobotModel() {
  const { scene } = useGLTF(MODEL_URL);
  return (
    <primitive
      object={scene}
      scale={1.2}
      position={[0, -1.2, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#22D3EE" />
      <Text style={styles.loaderText}>Memuat Robot 3D...</Text>
    </View>
  );
}

export default function Robot3DModelView() {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <View style={styles.outerContainer}>
      {/* Rich gradient background */}
      <View style={styles.bgLayer}>
        <Svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <Defs>
            <LinearGradient id="bg3d" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#0F172A" />
              <Stop offset="50%" stopColor="#1E1B4B" />
              <Stop offset="100%" stopColor="#0C1222" />
            </LinearGradient>
            <RadialGradient id="glow3d" cx="50%" cy="45%" r="55%">
              <Stop offset="0%" stopColor="#22D3EE" stopOpacity="0.18" />
              <Stop offset="60%" stopColor="#0891B2" stopOpacity="0.06" />
              <Stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="purpleGlow3d" cx="80%" cy="20%" r="45%">
              <Stop offset="0%" stopColor="#A78BFA" stopOpacity="0.15" />
              <Stop offset="100%" stopColor="#1E1B4B" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#bg3d)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#glow3d)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#purpleGlow3d)" />
        </Svg>
      </View>

      {/* Floating accent orbs */}
      <View style={[styles.orb, { top: '10%', left: '12%', width: 6, height: 6, backgroundColor: '#22D3EE', opacity: 0.5 }]} />
      <View style={[styles.orb, { top: '15%', right: '15%', width: 4, height: 4, backgroundColor: '#A78BFA', opacity: 0.4 }]} />
      <View style={[styles.orb, { bottom: '20%', left: '8%', width: 5, height: 5, backgroundColor: '#F59E0B', opacity: 0.35 }]} />
      <View style={[styles.orb, { bottom: '15%', right: '12%', width: 6, height: 6, backgroundColor: '#22D3EE', opacity: 0.3 }]} />

      {/* 3D Canvas (Client Only) */}
      <View style={styles.canvasContainer}>
        {isMounted ? (
          <Suspense fallback={<LoadingFallback />}>
            <Canvas
              style={styles.canvas}
              camera={{ position: [0, 0.5, 4], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
            >
              {/* Lighting setup */}
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 8, 5]} intensity={1.5} color="#ffffff" castShadow />
              <directionalLight position={[-3, 4, -2]} intensity={0.4} color="#22D3EE" />
              <pointLight position={[0, -2, 3]} intensity={0.5} color="#A78BFA" />
              <pointLight position={[-4, 2, -4]} intensity={0.3} color="#F59E0B" />

              {/* 3D Robot Model */}
              <RobotModel />

              {/* Interactive orbit controls */}
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate={true}
                autoRotateSpeed={1.5}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 1.8}
              />
            </Canvas>
          </Suspense>
        ) : (
          <LoadingFallback />
        )}
      </View>

      {/* Bottom hint text */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>👆 Geser untuk memutar robot</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(34, 211, 238, 0.2)',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    zIndex: 1,
    shadowColor: '#22D3EE',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  canvasContainer: {
    width: '100%',
    height: 340,
    zIndex: 2,
  },
  canvas: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loaderText: {
    color: '#94A3B8',
    marginTop: 10,
    fontSize: 13,
    fontWeight: '500',
  },
  hintContainer: {
    paddingBottom: 14,
    paddingTop: 2,
    zIndex: 3,
  },
  hintText: {
    color: 'rgba(148, 163, 184, 0.6)',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});
