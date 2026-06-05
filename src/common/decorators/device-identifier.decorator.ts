import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const DeviceIdentifier = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
    }>();
    const raw =
      request.headers['x-device-identifier'] ??
      request.headers['X-Device-Identifier'];

    if (typeof raw === 'string' && raw.trim().length > 0) {
      return raw.trim();
    }

    return null;
  },
);
