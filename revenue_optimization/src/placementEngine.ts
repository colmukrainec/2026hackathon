export interface Ad {
    adId: string;
    advertiserId: string;
    timeReceived: number;
    timeout: number;
    duration: number;
    baseRevenue: number;
    bannedLocations: string[];
}

export interface Area {
    areaId: string;
    location: string;
    multiplier: number;
    totalScreens: number;
    timeWindow: number;
}

export interface ScheduledAd {
    adId: string;
    areaId: string;
    startTime: number;
    endTime: number;
}

export type Schedule = Record<string, ScheduledAd[]>;

export class PlacementEngine {

    constructor() {
    }

    isAdCompatibleWithArea(ad: Ad, area: Area): boolean {
        return ad.bannedLocations.filter(location => location === area.location).length === 0;
    }

    getTotalScheduledTimeForArea(areaSchedule: ScheduledAd[]): number {
        return areaSchedule.reduce((acc, ad) => acc + (ad.endTime - ad.startTime), 0);
    }

    doesPlacementFitTimingConstraints(
        ad: Ad,
        area: Area,
        startTime: number
    ): boolean {
        const endTime = startTime + ad.duration;
        const latestAllowedStart = ad.timeReceived + ad.timeout;

        return (
            startTime >= 0 &&
            startTime >= ad.timeReceived &&
            startTime <= latestAllowedStart &&
            endTime <= area.timeWindow
        );
    }

    isAdAlreadyScheduled(adId: string, schedule: Schedule): boolean {
        return Object.values(schedule).flat().some(ad => ad.adId === adId);
    }

    canScheduleAd(
        ad: Ad,
        area: Area,
        schedule: Schedule,
        startTime: number
    ): boolean {
        const areaSchedule = schedule[area.areaId] ?? [];

        const candidateStart = startTime;
        const candidateEnd = candidateStart + ad.duration;

        return !areaSchedule.some(
            existingAd =>
                candidateStart < existingAd.endTime &&
                candidateEnd > existingAd.startTime
        ) &&
            !this.isAdAlreadyScheduled(ad.adId, schedule) &&
            this.isAdCompatibleWithArea(ad, area) &&
            this.doesPlacementFitTimingConstraints(ad, area, startTime);
    }

    isAreaScheduleValid(area: Area, areaSchedule: ScheduledAd[], ads: Ad[]): boolean {
        const adsById = new Map(ads.map((ad) => [ad.adId, ad]));

        // TODO: move this outside the function??
        const isScheduledAdEntryValid = (scheduledAd: ScheduledAd): boolean => {
            const ad = adsById.get(scheduledAd.adId);
            if (!ad) {
                return false;
            }

            const hasExpectedArea = scheduledAd.areaId === area.areaId;
            const hasValidInterval = scheduledAd.endTime > scheduledAd.startTime;
            const hasExpectedDuration =
                scheduledAd.endTime - scheduledAd.startTime === ad.duration;

            return (
                hasExpectedArea &&
                hasValidInterval &&
                hasExpectedDuration &&
                this.isAdCompatibleWithArea(ad, area) &&
                this.doesPlacementFitTimingConstraints(ad, area, scheduledAd.startTime)
            );
        };

        const sortedSchedule = [...areaSchedule].sort(
            (a, b) => a.startTime - b.startTime || a.endTime - b.endTime
        );

        const hasOverlap = sortedSchedule.some((currentAd, index) => {
            if (index === 0) {
                return false;
            }

            const previousAd = sortedSchedule[index - 1];
            return currentAd.startTime < previousAd.endTime;
        });

        return areaSchedule.every(isScheduledAdEntryValid) && !hasOverlap;
    }
}