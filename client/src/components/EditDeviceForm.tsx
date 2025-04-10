import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Device, OTA_VERSIONS } from "@/types/device";
import { Eye, EyeOff, Trash2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [operationType, setOperationType] = useState<'update' | 'delete'>('update');
  const [adminPassword, setAdminPassword] = useState('');
  const [isPasswordError, setIsPasswordError] = useState(false);
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
      const payload = {
        updates: data,
        password: adminPassword
      };
      const response = await apiRequest("PUT", `/api/devices/${device.id}`, payload);
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
      setShowPasswordDialog(false);
      setAdminPassword('');
      onEditComplete();
    },
    onError: (error: any) => {
      if (error.message?.includes("Invalid password")) {
        setIsPasswordError(true);
      } else {
        setShowPasswordDialog(false);
        toast({
          title: "Error",
          description: error.message || "Failed to update device",
          variant: "destructive",
        });
      }
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });
  
  // Define the mutation to delete a device
  const deleteDeviceMutation = useMutation({
    mutationFn: async () => {
      const payload = { password: adminPassword };
      const response = await apiRequest("DELETE", `/api/devices/${device.id}`, payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({
        title: "Success",
        description: "Device deleted successfully",
      });
      setShowDeleteDialog(false);
      setShowPasswordDialog(false);
      setAdminPassword('');
      onEditComplete();
    },
    onError: (error: any) => {
      if (error.message?.includes("Invalid password")) {
        setIsPasswordError(true);
      } else {
        setShowPasswordDialog(false);
        toast({
          title: "Error",
          description: error.message || "Failed to delete device",
          variant: "destructive",
        });
      }
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    setOperationType('update');
    setShowPasswordDialog(true);
  };
  
  // Handle delete request
  const handleDelete = () => {
    setShowDeleteDialog(false);
    setOperationType('delete');
    setShowPasswordDialog(true);
  };
  
  // Handle admin password confirmation
  const handlePasswordConfirm = () => {
    setIsSubmitting(true);
    setIsPasswordError(false);
    
    if (operationType === 'update') {
      editDeviceMutation.mutate(form.getValues());
    } else {
      deleteDeviceMutation.mutate();
    }
  };

  return (
    <>
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

          <div className="flex justify-between gap-2 pt-2">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={() => setShowDeleteDialog(true)}
              disabled={isSubmitting}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Delete Device
            </Button>
            
            <div className="flex gap-2">
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
          </div>
        </form>
      </Form>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this device? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-neutral-700">Device Type:</p>
                <p>{device.deviceType}</p>
              </div>
              <div>
                <p className="font-medium text-neutral-700">Device ID:</p>
                <p>{device.deviceId}</p>
              </div>
              <div>
                <p className="font-medium text-neutral-700">IP Address:</p>
                <p>{device.ipAddress}</p>
              </div>
              <div>
                <p className="font-medium text-neutral-700">OTA Version:</p>
                <p>{device.currentOTA}</p>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
            >
              Delete Device
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Password Confirmation Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Admin Password</DialogTitle>
            <DialogDescription>
              {operationType === 'update' 
                ? "Please enter your admin password to update this device."
                : "Please enter your admin password to delete this device."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className={isPasswordError ? "border-destructive" : ""}
                />
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
              {isPasswordError && (
                <p className="text-sm text-destructive">Invalid password. Please try again.</p>
              )}
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setIsPasswordError(false);
                setAdminPassword('');
                if (operationType === 'delete') {
                  setShowDeleteDialog(false);
                }
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handlePasswordConfirm}
              disabled={!adminPassword || isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}