import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView,
  Dimensions, Animated, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Alert, Linking
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');
const scale = (size) => (width / 375) * size;

// Expanded Smart Data
const SMART_DATA = [
  { id: '1', country: 'United States', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'] },
  { id: '2', country: 'United Kingdom', cities: ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool'] },
  { id: '3', country: 'India', cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad'] },
  { id: '4', country: 'Canada', cities: ['Toronto', 'Montreal', 'Vancouver', 'Ottawa', 'Calgary'] },
  { id: '5', country: 'Australia', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'] },
  { id: '6', country: 'Germany', cities: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne'] },
];

const SetupScreen = ({ onFinish }) => {
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isLoadingLoc, setIsLoadingLoc] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  // Pulse Animation for GPS button
  useEffect(() => {
    if (isLoadingLoc) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isLoadingLoc]);

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const handleGetCurrentLocation = async () => {
    setIsLoadingLoc(true);
    try {
      const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
      
      if (status === 'denied' && !canAskAgain) {
        Alert.alert(
          'Location Required',
          'Location access is permanently denied. Please enable it in settings to use smart detection.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: openSettings }
          ]
        );
        setIsLoadingLoc(false);
        return;
      }

      const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
      if (newStatus !== 'granted') {
        setIsLoadingLoc(false);
        return;
      }

      let userLoc = await Location.getCurrentPositionAsync({});
      let [address] = await Location.reverseGeocodeAsync({
        latitude: userLoc.coords.latitude,
        longitude: userLoc.coords.longitude,
      });

      if (address) {
        const cityStr = address.city || address.region || 'Unknown';
        setLocation(cityStr);
        // Try to auto-select country chip if found in data
        const found = SMART_DATA.find(d => d.country === address.country);
        if (found) setSelectedCountry(found);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to fetch location. Try selecting manually.');
    } finally {
      setIsLoadingLoc(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            
            <View style={styles.header}>
              <Text style={styles.title}>Setup Profile</Text>
              <Text style={styles.subtitle}>Personalize your weather dashboard</Text>
            </View>

            {/* Username Section */}
            <View style={styles.section}>
              <Text style={styles.label}>Display Name</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="account-outline" size={22} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="Your Name"
                  placeholderTextColor="#444"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>
            </View>

            {/* Location Section */}
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

              <TouchableOpacity 
                style={styles.gpsBtn} 
                onPress={handleGetCurrentLocation}
                disabled={isLoadingLoc}
              >
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#0A84FF" />
                </Animated.View>
                <Text style={styles.gpsText}>Detect My Location</Text>
              </TouchableOpacity>
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
            <MaterialCommunityIcons name="rocket-launch-outline" size={22} color="#121212" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scrollContent: { paddingBottom: 120 },
  content: { padding: 25 },
  header: { marginBottom: 30, marginTop: 10 },
  title: { color: '#FFF', fontSize: scale(32), fontWeight: '900' },
  subtitle: { color: '#666', fontSize: 16, marginTop: 4 },
  section: { marginBottom: 30 },
  label: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E',
    borderRadius: 16, paddingHorizontal: 15, height: 60,
    borderWidth: 1, borderColor: '#2C2C2E',
  },
  input: { flex: 1, color: '#FFF', fontSize: 16, marginLeft: 10 },
  gpsBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 15, alignSelf: 'flex-start' },
  gpsText: { color: '#0A84FF', marginLeft: 8, fontWeight: '700' },
  smallLabel: { color: '#444', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 15 },
  countryList: { marginBottom: 15 },
  countryTab: { marginRight: 20, paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#0A84FF' },
  tabText: { color: '#666', fontWeight: '700', fontSize: 15 },
  activeTabText: { color: '#FFF' },
  cityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#1C1C1E', borderWidth: 1, borderColor: '#2C2C2E' },
  activeChip: { backgroundColor: '#0A84FF', borderColor: '#0A84FF' },
  chipText: { color: '#AAA', fontWeight: '600' },
  activeChipText: { color: '#FFF', fontWeight: '700' },
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 25, backgroundColor: '#121212' },
  finishBtn: { flexDirection: 'row', backgroundColor: '#FFF', height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 10 },
  disabledBtn: { opacity: 0.2 },
  finishBtnText: { color: '#121212', fontSize: 18, fontWeight: '900' },
});

export default SetupScreen;