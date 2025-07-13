use hdk::prelude::*;
use profile_integrity::*;

#[hdk_extern]
pub fn create_profile(profile: Profile) -> ExternResult<Record> {
    let profile_hash = create_entry(&EntryTypes::Profile(profile.clone()))?;
    // Link the agent to their profile
    let agent = agent_info()?.agent_latest_pubkey;
    create_link(agent.clone(), profile_hash.clone(), LinkTypes::AgentToProfile)?;

    let record = get(profile_hash, GetOptions::default())?.ok_or(wasm_error!(
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

#[hdk_extern]
pub fn update_profile(payload: (ActionHash, Profile)) -> ExternResult<Record> {
    let (original_action_hash, updated_profile) = payload;
    let updated_action_hash = update_entry(original_action_hash, &EntryTypes::Profile(updated_profile.clone()))?;
    let record = get(updated_action_hash, GetOptions::default())?
        .ok_or(wasm_error!(WasmErrorInner::Guest("Failed to fetch updated profile record".into())))?;
    Ok(record)
}

#[hdk_extern]
pub fn get_my_profile() -> ExternResult<Option<Record>> {
    let agent = agent_info()?.agent_latest_pubkey;

    let links = get_links(agent, LinkTypes::AgentToProfile, None)?;
    let Some(link) = links.first() else {
        return Ok(None);
    };

    let profile_hash = ActionHash::from(link.target.clone());
    let record = get(profile_hash, GetOptions::default())?;
    Ok(record)
}
