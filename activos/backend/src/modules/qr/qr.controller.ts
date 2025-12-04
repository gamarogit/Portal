import { Controller, Get, Post, Body, Param, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import * as QRCode from 'qrcode';

@Controller('qr')
@UseGuards(JwtAuthGuard)
export class QrController {
  @Get('asset/:assetId')
  async generateAssetQR(@Param('assetId') assetId: string, @Res() res: Response) {
    try {
      // Generar URL para el activo
      const assetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/assets/${assetId}`;
      
      // Generar QR como buffer de imagen
      const qrBuffer = await QRCode.toBuffer(assetUrl, {
        errorCorrectionLevel: 'H',
        type: 'png',
        width: 300,
        margin: 1,
      });

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `inline; filename="asset-${assetId}-qr.png"`);
      res.send(qrBuffer);
    } catch (error) {
      res.status(500).json({
        error: 'Error generando código QR',
        message: error.message,
      });
    }
  }

  @Post('batch')
  async generateBatchQR(@Body() body: { assetIds: string[] }, @Res() res: Response) {
    try {
      const qrCodes = [];

      for (const assetId of body.assetIds) {
        const assetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/assets/${assetId}`;
        const qrDataUrl = await QRCode.toDataURL(assetUrl, {
          errorCorrectionLevel: 'H',
          width: 300,
        });

        qrCodes.push({
          assetId,
          qrCode: qrDataUrl,
        });
      }

      res.json({
        success: true,
        count: qrCodes.length,
        qrCodes,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Error generando códigos QR en lote',
        message: error.message,
      });
    }
  }
}
