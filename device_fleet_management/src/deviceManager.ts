export interface Device {
    id: string;
    name: string;
    version: string;
    user_id: string;
    status: 'active' | 'inactive';
    location: {
        latitude: number;
        longitude: number;
    };
}

export interface Location {
  latitude: number;   // decimal degrees
  longitude: number;  // decimal degrees
}

function haversineDistance(loc1: Location, loc2: Location): number {
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

export class DeviceManager {
    devices: Device[] = [];

    // constructor, gets called when a new instance of the class is created
    constructor() {
      this.devices = [];
    }

    addDevice(device: Device): void {
      if (!device.id) {
        throw new Error('Device must have an id');
      }
      if (this.devices.find(d => d.id === device.id)) {
        throw new Error(`Device with id ${device.id} already exists`);
      }
      this.devices.push(device);
    }

    removeDevice(id: string): void {
      if (!this.devices.find(d => d.id === id)) {
        throw new Error(`Device with id ${id} not found`);
      }
      this.devices = this.devices.filter(d => d.id !== id);
    }

    getDevice(id: string): Device | null {
      return this.devices.find(d => d.id === id) ?? null;
    }

    getDevicesByVersion(version: string): Device[] | null {
      return this.devices.filter(d => d.version === version);
    }

    getDevicesByUserId(user_id: string): Device[] | null {
      return this.devices.filter(d => d.user_id === user_id);
    }

    getDevicesByStatus(status: 'active' | 'inactive' | 'pending' | 'failed'): Device[] | null {
      return this.devices.filter(d => d.status === status);
    }

    getDevicesInArea(latitude: number, longitude: number, radius_km: number): Device[] | null {
      // returns all devices within a radius of the given latitude and longitude
      // the radius is in kilometers
      return this.devices.filter(d => {
        const distance = haversineDistance({ latitude, longitude } as Location, d.location);
        return distance <= radius_km;
      });
    } 

    getDevicesNearDevice(device_id: string, radius_km: number): Device[] | null {
      // returns all devices within a radius of the given device (not including the device itself)
      // the radius is in kilometers
      const sourceDevice = this.devices.find(d => d.id === device_id);
      if (!sourceDevice) {
        return null;
      }

      return this.devices
        .filter(d => d.id !== device_id)
        .filter(d => {
          const distance = haversineDistance(sourceDevice.location, d.location);
          return distance <= radius_km;
        });
    }

    getAllDevices(): Device[] {
        return this.devices;
    }

    getDeviceCount(): number {
        return this.devices.length;
    }
}
