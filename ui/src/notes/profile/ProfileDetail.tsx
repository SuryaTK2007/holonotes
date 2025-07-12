import { HolochainError, Record } from "@holochain/client";
import { decode } from "@msgpack/msgpack";
import { FC, useCallback, useContext, useEffect, useState } from "react";

import { ClientContext } from "../../ClientContext";
import type { Profile } from "./types";

const ProfileDetail: FC<ProfileDetailProps> = ({ profileHash, onProfileDeleted }) => {
  const { client } = useContext(ClientContext);
  const [record, setRecord] = useState<Record | undefined>(undefined);
  const [profile, setProfile] = useState<Profile | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<HolochainError | undefined>();

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setRecord(undefined);
    try {
      const result = await client?.callZome({
        role_name: "notes",
        zome_name: "profile",
        fn_name: "get_profile",
        payload: profileHash,
      });
      setRecord(result);
      setLoading(false);
    } catch (e) {
      setError(e as HolochainError);
    } finally {
      setLoading(false);
    }
  }, [client, profileHash]);

  useEffect(() => {
    if (!profileHash) {
      throw new Error(`The profileHash prop is required for this component`);
    }
    fetchProfile();
  }, [fetchProfile, profileHash]);

  useEffect(() => {
    if (!record) return;
    setProfile(decode((record.entry as any).Present.entry) as Profile);
  }, [record]);

  if (loading) {
    return <progress />;
  }

  if (error) {
    return <div className="alert">Error: {error.message}</div>;
  }

  return (
    <div>
      {record
        ? (
          <section>
            <div>
              <span>
                <strong>Nickname:</strong>
              </span>
              <span>{profile?.nickname}</span>
            </div>
            <div>
            </div>
          </section>
        )
        : <div className="alert">The requested profile was not found.</div>}
    </div>
  );
};

interface ProfileDetailProps {
  profileHash: Uint8Array;
  onProfileDeleted?: (profileHash: Uint8Array) => void;
}

export default ProfileDetail;
