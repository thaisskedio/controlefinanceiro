-- Controle Financeiro — schema inicial
-- Rode este arquivo no SQL Editor do seu projeto Supabase (Database > SQL Editor).
-- Requer: Authentication > Providers > Anonymous sign-ins habilitado
-- (o app usa auth.signInAnonymously() para obter um auth.uid() sem tela de login,
-- o que permite manter RLS por user_id mesmo sem cadastro/login explícito).

create extension if not exists "pgcrypto";

-- ── Enums ──────────────────────────────────────────────────────────────
do $$ begin
  create type transaction_type as enum ('expense', 'income');
exception when duplicate_object then null; end $$;

do $$ begin
  create type category_group as enum ('fixed', 'variable');
exception when duplicate_object then null; end $$;

do $$ begin
  create type recurrence_frequency as enum ('monthly', 'weekly', 'yearly', 'none');
exception when duplicate_object then null; end $$;

do $$ begin
  create type transaction_status as enum ('paid', 'pending', 'late', 'canceled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type budget_group as enum ('expenses', 'savings', 'leisure', 'emergency');
exception when duplicate_object then null; end $$;

-- ── categories ─────────────────────────────────────────────────────────
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type transaction_type not null,
  "group" category_group not null,
  color text not null default '#A78BFA',
  icon text,
  created_at timestamptz not null default now()
);

create index if not exists categories_user_id_idx on categories (user_id);

alter table categories enable row level security;

drop policy if exists "categories_select_own" on categories;
create policy "categories_select_own" on categories
  for select using (user_id = auth.uid());

drop policy if exists "categories_insert_own" on categories;
create policy "categories_insert_own" on categories
  for insert with check (user_id = auth.uid());

drop policy if exists "categories_update_own" on categories;
create policy "categories_update_own" on categories
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "categories_delete_own" on categories;
create policy "categories_delete_own" on categories
  for delete using (user_id = auth.uid());

-- ── transactions ───────────────────────────────────────────────────────
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid references categories (id) on delete set null,
  type transaction_type not null,
  description text not null,
  amount numeric(12, 2) not null,
  total_amount numeric(12, 2),
  is_recurring boolean not null default false,
  recurrence_frequency recurrence_frequency not null default 'none',
  is_installment boolean not null default false,
  installment_group_id uuid,
  installment_number int,
  installment_total int,
  due_date date not null,
  paid_date date,
  status transaction_status not null default 'pending',
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transactions_user_id_idx on transactions (user_id);
create index if not exists transactions_due_date_idx on transactions (due_date);
create index if not exists transactions_installment_group_idx on transactions (installment_group_id);
create index if not exists transactions_status_idx on transactions (status);

alter table transactions enable row level security;

drop policy if exists "transactions_select_own" on transactions;
create policy "transactions_select_own" on transactions
  for select using (user_id = auth.uid());

drop policy if exists "transactions_insert_own" on transactions;
create policy "transactions_insert_own" on transactions
  for insert with check (user_id = auth.uid());

drop policy if exists "transactions_update_own" on transactions;
create policy "transactions_update_own" on transactions
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "transactions_delete_own" on transactions;
create policy "transactions_delete_own" on transactions
  for delete using (user_id = auth.uid());

-- updated_at automático
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists transactions_set_updated_at on transactions;
create trigger transactions_set_updated_at
  before update on transactions
  for each row execute function set_updated_at();

-- Observação sobre o status "late": não é persistido — devido a due_date < hoje
-- ser algo que muda com a passagem do tempo (não com um write), o app calcula o
-- status efetivo no cliente (src/lib/status.ts::getEffectiveStatus) a partir de
-- `status` + `due_date`. Isso evita jobs/triggers agendados só para "envelhecer" linhas.

-- ── budget_plans ───────────────────────────────────────────────────────
create table if not exists budget_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  period date not null,
  category_group budget_group not null,
  planned_amount numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  unique (user_id, period, category_group)
);

create index if not exists budget_plans_user_id_idx on budget_plans (user_id);

alter table budget_plans enable row level security;

drop policy if exists "budget_plans_select_own" on budget_plans;
create policy "budget_plans_select_own" on budget_plans
  for select using (user_id = auth.uid());

drop policy if exists "budget_plans_insert_own" on budget_plans;
create policy "budget_plans_insert_own" on budget_plans
  for insert with check (user_id = auth.uid());

drop policy if exists "budget_plans_update_own" on budget_plans;
create policy "budget_plans_update_own" on budget_plans
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "budget_plans_delete_own" on budget_plans;
create policy "budget_plans_delete_own" on budget_plans
  for delete using (user_id = auth.uid());
