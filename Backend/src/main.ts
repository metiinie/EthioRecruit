import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter({ logger: false }),
    );

    const configService = app.get(ConfigService);

    // Global prefix
    app.setGlobalPrefix('v1');

    // CORS
    app.enableCors({
        origin: configService.get<string>('CORS_ORIGINS')?.split(',') || ['http://localhost:8081'],
        credentials: true,
    });

    // Global validation pipe with strict payload validation
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    // Global exception filter
    app.useGlobalFilters(new AllExceptionsFilter());

    // Global logging interceptor
    app.useGlobalInterceptors(new LoggingInterceptor());

    // Helmet security headers
    await app.register(require('@fastify/helmet'), {
        contentSecurityPolicy: false, // Disable CSP for dev
    });

    // Swagger OpenAPI Documentation
    const { DocumentBuilder, SwaggerModule } = require('@nestjs/swagger');
    const swaggerConfig = new DocumentBuilder()
        .setTitle('EthioHire SaaS API')
        .setDescription('Production-grade Multi-Tenant Overseas Recruitment Platform API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('v1/docs', app, document);

    const port = configService.get<number>('PORT') || 3000;
    await app.listen(port, '0.0.0.0');

    Logger.log(`🚀 EthioHire API running on http://localhost:${port}/v1`, 'Bootstrap');
    Logger.log(`📚 Swagger API Docs available at http://localhost:${port}/v1/docs`, 'Bootstrap');
}

bootstrap();
