import React, { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserService from "../services/UserService";
import Layout from "../components/Layout";

const TYPES = ["admin", "user"];

export default function UserEdit() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAdmin } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    nome: "",
    type: "user",
    password: "",
  });

  const loadUser = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await UserService.get(userId);
      setUser(data);
      setForm({
        email: data.email || "",
        nome: data.nome || data.name || "",
        type: data.type || "user",
        password: "",
      });
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "Usuário não encontrado."
          : err.response?.data?.message || err.message || "Erro ao carregar."
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Usuário tipo "user" só pode editar a si mesmo
  const isEditingSelf = currentUser && String(userId) === String(currentUser.id);
  if (
    currentUser &&
    !isAdmin &&
    !isEditingSelf
  ) {
    navigate("/users", { replace: true });
    return null;
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email.trim()) {
      setError("Informe o e-mail.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        email: form.email.trim(),
        nome: form.nome.trim(),
        type: form.type,
      };
      if (form.password) {
        payload.password = form.password;
      }
      await UserService.update(userId, payload);
      navigate("/users", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Erro ao salvar."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Editar usuário">
        <div className="text-center py-5 text-muted">Carregando…</div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout title="Editar usuário">
        <div className="alert alert-warning">
          {error}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary ms-2"
            onClick={() => navigate("/users")}
          >
            Voltar
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Editar usuário">
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger py-2 small" role="alert">
                {error}
              </div>
            )}
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="nome" className="form-label">
                Nome
              </label>
              <input
                id="nome"
                type="text"
                className="form-control"
                value={form.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="type" className="form-label">
                Tipo
              </label>
              <select
                id="type"
                className="form-select"
                value={form.type}
                onChange={(e) => handleChange("type", e.target.value)}
                disabled={saving || (!isAdmin && isEditingSelf)}
                title={!isAdmin && isEditingSelf ? "Apenas admin pode alterar o tipo." : undefined}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="form-label">
                Nova senha (deixe em branco para não alterar)
              </label>
              <input
                id="password"
                type="password"
                className="form-control"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="••••••••"
                disabled={saving}
              />
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/users")}
                disabled={saving}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
