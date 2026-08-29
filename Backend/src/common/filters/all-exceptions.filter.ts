import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();
        const request = ctx.getRequest<FastifyRequest>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors: any = undefined;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exResponse = exception.getResponse();
            if (typeof exResponse === 'string') {
                message = exResponse;
            } else if (typeof exResponse === 'object') {
                message = (exResponse as any).message || message;
                errors = (exResponse as any).errors;
            }
        }

        const ip = request.ip || request.headers['x-forwarded-for'] || 'unknown';
        const method = request.method;
        const url = request.url;
        const user = (request as any).user;
        const userStr = user ? `[User: ${user.sub || user.id}]` : '[Guest]';

        if (status >= 500) {
            this.logger.error(
                `[HTTP ${status}] ${method} ${url} - Client IP: ${ip} ${userStr}`,
                exception instanceof Error ? exception.stack : exception,
            );
        } else if (status >= 400) {
            this.logger.warn(
                `[HTTP ${status}] ${method} ${url} - Client IP: ${ip} ${userStr} - Message: ${Array.isArray(message) ? message.join(', ') : message}`,
            );
        }

        response.status(status).send({
            error: {
                statusCode: status,
                message,
                ...(errors ? { errors } : {}),
                timestamp: new Date().toISOString(),
            },
        });
    }
}
