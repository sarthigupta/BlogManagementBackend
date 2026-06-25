import { Hono } from 'hono'
import { serve} from '@hono/node-server'
import authRouter from './modules/auth/auth.routes.js'
import blogRouter from './modules/blogs/blog.routes.js'
import dotenv from 'dotenv'
import redis from './common/lib/redis.js'
import { createRateLimiter } from './middleware/rateLimiter.js'

dotenv.config();
const app = new Hono();
const PORT : number = Number(process.env.PORT) || 3000;

 // 5MB max request size
app.use(createRateLimiter(15 * 60 * 1000, 100)); // 100 requests per 15 minutes

app.get('/',(c) => {
    return c.text('Hello World')
})

app.get('/test', async (c) => {
    await redis.set('test-key', 'Hello from Upstash Redis!');
    const value = await redis.get('test-key');
    return c.text(`Value from Redis: ${value}`);
    
});
app.route('/auth', authRouter);
app.route('/blogs', blogRouter);

serve({
    fetch: app.fetch,
    port: PORT,
})

console.log('Server is running on http://localhost:3000')   