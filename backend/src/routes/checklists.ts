import { Router, Request, Response } from "express";
import { db } from "../db";

const router = Router();

// Get all templates
router.get("/templates", async (req: Request, res: Response) => {
  try {
    const templatesResult = await db.query(
      `SELECT * FROM checklist_templates ORDER BY name ASC`
    );

    const templates = await Promise.all(
      templatesResult.rows.map(async (t: any) => {
        const itemsResult = await db.query(
          `SELECT * FROM template_items WHERE template_id = $1 ORDER BY order_index ASC`,
          [t.id]
        );
        return { ...t, items: itemsResult.rows };
      })
    );

    res.json({ templates });
  } catch (error) {
    console.error("Get templates error:", error);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

// Create template (admin/partner)
router.post("/templates", async (req: Request, res: Response) => {
  try {
    const { name, description, items, created_by } = req.body;

    if (!name || !created_by) {
      return res.status(400).json({ error: "Name and created_by required" });
    }

    const templateResult = await db.query(
      `INSERT INTO checklist_templates (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description || null, created_by]
    );

    const template = templateResult.rows[0];

    // Insert items
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        await db.query(
          `INSERT INTO template_items (template_id, title, order_index)
           VALUES ($1, $2, $3)`,
          [template.id, items[i], i]
        );
      }
    }

    // Fetch complete template with items
    const itemsResult = await db.query(
      `SELECT * FROM template_items WHERE template_id = $1 ORDER BY order_index ASC`,
      [template.id]
    );

    res.status(201).json({
      template: { ...template, items: itemsResult.rows },
    });
  } catch (error) {
    console.error("Create template error:", error);
    res.status(500).json({ error: "Failed to create template" });
  }
});

// Assign checklist to object
router.post("/assign", async (req: Request, res: Response) => {
  try {
    const { template_id, object_id, is_default, assigned_by } = req.body;

    if (!template_id || !assigned_by) {
      return res.status(400).json({ error: "template_id and assigned_by required" });
    }

    // is_default = true means applies to all objects (object_id = null)
    const result = await db.query(
      `INSERT INTO checklist_assignments (template_id, object_id, is_default, assigned_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [template_id, object_id || null, is_default || false, assigned_by]
    );

    res.status(201).json({
      assignment: result.rows[0],
    });
  } catch (error) {
    console.error("Assign checklist error:", error);
    res.status(500).json({ error: "Failed to assign checklist" });
  }
});

// Get assignments for an object
router.get("/assignments/:objectId", async (req: Request, res: Response) => {
  try {
    const { objectId } = req.params;

    // Get specific assignment for this object, or default assignment
    const result = await db.query(
      `SELECT ca.*, ct.name as template_name, ct.description
       FROM checklist_assignments ca
       JOIN checklist_templates ct ON ca.template_id = ct.id
       WHERE ca.object_id = $1 OR ca.is_default = true
       ORDER BY ca.object_id DESC`,
      [objectId]
    );

    res.json({ assignments: result.rows });
  } catch (error) {
    console.error("Get assignments error:", error);
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
});

// Get active checklists for cleaner
router.get("/active", async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }

    const result = await db.query(
      `SELECT ac.*, ct.name as template_name, ct.description,
              obj.name as object_name, obj.address
       FROM active_checklists ac
       JOIN checklist_templates ct ON ac.template_id = ct.id
       JOIN objects obj ON ac.object_id = obj.id
       WHERE ac.assigned_to = $1 AND ac.status != 'completed'
       ORDER BY ac.created_at DESC`,
      [userId]
    );

    // Get items and progress for each checklist
    const checklists = await Promise.all(
      result.rows.map(async (checklist: any) => {
        const itemsResult = await db.query(
          `SELECT ti.*, cp.completed, cp.completed_at
           FROM template_items ti
           LEFT JOIN checklist_progress cp ON ti.id = cp.item_id AND cp.checklist_id = $1
           WHERE ti.template_id = $2
           ORDER BY ti.order_index ASC`,
          [checklist.id, checklist.template_id]
        );

        const items = itemsResult.rows;
        const completed = items.filter((i: any) => i.completed).length;
        const progress = Math.round((completed / items.length) * 100) || 0;

        return {
          ...checklist,
          items,
          progress,
          completed_count: completed,
          total_count: items.length,
        };
      })
    );

    res.json({ checklists });
  } catch (error) {
    console.error("Get active checklists error:", error);
    res.status(500).json({ error: "Failed to fetch checklists" });
  }
});

// Assign checklist to cleaner
router.post("/assign-to-cleaner", async (req: Request, res: Response) => {
  try {
    const { template_id, object_id, assigned_to, assigned_by, due_date } =
      req.body;

    if (!template_id || !object_id || !assigned_to || !assigned_by) {
      return res.status(400).json({
        error: "template_id, object_id, assigned_to, and assigned_by required",
      });
    }

    const result = await db.query(
      `INSERT INTO active_checklists (template_id, object_id, assigned_to, assigned_by, due_date, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [template_id, object_id, assigned_to, assigned_by, due_date || null]
    );

    res.status(201).json({ checklist: result.rows[0] });
  } catch (error) {
    console.error("Assign to cleaner error:", error);
    res.status(500).json({ error: "Failed to assign checklist" });
  }
});

// Update checklist item progress
router.post("/:checklistId/items/:itemId", async (req: Request, res: Response) => {
  try {
    const { checklistId, itemId } = req.params;
    const { completed } = req.body;

    const existingResult = await db.query(
      `SELECT * FROM checklist_progress
       WHERE checklist_id = $1 AND item_id = $2`,
      [checklistId, itemId]
    );

    if (existingResult.rows[0]) {
      await db.query(
        `UPDATE checklist_progress
         SET completed = $1, completed_at = $2, updated_at = NOW()
         WHERE checklist_id = $3 AND item_id = $4`,
        [
          completed,
          completed ? new Date() : null,
          checklistId,
          itemId,
        ]
      );
    } else {
      await db.query(
        `INSERT INTO checklist_progress (checklist_id, item_id, completed, completed_at)
         VALUES ($1, $2, $3, $4)`,
        [checklistId, itemId, completed, completed ? new Date() : null]
      );
    }

    res.json({ message: "Progress updated" });
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({ error: "Failed to update progress" });
  }
});

// Complete checklist
router.post("/:id/complete", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const result = await db.query(
      `UPDATE active_checklists
       SET status = 'completed', completed_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: "Checklist not found" });
    }

    res.json({
      message: "Checklist completed",
      checklist: result.rows[0],
    });
  } catch (error) {
    console.error("Complete checklist error:", error);
    res.status(500).json({ error: "Failed to complete checklist" });
  }
});

export default router;
