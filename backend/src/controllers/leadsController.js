import db from "../db.js";

export class LeadsController {
  // Criar novo lead
  static async create(req, res) {
    try {
      const { name, email, company, message } = req.body;

      // Validação
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          error: "Name and email are required",
        });
      }

      // Validação básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: "Invalid email format",
        });
      }

      const stmt = db.prepare(`
        INSERT INTO leads (name, email, company, message)
        VALUES (?, ?, ?, ?)
      `);

      const result = stmt.run(name, email, company || null, message || null);

      const newLead = db
        .prepare("SELECT * FROM leads WHERE id = ?")
        .get(result.lastInsertRowid);

      return res.status(201).json({
        success: true,
        message: "Lead created successfully",
        data: newLead,
      });
    } catch (error) {
      console.error("Error creating lead:", error);

      if (error.message.includes("UNIQUE constraint")) {
        return res.status(409).json({
          success: false,
          error: "Lead with this email already exists",
        });
      }

      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  // Listar todos os leads
  static async getAll(req, res) {
    try {
      const { status, intent, minScore } = req.query;

      let query = "SELECT * FROM leads WHERE 1=1";
      const params = [];

      if (status) {
        query += " AND status = ?";
        params.push(status);
      }

      if (intent) {
        query += " AND intent = ?";
        params.push(intent);
      }

      if (minScore) {
        query += " AND score >= ?";
        params.push(parseInt(minScore));
      }

      query += " ORDER BY created_at DESC";

      const leads = db.prepare(query).all(...params);

      return res.json({
        success: true,
        count: leads.length,
        data: leads,
      });
    } catch (error) {
      console.error("Error fetching leads:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  // Buscar lead por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get(id);

      if (!lead) {
        return res.status(404).json({
          success: false,
          error: "Lead not found",
        });
      }

      return res.json({
        success: true,
        data: lead,
      });
    } catch (error) {
      console.error("Error fetching lead:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  // Atualizar lead
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email, company, message, score, intent, summary, status } =
        req.body;

      // Verifica se o lead existe
      const existingLead = db
        .prepare("SELECT * FROM leads WHERE id = ?")
        .get(id);
      if (!existingLead) {
        return res.status(404).json({
          success: false,
          error: "Lead not found",
        });
      }

      const stmt = db.prepare(`
        UPDATE leads 
        SET name = ?, email = ?, company = ?, message = ?, 
            score = ?, intent = ?, summary = ?, status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      stmt.run(
        name || existingLead.name,
        email || existingLead.email,
        company || existingLead.company,
        message || existingLead.message,
        score ?? existingLead.score,
        intent || existingLead.intent,
        summary || existingLead.summary,
        status || existingLead.status,
        id,
      );

      const updatedLead = db
        .prepare("SELECT * FROM leads WHERE id = ?")
        .get(id);

      return res.json({
        success: true,
        message: "Lead updated successfully",
        data: updatedLead,
      });
    } catch (error) {
      console.error("Error updating lead:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  // Deletar lead
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const existingLead = db
        .prepare("SELECT * FROM leads WHERE id = ?")
        .get(id);
      if (!existingLead) {
        return res.status(404).json({
          success: false,
          error: "Lead not found",
        });
      }

      db.prepare("DELETE FROM leads WHERE id = ?").run(id);

      return res.json({
        success: true,
        message: "Lead deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting lead:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
}
