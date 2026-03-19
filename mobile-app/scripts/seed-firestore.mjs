import { initializeApp } from 'firebase/app';
import { collection, doc, getDocs, getFirestore, query, setDoc, where, writeBatch } from 'firebase/firestore';

const args = new Set(process.argv.slice(2));
const verifyOnly = args.has('--verify-only');

const env = process.env;

const REQUIRED_ENV_VARS = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];

const validateSeedEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter((name) => !env[name]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for seeding: ${missing.join(', ')}.`
    );
  }
};

validateSeedEnv();

const firebaseConfig = {
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const COLLECTIONS = {
  campus: 'campus',
  parkingAreas: 'parking_areas',
  parkingSlots: 'parking_slots',
};

const SEED_TIMESTAMP = '2026-01-01T08:00:00Z';

const buildAreaSlots = ({ prefix, areaId, total, columns, startX, startY, stepX, stepY, width, height, vehicleType, availableCount }) => {
  const slots = [];
  for (let index = 0; index < total; index += 1) {
    const row = Math.floor(index / columns);
    const col = index % columns;
    const number = `${prefix}${index + 1}`;

    slots.push({
      slot_id: number,
      area_id: areaId,
      slot_number: number,
      status: index < availableCount ? 'available' : 'occupied',
      vehicle_type: vehicleType,
      position: {
        x: startX + col * stepX,
        y: startY + row * stepY,
        width,
        height,
      },
      last_updated: SEED_TIMESTAMP,
    });
  }
  return slots;
};

const buildSeedData = () => {
  // area_A - Car Parking (mapped to P2/P3 cars combined concept)
  const slotsAreaA = buildAreaSlots({
    prefix: 'A-',
    areaId: 'area_A',
    total: 30,  // P2 inside front car count
    columns: 6,
    startX: 300,
    startY: 200,
    stepX: 45,
    stepY: 65,
    width: 32,
    height: 55,
    vehicleType: 'car',
    availableCount: 18, // 18 available, 12 occupied
  });

  // area_B - Car Parking (remaining P2/P3 cars)
  const slotsAreaB = buildAreaSlots({
    prefix: 'B-',
    areaId: 'area_B',
    total: 20,  // P3 inside beach car count
    columns: 5,
    startX: 200,
    startY: 550,
    stepX: 45,
    stepY: 65,
    width: 32,
    height: 55,
    vehicleType: 'car',
    availableCount: 12, // 12 available, 8 occupied
  });

  // motorcycle_area - Motorcycles (P2 motorcycles)
  const slotsMotorcycle = buildAreaSlots({
    prefix: 'M-',
    areaId: 'motorcycle_area',
    total: 50,  // P2 inside front motorcycle count
    columns: 10,
    startX: 600,
    startY: 250,
    stepX: 35,
    stepY: 50,
    width: 25,
    height: 40,
    vehicleType: 'motorcycle',
    availableCount: 35, // 35 available, 15 occupied
  });

  const allSlots = [...slotsAreaA, ...slotsAreaB, ...slotsMotorcycle];

  const countAvailable = (areaId) => allSlots.filter((slot) => slot.area_id === areaId && slot.status === 'available').length;

  const campus = {
    id: 'pnc_campus',
    data: {
      name: 'Pamantasan ng Cabuyao Campus',
      description: 'Smart Parking System for PNC Campus',
      created_at: SEED_TIMESTAMP,
    },
  };

  const parkingAreas = [
    {
      id: 'area_A',
      data: {
        name: 'Car Parking A',
        type: 'car',
        total_slots: 30,
        available_slots: countAvailable('area_A'),
        map_position: { x: 560, y: 198 },
        bounds: { x: 474, y: 112, width: 170, height: 188 },
        created_at: SEED_TIMESTAMP,
      },
    },
    {
      id: 'area_B',
      data: {
        name: 'Car Parking B',
        type: 'car',
        total_slots: 20,
        available_slots: countAvailable('area_B'),
        map_position: { x: 445, y: 522 },
        bounds: { x: 339, y: 461, width: 213, height: 128 },
        created_at: SEED_TIMESTAMP,
      },
    },
    {
      id: 'motorcycle_area',
      data: {
        name: 'Motorcycle Parking',
        type: 'motorcycle',
        total_slots: 50,
        available_slots: countAvailable('motorcycle_area'),
        map_position: { x: 610, y: 695 },
        bounds: { x: 358, y: 625, width: 500, height: 149 },
        created_at: SEED_TIMESTAMP,
      },
    },
  ];

  return {
    campus,
    parkingAreas,
    parkingSlots: allSlots,
  };
};

const verifySeedState = async (db) => {
  const [campusSnap, areasSnap, slotsSnap] = await Promise.all([
    getDocs(collection(db, COLLECTIONS.campus)),
    getDocs(collection(db, COLLECTIONS.parkingAreas)),
    getDocs(collection(db, COLLECTIONS.parkingSlots)),
  ]);

  const areaIds = new Set(areasSnap.docs.map((item) => item.id));
  const unresolvedAreaRefs = [];
  let availableCount = 0;
  let occupiedCount = 0;

  slotsSnap.forEach((slotDoc) => {
    const slot = slotDoc.data();
    if (!areaIds.has(slot.area_id)) {
      unresolvedAreaRefs.push({ slotId: slotDoc.id, areaId: slot.area_id });
    }

    if (slot.status === 'available') {
      availableCount += 1;
    } else if (slot.status === 'occupied') {
      occupiedCount += 1;
    }
  });

  return {
    campusCount: campusSnap.size,
    parkingAreasCount: areasSnap.size,
    parkingSlotsCount: slotsSnap.size,
    availableCount,
    occupiedCount,
    unresolvedAreaRefs,
  };
};

const run = async () => {
  const app = initializeApp(firebaseConfig, 'seed-dataset-workflow');
  const db = getFirestore(app);

  if (!verifyOnly) {
    const seedData = buildSeedData();

    const batch = writeBatch(db);
    batch.set(doc(db, COLLECTIONS.campus, seedData.campus.id), seedData.campus.data, { merge: true });

    for (const area of seedData.parkingAreas) {
      batch.set(doc(db, COLLECTIONS.parkingAreas, area.id), area.data, { merge: true });
    }

    for (const slot of seedData.parkingSlots) {
      batch.set(doc(db, COLLECTIONS.parkingSlots, slot.slot_id), slot, { merge: true });
    }

    await batch.commit();
    console.log('SEED_WRITE_OK', JSON.stringify({
      campus: 1,
      parkingAreas: seedData.parkingAreas.length,
      parkingSlots: seedData.parkingSlots.length,
    }));
  }

  const verification = await verifySeedState(db);
  console.log('SEED_VERIFY', JSON.stringify(verification));

  const expected = {
    campusCount: 1,
    parkingAreasCount: 3,
    parkingSlotsCount: 100,
    availableCount: 65,
    occupiedCount: 35,
  };

  const ok =
    verification.campusCount === expected.campusCount &&
    verification.parkingAreasCount === expected.parkingAreasCount &&
    verification.parkingSlotsCount === expected.parkingSlotsCount &&
    verification.availableCount === expected.availableCount &&
    verification.occupiedCount === expected.occupiedCount &&
    verification.unresolvedAreaRefs.length === 0;

  if (!ok) {
    console.error('SEED_VERIFY_FAILED', JSON.stringify({ expected, actual: verification }));
    process.exit(1);
  }

  console.log('SEED_VERIFY_OK');
};

run().catch((error) => {
  console.error('SEED_WORKFLOW_ERROR', error?.code ?? '', error?.message ?? String(error));
  process.exit(1);
});
