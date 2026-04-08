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
      { header: "DNI", key: "dni", width: 15 },
      { header: "Teléfono", key: "phone", width: 18 },
      { header: "Dirección", key: "address", width: 30 },
      { header: "Provincia", key: "province", width: 20 },
      { header: "Localidad", key: "localidad", width: 20 },
      { header: "Fecha de Nacimiento", key: "birthDate", width: 20 },
      { header: "Organización", key: "organization", width: 18 },
      { header: "Médico", key: "doctor", width: 25 },
      { header: "Obra Social", key: "healthcare", width: 25 },
      { header: "Educador", key: "educator", width: 25 },
      { header: "Saldo de días (sensor)", key: "balanceSensor", width: 22 },
      { header: "Saldo de días (parche)", key: "balanceParche", width: 22 },
      { header: "Transmisor (Serie)", key: "hwTransmisor", width: 22 },
      { header: "Cable Transmisor (Serie)", key: "hwCable", width: 22 },
      { header: "Bomba 200U (Serie)", key: "hwBomba200", width: 22 },
      { header: "Bomba 300U (Serie)", key: "hwBomba300", width: 22 },
      { header: "PDM (Serie)", key: "hwPdm", width: 22 },
      { header: "Contacto Familiar", key: "familyContactName", width: 25 },
      { header: "Tel. Familiar", key: "familyContactPhone", width: 18 },
      { header: "Email Familiar", key: "familyContactEmail", width: 25 },
      { header: "Parentesco", key: "familyContactRelationship", width: 18 },
      { header: "Fecha de Alta", key: "createdAt", width: 20 },
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
        const hw = Array.isArray(user.hardwareSupplies) ? user.hardwareSupplies : [];
        const findHw = (type: string) => hw.find((h: any) => h.type === type);
        const hwLabel = (h: any) => h ? (h.serialNumber || h.lotNumber || "Sí") : "-";

        ws.addRow({
          name: user.fullName || "",
          email: user.email || "",
          dni: user.dni || "-",
          phone: user.phoneNumber || "-",
          address: user.address || "-",
          province: user.province || "-",
          localidad: user.localidad?.name || "-",
          birthDate: user.birthDate
            ? new Date(user.birthDate).toLocaleDateString("es-AR")
            : "-",
          organization: user.organization?.name || "-",
          doctor: user.doctor ? `${user.doctor.lastName} ${user.doctor.firstName}` : "-",
          healthcare: user.healthcare?.tradeName || "-",
          educator: user.educator?.name || "-",
          balanceSensor: user.balanceDaysSensor ?? 0,
          balanceParche: user.balanceDaysParche ?? 0,
          hwTransmisor: hwLabel(findHw("TRANSMISOR")),
          hwCable: hwLabel(findHw("CABLE_TRANSMISOR")),
          hwBomba200: hwLabel(findHw("BASE_BOMBA_200U")),
          hwBomba300: hwLabel(findHw("BASE_BOMBA_300U")),
          hwPdm: hwLabel(findHw("PDM")),
          familyContactName: user.familyContactName || "-",
          familyContactPhone: user.familyContactPhone || "-",
          familyContactEmail: user.familyContactEmail || "-",
          familyContactRelationship: user.familyContactRelationship || "-",
          createdAt: user.createdAt
            ? new Date(user.createdAt).toLocaleDateString("es-AR")
            : "-",
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
