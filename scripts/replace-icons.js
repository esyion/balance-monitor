#!/usr/bin/env node
/**
 * 图标替换脚本 - 将所有 emoji 替换为 Lucide Icons
 *
 * 使用方法：node scripts/replace-icons.js
 */

const fs = require('fs')
const path = require('path')

const replacements = [
  {
    file: 'src/renderer/src/components/ConfigManager.tsx',
    changes: [
      {
        description: '添加图标导入',
        search: `import React, { useState } from 'react'
import { BalanceMonitorConfig } from '../types'
import { balanceList } from '../config/balance'
import { ConfirmModal } from './ConfirmModal'`,
        replace: `import React, { useState } from 'react'
import { BalanceMonitorConfig } from '../types'
import { balanceList } from '../config/balance'
import { ConfirmModal } from './ConfirmModal'
import { Sparkles, Settings, Upload, Trash2, Loader2, Lightbulb } from 'lucide-react'`
      },
      {
        description: '替换新建按钮图标',
        search: `<span>✨</span>`,
        replace: `<Sparkles className="w-4 h-4" />`
      },
      {
        description: '替换提示灯泡图标',
        search: `<span className="text-lg">💡</span>`,
        replace: `<Lightbulb className="w-5 h-5" />`
      },
      {
        description: '替换编辑图标',
        search: `⚙️`,
        replace: `<Settings className="w-4 h-4" />`,
        count: 1
      },
      {
        description: '替换导出图标',
        search: `📤`,
        replace: `<Upload className="w-4 h-4" />`
      },
      {
        description: '替换删除/加载图标',
        search: `{deletingId === config.id ? '⌛' : '🗑️'}`,
        replace: `{deletingId === config.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}`
      }
    ]
  },
  {
    file: 'src/renderer/src/components/APIConfigForm.tsx',
    changes: [
      {
        description: '添加图标导入',
        search: `import { BalanceMonitorConfig } from '@renderer/types'
import { BalanceTemplateConfig } from '../config/balance'
import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { balanceList } from '../config/balance'
import { useAutoSave } from '@renderer/hooks'
import { useFormStore, selectUpdateAPIForm } from '@renderer/store'`,
        replace: `import { BalanceMonitorConfig } from '@renderer/types'
import { BalanceTemplateConfig } from '../config/balance'
import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { balanceList } from '../config/balance'
import { useAutoSave } from '@renderer/hooks'
import { useFormStore, selectUpdateAPIForm } from '@renderer/store'
import { Lock, Lightbulb, Zap, Search, X, Check, Settings, ChevronRight, ChevronDown } from 'lucide-react'`
      },
      {
        description: '替换搜索图标',
        search: `<span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 text-[10px] group-focus-within/search:text-primary transition-colors">
                  🔍
                </span>`,
        replace: `<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/40 group-focus-within/search:text-primary transition-colors" />`
      },
      {
        description: '替换清除按钮',
        search: `×`,
        replace: `<X className="w-3 h-3" />`
      },
      {
        description: '替换模板默认图标',
        search: `<span className="text-lg">⚙️</span>`,
        replace: `<Settings className="w-6 h-6" />`
      },
      {
        description: '替换选中标记',
        search: `<div className="absolute top-2 right-2 text-[10px] text-primary bg-primary/10 rounded-full w-4 h-4 flex items-center justify-center">
                          ✓
                        </div>`,
        replace: `<div className="absolute top-2 right-2 text-primary bg-primary/10 rounded-full w-4 h-4 flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>`
      },
      {
        description: '替换锁图标',
        search: `🔒`,
        replace: `<Lock className="w-4 h-4" />`
      },
      {
        description: '替换提示灯泡',
        search: `<span>💡</span>`,
        replace: `<Lightbulb className="w-3 h-3" />`
      },
      {
        description: '替换展开/收起箭头',
        search: `<span>{showAdvanced ? '▼' : '▶'}</span>`,
        replace: `{showAdvanced ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}`
      },
      {
        description: '替换测试按钮图标',
        search: `<span>⚡</span>`,
        replace: `<Zap className="w-4 h-4" />`
      }
    ]
  },
  {
    file: 'src/renderer/src/components/LogViewer.tsx',
    changes: [
      {
        description: '添加图标导入',
        search: `import { useState, useEffect } from 'react'`,
        replace: `import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'`
      },
      {
        description: '替换删除图标',
        search: `🗑️`,
        replace: `<Trash2 className="w-4 h-4" />`
      }
    ]
  }
]

console.log('🚀 开始替换图标...\n')

let totalChanges = 0

for (const fileConfig of replacements) {
  const filePath = path.join(process.cwd(), fileConfig.file)

  console.log(`📝 处理文件: ${fileConfig.file}`)

  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  文件不存在，跳过`)
    continue
  }

  let content = fs.readFileSync(filePath, 'utf-8')
  let fileChanges = 0

  for (const change of fileConfig.changes) {
    if (content.includes(change.search)) {
      content = content.replace(change.search, change.replace)
      fileChanges++
      console.log(`  ✅ ${change.description}`)
    } else {
      console.log(`  ⏭️  ${change.description} (已存在或未找到)`)
    }
  }

  if (fileChanges > 0) {
    fs.writeFileSync(filePath, content, 'utf-8')
    totalChanges += fileChanges
    console.log(`  💾 已保存 ${fileChanges} 处修改\n`)
  } else {
    console.log(`  📌 无需修改\n`)
  }
}

console.log(`\n✨ 完成！总共替换了 ${totalChanges} 处图标`)
console.log('\n📋 下一步:')
console.log('  1. 运行 pnpm typecheck 检查类型')
console.log('  2. 运行 pnpm dev 查看效果')
console.log('  3. 提交更改: git add . && git commit -m "style: 使用 Lucide Icons 替换 emoji 图标"')
