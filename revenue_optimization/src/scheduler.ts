import { Ad, Area, Schedule, ScheduledAd, PlacementEngine } from './placementEngine';
import { RevenueEngine } from './revenueEngine';

export class Scheduler {
    placementEngine: PlacementEngine;
    revenueEngine: RevenueEngine;

    constructor(placementEngine: PlacementEngine, revenueEngine: RevenueEngine) {
        this.placementEngine = placementEngine;
        this.revenueEngine = revenueEngine;
    }

    getNextAvailableStartTime(areaSchedule: ScheduledAd[]): number {
        if (areaSchedule.length === 0) return 0;

        const sortedAreaSchedule = [...areaSchedule].sort((a, b) => a.startTime - b.startTime);
        if (sortedAreaSchedule[0].startTime > 0) return 0;

        let currentEnd = sortedAreaSchedule[0].endTime;
        for (let i = 1; i < sortedAreaSchedule.length; i++) {
            const nextAd = sortedAreaSchedule[i];

            if (nextAd.startTime > currentEnd) {
                return currentEnd;
            }

            currentEnd = Math.max(currentEnd, nextAd.endTime);
        }

        return currentEnd;
    }

    isValidSchedule(
        schedule: Schedule,
        areas: Area[],
        ads: Ad[]
    ): boolean {
        const areasById = new Map(areas.map(area => [area.areaId, area]));
        const adsById = new Map(ads.map(ad => [ad.adId, ad]));

        for (const [areaId, areaSchedule] of Object.entries(schedule)) {
            const area = areasById.get(areaId);
            if (!area) return false;
            for (const scheduledAd of areaSchedule) {
                if (scheduledAd.areaId !== areaId) return false;
                if (!adsById.has(scheduledAd.adId)) return false;
            }
            if (!this.placementEngine.isAreaScheduleValid(area, areaSchedule, ads)) return false;
        }

        const allScheduledAds = Object.values(schedule).flat();
        const uniqueAdIds = new Set(allScheduledAds.map(scheduledAd => scheduledAd.adId));
        if (uniqueAdIds.size !== allScheduledAds.length) return false;

        return true;
    }

    compareSchedules(
        ads: Ad[],
        areas: Area[],
        scheduleA: Schedule,
        scheduleB: Schedule,
        decayRate: number
    ): number {
        let totalRevenueA = 0;
        let totalRevenueB = 0;
        let unusedTimeA = 0;
        let unusedTimeB = 0;

        for (const area of areas) {
            totalRevenueA += this.revenueEngine.getAreaRevenue(area, areas, scheduleA, ads, decayRate);
            totalRevenueB += this.revenueEngine.getAreaRevenue(area, areas, scheduleB, ads, decayRate);

            const areaScheduleA = scheduleA[area.areaId] ?? [];
            const areaScheduleB = scheduleB[area.areaId] ?? [];

            unusedTimeA += area.timeWindow - this.placementEngine.getTotalScheduledTimeForArea(areaScheduleA);
            unusedTimeB += area.timeWindow - this.placementEngine.getTotalScheduledTimeForArea(areaScheduleB);
        }

        if (totalRevenueA !== totalRevenueB) {
            return totalRevenueA - totalRevenueB;
        }

        if (unusedTimeA !== unusedTimeB) {
            return unusedTimeB - unusedTimeA;
        }

        const diversityA = this.revenueEngine.getAdvertiserDiversity(ads, scheduleA);
        const diversityB = this.revenueEngine.getAdvertiserDiversity(ads, scheduleB);
        if (diversityA !== diversityB) {
            return diversityA - diversityB;
        }

        return 0;
    }

    buildSchedule(
        ads: Ad[],
        areas: Area[],
        decayRate: number
    ): Schedule {
        if (ads.length === 0) return {};

        
    }
}
