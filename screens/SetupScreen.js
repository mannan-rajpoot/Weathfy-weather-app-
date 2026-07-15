import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView,
  Dimensions, Animated, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Alert, StatusBar, Modal
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const SetupScreen = ({ onFinish }) => {
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState('');
  const [isLoadingLoc, setIsLoadingLoc] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal State

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 7, useNativeDriver: true })
    ]).start();
  }, []);

  // Function to trigger the actual location logic
  const startLocationDetection = async () => {
    setIsModalVisible(false);
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
      <StatusBar barStyle="light-content" />
      
      {/* --- Custom Location Popup --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons name="map-marker-radius" size={48} color="#0A84FF" />
            <Text style={styles.modalTitle}>Device Location</Text>
            <Text style={styles.modalText}>
              Weathfy uses your location to provide accurate local weather updates and alerts.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancel} 
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Not now</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalConfirm} 
                onPress={startLocationDetection}
              >
                <Text style={styles.modalConfirmText}>Allow</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
                <MaterialCommunityIcons name="account-outline" size={24} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="What should we call you?"
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
                <MaterialCommunityIcons name="map-marker-outline" size={24} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your city"
                  placeholderTextColor="#444"
                  value={location}
                  onChangeText={setLocation}
                />
                {isLoadingLoc && <ActivityIndicator size="small" color="#0A84FF" />}
              </View>

              <TouchableOpacity 
                style={styles.gpsBtn} 
                onPress={() => setIsModalVisible(true)} // Show Popup first
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="crosshairs-gps" size={18} color="#0A84FF" />
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
            activeOpacity={0.9}
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
  scrollContent: { paddingBottom: 140 },
  content: { padding: 25 },
  header: { marginBottom: 45, marginTop: 20 },
  appName: { color: '#ffffff', fontSize: 14, fontFamily: 'Poppins-Bold', fontWeight: '900', letterSpacing: 4, marginBottom: 10 },
  title: { color: '#FFF', fontSize: 34, fontFamily: 'Poppins-Bold', fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: '#888', fontSize: 16, marginTop: 8 },
  section: { marginBottom: 35 },
  label: { color: '#FFF', fontSize: 13, fontFamily: 'Poppins-Bold', fontWeight: '700', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1.5 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#151517',
    borderRadius: 20, paddingHorizontal: 18, height: 68, borderWidth: 1, borderColor: '#262629',
  },
  input: { flex: 1, color: '#FFF', fontSize: 16, marginLeft: 12 },
  gpsBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 18, padding: 5 },
  gpsText: { color: '#ffffff', marginLeft: 10, fontWeight: '700', fontSize: 14 },
  
  // --- Modal Styles ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#151517', borderRadius: 30, padding: 30, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#262629' },
  modalTitle: { color: '#FFF', fontSize: 20, fontFamily: 'Poppins-Bold', fontWeight: '800', marginTop: 15 },
  modalText: { color: '#888', textAlign: 'center', fontSize: 14, marginTop: 10, lineHeight: 22, fontFamily: 'Poppins-Regular' },
  modalButtons: { flexDirection: 'row', marginTop: 25, gap: 12 },
  modalCancel: { flex: 1, height: 55, justifyContent: 'center', alignItems: 'center', borderRadius: 15, backgroundColor: '#262629' },
  modalCancelText: { color: '#FFF', fontWeight: '700' },
  modalConfirm: { flex: 1, height: 55, justifyContent: 'center', alignItems: 'center', borderRadius: 15, backgroundColor: '#ffffff' },
  modalConfirmText: { color: '#000', fontWeight: '900' },

  // --- Footer Button (Shadow Removed) ---
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 25, backgroundColor: 'rgba(0,0,0,0.9)' },
  finishBtn: { 
    flexDirection: 'row', 
    backgroundColor: '#ffffff', 
    height: 65, 
    borderRadius: 22, 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 12,
    // No shadow properties here for a flat look
  },
  disabledBtn: { backgroundColor: '#1C1C1E', opacity: 0.5 },
  finishBtnText: { color: '#000', fontSize: 18, fontWeight: '900' },
});

export default SetupScreen;