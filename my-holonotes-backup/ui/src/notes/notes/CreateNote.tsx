import type { ActionHash, AgentPubKey, AppClient, DnaHash, EntryHash, Record } from "@holochain/client";
import { FC, useContext, useEffect, useState } from "react";
import { ClientContext } from "../../ClientContext";
import type { Note } from "./types";

const CreateNote: FC<CreateNoteProps> = ({ onNoteCreated }) => {
  const { client } = useContext(ClientContext);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [createdAt, setCreatedAt] = useState<number>(Date.now() * 1000);
  const [isNoteValid, setIsNoteValid] = useState(false);

  const createNote = async () => {
    const noteEntry: Note = {
      title: title!,
      content: content!,
      created_at: createdAt!,
    };
    try {
      const record = await client?.callZome({
        role_name: "notes",
        zome_name: "notes",
        fn_name: "create_note",
        payload: noteEntry,
      });
      onNoteCreated && onNoteCreated(record.signed_action.hashed.hash);
      setTitle(""); // Reset form
      setContent("");
      setCreatedAt(Date.now() * 1000);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setIsNoteValid(title !== "" && content !== "");
  }, [title, content]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); createNote(); }}>
      <h3>Create Note</h3>
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="createdAt">Created At</label>
        <input
          id="createdAt"
          name="createdAt"
          type="datetime-local"
          value={new Date(createdAt / 1000 - (new Date(createdAt / 1000).getTimezoneOffset() * 60000))
            .toISOString()
            .slice(0, 16)}
          onChange={(e) => setCreatedAt(Math.floor(new Date(e.target.value).getTime() / 1000))}
          required
        />
      </div>

      <button type="submit" disabled={!isNoteValid}>
        Create Note
      </button>
    </form>
  );
};

interface CreateNoteProps {
  onNoteCreated?: (hash?: Uint8Array) => void;
}

export default CreateNote;