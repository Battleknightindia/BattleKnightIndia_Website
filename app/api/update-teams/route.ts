import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { TeamListType } from "@/lib/data/statsData";

// app/api/update-teams/route.ts
export async function POST(req: Request) {
  try {
    const teams: TeamListType[] = await req.json();
    const supabase = await createClient();

    const results = await Promise.all(
      teams.map(async (team) => {
        console.log(`Updating team ID=${team.id} to status=${team.team_status}`);

        const { data, error, status, statusText } = await supabase
          .from("teams")
          .update({ team_status: team.team_status })
          .eq("id", team.id);
          console.log("TeamID:"+team.id+":",data, error, status, statusText);

        if (error) {
          console.error("Update failed for:", team.id, error.message);
        }

        return { id: team.id, data, error };
      })
    );

    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

