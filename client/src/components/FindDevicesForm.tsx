import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { deviceSearchSchema } from "@shared/schema";
import { 
  DEFAULT_SEARCH_CRITERIA, 
  DEVICE_TYPES, 
  OTA_VERSIONS,
  type Device 
} from "@/types/device";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DeviceTable from "./DeviceTable";
import { z } from "zod";

type FormValues = z.infer<typeof deviceSearchSchema>;

export default function FindDevicesForm() {
  const [searchResults, setSearchResults] = useState<Device[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(deviceSearchSchema),
    defaultValues: DEFAULT_SEARCH_CRITERIA,
  });

  const searchMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/devices/search", data);
      return response.json() as Promise<Device[]>;
    },
    onSuccess: (data) => {
      setSearchResults(data);
      setHasSearched(true);
    },
  });

  const onSubmit = (data: FormValues) => {
    // Filter out special values that should be treated as undefined
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => 
        value !== "" && value !== "any_type" && value !== "any_ota"
      )
    );
    searchMutation.mutate(filteredData as FormValues);
  };

  const handleReset = () => {
    form.reset(DEFAULT_SEARCH_CRITERIA);
    setSearchResults([]);
    setHasSearched(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-medium text-neutral-700 mb-4">Find Devices</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="deviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    disabled={searchMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Any Device Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="any_type">Any Device Type</SelectItem>
                      {DEVICE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device ID</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter device ID" 
                      {...field} 
                      disabled={searchMutation.isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentOTA"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OTA Version</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    disabled={searchMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Any OTA Version" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="any_ota">Any OTA Version</SelectItem>
                      {OTA_VERSIONS.map((version) => (
                        <SelectItem key={version} value={version}>
                          {version}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={searchMutation.isPending}
            >
              Reset
            </Button>
            <Button 
              type="submit" 
              disabled={searchMutation.isPending}
            >
              {searchMutation.isPending ? "Searching..." : "Search"}
            </Button>
          </div>
        </form>
      </Form>

      {searchMutation.isError && (
        <Alert className="mt-4" variant="destructive">
          <AlertDescription>
            {searchMutation.error instanceof Error
              ? searchMutation.error.message
              : "Failed to search devices. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      {hasSearched && (
        <div className="mt-6">
          <h3 className="text-md font-medium text-neutral-700 mb-3">Search Results</h3>
          
          {searchResults.length > 0 ? (
            <DeviceTable devices={searchResults} />
          ) : (
            <p className="mt-3 text-neutral-600">No devices found matching your criteria.</p>
          )}
        </div>
      )}
    </div>
  );
}
