use hdk::prelude::*;
use notes_integrity::*;

#[hdk_extern]
pub fn get_list_notes() -> ExternResult<Vec<Link>> {
    let path = Path::from("list_notes");
    get_links(GetLinksInputBuilder::try_new(path.path_entry_hash()?, LinkTypes::ListNotes)?.build())
}
