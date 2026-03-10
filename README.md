# 🧩 PromptLab — Playground de Engenharia de Prompt

> Crie, teste, compare e otimize prompts para o Gemini Nano — com métricas, testes A/B e uma biblioteca pessoal. Tudo offline.

![Chrome AI](https://img.shields.io/badge/Chrome%20Built--in%20AI-Gemini%20Nano-blue)
![Offline](https://img.shields.io/badge/Processamento-100%25%20Offline-green)
![Para](https://img.shields.io/badge/Para-Engenheiros%20de%20IA%20%26%20Desenvolvedores-purple)
![Licença](https://img.shields.io/badge/Licença-MIT-yellow)

---

## 🧠 Sobre

**PromptLab** é uma bancada de trabalho offline para engenharia de prompt construída sobre a **IA integrada do Chrome (Gemini Nano)**.  
Ele oferece aos desenvolvedores um ambiente estruturado para escrever, testar, comparar e refinar prompts — com métricas reais, testes A/B lado a lado e uma biblioteca persistente de seus melhores prompts.

Pense nele como uma IDE local para engenharia de prompt: sem nuvem, sem custo por token, sem dependência de fornecedor.

---

## 🚀 Funcionalidades

- **Editor de Prompt ao Vivo** — escreva e execute prompts instantaneamente com o Gemini Nano
- **Testes A/B** — execute dois prompts simultaneamente e compare os resultados lado a lado
- **Resiliência Nativa** — Sistema automático de 2 retries com fallback em caso de falha do modelo
- **Controle de Parâmetros** — ajuste Temperatura e Top-K em tempo real por prompt
- **Métricas de Resposta** — rastreia tempo de resposta, contagem estimada de tokens e pontuação de consistência
- **Modo de Auto-Avaliação** — o Gemini Nano avalia a qualidade de sua própria resposta (meta-IA)
- **Biblioteca de Prompts** — salve, adicione tags, pesquise e organize prompts via IndexedDB
- **Autocomplete de Tags** — sugestões inteligentes ao buscar na biblioteca
- **Diff de Prompt** — comparação visual entre as saídas de dois prompts
- **Exportação** — exporte sua biblioteca completa ou prompts individuais em JSON e Markdown
- **Syntax Highlighting** — Visualização clara de códigos gerados (Markdown/JSON) com Prism.js

---

## 📊 Métricas Rastreadas por Execução

| Métrica | Descrição |
|---------|-----------|
| **Tempo de Resposta** | Milissegundos desde a requisição até a conclusão |
| **Estimativa de Tokens** | Contagem aproximada de tokens de entrada + saída |
| **Score de Consistência** | Similaridade entre execuções repetidas do mesmo prompt |
| **Score de Auto-Avaliação** | Avaliação da própria IA sobre sua resposta (1–10) |
| **Resiliência (Retries)** | Quantas tentativas foram necessárias para obter sucesso? |

---

## 🧪 Casos de Uso

- Desenvolvimento de system prompts para seus próprios produtos baseados em IA
- Teste de como pequenas mudanças de parâmetros afetam a qualidade da saída
- Construção de uma biblioteca reutilizável de padrões de prompt para sua equipe
- Entendimento das forças, limitações e peculiaridades do Gemini Nano
- Ensino de conceitos de engenharia de prompt com exemplos vivos e reproduzíveis

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

Reinicie o Chrome após ativar. Na primeira execução, o Gemini Nano (~1.5GB) é baixado automaticamente.

---

## 🛠️ Stack Tecnológica

| Tecnologia | Papel |
|-----------|------|
| Vanilla JavaScript (ES6+) | Lógica da aplicação |
| Chrome LanguageModel API | Execução de prompt e auto-avaliação |
| IndexedDB | Biblioteca persistente de prompts e histórico de execuções |
| Canvas API | Gráficos de métricas e visualização de consistência |
| Prism.js | Realce de sintaxe na saída e no editor |
| http-server | Servidor de desenvolvimento local |

---

## 📦 Primeiros Passos

```bash
# 1. Clone o repositório
git clone https://github.com/matheus-polli/promptlab.git
cd promptlab

# 2. Instale as dependências
npm install

# 3. Inicie o servidor
npm start

# 4. Abra no Chrome
# http://localhost:8080
```

---

## 🛡️ Testes e Garantia de Qualidade

O PromptLab possui uma suíte de testes integrada (Test Switch) que permite verificar a integridade do sistema, simular a IA e validar a lógica de cálculo.

### Como Executar os Testes

1. Inicie o servidor normalmente (`npm start`).
2. Adicione o parâmetro `?test=true` à URL.
   - Exemplo: `http://localhost:8080/?test=true`
3. A suíte de testes será executada automaticamente no carregamento.
4. Um painel flutuante exibirá o status (PASS/FAIL) e os detalhes serão logados no Console do navegador (`F12`).

### O que é testado?
- **Mock de IA:** Simula respostas bem-sucedidas, falhas e retornos JSON para auto-avaliação sem carregar o modelo real.
- **MetricsService:** Valida precisão matemática da estimativa de tokens, diff de texto e cálculo de consistência (Jaccard).
- **StorageService:** Verifica operações CRUD (Create, Read, Delete) no IndexedDB.
- **Robustez:** Testa entradas nulas, textos vazios e caracteres especiais.

---

## ⚠️ Cenários e Solução de Problemas

Abaixo estão os cenários de comportamento mapeados e como o sistema reage:

| Cenário | Comportamento Esperado | Solução / Ação |
|---------|------------------------|----------------|
| **Navegador Incompatível** | Tela de aviso "Requisitos Não Atendidos" com lista de erros. | Use Chrome Canary e ative as flags listadas. |
| **Modelo Baixando** | O Chrome pode demorar na primeira execução (~1.5GB). | Aguarde e observe o log "Download Progress" no console. |
| **Prompt Vazio** | O botão de execução não dispara ação. | Preencha o campo "User Prompt". |
| **Auto-Avaliação Falha** | Se a IA não retornar JSON válido, exibe erro. | Tente novamente (a temperatura é baixada automaticamente para 0.1 para estabilidade). |
| **Diff Confuso** | Se os textos forem totalmente diferentes, o diff marca tudo como removido/adicionado. | O diff é otimizado para variações de prompt, não textos aleatórios. |
| **Limpar Dados** | Deseja resetar a biblioteca? | Abra DevTools -> Application -> Storage -> IndexedDB -> Delete 'PromptLabDB'. |

---

## 📂 Estrutura do Projeto

```
promptlab/
├── index.html
├── index.js                        # Ponto de entrada da aplicação
├── style.css
├── controllers/
│   ├── editorController.js         # Eventos do editor, execução e exportação
│   ├── abTestController.js         # Gerenciamento de sessões de teste A/B
│   └── libraryController.js        # CRUD e autocomplete da biblioteca
├── services/
│   ├── aiService.js                # Executor do Gemini Nano com retries e fallback
│   ├── metricsService.js           # Tempo de resposta, tokens e consistência
│   ├── selfEvalService.js          # Prompts de auto-avaliação (Meta-IA)
│   └── storageService.js           # IndexedDB para prompts e histórico
├── views/
│   ├── editorView.js               # Editor, saída formatada e Prism.js
│   ├── abTestView.js               # Comparação A/B lado a lado
│   ├── metricsView.js              # Gráficos de métricas e tabela de execuções
│   └── libraryView.js              # Busca e navegação com tags
└── tests/                          # Suíte de testes automatizados
    └── testRunner.js               # Executor e mocks de teste
```

---

## 💡 Guia de Engenharia de Prompt Integrado

O app inclui um painel de referência interativo cobrindo:

- Zero-shot vs few-shot prompting
- Chain-of-thought e raciocínio passo a passo
- Técnicas de atribuição de papel (role) e persona
- Controle de formato de saída (JSON, listas, texto estruturado)
- Gerenciamento de janela de contexto para o Gemini Nano

---

## 🔒 Privacidade

Todos os prompts, saídas e métricas são armazenados localmente via IndexedDB.  
Nada sai do seu navegador. Jamais.

---

Matheus Gasparotto Polli

---

## 📄 Licença

MIT © 2026 Matheus Gasparotto Polli
