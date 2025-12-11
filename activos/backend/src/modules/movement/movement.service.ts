import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { MessagingService } from 'src/shared/messaging/messaging.service';
import { AuditService } from 'src/modules/audit/audit.service';

@Injectable()
export class MovementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messaging: MessagingService,
    private readonly audit: AuditService,
  ) {}

  findAll() {
    return this.prisma.movement.findMany({
      include: {
        asset: { include: { assetType: true, location: true } },
        fromLocation: true,
        toLocation: true,
        requestedBy: true,
        approvedBy: true,
      },
    });
  }

  create(data: CreateMovementDto) {
    return this.prisma.$transaction(async (tx) => {
      // Generar folio consecutivo
      const prefix = data.movementType.charAt(0); // A, B, T
      const lastMovement = await tx.movement.findFirst({
        where: { folio: { startsWith: prefix } },
        orderBy: { folio: 'desc' },
      });
      
      let nextNumber = 1;
      if (lastMovement?.folio) {
        const lastNumber = parseInt(lastMovement.folio.split('-')[1]);
        nextNumber = lastNumber + 1;
      }
      const folio = `${prefix}-${nextNumber.toString().padStart(4, '0')}`;

      const movement = await tx.movement.create({
        data: {
          folio,
          assetId: data.assetId,
          movementType: data.movementType,
          fromLocationId: data.fromLocationId,
          toLocationId: data.toLocationId,
          notes: data.notes,
        },
      });
      await this.audit.log({
        entity: 'Movement',
        entityId: movement.id,
        action: `Movimiento ${movement.movementType}`,
        changes: { movementType: movement.movementType, fromLocationId: movement.fromLocationId, toLocationId: movement.toLocationId },
        assetId: movement.assetId,
        performedById: movement.requestedById,
      });
      await this.messaging.publish('movement.created', movement);
      return movement;
    });
  }

  async updateStatus(id: string, status: string) {
    const movement = await this.prisma.movement.update({
      where: { id },
      data: { status },
      include: {
        asset: { include: { assetType: true, location: true } },
        fromLocation: true,
        toLocation: true,
      },
    });

    await this.audit.log({
      entity: 'Movement',
      entityId: movement.id,
      action: 'Actualización de estatus',
      changes: { status },
      assetId: movement.assetId,
    });

    return movement;
  }
}
