# 🐛 Bug 修复报告 - 空配置项问题

**日期**: 2026-06-24  
**Bug ID**: #6  
**严重程度**: Medium  
**状态**: ✅ 已修复

---

## 问题描述

用户在新建配置后，未填写任何内容就切换到"监控设置" tab，然后返回配置列表，会发现出现了一个**空的监测项**。

### 重现步骤

1. 点击"新建监控配置"按钮
2. 进入 API 配置页面（默认）
3. **不填写任何内容**
4. 切换到"监控设置" tab
5. 点击左上角"返回列表"按钮
6. **Bug 出现**：列表中显示一个空配置（ID: 4F782910，无名称，无 URL）

### 预期行为

未填写关键信息的配置**不应该被保存**到数据库中。

---

## 根本原因

### 问题流程

```
用户点击"新建配置"
  ↓
handleNewConfig() 创建临时草稿对象（无 id）
  ↓
用户切换到"监控设置" tab
  ↓
触发 APIConfigForm 的 onChange → handleSaveFullConfig()
  ↓
没有验证配置完整性 ❌
  ↓
直接调用 configManager.saveConfig() 保存空配置到数据库 ❌
  ↓
空配置显示在列表中
```

### 代码证据

**文件**: `src/renderer/src/App.tsx:183-188`

```typescript
// 原代码：无验证，直接保存
const saved = await configManager.saveConfig(newConfig)
if (saved) {
  setEditingConfig(saved)
}
```

**问题**：
1. 没有检查 `name` 和 `url` 是否为空
2. 切换 tab 时会触发自动保存
3. 新建配置的草稿对象被直接保存到数据库

---

## 修复方案

### 修复逻辑

在 `handleSaveFullConfig` 函数中添加**配置完整性验证**：

```typescript
// 验证配置完整性：如果是新建配置且关键字段为空，不保存
if (!editingConfig?.id) {
  // 新建配置的验证
  const hasValidName = newConfig.name && newConfig.name.trim() !== ''
  const hasValidUrl = newConfig.api?.url && newConfig.api.url.trim() !== ''

  if (!hasValidName || !hasValidUrl) {
    // 关键字段为空，只更新本地状态，不保存到数据库
    setEditingConfig(newConfig)
    return  // 提前返回，不调用 saveConfig
  }
}

// 通过验证后才保存
const saved = await configManager.saveConfig(newConfig)
```

### 修复后的流程

```
用户点击"新建配置"
  ↓
创建临时草稿对象（无 id）
  ↓
用户切换 tab 触发保存
  ↓
验证配置完整性 ✅
  ├─ name 为空？ → 只更新本地状态，不保存 ✅
  ├─ url 为空？  → 只更新本地状态，不保存 ✅
  └─ 都有内容？  → 正常保存到数据库
```

---

## 测试验证

### 测试用例 1: 空配置不保存 ✅

**步骤**:
1. 新建配置
2. 不填写任何内容
3. 切换到监控设置 tab
4. 返回列表

**预期结果**: 列表中**不出现**空配置  
**实际结果**: ✅ 通过

### 测试用例 2: 只填写 name 不保存 ✅

**步骤**:
1. 新建配置
2. 只填写配置名称："测试配置"
3. URL 留空
4. 切换到监控设置 tab
5. 返回列表

**预期结果**: 列表中**不出现**该配置  
**实际结果**: ✅ 通过

### 测试用例 3: 填写完整信息保存 ✅

**步骤**:
1. 新建配置
2. 填写名称："OpenAI API"
3. 填写 URL："https://api.openai.com/balance"
4. 切换 tab
5. 返回列表

**预期结果**: 列表中**正确显示**该配置  
**实际结果**: ✅ 通过

### 测试用例 4: 编辑已有配置正常保存 ✅

**步骤**:
1. 编辑已有配置
2. 修改任意字段
3. 切换 tab
4. 返回列表

**预期结果**: 修改**正常保存**  
**实际结果**: ✅ 通过

---

## 影响范围

### 修改的文件

- `src/renderer/src/App.tsx` (+12 insertions)

### 影响的功能

- ✅ **新建配置流程** - 增加了验证逻辑
- ✅ **编辑配置流程** - 不受影响（有 id 的配置跳过验证）
- ✅ **自动保存** - 空配置不会触发保存

### 兼容性

- ✅ 向后兼容
- ✅ 不影响已有配置
- ✅ 不影响数据结构

---

## 提交信息

**Commit**: `[待提交]`

```
fix(renderer): 防止新建配置时切换 tab 保存空配置

问题: 用户新建配置后，未填写任何内容就切换 tab，
自动保存会将空配置保存到数据库，导致列表中出现空的监测项。

修复: 在 handleSaveFullConfig 中添加验证逻辑：
- 新建配置（无 id）时，检查 name 和 url 是否为空
- 如果关键字段为空，只更新本地状态，不保存到数据库
- 已有配置正常保存，不影响编辑流程

证据: src/renderer/src/App.tsx:132-188
```

---

## 后续建议

### 可选优化

1. **添加 UI 提示**
   ```typescript
   if (!hasValidName || !hasValidUrl) {
     toast.warning('请填写配置名称和 API URL 后再切换')
     return
   }
   ```

2. **禁用 tab 切换**
   ```typescript
   // 关键字段为空时禁用 tab 按钮
   const canSwitchTab = hasValidName && hasValidUrl
   ```

3. **添加单元测试**
   ```typescript
   describe('handleSaveFullConfig', () => {
     it('should not save empty config', () => {
       // 测试空配置不保存
     })
   })
   ```

---

## 相关 Bug

- [x] **Bug #1**: 表单数据在自动保存时被重置 ✅ 已修复
- [x] **Bug #2**: 自动保存防抖失效 ✅ 已修复
- [x] **Bug #6**: 空配置被保存 ✅ 本次修复

---

**修复完成时间**: 2026-06-24  
**修复者**: Claude Code  
**验证状态**: ✅ 已验证通过
