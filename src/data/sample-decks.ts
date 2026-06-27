export interface CardPair {
  front: string
  back: string
}

export interface DeckData {
  title: string
  subject: string
  description: string
  cards: CardPair[]
}

export const sampleDecks: DeckData[] = [
  {
    title: 'Princípios Fundamentais',
    subject: 'Direito Constitucional',
    description: 'Art. 1º ao 4º da CF/88',
    cards: [
      { front: 'Fundamentos da República (Art. 1º)', back: 'SO-CI-DI-VA-PLU: Soberania, Cidadania, Dignidade, Valores do trabalho, Pluralismo político' },
      { front: 'Poderes da União (Art. 2º)', back: 'Legislativo, Executivo e Judiciário — independentes e harmônicos' },
      { front: 'Objetivos fundamentais (Art. 3º)', back: 'CON-GA-ER-PRO: Construir sociedade livre, Garantir desenvolvimento, Erradicar pobreza, Promover bem de todos' },
      { front: 'Forma de Estado', back: 'Federação (união indissolúvel de Estados, Municípios e DF)' },
      { front: 'Forma de Governo', back: 'República' },
      { front: 'Sistema de Governo', back: 'Presidencialismo' },
      { front: 'Regime de Governo', back: 'Democracia (Estado Democrático de Direito)' },
      { front: 'Todo poder emana...', back: '...do povo, que o exerce por representantes eleitos ou diretamente (Art. 1º, §único)' },
    ],
  },
  {
    title: 'Princípios da Administração Pública',
    subject: 'Direito Administrativo',
    description: 'LIMPE e outros princípios',
    cards: [
      { front: 'LIMPE', back: 'Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiência' },
      { front: 'Princípio da Legalidade (Admin.)', back: 'Administração só pode fazer o que a LEI permite' },
      { front: 'Princípio da Legalidade (Particular)', back: 'Particular pode fazer tudo que a lei NÃO proíbe' },
      { front: 'Princípio da Impessoalidade', back: 'Agir sem favoritismo ou perseguição; atos são do órgão, não da pessoa' },
      { front: 'Princípio da Publicidade', back: 'Transparência dos atos administrativos como regra geral' },
      { front: 'Princípio da Eficiência', back: 'Adicionado pela EC 19/98 — buscar melhores resultados com menor custo' },
      { front: 'Princípio da Supremacia do Interesse Público', back: 'Interesse público prevalece sobre o particular' },
      { front: 'Princípio da Autotutela', back: 'Administração pode anular (ilegais) ou revogar (inconvenientes) seus próprios atos' },
    ],
  },
  {
    title: 'Figuras de Linguagem',
    subject: 'Português',
    description: 'Principais figuras cobradas em concurso',
    cards: [
      { front: 'Metáfora', back: 'Comparação implícita (sem "como"): "Ele é um touro"' },
      { front: 'Metonímia', back: 'Substituição por relação de proximidade: "Leu Machado de Assis" (= obra dele)' },
      { front: 'Hipérbole', back: 'Exagero intencional: "Já falei mil vezes"' },
      { front: 'Eufemismo', back: 'Suavizar ideia desagradável: "Ele passou desta para melhor"' },
      { front: 'Antítese', back: 'Oposição de ideias: "O amor é fogo e gelo"' },
      { front: 'Paradoxo (Oxímoro)', back: 'Ideias contraditórias na mesma frase: "silêncio ensurdecedor"' },
      { front: 'Pleonasmo', back: 'Redundância para ênfase: "Vi com meus próprios olhos"' },
      { front: 'Catacrese', back: 'Metáfora cristalizada pelo uso: "pé da mesa", "braço da cadeira"' },
    ],
  },
]
