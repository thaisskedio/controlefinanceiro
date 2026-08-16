import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../ui/Modal'
import { Label, Input, Select, Toggle } from '../ui/Field'
import { Button } from '../ui/Button'
import { useCategories } from '../../hooks/useCategories'
import {
  useCreateTransaction,
  useUpdateTransaction,
  useUpdateTransactionSeries,
} from '../../hooks/useTransactions'
import type { RecurrenceFrequency, TransactionWithCategory } from '../../types/database'
import { todayISO } from '../../lib/status'
import { MAX_RECURRING_OCCURRENCES } from '../../services/transactions'

const schema = z
  .object({
    type: z.enum(['expense', 'income']),
    category_id: z.string().min(1, 'Selecione uma categoria'),
    description: z.string().min(1, 'Informe uma descrição'),
    due_date: z.string().min(1, 'Informe a data de vencimento'),
    is_recurring: z.boolean(),
    recurrence_frequency: z.enum(['monthly', 'weekly', 'yearly', 'none']),
    recurrence_interval: z.string().optional(),
    is_installment: z.boolean(),
    amount: z.string().optional(),
    total_amount: z.string().optional(),
    installment_total: z.string().optional(),
  })
  .refine((data) => data.is_installment || Number(data.amount) > 0, {
    message: 'Informe um valor maior que zero',
    path: ['amount'],
  })
  .refine((data) => !data.is_installment || Number(data.total_amount) > 0, {
    message: 'Informe o valor total da compra',
    path: ['total_amount'],
  })
  .refine((data) => !data.is_installment || Number(data.installment_total) >= 2, {
    message: 'Informe ao menos 2 parcelas',
    path: ['installment_total'],
  })
  .refine((data) => !data.is_recurring || Number(data.recurrence_interval) >= 1, {
    message: 'Informe um intervalo válido (mínimo 1)',
    path: ['recurrence_interval'],
  })

type FormValues = z.infer<typeof schema>

const FREQUENCY_UNIT_LABEL: Record<RecurrenceFrequency, { singular: string; plural: string }> = {
  monthly: { singular: 'mês', plural: 'meses' },
  weekly: { singular: 'semana', plural: 'semanas' },
  yearly: { singular: 'ano', plural: 'anos' },
  none: { singular: 'mês', plural: 'meses' },
}

function intervalLabel(frequency: RecurrenceFrequency, interval: number) {
  const unit = FREQUENCY_UNIT_LABEL[frequency]
  return `A cada ${interval} ${interval === 1 ? unit.singular : unit.plural}`
}

