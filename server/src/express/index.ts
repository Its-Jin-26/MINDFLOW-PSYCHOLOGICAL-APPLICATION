import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const prisma = new PrismaClient();

// CORS: permitir orígenes configurados o, si falla, cualquier origen (para frontend en Vercel/Render)
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Helpers ------------------------------------------------------
function signAccessToken(userId: string) {
  const secret = (process.env.JWT_SECRET || 'dev_secret') as jwt.Secret;
  const expiresIn: jwt.SignOptions['expiresIn'] = (process.env.JWT_EXPIRES_IN as unknown as jwt.SignOptions['expiresIn']) || '15m';
  const options: jwt.SignOptions = { expiresIn };
  return jwt.sign({ sub: userId }, secret, options);
}

function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, (process.env.JWT_SECRET || 'dev_secret') as jwt.Secret) as { sub: string };
    (req as any).userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// Auth routes --------------------------------------------------
// Note: Por simplicidad, usamos un campo único "email" para correo o teléfono (string).
app.post('/auth/register', async (req, res) => {
  try {
    const { name, identifier, password } = req.body as { name?: string; identifier?: string; password?: string };
    if (!name || !identifier || !password) return res.status(400).json({ error: 'Faltan campos' });

    const existing = await prisma.user.findUnique({ where: { email: identifier } });
    if (existing) return res.status(409).json({ error: 'Usuario ya existe' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email: identifier, passwordHash, displayName: name } });
    const token = signAccessToken(user.id);
    return res.status(201).json({ token, user: { id: user.id, name: user.displayName, identifier: user.email } });
  } catch (e) {
    return res.status(500).json({ error: 'Error en registro' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body as { identifier?: string; password?: string };
    if (!identifier || !password) return res.status(400).json({ error: 'Faltan credenciales' });

    const user = await prisma.user.findUnique({ where: { email: identifier } });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = signAccessToken(user.id);
    return res.json({ token, user: { id: user.id, name: user.displayName, identifier: user.email } });
  } catch (e) {
    return res.status(500).json({ error: 'Error en login' });
  }
});

app.get('/auth/me', authMiddleware, async (req, res) => {
  const userId = (req as any).userId as string;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, displayName: true } });
  if (!user) return res.status(404).json({ error: 'No encontrado' });
  return res.json({ id: user.id, name: user.displayName, identifier: user.email });
});

// User settings -------------------------------------------------
app.put('/user', authMiddleware, async (req, res) => {
  const userId = (req as any).userId as string;
  const { name, identifier } = req.body as { name?: string | null; identifier?: string | null };
  try {
    if (identifier) {
      const existing = await prisma.user.findUnique({ where: { email: identifier } });
      if (existing && existing.id !== userId) return res.status(409).json({ error: 'Email/identificador ya está en uso' });
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data: { displayName: name ?? undefined, email: identifier ?? undefined },
      select: { id: true, email: true, displayName: true },
    });
    return res.json({ id: user.id, name: user.displayName, identifier: user.email });
  } catch {
    return res.status(500).json({ error: 'No se pudo actualizar el usuario' });
  }
});

app.post('/user/reset', authMiddleware, async (req, res) => {
  const userId = (req as any).userId as string;
  try {
    await prisma.habitLog.deleteMany({ where: { habit: { userId } } });
    await prisma.habit.deleteMany({ where: { userId } });
    await prisma.mood.deleteMany({ where: { userId } });
    await prisma.goal.deleteMany({ where: { userId } });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'No se pudo resetear el progreso' });
  }
});

app.delete('/user', authMiddleware, async (req, res) => {
  const userId = (req as any).userId as string;
  try {
    await prisma.habitLog.deleteMany({ where: { habit: { userId } } });
    await prisma.habit.deleteMany({ where: { userId } });
    await prisma.mood.deleteMany({ where: { userId } });
    await prisma.goal.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'No se pudo eliminar la cuenta' });
  }
});

