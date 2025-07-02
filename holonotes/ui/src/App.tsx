import { useContext } from "react";
import { ClientContext } from "./ClientContext";

import CreateNote from "/home/surya/Desktop/Holonotes/holonotes/ui/src/notes/notes/CreateNote.tsx";
import ListNotes from "/home/surya/Desktop/Holonotes/holonotes/ui/src/notes/notes/ListNotes.tsx";
import "./app.css";

const App = () => {
  const { error, loading } = useContext(ClientContext);

  if (loading) return <div>🔄 Connecting to Holochain...</div>;
  if (error) return <div>❌ Error: {error.message}</div>;

  return (
    <div className="app-container">
      <h1>📝 HoloNotes</h1>
      <CreateNote />
      <ListNotes />
    </div>
  );
};

export default App;
