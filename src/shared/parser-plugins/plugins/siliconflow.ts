// SiliconFlow 解析器插件
import {
  BaseParserPlugin,
  type ParserPluginMetadata,
  type StandardBalance
} from '../plugin-interface'
import { PARSER_STRATEGIES } from '../../parser-types'

function toFiniteNumber(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''))
  return Number.isFinite(parsed) ? parsed : 0
}

export class SiliconFlowPlugin extends BaseParserPlugin {
  metadata: ParserPluginMetadata = {
    id: PARSER_STRATEGIES.SILICONFLOW,
    name: 'SiliconFlow 国内余额解析器',
    description: '用于解析 SiliconFlow 国内站余额响应的插件',
    version: '1.0.0',
    author: 'Balance Monitor Team'
  }

  parse(response: any): StandardBalance {
    return this.parseBalance(response, 'CNY', 50, 10)
  }

  protected parseBalance(
    response: any,
    currency: 'CNY' | 'USD',
    warningThreshold: number,
    dangerThreshold: number
  ): StandardBalance {
    const data = response?.data
    if (!data || typeof data !== 'object') {
      throw new Error("SiliconFlow 响应缺少 'data' 字段")
    }

    const totalBalance = toFiniteNumber(data.totalBalance)
    const balance = toFiniteNumber(data.balance)
    const chargeBalance = toFiniteNumber(data.chargeBalance)

    return {
      currency,
      available_balance: totalBalance,
      status: this.determineStatus(totalBalance, warningThreshold, dangerThreshold),
      last_updated: this.getCurrentTimestamp(),
      meta: {
        original_response: response,
        account_status: data.status,
        balance,
        charge_balance: chargeBalance
      }
    }
  }

  supports(type: string): boolean {
    const normalizedType = type?.toLowerCase() || ''
    return (
      normalizedType === PARSER_STRATEGIES.SILICONFLOW ||
      normalizedType.includes('siliconflow') ||
      normalizedType.includes('silicon flow') ||
      normalizedType.includes('硅基流动')
    )
  }
}

export class SiliconFlowEnPlugin extends SiliconFlowPlugin {
  metadata: ParserPluginMetadata = {
    id: PARSER_STRATEGIES.SILICONFLOW_EN,
    name: 'SiliconFlow 国际余额解析器',
    description: '用于解析 SiliconFlow 国际站余额响应的插件',
    version: '1.0.0',
    author: 'Balance Monitor Team'
  }

  parse(response: any): StandardBalance {
    return this.parseBalance(response, 'USD', 10, 2)
  }

  supports(type: string): boolean {
    const normalizedType = type?.toLowerCase() || ''
    return (
      normalizedType === PARSER_STRATEGIES.SILICONFLOW_EN ||
      normalizedType === 'siliconflow international' ||
      normalizedType === 'silicon flow international'
    )
  }
}
