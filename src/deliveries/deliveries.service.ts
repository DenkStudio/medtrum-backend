import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DeliveryType } from "@prisma/client";
import { SupabaseService } from "../supabase/supabase.service";

@Injectable()
export class DeliveriesService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  async hasUnreceivedReimbursements(userId: string): Promise<boolean> {
    const count = await this.prisma.delivery.count({
      where: {
        userId,
        type: DeliveryType.claim_reimbursement,
        receivedByPatient: false,
      },
    });
    return count > 0;
  }

  async findUnreceivedReimbursements(userId: string) {
    return this.prisma.delivery.findMany({
      where: {
        userId,
        type: DeliveryType.claim_reimbursement,
        receivedByPatient: false,
      },
      include: {
        claim: {
          select: {
            id: true,
            supply: true,
            daysClaimed: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async markAsReceived(deliveryId: string, userId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
    });

    if (!delivery) {
      throw new NotFoundException("Entrega no encontrada");
    }

    if (delivery.userId !== userId) {
      throw new ForbiddenException("No tenés permiso para confirmar esta entrega");
    }

    if (delivery.type !== DeliveryType.claim_reimbursement) {
      throw new ForbiddenException("Solo se pueden confirmar entregas de reembolso");
    }

    if (delivery.receivedByPatient) {
      return delivery;
    }

    return this.prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        receivedByPatient: true,
        receivedAt: new Date(),
      },
    });
  }

  async getDeliveryPhotoSignedUrl(deliveryId: string, userId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      select: { photoUrl: true, userId: true },
    });
    if (!delivery) throw new NotFoundException("Entrega no encontrada");
    if (delivery.userId !== userId) {
      throw new ForbiddenException("No tenés permiso para ver esta entrega");
    }
    if (!delivery.photoUrl) return { url: null };

    const { data, error } = await this.supabase.adminClient.storage
      .from("entregas")
      .createSignedUrl(delivery.photoUrl, 3600);

    if (error) {
      throw new BadRequestException(`Error generating signed URL: ${error.message}`);
    }

    return { url: data.signedUrl };
  }
}
