"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelExportService = void 0;
const common_1 = require("@nestjs/common");
const ExcelJS = require("exceljs");
let ExcelExportService = class ExcelExportService {
    async exportPatients(rows) {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("Pacientes");
        ws.addRow([
            "Nombre",
            "Organización",
            "Balance Sensor (días)",
            "Balance Parche (días)",
            "Entregas",
        ]);
        rows.forEach((p) => {
            var _a, _b, _c;
            const deliveriesCount = Array.isArray(p.deliveries)
                ? p.deliveries.length
                : 0;
            ws.addRow([
                p.fullName,
                ((_a = p.organization) === null || _a === void 0 ? void 0 : _a.name) || "",
                (_b = p.balanceDaysSensor) !== null && _b !== void 0 ? _b : 0,
                (_c = p.balanceDaysParche) !== null && _c !== void 0 ? _c : 0,
                deliveriesCount,
            ]);
        });
        const buffer = await wb.xlsx.writeBuffer();
        return new common_1.StreamableFile(Buffer.from(buffer), {
            disposition: 'attachment; filename="patients.xlsx"',
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
    }
    async exportUsers(rows) {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("Usuarios con Reclamos");
        const headerRow = ws.addRow([
            "Nombre",
            "Obra Social",
            "Doctor",
            "Balance Sensor (días)",
            "Balance Parche (días)",
        ]);
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFE0E0E0" },
        };
        if (rows && rows.length > 0) {
            rows.forEach((user) => {
                var _a, _b, _c, _d;
                ws.addRow([
                    user.fullName || "",
                    ((_a = user.healthcare) === null || _a === void 0 ? void 0 : _a.name) || "",
                    ((_b = user.doctor) === null || _b === void 0 ? void 0 : _b.name) || "",
                    (_c = user.balanceDaysSensor) !== null && _c !== void 0 ? _c : 0,
                    (_d = user.balanceDaysParche) !== null && _d !== void 0 ? _d : 0,
                ]);
            });
        }
        ws.columns = [
            { width: 30 },
            { width: 25 },
            { width: 25 },
            { width: 20 },
            { width: 20 },
        ];
        const buffer = await wb.xlsx.writeBuffer();
        if (!buffer || buffer.byteLength === 0) {
            throw new Error("Error al generar el archivo Excel");
        }
        return new common_1.StreamableFile(Buffer.from(buffer), {
            disposition: 'attachment; filename="usuarios-con-reclamos.xlsx"',
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
    }
};
exports.ExcelExportService = ExcelExportService;
exports.ExcelExportService = ExcelExportService = __decorate([
    (0, common_1.Injectable)()
], ExcelExportService);
//# sourceMappingURL=excel-export.service.js.map