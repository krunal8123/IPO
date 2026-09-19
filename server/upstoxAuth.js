import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_PATH = path.join(__dirname, '../.env');

/**
 * Base32 decode to hex string
 */
function base32toHex(base32) {
  const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  let hex = '';
  const cleaned = (base32 || '').replace(/[\s-=]/g, '').toUpperCase().replace(/[^A-Z2-7]/g, '');
  for (let i = 0; i < cleaned.length; i++) {
    const val = base32chars.indexOf(cleaned.charAt(i));
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  for (let i = 0; i + 4 <= bits.length; i += 4) {
    const chunk = bits.substr(i, 4);
    hex += parseInt(chunk, 2).toString(16);
  }
  return hex;
}

/**
 * Generate 6-digit TOTP code (RFC 6238 HMAC-SHA1)
 */
export function generateTotp(secret) {
  if (!secret) return '';
  const epoch = Math.floor(Date.now() / 1000);
  const timeHex = Math.floor(epoch / 30).toString(16).padStart(16, '0');
  const secretHex = base32toHex(secret);
  const key = Buffer.from(secretHex, 'hex');
  const msg = Buffer.from(timeHex, 'hex');
  const hmac = crypto.createHmac('sha1', key).update(msg).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = ((hmac[offset] & 0x7f) << 24) |
               ((hmac[offset + 1] & 0xff) << 16) |
               ((hmac[offset + 2] & 0xff) << 8) |
               (hmac[offset + 3] & 0xff);
  return (code % 1000000).toString().padStart(6, '0');
}

/**
 * Load environment variables from process.env and local .env file
 */
function loadCredentials() {
  const creds = {
    apiKey: process.env.UPSTOX_API_KEY || '',
    pin: process.env.UPSTOX_PIN || '',
    totpSecret: process.env.UPSTOX_TOTP_SECRET || '',
    accessToken: process.env.UPSTOX_ACCESS_TOKEN || ''
  };

  if (fs.existsSync(ENV_PATH)) {
    try {
      const lines = fs.readFileSync(ENV_PATH, 'utf-8').split('\n');
      lines.forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          let value = (match[2] || '').trim();
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          if (match[1] === 'UPSTOX_API_KEY' && !creds.apiKey) creds.apiKey = value;
          if (match[1] === 'UPSTOX_PIN' && !creds.pin) creds.pin = value;
          if (match[1] === 'UPSTOX_TOTP_SECRET' && !creds.totpSecret) creds.totpSecret = value;
          if (match[1] === 'UPSTOX_ACCESS_TOKEN' && !creds.accessToken) creds.accessToken = value;
        }
      });
    } catch (e) {
      console.warn('[UpstoxAuth] Could not read .env file:', e.message);
    }
  }

  return creds;
}

/**
 * Persist fresh token to .env locally if .env exists
 */
function persistTokenLocally(token) {
  try {
    if (fs.existsSync(ENV_PATH)) {
      let content = fs.readFileSync(ENV_PATH, 'utf-8');
      if (content.includes('UPSTOX_ACCESS_TOKEN=')) {
        content = content.replace(/UPSTOX_ACCESS_TOKEN=.*/, `UPSTOX_ACCESS_TOKEN=${token}`);
      } else {
        content += `\nUPSTOX_ACCESS_TOKEN=${token}`;
      }
      fs.writeFileSync(ENV_PATH, content, 'utf-8');
    }
  } catch (e) {
    // Non-fatal if read-only filesystem
  }
}

/**
 * Authenticate with Upstox via official TOTP-login endpoint:
 * POST https://api.upstox.com/v2/totp-login/authorization/token
 */
export async function getFreshUpstoxToken() {
  const creds = loadCredentials();

  // If TOTP credentials are available, generate fresh token
  if (creds.apiKey && creds.pin && creds.totpSecret) {
    console.log('🔐 [Upstox Auth] Attempting 100% automated TOTP login with Upstox API...');
    try {
      const totpCode = generateTotp(creds.totpSecret);
      console.log(`🔑 [Upstox Auth] Generated TOTP code (length ${totpCode.length}) for API key: ${creds.apiKey.substring(0, 8)}...`);

      const response = await fetch('https://api.upstox.com/v2/totp-login/authorization/token', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'x-api-key': creds.apiKey
        },
        body: JSON.stringify({
          totp: totpCode,
          pin: creds.pin
        })
      });

      const json = await response.json().catch(() => null);

      if (response.ok && json && json.access_token) {
        const freshToken = json.access_token;
        console.log(`✅ [Upstox Auth] Successfully obtained fresh daily access_token for user: ${json.user_name || json.user_id || 'Upstox User'}`);
        persistTokenLocally(freshToken);

        // Also save to public/data/upstox_token.json for client-side consumption
        const publicDataDir = path.resolve(__dirname, '../public/data');
        if (!fs.existsSync(publicDataDir)) {
          fs.mkdirSync(publicDataDir, { recursive: true });
        }
        fs.writeFileSync(
          path.join(publicDataDir, 'upstox_token.json'),
          JSON.stringify({
            access_token: freshToken,
            generated_at: new Date().toISOString(),
            expires_at: json.expires_at || null,
            user_name: json.user_name || 'Upstox User'
          }, null, 2),
          'utf8'
        );

        return freshToken;
      } else {
        const errMsg = json?.message || json?.error || JSON.stringify(json) || `HTTP ${response.status}`;
        console.warn(`⚠️ [Upstox Auth] TOTP login response not OK: ${errMsg}`);
      }
    } catch (err) {
      console.warn(`⚠️ [Upstox Auth] Error during TOTP login: ${err.message}`);
    }
  } else {
    console.log('ℹ️ [Upstox Auth] TOTP credentials (UPSTOX_PIN / UPSTOX_TOTP_SECRET) not provided. Checking UPSTOX_ACCESS_TOKEN...');
  }

  // Fallback to static UPSTOX_ACCESS_TOKEN if provided
  if (creds.accessToken) {
    console.log('🔑 [Upstox Auth] Using provided UPSTOX_ACCESS_TOKEN');
    // Save to public/data/upstox_token.json so client can also use it
    try {
      const publicDataDir = path.resolve(__dirname, '../public/data');
      if (!fs.existsSync(publicDataDir)) {
        fs.mkdirSync(publicDataDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(publicDataDir, 'upstox_token.json'),
        JSON.stringify({
          access_token: creds.accessToken,
          generated_at: new Date().toISOString(),
          fallback: true
        }, null, 2),
        'utf8'
      );
    } catch (e) {
      // Non-fatal
    }
    return creds.accessToken;
  }

  console.warn('⚠️ [Upstox Auth] No Upstox credentials found. Proceeding without authenticated Upstox token.');
  return null;
}
