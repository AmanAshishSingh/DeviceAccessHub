import { pgTable, text, serial, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  deviceType: varchar("device_type", { length: 255 }).notNull(),
  deviceId: varchar("device_id", { length: 255 }).notNull(),
  currentOTA: varchar("current_ota", { length: 255 }).notNull(),
  ipAddress: varchar("ip_address", { length: 255 }).notNull(),
  sshUser: varchar("ssh_user", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = typeof devices.$inferSelect;

// Add validation
export const deviceValidationSchema = z.object({
  deviceType: z.string().min(1, { message: "Device type is required" }),
  deviceId: z.string().min(1, { message: "Device ID is required" }).regex(/^[0-9]+$/, { 
    message: "Device ID must contain only numbers" 
  }),
  currentOTA: z.string().min(1, { message: "OTA version is required" }),
  ipAddress: z.string().min(1, { message: "IP address is required" }).regex(/^([0-9]{1,3}\.){3}[0-9]{1,3}$/, { 
    message: "Valid IP address is required (e.g. 192.168.1.1)" 
  }),
  sshUser: z.string().min(1, { message: "SSH username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// For search functionality
export const deviceSearchSchema = z.object({
  deviceType: z.string().optional(),
  deviceId: z.string().optional(),
  currentOTA: z.string().optional(),
});

export type DeviceSearch = z.infer<typeof deviceSearchSchema>;
