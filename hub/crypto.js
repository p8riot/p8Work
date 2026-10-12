(function (global) {
  "use strict";
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  function bytesToBase64(bytes) {
    let binary = "";
    const chunk = 0x8000;
    for (let i=0;i<bytes.length;i+=chunk) binary += String.fromCharCode.apply(null, bytes.subarray(i, i+chunk));
    return btoa(binary);
  }
  function base64ToBytes(text) {
    const binary = atob(text);
    const bytes = new Uint8Array(binary.length);
    for (let i=0;i<binary.length;i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  function canonical(value) {
    if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
    if (value && typeof value === 'object') {
      return '{' + Object.keys(value).sort().map(k => JSON.stringify(k)+':'+canonical(value[k])).join(',') + '}';
    }
    return JSON.stringify(value);
  }
  async function sha256Text(text) {
    const hash = await crypto.subtle.digest('SHA-256', enc.encode(text));
    return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  async function deriveKey(password, salt, iterations) {
    const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations}, base, {name:'AES-GCM',length:256}, false, ['encrypt','decrypt']);
  }
  async function encryptJson(value, password) {
    if (!global.isSecureContext || !crypto.subtle) throw new Error('Encrypted backups require a secure browser context.');
    const iterations = 250000;
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt, iterations);
    const plaintext = enc.encode(JSON.stringify(value));
    const ciphertext = new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv}, key, plaintext));
    return {
      type: 'p8work-master-backup-encrypted', formatVersion: 1,
      crypto: { cipher:'AES-GCM-256', kdf:'PBKDF2-SHA-256', iterations, salt:bytesToBase64(salt), iv:bytesToBase64(iv) },
      ciphertext: bytesToBase64(ciphertext)
    };
  }
  async function decryptJson(envelope, password) {
    const c = envelope && envelope.crypto;
    if (!c || c.cipher !== 'AES-GCM-256' || c.kdf !== 'PBKDF2-SHA-256') throw new Error('Unsupported encrypted backup format.');
    try {
      const key = await deriveKey(password, base64ToBytes(c.salt), Number(c.iterations));
      const plain = await crypto.subtle.decrypt({name:'AES-GCM',iv:base64ToBytes(c.iv)}, key, base64ToBytes(envelope.ciphertext));
      return JSON.parse(dec.decode(plain));
    } catch (_) { throw new Error('Could not decrypt this backup. The password may be incorrect or the file may be damaged.'); }
  }

  global.P8WORK_CRYPTO = Object.freeze({ canonical, sha256Text, encryptJson, decryptJson });
}(window));
