# Aplicação de gestão de ativos

## 1. Como executar o projeto

### Requisitos

- NodeJs v24.11.1
- Docker
- PostgreSQL (docker compose disponibilizado no projeto)

**Instalando as dependências**

É importante que neste passo o docker esteja rodando (caso a database e o schema não estejam sendo criados na base, tente rodar o seguinte comando "docker compose down -v" e depois "docker compose up -d")

```bash
  $ docker compose up -d
```

Após subir o container no docker só precisa rodar este comando que instalara as dependências e populara o banco de dados com os dados iniciais

```bash
  $ npm run install:all
```

**Rodando localmente**

Pode-se rodar a aplicação utilizando 3 terminais cada um rodando um dos sistemas

```bash
  $ npm run start:gestao-ativos-frontend
```

```bash
  $ npm run start:gestao-ativos-backend
```

```bash
  $ npm run start:quotation-service
```

ou (não recomendo muito pois causou algumas instabilidades)

```bash
  $ npm run start:all
```

**Acessando o frontend**

1.  Acesse a url: http://localhost:3000
2.  Você sera redirecionado para o login para logar basta usar o email "joao@teste.com" e a senha "12345678"

**Executar testes unitários backend**

```bash
  $ cd ./gestao-ativos-backend
  $ npm run test:cov
```

**(Não foi feito) Executar testes E2E backend**
Por conta de ter surgido um bug que eu não tinha pensado que poderia ocorrer acabei não tendo de tempo de fazer.


# 2. Tratamento de concorrência

Para lidar com o cenário de ordens simultâneas especialmente o clássico problema de duplicação por "double-click" do usuário ou retentativas automáticas de rede, optei por implementar o padrão de Chaves de Idempotência (Idempotency Keys).

A Solução Implementada:
Adicionei uma coluna idempotency_key com restrição de unicidade (UNIQUE CONSTRAINT) na tabela de ordens. A mecânica funciona da seguinte forma:

O client-side (frontend) gera um identificador único (UUID) no momento em que o usuário tenta enviar a ordem e o anexa ao cabeçalho da requisição (Idempotency-Key).

Quando o backend recebe a requisição, ele tenta persistir a ordem atrelando essa chave ao registro.

Se duas requisições idênticas chegarem ao banco de dados exatamente ao mesmo tempo, a primeira transação efetiva a inserção, enquanto a segunda é rejeitada na camada do banco de dados por violação de unicidade. O backend intercepta essa falha e pode ignorar a segunda ordem com segurança, evitando a duplicidade do processamento e do débito de saldo.

Trade-offs da Solução:

Vantagens (Prós):

Simplicidade e Performance: Não exige infraestrutura adicional (como Redis para controle de Distributed Locks). O controle de concorrência é delegado às propriedades ACID do próprio banco de dados relacional.

Garantia na Borda: Resolve o problema de retentativas de rede (quando o front não recebe o timeout e tenta de novo), garantindo que a intenção do usuário seja processada exatamente uma vez (Exactly-once semantics).

Baixa latência: A checagem de unicidade em um índice do banco é extremamente rápida.

Desvantagens e Pontos de Atenção (Contras):

Dependência do Client: A solução confia que o frontend gerará o UUID corretamente por intenção de clique. Se o cliente for malicioso ou mal implementado (gerando uma chave nova a cada requisição automática), a proteção é contornada.

Não resolve concorrência de saldo: A chave de idempotência evita a criação de ordens duplicadas do mesmo usuário. No entanto, para evitar que uma mesma ordem concorra com outra diferente estourando o saldo limite da conta, essa estratégia precisa atuar em conjunto com Transações de Banco de Dados (usando Pessimistic Locking como SELECT ... FOR UPDATE nos saldos, ou Optimistic Locking com controle de versão) durante o processamento (Worker).

Essa abordagem foi escolhida por entregar o maior valor de proteção para a experiência do usuário com a menor complexidade arquitetural no momento de criação da ordem.

# 3. Tratamento de falhas

