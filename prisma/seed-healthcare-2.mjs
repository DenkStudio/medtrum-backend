import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// New unique healthcare providers (not already in DB)
const healthcares = [
  {
    tradeName: "Policía Federal",
    legalName: "Obra Social de la Policía Federal Argentina",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "Hospital Alemán",
    legalName: "Plan Médico del Hospital Alemán",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "DOSUBA",
    legalName: "Dirección de Obra Social de la Universidad de Buenos Aires",
    sigla: "DOSUBA",
    rnos: null,
  },
  {
    tradeName: "Medifé",
    legalName: "Medifé Asociación Civil",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "OSPAGA",
    legalName: "Obra Social del Personal de la Actividad Gastronómica",
    sigla: "OSPAGA",
    rnos: null,
  },
  {
    tradeName: "SEMPRE",
    legalName: "Servicio Médico Privado de Empleados",
    sigla: "SEMPRE",
    rnos: null,
  },
  {
    tradeName: "Banco Nación",
    legalName: "Obra Social del Personal del Banco de la Nación Argentina",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "OSPE Petroleros",
    legalName: "Obra Social del Personal Jerárquico y Profesional del Petróleo y Gas Privado",
    sigla: "OSPE",
    rnos: null,
  },
  {
    tradeName: "Ipross",
    legalName: "Instituto Provincial del Seguro de Salud",
    sigla: "IPROSS",
    rnos: null, // Provincial (Río Negro)
  },
  {
    tradeName: "OSPEDYC",
    legalName: "Obra Social del Personal de Edificios de Renta y Horizontal",
    sigla: "OSPEDYC",
    rnos: null,
  },
  {
    tradeName: "Medicus Plan Celeste",
    legalName: "Medicus S.A. - Plan Celeste",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "OBSBA",
    legalName: "Obra Social de la Ciudad de Buenos Aires",
    sigla: "OBSBA",
    rnos: null,
  },
  {
    tradeName: "SADAIC",
    legalName: "Sociedad Argentina de Autores y Compositores de Música",
    sigla: "SADAIC",
    rnos: null,
  },
  {
    tradeName: "OBSBA e IOMA",
    legalName: "OBSBA e IOMA (cobertura combinada)",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "IOMA",
    legalName: "Instituto de Obra Médico Asistencial",
    sigla: "IOMA",
    rnos: null, // Provincial (Buenos Aires)
  },
  {
    tradeName: "OSPJN",
    legalName: "Obra Social del Poder Judicial de la Nación",
    sigla: "OSPJN",
    rnos: null,
  },
  {
    tradeName: "OSPLAD",
    legalName: "Obra Social para la Actividad Docente",
    sigla: "OSPLAD",
    rnos: null,
  },
  {
    tradeName: "Medicus Plan Ford",
    legalName: "Medicus S.A. - Plan Ford",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "Omint F",
    legalName: "Omint S.A. - Plan F",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "Camioneros",
    legalName: "Obra Social de Choferes de Camiones",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "Accord Salud",
    legalName: "Accord Salud",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "AMEBPBA",
    legalName: "Asociación Mutual de Empleados del Banco de la Provincia de Buenos Aires",
    sigla: "AMEBPBA",
    rnos: null,
  },
  {
    tradeName: "SEROS",
    legalName: "Seguro de Salud de la Provincia de Chubut",
    sigla: "SEROS",
    rnos: null, // Provincial (Chubut)
  },
  {
    tradeName: "OS del Personal de Carga y Descarga",
    legalName: "Obra Social del Personal de Carga y Descarga",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "Empleados de Farmacia",
    legalName: "Obra Social de los Empleados de Farmacia",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "Sanar",
    legalName: "Sanar Salud",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "Centro Médico Pueyrredón",
    legalName: "Centro Médico Pueyrredón",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "Caja de Servicios Sociales",
    legalName: "Caja de Servicios Sociales",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "ISSUNNE",
    legalName: "ISSUNNE",
    sigla: "ISSUNNE",
    rnos: null,
  },
  {
    tradeName: "OSDE 210",
    legalName: "OSDE Plan 210",
    sigla: "OSDE",
    rnos: null,
  },
  {
    tradeName: "OSMECOM",
    legalName: "Obra Social de los Empleados de Comercio",
    sigla: "OSMECOM",
    rnos: null,
  },
  {
    tradeName: "UNS",
    legalName: "Universidad Nacional del Sur - Obra Social",
    sigla: "UNS",
    rnos: null,
  },
  {
    tradeName: "Mutual Cosecha Salud",
    legalName: "Mutual Cosecha Salud",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "OSSACRA",
    legalName: "Obra Social del Personal de la Sanidad Argentina de Córdoba y la República Argentina",
    sigla: "OSSACRA",
    rnos: null,
  },
  {
    tradeName: "Medifé Plata",
    legalName: "Medifé Asociación Civil - Plan Plata",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "OSEF",
    legalName: "Obra Social del Estado Fueguino",
    sigla: "OSEF",
    rnos: null, // Provincial (Tierra del Fuego)
  },
  {
    tradeName: "Servicio Penitenciario Federal",
    legalName: "Obra Social del Servicio Penitenciario Federal",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "Ensalud OSPIN",
    legalName: "Ensalud OSPIN",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "SOSUNS",
    legalName: "SOSUNS",
    sigla: "SOSUNS",
    rnos: null,
  },
  {
    tradeName: "PAMI",
    legalName: "Programa de Atención Médica Integral",
    sigla: "PAMI",
    rnos: null,
  },
  {
    tradeName: "Hominis",
    legalName: "Hominis",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "Choferes",
    legalName: "Obra Social de Conductores de Transporte Colectivo de Pasajeros",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "OSER",
    legalName: "OSER",
    sigla: "OSER",
    rnos: null,
  },
  {
    tradeName: "OSPETRI",
    legalName: "Obra Social del Personal de Estaciones de Servicio",
    sigla: "OSPETRI",
    rnos: null,
  },
  {
    tradeName: "OSBA",
    legalName: "OSBA",
    sigla: "OSBA",
    rnos: null,
  },
  {
    tradeName: "OSCHOCA",
    legalName: "OSCHOCA",
    sigla: "OSCHOCA",
    rnos: null,
  },
];

async function main() {
  // Check existing to avoid duplicates
  const existing = await prisma.healthcare.findMany({
    select: { tradeName: true },
  });
  const existingNames = new Set(existing.map((h) => h.tradeName.toLowerCase()));

  const toCreate = healthcares.filter(
    (h) => !existingNames.has(h.tradeName.toLowerCase())
  );

  if (toCreate.length === 0) {
    console.log("All healthcare providers already exist.");
    return;
  }

  console.log(`Creating ${toCreate.length} new healthcare providers...`);

  let created = 0;
  let skipped = 0;
  for (const h of toCreate) {
    try {
      await prisma.healthcare.create({
        data: {
          tradeName: h.tradeName,
          legalName: h.legalName,
          sigla: h.sigla,
          rnos: h.rnos,
        },
      });
      created++;
    } catch (err) {
      console.warn(`  Skipped "${h.tradeName}": ${err.message}`);
      skipped++;
    }
  }

  console.log(`\nCreated: ${created}, Skipped: ${skipped}`);

  const total = await prisma.healthcare.count();
  console.log(`Total healthcare providers in DB: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
