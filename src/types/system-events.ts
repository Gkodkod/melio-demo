export type ServiceType =
    | 'API Gateway'
    | 'Payment Service'
    | 'Fraud Service'
    | 'Settlement Service'
    | 'Notification Service';

export type EventStatus = 'info' | 'success' | 'warning' | 'error';

export interface SystemEvent {
    id: string;
    type: string;
    service: ServiceType;
    status: EventStatus;
    timestamp: string;
    correlationId: string;
    payload: Record<string, any>;
    metadata: {
        durationMs?: number;
        userAgent?: string;
        ipAddress?: string;
        region?: string;
        [key: string]: any;
    };
}
