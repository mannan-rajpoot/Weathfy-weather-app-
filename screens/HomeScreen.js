import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text, ScrollView, SafeAreaView, 
  Dimensions, Animated, ActivityIndicator, RefreshControl, Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

// --- RESPONSIVE LOGIC ---
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = (size) => (SCREEN_WIDTH / 375) * size;

// --- CONFIGURATION ---
const API_KEY = 'cbee911d0091f5f1dd3357d58de9f040'; // <--- PASTE YOUR KEY HERE
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const HomeScreen = ({ userProfile }) => {
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // --- FETCH LOGIC ---
  const fetchWeather = async () => {
    try {
      const city = userProfile?.location || 'London';
      
      // Fetch Current Weather
      const currentRes = await fetch(`${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`);
      const current = await currentRes.json();

      // Fetch Forecast
      const forecastRes = await fetch(`${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`);
      const forecast = await forecastRes.json();

      if (current.cod === 200) {
        setWeatherData(current);
        // Get one reading per day (at 12:00 PM)
        const daily = forecast.list.filter(reading => reading.dt_txt.includes("12:00:00"));
        setForecastData(daily);
      } else {
        console.log("API Error:", current.message);
      }
    } catch (error) {
      console.log("Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
    }
  };

  useEffect(() => {
    fetchWeather();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWeather();
  };

  // --- HELPERS ---
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
  };

  const getIcon = (code) => {
    const map = {
      '01d': 'weather-sunny', '01n': 'weather-night',
      '02d': 'weather-partly-cloudy', '02n': 'weather-night-partly-cloudy',
      '03d': 'weather-cloudy', '03n': 'weather-cloudy',
      '04d': 'weather-cloudy', '04n': 'weather-cloudy',
      '09d': 'weather-pouring', '10d': 'weather-rainy',
      '11d': 'weather-lightning', '13d': 'weather-snowy', '50d': 'weather-fog',
    };
    return map[code] || 'weather-cloudy';
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.ambientLight} />
      
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View style={[styles.mainWrapper, { opacity: fadeAnim }]}>
          
          {/* HEADER */}
          <View style={styles.header}>
            <View>
              <Text style={styles.brandName}>WEATHFY</Text>
              <Text style={styles.userGreet}>Welcome, {userProfile?.username || 'User'}</Text>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.locBox}>
                <MaterialCommunityIcons name="map-marker-outline" size={scale(14)} color="#FFF" />
                <Text style={styles.locationText}>{weatherData?.name || userProfile?.location || 'Unknown'}</Text>
              </View>
              <Text style={styles.liveClock}>{formatTime(currentTime)}</Text>
            </View>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.scrollBody}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />}
          >
            
            {/* BIG CURRENT WEATHER CONTAINER */}
            <View style={styles.glassWrapper}>
              <BlurView intensity={35} tint="dark" style={styles.heroBlur}>
                <MaterialCommunityIcons 
                  name={getIcon(weatherData?.weather[0]?.icon)} 
                  size={scale(75)} 
                  color="#FFF" 
                />
                <Text style={styles.mainTemp}>{weatherData ? Math.round(weatherData.main.temp) : '--'}°</Text>
                <Text style={styles.condition}>
                  {weatherData ? weatherData.weather[0].description.toUpperCase() : 'NO DATA'}
                </Text>
                
                <View style={styles.heroFooter}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>FEELS</Text>
                    <Text style={styles.detailValue}>{weatherData ? Math.round(weatherData.main.feels_like) : '--'}°</Text>
                  </View>
                  <View style={styles.sep} />
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>HUMIDITY</Text>
                    <Text style={styles.detailValue}>{weatherData ? weatherData.main.humidity : '--'}%</Text>
                  </View>
                  <View style={styles.sep} />
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>WIND</Text>
                    <Text style={styles.detailValue}>{weatherData ? weatherData.wind.speed : '--'} M/S</Text>
                  </View>
                </View>
              </BlurView>
            </View>

            {/* NEXT HOURS CONTAINER */}
            <Text style={styles.sectionTitle}>NEXT HOURS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyContainer}>
              {(forecastData.length > 0 ? forecastData : [1,2,3,4,5]).map((item, index) => (
                <View key={index} style={styles.hourlyChipWrapper}>
                  <BlurView intensity={25} tint="dark" style={styles.hourlyBlur}>
                    <Text style={styles.hTime}>
                      {item.dt ? new Date(item.dt * 1000).toLocaleTimeString([], {hour: '2-digit', hour12: true}) : '--'}
                    </Text>
                    <MaterialCommunityIcons 
                      name={item.weather ? getIcon(item.weather[0].icon) : 'weather-cloudy'} 
                      size={scale(22)} 
                      color="#FFF" 
                    />
                    <Text style={styles.hTemp}>{item.main ? Math.round(item.main.temp) : '--'}°</Text>
                  </BlurView>
                </View>
              ))}
            </ScrollView>

            {/* NEXT DAYS CONTAINER */}
            <Text style={styles.sectionTitle}>7-DAY FORECAST</Text>
            <View style={styles.glassWrapper}>
              <BlurView intensity={15} tint="dark" style={styles.dailyBlur}>
                {(forecastData.length > 0 ? forecastData : [1,2,3,4,5]).map((item, index) => (
                  <View key={index} style={[styles.dailyRow, index === 4 && { borderBottomWidth: 0 }]}>
                    <Text style={styles.dDay}>
                      {item.dt ? new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }) : '---'}
                    </Text>
                    <MaterialCommunityIcons 
                      name={item.weather ? getIcon(item.weather[0].icon) : 'weather-cloudy'} 
                      size={scale(20)} 
                      color="#FFF" 
                    />
                    <View style={styles.dTempBox}>
                      <Text style={styles.dHigh}>{item.main ? Math.round(item.main.temp_max) : '--'}°</Text>
                      <Text style={styles.dLow}>{item.main ? Math.round(item.main.temp_min) : '--'}°</Text>
                    </View>
                  </View>
                ))}
              </BlurView>
            </View>

            <View style={{ height: scale(40) }} />
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  mainWrapper: { flex: 1, paddingHorizontal: scale(20) },
  
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: scale(15), marginBottom: scale(30)
  },
  brandName: { color: '#FFF', fontSize: scale(22), fontWeight: '900', letterSpacing: 2 },
  userGreet: { color: '#555', fontSize: scale(11), fontWeight: '700', marginTop: scale(2) },
  headerRight: { alignItems: 'flex-end' },
  locBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { color: '#FFF', fontSize: scale(14), fontWeight: '800' },
  liveClock: { color: '#666', fontSize: scale(10), fontWeight: 'bold', marginTop: scale(3) },
  scrollBody: { paddingTop: scale(5) },
  
  // Glass Design
  glassWrapper: {
    borderRadius: scale(30), overflow: 'hidden', borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)', marginBottom: scale(25)
  },
  heroBlur: {
    paddingVertical: scale(45), alignItems: 'center',
    backgroundColor: 'rgba(25, 25, 25, 0.4)'
  },
  mainTemp: { color: '#FFF', fontSize: scale(95), fontWeight: '200', marginVertical: scale(5) },
  condition: { color: '#FFF', fontSize: scale(12), fontWeight: '800', letterSpacing: 5 },
  heroFooter: { 
    flexDirection: 'row', alignItems: 'center', marginTop: scale(30), 
    width: '100%', justifyContent: 'center', gap: scale(20) 
  },
  detailItem: { alignItems: 'center' },
  detailLabel: { color: '#444', fontSize: scale(8), fontWeight: '900', marginBottom: 4 },
  detailValue: { color: '#FFF', fontSize: scale(12), fontWeight: '700' },
  sep: { width: 1, height: scale(15), backgroundColor: 'rgba(255,255,255,0.1)' },

  sectionTitle: { 
    color: '#333', fontSize: scale(10), fontWeight: '900', 
    letterSpacing: 1.5, marginBottom: scale(15), marginLeft: scale(5) 
  },

  // Hourly
  hourlyContainer: { marginBottom: scale(30) },
  hourlyChipWrapper: {
    borderRadius: scale(22), overflow: 'hidden', marginRight: scale(12),
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)'
  },
  hourlyBlur: {
    width: scale(90), paddingVertical: scale(20), alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.5)'
  },
  hTime: { color: '#555', fontSize: scale(9), fontWeight: 'bold', marginBottom: scale(12) },
  hTemp: { color: '#FFF', fontSize: scale(17), fontWeight: 'bold', marginTop: scale(10) },

  // Daily
  dailyBlur: { paddingHorizontal: scale(25), backgroundColor: 'rgba(20, 20, 20, 0.3)' },
  dailyRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: scale(20), borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.03)'
  },
  dDay: { color: '#FFF', fontSize: scale(14), fontWeight: '700', flex: 1 },
  dTempBox: { flexDirection: 'row', gap: scale(15), flex: 1, justifyContent: 'flex-end' },
  dHigh: { color: '#FFF', fontSize: scale(14), fontWeight: '700' },
  dLow: { color: '#444', fontSize: scale(14), fontWeight: '700' },
});

export default HomeScreen;