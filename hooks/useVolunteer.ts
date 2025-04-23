"use client";

import { useState, useEffect } from "react";
import { fetchvolunteerData } from "@/lib/volunteersData"
import type {VolunteerFormState } from "@/schema/volunteerSchema";

export function useVolunteer(){
    const [volunteer, setVolunteer] = useState<VolunteerFormState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);

    useEffect(()=>{
        async function loadProfile(){
            try{
                const data = await fetchvolunteerData();
                setVolunteer(data);
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
    return { volunteer, loading, error}
}