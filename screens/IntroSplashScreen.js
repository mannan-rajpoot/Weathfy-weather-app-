import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  Easing,
  Dimensions,
  StyleSheet,
  StatusBar,
} from 'react-native';

const { width } = Dimensions.get('window');

// Responsive scaling utility
const scale = (size) => (width / 375) * size;

const IntroSplashScreen = ({ onFinish }) => {
  // Animation Values
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.4)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;

  // Whole-screen slide-out 
  const screenTranslateX = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // ── Phase 1: Text Bounces In ──
      Animated.parallel([
        Animated.spring(textScale, {
          toValue: 1,
          tension: 25,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(1500),

      // ── Phase 2: Whole screen slides left ──
      Animated.parallel([
        Animated.timing(screenTranslateX, {
          toValue: -width,
          duration: 520,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(screenOpacity, {
          toValue: 0,
          duration: 420,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      if (onFinish) onFinish();
    });
  }, [onFinish, screenOpacity, screenTranslateX, textOpacity, textScale, textTranslateY]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: screenTranslateX }],
          opacity: screenOpacity,
        },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <View style={styles.contentWrapper}>
        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [
              { scale: textScale },
              { translateY: textTranslateY }
            ],
          }}
        >
          <Text style={styles.appName}>Weathfy</Text>
        </Animated.View>
      </View>

      {/* Footer Decoration */}
      <Animated.View style={[styles.footer, { opacity: textOpacity }]}>
        <View style={styles.indicator} />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    color: '#FFFFFF',
    fontSize: scale(48),
    fontWeight: '900',
    letterSpacing: scale(-1.5),
    fontFamily: 'System',
  },
  footer: {
    position: 'absolute',
    bottom: scale(60),
    alignItems: 'center',
  },
  indicator: {
    width: scale(40),
    height: scale(4),
    backgroundColor: '#FFFFFF',
    borderRadius: scale(10),
    opacity: 0.15,
  },
});

export default IntroSplashScreen;