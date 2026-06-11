"use client";

import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

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
        axios.get(`${API_BASE}/checklists/templates`),
        axios.get(`${API_BASE}/objects`),
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
      });
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
      });
      setAssignForm({ template_id: "", object_id: "", is_default: false });
      setShowAssign(false);
      alert("✓ Чек-лист назначен!");
    } catch (error) {
      console.error("Assign error:", error);
    }
  };

  if (loading) {
    return <p className="text-gray-600">Загрузка...</p>;
  }

  return (
    <div className="space-y-8">
      {/* Templates */}
      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Шаблоны чек-листов</h3>
          <button
            onClick={() => setShowCreateTemplate(!showCreateTemplate)}
            className="btn-primary"
          >
            {showCreateTemplate ? "Отмена" : "+ Создать шаблон"}
          </button>
        </div>

        {showCreateTemplate && (
          <form onSubmit={handleCreateTemplate} className="mb-8 p-6 bg-gray-50 rounded-lg">
            <input
              type="text"
              placeholder="Название шаблона"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 text-lg"
              required
            />
            <textarea
              placeholder="Описание"
              value={newTemplate.description}
              onChange={(e) =>
                setNewTemplate({ ...newTemplate, description: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 text-lg resize-none"
              rows={3}
            />
            <div className="mb-4">
              <label className="block font-semibold text-gray-900 mb-3">
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-2 text-lg"
                />
              ))}
            </div>
            <button type="submit" className="btn-primary w-full">
              Создать
            </button>
          </form>
        )}

        <div className="space-y-4">
          {templates.map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 text-lg">{template.name}</h4>
              <p className="text-gray-600 mb-3">{template.description}</p>
              <ul className="space-y-1 text-sm text-gray-700">
                {template.items.map((item) => (
                  <li key={item.id}>• {item.title}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Assignments */}
      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Назначить чек-листы</h3>
          <button
            onClick={() => setShowAssign(!showAssign)}
            className="btn-primary"
          >
            {showAssign ? "Отмена" : "+ Назначить"}
          </button>
        </div>

        {showAssign && (
          <form onSubmit={handleAssign} className="mb-8 p-6 bg-gray-50 rounded-lg">
            <select
              value={assignForm.template_id}
              onChange={(e) =>
                setAssignForm({ ...assignForm, template_id: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 text-lg"
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
                className="w-6 h-6 accent-blue-600"
              />
              <label htmlFor="default" className="ml-3 font-semibold text-gray-900">
                Использовать как стандартный для всех объектов
              </label>
            </div>

            {!assignForm.is_default && (
              <select
                value={assignForm.object_id}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, object_id: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 text-lg"
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

            <button type="submit" className="btn-primary w-full">
              Назначить
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
