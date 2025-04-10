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

export const DEVICE_TYPES = ["Krait1", "Krait2", "Bagheera2", "Bagheera3", "Octo"];

// OTA versions by device type
// krait1 - 2.x, krait2 - 4.x, bagheera2 - 3.x, bagheera3 - 5.x, octo - 7.x
export const OTA_VERSIONS_BY_TYPE = {
  "Krait1": [
    "2.3.5.rc.1",
    "2.3.6.rc.2",
    "2.4.0.rc.1",
    "2.4.1.rc.3_dev2",
    "2.5.0.rc.1",
    "2.6.10.rc.1_dev7"
  ],
  "Krait2": [
    "4.0.2.rc.1",
    "4.1.0.rc.2",
    "4.2.3.rc.1",
    "4.3.0.rc.2_dev3",
    "4.5.8.rc.1",
    "4.6.10.rc.2_dev6"
  ],
  "Bagheera2": [
    "3.0.1.rc.1",
    "3.1.2.rc.1",
    "3.2.1.rc.2",
    "3.2.4.rc.1_dev2",
    "3.3.0.rc.1",
    "3.6.10.rc.1_dev6",
    "3.6.10.rc.1_dev7"
  ],
  "Bagheera3": [
    "5.0.0.rc.1",
    "5.1.2.rc.1",
    "5.2.0.rc.2",
    "5.3.1.rc.1_dev4",
    "5.6.10.rc.2_dev6"
  ],
  "Octo": [
    "7.0.0.rc.1",
    "7.0.1.rc.2",
    "7.0.2.rc.3_dev2",
    "7.1.0.rc.1",
    "7.2.0.rc.1_dev1"
  ]
};

// For backward compatibility
export const OTA_VERSIONS = [
  ...OTA_VERSIONS_BY_TYPE.Krait1,
  ...OTA_VERSIONS_BY_TYPE.Krait2,
  ...OTA_VERSIONS_BY_TYPE.Bagheera2,
  ...OTA_VERSIONS_BY_TYPE.Bagheera3,
  ...OTA_VERSIONS_BY_TYPE.Octo
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
  deviceType: "any_type",
  deviceId: "",
  currentOTA: "any_ota"
};
