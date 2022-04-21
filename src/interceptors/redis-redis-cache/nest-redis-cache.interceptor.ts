import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { REDIS_CACHE_KEY, REDIS_CACHE_OPTIONs } from '~/constants';
import { RedisCacheService } from '~/services/redis-cache/redis-cache.service';

/**
 * @Description: 定义redis缓存接口的中间件。提高接口访问速度
 * @param {*}
 * @return {*}
 */
@Injectable()
export class NestApiCacheInterceptor implements NestInterceptor {
  constructor(private readonly redisCacheService: RedisCacheService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const request: Request = context.switchToHttp().getRequest();
    // 反射的方法获取接口是否需要缓存
    const isCacheApi =
      Reflect.getMetadata(REDIS_CACHE_KEY, context.getHandler()) ||
      Reflect.getMetadata(REDIS_CACHE_KEY, context.getClass());
    const { exSecond, key, formatKey } =
      Reflect.getMetadata(REDIS_CACHE_OPTIONs, context.getHandler()) ||
      Reflect.getMetadata(REDIS_CACHE_OPTIONs, context.getClass());
    if (isCacheApi) {
      // request.query
      // request.body
      const redisKey = this.redisCacheKey(
        request.method,
        formatKey(key, request),
      );
      const redisData = await this.redisCacheService.get(redisKey);
      if (redisData) {
        return of(redisData);
      } else {
        return next.handle().pipe(
          map((data) => {
            this.redisCacheService.set(redisKey, data, exSecond);
            return data;
          }),
        );
      }
    } else {
      return next.handle();
    }
  }

  private redisCacheKey(method: string, url: string): string {
    return `${method}:${url}`;
  }
}
