# Sistema de Ordens de Investimento

## 1. Diagrama de Arquitetura

O diagrama representa a infraestrutura em nuvem definitiva ("as-is") projetada para suportar o Sistema de Ordens de Investimento. A arquitetura foi desenhada na AWS seguindo os pilares do **AWS Well-Architected Framework**, com foco estrito em segurança de rede, alta disponibilidade e processamento assíncrono.

**Componentes Principais:**
* **Borda (Edge) e Roteamento:** Usuários acessam o sistema via **Internet**, onde o tráfego estático é servido pelo **Amazon CloudFront** (buscando do **Amazon S3**) e as requisições dinâmicas chegam ao **Amazon API Gateway**.
* **Integração Privada (Networking):** Para garantir segurança máxima, a comunicação entre o API Gateway e o backend utiliza um **AWS VPC Link**, que entrega o tráfego a um **Application Load Balancer (ELB)** interno, isolado na Sub-rede Privada. O **NAT Gateway**, alocado na Sub-rede Pública, permite comunicações de saída seguras.
* **Computação (Compute):** Utilizamos **Amazon ECS (Fargate)** dividido em **três serviços independentes** para especialização e isolamento de carga:
  1. **ECS API (Gestão de Ativos):** Recebe as requisições síncronas (via ELB), valida e enfileira.
  2. **ECS Worker (Cotação):** Serviço em *background* dedicado exclusivamente a consultar as APIs externas de mercado e manter o cache atualizado.
  3. **ECS Worker (Processamento de Ordens):** Consumidor exclusivo da fila SQS, responsável por aplicar a regra de negócio financeira e consolidar a transação.
* **Desacoplamento e Mensageria:** A comunicação entre API e Worker de Ordens é feita via **Amazon SQS (FIFO)**. Para tratamento de falhas, há uma **SQS DLQ (Dead Letter Queue)** acoplada.
* **Persistência e Cache:** O estado financeiro é garantido pelo **Amazon Aurora (PostgreSQL)**, enquanto o **Amazon ElastiCache (Redis)** atua como escudo de alta performance para o compartilhamento rápido de cotações entre os Workers.

## 2. Justificativa das Escolhas e Alternativas

* **VPC Link + ELB Interno em vez de API Pública:** O backend financeiro não pode ter exposição direta à internet. A escolha do **VPC Link** garante que o tráfego flua 100% pela espinha dorsal da AWS, enquanto o **ELB** realiza o balanceamento de carga da API.
* **Separação Estrutural em 3 Serviços (ECS Fargate):** Separar a arquitetura em API, Worker de Cotação e Worker de Ordens é uma decisão crítica de design (*Microservices/Single Responsibility*). Isso evita que a latência imprevisível das APIs externas de cotação paralise o processamento de ordens e permite aplicar o princípio do menor privilégio (*Least Privilege*) e escalonamento granular.
* **Amazon Aurora (PostgreSQL) em vez de DynamoDB:** Bancos NoSQL são excelentes para escala, mas complexos para garantir integridade relacional forte. O PostgreSQL suporta **Pessimistic Locking** (`SELECT FOR UPDATE`), travando a linha de saldo do cliente para impedir cenários de gasto duplo (*Double Spending*).
* **ElastiCache (Redis):** Com um requisito de 10.000 consultas de cotação/segundo, o acesso direto ao Aurora causaria exaustão de conexões. O Worker de Cotação escreve no Redis, e o Worker de Ordens lê do Redis em microssegundos.

## 3. Como a Arquitetura Escala

* **Escalabilidade Granular e Independente:** * A **ECS API** escala horizontalmente baseada em tráfego HTTP/CPU para suportar **50.000 usuários simultâneos**. 
  * O **ECS Worker (Cotação)** pode escalar com base na necessidade de atualização do mercado financeiro (ex: mais tarefas em horário de pregão, menos tarefas à noite).
  * O **ECS Worker (Ordens)** possui *Auto Scaling* baseado estritamente na profundidade da fila do SQS (`ApproximateNumberOfMessagesVisible`), suportando picos de vazão sem comprometer os demais serviços.
* **Vazão de 1.000 ordens/s:** A API age apenas como um *proxy* de validação, depositando a ordem no SQS rapidamente e liberando o usuário, delegando o processamento pesado e concorrente para o cluster de Workers de Ordens.

## 4. Como a Arquitetura Trata Falhas

* **Isolamento de Falhas Externas:** Se o provedor de cotações ficar indisponível, apenas o **ECS Worker (Cotação)** irá falhar. O **ECS Worker (Ordens)** continua processando normalmente, utilizando o último preço válido em cache (*Fallback* no Redis).
* **Proteção contra Mensagens Venenosas (SQS DLQ):** Em filas FIFO, uma falha sistêmica no processamento paralisa a fila (*Head-of-line blocking*). Após 3 tentativas frustradas de processar uma ordem pelo Worker, a mensagem é movida para a **SQS DLQ**, destravando a fila e disparando alertas.
* **Multi-AZ:** O Aurora e o Redis operam em múltiplas Zonas de Disponibilidade, garantindo *failover* automático.

