import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { FirestoreTimestampLike, ParkingSlotModel } from '../services/firestoreContracts';

type SlotPopupProps = {
  visible: boolean;
  slot: ParkingSlotModel | null;
  onClose: () => void;
};

const formatLastUpdated = (value: FirestoreTimestampLike): string => {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  if (value instanceof Date) {
    return value.toLocaleString();
  }

  if (typeof value === 'number') {
    return new Date(value).toLocaleString();
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleString();
  }

  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    const dateValue = value.toDate();
    if (dateValue instanceof Date) {
      return dateValue.toLocaleString();
    }
  }

  return 'N/A';
};

export default function SlotPopup({ visible, slot, onClose }: SlotPopupProps) {
  const openAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      openAnim.setValue(0);
      return;
    }

    Animated.timing(openAnim, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [openAnim, visible]);

  const backdropStyle = {
    opacity: openAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
  };

  const popupStyle = {
    opacity: openAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      {
        scale: openAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.92, 1],
        }),
      },
      {
        translateY: openAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [12, 0],
        }),
      },
    ],
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlayContainer}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={styles.backdropPressable} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.popupCard, popupStyle]}>
          <Text style={styles.eyebrow}>Slot Details</Text>
          <Text style={styles.titleText}>
            {slot ? `Slot ${slot.slotNumber}` : 'Slot Details'}
          </Text>

          <Text style={styles.detailText}>
            Vehicle Type: {slot?.vehicleType ?? 'N/A'}
          </Text>
          <Text style={styles.detailText}>
            Status: {slot?.status ?? 'N/A'}
          </Text>
          <Text style={styles.detailText}>
            Last Updated: {slot ? formatLastUpdated(slot.lastUpdated) : 'N/A'}
          </Text>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  popupCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.28)',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 8,
  },
  eyebrow: {
    color: '#7dd3fc',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: '600',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    color: '#f8fafc',
  },
  detailText: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  closeButton: {
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#eff6ff',
  },
});
