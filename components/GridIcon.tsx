// GridIcon.tsx
import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet, LayoutChangeEvent } from 'react-native';
import { useCursor } from '@/components/CursorContext'; // Make sure you have a CursorContext that provides { cursor, setCursor }

interface GridIconProps {
  label: string;
  iconSource: any;
  onPress: () => void;
  dwellTime?: number; // dwell time in milliseconds (default to 4000)
}

export default function GridIcon({
  label,
  iconSource,
  onPress,
  dwellTime = 4000,
}: GridIconProps) {
  const { cursor } = useCursor();
  const [layout, setLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setLayout({ x, y, width, height });
  };

  useEffect(() => {
    if (!layout) return;
    const { x, y, width, height } = layout;
    // Determine if the cursor is within this icon's bounds
    const isCursorOver =
      cursor.x >= x &&
      cursor.x <= x + width &&
      cursor.y >= y &&
      cursor.y <= y + height;

    if (isCursorOver && !timerRef.current) {
      // Start the dwell timer if the cursor is over the icon
      timerRef.current = setTimeout(() => {
        onPress(); // Trigger the "click"
        timerRef.current = null;
      }, dwellTime);
    } else if (!isCursorOver && timerRef.current) {
      // Cancel the timer if the cursor moves away before dwell time is reached
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [cursor, layout, onPress, dwellTime]);

  return (
    <TouchableOpacity onLayout={handleLayout} activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        <Image source={iconSource} style={styles.icon} />
        <Text style={styles.label}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    backgroundColor: '#F5F5F5',
    width: '26%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 30,
    borderRadius: 10,
  },
  icon: {
    width: '60%',
    height: '60%',
    marginBottom: 8,
  },
  label: {
    fontSize: 30,
    color: '#000',
  },
});
