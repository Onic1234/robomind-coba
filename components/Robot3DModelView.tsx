import React, { Suspense } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, useAnimations } from '@react-three/drei';

// Available animations from Meshy AI Blue Eyed Robot
const ANIMATIONS = [
  { name: "Agree Gesture (Mengangguk)", url: "/models/Meshy_AI_Blue_Eyed_Robot_biped_Animation_Agree_Gesture_withSkin.glb" },
  { name: "Alert (Waspada)", url: "/models/Meshy_AI_Blue_Eyed_Robot_biped_Animation_Alert_withSkin.glb" },
  { name: "Running (Berlari)", url: "/models/Meshy_AI_Blue_Eyed_Robot_biped_Animation_Running_withSkin.glb" },
  { name: "Slow Walk (Jalan Lambat)", url: "/models/Meshy_AI_Blue_Eyed_Robot_biped_Animation_Slow_Orc_Walk_withSkin.glb" },
  { name: "Triple Combo (Menyerang)", url: "/models/Meshy_AI_Blue_Eyed_Robot_biped_Animation_Triple_Combo_Attack_withSkin.glb" },
  { name: "Walking (Berjalan)", url: "/models/Meshy_AI_Blue_Eyed_Robot_biped_Animation_Walking_withSkin.glb" }
];

// Preload all models to avoid stuttering on switch
ANIMATIONS.forEach((anim) => {
  useGLTF.preload(anim.url);
});

// 3D Robot Model Component
function RobotModel({ modelUrl, onRobotClick }: { modelUrl: string; onRobotClick: () => void }) {
  const { scene, animations } = useGLTF(modelUrl);
  const groupRef = React.useRef<any>();
  const { actions, names } = useAnimations(animations, groupRef);
  
  React.useMemo(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        if (child.material) {
          // If child has multiple materials or single material
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              mat.color.set('#ffffff');
              mat.roughness = 0.15;
              mat.metalness = 0.1;
            });
          } else {
            child.material.color.set('#ffffff');
            child.material.roughness = 0.15;
            child.material.metalness = 0.1;
          }
        }
      }
    });
  }, [scene, modelUrl]);

  // Play embedded rigging animation if present
  React.useEffect(() => {
    if (names.length > 0) {
      // Stop all active animation clips first
      Object.values(actions).forEach((action: any) => action?.stop());
      
      // Play first animation action (like walk/idle/run)
      const action = actions[names[0]];
      if (action) {
        action.reset().fadeIn(0.2).play();
      }
    }
  }, [actions, names, modelUrl]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Keep robot completely centered in place
      groupRef.current.position.x = 0;
      groupRef.current.position.z = 0;
      
      // Gentle hovering/bobbing up and down
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.08 - 0.1;
      
      // Subtle rotation back and forth
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.15;
      
      // Very gentle side tilt sway
      groupRef.current.rotation.z = Math.sin(t * 1.0) * 0.04;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        scale={1.45}
        position={[0, -1.0, 0]}
        rotation={[0, 0, 0]}
        onClick={(e: any) => {
          e.stopPropagation();
          onRobotClick();
        }}
      />
    </group>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#0B84FF" />
      <Text style={styles.loaderText}>Memuat Robot 3D...</Text>
    </View>
  );
}

export default function Robot3DModelView() {
  const [isMounted, setIsMounted] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleRobotClick = () => {
    setActiveIndex((prev) => (prev + 1) % ANIMATIONS.length);
  };

  return (
    <View style={styles.outerContainer}>
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
              <RobotModel 
                key={ANIMATIONS[activeIndex].url}
                modelUrl={ANIMATIONS[activeIndex].url} 
                onRobotClick={handleRobotClick} 
              />

              {/* Interactive orbit controls */}
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate={false}
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
        <Text style={styles.hintText}>👆 Klik robot untuk ganti gaya: {ANIMATIONS[activeIndex].name}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
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
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
});