Para garantir a resiliência do sistema e a segurança financeira das operações, a arquitetura foi desenhada para degradar graciosamente em caso de falhas, dividindo o tratamento em dois cenários principais: falhas parciais e falhas totais do serviço de cotações.

O que acontece quando o serviço de cotações falha?

A rotina de atualização de preços (AtualizarCotacaoWorker) foi construída com um mecanismo de isolamento de falhas:

Falha Parcial (Isolamento com Promise.allSettled): Se a cotação de um ativo específico (ex: ITUB4) falhar, mas a de outro (ex: BTC) retornar com sucesso, o uso do Promise.allSettled garante que a falha de um não quebre a atualização do outro. O sistema apenas registrará um erro isolado no log para o ativo problemático e continuará atualizando o restante do mercado normalmente.

Falha Total (Queda do Serviço Externo): Caso a fonte primária de cotações caia por completo, a exceção é capturada pelo bloco try/catch global do Worker. O serviço não "crasha" (não derruba a aplicação). Em vez disso, ele registra a falha crítica no log e encerra o ciclo. Graças ao decorador @Interval(5000), o próprio Worker atua como um mecanismo natural de Retry contínuo (polling), tentando buscar os preços novamente 5 segundos depois.

O que acontece com a ordem do cliente?

A integridade da ordem do cliente é a prioridade máxima. Se o serviço de cotações falhar:

Proteção contra preços defasados: As cotações no banco de dados ficarão "congeladas" no último valor válido conhecido.

# 4. Sugestões ao fornecedor — melhorias que você solicitaria ao serviço de cotações externo

1. Implementação de WebSockets ou Webhooks (Streaming)
   Melhoria: Substituir ou complementar o modelo de Polling (HTTP GET) por uma conexão persistente via WebSocket.

Justificativa: No modelo atual, o backend precisa "perguntar" o preço a cada 5 segundos. Com WebSockets, o fornecedor faria o push da cotação apenas quando houver mudança de preço. Isso reduz o tráfego de rede desnecessário, diminui a carga no nosso backend e permite que o usuário veja a mudança de preço em milissegundos (Real-time de baixa latência).

2. Suporte a Busca em Lote (Batch Requests) Otimizada
   Melhoria: Permitir que o endpoint de cotações aceite filtros específicos via Query Params (ex: ?symbols=ITUB4,BTC,ETH).

Justificativa: Atualmente, o serviço retorna todos os ativos disponíveis. À medida que o mercado cresce para milhares de ativos, baixar o payload completo torna-se ineficiente. Filtrar apenas os ativos que temos em custódia ou que estão sendo visualizados reduziria o tempo de parsing e o consumo de memória do nosso Worker.

# 5. Decisões e trade-offs — o que você priorizou, o que ficou de fora, o que faria diferente com mais tempo

A arquitetura desta solução foi guiada por um princípio pragmático: entregar o maior valor e segurança para o core business (processamento de ordens e atualização de cotações), mantendo a complexidade técnica adequada para o tempo disponível.

1. O que eu priorizei (Decisões Arquiteturais)
   Consistência e Resiliência no Backend: Priorizei a segurança financeira da aplicação. Implementei chaves de idempotência para evitar ordens duplicadas e construí o Worker de cotações utilizando Promise.allSettled, garantindo que a falha em um ativo não derrube o ecossistema inteiro.

   1.1. Tempo Real "Pragmático" (Short Polling): No frontend, priorizei a sensação de "Home Broker ao vivo" implementando um polling eficiente (a cada 5 segundos) em vez de exigir que o usuário atualizasse a página. Utilizei paginação de estado silenciosa no React para evitar flickers (piscar de tela) de loading.

   1.2 Arquitetura Limpa e Developer Experience (DX): Priorizei um código fácil de manter. No NestJS, criei um EnvService tipado para evitar erros com variáveis de ambiente. No Next.js, utilizei a exportação estática (output: 'export') para baratear custos de infraestrutura do frontend.

2. O que ficou de fora (Trade-offs e Débitos Técnicos Conscientes)
   Toda decisão de software envolve trade-offs. Para entregar o MVP no prazo, deixei de fora:

