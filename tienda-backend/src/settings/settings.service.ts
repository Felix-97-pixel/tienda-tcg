import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    const settings = await this.prisma.globalSetting.findMany();
    return settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
  }

  async updateSettings(settings: Record<string, string>) {
    const promises = Object.entries(settings).map(([key, value]) =>
      this.prisma.globalSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    );
    await Promise.all(promises);
    return this.getSettings();
  }

  async getSetting(key: string) {
    const setting = await this.prisma.globalSetting.findUnique({
      where: { key },
    });
    return setting?.value || null;
  }
}
