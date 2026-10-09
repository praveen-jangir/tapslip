import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { useOrder } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import { AppHeader, EmptyState, PrimaryButton } from '../components/ui';
import { Colors } from '../theme/colors';
import { Radius, Shadow } from '../theme/tokens';
import { formatOrderDate } from '../utils/format';

type Nav = StackNavigationProp<RootStackParamList>;

const TAGS = ['Food quality', 'Fast service', 'Great packaging', 'Needs improvement'];

export function FeedbackScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'Feedback'>>();
  const { getOrder, rateOrder } = useOrder();
  const { show } = useToast();
  const orderNumber = route.params?.orderNumber;
  const order = orderNumber ? getOrder(orderNumber) : undefined;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  if (!order) {
    return (
      <View style={styles.root}>
        <AppHeader title="Feedback" onBack={() => navigation.goBack()} />
        <EmptyState
          icon="star-outline"
          title="Order not found"
          subtitle="We couldn't find the order you're trying to rate."
          actionLabel="Back"
          onAction={() => navigation.goBack()}
        />
      </View>
    );
  }

  const toggleTag = (tag: string) =>
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  const handleSubmit = () => {
    if (rating === 0) {
      show('Please select a star rating first', 'error');
      return;
    }
    rateOrder(order.id);
    setSubmitted(true);
    show('Thanks for your feedback!', 'success');
  };

  if (submitted) {
    return (
      <View style={styles.root}>
        <AppHeader title="Feedback" onBack={() => navigation.goBack()} />
        <View style={styles.thanksWrap}>
          <View style={styles.thanksIcon}>
            <Ionicons name="heart" size={44} color={Colors.white} />
          </View>
          <Text style={styles.thanksTitle}>Thank You!</Text>
          <Text style={styles.thanksSub}>
            We're glad you enjoyed your order. Your rating helps us improve.
          </Text>
          <PrimaryButton
            label="Done"
            onPress={() => navigation.goBack()}
            style={{ alignSelf: 'stretch', marginTop: 28 }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <AppHeader title="Feedback" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How was your order?</Text>
          <Text style={styles.cardSub}>
            #{order.id} · {formatOrderDate(order.placedAt)}
          </Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => setRating(star)}
                style={({ pressed }) => pressed && { transform: [{ scale: 1.2 }] }}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={38}
                  color={star <= rating ? Colors.warning : Colors.textMuted}
                />
              </Pressable>
            ))}
          </View>
          <Text style={styles.ratingHint}>
            {rating === 0
              ? 'Tap the stars to rate'
              : ['Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating - 1]}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.blockTitle}>What stood out?</Text>
          <View style={styles.tags}>
            {TAGS.map((tag) => {
              const active = tags.includes(tag);
              return (
                <Pressable
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={[styles.tag, active && styles.tagActive]}
                >
                  <Text style={[styles.tagText, active && { color: Colors.white }]}>{tag}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.blockTitle, { marginTop: 20 }]}>Tell us more (optional)</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Share your experience with us..."
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
            multiline
            maxLength={300}
          />
        </View>

        <PrimaryButton
          label="Submit Feedback"
          icon="send-outline"
          onPress={handleSubmit}
          style={{ marginTop: 4 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    padding: 20,
    paddingBottom: 44,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    marginBottom: 16,
    ...Shadow.soft,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  cardSub: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
  },
  ratingHint: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 12,
  },
  blockTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 13,
    height: 34,
    borderRadius: 999,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  input: {
    minHeight: 90,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
    padding: 14,
    fontSize: 14.5,
    color: Colors.text,
    textAlignVertical: 'top',
  },
  thanksWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 60,
  },
  thanksIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.button,
  },
  thanksTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 22,
  },
  thanksSub: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 21,
  },
});
