import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Label, Input, Select } from '../ui/Field'
import { Button } from '../ui/Button'
import { useCreateCategory, useUpdateCategory } from '../../hooks/useCategories'
import type { Category, CategoryGroup, TransactionType } from '../../types/database'

const PRESET_COLORS = ['#F472B6', '#EC4899', '#A78BFA', '#C4B5FD', '#0F4C5C', '#134E5E', '#22C55E', '#EAB308']

export function CategoryFormModal({ category, onClose }: { category?: Category | null; onClose: () => void }) {
  const isEditing = !!category
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()

  const [name, setName] = useState(category?.name ?? '')
  const [type, setType] = useState<TransactionType>(category?.type ?? 'expense')
  const [group, setGroup] = useState<CategoryGroup>(category?.group ?? 'variable')
  const [color, setColor] = useState(category?.color ?? PRESET_COLORS[2])
  const [icon, setIcon] = useState(category?.icon ?? '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Informe um nome para a categoria')
      return
    }
    setSubmitting(true)
    try {
      if (isEditing) {
        await updateCategory.mutateAsync({ id: category.id, input: { name, type, group, color, icon: icon || null } })
      } else {
        await createCategory.mutateAsync({ name, type, group, color, icon: icon || null })
      }
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={isEditing ? 'Editar categoria' : 'Nova categoria'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label>Nome</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Alimentação" />
          {error && <p className="mt-1 text-xs text-status-late">{error}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Tipo</Label>
            <Select value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </Select>
          </div>
          <div>
            <Label>Grupo</Label>
            <Select value={group} onChange={(e) => setGroup(e.target.value as CategoryGroup)}>
              <option value="fixed">Fixa</option>
              <option value="variable">Variável</option>
            </Select>
          </div>
        </div>

        <div>
          <Label>Ícone (emoji, opcional)</Label>
          <Input value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={2} placeholder="🛒" />
        </div>

        <div>
          <Label>Cor</Label>
          <div className="flex flex-wrap items-center gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="h-8 w-8 rounded-full ring-offset-2 ring-offset-surface-raised transition-shadow"
                style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px ${c}` : undefined }}
                aria-label={c}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded-full border border-border bg-transparent"
            />
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {isEditing ? 'Salvar' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
