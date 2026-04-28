(async () => {
  const fetch = global.fetch || (await import('node-fetch')).default;
  const base = 'http://localhost:5000';
  console.log('Logging in...');
  const res = await fetch(base + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test+auth@example.com', password: 'password123' }),
  });
  console.log('Status', res.status);
  console.log('Set-Cookie:', res.headers.get('set-cookie'));
  const data = await res.text();
  console.log('Body:', data);

  console.log('\nCalling refresh with cookie...');
  const setCookie = res.headers.get('set-cookie');
  const cookie = setCookie ? setCookie.split(';')[0] : '';
  const res2 = await fetch(base + '/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
  });
  console.log('Refresh status', res2.status);
  console.log('Refresh Set-Cookie:', res2.headers.get('set-cookie'));
  console.log('Refresh body:', await res2.text());

  console.log('\nLogging out...');
  const cookie2 = res2.headers.get('set-cookie') ? res2.headers.get('set-cookie').split(';')[0] : cookie;
  const res3 = await fetch(base + '/api/auth/logout', {
    method: 'POST',
    headers: { Cookie: cookie2 },
  });
  console.log('Logout status', res3.status);
  console.log('Logout body', await res3.text());
})();
