"use client";

import {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Spinner,
  Alert,
} from "flowbite-react";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { OrdensModal } from "@/components/OrdensModal";

const GESTAO_ATIVOS_API_URL =
  process.env.NEXT_PUBLIC_GESTAO_ATIVOS_API_URL || "http://localhost:3002";

interface MercadoAtivoAPI {
  id: string;
  simbolo: string;
  nome: string;
  cotacao: string;
  horarioCotacao: string;
}

export default function AtivosPage() {
  const [ativos, setAtivos] = useState<MercadoAtivoAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [ativoSelecionado, setAtivoSelecionado] = useState({
    simbolo: "",
    preco: 0,
  });

  const fetchMercado = useCallback(
    async (isFirstLoad = false) => {
      if (isFirstLoad) setIsLoading(true);

      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("Usuário não autenticado");

        const response = await axios.get(`${GESTAO_ATIVOS_API_URL}/ativos`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAtivos(response.data);
        setError(null);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Erro ao carregar o mercado de ativos:", err);
        if (ativos.length === 0) {
          setError("Não foi possível carregar a lista de ativos no momento.");
        }
      } finally {
        if (isFirstLoad) setIsLoading(false);
      }
    },
    [ativos.length],
  );

  useEffect(() => {
    fetchMercado(true);

    const intervalId = setInterval(() => {
      fetchMercado(false);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchMercado]);

  const handleOpenModal = (simbolo: string, cotacaoString: string) => {
    setAtivoSelecionado({ simbolo, preco: Number(cotacaoString) });
    setModalOpen(true);
  };

  return (
    <main className="container mx-auto max-w-6xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Mercado de Ativos
        </h1>
        {isLoading && <Spinner aria-label="Carregando ativos" />}
      </div>

      {error && (
        <Alert
          color="failure"
          className="mb-4"
          onDismiss={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <div className="overflow-x-auto rounded-lg shadow">
        <Table hoverable>
          <TableHead>
            <TableRow>
              <TableHeadCell>Símbolo</TableHeadCell>
              <TableHeadCell>Nome</TableHeadCell>
              <TableHeadCell>Cotação</TableHeadCell>
              <TableHeadCell>Última atualização</TableHeadCell>
              <TableHeadCell>Ação</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {!isLoading && ativos.length === 0 && !error && (
              <TableRow>
                <TableCell colSpan={4} className="py-4 text-center">
                  Nenhum ativo disponível no momento.
                </TableCell>
              </TableRow>
            )}

            {ativos.map((ativo) => {
              const cotacaoFormatada = Number(ativo.cotacao).toLocaleString(
                "pt-BR",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              );

              return (
                <TableRow
                  key={ativo.id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <TableCell className="font-bold text-gray-900 dark:text-white">
                    {ativo.simbolo}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    {ativo.nome}
                  </TableCell>
                  <TableCell className="text-gray-900 dark:text-gray-100">
                    R$ {cotacaoFormatada}
                  </TableCell>
                  <TableCell className="text-gray-900 dark:text-gray-100">
                    {new Date(ativo.horarioCotacao).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      color="blue"
                      onClick={() =>
                        handleOpenModal(ativo.simbolo, ativo.cotacao)
                      }
                    >
                      Negociar
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <OrdensModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        ativoPreSelecionado={ativoSelecionado.simbolo}
        precoAtual={ativoSelecionado.preco}
      />
    </main>
  );
}
