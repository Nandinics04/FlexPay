import { createHash } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compare, hash } from 'bcryptjs';
import { Model } from 'mongoose';
import { CreateAdminUserDto, UpdateAdminUserDto } from './dto/admin-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User, UserDocument, UserRole } from './schemas/user.schema';

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  authProvider: User['authProvider'];
  role: UserRole;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  pan: string;
  aadhaar: string;
  creditPoints: number;
  cashbackBalance: number;
  avatarUrl: string | null;
  createdAt?: Date;
};

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    await this.ensureAdminUser();
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.userModel.findOne({ email });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const user = await this.userModel.create({
      email,
      name: dto.name.trim(),
      passwordHash: await hash(dto.password, 10),
      googleId: null,
      authProvider: 'email',
      role: this.isAdminEmail(email) ? 'admin' : 'user',
      wishlist: [],
      creditPoints: 0,
    });

    return this.issueAuth(user);
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.userModel.findOne({ email });
    if (!user?.passwordHash) {
      throw new UnauthorizedException(
        user?.googleId
          ? 'This account uses Google sign-in'
          : 'Invalid email or password',
      );
    }

    const matches = await compare(dto.password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.promoteIfAdminEmail(user);
    return this.issueAuth(user);
  }

  async findOrCreateGoogleUser(profile: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl?: string | null;
  }) {
    const email = profile.email.trim().toLowerCase();
    let user = await this.userModel.findOne({
      $or: [{ googleId: profile.googleId }, { email }],
    });

    if (!user) {
      user = await this.userModel.create({
        email,
        name: profile.name.trim() || email.split('@')[0],
        passwordHash: null,
        googleId: profile.googleId,
        authProvider: 'google',
        role: this.isAdminEmail(email) ? 'admin' : 'user',
        wishlist: [],
        creditPoints: 0,
        avatarUrl: profile.avatarUrl ?? null,
      });
    } else if (!user.googleId) {
      user.googleId = profile.googleId;
      user.authProvider = user.passwordHash ? 'both' : 'google';
      if (profile.avatarUrl && !user.avatarUrl) {
        user.avatarUrl = profile.avatarUrl;
      }
      await this.promoteIfAdminEmail(user);
      await user.save();
    } else {
      if (profile.avatarUrl && !user.avatarUrl) {
        user.avatarUrl = profile.avatarUrl;
        await user.save();
      }
      await this.promoteIfAdminEmail(user);
    }

    return user;
  }

  toPublicUser(user: UserDocument): PublicUser {
    return {
      id: String(user._id),
      email: user.email,
      name: user.name,
      authProvider: user.authProvider,
      role: user.role ?? 'user',
      phone: user.phone ?? '',
      address: user.address ?? '',
      city: user.city ?? '',
      state: user.state ?? '',
      pincode: user.pincode ?? '',
      latitude: user.latitude ?? null,
      longitude: user.longitude ?? null,
      pan: user.pan ?? '',
      aadhaar: user.aadhaar ?? '',
      creditPoints: user.creditPoints ?? 0,
      cashbackBalance: user.cashbackBalance ?? 0,
      avatarUrl: user.avatarUrl || gravatarUrl(user.email),
      createdAt: user.createdAt,
    };
  }

  async listUsers() {
    const users = await this.userModel.find().sort({ createdAt: -1 });
    return users.map((user) => this.toPublicUser(user));
  }

  async getUser(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toPublicUser(user);
  }

  async createUser(dto: CreateAdminUserDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.userModel.findOne({ email });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const user = await this.userModel.create({
      email,
      name: dto.name.trim(),
      passwordHash: await hash(dto.password, 10),
      googleId: null,
      authProvider: 'email',
      role: dto.role ?? 'user',
      phone: dto.phone?.trim() ?? '',
      address: dto.address?.trim() ?? '',
      city: dto.city?.trim() ?? '',
      state: dto.state?.trim() ?? '',
      pincode: dto.pincode?.trim() ?? '',
      pan: dto.pan?.trim().toUpperCase() ?? '',
      aadhaar: dto.aadhaar?.replace(/\s/g, '') ?? '',
      wishlist: [],
      creditPoints: 0,
      cashbackBalance: 0,
    });

    return this.toPublicUser(user);
  }

  async updateUser(id: string, dto: UpdateAdminUserDto) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase();
      const taken = await this.userModel.findOne({
        email,
        _id: { $ne: user._id },
      });
      if (taken) {
        throw new ConflictException('An account with this email already exists');
      }
      user.email = email;
    }
    if (dto.name !== undefined) user.name = dto.name.trim();
    if (dto.phone !== undefined) user.phone = dto.phone.trim();
    if (dto.address !== undefined) user.address = dto.address.trim();
    if (dto.city !== undefined) user.city = dto.city.trim();
    if (dto.state !== undefined) user.state = dto.state.trim();
    if (dto.pincode !== undefined) user.pincode = dto.pincode.trim();
    if (dto.pan !== undefined) user.pan = dto.pan.trim().toUpperCase();
    if (dto.aadhaar !== undefined) user.aadhaar = dto.aadhaar.replace(/\s/g, '');
    if (dto.creditPoints !== undefined) {
      user.creditPoints = Math.max(0, dto.creditPoints);
    }
    if (dto.cashbackBalance !== undefined) {
      user.cashbackBalance = Math.max(0, dto.cashbackBalance);
    }
    if (dto.password) {
      user.passwordHash = await hash(dto.password, 10);
      user.authProvider = user.googleId ? 'both' : 'email';
    }
    if (dto.role !== undefined) {
      if (this.isAdminEmail(user.email) && dto.role !== 'admin') {
        throw new BadRequestException(
          'The bootstrap admin account must stay an admin',
        );
      }
      user.role = dto.role;
    }

    await user.save();
    return this.toPublicUser(user);
  }

  async deleteUser(id: string, actorId: string) {
    if (id === actorId) {
      throw new BadRequestException('You cannot delete your own account');
    }
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (this.isAdminEmail(user.email)) {
      throw new BadRequestException('The bootstrap admin account cannot be deleted');
    }
    await this.userModel.deleteOne({ _id: id });
    return { ok: true };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    if (dto.name !== undefined) user.name = dto.name.trim();
    if (dto.phone !== undefined) user.phone = dto.phone.trim();
    if (dto.address !== undefined) user.address = dto.address.trim();
    if (dto.city !== undefined) user.city = dto.city.trim();
    if (dto.state !== undefined) user.state = dto.state.trim();
    if (dto.pincode !== undefined) user.pincode = dto.pincode.trim();
    if (dto.latitude !== undefined) user.latitude = dto.latitude;
    if (dto.longitude !== undefined) user.longitude = dto.longitude;
    if (dto.pan !== undefined) user.pan = dto.pan.trim().toUpperCase();
    if (dto.aadhaar !== undefined) user.aadhaar = dto.aadhaar.replace(/\s/g, '');

    await user.save();
    return this.toPublicUser(user);
  }

  async addCreditPoints(userId: string, points: number) {
    return this.adjustRewards(userId, { creditPoints: points });
  }

  async adjustRewards(
    userId: string,
    delta: { creditPoints?: number; cashbackBalance?: number },
  ) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $inc: {
          creditPoints: delta.creditPoints ?? 0,
          cashbackBalance: delta.cashbackBalance ?? 0,
        },
      },
      { new: true },
    );
    if (!user) {
      return null;
    }

    if ((user.creditPoints ?? 0) < 0 || (user.cashbackBalance ?? 0) < 0) {
      user.creditPoints = Math.max(0, user.creditPoints ?? 0);
      user.cashbackBalance = Math.max(0, user.cashbackBalance ?? 0);
      await user.save();
    }

    return this.toPublicUser(user);
  }

  signToken(user: UserDocument) {
    return this.jwtService.sign({
      sub: String(user._id),
      email: user.email,
    });
  }

  issueAuth(user: UserDocument) {
    return {
      token: this.signToken(user),
      user: this.toPublicUser(user),
    };
  }

  async findById(id: string) {
    return this.userModel.findById(id);
  }

  private adminEmail() {
    return this.config.get<string>('ADMIN_EMAIL')?.trim().toLowerCase() ?? '';
  }

  private isAdminEmail(email: string) {
    const admin = this.adminEmail();
    return Boolean(admin && email === admin);
  }

  private async promoteIfAdminEmail(user: UserDocument) {
    if (this.isAdminEmail(user.email) && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }
  }

  private async ensureAdminUser() {
    const email = this.adminEmail();
    const password = this.config.get<string>('ADMIN_PASSWORD') ?? '';
    if (!email) {
      return;
    }

    const existing = await this.userModel.findOne({ email });
    if (existing) {
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
        this.logger.log(`Promoted ${email} to admin`);
      } else {
        this.logger.log(`Admin account ready: ${email}`);
      }
      return;
    }

    if (password.length < 8) {
      this.logger.warn(
        'ADMIN_EMAIL is set but no matching user exists. Set ADMIN_PASSWORD (8+ chars) to create one.',
      );
      return;
    }

    await this.userModel.create({
      email,
      name: 'Admin',
      passwordHash: await hash(password, 10),
      googleId: null,
      authProvider: 'email',
      role: 'admin',
      wishlist: [],
      creditPoints: 0,
    });
    this.logger.log(`Created admin account ${email}`);
  }
}

function gravatarUrl(email: string) {
  const hash = createHash('md5')
    .update(email.trim().toLowerCase())
    .digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?s=128&d=404`;
}
