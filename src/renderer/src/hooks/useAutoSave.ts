import { useState, useEffect, useRef, useCallback } from 'react'

interface AutoSaveOptions {
  delay?: number
  onSave: (data: any) => Promise<void>
  onError?: (error: Error) => void
  onSuccess?: () => void
}

export function useAutoSave({ delay = 1000, onSave, onError, onSuccess }: AutoSaveOptions) {
  const [dataToSave, setDataToSave] = useState<any>(undefined)
  const [hasPendingSave, setHasPendingSave] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // 使用 ref 存储回调，避免依赖变化
  const onSaveRef = useRef(onSave)
  const onErrorRef = useRef(onError)
  const onSuccessRef = useRef(onSuccess)

  // 同步最新的回调到 ref
  useEffect(() => {
    onSaveRef.current = onSave
    onErrorRef.current = onError
    onSuccessRef.current = onSuccess
  }, [onSave, onError, onSuccess])

  const triggerSave = useCallback((data?: any) => {
    setDataToSave(data)
    setHasPendingSave(true)
  }, [])

  useEffect(() => {
    if (!hasPendingSave || isSaving) return

    // 清除之前的定时器
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // 设置新的定时器
    debounceRef.current = setTimeout(async () => {
      try {
        setIsSaving(true)
        setHasPendingSave(false)
        await onSaveRef.current(dataToSave)
        onSuccessRef.current?.()
      } catch (error) {
        onErrorRef.current?.(error instanceof Error ? error : new Error(String(error)))
      } finally {
        setIsSaving(false)
        setDataToSave(undefined)
      }
    }, delay)

    // 清理函数
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [dataToSave, delay, isSaving, hasPendingSave])

  return {
    triggerSave,
    isSaving
  }
}
