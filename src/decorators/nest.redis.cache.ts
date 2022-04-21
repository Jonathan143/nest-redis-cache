/*
 * @Description: 自定义装饰器,如果该接口需要走redis缓存就加上去
 */
import { applyDecorators, SetMetadata } from '@nestjs/common';
import { REDIS_CACHE_KEY, REDIS_CACHE_OPTIONs } from '../constants';
import redisCacheConfig from '../config/redisCache.config';
import { Request } from 'express';

// 是否缓存
const isCache = true;

/**
 * @Description: 自定义装饰器,用于路由上装饰需要缓存的接口
 * @param {object} options.exSecond redis缓存过期时间,时间为秒
 * @param {object} options.key redis key
 * @return {*}
 */
export function NestCacheApi({
  exSecond = redisCacheConfig.redisEXSecond,
  key = '',
  formatKey = (key: string, request: Request) => key || request.url,
}): any {
  return applyDecorators(
    SetMetadata(REDIS_CACHE_KEY, isCache),
    SetMetadata(REDIS_CACHE_OPTIONs, { exSecond, key, formatKey }),
  );
}
