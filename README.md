# Around the World in 80 Days — Space Mission 🎈🚀

*A Volta ao Mundo em 80 Dias — Missão Espacial*

Jogo web para o desafio **"Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars"** do NASA Space Apps Challenge 2026.

O jogador parte de Londres e tem 80 dias para viajar pela Terra, medir locais com instrumentos (satélite, radar, espectrômetro e laboratório de campo) e indicar o melhor análogo terrestre para três alvos: o Polo Sul lunar, um tubo de lava lunar e a Cratera Jezero, em Marte. O relatório final mostra a semelhança real, onde cada analogia falha e o que a Terra não consegue imitar.

Disponível em **inglês (padrão)** e **português**, com troca de idioma a qualquer momento.

## Como rodar

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm test         # testes (regras, traduções e interface)
npm run build    # versão de produção em dist/
```

## Estrutura

```
src/
  config.js      constantes de balanceamento
  core/          regras do jogo como funções puras (sem DOM e sem textos)
  data/          locais, alvos, instrumentos e eventos (apenas dados)
  i18n/          dicionários en.js e pt.js + função t()
  ui/            componentes de interface (mapa SVG, painel, telas)
  styles/        CSS
tests/           testes com Vitest
```

Para adicionar um idioma, crie `src/i18n/<id>.js` com as mesmas chaves de `en.js` e registre-o em `src/i18n/index.js`. Um teste garante que todos os dicionários têm as mesmas chaves.

## Aviso sobre os dados

Os índices de cada local (0–100 por dimensão) são **estimativas didáticas** escritas à mão, inspiradas na literatura de análogos planetários. Não são medições oficiais nem derivam diretamente de conjuntos de dados da NASA.
