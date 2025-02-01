// EyeTrackingCursor.tsx
import React, { useEffect } from 'react';
import { Animated, StyleSheet, Platform } from 'react-native';
import { useCursor } from '@/components/CursorContext';
import { NativeModules } from 'react-native';

const { ARKitManager } = NativeModules;

export default function EyeTrackingCursor() {
  const { setCursor } = useCursor();
  const [cursorX] = React.useState(new Animated.Value(100));
  const [cursorY] = React.useState(new Animated.Value(100));

  useEffect(() => {
    const idX = cursorX.addListener(({ value }) => {
      setCursor((prev) => ({ ...prev, x: value }));
    });
    const idY = cursorY.addListener(({ value }) => {
      setCursor((prev) => ({ ...prev, y: value }));
    });
    return () => {
      cursorX.removeListener(idX);
      cursorY.removeListener(idY);
    };
  }, [cursorX, cursorY, setCursor]);

  useEffect(() => {
    if (Platform.OS === 'ios' && ARKitManager?.startEyeTracking) {
      ARKitManager.startEyeTracking((gazeData: any[]) => {
        const { x, y } = gazeData[0];
        // Update Animated values based on ARKit gaze data.
        Animated.timing(cursorX, {
          toValue: (x + 1) * 200,
          duration: 100,
          useNativeDriver: false,
        }).start();
        Animated.timing(cursorY, {
          toValue: (y + 1) * 200,
          duration: 100,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [cursorX, cursorY]);

  return <Animated.View style={[styles.cursor, { left: cursorX, top: cursorY }]} />;
}

const styles = StyleSheet.create({
  cursor: {
    width: 30,
    height: 30,
    backgroundColor: 'red',
    borderRadius: 15,
    position: 'absolute',
    zIndex: 1000,
  },
});
