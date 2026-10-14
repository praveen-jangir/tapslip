import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';
import { Radius, Shadow } from '../theme/tokens';
import { useOrder } from '../context/OrderContext';
import { PrimaryButton, SecondaryButton, TextButton } from '../components/ui';

type Nav = StackNavigationProp<RootStackParamList>;

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'phone-portrait-outline', label: 'No App\nDownload Required' },
  { icon: 'flash-outline', label: 'Faster\nOrdering' },
  { icon: 'location-outline', label: 'Live Order\nTracking' },
];

export function ScanScreen() {
  const navigation = useNavigation<Nav>();
  const { startSession, orderType } = useOrder();
  const dineIn = orderType === 'dine-in';
  const [scanning, setScanning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [tableInput, setTableInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const lineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(lineAnim, { toValue: 1, duration: 1700, useNativeDriver: true }),
        Animated.timing(lineAnim, { toValue: 0, duration: 1700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [lineAnim]);

  const enterApp = () => {
    navigation.reset({
      index: 0,
      routes: [
        { name: 'Main', params: { screen: orderType === 'dine-in' ? 'Menu' : 'MyOrder' } },
      ],
    });
  };

  const handleScan = () => {
    if (scanning) return;
    setScanning(true);
    setTimeout(() => {
      startSession(12);
      setScanning(false);
      enterApp();
    }, 750);
  };

  const submitTable = () => {
    const value = tableInput.trim();
    if (!value) {
      setError('Unable to scan QR code');
      return;
    }
    if (value !== '12') {
      setError(dineIn ? 'This table is currently unavailable.' : 'This code is currently unavailable.');
      return;
    }
    setError(null);
    setModalVisible(false);
    setTableInput('');
    startSession(12);
    enterApp();
  };

  const openModal = () => {
    setError(null);
    setTableInput('');
    setModalVisible(true);
  };

  const translateY = lineAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 234] });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <Image
        source={require('../../assets/food/butter-chicken.jpg')}
        style={StyleSheet.absoluteFill}
        blurRadius={22}
      />
      <View style={styles.dim} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {navigation.canGoBack() ? (
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
            accessibilityLabel="Back"
          >
            <Ionicons name="chevron-back" size={22} color={Colors.white} />
          </Pressable>
        ) : null}

        <View style={styles.head}>
          <Text style={styles.title}>{dineIn ? 'Scan Table QR Code' : 'Scan Counter QR Code'}</Text>
          <Text style={styles.subtitle}>
            {dineIn
              ? 'Point your camera at the QR code on your table to start ordering.'
              : 'Point your camera at the counter QR code to start your take-away order.'}
          </Text>
        </View>

        <Pressable
          style={styles.frameWrap}
          onPress={handleScan}
          accessibilityLabel="Simulate QR scan"
        >
          <View style={[styles.frame, scanning && { borderColor: Colors.success }]}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            <Ionicons
              name={scanning ? 'checkmark' : 'qr-code-outline'}
              size={72}
              color={scanning ? Colors.success : 'rgba(255,255,255,0.5)'}
            />
            {!scanning && (
              <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
            )}
          </View>
        </Pressable>

        <Text style={styles.hint}>
          {scanning ? 'QR code detected ✓' : 'Position the QR code inside the frame'}
        </Text>

        <View style={styles.features}>
          {FEATURES.map((feature) => (
            <View key={feature.label} style={styles.feature}>
              <Ionicons name={feature.icon} size={20} color="rgba(255,255,255,0.9)" />
              <Text style={styles.featureLabel}>{feature.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottom}>
          <SecondaryButton
            label={dineIn ? 'Enter Table Number Instead' : 'Enter Code Instead'}
            onPress={openModal}
          />
        </View>
      </SafeAreaView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {dineIn ? 'Enter Table Number' : 'Enter Counter Code'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {dineIn
                ? 'Enter the number printed on your table.'
                : 'Enter the code shown at the counter.'}
            </Text>
            <TextInput
              value={tableInput}
              onChangeText={(text) => {
                setTableInput(text);
                setError(null);
              }}
              placeholder="e.g. 12"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
              style={styles.input}
              maxLength={3}
            />
            {error ? (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={15} color={Colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            <View style={styles.modalActions}>
              <TextButton
                label="Cancel"
                onPress={() => setModalVisible(false)}
                color={Colors.textSecondary}
              />
              <PrimaryButton label="Continue" onPress={submitTable} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#120E1F',
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  safe: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  head: {
    alignItems: 'center',
    marginTop: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    maxWidth: 300,
  },
  frameWrap: {
    alignItems: 'center',
    marginTop: 34,
  },
  frame: {
    width: 300,
    height: 300,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  corner: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderColor: Colors.white,
    borderWidth: 4,
  },
  cornerTL: {
    top: -1,
    left: -1,
    borderTopLeftRadius: 32,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTR: {
    top: -1,
    right: -1,
    borderTopRightRadius: 32,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBL: {
    bottom: -1,
    left: -1,
    borderBottomLeftRadius: 32,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  cornerBR: {
    bottom: -1,
    right: -1,
    borderBottomRightRadius: 32,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    left: 14,
    right: 14,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#4ADE80',
    shadowColor: '#4ADE80',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  hint: {
    marginTop: 22,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 36,
  },
  feature: {
    alignItems: 'center',
    gap: 8,
    width: 100,
  },
  featureLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 16,
  },
  bottom: {
    marginTop: 'auto',
    marginBottom: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(12, 9, 24, 0.72)',
    justifyContent: 'center',
    paddingHorizontal: 26,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 24,
    ...Shadow.card,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  input: {
    marginTop: 18,
    height: 52,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 16,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.danger,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
});
