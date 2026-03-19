import React, { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';

import { AppStackParamList } from '../navigation/AppNavigator';
import { useParkingSlots } from '../hooks/useParkingSlots';
import { useParkingAreas } from '../hooks/useParkingAreas';
import { ParkingSlotModel } from '../services/firestoreContracts';

type Props = StackScreenProps<AppStackParamList, 'SlotDetail'>;

const getStatusEmoji = (status: ParkingSlotModel['status']): string => {
  switch (status) {
    case 'available':
      return '✅ Available';
    case 'occupied':
      return '🚫 Occupied';
    default:
      return status;
  }
};

const getVehicleTypeEmoji = (vehicleType: ParkingSlotModel['vehicleType']): string => {
  switch (vehicleType) {
    case 'car':
      return '🚗 Car';
    case 'motorcycle':
      return '🏍️ Motorcycle';
    default:
      return vehicleType;
  }
};

const formatTimestamp = (timestamp: unknown): string => {
  if (!timestamp) return 'Never';
  if (typeof timestamp === 'number') {
    return new Date(timestamp * 1000).toLocaleString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toLocaleString();
  }
  if (typeof timestamp === 'string') {
    return new Date(timestamp).toLocaleString();
  }
  return 'Timestamp available';
};

export default function SlotDetailScreen({ route }: Props) {
  const { areaId, slotId } = route.params;
  const { slots, isLoading, error } = useParkingSlots(areaId);
  const { areas } = useParkingAreas();

  const selectedSlot = useMemo(() => slots.find((slot) => slot.id === slotId) ?? null, [slots, slotId]);
  const areaInfo = useMemo(() => areas.find((a) => a.id === areaId) ?? null, [areas, areaId]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading && <ActivityIndicator size="large" color="#7dd3fc" style={styles.loader} />}
        {error && !selectedSlot && <Text style={styles.errorText}>Error: {error.message}</Text>}
        {!isLoading && !error && !selectedSlot && <Text style={styles.notFoundText}>Slot not found</Text>}

        {selectedSlot && (
          <>
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <Text style={styles.eyebrow}>Parking Slot Details</Text>
              <Text style={styles.slotNumberDisplay}>{selectedSlot.slotNumber}</Text>
              <Text style={styles.statusBadgeText}>{getStatusEmoji(selectedSlot.status)}</Text>
            </View>

            {/* Area Context Card */}
            {areaInfo && (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>📍 Area</Text>
                <Text style={styles.cardValue}>{areaInfo.name}</Text>
                <Text style={styles.cardSubtext}>{areaInfo.totalSlots} total slots</Text>
              </View>
            )}

            {/* Vehicle Type Card */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>🚗 Vehicle Type</Text>
              <Text style={styles.cardValue}>{getVehicleTypeEmoji(selectedSlot.vehicleType)}</Text>
            </View>

            {/* Status Card */}
            <View style={[styles.card, selectedSlot.status === 'available' ? styles.cardAvailable : styles.cardOccupied]}>
              <Text style={styles.cardLabel}>Status Badge</Text>
              <Text style={styles.cardValue}>{getStatusEmoji(selectedSlot.status)}</Text>
              <Text style={styles.cardSubtext}>
                {selectedSlot.status === 'available' ? 'Ready for parking' : 'Currently unavailable'}
              </Text>
            </View>

            {/* Position Card */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>📐 Map Position</Text>
              <Text style={styles.cardValue}>X: {selectedSlot.position.x.toFixed(0)} Y: {selectedSlot.position.y.toFixed(0)}</Text>
              <Text style={styles.cardSubtext}>
                Size: {selectedSlot.position.width.toFixed(0)}×{selectedSlot.position.height.toFixed(0)} px
              </Text>
            </View>

            {/* Metadata Card */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>⏰ Metadata</Text>
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Last Updated:</Text>
                <Text style={styles.metadataValue}>{formatTimestamp(selectedSlot.lastUpdated)}</Text>
              </View>
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Slot ID:</Text>
                <Text style={styles.metadataValue}>{selectedSlot.id}</Text>
              </View>
            </View>

            {/* Footer spacer */}
            <View style={styles.spacer} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07101d',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  loader: {
    marginVertical: 32,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 16,
  },
  notFoundText: {
    color: '#cbd5e1',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 32,
  },
  heroSection: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: 'rgba(30, 58, 138, 0.3)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.2)',
  },
  eyebrow: {
    color: '#7dd3fc',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  slotNumberDisplay: {
    fontSize: 48,
    fontWeight: '900',
    color: '#f8fafc',
    marginBottom: 8,
  },
  statusBadgeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#22c55e',
  },
  card: {
    marginBottom: 12,
    padding: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.76)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  cardAvailable: {
    borderColor: 'rgba(34, 197, 94, 0.3)',
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  cardOccupied: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7dd3fc',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  metadataLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94a3b8',
  },
  metadataValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
    flex: 1,
    textAlign: 'right',
  },
  spacer: {
    height: 32,
  },
});
