import {
  ActionHash,
  AppBundleSource,
  fakeActionHash,
  fakeAgentPubKey,
  fakeDnaHash,
  fakeEntryHash,
  hashFrom32AndType,
  NewEntryAction,
  Record,
} from "@holochain/client";
import { CallableCell } from "@holochain/tryorama";

export async function sampleNote(cell: CallableCell, partialNote = {}) {
  return {
    ...{
      title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      created_at: 1674053334548000,
    },
    ...partialNote,
  };
}

export async function createNote(cell: CallableCell, note = undefined): Promise<Record> {
  return cell.callZome({
    zome_name: "notes",
    fn_name: "create_note",
    payload: note || await sampleNote(cell),
  });
}
