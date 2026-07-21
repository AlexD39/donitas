import { LockKeyhole, Mail } from "lucide-react";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router";

import { useAuth } from "../../context/AuthContext";
import { getApiError } from "../../services/api";

export function LoginPage() {
  const { usuario, cargando, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(
    "admin@donitasanita.com",
  );

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    setError("");
  }, [email, password]);

  if (!cargando && usuario) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setError("");
    setEnviando(true);

    try {
      await login(email, password);

      const state = location.state as
        | { from?: string }
        | null;

      navigate(state?.from ?? "/admin", {
        replace: true,
      });
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "No se pudo iniciar sesión.",
        ),
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-logo">🍩</div>

        <p className="eyebrow">Panel administrativo</p>
        <h1>Donitas Anita</h1>
        <p className="muted">
          Ingresa para administrar productos e información
          de la tienda.
        </p>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <form
          className="stack-form"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <label>
            Correo electrónico

            <div className="input-icon">
              <Mail size={18} />
              <input
                type="email"
                value={email}
                autoComplete="email"
                required
                onChange={(event) =>
                  setEmail(event.target.value)
                }
              />
            </div>
          </label>

          <label>
            Contraseña

            <div className="input-icon">
              <LockKeyhole size={18} />
              <input
                type="password"
                value={password}
                autoComplete="current-password"
                required
                onChange={(event) =>
                  setPassword(event.target.value)
                }
              />
            </div>
          </label>

          <button
            className="button button-primary button-full"
            type="submit"
            disabled={enviando}
          >
            {enviando
              ? "Ingresando..."
              : "Iniciar sesión"}
          </button>
        </form>

        <a className="back-link" href="/">
          ← Regresar a la tienda
        </a>
      </section>
    </main>
  );
}