// Mood endpoints -----------------------------------------------
app.post('/moods', authMiddleware, async (req, res) => {
  const userId = (req as any).userId as string;
  const { type, note } = req.body as { type?: string; note?: string | null };
  if (!type) return res.status(400).json({ error: 'Tipo requerido' });
  try {
    const mood = await prisma.mood.create({ data: { userId, type, note: note ?? null } });
    return res.status(201).json({ id: mood.id, type: mood.type, note: mood.note, date: mood.date });
  } catch {
    return res.status(500).json({ error: 'No se pudo guardar el estado de ánimo' });
  }
});

app.get('/moods/latest', authMiddleware, async (req, res) => {
  const userId = (req as any).userId as string;
  const mood = await prisma.mood.findFirst({ where: { userId }, orderBy: { date: 'desc' } });
  if (!mood) return res.json(null);
  return res.json({ id: mood.id, type: mood.type, note: mood.note, date: mood.date });
});

// Habits endpoints ---------------------------------------------
app.get('/habits', authMiddleware, async (req, res) => {
  const userId = (req as any).userId as string;
  const habits = await prisma.habit.findMany({ where: { userId, archived: false }, orderBy: { createdAt: 'desc' } });
  return res.json(habits.map(h => ({ id: h.id, title: h.title, createdAt: h.createdAt })));
});

app.post('/habits', authMiddleware, async (req, res) => {
  const userId = (req as any).userId as string;
  const { title } = req.body as { title?: string };
  if (!title || !title.trim()) return res.status(400).json({ error: 'Título requerido' });
  try {
    const habit = await prisma.habit.create({ data: { userId, title: title.trim() } });
    return res.status(201).json({ id: habit.id, title: habit.title, createdAt: habit.createdAt });
  } catch {
    return res.status(500).json({ error: 'No se pudo crear el hábito' });
  }
});

app.delete('/habits/:id', authMiddleware, async (req, res) => {
  const userId = (req as any).userId as string;
  const { id } = req.params;
  try {
    const h = await prisma.habit.findUnique({ where: { id } });
    if (!h || h.userId !== userId) return res.status(404).json({ error: 'No encontrado' });
    await prisma.habitLog.deleteMany({ where: { habitId: id } });
    await prisma.habit.delete({ where: { id } });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'No se pudo eliminar el hábito' });
  }
});

// Habit check-ins (today) --------------------------------------
app.get('/habits/today', authMiddleware, async (req, res) => {
  const userId = (req as any).userId as string;
  const start = new Date(); start.setHours(0,0,0,0);
  const end = new Date(); end.setHours(23,59,59,999);
  const habits = await prisma.habit.findMany({ where: { userId, archived: false }, orderBy: { createdAt: 'desc' } });
  const logs = await prisma.habitLog.findMany({ where: { date: { gte: start, lte: end }, habit: { userId }, status: 'DONE' }, select: { habitId: true } });
  const doneSet = new Set(logs.map(l => l.habitId));
  return res.json(habits.map(h => ({ id: h.id, title: h.title, createdAt: h.createdAt, doneToday: doneSet.has(h.id) })));
});

app.post('/habits/:id/checkin', authMiddleware, async (req, res) => {
  const userId = (req as any).userId as string;
  const { id } = req.params;
  const h = await prisma.habit.findUnique({ where: { id } });
  if (!h || h.userId !== userId) return res.status(404).json({ error: 'No encontrado' });
  const start = new Date(); start.setHours(0,0,0,0);
  const end = new Date(); end.setHours(23,59,59,999);
  // Upsert today's DONE log
  const existing = await prisma.habitLog.findFirst({ where: { habitId: id, date: { gte: start, lte: end } } });
  if (existing) {
    await prisma.habitLog.update({ where: { id: existing.id }, data: { status: 'DONE', date: new Date() } });
  } else {
    await prisma.habitLog.create({ data: { habitId: id, status: 'DONE', date: new Date() } });
  }
  return res.json({ ok: true });
});

