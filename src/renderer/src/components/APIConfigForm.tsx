import { BalanceMonitorConfig } from '@renderer/types'
import { BalanceTemplateConfig } from '../config/balance'
import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { balanceList } from '../config/balance'
import { useAutoSave } from '@renderer/hooks'
import { useFormStore, selectUpdateAPIForm } from '@renderer/store'

interface APIConfigFormProps {
  initialData?: Partial<BalanceMonitorConfig>
  onChange: (data: Partial<BalanceMonitorConfig>) => Promise<void>
  onTest?: (data: Partial<BalanceMonitorConfig>) => Promise<any>
  loading?: boolean
  configId?: string
}

export const APIConfigForm: React.FC<APIConfigFormProps> = ({
  initialData,
  onChange,
  onTest,
  loading = false,
  configId
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [formData, setFormData] = useState<Partial<BalanceMonitorConfig>>({
    name: initialData?.name || '',
    url: initialData?.url || '',
    method: initialData?.method || 'GET',
    auth: initialData?.auth || {
      type: 'Bearer',
      apiKey: '',
      headerKey: 'Authorization'
    },
    timeout: initialData?.timeout || 10000,
    body: initialData?.body || ''
  })

  // 追踪上一次的 configId，用于判断是否真正切换了配置
  const prevConfigIdRef = useRef<string | undefined>(configId)

  const { triggerSave, isSaving } = useAutoSave({
    delay: 1000,
    onSave: onChange,
    onSuccess: () => {
      console.log('API配置已自动保存')
    },
    onError: (error) => {
      console.error('自动保存失败:', error)
      toast.error('自动保存失败: ' + error.message)
    }
  })

  // 加载配置模板
  const templates = balanceList || []
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 当选择模板时自动填充配置
  const handleTemplateChange = (templateName: string) => {
    const template = templates.find((t: BalanceTemplateConfig) => t.name === templateName)
    if (template) {
      const newData = {
        ...formData,
        name: template.name,
        url: template.url,
        method: template.method,
        auth: {
          type: template.auth.type,
          apiKey: '', // API密钥不复制
          headerKey: template.auth.headerKey || 'Authorization'
        },
        timeout: template.timeout || 10000,
        body: template.body || ''
      }
      setFormData(newData)

      // 立即保存，包含完整的模板配置（parser、monitoring、thresholds）
      const fullConfig = {
        ...newData,
        logo: template.logo,
        parser: template.parser,
        monitoring: template.monitoring,
        thresholds: template.thresholds,
        isPreset: template.isPreset
      }
      triggerSave(fullConfig)
      toast.success(`已加载 ${template.name} 配置模板，请填写 API Key`)
    }
  }

  // 在表单字段变化时触发自动保存
  const handleFieldChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    triggerSave(newData)
  }

  const handleAuthChange = (field: 'type' | 'apiKey' | 'headerKey', value: any) => {
    const newAuth = {
      ...(formData.auth || { type: 'Bearer', apiKey: '', headerKey: 'Authorization' }),
      [field]: value
    }
    const newData = { ...formData, auth: newAuth }
    setFormData(newData)
    triggerSave(newData)
  }

  const handleTest = async () => {
    if (!onTest) return

    // 验证
    if (!formData.url) {
      toast.error('API地址不能为空')
      return
    }

    try {
      const result = await onTest(formData)
      if (result.success) {
        toast.success('API测试成功')
      } else {
        toast.error(result.error || '测试失败')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '测试失败')
    }
  }

  // 只在真正切换到不同配置时重置表单
  // 使用 ref 追踪上一次的 configId，避免 initialData 引用变化导致误触发重置
  useEffect(() => {
    // 只在切换到不同配置时重置表单
    if (configId !== prevConfigIdRef.current) {
      prevConfigIdRef.current = configId

      if (initialData) {
        setFormData({
          name: initialData.name || '',
          url: initialData.url || '',
          method: initialData.method || 'GET',
          auth: initialData.auth || {
            type: 'Bearer',
            apiKey: '',
            headerKey: 'Authorization'
          },
          timeout: initialData.timeout || 10000,
          body: initialData.body || ''
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configId]) // 保持只依赖 configId

  const updateAPIForm = useFormStore(selectUpdateAPIForm)

  // 同步到 Zustand store，供解析器测试使用
  useEffect(() => {
    updateAPIForm({
      name: formData.name,
      api: {
        url: formData.url as string,
        method: (formData.method as any) || 'GET',
        auth: formData.auth,
        timeout: formData.timeout,
        body: formData.body,
        headers: [] // 基础配置不包含额外 headers
      }
    })
  }, [formData, updateAPIForm])

  return (
    <div className="space-y-6 group">
      {/* 保存状态指示器 */}
      <div className="flex justify-between items-center h-4">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          身份认证
        </h3>
        <div className="text-xs text-muted-foreground">
          {isSaving && <span className="text-primary italic animate-pulse">自动保存中...</span>}
        </div>
      </div>

      <div className="bg-card/30 border border-border/50 rounded-2xl p-6 space-y-6 shadow-sm">
        {/* 配置模板选择 */}
        {templates.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 pl-1">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">
                选择厂商 / 服务商
              </label>
              <div className="relative group/search w-48">
                <input
                  type="text"
                  placeholder="搜索厂商..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-1.5 pl-8 text-xs bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all placeholder:text-muted-foreground/50"
                  spellCheck={false}
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 text-[10px] group-focus-within/search:text-primary transition-colors">
                  🔍
                </span>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground p-0.5 rounded-full"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="bg-muted/10 border border-border/30 rounded-xl p-2 max-h-56 overflow-y-auto custom-scrollbar">
              {filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {filteredTemplates.map((template: BalanceTemplateConfig) => (
                    <button
                      key={template.name}
                      type="button"
                      onClick={() => handleTemplateChange(template.name)}
                      className={`relative px-3 py-3 rounded-xl border text-xs font-bold transition-all duration-300 flex flex-col items-center gap-2 group/item ${formData.name === template.name
                        ? 'bg-primary/10 border-primary text-primary shadow-inner ring-1 ring-primary/20'
                        : 'bg-card border-border/50 text-muted-foreground hover:border-primary/30 hover:bg-card/80 hover:text-foreground hover:shadow-sm'
                        }`}
                    >
                      <div className={`p-1.5 rounded-lg transition-colors duration-300 ${formData.name === template.name ? 'bg-background/50' : 'bg-muted/30 group-hover/item:bg-primary/5'}`}>
                        {template.logo ? (
                          <img
                            src={template.logo}
                            alt={template.name}
                            className={`w-6 h-6 object-contain transition-transform duration-300 ${formData.name === template.name ? 'scale-110' : 'group-hover/item:scale-110'}`}
                          />
                        ) : (
                          <span className="text-lg">⚙️</span>
                        )}
                      </div>
                      <span className="text-center truncate w-full px-1">{template.name}</span>

                      {/* Selected indicator checkmark */}
                      {formData.name === template.name && (
                        <div className="absolute top-2 right-2 text-[10px] text-primary bg-primary/10 rounded-full w-4 h-4 flex items-center justify-center">
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/40">
                  <span className="text-2xl mb-2">👻</span>
                  <p className="text-xs font-medium">未找到匹配的厂商</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-2 text-[10px] text-primary hover:underline"
                  >
                    清除搜索
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* API密钥 - 核心输入项 */}
        <div className="relative group/input">
          <label className="block text-xs font-black uppercase tracking-widest mb-2 text-primary ml-1">
            API KEY (密钥)
          </label>
          <div className="relative">
            <input
              type="password"
              value={formData.auth?.apiKey || ''}
              onChange={(e) => handleAuthChange('apiKey', e.target.value)}
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-4 bg-muted/30 border border-border/50 text-foreground rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-card transition-all font-mono text-sm shadow-sm group-hover/input:border-primary/30"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 pointer-events-none">
              🔒
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-2 ml-1 flex items-center gap-1">
            <span>💡</span>
            {formData.auth?.type === 'Bearer'
              ? '请输入 API 令牌，系统将自动添加 Bearer 前缀'
              : '请输入 Basic 认证信息，系统将自动进行 Base64 编码'}
          </p>
        </div>
      </div>

      {/* 高级设置切换 */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors ml-1"
        >
          <span>{showAdvanced ? '▼' : '▶'}</span>
          高级配置 (非预设厂商请展开)
        </button>
      </div>

      {/* 高级设置面板 */}
      {showAdvanced && (
        <div className="bg-muted/10 border border-border/30 rounded-2xl p-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* API地址 */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 text-muted-foreground ml-1">
              接口终端 (Endpoint)
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => handleFieldChange('url', e.target.value)}
              placeholder="https://api.example.com/v1/balance"
              className="w-full px-3 py-2.5 border border-border/50 bg-card/50 text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 请求方法 */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 text-muted-foreground ml-1">
                请求方法
              </label>
              <select
                value={formData.method}
                onChange={(e) => handleFieldChange('method', e.target.value)}
                className="w-full px-3 py-2.5 border border-border/50 bg-card/50 text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-xs"
              >
                <option value="GET">GET (获取数据)</option>
                <option value="POST">POST (提交 JSON)</option>
              </select>
            </div>

            {/* 认证类型 */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 text-muted-foreground ml-1">
                认证方式
              </label>
              <select
                value={formData.auth?.type || 'Bearer'}
                onChange={(e) => handleAuthChange('type', e.target.value)}
                className="w-full px-3 py-2.5 border border-border/50 bg-card/50 text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-xs"
              >
                <option value="Bearer">Bearer Token (Sk-模式)</option>
                <option value="Basic">Basic Auth (账号密码)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Header Key */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 text-muted-foreground ml-1">
                HTTP 报头键名
              </label>
              <select
                value={formData.auth?.headerKey || 'Authorization'}
                onChange={(e) => handleAuthChange('headerKey', e.target.value)}
                className="w-full px-3 py-2.5 border border-border/50 bg-card/50 text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-xs"
              >
                <option value="Authorization">Authorization</option>
                <option value="X-Api-Key">X-Api-Key</option>
              </select>
            </div>

            {/* 超时时间 */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 text-muted-foreground ml-1">
                请求超时 (MS)
              </label>
              <input
                type="number"
                value={formData.timeout}
                onChange={(e) => handleFieldChange('timeout', parseInt(e.target.value))}
                min="1000"
                step="1000"
                className="w-full px-3 py-2.5 border border-border/50 bg-card/50 text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-xs"
              />
            </div>
          </div>

          {/* 请求体 */}
          {formData.method === 'POST' && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 text-muted-foreground ml-1">
                JSON 请求载荷 (Body)
              </label>
              <textarea
                value={formData.body}
                onChange={(e) => handleFieldChange('body', e.target.value)}
                placeholder='{"key": "value"}'
                rows={3}
                className="w-full px-3 py-2.5 border border-border/50 bg-card/50 text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono text-xs"
              />
            </div>
          )}
        </div>
      )}

      {/* 底部按钮栏 */}
      <div className="flex justify-end pt-4">
        {onTest && (
          <button
            type="button"
            onClick={handleTest}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <span>⚡</span>
            )}
            测试连接 & 完成配置
          </button>
        )}
      </div>
    </div>
  )
}
