use hdk::prelude::*;
use profile_integrity::*;

#[hdk_extern]
pub fn create_profile(profile: Profile) -> ExternResult<Record> {
    let profile_hash = create_entry(&EntryTypes::Profile(profile.clone()))?;
    let record = get(profile_hash.clone(), GetOptions::default())?.ok_or(wasm_error!(
        WasmErrorInner::Guest("Could not find the newly created Profile".to_string())
    ))?;
    Ok(record)
}

#[hdk_extern]
pub fn get_profile(profile_hash: ActionHash) -> ExternResult<Option<Record>> {
    let Some(details) = get_details(profile_hash, GetOptions::default())? else {
        return Ok(None);
    };
    match details {
        Details::Record(details) => Ok(Some(details.record)),
        _ => Err(wasm_error!(WasmErrorInner::Guest(
            "Malformed get details response".to_string()
        ))),
    }
}
