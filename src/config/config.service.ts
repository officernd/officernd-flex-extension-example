import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
    get officerndFlexUrl(): string {
        return 'https://app.officernd.com';
    }

    get officerndFlexOAuthConfig() {
        return {
            oauthUrl: 'https://identity.officernd.com',
            clientId: '****', // Replace with your client id
            clientSecret: '****', // Replace with your client secret
        };
    }

    get currentEnvUrl(): string {
        return 'https://ec3a-78-130-149-149.ngrok-free.app'; // Replace with your domain
    }
}
