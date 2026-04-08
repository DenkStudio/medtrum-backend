import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SupplyType } from "@prisma/client";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateBalanceDays(
    patientId: string,
    delta?: number,
    supply?: SupplyType
  ) {
    // Only SENSOR, PARCHE_200U, and PARCHE_300U affect balance
    let fieldName: "balanceDaysSensor" | "balanceDaysParche";
    if (supply === SupplyType.SENSOR) {
      fieldName = "balanceDaysSensor";
    } else if (supply === SupplyType.PARCHE_200U || supply === SupplyType.PARCHE_300U) {
      fieldName = "balanceDaysParche";
    } else {
      // TRANSMISOR, BASE_BOMBA_200U, BASE_BOMBA_300U, CABLE_TRANSMISOR, PDM — no balance modification
      return;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: patientId },
      data: { [fieldName]: { increment: delta ?? 0 } },
    });

    return {
      patientId: updatedUser.id,
      balanceDaysSensor: updatedUser.balanceDaysSensor ?? 0,
      balanceDaysParche: updatedUser.balanceDaysParche ?? 0,
    };
  }

  async findMyProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
        healthcare: true,
        educator: {
          select: {
            id: true,
            name: true,
            province: true,
            telephone: true,
            user: { select: { email: true } },
          },
        },
        deliveries: {
          include: {
            assignedBy: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException("User not found");

    const disposables = user.deliveries
      .filter((d) => d.type === "supply_delivery")
      .map((delivery) => ({
        itemName: delivery.itemName,
        quantity: delivery.quantity,
        deliveryDate: delivery.date,
        assignedBy: delivery.assignedBy,
        observations: delivery.observations,
      }));

    const hardware = await this.prisma.hardwareSupply.findMany({
      where: { userId, status: 'active' },
    });

    return {
      ...user,
      disposables,
      hardware,
    };
  }
}
