import type { ActionHash, AgentPubKey, AppClient, DnaHash, EntryHash, Record } from "@holochain/client";
import { FC, useContext, useEffect, useState } from "react";

import { ClientContext } from "../../ClientContext";
import type { Profile } from "./types";

const CreateProfile: FC<CreateProfileProps> = ({ onProfileCreated }) => {
  const { client } = useContext(ClientContext);
  const [nickname, setNickname] = useState<string>("");
  const [isProfileValid, setIsProfileValid] = useState(false);

  const createProfile = async () => {
    const profileEntry: Profile = {
      nickname: nickname!,
    };
    try {
      const record = await client?.callZome({
        role_name: "notes",
        zome_name: "profile",
        fn_name: "create_profile",
        payload: profileEntry,
      });
      onProfileCreated && onProfileCreated(record.signed_action.hashed.hash);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setIsProfileValid(true && nickname !== "");
  }, [nickname]);

  return (
    <div>
      <h3>Create Profile</h3>
      <div>
        <label htmlFor="Nickname">Nickname</label>
        <input type="text" name="Nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} />
      </div>

      <button disabled={!isProfileValid} onClick={() => createProfile()}>
        Create Profile
      </button>
    </div>
  );
};

interface CreateProfileProps {
  onProfileCreated?: (hash?: Uint8Array) => void;
}

export default CreateProfile;
