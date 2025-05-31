import { useEffect, useState, type ChangeEvent } from "react";
import { supabase } from "../supabase-client";
import type { Session } from "@supabase/supabase-js";

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

  const [taskImage, setTaskImage] = useState<File | null>(null);

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
    console.log("fetched data", data);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const filePath = `${file.name}-${Date.now()}`;
    const { error } = await supabase.storage
      .from("tasks-images")
      .upload(filePath, file);

    if (error) {
      console.log("Error Uploading Image", error.message);
    }

    const { data } = await supabase.storage
      .from("tasks-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    let imageUrl: string | null = null;
    if (taskImage) {
      imageUrl = await uploadImage(taskImage);
    }

    // const { error, data } = await supabase
    const { error } = await supabase
      .from("tasks")
      .insert({ ...newtasks, email: session.user.email, image_url: imageUrl })
      .select()
      .single();

    if (error) {
      console.error("error adding task", error.message);
      return;
    }

    // setTasks((prev) => [...prev, data]);

    setNewTasks({ title: "", description: "" });
  };

  const updateTask = async (id: number) => {
    const { error } = await supabase
      .from("tasks")
      .update({ description: newDescription })
      .eq("id", id);

    if (error) {
      console.error("error Updating task", error.message);
      return;
    }
  };

  const deleteTask = async (id: number) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      console.error("error deleting task", error.message);
      return;
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
                    onClick={() => deleteTask(task.id)}
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
