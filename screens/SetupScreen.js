import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView,
  Dimensions, Animated, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Alert, Linking
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const SMART_DATA = [
  { id: '1', country: 'USA', cities: ['New York', 'Los Angeles', 'Chicago', 'Miami'] },
  { id: '2', country: 'UK', cities: ['London', 'Manchester', 'Birmingham'] },
  { id: '3', country: 'India', cities: ['Mumbai', 'Delhi', 'Bangalore'] },
  { id: '4', country: 'Canada', cities: ['Toronto', 'Vancouver', 'Montreal'] },
];

const SetupScreen = ({ onFinish }) => {
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(SMART_DATA[0]);
  const [isLoadingLoc, setIsLoadingLoc] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true })
    ]).start();
  }, []);

  const handleGetCurrentLocation = async () => {
    setIsLoadingLoc(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location in settings.');
        setIsLoadingLoc(false);
        return;
      }

      let userLoc = await Location.getCurrentPositionAsync({});
      let [address] = await Location.reverseGeocodeAsync({
        latitude: userLoc.coords.latitude,
        longitude: userLoc.coords.longitude,
      });

      if (address) {
        setLocation(address.city || address.region || 'Unknown City');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to fetch location.');
    } finally {
      setIsLoadingLoc(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            
            <View style={styles.header}>
              <Text style={styles.appName}>WEATHFY</Text>
              <Text style={styles.title}>Setup Profile</Text>
              <Text style={styles.subtitle}>Personalize your weather dashboard</Text>
            </View>

            {/* Name Input */}
            <View style={styles.section}>
              <Text style={styles.label}>Display Name</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="account-outline" size={22} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor="#444"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>
            </View>

            {/* Location Input */}
            <View style={styles.section}>
              <Text style={styles.label}>Home Location</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="map-marker-outline" size={22} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="City Name"
                  placeholderTextColor="#444"
                  value={location}
                  onChangeText={setLocation}
                />
                {isLoadingLoc && <ActivityIndicator size="small" color="#0A84FF" />}
              </View>

              <TouchableOpacity style={styles.gpsBtn} onPress={handleGetCurrentLocation}>
                <MaterialCommunityIcons name="crosshairs-gps" size={18} color="#0A84FF" />
                <Text style={styles.gpsText}>Detect My Location</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Select Section */}
            <View style={styles.section}>
              <Text style={styles.smallLabel}>Quick Select</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.countryList}>
                {SMART_DATA.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    onPress={() => setSelectedCountry(item)}
                    style={[styles.countryTab, selectedCountry.id === item.id && styles.activeTab]}
                  >
                    <Text style={[styles.tabText, selectedCountry.id === item.id && styles.activeTabText]}>{item.country}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.cityGrid}>
                {selectedCountry.cities.map((city) => (
                  <TouchableOpacity key={city} style={styles.chip} onPress={() => setLocation(city)}>
                    <Text style={styles.chipText}>{city}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.finishBtn, (!username || !location) && styles.disabledBtn]} 
            onPress={() => onFinish({ username, location })}
            disabled={!username || !location}
          >
            <Text style={styles.finishBtnText}>Launch Weathfy</Text>
            <MaterialCommunityIcons name="rocket-launch" size={22} color="#000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { paddingBottom: 120 },
  content: { padding: 25 },
  header: { marginBottom: 40, marginTop: 20 },
  appName: { color: '#0A84FF', fontSize: 16, fontWeight: '900', letterSpacing: 3, marginBottom: 8 },
  title: { color: '#FFF', fontSize: 32, fontWeight: '800' },
  subtitle: { color: '#666', fontSize: 16, marginTop: 5 },
  section: { marginBottom: 35 },
  label: { color: '#FFF', fontSize: 14, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E',
    borderRadius: 18, paddingHorizontal: 15, height: 65, borderWidth: 1, borderColor: '#2C2C2E',
  },
  input: { flex: 1, color: '#FFF', fontSize: 16, marginLeft: 10 },
  gpsBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  gpsText: { color: '#0A84FF', marginLeft: 8, fontWeight: '700' },
  smallLabel: { color: '#444', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 15 },
  countryList: { marginBottom: 20 },
  countryTab: { marginRight: 25, paddingBottom: 8 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#0A84FF' },
  tabText: { color: '#444', fontWeight: '700', fontSize: 14 },
  activeTabText: { color: '#FFF' },
  cityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#1C1C1E', borderWidth: 1, borderColor: '#2C2C2E' },
  chipText: { color: '#AAA', fontWeight: '600' },
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 25, backgroundColor: 'rgba(0,0,0,0.9)' },
  finishBtn: { flexDirection: 'row', backgroundColor: '#0A84FF', height: 65, borderRadius: 22, alignItems: 'center', justifyContent: 'center', gap: 12 },
  disabledBtn: { backgroundColor: '#1C1C1E', opacity: 0.5 },
  finishBtnText: { color: '#000', fontSize: 18, fontWeight: '800' },
});

export default SetupScreen;