export function TransactionFormModal({
  transaction,
  onClose,
}: {
  transaction?: TransactionWithCategory | null
  onClose: () => void
}) {
  const { data: categories = [] } = useCategories()
  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction()
  const updateTransactionSeries = useUpdateTransactionSeries()
  const isEditing = !!transaction
  const isPartOfInstallmentGroup = !!transaction?.installment_group_id
  const isPartOfRecurrenceGroup = !!transaction?.recurrence_group_id

  const [editScope, setEditScope] = useState<'single' | 'future'>('single')
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('')
  const [recurrenceError, setRecurrenceError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: transaction
      ? {
          type: transaction.type,
          category_id: transaction.category_id ?? '',
          description: transaction.description,
          due_date: transaction.due_date,
          is_recurring: transaction.is_recurring,
          recurrence_frequency: transaction.recurrence_frequency,
          recurrence_interval: String(transaction.recurrence_interval ?? 1),
          is_installment: transaction.is_installment,
          amount: String(transaction.amount),
          total_amount: transaction.total_amount != null ? String(transaction.total_amount) : undefined,
          installment_total:
            transaction.installment_total != null ? String(transaction.installment_total) : undefined,
        }
      : {
          type: 'expense',
          category_id: '',
          description: '',
          due_date: todayISO(),
          is_recurring: false,
          recurrence_frequency: 'none',
          recurrence_interval: '1',
          is_installment: false,
        },
  })

  const type = watch('type')
  const isRecurring = watch('is_recurring')
  const isInstallment = watch('is_installment')
  const recurrenceFrequency = watch('recurrence_frequency')
  const recurrenceInterval = Number(watch('recurrence_interval')) || 1
  const filteredCategories = categories.filter((c) => c.type === type)

  const onSubmit = async (values: FormValues) => {
    setRecurrenceError(null)

    if (isEditing) {
      const baseInput = {
        type: values.type,
        category_id: values.category_id,
        description: values.description,
        amount: values.amount ? Number(values.amount) : transaction.amount,
      }

      if (editScope === 'future' && isPartOfRecurrenceGroup) {
        await updateTransactionSeries.mutateAsync({ transaction, input: baseInput })
      } else {
        await updateTransaction.mutateAsync({
          id: transaction.id,
          input: { ...baseInput, due_date: values.due_date },
        })
      }
      onClose()
      return
    }

    if (values.is_recurring && !recurrenceEndDate) {
      setRecurrenceError('Informe até quando o lançamento deve se repetir.')
      return
    }

    await createTransaction.mutateAsync({
      type: values.type,
      category_id: values.category_id,
      description: values.description,
      due_date: values.due_date,
      is_recurring: values.is_recurring,
      recurrence_frequency: values.is_recurring ? values.recurrence_frequency : 'none',
      recurrence_interval: values.is_recurring ? Number(values.recurrence_interval) || 1 : 1,
      recurrence_end_date: values.is_recurring ? recurrenceEndDate : null,
      is_installment: values.is_installment,
      installment_total: values.is_installment ? Number(values.installment_total) : null,
      amount: values.is_installment ? 0 : Number(values.amount),
      total_amount: values.is_installment ? Number(values.total_amount) : null,
    })
    onClose()
  }

  return (
    <Modal title={isEditing ? 'Editar lançamento' : 'Novo lançamento'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {isEditing && isPartOfRecurrenceGroup && (
          <div>
            <Label>Aplicar edição a</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEditScope('single')}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                  editScope === 'single'
                    ? 'border-transparent bg-gradient-to-r from-brand-pink to-brand-lilac text-white'
                    : 'border-border text-content-muted'
                }`}
              >
                Somente esta
              </button>
              <button
                type="button"
                onClick={() => setEditScope('future')}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                  editScope === 'future'
                    ? 'border-transparent bg-gradient-to-r from-brand-pink to-brand-lilac text-white'
                    : 'border-border text-content-muted'
                }`}
              >
                Esta e as futuras
              </button>
            </div>
          </div>
        )}

        <div>
          <Label>Tipo</Label>
          <div className="grid grid-cols-2 gap-2">
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setValue('type', t)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                  type === t
                    ? 'border-transparent bg-gradient-to-r from-brand-pink to-brand-lilac text-white'
                    : 'border-border text-content-muted'
                }`}
              >
                {t === 'expense' ? 'Despesa' : 'Receita'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Descrição</Label>
          <Input {...register('description')} placeholder="Ex: Supermercado" />
          {errors.description && <p className="mt-1 text-xs text-status-late">{errors.description.message}</p>}
        </div>

        <div>
          <Label>Categoria</Label>
          <Select {...register('category_id')}>
            <option value="">Selecione…</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.group === 'fixed' ? 'fixa' : 'variável'})
              </option>
            ))}
          </Select>
          {errors.category_id && <p className="mt-1 text-xs text-status-late">{errors.category_id.message}</p>}
        </div>

        <div>
          <Label>Data de vencimento</Label>
          <Input type="date" {...register('due_date')} disabled={isEditing && editScope === 'future'} />
          {isEditing && editScope === 'future' && (
            <p className="mt-1 text-xs text-content-muted">
              Cada ocorrência futura mantém sua própria data ao editar em série.
            </p>
          )}
        </div>

        {!isEditing && (
          <Toggle
            checked={isInstallment}
            onChange={(v) => setValue('is_installment', v)}
            label="Compra parcelada"
          />
        )}

        {isInstallment && !isEditing ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Valor total</Label>
              <Input type="number" step="0.01" {...register('total_amount')} placeholder="0,00" />
              {errors.total_amount && (
                <p className="mt-1 text-xs text-status-late">{errors.total_amount.message}</p>
              )}
            </div>
            <div>
              <Label>Nº de parcelas</Label>
              <Input type="number" min={2} {...register('installment_total')} placeholder="Ex: 12" />
              {errors.installment_total && (
                <p className="mt-1 text-xs text-status-late">{errors.installment_total.message}</p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <Label>Valor {isPartOfInstallmentGroup ? 'da parcela' : ''}</Label>
            <Input type="number" step="0.01" {...register('amount')} placeholder="0,00" />
            {errors.amount && <p className="mt-1 text-xs text-status-late">{errors.amount.message}</p>}
          </div>
        )}

        {!isEditing && (
          <>
            <Toggle
              checked={isRecurring}
              onChange={(v) => {
                setValue('is_recurring', v)
                setValue('recurrence_frequency', v ? 'monthly' : 'none')
                setRecurrenceError(null)
              }}
              label="Lançamento recorrente"
            />

            {isRecurring && (
              <div className="flex flex-col gap-3 rounded-xl border border-border p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Frequência</Label>
                    <Select {...register('recurrence_frequency')}>
                      <option value="monthly">Mensal</option>
                      <option value="weekly">Semanal</option>
                      <option value="yearly">Anual</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Intervalo</Label>
                    <Input type="number" min={1} {...register('recurrence_interval')} placeholder="1" />
                    {errors.recurrence_interval && (
                      <p className="mt-1 text-xs text-status-late">{errors.recurrence_interval.message}</p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-content-muted">
                  {intervalLabel(recurrenceFrequency, recurrenceInterval)}
                </p>

                <div>
                  <Label>Repetir até</Label>
                  <Input
                    type="date"
                    value={recurrenceEndDate}
                    onChange={(e) => {
                      setRecurrenceEndDate(e.target.value)
                      setRecurrenceError(null)
                    }}
                  />
                  <p className="mt-1 text-xs text-content-muted">
                    Gera uma ocorrência para cada período até essa data (máx. {MAX_RECURRING_OCCURRENCES}).
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {recurrenceError && <p className="text-xs text-status-late">{recurrenceError}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isEditing ? 'Salvar alterações' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
