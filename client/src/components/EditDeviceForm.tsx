import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Device, OTA_VERSIONS } from "@/types/device";
import { Eye, EyeOff } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Validation schema for editing a device
const editDeviceSchema = z.object({
  currentOTA: z.string().min(1, { message: "OTA version is required" }),
  ipAddress: z.string().min(1, { message: "IP address is required" }).regex(/^([0-9]{1,3}\.){3}[0-9]{1,3}$/, { 
    message: "Valid IP address is required (e.g. 192.168.1.1)" 
  }),
  sshUser: z.string().min(1, { message: "SSH username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type FormValues = z.infer<typeof editDeviceSchema>;

interface EditDeviceFormProps {
  device: Device;
  onEditComplete: () => void;
}

export default function EditDeviceForm({ device, onEditComplete }: EditDeviceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create form with default values from the device
  const form = useForm<FormValues>({
    resolver: zodResolver(editDeviceSchema),
    defaultValues: {
      currentOTA: device.currentOTA,
      ipAddress: device.ipAddress,
      sshUser: device.sshUser,
      password: device.password,
    },
  });

  // Define the mutation to update a device
  const editDeviceMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("PUT", `/api/devices/${device.id}`, data);
      const updatedDevice = await response.json();
      return updatedDevice;
    },
    onSuccess: () => {
      // Invalidate the devices query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({
        title: "Success",
        description: "Device updated successfully",
      });
      onEditComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update device",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    editDeviceMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Show device type and ID as read-only */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Device Type</label>
            <Input value={device.deviceType} disabled />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Device ID</label>
            <Input value={device.deviceId} disabled />
          </div>
        </div>

        {/* OTA Version input field with autocomplete */}
        <FormField
          control={form.control}
          name="currentOTA"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OTA Version</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter OTA version (e.g. 5.6.10.rc.2_dev6)" 
                  {...field} 
                  disabled={isSubmitting}
                  list="edit-ota-versions"
                />
              </FormControl>
              {/* Provide datalist for autocomplete of common OTA versions */}
              <datalist id="edit-ota-versions">
                {OTA_VERSIONS.map((version) => (
                  <option key={version} value={version} />
                ))}
              </datalist>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* IP Address input field */}
        <FormField
          control={form.control}
          name="ipAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IP Address</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 192.168.1.1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SSH User input field */}
        <FormField
          control={form.control}
          name="sshUser"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SSH User</FormLabel>
              <FormControl>
                <Input placeholder="e.g. root" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password input field with visibility toggle */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Device password" 
                    {...field} 
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-neutral-400 hover:text-neutral-600"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onEditComplete}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Device"}
          </Button>
        </div>
      </form>
    </Form>
  );
}