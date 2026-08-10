import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { CategoryFormModal } from '../components/categories/CategoryFormModal'
import { useCategories, useDeleteCategory } from '../hooks/useCategories'
import type { Category } from '../types/database'

export function Categories() {
  const { data: categories = [], isLoading } = useCategories()
  const deleteCategory = useDeleteCategory()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null)

  const expenses = categories.filter((c) => c.type === 'expense')
  const incomes = categories.filter((c) => c.type === 'income')

  function renderGroup(title: string, items: Category[]) {
    return (
      <Card>
        <p className="mb-2 text-sm font-medium text-content">{title}</p>
        {items.length === 0 && <p className="py-4 text-center text-sm text-content-muted">Nenhuma categoria.</p>}
        <div className="divide-y divide-border">
          {items.map((c) => (
            <div key={c.id} className="flex items-center gap-3 py-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: c.color }}
              >
                {c.icon || c.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-content">{c.name}</span>
                <span className="block text-xs text-content-muted">{c.group === 'fixed' ? 'Fixa' : 'Variável'}</span>
              </span>
              <button
                onClick={() => setEditing(c)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-content-muted hover:bg-surface-sunken"
                aria-label="Editar"
              >
                <Pencil size={15} />
              </button>
              {confirmingDelete === c.id ? (
                <div className="flex items-center gap-1">
                  <Button variant="danger" onClick={() => deleteCategory.mutate(c.id, { onSuccess: () => setConfirmingDelete(null) })}>
                    Excluir
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmingDelete(null)}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingDelete(c.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-content-muted hover:bg-status-late/10 hover:text-status-late"
                  aria-label="Excluir"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-content-muted">{categories.length} categoria(s)</p>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} /> Nova categoria
        </Button>
      </div>

      {isLoading && <p className="py-8 text-center text-sm text-content-muted">Carregando…</p>}

      {!isLoading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {renderGroup('Despesas', expenses)}
          {renderGroup('Receitas', incomes)}
        </div>
      )}

      {showForm && <CategoryFormModal onClose={() => setShowForm(false)} />}
      {editing && <CategoryFormModal category={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
