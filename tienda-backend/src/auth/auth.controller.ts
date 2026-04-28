import { Controller, Post, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(registerDto);
    this.setCookie(res, result.access_token);
    return { user: result.user };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto);
    this.setCookie(res, result.access_token);
    return { user: result.user };
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { message: 'Logged out successfully' };
  }

  private setCookie(res: Response, token: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('access_token', token, {
      httpOnly: true, // Inaccesible para JavaScript en el frontend
      secure: isProduction, // Solo HTTPS en producción (obligatorio para sameSite 'none')
      sameSite: isProduction ? 'none' : 'lax', // 'none' permite cross-domain en prod, 'lax' para local
      maxAge: 1000 * 60 * 60 * 24, // 1 día
    });
  }
}
