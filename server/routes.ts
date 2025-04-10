import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  deviceValidationSchema, 
  deviceSearchSchema, 
  insertDeviceSchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import session from "express-session";
import MemoryStore from "memorystore";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      secret: "device-manager-session-secret",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Auth routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    // Set user in session
    if (req.session) {
      req.session.user = { id: user.id, username: user.username };
    }
    
    return res.status(200).json({ message: "Login successful" });
  });
  
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session?.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logout successful" });
    });
  });
  
  app.get("/api/auth/user", (req: Request, res: Response) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    return res.status(200).json({ user: req.session.user });
  });
  
  // Middleware to check authentication
  const checkAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  };
  
  // Device routes - protected by auth middleware
  app.get("/api/devices", checkAuth, async (req: Request, res: Response) => {
    try {
      const devices = await storage.getDevices();
      return res.status(200).json(devices);
    } catch (error) {
      console.error("Error fetching devices:", error);
      return res.status(500).json({ message: "Failed to fetch devices" });
    }
  });
  
  app.post("/api/devices", checkAuth, async (req: Request, res: Response) => {
    try {
      // Validate request body against schema
      const validationResult = deviceValidationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const newDevice = validationResult.data;
      
      // Check if a device with same deviceType and deviceId already exists
      const existingDevices = await storage.searchDevices({
        deviceType: newDevice.deviceType,
        deviceId: newDevice.deviceId
      });
      
      if (existingDevices.length > 0) {
        return res.status(409).json({ 
          message: "A device with this device type and ID already exists" 
        });
      }
      
      const device = await storage.createDevice(newDevice);
      return res.status(201).json(device);
    } catch (error) {
      console.error("Error creating device:", error);
      return res.status(500).json({ message: "Failed to create device" });
    }
  });
  
  app.post("/api/devices/search", checkAuth, async (req: Request, res: Response) => {
    try {
      // Validate search criteria
      const validationResult = deviceSearchSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const criteria = validationResult.data;
      const devices = await storage.searchDevices(criteria);
      return res.status(200).json(devices);
    } catch (error) {
      console.error("Error searching devices:", error);
      return res.status(500).json({ message: "Failed to search devices" });
    }
  });
  
  // New route to update a device
  app.put("/api/devices/:id", checkAuth, async (req: Request, res: Response) => {
    try {
      const deviceId = parseInt(req.params.id);
      if (isNaN(deviceId)) {
        return res.status(400).json({ message: "Invalid device ID" });
      }
      
      // Check if device exists
      const device = await storage.getDevice(deviceId);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      // Validate request body against update schema
      const validationResult = updateDeviceSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      // Update device
      const updates = validationResult.data;
      const updatedDevice = await storage.updateDevice(deviceId, updates);
      
      return res.status(200).json(updatedDevice);
    } catch (error) {
      console.error("Error updating device:", error);
      return res.status(500).json({ message: "Failed to update device" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
