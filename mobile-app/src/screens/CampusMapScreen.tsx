import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, LayoutChangeEvent, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import Svg, { G, Polygon, Text as SvgText } from 'react-native-svg';

import { ParkingAreaModel } from '../services/firestoreContracts';
import { AppStackParamList } from '../navigation/AppNavigator';
import { useParkingAreas } from '../hooks/useParkingAreas';
import { CAMPUS_PARKING_ZONES, MAP_IMAGE_HEIGHT, MAP_IMAGE_WIDTH, ParkingZone } from '../config/campusMapZones';

type Props = StackScreenProps<AppStackParamList, 'CampusMap'>;

type Size = {
  width: number;
  height: number;
};

type Point = {
  x: number;
  y: number;
};

const MAP_LABEL_FONT_FAMILY = Platform.select({
  ios: 'System',
  android: 'sans-serif-medium',
  default: 'sans-serif',
});

const parsePolygonPoints = (points: string): Point[] => {
  return points
    .trim()
    .split(/\s+/)
    .map((pair) => pair.split(','))
    .filter((pair) => pair.length === 2)
    .map(([x, y]) => ({ x: Number(x), y: Number(y) }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
};

const getPolygonCenter = (points: string): Point => {
  const vertices = parsePolygonPoints(points);

  if (vertices.length === 0) {
    return { x: 0, y: 0 };
  }

  if (vertices.length < 3) {
    const average = vertices.reduce(
      (acc, vertex) => ({ x: acc.x + vertex.x, y: acc.y + vertex.y }),
      { x: 0, y: 0 }
    );
    return {
      x: average.x / vertices.length,
      y: average.y / vertices.length,
    };
  }

  let areaTwice = 0;
  let cx = 0;
  let cy = 0;

  for (let i = 0; i < vertices.length; i += 1) {
    const current = vertices[i];
    const next = vertices[(i + 1) % vertices.length];
    const cross = current.x * next.y - next.x * current.y;
    areaTwice += cross;
    cx += (current.x + next.x) * cross;
    cy += (current.y + next.y) * cross;
  }

  if (areaTwice === 0) {
    const average = vertices.reduce(
      (acc, vertex) => ({ x: acc.x + vertex.x, y: acc.y + vertex.y }),
      { x: 0, y: 0 }
    );
    return {
      x: average.x / vertices.length,
      y: average.y / vertices.length,
    };
  }

  const factor = 1 / (3 * areaTwice);
  return {
    x: cx * factor,
    y: cy * factor,
  };
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const getZoneLabelPositions = (zone: ParkingZone): { labelX: number; labelY: number; statsX: number; statsY: number } => {
  const center = getPolygonCenter(zone.points);
  const margin = 10;
  const baseLabelX = zone.labelX ?? center.x;
  const baseLabelY = zone.labelY ?? center.y;
  const baseStatsX = zone.statsX ?? center.x;
  const baseStatsY = zone.statsY ?? center.y;

  return {
    labelX: clamp(baseLabelX + (zone.labelOffsetX ?? 0), margin, MAP_IMAGE_WIDTH - margin),
    labelY: clamp(baseLabelY + (zone.labelOffsetY ?? -6), margin, MAP_IMAGE_HEIGHT - margin),
    statsX: clamp(baseStatsX + (zone.statsOffsetX ?? 0), margin, MAP_IMAGE_WIDTH - margin),
    statsY: clamp(baseStatsY + (zone.statsOffsetY ?? 14), margin, MAP_IMAGE_HEIGHT - margin),
  };
};

const getAvailabilityRatio = (area: ParkingAreaModel): number => {
  if (area.totalSlots <= 0) {
    return 0;
  }

  return area.availableSlots / area.totalSlots;
};

const getAvailabilityColor = (area: ParkingAreaModel): string => {
  const ratio = getAvailabilityRatio(area);

  if (ratio <= 0.25) {
    return '#ef4444';
  }

  if (ratio <= 0.5) {
    return '#facc15';
  }

  return '#22c55e';
};

const getZoneFillColor = (type: ParkingZone['type']): string => {
  return type === 'motorcycle' ? 'rgba(245, 158, 11, 0.55)' : 'rgba(34, 197, 94, 0.45)';
};

const getZoneStrokeColor = (type: ParkingZone['type']): string => {
  return type === 'motorcycle' ? '#d97706' : '#15803d';
};

export default function CampusMapScreen({ navigation }: Props) {
  const { areas, isLoading, error, reload } = useParkingAreas();
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [mapCanvasSize, setMapCanvasSize] = useState<Size>({
    width: MAP_IMAGE_WIDTH,
    height: MAP_IMAGE_HEIGHT,
  });
  const transitionAnim = useRef(new Animated.Value(0)).current;

  const areasById = useMemo(() => {
    const dictionary: Record<string, ParkingAreaModel> = {};
    areas.forEach((area) => {
      dictionary[area.id] = area;
    });
    return dictionary;
  }, [areas]);

  const handleAreaPress = (areaId: string, areaName: string) => {
    if (isTransitioning) {
      return;
    }

    setIsTransitioning(true);

    Animated.timing(transitionAnim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('ParkingArea', {
        areaId,
        areaName,
      });

      transitionAnim.setValue(0);
      setIsTransitioning(false);
    });
  };

  const transitionStyle = {
    opacity: transitionAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.92],
    }),
    transform: [
      {
        scale: transitionAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.02],
        }),
      },
    ],
  };

  const mapFrame = useMemo(() => {
    const canvasWidth = Math.max(mapCanvasSize.width, 1);
    const canvasHeight = Math.max(mapCanvasSize.height, 1);
    const imageAspect = MAP_IMAGE_WIDTH / MAP_IMAGE_HEIGHT;
    const canvasAspect = canvasWidth / canvasHeight;

    let renderWidth = canvasWidth;
    let renderHeight = canvasHeight;

    if (canvasAspect > imageAspect) {
      renderHeight = canvasHeight;
      renderWidth = renderHeight * imageAspect;
    } else {
      renderWidth = canvasWidth;
      renderHeight = renderWidth / imageAspect;
    }

    return {
      width: renderWidth,
      height: renderHeight,
      left: (canvasWidth - renderWidth) / 2,
      top: (canvasHeight - renderHeight) / 2,
    };
  }, [mapCanvasSize]);

  const onMapCanvasLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width <= 0 || height <= 0) {
      return;
    }

    setMapCanvasSize((previous) => {
      if (Math.abs(previous.width - width) < 1 && Math.abs(previous.height - height) < 1) {
        return previous;
      }
      return { width, height };
    });
  };

  const invalidZoneIds = useMemo(() => {
    return CAMPUS_PARKING_ZONES.filter((zone) => parsePolygonPoints(zone.points).length < 3).map((zone) => zone.areaId);
  }, []);

  useEffect(() => {
    if (__DEV__ && invalidZoneIds.length > 0) {
      console.warn(`Campus map zones with invalid polygons: ${invalidZoneIds.join(', ')}`);
    }
  }, [invalidZoneIds]);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Campus Vicinity</Text>
          <Text style={styles.headerTitle}>Pamantasan ng Cabuyao</Text>
          <Text style={styles.headerSubtitle}>Reference map with designated parking zones</Text>
        </View>

        <Animated.View style={[styles.mapShell, transitionStyle]}>
          <View style={styles.mapHeaderRow}>
            <Text style={styles.mapTitle}>Campus Vicinity Map</Text>
          </View>

          <View style={styles.mapCanvas} onLayout={onMapCanvasLayout}>
            <View
              style={[
                styles.mapStage,
                {
                  width: mapFrame.width,
                  height: mapFrame.height,
                  left: mapFrame.left,
                  top: mapFrame.top,
                },
              ]}
            >
              <Image source={require('../assets/campusvicinity.png')} style={styles.mapImage} resizeMode="stretch" />
              <Svg
                style={styles.mapSvg}
                viewBox={`0 0 ${MAP_IMAGE_WIDTH} ${MAP_IMAGE_HEIGHT}`}
                preserveAspectRatio="none"
              >
                {CAMPUS_PARKING_ZONES.map((zone) => {
                  const area = areasById[zone.areaId];
                  const labelPosition = getZoneLabelPositions(zone);

                  return (
                    <G key={zone.areaId}>
                      <Polygon
                        points={zone.points}
                        fill={getZoneFillColor(zone.type)}
                        stroke={area ? getAvailabilityColor(area) : getZoneStrokeColor(zone.type)}
                        strokeWidth={3}
                        onPress={() => {
                          if (area) {
                            handleAreaPress(area.id, area.name);
                          }
                        }}
                      />

                      <SvgText
                        x={labelPosition.labelX}
                        y={labelPosition.labelY}
                        fill="#000000"
                        fontSize="12"
                        fontWeight="700"
                        fontFamily={MAP_LABEL_FONT_FAMILY}
                        textAnchor="middle"
                        pointerEvents="none"
                      >
                        {zone.label}
                      </SvgText>

                      <SvgText
                        x={labelPosition.statsX}
                        y={labelPosition.statsY}
                        fill="#000000"
                        fontSize="11"
                        fontWeight="700"
                        fontFamily={MAP_LABEL_FONT_FAMILY}
                        textAnchor="middle"
                        pointerEvents="none"
                      >
                        {area ? `${area.availableSlots}/${area.totalSlots} available` : 'No live data'}
                      </SvgText>
                    </G>
                  );
                })}
              </Svg>
            </View>
          </View>

          <View style={styles.mapLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: 'rgba(34, 197, 94, 0.45)', borderColor: '#15803d' }]} />
              <Text style={styles.legendText}>Car Parking</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: 'rgba(245, 158, 11, 0.55)', borderColor: '#d97706' }]} />
              <Text style={styles.legendText}>Motorcycle Parking</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
              <Text style={styles.legendText}>High availability border</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.infoBar, transitionStyle]}>
          {isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#38bdf8" />
              <Text style={styles.statusText}>Loading parking information...</Text>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorStateBox}>
              <Text style={styles.errorTitle}>Unable to load parking data.</Text>
              <Text style={styles.errorBody}>Please try again.</Text>
              <Text style={styles.errorDetail}>Reason: {error.message}</Text>
            </View>
          ) : null}

          <View style={styles.areaListContent}>
            {areas.map((area) => (
              <Pressable
                key={area.id}
                style={styles.areaItem}
                onPress={() => handleAreaPress(area.id, area.name)}
                disabled={isTransitioning}
              >
                <View style={styles.areaNameRow}>
                  <View style={[styles.availabilityDot, { backgroundColor: getAvailabilityColor(area) }]} />
                  <Text style={styles.areaName}>{area.name}</Text>
                </View>
                <Text style={styles.areaCount}>
                  {area.availableSlots} / {area.totalSlots} available
                </Text>
                <Text style={styles.areaHint}>Tap polygon or card to open area details</Text>
              </Pressable>
            ))}

            {!isLoading && !error && areas.length === 0 ? (
              <View style={styles.emptyStateBox}>
                <Text style={styles.statusText}>No parking areas found.</Text>
              </View>
            ) : null}
          </View>

          <Pressable
            style={[styles.reloadButton, isTransitioning && styles.reloadButtonDisabled]}
            onPress={() => void reload()}
            disabled={isTransitioning}
          >
            <Text style={styles.reloadButtonText}>{error ? 'Retry Loading Areas' : 'Reload Areas'}</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: '#07101d',
  },
  contentContainer: {
    paddingBottom: 18,
    gap: 14,
  },
  heroCard: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.24)',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    gap: 4,
  },
  eyebrow: {
    color: '#7dd3fc',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: 26,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  mapShell: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 20,
    padding: 14,
    gap: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.74)',
  },
  mapTitle: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '700',
  },
  mapHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  debugToggle: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  debugToggleActive: {
    borderColor: 'rgba(239, 68, 68, 0.75)',
    backgroundColor: 'rgba(127, 29, 29, 0.45)',
  },
  debugToggleText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '700',
  },
  mapCanvas: {
    width: '100%',
    aspectRatio: MAP_IMAGE_WIDTH / MAP_IMAGE_HEIGHT,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    backgroundColor: 'rgba(2, 6, 23, 0.45)',
  },
  mapStage: {
    position: 'absolute',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  mapLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  debugHintBox: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.28)',
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  debugHintText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.35)',
  },
  legendSwatch: {
    width: 14,
    height: 10,
    borderRadius: 3,
    borderWidth: 1,
  },
  legendText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  infoBar: {
    width: '100%',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    borderRadius: 18,
    padding: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.76)',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  areaListContent: {
    gap: 8,
    paddingBottom: 4,
  },
  emptyStateBox: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  errorStateBox: {
    borderWidth: 1,
    borderRadius: 12,
    borderColor: 'rgba(248, 113, 113, 0.65)',
    backgroundColor: 'rgba(127, 29, 29, 0.26)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fecaca',
  },
  errorBody: {
    fontSize: 13,
    color: '#fee2e2',
  },
  errorDetail: {
    fontSize: 12,
    color: '#fda4af',
  },
  statusText: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  areaItem: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.22)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 3,
    backgroundColor: 'rgba(2, 6, 23, 0.4)',
  },
  areaName: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '700',
  },
  areaNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  availabilityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  areaCount: {
    fontSize: 13,
    color: '#bfdbfe',
    fontWeight: '600',
  },
  areaHint: {
    fontSize: 12,
    color: '#94a3b8',
  },
  reloadButton: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
  },
  reloadButtonDisabled: {
    opacity: 0.6,
  },
  reloadButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#eff6ff',
  },
});
