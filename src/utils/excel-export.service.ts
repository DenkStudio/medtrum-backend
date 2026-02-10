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
    const ws = wb.addWorksheet("Usuarios con Reclamos");

    // Agregar encabezados
    const headerRow = ws.addRow([
      "Nombre",
      "Obra Social",
      "Doctor",
      "Balance Sensor (días)",
      "Balance Parche (días)",
    ]);

    // Estilizar encabezados
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Agregar datos
    if (rows && rows.length > 0) {
      rows.forEach((user) => {
        ws.addRow([
          user.fullName || "",
          user.healthcare?.name || "",
          user.doctor?.name || "",
          user.balanceDaysSensor ?? 0,
          user.balanceDaysParche ?? 0,
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

    // Asegurar que el buffer es válido
    if (!buffer || buffer.byteLength === 0) {
      throw new Error("Error al generar el archivo Excel");
    }

    return new StreamableFile(Buffer.from(buffer), {
      disposition: 'attachment; filename="usuarios-con-reclamos.xlsx"',
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  }
}
