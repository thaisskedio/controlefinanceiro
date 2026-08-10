# Sistema de Controle Financeiro — Especificação Técnica
1. Visão Geral

Aplicação web de controle financeiro pessoal/empresarial com registro de despesas, receitas, parcelamentos e planejamento orçamentário. Interface com alternância entre tema claro e escuro, paleta em tons de rosa, lilás e azul petróleo.

2. Stack Tecnológica
Frontend: TypeScript + React
Estilização: Tailwind CSS (suporte a dark/light mode via CSS variables ou classes)
Backend/Banco de dados: Supabase (Postgres + Auth + Row Level Security)
Hospedagem: Coolify (self-hosted)
3. Modelo de Dados (Supabase)
3.1 categories
Campo	Tipo	Descrição
id	uuid	PK
user_id	uuid	FK auth.users
name	text	Nome da categoria
type	enum	expense | income
group	enum	fixed | variable
color	text	Cor associada (para gráficos)
icon	text	Ícone opcional
created_at	timestamptz	
3.2 transactions

Tabela principal, usada tanto para despesas quanto receitas.

Campo	Tipo	Descrição
id	uuid	PK
user_id	uuid	FK auth.users
category_id	uuid	FK categories
type	enum	expense | income
description	text	Descrição do lançamento
amount	numeric	Valor da parcela/lançamento
total_amount	numeric	Valor total (quando parcelado)
is_recurring	boolean	Recorrente ou não
recurrence_frequency	enum	monthly | weekly | yearly | none
is_installment	boolean	Se faz parte de um parcelamento
installment_group_id	uuid	Agrupa as parcelas de uma mesma compra
installment_number	int	Número da parcela atual (ex: 3)
installment_total	int	Total de parcelas (ex: 12)
due_date	date	Data de vencimento
paid_date	date	Data de pagamento (se pago)
status	enum	paid | pending | late | canceled
canceled_at	timestamptz	Data de cancelamento
created_at	timestamptz	
updated_at	timestamptz	

Regra de parcelamento: ao cadastrar uma compra com total_amount = 1500 e installment_total = 5, o sistema gera automaticamente 5 registros em transactions com amount = 300, um installment_group_id comum, installment_number de 1 a 5, e due_date incrementando conforme a frequência escolhida (padrão: mensal).

Regra de status late: calculado automaticamente (via trigger/função ou lógica no frontend) quando due_date < hoje e status = pending.

Cancelamento: ação que altera status para canceled e registra canceled_at, sem excluir o registro (mantém histórico). Se a transação faz parte de um installment_group_id, o usuário pode escolher cancelar apenas a parcela atual ou todas as parcelas futuras do grupo.

3.3 budget_plans (Planejamento)
Campo	Tipo	Descrição
id	uuid	PK
user_id	uuid	FK auth.users
period	date	Mês/ano de referência
category_group	enum	expenses | savings | leisure | emergency
planned_amount	numeric	Valor planejado para o grupo
created_at	timestamptz	

O valor "usado" de cada grupo é calculado dinamicamente somando as transactions do período vinculadas às categorias daquele grupo.

4. Páginas e Funcionalidades
4.1 Home / Dashboard
Saldo atual: soma de receitas pagas − soma de despesas pagas (todo o histórico ou período filtrado).
A pagar no mês: soma de transactions com status = pending ou late dentro do período selecionado.
Pago no mês: soma de transactions com status = paid dentro do período selecionado.
Filtro de período: seletor de mês/ano (ou range customizado), afetando todos os cards e listas da tela.
Lista de últimos lançamentos com status visual (cor por status: pago, pendente, atrasado, cancelado).
4.2 Lançamentos (Despesas/Receitas)
Formulário de cadastro com campos: descrição, categoria, tipo (despesa/receita), grupo (fixa/variável), recorrência (sim/não + frequência), valor, se é parcelado (valor total + nº de parcelas), data de vencimento.
Edição e cancelamento de lançamentos.
Marcar como pago (registra paid_date).
Listagem com filtros por status, categoria, tipo e período.
4.3 Categorias
CRUD de categorias, definindo tipo (despesa/receita) e grupo (fixa/variável).
Cor/ícone para identificação visual em gráficos.
4.4 Planejamento
Abas ou seções por grupo: Despesas, Poupança, Lazer, Emergência.
Definição de valor planejado por grupo/mês.
Comparativo visual (barra de progresso) entre planejado x realizado, similar ao padrão "Budget Used" de dashboards financeiros.
4.5 Configurações
Alternância de tema claro/escuro.
Seleção/preview da paleta de cores (rosa, lilás, azul petróleo).
5. Tema e Design System
Modo claro e escuro com toggle persistente (salvo em localStorage ou preferência do usuário no Supabase).
Paleta de cores:
Rosa (ex: 
#F472B6 / 
#EC4899)
Lilás (ex: 
#A78BFA / 
#C4B5FD)
Azul petróteo (ex: 
#0F4C5C / 
#134E5E)
Uso de CSS variables para permitir troca dinâmica de tema sem reload.
Inspiração de layout: cards arredondados, saldo em destaque no topo, gráficos de barra para gastos semanais/mensais, indicador circular de percentual de orçamento usado, lista de transações recentes com ícone por categoria.
6. Status de Transação — Fluxo
pending → paid       (usuário marca como pago)
pending → late        (automático, quando due_date < hoje)
late → paid            (usuário marca como pago)
pending/late → canceled (usuário cancela)
7. Segurança
Row Level Security (RLS) no Supabase: cada usuário só acessa seus próprios registros (user_id = auth.uid()).
Autenticação via Supabase Auth.
8. Próximos Passos Sugeridos
Definir se have suporte a múltiplas contas/carteiras (ex: conta corrente, cartão de crédito) desde já ou em versão futura.
Definir regra de recorrência: gerar transações futuras automaticamente (ex: próximos 12 meses) ou gerar sob demanda mês a mês.
Definir se o parcelamento permite valores não divisíveis igualmente (ex: 1500/7) com ajuste na última parcela.