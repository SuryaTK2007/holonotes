use hdi::prelude::*;

#[derive(Clone, PartialEq)]
#[hdk_entry_helper]
pub struct Profile {
    pub nickname: String,
}

pub fn validate_create_profile(
    _action: EntryCreationAction,
    _profile: Profile,
) -> ExternResult<ValidateCallbackResult> {
    // TODO: add the appropriate validation rules
    Ok(ValidateCallbackResult::Valid)
}

pub fn validate_update_profile(
    _action: Update,
    profile: Profile,
    _original_action: EntryCreationAction,
    original_profile: Profile,
) -> ExternResult<ValidateCallbackResult> {
    if profile == original_profile {
        return Ok(ValidateCallbackResult::Invalid("No changes made to profile".into()));
    }
    if profile.nickname.trim().is_empty() {
        return Ok(ValidateCallbackResult::Invalid("Nickname cannot be empty".into()));
    }
    Ok(ValidateCallbackResult::Valid)
}

pub fn validate_delete_profile(
    _action: Delete,
    _original_action: EntryCreationAction,
    _original_profile: Profile,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Invalid(
        "Profiles cannot be deleted".to_string(),
    ))
}
