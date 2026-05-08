import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UsersEntity } from '../../modules/auth/entities/user.entity';
import { AtivosEntity } from '../../modules/ativos/entities/ativos.entity';
import { AtivosUsuariosEntity } from '../../modules/ativos/entities/ativosUsuarios.entity';
import { SaldosEntity } from '../../modules/saldos/entities/saldos.entity';

export async function runDatabaseSeed(dataSource: DataSource) {
  console.log('🌱 Iniciando o Seed do Banco de Dados...');

  const userRepo = dataSource.getRepository(UsersEntity);
  const ativoRepo = dataSource.getRepository(AtivosEntity);
  const ativoUsuarioRepo = dataSource.getRepository(AtivosUsuariosEntity);
  const saldoRepo = dataSource.getRepository(SaldosEntity);

  // 1. Verificação de segurança: Só roda o seed se a tabela de usuários estiver vazia
  const usersCount = await userRepo.count();
  if (usersCount > 0) {
    console.log('⚠️ O banco já possui dados. Seed abortado para evitar duplicatas.');
    return;
  }

  // ---------------------------------------------------
  // PASSO 1: Criar os Ativos
  // ---------------------------------------------------
  const ativosData = [
    { simbolo: 'ITUB4', nome: 'Itaú Unibanco PN', cotacao: 32.8 },
    { simbolo: 'ITUB3', nome: 'Itaú Unibanco ON', cotacao: 15.4 },
    { simbolo: 'USDC', nome: 'USD Coin', cotacao: 5.5 },
    { simbolo: 'SOL', nome: 'Solana', cotacao: 418.07 },
    { simbolo: 'BTC', nome: 'Bitcoin', cotacao: 350000.0 },
    { simbolo: 'ETH', nome: 'Ethereum', cotacao: 18500.0 },
  ];

  const ativosCriados = await Promise.all(
    ativosData.map(async (ativo) => {
      const novoAtivo = ativoRepo.create({
        ...ativo,
        horario_cotacao: new Date(),
      });
      return await ativoRepo.save(novoAtivo);
    }),
  );
  console.log(`✅ ${ativosCriados.length} Ativos inseridos.`);

  // ---------------------------------------------------
  // PASSO 2: Criar os Usuários (Com senhas criptografadas)
  // ---------------------------------------------------
  const defaultPassword = await bcrypt.hash('12345678', 10);

  const joao = await userRepo.save(
    userRepo.create({
      id: '61b626d6-d13b-409d-aef5-69e9e918acef',
      nome: 'João Investidor',
      email: 'joao@teste.com',
      password: defaultPassword,
    }),
  );

  const maria = await userRepo.save(
    userRepo.create({ nome: 'Maria Trader', email: 'maria@teste.com', password: defaultPassword }),
  );

  const carlos = await userRepo.save(
    userRepo.create({ nome: 'Carlos Holder', email: 'carlos@teste.com', password: defaultPassword }),
  );

  console.log(`✅ 3 Usuários inseridos (Senha padrão: 12345678).`);

  // ---------------------------------------------------
  // PASSO 3: Criar os Saldos em Conta (Dinheiro Livre)
  // ---------------------------------------------------
  await saldoRepo.save([
    saldoRepo.create({ id_usuario: joao.id, saldo: 15000.0 }), // João começa com 15k livres
    saldoRepo.create({ id_usuario: maria.id, saldo: 50000.0 }), // Maria começa pesada
    saldoRepo.create({ id_usuario: carlos.id, saldo: 2500.0 }),
  ]);
  console.log(`✅ Saldos iniciais definidos.`);

  // ---------------------------------------------------
  // PASSO 4: Criar as Posições na Carteira (João Investidor)
  // ---------------------------------------------------

  // Encontra os IDs reais dos ativos que acabamos de criar no banco
  const itub4 = ativosCriados.find((a) => a.simbolo === 'ITUB4');
  const usdc = ativosCriados.find((a) => a.simbolo === 'USDC');

  if (itub4 && usdc) {
    await ativoUsuarioRepo.save([
      ativoUsuarioRepo.create({
        id_usuario: joao.id,
        id_ativo: itub4.id,
        quantidade: 100,
        // preco_medio: 30.00 // Descomente caso você adicione a coluna na entidade AtivosUsuariosEntity
      }),
      ativoUsuarioRepo.create({
        id_usuario: joao.id,
        id_ativo: usdc.id,
        quantidade: 50,
        // preco_medio: 3.94 // Descomente caso você adicione a coluna na entidade AtivosUsuariosEntity
      }),
    ]);
    console.log(`✅ Posições de custódia (ITUB4 e USDC) adicionadas para o João.`);
  }

  console.log('🚀 Seed concluído com sucesso!');
}
