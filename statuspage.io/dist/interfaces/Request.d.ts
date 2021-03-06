export interface ComponentSubscriberData {
    component_id: string;
}
export interface EmailSubscriberData {
    email: string;
}
export interface IncidentSubscriberData {
    incident_id: string;
}
export interface RequestOptions {
    subscriber?: CombinedSubscriberData | (CombinedSubscriberData & IncidentSubscriberData) | {
        id: string;
    };
}
export interface PhoneSubscriberData {
    /** Defaults to `us` if not supplied. */
    phone_country?: string;
    phone_number: string;
}
export interface SubscriberOptions {
    isSubscribed: boolean;
}
export interface WebhookSubscriberData extends EmailSubscriberData {
    endpoint: string;
}
export declare type CombinedSubscriberData = PhoneSubscriberData | EmailSubscriberData | WebhookSubscriberData;
