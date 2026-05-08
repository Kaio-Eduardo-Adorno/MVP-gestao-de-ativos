"use client";

import { useEffect, useState } from "react";
import { Card, Spinner, Alert } from "flowbite-react";
import axios from "axios";

const GESTAO_ATIVOS_API_URL = process.env.NEXT_PUBLIC_GESTAO_ATIVOS_API_URL || "http://localhost:3002";

// 1. Interface atualizada com os novos dados do backend
interface AtivoAPI {
  simbolo: string;
  nome: string;
  quantidade: number;
  cotacaoAtual: string;
  horarioCotacao: string;
}

// 2. Mantemos o precoMedio e o precoAtual (que será a versão em Number da cotacaoAtual)
interface PosicaoAtivo extends AtivoAPI {
  precoAtual: number;
}

export function MeusAtivos() {
  const [saldoLivre, setSaldoLivre] = useState<number | null>(null);
  const [ativos, setAtivos] = useState<PosicaoAtivo[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const idUsuario = localStorage.getItem("userId");
        const token = localStorage.getItem("authToken");

        if (!idUsuario || !token) {
          throw new Error("Usuário não autenticado");
        }

        const headers = { Authorization: `Bearer ${token}` };

        const [saldoResponse, ativosResponse] = await Promise.all([
          axios.get(`${GESTAO_ATIVOS_API_URL}/saldos/usuario/${idUsuario}`, {
            headers,
          }),
          axios.get(`${GESTAO_ATIVOS_API_URL}/ativos/usuario/${idUsuario}`, {
            headers,
          }),
        ]);

        setSaldoLivre(Number(saldoResponse.data.saldo));

        const ativosDoBanco: AtivoAPI[] = ativosResponse.data;

        const ativosFormatados: PosicaoAtivo[] = ativosDoBanco.map((ativo) => ({
          ...ativo,
          precoAtual: Number(ativo.cotacaoAtual), // Converte a string da API para Number
        }));

        setAtivos(ativosFormatados);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Erro ao carregar o dashboard:", err);
        setError(
          "Não foi possível carregar as informações da sua carteira no momento."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const patrimonioInvestido = ativos.reduce(
    (acc, item) => acc + item.quantidade * item.precoAtual,
    0
  );
  const patrimonioTotal = patrimonioInvestido + (saldoLivre || 0);

  return (
    <main className="container mx-auto max-w-6xl p-4">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Visão Consolidada
      </h1>

      {error && (
        <Alert
          color="failure"
          className="mb-4"
          onDismiss={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <h5 className="text-xl font-bold text-gray-900 dark:text-gray-200">
            Patrimônio Total
          </h5>
          <div className="flex items-center gap-3">
            {isLoading ? (
              <Spinner aria-label="Carregando saldo..." />
            ) : (
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                R${" "}
                {patrimonioTotal.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            )}
          </div>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <h5 className="text-xl font-bold text-gray-900 dark:text-gray-200">
            Patrimônio Total em Ativos
          </h5>
          <div className="flex items-center gap-3">
            {isLoading ? (
              <Spinner aria-label="Carregando saldo..." />
            ) : (
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                R${" "}
                {patrimonioInvestido.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            )}
          </div>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <h5 className="text-xl font-bold text-gray-900 dark:text-gray-200">
            Saldo Livre (Conta)
          </h5>
          <div className="flex items-center gap-3">
            {isLoading ? (
              <Spinner aria-label="Carregando saldo..." />
            ) : (
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                R${" "}
                {(saldoLivre || 0).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Meus Ativos ({ativos.length})
        </h2>
        {isLoading && <Spinner size="sm" />}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {!isLoading && ativos.length === 0 && (
          <p className="col-span-full text-gray-500 dark:text-gray-400">
            Você ainda não possui ativos na sua carteira.
          </p>
        )}

        {ativos.map((item) => {
          const valorAtual = item.quantidade * item.precoAtual;

          // Formatação da data para o padrão local (ex: 07/05/2026 às 09:39)
          const dataCotacao = new Date(item.horarioCotacao).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });

          return (
            <Card key={item.simbolo}>
              <div>
                <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {item.simbolo}
                </h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.nome}
                </p>
              </div>

              <div className="mt-2 space-y-1 font-normal text-gray-700 dark:text-gray-400">
                <p>
                  Quant:{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {item.quantidade}
                  </span>
                </p>
                <p>
                  Atual: R${" "}
                  {item.precoAtual.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>

                <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-600">
                  <p className="font-bold text-gray-900 dark:text-white">
                    Posição: R${" "}
                    {valorAtual.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                    Última atualização: {dataCotacao}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </main>
  );
}