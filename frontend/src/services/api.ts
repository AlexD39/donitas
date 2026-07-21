import axios from "axios";

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ??
    "http://localhost:4001/api",
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
  timeout: 15000,
});

export function getApiError(
  error: unknown,
  fallback = "Ocurrió un error inesperado.",
): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (
      typeof message === "string" &&
      message.trim().length > 0
    ) {
      return message;
    }

    if (error.code === "ECONNABORTED") {
      return "La solicitud tardó demasiado en responder.";
    }

    if (!error.response) {
      return "No se pudo conectar con el servidor.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}