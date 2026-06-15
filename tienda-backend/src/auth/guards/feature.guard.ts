import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FEATURE_KEY } from '../decorators/feature.decorator';
import { StoresService } from '../../stores/stores.service';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private storesService: StoresService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.getAllAndOverride<string>(FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredFeature) {
      return true; // No feature required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Si es super admin, tiene acceso a todo
    if (user.role === 'SUPERADMIN') {
      return true;
    }

    // Obtener la tienda y sus features
    const store = await this.storesService.findByUserId(user.sub || user.id);
    if (!store) {
      throw new ForbiddenException('Store not found for user');
    }

    const features = await this.storesService.getStoreFeatures(store.id);

    if (!features.includes(requiredFeature)) {
      throw new ForbiddenException(`Plan upgrade required to access feature: ${requiredFeature}`);
    }

    return true;
  }
}
