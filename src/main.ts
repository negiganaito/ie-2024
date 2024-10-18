import 'dotenv/config';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import validationOptions from './utils/validation-options';
import { AllConfigType } from './config/config.type';
import { ResolvePromisesInterceptor } from './utils/serializer.interceptor';

async function bootstrap() {
  /**
   * - The NestFactory class is used to create a NestJS application.
   * The create() method creates an instance of the application,
   * with optional configurations like enabling CORS.
   *
   * - AppModule:  This is your root module in a NestJS application,
   * where all the main configurations and imported modules for the app are defined.
   */
  const app = await NestFactory.create(AppModule, { cors: true });

  /**
   * This sets up custom container logic, using class-validator's dependency injection.
   * It helps in validating custom classes using dependency injection.
   */
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  /**
   * This service allows you to access configuration values from your .env file
   * or other configuration sources. In your code, you’re getting the API prefix
   * and the port from the configuration.
   */
  const configService = app.get(ConfigService<AllConfigType>);

  app.enableShutdownHooks();

  /**
   * The setGlobalPrefix() method adds a prefix to all routes.
   * For example, if the API prefix is /api, all routes will be prefixed like /api/users.
   */
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  );

  /**
   * Enables API versioning, in this case through the URI (e.g., /v1/users).
   */
  app.enableVersioning({
    type: VersioningType.URI,
  });

  /**
   * Used to apply pipes (such as ValidationPipe) globally.
   * Pipes transform or validate incoming data before passing it to the controller.
   */
  app.useGlobalPipes(new ValidationPipe(validationOptions));

  /**
   * Interceptors are used to modify request/response behavior.
   * - ResolvePromisesInterceptor resolves promises in response objects,
   * which isn't handled by class-transformer by default.
   * - The ClassSerializerInterceptor transforms class instances
   * into plain objects for JSON serialization.
   */
  app.useGlobalInterceptors(
    // ResolvePromisesInterceptor is used to resolve promises in responses because class-transformer can't do it
    // https://github.com/typestack/class-transformer/issues/549
    new ResolvePromisesInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  /**
   * Swagger is used to generate API documentation.
   * The DocumentBuilder is used to configure the documentation options (like title, description, version),
   * and the SwaggerModule sets up the /docs endpoint for viewing the API documentation.
   */

  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  await app.listen(configService.getOrThrow('app.port', { infer: true }));
}
void bootstrap();
