import { craseCards } from './cards-crase'
import { regenciaCards } from './cards-regencia'
import { concordanciaCards } from './cards-concordancia'
import { pontuacaoCards } from './cards-pontuacao'
import { colocacaoCards } from './cards-colocacao'
import { nr1Cards } from './cards-nr1'
import { nr3Cards } from './cards-nr3'
import { nr4Cards } from './cards-nr4'
import { nr5Cards } from './cards-nr5'
import { nr6Cards } from './cards-nr6'
import { nr9Cards } from './cards-nr9'
import { nr10Cards } from './cards-nr10'
import { nr11Cards } from './cards-nr11'
import { nr12Cards } from './cards-nr12'
import { nr15Cards } from './cards-nr15'
import { nr16Cards } from './cards-nr16'
import { nr17Cards } from './cards-nr17'
import { nr18Cards } from './cards-nr18'
import { nr19Cards } from './cards-nr19'
import { nr20Cards } from './cards-nr20'
import { nr22Cards } from './cards-nr22'
import { nr24Cards } from './cards-nr24'
import { nr25Cards } from './cards-nr25'
import { nr26Cards } from './cards-nr26'
import { nr28Cards } from './cards-nr28'
import { nr29Cards } from './cards-nr29'
import { nr31Cards } from './cards-nr31'
import { nr32Cards } from './cards-nr32'
import { nr33Cards } from './cards-nr33'
import { nr35Cards } from './cards-nr35'
import { nr36Cards } from './cards-nr36'
import { nr37Cards } from './cards-nr37'
import { nr38Cards } from './cards-nr38'

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
  // Português
  { title: 'Crase', subject: 'Português', description: 'Regras, exceções e pegadinhas de banca', cards: craseCards },
  { title: 'Regência Verbal e Nominal', subject: 'Português', description: 'Verbos e nomes mais cobrados', cards: regenciaCards },
  { title: 'Concordância Verbal e Nominal', subject: 'Português', description: 'Sujeito composto, partícula SE, casos especiais', cards: concordanciaCards },
  { title: 'Pontuação', subject: 'Português', description: 'Vírgula, ponto e vírgula, dois-pontos, travessão', cards: pontuacaoCards },
  { title: 'Colocação Pronominal', subject: 'Português', description: 'Próclise, mesóclise, ênclise', cards: colocacaoCards },
  // NRs - Segurança do Trabalho
  { title: 'NR 1 — Disposições Gerais e GRO', subject: 'Segurança do Trabalho', description: 'PGR, inventário de riscos, campo de aplicação', cards: nr1Cards },
  { title: 'NR 3 — Embargo e Interdição', subject: 'Segurança do Trabalho', description: 'Risco grave e iminente, procedimentos', cards: nr3Cards },
  { title: 'NR 4 — SESMT', subject: 'Segurança do Trabalho', description: 'Dimensionamento, profissionais, grau de risco', cards: nr4Cards },
  { title: 'NR 5 — CIPA', subject: 'Segurança do Trabalho', description: 'Composição, eleição, mandato, estabilidade', cards: nr5Cards },
  { title: 'NR 6 — EPI', subject: 'Segurança do Trabalho', description: 'CA, obrigações, hierarquia de medidas', cards: nr6Cards },
  { title: 'NR 9 — Agentes Físicos/Químicos/Biológicos', subject: 'Segurança do Trabalho', description: 'Higiene ocupacional, avaliação, controle', cards: nr9Cards },
  { title: 'NR 10 — Eletricidade', subject: 'Segurança do Trabalho', description: 'Zonas de risco, habilitação, desenergização', cards: nr10Cards },
  { title: 'NR 11 — Transporte e Movimentação', subject: 'Segurança do Trabalho', description: 'Elevadores, empilhadeiras, armazenagem', cards: nr11Cards },
  { title: 'NR 12 — Máquinas e Equipamentos', subject: 'Segurança do Trabalho', description: 'Proteções, dispositivos de segurança, capacitação', cards: nr12Cards },
  { title: 'NR 15 — Insalubridade', subject: 'Segurança do Trabalho', description: 'Graus, limites de tolerância, anexos', cards: nr15Cards },
  { title: 'NR 16 — Periculosidade', subject: 'Segurança do Trabalho', description: 'Adicional 30%, atividades perigosas', cards: nr16Cards },
  { title: 'NR 17 — Ergonomia', subject: 'Segurança do Trabalho', description: 'AET, AEP, organização do trabalho', cards: nr17Cards },
  { title: 'NR 18 — Construção Civil', subject: 'Segurança do Trabalho', description: 'PGR na construção, quedas, andaimes', cards: nr18Cards },
  { title: 'NR 19 — Explosivos', subject: 'Segurança do Trabalho', description: 'Fabricação, armazenamento, transporte', cards: nr19Cards },
  { title: 'NR 20 — Inflamáveis e Combustíveis', subject: 'Segurança do Trabalho', description: 'Ponto de fulgor, classificação, capacitação', cards: nr20Cards },
  { title: 'NR 22 — Mineração', subject: 'Segurança do Trabalho', description: 'CIPAMIN, ventilação, plano de fogo', cards: nr22Cards },
  { title: 'NR 24 — Condições Sanitárias', subject: 'Segurança do Trabalho', description: 'Instalações sanitárias, vestiários, refeitórios', cards: nr24Cards },
  { title: 'NR 25 — Resíduos Industriais', subject: 'Segurança do Trabalho', description: 'Gerenciamento, classificação, tratamento', cards: nr25Cards },
  { title: 'NR 26 — Sinalização', subject: 'Segurança do Trabalho', description: 'Cores de segurança, GHS, FDS, rotulagem', cards: nr26Cards },
  { title: 'NR 28 — Fiscalização e Penalidades', subject: 'Segurança do Trabalho', description: 'Infrações, multas, dupla visita, gradação', cards: nr28Cards },
  { title: 'NR 29 — Trabalho Portuário', subject: 'Segurança do Trabalho', description: 'OGMO, operações portuárias, SESSTP', cards: nr29Cards },
  { title: 'NR 31 — Agricultura', subject: 'Segurança do Trabalho', description: 'CIPATR, agrotóxicos, transporte rural', cards: nr31Cards },
  { title: 'NR 32 — Serviços de Saúde', subject: 'Segurança do Trabalho', description: 'Risco biológico, perfurocortantes, vacinação', cards: nr32Cards },
  { title: 'NR 33 — Espaços Confinados', subject: 'Segurança do Trabalho', description: 'PET, vigia, supervisor, atmosferas IPVS', cards: nr33Cards },
  { title: 'NR 35 — Trabalho em Altura', subject: 'Segurança do Trabalho', description: 'Acima de 2m, ancoragem, trava-queda, PET', cards: nr35Cards },
  { title: 'NR 36 — Abate e Carnes', subject: 'Segurança do Trabalho', description: 'Pausas, rodízio, conforto térmico', cards: nr36Cards },
  { title: 'NR 37 — Plataformas de Petróleo', subject: 'Segurança do Trabalho', description: 'DIM, CIPLAT, heliponto, permissão de trabalho', cards: nr37Cards },
  { title: 'NR 38 — Limpeza Urbana', subject: 'Segurança do Trabalho', description: 'Coleta, varrição, poda, riscos de trânsito', cards: nr38Cards },
]
