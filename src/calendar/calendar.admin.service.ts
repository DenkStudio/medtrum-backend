import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  AuthUser,
  buildOrgFilter,
  getCreateOrgId,
  canAccessOrg,
} from "../common/helpers/organization-filter.helper";
import { CalendarQueryDto } from "./dto/calendar-query.dto";
import { CreateCalendarEventDto } from "./dto/create-calendar-event.dto";
import { CalendarEventColor } from "@prisma/client";

@Injectable()
export class CalendarAdminService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: CalendarQueryDto, user: AuthUser) {
    const { month, year } = query;
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, month, 1));

    const orgFilter = buildOrgFilter(user);

    // Build educator filter for educator/super_educator roles
    const educatorPatientFilter =
      user.role === "educator" && user.educatorId
        ? { user: { educatorId: user.educatorId } }
        : {};

    // 1. Get hardware placements in this month
    const hardwarePlacements = await this.prisma.hardwareSupply.findMany({
      where: {
        ...orgFilter,
        ...educatorPatientFilter,
        placementDate: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            educator: { select: { id: true, name: true } },
          },
        },
      },
    });

    // 2. Get custom calendar events in this month
    const customEvents = await this.prisma.calendarEvent.findMany({
      where: {
        ...orgFilter,
        startDate: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
      include: {
        createdBy: {
          select: { id: true, fullName: true },
        },
      },
    });

    // Map hardware placements to calendar event format
    const placementEvents = hardwarePlacements.map((hw) => ({
      id: `hw_${hw.id}`,
      title: `Colocación ${hw.type} - ${hw.user?.fullName ?? "Sin asignar"}`,
      description: hw.user?.educator
        ? `Educadora: ${hw.user.educator.name}`
        : null,
      startDate: hw.placementDate!.toISOString(),
      endDate: null,
      color: "emerald" as const,
      category: "colocaciones",
      createdAt: hw.createdAt.toISOString(),
      metadata: {
        hardwareId: hw.id,
        type: hw.type,
        serialNumber: hw.serialNumber,
        patientId: hw.user?.id ?? null,
        patientName: hw.user?.fullName ?? null,
        educatorId: hw.user?.educator?.id ?? null,
        educatorName: hw.user?.educator?.name ?? null,
      },
    }));

    // Map custom events
    const calendarEvents = customEvents.map((evt) => ({
      id: evt.id,
      title: evt.title,
      description: evt.description,
      startDate: evt.startDate.toISOString(),
      endDate: evt.endDate?.toISOString() ?? null,
      color: evt.color,
      category: evt.category,
      createdAt: evt.createdAt.toISOString(),
      metadata: {
        createdById: evt.createdBy.id,
        createdByName: evt.createdBy.fullName,
      },
    }));

    // Combine and sort by startDate
    const data = [...placementEvents, ...calendarEvents].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );

    return { data };
  }

  async create(dto: CreateCalendarEventDto, user: AuthUser) {
    const orgId = getCreateOrgId(user);

    const event = await this.prisma.calendarEvent.create({
      data: {
        title: dto.title,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        color: (dto.color as CalendarEventColor) ?? "sky",
        category: dto.category,
        organizationId: orgId,
        createdById: user.userId,
      },
    });

    return event;
  }

  async remove(id: string, user: AuthUser) {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException("Calendar event not found");
    }

    if (!canAccessOrg(user, event.organizationId)) {
      throw new ForbiddenException("Cannot access this event");
    }

    await this.prisma.calendarEvent.delete({ where: { id } });

    return { deleted: true };
  }
}
