import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { runDatabaseSeed } from './initial-seed'; // Importe a função que criamos na resposta anterior

async function bootstrap() {
  console.log('⏳ Inicializando o contexto do NestJS para o Seed...');

  // Cria a aplicação sem subir o servidor HTTP (Standalone mode)
  const app = await NestFactory.createApplicationContext(AppModule);

  // Extrai a conexão ativa do TypeORM de dentro da Injeção de Dependências
  const dataSource = app.get(DataSource);

  try {
    // Executa a função do seed
    await runDatabaseSeed(dataSource);
  } catch (error) {
    console.error('❌ Erro fatal ao rodar o seed:', error);
  } finally {
    // É CRUCIAL fechar a aplicação para encerrar a conexão com o banco e liberar o terminal
    await app.close();
    process.exit(0);
  }
}

void bootstrap();
