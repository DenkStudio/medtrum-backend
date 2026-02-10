"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function randomDate(start, end) {
    const time = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    return new Date(time);
}
function daysAgo(date, min, max) {
    const days = min + Math.floor(Math.random() * (max - min));
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
}
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function rand(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}
const PARCHE_ERRORS = [
    client_1.ClaimErrorCode.PARCHE_FALTA_ADHESIVO,
    client_1.ClaimErrorCode.PARCHE_ERROR,
    client_1.ClaimErrorCode.PARCHE_OBSTRUCCION,
    client_1.ClaimErrorCode.PARCHE_BATERIA_AGOTADA,
    client_1.ClaimErrorCode.PARCHE_ERROR_CEBADO,
    client_1.ClaimErrorCode.PARCHE_DESACTIVADO,
    client_1.ClaimErrorCode.PARCHE_OTROS,
];
const BASE_BOMBA_ERRORS = [
    client_1.ClaimErrorCode.BASE_BOMBA_CONECTORES_OXIDADOS,
    client_1.ClaimErrorCode.BASE_BOMBA_NO_ENCASTRA,
    client_1.ClaimErrorCode.BASE_BOMBA_NO_HACE_PITIDOS,
    client_1.ClaimErrorCode.BASE_BOMBA_ROTURA,
    client_1.ClaimErrorCode.BASE_BOMBA_OTROS,
];
const SENSOR_ERRORS = [
    client_1.ClaimErrorCode.SENSOR_FALLA,
    client_1.ClaimErrorCode.SENSOR_FALTA_ADHESIVO,
    client_1.ClaimErrorCode.SENSOR_DIFERENCIA_CAPILAR,
    client_1.ClaimErrorCode.SENSOR_PERDIDO,
    client_1.ClaimErrorCode.SENSOR_DESCONOCIDO,
    client_1.ClaimErrorCode.SENSOR_SANGRADO_COLOCACION,
    client_1.ClaimErrorCode.SENSOR_OTROS,
];
const TRANSMISOR_ERRORS = [
    client_1.ClaimErrorCode.TRANSMISOR_CONECTORES_OXIDADOS,
    client_1.ClaimErrorCode.TRANSMISOR_LUZ_VERDE_NO_PARPADEA,
    client_1.ClaimErrorCode.TRANSMISOR_PROBLEMAS_BATERIA,
    client_1.ClaimErrorCode.TRANSMISOR_ROTURA,
    client_1.ClaimErrorCode.TRANSMISOR_OTROS,
];
const CABLE_ERRORS = [
    client_1.ClaimErrorCode.CABLE_NO_CARGA,
    client_1.ClaimErrorCode.CABLE_PIN_DOBLADO,
    client_1.ClaimErrorCode.CABLE_OTROS,
];
const PDM_ERRORS = [
    client_1.ClaimErrorCode.PDM_NO_CARGA_NO_ENCIENDE,
    client_1.ClaimErrorCode.PDM_SE_APAGA_SOLO,
    client_1.ClaimErrorCode.PDM_NO_CARGA,
    client_1.ClaimErrorCode.PDM_ROTURA,
    client_1.ClaimErrorCode.PDM_OTROS,
];
const STATUSES = ["pending", "approved", "rejected"];
function pickStatus() {
    const r = Math.random();
    if (r < 0.45)
        return "approved";
    if (r < 0.80)
        return "pending";
    return "rejected";
}
function getSupplyAndCategory(product, pumpType) {
    switch (product) {
        case "PARCHE":
            return pumpType === "Bomba_200u"
                ? { supply: client_1.SupplyType.PARCHE_200U, category: client_1.ClaimCategory.PARCHE_200U, errors: PARCHE_ERRORS }
                : { supply: client_1.SupplyType.PARCHE_300U, category: client_1.ClaimCategory.PARCHE_300U, errors: PARCHE_ERRORS };
        case "BASE_BOMBA":
            return pumpType === "Bomba_200u"
                ? { supply: client_1.SupplyType.BASE_BOMBA_200U, category: client_1.ClaimCategory.BASE_BOMBA_200U, errors: BASE_BOMBA_ERRORS }
                : { supply: client_1.SupplyType.BASE_BOMBA_300U, category: client_1.ClaimCategory.BASE_BOMBA_300U, errors: BASE_BOMBA_ERRORS };
        case "SENSOR":
            return { supply: client_1.SupplyType.SENSOR, category: client_1.ClaimCategory.SENSOR, errors: SENSOR_ERRORS };
        case "TRANSMISOR":
            return { supply: client_1.SupplyType.TRANSMISOR, category: client_1.ClaimCategory.TRANSMISOR, errors: TRANSMISOR_ERRORS };
        case "CABLE_TRANSMISOR":
            return { supply: client_1.SupplyType.CABLE_TRANSMISOR, category: client_1.ClaimCategory.CABLE_TRANSMISOR, errors: CABLE_ERRORS };
        case "PDM":
            return { supply: client_1.SupplyType.PDM, category: client_1.ClaimCategory.PDM, errors: PDM_ERRORS };
    }
}
const DESCRIPTIONS = {
    SENSOR: [
        "El sensor dejó de funcionar al segundo día",
        "Se despegó durante la noche",
        "Lectura incorrecta constante, diferencia de más de 40%",
        "Sangrado excesivo al colocarlo",
        "No se pudo activar correctamente",
        "Error de lectura intermitente",
    ],
    PARCHE: [
        "Se despegó antes de las 48 horas",
        "Error de cebado al iniciar",
        "La batería se agotó al día 2",
        "Obstrucción reportada, no infunde insulina",
        "Se desactivó solo durante la noche",
        "El adhesivo no pegó bien desde el inicio",
        "Fallo intermitente en la infusión",
    ],
    TRANSMISOR: [
        "Los conectores están oxidados, no carga",
        "La luz verde dejó de parpadear",
        "Problemas con la batería, no mantiene carga",
        "Se rompió la carcasa",
        "Dejó de sincronizar con el PDM",
    ],
    BASE_BOMBA: [
        "No encastra correctamente con el parche",
        "No hace pitidos de confirmación",
        "Conectores oxidados visibles",
        "Se rompió la pestaña de enganche",
        "No funciona correctamente al conectar",
    ],
    CABLE_TRANSMISOR: [
        "El cable no carga el transmisor",
        "El pin está doblado y no conecta",
        "Cable dañado, corte visible",
    ],
    PDM: [
        "No carga ni enciende",
        "Se apaga solo después de unos minutos",
        "La pantalla no responde al tacto",
        "Se rompió la pantalla",
        "No mantiene la carga más de 1 hora",
    ],
};
async function main() {
    console.log("Deleting existing claims...");
    await prisma.delivery.deleteMany({});
    await prisma.claim.deleteMany({});
    const patients = await prisma.user.findMany({
        where: { role: "patient" },
        select: {
            id: true,
            fullName: true,
            hardwareSupplies: {
                where: { type: { in: ["Bomba_200u", "Bomba_300u"] } },
                select: { type: true },
            },
        },
    });
    const patientInfos = patients.map((p) => {
        var _a;
        return ({
            id: p.id,
            fullName: p.fullName || "Unknown",
            pumpType: (((_a = p.hardwareSupplies[0]) === null || _a === void 0 ? void 0 : _a.type) || "Bomba_200u"),
        });
    });
    console.log("Patients:", patientInfos.map(p => `${p.fullName} (${p.pumpType})`));
    const startDate = new Date("2025-10-01");
    const endDate = new Date("2026-02-08");
    const productWeights = [
        { product: "SENSOR", weight: 30 },
        { product: "PARCHE", weight: 28 },
        { product: "TRANSMISOR", weight: 10 },
        { product: "BASE_BOMBA", weight: 12 },
        { product: "CABLE_TRANSMISOR", weight: 8 },
        { product: "PDM", weight: 12 },
    ];
    function pickProduct() {
        const total = productWeights.reduce((s, p) => s + p.weight, 0);
        let r = Math.random() * total;
        for (const pw of productWeights) {
            r -= pw.weight;
            if (r <= 0)
                return pw.product;
        }
        return "SENSOR";
    }
    const totalClaims = 85;
    const claims = [];
    for (let i = 0; i < totalClaims; i++) {
        const patient = pick(patientInfos);
        const product = pickProduct();
        const { supply, category, errors } = getSupplyAndCategory(product, patient.pumpType);
        const errorCode = pick(errors);
        const status = pickStatus();
        const createdAt = randomDate(startDate, endDate);
        const failureDate = daysAgo(createdAt, 0, 5);
        const colocationDate = product === "SENSOR" || product === "PARCHE"
            ? daysAgo(failureDate, 0, 10)
            : undefined;
        const daysClaimed = (product === "SENSOR" || product === "PARCHE")
            ? rand(1, 14)
            : undefined;
        const descriptions = DESCRIPTIONS[product] || DESCRIPTIONS["SENSOR"];
        const description = pick(descriptions);
        const lotNumber = `LOT-${rand(1000, 9999)}-${rand(10, 99)}`;
        const resolvedAt = status !== "pending"
            ? new Date(createdAt.getTime() + rand(1, 7) * 24 * 60 * 60 * 1000)
            : undefined;
        claims.push({
            userId: patient.id,
            supply,
            claimCategory: category,
            errorCode,
            status,
            description,
            lotNumber,
            daysClaimed,
            needsReplacement: Math.random() > 0.6,
            failureDate,
            colocationDate,
            createdAt,
            updatedAt: resolvedAt || createdAt,
            resolvedAt,
            resolutionMessage: status === "approved"
                ? "Reclamo aprobado. Se procede con el reembolso."
                : status === "rejected"
                    ? pick(["No se pudo verificar el defecto", "Fuera del período de garantía", "Uso inadecuado del producto"])
                    : undefined,
        });
    }
    claims.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    console.log(`\nInserting ${claims.length} claims...`);
    for (const claim of claims) {
        await prisma.claim.create({ data: claim });
    }
    const bySupply = await prisma.claim.groupBy({
        by: ["supply"],
        _count: { _all: true },
        orderBy: { supply: "asc" },
    });
    console.log("\n=== CLAIMS BY SUPPLY ===");
    console.table(bySupply.map(r => ({ supply: r.supply, count: r._count._all })));
    const byStatus = await prisma.claim.groupBy({
        by: ["status"],
        _count: { _all: true },
    });
    console.log("\n=== CLAIMS BY STATUS ===");
    console.table(byStatus.map(r => ({ status: r.status, count: r._count._all })));
    const byMonth = await prisma.$queryRaw `
    SELECT TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*)::int as total
    FROM claims
    GROUP BY month
    ORDER BY month
  `;
    console.log("\n=== CLAIMS BY MONTH ===");
    console.table(byMonth);
    console.log("\nDone!");
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed-realistic-claims.js.map