WebSockets / Server-Sent Events (SSE): O polling de 5 segundos funciona bem para poucos usuários, mas não escala horizontalmente de forma eficiente. O trade-off foi aceitar um maior número de requisições HTTP (GET) no backend em troca da velocidade e simplicidade de implementação do frontend e da API REST.

Motor de Mensageria (Kafka/RabbitMQ): Atualmente, a ordem é processada e inserida de forma síncrona/direta no banco. Em um cenário real de altíssima concorrência na bolsa, deixei de fora uma fila de mensageria que atuaria como buffer (amortecedor) para processar as ordens de forma assíncrona.

Cobertura de Testes (Unitários e E2E): Focando na entrega end-to-end da funcionalidade (banco, api, frontend e docker), o trade-off mais doloroso foi a ausência de uma suíte robusta de testes com Jest e Supertest.

Autenticação Completa (OAuth/SSO): Assumimos um fluxo simplificado de JWT (mock/localStorage) para focar na regra de negócio de investimentos.

3. O que eu faria diferente com mais tempo (Próximos Passos)
   Se eu tivesse mais tempo para evoluir esta aplicação para um cenário de produção de larga escala, eu aplicaria as seguintes melhorias:

Migração para Event-Driven: Desacoplaria a rota de criação de ordens. A API apenas receberia a ordem, validaria o saldo, e enviaria para um tópico Kafka/RabbitMQ. Um microserviço (ou Worker isolado) consumiria essa fila e faria o matching e a execução da ordem.

Camada de Cache (Redis): O endpoint de listagem de cotações (GET /ativos) sofre muita pressão devido ao polling dos usuários. Eu implementaria um cache em Redis, pois cotações são dados de leitura intensiva.

Matemática de Precisão Financeira: Substituiria o tipo Number padrão do TypeScript por bibliotecas como decimal.js ou big.js no momento do cálculo de saldo e posições, eliminando qualquer risco futuro de perda de precisão com pontos flutuantes (padrão IEEE 754).

Integração WebSockets no Frontend: Substituiria o polling do React por uma conexão WebSocket via Socket.io ou SSE para receber atualizações de status de ordens e cotações de forma instantânea via push do servidor.

# 6. Premissas assumidas — se algo não ficou claro no enunciado, documente o que você assumiu e por quê

Durante o desenvolvimento, identifiquei lacunas no enunciado que exigiram tomadas de decisão arquiteturais para garantir a viabilidade e a segurança da aplicação. As principais premissas assumidas foram:

1. Necessidade de Autenticação e Contexto de Usuário
   Premissa: Assumi que o sistema não poderia operar de forma anônima. Desenvolvi um fluxo de Login (JWT) para identificar o autor das ordens.
   Por quê: Em sistemas financeiros, a rastreabilidade é mandatória. Sem um usuário autenticado, não haveria como vincular a custódia dos ativos ou validar se a ordem de compra pertence a uma carteira específica, impossibilitando a persistência correta na tabela de ordens e posições.

2. Controle Prévio de Saldo (Pre-trade Validation)
   Premissa: Assumi que o sistema deve bloquear ordens de compra caso o usuário não possua saldo financeiro disponível no momento do envio.
   Por quê: Permitir o envio de ordens sem lastro financeiro geraria inconsistências graves no banco de dados e no fluxo de liquidação. Implementei uma validação que consulta a tabela de saldos antes de permitir a criação da ordem, garantindo que o "João Investidor" só execute operações condizentes com seu patrimônio líquido.

3. Cotações como Dado Volátil (Polling vs Persistência)
   Premissa: Assumi que as cotações devem ser persistidas localmente no banco de dados do backend, e não apenas consumidas em tempo real da API externa pelo frontend.
   Por quê: Para permitir auditoria de preços no momento da execução da ordem e para garantir que o sistema continue funcional (exibindo os últimos preços conhecidos) mesmo que o serviço de cotações sofra uma instabilidade temporária.
