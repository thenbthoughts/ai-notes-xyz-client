export interface IInfoVault {
    // identification
    _id: string;
    username: string;

    // basic information
    infoVaultType: string;
    infoVaultSubType: string;
    name: string; // Computed or custom display name
    nickname: string;
    photoUrl: string; // Profile picture/avatar URL

    // professional information
    company: string;
    jobTitle: string;
    department: string;

    // additional information
    notes: string; // Free-form notes about the contact

    // organization & categorization
    tags: string[]; // User-defined tags
    isFavorite: boolean; // Starred/favorite contact

    // relationship context
    relationshipType: 'personal' | 'professional' | 'family' | 'other';
    lastContactDate: Date; // Last time you communicated
    contactFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'rarely';

    // ai enhancement
    aiSummary: string; // AI-generated summary of the contact
    aiTags: string[]; // AI-suggested tags
    aiSuggestions: string; // AI suggestions for maintaining relationship

    // status & lifecycle
    isArchived: boolean; // Whether contact is archived
    isBlocked: boolean; // Blocked contact
    lastUpdatedBy: string; // Who last updated this contact

    // auto-generated fields
    createdAtUtc: Date;
    createdAtIpAddress: string;
    createdAtUserAgent: string;
    updatedAtUtc: Date;
    updatedAtIpAddress: string;
    updatedAtUserAgent: string;
};

export interface IInfoVaultCustomField {
    // identification
    _id: string;
    infoVaultId: string;
    username: string;

    // fields
    key: string;
    value: string;

    // auto
    createdAtUtc: Date;
    createdAtIpAddress: string;
    createdAtUserAgent: string;
    updatedAtUtc: Date;
    updatedAtIpAddress: string;
    updatedAtUserAgent: string;
};

export interface IInfoVaultEmail {
    // identification
    _id: string;
    infoVaultId: string;
    username: string;

    // fields
    email: string;
    label: string; // e.g., "work", "home", "other", or custom
    isPrimary: boolean; // Whether this is the primary email

    // auto
    createdAtUtc: Date;
    createdAtIpAddress: string;
    createdAtUserAgent: string;
    updatedAtUtc: Date;
    updatedAtIpAddress: string;
    updatedAtUserAgent: string;
}

export interface IInfoVaultPhone {
    // identification
    _id: string;
    infoVaultId: string;
    username: string;

    // fields
    phoneNumber: string;
    countryCode: string; // e.g., "+1", "+44", etc.
    label: string; // e.g., "mobile", "work", "home", "other", or custom
    isPrimary: boolean; // Whether this is the primary phone number

    // auto
    createdAtUtc: Date;
    createdAtIpAddress: string;
    createdAtUserAgent: string;
    updatedAtUtc: Date;
    updatedAtIpAddress: string;
    updatedAtUserAgent: string;
}

export interface IInfoVaultWebsite {
    // identification
    _id: string;
    infoVaultId: string;
    username: string;

    // fields
    url: string;
    label: string;

    // auto
    createdAtUtc: Date;
    createdAtIpAddress: string;
    createdAtUserAgent: string;
    updatedAtUtc: Date;
    updatedAtIpAddress: string;
    updatedAtUserAgent: string;
}; 

// InfoVault Significant Date
export interface IInfoVaultSignificantDate {
    // identification
    _id: string;
    infoVaultId: string;
    username: string;

    // fields
    date: Date;
    label: string;

    // auto
    createdAtUtc: Date;
    createdAtIpAddress: string;
    createdAtUserAgent: string;
    updatedAtUtc: Date;
    updatedAtIpAddress: string;
    updatedAtUserAgent: string;
};

export interface IInfoVaultAddress {
    // identification
    _id: string;
    infoVaultId: string;
    username: string;

    // fields
    countryRegion: string;
    address: string;
    city: string;
    pincode: string;
    state: string;
    poBox: string;
    label: string; // e.g., "home", "work", "other"

    // location
    latitude: number;
    longitude: number;

    // primary
    isPrimary: boolean;

    // auto
    createdAtUtc: Date;
    createdAtIpAddress: string;
    createdAtUserAgent: string;
    updatedAtUtc: Date;
    updatedAtIpAddress: string;
    updatedAtUserAgent: string;
};