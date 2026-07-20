import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  normalizeRecoveryEmail,
  validateNewPassword,
} from "../lib/auth/password-reset";

test("normalizes a valid recovery email", () => {
  assert.equal(normalizeRecoveryEmail("  SZILTEC@gmail.com "), "sziltec@gmail.com");
  assert.equal(normalizeRecoveryEmail("not-an-email"), null);
});

test("requires a strong matching replacement password", () => {
  assert.deepEqual(validateNewPassword("short", "short"), {
    valid: false,
    error: "La contraseña debe tener al menos 12 caracteres.",
  });
  assert.deepEqual(validateNewPassword("UnaClaveSegura!2026", "otra"), {
    valid: false,
    error: "Las contraseñas no coinciden.",
  });
  assert.deepEqual(
    validateNewPassword("UnaClaveSegura!2026", "UnaClaveSegura!2026"),
    { valid: true },
  );
});
