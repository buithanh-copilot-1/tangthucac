import {
  Injectable, ConflictException, UnauthorizedException, BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthProvider } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  // ── Register ────────────────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    const emailLower = dto.email.toLowerCase().trim();
    const usernameLower = dto.username.toLowerCase().trim();

    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: emailLower }, { username: { equals: usernameLower, mode: 'insensitive' } }] },
    });
    if (existing?.email === emailLower) throw new ConflictException('Email này đã được đăng ký');
    if (existing) throw new ConflictException('Tên người dùng đã tồn tại');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        username: dto.username.trim(),
        email: emailLower,
        passwordHash,
        provider: AuthProvider.EMAIL,
      },
      select: this.safeUserSelect(),
    });

    const tokens = await this.generateTokens(user.id, user.email);
    return { user, ...tokens };
  }

  // ── Login ───────────────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    if (user.provider === AuthProvider.GOOGLE)
      throw new UnauthorizedException('Tài khoản này đăng nhập bằng Google. Hãy dùng Google Sign-In.');
    if (!user.passwordHash) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    if (!user.isActive) throw new UnauthorizedException('Tài khoản đã bị khóa');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    const safeUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: this.safeUserSelect(),
    });

    const tokens = await this.generateTokens(user.id, user.email);
    return { user: safeUser, ...tokens };
  }

  // ── Google OAuth ─────────────────────────────────────────────────────────
  async loginWithGoogle(accessToken: string) {
    // Lấy profile từ Google userinfo endpoint
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new BadRequestException('Google access token không hợp lệ');

    const profile = await res.json() as {
      sub: string;
      name: string;
      given_name?: string;
      family_name?: string;
      email: string;
      email_verified?: boolean;
      picture?: string;
    };

    const emailLower = profile.email.toLowerCase();

    // Tìm user theo googleId hoặc email
    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId: profile.sub }, { email: emailLower }] },
    });

    if (user && user.provider === AuthProvider.EMAIL) {
      throw new ConflictException('Email này đã đăng ký bằng mật khẩu. Hãy đăng nhập bằng email.');
    }

    if (user) {
      // Đã tồn tại → cập nhật thông tin Google mới nhất
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          displayName: profile.name,
          givenName: profile.given_name,
          familyName: profile.family_name,
          avatarUrl: profile.picture,
          emailVerified: profile.email_verified ?? true,
          googleId: profile.sub,
        },
      });
    } else {
      // Tạo user mới
      const baseUsername = profile.name.replace(/\s+/g, '').toLowerCase().slice(0, 18);
      const username = await this.uniqueUsername(baseUsername);

      user = await this.prisma.user.create({
        data: {
          username,
          displayName: profile.name,
          givenName: profile.given_name,
          familyName: profile.family_name,
          email: emailLower,
          emailVerified: profile.email_verified ?? true,
          avatarUrl: profile.picture,
          googleId: profile.sub,
          provider: AuthProvider.GOOGLE,
        },
      });
    }

    const safeUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: this.safeUserSelect(),
    });

    const tokens = await this.generateTokens(user.id, user.email);
    return { user: safeUser, ...tokens };
  }

  // ── Refresh token ────────────────────────────────────────────────────────
  async refresh(token: string) {
    let payload: { sub: string; email: string };
    try {
      payload = this.jwtService.verify(token, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    // Tìm token hash trong DB
    const tokenHash = await bcrypt.hash(token, 10);
    const stored = await this.prisma.refreshToken.findFirst({
      where: {
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!stored) throw new UnauthorizedException('Refresh token đã bị thu hồi');

    const tokenValid = await bcrypt.compare(token, stored.tokenHash);
    if (!tokenValid) throw new UnauthorizedException('Refresh token không hợp lệ');

    // Rotate: thu hồi token cũ, cấp token mới
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: this.safeUserSelect(),
    });
    if (!user) throw new UnauthorizedException();

    const tokens = await this.generateTokens(payload.sub, payload.email);
    return { user, ...tokens };
  }

  // ── Logout ───────────────────────────────────────────────────────────────
  async logout(userId: string) {
    // Thu hồi tất cả refresh tokens của user
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { message: 'Đã đăng xuất thành công' };
  }

  async forgotPassword(email: string) {
    const emailLower = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email: emailLower } });
    const message = 'Neu email ton tai, huong dan dat lai mat khau da duoc tao.';

    if (!user || user.provider !== AuthProvider.EMAIL || !user.passwordHash || !user.isActive) {
      return { message };
    }

    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const resetToken = randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(resetToken, 10);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    if (this.config.get<string>('nodeEnv') !== 'production') {
      return { message, resetToken };
    }

    return { message };
  }

  async resetPassword(token: string, password: string) {
    const candidates = await this.prisma.passwordResetToken.findMany({
      where: { usedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    for (const candidate of candidates) {
      const valid = await bcrypt.compare(token, candidate.tokenHash);
      if (!valid) continue;

      if (candidate.user.provider !== AuthProvider.EMAIL || !candidate.user.passwordHash) {
        throw new BadRequestException('Tai khoan nay khong dung mat khau email');
      }

      const passwordHash = await bcrypt.hash(password, 12);
      await this.prisma.user.update({
        where: { id: candidate.userId },
        data: { passwordHash },
      });
      await this.prisma.passwordResetToken.update({
        where: { id: candidate.id },
        data: { usedAt: new Date() },
      });
      await this.prisma.refreshToken.updateMany({
        where: { userId: candidate.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      return { message: 'Da dat lai mat khau thanh cong' };
    }

    throw new BadRequestException('Token dat lai mat khau khong hop le hoac da het han');
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) throw new UnauthorizedException();
    if (user.provider !== AuthProvider.EMAIL || !user.passwordHash) {
      throw new BadRequestException('Tai khoan Google khong co mat khau email');
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Mat khau hien tai khong dung');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { message: 'Da doi mat khau thanh cong' };
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('jwt.accessSecret'),
      expiresIn: this.config.get('jwt.accessExpiresIn') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('jwt.refreshSecret'),
      expiresIn: this.config.get('jwt.refreshExpiresIn') as any,
    });

    // Lưu hash của refresh token vào DB
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return { accessToken, refreshToken };
  }

  private safeUserSelect() {
    return {
      id: true, username: true, displayName: true, givenName: true,
      familyName: true, email: true, emailVerified: true, avatarUrl: true,
      googleId: true, provider: true, isActive: true, createdAt: true, updatedAt: true,
    } as const;
  }

  private async uniqueUsername(base: string): Promise<string> {
    let candidate = base || 'user';
    let i = 0;
    while (true) {
      const taken = await this.prisma.user.findFirst({ where: { username: { equals: candidate, mode: 'insensitive' } } });
      if (!taken) return candidate;
      candidate = `${base}${++i}`;
    }
  }
}
