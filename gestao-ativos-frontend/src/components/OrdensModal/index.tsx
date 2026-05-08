"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Label,
  TextInput,
  Select,
  Alert,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from "flowbite-react";
import axios from "axios";

const GESTAO_ATIVOS_API_URL = process.env.NEXT_PUBLIC_GESTAO_ATIVOS_API_URL || "http://localhost:3002";

interface OrdensModalProps {
  isOpen: boolean;
  onClose: () => void;
  ativoPreSelecionado: string;
  precoAtual: number;
}

export function OrdensModal({
  isOpen,
  onClose,
  ativoPreSelecionado,
  precoAtual,
}: OrdensModalProps) {
  const [quantidade, setQuantidade] = useState<number>(10);
  const [tipoOrdem, setTipoOrdem] = useState<"COMPRA" | "VENDA">("COMPRA");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Limpa o estado sempre que o modal for aberto com um novo ativo
  useEffect(() => {
    if (isOpen) {
      setQuantidade(10);
      setTipoOrdem("COMPRA");
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, ativoPreSelecionado]);

  const valorTotal = quantidade * precoAtual;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("authToken");

      if (!userId || !token) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      // Envia a ordem para a API com a chave de idempotência
      await axios.post(
        `${GESTAO_ATIVOS_API_URL}/ordens/${userId}`,
        {
          simbolo: ativoPreSelecionado,
          quantidade: Number(quantidade),
          tipo: tipoOrdem,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "idempotency-key": crypto.randomUUID(), // Gera um UUID único para esta transação
          },
        },
      );

      setSuccess(`Ordem de ${tipoOrdem} enviada com sucesso!`);

      // Fecha o modal automaticamente após 2 segundos em caso de sucesso
      setTimeout(() => {
        onClose();
      }, 2000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Erro ao enviar ordem:", err);
      setError(
        err.response?.data?.message ||
          "Ocorreu um erro ao processar sua ordem. Verifique seu saldo ou tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={isOpen} onClose={!isLoading ? onClose : undefined} size="md">
      <ModalHeader>Negociar {ativoPreSelecionado}</ModalHeader>

      <ModalBody>
        {error && (
          <Alert
            color="failure"
            className="mb-4"
            onDismiss={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert color="success" className="mb-4">
            {success}
          </Alert>
        )}

        <form
          id="form-ordem"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div>
            <div className="mb-2 block">
              <Label>Cotação Atual</Label>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              R${" "}
              {precoAtual.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="tipo">Tipo de operação</Label>
            </div>
            <Select
              id="tipo"
              value={tipoOrdem}
              onChange={(e) =>
                setTipoOrdem(e.target.value as "COMPRA" | "VENDA")
              }
              required
              disabled={isLoading || !!success}
            >
              <option value="COMPRA">Comprar</option>
              <option value="VENDA">Vender</option>
            </Select>
          </div>

          {/* Quantidade */}
          <div>
            <div className="mb-2 block">
              <Label htmlFor="quantidade">Quantidade</Label>
            </div>
            <TextInput
              id="quantidade"
              type="number"
              min={1}
              step={1}
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              required
              disabled={isLoading || !!success}
            />
          </div>

          {/* Resumo do Valor Total */}
          <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Valor Total Estimado:
              </span>
              <span
                className={`text-lg font-bold ${tipoOrdem === "COMPRA" ? "text-blue-600 dark:text-blue-400" : "text-green-600 dark:text-green-400"}`}
              >
                R${" "}
                {valorTotal.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </form>
      </ModalBody>

      <ModalFooter className="flex justify-end gap-2">
        <Button
          color="gray"
          onClick={onClose}
          disabled={isLoading || !!success}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form="form-ordem"
          color={tipoOrdem === "COMPRA" ? "blue" : "success"}
          disabled={isLoading || !!success}
        >
          {isLoading ? (
            <Spinner />
          ) : (
            `Confirmar ${tipoOrdem === "COMPRA" ? "Compra" : "Venda"}`
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
