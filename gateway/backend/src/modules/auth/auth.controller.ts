import { Controller, Get, Post, Put, Delete, Body, Request, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req) {
    console.log('[Auth Controller] req.user:', req.user);
    return {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role?.name || req.user.roles?.[0],
    };
  }

  // Gestión de usuarios (solo ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('users')
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('users')
  async createUser(
    @Body() body: { email: string; password: string; name: string; roleId: string },
  ) {
    return this.authService.createUser(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: { email?: string; name?: string; roleId?: string; active?: boolean },
  ) {
    return this.authService.updateUser(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('roles')
  async getAllRoles() {
    return this.authService.getAllRoles();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('roles')
  async createRole(@Body() body: { name: string; description?: string }) {
    return this.authService.createRole(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('roles/:id')
  async updateRole(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string },
  ) {
    return this.authService.updateRole(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('roles/:id')
  async deleteRole(@Param('id') id: string) {
    return this.authService.deleteRole(id);
  }
}
