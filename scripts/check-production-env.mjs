import 'dotenv/config';

const required = [
  'APP_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
];

const firebaseCredentialKeys = [
  'GOOGLE_APPLICATION_CREDENTIALS',
  'FIREBASE_SERVICE_ACCOUNT_JSON',
  'FIREBASE_SERVICE_ACCOUNT_BASE64',
];

const optional = [
  'HOTMART_HOTTOK',
  'ADMIN_TOKEN',
  'PORT',
  'NODE_ENV',
];

function statusFor(key) {
  const value = process.env[key];
  if (!value) return 'missing';
  if (['APP_URL', 'GOOGLE_APPLICATION_CREDENTIALS', 'PORT', 'NODE_ENV'].includes(key)) {
    return value;
  }
  return 'set';
}

let hasError = false;

console.log('Required');
for (const key of required) {
  const status = statusFor(key);
  if (status === 'missing') hasError = true;
  console.log(`${key}: ${status}`);
}

console.log('\nFirebase Admin');
const hasFirebaseCredential = firebaseCredentialKeys.some((key) => !!process.env[key]);
for (const key of firebaseCredentialKeys) {
  console.log(`${key}: ${statusFor(key)}`);
}
if (!hasFirebaseCredential) {
  hasError = true;
  console.log('FIREBASE_ADMIN_STATUS: missing');
} else {
  console.log('FIREBASE_ADMIN_STATUS: set');
}

console.log('\nOptional');
for (const key of optional) {
  console.log(`${key}: ${statusFor(key)}`);
}

if (hasError) {
  console.error('\nProduction environment is incomplete.');
  process.exit(1);
}

console.log('\nProduction environment looks ready.');
