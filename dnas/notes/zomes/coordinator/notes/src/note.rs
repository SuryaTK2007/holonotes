use hdk::prelude::*;
use notes_integrity::*;

#[hdk_extern]
pub fn create_note(note: Note) -> ExternResult<Record> {
    let note_hash = create_entry(&EntryTypes::Note(note.clone()))?; //return ActionHash
    let record = get(note_hash.clone(), GetOptions::default())?.ok_or(wasm_error!( //tries to retrieve record for created note from dht
        WasmErrorInner::Guest("Could not find the newly created Note".to_string())
    ))?;
    let path = Path::from("list_notes"); 
    create_link( //creating link
        path.path_entry_hash()?, //from list_notes path
        note_hash.clone(), // to the newly created note(ActionHash)
        LinkTypes::ListNotes, //link type of ListNotes
        (), //tag
    )?;
    Ok(record)
}

#[hdk_extern]
pub fn get_latest_note(original_note_hash: ActionHash) -> ExternResult<Option<Record>> {
    let links = get_links( // returns a vector of all links
        GetLinksInputBuilder::try_new(original_note_hash.clone(), LinkTypes::NoteUpdates)?.build(),
    )?;
    let latest_link = links
        .into_iter()
        .max_by(|link_a, link_b| link_a.timestamp.cmp(&link_b.timestamp)); // picking the most recent links by timestamp from vector of links returned by get_links
    let latest_note_hash = match latest_link {
        Some(link) => {
            link.target
                .clone()
                .into_action_hash()
                .ok_or(wasm_error!(WasmErrorInner::Guest(
                    "No action hash associated with link".to_string()
                )))?
        }
        None => original_note_hash.clone(),
    };
    get(latest_note_hash, GetOptions::default())
}

#[hdk_extern]
pub fn get_original_note(original_note_hash: ActionHash) -> ExternResult<Option<Record>> {
    let Some(details) = get_details(original_note_hash, GetOptions::default())? else {
        return Ok(None);
    };
    match details {
        Details::Record(details) => Ok(Some(details.record)),
        _ => Err(wasm_error!(WasmErrorInner::Guest(
            "Malformed get details response".to_string()
        ))),
    }
}

#[hdk_extern]
pub fn get_all_revisions_for_note(original_note_hash: ActionHash) -> ExternResult<Vec<Record>> {
    let Some(original_record) = get_original_note(original_note_hash.clone())? else {
        return Ok(vec![]);
    };
    let links = get_links(
        GetLinksInputBuilder::try_new(original_note_hash.clone(), LinkTypes::NoteUpdates)?.build(),
    )?;
    let get_input: Vec<GetInput> = links
        .into_iter()
        .map(|link| {
            Ok(GetInput::new(
                link.target
                    .into_action_hash()
                    .ok_or(wasm_error!(WasmErrorInner::Guest(
                        "No action hash associated with link".to_string()
                    )))?
                    .into(),
                GetOptions::default(),
            ))
        })
        .collect::<ExternResult<Vec<GetInput>>>()?;
    let records = HDK.with(|hdk| hdk.borrow().get(get_input))?;
    let mut records: Vec<Record> = records.into_iter().flatten().collect();
    records.insert(0, original_record);
    Ok(records)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateNoteInput {
    pub original_note_hash: ActionHash,
    pub previous_note_hash: ActionHash,
    pub updated_note: Note,
}

#[hdk_extern]
pub fn update_note(input: UpdateNoteInput) -> ExternResult<Record> {
    let updated_note_hash = update_entry(input.previous_note_hash.clone(), &input.updated_note)?;
    create_link(
        input.original_note_hash.clone(),
        updated_note_hash.clone(),
        LinkTypes::NoteUpdates,
        (),
    )?;
    let record = get(updated_note_hash.clone(), GetOptions::default())?.ok_or(wasm_error!(
        WasmErrorInner::Guest("Could not find the newly updated Note".to_string())
    ))?;
    Ok(record)
}

#[hdk_extern]
pub fn delete_note(original_note_hash: ActionHash) -> ExternResult<ActionHash> {
    let path = Path::from("list_notes");
    let links = get_links(
        GetLinksInputBuilder::try_new(path.path_entry_hash()?, LinkTypes::ListNotes)?.build(),
    )?;
    for link in links {
        if let Some(hash) = link.target.into_action_hash() {
            if hash == original_note_hash {
                delete_link(link.create_link_hash)?;
            }
        }
    }
    delete_entry(original_note_hash)
}

#[hdk_extern]
pub fn get_all_deletes_for_note(
    original_note_hash: ActionHash,
) -> ExternResult<Option<Vec<SignedActionHashed>>> {
    let Some(details) = get_details(original_note_hash, GetOptions::default())? else {
        return Ok(None);
    };
    match details {
        Details::Entry(_) => Err(wasm_error!(WasmErrorInner::Guest(
            "Malformed details".into()
        ))),
        Details::Record(record_details) => Ok(Some(record_details.deletes)),
    }
}

#[hdk_extern]
pub fn get_oldest_delete_for_note(
    original_note_hash: ActionHash,
) -> ExternResult<Option<SignedActionHashed>> {
    let Some(mut deletes) = get_all_deletes_for_note(original_note_hash)? else {
        return Ok(None);
    };
    deletes.sort_by(|delete_a, delete_b| {
        delete_a
            .action()
            .timestamp()
            .cmp(&delete_b.action().timestamp())
    });
    Ok(deletes.first().cloned())
}
