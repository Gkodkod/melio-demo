import { SystemEvent } from '@/types/system-events';

const generateId = () => Math.random().toString( 36 ).substring( 2, 10 );

export const MOCK_EVENTS: SystemEvent[] = [
    {
        id: generateId(),
        type: 'payment.created',
        service: 'API Gateway',
        status: 'info',
        timestamp: new Date( Date.now() - 50000 ).toISOString(),
        correlationId: 'txn_1029384756',
        payload: {
            amount: 450.00,
            currency: 'USD',
            customerId: 'cus_8je72h39',
            paymentMethod: 'pm_card_visa',
        },
        metadata: {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
            ipAddress: '192.168.1.45',
            region: 'us-east-1',
            durationMs: 45
        }
    },
    {
        id: generateId(),
        type: 'fraud.check.started',
        service: 'Fraud Service',
        status: 'info',
        timestamp: new Date( Date.now() - 48000 ).toISOString(),
        correlationId: 'txn_1029384756',
        payload: {
            amount: 450.00,
            customerId: 'cus_8je72h39',
            ipAddress: '192.168.1.45',
        },
        metadata: {
            durationMs: 12
        }
    },
    {
        id: generateId(),
        type: 'fraud.check.completed',
        service: 'Fraud Service',
        status: 'success',
        timestamp: new Date( Date.now() - 45000 ).toISOString(),
        correlationId: 'txn_1029384756',
        payload: {
            riskScore: 12,
            decision: 'approve',
            rulesTriggered: []
        },
        metadata: {
            durationMs: 3000
        }
    },
    {
        id: generateId(),
        type: 'payment.authorized',
        service: 'Payment Service',
        status: 'success',
        timestamp: new Date( Date.now() - 43000 ).toISOString(),
        correlationId: 'txn_1029384756',
        payload: {
            status: 'authorized',
            gatewayResponse: 'APPROVED',
            authCode: '123456'
        },
        metadata: {
            durationMs: 1500
        }
    },
    {
        id: generateId(),
        type: 'payment.settlement.started',
        service: 'Settlement Service',
        status: 'info',
        timestamp: new Date( Date.now() - 40000 ).toISOString(),
        correlationId: 'txn_1029384756',
        payload: {
            batchId: 'batch_2026_03_08',
            amount: 450.00,
        },
        metadata: {
            durationMs: 25
        }
    },
    {
        id: generateId(),
        type: 'notification.sent',
        service: 'Notification Service',
        status: 'success',
        timestamp: new Date( Date.now() - 38000 ).toISOString(),
        correlationId: 'txn_1029384756',
        payload: {
            type: 'email',
            recipient: 'customer@example.com',
            templateId: 'payment_success_v2'
        },
        metadata: {
            durationMs: 400
        }
    },
    {
        id: generateId(),
        type: 'payment.created',
        service: 'API Gateway',
        status: 'info',
        timestamp: new Date( Date.now() - 25000 ).toISOString(),
        correlationId: 'txn_9988776655',
        payload: {
            amount: 15000.00,
            currency: 'USD',
            customerId: 'cus_29384756',
            paymentMethod: 'pm_card_mastercard',
        },
        metadata: {
            userAgent: 'PostmanRuntime/7.28.4',
            ipAddress: '203.0.113.50',
            region: 'eu-central-1',
            durationMs: 32
        }
    },
    {
        id: generateId(),
        type: 'fraud.check.started',
        service: 'Fraud Service',
        status: 'info',
        timestamp: new Date( Date.now() - 24000 ).toISOString(),
        correlationId: 'txn_9988776655',
        payload: {
            amount: 15000.00,
            customerId: 'cus_29384756',
            ipAddress: '203.0.113.50',
        },
        metadata: {
            durationMs: 15
        }
    },
    {
        id: generateId(),
        type: 'fraud.check.completed',
        service: 'Fraud Service',
        status: 'warning',
        timestamp: new Date( Date.now() - 20000 ).toISOString(),
        correlationId: 'txn_9988776655',
        payload: {
            riskScore: 78,
            decision: 'review',
            rulesTriggered: ['high_amount', 'new_ip_address']
        },
        metadata: {
            durationMs: 4000
        }
    },
    {
        id: generateId(),
        type: 'payment.declined',
        service: 'Payment Service',
        status: 'error',
        timestamp: new Date( Date.now() - 19000 ).toISOString(),
        correlationId: 'txn_9988776655',
        payload: {
            status: 'declined',
            reason: 'fraud_score_too_high',
            gatewayResponse: 'DECLINED'
        },
        metadata: {
            durationMs: 120
        }
    },
    {
        id: generateId(),
        type: 'notification.sent',
        service: 'Notification Service',
        status: 'success',
        timestamp: new Date( Date.now() - 18000 ).toISOString(),
        correlationId: 'txn_9988776655',
        payload: {
            type: 'webhook',
            endpoint: 'https://api.merchant.com/webhooks/payments',
            responseStatus: 200
        },
        metadata: {
            durationMs: 250
        }
    }
];

export const generateRandomEvent = (): SystemEvent => {
    const correlationId = `txn_${Math.floor( Math.random() * 1000000000 )}`;
    const templates = [
        { type: 'payment.created', service: 'API Gateway', status: 'info' },
        { type: 'fraud.check.started', service: 'Fraud Service', status: 'info' },
        { type: 'payment.authorized', service: 'Payment Service', status: 'success' },
        { type: 'payment.settlement.started', service: 'Settlement Service', status: 'info' },
        { type: 'notification.sent', service: 'Notification Service', status: 'success' }
    ] as const;
    const tpl = templates[Math.floor( Math.random() * templates.length )];

    return {
        id: generateId(),
        type: tpl.type,
        service: tpl.service,
        status: tpl.status,
        timestamp: new Date().toISOString(),
        correlationId,
        payload: {
            amount: Math.floor( Math.random() * 1000 ) + 10,
            currency: 'USD',
            customerId: `cus_${Math.floor( Math.random() * 100000 )}`,
            paymentMethod: 'pm_card_visa',
        },
        metadata: {
            durationMs: Math.floor( Math.random() * 100 ) + 10
        }
    }
}
