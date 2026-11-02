import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, GoogleAuthDto } from './dto/auth.dto';
import axios from 'axios';
import { MailService } from '../mail/mail.service';
import { randomUUID } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { ROLE_PERMISSIONS } from './constants/permissions.enum';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService
  ) {}

  async verifyCaptcha(token: string): Promise<boolean> {
    try {
      const secret = process.env.TURNSTILE_SECRET_KEY;
      if (!secret) {
        console.warn('TURNSTILE_SECRET_KEY is not defined, skipping captcha validation in dev');
        return true; // Skip si no está configurado (solo para desarrollo)
      }
      const response = await axios.post(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          secret: secret,
          response: token,
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  async register(registerDto: RegisterDto) {
    const isCaptchaValid = await this.verifyCaptcha(registerDto.captchaToken);
    if (!isCaptchaValid) {
      throw new BadRequestException('CAPTCHA inválido');
    }

    const existingUser = await this.usersService.findOne(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email ya registrado');
    }
    
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const token = randomUUID();

    const user = await this.usersService.create({
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
      isVerified: false,
      verificationToken: token,
    });

    // Send the activation email
    await this.mailService.sendVerificationEmail(user.email, user.name ?? 'Jugador', token);

    return {
      success: true,
      message: 'Registro exitoso. Se ha enviado un correo de verificación para activar tu cuenta.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }

  async login(loginDto: LoginDto) {
    const isCaptchaValid = await this.verifyCaptcha(loginDto.captchaToken);
    if (!isCaptchaValid) {
      throw new BadRequestException('CAPTCHA inválido');
    }

    const user = await this.usersService.findOne(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.password) {
      if (user.googleId) {
        throw new UnauthorizedException(
          'Esta cuenta fue registrada con Google. Inicia sesión con el botón de Google o recupera tu contraseña para crear una clave.',
        );
      }
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Block login if user has not verified their email
    if (!user.isVerified) {
      throw new UnauthorizedException('Tu cuenta no está verificada. Por favor verifica tu correo para poder ingresar.');
    }

    const memberships = await this.usersService.getUserMemberships(user.id);

    // Compute sessionType and scope context
    let sessionType = 'USER';
    let company: any = null;
    let activeStore: any = null;
    let availableBranches: any[] = [];
    let permissions: string[] = [];

    const compMemberships = memberships?.companyMemberships || [];
    const storeMemberships = memberships?.storeMemberships || [];

    if (user.role === 'SUPERADMIN') {
      sessionType = 'SUPERADMIN';
      permissions = ['SUPERADMIN_FULL_ACCESS'];
    } else {
      const ownerMembership = compMemberships.find((cm) => cm.role === 'OWNER');
      const adminCompMembership = compMemberships.find((cm) => cm.role === 'ADMIN' || cm.role === 'ACCOUNTANT');
      const managerMembership = storeMemberships.find((sm) => sm.role === 'BRANCH_MANAGER');
      const cashierMembership = storeMemberships.find((sm) => sm.role === 'CASHIER');

      if (ownerMembership) {
        sessionType = 'COMPANY_OWNER';
        company = {
          id: ownerMembership.company.id,
          name: ownerMembership.company.name,
          rut: ownerMembership.company.rut,
          balance: ownerMembership.company.balance,
        };
        availableBranches = ownerMembership.company.stores || [];
        activeStore = availableBranches.find((b: any) => b.isMainBranch) || availableBranches[0] || null;
      } else if (adminCompMembership) {
        sessionType = 'COMPANY_ADMIN';
        company = {
          id: adminCompMembership.company.id,
          name: adminCompMembership.company.name,
          rut: adminCompMembership.company.rut,
          balance: adminCompMembership.company.balance,
        };
        availableBranches = adminCompMembership.company.stores || [];
        activeStore = availableBranches.find((b: any) => b.isMainBranch) || availableBranches[0] || null;
      } else if (managerMembership) {
        sessionType = 'BRANCH_MANAGER';
        activeStore = managerMembership.store;
        availableBranches = [managerMembership.store];
        if (managerMembership.store.company) {
          company = managerMembership.store.company;
        }
      } else if (cashierMembership) {
        sessionType = 'CASHIER';
        activeStore = cashierMembership.store;
        availableBranches = [cashierMembership.store];
        if (cashierMembership.store.company) {
          company = cashierMembership.store.company;
        }
      }
    }

    permissions = ROLE_PERMISSIONS[sessionType] || [];

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionType,
      activeStoreId: activeStore?.id || null,
      companyId: company?.id || null,
      permissions,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        sessionType,
        company,
        activeStore,
        availableBranches,
        permissions,
        companyMemberships: compMemberships,
        storeMemberships,
      },
    };
  }

  async verifyEmail(token: string) {
    if (!token) {
      throw new BadRequestException('Token de verificación requerido');
    }
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Token de verificación inválido o expirado');
    }
    await this.usersService.verifyUser(user.id);
    return {
      success: true,
      message: 'Cuenta verificada correctamente. Ya puedes iniciar sesión.'
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const isCaptchaValid = await this.verifyCaptcha(dto.captchaToken);
    if (!isCaptchaValid) {
      throw new BadRequestException('CAPTCHA inválido');
    }

    const user = await this.usersService.findOne(dto.email);
    if (user) {
      // Si el usuario se registró con Google y aún no tiene contraseña, usamos 'oauth_init' como versión
      const passwordVersion = user.password ? user.password.slice(-10) : 'oauth_init';

      const resetToken = await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          type: 'password_reset',
          pv: passwordVersion,
        },
        { expiresIn: '1h' },
      );

      await this.mailService.sendPasswordResetEmail(
        user.email,
        user.name ?? 'Coleccionista',
        resetToken,
      );
    }

    return {
      success: true,
      message:
        'Si el correo electrónico ingresado está registrado, te hemos enviado las instrucciones y el enlace para restablecer tu contraseña.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(dto.token);
    } catch (err) {
      throw new BadRequestException('El enlace de recuperación es inválido o ha expirado.');
    }

    if (payload?.type !== 'password_reset') {
      throw new BadRequestException('Token de recuperación inválido.');
    }

    const user = await this.usersService.findOne(payload.email);
    if (!user || user.id !== payload.sub) {
      throw new BadRequestException('Usuario no encontrado.');
    }

    const currentPv = user.password ? user.password.slice(-10) : 'oauth_init';
    if (currentPv !== payload.pv) {
      throw new BadRequestException(
        'Este enlace ya ha sido utilizado o ha quedado sin efecto. Por favor solicita uno nuevo.',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.updatePassword(user.id, hashedPassword);

    return {
      success: true,
      message: 'Tu contraseña ha sido restablecida con éxito. Ya puedes iniciar sesión con tus nuevas credenciales.',
    };
  }

  async googleLogin(dto: GoogleAuthDto) {
    if (!dto.credential) {
      throw new BadRequestException('Token de credencial de Google requerido');
    }

    let payload: any;
    try {
      const googleClientId = process.env.GOOGLE_CLIENT_ID;
      const ticket = await this.googleClient.verifyIdToken({
        idToken: dto.credential,
        audience: googleClientId || undefined,
      });
      payload = ticket.getPayload();
    } catch (err: any) {
      throw new UnauthorizedException('Token de Google inválido o expirado: ' + (err.message || ''));
    }

    if (!payload || !payload.email) {
      throw new BadRequestException('No se pudo obtener la información de la cuenta de Google');
    }

    // 1. Buscar usuario por googleId
    let user = await this.usersService.findByGoogleId(payload.sub);

    // 2. Si no existe por googleId, buscar por email para vincular
    if (!user) {
      user = await this.usersService.findOne(payload.email);
      if (user) {
        user = await this.usersService.linkGoogleAccount(user.id, payload.sub, payload.picture);
      } else {
        // 3. Si no existe, crear nuevo usuario (activado de inmediato)
        user = await this.usersService.create({
          email: payload.email,
          name: payload.name || payload.email.split('@')[0],
          googleId: payload.sub,
          avatar: payload.picture,
          isVerified: true,
          role: 'USER',
        });
      }
    }

    const jwtPayload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(jwtPayload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
    };
  }
}


