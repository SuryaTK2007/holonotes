import { assert, test } from "vitest";

import {
  ActionHash,
  AppBundleSource,
  fakeActionHash,
  fakeAgentPubKey,
  fakeEntryHash,
  Link,
  NewEntryAction,
  Record,
} from "@holochain/client";
import { CallableCell, dhtSync, runScenario } from "@holochain/tryorama";
import { decode } from "@msgpack/msgpack";

import { createNote } from "./common.js";

test("create a Note and get list notes", async () => {
  await runScenario(async scenario => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + "/../workdir/holonotes.happ";

    // Set up the app to be installed
    const appBundleSource: AppBundleSource = { type: "path", value: testAppPath };
    const appSource = { appBundleSource };

    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice, bob] = await scenario.addPlayersWithApps([appSource, appSource]);

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();

    // Bob gets list notes
    let collectionOutput: Link[] = await bob.cells[0].callZome({
      zome_name: "notes",
      fn_name: "get_list_notes",
    });
    assert.equal(collectionOutput.length, 0);

    // Alice creates a Note
    const createRecord: Record = await createNote(alice.cells[0]);
    assert.ok(createRecord);

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Bob gets list notes again
    collectionOutput = await bob.cells[0].callZome({
      zome_name: "notes",
      fn_name: "get_list_notes",
      payload: null,
    });
    assert.equal(collectionOutput.length, 1);
    assert.deepEqual(createRecord.signed_action.hashed.hash, collectionOutput[0].target);

    // Alice deletes the Note
    await alice.cells[0].callZome({
      zome_name: "notes",
      fn_name: "delete_note",
      payload: createRecord.signed_action.hashed.hash,
    });

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Bob gets list notes again
    collectionOutput = await bob.cells[0].callZome({
      zome_name: "notes",
      fn_name: "get_list_notes",
      payload: null,
    });
    assert.equal(collectionOutput.length, 0);
  });
});
