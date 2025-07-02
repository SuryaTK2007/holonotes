import { HolochainError, Record } from "@holochain/client";
import { decode } from "@msgpack/msgpack";
import { FC, useCallback, useContext, useEffect, useState } from "react";
import { ClientContext } from "../../ClientContext";
import EditNote from "./EditNote";
import type { Note } from "./types";

const NoteDetail: FC<NoteDetailProps> = ({ noteHash, onNoteDeleted }) => {
  const { client } = useContext(ClientContext);
  const [record, setRecord] = useState<Record | undefined>(undefined);
  const [note, setNote] = useState<Note | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<HolochainError | undefined>();

  const fetchNote = useCallback(async () => {
    setLoading(true);
    setRecord(undefined);
    try {
      const result = await client?.callZome({
        role_name: "notes",
        zome_name: "notes",
        fn_name: "get_latest_note",
        payload: noteHash,
      });
      setRecord(result);
    } catch (e) {
      setError(e as HolochainError);
    } finally {
      setLoading(false);
    }
  }, [client, noteHash]);

  const deleteNote = useCallback(async () => {
    setLoading(true);
    try {
      const result = await client?.callZome({
        role_name: "notes",
        zome_name: "notes",
        fn_name: "delete_note",
        payload: noteHash,
      });
      if (result) {
        onNoteDeleted && onNoteDeleted();
      }
    } catch (e) {
      setError(e as HolochainError);
    } finally {
      setLoading(false);
    }
  }, [client, noteHash, onNoteDeleted]);

  useEffect(() => {
    if (!noteHash) {
      throw new Error("The noteHash prop is required for this component");
    }
    fetchNote();
  }, [fetchNote, noteHash]);

  useEffect(() => {
    if (!record) return;
    setNote(decode((record.entry as any).Present.entry) as Note);
  }, [record]);

  if (loading) {
    return <progress />;
  }

  if (error) {
    return <div className="alert">Error: {error.message}</div>;
  }

  return (
    <div className="note-card">
      {editing ? (
        <EditNote
          originalNoteHash={noteHash}
          currentRecord={record}
          currentNote={note}
          onNoteUpdated={async () => {
            setEditing(false);
            await fetchNote();
          }}
          onEditCanceled={() => setEditing(false)}
        />
      ) : record ? (
        <>
          <h4>{note?.title}</h4>
          <p>{note?.content}</p>
          <div className="note-date">
            {note?.created_at ? new Date(note.created_at / 1000).toLocaleString() : ""}
          </div>
          <div className="note-actions">
            <button onClick={() => setEditing(true)}>Edit</button>
            <button className="delete" onClick={deleteNote}>
              Delete
            </button>
          </div>
        </>
      ) : (
        <div className="alert">The requested note was not found.</div>
      )}
    </div>
  );
};

interface NoteDetailProps {
  noteHash: Uint8Array;
  onNoteDeleted?: () => void;
}

export default NoteDetail;