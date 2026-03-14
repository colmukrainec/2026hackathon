import { Ad, Area, Schedule, ScheduledAd, PlacementEngine } from './placementEngine';

export class RevenueEngine {
    placementEngine: PlacementEngine;

    constructor(placementEngine: PlacementEngine) {
        this.placementEngine = placementEngine;
    }

    getAdvertiserScheduleCount(
        advertiserId: string,
        ads: Ad[],
        schedule: Schedule
    ): number {
        return Object.values(schedule).flat().filter(scheduledAd => ads.find(ad => ad.adId === scheduledAd.adId)?.advertiserId === advertiserId).length;
    }

    calculateDiminishedRevenue(
        baseRevenue: number,
        advertiserScheduledCount: number,
        decayRate: number
    ): number {
        return advertiserScheduledCount === 0 ? baseRevenue : baseRevenue * Math.pow(decayRate, advertiserScheduledCount);
    }

    calculatePlacementRevenue(
        ad: Ad,
        areas: Area[],
        ads: Ad[],
        schedule: Schedule,
        decayRate: number
    ): number {
        const scheduledPlacements = Object.values(schedule).flat();
        const targetPlacement = scheduledPlacements.find((placement) => placement.adId === ad.adId);
        if (!targetPlacement) return 0;

        const targetArea = areas.find((candidateArea) => candidateArea.areaId === targetPlacement.areaId);
        if (!targetArea) return 0;

        const targetRawRevenue = ad.baseRevenue * targetArea.multiplier;

        const sameAdvertiserPlacements: { adId: string; startTime: number; rawRevenue: number }[] = [];

        for (const placement of scheduledPlacements) {
            const placementAd = ads.find((candidateAd) => candidateAd.adId === placement.adId);
            if (!placementAd || placementAd.advertiserId !== ad.advertiserId) {
                continue;
            }

            const placementArea = areas.find((candidateArea) => candidateArea.areaId === placement.areaId);
            if (!placementArea) {
                continue;
            }

            sameAdvertiserPlacements.push({
                adId: placement.adId,
                startTime: placement.startTime,
                rawRevenue: placementAd.baseRevenue * placementArea.multiplier,
            });
        }

        sameAdvertiserPlacements.sort((a, b) => {
            if (a.startTime !== b.startTime) return a.startTime - b.startTime;
            if (a.rawRevenue !== b.rawRevenue) return a.rawRevenue - b.rawRevenue;
            return a.adId.localeCompare(b.adId);
        });

        const advertiserIndex = sameAdvertiserPlacements.findIndex((placement) => placement.adId === ad.adId);
        return this.calculateDiminishedRevenue(targetRawRevenue, advertiserIndex, decayRate);
    }

    getAdvertiserDiversity(ads: Ad[], schedule: Schedule): number {
        return Object.values(schedule).flat().map(scheduledAd => ads.find(ad => ad.adId === scheduledAd.adId)?.advertiserId).filter((advertiserId, index, self) => self.indexOf(advertiserId) === index).length;
    }

    getAreaRevenue(
        area: Area,
        areasArray: Area[],
        fullSchedule: Schedule,
        ads: Ad[],
        decayRate: number
    ): number {
        const areaSchedule = fullSchedule[area.areaId] ?? [];
        const totalRevenue = areaSchedule.reduce((acc, scheduledAd) => {
            const ad = ads.find(ad => ad.adId === scheduledAd.adId);
            if (!ad) return acc;
            return acc + this.calculatePlacementRevenue(ad, areasArray, ads, fullSchedule, decayRate);
        }, 0);
        return totalRevenue;
    }
}