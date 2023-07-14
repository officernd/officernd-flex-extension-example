import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from './config/config.service';
import {
    GRANT_TYPE,
    OAuthAPIClient,
} from './oauth-api-client/oauth-api-client.service';

export interface IntegrationSettings {
    baseUrl: string;
    integrationSecret: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
}

interface RequestOptions {
    authToken?: string;
}

@Injectable()
export class AppService {
    constructor(
        private readonly configService: ConfigService,
        private readonly oauthAPIClient: OAuthAPIClient,
        private readonly httpService: HttpService,
    ) {}

    private async callApi(
        url: string,
        verb: 'GET' | 'POST' | 'PUT',
        queryString: string,
        options: RequestOptions,
    ) {
        const headers = {
            'Accept-Encoding': 'gzip,deflate,compress',
            Authorization: options.authToken
                ? `Bearer ${options.authToken}`
                : '',
        };
        const rawResponse = await this.httpService.axiosRef.request({
            url: `${url}${queryString}`,
            method: verb,
            headers,
        });

        return rawResponse.data;
    }

    public async getOfficerndFlexOrganization(
        orgSlug: string,
        accessToken: string,
        baseUrl: string,
    ): Promise<{ name: string; regionInfo: { regionUrl: string } }> {
        const org = await this.callApi(
            `${baseUrl}/api/v1/organizations/${orgSlug}`,
            'GET',
            '',
            {
                authToken: accessToken,
            },
        );

        return org;
    }

    private async getOfficerndFlexIntegration(
        orgSlug: string,
        access_token: string,
        baseUrl: string,
        integrationId: string,
    ) {
        const integration = await this.callApi(
            `${baseUrl}/api/v1/organizations/${orgSlug}/integrations/${integrationId}`,
            'GET',
            `?appClientId=${this.configService.officerndFlexOAuthConfig.clientId}`,
            {
                authToken: access_token,
            },
        );

        return integration;
    }

    async connectToOfficerndFlex(
        orgSlug: string,
        integrationId: string,
        authCode: string,
    ): Promise<IntegrationSettings> {
        let flexRegionUrl = this.configService.officerndFlexUrl || '';
        const credentials = {
            code: authCode,
        };
        // Aquire an access token and refresh token. Note that refresh token should be used to refresh the access token later on.
        const { access_token, refresh_token, expires_in } =
            await this.oauthAPIClient.getAccessToken(
                credentials,
                GRANT_TYPE.authorizationCode,
            );

        // Get the actual organization API endpoint, depending on the region, so we call the right region
        const org = await this.getOfficerndFlexOrganization(
            orgSlug,
            access_token,
            flexRegionUrl,
        );
        flexRegionUrl = org.regionInfo.regionUrl;

        // Get the integration secret and save it for later, so we can validate follow up requests
        const integration = await this.getOfficerndFlexIntegration(
            orgSlug,
            access_token,
            flexRegionUrl,
            integrationId,
        );

        // TODO: Configure disconnect webhook, so we clean up the integration if disconnected.

        return {
            baseUrl: flexRegionUrl,
            integrationSecret: integration.settings.secret,
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresIn: expires_in,
        };
    }
}
