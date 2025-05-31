import { useEffect, useState } from "react";
import Auth from "./components/Auth";
import TaskManagement from "./components/TaskManagement";
import { supabase } from "./supabase-client";

const App = () => {
  const [session, setSession] = useState<any>(null);

  const fetchSession = async () => {
    const currentSession = await supabase.auth.getSession();
    console.log(currentSession, "data");
    setSession(currentSession.data.session);
  };

  useEffect(() => {
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div>
      {session ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            marginTop: "2rem",
          }}
        >
          <button onClick={logout}>Logout</button>
          <TaskManagement session={session} />
        </div>
      ) : (
        <>
          <Auth />
        </>
      )}
    </div>
  );
};

export default App;
