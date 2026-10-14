import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

@Injectable()
export class RegionService {
    private readonly logger = new Logger(RegionService.name);

    constructor(private readonly configService: ConfigService) {}

    // Maps the `region` of an OfficeRnD Flex organization (e.g. 'Ireland', 'Sydney', 'Singapore') to the API host of that region
    getRegionUrl(region: string): string {
        const regionUrls = this.configService.officerndFlexRegionUrls;
        const regionKey = Object.keys(regionUrls).find(
            (key) => key.toLowerCase() === region?.trim().toLowerCase(),
        );

        if (!regionKey) {
            this.logger.warn(
                `Unknown organization region "${region}", falling back to ${this.configService.officerndFlexUrl}`,
            );
            return this.configService.officerndFlexUrl;
        }

        return regionUrls[regionKey];
    }
}
