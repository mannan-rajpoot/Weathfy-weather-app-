import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import IntroSplashScreen from './screens/IntroSplashScreen';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroFinish = () => {
    setShowIntro(false);
  };

  if (showIntro) {
    return <IntroSplashScreen onFinish={handleIntroFinish} />;
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
  },
});