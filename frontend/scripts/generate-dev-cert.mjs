import fs from 'node:fs/promises';
import path from 'node:path';
import selfsigned from 'selfsigned';

const certDir = path.resolve('.cert');
const certPath = path.join(certDir, 'localhost.pem');
const keyPath = path.join(certDir, 'localhost-key.pem');

await fs.mkdir(certDir, { recursive: true });

const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, {
  days: 365,
  keySize: 2048,
  algorithm: 'sha256',
  extensions: [
    { name: 'basicConstraints', cA: false },
    { name: 'keyUsage', digitalSignature: true, keyEncipherment: true },
    { name: 'extKeyUsage', serverAuth: true },
    {
      name: 'subjectAltName',
      altNames: [
        { type: 2, value: 'localhost' },
        { type: 7, ip: '127.0.0.1' },
      ],
    },
  ],
});

await fs.writeFile(certPath, pems.cert, 'utf8');
await fs.writeFile(keyPath, pems.private, 'utf8');

console.log(`Dev certificate created:\n- ${certPath}\n- ${keyPath}`);
