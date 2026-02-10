"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const claimsBySupply = await prisma.claim.groupBy({
        by: ["supply", "errorCode"],
        _count: { _all: true },
        where: { errorCode: { not: null } },
    });
    console.log("\n=== CLAIMS BY SUPPLY + ERROR CODE ===");
    console.table(claimsBySupply.map(c => ({
        supply: c.supply,
        errorCode: c.errorCode,
        count: c._count._all,
    })));
    const allClaims = await prisma.claim.findMany({
        select: {
            id: true,
            supply: true,
            claimCategory: true,
            errorCode: true,
            status: true,
            createdAt: true,
            failureDate: true,
            user: { select: { fullName: true } },
        },
        orderBy: { createdAt: "desc" },
    });
    console.log("\n=== ALL CLAIMS ===");
    console.table(allClaims.map(c => {
        var _a;
        return ({
            id: c.id.slice(0, 8),
            user: c.user.fullName,
            supply: c.supply,
            category: c.claimCategory,
            errorCode: c.errorCode,
            status: c.status,
            created: c.createdAt.toISOString().slice(0, 10),
            failure: ((_a = c.failureDate) === null || _a === void 0 ? void 0 : _a.toISOString().slice(0, 10)) || "-",
        });
    }));
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
    console.log("\n=== PATIENTS + PUMP TYPE ===");
    console.table(patients.map(p => {
        var _a;
        return ({
            id: p.id.slice(0, 8),
            name: p.fullName,
            pump: ((_a = p.hardwareSupplies[0]) === null || _a === void 0 ? void 0 : _a.type) || "none",
        });
    }));
    const totalClaims = await prisma.claim.count();
    const totalPatients = await prisma.user.count({ where: { role: "patient" } });
    console.log(`\nTotal claims: ${totalClaims}`);
    console.log(`Total patients: ${totalPatients}`);
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=check-db.js.map