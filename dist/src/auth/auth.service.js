"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(supabase, prisma) {
        this.supabase = supabase;
        this.prisma = prisma;
    }
    async validateUser(email, password) {
        const { data, error } = await this.supabase.client.auth.signInWithPassword({
            email,
            password,
        });
        if (error || !data.session) {
            throw new common_1.UnauthorizedException("Invalid credentials");
        }
        const user = await this.prisma.user.findUnique({
            where: { supabaseId: data.user.id },
        });
        if (!user) {
            throw new common_1.UnauthorizedException("User not found in system");
        }
        return {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            user: { id: user.id, email: user.email, role: user.role },
        };
    }
    async refreshToken(refreshToken) {
        const { data, error } = await this.supabase.client.auth.refreshSession({
            refresh_token: refreshToken,
        });
        if (error || !data.session) {
            throw new common_1.UnauthorizedException("Invalid or expired refresh token");
        }
        return {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map