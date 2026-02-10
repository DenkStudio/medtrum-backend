import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class HardwareService {
  constructor(private prisma: PrismaService) {}

  async findByUserId(userId: string) {
    return this.prisma.hardwareSupply.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            doctor: true,
            healthcare: true,
          },
        },
        activityLogs: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
            previousUser: { select: { id: true, fullName: true, email: true } },
            newUser: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });
  }
}
