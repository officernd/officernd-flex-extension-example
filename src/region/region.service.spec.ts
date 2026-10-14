import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '../config/config.service';
import { RegionService } from './region.service';

describe('RegionService', () => {
    let service: RegionService;
    let configService: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [RegionService, ConfigService],
        }).compile();

        service = module.get<RegionService>(RegionService);
        configService = module.get<ConfigService>(ConfigService);
    });

    it('should keep the default host for Ireland', () => {
        expect(service.getRegionUrl('Ireland')).toBe(
            configService.officerndFlexUrl,
        );
    });

    it('should resolve Sydney to app-au', () => {
        expect(service.getRegionUrl('Sydney')).toBe(
            'https://app-au.officernd.com',
        );
    });

    it('should resolve Singapore to app-ap', () => {
        expect(service.getRegionUrl('Singapore')).toBe(
            'https://app-ap.officernd.com',
        );
    });

    it('should match regions case-insensitively', () => {
        expect(service.getRegionUrl(' sydney ')).toBe(
            'https://app-au.officernd.com',
        );
    });

    it('should fall back to the default host for an unknown region', () => {
        expect(service.getRegionUrl('Mars')).toBe(
            configService.officerndFlexUrl,
        );
        expect(service.getRegionUrl(undefined)).toBe(
            configService.officerndFlexUrl,
        );
    });
});
