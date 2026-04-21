import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
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
    const user = await this.usersService.create({
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
    });

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
}
