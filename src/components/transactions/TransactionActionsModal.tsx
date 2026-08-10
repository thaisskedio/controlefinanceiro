import { useState } from 'react'
import { CheckCircle2, Circle, Pencil, Trash2, XCircle } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { StatusBadge } from '../ui/StatusBadge'
import type { TransactionWithCategory } from '../../types/database'
import { formatCurrency, formatDate } from '../../lib/format'
import { getEffectiveStatus } from '../../lib/status'
import {
  useCancelTransaction,
  useDeleteTransaction,
  useMarkAsPaid,
  useMarkAsPending,
} from '../../hooks/useTransactions'

export function TransactionActionsModal({
  transaction,
  onClose,
  onEdit,
}: {
  transaction: TransactionWithCategory
  onClose: () => void
  onEdit: () => void
}) {
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const markAsPaid = useMarkAsPaid()
  const markAsPending = useMarkAsPending()
  const cancelTransaction = useCancelTransaction()
  const deleteTransaction = useDeleteTransaction()

  const status = getEffectiveStatus(transaction)
  const isPartOfGroup = !!transaction.installment_group_id

  return (
    <Modal title="Lançamento" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium text-content">{transaction.description}</p>
          <p className="text-xs text-content-muted">
            {transaction.category?.name ?? 'Sem categoria'} · vence em {formatDate(transaction.due_date)}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xl font-semibold text-content">{formatCurrency(transaction.amount)}</span>
            <StatusBadge status={status} />
          </div>
        </div>

        {status !== 'canceled' && (
          <div className="flex flex-col gap-2">
            {status === 'paid' ? (
              <Button variant="secondary" onClick={() => markAsPending.mutate(transaction.id, { onSuccess: onClose })}>
                <Circle size={16} /> Marcar como pendente
              </Button>
            ) : (
              <Button onClick={() => markAsPaid.mutate(transaction.id, { onSuccess: onClose })}>
                <CheckCircle2 size={16} /> Marcar como pago
              </Button>
            )}

            <Button variant="secondary" onClick={onEdit}>
              <Pencil size={16} /> Editar
            </Button>

            {!confirmingCancel ? (
              <Button variant="danger" onClick={() => setConfirmingCancel(true)}>
                <XCircle size={16} /> Cancelar lançamento
              </Button>
            ) : (
              <div className="rounded-xl border border-status-late/30 bg-status-late/5 p-3">
                <p className="mb-2 text-xs text-content">
                  {isPartOfGroup
                    ? 'Esta parcela faz parte de um parcelamento. O que deseja cancelar?'
                    : 'Confirma o cancelamento deste lançamento?'}
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="danger"
                    onClick={() =>
                      cancelTransaction.mutate(
                        { transaction, scope: 'single' },
                        { onSuccess: onClose },
                      )
                    }
                  >
                    {isPartOfGroup ? 'Cancelar apenas esta parcela' : 'Confirmar cancelamento'}
                  </Button>
                  {isPartOfGroup && (
                    <Button
                      variant="danger"
                      onClick={() =>
                        cancelTransaction.mutate(
                          { transaction, scope: 'future' },
                          { onSuccess: onClose },
                        )
                      }
                    >
                      Cancelar esta e as parcelas futuras
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => setConfirmingCancel(false)}>
                    Voltar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {!confirmingDelete ? (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="flex items-center justify-center gap-2 text-xs text-content-muted hover:text-status-late"
          >
            <Trash2 size={14} /> Excluir permanentemente
          </button>
        ) : (
          <div className="rounded-xl border border-border p-3 text-center">
            <p className="mb-2 text-xs text-content-muted">
              Excluir remove o registro do histórico. Prefira cancelar quando possível.
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="ghost" onClick={() => setConfirmingDelete(false)}>
                Voltar
              </Button>
              <Button variant="danger" onClick={() => deleteTransaction.mutate(transaction.id, { onSuccess: onClose })}>
                Excluir
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
