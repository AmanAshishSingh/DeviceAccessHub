export interface Device {
  id: number;
  deviceType: string;
  deviceId: string;
  currentOTA: string;
  ipAddress: string;
  sshUser: string;
  password: string;
}

export interface DeviceFormValues {
  deviceType: string;
  deviceId: string;
  currentOTA: string;
  ipAddress: string;
  sshUser: string;
  password: string;
}

export interface DeviceSearchCriteria {
  deviceType?: string;
  deviceId?: string;
  currentOTA?: string;
}

export const DEVICE_TYPES = ["Krait1", "Krait2", "Bagheera2", "Bagheera3"];

export const OTA_VERSIONS = [
  "2.6.10.rc.1_dev7",
  "3.6.10.rc.1_dev6",
  "3.6.10.rc.1_dev7",
  "4.6.10.rc.2_dev6",
  "5.6.10.rc.2_dev6"
];

export const DEFAULT_DEVICE_FORM_VALUES: DeviceFormValues = {
  deviceType: "",
  deviceId: "",
  currentOTA: "",
  ipAddress: "",
  sshUser: "",
  password: ""
};

export const DEFAULT_SEARCH_CRITERIA: DeviceSearchCriteria = {
  deviceType: "",
  deviceId: "",
  currentOTA: ""
};
