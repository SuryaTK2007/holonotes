import { HolochainError, Record } from "@holochain/client";
import { FC, useCallback, useContext, useEffect, useState } from "react";
import { ClientContext } from "../../ClientContext";
import type { Note } from "./types";

const EditNote: FC<EditNoteProps> = ({
  originalNoteHash,
  currentRecord,
  currentNote,
  onNoteUpdated,
  onNoteUpdateError,
  onEditCanceled,
}) => {
  const { client } = useContext(ClientContext);
  const [title, setTitle] = useState<string | undefined>(currentNote?.title);
  const [content, setContent] = useState<string | undefined>(currentNote?.content);
  const [createdAt, setCreatedAt] = useState<number | undefined>(currentNote?.created_at);
  const [isNoteValid, setIsNoteValid] = useState(false);

  const updateNote = useCallback(async () => {
    const note: Partial<Note> = {
      title,
      content,
      created_at: createdAt,
    };
    try {
      const updateRecord = await client?.callZome({
        role_name: "notes",
        zome_name: "notes",
        fn_name: "update_note",
        payload: {
          original_note_hash: originalNoteHash,
          previous_note_hash: currentRecord?.signed_action.hashed.hash,
          updated_note: note,
        },
      });
      onNoteUpdated(updateRecord.signed_action.hashed.hash);
    } catch (e) {
      onNoteUpdateError && onNoteUpdateError(e as HolochainError);
    }
  }, [client, currentRecord, onNoteUpdated, onNoteUpdateError, originalNoteHash, title, content, createdAt]);

  useEffect(() => {
    if (!currentRecord) {
      throw new Error("The currentRecord prop is required");
    }
    if (!originalNoteHash) {
      throw new Error("The originalNoteHash prop is required");
    }
  }, [currentRecord, originalNoteHash]);

  useEffect(() => {
    setIsNoteValid(!!title && !!content);
  }, [title, content]);

  return (
    <form className="note-card" onSubmit={(e) => { e.preventDefault(); updateNote(); }}>
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={title || ""}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          value={content || ""}
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
          value={
            createdAt
              ? new Date(createdAt / 1000 - (new Date(createdAt / 1000).getTimezoneOffset() * 60000))
                  .toISOString()
                  .slice(0, 16)
              : ""
          }
          onChange={(e) => setCreatedAt(Math.floor(new Date(e.target.value).getTime() / 1000))}
          required
        />
      </div>
      <div className="note-actions">
        <button type="button" className="cancel" onClick={onEditCanceled}>
          Cancel
        </button>
        <button type="submit" disabled={!isNoteValid}>
          Update Note
        </button>
      </div>
    </form>
  );
};

interface EditNoteProps {
  originalNoteHash: Uint8Array;
  currentRecord: Record | undefined;
  currentNote: Note | undefined;
  onNoteUpdated: (hash?: Uint8Array) => void;
  onEditCanceled: () => void;
  onNoteUpdateError?: (error: HolochainError) => void;
}

export default EditNote;