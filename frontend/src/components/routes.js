export function getDashboardPath(role) {
  if (role === 'PATIENT') return '/user';
  if (role === 'DOCTOR') return '/doctor';
  if (role === 'ADMIN') return '/admin';
  return '/';
}
