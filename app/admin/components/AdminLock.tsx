import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function AdminLock(){
    return (
        <div className="bg-zinc-950 h-screen flex justify-center items-center">
            <Card className="w-100 h-40 text-center">
                <CardHeader><h1 className="font-bold">Admin Panel Access <b className="text-red-500">Denied</b></h1></CardHeader>
                <CardContent><p className="text-zinc-600 font-semibold">You do not have permission to access this page.</p></CardContent>
            </Card>
        </div>
    )
}