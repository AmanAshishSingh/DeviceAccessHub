import { 
  users, 
  devices, 
  type User, 
  type InsertUser, 
  type Device, 
  type InsertDevice, 
  type DeviceSearch 
} from "@shared/schema";

// Define storage interface with CRUD methods
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Device operations
  getDevices(): Promise<Device[]>;
  getDevice(id: number): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: number, device: Partial<InsertDevice>): Promise<Device | undefined>;
  deleteDevice(id: number): Promise<boolean>;
  searchDevices(criteria: DeviceSearch): Promise<Device[]>;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private devices: Map<number, Device>;
  private userId: number;
  private deviceId: number;

  constructor() {
    this.users = new Map();
    this.devices = new Map();
    this.userId = 1;
    this.deviceId = 1;
    
    // Add default admin user
    this.createUser({
      username: "ubuntu",
      password: "EKM2800123Netra"
    });
    // Add initial device data
    const initialDevices = [
      { deviceType: "Krait2", deviceId: "6603041292", currentOTA: "4.6.10.rc.2_dev6", ipAddress: "172.16.16.141", sshUser: "root", password: "EKM2020123Krait" },
      { deviceType: "Krait2", deviceId: "6603070196", currentOTA: "4.6.10.rc.2_dev6", ipAddress: "172.16.18.250", sshUser: "root", password: "EKM2020123Krait" },
      { deviceType: "Krait1", deviceId: "264067598", currentOTA: "2.6.10.rc.1_dev7", ipAddress: "172.16.17.149", sshUser: "root", password: "EKM2020123Krait" },
      { deviceType: "Krait1", deviceId: "264062606", currentOTA: "2.6.10.rc.1_dev7", ipAddress: "172.16.23.249", sshUser: "root", password: "root" },
      { deviceType: "Bagheera2", deviceId: "3633042296", currentOTA: "3.6.10.rc.1_dev7", ipAddress: "172.16.17.235", sshUser: "ubuntu", password: "ubuntu1" },
      { deviceType: "Bagheera2", deviceId: "3633039070", currentOTA: "3.6.10.rc.1_dev7", ipAddress: "172.16.18.72", sshUser: "ubuntu", password: "ubuntu1" },
      { deviceType: "Bagheera3", deviceId: "103302400034", currentOTA: "5.6.10.rc.2_dev6", ipAddress: "172.16.19.252", sshUser: "ubuntu", password: "ubuntu1" },
      { deviceType: "Bagheera3", deviceId: "103212400422", currentOTA: "5.6.10.rc.2_dev6", ipAddress: "172.16.20.9", sshUser: "ubuntu", password: "ubuntu1" },
      { deviceType: "Bagheera3", deviceId: "103022400202", currentOTA: "5.6.10.rc.2_dev6", ipAddress: "172.16.18.37", sshUser: "ubuntu", password: "ubuntu1" },
      { deviceType: "Octo", deviceId: "125222400003", currentOTA: "7.6.10.rc.1", ipAddress: "172.16.17.227", sshUser: "ubuntu", password: "EKM2800123Netra" },
      { deviceType: "Octo", deviceId: "125122400018", currentOTA: "7.6.10.rc.1", ipAddress: "172.16.17.186", sshUser: "ubuntu", password: "EKM2800123Netra" },
      { deviceType: "Octo", deviceId: "125122400021", currentOTA: "7.6.10.rc.1", ipAddress: "172.16.16.61", sshUser: "ubuntu", password: "EKM2800123Netra" }
    ];

    initialDevices.forEach(device => {
      this.createDevice(device);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Device methods
  async getDevices(): Promise<Device[]> {
    return Array.from(this.devices.values());
  }
  
  async getDevice(id: number): Promise<Device | undefined> {
    return this.devices.get(id);
  }
  
  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const id = this.deviceId++;
    const device: Device = { ...insertDevice, id };
    this.devices.set(id, device);
    return device;
  }

  async updateDevice(id: number, updates: Partial<InsertDevice>): Promise<Device | undefined> {
    const device = this.devices.get(id);
    if (!device) {
      return undefined;
    }

    // Update the device with new values, keeping deviceType and deviceId unchanged
    const updatedDevice: Device = {
      ...device,
      ...updates,
      deviceType: device.deviceType, // Ensure these fields are not changed
      deviceId: device.deviceId
    };
    
    this.devices.set(id, updatedDevice);
    return updatedDevice;
  }
  
  async deleteDevice(id: number): Promise<boolean> {
    if (!this.devices.has(id)) {
      return false;
    }
    
    return this.devices.delete(id);
  }
  
  async searchDevices(criteria: DeviceSearch): Promise<Device[]> {
    return Array.from(this.devices.values()).filter(device => {
      // Match on provided criteria, if a field is not provided, it matches all
      const typeMatch = !criteria.deviceType || device.deviceType === criteria.deviceType;
      const idMatch = !criteria.deviceId || device.deviceId.includes(criteria.deviceId);
      const otaMatch = !criteria.currentOTA || device.currentOTA === criteria.currentOTA;
      
      return typeMatch && idMatch && otaMatch;
    });
  }
}

export const storage = new MemStorage();
