import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import IntroSplashScreen from './screens/IntroSplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import SetupScreen from './screens/SetupScreen';

export default function App() {
  const [stage, setStage] = useState('intro'); // intro -> onboarding -> setup -> main
  const [userProfile, setUserProfile] = useState(null);

  const handleSetupComplete = (data) => {
    setUserProfile(data);
    setStage('main');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {stage === 'intro' && <IntroSplashScreen onFinish={() => setStage('onboarding')} />}
      {stage === 'onboarding' && <OnboardingScreen onFinish={() => setStage('setup')} />}
      {stage === 'setup' && <SetupScreen onFinish={handleSetupComplete} />}

      {stage === 'main' && (
        <View style={styles.mainApp}>
          <Text style={{ color: '#FFF', fontSize: 20 }}>Welcome, {userProfile?.username}!</Text>
          <Text style={{ color: '#666' }}>Location set to: {userProfile?.location}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  mainApp: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});