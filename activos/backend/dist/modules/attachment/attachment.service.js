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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("src/prisma/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const fs_1 = require("fs");
let AttachmentService = class AttachmentService {
    constructor(prisma) {
        this.prisma = prisma;
        this.uploadDir = path.join(process.cwd(), 'uploads');
        this.maxFileSize = 10 * 1024 * 1024;
        this.allowedMimeTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    async upload(assetId, file, dto) {
        const asset = await this.prisma.asset.findUnique({
            where: { id: assetId },
        });
        if (!asset) {
            throw new common_1.NotFoundException(`Activo ${assetId} no encontrado`);
        }
        if (file.size > this.maxFileSize) {
            throw new common_1.BadRequestException('Archivo excede el tamaño máximo permitido (10MB)');
        }
        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Tipo de archivo no permitido');
        }
        const timestamp = Date.now();
        const filename = `${assetId}_${timestamp}_${file.originalname}`;
        const filepath = path.join(this.uploadDir, filename);
        fs.writeFileSync(filepath, file.buffer);
        const attachment = {
            id: `att_${timestamp}`,
            assetId,
            filename: file.originalname,
            storedFilename: filename,
            filepath,
            mimeType: file.mimetype,
            size: file.size,
            description: dto.description,
            uploadedAt: new Date(),
        };
        return {
            success: true,
            attachment,
            message: 'Archivo cargado exitosamente',
        };
    }
    async findByAsset(assetId) {
        const uploadPath = path.join(this.uploadDir);
        if (!fs.existsSync(uploadPath)) {
            return [];
        }
        const files = fs.readdirSync(uploadPath);
        const assetFiles = files.filter((f) => f.startsWith(assetId));
        return assetFiles.map((f) => {
            const stats = fs.statSync(path.join(uploadPath, f));
            return {
                id: f,
                filename: f,
                size: stats.size,
                uploadedAt: stats.birthtime,
            };
        });
    }
    async download(id) {
        const filepath = path.join(this.uploadDir, id);
        if (!fs.existsSync(filepath)) {
            throw new common_1.NotFoundException('Archivo no encontrado');
        }
        const stats = fs.statSync(filepath);
        const stream = (0, fs_1.createReadStream)(filepath);
        let mimeType = 'application/octet-stream';
        if (id.endsWith('.pdf'))
            mimeType = 'application/pdf';
        else if (id.match(/\.(jpg|jpeg)$/))
            mimeType = 'image/jpeg';
        else if (id.endsWith('.png'))
            mimeType = 'image/png';
        return {
            stream,
            filename: id,
            mimeType,
            size: stats.size,
        };
    }
    async remove(id) {
        const filepath = path.join(this.uploadDir, id);
        if (!fs.existsSync(filepath)) {
            throw new common_1.NotFoundException('Archivo no encontrado');
        }
        fs.unlinkSync(filepath);
        return {
            success: true,
            message: 'Archivo eliminado exitosamente',
        };
    }
};
exports.AttachmentService = AttachmentService;
exports.AttachmentService = AttachmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttachmentService);
