import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();

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

        if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error('Unhandled exception', exception instanceof Error ? exception.stack : exception);
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
