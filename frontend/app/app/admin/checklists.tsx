"use client";

import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const authConfig = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

interface Template {
  id: number;
  name: string;
  description: string;
  items: { id: number; title: string; order_index: number }[];
}

interface Object {
  id: number;
  name: string;
  address: string;
  city: string;
}

export function ChecklistsManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [objects, setObjects] = useState<Object[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    items: ["", "", ""],
  });
  const [assignForm, setAssignForm] = useState({
    template_id: "",
    object_id: "",
    is_default: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [templatesRes, objectsRes] = await Promise.all([
        axios.get(`${API_BASE}/checklists/templates`, authConfig()),
        axios.get(`${API_BASE}/objects`, authConfig()),
      ]);
      setTemplates(templatesRes.data.templates);
      setObjects(objectsRes.data.objects);
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/checklists/templates`, {
        ...newTemplate,
        items: newTemplate.items.filter((i) => i.trim()),
        created_by: 1, // Replace with actual user ID
      }, authConfig());
      setTemplates([...templates, res.data.template]);
      setNewTemplate({ name: "", description: "", items: ["", "", ""] });
      setShowCreateTemplate(false);
    } catch (error) {
      console.error("Create template error:", error);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/checklists/assign`, {
        ...assignForm,
        template_id: Number(assignForm.template_id),
        object_id: assignForm.is_default ? null : Number(assignForm.object_id),
        assigned_by: 1, // Replace with actual user ID
      }, authConfig());
      setAssignForm({ template_id: "", object_id: "", is_default: false });
      setShowAssign(false);
      alert("✓ Чек-лист назначен!");
    } catch (error) {
      console.error("Assign error:", error);
    }
  };

  if (loading) {
    return (
      <p className="rounded-[22px] border border-black/5 bg-white px-5 py-4 text-sm font-semibold text-brand-dark/45 shadow-premium">
        Загрузка шаблонов...
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Templates */}
      <div className="bg-white rounded-[28px] p-5 shadow-premium border border-black/5">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-dark/35">
              Конструктор
            </p>
            <h3 className="mt-1 text-2xl font-black text-brand-dark">Шаблоны чек-листов</h3>
          </div>
          <button
            onClick={() => setShowCreateTemplate(!showCreateTemplate)}
            className="min-h-[48px] rounded-[18px] bg-brand-green px-5 text-sm font-black uppercase tracking-[0.16em] text-brand-dark shadow-button transition hover:bg-brand-dark hover:text-white"
          >
            {showCreateTemplate ? "Отмена" : "+ Создать шаблон"}
          </button>
        </div>

        {showCreateTemplate && (
          <form onSubmit={handleCreateTemplate} className="mb-6 rounded-[24px] border border-black/5 bg-[#fbfcf8] p-5">
            <input
              type="text"
              placeholder="Название шаблона"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              className="mb-3 w-full rounded-[18px] border border-black/8 bg-white px-4 py-3 text-base outline-none transition focus:border-brand-green"
              required
            />
            <textarea
              placeholder="Описание"
              value={newTemplate.description}
              onChange={(e) =>
                setNewTemplate({ ...newTemplate, description: e.target.value })
              }
              className="mb-4 w-full rounded-[18px] border border-black/8 bg-white px-4 py-3 text-base outline-none transition focus:border-brand-green resize-none"
              rows={3}
            />
            <div className="mb-4">
              <label className="block mb-3 text-[11px] font-black uppercase tracking-[0.14em] text-brand-dark/40">
                Задачи:
              </label>
              {newTemplate.items.map((item, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Задача ${idx + 1}`}
                  value={item}
                  onChange={(e) => {
                    const updated = [...newTemplate.items];
                    updated[idx] = e.target.value;
                    setNewTemplate({ ...newTemplate, items: updated });
                  }}
                  className="mb-2 w-full rounded-[18px] border border-black/8 bg-white px-4 py-3 text-base outline-none transition focus:border-brand-green"
                />
              ))}
            </div>
            <button
              type="submit"
              className="min-h-[52px] w-full rounded-[18px] bg-brand-dark text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-brand-green hover:text-brand-dark"
            >
              Создать
            </button>
          </form>
        )}

        <div className="space-y-3">
          {templates.map((template) => (
            <div key={template.id} className="rounded-[22px] border border-black/6 bg-[#fbfcf8] p-4">
              <h4 className="text-lg font-black text-brand-dark">{template.name}</h4>
              <p className="mb-3 mt-1 text-sm text-brand-dark/45">{template.description}</p>
              <ul className="space-y-1 text-sm text-brand-dark/75">
                {template.items.map((item) => (
                  <li key={item.id}>• {item.title}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Assignments */}
      <div className="bg-white rounded-[28px] p-5 shadow-premium border border-black/5">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-dark/35">
              Назначения
            </p>
            <h3 className="mt-1 text-2xl font-black text-brand-dark">Назначить чек-листы</h3>
          </div>
          <button
            onClick={() => setShowAssign(!showAssign)}
            className="min-h-[48px] rounded-[18px] bg-brand-green px-5 text-sm font-black uppercase tracking-[0.16em] text-brand-dark shadow-button transition hover:bg-brand-dark hover:text-white"
          >
            {showAssign ? "Отмена" : "+ Назначить"}
          </button>
        </div>

        {showAssign && (
          <form onSubmit={handleAssign} className="mb-6 rounded-[24px] border border-black/5 bg-[#fbfcf8] p-5">
            <select
              value={assignForm.template_id}
              onChange={(e) =>
                setAssignForm({ ...assignForm, template_id: e.target.value })
              }
              className="mb-4 w-full rounded-[18px] border border-black/8 bg-white px-4 py-3 text-base outline-none transition focus:border-brand-green"
              required
            >
              <option value="">-- Выберите шаблон --</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={assignForm.is_default}
                onChange={(e) =>
                  setAssignForm({
                    ...assignForm,
                    is_default: e.target.checked,
                  })
                }
                id="default"
                className="h-5 w-5 accent-brand-green"
              />
              <label htmlFor="default" className="ml-3 text-sm font-semibold text-brand-dark">
                Использовать как стандартный для всех объектов
              </label>
            </div>

            {!assignForm.is_default && (
              <select
                value={assignForm.object_id}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, object_id: e.target.value })
                }
                className="mb-4 w-full rounded-[18px] border border-black/8 bg-white px-4 py-3 text-base outline-none transition focus:border-brand-green"
                required
              >
                <option value="">-- Выберите объект --</option>
                {objects.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.city})
                  </option>
                ))}
              </select>
            )}

            <button
              type="submit"
              className="min-h-[52px] w-full rounded-[18px] bg-brand-dark text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-brand-green hover:text-brand-dark"
            >
              Назначить
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
