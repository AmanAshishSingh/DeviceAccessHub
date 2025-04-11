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
// krait1 - 2.x, krait2 - 4.x, bagheera2 - 3.x, bagheera3 - 5.x, octo - 7.x, mowgli - 6.x
// OTA versions are in the format <major>.<minor>.<patch>.<release>_<build>
// where <major> is the major version, <minor> is the minor version, <patch> is the patch version,
// <release> is the release candidate version, and <build> is the build number.
// The release candidate version is optional and is only present for release candidates.
// The build number is optional and is only present for development builds.
// The OTA versions are sorted in descending order, with the latest version first.
export const OTA_VERSIONS_BY_TYPE = {
  "Krait1": [
    "2.6.10.rc.1_dev7",
    "2.6.9.rc.3",
    "2.6.8.rc.6",
    "2.5.19.rc.5"
  ],
  "Krait2": [
    "4.6.10.rc.2_dev6",
    "4.6.10.rc.2",
    "4.6.8.rc.5",
    "4.6.6.rc.8",
    "4.5.31.rc.4.1",
    "4.5.29.rc.3.2"
  ],
  "Bagheera2": [
    "3.6.10.rc.1_dev7",
    "3.6.9.rc.2",
    "3.6.8.rc.6",
    "3.6.6.rc.5",
    "3.6.4.rc.6",
    "3.6.3.rc.6",
    "3.6.1.rc.4",
    "3.5.29.rc.3"
  ],
  "Bagheera3": [
    "5.6.10.rc.2_dev6",
    "5.6.10.rc.2",
    "5.6.8.rc.5",
    "5.6.6.rc.4",
    "5.6.4.rc.6",
    "5.5.29.rc.11"
  ],
  "Octo": [
    "7.6.10.rc.1"
  ],
  "Mowgli": [
    "6.5.32.rc.6"
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
