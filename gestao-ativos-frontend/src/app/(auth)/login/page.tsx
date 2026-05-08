"use client";

import { useState } from "react";
import { Button, Card, Label, TextInput, Alert, Spinner } from "flowbite-react";
import axios from "axios";
import { handleAuthToken } from "@/utils/auth.utils";

const GESTAO_ATIVOS_API_URL = process.env.NEXT_PUBLIC_GESTAO_ATIVOS_API_URL || "http://localhost:3002";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post(
        `${GESTAO_ATIVOS_API_URL}/auth/login`,
        {
          email,
          password,
        },
      );

      const token = response.data.token;
      handleAuthToken(token);

      console.log("Login realizado com sucesso!", response.data);
      window.location.href = "/";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response) {
        setErrorMessage(
          error.response.data.message || "E-mail ou senha incorretos.",
        );
      } else {
        console.log(error);
        setErrorMessage("Erro de conexão com o servidor. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {errorMessage && (
            <Alert color="failure" onDismiss={() => setErrorMessage("")}>
              {errorMessage}
            </Alert>
          )}

          <div>
            <div className="mb-2 block">
              <Label htmlFor="email">E-mail</Label>
            </div>
            <TextInput
              id="email"
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="password">Senha</Label>
            </div>
            <TextInput
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Spinner
                size="sm"
                aria-label="Info spinner example"
                className="me-3"
                light
              />
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
