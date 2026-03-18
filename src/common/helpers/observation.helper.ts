import { PrismaService } from "../../prisma/prisma.service";

export interface Observation {
  text: string;
  date: string;
  authorId: string;
  authorName: string;
  type: "manual" | "system" | "cross_delivery";
  action?: string;
  sourceId?: string;
  sourceType?: string;
}

export function buildObservation(
  text: string,
  authorId: string,
  authorName: string,
  type: Observation["type"],
  extra?: { action?: string; sourceId?: string; sourceType?: string },
): Observation {
  return {
    text,
    date: new Date().toISOString(),
    authorId,
    authorName,
    type,
    ...extra,
  };
}

export async function appendClaimObservation(
  prisma: PrismaService,
  claimId: string,
  observation: Observation,
) {
  const claim = await prisma.claim.findUnique({
    where: { id: claimId },
    select: { observations: true },
  });
  const current = (claim?.observations as any[]) || [];
  return prisma.claim.update({
    where: { id: claimId },
    data: { observations: [...current, observation] as any },
  });
}

export async function appendDeliveryObservation(
  prisma: PrismaService,
  deliveryId: string,
  observation: Observation,
) {
  const delivery = await prisma.delivery.findUnique({
    where: { id: deliveryId },
    select: { observations: true },
  });
  const current = (delivery?.observations as any[]) || [];
  return prisma.delivery.update({
    where: { id: deliveryId },
    data: { observations: [...current, observation] as any },
  });
}
