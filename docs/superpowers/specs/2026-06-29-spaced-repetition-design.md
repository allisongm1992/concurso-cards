# Spaced Repetition + Modo Estudo Rápido

## Resumo

Adicionar modo estudo rápido (tap to reveal) com algoritmo FSRS de spaced repetition, e uma Today View no topo do menu mostrando cards pendentes.

## Algoritmo FSRS

Cada card ganha parâmetros individuais:
- **stability** (S) — quanto tempo a memória dura (float, default 1.0)
- **difficulty** (D) — quão difícil é pra esse usuário (float, 0-1, default 0.5)
- **due_date** — quando precisa revisar (date)
- **last_review** — última vez que revisou (timestamptz)
- **rating** — 2 opções: "again" (não sabia) ou "good" (sabia)

### Fórmulas FSRS simplificadas

Após uma revisão com rating:

**Se "good" (sabia):**
- new_stability = old_stability * (1 + exp(decay) * factor * pow(old_stability, -0.5))
- difficulty diminui levemente: new_difficulty = max(0, old_difficulty - 0.1)
- due_date = today + ceil(new_stability) dias

**Se "again" (não sabia):**
- new_stability = max(0.5, old_stability * 0.5)
- difficulty aumenta: new_difficulty = min(1, old_difficulty + 0.2)
- due_date = today + 1 dia

**Valores iniciais (card nunca revisado):**
- stability = 1.0
- difficulty = 0.5
- due_date = null (aparece como pendente imediatamente)

**Parâmetros do modelo:**
- decay = -0.5
- factor = 0.9 (ajuste global de velocidade de espaçamento)

Estes valores padrão funcionam bem sem otimização por usuário. Podem ser tunados depois.

## Modo Estudo Rápido

### Fluxo

1. Card aparece com o **front** visível
2. Botão "Revelar" mostra o **back**
3. Dois botões: "Sabia ✅" ou "Não sabia ❌"
4. Próximo card automaticamente (transição suave)
5. A cada 20 cards: tela de resumo

### Tela de resumo (a cada 20 cards)

- "20/50 feitos"
- Acertos vs erros (ex: "14 ✅ • 6 ❌")
- Botão "Continuar" (se tem mais)
- Botão "Voltar pro menu"

### Seleção de cards

- "Estudar agora" (Today View): puxa cards de TODOS os decks onde due_date <= hoje, ordenados por due_date ASC (mais atrasados primeiro)
- "Revisar" (por deck): puxa cards daquele deck específico onde due_date <= hoje
- Cards nunca revisados (due_date = null) entram como pendentes
- Limite por sessão: 20 cards. Pode continuar depois.

## Today View (Dashboard)

### Localização

Bloco destacado no topo da tela de menu, acima da lista de decks.

### Conteúdo

**Se tem cards pendentes:**
- "📚 {N} cards pra revisar" + botão "Estudar agora"
- Cor de destaque para chamar atenção

**Se zerou os cards do dia:**
- "✅ Tudo em dia!" com tom de celebração
- Texto secundário: "Próxima revisão amanhã" ou similar

**Indicador por deck:**
- Cada deck na lista mostra badge com número de cards pendentes
- Botão "Revisar" ao lado do deck (se tem cards pendentes)

## Dados

### Nova tabela: card_reviews

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| card_id | uuid | FK → cards |
| user_id | uuid | FK → auth.users |
| rating | text | 'again' ou 'good' |
| reviewed_at | timestamptz | Quando revisou |

### Colunas adicionais em cards

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| stability | float | Default 1.0 |
| difficulty | float | Default 0.5 |
| due_date | date | Null = nunca revisado |
| last_review | timestamptz | Null = nunca revisado |

### RLS

- card_reviews: usuário só vê/insere suas próprias reviews
- Colunas em cards: update permitido apenas se o card pertence a um deck do usuário

## Componentes

| Componente | Responsabilidade |
|------------|------------------|
| `src/lib/fsrs.ts` | Algoritmo FSRS: calcular próxima revisão |
| `src/lib/reviews.ts` | CRUD de reviews + query "cards devidos hoje" |
| `src/components/StudyMode.tsx` | Tela de estudo rápido |
| `src/components/StudyProgress.tsx` | Resumo a cada 20 cards |
| `src/components/TodayView.tsx` | Bloco dashboard no topo do menu |
| `src/app/page.tsx` | Integração: TodayView + navegação pro StudyMode |
| `spaced-repetition-schema.sql` | Migration SQL |

## Integração com matching game

O matching game continua existindo como está. Ao completar um matching game, os cards daquele deck são marcados como revisados com rating "good" (consideramos que parear = saber).

## Não inclui (YAGNI)

- Otimização de parâmetros FSRS por usuário
- Mais de 2 ratings (sem "difícil" / "fácil")
- Estatísticas avançadas de retenção
- Notificações push de revisão
- Cards novos por dia (limite)
