import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { ConfigService } from 'src/config/config.service';

interface OauthCredentials {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    accessToken: string;
    code: string;
    redirect_uri: string;
}

interface OAuthQuery {
    client_id: string;
    client_secret: string;
    grant_type: string;
    scope: string;
    code?: string;
    redirect_uri?: string;
    refresh_token?: string;
    access_token?: string;
}

export enum GRANT_TYPE {
    authorizationCode = 'authorization_code',
    clientCredentials = 'client_credentials',
    refreshToken = 'refresh_token',
}
@Injectable()
export class OAuthAPIClient {
    constructor(
        private readonly configService: ConfigService,
        private httpService: HttpService,
    ) {}

    private async requestAccessToken(
        credentials: Partial<OauthCredentials>,
        grantType: GRANT_TYPE,
    ): Promise<any> {
        const { oauthUrl, clientId, clientSecret } =
            this.configService.officerndFlexOAuthConfig;
        const requestUrl = `${oauthUrl}/oauth/token`;

        const queryParams: Partial<OAuthQuery> = {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: grantType,
            scope: 'officernd.api.read officernd.api.write',
        };

        if (credentials.code) {
            queryParams.code = credentials.code;
            queryParams.redirect_uri = `${this.configService.currentEnvUrl}/integration/connect`;
        }

        if (grantType === GRANT_TYPE.refreshToken) {
            queryParams.refresh_token = credentials.refreshToken;
            queryParams.access_token = credentials.accessToken;
        }

        const body = new URLSearchParams(queryParams);
        const result = await this.httpService.axiosRef.post(requestUrl, body, {
            timeout: 3000,
            headers: { 'Accept-Encoding': 'gzip,deflate,compress' },
        });

        return result.data;
    }

    async getAccessToken(
        credentials: {
            accessToken?: string;
            validUntil?: Date;
            refreshToken?: string;
            code?: string;
        },
        grantType: GRANT_TYPE,
    ): Promise<any> {
        // check if the token will be valid in the next minute
        const isTokenValid =
            credentials.accessToken &&
            credentials.validUntil &&
            dayjs(credentials.validUntil).isAfter(dayjs().add(1, 'minute'));

        if (isTokenValid) {
            return { access_token: credentials.accessToken };
        } else {
            if (
                grantType === GRANT_TYPE.authorizationCode &&
                !credentials.code
            ) {
                return this.requestAccessToken(
                    credentials,
                    GRANT_TYPE.refreshToken,
                );
            }
            return this.requestAccessToken(credentials, grantType);
        }
    }
}
