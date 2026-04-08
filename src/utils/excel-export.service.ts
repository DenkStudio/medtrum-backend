import { Injectable, StreamableFile } from "@nestjs/common";
import * as ExcelJS from "exceljs";
import { Response } from "express";

@Injectable()
export class ExcelExportService {
  async exportPatients(rows: any[]) {
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
      const deliveriesCount = Array.isArray(p.deliveries)
        ? p.deliveries.length
        : 0;
      ws.addRow([
        p.fullName,
        p.organization?.name || "",
        p.balanceDaysSensor ?? 0,
        p.balanceDaysParche ?? 0,
        deliveriesCount,
      ]);
    });
    const buffer = await wb.xlsx.writeBuffer();
    return new StreamableFile(Buffer.from(buffer), {
      disposition: 'attachment; filename="patients.xlsx"',
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  }

  async exportUsers(rows: any[]) {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Usuarios");

    ws.columns = [
      { header: "Nombre", key: "name", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Saldo de días (sensor)", key: "balanceSensor", width: 22 },
      { header: "Saldo de días (parche)", key: "balanceParche", width: 22 },
      { header: "Médico", key: "doctor", width: 25 },
      { header: "Obra Social", key: "healthcare", width: 25 },
    ];

    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    if (rows && rows.length > 0) {
      rows.forEach((user) => {
        ws.addRow({
          name: user.fullName || "",
          email: user.email || "",
          balanceSensor: user.balanceDaysSensor ?? 0,
          balanceParche: user.balanceDaysParche ?? 0,
          doctor: user.doctor ? `${user.doctor.lastName} ${user.doctor.firstName}` : "-",
          healthcare: user.healthcare?.tradeName || "-",
        });
      });
    }

    const buffer = await wb.xlsx.writeBuffer();

    if (!buffer || buffer.byteLength === 0) {
      throw new Error("Error al generar el archivo Excel");
    }

    return new StreamableFile(Buffer.from(buffer), {
      disposition: 'attachment; filename="usuarios.xlsx"',
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  }
}
