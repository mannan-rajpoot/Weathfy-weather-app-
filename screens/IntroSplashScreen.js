import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, Dimensions, StyleSheet, StatusBar } from 'react-native';

const { width } = Dimensions.get('window');
const scale = (size) => (width / 375) * size;

const IntroSplashScreen = ({ onFinish }) => {
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.8)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(textScale, { toValue: 1, tension: 20, friction: 7, useNativeDriver: true }),
        Animated.timing(textOpacity, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
      Animated.delay(1200),
      Animated.timing(screenOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <Animated.View style={{ opacity: textOpacity, transform: [{ scale: textScale }] }}>
        <Text style={styles.appName}>Weathfy</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
  appName: { color: '#FFFFFF', fontSize: scale(52), fontWeight: '900', letterSpacing: -2 },
});

export default IntroSplashScreen;