## 5. Como o Produto Evolui

* **Adição de Novos Provedores de Cotação:** Graças à separação de Workers, adicionar um novo provedor requer alterações apenas no repositório/imagem do **Worker de Cotação**, sem necessidade de *deploy* ou refatoração do motor transacional de ordens.
* **Novos Tipos de Ativos:** O modelo relacional no **Aurora** foi planejado para extensibilidade. Novos ativos requerem apenas tabelas satélites de metadados.

## 6. Segurança

* **Isolamento de Rede (Camadas):** Os ECS Services, Aurora e Redis rodam em **Sub-redes Privadas**. A comunicação de saída para APIs financeiras externas é feita pelo **NAT Gateway** mascarando os IPs internos e bloqueando conexões entrantes não solicitadas.
* **Segurança de Borda:** **AWS Shield Standard** (nativo) mitiga DDoS volumétricos, enquanto o API Gateway aplica **Throttling** limitando a taxa de acesso por usuário.
* **IAM Roles (Least Privilege):** A divisão em 3 serviços permite permissões estritas. A API só tem permissão de *Write* no SQS. O Worker de Cotação só tem *Write* no Redis. O Worker de Ordens tem *Read* no SQS/Redis e *Write* no Aurora.

## 7. Observabilidade

A estratégia garante a integridade financeira e rápida recuperação utilizando monitoramento proativo.

### 7.1. Detecção de Incidentes
Integração com **CloudWatch Alarms e Amazon SNS** com dois gatilhos vitais:
1. **Fila Travada:** Métrica `ApproximateAgeOfOldestMessage` do SQS FIFO ultrapassando tempo crítico (ex: 60s).
2. **Falha Crítica (DLQ):** Métrica `NumberOfMessagesReceived` da SQS DLQ maior que 0.

### 7.2. Fluxo de Investigação (Troubleshooting)
1. **Monitoramento do Desacoplamento:** Checar `NumberOfMessagesVisible` no SQS e verificar os *payloads* na DLQ.
2. **Triagem de Workers (Logs):** A divisão facilita a investigação. 
   * Se o problema for latência na atualização de preços, investigar os logs exclusivos do **Worker de Cotação**. 
   * Se ordens não estão efetivando, focar no **Worker de Ordens** em busca de *Timeouts* com o Aurora ou API de Saldo.
3. **Persistência (Aurora):** Analisar `DBLoad` em busca de *Deadlocks* gerados pelas transações `SELECT FOR UPDATE`.
4. **Conectividade:** Checar `ErrorPortAllocation` no NAT Gateway para garantir que portas de saída não foram esgotadas.


## 8. Estimativa de Custos

**Premissas Adotadas:**
* Ambiente de **produção** capaz de lidar com picos de 1.000 ordens/s e 10.000 consultas de cotação/s.
* Taxa de câmbio aproximada: **US$ 1,00 = R$ 5,00**. Região: **us-east-1 (N. Virginia)**.

### Tabela de Custos Estimados

| Componente do Diagrama | Configuração Sugerida (Baseline Produção) | Custo Mensal (USD) | Custo Mensal (BRL) |
| :--- | :--- | :--- | :--- |
| **Amazon CloudFront + S3** | Hospedagem do SPA + ~1 TB transferência. | US$ 90,00 | **R$ 450,00** |
| **Amazon API Gateway** | ~50 milhões de requisições REST/mês. | US$ 175,00 | **R$ 875,00** |
| **VPC Link + ELB Interno** | 1 ALB + 1 VPC Link (cobrança hora + dados). | US$ 60,00 | **R$ 300,00** |
| **Amazon ECS (Fargate)** | Cluster segmentado em 3 serviços (API, Cotação, Ordens). Aprox. 12-15 *Tasks* totais com Auto Scaling. | US$ 400,00 | **R$ 2.000,00** |
| **Amazon SQS (FIFO + DLQ)** | ~50 milhões de mensagens/mês com deduplicação. | US$ 25,00 | **R$ 125,00** |
| **Amazon Aurora (PostgreSQL)**| Instância `db.r6g.large` em Multi-AZ + ~100GB I/O. | US$ 450,00 | **R$ 2.250,00** |
| **Amazon ElastiCache (Redis)**| Instância `cache.m7g.large` (altíssima vazão). | US$ 150,00 | **R$ 750,00** |
| **NAT Gateway** | 1 NAT Gateway 24/7 na Public Subnet + dados. | US$ 60,00 | **R$ 300,00** |
| **CloudWatch + SNS** | Ingestão de logs segmentados (3 apps), métricas. | US$ 80,00 | **R$ 400,00** |

### Resumo Mensal
* **Total Estimado em Dólares:** ~US$ 1.490,00 / mês
* **Total Estimado em Reais:** ~**R$ 7.450,00 / mês**