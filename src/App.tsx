import { useEffect, useState } from "react";
import { supabase } from "./supabase-client";

interface Task {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

export default function CrudApp() {
  const [newtasks, setNewTasks] = useState({ title: "", description: "" });
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    const { error, data } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("error reading task", error.message);
      return;
    }

    setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  console.log(tasks);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const { error } = await supabase.from("tasks").insert(newtasks).single();

    if (error) {
      console.error("error adding task", error.message);
      return;
    }
    setNewTasks({ title: "", description: "" });
  };

  return (
    <div
      style={{
        fontFamily: "Arial",
        padding: 20,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <h2>Task Manager</h2>
        <p style={{ marginBottom: 20, color: "#555" }}></p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 10 }}>
            <input
              type="text"
              name="title"
              onChange={(e) =>
                setNewTasks((prev) => ({ ...prev, title: e.target.value }))
              }
              style={{
                padding: 8,
                width: "100%",
                marginBottom: 10,
                boxSizing: "border-box",
              }}
              placeholder="Enter task title"
              required
            />
            <textarea
              rows={3}
              name="description"
              onChange={(e) =>
                setNewTasks((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              style={{
                padding: 8,
                width: "100%",
                marginBottom: 10,
                boxSizing: "border-box",
              }}
              placeholder="Enter task description"
            ></textarea>
            <button
              type="submit"
              style={{
                padding: "8px 12px",
                width: "100%",
                backgroundColor: "#3B3B3B",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                borderRadius: 4,
              }}
            >
              Add Task
            </button>
          </div>
        </form>

        <ul style={{ listStyle: "none", padding: 0, marginTop: 20 }}>
          {tasks.map((task, key) => (
            <li
              key={key}
              style={{
                backgroundColor: "#2e2e2e",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "12px",
                border: "1px solid #3a3a3a",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  flexDirection: "column",
                }}
              >
                <div style={{ flex: 1, paddingRight: 16 }}>
                  <h3
                    style={{
                      margin: "0 0 6px 0",
                      fontSize: "18px",
                      color: "#ffffff",
                    }}
                  >
                    {task.title}
                  </h3>
                  <p style={{ margin: 0, color: "#ccc", fontSize: "14px" }}>
                    {task.description}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: 8 }}>
                  <button
                    style={{
                      backgroundColor: "#3a3a3a",
                      color: "#f0f0f0",
                      border: "1px solid #555",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    style={{
                      backgroundColor: "#3a3a3a",
                      color: "#f0f0f0",
                      border: "1px solid #555",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
