import { VendorConfig } from '../types/balance'
import deepseekLogo from '../assets/providers/deepseek.png'
import moonshotLogo from '../assets/providers/moonshot.png'
import openrouterLogo from '../assets/providers/openrouter.png'
import stepfunLogo from '../assets/providers/step.png'
import siliconFlowLogo from '../assets/providers/silicon.png'
import novitaLogo from '../assets/providers/novita.svg'
import minimaxLogo from '../assets/providers/minimax.png'

export type { VendorConfig as BalanceTemplateConfig }

const balanceList: VendorConfig[] = [
  {
    name: 'DeepSeek',
    logo: deepseekLogo,
    url: 'https://api.deepseek.com/user/balance',
    method: 'GET',
    auth: {
      type: 'Bearer',
      apiKey: '',
      headerKey: 'Authorization'
    },
    timeout: 10000,
    parser: {
      parserType: 'deepseek'
    },
    monitoring: {
      enabled: false,
      interval: 30
    },
    thresholds: {
      warning: 50,
      danger: 10
    },
    isPreset: true
  },
  {
    name: 'Moonshot (CN)',
    logo: moonshotLogo,
    url: 'https://api.moonshot.cn/v1/users/me/balance',
    method: 'GET',
    auth: {
      type: 'Bearer',
      apiKey: '',
      headerKey: 'Authorization'
    },
    timeout: 10000,
    parser: {
      parserType: 'moonshot'
    },
    monitoring: {
      enabled: false,
      interval: 30
    },
    thresholds: {
      warning: 50,
      danger: 10
    },
    isPreset: true
  },
  // {
  //   name: '欧派云',
  //   logo: ppioLogo,
  //   url: 'https://api.ppinfra.com/v3/user',
  //   method: 'GET',
  //   auth: {
  //     type: 'Bearer',
  //     apiKey: '',
  //     headerKey: 'Authorization'
  //   },
  //   timeout: 10000,
  //   parser: {
  //     parserType: 'ppio'
  //   },
  //   monitoring: {
  //     enabled: false,
  //     interval: 30
  //   },
  //   thresholds: {
  //     warning: 50,
  //     danger: 10
  //   },
  //   isPreset: true
  // },
  {
    name: 'Moonshot (AI)',
    logo: moonshotLogo,
    url: 'https://api.moonshot.ai/v1/users/me/balance',
    method: 'GET',
    auth: {
      type: 'Bearer',
      apiKey: '',
      headerKey: 'Authorization'
    },
    timeout: 10000,
    parser: {
      parserType: 'moonshot'
    },
    monitoring: {
      enabled: false,
      interval: 30
    },
    thresholds: {
      warning: 50,
      danger: 10
    },
    isPreset: true
  },
  // {
  //   name: 'AIHubMix',
  //   logo: aihubmixLogo,
  //   url: 'https://api.aihubmix.com/v1/user/usage',
  //   method: 'GET',
  //   auth: {
  //     type: 'Bearer',
  //     apiKey: '',
  //     headerKey: 'Authorization'
  //   },
  //   parser: {
  //     parserType: 'aihubmix'
  //   },
  //   monitoring: {
  //     enabled: false,
  //     interval: 30
  //   },
  //   thresholds: {
  //     warning: 10,
  //     danger: 2
  //   },
  //   isPreset: true
  // },
  {
    name: 'OpenRouter',
    logo: openrouterLogo,
    url: 'https://openrouter.ai/api/v1/credits',
    method: 'GET',
    auth: {
      type: 'Bearer',
      apiKey: '',
      headerKey: 'Authorization'
    },
    parser: {
      parserType: 'openrouter'
    },
    monitoring: {
      enabled: false,
      interval: 30
    },
    thresholds: {
      warning: 10,
      danger: 2
    },
    isPreset: true
  },
  {
    name: 'StepFun',
    logo: stepfunLogo,
    url: 'https://api.stepfun.com/v1/accounts',
    method: 'GET',
    auth: {
      type: 'Bearer',
      apiKey: '',
      headerKey: 'Authorization'
    },
    timeout: 15000,
    parser: {
      parserType: 'stepfun'
    },
    monitoring: {
      enabled: false,
      interval: 30
    },
    thresholds: {
      warning: 50,
      danger: 10
    },
    isPreset: true
  },
  {
    name: 'SiliconFlow (CN)',
    logo: siliconFlowLogo,
    url: 'https://api.siliconflow.cn/v1/user/info',
    method: 'GET',
    auth: {
      type: 'Bearer',
      apiKey: '',
      headerKey: 'Authorization'
    },
    timeout: 15000,
    parser: {
      parserType: 'siliconflow'
    },
    monitoring: {
      enabled: false,
      interval: 30
    },
    thresholds: {
      warning: 50,
      danger: 10
    },
    isPreset: true
  },
  {
    name: 'SiliconFlow (EN)',
    logo: siliconFlowLogo,
    url: 'https://api.siliconflow.com/v1/user/info',
    method: 'GET',
    auth: {
      type: 'Bearer',
      apiKey: '',
      headerKey: 'Authorization'
    },
    timeout: 15000,
    parser: {
      parserType: 'siliconflow_en'
    },
    monitoring: {
      enabled: false,
      interval: 30
    },
    thresholds: {
      warning: 10,
      danger: 2
    },
    isPreset: true
  },
  {
    name: 'Novita AI',
    logo: novitaLogo,
    url: 'https://api.novita.ai/v3/user/balance',
    method: 'GET',
    auth: {
      type: 'Bearer',
      apiKey: '',
      headerKey: 'Authorization'
    },
    timeout: 15000,
    parser: {
      parserType: 'novita'
    },
    monitoring: {
      enabled: false,
      interval: 30
    },
    thresholds: {
      warning: 10,
      danger: 2
    },
    isPreset: true
  },
  {
    name: 'MiniMax AI',
    logo: minimaxLogo,
    url: 'https://www.minimaxi.com/account/query_balance',
    method: 'GET',
    auth: {
      type: 'Bearer',
      apiKey: '',
      headerKey: 'authorization'
    },
    timeout: 10000,
    parser: {
      parserType: 'minimax'
    },
    monitoring: {
      enabled: false,
      interval: 30
    },
    thresholds: {
      warning: 10,
      danger: 2
    },
    isPreset: true
  }
  // {
  //   name: 'VolcEngine',
  //   logo: volcengineLogo,
  //   url: 'https://volcengine.com/api/balance',
  //   method: 'GET',
  //   auth: {
  //     type: 'APIKey',
  //     apiKey: '',
  //     headerKey: 'X-Api-Key'
  //   },
  //   parser: {
  //     parserType: 'volcengine'
  //   },
  //   monitoring: {
  //     enabled: false,
  //     interval: 30
  //   },
  //   thresholds: {
  //     warning: 100,
  //     danger: 20
  //   },
  //   isPreset: true
  // }
]

export { balanceList }
