import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Dimensions,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;

const DATA = [
  {
    id: '1',
    title: 'Precision\nForecasting',
    description: 'Experience hyper-local accuracy powered by advanced meteorological data points.',
    iconName: 'weather-partly-cloudy',
    color: '#0A84FF',
  },
  {
    id: '2',
    title: 'Dynamic\nWind Maps',
    description: 'Track atmospheric shifts in real-time with our interactive high-resolution radar.',
    iconName: 'windsock',
    color: '#30D158',
  },
  {
    id: '3',
    title: 'Smart\nAlerts',
    description: 'Stay protected with instant, encrypted notifications for critical weather events.',
    iconName: 'bell-badge-outline',
    color: '#BF5AF2',
  },
];

const OnboardingScreen = ({ onFinish }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < DATA.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      onFinish();
    }
  };

  const renderItem = ({ item, index }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    // These use transform and opacity, so they could technically use native driver
    // but for consistency with the width animation, we'll let them run together
    const scaleIcon = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    const translateX = scrollX.interpolate({
      inputRange,
      outputRange: [width * 0.2, 0, -width * 0.2],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slide}>
        <View style={styles.visualContainer}>
          <Animated.View style={[styles.iconCircle, { 
            transform: [{ scale: scaleIcon }], 
            opacity,
            shadowColor: item.color,
          }]}>
            <MaterialCommunityIcons name={item.iconName} size={scale(90)} color={item.color} />
          </Animated.View>
        </View>

        <Animated.View style={[styles.textContainer, { opacity, transform: [{ translateX }] }]}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={[styles.titleLine, { backgroundColor: item.color }]} />
          <Text style={styles.description}>{item.description}</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onFinish}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <Animated.FlatList
        ref={flatListRef}
        data={DATA}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false } // FIX: Width animation requires false
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEventThrottle={16}
      />

      <View style={styles.footer}>
        <View style={styles.dotContainer}>
          {DATA.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            
            // Animating WIDTH property
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 28, 8],
              extrapolate: 'clamp',
            });
            
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.2, 1, 0.2],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View 
                key={i} 
                style={[styles.dot, { width: dotWidth, opacity: dotOpacity }]} 
              />
            );
          })}
        </View>

        <TouchableOpacity activeOpacity={0.9} style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === DATA.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <MaterialCommunityIcons 
             name={currentIndex === DATA.length - 1 ? "check" : "arrow-right"} 
             color="#121212" 
             size={20} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 30,
  },
  skipText: { color: '#666', fontSize: 16, fontWeight: '500' },
  slide: { width, alignItems: 'center', paddingHorizontal: 40 },
  visualContainer: { height: height * 0.45, justifyContent: 'center', alignItems: 'center' },
  iconCircle: {
    width: scale(180),
    height: scale(180),
    borderRadius: scale(90),
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  textContainer: { width: '100%', alignItems: 'flex-start' },
  title: { color: '#FFFFFF', fontSize: scale(36), fontWeight: '800', lineHeight: scale(42) },
  titleLine: { width: 40, height: 4, borderRadius: 2, marginVertical: verticalScale(16) },
  description: { color: '#A1A1A1', fontSize: scale(17), lineHeight: scale(26) },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: Platform.OS === 'ios' ? 20 : 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dotContainer: { flexDirection: 'row', alignItems: 'center' },
  dot: { height: 6, borderRadius: 3, backgroundColor: '#FFFFFF', marginHorizontal: 3 },
  button: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: scale(56),
    paddingHorizontal: scale(24),
    borderRadius: scale(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#121212', fontSize: 17, fontWeight: '700', marginRight: 8 },
});

export default OnboardingScreen;