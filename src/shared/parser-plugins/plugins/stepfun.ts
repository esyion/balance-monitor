// StepFun 解析器插件
import { BaseParserPlugin, type StandardBalance } from '../plugin-interface'
import { PARSER_STRATEGIES } from '../../parser-types'

function toFiniteNumber(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''))
  return Number.isFinite(parsed) ? parsed : 0
}

export class StepFunPlugin extends BaseParserPlugin {
  metadata = {
    id: PARSER_STRATEGIES.STEPFUN,
    name: 'StepFun 余额解析器',
    description: '用于解析 StepFun 账户余额响应的插件',
    version: '1.0.0',
    author: 'Balance Monitor Team'
  }

  parse(response: any): StandardBalance {
    const availableBalance = toFiniteNumber(response?.balance)
    const cashBalance = toFiniteNumber(response?.total_cash_balance)
    const voucherBalance = toFiniteNumber(response?.total_voucher_balance)

    return {
      currency: 'CNY',
      available_balance: availableBalance,
      cash_balance: cashBalance,
      voucher_balance: voucherBalance,
      status: this.determineStatus(availableBalance, 50, 10),
      last_updated: this.getCurrentTimestamp(),
      meta: {
        original_response: response,
        object: response?.object,
        account_type: response?.type
      }
    }
  }

  supports(type: string): boolean {
    const normalizedType = type?.toLowerCase() || ''
    return (
      normalizedType === PARSER_STRATEGIES.STEPFUN ||
      normalizedType.includes('stepfun') ||
      normalizedType.includes('阶跃星辰')
    )
  }
}
