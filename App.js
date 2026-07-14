import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';

// Import all screens from your screens folder
import IntroSplashScreen from './screens/IntroSplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import SetupScreen from './screens/SetupScreen';
import HomeScreen from './screens/HomeScreen'; // This is the new dashboard

export default function App() {
  // Navigation State: intro -> onboarding -> setup -> main
  const [stage, setStage] = useState('intro'); 
  const [userProfile, setUserProfile] = useState(null);

  // Function called when the user finishes the SetupScreen
  const handleSetupComplete = (data) => {
    setUserProfile(data);
    setStage('main');
  };

  return (
    <View style={styles.container}>
      {/* Set StatusBar to light to match the dark professional theme */}
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* 1. Intro Splash Screen */}
      {stage === 'intro' && (
        <IntroSplashScreen onFinish={() => setStage('onboarding')} />
      )}

      {/* 2. Onboarding Carousel/Info */}
      {stage === 'onboarding' && (
        <OnboardingScreen onFinish={() => setStage('setup')} />
      )}

      {/* 3. Setup Profile (Name & Location) */}
      {stage === 'setup' && (
        <SetupScreen onFinish={handleSetupComplete} />
      )}

      {/* 4. Final Professional Weather Home Screen */}
      {stage === 'main' && (
        <HomeScreen userProfile={userProfile} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' // Pure black background for a premium OLED look
  },
});