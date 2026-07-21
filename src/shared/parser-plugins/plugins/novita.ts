// Novita AI 解析器插件
import { BaseParserPlugin, type StandardBalance } from '../plugin-interface'
import { PARSER_STRATEGIES } from '../../parser-types'

const NOVITA_AMOUNT_SCALE = 10000

function toFiniteNumber(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''))
  return Number.isFinite(parsed) ? parsed : 0
}

export class NovitaPlugin extends BaseParserPlugin {
  metadata = {
    id: PARSER_STRATEGIES.NOVITA,
    name: 'Novita AI 余额解析器',
    description: '用于解析 Novita AI 账户余额响应的插件',
    version: '1.0.0',
    author: 'Balance Monitor Team'
  }

  parse(response: any): StandardBalance {
    const availableBalance = toFiniteNumber(response?.availableBalance) / NOVITA_AMOUNT_SCALE
    const cashBalance = toFiniteNumber(response?.cashBalance) / NOVITA_AMOUNT_SCALE
    const creditLimit = toFiniteNumber(response?.creditLimit) / NOVITA_AMOUNT_SCALE
    const outstandingInvoices = toFiniteNumber(response?.outstandingInvoices) / NOVITA_AMOUNT_SCALE

    return {
      currency: 'USD',
      available_balance: availableBalance,
      cash_balance: cashBalance,
      status: this.determineStatus(availableBalance, 10, 2),
      last_updated: this.getCurrentTimestamp(),
      meta: {
        original_response: response,
        credit_limit: creditLimit,
        outstanding_invoices: outstandingInvoices,
        amount_scale: NOVITA_AMOUNT_SCALE
      }
    }
  }

  supports(type: string): boolean {
    const normalizedType = type?.toLowerCase() || ''
    return (
      normalizedType === PARSER_STRATEGIES.NOVITA ||
      normalizedType.includes('novita') ||
      normalizedType.includes('novita ai')
    )
  }
}
