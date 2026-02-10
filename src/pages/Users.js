import React, { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserService from "../services/UserService";
import Layout from "../components/Layout";
import UserFormModal from "../components/UserFormModal";

export default function Users() {
  const { user: currentUser, isAdmin } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await UserService.list();
      setList(Array.isArray(data) ? data : data?.users ?? []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Erro ao carregar usuários."
      );
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreate = async (payload) => {
    setSaving(true);
    try {
      await UserService.create(payload);
      setShowCreateModal(false);
      loadUsers();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Erro ao cadastrar.";
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Excluir o usuário "${name}"?`)) return;
    try {
      await UserService.delete(id);
      loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Erro ao excluir."
      );
    }
  };

  return (
    <Layout title="Usuários">
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            aria-label="Fechar"
            onClick={() => setError("")}
          />
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted">
          {list.length} usuário(s)
        </span>
        {isAdmin && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Novo usuário
          </button>
        )}
      </div>

      <div className="card border-0 shadow-sm">
        {loading ? (
          <div className="card-body text-center py-5 text-muted">
            Carregando…
          </div>
        ) : list.length === 0 ? (
          <div className="card-body text-center py-5 text-muted">
            Nenhum usuário cadastrado.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Tipo</th>
                  <th width="120" className="text-end">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((user) => {
                  const canEdit =
                    isAdmin || String(user.id) === String(currentUser?.id);
                  const canDelete = isAdmin;
                  return (
                    <tr key={user.id}>
                      <td>{user.nome || user.name || "—"}</td>
                      <td>{user.email || "—"}</td>
                      <td>{user.type || "—"}</td>
                      <td className="text-end">
                        {canEdit && (
                          <Link
                            to={`/users/${user.id}`}
                            className="btn btn-sm btn-outline-primary me-1"
                          >
                            Editar
                          </Link>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleDelete(
                                user.id,
                                user.nome || user.name || user.email
                              )
                            }
                          >
                            Excluir
                          </button>
                        )}
                        {!canEdit && !canDelete && (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserFormModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreate}
        saving={saving}
        title="Novo usuário"
      />
    </Layout>
  );
}
