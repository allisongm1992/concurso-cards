# XP + Níveis + Medalhas

## Resumo

Sistema de progressão com XP baseado em desempenho, níveis por faixas temáticas, e medalhas com tiers bronze/prata/ouro.

## Sistema de XP

### Ganhos

| Ação | XP |
|------|----|
| Card "Sabia" no estudo | 15 XP |
| Card "Não sabia" no estudo | 5 XP |
| Matching game completo | 50 XP base |
| Bônus acurácia matching (>80%) | +25 XP |
| Bônus acurácia matching (100%) | +50 XP |
| Manter streak diário | 20 XP |
| Desbloquear medalha | 30 XP |

### Cálculo de bônus no matching game

- accuracy = matches / attempts
- Se accuracy >= 1.0: +50 XP
- Se accuracy >= 0.8: +25 XP
- Senão: +0 XP
- Total matching: 50 + bônus

## Níveis por Faixas

| Faixa | Níveis | XP por nível | Nome |
|-------|--------|-------------|------|
| 1 | 1-5 | 200 XP | Iniciante |
| 2 | 6-10 | 400 XP | Estudante |
| 3 | 11-15 | 700 XP | Dedicado |
| 4 | 16-20 | 1000 XP | Aprovado |
| 5 | 21-25 | 1500 XP | Mestre |

### Cálculo de nível a partir do XP total

Faixa 1: níveis 1-5, cada um custa 200 XP → total faixa = 1000 XP
Faixa 2: níveis 6-10, cada um custa 400 XP → total faixa = 2000 XP
Faixa 3: níveis 11-15, cada um custa 700 XP → total faixa = 3500 XP
Faixa 4: níveis 16-20, cada um custa 1000 XP → total faixa = 5000 XP
Faixa 5: níveis 21-25, cada um custa 1500 XP → total faixa = 7500 XP

Total geral pra Nível 25: 19.000 XP

Algoritmo:
1. Subtrair XP acumulado de cada faixa sequencialmente
2. Nível = soma dos níveis completos + 1
3. XP restante na faixa atual = progresso pro próximo nível

## Medalhas (Tiers)

Cada medalha tem 3 tiers: bronze, silver, gold.

### Definição

| ID | Emoji | Nome | Bronze | Prata | Ouro |
|----|-------|------|--------|-------|------|
| reviewer | 📚 | Revisor | 50 cards revisados | 200 cards | 1000 cards |
| consistent | 🔥 | Consistente | 7 dias streak | 30 dias streak | 100 dias streak |
| accurate | 🎯 | Preciso | 80% acurácia (50+ cards) | 90% (100+ cards) | 95% (300+ cards) |
| matcher | 🃏 | Pareador | 10 matching games | 50 games | 200 games |
| creator | ✍️ | Criador | 1 deck criado | 5 decks | 15 decks |
| speedy | ⚡ | Veloz | Matching < 60s | < 45s | < 30s |
| studious | 📖 | Estudioso | 5 sessões estudo | 30 sessões | 100 sessões |
| veteran | 🏆 | Veterano | Nível 5 | Nível 10 | Nível 20 |
| freezer | 🧊 | Congelante | 1 freeze usado | 5 freezes | 20 freezes |
| diamond | 💎 | Diamante | 1000 XP | 5000 XP | 15000 XP |

### Check de desbloqueio

Após cada ação que pode afetar medalhas (review, game, streak update), checar todas as medalhas cujo tier atual é menor que gold. Se a condição for atendida, desbloquear o próximo tier e dar 30 XP.

### Dados necessários para check

- total_reviews (cards revisados)
- longest_streak (do user_streaks)
- accuracy (total_correct / total_reviews)
- games_played (matching games)
- decks_created (count de decks do usuário)
- fastest_game (menor tempo num matching game)
- study_sessions (sessões de estudo completas)
- current_level
- total_freezes_used
- total_xp

## Interface

### Header (XpBadge)

Ao lado do StreakBadge:
- "Lv.7" em cor da faixa + mini barra de progresso XP
- Tap abre a tela de perfil

Cores por faixa:
- Iniciante: slate/gray
- Estudante: blue
- Dedicado: purple
- Aprovado: amber/gold
- Mestre: emerald

### Tela de Perfil (ProfileScreen)

- Nome da faixa + nível atual
- Barra de XP grande (XP atual no nível / XP necessário)
- XP total acumulado
- Grid de medalhas 3x4 (ou scroll)
  - Coloridas com borda do tier (bronze/prata/ouro) = desbloqueadas
  - Cinza com cadeado = trancadas
  - Tap numa medalha mostra nome + requisito do próximo tier
- Estatísticas: total revisado, acurácia, jogos, decks criados
- Botão voltar

### Medal Unlock Toast (MedalUnlock)

Quando desbloqueia uma medalha:
- Toast no topo por 3 segundos
- Emoji + "Nova conquista! 📚 Revisor Bronze"
- Animação de entrada (slide down + fade)

## Dados

### Tabela user_progress

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users, unique |
| total_xp | integer | XP acumulado total |
| games_played | integer | Matching games jogados |
| study_sessions | integer | Sessões de estudo completas |
| total_reviews | integer | Cards revisados (study mode) |
| total_correct | integer | Cards marcados "sabia" |
| fastest_game | integer | Menor tempo em matching (segundos) |
| decks_created | integer | Decks criados pelo usuário |
| total_freezes_used | integer | Freezes usados total |
| created_at | timestamptz | Criação |

### Tabela user_medals

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| medal_id | text | ID da medalha (ex: 'reviewer') |
| tier | text | 'bronze', 'silver', 'gold' |
| unlocked_at | timestamptz | Quando desbloqueou |

Constraint unique: (user_id, medal_id, tier)

### RLS

- user_progress: usuário só vê/modifica seus próprios dados
- user_medals: usuário só vê/insere suas próprias medalhas

## Componentes

| Componente | Responsabilidade |
|------------|------------------|
| `src/lib/xp.ts` | Cálculos: XP→nível, faixa, progresso, cores |
| `src/lib/medals.ts` | Definição medalhas, check desbloqueio, award |
| `src/lib/progress.ts` | CRUD user_progress, adicionar XP, atualizar stats |
| `src/components/XpBadge.tsx` | Indicador compacto no header |
| `src/components/ProfileScreen.tsx` | Tela de perfil completa |
| `src/components/MedalUnlock.tsx` | Toast de conquista desbloqueada |
| `src/app/page.tsx` | Integração no fluxo |
| `xp-medals-schema.sql` | Migration SQL |

## Integração com fluxos existentes

### Após study mode (recordReview)
- Adicionar XP (15 ou 5)
- Incrementar total_reviews e total_correct
- Checar medalhas

### Após matching game (handleGameEnd)
- Adicionar XP (50 + bônus)
- Incrementar games_played
- Atualizar fastest_game se menor
- Checar medalhas

### Após streak update (recordDailyPlay)
- Adicionar 20 XP
- Checar medalha "Consistente" com longest_streak

### Após criar deck (handleSaveDeck)
- Incrementar decks_created
- Checar medalha "Criador"

### Após usar freeze (checkAndUpdateStreak)
- Incrementar total_freezes_used
- Checar medalha "Congelante"

## Não inclui (YAGNI)

- Leaderboard / ranking entre usuários
- Recompensas desbloqueáveis (temas, skins)
- XP decay (perder XP)
- Notificações de medalhas push
- Animações elaboradas de level up
