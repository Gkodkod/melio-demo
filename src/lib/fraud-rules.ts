import type { Payment, Vendor, RiskLevel } from './types';

// ─── Rule Definitions ──────────────────────────────────────────────

export interface FraudRuleContext {
    payment: Payment;
    vendor: Vendor;
    allPayments: Payment[];
}

export interface FraudRuleResult {
    ruleName: string;
    triggered: boolean;
    weight: number;
    description: string;
}

type FraudRule = ( ctx: FraudRuleContext ) => FraudRuleResult;

// ─── Individual Rules ──────────────────────────────────────────────

const highAmountRule: FraudRule = ( { payment } ) => ( {
    ruleName: 'High Amount',
    triggered: payment.amount > 10_000,
    weight: 30,
    description: 'Payment exceeds $10,000 threshold',
} );

const newVendorHighAmountRule: FraudRule = ( { payment, vendor } ) => {
    const vendorAge = Date.now() - new Date( vendor.createdAt ).getTime();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const isNew = vendorAge < thirtyDays;
    return {
        ruleName: 'New Vendor + High Amount',
        triggered: isNew && payment.amount > 5_000,
        weight: 35,
        description: 'New vendor (< 30 days) with payment > $5,000',
    };
};

const rapidPaymentsRule: FraudRule = ( { payment, vendor, allPayments } ) => {
    const fiveMinutes = 5 * 60 * 1000;
    const paymentTime = new Date( payment.createdAt ).getTime();
    const sameVendorRecent = allPayments.filter( ( p ) => {
        if ( p.id === payment.id || p.vendorId !== vendor.id ) return false;
        const diff = Math.abs( new Date( p.createdAt ).getTime() - paymentTime );
        return diff < fiveMinutes;
    } );
    return {
        ruleName: 'Rapid Payments',
        triggered: sameVendorRecent.length >= 1,
        weight: 25,
        description: 'Multiple payments to same vendor within 5 minutes',
    };
};

const internationalVendorRule: FraudRule = ( { vendor } ) => {
    const intlIndicators = ['UK', 'London', 'Berlin', 'Tokyo', 'Paris', 'Mumbai', 'Toronto', 'Sydney', 'International', 'Global', 'Offshore'];
    const isIntl = intlIndicators.some( ( ind ) =>
        vendor.address.toLowerCase().includes( ind.toLowerCase() ) ||
        vendor.name.toLowerCase().includes( ind.toLowerCase() )
    );
    return {
        ruleName: 'International Vendor',
        triggered: isIntl,
        weight: 20,
        description: 'Vendor appears to be international',
    };
};

const roundAmountRule: FraudRule = ( { payment } ) => ( {
    ruleName: 'Round Amount',
    triggered: payment.amount >= 1_000 && payment.amount % 1_000 === 0,
    weight: 15,
    description: 'Suspiciously round amount (exact multiple of $1,000)',
} );

const failedRetryRule: FraudRule = ( { payment, vendor, allPayments } ) => {
    const paymentTime = new Date( payment.createdAt ).getTime();
    const hasRecentFailed = allPayments.some( ( p ) => {
        if ( p.vendorId !== vendor.id || p.status !== 'failed' ) return false;
        const diff = paymentTime - new Date( p.createdAt ).getTime();
        return diff > 0 && diff < 24 * 60 * 60 * 1000;
    } );
    return {
        ruleName: 'Failed Then Retry',
        triggered: hasRecentFailed,
        weight: 20,
        description: 'Retry after a failed payment within 24 hours',
    };
};

// ─── All Rules ─────────────────────────────────────────────────────

export const FRAUD_RULES: FraudRule[] = [
    highAmountRule,
    newVendorHighAmountRule,
    rapidPaymentsRule,
    internationalVendorRule,
    roundAmountRule,
    failedRetryRule,
];

// ─── Evaluator ─────────────────────────────────────────────────────

export interface FraudEvaluation {
    riskScore: number;
    riskLevel: RiskLevel;
    triggeredRules: string[];
    ruleResults: FraudRuleResult[];
}

export function evaluatePayment( ctx: FraudRuleContext ): FraudEvaluation {
    const ruleResults = FRAUD_RULES.map( ( rule ) => rule( ctx ) );
    const triggered = ruleResults.filter( ( r ) => r.triggered );

    const rawScore = triggered.reduce( ( sum, r ) => sum + r.weight, 0 );
    const riskScore = Math.min( 100, rawScore );

    let riskLevel: RiskLevel = 'low';
    if ( riskScore >= 60 ) riskLevel = 'high';
    else if ( riskScore >= 30 ) riskLevel = 'medium';

    return {
        riskScore,
        riskLevel,
        triggeredRules: triggered.map( ( r ) => r.ruleName ),
        ruleResults,
    };
}
