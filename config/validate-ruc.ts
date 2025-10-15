export function validateRuc(ruc: unknown): string | null {
  if (typeof ruc !== 'string') {
    return 'RUC must be a string';
  }

  if (!/^\d{13}$/.test(ruc)) {
    return 'RUC must contain exactly 13 numeric digits';
  }

  const thirdDigit = parseInt(ruc[2], 10);
  const lastThree = ruc.slice(10);

  if (lastThree !== '001') {
    return 'RUC must end with 001.';
  }

  if (thirdDigit < 6) {
    return validateCedulaAsNaturalPerson(ruc.slice(0, 10));
  } else if (thirdDigit === 6) {
    return validatePublicCompany(ruc);
  } else if (thirdDigit === 9) {
    return validatePrivateCompany(ruc);
  } else {
    return 'Invalid third digit in RUC';
  }
}

// Natural person (same logic as cédula)
function validateCedulaAsNaturalPerson(cedula: string): string | null {
  const digits = cedula.split('').map(Number);
  const checker = digits.pop()!;
  let total = 0;

  for (let i = 0; i < digits.length; i++) {
    let value = digits[i];
    if (i % 2 === 0) {
      value *= 2;
      if (value > 9) value -= 9;
    }
    total += value;
  }

  const expected = total % 10 === 0 ? 0 : 10 - (total % 10);
  return checker !== expected ? 'Invalid ID within RUC for a natural person' : null;
}

// Public company (third digit = 6)
function validatePublicCompany(ruc: string): string | null {
  const digits = ruc.slice(0, 9).split('').map(Number);
  const checker = parseInt(ruc[8], 10);
  const coefficients = [3, 2, 7, 6, 5, 4, 3, 2];

  let total = 0;
  for (let i = 0; i < coefficients.length; i++) {
    total += digits[i] * coefficients[i];
  }

  const remainder = total % 11;
  const expected = remainder === 0 ? 0 : 11 - remainder;

  return checker !== expected ? 'Invalid RUC for a public company' : null;
}

// Private company (third digit = 9)
function validatePrivateCompany(ruc: string): string | null {
  const digits = ruc.slice(0, 10).split('').map(Number);
  const checker = digits.pop()!;
  const coefficients = [4, 3, 2, 7, 6, 5, 4, 3, 2];

  let total = 0;
  for (let i = 0; i < coefficients.length; i++) {
    total += digits[i] * coefficients[i];
  }

  const remainder = total % 11;
  const expected = remainder === 0 ? 0 : 11 - remainder;

  return checker !== expected ? 'Invalid RUC for a private company' : null;
}