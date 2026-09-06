import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService, type PublicUser } from './auth.service';
import { CreateAdminUserDto, UpdateAdminUserDto } from './dto/admin-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

type AuthedRequest = Request & { user: PublicUser };

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminUsersController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  list() {
    return this.authService.listUsers();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.getUser(id);
  }

  @Post()
  create(@Body() dto: CreateAdminUserDto) {
    return this.authService.createUser(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAdminUserDto) {
    return this.authService.updateUser(id, dto);
  }

  @Delete(':id')
  remove(@Req() request: AuthedRequest, @Param('id') id: string) {
    return this.authService.deleteUser(id, request.user.id);
  }
}
