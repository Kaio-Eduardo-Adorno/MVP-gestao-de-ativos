"use client";

import {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Select,
  Badge,
  Spinner,
  Alert,
} from "flowbite-react";
import { useEffect, useState, useCallback } from "react";
import { FaTrash } from "react-icons/fa";
import axios from "axios";

const GESTAO_ATIVOS_API_URL =
  process.env.NEXT_PUBLIC_GESTAO_ATIVOS_API_URL || "http://localhost:3002";

interface OrdemAPI {
  id: string;
  simbolo: string;
  tipo: "COMPRA" | "VENDA";
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  criadoEm: string;
  atualizadoEm: string;
  status: "PENDENTE" | "PROCESSANDO" | "EXECUTADA" | "CANCELADA" | "REJEITADA";
}

export default function OrdensPage() {
  const [ordens, setOrdens] = useState<OrdemAPI[]>([]);
  const [filtroStatus, setFiltroStatus] = useState("TODAS");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Busca as ordens na API
  const fetchOrdens = useCallback(
    async (isFirstLoad = false) => {
      if (isFirstLoad) setIsLoading(true);

      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("authToken");

        if (!userId || !token) throw new Error("Usuário não autenticado");

        const response = await axios.get(
          `${GESTAO_ATIVOS_API_URL}/ordens/usuario/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        setOrdens(response.data);
        setError(null);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Erro ao carregar ordens:", err);
        if (ordens.length === 0) {
          setError("Não foi possível carregar o histórico de ordens.");
        }
      } finally {
        if (isFirstLoad) setIsLoading(false);
      }
    },
    [ordens.length],
  );

  // Polling para manter as ordens atualizadas (caso estejam processando)
  useEffect(() => {
    fetchOrdens(true);
    const intervalId = setInterval(() => fetchOrdens(false), 5000);
    return () => clearInterval(intervalId);
  }, [fetchOrdens]);

  const ordensFiltradas =
    filtroStatus === "TODAS"
      ? ordens
      : ordens.filter((o) => o.status === filtroStatus);

  // Função atualizada para chamar o PATCH da API
  const handleCancelarOrdem = async (id: string) => {
    if (confirm("Tem certeza que deseja cancelar esta ordem?")) {
      try {
        const token = localStorage.getItem("authToken");

        await axios.patch(
          `${GESTAO_ATIVOS_API_URL}/ordens/${id}/cancelar`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        // Atualiza a UI imediatamente para não ter que esperar os 5s do Polling
        setOrdens((prevOrdens) =>
          prevOrdens.map((o) =>
            o.id === id ? { ...o, status: "CANCELADA" } : o,
          ),
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        alert(err.response?.data?.message || "Erro ao cancelar a ordem.");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "EXECUTADA":
        return <Badge color="success">Executada</Badge>;
      case "PROCESSANDO": // Adicionei o status PROCESSANDO que você mencionou na API
        return <Badge color="warning">Processando</Badge>;
      case "PENDENTE":
        return <Badge color="indigo">Pendente</Badge>;
      case "CANCELADA":
      case "REJEITADA": // Rejeitada cai no mesmo grupo visual
        return (
          <Badge color="failure">
            {status === "CANCELADA" ? "Cancelada" : "Rejeitada"}
          </Badge>
        );
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  return (
    <main className="container mx-auto max-w-6xl p-4">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Minhas Ordens
          </h1>
          {isLoading && <Spinner aria-label="Carregando ordens..." size="sm" />}
        </div>

        <Select
          id="filtro"
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
        >
          <option value="TODAS">Todas as Ordens</option>
          {/* Opções baseadas nos status reais do seu backend */}
          <option value="PROCESSANDO">Em Processamento</option>
          <option value="PENDENTE">Pendentes</option>
          <option value="EXECUTADA">Executadas</option>
          <option value="CANCELADA">Canceladas</option>
        </Select>
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
              <TableHeadCell>ID da Ordem</TableHeadCell>
              <TableHeadCell>Ativo</TableHeadCell>
              <TableHeadCell>Tipo</TableHeadCell>
              <TableHeadCell>Qtd</TableHeadCell>
              <TableHeadCell>Preço Unit.</TableHeadCell>
              <TableHeadCell>Criada em</TableHeadCell>
              <TableHeadCell>Última atualização</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Ações</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {!isLoading && ordensFiltradas.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-4 text-center">
                  Nenhuma ordem encontrada.
                </TableCell>
              </TableRow>
            )}

            {ordensFiltradas.map((ordem) => {
              // Exibe apenas uma parte do UUID para não estourar a tela visualmente
              const shortId = ordem.id.split("-")[0];

              return (
                <TableRow
                  key={ordem.id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <TableCell className="font-mono text-xs text-gray-500">
                    #{shortId}
                  </TableCell>
                  <TableCell className="font-bold text-gray-900 dark:text-white">
                    {ordem.simbolo}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        ordem.tipo === "COMPRA"
                          ? "font-bold text-blue-600 dark:text-blue-400"
                          : "font-bold text-red-500 dark:text-red-400"
                      }
                    >
                      {ordem.tipo}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-900 dark:text-white">
                    {ordem.quantidade}
                  </TableCell>
                  <TableCell className="text-gray-900 dark:text-white">
                    R${" "}
                    {ordem.valorUnitario.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    {new Date(ordem.criadoEm).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    {new Date(ordem.atualizadoEm).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>{getStatusBadge(ordem.status)}</TableCell>
                  <TableCell>
                    <Button
                      size="xs"
                      color="failure"
                      // Apenas ordens PROCESSANDO ou PENDENTES devem poder ser canceladas
                      disabled={
                        ordem.status === "EXECUTADA" ||
                        ordem.status === "CANCELADA" ||
                        ordem.status === "REJEITADA"
                      }
                      onClick={() => handleCancelarOrdem(ordem.id)}
                    >
                      <FaTrash className="mr-2" /> Cancelar
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
