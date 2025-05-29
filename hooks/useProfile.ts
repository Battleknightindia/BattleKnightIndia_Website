"use client";

import { useState, useEffect } from "react";
import { fetchProfile } from "@/lib/client/profileData"
import type {ViewProfileFormType } from "@/schema/profileSchema";


export function useProfile(){
    const [profile, setProfile] = useState<ViewProfileFormType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);

    useEffect(()=>{
        async function loadProfile(){
            try{
                const data = await fetchProfile();
                setProfile(data);
            }
            catch(err){
                const typedError = err as Error;
                setError(typedError.message)
            }
            finally{
                setLoading(false)
            }
        }
        loadProfile();
    },[])
    return { profile, loading, error}
}