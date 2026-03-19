export type ParkingZoneType = 'car' | 'motorcycle';

export type ParkingZone = {
  areaId: string;
  label: string;
  type: ParkingZoneType;
  points: string;
  labelX?: number;
  labelY?: number;
  statsX?: number;
  statsY?: number;
  labelOffsetX?: number;
  labelOffsetY?: number;
  statsOffsetX?: number;
  statsOffsetY?: number;
};

export const MAP_IMAGE_WIDTH = 1000;
export const MAP_IMAGE_HEIGHT = 841;

export const CAMPUS_PARKING_ZONES: ParkingZone[] = [
  {
    areaId: 'area_A',
    label: 'Car Parking A',
    type: 'car',
    points: '525,136 581,112 607,195 626,189 644,238 490,295 474,245 546,221',
    labelX: 560,
    labelY: 198,
    statsX: 560,
    statsY: 218,
  },
  {
    areaId: 'area_B',
    label: 'Car Parking B',
    type: 'car',
    points: '339,510 524,461 552,537 363,589',
    labelX: 445,
    labelY: 522,
    statsX: 445,
    statsY: 542,
  },
  {
    areaId: 'motorcycle_area',
    label: 'Motorcycle Parking',
    type: 'motorcycle',
    points: '358,754 853,625 858,644 358,774',
    labelX: 610,
    labelY: 695,
    statsX: 610,
    statsY: 716,
  },
];
