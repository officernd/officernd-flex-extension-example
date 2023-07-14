import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService } from './config/config.service';
import { OAuthAPIClient } from './oauth-api-client/oauth-api-client.service';
import { HttpModule } from '@nestjs/axios';
import { SignaturesService } from './signatures/signatures.service';

@Module({
    imports: [
        HttpModule.register({
            timeout: 10000,
            maxRedirects: 5,
        }),
    ],
    controllers: [AppController],
    providers: [AppService, ConfigService, ConfigService, OAuthAPIClient, SignaturesService],
})
export class AppModule {}
