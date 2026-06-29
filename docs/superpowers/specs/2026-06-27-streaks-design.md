# Sistema de Streaks

## Mecânica

- Jogar pelo menos 1 partida no dia = dia contado
- Streak incrementa a cada dia consecutivo
- 1 freeze por semana (pode pular 1 dia sem perder)
- Freeze recarrega toda segunda-feira

## Interface

- **Splash motivacional** ao abrir o app (2-3s ou tap pra fechar): "🔥 Dia 5! Continue assim!"
- **Indicador no header** "🔥 5" ao lado do status de sync
- Se o streak tá em risco (não jogou ainda hoje): indicador pulsa/muda cor

## Dados

Nova tabela `user_streaks`:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| current_streak | integer | Streak atual |
| longest_streak | integer | Recorde pessoal |
| last_played_date | date | Última data jogada |
| freeze_available | boolean | Se tem freeze disponível |
| freeze_used_at | timestamptz | Quando usou o freeze |
| created_at | timestamptz | Criação do registro |

## Lógica

### Ao completar uma partida:
1. Checa se `last_played_date` é hoje
2. Se não: incrementa `current_streak`, atualiza `last_played_date`
3. Se `current_streak > longest_streak`: atualiza recorde
4. Se já é hoje: nada muda

### Ao abrir o app:
1. Checa se ontem foi jogado (`last_played_date` = yesterday)
2. Se sim: streak continua normalmente
3. Se não e `freeze_available = true`: usa freeze, mantém streak, marca `freeze_used_at`
4. Se não e sem freeze: reseta `current_streak` pra 0

### Recarga do freeze:
- Freeze recarrega quando `freeze_used_at` é de uma semana anterior à semana atual (baseado em segunda-feira)
- Se nunca usou: `freeze_available = true`

## Mensagens Motivacionais

| Streak | Mensagem |
|--------|----------|
| 1 | "Primeiro passo! 🚀" |
| 3 | "Tá criando o hábito! 💪" |
| 7 | "Uma semana inteira! 🔥" |
| 14 | "Duas semanas! Imparável! ⚡" |
| 30 | "Um mês! Você é lenda! 🏆" |
| outros | "🔥 Dia {n}! Continue assim!" |

## Componentes Novos

- `StreakSplash.tsx` — tela motivacional ao abrir
- `StreakBadge.tsx` — indicador no header
- `src/lib/streaks.ts` — lógica de cálculo e sync
- SQL migration para tabela `user_streaks`
