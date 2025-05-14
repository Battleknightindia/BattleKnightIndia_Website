import { useState} from "react";

export default function VolunteerBanner(){
    const [ isDismissed, setIsDismissed] = useState(()=>{
        return localStorage.getItem("vd") === "1";
    });

    const handleDismissed = () => {
        localStorage.setitem("vd", "1")
        setIsDismissed(true)
    };

    if(isDismissed) return null;

    return(
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 flex items-center justify-between shadow-md mt-4 mx-2">
            <div className="">
                <h2 className="text-lg font-semibold text-blue-800">Become a Volunteer!</h2>
                <p className="text-blue-700 text-sm">Earn Diamonds</p>
            </div>
            <div className="flex space-x-2">
                <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                onClick={()=>window.location.href="/volunteers"}
                >
                    Join Now
                </button>
                <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm"
                onClick={handleDismissed}
                >
                    Dismiss
                </button>
            </div>
        </div>
    )
}
