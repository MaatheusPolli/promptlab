# 🗺️ Roadmap Estratégico — PromptLab

Este documento descreve a visão de evolução do PromptLab, dividida em três horizontes de maturidade, focando em qualidade técnica, experiência do usuário (UX) e escalabilidade arquitetural.

---

## 🌅 Horizonte 1: Quick Wins (0 a 2 semanas)
*Foco: Polimento, estabilidade e ganhos imediatos de UX sem alterações estruturais.*

| Melhoria | Impacto Esperado | Esforço | Riscos/Dependências |
| :--- | :--- | :--- | :--- |
| **Highlight de Sintaxe na Saída** | Melhora a legibilidade de códigos gerados pelo Gemini (Markdown/JSON) usando Prism.js. | P | ✅ Concluído (09/03/2026) |
| **Autocomplete de Tags** | Facilita a organização da biblioteca evitando duplicidade de tags (ex: 'IA' vs 'ia'). | P | ✅ Concluído (09/03/2026) |
| **Exportação Individual** | Permite baixar um único prompt em JSON/Markdown para compartilhamento rápido. | P | ✅ Concluído (09/03/2026) |
| **Validação de Tokenizer WASM** | Substituir `length / 4` por um tokenizer real (ex: Tiktoken via WASM) para métricas precisas. | M | ✅ Concluído (09/03/2026) - Estimador via Regex |

---

## 🚀 Horizonte 2: Evolução (1 a 3 meses)
*Foco: Funcionalidades avançadas de engenharia e redução de débito técnico.*

| Melhoria | Impacto Esperado | Esforço | Riscos/Dependências |
| :--- | :--- | :--- | :--- |
| **Sistema de Variáveis (Templating)** | Permite criar prompts como `Traduza {{texto}} para {{idioma}}` com formulário dinâmico de entrada. | M | ✅ Concluído (09/03/2026) |
| **Batch Testing (Execução em Lote)** | Roda um prompt contra uma lista de N entradas para validar consistência em escala. | M | ✅ Concluído (09/03/2026) |
| **Refatoração para Event Bus** | Desacoplar View e Controller usando um barramento de eventos, facilitando a manutenção. | M | ✅ Concluído (09/03/2026) |
| **Persistência de Sessão A/B** | Salva os experimentos A/B no IndexedDB para consulta posterior (hoje são voláteis). | M | ✅ Concluído (09/03/2026) |

---

## 🌌 Horizonte 3: Visão (3 a 12 meses)
*Foco: Expansão de mercado, arquitetura escalável e ecossistema.*

| Melhoria | Impacto Esperado | Esforço | Riscos/Dependências |
| :--- | :--- | :--- | :--- |
| **Prompt Chaining (Workflows)** | Interface visual (nós) para encadear prompts (Saída de A -> Entrada de B). | G | 📌 Adiado: Alta complexidade de UI e gerenciamento de estado. |
| **Multi-Model Proxy** | Comparar Gemini Nano (local) com modelos em nuvem (GPT-4, Claude) via API Keys do usuário. | G | 📌 Adiado: Gerenciamento de segredos (API Keys) e CORS. |
| **Extensão para Browser** | Transformar o PromptLab em uma extensão que injeta o Gemini Nano em qualquer site. | G | 📌 Adiado: Limitações de permissões da Chrome Web Store. |
| **Plataforma de Benchmarking** | Criar um "Leaderboard" de prompts eficientes para o Gemini Nano (comunidade open-source). | G | 📌 Adiado: Necessidade de infraestrutura de backend para sync. |

---

## 🗒️ Log de Sessão (09/03/2026)
- **Infraestrutura:** Implementado `EventBus` para desacoplamento; Adicionada licença MIT 2025.
- **Resiliência:** Implementada lógica de 2 retries com fallback neutro no `AIService`.
- **Editor:** Sistema de Templating (`{{var}}`); Suporte a **Batch Testing** via CSV com barra de progresso.
- **Métricas:** Tokenizer baseado em Regex; Syntax Highlighting com Prism.js na saída.
- **Dados:** Persistência de testes A/B no IndexedDB; Exportação individual (JSON/MD) e de biblioteca; Autocomplete de tags.
- **Social:** Gerado post para LinkedIn em `LINKEDIN_POST.md` e removido post antigo.

---

## 🛠️ Notas de Implementação
- **Privacidade:** Todas as evoluções mantêm o dogma "Offline First".
- **Experimentalismo:** Arquitetura isolada no `AIService` para futuras trocas de backend.
