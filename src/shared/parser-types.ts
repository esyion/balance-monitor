// 共享的解析器策略类型定义
// 这个文件在 main 和 renderer 进程之间共享

import { StandardBalance } from './parser-plugins'
export type SharedStandardBalance = StandardBalance

export const PARSER_STRATEGIES = {
  DEEPSEEK: 'deepseek',
  MOONSHOT: 'moonshot',
  AIHUBMIX: 'aihubmix',
  OPENROUTER: 'openrouter',
  STEPFUN: 'stepfun',
  SILICONFLOW: 'siliconflow',
  SILICONFLOW_EN: 'siliconflow_en',
  NOVITA: 'novita',
  VOLCENGINE: 'volcengine',
  PPIO: 'ppio',
  MINIMAX: 'minimax'
} as const

export type ParserType = (typeof PARSER_STRATEGIES)[keyof typeof PARSER_STRATEGIES]

export interface ParserConfig {
  parserType: ParserType
}
