import React, { useEffect } from 'react';
import { Animated, StyleSheet, Platform } from 'react-native';
import { useCursor } from './CursorContext';
import { NativeModules } from 'react-native';

const { ARKitManager } = NativeModules;

export default function EyeTrackingCursor() {
  const { setCursor } = useCursor();
  const [cursorX] = React.useState(new Animated.Value(100));
  const [cursorY] = React.useState(new Animated.Value(100));

  // Update the global cursor position whenever the animated values change
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

  // Start ARKit eye tracking and update the Animated values based on the gaze data
  useEffect(() => {
    if (Platform.OS === 'ios' && ARKitManager?.startEyeTracking) {
      ARKitManager.startEyeTracking((gazeData: any[]) => {
        const { x, y } = gazeData[0];
        // Map the gaze values to your screen's coordinate system; adjust scaling as needed
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
    zIndex: 1000, // Ensures the cursor is rendered above other UI elements
  },
});
