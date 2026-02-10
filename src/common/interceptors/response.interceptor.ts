import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Si la respuesta es un StreamableFile, retornarla sin modificar
        if (data instanceof StreamableFile) {
          return data;
        }
        // Para todas las demás respuestas, envolver en { data }
        return { data };
      })
    );
  }
}
