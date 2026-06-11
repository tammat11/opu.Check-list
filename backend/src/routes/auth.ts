import { Router, Request, Response } from "express";
import {
  findUserByPhoneAndIIN,
  hashPassword,
  verifyPassword,
  generateToken,
  getBrowserFingerprint,
  saveBrowserFingerprint,
  createApprovalRequest,
  getApprovalRequests,
  approveRequest,
  rejectRequest,
} from "../auth";
import { db } from "../server";

const router = Router();

// Check if user exists by phone and IIN
router.post("/check", async (req: Request, res: Response) => {
  try {
    const { phone, iin } = req.body;

    if (!phone || !iin) {
      return res.status(400).json({ error: "Phone and IIN required" });
    }

    const user = await findUserByPhoneAndIIN(phone, iin);

    if (!user) {
      return res.json({
        exists: false,
        message: "User not found",
      });
    }

    return res.json({
      exists: true,
      role: user.role,
      requiresPassword: !!user.password_hash,
      userId: user.id,
    });
  } catch (error) {
    console.error("Check auth error:", error);
    res.status(500).json({ error: "Check failed" });
  }
});

// Login with password
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { phone, iin, password, browserFingerprint } = req.body;

    if (!phone || !iin || !password) {
      return res.status(400).json({ error: "Phone, IIN, and password required" });
    }

    const user = await findUserByPhoneAndIIN(phone, iin);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const passwordValid = await verifyPassword(password, user.password_hash);

    if (!passwordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Save browser fingerprint if provided
    if (browserFingerprint) {
      await saveBrowserFingerprint(user.id, browserFingerprint);
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
      rememberBrowser: !!browserFingerprint,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Login with remembered browser
router.post("/login-remembered", async (req: Request, res: Response) => {
  try {
    const { browserFingerprint } = req.body;

    if (!browserFingerprint) {
      return res.status(400).json({ error: "Browser fingerprint required" });
    }

    const fingerprint = await getBrowserFingerprint(browserFingerprint);

    if (!fingerprint) {
      return res.status(401).json({ error: "Browser not remembered" });
    }

    const user = await db.query("SELECT * FROM users WHERE id = $1", [
      fingerprint.user_id,
    ]);

    if (!user.rows[0]) {
      return res.status(401).json({ error: "User not found" });
    }

    const token = generateToken(user.rows[0]);

    res.json({
      token,
      user: {
        id: user.rows[0].id,
        phone: user.rows[0].phone,
        name: user.rows[0].name,
        role: user.rows[0].role,
      },
    });
  } catch (error) {
    console.error("Remembered login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Request password reset
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { phone, iin } = req.body;

    if (!phone || !iin) {
      return res.status(400).json({ error: "Phone and IIN required" });
    }

    const user = await findUserByPhoneAndIIN(phone, iin);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create approval request for curator
    const approvalReq = await createApprovalRequest(
      user.parent_id || user.id,
      "password_reset",
      { userId: user.id, phone, iin }
    );

    res.json({
      approvalRequired: true,
      requestId: approvalReq.id,
      message:
        "Password reset request sent to your curator for approval",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Password reset failed" });
  }
});

// Register new user (requires approval)
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { phone, iin, name, selectedCuratorId } = req.body;

    if (!phone || !iin || !name || !selectedCuratorId) {
      return res.status(400).json({ error: "All fields required" });
    }

    // Check if already exists
    const existing = await findUserByPhoneAndIIN(phone, iin);
    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Create approval request
    const approvalReq = await createApprovalRequest(
      selectedCuratorId,
      "new_user",
      { phone, iin, name }
    );

    res.status(201).json({
      requestId: approvalReq.id,
      status: "pending_approval",
      message: "Registration request sent for approval",
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Get approval requests (for curators/partners)
router.get("/approvals", async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    const requests = await getApprovalRequests(Number(userId));

    res.json({ requests });
  } catch (error) {
    console.error("Get approvals error:", error);
    res.status(500).json({ error: "Failed to fetch approvals" });
  }
});

// Approve request
router.post("/approvals/:id/approve", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userData } = req.body;

    const user = await approveRequest(Number(id), userData);

    res.json({
      message: "Request approved",
      user,
    });
  } catch (error) {
    console.error("Approve error:", error);
    res.status(500).json({ error: "Failed to approve request" });
  }
});

// Reject request
router.post("/approvals/:id/reject", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    await rejectRequest(Number(id), reason);

    res.json({
      message: "Request rejected",
    });
  } catch (error) {
    console.error("Reject error:", error);
    res.status(500).json({ error: "Failed to reject request" });
  }
});

// Remember browser
router.post("/remember-browser", async (req: Request, res: Response) => {
  try {
    const { userId, fingerprint, deviceName } = req.body;

    if (!userId || !fingerprint) {
      return res.status(400).json({ error: "User ID and fingerprint required" });
    }

    await saveBrowserFingerprint(userId, fingerprint, deviceName);

    res.json({
      message: "Browser remembered",
    });
  } catch (error) {
    console.error("Remember browser error:", error);
    res.status(500).json({ error: "Failed to remember browser" });
  }
});

export default router;
