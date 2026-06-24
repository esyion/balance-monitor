# ✨ MiniMax AI 支持添加完成

**日期**: 2026-06-24  
**功能**: 新增 MiniMax AI 余额监控支持

---

## 📋 添加内容

### 1. 解析器插件

**文件**: `src/shared/parser-plugins/plugins/minimax.ts`

- 继承 `BaseParserPlugin`
- 实现 `StandardBalance` 接口
- 解析字段：
  - `available_amount` - 总可用余额
  - `cash_balance` - 现金余额
  - `voucher_balance` - 代金券余额
  - `credit_balance` - 信用额度

### 2. 配置模板

**文件**: `src/renderer/src/config/balance.ts`

```typescript
{
  name: 'MiniMax AI',
  logo: minimaxLogo,
  url: 'https://www.minimaxi.com/account/query_balance',
  method: 'GET',
  auth: {
    type: 'Bearer',
    apiKey: '',
    headerKey: 'authorization'  // 注意：小写的 authorization
  },
  parser: {
    parserType: 'minimax'
  },
  thresholds: {
    warning: 10,
    danger: 2
  }
}
```

### 3. UI 组件更新

- ✅ `ParserConfig.tsx` - 添加 MiniMax 选项（图标：🤖）
- ✅ `balance.ts` - 添加配置模板
- ✅ `parser-types.ts` - 添加 MINIMAX 常量
- ✅ `plugin-loader.ts` - 注册 MiniMax 插件

### 4. Logo

- ✅ 下载并添加 MiniMax logo: `src/renderer/src/assets/providers/minimax.png`

---

## 🔧 API 详情

### 请求示例

```http
GET /account/query_balance HTTP/1.1
Host: www.minimaxi.com
authorization: Bearer {apikey}
```

### 响应示例

```json
{
  "available_amount": "100.50",
  "cash_balance": "50.00",
  "voucher_balance": "30.50",
  "credit_balance": "20.00",
  "owed_amount": "0.00",
  "balance_alert_switch": false,
  "balance_alert_threshold": "",
  "base_resp": {
    "status_code": 0,
    "status_msg": "success"
  }
}
```

### 解析逻辑

1. 检查 `base_resp.status_code === 0` 确保成功
2. 提取 `available_amount` 作为主要余额
3. 状态判断：
   - `<= 0` → inactive
   - `<= 2` → danger
   - `<= 10` → warning
   - `> 10` → active

---

## 📝 使用方法

### 1. 新建配置

1. 点击"新建监控配置"
2. 在厂商列表中选择 **MiniMax AI**
3. 填写 API Key
4. 点击"测试连接 & 完成配置"

### 2. 配置解析器

如果使用自定义配置：

1. 进入"高级配置"
2. 在解析器类型中选择 **MiniMax AI**
3. URL 设置为: `https://www.minimaxi.com/account/query_balance`
4. 认证头设置为: `authorization`（小写）

---

## ⚠️ 注意事项

1. **认证头名称**: MiniMax 使用小写的 `authorization`，不是标准的 `Authorization`
2. **余额字段**: 使用 `available_amount` 作为总可用余额
3. **状态检查**: 必须检查 `base_resp.status_code === 0`

---

## 🧪 测试验证

### 测试步骤

1. **安装依赖并启动**
   ```bash
   pnpm install
   pnpm dev
   ```

2. **创建 MiniMax 配置**
   - 选择 MiniMax AI 模板
   - 输入有效的 API Key

3. **测试连接**
   - 点击"测试连接"按钮
   - 验证余额正确显示

4. **启动监控**
   - 启用监控
   - 验证余额定时刷新

---

## 📊 文件变更

```
新增:
+ src/shared/parser-plugins/plugins/minimax.ts (114 lines)
+ src/renderer/src/assets/providers/minimax.png

修改:
M src/shared/parser-types.ts (+1 line)
M src/shared/parser-plugins/plugin-loader.ts (+2 lines)
M src/renderer/src/config/balance.ts (+27 lines)
M src/renderer/src/components/ParserConfig.tsx (+1 line)
```

---

## 🎉 完成状态

- ✅ 解析器插件实现
- ✅ 配置模板添加
- ✅ UI 组件更新
- ✅ Logo 资源添加
- ✅ 类型检查通过
- ✅ 代码已提交

---

**提交**: `[latest commit]`  
**作者**: Claude Code  
**审查**: 待测试
