import { Hono } from 'hono'
import { serve} from '@hono/node-server'
import authRouter from './modules/auth/auth.routes.js'
import dotenv from 'dotenv'
dotenv.config();
const app = new Hono();
const PORT : number = Number(process.env.PORT) || 3000;

app.get('/',(c) => {
    return c.text('Hello World')
})
app.route('/auth', authRouter);

serve({
    fetch: app.fetch,
    port: PORT,
})

console.log('Server is running on http://localhost:3000')   