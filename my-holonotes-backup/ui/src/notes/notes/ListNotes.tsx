import { HolochainError, Link, SignalCb } from "@holochain/client";
import { FC, useCallback, useContext, useEffect, useState } from "react";
import { ClientContext } from "../../ClientContext";
import NoteDetail from "./NoteDetail";
import type { NotesSignal } from "./types";

const ListNotes: FC = () => {
  const { client } = useContext(ClientContext);
  const [hashes, setHashes] = useState<Uint8Array[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<HolochainError | undefined>();

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const links: Link[] = await client?.callZome({
        role_name: "notes",
        zome_name: "notes",
        fn_name: "get_list_notes",
      });
      setHashes(links?.length ? links.map((l) => l.target) : []);
    } catch (e) {
      setError(e as HolochainError);
    } finally {
      setLoading(false);
    }
  }, [client]);

  const handleSignal: SignalCb = useCallback(
    (signal) => {
      if (signal.type !== "app") return;
      if (signal.value.zome_name !== "notes") return;
      const payload = signal.value.payload as NotesSignal;
      if (payload.type !== "EntryCreated") return;
      if (payload.app_entry.type !== "Note") return;
      setHashes((prevHashes) => {
        // Avoid duplicates by checking if hash already exists
        if (!prevHashes.some((hash) => areEqual(hash, payload.action.hashed.hash))) {
          return [...prevHashes, payload.action.hashed.hash];
        }
        return prevHashes;
      });
    },
    [setHashes]
  );

  useEffect(() => {
  if (!client) return;

  const unsubscribe = client.on("signal", handleSignal);

  return () => {
    // Unsubscribe the signal listener
    unsubscribe();
  };
}, [client, handleSignal]);

  const handleNoteDeleted = useCallback(
    (noteHash: Uint8Array) => {
      setHashes((prevHashes) => prevHashes.filter((hash) => !areEqual(hash, noteHash)));
    },
    []
  );

  if (loading) {
    return <progress />;
  }

  return (
    <div className="note-list">
      <h3>Notes</h3>
      {error ? (
        <div className="alert">Error fetching notes: {error.message}</div>
      ) : hashes.length > 0 ? (
        hashes.map((hash, i) => (
          <NoteDetail key={i} noteHash={hash} onNoteDeleted={() => handleNoteDeleted(hash)} />
        ))
      ) : (
        <div className="alert">No notes found.</div>
      )}
    </div>
  );
};

function areEqual(hash1: Uint8Array, hash2: Uint8Array): boolean {
  if (hash1.length !== hash2.length) return false;
  return hash1.every((byte, i) => byte === hash2[i]);
}

export default ListNotes;