import { useState } from "react";
import { useAuthStore } from "@/lib/auth";
import AddDeviceForm from "@/components/AddDeviceForm";
import FindDevicesForm from "@/components/FindDevicesForm";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Action = "none" | "add" | "find";

export default function Dashboard() {
  const { username, logout } = useAuthStore();
  const [selectedAction, setSelectedAction] = useState<Action>("none");

  const handleActionChange = (value: string) => {
    setSelectedAction(value as Action);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Device Manager</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">{username}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="text-sm bg-white bg-opacity-20 text-white hover:bg-opacity-30 border-none"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Action Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-medium text-neutral-700 mb-4">Choose an Action</h2>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <Select value={selectedAction} onValueChange={handleActionChange}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Select an action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select an action</SelectItem>
                <SelectItem value="add">Add New Device</SelectItem>
                <SelectItem value="find">Find Devices</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Conditional Rendering of Forms */}
        {selectedAction === "add" && <AddDeviceForm />}
        {selectedAction === "find" && <FindDevicesForm />}
      </main>
    </div>
  );
}
