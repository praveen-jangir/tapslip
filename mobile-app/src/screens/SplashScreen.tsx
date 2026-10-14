import React, { useEffect } from 'react';
import { ActivityIndicator, Dimensions, StatusBar, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export function SplashScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('OrderType'), 1900);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#6A3AF2', '#4F20D8', '#38129E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blob, { top: -80, right: -70 }]} />
      <View style={[styles.blob, { top: 180, left: -110, backgroundColor: 'rgba(255,255,255,0.04)' }]} />
      <View style={[styles.wave, { bottom: -150, left: -width * 0.25 }]} />
      <View style={[styles.wave, { bottom: -190, left: -width * 0.1, backgroundColor: 'rgba(255,255,255,0.04)' }]} />

      <View style={styles.center}>
        <View style={styles.mark}>
          <Ionicons name="restaurant" size={54} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Tapslip</Text>
        <Text style={styles.tagline}>Scan. Order. Enjoy.</Text>
      </View>

      <View style={styles.bottom}>
        <ActivityIndicator color="rgba(255,255,255,0.85)" size="small" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  blob: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  wave: {
    position: 'absolute',
    width: width * 1.5,
    height: 280,
    borderRadius: 200,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    width: 112,
    height: 112,
    borderRadius: 34,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  title: {
    marginTop: 26,
    fontSize: 42,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  tagline: {
    marginTop: 10,
    fontSize: 16.5,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.8,
  },
  bottom: {
    position: 'absolute',
    bottom: 64,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