app.delete('/habits/:id/checkin', authMiddleware, async (req, res) => {
  const userId = (req as any).userId as string;
  const { id } = req.params;
  const h = await prisma.habit.findUnique({ where: { id } });
  if (!h || h.userId !== userId) return res.status(404).json({ error: 'No encontrado' });
  const start = new Date(); start.setHours(0,0,0,0);
  const end = new Date(); end.setHours(23,59,59,999);
  await prisma.habitLog.deleteMany({ where: { habitId: id, date: { gte: start, lte: end }, status: 'DONE' } });
  return res.json({ ok: true });
});

// Goals endpoints ----------------------------------------------
app.get('/goals', authMiddleware, async (req, res) => {
  const userId = (req as any).userId as string;
  const goals = await prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  return res.json(goals.map(g => ({ id: g.id, title: g.title, dueDate: g.dueDate, status: g.status, createdAt: g.createdAt })));
});

app.post('/goals', authMiddleware, async (req, res) => {
  const userId = (req as any).userId as string;
  const { title, dueDate } = req.body as { title?: string; dueDate?: string | null };
  if (!title || !title.trim()) return res.status(400).json({ error: 'Título requerido' });
  try {
    // Parse YYYY-MM-DD as a LOCAL date to avoid timezone shifting one day back
    let due: Date | null = null;
    if (dueDate) {
      const m = String(dueDate).match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m) {
        const y = Number(m[1]);
        const mo = Number(m[2]);
        const d = Number(m[3]);
        due = new Date(y, mo - 1, d); // local midnight
      } else {
        // fallback if not in expected format
        due = new Date(dueDate);
      }
    }
    const goal = await prisma.goal.create({ data: { userId, title: title.trim(), dueDate: due, status: 'OPEN' } });
    return res.status(201).json({ id: goal.id, title: goal.title, dueDate: goal.dueDate, status: goal.status, createdAt: goal.createdAt });
  } catch {
    return res.status(500).json({ error: 'No se pudo crear el objetivo' });
  }
});

app.delete('/goals/:id', authMiddleware, async (req, res) => {
  const userId = (req as any).userId as string;
  const { id } = req.params;
  try {
    const g = await prisma.goal.findUnique({ where: { id } });
    if (!g || g.userId !== userId) return res.status(404).json({ error: 'No encontrado' });
    await prisma.goal.delete({ where: { id } });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'No se pudo eliminar el objetivo' });
  }
});

// Progress endpoint --------------------------------------------
app.get('/progress', authMiddleware, async (req, res) => {
  const userId = (req as any).userId as string;
  // Range last 7 days (including today)
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(start);
    d.setDate(start.getDate() - i);
    days.push(d);
  }

  const totalHabits = await prisma.habit.count({ where: { userId, archived: false } });
  const logs = await prisma.habitLog.findMany({
    where: { habit: { userId }, date: { gte: new Date(days[0]) }, status: 'DONE' },
    select: { date: true },
  });

  // Map YYYY-MM-DD => count of done logs
  const byDay = new Map<string, number>();
  const keyOf = (d: Date) => d.toISOString().slice(0, 10);
  for (const l of logs) {
    const k = keyOf(new Date(l.date));
    byDay.set(k, (byDay.get(k) || 0) + 1);
  }

  // Weekly series as percentage of habits completed per day
  const weeklySeries = days.map((d) => {
    const k = keyOf(d);
    const done = byDay.get(k) || 0;
    if (!totalHabits) return 0;
    const pct = Math.min(100, Math.round((done / totalHabits) * 100));
    return pct;
  });

  // Weekly average
  const weeklyAverage = Math.round(
    weeklySeries.reduce((a, b) => a + b, 0) / (weeklySeries.length || 1),
  );

  // Streak (consecutive days ending today with any DONE log)
  let streakDays = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() - i);
    const k = keyOf(d);
    const has = (byDay.get(k) || 0) > 0;
    if (has) streakDays += 1; else break;
  }

  // Achievements: count goals DONE
  const totalAchievements = await prisma.goal.count({ where: { userId, status: 'DONE' } });

  return res.json({
    streakDays,
    weeklyAverage,
    totalAchievements,
    weeklySeries,
    labels: days.map((d) => d.toLocaleDateString('es-MX', { weekday: 'short' })),
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API (Express) running on http://localhost:${port}`);
});
