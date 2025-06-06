import { useEffect, useState, type ChangeEvent } from "react";
import { supabase } from "../supabase-client";
import type { Session } from "@supabase/supabase-js";
import toast from "react-hot-toast";

interface Task {
  id: number;
  title: string;
  description: string;
  created_at: string;
  image_url: string;
}

export default function TaskManagement({ session }: { session: Session }) {
  const [newtasks, setNewTasks] = useState({ title: "", description: "" });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newDescription, setNewDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  const [taskImage, setTaskImage] = useState<File | null>(null);

  const fetchTasks = async () => {
    const { error, data } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("Error fetching tasks");
      return;
    }

    setTasks(data);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const filePath = `${file.name}-${Date.now()}`;
    const { error } = await supabase.storage
      .from("tasks-images")
      .upload(filePath, file);

    if (error) {
      toast.error("Error uploading image");
      return null;
    }

    const { data } = await supabase.storage
      .from("tasks-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl: string | null = null;

      if (taskImage) {
        imageUrl = await uploadImage(taskImage);
        // Do not return early if image fails; just skip it
        if (!imageUrl) {
          toast("Proceeding without image due to upload failure", {
            icon: "⚠️",
          });
        }
      }

      const { error } = await supabase
        .from("tasks")
        .insert({
          ...newtasks,
          email: session.user.email,
          ...(imageUrl && { image_url: imageUrl }), // Include only if imageUrl exists
        })
        .select()
        .single();

      if (error) {
        toast.error("Error adding task");
        return;
      }

      toast.success("Task added successfully");
      setNewTasks({ title: "", description: "" });
      setTaskImage(null);
      (document.querySelector('input[type="file"]') as HTMLInputElement).value =
        "";
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id: number) => {
    setUpdatingTaskId(id);
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ description: newDescription })
        .eq("id", id);

      if (error) {
        toast.error("Error updating task");
        return;
      }

      toast.success("Task updated successfully");
      setNewDescription("");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const deleteTask = async (id: number) => {
    setDeletingTaskId(id);
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);

      if (error) {
        toast.error("Error deleting task");
        return;
      }

      toast.success("Task deleted successfully");
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTaskImage(e.target.files[0]);
    }
  };

  useEffect(() => {
    fetchTasks();
    console.log(tasks);
  }, []);

  useEffect(() => {
    const channel = supabase.channel("tasks-channel");
    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          const newTask = payload.new as Task;
          setTasks((prev) => [...prev, newTask]);
        }
      )
      .subscribe((status) => console.log("Subscription status", status));
  }, []);

  return (
    <div
      style={{
        fontFamily: "Arial",
        padding: 20,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "50vh",
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

            <input type="file" accept="images/*" onChange={handleFileChange} />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "8px 12px",
                width: "100%",
                marginTop: "2rem",
                backgroundColor: "#3B3B3B",
                color: "#fff",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                borderRadius: 4,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Adding..." : "Add Task"}
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
                  <img src={task.image_url} alt="" style={{ height: "4rem" }} />
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: 8 }}>
                  <textarea
                    name=""
                    id=""
                    placeholder="Update description"
                    onChange={(e) => setNewDescription(e.target.value)}
                  ></textarea>
                  <button
                    onClick={() => updateTask(task.id)}
                    disabled={updatingTaskId === task.id}
                    style={{
                      backgroundColor: "#3a3a3a",
                      color: "#f0f0f0",
                      border: "1px solid #555",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      cursor:
                        updatingTaskId === task.id ? "not-allowed" : "pointer",
                      opacity: updatingTaskId === task.id ? 0.6 : 1,
                    }}
                  >
                    {updatingTaskId === task.id ? "Updating..." : "Edit"}
                  </button>

                  <button
                    onClick={() => deleteTask(task.id)}
                    disabled={deletingTaskId === task.id}
                    style={{
                      backgroundColor: "#3a3a3a",
                      color: "#f0f0f0",
                      border: "1px solid #555",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      cursor:
                        deletingTaskId === task.id ? "not-allowed" : "pointer",
                      opacity: deletingTaskId === task.id ? 0.6 : 1,
                    }}
                  >
                    {deletingTaskId === task.id ? "Deleting..." : "Delete"}
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
