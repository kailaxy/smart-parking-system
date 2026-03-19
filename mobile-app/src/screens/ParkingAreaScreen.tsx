import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';

import { AppStackParamList } from '../navigation/AppNavigator';
import { useParkingSlots } from '../hooks/useParkingSlots';
import { ParkingSlotModel } from '../services/firestoreContracts';

type Props = StackScreenProps<AppStackParamList, 'ParkingArea'>;

const getStatusColor = (status: ParkingSlotModel['status']): string => {
  switch (status) {
    case 'available':
      return '#22c55e';
    case 'occupied':
      return '#ef4444';
    default:
      return '#64748b';
  }
};

const getStatusLabel = (status: ParkingSlotModel['status']): string => {
  switch (status) {
    case 'available':
      return '✓ Av';
    case 'occupied':
      return '✗ Occ';
    default:
      return status;
  }
};

type SlotGridItem = {
  id: string;
  slotNumber: string;
  status: ParkingSlotModel['status'];
  vehicleType: ParkingSlotModel['vehicleType'];
};

type SlotMatrixCell = SlotGridItem | null;

const SLOT_MASKS_BY_AREA_AND_TYPE: Record<string, number[][]> = {
  // 1 = slot, 0 = gap
  'area_A:car': [
    [0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0],
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  'area_B:car': [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ],
  'motorcycle_area:motorcycle': [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ],
};

const isMotorcycleStrip = (areaId: string, vehicleType: ParkingSlotModel['vehicleType']): boolean => {
  return areaId === 'motorcycle_area' && vehicleType === 'motorcycle';
};

const buildSlotRows = (slots: SlotGridItem[], areaId: string, vehicleType: ParkingSlotModel['vehicleType']): SlotMatrixCell[][] => {
  const mask = SLOT_MASKS_BY_AREA_AND_TYPE[`${areaId}:${vehicleType}`];

  if (mask) {
    const isStrip = isMotorcycleStrip(areaId, vehicleType);
    const slotsPerMask = mask.reduce((sum, row) => sum + row.filter((cell) => cell === 1).length, 0);
    const rows: SlotMatrixCell[][] = [];
    const maxColumns = Math.max(...mask.map((row) => row.length), 1);
    let cursor = 0;

    // First, render one full mask block.
    mask.forEach((rowMask) => {
      const row: SlotMatrixCell[] = rowMask.map((cell) => {
        if (cell !== 1) {
          return null;
        }

        if (cursor >= slots.length) {
          return null;
        }

        const slot = slots[cursor];
        cursor += 1;
        return slot;
      });

      rows.push(row);
    });

    if (isStrip) {
      // Motorcycle strip keeps full mask pages so Continue/Previous flips complete sections.
      while (cursor < slots.length) {
        mask.forEach((rowMask) => {
          const row: SlotMatrixCell[] = rowMask.map((cell) => {
            if (cell !== 1) {
              return null;
            }

            if (cursor >= slots.length) {
              return null;
            }

            const slot = slots[cursor];
            cursor += 1;
            return slot;
          });

          rows.push(row);
        });
      }

      return rows;
    }

    // For non-strip areas (A/B), keep a spacer row before any overflow slot row for clearer UX.
    while (cursor < slots.length) {
      const spacerRow: SlotMatrixCell[] = Array.from({ length: maxColumns }, () => null);
      rows.push(spacerRow);

      const slotRow: SlotMatrixCell[] = Array.from({ length: maxColumns }, () => null);
      for (let col = 0; col < maxColumns && cursor < slots.length; col += 1) {
        slotRow[col] = slots[cursor];
        cursor += 1;
      }

      rows.push(slotRow);
    }

    return rows;
  }

  // Fallback for unknown/new areas: balanced rows close to square aspect.
  const columns = Math.max(3, Math.ceil(Math.sqrt(slots.length)));
  const rows: SlotMatrixCell[][] = [];
  for (let index = 0; index < slots.length; index += columns) {
    rows.push(slots.slice(index, index + columns));
  }
  return rows;
};

const SlotGridCell = ({
  slot,
  widthPercent,
  compact,
  onPress,
}: {
  slot: SlotGridItem;
  widthPercent: `${number}%`;
  compact: boolean;
  onPress: (slotId: string) => void;
}) => {
  const statusColor = getStatusColor(slot.status);

  return (
    <Pressable
      style={[
        styles.slotCell,
        { borderColor: statusColor, width: widthPercent },
        compact && styles.slotCellCompact,
      ]}
      onPress={() => onPress(slot.id)}
    >
      <View style={[styles.slotStatusDot, { backgroundColor: statusColor }]} />
      <Text style={[styles.slotCellNumber, compact && styles.slotCellNumberCompact]}>{slot.slotNumber}</Text>
      <Text style={[styles.slotCellStatus, { color: statusColor }, compact && styles.slotCellStatusCompact]}>
        {getStatusLabel(slot.status)}
      </Text>
    </Pressable>
  );
};

const SlotGroup = ({
  areaId,
  vehicleType,
  title,
  slots,
  onSlotSelect,
}: {
  areaId: string;
  vehicleType: ParkingSlotModel['vehicleType'];
  title: string;
  slots: SlotGridItem[];
  onSlotSelect: (slotId: string) => void;
}) => {
  const slotRows = useMemo(() => buildSlotRows(slots, areaId, vehicleType), [slots, areaId, vehicleType]);
  const stripMode = isMotorcycleStrip(areaId, vehicleType);
  const [pageIndex, setPageIndex] = useState(0);

  const maskKey = `${areaId}:${vehicleType}`;
  const maskRowCount = SLOT_MASKS_BY_AREA_AND_TYPE[maskKey]?.length ?? 1;

  const pageCount = useMemo(() => {
    if (!stripMode) {
      return 1;
    }
    return Math.max(1, Math.ceil(slotRows.length / Math.max(maskRowCount, 1)));
  }, [stripMode, slotRows.length, maskRowCount]);

  useEffect(() => {
    setPageIndex(0);
  }, [areaId, vehicleType, slots.length]);

  const visibleRows = useMemo(() => {
    if (stripMode) {
      const start = pageIndex * maskRowCount;
      const end = start + maskRowCount;
      return slotRows.slice(start, end);
    }

    return slotRows;
  }, [slotRows, stripMode, pageIndex, maskRowCount]);

  const visibleColumnCount = useMemo(
    () => visibleRows.reduce((max, row) => Math.max(max, row.length), 0),
    [visibleRows]
  );

  const compact = visibleColumnCount >= 8;
  const widthPercent = `${(100 / Math.max(visibleColumnCount, 1)).toFixed(4)}%` as `${number}%`;

  const availableCount = slots.filter((s) => s.status === 'available').length;
  const occupiedCount = slots.filter((s) => s.status === 'occupied').length;

  return (
    <View style={styles.groupContainer}>
      {/* Group Header */}
      <View style={styles.groupHeader}>
        <Text style={styles.groupTitle}>{title}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <View style={[styles.statDot, { backgroundColor: '#22c55e' }]} />
            <Text style={styles.statText}>{availableCount} av</Text>
          </View>
          <View style={styles.statBadge}>
            <View style={[styles.statDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.statText}>{occupiedCount} occ</Text>
          </View>
        </View>
      </View>

      {/* Shape-aware slot arrangement */}
      <View style={styles.slotShapeMap}>
        {visibleRows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.slotRow}>
            {row.map((slot, cellIndex) =>
              slot ? (
                <SlotGridCell
                  key={slot.id}
                  slot={slot}
                  widthPercent={widthPercent}
                  compact={compact}
                  onPress={onSlotSelect}
                />
              ) : (
                <View
                  key={`void-${rowIndex}-${cellIndex}`}
                  style={[styles.slotVoidCell, { width: widthPercent }, compact && styles.slotVoidCellCompact]}
                />
              )
            )}
          </View>
        ))}

        {stripMode && pageCount > 1 ? (
          <View style={styles.stripPagingFooter}>
            <Text style={styles.stripPagingLabel}>Section {pageIndex + 1} of {pageCount}</Text>
            <View style={styles.stripPagingButtons}>
              <Pressable
                onPress={() => setPageIndex((previous) => Math.max(0, previous - 1))}
                disabled={pageIndex === 0}
                style={[styles.stripNavButton, pageIndex === 0 && styles.stripNavButtonDisabled]}
              >
                <Text style={[styles.stripNavButtonText, pageIndex === 0 && styles.stripNavButtonTextDisabled]}>
                  ← Previous
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setPageIndex((previous) => Math.min(pageCount - 1, previous + 1))}
                disabled={pageIndex >= pageCount - 1}
                style={[styles.stripNavButtonPrimary, pageIndex >= pageCount - 1 && styles.stripNavButtonDisabled]}
              >
                <Text style={[styles.stripNavButtonPrimaryText, pageIndex >= pageCount - 1 && styles.stripNavButtonTextDisabled]}>
                  Continue →
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default function ParkingAreaScreen({ navigation, route }: Props) {
  const { areaId, areaName } = route.params;
  const { slots, isLoading, error, reload } = useParkingSlots(areaId);
  const [selectedSlotId, setSelectedSlotId] = React.useState<string | null>(null);

  const { carSlots, motorcycleSlots, totalStats } = useMemo(() => {
    const cars: SlotGridItem[] = [];
    const motorcycles: SlotGridItem[] = [];

    slots.forEach((slot) => {
      const item: SlotGridItem = {
        id: slot.id,
        slotNumber: slot.slotNumber,
        status: slot.status,
        vehicleType: slot.vehicleType,
      };

      if (slot.vehicleType === 'car') {
        cars.push(item);
      } else if (slot.vehicleType === 'motorcycle') {
        motorcycles.push(item);
      }
    });

    const stats = {
      totalAvailable: slots.filter((s) => s.status === 'available').length,
      totalOccupied: slots.filter((s) => s.status === 'occupied').length,
      totalSlots: slots.length,
    };

    return { carSlots: cars, motorcycleSlots: motorcycles, totalStats: stats };
  }, [slots]);

  const selectedSlot = useMemo(() => slots.find((s) => s.id === selectedSlotId) ?? null, [slots, selectedSlotId]);

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlotId(slotId);
  };

  const handleNavigateToDetail = () => {
    if (selectedSlot) {
      setSelectedSlotId(null);
      navigation.navigate('SlotDetail', { areaId, slotId: selectedSlot.id });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Parking Area</Text>
          <Text style={styles.heroTitle}>{areaName}</Text>
        </View>

        {/* Summary Stats Card */}
        {!isLoading && !error && totalStats.totalSlots > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Slots</Text>
              <Text style={styles.summaryValue}>{totalStats.totalSlots}</Text>
            </View>
            <View style={styles.summarySeparator} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Available</Text>
              <Text style={[styles.summaryValue, { color: '#22c55e' }]}>{totalStats.totalAvailable}</Text>
            </View>
            <View style={styles.summarySeparator} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Occupied</Text>
              <Text style={[styles.summaryValue, { color: '#ef4444' }]}>{totalStats.totalOccupied}</Text>
            </View>
          </View>
        )}

        {/* Loading State */}
        {isLoading && (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color="#7dd3fc" />
            <Text style={styles.stateText}>Loading parking slots...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Unable to load slots</Text>
            <Text style={styles.errorDetail}>{error.message}</Text>
            <Pressable style={styles.retryButton} onPress={() => void reload()}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && !error && totalStats.totalSlots === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No parking slots found</Text>
            <Text style={styles.emptyText}>This area doesn't have any configured slots yet.</Text>
          </View>
        )}

        {/* Slot Groups */}
        {!isLoading && !error && totalStats.totalSlots > 0 && (
          <>
            {carSlots.length > 0 && (
              <SlotGroup
                areaId={areaId}
                vehicleType="car"
                title="🚗 Cars"
                slots={carSlots}
                onSlotSelect={handleSlotSelect}
              />
            )}
            {motorcycleSlots.length > 0 && (
              <SlotGroup
                areaId={areaId}
                vehicleType="motorcycle"
                title="🏍️ Motorcycles"
                slots={motorcycleSlots}
                onSlotSelect={handleSlotSelect}
              />
            )}
          </>
        )}

        {/* Spacer */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Slot Popup with Detail Navigation */}
      {selectedSlot && (
        <Pressable style={styles.popupOverlay} onPress={() => setSelectedSlotId(null)}>
          <View style={styles.popup}>
            <Text style={styles.popupTitle}>{selectedSlot.slotNumber}</Text>
            <Text style={[styles.popupStatus, { color: getStatusColor(selectedSlot.status) }]}>
              {getStatusLabel(selectedSlot.status)}
            </Text>
            <View style={styles.popupButtonRow}>
              <Pressable style={styles.popupCloseButton} onPress={() => setSelectedSlotId(null)}>
                <Text style={styles.popupButtonText}>Close</Text>
              </Pressable>
              <Pressable style={styles.popupDetailButton} onPress={handleNavigateToDetail}>
                <Text style={styles.popupDetailButtonText}>View Details</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07101d',
  },
  contentContainer: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 14,
  },
  heroCard: {
    borderRadius: 14,
    padding: 14,
    backgroundColor: 'rgba(30, 58, 138, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.2)',
    gap: 8,
  },
  eyebrow: {
    color: '#7dd3fc',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontSize: 10,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#f8fafc',
  },
  summaryCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#f8fafc',
  },
  summarySeparator: {
    width: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
  },
  stateContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 12,
  },
  stateText: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  errorContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(127, 29, 29, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gap: 8,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fecaca',
  },
  errorDetail: {
    fontSize: 13,
    color: '#fed2d2',
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#7c2d12',
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fecaca',
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  groupContainer: {
    gap: 10,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f8fafc',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#cbd5e1',
    textTransform: 'uppercase',
  },
  slotShapeMap: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    backgroundColor: 'rgba(2, 6, 23, 0.28)',
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 2,
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 2,
  },
  slotCell: {
    paddingVertical: 8,
    paddingHorizontal: 2,
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  slotCellCompact: {
    minHeight: 34,
    borderRadius: 6,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 1,
  },
  slotStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  slotCellNumber: {
    fontSize: 11,
    fontWeight: '800',
    color: '#f8fafc',
  },
  slotCellNumberCompact: {
    fontSize: 9,
  },
  slotCellStatus: {
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  slotCellStatusCompact: {
    fontSize: 7,
    letterSpacing: 0,
  },
  slotVoidCell: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  slotVoidCellCompact: {
    minHeight: 34,
    borderRadius: 6,
  },
  stripPagingFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.15)',
    gap: 8,
  },
  stripPagingLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  stripPagingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  stripNavButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    alignItems: 'center',
  },
  stripNavButtonPrimary: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
  },
  stripNavButtonDisabled: {
    opacity: 0.45,
  },
  stripNavButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  stripNavButtonPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#eff6ff',
  },
  stripNavButtonTextDisabled: {
    color: '#94a3b8',
  },
  spacer: {
    height: 32,
  },
  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    width: '92%',
    maxWidth: 360,
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#7dd3fc',
    alignItems: 'center',
    gap: 12,
  },
  popupTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#f8fafc',
  },
  popupStatus: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  popupButtonRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  popupCloseButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#cbd5e1',
    textAlign: 'center',
    includeFontPadding: false,
  },
  popupDetailButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupDetailButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#eff6ff',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
