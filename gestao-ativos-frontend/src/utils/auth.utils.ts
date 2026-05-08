export interface TokenPayload {
  id: string;
  nome: string;
  email: string;
  iat: number;
  exp: number;
}

export const handleAuthToken = (token: string): TokenPayload | null => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) throw new Error("Token mal formatado");

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    const decodedPayload = JSON.parse(jsonPayload) as TokenPayload;

    localStorage.setItem("authToken", token);
    localStorage.setItem("userId", decodedPayload.id); 
    localStorage.setItem("userNome", decodedPayload.nome); 
    localStorage.setItem("userEmail", decodedPayload.email); 

    return decodedPayload;
  } catch (error) {
    console.error("Falha ao decodificar o token de autenticação:", error);
    return null;
  }
};


export const clearAuth = (): void => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userId");
};
