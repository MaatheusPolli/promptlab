# 🧩 PromptLab — Playground de Engenharia de Prompt (v1.3.0)

> Crie, teste, compare e otimize prompts para o Gemini Nano — com métricas, testes A/B e uma biblioteca pessoal. Tudo offline.

![PromptLab Banner](./linkedin_banner.svg)

![Chrome AI](https://img.shields.io/badge/Chrome%20Built--in%20AI-Gemini%20Nano-blue)
![Offline](https://img.shields.io/badge/Processamento-100%25%20Offline-green)
![Versão](https://img.shields.io/badge/Versão-1.3.0-orange)
![Licença](https://img.shields.io/badge/Licença-MIT-yellow)

---

## 🧠 Sobre

**PromptLab** é uma bancada de trabalho offline para engenharia de prompt construída sobre a **IA integrada do Chrome (Gemini Nano)**.  
Ele oferece aos desenvolvedores um ambiente estruturado para escrever, testar, comparar e refinar prompts — com métricas reais, testes A/B lado a lado e uma biblioteca persistente de seus melhores prompts.

Pense nele como uma IDE local para engenharia de prompt: sem nuvem, sem custo por token, sem dependência de fornecedor.

---

## 🚀 Funcionalidades (v1.3.0)

- **Editor de Prompt Moderno** — Escreva e execute prompts com suporte a atalhos (`Ctrl+Enter`) e UI refinada.
- **Sistema de Templating** — Utilize variáveis dinâmicas como `{{texto}}` com geração automática de formulários.
- **Batch Testing (Execução em Lote)** — Processe listas de dados automaticamente, com suporte a CSV e múltiplas variáveis.
- **Testes A/B com Diff Visual** — Compare dois prompts simultaneamente com destaque de diferenças no texto.
- **Auto-Avaliação Resiliente** — O Gemini Nano avalia a qualidade de sua própria resposta, com fallback técnico inteligente caso a IA atinja limites de cota.
- **Modais Customizados** — Experiência de confirmação integrada ao design do app (substituindo diálogos nativos).
- **Controle de Parâmetros** — Ajuste Temperatura e Top-K em tempo real com feedback instantâneo no console.
- **Métricas Avançadas** — Latência, estimativa de tokens, consistência e notas de qualidade.
- **Biblioteca de Prompts** — Salve, adicione tags e pesquise prompts via IndexedDB.
- **Persistência e Exportação** — Tudo salvo localmente; exporte para JSON ou Markdown a qualquer momento.

---

## 📊 Métricas Rastreadas por Execução

| Métrica | Descrição |
|---------|-----------|
| **Latência** | Milissegundos desde a requisição até a conclusão. |
| **Tokens** | Contagem aproximada de tokens de entrada + saída. |
| **Estabilidade** | Similaridade entre execuções repetidas (via Teste de Consistência). |
| **Auto-Avaliação** | Nota qualitativa gerada pela IA ou via Heurística Técnica (1–10). |

---

## 📋 Pré-requisitos

**Google Chrome 127+** ou **Chrome Canary** com as flags de IA experimental ativadas.

### Ativar Flags do Chrome

| Flag | URL | Valor |
|------|-----|-------|
| Gemini Nano | `chrome://flags/#prompt-api-for-gemini-nano` | Ativado |
| Translation API | `chrome://flags/#translation-api` | Ativado |
| Language Detector | `chrome://flags/#language-detector-api` | Ativado |
| On-device Model | `chrome://flags/#optimization-guide-on-device-model` | Enabled BypassPrefRequirement |

---

## 🛠️ Stack Tecnológica

| Tecnologia | Papel |
|-----------|------|
| Vanilla JavaScript (ES6+) | Lógica da aplicação |
| Chrome LanguageModel API | Execução de prompt e auto-avaliação |
| IndexedDB | Persistência local robusta |
| CSS3 Moderno | Layout com Blur, Glow e Responsive Design |
| Prism.js | Realce de sintaxe na saída |

---

## 📦 Instalação Rápida

```bash
# 1. Clone o repositório
git clone https://github.com/matheus-polli/promptlab.git
cd promptlab

# 2. Instale as dependências
npm install

# 3. Inicie o servidor
npm start
```

---

## 🔒 Privacidade e Segurança

Todos os prompts, saídas e métricas são armazenados localmente via IndexedDB.  
**Nada sai do seu navegador.** Ideal para testes com dados sensíveis que não podem subir para a nuvem.

---

Criado por **Matheus Gasparotto Polli** — 2026

---

## 📄 Licença

MIT © 2026 Matheus Gasparotto Polli
