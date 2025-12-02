"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("src/modules/auth/guards/jwt-auth.guard");
const QRCode = __importStar(require("qrcode"));
let QrController = class QrController {
    async generateAssetQR(assetId, res) {
        try {
            const assetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/assets/${assetId}`;
            const qrBuffer = await QRCode.toBuffer(assetUrl, {
                errorCorrectionLevel: 'H',
                type: 'png',
                width: 300,
                margin: 1,
            });
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Content-Disposition', `inline; filename="asset-${assetId}-qr.png"`);
            res.send(qrBuffer);
        }
        catch (error) {
            res.status(500).json({
                error: 'Error generando código QR',
                message: error.message,
            });
        }
    }
    async generateBatchQR(body, res) {
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
        }
        catch (error) {
            res.status(500).json({
                error: 'Error generando códigos QR en lote',
                message: error.message,
            });
        }
    }
};
exports.QrController = QrController;
__decorate([
    (0, common_1.Get)('asset/:assetId'),
    __param(0, (0, common_1.Param)('assetId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QrController.prototype, "generateAssetQR", null);
__decorate([
    (0, common_1.Post)('batch'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], QrController.prototype, "generateBatchQR", null);
exports.QrController = QrController = __decorate([
    (0, common_1.Controller)('qr'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)
], QrController);
