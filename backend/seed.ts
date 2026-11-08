/**
 * Database seed script for The Sun Solar Management System.
 * Run: npm run seed
 *
 * Seeds the database with realistic Sri Lankan solar site data,
 * measurements, batteries, IoT devices, alerts, residential data, and more.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('☀ Seeding The Sun Solar Database...\n');

  // ─── USERS ───────────────────────────────────────────────
  console.log('  → Creating users...');
  const passwordHash = await bcrypt.hash('SolarAdmin2024!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@thesun.lk' },
    update: {},
    create: {
      email: 'admin@thesun.lk',
      password: passwordHash,
      firstName: 'Ashan',
      lastName: 'Muthukuda',
      role: 'ADMIN',
    },
  });

  const operator = await prisma.user.upsert({
    where: { email: 'operator@thesun.lk' },
    update: {},
    create: {
      email: 'operator@thesun.lk',
      password: passwordHash,
      firstName: 'Nimal',
      lastName: 'Perera',
      role: 'OPERATOR',
    },
  });

  const engineer = await prisma.user.upsert({
    where: { email: 'engineer@thesun.lk' },
    update: {},
    create: {
      email: 'engineer@thesun.lk',
      password: passwordHash,
      firstName: 'Kamal',
      lastName: 'Fernando',
      role: 'ENGINEER',
    },
  });

  await prisma.user.upsert({
    where: { email: 'viewer@thesun.lk' },
    update: {},
    create: {
      email: 'viewer@thesun.lk',
      password: passwordHash,
      firstName: 'Sunil',
      lastName: 'Jayawardena',
      role: 'READONLY',
    },
  });

  // ─── SOLAR SITES ─────────────────────────────────────────
  console.log('  → Creating solar sites...');
  const sitesData = [
    {
      siteCode: 'SL-SOLAR-001',
      name: 'Siyambalanduwa Solar Project',
      district: 'Monaragala',
      province: 'Uva',
      location: 'Siyambalanduwa',
      latitude: 6.9050,
      longitude: 81.5494,
      commissionedYear: 2020,
      installedCapacityMw: 1.0,
      annualEnergyGwh: 1.6,
      status: 'ONLINE' as const,
      sourceUrl: 'https://escas.lk/projects/',
    },
    {
      siteCode: 'SL-SOLAR-002',
      name: 'Hambantota Solar Project',
      district: 'Hambantota',
      province: 'Southern',
      location: 'Hambantota',
      latitude: 6.1241,
      longitude: 81.1185,
      commissionedYear: 2020,
      installedCapacityMw: 1.0,
      annualEnergyGwh: 1.5,
      status: 'ONLINE' as const,
      sourceUrl: 'https://escas.lk/projects/',
    },
    {
      siteCode: 'SL-SOLAR-003',
      name: 'Pooneryn Solar Project',
      district: 'Kilinochchi',
      province: 'Northern',
      location: 'Pooneryn',
      latitude: 9.5182,
      longitude: 80.0541,
      commissionedYear: 2020,
      installedCapacityMw: 1.0,
      annualEnergyGwh: 1.6,
      status: 'ONLINE' as const,
      sourceUrl: 'https://escas.lk/projects/',
    },
    {
      siteCode: 'SL-SOLAR-004',
      name: 'Vavunathivu Solar Project',
      district: 'Batticaloa',
      province: 'Eastern',
      location: 'Vavunathivu',
      latitude: 7.6833,
      longitude: 81.2500,
      commissionedYear: 2023,
      installedCapacityMw: 2.0,
      annualEnergyGwh: 3.3,
      status: 'ONLINE' as const,
      sourceUrl: 'https://escas.lk/projects/',
    },
    {
      siteCode: 'SL-SOLAR-005',
      name: 'Polonnaruwa Solar Project',
      district: 'Polonnaruwa',
      province: 'North Central',
      location: 'Polonnaruwa',
      latitude: 7.9403,
      longitude: 81.0188,
      commissionedYear: 2024,
      installedCapacityMw: 4.0,
      annualEnergyGwh: 6.7,
      status: 'ATTENTION' as const,
      sourceUrl: 'https://escas.lk/projects/',
    },
  ];

  const sites = [];
  for (const siteData of sitesData) {
    const site = await prisma.solarSite.upsert({
      where: { siteCode: siteData.siteCode },
      update: siteData,
      create: siteData,
    });
    sites.push(site);
  }

  // Assign site scopes to operator
  for (const site of sites) {
    await prisma.userSiteScope.upsert({
      where: { userId_siteId: { userId: operator.id, siteId: site.id } },
      update: {},
      create: { userId: operator.id, siteId: site.id },
    });
  }

  // ─── BATTERIES ────────────────────────────────────────────
  console.log('  → Creating batteries...');
  const battery1 = await prisma.battery.create({
    data: {
      siteId: sites[1].id,
      name: 'Hambantota BESS Unit 01',
      capacityKwh: 120,
      maxPowerKw: 60,
      socPercent: 75,
      sohPercent: 97,
      temperatureC: 31,
      status: 'AVAILABLE',
    },
  });

  const battery2 = await prisma.battery.create({
    data: {
      siteId: sites[3].id,
      name: 'Vavunathivu BESS Unit 01',
      capacityKwh: 160,
      maxPowerKw: 55,
      socPercent: 68,
      sohPercent: 96,
      temperatureC: 32,
      status: 'AVAILABLE',
    },
  });

  // Battery schedules
  await prisma.batterySchedule.createMany({
    data: [
      { batteryId: battery1.id, startTime: '06:00', endTime: '12:00', action: 'CHARGE', powerKw: 30 },
      { batteryId: battery1.id, startTime: '17:00', endTime: '21:00', action: 'DISCHARGE', powerKw: 45 },
      { batteryId: battery2.id, startTime: '07:00', endTime: '11:00', action: 'CHARGE', powerKw: 25 },
      { batteryId: battery2.id, startTime: '18:00', endTime: '22:00', action: 'DISCHARGE', powerKw: 40 },
    ],
  });

  // ─── INVERTERS ────────────────────────────────────────────
  console.log('  → Creating inverters...');
  for (let i = 0; i < sites.length; i++) {
    const inverterCount = sites[i].installedCapacityMw <= 1 ? 2 : sites[i].installedCapacityMw <= 2 ? 4 : 6;
    for (let j = 1; j <= inverterCount; j++) {
      await prisma.inverter.create({
        data: {
          siteId: sites[i].id,
          name: `INV-${String(j).padStart(2, '0')}`,
          ratedPowerKw: (sites[i].installedCapacityMw * 1000) / inverterCount,
          efficiencyPct: i === 0 && j === 4 ? 91 : 97 + Math.random() * 2,
          status: 'ONLINE',
        },
      });
    }
  }

  // ─── MEASUREMENTS (last 24 hours simulated) ──────────────
  console.log('  → Creating simulated measurements (24h)...');
  const now = new Date();
  const measurementData = [];
  for (const site of sites) {
    for (let h = 0; h < 24; h++) {
      const ts = new Date(now.getTime() - (23 - h) * 3600000);
      const hour = ts.getHours();
      const solarFactor = hour >= 6 && hour <= 18 ? Math.sin(((hour - 6) / 12) * Math.PI) : 0;
      const genKw = site.installedCapacityMw * 1000 * solarFactor * (0.7 + Math.random() * 0.2);
      const loadKw = site.installedCapacityMw * 1000 * 0.25 * (0.8 + Math.random() * 0.4);
      const voltage = site.siteCode === 'SL-SOLAR-005' ? 400 + h * 1.8 : 399 + Math.random() * 3;

      measurementData.push({
        siteId: site.id,
        timestamp: ts,
        generationKw: Math.round(genKw * 100) / 100,
        gridVoltageV: Math.round(voltage * 10) / 10,
        activePowerKw: Math.round((genKw - loadKw) * 100) / 100,
        frequencyHz: 49.95 + Math.random() * 0.1,
        powerFactor: 0.95 + Math.random() * 0.05,
        irradianceWm2: solarFactor * (800 + Math.random() * 200),
        ambientTempC: 26 + Math.random() * 6,
        dataSource: 'SIMULATED',
        dataQuality: 'GOOD' as const,
      });
    }
  }
  await prisma.measurement.createMany({ data: measurementData });

  // ─── IOT DEVICES ──────────────────────────────────────────
  console.log('  → Creating IoT devices...');
  for (let i = 0; i < sites.length; i++) {
    await prisma.iotDevice.createMany({
      data: [
        {
          siteId: sites[i].id,
          deviceCode: `GW-${sites[i].siteCode}`,
          name: `${sites[i].name} Gateway`,
          type: 'GATEWAY',
          protocol: 'MQTT',
          status: 'ONLINE',
          lastSeenAt: new Date(),
          latencyMs: 120 + Math.random() * 100,
          packetLossPct: Math.random() * 2,
        },
        {
          siteId: sites[i].id,
          deviceCode: `MTR-${sites[i].siteCode}`,
          name: `${sites[i].name} Meter`,
          type: 'METER',
          protocol: 'MODBUS',
          status: 'ONLINE',
          lastSeenAt: new Date(),
          latencyMs: 80 + Math.random() * 60,
          packetLossPct: Math.random() * 1.5,
        },
      ],
    });
  }

  // ─── ALERTS ───────────────────────────────────────────────
  console.log('  → Creating alerts...');
  await prisma.alert.createMany({
    data: [
      {
        siteId: sites[4].id,
        severity: 'CRITICAL',
        title: 'Voltage limit exceeded',
        detail: 'Polonnaruwa · 442.1 V measured · simulated feeder limit 440 V',
        status: 'OPEN',
      },
      {
        siteId: sites[0].id,
        severity: 'WARNING',
        title: 'Inverter efficiency low',
        detail: 'Siyambalanduwa · INV-04 operating at 91%',
        status: 'OPEN',
      },
      {
        siteId: sites[1].id,
        severity: 'INFO',
        title: 'Battery schedule updated',
        detail: 'Hambantota · charge window approved',
        status: 'ACKNOWLEDGED',
      },
      {
        siteId: sites[2].id,
        severity: 'WARNING',
        title: 'Telemetry latency spike',
        detail: 'Pooneryn gateway latency exceeded 500ms threshold',
        status: 'OPEN',
      },
    ],
  });

  // ─── CONTROL ACTIONS ──────────────────────────────────────
  console.log('  → Creating control actions...');
  await prisma.controlAction.create({
    data: {
      type: 'VOLTAGE_REGULATION',
      description: 'Resolve Site 05 voltage constraint by charging Site 04 battery',
      constraintValue: '442.1 V',
      candidateTarget: 'Site 04 battery',
      setpoint: '+18 kW charge',
      safetyChecks: [
        { check: 'Affected feeder topology identified', result: 'PASS' },
        { check: 'Battery available and below reserve limit', result: 'PASS' },
        { check: 'Command within configured power envelope', result: 'PASS' },
        { check: 'Affected bus constraint available', result: 'PASS' },
        { check: 'Operator permission verified', result: 'PASS' },
      ],
      status: 'PENDING',
      aiAssisted: true,
    },
  });

  // ─── FORECASTS ────────────────────────────────────────────
  console.log('  → Creating forecasts...');
  const hourlyGen = Array.from({ length: 24 }, (_, h) => {
    const factor = h >= 6 && h <= 18 ? Math.sin(((h - 6) / 12) * Math.PI) : 0;
    return Math.round(factor * 9000 * (0.85 + Math.random() * 0.15));
  });

  await prisma.forecast.createMany({
    data: [
      {
        type: 'GENERATION',
        targetDate: new Date(),
        values: hourlyGen,
        confidencePct: 87,
        modelVersion: 'XGBoost-v2.1',
      },
      {
        type: 'LOAD',
        targetDate: new Date(),
        values: Array.from({ length: 24 }, () => Math.round(1800 + Math.random() * 600)),
        confidencePct: 82,
        modelVersion: 'LSTM-v1.3',
      },
    ],
  });

  // ─── AI MODELS ────────────────────────────────────────────
  console.log('  → Creating AI models...');
  await prisma.aiModel.createMany({
    data: [
      {
        name: 'Generation Forecast Model',
        type: 'FORECAST',
        version: 'XGBoost-v2.1',
        status: 'READY',
        accuracy: 87,
        inferenceMs: 24,
        lastTrainedAt: new Date(now.getTime() - 7 * 86400000),
      },
      {
        name: 'Anomaly Detection Engine',
        type: 'ANOMALY',
        version: 'IsolationForest-v1.0',
        status: 'READY',
        accuracy: 92,
        inferenceMs: 18,
        lastTrainedAt: new Date(now.getTime() - 3 * 86400000),
      },
    ],
  });

  // ─── INTEGRATIONS ─────────────────────────────────────────
  console.log('  → Creating integrations...');
  await prisma.integration.createMany({
    data: [
      { name: 'CEB Data Exchange', type: 'REST', endpoint: 'https://api.ceb.lk/v1', status: 'CONNECTED' },
      { name: 'MQTT Telemetry Broker', type: 'MQTT', endpoint: 'mqtt://broker.thesun.lk:1883', status: 'CONNECTED' },
      { name: 'Modbus TCP Adapter', type: 'MODBUS_TCP', endpoint: '192.168.1.100:502', status: 'CONNECTED' },
      { name: 'Weather API', type: 'REST', endpoint: 'https://api.weather.lk/v2', status: 'CONNECTED' },
    ],
  });

  // ─── NOTIFICATIONS ────────────────────────────────────────
  console.log('  → Creating notifications...');
  const notifications = await Promise.all([
    prisma.notification.create({
      data: { type: 'CRITICAL', title: 'Voltage limit exceeded', detail: 'Polonnaruwa · 442.1 V measured', targetView: 'alerts' },
    }),
    prisma.notification.create({
      data: { type: 'WARNING', title: 'Inverter efficiency dropped', detail: 'Siyambalanduwa · INV-04 is at 91%', targetView: 'solar' },
    }),
    prisma.notification.create({
      data: { type: 'INFO', title: 'Battery schedule approved', detail: 'Charge window starts at 22:30', targetView: 'batteries' },
    }),
  ]);

  // Link notifications to admin user
  for (const notif of notifications) {
    await prisma.userNotification.create({
      data: { userId: admin.id, notificationId: notif.id },
    });
  }

  // ─── RESIDENTIAL CUSTOMERS & SITES ────────────────────────
  console.log('  → Creating residential solar data...');
  const residentialData = [
    { code: 'SL-HOME-00001', district: 'Kandy', province: 'Central', scheme: 'NET_METERING' as const, provider: 'CEB' as const, capacity: 5.0, gen: 4.2, cons: 1.8, battery: false },
    { code: 'SL-HOME-00002', district: 'Kurunegala', province: 'North Western', scheme: 'NET_ACCOUNTING' as const, provider: 'CEB' as const, capacity: 5.0, gen: 3.8, cons: 2.1, battery: false },
    { code: 'SL-HOME-00003', district: 'Galle', province: 'Southern', scheme: 'NET_PLUS' as const, provider: 'LECO' as const, capacity: 4.0, gen: 3.2, cons: 1.6, battery: true },
    { code: 'SL-HOME-00004', district: 'Colombo', province: 'Western', scheme: 'NET_PLUS_PLUS' as const, provider: 'LECO' as const, capacity: 8.0, gen: 6.4, cons: 3.1, battery: true },
  ];

  for (const home of residentialData) {
    const customer = await prisma.residentialCustomer.create({
      data: {
        displayCode: home.code,
        utilityProvider: home.provider,
      },
    });

    const resSite = await prisma.residentialSite.create({
      data: {
        customerId: customer.id,
        siteCode: home.code,
        district: home.district,
        province: home.province,
        connectionScheme: home.scheme,
        dataSource: 'SIMULATED',
      },
    });

    await prisma.residentialSolarSystem.create({
      data: {
        siteId: resSite.id,
        solarCapacityKw: home.capacity,
        panelCount: Math.floor(home.capacity * 1000 / 450),
        panelWattageW: 450,
        inverterCapacityKw: home.capacity,
        connectionPhase: home.capacity > 5 ? 'THREE_PHASE' : 'SINGLE_PHASE',
        maxExportKw: home.capacity * 0.8,
        hasBattery: home.battery,
        batteryCapacityKwh: home.battery ? 10 : null,
      },
    });

    // Create measurements for the last 24h
    const resMeasurements = [];
    for (let h = 0; h < 24; h++) {
      const ts = new Date(now.getTime() - (23 - h) * 3600000);
      const hour = ts.getHours();
      const solarFactor = hour >= 6 && hour <= 18 ? Math.sin(((hour - 6) / 12) * Math.PI) : 0;
      resMeasurements.push({
        siteId: resSite.id,
        timestamp: ts,
        solarGenerationKw: Math.round(home.gen * solarFactor * 1000) / 1000,
        householdConsumptionKw: Math.round(home.cons * (0.6 + Math.random() * 0.8) * 1000) / 1000,
        gridImportKw: Math.max(0, home.cons - home.gen * solarFactor),
        gridExportKw: Math.max(0, home.gen * solarFactor - home.cons),
        voltageV: 230 + Math.random() * 5,
        frequencyHz: 49.95 + Math.random() * 0.1,
        batterySocPct: home.battery ? 40 + Math.random() * 50 : null,
        dataSource: 'SIMULATED',
        dataQuality: 'GOOD' as const,
      });
    }
    await prisma.residentialMeasurement.createMany({ data: resMeasurements });

    // Energy credits
    await prisma.residentialEnergyCredit.create({
      data: {
        siteId: resSite.id,
        billingPeriod: '2024-10',
        exportedKwh: (home.gen - home.cons) * 30 * 6,
        creditedKwh: (home.gen - home.cons) * 30 * 6 * 0.95,
        exportValueLkr: (home.gen - home.cons) * 30 * 6 * 22,
      },
    });
  }

  // ─── REPORT SCHEDULES ─────────────────────────────────────
  console.log('  → Creating report schedules...');
  await prisma.reportSchedule.createMany({
    data: [
      { reportType: 'FLEET_SUMMARY', cronExpr: '0 23 * * *', isActive: true, nextRunAt: new Date(now.getTime() + 86400000) },
      { reportType: 'REGULATORY', cronExpr: '0 8 1 * *', isActive: true, nextRunAt: new Date(now.getTime() + 30 * 86400000) },
    ],
  });

  // ─── GRID SNAPSHOT ────────────────────────────────────────
  console.log('  → Creating initial grid snapshot...');
  await prisma.gridSnapshot.create({
    data: {
      converged: true,
      netImportKw: -85.4,
      voltagesJson: { 1: 400.7, 2: 401.2, 3: 401.6, 4: 402.1, 5: 442.1 },
      violationsJson: { 5: 442.1 },
      lineLoadingJson: { 0: 32.4, 1: 41.8, 2: 55.2, 3: 68.7, 4: 86.4 },
      scenarioName: 'Initial baseline',
    },
  });

  console.log('\n✅ Database seeded successfully!');
  console.log('   Users: admin@thesun.lk / operator@thesun.lk / engineer@thesun.lk / viewer@thesun.lk');
  console.log('   Password: SolarAdmin2024!');
  console.log(`   Sites: ${sites.length} utility-scale solar sites`);
  console.log(`   Residential: ${residentialData.length} homes`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
