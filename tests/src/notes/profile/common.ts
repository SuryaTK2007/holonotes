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

export async function sampleProfile(cell: CallableCell, partialProfile = {}) {
  return {
    ...{
      nickname: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    ...partialProfile,
  };
}

export async function createProfile(cell: CallableCell, profile = undefined): Promise<Record> {
  return cell.callZome({
    zome_name: "profile",
    fn_name: "create_profile",
    payload: profile || await sampleProfile(cell),
  });
}
