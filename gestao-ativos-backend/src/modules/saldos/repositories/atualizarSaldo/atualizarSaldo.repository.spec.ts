import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AtualizarSaldoRepository } from './atualizarSaldo.repository';
import { SaldosEntity } from '../../entities/saldos.entity';
import { ErrorUtil } from '../../../../utils/error';

describe('AtualizarSaldoRepository', () => {
  let repository: AtualizarSaldoRepository;
  let saldosRepository: Repository<SaldosEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AtualizarSaldoRepository,
        {
          provide: getRepositoryToken(SaldosEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<AtualizarSaldoRepository>(AtualizarSaldoRepository);
    saldosRepository = module.get<Repository<SaldosEntity>>(getRepositoryToken(SaldosEntity));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('execute', () => {
    const idUsuario = 'user-123';

    it('should throw SALDO_NAO_ENCONTRADO when no record is found and value is negative', async () => {
      jest.spyOn(saldosRepository, 'findOne').mockResolvedValue(null);

      await expect(repository.execute(idUsuario, -10)).rejects.toThrow(ErrorUtil);
      await expect(repository.execute(idUsuario, -10)).rejects.toMatchObject({
        errorName: 'SaldoNaoEncontrado',
        message: 'Saldo não encontrado para este usuário.',
      });
      expect(saldosRepository.findOne).toHaveBeenCalledWith({ where: { id_usuario: idUsuario } });
      expect(saldosRepository.save).not.toHaveBeenCalled();
    });

    it('should create new record and return true when no record is found and value is non-negative', async () => {
      jest.spyOn(saldosRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(saldosRepository, 'save').mockResolvedValue(new SaldosEntity());

      const result = await repository.execute(idUsuario, 100);

      expect(saldosRepository.findOne).toHaveBeenCalledWith({ where: { id_usuario: idUsuario } });
      expect(saldosRepository.save).toHaveBeenCalledWith({ id_usuario: idUsuario, saldo: 100 });
      expect(result).toBe(true);
    });

    it('should throw SALDO_INSUFICIENTE when record is found but new balance is negative', async () => {
      const mockEntity = new SaldosEntity();
      mockEntity.id = 'saldo-1';
      mockEntity.id_usuario = idUsuario;
      mockEntity.saldo = 50;

      jest.spyOn(saldosRepository, 'findOne').mockResolvedValue(mockEntity);

      await expect(repository.execute(idUsuario, -60)).rejects.toThrow(ErrorUtil);
      await expect(repository.execute(idUsuario, -60)).rejects.toMatchObject({
        errorName: 'SaldoInsuficiente',
        message: 'O usuário não possui saldo suficiente para realizar a operação.',
      });
      expect(saldosRepository.update).not.toHaveBeenCalled();
    });

    it('should update record and return true when record is found and new balance is valid', async () => {
      const mockEntity = new SaldosEntity();
      mockEntity.id = 'saldo-1';
      mockEntity.id_usuario = idUsuario;
      mockEntity.saldo = 50.5;

      jest.spyOn(saldosRepository, 'findOne').mockResolvedValue(mockEntity);
      jest.spyOn(saldosRepository, 'update').mockResolvedValue(null as any);

      const result = await repository.execute(idUsuario, -20.25);

      expect(saldosRepository.update).toHaveBeenCalledWith('saldo-1', { saldo: 30.25 });
      expect(result).toBe(true);
    });

    it('should rethrow ErrorUtil when an ErrorUtil is thrown', async () => {
      const errorUtil = new ErrorUtil('ERRO_INTERNO', 'Mensagem de erro');
      jest.spyOn(saldosRepository, 'findOne').mockRejectedValue(errorUtil);

      await expect(repository.execute(idUsuario, 10)).rejects.toThrow(ErrorUtil);
      await expect(repository.execute(idUsuario, 10)).rejects.toMatchObject({
        errorName: 'ErroInterno',
        message: 'Mensagem de erro',
      });
    });

    it('should throw an internal ErrorUtil when a generic error is thrown', async () => {
      const genericError = new Error('Generic error');
      jest.spyOn(saldosRepository, 'findOne').mockRejectedValue(genericError);

      await expect(repository.execute(idUsuario, 10)).rejects.toThrow(ErrorUtil);
      await expect(repository.execute(idUsuario, 10)).rejects.toMatchObject({
        errorName: 'ErroInterno',
        message: 'Ocorreu um erro interno ao atualizar o saldo.',
      });
    });
  });
});
