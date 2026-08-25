import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  meta: any;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => {
        // If data is already in expected format with data/meta, use it, else wrap it
        const responseData = data?.data !== undefined ? data.data : data;
        const meta = data?.meta || { requestId: context.switchToHttp().getRequest().headers['x-request-id'] || 'system' };
        
        return {
          success: true,
          data: responseData,
          meta,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
