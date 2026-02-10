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
    const patient = await this.prisma.user.findUnique({
      where: { id: patientId },
    });
    if (!patient) throw new NotFoundException("Patient not found");

    const fieldName = supply === SupplyType.SENSOR
      ? "balanceDaysSensor"
      : "balanceDaysParche"; // PARCHE_200U and PARCHE_300U both use balanceDaysParche
    const currentBalance = (patient[fieldName] ?? 0) + (delta ?? 0);

    const updatedUser = await this.prisma.user.update({
      where: { id: patientId },
      data: { [fieldName]: currentBalance },
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
      where: { userId },
      include: {
        activityLogs: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
            previousUser: { select: { id: true, fullName: true, email: true } },
            newUser: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });

    return {
      ...user,
      disposables,
      hardware,
    };
  }
}
