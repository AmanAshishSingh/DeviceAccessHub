import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { deviceValidationSchema } from "@shared/schema";
import { 
  DEFAULT_DEVICE_FORM_VALUES, 
  DEVICE_TYPES, 
  OTA_VERSIONS 
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
import { CheckCircle2 } from "lucide-react";

type FormValues = z.infer<typeof deviceValidationSchema>;

export default function AddDeviceForm() {
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(deviceValidationSchema),
    defaultValues: DEFAULT_DEVICE_FORM_VALUES,
  });

  const addDeviceMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/devices", data);
      return response.json();
    },
    onSuccess: () => {
      // Reset form and show success message
      form.reset(DEFAULT_DEVICE_FORM_VALUES);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const onSubmit = (data: FormValues) => {
    addDeviceMutation.mutate(data);
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
                  {/* Provide datalist for autocomplete of common OTA versions */}
                  <datalist id="ota-versions">
                    {OTA_VERSIONS.map((version) => (
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
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Enter password" 
                      {...field} 
                      disabled={addDeviceMutation.isPending}
                    />
                  </FormControl>
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

      {addDeviceMutation.isError && (
        <Alert className="mt-4" variant="destructive">
          <AlertDescription>
            {addDeviceMutation.error instanceof Error
              ? addDeviceMutation.error.message
              : "Failed to add device. Please try again."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
