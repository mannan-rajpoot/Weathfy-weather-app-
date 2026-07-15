import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet, StatusBar, Easing } from 'react-native';

const { width } = Dimensions.get('window');
const scale = (size) => (width / 375) * size;

const IntroSplashScreen = ({ onFinish }) => {
  // Animation Values
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.95)).current;
  const lineScale = useRef(new Animated.Value(0)).current; // For the bar below
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Text and Line appear together
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.spring(textScale, {
          toValue: 1,
          tension: 20,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(lineScale, {
          toValue: 1,
          duration: 1000,
          delay: 200, // Slight delay for the line to start after text
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ]),
      // 2. Hold for a moment
      Animated.delay(1500),
      // 3. Smooth fade out
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.quad),
      }),
    ]).start(() => {
      if (onFinish) onFinish();
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.contentContainer}>
        {/* Animated App Name */}
        <Animated.View style={{ 
          opacity: textOpacity, 
          transform: [{ scale: textScale }] 
        }}>
          <Text style={styles.appName}>Weathfy</Text>
        </Animated.View>

        {/* Animated Underline Bar */}
        <View style={styles.lineTrack}>
          <Animated.View 
            style={[
              styles.line, 
              { transform: [{ scaleX: lineScale }] }
            ]} 
          />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Pure Black
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
  },
  appName: {
    color: '#FFFFFF',
    fontSize: scale(48),
    // Ensure Poppins is installed or replace with a system rounded font
    fontFamily: 'Poppins-Bold', 
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  lineTrack: {
    height: 3,
    width: scale(80), // Total width of the bar
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle track
    marginTop: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  line: {
    height: '100%',
    width: '100%',
    backgroundColor: '#FFFFFF', // Solid white bar
    borderRadius: 10,
  },
});

export default IntroSplashScreen;