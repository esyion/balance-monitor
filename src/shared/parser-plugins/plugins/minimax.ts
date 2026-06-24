// MiniMax 解析器插件
import { BaseParserPlugin, type StandardBalance } from '../plugin-interface'
import { PARSER_STRATEGIES } from '../../parser-types'

export class MiniMaxPlugin extends BaseParserPlugin {
  metadata = {
    id: PARSER_STRATEGIES.MINIMAX,
    name: 'MiniMax AI 余额解析器',
    description: '用于解析 MiniMax AI API 余额响应的插件',
    version: '1.0.0',
    author: 'Balance Monitor Team'
  }

  parse(response: any): StandardBalance {
    // 检查响应状态
    if (response.base_resp?.status_code !== 0) {
      throw new Error(`MiniMax API 错误: ${response.base_resp?.status_msg || '未知错误'}`)
    }

    // 获取可用余额（available_amount 是总可用金额）
    const availableAmount = response.available_amount
    const cashBalance = response.cash_balance
    const voucherBalance = response.voucher_balance
    const creditBalance = response.credit_balance

    if (availableAmount === undefined || availableAmount === null) {
      throw new Error('MiniMax 响应中缺少 available_amount 字段')
    }

    // 将字符串转换为数字
    const available = typeof availableAmount === 'string'
      ? parseFloat(availableAmount)
      : Number(availableAmount)

    const cash = typeof cashBalance === 'string'
      ? parseFloat(cashBalance)
      : Number(cashBalance || 0)

    const voucher = typeof voucherBalance === 'string'
      ? parseFloat(voucherBalance)
      : Number(voucherBalance || 0)

    const credit = typeof creditBalance === 'string'
      ? parseFloat(creditBalance)
      : Number(creditBalance || 0)

    if (isNaN(available)) {
      throw new Error(`无法解析 MiniMax 余额: ${availableAmount}`)
    }

    // 判断状态
    let status: StandardBalance['status'] = 'active'
    if (available <= 0) {
      status = 'inactive'
    } else if (available <= 2) {
      status = 'danger'
    } else if (available <= 10) {
      status = 'warning'
    }

    return {
      available_balance: available,
      total_balance: available,
      cash_balance: cash,
      voucher_balance: voucher,
      currency: '¥',
      status,
      last_updated: new Date().toISOString(),
      meta: {
        original_response: response,
        creditBalance: credit
      }
    }
  }

  supports(parserType: string): boolean {
    const normalizedType = parserType?.toLowerCase() || ''
    return (
      normalizedType === PARSER_STRATEGIES.MINIMAX ||
      normalizedType.includes('minimax') ||
      normalizedType.includes('mini-max') ||
      normalizedType.includes('minimaxi')
    )
  }

  validate(response: any): { valid: boolean; error?: string } {
    // 检查基础响应结构
    if (!response || typeof response !== 'object') {
      return { valid: false, error: 'MiniMax 响应格式无效' }
    }

    // 检查 base_resp
    if (!response.base_resp || typeof response.base_resp !== 'object') {
      return { valid: false, error: '缺少 base_resp 字段' }
    }

    if (response.base_resp.status_code !== 0) {
      return {
        valid: false,
        error: `MiniMax API 错误: ${response.base_resp.status_msg || '未知错误'}`
      }
    }

    // 检查必需字段
    if (!('available_amount' in response)) {
      return { valid: false, error: '缺少 available_amount 字段' }
    }

    return { valid: true }
  }
}
