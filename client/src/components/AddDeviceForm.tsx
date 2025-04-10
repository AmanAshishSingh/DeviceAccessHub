import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { deviceValidationSchema } from "@shared/schema";
import { 
  DEFAULT_DEVICE_FORM_VALUES, 
  DEVICE_TYPES, 
  OTA_VERSIONS_BY_TYPE 
} from "@/types/device";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FormValues = z.infer<typeof deviceValidationSchema>;

export default function AddDeviceForm() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [availableOTAVersions, setAvailableOTAVersions] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(deviceValidationSchema),
    defaultValues: DEFAULT_DEVICE_FORM_VALUES,
  });
  
  // Watch device type to update OTA versions
  const deviceType = form.watch("deviceType");
  
  // Helper function to get OTA versions for a device type
  const getOtaVersionsForDeviceType = (type: string) => {
    if (type === "Krait1" || type === "Krait2" || type === "Bagheera2" || 
        type === "Bagheera3" || type === "Octo") {
      return OTA_VERSIONS_BY_TYPE[type as keyof typeof OTA_VERSIONS_BY_TYPE];
    }
    return [];
  };

  // Update available OTA versions when device type changes
  useEffect(() => {
    if (deviceType) {
      const versions = getOtaVersionsForDeviceType(deviceType);
      setAvailableOTAVersions(versions);
      
      // Clear the current OTA version if it doesn't match the device type
      const currentOTA = form.getValues("currentOTA");
      if (currentOTA && versions.length > 0 && !versions.includes(currentOTA)) {
        form.setValue("currentOTA", "");
      }
    } else {
      setAvailableOTAVersions([]);
    }
  }, [deviceType, form]);
  
  // Helper function to get OTA version description for selected device type
  const getOtaHelperText = () => {
    if (!deviceType) return "";
    
    const prefix = deviceType === "Krait1" ? "2.x"
                 : deviceType === "Krait2" ? "4.x"
                 : deviceType === "Bagheera2" ? "3.x"
                 : deviceType === "Bagheera3" ? "5.x"
                 : deviceType === "Octo" ? "7.x"
                 : "";
                 
    return prefix ? `This device type uses OTA versions starting with ${prefix}` : "";
  };

  const addDeviceMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const payload = {
        deviceData: data,
        password: adminPassword
      };
      const response = await apiRequest("POST", "/api/devices", payload);
      return response.json();
    },
    onSuccess: () => {
      // Reset form and show success message
      form.reset(DEFAULT_DEVICE_FORM_VALUES);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setShowPasswordDialog(false);
      setAdminPassword('');
      setIsPasswordError(false);
    },
    onError: (error: any) => {
      if (error.message?.includes("Invalid password")) {
        setIsPasswordError(true);
      } else {
        setShowPasswordDialog(false);
      }
    }
  });

  const onSubmit = (data: FormValues) => {
    setShowPasswordDialog(true);
  };
  
  const handlePasswordConfirm = () => {
    setIsPasswordError(false);
    addDeviceMutation.mutate(form.getValues());
  };

  const handleReset = () => {
    form.reset(DEFAULT_DEVICE_FORM_VALUES);
    setShowSuccess(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-medium text-neutral-700 mb-4">Add New Device</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="deviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Type <span className="text-destructive">*</span></FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={addDeviceMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Device Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DEVICE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device ID <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter device ID" 
                      {...field} 
                      disabled={addDeviceMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentOTA"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current OTA <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter OTA version (e.g. 5.6.10.rc.2_dev6)" 
                      {...field} 
                      disabled={addDeviceMutation.isPending}
                      list="ota-versions"
                    />
                  </FormControl>
                  {/* Provide datalist for autocomplete of device-specific OTA versions */}
                  <datalist id="ota-versions">
                    {availableOTAVersions.map((version) => (
                      <option key={version} value={version} />
                    ))}
                  </datalist>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ipAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IP Address <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. 192.168.1.1" 
                      {...field} 
                      disabled={addDeviceMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sshUser"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SSH User <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter SSH username" 
                      {...field} 
                      disabled={addDeviceMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password <span className="text-destructive">*</span></FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter password" 
                        {...field} 
                        disabled={addDeviceMutation.isPending}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 text-neutral-400 hover:text-neutral-600"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={addDeviceMutation.isPending}
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
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={addDeviceMutation.isPending}
            >
              Reset
            </Button>
            <Button 
              type="submit" 
              disabled={addDeviceMutation.isPending}
            >
              {addDeviceMutation.isPending ? "Adding..." : "Add Device"}
            </Button>
          </div>
        </form>
      </Form>

      {showSuccess && (
        <Alert className="mt-4 bg-success bg-opacity-10 text-success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Device added successfully!</AlertDescription>
        </Alert>
      )}

      {addDeviceMutation.isError && !isPasswordError && (
        <Alert className="mt-4" variant="destructive">
          <AlertDescription>
            {addDeviceMutation.error instanceof Error
              ? addDeviceMutation.error.message
              : "Failed to add device. Please try again."}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Password Confirmation Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Admin Password</DialogTitle>
            <DialogDescription>
              Please enter your admin password to add this device.
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
              }}
              disabled={addDeviceMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handlePasswordConfirm}
              disabled={!adminPassword || addDeviceMutation.isPending}
            >
              {addDeviceMutation.isPending ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
