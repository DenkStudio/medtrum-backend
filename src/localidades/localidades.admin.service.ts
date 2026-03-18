import {
  Injectable,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLocalidadDto } from "./dto/create-localidad.dto";
import {
  AuthUser,
  buildOrgFilter,
  getCreateOrgId,
} from "../common/helpers/organization-filter.helper";

@Injectable()
export class LocalidadesAdminService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateLocalidadDto, user: AuthUser) {
    const organizationId = getCreateOrgId(user, data.organizationId);

    const exists = await this.prisma.localidad.findFirst({
      where: {
        name: data.name,
        province: data.province,
        organizationId,
      },
    });
    if (exists) {
      throw new ConflictException(
        "Ya existe una localidad con ese nombre en esa provincia",
      );
    }

    return this.prisma.localidad.create({
      data: {
        name: data.name,
        province: data.province,
        organizationId,
      },
    });
  }

  async findByProvince(province: string, user: AuthUser) {
    const orgFilter = buildOrgFilter(user);
    const orgId = orgFilter.organizationId;

    return this.prisma.localidad.findMany({
      where: {
        province,
        // Include shared (null org) + org-scoped localidades
        ...(orgId
          ? { OR: [{ organizationId: null }, { organizationId: orgId }] }
          : {}),
      },
      orderBy: { name: "asc" },
    });
  }

  async findAll(user: AuthUser) {
    const orgFilter = buildOrgFilter(user);
    const orgId = orgFilter.organizationId;

    return this.prisma.localidad.findMany({
      where: orgId
        ? { OR: [{ organizationId: null }, { organizationId: orgId }] }
        : {},
      orderBy: { name: "asc" },
    });
  }
}
