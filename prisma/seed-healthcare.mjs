import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// All unique healthcare providers from the list, with researched data
const healthcares = [
  {
    tradeName: "IAPOS",
    legalName: "Instituto Autárquico Provincial de Obra Social",
    sigla: "IAPOS",
    rnos: "904001",
  },
  {
    tradeName: "Swiss Medical",
    legalName: "Swiss Medical S.A.",
    sigla: null,
    rnos: "800501",
  },
  {
    tradeName: "Apross",
    legalName: "Administración Provincial del Seguro de Salud",
    sigla: "APROSS",
    rnos: null, // Provincial (Córdoba), no RNOS nacional
  },
  {
    tradeName: "Mutual Médica",
    legalName: "Mutual Médica Argentina",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "MET",
    legalName: "MET Medicina Prepaga",
    sigla: "MET",
    rnos: null,
  },
  {
    tradeName: "ASPURC",
    legalName: "Asociación del Personal de la Universidad Nacional de Río Cuarto",
    sigla: "ASPURC",
    rnos: null,
  },
  {
    tradeName: "Femedica",
    legalName: "Femedica S.A.",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "OPDEA",
    legalName: "Obra Social de los Profesores Diplomados en Enseñanza Artística",
    sigla: "OPDEA",
    rnos: null,
  },
  {
    tradeName: "GEA",
    legalName: "GEA Salud",
    sigla: "GEA",
    rnos: null,
  },
  {
    tradeName: "Prevención Salud",
    legalName: "Prevención Salud S.A.",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "Federada Salud",
    legalName: "Federada Salud",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "IOSFA",
    legalName: "Instituto de Obra Social de las Fuerzas Armadas",
    sigla: "IOSFA",
    rnos: "113001",
  },
  {
    tradeName: "ASE",
    legalName: "Acción Social de Empresarios",
    sigla: "ASE",
    rnos: null,
  },
  {
    tradeName: "Sancor Salud",
    legalName: "Sancor Salud",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "OSPTV",
    legalName: "Obra Social del Personal de Televisión",
    sigla: "OSPTV",
    rnos: null,
  },
  {
    tradeName: "APM",
    legalName: "APM",
    sigla: "APM",
    rnos: null,
  },
  {
    tradeName: "OSDE",
    legalName: "Organización de Servicios Directos Empresarios",
    sigla: "OSDE",
    rnos: "400209",
  },
  {
    tradeName: "SIMEPA",
    legalName: "SIMEPA",
    sigla: "SIMEPA",
    rnos: null,
  },
  {
    tradeName: "Andar",
    legalName: "Andar Salud",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "Apress",
    legalName: "Apress",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "APRES",
    legalName: "APRES",
    sigla: "APRES",
    rnos: null,
  },
  {
    tradeName: "Jerárquicos Salud",
    legalName: "Jerárquicos Salud S.A.",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "ATSA",
    legalName: "Asociación de Trabajadores de la Sanidad Argentina",
    sigla: "ATSA",
    rnos: null,
  },
  {
    tradeName: "DASUTEN",
    legalName: "DASUTEN",
    sigla: "DASUTEN",
    rnos: null,
  },
  {
    tradeName: "OSPIN",
    legalName: "OSPIN",
    sigla: "OSPIN",
    rnos: null,
  },
  {
    tradeName: "OSECAC",
    legalName: "Obra Social de Empleados de Comercio y Actividades Civiles",
    sigla: "OSECAC",
    rnos: "104601",
  },
  {
    tradeName: "OSSOELSAC",
    legalName: "OSSOELSAC",
    sigla: "OSSOELSAC",
    rnos: null,
  },
  {
    tradeName: "FATSA",
    legalName: "Federación de Asociaciones de Trabajadores de la Sanidad Argentina",
    sigla: "FATSA",
    rnos: null,
  },
  {
    tradeName: "OSIM",
    legalName: "Obra Social de la Industria Maderera",
    sigla: "OSIM",
    rnos: null,
  },
  {
    tradeName: "APOS",
    legalName: "Administración Provincial de Obra Social",
    sigla: "APOS",
    rnos: null,
  },
  {
    tradeName: "OSSEG",
    legalName: "Obra Social de Seguros",
    sigla: "OSSEG",
    rnos: null,
  },
  {
    tradeName: "Hospital Italiano",
    legalName: "Plan de Salud del Hospital Italiano de Buenos Aires",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "DOCTHOS",
    legalName: "DOCTHOS",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "Galeno",
    legalName: "Galeno Argentina S.A.",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "OSPE",
    legalName: "Obra Social del Personal de la Educación",
    sigla: "OSPE",
    rnos: null,
  },
  {
    tradeName: "Instituto de Seguros de Jujuy",
    legalName: "Instituto de Seguros de Jujuy",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "Caja de Ingenieros",
    legalName: "Caja de Previsión Social para Ingenieros",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "Omint",
    legalName: "Omint S.A.",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "DASPU",
    legalName: "Dirección de Asistencia Social del Personal Universitario",
    sigla: "DASPU",
    rnos: null,
  },
  {
    tradeName: "Amsterdam",
    legalName: "Amsterdam Salud",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "Sipssa",
    legalName: "Sipssa",
    sigla: "SIPSSA",
    rnos: null,
  },
  {
    tradeName: "OSMATA",
    legalName: "Obra Social del Sindicato de Mecánicos y Afines del Transporte Automotor",
    sigla: "OSMATA",
    rnos: null,
  },
  {
    tradeName: "OSUTHGRA",
    legalName: "Obra Social de la Unión de Trabajadores del Turismo, Hoteleros y Gastronómicos de la República Argentina",
    sigla: "OSUTHGRA",
    rnos: null,
  },
  {
    tradeName: "Avalian",
    legalName: "Avalian",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "OSPSA",
    legalName: "OSPSA",
    sigla: "OSPSA",
    rnos: null,
  },
  {
    tradeName: "OSPAC",
    legalName: "Obra Social del Personal de la Actividad del Caucho",
    sigla: "OSPAC",
    rnos: null,
  },
  {
    tradeName: "Centro Asistencial",
    legalName: "Centro Asistencial",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "OSPEPRI",
    legalName: "OSPEPRI",
    sigla: "OSPEPRI",
    rnos: null,
  },
  {
    tradeName: "Medicus",
    legalName: "Medicus S.A.",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "Unión Personal",
    legalName: "Unión del Personal Civil de la Nación",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "OSAPM",
    legalName: "OSAPM",
    sigla: "OSAPM",
    rnos: null,
  },
  {
    tradeName: "Poder Judicial de la Nación",
    legalName: "Obra Social del Poder Judicial de la Nación",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "Ciencias Económicas",
    legalName: "Ciencias Económicas",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "CPCE",
    legalName: "Consejo Profesional de Ciencias Económicas",
    sigla: "CPCE",
    rnos: null,
  },
  {
    tradeName: "Consejo de Ciencias Económicas",
    legalName: "Consejo de Ciencias Económicas",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "Esencial",
    legalName: "Esencial",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "Medicina Esencial",
    legalName: "Medicina Esencial",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "OSFATYL",
    legalName: "OSFATYL",
    sigla: "OSFATYL",
    rnos: null,
  },
  {
    tradeName: "VUMI",
    legalName: "VUMI Group",
    sigla: "VUMI",
    rnos: null,
  },
  {
    tradeName: "William Hope",
    legalName: "William Hope",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "Sanidad",
    legalName: "Obra Social del Personal de Sanidad",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "Saniedad",
    legalName: "Saniedad",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "Sanidas",
    legalName: "Sanidas",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "OSTCARA",
    legalName: "OSTCARA",
    sigla: "OSTCARA",
    rnos: null,
  },
  {
    tradeName: "OPSA Sanidad",
    legalName: "OPSA Sanidad",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "Británica Salud",
    legalName: "Británica Salud",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "Caja Faorense",
    legalName: "Caja Faorense",
    sigla: null,
    rnos: null,
  },
  {
    tradeName: "OSPIM",
    legalName: "OSPIM",
    sigla: "OSPIM",
    rnos: null,
  },
  {
    tradeName: "OSITAC",
    legalName: "OSITAC",
    sigla: "OSITAC",
    rnos: null,
  },
  {
    tradeName: "UOM",
    legalName: "Unión Obrera Metalúrgica",
    sigla: "UOM",
    rnos: null,
  },
  {
    tradeName: "OSPRERA",
    legalName: "Obra Social del Personal Rural y Estibadores de la República Argentina",
    sigla: "OSPRERA",
    rnos: null,
  },
  {
    tradeName: "Sos Salud",
    legalName: "Sos Salud",
    sigla: null,
    rnos: null,
  },
];

async function main() {
  console.log(`Healthcare entries to create: ${healthcares.length}`);

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

  console.log(`Creating ${toCreate.length} healthcare providers...`);

  // Create one by one to handle potential RNOS conflicts gracefully
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

  // List all
  const all = await prisma.healthcare.findMany({
    orderBy: { tradeName: "asc" },
  });
  console.log(`\nTotal healthcare providers: ${all.length}`);
  all.forEach((h) =>
    console.log(`  - ${h.tradeName} | ${h.legalName}${h.rnos ? ` | RNOS: ${h.rnos}` : ""}`)
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
