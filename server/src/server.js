import { loadEnv } from './config/env.js';
import { createSupabaseClient } from './services/db.js';
import { createApp } from './app.js';

const env = loadEnv();
const app = createApp({ db: createSupabaseClient(env), env });
app.listen(env.PORT, () => console.log(`API listening on port ${env.PORT}`));
