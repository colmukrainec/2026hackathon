/**
 * CHALLENGE 3: Minimum Technicians — Fix All Boxes Within a Deadline
 *
 * All boxes must be repaired within deadlineMinutes. All technicians start
 * from the SAME location. Each box is assigned to exactly one technician
 * (no overlapping). Your goal: find the MINIMUM number of technicians needed
 * so that every technician finishes all their assigned boxes on time.
 *
 * Do NOT modify any interface or the pre-implemented helper methods.
 * Implement every method marked with TODO.
 */

export interface Location {
    latitude: number;
    longitude: number;
}

export interface Box {
    id: string;
    name: string;
    location: Location;
    /** Minutes needed to fully repair this box. */
    fixTimeMinutes: number;
}

export interface TechnicianAssignment {
    /** Label for this technician, e.g. "Technician 1", "Technician 2", … */
    technicianLabel: string;
    /** Ordered list of box IDs this technician will visit and fix. */
    assignedBoxIds: string[];
    /** Total time used (travel + fix). Must be ≤ deadlineMinutes. */
    totalTimeMinutes: number;
}

export interface TeamSizeResult {
    /** Minimum number of technicians needed. Equals assignments.length. */
    techniciansNeeded: number;
    /** One entry per technician. No box ID appears in more than one entry. */
    assignments: TechnicianAssignment[];
    /** True when all boxes are assigned and every technician finishes on time. */
    feasible: boolean;
}

export class TeamSizer {

    // ── Pre-implemented helpers — do not modify ───────────────────────────────

    /**
     * Returns the great-circle distance in kilometres between two GPS
     * coordinates using the Haversine formula (Earth radius = 6 371 km).
     */
    haversineDistance(loc1: Location, loc2: Location): number {
        const R = 6371;
        const toRad = (deg: number) => (deg * Math.PI) / 180;
        const dLat = toRad(loc2.latitude  - loc1.latitude);
        const dLng = toRad(loc2.longitude - loc1.longitude);
        const lat1 = toRad(loc1.latitude);
        const lat2 = toRad(loc2.latitude);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    /**
     * Returns the travel time in minutes between two locations at a given speed.
     *   travelTimeMinutes = (distanceKm / speedKmh) × 60
     */
    travelTimeMinutes(loc1: Location, loc2: Location, speedKmh: number): number {
        return (this.haversineDistance(loc1, loc2) / speedKmh) * 60;
    }

    // ── Your implementation below ─────────────────────────────────────────────

    calculateAssignmentDuration(
        startLocation: Location,
        speedKmh: number,
        boxes: Box[],
        routeIds: string[]
    ): number | null {
        const boxMap = new Map<string, Box>();
        for (const b of boxes) { // pre-map boxes by ID for quick lookup
            boxMap.set(b.id, b);
        }

        let total = 0;
        let current = startLocation;

        for (const id of routeIds) { // for each box ID in the route
            const box = boxMap.get(id);
            if (!box) return null;

            total += this.travelTimeMinutes(current, box.location, speedKmh); // add travel time to next box
            total += box.fixTimeMinutes;
            current = box.location;
        }

        return total;
    }

    tryAssign(
        startLocation: Location,
        speedKmh: number,
        boxes: Box[],
        numTechnicians: number,
        deadlineMinutes: number
    ): TechnicianAssignment[] | null {
        if (numTechnicians < 0) return null;
        if (boxes.length === 0) {
            const assignments: TechnicianAssignment[] = [];

            for (let i = 0; i < numTechnicians; i++) {
                assignments.push({
                    technicianLabel: `Technician ${i + 1}`,
                    assignedBoxIds: [],
                    totalTimeMinutes: 0
                });
            }

            return assignments;
        }
        if (numTechnicians === 0) return null;

        //if one box alone cannot fit, no assignment can work.
        for (const box of boxes) {
            const singleBoxTime =
                this.travelTimeMinutes(startLocation, box.location, speedKmh) +
                box.fixTimeMinutes;
            if (singleBoxTime > deadlineMinutes) {
                return null;
            }
        }

        // Keep routes and running totals per technician.
        const routes: string[][] = Array.from({ length: numTechnicians }, () => []);
        const totals: number[] = new Array(numTechnicians).fill(0);
        const lastLocs: Location[] = Array.from({ length: numTechnicians }, () => startLocation);

        // Assign harder boxes first (greedy bin-packing style)
        const sorted = [...boxes].sort((a, b) => {
            if (b.fixTimeMinutes !== a.fixTimeMinutes) {
                return b.fixTimeMinutes - a.fixTimeMinutes;
            }
            return a.id.localeCompare(b.id);
        });
        
        // For each box, find the technician who can take it with the least added time:
        for (const box of sorted) {
            let bestTech = -1;
            let bestAddedTime = Number.POSITIVE_INFINITY;

            for (let t = 0; t < numTechnicians; t++) {
                const travel = this.travelTimeMinutes(lastLocs[t], box.location, speedKmh);
                const added = travel + box.fixTimeMinutes;
                const newTotal = totals[t] + added;

                if (newTotal <= deadlineMinutes) {
                    if (
                        added < bestAddedTime ||
                        (added === bestAddedTime && t < bestTech)
                    ) {
                        bestAddedTime = added;
                        bestTech = t;
                    }
                }
            }

            // No technician can take this box within deadline.
            if (bestTech === -1) return null;

            routes[bestTech].push(box.id);
            totals[bestTech] += bestAddedTime;
            lastLocs[bestTech] = box.location;
        }

        const assignments: TechnicianAssignment[] = [];
        for (let t = 0; t < numTechnicians; t++) {
            assignments.push({
                technicianLabel: `Technician ${t + 1}`,
                assignedBoxIds: routes[t],
                totalTimeMinutes: totals[t]
            });
        }

        return assignments;
    }

    findMinimumTeamSize(
        startLocation: Location,
        speedKmh: number,
        boxes: Box[],
        deadlineMinutes: number
    ): TeamSizeResult {
        if (boxes.length === 0) {
            return {
                techniciansNeeded: 0,
                assignments: [],
                feasible: true
            };
        }

        // Lower bound: total minimum effort if every box were done directly from start.
        let minPossibleTotal = 0;
        for (const box of boxes) {
            const single =
                this.travelTimeMinutes(startLocation, box.location, speedKmh) +
                box.fixTimeMinutes;

            // Immediate global impossible case.
            if (single > deadlineMinutes) {
                return {
                    techniciansNeeded: 0,
                    assignments: [],
                    feasible: false
                };
            }
            minPossibleTotal += single;
        }

        const lowerBound = Math.max(1, Math.ceil(minPossibleTotal / deadlineMinutes));

        for (let n = lowerBound; n <= boxes.length; n++) {
            const assignments = this.tryAssign(
                startLocation,
                speedKmh,
                boxes,
                n,
                deadlineMinutes
            );

            if (assignments !== null) {
                return {
                    techniciansNeeded: n,
                    assignments,
                    feasible: true
                };
            }
        }

        return {
            techniciansNeeded: 0,
            assignments: [],
            feasible: false
        };
    }
}
