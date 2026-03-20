import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class HardwareService {
  constructor(private prisma: PrismaService) {}

  async findByUserId(userId: string) {
    return this.prisma.hardwareSupply.findMany({
      where: { userId, status: 'active' },
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
      },
    });
  }
}
