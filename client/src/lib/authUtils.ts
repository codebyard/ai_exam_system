export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export function logout(redirect = true) {
  localStorage.removeItem('token');
  // Invalidate user query so UI updates
  import('@/lib/queryClient').then(({ queryClient }) => {
    queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    if (redirect) window.location.href = '/login';
  });
}