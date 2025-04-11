import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PencilIcon, Eye, EyeOff } from "lucide-react";
import { type Device } from "@/types/device";
import { useState } from "react";

interface DeviceTableProps {
  devices: Device[];
  onEditDevice?: (device: Device) => void;
}

export default function DeviceTable({ devices, onEditDevice }: DeviceTableProps) {
  // Track which device passwords are being shown
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Toggle password visibility for a specific device
  const togglePasswordVisibility = (deviceId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [deviceId]: !prev[deviceId]
    }));
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-neutral-50">
          <TableRow>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Device Type</TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Device ID</TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">OTA Version</TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">IP Address</TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">SSH User</TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Password</TableHead>
            {onEditDevice && <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white divide-y divide-neutral-200">
          {devices.map((device) => (
            <TableRow key={device.id} className="hover:bg-neutral-50">
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                {device.deviceType}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                {device.deviceId}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                {device.currentOTA}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                {device.ipAddress}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                {device.sshUser}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700 flex items-center">
                {/* Show actual password or dots based on visibility state */}
                <span className="mr-2">
                  {visiblePasswords[device.id] ? device.password : "•".repeat(Math.min(device.password.length, 10))}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePasswordVisibility(device.id)}
                  className="p-1 h-6 w-6"
                >
                  {visiblePasswords[device.id] ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span className="sr-only">
                    {visiblePasswords[device.id] ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </TableCell>
              {onEditDevice && (
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onEditDevice(device)}
                    className="flex items-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}