import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import axios from 'axios';
import { MailService } from '../mail/mail.service';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
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

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Block login if user has not verified their email
    if (!user.isVerified) {
      throw new UnauthorizedException('Tu cuenta no está verificada. Por favor verifica tu correo para poder ingresar.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
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
}
