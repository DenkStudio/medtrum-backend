import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DeliveryType } from "@prisma/client";
import { SupabaseService } from "../supabase/supabase.service";
import {
  buildObservation,
  appendClaimObservation,
} from "../common/helpers/observation.helper";

@Injectable()
export class DeliveriesService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  async hasUnreceivedReimbursements(userId: string): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const count = await this.prisma.delivery.count({
      where: {
        userId,
        type: DeliveryType.claim_reimbursement,
        receivedByPatient: false,
        date: { lt: today },
      },
    });
    return count > 0;
  }

  async findUnreceivedReimbursements(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.prisma.delivery.findMany({
      where: {
        userId,
        type: DeliveryType.claim_reimbursement,
        receivedByPatient: false,
        date: { lt: today },
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

    const updated = await this.prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        receivedByPatient: true,
        receivedAt: new Date(),
      },
    });

    // Add system observation to the claim
    if (delivery.claimId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true },
      });
      const authorName = user?.fullName || "Paciente";

      const obs = buildObservation(
        `Paciente confirmó recepción de entrega`,
        userId,
        authorName,
        "system",
        { action: "delivery_received" },
      );
      await appendClaimObservation(this.prisma, delivery.claimId, obs);

      // Check if all deliveries for that claim are received
      const unreceived = await this.prisma.delivery.count({
        where: {
          claimId: delivery.claimId,
          receivedByPatient: false,
        },
      });

      if (unreceived === 0) {
        await this.prisma.claim.update({
          where: { id: delivery.claimId },
          data: { status: "received" as any },
        });
      }
    }

    return updated;
  }

  async getDeliveryPhotoSignedUrl(deliveryId: string, userId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      select: { externalPhotoUrls: true, userId: true },
    });
    if (!delivery) throw new NotFoundException("Entrega no encontrada");
    if (delivery.userId !== userId) {
      throw new ForbiddenException("No tenés permiso para ver esta entrega");
    }
    if (!delivery.externalPhotoUrls?.length) return { url: null, externalUrls: [] };

    const signUrl = async (path: string) => {
      const { data, error } = await this.supabase.adminClient.storage
        .from("entregas")
        .createSignedUrl(path, 3600);
      if (error) throw new BadRequestException(`Error generating signed URL: ${error.message}`);
      return data.signedUrl;
    };

    const externalUrls = await Promise.all(delivery.externalPhotoUrls.map(signUrl));
    return { url: externalUrls[0] || null, externalUrls };
  }
}
