"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv = require("dotenv");
dotenv.config();
const prisma = new client_1.PrismaClient();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseSecretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});
const PASSWORD = '1234567';
const now = new Date();
const daysAgo = (d) => new Date(now.getTime() - d * 86400000);
async function createSupabaseUser(email) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: PASSWORD,
        email_confirm: true,
    });
    if (error)
        throw new Error(`Supabase createUser failed for ${email}: ${error.message}`);
    return data.user.id;
}
async function deleteAllSupabaseUsers() {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (error) {
        console.warn('Could not list Supabase users:', error.message);
        return;
    }
    for (const user of data.users) {
        await supabaseAdmin.auth.admin.deleteUser(user.id);
    }
    console.log(`Deleted ${data.users.length} Supabase auth users.`);
}
async function deleteAll() {
    console.log('Deleting all existing data...');
    await prisma.medicalEntry.deleteMany();
    await prisma.hardwareActivityLog.deleteMany();
    await prisma.delivery.deleteMany();
    await prisma.claim.deleteMany();
    await prisma.hardwareSupply.deleteMany();
    await prisma.educator.updateMany({ data: { userId: null } });
    await prisma.user.deleteMany();
    await prisma.educator.deleteMany();
    await prisma.doctorHealthcare.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.healthcare.deleteMany();
    await prisma.organization.deleteMany();
    await deleteAllSupabaseUsers();
    console.log('All data deleted.');
}
async function seedOrganizations() {
    const mec = await prisma.organization.create({
        data: { name: 'Mec', code: 'MEC-001' },
    });
    const intecmed = await prisma.organization.create({
        data: { name: 'Intecmed', code: 'INTECMED-001' },
    });
    console.log('Created 2 organizations.');
    return { mec, intecmed };
}
async function seedHealthcares(orgs) {
    const items = [
        { name: 'OSDE', code: 'HC-OSDE', organizationId: orgs.mec.id },
        { name: 'Swiss Medical', code: 'HC-SWISS', organizationId: orgs.mec.id },
        { name: 'Galeno', code: 'HC-GALENO', organizationId: orgs.intecmed.id },
        { name: 'Medifé', code: 'HC-MEDIFE', organizationId: orgs.intecmed.id },
    ];
    const created = [];
    for (const item of items) {
        created.push(await prisma.healthcare.create({ data: item }));
    }
    console.log(`Created ${created.length} healthcares.`);
    return created;
}
async function seedDoctors(orgs) {
    const items = [
        { name: 'Dr. Carlos Rodríguez', province: 'CABA', telephone: '1145678901', organizationId: orgs.mec.id },
        { name: 'Dra. María González', province: 'Buenos Aires', telephone: '1138765432', organizationId: orgs.mec.id },
        { name: 'Dr. Fernando López', province: 'CABA', telephone: '1152349876', organizationId: orgs.intecmed.id },
        { name: 'Dra. Ana Martínez', province: 'Córdoba', telephone: '3514567890', organizationId: orgs.intecmed.id },
    ];
    const created = [];
    for (const item of items) {
        created.push(await prisma.doctor.create({ data: item }));
    }
    console.log(`Created ${created.length} doctors.`);
    return created;
}
async function seedDoctorHealthcares(doctors, healthcares) {
    const pairs = [
        { doctorId: doctors[0].id, healthcareId: healthcares[0].id },
        { doctorId: doctors[0].id, healthcareId: healthcares[1].id },
        { doctorId: doctors[1].id, healthcareId: healthcares[0].id },
        { doctorId: doctors[2].id, healthcareId: healthcares[2].id },
        { doctorId: doctors[2].id, healthcareId: healthcares[3].id },
        { doctorId: doctors[3].id, healthcareId: healthcares[3].id },
    ];
    for (const pair of pairs) {
        await prisma.doctorHealthcare.create({ data: pair });
    }
    console.log(`Created ${pairs.length} doctor-healthcare links.`);
}
async function seedEducators(orgs) {
    const items = [
        { name: 'Lic. Laura Pérez', province: 'CABA', telephone: '1143210987', organizationId: orgs.mec.id },
        { name: 'Lic. Roberto Suárez', province: 'Buenos Aires', telephone: '1156781234', organizationId: orgs.mec.id },
        { name: 'Lic. Claudia Ramos', province: 'CABA', telephone: '1167894321', organizationId: orgs.intecmed.id },
        { name: 'Lic. Diego Fernández', province: 'Córdoba', telephone: '3519876543', organizationId: orgs.intecmed.id },
    ];
    const created = [];
    for (const item of items) {
        created.push(await prisma.educator.create({ data: item }));
    }
    console.log(`Created ${created.length} educators.`);
    return created;
}
async function seedUsers(orgs, healthcares, doctors, educators) {
    const usersData = [
        {
            email: 'superadmin@medtrum.com',
            role: 'superadmin',
            fullName: 'Super Admin',
            phoneNumber: '1140001111',
            dni: '25678901',
            address: 'Av. Corrientes 1234, CABA',
            birthDate: new Date('1980-01-15'),
            province: 'CABA',
        },
        {
            email: 'admin.mec@medtrum.com',
            role: 'admin',
            organizationId: orgs.mec.id,
            fullName: 'Admin Mec',
            phoneNumber: '1140002222',
            dni: '27345678',
            address: 'Av. Santa Fe 2500, CABA',
            birthDate: new Date('1985-03-20'),
            province: 'CABA',
        },
        {
            email: 'admin.intecmed@medtrum.com',
            role: 'admin',
            organizationId: orgs.intecmed.id,
            fullName: 'Admin Intecmed',
            phoneNumber: '1140003333',
            dni: '26789012',
            address: 'Av. Callao 800, CABA',
            birthDate: new Date('1983-07-10'),
            province: 'CABA',
        },
        {
            email: 'admin2.mec@medtrum.com',
            role: 'admin',
            organizationId: orgs.mec.id,
            fullName: 'Admin2 Mec',
            phoneNumber: '1140004444',
            dni: '30123456',
            address: 'Av. Cabildo 1800, CABA',
            birthDate: new Date('1990-11-05'),
            province: 'CABA',
        },
        {
            email: 'educator1.mec@medtrum.com',
            role: 'educator',
            organizationId: orgs.mec.id,
            fullName: 'Educadora Laura Pérez',
            phoneNumber: '1143210987',
            dni: '28456789',
            address: 'Av. Rivadavia 3200, CABA',
            birthDate: new Date('1988-05-12'),
            province: 'CABA',
        },
        {
            email: 'educator2.intecmed@medtrum.com',
            role: 'educator',
            organizationId: orgs.intecmed.id,
            fullName: 'Educadora Claudia Ramos',
            phoneNumber: '1167894321',
            dni: '29567890',
            address: 'Av. Belgrano 1500, CABA',
            birthDate: new Date('1992-09-25'),
            province: 'CABA',
        },
        {
            email: 'patient1.mec@medtrum.com',
            role: 'patient',
            organizationId: orgs.mec.id,
            healthcareId: healthcares[0].id,
            doctorId: doctors[0].id,
            educatorId: educators[0].id,
            fullName: 'Juan García',
            phoneNumber: '1155001001',
            dni: '35678901',
            address: 'Av. Pueyrredón 1450, CABA',
            birthDate: new Date('1995-02-14'),
            province: 'CABA',
            balanceDaysSensor: 20,
            balanceDaysParche: 12,
        },
        {
            email: 'patient2.mec@medtrum.com',
            role: 'patient',
            organizationId: orgs.mec.id,
            healthcareId: healthcares[1].id,
            doctorId: doctors[1].id,
            educatorId: educators[1].id,
            fullName: 'María López',
            phoneNumber: '1155002002',
            dni: '37890123',
            address: 'Calle Florida 520, CABA',
            birthDate: new Date('2000-06-30'),
            province: 'Buenos Aires',
            balanceDaysSensor: 10,
            balanceDaysParche: 6,
        },
        {
            email: 'patient3.mec@medtrum.com',
            role: 'patient',
            organizationId: orgs.mec.id,
            healthcareId: healthcares[0].id,
            doctorId: doctors[0].id,
            fullName: 'Pedro Martínez',
            phoneNumber: '1155003003',
            dni: '33456789',
            address: 'Av. San Martín 2300, Buenos Aires',
            birthDate: new Date('1998-12-01'),
            province: 'Buenos Aires',
            balanceDaysSensor: 0,
            balanceDaysParche: 0,
        },
        {
            email: 'patient4.intecmed@medtrum.com',
            role: 'patient',
            organizationId: orgs.intecmed.id,
            healthcareId: healthcares[2].id,
            doctorId: doctors[2].id,
            educatorId: educators[2].id,
            fullName: 'Ana Rodríguez',
            phoneNumber: '1155004004',
            dni: '36234567',
            address: 'Av. Libertador 4500, CABA',
            birthDate: new Date('1997-04-18'),
            province: 'CABA',
            balanceDaysSensor: 20,
            balanceDaysParche: 18,
        },
        {
            email: 'patient5.intecmed@medtrum.com',
            role: 'patient',
            organizationId: orgs.intecmed.id,
            healthcareId: healthcares[3].id,
            doctorId: doctors[3].id,
            educatorId: educators[3].id,
            fullName: 'Carlos Fernández',
            phoneNumber: '3515005005',
            dni: '34567890',
            address: 'Bv. San Juan 1200, Córdoba',
            birthDate: new Date('1993-08-22'),
            province: 'Córdoba',
            balanceDaysSensor: -7,
            balanceDaysParche: 3,
        },
        {
            email: 'patient6.intecmed@medtrum.com',
            role: 'patient',
            organizationId: orgs.intecmed.id,
            healthcareId: healthcares[2].id,
            doctorId: doctors[2].id,
            fullName: 'Laura Suárez',
            phoneNumber: '1155006006',
            dni: '38901234',
            address: 'Av. Scalabrini Ortiz 3100, CABA',
            birthDate: new Date('2001-10-05'),
            province: 'CABA',
            balanceDaysSensor: 7,
            balanceDaysParche: -3,
        },
    ];
    const created = {};
    const keys = [
        'superadmin', 'adminMec', 'adminIntecmed', 'admin2Mec',
        'educator1Mec', 'educator2Intecmed',
        'patient1Mec', 'patient2Mec', 'patient3Mec',
        'patient4Intecmed', 'patient5Intecmed', 'patient6Intecmed',
    ];
    for (let i = 0; i < usersData.length; i++) {
        const userData = usersData[i];
        const supabaseId = await createSupabaseUser(userData.email);
        const user = await prisma.user.create({
            data: {
                ...userData,
                supabaseId,
            },
        });
        created[keys[i]] = user;
    }
    await prisma.educator.update({
        where: { id: educators[0].id },
        data: { userId: created.educator1Mec.id },
    });
    await prisma.educator.update({
        where: { id: educators[2].id },
        data: { userId: created.educator2Intecmed.id },
    });
    console.log(`Created ${usersData.length} users (with Supabase auth).`);
    return created;
}
async function seedClaims(users) {
    const patients = [
        users.patient1Mec,
        users.patient2Mec,
        users.patient3Mec,
        users.patient4Intecmed,
        users.patient5Intecmed,
        users.patient6Intecmed,
    ];
    const resolvers = [users.adminMec, users.adminIntecmed, users.admin2Mec];
    const claimsData = [
        { userId: patients[0].id, supply: 'SENSOR', daysClaimed: 10, status: 'pending', description: 'El sensor dejó de funcionar a los 3 días', needChange: true, lotNumber: 'LOT-S001', needsReplacement: true, claimCategory: 'SENSOR', errorCode: 'SENSOR_FALLA', failureDate: daysAgo(6), colocationDate: daysAgo(9), createdAt: daysAgo(5) },
        { userId: patients[0].id, supply: 'SENSOR', daysClaimed: 10, status: 'pending', description: 'El adhesivo no pega correctamente', needChange: false, lotNumber: 'LOT-S002', needsReplacement: true, claimCategory: 'SENSOR', errorCode: 'SENSOR_FALTA_ADHESIVO', failureDate: daysAgo(13), colocationDate: daysAgo(14), createdAt: daysAgo(12) },
        { userId: patients[1].id, supply: 'SENSOR', daysClaimed: 10, status: 'pending', description: 'Diferencia mayor a 40% con glucemia capilar', needChange: false, lotNumber: 'LOT-S003', needsReplacement: false, claimCategory: 'SENSOR', errorCode: 'SENSOR_DIFERENCIA_CAPILAR', failureDate: daysAgo(9), colocationDate: daysAgo(12), createdAt: daysAgo(8) },
        { userId: patients[1].id, supply: 'SENSOR', daysClaimed: 10, status: 'approved', description: 'Sensor se perdió durante actividad deportiva', needChange: true, lotNumber: 'LOT-S004', needsReplacement: true, claimCategory: 'SENSOR', errorCode: 'SENSOR_PERDIDO', failureDate: daysAgo(27), colocationDate: daysAgo(30), resolvedById: resolvers[0].id, resolvedAt: daysAgo(18), resolutionMessage: 'Se aprueba reposición del sensor', balanceAfterResolution: 20, createdAt: daysAgo(25) },
        { userId: patients[2].id, supply: 'SENSOR', daysClaimed: 10, status: 'approved', description: 'Error desconocido en lectura del sensor', needChange: false, lotNumber: 'LOT-S005', needsReplacement: true, claimCategory: 'SENSOR', errorCode: 'SENSOR_DESCONOCIDO', failureDate: daysAgo(44), colocationDate: daysAgo(48), resolvedById: resolvers[0].id, resolvedAt: daysAgo(35), resolutionMessage: 'Aprobado, se repone sensor', balanceAfterResolution: 10, createdAt: daysAgo(42) },
        { userId: patients[2].id, supply: 'SENSOR', daysClaimed: 10, status: 'rejected', description: 'Sangrado leve en la colocación', needChange: false, lotNumber: 'LOT-S006', needsReplacement: false, claimCategory: 'SENSOR', errorCode: 'SENSOR_SANGRADO_COLOCACION', failureDate: daysAgo(22), colocationDate: daysAgo(22), resolvedById: resolvers[2].id, resolvedAt: daysAgo(15), resolutionMessage: 'El sangrado leve no amerita reposición', createdAt: daysAgo(20) },
        { userId: patients[0].id, supply: 'SENSOR', daysClaimed: 10, status: 'rejected', description: 'Otro problema con el sensor', needChange: true, lotNumber: 'LOT-S007', needsReplacement: false, claimCategory: 'SENSOR', errorCode: 'SENSOR_OTROS', failureDate: daysAgo(57), colocationDate: daysAgo(60), resolvedById: resolvers[0].id, resolvedAt: daysAgo(50), resolutionMessage: 'Descripción insuficiente para aprobar', createdAt: daysAgo(55) },
        { userId: patients[0].id, supply: 'PARCHE_200U', daysClaimed: 3, status: 'pending', description: 'Parche no adhiere a la piel', needChange: true, lotNumber: 'LOT-P001', needsReplacement: true, claimCategory: 'PARCHE_200U', errorCode: 'PARCHE_FALTA_ADHESIVO', failureDate: daysAgo(4), colocationDate: daysAgo(4), createdAt: daysAgo(3) },
        { userId: patients[4].id, supply: 'PARCHE_200U', daysClaimed: 3, status: 'approved', description: 'Batería se agotó antes de tiempo', needChange: false, lotNumber: 'LOT-P004', needsReplacement: true, claimCategory: 'PARCHE_200U', errorCode: 'PARCHE_BATERIA_AGOTADA', failureDate: daysAgo(30), colocationDate: daysAgo(31), resolvedById: resolvers[1].id, resolvedAt: daysAgo(22), resolutionMessage: 'Aprobado, batería defectuosa confirmada', balanceAfterResolution: 24, createdAt: daysAgo(28) },
        { userId: patients[4].id, supply: 'PARCHE_200U', daysClaimed: 3, status: 'approved', description: 'Error durante el cebado', needChange: true, lotNumber: 'LOT-P005', needsReplacement: true, claimCategory: 'PARCHE_200U', errorCode: 'PARCHE_ERROR_CEBADO', failureDate: daysAgo(47), colocationDate: daysAgo(48), resolvedById: resolvers[1].id, resolvedAt: daysAgo(40), resolutionMessage: 'Aprobado, error de cebado verificado', balanceAfterResolution: 21, createdAt: daysAgo(45) },
        { userId: patients[0].id, supply: 'PARCHE_200U', daysClaimed: 3, status: 'rejected', description: 'Parche se desactivó solo', needChange: false, lotNumber: 'LOT-P006', needsReplacement: false, claimCategory: 'PARCHE_200U', errorCode: 'PARCHE_DESACTIVADO', failureDate: daysAgo(37), colocationDate: daysAgo(38), resolvedById: resolvers[0].id, resolvedAt: daysAgo(30), resolutionMessage: 'Desactivación fue por manipulación incorrecta', createdAt: daysAgo(35) },
        { userId: patients[3].id, supply: 'PARCHE_300U', daysClaimed: 3, status: 'pending', description: 'Error en la pantalla del parche', needChange: false, lotNumber: 'LOT-P002', needsReplacement: true, claimCategory: 'PARCHE_300U', errorCode: 'PARCHE_ERROR', failureDate: daysAgo(7), colocationDate: daysAgo(8), createdAt: daysAgo(6) },
        { userId: patients[3].id, supply: 'PARCHE_300U', daysClaimed: 3, status: 'pending', description: 'Obstrucción en la cánula', needChange: true, lotNumber: 'LOT-P003', needsReplacement: true, claimCategory: 'PARCHE_300U', errorCode: 'PARCHE_OBSTRUCCION', failureDate: daysAgo(16), colocationDate: daysAgo(17), createdAt: daysAgo(15) },
        { userId: patients[3].id, supply: 'PARCHE_300U', daysClaimed: 3, status: 'rejected', description: 'Otro problema con el parche', needChange: false, lotNumber: 'LOT-P007', needsReplacement: false, claimCategory: 'PARCHE_300U', errorCode: 'PARCHE_OTROS', failureDate: daysAgo(15), colocationDate: daysAgo(16), resolvedById: resolvers[1].id, resolvedAt: daysAgo(10), resolutionMessage: 'No se pudo reproducir el problema', createdAt: daysAgo(14) },
        { userId: patients[1].id, supply: 'TRANSMISOR', daysClaimed: 0, status: 'pending', description: 'Conectores del transmisor están oxidados', needChange: true, lotNumber: 'LOT-T001', needsReplacement: true, claimCategory: 'TRANSMISOR', errorCode: 'TRANSMISOR_CONECTORES_OXIDADOS', createdAt: daysAgo(4) },
        { userId: patients[3].id, supply: 'TRANSMISOR', daysClaimed: 0, status: 'pending', description: 'La luz verde no parpadea al conectar', needChange: true, lotNumber: 'LOT-T002', needsReplacement: true, claimCategory: 'TRANSMISOR', errorCode: 'TRANSMISOR_LUZ_VERDE_NO_PARPADEA', createdAt: daysAgo(9) },
        { userId: patients[1].id, supply: 'TRANSMISOR', daysClaimed: 0, status: 'approved', description: 'Problemas con la batería del transmisor', needChange: false, lotNumber: 'LOT-T003', needsReplacement: true, claimCategory: 'TRANSMISOR', errorCode: 'TRANSMISOR_PROBLEMAS_BATERIA', resolvedById: resolvers[0].id, resolvedAt: daysAgo(48), resolutionMessage: 'Aprobado, se envía transmisor de reemplazo', createdAt: daysAgo(55) },
        { userId: patients[3].id, supply: 'TRANSMISOR', daysClaimed: 0, status: 'approved', description: 'Transmisor roto por caída', needChange: true, lotNumber: 'LOT-T004', needsReplacement: true, claimCategory: 'TRANSMISOR', errorCode: 'TRANSMISOR_ROTURA', resolvedById: resolvers[1].id, resolvedAt: daysAgo(25), resolutionMessage: 'Aprobado, rotura confirmada por fotos', createdAt: daysAgo(30) },
        { userId: patients[1].id, supply: 'TRANSMISOR', daysClaimed: 0, status: 'rejected', description: 'Otro problema con el transmisor', needChange: false, lotNumber: 'LOT-T005', needsReplacement: false, claimCategory: 'TRANSMISOR', errorCode: 'TRANSMISOR_OTROS', resolvedById: resolvers[0].id, resolvedAt: daysAgo(60), resolutionMessage: 'Se requiere más información para evaluar', createdAt: daysAgo(65) },
        { userId: patients[4].id, supply: 'BASE_BOMBA_200U', daysClaimed: 0, status: 'pending', description: 'La base no encastra en el parche', needChange: true, lotNumber: 'LOT-BB002', needsReplacement: true, claimCategory: 'BASE_BOMBA_200U', errorCode: 'BASE_BOMBA_NO_ENCASTRA', createdAt: daysAgo(11) },
        { userId: patients[4].id, supply: 'BASE_BOMBA_200U', daysClaimed: 0, status: 'approved', description: 'Rotura de la base bomba', needChange: true, lotNumber: 'LOT-BB004', needsReplacement: true, claimCategory: 'BASE_BOMBA_200U', errorCode: 'BASE_BOMBA_ROTURA', resolvedById: resolvers[1].id, resolvedAt: daysAgo(32), resolutionMessage: 'Aprobado, se envía reemplazo', createdAt: daysAgo(38) },
        { userId: patients[2].id, supply: 'BASE_BOMBA_300U', daysClaimed: 0, status: 'pending', description: 'Conectores de la base bomba oxidados', needChange: true, lotNumber: 'LOT-BB001', needsReplacement: true, claimCategory: 'BASE_BOMBA_300U', errorCode: 'BASE_BOMBA_CONECTORES_OXIDADOS', createdAt: daysAgo(7) },
        { userId: patients[2].id, supply: 'BASE_BOMBA_300U', daysClaimed: 0, status: 'approved', description: 'La base bomba no emite pitidos', needChange: false, lotNumber: 'LOT-BB003', needsReplacement: true, claimCategory: 'BASE_BOMBA_300U', errorCode: 'BASE_BOMBA_NO_HACE_PITIDOS', resolvedById: resolvers[0].id, resolvedAt: daysAgo(52), resolutionMessage: 'Aprobado, falla de altavoz confirmada', createdAt: daysAgo(58) },
        { userId: patients[2].id, supply: 'BASE_BOMBA_300U', daysClaimed: 0, status: 'rejected', description: 'Otro problema con la base bomba', needChange: false, lotNumber: 'LOT-BB005', needsReplacement: false, claimCategory: 'BASE_BOMBA_300U', errorCode: 'BASE_BOMBA_OTROS', resolvedById: resolvers[2].id, resolvedAt: daysAgo(20), resolutionMessage: 'Problema no reproducible', createdAt: daysAgo(24) },
        { userId: patients[0].id, supply: 'CABLE_TRANSMISOR', daysClaimed: 0, status: 'pending', description: 'El cable no carga el transmisor', needChange: true, lotNumber: 'LOT-CT001', needsReplacement: true, claimCategory: 'CABLE_TRANSMISOR', errorCode: 'CABLE_NO_CARGA', createdAt: daysAgo(2) },
        { userId: patients[5].id, supply: 'CABLE_TRANSMISOR', daysClaimed: 0, status: 'approved', description: 'Pin del cable doblado', needChange: true, lotNumber: 'LOT-CT002', needsReplacement: true, claimCategory: 'CABLE_TRANSMISOR', errorCode: 'CABLE_PIN_DOBLADO', resolvedById: resolvers[1].id, resolvedAt: daysAgo(36), resolutionMessage: 'Aprobado, pin doblado visible en foto', createdAt: daysAgo(42) },
        { userId: patients[5].id, supply: 'CABLE_TRANSMISOR', daysClaimed: 0, status: 'rejected', description: 'Otro problema con el cable', needChange: false, lotNumber: 'LOT-CT003', needsReplacement: false, claimCategory: 'CABLE_TRANSMISOR', errorCode: 'CABLE_OTROS', resolvedById: resolvers[1].id, resolvedAt: daysAgo(8), resolutionMessage: 'Cable funciona correctamente según pruebas', createdAt: daysAgo(13) },
        { userId: patients[1].id, supply: 'PDM', daysClaimed: 0, status: 'pending', description: 'PDM no carga ni enciende', needChange: true, lotNumber: 'LOT-PDM001', needsReplacement: true, claimCategory: 'PDM', errorCode: 'PDM_NO_CARGA_NO_ENCIENDE', createdAt: daysAgo(6) },
        { userId: patients[5].id, supply: 'PDM', daysClaimed: 0, status: 'pending', description: 'PDM se apaga solo constantemente', needChange: true, lotNumber: 'LOT-PDM002', needsReplacement: true, claimCategory: 'PDM', errorCode: 'PDM_SE_APAGA_SOLO', createdAt: daysAgo(10) },
        { userId: patients[1].id, supply: 'PDM', daysClaimed: 0, status: 'approved', description: 'PDM no carga la batería', needChange: false, lotNumber: 'LOT-PDM003', needsReplacement: true, claimCategory: 'PDM', errorCode: 'PDM_NO_CARGA', resolvedById: resolvers[0].id, resolvedAt: daysAgo(44), resolutionMessage: 'Aprobado, falla de carga confirmada', createdAt: daysAgo(50) },
        { userId: patients[5].id, supply: 'PDM', daysClaimed: 0, status: 'approved', description: 'PDM con pantalla rota', needChange: true, lotNumber: 'LOT-PDM004', needsReplacement: true, claimCategory: 'PDM', errorCode: 'PDM_ROTURA', resolvedById: resolvers[1].id, resolvedAt: daysAgo(18), resolutionMessage: 'Aprobado, rotura evidente', createdAt: daysAgo(23) },
        { userId: patients[1].id, supply: 'PDM', daysClaimed: 0, status: 'rejected', description: 'Otro problema con PDM', needChange: false, lotNumber: 'LOT-PDM005', needsReplacement: false, claimCategory: 'PDM', errorCode: 'PDM_OTROS', resolvedById: resolvers[0].id, resolvedAt: daysAgo(14), resolutionMessage: 'Problema no identificable, se solicita revisión presencial', createdAt: daysAgo(19) },
    ];
    const created = [];
    for (const claim of claimsData) {
        created.push(await prisma.claim.create({ data: claim }));
    }
    console.log(`Created ${created.length} claims.`);
    return created;
}
async function seedHardwareSupplies(users, orgs) {
    const items = [
        { type: 'Bomba_200u', serialNumber: 'BOM200-001', status: 'active', userId: users.patient1Mec.id, organizationId: orgs.mec.id, assignedDate: daysAgo(82) },
        { type: 'Transmisor', serialNumber: 'TRANS-001', status: 'active', userId: users.patient1Mec.id, organizationId: orgs.mec.id, assignedDate: daysAgo(82) },
        { type: 'Cable_transmisor', serialNumber: 'CABLE-001', status: 'active', userId: users.patient1Mec.id, organizationId: orgs.mec.id, assignedDate: daysAgo(82) },
        { type: 'Bomba_200u', serialNumber: 'BOM200-002', status: 'active', userId: users.patient2Mec.id, organizationId: orgs.mec.id, assignedDate: daysAgo(75) },
        { type: 'Transmisor', serialNumber: 'TRANS-002', status: 'active', userId: users.patient2Mec.id, organizationId: orgs.mec.id, assignedDate: daysAgo(75) },
        { type: 'Cable_transmisor', serialNumber: 'CABLE-002', status: 'active', userId: users.patient2Mec.id, organizationId: orgs.mec.id, assignedDate: daysAgo(75) },
        { type: 'Bomba_300u', serialNumber: 'BOM300-001', status: 'active', userId: users.patient3Mec.id, organizationId: orgs.mec.id, assignedDate: daysAgo(68) },
        { type: 'Transmisor', serialNumber: 'TRANS-003', status: 'active', userId: users.patient3Mec.id, organizationId: orgs.mec.id, assignedDate: daysAgo(68) },
        { type: 'Cable_transmisor', serialNumber: 'CABLE-003', status: 'active', userId: users.patient3Mec.id, organizationId: orgs.mec.id, assignedDate: daysAgo(68) },
        { type: 'Bomba_300u', serialNumber: 'BOM300-002', status: 'active', userId: users.patient4Intecmed.id, organizationId: orgs.intecmed.id, assignedDate: daysAgo(60) },
        { type: 'Transmisor', serialNumber: 'TRANS-004', status: 'active', userId: users.patient4Intecmed.id, organizationId: orgs.intecmed.id, assignedDate: daysAgo(60) },
        { type: 'Cable_transmisor', serialNumber: 'CABLE-004', status: 'active', userId: users.patient4Intecmed.id, organizationId: orgs.intecmed.id, assignedDate: daysAgo(60) },
        { type: 'Bomba_200u', serialNumber: 'BOM200-003', status: 'active', userId: users.patient5Intecmed.id, organizationId: orgs.intecmed.id, assignedDate: daysAgo(55) },
        { type: 'Transmisor', serialNumber: 'TRANS-005', status: 'active', userId: users.patient5Intecmed.id, organizationId: orgs.intecmed.id, assignedDate: daysAgo(55) },
        { type: 'Cable_transmisor', serialNumber: 'CABLE-005', status: 'active', userId: users.patient5Intecmed.id, organizationId: orgs.intecmed.id, assignedDate: daysAgo(55) },
        { type: 'Bomba_300u', serialNumber: 'BOM300-003', status: 'active', userId: users.patient6Intecmed.id, organizationId: orgs.intecmed.id, assignedDate: daysAgo(48) },
        { type: 'Transmisor', serialNumber: 'TRANS-006', status: 'active', userId: users.patient6Intecmed.id, organizationId: orgs.intecmed.id, assignedDate: daysAgo(48) },
        { type: 'Cable_transmisor', serialNumber: 'CABLE-006', status: 'active', userId: users.patient6Intecmed.id, organizationId: orgs.intecmed.id, assignedDate: daysAgo(48) },
        { type: 'PDM', serialNumber: 'PDM-001', status: 'active', userId: users.patient1Mec.id, organizationId: orgs.mec.id, assignedDate: daysAgo(82) },
        { type: 'PDM', serialNumber: 'PDM-002', status: 'inactive', organizationId: orgs.intecmed.id },
    ];
    const created = [];
    for (const item of items) {
        created.push(await prisma.hardwareSupply.create({ data: item }));
    }
    console.log(`Created ${created.length} hardware supplies.`);
    return created;
}
async function seedDeliveries(users, orgs, claims) {
    const mecPatientIds = [users.patient1Mec.id, users.patient2Mec.id, users.patient3Mec.id];
    const getOrgId = (userId) => mecPatientIds.includes(userId) ? orgs.mec.id : orgs.intecmed.id;
    const categoryToItemName = {
        SENSOR: 'Sensor',
        PARCHE_200U: 'Parche 200u',
        PARCHE_300U: 'Parche 300u',
        TRANSMISOR: 'Transmisor',
        BASE_BOMBA_200U: 'Base Bomba 200u',
        BASE_BOMBA_300U: 'Base Bomba 300u',
        CABLE_TRANSMISOR: 'Cable Transmisor',
        PDM: 'PDM',
    };
    const items = [
        { type: 'supply_delivery', userId: users.patient1Mec.id, organizationId: orgs.mec.id, quantity: 3, daysReimbursed: 30, itemName: 'Sensor', date: daysAgo(78), assignedById: users.adminMec.id, observations: 'Entrega inicial de sensores', createdAt: daysAgo(78) },
        { type: 'supply_delivery', userId: users.patient1Mec.id, organizationId: orgs.mec.id, quantity: 5, daysReimbursed: 15, itemName: 'Parche 200u', date: daysAgo(76), assignedById: users.adminMec.id, observations: 'Entrega inicial de parches', createdAt: daysAgo(76) },
        { type: 'supply_delivery', userId: users.patient2Mec.id, organizationId: orgs.mec.id, quantity: 3, daysReimbursed: 30, itemName: 'Sensor', date: daysAgo(72), assignedById: users.adminMec.id, observations: 'Entrega mensual regular', createdAt: daysAgo(72) },
        { type: 'supply_delivery', userId: users.patient2Mec.id, organizationId: orgs.mec.id, quantity: 4, daysReimbursed: 12, itemName: 'Parche 200u', date: daysAgo(70), assignedById: users.admin2Mec.id, observations: 'Entrega mensual regular', createdAt: daysAgo(70) },
        { type: 'supply_delivery', userId: users.patient3Mec.id, organizationId: orgs.mec.id, quantity: 1, daysReimbursed: 10, itemName: 'Sensor', date: daysAgo(65), assignedById: users.adminMec.id, observations: 'Entrega puntual', createdAt: daysAgo(65) },
        { type: 'supply_delivery', userId: users.patient3Mec.id, organizationId: orgs.mec.id, quantity: 3, daysReimbursed: 9, itemName: 'Parche 300u', date: daysAgo(63), assignedById: users.admin2Mec.id, observations: 'Entrega mensual regular', createdAt: daysAgo(63) },
        { type: 'supply_delivery', userId: users.patient4Intecmed.id, organizationId: orgs.intecmed.id, quantity: 3, daysReimbursed: 30, itemName: 'Sensor', date: daysAgo(58), assignedById: users.adminIntecmed.id, observations: 'Entrega mensual regular', createdAt: daysAgo(58) },
        { type: 'supply_delivery', userId: users.patient4Intecmed.id, organizationId: orgs.intecmed.id, quantity: 5, daysReimbursed: 15, itemName: 'Parche 300u', date: daysAgo(56), assignedById: users.adminIntecmed.id, observations: 'Entrega inicial de parches', createdAt: daysAgo(56) },
        { type: 'supply_delivery', userId: users.patient5Intecmed.id, organizationId: orgs.intecmed.id, quantity: 1, daysReimbursed: 10, itemName: 'Sensor', date: daysAgo(52), assignedById: users.adminIntecmed.id, observations: 'Entrega puntual', createdAt: daysAgo(52) },
        { type: 'supply_delivery', userId: users.patient5Intecmed.id, organizationId: orgs.intecmed.id, quantity: 3, daysReimbursed: 9, itemName: 'Parche 200u', date: daysAgo(50), assignedById: users.adminIntecmed.id, observations: 'Entrega mensual regular', createdAt: daysAgo(50) },
        { type: 'supply_delivery', userId: users.patient6Intecmed.id, organizationId: orgs.intecmed.id, quantity: 3, daysReimbursed: 30, itemName: 'Sensor', date: daysAgo(45), assignedById: users.adminIntecmed.id, observations: 'Entrega mensual regular', createdAt: daysAgo(45) },
        { type: 'supply_delivery', userId: users.patient6Intecmed.id, organizationId: orgs.intecmed.id, quantity: 4, daysReimbursed: 12, itemName: 'Parche 300u', date: daysAgo(43), assignedById: users.adminIntecmed.id, observations: 'Entrega mensual regular', createdAt: daysAgo(43) },
        { type: 'supply_delivery', userId: users.patient1Mec.id, organizationId: orgs.mec.id, quantity: 3, daysReimbursed: 30, itemName: 'Sensor', date: daysAgo(32), assignedById: users.adminMec.id, observations: 'Entrega mensual regular', createdAt: daysAgo(32) },
        { type: 'supply_delivery', userId: users.patient1Mec.id, organizationId: orgs.mec.id, quantity: 4, daysReimbursed: 12, itemName: 'Parche 200u', date: daysAgo(30), assignedById: users.adminMec.id, observations: 'Entrega mensual regular', createdAt: daysAgo(30) },
        { type: 'supply_delivery', userId: users.patient2Mec.id, organizationId: orgs.mec.id, quantity: 1, daysReimbursed: 10, itemName: 'Sensor', date: daysAgo(25), assignedById: users.admin2Mec.id, observations: 'Entrega puntual', createdAt: daysAgo(25) },
        { type: 'supply_delivery', userId: users.patient4Intecmed.id, organizationId: orgs.intecmed.id, quantity: 3, daysReimbursed: 30, itemName: 'Sensor', date: daysAgo(18), assignedById: users.adminIntecmed.id, observations: 'Entrega mensual regular', createdAt: daysAgo(18) },
        { type: 'supply_delivery', userId: users.patient5Intecmed.id, organizationId: orgs.intecmed.id, quantity: 3, daysReimbursed: 9, itemName: 'Parche 200u', date: daysAgo(12), assignedById: users.adminIntecmed.id, observations: 'Entrega mensual regular', createdAt: daysAgo(12) },
        { type: 'supply_delivery', userId: users.patient3Mec.id, organizationId: orgs.mec.id, quantity: 3, daysReimbursed: 30, itemName: 'Sensor', date: daysAgo(8), assignedById: users.adminMec.id, observations: 'Entrega mensual regular', createdAt: daysAgo(8) },
        { type: 'supply_delivery', userId: users.patient6Intecmed.id, organizationId: orgs.intecmed.id, quantity: 1, daysReimbursed: 10, itemName: 'Sensor', date: daysAgo(3), assignedById: users.adminIntecmed.id, observations: 'Entrega puntual', createdAt: daysAgo(3) },
    ];
    const approvedClaims = claims.filter(c => c.status === 'approved');
    for (const claim of approvedClaims) {
        const category = claim.claimCategory;
        const isSensorOrParche = category === 'SENSOR' || category === 'PARCHE_200U' || category === 'PARCHE_300U';
        items.push({
            type: 'claim_reimbursement',
            userId: claim.userId,
            organizationId: getOrgId(claim.userId),
            quantity: 1,
            daysReimbursed: isSensorOrParche ? claim.daysClaimed : null,
            itemName: categoryToItemName[category] || category,
            claimId: claim.id,
            date: new Date(claim.resolvedAt.getTime() + 86400000),
            assignedById: claim.resolvedById,
            observations: `Reposición por reclamo aprobado - ${categoryToItemName[category] || category}`,
            createdAt: new Date(claim.resolvedAt.getTime() + 86400000),
        });
    }
    const created = [];
    for (const item of items) {
        created.push(await prisma.delivery.create({ data: item }));
    }
    console.log(`Created ${created.length} deliveries (${items.length - approvedClaims.length} supply + ${approvedClaims.length} claim reimbursements).`);
    return created;
}
async function seedHardwareActivityLogs(hardware, users) {
    const items = [
        { hardwareId: hardware[0].id, type: 'assignment', userId: users.adminMec.id, date: daysAgo(82), newUserId: users.patient1Mec.id, observations: 'Asignación inicial de bomba 200u' },
        { hardwareId: hardware[1].id, type: 'assignment', userId: users.adminMec.id, date: daysAgo(82), newUserId: users.patient1Mec.id, observations: 'Asignación inicial de transmisor' },
        { hardwareId: hardware[3].id, type: 'assignment', userId: users.adminMec.id, date: daysAgo(75), newUserId: users.patient2Mec.id, observations: 'Asignación inicial de bomba 200u' },
        { hardwareId: hardware[9].id, type: 'assignment', userId: users.adminIntecmed.id, date: daysAgo(60), newUserId: users.patient4Intecmed.id, observations: 'Asignación inicial de bomba 300u' },
        { hardwareId: hardware[12].id, type: 'assignment', userId: users.adminIntecmed.id, date: daysAgo(55), newUserId: users.patient5Intecmed.id, observations: 'Asignación inicial de bomba 200u' },
        { hardwareId: hardware[18].id, type: 'assignment', userId: users.adminMec.id, date: daysAgo(82), newUserId: users.patient1Mec.id, observations: 'Asignación de PDM' },
        { hardwareId: hardware[3].id, type: 'transfer', userId: users.adminMec.id, date: daysAgo(40), previousUserId: users.patient1Mec.id, newUserId: users.patient2Mec.id, observations: 'Transferencia por cambio de equipo' },
        { hardwareId: hardware[13].id, type: 'transfer', userId: users.adminIntecmed.id, date: daysAgo(28), previousUserId: users.patient4Intecmed.id, newUserId: users.patient5Intecmed.id, observations: 'Transferencia temporal de transmisor' },
    ];
    for (const item of items) {
        await prisma.hardwareActivityLog.create({ data: item });
    }
    console.log(`Created ${items.length} hardware activity logs.`);
}
async function seedMedicalEntries(users) {
    const items = [
        { patientId: users.patient1Mec.id, createdById: users.educator1Mec.id, visitDate: daysAgo(70), notes: 'Control de rutina. Glucemias estables entre 80-150 mg/dl. Se refuerza educación sobre conteo de carbohidratos.' },
        { patientId: users.patient1Mec.id, createdById: users.adminMec.id, visitDate: daysAgo(42), notes: 'Revisión de equipo. Bomba funcionando correctamente. Se ajusta dosis basal nocturna de 0.8 a 0.9 U/h.' },
        { patientId: users.patient1Mec.id, createdById: users.educator1Mec.id, visitDate: daysAgo(14), notes: 'Seguimiento. HbA1c: 7.0%. Tiempo en rango: 72%. Buen manejo general, reforzar pre-bolus.' },
        { patientId: users.patient2Mec.id, createdById: users.adminMec.id, visitDate: daysAgo(60), notes: 'Primera consulta post inicio de bomba. Paciente adaptándose bien. HbA1c: 7.2%. Tiempo en rango: 65%.' },
        { patientId: users.patient2Mec.id, createdById: users.admin2Mec.id, visitDate: daysAgo(28), notes: 'Control mensual. Mejoría en tiempo en rango: 70%. Se mantiene esquema actual.' },
        { patientId: users.patient3Mec.id, createdById: users.adminMec.id, visitDate: daysAgo(50), notes: 'Control trimestral. HbA1c: 7.5%. Hiperglucemias post-cena frecuentes. Se ajusta ratio de cena.' },
        { patientId: users.patient4Intecmed.id, createdById: users.educator2Intecmed.id, visitDate: daysAgo(55), notes: 'Educación sobre manejo de hipoglucemias. Se entregan glucagón y se explica protocolo. Paciente comprende indicaciones.' },
        { patientId: users.patient4Intecmed.id, createdById: users.adminIntecmed.id, visitDate: daysAgo(22), notes: 'Control trimestral. HbA1c: 6.8%. Excelente adherencia al tratamiento. Tiempo en rango: 78%.' },
        { patientId: users.patient5Intecmed.id, createdById: users.adminIntecmed.id, visitDate: daysAgo(45), notes: 'Consulta por hiperglucemias recurrentes post almuerzo. Se ajusta ratio I:C de almuerzo de 1:10 a 1:8.' },
        { patientId: users.patient5Intecmed.id, createdById: users.educator2Intecmed.id, visitDate: daysAgo(15), notes: 'Seguimiento. Mejoría notable en glucemias post-almuerzo. Se refuerza educación sobre ejercicio y ajuste de dosis.' },
        { patientId: users.patient6Intecmed.id, createdById: users.adminIntecmed.id, visitDate: daysAgo(35), notes: 'Primera consulta. Paciente joven, buena predisposición. Se configura bomba con esquema inicial conservador.' },
    ];
    for (const item of items) {
        await prisma.medicalEntry.create({ data: item });
    }
    console.log(`Created ${items.length} medical entries.`);
}
async function main() {
    console.log('=== MEDTRUM SEED START ===\n');
    await deleteAll();
    const orgs = await seedOrganizations();
    const healthcares = await seedHealthcares(orgs);
    const doctors = await seedDoctors(orgs);
    await seedDoctorHealthcares(doctors, healthcares);
    const educators = await seedEducators(orgs);
    const users = await seedUsers(orgs, healthcares, doctors, educators);
    const claims = await seedClaims(users);
    const hardware = await seedHardwareSupplies(users, orgs);
    await seedDeliveries(users, orgs, claims);
    await seedHardwareActivityLogs(hardware, users);
    await seedMedicalEntries(users);
    console.log('\n=== MEDTRUM SEED COMPLETE ===');
    console.log('All users password: 1234567');
}
main()
    .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map