import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Logger,
    Param,
    Post,
    Query,
    Redirect,
    Res,
    Headers,
} from '@nestjs/common';
import { AppService, IntegrationSettings } from './app.service';
import { ConfigService } from './config/config.service';
import { SignaturesService } from './signatures/signatures.service';
import { Response } from 'express';

interface FlexIntegrationPageQuery {
    slug: string;
    organizationId: string;
    memberId: string;
    locations: string;
    signature: string;
}

// NOTE: Use this as a temporary storage for the integration settings. Replace with database storage.
let integrationSettings: IntegrationSettings = null;

@Controller('/integration')
export class AppController {
    private readonly logger = new Logger(AppController.name);
    constructor(
        private readonly appService: AppService,
        private readonly configService: ConfigService,
        private readonly signaturesService: SignaturesService,
    ) {}

    @Get('/connect')
    @Redirect('', 302)
    async connectIntegration(
        @Query('code') authCode: string,
        @Query('org_slug') orgSlug: string,
        @Query('integrationId') integrationId: string,
    ): Promise<{ url: string }> {
        const rootUrl = this.configService.officerndFlexUrl || '';
        try {
            if (authCode) {
                integrationSettings =
                    await this.appService.connectToOfficerndFlex(
                        orgSlug,
                        integrationId,
                        authCode,
                    );

                return {
                    url: `${integrationSettings.baseUrl}/connect/external-integration/return`,
                };
            }

            this.logger.error('No auth code provided');
        } catch (error) {
            const errorMessage = error.response?.data || error.message;
            this.logger.error(errorMessage, error);
        }

        return {
            url: `${rootUrl}/connect/external-integration/return`,
        };
    }

    @Get('/healthcheck')
    async checkIntegration(
        @Query() query: FlexIntegrationPageQuery,
    ): Promise<object> {
        await this.verifyPageSignature(query);

        return { accountName: 'Cool Integration' };
    }

    @Get('/configure')
    async preapreConfigureIntegration(
        @Res() res: Response,
        @Query() query: FlexIntegrationPageQuery,
    ) {
        await this.verifyPageSignature(query);

        // this.getOfficerndFlexOrganization(
        const org = await this.appService.getOfficerndFlexOrganization(
            query.slug,
            integrationSettings.accessToken,
            integrationSettings.baseUrl,
        );
        return res.send(
            `Configure page UI for configuring integration for ${org.name} goes here!`,
        );
    }

    @Post('/remove/:orgId')
    async remove(
        @Param('orgId') orgId: string,
        @Headers() headers: any,
        @Body() body: any,
    ) {
        const payload = body;
        const signature = headers['officernd-signature'];

        await this.verifyIncomingWebhook(orgId, signature, payload);
    }

    private async verifyIncomingWebhook(
        orgId: string,
        signatureString: string,
        payload: any,
    ) {
        const secret = await this.appService.getFlexWebhookSecret(orgId);

        this.signaturesService.verifySignedData(
            signatureString,
            payload,
            secret,
        );
    }

    private async verifyPageSignature(query: FlexIntegrationPageQuery) {
        const { organizationId: flexOrgId } = query;
        const secret = integrationSettings?.integrationSecret;

        if (secret) {
            const { signature, ...restQuery } = query;
            this.signaturesService.verifySignedData(
                signature,
                restQuery,
                secret,
            );

            return {
                originId: flexOrgId as string,
                originSlug: query.slug as string,
            };
        } else {
            throw new HttpException(
                'No secret found for this organization',
                HttpStatus.UNAUTHORIZED,
            );
        }
    }
}
