'use client';

import { useState } from 'react';

import type { Usuario } from '@/types/usuarios';

import { UsuariosTable } from './UsuariosTable';
import { UsuarioFormModal } from './UsuarioFormModal';
import { UsuarioPasswordModal } from './UsuarioPasswordModal';

type UsuariosManagerProps = {
  usuarios: Usuario[];
};

export function UsuariosManager({
  usuarios,
}: UsuariosManagerProps) {
  const [formOpen, setFormOpen] =
    useState(false);

  const [passwordOpen, setPasswordOpen] =
    useState(false);

  const [
    usuarioEditando,
    setUsuarioEditando,
  ] = useState<Usuario | null>(null);

  const [
    usuarioPassword,
    setUsuarioPassword,
  ] = useState<Usuario | null>(null);

  function handleCreate() {
    setUsuarioEditando(null);
    setFormOpen(true);
  }

  function handleEdit(
    usuario: Usuario,
  ) {
    setUsuarioEditando(usuario);
    setFormOpen(true);
  }

  function handlePassword(
    usuario: Usuario,
  ) {
    setUsuarioPassword(usuario);
    setPasswordOpen(true);
  }

  function handleCloseForm() {
    setFormOpen(false);
    setUsuarioEditando(null);
  }

  function handleClosePassword() {
    setPasswordOpen(false);
    setUsuarioPassword(null);
  }

  return (
    <>
      <UsuariosTable
        usuarios={usuarios}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onPassword={handlePassword}
      />

      <UsuarioFormModal
        open={formOpen}
        usuario={usuarioEditando}
        onClose={handleCloseForm}
      />

      <UsuarioPasswordModal
        open={passwordOpen}
        usuario={usuarioPassword}
        onClose={handleClosePassword}
      />
    </>
  );
}