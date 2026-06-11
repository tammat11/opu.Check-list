import webpush, { PushSubscription } from "web-push";
import { db } from "./db";

const REMINDER_TYPE = "shift_reminder_5m";

let pushReady = false;

export function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:no-reply@opu.local";

  if (!publicKey || !privateKey) {
    console.warn("Web Push disabled: VAPID keys are missing");
    pushReady = false;
    return;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  pushReady = true;
}

export async function ensureNotificationSchema() {
  await db.query(`
    ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS checklist_id INTEGER REFERENCES active_checklists(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS notification_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP,
    ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb
  `);

  await db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_unique_checklist_type_user
    ON notifications(user_id, checklist_id, notification_type)
    WHERE checklist_id IS NOT NULL AND notification_type IS NOT NULL
  `);
}

function buildSubscription(row: any): PushSubscription {
  return {
    endpoint: row.endpoint,
    keys: {
      auth: row.auth_key,
      p256dh: row.p256dh_key,
    },
  };
}

async function sendPushToUser(userId: number, payload: Record<string, unknown>) {
  if (!pushReady) {
    return { sent: 0, failed: 0, skipped: true as const };
  }

  const result = await db.query(
    `SELECT id, endpoint, auth_key, p256dh_key
     FROM push_subscriptions
     WHERE user_id = $1`,
    [userId]
  );

  let sent = 0;
  let failed = 0;

  for (const row of result.rows) {
    try {
      await webpush.sendNotification(buildSubscription(row), JSON.stringify(payload));
      sent += 1;
    } catch (error: any) {
      failed += 1;

      if (error?.statusCode === 404 || error?.statusCode === 410) {
        await db.query(`DELETE FROM push_subscriptions WHERE id = $1`, [row.id]);
      } else {
        console.error("Push send error:", error);
      }
    }
  }

  return { sent, failed, skipped: false as const };
}

export async function sendBroadcastNotification(title: string, message: string) {
  const users = await db.query(`SELECT DISTINCT user_id FROM push_subscriptions`);

  let totalSent = 0;
  let totalFailed = 0;

  for (const row of users.rows) {
    const payload = {
      title,
      body: message,
      url: "/app/work",
      icon: "/icon.png",
    };

    const result = await sendPushToUser(row.user_id, payload);
    totalSent += result.sent;
    totalFailed += result.failed;

    await db.query(
      `INSERT INTO notifications (user_id, title, message, sent, sent_at, metadata)
       VALUES ($1, $2, $3, $4, CASE WHEN $4 THEN NOW() ELSE NULL END, $5)`,
      [
        row.user_id,
        title,
        message,
        result.sent > 0,
        JSON.stringify({
          source: "manual_broadcast",
          failed: result.failed,
        }),
      ]
    );
  }

  return {
    recipients: users.rows.length,
    sent: totalSent,
    failed: totalFailed,
  };
}

export async function processDueChecklistReminders() {
  const dueSoon = await db.query(
    `SELECT
       ac.id,
       ac.assigned_to,
       ac.due_date,
       ct.name AS template_name,
       obj.name AS object_name
     FROM active_checklists ac
     JOIN checklist_templates ct ON ct.id = ac.template_id
     JOIN objects obj ON obj.id = ac.object_id
     WHERE ac.status IN ('pending', 'in_progress')
       AND ac.due_date IS NOT NULL
       AND ac.due_date BETWEEN NOW() + INTERVAL '4 minutes' AND NOW() + INTERVAL '6 minutes'
       AND NOT EXISTS (
         SELECT 1
         FROM notifications n
         WHERE n.user_id = ac.assigned_to
           AND n.checklist_id = ac.id
           AND n.notification_type = $1
           AND n.sent = TRUE
       )`,
    [REMINDER_TYPE]
  );

  for (const row of dueSoon.rows) {
    const title = "Через 5 минут уборка";
    const message = `${row.object_name}: ${row.template_name} начинается в ${new Date(
      row.due_date
    ).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;

    const payload = {
      title,
      body: message,
      url: "/app/work",
      icon: "/icon.png",
      checklistId: row.id,
      type: REMINDER_TYPE,
    };

    const pushResult = await sendPushToUser(row.assigned_to, payload);

    await db.query(
      `INSERT INTO notifications (
         user_id,
         checklist_id,
         title,
         message,
         notification_type,
         scheduled_for,
         sent,
         sent_at,
         metadata
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, CASE WHEN $7 THEN NOW() ELSE NULL END, $8)
       ON CONFLICT (user_id, checklist_id, notification_type)
       DO UPDATE SET
         title = EXCLUDED.title,
         message = EXCLUDED.message,
         scheduled_for = EXCLUDED.scheduled_for,
         sent = EXCLUDED.sent,
         sent_at = CASE WHEN EXCLUDED.sent THEN NOW() ELSE notifications.sent_at END,
         metadata = EXCLUDED.metadata`,
      [
        row.assigned_to,
        row.id,
        title,
        message,
        REMINDER_TYPE,
        row.due_date,
        pushResult.sent > 0,
        JSON.stringify({
          source: "auto_scheduler",
          failed: pushResult.failed,
          skipped: pushResult.skipped,
        }),
      ]
    );
  }

  return dueSoon.rows.length;
}

export function startReminderScheduler() {
  const run = async () => {
    try {
      const count = await processDueChecklistReminders();
      if (count > 0) {
        console.log(`Auto reminders processed: ${count}`);
      }
    } catch (error) {
      console.error("Reminder scheduler error:", error);
    }
  };

  void run();
  return setInterval(run, 60_000);
}
