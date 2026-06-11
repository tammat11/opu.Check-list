import { Router, Request, Response } from "express";
import { db } from "../server";

const router = Router();

// Get all objects (admin/partner/curator)
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT o.*, u.name as partner_name
       FROM objects o
       LEFT JOIN users u ON o.partner_id = u.id
       ORDER BY o.name ASC`
    );
    res.json({ objects: result.rows });
  } catch (error) {
    console.error("Get objects error:", error);
    res.status(500).json({ error: "Failed to fetch objects" });
  }
});

// Get object by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT o.*, u.name as partner_name
       FROM objects o
       LEFT JOIN users u ON o.partner_id = u.id
       WHERE o.id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: "Object not found" });
    }

    res.json({ object: result.rows[0] });
  } catch (error) {
    console.error("Get object error:", error);
    res.status(500).json({ error: "Failed to fetch object" });
  }
});

// Create object (admin only)
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, address, city, partner_id, created_by } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name required" });
    }

    const result = await db.query(
      `INSERT INTO objects (name, address, city, partner_id, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, address, city, partner_id || null, created_by]
    );

    res.status(201).json({ object: result.rows[0] });
  } catch (error) {
    console.error("Create object error:", error);
    res.status(500).json({ error: "Failed to create object" });
  }
});

// Update object
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, address, city, partner_id } = req.body;

    const result = await db.query(
      `UPDATE objects
       SET name = COALESCE($2, name),
           address = COALESCE($3, address),
           city = COALESCE($4, city),
           partner_id = COALESCE($5, partner_id),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, name, address, city, partner_id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: "Object not found" });
    }

    res.json({ object: result.rows[0] });
  } catch (error) {
    console.error("Update object error:", error);
    res.status(500).json({ error: "Failed to update object" });
  }
});

// Delete object
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM objects WHERE id = $1 RETURNING id",
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: "Object not found" });
    }

    res.json({ message: "Object deleted" });
  } catch (error) {
    console.error("Delete object error:", error);
    res.status(500).json({ error: "Failed to delete object" });
  }
});

export default router;
