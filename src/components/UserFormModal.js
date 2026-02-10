import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const TYPES = ["admin", "user"];

export default function UserFormModal({
  show,
  onClose,
  onSave,
  saving,
  title = "Usuário",
}) {
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [type, setType] = useState("user");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const reset = () => {
    setEmail("");
    setNome("");
    setType("user");
    setPassword("");
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Informe o e-mail.");
      return;
    }
    if (!password) {
      setError("Informe a senha.");
      return;
    }
    try {
      await onSave({ email: email.trim(), nome: nome.trim(), type, password });
      handleClose();
    } catch (err) {
      setError(err.message || "Erro ao salvar.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              {error}
            </div>
          )}
          <Form.Group className="mb-3">
            <Form.Label>E-mail</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              disabled={saving}
              autoComplete="email"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nome</Form.Label>
            <Form.Control
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome completo"
              disabled={saving}
              autoComplete="name"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Tipo</Form.Label>
            <Form.Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={saving}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-0">
            <Form.Label>Senha</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={saving}
              autoComplete="new-password"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
