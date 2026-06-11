import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { db } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

export interface AuthPayload {
  id: number;
  phone: string;
  role: string;
}

export async function findUserByPhoneAndIIN(phone: string, iin: string) {
  const result = await db.query(
    "SELECT * FROM users WHERE phone = $1 AND iin = $2",
    [phone, iin]
  );
  return result.rows[0];
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

export function generateToken(user: AuthPayload): string {
  return jwt.sign(
    {
      id: user.id,
      phone: user.phone,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export async function getBrowserFingerprint(fingerprintHash: string) {
  const result = await db.query(
    "SELECT * FROM browser_fingerprints WHERE fingerprint_hash = $1",
    [fingerprintHash]
  );
  return result.rows[0];
}

export async function saveBrowserFingerprint(
  userId: number,
  fingerprintHash: string,
  deviceName?: string
) {
  await db.query(
    "INSERT INTO browser_fingerprints (user_id, fingerprint_hash, device_name, last_used) VALUES ($1, $2, $3, NOW()) ON CONFLICT (fingerprint_hash) DO UPDATE SET last_used = NOW()",
    [userId, fingerprintHash, deviceName]
  );
}

export async function createApprovalRequest(
  requestedFromId: number,
  requestType: string,
  userData: any,
  requestedById?: number
) {
  const result = await db.query(
    "INSERT INTO approval_requests (requested_from_id, requested_by_id, request_type, user_data) VALUES ($1, $2, $3, $4) RETURNING *",
    [requestedFromId, requestedById || null, requestType, JSON.stringify(userData)]
  );
  return result.rows[0];
}

export async function getApprovalRequests(userId: number, status = "pending") {
  const result = await db.query(
    "SELECT * FROM approval_requests WHERE requested_from_id = $1 AND status = $2 ORDER BY created_at DESC",
    [userId, status]
  );
  return result.rows;
}

export async function approveRequest(
  requestId: number,
  userData?: any
): Promise<any> {
  const request = await db.query(
    "SELECT * FROM approval_requests WHERE id = $1",
    [requestId]
  );

  if (!request.rows[0]) {
    throw new Error("Request not found");
  }

  const req = request.rows[0];
  const finalData = userData || req.user_data;

  if (req.request_type === "new_user") {
    // Create new user
    const result = await db.query(
      "INSERT INTO users (phone, iin, name, role, parent_id, status) VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *",
      [
        finalData.phone,
        finalData.iin,
        finalData.name,
        "cleaner",
        req.requested_from_id,
      ]
    );

    // Mark request as approved
    await db.query(
      "UPDATE approval_requests SET status = 'approved', responded_at = NOW() WHERE id = $1",
      [requestId]
    );

    return result.rows[0];
  }

  return null;
}

export async function rejectRequest(requestId: number, reason: string) {
  await db.query(
    "UPDATE approval_requests SET status = 'rejected', rejection_reason = $1, responded_at = NOW() WHERE id = $2",
    [reason, requestId]
  );
}
