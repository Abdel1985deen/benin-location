import type { TransactionStatus } from '../types'
import { GUARANTEE_MONTHS } from './site'

/**
 * Règles commerciales affichées dans la version démo.
 * Aucun paiement réel n'est initié : seuls des statuts et des montants simulés sont enregistrés.
 */
export const FEE_RULES = {
  rentFeeRate: 0.05,        // 5 % sur le loyer reçu par le propriétaire
  agencyAdvanceRate: 0.25,  // 25 % de l'avance pour l'agence
  clientCommissionRate: 0.5,// le solde de l'avance est partagé 50 % client / 50 % propriétaire
  ownerCommissionRate: 0.5,
} as const

export const TRANSACTION_STEPS: { status: TransactionStatus; label: string; hint: string }[] = [
  { status: 'request', label: 'Demande', hint: 'Le client envoie sa demande au propriétaire ou à l’agence.' },
  { status: 'advance_paid', label: 'Avance de 3 mois payée', hint: 'Le client simule le paiement de l’avance de garantie.' },
  { status: 'confirmed', label: 'Confirmation', hint: 'Le propriétaire ou l’agence confirme la transaction.' },
  { status: 'rent_paid', label: 'Loyer payé', hint: 'Le client simule le paiement du premier loyer.' },
  { status: 'receipt_generated', label: 'Reçu généré', hint: 'Le reçu de la transaction est disponible.' },
]

export const STATUS_LABELS: Record<TransactionStatus, string> = {
  request: 'Demande envoyée',
  advance_paid: 'Avance de 3 mois payée',
  confirmed: 'Confirmée',
  rent_paid: 'Loyer payé',
  receipt_generated: 'Reçu généré',
}

export const STATUS_ORDER: TransactionStatus[] = TRANSACTION_STEPS.map((s) => s.status)

export function nextStatus(status: TransactionStatus): TransactionStatus | null {
  const index = STATUS_ORDER.indexOf(status)
  return index >= 0 && index < STATUS_ORDER.length - 1 ? STATUS_ORDER[index + 1] : null
}

/** Qui doit agir pour faire passer la transaction à l'étape suivante ? */
export function nextActor(status: TransactionStatus): 'client' | 'owner' | 'agency' | null {
  switch (status) {
    case 'request':
    case 'confirmed':
      return 'client'
    case 'advance_paid':
    case 'rent_paid':
      return 'owner'
    default:
      return null
  }
}

export interface TransactionBreakdown {
  monthlyRent: number
  advance: number
  rentFee: number
  ownerNetRent: number
  agencyShare: number
  sharedCommission: number
  clientShare: number
  ownerShare: number
}

export function transactionBreakdown(rent: number, months = GUARANTEE_MONTHS): TransactionBreakdown {
  const advance = rent * months
  const agencyShare = advance * FEE_RULES.agencyAdvanceRate
  const sharedCommission = advance - agencyShare
  const rentFee = rent * FEE_RULES.rentFeeRate
  return {
    monthlyRent: rent,
    advance,
    rentFee,
    ownerNetRent: rent - rentFee,
    agencyShare,
    sharedCommission,
    clientShare: sharedCommission * FEE_RULES.clientCommissionRate,
    ownerShare: sharedCommission * FEE_RULES.ownerCommissionRate,
  }
}
